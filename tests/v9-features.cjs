'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const D = require('../dist/retrospective-data.js');
const legacy = require('./v5-save-fixtures.json');

module.exports = function verifyV9(ctx) {
  const {E, copy, check, fresh, resolve, ready, toTurn, counters, fixtures, dead} = ctx;
  const completed = E.migrate(copy(legacy.find(f => f.label === 'turn48').state));
  const premature = E.migrate(copy(legacy.find(f => f.label === 'death-ending').state));
  const deferred = copy(completed);
  deferred.toeic.best = 725;
  E.migrate(deferred);
  assert.equal(deferred.ending, 'deferred');

  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) freeze(child);
    }
    return value;
  }
  function report(s) {
    const before = copy(s);
    const result = D.build(freeze(copy(s)), E);
    assert.deepEqual(D.build(freeze(copy(s)), E), result, 'Opening or replaying a recap is deterministic');
    assert.deepEqual(s, before, 'A recap must not alter saves, RNG, stats, relationships, or records');
    for (const key of ['metrics', 'slides', 'awards', 'roles', 'clubs', 'relationships', 'admissions', 'stats', 'terms', 'missingRequirements']) {
      check(Array.isArray(result[key]), `A recap always supplies ${key}`);
    }
    assert.equal(new Set(result.slides.map(slide => slide.id)).size, result.slides.length, 'Slides have stable unique identities');
    assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(result)), 'Incomplete older records never create broken display values');
    assert.equal(result.name, s.name);
    assert.equal(result.awards.reduce((n, a) => n + a.count, 0), (s.awards || []).length, 'Award groups count actual records rather than badges or nominations');
    assert.deepEqual(result.terms.map(t => [t.year, t.semester, t.gpa]), s.grades.map(t => [t.year, t.semester, t.gpa]), 'Semester grades in the retrospective are the saved grades');
    for (const stat of result.stats) assert.equal(stat.value, Math.round(s.stats[stat.key]), `Current ${stat.key} is never invented as a peak or initial value`);
    const admissions = Array.isArray(s.admissions) ? s.admissions : s.admissions?.results || [];
    assert.deepEqual(result.admissions.map(a => a.accepted), admissions.map(a => a.accepted));
    return result;
  }

  const finalReport = report(completed), deferredReport = report(deferred), earlyReport = report(premature);
  assert.equal(finalReport.eligible, true);
  assert.equal(finalReport.endingKind, 'graduated');
  assert.equal(deferredReport.eligible, true, 'A deferred ending can be reviewed while requirements remain unfinished');
  assert.equal(deferredReport.endingKind, 'deferred');
  assert.ok(deferredReport.missingRequirements.length > 0);
  assert.equal(earlyReport.eligible, true);
  assert.equal(earlyReport.endingKind, 'death');
  assert.ok(!earlyReport.slides.some(s => s.id === 'year-3'), 'An early ending never fabricates a third year');
  assert.ok(!/졸업했다|졸업을 마쳤|3년을 마쳤/.test(earlyReport.summary), 'A life cut short is not described as a completed graduation');
  assert.ok(finalReport.slides.length >= 6, 'The life story has distinct chapters before its final card');
  assert.equal(finalReport.missingRequirements.length, 0);
  const metric = label => finalReport.metrics.find(m => m.label === label);
  assert.equal(metric('누적 평점').value, E.getProfile(completed).gpa.toFixed(2));
  assert.equal(Number(metric('수상').value), completed.awards.length);
  assert.equal(Number(metric('이수 학점').value), E.getProfile(completed).credits);
  assert.equal(Number(metric('TOEIC 최고점').value), completed.toeic.best);
  assert.equal(Number(metric('현장연구').value), E.getFieldStatus(completed).total);

  // A no-result ending is valid and must not award an invented acceptance or relationship.
  const quiet = copy(completed);
  quiet.awards = [];
  quiet.admissions = [];
  quiet.councilHistory = [];
  quiet.captainHistory = [];
  quiet.captain = false;
  quiet.badges = [];
  const quietReport = report(quiet);
  assert.equal(quietReport.awards.length, 0);
  assert.equal(quietReport.admissions.length, 0);
  assert.ok(!/입학했다|진학했다|진학 확정/.test(quietReport.summary), 'No accepted university is not silently converted into enrollment');

  const ongoing = fresh('recap-ongoing');
  assert.equal(report(ongoing).eligible, false, 'The ending presentation is not triggered at admission');
  for (const fixture of fixtures) {
    const s = E.migrate(copy(fixture.state));
    const r = report(s);
    assert.equal(r.eligible, s.alive === false || s.turn >= 42, `Old save ${fixture.label} keeps its real end state`);
  }

  // Render every chapter and its summary with untrusted saved text.
  const escape = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const P = {
    player: s => `<span class="test-player" role="img" aria-label="${escape(s.name)}"></span>`,
    avatar: (_index, options = {}) => `<span class="test-person" role="img" aria-label="${escape(options.label)}"></span>`,
    toggleHTML: () => '<button data-people-toggle>모션</button>'
  };
  const sandbox = {window: {GSARetrospectiveData: D}, console};
  sandbox.window.window = sandbox.window;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/retrospective-ui.js'), 'utf8'), sandbox);
  const UI = sandbox.window.GSARetrospectiveUI.create(E, P);
  for (const s of [completed, deferred, premature, quiet, dead]) {
    const before = copy(s), pages = UI.totalPages(s);
    assert.ok(Number.isInteger(pages) && pages >= 1);
    for (let page = 0; page < pages; page++) {
      const html = UI.render(s, {mode:'slides', page});
      assert.equal(typeof html, 'string');
      assert.ok(html.length > 100);
      assert.ok(!/NaN|undefined|Infinity/.test(html));
      assert.ok(html.includes('data-recap-prev'));
      assert.ok(html.includes('data-recap-skip'));
      assert.ok(html.includes(page === pages - 1 ? 'data-recap-summary' : 'data-recap-next'));
    }
    const summary = UI.render(s, {mode:'summary', page:0});
    assert.ok(summary.includes('data-recap-replay'));
    assert.ok(summary.includes('data-recap-close'));
    assert.deepEqual(s, before, 'Rendering and replaying a recap never advance the game');
  }
  const malicious = copy(completed);
  malicious.name = '<img src=x onerror=alert(1)>';
  malicious.researchProject = '<script>alert(2)</script>';
  malicious.awards.push({name:'<svg onload=alert(3)>', kind:'model', year:3});
  malicious.log.push({turn:3, category:'life', message:'<iframe src=x>'});
  for (const html of [UI.render(malicious,{mode:'summary',page:0}), ...Array.from({length:UI.totalPages(malicious)}, (_,page)=>UI.render(malicious,{mode:'slides',page}))]) {
    assert.ok(!/<(?:img|script|svg|iframe)\b[^>]*(?:onerror|onload|src=x|alert)/i.test(html), 'Saved text is escaped before HTML rendering');
    assert.ok(!html.includes('<script>alert(2)</script>'));
  }
  counters.v9Recap = {legacySaves:fixtures.length, chapters:finalReport.slides.length, endingVariants:3, renderedCharacters:finalReport.relationships.length};
  counters.v9RecapFlow = require('./v9-flow.cjs')();
};
