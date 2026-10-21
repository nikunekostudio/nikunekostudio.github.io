import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ITEMS,loadWallet,purchase,equipment,areaAt,backgroundProgress,normalized,circles,W,H} from './model.mjs';
import {bossMotion} from './enemies.mjs';
const newGame=opts=>new Game({random:()=>.5,...opts});
const run=(g,seconds,input={})=>{for(let i=0;i<seconds*60&&g.status==='playing';i++)g.step(1/60,input);};

test('wallet validates corrupt data and works without storage',()=>{
  assert.equal(loadWallet({getItem(){throw Error();}}).coins,100);
  assert.equal(loadWallet({getItem(){return '{invalid';}}).coins,100);
  const wallet=loadWallet({getItem:()=>JSON.stringify({coins:-42,pending:{coffee:'yes',tuna:true}})});
  assert.equal(wallet.coins,100);assert.equal(wallet.pending.coffee,0);assert.equal(wallet.pending.tuna,1);
});
test('starter money is granted once, including migration of an existing wallet',()=>{
  const initial=loadWallet();assert.equal(initial.coins,100);assert(initial.starterGranted);
  purchase(initial,'coffee');
  const restored=loadWallet({getItem:()=>JSON.stringify(initial)});assert.equal(restored.coins,0);
  const migrated=loadWallet({getItem:()=>JSON.stringify({coins:10,pending:{tuna:true}})});assert.equal(migrated.coins,110);assert(migrated.pending.tuna);
  assert.equal(loadWallet({getItem:()=>JSON.stringify(migrated)}).coins,110);
  const olderTab={getItem:key=>key==='oniku-shooter-starter-v1'?'granted':JSON.stringify({coins:130})};
  assert.equal(loadWallet(olderTab).coins,130);
});
test('purchase is atomic and cannot overdraw wallet',()=>{
  const wallet={coins:80,pending:{}};let saved=0;
  assert(purchase(wallet,'shiitake',()=>saved++));assert.equal(wallet.coins,0);assert.equal(saved,1);
  assert.equal(purchase(wallet,'shiitake'),false);assert.equal(purchase(wallet,'coffee'),false);assert.equal(purchase(wallet,'bogus'),false);assert.equal(wallet.coins,0);
});
test('purchased gear persists until launch and is consumed exactly once',()=>{
  const wallet={coins:1000,pending:{}};for(const item of ITEMS)purchase(wallet,item.id);
  const restored=loadWallet({getItem:()=>JSON.stringify(wallet)}),gear=equipment(restored);
  assert.deepEqual(gear,{shield:1,damage:1.25,speed:1.2,follower:1,bombs:1});assert.deepEqual(restored.pending,{});
  assert.deepEqual(equipment(restored),{shield:0,damage:1,speed:1,follower:0,bombs:0});
});
test('diagonal speed is normalized and player is clamped to screen',()=>{
  assert(Math.abs(Math.hypot(...Object.values(normalized(1,1)))-1)<1e-9);
  const a=newGame(),b=newGame();run(a,.1,{x:1});run(b,.1,{x:1,y:1});
  assert(Math.abs((a.player.x-W/2)-Math.hypot(b.player.x-W/2,b.player.y-(H-105)))<1e-8);
  run(a,10,{x:1,y:-1});assert(a.player.x<=W-25);assert(a.player.y>=45);
});
test('speed item changes movement by 20 percent and pointer movement is bounded',()=>{
  const a=newGame(),b=newGame({gear:{shield:0,damage:1,speed:1.2,follower:false}});run(a,.1,{x:1});run(b,.1,{x:1});
  assert(Math.abs((b.player.x-W/2)/(a.player.x-W/2)-1.2)<1e-8);
  const x=a.player.x;a.step(1/60,{target:{x:5000,y:5000}});assert(a.player.x-x<10);
});
test('coffee negates one damage and grants invulnerability without losing HP',()=>{
  const g=newGame({gear:{shield:1,damage:1,speed:1,follower:false}});g.player.inv=0;
  assert(g.damage());assert.equal(g.player.hp,3);assert.equal(g.gear.shield,0);assert.equal(g.damage(),false);
  g.player.inv=0;g.damage();assert.equal(g.player.hp,2);
});
test('death ends the run and freezes future simulation',()=>{
  const g=newGame();for(let i=0;i<3;i++){g.player.inv=0;g.damage();}assert.equal(g.status,'over');const t=g.time;g.step(.05);assert.equal(g.time,t);
});
test('collision uses small circular hitboxes, not transparent sprite rectangles',()=>{
  const g=newGame();assert.equal(g.player.r,9);assert(!circles(g.player,{x:g.player.x+35,y:g.player.y,r:5}));assert(circles(g.player,{x:g.player.x+8,y:g.player.y,r:5}));
  const bird=g.spawn('bird');assert(bird.r<bird.size/2);
});
test('enemy reward is awarded once and escaping enemies award nothing',()=>{
  let coins=0;const g=newGame({reward:n=>coins+=n}),e=g.spawn('turnip');assert(g.kill(e));assert(!g.kill(e));assert.equal(coins,2);assert.equal(g.kills,1);
  const escaped=g.spawn('bird');escaped.y=H+100;g.step(.01);assert.equal(coins,2);assert(!g.enemies.includes(escaped));
});
test('a shot damages one target and two shots killing the same enemy cannot duplicate rewards',()=>{
  let coins=0;const g=newGame({reward:n=>coins+=n}),e=g.spawn('turnip',200);e.y=100;e.hp=.5;e.speed=0;e.fire=100;
  g.shots=[{x:200,y:100,vx:0,vy:0,r:6,damage:1},{x:200,y:100,vx:0,vy:0,r:6,damage:1}];g.step(.01);
  assert.equal(coins,2);assert.equal(g.kills,1);
});
test('flash is once per run and clears bullets while damaging enemies',()=>{
  const g=newGame({gear:{shield:0,damage:1,speed:1,follower:false,bombs:1}}),e=g.spawn('bear');e.y=100;g.bullets.push({x:1,y:1});assert(g.bomb());assert.equal(g.bullets.length,0);assert.equal(e.hp,e.maxHp-35);assert(!g.bomb());
});
test('player damage upgrade does not multiply companion shots and companion targets enemies only',()=>{
  const g=newGame({gear:{shield:0,damage:1.25,speed:1,follower:true}});g.step(.01);assert(!g.shots.some(b=>b.friendly));
  g.spawn('turnip').y=100;g.step(.01);const shot=g.shots.find(b=>b.friendly);assert(shot);assert.equal(shot.damage,.8);assert(Math.abs(g.shots.find(b=>!b.friendly).damage-.6875)<1e-8);
});
test('areas pan once, change continuously, and city stops scrolling for boss',()=>{
  assert.equal(areaAt(69.9),0);assert.equal(areaAt(70),1);assert.equal(areaAt(140),2);assert.equal(areaAt(270),2);
  assert.equal(backgroundProgress(0),0);assert.equal(backgroundProgress(35),.5);assert.equal(backgroundProgress(70),0);assert.equal(backgroundProgress(210),1);assert.equal(backgroundProgress(270),1);
});
test('full uninterrupted timeline spawns both minibosses and one boss, then times out',()=>{
  const g=newGame();g.player.inv=1000;const seen=new Set();for(let i=0;i<271*60&&g.status==='playing';i++){g.step(1/60);for(const e of g.enemies)seen.add(e.type);}
  assert(g.midboss&&g.coastStrong&&g.bossSpawned);assert(seen.has('bear'));assert(seen.has('suit_boss'));assert.equal(g.status,'over');assert(g.timeout);assert(g.time<270.1);
});
test('boss defeat clears the game and rewards it once',()=>{
  let coins=0;const g=newGame({reward:n=>coins+=n});g.time=210;g.player.inv=1000;g.step(.01);const boss=g.boss;assert(boss);g.kill(boss);assert.equal(g.status,'clear');assert.equal(coins,100);assert(!g.kill(boss));assert.equal(coins,100);
});
test('unupgraded auto shots can defeat the moving boss within the final minute',()=>{
  const g=newGame();g.time=210;g.player.inv=1000;g.step(.01);
  for(let i=0;i<60*60&&g.status==='playing';i++){
    // Aim ahead of the boss with ordinary keyboard-speed movement, no damage cheat.
    const boss=g.boss,lead=bossMotion(boss,.75);
    g.step(1/60,{x:Math.sign(lead-g.player.x)});
  }
  assert.equal(g.status,'clear');assert(g.time<270);
});
