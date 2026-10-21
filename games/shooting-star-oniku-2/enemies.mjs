// hp / movement speed / reward. Formations trade durability for numbers.
export const SPECIES={
  turnip:[1,65,2],bird:[.55,118,2],spider:[4,48,5],bear:[80,0,30],
  hermit_crab:[10,30,10],ghost:[3,48,5],flame:[2,142,5],bomb:[2,78,5],
  punk_pig:[12,44,10],bull:[7,68,10],suit_boss:[220,0,100]
};
export function phaseFor(e){if(!e.large)return 1;const ratio=e.hp/e.maxHp;return e.isBoss?(ratio<=1/3?3:ratio<=2/3?2:1):(ratio<=.5?2:1);}
export function bossMotion(e,ahead=0){const frequency=e.isBoss?([.8,1,1.2][e.phase-1]||.8):(e.phase===2?1.15:.8);const amplitude=e.isBoss?130:e.phase===2?100:75;return e.baseX+Math.sin((e.age+ahead)*frequency)*amplitude;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function moveEnemy(e,dt,player){
  const realDt=dt;dt*=e.difficulty||1;
  if(e.large){e.y=Math.min(138,e.y+75*dt);e.x+=clamp(bossMotion(e)-e.x,-195*dt,195*dt);return;}
  if(e.formation){e.y+=e.speed*dt;e.x=e.baseX+Math.sin(e.age*(e.type==='bird'?1.3:.85)+e.formation.seed)*(e.type==='bird'?40:17);return;}
  switch(e.type){
    case 'turnip':e.y+=e.speed*dt;e.x=e.baseX+Math.sin(e.age*.85)*17;break;
    case 'bird':e.y+=e.speed*dt;e.x=e.baseX+Math.sin(e.age*1.3)*55;break;
    case 'spider':e.y=e.age<6?Math.min(e.anchorY,e.y+80*dt):e.y+e.speed*dt;e.x=e.baseX;break;
    case 'hermit_crab':e.y+=e.speed*dt;e.x=e.baseX+Math.sin(e.age*.7)*45;break;
    case 'ghost':e.y+=e.speed*dt;e.x=clamp(e.baseX+Math.sin(e.age*1.25)*95,30,482);break;
    case 'flame':e.y+=e.speed*dt;e.x=clamp(e.baseX+Math.sin(e.age*4)*55,25,487);break;
    case 'bomb':e.y=Math.min(170,e.y+e.speed*dt);e.x=e.baseX+Math.sin(e.age*2)*8;e.charging=e.age>e.fuse-.8;break;
    case 'punk_pig':e.y=e.age<8?Math.min(180,e.y+70*dt):e.y+55*dt;e.x=clamp(e.baseX+Math.sin(e.age*1.8)*100,30,482);break;
    case 'bull':
      if(e.chargeState==='enter'){e.y+=e.speed*dt;if(e.y>=135){e.chargeState='warn';e.warn=.9;const angle=Math.atan2(Math.max(150,player.y-e.y),player.x-e.x);e.dashX=Math.cos(angle)*265;e.dashY=Math.sin(angle)*265;}}
      else if(e.chargeState==='warn'){e.warn-=realDt;e.charging=true;if(e.warn<=0){e.chargeState='dash';e.charging=false;}}
      else{e.x+=e.dashX*dt;e.y+=e.dashY*dt;}
      break;
  }
}

export function enemyAttack(g,e){
  e.volley++;
  const aimed=(count=1,spread=0,speed=135,kind='aimed')=>g.shoot(e,spread,count,speed,undefined,kind);
  const fan=(count,spread,speed,base=Math.PI/2,kind='fan')=>g.shoot(e,spread,count,speed,base,kind);
  const ring=(count,speed,offset=0)=>{for(let i=0;i<count;i++)g.bullet(e.x,e.y,offset+i*Math.PI*2/count,speed,'ring');};
  if(e.isBoss){
    if(e.phase===1){e.attackPattern=e.volley%2?'aimed-fan':'sweeping-fan';if(e.volley%2)aimed(3,.23,135);else fan(5,.24,130,Math.PI/2+Math.sin(e.age)*.35);return 1.35;}
    if(e.phase===2){e.attackPattern='rotating-ring';ring(12,110,e.age*.65);if(e.volley%2===0)aimed(3,.18,160);return 1.05;}
    e.attackPattern='lane-curtain';const gap=(e.volley*2)%9;
    for(let i=0;i<11;i++){if(i===gap||i===gap+1)continue;g.bullet(36+i*44,e.y+35,Math.PI/2,145+(i%2)*15,'curtain',4);}
    if(e.volley%2===0){aimed(3,.14,180);aimed(1,0,95,'heavy');}return .95;
  }
  if(e.large){
    if(e.type==='bear'){
      if(e.phase===1){e.attackPattern='aimed-fan';aimed(3,.28,125);return 1.8;}
      e.attackPattern=e.volley%2?'radial':'aimed-burst';if(e.volley%2)ring(10,125,e.age*.3);else{aimed(5,.18,170);aimed(1,0,90,'heavy');}return 1.05;
    }
    if(e.phase===1){e.attackPattern='sweeping-fan';fan(5,.27,115,Math.PI/2+Math.sin(e.age*.7)*.5);return 1.7;}
    e.attackPattern='rotating-ring';ring(12,115,e.age*.7);if(e.volley%2===0){aimed(3,.22,160);aimed(1,0,85,'heavy');}return 1.15;
  }
  switch(e.type){
    case 'turnip':e.attackPattern='single';if(!e.formation||e.formation.slot%2===0)aimed(1,0,110);return 3.6;
    case 'bird':e.attackPattern='flyby';if(!e.formation||e.formation.slot===2)fan(2,.3,140);return 3.8;
    case 'spider':e.attackPattern='sniper';aimed(2,.085,200);return 1.9;
    case 'hermit_crab':e.attackPattern='wide-fan';aimed(3,.35,115);if(e.volley%2===0)aimed(1,0,85,'heavy');return 2.3;
    case 'ghost':e.attackPattern='slow-ring';ring(6,90,e.age*.4);return 3;
    case 'flame':e.attackPattern='fast-shot';aimed(1,0,170);return 1.9;
    case 'bomb':return 1000; // Fuse, not the normal shooting timer, triggers this enemy.
    case 'punk_pig':e.attackPattern='strafe-fan';aimed(e.volley%2?3:5,.23,135);if(e.volley%3===0)aimed(1,0,100,'heavy');return 1.8;
    case 'bull':e.attackPattern='charge';return 1000;
  }
  return 3;
}
