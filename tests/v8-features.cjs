'use strict';
const assert = require('node:assert/strict');
const legacy = require('./v7-save-fixtures.json');
const oldGrades = require('./v7-grade-baseline.json');

module.exports = function verifyV8(ctx) {
  const {E,copy,check,fresh,resolve,ready,toTurn,counters,dead} = ctx;
  const saved = label => copy(legacy.find(f=>f.label===label).state);
  function rejectUnchanged(s, action, label) {
    const before=copy(s); assert.throws(action,label); assert.deepEqual(s,before,`${label}: no partial mutation`);
  }
  function oldEventContent(event) {
    const clean=copy(event);
    if(clean&&/^campus_romance_/.test(clean.id)){delete clean.characterId;delete clean.characterName;delete clean.portraitIndex;}
    return clean;
  }

  // Actual v7 saves retain completed assessments, ongoing preparations, and an already selected event.
  for(const fixture of legacy) {
    const before=copy(fixture.state), after=E.migrate(copy(before));
    assert.equal(after.turn,before.turn);
    assert.deepEqual(after.grades,before.grades,'Harder future exams never rewrite a saved transcript');
    assert.deepEqual(after.midterm,before.midterm,'A completed midterm keeps its saved marks');
    assert.deepEqual(after.semesterLearning,before.semesterLearning);
    assert.deepEqual(after.curriculum,before.curriculum,'A confirmed old course plan is retained');
    assert.deepEqual(oldEventContent(after.pendingEvent),oldEventContent(before.pendingEvent),'Migration does not replace an unresolved choice');
    assert.deepEqual(E.migrate(copy(after)),after,'v7 migration is idempotent');
    const haneul=E.getRomanceRoster(after).find(p=>p.name==='하늘');
    assert.ok(haneul);
    assert.equal(haneul.stage,before.romance.stage);
    assert.equal(haneul.bond,before.romance.bond);
    assert.equal(haneul.meetings,before.romance.meetings);
    if(before.romance.stage==='dating') {
      assert.equal(after.romance.datingId,haneul.id);
      assert.equal(E.getRomanceRoster(after).filter(p=>p.dating).length,1);
    }
    if(before.pendingEvent?.id.startsWith('campus_romance_')) {
      assert.equal(after.pendingEvent.characterId,haneul.id,'An old encounter stays bound to its original person');
      const resumed=E.migrate(copy(after));
      E.chooseEvent(after,0); E.chooseEvent(resumed,0);
      assert.deepEqual(resumed,after,'Migrated pending romance resolves reproducibly after another reload');
      assert.ok(after.romance.records[haneul.id].bond>before.romance.bond);
    }
  }

  // Captain and council have distinct real transition boundaries; completed service remains an achievement.
  for(const t of [31,32,39,40]) {
    const before=saved(`v7-turn-${t}-roles`), s=E.migrate(copy(before));
    assert.equal(s.captain,t<32,`Captain is only active before turn32 (${t})`);
    assert.equal(s.captainClub,t<32?before.captainClub:null);
    const tenure=s.captainHistory.find(h=>h.passed);
    assert.ok(tenure&&tenure.club===before.captainClub);
    assert.equal(tenure.selectedTurn,16);
    assert.equal(tenure.endedTurn,t<32?null:32);
    assert.ok(s.badges.includes(`${before.captainClub} 기장`),'The captain achievement is not erased');
    assert.equal(s.councilRole,t<40?before.councilRole:'일반 학생','Council remains active throughout third-year first semester');
    assert.equal(s.councilHistory.filter(h=>h.passed).length,before.councilHistory.filter(h=>h.passed).length);
  }
  const before32=E.migrate(saved('v7-turn-31-roles')), transcript=copy(before32.grades);
  const currentMidterm=copy(before32.midterm);
  E.advance(before32,'rest'); resolve(before32);
  assert.equal(before32.turn,32); assert.equal(before32.captain,false); assert.equal(before32.captainClub,null);
  assert.equal(before32.councilRole,'학생회 회장');
  assert.deepEqual(before32.grades.slice(0,-1),transcript);
  assert.deepEqual(before32.grades.at(-1).subjects.map(c=>c.id),currentMidterm.map(c=>c.id),'The in-progress saved semester finishes its original subjects');
  const before40=E.migrate(saved('v7-turn-39-roles'));
  E.advance(before40,'rest'); resolve(before40);
  assert.equal(before40.turn,40); assert.equal(before40.councilRole,'일반 학생');
  const lastCouncil=before40.councilHistory.filter(h=>h.passed).at(-1);
  assert.equal(lastCouncil.endedTurn,40);
  const experienced=copy(before32),noExperience=copy(before32);
  // Compare near the selection boundary so the probability ceiling cannot hide a real bonus.
  for(const s of [experienced,noExperience]){s.awards=[];s.councilHistory=[];s.grades=[{credits:10,subjects:[{credits:10,point:3.8}]}];s.applicationSnapshot={...(s.applicationSnapshot||{}),gpa:3.8};for(const k of Object.keys(s.stats))s.stats[k]=50;}
  noExperience.captainHistory=[];
  assert.ok(E.getAdmissionChance(experienced,'gist',0)>E.getAdmissionChance(noExperience,'gist',0),'Completed captain service still contributes to the existing admission evaluation');

  // Matched seeded first semesters show a measured reduction in easy A grades, while preparation still helps.
  const difficulty={};
  for(const old of oldGrades.cases) {
    const s=E.create('학점 난도 검증',old.seed,{gender:'male'});E.setClubs(s,'physics','none');
    s.stats.intelligence=oldGrades.intelligence;s.stats.discipline=oldGrades.discipline;
    function settle(){resolve(s,event=>event.id==='study_planner'?event.choices.findIndex(c=>c.plannerPreset==='custom'):event.id.startsWith('campus_opportunity_')?event.choices.findIndex(c=>c.campusChoice==='skip'):0);}
    for(let t=0;t<8;t++){settle();E.simulateWeek(s,s.stats.fatigue>55||s.stats.stress>65||s.illnessWeeks?'recovery':old.focus,'normal');}
    settle(); assert.ok(s.alive);assert.equal(s.grades.length,1);
    const row=difficulty[old.focus]||={samples:0,oldMean:0,newMean:0,oldGPA:0,newGPA:0};
    row.samples++;row.oldMean+=old.mean;row.newMean+=s.grades[0].subjects.reduce((n,c)=>n+c.score,0)/s.grades[0].subjects.length;row.oldGPA+=old.gpa;row.newGPA+=s.grades[0].gpa;
  }
  for(const row of Object.values(difficulty))for(const key of ['oldMean','newMean','oldGPA','newGPA'])row[key]/=row.samples;
  const balanced=difficulty.balanced,studied=difficulty.intelligence;
  check(balanced.newMean<balanced.oldMean-4&&balanced.newGPA<balanced.oldGPA-.2,'A typical balanced life no longer receives near-automatic A+ marks');
  check(balanced.newMean>balanced.oldMean-20&&balanced.newMean>=65,'The revision increases challenge without turning a prepared ordinary semester into failure');
  check(studied.newMean>balanced.newMean+5&&studied.newGPA>=3.5,'Sustained study still produces materially better grades');
  assert.deepEqual(E.getGrade(90),['A+',4.3]);assert.deepEqual(E.getGrade(89.9),['A0',4]);assert.deepEqual(E.getGrade(40),['D0',1]);assert.deepEqual(E.getGrade(39.9),['F',0]);
  counters.v8Difficulty=difficulty;

  // Choosing a person is a preference, not a free relationship action or a cooldown reset.
  const social=fresh('v8-roster');resolve(social);social.turn=12;
  const roster=E.getRomanceRoster(social);
  assert.equal(roster.length,6);assert.equal(new Set(roster.map(p=>p.id)).size,6);assert.equal(new Set(roster.map(p=>p.name)).size,6);
  assert.equal(new Set(roster.map(p=>p.portraitIndex)).size,6);assert.ok(roster.every(p=>p.personality&&p.interests.length));
  const progress=copy({records:social.romance.records,stats:social.stats,money:social.money,turn:social.turn,rng:social.rng});
  for(const person of [...roster,...roster].reverse()) {
    E.selectRomanceTarget(social,person.id);
    assert.equal(social.romance.targetId,person.id);
    assert.equal(E.getRomanceRoster(social).filter(p=>p.selected).length,1);
    assert.deepEqual({records:social.romance.records,stats:social.stats,money:social.money,turn:social.turn,rng:social.rng},progress,'Cycling preference does not create affection, meetings, money, stats, or random rerolls');
  }
  rejectUnchanged(social,()=>E.selectRomanceTarget(social,'not-a-person'),'Unknown classmates cannot be selected');
  const pending=E.migrate(saved('v7-friendship-pending'));
  rejectUnchanged(pending,()=>E.selectRomanceTarget(pending,roster[1].id),'An unresolved meeting cannot be retargeted');
  rejectUnchanged(dead,()=>E.selectRomanceTarget(dead,roster[0].id),'A finished story cannot choose a partner');

  // Exercise all six encounter scripts with controlled outcomes, independent records, and real choice resolution.
  const campusModule=require('../dist/campus-systems.js');
  let nextRandom=0;
  const campus=campusModule.createAPI({rng:()=>nextRandom,shift:(s,changes)=>{for(const [k,v]of Object.entries(changes))s.stats[k]=(s.stats[k]||0)+v;},note:()=>{},addLearning:()=>{},clamp:(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n)),round:n=>Math.round(n*10)/10});
  const encounters=new Set(),dates=new Set();
  for(const person of roster) {
    const s=fresh(`v8-person-${person.id}`);resolve(s);s.turn=12;E.selectRomanceTarget(s,person.id);
    const others=copy(Object.fromEntries(Object.entries(s.romance.records).filter(([id])=>id!==person.id)));
    const meet=campus.handleAction(s,'romance').events[0];assert.equal(meet.id,'campus_romance_meet');assert.equal(meet.characterId,person.id);assert.ok(meet.description.includes(person.name));encounters.add(meet.description);
    campus.resolve(s,meet,meet.choices.find(c=>c.campusChoice==='hello'));
    assert.equal(s.romance.records[person.id].stage,'friendship');assert.ok(s.romance.records[person.id].meetings>0);
    assert.deepEqual(Object.fromEntries(Object.entries(s.romance.records).filter(([id])=>id!==person.id)),others,'Meeting one classmate does not progress five other relationships');
    s.turn+=12;Object.assign(s.romance,{bond:60,meetings:6,lastEventTurn:s.turn-4,lastConfessionTurn:-20});campus.migrate(s);
    const invite=campus.handleAction(s,'romance').events[0];assert.equal(invite.id,'campus_romance_invite');
    const declined=copy(s);nextRandom=.99;campus.resolve(declined,invite,invite.choices.find(c=>c.campusChoice==='ask'));nextRandom=0;
    assert.equal(declined.romance.records[person.id].stage,'friendship');assert.ok(declined.romance.records[person.id].cooldownUntil>declined.turn);
    const refused=copy(declined.romance.records[person.id]);const other=roster.find(p=>p.id!==person.id);
    E.selectRomanceTarget(declined,other.id);E.selectRomanceTarget(declined,person.id);
    assert.deepEqual(declined.romance.records[person.id],refused,'Switching away and back cannot bypass a refusal cooldown');
    assert.equal(campus.handleAction(declined,'romance').events.length,0);
    campus.resolve(s,invite,invite.choices.find(c=>c.campusChoice==='ask'));
    assert.equal(s.romance.datingId,person.id);assert.equal(E.getRomanceRoster(s).filter(p=>p.dating).length,1);
    s.turn+=4;const date=campus.handleAction(s,'romance').events[0];assert.equal(date.id,'campus_romance_date');dates.add(date.description);
    const bound=copy(s);E.selectRomanceTarget(bound,other.id);const otherBefore=copy(bound.romance.records[other.id]);
    campus.resolve(bound,date,date.choices.find(c=>c.campusChoice==='walk'));
    assert.deepEqual(bound.romance.records[other.id],otherBefore,'A queued scene always affects the person it names');
    assert.ok(bound.romance.records[person.id].bond>s.romance.records[person.id].bond);
    Object.assign(bound.romance,{stage:'friendship',bond:70,meetings:7,lastEventTurn:bound.turn-5,lastConfessionTurn:-20});campus.migrate(bound);bound.turn+=4;
    const otherScene=campus.handleAction(bound,'romance').events[0];assert.equal(otherScene.id,'campus_romance_chat','Another friendship cannot become a second simultaneous relationship');
    assert.equal(E.getRomanceRoster(bound).filter(p=>p.dating).length,1);
    campus.resolve(s,date,date.choices.find(c=>c.campusChoice==='end'));
    assert.equal(s.romance.datingId,null);assert.equal(s.romance.records[person.id].stage,'ended');assert.ok(s.romance.records[person.id].cooldownUntil>s.turn);
  }
  assert.equal(encounters.size,6,'Each classmate has an individual first-meeting story');assert.equal(dates.size,6,'Each relationship has an individual date story');
  // Archived offerings are playable courses with provenance; choosing one earns real credit and major evidence.
  const catalogue=require('../dist/curriculum-systems.js').createAPI({}).catalog;
  const historical=catalogue.filter(c=>c.historical);
  assert.equal(new Set(catalogue.map(c=>c.id)).size,catalogue.length);
  assert.ok(historical.length>=14);
  assert.deepEqual(new Set(historical.map(c=>c.sourceYear)),new Set([2022,2024,2025]));
  for(const course of historical) {
    assert.ok(course.sourceURL.startsWith('https://gsa.jge.hs.kr/'));
    assert.ok(course.sourceDocumentURL&&course.scheduleNote);
    assert.ok(course.terms.every(term=>[3,4,5].includes(term)));
    assert.ok(['specialist','liberal','design'].includes(course.category));
  }
  const archived=toTurn(fresh('v8-historical-electives'),24);resolve(archived);
  const options=E.getEnrollmentOptions(archived),plan=E.recommendEnrollment(archived,'physics');
  function replaceCategory(category,id) {
    const old=plan.findIndex(courseId=>options.courses.find(c=>c.id===courseId)?.category===category&&options.courses.find(c=>c.id===courseId)?.credits===3);
    assert.ok(old>=0);plan[old]=id;
  }
  replaceCategory('specialist','historical_physics_inquiry');
  const liberal=plan.findIndex(id=>options.courses.find(c=>c.id===id)?.category==='liberal');assert.ok(liberal>=0);plan[liberal]='historical_humanities';
  replaceCategory('design','historical_organic_intro');
  assert.ok(E.validateEnrollment(archived,plan).valid);E.enrollSemester(archived,plan);
  const confirmed=copy(archived.curriculum.plans[3]);
  assert.deepEqual(E.migrate(copy(archived)).curriculum.plans[3],confirmed,'Historical plans remain identical after reload');
  const usedHistorical=['historical_physics_inquiry','historical_humanities','historical_organic_intro'];
  assert.ok(usedHistorical.every(id=>E.getSubjects(archived).some(c=>c.id===id)));
  assert.ok(usedHistorical.every(id=>!E.getCourseEvidence(archived).courses.some(c=>c.id===id)),'Registration alone does not award historical-course credit');
  toTurn(archived,32);resolve(archived);
  for(const id of usedHistorical){const course=archived.grades.at(-1).subjects.find(c=>c.id===id);assert.ok(course&&course.point>0,`${id} can be completed with the ordinary safe study strategy`);assert.ok(E.getCourseEvidence(archived).secondYearSecondTerm.some(c=>c.id===id));}
  assert.ok(E.getMajorOptions(archived).find(m=>m.id==='physics').unlocked,'The archived specialist course contributes to the selected major');
  for(const turn of [32,40]){if(archived.turn<turn)toTurn(archived,turn);resolve(archived);const o=E.getEnrollmentOptions(archived);assert.ok(usedHistorical.every(id=>!o.courses.some(c=>c.id===id)),'Previously completed historical courses cannot earn duplicate planned credit');E.enrollSemester(archived,E.recommendEnrollment(archived,'physics'));if(E.getPhase(archived).needsApplications)E.applyUniversities(archived,[{universityId:'gist',majorId:'physics'}]);}
  toTurn(archived,48);resolve(archived);assert.equal(archived.ending,'graduated');assert.ok(E.getCurriculumStatus(archived).complete);
  counters.v8HistoricalCourses=historical.length;
  counters.v8LegacyFixtures=legacy.length;counters.v8RomanceCandidates=roster.length;counters.v8Focused=true;
};
