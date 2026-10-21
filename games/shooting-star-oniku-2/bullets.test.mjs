import test from 'node:test';
import assert from 'node:assert/strict';
import {bulletStats,BULLET_STYLES,drawEnemyBullet} from './bullets.mjs';
import {Game} from './model.mjs';
import {enemyAttack} from './enemies.mjs';

test('normal, fast and heavy bullets have distinct colors, shapes and honest hitboxes',()=>{
  assert.equal(new Set(Object.values(BULLET_STYLES).map(s=>s.color)).size,3);
  assert.equal(new Set(Object.values(BULLET_STYLES).map(s=>s.shape)).size,3);
  assert.deepEqual(bulletStats('ring',90),{danger:1,damage:1,r:5});
  assert.deepEqual(bulletStats('aimed',200),{danger:2,damage:1,r:4});
  assert.deepEqual(bulletStats('heavy',85),{danger:3,damage:2,r:8});
  const calls=[],ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},arc(){calls.push('circle');},moveTo(){calls.push('vertex');},lineTo(){},closePath(){},fill(){},stroke(){}};
  for(const danger of [1,2,3])drawEnemyBullet(ctx,{x:0,y:0,vx:0,vy:100,r:BULLET_STYLES[danger].radius,danger});
  assert(calls.includes('circle'));assert(calls.includes('vertex'));
});

test('heavy hits cost two HP, while shields block either strength with one charge',()=>{
  for(const [kind,speed,loss] of [['aimed',110,1],['aimed',200,1],['heavy',85,2]]){
    const g=new Game();g.player.inv=0;g.player.fire=100;g.spawnIn=100;g.bullet(g.player.x,g.player.y,0,speed,kind);g.step(.001);
    assert.equal(g.player.hp,3-loss);assert.equal(g.bullets.length,0);assert(g.player.inv>1);
    const shielded=new Game({gear:{shield:2,damage:1,speed:1,follower:0}});shielded.player.inv=0;
    shielded.bullet(shielded.player.x,shielded.player.y,0,speed,kind);shielded.step(.001);
    assert.equal(shielded.player.hp,3);assert.equal(shielded.gear.shield,1);
  }
  const g=new Game();g.player.hp=1;g.player.inv=0;g.damage(2);assert.equal(g.player.hp,0);assert.equal(g.status,'over');
});

test('danger is mixed into real enemy attacks: snipers are fast, heavy shots are sparse and slow',()=>{
  const g=new Game(),spider=g.spawn('spider');enemyAttack(g,spider);assert(g.bullets.every(b=>b.danger===2));
  for(const [type,strong,phase,volley] of [['hermit_crab',false,1,1],['punk_pig',false,1,2],['bear',false,2,1],['hermit_crab',true,2,1],['suit_boss',false,3,1]]){
    const e=g.spawn(type,256,strong);e.phase=phase;e.volley=volley;g.bullets=[];enemyAttack(g,e);
    const heavy=g.bullets.filter(b=>b.danger===3);assert.equal(heavy.length,1);assert(heavy.every(b=>Math.hypot(b.vx,b.vy)<=100));
    assert(g.bullets.some(b=>b.danger!==3));
  }
});
