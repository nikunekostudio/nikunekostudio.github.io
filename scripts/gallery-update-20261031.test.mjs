import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=fs.readFileSync(path.join(root,'gallery/index.html'),'utf8');
const cards=[...html.matchAll(/<figure class="piece">(.*?)<\/figure>/gs)].map(m=>m[1]);
const added=cards.filter(card=>card.includes('images/gallery-20261031/'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('exactly two original new artworks lead the gallery without duplicate uploads',()=>{
  assert.equal(added.length,2);
  assert.deepEqual(cards.slice(0,2),added);
  const expected=['76a237b3ce68af98998a11f758a08bf3f21fa4a6ca558f4407545b04b4c042ca','f86e9b32473dae4150a86894c741b9c5e9ba5a89038584f25ab9c0768fcdc3c1'];
  const oldHashes=new Set(cards.slice(2).map(card=>sha(fs.readFileSync(path.resolve(root,'gallery',card.match(/<img[^>]+src="([^"]+)"/)[1])))));
  const seen=new Set();
  added.forEach((card,i)=>{
    const src=card.match(/<img[^>]+src="([^"]+)"/)[1];
    const png=fs.readFileSync(path.join(root,'gallery',src));
    const hash=sha(png);
    assert.equal(hash,expected[i]);assert.ok(!oldHashes.has(hash));assert.ok(!seen.has(hash));seen.add(hash);
    assert.equal(png.readUInt32BE(16),3072);assert.equal(png.readUInt32BE(20),2304);
    assert.ok(card.includes('width="3072" height="2304"'));
    assert.ok(card.includes(`href="${src}"`));assert.match(card,/alt="[^"]{20,}"/);
  });
  assert.ok(added[0].includes('fetchpriority="high"'));assert.ok(added[1].includes('loading="lazy"'));
});
test('all local gallery image and enlargement links resolve',()=>{
  for(const [,ref] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
    if(!ref.match(/\.(?:png|jpe?g|gif|webp)(?:$|\?)/i)||/^https?:/.test(ref))continue;
    assert.ok(fs.existsSync(path.resolve(root,'gallery',ref.split('?')[0])),ref);
  }
});
