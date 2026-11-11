// 試作版の調整値。同じ写真の再採用とレア率はここで変更できます。
const CONFIG={startingTickets:5,allowDuplicatePhoto:true,rareRate:0.125,incomePerEmployee:10,incomeInterval:10000,baseCapacity:5,capacityStep:3,baseExpansionCost:100};
const names=['にくまる','しお','こしょう','カルビ','ハラミ','タン','ロース','みそ','ゆず','わさび','ポンず','ごま','たれ','まめ','もち','こむぎ','あずき','きなこ','だいふく','おこげ','カブ','カエル','キリン','うし','きのこ','よこなが','おばけ','フクロウ','ねこ','ライオン','ねこ（おそろい）','おにく（おそろい）'];
const NEW_TYPES=Array.from({length:12},(_,i)=>20+i);
const DRAW_TYPES=names.map((_,i)=>i);
const suppliedColors=['水色','ピンク','むらさき','オレンジ','きいろ','あお','みどり','グレー'];
function colorName(c){return c.type>=20?suppliedColors[c.color]:colors[c.color][0]}
function usesOriginal(c){return (c.type===0||c.type>=20)&&c.rare}
function catalogTypes(){return DRAW_TYPES}
const colors=[['ミルク','#f8e8c7'],['きなこ','#e9b875'],['さくら','#efb0a5'],['ココア','#b98769'],['グレー','#b4b8b3'],['くろごま','#77736e'],['抹茶','#b6c797'],['ソーダ','#a4c8c5']];
const key='nikuneko-prototype-v1';
const executives=[{executive:'oniku'},{executive:'neko'}];
const executiveNames={oniku:'おにく',neko:'ねこ'};
let pendingSave=null;
let state;try{state=JSON.parse(localStorage.getItem(key))}catch(e){}
if(!state||!Array.isArray(state.employees)){
  state={money:50,level:0,employees:executives.map(c=>({...c})),discoveries:{},executivesVersion:1};save();
}else if(!state.executivesVersion){
  // 旧版の初期社員だけを置き換え、写真から採用した社員と発見状況は残す。
  const oldStarters=[{type:0,color:0,rare:false},{type:1,color:1,rare:false},{type:2,color:4,rare:false}];
  const hasOldStarters=oldStarters.every((c,i)=>{const e=state.employees[i];return e&&e.type===c.type&&e.color===c.color&&e.rare===c.rare&&e.photoHash===undefined});
  state.employees=[...executives.map(c=>({...c})),...(hasOldStarters?state.employees.slice(3):state.employees)];
  state.executivesVersion=1;save();
}
// 個々の社員にIDを付け、既存の社員は最初の８人を表示対象として引き継ぐ。
if(!state.eliteVersion){
  let next=1;
  for(const employee of state.employees){if(!employee.executive){employee.id=next++;employee.elite=next<=9}}
  state.nextEmployeeId=next;state.eliteVersion=1;save();
}
// チケット導入時に一度だけ配布する。写真の読み込みでは消費しない。
if(!state.ticketVersion){state.tickets=CONFIG.startingTickets;state.ticketVersion=1;save()}
const ELITE_LIMIT=8;
let officeDrag=null, ignoreOfficeClick=false;
function officeEmployeeKey(c){return c.executive?'exec:'+c.executive:'employee:'+c.id}
function eliteCount(){return state.employees.filter(c=>!c.executive&&c.elite).length}
function discoveredCount(){return catalogTypes().filter(i=>state.discoveries[i]).length}
function ticketPrice(){return state.employees.length*10}
let candidate=null;const $=s=>document.querySelector(s);function save(){if(pendingSave!==null){clearTimeout(pendingSave);pendingSave=null}try{localStorage.setItem(key,JSON.stringify(state))}catch(e){toast('保存できませんでした。ブラウザの設定をご確認ください')}}
function scheduleSave(){if(pendingSave!==null)clearTimeout(pendingSave);pendingSave=setTimeout(save,400)}
function flushPendingSave(){if(pendingSave!==null)save()}
window.addEventListener('pagehide',flushPendingSave);document.addEventListener('visibilitychange',()=>{if(document.hidden)flushPendingSave()})
function record(c){const k=String(c.type);state.discoveries[k]??=[];const variant={color:usesOriginal(c)?0:c.color,rare:c.rare};if(!state.discoveries[k].some(v=>v.rare===variant.rare&&(usesOriginal(c)||v.color===variant.color)))state.discoveries[k].push(variant)}
function cat(c){
 if(c.type>=20){const n=String(c.type-19).padStart(2,'0'),suffix=c.rare?'original':'color'+c.color;return `<div class="cat supplied-cat ${c.rare?'original-aura':''}"><img src="assets/employees/${n}-${suffix}.png" alt="" decoding="async"></div>`}
 if(c.type===0&&c.rare)c={...c,color:0};
 const fill=colors[c.color][1], accent=['#d68b58','#b86c51','#dba253','#8eaf7d','#86a3ad'][c.type%5];const spots=c.rare?`<path fill="#f6c447" d="M12 8h2v2h2v2h-2v2h-2v-2h-2v-2h2z M5 17h2v2H5z M20 18h2v2h-2z"/>`:`<path fill="${accent}" d="M17 5h3v1h2v3h-5V8h-2V6h2z" opacity=".8"/>`;const mark=[`<path fill="#a76a45" d="M13 10h2v2h-2z M17 10h2v2h-2z"/>`,`<path fill="#a76a45" d="M14 9h4v2h-4z M15 11h2v2h-2z"/>`,`<path fill="#a76a45" d="M7 12h3v2H7z M22 12h3v2h-3z"/>`,`<path fill="#a76a45" d="M14 9h1v4h-1z M17 9h1v4h-1z"/>`][Math.floor(c.type/5)];const accessory=[`<path fill="${accent}" d="M12 23h8v2h-8z M14 25h4v4h-4z"/>`,`<path fill="${accent}" d="M7 5h3v2h3v2H8V8H6z"/>`,`<path fill="${accent}" d="M9 23h14v2H9z M20 21h3v4h-3z"/>`,`<path fill="${accent}" d="M11 23h10v2H11z M14 25h4v3h-4z"/>`,`<path fill="${accent}" d="M5 13h4v2H5z M23 13h4v2h-4z"/>`][c.type%5];return `<div class="cat ${c.type===0&&c.rare?'original-aura':''}"><svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><path fill="#593326" d="M5 3h5v2h2v2h8V5h2V3h5v9h2v3h1v9h-2v4h-3v2h-6v-2h-6v2H7v-2H4v-4H2v-9h1v-3h2z"/><path fill="${fill}" d="M7 5h2v2h2v2h10V7h2V5h2v9h2v2h1v7h-2v4h-2v1h-4v-2h-8v2H8v-1H6v-4H4v-7h1v-2h2z"/><path fill="#e99788" d="M8 7h2v4H7V9h1z M23 7h2v4h-3V9h1z M7 18h3v2H7z M22 18h3v2h-3z"/>${spots}${mark}<path fill="#593326" d="M10 14h2v3h-2z M20 14h2v3h-2z M14 18h4v2h-1v1h-2v-1h-1z M5 17h3v1H5z M24 17h3v1h-3z"/>${accessory}<path fill="#fff5dc" d="M9 24h4v2H9z M19 24h4v2h-4z"/></svg></div>`}
