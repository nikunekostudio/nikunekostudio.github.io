function howTo(){
 const en=OnikuLocale.language==='en',sets=[[0,1,2],[12,13,14],[20,20,20],[31,31,31],[27,27]];
 const example=sets.map((s,i)=>`<div><div class="example-set">${s.map(t=>tile(t)).join('')}</div><span class="mini-label">${i===4?(en?'Pair':'雀頭'):(en?'Set':'面子')}</span></div>`).join('');
 const title=en?'How to Play':'簡単な打ち方';
 const lessons=en?[
 ['1. Build four sets and a pair','Each turn, draw one tile and discard one. A set is three consecutive numbers of one suit, or three identical tiles. A pair is two identical tiles. Honor tiles cannot form a sequence.'],
 ['2. Select a tile, then discard','Click or tap a tile once to select it, then press Discard. Double-clicking or double-tapping also discards it. Your freshly drawn tile is at the far right.'],
 ['3. Use Riichi for your first win','If a closed hand is one tile away from winning, select a discard: Riichi appears when that discard leaves a ready hand. It costs 1,000 points. After declaring, you automatically select the drawn tile for discarding; press Tsumo or Ron when offered.'],
 ['4. Tsumo, Ron, and calls','Tsumo wins on your own draw. Ron wins on an opponent’s discard. You need at least one yaku (a scoring pattern); dora alone is not enough. Pon, Chi, and Kan appear only when possible. Calling usually removes the Riichi option. If you have discarded a tile in your current wait, you cannot Ron (furiten), but you can still Tsumo.'],
 ['5. Defeat your opponent','Both start at 25,000 points. Push the opponent below zero to unlock her reward image. You lose if your own score falls below zero. Shiitake < Sumomo < Kani in strength; all are hard opponents. A single winning hand does not unlock the reward.']
 ]:[
 ['1.「4つの面子＋雀頭」をそろえる','1枚引いて1枚捨てます。同じ種類の連番3枚、または同じ牌3枚が「面子」。同じ牌2枚が「雀頭」です。字牌は連番にできません。'],
 ['2. 牌を選んで捨てる','1回クリック・タップで選び、「打牌」を押します。ダブルクリック・ダブルタップでも捨てられます。引いた牌は手牌の右端です。'],
 ['3. 最初はリーチを目指す','鳴かずにあと1枚で和了になるとき、捨てる牌を選ぶと「リーチ」が出ます。宣言には1,000点必要です。リーチ後は引いた牌が打牌対象になり、和了できるときに「ツモ」「ロン」が出ます。'],
 ['4. ツモ・ロン・鳴き','自分で引いて和了するのが「ツモ」、相手の捨て牌で和了するのが「ロン」。和了には役が1つ以上必要で、ドラだけでは和了できません。ポン・チー・カンは可能なときだけ表示されます。鳴くと原則リーチできません。待ち牌を自分で捨てていると「フリテン」でロン不可。ツモはできます。'],
 ['5. 相手をハコテンにする','両者25,000点で開始。相手を0点未満にするとごほうび画像を解放。自分が0点未満になると終了です。強さは、しいたけ＜すもも＜かに。全員ハード以上です。1回の和了だけではごほうびは解放されません。']
 ];
 modal(`<div class="tutorial"><h2>${title}</h2><p class="intro">${en?'A quick guide to this two-player Riichi Mahjong game.':'二人打ち麻雀の基本を、ここだけで。'}</p>${lessons.map(([h,p],i)=>`<section class="lesson"><h3>${h}</h3><p>${p}</p>${i===0?`<div class="example-hand">${example}</div><p class="mini-label">${en?'Example shape. You also need a yaku to win. Seven pairs and Thirteen Orphans are special winning shapes.':'完成形の例。和了には別途「役」が必要です。七対子・国士無双などの特殊な形もあります。'}</p>`:''}</section>`).join('')}<div class="tutorial-actions"><button data-act="rules">${en?'Detailed rules':'詳しいルール'}</button><button class="primary" data-act="close">${en?'Close':'閉じる'}</button></div></div>`);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;if(b.dataset.act==='howto')howTo();if(b.dataset.act==='language'){OnikuLocale.set(OnikuLocale.language==='en'?'ja':'en');if(screen==='title')renderTitle();else if(screen==='album')album();else if(screen==='reward')reward(currentRewardId||data.selectedCharacter);else if(screen==='result')renderResult();else if(screen==='game'){clearTimeout(timer);renderGame();if(g.turn==='cpu')timer=setTimeout(cpuTurn,650)}}});
let currentRewardId=null;
const originalReward=reward;reward=function(id){currentRewardId=id;return originalReward(id)};
