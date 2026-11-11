'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const fixtures = require('./v1-save-fixtures.json');
const copy = value => JSON.parse(JSON.stringify(value));
const counters = { fullRuns: 0, checks: 0 };
function check(condition, message) { counters.checks++; assert.ok(condition, message); }
function enrolled(seed = 1, activity = 'none') {
  const s = E.create('테스트 학생', seed);
  E.setClubs(s, 'physics', activity);
  return s;
}
function resolve(s, chooser = () => 0) {
  let safety = 0;
  while (s.pendingEvent) {
    assert.ok(++safety < 12, 'An event chain must terminate');
    const choice = chooser(s.pendingEvent, s);
    E.chooseEvent(s, choice);
  }
}
function beforeAdvance(s, chooser) {
  resolve(s, chooser);
  if (E.getPhase(s).needsElectives) E.chooseElectives(s, ['advanced_physics', 'advanced_math']);
}
function toTurn(s, turn, strategy = () => ['rest', 'study', 'research', 'academic'][s.turn % 4]) {
  while (s.turn < turn) { beforeAdvance(s); E.advance(s, strategy(s), 'normal'); }
  return s;
}
function normalStats(s) {
  for (const [key, value] of Object.entries(s.stats)) {
    check(Number.isFinite(value) && value >= 0 && value <= 100, `Bounded finite stat ${key}`);
  }
  assert.ok(Math.abs(s.stats.health + s.stats.fatigue - 100) < .11, 'Legacy health and fatigue remain complementary');
}

// Random archetypes produce distinct starting distributions, with all new traits visible in state.
assert.equal(E.archetypes.length, 6);
const counts = new Map();
for (let seed = 0; seed < 500; seed++) {
  const s = E.create('성향 테스트', seed);
  const type = typeof s.archetype === 'string' ? s.archetype : s.archetype?.id;
  check(E.archetypes.some(t => t.id === type), 'A declared archetype is selected');
  counts.set(type, (counts.get(type) || 0) + 1);
  for (const stat of ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership']) {
    check(Number.isFinite(s.stats[stat]), `Initial ${stat} exists`);
  }
  normalStats(s);
  assert.deepEqual(E.create('성향 테스트', seed), s, 'Initial random type and stats are seeded');
}
assert.equal(counts.size, 6, 'All six types can be rolled');

// First-week team admission is a trial, not an automatic club assignment.
const first = enrolled(10);
assert.equal(first.turn, 0);
assert.equal(first.pendingEvent.id, 'sports_tryout');
assert.equal(first.sportsClubs.length, 0);
assert.equal(first.pendingEvent.choices.length, 2);
check(first.pendingEvent.choices.some(c => c.label.includes('농구')), 'Basketball trial offered');
check(first.pendingEvent.choices.some(c => c.label.includes('축구')), 'Soccer trial offered');
assert.throws(() => E.advance(first, 'study'), 'Cannot skip trial decision');
assert.throws(() => E.setClubs(first, 'physics', 'basketball'), 'Sports cannot be joined via setup menu');
const low = copy(first), high = copy(first);
low.stats.athletics = 20; high.stats.athletics = 90;
for (const team of ['basketball', 'soccer']) {
  check(E.getSportsChance(high, team) > E.getSportsChance(low, team), 'Athletic skill improves trials');
  const luckLow = copy(first), luckHigh = copy(first);
  luckLow.stats.luck = 10; luckHigh.stats.luck = 90;
  check(E.getSportsChance(luckHigh, team) > E.getSportsChance(luckLow, team), 'Luck affects trials');
}
E.chooseEvent(first, 0);
assert.equal(first.sportsTryouts.length, 1);
assert.ok(first.sportsClubs.length <= 1);
assert.equal(first.pendingEvent, null);
assert.throws(() => E.chooseEvent(first, 1), 'A completed trial cannot be retried');

