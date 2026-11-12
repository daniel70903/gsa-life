'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const old1 = require('./v1-save-fixtures.json');
const old2 = require('./v2-save-fixtures.json');
const old3 = require('./v3-save-fixtures.json');
const old4 = require('./v4-save-fixtures.json');
const old5 = require('./v5-save-fixtures.json');
const copy = x => JSON.parse(JSON.stringify(x));
const counters = {fullRuns:0, checks:0, events:0,dailyEvents:0};
function check(v,m){counters.checks++;assert.ok(v,m);}
function fresh(seed=1){const s=E.create('시뮬레이션 검증',seed,{gender:'male'});E.setClubs(s,'physics','none');return s;}
function visibleText(value){
 const fields=new Set(['title','description','label','message','reason','effectsText']);
 const out=[];function walk(v){if(Array.isArray(v))return v.forEach(walk);if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){if(fields.has(k)&&typeof x==='string')out.push(x);else if(typeof x==='object')walk(x);}}walk(value);return out.join('\n');
}
function noLeak(s){const text=visibleText([s.pendingEvent,s.eventQueue,s.log,s.admissions]);check(!/(%p|(운동부|메달|교육감배)[^\n]{0,80}(가산점|보너스|선발 확률|선출 가능성)|(가산점|보너스)[^\n]{0,60}(운동부|메달|교육감배))/.test(text),'Hidden sports/medal modifiers must not appear in player-facing prose');}
function resolve(s,chooser=()=>0){let n=0;while(s.pendingEvent&&s.alive){check(++n<60,'Finite event queue');noLeak(s);if(s.pendingEvent.id.startsWith('daily_')){counters.dailyEvents++;if(s.pendingEvent.context==='sports')assert.ok(s.sportsClubs.length,'Team event requires membership');if(s.pendingEvent.context==='research')assert.ok(s.turn>=8,'Research events follow the first semester');}const index=chooser(s.pendingEvent,s);const restored=copy(s);E.chooseEvent(s,index);E.chooseEvent(restored,index);assert.deepEqual(restored,s,'JSON save preserves pending event resolution');counters.events++;}return s;}
function ready(s){if(s.needsGender)E.setGender(s,'male');resolve(s);if(!s.alive)return;if(E.needsEnrollment(s))E.enrollSemester(s,E.recommendEnrollment(s,'physics'));if(E.getPhase(s).needsApplications)E.applyUniversities(s,['kaist','gist','dgist']);resolve(s);}
function safeAction(s){if(s.stats.fatigue>43||s.stats.stress>50||s.illnessWeeks)return 'rest';if(s.turn>=32&&E.getFieldStatus(s).canIndependent)return 'fieldresearch';if(s.turn>=8&&s.toeic.best<730)return s.turn%2?'toeic':'english';return ['study','research','friends','academic'][s.turn%4];}
function toTurn(s,target){let guard=0;while(s.turn<target&&s.alive){check(++guard<65,'Progress makes turns');ready(s);if(!s.alive)break;E.advance(s,safeAction(s),'normal');}assert.equal(s.turn,target,'Safe strategy reaches requested turn');return s;}
function seek(s,id){let n=0;while(s.pendingEvent&&s.pendingEvent.id!==id&&s.alive){assert.ok(++n<40,'Scheduled event remains reachable');E.chooseEvent(s,0);}assert.equal(s.pendingEvent?.id,id);return s.pendingEvent;}
function bounds(s){for(const [k,v]of Object.entries(s.stats)){check(Number.isFinite(v)&&v>=0&&v<=(['fatigue','stress'].includes(k)?120:100),`Valid ${k}`);}assert.ok(s.sportsClubs.length<=2);assert.equal(new Set(s.sportsClubs).size,s.sportsClubs.length);}

// Versioning, eight character traits and seeded starts remain intact.
assert.equal(E.archetypes.length,6);
const seen=new Set();for(let seed=0;seed<180;seed++){const s=E.create('학생',seed);assert.equal(s.version,6);seen.add(s.archetype);assert.deepEqual(E.create('학생',seed),s);for(const k of ['intelligence','social','athletics','discipline','luck','creativity','resilience','leadership'])check(Number.isFinite(s.stats[k]),k);bounds(s);}assert.equal(seen.size,6);
const start=fresh(41);assert.equal(start.pendingEvent.id,'sports_tryout');assert.equal(start.sportsClubs.length,0);assert.throws(()=>E.advance(start,'study'));
const athletic=copy(start), weak=copy(start);athletic.stats.athletics=90;weak.stats.athletics=10;check(E.getSportsChance(athletic,'basketball')>E.getSportsChance(weak,'basketball'),'Athletics affect tryouts');
resolve(start);noLeak(start);

