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
  Object.assign(base.stats,{intelligence:60,discipline:60,luck:50,health:100,resilience:100,social:100,fatigue:0,stress:0});
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
      while(s.alive&&s.turn<48) {
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
        if(s.turn>=32&&E.getFieldStatus(s).canIndependent)commitment='fieldresearch';
        else if(s.turn>=32&&s.toeic.best<730)commitment='toeic';
        E.simulateWeek(s,focus,mode,commitment);
      }
      settle(s);assert.ok(s.alive&&s.turn===48,'Ordinary study plus recovery completes school safely');
      runs.push({gpa:E.getProfile(s).gpa,application:s.applicationSnapshot.gpa});
    }
    results[policy]={median:median(runs.map(r=>r.gpa)),applicationMedian:median(runs.map(r=>r.application)),mean:runs.reduce((sum,r)=>sum+r.gpa,0)/runs.length};
  }
  assert.ok(results.moderate.median>=3.85&&results.moderate.median<=4.15,'One focused study week out of four targets about4.0');
  assert.ok(results.moderate.applicationMedian>=3.75,'Moderate preparation is also reflected before college applications');
  for(const mode of ['night','dawn','both'])assert.ok(results[mode].mean>results.moderate.mean+.05,`${mode} improves complete-run grades with sensible recovery`);
  assert.ok(results.intensive.median>results.moderate.median+.1&&results.intensive.median<4.3,'Intensive study is rewarded without a guaranteed perfect transcript');
  assert.ok(results.recovery.median<results.moderate.median-.3,'Choosing rest throughout has an academic opportunity cost');
  assert.ok(results.giftedLucky.median>=4&&results.giftedLucky.median<4.3,'High intelligence and favorable luck can support a4.0-level record');
  assert.deepEqual(E.getGrade(90),['A+',4.3]);assert.deepEqual(E.getGrade(85),['A0',4]);
  if(ctx.counters)ctx.counters.v10Grades={seeds:32,policies:7,marks,results};
  return {seeds:32,policies:7,marks,results};
}
module.exports=verifyV10Grades;
if(require.main===module)console.log(JSON.stringify(verifyV10Grades(),null,2));
