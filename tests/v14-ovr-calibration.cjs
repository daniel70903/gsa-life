'use strict';
// v0.14.7: statistically test the intended graduation OVR distribution
// for a reproducible MIX of player strategies, not a claim about all real players.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const PER_STRATEGY = 64;
const policies = ['balanced','balanced','intelligence','intelligence','night','both','research','social','athletics','discipline','leadership','recovery'];
const settled=s=>{let guard=0;while(s.pendingEvent&&s.alive){assert.ok(++guard<100,'Event loop terminates');E.chooseEvent(s,0)}};
const ready=s=>{settled(s);if(E.needsEnrollment(s))E.enrollSemester(s,E.recommendEnrollment(s,'physics'));if(E.getPhase(s).needsApplications)E.applyUniversities(s,['kaist','gist','dgist']);settled(s)};
const scores=[];
for(let p=0;p<policies.length;p++) {
  for(let seed=1;seed<=PER_STRATEGY;seed++) {
    const policy=policies[p];
    const s=E.create('OVR balance',seed*17+p*100019,{gender:seed%2?'male':'female'});
    E.setClubs(s,'physics','none');
    while(s.alive&&s.turn<42) {
      ready(s);
      let focus=['night','both'].includes(policy)?'intelligence':policy;
      if(['night','both'].includes(policy)&&(s.stats.fatigue>60||s.stats.stress>65||s.illnessWeeks))focus='recovery';
      const phase=E.getPhase(s);
      let mode='normal';
      if(focus!=='recovery'&&policy==='night')mode=phase.nightAvailable?'night':'normal';
      if(focus!=='recovery'&&policy==='both')mode=phase.dawnAvailable?'both':phase.nightAvailable?'night':'normal';
      s.studyPlanner=null;E.simulateWeek(s,focus,mode);
    }
    if(s.alive)settled(s);
    assert.equal(s.grades.length,6,`Graduated: ${policy} ${seed}`);
    scores.push(E.getOverall(s));
  }
}
const sorted=[...scores].sort((a,b)=>a-b);
const median=sorted[Math.floor((scores.length-1)/2)];
const rate90=scores.filter(x=>x>=90).length/scores.length;
const rate95=scores.filter(x=>x>=95).length/scores.length;
assert.ok(median>=87&&median<=89,`Graduation OVR median ${median} near 88`);
assert.ok(rate90>=0.25&&rate90<=0.35,`OVR 90+ ${(100*rate90).toFixed(1)}% near 30%`);
assert.ok(rate95>=0.03&&rate95<=0.08,`OVR 95+ ${(100*rate95).toFixed(1)}% near 5%`);
console.log(JSON.stringify({result:'pass',seeds:scores.length,median,ge90:+(100*rate90).toFixed(1),ge95:+(100*rate95).toFixed(1)}));
