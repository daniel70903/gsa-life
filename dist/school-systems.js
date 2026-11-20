(function (root) {
  'use strict';
  const COHORT_SIZE = 96, CLASS_SIZE = 16, CLASS_COUNT = 6;
  const ROLE_NAMES = ['반장', '부반장', '대의원'];
  const TRIPS = [
    { id: 'jeju', name: '제주도 현장탐사', turn: 11, credits: 1 },
    { id: 'usa', name: '미국 현장탐사', turn: 21, credits: 3 },
    { id: 'byeonsan', name: '변산반도 현장탐사', turn: 25, credits: 1 }
  ];
  const ELECTIVES = ['advanced_physics', 'advanced_math', 'advanced_chemistry', 'advanced_biology', 'advanced_ai', 'advanced_earth'];
  const ACTIONS = [{ id: 'fieldresearch', name: '개별 현장탐사', icon: 'flask', description: '학교 탐사 외에 스스로 관찰하고 기록하는 현장탐사를 수행해요. 1학년부터 한 번 이수할 수 있어요.', effectsText: '현장탐사 +1학점 · 연구 역량 ↑ · 피로도 ↑' }];
  // v0.13 교내 대회: 지원자 상위 20%가 수상(금·은·동). 대부분 한 학년만, 발명품 대회는 전학년.
  const CONTESTS = [
    { id: 'writing', mean: 57, name: '교내 글쓰기 대회', turn: 1, weights: { creativity: 0.45, intelligence: 0.25, discipline: 0.2, social: 0.1 }, pitch: '주제를 받고 한 편의 글을 완성하는 대회다.' },
    { id: 'math', mean: 53, name: '교내 수학 경시대회', turn: 2, weights: { intelligence: 0.6, research: 0.2, discipline: 0.2 }, pitch: '서술형 증명 문제가 나오는 수학 경시대회다.' },
    { id: 'physics', mean: 50, name: '교내 물리 경시대회', turn: 5, weights: { intelligence: 0.55, research: 0.25, creativity: 0.2 }, pitch: '역학과 전자기를 넘나드는 물리 경시대회다.' },
    { id: 'invention1', mean: 55, name: '교내 발명품 대회', turn: 5, open: true, weights: { creativity: 0.5, research: 0.3, intelligence: 0.2 }, pitch: '전학년이 참가하는 발명품 대회다. 아이디어와 시제품을 함께 낸다.' },
    { id: 'chemistry', mean: 55, name: '교내 화학 경시대회', turn: 8, weights: { intelligence: 0.55, research: 0.25, discipline: 0.2 }, pitch: '반응과 평형, 실험 해석 문제가 나오는 화학 경시대회다.' },
    { id: 'clubfair', mean: 58, name: '동아리 발표대회', turn: 13, weights: { research: 0.35, social: 0.25, leadership: 0.2, creativity: 0.2 }, pitch: '학술동아리가 한 학기 동안 탐구한 내용을 발표한다.' },
    { id: 'biology', mean: 58, name: '교내 생명과학 경시대회', turn: 12, weights: { intelligence: 0.5, research: 0.3, discipline: 0.2 }, pitch: '생명과학 개념과 실험 설계를 묻는 경시대회다.' },
    { id: 'english', mean: 73, name: '영어 말하기 대회', turn: 15, weights: { social: 0.35, intelligence: 0.3, resilience: 0.2, creativity: 0.15 }, pitch: '자기 주제로 영어 스피치를 하고 질의응답을 받는다.' },
    { id: 'earth', mean: 59, name: '교내 지구과학 경시대회', turn: 16, weights: { intelligence: 0.5, research: 0.3, creativity: 0.2 }, pitch: '지구·천문 자료를 해석하는 경시대회다.' },
    { id: 'informatics', mean: 66, name: '교내 정보과학 경시대회', turn: 18, weights: { intelligence: 0.5, creativity: 0.3, research: 0.2 }, pitch: '알고리즘 문제를 제한 시간 안에 풀어 제출한다.' },
    { id: 'invention2', mean: 61, name: '교내 발명품 대회', turn: 19, open: true, weights: { creativity: 0.5, research: 0.3, intelligence: 0.2 }, pitch: '전학년이 참가하는 발명품 대회다. 작년보다 경쟁작이 많아 보인다.' },
    { id: 'rne', mean: 69, name: 'R&E 발표 시상', turn: 26, weights: { research: 0.6, intelligence: 0.2, discipline: 0.2 }, pitch: '1년 동안 진행한 R&E 결과를 발표하고 심사를 받는다.' },
    { id: 'invention3', mean: 72, name: '교내 발명품 대회', turn: 30, open: true, weights: { creativity: 0.5, research: 0.3, intelligence: 0.2 }, pitch: '전학년이 참가하는 발명품 대회다. 마지막 출품 기회다.' }
  ];
  const CONTEST_PREP = { hard: { bonus: 6, effects: { fatigue: 8, stress: 5 } }, light: { bonus: 2, effects: { fatigue: 3, stress: 2 } } };
  function hash01(seed, text) {
    let h = (Number(seed) >>> 0) ^ 2166136261;
    for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function rankCandidates(rows) {
    return rows.map(x => ({ ...x })).sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id), 'en')).map((x, i) => ({ ...x, rank: i + 1 }));
  }
  function createAPI(hooks) {
    const { rng, shift, note, clamp, round, addLearning, assertAlive } = hooks;
    const currentYear = s => Math.floor(Math.min(s.turn, 41) / 14) + 1;
    const live = s => { if (assertAlive) assertAlive(s); else if (s.alive === false) throw new Error('이야기가 끝난 뒤에는 활동을 진행할 수 없어요.'); };
    const num = (s, key, fallback = 50) => Number.isFinite(s.stats && s.stats[key]) ? s.stats[key] : fallback;
    function makeCohort(s) {
      const out = [{ id: 'player', name: s.name, classId: 1, stats: {}, electives: [], dormExpelled: false }];
      for (let n = 2; n <= COHORT_SIZE; n++) {
        const id = `npc_${String(n).padStart(3, '0')}`, stats = {};
        for (const key of ['intelligence', 'social', 'discipline', 'leadership', 'research', 'resilience', 'dormHarmony']) stats[key] = Math.round(40 + hash01(s.seed, `${id}:${key}`) * 50);
        const choices = ELECTIVES.map(id2 => ({ id: id2, order: hash01(s.seed, `${id}:elective:${id2}`) })).sort((a, b) => a.order - b.order).slice(0, 2).map(x => x.id);
        out.push({ id, name: `가상 학생 ${String(n).padStart(2, '0')}`, classId: Math.floor((n - 1) / CLASS_SIZE) + 1, stats, electives: choices, dormExpelled: hash01(s.seed, `${id}:dorm`) < 0.025 });
      }
      return out;
    }
    const NATURE_SLOTS = [11, 25];
    function tripsFor(s) {
      const order = s.school && s.school.tripOrder === 'byeonsan' ? ['byeonsan', 'jeju'] : ['jeju', 'byeonsan'];
      return TRIPS.map(t => { const i = order.indexOf(t.id); return i < 0 ? { ...t } : { ...t, turn: NATURE_SLOTS[i] }; });
    }
    function init(s) {
      if (!s.school) s.school = { version: 1, cohortSize: COHORT_SIZE, classSize: CLASS_SIZE, classId: 1, cohort: makeCohort(s), scheduledKeys: [], awardedTerms: [], officerHistory: [], currentRole: null, termResults: [], fieldCredits: [], journeys: {}, nationalTeam: [] };
      const q = s.school;
      q.cohortSize = COHORT_SIZE; q.classSize = CLASS_SIZE; q.classId = 1;
      if (!Array.isArray(q.cohort) || q.cohort.length !== COHORT_SIZE) q.cohort = makeCohort(s);
      for (const key of ['scheduledKeys', 'awardedTerms', 'officerHistory', 'termResults', 'fieldCredits', 'nationalTeam', 'contests']) if (!Array.isArray(q[key])) q[key] = [];
      if (!q.journeys || typeof q.journeys !== 'object') q.journeys = {};
      // v0.13.2 자연탐사는 격년: 1학년 제주도 → 2학년 변산, 또는 1학년 변산 → 2학년 제주도. 3학년은 없음.
      // 이미 진행 중인 저장은 예전 순서(제주도 먼저)를 유지합니다.
      if (!['jeju', 'byeonsan'].includes(q.tripOrder)) q.tripOrder = (s.turn > 0 || q.fieldCredits.length) ? 'jeju' : (hash01(s.seed, 'trip-order') < 0.5 ? 'jeju' : 'byeonsan');
      if (!Array.isArray(s.awards)) s.awards = [];
      if (!Array.isArray(s.badges)) s.badges = [];
      if (!s.classRole) s.classRole = q.currentRole || '일반 학생';
      return s;
    }
    function migrate(s) { init(s); return s; }
    function classElection(s, term) {
      return { id: 'school_class_election', schoolTerm: term, title: `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 학급 임원 선출`, description: '반장·부반장·대의원을 각각 한 명씩 새로 뽑는다. 한 자리만 지원할 수 있고, 같은 반의 다른 학생들과 소통·리더십·책임감을 바탕으로 경쟁한다. 당선된 역할은 이번 학기 모범상 선정에도 도움이 된다.', choices: [...ROLE_NAMES.map(role => ({ label: `${role}에 지원한다`, description: role === '반장' ? '반의 의견을 모으고 학급 활동을 조율한다.' : role === '부반장' ? '반장을 도우며 친구들의 불편을 살핀다.' : '학급의 의견을 학교에 전달한다.', schoolElection: true, schoolRole: role })), { label: '이번에는 친구들을 응원한다', description: '학급의 한 구성원으로 함께한다.', schoolElection: true, schoolRole: null }] };
    }
    function electionScore(s, member, role, term) {
      const st = member.id === 'player' ? s.stats : member.stats;
      return round((st.social || 0) * 0.42 + (st.leadership || 0) * 0.38 + (st.discipline || 0) * 0.2 + (hash01(s.seed, `election:${term}:${member.id}:${role}`) - 0.5) * 20);
    }
    function resolveElection(s, event, choice) {
      const q = s.school, term = event.schoolTerm;
      if (!Number.isInteger(term) || term < 0 || term > 5) throw new Error('학급 임원 선출 시점을 확인할 수 없어요.');
      if (q.officerHistory.some(x => x.term === term)) return { handled: true, messages: ['이미 이번 학기 학급 임원 선출을 마쳤다.'], events: [] };
      const candidate = choice.schoolRole;
      if (candidate !== null && !ROLE_NAMES.includes(candidate)) throw new Error('지원할 학급 직책을 확인해 주세요.');
      const classes = [];
      for (let classId = 1; classId <= CLASS_COUNT; classId++) {
        const used = new Set(), roles = [];
        for (const role of ROLE_NAMES) {
          const eligible = q.cohort.filter(m => m.classId === classId && !used.has(m.id) && (m.id !== 'player' || candidate === role));
          const ranking = rankCandidates(eligible.map(m => ({ id: m.id, name: m.id === 'player' ? s.name : m.name, score: electionScore(s, m, role, term) })));
          const win = ranking[0]; used.add(win.id); roles.push({ role, ...win });
        }
        classes.push({ classId, roles });
      }
      const roles = classes[0].roles, playerRole = roles.find(r => r.id === 'player')?.role || null;
      q.currentRole = playerRole; s.classRole = playerRole || '일반 학생';
      q.officerHistory.push({ term, year: Math.floor(term / 2) + 1, semester: term % 2 + 1, classId: 1, candidateRole: candidate, playerRole, roles, classes });
      if (playerRole) shift(s, { leadership: 3, social: 1 });
      const message = playerRole ? `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 ${playerRole}으로 선출됐다. 이번 학기 모범상 평가에서 학급 활동 가산점을 받는다.` : candidate ? `${candidate}에는 다른 친구가 선출됐다. 반장·부반장·대의원의 이름은 학급 기록에 남았다.` : '친구들의 학급 임원 선출을 응원했다. 새 반장·부반장·대의원과 한 학기를 시작한다.';
      return { handled: true, messages: [message], events: [] };
    }
    function getClassRoleBonus(s, kind = 'model', term) {
      const q = s.school;
      const role = Number.isInteger(term) ? q?.officerHistory?.find(x => x.term === term)?.playerRole : q?.currentRole || (ROLE_NAMES.includes(s.classRole) ? s.classRole : null);
      const bonus = { '반장': 8, '부반장': 6, '대의원': 5 }[role] || 0;
      return kind === 'dorm' || kind === 'dormModel' ? bonus / 2 : bonus;
    }
    function subjectScore(s, member, subject, term) {
      if (member.id === 'player') return round(subject.score);
      return round(clamp(33 + member.stats.intelligence * 0.34 + member.stats.discipline * 0.28 + hash01(s.seed, `course:${term}:${subject.id}:${member.id}`) * 20, 0, 100));
    }
    function getEnrollment(s, subject, term) {
      const cohort = s.school?.cohort || init(s).school.cohort;
      // Synthetic course rosters belong to this cohort, course, and semester.
      // They use the fixed seed, so other random events and save reloads cannot reroll them.
      const ranges = { specialist: [12, 40], liberal: [10, 30], design: [6, 18] };
      const range = ranges[subject.category];
      if (range) {
        const key = `enrollment:${term}:${subject.id}`;
        const size = range[0] + Math.floor(hash01(s.seed, `${key}:size`) * (range[1] - range[0] + 1));
        const classmates = cohort.filter(m => m.id !== 'player').map(m => ({ id: m.id, order: hash01(s.seed, `${key}:${m.id}`) }))
          .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'en'));
        const enrolled = new Set(classmates.slice(0, size - 1).map(m => m.id));
        return cohort.filter(m => m.id === 'player' || enrolled.has(m.id));
      }
      // Preserve old saves' elective choices; common required courses use the full cohort.
      return cohort.filter(m => m.id === 'player' || !ELECTIVES.includes(subject.id) || m.electives.includes(subject.id));
    }
    function dormExcluded(s, member) { return member.id === 'player' ? s.dorm?.status === 'expelled' || s.dormExpelled === true || (Array.isArray(s.dorm?.history) && s.dorm.history.some(h => !h.legacy && Number(h.turn) > (Number(s.turn) || 0) - 9)) : !!member.dormExpelled; }
    function modelScore(s, member, term, dorm) {
      const isPlayer = member.id === 'player', st = isPlayer ? s.stats : member.stats;
      const harmony = isPlayer ? (Number.isFinite(s.dormHarmony) ? s.dormHarmony : 65) : st.dormHarmony;
      const role = s.school.officerHistory.find(x => x.term === term)?.classes?.find(c => c.classId === member.classId)?.roles?.find(r => r.id === member.id)?.role;
      const roleBase = { '반장': 8, '부반장': 6, '대의원': 5 }[role] || 0;
      const bonus = isPlayer ? getClassRoleBonus(s, dorm ? 'dorm' : 'model', term) : dorm ? roleBase / 2 : roleBase;
      const score = dorm ? st.discipline * 0.5 + harmony * 0.35 + st.social * 0.15 + bonus : st.discipline * 0.5 + st.social * 0.22 + st.leadership * 0.18 + (st.research || 0) * 0.1 + bonus;
      return round(score + (hash01(s.seed, `model:${term}:${dorm}:${member.id}`) - 0.5) * 7);
    }
    function award(s, value) {
      if (s.awards.some(a => a.id === value.id)) return;
      s.awards.push(value); s.badges.push(value.name); note(s, `${value.name} 수상.`, 'award');
    }
    function onSemesterEnd(s, g) {
      init(s);
      const term = (g.year - 1) * 2 + g.semester - 1, q = s.school;
      if (!Number.isInteger(term) || term < 0 || term > 5 || !Array.isArray(g.subjects)) throw new Error('학기 성적을 확인할 수 없어요.');
      if (q.awardedTerms.includes(term)) return [];
      const subjects = [];
      for (const subject of g.subjects) {
        const eligible = getEnrollment(s, subject, term);
        // 수강 인원의 5%를 소수 첫째 자리에서 올림한 수만큼 수상합니다(부동소수 오차 방지).
        const artQuota = Math.ceil(Math.round(eligible.length * 5) / 100 - 1e-9);
        // 음악·미술·체육은 수행평가만으로 매겨 모두 만점에 가까우므로, 교과우수상은 능력치에 따라 확률로 정합니다.
        if (subject.kind === 'art') {
          const stat = /체육|운동|스포츠/.test(subject.name || '') ? s.stats.athletics : s.stats.creativity;
          const chance = Math.min(0.5, (artQuota / Math.max(1, eligible.length)) * (0.3 + 1.7 * Math.pow(Math.max(0, Math.min(100, stat)) / 100, 2)));
          let h = 2166136261; for (const c of `${s.seed}|art|${term}|${subject.id}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
          const awarded = ((h >>> 0) / 4294967296) < chance;
          subjects.push({ id: subject.id, name: subject.name, ...(subject.category === undefined ? {} : { category: subject.category }), score: subject.score, rank: null, enrollment: eligible.length, quota: artQuota, awarded, recipients: [], lottery: true, chance: Math.round(chance * 1000) / 10 });
          if (awarded) award(s, { id: `subject:${term}:${subject.id}`, kind: 'subject', name: `${g.year}학년 ${g.semester}학기 ${subject.name} 교과우수상`, year: g.year, semester: g.semester, term, turn: s.turn, subjectId: subject.id, rank: null, quota: artQuota });
          continue;
        }
        const ranked = rankCandidates(eligible.map(m => ({ id: m.id, name: m.id === 'player' ? s.name : m.name, score: subjectScore(s, m, subject, term) })));
        const quota = artQuota, recipients = ranked.slice(0, quota), player = ranked.find(m => m.id === 'player');
        const awarded = recipients.some(m => m.id === 'player');
        subjects.push({ id: subject.id, name: subject.name, ...(subject.category === undefined ? {} : { category: subject.category }), score: subject.score, rank: player.rank, enrollment: eligible.length, quota, awarded, recipients });
        if (awarded) award(s, { id: `subject:${term}:${subject.id}`, kind: 'subject', name: `${g.year}학년 ${g.semester}학기 ${subject.name} 교과우수상`, year: g.year, semester: g.semester, term, turn: s.turn, subjectId: subject.id, rank: player.rank, enrollment: eligible.length, quota });
      }
      const classes = [];
      let playerModelRank = null, playerDormRank = null, modelAward = false, dormAward = false;
      for (let classId = 1; classId <= CLASS_COUNT; classId++) {
        const members = q.cohort.filter(m => m.classId === classId);
        const modelRanks = rankCandidates(members.map(m => ({ id: m.id, name: m.id === 'player' ? s.name : m.name, score: modelScore(s, m, term, false) })));
        const dormRanks = rankCandidates(members.filter(m => !dormExcluded(s, m)).map(m => ({ id: m.id, name: m.id === 'player' ? s.name : m.name, score: modelScore(s, m, term, true) })));
        const modelRecipients = modelRanks.slice(0, 3), dormRecipients = dormRanks.slice(0, 3);
        classes.push({ classId, model: { quota: 3, eligible: members.length, recipients: modelRecipients }, dormModel: { quota: 3, eligible: dormRanks.length, recipients: dormRecipients } });
        if (classId === 1) {
          playerModelRank = modelRanks.find(m => m.id === 'player')?.rank || null;
          playerDormRank = dormRanks.find(m => m.id === 'player')?.rank || null;
          modelAward = modelRecipients.some(m => m.id === 'player'); dormAward = dormRecipients.some(m => m.id === 'player');
        }
      }
      if (modelAward) award(s, { id: `model:${term}`, kind: 'model', name: `${g.year}학년 ${g.semester}학기 모범학생상`, year: g.year, semester: g.semester, term, turn: s.turn, classId: 1, rank: playerModelRank, quota: 3 });
      if (dormAward) award(s, { id: `dormModel:${term}`, kind: 'dormModel', name: `${g.year}학년 ${g.semester}학기 기숙사 모범학생상`, year: g.year, semester: g.semester, term, turn: s.turn, classId: 1, rank: playerDormRank, quota: 3 });
      const playerRole = q.officerHistory.find(x => x.term === term)?.playerRole || null;
      q.termResults.push({ term, year: g.year, semester: g.semester, subjects, classes, player: { modelRank: playerModelRank, dormRank: playerDormRank, modelAward, dormAward, classRole: playerRole, classRoleBonus: getClassRoleBonus(s, 'model', term) } });
      q.awardedTerms.push(term);
      note(s, `${g.year}학년 ${g.semester}학기 수상 선정 완료: 과목별 수강생 상위 5% 올림, 반별 모범학생 3명·기숙사 모범학생 3명. 실제 수상자는 성적표에서 확인할 수 있다.`, 'award');
      return [];
    }
    function tripEvent(trip) {
      return { id: `school_trip_${trip.id}`, schoolTripId: trip.id, title: `${trip.name} 출발 안내`, description: `${trip.name}의 관찰·탐구·기록 활동을 모두 마치면 현장탐사 ${trip.credits}학점을 이수한다. 학교 탐사 총 5학점의 일부다. 여행별 1·3·1학점 배분은 게임용 설정이다.`, choices: [{ label: '탐사에 참가한다', description: '현장에서 관찰하고 친구들과 탐구 기록을 만든다.', schoolTripStart: trip.id }, { label: '이번 탐사에는 참가하지 않는다', description: '이번에는 학점을 받지 않는다. 졸업 전 보충 이수로 채울 수 있다.', schoolTripSkip: trip.id }] };
    }
    function journeyCatalog(id) {
      let catalog = root.GSAJourneyEvents;
      if (!catalog && typeof require === 'function') { try { catalog = require('./journey-events.js'); } catch (_) { catalog = null; } }
      const item = catalog && catalog[id];
      if (Array.isArray(item) && item.length) return item;
      if (item && Array.isArray(item.stages) && item.stages.length) return item.stages;
      return [{ id: `journey_${id}_record`, journey: id, step: 0, title: '관찰 내용을 기록할 시간', description: '현장에서 얻은 자료와 의문을 정리하고 친구들과 탐구 기록을 완성한다.', choices: [{ label: '관찰과 해석을 구분해 보고서를 완성한다', description: '연구 역량 +2 · 자기관리 +1', effects: { research: 2, discipline: 1 } }] }];
    }
    function journeyStage(id, step) {
      const stage = journeyCatalog(id)[step];
      return stage ? { ...stage, journey: id, step, schoolJourney: true, choices: stage.choices.map(c => ({ ...c })) } : null;
    }
    function grantCredit(s, record) {
      if (s.school.fieldCredits.some(r => r.id === record.id)) return null;
      const entry = { ...record, turn: s.turn, makeup: !!record.makeup };
      s.school.fieldCredits.push(entry);
      return entry;
    }
    function getFieldStatus(s) {
      const q = s.school, records = Array.isArray(q?.fieldCredits) ? q.fieldCredits : [];
      const schoolCredits = records.filter(r => r.type === 'school').reduce((n, r) => n + r.credits, 0);
      const independentCredits = records.filter(r => r.type === 'independent').reduce((n, r) => n + r.credits, 0);
      const missingTrips = tripsFor(s).filter(t => t.turn <= s.turn && !records.some(r => r.id === t.id) && q?.journeys?.[t.id]?.status !== 'active').map(t => ({ ...t }));
      const canIndependent = s.alive !== false && !records.some(r => r.id === 'independent');
      return { total: schoolCredits + independentCredits, required: 6, schoolCredits, independentCredits, records: records.map(r => ({ ...r })), canIndependent, missingTrips, canMakeup: s.alive !== false && s.turn >= 42 && (missingTrips.length > 0 || canIndependent) };
    }
    function validateAction(s, id) {
      if (id !== 'fieldresearch') return;
      live(s);
      if (!getFieldStatus(s).canIndependent) throw new Error('개별 현장탐사 1학점은 이미 이수했어요. 중복 학점을 받을 수 없어요.');
    }
    function performAction(s, id) {
      if (id !== 'fieldresearch') return { handled: false, messages: [] };
      validateAction(s, id); init(s);
      grantCredit(s, { id: 'independent', name: '개별 현장탐사', credits: 1, type: 'independent' });
      shift(s, { research: 3, discipline: 1, fatigue: 5, stress: 1 });
      return { handled: true, messages: ['스스로 정한 현장을 관찰하고 탐사 기록을 완성해 개별 현장탐사 1학점을 이수했다.'], events: [] };
    }
    function makeupFieldTrip(s) {
      live(s); init(s);
      if (s.turn < 42) throw new Error('보충 현장탐사는 정규 학교생활을 마친 뒤 진행할 수 있어요. 지금은 개별 현장탐사 활동이나 학교 탐사에 참여해 주세요.');
      const status = getFieldStatus(s);
      if (!status.canMakeup) throw new Error('현장탐사 학점은 이미 모두 이수했어요.');
      const trip = status.missingTrips[0];
      const record = grantCredit(s, trip ? { id: trip.id, name: `${trip.name} 보충 이수`, credits: trip.credits, type: 'school', makeup: true } : { id: 'independent', name: '개별 현장탐사 보충 이수', credits: 1, type: 'independent', makeup: true });
      if (trip) s.school.journeys[trip.id] = { status: 'completed', makeup: true };
      shift(s, { research: 2, discipline: 1, fatigue: 5, stress: 1 });
      return { handled: true, record, messages: [`관찰 과제와 탐사 기록을 제출해 ${record.name} ${record.credits}학점을 이수했다. 현장탐사 누적 ${getFieldStatus(s).total} / 6학점.`], events: [] };
    }
    function nationalTeamEvents(s, record) {
      init(s);
      if (!record || (record.won !== true && record.kind !== 'olympiad') || s.school.nationalTeam.some(r => r.selected)) return [];
      const key = `olympiad:${record.turn ?? s.turn}:${record.year ?? currentYear(s)}`;
      if (s.school.nationalTeam.some(r => r.key === key)) return [];
      s.school.nationalTeam.push({ key, turn: s.turn, year: currentYear(s), stage: 'invited', selected: false, campChoice: null, chance: null });
      return [{ id: 'school_national_camp', nationalKey: key, title: '올림피아드 수상 이후, 국가대표 선발 캠프', description: '올림피아드 수상으로 심화 캠프에 도전할 기회가 생겼다. 수상만으로 국가대표가 되는 것은 아니다. 캠프에서 준비한 뒤 별도의 선발 평가를 통과해야 한다.', choices: [{ label: '새로운 문제를 풀며 심화 이론을 정리한다', description: '지능 +2 · 연구 역량 +3 · 피로도 +6', nationalCamp: 'theory', campBonus: 0.07, effects: { intelligence: 2, research: 3, fatigue: 6 } }, { label: '풀이 과정을 설명하고 시간 안에 정리하는 연습을 한다', description: '자기관리 +3 · 연구 역량 +2 · 피로도 +5', nationalCamp: 'practice', campBonus: 0.07, effects: { discipline: 3, research: 2, fatigue: 5 } }, { label: '이번에는 학교생활에 집중한다', description: '국가대표 선발에는 참가하지 않는다.', nationalCamp: 'skip' }] }];
    }
    function selectionChance(s, record) { return clamp(0.015 + num(s, 'intelligence') * 0.0037 + num(s, 'research', 0) * 0.0028 + num(s, 'discipline') * 0.0018 + num(s, 'luck') * 0.0005 + (record.campBonus || 0), 0.04, 0.94); }
    function applyChoiceEffects(s, c) {
      if (c.effects) shift(s, c.effects);
      if (c.bond) s.relationships = clamp((s.relationships || 0) + c.bond);
      if (c.harmony) s.dormHarmony = round(clamp((s.dormHarmony || 0) + c.harmony));
      if (c.learning) addLearning(s, c.learning);
      if (c.badge) s.badges.push(c.badge);
      if (c.project) s.researchProject = c.project;
    }
    function resolve(s, event, choice) {
      const mine = choice.contestPrep || choice.schoolElection || choice.schoolTripStart || choice.schoolTripSkip || event.schoolJourney || choice.nationalCamp || choice.nationalSelection;
      if (!mine) return { handled: false, messages: [], events: [] };
      live(s); init(s);
      if (choice.contestPrep) return resolveContest(s, event, choice);
      if (choice.schoolElection) return resolveElection(s, event, choice);
      if (choice.schoolTripStart || choice.schoolTripSkip) {
        const id = choice.schoolTripStart || choice.schoolTripSkip, trip = tripsFor(s).find(t => t.id === id);
        if (!trip || s.school.fieldCredits.some(r => r.id === id)) throw new Error('이미 이수했거나 존재하지 않는 현장탐사예요.');
        if (choice.schoolTripSkip) { s.school.journeys[id] = { status: 'skipped', turn: s.turn }; return { handled: true, messages: [`${trip.name}에는 참가하지 않았다. 학점은 지급되지 않으며 나중에 보충 이수할 수 있다.`], events: [] }; }
        s.school.journeys[id] = { status: 'active', startedAt: s.turn, step: 0 };
        return { handled: true, messages: [`${trip.name}에 참가했다. 모든 탐구와 기록 활동을 마친 뒤 학점을 인정받는다.`], events: [journeyStage(id, 0)] };
      }
      if (event.schoolJourney) {
        const id = event.journey, progress = s.school.journeys[id], trip = tripsFor(s).find(t => t.id === id);
        if (!trip || !progress || progress.status !== 'active' || progress.step !== event.step) throw new Error('현장탐사의 진행 단계를 확인해 주세요.');
        applyChoiceEffects(s, choice); progress.step++;
        // v0.14 복잡도 개선: 현장탐사는 첫 장면만 직접 고르고, 나머지 장면은 이야기로 이어집니다.
        const told = [`${event.title}: ${choice.label}.`];
        let next = journeyStage(id, progress.step);
        while (next) {
          const pick = next.choices[Math.floor(rng(s) * next.choices.length)];
          applyChoiceEffects(s, pick); told.push(`${next.title}: ${pick.label}.`); progress.step++;
          next = journeyStage(id, progress.step);
        }
        progress.status = 'completed'; progress.completedAt = s.turn;
        grantCredit(s, { id, name: trip.name, credits: trip.credits, type: 'school' });
        return { handled: true, messages: [...told, `${trip.name}의 관찰과 기록을 모두 마쳐 현장탐사 ${trip.credits}학점을 이수했다. 누적 ${getFieldStatus(s).total} / 6학점.`], events: [] };
      }
      const record = s.school.nationalTeam.find(r => r.key === event.nationalKey);
      if (!record) throw new Error('국가대표 선발 기록을 확인할 수 없어요.');
      if (choice.nationalCamp) {
        if (record.stage !== 'invited') throw new Error('이미 캠프 참여를 결정했어요.');
        record.campChoice = choice.nationalCamp;
        if (choice.nationalCamp === 'skip') { record.stage = 'declined'; return { handled: true, messages: ['국가대표 캠프 대신 학교에서 탐구를 이어가기로 했다.'], events: [] }; }
        applyChoiceEffects(s, choice); record.campBonus = choice.campBonus || 0; record.stage = 'trained';
        return { handled: true, messages: ['국가대표 선발 캠프에서 새로운 문제를 풀고 풀이를 정리했다. 이제 최종 선발 평가가 남았다.'], events: [{ id: 'school_national_selection', nationalKey: record.key, title: '국가대표 최종 선발 평가', description: '올림피아드 수상 이후 캠프에서 준비한 내용을 바탕으로 최종 평가에 도전한다. 지능·연구 역량·자기관리·행운과 캠프 준비를 함께 반영한다.', choices: [{ label: '최종 선발 평가에 도전한다', description: '평가 결과에 따라 국가대표가 선발된다.', nationalSelection: 'attempt' }, { label: '이번 선발은 마무리하고 학교로 돌아간다', description: '캠프 경험은 남지만 국가대표 수상 기록은 받지 않는다.', nationalSelection: 'withdraw' }] }] };
      }
      if (choice.nationalSelection) {
        if (record.stage !== 'trained') throw new Error('캠프 준비 이후 한 번만 최종 선발에 도전할 수 있어요.');
        if (choice.nationalSelection === 'withdraw') { record.stage = 'withdrawn'; return { handled: true, messages: ['최종 선발을 마무리하고 학교 연구로 돌아왔다.'], events: [] }; }
        record.chance = selectionChance(s, record); record.selected = rng(s) < record.chance; record.stage = record.selected ? 'selected' : 'not_selected';
        shift(s, { research: 2, fatigue: 7, stress: 3 });
        if (record.selected) { award(s, { id: `nationalTeam:${record.key}`, kind: 'nationalTeam', name: '과학 올림피아드 국가대표 선발', year: currentYear(s), turn: s.turn }); return { handled: true, messages: ['최종 선발 평가를 통과해 과학 올림피아드 국가대표로 선발됐다! 국가대표 선발 기록이 활동 이력에 추가되었다.'], events: [] }; }
        return { handled: true, messages: ['국가대표 최종 선발에는 이르지 못했다. 캠프에서 익힌 사고법과 연구 경험은 남았다.'], events: [] };
      }
      return { handled: false, messages: [], events: [] };
    }
    function contestScore(s, c) {
      let v = 0;
      for (const [k, w] of Object.entries(c.weights)) v += num(s, k) * w;
      if (c.id === 'english' && s.toeic && s.toeic.best) v += Math.max(0, Math.min(6, (s.toeic.best - 650) / 40));
      return v;
    }
    const CLUB_FIELD = { integral: 'math', axiom: 'math', qm: 'physics', scv: 'physics', psi: 'physics', chemtech: 'chemistry', kelvin: 'chemistry', soma: 'biology', biochemi: 'biology', terra: 'earth', idea: 'ai', ifex: 'ai', physics: 'physics', math: 'math', chemistry: 'chemistry', biology: 'biology', ai: 'ai', earth: 'earth' };
    const CONTEST_FIELD = { math: 'math', physics: 'physics', chemistry: 'chemistry', biology: 'biology', earth: 'earth', informatics: 'ai' };
    const CONTEST_FOCUS = { writing: ['intelligence', 'social', 'balanced'], english: ['english'], invention1: ['research', 'balanced'], invention2: ['research', 'balanced'], invention3: ['research', 'balanced'] };
    function contestAsks(s, c) {
      if (['clubfair', 'rne', 'invention1'].includes(c.id)) return true;
      return !!CONTEST_FIELD[c.id] && CONTEST_FIELD[c.id] === CLUB_FIELD[s.academicClub];
    }
    function contestAutoEnter(s, c) {
      const plan = s.plan && typeof s.plan === 'object' ? s.plan : { [s.focus || 'balanced']: 10 };
      const want = CONTEST_FOCUS[c.id] || ['intelligence', 'research'];
      return want.some(k => (plan[k] || 0) >= 3);
    }
    function contestEvent(c) {
      const scope = c.open ? '전학년 지원자' : '학년 지원자';
      return { id: `school_contest_${c.id}`, contestId: c.id, title: c.name, description: `${c.pitch} ${scope} 중 상위 20%가 금·은·동상을 받는다. 준비할수록 유리하지만 그만큼 지친다.`, choices: [
        { label: '제대로 준비해서 나간다', description: '수상 가능성 ↑ · 피로도·스트레스 ↑', contestPrep: 'hard' },
        { label: '부담 없이 참가만 한다', description: '수상 가능성 보통 · 피로도 조금 ↑', contestPrep: 'light' },
        { label: '이번 대회는 건너뛴다', description: '이번 주 체력을 아낀다', contestPrep: 'skip' }
      ] };
    }
    function resolveContest(s, event, choice) {
      const c = CONTESTS.find(x => x.id === event.contestId);
      if (!c) throw new Error('대회 정보를 찾을 수 없어요.');
      const q = s.school; if (!Array.isArray(q.contests)) q.contests = [];
      if (q.contests.some(r => r.id === c.id)) throw new Error('이미 참가 여부를 정한 대회예요.');
      if (choice.contestPrep === 'skip') { q.contests.push({ id: c.id, turn: s.turn, entered: false }); return { handled: true, messages: [`${c.name}에는 나가지 않았다.`], events: [] }; }
      const prep = CONTEST_PREP[choice.contestPrep] || CONTEST_PREP.light;
      const applicants = c.open ? 45 + Math.floor(hash01(s.seed, `contest:${c.id}:n`) * 30) : 18 + Math.floor(hash01(s.seed, `contest:${c.id}:n`) * 22);
      const quota = Math.ceil(applicants * 0.2 - 1e-9);
      // 지원자 평균(mean)은 그 시기 보통 학생의 대회 점수에 맞췄습니다. 발명품 대회는 학년이 섞여 폭이 넓습니다.
      const mean = c.mean, sd = c.open ? 10 : 8;
      const mine = contestScore(s, c) + prep.bonus + (rng(s) - 0.5) * 12;
      let ahead = 0;
      for (let i = 1; i < applicants; i++) {
        const u1 = Math.max(1e-6, hash01(s.seed, `contest:${c.id}:${i}:a`)), u2 = hash01(s.seed, `contest:${c.id}:${i}:b`);
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        if (mean + z * sd > mine) ahead++;
      }
      const rank = ahead + 1;
      shift(s, prep.effects);
      const record = { id: c.id, turn: s.turn, entered: true, prep: choice.contestPrep, applicants, quota, rank, mine: Math.round(mine * 10) / 10 };
      q.contests.push(record);
      if (rank > quota) return { handled: true, messages: [`${c.name}에 지원자 ${applicants}명이 참가했다. 이번에는 상위 ${quota}명(20%) 안에 들지 못했다. (${rank}위)`], events: [] };
      const gold = Math.max(1, Math.round(quota * 0.2)), silver = Math.max(gold + 1, Math.round(quota * 0.5));
      const tier = rank <= gold ? '금상' : rank <= silver ? '은상' : '동상';
      record.tier = tier;
      shift(s, { stress: -3, resilience: 1 });
      award(s, { id: `contest:${c.id}`, kind: 'contest', contestId: c.id, tier, name: `${c.name} ${tier}`, year: currentYear(s), turn: s.turn, rank, applicants, quota });
      return { handled: true, messages: [`${c.name} ${tier}! 지원자 ${applicants}명 중 ${rank}위로 수상했다.`], events: [] };
    }
    function scheduleEvents(s) {
      init(s);
      if (s.alive === false || s.turn >= 42) return [];
      const events = [], q = s.school;
      if (s.turn % 7 === 0) {
        const term = s.turn / 7, key = `class:${term}`;
        const prevTerm = q.officerHistory.find(h => h.term === term - 1);
        // v0.14 선택 줄이기: 학급 임원은 학년 초에 뽑고 2학기에는 그대로 이어 갑니다.
        if (term % 2 === 1 && prevTerm && !q.officerHistory.some(h => h.term === term)) { q.scheduledKeys.push(key); q.officerHistory.push({ ...JSON.parse(JSON.stringify(prevTerm)), term, semester: 2, continued: true }); q.currentRole = prevTerm.playerRole; s.classRole = prevTerm.playerRole || '일반 학생'; }
        else if (!q.scheduledKeys.includes(key) && !q.officerHistory.some(h => h.term === term)) { q.currentRole = null; s.classRole = '일반 학생'; q.scheduledKeys.push(key); events.push(classElection(s, term)); }
      }
      for (const trip of tripsFor(s)) if (trip.turn === s.turn && !q.scheduledKeys.includes(`trip:${trip.id}`) && !q.fieldCredits.some(r => r.id === trip.id)) { q.scheduledKeys.push(`trip:${trip.id}`); events.push(tripEvent(trip)); }
      for (const c of CONTESTS) if (c.turn === s.turn && !q.scheduledKeys.includes(`contest:${c.id}`)) {
        q.scheduledKeys.push(`contest:${c.id}`);
        // v0.14 복잡도 개선: 내 학술동아리 분야 대회·동아리 발표·R&E·첫 발명품 대회만 묻고, 나머지는 시간 배분에 따라 자동 참가/불참.
        if (contestAsks(s, c)) { events.push(contestEvent(c)); continue; }
        const enter = contestAutoEnter(s, c);
        const out = resolveContest(s, { contestId: c.id }, { contestPrep: enter ? 'light' : 'skip' });
        for (const m of out.messages) note(s, enter ? `[자동 참가] ${m}` : m, 'school');
      }
      return events;
    }
    function cohortSummary(s) {
      const q = s.school;
      return { cohortSize: COHORT_SIZE, classSize: CLASS_SIZE, classCount: CLASS_COUNT, classId: 1, assumption: '게임용 가상 학생 96명, 16명씩 6개 반. 실제 학교 학생 수가 아닙니다.', officers: q?.officerHistory?.at(-1) || null, latestAwards: q?.termResults?.at(-1) || null };
    }
    return { init, migrate, actions: ACTIONS, validateAction, performAction, scheduleEvents, onSemesterEnd, resolve, getEnrollment, getFieldStatus, makeupFieldTrip, nationalTeamEvents, cohortSummary, getClassRoleBonus, rankCandidates, trips: TRIPS, contests: CONTESTS };
  }
  const API = { createAPI, rankCandidates, trips: TRIPS, contests: CONTESTS, cohortSize: COHORT_SIZE, classSize: CLASS_SIZE };
  root.GSASchoolSystems = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
