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

test('shared API accepts shooter records, keeps personal best, serves monthly and name-unique all-time ranks',async()=>{
  const {sqlite,env}=database();try{
    let r=await worker.fetch(request('',{game,name:'猫',playerId:'test-cat',score:1200}),env);assert.equal(r.status,200);assert((await r.json()).updated);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://nikuneko.com');
    r=await worker.fetch(request('',{game,name:'猫',playerId:'test-cat',score:100}),env);assert.equal((await r.json()).updated,false);
    r=await worker.fetch(request(`?game=${game}&period=current`),env);assert.equal((await r.json()).entries[0].score,1200);
    sqlite.prepare('INSERT INTO scores_v2 VALUES (?,?,?,?,?,?)').run(game,'2020-01','test-cat','猫',2500,1);
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

test('shooter ranks the highest score per name across devices and months without deleting records',async()=>{
  const {sqlite,env}=database();try{
    const current=await (await worker.fetch(request(`?game=${game}`),env)).json();
    const insert=sqlite.prepare('INSERT INTO scores_v2 VALUES (?,?,?,?,?,?)');
    insert.run(game,current.month,'device-a','らっきーじゅん',85000,1);
    insert.run(game,current.month,'device-b','らっきーじゅん',38300,2);
    insert.run(game,current.month,'device-c','おにく',19900,3);
    insert.run(game,current.month,'device-d','おにく',65500,4);
    insert.run(game,'2020-01','old-device','おにく',70000,0);
    let result=await (await worker.fetch(request(`?game=${game}&period=current`),env)).json();
    assert.deepEqual(result.entries,[{name:'らっきーじゅん',score:85000},{name:'おにく',score:65500}]);
    result=await (await worker.fetch(request(`?game=${game}&period=all`),env)).json();
    assert.deepEqual(result.entries,[{name:'らっきーじゅん',score:85000},{name:'おにく',score:70000}]);
    const previous=await (await worker.fetch(request(`?game=${game}&period=previous`),env)).json();
    insert.run(game,previous.month,'prev-a','先月の猫',500,5);
    insert.run(game,previous.month,'prev-b','先月の猫',800,6);
    result=await (await worker.fetch(request(`?game=${game}&period=previous`),env)).json();
    assert.deepEqual(result.entries,[{name:'先月の猫',score:800}]);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM scores_v2').get().count,7);
  }finally{sqlite.close();}
});

test('deduplication happens before TOP 10 and equal scores keep earlier-record order',async()=>{
  const {sqlite,env}=database();try{
    const current=await (await worker.fetch(request(`?game=${game}`),env)).json();
    const insert=sqlite.prepare('INSERT INTO scores_v2 VALUES (?,?,?,?,?,?)');
    for(let i=0;i<12;i++)insert.run(game,current.month,`same-${i}`,'同じ猫',10000+i,i+10);
    for(let i=0;i<12;i++)insert.run(game,current.month,`other-${i}`,`別の人${i}`,9000-i,i+100);
    for(const period of ['current','all']){
      const result=await (await worker.fetch(request(`?game=${game}&period=${period}`),env)).json();
      assert.equal(result.entries.length,10);assert.equal(result.entries[0].score,10011);
      assert.equal(result.entries[9].name,'別の人8');
    }
    insert.run(game,current.month,'tied-a','後の同点',20000,3);
    insert.run(game,current.month,'tied-b','先の同点',20000,2);
    const result=await (await worker.fetch(request(`?game=${game}`),env)).json();
    assert.deepEqual(result.entries.slice(0,2).map(e=>e.name),['先の同点','後の同点']);
    insert.run('hashire-oniku',current.month,'other-game-a','同じ猫',100,1);
    insert.run('hashire-oniku',current.month,'other-game-b','同じ猫',200,2);
    const other=await (await worker.fetch(request('?game=hashire-oniku&period=all'),env)).json();
    assert.equal(other.entries.length,2);
  }finally{sqlite.close();}
});
