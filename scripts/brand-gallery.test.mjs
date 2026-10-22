import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {games,origin} from './seo-catalog.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const data=html=>JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];

test('former brand is crawlable but not promoted in title, welcome or footer',()=>{
 const html=read('index.html'),body=html.split('<body>')[1];
 assert.ok(!html.match(/<title>(.*?)<\/title>/s)[1].includes('にくねこ企画'));
 assert.ok(!html.match(/class="intro">(.*?)<\/p>/s)[1].includes('にくねこ企画'));
 assert.ok(!html.match(/<footer>(.*?)<\/footer>/s)[1].includes('にくねこ企画'));
 assert.equal((body.match(/にくねこ企画/g)||[]).length,1);
 assert.ok(body.includes('<small>旧名：にくねこ企画</small>'));
 for(const type of ['Organization','WebSite'])assert.ok(data(html).find(n=>n['@type']===type).alternateName.includes('にくねこ企画'));
 assert.ok(html.includes('旧名：にくねこ企画'));
 assert.ok(read('i18n.js').includes("'旧名：にくねこ企画':'Former name: にくねこ企画'"));
});

test('game publishers refer to the same organization and its former brand',()=>{
 for(const game of games.filter(g=>!g.collection)){
  const publisher=data(read('games/'+game.slug+'/index.html')).find(n=>n['@type']==='VideoGame').publisher;
  assert.equal(publisher['@id'],origin+'/#organization');assert.equal(publisher.name,'にくねこスタジオ');
  assert.ok(publisher.alternateName.includes('にくねこ企画'));
 }
});

test('seven new gallery cards have real dimensions, descriptive alt text and original-image links',()=>{
 const html=read('gallery/index.html');
 const cards=[...html.matchAll(/<figure class="piece">(.*?)<\/figure>/gs)].map(m=>m[1]);
 const added=cards.filter(c=>c.includes('images/gallery-20261023/'));
 assert.equal(added.length,7);
 const used=new Set();
 for(const card of added){
  const file=card.match(/<img[^>]*src="([^"]+)"/)[1];assert.ok(!used.has(file));used.add(file);
  const png=fs.readFileSync(new URL('../gallery/'+file,import.meta.url));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(Number(card.match(/width="(\d+)"/)[1]),png.readUInt32BE(16));
  assert.equal(Number(card.match(/height="(\d+)"/)[1]),png.readUInt32BE(20));
  assert.ok(card.includes('href="'+file+'"'));assert.ok(card.match(/alt="[^"]{5,}"/));
 }
 assert.ok(added[0].includes('fetchpriority="high"'));
 assert.ok(added.slice(1).every(c=>c.includes('loading="lazy"')));
 for(const old of ['animated-cat-walk.gif','animated-cat-trio.gif','animated-cream-soda-cat.gif','animated-cat-light.gif'])assert.ok(html.includes(old));
});
