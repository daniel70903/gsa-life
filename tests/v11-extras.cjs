'use strict';
// v0.11: 도움말·저장 백업·버전 안내·결과 카드. 모두 게임 상태를 바꾸지 않는 보조 기능입니다.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../dist/engine.js');
const X = require('../dist/extras-ui.js');
const Card = require('../dist/share-card.js');
globalThis.GSARetrospectiveData = require('../dist/retrospective-data.js');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const copy = (x) => JSON.parse(JSON.stringify(x));

function play(seed) {
  const s = E.create('카드 검증', seed, { gender: 'female' });
  E.setClubs(s, 'physics', 'none');
  const resolve = () => { let n = 0; while (s.pendingEvent && s.alive && n++ < 80) E.chooseEvent(s, 0); };
  let guard = 0;
  while (s.turn < 48 && s.alive && guard++ < 80) {
    if (s.needsGender) E.setGender(s, 'female');
    resolve();
    if (!s.alive) break;
    if (E.needsEnrollment(s)) E.enrollSemester(s, E.recommendEnrollment(s, 'physics'));
    if (E.getPhase(s).needsApplications) E.applyUniversities(s, ['kaist', 'gist', 'dgist']);
    resolve();
    if (!s.alive) break;
    const focus = s.stats.fatigue > 55 || s.stats.stress > 65 || s.illnessWeeks ? 'recovery' : s.turn >= 8 && s.toeic.best < 730 ? 'english' : ['balanced', 'intelligence', 'social', 'research'][s.turn % 4];
    E.simulateWeek(s, focus, 'normal', s.turn >= 32 && E.getFieldStatus(s).canIndependent ? 'fieldresearch' : null);
  }
  resolve();
  return s;
}

