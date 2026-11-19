'use strict';
const assert = require('node:assert/strict');

module.exports = function verifyV6(ctx) {
  const {E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead} = ctx;
  function rejectUnchanged(s, action, label) {
    const before=copy(s); assert.throws(action,label); assert.deepEqual(s,before,`${label}: no partial mutation`);
  }
  function chooseRoute(s, field) {
    const ids=E.recommendEnrollment(s,field);
    assert.ok(Array.isArray(ids)&&ids.every(id=>typeof id==='string'));
    const validation=E.validateEnrollment(s,ids);
    assert.equal(validation.valid,true,`${field} recommended route meets enrollment constraints`);
    E.enrollSemester(s,ids); return ids;
  }

  // Each of three enrollment windows records its own chosen subjects and rejects invalid plans atomically.
  const beforeEnrollment=fresh(6101); resolve(beforeEnrollment);
  rejectUnchanged(beforeEnrollment,()=>E.enrollSemester(beforeEnrollment,[]),'Enrollment is unavailable before year two semester two');
  const curriculum=toTurn(fresh(6102),24); resolve(curriculum);
  const plans=[];
  for(const turn of [24,32,40]) {
    if(curriculum.turn<turn)toTurn(curriculum,turn);
    resolve(curriculum);
    assert.ok(E.needsEnrollment(curriculum));
    assert.throws(()=>E.simulateWeek(curriculum,'balanced'),'The next semester cannot start without enrollment');
    const options=E.getEnrollmentOptions(curriculum), suggested=E.recommendEnrollment(curriculum,'physics');
    assert.equal(options.term,turn/8);
    rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[]),'An empty course plan is invalid');
    rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[...suggested,suggested[0]]),'Duplicate course IDs are invalid');
    rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[...suggested,'invented-course']),'Unknown course IDs are invalid');
    const designIds=options.courses.filter(c=>c.category==='design').map(c=>c.id);
    const allSpecialists=options.courses.filter(c=>c.category==='specialist');
    if(allSpecialists.reduce((n,c)=>n+c.credits,0)>16) rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[...new Set([...suggested,...allSpecialists.map(c=>c.id)])]),'Specialist credit cap is enforced');
    if(turn<40){const future=copy(curriculum);future.turn=turn+8;const futureOnly=E.getEnrollmentOptions(future).courses.find(c=>!options.courses.some(now=>now.id===c.id));if(futureOnly)rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[...suggested,futureOnly.id]),'Courses from a later semester are invalid');}
    if(turn<40) {
      rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,suggested.filter(id=>!designIds.includes(id))),'First two plans require a design course');
      const secondDesign=designIds.find(id=>!suggested.includes(id));
      if(secondDesign) rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,[...suggested,secondDesign]),'Two design courses exceed the semester requirement');
    }
    const rngBefore=curriculum.rng;
    const ids=chooseRoute(curriculum,'physics'); plans.push({turn,ids:[...ids],options:copy(options)});
    assert.equal(curriculum.rng,rngBefore,'Enrollment does not reroll any outcome');
    assert.equal(E.needsEnrollment(curriculum),false);
    rejectUnchanged(curriculum,()=>E.enrollSemester(curriculum,ids),'Confirmed semester choices cannot be rerolled');
    const expected=new Set([...ids,...options.requiredCourses.map(c=>c.id)]);
    assert.deepEqual(new Set(E.getSubjects(curriculum).map(c=>c.id)),expected,'Only chosen and required courses appear in the semester');
    if(E.getPhase(curriculum).needsApplications)E.applyUniversities(curriculum,['gist']);
  }
  const plannedIds=plans.flatMap(p=>p.ids);assert.equal(new Set(plannedIds).size,plannedIds.length,'Stable course IDs cannot earn duplicate planned credits across terms');
  toTurn(curriculum,48); resolve(curriculum);
  for(const plan of plans) {
    const term=plan.turn/8;
    const grade=curriculum.grades.find(g=>(g.year-1)*2+g.semester-1===term);
    const expected=new Set([...plan.ids,...plan.options.requiredCourses.map(c=>c.id)]);
    assert.deepEqual(new Set([...grade.subjects,...(grade.passFail||[])].map(c=>c.id)),expected,'Semester grades never include an unselected elective');
    assert.ok((grade.passFail||[]).every(c=>c.field==='research'&&['P','F'].includes(c.grade)),'Research courses are pass/fail and stay out of the GPA');
  }

  // Enrolling is not evidence of completing a course; failed courses never earn category credit.
  const failing=toTurn(fresh(6110),24); resolve(failing); chooseRoute(failing,'physics');
  assert.equal(E.getCourseEvidence(failing).secondYearSecondTerm.length,0,'A planned course cannot unlock a major');
  assert.equal(E.getMajorOptions(failing).find(m=>m.id==='physics').unlocked,false);
  toTurn(failing,31); ready(failing);
  failing.semesterLearning={};
  failing.midterm=E.getSubjects(failing).map(c=>({...c,score:0}));
  failing.stats.intelligence=0; failing.stats.discipline=0; failing.stats.research=0;
  // v0.13: 수행평가는 사건이 없으면 만점이라, 낙제를 재현하려면 수행평가도 모두 놓친 상황을 만듭니다.
  failing.performanceDeductions={'*':100};
  const earnedBefore=copy(E.getCurriculumStatus(failing).earned);
  E.advance(failing,'rest'); resolve(failing);
  const failedSemester=failing.grades.at(-1);
  assert.ok(failedSemester.subjects.every(c=>c.point===0),'Controlled failed exams produce an F transcript');
  assert.equal(failedSemester.earnedCredits,0);
  assert.deepEqual(E.getCurriculumStatus(failing).earned,earnedBefore,'Failed enrolled credits do not count toward graduation');
  assert.equal(E.getCourseEvidence(failing).secondYearSecondTerm.length,0);
  assert.equal(E.getMajorOptions(failing).find(m=>m.id==='physics').unlocked,false,'F grades do not unlock the selected field');

  // Major eligibility reflects the actual second-year-second-semester route.
  function makeApplicant(field,seed) {
    const s=toTurn(fresh(seed),24); resolve(s); chooseRoute(s,field);
    toTurn(s,32); resolve(s); return s;
  }
  const physical=makeApplicant('physics',6120),chemical=makeApplicant('chemistry',6121);
  const physicsMajors=E.getMajorOptions(physical),chemistryMajors=E.getMajorOptions(chemical);
  assert.ok(physicsMajors.find(m=>m.id==='physics').unlocked);
  assert.ok(!physicsMajors.find(m=>m.id==='chemistry').unlocked);
  assert.ok(chemistryMajors.find(m=>m.id==='chemistry').unlocked);
  assert.ok(!chemistryMajors.find(m=>m.id==='physics').unlocked);
  rejectUnchanged(physical,()=>E.applyUniversities(physical,[{universityId:'gist',majorId:'physics'}]),'Third-year course registration precedes applications');
  chooseRoute(physical,'physics');
  for(const invalid of [
    [],
    [{universityId:'missing',majorId:'general'}],
    [{universityId:'gist',majorId:'missing'}],
    [{universityId:'gist',majorId:'chemistry'}],
    [{universityId:'gist'}],
    [{universityId:'gist',majorId:''}],
    [{universityId:'gist',majorId:'physics'},{universityId:'gist',majorId:'math'}],
    ['seoul','yonsei','korea','postech','sogang','hanyang','chungang'].map(universityId=>({universityId,majorId:'general'})),
    [{universityId:'chonnam',majorId:'general'}]
  ]) rejectUnchanged(physical,()=>E.applyUniversities(physical,invalid),'Invalid university-major application');
  const entries=[{universityId:'gist',majorId:'physics'},{universityId:'kaist',majorId:'math'}];
  E.applyUniversities(physical,entries);
  assert.deepEqual(physical.applications,['gist','kaist']);
  assert.deepEqual(physical.applicationMajors,{gist:'physics',kaist:'math'});
  const snapshot=copy(physical.majorSnapshot);
  entries[0].majorId='chemistry';
  assert.deepEqual(physical.majorSnapshot,snapshot,'Caller mutations cannot rewrite submitted eligibility');
  assert.ok(Object.isFrozen(physical.majorSnapshot));
  toTurn(physical,36);
  seek(physical,'university_interview');
  const firstQuestion=E.getMajorInterviewQuestion('physics');
  assert.ok(physical.pendingEvent.description.includes(firstQuestion.question),'The first interview question follows the selected major');
  const pendingInterview=E.migrate(copy(physical));
  E.chooseEvent(physical,0);E.chooseEvent(pendingInterview,0);
  assert.deepEqual(pendingInterview,physical,'Major-specific interviews survive reload');
  resolve(physical);toTurn(physical,39);resolve(physical);
  assert.deepEqual(physical.majorSnapshot,snapshot,'Later grades and activities cannot alter submitted major evidence');
  assert.deepEqual(physical.universityInterviews.map(i=>i.majorId),['physics','math']);
  assert.deepEqual(physical.admissions.map(a=>a.majorId),['physics','math']);

  // New graduation requirements are counted by category, and make-up work never rewrites the transcript.
  const required={specialist:28,liberal:4,design:6};
  assert.deepEqual(E.getCurriculumStatus(curriculum).required,required);
  for(const [category,credits] of Object.entries(required)) assert.ok(E.getCurriculumStatus(curriculum).earned[category]>=credits);
  assert.ok(E.getCurriculumStatus(curriculum).complete);
  toTurn(failing,48);resolve(failing);
  failing.toeic.best=730;
  assert.equal(E.getFieldStatus(failing).total,6);
  assert.ok(!E.getCurriculumStatus(failing).complete);
  assert.equal(E.getGraduationStatus(failing).eligible,false);
  assert.equal(failing.ending,'deferred');
  const transcriptBeforeMakeup=copy(failing.grades),makeupStart=failing.extraWeeks;
  let makeupCount=0;
  while(!E.getCurriculumStatus(failing).complete&&makeupCount++<30) {
    if(failing.stats.fatigue>65||failing.stats.stress>70){E.prepareToeic(failing);resolve(failing);}
    const options=E.getCourseMakeupOptions(failing);
    assert.ok(options.length,'A missing category has an attainable make-up option');
    const rng=failing.rng;
    E.makeupCourse(failing,options[0].id);resolve(failing);
    assert.equal(failing.rng,rng,'Make-up completion cannot reroll random events');
    rejectUnchanged(failing,()=>E.makeupCourse(failing,options[0].id),'A make-up course cannot earn credit twice');
  }
  assert.ok(E.getCurriculumStatus(failing).complete);
  assert.equal(failing.ending,'graduated');
  assert.equal(E.getCourseEvidence(failing).secondYearSecondTerm.length,0,'Late make-up credits cannot fabricate second-year major eligibility');
  assert.ok(failing.extraWeeks>makeupStart);
  assert.deepEqual(failing.grades,transcriptBeforeMakeup,'Make-up records do not replace old F grades');
  rejectUnchanged(failing,()=>E.makeupCourse(failing),'Graduation blocks repeated make-up credit');

  // Legacy lives retain their ongoing exams and events; previously graduated v4/v5 lives stay graduated.
  for(const fixture of fixtures) {
    const old=fixture.state,migrated=E.migrate(copy(old));
    assert.deepEqual(migrated.grades,old.grades);
    assert.deepEqual(migrated.midterm,old.midterm,'An in-progress midterm is not regenerated');
    assert.deepEqual(migrated.semesterLearning,old.semesterLearning,'Accumulated semester learning is retained');
    if(old.version>=4&&old.ending==='graduated') {
      assert.equal(migrated.ending,'graduated');
      assert.ok(E.getCurriculumStatus(migrated).legacyExempt);
    }
    if(old.version===5&&old.midterm) {
      assert.deepEqual(E.getSubjects(migrated).map(c=>[c.id,c.credits]),old.midterm.map(c=>[c.id,c.credits]),'Old active semester retains its course list');
    }
    if(old.version===5&&old.pendingEvent) {
      const preserved=copy(migrated.pendingEvent);
      if(/^campus_romance_/.test(preserved.id)){delete preserved.characterId;delete preserved.characterName;delete preserved.portraitIndex;}
      assert.deepEqual(preserved,old.pendingEvent,'Existing selected events are not replaced; romance only gains stable person identity');
    }
  }

  // Actual elective cohorts, including liberal and design classes, are finite and deterministic.
  const schoolAPI=require('../dist/school-systems.js').createAPI({});
  const laterGrades=curriculum.grades.filter(g=>(g.year-1)*2+g.semester-1>=3);
  for(const category of ['specialist','liberal','design']) {
    const grade=laterGrades.find(g=>g.subjects.some(c=>c.category===category));
    const subject=grade.subjects.find(c=>c.category===category),term=(grade.year-1)*2+grade.semester-1;
    const roster=schoolAPI.getEnrollment(curriculum,subject,term);
    assert.ok(roster.length>0&&roster.length<curriculum.school.cohortSize);
    assert.ok(roster.some(m=>m.id==='player'));
    assert.equal(new Set(roster.map(m=>m.id)).size,roster.length);
    const loaded=copy(curriculum);loaded.rng=1;
    assert.deepEqual(schoolAPI.getEnrollment(loaded,subject,term),roster,'Cohort membership does not reroll on load');
    const result=curriculum.school.termResults.find(r=>r.term===term).subjects.find(c=>c.id===subject.id);
    assert.equal(result.enrollment,roster.length);
    assert.equal(result.recipients.length,Math.ceil(roster.length*.05));
    assert.ok(result.recipients.every(r=>roster.some(m=>m.id===r.id)));
  }

  // Each published recommendation can finish school and apply to its corresponding major.
  const knownRoutes={math:'math',physics:'physics',chemistry:'chemistry',biology:'biology',earth:'earth',ai:'computer'};
  const routeResults=[];
  for(const [field,majorId] of Object.entries(knownRoutes)) {
    const s=fresh(`route-${field}`); s.stats.intelligence=80; s.stats.discipline=80;
    while(s.turn<48&&s.alive) {
      resolve(s);
      if(!s.alive)break;
      if(E.needsEnrollment(s))chooseRoute(s,field);
      if(E.getPhase(s).needsApplications) {
        assert.ok(E.getMajorOptions(s).find(m=>m.id===majorId).unlocked,`${field} route unlocks its named major`);
        E.applyUniversities(s,[{universityId:'gist',majorId}]);
      }
      resolve(s);
      const focus=s.stats.fatigue>55||s.stats.stress>65||s.illnessWeeks?'recovery':s.toeic.best<730?'english':'balanced';
      const commitment=s.turn>=32&&E.getFieldStatus(s).canIndependent?'fieldresearch':s.turn>=8&&s.toeic.best<730&&s.toeic.practice>=5?'toeic':null;
      E.simulateWeek(s,focus,'normal',commitment);
    }
    resolve(s);
    assert.equal(s.turn,48);
    assert.equal(s.ending,'graduated',`${field} route reaches graduation with a safe strategy`);
    assert.equal(s.admissions[0].majorId,majorId);
    assert.ok(E.getCurriculumStatus(s).complete);
    routeResults.push({field,majorId,earned:E.getCurriculumStatus(s).earned});
  }
  counters.knownRoutes=routeResults;

  // Death blocks all new mutation entry points.
  rejectUnchanged(dead,()=>E.enrollSemester(dead,[]),'Dead stories cannot enroll');
  rejectUnchanged(dead,()=>E.makeupCourse(dead),'Dead stories cannot take make-up courses');
  counters.v6Focused=true;
};
