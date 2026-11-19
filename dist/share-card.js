/* GSA LIFE · 3년의 기록을 한 장의 이미지 카드로 그립니다. 게임 상태를 바꾸지 않습니다. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSAShareCard = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const SITE = 'daniel70903.github.io/gsa-life';
  const W = 1080, H = 1350;
  const C = { deep: '#0c1321', night: '#141d2d', panel: '#18233a', gold: '#e9c76e', goldSoft: '#e9c76e33', white: '#f7f6ef', muted: '#aeb8c6', dim: '#6f7b8f', cream: '#f7f1de', green: '#8fd3a8', red: '#f19a8a' };
  const FONT = '"Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
  const STATUS = { graduated: '졸업', deferred: '졸업 요건 준비 중', death: '이야기의 마지막', ongoing: '진행 중인 기록' };

  // 받침 유무에 맞춰 '로/으로'를 고릅니다(ㄹ 받침은 '로').
  const withRo = (word) => {
    const code = String(word).charCodeAt(String(word).length - 1) - 0xac00;
    if (code < 0 || code > 11171) return '(으)로';
    const jong = code % 28;
    return jong === 0 || jong === 8 ? '로' : '으로';
  };
  const arr = (v) => (Array.isArray(v) ? v : []);
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  // 회고 데이터에서 카드에 들어갈 내용만 고릅니다. 화면 그리기와 분리해 테스트할 수 있습니다.
  function buildModel(state, engine, data) {
    const d = data || root.GSARetrospectiveData.build(state, engine);
    const metric = (re) => arr(d.metrics).find((m) => re.test(m.label));
    const gpaMetric = metric(/평점/);
    const awardCount = arr(d.awards).reduce((n, a) => n + Math.max(0, num(a.count)), 0);
    const roleMap = new Map();
    for (const r of arr(d.roles)) roleMap.set(r.name, (roleMap.get(r.name) || 0) + 1);
    const rank = (name) => (/부회장/.test(name) ? 1 : /회장/.test(name) ? 0 : /기장/.test(name) ? 2 : /부장|임원/.test(name) ? 3 : 4);
    const roles = [...roleMap].sort((a, b) => rank(a[0]) - rank(b[0])).map(([name, count]) => (count > 1 ? `${name} ×${count}` : name));
    const admissions = arr(d.admissions).map((a) => ({ name: String(a.name || ''), major: String(a.majorName || ''), accepted: !!a.accepted }));
    const stats = arr(d.stats).slice().sort((a, b) => num(b.value) - num(a.value));
    const pick = (re) => {
      const m = metric(re);
      return m ? { label: m.label, value: String(m.value), detail: String(m.detail || '') } : null;
    };
    const archetype = arr(engine?.archetypes).find((t) => t.id === state?.archetype)?.name || '';
    return {
      name: String(d.name || '나의 학교생활'),
      gender: state?.gender === 'female' ? 'female' : 'male',
      endingKind: d.endingKind || 'ongoing',
      status: STATUS[d.endingKind] || '학교생활 기록',
      title: String(d.title || ''),
      period: String(d.period || ''),
      archetype,
      gpa: gpaMetric ? String(gpaMetric.value) : '—',
      awards: awardCount,
      metrics: [pick(/TOEIC/), pick(/이수 학점/), pick(/현장연구/), pick(/만남/)].filter(Boolean),
      terms: arr(d.terms).map((t) => ({ label: `${num(t.year)}-${num(t.semester)}`, gpa: num(t.gpa) })),
      clubs: arr(d.clubs).map((c) => String(c.name)),
      roles,
      admissions,
      topStats: stats.slice(0, 5).map((s) => ({ label: String(s.label), value: Math.round(num(s.value)) })),
      site: SITE,
    };
  }

  /* ───────────── 캔버스 그리기 ───────────── */

  function font(size, weight = 400) {
    return `${weight} ${size}px ${FONT}`;
  }
  function fitFont(ctx, text, maxWidth, size, weight, min = 14) {
    let s = size;
    ctx.font = font(s, weight);
    while (s > min && ctx.measureText(text).width > maxWidth) ctx.font = font(--s, weight);
    return s;
  }
  function ellipsis(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function text(ctx, value, x, y, { size = 24, weight = 400, color = C.white, align = 'left', max, baseline = 'alphabetic', spacing } = {}) {
    ctx.font = font(size, weight);
    if (max) fitFont(ctx, value, max, size, weight, Math.max(12, Math.round(size * 0.6)));
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    if (spacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(max ? ellipsis(ctx, value, max) : value, x, y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  function pill(ctx, label, cx, y, { color = C.gold, fill = '#e9c76e1a', size = 22, padX = 22, h = 44, align = 'center' } = {}) {
    ctx.font = font(size, 700);
    const w = ctx.measureText(label).width + padX * 2;
    const x = align === 'center' ? cx - w / 2 : cx;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    text(ctx, label, x + w / 2, y + h / 2 + 1, { size, weight: 700, color, align: 'center', baseline: 'middle' });
    return w;
  }
  function chips(ctx, items, x, y, maxWidth, { size = 22, h = 44, gap = 10, maxRows = 2, color = C.white, fill = '#ffffff0d', stroke = '#ffffff24' } = {}) {
    let cx = x, cy = y, row = 1;
    for (const item of items) {
      ctx.font = font(size, 500);
      const label = ellipsis(ctx, item, maxWidth - 36);
      const w = ctx.measureText(label).width + 36;
      if (cx + w > x + maxWidth && cx > x) {
        if (row >= maxRows) break;
        row++;
        cx = x;
        cy += h + gap;
      }
      roundRect(ctx, cx, cy, w, h, 12);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
      text(ctx, label, cx + 18, cy + h / 2 + 1, { size, weight: 500, color, baseline: 'middle' });
      cx += w + gap;
    }
    return cy + h;
  }
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  async function ensureFonts() {
    if (!document.fonts?.load) return;
    try {
      await Promise.race([Promise.all([document.fonts.load(font(40, 400), '가A1'), document.fonts.load(font(40, 700), '가A1'), document.fonts.load(font(40, 800), '가A1')]), new Promise((r) => setTimeout(r, 2500))]);
    } catch (_) {}
  }

  async function draw(model, canvas = document.createElement('canvas')) {
    await ensureFonts();
    const sprite = await loadImage('assets/characters/students-v1.webp');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const P = 72;

    // 배경
    ctx.fillStyle = C.deep;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 250, 20, W / 2, 250, 620);
    glow.addColorStop(0, '#d7b2532e');
    glow.addColorStop(1, '#d7b25300');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = '#ffffff';
    for (let i = -H; i < W + H; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 30, 0);
      ctx.lineTo(i + 30 - H * 0.7, H);
      ctx.lineTo(i - H * 0.7, H);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = C.gold;
    ctx.fillRect(0, 0, W, 10);

    // 머리글
    text(ctx, 'GSA LIFE', P, 84, { size: 24, weight: 800, color: C.gold, spacing: 3 });
    ctx.font = font(24, 800);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
    const brandW = ctx.measureText('GSA LIFE').width;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    text(ctx, '광곽에서 살아남기', P + brandW + 16, 84, { size: 22, weight: 500, color: C.muted });
    text(ctx, model.period, W - P, 84, { size: 22, color: C.muted, align: 'right', max: 360 });

    // 캐릭터와 두 숫자
    const tile = 220, tx = (W - tile) / 2, ty = 128;
    ctx.save();
    ctx.shadowColor = '#00000066';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, tx, ty, tile, tile, 40);
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.restore();
    roundRect(ctx, tx, ty, tile, tile, 40);
    ctx.lineWidth = 5;
    ctx.strokeStyle = C.gold;
    ctx.stroke();
    if (sprite) {
      const index = model.gender === 'female' ? 7 : 6, cw = sprite.naturalWidth / 4, ch = sprite.naturalHeight / 2;
      const sx = (index % 4) * cw, sy = Math.floor(index / 4) * ch, size = tile - 16;
      ctx.save();
      roundRect(ctx, tx + 4, ty + 4, tile - 8, tile - 8, 36);
      ctx.clip();
      ctx.drawImage(sprite, sx, sy, cw, ch, tx + 8, ty + 12, size, size);
      ctx.restore();
    }
    const hero = (value, label, detail, cx) => {
      text(ctx, value, cx, 262, { size: 112, weight: 800, color: C.gold, align: 'center', max: 300 });
      text(ctx, label, cx, 314, { size: 26, weight: 700, color: C.gold, align: 'center' });
      text(ctx, detail, cx, 350, { size: 21, color: C.muted, align: 'center' });
    };
    hero(model.gpa, '누적 평점', '/ 4.3', 222);
    hero(String(model.awards), '수상 기록', '함께 쌓은 성취', W - 222);
    const statusFill = { death: '#f19a8a1a' }[model.endingKind] || '#e9c76e1a', statusColor = model.endingKind === 'death' ? C.red : C.gold;
    pill(ctx, model.status, W / 2, ty + tile + 22, { color: statusColor, fill: statusFill, size: 21, h: 42 });

    // 이름과 한 줄 제목
    text(ctx, model.name, W / 2, 492, { size: 66, weight: 800, align: 'center', max: W - P * 2 });
    text(ctx, model.title, W / 2, 546, { size: 32, weight: 700, color: C.white, align: 'center', max: W - P * 2 });
    if (model.archetype) text(ctx, `${model.archetype}${withRo(model.archetype)} 입학`, W / 2, 586, { size: 21, color: C.muted, align: 'center' });

    // 지표 줄
    const my = 616, mh = 136;
    roundRect(ctx, P, my, W - P * 2, mh, 22);
    ctx.fillStyle = '#ffffff08';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff1a';
    ctx.stroke();
    const metrics = model.metrics.slice(0, 4), colW = (W - P * 2) / Math.max(1, metrics.length);
    metrics.forEach((m, i) => {
      const cx = P + colW * i + colW / 2;
      if (i) {
        ctx.fillStyle = '#ffffff1a';
        ctx.fillRect(P + colW * i, my + 26, 1.5, mh - 52);
      }
      text(ctx, m.value, cx, my + 64, { size: 46, weight: 800, align: 'center', max: colW - 24 });
      text(ctx, m.label, cx, my + 97, { size: 20, weight: 700, color: C.gold, align: 'center', max: colW - 20 });
      if (m.detail) text(ctx, m.detail, cx, my + 121, { size: 17, color: C.dim, align: 'center', max: colW - 20 });
    });

    // 학기별 평점
    const gy = 798;
    text(ctx, '학기마다 남긴 발자국', P, gy + 4, { size: 24, weight: 700 });
    const terms = model.terms.slice(0, 6);
    const barArea = W - P * 2, slot = barArea / 6, barTop = gy + 30, barH = 96, barW = 34;
    for (let i = 0; i < 6; i++) {
      const t = terms[i], cx = P + slot * i + slot / 2;
      roundRect(ctx, cx - barW / 2, barTop, barW, barH, 9);
      ctx.fillStyle = '#ffffff0f';
      ctx.fill();
      if (t) {
        // 2.0~4.3 구간을 막대 높이로 써서 학기마다의 차이가 잘 보이게 합니다.
        const h = Math.max(10, Math.min(1, Math.max(0, (t.gpa - 2) / 2.3)) * barH);
        roundRect(ctx, cx - barW / 2, barTop + barH - h, barW, h, 9);
        ctx.fillStyle = C.gold;
        ctx.fill();
      }
      text(ctx, t ? t.gpa.toFixed(2) : '—', cx, barTop + barH + 32, { size: 24, weight: 800, color: t ? C.white : C.dim, align: 'center' });
      text(ctx, `${Math.floor(i / 2) + 1}학년 ${(i % 2) + 1}학기`, cx, barTop + barH + 58, { size: 17, color: C.muted, align: 'center' });
    }

    // 활동과 진로
    const cy = 1048, colGap = 40, half = (W - P * 2 - colGap) / 2, rx = P + half + colGap;
    ctx.fillStyle = '#ffffff1a';
    ctx.fillRect(P, cy - 30, W - P * 2, 1.5);
    text(ctx, '내가 속했던 곳', P, cy + 8, { size: 24, weight: 700 });
    let leftBottom = cy + 26;
    const clubItems = model.clubs.length ? model.clubs : ['동아리 기록 없음'];
    leftBottom = chips(ctx, clubItems, P, cy + 26, half, { size: 21, h: 42, maxRows: 2 });
    model.roles.slice(0, leftBottom > cy + 80 ? 2 : 3).forEach((r, i) => {
      text(ctx, `★ ${r}`, P, leftBottom + 34 + i * 31, { size: 21, weight: 600, color: C.gold, max: half });
    });

    if (model.admissions.length) {
      text(ctx, '대학 전형 결과', rx, cy + 8, { size: 24, weight: 700 });
      model.admissions.slice(0, 3).forEach((a, i) => {
        const y = cy + 24 + i * 50;
        const tag = a.accepted ? '합격' : '불합격', color = a.accepted ? C.gold : C.dim;
        ctx.font = font(18, 700);
        const tw = ctx.measureText(tag).width + 22;
        roundRect(ctx, rx, y + 6, tw, 34, 8);
        ctx.fillStyle = a.accepted ? '#e9c76e22' : '#ffffff0d';
        ctx.fill();
        text(ctx, tag, rx + tw / 2, y + 24, { size: 18, weight: 700, color, align: 'center', baseline: 'middle' });
        text(ctx, a.name, rx + tw + 14, y + 26, { size: 24, weight: 700, color: a.accepted ? C.white : C.muted, max: half - tw - 14, baseline: 'middle' });
        ctx.font = font(24, 700);
        const nw = Math.min(ctx.measureText(a.name).width, half - tw - 14);
        if (a.major) text(ctx, a.major, rx + tw + 14 + nw + 10, y + 27, { size: 18, color: C.dim, max: Math.max(0, half - tw - nw - 40), baseline: 'middle' });
      });
    } else {
      text(ctx, '가장 높은 능력치', rx, cy + 8, { size: 24, weight: 700 });
      model.topStats.slice(0, 3).forEach((s, i) => {
        const y = cy + 40 + i * 50;
        text(ctx, s.label, rx, y + 14, { size: 21, color: C.muted });
        roundRect(ctx, rx + 120, y, half - 180, 16, 8);
        ctx.fillStyle = '#ffffff12';
        ctx.fill();
        roundRect(ctx, rx + 120, y, Math.max(16, ((half - 180) * Math.min(100, s.value)) / 100), 16, 8);
        ctx.fillStyle = C.gold;
        ctx.fill();
        text(ctx, String(s.value), rx + half, y + 15, { size: 22, weight: 800, align: 'right' });
      });
    }

    // 바닥글
    const fy = H - 74;
    ctx.fillStyle = '#ffffff1a';
    ctx.fillRect(P, fy - 44, W - P * 2, 1.5);
    roundRect(ctx, P, fy - 22, 48, 48, 12);
    ctx.fillStyle = C.gold;
    ctx.fill();
    text(ctx, 'g.', P + 24, fy + 3, { size: 28, weight: 800, color: C.deep, align: 'center', baseline: 'middle' });
    text(ctx, model.site, P + 64, fy - 2, { size: 22, weight: 700 });
    text(ctx, '비공식 팬 게임 · 게임 속 가상 기록', P + 64, fy + 26, { size: 17, color: C.dim });
    text(ctx, '어떤 학생으로 기억될지는,', W - P, fy - 2, { size: 18, color: C.muted, align: 'right' });
    text(ctx, '내가 보낸 시간이 말해 준다.', W - P, fy + 26, { size: 18, color: C.muted, align: 'right' });
    return canvas;
  }

  function toBlob(canvas) {
    return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('이미지를 만들지 못했어요.'))), 'image/png'));
  }
  function fileName(model) {
    return `gsa-life-${String(model.name).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 16)}-card.png`;
  }

  /* ───────────── 미리보기 대화상자 ───────────── */

  async function open(state, engine, opener) {
    const X = root.GSAExtras;
    const dialog = X.openDialog({
      eyebrow: 'MY RESULT CARD',
      title: '나의 학교생활 카드',
      className: 'gx-card-dialog',
      body: `<div class="gx-card-preview" aria-busy="true"><div class="gx-card-loading">카드를 그리는 중…</div></div><div class="gx-btn-row gx-btn-row--end"><button type="button" class="gx-btn" data-card="share" hidden>공유하기</button><button type="button" class="gx-btn gx-btn--primary" data-card="save" disabled>이미지 저장</button></div><p class="gx-small gx-card-hint">휴대폰에서는 이미지를 길게 눌러 사진에 저장할 수도 있어요.</p><p class="gx-status" role="status" aria-live="polite"></p>`,
    });
    const status = (t) => (dialog.querySelector('.gx-status').textContent = t);
    try {
      const model = buildModel(state, engine);
      const canvas = await draw(model);
      const blob = await toBlob(canvas);
      if (!document.contains(dialog)) return;
      const url = URL.createObjectURL(blob);
      const preview = dialog.querySelector('.gx-card-preview');
      preview.removeAttribute('aria-busy');
      preview.innerHTML = `<img src="${url}" alt="${model.name}의 학교생활 결과 카드: ${model.status}, 누적 평점 ${model.gpa}, 수상 ${model.awards}회">`;
      const file = typeof File === 'function' ? new File([blob], fileName(model), { type: 'image/png' }) : null;
      const save = dialog.querySelector('[data-card="save"]'), share = dialog.querySelector('[data-card="share"]');
      save.disabled = false;
      save.onclick = () => {
        X.downloadBlob(blob, fileName(model));
        status('이미지를 저장했어요.');
      };
      if (file && root.navigator?.canShare?.({ files: [file] })) {
        share.hidden = false;
        share.onclick = async () => {
          try {
            await root.navigator.share({ files: [file], title: '광곽에서 살아남기', text: `${model.name}의 3년 · ${model.title}\nhttps://${SITE}/` });
          } catch (e) {
            if (e?.name !== 'AbortError') status('공유하지 못했어요. 이미지 저장을 이용해 주세요.');
          }
        };
      }
    } catch (e) {
      status(e.message || '카드를 만들지 못했어요.');
    }
  }

  function init() {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-recap-card]');
      if (!b) return;
      const engine = root.GSAEngine;
      let state = null;
      try {
        state = JSON.parse(root.localStorage.getItem('gsa-life-v1'))?.state;
        if (state && engine?.migrate) state = engine.migrate(state);
      } catch (_) {}
      if (!state) return;
      open(state, engine, b);
    });
  }

  return { buildModel, draw, open, init, SITE, size: { width: W, height: H } };
});
