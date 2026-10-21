// Original arcade effects synthesized locally. No extra network or audio files.
export const SFX_PRESETS={
  hit:[{noise:true,duration:.045,gain:.12,filter:2400},{type:'triangle',from:950,to:180,duration:.065,gain:.2}],
  destroy:[{noise:true,duration:.22,gain:.23,filter:1600},{type:'square',from:170,to:42,duration:.2,gain:.09}],
  bomb:[{noise:true,duration:.95,gain:.6,filter:2300},{type:'sine',from:100,to:26,duration:.9,gain:.75},{noise:true,delay:.12,duration:.55,gain:.3,filter:900},{type:'triangle',from:1200,to:100,duration:.17,gain:.1}],
  bossDefeat:[{noise:true,duration:1.15,gain:.55,filter:1800},{noise:true,delay:.16,duration:1.15,gain:.4,filter:1100},{noise:true,delay:.42,duration:1.35,gain:.35,filter:650},{type:'sine',from:115,to:24,duration:1.8,gain:.7},{type:'triangle',from:220,to:660,delay:.75,duration:.5,gain:.13},{type:'triangle',from:330,to:880,delay:1,duration:.55,gain:.1}]
};
export class ArcadeSfx {
  constructor(){this.context=null;this.active=new Set();this.last={};this.noise=null;}
  start(){
    const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AudioContext)return;
    try{if(!this.context){this.context=new AudioContext();this.output=this.context.createGain();this.output.gain.value=.6;const compressor=this.context.createDynamicsCompressor();compressor.threshold.value=-15;compressor.ratio.value=8;this.output.connect(compressor);compressor.connect(this.context.destination);
      this.noise=this.context.createBuffer(1,this.context.sampleRate*2,this.context.sampleRate);const samples=this.noise.getChannelData(0);let seed=1637;for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;samples[i]=seed/2147483648-1;}
    }this.context.resume().catch(()=>{});}catch{this.context=null;}
  }
  play(name){
    const preset=SFX_PRESETS[name];if(!preset)return false;if(!this.context)this.start();const ctx=this.context;if(!ctx)return false;
    const now=ctx.currentTime,interval=name==='hit'?.07:name==='destroy'?.05:name==='bossDefeat'?.4:.2;
    if(now-(this.last[name]??-Infinity)<interval)return false;this.last[name]=now;
    for(const voice of preset){
      const start=now+(voice.delay||0),end=start+voice.duration,gain=ctx.createGain();gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(voice.gain,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,end);gain.connect(this.output);
      let source,filter;if(voice.noise){source=ctx.createBufferSource();source.buffer=this.noise;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(voice.filter,start);filter.frequency.exponentialRampToValueAtTime(120,end);source.connect(filter);filter.connect(gain);}else{source=ctx.createOscillator();source.type=voice.type;source.frequency.setValueAtTime(voice.from,start);source.frequency.exponentialRampToValueAtTime(voice.to,end);source.connect(gain);}
      this.active.add(source);source.onended=()=>{this.active.delete(source);source.disconnect();filter?.disconnect();gain.disconnect();};source.start(start);source.stop(end+.01);
    }
    return true;
  }
  stop(){for(const source of this.active){try{source.stop();}catch{}}this.active.clear();}
}
