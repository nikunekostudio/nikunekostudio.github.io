(function(root){
 let audio=null;
 function play(enabled=true){
  if(!enabled||typeof Audio==='undefined'||root.document?.hidden)return;
  try{
   if(!audio){audio=new Audio('assets/audio/tile-place.mp3');audio.preload='auto';audio.volume=.65}
   audio.currentTime=0;
   Promise.resolve(audio.play()).catch(()=>{});
  }catch{}
 }
 function stop(){if(audio){audio.pause();audio.currentTime=0}}
 root.document?.addEventListener('visibilitychange',()=>{if(root.document.hidden)stop()});
 root.addEventListener?.('pagehide',stop);
 root.TileSound={play,stop};
})(globalThis);
