import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker from './worker.js';
const game='shooting-star-oniku-2';
function database(){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE scores (month TEXT, player_id TEXT, player_name TEXT, score INTEGER, updated_at INTEGER)');
  const DB={prepare(sql){let args=[];const q={bind(...values){args=values;return q;},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};},async all(){return {results:sqlite.prepare(sql).all(...args)};}};return q;}};
  return {sqlite,env:{DB}};
}
const request=(suffix='',body)=>new Request(`https://example.test/scores${suffix}`,{method:body?'POST':'GET',headers:{Origin:'https://nikuneko.com','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});

test('shared API accepts shooter records, keeps personal best, serves monthly and unique all-time ranks',async()=>{
  const {sqlite,env}=database();try{
    let r=await worker.fetch(request('',{game,name:'猫',playerId:'test-cat',score:1200}),env);assert.equal(r.status,200);assert((await r.json()).updated);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://nikuneko.com');
    r=await worker.fetch(request('',{game,name:'猫',playerId:'test-cat',score:100}),env);assert.equal((await r.json()).updated,false);
    r=await worker.fetch(request(`?game=${game}&period=current`),env);assert.equal((await r.json()).entries[0].score,1200);
    sqlite.prepare('INSERT INTO scores_v2 VALUES (?,?,?,?,?,?)').run(game,'2020-01','test-cat','昔の猫',2500,1);
    sqlite.prepare('INSERT INTO scores_v2 VALUES (?,?,?,?,?,?)').run(game,'2020-01','test-dog','いぬ',1800,2);
    r=await worker.fetch(request(`?game=${game}&period=all`),env);const all=await r.json();assert.deepEqual(all.entries.map(e=>e.score),[2500,1800]);assert.equal(all.entries.length,2);
  }finally{sqlite.close();}
});
test('API rejects invalid scores and preserves existing stock-game score range',async()=>{
  const {sqlite,env}=database();try{
    for(const score of [-1,1.5,10_000_001])assert.equal((await worker.fetch(request('',{game,name:'猫',playerId:'test',score}),env)).status,400);
    assert.equal((await worker.fetch(request('',{game:'orega-utta',name:'猫',playerId:'test',score:-100}),env)).status,200);
    assert.equal((await worker.fetch(request('?game=invalid'),env)).status,400);
  }finally{sqlite.close();}
});
