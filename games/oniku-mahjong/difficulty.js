(function(root){
const key='tsukikage-options-v1',modes={
 easy:{label:'イージー',description:'あなたの配牌が少し良くなります。'},
 normal:{label:'ノーマル',description:'配牌の補正はありません。'},
 hard:{label:'ハード',description:'相手の配牌が少し良くなります。'}
};let selected='normal';
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Object.hasOwn(modes,saved.difficulty))selected=saved.difficulty}catch{}
function set(mode){if(!Object.hasOwn(modes,mode))return false;selected=mode;try{localStorage.setItem(key,JSON.stringify({difficulty:mode}))}catch{}return true}
// At most one exchange with the unused reserve. Neither opponent nor live/dead walls change.
// Only accept a strictly smaller shanten number, so the original hand never gets worse.
function improve(hand,reserve){if(hand.length!==13)return false;const baseline=Rules.shanten(hand);if(baseline<=0)return false;let chosen=null,best=baseline;
 for(let j=0;j<Math.min(4,reserve.length);j++){for(let i=0;i<hand.length;i++){if(Rules.norm(hand[i])===Rules.norm(reserve[j]))continue;const candidate=hand.slice();candidate[i]=reserve[j];const score=Rules.shanten(candidate);if(score<best){best=score;chosen={i,j};}}}
 if(!chosen)return false;const {i,j}=chosen;[hand[i],reserve[j]]=[reserve[j],hand[i]];return true;
}
function prepare(player,cpu,reserve){let changed=false;for(let i=0;i<Content.character(data.run?.characterId||data.selectedCharacter).rank;i++)changed=improve(cpu,reserve)||changed;return changed}
root.Difficulty={get:()=> 'hard',prepare};})(globalThis);
