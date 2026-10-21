import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,loadWallet,purchase,equipment} from './model.mjs';
test('shop bomb costs 100G, persists before launch, and is consumed on deployment',()=>{
  const wallet=loadWallet();assert.equal(wallet.coins,100);assert(purchase(wallet,'bomb'));assert.equal(wallet.coins,0);assert(!purchase(wallet,'bomb'));
  const restored=loadWallet({getItem:key=>key==='oniku-shooter-v1'?JSON.stringify(wallet):null});assert(restored.pending.bomb);
  const g=new Game({gear:equipment(restored)});assert.equal(g.bombs,1);assert(g.bomb());assert.equal(g.bombs,0);assert(!g.bomb());assert(g.player.inv>=1.8);
  assert.equal(new Game({gear:equipment(restored)}).bombs,0);assert.equal(new Game().bombs,0);
});
test('bomb clears bullets and hits visible enemies, not unentered formations',()=>{
  const g=new Game({gear:{shield:0,damage:1,speed:1,follower:false,bombs:1}}),onscreen=g.spawn('bear'),unseen=g.spawn('turnip');onscreen.y=140;unseen.y=-100;
  g.bullets=[{x:1,y:1}];g.bomb();assert.equal(g.bullets.length,0);assert.equal(onscreen.hp,onscreen.maxHp-35);assert.equal(unseen.hp,unseen.maxHp);
});