function officeBackground(level){return `assets/office/grade-${Math.min(5,Math.max(1,Math.floor(level/2)+1))}.webp`}
function capacity(){return CONFIG.baseCapacity+state.level*CONFIG.capacityStep}function cost(){return Math.min(1000000000,Math.round(CONFIG.baseExpansionCost*Math.pow(1.6,state.level)/10)*10)}function money(n){return Math.floor(n).toLocaleString('ja-JP')}function updateBalance(){$('#money').textContent=money(state.money);const balance=$('.housing-balance b');if(balance)balance.textContent='● '+money(state.money)+' G'}
function render(){ $('#office').style.backgroundImage=`url('${officeBackground(state.level)}')`;updateBalance();$('#count').textContent=state.employees.length;$('#capacity').textContent=capacity();$('#income').textContent=state.employees.length*CONFIG.incomePerEmployee;$('#tap-income').textContent=1+state.employees.length;$('#ticket-count').textContent=state.tickets;$('#ticket-price').textContent=money(ticketPrice());const catalog=catalogTypes(),found=discoveredCount();$('#found').textContent=found;$('#total-types').textContent=catalog.length;$('#progress').style.width=(found/catalog.length*100)+'%';renderWorkers();renderGrid();renderOfficers();$('#elite-count').textContent=eliteCount()}
function employeeName(c){return c.executive?executiveNames[c.executive]:names[c.type]}
function employeeArt(c){return c.executive?`<img class="executive-art" src="assets/${c.executive}.png" alt="">`:cat(c)}
function renderWorkers(){if(officeDrag)return;let arr=state.employees.filter(c=>c.executive||c.officer||c.elite);$('#workers').innerHTML=arr.map((c,i)=>{let pos=[[19,31],[62,31],[42,5],[8,3],[70,4],[34,29],[53,5],[82,30],[2,29],[27,5]][i%10],key=officeEmployeeKey(c),saved=state.officePositions?.[key],placement=saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)?`left:${saved.x}%;top:${saved.y}%;bottom:auto;`:`left:${pos[0]}%;bottom:${pos[1]}%;`;return `<div class="worker" data-office-key="${key}" tabindex="0" aria-label="${employeeName(c)}、ドラッグまたは矢印キーで移動" style="${placement}animation-delay:-${i*.27}s;z-index:${3+i%4}" title="${employeeName(c)}${c.executive||c.officer?'（役員）':''}">${employeeArt(c)}${c.executive||c.officer?`<span class="worker-label">役員：${employeeName(c)}${c.executive?'':' #'+c.id}</span>`:''}</div>`}).join('')}
function renderOfficers(){
 const extra=state.employees.filter(c=>!c.executive&&c.officer);
 $('#additional-officers').innerHTML=extra.map(c=>`<div>${cat(c)}<span><b>${employeeName(c)} #${c.id}</b><small>役員</small></span></div>`).join('');
}
function renderGrid(){$('#grid').innerHTML=catalogTypes().map(i=>{let name=names[i],v=state.discoveries[i];return `<button data-type="${i}" aria-label="${v?name+'の詳細':'未発見'}"><span class="portrait">${v?cat({type:i,...v[0]}):'<span class="unknown">?</span>'}</span><small>${v?name:'???'}</small></button>`}).join('')}
function showModal(html){$('#modal-body').innerHTML=html;$('#modal').classList.remove('hidden')}function closeModal(){$('#modal').classList.add('hidden')}function toast(message){let t=$('#toast');t.textContent=message;t.classList.remove('hidden');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.add('hidden'),2300)}
function renderRecruitGuide(){const button=document.querySelector('nav button[data-page="summon"]');if(!button)return;const show=!state.recruitmentVisited;button.classList.toggle('first-recruit-guide',show);if(show)button.setAttribute('aria-label','写真で採用、はじめはこちら');else button.removeAttribute('aria-label')}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='summon'&&!state.recruitmentVisited){state.recruitmentVisited=true;save();renderRecruitGuide()}document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('selected',x===b));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===b.dataset.page));window.scrollTo(0,0)}));
renderRecruitGuide();
$('#expand').onclick=()=>{let price=cost();showModal(`<div style="font-size:36px">🏠</div><h3>オフィスを拡張しますか？</h3><p>社員の受け入れ上限が<br><b>${capacity()}人 → ${capacity()+CONFIG.capacityStep}人</b> になります。</p><p>拡張費用　<b>● ${money(price)} G</b><br><span class="muted">所持金 ${money(state.money)} G</span></p><button id="confirm-expand" class="primary-button">${state.money>=price?'拡張する':'お金が足りません'}</button>`);$('#confirm-expand').onclick=()=>{if(state.money<price){toast('お金が貯まるまでもう少し！');return}state.money-=price;state.level++;save();render();closeModal();toast('オフィスが広くなりました！')}};
function showEmployeeDetails(i){
 const v=state.discoveries[i],employees=state.employees.filter(c=>!c.executive&&c.type===i);
 const seen=new Set(),variants=v.filter(x=>{const key=usesOriginal({type:i,...x})?'original':`${x.color}-${x.rare}`;if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>{const rank=x=>usesOriginal({type:i,...x})?100:(x.rare?8:0)+x.color;return rank(a)-rank(b)});
 const variantCards=variants.map(x=>{const c={type:i,...x};return `<div class="discovery-variant">${cat(c)}<small>${usesOriginal(c)?'✦ オリジナル（レア）':colorName(c)}</small></div>`}).join('');
 const rows=employees.map((c,n)=>`<div class="elite-row">${cat(c)}<span><b>${names[i]} ${n+1}号</b><small>${usesOriginal(c)?'オリジナル ・ レア':colorName(c)+'色'}</small></span><div class="employee-actions"><button class="elite-toggle ${c.elite?'is-elite':''}" data-employee-id="${c.id}" aria-pressed="${!!c.elite}">${c.elite?'★ 設定中':'☆ 設定'}</button><button class="officer-toggle ${c.officer?'is-officer':''}" data-officer-employee="${c.id}" aria-pressed="${!!c.officer}">${c.officer?'役員を解除':'役員に設定'}</button><button class="fire-button" data-fire-employee="${c.id}">解雇</button></div></div>`).join('');
 showModal(`${cat({type:i,...v[0]})}<h3>${names[i]}</h3><p>発見した色：${[...new Set(variants.filter(x=>!usesOriginal({type:i,...x})).map(x=>colorName({type:i,...x})))].join('、')||'なし'}${i===0||i>=20?`<br>オリジナル（レア）：${v.some(x=>usesOriginal({type:i,...x}))?'発見済み ✦':'未発見'}`:''}<br>在籍人数：<b>${employees.length}人</b></p><div class="discovery-section"><b>出会った姿</b><div class="discovery-variants">${variantCards}</div></div><div class="elite-details"><b>★ エリート社員 <span>${eliteCount()} / ${ELITE_LIMIT}</span></b><p>設定するとホームのオフィスに登場します。</p>${rows||'<p>まだ採用されていません</p>'}</div>`);
}
$('#grid').onclick=e=>{let b=e.target.closest('button');if(!b)return;let i=Number(b.dataset.type);if(!state.discoveries[i]){toast('まだ出会っていない社員です');return}showEmployeeDetails(i)};
$('#modal-body').onclick=e=>{
 const officerButton=e.target.closest('[data-officer-employee]');
 if(officerButton){const employee=state.employees.find(c=>!c.executive&&c.id===Number(officerButton.dataset.officerEmployee));if(!employee)return;employee.officer=!employee.officer;save();render();showEmployeeDetails(employee.type);toast(employee.officer?'役員に設定しました':'役員を解除しました');return}
 const fireButton=e.target.closest('[data-fire-employee]');
 if(fireButton){const employee=state.employees.find(c=>!c.executive&&c.id===Number(fireButton.dataset.fireEmployee));if(!employee)return;
  const employeeType=employee.type,employeeId=employee.id;
  showModal(`<h3>社員を解雇しますか？</h3><p><b>${names[employeeType]} #${employeeId}</b> が会社を離れます。<br>役員・エリート社員・住まいの設定も解除されます。</p><p class="muted">図鑑の発見記録は残ります。</p><button id="confirm-fire" class="primary-button fire-confirm">解雇する</button><button id="cancel-fire" class="cancel-fire">キャンセル</button>`);
  $('#cancel-fire').onclick=()=>showEmployeeDetails(employeeType);
  $('#confirm-fire').onclick=()=>{const index=state.employees.findIndex(c=>!c.executive&&c.id===employeeId);if(index<0){showEmployeeDetails(employeeType);return}state.employees.splice(index,1);if(Array.isArray(state.homes)){for(const home of state.homes)home.residents=home.residents.filter(key=>key!=='employee:'+employeeId)}save();render();showEmployeeDetails(employeeType);toast('社員を解雇しました')};return;
 }
 const button=e.target.closest('[data-employee-id]');if(!button)return;const employee=state.employees.find(c=>c.id===Number(button.dataset.employeeId)&&!c.executive);if(!employee)return;if(!employee.elite&&eliteCount()>=ELITE_LIMIT){toast('エリート社員は８体までです');return}employee.elite=!employee.elite;save();render();showEmployeeDetails(employee.type);toast(employee.elite?'エリート社員に設定しました':'エリート社員の設定を解除しました')
};
$('.close').onclick=closeModal;$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
// 写真の全バイトを順番に判定し、少しずつ処理して画面の停止を防ぐ。
async function hashPhoto(file){let h=2166136261;const chunkSize=262144;for(let start=0;start<file.size;start+=chunkSize){const bytes=new Uint8Array(await file.slice(start,start+chunkSize).arrayBuffer());for(const byte of bytes){h^=byte;h=Math.imul(h,16777619)}await new Promise(resolve=>setTimeout(resolve,0))}return h>>>0}
$('#photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;candidate=null;$('#hire').classList.add('hidden');$('#candidate-info').classList.add('hidden');$('#summon-stage').classList.remove('rare');$('#summon-stage').innerHTML='<div class="empty-stage"><div class="camera">✦</div><b>写真を調べています…</b></div>';try{let h=await hashPhoto(file);const img=new Image(),url=URL.createObjectURL(file);await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});let canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;let ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);URL.revokeObjectURL(url);let d=ctx.getImageData(0,0,32,32).data,r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>32){r+=d[i];g+=d[i+1];b+=d[i+2];n++}}r/=n||1;g/=n||1;b/=n||1;let color;if((r+g+b)/3<75)color=5;else if((r+g+b)/3>220)color=0;else if(g>r*1.08&&g>b*1.03)color=6;else if(b>r*1.08)color=7;else if(r>g*1.25&&r>b*1.15)color=2;else if(Math.max(r,g,b)-Math.min(r,g,b)<20)color=4;else if(r>g*1.12&&g>b*1.1)color=1;else color=3;let c={type:DRAW_TYPES[h%DRAW_TYPES.length],color,rare:((h>>>8)%10000)<CONFIG.rareRate*10000,photoHash:h};await new Promise(res=>setTimeout(res,800));candidate=c;record(c);save();render();$('#summon-stage').classList.toggle('rare',usesOriginal(c));$('#summon-stage').innerHTML=cat(c);$('#candidate-info').innerHTML=`${usesOriginal(c)?'<div class="rare-label">✦ レア ✦</div>':''}<b>${names[c.type]}</b><p>${usesOriginal(c)?'オリジナル':colorName(c)+'色'}</p>`;$('#candidate-info').classList.remove('hidden');$('#hire').classList.remove('hidden')}catch(err){$('#summon-stage').innerHTML='<div class="empty-stage"><b>写真を読み込めませんでした</b><p>別の画像を選んでください。</p></div>'}finally{e.target.value=''}};
function showTicketShop(shortage=false){
 const price=ticketPrice();
 showModal(`<h3>${shortage?'採用チケットが足りません':'採用チケットを購入'}</h3><p>チケット１枚：<b>● ${money(price)} G</b><br>現在の在籍社員数：${state.employees.length}人<br><span class="muted">所持金 ${money(state.money)} G</span></p><button id="confirm-buy-ticket" class="primary-button">１枚購入する</button><button id="cancel-buy-ticket" class="cancel-fire">とじる</button>`);
 $('#confirm-buy-ticket').onclick=()=>{const actual=ticketPrice();if(state.money<actual){toast('お金が足りません');return}state.money-=actual;state.tickets++;save();render();closeModal();toast('採用チケットを１枚購入しました')};
 $('#cancel-buy-ticket').onclick=closeModal;
}
$('#ticket-shop-open').onclick=()=>showTicketShop();
function showHireStamp(){
 const stage=$('#summon-stage');stage.querySelector('.hire-stamp')?.remove();
 const stamp=document.createElement('img');stamp.className='hire-stamp';stamp.src='assets/hired-stamp.png';stamp.alt='採用';stage.appendChild(stamp);
}
$('#hire').onclick=()=>{if(!candidate)return;if(state.employees.length>=capacity()){toast('満員です。ホームでオフィスを拡張しよう！');return}if(!CONFIG.allowDuplicatePhoto&&state.employees.some(c=>c.photoHash===candidate.photoHash)){toast('この写真からの社員は採用済みです');return}if(state.tickets<1){showTicketShop(true);return}state.tickets--;state.employees.push({...candidate,id:state.nextEmployeeId++,elite:false});save();render();showHireStamp();toast(names[candidate.type]+'を採用しました！');};
// オフィス内へのタップだけを収入にする。
let activeTapEffects=0;
document.querySelector('.app').addEventListener('click',event=>{
 if(ignoreOfficeClick){ignoreOfficeClick=false;return}
 if(!event.target.closest('#office')||event.target.closest('button, a, input, select, textarea, label, nav, #modal, [role="button"]'))return;
 const reward=1+state.employees.length;
 state.money+=reward;scheduleSave();updateBalance();
 if(activeTapEffects>=12)return;
 const effect=document.createElement('span');effect.className='tap-reward';effect.textContent='+'+money(reward)+' G';effect.style.left=event.clientX+'px';effect.style.top=event.clientY+'px';document.body.appendChild(effect);activeTapEffects++;effect.addEventListener('animationend',()=>{effect.remove();activeTapEffects--},{once:true});
});
// オフィス内の社員は位置を個別に保存する。
const officeArea=$('#office');
function saveOfficePosition(key,x,y){state.officePositions??={};state.officePositions[key]={x,y};save()}
function positionInParent(piece,area){const r=area.getBoundingClientRect(),p=piece.getBoundingClientRect();return {rect:r,x:(p.left-r.left)/r.width*100,y:(p.top-r.top)/r.height*100,width:p.width/r.width*100,height:p.height/r.height*100}}
function clampPosition(value,size){return Math.max(0,Math.min(Math.max(0,100-size),value))}
officeArea.addEventListener('pointerdown',event=>{const piece=event.target.closest('[data-office-key]');if(!piece||event.button!==0)return;const p=positionInParent(piece,officeArea);officeDrag={piece,key:piece.dataset.officeKey,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,...p};piece.setPointerCapture(event.pointerId);piece.classList.add('moving');event.preventDefault()});
officeArea.addEventListener('pointermove',event=>{const d=officeDrag;if(!d||d.pointerId!==event.pointerId)return;const dx=event.clientX-d.startX,dy=event.clientY-d.startY;if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;d.currentX=clampPosition(d.x+dx/d.rect.width*100,d.width);d.currentY=clampPosition(d.y+dy/d.rect.height*100,d.height);d.piece.style.left=d.currentX+'%';d.piece.style.top=d.currentY+'%';d.piece.style.bottom='auto';event.preventDefault()});
function endOfficeDrag(event){const d=officeDrag;if(!d||d.pointerId!==event.pointerId)return;if(d.moved&&Number.isFinite(d.currentX)){saveOfficePosition(d.key,d.currentX,d.currentY);ignoreOfficeClick=true;setTimeout(()=>{ignoreOfficeClick=false},400)}d.piece.classList.remove('moving');officeDrag=null;if(d.moved)renderWorkers()}
officeArea.addEventListener('pointerup',endOfficeDrag);officeArea.addEventListener('pointercancel',endOfficeDrag);
officeArea.addEventListener('keydown',event=>{const piece=event.target.closest('[data-office-key]');if(!piece||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const p=positionInParent(piece,officeArea),x=clampPosition(p.x+(event.key==='ArrowRight'?2:event.key==='ArrowLeft'?-2:0),p.width),y=clampPosition(p.y+(event.key==='ArrowDown'?2:event.key==='ArrowUp'?-2:0),p.height);piece.style.left=x+'%';piece.style.top=y+'%';piece.style.bottom='auto';saveOfficePosition(piece.dataset.officeKey,x,y);event.preventDefault()});
setInterval(()=>{state.money+=state.employees.length*CONFIG.incomePerEmployee;save();updateBalance()},CONFIG.incomeInterval);render();
