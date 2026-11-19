/* GSA LIFE · 시작 화면과 기록실(지난 이야기 · 과학자 도감). 게임 진행 상태는 바꾸지 않습니다. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSATitle = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const SAVE_KEY = 'gsa-life-v1';
  const ARCHIVE_KEY = 'gsa-life-archive-v1';
  const ARCHIVE_LIMIT = 30;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ENDING_LABELS = { graduated: '졸업', deferred: '졸업 요건 준비 중', death: '이야기의 마지막' };

  /* ───────────── 저장 데이터 읽기 ───────────── */

  function storage() {
    try {
      return root.localStorage || null;
    } catch (_) {
      return null;
    }
  }
  function readSave() {
    try {
      const raw = storage()?.getItem(SAVE_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      return v && v.state && typeof v.state.turn === 'number' ? v : null;
    } catch (_) {
      return null;
    }
  }
  function progressLabel(s) {
    if (!s) return '';
    if (s.alive === false) return '이야기의 마지막';
    if (s.turn >= 48) return s.ending === 'graduated' ? '졸업' : '졸업 요건 준비 중';
    const t = Math.min(s.turn, 47), term = Math.floor(t / 8);
    return `${Math.floor(term / 2) + 1}학년 ${(term % 2) + 1}학기 ${(t % 8) + 1}주차`;
  }
  function endingKind(s) {
    if (!s) return null;
    if (s.alive === false || s.ending === 'death') return 'death';
    if (s.turn >= 48) return s.ending === 'graduated' ? 'graduated' : 'deferred';
    return null;
  }

  /* ───────────── 기록실: 마친 이야기 보관 ───────────── */

  function readArchive() {
    try {
      const v = JSON.parse(storage()?.getItem(ARCHIVE_KEY) || '[]');
      return Array.isArray(v) ? v.filter((r) => r && r.key) : [];
    } catch (_) {
      return [];
    }
  }
  function writeArchive(list) {
    try {
      storage()?.setItem(ARCHIVE_KEY, JSON.stringify(list.slice(0, ARCHIVE_LIMIT)));
    } catch (_) {}
  }
  // 마친 이야기(졸업·졸업 유예·중도 종료)를 한 줄 기록으로 만듭니다.
  function summarize(s, engine, now = new Date()) {
    const kind = endingKind(s);
    if (!kind) return null;
    const data = root.GSARetrospectiveData?.build ? root.GSARetrospectiveData.build(s, engine) : null;
    const comparison = root.GSAComparison?.compare ? root.GSAComparison.compare(s, engine) : null;
    const gpaMetric = data?.metrics?.find((m) => /평점/.test(m.label));
    const admissions = (data?.admissions || []).filter((a) => a.accepted).map((a) => a.name);
    return {
      key: `${s.seed ?? 'x'}-${s.name ?? ''}`,
      name: String(s.name || '이름 없는 학생'),
      gender: s.gender === 'female' ? 'female' : 'male',
      ending: kind,
      gpa: gpaMetric ? String(gpaMetric.value) : '—',
      awards: (data?.awards || []).reduce((n, a) => n + (Number(a.count) || 0), 0),
      title: data?.title || '',
      accepted: admissions.slice(0, 3),
      scientist: comparison ? { id: comparison.best.id, name: comparison.best.name, similarity: comparison.best.similarity } : null,
      type: comparison ? comparison.type.title : '',
      savedAt: now.toISOString(),
    };
  }
  // 같은 이야기는 최신 상태로 덮어쓰고, 새 이야기는 맨 앞에 둡니다.
  function upsert(list, record) {
    if (!record) return list;
    const rest = list.filter((r) => r.key !== record.key);
    const previous = list.find((r) => r.key === record.key);
    return [{ ...record, firstSavedAt: previous?.firstSavedAt || previous?.savedAt || record.savedAt }, ...rest].slice(0, ARCHIVE_LIMIT);
  }
  function recordCurrent() {
    const save = readSave();
    if (!save || !endingKind(save.state)) return null;
    let s = save.state;
    try {
      s = root.GSAEngine?.migrate ? root.GSAEngine.migrate(JSON.parse(JSON.stringify(s))) : s;
      const record = summarize(s, root.GSAEngine);
      if (record) writeArchive(upsert(readArchive(), record));
      return record;
    } catch (_) {
      return null;
    }
  }
  function unlockedScientists(list = readArchive()) {
    return new Set(list.map((r) => r.scientist?.id).filter(Boolean));
  }

  /* ───────────── 기록실 화면 ───────────── */

  function archiveHTML(list) {
    if (!list.length) return '<div class="tt-empty"><b>아직 마친 이야기가 없어요.</b><p>졸업하거나 이야기가 끝나면 이곳에 한 줄 기록과 닮은 과학자가 남아요.</p></div>';
    return `<ul class="tt-runs">${list
      .map((r) => {
        const date = r.savedAt ? new Date(r.savedAt) : null;
        const when = date && !isNaN(date) ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}` : '';
        return `<li class="tt-run tt-run--${esc(r.ending)}">${root.GSAPeople?.avatar ? root.GSAPeople.avatar(r.gender === 'female' ? 7 : 6, { size: 'small', label: `${r.name} 캐릭터` }) : ''}<div class="tt-run-main"><div class="tt-run-head"><b>${esc(r.name)}</b><span class="tt-chip">${esc(ENDING_LABELS[r.ending] || '기록')}</span><small>${esc(when)}</small></div><p>${esc(r.title)}</p><div class="tt-run-stats"><span>평점 <b>${esc(r.gpa)}</b></span><span>수상 <b>${Number(r.awards) || 0}</b></span>${r.accepted?.length ? `<span>합격 <b>${esc(r.accepted.join(', '))}</b></span>` : ''}</div>${r.scientist ? `<div class="tt-run-match">닮은 과학자 <b>${esc(r.scientist.name)}</b> ${Number(r.scientist.similarity) || ''}%${r.type ? ` · ${esc(r.type)}` : ''}</div>` : ''}</div></li>`;
      })
      .join('')}</ul>`;
  }
  function collectionHTML(list) {
    const C = root.GSAComparison;
    if (!C) return '';
    const unlocked = unlockedScientists(list);
    return `<p class="tt-collection-note">이야기를 마칠 때마다 가장 닮은 과학자가 도감에 기록돼요. <b>${unlocked.size} / ${C.scientists.length}</b>명을 만났어요.</p><ul class="tt-collection">${C.scientists
      .slice()
      .sort((a, b) => Number(unlocked.has(b.id)) - Number(unlocked.has(a.id)))
      .map((sc) => {
        const open = unlocked.has(sc.id);
        const fields = Object.keys(sc.f).map((f) => C.FIELD_LABELS[f]).join(' · ');
        return open
          ? `<li class="tt-sci is-open"><div class="tt-sci-head"><b>${esc(sc.name)}</b><small>${esc(sc.en)} · ${esc(sc.years)}</small></div><span class="tt-sci-tag">${esc(sc.tag)}</span><p>${esc(sc.known)}</p><p class="tt-sci-story">${esc(sc.story)}</p><small class="tt-sci-field">${esc(fields)}</small></li>`
          : `<li class="tt-sci is-locked" aria-label="아직 만나지 않은 과학자, ${esc(fields)} 분야"><div class="tt-sci-head"><b>???</b></div><span class="tt-sci-tag">${esc(fields)}</span><p>아직 만나지 않은 과학자예요. ${esc(fields)} 분야에 마음을 두면 만날지도 몰라요.</p></li>`;
      })
      .join('')}</ul><p class="gx-small">인물 소개는 노벨상·필즈상 공식 발표와 대학·언론 보도 같은 공개 자료를 바탕으로 짧게 정리했어요. 닮은 정도는 게임 속 재미 요소예요.</p>`;
  }
  function openArchive(tab = 'runs') {
    recordCurrent();
    const X = root.GSAExtras;
    if (!X?.openDialog) return;
    const list = readArchive();
    const dialog = X.openDialog({
      eyebrow: 'MY ARCHIVE',
      title: '기록실',
      wide: true,
      className: 'tt-archive',
      body: `<div class="tt-archive-tabs" role="tablist" aria-label="기록실"><button type="button" role="tab" data-tt-tab="runs">지난 이야기 <small>${list.length}</small></button><button type="button" role="tab" data-tt-tab="collection">과학자 도감 <small>${unlockedScientists(list).size}/${root.GSAComparison?.scientists.length || 0}</small></button></div><div class="tt-archive-panel" role="tabpanel" tabindex="0"></div>`,
    });
    const panel = dialog.querySelector('.tt-archive-panel');
    const show = (id) => {
      dialog.querySelectorAll('[data-tt-tab]').forEach((b) => {
        b.setAttribute('aria-selected', String(b.dataset.ttTab === id));
        b.tabIndex = b.dataset.ttTab === id ? 0 : -1;
      });
      panel.innerHTML = id === 'collection' ? collectionHTML(list) : archiveHTML(list);
      panel.scrollTop = 0;
    };
    dialog.querySelectorAll('[data-tt-tab]').forEach((b) => b.addEventListener('click', () => show(b.dataset.ttTab)));
    show(tab);
    root.GSAPeople?.refresh?.(dialog);
  }

  /* ───────────── 시작 화면 ───────────── */

  let layer = null, prevInert = null;
  function isOpen() {
    return !!layer;
  }
  function titleHTML() {
    const save = readSave();
    const s = save?.state;
    const X = root.GSAExtras;
    const version = X?.VERSION || '';
    const list = readArchive();
    const C = root.GSAComparison;
    const seenVersion = (() => {
      try {
        return storage()?.getItem('gsa-life-seen-version');
      } catch (_) {
        return null;
      }
    })();
    const isNew = s && version && seenVersion !== version;
    const cast = [0, 4, 1, 5, 2, 3]
      .map((i, n) => `<span class="tt-cast tt-cast--${n}">${root.GSAPeople?.avatar ? root.GSAPeople.avatar(i, { size: 'normal', label: '' }) : ''}</span>`)
      .join('');
    const player = s && root.GSAPeople?.player ? root.GSAPeople.player(s, { size: 'small', label: `${s.name} 캐릭터` }) : '';
    return `<div class="tt-screen" role="dialog" aria-modal="true" aria-labelledby="tt-title"><div class="tt-bg" aria-hidden="true"></div><header class="tt-top"><span class="tt-unofficial">비공식 팬 시뮬레이터</span><button type="button" class="tt-help" data-tt="help" aria-label="도움말 열기"><span aria-hidden="true">?</span>도움말</button></header><main class="tt-main"><div class="tt-hero"><div class="tt-logo" aria-hidden="true">g.</div><p class="tt-eyebrow">GSA LIFE · THREE YEARS, YOUR STORY</p><h1 id="tt-title">광곽에서<br>살아남기</h1><p class="tt-lead">입학부터 졸업까지 48주. 공부, 친구, 운동부, 학생회, 연구 중 무엇을 키울지는 네 선택이야.</p></div><div class="tt-cast-wrap" aria-hidden="true">${cast}</div><div class="tt-menu">${
      s
        ? `<button type="button" class="tt-btn tt-btn--primary" data-tt="continue" data-tt-autofocus><span class="tt-btn-avatar">${player}</span><span class="tt-btn-text"><b>이어하기</b><small>${esc(s.name)} · ${esc(progressLabel(s))}</small></span></button><button type="button" class="tt-btn" data-tt="new"><b>새 게임</b><small>처음부터 다시 입학하기</small></button>`
        : `<button type="button" class="tt-btn tt-btn--primary" data-tt="start" data-tt-autofocus><span class="tt-btn-text"><b>게임 시작</b><small>바로 입학 카드 만들기</small></span></button>`
    }<button type="button" class="tt-btn" data-tt="tutorial"><b>튜토리얼</b><small>${s ? '지금 화면에서 하나씩 안내받기' : '안내를 받으며 입학하기'}</small></button><button type="button" class="tt-btn tt-btn--ghost" data-tt="archive"><b>기록실</b><small>지난 이야기 ${list.length} · 과학자 도감 ${unlockedScientists(list).size}/${C?.scientists.length || 0}</small></button></div></main>${notesHTML()}<footer class="tt-foot"><button type="button" data-tt="updates">${esc(version)} 업데이트 소식${isNew ? ' <span class="tt-new">NEW</span>' : ''}</button><span aria-hidden="true">·</span><button type="button" data-tt="backup">저장 백업</button><span aria-hidden="true">·</span><span>학교 공식 프로그램이 아니에요</span></footer></div>`;
  }
  // 시작 화면 한쪽의 패치노트: 최신 버전의 변경 사항을 보여 주고 전체 기록은 도움말로 연결합니다.
  function notesHTML() {
    const latest = root.GSAExtras?.changelog?.[0];
    if (!latest) return '';
    return `<aside class="tt-notes" aria-label="패치노트"><h2>PATCH NOTES</h2><h3>${esc(latest.version)}<small>${esc(latest.date)}</small></h3><ul>${latest.items.slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><button type="button" data-tt="updates">${latest.items.length > 4 ? `${latest.items.length - 4}개 더 · ` : ''}패치노트 전체 보기</button></aside>`;
  }
  function render() {
    if (!layer) return;
    layer.innerHTML = titleHTML();
    root.GSAPeople?.refresh?.(layer);
    layer.querySelectorAll('[data-tt]').forEach((b) => b.addEventListener('click', () => act(b.dataset.tt)));
    setTimeout(() => layer?.querySelector('[data-tt-autofocus]')?.focus(), 30);
  }
  function show() {
    if (typeof document === 'undefined') return;
    recordCurrent();
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'tt-layer';
      document.body.appendChild(layer);
      const app = document.getElementById('app'), modal = document.getElementById('modal-root');
      prevInert = { app: app?.inert || false, modal: modal?.inert || false, overflow: document.body.style.overflow };
      if (app) app.inert = true;
      if (modal) modal.inert = true;
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('tt-open');
    }
    render();
  }
  function hide() {
    if (!layer) return;
    layer.remove();
    layer = null;
    const app = document.getElementById('app'), modal = document.getElementById('modal-root');
    // 게임 화면이 사건 창을 띄운 상태라면 그 상태를 다시 그려 입력 가능 여부를 맞춥니다.
    if (app) app.inert = false;
    if (modal) modal.inert = false;
    document.body.style.overflow = prevInert?.overflow || '';
    document.documentElement.classList.remove('tt-open');
    root.GSAApp?.render?.();
  }
  function confirmNewGame(onYes) {
    const X = root.GSAExtras;
    const save = readSave();
    const dialog = X.openDialog({
      eyebrow: 'NEW GAME',
      title: '새로 입학할까요?',
      body: `<p><b>${esc(save?.state?.name || '')}</b>의 진행(${esc(progressLabel(save?.state))})이 지워져요. 마친 이야기는 기록실에 남지만, 진행 중인 기록은 남지 않아요.</p><div class="gx-btn-row gx-btn-row--end"><button type="button" class="gx-btn" data-tt-confirm="backup">먼저 백업하기</button><button type="button" class="gx-btn gx-btn--primary" data-tt-confirm="yes">새로 시작</button></div>`,
    });
    dialog.querySelector('[data-tt-confirm="backup"]').addEventListener('click', () => X.openHelp('backup'));
    dialog.querySelector('[data-tt-confirm="yes"]').addEventListener('click', () => {
      X.closeDialog();
      onYes();
    });
  }
  function act(what) {
    const X = root.GSAExtras;
    if (what === 'continue' || what === 'start') {
      hide();
      if (what === 'start') setTimeout(() => document.getElementById('student-name')?.focus(), 50);
      return;
    }
    if (what === 'new') {
      confirmNewGame(() => {
        recordCurrent();
        root.GSAApp?.reset?.();
        hide();
        setTimeout(() => document.getElementById('student-name')?.focus(), 50);
      });
      return;
    }
    if (what === 'tutorial') {
      hide();
      root.GSATutorial?.start?.();
      return;
    }
    if (what === 'archive') return openArchive();
    if (what === 'help') return X?.openHelp?.('start');
    if (what === 'updates') {
      X?.openHelp?.('updates');
      return;
    }
    if (what === 'backup') return X?.openHelp?.('backup');
  }

  function init() {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', (e) => {
      if (e.target.closest?.('[data-gx-title]')) {
        e.preventDefault();
        show();
      }
      if (e.target.closest?.('[data-gx-archive]')) openArchive();
      // 회고를 넘길 때마다 마친 이야기를 기록실에 반영합니다.
      if (e.target.closest?.('.recap-view')) setTimeout(recordCurrent, 0);
    });
    // 업데이트 소식을 연 뒤 돌아오면 NEW 표시를 지웁니다.
    document.addEventListener('focusin', () => {
      if (layer && !document.querySelector('.gx-layer') && layer.querySelector('.tt-new')) {
        try {
          if (storage()?.getItem('gsa-life-seen-version') === root.GSAExtras?.VERSION) render();
        } catch (_) {}
      }
    });
    show();
  }

  return { init, show, hide, isOpen, openArchive, readArchive, recordCurrent, summarize, upsert, progressLabel, endingKind, unlockedScientists, ARCHIVE_KEY };
});
