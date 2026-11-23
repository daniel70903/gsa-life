'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const floor = [3.45,3.45,3.45,3.80,3.80,3.80];
const settle = s => {let i=0;while(s.pendingEvent&&s.alive){assert.ok(++i<200);E.chooseEvent(s,0);}};
function play(seed,poor=false){
  const s=E.create('학기별 최저평점 검증',seed,{gender:'male'});
  E.setClubs(s,'physics','none');
  for(let i=0;i<42&&s.alive;i++){
    settle(s);
    if(E.needsEnrollment(s))E.enrollSemester(s,E.recommendEnrollment(s,'physics'));
    if(E.getPhase(s).needsApplications)E.applyUniversities(s,['kaist','gist','dgist']);
    settle(s);
    if(poor){ s.stats.intelligence=0; s.stats.discipline=0; s.stats.research=0; s.stats.creativity=0; }
    // Do not artificially fail subjects: the floor must work for genuine game exams.
    E.simulateWeek(s,poor?'recovery':'balanced','normal');
  }
  settle(s);
  assert.equal(s.grades.length,6);
  return s;
}
let floorsUsed=0;
for(let seed=1;seed<=28;seed++){
  for(const poor of [false,true]){
    const s=play(seed,poor);
    for(let term=0;term<6;term++){
      const g=s.grades[term],min=floor[term];
      assert.ok(g.gpa+1e-9>=min,`semester ${term+1} cannot fall below ${min}: ${g.gpa}`);
      assert.equal(g.semesterFloor,min);
      assert.ok(g.gpa<=4.3);
      assert.ok(Math.abs(g.gpaVariance)<=0.05+1e-9);
      const raw=Math.round(g.subjects.reduce((sum,x)=>sum+x.point*x.credits,0)/g.credits*100)/100;
      assert.equal(g.subjectGpa,raw,'Subject points are preserved independently');
      assert.equal(g.baseGpa,Math.max(raw,min),'Term-only floor adjustment');
      assert.equal(g.gpaFloorBoost,+(g.baseGpa-raw).toFixed(2));
      if(g.gpaFloorBoost>0)floorsUsed++;
      assert.ok(E.getClassRank(s,term).semester>=1,'Ranks still use the settled GPA');
    }
  }
}
assert.ok(floorsUsed>0,'At least one poor student actually needs the floor');
// Previously finalized transcript must survive migrations without rerolling.
const legacy=play(500,true),before=JSON.stringify(legacy.grades);E.migrate(legacy);
assert.equal(JSON.stringify(legacy.grades),before);
console.log(JSON.stringify({result:'pass',seeds:28,strategies:2,terms:6,floorsUsed}));
