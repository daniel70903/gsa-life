'use strict';
// v0.13: 교내 대회(지원자 상위 20% 수상, 발명품 대회는 전학년).
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const S = require('../dist/school-systems.js');

module.exports = function verifyV13Contests() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };
  const names = S.contests.map((c) => c.name).join(' ');
  for (const n of ['수학', '물리', '화학', '생명과학', '지구과학', '정보과학', '발명품', '글쓰기', '영어 말하기', '동아리 발표', 'R&E']) ok(names.includes(n), `contest ${n} exists`);
  ok(S.contests.filter((c) => c.open).length === 3, 'Invention fair runs once per grade');
  ok(new Set(S.contests.map((c) => c.id)).size === S.contests.length, 'contest ids are unique');

  let won = 0, entered = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const s = E.create('c', seed, { gender: 'male' }); E.setClubs(s, 'math', 'none');
    let seen = 0, g = 0;
    while (s.turn < 12 && s.alive && g++ < 30) {
      let n = 0;
      while (s.pendingEvent && s.alive && n++ < 60) { const ev = s.pendingEvent; if (ev.contestId) seen++; E.chooseEvent(s, ev.contestId ? 0 : 0); }
      if (!s.alive) break;
      if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, 'math'));
      n = 0; while (s.pendingEvent && s.alive && n++ < 60) { const ev = s.pendingEvent; if (ev.contestId) seen++; E.chooseEvent(s, 0); }
      if (!s.alive) break;
      E.simulateWeek(s, s.stats.fatigue > 60 ? 'recovery' : 'balanced', 'normal', null);
    }
    if (!s.alive) continue;
    ok(seen >= 4, `seed ${seed} saw first-year contests (${seen})`);
    for (const r of s.school.contests) {
      if (!r.entered) continue; entered++;
      ok(r.quota === Math.ceil(r.applicants * 0.2 - 1e-9), 'quota is top 20% of applicants');
      const a = s.awards.find((x) => x.id === `contest:${r.id}`);
      ok(!!a === r.rank <= r.quota, 'award iff within quota');
      if (a) { won++; ok(['금상', '은상', '동상'].includes(a.tier), 'tier label'); }
    }
  }
  ok(entered > 30, 'contests were entered');
  ok(won > 0 && won < entered, `some but not all entries win (${won}/${entered})`);
  return { checks };
};

if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Contests: module.exports() }));
