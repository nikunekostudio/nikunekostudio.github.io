// 住まいの価格や家具は試作版用。必要に応じて調整できます。
const HOUSING_TYPES={dorm:{name:'社員寮',icon:'🏢',price:150,upgradeBase:120},house:{name:'おうち',icon:'🏠',price:220,upgradeBase:150}};
// 先頭６種は旧家具と対応させ、保存済みの配置を引き継ぐ。
const FURNITURE=[
 {name:'なし'},
 {name:'ベッド',src:'home/bed.webp',width:30},
 {name:'ソファ',src:'home/sofa.webp',width:27},
 {name:'ローテーブル',src:'home/low-table.webp',width:25},
 {name:'観葉植物',src:'accessories/potted-plant.webp',width:17},
 {name:'本棚',src:'home/bookcase.webp',width:18},
 {name:'テレビ',src:'home/television.webp',width:21},
 {name:'つめとぎ',src:'accessories/cat-scratching-post.webp',width:17},
 {name:'座布団',src:'accessories/floor-cushion-zabuton.webp',width:22},
 {name:'テレビ台',src:'accessories/low-tv-console.webp',width:25},
 {name:'ミニ冷蔵庫',src:'accessories/mini-refrigerator.webp',width:17},
 {name:'休憩ソファ',src:'office/break-room-sofa.webp',width:27},
 {name:'デスク',src:'office/desk.webp',width:27},
 {name:'パソコン',src:'office/desktop-computer.webp',width:17},
 {name:'給水機',src:'office/hot-water-dispenser.webp',width:16},
 {name:'オフィスチェア',src:'office/office-chair.webp',width:17},
 {name:'金額縁の風景画',src:'luxury/gold-framed-painting.webp',width:24,tier:'luxury'},
 {name:'金額縁ミラー',src:'luxury/ornate-mirror.webp',width:18,tier:'luxury'},
 {name:'大理石の胸像',src:'luxury/marble-bust-pedestal.webp',width:18,tier:'luxury'},
 {name:'振り子時計',src:'luxury/grandfather-clock.webp',width:17,tier:'luxury'},
 {name:'高級ソファ',src:'luxury/luxury-sofa.webp',width:30,tier:'luxury'},
 {name:'大型水槽',src:'luxury/luxury-aquarium.webp',width:29,tier:'luxury'},
 {name:'シャンデリア',src:'luxury/chandelier.webp',width:26,tier:'luxury'},
 {name:'白ごはん',src:'food/rice.webp',width:18,tier:'food'},
 {name:'お味噌汁',src:'food/miso-soup.webp',width:18,tier:'food'},
 {name:'目玉焼き',src:'food/fried-egg.webp',width:20,tier:'food'},
 {name:'焼き魚',src:'food/grilled-fish.webp',width:22,tier:'food'},
 {name:'カレーライス',src:'food/curry.webp',width:23,tier:'food'}
];
function furnitureArt(item){return item.src?`<img src="assets/furniture/${item.src}" alt="" loading="lazy" decoding="async">`:'<span aria-hidden="true">＋</span>'}

