import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ITEMS,itemCount,itemEffect,loadWallet,purchase,equipment,W,H} from './model.mjs';

test('every item allows repeated purchases up to its limit without charging at MAX',()=>{
  for(const item of ITEMS){
    const wallet={coins:10000,pending:{}};let saves=0;
    for(let n=1;n<=item.max;n++){assert(purchase(wallet,item.id,()=>saves++));assert.equal(wallet.pending[item.id],n);}
    const balance=wallet.coins;assert(!purchase(wallet,item.id,()=>saves++));assert.equal(wallet.coins,balance);
    assert.equal(balance,10000-item.max*item.price);assert.equal(saves,item.max);
  }
});

test('numeric counts survive reload, old boolean saves migrate, invalid counts are bounded',()=>{
  const pending={coffee:true,shiitake:3,tuna:999,melon_bread:-3,bomb:'5'};
  const wallet=loadWallet({getItem:()=>JSON.stringify({starterGranted:true,coins:123,pending})});
  assert.deepEqual(wallet.pending,{coffee:1,shiitake:3,tuna:2,melon_bread:0,bomb:0});
  assert.equal(wallet.coins,123);assert.equal(itemCount('bomb',Infinity),0);assert.equal(itemCount('bomb',2.7),2);
  assert.equal(itemEffect('shiitake',5),'威力 225%');assert.equal(itemEffect('melon_bread',5),'速度 200%');
});

test('all upgrade stages apply additively and consume the pending loadout exactly once',()=>{
  for(let n=1;n<=5;n++){
    const wallet={pending:Object.fromEntries(ITEMS.map(i=>[i.id,Math.min(n,i.max)]))};
    const gear=equipment(wallet);
    assert.equal(gear.shield,n);assert.equal(gear.damage,1+.25*n);assert.equal(gear.speed,1+.2*n);
    assert.equal(gear.follower,Math.min(n,2));assert.equal(gear.bombs,n);
    assert.deepEqual(equipment(wallet),{shield:0,damage:1,speed:1,follower:0,bombs:0});
  }
});

test('stacked shields and bombs are consumed one charge at a time',()=>{
  const g=new Game({gear:{shield:5,damage:1,speed:1,follower:0,bombs:5}});
  for(let n=4;n>=0;n--){g.player.inv=0;assert(g.damage());assert.equal(g.player.hp,3);assert.equal(g.gear.shield,n);assert(g.bomb());assert.equal(g.bombs,n);}
  assert(!g.bomb());g.player.inv=0;g.damage();assert.equal(g.player.hp,2);
});

test('cat and crab are the only two companions, follow separately and shoot without inheriting player damage',()=>{
  const g=new Game({gear:{shield:0,damage:2.25,speed:2,follower:3,bombs:0},random:()=>.5});
  assert.equal(g.followers.length,2);assert.deepEqual(g.followers.map(f=>f.kind),['cat','crab']);const enemy=g.spawn('bear',256);enemy.y=100;enemy.hp=10000;enemy.maxHp=10000;enemy.fire=100;
  for(let i=0;i<20;i++)g.step(.01);
  const shots=g.shots.filter(s=>s.friendly);assert.equal(shots.length,2);assert(shots.every(s=>s.damage===.8));
  assert.equal(new Set(g.followers.map(f=>`${f.x},${f.y}`)).size,2);
  for(let i=0;i<100;i++)g.step(.01,{x:-1,y:1});
  assert(g.followers.every(f=>f.x>=18&&f.x<=W-18&&f.y<=H-18));
});

test('guard costs 100G and a third pending companion is refunded once during migration',()=>{
  const wallet=loadWallet();assert(purchase(wallet,'coffee'));assert.equal(wallet.coins,0);assert(!purchase(wallet,'coffee'));
  const old={coins:500,starterGranted:true,pending:{tuna:3}};
  const migrated=loadWallet({getItem:()=>JSON.stringify(old)});assert.equal(migrated.pending.tuna,2);assert.equal(migrated.coins,620);
  const restored=loadWallet({getItem:()=>JSON.stringify(migrated)});assert.equal(restored.coins,620);assert.equal(equipment(restored).follower,2);
  assert.deepEqual(new Game({gear:{follower:1}}).followers.map(f=>f.kind),['cat']);
});
