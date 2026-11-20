'use strict';
// v0.12: 시작 화면, 튜토리얼, 컴패리즌(닮은 과학자), 기록실.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../dist/engine.js');
const C = require('../dist/scientists.js');
globalThis.GSAComparison = C;
const R = require('../dist/retrospective-data.js');
const RUI = require('../dist/retrospective-ui.js');
const Card = require('../dist/share-card.js');
const T = require('../dist/title-ui.js');
const TU = require('../dist/tutorial-ui.js');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const copy = (x) => JSON.parse(JSON.stringify(x));

function play(seed, focus = 'balanced', club = 'physics') {
  const s = E.create('컴패리즌', seed, { gender: seed % 2 ? 'male' : 'female' });
  E.setClubs(s, club, 'none');
  const resolve = () => { let n = 0; while (s.pendingEvent && s.alive && n++ < 80) E.chooseEvent(s, (seed + n) % s.pendingEvent.choices.length); };
  let guard = 0;
  while (s.turn < 42 && s.alive && guard++ < 80) {
    if (s.needsGender) E.setGender(s, 'male');
    resolve();
    if (!s.alive) break;
    if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, club));
    if (E.getPhase(s).needsApplications) E.applyUniversities(s, ['kaist', 'gist', 'dgist']);
    resolve();
    if (!s.alive) break;
    const f = s.stats.fatigue > 55 || s.stats.stress > 65 || s.illnessWeeks ? 'recovery' : s.turn % 3 ? focus : 'balanced';
    E.simulateWeek(s, f, 'normal', s.turn >= 28 && E.getFieldStatus(s).canIndependent ? 'fieldresearch' : null);
  }
  resolve();
  return s;
}

