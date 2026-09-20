// ゲームオーバー画面のスコアを使って、投稿文をプレイヤー自身が共有する。
(() => {
  const gameUrl = 'https://nikunekostudio.github.io/games/tobe-oniku/';
  let shareText = '';

  const panel = () => document.getElementById('score-share');
  const message = () => `${shareText}\n${gameUrl}`;

  window.nikunekoShowShare = (scene) => {
    const score = scene.getVariables().get('Score').getAsNumber();
    if (!Number.isSafeInteger(score)) return;

    const previousBest = scene.getVariables().get('PreviousBestScore').getAsNumber();
    const heading = score > previousBest ? '自己ベスト更新！' : '今回のスコア';
    shareText = `『飛べ！おにく！』${heading} ${score.toLocaleString('ja-JP')}点！\nあなたは何点取れる？\n#飛べおにく #にくねこスタジオ`;
    panel().hidden = false;
    document.getElementById('score-share-x').href =
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) +
      '&url=' + encodeURIComponent(gameUrl);
  };

  window.nikunekoHideShare = () => {
    panel().hidden = true;
  };

  document.getElementById('score-share-native').addEventListener('click', async () => {
    if (!navigator.share) return;
    try { await navigator.share({text: shareText, url: gameUrl}); }
    catch { /* 共有画面を閉じた場合もゲームはそのまま続けられる */ }
  });

  if (!navigator.share) document.getElementById('score-share-native').hidden = true;

  document.getElementById('score-share-copy').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(message());
    } catch {
      // クリップボードを許可しない環境でも、手動でコピーできるようにする。
      window.prompt('この文章をコピーしてください', message());
      return;
    }
    button.textContent = 'コピーしました';
    setTimeout(() => { button.textContent = '文面をコピー'; }, 1800);
  });
})();