// Exactly one additional team opportunity opens after a full year.
let dual;
for (let seed = 0; seed < 100; seed++) {
  const s = enrolled(seed);
  s.stats.athletics = 100; s.stats.luck = 100;
  E.chooseEvent(s, 0);
  if (!s.sportsClubs.includes('basketball')) continue;
  toTurn(s, 16);
  assert.equal(E.getPhase(s).year, 2);
  assert.equal(E.getPhase(s).semester, 1);
  assert.equal(s.pendingEvent.id, 'sports_tryout');
  check(!s.pendingEvent.choices.some(c => c.label.includes('농구')), 'Already joined team excluded');
  const soccer = s.pendingEvent.choices.findIndex(c => c.label.includes('축구'));
  assert.ok(soccer >= 0);
  E.chooseEvent(s, soccer);
  if (s.sportsClubs.length === 2) { dual = s; break; }
}
assert.ok(dual, 'Both sports can be joined after the second trial');
assert.equal(new Set(dual.sportsClubs).size, 2);
assert.equal(dual.sportsTryouts.length, 2);
const skip = enrolled(5); E.chooseEvent(skip, 0); toTurn(skip, 16);
const membership = copy(skip.sportsClubs);
E.chooseEvent(skip, skip.pendingEvent.choices.length - 1);
assert.deepEqual(skip.sportsClubs, membership, 'Skipping additional trial preserves teams');

// Athletic clubs increase both student-council and club-captain chances.
const ordinary = copy(first); ordinary.sportsClubs = [];
const athlete = copy(ordinary); athlete.sportsClubs = ['basketball'];
const doubleAthlete = copy(ordinary); doubleAthlete.sportsClubs = ['basketball', 'soccer'];
check(E.getLeadershipBonus(athlete) > E.getLeadershipBonus(ordinary), 'One sports club improves leadership selection');
check(E.getLeadershipBonus(doubleAthlete) >= E.getLeadershipBonus(athlete), 'Second team does not remove benefit');
check(E.getCaptainChance(athlete) > E.getCaptainChance(ordinary), 'Sports member has a captain bonus');

// Department options and eligible titles match the school-year rules, before two interview questions.
const departmentNames = ['문예부', '체육부', '통계부', '환경부', '홍보부', '총무부', '정책부', '생체부', '정보부'];
assert.deepEqual(E.departments.map(d => typeof d === 'string' ? d : d.name).sort(), [...departmentNames].sort());
for (const [turn,year,head,deptTitle] of [[8,1,'부회장','차장'], [24,2,'회장','부장']]) {
  const s = enrolled(81 + year); toTurn(s, turn);
  assert.equal(E.getPhase(s).semester, 2);
  assert.equal(s.pendingEvent.id, 'council_apply');
  assert.equal(s.pendingEvent.choices.length, 11, 'One executive role, nine departments, skip');
  check(s.pendingEvent.choices.some(c => c.label.includes(head)), `${year}학년 executive role`);
  for (const dept of departmentNames) check(s.pendingEvent.choices.some(c => c.label.includes(dept) && c.label.includes(deptTitle)), `${dept} ${deptTitle} offered`);
  if (year === 1) check(s.pendingEvent.choices.every(c => !/(^|\s)회장/.test(c.label) && !c.label.includes('부장')), 'First years cannot apply for president/head');
  else check(s.pendingEvent.choices.every(c => !c.label.includes('부회장') && !c.label.includes('차장')), 'Second years receive senior titles');
  const prior = s.councilHistory.length;
  E.chooseEvent(s, 0);
  assert.equal(s.pendingEvent.id, 'council_interview');
  assert.equal(s.councilHistory.length, prior, 'Application alone does not select officer');
  const snapshot = copy(s);
  E.chooseEvent(s, 0); E.chooseEvent(snapshot, 0);
  assert.equal(s.pendingEvent.id, 'council_interview');
  assert.equal(s.councilHistory.length, prior, 'First interview answer is not full interview');
  E.chooseEvent(s, 0); E.chooseEvent(snapshot, 0);
  assert.equal(s.pendingEvent, null);
  assert.equal(s.councilHistory.length, prior + 1);
  assert.deepEqual(s, snapshot, 'Saving during an interview cannot change its outcome');
  const outcome = s.councilHistory.at(-1);
  assert.equal(outcome.year, year);
  assert.equal(outcome.answers.length, 2);
  assert.ok(outcome.chance >= 0 && outcome.chance <= 1);
}

