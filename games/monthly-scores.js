document.querySelectorAll('[data-monthly-game]').forEach(async section => {
  const base = window.NIKUNEKO_MONTHLY_API;
  if (!/^https:\/\/[^/]+$/.test(base || '')) return;
  const game = section.dataset.monthlyGame;
  const status = section.querySelector('[data-monthly-status]');
  const list = section.querySelector('[data-monthly-list]');
  status.textContent = '読み込み中…';
  try {
    const response = await fetch(base + '/scores?game=' + encodeURIComponent(game));
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (!Array.isArray(data.entries) || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(data.month)) throw new Error('Invalid response');
    status.textContent = `${data.month.replace('-', '年')}月のランキング（日本時間）`;
    if (!data.entries.length) status.textContent += '：まだ記録はありません。';
    for (const entry of data.entries.slice(0, 3)) {
      const item = document.createElement('li');
      item.append(document.createTextNode(String(entry.name).slice(0, 20)));
      const score = document.createElement('span');
      score.textContent = Number(entry.score).toLocaleString('ja-JP') + ' 点';
      item.append(score);
      list.append(item);
    }
  } catch {
    status.textContent = 'ランキングを読み込めませんでした。時間をおいて再度お試しください。';
  }
});
