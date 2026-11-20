'use strict';
const assert = require('node:assert/strict');

module.exports = function verifyV5(ctx) {
  const {E,copy,check,fresh,resolve,ready,toTurn,seek,noLeak,counters,fixtures,dead} = ctx;
  function rejectUnchanged(s, action, reason) {
    const saved=copy(s); assert.throws(action,reason); assert.deepEqual(s,saved,reason);
  }
  function declineRisks(event) {
    if (event.id.startsWith('campus_opportunity_')) return event.choices.findIndex(c=>c.campusChoice==='skip');
    return 0;
  }
  function settle(s,observe) {
    const choose=(event,state)=>{if(observe)observe(event,state);return declineRisks(event);};
    resolve(s,choose);
    if(!s.alive)return;
    if(E.needsEnrollment(s)) E.enrollSemester(s,E.recommendEnrollment(s,'physics'));
    if(E.getPhase(s).needsApplications) E.applyUniversities(s,['gist']);
    resolve(s,choose);
  }

  // The nine focuses change outcomes while the shared weekly routine still progresses.
  const focuses=['balanced','intelligence','social','athletics','discipline','research','leadership','english','recovery'];
  assert.deepEqual(E.focuses.map(f=>f.id),focuses);
  const baseline=fresh(1901); resolve(baseline); baseline.sportsClubs=['basketball'];
  for(const key of ['intelligence','social','athletics','discipline','luck','creativity','resilience','leadership','research']) baseline.stats[key]=50;
  baseline.stats.fatigue=50; baseline.stats.stress=50;
  const changed={};
  for(const id of focuses) {
    const s=copy(baseline); E.simulateWeek(s,id,'normal'); changed[id]=s;
    assert.equal(s.turn,baseline.turn+1);
    assert.equal(s.lastWeekReport.focusId,id);
    assert.ok(s.lastWeekReport.activities.length>=2,'The report contains multiple activities from one week');
    assert.ok(Object.keys(s.lastWeekReport.deltas).length>0,'The report records real changes');
  }
  for(const stat of ['intelligence','social','athletics','discipline','research','leadership']) {
    assert.ok(changed[stat].stats[stat]>changed.balanced.stats[stat],`${stat} focus has a real stat effect`);
  }
  assert.ok(changed.english.toeic.practice>changed.balanced.toeic.practice);
  assert.ok(changed.recovery.stats.fatigue<changed.balanced.stats.fatigue);
  rejectUnchanged(baseline,()=>E.simulateWeek(baseline,'unknown','normal'),'Invalid focus is rejected atomically');
  rejectUnchanged(dead,()=>E.simulateWeek(dead,'balanced','normal'),'Death blocks simulated weeks');

  // Ordinary balanced school life is playable without repeatedly choosing manual rest.
  let survivors=0, emergencyLives=0, automaticClubLives=0, automaticSportsLives=0, balancedInvited=0;
  for(let seed=0;seed<12;seed++) {
    const s=fresh(2100+seed); resolve(s); s.sportsClubs=['basketball'];
    for(const key of ['intelligence','social','athletics','discipline','luck','creativity','resilience','leadership','research'])s.stats[key]=50;
    let invited=false;
    while(s.turn<42 && s.alive) {
      settle(s,e=>{if(e.id==='campus_romance_invite'||(e.id==='campus_romance_season'&&['aprilfools','confessday'].includes(e.season)))invited=true;}); if(!s.alive)break;
      const commitment=s.turn>=28&&E.getFieldStatus(s).canIndependent?'fieldresearch':null;
      E.simulateWeek(s,'balanced','normal',commitment);
    }
    resolve(s,declineRisks);
    survivors+=s.alive; emergencyLives+=s.hospitalizations.length>0; balancedInvited+=invited;
    automaticClubLives+=s.clubWeeks>0; automaticSportsLives+=s.sportsWeeks>0;
    assert.ok(s.money.balance>=0);
    assert.equal(s.dorm.deliveryCaught,0,'Skipping invitations never creates delivery violations');
    assert.equal(s.dorm.electronicsCaught,0,'Skipping invitations never creates device violations');
  }
  assert.ok(survivors>=9,'Most ordinary balanced lives should reach the end alive');
  assert.equal(automaticClubLives,12,'Club experience progresses through the routine');
  assert.equal(automaticSportsLives,12,'Members receive automatic team training');
  counters.balancedLives={total:12,survivors,emergencyLives,invited:balancedInvited};
  let socialInvited=0;
  for(let seed=0;seed<12;seed++) {
    const s=fresh(2100+seed); resolve(s); let invited=false;
    while(s.turn<42&&s.alive) {
      settle(s,e=>{if(e.id==='campus_romance_invite'||(e.id==='campus_romance_season'&&['aprilfools','confessday'].includes(e.season)))invited=true;});
      if(!s.alive)break;
      E.simulateWeek(s,'social','normal',s.turn>=28&&E.getFieldStatus(s).canIndependent?'fieldresearch':null);
    }
    resolve(s,declineRisks); socialInvited+=invited;
  }
  assert.ok(balancedInvited+socialInvited>0,'Natural school life can reach a confession without the manual romance action');
  counters.naturalRomance={balancedInvited,socialInvited,perFocus:12};

  // Follow-up choices are included in the displayed weekly change totals.
  const reporting=toTurn(fresh(1984),6); ready(reporting);
  const reportBefore=copy(reporting); E.simulateWeek(reporting,'balanced','normal');
  resolve(reporting);
  for(const key of Object.keys(reporting.stats)) {
    assert.equal(reporting.lastWeekReport.deltas[key]||0,Math.round((reporting.stats[key]-reportBefore.stats[key])*10)/10,`Post-event report agrees with ${key}`);
  }
  assert.equal(reporting.lastWeekReport.moneyDelta,reporting.money.balance-reportBefore.money.balance);
  assert.ok(reporting.lastWeekReport.eventsResolved>0);

  // v4 migration keeps completed experiences, money, relationships and in-progress journeys.
  for(const fixture of fixtures.filter(f=>f.state.version===4)) {
    // v0.13.2: 예전 8주 학기의 주차 기록(turn, …Turn, …Until)은 7주 학기로 옮겨집니다.
    const before=(function walk(o){if(!o||typeof o!=='object')return o;for(const k of Object.keys(o)){if((k==='turn'||/Turn$/.test(k)||/Until$/.test(k))&&Number.isInteger(o[k])&&o[k]>=0&&o[k]<=48)o[k]=E.legacyWeekToNew(o[k]);else walk(o[k]);}return o;})(copy(fixture.state)), after=E.migrate(copy(fixture.state));
    assert.deepEqual(after.grades,before.grades);
    assert.equal(after.money.balance,before.money.balance);
    assert.deepEqual(after.school.fieldCredits,before.school.fieldCredits);
    const sameGenderLegacy=after.gender&&E.romanceCandidates.find(p=>p.name===before.romance.partnerName)?.gender===after.gender; // v0.14: 아직 만나지 않은 동성 대상은 이성 후보로 바뀝니다.
    for(const key of Object.keys(before.romance)) if(!(sameGenderLegacy&&key==='partnerName')) assert.deepEqual(after.romance[key],before.romance[key],`Existing romance ${key} is preserved`);
    if(before.pendingEvent?.schoolJourney) {
      assert.deepEqual(after.pendingEvent,before.pendingEvent);
      const restored=E.migrate(copy(after));
      E.chooseEvent(after,0); E.chooseEvent(restored,0);
      assert.deepEqual(restored,after,'An existing travel story resumes deterministically');
    }
  }

  // v0.14: 고백 결과는 성별과 무관하며, 호감·신뢰·사회성이 내부적으로 영향을 줍니다.
  const invitation=fresh(2391); resolve(invitation);
  invitation.romance.stage='friendship'; invitation.romance.bond=60;
  invitation.romance.meetings=6; invitation.romance.lastEventTurn=-20;
  invitation.romance.lastConfessionTurn=-20;
  E.advance(invitation,'romance'); seek(invitation,'campus_romance_invite');
  const trialCounts={baseline:0,social:0,athletics:0,female:0};
  for(let seed=0;seed<600;seed++) {
    for(const variant of Object.keys(trialCounts)) {
      const s=copy(invitation); s.rng=seed; s.gender=variant==='female'?'female':'male';
      s.stats.social=variant==='social'?90:50;
      s.stats.athletics=variant==='athletics'?90:50;
      s.romance.bond=60;
      const displayed=JSON.stringify([s.pendingEvent.title,s.pendingEvent.description,...s.pendingEvent.choices.map(c=>[c.label,c.description])]);
      assert.ok(!/(확률|퍼센트|%|남자|여자|남성|여성|운동 수치|사회성 수치)/.test(displayed),'The confession UI does not disclose probability modifiers');
      E.chooseEvent(s,0);
      trialCounts[variant]+=s.romance.records[invitation.pendingEvent.characterId].stage==='dating';
    }
  }
  assert.ok(trialCounts.baseline>=270&&trialCounts.baseline<=380,`Neutral confession at bond 60 succeeds about half the time: ${trialCounts.baseline}/600`);
  assert.ok(trialCounts.social>trialCounts.baseline,'Social ability helps under matched random draws');
  assert.equal(trialCounts.athletics,trialCounts.baseline,'Athletic stats no longer change confession outcomes');
  assert.equal(trialCounts.female,trialCounts.baseline,'Confession outcomes are independent of the player gender');
  counters.confessions={...trialCounts,samples:600};

  // Invitations are offers: generating and refusing them does not spend money or record violations.
  const campusModule=require('../dist/campus-systems.js');
  let nextRandom=0.5,drawIndex=0;
  const campus=campusModule.createAPI({
    rng:()=>++drawIndex%2===1?0.01:nextRandom, shift:(s,changes)=>{for(const[k,v]of Object.entries(changes))s.stats[k]=(s.stats[k]||0)+v;},
    note:()=>{}, addLearning:()=>{}, clamp:(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n)),round:n=>Math.round(n*10)/10
  });
  const opportunities=new Map();
  for(let seed=0;seed<300 && opportunities.size<3;seed++) {
    const s=fresh(2700+seed); resolve(s); s.turn=5; s.rng=seed;
    s.romance.stage='dating'; s.romance.lastEventTurn=5; s.romance.globalLastEventTurn=5;
    nextRandom=(seed%100)/100; drawIndex=0;
    const balance=s.money.balance, violations=copy(s.dorm);
    const offers=campus.automaticEvents(s,{focusId:'balanced',fromTurn:5,commitment:null});
    assert.equal(s.money.balance,balance,'Generating an offer never charges money');
    assert.deepEqual(s.dorm,violations,'Generating an offer never records a violation');
    for(const offer of offers) if(['campus_opportunity_delivery','campus_opportunity_device_dorm','campus_opportunity_device_study'].includes(offer.id))opportunities.set(offer.id,{s,offer});
  }
  assert.equal(opportunities.size,3,'Both device locations and delivery can appear as natural invitations');
  for(const {s,offer} of opportunities.values()) {
    const balance=s.money.balance, violations=copy(s.dorm);
    const choice=offer.choices.find(c=>c.campusChoice==='skip'); assert.ok(choice);
    campus.resolve(s,offer,choice);
    assert.equal(s.money.balance,balance,'Refusing an offer does not charge money');
    assert.deepEqual(s.dorm,violations,'Refusing an offer does not count as being caught');
    for(const caught of [false,true]) {
      const accepted=copy(s); drawIndex=1; nextRandom=caught?0.01:0.99;
      campus.resolve(accepted,offer,offer.choices.find(c=>c.campusChoice==='accept'));
      const key=offer.campusAction==='delivery'?'deliveryCaught':'electronicsCaught';
      assert.equal(accepted.dorm[key]-violations[key],caught?1:0,'Accepted invitations remain probabilistic');
      assert.equal(accepted.money.balance,balance-(offer.campusAction==='delivery'?12000:0),'Only accepting delivery incurs its stated price');
    }
  }

  // Store expansion has four distinct purchases per week and gear cannot be farmed on later weeks.
  assert.ok(E.shopItems.length>=12);
  assert.equal(new Set(E.shopItems.map(i=>i.id)).size,E.shopItems.length);
  const gearBuyer=fresh(2211); resolve(gearBuyer); gearBuyer.money.balance=250000;
  const gear=E.shopItems.find(i=>i.id==='basketball'); assert.ok(gear);
  E.buyItem(gearBuyer,gear.id);
  assert.ok(gearBuyer.money.ownedItems.includes(gear.id));
  E.simulateWeek(gearBuyer,'balanced','normal'); settle(gearBuyer);
  rejectUnchanged(gearBuyer,()=>E.buyItem(gearBuyer,gear.id),'Owned equipment cannot be purchased twice');

  counters.v5Focused=true;
};
