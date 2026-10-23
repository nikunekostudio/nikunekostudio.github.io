/* Two-player house rules: four melds and a pair, seven pairs or thirteen orphans. */
(function(root){
function counts(h){const c=Array(34).fill(0);h.forEach(t=>c[t]++);return c}
function melds(c){let i=c.findIndex(n=>n);if(i<0)return true;if(c[i]>=3){c[i]-=3;const ok=melds(c);c[i]+=3;if(ok)return true}if(i<27&&i%9<7&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;const ok=melds(c);c[i]++;c[i+1]++;c[i+2]++;if(ok)return true}return false}
function win(h){if(h.length!==14)return false;const c=counts(h);if(c.filter(n=>n===2).length===7)return true;const ends=[0,8,9,17,18,26,27,28,29,30,31,32,33];if(ends.every(i=>c[i])&&ends.some(i=>c[i]===2))return true;for(let i=0;i<34;i++){if(c[i]<2)continue;c[i]-=2;const ok=melds(c);c[i]+=2;if(ok)return true}return false}
function waits(h){if(h.length!==13)return [];const c=counts(h);return c.flatMap((n,i)=>n<4&&win([...h,i])?[i]:[])}
function wall(random=Math.random,red=false){const a=Array.from({length:136},(_,i)=>Math.floor(i/4));if(red){[4,13,22].forEach((t,i)=>a[t*4]=34+i)}for(let i=a.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function value(h){const c=counts(h);let v=0;for(let i=0;i<34;i++){if(c[i]>=2)v+=4;if(c[i]>=3)v+=6;if(i<27){if(i%9<8&&c[i]&&c[i+1])v+=3;if(i%9<7&&c[i]&&c[i+2])v+=1}}return v}
function discard(h){let best=-Infinity,index=0;h.forEach((_,i)=>{const rest=h.filter((t,j)=>j!==i),w=waits(rest),score=w.length*100+value(rest);if(score>best){best=score;index=i}});return index}
const api={counts,win,waits,wall,discard};root.MJ=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
