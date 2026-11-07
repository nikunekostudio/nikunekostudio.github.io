import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const html=fs.readFileSync(new URL('../gallery/index.html',import.meta.url),'utf8');
const cards=[...html.matchAll(/<figure class="piece">(.*?)<\/figure>/gs)].map(m=>m[1]);
const added=cards.filter(card=>card.includes('images/gallery-20261107/'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const expected=[
 ['aichi-nagoyan',2048,2048,'0268920b26ffe61a5e79dff66e8d6293f8aa89166ca039f1d74dddfc2197da18'],
 ['bare',2048,1856,'599866d3ecbbe1096092831ad7389cc1929af27ead5e9748824b9563372b09d3'],
 ['unveiling',3072,2304,'155c3146c6da3a32ef6343a69d0c59f1ad38afe3e0a8efe31c665f338b162a52'],
 ['pixel-mushroom',1980,1980,'9270d85f341828ae3e4e9ff705fee0023065c89bf1cc3250b536e96d6c4f8797'],
 ['violet-lily',2048,1536,'6f0e7b0e15eaddec5cbde0a2cbe50e85fc48911e7aab3856c331767acb74bbaa'],
 ['hiroshima-senjigara',2048,2048,'5e5113eefa70ac8a0127c1530f4872835bffd003d14610808217e07f50738885'],
 ['kawagoe-sweets',2048,2048,'e5c888a292e2e82fd77f818c7de5c0f2320a5bd200a95e168a293bcec6bcb672'],
];
test('seven new original artworks lead the gallery with accurate dimensions and enlargement links',()=>{
 assert.equal(added.length,7);assert.deepEqual(cards.slice(0,7),added);
 const hashes=new Set(cards.filter(card=>!added.includes(card)).map(card=>sha(fs.readFileSync(new URL('../gallery/'+card.match(/<img[^>]+src="([^"]+)"/)[1],import.meta.url)))));
 expected.forEach(([name,width,height,hash],i)=>{
  const src=`images/gallery-20261107/${name}.png`,card=added[i],bytes=fs.readFileSync(new URL('../gallery/'+src,import.meta.url));
  assert.equal(sha(bytes),hash);assert.ok(!hashes.has(hash));hashes.add(hash);
  assert.equal(bytes.readUInt32BE(16),width);assert.equal(bytes.readUInt32BE(20),height);
  assert.ok(card.includes(`width="${width}" height="${height}"`));assert.ok(card.includes(`href="${src}"`));assert.match(card,/alt="[^"]{15,}"/);
 });
 assert.ok(added[0].includes('fetchpriority="high"'));assert.ok(added.slice(1).every(card=>card.includes('loading="lazy"')));
});
test('previously removed girl is not republished; existing animations remain',()=>{
 assert.ok(!html.includes('images/artwork-163.png'));assert.ok(!html.includes('<figcaption>女の子</figcaption>'));
 for(const src of ['animated-cat-walk.gif','animated-cat-trio.gif','animated-cream-soda-cat.gif','animated-cat-light.gif'])assert.ok(html.includes(src));
});
