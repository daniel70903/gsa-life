/* GSA LIFE · 도움말, 저장 백업, 버전 안내. 게임 상태를 바꾸지 않는 보조 화면입니다. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSAExtras = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const VERSION = 'v0.14.1';
  const SAVE_KEY = 'gsa-life-v1';
  const SEEN_VERSION_KEY = 'gsa-life-seen-version';
  const GUIDE_KEY = 'gsa-life-guide-seen';
  const CODE_PREFIX = 'GSALIFE1:';
  const SUPPORTED_SAVE_VERSIONS = [1, 2, 3, 4, 5, 6];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* ───────────── 저장 데이터 검증 · 백업 코드 ───────────── */

  function isValidSave(v) {
    return !!(v && SUPPORTED_SAVE_VERSIONS.includes(v.version) && v.state && typeof v.state === 'object' && typeof v.state.turn === 'number' && v.state.stats && typeof v.state.stats === 'object' && Array.isArray(v.state.grades));
  }
  // 파일 백업은 {app, gameVersion, exportedAt, save} 형태이고, 예전 저장 원본({version, state})도 받습니다.
  function unwrapSave(value) {
    if (value && value.app === 'gsa-life' && value.save) return value.save;
    return value;
  }
  function makeBackupFile(save, now = new Date()) {
    return { app: 'gsa-life', gameVersion: VERSION, exportedAt: now.toISOString(), save };
  }
  function backupFileName(save, now = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const name = String(save?.state?.name || '학생').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 16);
    return `gsa-life-${name}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.json`;
  }

  function toBase64Url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromBase64Url(text) {
    const clean = text.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(clean + '='.repeat((4 - (clean.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  async function streamBytes(bytes, transform) {
    const stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function encodeSave(save) {
    if (!isValidSave(save)) throw new Error('백업할 수 있는 진행 기록이 없어요.');
    const bytes = new TextEncoder().encode(JSON.stringify(save));
    if (typeof CompressionStream === 'function') return CODE_PREFIX + 'z' + toBase64Url(await streamBytes(bytes, new CompressionStream('gzip')));
    return CODE_PREFIX + 'j' + toBase64Url(bytes);
  }
  // 백업 코드 또는 백업 파일의 내용을 받아 검증된 저장 데이터({version, state})를 돌려줍니다.
  async function decodeBackup(input) {
    const text = String(input ?? '').trim();
    if (!text) throw new Error('백업 코드나 파일 내용을 넣어 주세요.');
    let value;
    try {
      if (text.startsWith(CODE_PREFIX)) {
        const kind = text.charAt(CODE_PREFIX.length), body = fromBase64Url(text.slice(CODE_PREFIX.length + 1));
        let bytes = body;
        if (kind === 'z') {
          if (typeof DecompressionStream !== 'function') throw new Error('이 브라우저는 압축된 백업 코드를 열 수 없어요. 백업 파일로 불러와 주세요.');
          bytes = await streamBytes(body, new DecompressionStream('gzip'));
        } else if (kind !== 'j') throw new Error('알 수 없는 백업 코드예요.');
        value = JSON.parse(new TextDecoder().decode(bytes));
      } else value = JSON.parse(text);
    } catch (error) {
      if (/브라우저|알 수 없는/.test(error.message)) throw error;
      throw new Error('백업 코드가 잘렸거나 올바르지 않아요. 처음부터 끝까지 그대로 붙여 넣어 주세요.');
    }
    const save = unwrapSave(value);
    if (!isValidSave(save)) throw new Error('광곽에서 살아남기의 저장 데이터가 아니에요.');
    return save;
  }

  /* ───────────── 도움말 내용 ───────────── */

  const changelog = [
    {
      version: 'v0.14.1',
      date: '2026.11',
      items: [
        '공부량에 따른 시험 준비 보너스를 조정했어요. 공부를 많이 하면 높은 학점을 받을 수 있지만, 극단적인 공부량의 추가 효율은 조금 줄였어요.',
        '지능 상한은 유지하면서, 지능을 최대한 성장시킨 전략도 높은 학점을 노릴 수 있어요.',
        '심야 자습 학습량은 약 10%, 새벽 자습 학습량은 약 15% 줄였어요. 회복 중심 주에는 가벼운 복습량을 조금 늘렸고, 회복력 자체는 유지했어요.'
      ]
    },
    {
      version: 'v0.14',
      date: '2026.11',
      items: [
        '벌점이 쌓여 기숙사를 나가는 건 「강제 퇴사」, 2주에 한 번 집에 가는 건 「퇴사」로 구분했어요.',
        '실제 일과를 반영했어요. 평일은 6시 30분까지 수업, 저녁시간 1시간 뒤 야간 1차 자습(7:30~9:10)과 2차 자습(9:35~11:30)이 이어져요.',
        '기숙사 주말: 2주에 한 번은 집에 가는 퇴사 주말(피로·스트레스 회복), 나머지 주말은 기숙사에 남아 하루 종일 자습해요(공부 조금 ↑, 피로 ↑). 2주 진행 한 번에 두 주말이 다 들어 있어요.',
        '대학 입시에는 원서를 쓰는 3학년 2학기 1주차까지의 5학기 성적과 석차만 반영돼요. 3학년 2학기 성적은 입시와 상관없어요.',
        '이제 한 번에 2주씩 진행해요(학기 마지막 7주차는 1주). 한 판에 약 24번 진행하고, 직접 고르는 선택은 약 40번으로 줄었어요(예전 약 137번).',
        '사소한 일(일상 사건·배달·전자기기 같은 기회, 선택지가 하나뿐인 안내)은 알아서 처리되고 「지난 2주」 보고서에 「알아서 지나간 일」로 남아요. 일상 사건은 4주에 한 번 정도만 직접 골라요.',
        '입학 능력치를 공평하게 맞췄어요. 각 능력치는 40~65 사이이고 50 근처가 가장 흔해요. 8개 능력치 합계는 385~400이고, 400보다 모자란 만큼(1당 500원) 출발 생활비를 더 받아요. 유형은 대표 능력치 5개(지능·사회성·운동·행운·자기관리)로 정해요. 그중 가장 높은 값이 53 이상이면 그 유형, 모두 52 이하면 균형형이에요. 창의성·리더십·회복력만 높다고 유형이 바뀌지는 않아요.',
        'R&E가 학교 과정대로 나뉘었어요. 1학년 기초 R&E는 수학·물리·화학·생명과학·지구과학·정보 중 1~3지망을 내고 떨어질 수도 있어요. 2학년 심화 R&E는 지원한 분야로 그대로 배정돼요. 두 R&E 모두 보통 3명이 한 조이고 가끔 2명이에요. 3학년 1학기에는 졸업논문을 써서 제출하고 이수해요. 진행 상황은 「동아리·학생회」의 「나의 연구」에서 볼 수 있어요.',
        '학교생활 화면 하나에서 다 정해요. 맨 위 내 프로필·상태·능력치를 보고, 지난 2주 보고서 → 시간 배분 → 일정 예약 → 자습 플래너 → 매점 입고 3개를 차례로 정한 뒤 맨 아래 진행 버튼을 누르면 돼요. 「생활·매점」 탭은 없어지고, 기숙사 적발 기록은 프로필 카드에 나와요.',
        '성적·수상 탭이 표로 바뀌었어요. 과목마다 수행·중간·기말·합계·등급·평점을 칸별로 보여 주고, 중간고사가 끝나면 학기 성적이 나오기 전에도 「진행 중」 표에 과목별 중간고사 점수가 나와요.',
        '매점이 간단해졌어요. 2주마다 서로 다른 종류(음료·먹거리·학습·운동·생활)의 상품 3개가 새로 입고되고, 학교생활 화면에서 바로 살 수 있어요.',
        '학교생활 화면 오른쪽에 「내 능력치」가 생겼어요. 지능·연구 역량·창의성·자기관리·사회성·리더십·운동·회복력·행운을 막대로 보여 주고, 지난 2주 동안 얼마나 올랐는지와 가장 높은·낮은 능력치를 표시해요.',
        '심야자습은 시험 2주 전부터 시험 주까지, 새벽자습은 시험 1주 전부터 할 수 있어요. 2주씩 진행할 때도 그 기간에 들어가는 주에는 고를 수 있고, 해당하는 주에만 적용돼요.',
        '입학 첫 주 운동부 입부 테스트는 이제 선택이에요. 「운동부에 지원하지 않는다」를 고를 수 있고, 2학년에 다시 도전할 수 있어요.',
        '자습 플래너는 처음 한 번만 묻고 이후에는 지난 계획을 이어 가요. 학급 임원은 학년 초에 뽑고 2학기에는 그대로 이어 가요.',
        '선택이 줄었어요. 대학·학생회 면접은 능력치로 자동 판정돼요. 교내대회도 내 동아리 분야만 묻고 나머지는 계획에 맞춰 자동으로 참가하거나 건너뛰어요. 학교 현장탐사는 첫 장면만 고르면 돼요.',
        '서울대는 공대 12개·자연대 6개 모집단위로 나뉘어요. 1단계 서류(석차) 뒤에 2단계 면접이 있어요. 단위마다 필요한 석차가 달라서, 전기·정보나 컴퓨터공학은 학년 상위 8% 안이어야 1단계 통과가 유력해요. 그 구간 안에서는 확률이 크게 오르고, 밖이면 매우 낮아요. 단위별 구간은 게임 밸런스를 위한 추정치예요.',
        '대학과 교내대회가 더 어려워졌어요. 원서 화면에서 「추천 원서 그대로 내기」로 내 석차에 맞는 조합을 바로 낼 수 있어요.',
        '학술동아리는 1학년 1학기 초 면접으로 들어가요. 떨어지면 2차 지원을 할 수 있고, 2학년 때는 드물게 동아리를 옮기기도 해요. 기장·부기장은 동아리 선거로 정하고, 3학년은 동아리 활동이 없어요.',
        '졸업하려면 총 180학점이 필요해요(새로 시작한 게임부터). 기본 시간표는 183학점이고, 모자라면 정규 과정 뒤 보충 과목으로 채울 수 있어요.',
        '학술동아리가 2026년 실제 동아리 12개로 바뀌었어요. 인테그랄·AXIOM(수학), QM·SCV·프사이(물리), CHEMTECH·켈빈(화학), SOMA·바이오케미(생명과학), TERRA(지구과학), !DEA·Ifex(정보과학).',
        '현장연구 6학점이나 TOEIC 730점을 채우지 못해 졸업하지 못하면, KAIST처럼 고등학교 과정 이수만으로 받는 대학에만 진학할 수 있어요.',
        '닮은 과학자·수학자가 50명으로 늘었어요. 뉴턴·갈릴레이·패러데이·멘델레예프·파스퇴르·우장춘 같은 과학자 18명과 피타고라스·유클리드·오일러·가우스 같은 수학자 7명이 새로 들어왔어요.'
      ]
    },
    {
      version: 'v0.13.3',
      date: '2026.11',
      items: [
        '서울대 합격이 더 어려워졌어요. 게임에서는 학년의 4분의 1 정도(90명 중 약 22명)가 합격하도록 맞췄어요. 밸런스를 위한 게임 속 수치이고 실제 합격 인원과는 관계없어요. 다른 대학 난이도는 그대로예요.'
      ]
    },
    {
      version: 'v0.13.2',
      date: '2026.11',
      items: [
        '한 학기가 7주로 바뀌었어요. 4주차 중간고사, 7주차 기말고사, 3년 42주예요. 진행 중인 저장은 같은 학기의 가까운 주차로 옮겨져요.',
        '학사일정에 맞춰 수시 원서를 3학년 2학기 1주차(면접 4주차, 결과 6주차)로 옮기고, 동아리 발표대회·R&E 발표·자연탐사 시기도 맞췄어요.',
        '자연탐사는 격년이에요. 1학년에 제주도면 2학년은 변산, 1학년에 변산이면 2학년은 제주도이고, 3학년에는 없어요.',
        '짧아진 학기에 맞춰 중간고사 뒤와 방학에 피로가 더 풀리고, 성장·시험 난도·입시를 다시 맞췄어요.',
        '노트북 화면에서 시작 화면 패치노트가 한 줄로 눌리던 문제를 고쳤어요.'
      ]
    },
    {
      version: 'v0.13.1',
      date: '2026.11',
      items: [
        '시간 배분이 쉬워졌어요. 카드를 누르면 주력, 하나 더 누르면 보조가 되어 7 : 3으로 나눠요.',
        '자습 플래너를 날짜별 달력 대신 주마다 「없음 · 심야 · 심야+새벽」 중 하나만 고르게 바꿨어요.',
        '기숙사 강제 퇴사가 단계별로 바뀌었어요. 5일 → 10일 → 30일 → 90일 → 영구 강제 퇴사 순이고, 기간이 끝나면 기숙사로 돌아와요.'
      ]
    },
    {
      version: 'v0.13',
      date: '2026.11',
      items: [
        '1학년 1학기~2학년 1학기 과목을 실제 편성대로 바꿨어요. 지구과학·실험·국어·영어·사회·음미체까지 학기당 30~32학점이에요.',
        '점수 구성: 수학·과학 수행 40 + 중간 30 + 기말 30, 실험 수행 60 + 기말 40, 인문 수행 60 + 지필 40, 음미체는 수행만. 수행평가는 감점 사건이 없으면 만점이에요.',
        '연구활동(기초·심화자율연구 등)은 이수/미이수로 평점에서 빠져요.',
        '시험이 실제처럼 반 평균 70점 안팎으로 나와요. 1학년은 쉬워지고 2학년 1학기는 조금 어려워졌어요.',
        '심야·새벽자습을 조금 너프했어요. 며칠 연달아 하면 효과가 줄고, 시험 날 너무 피곤하면 점수가 깎여요.',
        '학기 성적이 나오면 학년 동기 90명 중 석차와 누적 석차를 보여 줘요.',
        '음악·미술·체육 교과우수상은 수강 인원의 5%(올림)만큼, 체육은 운동·음미는 창의성이 높을수록 잘 받는 추첨으로 정해요.',
        '능력치마다 숨은 잠재력이 생겼어요. 입학 OVR은 50 안팎이고, 잠재력에 가까워질수록 성장이 느려져요. 졸업 때 90+는 셋 중 하나, 99는 정말 드물어요.',
        '교내 대회 13개가 생겼어요. 수학·물리·화학·생명·지구·정보과학 경시, 글쓰기, 영어 말하기, 동아리 발표, R&E 발표, 그리고 학년마다 열리는 발명품 대회까지. 지원자 상위 20%가 금·은·동상을 받아요.',
        '입시 개편: 대학을 14곳(서울대·KAIST·POSTECH·GIST·DGIST·UNIST·연세·고려·서강·성균관·한양·중앙·경희·서울시립)으로 정리했어요. 수시 6장 + 과기원 따로, 면접은 5개 대학만(2문항), 평가는 학년 석차 + 연구·수상 + 면접이에요. 학과마다 경쟁률도 달라요.',
        '한 주 계획이 「방과 후 시간 10칸 배분」으로 바뀌었어요. 한 곳에 몰거나 여러 활동에 나눠 쓸 수 있어요.',
        '시험 2주 전에 「자습 플래너」 사건이 열리고, 시험 주까지 3주 동안 심야·새벽자습을 정해요.',
        'TOEIC은 영어 준비가 쌓이면 「응시할래?」 선택지로 물어봐요. 일상 사건은 대부분 주간 보고서에 「이번 주 일상 사건 n건」으로 정리돼요.',
        '평가 기준이 생겼어요. 졸업 OVR과 업적 ★(최우수 졸업·학생회장·기장·올림피아드·국가대표·대회 금상·교과우수 8개·서울대 합격·OVR 95)로 한 판을 비교하고, 졸업 뒤 커리어 에필로그에서 노벨상·필즈상을 받을 수도 있어요(아주 드물게).',
        '시작 화면에 패치노트가 생겼어요.',
      ],
    },
    {
      version: 'v0.12',
      date: '2026.11',
      items: [
        '시작 화면을 만들었어요. 이어하기·새 게임·튜토리얼·기록실을 고를 수 있고, 왼쪽 위 로고나 「시작 화면」 버튼으로 언제든 돌아올 수 있어요.',
        '튜토리얼을 원할 때만 고를 수 있어요. 실제 화면 위에서 입학부터 한 주 보내기까지 한 단계씩 안내해요.',
        '컴패리즌: 3년을 마치면 기록과 가장 닮은 과학자·수학자 25명 중 한 명과 졸업 후 연구자 유형을 알려 줘요. 회고, 한 장 요약, 결과 카드에 함께 담겨요.',
        '기록실: 마친 이야기를 모아 보고, 만난 과학자를 도감으로 모을 수 있어요.',
      ],
    },
    {
      version: 'v0.11',
      date: '2026.11',
      items: [
        '도움말과 가이드를 추가했어요. 화면 위쪽 「도움말」 버튼으로 언제든 열 수 있어요.',
        '처음 방문하면 1분 안내가 열려요.',
        '진행 기록을 파일이나 코드로 백업하고, 다른 브라우저·기기에서 불러올 수 있어요.',
        '회고의 한 장 요약에서 결과 카드를 이미지로 저장하고 공유할 수 있어요.',
        '새 버전이 배포되면 새로고침 안내가 나와요. 진행은 자동 저장되어 있어 그대로 이어져요.',
        '링크를 공유하면 게임 소개 이미지가 함께 보여요.',
      ],
    },
    {
      version: 'v0.10',
      date: '2026.11',
      items: [
        '주간 용돈 5,000원, 능력치를 보완하는 시작 자금, 매점 가격을 조정했어요.',
        '심야·새벽자습의 교과 이해 효과를 높였어요.',
        '지원 가능한 대학을 19곳으로 늘렸어요. 원서는 1~3곳 제출해요.',
        '원서 제출 당시 누적 평점에 따라 대학마다 다른 합격 난도를 적용해요.',
      ],
    },
    {
      version: 'v0.9',
      date: '2026',
      items: [
        '게임을 마치면 입학부터 진로까지 장면별 회고와 한 장 요약을 볼 수 있어요.',
        '작은 캐릭터 모션을 추가했어요. 모션 끄기 설정을 지원해요.',
      ],
    },
  ];

  function list(items) {
    return `<ul class="gx-list">${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  }
  function steps(items) {
    return `<ol class="gx-steps">${items.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>`;
  }
  function callout(title, body, tone = '') {
    return `<div class="gx-callout ${tone}"><strong>${title}</strong><p>${body}</p></div>`;
  }

  const tabs = [
    {
      id: 'start',
      label: '시작하기',
      render: () => `<h3>입학부터 졸업까지, 42주</h3><p>광곽에서 살아남기는 1학년 1학기부터 3학년 2학기까지 6학기를 진행하는 학교생활 시뮬레이터예요. 한 학기는 7주(4주차 중간고사, 7주차 기말고사)이고, 한 번 진행할 때마다 1주가 지나가요.</p>${callout('시작 화면과 튜토리얼', '게임을 열면 시작 화면이 나와요. 처음이라면 「튜토리얼」을 골라 실제 화면 위에서 안내를 받을 수 있고, 필요 없으면 「게임 시작」으로 바로 입학하면 돼요. 왼쪽 위 로고나 「시작 화면」 버튼으로 언제든 돌아올 수 있어요.')}${steps([
        ['입학 카드 만들기', '이름과 캐릭터 성별, 학술동아리와 상설동아리를 골라요. 유형과 능력치는 무작위로 정해지고, 「유형과 능력치 다시 뽑기」로 다시 뽑을 수 있어요.'],
        ['한 주의 시간 나누기', '「학교생활」에서 주력 활동(필요하면 보조 활동까지)을 고르고 「2주 진행」을 눌러요(학기 마지막 7주차는 1주). 수업·동아리·운동·친구와의 시간은 자동으로 흘러가요.'],
        ['중요한 순간에 선택하기', '동아리 면접, 학생회 선거, 운동부 테스트 같은 사건이 오면 직접 골라요. 선택에 따라 능력치와 관계가 달라져요.'],
        ['졸업과 진학', '3학년 2학기 1주차에 대학 원서를 내고, 4주차에 면접, 6주차에 결과가 나와요. 졸업 요건을 채우면 졸업하고, 마지막에는 3년을 돌아보는 회고가 열려요.'],
      ])}<h3>왼쪽 메뉴 둘러보기</h3><dl class="gx-defs"><dt>학교생활</dt><dd>시간 배분·일정 예약·자습 플래너·매점을 한 화면에서 정하고, 맨 아래 진행 버튼으로 2주를 보내요.</dd><dt>수강·전공</dt><dd>2학년 2학기부터 선택과목을 수강하고, 지원 가능한 전공을 확인해요.</dd><dt>성적·수상</dt><dd>학기 성적표와 수상 기록을 봐요.</dd><dt>동아리·학생회</dt><dd>동아리, 운동부, 학생회와 학급 역할을 확인해요.</dd><dt>나의 기록</dt><dd>지금까지의 일지와 회고를 봐요.</dd><dt>진학·졸업</dt><dd>졸업 요건, TOEIC, 대학 목록과 전형 결과를 확인해요.</dd></dl>`,
    },
    {
      id: 'week',
      label: '한 주 보내기',
      render: () => `<h3>시간 배분</h3><p>균형 성장, 지능, 사회성, 운동, 자기관리, 연구 역량, 리더십, 영어 준비, 회복 카드 중 하나를 눌러 <b>주력</b>으로 정해요. 다른 카드를 하나 더 누르면 <b>보조</b>가 되어 방과 후 시간을 <b>7 : 3</b>으로 나눠요. 보조를 다시 누르면 해제되고, 「주력·보조 바꾸기」로 순서를 바꿀 수 있어요. 정한 배분은 바꾸기 전까지 다음 주에도 이어져요. 회복을 주력으로 두면 푹 쉬는 주로 쳐서 아픈 몸이 빨리 나아요.</p><h3>중요한 일정 예약</h3>${list([
        '<b>TOEIC 응시</b> · 1학년 2학기부터 예약할 수 있어요. 영어 준비가 쌓이면 「TOEIC, 이번에 볼까?」 사건으로도 물어봐요(4주에 한 번). 최고 점수가 기록돼요.',
        '<b>개별 현장연구</b> · 현장연구 1학점을 따로 채우는 일정이에요.',
        '필요할 때만 예약하면 돼요. 예약하지 않아도 일상은 그대로 흘러가요.',
      ])}<h3>자습 플래너</h3>${list([
        '시험 2주 전에 <b>자습 플래너</b> 사건이 열려요. 막판에·꾸준히·전력으로 같은 계획을 고르거나 직접 정할 수 있어요.',
        '그다음 시험 주까지 3주 동안 학교생활 화면에서 주마다 <b>없음 · 심야 · 심야+새벽</b> 중 하나를 골라요. 새벽자습은 시험 1주 전부터 할 수 있고, 지난 주는 바꿀 수 없어요.',
        '교과 이해가 더 많이 쌓여 성적에 도움이 되지만, 피로와 스트레스도 함께 올라가요.',
      ])}${callout('피로와 스트레스를 꼭 살펴보세요', '피로나 스트레스 중 하나가 100 이상이 되거나, 둘 다 90 이상이 되면 응급실 사건이 일어나요. 치료 결과에 따라 이야기가 끝날 수도 있어요. 수치가 80을 넘으면 「회복」 주력이나 「충분히 쉬기」를 골라 주세요.', 'warn')}<h3>일상 사건</h3><p>대부분의 일상 사건은 선택지 없이 지나가고, 지난주 보고서에 <b>「이번 주 일상 사건 n건」</b>과 목록으로 남아요. 운동부·선거·진로·위기처럼 결과가 갈리는 순간과 가끔 찾아오는 일상만 직접 골라요.</p><h3>몸이 아플 때</h3><p>아픈 동안에는 학습과 활동 효율이 떨어져요. 회복에 집중하면 더 빨리 나아요.</p>`,
    },
    {
      id: 'grades',
      label: '시험·성적',
      render: () => `<h3>시험 일정</h3><p>매 학기 <b>4주차에 중간고사</b>, <b>7주차에 기말고사</b>를 봐요. 반 평균은 보통 70점 안팎이고, 인문 과목은 조금 더 높게 나와요.</p><h3>과목 점수 구성</h3><div class="gx-table-wrap"><table class="gx-table"><thead><tr><th>과목</th><th>수행평가</th><th>지필</th></tr></thead><tbody><tr><td>수학·과학 이론</td><td>40</td><td>중간 30 + 기말 30</td></tr><tr><td>실험</td><td>60</td><td>기말 40 (중간고사 없음)</td></tr><tr><td>국어·영어·사회 등</td><td>60</td><td>중간·기말 40</td></tr><tr><td>음악·미술·체육</td><td>100</td><td>시험 없음</td></tr><tr><td>연구활동</td><td colspan="2">이수/미이수 (평점 제외)</td></tr></tbody></table></div><p>수행평가는 감점 사건이 없으면 만점이에요. 학기 성적이 나오면 학년 동기 90명 중 석차와 누적 석차도 보여 줘요.</p><h3>학점 기준</h3><div class="gx-table-wrap"><table class="gx-table"><thead><tr><th>점수</th><th>학점</th><th>평점</th></tr></thead><tbody><tr><td>90점 이상</td><td>A+</td><td>4.3</td></tr><tr><td>85점 이상</td><td>A0</td><td>4.0</td></tr><tr><td>80점 이상</td><td>A−</td><td>3.7</td></tr><tr><td>75점 이상</td><td>B+</td><td>3.3</td></tr><tr><td>70점 이상</td><td>B0</td><td>3.0</td></tr><tr><td colspan="3">이후 5점마다 한 단계씩 내려가요. 40점 미만은 F예요.</td></tr></tbody></table></div><h3>성적에 영향을 주는 것</h3>${list([
        '지능과 자기관리 능력치',
        '평소 공부와 추가 자습으로 쌓은 교과 준비',
        '과목의 난도',
        '시험 무렵의 피로·스트레스와 건강 상태',
        '약간의 운',
      ])}${callout('공부만이 정답은 아니에요', '4주에 한 번 공부에 집중하고 피곤할 때 쉬는 균형 잡힌 생활만으로도 평점 4.0 안팎을 노려볼 수 있어요. 시험 직전 추가 자습을 활용하면 조금 더 올라가요. 능력치와 사건에 따라 결과는 달라져요.')}`,
    },
    {
      id: 'activities',
      label: '활동·친구',
      render: () => `<h3>운동부</h3><p>1학년 첫 주에 농구부나 축구부 중 한 곳에 지원해요. 2학년 첫 주에는 아직 가입하지 않은 운동부에 다시 도전할 수 있고, 두 운동부에서 함께 활동할 수도 있어요.</p><h3>학생회와 기장</h3>${list([
        '1학년 2학기와 2학년 2학기를 시작할 때 학생회 선거가 열려요.',
        '회장·부회장 후보는 학생들의 공개 질문에, 부서 임원 후보는 면접 질문에 답해요.',
        '학생회 임원은 다음 학년 1학기 말까지 활동해요.',
        '동아리 기장은 1학년 말에 선출하고, 2학년 2학기 말까지 활동해요.',
      ])}<h3>기숙사 강제 퇴사</h3><p>배달 음식 적발 2회 또는 전자기기 적발 4회가 쌓이면 강제 퇴사 처분을 받아요. 강제 퇴사는 <b>5일(1주) → 10일(2주) → 30일(4주) → 90일(12주) → 영구 강제 퇴사</b> 순으로 길어져요. 강제 퇴사 기간에는 통학으로 매주 피로가 쌓이고 학습량이 조금 줄며, 그 학기 기숙사 모범상 후보에서 빠져요. 기간이 끝나면 기숙사로 돌아오고 적발 횟수는 0부터 다시 쌓여요.</p><h3>용돈과 매점</h3><p>매주 용돈 5,000원을 받아요. 매점에는 2주마다 서로 다른 종류의 상품 3개가 새로 들어오고, 피로나 스트레스를 덜어 주는 물건도 있어요.</p><h3>기숙사</h3><p>배달 음식이나 전자기기 사용을 고르면 적발 여부를 따로 판정해요. 적발이 쌓이면 기숙사를 나와 통학하게 되고, 이동 때문에 더 피곤해져요.</p>`,
    },
    {
      id: 'courses',
      label: '수강·전공',
      render: () => `<h3>학기별 수강신청</h3><p>2학년 2학기부터 학기가 시작될 때마다 수강신청 화면이 열려요. 듣고 싶은 선택과목을 골라 시간표를 확정해요.</p><h3>선택과목 졸업 기준</h3><div class="gx-table-wrap"><table class="gx-table"><thead><tr><th>영역</th><th>이수 기간</th><th>누적 기준</th></tr></thead><tbody><tr><td>전문선택</td><td>2학년 2학기~3학년 2학기</td><td>28학점 이상</td></tr><tr><td>융합·교양</td><td>2학년 2학기~3학년 2학기</td><td>4학점 이상</td></tr><tr><td>학생자율설계</td><td>2학년 2학기~3학년 1학기</td><td>6학점 이상</td></tr></tbody></table></div><h3>전공과 대학 지원</h3><p>2학년 2학기에 이수한 과목에 따라 대학에 지원할 수 있는 전공이 정해져요. 가고 싶은 전공이 있다면 「수강·전공」에서 전공별 조건을 먼저 확인하세요.</p>${callout('실제 학교 교육과정이 궁금하다면', '「수강·전공」 화면 아래의 「실제 학교의 선택과목 운영 알아보기」에 공식 편성표와 교재 목록 링크가 있어요. 게임 속 과목 목록은 여러 해의 과목을 함께 담은 재구성이에요.')}`,
    },
    {
      id: 'graduation',
      label: '졸업·진학',
      render: () => `<h3>졸업 요건</h3>${list([
        '<b>TOEIC 730점 이상</b> · 1학년부터 준비하고, 1학년 2학기부터 응시할 수 있어요.',
        '<b>현장연구 6학점</b> · 학교 행사(자연탐사 등)에 모두 참여하면 5학점, 개별 현장연구로 1학점을 채워요. 자연탐사는 격년이라 1·2학년 2학기 5주차에 제주도와 변산을 한 번씩 가요(어느 쪽이 먼저인지는 입학 연도마다 달라요). 3학년에는 없어요.',
        '<b>선택과목 학점</b> · 「수강·전공」의 영역별 기준을 채워야 해요.',
      ])}<p><b>졸업하지 못하면</b> 대부분의 대학은 합격해도 진학할 수 없어요. KAIST처럼 고등학교 과정 이수만으로 받는 대학만 갈 수 있어요. 요건을 준비하는 기간에 채우면 다시 진학할 수 있어요.</p>${callout('요건을 다 채우지 못했다면', '3학년 2학기가 끝나도 이야기는 이어져요. 졸업 요건을 준비하는 기간에 TOEIC을 준비하거나 다시 응시하고, 남은 학점을 보완할 수 있어요.')}<h3>대학 진학</h3>${steps([
        ['원서 제출', '3학년 2학기 1주차에 14개 대학 중 고르고 희망 전공과 함께 지원해요. 수시 원서는 6장(POSTECH 포함)까지, 과학기술원(KAIST·GIST·DGIST·UNIST)은 따로 낼 수 있어요.'],
        ['면접', '서울대·KAIST·POSTECH·GIST·DGIST만 면접을 봐요(대학마다 2문항). 나머지 대학은 서류로만 평가해요.'],
        ['결과 발표', '원서를 낸 시점의 학년 누적 석차(동기 90명 중)를 중심으로 연구 역량, 교내 대회·교과우수상·올림피아드 수상, 면접을 더해 대학마다 따로 판정해요.'],
      ])}<p>대학마다 합격 난도가 달라요. 서울대가 가장 어렵고(게임 밸런스상 학년의 4분의 1 정도가 합격하는 수준, 실제 수치 아님), 같은 대학이라도 컴퓨터·AI·전기전자처럼 경쟁이 치열한 학과는 더 어려워요. 과기원과 POSTECH은 무학과로 뽑아요.</p>${callout('졸업과 합격은 따로 정해져요', '대학에 합격해도 졸업 요건을 채워야 진학할 수 있어요. 대학별 난도는 게임 설정이며, 실제 입시 기준이나 대학 순위가 아니에요.')}`,
    },
    {
      id: 'compare',
      label: '컴패리즌·기록실',
      render: () => `<h3>나와 닮은 과학자</h3><p>이야기를 마치면 회고 마지막 장에서 3년의 기록과 가장 닮은 과학자·수학자를 알려 줘요. 한 장 요약과 결과 카드 이미지에도 함께 담겨요.</p>${list([
        '<b>능력치와 실제로 보낸 시간</b> · 능력치뿐 아니라 운동부·학생회·연구에 쓴 주, 수상, 친구와의 만남, 아팠다가 회복한 경험을 함께 봐요.',
        '<b>마음을 둔 분야</b> · 학술동아리, 이수한 선택과목, 대학에 지원한 전공으로 수학·물리·화학·생명과학·지구과학·정보 중 어디에 가까운지 봐요.',
        '<b>연구자 유형</b> · 가장 두드러진 면을 바탕으로 대학 졸업 후 어떤 연구자가 될지 한 줄로 알려 줘요.',
      ])}${callout('게임 속 재미 요소예요', '닮은 정도는 실제 인물에 대한 평가가 아니에요. 인물 소개는 노벨상·필즈상 공식 발표, 대학·언론 보도 같은 공개 자료를 바탕으로 짧게 정리했어요.')}<h3>기록실</h3><p>시작 화면이나 페이지 아래 「기록실」에서 마친 이야기들을 다시 볼 수 있어요. 만난 과학자는 <b>과학자 도감</b>에 모여요. 모두 25명이에요.</p>`,
    },
    {
      id: 'backup',
      label: '저장·백업',
      render: () => backupPanel(),
    },
    {
      id: 'faq',
      label: '자주 묻는 질문',
      render: () => `<div class="gx-faq">${[
        ['진행이 사라졌어요.', '게임은 지금 쓰는 브라우저에만 저장돼요. 시크릿 모드, 방문 기록 삭제, 다른 브라우저나 기기에서는 이어지지 않아요. 「저장·백업」에서 미리 백업해 두면 어디서든 불러올 수 있어요.'],
        ['예전 주소에서 하던 기록을 이어 할 수 있나요?', '주소가 바뀌면 브라우저가 저장 공간을 따로 써서 자동으로 이어지지 않아요. 예전 주소에서 백업 기능을 쓸 수 없다면 새로 시작해야 해요.'],
        ['「새 버전이 나왔어요」 안내가 떠요.', '새로고침하면 최신 버전으로 바뀌어요. 진행은 매주 자동 저장되어 있어서 그대로 이어져요.'],
        ['응급실에 갔다가 이야기가 끝났어요.', '피로나 스트레스가 한계를 넘으면 응급실 사건이 일어나고, 회복하지 못하면 이야기가 끝나요. 회고에서 지나온 기록을 볼 수 있고, 새로운 학교생활을 시작할 수 있어요.'],
        ['3학년 2학기가 끝났는데 졸업을 못 했어요.', '「진학·졸업」에서 부족한 요건을 확인하세요. 졸업 요건을 준비하는 기간에 TOEIC 준비·응시와 남은 학점 보완을 이어갈 수 있어요.'],
        ['튜토리얼을 다시 보고 싶어요.', '시작 화면에서 「튜토리얼」을 누르면 돼요. 진행 중인 게임이 있으면 지우지 않고 지금 화면에서 안내해 줘요.'],
        ['결과 카드를 저장하고 싶어요.', '게임을 마치면 열리는 회고에서 「한 장 요약」으로 넘어간 뒤 「결과 카드 이미지」를 누르세요. 휴대폰에서는 공유 버튼으로 바로 보낼 수 있어요.'],
        ['캐릭터가 움직이는 게 신경 쓰여요.', '화면 위쪽의 「모션 끄기」를 누르면 캐릭터 움직임이 멈춰요.'],
        ['실제 학교와 똑같나요?', '아니에요. 학교 생활에서 착안한 비공식 팬 게임이에요. 시간 압축, 입시 일정, 수상·관계·건강 판정은 모두 게임 설정이에요.'],
      ]
        .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
        .join('')}</div>`,
    },
    {
      id: 'updates',
      label: '업데이트 소식',
      render: () => changelog.map((c) => `<section class="gx-release"><div class="gx-release-head"><b>${c.version}</b><small>${c.date}</small>${c.version === VERSION ? '<span class="gx-chip">현재 버전</span>' : ''}</div>${list(c.items.map(esc))}</section>`).join(''),
    },
  ];

  /* ───────────── 저장·백업 패널 ───────────── */

  function readCurrentSave() {
    try {
      const raw = root.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      return isValidSave(v) ? v : null;
    } catch (_) {
      return null;
    }
  }
  function describeSave(save) {
    const s = save.state, t = Math.min(s.turn, 41), term = Math.floor(t / 7);
    const when = s.alive === false ? '이야기의 마지막' : s.turn >= 42 ? (s.ending === 'graduated' ? '졸업' : '졸업 요건 준비 중') : `${Math.floor(term / 2) + 1}학년 ${(term % 2) + 1}학기 ${(t % 7) + 1}주차`;
    return `${esc(s.name || '이름 없는 학생')} · ${when}`;
  }
  function backupPanel() {
    const save = readCurrentSave();
    return `<h3>자동 저장</h3><p>진행은 매주 이 브라우저에 자동 저장돼요. 다른 브라우저나 기기로 옮기거나, 방문 기록을 지우기 전에는 백업해 두세요.</p><section class="gx-backup-card"><div class="gx-backup-now"><small>지금 이 브라우저의 기록</small><strong>${save ? describeSave(save) : '아직 저장된 진행이 없어요'}</strong></div><div class="gx-btn-row"><button type="button" class="gx-btn gx-btn--primary" data-gx="export-file" ${save ? '' : 'disabled'}>백업 파일 내려받기</button><button type="button" class="gx-btn" data-gx="copy-code" ${save ? '' : 'disabled'}>백업 코드 복사</button></div><p class="gx-small">백업 코드는 메모장이나 나에게 보내는 메시지에 붙여 두면 휴대폰에서도 쓸 수 있어요.</p></section><h3>백업 불러오기</h3><p>불러오면 이 브라우저의 현재 진행이 백업 내용으로 바뀌어요.</p><div class="gx-btn-row"><label class="gx-btn gx-file">백업 파일 선택<input type="file" accept=".json,application/json" data-gx="import-file"></label></div><label class="gx-field">또는 백업 코드 붙여넣기<textarea rows="3" data-gx="import-code" placeholder="GSALIFE1:로 시작하는 코드" spellcheck="false" autocomplete="off"></textarea></label><button type="button" class="gx-btn" data-gx="import-code-btn">코드로 불러오기</button><p class="gx-status" role="status" aria-live="polite"></p>`;
  }

  function setStatus(dialog, text, tone) {
    const el = dialog.querySelector('.gx-status');
    if (!el) return;
    el.textContent = text;
    el.dataset.tone = tone || '';
  }
  async function copyText(text) {
    try {
      await root.navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (_) {}
      area.remove();
      return ok;
    }
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function applyImportedSave(save, dialog) {
    const current = readCurrentSave();
    const message = current ? `지금 진행 중인 「${describeSave(current).replace(/&[^;]+;/g, '')}」 기록을\n백업한 「${describeSave(save).replace(/&[^;]+;/g, '')}」 기록으로 바꿀까요?` : `백업한 「${describeSave(save).replace(/&[^;]+;/g, '')}」 기록을 불러올까요?`;
    if (!root.confirm(message)) return;
    try {
      if (root.GSAEngine?.migrate) root.GSAEngine.migrate(JSON.parse(JSON.stringify(save.state)));
    } catch (_) {
      setStatus(dialog, '이 백업은 현재 버전에서 열 수 없어요.', 'error');
      return;
    }
    try {
      const previous = root.localStorage.getItem(SAVE_KEY);
      if (previous) root.localStorage.setItem(SAVE_KEY + '-before-import', previous);
      root.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (_) {
      setStatus(dialog, '저장 공간에 쓸 수 없어요. 시크릿 모드라면 일반 창에서 다시 시도해 주세요.', 'error');
      return;
    }
    setStatus(dialog, '불러왔어요. 화면을 새로 여는 중이에요…', 'ok');
    setTimeout(() => root.location.reload(), 350);
  }
  function bindBackup(dialog) {
    const on = (name, type, fn) => dialog.querySelector(`[data-gx="${name}"]`)?.addEventListener(type, fn);
    on('export-file', 'click', () => {
      const save = readCurrentSave();
      if (!save) return;
      const now = new Date();
      downloadBlob(new Blob([JSON.stringify(makeBackupFile(save, now))], { type: 'application/json' }), backupFileName(save, now));
      setStatus(dialog, '백업 파일을 내려받았어요.', 'ok');
    });
    on('copy-code', 'click', async () => {
      const save = readCurrentSave();
      if (!save) return;
      try {
        const code = await encodeSave(save);
        setStatus(dialog, (await copyText(code)) ? `백업 코드를 복사했어요. (${code.length.toLocaleString('ko-KR')}자)` : '복사하지 못했어요. 백업 파일을 이용해 주세요.', 'ok');
      } catch (e) {
        setStatus(dialog, e.message, 'error');
      }
    });
    on('import-file', 'change', async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        applyImportedSave(await decodeBackup(await file.text()), dialog);
      } catch (error) {
        setStatus(dialog, error.message, 'error');
      }
    });
    on('import-code-btn', 'click', async () => {
      try {
        applyImportedSave(await decodeBackup(dialog.querySelector('[data-gx="import-code"]').value), dialog);
      } catch (error) {
        setStatus(dialog, error.message, 'error');
      }
    });
  }

  /* ───────────── 공용 대화상자 ───────────── */

  let openState = null;
  function focusables(el) {
    return [...el.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter((x) => !x.disabled && x.getClientRects().length);
  }
  function closeDialog() {
    if (!openState) return;
    const { host, opener, prev, onClose } = openState;
    openState = null;
    host.remove();
    const app = document.getElementById('app'), modal = document.getElementById('modal-root');
    if (app) app.inert = prev.app;
    if (modal) modal.inert = prev.modal;
    document.body.style.overflow = prev.overflow;
    if (opener && document.contains(opener)) opener.focus();
    onClose?.();
  }
  // 게임 화면과 겹치지 않는 별도 층에 대화상자를 엽니다. 게임 상태는 건드리지 않습니다.
  function openDialog({ title, eyebrow = '', body, wide = false, className = '', onClose, labelledBy } = {}) {
    closeDialog();
    const host = document.createElement('div');
    host.className = 'gx-layer';
    host.innerHTML = `<div class="gx-overlay" data-gx-close-backdrop><section class="gx-dialog ${wide ? 'gx-dialog--wide' : ''} ${className}" role="dialog" aria-modal="true" aria-labelledby="${labelledBy || 'gx-title'}"><button type="button" class="gx-close" data-gx-close aria-label="닫기">×</button>${eyebrow ? `<div class="gx-eyebrow">${esc(eyebrow)}</div>` : ''}${title ? `<h2 id="gx-title">${esc(title)}</h2>` : ''}<div class="gx-body">${body}</div></section></div>`;
    const app = document.getElementById('app'), modal = document.getElementById('modal-root');
    const prev = { app: app ? app.inert : false, modal: modal ? modal.inert : false, overflow: document.body.style.overflow };
    openState = { host, opener: document.activeElement, prev, onClose };
    document.body.appendChild(host);
    if (app) app.inert = true;
    if (modal) modal.inert = true;
    document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-gx-close]').forEach((b) => b.addEventListener('click', closeDialog));
    host.querySelector('[data-gx-close-backdrop]').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeDialog();
    });
    const dialog = host.querySelector('.gx-dialog');
    setTimeout(() => (dialog.querySelector('[data-gx-autofocus]') || focusables(dialog)[0])?.focus(), 0);
    return dialog;
  }
  // 대화상자가 열려 있는 동안 게임의 방향키·Esc 단축키가 뒤에서 동작하지 않도록 먼저 처리합니다.
  if (typeof window !== 'undefined')
    window.addEventListener(
      'keydown',
      (e) => {
        if (!openState) return;
        const dialog = openState.host.querySelector('.gx-dialog');
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeDialog();
          return;
        }
        if (e.key === 'Tab') {
          e.stopImmediatePropagation();
          const items = focusables(dialog);
          if (!items.length) return;
          const first = items[0], last = items.at(-1);
          if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
            e.preventDefault();
            first.focus();
          }
          return;
        }
        if (['ArrowLeft', 'ArrowRight'].includes(e.key) && e.target.closest?.('[role="tab"]')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const all = [...dialog.querySelectorAll('[role="tab"]')], i = all.indexOf(e.target);
          const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
          next.click();
          next.focus();
          return;
        }
        e.stopImmediatePropagation();
      },
      true,
    );

  /* ───────────── 도움말 ───────────── */

  function openHelp(tabId = 'start', opener) {
    const current = tabs.some((t) => t.id === tabId) ? tabId : 'start';
    const dialog = openDialog({
      eyebrow: `GUIDE · ${VERSION}`,
      title: '광곽에서 살아남기 가이드',
      wide: true,
      className: 'gx-help',
      body: `<div class="gx-help-layout"><div class="gx-tabs" role="tablist" aria-label="도움말 주제">${tabs.map((t) => `<button type="button" role="tab" id="gx-tab-${t.id}" aria-controls="gx-panel" data-gx-tab="${t.id}">${t.label}</button>`).join('')}</div><div class="gx-panel" id="gx-panel" role="tabpanel" tabindex="0"></div></div>`,
    });
    const panel = dialog.querySelector('.gx-panel');
    function show(id) {
      const tab = tabs.find((t) => t.id === id) || tabs[0];
      dialog.querySelectorAll('[data-gx-tab]').forEach((b) => {
        const active = b.dataset.gxTab === tab.id;
        b.setAttribute('aria-selected', String(active));
        b.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `gx-tab-${tab.id}`);
      panel.innerHTML = tab.render();
      panel.scrollTop = 0;
      if (tab.id === 'backup') bindBackup(dialog);
      if (tab.id === 'updates') markVersionSeen();
    }
    dialog.querySelectorAll('[data-gx-tab]').forEach((b) => b.addEventListener('click', () => show(b.dataset.gxTab)));
    show(current);
    setTimeout(() => dialog.querySelector(`[data-gx-tab="${current}"]`)?.focus(), 0);
    return dialog;
  }

  /* ───────────── 처음 방문 안내 ───────────── */

  function openWelcome() {
    const dialog = openDialog({
      eyebrow: 'WELCOME TO GSA',
      title: '처음이라면, 1분만 읽어 줘.',
      className: 'gx-welcome',
      onClose: () => setFlag(GUIDE_KEY, '1'),
      body: `<p>입학부터 졸업까지 42주. 공부, 친구, 운동부, 학생회, 연구 중에서 무엇을 키울지는 네 선택이야.</p><div class="gx-welcome-grid">${[
        ['01', '방향을 정하고 한 주 보내기', '매주 키울 능력을 고르면 나머지 일상은 자동으로 흘러가.'],
        ['02', '중요한 순간엔 직접 선택', '동아리 면접, 선거, 운동부 테스트는 네가 골라.'],
        ['03', '피로·스트레스는 100 전에', '한계를 넘으면 응급실에 가. 80쯤이면 꼭 쉬어 줘.'],
        ['04', '졸업 요건은 따로 있어', 'TOEIC 730점, 현장연구 6학점, 선택과목 학점을 채워야 졸업해.'],
      ]
        .map(([n, t, d]) => `<div class="gx-welcome-item"><span>${n}</span><b>${t}</b><p>${d}</p></div>`)
        .join('')}</div><div class="gx-btn-row gx-btn-row--end"><button type="button" class="gx-btn" data-gx="welcome-guide">가이드 자세히 보기</button><button type="button" class="gx-btn gx-btn--primary" data-gx="welcome-start" data-gx-autofocus>바로 입학하기</button></div><p class="gx-small">가이드는 화면 위쪽 「도움말」에서 언제든 다시 볼 수 있어.</p>`,
    });
    dialog.querySelector('[data-gx="welcome-start"]').addEventListener('click', () => {
      closeDialog();
      document.getElementById('student-name')?.focus();
    });
    dialog.querySelector('[data-gx="welcome-guide"]').addEventListener('click', () => {
      setFlag(GUIDE_KEY, '1');
      openHelp('start');
    });
    markVersionSeen();
    return dialog;
  }

  /* ───────────── 버전 안내 ───────────── */

  function getFlag(key) {
    try {
      return root.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }
  function setFlag(key, value) {
    try {
      root.localStorage.setItem(key, value);
    } catch (_) {}
  }
  function markVersionSeen() {
    setFlag(SEEN_VERSION_KEY, VERSION);
  }
  function compareVersions(a, b) {
    const parse = (v) => String(v || '').replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
    const x = parse(a), y = parse(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? 1 : -1;
    return 0;
  }
  function banner(id, html) {
    document.getElementById(id)?.remove();
    const el = document.createElement('div');
    el.id = id;
    el.className = 'gx-banner';
    el.setAttribute('role', 'status');
    el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }
  function showWhatsNew() {
    const changes = changelog[0];
    const el = banner('gx-whatsnew', `<span class="gx-banner-badge">${VERSION}</span><span class="gx-banner-text">업데이트 · 도움말, 저장 백업, 결과 카드 이미지가 생겼어요.</span><button type="button" class="gx-banner-btn" data-gx="whatsnew-open">자세히</button><button type="button" class="gx-banner-x" data-gx="whatsnew-close" aria-label="알림 닫기">×</button>`);
    el.querySelector('[data-gx="whatsnew-open"]').addEventListener('click', () => {
      el.remove();
      markVersionSeen();
      openHelp('updates');
    });
    el.querySelector('[data-gx="whatsnew-close"]').addEventListener('click', () => {
      el.remove();
      markVersionSeen();
    });
    return changes;
  }
  let lastCheck = 0;
  async function checkForUpdate(force = false) {
    if (!/^https?:$/.test(root.location?.protocol || '') || typeof fetch !== 'function') return;
    if (!force && Date.now() - lastCheck < 5 * 60 * 1000) return;
    lastCheck = Date.now();
    try {
      const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const remote = await res.json();
      if (remote?.version && compareVersions(remote.version, VERSION) > 0 && !document.getElementById('gx-update')) {
        const el = banner('gx-update', `<span class="gx-banner-badge">${esc(remote.version)}</span><span class="gx-banner-text">새 버전이 나왔어요. 진행은 저장되어 있으니 새로고침해도 그대로 이어져요.</span><button type="button" class="gx-banner-btn" data-gx="update-reload">새로고침</button><button type="button" class="gx-banner-x" data-gx="update-close" aria-label="알림 닫기">×</button>`);
        el.querySelector('[data-gx="update-reload"]').addEventListener('click', () => root.location.reload());
        el.querySelector('[data-gx="update-close"]').addEventListener('click', () => el.remove());
      }
    } catch (_) {
      /* 오프라인이거나 파일로 연 경우에는 조용히 넘어갑니다. */
    }
  }

  /* ───────────── 게임 화면 연결 ───────────── */

  function helpButton() {
    return `<button type="button" class="gx-help-btn" data-gx-help aria-label="도움말 열기"><span aria-hidden="true">?</span><b>도움말</b></button>`;
  }
  function footerLinks() {
    return `<span class="gx-footer-links"><button type="button" data-gx-title>시작 화면</button> · <button type="button" data-gx-archive>기록실</button> · <button type="button" data-gx-help="start">도움말</button> · <button type="button" data-gx-help="backup">저장 백업</button> · <button type="button" data-gx-help="updates">${VERSION} 업데이트 소식</button></span>`;
  }
  let started = false;
  function init() {
    if (started || typeof document === 'undefined') return;
    started = true;
    document.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-gx-help]');
      if (b) openHelp(b.dataset.gxHelp || 'start', b);
    });
    // 처음 방문 안내와 업데이트 알림은 시작 화면이 맡습니다. 시작 화면이 없을 때만 예전 방식으로 보여 줍니다.
    if (!root.GSATitle) {
      const hasSave = !!readCurrentSave();
      if (!hasSave && !getFlag(GUIDE_KEY)) setTimeout(openWelcome, 250);
      else if (hasSave && getFlag(SEEN_VERSION_KEY) !== VERSION) setTimeout(showWhatsNew, 600);
    }
    if (!readCurrentSave() && !getFlag(SEEN_VERSION_KEY)) markVersionSeen();
    checkForUpdate(true);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkForUpdate();
    });
  }

  return { VERSION, isValidSave, unwrapSave, makeBackupFile, backupFileName, encodeSave, decodeBackup, compareVersions, changelog, tabs, openDialog, closeDialog, openHelp, openWelcome, helpButton, footerLinks, checkForUpdate, init, downloadBlob };
});