module.exports = function verifyTitleAndComparison() {
  const counts = { checks: 0 };
  const ok = (v, m) => { counts.checks++; assert.ok(v, m); };

  // 인물 데이터는 모든 능력치·분야를 갖추고, 소개 문구가 비어 있지 않습니다.
  ok(C.scientists.length >= 24, 'A large enough roster to collect');
  assert.equal(new Set(C.scientists.map((s) => s.id)).size, C.scientists.length, 'Scientist ids are unique');
  for (const sc of C.scientists) {
    assert.equal(sc.t.length, C.STATS.length, `${sc.name} has every trait`);
    ok(sc.t.every((v) => Number.isInteger(v) && v >= -2 && v <= 2), `${sc.name} traits stay in range`);
    ok(Object.keys(sc.f).length && Object.keys(sc.f).every((f) => C.FIELDS.includes(f)), `${sc.name} fields are known`);
    for (const key of ['name', 'en', 'years', 'tag', 'known', 'story']) ok(String(sc[key] || '').length > 1, `${sc.name} has ${key}`);
  }
  for (const f of C.FIELDS) ok(C.scientists.some((sc) => sc.f[f]), `Someone represents ${C.FIELD_LABELS[f]}`);
  // 측우기는 장영실이 아닌 세자(문종)의 고안으로 보는 연구가 있어 소개에 넣지 않습니다.
  ok(!/측우기/.test(C.get('jangyeongsil').known + C.get('jangyeongsil').story), 'Rain gauge is not credited to Jang Yeong-sil');

  // 비교 결과는 결정적이고 게임 상태를 바꾸지 않습니다.
  const fresh = E.create('입학생', 4, { gender: 'female' });
  E.setClubs(fresh, 'biology', 'none');
  const before = copy(fresh);
  const early = C.compare(fresh, E);
  assert.deepEqual(fresh, before, 'Comparing does not change the game');
  assert.deepEqual(C.compare(fresh, E), early, 'Same record gives the same match');
  ok(early.best && early.others.length === 2 && early.best.id !== early.others[0].id, 'Best match and two runners-up');
  ok(early.fields.biology > early.fields.physics, 'Academic club steers the field');
  ok(early.best.similarity >= 41 && early.best.similarity <= 98, 'Similarity is a friendly percentage');
  ok(early.best.similarity >= early.others[0].similarity && early.others[0].similarity >= early.others[1].similarity, 'Runners-up are ordered');
  ok(/연구자$/.test(early.type.future), 'Future type reads as a researcher');

  const runs = [];
  const focuses = ['intelligence', 'social', 'athletics', 'research', 'leadership', 'discipline'];
  const clubs = ['physics', 'math', 'chemistry', 'biology', 'ai'];
  for (let seed = 1; seed <= 18; seed++) runs.push(play(seed, focuses[seed % focuses.length], clubs[seed % clubs.length]));
  const matches = runs.map((s) => C.compare(s, E));
  const distinct = new Set(matches.map((m) => m.best.id));
  ok(distinct.size >= 6, `Different lives meet different scientists (${distinct.size})`);
  for (const m of matches) {
    ok(!/(자기관리|이휘소)이 /.test(m.best.reason.text) && !/[가-힣]이 돋보이는/.test(m.best.reason.text.replace(/(지능|사회성|운동|행운|창의성|회복력|리더십|연구 역량)이 돋보이는/, '')), `Korean particles are correct: ${m.best.reason.text}`);
  }
  const mathRun = runs.find((s) => s.academicClub === 'integral');
  ok(C.compare(mathRun, E).fields.math >= 0.3, 'Math club and electives count toward mathematics');

  // 회고 마지막 장과 한 장 요약에 컴패리즌이 나옵니다.
  const finished = runs.find((s) => s.alive && s.turn >= 42) || runs[0];
  const data = R.build(finished, E);
  ok(data.comparison && data.comparison.best.id === C.compare(finished, E).best.id, 'Recap carries the comparison');
  assert.equal(data.slides.at(-1).id, 'comparison', 'Comparison is the last chapter before the summary card');
  assert.equal(new Set(data.slides.map((s) => s.id)).size, data.slides.length);
  const ui = RUI.create(E, { player: () => '', avatar: () => '' }, R);
  const summary = ui.render(finished, { mode: 'summary' });
  ok(summary.includes('recap-comparison') && summary.includes(data.comparison.best.name), 'Summary shows the matched scientist');
  ok(!/연구자이 될지도/.test(summary), 'Particle after 연구자 is 가');
  const lastSlide = ui.render(finished, { mode: 'slides', page: data.slides.length - 1 });
  ok(lastSlide.includes('MY SCIENTIST MATCH'), 'Last slide introduces the match');

  // 결과 카드에도 닮은 과학자가 담깁니다.
  const model = Card.buildModel(finished, E, data);
  assert.equal(model.comparison.name, data.comparison.best.name);
  assert.equal(model.comparison.similarity, data.comparison.best.similarity);

  // 기록실은 마친 이야기만 한 줄로 남기고, 같은 이야기는 덮어씁니다.
  assert.equal(T.endingKind(fresh), null);
  assert.equal(T.summarize(fresh, E), null, 'Unfinished lives are not archived');
  const record = T.summarize(finished, E, new Date('2026-11-19T00:00:00Z'));
  ok(record && record.scientist && record.scientist.id === data.comparison.best.id, 'Archive keeps the matched scientist');
  ok(['graduated', 'deferred', 'death'].includes(record.ending));
  let list = T.upsert([], record);
  list = T.upsert(list, { ...record, gpa: '9.99' });
  assert.equal(list.length, 1, 'Same life is updated, not duplicated');
  assert.equal(list[0].gpa, '9.99');
  for (let i = 0; i < 40; i++) list = T.upsert(list, { ...record, key: `k${i}` });
  assert.equal(list.length, 30, 'Archive keeps the latest 30 lives');
  assert.equal(list[0].key, 'k39');
  assert.equal(T.unlockedScientists([record, { key: 'x', scientist: null }]).size, 1);
  assert.equal(T.progressLabel({ turn: 8, alive: true }), '1학년 2학기 2주차');
  assert.equal(T.progressLabel({ turn: 42, alive: true, ending: 'graduated' }), '졸업');
  assert.equal(T.progressLabel({ turn: 18, alive: false }), '이야기의 마지막');

  // 튜토리얼이 가리키는 화면 요소가 실제로 존재합니다.
  const sources = ['dist/app.js', 'dist/extras-ui.js', 'dist/character-ui.js'].map(read).join('\n');
  for (const step of TU.steps) {
    for (const part of step.sel.split(/\s+/)) {
      const token = part.startsWith('#') ? `id="${part.slice(1)}"` : part.startsWith('.') ? `${part.slice(1)}` : part.slice(1, -1);
      ok(sources.includes(token), `Tutorial target ${step.sel} (${token}) exists`);
    }
  }
  ok(TU.steps.at(-1).last && TU.steps.some((s) => s.wait), 'Tutorial waits for the player and ends cleanly');

  // 시작 화면과 새 모듈이 연결되어 있습니다.
  const html = read('dist/index.html');
  ok(html.indexOf('scientists.js') < html.indexOf('retrospective-data.js'), 'Comparison data loads before the recap');
  for (const f of ['title-ui.js', 'tutorial-ui.js']) ok(html.indexOf(f) > 0 && html.indexOf(f) < html.indexOf('app.js'), `${f} loads before the app`);
  ok(html.includes('title-ui.css'), 'Title styles are linked');
  const app = read('dist/app.js');
  ok(app.includes('window.GSAApp={') && app.includes('reset:resetGame') && app.includes('GSATitle?.init()'), 'App exposes reset and opens the title screen');
  ok(app.includes('data-gx-title'), 'Sidebar returns to the title screen');
  return counts;
};

if (require.main === module) console.log(JSON.stringify({ result: 'pass', titleAndComparison: module.exports() }));
