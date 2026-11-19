'use strict';
// v0.13 입시: 14개 대학, 수시 6장 + 과학기술원 별도, 학년 석차 중심 종합 평가, 면접은 일부 대학만.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const oldFixtures = require('./v7-save-fixtures.json');
const originalIds = ['seoul', 'kaist', 'postech', 'gist', 'unist', 'dgist', 'chonnam'];
function applicant(percentile = 0.5, seed = 123) {
  const s = E.create('입시 검증', seed, { gender: 'male' });
  for (const turn of [21, 28, 35]) {
    s.turn = turn;
    E.enrollSemester(s, E.recommendEnrollment(s, 'physics'));
  }
  s.turn = 38;
  s.grades = [{ year: 2, semester: 2, credits: 10, earnedCredits: 10, subjects: [{ credits: 10, point: 4 }] }];
  for (const key of ['research', 'discipline', 'leadership', 'social', 'luck']) s.stats[key] = 60;
  s.applicationSnapshot = { gpa: 4, percentile, research: 70 };
  return s;
}
function settle(s, answer = 0) {
  let count = 0;
  while (s.pendingEvent) { assert.ok(++count <= 30); E.chooseEvent(s, answer); }
}
const active = E.universities.filter(u => !u.legacy);
const expected = ['seoul', 'kaist', 'postech', 'gist', 'dgist', 'unist', 'yonsei', 'korea', 'sogang', 'sungkyunkwan', 'hanyang', 'chungang', 'kyunghee', 'uos'];
assert.deepEqual(active.map(u => u.id).sort(), expected.slice().sort(), 'v0.13 catalog has the 14 planned universities');
assert.equal(new Set(E.universities.map(u => u.id)).size, E.universities.length);
assert.deepEqual(active.filter(u => u.exempt).map(u => u.id).sort(), ['dgist', 'gist', 'kaist', 'unist'], 'Only the four institutes are outside the 6-application limit');
assert.ok(!E.universities.find(u => u.id === 'postech').exempt, 'POSTECH counts toward the six');
assert.equal(E.unitName('seoul', 'physics'), '물리·천문학부');
assert.match(E.unitName('kaist', 'physics'), /무학과/);

// Cohort standing drives the result; every campus stays fallible.
for (const u of active) {
  const high = E.getAdmissionChance(applicant(0.95), u.id, 12);
  const low = E.getAdmissionChance(applicant(0.1), u.id, 12);
  assert.ok(high > low, `${u.id}: cohort rank changes the outcome`);
  assert.ok(high < 1, `${u.id}: top rank does not guarantee acceptance`);
  if (u.interview) assert.ok(E.getAdmissionChance(applicant(0.5), u.id, 24) > E.getAdmissionChance(applicant(0.5), u.id, -6), `${u.id}: interview matters`);
}
// Seoul stays hardest for matched records (outside olympiad recognition at the institutes).
for (const p of [0.2, 0.5, 0.8, 1]) for (const interview of [-6, 10, 24]) {
  const s = applicant(p);
  const hardest = E.getAdmissionChance(s, 'seoul', interview);
  for (const u of active.filter(u => u.id !== 'seoul')) assert.ok(hardest <= E.getAdmissionChance(s, u.id, interview) + 1e-9, `${u.id}: Seoul stays hardest at p=${p}`);
}
// Department competition: CS is harder than earth science at the same university.
{ const s = applicant(0.5); s.applicationMajors = { seoul: 'computer' }; const cs = E.getAdmissionChance(s, 'seoul', 10); s.applicationMajors = { seoul: 'earth' }; assert.ok(cs < E.getAdmissionChance(s, 'seoul', 10), 'CS is more competitive'); }
// Awards help.
{ const plain = applicant(0.5), decorated = applicant(0.5); decorated.awards = [{ kind: 'contest' }, { kind: 'contest' }, { kind: 'subject' }]; assert.ok(E.getAdmissionChance(decorated, 'yonsei') > E.getAdmissionChance(plain, 'yonsei')); }

