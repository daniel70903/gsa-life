// v0.14: 연애 중심 개편, 복잡도 감소, 서울대 모집단위, 졸업 180학점을 검증합니다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../dist/engine.js');

// 1) 연애 문구에는 스킨십·부적절한 표현이 없고, 메신저 창은 자체 이름(광곽톡)만 씁니다.
const campusSource = fs.readFileSync(path.join(__dirname, '../dist/campus-systems.js'), 'utf8');
const banned = /(키스|뽀뽀|스킨십|입맞춤|껴안|포옹|끌어안|안아 ?줬|손을 ?잡|손잡|야한|섹시|19금|술자리|담배|인스타|Instagram|DM 브랜드)/;
assert.ok(!banned.test(campusSource), 'Romance prose avoids physical-contact and inappropriate wording');
assert.ok(campusSource.includes("app: '광곽톡'"), 'Messenger scenes use the in-game 광곽톡 name');

// 2) 이성 후보만 보입니다.
for (const gender of ['male', 'female']) {
  const s = E.create('검증', `v14-${gender}`, { gender });
  E.setClubs(s, E.academicClubs[0].id, 'none');
  const roster = E.getRomanceRoster(s);
  assert.equal(roster.length, 3);
  assert.ok(roster.every(p => p.gender !== gender), `${gender} players only see opposite-gender classmates`);
  const target = E.romanceCandidates.find(p => p.id === s.romance.targetId);
  assert.notEqual(target.gender, gender, 'The default romance target is opposite-gender');
  assert.equal(s.romance.records[target.id].partnerName, target.name, 'The default target keeps its own name');
  assert.equal(s.creditRule, 180, 'New games use the 180-credit graduation rule');
  assert.ok(E.getGraduationStatus(s).requirements?.some?.(r => r.id === 'total') ?? true);
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

// 5) 3년 시뮬레이션(2주 단위): 연애 분포, 기념일, DM, 선택 횟수.
const N = 90, dist = [0, 0, 0, 0], seasons = new Set();
let decisions = 0, dmScenes = 0, spans = 0;
for (let seed = 1; seed <= N; seed++) {
  const s = E.create('검증', 14000 + seed, { gender: seed % 2 ? 'male' : 'female' });
  E.setClubs(s, E.academicClubs[seed % 12].id, 'none');
  const choose = e => {
    if (e.id === 'campus_romance_season') seasons.add(e.season);
    assert.ok(!/^campus_romance_(meet|chat)$/.test(e.id), 'Routine romance encounters run automatically in two-week mode');
    if (e.dm) { dmScenes++; assert.equal(e.dm.app, '광곽톡'); assert.ok(e.dm.messages.length >= 1 && e.choices.length <= 3, 'DM scenes keep few choices'); }
    if (/^campus_romance_/.test(e.id)) return 0;
    return seed % e.choices.length;
  };
  const settle = () => { let k = 0; while (s.pendingEvent && s.alive && k++ < 120) { decisions++; E.chooseEvent(s, choose(s.pendingEvent)); } };
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
  dist[Math.min(3, s.romance.relationships || 0)]++;
  for (const r of Object.values(s.romance.records)) if (r.stage === 'dating' || r.stage === 'ended') {
    const person = E.romanceCandidates.find(p => p.id === r.characterId);
    assert.notEqual(person.gender, s.gender, 'Relationships are opposite-gender only');
  }
}
const pct = dist.map(n => n / N);
assert.ok(pct[0] >= 0.25 && pct[0] <= 0.6, `About 40% never date: ${dist}`);
assert.ok(pct[1] >= 0.3 && pct[1] <= 0.65, `About half date once: ${dist}`);
assert.ok(pct[2] <= 0.2, `Two relationships stay rare: ${dist}`);
assert.equal(dist[3], 0, 'Nobody dates three times in three years');
assert.ok(seasons.size >= 4, `Seasonal events appear: ${[...seasons]}`);
assert.ok(dmScenes > 0, 'Important scenes open the messenger window');
assert.ok(spans / N <= 26, `About 24 steps per run: ${(spans / N).toFixed(1)}`);
assert.ok(decisions / N <= 48, `Choices per run stay near 40: ${(decisions / N).toFixed(1)}`);
console.log('v14 features ok', { dist, seasons: [...seasons], dmScenes, stepsPerRun: +(spans / N).toFixed(1), decisionsPerRun: +(decisions / N).toFixed(1) });
