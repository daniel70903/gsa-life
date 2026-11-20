'use strict';
const assert = require('node:assert/strict');

module.exports = function verifyV4(ctx) {
  const {E, copy, check, fresh, resolve, ready, toTurn, seek, noLeak, counters, fixtures, dead} = ctx;
  function unchangedOnFailure(s, action, message) {
    const before = copy(s);
    assert.throws(action, message);
    assert.deepEqual(s, before, `${message}: rejection must be atomic`);
  }

  // The published five-point grading bands apply without rewriting old transcripts.
  const bands = [
    [100, 'A+', 4.3], [90, 'A+', 4.3], [89.9, 'A0', 4],
    [85, 'A0', 4], [80, 'A−', 3.7], [75, 'B+', 3.3],
    [70, 'B0', 3], [65, 'B−', 2.7], [60, 'C+', 2.3],
    [55, 'C0', 2], [50, 'C−', 1.7], [45, 'D+', 1.3],
    [40, 'D0', 1], [39.9, 'F', 0]
  ];
  for (const [score, grade, point] of bands) assert.deepEqual(E.getGrade(score), [grade, point]);

  // Starting resources compensate for weaker initial attributes, independently of gender.
  const traits = ['intelligence','social','athletics','discipline','luck','creativity','resilience','leadership'];
  const starts = Array.from({length:120}, (_, seed) => E.create('출발 자금', seed, {gender:'male'}));
  const strength = s => traits.reduce((sum, key) => sum + s.stats[key], 0);
  starts.sort((a,b) => strength(a) - strength(b));
  for (let i=1; i<starts.length; i++) {
    assert.ok(starts[i-1].money.startingBalance >= starts[i].money.startingBalance, 'Weaker initial attributes receive at least as much starting money');
  }
  check(starts[0].money.startingBalance > starts.at(-1).money.startingBalance, 'Compensation meaningfully changes starting money');
  const male = E.create('같은 출발', 901, {gender:'male'});
  const female = E.create('같은 출발', 901, {gender:'female'});
  assert.deepEqual(male.stats, female.stats, 'Gender does not alter the eight starting abilities');
  assert.equal(male.money.balance, female.money.balance, 'Gender does not alter starting money');

  // Purchases enforce funds and weekly limits before changing any state.
  const shopper = fresh(811); resolve(shopper); shopper.stats.fatigue = 60;
  const energy = E.shopItems.find(item => item.id === 'energy');
  assert.ok(energy, 'Energy drink is available in the shop');
  const poor = copy(shopper); poor.money.balance = 0;
  unchangedOnFailure(poor, () => E.buyItem(poor, 'energy'), 'Insufficient funds');
  unchangedOnFailure(poor, () => E.advance(poor, 'delivery'), 'Cannot order delivery with insufficient funds');
  unchangedOnFailure(shopper, () => E.buyItem(shopper, 'not-an-item'), 'Unknown shop item');
  const initialBalance = shopper.money.balance;
  E.buyItem(shopper, 'energy');
  assert.equal(shopper.money.balance, initialBalance - energy.price);
  unchangedOnFailure(shopper, () => E.buyItem(shopper, 'energy'), 'One of each item per week');
  E.buyItem(shopper, 'snack'); E.buyItem(shopper, 'meal'); E.buyItem(shopper, 'milk');
  assert.ok(shopper.stats.fatigue < 60, 'Energy drink offers immediate fatigue relief');
  assert.ok(shopper.money.pendingRebound > 0, 'Temporary relief has a later fatigue cost');
  unchangedOnFailure(shopper, () => E.buyItem(shopper, 'fruit'), 'Four purchases per week');
  const rebound = shopper.money.pendingRebound;
  E.advance(shopper, 'study'); resolve(shopper);
  const control = copy(shopper); control.money.pendingRebound = 0; control.money.reboundSchedule = []; control.money.reboundTurn = null;
  E.advance(shopper, 'study'); E.advance(control, 'study');
  assert.equal(shopper.money.pendingRebound, 0, 'Rebound is consumed once');
  assert.equal(shopper.stats.fatigue - control.stats.fatigue, rebound, 'Next week includes the promised fatigue rebound');
  assert.ok(shopper.money.balance >= 0, 'Money never becomes negative');
  resolve(shopper); E.buyItem(shopper, 'snack');

  // Romance has distinct internal outcomes while presenting the same neutral choices.
  const meeting = fresh(480); resolve(meeting); E.advance(meeting, 'romance');
  seek(meeting, 'campus_romance_meet');
  let maleFriends = 0, femaleFriends = 0;
  for (let seed=0; seed<200; seed++) {
    const m = copy(meeting), f = copy(meeting);
    m.gender = 'male'; f.gender = 'female'; m.rng = seed; f.rng = seed;
    assert.deepEqual(m.pendingEvent, f.pendingEvent, 'Choice prose is independent of hidden gender weights');
    E.chooseEvent(m, 0); E.chooseEvent(f, 0);
    maleFriends += m.romance.records[meeting.pendingEvent.characterId].stage === 'friendship';
    femaleFriends += f.romance.records[meeting.pendingEvent.characterId].stage === 'friendship';
    for (const state of [m,f]) {
      noLeak(state);
      const prose = JSON.stringify([state.pendingEvent, state.eventQueue, state.log]);
      assert.ok(!/(여자|남자|여성|남성).{0,25}(유리|불리|확률|쉽|어렵)/.test(prose), 'Gender weights are never explained to the player');
    }
  }
  assert.equal(femaleFriends, maleFriends, 'The initial friendship stage does not use confession weighting');
  counters.romanceSamples = {maleFriends, femaleFriends, perGender:200};

  // Only detected violations accumulate; two deliveries or four devices cause dorm expulsion.
  function nextViolation(state, action, mustCatch) {
    ready(state);
    const key = action === 'delivery' ? 'deliveryCaught' : 'electronicsCaught';
    for (let seed=0; seed<100; seed++) {
      const attempt = copy(state); attempt.rng = seed;
      attempt.stats.fatigue = 10; attempt.stats.stress = 10;
      attempt.money.balance = Math.max(attempt.money.balance, 50000);
      E.advance(attempt, action);
      if ((attempt.dorm[key] > state.dorm[key]) === mustCatch) return attempt;
    }
    throw new Error('Unable to sample both detected and undetected violations');
  }
  let boarder = fresh(912); resolve(boarder);
  const unseen = nextViolation(boarder, 'delivery', false);
  assert.equal(unseen.dorm.deliveryCaught, 0, 'An undetected order does not count');
  boarder = nextViolation(boarder, 'delivery', true);
  assert.equal(boarder.dorm.status, 'resident');
  boarder = nextViolation(boarder, 'delivery', true);
  assert.equal(boarder.dorm.deliveryCaught, 2);
  assert.equal(boarder.dorm.status, 'expelled');
  assert.equal(boarder.alive, true, 'Dorm expulsion is not death or school withdrawal');
  resolve(boarder);
  const commutingTurn = boarder.turn;
  E.advance(boarder, 'study');
  assert.equal(boarder.turn, commutingTurn+1, 'The expelled student continues studying as a commuter');
  resolve(boarder);
  unchangedOnFailure(boarder, () => E.advance(boarder, 'delivery'), 'Expelled student cannot order in dorm');
  let devices = fresh(913); resolve(devices);
  for (let count=1; count<=4; count++) {
    devices = nextViolation(devices, count%2 ? 'device_dorm' : 'device_study', true);
    assert.equal(devices.dorm.electronicsCaught, count, 'Both device locations share one counter');
    assert.equal(devices.dorm.status, count===4 ? 'expelled' : 'resident');
  }

  // Scheduled school trips supply five credits; an independent activity supplies the sixth.
  const traveler = fresh(745); resolve(traveler);
  toTurn(traveler, 11); resolve(traveler);
  let field = E.getFieldStatus(traveler);
  assert.equal(field.schoolCredits, 1, 'First-year Jeju trip contributes one credit');
  assert.equal(field.independentCredits, 0);
  toTurn(traveler, 21); resolve(traveler);
  field = E.getFieldStatus(traveler);
  assert.equal(field.schoolCredits, 4, 'Second-year US trip contributes three more credits');
  toTurn(traveler, 25); resolve(traveler);
  field = E.getFieldStatus(traveler);
  assert.equal(field.schoolCredits, 5, 'Second-year Byeonsan trip completes five school credits');
  assert.equal(field.required, 6);
  ready(traveler); E.advance(traveler, 'fieldresearch'); resolve(traveler);
  assert.equal(E.getFieldStatus(traveler).total, 6);
  assert.equal(E.getFieldStatus(traveler).independentCredits, 1);
  unchangedOnFailure(traveler, () => E.advance(traveler, 'fieldresearch'), 'Independent credit cannot be farmed');

  // Graduation requires both TOEIC and six credits; missing trips remain recoverable after old saves.
  const graduating = toTurn(fresh(746), 42); resolve(graduating);
  assert.equal(E.getFieldStatus(graduating).total, 6);
  const noEnglish = copy(graduating); noEnglish.toeic.best = 725; noEnglish.ending = 'deferred';
  assert.equal(E.getGraduationStatus(noEnglish).eligible, false);
  const oldGraduate = fixtures.find(x => x.state.version===3 && x.state.turn===48);
  assert.ok(oldGraduate, 'Real v3 end save is available');
  const incomplete = E.migrate(copy(oldGraduate.state));
  if (incomplete.needsGender) E.setGender(incomplete, 'male');
  resolve(incomplete); incomplete.toeic.best = 730;
  assert.equal(E.getFieldStatus(incomplete).total, 0, 'Migration never invents travel attendance');
  assert.equal(E.getGraduationStatus(incomplete).eligible, false, 'TOEIC alone cannot graduate');
  assert.equal(incomplete.ending, 'deferred');
  const oldGrades = copy(incomplete.grades);
  let makeupCount=0;
  while (!E.getGraduationStatus(incomplete).eligible && makeupCount++<6) {
    assert.ok(E.getFieldStatus(incomplete).canMakeup);
    E.makeupFieldTrip(incomplete); resolve(incomplete);
  }
  assert.equal(E.getFieldStatus(incomplete).total, 6);
  assert.equal(incomplete.ending, 'graduated');
  assert.deepEqual(incomplete.grades, oldGrades, 'Make-up work does not repeat completed semesters');
  unchangedOnFailure(incomplete, () => E.makeupFieldTrip(incomplete), 'Completed graduation cannot generate extra credit');

  // Each of six semesters elects class officers and gives exact, finite award quotas.
  const school = graduating.school;
  assert.equal(school.cohort.length, school.cohortSize);
  assert.equal(new Set(school.cohort.map(s=>s.id)).size, school.cohortSize);
  for (const history of school.officerHistory) {
    for (const classroom of history.classes) {
      assert.deepEqual(classroom.roles.map(r=>r.role), ['반장','부반장','대의원']);
      assert.equal(new Set(classroom.roles.map(r=>r.id)).size, 3, 'Distinct students fill the three class positions');
    }
  }
  assert.equal(school.officerHistory.length, 6, 'Each semester has a class election');
  assert.equal(new Set(school.officerHistory.map(h=>h.term)).size, 6, 'A semester election cannot duplicate');
  assert.equal(school.termResults.length, 6, 'Each term has one awards result');
  const enrollmentAPI=require('../dist/school-systems.js').createAPI({});
  for (const result of school.termResults) {
    for (const subject of result.subjects) {
      const gradeSubject=graduating.grades.find(g=>(g.year-1)*2+g.semester-1===result.term).subjects.find(c=>c.id===subject.id);
      const actualEnrollment = enrollmentAPI.getEnrollment(graduating,gradeSubject,result.term).length;
      assert.equal(subject.enrollment, actualEnrollment, 'Award denominator counts the actual course cohort');
      assert.equal(subject.quota, Math.ceil(subject.enrollment*.05));
      // v0.13: 음악·미술·체육은 수행만으로 매겨 능력치를 반영한 추첨으로 교과우수상을 정합니다.
      if (subject.lottery) { assert.ok(subject.chance > 0 && subject.chance <= 50 && subject.rank === null); continue; }
      assert.equal(subject.recipients.length, subject.quota, 'Exactly the highest five percent receive the subject award');
      assert.equal(new Set(subject.recipients.map(x=>typeof x==='string'?x:x.id)).size, subject.quota);
      assert.equal(subject.awarded, subject.rank<=subject.quota, 'Player award matches the finite cohort rank');
    }
    for (const classroom of result.classes) {
      for (const kind of ['model','dormModel']) {
        assert.equal(classroom[kind].quota, 3);
        assert.equal(classroom[kind].recipients.length, 3, 'Every class selects exactly three students');
        assert.equal(new Set(classroom[kind].recipients.map(x=>typeof x==='string'?x:x.id)).size, 3);
      }
    }
  }
  const ordinaryRole = copy(graduating); ordinaryRole.classRole = '일반 학생'; ordinaryRole.school.currentRole = null;
  const roleBaseline = E.getClassRoleBonus(ordinaryRole);
  for (const role of ['반장','부반장','대의원']) {
    const officer = copy(ordinaryRole); officer.classRole = role; officer.school.currentRole = role;
    assert.ok(E.getClassRoleBonus(officer)>roleBaseline, 'Class leadership improves model-student selection');
  }

  // Ranking ties are stable, and saving/revisiting awards cannot duplicate recipients or prizes.
  const schoolModule = require('../dist/school-systems.js');
  const tied = [{id:'z',score:90},{id:'a',score:90},{id:'b',score:95}];
  const ordered = schoolModule.rankCandidates(tied);
  assert.deepEqual(ordered.map(x=>x.id), ['b','a','z']);
  assert.deepEqual(schoolModule.rankCandidates([...tied].reverse()), ordered);
  assert.deepEqual(tied.map(x=>x.id), ['z','a','b'], 'Ranking leaves its input untouched');
  const schoolAPI = schoolModule.createAPI({
    rng:()=>0.5, shift:()=>{}, note:()=>{}, addLearning:()=>{},
    clamp:(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n)), round:n=>Math.round(n*10)/10
  });
  const awarded = copy(graduating), beforeAwards = copy(awarded);
  schoolAPI.onSemesterEnd(awarded, awarded.grades.at(-1));
  assert.deepEqual(awarded, beforeAwards, 'Awarding an already completed term is idempotent');
  const prizeIds = awarded.awards.filter(a=>a.id).map(a=>a.id);
  assert.equal(new Set(prizeIds).size, prizeIds.length, 'Named academic and school prizes have unique identities');

  // A deliberately missed trip can be recovered without repeating any of the attended trips.
  const absent = toTurn(fresh(447), 11); seek(absent, 'school_trip_jeju');
  E.chooseEvent(absent, absent.pendingEvent.choices.findIndex(c=>c.schoolTripSkip));
  resolve(absent); assert.equal(E.getFieldStatus(absent).schoolCredits, 0);
  toTurn(absent, 42); resolve(absent); absent.toeic.best = 730;
  assert.equal(E.getFieldStatus(absent).total, 5);
  assert.equal(E.getGraduationStatus(absent).eligible, false);
  E.makeupFieldTrip(absent); resolve(absent);
  assert.equal(absent.ending, 'graduated');
  assert.equal(E.getFieldStatus(absent).records.filter(r=>r.id==='jeju').length, 1);

  // Extra weeks reset the shop limit, so a deferred graduate can still manage daily life.
  noEnglish.money.balance = Math.max(noEnglish.money.balance, 50000);
  E.buyItem(noEnglish, 'snack'); E.buyItem(noEnglish, 'meal'); E.buyItem(noEnglish, 'milk'); E.buyItem(noEnglish, 'fruit');
  unchangedOnFailure(noEnglish, () => E.buyItem(noEnglish, 'tea'), 'Deferred week purchase limit');
  const extraBefore = noEnglish.extraWeeks;
  E.prepareToeic(noEnglish); resolve(noEnglish);
  assert.equal(noEnglish.extraWeeks, extraBefore+1);
  E.buyItem(noEnglish, 'snack');
  assert.equal(noEnglish.ending, 'deferred', 'Preparation without a passing exam keeps the graduation gate');

  // National-team recognition follows an Olympiad win, a camp and a separate fallible selection.
  const candidate = toTurn(fresh(874), 10); ready(candidate);
  candidate.stats.intelligence = 95; E.advance(candidate, 'rest'); seek(candidate, 'olympiad');
  let winning, nonWinning;
  for (let seed=0; seed<100 && (!winning || !nonWinning); seed++) {
    const attempt = copy(candidate); attempt.rng = seed; E.chooseEvent(attempt, 0);
    if (attempt.awards.some(a=>a.kind==='olympiad')) winning = attempt;
    else nonWinning = attempt;
  }
  assert.ok(winning && nonWinning);
  assert.ok(![nonWinning.pendingEvent,...nonWinning.eventQueue].filter(Boolean).some(e=>e.id==='school_national_camp'), 'No national-team invitation without an Olympiad win');
  seek(winning, 'school_national_camp');
  assert.ok(!winning.awards.some(a=>a.kind==='nationalTeam'), 'An invitation is not a national-team award');
  const declined = copy(winning); E.chooseEvent(declined, 2);
  assert.equal(declined.school.nationalTeam.at(-1).stage, 'declined');
  assert.ok(!declined.awards.some(a=>a.kind==='nationalTeam'));
  E.chooseEvent(winning, 0); seek(winning, 'school_national_selection');
  assert.equal(winning.school.nationalTeam.at(-1).stage, 'trained');
  assert.deepEqual(E.migrate(copy(winning)), winning, 'Pending national-team selection survives reload');
  let selected, rejected;
  for (let seed=0; seed<100 && (!selected || !rejected); seed++) {
    const attempt = copy(winning); attempt.rng = seed; E.chooseEvent(attempt, 0);
    if (attempt.school.nationalTeam.at(-1).selected) selected = attempt;
    else rejected = attempt;
  }
  assert.ok(selected && rejected, 'Final selection can succeed or fail');
  assert.equal(selected.awards.filter(a=>a.kind==='nationalTeam').length, 1);
  assert.equal(rejected.awards.filter(a=>a.kind==='nationalTeam').length, 0);

  // Every exposed mutation respects the death ending, including new side actions.
  const deadMutations = [
    () => E.buyItem(dead, 'snack'), () => E.setGender(dead, 'female'),
    () => E.makeupFieldTrip(dead), () => E.prepareToeic(dead),
    () => E.chooseEvent(dead, 0), () => E.chooseElectives(dead, ['advanced_math','advanced_physics']),
    () => E.setClubs(dead, 'physics', 'none')
  ];
  for (const action of deadMutations) unchangedOnFailure(dead, action, 'Terminal ending blocks mutation');

  counters.v4Focused = true;
};