// Application limits: six general + institutes separately; legacy campuses are closed.
{
  const s = applicant(); delete s.applicationSnapshot;
  assert.throws(() => E.applyUniversities(copy(s), ['seoul', 'yonsei', 'korea', 'postech', 'sogang', 'hanyang', 'chungang']), /6장/);
  assert.throws(() => E.applyUniversities(copy(s), ['chonnam']));
  const ok = copy(s);
  E.applyUniversities(ok, ['seoul', 'yonsei', 'korea', 'postech', 'sogang', 'hanyang', 'kaist', 'gist', 'dgist', 'unist']);
  assert.equal(ok.applications.length, 10);
  assert.ok(Number.isFinite(ok.applicationSnapshot.percentile));
  settle(ok);
  const interviewed = ok.universityInterviews.filter(i => !i.documentOnly).map(i => i.id).sort();
  assert.deepEqual(interviewed, ['dgist', 'gist', 'kaist', 'postech', 'seoul'], 'Only interview campuses hold interviews');
  for (const i of ok.universityInterviews) assert.equal(i.answers.length, i.documentOnly ? 0 : 2);
  assert.equal(ok.universityInterviews.length, 10);
}

// The submitted standing is the one evaluated.
{
  const s = applicant(); delete s.applicationSnapshot;
  E.applyUniversities(s, ['seoul', 'yonsei', 'chungang']);
  const p = s.applicationSnapshot.percentile;
  s.grades[0].subjects[0].point = 0;
  assert.equal(E.getAdmissionStatus(s, 'seoul').percentile, p);
}

// Every campus reaches a real result.
for (const u of active) for (const roll of [0, 0.999999]) {
  const s = applicant(); delete s.applicationSnapshot;
  E.applyUniversities(s, [{ universityId: u.id, majorId: 'general' }]);
  settle(s);
  assert.equal(s.universityInterviews[0].id, u.id);
  s.turn = 40;
  s.admissionRolls[u.id] = roll;
  s.pendingEvent = { id: 'university_results', choices: [{ resolveAdmissions: true }] };
  E.chooseEvent(s, 0);
  assert.equal(s.admissions[0].name, u.name);
  assert.equal(s.admissions[0].accepted, roll === 0);
  assert.match(s.admissions[0].reason, /게임/);
}

// Olympiad recognition helps prepared applicants at the institutes; very low standing still hurts.
for (const id of ['kaist', 'gist', 'unist', 'dgist']) {
  const prepared = applicant(0.5), weak = applicant(0);
  const ordinary = E.getAdmissionChance(prepared, id, 0);
  prepared.awards = weak.awards = [{ kind: 'olympiad' }];
  const boosted = E.getAdmissionChance(prepared, id, 0);
  assert.ok(boosted >= .9 && boosted < 1 && boosted > ordinary);
  assert.ok(E.getAdmissionChance(weak, id, 0) < boosted);
}

// Updating a save fills only absent rolls and never rerolls established results or RNG.
for (const fixture of oldFixtures) {
  const before = copy(fixture.state), migrated = E.migrate(copy(before));
  assert.equal(migrated.rng, before.rng);
  for (const id of originalIds) if (Number.isFinite(before.admissionRolls[id])) assert.equal(migrated.admissionRolls[id], before.admissionRolls[id]);
  for (const u of E.universities) assert.ok(Number.isFinite(migrated.admissionRolls[u.id]));
  assert.deepEqual(migrated.admissions, before.admissions);
  assert.deepEqual(migrated.grades, before.grades);
  const expectedSnapshot = copy(before.applicationSnapshot); (function walk(o) { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { if ((k === 'turn' || /Turn$/.test(k)) && Number.isInteger(o[k]) && o[k] <= 48) o[k] = E.legacyWeekToNew(o[k]); else walk(o[k]); } })(expectedSnapshot);
  assert.deepEqual(migrated.applicationSnapshot, expectedSnapshot, 'v0.13.2: only the week number moves to the 7-week calendar');
  assert.deepEqual(E.migrate(copy(migrated)), migrated);
}
const original = E.create('이전 추첨 유지', 42, { gender: 'male' }), withoutNewRolls = copy(original);
for (const u of E.universities.filter(u => !originalIds.includes(u.id))) delete withoutNewRolls.admissionRolls[u.id];
assert.deepEqual(E.migrate(withoutNewRolls).admissionRolls, original.admissionRolls);
console.log(JSON.stringify({ result: 'pass', campuses: active.length, legacySaves: oldFixtures.length }));
