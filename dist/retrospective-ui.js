/* GSA LIFE · a small album of the life that was actually played. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSARetrospectiveUI = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icons = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8v5c0 4-2 6-4 6s-4-2-4-6V3Z M8 5H4v3c0 3 2 4 5 4m7-7h4v3c0 3-2 4-5 4m-3 2v5m-4 2h8m-6-2h4"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3V4Zm9 2v15"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>'
  };
  const array = value => Array.isArray(value) ? value : [];
  const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const stageLabels = { none: '알아가는 사이', friendship: '친구', dating: '교제 중', ended: '각자의 일상으로' };

  function create(E, P, suppliedData) {
    function data(s) {
      const provider = suppliedData || root.GSARetrospectiveData;
      if (!provider?.build) throw new Error('학교생활 회고를 준비하지 못했어요. 다시 열어주세요.');
      return provider.build(s, E);
    }
    function totalPages(s) { return array(data(s).slides).length; }
    function picture(s, mood, summary) {
      return `<div class="recap-portrait ${summary ? 'recap-portrait--summary' : ''}"><span class="recap-portrait-ring" aria-hidden="true"></span>${P.player(s, { size: 'normal', mood: mood || 'idle', label: `${s.name || '나'} 캐릭터` })}</div>`;
    }
    function people(d, ids) {
      return array(ids).map(id => array(d.relationships).find(p => p.id === id)).filter(Boolean).map(p => `<span class="recap-cameo">${P.avatar(p.portraitIndex, { size: 'small', label: p.name })}<b>${esc(p.name)}</b></span>`).join('');
    }
    function stageToolbar(d, page, count, summary) {
      return `<div class="recap-toolbar"><span class="recap-album-label"><span aria-hidden="true">g.</span> MY SCHOOL ALBUM</span><div><span class="recap-counter">${summary ? '한 장으로 보는 학교생활' : `${page + 1} / ${count}`}</span><button type="button" class="recap-text-button" data-recap-close>기록으로 돌아가기</button></div></div>`;
    }
    function renderSlides(s, d, rawPage) {
      const slides = array(d.slides);
      if (!slides.length) return renderSummary(s, d);
      const page = Math.min(slides.length - 1, Math.max(0, Math.floor(num(rawPage))));
      const slide = slides[page];
      const last = page === slides.length - 1;
      const moments = array(slide.moments);
      const highlights = array(slide.highlights);
      return `<section class="recap-view recap-slideshow" aria-label="학교생활 회고" data-recap-mode="slides" data-recap-page="${page}" data-recap-total="${slides.length}">${stageToolbar(d, page, slides.length, false)}<div class="recap-progress" aria-label="회고 진행 ${page + 1}장 / ${slides.length}장">${slides.map((_, i) => `<span class="${i <= page ? 'is-complete' : ''} ${i === page ? 'is-current' : ''}"></span>`).join('')}</div><article class="recap-slide" data-recap-advance data-recap-slide-id="${esc(slide.id)}" aria-labelledby="recap-title"><div class="recap-slide-top"><span class="recap-kicker">${esc(slide.kicker || d.period)}</span><span class="recap-page-number" aria-hidden="true">${String(page + 1).padStart(2, '0')}</span></div><div class="recap-slide-center"><div class="recap-cast">${picture(s, slide.mood || 'idle', false)}${people(d, slide.characterIds)}</div><h1 id="recap-title" tabindex="-1">${esc(slide.title)}</h1><p class="recap-body">${esc(slide.body)}</p></div>${highlights.length ? `<div class="recap-highlights">${highlights.map(h => `<div><strong>${esc(h.value)}</strong><span>${esc(h.label)}</span></div>`).join('')}</div>` : ''}${moments.length ? `<ol class="recap-moments">${moments.map(m => `<li><span>${esc(m.label)}</span><p>${esc(m.text)}</p></li>`).join('')}</ol>` : ''}<div class="recap-slide-signature"><span>GSA LIFE</span><span>${esc(d.name)}의 기록</span></div></article><div class="recap-controls"><button type="button" class="recap-secondary" data-recap-prev ${page === 0 ? 'disabled' : ''}><span aria-hidden="true">←</span> 이전 장</button><button type="button" class="recap-text-button recap-skip" data-recap-skip>한 장 요약으로</button><button type="button" class="recap-primary" ${last ? 'data-recap-summary' : 'data-recap-next'}>${last ? '나의 학교생활 한 장 보기' : '다음 장'} ${icons.arrow}</button></div><p class="recap-keyboard-hint">화면이나 다음 장을 누르면 이야기가 이어져요. ← → 키로도 넘길 수 있어요.</p></section>`;
    }
    function comparisonBlock(d) {
      const c = d && d.comparison;
      if (!c || !c.best) return '';
      const b = c.best;
      const ring = Math.max(0, Math.min(100, num(b.similarity)));
      return `<section class="recap-comparison" aria-label="나와 닮은 과학자"><div class="recap-comparison-main"><div class="recap-match-ring" style="--match:${ring}" aria-hidden="true"><b>${ring}<small>%</small></b></div><div class="recap-match-text"><span class="recap-match-label">MY SCIENTIST MATCH · 나와 닮은 과학자</span><h2>${esc(b.name)} <small>${esc(b.en)} · ${esc(b.years)}</small></h2><p class="recap-match-tag">${esc(b.tag)} · ${esc(array(b.fields).join(' · '))}</p><p>${esc(b.reason && b.reason.text)} ${esc(b.known)}</p></div></div><div class="recap-comparison-side"><div class="recap-future"><span>졸업 후 연구자 유형</span><b>${esc(c.type && c.type.title)}</b><p>${esc(c.type && c.type.future)}가 될지도 몰라.</p></div>${array(c.others).length ? `<div class="recap-also"><span>또 다른 닮은 꼴</span>${array(c.others).map(o => `<em>${esc(o.name)} <small>${num(o.similarity)}%</small></em>`).join('')}</div>` : ''}</div><p class="recap-comparison-note">닮은 정도는 게임 속 재미 요소예요. 실제 인물에 대한 평가가 아니에요.</p></section>`;
    }
    function renderSummary(s, d) {
      const metrics = array(d.metrics);
      const mainGPA = metrics.find(m => /평점/.test(m.label));
      const awardCount = array(d.awards).reduce((n, a) => n + Math.max(0, num(a.count)), 0);
      const status = { graduated: '졸업', deferred: '졸업 요건 준비 중', death: '이야기의 마지막', ongoing: '진행 중인 기록' }[d.endingKind] || '학교생활 기록';
      const summaryText = typeof d.summary === 'string' ? d.summary : '';
      const completed = d.endingKind === 'graduated';
      const awards = array(d.awards);
      const roles = array(d.roles);
      const clubs = array(d.clubs);
      const relations = array(d.relationships).filter(p => num(p.meetings) > 0 || ['friendship', 'dating', 'ended'].includes(p.stage));
      const admissions = array(d.admissions);
      const terms = array(d.terms);
      const stats = array(d.stats);
      return `<section class="recap-view recap-summary" aria-label="한 장으로 보는 학교생활" data-recap-mode="summary">${stageToolbar(d, 0, 0, true)}<article class="recap-summary-card" aria-labelledby="recap-title"><header class="recap-card-top"><span>GSA LIFE <b>나의 학교생활</b></span><span>${esc(d.period)}</span></header><div class="recap-career-hero"><div class="recap-major-number"><strong>${esc(mainGPA?.value || '—')}</strong><span>누적 평점</span><small>${esc(mainGPA?.detail || '4.3 만점')}</small></div><div class="recap-identity">${picture(s, completed ? 'celebrate' : 'idle', true)}<span class="recap-status recap-status--${esc(d.endingKind)}">${esc(status)}</span><h1 id="recap-title" tabindex="-1">${esc(d.name)}</h1></div><div class="recap-major-number"><strong>${awardCount}</strong><span>수상 기록</span><small>함께 쌓은 성취</small></div></div><div class="recap-life-title"><h2>${esc(d.title)}</h2><p>${esc(d.subtitle)}</p></div>${summaryText ? `<p class="recap-summary-narrative">${esc(summaryText)}</p>` : ''}${comparisonBlock(d)}<div class="recap-trophy-row" aria-label="수상 요약">${awards.length ? awards.map(a => `<span class="recap-award"><span class="recap-award-icon">${icons.trophy}</span><span>${esc(a.name)}${num(a.count) > 1 ? `<b> × ${num(a.count)}</b>` : ''}</span></span>`).join('') : `<span class="recap-empty-award">${icons.star} 상의 개수로 다 담을 수 없는 나의 시간.</span>`}</div><dl class="recap-metric-grid">${metrics.map(m => `<div><dd>${esc(m.value)}</dd><dt>${esc(m.label)}</dt>${m.detail ? `<small>${esc(m.detail)}</small>` : ''}</div>`).join('')}</dl>${terms.length ? `<section class="recap-semesters"><h2>학기마다 남긴 발자국</h2><div class="recap-term-grid">${terms.map(t => `<div><span>${num(t.year)}학년 ${num(t.semester)}학기</span><div class="recap-gpa-track" aria-hidden="true"><i style="height:${Math.max(0, Math.min(100, num(t.gpa) / 4.3 * 100))}%"></i></div><strong>${num(t.gpa).toFixed(2)}</strong><small>${num(t.credits)}학점</small></div>`).join('')}</div></section>` : ''}<div class="recap-record-columns"><section class="recap-record-section"><h2>${icons.book} 내가 속했던 곳</h2>${clubs.length ? `<div class="recap-club-list">${clubs.map(c => `<span><b>${esc(c.name)}</b><small>${esc(c.type)}</small></span>`).join('')}</div>` : '<p class="recap-empty">가입한 동아리 기록이 없어요.</p>'}${roles.length ? `<div class="recap-role-list">${roles.map(r => `<span>${icons.star}<b>${esc(r.name)}</b><small>${esc(r.period)}</small></span>`).join('')}</div>` : '<p class="recap-empty">직책 없이도 나만의 시간을 쌓았어요.</p>'}</section><section class="recap-record-section"><h2>함께한 사람들</h2>${relations.length ? `<div class="recap-friends">${relations.map(p => `<div>${P.avatar(p.portraitIndex, { size: 'small', label: p.name })}<span><b>${esc(p.name)}</b><small>${esc(stageLabels[p.stage] || stageLabels.none)} · 만남 ${num(p.meetings)}회</small></span></div>`).join('')}</div>` : '<p class="recap-empty">기록된 개인별 만남은 아직 없어요.</p>'}</section></div><section class="recap-next-chapter"><div><span class="recap-kicker">THE NEXT CHAPTER</span><h2>${d.endingKind === 'death' ? '여기까지 남긴 이야기' : '학교 밖, 다음 페이지'}</h2></div><div class="recap-destinations">${admissions.length ? admissions.map(a => `<div><span class="recap-admission-state ${a.accepted ? 'is-accepted' : ''}">${a.accepted ? '합격' : '불합격'}</span><strong>${esc(a.name)}</strong><small>${esc(a.majorName)}</small></div>`).join('') : `<p class="recap-empty">${d.endingKind === 'death' ? '마지막 순간까지의 활동과 기억을 남겼어요.' : '확정된 대학 전형 결과가 없어요.'}</p>`}</div>${!completed && admissions.some(a => a.accepted) && d.endingKind !== 'death' ? '<p class="recap-pending-note">합격한 대학에 진학하려면 졸업 요건을 충족해야 해요.</p>' : ''}</section>${array(d.missingRequirements).length && d.endingKind === 'deferred' ? `<section class="recap-missing"><h2>마지막으로 채울 것</h2><ul>${d.missingRequirements.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p>기록으로 돌아가 남은 졸업 요건을 준비할 수 있어요.</p></section>` : ''}${stats.length ? `<section class="recap-stat-strip" aria-label="마지막 능력치">${stats.map(x => `<span><small>${esc(x.label)}</small><b>${Math.round(num(x.value))}</b></span>`).join('')}</section>` : ''}<footer class="recap-card-footer"><span class="recap-seal" aria-hidden="true">g.</span><p>어떤 학생으로 기억될지는,<br>내가 보낸 시간이 말해준다.</p><span>GSA LIFE · 비공식 게임 기록</span></footer></article><div class="recap-summary-actions"><button type="button" class="recap-secondary" data-recap-replay>처음부터 다시 돌아보기</button><button type="button" class="recap-secondary recap-card-button" data-recap-card>결과 카드 이미지</button><button type="button" class="recap-primary" data-recap-close>${d.endingKind === 'deferred' ? '졸업 요건 이어서 준비하기' : '학교생활 기록으로'} ${icons.arrow}</button></div></section>`;
    }
    function render(s, options = {}) {
      const d = data(s);
      return options.mode === 'summary' ? renderSummary(s, d) : renderSlides(s, d, options.page || 0);
    }
    return { render, totalPages };
  }
  return { create };
});
