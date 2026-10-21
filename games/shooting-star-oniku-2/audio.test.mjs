import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioManager,stageMusic} from './audio.mjs';

test('requested music order: retro, never give up, karakuri including boss',()=>{
  assert.equal(stageMusic(0),'forest');assert.equal(stageMusic(69.9),'forest');
  assert.equal(stageMusic(70),'boss');assert.equal(stageMusic(139.9),'boss');
  assert.equal(stageMusic(140),'city');assert.equal(stageMusic(210),'city');assert.equal(stageMusic(269),'city');
});
test('clear starts Crystallize, muted clears remember it, defeat does not start clear BGM',async()=>{
  const events=[];const oldAudio=globalThis.Audio,oldDocument=globalThis.document;
  globalThis.Audio=class{constructor(src){this.src=src;}pause(){events.push(['pause',this.src]);}remove(){}play(){events.push(['play',this.src]);return Promise.resolve();}addEventListener(){}};
  globalThis.document={body:{append(){}}};
  try{
    const a=new AudioManager();await a.enable();a.music('city');events.length=0;
    a.effect('boss');assert(events.some(e=>e[0]==='play'&&e[1]==='assets/audio/boss-warning.mp3'));events.length=0;
    a.sfx={stop(){events.push(['sfx-stop']);},play(name){events.push(['sfx',name]);},start(){}};
    a.finish(true);assert.equal(a.current,'coast');assert(events.some(e=>e[0]==='play'&&e[1]==='assets/audio/coast.mp3'));
    assert(events.findIndex(e=>e[0]==='sfx-stop')<events.findIndex(e=>e[0]==='sfx'&&e[1]==='bossDefeat'));
    const track=a.track;a.music(stageMusic(210));const bossTrack=a.track;assert.notStrictEqual(track,bossTrack);
    a.music(stageMusic(230));assert.strictEqual(a.track,bossTrack);
    const b=new AudioManager();b.finish(true);assert.equal(b.current,'coast');await b.enable();assert.equal(b.track.src,'assets/audio/coast.mp3');
    events.length=0;a.music('city');events.length=0;a.finish(false);assert(!events.some(e=>e[0]==='play'&&e[1]==='assets/audio/coast.mp3'));
  }finally{if(oldAudio===undefined)delete globalThis.Audio;else globalThis.Audio=oldAudio;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
