'use strict';
// v0.14.5: 대학별 졸업/조기진학 경로, 합격과 진학 분리, 전문선택 상한 해제.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../dist/engine.js');
const R = require('../dist/retrospective-data.js');
const Card = require('../dist/share-card.js');
const RUI = require('../dist/retrospective-ui.js').create(E, { player:()=>'', avatar:()=>'' }, R);
const s = E.create('진학 제한 검증', 1404, { gender:'male' });
E.setClubs(s, E.academicClubs[0].id, 'none');
s.turn=42; s.ending='deferred';
s.admissions = [
 {id:'seoul',name:'서울대학교',accepted:true,majorName:'물리천문학부'},
 {id:'kaist',name:'KAIST',accepted:true,majorName:'자연과학부'},
 {id:'gist',name:'GIST',accepted:false,majorName:'전기전자'}
];
const field = E.getGraduationStatus(s).totalCredits;
s.grades=[{year:3,semester:2,credits:179-field,earnedCredits:179-field,gpa:4.0,subjects:[]}];
assert.equal(E.getGraduationStatus(s).totalCredits,179);
assert.equal(E.canEnroll(s,s.admissions[0]),false);
assert.equal(E.canEnroll(s,s.admissions[1]),true,'KAIST selected applicant may enroll via science-talent route');
for (const id of ['gist','dgist','unist']) assert.equal(E.canEnroll(s,{id,accepted:true}),true,`${id} science-talent route`);
assert.equal(E.canEnroll(s,{id:'postech',accepted:true}),false,'POSTECH requires school-approved early-entrance eligibility');
assert.equal(E.canEnroll(s,{id:'postech',accepted:true,earlyAdmissionApproved:true}),true,'POSTECH early-entrance approved');
assert.equal(E.canEnroll(s,s.admissions[2]),false);
assert.equal(E.getAchievements(s).list.find(a=>a.id==='snu').earned,true,'Admission achievement stays earned');
let data=R.build(s,E);
assert.equal(data.admissions[0].accepted,true);
assert.equal(data.admissions[0].blocked,true);
assert.equal(data.admissions[1].blocked,false);
assert.equal(data.admissions[1].enrollmentStatus,'possible');
let model=Card.buildModel(s,E,data);
assert.equal(model.admissions[0].accepted,true,'Card does not overwrite successful admission');
assert.equal(model.admissions[0].enrollmentStatus,'blocked');
let html=RUI.render(s,{mode:'summary'});
assert.ok(html.includes('합격: 합격') && html.includes('진학: 불가'));
s.grades[0].earnedCredits++;
assert.equal(E.getGraduationStatus(s).totalCredits,180);
assert.equal(E.canEnroll(s,s.admissions[1]),true,'KAIST eligible at 180 credits');
assert.equal(E.canEnroll(s,s.admissions[0]),false,'SNU also requires graduation');
s.ending='graduated';
assert.equal(E.canEnroll(s,s.admissions[0]),true);
data=R.build(s,E);
assert.equal(data.admissions[0].enrollmentStatus,'possible');
model=Card.buildModel(s,E,data);
assert.equal(model.admissions[0].enrollmentStatus,'possible');
const legacy=JSON.parse(JSON.stringify(s));delete legacy.creditRule;
legacy.grades[0].earnedCredits--;
assert.equal(E.canEnroll(legacy,legacy.admissions[1]),true,'Legacy science-talent acceptance still permits enrollment');
const underGrad=E.create('이수 전',143,{gender:'male'});underGrad.admissions=[{id:'kaist',accepted:true}];
assert.equal(E.canEnroll(underGrad,underGrad.admissions[0]),null,'Before grade 2 completion show pending');
underGrad.turn=28; assert.equal(E.canEnroll(underGrad,underGrad.admissions[0]),null,'Grade 2 completion alone is not early admission authorization');
underGrad.earlyAdmissionQualifications={kaist:true}; assert.equal(E.canEnroll(underGrad,underGrad.admissions[0]),true,'Explicit authorization enables early admission after grade 2');
// More than 16 specialist elective credits allowed.
const e=E.create('전문선택',1433,{gender:'female'}); E.setClubs(e,E.academicClubs[0].id,'none');e.turn=21;
const o=E.getEnrollmentOptions(e);
assert.equal(o.rules.specialistMax,null);
const specialist=o.courses.filter(c=>c.category==='specialist');
const selected=[];let credits=0;
for(const course of specialist){selected.push(course.id);credits+=course.credits;if(credits>=18)break;}
assert.ok(credits>16,'Specialist courses can total above 16 credits');
const design=o.courses.find(c=>c.category==='design');assert.ok(design);selected.push(design.id);
const validation=E.validateEnrollment(e,selected);
assert.ok(validation.valid,`Upper-limit-free enrollment should work: ${validation.errors.join('; ')}`);
const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
assert.ok(app.includes('합격 여부 ·')&&app.includes('진학 여부 ·')&&app.includes('180학점'));
assert.equal(E.canEnroll(underGrad,{id:'seoul',accepted:true,earlyAdmissionApproved:true}),null,'Ordinary SNU entry does not accept a generic early-entry credential');
console.log('v14.5 admissions and electives ok');
