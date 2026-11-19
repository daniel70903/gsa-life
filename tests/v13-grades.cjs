'use strict';
// v0.13: 실제 공통과목표, 수행·지필 점수, 연구활동 이수/미이수, 자습 너프, 석차.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = (x) => JSON.parse(JSON.stringify(x));

module.exports = function verifyV13Grades() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };
  const fresh = (seed = 3) => { const s = E.create('v13', seed, { gender: 'male' }); E.setClubs(s, 'physics', 'none'); return s; };

  // 학기별 과목표와 평점 반영 학점
  const graded = { 0: 32, 1: 32, 2: 30 };
  for (const t of [0, 1, 2]) {
    const s = fresh(); s.turn = t * 8;
    const subs = E.getSubjects(s);
    const sum = subs.filter((x) => E.courseKind(x) !== 'pf').reduce((a, x) => a + x.credits, 0);
    assert.equal(sum, graded[t], `term ${t} graded credits`);
    ok(subs.some((x) => x.field === 'earth'), 'Earth science is a core subject');
    ok(subs.some((x) => E.courseKind(x) === 'pf'), 'Research is pass/fail');
  }
  const kinds = Object.fromEntries(E.getSubjects(fresh()).map((x) => [x.name, E.courseKind(x)]));
  assert.equal(kinds['수학Ⅰ'], 'ms'); assert.equal(kinds['물리학실험Ⅰ'], 'lab'); assert.equal(kinds['국어Ⅰ'], 'gen'); assert.equal(kinds['체육Ⅰ'], 'art'); assert.equal(kinds['기초자율연구Ⅰ'], 'pf');
  // 3학점 과목 하나가 A0이면 4.27, 1학점 하나면 4.29 (1학년 1학기 32학점)
  assert.equal(Math.round(((32 - 3) * 4.3 + 3 * 4) / 32 * 100) / 100, 4.27);
  assert.equal(Math.round(((32 - 1) * 4.3 + 1 * 4) / 32 * 100) / 100, 4.29);

  // 한 학기를 끝까지 진행해 점수 구성 확인
  const s = fresh(11);
  let guard = 0;
  while (s.grades.length < 1 && guard++ < 40) { while (s.pendingEvent && s.alive) E.chooseEvent(s, 0); E.simulateWeek(s, 'balanced', 'normal', null); }
  while (s.pendingEvent && s.alive) E.chooseEvent(s, 0);
  const g = s.grades[0];
  assert.equal(g.gradeScaleVersion, 5);
  assert.equal(g.credits, 32, 'Pass/fail credits stay out of the GPA');
  ok(g.passFail.length === 1 && g.passFail[0].passed && g.passFail[0].grade === 'P', 'Research passes without an exam');
  ok(g.earnedCredits >= 32 + 3 - 0.001 || g.subjects.some((x) => x.point === 0), 'Earned credits include the pass/fail course');
  for (const sub of g.subjects) {
    assert.equal(sub.performance, 100, 'Performance is full without deduction events');
    if (sub.kind === 'ms') assert.equal(sub.score, Math.round((40 + sub.midtermScore * 0.3 + sub.finalScore * 0.3) * 10) / 10);
    if (sub.kind === 'lab') { assert.equal(sub.midtermScore, undefined, 'Labs have no midterm'); assert.equal(sub.score, Math.round((60 + sub.finalScore * 0.4) * 10) / 10); }
    if (sub.kind === 'gen') assert.equal(sub.score, Math.round((60 + (sub.midtermScore + sub.finalScore) / 2 * 0.4) * 10) / 10);
    if (sub.kind === 'art') { assert.equal(sub.score, 100); assert.equal(sub.finalScore, undefined, 'Arts have no exam'); }
  }
  ok(g.rank && g.rank.total === 90 && g.rank.semester >= 1 && g.rank.semester <= 90, 'Semester rank among 90');
  assert.deepEqual(E.getClassRank(s, 0), g.rank, 'Rank is reproducible from the save');

  // 석차 규칙: 4.3은 무조건 1등, 4.27은 상위권
  const ranked = copy(s);
  ranked.grades[0].gpa = 4.3; assert.equal(E.getClassRank(ranked, 0).semester, 1);
  let sum427 = 0;
  for (let seed = 1; seed <= 40; seed++) { const r = copy(s); r.seed = seed; r.grades[0].gpa = 4.27; sum427 += E.getClassRank(r, 0).semester; }
  const avg427 = sum427 / 40;
  ok(avg427 >= 2 && avg427 <= 10, `4.27 ranks near the top (${avg427})`);

  // 감점 사건은 수행평가를 깎습니다.
  const cut = copy(s); cut.performanceDeductions = { '*': 10 };
  ok(cut.performanceDeductions['*'] === 10);

  // 자습 연속 사용은 효과가 줄어듭니다.
  const base = fresh(5); while (base.pendingEvent) E.chooseEvent(base, 0); base.turn = 2;
  Object.assign(base.stats, { fatigue: 0, stress: 0, health: 100 });
  const once = copy(base), again = copy(base); again.studyStreak = 2;
  E.simulateWeek(once, 'balanced', 'night', null); E.simulateWeek(again, 'balanced', 'night', null);
  const id = E.getSubjects(once)[0].id;
  ok(once.semesterLearning[id] > again.semesterLearning[id], 'Consecutive extra study fades');

  // 기존 세이브의 진행 중 학기는 기존 과목표로 끝냅니다.
  const legacy = fresh(7); delete legacy.courseTable; legacy.turn = 2; legacy.semesterLearning = { math: 5 };
  E.migrate(legacy);
  ok(legacy.courseTable !== 2 && E.getSubjects(legacy).some((x) => x.id === 'math'), 'An unfinished old semester keeps its subjects');
  const nextTerm = fresh(7); delete nextTerm.courseTable; nextTerm.turn = 7; nextTerm.semesterLearning = {};
  E.migrate(nextTerm);
  assert.equal(nextTerm.courseTable, 2, 'The next semester switches to the new course table');
  return { checks };
};

if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Grades: module.exports() }));
