(function (root) {
  'use strict';

  const statLabels = { intelligence: '지능', social: '사회성', athletics: '운동', discipline: '자기관리', health: '체력', stress: '스트레스', research: '연구 역량', leadership: '리더십' };
  const academicClubs = [
    { id: 'physics', name: '물리 탐구회', description: '실험과 역학, 세상을 설명하는 질문', field: 'physics' },
    { id: 'math', name: '수학 탐구회', description: '증명과 문제 해결의 즐거움', field: 'math' },
    { id: 'chemistry', name: '화학 탐구회', description: '반응 속에서 발견하는 새로운 가능성', field: 'chemistry' },
    { id: 'biology', name: '생명과학 탐구회', description: '생명의 작은 원리를 탐구하는 시간', field: 'biology' },
    { id: 'ai', name: 'AI·정보 탐구회', description: '코드와 데이터로 만드는 새로운 도구', field: 'ai' }
  ];
  const activityClubs = [
    { id: 'basketball', name: '농구부', description: '코트 위에서 함께 만드는 한 점' },
    { id: 'soccer', name: '축구부', description: '운동장 위에서 이어지는 팀워크' },
    { id: 'music', name: '밴드부', description: '합주와 무대, 함께 맞추는 박자' },
    { id: 'media', name: '방송·영상부', description: '학교의 순간을 기록하는 사람들' },
    { id: 'none', name: '자율 활동', description: '동아리에 가입하지 않고 내 시간을 확보' }
  ];
  const electives = [
    { id: 'advanced_physics', name: '심화 물리학', field: 'physics', credits: 4 },
    { id: 'advanced_math', name: '심화 수학', field: 'math', credits: 4 },
    { id: 'advanced_chemistry', name: '심화 화학', field: 'chemistry', credits: 4 },
    { id: 'advanced_biology', name: '심화 생명과학', field: 'biology', credits: 4 },
    { id: 'advanced_ai', name: '인공지능과 정보', field: 'ai', credits: 4 },
    { id: 'advanced_earth', name: '지구·우주과학', field: 'earth', credits: 4 }
  ];
  const universities = [
    { id: 'seoul', name: '서울대학교', description: '학업과 탐구의 균형을 보는 경로', threshold: 77, researchWeight: 0.18 },
    { id: 'kaist', name: 'KAIST', description: '연구와 문제 해결에 무게를 둔 경로', threshold: 74, researchWeight: 0.27 },
    { id: 'postech', name: 'POSTECH', description: '집중적인 탐구 경험을 보는 경로', threshold: 73, researchWeight: 0.28 },
    { id: 'gist', name: 'GIST', description: '과학 탐구와 성장 가능성을 보는 경로', threshold: 68, researchWeight: 0.25 },
    { id: 'unist', name: 'UNIST', description: '융합 탐구 경험을 보는 경로', threshold: 67, researchWeight: 0.25 },
    { id: 'chonnam', name: '전남대학교', description: '학업과 학교 활동을 함께 보는 경로', threshold: 58, researchWeight: 0.16 }
  ];
  const actions = [
    { id: 'study', name: '교과 공부', icon: 'book', description: '수업 내용을 복습하고 다음 시험을 준비해요.', effectsText: '교과 이해 ↑ · 자기관리 ↑ · 스트레스 ↑' },
    { id: 'research', name: 'R&E 연구', icon: 'flask', description: '실험과 분석으로 나만의 질문을 발전시켜요.', effectsText: '연구 역량 ↑↑ · 교과 이해 ↑ · 체력 ↓' },
    { id: 'academic', name: '학술동아리', icon: 'atom', description: '친구들과 전공 주제를 함께 탐구해요.', effectsText: '전공 이해 ↑↑ · 연구 역량 ↑ · 사회성 ↑' },
    { id: 'club', name: '상설동아리', icon: 'ball', description: '함께 연습하고 활동하며 추억을 쌓아요.', effectsText: '사회성 ↑ · 활동 역량 ↑ · 스트레스 ↓' },
    { id: 'train', name: '운동하기', icon: 'run', description: '운동장에서 몸을 움직이고 기분을 환기해요.', effectsText: '운동 ↑↑ · 체력 ↑ · 스트레스 ↓' },
    { id: 'friends', name: '친구와 시간', icon: 'people', description: '같이 이야기하며 서로의 하루를 나눠요.', effectsText: '사회성 ↑↑ · 유대감 ↑ · 스트레스 ↓' },
    { id: 'council', name: '학생회 활동', icon: 'flag', description: '학급을 돕고 학교 행사와 공약을 준비해요.', effectsText: '리더십 ↑↑ · 사회성 ↑ · 체력 ↓' },
    { id: 'rest', name: '충분히 쉬기', icon: 'moon', description: '잠을 충분히 자고 다음 주의 여유를 만들어요.', effectsText: '체력 ↑↑ · 스트레스 ↓↓' }
  ];
  const core = [
    { id: 'math', name: '수학', field: 'math', credits: 4 },
    { id: 'physics', name: '물리학', field: 'physics', credits: 3 },
    { id: 'chemistry', name: '화학', field: 'chemistry', credits: 3 },
    { id: 'biology', name: '생명과학', field: 'biology', credits: 3 },
    { id: 'english', name: '영어', field: 'language', credits: 2 },
    { id: 'korean', name: '국어', field: 'language', credits: 2 },
    { id: 'ai', name: '정보', field: 'ai', credits: 3 }
  ];
  const clamp = (n, low = 0, high = 100) => Math.max(low, Math.min(high, n));
  const round = n => Math.round(n * 10) / 10;
  function rng(s) { let t = s.rng += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); s.rng >>>= 0; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function seedNumber(value) { if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0; let h = 2166136261; for (const c of String(value)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shift(s, changes) { Object.keys(changes).forEach(k => s.stats[k] = round(clamp(s.stats[k] + changes[k]))); }
  function note(s, message, category = 'life') { s.log.unshift({ turn: s.turn, message, category }); }
  function create(name = '새로운 학생', seed) {
    const cleanName = String(name).trim().slice(0, 16) || '새로운 학생';
    const randomSeed = seed === undefined ? (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 : seedNumber(seed);
    const s = { version: 1, name: cleanName, seed: randomSeed, rng: randomSeed, turn: 0, stats: {}, academicClub: null, activityClub: null, electives: [], grades: [], semesterLearning: {}, midterm: null, pendingEvent: null, councilRole: '일반 학생', captain: false, captainClub: null, relationships: 10, clubWeeks: 0, councilWeeks: 0, researchWeeks: 0, researchProject: '아직 연구 주제를 찾는 중', badges: [], log: [], admissions: null, admissionRolls: {}, enrolledUniversity: null };
    ['intelligence', 'social', 'athletics', 'discipline'].forEach(k => s.stats[k] = 30 + Math.floor(rng(s) * 41));
    Object.assign(s.stats, { health: 75, stress: 15, research: 8, leadership: 10 });
    for (const u of universities) s.admissionRolls[u.id] = rng(s);
    note(s, '광주과학고에서의 첫날. 어떤 3년을 보내게 될까?', 'milestone');
    return s;
  }
  function getPhase(s) {
    const t = Math.min(s.turn, 47), term = Math.floor(t / 8), week = t % 8 + 1;
    return { year: Math.floor(term / 2) + 1, semester: term % 2 + 1, term, week, exam: s.turn >= 48 ? null : week === 4 ? 'midterm' : week === 8 ? 'final' : null, isEnd: s.turn >= 48, needsElectives: s.turn >= 24 && s.turn < 48 && s.electives.length !== 2, label: s.turn >= 48 ? '졸업 · 진학' : `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 · ${week}주차` };
  }
  function getSubjects(s) {
    if (s.turn < 24) return core.map(x => ({ ...x }));
    return [core[0], core[4], core[5], ...s.electives.map(id => electives.find(e => e.id === id)).filter(Boolean), { id: 'research', name: '융합 탐구', field: 'research', credits: 4 }].map(x => ({ ...x }));
  }
  function setClubs(s, academicId, activityId) {
    if (s.turn !== 0 || s.academicClub) throw new Error('동아리는 입학할 때 한 번 선택할 수 있어요.');
    if (!academicClubs.some(c => c.id === academicId) || !activityClubs.some(c => c.id === activityId)) throw new Error('학술동아리와 상설 활동을 각각 골라 주세요.');
    s.academicClub = academicId; s.activityClub = activityId;
    const ac = academicClubs.find(c => c.id === academicId), club = activityClubs.find(c => c.id === activityId);
    note(s, `${ac.name} · ${club.name}와 함께 학교생활을 시작했다.`, 'club');
    return s;
  }
  function chooseElectives(s, ids) {
    if (s.turn < 24 || s.turn >= 48 || s.electives.length) throw new Error('선택과목은 2학년 2학기 시작에 선택해요.');
    if (!Array.isArray(ids) || ids.length !== 2 || new Set(ids).size !== 2 || ids.some(id => !electives.some(e => e.id === id))) throw new Error('서로 다른 선택과목 두 개를 골라 주세요.');
    s.electives = [...ids];
    note(s, `${ids.map(id => electives.find(e => e.id === id).name).join(' · ')}를 선택했다.`, 'milestone');
    return s;
  }
  function eventFor(s) {
    const common = {
      3: { id: 'roommate', title: '불 꺼진 기숙사의 대화', description: '옆자리 친구가 첫 시험이 걱정된다고 말을 걸었다. 내 공부도 아직 남아 있다.', choices: [{ label: '함께 개념을 설명해 본다', description: '사회성 +3 · 유대감 +8 · 교과 이해 +2', effects: { social: 3 }, bond: 8, learning: 2 }, { label: '잠깐 이야기를 듣고 각자 공부한다', description: '자기관리 +3 · 스트레스 −4', effects: { discipline: 3, stress: -4 } }] },
      10: { id: 'festival', title: '축제 준비를 도와줄래?', description: '반 친구들이 축제 부스 기획을 제안했다. 준비할 일은 많지만 함께하는 기억이 될 것 같다.', choices: [{ label: '부스 운영을 맡는다', description: '리더십 +8 · 사회성 +4 · 체력 −5', effects: { leadership: 8, social: 4, health: -5 }, bond: 6 }, { label: '잠깐 도운 뒤 연구실로 간다', description: '연구 역량 +5 · 사회성 +2', effects: { research: 5, social: 2 } }, { label: '이번에는 충분히 쉰다', description: '체력 +10 · 스트레스 −8', effects: { health: 10, stress: -8 } }] },
      17: { id: 'research_topic', title: '나만의 R&E 질문', description: '2학년 연구가 시작됐다. 같은 현상도 어떤 질문을 던지느냐에 따라 다른 연구가 된다.', choices: [{ label: '실험으로 원리를 검증한다', description: '연구 역량 +8 · 지능 +2', effects: { research: 8, intelligence: 2 }, project: '실험으로 검증한 자연의 원리' }, { label: '데이터와 코드로 예측한다', description: '연구 역량 +8 · 자기관리 +2', effects: { research: 8, discipline: 2 }, project: '데이터로 예측하는 세상' }, { label: '생활 속 문제의 해결책을 찾는다', description: '연구 역량 +6 · 사회성 +4', effects: { research: 6, social: 4 }, project: '학교생활을 바꾸는 작은 발명' }] },
      22: { id: 'council_election', title: '학생회 임원 선거', description: '학생회에서 함께할 임원을 뽑는다. 친구들의 신뢰와 그동안의 활동이 도전에 힘이 된다.', choices: [{ label: '공약을 발표하고 출마한다', description: '사회성·리더십·활동 경험에 따라 당선 판정', election: true }, { label: '친구의 선거 운동을 돕는다', description: '사회성 +5 · 리더십 +4 · 유대감 +6', effects: { social: 5, leadership: 4 }, bond: 6 }, { label: '지금의 연구와 공부에 집중한다', description: '자기관리 +4 · 연구 역량 +4', effects: { discipline: 4, research: 4 } }] },
      29: { id: 'club_captain', title: '다음 기장은 누구?', description: '동아리에서 다음 활동을 이끌 사람을 찾는다. 꾸준히 참여하고 팀원과 호흡을 맞췄다면 기회가 있다.', choices: [{ label: '기장에 도전한다', description: '동아리 참여·사회성·리더십에 따라 선출', captain: true }, { label: '친구를 도우며 팀원으로 남는다', description: '사회성 +5 · 유대감 +8 · 스트레스 −4', effects: { social: 5, stress: -4 }, bond: 8 }] },
      35: { id: 'presentation', title: '연구 발표회', description: '실패한 실험까지 한 장의 포스터로 묶었다. 이제 내 연구를 설명할 시간이다.', choices: [{ label: '결과와 한계를 솔직하게 설명한다', description: '연구 역량 +7 · 리더십 +3', effects: { research: 7, leadership: 3 }, badge: '탐구 발표자' }, { label: '친구들과 역할을 나누어 발표한다', description: '연구 역량 +5 · 사회성 +5 · 유대감 +5', effects: { research: 5, social: 5 }, bond: 5, badge: '함께한 연구' }] },
      42: { id: 'interview', title: '진학 면접 연습', description: '“3년 동안 가장 몰입한 경험은 무엇인가요?” 친구와 서로의 이야기를 들어 보기로 했다.', choices: [{ label: '연구의 시행착오를 설명한다', description: '연구 역량 +5 · 자기관리 +3', effects: { research: 5, discipline: 3 } }, { label: '팀을 이끌었던 경험을 정리한다', description: '리더십 +6 · 사회성 +3', effects: { leadership: 6, social: 3 } }, { label: '어려운 개념을 쉽게 설명해 본다', description: '지능 +3 · 교과 이해 +3', effects: { intelligence: 3 }, learning: 3 }] },
      46: { id: 'last_memory', title: '마지막으로 남길 장면', description: '졸업이 가까워졌다. 익숙하던 교실과 운동장도 이제 조금 다르게 보인다.', choices: [{ label: '친구들과 운동장에서 사진을 찍는다', description: '유대감 +12 · 스트레스 −8', effects: { stress: -8 }, bond: 12, badge: '운동장의 마지막 오후' }, { label: '연구 노트를 다음 후배에게 남긴다', description: '연구 역량 +4 · 리더십 +4', effects: { research: 4, leadership: 4 }, badge: '후배에게 남긴 질문' }, { label: '나에게 3년의 편지를 쓴다', description: '자기관리 +4 · 체력 +6 · 스트레스 −8', effects: { discipline: 4, health: 6, stress: -8 }, badge: '나를 알아가는 시간' }] }
    };
    return common[s.turn] || null;
  }
  function addLearning(s, n, field) { for (const sub of getSubjects(s)) if (!field || field === sub.field) s.semesterLearning[sub.id] = round((s.semesterLearning[sub.id] || 0) + n); }
  function letter(score) { if (score >= 95) return ['A+', 4.3]; if (score >= 90) return ['A0', 4]; if (score >= 85) return ['A−', 3.7]; if (score >= 80) return ['B+', 3.3]; if (score >= 75) return ['B0', 3]; if (score >= 70) return ['B−', 2.7]; if (score >= 65) return ['C+', 2.3]; if (score >= 60) return ['C0', 2]; if (score >= 55) return ['C−', 1.7]; if (score >= 50) return ['D+', 1.3]; if (score >= 45) return ['D0', 1]; return ['F', 0]; }
  function examScores(s, bonus, phase) {
    const healthPenalty = Math.max(0, 55 - s.stats.health) * 0.3;
    const stressPenalty = Math.max(0, s.stats.stress - 40) * 0.14;
    return getSubjects(s).map(sub => {
      const knowledge = s.semesterLearning[sub.id] || 0;
      const midtermAdjustment = phase.exam === 'midterm' ? 8 : 0;
      const academicAffinity = sub.field === s.academicClub ? 2 : 0;
      const researchBoost = sub.field === 'research' ? s.stats.research * 0.15 : 0;
      const score = round(clamp(36 + s.stats.intelligence * 0.22 + s.stats.discipline * 0.15 + knowledge * 1.3 + midtermAdjustment + academicAffinity + researchBoost + bonus - healthPenalty - stressPenalty + (rng(s) - 0.5) * 10));
      return { ...sub, score };
    });
  }
  function advance(s, actionId, studyMode = 'normal') {
    const p = getPhase(s);
    if (p.isEnd) throw new Error('3년의 이야기가 끝났어요. 진학 결과를 확인해 주세요.');
    if (s.pendingEvent) throw new Error('먼저 지금의 사건에서 선택해 주세요.');
    if (!s.academicClub) throw new Error('입학할 때 동아리를 먼저 골라 주세요.');
    if (p.needsElectives) throw new Error('2학년 2학기 선택과목 두 개를 먼저 골라 주세요.');
    if (!actions.some(a => a.id === actionId)) throw new Error('진행할 활동을 골라 주세요.');
    if (!['normal', 'dawn', 'night'].includes(studyMode)) throw new Error('자습 방식을 다시 골라 주세요.');
    if (!p.exam && studyMode !== 'normal') throw new Error('추가 자습은 시험 주간에 선택할 수 있어요.');
    const messages = [], action = actions.find(a => a.id === actionId);
    // 수업은 모든 활동에 기본으로 포함된다. 선택은 수업 외 집중 활동이다.
    addLearning(s, 1.35 + s.stats.discipline * 0.004);
    shift(s, { health: -2, stress: 1 });
    switch (actionId) {
      case 'study': addLearning(s, 2.4); shift(s, { intelligence: 0.7, discipline: 1.2, health: -3, stress: 6 }); break;
      case 'research': s.researchWeeks++; addLearning(s, 0.65); shift(s, { research: 5.1, intelligence: 0.5, health: -4, stress: 4 }); break;
      case 'academic': addLearning(s, 0.7); addLearning(s, 4.4, s.academicClub); shift(s, { research: 2.8, social: 1.3, intelligence: 0.4, health: -2, stress: 2 }); s.clubWeeks++; break;
      case 'club': if (s.activityClub !== 'none') s.clubWeeks++; s.relationships = clamp(s.relationships + 3); if (['soccer', 'basketball'].includes(s.activityClub)) shift(s, { athletics: 3.6, social: 3, health: 4, stress: -6 }); else if (s.activityClub === 'none') shift(s, { health: 8, stress: -8, discipline: 1.2 }); else shift(s, { social: 4, leadership: 1.2, health: 1, stress: -6 }); break;
      case 'train': shift(s, { athletics: 5, health: 8, stress: -8 }); break;
      case 'friends': shift(s, { social: 4.4, health: 3, stress: -10 }); s.relationships = clamp(s.relationships + 7); break;
      case 'council': s.councilWeeks++; shift(s, { leadership: 5, social: 2.2, health: -3, stress: 3 }); s.relationships = clamp(s.relationships + 2); break;
      case 'rest': shift(s, { health: 24, stress: -24, discipline: 0.5 }); break;
    }
    let bonus = 0;
    if (p.exam && studyMode === 'dawn') { bonus = 5; shift(s, { health: -8, stress: 5, discipline: 0.5 }); messages.push('새벽자습으로 핵심 개념을 한 번 더 정리했다. 체력이 줄었다.'); }
    if (p.exam && studyMode === 'night') { bonus = 8; shift(s, { health: -15, stress: 10 }); messages.push('심야자습으로 문제를 더 풀었다. 수면 부족이 쌓였다.'); }
    let semesterResult = null;
    if (p.exam) {
      const scores = examScores(s, bonus, p);
      if (p.exam === 'midterm') { s.midterm = scores; messages.push(`중간고사 평균 ${round(scores.reduce((a, x) => a + x.score, 0) / scores.length)}점. 기말까지 다시 준비할 수 있다.`); }
      else {
        const subjects = scores.map(sub => {
          const mid = s.midterm && s.midterm.find(m => m.id === sub.id);
          const score = round((mid ? mid.score : sub.score) * 0.4 + sub.score * 0.6);
          const [grade, point] = letter(score);
          return { ...sub, score, grade, point };
        });
        const credits = subjects.reduce((a, x) => a + x.credits, 0);
        const earnedCredits = subjects.filter(x => x.point > 0).reduce((a, x) => a + x.credits, 0);
        const gpa = Math.round(subjects.reduce((a, x) => a + x.point * x.credits, 0) / credits * 100) / 100;
        semesterResult = { year: p.year, semester: p.semester, gpa, credits, earnedCredits, subjects };
        s.grades.push(semesterResult);
        messages.push(`${p.year}학년 ${p.semester}학기 성적 확정: ${gpa.toFixed(2)} / 4.30.`);
        s.semesterLearning = {}; s.midterm = null;
        shift(s, { health: 12, stress: -14 });
      }
    }
    s.turn++;
    if (s.stats.health < 25) messages.push('체력이 많이 떨어졌다. 휴식 없이 버티면 시험 집중력이 낮아진다.');
    if (s.stats.stress > 75) messages.push('스트레스가 높다. 친구와의 시간이나 휴식이 필요하다.');
    note(s, `${p.label}: ${action.name}${p.exam ? studyMode === 'dawn' ? ' + 새벽자습' : studyMode === 'night' ? ' + 심야자습' : ' + 규칙적인 수면' : ''}.`, 'activity');
    for (const m of messages) note(s, m, p.exam ? 'grade' : 'life');
    s.pendingEvent = eventFor(s);
    if (s.turn === 48) { messages.push('48번의 선택 끝에 3년을 마쳤다. 이제 나의 다음 출발을 고를 시간이다.'); note(s, messages[messages.length - 1], 'milestone'); }
    return { messages, event: s.pendingEvent, semesterResult };
  }
  function chooseEvent(s, index) {
    const e = s.pendingEvent;
    if (!e || !Number.isInteger(index) || !e.choices[index]) throw new Error('지금 가능한 선택지를 골라 주세요.');
    const c = e.choices[index], messages = [];
    if (c.effects) shift(s, c.effects);
    if (c.bond) s.relationships = clamp(s.relationships + c.bond);
    if (c.learning) addLearning(s, c.learning);
    if (c.project) s.researchProject = c.project;
    if (c.badge) s.badges.push(c.badge);
    if (c.election) {
      const chance = clamp(0.12 + s.stats.social * 0.004 + s.stats.leadership * 0.005 + s.councilWeeks * 0.035, 0.12, 0.94);
      if (rng(s) < chance) { s.councilRole = s.stats.leadership >= 45 ? '학생회 임원' : '학생회 부원'; shift(s, { leadership: 8, social: 4, stress: 5 }); s.badges.push('학생회에 남긴 발자국'); messages.push(`선거 결과: ${s.councilRole}이 되었다! 다음 활동에 책임감이 더해진다.`); }
      else { shift(s, { leadership: 4, discipline: 2, stress: 3 }); messages.push('이번 선거에서는 선택받지 못했다. 공약을 준비한 경험은 리더십으로 남았다.'); }
    }
    if (c.captain) {
      const chance = clamp(0.1 + s.clubWeeks * 0.055 + s.stats.social * 0.003 + s.stats.leadership * 0.003, 0.1, 0.95);
      if (rng(s) < chance) { s.captain = true; s.captainClub = s.activityClub === 'none' ? academicClubs.find(c => c.id === s.academicClub).name : activityClubs.find(c => c.id === s.activityClub).name; shift(s, { leadership: 9, social: 3 }); s.badges.push('동아리 기장'); messages.push('동아리 기장으로 선출됐다. 앞으로는 후배들과 함께 성장한다.'); }
      else { shift(s, { social: 3, leadership: 3 }); messages.push('기장은 다른 친구가 맡았다. 팀원으로서의 소중한 역할은 계속된다.'); }
    }
    if (!messages.length) messages.push(`${e.title}: ${c.label}. 이 선택이 나의 3년에 남았다.`);
    for (const m of messages) note(s, m, 'event');
    s.pendingEvent = null;
    return { messages, event: e.id };
  }
  function getProfile(s) {
    const attempted = s.grades.reduce((a, g) => a + g.credits, 0);
    const earned = s.grades.reduce((a, g) => a + (g.earnedCredits === undefined ? g.credits : g.earnedCredits), 0);
    const gpa = attempted ? Math.round(s.grades.reduce((a, g) => a + g.subjects.reduce((b, v) => b + v.point * v.credits, 0), 0) / attempted * 100) / 100 : 0;
    let strength = '나만의 속도로 성장하는 탐색가', ending = '아직 쓰이지 않은 페이지가 많아요.';
    const scores = [ ['research', s.stats.research], ['leadership', s.stats.leadership], ['athletics', s.stats.athletics * 0.83], ['social', (s.stats.social + s.relationships) * 0.48], ['academic', gpa / 4.3 * 100] ].sort((a, b) => b[1] - a[1]);
    if (s.turn > 0) {
      const endings = {
        research: ['끝까지 질문하는 연구자', '실패한 실험과 수정한 코드가 쌓여, 스스로 질문을 만드는 사람이 되었다.'],
        leadership: ['함께 나아가는 리더', '학교를 조금 더 좋은 곳으로 만들려던 선택들이 사람들의 기억에 남았다.'],
        athletics: ['코트와 교실을 누빈 도전자', '운동장에서 배운 끈기와 팀워크를 가지고 새로운 무대로 나아간다.'],
        social: ['친구들의 기억에 남은 사람', '성적표에 모두 적히지 않는, 서로를 믿고 함께한 시간이 남았다.'],
        academic: ['꾸준함으로 길을 연 학자', '차곡차곡 쌓은 공부가 자신만의 가능성을 넓혀 주었다.']
      };
      [strength, ending] = endings[scores[0][0]];
    }
    return { gpa, credits: earned, attemptedCredits: attempted, rankLabel: gpa >= 3.7 ? '우수한 학업 성취' : gpa >= 3 ? '안정적인 학업 성취' : gpa > 0 ? '성장 중인 학업 성취' : '첫 성적을 기다리는 중', strength, ending, relationships: round(s.relationships) };
  }
  function applyUniversities(s, ids) {
    if (s.turn < 48) throw new Error('3년의 학교생활을 마친 뒤 지원할 수 있어요.');
    if (s.admissions) return s.admissions;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length || ids.some(id => !universities.some(u => u.id === id))) throw new Error('지원할 대학을 1~3곳 골라 주세요.');
    const p = getProfile(s), academic = p.gpa / 4.3 * 100;
    const results = ids.map(id => {
      const u = universities.find(x => x.id === id), rw = u.researchWeight;
      const score = academic * (0.78 - rw) + s.stats.research * rw + s.stats.discipline * 0.09 + s.stats.leadership * 0.07 + s.stats.social * 0.06 + (s.captain ? 1 : 0) + (s.councilRole !== '일반 학생' ? 1 : 0);
      const probability = clamp(1 / (1 + Math.exp((u.threshold - score) / 6.5)), 0.03, 0.97);
      return { id, name: u.name, accepted: s.admissionRolls[id] < probability, probability: Math.round(probability * 100), score: round(score), reason: `학업 ${p.gpa.toFixed(2)} · 연구 ${Math.round(s.stats.research)} · 리더십 ${Math.round(s.stats.leadership)}` };
    });
    // This is a fictional fallback ending, not a real institution's admission claim.
    results.push({ id: 'new_path', name: '나에게 맞는 일반대학 진학', accepted: true, probability: null, score: null, reason: '게임에서 항상 열려 있는 새로운 출발 경로' });
    s.admissions = results;
    note(s, '진학 결과를 확인했다. 대학 이름 하나로 3년의 의미가 정해지지는 않는다.', 'milestone');
    return results;
  }
  const API = { create, getPhase, getSubjects, actions, advance, chooseEvent, setClubs, chooseElectives, applyUniversities, getProfile, academicClubs, activityClubs, electives, universities, statLabels };
  root.GSAEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
