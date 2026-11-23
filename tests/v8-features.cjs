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
    return clean;
  }

  // Actual v7 saves retain completed assessments, ongoing preparations, and an already selected event.
  for(const fixture of legacy) {
    // v0.13.2: 예전 8주 학기의 주차 기록은 7주 학기로 옮겨집니다.
    const before=(function walk(o){if(!o||typeof o!=='object')return o;for(const k of Object.keys(o)){if((k==='turn'||/Turn$/.test(k)||/Until$/.test(k))&&Number.isInteger(o[k])&&o[k]>=0&&o[k]<=48)o[k]=E.legacyWeekToNew(o[k]);else walk(o[k]);}return o;})(copy(fixture.state)), after=E.migrate(copy(fixture.state));
    assert.equal(after.turn,before.turn);
    assert.deepEqual(after.grades,before.grades,'Harder future exams never rewrite a saved transcript');
    assert.deepEqual(after.midterm,before.midterm,'A completed midterm keeps its saved marks');
    assert.deepEqual(after.semesterLearning,before.semesterLearning);
    assert.deepEqual(after.curriculum,before.curriculum,'A confirmed old course plan is retained');
    if(before.pendingEvent) assert.deepEqual(oldEventContent(after.pendingEvent),oldEventContent(before.pendingEvent),'Migration does not replace an unresolved choice');
    assert.deepEqual(E.migrate(copy(after)),after,'v7 migration is idempotent');
  }

  // Captain and council have distinct real transition boundaries; completed service remains an achievement.
  for(const t of [31,32,39,40]) {
    const before=saved(`v7-turn-${t}-roles`), s=E.migrate(copy(before));
    assert.equal(s.captain,t<32,`Captain is only active before turn32 (${t})`);
    assert.equal(s.captainClub,t<32?before.captainClub:null);
    const tenure=s.captainHistory.find(h=>h.passed);
    assert.ok(tenure&&tenure.club===before.captainClub);
    assert.equal(tenure.selectedTurn,14);
    assert.equal(tenure.endedTurn,t<32?null:28);
    assert.ok(s.badges.includes(`${before.captainClub} 기장`),'The captain achievement is not erased');
    assert.equal(s.councilRole,t<40?before.councilRole:'일반 학생','Council remains active throughout third-year first semester');
    assert.equal(s.councilHistory.filter(h=>h.passed).length,before.councilHistory.filter(h=>h.passed).length);
  }
  const before32=E.migrate(saved('v7-turn-31-roles')), transcript=copy(before32.grades);
  const currentMidterm=copy(before32.midterm);
  E.advance(before32,'rest'); resolve(before32);
  assert.equal(before32.turn,28); assert.equal(before32.captain,false); assert.equal(before32.captainClub,null);
  assert.equal(before32.councilRole,'학생회 회장');
  assert.deepEqual(before32.grades.slice(0,-1),transcript);
  assert.deepEqual(before32.grades.at(-1).subjects.map(c=>c.id),currentMidterm.map(c=>c.id),'The in-progress saved semester finishes its original subjects');
  const before40=E.migrate(saved('v7-turn-39-roles'));
  E.advance(before40,'rest'); resolve(before40);
  assert.equal(before40.turn,35); assert.equal(before40.councilRole,'일반 학생');
  const lastCouncil=before40.councilHistory.filter(h=>h.passed).at(-1);
  assert.equal(lastCouncil.endedTurn,35);
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
  check(balanced.newMean>=90&&balanced.newGPA>=3.8&&balanced.newGPA<4.25,'Ordinary first-semester students usually earn high grades without automatic perfect scores');
  check(balanced.newGPA<studied.newGPA&&difficulty.recovery.newGPA>=3.4,'Focused study remains stronger while normal recovery does not imply failure');
  check(studied.newMean>balanced.newMean+5&&studied.newGPA>=4.2,'Sustained study still produces materially better grades');
  assert.deepEqual(E.getGrade(90),['A+',4.3]);assert.deepEqual(E.getGrade(89.9),['A0',4]);assert.deepEqual(E.getGrade(40),['D0',1]);assert.deepEqual(E.getGrade(39.9),['F',0]);
  counters.v8Difficulty=difficulty;

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
  const archived=toTurn(fresh('v8-historical-electives'),21);resolve(archived);
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
  toTurn(archived,28);resolve(archived);
  for(const id of usedHistorical){const course=archived.grades.at(-1).subjects.find(c=>c.id===id);assert.ok(course&&course.point>0,`${id} can be completed with the ordinary safe study strategy`);assert.ok(E.getCourseEvidence(archived).secondYearSecondTerm.some(c=>c.id===id));}
  assert.ok(E.getMajorOptions(archived).find(m=>m.id==='physics').unlocked,'The archived specialist course contributes to the selected major');
  for(const turn of [28,35]){if(archived.turn<turn)toTurn(archived,turn);resolve(archived);const o=E.getEnrollmentOptions(archived);assert.ok(usedHistorical.every(id=>!o.courses.some(c=>c.id===id)),'Previously completed historical courses cannot earn duplicate planned credit');E.enrollSemester(archived,E.recommendEnrollment(archived,'physics'));if(E.getPhase(archived).needsApplications)E.applyUniversities(archived,[{universityId:'gist',majorId:'physics'}]);}
  toTurn(archived,42);resolve(archived);assert.equal(archived.ending,'graduated');assert.ok(E.getCurriculumStatus(archived).complete);
  counters.v8HistoricalCourses=historical.length;
  counters.v8LegacyFixtures=legacy.length;counters.v8Focused=true;
};
