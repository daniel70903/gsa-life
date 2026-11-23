'use strict';
// Optional extracurricular achievements trade a small amount of exam preparation
// for activities, while mandatory R&E talks never incur this extra academic cost.
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const S=require('../dist/school-systems.js');
const copy=o=>JSON.parse(JSON.stringify(o));
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const api=S.createAPI({rng:()=>0.5,clamp,round:Math.round,shift:(s,d)=>{for(const [k,v] of Object.entries(d))s.stats[k]=(s.stats[k]||0)+v;},note:()=>{},assertAlive:()=>{}});
function fresh(seed){const s=E.create('기회비용 테스트',seed,{gender:'male'});E.setClubs(s,'physics','none');let n=0;while(s.pendingEvent){assert.ok(++n<70);E.chooseEvent(s,0);}api.init(s);return s;}
{
const a=fresh(9001);a.turn=2;
api.resolve(a,{contestId:'math'},{contestPrep:'hard'});
assert.equal(a.examExternalLoad,2,'A voluntarily chosen intensive contest has academic preparation costs');
const b=fresh(9001);b.turn=2;
api.resolve(b,{contestId:'math'},{contestPrep:'light'});
assert.equal(b.examExternalLoad,0.1,'An easy contest costs almost no study time');
const c=fresh(9001);c.turn=12;
api.resolve(c,{contestId:'rne_basic'},{contestPrep:'hard'});
assert.equal(c.examExternalLoad||0,0,'Compulsory basic R&E is exempt');
const d=fresh(9001);d.turn=26;
api.resolve(d,{contestId:'rne_advanced'},{contestPrep:'light'});
assert.equal(d.examExternalLoad||0,0,'Compulsory advanced R&E is exempt');
}
{
const s=fresh(9002);s.turn=3;
Object.assign(s.stats,{fatigue:0,stress:0,health:100,discipline:60,intelligence:70,resilience:85});
for(const sub of E.getSubjects(s))s.semesterLearning[sub.id]=22;
const plain=copy(s),busy=copy(s);
plain.examExternalLoad=0;busy.examExternalLoad=8;
E.simulateWeek(plain,'intelligence','normal');E.simulateWeek(busy,'intelligence','normal');
const avg=x=>x.midterm.reduce((sum,z)=>sum+z.score,0)/x.midterm.length;
assert.ok(avg(plain)>avg(busy)+7,'Multiple optional activities should reduce exam preparation, not automatically fail');
assert.ok(avg(plain)-avg(busy)<=14,'Academic opportunity cost is bounded');
}
{
const s=fresh(9003);s.turn=6;s.examExternalLoad=10;
E.simulateWeek(s,'balanced','normal');
assert.ok(s.examExternalLoad<10&&s.examExternalLoad>0,'Optional activity commitments fade between semesters');
}
console.log('v14.9 optional external-activity GPA tradeoff ok');
