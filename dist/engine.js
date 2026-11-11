(function (root) {
  'use strict';

  const statLabels = { intelligence: '지능', social: '사회성', athletics: '운동', discipline: '자기관리', luck: '행운', creativity: '창의성', resilience: '회복력', leadership: '리더십', fatigue: '피로도', health: '체력', stress: '스트레스', research: '연구 역량' };
  const archetypes = [
    { id: 'intellect', name: '탐구형', description: '개념을 빠르게 이해하는 지능과 새로운 질문을 만드는 창의성이 강점이에요.', bonuses: { intelligence: 24, creativity: 13, discipline: 4 } },
    { id: 'social', name: '사교형', description: '사람들과 쉽게 가까워지고 함께하는 활동에서 힘을 발휘해요.', bonuses: { social: 24, leadership: 14, resilience: 3 } },
    { id: 'athlete', name: '운동형', description: '운동부 테스트에 유리한 운동 능력과 훈련 후 회복력이 강점이에요.', bonuses: { athletics: 27, resilience: 13, social: 1 } },
    { id: 'lucky', name: '행운형', description: '테스트와 면접, 진학의 확률 판정에서 좋은 기회를 얻기 쉬워요.', bonuses: { luck: 30, creativity: 7, social: 4 } },
    { id: 'discipline', name: '성실형', description: '꾸준한 준비와 자기관리로 학업과 책임 있는 역할에서 성장해요.', bonuses: { discipline: 24, resilience: 10, intelligence: 7 } },
    { id: 'balanced', name: '균형형', description: '다양한 능력이 고르게 갖춰져 있어 앞으로의 방향을 자유롭게 정할 수 있어요.', bonuses: { intelligence: 5, social: 5, athletics: 5, discipline: 6, luck: 5, creativity: 5, resilience: 5, leadership: 5 } }
  ];
  const sportsClubs = [
    { id: 'basketball', name: '농구부', description: '코트 위에서 함께 만드는 한 점' },
    { id: 'soccer', name: '축구부', description: '운동장 위에서 이어지는 팀워크' }
  ];
  const departments = [
    { id: 'culture', name: '문예부', stat: 'creativity' }, { id: 'sports', name: '체육부', stat: 'athletics' },
    { id: 'statistics', name: '통계부', stat: 'intelligence' }, { id: 'environment', name: '환경부', stat: 'discipline' },
    { id: 'publicity', name: '홍보부', stat: 'social' }, { id: 'administration', name: '총무부', stat: 'discipline' },
    { id: 'policy', name: '정책부', stat: 'leadership' }, { id: 'wellbeing', name: '생체부', stat: 'resilience' },
    { id: 'information', name: '정보부', stat: 'intelligence' }
  ];
  const academicClubs = [
    { id: 'physics', name: '물리 탐구회', description: '실험과 역학, 세상을 설명하는 질문', field: 'physics' },
    { id: 'math', name: '수학 탐구회', description: '증명과 문제 해결의 즐거움', field: 'math' },
    { id: 'chemistry', name: '화학 탐구회', description: '반응 속에서 발견하는 새로운 가능성', field: 'chemistry' },
    { id: 'biology', name: '생명과학 탐구회', description: '생명의 작은 원리를 탐구하는 시간', field: 'biology' },
    { id: 'ai', name: 'AI·정보 탐구회', description: '코드와 데이터로 만드는 새로운 도구', field: 'ai' }
  ];
  const activityClubs = [
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
    { id: 'research', name: 'R&E 연구', icon: 'flask', description: '실험과 분석으로 나만의 질문을 발전시켜요.', effectsText: '연구 역량 ↑↑ · 창의성 ↑ · 피로도 ↑' },
    { id: 'academic', name: '학술동아리', icon: 'atom', description: '친구들과 전공 주제를 함께 탐구해요.', effectsText: '전공 이해 ↑↑ · 연구 역량 ↑ · 사회성 ↑' },
    { id: 'club', name: '상설동아리', icon: 'ball', description: '함께 연습하고 활동하며 추억을 쌓아요.', effectsText: '사회성 ↑ · 활동 역량 ↑ · 스트레스 ↓' },
    { id: 'train', name: '개인 운동', icon: 'run', description: '기초 체력을 기르며 다음 입부 테스트를 준비해요.', effectsText: '운동 ↑↑ · 회복력 ↑ · 피로도 ↑' },
    { id: 'sports', name: '운동부 훈련', icon: 'ball', description: '합격한 운동부에서 팀원들과 함께 훈련해요.', effectsText: '운동 ↑ · 사회성 ↑ · 동아리 경험 ↑ · 피로도 ↑' },
    { id: 'friends', name: '친구와 시간', icon: 'people', description: '같이 이야기하며 서로의 하루를 나눠요.', effectsText: '사회성 ↑↑ · 유대감 ↑ · 스트레스 ↓' },
    { id: 'council', name: '학생회 활동', icon: 'flag', description: '학급을 돕고 학교 행사와 공약을 준비해요.', effectsText: '리더십 ↑↑ · 사회성 ↑ · 피로도 ↑' },
    { id: 'rest', name: '충분히 쉬기', icon: 'moon', description: '잠을 충분히 자고 다음 주의 여유를 만들어요.', effectsText: '피로도 ↓↓ · 회복력 ↑ · 스트레스 ↓↓' }
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
  function shift(s, changes) {
    for (const [key, value] of Object.entries(changes)) {
      const k = key === 'health' ? 'fatigue' : key, delta = key === 'health' ? -value : value;
      s.stats[k] = round(clamp((s.stats[k] || 0) + delta));
    }
    s.stats.health = round(100 - s.stats.fatigue);
  }
  function note(s, message, category = 'life') { s.log.unshift({ turn: s.turn, message, category }); }
  function create(name = '새로운 학생', seed) {
    const randomSeed = seed === undefined ? (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 : seedNumber(seed);
    const s = { version: 2, name: String(name).trim().slice(0, 16) || '새로운 학생', seed: randomSeed, rng: randomSeed, turn: 0, stats: {}, archetype: null, academicClub: null, activityClub: null, sportsClubs: [], sportsTryouts: [], electives: [], grades: [], semesterLearning: {}, midterm: null, pendingEvent: null, councilRole: '일반 학생', councilHistory: [], interview: null, captain: false, captainClub: null, relationships: 10, clubWeeks: 0, councilWeeks: 0, researchWeeks: 0, sportsWeeks: 0, illnessWeeks: 0, illnessCount: 0, researchProject: '아직 연구 주제를 찾는 중', badges: [], log: [], admissions: null, admissionRolls: {}, enrolledUniversity: null };
    const type = archetypes[Math.floor(rng(s) * archetypes.length)]; s.archetype = type.id;
    for (const k of ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership']) s.stats[k] = clamp(32 + Math.floor(rng(s) * 25) + (type.bonuses[k] || 0));
    Object.assign(s.stats, { health: 85, fatigue: 15, stress: 15, research: 8 });
    for (const u of universities) s.admissionRolls[u.id] = rng(s);
    note(s, `${type.name}의 가능성을 안고 광주과학고에 입학했다. 첫 주 운동부 테스트가 기다린다.`, 'milestone');
    return s;
  }
  function getPhase(s) {
    const t = Math.min(s.turn, 47), term = Math.floor(t / 8), week = t % 8 + 1, isEnd = s.turn >= 48;
    const weeksToExam = (week <= 4 ? 4 : 8) - week;
    const nightAvailable = !isEnd && weeksToExam <= 2, dawnAvailable = !isEnd && weeksToExam <= 1;
    const availableStudyModes = ['normal']; if (nightAvailable) availableStudyModes.push('night'); if (dawnAvailable) availableStudyModes.push('dawn', 'both');
    return { year: Math.floor(term / 2) + 1, semester: term % 2 + 1, term, week, exam: isEnd ? null : week === 4 ? 'midterm' : week === 8 ? 'final' : null, isEnd, needsElectives: s.turn >= 24 && s.turn < 48 && s.electives.length !== 2, weeksToExam, nightAvailable, dawnAvailable, availableStudyModes, examName: week <= 4 ? '중간고사' : '기말고사', label: isEnd ? '졸업 · 진학' : `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 · ${week}주차` };
  }
  function getLeadershipBonus(s) { return Math.min(2, s.sportsClubs.length) * 0.08; }
  function getSportsChance(s, clubId) {
    if (!sportsClubs.some(c => c.id === clubId)) throw new Error('존재하는 운동부를 선택해 주세요.');
    return clamp(0.04 + s.stats.athletics * 0.009 + s.stats.luck * 0.0012, 0.05, 0.96);
  }
  function getIllnessRisk(s) { return clamp(0.008 + Math.pow(s.stats.fatigue / 100, 2.4) * 0.4 + s.stats.stress * 0.0003 - s.stats.resilience * 0.0002, 0.003, 0.48); }
  function getCouncilChance(s, role, answerScore = 0) {
    const info = typeof role === 'object' && role ? role : councilRoles(s).find(x => x.id === role || x.name === role) || { department: null };
    const department = departments.find(d => d.id === info.department);
    const fit = department ? s.stats[department.stat] : (s.stats.leadership + s.stats.social) / 2;
    return clamp(0.03 + s.stats.social * 0.0025 + s.stats.leadership * 0.0025 + s.stats.discipline * 0.0012 + fit * 0.0015 + s.stats.luck * 0.0007 + Math.min(s.councilWeeks, 15) * 0.009 + answerScore * 0.012 + getLeadershipBonus(s) - (department ? 0 : 0.06), 0.05, 0.97);
  }
  function getCaptainChance(s) { return clamp(0.05 + Math.min(s.clubWeeks, 20) * 0.019 + s.stats.social * 0.0025 + s.stats.leadership * 0.0025 + s.stats.luck * 0.0006 + getLeadershipBonus(s), 0.05, 0.97); }
  function sportsEvent(s, additional = false) {
    const candidates = sportsClubs.filter(c => !s.sportsClubs.includes(c.id));
    return { id: 'sports_tryout', title: additional ? '2학년, 두 번째 운동부 도전' : '입학 첫 주, 운동부 입부 테스트', description: additional ? '한 학년이 지났다. 아직 가입하지 않은 운동부 한 곳에 추가로 도전할 수 있다. 기존 운동부는 계속 유지된다.' : '농구부와 축구부 중 한 곳의 테스트를 선택하자. 운동 능력이 높을수록 합격 가능성이 커지고, 행운도 조금 영향을 준다.', choices: [...candidates.map(c => ({ label: `${c.name} 테스트 보기`, description: `예상 합격 ${Math.round(getSportsChance(s, c.id) * 100)}% · 운동 ${Math.round(s.stats.athletics)} / 행운 ${Math.round(s.stats.luck)}`, sportsId: c.id, chance: getSportsChance(s, c.id) })), ...(additional ? [{ label: '추가로 가입하지 않는다', description: '현재의 활동과 학업에 집중한다.', skipSports: true }] : [])] };
  }
  function councilRoles(s) {
    const year = getPhase(s).year;
    return [{ id: year === 1 ? 'vicePresident' : 'president', name: year === 1 ? '학생회 부회장' : '학생회 회장', department: null }, ...departments.map(d => ({ id: d.id, name: `${d.name} ${year === 1 ? '차장' : '부장'}`, department: d.id }))];
  }
  function councilEvent(s) {
    const year = getPhase(s).year;
    if (s.turn === 24 && s.councilRole !== '일반 학생') { note(s, `${s.councilRole} 임기를 마쳤다. 새로운 학년의 학생회 면접에 다시 도전할 수 있다.`, 'council'); s.councilRole = '일반 학생'; }
    return { id: 'council_apply', title: `${year}학년 2학기 학생회 면접 모집`, description: `${year === 1 ? '부회장 또는 각 부서 차장' : '회장 또는 각 부서 부장'} 중 한 자리에 지원할 수 있다. 두 문항의 면접 답변과 관련 능력, 활동 경험을 함께 평가한다. 운동부 가산점: +${Math.round(getLeadershipBonus(s) * 100)}%p.`, choices: [...councilRoles(s).map(role => ({ label: `${role.name} 지원`, description: role.department ? `${[...new Set([statLabels[departments.find(d => d.id === role.department).stat], '사회성', '리더십'])].join('·')}을 살릴 수 있는 자리` : '사회성과 리더십으로 학생들의 의견을 모으는 자리', councilCandidate: role })), { label: '이번에는 지원하지 않는다', description: '현재의 공부와 활동을 계속한다.', skipCouncil: true }] };
  }
  function interviewEvent(s) {
    const i = s.interview, d = departments.find(x => x.id === i.department);
    const cases = {
      culture: '공연 참여 인원이 적고 준비 기간도 짧다. 문예 행사를 어떻게 준비할까?',
      sports: '체육 행사에서 일부 학생만 경기에 참여한다. 참여 기회를 어떻게 넓힐까?',
      statistics: '설문 결과를 집계했는데 누락과 중복 응답이 발견되었다. 어떻게 처리할까?',
      environment: '분리배출이 잘 지켜지지 않는 장소가 있다. 어떤 개선안을 실행할까?',
      publicity: '학교 행사 공지가 학생들에게 잘 전달되지 않는다. 무엇을 바꿀까?',
      administration: '예산이 한정되어 모든 행사 요청을 지원하기 어렵다. 어떻게 배분할까?',
      policy: '같은 학교 규칙에 대해 학생들의 의견이 크게 갈린다. 어떻게 조정할까?',
      wellbeing: '학생들의 생활과 건강에 대한 불편이 반복된다. 어떤 방식으로 개선할까?',
      information: '학생들이 쓰는 정보 안내에 오래된 내용과 오류가 섞여 있다. 어떻게 정리할까?'
    };
    const plan = {
      culture: '희망 분야를 조사하고 작은 무대부터 역할을 나누어 준비한다', sports: '실력별 참여 경기와 운영 역할을 함께 마련한다',
      statistics: '원자료를 검증하고 처리 기준과 한계를 함께 기록한다', environment: '문제 지점을 관찰하고 표지와 동선을 바꾼 뒤 효과를 확인한다',
      publicity: '학생들이 보는 채널과 공지 시점을 조사해 안내 방식을 바꾼다', administration: '목적과 예상 효과를 비교하고 배분 기준을 공개한다',
      policy: '양쪽 의견을 듣고 실행 가능한 대안을 시험한 뒤 평가한다', wellbeing: '불편 내용을 익명으로 모으고 우선순위와 개선 결과를 확인한다',
      information: '담당자와 출처를 확인하고 갱신 책임과 주기를 정한다'
    };
    const first = i.answers.length === 0;
    return { id: 'council_interview', title: `${i.role} 면접 · ${first ? 1 : 2} / 2`, description: first ? (d ? cases[d.id] : '학생들의 요구는 많고 시간과 자원은 한정되어 있다. 대표로서 어떤 공약을 먼저 실행할까?') : '행사 준비 중 팀원 한 명이 맡은 일을 끝내지 못했다. 마감이 가까운 상황에서 어떻게 대응할까?', choices: first ? [
      { label: d ? plan[d.id] : '요구를 조사하고 실행 가능한 공약의 일정과 책임을 제시한다', description: '근거와 실행 방법을 함께 설명한다.', interviewPoints: 8 },
      { label: '직접 경험한 사례를 바탕으로 우선 작은 개선을 시작한다', description: '경험을 중심으로 실천 의지를 보여준다.', interviewPoints: 4 },
      { label: '모든 요구를 반드시 해결하겠다고 약속한다', description: '큰 목표로 자신감을 보여준다.', interviewPoints: -2 }
    ] : [
      { label: '어려움을 듣고 남은 일을 나누어 일정과 책임을 다시 정한다', description: '소통과 구체적인 조정 방법을 제시한다.', interviewPoints: 8 },
      { label: '이번에는 내가 대신 마무리하고 나중에 이야기를 나눈다', description: '마감 해결을 우선한다.', interviewPoints: 4 },
      { label: '다른 사람 앞에서 책임을 묻고 혼자 끝내라고 한다', description: '개인의 책임을 강하게 강조한다.', interviewPoints: -2 }
    ] };
  }
  function captainEvent(s) {
    const targets = [...academicClubs.filter(c => c.id === s.academicClub), ...activityClubs.filter(c => c.id === s.activityClub && c.id !== 'none'), ...sportsClubs.filter(c => s.sportsClubs.includes(c.id))];
    return { id: 'club_captain', title: '다음 기장에 도전할 시간', description: `실제로 가입한 동아리 한 곳의 기장에 도전할 수 있다. 참여 경험·사회성·리더십·행운을 평가하며 운동부 가입 가산점은 +${Math.round(getLeadershipBonus(s) * 100)}%p다.`, choices: [...targets.map(c => ({ label: `${c.name} 기장 지원`, description: `선출 가능성 ${Math.round(getCaptainChance(s) * 100)}%`, captainTarget: { id: c.id, name: c.name }, chance: getCaptainChance(s) })), { label: '팀원으로 함께한다', description: '사회성 +5 · 유대감 +8 · 스트레스 −4', effects: { social: 5, stress: -4 }, bond: 8 }] };
  }
  function migrate(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 48 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version === 2) return s;
    s.sportsClubs = Array.isArray(s.sportsClubs) ? [...new Set(s.sportsClubs)] : [];
    if (sportsClubs.some(c => c.id === s.activityClub)) { if (!s.sportsClubs.includes(s.activityClub)) s.sportsClubs.push(s.activityClub); s.activityClub = 'none'; }
    for (const k of ['luck', 'creativity', 'resilience']) if (!Number.isFinite(s.stats[k])) s.stats[k] = 50;
    s.stats.fatigue = round(clamp(100 - (Number.isFinite(s.stats.health) ? s.stats.health : 75))); s.stats.health = round(100 - s.stats.fatigue);
    s.archetype = s.archetype || 'legacy'; s.sportsTryouts = s.sportsTryouts || []; s.councilHistory = s.councilHistory || [];
    if (s.councilRole && s.councilRole !== '일반 학생' && !s.councilHistory.length) s.councilHistory.push({ year: Math.min(2, getPhase(s).year), role: s.councilRole, department: null, passed: true, chance: null, answers: [], legacy: true });
    if (s.turn >= 40) s.councilRole = '일반 학생';
    s.interview = null; s.illnessWeeks = 0; s.illnessCount = 0; s.sportsWeeks = s.sportsWeeks || 0;
    if (s.pendingEvent && ['council_election', 'club_captain'].includes(s.pendingEvent.id)) s.pendingEvent = s.pendingEvent.id === 'club_captain' ? captainEvent(s) : null;
    if (!s.pendingEvent && [8, 24].includes(s.turn)) s.pendingEvent = councilEvent(s);
    else if (!s.pendingEvent && s.turn === 16) s.pendingEvent = sportsEvent(s, true);
    if (!s.pendingEvent && s.turn === 0 && s.academicClub && !s.sportsClubs.length) s.pendingEvent = sportsEvent(s);
    s.version = 2;
    note(s, '저장한 성적과 활동을 유지한 채 새 규칙으로 이어간다. 기존 체력은 피로도로 전환되었다.', 'milestone');
    return s;
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
    note(s, `${ac.name} · ${club.name} 선택. 학교생활을 시작했다.`, 'club');
    s.pendingEvent = sportsEvent(s);
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
    if (s.turn === 40 && s.councilRole !== '일반 학생') { note(s, `${s.councilRole}의 1년 임기를 마쳤다. 학생회 경험은 활동 이력에 남는다.`, 'council'); s.councilRole = '일반 학생'; }
    if (s.turn === 8 || s.turn === 24) return councilEvent(s);
    if (s.turn === 16) return sportsEvent(s, true);
    if (s.turn === 29) return captainEvent(s);
    const common = {
      3: { id: 'roommate', title: '불 꺼진 기숙사의 대화', description: '옆자리 친구가 첫 시험이 걱정된다고 말을 걸었다. 내 공부도 아직 남아 있다.', choices: [{ label: '함께 개념을 설명해 본다', description: '사회성 +3 · 유대감 +8 · 교과 이해 +2', effects: { social: 3 }, bond: 8, learning: 2 }, { label: '잠깐 이야기를 듣고 각자 공부한다', description: '자기관리 +3 · 스트레스 −4', effects: { discipline: 3, stress: -4 } }] },
      10: { id: 'festival', title: '축제 준비를 도와줄래?', description: '반 친구들이 축제 부스 기획을 제안했다. 준비할 일은 많지만 함께하는 기억이 될 것 같다.', choices: [{ label: '부스 운영을 맡는다', description: '리더십 +8 · 사회성 +4 · 피로도 +5', effects: { leadership: 8, social: 4, health: -5 }, bond: 6 }, { label: '잠깐 도운 뒤 연구실로 간다', description: '연구 역량 +5 · 사회성 +2', effects: { research: 5, social: 2 } }, { label: '이번에는 충분히 쉰다', description: '피로도 −10 · 스트레스 −8', effects: { health: 10, stress: -8 } }] },
      17: { id: 'research_topic', title: '나만의 R&E 질문', description: '2학년 연구가 시작됐다. 같은 현상도 어떤 질문을 던지느냐에 따라 다른 연구가 된다.', choices: [{ label: '실험으로 원리를 검증한다', description: '연구 역량 +8 · 지능 +2', effects: { research: 8, intelligence: 2 }, project: '실험으로 검증한 자연의 원리' }, { label: '데이터와 코드로 예측한다', description: '연구 역량 +8 · 자기관리 +2', effects: { research: 8, discipline: 2 }, project: '데이터로 예측하는 세상' }, { label: '생활 속 문제의 해결책을 찾는다', description: '연구 역량 +6 · 사회성 +4', effects: { research: 6, social: 4 }, project: '학교생활을 바꾸는 작은 발명' }] },
      35: { id: 'presentation', title: '연구 발표회', description: '실패한 실험까지 한 장의 포스터로 묶었다. 이제 내 연구를 설명할 시간이다.', choices: [{ label: '결과와 한계를 솔직하게 설명한다', description: '연구 역량 +7 · 리더십 +3', effects: { research: 7, leadership: 3 }, badge: '탐구 발표자' }, { label: '친구들과 역할을 나누어 발표한다', description: '연구 역량 +5 · 사회성 +5 · 유대감 +5', effects: { research: 5, social: 5 }, bond: 5, badge: '함께한 연구' }] },
      42: { id: 'interview', title: '진학 면접 연습', description: '“3년 동안 가장 몰입한 경험은 무엇인가요?” 친구와 서로의 이야기를 들어 보기로 했다.', choices: [{ label: '연구의 시행착오를 설명한다', description: '연구 역량 +5 · 자기관리 +3', effects: { research: 5, discipline: 3 } }, { label: '팀을 이끌었던 경험을 정리한다', description: '리더십 +6 · 사회성 +3', effects: { leadership: 6, social: 3 } }, { label: '어려운 개념을 쉽게 설명해 본다', description: '지능 +3 · 교과 이해 +3', effects: { intelligence: 3 }, learning: 3 }] },
      46: { id: 'last_memory', title: '마지막으로 남길 장면', description: '졸업이 가까워졌다. 익숙하던 교실과 운동장도 이제 조금 다르게 보인다.', choices: [{ label: '친구들과 운동장에서 사진을 찍는다', description: '유대감 +12 · 스트레스 −8', effects: { stress: -8 }, bond: 12, badge: '운동장의 마지막 오후' }, { label: '연구 노트를 다음 후배에게 남긴다', description: '연구 역량 +4 · 리더십 +4', effects: { research: 4, leadership: 4 }, badge: '후배에게 남긴 질문' }, { label: '나에게 3년의 편지를 쓴다', description: '자기관리 +4 · 피로도 −6 · 스트레스 −8', effects: { discipline: 4, health: 6, stress: -8 }, badge: '나를 알아가는 시간' }] }
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
      const researchBoost = sub.field === 'research' ? s.stats.research * 0.12 + s.stats.creativity * 0.03 : 0;
      const score = round(clamp(36 + s.stats.intelligence * 0.22 + s.stats.discipline * 0.15 + knowledge * 1.3 + midtermAdjustment + academicAffinity + researchBoost + bonus - healthPenalty - stressPenalty - (s.illnessWeeks > 0 ? 7 : 0) + (s.stats.luck - 50) * 0.025 + (rng(s) - 0.5) * 10));
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
    if (actionId === 'sports' && !s.sportsClubs.length) throw new Error('운동부 테스트에 합격한 뒤 팀 훈련에 참여할 수 있어요.');
    if (!p.availableStudyModes.includes(studyMode)) throw new Error('심야자습은 시험 2주 전부터, 새벽자습은 1주 전부터 선택할 수 있어요.');
    const messages = [], action = actions.find(a => a.id === actionId), wasSick = s.illnessWeeks > 0;
    const efficiency = wasSick ? 0.72 : 1;
    const learn = (n, field) => addLearning(s, n * efficiency, field);
    learn(1.35 + s.stats.discipline * 0.004);
    shift(s, { fatigue: 2, stress: 1 });
    switch (actionId) {
      case 'study': learn(2.4); shift(s, { intelligence: 0.7, discipline: 1.2, fatigue: 4, stress: 6 }); break;
      case 'research': s.researchWeeks++; learn(0.65); shift(s, { research: (3.5 + s.stats.creativity * 0.032) * efficiency, creativity: 0.8, intelligence: 0.5, fatigue: 6, stress: 4 }); break;
      case 'academic': learn(0.7); learn(4.4, s.academicClub); shift(s, { research: 2.8 * efficiency, social: 1.3, creativity: 0.4, intelligence: 0.4, fatigue: 3, stress: 2 }); s.clubWeeks++; break;
      case 'club':
        if (s.activityClub !== 'none') { s.clubWeeks++; s.relationships = clamp(s.relationships + 3); shift(s, { social: 4, leadership: 1.2, creativity: 0.7, fatigue: 2, stress: -6 }); }
        else shift(s, { fatigue: -8, stress: -8, discipline: 1.2 });
        break;
      case 'train': shift(s, { athletics: 5 * efficiency, resilience: 0.7, fatigue: 5, stress: -8 }); break;
      case 'sports': s.sportsWeeks++; s.clubWeeks++; s.relationships = clamp(s.relationships + 4); shift(s, { athletics: 3.8 * efficiency, social: 3.2, leadership: 0.8, resilience: 0.5, fatigue: 6 + (s.sportsClubs.length - 1) * 3, stress: -6 }); break;
      case 'friends': shift(s, { social: 4.4, fatigue: -3, stress: -10 }); s.relationships = clamp(s.relationships + 7); break;
      case 'council': s.councilWeeks++; shift(s, { leadership: 4, social: 2.2, fatigue: 5, stress: 3 }); s.relationships = clamp(s.relationships + 2); break;
      case 'rest': shift(s, { fatigue: -(22 + s.stats.resilience * 0.12), stress: -24, discipline: 0.5, resilience: 0.7 }); if (wasSick) { s.illnessWeeks = 0; messages.push('충분히 쉬며 아픈 몸을 회복했다.'); } break;
    }
    if (studyMode === 'night' || studyMode === 'both') { learn(1.9); shift(s, { fatigue: 11, stress: 6 }); messages.push('심야자습으로 시험 준비도를 쌓았다. 피로도 +11.'); }
    if (studyMode === 'dawn' || studyMode === 'both') { learn(1.3); shift(s, { fatigue: 7, stress: 4, discipline: 0.5 }); messages.push('새벽자습으로 핵심 내용을 정리했다. 피로도 +7.'); }
    // Fatigue risk is evaluated after the week's choices; new illness affects this week's exam and the next week.
    if (!wasSick && actionId !== 'rest' && rng(s) < getIllnessRisk(s)) { s.illnessWeeks = 2; s.illnessCount++; messages.push('몸살 기운으로 아프기 시작했다. 이번 주와 다음 주 집중력이 떨어진다. 휴식하면 빨리 회복한다.'); }
    if (wasSick && actionId !== 'rest') messages.push('아직 회복 중이라 이번 주 학습과 훈련 효율이 낮아졌다.');
    let semesterResult = null;
    if (p.exam) {
      const scores = examScores(s, 0, p);
      if (p.exam === 'midterm') { s.midterm = scores; messages.push(`중간고사 평균 ${round(scores.reduce((a, x) => a + x.score, 0) / scores.length)}점. 기말까지 다시 준비할 수 있다.`); }
      else {
        const subjects = scores.map(sub => { const mid = s.midterm && s.midterm.find(m => m.id === sub.id); const score = round((mid ? mid.score : sub.score) * 0.4 + sub.score * 0.6); const [grade, point] = letter(score); return { ...sub, score, grade, point }; });
        const credits = subjects.reduce((a, x) => a + x.credits, 0), earnedCredits = subjects.filter(x => x.point > 0).reduce((a, x) => a + x.credits, 0);
        const gpa = Math.round(subjects.reduce((a, x) => a + x.point * x.credits, 0) / credits * 100) / 100;
        semesterResult = { year: p.year, semester: p.semester, gpa, credits, earnedCredits, subjects }; s.grades.push(semesterResult);
        messages.push(`${p.year}학년 ${p.semester}학기 성적 확정: ${gpa.toFixed(2)} / 4.30.`);
        s.semesterLearning = {}; s.midterm = null; shift(s, { fatigue: -12, stress: -14 });
      }
    }
    if (s.illnessWeeks > 0) { s.illnessWeeks--; if (wasSick && s.illnessWeeks === 0 && actionId !== 'rest') messages.push('몸살 기운이 가라앉았다. 다시 일상을 이어갈 수 있다.'); }
    s.turn++;
    if (s.stats.fatigue > 70) messages.push('피로도가 높아 아플 위험이 커졌다. 수면과 휴식이 필요하다.');
    if (s.stats.stress > 75) messages.push('스트레스가 높다. 친구와의 시간이나 휴식이 필요하다.');
    const studyLabel = { normal: '기본 자습', night: '심야자습', dawn: '새벽자습', both: '심야·새벽자습' }[studyMode];
    note(s, `${p.label}: ${action.name} + ${studyLabel}.`, 'activity');
    for (const m of messages) note(s, m, p.exam ? 'grade' : 'life');
    s.pendingEvent = eventFor(s);
    if (s.turn === 48) { messages.push('48번의 선택 끝에 3년을 마쳤다. 이제 나의 다음 출발을 고를 시간이다.'); note(s, messages[messages.length - 1], 'milestone'); }
    return { messages, event: s.pendingEvent, semesterResult };
  }
  function chooseEvent(s, index) {
    const e = s.pendingEvent;
    if (!e || !Number.isInteger(index) || !e.choices[index]) throw new Error('지금 가능한 선택지를 골라 주세요.');
    const c = e.choices[index], messages = [];
    s.pendingEvent = null;
    if (c.sportsId) {
      if (s.sportsClubs.includes(c.sportsId)) throw new Error('이미 가입한 운동부예요.');
      const year = getPhase(s).year;
      if (s.sportsTryouts.some(t => t.year === year)) throw new Error('올해의 입부 테스트 기회는 이미 사용했어요.');
      const chance = getSportsChance(s, c.sportsId), passed = rng(s) < chance, club = sportsClubs.find(x => x.id === c.sportsId);
      s.sportsTryouts.push({ year, clubId: c.sportsId, passed, chance });
      if (passed) { s.sportsClubs.push(c.sportsId); shift(s, { social: 2, leadership: 1 }); messages.push(`${club.name} 테스트 합격! 운동 ${Math.round(s.stats.athletics)}, 행운 ${Math.round(s.stats.luck)}로 도전해 입부했다. 학생회·기장 선발 가산점 +${Math.round(getLeadershipBonus(s) * 100)}%p.`); }
      else { shift(s, { resilience: 1 }); messages.push(`${club.name} 테스트 불합격. 운동 능력을 키워 ${year === 1 ? '2학년 첫 주의 추가 모집' : '앞으로의 개인 운동'}에 도전할 수 있다.`); }
    } else if (c.skipSports) {
      s.sportsTryouts.push({ year: getPhase(s).year, clubId: null, passed: false, chance: null }); messages.push('추가 입부 대신 현재의 활동을 이어가기로 했다.');
    } else if (c.councilCandidate) {
      const candidate = c.councilCandidate;
      s.interview = { year: getPhase(s).year, candidateId: candidate.id, role: candidate.name, department: candidate.department, answers: [], points: 0 };
      s.pendingEvent = interviewEvent(s); messages.push(`${candidate.name}에 지원해 면접을 시작했다.`);
    } else if (typeof c.interviewPoints === 'number') {
      if (!s.interview) throw new Error('진행 중인 면접이 없어요.');
      s.interview.answers.push(c.label); s.interview.points += c.interviewPoints;
      if (s.interview.answers.length < 2) { s.pendingEvent = interviewEvent(s); messages.push('첫 답변을 마쳤다. 다음 질문으로 이어진다.'); }
      else {
        const i = s.interview, chance = getCouncilChance(s, i, i.points), passed = rng(s) < chance;
        s.councilHistory.push({ year: i.year, role: i.role, department: i.department, passed, chance, answers: [...i.answers], answerScore: i.points });
        if (passed) { s.councilRole = i.role; shift(s, { leadership: 7, social: 3, stress: 3 }); s.badges.push(`${i.year}학년 ${i.role}`); messages.push(`학생회 면접 합격: ${i.role}! 답변과 역량, 운동부 가산점을 합친 선발 확률 ${Math.round(chance * 100)}%.`); }
        else { shift(s, { leadership: 2, resilience: 2 }); messages.push(`${i.role} 면접에서 이번에는 선발되지 않았다. 준비한 경험과 답변은 다음 도전의 밑거름이 된다.`); }
        s.interview = null;
      }
    } else if (c.skipCouncil) { s.councilHistory.push({ year: getPhase(s).year, role: '지원하지 않음', department: null, passed: false, chance: null, answers: [] }); messages.push('이번 학생회 모집에는 지원하지 않기로 했다.'); }
    else if (c.captainTarget) {
      const chance = getCaptainChance(s);
      if (rng(s) < chance) { s.captain = true; s.captainClub = c.captainTarget.name; shift(s, { leadership: 8, social: 3 }); s.badges.push(`${s.captainClub} 기장`); messages.push(`${s.captainClub} 기장으로 선출됐다! 운동부 가산점 +${Math.round(getLeadershipBonus(s) * 100)}%p가 반영되었다.`); }
      else { shift(s, { social: 2, leadership: 2 }); messages.push(`${c.captainTarget.name} 기장은 다른 친구가 맡았다. 함께하는 팀원으로 계속 성장한다.`); }
    } else {
      if (c.effects) shift(s, c.effects);
      if (c.bond) s.relationships = clamp(s.relationships + c.bond);
      if (c.learning) addLearning(s, c.learning);
      if (c.project) s.researchProject = c.project;
      if (c.badge) s.badges.push(c.badge);
    }
    if (!messages.length) messages.push(`${e.title}: ${c.label}. 이 선택이 나의 3년에 남았다.`);
    for (const m of messages) note(s, m, 'event');
    return { messages, event: s.pendingEvent, resolvedEventId: e.id };
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
      const score = academic * (0.78 - rw) + s.stats.research * rw + s.stats.discipline * 0.09 + s.stats.leadership * 0.07 + s.stats.social * 0.06 + (s.captain ? 1 : 0) + (s.councilRole !== '일반 학생' || s.councilHistory.some(h => h.passed) ? 1 : 0) + (s.stats.luck - 50) * 0.04;
      const probability = clamp(1 / (1 + Math.exp((u.threshold - score) / 6.5)), 0.03, 0.97);
      return { id, name: u.name, accepted: s.admissionRolls[id] < probability, probability: Math.round(probability * 100), score: round(score), reason: `학업 ${p.gpa.toFixed(2)} · 연구 ${Math.round(s.stats.research)} · 리더십 ${Math.round(s.stats.leadership)}` };
    });
    // This is a fictional fallback ending, not a real institution's admission claim.
    results.push({ id: 'new_path', name: '나에게 맞는 일반대학 진학', accepted: true, probability: null, score: null, reason: '게임에서 항상 열려 있는 새로운 출발 경로' });
    s.admissions = results;
    note(s, '진학 결과를 확인했다. 대학 이름 하나로 3년의 의미가 정해지지는 않는다.', 'milestone');
    return results;
  }
  const API = { create, migrate, getPhase, getSubjects, actions, advance, chooseEvent, setClubs, chooseElectives, applyUniversities, getProfile, academicClubs, activityClubs, sportsClubs, archetypes, departments, electives, universities, statLabels, getSportsChance, getIllnessRisk, getLeadershipBonus, getCouncilChance, getCaptainChance, councilRoles };
  root.GSAEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
