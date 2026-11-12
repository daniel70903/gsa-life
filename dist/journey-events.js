(function (root) {
  'use strict';

  // Original fictional travel scenes. School systems owns participation,
  // sequential delivery, and the once-only credit award after the final stage.
  const journeys = {
    jeju: [
      {
        id: 'journey_jeju_1',
        title: '제주 ① · 시험지를 접고, 지도를 펴다',
        description: '1학년 2학기 중간고사가 끝났다. 제주에 도착한 버스 안에서도 누군가는 시험 답을 맞춰 보고 있다. 창밖으로 검은 돌담과 바다가 보이자, 옆자리 친구가 오늘 탐방 지도를 펼친다. 이번 여행에서 무엇을 남겨 볼까?',
        context: 'journey', journey: 'jeju', step: 0,
        choices: [
          {label: '돌담과 해안에서 궁금한 점을 하나씩 적는다', description: '시험 문제 대신 내 질문으로 여행을 시작한다.', effects: {research: 2, creativity: 2, fatigue: 1}, learning: 1},
          {label: '평소 말하지 못했던 친구와 나란히 걷는다', description: '점수 이야기를 내려놓으니 새로운 대화가 이어진다.', effects: {social: 3, stress: -4}, bond: 5},
          {label: '창가에 기대 쉬고, 첫 풍경을 천천히 담는다', description: '빽빽했던 시험 일정에서 잠시 벗어난다.', effects: {fatigue: -6, stress: -5, creativity: 1}}
        ]
      },
      {
        id: 'journey_jeju_2',
        title: '제주 ② · 바람이 바꾼 탐방 계획',
        description: '해안 탐방을 시작하려는데 바람과 빗줄기가 굵어졌다. 인솔자의 안내로 모두 실내 전시 공간에 모였다. 팀 보고서에는 야외 관찰 항목이 아직 비어 있다. 친구가 “계획이 틀어졌는데, 우리 이제 뭐 하지?” 하고 묻는다.',
        context: 'journey', journey: 'jeju', step: 1,
        choices: [
          {label: '관찰한 사실과 아직 확인 못 한 것을 나눈다', description: '빈칸을 억지로 채우지 않고 다음에 확인할 질문을 만든다.', effects: {research: 3, discipline: 2, fatigue: 2}, learning: 1},
          {label: '전시 자료로 할 수 있는 탐구를 함께 찾는다', description: '친구들의 관심사를 모아 팀의 계획을 다시 짠다.', effects: {leadership: 2, social: 2, fatigue: 2}, bond: 4},
          {label: '계획이 바뀐 과정을 그림과 짧은 글로 남긴다', description: '예상 밖의 날씨도 여행에서 배운 장면이 된다.', effects: {creativity: 3, resilience: 1, stress: -2}}
        ]
      },
      {
        id: 'journey_jeju_3',
        title: '제주 ③ · 숙소의 작은 사진전',
        description: '저녁 정리를 마친 뒤, 방 친구들이 각자 찍은 사진을 한 장씩 보여 준다. 멋진 풍경 사이에 내가 굳은 표정으로 찍힌 사진도 있다. “아까 무슨 생각 했어?”라는 질문에 잠깐 조용해진다. 취침 시간까지는 조금 남았다.',
        context: 'journey', journey: 'jeju', step: 2,
        choices: [
          {label: '시험 뒤에도 남아 있던 걱정을 솔직히 말한다', description: '친구들의 비슷한 고민을 듣고 혼자만의 일이 아님을 느낀다.', effects: {social: 2, resilience: 2, stress: -5}, bond: 7, harmony: 6},
          {label: '사진마다 짧은 제목을 붙여 작은 앨범을 만든다', description: '서로의 시선이 달랐다는 사실이 재미있다.', effects: {creativity: 3, social: 1, fatigue: 2}, bond: 4},
          {label: '내 사진 한 장을 소개하고 먼저 잠자리에 든다', description: '좋았던 장면을 나눈 뒤 내일을 위해 충분히 쉰다.', effects: {fatigue: -7, stress: -3, discipline: 1}, bond: 2}
        ]
      },
      {
        id: 'journey_jeju_4',
        title: '제주 ④ · 돌아오는 길의 한 페이지',
        description: '돌아오는 차 안에서 처음 펼쳤던 지도에 메모를 덧붙인다. 못 간 장소도 있고, 계획에 없던 대화도 있다. 학교에 도착하면 다시 평소의 생활이 시작된다. 여행 정리의 마지막 한 페이지에 무엇을 남길까?',
        context: 'journey', journey: 'jeju', step: 3,
        choices: [
          {label: '답을 찾지 못한 질문과 작은 후속 탐구를 적는다', description: '제주에서 시작한 궁금증을 다음 수업까지 이어 간다.', effects: {research: 3, discipline: 1, fatigue: 1}, learning: 2},
          {label: '고마웠던 친구에게 짧은 여행 편지를 건넨다', description: '같이 다녀온 기억이 돌아온 뒤의 관계로 이어진다.', effects: {social: 2, leadership: 1, stress: -3}, bond: 7, harmony: 5},
          {label: '잊고 싶지 않은 풍경과 앞으로의 생활 약속을 적는다', description: '멈추어 쉬었던 감각을 일상에도 조금 남겨 둔다.', effects: {creativity: 2, resilience: 2, fatigue: -4, stress: -4}}
        ]
      }
    ],
    usa: [
      {
        id: 'journey_usa_1',
        title: '미국 ① · 아홉 날의 첫 페이지',
        description: '2학년 1학기를 마치고 떠난 7박 9일 글로벌 사이언스 챌린지. 긴 비행 뒤 도착하니 몸의 시계와 창밖의 시간이 다르다. 팀 친구들이 첫 일정과 탐구 수첩을 확인한다. 앞으로의 과학 체험을 위해 오늘은 무엇부터 챙길까?',
        context: 'journey', journey: 'usa', step: 0,
        choices: [
          {label: '가장 궁금한 과학 질문 세 가지를 영어로 정리한다', description: '완벽한 문장보다 꼭 묻고 싶은 내용을 먼저 잡는다.', effects: {research: 2, discipline: 2, fatigue: 3}, learning: 1},
          {label: '팀원들과 길 찾기·기록·질문 역할을 나눈다', description: '낯선 곳에서 서로 의지할 수 있도록 준비한다.', effects: {leadership: 3, social: 1, fatigue: 1}, bond: 4},
          {label: '필수 안내를 확인한 뒤 식사와 수면을 챙긴다', description: '시차에 적응하며 다음 날의 집중력을 아낀다.', effects: {fatigue: -8, stress: -3, resilience: 1}}
        ]
      },
      {
        id: 'journey_usa_2',
        title: '미국 ② · 질문이 목 끝에 걸린 순간',
        description: '여행 3일째, 과학 전시를 둘러본 뒤 안내자와 짧게 이야기할 시간이 생겼다. 설명 속의 한 실험이 고교 연구와 닮아 있다. 준비한 질문은 있지만 영어로 바로 꺼내려니 망설여진다. 옆의 친구도 수첩을 꼭 쥐고 있다.',
        context: 'journey', journey: 'usa', step: 1,
        choices: [
          {label: '핵심부터 짧게 묻고, 이해한 내용을 다시 확인한다', description: '말이 막혀도 질문을 끝까지 전해 보는 경험을 얻는다.', effects: {social: 2, research: 3, resilience: 1, stress: 2}, learning: 1},
          {label: '친구와 질문을 둘로 나누어 함께 이야기한다', description: '서로 빠뜨린 부분을 채우며 답을 기록한다.', effects: {social: 3, research: 2, fatigue: 1}, bond: 5},
          {label: '실험 그림으로 질문을 보여 주며 설명을 부탁한다', description: '말과 그림을 함께 써서 궁금한 지점을 구체화한다.', effects: {creativity: 3, research: 2, fatigue: 1}, learning: 1}
        ]
      },
      {
        id: 'journey_usa_3',
        title: '미국 ③ · 발표 전날의 뜻밖의 데이터',
        description: '여행 7일째, 팀별 과학 체험 결과를 발표하려는데 간이 실험의 값이 가설과 다르게 나왔다. 누군가는 결론을 바꾸자고 하고, 누군가는 측정을 더 해 보자고 한다. 발표 자료를 마칠 시간과 쉴 시간을 함께 생각해야 한다.',
        context: 'journey', journey: 'usa', step: 2,
        choices: [
          {label: '측정 한계를 밝히고 가능한 설명을 비교한다', description: '확실한 것과 추측을 구분해 정직한 발표를 만든다.', effects: {research: 4, discipline: 2, fatigue: 3}, learning: 1},
          {label: '짧게 재확인할 항목을 정하고 팀 역할을 나눈다', description: '모든 일을 늘리지 않고 핵심 검증에 힘을 모은다.', effects: {leadership: 3, research: 2, fatigue: 4}, bond: 4},
          {label: '친구의 반론을 듣고 질문 중심으로 발표를 고친다', description: '맞는 답 하나보다 서로 다른 해석의 근거를 보여 준다.', effects: {creativity: 3, social: 2, stress: -2}, bond: 4, learning: 1}
        ]
      },
      {
        id: 'journey_usa_4',
        title: '미국 ④ · 귀국편에서 쓰는 다음 질문',
        description: '여행 9일째, 귀국편 좌석에 앉아 수첩을 넘긴다. 어색하게 건넨 첫 질문, 예상과 달랐던 데이터, 함께 웃던 밤이 한 권에 남았다. 7박 9일의 일정은 끝났지만 관심사는 조금 달라졌다. 마지막 정리에서 무엇을 학교로 가져갈까?',
        context: 'journey', journey: 'usa', step: 3,
        choices: [
          {label: '우리 환경에서 다시 해 볼 수 있는 실험을 설계한다', description: '보았던 것을 그대로 따라 하기보다 내 조건에 맞는 질문을 만든다.', effects: {research: 4, creativity: 2, fatigue: 2}, learning: 2},
          {label: '팀의 발표와 도움받은 순간을 함께 기록한다', description: '혼자 얻기 어려웠던 배움을 다음 협업의 약속으로 남긴다.', effects: {leadership: 2, social: 3, stress: -3}, bond: 7, harmony: 4},
          {label: '관심 분야와 배워야 할 기초를 정리하고 눈을 붙인다', description: '앞으로의 공부 방향을 세운 뒤 긴 이동의 피로를 푼다.', effects: {discipline: 3, resilience: 1, fatigue: -6, stress: -3}, learning: 1}
        ]
      }
    ],
    byeonsan: [
      {
        id: 'journey_byeonsan_1',
        title: '변산 ① · 다시 함께 타는 버스',
        description: '2학년 2학기 중간고사 뒤, 변산으로 향하는 버스에 올랐다. 1년 전 제주에서 나란히 앉았던 친구도 이제 선택과목과 진로 이야기를 한다. 서로 달라진 것 같아 반갑기도, 조금 낯설기도 하다. 차가 출발하자 친구가 먼저 말을 건넨다.',
        context: 'journey', journey: 'byeonsan', step: 0,
        choices: [
          {label: '요즘 가장 재미있는 수업과 고민을 서로 이야기한다', description: '달라진 관심사를 듣고 지금의 친구를 다시 알아 간다.', effects: {social: 3, stress: -4}, bond: 6, harmony: 3},
          {label: '이번 탐방에서 비교할 관찰 항목을 함께 만든다', description: '작년 여행의 경험을 새로운 탐구 계획에 연결한다.', effects: {research: 2, leadership: 2, fatigue: 1}, learning: 1},
          {label: '짧게 안부를 나눈 뒤 창밖을 보며 쉰다', description: '시험 뒤에 쌓인 피로를 내려놓고 여행의 속도에 맞춘다.', effects: {fatigue: -6, stress: -4, resilience: 1}, bond: 2}
        ]
      },
      {
        id: 'journey_byeonsan_2',
        title: '변산 ② · 같은 해안을 보는 다른 눈',
        description: '안내된 탐방 구간에서 해안의 무늬와 바위 형태를 살펴본다. 한 친구는 침식에, 다른 친구는 생물의 흔적에 관심이 있다. 제한된 관찰 시간 안에 팀 기록을 완성하려면 각자의 시선을 어떻게 모을지 정해야 한다.',
        context: 'journey', journey: 'byeonsan', step: 1,
        choices: [
          {label: '위치와 관찰 조건을 맞추어 비교 가능한 기록을 만든다', description: '느낌을 넘어 다른 사람이 다시 확인할 수 있는 자료를 남긴다.', effects: {research: 3, discipline: 2, fatigue: 2}, learning: 1},
          {label: '서로 다른 관심사를 한 장의 관찰 지도로 묶는다', description: '혼자 보았다면 놓쳤을 장면이 연결된다.', effects: {creativity: 3, social: 2, fatigue: 1}, bond: 4},
          {label: '기록 역할을 번갈아 맡고 팀의 이동 속도를 맞춘다', description: '누구도 뒤처지지 않게 함께 탐방을 마친다.', effects: {leadership: 3, athletics: 1, fatigue: 2}, bond: 5}
        ]
      },
      {
        id: 'journey_byeonsan_3',
        title: '변산 ③ · 아직 정하지 못한 미래',
        description: '저녁 활동이 끝난 뒤 친구가 조용히 말한다. “다들 하고 싶은 게 있는 것 같은데, 나는 아직 잘 모르겠어.” 나도 확신이 있는 것은 아니다. 성적과 지원 대학 이야기로 바빠지기 전에 서로의 마음을 들여다볼 시간이 생겼다.',
        context: 'journey', journey: 'byeonsan', step: 2,
        choices: [
          {label: '답을 서두르지 않고 서로 흥미를 느꼈던 순간을 찾는다', description: '진로 이름 대신 실제로 즐거웠던 경험부터 이야기한다.', effects: {social: 3, resilience: 2, stress: -5}, bond: 7},
          {label: '다음 학기에 함께 해 볼 작은 탐구를 제안한다', description: '확신을 기다리기보다 부담 없는 시도를 약속한다.', effects: {research: 2, leadership: 2, creativity: 1}, bond: 5, learning: 1},
          {label: '나도 모르는 것이 많다고 털어놓고 조용히 걷는다', description: '바로 결론을 내리지 않아도 함께할 수 있다는 안도감을 얻는다.', effects: {resilience: 3, fatigue: -3, stress: -6}, bond: 5, harmony: 3}
        ]
      },
      {
        id: 'journey_byeonsan_4',
        title: '변산 ④ · 3학년의 나에게',
        description: '돌아오기 전, 여행 기록의 마지막 장에 짧은 편지를 쓴다. 제주에서 시작한 첫 여행과 미국에서 품었던 질문, 오늘 친구와 나눈 말이 떠오른다. 곧 2학년을 마치고 3학년을 준비하게 된다. 미래의 나에게 어떤 문장을 남길까?',
        context: 'journey', journey: 'byeonsan', step: 3,
        choices: [
          {label: '“내 질문을 끝까지 설명할 수 있도록 기록하자.”', description: '여행에서 익힌 관찰과 설명을 연구·수업으로 이어 간다.', effects: {research: 3, discipline: 2, fatigue: 1}, learning: 2},
          {label: '“혼자 잘하려다 함께했던 사람을 잊지 말자.”', description: '익숙해진 친구들에게 고마움을 전하며 여행을 마친다.', effects: {social: 3, leadership: 1, stress: -3}, bond: 7, harmony: 6},
          {label: '“속도가 달라도, 쉬었다가 다시 해도 괜찮다.”', description: '남은 학교생활에서 지키고 싶은 내 생활의 속도를 정한다.', effects: {resilience: 3, discipline: 1, fatigue: -5, stress: -5}}
        ]
      }
    ]
  };

  root.GSAJourneyEvents = journeys;
  if (typeof module !== 'undefined' && module.exports) module.exports = journeys;
})(typeof window !== 'undefined' ? window : globalThis);