const ROOM_LIMIT=8, MAX_HOME_LEVEL=10, HOME_TYPE_LIMIT=3;
function homesOfType(type){return state.homes.filter(h=>h.type===type)}
function homeLabel(home){return `${HOUSING_TYPES[home.type].name} ${homesOfType(home.type).findIndex(h=>h.id===home.id)+1}号`}
if(!Array.isArray(state.homes))state.homes=[];
if(!Number.isInteger(state.nextHomeId))state.nextHomeId=1;
// 既存の配置家具は購入済みとして登録し、配置と位置を引き継ぐ。
if(!Array.isArray(state.ownedFurniture)){
 state.ownedFurniture=[...new Set(state.homes.flatMap(h=>Array.isArray(h.furniture)?h.furniture:[]).filter(i=>Number.isInteger(i)&&i>0&&i<FURNITURE.length))];save();
}
const FURNITURE_BASE_PRICES=[0,120,140,100,80,160,180,90,70,110,150,170,150,180,140,120,12000,18000,22000,28000,35000,42000,50000,2000,2500,3000,4000,5000];
function furniturePrice(index){
 const tier=FURNITURE[index]?.tier,isSpecial=tier==='luxury'||tier==='food';
 const growth=isSpecial?Math.pow(1.04,state.ownedFurniture.filter(i=>FURNITURE[i]?.tier===tier).length):Math.pow(1.35,state.ownedFurniture.length);
 const limit=tier==='food'?5000:tier==='luxury'?50000:1000000000;
 return Math.min(limit,Math.round(FURNITURE_BASE_PRICES[index]*growth/10)*10)
}
function furnitureOwned(index){return index===0||state.ownedFurniture.includes(index)}
if(!Array.isArray(state.officeFurniture)){state.officeFurniture=Array(6).fill(0);save()}
function showFurniturePicker(current,onConfirm,onCancel){
 let choice=current||0;
 showModal(`<h3>家具をえらぶ</h3><p>購入した家具は何度でも配置できます。<br>所持金：<b>● ${money(state.money)} G</b></p><div class="furniture-picker">${FURNITURE.map((item,i)=>`<button class="furniture-option ${i===choice?'selected':''}" data-furniture-choice="${i}" aria-pressed="${i===choice}">${furnitureArt(item)}<small>${item.name}</small><small class="furniture-price">${i===0?'無料':furnitureOwned(i)?'購入済み':'● '+money(furniturePrice(i))+' G'}</small></button>`).join('')}</div><button id="confirm-furniture" class="primary-button">決定</button><button id="cancel-furniture" class="cancel-fire">キャンセル</button>`);
 function updateChoice(){const confirm=$('#confirm-furniture');confirm.textContent=furnitureOwned(choice)?'決定':`購入して配置　● ${money(furniturePrice(choice))} G`;document.querySelectorAll('[data-furniture-choice]').forEach(b=>{const selected=Number(b.dataset.furnitureChoice)===choice;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))})}
 document.querySelectorAll('[data-furniture-choice]').forEach(option=>option.addEventListener('click',()=>{choice=Number(option.dataset.furnitureChoice);updateChoice()}));updateChoice();
 $('#confirm-furniture').onclick=()=>{if(!furnitureOwned(choice)){const price=furniturePrice(choice);if(state.money<price){toast('お金が足りません');return}state.money-=price;state.ownedFurniture.push(choice)}onConfirm(choice);save();render();closeModal()};
 $('#cancel-furniture').onclick=()=>{closeModal();if(onCancel)onCancel()};
}

let selectedHome=null;
function residentKey(employee){return employee.executive?'exec:'+employee.executive:'employee:'+employee.id}
function residentLabel(employee){return employeeName(employee)+(employee.executive?'（役員）':' #'+employee.id)}
function activatePage(id){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('selected',b.dataset.page==='home'));window.scrollTo(0,0)}
function roomSlots(home){return Math.min(6,home.level+1)}
const FURNITURE_DEFAULTS=[[28,46],[61,46],[39,68],[72,68],[22,70],[80,40]];
// 家具の重なりは奥・中・手前の３段階。社員のレイヤーより常に下に置く。
function furnitureLayer(layers,slot){const value=layers?.[slot];return Number.isInteger(value)&&value>=1&&value<=3?value:2}
function layerControl(attribute,slot,layer,extra=''){return `<label class="furniture-layer-control">重なり<select ${attribute}="${slot}" ${extra} aria-label="家具${slot+1}の重なり"><option value="1" ${layer===1?'selected':''}>奥</option><option value="2" ${layer===2?'selected':''}>中</option><option value="3" ${layer===3?'selected':''}>手前</option></select></label>`}

