import {Game,W,H,ITEMS,TITLE,loadWallet,purchase,equipment,areaAt,backgroundProgress,itemCount,itemEffect} from './model.mjs';
import {AudioManager,stageMusic} from './audio.mjs';
import {drawEnemyBullet} from './bullets.mjs';
import {shareUrl,getRanking,submitScore,cleanName} from './scores.mjs';
const localPreview=['localhost','127.0.0.1',''].includes(location.hostname);
let scoreSubmitted=false,scoreSubmitting=false,rankingRequest=0,selectedMode='normal';
const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d'),panel=$('#panel');
const audio=new AudioManager(),images={},keys=new Set();let game=null,view='loading',last=0,hudAt=0,shownArea=-1,toastUntil=0,pointer=null,storage=null,saveFailed=false,newRecord=false;
try{storage=window.localStorage;}catch{}
const wallet=loadWallet(storage);
function save(){try{storage?.setItem('oniku-shooter-v1',JSON.stringify(wallet));storage?.setItem('oniku-shooter-starter-v1','granted');if(!storage)saveFailed=true;}catch{saveFailed=true;}}
save();
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function button(label,action,cls='primary',extra=''){return `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;}
function interact(){audio.effect('confirm');}
async function load(){
  const manifest=await fetch('assets/asset_manifest.json').then(r=>{if(!r.ok)throw Error('素材一覧を読み込めませんでした');return r.json();});
  const assets={oniku:'player/oniku_3.png',cat:'player/neko_2.png',crab:'player/Kani.png',shot:'shot/shitake.png',enemyShot:'shot/tama2.png',keeper:'shop/shopkeeper.png'};
  for(const b of manifest.backgrounds)assets[b.id]=b.path;
  for(const e of manifest.enemies)assets[e.id]=e.path;
  for(const item of ITEMS)assets[`item_${item.id}`]=`shop/items/${item.image}`;
  await Promise.all(Object.entries(assets).map(([id,path])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[id]=image;resolve();};image.onerror=()=>reject(Error(`素材を読み込めませんでした: ${path}`));image.src=`assets/${path}`;})));
  showTitle();requestAnimationFrame(frame);
}
function showTitle(){selectedMode='normal';view='title';game=null;audio.music('lobby');$('#pause').disabled=true;$('#bomb').disabled=true;$('#live-hud').hidden=true;$('#area-toast').classList.remove('show');$('#status').textContent='READY TO SHOOT';
  panel.innerHTML=`<div class="title"><p class="kicker">NIKUNEKO ARCADE / EPISODE 02</p><h1>シューティングスター<span>おにく<b>２</b></span></h1><div class="title-oniku"><img src="assets/player/oniku_3.png" alt="自機のおにく" width="64" height="64"></div><p class="story">度重なる増税に怒ったおにくは<br>キッシーダに文句を言いに<br>旅立つのだった。</p>${button('準備して出撃　→','shop')}${button('エクストラモード','extra','quiet extra-mode')}<p class="extra-note">3ステージをループ · 1周ごとに敵が30％強化</p>${button('ランキング','ranking','quiet')}</div>`;panel.scrollTop=0;hud();}
function showShop(){view='shop';game=null;pointer=null;keys.clear();audio.music('lobby');$('#live-hud').hidden=true;$('#pause').disabled=true;$('#bomb').disabled=true;$('#area-toast').classList.remove('show');$('#status').textContent='PREPARE FOR THE NEXT RUN';
  panel.innerHTML=`<div class="shop"><div class="shop-head"><div><p class="kicker">BEFORE YOU GO</p><h2>旅支度の店</h2>${selectedMode==='extra'?'<span class="shop-mode">EXTRA MODE</span>':''}</div><div class="wallet"><small>YOUR WALLET</small><span id="wallet">${wallet.coins}</span> G</div></div><div class="shopkeeper"><img src="assets/shop/shopkeeper.png" alt="ショップの店員"><p>いらっしゃいませ！<br>重ね買いで、次の出撃を強化できるよ。<br>お金は、敵を倒して集めてきてね。</p></div><div class="shop-grid">${ITEMS.map(shopItem).join('')}</div><div class="shop-actions">${button('出撃する　→','launch')}${button('戻る','title','quiet')}</div><p class="message" id="shop-message">${saveFailed?'保存を使えないため、お金はこのタブの中だけで保持します。':''}</p></div>`;panel.scrollTop=0;hud();}
function shopItem(i){
  const count=itemCount(i.id,wallet.pending[i.id]),maxed=count>=i.max,short=wallet.coins<i.price,consumable=['coffee','bomb'].includes(i.id);
  return `<article class="item ${count?'bought':''}"><div class="item-top"><img src="assets/shop/items/${i.image}" alt=""><h3>${i.name}</h3></div><div class="item-level"><span>${consumable?`${count} / ${i.max} 個`:`Lv.${count} / ${i.max}`}</span><span class="level-dots" aria-hidden="true">${'●'.repeat(count)}${'○'.repeat(i.max-count)}</span></div><p>${i.description}<br><strong>${itemEffect(i.id,count)}</strong>${maxed?'':` → ${itemEffect(i.id,count+1)}`}</p><button class="buy" data-action="buy" data-id="${i.id}" aria-label="${i.name} ${maxed?'上限':`${i.price} Gで${count?'追加購入':'購入'}`}" ${maxed||short?'disabled':''}>${maxed?'MAX · 上限です':short?`${i.price} G · 所持金不足`:`${i.price} G · ${count?'もう1個':'購入'}`}</button></article>`;
}
function launch(){scoreSubmitted=false;const gear=equipment(wallet,save);game=new Game({mode:selectedMode,gear,reward:n=>{wallet.coins+=n;save();audio.effect('coin');},sound:name=>audio.effect(name)});newRecord=false;view='playing';shownArea=-1;panel.innerHTML='';$('#live-hud').hidden=false;$('#pause').disabled=false;$('#bomb').disabled=false;keys.clear();pointer=null;audio.music('forest');canvas.focus({preventScroll:true});panel.scrollTop=0;hud();}
function pause(){if(view!=='playing')return;view='paused';keys.clear();pointer=null;audio.pause();$('#bomb').disabled=true;$('#pause').disabled=true;$('#status').textContent='PAUSED';panel.innerHTML=`<div class="pause-card">${button('つづける','resume')}${button('旅支度の店へ戻る','abandon','quiet')}</div>`;}
function resume(){if(view!=='paused')return;view='playing';panel.innerHTML='';keys.clear();pointer=null;$('#pause').disabled=false;$('#bomb').disabled=game.bombs===0;audio.resume();canvas.focus({preventScroll:true});}
function result(playSound=true){view='result';keys.clear();pointer=null;$('#pause').disabled=true;$('#bomb').disabled=true;$('#live-hud').hidden=true;$('#area-toast').classList.remove('show');const clear=game.status==='clear';if(game.score>wallet.best){wallet.best=game.score;newRecord=true;}save();if(playSound)audio.finish(clear);$('#status').textContent=clear?'MESSAGE DELIVERED!':'NEXT TIME, ONIKU.';
  panel.innerHTML=`<div class="result-card"><p class="kicker">${game.mode==='extra'?`EXTRA / ${game.loop+1}周目`:clear?'MISSION COMPLETE':'TO BE CONTINUED'}</p><h2>${clear?'文句、届けた！':'おにく、ひと休み。'}</h2><img class="portrait" src="assets/player/oniku_3.png" alt="おにく"><p>${clear?'キッシーダは、たまった文句を受け取った。<br>おにくの旅は、ひとまずおしまい。':game.timeout?'キッシーダは話をかわして去っていった。<br>装備を整えて、もう一度！':'集めたお金は、そのまま持ち帰れるよ。<br>旅支度の店で装備を整えよう。'}</p>${newRecord?'<p class="new-record">NEW HIGH SCORE!</p>':''}<div class="result-stats"><div><span>SCORE</span><strong>${game.score.toLocaleString()}</strong></div><div><span>撃破数 / プレイ時間</span><strong>${game.kills} / ${formatTime(game.mode==='extra'?game.totalTime:game.time)}</strong></div><div><span>今回のお金</span><strong>+${game.earned} G</strong></div><div><span>お財布</span><strong>${wallet.coins} G</strong></div></div><div class="result-share"><a class="primary" href="${esc(shareUrl(game))}" target="_blank" rel="noopener noreferrer">Xでスコアを共有 ↗</a>${button('ランキング','ranking','quiet')}</div>${scoreForm()}${button('旅支度の店へ','shop')}${button('タイトルへ','title','quiet')}</div>`;panel.scrollTop=0;hud();}
function scoreForm(){
  let name='';try{name=cleanName(storage?.getItem('oniku-shooter-player-name'));}catch{}
  return `<form id="score-form" class="score-form"><label for="player-name">ランキングの公開名（20字まで）</label><div><input id="player-name" name="name" maxlength="20" required autocomplete="off" value="${esc(name)}" placeholder="おにく"><button class="quiet" type="submit" ${localPreview||scoreSubmitted||game.score===0?'disabled':''}>${scoreSubmitted?'登録済み':'スコア登録'}</button></div><small>公開名と今回のスコアを送信・掲載します。</small><p id="score-status" role="status">${localPreview?'ローカル試遊中：サイトへの登録は公開後に有効になります。':scoreSubmitted?'ランキングに登録済みです。':`この端末のハイスコア：${wallet.best.toLocaleString()} 点`}</p></form>`;
}
async function showRanking(){
  view='ranking';keys.clear();pointer=null;$('#live-hud').hidden=true;$('#pause').disabled=true;$('#bomb').disabled=true;$('#area-toast').classList.remove('show');hud();
  const request=++rankingRequest;
  panel.innerHTML=`<div class="rankings"><h2>ハイスコアランキング</h2><p class="fine">月間は日本時間。同じ名前は最高スコアの1件だけ掲載。</p><section><h3>今月の TOP 10</h3><p id="rank-current-status" role="status">読み込み中…</p><ol id="rank-current"></ol></section><section><h3>歴代 TOP 10</h3><p id="rank-all-status" role="status">読み込み中…</p><ol id="rank-all"></ol></section>${button('戻る','ranking-back','quiet')}</div>`;
  panel.scrollTop=0;
  for(const period of ['current','all']){
    if(localPreview){$(`#rank-${period}-status`).textContent='公開準備中：本番APIへの接続は公開時に有効になります。';continue;}
    getRanking(period,undefined,selectedMode).then(data=>{
      if(view!=='ranking'||request!==rankingRequest)return;
      $(`#rank-${period}-status`).textContent=data.entries.length?(period==='current'?`${data.month} / 日本時間`:'歴代の最高記録'):'まだ記録はありません。';
      $(`#rank-${period}`).innerHTML=data.entries.map(e=>`<li><span>${esc(e.name)}</span><strong>${e.score.toLocaleString()} 点</strong></li>`).join('');
    }).catch(error=>{if(view==='ranking'&&request===rankingRequest)$(`#rank-${period}-status`).textContent=error.message;});
  }
}
document.addEventListener('submit',async event=>{
  if(event.target.id!=='score-form')return;event.preventDefault();if(localPreview||view!=='result'||!game||scoreSubmitted||scoreSubmitting||game.score===0)return;
  const form=event.target,button=form.querySelector('button'),status=form.querySelector('#score-status'),run=game;
  scoreSubmitting=true;button.disabled=true;status.textContent='登録中…';
  try{
    const name=cleanName(form.querySelector('input').value);let playerId;
    try{playerId=storage?.getItem('nikuneko-player-id');if(!playerId){playerId=crypto.randomUUID();storage?.setItem('nikuneko-player-id',playerId);}storage?.setItem('oniku-shooter-player-name',name);}catch{throw Error('保存を許可するとランキングに登録できます。');}
    if(!storage)throw Error('保存を許可するとランキングに登録できます。');
    const saved=await submitScore({name,score:run.score,playerId,mode:run.mode});
    if(game!==run||view!=='result')return;
    if(saved.updated){scoreSubmitted=true;button.textContent='登録済み';status.textContent='月間・歴代ランキングに記録しました！';}
    else{button.disabled=false;status.textContent='自己ベスト未更新、または連続登録のため更新なし。直前に登録した場合は30秒あけて再度お試しください。';}
  }catch(error){if(game===run&&view==='result'){status.textContent=error.message;button.disabled=false;}}finally{scoreSubmitting=false;}
});
function formatTime(t){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function hud(){$('.bottom-bar').hidden=!['playing','paused'].includes(view);const p=game?.player;$('#score').textContent=String(game?.score||0).padStart(7,'0');$('#best').textContent=String(wallet.best).padStart(7,'0');if(!game)return;$('#lives').textContent='♥'.repeat(Math.max(0,p.hp))+'♡'.repeat(3-Math.max(0,p.hp));$('#timer').textContent=formatTime(game.mode==='extra'?game.totalTime:game.time);$('#gear').textContent=`${game.gear.shield?`☕${game.gear.shield} `:''}${game.gear.damage>1?`ATK ${Math.round(game.gear.damage*100)}% `:''}${game.followers.length?`仲間${game.followers.length} `:''}${game.gear.speed>1?`SPD ${Math.round(game.gear.speed*100)}%`:''}`;$('#bomb-count').textContent=game.bombs;$('#bomb').disabled=view!=='playing'||!game.bombs;const area=areaAt(game.time);$('#status').textContent=view==='playing'?game.mode==='extra'?`EXTRA ${game.loop+1}周目 · 敵${Math.round(game.difficulty*100)}% · ${area+1}`:`${['FOREST','COAST','CITY'][area]} · ${game.time>=210?'KISSHIDA':`${game.earned} G`}`:$('#status').textContent;}
function drawImage(id,x,y,w,h=w,alpha=1){const image=images[id];if(!image)return;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,Math.round(x-w/2),Math.round(y-h/2),w,h);ctx.restore();}
function background(){const t=game?.time||0,area=areaAt(t),progress=backgroundProgress(t);const paint=(index,p,alpha=1)=>{const img=images[`area0${index+1}`];ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(img,0,-(1024-H)*(1-p),W,1024);ctx.restore();};paint(area,progress);if(area>0&&t%70<1)paint(area-1,1,1-t%70);ctx.fillStyle='#101a2a3b';ctx.fillRect(0,0,W,H);}
function draw(){ctx.imageSmoothingEnabled=false;background();if(!game)return;const t=game.time;
  for(const s of game.shots){ctx.fillStyle=s.friendly?'#a9fbff':'#fff4a5';ctx.shadowColor=s.friendly?'#7aeef6':'#ffcb62';ctx.shadowBlur=7;ctx.fillRect(s.x-3,s.y-12,6,22);ctx.shadowBlur=0;drawImage('shot',s.x,s.y,17);}
  for(const e of game.enemies){
    if(e.charging||e.phase>1){ctx.save();ctx.strokeStyle=e.charging?'#fff29d':'#ff8aaf';ctx.globalAlpha=e.charging?.6+Math.sin(t*18)*.3:.4;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.size*.43+Math.sin(t*8)*3,0,Math.PI*2);ctx.stroke();if(e.type==='bull'&&e.chargeState==='warn'){ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(e.x,e.y+20);ctx.lineTo(e.x+e.dashX*1.1,e.y+e.dashY*1.1);ctx.stroke();}ctx.restore();}
    drawImage(e.type,e.x,e.y+Math.sin(t*5+e.baseX)*2,e.size,e.size,e.type==='ghost'?.7+Math.sin(t*3)*.2:1);
    if(e.hit){ctx.save();ctx.globalCompositeOperation='screen';drawImage(e.type,e.x,e.y,e.size,e.size,.7);ctx.restore();}
    if(e.large&&!e.isBoss){ctx.fillStyle='#152639';ctx.fillRect(e.x-37,e.y-e.size/2-8,74,4);ctx.fillStyle=e.phase===2?'#ff8aaf':'#ffd373';ctx.fillRect(e.x-37,e.y-e.size/2-8,74*Math.max(0,e.hp/e.maxHp),4);}
    if(e.phaseWarning>0){ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillStyle='#fff3a6';ctx.fillText(e.isBoss?`PHASE ${e.phase}`:'ENRAGED!',e.x,e.y+e.size/2+20);ctx.textAlign='left';}
  }
  for(const f of game.followers)drawImage(f.kind,f.x,f.y,34);
  const p=game.player;if(p.inv<=0||Math.floor(p.inv*12)%2===0)drawImage('oniku',p.x,p.y,50);
  ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle='#f9fff5';ctx.fill();ctx.strokeStyle='#ba3b65';ctx.lineWidth=1;ctx.stroke();
  if(game.gear.shield){ctx.beginPath();ctx.arc(p.x,p.y,30+Math.sin(t*4)*2,0,Math.PI*2);ctx.strokeStyle='#9aeef8aa';ctx.lineWidth=2;ctx.stroke();}
  for(const b of game.bullets)drawEnemyBullet(ctx,b);
  for(const part of game.particles){ctx.globalAlpha=Math.min(1,part.life*2);ctx.fillStyle=part.color;ctx.fillRect(part.x,part.y,4,4);}ctx.globalAlpha=1;
  if(game.boss&&!game.boss.dead){const e=game.boss;ctx.fillStyle='#152239e8';ctx.fillRect(20,20,W-40,39);ctx.font='bold 11px monospace';ctx.fillStyle='#fff0b6';ctx.fillText(`キッシーダ / PHASE ${e.phase} ${['','通常','反論','発狂'][e.phase]}`,30,36);ctx.fillStyle='#513443';ctx.fillRect(30,44,W-60,6);ctx.fillStyle=['','#9ce7d2','#ffe795','#ff8aaf'][e.phase];ctx.fillRect(30,44,(W-60)*Math.max(0,e.hp/e.maxHp),6);ctx.fillStyle='#152239';for(const fraction of [1/3,2/3])ctx.fillRect(30+(W-60)*fraction,43,2,8);}
  if(game.flash>0){ctx.fillStyle=`rgba(220,205,255,${game.flash*.9})`;ctx.fillRect(0,0,W,H);}
}
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(view==='playing'&&game){const target=pointer?.target;game.step(dt,{x:(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),y:(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0),target});const area=areaAt(game.time),stage=game.time>=210?3:area,number=game.loop*4+stage;if(number!==shownArea){shownArea=number;audio.music(stageMusic(game.time));$('#area-toast').textContent=stage===3?'LAST ENCOUNTER\nキッシーダ':[['01 / 森','キッシーダに文句を伝えに'],['02 / 海岸','キッシーダは潮風の向こうへ'],['03 / 街','キッシーダは眼鏡屋にいる']][area].join('\n');if(game.mode==='extra')$('#area-toast').textContent=`EXTRA ${game.loop+1}周目 / 敵${Math.round(game.difficulty*100)}%\n`+$('#area-toast').textContent;toastUntil=game.time+2.2;}$('#area-toast').classList.toggle('show',game.time<toastUntil);if(now-hudAt>100){hudAt=now;hud();}if(game.status!=='playing')result();}draw();requestAnimationFrame(frame);}
document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b||b.disabled)return;interact();switch(b.dataset.action){case'extra':selectedMode='extra';audio.effect('welcome');showShop();break;case'ranking':showRanking();break;case'ranking-back':game&&game.status!=='playing'?result(false):showTitle();break;case'shop':audio.effect('welcome');showShop();break;case'title':showTitle();break;case'launch':launch();break;case'resume':resume();break;case'abandon':showShop();break;case'buy':{const id=b.dataset.id,scroll=panel.scrollTop;if(purchase(wallet,id,save)){showShop();panel.scrollTop=scroll;const nextButton=panel.querySelector(`[data-id="${id}"]`);(nextButton.disabled?panel.querySelector('[data-action="launch"]'):nextButton).focus({preventScroll:true});audio.effect('buy');$('#shop-message').textContent=`${itemEffect(id,wallet.pending[id])} に強化しました。`;}}break;}});
$('#sound').addEventListener('click',async()=>{const enabled=await audio.enable();$('#sound').textContent=enabled?'SOUND ON':'SOUND OFF';$('#sound').setAttribute('aria-pressed',String(enabled));if(view==='paused')audio.pause();});
$('#pause').addEventListener('click',pause);$('#bomb').addEventListener('click',()=>{if(game?.bomb())hud();});
window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)&&view==='playing')e.preventDefault();if((k==='p'||k==='Escape')&&!e.repeat){if(view==='playing')pause();else if(view==='paused')resume();return;}if(view==='playing'){keys.add(k);if(k==='x'&&!e.repeat){game.bomb();hud();}}});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{keys.clear();if(view==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(view==='playing')pause();else audio.pause();}else if(view==='title'||view==='shop'||(view==='result'&&game?.status==='clear'))audio.resume();});
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',e=>{if(view!=='playing'||pointer)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);const at=point(e);pointer={id:e.pointerId,origin:at,start:{x:game.player.x,y:game.player.y},target:{x:game.player.x,y:game.player.y}};});canvas.addEventListener('pointermove',e=>{if(pointer?.id!==e.pointerId)return;const at=point(e);pointer.target={x:pointer.start.x+at.x-pointer.origin.x,y:pointer.start.y+at.y-pointer.origin.y};});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)pointer=null;});
load().catch(error=>{panel.innerHTML=`<div class="fatal"><h1>${TITLE}</h1><p>${esc(error.message)}</p><p>ページを再読み込みしてください。</p></div>`;});