// Each exam has two weeks of night study and one week of early-morning study.
const calendar=fresh(21);resolve(calendar);for(let week=1;week<=8;week++){const s=copy(calendar);s.turn=week-1;const p=E.getPhase(s);assert.equal(p.nightAvailable,[2,3,4,6,7,8].includes(week));assert.equal(p.dawnAvailable,[3,4,7,8].includes(week));if(!p.nightAvailable)assert.throws(()=>E.advance(s,'rest','night'));if(!p.dawnAvailable)assert.throws(()=>E.advance(s,'rest','dawn'));}

// First-year end now holds the captain choice before the second team opportunity.
const captain=fresh(3);captain.stats.athletics=95;captain.stats.luck=95;E.chooseEvent(captain,0);toTurn(captain,16);
seek(captain,'club_captain');const teamBefore=copy(captain.sportsClubs);check(captain.pendingEvent.choices.some(c=>c.label.includes('물리')),'Actual academic club can be captained');noLeak(captain);E.chooseEvent(captain,0);seek(captain,'sports_tryout');for(const id of teamBefore)check(!captain.pendingEvent.choices.some(c=>c.sportsId===id),'No duplicate team option');resolve(captain);assert.equal(captain.sportsTryouts.length,2);assert.ok(captain.sportsClubs.length<=2);
const at29=toTurn(fresh(12),29);check(at29.pendingEvent?.id!=='club_captain'&&!at29.eventQueue?.some(e=>e.id==='club_captain'),'Old second-year captain timing is removed');

// President/vice-president take questions from students; department officers still interview.
const names=['문예부','체육부','통계부','환경부','홍보부','총무부','정책부','생체부','정보부'];assert.deepEqual(E.departments.map(d=>d.name).sort(),names.sort());
for(const [turn,executive,department]of [[8,'부회장','차장'],[24,'회장','부장']]){
 const base=toTurn(fresh(100+turn),turn);seek(base,'council_apply');const offered=visibleText(base.pendingEvent);check(offered.includes(executive)&&offered.includes('체육부 '+department),'Year-specific eligible positions');
 const leader=copy(base);E.chooseEvent(leader,0);check(!leader.pendingEvent.title.includes('면접'),'Executive round is not an interview');check(/학생|질문|공개|질의/.test(visibleText(leader.pendingEvent)),'Students publicly question executive candidates');
 const resumed=copy(leader);E.chooseEvent(leader,0);E.chooseEvent(resumed,0);assert.deepEqual(leader,resumed,'Public Q&A stage is saveable');E.chooseEvent(leader,0);check(leader.councilHistory.length>base.councilHistory.length,'Q&A produces election outcome');
 const officer=copy(base);const i=officer.pendingEvent.choices.findIndex(c=>c.label.includes('체육부'));assert.ok(i>=0);E.chooseEvent(officer,i);check(officer.pendingEvent.title.includes('면접'),'Department applicants interview');E.chooseEvent(officer,0);E.chooseEvent(officer,0);check(officer.councilHistory.length>base.councilHistory.length,'Department interview completes');noLeak(leader);noLeak(officer);
}

// Membership and medals still affect selection internally, but no UI-facing formulas leak.
const base=copy(start);base.turn=8;base.pendingEvent=null;base.eventQueue=[];base.sportsClubs=[];base.awards=[];for(const k of ['social','leadership','discipline','luck'])base.stats[k]=25;
const member=copy(base);member.sportsClubs=['basketball'];check(E.getCaptainChance(member)>E.getCaptainChance(base),'Sports still influence captain outcome');check(E.getCouncilChance(member,'vicePresident',0)>E.getCouncilChance(base,'vicePresident',0),'Sports still influence election outcome');
const medal=copy(base);medal.awards=[{kind:'sports',name:'교육감배 동메달',year:1,turn:8}];check(E.getCouncilChance(medal,'vicePresident',0)>E.getCouncilChance(base,'vicePresident',0),'Medal influences school selection');check(E.getCaptainChance(medal)>E.getCaptainChance(base),'Medal influences captain selection');