// Interview answers, department fit, and actual sports membership affect the selection formula.
const interviewBase = enrolled(222); toTurn(interviewBase, 8);
const nonMember = copy(interviewBase); nonMember.sportsClubs = [];
const member = copy(nonMember); member.sportsClubs = ['basketball'];
check(E.getCouncilChance(member, 'vicePresident', 8) > E.getCouncilChance(nonMember, 'vicePresident', 8), 'Sports bonus affects actual council formula');
check(E.getCouncilChance(nonMember, 'vicePresident', 16) > E.getCouncilChance(nonMember, 'vicePresident', -4), 'Interview answer quality changes probability');
const logical = copy(nonMember), artistic = copy(nonMember);
logical.stats.intelligence = 90; logical.stats.creativity = 10;
artistic.stats.intelligence = 10; artistic.stats.creativity = 90;
check(E.getCouncilChance(logical, 'statistics') > E.getCouncilChance(artistic, 'statistics'), 'Statistics department evaluates intelligence');
check(E.getCouncilChance(artistic, 'culture') > E.getCouncilChance(logical, 'culture'), 'Culture department evaluates creativity');
for (let position = 1; position <= 9; position++) {
  const s = copy(interviewBase); E.chooseEvent(s, position);
  assert.equal(s.pendingEvent.id, 'council_interview');
  const firstQuestion = s.pendingEvent.description;
  assert.ok(firstQuestion.length > 20, 'Each department has a substantive interview case');
  E.chooseEvent(s, 0); E.chooseEvent(s, 0);
  assert.ok(s.councilHistory.at(-1).role.includes('차장'));
}
const goodAnswer = copy(interviewBase), poorAnswer = copy(interviewBase);
E.chooseEvent(goodAnswer, 0); E.chooseEvent(poorAnswer, 0);
E.chooseEvent(goodAnswer, 0); E.chooseEvent(poorAnswer, 2);
E.chooseEvent(goodAnswer, 0); E.chooseEvent(poorAnswer, 2);
check(goodAnswer.councilHistory.at(-1).chance > poorAnswer.councilHistory.at(-1).chance, 'Actual interview chain scores selected answers');

// Preparation windows are relative to each exam, including their exam week.
for (let turn = 0; turn < 48; turn++) {
  const s = E.create('일정', 1); s.turn = turn;
  const p = E.getPhase(s), week = turn % 8 + 1;
  const night = [2,3,4,6,7,8].includes(week), dawn = [3,4,7,8].includes(week);
  assert.equal(p.nightAvailable, night, `Night study at week ${week}`);
  assert.equal(p.dawnAvailable, dawn, `Dawn study at week ${week}`);
  assert.equal(p.availableStudyModes.includes('night'), night);
  assert.equal(p.availableStudyModes.includes('dawn'), dawn);
  assert.equal(p.availableStudyModes.includes('both'), dawn && night);
}
const earlyMode = enrolled(91); resolve(earlyMode);
assert.throws(() => E.advance(earlyMode, 'study', 'night'));
assert.equal(earlyMode.turn, 0, 'Invalid study mode cannot consume a turn');
E.advance(earlyMode, 'study', 'normal');
assert.throws(() => E.advance(earlyMode, 'study', 'dawn'));
const basic = copy(earlyMode), extended = copy(earlyMode);
E.advance(basic, 'study', 'normal'); E.advance(extended, 'study', 'night');
check(extended.stats.fatigue > basic.stats.fatigue, 'Night preparation adds fatigue');
check(Object.values(extended.semesterLearning).reduce((a,b)=>a+b,0) > Object.values(basic.semesterLearning).reduce((a,b)=>a+b,0), 'Preparation before exam actually increases learning');

