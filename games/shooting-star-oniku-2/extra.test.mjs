import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,loadWallet,areaAt,backgroundProgress} from './model.mjs';
import {moveEnemy} from './enemies.mjs';
import {gameId,getRanking,submitScore,shareUrl} from './scores.mjs';
const extra=opts=>new Game({mode:'extra',random:()=>.5,...opts});
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function lap(g){const boss=g.spawn('suit_boss');assert(g.kill(boss));g.step(.01);return boss;}

test('extra boss defeat loops safely, retains the run and rewards the same boss only once',()=>{
  const sounds=[],rewards=[],g=extra({gear:{shield:2,damage:1.5,speed:1.4,follower:2,bombs:3},sound:s=>sounds.push(s),reward:n=>rewards.push(n)});
  g.time=235;g.totalTime=235;g.player.hp=2;g.player.inv=0;g.bombs=2;
  const boss=g.spawn('suit_boss');boss.y=130;g.bullets=[{x:1,y:2}];g.shots=[{x:1,y:2}];
  g.midboss=g.coastStrong=g.bossSpawned=true;
  assert(g.kill(boss));assert.equal(g.status,'playing');assert(g.pendingLoop);assert.equal(g.bullets.length,0);
  assert(!g.kill(boss));g.step(.01);
  assert.equal(g.loop,1);assert.equal(g.time,0);assert.equal(g.totalTime,235);assert.equal(g.player.hp,2);assert(g.player.inv>=2.5);
  assert.equal(g.gear.shield,2);assert.equal(g.gear.damage,1.5);assert.equal(g.followers.length,2);assert.equal(g.bombs,2);
  assert.equal(g.score,10000);assert.equal(g.earned,100);assert.deepEqual(rewards,[100]);
  assert(!g.boss&&!g.midboss&&!g.coastStrong&&!g.bossSpawned);assert.equal(g.enemies.length,0);assert.equal(g.shots.length,0);
  assert(sounds.includes('bossDefeat'));assert(!sounds.includes('finalDefeat'));assert(!g.nextLoop());
  assert.equal(areaAt(g.time),0);assert.equal(backgroundProgress(g.time),0);
});

test('each cleared lap compounds HP, movement and bullet speed by exactly 30 percent',()=>{
  const g=extra();
  for(let completed=0;completed<4;completed++){
    const scale=1.3**completed;close(g.difficulty,scale);
    const bear=g.spawn('bear');close(bear.hp,80*scale);close(bear.maxHp,bear.hp);
    const bird=g.spawn('bird',256);bird.y=0;moveEnemy(bird,.1,g.player);close(bird.y,118*.1*scale);
    g.bullets=[];g.bullet(0,0,0,110);close(g.bullets[0].vx,110*scale);
    lap(g);
  }
  close(g.difficulty,1.3**4);
});

test('multiple full timelines restart forest, minibosses and final boss without a clear screen',()=>{
  const g=extra();g.player.inv=10000;
  for(let cycle=0;cycle<3;cycle++){
    const areas=new Set();let sawBear=false,sawCrab=false;
    while(g.time<212){g.step(1/60);areas.add(areaAt(g.time));sawBear ||= g.midboss;sawCrab ||= g.coastStrong;}
    assert.deepEqual([...areas],[0,1,2]);assert(sawBear&&sawCrab&&g.bossSpawned);assert(g.boss&&!g.boss.dead);
    g.kill(g.boss);g.step(.01);assert.equal(g.loop,cycle+1);assert.equal(g.time,0);assert.equal(g.status,'playing');
  }
  assert(g.totalTime>=635.99);assert.equal(g.loop,3);
});

test('extra has no boss timeout; ordinary mode keeps its clear and timeout rules',()=>{
  const g=extra();g.player.inv=10000;g.time=270;g.step(.01);assert.equal(g.status,'playing');assert(!g.timeout);
  const normal=new Game();const boss=normal.spawn('suit_boss');normal.kill(boss);assert.equal(normal.status,'clear');assert.equal(normal.loop,0);
});

test('a bomb that defeats the final boss advances exactly one lap on the next tick',()=>{
  const g=extra({gear:{shield:0,damage:1,speed:1,follower:0,bombs:2}}),boss=g.spawn('suit_boss');boss.y=130;boss.hp=1;
  assert(g.bomb());assert.equal(g.bombs,1);assert(g.pendingLoop);g.step(.01);assert.equal(g.loop,1);g.step(.01);assert.equal(g.loop,1);
});

test('loop scaling accelerates attacks but does not shorten the bull charge telegraph',()=>{
  const g=extra();lap(g);const bull=g.spawn('bull');bull.chargeState='warn';bull.warn=.9;
  moveEnemy(bull,.1,g.player);close(bull.warn,.8);
  const spider=g.spawn('spider');spider.y=130;spider.fire=0;g.spawnIn=100;g.step(.01);close(spider.fire,1.9/1.3);
});

test('both modes share their best score and ranking while X text retains the mode',async()=>{
  const old=loadWallet({getItem:()=>JSON.stringify({starterGranted:true,best:100})});assert.equal(old.best,100);
  const saved=loadWallet({getItem:()=>JSON.stringify({starterGranted:true,best:100,bestExtra:900})});assert.equal(saved.best,900);assert.equal(saved.bestExtra,undefined);
  assert.equal(loadWallet({getItem:()=>JSON.stringify({starterGranted:true,best:2000,bestExtra:900})}).best,2000);
  assert.equal(loadWallet({getItem:()=>JSON.stringify(saved)}).best,900);
  assert.equal(gameId('extra'),gameId('normal'));
  await getRanking('all',async url=>{assert(url.includes('game=shooting-star-oniku-2&'));return Response.json({entries:[]});},'extra');
  await submitScore({name:'猫',score:12000,playerId:'unit-test',mode:'extra'},async(url,options)=>{assert.equal(JSON.parse(options.body).game,'shooting-star-oniku-2');return Response.json({ok:true,updated:true});});
  const url=new URL(shareUrl({score:12000,time:10,totalTime:500,mode:'extra',loop:2}));assert(url.searchParams.get('text').includes('エクストラ 3周目'));assert(url.searchParams.get('text').includes('8:20'));
});