// School representation requires membership, training participation and athletic skill.
const tournament = fresh(77);
tournament.stats.athletics = 95; tournament.stats.luck = 95;
resolve(tournament);
assert.ok(tournament.sportsClubs.length, 'A successful tryout opens the team route');
E.advance(tournament, 'sports'); resolve(tournament);
E.advance(tournament, 'sports'); resolve(tournament);
toTurn(tournament, 8); seek(tournament, 'sports_tournament');
check(tournament.pendingEvent.choices.some(c => c.tournamentClub), 'Trained athletes may represent the school after the first semester');
for (const change of [{sportsClubs:[]}, {sportsWeeks:0,clubWeeks:0}, {stats:{...tournament.stats, athletics:20}}]) {
 const ineligible = Object.assign(copy(tournament), change);
 check(!E.getTournamentEligibility(ineligible), 'Membership, participation and skill each matter');
}
const newerAthlete=copy(tournament);newerAthlete.stats.athletics=45;newerAthlete.sportsWeeks=1;newerAthlete.clubWeeks=0;check(E.getTournamentEligibility(newerAthlete),'Moderate skill and one team practice can unlock the tournament');
// School representative selection precedes the four-stage tournament story.
let selectedTournament, failedSelection;
for (let seed=0; seed<80 && (!selectedTournament || !failedSelection); seed++) {
 const attempt=copy(tournament); attempt.rng=seed; E.chooseEvent(attempt,0);
 if(attempt.pendingEvent?.tournamentStep===0) selectedTournament=attempt;
 else if(attempt.tournamentHistory.length) failedSelection=attempt;
}
assert.ok(selectedTournament && failedSelection,'School representative selection is fallible');
assert.ok(!selectedTournament.tournamentHistory.some(h=>h.year===1),'Participation is not recorded before the tournament finishes');
assert.ok(!selectedTournament.awards.some(a=>a.kind==='sports'),'Entering the story does not award a medal');
for(let step=0;step<3;step++) {
 assert.equal(selectedTournament.pendingEvent.tournamentStep,step);
 const saved=E.migrate(copy(selectedTournament));
 E.chooseEvent(selectedTournament,0); E.chooseEvent(saved,0);
 assert.deepEqual(saved,selectedTournament,'Intermediate tournament stages survive reload');
 assert.ok(!selectedTournament.awards.some(a=>a.kind==='sports'),'Medals wait until the final stage');
}
assert.equal(selectedTournament.pendingEvent.tournamentStep,3);
let medals = 0;
for (let seed = 0; seed < 1000; seed++) {
 const s = copy(selectedTournament); s.rng = seed;
 E.chooseEvent(s, 0);
 const record = s.tournamentHistory.at(-1);
 assert.equal(record.year, 1); assert.equal(record.participated, true);
 if (record.medal) {
  medals++;
  assert.ok(s.awards.some(a => a.kind === 'sports'), 'Medal is recorded as a sports achievement');
  noLeak(s);
 }
}
check(medals >= 70 && medals <= 130, `Medal chance stays around 10%: ${medals}/1000`);
counters.medalSamples = 1000; counters.medals = medals;

