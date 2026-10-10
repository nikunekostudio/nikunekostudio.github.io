const questions = [
  {src:'images/q01.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q02.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q03.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q04.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q05.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q06.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q07.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q08.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q09.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q10.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q11.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q12.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q13.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q14.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q15.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q16.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q17.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q18.png',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q19.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q20.jpg',ai:false,copy:'AIではありません。写真または人の手で制作された画像です。'},
  {src:'images/q21.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q22.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q23.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q24.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q25.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q26.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q27.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q28.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q29.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
  {src:'images/q30.png',ai:true,copy:'AI画像です。生成AIによって制作された画像です。'},
];

const startScreen=document.querySelector('#start-screen');
const quizScreen=document.querySelector('#quiz-screen');
const resultScreen=document.querySelector('#result-screen');
const image=document.querySelector('#quiz-image');
const progressText=document.querySelector('#progress-text');
const progressBar=document.querySelector('#progress-bar');
const scoreText=document.querySelector('#score-text');
const answerButtons=document.querySelector('#answer-buttons');
const feedback=document.querySelector('#feedback');
const feedbackMark=document.querySelector('#feedback-mark');
const feedbackTitle=document.querySelector('#feedback-title');
const feedbackCopy=document.querySelector('#feedback-copy');
let round=[];let index=0;let score=0;let answered=false;

function shuffle(items){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  return copy;
}
function show(screen){[startScreen,quizScreen,resultScreen].forEach(item=>item.hidden=item!==screen)}
function begin(){
  const aiQuestions=shuffle(questions.filter(question=>question.ai)).slice(0,5);
  const humanQuestions=shuffle(questions.filter(question=>!question.ai)).slice(0,5);
  round=shuffle([...aiQuestions,...humanQuestions]);
  index=0;score=0;show(quizScreen);renderQuestion();
}
function renderQuestion(){
  const current=round[index];
  answered=false;
  image.src=current.src;
  image.alt=`第${index+1}問の判定画像`;
  progressText.textContent=`QUESTION ${index+1} / ${round.length}`;
  progressBar.style.width=`${((index+1)/round.length)*100}%`;
  scoreText.textContent=`SCORE ${score}`;
  feedback.hidden=true;feedback.classList.remove('wrong');answerButtons.hidden=false;
}
function answer(choice){
  if(answered)return;
  answered=true;
  const current=round[index];
  const correct=(choice==='ai')===current.ai;
  if(correct)score++;
  scoreText.textContent=`SCORE ${score}`;
  answerButtons.hidden=true;feedback.hidden=false;feedback.classList.toggle('wrong',!correct);
  feedbackMark.textContent=correct?'○':'×';
  feedbackTitle.textContent=correct?'正解！':`不正解… 正解は「${current.ai?'AI画像':'AIじゃない'}」`;
  feedbackCopy.textContent=current.copy;
  document.querySelector('#next-button').textContent=index===round.length-1?'結果を見る':'次の画像へ';
}
function next(){index++;if(index<round.length)renderQuestion();else showResult()}
function showResult(){
  const percent=Math.round(score/round.length*100);
  const result=percent===100?['完全鑑定！','AIも人の作品も、すべて見破りました。']:percent>=80?['鋭いAIハンター','かなりの鑑定眼です。わずかな違和感も見逃しません。']:percent>=60?['なかなかの鑑定眼','AIのクセが少しずつ見えてきています。']:percent>=40?['見分けは五分五分','画像の世界は奥深い。もう一度なら結果が変わるかも？']:['AIに化かされた！','見た目だけで判断するのは難しい。リベンジしてみよう！'];
  document.querySelector('#result-percent').textContent=`${percent}%`;
  document.querySelector('#result-score').textContent=`${score} / ${round.length}`;
  document.querySelector('#result-rank').textContent=result[0];
  document.querySelector('#result-message').textContent=result[1];
  const text=`『AI or NOT?』で10問中${score}問正解、正解率${percent}%！\n${result[0]}\nキミはAI画像を見破れる？\n#AIorNOT #にくねこスタジオ`;
  const url='https://nikunekostudio.github.io/games/ai-or-not/';
  document.querySelector('#share-button').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  show(resultScreen);
}

document.querySelector('#start-button').addEventListener('click',begin);
document.querySelector('#retry-button').addEventListener('click',begin);
document.querySelector('#next-button').addEventListener('click',next);
answerButtons.addEventListener('click',event=>{const button=event.target.closest('[data-answer]');if(button)answer(button.dataset.answer)});
