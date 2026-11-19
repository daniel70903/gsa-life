'use strict';
// v0.13: 능력치별 숨은 잠재력과 종합 능력치(OVR).
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = (x) => JSON.parse(JSON.stringify(x));

module.exports = function verifyV13Ovr() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };

  // 입학 OVR은 대체로 45~55, 잠재력은 50~99
  const start = [];
  for (let seed = 1; seed <= 60; seed++) {
    const s = E.create('ovr', seed, { gender: seed % 2 ? 'male' : 'female' });
    ok(s.potential && typeof s.potential === 'object', 'New students get hidden potential');
    for (const k of Object.keys(s.potential)) ok(s.potential[k] >= 50 && s.potential[k] <= 99, `potential ${k} in range`);
    start.push(E.getOverall(s));
  }
  start.sort((a, b) => a - b);
  const median = start[start.length >> 1];
  ok(median >= 45 && median <= 55, `start OVR median ${median} near 50`);
  ok(start[0] >= 30 && start[start.length - 1] <= 65, 'start OVR stays in a sane band');

  // 잠재력은 같은 시드면 같고, 다른 시드면 달라질 수 있음
  const a = E.create('a', 77, { gender: 'male' }), b = E.create('b', 77, { gender: 'male' });
  assert.deepEqual(a.potential, b.potential); checks++;

  // 예전 저장에도 잠재력이 붙음
  const old = copy(a); delete old.potential;
  const migrated = E.migrate(old);
  ok(migrated.potential && Object.keys(migrated.potential).length > 0, 'Old saves receive potential');

  // OVR 범위
  const hi = copy(a); for (const k of Object.keys(hi.stats)) if (!['fatigue', 'stress'].includes(k)) hi.stats[k] = 100;
  ok(E.getOverall(hi) <= 99, 'OVR caps at 99');
  const lo = copy(a); for (const k of Object.keys(lo.stats)) if (!['fatigue', 'stress'].includes(k)) lo.stats[k] = 0;
  ok(E.getOverall(lo) >= 1, 'OVR floor is 1');
  ok(E.OVR_SHAPE && E.OVR_WEIGHTS, 'OVR tuning is exported');
  return { checks };
};

if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Ovr: module.exports() }));