// Emergency thresholds are evaluated before academic-break recovery can hide the crossing.
const emergencyBase=toTurn(fresh(101),7);ready(emergencyBase);emergencyBase.stats.fatigue=99;emergencyBase.stats.health=1;emergencyBase.stats.stress=20;E.advance(emergencyBase,'study');check(emergencyBase.pendingEvent&&/응급|병원/.test(visibleText(emergencyBase.pendingEvent)),'Fatigue overflow triggers immediate emergency');check(emergencyBase.emergency.fatigue>100,'Emergency history records the threshold crossing before vacation recovery');const overflow=fresh(102);resolve(overflow);overflow.stats.fatigue=99;overflow.stats.stress=10;E.advance(overflow,'study');check(overflow.stats.fatigue>100,'Fatigue can cross previous 100-point clamp');
const luckLow=copy(emergencyBase),luckHigh=copy(emergencyBase);luckLow.stats.luck=0;luckHigh.stats.luck=100;check(E.getEmergencySurvivalChance(luckHigh)>E.getEmergencySurvivalChance(luckLow),'Luck improves survival');
let dead,survived;for(let seed=1;seed<300&&(!dead||!survived);seed++){const s=copy(emergencyBase);s.rng=seed;E.chooseEvent(s,0);if(s.alive)survived=s;else dead=s;}
assert.ok(dead&&survived,'Both survival and non-graphic death endings are possible');assert.equal(dead.ending,'death');assert.equal(dead.pendingEvent,null);assert.equal(dead.eventQueue.length,0);assert.throws(()=>E.advance(dead,'rest'));assert.throws(()=>E.applyUniversities(dead,['gist']));assert.throws(()=>E.takeToeic(dead));check(survived.stats.fatigue<60&&survived.stats.stress<60,'Survivor is stabilized');check(survived.hospitalizations.length>=1,'Hospital experience is recorded');
for(const [f,t]of [[10,99],[90,90]]){const s=fresh(52);resolve(s);s.stats.fatigue=f;s.stats.stress=t;s.stats.health=Math.max(0,100-f);E.advance(s,'study');check(/응급|병원/.test(visibleText(s.pendingEvent)),'Stress overflow and combined fatigue/stress can trigger emergency');}

// Difficult dorm relationships reduce real study efficiency and can be repaired.
const dorm=fresh(30);resolve(dorm);const isolated=copy(dorm),connected=copy(dorm);isolated.stats.social=5;isolated.dormHarmony=10;connected.stats.social=90;connected.dormHarmony=90;
check(E.getDormStatus(isolated).efficiency<E.getDormStatus(connected).efficiency,'Low harmony reduces dorm efficiency');const a=copy(isolated),b=copy(connected);E.advance(a,'study');E.advance(b,'study');check(a.semesterLearning.math<b.semesterLearning.math,'Dorm conflict reduces actual learning');const friend=copy(isolated);E.advance(friend,'friends');check(friend.dormHarmony>isolated.dormHarmony,'Friend time improves dorm relationships');

// Science olympiad eligibility/reward grows with intelligence; awards strongly aid IST in this fictional model.
const genius=copy(base),novice=copy(base);genius.stats.intelligence=95;novice.stats.intelligence=20;check(E.getOlympiadChance(genius)>E.getOlympiadChance(novice),'Intelligence affects olympiad success');
assert.ok(E.universities.some(u=>u.id==='dgist'),'DGIST belongs to the IST options');
const applicant=toTurn(fresh(44),32);ready(applicant);const ordinary=copy(applicant),winner=copy(applicant);ordinary.awards=[];ordinary.grades=[];winner.grades=[];winner.awards=[{kind:'olympiad',name:'물리 올림피아드 금상',year:2,turn:28}];
for(const id of ['kaist','gist','unist','dgist']){const low=E.getAdmissionChance(ordinary,id,0),high=E.getAdmissionChance(winner,id,0);check(high>=0.9&&high<1,'Olympiad award makes IST likely but not guaranteed');check(high>low,'IST award materially improves admission chance');}

// Olympiad awards arise from the actual choice, and low-intelligence pupils can prepare first.
const olympiad = toTurn(fresh(401), 11); ready(olympiad);
const learner = copy(olympiad); learner.stats.intelligence = 20;
E.advance(learner, 'rest'); seek(learner, 'olympiad');
check(!learner.pendingEvent.choices.some(c => c.participateOlympiad), 'Beginner receives preparation choices');
olympiad.stats.intelligence = 95; E.advance(olympiad, 'rest'); seek(olympiad, 'olympiad');
check(olympiad.pendingEvent.choices.some(c => c.participateOlympiad), 'Intelligent student can enter the Olympiad');
let actualWinner;
for (let seed = 0; seed < 30 && !actualWinner; seed++) {
 const s = copy(olympiad); s.rng = seed; E.chooseEvent(s, 0);
 if (s.awards.some(a => a.kind === 'olympiad')) actualWinner = s;
}
assert.ok(actualWinner, 'Olympiad entry can produce a persistent award');
assert.ok(actualWinner.olympiadHistory.at(-1).won);

