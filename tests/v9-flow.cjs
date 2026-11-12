'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Run the shipped app functions with drawing/storage callbacks stubbed out.
// This exercises the actual navigation and automatic opening conditions.
module.exports = function verifyRecapFlow() {
  const source = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
  const names = ['recapKey', 'openRecap', 'recapMove', 'render', 'dispatch'];
  const functions = names.map(name => {
    const line = source.split('\n').find(line => line.startsWith(`function ${name}(`));
    assert.ok(line && line.trimEnd().endsWith('}'), `Read the complete actual ${name} function`);
    return line;
  }).join('\n');
  const copy = value => JSON.parse(JSON.stringify(value));
  const basic = () => ({turn:48, alive:true, ending:'graduated', rng:41902,
    pendingEvent:null, emergency:null, stats:{intelligence:75},
    grades:[{year:3,semester:2,gpa:3.48}], log:[{turn:48,message:'마지막 학기 기록'}]});
  function harness(state = basic(), extra = {}) {
    const calls = {views:[], persists:0, refreshes:0, focuses:0, scrolls:0, modals:0};
    const context = {
      state:copy(state), view:'home', recapPage:0, recapMode:'slides', recapOrigin:'future', semesterNotice:null,
      persist:()=>calls.persists++, renderModal:()=>calls.modals++,
      P:{refresh:()=>calls.refreshes++}, R:{totalPages:()=>7},
      $:()=>({focus:()=>calls.focuses++}), window:{scrollTo:()=>calls.scrolls++},
      attempt:fn=>fn(), ...extra
    };
    for (const view of ['setup','home','life','relationships','courses','grades','clubs','journal','future','recap']) context[view] = () => calls.views.push(view);
    vm.createContext(context);
    vm.runInContext(functions, context);
    return {c:context, calls};
  }
  const gameRecord = s => {const result=copy(s);delete result.recapSeenEnding;return result;};
  let scenarios = 0;

  // A completed old save opens once; closing it does not reopen every render.
  const auto = harness(), original = gameRecord(auto.c.state);
  auto.c.render();
  assert.equal(auto.c.view,'recap');
  assert.equal(auto.c.state.recapSeenEnding,'graduated');
  assert.equal(auto.calls.persists,1);
  assert.equal(auto.c.recapMode,'slides');
  assert.equal(auto.c.recapPage,0);
  assert.equal(auto.calls.focuses,1);
  auto.c.recapMove('close');
  auto.c.render();
  assert.equal(auto.c.view,'future');
  assert.equal(auto.calls.persists,1,'The same ending is not automatically reopened');
  assert.deepEqual(gameRecord(auto.c.state),original);
  scenarios++;

  // The actual dismiss action is the transition from the last report to recap.
  const semester = harness(basic(),{semesterNotice:{year:3,semester:2,gpa:3.48}});
  semester.c.render();
  assert.equal(semester.c.view,'home');
  assert.equal(semester.c.state.recapSeenEnding,undefined);
  semester.c.dispatch('dismiss');
  assert.equal(semester.c.semesterNotice,null);
  assert.equal(semester.c.view,'recap');
  assert.equal(semester.c.state.recapSeenEnding,'graduated');
  assert.equal(semester.calls.persists,1);
  scenarios++;

  // A genuinely new ending reopens the album after remedial graduation.
  const changing = harness({...basic(),ending:'deferred'});
  changing.c.render();
  assert.equal(changing.c.state.recapSeenEnding,'deferred');
  changing.c.recapMove('close');
  changing.c.state.ending='graduated';
  changing.c.render();
  assert.equal(changing.c.view,'recap');
  assert.equal(changing.c.state.recapSeenEnding,'graduated');
  assert.equal(changing.calls.persists,2);
  changing.c.recapMove('close');changing.c.render();
  assert.equal(changing.c.view,'future');assert.equal(changing.calls.persists,2);
  scenarios++;

  // Death takes priority over an irrelevant unfinished semester report.
  const early = harness({...basic(),turn:8,alive:false,ending:'death'},{semesterNotice:{year:1,semester:1,gpa:2.5}});
  early.c.render();
  assert.equal(early.c.semesterNotice,null);
  assert.equal(early.c.view,'recap');
  assert.equal(early.c.state.recapSeenEnding,'death');
  scenarios++;

  // Unresolved decisions and an active emergency must finish before auto-open.
  for (const blocker of ['pendingEvent','emergency']) {
    const blocked = harness({...basic(),[blocker]:{id:'unfinished'}});
    blocked.c.render();
    assert.equal(blocked.c.view,'home');
    assert.equal(blocked.calls.persists,0);
    assert.equal(blocked.c.state.recapSeenEnding,undefined);
    blocked.c.state[blocker]=null;
    blocked.c.render();
    assert.equal(blocked.c.view,'recap');
    assert.equal(blocked.calls.persists,1);
    scenarios++;
  }

  // Explicit replay, slide controls and exit change presentation only.
  const replay = harness({...basic(),recapSeenEnding:'graduated'},{view:'journal'});
  const beforeReplay = copy(replay.c.state);
  replay.c.openRecap();
  replay.c.recapMove('next');assert.equal(replay.c.recapPage,1);
  replay.c.recapMove('prev');assert.equal(replay.c.recapPage,0);
  replay.c.recapMove('prev');assert.equal(replay.c.recapPage,0);
  for(let i=0;i<7;i++)replay.c.recapMove('next');
  assert.equal(replay.c.recapMode,'summary');
  replay.c.recapMove('prev');assert.equal(replay.c.recapMode,'slides');assert.equal(replay.c.recapPage,6);
  replay.c.recapMove('replay');assert.equal(replay.c.recapPage,0);assert.equal(replay.c.recapMode,'slides');
  replay.c.recapMove('summary');assert.equal(replay.c.recapMode,'summary');
  replay.c.recapMove('close');assert.equal(replay.c.view,'future');
  assert.deepEqual(replay.c.state,beforeReplay,'Repeated viewing cannot change turns, RNG, grades, events, or other life records');
  scenarios++;

  // Before the ending, a journal preview returns to the original page.
  const ongoing = harness({...basic(),turn:17,ending:null},{view:'journal'});
  const ongoingBefore=copy(ongoing.c.state);
  ongoing.c.render();assert.equal(ongoing.c.view,'journal');assert.equal(ongoing.calls.persists,0);
  ongoing.c.openRecap();assert.equal(ongoing.c.view,'recap');
  ongoing.c.recapMove('close');assert.equal(ongoing.c.view,'journal');
  assert.deepEqual(ongoing.c.state,ongoingBefore);assert.equal(ongoing.calls.persists,0);
  scenarios++;
  return {scenarios,actualAppFunctions:names.length};
};

if(require.main===module)console.log(JSON.stringify({result:'pass',recapFlow:module.exports()}));
