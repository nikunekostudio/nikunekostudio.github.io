const base = window.NIKUNEKO_MONTHLY_API;
const games = {
  'tobe-oniku': '飛べ！おにく！',
  'hashire-oniku': '走れ！おにく！',
  'orega-utta': '俺が売ったら、あがった。',
};
const previousResults = new Map();

function formatScore(value, game) {
  const score = Number(value);
  return game === 'orega-utta' ? `${score >= 0 ? '+' : '−'}${Math.abs(score).toLocaleString('ja-JP')} 円` : `${score.toLocaleString('ja-JP')} 点`;
}

function validRanking(data) {
  return Array.isArray(data.entries) && /^20\d{2}-(0[1-9]|1[0-2])$/.test(data.month);
}

function renderEntries(list, entries, game) {
  list.replaceChildren();
  if (!entries.length) {
    const item = document.createElement('li');
    item.className = 'empty';
    item.textContent = 'まだ記録はありません。';
    list.append(item);
    return;
  }
  for (const entry of entries.slice(0, 3)) {
    const item = document.createElement('li');
    item.append(document.createTextNode(String(entry.name).slice(0, 20)));
    const score = document.createElement('span');
    score.textContent = formatScore(entry.score, game);
    item.append(score);
    list.append(item);
  }
}

async function loadRanking(game, period) {
  const response = await fetch(`${base}/scores?game=${encodeURIComponent(game)}&period=${period}`);
  if (!response.ok) throw new Error('Request failed');
  const data = await response.json();
  if (!validRanking(data)) throw new Error('Invalid response');
  return data;
}

function enableShareWhenReady() {
  if (previousResults.size !== Object.keys(games).length) return;
  const button = document.querySelector('#share-previous-ranking');
  const status = document.querySelector('#monthly-share-status');
  const month = previousResults.values().next().value.month;
  button.disabled = false;
  status.textContent = `${month.replace('-', '年')}月の3ゲーム分を、投稿文にまとめます。`;
  button.addEventListener('click', () => {
    const lines = [`【${month.replace('-', '年')}月 月間ランキング】`];
    for (const [game, title] of Object.entries(games)) {
      lines.push('', `■${title}`);
      const entries = previousResults.get(game).entries.slice(0, 3);
      if (!entries.length) lines.push('記録なし');
      entries.forEach((entry, index) => {
        lines.push(`${index + 1}位 ${String(entry.name).slice(0, 20)} ${formatScore(entry.score, game)}`);
      });
    }
    lines.push('', '#にくねこスタジオ');
    const url = 'https://nikunekostudio.github.io/games/';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(lines.join('\n'))}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  }, {once: true});
}

if (/^https:\/\/[^/]+$/.test(base || '')) {
  document.querySelectorAll('[data-monthly-game]').forEach(async section => {
    const game = section.dataset.monthlyGame;
    const currentStatus = section.querySelector('[data-monthly-status]');
    const previousStatus = section.querySelector('[data-previous-status]');
    try {
      const [current, previous] = await Promise.all([
        loadRanking(game, 'current'),
        loadRanking(game, 'previous'),
      ]);
      currentStatus.textContent = `${current.month.replace('-', '年')}月のランキング（日本時間）`;
      previousStatus.textContent = `${previous.month.replace('-', '年')}月（確定）`;
      renderEntries(section.querySelector('[data-monthly-list]'), current.entries, game);
      renderEntries(section.querySelector('[data-previous-list]'), previous.entries, game);
      previousResults.set(game, previous);
      enableShareWhenReady();
    } catch {
      currentStatus.textContent = 'ランキングを読み込めませんでした。';
      previousStatus.textContent = '先月分を読み込めませんでした。';
      document.querySelector('#monthly-share-status').textContent = '結果を読み込めないため、共有文を作成できませんでした。';
    }
  });
}
