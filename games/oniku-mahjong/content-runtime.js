(function(root){
const content=root.GameContent;
function character(id){return content.characters.find(c=>c.id===id)||content.characters[0]}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
root.Content={game:content.game,characters:content.characters,character,escape,lines:list=>(list||[]).map(escape).join('<br>')};
})(globalThis);
