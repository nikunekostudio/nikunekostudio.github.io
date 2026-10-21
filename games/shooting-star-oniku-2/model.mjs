export const W = 512, H = 768;
export const TITLE = 'シューティングスターおにく２';
export const ITEMS = [
  {id:'coffee',name:'コーヒー',price:100,max:5,description:'1個ごとに被弾を1回無効化。',image:'coffee.png'},
  {id:'shiitake',name:'しいたけ',price:80,max:5,description:'1段階ごとにショット威力＋25%。',image:'shiitake.png'},
  {id:'tuna',name:'まぐろ',price:120,max:2,description:'1個目で猫、2個目でかにが加わって援護射撃。',image:'tuna.png'},
  {id:'melon_bread',name:'メロンパン',price:60,max:5,description:'1段階ごとに移動速度＋20%。',image:'melon_bread.png'},
  {id:'bomb',name:'爆弾',price:100,max:5,description:'1個ごとにボム＋1回。敵弾を消し、敵へ35ダメージ。',image:'bomb.png'}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function itemCount(id,value){const max=ITEMS.find(i=>i.id===id)?.max||0;return clamp(value===true?1:typeof value==='number'&&Number.isFinite(value)?Math.floor(value):0,0,max);}
export function itemEffect(id,count){const n=itemCount(id,count);return {coffee:`ガード ${n}回`,shiitake:`威力 ${100+n*25}%`,tuna:['仲間 0人','猫 1人','猫＋かに 2人'][n],melon_bread:`速度 ${100+n*20}%`,bomb:`ボム ${n}回`}[id]||'';}
export function loadWallet(storage) {
  let value;try {value=JSON.parse(storage?.getItem('oniku-shooter-v1')||'null');}catch{}
  let grantRecorded=false;try{grantRecorded=storage?.getItem('oniku-shooter-starter-v1')==='granted';}catch{}
  const starter=value?.starterGranted===true||grantRecorded?0:100;
  const companionRefund=value?.pending?.tuna===3?120:0;
  return {coins:clamp(clamp(Math.floor(Number(value?.coins)||0),0,9999999)+starter+companionRefund,0,9999999),starterGranted:true,best:Math.max(clamp(Math.floor(Number(value?.best)||0),0,999999999),clamp(Math.floor(Number(value?.bestExtra)||0),0,999999999)),pending:Object.fromEntries(ITEMS.map(i=>[i.id,itemCount(i.id,value?.pending?.[i.id])]))};
}
export function purchase(wallet,id,save=()=>{}) {
  const item=ITEMS.find(i=>i.id===id);
  if(!item||itemCount(id,wallet.pending[id])>=item.max||wallet.coins<item.price)return false;
  wallet.coins-=item.price;wallet.pending[id]=itemCount(id,wallet.pending[id])+1;save();return true;
}
export function equipment(wallet,save=()=>{}) {
  const owned={...wallet.pending};wallet.pending={};save();
  return {shield:itemCount('coffee',owned.coffee),damage:1+.25*itemCount('shiitake',owned.shiitake),speed:1+.2*itemCount('melon_bread',owned.melon_bread),follower:itemCount('tuna',owned.tuna),bombs:itemCount('bomb',owned.bomb)};
}
export function areaAt(time){return Math.min(2,Math.floor(time/70));}
export function backgroundProgress(time){const area=areaAt(time);return clamp((time-area*70)/70,0,1);}
export function normalized(x,y){const len=Math.hypot(x,y);return len>1?{x:x/len,y:y/len}:{x,y};}
export function circles(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r;}
export class Game {
  constructor({mode='normal',gear={shield:0,damage:1,speed:1,follower:false},random=Math.random,reward=()=>{},sound=()=>{}}={}){
    this.mode=mode==='extra'?'extra':'normal';this.loop=0;this.totalTime=0;this.pendingLoop=false;
    this.gear={...gear};this.random=random;this.reward=reward;this.sound=sound;this.time=0;this.score=0;this.earned=0;this.kills=0;this.status='playing';
    this.player={x:W/2,y:H-105,r:9,hp:3,inv:2,fire:0};
    this.followers=Array.from({length:itemCount('tuna',this.gear.follower)},(_,i)=>({kind:i===0?'cat':'crab',x:W/2+[-48,48][i],y:H-75,fire:i*.1}));
    this.enemies=[];this.shots=[];this.bullets=[];this.particles=[];this.spawnIn=1.5;this.wave=0;this.formationId=0;this.midboss=false;this.coastStrong=false;this.bossSpawned=false;this.flash=0;this.bombs=itemCount('bomb',this.gear.bombs);this.boss=null;
  }
  get difficulty(){return this.mode==='extra'?1.3**this.loop:1;}
  nextLoop(){
    if(this.mode!=='extra'||!this.pendingLoop||this.status!=='playing')return false;
    this.loop++;this.time=0;this.pendingLoop=false;this.spawnIn=1.5;this.wave=0;this.midboss=false;this.coastStrong=false;this.bossSpawned=false;this.boss=null;
    this.enemies=[];this.shots=[];this.bullets=[];this.particles=[];this.flash=.45;this.player.inv=Math.max(this.player.inv,2.5);
    return true;
  }
  spawn(type,x=W*(.15+this.random()*.7),strong=false){
    const [hp,speed,value]=SPECIES[type];const isBoss=type==='suit_boss',large=type==='bear'||strong||isBoss;
    const e={type,x,y:-70,baseX:x,r:isBoss?45:large?33:['turnip','bird'].includes(type)?14:18,size:isBoss?148:large?104:['turnip','bird'].includes(type)?50:62,hp:hp*(strong?5:1),maxHp:hp*(strong?5:1),speed,value:strong?30:value,age:0,fire:1.2+this.random()*1.2,hit:0,large,isBoss,dead:false,phase:1,phaseWarning:0,volley:0,anchorY:100+this.random()*80,fuse:3.8+this.random()*.6,charging:false,chargeState:'enter'};
    e.difficulty=this.difficulty;e.hp*=this.difficulty;e.maxHp=e.hp;e.fire/=this.difficulty;
    this.enemies.push(e);if(isBoss)this.boss=e;if(large)this.sound('boss');return e;
  }
  formation(type,shape=this.wave%2?'v':'line'){
    const count=5,center=125+this.random()*(W-250),id=++this.formationId,seed=this.random()*Math.PI*2;
    for(let i=0;i<count;i++){const e=this.spawn(type,center+(i-2)*42);e.y=-50-(shape==='v'?Math.abs(i-2)*32:i*22);e.formation={id,slot:i,shape,seed};e.fire=2.5/this.difficulty;}
  }
  kill(e){if(e.dead)return false;e.dead=true;this.score+=e.value*100;this.earned+=e.value;this.kills++;this.reward(e.value);this.burst(e.x,e.y,e.isBoss?60:16,'#ffe798');this.sound(e.isBoss&&this.mode!=='extra'?'finalDefeat':e.large?'bossDefeat':'destroy');if(e.isBoss){if(this.mode==='extra')this.pendingLoop=true;else this.status='clear';this.bullets=[];}return true;}
  burst(x,y,n,color){for(let i=0;i<n;i++){const a=this.random()*Math.PI*2,s=25+this.random()*120;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+this.random()*.5,color});}}
  damage(amount=1){const p=this.player;if(p.inv>0||this.status!=='playing')return false;p.inv=1.8;if(this.gear.shield){this.gear.shield--;this.burst(p.x,p.y,22,'#76f6ec');this.sound('shield');}else{p.hp=Math.max(0,p.hp-amount);this.flash=.25;this.burst(p.x,p.y,24,'#ff7a9b');this.sound('hurt');if(p.hp<=0)this.status='over';}return true;}
  bomb(){if(this.status!=='playing'||!this.bombs)return false;this.bombs--;this.player.inv=Math.max(this.player.inv,1.8);this.bullets=[];this.flash=.5;this.sound('bomb');for(const e of this.enemies){if(e.dead||e.y<-e.size/2||e.y>H+e.size/2)continue;e.hp-=35;e.hit=.2;if(e.hp<=0)this.kill(e);}this.burst(this.player.x,this.player.y,60,'#c1a5ff');return true;}
  bullet(x,y,angle,speed,kind='aimed',r=5){speed*=this.difficulty;this.bullets.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,kind,...bulletStats(kind,speed,r)});}
  shoot(e,spread=0,count=1,speed=135,direction,kind='aimed'){const base=direction??Math.atan2(this.player.y-e.y,this.player.x-e.x);for(let i=0;i<count;i++)this.bullet(e.x,e.y+12,base+(i-(count-1)/2)*spread,speed,kind);}
  step(dt,input={x:0,y:0}){
    if(this.status!=='playing')return;if(this.pendingLoop){this.nextLoop();return;}dt=clamp(dt,0,.05);this.time+=dt;this.totalTime+=dt;this.flash=Math.max(0,this.flash-dt);const p=this.player;p.inv=Math.max(0,p.inv-dt);p.fire-=dt;
    const direction=normalized(input.x||0,input.y||0),speed=260*this.gear.speed;
    if(input.target){const dx=input.target.x-p.x,dy=input.target.y-p.y,len=Math.hypot(dx,dy),m=Math.min(len,speed*dt*1.7);if(len){p.x+=dx/len*m;p.y+=dy/len*m;}}
    else {p.x+=direction.x*speed*dt;p.y+=direction.y*speed*dt;}
    p.x=clamp(p.x,25,W-25);p.y=clamp(p.y,45,H-30);
    if(p.fire<=0){p.fire+=.17;for(const side of [-1,1])this.shots.push({x:p.x+side*10,y:p.y-18,vx:side*6,vy:-680,r:6,damage:.55*this.gear.damage,friendly:false});this.sound('shot');}
    for(const [index,f] of this.followers.entries()){
      const offsetX=[-48,48][index],offsetY=30;
      f.x+=(clamp(p.x+offsetX,18,W-18)-f.x)*Math.min(1,dt*6);f.y+=(clamp(p.y+offsetY,30,H-18)-f.y)*Math.min(1,dt*6);f.fire-=dt;
      if(f.fire<=0){const closest=this.enemies.filter(e=>!e.dead&&e.y>0).sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y))[0];if(closest){const a=Math.atan2(closest.y-f.y,closest.x-f.x);this.shots.push({x:f.x,y:f.y,vx:Math.cos(a)*510,vy:Math.sin(a)*510,r:5,damage:.8,friendly:true});f.fire=.38;}}
    }
    if(this.time<210){this.spawnIn-=dt;if(this.spawnIn<=0){const area=areaAt(this.time),pools=[['turnip','bird','spider'],['hermit_crab','bird','ghost'],['flame','bomb','punk_pig','bull']],type=pools[area][this.wave%pools[area].length];if(type==='turnip'||type==='bird')this.formation(type);else this.spawn(type);this.wave++;this.spawnIn=['turnip','bird'].includes(type)?4.2:area===0?3.2:2.8;}}
    if(this.time>=46&&!this.midboss){this.midboss=true;this.spawn('bear',W/2);}
    if(this.time>=118&&!this.coastStrong){this.coastStrong=true;this.spawn('hermit_crab',W/2,true);}
    if(this.time>=210&&!this.bossSpawned){this.bossSpawned=true;this.enemies.forEach(e=>e.dead=true);this.bullets=[];this.spawn('suit_boss',W/2);}
    for(const e of this.enemies){if(e.dead)continue;e.age+=dt*(e.difficulty||1);e.hit=Math.max(0,e.hit-dt);e.fire-=dt;
      const phase=phaseFor(e);if(phase>e.phase){e.phase=phase;e.phaseWarning=.85;e.fire=.85;e.volley=0;this.bullets=[];this.burst(e.x,e.y,22,phase===3?'#ff8aaf':'#ffe799');}
      e.phaseWarning=Math.max(0,e.phaseWarning-dt);moveEnemy(e,dt,p);
      if(e.type==='bomb'&&!e.large&&e.age>=e.fuse){for(let i=0;i<10;i++)this.bullet(e.x,e.y,i*Math.PI/5,125,'explosion');this.burst(e.x,e.y,20,'#ffc072');e.dead=true;}
      if(!e.dead&&e.y>30&&e.y<H-100&&e.fire<=0&&e.phaseWarning===0)e.fire=enemyAttack(this,e)/this.difficulty;
      if(e.y>H+90||e.x<-90||e.x>W+90)e.dead=true;
      if(!e.dead&&circles(e,p))this.damage();
    }
    for(const b of this.shots){if(b.dead)continue;b.x+=b.vx*dt;b.y+=b.vy*dt;for(const e of this.enemies){if(e.dead||e.y<-10)continue;if(circles(b,e)){e.hp-=b.damage;e.hit=.07;b.dead=true;this.sound('hit');if(e.hp<=0)this.kill(e);break;}}}
    for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(circles(b,p)){b.dead=true;this.damage(b.damage||1);}}
    for(const part of this.particles){part.x+=part.vx*dt;part.y+=part.vy*dt;part.life-=dt;}
    this.enemies=this.enemies.filter(e=>!e.dead);this.shots=this.shots.filter(b=>!b.dead&&b.y>-50&&b.y<H+30&&b.x>-30&&b.x<W+30);this.bullets=this.bullets.filter(b=>!b.dead&&b.x>-30&&b.x<W+30&&b.y>-30&&b.y<H+30);this.particles=this.particles.filter(p=>p.life>0).slice(-500);
    if(this.mode!=='extra'&&this.time>=270&&this.status==='playing'){this.status='over';this.timeout=true;}
    if(this.pendingLoop)this.nextLoop();
  }
}
import {SPECIES,phaseFor,moveEnemy,enemyAttack} from './enemies.mjs';
import {bulletStats} from './bullets.mjs';
