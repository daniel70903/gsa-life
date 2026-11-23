'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../dist/engine.js');
const source = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
const renderModal = source.slice(source.indexOf('function renderModal(){'), source.indexOf('\nfunction attempt('));
const remember = source.split('\n').find(line => line.startsWith('function rememberSemesterResult('));
const dispatch = source.split('\n').find(line => line.startsWith('function dispatch('));
assert.ok(renderModal.startsWith('function renderModal()') && remember && dispatch);
function ui(state, phase = {}) {
  const root = {innerHTML:'', querySelectorAll:()=>[]};
  const app = {inert:false};
  const calls = {persists:0, renders:0};
  const c = {
    state, view:'home', semesterNotice:null, icon:()=>'', esc:x=>String(x),
    $:query=>query==='#modal-root'?root:query==='#app'?app:null,
    document:{body:{style:{}}},
    E:{ getPhase:()=>({needsEnrollment:false,needsElectives:false,needsApplications:false,...phase}),
      getEnrollmentOptions:()=>({year:2,semester:1}) },
    P:{event:()=>''}, A:{catalogue:()=>'<section>수강신청 안내</section>'},
    getCourseDraft:()=>[], applicationForm:()=>'<section>원서 작성</section>',
    attempt:fn=>fn(), bindEnrollment:()=>{},bindApplications:()=>{},
    persist:()=>{calls.persists++;}, render:()=>{calls.renders++;},
    toast:()=>{},setTimeout:()=>{},
  };
  vm.createContext(c);
  vm.runInContext(`${remember}\n${renderModal}\n${dispatch}`,c);
  return {c, root, app, calls};
}
const game = E.create('학기 팝업 순서 테스트', 11849, {gender:'male'});
E.setClubs(game,'math','none');
let guard=0;
while(game.pendingEvent && guard++ < 50) E.chooseEvent(game,0);
// The final 1-2 exam completes just as 2-1 leadership and R&E events become queued.
game.turn=13;game.pendingEvent=null;game.eventQueue=[];game.stats.fatigue=15;game.stats.stress=15;
const result = E.simulateSpan(game,{intelligence:10});
assert.equal(game.turn,14);
assert.equal(result.semesterResult.year,1);
assert.equal(result.semesterResult.semester,2);
assert.ok(game.pendingEvent,'The new term has a pending selection');
assert.ok(game.eventQueue.some(e=>e.id==='rne_advanced_apply'));
assert.ok(game.eventQueue.some(e=>e.id==='school_class_election'));
// The same result must appear before the new term's popups or enrollment screens.
let h=ui(game);
h.c.rememberSemesterResult(result);
h.c.renderModal();
assert.match(h.root.innerHTML,/1학년 2학기를 마쳤어/);
assert.doesNotMatch(h.root.innerHTML,/동아리 기장·부기장 선거/);
assert.equal(h.c.state.semesterNoticePending.year,1);
assert.equal(h.c.state.semesterNoticePending.semester,2);
// Reloads restore the review from the saved state even if the in-memory variable vanished.
h=ui(JSON.parse(JSON.stringify(h.c.state)));
h.c.renderModal();
assert.match(h.root.innerHTML,/1학년 2학기를 마쳤어/);
assert.doesNotMatch(h.root.innerHTML,/수강신청 안내/);
h.c.dispatch('dismiss');
assert.equal(h.c.state.semesterNoticePending,undefined);
assert.equal(h.calls.persists,1);
h.c.renderModal();
assert.match(h.root.innerHTML,/동아리 기장·부기장 선거/);
// Emergency remains top priority over grade review.
const emergency = JSON.parse(JSON.stringify(game));
emergency.semesterNoticePending={year:1,semester:2};
emergency.pendingEvent={id:'emergency',title:'갑작스러운 응급실 이송',description:'긴급',choices:[{label:'확인'}]};
const u=ui(emergency);u.c.renderModal();
assert.match(u.root.innerHTML,/갑작스러운 응급실 이송/);
assert.doesNotMatch(u.root.innerHTML,/학기를 마쳤어/);
// Without a new-term choice, registration must also wait until grade confirmation.
const enrollment = {...game,pendingEvent:null,semesterNoticePending:{year:1,semester:2}};
const v=ui(enrollment,{needsEnrollment:true});v.c.renderModal();
assert.match(v.root.innerHTML,/1학년 2학기를 마쳤어/);
v.c.dispatch('dismiss');v.c.renderModal();
assert.match(v.root.innerHTML,/수강신청 안내/);
// This precedence is shared by all six term endings, including admissions after 3-1.
for (const [year, semester, turn] of [[1,1,7],[2,1,21],[2,2,28],[3,1,35],[3,2,42]]) {
  const g={year,semester,gpa:3.99,credits:27};
  const s={alive:true,turn,grades:[g],semesterNoticePending:{year,semester},pendingEvent:{id:'next_term',title:'새 학기 일정',description:'',choices:[{label:'확인'}]}};
  const q=ui(s,{needsApplications:turn===35});q.c.renderModal();
  assert.ok(q.root.innerHTML.includes(`${year}학년 ${semester}학기를 마쳤어`));
  assert.doesNotMatch(q.root.innerHTML,/새 학기 일정|원서 작성/);
}
// A fatal emergency must not leave an unacknowledged semester report blocking the ending.
assert.ok(source.includes('if(state&&!state.alive){semesterNotice=null;if(state.semesterNoticePending){delete state.semesterNoticePending;persist();}}'));
// Capturing a semester result after event resolution is essential when a two-week
// simulation resumes from an interactive decision in its last week.
const w=ui({...game, semesterNoticePending:null});
w.c.rememberSemesterResult({semesterResult:result.semesterResult});
assert.equal(w.c.state.semesterNoticePending.year,1);
assert.ok(source.includes('const r=E.chooseEvent(state,Number(b.dataset.choice));rememberSemesterResult(r);persist();render();'), 'Popup choice path captures a resumed semester result');
assert.ok(source.includes('const result=E.simulateSpan(state,weekPlan()'), 'Advance path must use simulated span');
assert.ok(source.includes('rememberSemesterResult(result);persist();render();'), 'Advance path stores the semester review');
console.log('v14 semester transition modal order and save persistence ok');
