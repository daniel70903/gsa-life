(function (root) {
  'use strict';
  const fieldLabels = { physics: '물리', chemistry: '화학', biology: '생명과학', math: '수학', earth: '지구과학', ai: '정보' };
  const majors = [
    { id: 'physics', name: '물리학과', description: '자연의 운동과 상호작용을 탐구하는 희망 전공', requirements: { physics: 4 } },
    { id: 'chemistry', name: '화학과', description: '물질의 성질과 반응을 탐구하는 희망 전공', requirements: { chemistry: 4 } },
    { id: 'biology', name: '생명과학과', description: '생명 현상과 그 원리를 탐구하는 희망 전공', requirements: { biology: 4 } },
    { id: 'math', name: '수학과', description: '추론과 증명으로 수학적 구조를 탐구하는 희망 전공', requirements: { math: 3 } },
    { id: 'earth', name: '지구과학과', description: '지구와 우주의 변화를 탐구하는 희망 전공', requirements: { earth: 3 } },
    { id: 'computer', name: '컴퓨터공학과', description: '알고리즘과 컴퓨터 시스템을 탐구하는 희망 전공', requirements: { ai: 3 } },
    { id: 'mechanical', name: '기계공학과', description: '역학과 수학을 바탕으로 기계와 에너지를 탐구하는 희망 전공', requirements: { physics: 3, math: 3 } },
    { id: 'electrical', name: '전기전자공학과', description: '물리와 정보를 연결해 회로와 신호를 탐구하는 희망 전공', requirements: { physics: 3, ai: 3 } },
    { id: 'materials', name: '신소재공학과', description: '물질의 구조와 성질을 연결하는 희망 전공', requirements: { physics: 3, chemistry: 3 } },
    { id: 'bioengineering', name: '바이오공학과', description: '생명 현상과 화학을 연결해 기술을 탐구하는 희망 전공', requirements: { biology: 3, chemistry: 3 } },
    { id: 'ai', name: '인공지능학과', description: '수학과 정보에 기반한 학습 알고리즘을 탐구하는 희망 전공', requirements: { ai: 3, math: 3 } },
    { id: 'data', name: '데이터과학과', description: '수학적 추론과 데이터 분석을 연결하는 희망 전공', requirements: { ai: 3, math: 3 } },
    { id: 'general', name: '자유탐색', description: '입학 후 다양한 분야를 탐색하는 게임 속 희망 진로', requirements: {} }
  ];
  const questions = {
    physics: { title: '물리학적 모형과 가정', question: '마찰을 무시할 수 있는 수평면에서 같은 힘을 질량이 서로 다른 두 물체에 가했다. 가속도를 비교하려면 무엇을 확인해야 할까?', answers: [['각 물체에 작용하는 알짜힘을 확인하고 a = F / m으로 가속도를 비교한다', 8], ['두 물체의 운동을 측정해 가속도가 어떻게 다른지 비교한다', 4], ['힘이 같으므로 질량과 관계없이 가속도도 항상 같다고 답한다', -2]] },
    chemistry: { title: '화학 반응의 정량적 해석', question: '반응식을 맞춘 뒤 두 반응물의 양을 알고 있다. 생성물의 최대 양을 구하려면 어떤 과정이 필요할까?', answers: [['각 반응물의 몰수를 반응 계수와 비교해 한계 반응물을 찾고 생성물의 이론적 양을 구한다', 8], ['반응물과 생성물 사이의 양적 관계를 반응식으로 살펴본다', 4], ['반응물의 질량이 더 작은 쪽이 언제나 한계 반응물이라고 답한다', -2]] },
    biology: { title: '생명과학 실험의 통제', question: '빛의 세기가 식물의 성장에 미치는 영향을 알아보려 한다. 신뢰할 수 있는 실험을 어떻게 설계할까?', answers: [['빛의 세기만 바꾸고 식물 종류·물·토양·관찰 기간을 통제하며 여러 개체를 반복 비교한다', 8], ['빛이 강한 곳과 약한 곳에서 식물을 키우고 성장량을 비교한다', 4], ['종류가 다른 식물 하나씩을 두고 어느 식물이 더 큰지만 비교한다', -2]] },
    math: { title: '수학적 주장과 반례', question: '미분 가능한 함수에서 f′(a) = 0을 알았다. a가 극대점이나 극소점이라고 바로 결론 낼 수 있을까?', answers: [['바로 결론 낼 수 없으며 도함수의 부호 변화 등을 확인한다. f(x) = x³의 원점은 반례가 된다', 8], ['주변의 함수값을 더 살펴봐야 한다고 설명한다', 4], ['도함수가 0이면 모든 경우에 극대점 또는 극소점이라고 답한다', -2]] },
    earth: { title: '지구과학의 시간 척도', question: '올해 겨울에 유난히 추운 날이 있었다. 이 사실만으로 장기적인 기후 추세를 판단할 수 있을까?', answers: [['하루의 날씨와 장기적인 기후를 구분하고 여러 지역의 장기간 관측 자료와 변동성을 함께 분석한다', 8], ['다른 해의 겨울 자료도 추가로 비교해 본다고 설명한다', 4], ['추운 날이 한 번 있었으므로 장기적인 온난화 추세도 없다고 단정한다', -2]] },
    computer: { title: '알고리즘의 조건과 효율', question: '오름차순으로 정렬된 배열에서 값을 찾을 때 이진 탐색이 효율적인 이유와 필요한 조건은 무엇일까?', answers: [['정렬된 순서를 이용해 매 단계 탐색 범위를 절반으로 줄이므로 비교 횟수가 대략 log₂ n에 비례한다고 설명한다', 8], ['배열의 중간 값과 찾는 값을 비교해 탐색 범위를 줄인다고 설명한다', 4], ['정렬 여부와 관계없이 배열의 가운데 값 하나만 확인하면 항상 찾을 수 있다고 답한다', -2]] },
    mechanical: { title: '역학과 설계 검증', question: '같은 재료로 만든 보 두 개의 처짐을 비교하려 한다. 재료가 같다는 이유만으로 처짐도 같다고 볼 수 있을까?', answers: [['하중·길이·단면 형상·지지 조건을 함께 확인해야 하며 재료가 같아도 휨 강성과 처짐은 달라질 수 있다고 설명한다', 8], ['두 보에 같은 하중을 가해 처짐을 직접 측정하겠다고 설명한다', 4], ['재료가 같으면 보의 길이와 모양이 달라도 처짐은 같다고 답한다', -2]] },
    electrical: { title: '전기 회로의 보존 법칙', question: '전류가 흐르는 회로의 한 분기점에서 들어오는 전류와 나가는 전류의 관계를 어떻게 설명할까?', answers: [['분기점에 전하가 계속 쌓이지 않는 정상 상태에서는 들어오는 전류의 합과 나가는 전류의 합이 같다고 설명한다', 8], ['각 가지의 전류를 측정해 들어오고 나가는 값을 비교한다고 설명한다', 4], ['분기점에서는 전류가 일부 소모되므로 나가는 전류의 합이 항상 작다고 답한다', -2]] },
    materials: { title: '재료의 성질과 측정', question: '두 재료의 탄성계수가 다르다. 탄성계수가 큰 재료가 언제나 더 큰 응력을 견디고 부서질까?', answers: [['탄성계수는 탄성 변형 구간의 강성을 나타내며 항복 강도나 파괴 강도와는 구분해 측정해야 한다고 설명한다', 8], ['각 재료를 변형시키면서 응력과 변형률을 측정해 비교한다고 설명한다', 4], ['탄성계수가 크면 항복과 파괴까지의 강도도 반드시 더 크다고 답한다', -2]] },
    bioengineering: { title: '생명과 화학의 연결', question: '효소 반응에서 온도를 높였더니 반응 속도가 처음에는 증가하다가 높은 온도에서 감소했다. 어떤 가설을 검토할까?', answers: [['온도에 따른 반응 속도 변화와 효소의 구조 변화·변성을 함께 고려하고 조건별 활성을 측정해 가설을 검증한다', 8], ['온도를 여러 단계로 나누어 반응 속도를 다시 측정한다고 설명한다', 4], ['온도가 높아지면 모든 효소 반응은 끝없이 빨라져야 하므로 감소한 자료를 삭제한다고 답한다', -2]] },
    ai: { title: '인공지능 모델의 검증', question: '모델의 설정을 여러 번 바꾸면서 시험용 데이터 성능이 가장 좋은 설정을 골랐다. 이 평가에는 어떤 문제가 있을까?', answers: [['시험용 데이터가 설정 선택에 이용되어 독립성이 깨졌으므로 검증용 데이터로 설정을 고르고 별도 시험 자료로 최종 평가한다고 설명한다', 8], ['새로운 데이터를 더 모아 모델 성능을 다시 확인한다고 설명한다', 4], ['시험용 데이터를 자주 참고할수록 새로운 자료에 대한 성능도 반드시 정확하게 알 수 있다고 답한다', -2]] },
    data: { title: '데이터 해석과 인과관계', question: '아이스크림 판매량과 물놀이 사고 수가 함께 증가하는 자료를 얻었다. 어떤 해석이 타당할까?', answers: [['상관관계만으로 인과관계를 단정할 수 없으며 계절·기온·물놀이 인원 같은 공통 요인을 검토한다고 설명한다', 8], ['더 많은 기간의 자료에서도 같은 관계가 나타나는지 확인한다고 설명한다', 4], ['판매량과 사고가 함께 늘었으므로 아이스크림이 사고를 일으켰다고 단정한다', -2]] },
    general: { title: '수학·과학적 사고', question: '작은 각도로 흔들리는 진자의 주기는 추의 질량을 바꾸어도 거의 같다. 이를 설명하려면 어떤 가정과 관계를 확인해야 할까?', answers: [['운동 방정식에서 질량이 상쇄됨을 보이고 작은 각도와 마찰 무시 가정을 설명한다', 8], ['질량이 다른 추로 여러 번 측정한 결과를 비교한다고 설명한다', 4], ['무거우면 항상 빨리 움직이므로 주기도 짧다고 단정한다', -2]] }
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze); Object.freeze(value);
    }
    return value;
  }
  deepFreeze(majors); deepFreeze(questions); deepFreeze(fieldLabels);
  function getMajor(id) { const found = majors.find(m => m.id === id); return found ? copy(found) : null; }
  function getInterviewQuestion(id) { return questions[id] ? copy(questions[id]) : null; }
  function normalizeEvidence(raw) {
    const byField = Object.fromEntries(Object.keys(fieldLabels).map(field => [field, 0]));
    const courses = [], seen = new Set();
    for (const c of raw && Array.isArray(raw.secondYearSecondTerm) ? raw.secondYearSecondTerm : []) {
      if (!c || c.term !== 3 || c.category !== 'specialist' || c.source === 'makeup' || !Object.hasOwn(fieldLabels, c.field) || !(Number(c.point) > 0) || !Number.isFinite(Number(c.credits)) || Number(c.credits) <= 0 || typeof c.id !== 'string' || seen.has(c.id)) continue;
      seen.add(c.id);
      const row = { id: c.id, name: String(c.name || c.id), field: c.field, credits: Number(c.credits), point: Number(c.point), score: Number.isFinite(Number(c.score)) ? Number(c.score) : null, term: 3, year: 2, semester: 2, category: 'specialist', source: c.source || 'curriculum' };
      courses.push(row); byField[c.field] += row.credits;
    }
    return { courses, secondYearSecondTerm: courses.map(c => ({ ...c })), byField, completedTerms: courses.length ? [3] : [] };
  }
  function describeMajor(major, evidence) {
    const progress = Object.entries(major.requirements).map(([field, required]) => ({ field, label: fieldLabels[field], required, current: evidence.byField[field] || 0, met: (evidence.byField[field] || 0) >= required }));
    const missing = progress.filter(p => !p.met).map(p => `${p.label} 분야 ${p.required - p.current}학점 부족`);
    const unlocked = missing.length === 0;
    const surplus = progress.reduce((sum, p) => sum + Math.max(0, p.current - p.required), 0);
    const fitScore = major.id === 'general' || !unlocked ? 0 : Math.round(Math.min(3, 1.5 + surplus * 0.15) * 100) / 100;
    return { ...copy(major), unlocked, missing, progress, requirementsText: progress.length ? `게임 조건 · 2학년 2학기 전공 선택 이수: ${progress.map(p => `${p.label} ${p.required}학점`).join(' + ')}` : '게임 조건 · 이수 분야와 관계없이 선택 가능', currentProgress: progress.length ? progress.map(p => `${p.label} ${p.current}/${p.required}학점`).join(' · ') : '언제나 선택 가능', fitScore, fitText: major.id === 'general' ? '별도 전공 연계 가산 없음' : `게임 전형 점수에 전공 연계 가산 ${fitScore.toFixed(2)}점` };
  }
  function fit(rawEvidence, majorId) {
    const major = majors.find(m => m.id === majorId);
    return major ? describeMajor(major, normalizeEvidence(rawEvidence)).fitScore : 0;
  }
  function createAPI(hooks = {}) {
    const getEvidence = typeof hooks.getEvidence === 'function' ? hooks.getEvidence : () => ({ secondYearSecondTerm: [] });
    function getOptions(s, evidence) { const normalized = normalizeEvidence(evidence === undefined ? getEvidence(s) : evidence); return majors.map(major => describeMajor(major, normalized)); }
    function universityIds() {
      const source = typeof hooks.universities === 'function' ? hooks.universities() : hooks.universities;
      return Array.isArray(source) ? source.map(u => typeof u === 'string' ? u : u.id) : ['seoul', 'kaist', 'postech', 'gist', 'unist', 'dgist', 'chonnam'];
    }
    function majorsForUniversity(s, universityId) {
      if (!universityIds().includes(universityId)) throw new Error('지원할 대학을 다시 확인해 주세요.');
      return getOptions(s);
    }
    function validateApplications(s, entries) {
      if (s.alive === false) throw new Error('끝난 이야기에서는 지원할 수 없어요.');
      if (s.turn < 32) throw new Error('2학년 2학기를 마친 뒤 희망 전공을 정해 지원할 수 있어요.');
      if (!Array.isArray(entries) || entries.length < 1) throw new Error('지원할 대학과 희망 전공을 1곳 이상 골라 주세요.');
      const normalized = entries.map(entry => typeof entry === 'string' ? { universityId: entry, majorId: 'general' } : entry && typeof entry === 'object' ? { universityId: entry.universityId, majorId: entry.majorId } : null);
      if (normalized.some(entry => !entry || !universityIds().includes(entry.universityId))) throw new Error('지원할 대학을 다시 확인해 주세요.');
      if (normalized.some(entry => typeof entry.majorId !== 'string' || !entry.majorId.trim())) throw new Error('각 대학의 희망 전공을 직접 선택해 주세요.');
      if (new Set(normalized.map(entry => entry.universityId)).size !== normalized.length) throw new Error('한 대학에는 하나의 희망 전공만 정해 주세요.');
      const meta = id => { const source = typeof hooks.universities === 'function' ? hooks.universities() : hooks.universities; return Array.isArray(source) ? source.find(u => u && u.id === id) || {} : {}; };
      if (normalized.some(entry => meta(entry.universityId).legacy)) throw new Error('이번 버전에서는 지원할 수 없는 대학이에요.');
      if (normalized.filter(entry => !meta(entry.universityId).exempt).length > 6) throw new Error('수시 원서는 6장까지예요. 과학기술원(KAIST·GIST·DGIST·UNIST)은 따로 지원할 수 있어요.');
      const evidence = normalizeEvidence(getEvidence(s));
      const options = majors.map(major => describeMajor(major, evidence));
      const applications = normalized.map(entry => {
        const option = options.find(o => o.id === entry.majorId);
        if (!option) throw new Error('존재하는 희망 전공을 선택해 주세요.');
        if (!option.unlocked) throw new Error(`${option.name}의 게임 조건을 아직 충족하지 못했어요. ${option.missing.join(' · ')}`);
        return { universityId: entry.universityId, majorId: option.id, majorName: option.name, fitScore: option.fitScore, requirements: copy(option.requirements), eligible: true };
      });
      const applicationIds = applications.map(a => a.universityId);
      const applicationMajors = Object.fromEntries(applications.map(a => [a.universityId, a.majorId]));
      const majorSnapshot = deepFreeze({ version: 1, submittedTurn: s.turn, evidence: copy(evidence), applications: copy(applications), applicationMajors: { ...applicationMajors } });
      return { applicationIds, applicationMajors, majorSnapshot, applications: copy(applications) };
    }
    function getFit(s, universityId, majorId, frozenSnapshot) {
      const snapshot = frozenSnapshot && (frozenSnapshot.majorSnapshot || frozenSnapshot);
      if (snapshot) {
        const entry = Array.isArray(snapshot.applications) ? snapshot.applications.find(a => a.universityId === universityId && a.majorId === majorId) : null;
        return entry && Number.isFinite(entry.fitScore) ? Math.max(0, Math.min(3, entry.fitScore)) : 0;
      }
      // Older applications without a new snapshot keep their original general path and score.
      if ((s.applications || []).length || s.admissions) return 0;
      return fit(getEvidence(s), majorId);
    }
    function firstInterviewQuestion(s, universityId, majorId) {
      return getInterviewQuestion(majorId || (s.applicationMajors || {})[universityId] || 'general') || getInterviewQuestion('general');
    }
    return { majors, fieldLabels, getOptions, majorsForUniversity, getMajor, getInterviewQuestion, firstInterviewQuestion, fit, getFit, validateApplications, normalizeEvidence };
  }
  const api = { createAPI, majors, fieldLabels, getMajor, getInterviewQuestion, fit, normalizeEvidence };
  root.GSAMajorSystems = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
