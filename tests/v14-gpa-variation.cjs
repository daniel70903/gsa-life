'use strict';
// The reported term GPA has a small repeatable random component.  Academic
// investment remains the primary driver and the same settled GPA is used
// by admission, ranking, cumulative profile and retrospective UI.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const R = require('../dist/retrospective-data.js');
const copy = x => JSON.parse(JSON.stringify(x));
const settle = s => { let guard=0; while(s.pendingEvent&&s.alive){assert.ok(++guard<120);E.chooseEvent(s,0);} };
const semester = seed => {
  const s=E.create('확률 학점 검증',seed,{gender:'male'});
  E.setClubs(s,'physics','none');
  while(s.turn<7&&s.alive){
    settle(s);
    if(E.needsEnrollment(s))E.enrollSemester(s,E.recommendEnrollment(s,'physics'));
    E.simulateWeek(s,'balanced','normal');
  }
  settle(s);
  return s;
};
let nonzero=0, positive=0, negative=0;
for(let i=1;i<=64;i++){
  const s=semester(i),g=s.grades[0];
  assert.ok(g,'A finished semester saves grades');
  assert.ok(Number.isFinite(g.baseGpa)&&Number.isFinite(g.gpaVariance));
  assert.ok(Math.abs(g.gpaVariance)<=0.05+1e-9, 'Bounded random variation');
  assert.ok(Math.abs(g.gpa-g.baseGpa)<=0.05+1e-9,'Recorded GPA stays near the subject-weighted value');
  assert.ok(g.gpa>=0&&g.gpa<=4.3,'The scale stays in bounds');
  assert.equal(E.getClassRank(s).cumulativeGpa,g.gpa,'Rank uses the recorded GPA');
  assert.equal(E.getProfile(s).gpa,g.gpa,'Profile uses the same recorded GPA');
  const album=R.build(s,E);
  const metric=album.metrics.find(m=>m.label==='누적 평점');
  assert.equal(Number(metric.value),g.gpa,'Retrospective also uses the same recorded GPA');
  if(g.gpaVariance!==0){nonzero++; if(g.gpaVariance>0)positive++;else negative++;}
  const saved=copy(s);
  E.migrate(saved);
  assert.deepEqual(saved.grades,s.grades,'Loading an old or new save never rerolls grades');
}
assert.ok(nonzero>=25,`Variation is not stuck at zero (${nonzero})`);
assert.ok(positive>=10&&negative>=10,`Both signs occur (${positive} plus, ${negative} minus)`);
// A newly saved transcript is calibrated; legacy transcript GPA is still the
// course-credit weighted mean when no v0.14.9 variation marker exists.
const old=semester(1001);delete old.grades[0].gpaVariance;delete old.grades[0].baseGpa;
const transcript=old.grades[0];
const legacy=+(transcript.subjects.reduce((sum,x)=>sum+x.point*x.credits,0)/transcript.credits).toFixed(2);
assert.equal(E.getProfile(old).gpa,legacy);
console.log(JSON.stringify({result:'pass',samples:64,nonzero,positive,negative}));
