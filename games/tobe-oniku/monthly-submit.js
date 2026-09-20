// 名前を入力して「スコア登録」を押したとき、従来の GDevelop の記録に加えて月間の記録を送る。
window.nikunekoSubmitMonthly = function (scene) {
  const base = window.NIKUNEKO_MONTHLY_API;
  if (!/^https:\/\/[^/]+$/.test(base || '')) return;
  const input = scene.getObjects('PlayerNameInput')[0];
  const name = (gdjs.playerAuthentication.isAuthenticated()
    ? gdjs.playerAuthentication.getUsername() : input?.getText())?.trim();
  const score = scene.getVariables().get('Score').getAsNumber();
  if (!name || !Number.isSafeInteger(score) || score < 0) return;
  let id;
  try {
    id = localStorage.getItem('nikuneko-player-id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('nikuneko-player-id', id); }
  } catch { return; }
  fetch(base + '/scores', {method: 'POST', keepalive: true,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: name.slice(0, 20), score, playerId: id}),
  }).catch(() => {});
};
