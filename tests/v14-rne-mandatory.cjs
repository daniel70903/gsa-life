'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const S = require('../dist/school-systems.js');
const F = (seed) => {
  const s = E.create('필수 발표 검증', seed, {gender:'male'});
  E.setClubs(s,'physics','none');
  while (s.pendingEvent) E.chooseEvent(s, 0);
  return s;
};
const clamp = (v, a=0, b=100) => Math.max(a,Math.min(b,v));
const api = S.createAPI({rng:()=>0.55,clamp,round:Math.round,shift:(s,d)=>{for(const [k,v] of Object.entries(d))s.stats[k]=(s.stats[k]||0)+v;},note:()=>{},assertAlive:()=>{}});
const basics=S.contests.filter(x=>x.id==='rne_basic');
const adv=S.contests.filter(x=>x.id==='rne_advanced');
assert.equal(basics.length,1);
assert.equal(adv.length,1);
assert.equal(basics[0].turn,12,'1-2 week 6, before week 7 final exam');
assert.equal(adv[0].turn,26,'2-2 week 6, before week 7 final exam');
assert.ok(basics[0].required && adv[0].required);
for(let seed=1;seed<=20;seed++){
 const s=F(seed);api.init(s);
 for(const [turn,id] of [[12,'rne_basic'],[26,'rne_advanced']]){
   s.turn=turn;
   const events=api.scheduleEvents(s);
   const e=events.find(x=>x.contestId===id);
   assert.ok(e,`required ${id} event at turn ${turn}`);
   assert.equal(e.choices.length,2,'Only preparation choices, never a skip');
   assert.ok(e.choices.every(x=>x.contestPrep!=='skip'));
   assert.throws(()=>api.resolve(s,e,{contestPrep:'skip'}),/필수 참가/);
   const res=api.resolve(s,e,e.choices[seed%2]);
   assert.ok(res.handled);
   const rec=s.school.contests.find(x=>x.id===id);
   assert.equal(rec.entered,true);
   assert.equal(rec.required,true);
   assert.equal(rec.turn,turn);
   assert.equal(api.scheduleEvents(s).filter(x=>x.contestId===id).length,0,'Once only');
 }
}
// Legacy saves that already took the 2-2 R&E prize should not see a duplicate.
{
 const s=F(123456);api.init(s);s.turn=26;
 s.school.contests.push({id:'rne',entered:true,turn:26});
 assert.equal(api.scheduleEvents(s).filter(x=>x.contestId==='rne_advanced').length,0);
}
console.log('v14 required R&E presentations ok');