// Fatigue increases sickness risk, and resting treats accumulated fatigue.
const well = copy(first), tired = copy(first);
well.stats.fatigue = 10; well.stats.health = 90;
tired.stats.fatigue = 95; tired.stats.health = 5;
check(E.getIllnessRisk(tired) > E.getIllnessRisk(well), 'Fatigue increases illness risk');
let previous = -1;
for(let fatigue = 0; fatigue <= 100; fatigue += 5) {
  const s = copy(first); s.stats.fatigue = fatigue; s.stats.health = 100-fatigue;
  const risk = E.getIllnessRisk(s);
  check(risk >= previous && risk >= 0 && risk <= 1, 'Risk is monotonic and bounded'); previous = risk;
}
const recovery = copy(tired); recovery.illnessWeeks = 2;
E.advance(recovery, 'rest', 'normal');
check(recovery.stats.fatigue < tired.stats.fatigue, 'Rest lowers fatigue');
check(recovery.illnessWeeks < 2, 'Rest advances recovery');
let gotSick = false;
for(let seed=0; seed<100 && !gotSick; seed++) {
  const s = enrolled(seed); resolve(s); s.stats.fatigue = 98; s.stats.health = 2;
  E.advance(s, 'study');
  gotSick = s.illnessWeeks > 0 || s.log.some(l => /몸살|아프|발병|건강|회복|아팠/.test(l.message));
}
check(gotSick, 'High fatigue can produce an actual illness event');

// New traits change activities, and illness has an observable cost during play.
const healthyStudy = copy(first), sickStudy = copy(first);
healthyStudy.illnessWeeks = 0; sickStudy.illnessWeeks = 1;
E.advance(healthyStudy, 'study'); E.advance(sickStudy, 'study');
check(sickStudy.semesterLearning.math < healthyStudy.semesterLearning.math, 'Sickness reduces actual learning gain');
const creative = copy(first), literal = copy(first);
creative.stats.creativity = 95; literal.stats.creativity = 5;
E.advance(creative, 'research'); E.advance(literal, 'research');
check(creative.stats.research > literal.stats.research, 'Creativity affects research improvement');
const resilient = copy(tired), fragile = copy(tired);
resilient.stats.resilience = 95; fragile.stats.resilience = 5;
check(E.getIllnessRisk(resilient) < E.getIllnessRisk(fragile), 'Resilience reduces illness risk');
E.advance(resilient, 'rest'); E.advance(fragile, 'rest');
check(resilient.stats.fatigue < fragile.stats.fatigue, 'Resilience affects rest recovery');
const unjoined = copy(first); unjoined.sportsClubs = [];
assert.throws(() => E.advance(unjoined, 'sports'), 'Team training is unavailable before admission');

// Existing saves retain identity, progress, grades, RNG, and previously joined sports.
for (const [label, original] of Object.entries(fixtures)) {
  const old = copy(original), migrated = E.migrate(old);
  assert.equal(migrated.version, 2, `Migrated ${label}`);
  assert.equal(migrated.name, original.name);
  assert.equal(migrated.turn, original.turn);
  assert.equal(migrated.rng, original.rng, 'Migration cannot reroll randomness');
  assert.deepEqual(migrated.grades, original.grades, 'Old transcript stays intact');
  assert.deepEqual(migrated.electives, original.electives);
  check(migrated.sportsClubs.includes('basketball'), 'Previously joined basketball remains');
  normalStats(migrated);
  assert.deepEqual(E.migrate(copy(migrated)), migrated, 'Migration is idempotent');
  if (migrated.turn < 48) { beforeAdvance(migrated); E.advance(migrated, 'rest'); assert.equal(migrated.turn, original.turn + 1); }
  else assert.ok(E.applyUniversities(migrated, ['gist']).length > 0);
}

