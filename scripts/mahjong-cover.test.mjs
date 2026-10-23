import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('mahjong cover uses the supplied full image and original badges in character order',()=>{
 const html=read('games/index.html');
 const card=html.match(/<article class="game-entry" id="oniku-mahjong">([\s\S]*?)<\/article>/)[1];
 assert.ok(card.includes('assets/title-cover.webp'));assert.ok(card.includes('width="1672" height="941"'));
 const marks=[...card.matchAll(/assets\/cast\/(\w+)-mark.png/g)].map(m=>m[1]);
 assert.deepEqual(marks,['shiitake','sumomo','kani']);
 for(const match of card.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const path=match[1].endsWith('/')?match[1]+'index.html':match[1];
  assert.ok(fs.existsSync(new URL('../games/'+path,import.meta.url)),path);
 }
 assert.ok(html.includes('href="oniku-mahjong/cover.css"'));
 assert.ok(fs.statSync(new URL('../games/oniku-mahjong/assets/title-cover.webp',import.meta.url)).size>1000);
});
test('selection header links to the games list without changing the existing title action',()=>{
 const source=read('games/oniku-mahjong/sanhime.js'),fn=source.match(/^function header\(\)\{.*\}$/m)[0];
 const render=screen=>vm.runInNewContext(fn+';header();',{screen,data:{albums:{}},GameMusic:{button:()=>'<button>BGM</button>'}});
 assert.ok(render('title').includes('href="../" aria-label="ゲーム一覧に戻る"'));
 assert.ok(render('title').includes('class="wordmark" data-act="home"'));
 for(const screen of ['game','album','reward','result'])assert.ok(!render(screen).includes('class="games-back"'));
});