module.exports = async function verifyExtras() {
  const counts = { checks: 0 };
  const ok = (v, m) => { counts.checks++; assert.ok(v, m); };

  // 버전 표기는 한곳에서 바뀌어야 새 버전 안내가 맞게 동작합니다.
  const version = JSON.parse(read('dist/version.json')).version;
  assert.equal(version, X.VERSION, 'version.json matches the bundled version');
  assert.equal(X.changelog[0].version, X.VERSION, 'Newest release notes describe the current version');
  const html = read('dist/index.html');
  const assetQueries = [...html.matchAll(/\.(?:js|css)\?v=([\d.]+)"/g)].map((m) => m[1]);
  ok(assetQueries.length >= 20 && assetQueries.every((v) => `v${v}` === X.VERSION), 'Every script and stylesheet URL carries the current version');
  ok(html.indexOf('extras-ui.js') < html.indexOf('app.js') && html.indexOf('share-card.js') < html.indexOf('app.js'), 'Helpers load before the app');
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) ok(html.includes(`"${tag}"`), `Share preview tag ${tag}`);
  ok(fs.existsSync(path.join(__dirname, '../dist/og-image.png')) && fs.existsSync(path.join(__dirname, '../dist/favicon.svg')), 'Preview image and icon are shipped');
  ok(read('README.md').includes(X.VERSION), 'README describes the current version');
  const app = read('dist/app.js');
  ok(app.includes('GSAExtras?.helpButton()') && app.includes('GSAExtras?.init()') && app.includes('GSAShareCard?.init()'), 'App shows the help button and starts the helpers');
  ok(!/v0\.10/.test(app), 'Screen tags show the current version');
  assert.equal(X.compareVersions('v0.12', 'v0.11'), 1);
  assert.equal(X.compareVersions('v0.11', 'v0.11'), 0);
  assert.equal(X.compareVersions('v0.9', 'v0.11'), -1);
  assert.equal(X.compareVersions('v1.0', 'v0.11.3'), 1);

  // 저장 데이터 검증은 앱이 불러오는 기준과 같아야 합니다.
  const fresh = { version: 6, state: E.create('백업', 3, { gender: 'male' }) };
  ok(X.isValidSave(fresh), 'Fresh save is valid');
  for (const n of [2, 3, 4, 5]) for (const f of require(`./v${n}-save-fixtures.json`)) ok(X.isValidSave({ version: n, state: f.state }), `v${n} fixture ${f.label} is accepted`);
  for (const bad of [null, {}, { version: 7, state: fresh.state }, { version: 6 }, { version: 6, state: { ...fresh.state, grades: null } }, { version: 6, state: { ...fresh.state, turn: '3' } }]) ok(!X.isValidSave(bad), 'Invalid save is rejected');

  // 백업 코드와 백업 파일은 원래 저장 데이터를 그대로 되살립니다.
  const played = play(5);
  const save = { version: 6, state: played };
  const code = await X.encodeSave(save);
  ok(code.startsWith('GSALIFE1:z'), 'Backup code is compressed');
  ok(code.length < JSON.stringify(save).length / 3, 'Backup code is much shorter than the save');
  assert.deepEqual(await X.decodeBackup(code), save, 'Backup code round-trips exactly');
  assert.deepEqual(await X.decodeBackup(`  ${code.slice(0, 40)}\n${code.slice(40)}  `), save, 'Line breaks and spaces in a pasted code are ignored');
  const file = X.makeBackupFile(save, new Date('2026-11-19T10:00:00Z'));
  assert.equal(file.gameVersion, X.VERSION);
  assert.deepEqual(await X.decodeBackup(JSON.stringify(file)), save, 'Backup file round-trips');
  assert.deepEqual(await X.decodeBackup(JSON.stringify(save)), save, 'A raw save copied from storage is accepted');
  const migrated = E.migrate(copy((await X.decodeBackup(code)).state));
  assert.equal(migrated.turn, played.turn, 'A restored save opens in the engine');
  assert.equal(X.backupFileName({ state: { name: '김/광:곽 *1' } }, new Date(2026, 10, 9)), 'gsa-life-김_광_곽_1-20261109.json');
  for (const bad of ['', 'GSALIFE1:zAAAA', 'GSALIFE1:q' + code.slice(10), code.slice(0, -30), '{"hello":1}', 'not json']) {
    await assert.rejects(X.decodeBackup(bad), /백업|저장 데이터|코드/, `Rejected: ${bad.slice(0, 20)}`);
    counts.checks++;
  }
  await assert.rejects(X.encodeSave({ version: 6 }), /백업/);

  // 도움말은 실제 졸업·자습 기준과 맞고, 숨겨진 운동부·메달 효과를 드러내지 않습니다.
  const helpText = X.tabs.map((t) => t.render()).join('\n').replace(/<[^>]+>/g, ' ');
  for (const fact of ['730점', '현장연구 6학점', '28학점', '4주차에 중간고사', '8주차에 기말고사', '40%', '60%', '2주 전부터', '1주 전부터', '19개 대학', '1~3곳', '5,000원', '4번']) ok(helpText.includes(fact), `Guide states ${fact}`);
  ok(!/(운동부|메달|교육감배)[^\n]{0,80}(가산점|보너스|선발 확률|선출 가능성)|(가산점|보너스)[^\n]{0,60}(운동부|메달|교육감배)/.test(helpText), 'Guide hides sports and medal modifiers');
  const grad = E.getGraduationStatus(played);
  assert.equal(grad.toeicRequired, 730);
  assert.equal(grad.fieldRequired, 6);
  const phaseAt = (turn) => E.getPhase({ ...copy(played), turn, alive: true });
  ok(phaseAt(1).nightAvailable && !phaseAt(1).dawnAvailable && phaseAt(2).dawnAvailable && !phaseAt(0).nightAvailable, 'Night study opens two weeks and dawn study one week before an exam');
  ok(phaseAt(3).exam === 'midterm' && phaseAt(7).exam === 'final', 'Exams are in weeks 4 and 8');

  // 결과 카드는 회고 기록과 같은 숫자를 보여줍니다.
  const data = globalThis.GSARetrospectiveData.build(played, E);
  const model = Card.buildModel(played, E, data);
  assert.equal(model.name, '카드 검증');
  assert.equal(model.gender, 'female');
  assert.equal(model.gpa, data.metrics.find((m) => /평점/.test(m.label)).value);
  assert.equal(model.awards, data.awards.reduce((n, a) => n + a.count, 0));
  assert.equal(model.terms.length, played.alive ? 6 : model.terms.length);
  assert.deepEqual(model.admissions.map((a) => a.name), data.admissions.map((a) => a.name));
  ok(['graduated', 'deferred', 'death'].includes(model.endingKind) && model.status, 'Finished run has an ending label');
  ok(model.metrics.length === 4 && model.metrics.some((m) => /TOEIC/.test(m.label)), 'Card shows TOEIC and three other records');
  ok(new Set(model.roles).size === model.roles.length, 'Repeated roles are merged');
  const roleModel = Card.buildModel(played, E, { ...data, roles: [{ name: '반장' }, { name: '물리 탐구회 기장' }, { name: '반장' }, { name: '학생회 부회장' }, { name: '학생회 회장' }] });
  assert.deepEqual(roleModel.roles, ['학생회 회장', '학생회 부회장', '물리 탐구회 기장', '반장 ×2']);
  const early = E.create('입학생', 9, { gender: 'male' });
  const earlyModel = Card.buildModel(early, E);
  assert.equal(earlyModel.endingKind, 'ongoing');
  assert.equal(earlyModel.terms.length, 0);
  ok(earlyModel.topStats.length === 5 && earlyModel.topStats[0].value >= earlyModel.topStats[4].value, 'Ongoing card falls back to top abilities');
  assert.deepEqual(played, play(5), 'Building a card does not change the game');

  // 회고 한 장 요약에서 카드를 열 수 있습니다.
  const RUI = require('../dist/retrospective-ui.js').create(E, { player: () => '', avatar: () => '' }, globalThis.GSARetrospectiveData);
  ok(RUI.render(played, { mode: 'summary' }).includes('data-recap-card'), 'Summary has the result card button');
  return counts;
};

if (require.main === module)
  module.exports().then(
    (r) => console.log(JSON.stringify({ result: 'pass', extras: r })),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
