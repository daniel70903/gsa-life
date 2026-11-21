/* GSA LIFE · reusable illustrated scenes. Decorative motion never advances the game. */
(function (root) {
  'use strict';
  const KEY = 'gsa-life-motion-v1';
  const scenes = {
    campus: { file: 'campus-v1.webp', alt: '초록빛 산과 나무에 둘러싸인 학교, 교정을 걷는 학생들의 일러스트', label: '교정의 한 장면' },
    study: { file: 'study-v1.webp', alt: '따뜻한 조명 아래 책과 노트를 펼친 기숙사 공부방 일러스트', label: '조용한 공부방' },
    sports: { file: 'sports-v1.webp', alt: '나무 바닥의 학교 체육관에서 함께 농구를 연습하는 학생들의 일러스트', label: '방과 후의 체육관' }
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4v8M11 4v8"/></svg>';
  const playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5z"/></svg>';
  let preference = null, initialized = false, reduced, viewportObserver;
  const boundButtons = new WeakSet(), boundImages = new WeakSet();

  function decoration(kind) {
    if (kind === 'campus') return '<div class="scene-cloud scene-cloud-one"></div><div class="scene-cloud scene-cloud-two"></div><i class="scene-leaf scene-leaf-one"></i><i class="scene-leaf scene-leaf-two"></i><i class="scene-leaf scene-leaf-three"></i><div class="scene-sun-wash"></div>';
    if (kind === 'study') return '<div class="scene-lamp-glow"></div><div class="scene-window-glow"></div><div class="scene-dust"><i></i><i></i><i></i><i></i><i></i></div>';
    return '<div class="scene-gym-light"></div><div class="scene-ball-shadow"></div><div class="scene-ball-flight"><svg class="scene-ball" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#bd7847" stroke="#754c37" stroke-width="1.8"/><path d="M3 22q21 6 42 0M24 2q-3 22 0 44M8 9q29 9 30 30M10 41Q38 23 39 9" fill="none" stroke="#754c37" stroke-width="1.6"/><path d="M11 13q5-7 13-7" fill="none" stroke="#edbc83" stroke-width="2" stroke-linecap="round" opacity=".55"/></svg></div>';
  }

  function render(kind, options = {}) {
    const selected = scenes[kind] ? kind : 'campus', scene = scenes[selected];
    const variant = ['hero', 'banner', 'event'].includes(options.variant) ? options.variant : 'banner';
    const hasCopy = Boolean(options.eyebrow || options.title || options.caption);
    const copy = hasCopy ? `<figcaption class="scene-copy">${options.eyebrow ? `<span class="scene-eyebrow">${escape(options.eyebrow)}</span>` : ''}${options.title ? `<h2>${escape(options.title)}</h2>` : ''}${options.caption ? `<p>${escape(options.caption)}</p>` : ''}<span class="scene-signature" aria-hidden="true">GSA LIFE <i></i> A LITTLE MOMENT</span></figcaption>` : '';
    return `<figure class="story-scene scene-${selected} scene-${variant}${hasCopy ? ' scene-has-copy' : ''}" data-scene="${selected}" data-motion="off"><div class="scene-viewport"><img class="scene-illustration" src="assets/illustrations/${scene.file}" alt="${scene.alt}" loading="${variant === 'hero' ? 'eager' : 'lazy'}" decoding="async" width="1672" height="941"><div class="scene-motion" aria-hidden="true">${decoration(selected)}</div><div class="scene-fallback" hidden><span>✦</span><p>${scene.label}</p><small>그림을 불러오지 못했어요.</small></div><button class="scene-motion-toggle" type="button" data-scene-toggle aria-label="일러스트 모션 켜기" aria-pressed="false">${playIcon}<span>모션 켜기</span></button></div>${copy}</figure>`;
  }

  function byContext(state, mode) {
    if (['night', 'dawn', 'both'].includes(mode)) return 'study';
    const focus = state?.focus;
    if (focus === 'athletics') return state?.sportsClubs?.length === 1 && state.sportsClubs[0] === 'soccer' ? 'campus' : 'sports';
    if (['intelligence', 'discipline', 'research', 'english', 'recovery'].includes(focus)) return 'study';
    return 'campus';
  }

  function forEvent(event) {
    if (!event) return null;
    const id = String(event.id || ''), context = String(event.context || ''), text = `${event.title || ''} ${event.description || ''}`;
    if (/emergency|death/.test(id) || /응급실|사망|생을 마감/.test(text)) return null;
    // A football story must not acquire a basketball court just because it is a tournament.
    if (/soccer|football/.test(`${id} ${event.clubId || ''} ${event.tournamentClub || ''}`) || /축구|킥오프|잔디|정강이 보호대|종료 휘슬/.test(text)) return 'campus';
    if (/sports|basketball|tournament/.test(`${id} ${context}`) || /농구|체육관|쿼터|버저/.test(text)) return 'sports';
    if (/dorm|exam|study|olympiad|interview|research|toeic|electronics|delivery/.test(`${id} ${context}`) || /기숙사|자습|시험|면접|연구|올림피아드|노트|공부/.test(text)) return 'study';
    return 'campus';
  }

  function loadPreference() {
    try { const value = root.localStorage.getItem(KEY); preference = ['on', 'off'].includes(value) ? value : null; } catch (_) { preference = null; }
  }
  function motionEnabled() { return preference === 'on' || (preference !== 'off' && !reduced?.matches); }
  function synchronize() {
    const enabled = motionEnabled();
    document.documentElement.dataset.scenePage = document.hidden ? 'hidden' : 'visible';
    document.querySelectorAll('[data-scene]').forEach(scene => {
      scene.dataset.motion = enabled ? 'on' : 'off';
      scene.dataset.motionOrigin = preference ? 'user' : 'system';
    });
    document.querySelectorAll('[data-scene-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', `일러스트 모션 ${enabled ? '끄기' : '켜기'}`);
      button.title = enabled ? '모든 장면의 움직임을 멈춰요' : '모든 장면의 움직임을 켜요';
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
    root.addEventListener('storage', event => { if (event.key === KEY || event.key === null) { loadPreference(); synchronize(); } });
    if (root.IntersectionObserver) viewportObserver = new root.IntersectionObserver(entries => {
      entries.forEach(entry => { entry.target.dataset.sceneVisible = entry.isIntersecting ? 'yes' : 'no'; });
    }, { threshold: 0 });
  }
  function refresh(scope = document) {
    init();
    scope.querySelectorAll('[data-scene-toggle]').forEach(button => {
      if (boundButtons.has(button)) return;
      boundButtons.add(button);
      button.addEventListener('click', () => {
        preference = motionEnabled() ? 'off' : 'on';
        try { root.localStorage.setItem(KEY, preference); } catch (_) { /* Motion remains usable even when storage is unavailable. */ }
        synchronize();
      });
    });
    scope.querySelectorAll('.scene-illustration').forEach(image => {
      if (boundImages.has(image)) return;
      boundImages.add(image);
      const fail = () => {
        const scene = image.closest('[data-scene]');
        if (!scene) return;
        scene.classList.add('scene-unavailable');
        const fallback = scene.querySelector('.scene-fallback');
        if (fallback) fallback.hidden = false;
      };
      image.addEventListener('error', fail, { once: true });
      if (image.complete && !image.naturalWidth) fail();
    });
    // Disconnect retired render trees so off-screen pausing does not retain old UI nodes.
    if (viewportObserver) {
      viewportObserver.disconnect();
      document.querySelectorAll('[data-scene]').forEach(scene => viewportObserver.observe(scene));
    }
    synchronize();
  }
  root.GSAScenes = { render, byContext, forEvent, init, refresh };
})(window);
