export function stageMusic(time){return time<70?'forest':time<140?'boss':'city';}

export class AudioManager {
  constructor(){this.enabled=false;this.track=null;this.current='lobby';this.voices=new Set();this.lastCoin=0;this.warn=false;this.sfx=new ArcadeSfx();}
  async enable(){this.enabled=!this.enabled;if(this.enabled){this.sfx.start();this.music(this.current,true);}else{this.pause();this.voices.clear();}return this.enabled;}
  music(name,force=false){if(name===this.current&&!force&&this.track)return;this.current=name;if(!this.enabled)return;this.track?.pause();this.track?.remove();const a=new Audio(`assets/audio/${name}.mp3`);a.id='bgm';a.loop=true;a.volume=.28;document.body.append(a);this.track=a;a.play().catch(()=>{this.warn=true;});}
  pause(){this.track?.pause();for(const a of this.voices)a.pause();this.voices.clear();this.sfx.stop();}
  resume(){if(this.enabled&&this.track)this.track.play().catch(()=>{this.warn=true;});}
  finish(clear){this.pause();if(clear)this.effect('bossDefeat');this.effect(clear?'clear':'over');if(clear)this.music('coast',true);}
  effect(name){if(!this.enabled)return;if(SFX_PRESETS[name]){this.sfx.play(name);return;}const map={confirm:'confirm.mp3',buy:'buy.mp3',coin:'coin.aac',hurt:'death.aac',over:'death.aac',big:'death.aac',clear:'clear.mp3',welcome:'welcome.wav',shield:'confirm.mp3',boss:'boss-warning.mp3'};if(!map[name])return;if(name==='coin'){const now=performance.now();if(now-this.lastCoin<160)return;this.lastCoin=now;}if(this.voices.size>=8)return;const a=new Audio(`assets/audio/${map[name]}`);a.volume=name==='welcome'||name==='boss'?.65:.4;this.voices.add(a);const release=()=>this.voices.delete(a);a.addEventListener('ended',release,{once:true});a.addEventListener('error',release,{once:true});a.play().catch(release);}
}
import {ArcadeSfx,SFX_PRESETS} from './sfx.mjs';