function furniturePosition(home,slot){const pos=home.furniturePositions?.[slot];return pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.y)?pos:{x:FURNITURE_DEFAULTS[slot][0],y:FURNITURE_DEFAULTS[slot][1]}}
function saveFurniturePosition(home,slot,x,y){home.furniturePositions??=[];home.furniturePositions[slot]={x,y};save()}
// 住まいは２グレードにつき１枚、全５段階の背景にする。
function roomBackground(type,level){return `assets/${type==='dorm'?'dorm':'house'}/grade-${Math.min(5,Math.max(1,Math.ceil(level/2)))}.webp`}
function upgradeDescription(home){
 const notes=[];
 if(roomSlots(home)<6)notes.push('家具を置ける場所が１つ増えます。');
 if(home.level%2===0)notes.push('内装が豪華になります。');
 return notes.join('<br>')||'グレードが１つ上がります。';
}
function upgradePrice(home){return Math.min(1000000000,Math.round(HOUSING_TYPES[home.type].upgradeBase*Math.pow(1.6,home.level-1)/10)*10)}
function housingHeader(){return `<div class="housing-balance">所持金 <b>● ${money(state.money)} G</b></div>`}
function showHousing(){selectedHome=null;activatePage('housing');drawHousing()}
function drawHousing(){
 const area=$('#housing-content');if(!area)return;
 const home=state.homes.find(h=>h.id===selectedHome);
 if(home){drawHome(home);return}
 const list=Object.entries(HOUSING_TYPES).map(([key,type])=>{const homes=homesOfType(key);return `<div class="building-group"><div class="building-group-title"><b>${type.name}</b><span>${homes.length} / ${HOME_TYPE_LIMIT} 棟</span></div>${homes.map(h=>`<button class="building-card" data-action="open" data-id="${h.id}"><span class="building-icon">${type.icon}</span><span><b>${homeLabel(h)}</b><small>グレード ${h.level}　・　入居 ${h.residents.length} / ${ROOM_LIMIT} 人</small></span><span class="arrow">›</span></button>`).join('')||'<p class="building-group-empty">まだ所有していません</p>'}</div>`}).join('');
 area.innerHTML=`${housingHeader()}<div class="housing-intro"><b>みんなの帰る場所をつくろう</b><p>建物を購入して、家具や社員を配置できます。</p></div><div class="collection-label"><b>所有している建物</b><span>${state.homes.length} 棟</span></div>${list}<div class="collection-label"><b>建物を購入</b><span>それぞれ３棟まで</span></div><div class="building-shop">${Object.entries(HOUSING_TYPES).map(([key,type])=>{const count=homesOfType(key).length,full=count>=HOME_TYPE_LIMIT;return `<div><div class="shop-icon">${type.icon}</div><b>${type.name}</b><small>所有 ${count} / ${HOME_TYPE_LIMIT} 棟 ・ 社員８人まで</small><button data-action="buy" data-type="${key}" ${full?'disabled':''}>${full?'購入上限':'● '+money(type.price)+' G'}</button></div>`}).join('')}</div>`;
}
function drawHome(home){
 const type=HOUSING_TYPES[home.type], occupants=home.residents.map(key=>state.employees.find(c=>residentKey(c)===key)).filter(Boolean);
 const positions=[[8,10],[28,10],[48,10],[68,10],[8,42],[28,42],[48,42],[68,42]];
 const residents=state.employees.map(c=>{const key=residentKey(c),selected=home.residents.includes(key),other=state.homes.find(h=>h.id!==home.id&&h.residents.includes(key));return `<div class="resident-row">${employeeArt(c)}<span><b>${residentLabel(c)}</b><small>${other?'ほかの建物に入居中':c.executive?'役員':usesOriginal(c)?'オリジナル ・ レア':colorName(c)+'色'}</small></span><button data-action="resident" data-id="${home.id}" data-key="${key}" class="${selected?'active':''}" aria-pressed="${selected}">${selected?'入居中':'入居'}</button></div>`}).join('');
 const furniture=Array.from({length:roomSlots(home)},(_,i)=>{let n=home.furniture[i]||0;return `<div class="furniture-slot"><button data-action="furniture" data-id="${home.id}" data-slot="${i}">${furnitureArt(FURNITURE[n])}<small>${FURNITURE[n].name}</small></button>${layerControl('data-furniture-layer-slot',i,furnitureLayer(home.furnitureLayers,i),`data-home-id="${home.id}"`)}</div>`}).join('');
 const furnitureInRoom=Array.from({length:roomSlots(home)},(_,i)=>{const n=home.furniture[i]||0;if(!n||!FURNITURE[n])return '';const pos=furniturePosition(home,i);return `<button class="room-furniture" data-furniture-slot="${i}" data-home-id="${home.id}" style="left:${pos.x}%;top:${pos.y}%;width:${FURNITURE[n].width}%;z-index:${furnitureLayer(home.furnitureLayers,i)-1}" aria-label="${FURNITURE[n].name} ${i+1}、ドラッグまたは矢印キーで移動">${furnitureArt(FURNITURE[n])}</button>`}).join('');
 const upgrade=home.level<MAX_HOME_LEVEL?`<button class="primary-button housing-upgrade" data-action="upgrade" data-id="${home.id}">グレード ${home.level+1} にする　● ${money(upgradePrice(home))} G</button><p class="housing-note">${upgradeDescription(home)}<br>試作版ではお金だけでアップグレードできます。</p>`:'<p class="housing-note">✦ 最高グレードです</p>';
 const area=$('#housing-content');area.innerHTML=`${housingHeader()}<button class="back-button inner-back" data-action="list">‹　建物一覧へ</button><div class="room-heading"><span>${type.icon}</span><div><b>${homeLabel(home)}</b><small>グレード ${home.level}　・　入居 ${occupants.length} / ${ROOM_LIMIT} 人</small></div></div><div class="room-scene grade-${home.level} image-room" style="background-image:url('${roomBackground(home.type,home.level)}')"><div class="room-grade">✦ GRADE ${home.level}</div>${furnitureInRoom}${occupants.map((c,i)=>{const key=residentKey(c),saved=home.residentPositions?.[key],placement=saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)?`left:${saved.x}%;top:${saved.y}%;bottom:auto;`:`left:${positions[i][0]}%;bottom:${positions[i][1]}%;`;return `<div class="room-resident" data-resident-key="${key}" data-home-id="${home.id}" tabindex="0" aria-label="${residentLabel(c)}、ドラッグまたは矢印キーで移動" style="${placement}animation-delay:-${i*.2}s" title="${residentLabel(c)}">${employeeArt(c)}</div>`}).join('')}${occupants.length?'':'<div class="room-empty">社員を入居させてみよう！</div>'}</div><div class="room-section"><b>家具をえらぶ <small>タップで一覧を表示</small></b><p>家具を選んで部屋で動かせます。重なりは奥・中・手前から選べます。</p><div class="furniture-list">${furniture}</div></div><div class="room-section"><b>入居する社員 <small>${occupants.length} / ${ROOM_LIMIT} 人</small></b><p>社員は部屋の中でドラッグして動かせます。別の建物に入居中の社員を選ぶと、こちらに引っ越します。</p><div class="resident-list">${residents}</div></div>${upgrade}`;
}
$('#housing-open').onclick=showHousing;$('#housing-back').onclick=()=>activatePage('home');
$('#housing-content').onclick=e=>{const btn=e.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action,home=state.homes.find(h=>h.id===Number(btn.dataset.id));
 if(action==='list'){selectedHome=null;drawHousing();return}
 if(action==='open'&&home){selectedHome=home.id;drawHousing();return}
 if(action==='buy'){const type=HOUSING_TYPES[btn.dataset.type];if(!type)return;if(homesOfType(btn.dataset.type).length>=HOME_TYPE_LIMIT){toast('この建物は３棟までです');return}showModal(`<div class="shop-icon">${type.icon}</div><h3>${type.name}を購入しますか？</h3><p>社員を８人まで入居できます。<br>購入費用　<b>● ${money(type.price)} G</b><br><span class="muted">所持金 ${money(state.money)} G</span></p><button id="confirm-home-buy" class="primary-button">購入する</button>`);$('#confirm-home-buy').onclick=()=>{if(homesOfType(btn.dataset.type).length>=HOME_TYPE_LIMIT){closeModal();drawHousing();toast('この建物は３棟までです');return}if(state.money<type.price){toast('お金が足りません');return}state.money-=type.price;const home={id:state.nextHomeId++,type:btn.dataset.type,level:1,residents:[],furniture:[0,0,0,0,0,0]};state.homes.push(home);save();render();closeModal();selectedHome=home.id;drawHousing();toast(type.name+'を購入しました！')};return}
 if(!home)return;
 if(action==='furniture'){
  const slot=Number(btn.dataset.slot);if(slot<0||slot>=roomSlots(home))return;
  showFurniturePicker(home.furniture[slot],choice=>{home.furniture[slot]=choice;drawHousing()});return
 }
 if(action==='resident'){const key=btn.dataset.key;if(!state.employees.some(c=>residentKey(c)===key))return;const i=home.residents.indexOf(key);if(i>=0){home.residents.splice(i,1)}else{if(home.residents.length>=ROOM_LIMIT){toast('入居できるのは８人までです');return}for(const other of state.homes){if(other.id!==home.id)other.residents=other.residents.filter(k=>k!==key)}home.residents.push(key)}save();drawHousing();return}
 if(action==='upgrade'&&home.level<MAX_HOME_LEVEL){let price=upgradePrice(home);showModal(`<h3>グレードアップしますか？</h3><p>${typeName(home)}　グレード ${home.level} → ${home.level+1}<br>${upgradeDescription(home)}<br>費用　<b>● ${money(price)} G</b></p><p class="muted">試作版ではお金のみでアップグレードできます。</p><button id="confirm-home-upgrade" class="primary-button">グレードアップ</button>`);$('#confirm-home-upgrade').onclick=()=>{if(state.money<price){toast('お金が足りません');return}state.money-=price;home.level++;save();render();closeModal();drawHousing();toast('グレードアップしました！')};}
};
function typeName(home){return HOUSING_TYPES[home.type].name}

