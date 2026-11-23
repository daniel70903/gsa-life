(function (root) {
  'use strict';
  const FIELDS = ['math', 'physics', 'chemistry', 'biology', 'earth', 'ai'];
  const FIELD_NAMES = { math: '수학', physics: '물리', chemistry: '화학', biology: '생명과학', earth: '지구과학', ai: '정보·AI' };
  const REQUIRED = { specialist: 28, liberal: 4, design: 6 };
  const CATEGORY_NAMES = { specialist: '전문선택', liberal: '융합·교양', design: '학생자율설계' };
  const tuples = [
    ['calculus_1','미적분학Ⅰ',4,'math',[3]], ['linear_algebra','선형대수학',3,'math',[3]], ['algebra_geometry','대수학과 기하학',3,'math',[3]],
    ['general_physics_1','일반물리학Ⅰ',3,'physics',[3]], ['physics_lab_1','일반물리학실험Ⅰ',1,'physics',[3]], ['basic_mechanics','기초역학의 이해',3,'physics',[3]],
    ['general_chemistry_1','일반화학Ⅰ',3,'chemistry',[3]], ['chemistry_lab_1','일반화학실험Ⅰ',1,'chemistry',[3]], ['basic_organic','기초유기화학',3,'chemistry',[3]],
    ['general_biology_1','일반생명과학Ⅰ',3,'biology',[3]], ['biology_lab_1','일반생명과학실험Ⅰ',1,'biology',[3]], ['cell_biology','세포생물학',3,'biology',[3]],
    ['field_geology','야외지질학 및 실습',3,'earth',[3]], ['astronomy_practice','천문학 및 실습',3,'earth',[3,5]],
    ['programming_problem','프로그래밍과 문제해결',3,'ai',[3]], ['robot_programming','로봇프로그래밍',3,'ai',[3]],
    ['math_seminar_1','수학세미나Ⅰ',4,'math',[4]], ['calculus_2','미적분학Ⅱ',3,'math',[4]], ['number_theory','정수론',3,'math',[4]], ['differential_equations','미분방정식',3,'math',[4]], ['sets_groups','집합론과 군론',3,'math',[4]],
    ['general_physics_2','일반물리학Ⅱ',3,'physics',[4]], ['physics_lab_2','일반물리학실험Ⅱ',1,'physics',[4]], ['analytical_mechanics','해석역학의 이해',3,'physics',[4]], ['engineering_physics','공학물리 프로젝트',3,'physics',[4]],
    ['general_chemistry_2','일반화학Ⅱ',3,'chemistry',[4]], ['chemistry_lab_2','일반화학실험Ⅱ',1,'chemistry',[4]], ['organic_analysis','유기분석',3,'chemistry',[4]], ['physical_chemistry','물리화학',3,'chemistry',[4]],
    ['general_biology_2','일반생명과학Ⅱ',3,'biology',[4]], ['biology_lab_2','일반생명과학실험Ⅱ',1,'biology',[4]], ['animal_physiology','동물생리학',3,'biology',[4]], ['plant_physiology','식물생리학',3,'biology',[4]],
    ['green_energy','그린 에너지 메이커',3,'earth',[4]], ['information_project','정보과학 프로젝트',3,'ai',[4,5]], ['data_algorithms','자료구조와 알고리즘',3,'ai',[4]],
    ['math_seminar_2','수학세미나Ⅱ',3,'math',[5]], ['physics_seminar','물리세미나',3,'physics',[5]], ['chemistry_seminar','화학세미나',3,'chemistry',[5]], ['biology_seminar','생명과학세미나',3,'biology',[5]], ['earth_inquiry','지구과학탐구',3,'earth',[5]], ['object_programming','객체지향 프로그래밍',3,'ai',[5]]
  ];
  const CATALOG = tuples.map(([id,name,credits,field,terms]) => ({ id,name,credits,field,terms,category:'specialist',difficulty: /seminar|mechanics|theory|equations|analysis|physical/.test(id) ? 4 : /lab|practice/.test(id) ? 2 : 3, workload: credits, source: id === 'object_programming' ? '편성표 기반 게임 개설' : '2026학기 교재 목록', description: `${FIELD_NAMES[field]} 분야의 전문선택 과목` }));
  const liberalTuples = [
    ['tradition_project','전통과학 프로젝트','earth',[3,4,5]], ['entrepreneurship','기업가정신 및 기술창업교육','ai',[3,4,5]], ['chinese','중국어','language',[3,5]],
    ['environment_inquiry','환경융합탐구','earth',[4,5]], ['biology_trends','생명과학 최신 연구 동향','biology',[4]], ['japanese','일본어','language',[4]], ['spanish','스페인어','language',[5]]
  ];
  for (const [id,name,field,terms] of liberalTuples) CATALOG.push({id,name,field,terms,credits:2,category:'liberal',difficulty:2,workload:2,source:'2026학기 교재 목록',description:'전문 분야를 넓히는 융합·교양 과목'});
  // Actual subject names, credits and school terms from the public 2022/2024/2025 textbook lists.
  // These archived offerings are selectable together for the game; they are not a 2026 opening notice.
  const HISTORICAL_SOURCES = {
    2022: { sourceURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=5417&tbnum=6', sourceDocumentURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=downpost&tbnum=6&number=5417&file_num=6542', sourceSemester:2 },
    2024: { sourceURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=5525&tbnum=6', sourceDocumentURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=downpost&tbnum=6&number=5525&file_num=6707', sourceSemester:1 },
    2025: { sourceURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=view&number=5612&tbnum=6', sourceDocumentURL:'https://gsa.jge.hs.kr/xboard/board.php?mode=downpost&tbnum=6&number=5612&file_num=6806', sourceSemester:1 }
  };
  const historicalTuples = [
    ['historical_ai_math','인공지능과 수학',2,'math',[4],'specialist',2025,4,'인공지능 모델을 수학으로 해석하는 과목. 계산과 개념 이해를 함께 준비해야 합니다.'],
    ['historical_applied_math_2','응용수학Ⅱ',3,'math',[4],'design',2024,4,'움직임과 생체역학을 수학으로 분석하는 자율설계 주제입니다.'],
    ['historical_physics_inquiry','물리탐구',3,'physics',[3,4],'specialist',2024,3,'물리 개념을 연결해 낯선 문제를 풀고 풀이를 설명합니다.'],
    ['historical_advanced_physics','첨단과학과 물리',2,'physics',[4],'liberal',2025,3,'첨단 기술 속 물리 원리를 찾아 설명하는 융합과학 과목입니다.'],
    ['historical_basic_analysis','기초분석화학',3,'chemistry',[4],'specialist',2025,4,'측정값과 오차를 해석하고 화학 분석의 원리를 익힙니다.'],
    ['historical_basic_inorganic','기초무기화학',3,'chemistry',[4],'specialist',2024,4,'원소의 성질과 구조, 화학 결합을 깊이 있게 다룹니다.'],
    ['historical_organic_reactions','유기화학 반응매커니즘',3,'chemistry',[4],'specialist',2025,4,'유기 반응의 과정을 단계별로 추론하고 설명합니다. 과목명은 당시 교재 목록 표기를 따릅니다.'],
    ['historical_organic_intro','유기화학 입문',3,'chemistry',[3],'design',2022,3,'유기 분자의 구조와 반응을 탐구하는 자율설계 주제입니다.'],
    ['historical_general_earth','일반지구과학 및 실험',3,'earth',[4],'specialist',2025,3,'지구과학 원리를 실험과 관찰 자료에 연결합니다.'],
    ['historical_observational_astronomy','관측천문학',3,'earth',[4],'specialist',2025,3,'천체를 관측하고 기록한 자료를 분석합니다.'],
    ['historical_natural_disasters','자연재해와 인간의 삶',2,'earth',[4],'liberal',2025,3,'자연재해의 원인과 인간 사회의 대응을 함께 탐구합니다.'],
    ['historical_machine_learning','머신러닝과 딥러닝',3,'ai',[3,4],'specialist',2025,4,'데이터와 코드를 이용해 학습 모델을 만들고 결과를 해석합니다.'],
    ['historical_information_life','정보과학과 생활',2,'ai',[5],'liberal',2022,2,'생활 속 데이터를 분석하고 작은 프로그램으로 문제를 해결합니다.'],
    ['historical_humanities','인문학의 이해',2,'social',[3,5],'liberal',2022,2,'사람과 사회에 관한 글을 읽고 자기 관점을 논리적으로 표현합니다.']
  ];
  for (const [id,name,credits,field,terms,category,sourceYear,difficulty,description] of historicalTuples) {
    CATALOG.push({id,name,credits,field,terms,category,difficulty,workload:credits+(difficulty===4?1:0),historical:true,sourceYear,
      ...HISTORICAL_SOURCES[sourceYear],source:`${sourceYear}학년도 ${HISTORICAL_SOURCES[sourceYear].sourceSemester}학기 교재 목록 · 과거 개설`,
      scheduleNote:'과거 개설 학기를 바탕으로 여러 연도 과목을 함께 선택하도록 재구성한 게임 목록입니다. 올해 개설을 뜻하지 않습니다.',description});
  }
  // Both subjects also appear in the 2022 second-semester list; the later list confirms three credits.
  for (const id of ['historical_physics_inquiry','historical_machine_learning']) {
    const course=CATALOG.find(c=>c.id===id);
    course.sourceYears=[2022,course.sourceYear];
    course.additionalSources=[{...HISTORICAL_SOURCES[2022],sourceYear:2022,term:3}];
  }
  for (const term of [3,4]) for (const field of FIELDS) CATALOG.push({id:`design_${term}_${field}`,name:`${FIELD_NAMES[field]} 자율설계 ${term===3?'Ⅰ':'Ⅱ'}`,field,terms:[term],credits:3,category:'design',difficulty:3,workload:3,source:'게임용 설계 주제·학기 배분',description:'직접 탐구 주제를 설계하는 과목. 3학점씩 두 학기에 나누는 것은 게임 규칙입니다.'});
  const REQUIRED_COURSES = {
    3: [['literature_2','문학Ⅱ',3,'language'],['korean_history','한국사',3,'social'],['advanced_english_reading','고급영어독해',2,'language'],['conversation_2','영어회화Ⅱ',1,'language'],['pe_4','체육Ⅳ',1,'athletics'],['advanced_research_2','심화자율연구Ⅱ',5,'research']],
    4: [['reading_individual','독서와 개인',2,'language'],['world_history','세계사',2,'social'],['advanced_english','심화영어',2,'language'],['exercise_health','운동과 건강',1,'athletics'],['graduation_thesis','졸업논문연구',2,'research']],
    5: [['reading_society','독서와 사회',2,'language'],['politics_law','정치와 법',2,'social'],['current_english','시사영어',2,'language'],['sports_culture','스포츠문화',1,'athletics']]
  };
  const LEGACY_FIELDS = { advanced_physics:'physics',advanced_math:'math',advanced_chemistry:'chemistry',advanced_biology:'biology',advanced_ai:'ai',advanced_earth:'earth' };
  const zero = () => ({specialist:0,liberal:0,design:0});
  const termAt = s => Math.min(5,Math.max(3,Math.floor(s.turn/7)));
  const gradeTerm = g => (g.year-1)*2+g.semester-1;
  const clone = x => JSON.parse(JSON.stringify(x));
  const add = (a,b) => { for(const k of Object.keys(REQUIRED)) a[k]+=(Number(b[k])||0);return a; };
  const choiceTotals = courses => courses.reduce((a,c)=>{if(c.category in a)a[c.category]+=c.credits;return a;},zero());
  function byId(id) { return CATALOG.find(c=>c.id===id); }
  function requiredCourses(term) { return (REQUIRED_COURSES[term]||[]).map(([id,name,credits,field])=>({id,name,credits,field,category:field==='research'?'research':'general',term,difficulty:field==='research'?3:2,workload:credits,required:true})); }
  function createAPI(hooks) {
    const {shift,note,assertAlive} = hooks;
    function live(s){if(assertAlive)assertAlive(s);else if(s.alive===false)throw new Error('이야기가 끝난 뒤에는 수강을 변경할 수 없어요.');}
    function init(s){if(!s.curriculum)s.curriculum={version:1,plans:{},completed:{},makeups:[],legacyEquivalences:[],legacySubjects:{},legacyOngoingTerm:null,legacyExempt:false,notes:[]};return s;}
    function basePlanTotals(s,excludeTerm){const q=s.curriculum;const out=zero();if(!q)return out;for(const [term,p]of Object.entries(q.plans||{}))if(Number(term)!==excludeTerm&&!p.legacy)add(out,p.totals||choiceTotals(p.subjects||[]));for(const e of q.legacyEquivalences||[])if(e.term!==excludeTerm)add(out,e.selected);return out;}
    function alreadySelected(s,excludeTerm){const used=new Set();for(const [t,p]of Object.entries(s.curriculum?.plans||{}))if(Number(t)!==excludeTerm)for(const id of p.ids||[])used.add(id);for(const m of s.curriculum?.makeups||[])used.add(m.id);return used;}
    function getEnrollmentOptions(s){
      const term=termAt(s),used=alreadySelected(s,term);
      const courses=CATALOG.filter(c=>c.terms.includes(term)&&!used.has(c.id)).map(c=>({...c,term,source:c.id==='information_project'&&term===5?'편성표 기반 게임 개설':c.source}));
      return {term,year:Math.floor(term/2)+1,semester:term%2+1,courses,requiredCourses:requiredCourses(term),rules:{specialistMin:6,specialistMax:null,liberalMin:0,liberalMax:4,designCredits:term<5?3:0,designCount:term<5?1:0},notes:['과거 개설 표시는 2022·2024·2025년 공식 교재 목록에서 확인한 과목입니다. 여러 연도 과목을 한 게임에서 함께 선택하도록 재구성했으며, 2026년 실제 개설을 뜻하지 않습니다.','학기별 전문선택 최소 6학점(최대 제한 없음)·융합교양 0~4학점은 게임 규칙입니다.','자율설계는 2학년 2학기와 3학년 1학기에 3학점씩 배분했습니다. 실제 고정 배분으로 확인된 규칙이 아닙니다.','미적분학Ⅰ 4학점·수학세미나Ⅱ 3학점은 해당 학기 교재 목록 표기를 게임에 사용합니다. 편성표에는 각각 3·4학점으로 표시되어 있습니다.','Ⅰ 과목을 먼저 통과해야 Ⅱ를 듣는다는 선수조건은 설정하지 않았습니다.','3학년 2학기 정보과목 일부는 공식 편성표를 바탕으로 게임에서 개설한 과목입니다. 실제 해당 학기 개설 확정 목록은 아닙니다.'],readOnly:s.turn<21||s.turn>=42||!!s.curriculum?.plans?.[term]||s.curriculum?.legacyOngoingTerm===term};
    }
    function needsEnrollment(s){if(s.alive===false||s.turn<21||s.turn>=42)return false;const t=termAt(s),q=s.curriculum;return !q?.plans?.[t]&&q?.legacyOngoingTerm!==t;}
    function validateEnrollment(s,ids){
      const options=getEnrollmentOptions(s),term=options.term,errors=[];
      if(!Array.isArray(ids))return{valid:false,errors:['과목 ID 목록을 골라 주세요.'],summary:zero()};
      if(new Set(ids).size!==ids.length)errors.push('같은 과목을 두 번 선택할 수 없어요.');
      const courses=ids.map(id=>options.courses.find(c=>c.id===id));if(courses.some(c=>!c))errors.push('이번 학기에 선택할 수 없는 과목이 포함되어 있어요.');
      const found=courses.filter(Boolean),summary=choiceTotals(found),designCount=found.filter(c=>c.category==='design').length;
      if(summary.specialist<6)errors.push('전문선택은 한 학기에 최소 6학점을 골라 주세요.');
      if(summary.liberal>4)errors.push('융합·교양은 한 학기에 최대 4학점까지 골라 주세요.');
      if(term<5&&(designCount!==1||summary.design!==3))errors.push('자율설계 3학점 과목을 정확히 하나 골라 주세요.');
      if(term===5&&summary.design!==0)errors.push('자율설계는 3학년 1학기까지 선택해요.');
      const cumulative=add(basePlanTotals(s,term),summary),future=5-term;
      const blocked=alreadySelected(s,term);for(const id of ids)blocked.add(id);
      function capacity(category,t,limit){let possible=new Set([0]);for(const c of CATALOG.filter(c=>c.category===category&&c.terms.includes(t)&&!blocked.has(c.id))){const next=new Set(possible);for(const n of possible)if(n+c.credits<=limit)next.add(n+c.credits);possible=next;}return Math.max(...possible);}
      let futureSpecialist=0,futureLiberal=0;for(let t=term+1;t<=5;t++){futureSpecialist+=capacity('specialist',t,Infinity);futureLiberal+=capacity('liberal',t,4);}
      if(cumulative.specialist+futureSpecialist<28)errors.push('남은 학기를 포함해 전문선택 28학점을 채울 수 있도록 더 선택해 주세요.');
      if(cumulative.liberal+futureLiberal<4)errors.push('졸업 전 융합·교양 4학점을 채울 수 있도록 선택해 주세요.');
      if(cumulative.design+(term===3?3:0)<6)errors.push('자율설계 누적 6학점을 채우는 계획이 필요해요.');
      return{valid:errors.length===0,errors,summary:{...summary,total:found.reduce((n,c)=>n+c.credits,0),cumulative}};
    }
    function recommendEnrollment(s,field='physics'){
      if(!FIELDS.includes(field))field='physics';const o=getEnrollmentOptions(s),prior=basePlanTotals(s,o.term),remaining=6-o.term;
      const desired={3:16,4:17,5:8}[o.term]||12,libPlan=Math.min(4,Math.max(0,o.term===5?4-prior.liberal:Math.min(2,4-prior.liberal))),target=Math.max(6,Math.min(16,Math.max(Math.ceil((28-prior.specialist)/remaining),desired-libPlan-(o.term<5?3:0))));/* v0.14: 학기별 선택 학점 권장(2-2 15~16, 3-1 16~17, 3-2 7~9)에 맞춰 총 이수학점 180을 넘기도록 */
      const specialized=o.courses.filter(c=>c.category==='specialist').sort((a,b)=>{const pa=a.field===field?0:a.field==='math'?1:2,pb=b.field===field?0:b.field==='math'?1:2;return pa-pb||CATALOG.findIndex(c=>c.id===a.id)-CATALOG.findIndex(c=>c.id===b.id);});
      let best=null;
      function search(index,picks,credits,cost){if(credits>=target&&credits<=16){const score=cost+(credits-target)*2;if(!best||score<best.score)best={ids:[...picks],score};return;}if(index>=specialized.length||credits>16)return;for(let i=index;i<specialized.length;i++){const c=specialized[i];search(i+1,[...picks,c.id],credits+c.credits,cost+i+1);}}
      search(0,[],0,0);const ids=best?best.ids:[];
      const liberalTarget=Math.min(4,Math.max(0,o.term===5?4-prior.liberal:Math.min(2,4-prior.liberal)));
      let liberal=0;for(const c of o.courses.filter(c=>c.category==='liberal').sort((a,b)=>(a.field===field?-1:0)-(b.field===field?-1:0))){if(liberal>=liberalTarget)break;ids.push(c.id);liberal+=c.credits;}
      if(o.term<5){const d=o.courses.find(c=>c.category==='design'&&c.field===field)||o.courses.find(c=>c.category==='design');if(d)ids.push(d.id);}
      return ids;
    }
    function enroll(s,ids){live(s);if(!needsEnrollment(s))throw new Error('지금은 수강 신청 시점이 아니거나 이미 확정했어요.');const checked=validateEnrollment(s,ids);if(!checked.valid)throw new Error(checked.errors.join(' '));const o=getEnrollmentOptions(s);init(s);const subjects=ids.map(id=>clone(o.courses.find(c=>c.id===id)));const plan={term:o.term,year:o.year,semester:o.semester,ids:[...ids],subjects,courses:clone(subjects),totals:choiceTotals(subjects),confirmedTurn:s.turn,legacy:false};s.curriculum.plans[o.term]=plan;note(s,`${o.year}학년 ${o.semester}학기 수강 확정: ${subjects.map(c=>c.name).join(' · ')}.`, 'curriculum');return plan;}
    function getSubjects(s){if(s.turn<21)return null;const q=s.curriculum,t=termAt(s);if(q?.legacyOngoingTerm===t&&q.legacySubjects?.[t])return clone(q.legacySubjects[t]);const plan=q?.plans?.[t];if(plan?.legacy&&q.legacySubjects?.[t])return clone(q.legacySubjects[t]);if(!plan)return requiredCourses(t);return [...requiredCourses(t),...clone(plan.subjects||[])];}
    function legacyEntry(g){const term=gradeTerm(g),selectedCourses=g.subjects.filter(c=>LEGACY_FIELDS[c.id]),attempted=selectedCourses.reduce((n,c)=>n+c.credits,0),passed=selectedCourses.filter(c=>c.point>0).reduce((n,c)=>n+c.credits,0),ratio=attempted?passed/attempted:0;const selected={specialist:{3:10,4:10,5:8}[term]||0,liberal:term<5?2:0,design:term<5?3:0};const earned={};for(const k of Object.keys(REQUIRED))earned[k]=Math.round(selected[k]*ratio*100)/100;return{term,year:g.year,semester:g.semester,selected,earned,basis:`이전 버전 선택과목 ${passed}/${attempted}학점 통과 비율을 새 영역 기준에 등가 환산`,source:'legacy-equivalence'};}
    function onSemesterEnd(s,g){init(s);const t=gradeTerm(g);if(t<3||t>5||s.curriculum.completed[t])return[];const q=s.curriculum;if(q.legacyOngoingTerm===t||q.plans[t]?.legacy){if(!q.legacyEquivalences.some(e=>e.term===t))q.legacyEquivalences.push(legacyEntry(g));q.completed[t]={term:t,legacy:true};if(q.legacyOngoingTerm===t)q.legacyOngoingTerm=null;return[];}const plan=q.plans[t];if(!plan)return[];const records=(g.subjects||[]).filter(c=>plan.ids.includes(c.id)).map(c=>{const meta=plan.subjects.find(x=>x.id===c.id);return{...meta,score:c.score,grade:c.grade,point:c.point,passed:c.point>0,term:t,year:g.year,semester:g.semester,source:'course'};});q.completed[t]={term:t,year:g.year,semester:g.semester,records,earned:choiceTotals(records.filter(c=>c.passed)),legacy:false};return[];}
    function migrate(s,options={}){
      if(s.curriculum){init(s);if(options.legacyGraduated)s.curriculum.legacyExempt=true;return s;}
      init(s);const q=s.curriculum;q.legacyExempt=!!options.legacyGraduated;
      for(const g of s.grades||[]){const t=gradeTerm(g);if(t<3||t>5)continue;const courses=(g.subjects||[]).filter(c=>LEGACY_FIELDS[c.id]).map(c=>({...clone(c),field:LEGACY_FIELDS[c.id],category:'specialist',term:t}));q.plans[t]={term:t,year:g.year,semester:g.semester,ids:courses.map(c=>c.id),subjects:courses,courses:clone(courses),legacy:true};q.completed[t]={term:t,legacy:true};q.legacySubjects[t]=clone(g.subjects);q.legacyEquivalences.push(legacyEntry(g));}
      const t=termAt(s),hasProgress=(s.turn%7!==0)||!!s.midterm||Object.keys(s.semesterLearning||{}).length>0||(s.turn===21&&(s.electives||[]).length===2);
      if(s.turn>=21&&s.turn<42&&hasProgress){const old=hooks.legacySubjects?hooks.legacySubjects(s):[];q.legacyOngoingTerm=t;q.legacySubjects[t]=clone(old);const electives=old.filter(c=>LEGACY_FIELDS[c.id]).map(c=>({...clone(c),field:LEGACY_FIELDS[c.id],category:'specialist',term:t}));q.plans[t]={term:t,ids:electives.map(c=>c.id),subjects:electives,courses:clone(electives),legacy:true,year:Math.floor(t/2)+1,semester:t%2+1};}
      if(q.legacyEquivalences.length||q.legacyOngoingTerm!==null){q.notes.push('이전 버전에서 끝낸 학기만 등가 환산합니다. 진행 중인 이전 학기의 과목·준비도·중간고사는 그대로 유지하고 다음 학기부터 새 수강 신청을 적용합니다.');note(s,'기존 성적을 보존한 채 새 수강 제도로 이어간다. 이전 선택과목의 등가 환산 내역은 교육과정 기록에서 확인할 수 있다.','curriculum');}
      if(q.legacyExempt)q.notes.push('업데이트 전에 졸업한 기록은 새 선택학점 기준을 소급 적용하지 않습니다.');return s;
    }
    function getStatus(s){const q=s.curriculum;const selected=basePlanTotals(s),earned=zero();for(const c of Object.values(q?.completed||{}))if(!c.legacy)add(earned,c.earned||zero());for(const e of q?.legacyEquivalences||[])add(earned,e.earned);for(const m of q?.makeups||[])if(m.passed&&m.category in earned)earned[m.category]+=m.credits;for(const k of Object.keys(earned))earned[k]=Math.round(earned[k]*100)/100;const missing=zero();for(const k of Object.keys(REQUIRED))missing[k]=Math.max(0,Math.round((REQUIRED[k]-earned[k])*100)/100);const legacyExempt=!!q?.legacyExempt;const requirements=Object.keys(REQUIRED).map(id=>({id,label:CATEGORY_NAMES[id],current:earned[id],required:REQUIRED[id],complete:legacyExempt||earned[id]>=REQUIRED[id]}));return{selected,earned,required:{...REQUIRED},missing,complete:legacyExempt||requirements.every(r=>r.complete),legacyExempt,requirements,plans:clone(q?.plans||{}),currentSubjects:getSubjects(s)||[],makeups:clone(q?.makeups||[]),legacyEquivalences:clone(q?.legacyEquivalences||[]),notes:[...(q?.notes||[])]};}
    function getEvidence(s){const out=[],seen=new Set();for(const g of s.grades||[]){const t=gradeTerm(g);if(t<3||t>5)continue;const p=s.curriculum?.plans?.[t];for(const c of g.subjects||[]){if(!(c.point>0))continue;let meta=p?.subjects?.find(x=>x.id===c.id);let source='course';if(!meta&&LEGACY_FIELDS[c.id]){meta={category:'specialist',field:LEGACY_FIELDS[c.id]};source='legacy';}if(p?.legacy)source='legacy';if(!meta||!Object.keys(REQUIRED).includes(meta.category))continue;const key=`${t}:${c.id}`;if(seen.has(key))continue;seen.add(key);out.push({id:c.id,name:c.name,field:meta.field,credits:c.credits,point:c.point,score:c.score,term:t,year:g.year,semester:g.semester,category:meta.category,source});}}const byField=Object.fromEntries(FIELDS.map(f=>[f,out.filter(c=>c.field===f&&c.category==='specialist').reduce((n,c)=>n+c.credits,0)]));return{courses:out,byField,secondYearSecondTerm:out.filter(c=>c.term===3),completedTerms:[...new Set(out.map(c=>c.term))]};}
    function workload(s){const q=s.curriculum,t=termAt(s);if(s.turn<21||q?.legacyOngoingTerm===t||q?.plans?.[t]?.legacy)return{credits:0,totalCredits:0,choiceCredits:0,difficulty:0,learningMultiplier:1,fatigueExtra:0,stressExtra:0,label:'기존 학기 운영'};const subjects=getSubjects(s)||[],credits=subjects.reduce((n,c)=>n+c.credits,0),choiceCredits=subjects.filter(c=>c.category in REQUIRED).reduce((n,c)=>n+c.credits,0);return{credits,totalCredits:credits,choiceCredits,difficulty:subjects.length?Math.round(subjects.reduce((n,c)=>n+(c.difficulty||2)*c.credits,0)/Math.max(1,credits)*10)/10:0,learningMultiplier:Math.max(.82,Math.min(1.04,1-(credits-27)*.012)),fatigueExtra:Math.round(Math.max(0,credits-27)*.35*(credits>=38?1.4:credits>=33?1.2:1)*10)/10,stressExtra:Math.round(Math.max(0,credits-27)*.2*(credits>=38?1.4:credits>=33?1.2:1)*10)/10,label:credits>30?'높은 수강 부담':credits>26?'보통 수강 부담':'여유 있는 수강 계획'};}
    function getMakeupOptions(s){const status=getStatus(s),short=typeof hooks.creditShortfall==='function'?hooks.creditShortfall(s):0;if(s.alive===false||s.turn<42||(status.complete&&short<=0))return[];const passed=new Set(getEvidence(s).courses.map(c=>c.id));for(const m of s.curriculum?.makeups||[])if(m.passed)passed.add(m.id);return CATALOG.filter(c=>(status.complete?short>0:status.missing[c.category]>0)&&!passed.has(c.id)).map(c=>({...c,term:c.terms[c.terms.length-1],makeup:true}));}
    function makeupCourse(s,id){live(s);if(s.turn<42)throw new Error('정규 6학기를 마친 뒤 부족한 선택학점을 보충할 수 있어요.');const options=getMakeupOptions(s),course=id?options.find(c=>c.id===id):options[0];if(!course)throw new Error('보충할 수 있는 부족 영역의 과목을 선택해 주세요.');init(s);const record={id:course.id,name:course.name,field:course.field,category:course.category,credits:course.credits,term:course.term,turn:s.turn,source:'makeup',passed:true,grade:'P',countsTowardGpa:false};s.curriculum.makeups.push(record);shift(s,{fatigue:5,stress:1,discipline:1,research:course.category==='design'?2:0});return{record,messages:[`${course.name} 보충 과제와 평가를 완료해 ${CATEGORY_NAMES[course.category]} ${course.credits}학점을 이수했다. 기존 F와 평점은 그대로 보존되며 보충 이수(P)는 별도 기록된다.`],events:[]};}
    return{init,migrate,getEnrollmentOptions,recommendEnrollment,validateEnrollment,enroll,needsEnrollment,getSubjects,getStatus,getEvidence,onSemesterEnd,workload,getMakeupOptions,makeupCourse,fields:FIELDS,fieldNames:FIELD_NAMES,catalog:CATALOG};
  }
  const API={createAPI,catalog:CATALOG,fields:FIELDS,fieldNames:FIELD_NAMES};root.GSACurriculumSystems=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
