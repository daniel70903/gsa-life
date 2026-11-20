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

// 2) 연애 기능은 꺼져 있습니다: 후보 목록이 비어 있고, 180학점 규칙은 새 게임에 적용됩니다.
for (const gender of ['male', 'female']) {
  const s = E.create('검증', `v14-${gender}`, { gender });
  E.setClubs(s, E.academicClubs[0].id, 'none');
  assert.equal(E.romanceOn(s), false, 'Romance is off in the game');
  assert.deepEqual(E.getRomanceRoster(s), [], 'No romance roster is shown');
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

// 5) 3년 시뮬레이션(2주 단위): 연애 사건이 전혀 나오지 않고, 선택 횟수가 적습니다.
const N = 60;
let decisions = 0, spans = 0;
for (let seed = 1; seed <= N; seed++) {
  const s = E.create('검증', 14000 + seed, { gender: seed % 2 ? 'male' : 'female' });
  E.setClubs(s, E.academicClubs[seed % 12].id, 'none');
  const settle = () => { let k = 0; while (s.pendingEvent && s.alive && k++ < 120) { const e = s.pendingEvent; assert.ok(!/^campus_romance_/.test(e.id) && !e.dm, `No romance scenes: ${e.id}`); decisions++; E.chooseEvent(s, seed % e.choices.length); } };
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
  assert.ok(!(s.romance.relationships > 0), 'Nobody dates');
}
assert.ok(spans / N <= 26, `About 24 steps per run: ${(spans / N).toFixed(1)}`);
assert.ok(decisions / N <= 45, `Choices per run stay near 40: ${(decisions / N).toFixed(1)}`);
console.log('v14 features ok', { stepsPerRun: +(spans / N).toFixed(1), decisionsPerRun: +(decisions / N).toFixed(1) });

// 6) 졸업 엔딩 메시지: 같은 성별 친구가 보내고, 답장 검사(욕설·개인정보 차단).
{
  const G = require('../dist/ending-ui.js');
  for (const gender of ['male', 'female']) {
    const end = E.create('검증', `v14-ending-${gender}`, { gender });
    E.setClubs(end, E.academicClubs[0].id, 'none');
    end.turn = 42;
    const who = G.sender(end);
    assert.equal(who.kind, 'friend');
    assert.equal(who.person.gender, gender, 'The ending message comes from a same-gender friend');
    assert.ok(G.html(end).includes('졸업식 날 밤') && G.html(end).includes('ending-consent'), 'The ending asks for consent before sending');
    assert.ok(!/연애|연인|사귀/.test(G.html(end)), 'No romance wording in the ending');
  }
  assert.equal(G.check('응 잘 지냈어! 너도 대학 가서 잘 지내', ''), null);
  assert.ok(G.check('', ''), 'Empty replies are rejected');
  assert.ok(G.check('x'.repeat(G.MAX + 1), ''), 'Replies are limited to 200 characters');
  assert.ok(G.check('연락해 010-1234-5678', ''), 'Phone numbers are blocked');
  assert.ok(G.check('내 인스타 @gsa_life_123', ''), 'SNS handles are blocked');
  assert.ok(G.check('씨발 뭐야', ''), 'Rude words are blocked');
  assert.deepEqual(Object.keys(G.SCRIPTS), ['friend']);
}

// 7) 패치노트·도움말에 연애 이야기가 없습니다.
{
  const src = fs.readFileSync(path.join(__dirname, '../dist/extras-ui.js'), 'utf8');
  assert.ok(!/연애|고백|광곽톡|교제|커플/.test(src), 'Patch notes and help never mention romance');
}
