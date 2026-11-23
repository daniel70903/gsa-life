'use strict';
// v0.14.9: verify all-term GPA differentiation and extracurricular time costs.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const N = 64;
const copy = o => JSON.parse(JSON.stringify(o));
const median = a => [...a].sort((x,y)=>x-y)[Math.floor((a.length-1)/2)];
const settle = s => {let guard=0;while(s.pendingEvent&&s.alive){
  assert.ok(++guard<100);const e=s.pendingEvent;let index=0;
  if (e.contestId && e.choices.some(c=>c.contestPrep==='skip')) index=e.choices.findIndex(c=>c.contestPrep==='skip');
  if (e.id==='olympiad' && e.choices.some(c=>c.skipOlympiad)) index=e.choices.findIndex(c=>c.skipOlympiad);
  E.chooseEvent(s,index);
}};
const prepare = s => {settle(s);if(E.needsEnrollment(s))E.enrollSemester(s,E.recommendEnrollment(s,'physics'));if(E.getPhase(s).needsApplications)E.applyUniversities(s,['kaist','gist','dgist']);settle(s);};
function simulate(policy,seed){
  const s=E.create('여섯 학기 학점 검증',seed,{gender:'male'});
  E.setClubs(s,'physics','none');
  const fixedSocial=policy==='social35'||policy==='social50'||policy==='social70';
  const fixedIntelligence=fixedSocial?Number(policy.slice(6)):null;
  if(fixedSocial)s.stats.intelligence=fixedIntelligence;
  while(s.alive&&s.turn<42){
    prepare(s);
    const week=s.turn%7+1,phase=E.getPhase(s);
    let focus;
    if(fixedSocial)focus='social';
    else if(policy==='lateint2')focus=[3,4,6,7].includes(week)?'intelligence':'recovery';
    else focus='intelligence';
    if(policy==='int_both_safe'&&(s.stats.fatigue>60||s.stats.stress>65||s.illnessWeeks))focus='recovery';
    const mode=policy==='int_night_strict' ? (phase.nightAvailable?'night':'normal')
      : (policy==='int_both_safe'||policy==='int_both_strict')&&focus!=='recovery'
      ? (phase.dawnAvailable?'both':phase.nightAvailable?'night':'normal') : 'normal';
    // Isolate the chosen strategy from the UI's saved planner preset.
    s.studyPlanner=null;
    E.simulateWeek(s,focus,mode);
    if(fixedSocial)s.stats.intelligence=fixedIntelligence;
  }
  settle(s);
  assert.equal(s.grades.length,6,`All semesters complete for ${policy} seed ${seed}`);
  return s.grades.map(g=>g.gpa);
}
const strategies=['social35','social50','social70','lateint2','int_normal','int_night_strict','int_both_strict'];
const data=Object.fromEntries(strategies.map(p=>[p,Array.from({length:N},(_,i)=>simulate(p,i+1))]));
const cumulative=a=>+(a.reduce((sum,x)=>sum+x,0)/6).toFixed(2);
const summary=Object.fromEntries(strategies.map(p=>[p,{
  median:median(data[p].map(cumulative)),
  terms:Array.from({length:6},(_,term)=>median(data[p].map(v=>v[term])))
}]));
const perfectRate=data.int_both_strict.filter(row=>cumulative(row)>=4.295).length/N;
if(process.env.SHOW_GRADES) console.log(JSON.stringify({summary,perfectRate},null,2));
assert.ok(summary.social50.median>=3.60&&summary.social50.median<=3.80,'The 2-2 onward 3.80 safety net raises the cumulative low-intelligence baseline');
assert.ok(summary.social35.median<=summary.social50.median&&summary.social35.terms[0]<=summary.social50.terms[0]-0.05,'Lower intelligence still matters in the uncapped first semester');
assert.ok(summary.social70.median>=summary.social50.median+0.12,'Higher intelligence receives a higher GPA');
assert.ok(summary.lateint2.median>=3.90&&summary.lateint2.median<=4.15,'Exam-period intelligence investment earns approximately 4.0');
assert.ok(summary.int_normal.median>=4.13&&summary.int_normal.median<=4.22,'A full intelligence schedule with no extra study earns approximately 4.18');
assert.ok(summary.int_night_strict.median>=4.20&&summary.int_night_strict.median<=4.28,'Night study alone remains near 4.25');
assert.ok(summary.int_both_strict.median>=4.27,'Combined night and dawn is still the strongest intelligence-100 path');
assert.ok(summary.int_normal.median>=summary.lateint2.median+0.05,'Full-term effort remains superior to last-minute study');
assert.ok(perfectRate>=0.20&&perfectRate<=0.65,'Even an optimized path should not guarantee a perfect cumulative GPA');
for(const g of summary.social50.terms)assert.ok(g>=3.15&&g<=3.90,'All semesters retain a reasonable baseline, with a generous 3-2');
const ms=Array.from({length:6},(_,i)=>E.EXAM_SHAPE[i].ms[0]);
const gen=Array.from({length:6},(_,i)=>E.EXAM_SHAPE[i].gen[0]);
assert.ok(ms[3]>ms[2]&&ms[4]>ms[2]&&ms[5]>ms[4]+5,'Math/science gets easier in later semesters, especially 3-2');
assert.ok(gen[3]>gen[2]&&gen[4]>gen[2]&&gen[5]>gen[4]+5,'General courses get easier in later semesters, especially 3-2');
// Compare identical exams and RNG draws, changing only the history of focused + late/dawn study.
const base=E.create('학습 시너지 검사','v0146-synthesis',{gender:'male'});
E.setClubs(base,'physics','none');settle(base);base.turn=3;
Object.assign(base.stats,{intelligence:60,discipline:60,fatigue:0,stress:0,health:100,resilience:90});
for(const sub of E.getSubjects(base))base.semesterLearning[sub.id]=14;
const plain=copy(base),intense=copy(base),rested=copy(base);
intense.examIntelligenceWeeks=3;intense.examNightUnits=2;intense.examDawnUnits=1;
rested.examIntelligenceWeeks=0;rested.examNightUnits=2;rested.examDawnUnits=1;
for(const s of [plain,intense])E.simulateWeek(s,'balanced','normal');
E.simulateWeek(rested,'balanced','normal');
const avg=s=>s.midterm.reduce((sum,x)=>sum+x.score,0)/s.midterm.length;
assert.ok(avg(intense)>avg(plain)+2,'Combined sustained intelligence focus and exam-study commitment still improve exam preparation');
assert.equal(avg(rested),avg(plain),'Extra study alone, without intelligence investment, does not get the combined-study synthesis');
console.log(JSON.stringify({result:'pass',seeds:N,summary,perfectRate:Math.round(perfectRate*1000)/10}));