// Annual second-semester renewals end earlier terms without erasing experience.
const termChange = enrolled(313); toTurn(termChange, 23); beforeAdvance(termChange);
termChange.councilRole = '체육부 차장';
termChange.councilHistory = [{year:1, role:'체육부 차장', department:'sports', passed:true, chance:.7, answers:['응답1','응답2']}];
E.advance(termChange, 'rest');
assert.equal(termChange.turn, 24);
assert.equal(termChange.councilRole, '일반 학생', 'First-year officer term ends when second-year recruitment begins');
assert.ok(termChange.councilHistory.some(h=>h.passed && h.role==='체육부 차장'));
E.chooseEvent(termChange, termChange.pendingEvent.choices.length-1);
assert.equal(termChange.councilRole, '일반 학생', 'Skipping a new election does not retain old rank');
toTurn(termChange, 39); beforeAdvance(termChange);
termChange.councilRole = '학생회 회장';
termChange.councilHistory.push({year:2,role:'학생회 회장',department:null,passed:true,chance:.7,answers:['응답1','응답2']});
E.advance(termChange,'rest');
assert.equal(termChange.turn,40);
assert.equal(termChange.councilRole,'일반 학생','Second-year officer term ends at third-year second semester');
assert.equal(termChange.pendingEvent,null,'Third-year students are not offered ineligible council positions');
toTurn(termChange,48);
const formerOfficer = copy(termChange), neverOfficer = copy(termChange);
neverOfficer.councilHistory = [];
const formerResults = E.applyUniversities(formerOfficer,['gist']), neverResults = E.applyUniversities(neverOfficer,['gist']);
check(formerResults[0].score > neverResults[0].score, 'Historical officer service retains the admission bonus after term expiry');
const legacyOfficer = copy(fixtures.graduate); legacyOfficer.councilRole = '학생회 임원';
const migratedOfficer = E.migrate(legacyOfficer);
assert.equal(migratedOfficer.councilRole,'일반 학생');
check(migratedOfficer.councilHistory.some(h=>h.passed&&h.role==='학생회 임원'), 'Graduated v1 officer experience is archived');

// Complete games exercise all event chains and remain reproducible after JSON saves.
function fullRun(seed) {
  const s = enrolled(seed, ['none','music','media'][seed % 3]);
  while(s.turn < 48) {
    beforeAdvance(s);
    const p = E.getPhase(s);
    const action = s.stats.fatigue > 55 || s.illnessWeeks ? 'rest' : E.actions[(seed+s.turn)%E.actions.length].id;
    const permittedAction = action === 'sports' && !s.sportsClubs.length ? 'train' : action;
    const mode = s.stats.fatigue < 35 && p.nightAvailable ? (p.dawnAvailable && seed%2 ? 'both' : 'night') : 'normal';
    const saved = copy(s);
    E.advance(s, permittedAction, mode); E.advance(saved, permittedAction, mode);
    assert.deepEqual(s, saved, 'JSON restore preserves subsequent progression');
    normalStats(s);
    assert.ok(s.sportsClubs.length <= 2);
    assert.equal(new Set(s.sportsClubs).size, s.sportsClubs.length);
  }
  assert.equal(s.grades.length, 6);
  assert.equal(E.getProfile(s).attemptedCredits, 120);
  for(const g of s.grades) check(g.gpa >= 0 && g.gpa <= 4.3, 'Valid semester GPA');
  assert.equal(s.councilHistory.length, 2, 'Two annual second-semester interviews');
  const admissions = E.applyUniversities(s, ['seoul','kaist','gist']);
  assert.ok(admissions.some(a => a.id === 'new_path' && a.accepted));
  assert.deepEqual(E.applyUniversities(s, ['chonnam']), admissions, 'Applications cannot reroll');
  assert.throws(() => E.advance(s, 'study'));
  counters.fullRuns++;
  return s;
}
for(let seed=0;seed<60;seed++) assert.deepEqual(fullRun(seed), fullRun(seed), 'Whole life is deterministic');
console.log(JSON.stringify({result:'pass', ...counters, archetypeCounts:Object.fromEntries(counts), coverage:['types','sports','council interviews','captain bonus','study windows','illness','v1 migration','deterministic saves','graduation']}));
