'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const oldFixtures = require('./v7-save-fixtures.json');
const originalIds = ['seoul', 'kaist', 'postech', 'gist', 'unist', 'dgist', 'chonnam'];
function applicant(gpa, seed = 123) {
  const s = E.create('입시 검증', seed, { gender: 'male' });
  for (const turn of [24, 32]) {
    s.turn = turn;
    E.enrollSemester(s, E.recommendEnrollment(s, 'physics'));
  }
  s.turn = 36;
  s.grades = [{ year: 2, semester: 2, credits: 10, earnedCredits: 10, subjects: [{ credits: 10, point: gpa }] }];
  for (const key of ['research', 'discipline', 'leadership', 'social', 'luck']) s.stats[key] = 50;
  return s;
}
function settle(s, answer = 0) {
  let count = 0;
  while (s.pendingEvent) { assert.ok(++count <= 12); E.chooseEvent(s, answer); }
}

assert.equal(E.universities.length, 19);
assert.equal(new Set(E.universities.map(u => u.id)).size, 19);
for (const id of ['yonsei', 'korea', 'sungkyunkwan', 'sogang', 'hanyang', 'chungang', 'kyunghee', 'uos', 'hufs', 'konkuk', 'dongguk', 'hongik']) {
  const university = E.universities.find(u => u.id === id);
  assert.ok(university && university.difficulty && university.group);
}

// A strict game-only cutoff is enforced even with perfect activities and answers.
for (const gpa of [0, 3.99, 4]) {
  const s = applicant(gpa);
  for (const key of ['research', 'discipline', 'leadership', 'social', 'luck']) s.stats[key] = 100;
  s.awards = [{ kind: 'olympiad' }];
  assert.equal(E.getAdmissionStatus(s, 'seoul').eligible, false);
  assert.equal(E.getAdmissionChance(s, 'seoul', 24), 0);
}
assert.ok(E.getAdmissionStatus(applicant(4.01), 'seoul').eligible);
assert.ok(E.getAdmissionChance(applicant(4.01), 'seoul', 24) > 0);

// Every campus remains fallible; academic improvement and interview quality matter.
for (const university of E.universities) {
  const high = E.getAdmissionChance(applicant(4.3), university.id, 12);
  const low = E.getAdmissionChance(applicant(3), university.id, 12);
  assert.ok(high > low, `${university.id}: grades change the outcome`);
  assert.ok(high < 1, `${university.id}: high marks do not guarantee acceptance`);
  const s = applicant(university.id === 'seoul' ? 4.1 : university.gradeTarget);
  assert.ok(E.getAdmissionChance(s, university.id, 24) > E.getAdmissionChance(s, university.id, -6));
}
for (const gpa of [4.01, 4.1, 4.2, 4.3]) for (const research of [0, 25, 50, 75, 100]) for (const stats of [0, 50, 100]) for (const interview of [-6, 0, 12, 24]) {
  const s = applicant(gpa);
  s.stats.research = research;
  for (const key of ['discipline', 'leadership', 'social', 'luck']) s.stats[key] = stats;
  const hardest = E.getAdmissionChance(s, 'seoul', interview);
  for (const u of E.universities.filter(u => u.id !== 'seoul')) assert.ok(hardest <= E.getAdmissionChance(s, u.id, interview), `${u.id}: Seoul stays hardest for matched records`);
}

// The submitted GPA is the one evaluated; later transcript edits do not silently change it.
const frozen = applicant(4);
E.applyUniversities(frozen, ['seoul', 'yonsei', 'chungang']);
assert.equal(frozen.applicationSnapshot.gpa, 4);
frozen.grades[0].subjects[0].point = 4.3;
assert.equal(E.getAdmissionStatus(frozen, 'seoul').gpa, 4);
assert.equal(E.getAdmissionChance(frozen, 'seoul', 24), 0);
settle(frozen);
frozen.turn = 39;
frozen.pendingEvent = { id: 'university_results', choices: [{ resolveAdmissions: true }] };
frozen.admissionRolls.seoul = 0;
E.chooseEvent(frozen, 0);
assert.equal(frozen.admissions.find(a => a.id === 'seoul').accepted, false);
assert.match(frozen.admissions.find(a => a.id === 'seoul').reason, /게임/);

// Every new catalog entry reaches its own three-question interview and a real result.
for (const u of E.universities) for (const roll of [0, 0.999999]) {
  const s = applicant(4.3);
  E.applyUniversities(s, [{ universityId: u.id, majorId: 'general' }]);
  assert.ok(s.pendingEvent.title.startsWith(u.name));
  settle(s);
  assert.equal(s.universityInterviews[0].id, u.id);
  assert.equal(s.universityInterviews[0].answers.length, 3);
  s.turn = 39;
  s.admissionRolls[u.id] = roll;
  s.pendingEvent = { id: 'university_results', choices: [{ resolveAdmissions: true }] };
  E.chooseEvent(s, 0);
  assert.equal(s.admissions[0].name, u.name);
  assert.equal(s.admissions[0].accepted, roll === 0);
}

// A strong award helps prepared applicants while low grades still reduce the bonus.
for (const id of ['kaist', 'gist', 'unist', 'dgist']) {
  const prepared = applicant(3.8), weak = applicant(2);
  const ordinary = E.getAdmissionChance(prepared, id, 0);
  prepared.awards = weak.awards = [{ kind: 'olympiad' }];
  const boosted = E.getAdmissionChance(prepared, id, 0);
  assert.ok(boosted >= .9 && boosted < 1 && boosted > ordinary);
  assert.ok(E.getAdmissionChance(weak, id, 0) < .05);
}

// Updating a save fills only absent rolls and never rerolls established results or RNG.
for (const fixture of oldFixtures) {
  const before = copy(fixture.state), migrated = E.migrate(copy(before));
  assert.equal(migrated.rng, before.rng);
  for (const id of originalIds) if (Number.isFinite(before.admissionRolls[id])) assert.equal(migrated.admissionRolls[id], before.admissionRolls[id]);
  for (const u of E.universities) assert.ok(Number.isFinite(migrated.admissionRolls[u.id]));
  assert.deepEqual(migrated.admissions, before.admissions);
  assert.deepEqual(migrated.grades, before.grades);
  assert.deepEqual(migrated.applicationSnapshot, before.applicationSnapshot);
  assert.deepEqual(E.migrate(copy(migrated)), migrated);
}
const original = E.create('이전 추첨 유지', 42, { gender: 'male' }), withoutNewRolls = copy(original);
for (const u of E.universities.filter(u => !originalIds.includes(u.id))) delete withoutNewRolls.admissionRolls[u.id];
assert.deepEqual(E.migrate(withoutNewRolls).admissionRolls, original.admissionRolls);
console.log(JSON.stringify({ result: 'pass', campuses: E.universities.length, matchedProfiles: 240, interviewAndResultPaths: 38, legacySaves: oldFixtures.length }));
