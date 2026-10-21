// Color and silhouette both identify risk, independent of the background.
export const BULLET_STYLES={
  1:{color:'#77efff',outline:'#164865',radius:5,damage:1,label:'通常弾',shape:'circle'},
  2:{color:'#ffb34c',outline:'#6b321b',radius:4,damage:1,label:'高速弾',shape:'arrow'},
  3:{color:'#ff4d86',outline:'#601c42',radius:8,damage:2,label:'重弾',shape:'diamond'}
};
export function bulletStats(kind,speed,radius=5){
  const danger=kind==='heavy'?3:speed>=160?2:1,style=BULLET_STYLES[danger];
  return {danger,damage:style.damage,r:danger===1?radius:style.radius};
}
export function drawEnemyBullet(ctx,b){
  const style=BULLET_STYLES[b.danger]||BULLET_STYLES[1],r=b.r+2;
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx)-Math.PI/2);
  ctx.fillStyle=style.color;ctx.strokeStyle=style.outline;ctx.lineWidth=2;ctx.beginPath();
  if(style.shape==='circle')ctx.arc(0,0,r,0,Math.PI*2);
  else if(style.shape==='arrow'){ctx.moveTo(0,r+4);ctx.lineTo(-r,-r);ctx.lineTo(0,-r+3);ctx.lineTo(r,-r);ctx.closePath();}
  else{ctx.moveTo(0,-r-2);ctx.lineTo(r,0);ctx.lineTo(0,r+2);ctx.lineTo(-r,0);ctx.closePath();}
  ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff9e9';ctx.beginPath();ctx.arc(0,0,b.danger===3?3:2,0,Math.PI*2);ctx.fill();
  if(b.danger===3){ctx.strokeStyle='#ffd0e1';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r+4,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
