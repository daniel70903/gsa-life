(function (root) {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const sources = [
    ['공식 교육과정 편성표', 'https://gsa.jge.hs.kr/sub/page.php?page_code=intro_06_02'],
    ['2026학년도 2학기 교재 목록', 'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=22750&page=1&tbnum=6'],
    ['2026학년도 1학기 교재 목록', 'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=22193&tbnum=6'],
    ['2027학년도 입학생 편성표 공지', 'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=23029&page=1&tbnum=6']
  ];
  function table(headers, rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${Array.isArray(cell) ? cell.map(esc).join('<br>') : esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function render() {
    return `<details class="card source-notes curriculum-guide"><summary>실제 학교의 선택과목 운영 알아보기</summary><div style="max-height:150vh;overflow:auto;margin-top:12px;padding-right:4px">
      <p><strong>2026년 공개 자료를 기준으로 정리했어요.</strong> 현재 게임의 ‘선택과목 2개’는 플레이를 위한 단순화입니다. 아래 실제 과목과 전체 이수 체계는 아직 게임에 모두 구현되지 않았습니다.</p>
      ${table(['적용 구분', '확인한 기준'], [
        ['2026년 현행 설명', '공식 편성표의 「2023학년도 이후 입학생」 표, 첨부 파일의 「2026편성표」 시트, 2026년 학기별 교재 목록을 구분해 확인했습니다.'],
        ['2027년 신입생', '별도의 「2027입학생」 편성표가 적용됩니다. AP 실험·수학세미나 등의 편성이 달라지므로 아래 2026년 설명과 섞지 않습니다.']
      ])}
      <p><strong>선택 영역의 학점은 해당 기간에 걸친 합계예요.</strong> 매 학기 같은 학점을 선택한다는 뜻이 아닙니다.</p>
      ${table(['영역', '이수 기간', '누적 기준'], [
        ['전문선택', '2학년 2학기~3학년 2학기', '28학점 이상'],
        ['융합·교양', '2학년 2학기~3학년 2학기', '4학점 이상'],
        ['학생자율설계교과', '2학년 2학기~3학년 1학기', '6학점 이상']
      ])}
      <p>교과 <strong>156학점</strong> = 일반필수 52 + 전문필수 66 + 전문선택 28 + 융합·교양 4 + 자율설계 6.<br>연구 <strong>24학점</strong> = 기초 R&amp;E 6 + 심화 R&amp;E 10 + 졸업논문 2 + 현장연구 6. 합계는 <strong>180학점</strong>입니다. 자율설계를 학기마다 3학점씩 듣는 고정 배분은 확인하지 못했습니다.</p>
      <p><strong>학기별 실제 운영 과목 예시</strong> · 2026년 각 학년의 교재 목록에 나온 과목입니다. 한 학생이 모두 듣는 시간표나 다음 연도의 개설 확정 목록은 아닙니다.</p>
      ${table(['학기', '선택과목 예시'], [
        ['2학년 2학기', [
          '수학: 미적분학Ⅰ, 선형대수학, 대수학과 기하학',
          '물리: 일반물리학Ⅰ·실험Ⅰ, 기초역학의 이해',
          '화학: 일반화학Ⅰ·실험Ⅰ, 기초유기화학',
          '생명: 일반생명과학Ⅰ·실험Ⅰ, 세포생물학',
          '지구: 야외지질학 및 실습, 천문학 및 실습',
          '정보: 프로그래밍과 문제해결, 로봇프로그래밍'
        ]],
        ['3학년 1학기', [
          '미적분학Ⅱ, 정수론, 미분방정식, 수학세미나Ⅰ',
          '일반물리학Ⅱ·실험Ⅱ, 해석역학의 이해',
          '일반화학Ⅱ·실험Ⅱ, 물리화학',
          '일반생명과학Ⅱ·실험Ⅱ, 동물생리학',
          '자료구조와 알고리즘, 정보과학 프로젝트'
        ]],
        ['3학년 2학기', [
          '수학세미나Ⅱ, 물리세미나, 화학세미나, 생명과학세미나',
          '천문학 및 실습, 지구과학탐구',
          '융합·교양 예시: 환경융합탐구, 전통과학 프로젝트'
        ]]
      ])}
      <p><strong>개별 과목 학점은 확인이 더 필요해요.</strong> 미적분학Ⅰ은 편성표에 3학점·2026년 2학기 교재 목록에 4학점, 수학세미나Ⅱ는 각각 4학점·3학점으로 다르게 표기되어 있습니다. 따라서 위 예시에는 과목별 학점을 확정해 붙이지 않았습니다.</p>
      <p>과목명 Ⅰ·Ⅱ의 흐름은 보이지만, 개별 선수과목 의무·학기 수강 상한·최소 개설 인원은 최신 공개 자료에서 확인하지 못했습니다. 이를 실제 학교의 확정 규칙으로 가정하지 않습니다.</p>
      <p><strong>학교 공식 자료</strong> · 확인일 2026년 11월 12일</p>
      ${sources.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`).join('')}
    </div></details>`;
  }
  const API = { render };
  root.GSACurriculumGuide = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
