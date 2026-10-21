import {TITLE} from './model.mjs';
export const GAME_ID='shooting-star-oniku-2';
export const gameId=()=>GAME_ID;
export const GAME_URL='https://nikuneko.com/games/shooting-star-oniku-2/';
export const SCORE_API='https://nikuneko-monthly-scores-api.nikunekokikaku.workers.dev';
export const cleanName=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,20);
export function shareUrl({score,status,time,totalTime=time,mode='normal',loop=0}){
  const seconds=Math.max(0,Math.floor(mode==='extra'?totalTime:time)),duration=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const text=`${TITLE}${mode==='extra'?` / エクストラ ${loop+1}周目`:''}\n${Math.max(0,Math.floor(score)).toLocaleString('ja-JP')}点！ ${status==='clear'?'キッシーダに文句を届けた！':`${duration}まで挑戦！`}\n仲間と一緒に、もうひと勝負。`;
  const query=new URLSearchParams({text,url:GAME_URL,hashtags:'シューティングスターおにく2,にくねこスタジオ'});
  return `https://twitter.com/intent/tweet?${query}`;
}
export function validEntries(data){
  if(!Array.isArray(data?.entries))throw Error('ランキングの形式が不正です。');
  const bestByName=new Map();
  for(const entry of data.entries){
    const name=cleanName(entry.name)||'おにく',score=Number(entry.score);
    if(!Number.isSafeInteger(score)||score<0||score>10_000_000)continue;
    if(!bestByName.has(name)||score>bestByName.get(name).score)bestByName.set(name,{name,score});
  }
  return [...bestByName.values()].sort((a,b)=>b.score-a.score).slice(0,10);
}
export async function getRanking(period='current',fetcher=fetch,mode='normal'){
  if(!['current','all'].includes(period))throw Error('Invalid period');
  const response=await fetcher(`${SCORE_API}/scores?game=${gameId(mode)}&period=${period}`,{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error(response.status===400?'ランキングは公開準備中です。':'ランキングを読み込めませんでした。');
  const data=await response.json();return {...data,entries:validEntries(data)};
}
export async function submitScore({name,score,playerId,mode='normal'},fetcher=fetch){
  name=cleanName(name);if(!name||!playerId||!Number.isSafeInteger(score)||score<0||score>10_000_000)throw Error('公開名とスコアを確認してください。');
  const response=await fetcher(`${SCORE_API}/scores`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game:gameId(mode),name,score,playerId}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error(response.status===400?'ランキングは公開準備中です。':'登録できませんでした。時間をおいてお試しください。');
  const data=await response.json();if(data.ok!==true)throw Error('登録を確認できませんでした。');return data;
}
