import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('title HUD renders the shared best score without an initialization error',()=>{
  const source=fs.readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
  const hud=source.split(/\r?\n/).find(line=>line.startsWith('function hud()'));
  const nodes=new Map();const $=key=>{if(!nodes.has(key))nodes.set(key,{});return nodes.get(key);};
  vm.runInNewContext(`${hud};hud();`,{wallet:{best:62500},view:'title',game:null,$});
  assert.equal(nodes.get('#best').textContent,'0062500');assert.equal(nodes.get('#score').textContent,'0000000');
});
