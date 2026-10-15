import {createSession,nextQuestion,answerQuestion,getResult} from './quiz-engine.mjs';

const STORAGE_KEY='nikuneko-kabukura225-session-v1';
const $=id=>document.getElementById(id);
const screens=['loading','start','quiz','result','error'];
let data=null;
let session=null;

function show(id){
  screens.forEach(name=>$(name).hidden=name!==id);
  window.scrollTo({top:0,behavior:'smooth'});
}

function seed(){
  if(globalThis.crypto?.getRandomValues)return crypto.getRandomValues(new Uint32Array(1))[0];
  return Math.floor(Math.random()*0x100000000);
}

function loadSaved(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved?.dataVersion===data.data_version&&saved?.baseIds?.length===10)return saved;
  }catch{}
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(session))}

function startNew(){
  session=createSession(data,seed());
  save();
  renderQuestion();
}

function renderQuestion(){
  const question=nextQuestion(data,session);
  if(!question){renderResult();return}
  save();
  const answered=Object.keys(session.answers).length;
  $('progress-label').textContent=`第${answered+1}問（最大15問）`;
  $('progress-bar').style.width=`${Math.min(100,(answered/data.config.max_questions)*100)}%`;
  $('question-number').textContent=String(answered+1).padStart(2,'0');
  $('question-text').textContent=question.text;
  $('followup-note').hidden=answered<10;
  const box=$('answer-options');
  box.replaceChildren(...data.answer_options.map(option=>{
    const button=document.createElement('button');
    button.className='answer';button.type='button';
    const key=document.createElement('b');key.textContent=option.id;
    const label=document.createElement('span');label.textContent=option.label;
    button.append(key,label);
    button.addEventListener('click',()=>{
      box.querySelectorAll('button').forEach(item=>item.disabled=true);
      answerQuestion(data,session,question.id,option.id);
      save();
      setTimeout(renderQuestion,140);
    });
    return button;
  }));
  show('quiz');
}

function renderResult(){
  const result=getResult(data,session);
  if(!result.complete)return renderQuestion();
  const profile=data.types.find(item=>item.id===result.typeId);
  $('company-label').textContent=profile.company_label;
  $('type-name').textContent=profile.type_name;
  $('tagline').textContent=`「${profile.tagline}」`;
  $('personality').textContent=profile.personality;
  $('strength').textContent=profile.strength;
  $('weakness').textContent=profile.weakness;
  $('community').textContent=profile.community_behavior;
  $('result-note').textContent=result.note;
  $('question-total').textContent=`今回は${result.answered}問で診断しました。`;
  const axes=$('axes-list');
  axes.replaceChildren(...result.axes.map(axisResult=>{
    const axis=data.axes.find(item=>item.id===axisResult.axisId);
    const row=document.createElement('div');row.className='axis-row';
    const label=document.createElement('span');label.className='axis-label';label.textContent=axis.label;
    const track=document.createElement('span');track.className='axis-track';
    const dot=document.createElement('i');dot.className='axis-dot';
    const normalized=Math.max(-1,Math.min(1,axisResult.sumUnits/9));
    dot.style.left=`${50+normalized*44}%`;track.append(dot);
    const value=document.createElement('span');value.className='axis-value';value.textContent=axisResult.displayLabel;
    row.append(label,track,value);return row;
  }));
  const text=`株225性格診断で「${profile.company_label}・${profile.type_name}」でした！\n${profile.tagline}\n\nあなたはどのタイプ？`;
  $('share-button').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.origin+location.pathname)}`;
  save();
  show('result');
}

function restart(){
  if(Object.keys(session?.answers||{}).length&&!confirm('回答を消して、最初から診断しますか？'))return;
  localStorage.removeItem(STORAGE_KEY);startNew();
}

async function init(){
  try{
    const response=await fetch('./quiz-data.json?v=20261016a');
    if(!response.ok)throw new Error(`診断データの取得に失敗しました（${response.status}）`);
    data=await response.json();
    const saved=loadSaved();
    $('resume-button').hidden=!saved;
    $('resume-button').addEventListener('click',()=>{session=saved;renderQuestion()});
    $('start-button').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);startNew()});
    $('restart-small').addEventListener('click',restart);
    $('retry-button').addEventListener('click',restart);
    show('start');
  }catch(error){
    console.error(error);
    $('error-message').textContent=error.message||'ページを再読み込みして、もう一度お試しください。';
    show('error');
  }
}

init();
