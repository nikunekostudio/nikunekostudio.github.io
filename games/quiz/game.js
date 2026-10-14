const isEnglish=new URLSearchParams(location.search).get('lang')==='en';
const text=isEnglish?{
  count:n=>`${n} questions are ready. The final version can contain about 20.`,start:'START QUIZ',next:'NEXT QUESTION',result:'VIEW RESULTS',correct:'Correct!',wrong:'Not quite!',retry:'TRY AGAIN',share:'SHARE ON X',perfect:['Quiz Master!','A perfect score—nothing gets past you!'],great:['Excellent!','That was an impressive result.'],good:['Nice Work!','You are getting the hang of it.'],again:['Good Try!','Review the answers and try again!']
}:{
  count:n=>`現在は動作確認用の${n}問です。あとから約20問まで追加できます。`,start:'クイズスタート',next:'次の問題へ',result:'結果を見る',correct:'正解！',wrong:'不正解…',retry:'もう一度挑戦',share:'Xで結果を共有',perfect:['クイズマスター！','全問正解！すばらしい知識です。'],great:['かなりの物知り！','とてもよい成績です。'],good:['いい調子！','コツをつかんできました。'],again:['ナイスチャレンジ！','解説を見直して、もう一度挑戦しよう！']
};
const questions=window.QUIZ_QUESTIONS||[];
const $=selector=>document.querySelector(selector);
const screens={start:$('#start'),quiz:$('#quiz'),result:$('#result')};
let round=[],index=0,score=0,answered=false;
function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function show(name){Object.entries(screens).forEach(([key,el])=>el.hidden=key!==name)}
function localized(item){return isEnglish&&item.en?{...item,...item.en}:item}
function start(){round=shuffle(questions);index=0;score=0;show('quiz');render()}
function render(){answered=false;const item=localized(round[index]);$('#progress-text').textContent=`QUESTION ${index+1} / ${round.length}`;$('#score-text').textContent=`SCORE ${score}`;$('#progress-bar').style.width=`${(index+1)/round.length*100}%`;$('#category').textContent=item.category;$('#question').textContent=item.question;$('#feedback').hidden=true;const choices=$('#choices');choices.innerHTML='';item.choices.forEach((choice,i)=>{const button=document.createElement('button');button.type='button';button.className='choice';button.textContent=choice;button.addEventListener('click',()=>answer(i));choices.append(button)})}
function answer(choice){if(answered)return;answered=true;const original=round[index];const item=localized(original);const correct=choice===original.answer;if(correct)score++;[...$('#choices').children].forEach((button,i)=>{button.disabled=true;if(i===original.answer)button.classList.add('correct');else if(i===choice)button.classList.add('wrong')});$('#score-text').textContent=`SCORE ${score}`;$('#feedback-title').textContent=correct?text.correct:text.wrong;$('#explanation').textContent=item.explanation;$('#next-button').textContent=index===round.length-1?text.result:text.next;$('#feedback').hidden=false}
function next(){index++;if(index<round.length)render();else finish()}
function finish(){const percent=Math.round(score/round.length*100);const rank=percent===100?text.perfect:percent>=75?text.great:percent>=50?text.good:text.again;$('#result-score').textContent=`${score} / ${round.length}`;$('#result-percent').textContent=`${percent}%`;$('#result-title').textContent=rank[0];$('#result-message').textContent=rank[1];const share=isEnglish?`I scored ${score}/${round.length} on the Nikuneko Quiz!`:`にくねこクイズで${round.length}問中${score}問正解！`;$('#share-button').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${share}\n#にくねこスタジオ`)}&url=${encodeURIComponent(location.href)}`;show('result')}
$('#question-count').textContent=text.count(questions.length);$('#start-button').textContent=text.start;$('#retry-button').textContent=text.retry;$('#share-button').textContent=text.share;$('#start-button').addEventListener('click',start);$('#retry-button').addEventListener('click',start);$('#next-button').addEventListener('click',next);
