// v0.14: 2주 진행·복잡도 감소, 서울대 모집단위, 학술동아리, 졸업 180학점을 검증합니다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../dist/engine.js');

// 1) 학교생활 문구에는 부적절한 표현이 없습니다.
const campusSource = fs.readFileSync(path.join(__dirname, '../dist/campus-systems.js'), 'utf8');
const banned = /(야한|섹시|19금|술자리|담배)/;
assert.ok(!banned.test(campusSource), 'Campus prose avoids inappropriate wording');

// 2) 같은 반 친구 6명, 새 게임의 180학점 규칙.
for (const gender of ['male', 'female']) {
  const s = E.create('검증', `v14-${gender}`, { gender });
  E.setClubs(s, E.academicClubs[0].id, 'none');
  assert.equal(E.classmates.length, 6);
  assert.equal(s.creditRule, 180, 'New games use the 180-credit graduation rule');
}

// 3) 서울대 모집단위와 추천 원서.
assert.equal(E.SNU_UNITS.length, 18, 'Seoul has 12 engineering + 6 science units');
const ee = E.SNU_UNITS.find(u => u.id === 'ee'), naoe = E.SNU_UNITS.find(u => u.id === 'naoe');
assert.ok(ee.top < naoe.top, 'Electrical engineering needs a higher class rank than naval architecture');

// 4) 2주 단위 진행: 한 번에 2주(학기 7주차는 1주)가 흐르고, 사소한 사건은 자동으로 처리됩니다.
{
  const s = E.create('검증', 'v14-span', { gender: 'male' });
  E.setClubs(s, E.academicClubs[0].id, 'none');
  while (s.pendingEvent) E.chooseEvent(s, 0);
  const lengths = [];
  for (let t = 0; t < 7; t++) { s.turn = t; lengths.push(E.spanLength(s)); }
  assert.deepEqual(lengths, [2, 2, 2, 2, 2, 2, 1], 'Weeks 1-2, 3-4, 5-6 and the final week 7');
}

// 5) 3년 시뮬레이션(2주 단위): 선택 횟수가 적습니다.
const N = 60;
let decisions = 0, spans = 0;
for (let seed = 1; seed <= N; seed++) {
  const s = E.create('검증', 14000 + seed, { gender: seed % 2 ? 'male' : 'female' });
  E.setClubs(s, E.academicClubs[seed % 12].id, 'none');
  const settle = () => { let k = 0; while (s.pendingEvent && s.alive && k++ < 120) { const e = s.pendingEvent; decisions++; E.chooseEvent(s, seed % e.choices.length); } };
  settle();
  let guard = 0;
  while (s.turn < 42 && s.alive && guard++ < 200) {
    settle(); if (!s.alive || s.turn >= 42) break;
    if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, 'physics'));
    if (E.getPhase(s).needsApplications) E.applyUniversities(s, E.recommendApplications(s));
    settle(); if (!s.alive || s.turn >= 42) break;
    if (s.span) { E.continueSpan(s); continue; }
    const before = s.turn;
    E.simulateSpan(s, s.stats.fatigue > 60 ? 'recovery' : seed % 3 === 0 ? 'social' : 'balanced'); spans++;
    if (!s.pendingEvent && !s.span) assert.ok(s.turn - before <= 2 && s.turn > before, 'One step covers at most two weeks');
  }
  settle();
  if (s.applicationSnapshot && s.grades.length === 6) assert.ok(s.applicationSnapshot.turn <= 35, 'Applications are written before 3-2 grades exist');
}
assert.ok(spans / N <= 26, `About 24 steps per run: ${(spans / N).toFixed(1)}`);
assert.ok(decisions / N <= 45, `Choices per run stay near 40: ${(decisions / N).toFixed(1)}`);
console.log('v14 features ok', { stepsPerRun: +(spans / N).toFixed(1), decisionsPerRun: +(decisions / N).toFixed(1) });

// 6) 매점 입고: 2주마다 서로 다른 종류 3개, 같은 구간에서는 그대로, 입고되지 않은 물건은 살 수 없습니다.
{
  const s = E.create('검증', 'v14-shop', { gender: 'male' });
  E.setClubs(s, E.academicClubs[0].id, 'none');
  while (s.pendingEvent) E.chooseEvent(s, 0);
  const seen = new Set();
  for (let turn = 0; turn < 42; turn++) {
    s.turn = turn;
    const stock = E.shopStock(s), items = stock.map(id => E.shopItems.find(i => i.id === id));
    assert.equal(stock.length, 3);
    assert.equal(new Set(items.map(i => i.category)).size, 3, 'Three different kinds each time');
    if (turn % 7 % 2 === 1 && turn % 7 !== 6) assert.deepEqual(E.shopStock({ ...s, turn: turn - 1 }), stock, 'Stock stays the same within a two-week span');
    seen.add(stock.join(','));
    assert.equal(E.getShop(s).filter(i => i.inStock).length, 3);
  }
  assert.ok(seen.size >= 15, `Stock rotates over the three years: ${seen.size}`);
  s.turn = 2; s.money.balance = 100000;
  const missing = E.shopItems.find(i => !E.shopStock(s).includes(i.id));
  assert.throws(() => E.buyItem(s, missing.id), /들어오지 않은/);
  E.buyItem(s, E.shopStock(s)[0]);
}

