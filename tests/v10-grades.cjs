'use strict';
const assert = require('node:assert/strict');
const defaultEngine = require('../dist/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const median = values => [...values].sort((a,b)=>a-b)[Math.floor((values.length-1)/2)];

function verifyV10Grades(ctx = {}) {
  const E = ctx.E || defaultEngine;
  const settle = s => {
    let guard = 0;
    while (s.pendingEvent && s.alive) {
      assert.ok(++guard < 100, 'Every scheduled event remains resolvable');
      E.chooseEvent(s, 0);
    }
  };
  const ready = s => {
    settle(s);
    if (E.needsEnrollment(s)) E.enrollSemester(s,E.recommendEnrollment(s,'physics'));
    if (E.getPhase(s).needsApplications) E.applyUniversities(s,['kaist','gist','dgist']);
    settle(s);
  };

  // Compare the same exam and same random draw, changing only the extra study.
  // Existing illness and overload risks remain part of the complete-run tests below.
  const base = E.create('동일 시험 비교','v10-study-modes',{gender:'male'});
  E.setClubs(base,'physics','none'); settle(base); base.turn=3;
  Object.assign(base.stats,{intelligence:60,discipline:60,luck:50,health:100,resilience:100,social:100,fatigue:30,stress:20});
  base.illnessWeeks=0; base.dormHarmony=100;
  for(const subject of E.getSubjects(base)) base.semesterLearning[subject.id]=12;
  const marks={},loads={};
  for(const mode of ['normal','night','dawn','both']) {
    const s=copy(base); E.simulateWeek(s,'balanced',mode);
    marks[mode]=s.midterm.reduce((sum,c)=>sum+c.score,0)/s.midterm.length;
    loads[mode]={fatigue:s.stats.fatigue,stress:s.stats.stress};
  }
  assert.ok(marks.night>marks.normal+2,'Night study measurably improves an equally prepared exam');
  assert.ok(marks.dawn>marks.normal+1.5,'Dawn study measurably improves an equally prepared exam');
  assert.ok(marks.both>Math.max(marks.night,marks.dawn),'Combining extra study helps when the student is rested');
  assert.ok(loads.night.fatigue>loads.normal.fatigue&&loads.dawn.fatigue>loads.normal.fatigue,'Extra study still costs fatigue');
  assert.ok(loads.both.stress>loads.night.stress,'The strongest schedule still has its strain tradeoff');
  const lowerAbility=copy(base),higherAbility=copy(base),lucky=copy(base);
  higherAbility.stats.intelligence=100; lucky.stats.intelligence=100;lucky.stats.luck=90;
  for(const s of [lowerAbility,higherAbility,lucky]) E.simulateWeek(s,'balanced','normal');
  const avg=s=>s.midterm.reduce((sum,c)=>sum+c.score,0)/s.midterm.length;
  assert.ok(avg(higherAbility)>avg(lowerAbility),'Intelligence improves performance for identical preparation');
  assert.ok(avg(lucky)>avg(higherAbility),'Favorable luck improves the same high-intelligence exam');

  const results={};
  for(const policy of ['moderate','night','dawn','both','intensive','recovery','giftedLucky']) {
    const runs=[];
    for(let seed=1;seed<=32;seed++) {
      const s=E.create('학업 균형 확인',seed,{gender:'male'});E.setClubs(s,'physics','none');
      if(policy==='giftedLucky'){s.stats.intelligence=100;s.stats.luck=90;}
      while(s.alive&&s.turn<42) {
        ready(s);
        let focus=policy==='intensive'?'intelligence':policy==='recovery'?'recovery':policy==='giftedLucky'?'balanced':s.turn%4===1?'intelligence':'balanced';
        if(s.stats.fatigue>60||s.stats.stress>65||s.illnessWeeks)focus='recovery';
        const phase=E.getPhase(s);let mode='normal';
        if(focus!=='recovery'&&s.stats.fatigue<45) {
          if((policy==='night'||policy==='intensive')&&phase.nightAvailable)mode='night';
          if(policy==='dawn'&&phase.dawnAvailable)mode='dawn';
          if(policy==='both')mode=phase.dawnAvailable?'both':phase.nightAvailable?'night':'normal';
        }
        let commitment=null;
        if(s.turn>=28&&E.getFieldStatus(s).canIndependent)commitment='fieldresearch';
        else if(s.turn>=28&&s.toeic.best<730)commitment='toeic';
        s.studyPlanner=null; // v0.13: 플래너 대신 정책이 정한 자습만 비교합니다.
        E.simulateWeek(s,focus,mode,commitment);
      }
      settle(s);assert.ok(s.alive&&s.turn===42,'Ordinary study plus recovery completes school safely');
      runs.push({gpa:E.getProfile(s).gpa,application:s.applicationSnapshot.gpa});
    }
    results[policy]={median:median(runs.map(r=>r.gpa)),applicationMedian:median(runs.map(r=>r.application)),mean:runs.reduce((sum,r)=>sum+r.gpa,0)/runs.length};
  }
  if(process.env.SHOW_GRADES)console.log(JSON.stringify(results));
  // v0.14.2: 학기별 급격한 난도 상승을 없애 보통 공부의 누적 평점 목표를 약 4.0으로 조정합니다.
  // 구 버전의 3.85 목표를 그대로 적용하면 의도한 난도 완화가 테스트를 부당하게 실패시킵니다.
  assert.ok(results.moderate.median>=3.78&&results.moderate.median<=4.05,'Moderate study with optional competition commitments stays in the upper-3 GPA range');
  assert.ok(results.recovery.median>=3.50&&results.recovery.median<=3.75,'Recovery-only transcripts reflect the new late-semester 3.80 floor without reaching balanced-study GPA');
  const msBases=Array.from({length:6},(_,i)=>E.EXAM_SHAPE[i].ms[0]);
  const genBases=Array.from({length:6},(_,i)=>E.EXAM_SHAPE[i].gen[0]);
  assert.deepEqual(msBases,[76.5,73.8,73,74.7,74,82.8],'Later terms become easier, especially semester 3-2');
  assert.deepEqual(genBases,[79.5,76.9,76.3,78.2,77.6,86.5],'All general courses follow the new term calibration');
  // v0.14.7: 1-1 역시 6학기 공통 기준을 사용하며 지능·공부 격차를 검증합니다.
  // 과목 점수 계산을 정상 실행하며 GPA 숫자를 강제로 올리지 않습니다.
  const firstTerm = {};
  for(const policy of ['recovery','nonstudy','moderate','intensive']) {
    const gpas=[];
    for(let seed=1;seed<=128;seed++) {
      const s=E.create('첫학기 저점 검증',seed,{gender:'male'});
      E.setClubs(s,'physics','none');
      while(s.alive&&s.turn<7) {
        ready(s);
        let focus=policy==='intensive'?'intelligence':policy==='recovery'?'recovery':policy==='nonstudy'?'social':s.turn%4===1?'intelligence':'balanced';
        if(s.stats.fatigue>60||s.stats.stress>65||s.illnessWeeks)focus='recovery';
        const phase=E.getPhase(s);let mode='normal';
        if(policy==='intensive'&&focus!=='recovery'&&s.stats.fatigue<45&&phase.nightAvailable)mode='night';
        s.studyPlanner=null;
        E.simulateWeek(s,focus,mode);
      }
      settle(s);
      assert.equal(s.grades.length,1,'A complete first term produces one GPA');
      gpas.push(s.grades[0].gpa);
    }
    firstTerm[policy]={median:median(gpas),lowRate:gpas.filter(g=>g<3.4).length/gpas.length};
  }
  if(process.env.SHOW_GRADES)console.log('firstTerm',JSON.stringify(firstTerm));
  assert.ok(firstTerm.recovery.median>=3.2&&firstTerm.recovery.median<=3.6,'Recovery-only first semester stays near 3.4, not automatic 4.0');
  assert.ok(firstTerm.nonstudy.median>=3.25&&firstTerm.nonstudy.median<=3.7,'Very little study and normal intelligence stays around 3.4');
  assert.ok(firstTerm.moderate.median>=firstTerm.nonstudy.median+.2,'First-term studying still earns a meaningful academic advantage');
  assert.ok(firstTerm.intensive.median>=firstTerm.moderate.median+.2,'First-term intensive studying remains worthwhile');
  assert.ok(results.moderate.applicationMedian>=3.65,'Moderate preparation is also reflected before college applications');
  // v0.13: 자습은 조금 너프했지만 여전히 이득이어야 합니다.
  for(const mode of ['night','dawn','both'])assert.ok(results[mode].mean>results.moderate.mean+.02,`${mode} improves complete-run grades with sensible recovery`);
  assert.ok(results.intensive.median>results.moderate.median+.1&&results.intensive.median<4.3,'Intensive study is rewarded without a guaranteed perfect transcript');
  assert.ok(results.recovery.median<results.moderate.median-.18,'Choosing rest throughout has an academic opportunity cost despite the term GPA safety net');
  assert.ok(results.giftedLucky.median>=3.9&&results.giftedLucky.median<4.3,'High intelligence and favorable luck can support a4.0-level record');
  assert.deepEqual(E.getGrade(90),['A+',4.3]);assert.deepEqual(E.getGrade(85),['A0',4]);
  if(ctx.counters)ctx.counters.v10Grades={seeds:32,policies:7,marks,results,firstTerm};
  return {seeds:32,policies:7,marks,results};
}
module.exports=verifyV10Grades;
if(require.main===module)console.log(JSON.stringify(verifyV10Grades(),null,2));
