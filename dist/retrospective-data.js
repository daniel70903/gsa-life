/* A read-only album assembled from the life that was actually played. */
(function (root) {
  'use strict';
  const STAT_NAMES = { intelligence: '지능', social: '사회성', athletics: '운동', discipline: '자기관리', luck: '행운', creativity: '창의성', resilience: '회복력', leadership: '리더십', research: '연구 역량' };
  const STAGE_NAMES = { none: '처음 만난 사이', friendship: '친구' };
  const TRIPS = { jeju: '제주도 자연탐사', usa: '미국 글로벌 사이언스 챌린지', byeonsan: '변산 자연탐사', independent: '개별 현장연구' };
  const list = value => Array.isArray(value) ? value : [];
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const finite = value => Number.isFinite(value);
  const sum = (items, fn) => items.reduce((total, item) => total + num(fn(item)), 0);
  const unique = items => [...new Set(items.filter(Boolean))];
  const text = value => typeof value === 'string' ? value : '';
  const clone = value => JSON.parse(JSON.stringify(value));
  const round = value => Math.round(value * 100) / 100;
  function call(engine, name, state, fallback) {
    try { return typeof engine?.[name] === 'function' ? engine[name](clone(state)) : fallback; }
    catch (_) { return fallback; }
  }
  function semesterLabel(year, semester) { return `${year}학년 ${semester}학기`; }
  function spread(items, limit) {
    if (items.length <= limit) return items;
    return Array.from({ length: limit }, (_, i) => items[Math.round(i * (items.length - 1) / (limit - 1))]);
  }
  function turnLabel(turn, atEnd = false) {
    if (turn <= 0) return '입학 첫 주';
    if (turn >= 42) return '3학년 2학기 말';
    const value = Math.max(0, Math.min(41, atEnd ? turn - 1 : turn));
    return `${Math.floor(value / 14) + 1}학년 ${Math.floor(value / 7) % 2 + 1}학기`;
  }
  function build(source, engine) {
    const s = source && typeof source === 'object' ? source : {};
    const turn = Math.max(0, Math.min(42, num(s.turn))), dead = s.alive === false || s.ending === 'death';
    const completed = turn >= 42, eligible = dead || completed;
    const grades = list(s.grades).filter(g => g && num(g.year) >= 1 && num(g.year) <= 3);
    const terms = grades.map(g => ({ year: num(g.year), semester: num(g.semester, 1), gpa: round(num(g.gpa)), credits: num(g.earnedCredits, num(g.credits)) })).sort((a, b) => a.year - b.year || a.semester - b.semester);
    const attempted = sum(grades, g => num(g.credits, sum(list(g.subjects), c => c.credits)));
    const points = sum(grades, g => list(g.subjects).length ? sum(g.subjects, c => num(c.point) * num(c.credits)) : num(g.gpa) * num(g.credits));
    const gpa = attempted ? round(points / attempted) : 0, earnedCredits = sum(terms, g => g.credits);
    const schoolField = list(s.school?.fieldCredits);
    const fieldCredits = sum(schoolField, r => r.credits);
    const curriculum = call(engine, 'getCurriculumStatus', s, null);
    const fallbackRequirements = [
      { label: 'TOEIC 730점', current: num(s.toeic?.best), required: 730, complete: num(s.toeic?.best) >= 730 },
      { label: '현장연구 6학점', current: fieldCredits, required: 6, complete: fieldCredits >= 6 },
      ...list(curriculum?.requirements)
    ];
    const graduation = call(engine, 'getGraduationStatus', s, { eligible: !dead && fallbackRequirements.every(r => r.complete), requirements: fallbackRequirements, fieldCredits });
    const endingKind = dead ? 'death' : completed ? (graduation.eligible ? 'graduated' : 'deferred') : 'ongoing';
    const name = text(s.name) || '나의 학교생활';
    const statusName = { graduated: '졸업', deferred: '졸업 요건 준비 중', death: '여기서 멈춘 이야기', ongoing: '이어 쓰는 이야기' }[endingKind];
    const period = completed ? '1학년 입학 — 3학년 2학기' : `입학 — ${turnLabel(turn, true)}까지`;
    const statValues = Object.entries(STAT_NAMES).filter(([key]) => finite(s.stats?.[key])).map(([key, label]) => ({ key, label, value: Math.round(s.stats[key]) }));
    const highStat = [...statValues].sort((a, b) => b.value - a.value)[0];
    const awardsRaw = list(s.awards).filter(a => a && text(a.name));
    const awardMap = new Map();
    for (const a of awardsRaw) {
      const key = `${a.kind || 'award'}:${a.name}`;
      const row = awardMap.get(key) || { name: a.name, count: 0, kind: a.kind || 'award' };
      row.count++; awardMap.set(key, row);
    }
    const awards = [...awardMap.values()];
    const lookup = (collection, id, fallback) => list(engine?.[collection]).find(c => c.id === id)?.name || fallback || id;
    const clubs = [];
    if (s.academicClub) clubs.push({ name: lookup('academicClubs', s.academicClub), type: '학술동아리' });
    if (s.activityClub && s.activityClub !== 'none') clubs.push({ name: lookup('activityClubs', s.activityClub), type: '상설동아리' });
    for (const id of unique(list(s.sportsClubs))) clubs.push({ name: lookup('sportsClubs', id), type: '운동부' });
    const roles = [];
    for (const h of list(s.captainHistory).filter(h => h.passed)) roles.push({ name: `${h.club || s.captainClub || '동아리'} 기장`, period: `1학년 말 선출 · ${h.endedTurn != null || turn >= 28 ? '2학년 말 임기 종료' : dead ? '이야기가 끝날 때까지 활동' : '활동 중'}` });
    if (!roles.length && s.captain) roles.push({ name: `${s.captainClub || '동아리'} 기장`, period: '학교생활 기록' });
    for (const h of list(s.councilHistory).filter(h => h.passed)) roles.push({ name: h.role || '학생회 임원', period: `${num(h.year, 1)}학년 2학기 선출 · ${h.endedTurn != null || turn >= num(h.expiresTurn, h.year === 1 ? 24 : 40) ? `${num(h.year, 1) + 1}학년 1학기 말 임기 종료` : dead ? '이야기가 끝날 때까지 활동' : '활동 중'}` });
    for (const h of list(s.school?.officerHistory).filter(h => h.playerRole)) roles.push({ name: h.playerRole, period: semesterLabel(num(h.year, Math.floor(num(h.term) / 2) + 1), num(h.semester, num(h.term) % 2 + 1)) });
    const relationships = [];
    const resultList = Array.isArray(s.admissions) ? s.admissions : list(s.admissions?.results);
    const admissions = resultList.map(r => ({ name: r.name || lookup('universities', r.id, '지원 대학'), majorName: r.majorName || (typeof engine?.getMajor === 'function' ? engine.getMajor(r.majorId || s.applicationMajors?.[r.id] || 'general')?.name : '') || '전공 기록 없음', accepted: !!r.accepted }));
    if (engine && typeof engine.canEnroll === 'function') admissions.forEach((a, i) => { const raw = resultList[i]; if (a.accepted && engine.canEnroll(s, raw) === false) { a.blocked = true; } });
    const accepted = admissions.filter(a => a.accepted && !a.blocked);
    const completedTrips = schoolField.filter(r => r.type === 'school');
    const sportsEntries = list(s.tournamentHistory).filter(t => t.participated);
    const olympiadEntries = list(s.olympiadHistory).filter(t => t.participated);
    const councilSuccesses = list(s.councilHistory).filter(h => h.passed);
    const missingRequirements = endingKind === 'deferred' ? list(graduation.requirements).filter(r => !r.complete).map(r => `${r.label} · 현재 ${num(r.current)} / ${num(r.required)}`) : [];
    const hasGrades = terms.length > 0;
    const metrics = [
      { label: '누적 평점', value: hasGrades ? gpa.toFixed(2) : '—', detail: hasGrades ? '/ 4.3' : '확정 성적 없음' },
      { label: '수상', value: `${awardsRaw.length}`, detail: '개의 기록' },
      { label: '이수 학점', value: `${earnedCredits}`, detail: '정규 학기 성적 기준' },
      { label: 'TOEIC 최고점', value: num(s.toeic?.best) ? `${num(s.toeic.best)}` : '—', detail: num(s.toeic?.best) ? '/ 990' : '응시 기록 없음' },
      { label: '현장연구', value: `${num(graduation.fieldCredits, fieldCredits)}`, detail: '/ 6학점' },
      { label: '수상', value: `${awards.reduce((n, a) => n + num(a.count, 1), 0)}`, detail: '교내외 수상 기록' }
    ];
    const lifeTitle = endingKind === 'death' ? '기억에 남은 우리의 시간' : highStat ? `${highStat.label}을 강점으로 남긴 학교생활` : '나만의 속도로 쓴 학교생활';
    const summaryParts = [];
    if (hasGrades) summaryParts.push(`${terms.length}개 학기의 성적을 쌓아 누적 평점 ${gpa.toFixed(2)}점을 기록했어.`);
    else summaryParts.push('첫 학기 성적이 확정되기 전까지의 시간이 기록에 남았어.');
    if (clubs.length) summaryParts.push(`${clubs.map(c => c.name).join(', ')}에서 활동했어.`);
    if (awardsRaw.length) summaryParts.push(`${awardsRaw.length}개의 수상 기록도 남겼어.`);
    if (endingKind === 'graduated') summaryParts.push(accepted.length ? '졸업 요건을 채웠고, 합격한 대학으로 향할 수 있게 되었어.' : '졸업 요건을 채우고 다음 진로를 준비하는 출발점에 섰어.');
    else if (endingKind === 'deferred') summaryParts.push('정규 학기는 마쳤고, 남은 졸업 요건을 준비하고 있어.');
    else if (endingKind === 'death') summaryParts.push('학교생활은 여기서 멈췄지만, 함께한 순간과 선택은 이 기록에 남아 있어.');
    const summary = summaryParts.join(' ');

    // Journal rows are newest first. Sort a copy into chronological order;
    // never recycle random rolls or rewrite saved relationship snapshots.
    const journal = list(s.log).map((l, index) => ({ ...l, _index: index })).filter(l => text(l.message) && !/확률|%|가산점|보너스/.test(l.message)).sort((a, b) => num(a.turn) - num(b.turn) || b._index - a._index);
    const eventYear = l => {
      const explicit = text(l.message).match(/([123])학년/);
      if (explicit) return Number(explicit[1]);
      const isYearEnd = /학기를 마|임기를 마|기장으로 선출|기장 선출/.test(text(l.message));
      return Math.min(3, Math.floor(Math.max(0, num(l.turn) - (isYearEnd ? 1 : 0)) / 16) + 1);
    };
    const noteworthy = l => /입학|합격|당선|선출|기장|수상|메달|국가대표|올림피아드|탐사|연구 주제|원서를|전공|기숙사를 떠|퇴사|실험|발표/.test(l.message) && !/수상 선정 완료/.test(l.message);
    const journalLabel = l => /미국|글로벌 사이언스/.test(l.message) && num(l.turn) === 21 ? '2학년 여름방학' : turnLabel(num(l.turn), /학기를 마|임기를 마|기장으로 선출/.test(l.message));
    const slides = [];
    const slide = (id, kicker, title, body, highlights = [], moments = [], characterIds = [], mood = 'idle') => slides.push({ id, kicker, title, body, highlights, moments, characterIds, mood });
    const archetype = list(engine?.archetypes).find(a => a.id === s.archetype)?.name;
    slide('opening', 'MY SCHOOL STORY', dead ? '기억에 남은 순간들을 돌아보며.' : completed ? '입학부터 여기까지, 나의 3년.' : '입학부터 지금까지, 나의 이야기.', `${name}의 학교생활을 한 장씩 돌아보자. ${completed ? '여섯 학기 동안 쌓은 성적과 활동, 사람들의 기억을 모았어.' : '실제로 보낸 시간과 남아 있는 기록을 모았어.'}`, [{ label: '기록 기간', value: period }, { label: '시작 유형', value: archetype || '이전 학교생활 기록' }]);
    const experiencedYears = completed ? 3 : Math.max(1, Math.min(3, Math.ceil(turn / 14)));
    for (let year = 1; year <= experiencedYears; year++) {
      const yearTerms = terms.filter(g => g.year === year), yearGrades = grades.filter(g => num(g.year) === year);
      const yearAttempted = sum(yearGrades, g => g.credits), yearPoints = sum(yearGrades, g => sum(list(g.subjects), c => num(c.point) * num(c.credits)));
      const yearAwards = awardsRaw.filter(a => num(a.year, Math.floor(Math.max(0, num(a.turn) - 1) / 16) + 1) === year);
      const chosen = journal.filter(l => eventYear(l) === year && noteworthy(l));
      const seen = new Set(), candidates = [];
      for (const row of chosen) {
        if (seen.has(row.message)) continue;
        seen.add(row.message); candidates.push({ label: journalLabel(row), text: row.message });
      }
      const moments = spread(candidates, 4);
      if (!moments.length) for (const row of spread(journal.filter(l => eventYear(l) === year), 3)) moments.push({ label: journalLabel(row), text: row.message });
      const finishedYear = turn >= year * 16;
      const yearTitles = { 1: '낯선 교실에서 시작한 첫 장.', 2: '활동과 선택이 넓어진 두 번째 장.', 3: '다음 길을 생각한 마지막 장.' };
      const body = yearTerms.length ? `${yearTerms.length}개 학기의 성적이 남아 있어. ${yearAwards.length ? `${yearAwards.length}번의 수상을 기록했고, ` : ''}${finishedYear ? '한 해 동안의 선택이 다음 이야기로 이어졌어.' : '한 해를 다 마치지는 못했지만, 이때의 시간을 돌아볼 수 있어.'}` : '아직 학기 성적이 확정되기 전이야. 그동안 선택하고 함께했던 순간들이 먼저 기록에 남았어.';
      slide(`year-${year}`, `CHAPTER ${String(year).padStart(2, '0')} · ${year}학년`, yearTitles[year], body, [{ label: '확정 학기', value: `${yearTerms.length}학기` }, { label: '학년 평점', value: yearAttempted ? (yearPoints / yearAttempted).toFixed(2) : '기록 없음' }, { label: '수상', value: `${yearAwards.length}회` }], moments, [], year === 3 ? 'study' : 'idle');
    }
    const activityMoments = [];
    for (const role of roles.slice(0, 2)) activityMoments.push({ label: role.period, text: role.name });
    for (const trip of completedTrips.slice(0, 3)) activityMoments.push({ label: `${num(trip.credits)}학점 이수`, text: TRIPS[trip.id] || trip.name || '학교 현장탐사' });
    if (sportsEntries.length) activityMoments.push({ label: '학교 대표로 참가', text: `교육감배 ${sportsEntries.length}회` });
    if (olympiadEntries.length) activityMoments.push({ label: '문제에 도전한 기록', text: `올림피아드 ${olympiadEntries.length}회` });
    slide('activities', 'BEYOND THE CLASSROOM', '교실 밖에서 남긴 나의 자리.', clubs.length ? `${clubs.map(c => c.name).join(', ')}. 성적표 밖에도 내가 참여한 활동과 함께 맡은 역할이 남아 있어.` : '크고 작은 학교생활의 기록을 돌아보자. 맡은 직책이나 수상이 없어도 이 시간은 내 이야기의 일부야.', [{ label: '동아리·운동부', value: `${clubs.length}곳` }, { label: '맡았던 역할', value: `${roles.length}회` }, { label: '학생회 당선', value: `${councilSuccesses.length}회` }], activityMoments.slice(0, 5), [], sportsEntries.length ? 'sports' : 'idle');
    const nextMoments = admissions.map(a => ({ label: a.blocked ? '합격 · 졸업 요건 미충족으로 진학 불가' : a.accepted ? '합격' : '이번 전형 불합격', text: `${a.name} · ${a.majorName}` }));
    let nextBody;
    if (endingKind === 'death') nextBody = '이 학교생활은 여기서 끝났어. 완주하지 못한 시간을 채워 쓰지 않고, 실제로 남긴 기록만 앨범에 담았어.';
    else if (endingKind === 'deferred') nextBody = '정규 3년을 마쳤지만 졸업에는 아직 채울 요건이 남아 있어. 회고를 닫으면 필요한 준비를 계속할 수 있어. 대학 합격과 최종 졸업은 별도로 기록돼.';
    else if (endingKind === 'graduated') nextBody = accepted.length ? '졸업 요건을 모두 채웠어. 아래는 합격한 대학을 포함한 전형 결과야. 어느 길로 나아갈지 생각하며 다음 장을 열어 보자.' : '졸업 요건을 모두 채웠어. 이번 전형에서 합격 기록은 없지만, 학교생활의 끝에서 다음 진로와 도전을 준비하게 되었어.';
    else nextBody = '학교생활은 아직 진행 중이야. 앞으로의 선택이 이 기록에 더해질 거야.';
    slide('next-chapter', 'THE NEXT PAGE', statusName, nextBody, [{ label: '최종 상태', value: statusName }, { label: '대학 합격', value: `${accepted.length}곳` }], nextMoments.slice(0, 3));
    // v0.13 평가: 졸업 OVR + 업적 ★, 그리고 졸업 뒤 커리어 에필로그.
    let evaluation = null;
    try {
      if (engine && typeof engine.getOverall === 'function') {
        const ach = engine.getAchievements(s), career = endingKind === 'graduated' || endingKind === 'deferred' ? engine.getCareer(s) : null;
        evaluation = { ovr: engine.getOverall(s), stars: ach.stars, achievements: ach.list.filter(x => x.earned).map(x => x.label), career };
        if (career) slide('career', 'AFTER GSA', career.prizes ? `${career.prize} ${career.prizes}회, ${career.title}.` : `그 뒤의 이야기: ${career.title}.`, `졸업 OVR ${evaluation.ovr} · ★ ${ach.stars}개로 학교를 떠난 뒤의 이야기야. 게임 속 상상이고, 같은 기록이면 같은 결말이 나와.`, [{ label: '졸업 OVR', value: String(evaluation.ovr) }, { label: '업적', value: `★ ${ach.stars}` }, { label: career.prize, value: `${career.prizes}회` }], career.timeline.map(t => ({ label: `${t.age}세`, text: t.text })));
      }
    } catch (_) { evaluation = null; }
    // 컴패리즌: 마지막 장에서 기록과 가장 닮은 과학자를 소개합니다. 모듈이 없으면 건너뜁니다.
    let comparison = null;
    try {
      comparison = root.GSAComparison && engine ? root.GSAComparison.compare(s, engine) : null;
    } catch (_) {
      comparison = null;
    }
    if (comparison) {
      const best = comparison.best;
      slide('comparison', 'MY SCIENTIST MATCH', `나와 가장 닮은 과학자, ${best.name}.`, `${best.reason.text} ${best.story}`, [{ label: '닮은 정도', value: `${best.similarity}%` }, { label: '졸업 후 연구자 유형', value: comparison.type.title }], [{ label: best.tag, text: best.known }, ...comparison.others.map(o => ({ label: `${o.similarity}% · 또 다른 닮은 꼴`, text: `${o.name} · ${o.tag}` }))], [], endingKind === 'graduated' ? 'celebrate' : 'idle');
    }
    return { eligible, endingKind, name, title: lifeTitle, subtitle: statusName, period, summary, metrics, slides, awards, roles, clubs, relationships, admissions, stats: statValues, terms, missingRequirements, comparison, evaluation };
  }
  const api = { build };
  root.GSARetrospectiveData = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
