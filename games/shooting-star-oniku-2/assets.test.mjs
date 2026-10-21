import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ITEMS} from './model.mjs';
const path=p=>new URL(`assets/${p}`,import.meta.url);
test('every manifest image and selected player/shot/item is present and valid PNG',()=>{
  const manifest=JSON.parse(fs.readFileSync(path('asset_manifest.json'),'utf8'));
  const files=[...manifest.enemies.map(e=>e.path),...manifest.backgrounds.map(b=>b.path),'player/oniku_3.png','player/neko_2.png','player/Kani.png','shot/shitake.png','shot/tama2.png','shop/shopkeeper.png',...ITEMS.map(i=>`shop/items/${i.image}`)];
  for(const file of files){const bytes=fs.readFileSync(path(file));assert.equal(bytes.subarray(1,4).toString(),'PNG',file);assert(bytes.length>100,file);}
});
test('all supplied music and sound effect assignments exist locally',()=>{
  for(const file of ['lobby.mp3','forest.mp3','coast.mp3','city.mp3','boss.mp3','confirm.mp3','buy.mp3','coin.aac','death.aac','clear.mp3','welcome.wav','boss-warning.mp3'])assert(fs.statSync(path(`audio/${file}`)).size>1000,file);
});
