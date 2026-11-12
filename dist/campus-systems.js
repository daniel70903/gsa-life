(function (root) {
  'use strict';
  const shopItems = [
    { id: 'energy', name: '에너지 음료', price: 3000, description: '잠깐 정신을 깨우지만 충분한 수면을 대신하지는 못해요.', effectsText: '피로도 −14 · 다음 주 반동 +9', fatigue: -14, rebound: 9 },
    { id: 'snack', name: '작은 간식', price: 2000, description: '쉬는 시간에 즐기는 소소한 간식이에요.', effectsText: '스트레스 −8 · 피로도 −2', fatigue: -2, stress: -8 },
    { id: 'meal', name: '든든한 식사', price: 5000, description: '끼니를 챙기고 잠깐 쉬어 가요.', effectsText: '피로도 −9 · 스트레스 −3', fatigue: -9, stress: -3 }
  ];
  const actions = [
    { id: 'earn', name: '용돈 벌기', icon: 'spark', description: '내가 잘하는 일을 살려 작은 작업과 도움 활동을 해요.', effectsText: '보유금 ↑ · 피로도 ↑ · 한 주 사용' },
    { id: 'romance', name: '마음 나누기', icon: 'heart', description: '또래 친구와 대화하며 서로의 마음을 천천히 알아가요.', effectsText: '관계의 변화 · 서로의 선택을 존중' },
    { id: 'delivery', name: '기숙사 배달', icon: 'ball', description: '기숙사에서 배달 음식을 주문해요. 적발되면 기록이 남아요.', effectsText: '12,000원 · 피로·스트레스 ↓ · 적발 2회 시 퇴사' },
    { id: 'device_dorm', name: '기숙사 전자기기', icon: 'book', description: '기숙사에서 허용되지 않은 시간에 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 피로도 ↑ · 전자기기 적발 누적' },
    { id: 'device_study', name: '자습실 전자기기', icon: 'book', description: '자습실에서 허용되지 않은 용도로 전자기기를 사용해요.', effectsText: '스트레스 ↓ · 학습 효율 ↓ · 전자기기 적발 누적' }
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
        const startingBalance = Math.round(clamp(25000 + (65 - mean) * 2000, 25000, 140000) / 1000) * 1000;
        s.financialStrength = round(100 - mean);
        s.money = { balance: startingBalance, startingBalance, allowance: 10000, ledger: [{ turn: s.turn, amount: startingBalance, reason: options.legacy ? '이어서 시작하는 생활비' : '입학 생활비', balance: startingBalance }], purchasesThisWeek: 0, purchaseTurn: weekClock(s), lastWeeklyTurn: weekClock(s) - 1, pendingRebound: 0, reboundTurn: null, reboundSchedule: [] };
      }
      if (!Array.isArray(s.money.reboundSchedule)) s.money.reboundSchedule = s.money.pendingRebound > 0 && s.money.reboundTurn !== null ? [{ turn: s.money.reboundTurn, amount: s.money.pendingRebound }] : [];
      if (!s.dorm) s.dorm = { status: 'resident', deliveryCaught: 0, electronicsCaught: 0, expelledTurn: null };
      if (!s.romance) s.romance = { stage: 'none', bond: 0, meetings: 0, partnerName: '하늘', lastEventTurn: -10, cooldownUntil: 0 };
      if (!['male', 'female'].includes(s.gender)) s.gender = ['male', 'female'].includes(options.gender) ? options.gender : null;
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
      if (s.money.purchaseTurn !== weekClock(s)) { s.money.purchaseTurn = weekClock(s); s.money.purchasesThisWeek = 0; }
    }
    function getShop(s) {
      const count = s.money.purchaseTurn === weekClock(s) ? s.money.purchasesThisWeek : 0;
      return shopItems.map(item => {
        let disabledReason = '';
        if (isTerminal(s)) disabledReason = '이야기가 마무리되었어요';
        else if (s.pendingEvent || s.emergency) disabledReason = '진행 중인 사건을 먼저 마무리해 주세요';
        else if (count >= 2) disabledReason = '이번 주에는 2개를 모두 구매했어요';
        else if (s.money.balance < item.price) disabledReason = '보유금이 부족해요';
        return { ...item, disabledReason, available: !disabledReason };
      });
    }
    function buyItem(s, id) {
      assertSideAction(s);
      const item = shopItems.find(x => x.id === id);
      if (!item) throw new Error('구매할 물건을 다시 골라 주세요.');
      const count = s.money.purchaseTurn === weekClock(s) ? s.money.purchasesThisWeek : 0;
      if (count >= 2) throw new Error('상점에서는 한 주에 2개까지 살 수 있어요.');
      if (!Number.isFinite(s.money.balance) || s.money.balance < item.price) throw new Error('보유금이 부족해요.');
      // All validations precede the debit and effects, including the per-week cap.
      syncPurchaseTurn(s);
      ledger(s, -item.price, item.name);
      s.money.purchasesThisWeek++;
      const effects = { fatigue: item.fatigue || 0, stress: item.stress || 0 };
      shift(s, effects);
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
    function dormNotice(s) {
      return { id: 'campus_dorm_notice', title: '기숙사 퇴사 안내', description: '누적된 생활 규정 위반으로 기숙사를 나가게 되었다. 학교생활은 계속되지만 앞으로는 통학 시간과 피로를 관리해야 한다.', choices: [
        { label: '통학 계획을 세운다', description: '학교생활을 계속하며 새 일과를 준비한다.', campusChoice: 'commute' },
        { label: '주변에 도움을 요청한다', description: '가족과 선생님에게 통학 준비를 의논한다.', campusChoice: 'support' }
      ] };
    }
    function recordViolation(s, kind, messages, events) {
      const isDelivery = kind === 'delivery';
      const key = isDelivery ? 'deliveryCaught' : 'electronicsCaught';
      const limit = isDelivery ? 2 : 5;
      s.dorm[key]++;
      messages.push(`${isDelivery ? '배달 음식' : '전자기기 사용'}이 적발되어 누적 ${s.dorm[key]}회가 되었다.`);
      if (s.dorm.status !== 'expelled' && s.dorm[key] >= limit) {
        s.dorm.status = 'expelled'; s.dorm.expelledTurn = s.turn;
        messages.push('기숙사에서 퇴사했다. 학교에 재학하며 통학하는 생활로 바뀐다.');
        events.push(dormNotice(s));
      }
    }
    function romanceEvent(s, type) {
      const name = s.romance.partnerName;
      if (type === 'meet') return { id: 'campus_romance_meet', title: '조금 더 알고 싶은 친구', description: `가상의 동갑 친구 ${withParticle(name)} 같은 모둠이 되었다. 잠깐 이야기를 나눌 시간이 생겼다.`, choices: [
        { label: '좋아하는 것을 물어본다', description: '서로 편한 만큼 천천히 대화한다.', campusChoice: 'hello' },
        { label: '오늘은 인사만 나눈다', description: '서두르지 않고 각자의 시간을 보낸다.', campusChoice: 'greet' }
      ] };
      if (type === 'invite') return { id: 'campus_romance_invite', title: '우정에서 한 걸음', description: `${withParticle(name)} 함께하는 시간이 편안해졌다. 내 마음을 말하더라도 상대의 대답은 상대가 정할 수 있다.`, choices: [
        { label: '좋아하는 마음을 솔직히 전한다', description: '어떤 대답이든 존중하며 이야기한다.', campusChoice: 'ask' },
        { label: '지금처럼 친구로 지낸다', description: '함께하는 우정도 충분히 소중하다.', campusChoice: 'friend' },
        { label: '내 마음을 조금 더 생각해 본다', description: '서두르지 않고 나만의 시간을 갖는다.', campusChoice: 'wait' }
      ] };
      return { id: 'campus_romance_date', title: '서로의 시간을 존중하며', description: `${withParticle(name)} 이번 주에 어떻게 시간을 보낼지 이야기했다. 가까운 사이에도 각자의 공부와 휴식은 필요하다.`, choices: [
        { label: '함께 짧게 산책한다', description: '대화하며 기분을 환기한다.', campusChoice: 'walk' },
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
        const reward = Math.min(16000, 6000 + Math.floor(best / 5) * 500);
        ledger(s, reward, '도움 활동과 작은 작업');
        shift(s, { fatigue: 6, stress: 2 });
        messages.push(`나의 강점을 살린 작은 작업으로 ${reward.toLocaleString('ko-KR')}원을 벌었다.`);
      } else if (id === 'delivery') {
        ledger(s, -12000, '기숙사 배달 음식');
        shift(s, { fatigue: -7, stress: -8 });
        messages.push('기숙사에서 배달 음식을 먹었다. 12,000원을 사용했다.');
        if (rng(s) < 0.4) recordViolation(s, 'delivery', messages, events);
        else messages.push('이번에는 적발되지 않았다. 누적 기록은 그대로 남는다.');
      } else if (id === 'device_dorm' || id === 'device_study') {
        shift(s, { fatigue: 5, stress: -7 });
        if (id === 'device_study') addLearning(s, -0.6);
        if (rng(s) < (id === 'device_dorm' ? 0.36 : 0.46)) recordViolation(s, 'electronics', messages, events);
        else messages.push('전자기기를 사용하며 시간을 보냈다. 이번에는 적발되지 않았다.');
      } else if (id === 'romance') {
        const r = s.romance;
        r.meetings++;
        shift(s, { stress: -3 });
        if (s.turn < r.cooldownUntil) messages.push('서로의 시간을 존중하며 오늘은 친구들과 평범한 하루를 보냈다.');
        else if (r.stage === 'none' || r.stage === 'ended') events.push(romanceEvent(s, 'meet'));
        else if (r.stage === 'friendship') {
          r.bond = clamp(r.bond + 8);
          shift(s, { social: 1.2 });
          if (r.bond >= 44 && s.turn - r.lastEventTurn >= 3) events.push(romanceEvent(s, 'invite'));
          else messages.push(`${withParticle(r.partnerName)} 편하게 대화하며 조금 더 가까워졌다.`);
        } else if (r.stage === 'dating') {
          r.bond = clamp(r.bond + 4);
          if (s.turn - r.lastEventTurn >= 2) events.push(romanceEvent(s, 'date'));
          else messages.push(`${withParticle(r.partnerName)} 짧게 안부를 나누고 서로의 하루를 응원했다.`);
        }
        if (events.length) r.lastEventTurn = s.turn;
      }
      return { handled: true, messages, events };
    }
    function weekly(s, id, context = {}) {
      const began = beginWeek(s), result = handleAction(s, id);
      const messages = [...began.messages, ...result.messages];
      // Existing boarders and commuters incur different travel costs. Expulsion is not a school withdrawal.
      if (s.dorm.status === 'expelled' && s.dorm.expelledTurn < s.turn) {
        shift(s, { fatigue: 6 }); addLearning(s, -0.4);
        messages.push('통학에 시간이 들어 피로가 쌓이고 개인 학습 시간이 조금 줄었다.');
      }
      return { handled: result.handled, messages, events: result.events };
    }
    function resolve(s, event, choice) {
      const messages = [], events = [];
      if (!event || !String(event.id).startsWith('campus_')) return { handled: false, messages, events };
      const c = typeof choice === 'number' ? event.choices[choice] : choice;
      assertAlive(s);
      if (!c || !c.campusChoice) throw new Error('지금 가능한 선택지를 골라 주세요.');
      if (event.id === 'campus_dorm_notice') {
        if (!['commute', 'support'].includes(c.campusChoice)) throw new Error('통학 준비 방법을 선택해 주세요.');
        messages.push(c.campusChoice === 'support' ? '주변의 도움을 받아 통학 일과를 준비했다.' : '통학 시간과 휴식을 고려한 새 일과를 정했다.');
        return { handled: true, messages, events };
      }
      const r = s.romance, key = c.campusChoice;
      // Personal outcomes stay inside the simulation; prose never ranks genders or exposes these mechanics.
      const openness = (s.gender === 'female' ? 0.58 : 0.20) + (s.stats.social || 0) * 0.0015;
      if (event.id === 'campus_romance_meet') {
        if (key === 'hello') {
          if (rng(s) < clamp(openness + 0.12, 0.15, 0.94)) { r.stage = 'friendship'; r.bond = 20; shift(s, { social: 1 }); messages.push(`${withParticle(r.partnerName)} 관심사를 나누며 친구가 되었다.`); }
          else { r.stage = 'none'; r.cooldownUntil = s.turn + 2; messages.push('친구는 지금은 혼자 있고 싶다고 했다. 그 마음을 존중하고 가볍게 인사를 나눴다.'); }
        } else if (key === 'greet') { r.cooldownUntil = s.turn + 1; messages.push('반갑게 인사를 나누고 각자의 하루로 돌아갔다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_invite') {
        if (key === 'ask') {
          if (rng(s) < clamp(openness + (r.bond - 40) * 0.003, 0.1, 0.94)) { r.stage = 'dating'; r.bond = Math.max(r.bond, 50); shift(s, { stress: -4 }); messages.push('서로 같은 마음임을 확인했다. 각자의 일상도 존중하며 만나 보기로 했다.'); }
          else { r.stage = 'friendship'; r.bond = Math.max(20, r.bond - 5); r.cooldownUntil = s.turn + 4; messages.push('친구는 지금처럼 지내고 싶다고 말했다. 대답을 존중하고 편안한 친구 사이로 남기로 했다.'); }
        } else if (key === 'friend') { r.bond = clamp(r.bond + 3); r.cooldownUntil = s.turn + 4; messages.push('좋은 친구로 함께하는 시간을 이어 가기로 했다.'); }
        else if (key === 'wait') { r.cooldownUntil = s.turn + 3; messages.push('마음을 서두르지 않고 내 일상에 집중하기로 했다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else if (event.id === 'campus_romance_date') {
        if (key === 'walk') { r.bond = clamp(r.bond + 8); shift(s, { stress: -6, fatigue: -3 }); messages.push('함께 짧게 산책하며 서로의 이야기를 들었다.'); }
        else if (key === 'study') { r.bond = clamp(r.bond + 4); addLearning(s, 0.8); messages.push('같이 공부한 뒤 서로에게 충분한 휴식 시간을 주었다.'); }
        else if (key === 'space') { shift(s, { fatigue: -4 }); messages.push('이번 주는 각자의 시간을 보내기로 했다. 서로의 선택을 존중했다.'); }
        else if (key === 'end') { r.stage = 'ended'; r.bond = 15; r.cooldownUntil = s.turn + 4; messages.push('솔직하게 마음을 이야기하고 관계를 정중하게 마무리했다. 각자의 다음 이야기를 응원한다.'); }
        else throw new Error('지금 가능한 선택지를 골라 주세요.');
      } else return { handled: false, messages, events };
      r.lastEventTurn = s.turn;
      return { handled: true, messages, events };
    }
    function getDormStatus(s) {
      const expelled = s.dorm.status === 'expelled';
      return { ...s.dorm, label: expelled ? '기숙사 퇴사 · 통학 중' : '기숙사 생활 중', isResident: !expelled, deliveryLimit: 2, electronicsLimit: 5, description: expelled ? '재학은 계속됩니다. 통학으로 매주 피로도 +6, 학습량 −0.4가 적용돼요.' : '배달 적발 2회 또는 장소를 합산한 전자기기 적발 5회가 되면 기숙사에서 퇴사해요.' };
    }
    return { init, migrate, actions, shopItems, validateAction, beginWeek, handleAction, weekly, resolve, handleChoice: resolve, getShop, buyItem, setGender, getDormStatus };
  }
  const api = { createAPI, actions, shopItems };
  root.GSACampusSystems = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
