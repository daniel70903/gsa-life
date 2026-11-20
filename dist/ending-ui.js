/* v0.14 졸업 엔딩: 졸업식 날 밤 광곽톡 한 통과 플레이어가 직접 쓰는 답장.
 * 제출 주소는 ending-config.js 의 window.GSA_ENDING_CONFIG 로 연결합니다. 비어 있으면 브라우저에만 저장합니다. */
(function (root) {
  'use strict';
  const MAX = 200, NICK_MAX = 12;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 학교 방송·공지에 실릴 수 있으므로 욕설·비하 표현과 연락처·주소 같은 개인정보는 보내지 않습니다.
  const BANNED = /(시발|씨발|ㅅㅂ|병신|ㅂㅅ|좆|존나|ㅈㄴ|개새|새끼|꺼져|닥쳐|미친놈|미친년|섹스|야동|자살|죽어)/i;
  const PRIVATE = /(\d{2,3}[-\s.]?\d{3,4}[-\s.]?\d{4}|@[a-z0-9_.]{2,}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|instagram|인스타|카톡\s*아이디|오픈채팅|open\.kakao)/i;
  let api = null;

  const SCRIPTS = {
    friend: { label: '3년을 함께한 친구', lines: ['졸업 축하해! 3년 동안 고마웠어', '대학 가면 뭐 제일 해 보고 싶어?'] }
  };

  // 졸업식 날 밤, 3년을 함께한 같은 반 친구가 메시지를 보냅니다(플레이어와 같은 성별의 친구, 저장마다 고정).
  function sender(state) {
    const E = root.GSAEngine;
    if (!E || !state) return null;
    const pool = E.romanceCandidates.filter(p => !state.gender || p.gender === state.gender);
    const list = pool.length ? pool : E.romanceCandidates;
    const key = String(state.seed ?? state.name ?? 'gsa'); let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const person = list[h % list.length];
    return person ? { kind: 'friend', person, name: person.name } : null;
  }

  function check(text, nick) {
    const t = String(text || '').trim(), n = String(nick || '').trim();
    if (!t) return '답장을 한 글자 이상 써 주세요.';
    if (t.length > MAX) return `답장은 ${MAX}자까지 쓸 수 있어요.`;
    if (n.length > NICK_MAX) return `닉네임은 ${NICK_MAX}자까지예요.`;
    if (BANNED.test(t) || BANNED.test(n)) return '공지에 실릴 수 있어서 거친 표현은 보낼 수 없어요. 다르게 표현해 볼까요?';
    if (PRIVATE.test(t) || PRIVATE.test(n)) return '전화번호, 이메일, SNS 아이디 같은 개인정보는 쓰지 말아 주세요.';
    return null;
  }

  function config() { const c = root.GSA_ENDING_CONFIG; return c && typeof c.url === 'string' && c.url ? c : null; }

  function html(state) {
    if (!state || state.turn < 42 || state.alive === false) return '';
    const who = sender(state); if (!who || !who.person) return '';
    const s = SCRIPTS[who.kind], reply = state.endingReply || null, People = root.GSAPeople;
    const head = `<div class="gtalk-head"><span class="gtalk-back" aria-hidden="true">‹</span>${People ? People.avatar(who.person.portraitIndex, { size: 'tiny', label: `${who.name} 캐릭터` }) : ''}<div class="gtalk-who"><strong>${esc(who.name)}</strong><small>광곽톡 · 졸업식 날 밤</small></div></div>`;
    const mine = reply && reply.text ? `<div class="gtalk-row gtalk-row--me"><span class="gtalk-bubble">${esc(reply.text)}</span></div>` : '';
    const bubbles = s.lines.map(l => `<div class="gtalk-row gtalk-row--them"><span class="gtalk-bubble">${esc(l)}</span></div>`).join('') + mine;
    let foot;
    if (reply && reply.status === 'sent') foot = `<div class="gtalk-hint">보냈어요. 개발자가 읽고 베스트 답변을 골라 나중에 공지해요${reply.nick ? ` (닉네임: ${esc(reply.nick)})` : ''}.</div>`;
    else if (reply && reply.status === 'saved') foot = `<div class="gtalk-hint">답장을 이 브라우저에 저장했어요. 답변 모집이 열리면 여기서 보낼 수 있어요.${config() ? ' <button class="secondary" data-ending="resend">지금 보내기</button>' : ''}</div>`;
    else if (reply && reply.status === 'skipped') foot = `<div class="gtalk-hint">답장하지 않고 넘어갔어요. <button class="link" data-ending="reopen">다시 쓰기</button></div>`;
    else foot = `<div class="ending-compose"><label class="ending-label" for="ending-text">답장 쓰기 <small><span data-ending-count>0</span> / ${MAX}자</small></label><textarea id="ending-text" maxlength="${MAX}" rows="3" placeholder="${esc(who.name)}에게 보낼 답장을 직접 써 보세요"></textarea><label class="ending-label" for="ending-nick">닉네임 <small>선택 · ${NICK_MAX}자까지 · 실명은 쓰지 마세요</small></label><input id="ending-nick" maxlength="${NICK_MAX}" autocomplete="off"><label class="ending-consent"><input type="checkbox" id="ending-consent"> 베스트 답변으로 뽑히면 닉네임과 답장이 공지에 실릴 수 있다는 데 동의해요. 이름·연락처는 받지 않아요.</label><p class="ending-error" role="alert" hidden></p><div class="ending-actions"><button class="primary" data-ending="send">답장 보내기</button><button class="secondary" data-ending="skip">답장하지 않기</button></div></div>`;
    return `<section class="card ending-dm"><span class="eyebrow">LAST MESSAGE · ${esc(s.label)}</span><h3>졸업식 날 밤, 광곽톡이 왔다.</h3><div class="gtalk" role="group" aria-label="광곽톡 대화">${head}<div class="gtalk-body">${bubbles}</div>${foot}</div></section>`;
  }

  async function deliver(payload) {
    const c = config(); if (!c) return false;
    const f = c.fields || {}, body = new URLSearchParams();
    body.set(f.kind || 'kind', payload.kind); body.set(f.reply || 'reply', payload.text); body.set(f.nick || 'nickname', payload.nick || ''); body.set(f.version || 'version', payload.version || '');
    try { await fetch(c.url, { method: 'POST', mode: c.cors ? 'cors' : 'no-cors', body }); return true; } catch (_) { return false; }
  }

  function onClick(ev) {
    const btn = ev.target.closest && ev.target.closest('[data-ending]'); if (!btn || !api) return;
    const state = api.get(); if (!state) return;
    const what = btn.getAttribute('data-ending'), who = sender(state);
    if (what === 'skip') { state.endingReply = { status: 'skipped', kind: who && who.kind }; api.save(); return; }
    if (what === 'reopen') { state.endingReply = null; api.save(); return; }
    if (what === 'resend' && state.endingReply && state.endingReply.text) {
      deliver({ ...state.endingReply, version: root.GSAExtras?.VERSION }).then(ok => { if (ok) { state.endingReply.status = 'sent'; api.save(); } });
      return;
    }
    if (what !== 'send') return;
    const text = document.getElementById('ending-text')?.value || '', nick = document.getElementById('ending-nick')?.value || '';
    const consent = document.getElementById('ending-consent')?.checked, err = document.querySelector('.ending-error');
    const problem = check(text, nick) || (consent ? null : '공지 동의에 체크해야 보낼 수 있어요. 보내지 않으려면 「답장하지 않기」를 눌러 주세요.');
    if (problem) { if (err) { err.textContent = problem; err.hidden = false; } return; }
    const reply = { kind: who.kind, text: text.trim(), nick: nick.trim(), turn: state.turn, status: 'saved' };
    state.endingReply = reply; api.save();
    deliver({ ...reply, version: root.GSAExtras?.VERSION }).then(ok => { if (ok) { reply.status = 'sent'; api.save(); } });
  }
  function onInput(ev) { if (ev.target && ev.target.id === 'ending-text') { const n = document.querySelector('[data-ending-count]'); if (n) n.textContent = ev.target.value.length; } }

  function init(options) {
    api = options;
    if (typeof document !== 'undefined' && !root.__gsaEndingBound) { document.addEventListener('click', onClick); document.addEventListener('input', onInput); root.__gsaEndingBound = true; }
  }

  root.GSAEnding = { init, html, sender, check, SCRIPTS, MAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GSAEnding;
})(typeof window !== 'undefined' ? window : globalThis);
