(function (root) {
  'use strict';
  const CLUBS = [{ id: 'basketball', name: '농구부' }, { id: 'soccer', name: '축구부' }];
  const STAGE_IDS = ['tournament_bus', 'tournament_opening', 'tournament_closegame', 'tournament_final'];
  function createAPI(hooks) {
    const { rng, shift, clamp, getPhase, assertAlive } = hooks;
    const cap = (n, lo, hi) => clamp ? clamp(n, lo, hi) : Math.max(lo, Math.min(hi, n));
    const stat = (s, key) => Number.isFinite(s.stats?.[key]) ? s.stats[key] : 0;
    const yearOf = s => getPhase ? getPhase(s).year : Math.floor(Math.min(s.turn, 47) / 16) + 1;
    const clubName = id => CLUBS.find(c => c.id === id)?.name || '운동부';
    function alive(s) { if (assertAlive) assertAlive(s); else if (s.alive === false) throw new Error('이야기가 끝난 뒤에는 대회에 참가할 수 없어요.'); }
    function init(s) {
      if (!Array.isArray(s.tournamentRuns)) s.tournamentRuns = [];
      if (!Array.isArray(s.tournamentHistory)) s.tournamentHistory = [];
      if (!Array.isArray(s.awards)) s.awards = [];
      if (!Array.isArray(s.badges)) s.badges = [];
      return s;
    }
    function migrate(s) { return init(s); }
    function getEligibility(s) {
      return s.alive !== false && Array.isArray(s.sportsClubs) && s.sportsClubs.some(id => CLUBS.some(c => c.id === id)) && stat(s, 'athletics') >= 45 && ((s.sportsWeeks || 0) >= 1 || (s.clubWeeks || 0) >= 2);
    }
    function getSelectionChance(s) {
      const athletics = cap((stat(s, 'athletics') - 45) / 55, 0, 1);
      const practice = cap(Math.max(s.sportsWeeks || 0, (s.clubWeeks || 0) / 2) / 8, 0, 1);
      return cap(0.55 + athletics * 0.25 + practice * 0.06 + stat(s, 'social') * 0.0002 + stat(s, 'luck') * 0.0002, 0.55, 0.9);
    }
    function startEvent(s, explicitYear) {
      init(s);
      const year = Number.isInteger(explicitYear) ? explicitYear : yearOf(s);
      const active = s.tournamentRuns.find(r => r.year === year && r.selected && !r.completed);
      if (active) return storyEvent(active);
      if (s.tournamentHistory.some(h => h.year === year)) return { id: 'sports_tournament', tournamentYear: year, title: '교육감배의 기억', description: '올해의 교육감배 이야기는 이미 기록되어 있다. 다음 학교생활로 돌아가자.', choices: [{ label: '팀원들과의 기억을 간직한다', description: '이미 기록된 결과를 유지한다.', tournamentSeen: true }] };
      const eligible = getEligibility(s), joined = CLUBS.filter(c => (s.sportsClubs || []).includes(c.id));
      return { id: 'sports_tournament', tournamentYear: year, title: `${year}학년 여름, 교육감배 대표 선발`, description: eligible ? '기초 실력과 팀 활동 경험을 갖춰 대표 선발에 지원할 수 있다. 선발에서는 운동 능력과 평소 연습, 팀워크를 함께 본다. 대표가 되면 팀원들과 대회 이야기를 이어간다.' : joined.length ? '교육감배 대표 선발이 열렸다. 운동 45 이상에 운동부 훈련 1회 또는 동아리 활동 2회가 필요하다. 평소 활동으로 다음 기회를 준비할 수 있다.' : '운동부 친구들이 교육감배 대표 선발을 준비하고 있다. 농구부나 축구부에 가입하면 대표 선발에 도전할 수 있다.', choices: eligible ? [...joined.map(c => ({ label: `${c.name} 대표 선발에 지원한다`, description: joined.length > 1 ? '이번 대회는 이 종목의 팀원들과 함께한다.' : '평소 연습한 실력과 팀워크를 보여준다.', tournamentClub: c.id, tournamentYear: year })), { label: '이번에는 팀원들을 응원한다', description: '선수로 참가하지 않고 학교생활을 이어간다.', skipTournament: true, tournamentYear: year }] : [{ label: '다음 기회를 준비하며 응원한다', description: '경기를 보며 팀원들을 응원한다.', skipTournament: true, tournamentYear: year, effects: { social: 2 } }] };
    }
    function storyEvent(run) {
      const b = run.clubId === 'basketball', step = run.stage;
      const scenes = [
        {
          title: b ? '교육감배 농구 · 체육관으로 가는 버스' : '교육감배 축구 · 경기장으로 가는 버스',
          description: b ? '유니폼을 담은 가방이 발밑에 놓여 있다. 친구들은 상대 팀 이야기를 하다가도 창밖을 본다. 긴장한 후배가 오늘 자신의 역할을 묻는다.' : '버스가 경기장에 가까워지자 친구들이 정강이 보호대를 꺼낸다. 선발 명단을 확인한 후배가 자신의 위치와 역할을 다시 묻는다.',
          choices: [
            { label: b ? '수비 위치와 패스 약속을 함께 확인한다' : '수비 간격과 압박 시작 위치를 함께 확인한다', description: '같은 장면을 떠올리며 약속을 맞춘다.', effects: { leadership: 1, social: 1, discipline: 1 } },
            { label: '가볍게 이야기하며 긴장을 풀어준다', description: '친구와 후배의 마음을 편하게 해준다.', effects: { social: 2, stress: -3 }, bond: 3 },
            { label: '조용히 눈을 감고 자신의 움직임을 그려본다', description: '경기에 집중할 준비를 한다.', effects: { discipline: 2, stress: -2 } }
          ]
        },
        {
          title: b ? '첫 경기 · 첫 번째 공 소리' : '첫 경기 · 킥오프 휘슬',
          description: b ? '낯선 체육관에서 공 튀는 소리가 유난히 크게 들린다. 첫 슛은 림을 맞고 나왔고, 상대는 빠르게 공격으로 전환한다. 몸이 조금씩 경기에 적응하고 있다.' : '킥오프 직후 패스가 잔디에서 예상보다 빠르게 흐른다. 첫 공격은 끊겼고 상대가 측면으로 달려온다. 팀원들이 서로의 이름을 크게 부른다.',
          choices: [
            { label: b ? '빠르게 돌아가 수비부터 단단히 한다' : '수비 위치로 복귀해 동료와 간격을 맞춘다', description: '당장 할 수 있는 역할부터 해낸다.', effects: { athletics: 1, discipline: 1, fatigue: 2 } },
            { label: b ? '쉬운 패스로 팀의 흐름을 찾는다' : '짧은 패스를 연결하며 팀의 호흡을 찾는다', description: '혼자 해결하기보다 동료와 리듬을 만든다.', effects: { social: 1, leadership: 1, fatigue: 1 }, bond: 2 },
            { label: b ? '벤치와 눈을 맞추고 다음 플레이를 확인한다' : '벤치의 지시를 확인하고 자신의 위치를 조정한다', description: '상황을 읽고 팀의 계획에 맞춘다.', effects: { discipline: 2, fatigue: 1 } }
          ]
        },
        {
          title: b ? '접전 · 마지막 쿼터의 작전 시간' : '접전 · 후반전의 짧은 멈춤',
          description: b ? '점수 차가 크지 않은 채 마지막 쿼터가 다가온다. 팀원의 실책 뒤 분위기가 잠깐 가라앉았다. 물을 마시며 서로의 숨소리를 듣는 몇 초 동안 무엇을 말할지 생각한다.' : '후반전, 승부를 쉽게 예측하기 어렵다. 팀원의 패스 실수로 위험한 장면이 있었고 모두 숨이 차 있다. 공이 밖으로 나간 짧은 틈에 동료들이 모인다.',
          choices: [
            { label: '실수한 친구를 격려하고 다음 역할을 확인한다', description: '지나간 장면보다 다음 플레이에 집중한다.', effects: { social: 2, leadership: 2, stress: -2 }, bond: 3 },
            { label: b ? '남은 체력을 생각해 수비 역할을 나눈다' : '지친 동료를 살피며 압박과 복귀 역할을 나눈다', description: '끝까지 움직일 수 있도록 부담을 조절한다.', effects: { resilience: 1, leadership: 1, fatigue: -2 } },
            { label: b ? '상대 움직임에서 발견한 점을 짧게 전달한다' : '상대의 빈 공간과 움직임을 짚어준다', description: '본 것을 정리해 팀원들과 공유한다.', effects: { intelligence: 1, leadership: 1, discipline: 1 } }
          ]
        },
        {
          title: b ? '마지막 경기 · 버저가 울릴 때까지' : '마지막 경기 · 종료 휘슬까지',
          description: b ? '남은 시간을 알리는 숫자가 줄어든다. 바닥에 떨어진 공을 향해 몸을 낮추고, 친구에게 마지막 패스를 보낸다. 결과를 확인할 순간이 다가온다.' : '심판이 시계를 확인한다. 끝까지 공을 따라 뛰며 동료의 위치를 살핀다. 마지막 플레이가 끝나면 이번 교육감배의 결과를 확인하게 된다.',
          choices: [
            { label: '끝까지 집중하고 팀원들과 결과를 기다린다', description: '대회를 마무리한 뒤 실제 경기 결과와 메달 여부가 기록된다.', effects: { discipline: 1, fatigue: 2 } },
            { label: '동료를 격려하며 마지막까지 함께 뛴다', description: '모든 경기를 마친 뒤 팀의 결과를 확인한다.', effects: { social: 1, fatigue: 2 }, bond: 2 },
            { label: '자신의 역할을 끝까지 지키고 마무리한다', description: '마지막 경기가 끝나면 대회 결과를 확인한다.', effects: { athletics: 1, fatigue: 2 } }
          ]
        }
      ];
      const scene = scenes[step];
      if (!scene) throw new Error('대회 진행 단계를 확인할 수 없어요.');
      return { id: STAGE_IDS[step], tournamentKey: run.key, tournamentYear: run.year, tournamentStep: step, title: scene.title, description: scene.description, choices: scene.choices.map(c => ({ ...c, tournamentStory: true })) };
    }
    function addEffects(s, choice) {
      if (choice.effects) shift(s, choice.effects);
      if (choice.bond) s.relationships = cap((s.relationships || 0) + choice.bond, 0, 100);
    }
    function terminalHistory(s, record) {
      if (s.tournamentHistory.some(h => h.year === record.year)) return false;
      s.tournamentHistory.push(record); return true;
    }
    function resolve(s, event, choice) {
      const mine = choice.tournamentClub || choice.participateTournament || choice.skipTournament || choice.tournamentStory || choice.tournamentSeen;
      if (!mine) return { handled: false, messages: [], events: [] };
      alive(s); init(s);
      const year = choice.tournamentYear || event.tournamentYear || yearOf(s);
      if (choice.tournamentSeen) return { handled: true, messages: ['올해 교육감배의 결과를 간직하고 학교생활을 이어간다.'], events: [] };
      if (choice.tournamentStory) {
        const run = s.tournamentRuns.find(r => r.key === event.tournamentKey);
        if (!run || !run.selected || run.completed || run.stage !== event.tournamentStep) throw new Error('이미 마쳤거나 현재 진행 단계가 아닌 대회 장면이에요.');
        if (s.tournamentHistory.some(h => h.year === run.year)) throw new Error('올해의 대회 결과는 이미 기록되어 있어요.');
        addEffects(s, choice); run.choices.push({ stage: run.stage, label: choice.label }); run.stage++;
        if (run.stage < 4) return { handled: true, messages: [`${event.title}: ${choice.label}.`], events: [storyEvent(run)] };
        // Award only after all four scenes. Completing a story cannot be used to reroll a medal.
        run.medal = rng(s) < 0.1; run.completed = true; run.completedTurn = s.turn;
        terminalHistory(s, { year: run.year, clubId: run.clubId, selected: true, participated: true, medal: run.medal, turn: s.turn, storyCompleted: true, key: run.key });
        if (run.medal) {
          const id = `sports:${run.year}:${run.clubId}`;
          if (!s.awards.some(a => a.id === id || (a.kind === 'sports' && a.year === run.year))) {
            const award = { id, kind: 'sports', name: `교육감배 ${clubName(run.clubId)} 메달`, year: run.year, turn: s.turn };
            s.awards.push(award); s.badges.push(award.name);
          }
          return { handled: true, messages: [`${clubName(run.clubId)} 팀원들과 마지막 경기까지 마쳐 교육감배 메달을 받았다! 서로의 어깨를 두드리며 경기장을 나섰다.`], events: [] };
        }
        return { handled: true, messages: [`${clubName(run.clubId)} 교육감배의 모든 경기를 마쳤다. 이번에는 메달에 닿지 못했지만, 함께 뛰고 서로를 격려한 순간들이 남았다.`], events: [] };
      }
      if (s.tournamentHistory.some(h => h.year === year)) throw new Error('올해의 대회 결과는 이미 기록되어 있어요.');
      const active = s.tournamentRuns.find(r => r.year === year && r.selected && !r.completed);
      if (active) return { handled: true, messages: ['진행 중인 교육감배 이야기를 이어간다.'], events: [storyEvent(active)] };
      if (choice.skipTournament) {
        addEffects(s, choice);
        terminalHistory(s, { year, clubId: null, selected: false, participated: false, medal: false, turn: s.turn, status: 'skipped' });
        return { handled: true, messages: ['이번 교육감배에는 선수로 참가하지 않고 팀원들을 응원했다.'], events: [] };
      }
      if (!getEligibility(s)) throw new Error('운동부 가입 후 운동 45 이상, 운동부 훈련 1회 또는 동아리 활동 2회를 갖추면 대표 선발에 지원할 수 있어요.');
      // A v4 pending event did not store a chosen sport. Ask dual members instead of silently choosing.
      if (choice.participateTournament && (s.sportsClubs || []).length > 1 && !choice.tournamentClub) return { handled: true, messages: ['이번 대회에서 함께할 운동부를 선택한다.'], events: [startEvent(s, year)] };
      const clubId = choice.tournamentClub || (s.sportsClubs || [])[0];
      if (!CLUBS.some(c => c.id === clubId) || !s.sportsClubs.includes(clubId)) throw new Error('가입한 운동부로만 대표 선발에 지원할 수 있어요.');
      if (s.tournamentRuns.some(r => r.year === year)) throw new Error('올해 대표 선발에는 이미 지원했어요.');
      const chance = getSelectionChance(s), selected = rng(s) < chance;
      const run = { key: `tournament:${year}:${clubId}`, year, clubId, stage: 0, selected, selectionChance: chance, completed: !selected, choices: [], medal: null, startedTurn: s.turn };
      s.tournamentRuns.push(run);
      if (!selected) {
        run.medal = false; terminalHistory(s, { year, clubId, selected: false, participated: false, medal: false, turn: s.turn, status: 'not_selected' });
        shift(s, { resilience: 1 });
        return { handled: true, messages: [`이번 ${clubName(clubId)} 대표 명단에는 들지 못했다. 지원하며 얻은 경험을 바탕으로 다음 대회를 준비하기로 했다.`], events: [] };
      }
      shift(s, { social: 1, athletics: 1 });
      return { handled: true, messages: [`${clubName(clubId)} 교육감배 학교 대표로 선발됐다! 이제 팀원들과 함께 대회장으로 향한다.`], events: [storyEvent(run)] };
    }
    return { init, migrate, getEligibility, getSelectionChance, startEvent, resolve };
  }
  const API = { createAPI };
  root.GSATournamentSystems = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
