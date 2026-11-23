'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const median = arr => [...arr].sort((a,b)=>a-b)[Math.floor((arr.length-1)/2)];
function fresh(seed) {
  const s=E.create('시간 배분 검증',seed,{gender:'male'});
  E.setClubs(s,'physics','music');
  let count=0;
  while(s.pendingEvent && s.alive) {assert.ok(count++<60);E.chooseEvent(s,0);}
  return s;
}
// Paired starts isolate the effect of the weekly academic time allocation:
// grades are not used as the penalty trigger and no hard club ban is introduced.
const counts={intelligence:0,balanced:0,mixed:0};
const N=256;
for(let seed=1;seed<=N;seed++){
  const start=fresh(90000+seed);
  for(const [key,focus] of [['intelligence','intelligence'],['balanced','balanced'],['mixed',{intelligence:5,social:5}]]){
    const s=JSON.parse(JSON.stringify(start));
    const prior=s.clubWeeks;
    E.simulateWeek(s,focus);
    counts[key]+=s.clubWeeks-prior;
    if(key==='intelligence')assert.ok(s.lastWeekReport.activities.some(a=>a.includes('자동 참여')));
  }
}
assert.ok(counts.intelligence<counts.balanced*0.7,`Intelligence100 should reduce passive extracurricular attendance: ${JSON.stringify(counts)}`);
assert.ok(counts.mixed>counts.intelligence && counts.mixed<counts.balanced, 'Mixed focus gets an intermediate activity level');
// Workload surcharge is separate from the uncapped specialist enrollment rule.
const s=fresh(77);s.turn=21;
const opt=E.getEnrollmentOptions(s);const required=opt.requiredCourses.reduce((n,c)=>n+c.credits,0);
function load(credits){
  s.curriculum.plans[3]={term:3,legacy:false,subjects:[{id:'test-electives',credits:credits-required,category:'specialist',difficulty:3}]};
  return E.getCourseWorkload(s);
}
for(const [credits,fatigue,stress] of [[30,1.0,0.6],[32,1.8,1.0],[33,2.5,1.4],[35,3.4,1.9],[38,5.4,3.1],[40,6.4,3.6]]){
  const l=load(credits);assert.equal(l.totalCredits,credits);assert.equal(l.fatigueExtra,fatigue);assert.equal(l.stressExtra,stress);
}
assert.equal(opt.rules.specialistMax,null,'Uncapped specialist credit enrollment remains unchanged');
console.log(JSON.stringify({result:'pass',samples:N,passiveClubAttendances:counts,weekLoad:{c32:'1.8/1.0',c35:'3.4/1.9',c40:'6.4/3.6'}}));
