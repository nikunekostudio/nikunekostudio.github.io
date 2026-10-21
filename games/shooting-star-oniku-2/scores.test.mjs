import test from 'node:test';
import assert from 'node:assert/strict';
import {shareUrl,getRanking,submitScore,validEntries,GAME_ID,GAME_URL,cleanName} from './scores.mjs';

test('X share includes score, result, canonical production URL and both hashtags',()=>{
  const url=new URL(shareUrl({score:12500,time:245,status:'clear'}));
  assert.equal(url.origin,'https://twitter.com');assert.equal(url.pathname,'/intent/tweet');
  assert(url.searchParams.get('text').includes('12,500'));assert(url.searchParams.get('text').includes('文句を届けた'));
  assert.equal(url.searchParams.get('url'),GAME_URL);assert.equal(url.searchParams.get('hashtags'),'シューティングスターおにく2,にくねこスタジオ');
  assert(new URL(shareUrl({score:100,time:65,status:'over'})).searchParams.get('text').includes('1:05'));
});
test('ranking reads validate rows and report unsupported API honestly',async()=>{
  assert.equal(cleanName('  猫\nさん  '),'猫さん');assert.equal(cleanName('あ'.repeat(25)).length,20);
  assert.deepEqual(validEntries({entries:[{name:'猫',score:100},{name:'bad',score:-1}]}),[{name:'猫',score:100}]);
  assert.throws(()=>validEntries({}));
  const data=await getRanking('all',async url=>{assert(url.includes(`game=${GAME_ID}&period=all`));return Response.json({entries:[{name:'猫',score:200}]});});assert.equal(data.entries[0].score,200);
  await assert.rejects(getRanking('current',async()=>Response.json({error:'Invalid game'},{status:400})),/公開準備中/);
});
test('score registration sends only explicit name, score and anonymous ID, and handles failed saves',async()=>{
  const input={name:' 猫 ',score:1000,playerId:'test-only'};
  assert((await submitScore(input,async(url,options)=>{assert.equal(options.method,'POST');assert.deepEqual(JSON.parse(options.body),{game:GAME_ID,name:'猫',score:1000,playerId:'test-only'});return Response.json({ok:true,updated:true});})).updated);
  await assert.rejects(submitScore({...input,score:1.5}),/確認/);
  await assert.rejects(submitScore(input,async()=>Response.json({ok:false})),/確認/);
  await assert.rejects(submitScore(input,async()=>Response.json({},{status:500})),/登録できません/);
});
