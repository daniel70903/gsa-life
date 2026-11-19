/* GSA LIFE · 튜토리얼: 실제 화면 위에서 한 단계씩 안내합니다. 게임 진행은 플레이어가 직접 합니다. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSATutorial = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const DONE_KEY = 'gsa-life-tutorial-done';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // screen: 그 단계가 보이는 화면. wait: 플레이어가 직접 해야 다음으로 넘어가는 단계.
  const steps = [
    { id: 'name', screen: 'setup', sel: '#student-name', title: '이름부터 정해 볼까?', text: '게임 속 나를 부를 이름이나 별명을 적어 줘. 비워 두면 「새로운 학생」으로 입학해.' },
    { id: 'clubs', screen: 'setup', sel: '.form-grid', title: '성별과 동아리', text: '캐릭터 성별은 꼭 골라야 해. 학술동아리는 탐구 경험과 나중에 닮은 과학자 분야에, 상설동아리는 친구 관계에 영향을 줘.' },
    { id: 'reroll', screen: 'setup', sel: '[data-do="reroll"]', title: '유형과 능력치 뽑기', text: '유형과 능력치는 무작위로 정해져. 마음에 들 때까지 다시 뽑아도 괜찮아. 입학한 뒤에도 활동에 따라 계속 자라.' },
    { id: 'start', screen: 'setup', sel: '[data-do="start"]', title: '준비됐으면 입학!', text: '성별을 골랐다면 이 버튼을 눌러 입학해 봐. 첫 주에는 운동부 테스트가 기다리고 있어.', wait: true },
    { id: 'focus', screen: 'home', sel: '.focus-section', title: '이번 주 시간 배분', text: '카드를 눌러 이번 주 주력 활동을 골라. 하나 더 누르면 보조가 돼서 시간을 7 : 3으로 나눠. 정한 배분은 바꾸기 전까지 다음 주에도 이어지고, 수업·동아리·친구와의 시간은 자동으로 흘러가.' },
    { id: 'commit', screen: 'home', sel: '.commitment-card', title: '중요한 일정 예약', text: '개별 현장연구처럼 꼭 챙길 일정이 있을 때만 예약해. TOEIC은 영어 준비가 쌓이면 「응시할래?」 사건으로 먼저 물어봐 줘.' },
    { id: 'exam', screen: 'home', sel: '.exam-box', title: '시험 전 자습 플래너', text: '중간고사는 4주차, 기말고사는 8주차야. 시험 2주 전에 자습 플래너 사건이 열리고, 이 자리에서 주마다 「없음 · 심야 · 심야+새벽」을 고를 수 있어. 새벽은 시험 1주 전부터야. 성적은 오르지만 피로도 쌓여.' },
    { id: 'meters', screen: 'home', sel: '.profile .meter', all: true, title: '피로와 스트레스는 꼭 확인', text: '둘 중 하나가 100을 넘거나 둘 다 90을 넘으면 응급실에 가. 80쯤 되면 성장 방향을 「회복」으로 바꿔서 쉬어 줘.' },
    { id: 'advance', screen: 'home', sel: '.advance', title: '한 주 보내기', text: '시간을 다 나눴으면 이 버튼으로 한 주를 보내. 대부분의 일상 사건은 지난주 보고서에 「이번 주 일상 사건 n건」으로 정리되고, 결과가 갈리는 순간에만 선택지가 나와.' },
    { id: 'menu', screen: 'home', sel: '.nav', title: '다른 화면들', text: '매점, 친구, 수강신청, 성적, 동아리·학생회, 진학·졸업 화면을 오가며 학교생활을 챙겨. 수강신청은 2학년 2학기부터 열려.' },
    { id: 'help', screen: 'home', sel: '.gx-help-btn', title: '모르겠으면 도움말', text: '규칙이 헷갈리면 언제든 도움말을 열어 봐. 마지막에는 3년을 돌아보는 회고와 나와 닮은 과학자 컴패리즌이 기다리고 있어. 즐거운 학교생활 보내!', last: true },
  ];

  let active = false, index = 0, eventShown = false, els = null, raf = 0, observer = null, lastKey = '';

  function screen() {
    if (document.querySelector('#modal-root .modal')) return 'event';
    if (document.getElementById('student-name')) return 'setup';
    if (document.querySelector('.focus-section')) return 'home';
    return 'other';
  }
  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function ensureEls() {
    if (els) return els;
    const ring = document.createElement('div');
    ring.className = 'tu-ring';
    ring.setAttribute('aria-hidden', 'true');
    const bubble = document.createElement('section');
    bubble.className = 'tu-bubble';
    bubble.setAttribute('role', 'dialog');
    bubble.setAttribute('aria-live', 'polite');
    bubble.setAttribute('aria-label', '튜토리얼');
    document.body.append(ring, bubble);
    els = { ring, bubble };
    return els;
  }
  function stepList(sc) {
    return steps.filter((s) => s.screen === sc);
  }
  function currentStep() {
    const sc = screen();
    if (sc === 'event') return eventShown ? null : { id: 'event', screen: 'event', sel: '#modal-root .modal', title: '중요한 순간이 찾아왔어', text: '이런 창이 뜨면 직접 골라야 해. 고른 선택에 따라 능력치, 관계, 다음 이야기가 달라져. 하나 골라 볼래?', wait: true, floating: true };
    let step = steps[index];
    if (!step) return null;
    // 플레이어가 먼저 입학했다면 입학 단계를 건너뛰고 학교생활 안내로 넘어갑니다.
    if (step.screen === 'setup' && sc === 'home') {
      index = steps.findIndex((s) => s.screen === 'home');
      step = steps[index];
    }
    return step.screen === sc ? step : null;
  }
  // 여러 요소를 함께 가리키는 단계는 요소들을 감싸는 사각형을 씁니다.
  function rectOf(step) {
    const nodes = step.all ? [...document.querySelectorAll(step.sel)] : [document.querySelector(step.sel)];
    const rects = nodes.filter(visible).map((n) => n.getBoundingClientRect());
    if (!rects.length) return null;
    const top = Math.min(...rects.map((r) => r.top)), left = Math.min(...rects.map((r) => r.left));
    const bottom = Math.max(...rects.map((r) => r.bottom)), right = Math.max(...rects.map((r) => r.right));
    return { top, left, bottom, right, width: right - left, height: bottom - top };
  }
  function place() {
    raf = 0;
    if (!active) return;
    const { ring, bubble } = ensureEls();
    const step = currentStep();
    const key = step ? `${step.id}:${index}` : 'none';
    if (!step) {
      ring.hidden = true;
      bubble.hidden = true;
      lastKey = key;
      return;
    }
    const target = document.querySelector(step.sel);
    const mobile = root.innerWidth <= 760;
    if (key !== lastKey) {
      lastKey = key;
      renderBubble(step);
      if (target && !step.floating) target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (step.id === 'event') eventShown = true;
    }
    bubble.hidden = false;
    const tr = target ? rectOf(step) : null;
    if (!tr || step.floating) {
      ring.hidden = true;
    } else {
      const r = tr, pad = 6;
      ring.hidden = false;
      Object.assign(ring.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    }
    if (mobile || !tr || step.floating) {
      bubble.classList.add('tu-bubble--dock');
      Object.assign(bubble.style, { top: '', left: '' });
      return;
    }
    bubble.classList.remove('tu-bubble--dock');
    const r = tr, b = bubble.getBoundingClientRect(), gap = 14, W = root.innerWidth, H = root.innerHeight;
    let top, left = Math.min(Math.max(12, r.left), W - b.width - 12);
    if (r.bottom + gap + b.height <= H - 12) top = r.bottom + gap;
    else if (r.top - gap - b.height >= 12) top = r.top - gap - b.height;
    else if (r.right + gap + b.width <= W - 12) {
      left = r.right + gap;
      top = Math.min(H - b.height - 12, Math.max(12, r.top));
    } else if (r.left - gap - b.width >= 12) {
      left = r.left - gap - b.width;
      top = Math.min(H - b.height - 12, Math.max(12, r.top));
    } else {
      // 화면보다 큰 영역은 제목을 가리지 않도록 오른쪽 위 안쪽에 둡니다.
      left = Math.max(12, Math.min(r.right, W) - b.width - 16);
      top = Math.min(H - b.height - 12, Math.max(12, r.top + 56));
    }
    Object.assign(bubble.style, { top: `${top}px`, left: `${left}px` });
  }
  function schedule() {
    if (!raf) raf = root.requestAnimationFrame(place);
  }
  function renderBubble(step) {
    const { bubble } = els;
    const list = step.id === 'event' ? [] : stepList(step.screen);
    const pos = list.indexOf(step);
    const total = steps.length, n = steps.indexOf(step) + 1;
    bubble.innerHTML = `<div class="tu-head"><span class="tu-count">${step.id === 'event' ? 'TIP' : `${n} / ${total}`}</span><button type="button" class="tu-skip" data-tu="end">${step.last ? '닫기' : '튜토리얼 끝내기'}</button></div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p>${
      step.wait
        ? `<p class="tu-wait">${step.id === 'event' ? '선택지를 고르면 안내가 이어져요.' : '버튼을 누르면 다음 안내로 넘어가요.'}</p>`
        : `<div class="tu-actions">${pos > 0 ? '<button type="button" class="tu-btn" data-tu="prev">이전</button>' : ''}<button type="button" class="tu-btn tu-btn--primary" data-tu="${step.last ? 'finish' : 'next'}">${step.last ? '학교생활 시작하기' : '다음'}</button></div>`
    }`;
    bubble.querySelectorAll('[data-tu]').forEach((b) => b.addEventListener('click', () => act(b.dataset.tu)));
    setTimeout(() => bubble.querySelector('[data-tu="next"],[data-tu="finish"]')?.focus({ preventScroll: true }), 30);
  }
  function act(what) {
    if (what === 'next') {
      index = Math.min(steps.length - 1, index + 1);
      lastKey = '';
      schedule();
    } else if (what === 'prev') {
      index = Math.max(0, index - 1);
      lastKey = '';
      schedule();
    } else if (what === 'finish' || what === 'end') {
      stop(what === 'finish');
    }
  }
  function onScreenChange() {
    if (!active) return;
    // 입학 버튼을 누르면 다음 화면 단계로 이어집니다.
    const step = steps[index];
    if (step?.wait && step.screen === 'setup' && screen() !== 'setup') {
      index = steps.findIndex((s) => s.screen === 'home');
      lastKey = '';
    }
    schedule();
  }
  function start() {
    if (typeof document === 'undefined') return;
    stop(false);
    active = true;
    eventShown = false;
    lastKey = '';
    const sc = screen();
    index = sc === 'setup' ? 0 : steps.findIndex((s) => s.screen === 'home');
    ensureEls();
    document.documentElement.classList.add('tu-active');
    observer = new MutationObserver(onScreenChange);
    observer.observe(document.getElementById('app'), { childList: true, subtree: false });
    observer.observe(document.getElementById('modal-root'), { childList: true, subtree: false });
    root.addEventListener('resize', schedule);
    root.addEventListener('scroll', schedule, true);
    schedule();
  }
  function stop(completed) {
    if (!active && !els) return;
    active = false;
    observer?.disconnect();
    observer = null;
    root.removeEventListener('resize', schedule);
    root.removeEventListener('scroll', schedule, true);
    els?.ring.remove();
    els?.bubble.remove();
    els = null;
    document.documentElement.classList.remove('tu-active');
    if (completed) {
      try {
        root.localStorage.setItem(DONE_KEY, '1');
      } catch (_) {}
    }
  }

  return { start, stop, steps, isActive: () => active };
});