// TOEIC attempts are real graduation gates, have valid scores, and can be retried after a delay.
const exam=toTurn(fresh(14),18);ready(exam);const smart=copy(exam),unprepared=copy(exam);smart.stats.intelligence=95;smart.stats.luck=95;unprepared.stats.intelligence=5;unprepared.stats.luck=5;E.advance(smart,'toeic');E.advance(unprepared,'toeic');check(smart.toeic.attempts.at(-1).score>unprepared.toeic.attempts.at(-1).score,'Intelligence and luck improve TOEIC score under same random draw');
for(const s of [smart,unprepared]){const score=s.toeic.attempts.at(-1).score;check(score>=10&&score<=990&&score%5===0,'TOEIC score range and increments');}

// 3rd-year first semester applications, interviews and results precede graduation.
const admissions=toTurn(fresh(6),32);resolve(admissions);assert.ok(E.needsEnrollment(admissions));assert.throws(()=>E.advance(admissions,'study'),'Cannot silently skip applications window');if(E.needsEnrollment(admissions))E.enrollSemester(admissions,E.recommendEnrollment(admissions,'physics'));assert.ok(E.getPhase(admissions).needsApplications);assert.throws(()=>E.applyUniversities(admissions,['gist','gist']));E.applyUniversities(admissions,['kaist','gist','dgist']);assert.deepEqual(admissions.applications,['kaist','gist','dgist']);assert.equal(admissions.admissionStage,'applied');const recorded=copy(admissions.applications);try{E.applyUniversities(admissions,['seoul']);}catch(e){}assert.deepEqual(admissions.applications,recorded,'No application reroll');
toTurn(admissions,36);resolve(admissions);assert.equal(admissions.universityInterviews.length,3,'Each selected university receives an interview');check(admissions.universityInterviews.every(i=>i.answers.length===3),'Research/reasoning/personal interview sequence');toTurn(admissions,39);resolve(admissions);assert.equal(admissions.admissionStage,'results');assert.equal(admissions.admissions.length,3);check(!admissions.admissions.some(r=>r.id==='new_path'),'No invented guaranteed university offer');
const delayed=copy(admissions);toTurn(delayed,47);ready(delayed);delayed.toeic.best=725;E.advance(delayed,'rest');resolve(delayed);assert.equal(delayed.ending,'deferred','TOEIC below 730 blocks graduation');const bestBefore=delayed.toeic.best;let attempts=0;while(delayed.ending==='deferred'&&delayed.alive&&attempts++<30){if(delayed.pendingEvent){resolve(delayed);continue;}E.prepareToeic(delayed);E.takeToeic(delayed);resolve(delayed);}assert.ok(delayed.alive,'Safe postgraduate preparation does not force death');assert.equal(delayed.ending,'graduated');check(delayed.toeic.best>=730,'Retake can satisfy graduation condition');check(delayed.extraWeeks>0,'Deferred graduation records extra time');check(delayed.toeic.best>=bestBefore,'Best TOEIC score is retained');
const boundary=copy(admissions);toTurn(boundary,47);ready(boundary);boundary.toeic.best=730;E.advance(boundary,'rest');resolve(boundary);assert.equal(boundary.ending,'graduated','Exactly 730 is sufficient');

// Graduation remains reachable through preparation even for very weak starting ability.
const struggling = copy(delayed); struggling.ending = 'deferred';
struggling.toeic = {best:0, attempts:[], practice:0};
for (const key of Object.keys(struggling.stats)) struggling.stats[key] = 0;
const transcriptBeforeRetakes = copy(struggling.grades);
for (let attempt = 0; attempt < 40 && struggling.ending === 'deferred'; attempt++) {
 E.prepareToeic(struggling); E.takeToeic(struggling); resolve(struggling);
}
assert.equal(struggling.ending, 'graduated', 'Persistent preparation can overcome low intelligence and luck');
assert.deepEqual(struggling.grades, transcriptBeforeRetakes, 'Retakes never repeat school semesters');

