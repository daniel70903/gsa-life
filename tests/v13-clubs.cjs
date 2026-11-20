'use strict';
// v0.13.4: 2026년 학술동아리 12개와 예전 동아리 id 변환.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
module.exports = function verifyV13Clubs() {
  let checks = 0;
  const names = E.academicClubs.map((c) => c.name);
  assert.deepEqual(names, ['인테그랄', 'AXIOM', 'QM', 'SCV', '프사이', 'CHEMTECH', '켈빈', 'SOMA', '바이오케미', 'TERRA', '!DEA', 'Ifex']); checks++;
  for (const c of E.academicClubs) { assert.ok(['math', 'physics', 'chemistry', 'biology', 'earth', 'ai'].includes(c.field)); checks++; }
  const s = E.create('c', 9, { gender: 'male' }); E.setClubs(s, 'physics', 'none');
  assert.equal(s.academicClub, 'qm'); assert.equal(E.academicField(s), 'physics'); checks += 2;
  const old = E.create('o', 9, { gender: 'male' }); old.academicClub = 'ai';
  assert.equal(E.migrate(old).academicClub, 'idea'); checks++;
  const t = E.create('t', 4, { gender: 'female' }); E.setClubs(t, 'terra', 'none');
  assert.equal(E.academicField(t), 'earth'); checks++;
  return { checks };
};
if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Clubs: module.exports() }));
