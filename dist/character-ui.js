/* GSA LIFE · small flat character sprites, independent of game progress. */
(function (root) {
  'use strict';
  const KEY = 'gsa-life-motion-v1';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4v8M11 4v8"/></svg>';
  const playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5z"/></svg>';
  let preference = null, initialized = false, reduced, observer;
  const boundButtons = new WeakSet();
  const portraits = { haneul: 4, seoyun: 1, jimin: 2, doyoon: 0, sion: 5, yujin: 3 };

  function avatar(index, options = {}) {
    const checked = Number.isInteger(Number(index)) && Number(index) >= 0 && Number(index) < 8 ? Number(index) : 6;
    const size = ['tiny', 'small', 'normal'].includes(options.size) ? options.size : 'normal';
    const mood = ['idle', 'study', 'sports', 'celebrate'].includes(options.mood) ? options.mood : 'idle';
    const label = options.label || '학생 캐릭터';
    const col = checked % 4, row = Math.floor(checked / 4);
    return `<span class="gsa-person gsa-person--${size} gsa-person--${mood}" data-person-motion="off" data-person-index="${checked}" role="img" aria-label="${escape(label)}"><span class="gsa-person-sprite" style="--person-x:${col / 3 * 100}%;--person-y:${row * 100}%;--person-delay:${-(checked * 0.43 + 0.15).toFixed(2)}s" aria-hidden="true"></span></span>`;
  }
  function player(state, options = {}) {
    const mood = options.mood || (state?.focus === 'athletics' ? 'sports' : ['intelligence', 'discipline', 'research', 'english'].includes(state?.focus) ? 'study' : 'idle');
    return avatar(state?.gender === 'female' ? 7 : 6, { ...options, mood, label: options.label || `${state?.name || '나'} 캐릭터` });
  }
  function event(event, state) {
    if (!event || /emergency|death/.test(String(event.id || ''))) return '';
    const cid = event.characterId || event.romanceCharacterId;
    let person;
    if (cid && root.GSAEngine?.getRomanceRoster) person = root.GSAEngine.getRomanceRoster(state).find(x => x.id === cid);
    if (person || cid && portraits[cid] !== undefined) {
      const index = person?.portraitIndex ?? portraits[cid];
      const name = person?.name || state?.romance?.partnerName || '친구';
      return `<div class="people-event">${avatar(index, { size: 'small', label: `${name} 캐릭터` })}<div><small>함께하는 순간</small><strong>${escape(name)}</strong></div></div>`;
    }
    if (String(event.id || '').startsWith('campus_romance')) {
      const name = state?.romance?.partnerName || '친구';
      const selectedId = state?.romance?.targetId;
      return `<div class="people-event">${avatar(portraits[selectedId] ?? 4, { size: 'small', label: `${name} 캐릭터` })}<div><small>함께하는 순간</small><strong>${escape(name)}</strong></div></div>`;
    }
    const sports = /basketball|sports|tournament/.test(String(event.id || '')) || /농구|운동부|체육관/.test(event.title || '');
    return `<div class="people-event people-event--self">${player(state, { size: 'small', mood: sports ? 'sports' : 'idle' })}<span>나의 학교생활</span></div>`;
  }
  function toggleHTML() {
    return `<button class="people-motion-toggle" type="button" data-people-toggle aria-label="캐릭터 모션 켜기" aria-pressed="false">${playIcon}<span>모션 켜기</span></button>`;
  }
  function loadPreference() {
    try { const value = root.localStorage.getItem(KEY); preference = ['on', 'off'].includes(value) ? value : null; } catch (_) { preference = null; }
  }
  function motionEnabled() { return preference === 'on' || (preference !== 'off' && !reduced?.matches); }
  function synchronize() {
    const enabled = motionEnabled();
    document.documentElement.dataset.peoplePage = document.hidden ? 'hidden' : 'visible';
    document.querySelectorAll('[data-person-motion]').forEach(person => {
      person.dataset.personMotion = enabled ? 'on' : 'off';
      person.dataset.personMotionOrigin = preference ? 'user' : 'system';
    });
    document.querySelectorAll('[data-people-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', `캐릭터 모션 ${enabled ? '끄기' : '켜기'}`);
      button.title = enabled ? '캐릭터의 움직임을 멈춰요' : '캐릭터의 움직임을 켜요';
      button.innerHTML = `${enabled ? pauseIcon : playIcon}<span>모션 ${enabled ? '끄기' : '켜기'}</span>`;
    });
  }
  function init() {
    if (initialized) return;
    initialized = true;
    loadPreference();
    reduced = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (reduced?.addEventListener) reduced.addEventListener('change', synchronize);
    else if (reduced?.addListener) reduced.addListener(synchronize);
    document.addEventListener('visibilitychange', synchronize);
    root.addEventListener('storage', e => { if (e.key === KEY || e.key === null) { loadPreference(); synchronize(); } });
    if (root.IntersectionObserver) observer = new root.IntersectionObserver(entries => entries.forEach(e => { e.target.dataset.personVisible = e.isIntersecting ? 'yes' : 'no'; }), { threshold: 0 });
  }
  function refresh(scope = document) {
    init();
    scope.querySelectorAll('[data-people-toggle]').forEach(button => {
      if (boundButtons.has(button)) return;
      boundButtons.add(button);
      button.addEventListener('click', () => {
        preference = motionEnabled() ? 'off' : 'on';
        try { root.localStorage.setItem(KEY, preference); } catch (_) { /* Still usable without storage. */ }
        synchronize();
      });
    });
    if (observer) {
      observer.disconnect();
      document.querySelectorAll('[data-person-motion]').forEach(person => observer.observe(person));
    }
    synchronize();
  }
  root.GSAPeople = { avatar, player, event, toggleHTML, init, refresh, portraits };
})(window);