// Legacy states retain progress and records while upgrading visible event/log descriptions.
const fixtures=[...Object.entries(old1).map(([label,state])=>({label:'v1-'+label,state})),...old2,...old3,...old4,...old5];
for(const fixture of fixtures){const before=copy(fixture.state),after=E.migrate(copy(before));assert.equal(after.version,6);assert.equal(after.turn,before.turn);assert.deepEqual(after.grades,before.grades,'Migration preserves transcript');if(before.admissions)assert.deepEqual(after.admissions.map(a=>[a.id,a.accepted]),before.admissions.filter(a=>a.id!=='new_path').map(a=>[a.id,a.accepted]),'Migration preserves actual university offers');assert.ok(Array.isArray(after.eventQueue));assert.ok(after.toeic&&Array.isArray(after.toeic.attempts));assert.ok(Number.isFinite(after.dormHarmony));noLeak(after);const twice=E.migrate(copy(after));assert.deepEqual(twice,after,'Migration is idempotent');}

// Actual old saves can continue through new application, interview and graduation gates.
for (const fixture of fixtures) {
 const s = E.migrate(copy(fixture.state));
 if(!s.alive){assert.equal(s.ending,'death');assert.throws(()=>E.simulateWeek(s,'balanced'));continue;}
 toTurn(s, 48); ready(s);
 assert.ok(s.alive, `Legacy save ${fixture.label} can continue with a safe strategy`);
 assert.equal(s.grades.length, 6, `Legacy save ${fixture.label} keeps exactly six terms`);
 assert.equal(s.admissionStage, 'results');
 assert.ok(['graduated', 'deferred'].includes(s.ending));
}

// Repeated complete lives exercise frequent events, deterministic saves and all semester transitions.
function fullRun(seed){const s=fresh(seed),dailyBefore=counters.dailyEvents;let count=0;while(s.turn<48&&s.alive){const oldEvents=counters.events;ready(s);count+=counters.events-oldEvents;if(!s.alive)break;const focus=s.stats.fatigue>55||s.stats.stress>65||s.illnessWeeks?'recovery':s.turn>=8&&s.toeic.best<730?'english':['balanced','intelligence','social','athletics','discipline','research','leadership'][s.turn%7];const commitment=s.turn>=32&&E.getFieldStatus(s).canIndependent?'fieldresearch':s.turn>=8&&s.toeic.best<730&&s.toeic.practice>=5?'toeic':null;const saved=copy(s);E.simulateWeek(s,focus,'normal',commitment);E.simulateWeek(saved,focus,'normal',commitment);assert.deepEqual(s,saved,'JSON save preserves following week');bounds(s);noLeak(s);}resolve(s);if(s.alive){assert.equal(s.grades.length,6);assert.equal(E.getProfile(s).attemptedCredits,s.grades.reduce((sum,g)=>sum+g.subjects.reduce((n,c)=>n+c.credits,0),0),'Attempted credits follow actual semester enrollment');assert.equal(s.councilHistory.length,2);assert.ok(['graduated','deferred'].includes(s.ending));if(s.ending==='graduated'){assert.ok(s.toeic.best>=730);assert.ok(E.getFieldStatus(s).total>=6);assert.ok(E.getCurriculumStatus(s).complete||E.getCurriculumStatus(s).legacyExempt);}assert.equal(s.admissionStage,'results');assert.equal(s.universityInterviews.length,3);check(count>=20,'Many more weekly events than the old milestone-only game');check(counters.dailyEvents-dailyBefore>=15,'Ordinary daily choices recur throughout the three years');}else assert.equal(s.ending,'death');counters.fullRuns++;return s;}
for(let seed=0;seed<30;seed++)assert.deepEqual(fullRun(seed),fullRun(seed),'Same life seed stays reproducible');
require('./v4-features.cjs')({E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead});
require('./v5-features.cjs')({E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead});
require('./v6-features.cjs')({E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead});
require('./v8-features.cjs')({E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead});
require('./v9-features.cjs')({E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead});
console.log(JSON.stringify({result:'pass',...counters,coverage:['migration','hidden modifiers','emergency/death','tournament medals','captain timing','public Q&A','weekly events','dorm efficiency','olympiad/IST','TOEIC graduation','early university interviews','money/shop/rebound','hidden romance','dorm expulsion','field-credit graduation','cohort award quotas','national-team selection','semester enrollment','earned elective credits','major eligibility/applications','major-specific interviews','curriculum make-up graduation']}));
