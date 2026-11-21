'use strict';
// v0.13.1: 기숙사 단계별 퇴사(1주 → 2주 → 4주 → 12주 → 영구)와 복귀.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
module.exports = function verifyV13Dorm() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };
  const s = E.create('d', 17, { gender: 'male' }); E.setClubs(s, 'math', 'none');
  const settle = () => { let n = 0; while (s.pendingEvent && n++ < 40) E.chooseEvent(s, 0); };
  const week = () => { settle(); if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, 'math')); settle(); if (E.getPhase(s).needsApplications) E.applyUniversities(s, ['kaist']); settle(); s.stats.fatigue = 20; s.stats.stress = 20; s.studyPlanner = null; E.simulateWeek(s, 'balanced'); settle(); };
  settle();
  const outFor = [];
  for (const expected of [1, 2, 4, 12]) {
    s.dorm.deliveryCaught = 2; week();
    ok(s.dorm.status === 'expelled', `expelled (${expected} weeks)`);
    let out = 0, g = 0;
    while (s.dorm.status === 'expelled' && g++ < 20) { week(); if (s.dorm.status === 'expelled') out++; }
    outFor.push(out);
    ok(s.dorm.status === 'resident', 'returns to the dorm');
    ok(s.dorm.deliveryCaught === 0 && s.dorm.electronicsCaught === 0, 'violation counters reset on return');
  }
  assert.deepEqual(outFor, [1, 2, 4, 12]); checks++;
  s.dorm.electronicsCaught = 4; week();
  ok(s.dorm.status === 'expelled' && s.dorm.expulsions === 5 && !Number.isFinite(s.dorm.returnTurn), 'fifth expulsion is permanent');
  for (let i = 0; i < 3; i++) week();
  ok(s.dorm.status === 'expelled', 'permanent expulsion never returns');
  ok(E.getDormDiscipline(s).permanent === true, 'status reports permanent');
  // Old saves already expelled are treated as the first expulsion.
  const old = E.create('o', 3, { gender: 'female' }); old.turn = 10; old.dorm = { status: 'expelled', deliveryCaught: 2, electronicsCaught: 0, expelledTurn: 9 };
  const m = E.migrate(old);
  ok(m.dorm.expulsions === 1 && Number.isFinite(m.dorm.returnTurn) && m.dorm.returnTurn >= 10, 'legacy expulsion becomes a 1st, temporary one');
  return { checks };
};
if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Dorm: module.exports() }));
