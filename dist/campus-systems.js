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
    { id: 'photo_album', name: '추억 사진 인화', category: 'life', price: 8000, description: '함께한 순간들을 작은 앨범에 남겨요.', effectsText: '스트레스 −12', stress: -12 }
  ].map(item => ({ reusable: false, ...item, categoryLabel: { food: '음식', drink: '음료', study: '학습', sports: '운동', life: '생활' }[item.category] }));
  const actions = [
    { id: 'earn', name: '용돈 벌기', icon: 'spark', description: '내가 잘하는 일을 살려 작은 작업과 도움 활동을 해요.', effectsText: '보유금 ↑ · 피로도 ↑ · 한 주 사용' },
    { id: 'delivery', name: '기숙사 배달', icon: 'ball', description: '기숙사에서 배달 음식을 주문해요. 적발되면 기록이 남아요.', effectsText: '12,000원 · 피로·스트레스 ↓ · 적발 2회 시 퇴사' },
    { id: 'device_dorm', name: '기숙사 전자기기', icon: 'book', description: '기숙사에서 허용되지 않은 시간에 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 피로도 ↑ · 전자기기 적발 누적' },
    { id: 'device_study', name: '자습실 전자기기', icon: 'book', description: '자습실에서 허용되지 않은 용도로 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 학습 효율 ↓ · 전자기기 적발 누적' }
  ];
  // 같은 반 친구 6명.
  const classmates = [
    { id: 'haneul', name: '하늘', gender: 'female', portraitIndex: 4, personality: '차분한 관찰자', interests: ['천문', '별 관측'] },
    { id: 'seoyun', name: '서윤', gender: 'female', portraitIndex: 1, personality: '꼼꼼한 탐구자', interests: ['연구', '실험'] },
    { id: 'seongun', name: '성운', gender: 'male', portraitIndex: 2, personality: '다정한 독서가', interests: ['책', '도서관'] },
    { id: 'taehyeon', name: '태현', gender: 'male', portraitIndex: 0, personality: '활기찬 팀플레이어', interests: ['농구', '운동'] },
    { id: 'sion', name: '시온', gender: 'male', portraitIndex: 5, personality: '재치 있는 문제해결사', interests: ['코딩', '게임'] },
    { id: 'yujin', name: '유진', gender: 'female', portraitIndex: 3, personality: '밝은 음악친구', interests: ['밴드', '음악'] }
  ];
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
        // 입학 능력치 합계가 400보다 모자란 만큼(1당 500원) 생활비를 더 받습니다. 기본 17,500원.
        const startingBalance = Math.round(clamp(17500 + Math.max(0, 400 - mean * talentKeys.length) * 500, 10000, 25000) / 500) * 500;
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
      // v0.13.1 단계별 퇴사: 1회 5일(1주) → 10일(2주) → 30일(4주) → 90일(12주) → 영구. 예전 퇴사 저장은 1회 강제 퇴사로 봅니다.
      if (!Number.isFinite(s.dorm.expulsions)) s.dorm.expulsions = s.dorm.status === 'expelled' ? 1 : 0;
      if (!Array.isArray(s.dorm.history)) s.dorm.history = s.dorm.status === 'expelled' ? [{ turn: Number(s.dorm.expelledTurn) || 0, weeks: 1, legacy: true }] : [];
      if (s.dorm.status === 'expelled' && s.dorm.returnTurn === undefined) s.dorm.returnTurn = Math.max((Number(s.dorm.expelledTurn) || 0) + 2, (Number(s.turn) || 0) + 1);
      if (!['male', 'female'].includes(s.gender)) s.gender = ['male', 'female'].includes(options.gender) ? options.gender : null;
      // 예전 저장에 남은, 지금은 없는 생활 사건은 정리합니다.
      const retired = e => { const id = String(e && e.id || ''); return id.startsWith('campus_') && !/^campus_(opportunity_|dorm_notice)/.test(id); };
      if (retired(s.pendingEvent)) s.pendingEvent = Array.isArray(s.eventQueue) && s.eventQueue.length ? s.eventQueue.shift() : null;
      if (Array.isArray(s.eventQueue)) s.eventQueue = s.eventQueue.filter(e => !retired(e));
      if (retired(s.pendingEvent)) s.pendingEvent = null;
      if (!s.campusOpportunities) s.campusOpportunities = { lastTurn: -10, lastGeneratedTurn: -1, seen: {} };
      s.needsGender = !s.gender;
      return s;
    }
    function migrate(s) { return init(s, { legacy: true }); }
    function setGender(s, value) {
      assertSideAction(s, true);
      if (!['male', 'female'].includes(value)) throw new Error('성별을 선택해 주세요.');
      if (s.gender) throw new Error('이미 선택한 성별은 이번 이야기에서 바꿀 수 없어요.');
      s.gender = value; s.needsGender = false;
      return s;
    }
    function syncPurchaseTurn(s) {
      if (s.money.purchaseTurn !== weekClock(s)) { s.money.purchaseTurn = weekClock(s); s.money.purchasesThisWeek = 0; s.money.purchasedIdsThisWeek = []; }
    }
    // 매점 입고: 2주(학기 1–2·3–4·5–6·7주차)마다 서로 다른 종류의 물건 3개가 들어옵니다. 저장의 시드로 정해져 다시 열어도 같습니다.
    function shopPeriod(s) { const t = weekClock(s), w = t % 7; return Math.floor(t / 7) * 4 + (w >= 6 ? 3 : Math.floor(w / 2)); }
    function shopStock(s) {
      const period = shopPeriod(s), fixed = s.money.stock;
      if (fixed && (fixed.period === period || fixed.period === 'all') && Array.isArray(fixed.ids)) return fixed.ids;
      let h = 2166136261 >>> 0; const next = () => { h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 0x5bd1e995) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return h / 4294967296; };
      for (const ch of `${s.seed}|shop|${period}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
      const cats = [...new Set(shopItems.map(i => i.category))];
      for (let i = cats.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [cats[i], cats[j]] = [cats[j], cats[i]]; }
      return cats.slice(0, 3).map(cat => { const pool = shopItems.filter(i => i.category === cat); return pool[Math.floor(next() * pool.length)].id; });
    }
    function getShop(s) {
      const count = s.money.purchaseTurn === weekClock(s) ? s.money.purchasesThisWeek : 0;
      const stock = shopStock(s), weeksLeft = (() => { const w = weekClock(s) % 7; return w >= 6 ? 1 : 2 - (w % 2); })();
      return shopItems.filter(item => stock.includes(item.id) || (item.reusable && s.money.ownedItems.includes(item.id))).map(item => {
        let disabledReason = '';
        if (isTerminal(s)) disabledReason = '이야기가 마무리되었어요';
        else if (s.pendingEvent || s.emergency) disabledReason = '진행 중인 사건을 먼저 마무리해 주세요';
        else if (item.reusable && s.money.ownedItems.includes(item.id)) disabledReason = '이미 가지고 있는 물건이에요';
        else if (!stock.includes(item.id)) disabledReason = '이번 입고 목록에 없는 물건이에요';
        else if (count >= 4) disabledReason = '이번 주에는 4개를 모두 구매했어요';
        else if (s.money.purchaseTurn === weekClock(s) && s.money.purchasedIdsThisWeek.includes(item.id)) disabledReason = '같은 물건은 한 주에 한 번 살 수 있어요';
        else if (s.money.balance < item.price) disabledReason = '보유금이 부족해요';
        return { ...item, inStock: stock.includes(item.id), restockIn: weeksLeft, owned: s.money.ownedItems.includes(item.id), disabledReason, available: !disabledReason };
      });
    }
    function buyItem(s, id) {
      assertSideAction(s);
      const item = shopItems.find(x => x.id === id);
      if (!item) throw new Error('구매할 물건을 다시 골라 주세요.');
      if (!shopStock(s).includes(item.id)) throw new Error('이번 2주 동안 매점에 들어오지 않은 물건이에요.');
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
      if (['delivery', 'device_dorm'].includes(id) && s.dorm.status === 'expelled') throw new Error('기숙사 강제 퇴사 후에는 이 활동을 할 수 없어요.');
      if (id === 'delivery' && (!Number.isFinite(s.money.balance) || s.money.balance < 12000)) throw new Error('배달 주문에는 12,000원이 필요해요.');
      return true;
    }
    const EXPULSION_STEPS = [{ days: 5, weeks: 1 }, { days: 10, weeks: 2 }, { days: 30, weeks: 4 }, { days: 90, weeks: 12 }];
    function expulsionStep(n) { return EXPULSION_STEPS[n - 1] || null; }
    function dormNotice(s) {
      const step = expulsionStep(s.dorm.expulsions);
      const desc = step ? `누적된 생활 규정 위반으로 ${s.dorm.expulsions}번째 강제 퇴사 처분을 받았다. ${step.days}일(${step.weeks}주) 동안 통학하고, 기간이 끝나면 기숙사로 돌아간다. 다음 강제 퇴사는 ${expulsionStep(s.dorm.expulsions + 1) ? `${expulsionStep(s.dorm.expulsions + 1).days}일` : '영구 강제 퇴사'}이다.` : '다섯 번째 강제 퇴사 처분으로 기숙사에서 영구 강제 퇴사하게 되었다. 졸업할 때까지 통학하며 학교생활을 이어 가야 한다.';
      return { id: 'campus_dorm_notice', title: step ? `기숙사 강제 퇴사 ${step.days}일` : '기숙사 영구 강제 퇴사', description: desc, choices: [
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
        messages.push(step ? `누적 적발 기록으로 기숙사 강제 퇴사 ${step.days}일(${step.weeks}주)이 결정되었다. 그동안 통학한다.` : '다섯 번째 강제 퇴사로 기숙사 영구 강제 퇴사가 결정되었다. 재학을 유지하며 통학하는 생활로 바뀐다.');
        events.push(dormNotice(s));
      }
      return { messages, events };
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
        messages.push(`강제 퇴사 기간이 끝나 기숙사로 돌아왔다. 적발 기록은 새로 시작하지만, 다음 강제 퇴사는 ${expulsionStep(s.dorm.expulsions + 1) ? `${expulsionStep(s.dorm.expulsions + 1).days}일` : '영구 강제 퇴사'}이다.`);
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
      if (now - history.lastTurn < 2 || rng(s) >= 0.72) return [];
      const candidates = [{ id: 'earn', weight: 1 }, { id: 'device_study', weight: 0.7 }];
      if (s.dorm.status !== 'expelled') {
        candidates.push({ id: 'device_dorm', weight: 0.7 });
        if (s.money.balance >= 12000) candidates.push({ id: 'delivery', weight: 0.8 });
      }
      let draw = rng(s) * candidates.reduce((sum, c) => sum + c.weight, 0);
      let chosen = candidates[candidates.length - 1];
      for (const c of candidates) { draw -= c.weight; if (draw < 0) { chosen = c; break; } }
      history.lastTurn = now;
      // v0.14 복잡도 개선: 배달·전자기기·용돈 벌이 같은 기회 사건은 절반만 묻습니다.
      if (rng(s) >= 0.5) return [];
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
      return { handled: false, messages, events };
    }
    function getDormStatus(s) {
      const expelled = s.dorm.status === 'expelled', permanent = expelled && !Number.isFinite(s.dorm.returnTurn);
      const next = expulsionStep((s.dorm.expulsions || 0) + 1), weeksLeft = expelled && !permanent ? Math.max(1, s.dorm.returnTurn - s.turn) : 0;
      const nextText = next ? `다음 강제 퇴사는 ${next.days}일(${next.weeks}주)` : '다음 강제 퇴사는 영구 강제 퇴사';
      return { ...s.dorm, permanent, weeksLeft, label: !expelled ? '기숙사 생활 중' : permanent ? '기숙사 영구 강제 퇴사 · 통학 중' : `기숙사 강제 퇴사 · 통학 중 (${weeksLeft}주 뒤 복귀)`, isResident: !expelled, deliveryLimit: 2, electronicsLimit: 4, description: expelled ? `재학은 계속됩니다. 통학으로 매주 피로도 +6, 학습량 −0.4가 적용돼요. ${permanent ? '영구 강제 퇴사라 돌아갈 수 없어요.' : `${weeksLeft}주 뒤 기숙사로 돌아가요. ${nextText}예요.`}` : `배달 적발 2회 또는 전자기기 적발 4회가 되면 강제 퇴사돼요. 강제 퇴사는 5일 → 10일 → 30일 → 90일 → 영구 순으로 길어져요.${s.dorm.expulsions ? ` 지금까지 ${s.dorm.expulsions}회 강제 퇴사 · ${nextText}예요.` : ''}` };
    }
    return { init, migrate, actions, shopItems, validateAction, beginWeek, handleAction, weekly, automaticEvents, checkDiscipline, resolve, handleChoice: resolve, getShop, buyItem, setGender, getDormStatus, classmates, shopPeriod, shopStock };
  }
  const api = { createAPI, actions, shopItems, classmates };
  root.GSACampusSystems = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
