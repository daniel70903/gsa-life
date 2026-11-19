/* GSA LIFE · 도움말, 저장 백업, 버전 안내. 게임 상태를 바꾸지 않는 보조 화면입니다. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GSAExtras = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const VERSION = 'v0.11';
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
      render: () => `<h3>입학부터 졸업까지, 48주</h3><p>광곽에서 살아남기는 1학년 1학기부터 3학년 2학기까지 6학기를 진행하는 학교생활 시뮬레이터예요. 한 학기는 8주이고, 한 번 진행할 때마다 1주가 지나가요.</p>${steps([
        ['입학 카드 만들기', '이름과 캐릭터 성별, 학술동아리와 상설동아리를 골라요. 유형과 능력치는 무작위로 정해지고, 「유형과 능력치 다시 뽑기」로 다시 뽑을 수 있어요.'],
        ['한 주의 방향 정하기', '「학교생활」에서 이번 주에 키울 성장 방향을 고르고 「한 주 시뮬레이션」을 눌러요. 수업·동아리·운동·친구와의 시간은 자동으로 흘러가요.'],
        ['중요한 순간에 선택하기', '운동부 테스트, 학생회 선거, 친구와의 약속 같은 사건이 오면 직접 골라요. 선택에 따라 능력치와 관계가 달라져요.'],
        ['졸업과 진학', '3학년 1학기에 대학 원서를 내고 면접을 봐요. 졸업 요건을 채우면 졸업하고, 마지막에는 3년을 돌아보는 회고가 열려요.'],
      ])}<h3>왼쪽 메뉴 둘러보기</h3><dl class="gx-defs"><dt>학교생활</dt><dd>성장 방향·일정 예약·자습을 고르고 한 주를 보내요.</dd><dt>생활·매점</dt><dd>용돈과 매점, 기숙사 생활을 관리해요.</dd><dt>친구·연애</dt><dd>여섯 친구 중 더 알아가고 싶은 친구를 골라요.</dd><dt>수강·전공</dt><dd>2학년 2학기부터 선택과목을 수강하고, 지원 가능한 전공을 확인해요.</dd><dt>성적·수상</dt><dd>학기 성적표와 수상 기록을 봐요.</dd><dt>동아리·학생회</dt><dd>동아리, 운동부, 학생회와 학급 역할을 확인해요.</dd><dt>나의 기록</dt><dd>지금까지의 일지와 회고를 봐요.</dd><dt>진학·졸업</dt><dd>졸업 요건, TOEIC, 대학 목록과 전형 결과를 확인해요.</dd></dl>`,
    },
    {
      id: 'week',
      label: '한 주 보내기',
      render: () => `<h3>성장 방향</h3><p>균형 성장, 지능, 사회성, 운동, 자기관리, 연구 역량, 리더십, 영어 준비, 회복 중 하나를 골라요. 고른 방향은 바꾸기 전까지 다음 주에도 이어져요.</p><h3>중요한 일정 예약</h3>${list([
        '<b>TOEIC 응시</b> · 1학년 2학기부터 예약할 수 있어요. 최고 점수가 기록돼요.',
        '<b>개별 현장연구</b> · 현장연구 1학점을 따로 채우는 일정이에요.',
        '필요할 때만 예약하면 돼요. 예약하지 않아도 일상은 그대로 흘러가요.',
      ])}<h3>추가 자습</h3>${list([
        '<b>심야자습</b>은 시험 2주 전부터, <b>새벽자습</b>은 시험 1주 전부터 고를 수 있어요.',
        '교과 이해가 더 많이 쌓여 성적에 도움이 되지만, 피로와 스트레스도 함께 올라가요.',
      ])}${callout('피로와 스트레스를 꼭 살펴보세요', '피로나 스트레스 중 하나가 100 이상이 되거나, 둘 다 90 이상이 되면 응급실 사건이 일어나요. 치료 결과에 따라 이야기가 끝날 수도 있어요. 수치가 80을 넘으면 「회복」 방향이나 「충분히 쉬기」를 골라 주세요.', 'warn')}<h3>몸이 아플 때</h3><p>아픈 동안에는 학습과 활동 효율이 떨어져요. 회복에 집중하면 더 빨리 나아요.</p>`,
    },
    {
      id: 'grades',
      label: '시험·성적',
      render: () => `<h3>시험 일정</h3><p>매 학기 <b>4주차에 중간고사</b>, <b>8주차에 기말고사</b>를 봐요. 학기 성적은 중간고사 40%와 기말고사 60%를 합쳐 정해져요.</p><h3>학점 기준</h3><div class="gx-table-wrap"><table class="gx-table"><thead><tr><th>점수</th><th>학점</th><th>평점</th></tr></thead><tbody><tr><td>90점 이상</td><td>A+</td><td>4.3</td></tr><tr><td>85점 이상</td><td>A0</td><td>4.0</td></tr><tr><td>80점 이상</td><td>A−</td><td>3.7</td></tr><tr><td>75점 이상</td><td>B+</td><td>3.3</td></tr><tr><td>70점 이상</td><td>B0</td><td>3.0</td></tr><tr><td colspan="3">이후 5점마다 한 단계씩 내려가요. 40점 미만은 F예요.</td></tr></tbody></table></div><h3>성적에 영향을 주는 것</h3>${list([
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
      ])}<h3>친구·연애</h3><p>관심사가 다른 친구 여섯 명이 있어요. 「친구·연애」에서 더 알아가고 싶은 친구를 고르면, 그 친구와의 만남이 따로 기록돼요. 한 번 만난 뒤에는 잠시 시간이 지나야 다시 만날 수 있어요. 교제는 한 명과만 할 수 있어요.</p><h3>용돈과 매점</h3><p>매주 용돈 5,000원을 받아요. 매점에서는 한 주에 4번까지 살 수 있고, 피로나 스트레스를 덜어 주는 물건도 있어요.</p><h3>기숙사</h3><p>배달 음식이나 전자기기 사용을 고르면 적발 여부를 따로 판정해요. 적발이 쌓이면 기숙사를 나와 통학하게 되고, 이동 때문에 더 피곤해져요.</p>`,
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
        '<b>현장연구 6학점</b> · 학교 행사(자연탐사 등)에 모두 참여하면 5학점, 개별 현장연구로 1학점을 채워요.',
        '<b>선택과목 학점</b> · 「수강·전공」의 영역별 기준을 채워야 해요.',
      ])}${callout('요건을 다 채우지 못했다면', '3학년 2학기가 끝나도 이야기는 이어져요. 졸업 요건을 준비하는 기간에 TOEIC을 준비하거나 다시 응시하고, 남은 학점을 보완할 수 있어요.')}<h3>대학 진학</h3>${steps([
        ['원서 제출', '3학년 1학기에 19개 대학 중 1~3곳을 골라 희망 전공과 함께 지원해요.'],
        ['면접', '지원한 대학마다 전공에 맞는 면접 질문에 답해요. 답변과 연구 경험이 전형 기록에 남아요.'],
        ['결과 발표', '원서를 낸 시점의 누적 평점, 능력치와 면접 결과로 대학마다 따로 판정해요.'],
      ])}<p>대학마다 합격 난도가 달라요. 서울대가 가장 어렵고, 누적 평점이 4.0을 넘어야 지원 조건을 채워요. 조건을 채워도 면접과 전형 결과에 따라 불합격할 수 있어요.</p>${callout('졸업과 합격은 따로 정해져요', '대학에 합격해도 졸업 요건을 채워야 진학할 수 있어요. 대학별 난도는 게임 설정이며, 실제 입시 기준이나 대학 순위가 아니에요.')}`,
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
    const s = save.state, t = Math.min(s.turn, 47), term = Math.floor(t / 8);
    const when = s.alive === false ? '이야기의 마지막' : s.turn >= 48 ? (s.ending === 'graduated' ? '졸업' : '졸업 요건 준비 중') : `${Math.floor(term / 2) + 1}학년 ${(term % 2) + 1}학기 ${(t % 8) + 1}주차`;
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
      body: `<p>입학부터 졸업까지 48주. 공부, 친구, 운동부, 학생회, 연구 중에서 무엇을 키울지는 네 선택이야.</p><div class="gx-welcome-grid">${[
        ['01', '방향을 정하고 한 주 보내기', '매주 키울 능력을 고르면 나머지 일상은 자동으로 흘러가.'],
        ['02', '중요한 순간엔 직접 선택', '운동부 테스트, 선거, 친구와의 약속은 네가 골라.'],
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
    return `<span class="gx-footer-links"><button type="button" data-gx-help="start">도움말</button> · <button type="button" data-gx-help="backup">저장 백업</button> · <button type="button" data-gx-help="updates">${VERSION} 업데이트 소식</button></span>`;
  }
  let started = false;
  function init() {
    if (started || typeof document === 'undefined') return;
    started = true;
    document.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-gx-help]');
      if (b) openHelp(b.dataset.gxHelp || 'start', b);
    });
    const hasSave = !!readCurrentSave();
    if (!hasSave && !getFlag(GUIDE_KEY)) setTimeout(openWelcome, 250);
    else if (hasSave && getFlag(SEEN_VERSION_KEY) !== VERSION) setTimeout(showWhatsNew, 600);
    else if (!getFlag(SEEN_VERSION_KEY)) markVersionSeen();
    checkForUpdate(true);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkForUpdate();
    });
  }

  return { VERSION, isValidSave, unwrapSave, makeBackupFile, backupFileName, encodeSave, decodeBackup, compareVersions, changelog, tabs, openDialog, closeDialog, openHelp, openWelcome, helpButton, footerLinks, checkForUpdate, init, downloadBlob };
});
