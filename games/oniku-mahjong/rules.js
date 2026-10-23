(function(root){
const M=root.Majiang;
const norm=t=>t>=34?[4,13,22][t-34]:t;
const code=t=>t>=34?'mps'[t-34]+'0':t<27?'mps'[Math.floor(t/9)]+(t%9+1):'z'+(t-26);
const number=p=>p[0]==='z'?26+Number(p[1]):Number(p[1])===0?34+'mps'.indexOf(p[0]):'mps'.indexOf(p[0])*9+Number(p[1])-1;
const hand=(h,melds=[])=>M.Shoupai.fromString(h.map(code).join('')+(melds.length?','+melds.join(','):''));
const closed=melds=>melds.every(m=>!/[+=-]/.test(m));
const meldTiles=m=>(m.match(/\d/g)||[]).map(n=>number(m[0]+n));
function shanten(h,melds=[]){return M.Util.xiangting(hand(h,melds))}
function waits(h,melds=[]){if(h.length+melds.length*3!==13)return [];const owned=[...h,...melds.flatMap(meldTiles)].map(norm);return (M.Util.tingpai(hand(h,melds))||[]).filter(p=>{if(owned.filter(t=>t===norm(number(p))).length>=4)return false;const s=hand(h,melds);s.zimo(p);return M.Util.xiangting(s)===-1}).map(p=>norm(number(p)))}
function score(h,ron,opts={}){const melds=opts.melds||[];if(h.length+melds.length*3!==(ron===null?14:13))return null;let s;if(ron===null){s=hand(h.slice(0,-1),melds);s.zimo(code(h.at(-1)))}else s=hand(h,melds);
 const p=M.Util.hule_param({tianhu:opts.tianhu||0,menfeng:opts.dealer?0:1,zhuangfeng:0,lizhi:opts.riichi||0,yifa:!!opts.ippatsu,qianggang:!!opts.chankan,lingshang:!!opts.rinshan,haidi:opts.last&&!opts.rinshan&&!opts.chankan?(ron===null?1:2):0,baopai:(opts.indicators||[]).map(code),fubaopai:opts.riichi?(opts.ura||[]).map(code):null});
 const r=M.Util.hule(s,ron===null?null:code(ron)+'+',p);if(!r?.hupai?.length||!r.defen)return null;
 return {...r,method:ron===null?'ツモ':'ロン',payment:r.defen+(opts.honba||0)*300,deposit:(opts.pot||0)*1000};
}
function choices(h,visible=[],enemyRiver=[],enemyRiichi=false,melds=[]){const seen=Array(34).fill(0);[...h,...visible].forEach(t=>seen[norm(t)]++);const cache=new Map();return h.map((t,i)=>{if(cache.has(t))return {...cache.get(t),index:i};const rest=h.filter((_,j)=>i!==j),s=hand(rest,melds),n=M.Util.xiangting(s),effective=(M.Util.tingpai(s)||[]).map(p=>norm(number(p))),accept=effective.reduce((sum,k)=>sum+Math.max(0,4-seen[k]),0),safe=enemyRiver.some(k=>norm(k)===norm(t));let merit=-n*100+accept-(t>=34?3:0);if(enemyRiichi){if(n>=2)merit+=(safe?450:0);else merit+=(safe?35:0)}const c={index:i,tile:t,shanten:n,accept,waits:n===0?effective:[],safe,merit};cache.set(t,c);return c})}
function discard(h,visible=[],enemyRiver=[],enemyRiichi=false,melds=[],allowed=null){const ranked=choices(h,visible,enemyRiver,enemyRiichi,melds).filter(c=>!allowed||allowed.includes(c.index));ranked.sort((a,b)=>b.merit-a.merit);return ranked[0]?.index??-1}
function calls(h,t,melds=[],riichi=false,kanOK=true){if(riichi)return [];const s=hand(h,melds),p=code(t)+'-';return [...(s.get_chi_mianzi(p)||[]).map(m=>({type:'chi',meld:m})),...(s.get_peng_mianzi(p)||[]).map(m=>({type:'pon',meld:m})),...(kanOK?s.get_gang_mianzi(p)||[]:[]).map(m=>({type:'daiminkan',meld:m}))]}
function kans(h,melds=[],riichi=false){const s=hand(h,melds);const result=(s.get_gang_mianzi()||[]).map(m=>({type:/[+=-]/.test(m)?'kakan':'ankan',meld:m}));if(!riichi)return result;const waiting=waits(h.slice(0,-1),melds),before=waiting.slice().sort().join(',');if(!waiting.length)return [];return result.filter(c=>c.type==='ankan'&&norm(meldTiles(c.meld)[0])===norm(h.at(-1))).filter(c=>{const rest=h.slice();for(const t of meldTiles(c.meld)){const i=rest.indexOf(t);if(i<0)return false;rest.splice(i,1)}const triplet=c.meld[0]+String(norm(meldTiles(c.meld)[0])%9+1).repeat(3);const fixed=waiting.every(t=>M.Util.hule_mianzi(hand(h.slice(0,-1),melds),code(t)+'-').every(parts=>parts.includes(triplet)));return fixed&&waits(rest,[...melds,c.meld]).sort().join(',')===before})}
function consume(h,call,own=false){const rest=h.slice(),m=call.meld;const needed=call.type==='kakan'?[number(m[0]+m.at(-1))]:own?meldTiles(m):(m.match(/\d(?![+=-])/g)||[]).map(n=>number(m[0]+n));for(const t of needed){const i=rest.indexOf(t);if(i<0)throw Error('Missing meld tile '+code(t));rest.splice(i,1)}return rest}
function legalDiscards(h,call=null){const deny=[];if(call){const n=Number(call.match(/\d(?=[+=-])/)[0])||5,s=call[0];deny.push(norm(number(s+n)));if(!call.replace(/0/g,'5').match(/^[mpsz](\d)\1\1/)){if(n<7&&/^[mps]\d-\d\d$/.test(call))deny.push(number(s+(n+3)));if(n>3&&/^[mps]\d\d\d-$/.test(call))deny.push(number(s+(n-3)))}}return h.flatMap((t,i)=>deny.includes(norm(t))?[]:[i])}
root.Rules={norm,code,number,hand,closed,meldTiles,shanten,waits,score,choices,discard,calls,kans,consume,legalDiscards};
})(globalThis);
