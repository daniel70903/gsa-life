(function (root) {
  'use strict';
  const dailyEvents = root.GSALifeEvents || (typeof require === 'function' ? require('./life-events.js') : []);

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
    { id: 'dgist', name: 'DGIST', description: '융합 과학과 탐구를 함께 보는 경로', threshold: 67, researchWeight: 0.25 },
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
    { id: 'english', name: 'TOEIC 준비', icon: 'book', description: '1학년부터 듣기와 독해를 연습해 졸업 영어 기준을 준비해요.', effectsText: '영어 준비도 ↑ · 자기관리 ↑ · 피로도 ↑' },
    { id: 'toeic', name: 'TOEIC 응시', icon: 'book', description: '2학년부터 응시할 수 있어요. 졸업 기준은 730점이에요.', effectsText: '영어 성적 기록 · 피로도 ↑ · 스트레스 ↑' },
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
      s.stats[k] = round(clamp((s.stats[k] || 0) + delta, 0, ['fatigue','stress'].includes(k) ? 120 : 100));
    }
    s.stats.health = round(Math.max(0, 100 - s.stats.fatigue));
  }
  function note(s, message, category = 'life') { s.log.unshift({ turn: s.turn, message, category }); }
  function create(name = '새로운 학생', seed) {
    const randomSeed = seed === undefined ? (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 : seedNumber(seed);
    const s = { version: 3, name: String(name).trim().slice(0, 16) || '새로운 학생', seed: randomSeed, rng: randomSeed, turn: 0, stats: {}, archetype: null, academicClub: null, activityClub: null, sportsClubs: [], sportsTryouts: [], electives: [], grades: [], semesterLearning: {}, midterm: null, pendingEvent: null, councilRole: '일반 학생', councilHistory: [], interview: null, captain: false, captainClub: null, relationships: 10, clubWeeks: 0, councilWeeks: 0, researchWeeks: 0, sportsWeeks: 0, illnessWeeks: 0, illnessCount: 0, researchProject: '아직 연구 주제를 찾는 중', badges: [], log: [], admissions: null, admissionRolls: {}, enrolledUniversity: null };
    Object.assign(s, { alive: true, ending: null, emergency: null, hospitalizations: [], eventQueue: [], dormHarmony: 65, awards: [], tournamentHistory: [], olympiadHistory: [], toeic: { best: 0, attempts: [], practice: 0 }, extraWeeks: 0, applications: [], applicationSnapshot: null, universityInterview: null, universityInterviews: [], admissionStage: 'not_started', dailySeen: [], captainSelectionDone: false });
    const type = archetypes[Math.floor(rng(s) * archetypes.length)]; s.archetype = type.id;
    for (const k of ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership']) s.stats[k] = clamp(32 + Math.floor(rng(s) * 25) + (type.bonuses[k] || 0));
    Object.assign(s.stats, { health: 85, fatigue: 15, stress: 15, research: 8 });
    for (const u of universities) s.admissionRolls[u.id] = rng(s);
    note(s, `${type.name}의 가능성을 안고 광주과학고에 입학했다. 첫 주 운동부 테스트가 기다린다.`, 'milestone');
    return s;
  }
  function getPhase(s) {
    const t = Math.min(s.turn, 47), term = Math.floor(t / 8), week = t % 8 + 1, isDead = s.alive === false, isEnd = isDead || s.turn >= 48, toeicBest = s.toeic ? s.toeic.best : 0;
    const weeksToExam = (week <= 4 ? 4 : 8) - week;
    const nightAvailable = !isEnd && weeksToExam <= 2, dawnAvailable = !isEnd && weeksToExam <= 1;
    const availableStudyModes = ['normal']; if (nightAvailable) availableStudyModes.push('night'); if (dawnAvailable) availableStudyModes.push('dawn', 'both');
    return { year: Math.floor(term / 2) + 1, semester: term % 2 + 1, term, week, exam: isEnd ? null : week === 4 ? 'midterm' : week === 8 ? 'final' : null, isEnd, isDead, needsApplications: !isDead && s.turn >= 32 && !(s.applications || []).length && !s.admissions, graduationPending: !isDead && s.turn >= 48 && toeicBest < 730, needsElectives: !isDead && s.turn >= 24 && s.turn < 48 && s.electives.length !== 2, weeksToExam, nightAvailable, dawnAvailable, availableStudyModes, examName: week <= 4 ? '중간고사' : '기말고사', label: isDead ? '이야기의 마지막' : s.turn >= 48 ? toeicBest >= 730 ? '졸업 · 진학' : '졸업 요건 준비' : `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 · ${week}주차` };
  }
  function assertAlive(s) { if (s.alive === false) throw new Error('이 이야기는 끝났어요. 새로운 학교생활로 다시 시작할 수 있어요.'); }
  function getDormStatus(s) {
    const harmony = s.dormHarmony === undefined ? 65 : s.dormHarmony;
    const efficiency = harmony < 25 ? 0.72 : harmony < 45 ? 0.86 : 1;
    return { label: harmony < 25 ? '갈등으로 지친 기숙사' : harmony < 45 ? '어색한 기숙사 생활' : '안정적인 기숙사 생활', efficiency, description: harmony < 25 ? '친구와 갈등이 쌓여 휴식과 집중이 어려워요. 대화와 관계 회복이 필요해요.' : harmony < 45 ? '서로의 생활 습관을 맞추는 중이에요. 잠과 공부에 조금 영향을 받고 있어요.' : '서로의 공간을 존중하며 하루를 마무리하고 있어요.' };
  }
  function crisisLimit(s) { return s.stats.fatigue >= 100 || s.stats.stress >= 100 || (s.stats.fatigue >= 90 && s.stats.stress >= 90); }
  function getEmergencySurvivalChance(s) { return clamp(0.4 + s.stats.luck * 0.0045, 0.4, 0.87); }
  function emergencyEvent(s) { return { id: 'emergency', title: '갑작스러운 응급실 이송', description: '몸과 마음에 쌓인 부담이 한계를 넘었다. 친구가 도움을 요청했고, 응급실에서 치료가 시작되었다. 결과를 기다리고 있다.', choices: [{ label: '치료 결과 확인', description: '이 이야기의 다음 순간을 확인한다.', resolveEmergency: true }] }; }
  function triggerEmergency(s, snapshot) {
    if (!s.alive || s.emergency) return;
    s.emergency = { turn: s.turn, extraWeek: s.extraWeeks, fatigue: snapshot ? snapshot.fatigue : s.stats.fatigue, stress: snapshot ? snapshot.stress : s.stats.stress };
    if (s.pendingEvent) s.eventQueue.unshift(s.pendingEvent);
    s.pendingEvent = emergencyEvent(s); s.ending = null;
    note(s, '지쳐 쓰러져 응급실로 이송되었다. 치료가 진행 중이다.', 'emergency');
  }
  function nextEvent(s) { if (!s.pendingEvent && s.alive) s.pendingEvent = s.eventQueue.shift() || null; }
  function updateEnding(s) {
    if (!s.alive) { s.ending = 'death'; return; }
    if (s.turn >= 48 && !s.emergency) s.ending = s.toeic.best >= 730 ? 'graduated' : 'deferred';
  }
  function getLeadershipBonus(s) { return Math.min(2, s.sportsClubs.length) * 0.08 + Math.min(2, (s.awards || []).filter(a => a.kind === 'sports').length) * 0.08; }
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
    if (s.turn === 24 && s.councilRole !== '일반 학생') { note(s, `${s.councilRole} 임기를 마쳤다. 새로운 학년의 학생회에 다시 도전할 수 있다.`, 'council'); s.councilRole = '일반 학생'; }
    return { id: 'council_apply', title: `${year}학년 2학기 학생회 모집`, description: `${year === 1 ? '부회장 또는 각 부서 차장' : '회장 또는 각 부서 부장'} 중 한 자리에 지원할 수 있다. 회장·부회장 후보는 학생들의 공개 질문에 답하고, 부서 지원자는 면접을 진행한다.`, choices: [...councilRoles(s).map(role => ({ label: `${role.name} 지원`, description: role.department ? `${[...new Set([statLabels[departments.find(d => d.id === role.department).stat], '사회성', '리더십'])].join('·')}을 살릴 수 있는 자리` : '사회성과 리더십으로 학생들의 의견을 모으는 자리', councilCandidate: role })), { label: '이번에는 지원하지 않는다', description: '현재의 공부와 활동을 계속한다.', skipCouncil: true }] };
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
    if (!d) return { id: 'council_debate', title: `${i.role} 후보 공개 질의응답 · ${first ? 1 : 2} / 2`, description: first ? '한 학생이 묻는다. “학업 부담이 큰데 행사까지 늘리면 더 힘들지 않을까요? 어떤 공약을 실제로 지킬 건가요?”' : '다른 학생이 손을 든다. “친한 친구들의 의견만 듣지 않고, 조용한 학생들의 목소리도 반영할 방법이 있나요?”', choices: first ? [{ label: '설문으로 우선순위를 정하고, 가능한 일정과 예산부터 공개한다', description: '질문에 구체적인 실행 계획으로 답한다.', interviewPoints: 8 }, { label: '내 경험에서 꼭 필요한 행사 하나를 제안한다', description: '직접 겪은 문제를 바탕으로 답한다.', interviewPoints: 4 }, { label: '모든 행사를 늘리고 공부 부담도 모두 줄이겠다고 약속한다', description: '큰 목표를 강조한다.', interviewPoints: -2 }] : [{ label: '익명 의견 창구와 정기적인 결과 공유를 약속한다', description: '참여 기회와 책임 있는 설명을 제시한다.', interviewPoints: 8 }, { label: '각 반에서 친구들이 직접 의견을 전달하게 한다', description: '반별 의견을 듣는 방법을 제안한다.', interviewPoints: 4 }, { label: '나를 믿고 맡겨주면 된다고 답한다', description: '자신감을 앞세운다.', interviewPoints: -2 }] };
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
    return { id: 'club_captain', title: '1학년의 끝, 다음 기장 선출', description: '한 해의 동아리 활동을 돌아보며 다음 기장을 정한다. 가입한 동아리 한 곳에서 다음 활동을 이끌겠다고 나설 수 있다.', choices: [...targets.map(c => ({ label: `${c.name} 기장 지원`, description: '내가 함께 만들어갈 활동을 이야기한다.', captainTarget: { id: c.id, name: c.name } })), { label: '팀원으로 함께한다', description: '사회성 +5 · 유대감 +8 · 스트레스 −4', effects: { social: 5, stress: -4 }, bond: 8 }] };
  }
  function migrateV2(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 48 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version === 2) return s;
    s.sportsClubs = Array.isArray(s.sportsClubs) ? [...new Set(s.sportsClubs)] : [];
    if (sportsClubs.some(c => c.id === s.activityClub)) { if (!s.sportsClubs.includes(s.activityClub)) s.sportsClubs.push(s.activityClub); s.activityClub = 'none'; }
    for (const k of ['luck', 'creativity', 'resilience']) if (!Number.isFinite(s.stats[k])) s.stats[k] = 50;
    s.stats.fatigue = round(clamp(100 - (Number.isFinite(s.stats.health) ? s.stats.health : 75))); s.stats.health = round(Math.max(0, 100 - s.stats.fatigue));
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
  function cleanVisibleText(text) {
    return String(text || '')
      .replace(/학생회 면접 합격:\s*(학생회 (?:부)?회장)!?/g, '학생들의 투표 결과, $1에 당선됐다!')
      .replace(/(학생회 (?:부)?회장)에 지원해 면접을 시작했다/g, '$1 후보로 학생들의 공개 질문을 받는다')
      .replace(/(학생회 (?:부)?회장) 면접에서 이번에는 선발되지 않았다/g, '개표 결과, 이번 $1 선거에서는 당선되지 않았다')
      .replace(/새로운 학년의 학생회 면접에/g, '새로운 학년의 학생회에')
      .replace(/[^.!?\n]*(?:가산점|가산|보너스|선발 확률|선출 가능성)[^.!?\n]*[.!?]?/g, '').trim();
  }
  function migrate(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 48 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version === 3) { s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' })); return s; }
    if (s.version !== 2) migrateV2(s);
    const existingEvent = s.pendingEvent;
    Object.assign(s, { alive: true, ending: null, emergency: null, hospitalizations: [], eventQueue: [], dormHarmony: clamp(40 + s.stats.social * 0.4), awards: [], tournamentHistory: [], olympiadHistory: [], toeic: { best: 0, attempts: [], practice: 0 }, extraWeeks: 0, applications: [], applicationSnapshot: null, universityInterview: null, universityInterviews: [], admissionStage: s.admissions ? 'results' : 'not_started', dailySeen: [], captainSelectionDone: s.turn > 16 || !!s.captain });
    s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' }));
    if (!Number.isFinite(s.admissionRolls.dgist)) s.admissionRolls.dgist = seedNumber(`${s.seed}:dgist`) / 4294967296;
    if (s.admissions) { s.admissions = s.admissions.filter(r => r.id !== 'new_path').map(r => ({ ...r, reason: cleanVisibleText(r.reason), conditional: true })); s.applications = s.admissions.map(r => r.id); }
    s.pendingEvent = null;
    if (existingEvent) {
      if (existingEvent.id === 'council_apply') s.pendingEvent = councilEvent(s);
      else if (['council_interview','council_debate'].includes(existingEvent.id) && s.interview) s.pendingEvent = interviewEvent(s);
      else if (existingEvent.id === 'club_captain' && s.turn === 16) s.pendingEvent = captainEvent(s);
      else if (existingEvent.id === 'sports_tryout') s.pendingEvent = sportsEvent(s, s.turn >= 16);
      else if (existingEvent.id !== 'club_captain') s.pendingEvent = existingEvent;
    }
    if (s.turn === 16 && !s.captainSelectionDone) { if (s.pendingEvent) s.eventQueue.push(s.pendingEvent); s.pendingEvent = captainEvent(s); }
    s.version = 3;
    updateEnding(s);
    note(s, '지금까지의 성적과 활동을 이어간다. 졸업 영어 성적은 새 규칙에서 응시해 기록할 수 있다.', 'milestone');
    return s;
  }
  function getSubjects(s) {
    if (s.turn < 24) return core.map(x => ({ ...x }));
    return [core[0], core[4], core[5], ...s.electives.map(id => electives.find(e => e.id === id)).filter(Boolean), { id: 'research', name: '융합 탐구', field: 'research', credits: 4 }].map(x => ({ ...x }));
  }
  function setClubs(s, academicId, activityId) {
    assertAlive(s);
    if (s.turn !== 0 || s.academicClub) throw new Error('동아리는 입학할 때 한 번 선택할 수 있어요.');
    if (!academicClubs.some(c => c.id === academicId) || !activityClubs.some(c => c.id === activityId)) throw new Error('학술동아리와 상설 활동을 각각 골라 주세요.');
    s.academicClub = academicId; s.activityClub = activityId;
    const ac = academicClubs.find(c => c.id === academicId), club = activityClubs.find(c => c.id === activityId);
    note(s, `${ac.name} · ${club.name} 선택. 학교생활을 시작했다.`, 'club');
    s.pendingEvent = sportsEvent(s);
    return s;
  }
  function chooseElectives(s, ids) {
    assertAlive(s);
    if (s.turn < 24 || s.turn >= 48 || s.electives.length) throw new Error('선택과목은 2학년 2학기 시작에 선택해요.');
    if (!Array.isArray(ids) || ids.length !== 2 || new Set(ids).size !== 2 || ids.some(id => !electives.some(e => e.id === id))) throw new Error('서로 다른 선택과목 두 개를 골라 주세요.');
    s.electives = [...ids];
    note(s, `${ids.map(id => electives.find(e => e.id === id).name).join(' · ')}를 선택했다.`, 'milestone');
    return s;
  }
  function getTournamentEligibility(s) { return s.sportsClubs.length > 0 && s.sportsWeeks >= 2 && s.stats.athletics >= 60; }
  function tournamentEvent(s) {
    const year = getPhase(s).year, eligible = getTournamentEligibility(s);
    return { id: 'sports_tournament', title: `${year}학년 여름, 교육감배 대표 선발`, description: eligible ? '꾸준한 훈련과 경기 실력을 인정받아 학교 대표 명단에 이름이 올랐다. 팀원들과 교육감배에 참가할 기회다.' : s.sportsClubs.length ? '교육감배 대표가 발표됐다. 이번에는 훈련 참여와 경기 경험이 더 필요한 것 같다.' : '운동부 친구들이 학교 대표로 교육감배에 나간다. 체육관에 응원 소리가 가득하다.', choices: eligible ? [{ label: '학교 대표로 대회에 참가한다', description: '팀원들과 연습한 것을 경기에서 보여준다.', participateTournament: true, tournamentYear: year }, { label: '이번에는 참가를 양보한다', description: '학업과 지금의 생활에 집중한다.', skipTournament: true, tournamentYear: year }] : [{ label: '다음 기회를 준비하며 응원한다', description: '동료의 경기를 보고 함께 응원한다.', skipTournament: true, tournamentYear: year, effects: { social: 2 } }] };
  }
  function getOlympiadChance(s) { return clamp(0.04 + Math.max(0, s.stats.intelligence - 60) * 0.014 + s.stats.discipline * 0.0012 + s.stats.research * 0.001 + s.stats.luck * 0.001, 0.05, 0.88); }
  function olympiadEvent(s) {
    const eligible = s.stats.intelligence >= 60;
    return { id: 'olympiad', title: '과학 올림피아드 도전', description: eligible ? '어려운 문제를 즐기는 모습을 본 선생님이 올림피아드에 도전해보라고 권했다. 익숙한 공식 너머의 사고력을 시험해볼 시간이다.' : '올림피아드 준비 모임이 열렸다. 아직은 기초를 다지는 편이 도움이 될 것 같다.', choices: eligible ? [{ label: '올림피아드에 참가한다', description: '새로운 문제에 도전하고 풀이를 끝까지 정리한다.', participateOlympiad: true }, { label: '이번에는 기초 공부를 더 한다', description: '지능 +2 · 자기관리 +2', effects: { intelligence: 2, discipline: 2 }, skipOlympiad: true }] : [{ label: '준비 모임에서 풀이를 배운다', description: '지능 +3 · 연구 역량 +2', effects: { intelligence: 3, research: 2 }, skipOlympiad: true }, { label: '친구와 기본 개념부터 정리한다', description: '지능 +2 · 사회성 +2', effects: { intelligence: 2, social: 2 }, harmony: 5, skipOlympiad: true }] };
  }
  function universityQuestionEvent(s) {
    const i = s.universityInterview, u = universities.find(x => x.id === i.universityId), n = i.answers.length;
    const questions = [
      { title: '수학·과학적 사고', question: '작은 각도로 흔들리는 진자의 주기는 추의 질량을 바꾸어도 거의 같다. 이를 설명하려면 어떤 가정과 관계를 확인해야 할까?', answers: [['운동 방정식에서 질량이 상쇄됨을 보이고 작은 각도와 마찰 무시 가정을 설명한다',8],['질량이 다른 추로 여러 번 측정한 결과를 비교한다고 설명한다',4],['무거우면 항상 빨리 움직이므로 주기도 짧다고 단정한다',-2]] },
      { title: '연구 경험과 검증', question: 'R&E에서 예상과 다른 결과가 나왔다. 어떤 변인을 먼저 확인하고, 내 해석의 한계를 어떻게 설명할까?', answers: [['통제 변인과 측정 오차를 점검하고 재현 실험과 대안 가설을 제시한다',8],['실험을 다시 반복해 같은 결과가 나오는지 본다',4],['예상한 그래프와 맞지 않는 결과는 제외한다고 답한다',-2]] },
      { title: '진로·협업과 성장', question: '대학에서 이어가고 싶은 질문은 무엇이며, 팀원과 해석이 다를 때 어떻게 연구를 진행할까?', answers: [['현재 연구의 한계에서 새 질문을 만들고 근거를 비교해 공동 실험을 제안한다',8],['관심 분야를 공부하고 서로의 의견을 차례로 듣겠다고 답한다',4],['수상 결과만 말하고 내 의견을 팀이 따라야 한다고 답한다',-2]] }
    ];
    const q = questions[n];
    return { id: 'university_interview', title: `${u.name} 면접 · ${n + 1} / 3`, description: `${q.title} — ${q.question}`, choices: q.answers.map(([label,points]) => ({ label, description: '내 생각을 면접관에게 설명한다.', universityPoints: points })) };
  }
  function beginUniversityInterviews(s) {
    if (!s.applications.length || s.admissions) return null;
    const next = s.applications.find(id => !s.universityInterviews.some(i => i.id === id));
    if (!next) { s.admissionStage = 'awaiting_results'; return null; }
    s.admissionStage = 'interview'; s.universityInterview = { universityId: next, answers: [], points: 0 };
    return universityQuestionEvent(s);
  }
  function resultsEvent() { return { id: 'university_results', title: '대학 전형 결과가 도착했다', description: '원서와 학교생활, 면접에서 나눈 이야기를 바탕으로 결과가 도착했다. 합격한 경우에도 졸업 요건을 충족해야 진학할 수 있다.', choices: [{ label: '전형 결과 확인', description: '다음 출발을 확인한다.', resolveAdmissions: true }] }; }
  function scheduleEvents(s) {
    const events = [];
    if ([8,24].includes(s.turn)) { events.push(councilEvent(s)); events.push(tournamentEvent(s)); }
    if (s.turn === 16) { if (!s.captainSelectionDone) events.push(captainEvent(s)); events.push(sportsEvent(s, true)); }
    if ([12,28].includes(s.turn)) events.push(olympiadEvent(s));
    if (s.turn === 36 && s.applications.length) { const e = beginUniversityInterviews(s); if(e) events.push(e); }
    if (s.turn === 39 && s.applications.length && !s.admissions) events.push(resultsEvent());
    if (s.turn === 40) { if (s.councilRole !== '일반 학생') { note(s, `${s.councilRole}의 1년 임기를 마쳤다. 학생회 경험은 활동 이력에 남는다.`, 'council'); s.councilRole = '일반 학생'; } events.push(tournamentEvent(s)); }
    const milestones = {
      17: { id:'research_topic', title:'나만의 R&E 질문', description:'2학년 연구가 시작됐다. 어떤 질문을 끝까지 붙잡아볼까?', choices:[{label:'실험으로 원리를 검증한다',description:'연구 역량 +8 · 지능 +2',effects:{research:8,intelligence:2},project:'실험으로 검증한 자연의 원리'},{label:'데이터와 코드로 예측한다',description:'연구 역량 +8 · 창의성 +2',effects:{research:8,creativity:2},project:'데이터로 예측하는 세상'}]},
      35: { id:'presentation',title:'연구 발표회',description:'실패한 실험까지 한 장의 포스터로 묶었다. 내 연구를 설명할 시간이다.',choices:[{label:'결과와 한계를 솔직하게 설명한다',description:'연구 역량 +7 · 리더십 +3',effects:{research:7,leadership:3}},{label:'친구들과 역할을 나누어 발표한다',description:'연구 역량 +5 · 사회성 +5',effects:{research:5,social:5},harmony:7}]},
      46: { id:'last_memory',title:'마지막으로 남길 장면',description:'익숙한 교실과 운동장도 조금 다르게 보인다. 어떤 순간을 기억하고 싶을까?',choices:[{label:'친구들과 운동장에서 사진을 찍는다',description:'유대감 +12 · 스트레스 −8',effects:{stress:-8},bond:12,harmony:10},{label:'연구 노트를 후배에게 남긴다',description:'연구 역량 +4 · 리더십 +4',effects:{research:4,leadership:4}},{label:'나에게 3년의 편지를 쓴다',description:'자기관리 +4 · 피로도 −6',effects:{discipline:4,fatigue:-6}}]}
    };
    if(milestones[s.turn]) events.push(milestones[s.turn]);
    if (!events.length && s.turn < 48 && s.turn !== 32 && rng(s) < 0.74 && dailyEvents.length) {
      let pool = dailyEvents.filter(e => (e.context !== 'sports' || s.sportsClubs.length) && (e.context !== 'research' || s.turn >= 8) && !s.dailySeen.slice(-12).includes(e.id));
      if (s.dormHarmony < 40 && rng(s) < 0.55) { const dorm = pool.filter(e => e.context === 'dorm'); if(dorm.length)pool=dorm; }
      if (!pool.length) pool = dailyEvents;
      const event = JSON.parse(JSON.stringify(pool[Math.floor(rng(s) * pool.length)])); s.dailySeen.push(event.id); events.push(event);
    }
    s.eventQueue.push(...events); nextEvent(s);
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
    assertAlive(s);
    const p = getPhase(s);
    if (p.isEnd) throw new Error('3년의 이야기가 끝났어요. 진학 결과를 확인해 주세요.');
    if (s.pendingEvent) throw new Error('먼저 지금의 사건에서 선택해 주세요.');
    if (!s.academicClub) throw new Error('입학할 때 동아리를 먼저 골라 주세요.');
    if (p.needsApplications) throw new Error('3학년 1학기 원서 접수를 먼저 마쳐 주세요.');
    if (p.needsElectives) throw new Error('2학년 2학기 선택과목 두 개를 먼저 골라 주세요.');
    if (!actions.some(a => a.id === actionId)) throw new Error('진행할 활동을 골라 주세요.');
    if (actionId === 'sports' && !s.sportsClubs.length) throw new Error('운동부 테스트에 합격한 뒤 팀 훈련에 참여할 수 있어요.');
    if (actionId === 'toeic' && s.turn < 16) throw new Error('TOEIC 응시는 2학년부터 선택할 수 있어요. 준비는 1학년부터 가능해요.');
    if (!p.availableStudyModes.includes(studyMode)) throw new Error('심야자습은 시험 2주 전부터, 새벽자습은 1주 전부터 선택할 수 있어요.');
    const messages = [], action = actions.find(a => a.id === actionId), wasSick = s.illnessWeeks > 0;
    s.dormHarmony = round(clamp(s.dormHarmony + (s.stats.social < 35 ? -4 : s.stats.social < 50 ? -1.5 : 1)));
    if (s.stats.social < 35) s.relationships = round(clamp(s.relationships - (s.dormHarmony < 45 ? 2 : 0.5)));
    const dorm = getDormStatus(s);
    if (dorm.efficiency < 1) { shift(s, { fatigue: 2, stress: 2 }); messages.push('기숙사 관계가 불편해 잠과 공부에 집중하기 어려웠다.'); }
    const efficiency = (wasSick ? 0.72 : 1) * dorm.efficiency;
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
      case 'friends': s.dormHarmony = round(clamp(s.dormHarmony + 14)); shift(s, { social: 4.4, fatigue: -3, stress: -10 }); s.relationships = clamp(s.relationships + 7); break;
      case 'council': s.councilWeeks++; shift(s, { leadership: 4, social: 2.2, fatigue: 5, stress: 3 }); s.relationships = clamp(s.relationships + 2); break;
      case 'english': s.toeic.practice = round(s.toeic.practice + 1.5); learn(1.8, 'language'); shift(s, { discipline: 1, fatigue: 3, stress: 2 }); break;
      case 'toeic': messages.push(recordToeic(s)); shift(s, { fatigue: 8, stress: 5 }); break;
      case 'rest': shift(s, { fatigue: -(22 + s.stats.resilience * 0.12), stress: -24, discipline: 0.5, resilience: 0.7 }); if (wasSick) { s.illnessWeeks = 0; messages.push('충분히 쉬며 아픈 몸을 회복했다.'); } break;
    }
    if (studyMode === 'night' || studyMode === 'both') { learn(1.9); shift(s, { fatigue: 11, stress: 6 }); messages.push('심야자습으로 시험 준비도를 쌓았다. 피로도 +11.'); }
    if (studyMode === 'dawn' || studyMode === 'both') { learn(1.3); shift(s, { fatigue: 7, stress: 4, discipline: 0.5 }); messages.push('새벽자습으로 핵심 내용을 정리했다. 피로도 +7.'); }
    const crossedLimit = crisisLimit(s), crisisSnapshot = { fatigue: s.stats.fatigue, stress: s.stats.stress };
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
    scheduleEvents(s);
    if (crossedLimit) triggerEmergency(s, crisisSnapshot);
    updateEnding(s);
    if (s.turn === 48 && !s.emergency) { messages.push(s.toeic.best >= 730 ? '3년의 과정을 마치고 영어 졸업 기준도 충족했다.' : '3년의 수업을 마쳤다. TOEIC 730점을 충족할 때까지 졸업은 보류된다.'); note(s, messages[messages.length - 1], 'milestone'); }
    return { messages, event: s.pendingEvent, semesterResult };
  }
  function chooseEvent(s, index) {
    assertAlive(s);
    const e = s.pendingEvent;
    if (!e || !Number.isInteger(index) || !e.choices[index]) throw new Error('지금 가능한 선택지를 골라 주세요.');
    const c = e.choices[index], messages = [];
    s.pendingEvent = null;
    if (c.resolveEmergency) {
      if (!s.emergency) throw new Error('진행 중인 치료가 없어요.');
      const survived = rng(s) < getEmergencySurvivalChance(s);
      s.hospitalizations.push({ ...s.emergency, survived }); s.emergency = null;
      if (!survived) { s.alive = false; s.ending = 'death'; s.eventQueue = []; s.interview = null; s.universityInterview = null; s.enrolledUniversity = null; messages.push('치료를 받았지만 끝내 회복하지 못했다. 이 학생의 이야기는 여기서 마무리되었다.'); }
      else { s.stats.fatigue = 35; s.stats.stress = 30; s.stats.health = 65; s.illnessWeeks = 1; messages.push('치료를 받고 의식을 되찾았다. 회복을 위해 쉬며 다시 일상으로 돌아갈 시간을 갖는다.'); }
    } else if (c.sportsId) {
      if (s.sportsClubs.includes(c.sportsId)) throw new Error('이미 가입한 운동부예요.');
      const year = getPhase(s).year;
      if (s.sportsTryouts.some(t => t.year === year)) throw new Error('올해의 입부 테스트 기회는 이미 사용했어요.');
      const chance = getSportsChance(s, c.sportsId), passed = rng(s) < chance, club = sportsClubs.find(x => x.id === c.sportsId);
      s.sportsTryouts.push({ year, clubId: c.sportsId, passed, chance });
      if(passed){s.sportsClubs.push(c.sportsId);shift(s,{social:2,leadership:1});messages.push(`${club.name} 테스트 합격! 팀원들과 함께 운동부 활동을 시작한다.`);}
      else{shift(s,{resilience:1});messages.push(`${club.name} 테스트에 합격하지 못했다. 개인 운동으로 다시 실력을 쌓아갈 수 있다.`);}
    } else if(c.skipSports){s.sportsTryouts.push({year:getPhase(s).year,clubId:null,passed:false,chance:null});messages.push('추가 입부 대신 현재의 활동을 이어가기로 했다.');}
    else if(c.councilCandidate){const v=c.councilCandidate;s.interview={year:getPhase(s).year,candidateId:v.id,role:v.name,department:v.department,answers:[],points:0};s.pendingEvent=interviewEvent(s);messages.push(v.department?`${v.name} 면접을 시작했다.`:`${v.name} 후보로 학생들의 공개 질문을 받는다.`);}
    else if(typeof c.interviewPoints==='number'){
      if(!s.interview)throw new Error('진행 중인 질문이 없어요.');
      s.interview.answers.push(c.label);s.interview.points+=c.interviewPoints;
      if(s.interview.answers.length<2)s.pendingEvent=interviewEvent(s);
      else{const i=s.interview,chance=getCouncilChance(s,i,i.points),passed=rng(s)<chance;s.councilHistory.push({year:i.year,role:i.role,department:i.department,passed,chance,answers:[...i.answers],answerScore:i.points});
        if(passed){s.councilRole=i.role;shift(s,{leadership:7,social:3,stress:3});s.badges.push(`${i.year}학년 ${i.role}`);messages.push(i.department?`${i.role} 면접에 합격했다!`:`학생들의 투표 결과, ${i.role}에 당선됐다!`);}
        else{shift(s,{leadership:2,resilience:2});messages.push(i.department?`${i.role} 면접에서 이번에는 선발되지 않았다.`:`개표 결과, 이번 ${i.role} 선거에서는 당선되지 않았다.`);}s.interview=null;}
    }else if(c.skipCouncil){s.councilHistory.push({year:getPhase(s).year,role:'지원하지 않음',department:null,passed:false,chance:null,answers:[]});messages.push('이번 학생회 모집에는 지원하지 않기로 했다.');}
    else if(c.captainTarget){s.captainSelectionDone=true;if(rng(s)<getCaptainChance(s)){s.captain=true;s.captainClub=c.captainTarget.name;shift(s,{leadership:8,social:3});s.badges.push(`${s.captainClub} 기장`);messages.push(`${s.captainClub} 기장으로 선출됐다! 다음 해의 활동을 준비한다.`);}else{shift(s,{social:2,leadership:2});messages.push(`${c.captainTarget.name} 기장은 다른 친구가 맡았다. 함께하는 팀원으로 계속 성장한다.`);}}
    else if(c.participateTournament){
      if(s.tournamentHistory.some(h=>h.year===c.tournamentYear))throw new Error('올해 대회 기록은 이미 남았어요.');
      if(!getTournamentEligibility(s))throw new Error('학교 대표로 선발되지 않았어요.');
      const medal=rng(s)<0.1, clubId=s.sportsClubs[0];s.tournamentHistory.push({year:c.tournamentYear,clubId,participated:true,medal});
      shift(s,{athletics:2,social:3,fatigue:8});
      if(medal){const award={kind:'sports',name:`교육감배 ${sportsClubs.find(x=>x.id===clubId).name} 메달`,year:c.tournamentYear,turn:s.turn};s.awards.push(award);s.badges.push(award.name);messages.push('마지막 경기까지 팀원들과 힘을 모아 교육감배 메달을 받았다!');}
      else messages.push('교육감배 경기를 끝까지 뛰었다. 메달은 얻지 못했지만, 팀으로 함께한 경기가 기억에 남았다.');
    }else if(c.skipTournament){s.tournamentHistory.push({year:c.tournamentYear,clubId:s.sportsClubs[0]||null,participated:false,medal:false});messages.push('이번 교육감배에는 선수로 참가하지 않고 응원했다.');}
    else if(c.participateOlympiad){
      if(s.stats.intelligence<60)throw new Error('아직 기초를 더 준비해야 해요.');
      const won=rng(s)<getOlympiadChance(s);s.olympiadHistory.push({turn:s.turn,year:getPhase(s).year,participated:true,won});shift(s,{intelligence:1.5,research:3,fatigue:6,stress:3});
      if(won){const award={kind:'olympiad',name:'과학 올림피아드 수상',year:getPhase(s).year,turn:s.turn};s.awards.push(award);s.badges.push(award.name);messages.push('어려운 문제를 끝까지 풀어 과학 올림피아드에서 상을 받았다!');}else messages.push('올림피아드 수상에는 이르지 못했지만 새로운 문제를 풀며 많이 배웠다.');
    }else if(typeof c.universityPoints==='number'){
      const i=s.universityInterview;if(!i)throw new Error('진행 중인 대학 면접이 없어요.');i.answers.push(c.label);i.points+=c.universityPoints;
      if(i.answers.length<3)s.pendingEvent=universityQuestionEvent(s);
      else{const u=universities.find(x=>x.id===i.universityId);s.universityInterviews.push({id:i.universityId,name:u.name,answers:[...i.answers],score:i.points});messages.push(`${u.name} 면접을 마쳤다. 답변과 연구 경험이 전형 기록에 남았다.`);s.universityInterview=null;s.pendingEvent=beginUniversityInterviews(s);if(!s.pendingEvent&&s.turn>=39&&!s.admissions)s.pendingEvent=resultsEvent();}
    }else if(c.resolveAdmissions){if(s.universityInterviews.length!==s.applications.length)throw new Error('면접을 먼저 마쳐야 해요.');resolveAdmissions(s);messages.push('대학 전형 결과를 확인했다. 최종 진학을 위해 졸업 요건도 확인하자.');}
    // Generic choice effects also apply to informational and skip choices.
    if(c.effects)shift(s,c.effects);if(c.bond)s.relationships=clamp(s.relationships+c.bond);if(c.harmony)s.dormHarmony=round(clamp(s.dormHarmony+c.harmony));if(c.learning)addLearning(s,c.learning);if(c.project)s.researchProject=c.project;if(c.badge)s.badges.push(c.badge);
    if(c.skipOlympiad)s.olympiadHistory.push({turn:s.turn,year:getPhase(s).year,participated:false,won:false});
    if(e.id==='club_captain')s.captainSelectionDone=true;
    if(!messages.length)messages.push(`${e.title}: ${c.label}.`);
    for(const m of messages)note(s,m,e.id==='emergency'?'emergency':'event');
    if(s.alive&&!c.resolveEmergency&&crisisLimit(s))triggerEmergency(s);
    nextEvent(s);updateEnding(s);
    return{messages,event:s.pendingEvent,resolvedEventId:e.id};
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
  function getAdmissionChance(s,id,answerScore) {
    const u=universities.find(x=>x.id===id);if(!u)throw new Error('대학을 확인해주세요.');
    const p=getProfile(s),rw=u.researchWeight,interview=answerScore===undefined?(s.universityInterviews.find(x=>x.id===id)?.score||0):answerScore;
    const score=p.gpa/4.3*100*(0.78-rw)+s.stats.research*rw+s.stats.discipline*.09+s.stats.leadership*.07+s.stats.social*.06+(s.captain?1:0)+(s.councilHistory.some(h=>h.passed)?1:0)+(s.stats.luck-50)*.04+interview*.35;
    let chance=clamp(1/(1+Math.exp((u.threshold-score)/6.5)),.03,.97);
    if(['kaist','gist','unist','dgist'].includes(id)&&s.awards.some(a=>a.kind==='olympiad'))chance=clamp(Math.max(chance,.91+s.stats.luck*.0004+Math.max(0,interview)*.001),.91,.985);
    return chance;
  }
  function applyUniversities(s,ids){
    assertAlive(s);if(s.turn<32)throw new Error('대학 원서는 3학년 1학기에 접수해요.');if(s.pendingEvent)throw new Error('현재의 사건을 먼저 마쳐 주세요.');
    if(s.applications.length||s.admissions)throw new Error('원서는 이미 제출했어요.');
    if(!Array.isArray(ids)||ids.length<1||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!universities.some(u=>u.id===id)))throw new Error('지원할 대학을 1~3곳 골라 주세요.');
    s.applications=[...ids];s.applicationSnapshot={turn:s.turn,gpa:getProfile(s).gpa,research:s.stats.research};s.admissionStage='applied';
    note(s,`${ids.map(id=>universities.find(u=>u.id===id).name).join(' · ')}에 원서를 제출했다. 학교생활과 연구 경험을 정리했다.`,'admission');
    if(s.turn>=36)s.pendingEvent=beginUniversityInterviews(s);
    return s.applications;
  }
  function resolveAdmissions(s){
    assertAlive(s);if(s.admissions)return s.admissions;
    s.admissions=s.applications.map(id=>{const u=universities.find(x=>x.id===id),chance=getAdmissionChance(s,id),roll=s.admissionRolls[id];return{id,name:u.name,accepted:roll<chance,conditional:true,probability:Math.round(chance*100),reason:'학교생활 기록과 면접 답변을 검토한 가상 전형 결과입니다. 최종 진학은 졸업 요건 충족이 필요합니다.'};});
    s.admissionStage='results';return s.admissions;
  }
  function recordToeic(s){
    const score=clamp(Math.round((290+s.stats.intelligence*4.2+s.stats.luck*.95+s.stats.discipline*.45+Math.min(450,s.toeic.practice*35)+(rng(s)-.5)*140)/5)*5,10,990);
    s.toeic.attempts.push({turn:s.turn,extraWeek:s.extraWeeks,score});s.toeic.best=Math.max(s.toeic.best,score);s.toeic.practice=round(s.toeic.practice+.25);
    return `TOEIC ${score}점. 최고 점수 ${s.toeic.best}점${s.toeic.best>=730?'으로 졸업 영어 기준을 충족했다.':'이며 졸업 기준 730점까지 더 준비할 수 있다.'}`;
  }
  function deferredCheck(s){assertAlive(s);if(s.turn<48||s.ending==='graduated')throw new Error('졸업 요건을 보완하는 기간에 사용할 수 있어요.');if(s.pendingEvent)throw new Error('현재의 사건을 먼저 마쳐 주세요.');}
  function takeToeic(s){deferredCheck(s);s.extraWeeks++;shift(s,{fatigue:9,stress:5});const message=recordToeic(s);note(s,message,'toeic');if(crisisLimit(s))triggerEmergency(s);updateEnding(s);return{messages:[message],event:s.pendingEvent};}
  function prepareToeic(s){deferredCheck(s);s.extraWeeks++;s.toeic.practice=round(s.toeic.practice+1.5);shift(s,{fatigue:-14,stress:-10,discipline:.5});if(s.illnessWeeks)s.illnessWeeks=0;const message='생활 리듬을 회복하며 듣기와 독해를 차근차근 준비했다.';note(s,message,'toeic');updateEnding(s);return{messages:[message],event:s.pendingEvent};}
  const API = { create, migrate, getPhase, getSubjects, actions, advance, chooseEvent, setClubs, chooseElectives, applyUniversities, getProfile, academicClubs, activityClubs, sportsClubs, archetypes, departments, electives, universities, statLabels, getSportsChance, getIllnessRisk, getLeadershipBonus, getCouncilChance, getCaptainChance, councilRoles, getDormStatus, getEmergencySurvivalChance, getTournamentEligibility, getOlympiadChance, getAdmissionChance, takeToeic, prepareToeic };
  root.GSAEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
