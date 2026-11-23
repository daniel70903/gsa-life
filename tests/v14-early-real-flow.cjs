'use strict';
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const s=E.create('조기지원 흐름',5558,{gender:'male'});E.setClubs(s,'physics','none');
const step=()=>{let k=0;while(s.pendingEvent&&k++<90){const e=s.pendingEvent;const i=e.id==='kaist_early_apply'?0:e.id==='olympiad'?e.choices.length-1:0;E.chooseEvent(s,i);}if(k>90)throw Error('event loop');};
step();
for(let n=0;n<28;n++){
 if(s.turn>=21&&E.needsEnrollment(s)){
   const choices=E.recommendEnrollment(s);
   E.enrollSemester(s,choices);
 }
 E.advance(s,'rest');step();
 if(s.turn===23){assert.ok(s.kaistEarly?.applied,'2-2 early popup must be offered');assert.equal(s.kaistEarly.status,'review');}
 if(s.turn===27){assert.equal(s.kaistEarly.status,'results');assert.equal(typeof s.kaistEarly.accepted,'boolean');}
}
assert.ok(s.turn>=28);
console.log('kaist early 2nd-year popup and delayed result: ok');
