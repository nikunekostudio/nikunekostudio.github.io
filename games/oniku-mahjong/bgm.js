(function(root){
const key='sanhime-audio-v1';let enabled=true,volume=.3,scene='title';const tracks=new Map(),pending=new Set();
try{const saved=JSON.parse(localStorage.getItem(key));if(typeof saved?.enabled==='boolean')enabled=saved.enabled;if(Number.isFinite(saved?.volume))volume=Math.max(0,Math.min(1,saved.volume))}catch{}
function persist(){try{localStorage.setItem(key,JSON.stringify({enabled,volume}))}catch{}}
const sources=root.GameContent?.game?.music||{title:'assets/audio/title-bgm.mp3',game:'assets/audio/mahjong-bgm.mp3'};
function activeScene(){return enabled&&!document.hidden&&sources[scene]?scene:null}
function sync(){const active=activeScene();
 for(const [name,track]of tracks){if(name!==active){track.pause();if(name!==scene)track.currentTime=0}}
 if(!active)return;
 if(typeof Audio==='undefined')return;
 let track=tracks.get(active);if(!track){track=new Audio(sources[active]);track.loop=true;track.preload='metadata';track.volume=volume;track.hidden=true;track.setAttribute?.('data-bgm',active);document.body?.appendChild?.(track);tracks.set(active,track)}
 if(!track.paused||pending.has(track))return;pending.add(track);
 Promise.resolve(track.play()).catch(()=>{}).finally(()=>{pending.delete(track);if(activeScene()!==active){track.pause();if(scene!==active)track.currentTime=0}});
}
function controls(){document.querySelectorAll?.('[data-act="bgm"]').forEach(b=>{b.textContent='BGM '+(enabled?'ON':'OFF');b.setAttribute('aria-pressed',String(enabled))})}
function button(){return `<button data-act="bgm" aria-label="BGMの切り替え" aria-pressed="${enabled}">BGM ${enabled?'ON':'OFF'}</button>`}
root.GameMusic={setScene(value){scene=value;sync()},toggle(){enabled=!enabled;persist();sync();controls()},setVolume(value){volume=Math.max(0,Math.min(1,value));for(const track of tracks.values())track.volume=volume;persist()},button};
document.addEventListener('pointerdown',sync);document.addEventListener('keydown',sync);document.addEventListener('visibilitychange',sync);
root.addEventListener?.('pagehide',()=>{for(const track of tracks.values())track.pause()});
})(globalThis);
