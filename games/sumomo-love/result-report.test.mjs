import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportParagraphs, reportClues, renderResultReport} from './result-report.mjs';
import {Consultation} from './engine.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL(`./data/${name}.json`, import.meta.url),'utf8'));
const fixture = () => ({metrics:[0,1,2,3].map(i=>({name:`項目${i}`,comment:`読み取り${i}。`,level:i%3,evidence:[{label:`回答${i}`}]})),closing:'最後のひとこと。',summary:{facts:['話したこと。'],confirmed:['確認したこと。']}});
test('all four readings and closing are retained in one letter, without category labels or scores',()=>{
  const result=fixture();
  assert.deepEqual(reportParagraphs(result),['読み取り0。読み取り1。','読み取り2。読み取り3。','最後のひとこと。']);
  const html=renderResultReport(result,s=>s);
  assert.equal((html.match(/<section/g)||[]).length,1);
  assert.ok(html.includes('すももちゃんの思ったこと'));
  assert.ok(!html.includes('すももちゃんのまとめ'));
  assert.ok(!/項目|metric|pip/.test(html));
  for(const metric of result.metrics)assert.ok(html.includes(metric.comment));
});
test('repeated non-scoring comments and clues are not duplicated',()=>{
  const result=fixture();result.metrics.forEach(m=>{m.comment='今回は見立てないよ。';m.evidence=[{label:'同じ回答'}]});
  assert.deepEqual(reportParagraphs(result),['今回は見立てないよ。','最後のひとこと。']);
  assert.deepEqual(reportClues(result),['話したこと。','確認したこと。','同じ回答']);
});
test('text is escaped before insertion into the report',()=>{
  const result=fixture();result.metrics[0].comment='<img src=x onerror=alert(1)>';
  const html=renderResultReport(result,s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
});
test('real early-finish and special routes keep uncertainty and their original closing',()=>{
  for(const special of [null,'unsafe','rejected','otherPartner']){
    const game=new Consultation(read('dialogue'),read('rules'),read('stocks'),()=>0);
    if(special)game.markSpecial(special);
    const result=game.results(),paragraphs=reportParagraphs(result);
    assert.ok(paragraphs.includes(result.closing));
    for(const metric of result.metrics)assert.ok(paragraphs.some(p=>p.includes(metric.comment)));
    assert.ok(!result.stock);
  }
});
test('result page no longer renders separate metric cards',()=>{
  const app=fs.readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
  assert.ok(!app.includes('class="metric-grid"'));
  assert.ok(app.includes('renderResultReport(result, esc)'));
  assert.ok(app.includes('shareUrl(result, window.location.href)'));
});
