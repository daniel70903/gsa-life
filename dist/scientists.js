/* GSA LIFE · 컴패리즌: 3년의 기록과 가장 닮은 과학자·수학자를 찾습니다.
   인물 소개는 공개 자료(노벨상·필즈상 공식 발표, 대학·언론 보도, 전기)를 바탕으로 짧게 요약했습니다.
   닮은 정도는 게임 속 재미 요소이며, 실제 인물에 대한 평가가 아닙니다. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSAComparison = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  // 능력치 순서: 지능, 사회성, 운동, 자기관리, 행운, 창의성, 회복력, 리더십, 연구 역량
  const STATS = ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership', 'research'];
  const STAT_LABELS = { intelligence: '지능', social: '사회성', athletics: '운동', discipline: '자기관리', luck: '행운', creativity: '창의성', resilience: '회복력', leadership: '리더십', research: '연구 역량' };
  const FIELDS = ['math', 'physics', 'chemistry', 'biology', 'earth', 'ai'];
  const FIELD_LABELS = { math: '수학', physics: '물리학', chemistry: '화학', biology: '생명과학', earth: '지구과학·천문학', ai: '정보·인공지능' };

  // t: 위 능력치 순서대로 그 인물에게서 두드러지는 정도(-2~2). f: 분야 비중.
  const scientists = [
    { id: 'huh', name: '허준이', en: 'June Huh', years: '1983~', f: { math: 1 }, t: [1, 1, -1, 0, 1, 2, 1, -1, 1], tag: '2022 필즈상', known: '조합론과 대수기하학을 잇는 방법으로 리드 추측 등 오랜 난제를 풀어 한국계 최초로 필즈상을 받았어요.', story: '고등학교를 그만두고 시인을 꿈꾸다 대학에서 뒤늦게 수학에 빠졌고, 동료와 함께 생각하는 공동 연구를 수학의 가장 큰 즐거움으로 꼽았어요.' },
    { id: 'mirzakhani', name: '마리암 미르자하니', en: 'Maryam Mirzakhani', years: '1977~2017', f: { math: 1 }, t: [2, -1, -1, 1, 0, 2, 1, -1, 1], tag: '2014 필즈상', known: '곡면의 기하와 동역학 연구로 2014년 여성 최초의 필즈상 수상자가 되었어요.', story: '국제수학올림피아드에서 만점 금메달을 받았고, 큰 종이에 그림을 그리며 문제를 생각해 딸이 그 모습을 "그림 그리기"라고 불렀대요.' },
    { id: 'ramanujan', name: '스리니바사 라마누잔', en: 'Srinivasa Ramanujan', years: '1887~1920', f: { math: 1 }, t: [2, -1, -1, -1, 1, 2, 1, -2, 0], tag: '독학한 천재', known: '정식 대학 교육 없이 독학으로 수많은 공식을 발견했고, 케임브리지에서 하디와 함께 정수론의 새 장을 열었어요.', story: '1913년 하디에게 보낸 공식 가득한 편지 한 통이 인생을 바꿨어요. 엄밀한 증명보다 번뜩이는 직관이 먼저였던 수학자예요.' },
    { id: 'noether', name: '에미 뇌터', en: 'Emmy Noether', years: '1882~1935', f: { math: 0.75, physics: 0.25 }, t: [2, 0, -1, 1, -1, 1, 2, 0, 1], tag: '뇌터 정리', known: '대칭과 보존 법칙을 잇는 뇌터 정리를 증명하고, 현대 추상대수학의 틀을 세웠어요.', story: '여성이라는 이유로 오랫동안 보수 없이 강의해야 했지만, 괴팅겐에서 끝내 수학의 흐름을 바꿨어요.' },
    { id: 'turing', name: '앨런 튜링', en: 'Alan Turing', years: '1912~1954', f: { ai: 0.6, math: 0.4 }, t: [2, -2, 2, 1, -1, 1, 0, -1, 1], tag: '컴퓨터 과학의 아버지', known: '계산 가능성의 개념을 세우고 2차 세계대전 때 암호 해독에 기여해 현대 컴퓨터 과학의 기초를 놓았어요.', story: '마라톤을 2시간 46분에 완주해 1948년 영국 올림픽 대표 선발전에서 5위를 할 만큼 뛰어난 달리기 선수이기도 했어요.' },
    { id: 'hopper', name: '그레이스 호퍼', en: 'Grace Hopper', years: '1906~1992', f: { ai: 0.8, math: 0.2 }, t: [1, 1, 0, 1, 0, 1, 1, 2, 0], tag: '해군 준장 · COBOL', known: '초기 컴파일러를 만들고 사람이 읽기 쉬운 프로그래밍 언어 COBOL의 개발을 이끌었어요.', story: '미국 해군에서 준장으로 79세에 퇴역했고, 기계 속 나방 사건으로 "디버깅"이라는 말을 널리 알렸어요.' },
    { id: 'hinton', name: '제프리 힌턴', en: 'Geoffrey Hinton', years: '1947~', f: { ai: 0.8, physics: 0.2 }, t: [1, 0, -1, 1, 0, 1, 2, 0, 2], tag: '2024 노벨 물리학상', known: '인공 신경망으로 기계가 학습하는 방법을 연구해 2024년 노벨 물리학상을 받았어요.', story: '1990년대 학계가 신경망에 관심을 잃었을 때도 연구를 이어 간 끈기가 노벨위원회에서 언급됐어요.' },
    { id: 'hassabis', name: '데미스 허사비스', en: 'Demis Hassabis', years: '1976~', f: { ai: 0.6, chemistry: 0.2, biology: 0.2 }, t: [2, 1, -1, 1, 1, 1, 0, 2, 1], tag: '2024 노벨 화학상', known: '딥마인드를 세우고 단백질 구조를 예측하는 알파폴드를 만들어 2024년 노벨 화학상을 받았어요.', story: '네 살에 체스를 시작한 체스 신동이었고, 17세에 게임 「테마 파크」 개발에 참여했어요.' },
    { id: 'einstein', name: '알베르트 아인슈타인', en: 'Albert Einstein', years: '1879~1955', f: { physics: 1 }, t: [2, 0, -1, -1, 0, 2, 1, -1, 0], tag: '상대성 이론', known: '특수·일반 상대성 이론과 광전 효과 연구로 현대 물리학의 바탕을 바꿨어요.', story: '특허청 직원으로 일하던 1905년, 머릿속 사고 실험만으로 물리학을 뒤흔든 논문들을 잇달아 발표했어요.' },
    { id: 'feynman', name: '리처드 파인만', en: 'Richard Feynman', years: '1918~1988', f: { physics: 1 }, t: [1, 2, 0, -1, 0, 2, 0, 0, 1], tag: '1965 노벨 물리학상', known: '양자전기역학 연구로 노벨상을 받았고, 「파인만의 물리학 강의」로 수많은 학생을 물리학에 빠지게 했어요.', story: '봉고 드럼을 즐겨 쳤고, 로스앨러모스에서 금고 열기로 동료들을 놀라게 한 장난꾸러기 이야기꾼이었어요.' },
    { id: 'bohr', name: '닐스 보어', en: 'Niels Bohr', years: '1885~1962', f: { physics: 1 }, t: [1, 1, 2, 0, 0, 1, 0, 2, 0], tag: '1922 노벨 물리학상', known: '원자 구조와 양자론의 기초를 세우고, 코펜하겐에 세계 물리학자들이 모이는 연구소를 이끌었어요.', story: '젊은 시절 코펜하겐 축구 클럽 AB에서 골키퍼로 뛰었어요. 동생 하랄 보어는 올림픽 은메달리스트였어요.' },
    { id: 'curie', name: '마리 퀴리', en: 'Marie Curie', years: '1867~1934', f: { physics: 0.5, chemistry: 0.5 }, t: [1, -1, 0, 2, -1, 0, 2, 0, 2], tag: '노벨상 2회', known: '방사능 연구로 1903년 노벨 물리학상, 라듐과 폴로늄 연구로 1911년 노벨 화학상을 받았어요.', story: '서로 다른 두 과학 분야에서 노벨상을 받은 유일한 사람이에요. 고된 실험을 끝까지 이어 간 집념의 상징이죠.' },
    { id: 'leewhiso', name: '이휘소', en: 'Benjamin W. Lee', years: '1935~1977', f: { physics: 1 }, t: [2, 1, -1, 1, 0, 1, 0, 0, 1], tag: '입자물리 이론가', known: '게이지 이론의 재규격화 연구 등으로 입자물리학 표준 모형의 완성에 크게 기여했어요.', story: '힉스 입자라는 이름을 붙인 사람으로 알려져 있고, 동료들의 노벨상 연구에 실마리를 준 "노벨상 메이커"로 불렸어요.' },
    { id: 'hawking', name: '스티븐 호킹', en: 'Stephen Hawking', years: '1942~2018', f: { physics: 1 }, t: [2, 1, -2, 0, 0, 1, 2, 0, 0], tag: '블랙홀 복사', known: '블랙홀이 복사를 내놓을 수 있음을 이론으로 보여 우주론과 양자론을 이었어요.', story: '젊은 나이에 루게릭병 진단을 받았지만 연구를 멈추지 않았고, 「시간의 역사」로 대중과도 우주를 나눴어요.' },
    { id: 'hubble', name: '에드윈 허블', en: 'Edwin Hubble', years: '1889~1953', f: { earth: 1 }, t: [1, 1, 2, 1, 0, 0, 0, 1, 1], tag: '팽창하는 우주', known: '우리 은하 밖에도 은하가 있고, 멀리 있는 은하일수록 빠르게 멀어진다는 사실을 밝혔어요.', story: '농구·육상·복싱을 즐긴 만능 운동선수였고, 학업과 운동을 모두 인정받아 로즈 장학생으로 옥스퍼드에 갔어요.' },
    { id: 'wegener', name: '알프레트 베게너', en: 'Alfred Wegener', years: '1880~1930', f: { earth: 1 }, t: [0, 0, 1, 0, -1, 2, 2, 0, 1], tag: '대륙 이동설', known: '대륙이 천천히 움직인다는 대륙 이동설을 처음으로 체계 있게 주장했어요.', story: '생전에는 학계의 비판을 받았지만 생각을 굽히지 않았고, 그린란드 탐사를 여러 번 이끌다 그곳에서 생을 마쳤어요.' },
    { id: 'jangyeongsil', name: '장영실', en: 'Jang Yeong-sil', years: '조선 전기', f: { earth: 0.6, physics: 0.4 }, t: [0, 0, 0, 1, 2, 2, 1, 0, 1], tag: '조선의 과학 기술자', known: '세종 때 자동 물시계 자격루(1434)와 해시계 앙부일구, 간의·혼천의 같은 천문 기구 제작을 이끌었어요.', story: '관노 출신이었지만 뛰어난 손재주로 세종에게 발탁되어 조선의 하늘과 시간을 재는 기구를 만들었어요.' },
    { id: 'pauling', name: '라이너스 폴링', en: 'Linus Pauling', years: '1901~1994', f: { chemistry: 0.8, biology: 0.2 }, t: [1, 1, 0, 0, 0, 1, 1, 2, 2], tag: '단독 노벨상 2회', known: '화학 결합의 본질을 밝혀 1954년 노벨 화학상을, 핵실험 반대 운동으로 1962년 노벨 평화상을 받았어요.', story: '노벨상 두 개를 모두 단독으로 받은 유일한 사람이에요. 연구실 밖에서도 목소리를 낸 과학자였어요.' },
    { id: 'franklin', name: '로절린드 프랭클린', en: 'Rosalind Franklin', years: '1920~1958', f: { chemistry: 0.6, biology: 0.4 }, t: [1, -1, 0, 2, -2, 0, 1, -1, 2], tag: '사진 51', known: 'X선 회절로 DNA의 나선 구조를 보여 준 「사진 51」을 얻어 이중 나선 발견의 결정적 근거를 남겼어요.', story: '사진 51 한 장을 위해 DNA에 62시간 동안 X선을 쬐었어요. 정밀한 측정이 무엇보다 강한 증거가 된다는 걸 보여 줬죠.' },
    { id: 'kimnarry', name: '김빛내리', en: 'V. Narry Kim', years: '1969~', f: { biology: 1 }, t: [1, 0, -1, 2, 0, 1, 1, 1, 2], tag: 'RNA 연구', known: '마이크로RNA가 만들어지는 과정을 밝혔고, 2020년 코로나19 바이러스의 RNA 전사체 지도를 세계 최초로 공개했어요.', story: '기초과학연구원 RNA 연구단을 이끌며, 팬데믹 초기 몇 주 만에 바이러스 유전자 지도를 완성해 셀에 발표했어요.' },
    { id: 'doudna', name: '제니퍼 다우드나', en: 'Jennifer Doudna', years: '1964~', f: { biology: 0.6, chemistry: 0.4 }, t: [1, 2, -1, 0, 1, 1, 0, 1, 2], tag: '2020 노벨 화학상', known: '샤르팡티에와 함께 유전자 가위 CRISPR-Cas9을 개발해 2020년 노벨 화학상을 받았어요.', story: '2011년 학회에서 샤르팡티에를 만나 공동 연구를 시작했어요. 좋은 만남이 큰 발견으로 이어진 사례예요.' },
    { id: 'mcclintock', name: '바버라 매클린톡', en: 'Barbara McClintock', years: '1902~1992', f: { biology: 1 }, t: [1, -2, 0, 1, -1, 1, 2, -1, 2], tag: '1983 노벨 생리의학상', known: '옥수수 연구로 유전자가 염색체 위를 옮겨 다니는 "점핑 유전자"를 발견했어요.', story: '오랫동안 인정받지 못했지만 홀로 옥수수를 관찰하며 연구를 이어 갔고, 1983년 노벨상을 단독으로 받았어요.' },
    { id: 'darwin', name: '찰스 다윈', en: 'Charles Darwin', years: '1809~1882', f: { biology: 0.8, earth: 0.2 }, t: [0, 0, 1, 1, 1, 1, 1, -1, 2], tag: '진화론', known: '자연 선택에 의한 진화 이론을 세우고 「종의 기원」(1859)을 펴냈어요.', story: '젊은 시절 비글호를 타고 5년 가까이 세계를 돌며 모은 관찰 기록이 평생 연구의 바탕이 되었어요.' },
    { id: 'mendel', name: '그레고어 멘델', en: 'Gregor Mendel', years: '1822~1884', f: { biology: 1 }, t: [0, -1, -1, 2, -2, 0, 1, 1, 1], tag: '유전 법칙', known: '완두콩 교배 실험으로 형질이 다음 세대로 전해지는 규칙, 멘델의 유전 법칙을 찾아냈어요.', story: '수도원 정원에서 수천 그루의 완두를 꼼꼼히 길러 기록했어요. 그의 업적은 세상을 떠난 뒤에야 재발견됐죠.' },
    { id: 'sagan', name: '칼 세이건', en: 'Carl Sagan', years: '1934~1996', f: { earth: 1 }, t: [1, 2, -1, 0, 0, 2, 0, 1, 0], tag: '「코스모스」', known: '행성 과학자로 우주 탐사선 계획에 참여했고, 「코스모스」로 전 세계에 우주의 경이를 전했어요.', story: '보이저 1호가 찍은 지구 사진을 「창백한 푸른 점」이라 부르며, 과학을 함께 나누는 일의 힘을 보여 줬어요.' },
    // v0.13.4: 중학교 교과서에 나오는 과학자 18명·수학자 7명
    { id: 'newton', name: '아이작 뉴턴', en: "Isaac Newton", years: '1642~1727', f: { physics: 0.8, math: 0.2 }, t: [2, -2, -1, 1, 1, 2, 0, -1, 2], tag: "만유인력·운동 법칙", known: "운동의 세 법칙과 만유인력 법칙을 정리해 고전역학의 바탕을 세웠고, 미적분과 빛의 분산도 연구했어요.", story: "흑사병으로 대학이 문을 닫아 고향에 머문 시기에 미적분·광학·중력에 관한 핵심 생각을 다듬었어요." },
    { id: 'galileo', name: '갈릴레오 갈릴레이', en: "Galileo Galilei", years: '1564~1642', f: { physics: 0.6, earth: 0.4 }, t: [1, 1, 0, 1, 0, 2, 2, -1, 2], tag: "근대 과학의 아버지", known: "직접 만든 망원경으로 목성의 위성과 금성의 위상 변화를 관측하고, 물체의 운동을 실험과 수학으로 설명했어요.", story: "지동설을 지지했다는 이유로 종교 재판을 받고 말년을 가택 연금 속에서 보냈지만 연구를 이어 갔어요." },
    { id: 'copernicus', name: '니콜라우스 코페르니쿠스', en: "Nicolaus Copernicus", years: '1473~1543', f: { earth: 1 }, t: [1, 0, 0, 1, 0, 2, 1, 0, 1], tag: "지동설", known: "태양이 우주의 중심에 있고 지구가 그 둘레를 돈다는 태양 중심설을 체계적으로 제시했어요.", story: "성직자이자 의사, 행정가로 일하며 틈틈이 하늘을 관측했고, 대표작 「천구의 회전에 관하여」는 그가 세상을 떠난 해에 출판됐어요." },
    { id: 'kepler', name: '요하네스 케플러', en: "Johannes Kepler", years: '1571~1630', f: { earth: 0.7, math: 0.3 }, t: [2, 0, -1, 2, -1, 1, 2, 0, 2], tag: "행성 운동 법칙", known: "튀코 브라헤의 관측 자료를 분석해 행성이 타원 궤도를 돈다는 행성 운동의 세 법칙을 찾았어요.", story: "어릴 때 앓은 천연두로 시력이 약했지만, 스승이 남긴 방대한 관측 기록을 몇 년에 걸쳐 끈질기게 계산했어요." },
    { id: 'faraday', name: '마이클 패러데이', en: "Michael Faraday", years: '1791~1867', f: { physics: 0.6, chemistry: 0.4 }, t: [1, 1, 0, 2, 1, 2, 1, 0, 2], tag: "전자기 유도", known: "전자기 유도를 발견해 발전기와 변압기의 원리를 열었고, 전기 분해 법칙도 밝혔어요.", story: "정규 교육을 거의 받지 못한 제본소 견습공이었지만, 험프리 데이비의 강연을 듣고 정리한 노트를 계기로 그의 조수가 되었어요." },
    { id: 'maxwell', name: '제임스 클러크 맥스웰', en: "James Clerk Maxwell", years: '1831~1879', f: { physics: 1 }, t: [2, 1, 0, 1, 0, 2, 0, 0, 1], tag: "전자기 이론", known: "전기와 자기를 하나로 묶는 맥스웰 방정식을 세우고, 빛이 전자기파라는 사실을 이론으로 보였어요.", story: "빛의 삼원색을 이용한 최초의 컬러 사진 실험을 이끄는 등 색과 빛에도 관심이 많았어요." },
    { id: 'lavoisier', name: '앙투안 라부아지에', en: "Antoine Lavoisier", years: '1743~1794', f: { chemistry: 1 }, t: [1, 1, 0, 2, -2, 1, 0, 1, 2], tag: "근대 화학의 아버지", known: "정밀한 질량 측정으로 질량 보존 법칙을 확인하고, 연소가 물질이 산소와 결합하는 반응임을 밝혔어요.", story: "세금 징수 일을 했던 이력 때문에 프랑스 혁명 중 처형되었어요. 아내 마리안도 실험 기록과 번역으로 연구를 함께했어요." },
    { id: 'dalton', name: '존 돌턴', en: "John Dalton", years: '1766~1844', f: { chemistry: 0.8, earth: 0.2 }, t: [1, 0, 0, 2, 0, 1, 1, 0, 1], tag: "원자설", known: "모든 물질이 더 쪼갤 수 없는 원자로 이루어져 있다는 근대 원자설을 제안했어요.", story: "평생 날씨 관측 기록을 남겼고, 자신의 색각 이상을 연구해 학계에 처음으로 자세히 보고했어요." },
    { id: 'mendeleev', name: '드미트리 멘델레예프', en: "Dmitri Mendeleev", years: '1834~1907', f: { chemistry: 1 }, t: [2, 0, 0, 1, 1, 2, 1, 0, 1], tag: "주기율표", known: "원소를 원자량 순서로 늘어놓아 주기율표를 만들고, 아직 발견되지 않은 원소의 성질까지 예측했어요.", story: "빈칸으로 남겨 둔 자리에 갈륨과 저마늄 같은 원소가 실제로 발견되면서 주기율표의 힘이 증명됐어요." },
    { id: 'boyle', name: '로버트 보일', en: "Robert Boyle", years: '1627~1691', f: { chemistry: 0.6, physics: 0.4 }, t: [1, 0, 0, 2, 0, 1, 0, 0, 2], tag: "보일 법칙", known: "온도가 일정할 때 기체의 부피가 압력에 반비례한다는 보일 법칙을 실험으로 밝혔어요.", story: "실험 과정과 결과를 자세히 기록해 다른 사람이 다시 확인할 수 있게 하는 방식을 중요하게 여겼어요." },
    { id: 'avogadro', name: '아메데오 아보가드로', en: "Amedeo Avogadro", years: '1776~1856', f: { chemistry: 0.7, physics: 0.3 }, t: [2, -1, 0, 1, -1, 2, 1, 0, 0], tag: "아보가드로 법칙", known: "같은 온도와 압력에서 같은 부피의 기체에는 같은 수의 분자가 들어 있다는 가설을 세웠어요.", story: "법학을 공부한 뒤 과학으로 진로를 바꿨고, 그의 가설은 세상을 떠난 뒤에야 널리 인정받았어요." },
    { id: 'rutherford', name: '어니스트 러더퍼드', en: "Ernest Rutherford", years: '1871~1937', f: { physics: 0.6, chemistry: 0.4 }, t: [1, 1, 1, 1, 0, 1, 1, 2, 2], tag: "원자핵 발견", known: "알파 입자 산란 실험으로 원자 중심에 작고 무거운 원자핵이 있다는 사실을 밝혔어요.", story: "1908년 노벨 화학상을 받았고, 그의 연구실에서 여러 노벨상 수상자가 나올 만큼 제자들을 잘 이끌었어요." },
    { id: 'pasteur', name: '루이 파스퇴르', en: "Louis Pasteur", years: '1822~1895', f: { biology: 0.7, chemistry: 0.3 }, t: [1, 1, 0, 2, 0, 1, 1, 1, 2], tag: "백신·저온 살균", known: "미생물이 음식을 상하게 한다는 것을 밝혀 저온 살균법을 만들고, 광견병 백신을 개발했어요.", story: "목이 S자로 휜 플라스크 실험으로 생물이 저절로 생겨난다는 자연 발생설을 반박했어요." },
    { id: 'fleming', name: '알렉산더 플레밍', en: "Alexander Fleming", years: '1881~1955', f: { biology: 1 }, t: [1, 0, 1, 0, 2, 1, 0, 0, 1], tag: "페니실린", known: "푸른곰팡이가 세균을 죽이는 물질을 낸다는 것을 발견해 최초의 항생제 페니실린의 길을 열었어요.", story: "휴가에서 돌아와 치우지 않은 배양 접시에서 우연히 발견했어요. 1945년 노벨 생리의학상을 받았어요." },
    { id: 'hooke', name: '로버트 훅', en: "Robert Hooke", years: '1635~1703', f: { biology: 0.5, physics: 0.5 }, t: [1, 0, 0, 1, 0, 2, 0, 0, 2], tag: "세포의 발견", known: "직접 만든 현미경으로 코르크를 관찰해 「세포(cell)」라는 이름을 처음 붙였고, 탄성에 관한 훅의 법칙도 밝혔어요.", story: "현미경으로 본 벼룩과 곤충을 정밀하게 그린 책 「마이크로그라피아」로 많은 사람을 놀라게 했어요." },
    { id: 'jenner', name: '에드워드 제너', en: "Edward Jenner", years: '1749~1823', f: { biology: 1 }, t: [1, 1, 0, 1, 1, 1, 0, 0, 1], tag: "종두법", known: "소의 병인 우두를 이용해 천연두를 예방하는 종두법을 개발해 백신의 시작을 열었어요.", story: "시골 의사로 일하며 우두에 걸렸던 사람은 천연두에 잘 걸리지 않는다는 이야기를 실험으로 확인했어요." },
    { id: 'woojangchoon', name: '우장춘', en: "Woo Jang-choon", years: '1898~1959', f: { biology: 1 }, t: [1, 1, 0, 2, -1, 1, 2, 1, 1], tag: "종의 합성", known: "배추속 식물 연구로 서로 다른 두 종이 합쳐져 새로운 종(유채)이 생길 수 있음을 밝힌 「종의 합성」 이론을 발표했어요.", story: "광복 뒤 귀국해 씨앗을 우리 땅에서 직접 생산하는 기반을 닦고, 우리 기후에 맞는 품종을 개량했어요." },
    { id: 'linnaeus', name: '칼 폰 린네', en: "Carl Linnaeus", years: '1707~1778', f: { biology: 1 }, t: [1, 0, 1, 2, 0, 1, 0, 1, 1], tag: "생물 분류법", known: "생물에 속명과 종명 두 단어로 이름을 붙이는 이명법을 정리해 생물 분류의 기준을 세웠어요.", story: "제자들을 세계 곳곳에 보내 식물을 채집하게 하며 수많은 생물에 이름을 붙였어요." },
    { id: 'pythagoras', name: '피타고라스', en: "Pythagoras", years: '기원전 6세기', f: { math: 1 }, t: [1, 1, 0, 1, 0, 1, 0, 2, 0], tag: "피타고라스 정리", known: "직각삼각형에서 빗변의 제곱이 나머지 두 변의 제곱의 합과 같다는 정리에 이름을 남겼어요.", story: "제자들과 함께 수와 음악, 우주의 조화를 탐구하는 공동체를 이끌었다고 전해져요." },
    { id: 'euclid', name: '유클리드', en: "Euclid", years: '기원전 300년경', f: { math: 1 }, t: [2, 0, 0, 2, 0, 1, 0, 1, 0], tag: "기하학 원론", known: "몇 개의 공리에서 출발해 정리를 차례로 증명하는 「원론」을 써서 기하학의 틀을 세웠어요.", story: "「원론」은 2천 년 넘게 기하학 교과서로 쓰였고, \"기하학에는 왕도가 없다\"고 말했다는 일화가 전해져요." },
    { id: 'archimedes', name: '아르키메데스', en: "Archimedes", years: '기원전 287년경~기원전 212년', f: { math: 0.6, physics: 0.4 }, t: [2, 0, 0, 1, 0, 2, 1, 0, 2], tag: "부력의 원리", known: "원주율의 범위를 계산하고 구의 부피를 구했으며, 지렛대와 부력의 원리를 밝혔어요.", story: "목욕을 하다 부력의 원리를 깨닫고 \"유레카!\"라고 외쳤다는 이야기로 유명해요." },
    { id: 'descartes', name: '르네 데카르트', en: "René Descartes", years: '1596~1650', f: { math: 0.8, physics: 0.2 }, t: [2, 1, -1, 1, 0, 2, 0, 0, 1], tag: "좌표 기하학", known: "좌표를 이용해 도형을 식으로 나타내는 해석기하학의 기초를 놓았어요.", story: "「나는 생각한다, 고로 존재한다」는 말을 남긴 철학자이기도 해요." },
    { id: 'pascal', name: '블레즈 파스칼', en: "Blaise Pascal", years: '1623~1662', f: { math: 0.7, physics: 0.3 }, t: [2, 0, -2, 1, 0, 2, 1, 0, 1], tag: "파스칼의 원리", known: "페르마와 편지를 주고받으며 확률론의 기초를 세웠고, 유체의 압력에 관한 파스칼의 원리를 밝혔어요.", story: "10대 때 세금 계산을 하던 아버지를 돕기 위해 기계식 계산기를 만들었어요." },
    { id: 'euler', name: '레온하르트 오일러', en: "Leonhard Euler", years: '1707~1783', f: { math: 1 }, t: [2, 1, 0, 2, 0, 1, 2, 0, 1], tag: "오일러 공식", known: "함수 기호 f(x)와 원주율 π 같은 표기를 널리 퍼뜨렸고, 쾨니히스베르크 다리 문제로 그래프 이론을 열었어요.", story: "말년에 시력을 거의 잃었지만 머릿속으로 계산하며 그 뒤에도 엄청난 양의 논문을 남겼어요." },
    { id: 'gauss', name: '카를 프리드리히 가우스', en: "Carl Friedrich Gauss", years: '1777~1855', f: { math: 0.8, physics: 0.1, earth: 0.1 }, t: [2, -1, 0, 2, 0, 1, 0, -1, 1], tag: "수학의 왕", known: "정17각형을 자와 컴퍼스로 작도할 수 있음을 증명하고, 정수론과 정규 분포 연구에 큰 업적을 남겼어요.", story: "어린 시절 1부터 100까지의 합을 순식간에 구했다는 일화로 유명해요." }
  ];

  const TYPES = {
    intelligence: { label: '이론을 세우는 사색가형', future: '칠판 앞에서 오래 생각해 새로운 이론을 세우는 연구자' },
    creativity: { label: '새 길을 여는 개척자형', future: '남들이 묻지 않은 질문으로 새 분야를 여는 연구자' },
    research: { label: '답을 찾아내는 탐구가형', future: '데이터와 실험으로 끝내 답을 찾아내는 연구자' },
    discipline: { label: '정밀함으로 증명하는 장인형', future: '정밀한 측정과 꼼꼼한 검증으로 믿음을 주는 연구자' },
    resilience: { label: '끝까지 파고드는 끈기형', future: '인정받기까지 오래 걸려도 한 주제를 끝까지 파는 연구자' },
    leadership: { label: '연구단을 이끄는 리더형', future: '큰 연구단을 꾸려 여러 사람의 힘을 모으는 연구자' },
    social: { label: '함께 풀어 가는 협업가형', future: '여러 분야 사람들과 함께 문제를 푸는 연구자' },
    athletics: { label: '현장을 누비는 탐사가형', future: '탐사와 현장에서 직접 자료를 모으는 연구자' },
    luck: { label: '기회를 발견으로 바꾸는 행운형', future: '뜻밖의 만남과 기회를 발견으로 바꾸는 연구자' },
  };

  const josa = (word, withBatchim, without) => {
    const code = String(word).charCodeAt(String(word).length - 1) - 0xac00;
    return code >= 0 && code <= 11171 && code % 28 ? withBatchim : without;
  };
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const list = (v) => (Array.isArray(v) ? v : []);

  // 능력치는 3학년이 되면 100에 닿는 경우가 많아, 실제로 보낸 시간(활동 주수·수상·관계)을 절반 반영합니다.
  function statVector(s, engine) {
    const stats = s?.stats || {};
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const stat = (k) => clamp(num(stats[k], 50) / 100);
    const awards = list(s?.awards);
    const kind = (re) => awards.filter((a) => re.test(String(a?.kind || ''))).length;
    let gpa = 0;
    try {
      gpa = num(engine?.getProfile?.(s)?.gpa);
    } catch (_) {}
    const field = (() => {
      try {
        return num(engine?.getFieldStatus?.(s)?.total);
      } catch (_) {
        return 0;
      }
    })();
    const signal = {
      intelligence: clamp((gpa - 3.3) / 1) * 0.7 + clamp(kind(/subject/) / 8) * 0.3,
      social: clamp((num(s?.stats?.social, 50) - 30) / 60) * 0.6 + clamp((num(s?.dormHarmony, 60) - 50) / 50) * 0.4,
      athletics: clamp(num(s?.sportsWeeks) / 40) * 0.8 + clamp(list(s?.sportsClubs).length / 2) * 0.2,
      discipline: clamp(kind(/model/i) / 12) * 0.6 + (num(s?.illnessCount) === 0 ? 0.25 : 0.05),
      luck: stat('luck'),
      creativity: stat('creativity') * 0.7 + clamp(kind(/olympiad|nationalTeam/) / 2) * 0.3,
      resilience: clamp(list(s?.hospitalizations).length * 0.4 + num(s?.illnessCount) * 0.15 + num(s?.extraWeeks) * 0.05),
      leadership: clamp(num(s?.councilWeeks) / 45) * 0.7 + (s?.captain || list(s?.captainHistory).some((h) => h?.passed) ? 0.3 : 0),
      research: clamp(num(s?.researchWeeks) / 30) * 0.6 + clamp(field / 6) * 0.2 + clamp(kind(/olympiad|nationalTeam/) / 2) * 0.2,
    };
    const raw = STATS.map((k) => stat(k) * 0.5 + signal[k] * 0.5);
    const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
    const sd = Math.sqrt(raw.reduce((a, b) => a + (b - mean) ** 2, 0) / raw.length);
    return { raw, z: raw.map((v) => (v - mean) / (sd + 0.04)) };
  }

  function fieldWeights(s, engine) {
    const w = Object.fromEntries(FIELDS.map((f) => [f, 0]));
    const add = (f, v) => {
      if (f in w) w[f] += v;
    };
    add(typeof engine?.academicField === "function" && s ? engine.academicField(s) : s?.academicClub, 3);
    for (const plan of Object.values(s?.curriculum?.plans || {})) for (const sub of list(plan?.subjects)) add(sub?.field, num(sub?.credits, 3) / 3);
    const majorFields = (id) => Object.keys(engine?.getMajor?.(id)?.requirements || {});
    for (const id of Object.values(s?.applicationMajors || {})) {
      const fs = majorFields(id);
      for (const f of fs) add(f, 2 / fs.length);
    }
    const admissions = Array.isArray(s?.admissions) ? s.admissions : list(s?.admissions?.results);
    for (const a of admissions.filter((x) => x?.accepted && !(typeof engine?.canEnroll === 'function' && engine.canEnroll(s, x) === false))) {
      const fs = majorFields(a.majorId);
      for (const f of fs) add(f, 1 / fs.length);
    }
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    if (!total) for (const f of FIELDS) w[f] = 1 / FIELDS.length;
    else for (const f of FIELDS) w[f] /= total;
    return w;
  }

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
  }

  function scoreAgainst(player, sc) {
    const statScore = (cosine(player.z, sc.t) + 1) / 2;
    const total = Object.values(sc.f).reduce((a, b) => a + b, 0) || 1;
    let fieldScore = 0;
    for (const f of FIELDS) fieldScore += Math.min(player.fields[f], (sc.f[f] || 0) / total);
    const score = 0.6 * statScore + 0.4 * fieldScore;
    return { score, statScore, fieldScore };
  }

  function reasonsFor(player, sc) {
    const shared = STATS.map((k, i) => ({ k, v: player.z[i] * Math.max(0, sc.t[i]), z: player.z[i], t: sc.t[i] }))
      .filter((x) => x.z > 0.15 && x.t > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 2)
      .map((x) => STAT_LABELS[x.k]);
    const fieldShared = FIELDS.filter((f) => (sc.f[f] || 0) > 0 && player.fields[f] >= 0.2).sort((a, b) => player.fields[b] - player.fields[a])[0];
    const parts = [];
    if (shared.length) parts.push(`${shared.join('·')}${josa(shared.at(-1), '이', '가')} 돋보이는 점`);
    if (fieldShared) parts.push(`${FIELD_LABELS[fieldShared]}에 마음을 둔 점`);
    return { traits: shared, field: fieldShared || null, text: parts.length ? `${parts.join(', ')}이 닮았어요.` : '나만의 균형 잡힌 성장 곡선이 닮았어요.' };
  }

  function percent(score) {
    return Math.max(41, Math.min(98, Math.round(30 + score * 72)));
  }

  function researcherType(player) {
    const order = STATS.map((k, i) => ({ k, z: player.z[i] })).sort((a, b) => b.z - a.z);
    const top = order[0].k;
    const field = FIELDS.slice().sort((a, b) => player.fields[b] - player.fields[a])[0];
    const flat = order[0].z - order[order.length - 1].z < 0.6;
    const type = flat ? { label: '두루 해내는 균형형', future: '여러 분야를 오가며 빈틈을 채우는 연구자' } : TYPES[top];
    const fieldLabel = player.fields[field] > 1 / FIELDS.length + 0.02 ? FIELD_LABELS[field] : '자연과학';
    return { key: flat ? 'balanced' : top, label: type.label, field: fieldLabel, title: `${fieldLabel} · ${type.label}`, future: `${fieldLabel} 분야에서 ${type.future}` };
  }

  // 게임 상태를 받아 가장 닮은 인물과 연구자 유형을 돌려줍니다. 상태는 바꾸지 않습니다.
  function compare(s, engine) {
    const v = statVector(s, engine);
    const player = { z: v.z, fields: fieldWeights(s, engine) };
    const ranked = scientists
      .map((sc) => ({ sc, ...scoreAgainst(player, sc) }))
      .sort((a, b) => b.score - a.score || a.sc.id.localeCompare(b.sc.id));
    const pick = (r) => ({ id: r.sc.id, name: r.sc.name, en: r.sc.en, years: r.sc.years, tag: r.sc.tag, known: r.sc.known, story: r.sc.story, fields: Object.keys(r.sc.f).map((f) => FIELD_LABELS[f]), similarity: percent(r.score), reason: reasonsFor(player, r.sc) });
    return { best: pick(ranked[0]), others: ranked.slice(1, 3).map(pick), type: researcherType(player), fields: player.fields };
  }

  function get(id) {
    return scientists.find((s) => s.id === id) || null;
  }

  return { compare, scientists, get, STATS, STAT_LABELS, FIELDS, FIELD_LABELS };
});
