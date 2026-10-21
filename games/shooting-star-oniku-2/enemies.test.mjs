import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from './model.mjs';
import {phaseFor,moveEnemy,enemyAttack} from './enemies.mjs';
const make=()=>new Game({random:()=>.5});
test('turnip and bird spawn as five low-health coherent formations',()=>{
  for(const type of ['turnip','bird'])for(const shape of ['v','line']){
    const g=make();g.formation(type,shape);assert.equal(g.enemies.length,5);assert.equal(new Set(g.enemies.map(e=>e.formation.id)).size,1);
    assert(g.enemies.every(e=>e.hp<=1));const offsets=g.enemies.map(e=>e.x-g.enemies[0].x);
    for(let i=0;i<60;i++)for(const e of g.enemies){e.age+=1/60;moveEnemy(e,1/60,g.player);}
    for(let i=0;i<5;i++)assert(Math.abs(g.enemies[i].x-g.enemies[0].x-offsets[i])<1e-8);
    assert.equal(g.enemies[2].formation.shape,shape);
  }
});
test('ordinary timeline actually begins with a formation rather than a single enemy',()=>{
  const g=make();g.spawnIn=0;g.step(.01);assert.equal(g.enemies.length,5);assert(g.enemies.every(e=>e.type==='turnip'));
});
test('fast zigzag flame travels faster than armored crab; spider stops to snipe',()=>{
  const g=make(),flame=g.spawn('flame'),crab=g.spawn('hermit_crab'),spider=g.spawn('spider');
  flame.y=crab.y=0;for(const e of [flame,crab,spider]){e.age=3;moveEnemy(e,1,g.player);}
  assert(flame.y>crab.y*3);assert(crab.hp>flame.hp*3);
  spider.y=spider.anchorY;moveEnemy(spider,.5,g.player);assert.equal(spider.y,spider.anchorY);
  spider.age=7;moveEnemy(spider,.5,g.player);assert(spider.y>spider.anchorY);
});
test('bull telegraphs its charge then dashes toward the locked direction',()=>{
  const g=make(),bull=g.spawn('bull');bull.y=134;moveEnemy(bull,.1,g.player);assert.equal(bull.chargeState,'warn');const direction=bull.dashX;
  moveEnemy(bull,.5,g.player);assert(bull.charging);const y=bull.y;
  moveEnemy(bull,.5,{x:0,y:500});assert.equal(bull.chargeState,'dash');moveEnemy(bull,.3,{x:512,y:100});assert(bull.y>y+50);assert.equal(bull.dashX,direction);
});
test('bomb self-destructs in a radial pattern without rewarding the player',()=>{
  const g=make(),bomb=g.spawn('bomb');g.spawnIn=100;bomb.age=bomb.fuse-.01;bomb.y=150;g.step(.02);
  assert(bomb.dead);assert.equal(g.earned,0);assert.equal(g.bullets.filter(b=>b.kind==='explosion').length,10);
  const safe=make(),defused=safe.spawn('bomb');safe.kill(defused);safe.step(.02);assert.equal(safe.earned,5);assert(!safe.bullets.some(b=>b.kind==='explosion'));
});
test('midbosses enrage at half health and change patterns, not only bullet counts',()=>{
  for(const [type,strong] of [['bear',false],['hermit_crab',true]]){
    const g=make(),e=g.spawn(type,256,strong);e.y=130;enemyAttack(g,e);const pattern=e.attackPattern;e.hp=e.maxHp/2;assert.equal(phaseFor(e),2);
    g.spawnIn=100;g.step(.01);assert.equal(e.phase,2);assert(e.phaseWarning>.7);assert.equal(g.bullets.length,0);
    e.phaseWarning=0;g.bullets=[];enemyAttack(g,e);assert.notEqual(e.attackPattern,pattern);assert(g.bullets.some(b=>b.kind==='ring'));
  }
});
test('Kisshida has three health-gated phases with distinct bullet geometry',()=>{
  const g=make(),e=g.spawn('suit_boss');e.y=130;
  assert.equal(phaseFor(e),1);enemyAttack(g,e);assert.equal(e.attackPattern,'aimed-fan');assert(g.bullets.every(b=>b.kind==='aimed'));
  e.hp=e.maxHp*2/3;e.phase=phaseFor(e);e.volley=0;g.bullets=[];enemyAttack(g,e);assert.equal(e.phase,2);assert.equal(e.attackPattern,'rotating-ring');assert(g.bullets.some(b=>b.vy<0));
  e.hp=e.maxHp/3;e.phase=phaseFor(e);e.volley=0;g.bullets=[];enemyAttack(g,e);assert.equal(e.phase,3);assert.equal(e.attackPattern,'lane-curtain');assert(g.bullets.every(b=>b.kind==='curtain'&&Math.abs(b.vx)<1e-8));assert.equal(g.bullets.length,9);
});
test('phase transitions give a warning, clear old bullets and do not jump the boss',()=>{
  const g=make(),e=g.spawn('suit_boss');g.bossSpawned=true;g.time=220;e.y=138;e.age=10;e.hp=e.maxHp*.6;e.x=100;g.bullets=[{x:256,y:300,vx:0,vy:20,r:5}];g.step(.01);
  assert.equal(e.phase,2);assert(e.phaseWarning>.7);assert.equal(g.bullets.length,0);assert(Math.abs(e.x-100)<=1.95+.0001);
});
test('boss entrance alert fires once for each miniboss and final boss, not ordinary enemies or phase changes',()=>{
  const sounds=[],g=new Game({random:()=>.5,sound:s=>sounds.push(s)});g.spawn('turnip');g.spawn('hermit_crab');assert.equal(sounds.filter(s=>s==='boss').length,0);
  g.spawn('bear');g.spawn('hermit_crab',256,true);g.midboss=true;g.coastStrong=true;g.time=210;g.player.inv=1000;g.step(.01);assert.equal(sounds.filter(s=>s==='boss').length,3);
  g.boss.hp=g.boss.maxHp*.6;g.step(.01);g.boss.hp=g.boss.maxHp*.2;g.step(.01);assert.equal(sounds.filter(s=>s==='boss').length,3);
});
