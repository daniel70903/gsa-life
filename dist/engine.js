(function (root) {
  'use strict';
  const dailyEvents = root.GSALifeEvents || (typeof require === 'function' ? require('./life-events.js') : []);
  const campusModule = root.GSACampusSystems || (typeof require === 'function' ? require('./campus-systems.js') : null);
  const schoolModule = root.GSASchoolSystems || (typeof require === 'function' ? require('./school-systems.js') : null);
  const tournamentModule = root.GSATournamentSystems || (typeof require === 'function' ? require('./tournament-systems.js') : null);
  const curriculumModule = root.GSACurriculumSystems || (typeof require === 'function' ? require('./curriculum-systems.js') : null);
  const majorModule = root.GSAMajorSystems || (typeof require === 'function' ? require('./major-systems.js') : null);

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
    // v0.13.4: 2026년 광주과학고 학술동아리. field는 학습·진로 분야(정보과학은 'ai').
    { id: 'integral', name: '인테그랄', fieldName: '수학', description: '증명과 문제 해결의 즐거움', field: 'math' },
    { id: 'axiom', name: 'AXIOM', fieldName: '수학', description: '공리에서 출발해 끝까지 밀어붙이는 수학', field: 'math' },
    { id: 'qm', name: 'QM', fieldName: '물리', description: '실험과 이론으로 세상을 설명하는 질문', field: 'physics' },
    { id: 'scv', name: 'SCV', fieldName: '물리·공학', description: '물리 원리를 장치와 설계로 옮겨 보는 시간', field: 'physics' },
    { id: 'psi', name: '프사이', fieldName: '물리', description: '현상 뒤에 숨은 물리 법칙을 파고드는 탐구', field: 'physics' },
    { id: 'chemtech', name: 'CHEMTECH', fieldName: '화학', description: '반응 속에서 발견하는 새로운 가능성', field: 'chemistry' },
    { id: 'kelvin', name: '켈빈', fieldName: '화학', description: '실험대 위에서 확인하는 화학의 원리', field: 'chemistry' },
    { id: 'soma', name: 'SOMA', fieldName: '생명과학', description: '생명의 작은 원리를 탐구하는 시간', field: 'biology' },
    { id: 'biochemi', name: '바이오케미', fieldName: '생명과학', description: '생명 현상을 분자와 반응으로 읽는 탐구', field: 'biology' },
    { id: 'terra', name: 'TERRA', fieldName: '지구과학', description: '땅과 바다, 하늘을 자료로 읽는 탐구', field: 'earth' },
    { id: 'idea', name: '!DEA', fieldName: '정보과학', description: '코드와 데이터로 만드는 새로운 도구', field: 'ai' },
    { id: 'ifex', name: 'Ifex', fieldName: '정보과학', description: '알고리즘과 프로그램으로 문제를 푸는 사람들', field: 'ai' }
  ];
  // 예전 저장·호출의 동아리 id → 2026년 동아리
  const LEGACY_ACADEMIC = { physics: 'qm', math: 'integral', chemistry: 'chemtech', biology: 'soma', ai: 'idea', earth: 'terra' };
  function academicField(s) { const c = academicClubs.find(x => x.id === s.academicClub); return c ? c.field : (s.academicClub || null); }
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
    // v0.13: 실제 이공계 모집단위를 참고한 14개 대학. 합격 확률은 게임 규칙이며 실제 입시 결과가 아닙니다.
    // pctTarget: 학년 누적 석차 백분위 기준점(높을수록 어려움). exempt: 수시 6장 제한과 별도로 지원하는 과학기술원.
    { id: 'seoul', name: '서울대학교', group: 'sky', difficulty: '최상', description: '학업 성취와 깊이 있는 면접을 함께 보는 가장 어려운 도전', pctTarget: 0.79, researchWeight: 0.03, interview: true, cap: 0.92 },
    { id: 'yonsei', name: '연세대학교', group: 'sky', difficulty: '매우 높음', description: '학업 성취와 전공에 대한 설명이 필요한 도전', pctTarget: 0.3, researchWeight: 0.03 },
    { id: 'korea', name: '고려대학교', group: 'sky', difficulty: '매우 높음', description: '꾸준한 학업 성취와 사고력을 함께 보는 도전', pctTarget: 0.3, researchWeight: 0.03 },
    { id: 'kaist', name: 'KAIST', group: 'science', difficulty: '매우 높음', description: '연구와 문제 해결에 무게를 둔 과학기술원 · 수시 6장과 별도 · 고등학교 과정 이수만으로 진학 가능', pctTarget: 0.36, researchWeight: 0.045, interview: true, exempt: true, completionOk: true, unit: '새내기과정학부(무학과)' },
    { id: 'postech', name: 'POSTECH', group: 'science', difficulty: '매우 높음', description: '집중적인 탐구 경험을 보는 이공계 특성화 대학 · 수시 6장에 포함', pctTarget: 0.4, researchWeight: 0.045, interview: true, unit: '무은재학부' },
    { id: 'gist', name: 'GIST', group: 'science', difficulty: '높음', description: '과학 탐구와 성장 가능성을 보는 과학기술원 · 수시 6장과 별도', pctTarget: 0.16, researchWeight: 0.04, interview: true, exempt: true, unit: '기초교육학부(무학과)' },
    { id: 'unist', name: 'UNIST', group: 'science', difficulty: '높음', description: '융합 탐구 경험을 보는 과학기술원 · 수시 6장과 별도', pctTarget: 0.14, researchWeight: 0.04, exempt: true, unit: '이공계열(무학과)' },
    { id: 'dgist', name: 'DGIST', group: 'science', difficulty: '높음', description: '융합 과학과 탐구를 함께 보는 과학기술원 · 수시 6장과 별도', pctTarget: 0.14, researchWeight: 0.04, interview: true, exempt: true, unit: '기초학부(무학과)' },
    { id: 'sungkyunkwan', name: '성균관대학교', group: 'seoul', difficulty: '높음', description: '학업과 전공의 연결을 설명하는 경로', pctTarget: 0.18, researchWeight: 0.03 },
    { id: 'sogang', name: '서강대학교', group: 'seoul', difficulty: '높음', description: '개념의 이해와 논리적인 설명을 보는 경로', pctTarget: 0.16, researchWeight: 0.03 },
    { id: 'hanyang', name: '한양대학교', group: 'seoul', difficulty: '높음', description: '배운 지식을 문제 해결에 연결하는 경로', pctTarget: 0.16, researchWeight: 0.03 },
    { id: 'chungang', name: '중앙대학교', group: 'seoul', difficulty: '중상', description: '학업의 꾸준함과 진로 계획을 보는 경로', pctTarget: 0.06, researchWeight: 0.03 },
    { id: 'kyunghee', name: '경희대학교', group: 'seoul', difficulty: '중상', description: '학업과 다양한 탐구 경험을 함께 보는 경로', pctTarget: 0.04, researchWeight: 0.03 },
    { id: 'uos', name: '서울시립대학교', group: 'seoul', difficulty: '중상', description: '학업의 기초와 공공에 대한 질문을 보는 경로', pctTarget: 0.04, researchWeight: 0.03 },
    // 예전 저장에서 이미 지원한 대학만 결과를 계산합니다(새 원서에는 나오지 않음).
    { id: 'hufs', name: '한국외국어대학교', group: 'seoul', legacy: true, difficulty: '중상', description: '이전 버전 지원 기록', pctTarget: 0.02, researchWeight: 0.03 },
    { id: 'konkuk', name: '건국대학교', group: 'seoul', legacy: true, difficulty: '중간', description: '이전 버전 지원 기록', pctTarget: 0, researchWeight: 0.03 },
    { id: 'dongguk', name: '동국대학교', group: 'seoul', legacy: true, difficulty: '중간', description: '이전 버전 지원 기록', pctTarget: 0, researchWeight: 0.03 },
    { id: 'hongik', name: '홍익대학교', group: 'seoul', legacy: true, difficulty: '중간', description: '이전 버전 지원 기록', pctTarget: 0, researchWeight: 0.03 },
    { id: 'chonnam', name: '전남대학교', group: 'regional', legacy: true, difficulty: '중간', description: '이전 버전 지원 기록', pctTarget: -0.1, researchWeight: 0.03 }
  ];
  // 모집단위 이름(서울대는 학부·학과, 그 외는 일반적인 학과명). 과기원·POSTECH은 무학과 단위로 뽑습니다.
  const UNIT_NAMES = {
    seoul: { physics: '물리·천문학부', chemistry: '화학부', biology: '생명과학부', math: '수리과학부', earth: '지구환경과학부', computer: '컴퓨터공학부', mechanical: '기계공학부', electrical: '전기·정보공학부', materials: '재료공학부', bioengineering: '화학생물공학부', ai: '컴퓨터공학부', data: '통계학과', general: '자유전공학부' },
    default: { physics: '물리학과', chemistry: '화학과', biology: '생명과학과', math: '수학과', earth: '지구과학 계열', computer: '컴퓨터공학과', mechanical: '기계공학부', electrical: '전자전기공학부', materials: '신소재공학부', bioengineering: '생명공학과', ai: '인공지능학과', data: '데이터사이언스 계열', general: '자연계열 자유전공' }
  };
  // 학과별 경쟁 차이(점수 단위). 컴퓨터·AI·전기전자는 더 치열합니다.
  const MAJOR_DIFFICULTY = { computer: 0.45, ai: 0.45, electrical: 0.3, data: 0.2, mechanical: 0.1, bioengineering: 0.1, biology: 0.05, materials: 0, chemistry: 0, math: 0, physics: -0.05, earth: -0.25, general: 0 };
  const APPLICATION_LIMIT = 6;
  function unitName(universityId, majorId) {
    const u = universities.find(x => x.id === universityId);
    if (u && u.unit) return u.unit;
    return (UNIT_NAMES[universityId] || UNIT_NAMES.default)[majorId || 'general'] || UNIT_NAMES.default.general;
  }
  const originalAdmissionIds = ['seoul', 'kaist', 'postech', 'gist', 'unist', 'dgist', 'chonnam'];
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
    { id: 'toeic', name: 'TOEIC 응시', icon: 'book', description: '1학년 2학기부터 응시할 수 있어요. 졸업 기준은 730점이에요.', effectsText: '영어 성적 기록 · 피로도 ↑ · 스트레스 ↑' },
    { id: 'rest', name: '충분히 쉬기', icon: 'moon', description: '잠을 충분히 자고 다음 주의 여유를 만들어요.', effectsText: '피로도 ↓↓ · 회복력 ↑ · 스트레스 ↓↓' }
  ];
  const focuses = [
    { id: 'balanced', name: '균형 성장', description: '수업·관계·활동과 휴식을 고르게 배분해요.', effectsText: '여러 능력의 고른 성장 · 안정적인 생활 리듬' },
    { id: 'intelligence', name: '지능', description: '개념을 연결하고 낯선 문제를 깊게 생각하는 데 집중해요.', effectsText: '지능 중심 성장 · 교과 이해 향상' },
    { id: 'social', name: '사회성', description: '친구들의 이야기를 듣고 함께하는 시간을 더 가져요.', effectsText: '사회성 중심 성장 · 관계와 기숙사 생활 개선' },
    { id: 'athletics', name: '운동', description: '일상 운동과 팀 훈련에서 기초 기술을 다져요.', effectsText: '운동 중심 성장 · 체력과 회복력 향상' },
    { id: 'discipline', name: '자기관리', description: '계획과 수면, 공부 습관을 꾸준히 지켜요.', effectsText: '자기관리 중심 성장 · 피로와 스트레스 조절' },
    { id: 'research', name: '연구 역량', description: '실험과 자료 분석에 집중하며 나만의 질문을 발전시켜요.', effectsText: '연구 역량 중심 성장 · 창의성과 탐구 경험 향상' },
    { id: 'leadership', name: '리더십', description: '학급과 동아리에서 의견을 모으고 역할을 맡아 봐요.', effectsText: '리더십 중심 성장 · 협업과 소통 경험 향상' },
    { id: 'english', name: '영어 준비', description: '평소 일과 속에서 듣기와 독해 연습을 늘려요.', effectsText: 'TOEIC 준비도 중심 성장 · 영어 교과 이해 향상' },
    { id: 'recovery', name: '회복', description: '필수 일과를 가볍게 이어가며 잠과 휴식에 충분히 시간을 써요.', effectsText: '피로·스트레스 크게 감소 · 아픈 몸 회복' }
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
  // v0.13: 실제 공통과목 편성(1학년 1학기~2학년 1학기). kind: ms = 수학·과학 이론(수행 40 · 중간 30 · 기말 30),
  // lab = 실험(중간고사 없음, 수행 60 · 기말 40), gen = 국어·영어·사회 등(수행 60 · 지필 40),
  // art = 음악·미술·체육(시험 없음, 수행만), pf = 연구활동(시험 없음, 이수/미이수, 평점 제외).
  const coreTables = {
    0: [['korean1', '국어Ⅰ', 3, 'language', 'gen'], ['english1', '영어Ⅰ', 3, 'language', 'gen'], ['pe1', '체육Ⅰ', 1, 'arts', 'art'], ['music1', '음악과 생활', 1, 'arts', 'art'], ['art1', '미술 창작', 1, 'arts', 'art'], ['math1', '수학Ⅰ', 3, 'math', 'ms'], ['math2', '수학Ⅱ', 3, 'math', 'ms'], ['physics1', '물리학Ⅰ', 3, 'physics', 'ms'], ['physicslab1', '물리학실험Ⅰ', 1, 'physics', 'lab'], ['chemistry1', '화학Ⅰ', 3, 'chemistry', 'ms'], ['chemistrylab1', '화학실험Ⅰ', 1, 'chemistry', 'lab'], ['biology1', '생명과학Ⅰ', 3, 'biology', 'ms'], ['biologylab1', '생명과학실험Ⅰ', 1, 'biology', 'lab'], ['earth1', '지구과학Ⅰ', 3, 'earth', 'ms'], ['info1', '정보과학Ⅰ', 2, 'ai', 'ms'], ['basicresearch1', '기초자율연구Ⅰ', 3, 'research', 'pf']],
    1: [['korean2', '국어Ⅱ', 3, 'language', 'gen'], ['english2', '영어Ⅱ', 3, 'language', 'gen'], ['pe2', '체육Ⅱ', 1, 'arts', 'art'], ['music2', '음악의 이해', 1, 'arts', 'art'], ['art2', '미술 감상', 1, 'arts', 'art'], ['math3', '수학Ⅲ', 3, 'math', 'ms'], ['math4', '수학Ⅳ', 3, 'math', 'ms'], ['physics2', '물리학Ⅱ', 3, 'physics', 'ms'], ['physicslab2', '물리학실험Ⅱ', 1, 'physics', 'lab'], ['chemistry2', '화학Ⅱ', 3, 'chemistry', 'ms'], ['chemistrylab2', '화학실험Ⅱ', 1, 'chemistry', 'lab'], ['biology2', '생명과학Ⅱ', 3, 'biology', 'ms'], ['biologylab2', '생명과학실험Ⅱ', 1, 'biology', 'lab'], ['earth2', '지구과학Ⅱ', 3, 'earth', 'ms'], ['info2', '정보과학Ⅱ', 2, 'ai', 'ms'], ['basicresearch2', '기초자율연구Ⅱ', 3, 'research', 'pf']],
    2: [['literature1', '문학Ⅰ', 3, 'language', 'gen'], ['economics', '경제', 3, 'society', 'gen'], ['grammar', '고급영문법', 2, 'language', 'gen'], ['conversation1', '영어회화Ⅰ', 1, 'language', 'gen'], ['pe3', '체육Ⅲ', 1, 'arts', 'art'], ['math5', '미적분', 4, 'math', 'ms'], ['statistics', '확률과 통계', 2, 'math', 'ms'], ['physics3', '물리학Ⅲ', 3, 'physics', 'ms'], ['chemistry3', '화학Ⅲ', 3, 'chemistry', 'ms'], ['biology3', '생명과학Ⅲ', 3, 'biology', 'ms'], ['earth3', '지구과학Ⅲ', 3, 'earth', 'ms'], ['aiprog', '인공지능 프로그래밍', 2, 'ai', 'ms'], ['advresearch1', '심화자율연구Ⅰ', 5, 'research', 'pf']]
  };
  // 학기·과목 유형별 지필 난이도 보정(시뮬레이션으로 맞춘 값). 수행평가는 사건이 없으면 만점이라 지필을 더 어렵게 둡니다.
  const EXAM_CALIBRATION = { 0: { ms: 0, gen: 0 }, 1: { ms: 0, gen: 0 }, 2: { ms: 0, gen: 0 }, 3: { ms: 0, gen: 0 }, 4: { ms: 0, gen: 0 }, 5: { ms: 0, gen: 0 } };
  // 학기·유형별 [반 평균 목표, 실력 차이 폭]. EXAM_PIVOT은 보정 전 평균적인 학생의 점수입니다.
  const EXAM_PIVOT = 84;
  const EXAM_SHAPE = { 0:{ms:[74,2.65],gen:[77.5,2.0]}, 1:{ms:[71,2.15],gen:[76,1.7]}, 2:{ms:[66.5,2.5],gen:[74.5,1.9]}, 3:{ms:[66.5,3.0],gen:[72.5,2.3]}, 4:{ms:[61,3.0],gen:[69.5,2.3]}, 5:{ms:[66.5,3.0],gen:[67.5,2.3]} };
  const MATH_SCIENCE = ['math', 'physics', 'chemistry', 'biology', 'earth', 'ai'];
  function courseKind(sub) {
    if (sub.kind) return sub.kind;
    if (sub.field === 'research' || sub.category === 'research') return 'pf';
    if (sub.field === 'athletics' || sub.field === 'arts' || /체육|운동과 건강|스포츠|음악|미술/.test(sub.name || '')) return 'art';
    if (MATH_SCIENCE.includes(sub.field) && /실험|실습/.test(sub.name || '')) return 'lab';
    return MATH_SCIENCE.includes(sub.field) ? 'ms' : 'gen';
  }
  function termIndex(s) { return Math.floor(Math.min(s.turn, 41) / 7); }
  // 석차: 저장 시드로 고정된 가상 동기 89명. 학기별 분포는 4.3·4.27 이상 비율과 중앙값으로 정합니다.
  const COHORT_SIZE = 90;
  const COHORT_SHAPE = { 0: [0.02, 0.03, 3.85], 1: [0.02, 0.03, 3.86], 2: [0.03, 0.05, 3.88], 3: [0.07, 0.09, 3.95], 4: [0.1, 0.13, 3.98], 5: [0.09, 0.11, 3.98] };
  function hashUnit(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return ((h >>> 0) + 0.5) / 4294967296;
  }
  function hashNormal(text) { return Math.sqrt(-2 * Math.log(hashUnit(text + 'u'))) * Math.cos(2 * Math.PI * hashUnit(text + 'v')); }
  function normalCdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
  function classmateGpa(key, i, term) {
    const [s43, s427, median] = COHORT_SHAPE[Math.max(0, Math.min(5, term))];
    const z = 0.8 * hashNormal(`${key}|a|${i}`) + 0.6 * hashNormal(`${key}|t${term}|${i}`), q = 1 - normalCdf(z);
    const lerp = (a, b, x) => a + (b - a) * Math.max(0, Math.min(1, x));
    let g;
    if (q <= s43) g = 4.3;
    else if (q <= s427) g = lerp(4.29, 4.27, (q - s43) / (s427 - s43));
    else if (q <= 0.12) g = lerp(4.26, 4.16, (q - s427) / (0.12 - s427));
    else if (q <= 0.25) g = lerp(4.16, 4.05, (q - 0.12) / 0.13);
    else if (q <= 0.5) g = lerp(4.05, median, (q - 0.25) / 0.25);
    else if (q <= 0.75) g = lerp(median, median - 0.25, (q - 0.5) / 0.25);
    else if (q <= 0.92) g = lerp(median - 0.25, median - 0.6, (q - 0.75) / 0.17);
    else g = lerp(median - 0.6, median - 1.2, (q - 0.92) / 0.08);
    return Math.round(g * 100) / 100;
  }
  function gradeTermIndex(g) { return (Number(g.year) - 1) * 2 + (Number(g.semester) - 1); }
  function getClassRank(s, upto) {
    const grades = (s.grades || []).filter(g => g && g.year >= 1 && g.year <= 3);
    const index = upto === undefined ? grades.length - 1 : grades.indexOf(upto) >= 0 ? grades.indexOf(upto) : Number(upto);
    const g = grades[index];
    if (!g) return null;
    const key = String(s.seed ?? s.name ?? 'gsa');
    const rankOf = (mine, others) => mine >= 4.3 ? 1 : 1 + others.filter(v => v > mine + 1e-9).length;
    const term = gradeTermIndex(g);
    const mates = Array.from({ length: COHORT_SIZE - 1 }, (_, i) => classmateGpa(key, i, term));
    const used = grades.slice(0, index + 1), weights = used.map(x => x.credits || 1), total = weights.reduce((a, b) => a + b, 0);
    const mine = Math.round(used.reduce((a, x, k) => a + x.gpa * weights[k], 0) / total * 100) / 100;
    const cumMates = Array.from({ length: COHORT_SIZE - 1 }, (_, i) => Math.round(used.reduce((a, x, k) => a + classmateGpa(key, i, gradeTermIndex(x)) * weights[k], 0) / total * 100) / 100);
    return { semester: rankOf(g.gpa, mates), cumulative: rankOf(mine, cumMates), cumulativeGpa: mine, total: COHORT_SIZE, tie: mates.some(v => Math.abs(v - g.gpa) < 0.005), cumulativeTie: cumMates.some(v => Math.abs(v - mine) < 0.005) };
  }
  const clamp = (n, low = 0, high = 100) => Math.max(low, Math.min(high, n));
  const round = n => Math.round(n * 10) / 10;
  function rng(s) { let t = s.rng += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); s.rng >>>= 0; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function seedNumber(value) { if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0; let h = 2166136261; for (const c of String(value)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // v0.13 오버롤: 능력치마다 숨은 잠재력(상한)이 있어, 상한에 가까울수록 덜 오르고 상한을 넘기 어렵습니다.
  const POTENTIAL_STATS = ['intelligence', 'social', 'athletics', 'discipline', 'creativity', 'resilience', 'leadership', 'research'];
  const OVR_WEIGHTS = { intelligence: 0.2, research: 0.16, creativity: 0.14, discipline: 0.14, leadership: 0.1, social: 0.1, resilience: 0.08, athletics: 0.08 };
  const OVR_SHAPE = { base: 4, scale: 1.05, potLow: 66, potSpan: 33, potCurve: 0.45, bonus: 6, floor: 0.3, power: 7, talent: 20, knee: 85, boost: 0.6, ceil: 95, ceilRate: 0.2 };
  function potentialFor(seed, archetypeId, k) {
    let h = 2166136261;
    for (const c of `${seed}|potential|${k}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    const u = ((h >>> 0) + 0.5) / 4294967296;
    const bonus = archetypes.find(a => a.id === archetypeId)?.bonuses?.[k] ? OVR_SHAPE.bonus : 0;
    // 학생마다 전체 잠재력의 높낮이(재능)가 있어 일부는 여러 능력치가 함께 높게 자랍니다.
    let t = 2166136261;
    for (const c of `${seed}|talent`) { t ^= c.charCodeAt(0); t = Math.imul(t, 16777619); }
    t ^= t >>> 13; t = Math.imul(t, 0x5bd1e995); t ^= t >>> 15;
    const talent = ((t >>> 0) + 0.5) / 4294967296 - 0.5;
    return Math.max(50, Math.min(99, Math.round(OVR_SHAPE.potLow + OVR_SHAPE.potSpan * Math.pow(u, OVR_SHAPE.potCurve) + bonus + talent * OVR_SHAPE.talent)));
  }
  function ensurePotential(s) {
    if (s.potential && typeof s.potential === 'object') return s.potential;
    s.potential = {};
    for (const k of POTENTIAL_STATS) s.potential[k] = Math.max(potentialFor(s.seed, s.archetype, k), Math.min(99, Math.round(s.stats?.[k] || 0)));
    return s.potential;
  }
  function getOverall(s) {
    let w = 0;
    for (const [k, weight] of Object.entries(OVR_WEIGHTS)) w += (Number(s.stats?.[k]) || 0) * weight;
    const raw = OVR_SHAPE.base + w * OVR_SHAPE.scale;
    // 최상위 구간은 조금 넓혀 95 이상이 의미 있는 목표가 되게 합니다.
    let v = raw + Math.max(0, raw - OVR_SHAPE.knee) * OVR_SHAPE.boost;
    // 99는 아주 드물게: 상단은 다시 완만하게 눌러 줍니다.
    if (v > OVR_SHAPE.ceil) v = OVR_SHAPE.ceil + (v - OVR_SHAPE.ceil) * OVR_SHAPE.ceilRate;
    return Math.max(1, Math.min(99, Math.round(v)));
  }
  function shift(s, changes) {
    for (const [key, value] of Object.entries(changes)) {
      const k = key === 'health' ? 'fatigue' : key;
      let delta = key === 'health' ? -value : value;
      const pot = s.potential && s.potential[k];
      if (pot && delta > 0) {
        const cur = s.stats[k] || 0;
        delta *= cur >= pot ? 0.05 : Math.max(OVR_SHAPE.floor, 1 - Math.pow(cur / pot, OVR_SHAPE.power));
        if (cur < pot && cur + delta > pot) delta = pot - cur + (cur + delta - pot) * 0.1;
      }
      s.stats[k] = round(clamp((s.stats[k] || 0) + delta, 0, ['fatigue','stress'].includes(k) ? 120 : 100));
    }
    s.stats.health = round(Math.max(0, 100 - s.stats.fatigue));
  }
  function note(s, message, category = 'life') { s.log.unshift({ turn: s.turn, message, category }); }
  const hooks = { rng, shift, note, clamp, round, addLearning, getPhase, getSubjects, assertAlive };
  const campus = campusModule.createAPI(hooks), school = schoolModule.createAPI(hooks), tournaments = tournamentModule.createAPI(hooks);
  const curriculum = curriculumModule.createAPI({ ...hooks, legacySubjects: getLegacySubjects });
  const majors = majorModule.createAPI({ ...hooks, getEvidence: curriculum.getEvidence, universities });
  actions.push(...campus.actions, ...school.actions);
  function create(name = '새로운 학생', seed, options = {}) {
    const randomSeed = seed === undefined ? (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 : seedNumber(seed);
    const s = { version: 6, name: String(name).trim().slice(0, 16) || '새로운 학생', seed: randomSeed, rng: randomSeed, turn: 0, stats: {}, archetype: null, academicClub: null, activityClub: null, sportsClubs: [], sportsTryouts: [], electives: [], grades: [], semesterLearning: {}, midterm: null, pendingEvent: null, councilRole: '일반 학생', councilHistory: [], interview: null, captain: false, captainClub: null, relationships: 10, clubWeeks: 0, councilWeeks: 0, researchWeeks: 0, sportsWeeks: 0, illnessWeeks: 0, illnessCount: 0, researchProject: '아직 연구 주제를 찾는 중', calendarWeeks: 7, courseTable: 2, studyStreak: 0, performanceDeductions: {}, badges: [], log: [], admissions: null, admissionRolls: {}, enrolledUniversity: null };
    Object.assign(s, { alive: true, ending: null, emergency: null, hospitalizations: [], eventQueue: [], dormHarmony: 65, awards: [], tournamentHistory: [], olympiadHistory: [], toeic: { best: 0, attempts: [], practice: 0 }, extraWeeks: 0, applications: [], applicationSnapshot: null, universityInterview: null, universityInterviews: [], admissionStage: 'not_started', dailySeen: [], captainSelectionDone: false, captainHistory: [] });
    const type = archetypes[Math.floor(rng(s) * archetypes.length)]; s.archetype = type.id;
    for (const k of ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership']) s.stats[k] = clamp(32 + Math.floor(rng(s) * 25) + (type.bonuses[k] || 0));
    Object.assign(s.stats, { health: 85, fatigue: 15, stress: 15, research: 8 });
    ensurePotential(s);
    campus.init(s, { legacy: false, gender: options.gender || null }); school.init(s); tournaments.init(s);
    s.focus = 'balanced'; s.lastWeekReport = null;
    curriculum.init(s); s.applicationMajors = {}; s.majorSnapshot = null;
    // Expanding the catalog must not reroll the existing life or its original seven results.
    for (const id of originalAdmissionIds) s.admissionRolls[id] = rng(s);
    ensureAdmissionRolls(s);
    note(s, `${type.name}의 가능성을 안고 광주과학고에 입학했다. 첫 주 운동부 테스트가 기다린다.`, 'milestone');
    return s;
  }
  function getPhase(s) {
    const t = Math.min(s.turn, 41), term = Math.floor(t / 7), week = t % 7 + 1, isDead = s.alive === false, isEnd = isDead || s.turn >= 42, graduationReady = s.turn >= 42 && getGraduationStatus(s).eligible;
    const needsEnrollment = !isDead && s.turn >= 21 && s.turn < 42 && curriculum.needsEnrollment(s);
    const weeksToExam = (week <= 4 ? 4 : 7) - week;
    const nightAvailable = !isEnd && weeksToExam <= 2, dawnAvailable = !isEnd && weeksToExam <= 1;
    const availableStudyModes = ['normal']; if (nightAvailable) availableStudyModes.push('night'); if (dawnAvailable) availableStudyModes.push('dawn', 'both');
    return { year: Math.floor(term / 2) + 1, semester: term % 2 + 1, term, week, exam: isEnd ? null : week === 4 ? 'midterm' : week === 7 ? 'final' : null, isEnd, isDead, needsApplications: !isDead && !needsEnrollment && s.turn >= 35 && !(s.applications || []).length && !s.admissions, graduationPending: !isDead && s.turn >= 42 && !graduationReady, needsGender: !!s.needsGender, needsEnrollment, needsElectives: needsEnrollment, weeksToExam, nightAvailable, dawnAvailable, availableStudyModes, examName: week <= 4 ? '중간고사' : '기말고사', label: isDead ? '이야기의 마지막' : s.turn >= 42 ? graduationReady ? '졸업 · 진학' : '졸업 요건 준비' : `${Math.floor(term / 2) + 1}학년 ${term % 2 + 1}학기 · ${week}주차` };
  }
  function assertAlive(s) { if (s.alive === false) throw new Error('이 이야기는 끝났어요. 새로운 학교생활로 다시 시작할 수 있어요.'); }
  function getDormStatus(s) {
    const harmony = s.dormHarmony === undefined ? 65 : s.dormHarmony;
    const efficiency = harmony < 25 ? 0.72 : harmony < 45 ? 0.86 : 1;
    const base = { label: harmony < 25 ? '갈등으로 지친 기숙사' : harmony < 45 ? '어색한 기숙사 생활' : '안정적인 기숙사 생활', efficiency, description: harmony < 25 ? '친구와 갈등이 쌓여 휴식과 집중이 어려워요. 대화와 관계 회복이 필요해요.' : harmony < 45 ? '서로의 생활 습관을 맞추는 중이에요. 잠과 공부에 조금 영향을 받고 있어요.' : '서로의 공간을 존중하며 하루를 마무리하고 있어요.' };
    if (s.dorm && s.dorm.status === 'expelled') {
      const status = campus.getDormStatus(s);
      return { ...base, ...status, efficiency: Math.min(base.efficiency, status.efficiency === undefined ? 0.85 : status.efficiency) };
    }
    return base;
  }
  function getGraduationStatus(s) {
    const toeicScore = Number(s.toeic && s.toeic.best) || 0, field = school.getFieldStatus(s);
    const fieldCredits = Number(field.total) || 0, toeicPassed = toeicScore >= 730, fieldPassed = fieldCredits >= 6;
    const curriculumStatus = curriculum.getStatus(s), courseRequirements = Array.isArray(curriculumStatus.requirements) ? curriculumStatus.requirements : [];
    const curriculumPassed = !s.curriculum || !!curriculumStatus.legacyExempt || courseRequirements.every(r => r.complete);
    return { toeicScore, toeicRequired: 730, toeicPassed, fieldCredits, fieldRequired: 6, fieldPassed, curriculumPassed, curriculumStatus, eligible: s.alive !== false && !s.emergency && toeicPassed && fieldPassed && curriculumPassed, requirements: [{ id: 'toeic', label: 'TOEIC 730점', current: toeicScore, required: 730, complete: toeicPassed }, { id: 'field', label: '현장연구 6학점', current: fieldCredits, required: 6, complete: fieldPassed }, ...courseRequirements] };
  }
  function getActionDisabledReason(s, id) {
    if (s.alive === false) return '이 이야기는 끝났어요.';
    if (s.turn >= 42) return '졸업 요건 보완 활동을 선택해 주세요.';
    if (!actions.some(a => a.id === id)) return '진행할 활동을 골라 주세요.';
    if (id === 'sports' && !s.sportsClubs.length) return '운동부 테스트에 합격한 뒤 팀 훈련에 참여할 수 있어요.';
    if (id === 'toeic' && s.turn < 7) return 'TOEIC 응시는 1학년 2학기부터 선택할 수 있어요.';
    try { campus.validateAction(s, id); school.validateAction(s, id); } catch (error) { return error.message; }
    return null;
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
    if (s.turn >= 42 && !s.emergency) s.ending = getGraduationStatus(s).eligible ? 'graduated' : 'deferred';
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
  function syncRoleTerms(s, announce = false) {
    if (!Array.isArray(s.captainHistory)) s.captainHistory = [];
    const oldCaptainBadge = (s.badges || []).find(b => typeof b === 'string' && b.endsWith(' 기장'));
    if ((s.captain || oldCaptainBadge) && !s.captainHistory.some(h => h.passed)) {
      s.captainHistory.push({ club: s.captainClub || oldCaptainBadge?.replace(/ 기장$/, '') || '동아리', selectedTurn: 14, expiresTurn: 28, endedTurn: null, passed: true, legacy: true });
    }
    for (const h of s.captainHistory) if (h.passed && s.turn >= 28 && h.endedTurn == null) h.endedTurn = 28;
    if (s.turn >= 28) {
      if (s.captain && announce) note(s, `${s.captainClub || '동아리'} 기장 임기를 마쳤다. 함께 이끈 활동은 학교생활 기록에 남는다.`, 'club');
      s.captain = false; s.captainClub = null;
    }
    if (!Array.isArray(s.councilHistory)) s.councilHistory = [];
    if (s.councilRole && s.councilRole !== '일반 학생' && !s.councilHistory.some(h => h.passed && h.role === s.councilRole)) {
      const year = /부회장|차장/.test(s.councilRole) ? 1 : 2;
      s.councilHistory.push({ year, role: s.councilRole, department: null, passed: true, chance: null, answers: [], legacy: true });
    }
    for (const h of s.councilHistory) if (h.passed) {
      if (h.selectedTurn == null) h.selectedTurn = h.year === 1 ? 7 : 21;
      if (h.expiresTurn == null) h.expiresTurn = h.year === 1 ? 21 : 35;
      if (h.endedTurn === undefined) h.endedTurn = null;
      if (s.turn >= h.expiresTurn && h.endedTurn == null) h.endedTurn = h.expiresTurn;
    }
    const activeCouncil = [...s.councilHistory].reverse().find(h => h.passed && h.role === s.councilRole);
    if (s.councilRole !== '일반 학생' && (s.turn >= 35 || activeCouncil && s.turn >= activeCouncil.expiresTurn)) {
      if (announce) note(s, `${s.councilRole}의 임기를 마쳤다. 학생회 경험은 활동 이력에 남는다.`, 'council');
      s.councilRole = '일반 학생';
    }
    // Old saves may contain an unfinished selection from an already expired term.
    const expiredEvent = e => !!e && ((e.id === 'club_captain' && s.turn >= 28) || (['council_apply', 'council_debate', 'council_interview'].includes(e.id) && (s.turn >= 35 || s.interview?.year === 1 && s.turn >= 21)));
    if (expiredEvent(s.pendingEvent)) s.pendingEvent = null;
    if (Array.isArray(s.eventQueue)) s.eventQueue = s.eventQueue.filter(e => !expiredEvent(e));
    if (s.interview && (s.turn >= 35 || s.interview.year === 1 && s.turn >= 21)) s.interview = null;
  }
  function migrateV2(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 42 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version === 2) return s;
    s.sportsClubs = Array.isArray(s.sportsClubs) ? [...new Set(s.sportsClubs)] : [];
    if (sportsClubs.some(c => c.id === s.activityClub)) { if (!s.sportsClubs.includes(s.activityClub)) s.sportsClubs.push(s.activityClub); s.activityClub = 'none'; }
    for (const k of ['luck', 'creativity', 'resilience']) if (!Number.isFinite(s.stats[k])) s.stats[k] = 50;
    s.stats.fatigue = round(clamp(100 - (Number.isFinite(s.stats.health) ? s.stats.health : 75))); s.stats.health = round(Math.max(0, 100 - s.stats.fatigue));
    s.archetype = s.archetype || 'legacy'; s.sportsTryouts = s.sportsTryouts || []; s.councilHistory = s.councilHistory || [];
    if (s.councilRole && s.councilRole !== '일반 학생' && !s.councilHistory.length) s.councilHistory.push({ year: Math.min(2, getPhase(s).year), role: s.councilRole, department: null, passed: true, chance: null, answers: [], legacy: true });
    if (s.turn >= 35) s.councilRole = '일반 학생';
    s.interview = null; s.illnessWeeks = 0; s.illnessCount = 0; s.sportsWeeks = s.sportsWeeks || 0;
    if (s.pendingEvent && ['council_election', 'club_captain'].includes(s.pendingEvent.id)) s.pendingEvent = s.pendingEvent.id === 'club_captain' ? captainEvent(s) : null;
    if (!s.pendingEvent && [7, 21].includes(s.turn)) s.pendingEvent = councilEvent(s);
    else if (!s.pendingEvent && s.turn === 14) s.pendingEvent = sportsEvent(s, true);
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
      .replace(/[^.!?\n]*(?:(?:운동부|교육감배|메달)[^.!?\n]*(?:가산|보너스|선발 확률|선출 가능성)|(?:선발 확률|선출 가능성))[^.!?\n]*[.!?]?/g, '').trim();
  }
  function migrateV3(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 42 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version === 3) { s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' })); return s; }
    if (s.version !== 2) migrateV2(s);
    const existingEvent = s.pendingEvent;
    Object.assign(s, { alive: true, ending: null, emergency: null, hospitalizations: [], eventQueue: [], dormHarmony: clamp(40 + s.stats.social * 0.4), awards: [], tournamentHistory: [], olympiadHistory: [], toeic: { best: 0, attempts: [], practice: 0 }, extraWeeks: 0, applications: [], applicationSnapshot: null, universityInterview: null, universityInterviews: [], admissionStage: s.admissions ? 'results' : 'not_started', dailySeen: [], captainSelectionDone: s.turn > 14 || !!s.captain });
    s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' }));
    if (!Number.isFinite(s.admissionRolls.dgist)) s.admissionRolls.dgist = seedNumber(`${s.seed}:dgist`) / 4294967296;
    if (s.admissions) { s.admissions = s.admissions.filter(r => r.id !== 'new_path').map(r => ({ ...r, reason: cleanVisibleText(r.reason), conditional: true })); s.applications = s.admissions.map(r => r.id); }
    s.pendingEvent = null;
    if (existingEvent) {
      if (existingEvent.id === 'council_apply') s.pendingEvent = councilEvent(s);
      else if (['council_interview','council_debate'].includes(existingEvent.id) && s.interview) s.pendingEvent = interviewEvent(s);
      else if (existingEvent.id === 'club_captain' && s.turn === 14) s.pendingEvent = captainEvent(s);
      else if (existingEvent.id === 'sports_tryout') s.pendingEvent = sportsEvent(s, s.turn >= 14);
      else if (existingEvent.id !== 'club_captain') s.pendingEvent = existingEvent;
    }
    if (s.turn === 14 && !s.captainSelectionDone) { if (s.pendingEvent) s.eventQueue.push(s.pendingEvent); s.pendingEvent = captainEvent(s); }
    s.version = 3;
    updateEnding(s);
    note(s, '지금까지의 성적과 활동을 이어간다. 졸업 영어 성적은 새 규칙에서 응시해 기록할 수 있다.', 'milestone');
    return s;
  }
  function migrateV4(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 42 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version !== 4) {
      migrateV3(s); campus.migrate(s); school.migrate(s); s.version = 4;
      if (s.alive !== false && s.academicClub) s.eventQueue.push(...school.scheduleEvents(s));
      note(s, '이전 성적과 활동 기록을 그대로 이어간다. 현장연구 학점은 새 활동과 보완 과정에서 이수할 수 있다.', 'milestone');
    }
    s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' }));
    nextEvent(s); updateEnding(s); return s;
  }
  function migrateV5(s) {
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 42 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version !== 5) {
      if (s.version !== 4) migrateV4(s);
      campus.migrate(s); school.migrate(s); tournaments.migrate(s);
      s.focus = focuses.some(f => f.id === s.focus) ? s.focus : 'balanced';
      if (!s.lastWeekReport) s.lastWeekReport = null;
      s.version = 5;
    }
    s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' }));
    nextEvent(s); updateEnding(s); return s;
  }
  // v0.13.2: 한 학기 8주 → 7주(4주차 중간, 7주차 기말). 예전 저장의 주차를 같은 학기 안의 가까운 주로 옮깁니다.
  const TERM_WEEKS = 7, TOTAL_WEEKS = 42;
  function legacyWeekToNew(t) { const term = Math.floor(t / 8), w = t % 8; return term * 7 + (w <= 4 ? w : w <= 6 ? 5 : 6); }
  function convertCalendar(s) {
    if (!s || typeof s !== 'object' || s.calendarWeeks === TERM_WEEKS || !Number.isInteger(s.turn)) return s;
    const seen = new Set();
    const walk = (o) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
      for (const k of Object.keys(o)) {
        const v = o[k];
        if ((k === 'turn' || /Turn$/.test(k) || /Until$/.test(k)) && Number.isInteger(v) && v >= 0 && v <= 48) o[k] = legacyWeekToNew(v);
        else if (v && typeof v === 'object') walk(v);
      }
    };
    walk(s);
    s.studyPlanner = null;
    s.calendarWeeks = TERM_WEEKS;
    return s;
  }
  function migrate(s) {
    convertCalendar(s);
    if (s && s.academicClub && LEGACY_ACADEMIC[s.academicClub]) s.academicClub = LEGACY_ACADEMIC[s.academicClub];
    if (!s || !s.stats || !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 42 || !Array.isArray(s.grades)) throw new Error('저장 데이터를 읽을 수 없어요.');
    if (s.version !== 6) {
      const legacyGraduated = s.turn >= 42 && s.ending === 'graduated';
      if (s.version !== 5) migrateV5(s);
      curriculum.migrate(s, { legacyGraduated });
      if (!s.applicationMajors || typeof s.applicationMajors !== 'object') s.applicationMajors = {};
      for (const id of s.applications || []) if (!s.applicationMajors[id]) s.applicationMajors[id] = 'general';
      if (!s.majorSnapshot) s.majorSnapshot = (s.applications || []).length ? { version: 1, submittedTurn: s.applicationSnapshot?.turn ?? s.turn, legacy: true, evidence: { courses: [], byField: {} }, applicationMajors: { ...s.applicationMajors }, applications: s.applications.map(id => ({ universityId: id, majorId: s.applicationMajors[id], majorName: majors.getMajor(s.applicationMajors[id])?.name || '자유 탐색', fitScore: 0 })) } : null;
      s.version = 6;
    }
    if (s.courseTable !== 2 && s.turn % 7 === 0 && !s.midterm && !Object.keys(s.semesterLearning || {}).length) s.courseTable = 2;
    if (!s.performanceDeductions || typeof s.performanceDeductions !== 'object') s.performanceDeductions = {};
    if (typeof s.studyStreak !== 'number') s.studyStreak = 0;
    ensurePotential(s);
    ensureAdmissionRolls(s);
    campus.migrate(s);
    syncRoleTerms(s);
    s.log = (s.log || []).map(l => ({ ...l, message: cleanVisibleText(l.message) || '학교생활의 한 순간을 기록했다.' }));
    nextEvent(s); updateEnding(s); return s;
  }
  function getLegacySubjects(s) {
    if (s.turn < 21) return s.courseTable === 2 ? coreTables[termIndex(s)].map(([id, name, credits, field, kind]) => ({ id, name, credits, field, kind, difficulty: 2 })) : core.map(x => ({ ...x }));
    return [core[0], core[4], core[5], ...(s.electives || []).map(id => electives.find(e => e.id === id)).filter(Boolean), { id: 'research', name: '융합 탐구', field: 'research', credits: 4 }].map(x => ({ ...x }));
  }
  function getSubjects(s) { return curriculum.getSubjects(s) || getLegacySubjects(s); }
  function setClubs(s, academicId, activityId) {
    assertAlive(s);
    if (s.turn !== 0 || s.academicClub) throw new Error('동아리는 입학할 때 한 번 선택할 수 있어요.');
    if (LEGACY_ACADEMIC[academicId]) academicId = LEGACY_ACADEMIC[academicId];
    if (!academicClubs.some(c => c.id === academicId) || !activityClubs.some(c => c.id === activityId)) throw new Error('학술동아리와 상설 활동을 각각 골라 주세요.');
    s.academicClub = academicId; s.activityClub = activityId;
    const ac = academicClubs.find(c => c.id === academicId), club = activityClubs.find(c => c.id === activityId);
    note(s, `${ac.name} · ${club.name} 선택. 학교생활을 시작했다.`, 'club');
    s.pendingEvent = sportsEvent(s); s.eventQueue.push(...school.scheduleEvents(s));
    return s;
  }
  function enrollSemester(s, ids) { assertAlive(s); return curriculum.enroll(s, ids); }
  function chooseElectives(s, ids) { return enrollSemester(s, ids); }
  function getTournamentEligibility(s) { return tournaments.getEligibility(s); }
  function tournamentEvent(s) { return tournaments.startEvent(s); }
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
    const majorId = s.applicationMajors && s.applicationMajors[i.universityId] || 'general', major = majors.getMajor(majorId);
    if (majorId !== 'general') questions[0] = majors.firstInterviewQuestion(s, i.universityId, majorId);
    const total = i.total || 3, q = total === 2 && n === 1 ? questions[1] : questions[n], majorName = unitName(i.universityId, majorId);
    return { id: 'university_interview', title: `${u.name} · ${majorName} 면접 · ${n + 1} / ${total}`, description: `${q.title} — ${q.question}`, choices: q.answers.map(([label,points]) => ({ label, description: '내 생각을 면접관에게 설명한다.', universityPoints: points })) };
  }
  function beginUniversityInterviews(s) {
    if (!s.applications.length || s.admissions) return null;
    // 면접이 없는 대학은 서류로만 평가합니다.
    for (const id of s.applications) {
      const u = universities.find(x => x.id === id);
      if (u && !u.interview && !s.universityInterviews.some(i => i.id === id)) { const majorId = s.applicationMajors && s.applicationMajors[id] || 'general'; s.universityInterviews.push({ id, name: u.name, majorId, majorName: unitName(id, majorId), answers: [], score: 0, documentOnly: true }); }
    }
    const next = s.applications.find(id => !s.universityInterviews.some(i => i.id === id));
    if (!next) { s.admissionStage = 'awaiting_results'; return null; }
    s.admissionStage = 'interview'; s.universityInterview = { universityId: next, majorId: s.applicationMajors && s.applicationMajors[next] || 'general', answers: [], points: 0, total: 2 };
    return universityQuestionEvent(s);
  }
  function resultsEvent() { return { id: 'university_results', title: '대학 전형 결과가 도착했다', description: '원서와 학교생활, 면접에서 나눈 이야기를 바탕으로 결과가 도착했다. 합격한 경우에도 졸업 요건을 충족해야 진학할 수 있다.', choices: [{ label: '전형 결과 확인', description: '다음 출발을 확인한다.', resolveAdmissions: true }] }; }
  function scheduleEvents(s) {
    syncRoleTerms(s, true);
    const events = [];
    if ([7,21].includes(s.turn)) { events.push(councilEvent(s)); events.push(tournamentEvent(s)); }
    if (s.turn === 14) { if (!s.captainSelectionDone) events.push(captainEvent(s)); events.push(sportsEvent(s, true)); }
    if ([11,25].includes(s.turn)) events.push(olympiadEvent(s));
    if (s.turn === 38 && s.applications.length) { const e = beginUniversityInterviews(s); if(e) events.push(e); }
    if (s.turn === 40 && s.applications.length && !s.admissions) events.push(resultsEvent());
    if (s.turn === 35) events.push(tournamentEvent(s));
    const milestones = {
      17: { id:'research_topic', title:'나만의 R&E 질문', description:'2학년 연구가 시작됐다. 어떤 질문을 끝까지 붙잡아볼까?', choices:[{label:'실험으로 원리를 검증한다',description:'연구 역량 +8 · 지능 +2',effects:{research:8,intelligence:2},project:'실험으로 검증한 자연의 원리'},{label:'데이터와 코드로 예측한다',description:'연구 역량 +8 · 창의성 +2',effects:{research:8,creativity:2},project:'데이터로 예측하는 세상'}]},
      35: { id:'presentation',title:'연구 발표회',description:'실패한 실험까지 한 장의 포스터로 묶었다. 내 연구를 설명할 시간이다.',choices:[{label:'결과와 한계를 솔직하게 설명한다',description:'연구 역량 +7 · 리더십 +3',effects:{research:7,leadership:3}},{label:'친구들과 역할을 나누어 발표한다',description:'연구 역량 +5 · 사회성 +5',effects:{research:5,social:5},harmony:7}]},
      46: { id:'last_memory',title:'마지막으로 남길 장면',description:'익숙한 교실과 운동장도 조금 다르게 보인다. 어떤 순간을 기억하고 싶을까?',choices:[{label:'친구들과 운동장에서 사진을 찍는다',description:'유대감 +12 · 스트레스 −8',effects:{stress:-8},bond:12,harmony:10},{label:'연구 노트를 후배에게 남긴다',description:'연구 역량 +4 · 리더십 +4',effects:{research:4,leadership:4}},{label:'나에게 3년의 편지를 쓴다',description:'자기관리 +4 · 피로도 −6',effects:{discipline:4,fatigue:-6}}]}
    };
    if(milestones[s.turn]) events.push(milestones[s.turn]);
    events.push(...school.scheduleEvents(s));
    if (s.turn < 42 && s.turn % 7 !== 0 && (s.turn % 7 === 1 || s.turn % 7 === 4)) { const w = plannerWindow(s); if (!s.studyPlanner || s.studyPlanner.key !== w.key) events.push(plannerEvent(s)); }
    if (s.turn >= 7 && s.turn < 42 && (s.toeic.best || 0) < 730 && (s.toeic.practice || 0) >= 5 && !s.toeicBooked && s.turn - (s.toeicOfferTurn ?? -99) >= 4 && ![3, 6].includes(s.turn % 7)) { s.toeicOfferTurn = s.turn; events.push(toeicOfferEvent(s)); }
    // v0.13 일상 사건: 대부분 선택지 없이 지나가고 주간 보고서에 남습니다. 가끔 하나만 직접 고릅니다.
    if (!events.some(e => !e.contestId) && s.turn < 42 && s.turn !== 35 && rng(s) < 0.74 && dailyEvents.length) {
      const count = 1 + (rng(s) < 0.45 ? 1 : 0) + (rng(s) < 0.15 ? 1 : 0), interactive = rng(s) < 0.3;
      for (let n = 0; n < count; n++) {
        let pool = dailyEvents.filter(e => (e.context !== 'sports' || s.sportsClubs.length) && (e.context !== 'research' || s.turn >= 7) && !s.dailySeen.slice(-12).includes(e.id));
        if (s.dormHarmony < 40 && rng(s) < 0.55) { const dorm = pool.filter(e => e.context === 'dorm'); if(dorm.length)pool=dorm; }
        if (!pool.length) pool = dailyEvents;
        const event = JSON.parse(JSON.stringify(pool[Math.floor(rng(s) * pool.length)])); s.dailySeen.push(event.id);
        if (n === 0 && interactive) { events.push(event); continue; }
        const c = event.choices[Math.floor(rng(s) * event.choices.length)];
        if (c.effects) shift(s, c.effects); if (c.bond) s.relationships = clamp(s.relationships + c.bond); if (c.harmony) s.dormHarmony = round(clamp(s.dormHarmony + c.harmony)); if (c.learning) addLearning(s, c.learning);
        if (!Array.isArray(s.weekDaily)) s.weekDaily = [];
        s.weekDaily.push({ id: event.id, title: event.title, label: c.label });
        note(s, `${event.title}: ${c.label}.`, 'life');
      }
    }
    s.eventQueue.push(...events); nextEvent(s);
  }
  function addLearning(s, n, field) { for (const sub of getSubjects(s)) if (!field || field === sub.field) s.semesterLearning[sub.id] = round((s.semesterLearning[sub.id] || 0) + n); }
  function letter(score) { if (score >= 90) return ['A+', 4.3]; if (score >= 85) return ['A0', 4]; if (score >= 80) return ['A−', 3.7]; if (score >= 75) return ['B+', 3.3]; if (score >= 70) return ['B0', 3]; if (score >= 65) return ['B−', 2.7]; if (score >= 60) return ['C+', 2.3]; if (score >= 55) return ['C0', 2]; if (score >= 50) return ['C−', 1.7]; if (score >= 45) return ['D+', 1.3]; if (score >= 40) return ['D0', 1]; return ['F', 0]; }
  // 과목 점수: 수학·과학은 수행 40 + 중간 30 + 기말 30, 그 외 과목은 수행 60 + 지필 40.
  // 수행평가는 감점 사건이 없으면 만점이고, 연구활동은 이수/미이수로 평점에서 빠집니다.
  function composeSemester(s, scores) {
    const midOf = sub => { const mid = s.midterm && s.midterm.find(m => m.id === sub.id); return mid ? mid.score : sub.score; };
    if (s.courseTable !== 2) return { subjects: scores.map(sub => { const score = round(midOf(sub) * 0.4 + sub.score * 0.6); const [grade, point] = letter(score); return { ...sub, score, grade, point }; }), passFail: [] };
    const cut = s.performanceDeductions || {};
    const subjects = [], passFail = [];
    for (const sub of scores) {
      const kind = courseKind(sub), mid = midOf(sub), fin = sub.score;
      const performance = clamp(100 - (cut['*'] || 0) - (cut[sub.id] || 0));
      // 연구활동은 시험 없이 활동(수행)으로 이수 여부만 정합니다.
      if (kind === 'pf') { passFail.push({ ...sub, kind, performance, score: performance, grade: performance >= 40 ? 'P' : 'F', point: null, passed: performance >= 40 }); continue; }
      let score;
      if (kind === 'art') score = performance;
      else if (kind === 'lab') score = round(performance * 0.6 + fin * 0.4);
      else if (kind === 'ms') score = round(performance * 0.4 + mid * 0.3 + fin * 0.3);
      else score = round(performance * 0.6 + (mid + fin) / 2 * 0.4);
      const [grade, point] = letter(score);
      const exams = kind === 'art' ? {} : kind === 'lab' ? { finalScore: fin } : { midtermScore: mid, finalScore: fin };
      subjects.push({ ...sub, kind, performance, ...exams, score, grade, point });
    }
    return { subjects, passFail };
  }
  function examScores(s, bonus, phase) {
    const healthPenalty = Math.max(0, 55 - s.stats.health) * 0.3;
    const stressPenalty = Math.max(0, s.stats.stress - 40) * 0.14;
    return getSubjects(s).map(sub => {
      const knowledge = Math.max(0, s.semesterLearning[sub.id] || 0);
      // Ordinary lessons plus occasional focused study can reach an A0 average.
      // Further revision has diminishing returns, leaving room for both exam luck
      // and the stronger exam-week study choices without automatic perfect marks.
      const preparation = (Math.min(18, knowledge) + Math.max(0, knowledge - 18) * 0.4) * 0.9;
      const ability = value => Math.min(70, value) + Math.max(0, value - 70) * 0.65;
      const midtermAdjustment = phase.exam === 'midterm' ? 8 : 0;
      const academicAffinity = sub.field === academicField(s) ? 2 : 0;
      const researchBoost = sub.field === 'research' ? s.stats.research * 0.08 + s.stats.creativity * 0.02 : 0;
      const courseDifficulty = Math.max(0, (sub.difficulty || 2) - 2) * 2.2;
      const kindKey = { lab: 'ms', art: 'gen', pf: 'gen' }[courseKind(sub)] || courseKind(sub);
      const calibration = s.courseTable === 2 ? (EXAM_CALIBRATION[termIndex(s)] || EXAM_CALIBRATION[5])[kindKey] || 0 : 0;
      const examFatigue = s.courseTable === 2 ? Math.max(0, s.stats.fatigue - 65) * 0.2 : 0;
      const noise = (rng(s) - 0.5) * 10;
      const raw = 46 - examFatigue + ability(s.stats.intelligence) * 0.17 + ability(s.stats.discipline) * 0.1 + preparation + midtermAdjustment + academicAffinity + researchBoost + bonus - courseDifficulty - healthPenalty - stressPenalty - (s.illnessWeeks > 0 ? 7 : 0) + (s.stats.luck - 50) * 0.04;
      // v0.13 과목표: 반 평균이 실제 시험(어려우면 65점, 쉬우면 70점대 후반, 인문은 조금 높게)처럼 나오도록 평균과 폭을 맞춥니다.
      const shape = s.courseTable === 2 ? (EXAM_SHAPE[termIndex(s)] || EXAM_SHAPE[5])[kindKey] : null;
      const score = round(clamp(shape ? shape[0] + (raw + calibration - EXAM_PIVOT) * shape[1] + noise * 0.8 : raw + calibration + noise));
      return { ...sub, score };
    });
  }
  function getFocus(s) { return focuses.find(f => f.id === s.focus) || focuses[0]; }
  function setFocus(s, id) {
    assertAlive(s); const focus = focuses.find(f => f.id === id);
    if (!focus) throw new Error('이번 주의 성장 방향을 골라 주세요.');
    if (s.turn >= 42) throw new Error('정규 학교생활이 끝난 뒤에는 졸업 요건 보완 활동을 선택해 주세요.');
    s.focus = id; return focus;
  }
  function getCommitmentDisabledReason(s, id) {
    if (id === null || id === undefined || id === '') return null;
    if (!['toeic', 'fieldresearch'].includes(id)) return '예약할 주요 일정을 다시 골라 주세요.';
    return getActionDisabledReason(s, id);
  }
  // v0.13 주간 시간 배분: 방과 후 시간 10칸을 활동별로 나눕니다. 한 곳에 10칸을 몰면 예전 '성장 방향'과 같습니다.
  const PLAN_BLOCKS = 10, WEEK_GAIN = 8 / 7;
  function normalizePlan(input) {
    if (typeof input === 'string') { if (!focuses.some(f => f.id === input)) throw new Error('이번 주의 성장 방향을 골라 주세요.'); return { [input]: PLAN_BLOCKS }; }
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('이번 주 시간 배분을 확인해 주세요.');
    const plan = {}; let total = 0;
    for (const [k, v] of Object.entries(input)) {
      if (!focuses.some(f => f.id === k)) throw new Error('알 수 없는 활동이 시간표에 들어 있어요.');
      const n = Number(v); if (!Number.isInteger(n) || n < 0 || n > PLAN_BLOCKS) throw new Error('활동별 시간은 0~10칸 사이로 정해 주세요.');
      if (n) { plan[k] = n; total += n; }
    }
    if (total !== PLAN_BLOCKS) throw new Error(`방과 후 시간 ${PLAN_BLOCKS}칸을 모두 배분해 주세요. (지금 ${total}칸)`);
    return plan;
  }
  function planLabel(plan) {
    const entries = Object.entries(plan).sort((a, b) => b[1] - a[1]);
    if (entries.length === 1) return focuses.find(f => f.id === entries[0][0]).name;
    return entries.map(([k, n]) => `${focuses.find(f => f.id === k).name} ${n}`).join(' · ');
  }
  function simulateRoutine(s, routine, efficiency, learn, wasSick, messages) {
    const mix = routine.mix || { [routine.focus.id]: 1 }, share = k => mix[k] || 0;
    const id = routine.focus.id, strength = routine.commitment ? 0.65 : 1, light = share('recovery') >= 0.6;
    const rolls = { academic: rng(s), sports: rng(s), activity: rng(s), social: rng(s), duties: rng(s) };
    routine.activities.push('정규 수업과 자습에서 배운 개념을 복습했다.');
    learn(light ? 0.35 : 1.15);
    shift(s, { intelligence: (0.12 + rng(s) * 0.18) * efficiency, discipline: 0.2 + rng(s) * 0.15, resilience: 0.15 });
    s.toeic.practice = round(s.toeic.practice + (light ? 0.05 : 0.15));
    if (!light && rolls.academic < 0.68) {
      s.clubWeeks++; learn(0.9, academicField(s));
      shift(s, { research: 0.9 * efficiency, creativity: 0.3, social: 0.2, fatigue: 1.2 });
      routine.activities.push('학술동아리에서 친구들과 탐구 주제를 나누었다.');
    }
    if (!light && s.sportsClubs.length && rolls.sports < 0.72 + 0.18 * share('athletics')) {
      s.sportsWeeks++; s.clubWeeks++; s.relationships = round(clamp(s.relationships + 1.2));
      shift(s, { athletics: 1.7 * efficiency, social: 0.5, leadership: 0.2, fatigue: 2.8, stress: -1 });
      routine.activities.push(`${s.sportsClubs.map(club => sportsClubs.find(c => c.id === club)?.name || '운동부').join('·')} 훈련에서 기본기와 팀워크를 맞췄다.`);
    }
    if (!light && s.activityClub && s.activityClub !== 'none' && rolls.activity < 0.55) {
      s.clubWeeks++; s.relationships = round(clamp(s.relationships + 1));
      shift(s, { social: 0.7, creativity: 0.3, fatigue: 0.6, stress: -1.5 });
      routine.activities.push('상설동아리 활동을 친구들과 함께 준비했다.');
    }
    if (rolls.social < 0.84) {
      s.relationships = round(clamp(s.relationships + 1.3 + 1.7 * share('social')));
      s.dormHarmony = round(clamp(s.dormHarmony + (s.stats.social < 35 ? 1 : 2)));
      shift(s, { social: 0.4, stress: -2 });
      routine.activities.push('식사와 쉬는 시간에 친구들의 이야기를 들었다.');
    }
    if (!light && rolls.duties < 0.65 && (s.councilRole !== '일반 학생' || s.classRole !== '일반 학생')) {
      s.councilWeeks++; shift(s, { leadership: 0.7, social: 0.2, fatigue: 0.7 });
      routine.activities.push('학생회와 학급에서 맡은 역할을 챙겼다.');
    }
    // Regular sleep and breaks are part of every simulated routine; extra exam study still adds strain afterward.
    shift(s, { fatigue: -(7 + s.stats.resilience * 0.035), stress: -4.5 });
    routine.activities.push(light ? '필수 일과를 줄이고 충분히 잠을 자며 쉬었다.' : '정해진 시간에 잠들고 짧은 휴식으로 생활 리듬을 지켰다.');
    const growthTable = {
      balanced: { intelligence: 0.5, social: 0.5, athletics: 0.5, discipline: 0.6, creativity: 0.3, research: 0.5, leadership: 0.3, fatigue: 1.8, stress: -1 },
      intelligence: { intelligence: 2.6, discipline: 0.5, creativity: 0.4, fatigue: 3.8, stress: 2 },
      social: { social: 3.2, leadership: 0.5, fatigue: 0.5, stress: -4 },
      athletics: { athletics: 3.6, resilience: 0.9, social: 0.3, fatigue: 4.2, stress: -2 },
      discipline: { discipline: 3, resilience: 0.4, intelligence: 0.3, fatigue: -3, stress: -3 },
      research: { research: 4.2, creativity: 1, intelligence: 0.5, fatigue: 4, stress: 2.5 },
      leadership: { leadership: 3.3, social: 0.8, discipline: 0.3, fatigue: 2, stress: 0.5 },
      english: { discipline: 0.8, intelligence: 0.4, fatigue: 2.5, stress: 1 },
      recovery: { fatigue: -(17 + s.stats.resilience * 0.07), stress: -17, resilience: 0.8, discipline: 0.3 }
    };
    const growth = {};
    for (const [k, w] of Object.entries(mix)) for (const [key, value] of Object.entries(growthTable[k])) growth[key] = (growth[key] || 0) + value * w;
    // v0.13.2: 학기가 8주 → 7주로 줄어든 만큼 한 주의 성장을 8/7배로 맞춥니다.
    shift(s, Object.fromEntries(Object.entries(growth).map(([key, value]) => [key, ['fatigue', 'stress'].includes(key) ? value : value * strength * efficiency * WEEK_GAIN])));
    if (share('intelligence')) learn(2.5 * strength * share('intelligence'));
    if (share('discipline')) learn(0.9 * strength * share('discipline'));
    if (share('research')) { if (share('research') >= 0.3) s.researchWeeks++; learn(0.4 * strength * share('research')); }
    if (share('leadership') >= 0.3) s.councilWeeks++;
    if (share('social')) { s.dormHarmony = round(clamp(s.dormHarmony + 10 * strength * share('social'))); s.relationships = round(clamp(s.relationships + 4 * strength * share('social'))); }
    if (share('english')) { s.toeic.practice = round(s.toeic.practice + 1.4 * strength * efficiency * share('english')); learn(2.4 * strength * share('english'), 'language'); }
    if (light && wasSick) { s.illnessWeeks = 0; messages.push('회복에 집중하며 아픈 몸을 충분히 쉬게 했다.'); }
    routine.activities.push(Object.keys(mix).length > 1 ? `방과 후 시간을 ${routine.label} 비율로 나눠 썼다.` : `${routine.focus.name}에 시간을 더 배분했다.`);
  }
  // v0.13 자습 플래너: 시험 2주 전에 사건으로 열리고, 시험 주까지 3주 × 5일을 날짜별로 정합니다.
  const PLANNER_DAYS = ['월', '화', '수', '목', '금'];
  function plannerWindow(s, turn = s.turn) {
    const t = Math.min(turn, 41), term = Math.floor(t / 7), week = t % 7 + 1, examTurn = term * 7 + (week <= 4 ? 3 : 6);
    return { examTurn, start: examTurn - 2, key: `${term}:${week <= 4 ? 'mid' : 'final'}`, examName: week <= 4 ? '중간고사' : '기말고사' };
  }
  function makePlanner(s, preset) {
    const w = plannerWindow(s), days = [];
    for (let turn = w.start; turn <= w.examTurn; turn++) for (let d = 0; d < 5; d++) {
      const dawnOk = w.examTurn - turn <= 1;
      const night = preset === 'steady' || preset === 'intense' || (preset === 'light' && turn === w.examTurn - 1);
      days.push({ turn, day: d, night, dawn: dawnOk && preset === 'intense' });
    }
    s.studyPlanner = { key: w.key, examTurn: w.examTurn, examName: w.examName, preset, days };
    return s.studyPlanner;
  }
  function plannerFractions(s, turn) {
    const p = s.studyPlanner; if (!p || !Array.isArray(p.days)) return null;
    const days = p.days.filter(d => d.turn === turn); if (!days.length) return null;
    const nights = days.filter(d => d.night).length, dawns = days.filter(d => d.dawn).length;
    return { nights, dawns, night: nights / 5, dawn: dawns / 5 };
  }
  function setStudyPlannerDay(s, turn, day, kind, value) {
    assertAlive(s); const p = s.studyPlanner;
    if (!p) throw new Error('아직 자습 플래너가 열리지 않았어요.');
    if (!['night', 'dawn'].includes(kind)) throw new Error('심야 또는 새벽을 골라 주세요.');
    const d = p.days.find(x => x.turn === turn && x.day === day); if (!d) throw new Error('플래너에 없는 날짜예요.');
    if (turn < s.turn) throw new Error('이미 지난 날짜는 바꿀 수 없어요.');
    if (kind === 'dawn' && p.examTurn - turn > 1) throw new Error('새벽자습은 시험 1주 전부터 할 수 있어요.');
    d[kind] = !!value; p.preset = 'custom'; return p;
  }
  // v0.13.1: 날짜별 대신 주 단위로 정합니다. level = none | night | both(심야+새벽, 시험 1주 전부터)
  function setStudyPlannerWeek(s, turn, level) {
    assertAlive(s); const p = s.studyPlanner;
    if (!p) throw new Error('아직 자습 플래너가 열리지 않았어요.');
    if (!['none', 'night', 'both'].includes(level)) throw new Error('없음·심야·심야+새벽 중에서 골라 주세요.');
    const days = p.days.filter(x => x.turn === turn); if (!days.length) throw new Error('플래너에 없는 주예요.');
    if (turn < s.turn) throw new Error('이미 지난 주는 바꿀 수 없어요.');
    if (level === 'both' && p.examTurn - turn > 1) throw new Error('새벽자습은 시험 1주 전부터 할 수 있어요.');
    for (const d of days) { d.night = level !== 'none'; d.dawn = level === 'both'; }
    p.preset = 'custom'; return p;
  }
  function plannerWeekLevel(s, turn) { const f = plannerFractions(s, turn); if (!f) return null; return f.dawns ? 'both' : f.nights ? 'night' : 'none'; }
  function plannerEvent(s) {
    const w = plannerWindow(s);
    return { id: 'study_planner', title: `자습 플래너 · ${w.examName} 2주 전`, description: `${w.examName}까지 3주 남았다(시험 주 포함). 주마다 심야자습, 또는 심야+새벽자습(시험 1주 전부터)을 정할 수 있다. 고른 계획은 홈 화면에서 주마다 바꿀 수 있다. 연달아 무리하면 효과가 줄고, 시험 날 너무 피곤하면 점수가 깎인다.`, choices: [
      { label: '막판에: 시험 전 주에만 심야자습', description: '준비도 ↑ · 피로 ↑', plannerPreset: 'light' },
      { label: '꾸준히: 3주 동안 매일 심야자습', description: '준비도 ↑↑ · 피로 ↑↑', plannerPreset: 'steady' },
      { label: '전력으로: 매일 심야 + 마지막 2주 새벽까지', description: '준비도 최대 · 피로·응급실 위험 큼', plannerPreset: 'intense' },
      { label: '일단 비워 두고 주마다 정한다', description: '홈 화면에서 주별로 고른다', plannerPreset: 'custom' }
    ] };
  }
  function toeicOfferEvent(s) {
    return { id: 'toeic_offer', title: 'TOEIC, 이번에 볼까?', description: `영어 준비가 꽤 쌓였다(준비도 ${round(s.toeic.practice)}). 다음 주에 TOEIC을 보러 갈까? 졸업에는 730점이 필요하다.${s.toeic.best ? ` 지금 최고점은 ${s.toeic.best}점.` : ''}`, choices: [
      { label: '다음 주에 응시한다', description: '시험 당일 피로 +8 · 스트레스 +5', toeicBook: true },
      { label: '조금 더 준비하고 본다', description: '몇 주 뒤에 다시 물어본다', toeicLater: true }
    ] };
  }
  function advance(s, actionId, studyMode = 'normal') { return runWeek(s, actionId, studyMode, null); }
  function simulateWeek(s, focusId, studyMode = 'normal', commitment = null) {
    assertAlive(s);
    const plan = normalizePlan(focusId), dominant = Object.entries(plan).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
    const focus = focuses.find(f => f.id === dominant), label = planLabel(plan);
    const mix = Object.fromEntries(Object.entries(plan).map(([k, n]) => [k, n / PLAN_BLOCKS]));
    if (commitment === '') commitment = null;
    if (!commitment && s.toeicBooked) { commitment = getCommitmentDisabledReason(s, 'toeic') ? null : 'toeic'; }
    s.toeicBooked = false;
    const disabled = getCommitmentDisabledReason(s, commitment); if (disabled) throw new Error(disabled);
    const before = { ...s.stats }, beforeMoney = s.money.balance, routine = { focus, mix, label, commitment, activities: [] };
    if (typeof focusId === 'object') s.plan = { ...plan };
    const result = runWeek(s, 'routine', studyMode, routine), deltas = {};
    for (const key of Object.keys(s.stats)) { const delta = round(s.stats[key] - (before[key] || 0)); if (delta) deltas[key] = delta; }
    s.lastWeekReport = { turn: s.turn, focusId: dominant, plan, focusName: label, dailyEvents: s.weekDaily.slice(), activities: routine.activities, deltas, moneyDelta: s.money.balance - beforeMoney, eventCount: (s.pendingEvent ? 1 : 0) + s.eventQueue.length, eventsResolved: 0, commitment };
    return { ...result, report: s.lastWeekReport };
  }
  function runWeek(s, actionId, studyMode = 'normal', routine = null) {
    assertAlive(s);
    const p = getPhase(s);
    if (p.isEnd) throw new Error('3년의 이야기가 끝났어요. 진학 결과를 확인해 주세요.');
    if (s.pendingEvent) throw new Error('먼저 지금의 사건에서 선택해 주세요.');
    if (!s.academicClub) throw new Error('입학할 때 동아리를 먼저 골라 주세요.');
    if (p.needsEnrollment) throw new Error('이번 학기 수강신청을 먼저 마쳐 주세요.');
    if (p.needsApplications) throw new Error('3학년 2학기 원서 접수를 먼저 마쳐 주세요.');
    const disabledReason = routine ? getCommitmentDisabledReason(s, routine.commitment) : getActionDisabledReason(s, actionId); if (disabledReason) throw new Error(disabledReason);
    if (actionId === 'toeic' && s.turn < 7) throw new Error('TOEIC 응시는 1학년 2학기부터 선택할 수 있어요. 준비는 1학년부터 가능해요.');
    if (!p.availableStudyModes.includes(studyMode)) throw new Error('심야자습은 시험 2주 전부터, 새벽자습은 1주 전부터 선택할 수 있어요.');
    const messages = [], action = routine ? { name: `${routine.focus.name}에 집중한 한 주` } : actions.find(a => a.id === actionId), wasSick = s.illnessWeeks > 0, recovering = actionId === 'rest' || !!(routine && (routine.mix ? (routine.mix.recovery || 0) >= 0.6 : routine.focus.id === 'recovery'));
    s.weekDaily = [];
    if (routine) s.focus = routine.focus.id;
    const plannerWeek = studyMode === 'normal' ? plannerFractions(s, s.turn) : null;
    s.dormHarmony = round(clamp(s.dormHarmony + (s.stats.social < 35 ? -4 : s.stats.social < 50 ? -1.5 : 1)));
    if (s.stats.social < 35) s.relationships = round(clamp(s.relationships - (s.dormHarmony < 45 ? 2 : 0.5)));
    const dorm = getDormStatus(s);
    if (dorm.efficiency < 1) { shift(s, { fatigue: 2, stress: 2 }); messages.push(s.dorm && s.dorm.status === 'expelled' ? '통학에 쓰는 시간과 피로 때문에 공부에 집중할 여유가 줄었다.' : '기숙사 관계가 불편해 잠과 공부에 집중하기 어려웠다.'); }
    const courseLoad = curriculum.workload(s);
    const efficiency = (wasSick ? 0.72 : 1) * dorm.efficiency * courseLoad.learningMultiplier;
    if (courseLoad.fatigueExtra || courseLoad.stressExtra) { shift(s, { fatigue: courseLoad.fatigueExtra, stress: courseLoad.stressExtra }); if (routine) routine.activities.push(`${courseLoad.totalCredits}학점의 수업과 과제를 계획에 맞춰 진행했다.`); }
    const learn = (n, field) => addLearning(s, n * efficiency, field);
    learn(1.35 + s.stats.discipline * 0.004);
    shift(s, { fatigue: 2, stress: 1 });
    if (routine) simulateRoutine(s, routine, efficiency, learn, wasSick, messages);
    else switch (actionId) {
      case 'study': learn(2.4); shift(s, { intelligence: 0.7, discipline: 1.2, fatigue: 4, stress: 6 }); break;
      case 'research': s.researchWeeks++; learn(0.65); shift(s, { research: (3.5 + s.stats.creativity * 0.032) * efficiency, creativity: 0.8, intelligence: 0.5, fatigue: 6, stress: 4 }); break;
      case 'academic': learn(0.7); learn(4.4, academicField(s)); shift(s, { research: 2.8 * efficiency, social: 1.3, creativity: 0.4, intelligence: 0.4, fatigue: 3, stress: 2 }); s.clubWeeks++; break;
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
    if (routine && routine.commitment === 'toeic') { messages.push(recordToeic(s)); shift(s, { fatigue: 8, stress: 5 }); routine.activities.push('예약한 TOEIC 시험에 응시했다.'); }
    const schoolAction = school.performAction(s, routine ? routine.commitment : actionId);
    if (schoolAction && schoolAction.handled) { messages.push(...(schoolAction.messages || [])); s.eventQueue.push(...(schoolAction.events || [])); if (routine) routine.activities.push('예약한 개별 현장탐사를 마치고 관찰 기록을 완성했다.'); }
    const campusWeek = campus.weekly(s, routine ? 'routine' : actionId, { efficiency, wasSick, focusId: routine && routine.focus.id, commitment: routine && routine.commitment });
    if (campusWeek) { messages.push(...(campusWeek.messages || [])); s.eventQueue.push(...(campusWeek.events || [])); }
    const studyFade = s.courseTable === 2 ? 1 / (1 + 0.35 * (s.studyStreak || 0)) : 1;
    const nightFrac = plannerWeek ? plannerWeek.night : (studyMode === 'night' || studyMode === 'both') ? 1 : 0;
    const dawnFrac = plannerWeek ? plannerWeek.dawn : (studyMode === 'dawn' || studyMode === 'both') ? 1 : 0;
    if (s.courseTable === 2) s.studyStreak = nightFrac + dawnFrac > 0 ? (s.studyStreak || 0) + 1 : 0;
    if (nightFrac > 0) { learn((s.courseTable === 2 ? 3.0 : 3.8) * studyFade * nightFrac); shift(s, { fatigue: 11 * nightFrac, stress: 6 * nightFrac }); messages.push(plannerWeek ? `플래너대로 심야자습 ${plannerWeek.nights}일. 피로도 +${round(11 * nightFrac)}.` : '심야자습으로 시험 준비도를 충분히 쌓았다. 피로도 +11.'); }
    if (dawnFrac > 0) { learn((s.courseTable === 2 ? 2.1 : 2.7) * studyFade * dawnFrac); shift(s, { fatigue: 7 * dawnFrac, stress: 4 * dawnFrac, discipline: 0.5 * dawnFrac }); messages.push(plannerWeek ? `플래너대로 새벽자습 ${plannerWeek.dawns}일. 피로도 +${round(7 * dawnFrac)}.` : '새벽자습으로 시험의 핵심 내용을 다시 정리했다. 피로도 +7.'); }
    const crossedLimit = crisisLimit(s), crisisSnapshot = { fatigue: s.stats.fatigue, stress: s.stats.stress };
    // Fatigue risk is evaluated after the week's choices; new illness affects this week's exam and the next week.
    if (!wasSick && !recovering && rng(s) < getIllnessRisk(s)) { s.illnessWeeks = 2; s.illnessCount++; messages.push('몸살 기운으로 아프기 시작했다. 이번 주와 다음 주 집중력이 떨어진다. 휴식하면 빨리 회복한다.'); }
    if (wasSick && !recovering) messages.push('아직 회복 중이라 이번 주 학습과 훈련 효율이 낮아졌다.');
    let semesterResult = null;
    if (p.exam) {
      const scores = examScores(s, 0, p);
      if (p.exam === 'midterm') { s.midterm = scores; shift(s, { fatigue: -8, stress: -8 }); messages.push('중간고사가 끝나 한숨 돌렸다. 피로도 −8.'); const tested = s.courseTable === 2 ? scores.filter(x => ['ms', 'gen'].includes(courseKind(x))) : scores; messages.push(`중간고사 평균 ${round(tested.reduce((a, x) => a + x.score, 0) / Math.max(1, tested.length))}점. 기말까지 다시 준비할 수 있다.`); }
      else {
        const composed = composeSemester(s, scores);
        const subjects = composed.subjects, passFail = composed.passFail;
        const credits = subjects.reduce((a, x) => a + x.credits, 0), earnedCredits = subjects.filter(x => x.point > 0).reduce((a, x) => a + x.credits, 0) + passFail.filter(x => x.passed).reduce((a, x) => a + x.credits, 0);
        const gpa = Math.round(subjects.reduce((a, x) => a + x.point * x.credits, 0) / credits * 100) / 100;
        semesterResult = { year: p.year, semester: p.semester, gpa, credits, earnedCredits, subjects, gradeScaleVersion: s.courseTable === 2 ? 5 : 4 };
        if (passFail.length) semesterResult.passFail = passFail;
        s.grades.push(semesterResult);
        semesterResult.rank = getClassRank(s);
        s.courseTable = 2; s.studyStreak = 0; s.performanceDeductions = {};
        curriculum.onSemesterEnd(s, semesterResult);
        s.eventQueue.push(...school.onSemesterEnd(s, semesterResult));
        messages.push(`${p.year}학년 ${p.semester}학기 성적 확정: ${gpa.toFixed(2)} / 4.30.`);
        s.semesterLearning = {}; s.midterm = null; shift(s, { fatigue: -20, stress: -16 });
      }
    }
    if (s.illnessWeeks > 0) { s.illnessWeeks--; if (wasSick && s.illnessWeeks === 0 && !recovering) messages.push('몸살 기운이 가라앉았다. 다시 일상을 이어갈 수 있다.'); }
    s.turn++;
    if (s.stats.fatigue > 70) messages.push('피로도가 높아 아플 위험이 커졌다. 수면과 휴식이 필요하다.');
    if (s.stats.stress > 75) messages.push('스트레스가 높다. 친구와의 시간이나 휴식이 필요하다.');
    const studyLabel = plannerWeek && (plannerWeek.nights || plannerWeek.dawns) ? `자습 플래너(심야 ${plannerWeek.nights}일·새벽 ${plannerWeek.dawns}일)` : { normal: '기본 자습', night: '심야자습', dawn: '새벽자습', both: '심야·새벽자습' }[studyMode];
    note(s, `${p.label}: ${action.name} + ${studyLabel}.`, 'activity');
    for (const m of messages) note(s, m, p.exam ? 'grade' : 'life');
    scheduleEvents(s);
    if (routine && s.turn < 42) { s.eventQueue.push(...campus.automaticEvents(s, { focusId: routine.focus.id, commitment: routine.commitment, fromTurn: s.turn - 1 })); nextEvent(s); }
    if (crossedLimit) triggerEmergency(s, crisisSnapshot);
    updateEnding(s);
    if (s.turn === 42 && !s.emergency) { messages.push(getGraduationStatus(s).eligible ? '3년의 과정과 영어·현장연구·선택과목 졸업 요건을 모두 마쳤다.' : '3년의 수업을 마쳤다. 남은 영어·현장연구·선택과목 학점을 보완하면 졸업할 수 있다.'); note(s, messages[messages.length - 1], 'milestone'); }
    return { messages, event: s.pendingEvent, semesterResult };
  }
  function chooseEvent(s, index) {
    assertAlive(s);
    const e = s.pendingEvent;
    if (!e || !Number.isInteger(index) || !e.choices[index]) throw new Error('지금 가능한 선택지를 골라 주세요.');
    const c = e.choices[index], messages = [], reportStats = s.lastWeekReport && s.lastWeekReport.turn === s.turn ? { ...s.stats } : null, reportMoney = s.money && s.money.balance;
    s.pendingEvent = null;
    const campusResult = campus.resolve(s, e, c), schoolResult = campusResult && campusResult.handled ? null : school.resolve(s, e, c);
    const externalResult = campusResult && campusResult.handled ? campusResult : schoolResult && schoolResult.handled ? schoolResult : tournaments.resolve(s, e, c);
    const externallyHandled = externalResult && externalResult.handled;
    if (externallyHandled) { messages.push(...(externalResult.messages || [])); s.eventQueue.unshift(...(externalResult.events || [])); }
    else if (c.resolveEmergency) {
      if (!s.emergency) throw new Error('진행 중인 치료가 없어요.');
      const survived = rng(s) < getEmergencySurvivalChance(s);
      s.hospitalizations.push({ ...s.emergency, survived }); s.emergency = null;
      if (s.courseTable === 2 && survived) { s.performanceDeductions = s.performanceDeductions || {}; s.performanceDeductions['*'] = (s.performanceDeductions['*'] || 0) + 5; }
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
      else{const i=s.interview,chance=getCouncilChance(s,i,i.points),passed=rng(s)<chance;s.councilHistory.push({year:i.year,role:i.role,department:i.department,passed,chance,answers:[...i.answers],answerScore:i.points,...(passed?{selectedTurn:s.turn,expiresTurn:i.year===1?21:35,endedTurn:null}:{})});
        if(passed){s.councilRole=i.role;shift(s,{leadership:7,social:3,stress:3});s.badges.push(`${i.year}학년 ${i.role}`);messages.push(i.department?`${i.role} 면접에 합격했다!`:`학생들의 투표 결과, ${i.role}에 당선됐다!`);}
        else{shift(s,{leadership:2,resilience:2});messages.push(i.department?`${i.role} 면접에서 이번에는 선발되지 않았다.`:`개표 결과, 이번 ${i.role} 선거에서는 당선되지 않았다.`);}s.interview=null;}
    }else if(c.skipCouncil){s.councilHistory.push({year:getPhase(s).year,role:'지원하지 않음',department:null,passed:false,chance:null,answers:[]});messages.push('이번 학생회 모집에는 지원하지 않기로 했다.');}
    else if(c.captainTarget){s.captainSelectionDone=true;const passed=rng(s)<getCaptainChance(s);if(!Array.isArray(s.captainHistory))s.captainHistory=[];s.captainHistory.push({club:c.captainTarget.name,clubId:c.captainTarget.id,selectedTurn:s.turn,expiresTurn:28,endedTurn:null,passed});if(passed){s.captain=true;s.captainClub=c.captainTarget.name;shift(s,{leadership:8,social:3});s.badges.push(`${s.captainClub} 기장`);messages.push(`${s.captainClub} 기장으로 선출됐다! 다음 해의 활동을 준비한다.`);}else{shift(s,{social:2,leadership:2});messages.push(`${c.captainTarget.name} 기장은 다른 친구가 맡았다. 함께하는 팀원으로 계속 성장한다.`);}}
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
      if(won){const award={kind:'olympiad',name:'과학 올림피아드 수상',year:getPhase(s).year,turn:s.turn};s.awards.push(award);s.badges.push(award.name);messages.push('어려운 문제를 끝까지 풀어 과학 올림피아드에서 상을 받았다!');s.eventQueue.unshift(...school.nationalTeamEvents(s,s.olympiadHistory[s.olympiadHistory.length-1]));}else messages.push('올림피아드 수상에는 이르지 못했지만 새로운 문제를 풀며 많이 배웠다.');
    }else if(typeof c.universityPoints==='number'){
      const i=s.universityInterview;if(!i)throw new Error('진행 중인 대학 면접이 없어요.');i.answers.push(c.label);i.points+=c.universityPoints;
      if(i.answers.length<(i.total||3))s.pendingEvent=universityQuestionEvent(s);
      else{const u=universities.find(x=>x.id===i.universityId);s.universityInterviews.push({id:i.universityId,name:u.name,majorId:s.applicationMajors[i.universityId]||'general',majorName:unitName(i.universityId,s.applicationMajors[i.universityId]||'general'),answers:[...i.answers],score:Math.round(i.points*3/(i.total||3))});messages.push(`${u.name} · ${unitName(i.universityId,s.applicationMajors[i.universityId]||'general')} 면접을 마쳤다. 답변과 연구 경험이 전형 기록에 남았다.`);s.universityInterview=null;s.pendingEvent=beginUniversityInterviews(s);if(!s.pendingEvent&&s.turn>=40&&!s.admissions)s.pendingEvent=resultsEvent();}
    }else if(c.resolveAdmissions){if(s.universityInterviews.length!==s.applications.length)throw new Error('면접을 먼저 마쳐야 해요.');resolveAdmissions(s);messages.push('대학 전형 결과를 확인했다. 최종 진학을 위해 졸업 요건도 확인하자.');}
    else if(c.plannerPreset){makePlanner(s,c.plannerPreset);messages.push(c.plannerPreset==='custom'?'자습 플래너를 비워 두고 날짜별로 직접 정하기로 했다.':`자습 플래너를 정했다: ${c.label}.`);}
    else if(c.toeicBook){s.toeicBooked=true;messages.push('다음 주 TOEIC 응시를 예약했다.');}
    else if(c.toeicLater){messages.push('TOEIC은 조금 더 준비한 뒤에 보기로 했다.');}
    // Generic choice effects also apply to informational and skip choices.
    if(!externallyHandled){if(c.effects)shift(s,c.effects);if(c.bond)s.relationships=clamp(s.relationships+c.bond);if(c.harmony)s.dormHarmony=round(clamp(s.dormHarmony+c.harmony));if(c.learning)addLearning(s,c.learning);if(c.project)s.researchProject=c.project;if(c.badge)s.badges.push(c.badge);}
    if(c.skipOlympiad)s.olympiadHistory.push({turn:s.turn,year:getPhase(s).year,participated:false,won:false});
    if(e.id==='club_captain')s.captainSelectionDone=true;
    if(!messages.length)messages.push(`${e.title}: ${c.label}.`);
    for(const m of messages)note(s,m,e.id==='emergency'?'emergency':'event');
    if(s.alive&&!c.resolveEmergency&&crisisLimit(s))triggerEmergency(s);
    nextEvent(s);updateEnding(s);
    if (reportStats) {
      for (const key of Object.keys(s.stats)) { const delta = round(s.stats[key] - (reportStats[key] || 0)); if (delta) s.lastWeekReport.deltas[key] = round((s.lastWeekReport.deltas[key] || 0) + delta); }
      s.lastWeekReport.moneyDelta += (s.money.balance - reportMoney); s.lastWeekReport.eventsResolved++;
      if (String(e.id || '').startsWith('daily_')) { if (!Array.isArray(s.lastWeekReport.dailyEvents)) s.lastWeekReport.dailyEvents = []; s.lastWeekReport.dailyEvents.push({ id: e.id, title: e.title, label: c.label, chosen: true }); }
      s.lastWeekReport.eventCount = Math.max(s.lastWeekReport.eventCount, s.lastWeekReport.eventsResolved + (s.pendingEvent ? 1 : 0) + s.eventQueue.length);
    }
    return{messages,event:s.pendingEvent,resolvedEventId:e.id};
  }

  // v0.13 평가 A: 업적 별(★). 졸업 OVR과 함께 한 판을 비교하는 기준입니다.
  function getAchievements(s) {
    const awards = s.awards || [], has = k => awards.some(a => a.kind === k);
    let rank = null; try { rank = s.grades && s.grades.length ? getClassRank(s) : null; } catch (_) { rank = null; }
    const subjectAwards = awards.filter(a => a.kind === 'subject').length;
    const list = [
      { id: 'valedictorian', label: '최우수 졸업 (누적 석차 3위 이내)', earned: !!(rank && rank.cumulative <= 3 && (s.grades || []).length >= 6) },
      { id: 'president', label: '학생회장', earned: (s.councilHistory || []).some(h => h.passed && /회장/.test(h.role || '') && !/부회장/.test(h.role || '')) },
      { id: 'captain', label: '운동부 기장', earned: !!s.captain || (s.captainHistory || []).some(h => h.passed) },
      { id: 'olympiad', label: '과학 올림피아드 수상', earned: has('olympiad') },
      { id: 'national', label: '올림피아드 국가대표', earned: has('nationalTeam') },
      { id: 'contestGold', label: '교내 대회 금상', earned: awards.some(a => a.kind === 'contest' && a.tier === '금상') },
      { id: 'subjects', label: '교과우수상 8개 이상', earned: subjectAwards >= 8 },
      { id: 'snu', label: '서울대 합격', earned: (s.admissions || []).some(a => a.id === 'seoul' && a.accepted && canEnroll(s, a) !== false) },
      { id: 'ovr95', label: '졸업 OVR 95 이상', earned: s.turn >= 42 && s.alive !== false && getOverall(s) >= 95 }
    ];
    return { stars: list.filter(x => x.earned).length, list };
  }
  // v0.13 평가 B: 커리어 에필로그. 졸업 뒤 이야기를 시드로 고정해 자동으로 씁니다(게임 속 상상입니다).
  const CAREER_PRIZE = { physics: '노벨 물리학상', chemistry: '노벨 화학상', biology: '노벨 생리의학상', earth: '노벨 물리학상', math: '필즈상', ai: '튜링상' };
  function careerRoll(s, key) { return seedNumber(`${s.seed}|career|${key}`) / 4294967296; }
  function getCareer(s) {
    if (s.alive === false || s.turn < 42) return null;
    const ovr = getOverall(s), q = clamp((ovr - 78) / 21, 0, 1), research = (s.stats.research || 0) / 100;
    const field = CAREER_PRIZE[academicField(s)] ? academicField(s) : 'physics', prize = CAREER_PRIZE[field];
    const accepted = (s.admissions || []).filter(a => a.accepted && canEnroll(s, a) !== false), uni = accepted.find(a => a.id === 'seoul') || accepted.find(a => ['kaist', 'postech'].includes(a.id)) || accepted[0];
    const stars = getAchievements(s).stars;
    const timeline = [];
    timeline.push({ age: 19, text: uni ? `${uni.name} ${uni.majorName || ''}에 입학했다.`.replace(' 에', '에') : '재수 끝에 이공계 대학에 입학했다.' });
    const phd = careerRoll(s, 'phd') < 0.3 + 0.6 * q;
    if (!phd) {
      const job = careerRoll(s, 'job') < 0.5 ? '반도체 회사 연구소' : careerRoll(s, 'job2') < 0.5 ? '스타트업 공동창업' : '국책연구소 연구원';
      timeline.push({ age: 27, text: `석사를 마치고 ${job}의 길을 걸었다.` });
      return { field, prize, phd: false, title: '현장의 엔지니어', prizes: 0, youngScientist: false, timeline, ovr, stars };
    }
    timeline.push({ age: 29, text: `${careerRoll(s, 'abroad') < 0.55 ? '해외' : '국내'} 대학원에서 박사 학위를 받았다.` });
    const professor = careerRoll(s, 'prof') < 0.2 + 0.6 * q;
    timeline.push({ age: 34, text: professor ? '대학의 조교수로 임용되어 연구실을 열었다.' : '연구소의 선임연구원이 되어 큰 프로젝트를 이끌었다.' });
    const young = careerRoll(s, 'young') < 0.04 + 0.5 * q * q + 0.03 * stars;
    if (young) timeline.push({ age: 39, text: '젊은과학자상을 받았다.' });
    // 노벨상·필즈상은 아주 드물게(OVR 95+ 최상위에서도 수 % 수준), 두 번째 수상은 더 드뭅니다.
    const base = 0.002 + 0.09 * Math.pow(q, 5) * (0.6 + 0.4 * research) + (young ? 0.01 : 0);
    let prizes = careerRoll(s, 'prize1') < base ? 1 : 0;
    if (prizes && field !== 'math' && careerRoll(s, 'prize2') < 0.08) prizes = 2;
    if (prizes) timeline.push({ age: field === 'math' ? 38 : 58, text: `${prize}을 받았다.${prizes > 1 ? ` 그리고 일흔이 넘어 두 번째 ${prize}까지 받았다.` : ''}` });
    const title = prizes ? '세계가 기억하는 과학자' : young ? '분야를 이끄는 연구자' : professor ? '연구실을 이끄는 교수' : '꾸준한 연구자';
    return { field, prize, phd: true, professor, youngScientist: young, prizes, title, timeline, ovr, stars };
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
  function ensureAdmissionRolls(s) {
    if (!s.admissionRolls || typeof s.admissionRolls !== 'object') s.admissionRolls = {};
    for (const u of universities) if (!Number.isFinite(s.admissionRolls[u.id])) s.admissionRolls[u.id] = seedNumber(`${s.seed}:${u.id}`) / 4294967296;
  }
  function cohortPercentile(s) {
    if (Number.isFinite(s.applicationSnapshot?.percentile)) return s.applicationSnapshot.percentile;
    if (!s.grades || !s.grades.length) return 0.5;
    try { const r = getClassRank(s); return r && r.cumulative ? clamp(1 - (r.cumulative - 1) / (r.total - 1), 0, 1) : 0.5; } catch (_) { return 0.5; }
  }
  function getAdmissionStatus(s, id) {
    const u = universities.find(x => x.id === id); if (!u) throw new Error('대학을 확인해주세요.');
    const snapshot = Number.isFinite(s.applicationSnapshot?.gpa);
    const gpa = clamp(snapshot ? s.applicationSnapshot.gpa : getProfile(s).gpa, 0, 4.3);
    const percentile = cohortPercentile(s);
    const minimumGpa = Number.isFinite(u.minimumGpa) ? u.minimumGpa : null;
    const strictMinimum = !!u.strictMinimum;
    const eligible = minimumGpa === null || (strictMinimum ? gpa > minimumGpa : gpa >= minimumGpa);
    const track = u.exempt ? '과학기술원 · 수시 6장과 별도' : '수시 · 6장 중 1장';
    const requirementText = `${track} · ${u.interview ? '서류 + 면접' : '서류 종합평가'}`;
    return { id, gpa, percentile, snapshot, eligible, minimumGpa, strictMinimum, difficulty: u.difficulty, exempt: !!u.exempt, interview: !!u.interview, requirementText, message: eligible ? '학년 석차, 연구·수상 기록, 면접을 종합해요. 합격은 보장되지 않아요.' : '지원 조건을 충족하지 못했어요.' };
  }
  function admissionRecordScore(s) {
    const awards = s.awards || [];
    const count = kind => awards.filter(a => a.kind === kind).length;
    const school = Math.min(1.2, (count('contest') + count('subject')) * 0.12 + count('model') * 0.1 + count('dormModel') * 0.05);
    const olympiad = awards.some(a => a.kind === 'nationalTeam') ? 1.1 : awards.some(a => a.kind === 'olympiad') ? 0.6 : 0;
    const roles = (s.captain || (s.captainHistory || []).some(h => h.passed) ? 0.2 : 0) + ((s.councilHistory || []).some(h => h.passed) ? 0.2 : 0);
    return school + olympiad + roles - 0.45;
  }
  function getAdmissionChance(s, id, answerScore) {
    const u = universities.find(x => x.id === id), status = getAdmissionStatus(s, id);
    if (!status.eligible) return 0;
    const record = s.universityInterviews.find(x => x.id === id);
    const interview = u.interview ? clamp(answerScore === undefined ? (record?.score || 0) : answerScore, -6, 24) : 0;
    const majorId = s.applicationMajors?.[id] || 'general';
    const research = Number.isFinite(s.applicationSnapshot?.research) ? s.applicationSnapshot.research : s.stats.research;
    // v0.13.2: 원서가 3학년 2학기로 늦춰져 쌓인 기록이 늘어난 만큼 -1.1로 보정합니다.
    const score = -1.1 + (status.percentile - u.pctTarget) * 7.5 + (research - 70) * u.researchWeight + admissionRecordScore(s)
      + (s.stats.discipline - 60) * .01 + (s.stats.luck - 50) * .008
      + (u.interview ? (interview - 10) * .09 : 0)
      + majors.getFit(s, id, majorId, s.majorSnapshot) * .2 - (u.unit ? 0 : (MAJOR_DIFFICULTY[majorId] || 0));
    let chance = clamp(1 / (1 + Math.exp(-score)), .01, u.cap || .97);
    if (u.exempt && s.awards.some(a => a.kind === 'olympiad' || a.kind === 'nationalTeam')) {
      // 올림피아드 수상은 과기원에서 강하지만 학업 기록을 지우지는 못합니다.
      const academicReadiness = 1 / (1 + Math.exp((0.1 - status.percentile) / .05));
      chance = clamp(Math.max(chance, (.92 + Math.max(0, interview) * .002) * academicReadiness), .01, .985);
    }
    return chance;
  }
  function applyUniversities(s,entries){
    assertAlive(s);if(s.turn<35)throw new Error('대학 원서는 3학년 2학기에 접수해요.');if(s.pendingEvent)throw new Error('현재의 사건을 먼저 마쳐 주세요.');
    if(curriculum.needsEnrollment(s))throw new Error('이번 학기 수강신청을 마친 뒤 원서를 제출해 주세요.');
    if(s.applications.length||s.admissions)throw new Error('원서는 이미 제출했어요.');
    const validated=majors.validateApplications(s,entries);
    s.applications=[...validated.applicationIds];s.applicationMajors={...validated.applicationMajors};s.majorSnapshot=validated.majorSnapshot;
    s.applicationSnapshot={turn:s.turn,gpa:getProfile(s).gpa,percentile:cohortPercentile(s),research:s.stats.research,majorSnapshot:s.majorSnapshot};s.admissionStage='applied';
    note(s,validated.applications.map(a=>`${universities.find(u=>u.id===a.universityId).name} · ${unitName(a.universityId,a.majorId)}`).join(' / ')+'에 원서를 제출했다. 2학년 2학기 이수 과목과 지원 경로를 전형 기록으로 남겼다.','admission');
    if(s.turn>=38)s.pendingEvent=beginUniversityInterviews(s);
    return s.applications;
  }
  function resolveAdmissions(s){
    assertAlive(s);if(s.admissions)return s.admissions;
    ensureAdmissionRolls(s);
    s.admissions=s.applications.map(id=>{const u=universities.find(x=>x.id===id),status=getAdmissionStatus(s,id),chance=getAdmissionChance(s,id),roll=s.admissionRolls[id];return{id,name:u.name,majorId:s.applicationMajors[id]||'general',majorName:unitName(id,s.applicationMajors[id]||'general'),hopeMajor:majors.getMajor(s.applicationMajors[id]||'general')?.name||'자유 탐색',accepted:roll<chance,conditional:true,probability:Math.round(chance*100),evaluatedGpa:status.gpa,reason:status.eligible?'원서 제출 당시의 학년 석차와 연구·수상 기록, 면접 답변을 종합한 게임 전형 결과입니다. 최종 진학은 졸업 요건 충족이 필요합니다.':`${status.requirementText} 조건을 충족하지 못했습니다. 실제 대학의 합격 기준이 아닌 게임 규칙입니다.`};});
    s.admissionStage='results';return s.admissions;
  }
  function recordToeic(s){
    const score=clamp(Math.round((290+s.stats.intelligence*4.2+s.stats.luck*.95+s.stats.discipline*.45+Math.min(450,s.toeic.practice*35)+(rng(s)-.5)*140)/5)*5,10,990);
    s.toeic.attempts.push({turn:s.turn,extraWeek:s.extraWeeks,score});s.toeic.best=Math.max(s.toeic.best,score);s.toeic.practice=round(s.toeic.practice+.25);
    return `TOEIC ${score}점. 최고 점수 ${s.toeic.best}점${s.toeic.best>=730?'으로 졸업 영어 기준을 충족했다.':'이며 졸업 기준 730점까지 더 준비할 수 있다.'}`;
  }
  function deferredCheck(s){assertAlive(s);if(s.turn<42||s.ending==='graduated')throw new Error('졸업 요건을 보완하는 기간에 사용할 수 있어요.');if(s.pendingEvent)throw new Error('현재의 사건을 먼저 마쳐 주세요.');}
  function deferredCampusWeek(s, messages) {
    const result = campus.weekly(s, 'deferred', { deferred: true });
    messages.push(...(result.messages || [])); s.eventQueue.push(...(result.events || []));
  }
  function takeToeic(s){deferredCheck(s);s.extraWeeks++;shift(s,{fatigue:9,stress:5});const messages=[recordToeic(s)];deferredCampusWeek(s,messages);for(const message of messages)note(s,message,'toeic');if(crisisLimit(s))triggerEmergency(s);nextEvent(s);updateEnding(s);return{messages,event:s.pendingEvent};}
  function prepareToeic(s){deferredCheck(s);s.extraWeeks++;s.toeic.practice=round(s.toeic.practice+1.5);shift(s,{fatigue:-14,stress:-10,discipline:.5});if(s.illnessWeeks)s.illnessWeeks=0;const messages=['생활 리듬을 회복하며 듣기와 독해를 차근차근 준비했다.'];deferredCampusWeek(s,messages);for(const message of messages)note(s,message,'toeic');if(crisisLimit(s))triggerEmergency(s);nextEvent(s);updateEnding(s);return{messages,event:s.pendingEvent};}
  function setGender(s, value) { assertAlive(s); return campus.setGender(s, value); }
  function getShop(s) { return campus.getShop(s); }
  function buyItem(s, id) {
    assertAlive(s); if (s.pendingEvent) throw new Error('현재의 사건을 먼저 마쳐 주세요.');
    if (s.ending === 'graduated') throw new Error('이미 졸업한 이야기예요.');
    const result = campus.buyItem(s, id);
    if (crisisLimit(s)) triggerEmergency(s); updateEnding(s); return { ...result, event: s.pendingEvent };
  }
  function makeupFieldTrip(s) {
    deferredCheck(s);
    const result = school.makeupFieldTrip(s); s.extraWeeks++; deferredCampusWeek(s, result.messages);
    if (result && result.events) s.eventQueue.push(...result.events);
    for (const message of result.messages || []) note(s, message, 'field');
    if (crisisLimit(s)) triggerEmergency(s); nextEvent(s); updateEnding(s);
    return { ...result, event: s.pendingEvent };
  }
  function makeupCourse(s, id) {
    deferredCheck(s); const result = curriculum.makeupCourse(s, id); s.extraWeeks++;
    if (!Array.isArray(result.messages)) result.messages = [];
    deferredCampusWeek(s, result.messages);
    if (result.events) s.eventQueue.push(...result.events);
    for (const message of result.messages) note(s, message, 'course');
    if (crisisLimit(s)) triggerEmergency(s); nextEvent(s); updateEnding(s);
    return { ...result, event: s.pendingEvent };
  }
    // v0.13.4: 연구(현장연구) 6학점·TOEIC 730점을 못 채워 졸업하지 못하면, 고등학교 과정 이수만으로 받는 대학(KAIST)만 진학할 수 있습니다.
  function canEnroll(s, r) {
    if (!r || !r.accepted) return false;
    const u = universities.find(x => x.id === r.id);
    if (u && u.completionOk) return true;
    return s.turn < 42 ? null : s.ending === 'graduated';
  }
  const API = { canEnroll, academicField, LEGACY_ACADEMIC, TERM_WEEKS, TOTAL_WEEKS, legacyWeekToNew, getAchievements, getCareer, getOverall, ensurePotential, OVR_SHAPE, OVR_WEIGHTS, getClassRank, courseKind, EXAM_CALIBRATION, EXAM_SHAPE, coreTables, create, migrate, getPhase, getSubjects, actions, advance, chooseEvent, setClubs, chooseElectives, applyUniversities, getProfile, academicClubs, activityClubs, sportsClubs, archetypes, departments, electives, universities, statLabels, getSportsChance, getIllnessRisk, getLeadershipBonus, getCouncilChance, getCaptainChance, councilRoles, getDormStatus, getEmergencySurvivalChance, getTournamentEligibility, getOlympiadChance, getAdmissionChance, getAdmissionStatus, unitName, APPLICATION_LIMIT, PLAN_BLOCKS, normalizePlan, planLabel, setStudyPlannerDay, setStudyPlannerWeek, plannerWeekLevel, plannerWindow, plannerFractions, PLANNER_DAYS, takeToeic, prepareToeic, getGraduationStatus, getGrade: letter, getActionDisabledReason, setGender, getShop, buyItem, shopItems: campus.shopItems, campusActions: campus.actions, getRomanceRoster: campus.getRomanceRoster, selectRomanceTarget: campus.selectRomanceTarget, romanceCandidates: campus.romanceCandidates, getDormDiscipline: campus.getDormStatus, getFieldStatus: school.getFieldStatus, makeupFieldTrip, cohortSummary: school.cohortSummary, getClassRoleBonus: school.getClassRoleBonus, focuses, getFocus, setFocus, simulateWeek, getCommitmentDisabledReason, enrollSemester, getEnrollmentOptions: curriculum.getEnrollmentOptions, recommendEnrollment: curriculum.recommendEnrollment, validateEnrollment: curriculum.validateEnrollment, needsEnrollment: curriculum.needsEnrollment, getCurriculumStatus: curriculum.getStatus, getCourseEvidence: curriculum.getEvidence, getCourseWorkload: curriculum.workload, getCourseMakeupOptions: curriculum.getMakeupOptions, makeupCourse, getMajorOptions: majors.getOptions, getMajorsForUniversity: majors.majorsForUniversity, getMajor: majors.getMajor, getMajorInterviewQuestion: majors.getInterviewQuestion, validateMajorApplications: majors.validateApplications };
  root.GSAEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
