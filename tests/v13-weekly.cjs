'use strict';
// v0.13: 주간 시간 배분, 자습 플래너, TOEIC 선택 사건, 일상 사건 보고서.
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = (x) => JSON.parse(JSON.stringify(x));

module.exports = function verifyV13Weekly() {
  let checks = 0;
  const ok = (v, m) => { checks++; assert.ok(v, m); };
  const fresh = (seed = 5) => { const s = E.create('w', seed, { gender: 'female' }); E.setClubs(s, 'math', 'none'); let n = 0; while (s.pendingEvent && n++ < 40) E.chooseEvent(s, 0); return s; };

  // 시간 배분 검증
  assert.equal(E.PLAN_BLOCKS, 10); checks++;
  for (const bad of [{ intelligence: 9 }, { intelligence: 11 }, { nope: 10 }, { intelligence: 5.5, research: 4.5 }, { intelligence: -1, research: 11 }, []]) assert.throws(() => E.normalizePlan(bad)), checks++;
  assert.deepEqual(E.normalizePlan('research'), { research: 10 }); checks++;
  assert.equal(E.planLabel({ intelligence: 4, research: 3, recovery: 3 }), '지능 4 · 연구 역량 3 · 회복 3'); checks++;

  // 한 곳에 10칸 = 예전 문자열 방향과 같은 결과
  const a = fresh(), b = copy(a);
  E.simulateWeek(a, 'research'); E.simulateWeek(b, { research: 10 });
  assert.deepEqual(a.stats, b.stats); checks++;
  // 나누면 섞인다
  const base = fresh(9), mixed = copy(base), pureI = copy(base), pureR = copy(base);
  E.simulateWeek(mixed, { intelligence: 5, research: 5 }); E.simulateWeek(pureI, 'intelligence'); E.simulateWeek(pureR, 'research');
  ok(mixed.stats.research > pureI.stats.research && mixed.stats.research < pureR.stats.research, 'split plan grows research in between');
  ok(mixed.lastWeekReport.focusName.includes('·'), 'report names the split plan');
  ok(Array.isArray(mixed.lastWeekReport.dailyEvents), 'report lists daily events');

  // 자습 플래너: 시험 2주 전에 사건, 프리셋, 날짜 편집, 효과
  const p = fresh(11);
  let saw = null, g = 0;
  while (p.turn < 8 && g++ < 20) {
    let n = 0;
    while (p.pendingEvent && n++ < 40) { const e = p.pendingEvent; if (e.id === 'study_planner') { saw = { turn: p.turn, e }; E.chooseEvent(p, e.choices.findIndex((c) => c.plannerPreset === 'custom')); } else E.chooseEvent(p, 0); }
    if (saw) break;
    E.simulateWeek(p, p.stats.fatigue > 55 ? 'recovery' : 'balanced');
  }
  ok(saw && saw.turn === 1, 'planner opens at week 2 (two weeks before the midterm)');
  ok(saw.e.choices.length === 4, 'planner offers presets and custom');
  const pl = p.studyPlanner;
  assert.equal(pl.days.length, 15); checks++;
  ok(pl.days.every((d) => !d.night && !d.dawn), 'custom starts empty');
  assert.throws(() => E.setStudyPlannerDay(p, 1, 0, 'dawn', true), /1주 전/); checks++;
  E.setStudyPlannerDay(p, 1, 0, 'night', true); E.setStudyPlannerDay(p, 1, 1, 'night', true);
  assert.deepEqual(E.plannerFractions(p, 1), { nights: 2, dawns: 0, night: 0.4, dawn: 0 }); checks++;
  const withStudy = copy(p), without = copy(p); without.studyPlanner.days.forEach((d) => { d.night = false; });
  E.simulateWeek(withStudy, 'balanced'); E.simulateWeek(without, 'balanced');
  const sum = (s) => Object.values(s.semesterLearning).reduce((x, y) => x + y, 0);
  ok(sum(withStudy) > sum(without), 'planner nights add study');
  ok(withStudy.stats.fatigue > without.stats.fatigue, 'planner nights add fatigue');
  assert.throws(() => E.setStudyPlannerDay(withStudy, 1, 2, 'night', true), /지난/); checks++;

  // TOEIC 선택 사건
  const t = fresh(21); t.turn = 9; t.toeic.practice = 6; t.toeic.best = 0; t.pendingEvent = null; t.eventQueue = [];
  E.simulateWeek(t, 'balanced');
  let offer = null, n = 0;
  while (t.pendingEvent && n++ < 20) { if (t.pendingEvent.id === 'toeic_offer') { offer = t.pendingEvent; break; } E.chooseEvent(t, 0); }
  ok(offer, 'TOEIC offer appears once preparation is ready');
  E.chooseEvent(t, offer.choices.findIndex((c) => c.toeicBook));
  ok(t.toeicBooked, 'booking is remembered');
  n = 0; while (t.pendingEvent && n++ < 20) E.chooseEvent(t, 0);
  const attempts = t.toeic.attempts.length;
  E.simulateWeek(t, 'balanced');
  ok(t.toeic.attempts.length === attempts + 1 && !t.toeicBooked, 'booked TOEIC is taken the next week');
  return { checks };
};

if (require.main === module) console.log(JSON.stringify({ result: 'pass', v13Weekly: module.exports() }));
