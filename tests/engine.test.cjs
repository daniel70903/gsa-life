const assert = require('node:assert/strict');
const E = require('../dist/engine.js');

function run(seed, strategy) {
  const s = E.create('테스트 학생', seed);
  E.setClubs(s, 'physics', 'basketball');
  let steps = 0;
  while (!E.getPhase(s).isEnd) {
    if (s.pendingEvent) E.chooseEvent(s, 0);
    if (E.getPhase(s).needsElectives) E.chooseElectives(s, ['advanced_physics', 'advanced_math']);
    const p = E.getPhase(s);
    const action = strategy(s, p);
    const result = E.advance(s, action, p.exam && s.stats.health >= 65 ? 'dawn' : 'normal');
    assert.equal(s.turn, ++steps);
    assert.ok(Array.isArray(result.messages));
    for (const [key, value] of Object.entries(s.stats)) assert.ok(Number.isFinite(value) && value >= 0 && value <= 100, key);
    assert.equal(JSON.stringify(JSON.parse(JSON.stringify(s))), JSON.stringify(s));
  }
  assert.equal(steps, 48);
  assert.equal(s.grades.length, 6);
  assert.equal(E.getProfile(s).attemptedCredits, 120);
  for (const g of s.grades) { assert.ok(g.gpa >= 0 && g.gpa <= 4.3); assert.equal(g.credits, 20); }
  const admissions = E.applyUniversities(s, ['seoul', 'kaist', 'gist']);
  assert.equal(admissions.length, 4);
  assert.ok(admissions.find(a => a.id === 'new_path').accepted);
  const copy = JSON.stringify(admissions);
  assert.equal(JSON.stringify(E.applyUniversities(s, ['chonnam'])), copy, 'Cannot reroll applications');
  assert.throws(() => E.advance(s, 'study'));
  return s;
}

let totalGpa = 0;
for (let seed = 0; seed < 100; seed++) {
  const strategy = (s, p) => s.stats.health < 40 || s.stats.stress > 65 ? 'rest' : E.actions[(seed + s.turn) % E.actions.length].id;
  const s = run(seed, strategy);
  const same = run(seed, strategy);
  assert.deepEqual(s, same, 'Seed is deterministic');
  totalGpa += E.getProfile(s).gpa;
}
const s = E.create('<script>', 22);
assert.throws(() => E.advance(s, 'study'));
assert.throws(() => E.setClubs(s, 'bad', 'none'));
E.setClubs(s, 'ai', 'none');
assert.throws(() => E.setClubs(s, 'physics', 'soccer'));
assert.throws(() => E.chooseElectives(s, ['advanced_ai', 'advanced_math']));
assert.throws(() => E.advance(s, 'study', 'night'));
assert.throws(() => E.advance(s, 'bad'));
assert.throws(() => E.applyUniversities(s, ['seoul']));
for (let n = 0; n < 3; n++) E.advance(s, 'study');
assert.ok(s.pendingEvent);
assert.throws(() => E.advance(s, 'study'));
assert.throws(() => E.chooseEvent(s, -1));
E.chooseEvent(s, 0);
while (s.turn < 24) { if (s.pendingEvent) E.chooseEvent(s, 0); E.advance(s, 'rest'); }
assert.equal(E.getPhase(s).year, 2);
assert.equal(E.getPhase(s).semester, 2);
assert.ok(E.getPhase(s).needsElectives);
assert.throws(() => E.advance(s, 'study'));
assert.throws(() => E.chooseElectives(s, ['advanced_ai', 'advanced_ai']));
E.chooseElectives(s, ['advanced_ai', 'advanced_math']);
assert.equal(E.getSubjects(s).reduce((a, x) => a + x.credits, 0), 20);
assert.throws(() => E.chooseElectives(s, ['advanced_ai', 'advanced_physics']));

const study = run(7, s => s.stats.health < 40 || s.stats.stress > 65 ? 'rest' : 'study');
const leisure = run(7, () => 'friends');
assert.ok(E.getProfile(study).gpa > E.getProfile(leisure).gpa, 'Study choices should affect grades');
assert.ok(leisure.relationships > study.relationships, 'Friend choices should affect relationships');
const independent = E.create('자율 활동 학생', 3);
E.setClubs(independent, 'physics', 'none');
E.advance(independent, 'club');
assert.equal(independent.clubWeeks, 0, 'Self-directed activity is not club participation');
E.advance(independent, 'academic');
assert.equal(independent.clubWeeks, 1, 'Academic club participation still counts');
while (independent.turn < 29) {
  if (independent.pendingEvent) E.chooseEvent(independent, 0);
  if (E.getPhase(independent).needsElectives) E.chooseElectives(independent, ['advanced_physics', 'advanced_math']);
  E.advance(independent, 'academic');
}
assert.equal(independent.pendingEvent.id, 'club_captain');
E.chooseEvent(independent, 0);
assert.equal(independent.captain, true);
assert.equal(independent.captainClub, '물리 탐구회', 'An independent student can captain their academic club');
console.log(JSON.stringify({ result: 'pass', seededFullRuns: 200, mixedAverageGpa: Math.round(totalGpa) / 100, studyGpa: E.getProfile(study).gpa, friendsGpa: E.getProfile(leisure).gpa }));