// Pointer Events でタッチ、マウス、ペンのいずれでも配置できる。
let furnitureDrag=null;
const housingArea=$('#housing-content');
housingArea.addEventListener('change',event=>{const control=event.target.closest('[data-furniture-layer-slot]');if(!control)return;const home=state.homes.find(h=>h.id===Number(control.dataset.homeId)),slot=Number(control.dataset.furnitureLayerSlot),layer=Number(control.value);if(!home||!Number.isInteger(slot)||slot<0||slot>=roomSlots(home)||!Number.isInteger(layer)||layer<1||layer>3)return;home.furnitureLayers??=[];home.furnitureLayers[slot]=layer;save();const piece=housingArea.querySelector(`[data-furniture-slot="${slot}"][data-home-id="${home.id}"]`);if(piece)piece.style.zIndex=String(layer-1)});
housingArea.addEventListener('pointerdown',event=>{
 const piece=event.target.closest('[data-furniture-slot]');if(!piece||event.button!==0)return;
 const home=state.homes.find(h=>h.id===Number(piece.dataset.homeId)),room=piece.closest('.room-scene'),slot=Number(piece.dataset.furnitureSlot);if(!home||!room)return;
 const rect=room.getBoundingClientRect(),pieceRect=piece.getBoundingClientRect(),pos=furniturePosition(home,slot);
 furnitureDrag={piece,home,slot,rect,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:pos.x,y:pos.y,halfX:pieceRect.width/2/rect.width*100,halfY:pieceRect.height/2/rect.height*100};
 piece.setPointerCapture(event.pointerId);piece.classList.add('moving');event.preventDefault();
});
housingArea.addEventListener('pointermove',event=>{
 const drag=furnitureDrag;if(!drag||drag.pointerId!==event.pointerId)return;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const x=clamp(drag.x+(event.clientX-drag.startX)/drag.rect.width*100,drag.halfX,100-drag.halfX),y=clamp(drag.y+(event.clientY-drag.startY)/drag.rect.height*100,drag.halfY,100-drag.halfY);
 drag.currentX=x;drag.currentY=y;drag.piece.style.left=x+'%';drag.piece.style.top=y+'%';event.preventDefault();
});
function finishFurnitureDrag(event){const drag=furnitureDrag;if(!drag||drag.pointerId!==event.pointerId)return;if(Number.isFinite(drag.currentX))saveFurniturePosition(drag.home,drag.slot,drag.currentX,drag.currentY);drag.piece.classList.remove('moving');furnitureDrag=null}
housingArea.addEventListener('pointerup',finishFurnitureDrag);
housingArea.addEventListener('pointercancel',finishFurnitureDrag);
housingArea.addEventListener('keydown',event=>{
 const piece=event.target.closest('[data-furniture-slot]');if(!piece||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
 const home=state.homes.find(h=>h.id===Number(piece.dataset.homeId)),room=piece.closest('.room-scene'),slot=Number(piece.dataset.furnitureSlot);if(!home||!room)return;
 const pos=furniturePosition(home,slot),rect=room.getBoundingClientRect(),pieceRect=piece.getBoundingClientRect(),halfX=pieceRect.width/2/rect.width*100,halfY=pieceRect.height/2/rect.height*100;
 const x=Math.max(halfX,Math.min(100-halfX,pos.x+(event.key==='ArrowRight'?2:event.key==='ArrowLeft'?-2:0))),y=Math.max(halfY,Math.min(100-halfY,pos.y+(event.key==='ArrowDown'?2:event.key==='ArrowUp'?-2:0)));
 piece.style.left=x+'%';piece.style.top=y+'%';saveFurniturePosition(home,slot,x,y);event.preventDefault();
});

// 住まいの社員は建物ごとに位置を保存する。
let residentDrag=null;
function saveResidentPosition(home,key,x,y){home.residentPositions??={};home.residentPositions[key]={x,y};save()}
housingArea.addEventListener('pointerdown',event=>{const piece=event.target.closest('[data-resident-key]');if(!piece||event.button!==0)return;const home=state.homes.find(h=>h.id===Number(piece.dataset.homeId)),room=piece.closest('.room-scene');if(!home||!room)return;const p=positionInParent(piece,room);residentDrag={piece,home,key:piece.dataset.residentKey,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,...p};piece.setPointerCapture(event.pointerId);piece.classList.add('moving');event.preventDefault()});
housingArea.addEventListener('pointermove',event=>{const d=residentDrag;if(!d||d.pointerId!==event.pointerId)return;const dx=event.clientX-d.startX,dy=event.clientY-d.startY;if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;d.currentX=clampPosition(d.x+dx/d.rect.width*100,d.width);d.currentY=clampPosition(d.y+dy/d.rect.height*100,d.height);d.piece.style.left=d.currentX+'%';d.piece.style.top=d.currentY+'%';d.piece.style.bottom='auto';event.preventDefault()});
function endResidentDrag(event){const d=residentDrag;if(!d||d.pointerId!==event.pointerId)return;if(d.moved&&Number.isFinite(d.currentX))saveResidentPosition(d.home,d.key,d.currentX,d.currentY);d.piece.classList.remove('moving');residentDrag=null}
housingArea.addEventListener('pointerup',endResidentDrag);housingArea.addEventListener('pointercancel',endResidentDrag);
housingArea.addEventListener('keydown',event=>{const piece=event.target.closest('[data-resident-key]');if(!piece||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const home=state.homes.find(h=>h.id===Number(piece.dataset.homeId)),room=piece.closest('.room-scene');if(!home||!room)return;const p=positionInParent(piece,room),x=clampPosition(p.x+(event.key==='ArrowRight'?2:event.key==='ArrowLeft'?-2:0),p.width),y=clampPosition(p.y+(event.key==='ArrowDown'?2:event.key==='ArrowUp'?-2:0),p.height);piece.style.left=x+'%';piece.style.top=y+'%';piece.style.bottom='auto';saveResidentPosition(home,piece.dataset.residentKey,x,y);event.preventDefault()});

// オフィスでも購入済み家具を選び、位置を自由に調整できる。
function officeFurniturePosition(slot){const p=state.officeFurniturePositions?.[slot];return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?p:{x:FURNITURE_DEFAULTS[slot][0],y:FURNITURE_DEFAULTS[slot][1]}}
function renderOfficeFurniture(){
 $('#office-furniture').innerHTML=state.officeFurniture.slice(0,6).map((n,i)=>{if(!n||!FURNITURE[n])return '';const p=officeFurniturePosition(i);return `<button class="room-furniture office-furniture-piece" data-office-furniture-slot="${i}" style="left:${p.x}%;top:${p.y}%;width:${FURNITURE[n].width}%;z-index:${furnitureLayer(state.officeFurnitureLayers,i)-1}" aria-label="${FURNITURE[n].name} ${i+1}、ドラッグまたは矢印キーで移動">${furnitureArt(FURNITURE[n])}</button>`}).join('');
}
function showOfficeFurnitureSettings(){
 showModal(`<h3>オフィスの家具を設定</h3><p>家具を選んで動かせます。重なりは奥・中・手前から選べます。</p><div class="office-furniture-slots">${Array.from({length:6},(_,i)=>{const item=FURNITURE[state.officeFurniture[i]||0];return `<div class="furniture-slot"><button data-office-slot="${i}">${furnitureArt(item)}<small>${i+1}：${item.name}</small></button>${layerControl('data-office-layer-slot',i,furnitureLayer(state.officeFurnitureLayers,i))}</div>`}).join('')}</div><button id="office-furniture-done" class="primary-button">おわり</button>`);
 document.querySelectorAll('[data-office-slot]').forEach(button=>button.addEventListener('click',()=>{const slot=Number(button.dataset.officeSlot);showFurniturePicker(state.officeFurniture[slot],choice=>{state.officeFurniture[slot]=choice;renderOfficeFurniture()},showOfficeFurnitureSettings)}));
 document.querySelectorAll('[data-office-layer-slot]').forEach(control=>control.addEventListener('change',()=>{const slot=Number(control.dataset.officeLayerSlot),layer=Number(control.value);if(!Number.isInteger(slot)||slot<0||slot>=6||!Number.isInteger(layer)||layer<1||layer>3)return;state.officeFurnitureLayers??=[];state.officeFurnitureLayers[slot]=layer;save();renderOfficeFurniture()}));
 $('#office-furniture-done').onclick=closeModal;
}
$('#office-furniture-open').onclick=showOfficeFurnitureSettings;renderOfficeFurniture();
let officeFurnitureDrag=null;
function saveOfficeFurniturePosition(slot,x,y){state.officeFurniturePositions??=[];state.officeFurniturePositions[slot]={x,y};save()}
officeArea.addEventListener('pointerdown',event=>{const piece=event.target.closest('[data-office-furniture-slot]');if(!piece||event.button!==0)return;const slot=Number(piece.dataset.officeFurnitureSlot),p=officeFurniturePosition(slot),rect=officeArea.getBoundingClientRect(),pr=piece.getBoundingClientRect();officeFurnitureDrag={piece,slot,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:p.x,y:p.y,rect,halfX:pr.width/rect.width*50,halfY:pr.height/rect.height*50};piece.setPointerCapture(event.pointerId);piece.classList.add('moving');event.preventDefault()});
officeArea.addEventListener('pointermove',event=>{const d=officeFurnitureDrag;if(!d||d.pointerId!==event.pointerId)return;const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));d.currentX=clamp(d.x+(event.clientX-d.startX)/d.rect.width*100,d.halfX,100-d.halfX);d.currentY=clamp(d.y+(event.clientY-d.startY)/d.rect.height*100,d.halfY,100-d.halfY);d.piece.style.left=d.currentX+'%';d.piece.style.top=d.currentY+'%';event.preventDefault()});
function endOfficeFurnitureDrag(event){const d=officeFurnitureDrag;if(!d||d.pointerId!==event.pointerId)return;if(Number.isFinite(d.currentX))saveOfficeFurniturePosition(d.slot,d.currentX,d.currentY);d.piece.classList.remove('moving');officeFurnitureDrag=null}
officeArea.addEventListener('pointerup',endOfficeFurnitureDrag);officeArea.addEventListener('pointercancel',endOfficeFurnitureDrag);
officeArea.addEventListener('keydown',event=>{const piece=event.target.closest('[data-office-furniture-slot]');if(!piece||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const slot=Number(piece.dataset.officeFurnitureSlot),p=officeFurniturePosition(slot),rect=officeArea.getBoundingClientRect(),pr=piece.getBoundingClientRect(),halfX=pr.width/rect.width*50,halfY=pr.height/rect.height*50,x=Math.max(halfX,Math.min(100-halfX,p.x+(event.key==='ArrowRight'?2:event.key==='ArrowLeft'?-2:0))),y=Math.max(halfY,Math.min(100-halfY,p.y+(event.key==='ArrowDown'?2:event.key==='ArrowUp'?-2:0)));piece.style.left=x+'%';piece.style.top=y+'%';saveOfficeFurniturePosition(slot,x,y);event.preventDefault()});
