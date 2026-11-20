(function (root) {
  'use strict';
  const economyVersion = 2;
  const weeklyAllowance = 5000;
  const shopItems = [
    { id: 'energy', name: '에너지 음료', category: 'drink', price: 3500, description: '짧게 집중을 돕지만 수면을 대신하지 못해요.', effectsText: '피로도 −14 · 다음 주 반동 +9', fatigue: -14, rebound: 9 },
    { id: 'snack', name: '작은 간식', category: 'food', price: 2500, description: '쉬는 시간에 즐기는 소소한 간식이에요.', effectsText: '스트레스 −8 · 피로도 −2', fatigue: -2, stress: -8 },
    { id: 'meal', name: '든든한 식사', category: 'food', price: 5500, description: '끼니를 챙기고 잠깐 쉬어 가요.', effectsText: '피로도 −9 · 스트레스 −3', fatigue: -9, stress: -3 },
    { id: 'milk', name: '따뜻한 우유', category: 'drink', price: 3000, description: '하루를 마치며 천천히 마셔요.', effectsText: '피로도 −4 · 스트레스 −2', fatigue: -4, stress: -2 },
    { id: 'fruit', name: '과일 컵', category: 'food', price: 4500, description: '상큼한 과일로 기분을 환기해요.', effectsText: '피로도 −3 · 스트레스 −5', fatigue: -3, stress: -5 },
    { id: 'tea', name: '허브 차', category: 'drink', price: 4000, description: '차를 마시며 잠시 호흡을 고르는 시간이에요.', effectsText: '스트레스 −10', stress: -10 },
    { id: 'sandwich', name: '샌드위치 도시락', category: 'food', price: 7000, description: '바쁜 날에도 균형 있게 한 끼를 챙겨요.', effectsText: '피로도 −11 · 스트레스 −4', fatigue: -11, stress: -4 },
    { id: 'workbook', name: '교과 문제집', category: 'study', price: 10000, description: '짧은 문제 풀이로 배운 개념을 정리해요.', effectsText: '이번 학기 교과 이해 +1.2 · 피로도 +3', learning: 1.2, fatigue: 3 },
    { id: 'research_notebook', name: '연구 기록 노트', category: 'study', price: 20000, reusable: true, description: '질문과 실험 기록을 꾸준히 쌓는 공책이에요.', effectsText: '연구·학술 활동 시 교과 이해 +0.2' },
    { id: 'sports_tape', name: '스포츠 테이프', category: 'sports', price: 7000, description: '다음 운동 활동을 준비하는 소모품이에요.', effectsText: '다음 운동 활동의 피로도 −5', buff: 'sportsRecovery' },
    { id: 'basketball', name: '연습용 농구공', category: 'sports', price: 35000, reusable: true, description: '친구들과 팀 연습에 사용할 공이에요.', effectsText: '농구부 훈련 시 스트레스 −2' },
    { id: 'shoes', name: '편안한 운동화', category: 'sports', price: 45000, reusable: true, description: '꾸준한 운동을 위한 편안한 장비예요.', effectsText: '개인·운동부 훈련 시 피로도 −1' },
    { id: 'eye_mask', name: '수면 안대', category: 'life', price: 14000, reusable: true, description: '쉬는 날 더 편안하게 휴식해요.', effectsText: '휴식 활동 시 피로도 −2' },
    { id: 'earplugs', name: '집중용 귀마개', category: 'life', price: 12000, reusable: true, description: '공부할 때 주변 소음을 덜어 줘요.', effectsText: '교과·영어 공부 시 스트레스 −1' },
    { id: 'photo_album', name: '추억 사진 인화', category: 'life', price: 8000, description: '함께한 순간들을 작은 앨범에 남겨요.', effectsText: '스트레스 −12 · 유대감 +2', stress: -12, bond: 2 }
  ].map(item => ({ reusable: false, ...item, categoryLabel: { food: '음식', drink: '음료', study: '학습', sports: '운동', life: '생활' }[item.category] }));
  const actions = [
    { id: 'earn', name: '용돈 벌기', icon: 'spark', description: '내가 잘하는 일을 살려 작은 작업과 도움 활동을 해요.', effectsText: '보유금 ↑ · 피로도 ↑ · 한 주 사용' },
    { id: 'romance', name: '마음 나누기', icon: 'heart', description: '또래 친구와 대화하며 서로의 마음을 천천히 알아가요.', effectsText: '관계의 변화 · 서로의 선택을 존중' },
    { id: 'delivery', name: '기숙사 배달', icon: 'ball', description: '기숙사에서 배달 음식을 주문해요. 적발되면 기록이 남아요.', effectsText: '12,000원 · 피로·스트레스 ↓ · 적발 2회 시 퇴사' },
    { id: 'device_dorm', name: '기숙사 전자기기', icon: 'book', description: '기숙사에서 허용되지 않은 시간에 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 피로도 ↑ · 전자기기 적발 누적' },
    { id: 'device_study', name: '자습실 전자기기', icon: 'book', description: '자습실에서 허용되지 않은 용도로 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 학습 효율 ↓ · 전자기기 적발 누적' }
  ];
  const romanceCandidates = [
    { id: 'haneul', name: '하늘', gender: 'female', portraitIndex: 4, personality: '차분한 관찰자', interests: ['천문', '별 관측'], meet: '관측 동아리에서 별자리를 찾던 하늘이 망원경 옆자리를 비워 주었다.', greeting: '오늘 찾은 별자리를 물어본다', chats: ['점심시간에 이번 주 밤하늘에 뜨는 별 이야기를 나누었다.', '구름 때문에 취소된 관측 이야기를 하다가 다음 맑은 날을 기다리기로 했다.'], chatLabel: '다음에 보고 싶은 별을 이야기한다', date: '관측을 마치고 불이 켜진 교정으로 함께 내려왔다.', dateLabel: '하늘을 보며 짧게 산책한다', dateMemory: '교정에서 별을 찾아보며 각자 좋아하는 계절의 이야기를 들었다.' },
    { id: 'seoyun', name: '서윤', gender: 'female', portraitIndex: 1, personality: '꼼꼼한 탐구자', interests: ['연구', '실험'], meet: '실험실 정리를 하던 서윤과 같은 조가 되었다. 실험 노트에 작은 질문이 가득 적혀 있다.', greeting: '실험 노트의 궁금한 점을 물어본다', chats: ['예상과 다른 실험 결과에 대해 서로의 추측을 이야기했다.', '발표 준비를 마치고 가장 재미있었던 실험의 순간을 나누었다.'], chatLabel: '요즘 붙잡고 있는 질문을 나눈다', date: '서윤과 발표 준비를 마치고 잠깐 쉴 시간을 정했다.', dateLabel: '교정을 걸으며 실험 밖의 이야기를 한다', dateMemory: '오늘은 연구 이야기를 잠깐 접어 두고 좋아하는 간식과 주말 이야기를 나누었다.' },
    { id: 'jimin', name: '지민', gender: 'male', portraitIndex: 2, personality: '다정한 독서가', interests: ['책', '도서관'], meet: '도서관에서 같은 책을 찾던 지민과 마주쳤다. 지민이 먼저 읽고 있던 책을 소개한다.', greeting: '읽고 있는 책을 추천해 달라고 한다', chats: ['책에서 마음에 남았던 문장을 서로의 말로 설명해 보았다.', '좋아하는 결말이 서로 달라 한참 웃으며 이야기를 나누었다.'], chatLabel: '최근 읽은 책과 생각을 나눈다', date: '지민과 도서관에서 나와 각자 고른 책을 들고 잠깐 함께 앉았다.', dateLabel: '책 이야기를 하며 짧게 걷는다', dateMemory: '서로 다른 책을 추천하고 다음에 읽은 뒤 감상을 들려주기로 했다.' },
    { id: 'doyoon', name: '도윤', gender: 'male', portraitIndex: 0, personality: '활기찬 팀플레이어', interests: ['농구', '운동'], meet: '체육관에서 공을 정리하던 도윤이 인사를 건넸다. 훈련이 끝난 뒤 잠깐 쉴 시간이 생겼다.', greeting: '오늘 연습은 어땠는지 물어본다', chats: ['연습에서 잘됐던 장면과 아쉬웠던 장면을 편하게 이야기했다.', '다음 경기에서 서로를 응원할 작은 약속을 만들었다.'], chatLabel: '운동과 학교생활 이야기를 나눈다', date: '도윤과 연습을 마친 뒤 물을 마시며 서로의 일정을 맞춰 보았다.', dateLabel: '운동장을 짧게 걸으며 쉰다', dateMemory: '오늘의 연습을 웃으며 돌아보고, 다음 날 시험 준비도 서로 응원했다.' },
    { id: 'sion', name: '시온', gender: 'male', portraitIndex: 5, personality: '재치 있는 문제해결사', interests: ['코딩', '게임'], meet: '정보실에서 프로그램을 정리하던 시온이 뜻밖의 오류를 보여 주었다. 둘 다 같은 부분에서 웃음이 났다.', greeting: '만들고 있는 프로그램을 물어본다', chats: ['엉뚱한 오류를 찾은 경험을 이야기하며 함께 웃었다.', '언젠가 만들고 싶은 작은 게임의 규칙을 서로 제안했다.'], chatLabel: '만들고 싶은 게임 이야기를 한다', date: '시온과 작업을 마치고 화면에서 눈을 떼며 쉬어 갈 방법을 정했다.', dateLabel: '교정을 걸으며 새로운 아이디어를 나눈다', dateMemory: '작은 게임 아이디어를 나누다가 서로 좋아하는 것들을 더 알게 되었다.' },
    { id: 'yujin', name: '유진', gender: 'female', portraitIndex: 3, personality: '밝은 음악친구', interests: ['밴드', '음악'], meet: '동아리 연습을 마친 유진이 복도에서 악보를 정리하고 있다. 흥얼거리던 곡이 귀에 들어왔다.', greeting: '어떤 곡을 연습했는지 물어본다', chats: ['기분에 따라 듣는 노래가 어떻게 다른지 이야기했다.', '다가오는 공연에서 듣고 싶은 곡을 서로 추천했다.'], chatLabel: '요즘 자주 듣는 노래를 나눈다', date: '유진과 연습실을 정리하고 잠깐 함께 쉴 시간을 골랐다.', dateLabel: '좋아하는 곡을 이야기하며 산책한다', dateMemory: '서로 추천한 노래를 기억해 두고 다음 공연을 응원하기로 했다.' }
  ];
  const romanceFields = ['stage', 'bond', 'meetings', 'partnerName', 'lastEventTurn', 'cooldownUntil', 'friendshipOnly', 'lastConfessionTurn'];
  const talentKeys = ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership'];
  function withParticle(name, consonantParticle = '과', vowelParticle = '와') {
    const text = String(name), code = text.charCodeAt(text.length - 1);
    const hasFinalConsonant = code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 !== 0;
    return `${text}${hasFinalConsonant ? consonantParticle : vowelParticle}`;
  }
  function createAPI(hooks) {
    const { rng, shift, note, clamp, round, addLearning } = hooks;
    function assertAlive(s) {
      if (hooks.assertAlive) hooks.assertAlive(s);
      if (s.alive === false) throw new Error('끝난 이야기는 더 진행할 수 없어요.');
    }
    function isTerminal(s) { return s.alive === false || s.ending === 'graduated' || s.ending === 'death'; }
    function weekClock(s) { return s.turn + (s.extraWeeks || 0); }
    function assertSideAction(s, allowPending = false) {
      assertAlive(s);
      if (isTerminal(s)) throw new Error('이번 학교생활의 기록이 마무리되었어요.');
      if (!allowPending && (s.pendingEvent || s.emergency)) throw new Error('지금 진행 중인 사건을 먼저 마무리해 주세요.');
    }
    function ledger(s, amount, reason) {
      s.money.balance += amount;
      s.money.ledger.unshift({ turn: s.turn, amount, reason, balance: s.money.balance });
      if (s.money.ledger.length > 120) s.money.ledger.length = 120;
    }
    function init(s, options = {}) {
      const mean = talentKeys.reduce((sum, key) => sum + (Number.isFinite(s.stats[key]) ? s.stats[key] : 45), 0) / talentKeys.length;
      if (!s.money) {
        const startingBalance = Math.round(clamp(10000 + (65 - mean) * 500, 10000, 25000) / 500) * 500;
        s.financialStrength = round(100 - mean);
        s.money = { balance: startingBalance, startingBalance, allowance: weeklyAllowance, economyVersion, ledger: [{ turn: s.turn, amount: startingBalance, reason: options.legacy ? '이어서 시작하는 생활비' : '입학 생활비', balance: startingBalance }], purchasesThisWeek: 0, purchaseTurn: weekClock(s), lastWeeklyTurn: weekClock(s) - 1, pendingRebound: 0, reboundTurn: null, reboundSchedule: [] };
      }
      // Only future income changes for existing saves. Cash, ownership and
      // historical transaction amounts retain exactly what the player earned.
      if ((s.money.economyVersion || 0) < economyVersion) {
        s.money.allowance = weeklyAllowance;
        s.money.economyVersion = economyVersion;
      }
      if (!Array.isArray(s.money.reboundSchedule)) s.money.reboundSchedule = s.money.pendingRebound > 0 && s.money.reboundTurn !== null ? [{ turn: s.money.reboundTurn, amount: s.money.pendingRebound }] : [];
      if (!Array.isArray(s.money.ownedItems)) s.money.ownedItems = [];
      if (!Array.isArray(s.money.purchasedIdsThisWeek)) s.money.purchasedIdsThisWeek = [];
      if (!s.money.buffs) s.money.buffs = {};
      if (!s.dorm) s.dorm = { status: 'resident', deliveryCaught: 0, electronicsCaught: 0, expelledTurn: null };
      // v0.13.1 단계별 퇴사: 1회 5일(1주) → 10일(2주) → 30일(4주) → 90일(12주) → 영구. 예전 퇴사 저장은 1회 퇴사로 봅니다.
      if (!Number.isFinite(s.dorm.expulsions)) s.dorm.expulsions = s.dorm.status === 'expelled' ? 1 : 0;
      if (!Array.isArray(s.dorm.history)) s.dorm.history = s.dorm.status === 'expelled' ? [{ turn: Number(s.dorm.expelledTurn) || 0, weeks: 1, legacy: true }] : [];
      if (s.dorm.status === 'expelled' && s.dorm.returnTurn === undefined) s.dorm.returnTurn = Math.max((Number(s.dorm.expelledTurn) || 0) + 2, (Number(s.turn) || 0) + 1);
      if (!['male', 'female'].includes(s.gender)) s.gender = ['male', 'female'].includes(options.gender) ? options.gender : null;
      initRomance(s, !options.legacy);
      if (!s.campusOpportunities) s.campusOpportunities = { lastTurn: -10, lastGeneratedTurn: -1, seen: {} };
      s.needsGender = !s.gender;
      return s;
    }
    function newRomanceRecord(person) {
      return { characterId: person.id, partnerName: person.name, stage: 'none', bond: 0, meetings: 0, met: false, lastEventTurn: -10, cooldownUntil: 0, friendshipOnly: false, lastConfessionTurn: -20, lastMemory: '' };
    }
    function mirrorRomance(r) {
      const record = r.records[r.targetId];
      for (const key of romanceFields) r[key] = record[key];
      r.compatibilitySnapshot = Object.fromEntries(romanceFields.map(key => [key, record[key]]));
      r.datingId = romanceCandidates.find(person => r.records[person.id].stage === 'dating')?.id || null;
    }
    function initRomance(s, fresh = false) {
      if (!s.romance) s.romance = { stage: 'none', bond: 0, meetings: 0, partnerName: '하늘', lastEventTurn: -10, cooldownUntil: 0 };
      const r = s.romance;
      if (!r.records || typeof r.records !== 'object') {
        let selected = romanceCandidates.find(person => person.name === r.partnerName) || romanceCandidates[0];
        if (fresh && s.gender && selected.gender === s.gender && r.stage === 'none' && !r.meetings) { selected = romanceCandidates.find(p => p.gender !== s.gender) || selected; r.partnerName = selected.name; }
        r.records = Object.fromEntries(romanceCandidates.map(person => [person.id, newRomanceRecord(person)]));
        r.targetId = selected.id;
        for (const key of romanceFields) if (r[key] !== undefined) r.records[selected.id][key] = r[key];
        r.records[selected.id].met = r.stage !== 'none' || r.meetings > 0;
        r.globalLastEventTurn = Number.isFinite(r.lastEventTurn) ? r.lastEventTurn : -10;
      } else {
        for (const person of romanceCandidates) if (!r.records[person.id]) r.records[person.id] = newRomanceRecord(person);
        if (!romanceCandidates.some(person => person.id === r.targetId)) r.targetId = romanceCandidates[0].id;
        if (s.gender && romanceCandidates.find(p => p.id === r.targetId)?.gender === s.gender) r.targetId = (romanceCandidates.find(p => p.gender !== s.gender) || romanceCandidates[0]).id;
        // The legacy fields are a compatibility view of the preferred person's record.
        // Absorb edits made by older saves before refreshing that view.
        for (const key of romanceFields) {
          if (r[key] !== undefined && (!r.compatibilitySnapshot || r[key] !== r.compatibilitySnapshot[key])) {
            r.records[r.targetId][key] = r[key];
            if (key === 'lastEventTurn' && Number.isFinite(r[key])) r.globalLastEventTurn = Math.max(r.globalLastEventTurn ?? -10, r[key]);
          }
        }
      }
      for (const person of romanceCandidates) {
        const record = r.records[person.id], defaults = newRomanceRecord(person);
        for (const key of Object.keys(defaults)) if (record[key] === undefined) record[key] = defaults[key];
      }
      if (!Array.isArray(r.history)) r.history = [];
      if (!Number.isFinite(r.globalLastEventTurn)) r.globalLastEventTurn = Math.max(-10, ...Object.values(r.records).map(record => Number.isFinite(record.lastEventTurn) ? record.lastEventTurn : -10));
      r.version = 2;
      mirrorRomance(r);
      // Old queued encounters are tied to their original partner rather than a later target change.
      for (const event of [s.pendingEvent, ...(s.eventQueue || [])]) {
        if (event && /^campus_romance_/.test(event.id) && !event.characterId) {
          event.characterId = r.targetId;
          event.portraitIndex = romanceCandidates.find(person => person.id === r.targetId).portraitIndex;
        }
      }
      return r;
    }
    // v0.14 연애: 이성 후보만, 기분(설렘/마음이 무거움), 기념일 사건, DM 창.
    function josa(name, a, b) { const ch = String(name || '').slice(-1).charCodeAt(0); const has = ch >= 0xac00 && ch <= 0xd7a3 && (ch - 0xac00) % 28 !== 0; return name + (has ? a : b); }
    function fillName(text, name) { return String(text || '').replaceAll('{name}이(가)', josa(name, '이', '가')).replaceAll('{name}은(는)', josa(name, '은', '는')).replaceAll('{name}', name); }
    function setMood(s, kind, weeks) { s.mood = { kind, until: s.turn + weeks }; }
    function dmBlock(name, person, lines) { return { app: '광곽톡', name, portraitIndex: person.portraitIndex, messages: lines.map(([from, text]) => ({ from, text })) }; }
    function oppositeCandidates(s) { return romanceCandidates.filter(p => !s.gender || p.gender !== s.gender); }
    const SEASONS = [
      { id: 'whiteday', term: 'even', week: 2, title: '화이트데이', when: () => true },
      { id: 'aprilfools', term: 'even', week: 3, title: '만우절', when: (s, rec) => rec.stage !== 'dating' && rec.bond >= 40 && !s.romance.datingId && (s.romance.relationships || 0) < 2 },
      { id: 'blackday', term: 'even', week: 3, title: '블랙데이', when: (s, rec) => !s.romance.datingId && !(rec.stage !== 'dating' && rec.bond >= 40 && (s.romance.relationships || 0) < 2) },
      { id: 'roseday', term: 'even', week: 5, title: '로즈데이', when: () => true },
      { id: 'confessday', term: 'odd', week: 3, title: '고백데이 · 크리스마스 D-100', when: (s, rec) => rec.stage !== 'dating' && rec.bond >= 45 && (s.romance.relationships || 0) < 2 && !s.romance.datingId },
      { id: 'pepero', term: 'odd', week: 6, title: '빼빼로데이', when: () => true }
    ];
    function seasonEvent(s) {
      if (s.turn >= 42) return null;
      const term = Math.floor(s.turn / 7), week = s.turn % 7 + 1, r = initRomance(s);
      const pool = oppositeCandidates(s), target = pool.find(p => p.id === r.targetId) || pool[0];
      if (!target) return null;
      const rec = r.records[target.id]; r.seasonsSeen = r.seasonsSeen || [];
      // v0.14 2주 단위: 기념일 이벤트는 학기에 하나만. 고백할 수 있는 상황이면 화이트데이보다 만우절을 남겨 둡니다.
      if (r.seasonsSeen.some(k => k.endsWith(`:${term}`))) return null;
      if (week === 2 && term % 2 === 0 && SEASONS.find(x => x.id === 'aprilfools').when(s, rec) && rec.met) return null;
      const sc = SEASONS.find(x => x.week === week && (x.term === 'even' ? term % 2 === 0 : term % 2 === 1) && !r.seasonsSeen.includes(`${x.id}:${term}`) && (rec.met || x.id === 'blackday') && x.when(s, rec));
      if (!sc) return null;
      const key = `${sc.id}:${term}`;
      r.seasonsSeen.push(key);
      const name = rec.partnerName, person = target, dating = rec.stage === 'dating', id = { characterId: person.id, characterName: name, portraitIndex: person.portraitIndex, context: 'romance', id: 'campus_romance_season', season: sc.id };
      if (sc.id === 'whiteday') return { ...id, title: `${sc.title}, 사탕 하나`, description: dating ? `${withParticle(name)} 처음 맞는 화이트데이다.` : `매점에 사탕이 가득하다. ${name} 생각이 난다.`, choices: [
        { label: '사탕과 짧은 응원 쪽지를 건넨다', description: '호감 ↑', campusChoice: 'give', season: { bond: 6, trust: 2, text: '{name}이(가) 쪽지를 읽고 웃었다. 하루 종일 기분이 좋았다.' } },
        { label: '반 친구들과 다 같이 나눠 먹는다', description: '부담 없이 · 사회성 ↑', campusChoice: 'share', season: { bond: 2, effects: { social: 1 }, text: '반 친구들과 사탕을 나눠 먹었다. {name}도 하나 집어 갔다.' } }
      ] };
      if (sc.id === 'aprilfools') return { ...id, title: '만우절, 장난 같은 진심', description: '하루 종일 장난이 이어지는 만우절. 밤에 메시지가 왔다.', seasonBonus: 0.06, dm: dmBlock(name, person, [['them', '오늘 만우절인데 장난 하나도 못 쳤어 ㅋㅋ'], ['them', '너는 오늘 무슨 장난 쳤어?']]), choices: [
        { label: '"사실 나 너 좋아해. …만우절이야" 하고 웃는다', description: '장난처럼 진심을 전한다 · 실패해도 장난으로 넘어갈 수 있다', campusChoice: 'joke-confess', season: { confess: true, soft: true, yes: '"…나도 장난 아닌데." {name}의 답장에 한참 화면을 봤다. 둘은 서로 같은 마음이었다.', no: '"ㅋㅋㅋ 깜짝 놀랐잖아!" {name}은(는) 장난으로 받아들였다. 아직은 때가 아닌가 보다.' } },
        { label: '웃긴 장난 이야기로 답장한다', description: '편하게 · 호감 ↑', campusChoice: 'joke', season: { bond: 4, text: '서로의 장난 이야기로 한참 웃었다.' } }
      ] };
      if (sc.id === 'blackday') return { ...id, characterId: null, title: '블랙데이, 짜장면 모임', description: '연애 이야기는 남의 일인 친구들끼리 짜장면을 먹으러 모였다.', choices: [
        { label: '친구들과 짜장면을 먹으며 수다를 떤다', description: '스트레스 ↓ · 사회성 ↑', campusChoice: 'noodles', season: { effects: { stress: -5, social: 1 }, text: '짜장면 한 그릇에 다 같이 웃었다. 연애는 몰라도 친구는 있다.' } },
        { label: '도서관에서 시험공부를 한다', description: '공부 ↑', campusChoice: 'study', season: { effects: { discipline: 1 }, text: '조용한 도서관에서 공부에 집중했다.' } }
      ] };
      if (sc.id === 'roseday') return { ...id, title: '로즈데이', description: dating ? `${withParticle(name)} 사귀고 처음 맞는 로즈데이다.` : `복도 곳곳에 장미가 보인다. ${name}에게 무언가 해 주고 싶다.`, choices: [
        { label: dating ? '장미 한 송이와 편지를 준비한다' : '꽃 대신 응원 메시지를 보낸다', description: '호감 ↑', campusChoice: 'rose', season: { bond: dating ? 6 : 3, trust: 2, text: dating ? '{name}이(가) 편지를 소중히 가방에 넣었다.' : '"고마워, 너도 화이팅!" 짧은 답장이 왔다.' } },
        { label: '평소처럼 지낸다', description: '변화 없음', campusChoice: 'none', season: { text: '평소처럼 하루를 보냈다.' } }
      ] };
      if (sc.id === 'confessday') return { ...id, title: '고백데이 · 크리스마스까지 100일', description: '크리스마스까지 딱 100일 남은 날. 친구들 사이에서 오늘 고백하면 크리스마스를 함께 보낸다는 말이 돈다.', seasonBonus: 0.1, dm: dmBlock(name, person, [['them', '오늘 크리스마스 D-100이래'], ['them', '벌써 그렇게 됐나 싶다']]), choices: [
        { label: '"그럼 크리스마스 같이 보낼래?" 하고 마음을 전한다', description: '고백 · 오늘은 타이밍 보너스', campusChoice: 'confess', season: { confess: true, yes: '"좋아. 나도 그 말 기다렸어." 100일 뒤가 기다려지기 시작했다.', no: '"고마워. 그런데 지금은 친구로 지내고 싶어." 조심스러운 답장이 왔다. 마음이 조금 무겁다.' } },
        { label: '"시간 진짜 빠르다" 하고 가볍게 답한다', description: '편하게 · 호감 ↑', campusChoice: 'light', season: { bond: 3, text: '시험 이야기, 동아리 이야기로 한참 메시지를 주고받았다.' } }
      ] };
      return { ...id, title: '빼빼로데이', description: dating ? `${withParticle(name)} 함께 맞는 빼빼로데이다.` : '교실마다 빼빼로 상자가 보인다.', choices: [
        { label: `${name}에게 빼빼로를 건넨다`, description: '호감 ↑', campusChoice: 'give', season: { bond: dating ? 5 : 5, trust: 1, text: '{name}이(가) 반쪽을 다시 나눠 주며 웃었다.' } },
        { label: '반 친구 모두에게 하나씩 돌린다', description: '사회성 ↑', campusChoice: 'all', season: { bond: 1, effects: { social: 2 }, text: '반 전체가 빼빼로로 시끌벅적했다.' } }
      ] };
    }
    function romanceSelectionReason(s) {
      if (isTerminal(s) || s.turn >= 42) return '정규 학교생활이 마무리되었어요';
      if (s.pendingEvent || s.emergency) return '진행 중인 사건을 먼저 마무리해 주세요';
      return '';
    }
    function getRomanceRoster(s) {
      const r = initRomance(s), disabledReason = romanceSelectionReason(s);
      return oppositeCandidates(s).map(person => {
        const record = r.records[person.id];
        return { id: person.id, name: record.partnerName, gender: person.gender, portraitIndex: person.portraitIndex, personality: person.personality, interests: [...person.interests], stage: record.stage, bond: record.bond, meetings: record.meetings, met: record.met, selected: r.targetId === person.id, dating: record.stage === 'dating', lastMemory: record.lastMemory, canSelect: !disabledReason, disabledReason };
      });
    }
    function selectRomanceTarget(s, id) {
      assertSideAction(s);
      if (s.turn >= 42) throw new Error('정규 학교생활이 마무리되었어요.');
      const person = oppositeCandidates(s).find(candidate => candidate.id === id);
      if (!person) throw new Error('학교에서 만날 친구를 다시 골라 주세요.');
      const r = initRomance(s);
      r.targetId = person.id;
      mirrorRomance(r);
      return { targetId: person.id, messages: [`${withParticle(r.partnerName)} 더 이야기할 기회를 기다려 보기로 했다. 다음 주간 생활에서 만남이 찾아올 수 있다.`] };
    }
    function romanceType(s, record) {
      if (record.stage === 'dating') return (record.datesSinceCrisis || 0) >= 2 ? 'crisis' : 'date';
      if (['none', 'ended'].includes(record.stage)) return 'meet';
      if (!s.romance.datingId && !record.friendshipOnly && (s.romance.relationships || 0) < 2 && record.bond >= 55 && record.meetings >= 4 && s.turn - record.lastConfessionTurn >= 10) return 'invite';
      return 'chat';
    }
    function recordRomanceMoment(s, characterId, eventType, text) {
      const r = s.romance, record = r.records[characterId];
      record.lastMemory = text;
      r.history.unshift({ turn: s.turn, characterId, name: record.partnerName, type: eventType, text });
      if (r.history.length > 100) r.history.length = 100;
      mirrorRomance(r);
    }
    function migrate(s) { return init(s, { legacy: true }); }
    function setGender(s, value) {
      assertSideAction(s, true);
      if (!['male', 'female'].includes(value)) throw new Error('성별을 선택해 주세요.');
      if (s.gender) throw new Error('이미 선택한 성별은 이번 이야기에서 바꿀 수 없어요.');
      s.gender = value; s.needsGender = false; initRomance(s);
      return s;
    }
    function syncPurchaseTurn(s) {
      if (s.money.purchaseTurn !== weekClock(s)) { s.money.purchaseTurn = weekClock(s); s.money.purchasesThisWeek = 0; s.money.purchasedIdsThisWeek = []; }
    }
    function getShop(s) {
      const count = s.money.purchaseTurn === weekClock(s) ? s.money.purchasesThisWeek : 0;
      return shopItems.map(item => {
        let disabledReason = '';
        if (isTerminal(s)) disabledReason = '이야기가 마무리되었어요';
        else if (s.pendingEvent || s.emergency) disabledReason = '진행 중인 사건을 먼저 마무리해 주세요';
        else if (item.reusable && s.money.ownedItems.includes(item.id)) disabledReason = '이미 가지고 있는 물건이에요';
        else if (count >= 4) disabledReason = '이번 주에는 4개를 모두 구매했어요';
        else if (s.money.purchaseTurn === weekClock(s) && s.money.purchasedIdsThisWeek.includes(item.id)) disabledReason = '같은 물건은 한 주에 한 번 살 수 있어요';
        else if (s.money.balance < item.price) disabledReason = '보유금이 부족해요';
        return { ...item, owned: s.money.ownedItems.includes(item.id), disabledReason, available: !disabledReason };
      });
    }
    function buyItem(s, id) {
      assertSideAction(s);
      const item = shopItems.find(x => x.id === id);
      if (!item) throw new Error('구매할 물건을 다시 골라 주세요.');
      const count = s.money.purchaseTurn === weekClock(s) ? s.money.purchasesThisWeek : 0;
      if (item.reusable && s.money.ownedItems.includes(item.id)) throw new Error('이미 가지고 있는 물건이에요.');
      if (count >= 4) throw new Error('상점에서는 한 주에 서로 다른 물건 4개까지 살 수 있어요.');
      if (s.money.purchaseTurn === weekClock(s) && s.money.purchasedIdsThisWeek.includes(item.id)) throw new Error('같은 물건은 한 주에 한 번 살 수 있어요.');
      if (!Number.isFinite(s.money.balance) || s.money.balance < item.price) throw new Error('보유금이 부족해요.');
      // All validations precede the debit and effects, including the per-week cap.
      syncPurchaseTurn(s);
      ledger(s, -item.price, item.name);
      s.money.purchasesThisWeek++;
      s.money.purchasedIdsThisWeek.push(item.id);
      if (item.reusable) s.money.ownedItems.push(item.id);
      const effects = { fatigue: item.fatigue || 0, stress: item.stress || 0 };
      shift(s, effects);
      if (item.learning) addLearning(s, item.learning);
      if (item.bond) s.relationships = clamp((s.relationships || 0) + item.bond);
      if (item.buff) s.money.buffs[item.buff] = true;
      if (item.rebound) {
        s.money.reboundSchedule.push({ turn: weekClock(s) + 1, amount: item.rebound });
        s.money.pendingRebound += item.rebound;
        s.money.reboundTurn = Math.min(...s.money.reboundSchedule.map(x => x.turn));
      }
      const message = `${withParticle(item.name, '을', '를')} 구매했다. ${item.price.toLocaleString('ko-KR')}원을 사용했다.`;
      note(s, message, 'money');
      return { item: { ...item }, messages: [message] };
    }
    function beginWeek(s) {
      assertAlive(s);
      const messages = [];
      if (s.money.lastWeeklyTurn === weekClock(s)) return { messages, started: false };
      syncPurchaseTurn(s);
      if (s.turn > 0) { ledger(s, s.money.allowance, '이번 주 용돈'); messages.push(`이번 주 용돈 ${s.money.allowance.toLocaleString('ko-KR')}원을 받았다.`); }
      if (s.money.pendingRebound > 0 && s.money.reboundTurn !== null && weekClock(s) >= s.money.reboundTurn) {
        const due = s.money.reboundSchedule.filter(x => x.turn <= weekClock(s));
        shift(s, { fatigue: due.reduce((sum, x) => sum + x.amount, 0) });
        messages.push('잠깐 미뤄 둔 피로가 돌아왔다. 에너지 음료는 수면을 대신하지 못한다.');
        s.money.reboundSchedule = s.money.reboundSchedule.filter(x => x.turn > weekClock(s));
        s.money.pendingRebound = s.money.reboundSchedule.reduce((sum, x) => sum + x.amount, 0);
        s.money.reboundTurn = s.money.reboundSchedule.length ? Math.min(...s.money.reboundSchedule.map(x => x.turn)) : null;
      }
      s.money.lastWeeklyTurn = weekClock(s);
      return { messages, started: true };
    }
    function validateAction(s, id) {
      assertAlive(s);
      if (!actions.some(a => a.id === id)) return false;
      if (!s.gender) throw new Error('학교생활을 이어가기 전에 성별을 선택해 주세요.');
      if (['delivery', 'device_dorm'].includes(id) && s.dorm.status === 'expelled') throw new Error('기숙사 퇴사 후에는 이 활동을 할 수 없어요.');
      if (id === 'delivery' && (!Number.isFinite(s.money.balance) || s.money.balance < 12000)) throw new Error('배달 주문에는 12,000원이 필요해요.');
      return true;
    }
    const EXPULSION_STEPS = [{ days: 5, weeks: 1 }, { days: 10, weeks: 2 }, { days: 30, weeks: 4 }, { days: 90, weeks: 12 }];
    function expulsionStep(n) { return EXPULSION_STEPS[n - 1] || null; }
    function dormNotice(s) {
      const step = expulsionStep(s.dorm.expulsions);
      const desc = step ? `누적된 생활 규정 위반으로 ${s.dorm.expulsions}번째 퇴사 처분을 받았다. ${step.days}일(${step.weeks}주) 동안 통학하고, 기간이 끝나면 기숙사로 돌아간다. 다음 퇴사는 ${expulsionStep(s.dorm.expulsions + 1) ? `${expulsionStep(s.dorm.expulsions + 1).days}일` : '영구 퇴사'}이다.` : '다섯 번째 퇴사 처분으로 기숙사에서 영구 퇴사하게 되었다. 졸업할 때까지 통학하며 학교생활을 이어 가야 한다.';
      return { id: 'campus_dorm_notice', title: step ? `기숙사 퇴사 ${step.days}일` : '기숙사 영구 퇴사', description: desc, choices: [
        { label: '통학 계획을 세운다', description: '학교생활을 계속하며 새 일과를 준비한다.', campusChoice: 'commute' },
        { label: '주변에 도움을 요청한다', description: '가족과 선생님에게 통학 준비를 의논한다.', campusChoice: 'support' }
      ] };
    }
    function recordViolation(s, kind, messages, events) {
      const isDelivery = kind === 'delivery';
      const key = isDelivery ? 'deliveryCaught' : 'electronicsCaught';
      s.dorm[key]++;
      messages.push(`${isDelivery ? '배달 음식' : '전자기기 사용'}이 적발되어 누적 ${s.dorm[key]}회가 되었다.`);
      const checked = checkDiscipline(s);
      messages.push(...checked.messages); events.push(...checked.events);
    }
    function checkDiscipline(s) {
      const messages = [], events = [];
      if (s.dorm.status !== 'expelled' && (s.dorm.deliveryCaught >= 2 || s.dorm.electronicsCaught >= 4)) {
        s.dorm.status = 'expelled'; s.dorm.expelledTurn = s.turn;
        s.dorm.expulsions = (s.dorm.expulsions || 0) + 1;
        const step = expulsionStep(s.dorm.expulsions);
        s.dorm.returnTurn = step ? s.turn + 1 + step.weeks : null;
        s.dorm.history.push({ turn: s.turn, weeks: step ? step.weeks : null, permanent: !step });
        messages.push(step ? `누적 적발 기록으로 기숙사 퇴사 ${step.days}일(${step.weeks}주)이 결정되었다. 그동안 통학한다.` : '다섯 번째 퇴사로 기숙사 영구 퇴사가 결정되었다. 재학을 유지하며 통학하는 생활로 바뀐다.');
        events.push(dormNotice(s));
      }
      return { messages, events };
    }
    function romanceEvent(s, type, characterId = s.romance.targetId) {
      const r = s.romance, person = romanceCandidates.find(candidate => candidate.id === characterId) || romanceCandidates[0], record = r.records[person.id], name = record.partnerName;
      const identity = { characterId: person.id, characterName: name, portraitIndex: person.portraitIndex, context: 'romance' };
      if (type === 'meet') return { ...identity, id: 'campus_romance_meet', title: `${name}, 조금 더 알고 싶은 친구`, description: `${person.meet.replaceAll(person.name, name)} 서로 알아갈 수 있는 가상의 동갑 친구다.`, choices: [
        { label: person.greeting, description: '서로 편한 만큼 천천히 대화한다.', campusChoice: 'hello' },
        { label: '오늘은 인사만 나눈다', description: '서두르지 않고 각자의 시간을 보낸다.', campusChoice: 'greet' }
      ] };
      if (type === 'invite') return { ...identity, id: 'campus_romance_invite', title: `${name}, 우정에서 한 걸음`, description: `${withParticle(name)} 함께하는 시간이 편안해졌다. ${person.interests[0]} 이야기를 나누던 평범한 순간도 오래 기억에 남는다. 내 마음을 말하더라도 대답은 상대가 정할 수 있다.`, choices: [
        { label: '좋아하는 마음을 솔직히 전한다', description: '어떤 대답이든 존중하며 이야기한다.', campusChoice: 'ask' },
        { label: '지금처럼 친구로 지낸다', description: '함께하는 우정도 충분히 소중하다.', campusChoice: 'friend' },
        { label: '내 마음을 조금 더 생각해 본다', description: '서두르지 않고 나만의 시간을 갖는다.', campusChoice: 'wait' }
      ] };
      if (type === 'chat') return { ...identity, id: 'campus_romance_chat', title: `${withParticle(name)}의 쉬는 시간`, description: `${withParticle(name)} 잠깐 마주쳤다. ${person.chats[record.meetings % person.chats.length]} 함께 이야기하거나 각자의 일과를 이어갈 수 있다.`, choices: [
        { label: person.chatLabel, description: '서로의 이야기를 편하게 듣는다.', campusChoice: 'talk' },
        { label: '짧게 인사하고 내 일과로 돌아간다', description: '각자의 시간을 존중한다.', campusChoice: 'leave' }
      ] };
      if (type === 'crisis') return { ...identity, id: 'campus_romance_crisis', title: `${name}와의 작은 오해`, description: `요즘 시험과 활동이 겹쳐 ${withParticle(name)} 연락이 뜸해졌다. 서운한 마음이 쌓인 것 같다.`, dm: dmBlock(name, person, [['them', '요즘 많이 바빠? 답장이 늦어서 조금 서운했어.'], ['them', '내가 너무 신경 쓰는 걸까?']]), choices: [
        { label: '솔직하게 마음을 이야기한다', description: '신뢰가 높을수록 잘 풀린다', campusChoice: 'talk' },
        { label: '시험 끝날 때까지 잠시 시간을 갖자고 한다', description: '잘 풀릴 수도, 멀어질 수도 있다', campusChoice: 'time' },
        { label: '지금은 각자에게 집중하자고 말한다', description: '관계를 정중하게 마무리한다', campusChoice: 'end' }
      ] };
      return { ...identity, id: 'campus_romance_date', title: `${name}, 함께하는 한 주`, description: `${person.date.replaceAll(person.name, name)} 가까운 사이에도 각자의 공부와 휴식은 필요하다.`, choices: [
        { label: person.dateLabel, description: '대화하며 기분을 환기한다.', campusChoice: 'walk' },
        { label: '같이 공부하고 각자 쉰다', description: '서로의 일과를 응원한다.', campusChoice: 'study' },
        { label: '이번 주는 각자의 시간을 갖는다', description: '거리를 두는 선택도 서로 존중한다.', campusChoice: 'space' },
        { label: '관계를 마무리하고 싶다고 말한다', description: '상대에게 솔직하고 정중하게 마음을 전한다.', campusChoice: 'end' }
      ] };
    }
    function handleAction(s, id) {
      const messages = [], events = [];
      if (!actions.some(a => a.id === id)) return { handled: false, messages, events };
      validateAction(s, id);
      if (id === 'earn') {
        const best = Math.max(...talentKeys.map(key => Number(s.stats[key]) || 0));
        const reward = Math.min(6500, 2500 + Math.floor(best / 5) * 200);
        ledger(s, reward, '도움 활동과 작은 작업');
        shift(s, { fatigue: 6, stress: 2 });
        messages.push(`나의 강점을 살린 작은 작업으로 ${reward.toLocaleString('ko-KR')}원을 벌었다.`);
      } else if (id === 'delivery') {
        ledger(s, -12000, '기숙사 배달 음식');
        shift(s, { fatigue: -7, stress: -8 });
        messages.push('기숙사에서 배달 음식을 먹었다. 12,000원을 사용했다.');
        if (rng(s) < 0.28) recordViolation(s, 'delivery', messages, events);
        else messages.push('이번에는 적발되지 않았다. 누적 기록은 그대로 남는다.');
      } else if (id === 'device_dorm' || id === 'device_study') {
        shift(s, { fatigue: 5, stress: -7 });
        if (id === 'device_study') addLearning(s, -0.6);
        if (rng(s) < (id === 'device_dorm' ? 0.22 : 0.30)) recordViolation(s, 'electronics', messages, events);
        else messages.push('전자기기를 사용하며 시간을 보냈다. 이번에는 적발되지 않았다.');
      } else if (id === 'romance') {
        const romance = initRomance(s), record = romance.records[romance.targetId];
        if (s.turn < record.cooldownUntil || s.turn - romance.globalLastEventTurn < 2 || s.turn - record.lastEventTurn < 2) messages.push('서로의 시간을 존중하며 오늘은 친구들과 평범한 하루를 보냈다.');
        else {
          const type = romanceType(s, record);
          if (['invite', 'date'].includes(type) && s.turn - record.lastEventTurn < 3) messages.push('오늘은 짧게 인사하고 서로의 일과를 응원했다.');
          else {
            events.push(romanceEvent(s, type, romance.targetId));
            record.lastEventTurn = s.turn; romance.globalLastEventTurn = s.turn;
            mirrorRomance(romance);
          }
        }
      }
      return { handled: true, messages, events };
    }
    function weekly(s, id, context = {}) {
      const began = beginWeek(s), result = handleAction(s, id);
      const messages = [...began.messages, ...result.messages];
      const checked = checkDiscipline(s);
      messages.push(...checked.messages); result.events.push(...checked.events);
      const focus = context.focusId || id;
      const gear = s.money.ownedItems;
      if (gear.includes('research_notebook') && (['research', 'academic'].includes(focus) || context.commitment === 'fieldresearch')) addLearning(s, 0.2);
      if (gear.includes('shoes') && ['train', 'sports', 'sport', 'athletics'].includes(focus)) shift(s, { fatigue: -1 });
      if (gear.includes('basketball') && ['sports', 'sport', 'athletics'].includes(focus) && (s.sportsClubs || []).includes('basketball')) shift(s, { stress: -2 });
      if (gear.includes('eye_mask') && ['rest', 'recovery'].includes(focus)) shift(s, { fatigue: -2 });
      if (gear.includes('earplugs') && ['study', 'english', 'academic', 'intelligence', 'discipline'].includes(focus)) shift(s, { stress: -1 });
      if (s.money.buffs.sportsRecovery && ['train', 'sports', 'sport', 'athletics'].includes(focus)) {
        shift(s, { fatigue: -5 }); delete s.money.buffs.sportsRecovery;
        messages.push('준비해 둔 스포츠 테이프로 이번 운동의 부담을 조금 덜었다.');
      }
      // Existing boarders and commuters incur different travel costs. Expulsion is not a school withdrawal.
      if (s.dorm.status === 'expelled' && Number.isFinite(s.dorm.returnTurn) && s.turn >= s.dorm.returnTurn) {
        s.dorm.status = 'resident'; s.dorm.deliveryCaught = 0; s.dorm.electronicsCaught = 0; delete s.dorm.returnTurn;
        messages.push(`퇴사 기간이 끝나 기숙사로 돌아왔다. 적발 기록은 새로 시작하지만, 다음 퇴사는 ${expulsionStep(s.dorm.expulsions + 1) ? `${expulsionStep(s.dorm.expulsions + 1).days}일` : '영구 퇴사'}이다.`);
      }
      if (s.dorm.status === 'expelled' && s.dorm.expelledTurn < s.turn) {
        shift(s, { fatigue: 6 }); addLearning(s, -0.4);
        messages.push('통학에 시간이 들어 피로가 쌓이고 개인 학습 시간이 조금 줄었다.');
      }
      return { handled: result.handled, messages, events: result.events };
    }
    function opportunityEvent(s, id) {
      const copy = {
        delivery: ['배달 음식을 같이 먹을까?', '친구가 기숙사에서 배달 음식을 주문하자고 제안했다. 규정 위반으로 적발될 수 있다.', '12,000원을 내고 함께 주문한다', '피로와 스트레스가 줄지만 적발 기록이 남을 수 있다.'],
        device_dorm: ['불 꺼진 기숙사의 화면', '기숙사에서 허용되지 않은 시간에 전자기기를 사용하고 싶은 순간이다.', '잠깐 전자기기를 사용한다', '스트레스가 줄지만 피로와 적발 위험이 생긴다.'],
        device_study: ['자습실에서 온 유혹', '자습 중 친구가 전자기기로 재미있는 영상을 보자고 한다. 지금은 허용된 용도가 아니다.', '잠깐 영상을 함께 본다', '학습 시간이 줄고 적발 기록이 남을 수 있다.'],
        earn: ['작은 도움, 작은 보상', '정리와 작업을 도와주면 사례를 받을 수 있는 기회가 생겼다.', '시간을 내어 작업을 돕는다', '내 강점을 살려 용돈을 벌지만 피로가 쌓인다.']
      }[id];
      return { id: `campus_opportunity_${id}`, campusAction: id, title: copy[0], description: copy[1], choices: [
        { label: copy[2], description: copy[3], campusChoice: 'accept' },
        { label: '이번에는 하지 않는다', description: '비용이나 적발 없이 내 일과를 이어간다.', campusChoice: 'skip' }
      ] };
    }
    function automaticEvents(s, context = {}) {
      if (typeof context === 'string') context = { focusId: context };
      if (isTerminal(s) || s.emergency || !s.gender || s.turn >= 42) return [];
      const history = s.campusOpportunities, now = weekClock(s);
      if (history.lastGeneratedTurn === now) return [];
      history.lastGeneratedTurn = now;
      const season = seasonEvent(s);
      if (season) { history.lastTurn = now; return [season]; }
      // 새 학년이 되면 연애 중인 관계에 작은 위기가 찾아옵니다(반·시간표가 바뀌는 시기).
      { const rr = initRomance(s); if (rr.datingId && [7, 14, 21, 28, 35].includes(s.turn) && s.turn - (rr.records[rr.datingId].datingSince ?? -99) >= 5 && !(rr.yearCrisis || []).includes(s.turn)) { rr.yearCrisis = [...(rr.yearCrisis || []), s.turn]; history.lastTurn = now; return [romanceEvent(s, 'crisis', rr.datingId)]; } }
      if (now - history.lastTurn < 2 || rng(s) >= 0.72) return [];
      const candidates = [{ id: 'earn', weight: 1 }, { id: 'device_study', weight: 0.7 }];
      if (s.dorm.status !== 'expelled') {
        candidates.push({ id: 'device_dorm', weight: 0.7 });
        if (s.money.balance >= 12000) candidates.push({ id: 'delivery', weight: 0.8 });
      }
      const r = initRomance(s);
      if (s.turn >= 3 && s.turn - r.globalLastEventTurn >= 2) {
        const available = romanceCandidates.filter(person => {
          if (s.gender && person.gender === s.gender) return false;
          const record = r.records[person.id];
          return s.turn >= record.cooldownUntil && s.turn - record.lastEventTurn >= 3;
        });
        if (available.length) candidates.push({ id: 'romance', available, weight: ['social', 'friends', 'balanced'].includes(context.focusId) ? 6 : 4.5 });
      }
      let draw = rng(s) * candidates.reduce((sum, c) => sum + c.weight, 0);
      let chosen = candidates[candidates.length - 1];
      for (const c of candidates) { draw -= c.weight; if (draw < 0) { chosen = c; break; } }
      history.lastTurn = now;
      // v0.14 복잡도 개선: 배달·전자기기·용돈 벌이 같은 기회 사건은 절반만 묻습니다.
      if (!chosen.available && rng(s) >= 0.5) return [];
      if (chosen.available) {
        // Roll for the classmate only after selecting a relationship encounter.
        const selected = chosen.available.find(person => person.id === r.targetId);
        const others = chosen.available.filter(person => person.id !== r.targetId);
        const person = selected && (!others.length || rng(s) < 0.82) ? selected : others[Math.floor(rng(s) * others.length)] || chosen.available[0];
        const type = romanceType(s, r.records[person.id]);
        history.seen[`romance_${type}`] = (history.seen[`romance_${type}`] || 0) + 1;
        const event = romanceEvent(s, type, person.id);
        r.globalLastEventTurn = s.turn;
        r.records[person.id].lastEventTurn = s.turn;
        mirrorRomance(r);
        return [event];
      }
      history.seen[chosen.id] = (history.seen[chosen.id] || 0) + 1;
      return [opportunityEvent(s, chosen.id)];
    }
    function resolve(s, event, choice) {
      const messages = [], events = [];
      if (!event || !String(event.id).startsWith('campus_')) return { handled: false, messages, events };
      const c = typeof choice === 'number' ? event.choices[choice] : choice;
      assertAlive(s);
      if (!c || !c.campusChoice) throw new Error('지금 가능한 선택지를 골라 주세요.');
      if (String(event.id).startsWith('campus_opportunity_')) {
        if (c.campusChoice === 'skip') return { handled: true, messages: ['이번 기회는 넘기고 자신의 일과를 이어갔다.'], events };
        if (c.campusChoice !== 'accept' || !['delivery', 'device_dorm', 'device_study', 'earn'].includes(event.campusAction)) throw new Error('지금 가능한 선택지를 골라 주세요.');
        validateAction(s, event.campusAction);
        return handleAction(s, event.campusAction);
      }
      if (event.id === 'campus_dorm_notice') {
        if (!['commute', 'support'].includes(c.campusChoice)) throw new Error('통학 준비 방법을 선택해 주세요.');
        messages.push(c.campusChoice === 'support' ? '주변의 도움을 받아 통학 일과를 준비했다.' : '통학 시간과 휴식을 고려한 새 일과를 정했다.');
        return { handled: true, messages, events };
      }
      if (!/^campus_romance_/.test(event.id)) return { handled: false, messages, events };
      // 블랙데이는 특정 상대와의 사건이 아니라 친구들과의 모임입니다.
      if (event.id === 'campus_romance_season' && event.season === 'blackday') { if (c.season?.effects) shift(s, c.season.effects); messages.push(c.season?.text || '친구들과 하루를 보냈다.'); return { handled: true, messages, events }; }
      const romance = initRomance(s), characterId = event.characterId || romance.targetId;
      const person = romanceCandidates.find(candidate => candidate.id === characterId);
      if (!person) throw new Error('이 만남의 상대를 확인할 수 없어요.');
      const r = romance.records[characterId], key = c.campusChoice;
      if (event.id === 'campus_romance_invite' && key === 'ask' && romance.datingId && romance.datingId !== characterId) throw new Error('새로운 마음을 전하기 전에 현재의 관계를 먼저 정리해 주세요.');
      // Personal outcomes stay inside the simulation; prose never ranks genders or exposes these mechanics.
      // v0.14: 성별과 무관하게 호감(bond)·신뢰(trust)·타이밍(기념일 보너스)으로 판정합니다.
      if (!Number.isFinite(r.trust)) r.trust = Math.round((r.bond || 0) * 0.6);
      const confession = clamp(0.56 + (r.bond - 60) * 0.012 + (r.trust - 40) * 0.006 + ((s.stats.social || 0) - 50) * 0.002 + (event.seasonBonus || 0) + ((romance.relationships || 0) === 1 ? 0.15 : 0), 0.04, 0.7);
      const startDating = () => { r.stage = 'dating'; r.datingSince = s.turn; r.bond = Math.max(r.bond, 55); romance.relationships = (romance.relationships || 0) + 1; r.datesSinceCrisis = 0; setMood(s, 'flutter', 2); shift(s, { stress: -5, resilience: 1 }); };
      const breakUp = (text) => { r.stage = 'ended'; r.bond = 15; r.trust = 10; r.cooldownUntil = s.turn + 14; if (romance.datingId === characterId) romance.datingId = null; setMood(s, 'heavy', 3); shift(s, { stress: 8 }); messages.push(text); const next = oppositeCandidates(s).filter(p => p.id !== characterId).sort((a, b) => (romance.records[b.id].bond || 0) - (romance.records[a.id].bond || 0))[0]; if (next) romance.targetId = next.id; };
      if (event.id === 'campus_romance_meet') {
        if (key === 'hello') {
          if (rng(s) < clamp(0.72 + ((s.stats.social || 0) - 50) * 0.002, 0.5, 0.9)) { r.stage = 'friendship'; r.bond = 28; r.meetings = 1; r.friendshipOnly = false; r.lastConfessionTurn = -20; shift(s, { social: 1 }); messages.push(`${withParticle(r.partnerName)} 관심사를 나누며 친구가 되었다.`); }
          else { r.stage = 'none'; r.cooldownUntil = s.turn + 5; messages.push('친구는 지금은 혼자 있고 싶다고 했다. 그 마음을 존중하고 가볍게 인사를 나눴다.'); }
        } else if (key === 'greet') { r.cooldownUntil = s.turn + 3; messages.push('반갑게 인사를 나누고 각자의 하루로 돌아갔다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_chat') {
        if (key === 'talk') { r.bond = clamp(r.bond + 9); r.trust = clamp((r.trust || 0) + 5); r.meetings++; shift(s, { social: 0.5, stress: -2 }); messages.push(`${withParticle(r.partnerName)} 서로의 관심사를 나누었다. 조금 더 편하게 이야기할 수 있게 되었다.`); }
        else if (key === 'leave') messages.push('서로 가볍게 인사를 나누고 각자의 시간을 보냈다.');
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_invite') {
        if (key === 'ask') {
          r.lastConfessionTurn = s.turn;
          if (rng(s) < confession) { startDating(); messages.push(`${withParticle(r.partnerName)} 서로 같은 마음임을 확인했다. 각자의 일상도 존중하며 만나 보기로 했다.`); }
          else { r.stage = 'friendship'; r.bond = Math.max(20, r.bond - 8); r.cooldownUntil = s.turn + 10; setMood(s, 'heavy', 2); shift(s, { stress: 5 }); messages.push('친구는 지금처럼 지내고 싶다고 말했다. 대답을 존중하고 충분한 시간과 거리를 두기로 했다. 마음이 조금 무거운 한 주가 될 것 같다.'); }
        } else if (key === 'friend') { r.bond = clamp(r.bond + 3); r.friendshipOnly = true; r.cooldownUntil = s.turn + 3; messages.push('좋은 친구로 함께하는 시간을 이어 가기로 했다.'); }
        else if (key === 'wait') { r.cooldownUntil = s.turn + 5; messages.push('마음을 서두르지 않고 내 일상에 집중하기로 했다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_date') {
        r.datesSinceCrisis = (r.datesSinceCrisis || 0) + 1;
        if (key === 'walk') { r.bond = clamp(r.bond + 5); r.trust = clamp((r.trust || 0) + 2); shift(s, { stress: -6, fatigue: -3 }); messages.push(`${withParticle(r.partnerName)} ${person.dateMemory}`); }
        else if (key === 'study') { r.bond = clamp(r.bond + 4); r.trust = clamp((r.trust || 0) + 3); addLearning(s, 1.2); shift(s, { fatigue: -2 }); messages.push(`${withParticle(r.partnerName)} 같이 공부한 뒤 서로에게 충분한 휴식 시간을 주었다.`); }
        else if (key === 'space') { shift(s, { fatigue: -4 }); messages.push('이번 주는 각자의 시간을 보내기로 했다. 서로의 선택을 존중했다.'); }
        else if (key === 'end') { r.stage = 'ended'; r.bond = 15; r.cooldownUntil = s.turn + 10; setMood(s, 'heavy', 2); messages.push('솔직하게 마음을 이야기하고 관계를 정중하게 마무리했다. 각자의 다음 이야기를 응원한다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_crisis') {
        r.datesSinceCrisis = 0;
        if (key === 'talk') { const ok = rng(s) < clamp(0.15 + (r.trust || 0) * 0.004 + ((s.stats.resilience || 0) - 50) * 0.003, 0.3, 0.9); if (ok) { r.trust = clamp((r.trust || 0) + 8); r.bond = clamp(r.bond + 3); shift(s, { resilience: 2, stress: -3 }); messages.push(`${withParticle(r.partnerName)} 솔직하게 이야기를 나눴다. 오해가 풀리고 서로를 더 잘 알게 되었다.`); } else breakUp('이야기를 나눌수록 서로 바라는 것이 다르다는 걸 알게 됐다. 고마운 마음을 전하고 각자의 길을 응원하기로 했다.'); }
        else if (key === 'time') { if (rng(s) < 0.55) { r.trust = clamp((r.trust || 0) + 2); shift(s, { stress: -1 }); messages.push('잠시 각자의 시간을 가진 뒤 다시 편하게 이야기할 수 있었다.'); } else breakUp('시간을 갖는 사이 마음이 조금씩 멀어졌다. 서로에게 좋은 친구로 남기로 했다.'); }
        else if (key === 'end') breakUp('지금은 각자에게 집중하는 게 좋겠다고 솔직하게 말했다. 정중하게 관계를 마무리했다.');
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_season') {
        const sc = c.season || {};
        if (sc.bond) r.bond = clamp(r.bond + sc.bond);
        if (sc.trust) r.trust = clamp((r.trust || 0) + sc.trust);
        if (sc.effects) shift(s, sc.effects);
        if (sc.confess) {
          r.lastConfessionTurn = s.turn;
          if (rng(s) < confession) { startDating(); messages.push(fillName(sc.yes, r.partnerName)); }
          else { r.cooldownUntil = s.turn + 8; if (sc.soft) { r.bond = Math.max(20, r.bond - 2); messages.push(fillName(sc.no, r.partnerName)); } else { r.stage = 'friendship'; r.bond = Math.max(20, r.bond - 8); setMood(s, 'heavy', 2); shift(s, { stress: 5 }); messages.push(fillName(sc.no, r.partnerName)); } }
        } else messages.push(fillName(sc.text, r.partnerName));
      } else return { handled: false, messages, events };
      r.lastEventTurn = s.turn; r.met = true;
      romance.globalLastEventTurn = s.turn;
      recordRomanceMoment(s, characterId, event.id.replace('campus_romance_', ''), messages.join(' '));
      return { handled: true, messages, events };
    }
    function getDormStatus(s) {
      const expelled = s.dorm.status === 'expelled', permanent = expelled && !Number.isFinite(s.dorm.returnTurn);
      const next = expulsionStep((s.dorm.expulsions || 0) + 1), weeksLeft = expelled && !permanent ? Math.max(1, s.dorm.returnTurn - s.turn) : 0;
      const nextText = next ? `다음 퇴사는 ${next.days}일(${next.weeks}주)` : '다음 퇴사는 영구 퇴사';
      return { ...s.dorm, permanent, weeksLeft, label: !expelled ? '기숙사 생활 중' : permanent ? '기숙사 영구 퇴사 · 통학 중' : `기숙사 퇴사 · 통학 중 (${weeksLeft}주 뒤 복귀)`, isResident: !expelled, deliveryLimit: 2, electronicsLimit: 4, description: expelled ? `재학은 계속됩니다. 통학으로 매주 피로도 +6, 학습량 −0.4가 적용돼요. ${permanent ? '영구 퇴사라 돌아갈 수 없어요.' : `${weeksLeft}주 뒤 기숙사로 돌아가요. ${nextText}예요.`}` : `배달 적발 2회 또는 전자기기 적발 4회가 되면 퇴사해요. 퇴사는 5일 → 10일 → 30일 → 90일 → 영구 순으로 길어져요.${s.dorm.expulsions ? ` 지금까지 ${s.dorm.expulsions}회 퇴사 · ${nextText}예요.` : ''}` };
    }
    return { init, migrate, actions, shopItems, validateAction, beginWeek, handleAction, weekly, automaticEvents, checkDiscipline, resolve, handleChoice: resolve, getShop, buyItem, setGender, getDormStatus, romanceCandidates, getRomanceRoster, selectRomanceTarget };
  }
  const api = { createAPI, actions, shopItems, romanceCandidates };
  root.GSACampusSystems = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
