import test from 'node:test';
import assert from 'node:assert/strict';
import {ArcadeSfx,SFX_PRESETS} from './sfx.mjs';
import {Game} from './model.mjs';

test('effects generate bounded voices, throttle rapid hits, and stop on mute',()=>{
  const previous=globalThis.AudioContext;
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=()=>({connect(){},disconnect(){},gain:param(),frequency:param(),threshold:param(),ratio:param()});
  globalThis.AudioContext=class{
    currentTime=0;sampleRate=8000;destination={};sources=[];
    resume(){return Promise.resolve();}createGain(){return node();}createDynamicsCompressor(){return node();}
    createBuffer(ch,length){return {getChannelData:()=>new Float32Array(length)};}
    createBiquadFilter(){return node();}
    createOscillator(){const n={...node(),start(t){this.started=t;},stop(t){this.stopped=t;}};this.sources.push(n);return n;}
    createBufferSource(){return this.createOscillator();}
  };
  try{
    const s=new ArcadeSfx();assert(s.play('hit'));assert.equal(s.active.size,2);assert(!s.play('hit'));
    s.context.currentTime=.08;assert(s.play('hit'));assert(s.play('bomb'));assert(s.play('bossDefeat'));
    assert(s.context.sources.every(n=>n.stopped>n.started));
    assert(Math.max(...SFX_PRESETS.bossDefeat.map(v=>(v.delay||0)+v.duration))>1.5);
    assert(Math.max(...SFX_PRESETS.bomb.map(v=>v.duration))>.8);
    s.stop();assert.equal(s.active.size,0);assert(s.context.sources.every(n=>n.stopped===undefined));
  }finally{if(previous===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=previous;}
});

test('bomb and different enemy defeats emit distinct sound events',()=>{
  const events=[],g=new Game({sound:name=>events.push(name),gear:{bombs:1}});
  g.bomb();assert(events.includes('bomb'));
  events.length=0;g.kill(g.spawn('turnip'));assert(events.includes('destroy'));
  events.length=0;g.kill(g.spawn('bear'));assert(events.includes('bossDefeat'));
  events.length=0;g.kill(g.spawn('suit_boss'));assert(events.includes('finalDefeat'));
});

test('nonlethal projectile hits sound once, misses stay quiet',()=>{
  const events=[],g=new Game({sound:name=>events.push(name)}),e=g.spawn('hermit_crab',200);
  e.x=200;e.y=150;g.player.fire=10;
  g.shots=[{x:200,y:150,vx:0,vy:0,r:6,damage:1}];g.step(.001);
  assert.equal(events.filter(n=>n==='hit').length,1);assert(!e.dead);
  events.length=0;g.shots=[{x:450,y:450,vx:0,vy:0,r:6,damage:1}];g.step(.001);
  assert(!events.includes('hit'));
});