// 7) 입학 능력치: 각 능력치 40~65, 합계 385~400, 50 근처가 가장 흔하고 끝으로 갈수록 드뭅니다. 모자란 합계만큼 생활비를 더 받습니다.
{
  const K = ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership'];
  const hist = {};
  for (let i = 0; i < 1500; i++) {
    const s = E.create('검증', `v14-roll-${i}`, { gender: 'male' });
    const vals = K.map(k => s.stats[k]), total = vals.reduce((n, v) => n + v, 0);
    assert.ok(total >= E.TALENT_TOTAL_MIN && total <= E.TALENT_TOTAL, `Talent total ${total} within 385~400`);
    assert.equal(s.money.startingBalance, 17500 + (400 - total) * 500, 'Missing talent points become starting money');
    for (const v of vals) { assert.ok(v >= E.TALENT_MIN && v <= E.TALENT_MAX, `Talent ${v} within 40~65`); hist[v] = (hist[v] || 0) + 1; }
    const type = E.archetypes.find(a => a.id === s.archetype);
    const MAIN = { intelligence: 'intellect', social: 'social', athletics: 'athlete', luck: 'lucky', discipline: 'discipline' };
    const top = Math.max(...Object.keys(MAIN).map(k => s.stats[k])), topTypes = Object.keys(MAIN).filter(k => s.stats[k] === top).map(k => MAIN[k]);
    if (top < E.TYPE_THRESHOLD) assert.equal(type.id, 'balanced', 'No standout main talent means balanced'); else assert.ok(topTypes.includes(type.id), `Type ${type.id} follows the highest main talent`);
    if (type.id !== 'balanced') assert.ok(s.stats[Object.keys(MAIN).find(k => MAIN[k] === type.id)] >= E.TYPE_THRESHOLD, 'Type stat itself is high');
  }
  {
    const t = E.typeFromTalents({ intelligence: 41, social: 47, athletics: 42, discipline: 51, luck: 52, creativity: 49, resilience: 55, leadership: 51 });
    assert.equal(t.id, 'balanced', 'High resilience with low athletics is not athlete');
  }
  const peak = Math.max(...Object.values(hist));
  assert.ok((hist[50] || 0) >= peak * 0.9, 'Around 50 is the most common value');
  for (let v = 51; v < 65; v++) assert.ok((hist[v] || 0) >= (hist[v + 1] || 0), `Higher values get gradually rarer (${v})`);
}

// 8) R&E: 1학년 기초(1~3지망, 떨어질 수 있음) → 2학년 심화(고른 분야로 배정) → 3학년 1학기 졸업논문(제출·이수). 팀은 3명, 가끔 2명.
{
  const stats = { rank: [0, 0, 0, 0], two: 0, n: 0 };
  for (let seed = 1; seed <= 120; seed++) {
    const s = E.create('검증', `v14-rne-${seed}`, { gender: seed % 2 ? 'male' : 'female' });
    E.setClubs(s, E.academicClubs[seed % 12].id, 'none');
    const seen = new Set();
    const settle = () => { let k = 0; while (s.pendingEvent && s.alive && k++ < 120) { const e = s.pendingEvent; seen.add(e.id); if (e.id === 'rne_basic_apply') assert.equal(e.choices.length, 6); E.chooseEvent(s, /^rne_/.test(e.id) ? seed % e.choices.length : 0); } };
    settle();
    let guard = 0;
    while (s.turn < 42 && s.alive && guard++ < 200) {
      settle(); if (!s.alive || s.turn >= 42) break;
      if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, 'physics'));
      if (E.getPhase(s).needsApplications) E.applyUniversities(s, E.recommendApplications(s));
      settle(); if (!s.alive || s.turn >= 42) break;
      if (s.span) { E.continueSpan(s); continue; }
      E.simulateSpan(s, s.stats.fatigue > 60 ? 'recovery' : 'research');
    }
    settle();
    if (!s.alive) continue;
    const r = E.getRne(s); stats.n++;
    assert.ok(seen.has('rne_basic_apply') && seen.has('rne_advanced_apply') && seen.has('rne_thesis'));
    assert.ok(!seen.has('research_topic'), 'The old single R&E question is gone');
    assert.ok(r.basic && r.advanced && r.thesis && r.thesis.done, 'All three research stages complete');
    if (r.basic.rank) assert.equal(r.basic.field, r.basic.prefs[r.basic.rank - 1]); else assert.ok(!r.basic.prefs.includes(r.basic.field));
    assert.equal(r.advanced.field, E.RNE_FIELDS[(seed % 6)][0], 'Advanced R&E always gets the chosen field');
    for (const x of [r.basic, r.advanced]) { assert.ok([2, 3].includes(x.team.size)); assert.equal(x.team.members.length, x.team.size - 1); stats.two += x.team.size === 2; }
    stats.rank[r.basic.rank]++;
  }
  assert.ok(stats.rank[1] > stats.rank[2] && stats.rank[0] > 0 && stats.rank[0] < stats.n * 0.15, `Basic R&E preference spread ${stats.rank}`);
  assert.ok(stats.two > 0 && stats.two < stats.n * 2 * 0.3, 'Two-person teams happen sometimes');
}
