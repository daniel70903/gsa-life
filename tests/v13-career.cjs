'use strict';
// v0.13 평가: 업적 ★과 커리어 에필로그.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const R = require('../dist/retrospective-data.js');
const copy = (x) => JSON.parse(JSON.stringify(x));
module.exports = function verifyV13Career() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };
  const s = E.create('c', 31, { gender: 'male' }); E.setClubs(s, 'math', 'none');
  ok(E.getCareer(s) === null, 'No career before graduation');
  const a0 = E.getAchievements(s); ok(a0.stars === 0 && a0.list.length >= 8, 'Achievements list exists');
  const g = copy(s); g.turn = 42; g.awards = [{ kind: 'olympiad' }, { kind: 'contest', tier: '금상' }]; g.admissions = [{ id: 'seoul', name: '서울대학교', majorName: '수리과학부', accepted: true }];
  ok(E.getAchievements(g).stars === 3, 'olympiad, gold, SNU earn stars');
  const c = E.getCareer(g); ok(c && c.prize === '필즈상' && Array.isArray(c.timeline) && c.timeline.length >= 2, 'Math path aims at the Fields Medal');
  assert.deepEqual(E.getCareer(copy(g)), c); checks++;
  ok(c.timeline[0].text.includes('서울대학교'), 'Career starts at the accepted university');
  // Prizes are rare even for elite records, more likely for stronger ones.
  const elite = copy(g); for (const k of Object.keys(elite.stats)) if (!['fatigue', 'stress'].includes(k)) elite.stats[k] = 100;
  let pe = 0, pm = 0;
  for (let i = 0; i < 2000; i++) { pe += E.getCareer({ ...elite, seed: i }).prizes > 0; pm += E.getCareer({ ...g, seed: i }).prizes > 0; }
  ok(pe > pm, 'Stronger records win more');
  ok(pe / 2000 < 0.2 && pm / 2000 < 0.03, `prizes stay rare (${pe}, ${pm})`);
  const d = R.build(g, E); ok(d.evaluation && d.evaluation.stars === 3, 'Recap carries evaluation');
  return { checks };
};
if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Career: module.exports() }));
