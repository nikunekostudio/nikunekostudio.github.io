(() => {
  'use strict';
  const filters = document.querySelector('.game-filters');
  if (!filters) return;
  const entries = [...document.querySelectorAll('#game-list > .game-entry')];
  const categories = [...filters.querySelectorAll('[data-category-filter]')];
  const stockButton = filters.querySelector('[data-stock-filter]');
  const count = filters.querySelector('[data-filter-count]');
  const empty = document.querySelector('.game-filter-empty');
  const reset = document.querySelector('[data-filter-reset]');
  const english = new URLSearchParams(location.search).get('lang') === 'en';
  let category = 'all';
  let stocks = false;

  if (english) {
    filters.setAttribute('aria-label', 'Filter games');
    filters.querySelector('[role="group"]').setAttribute('aria-label', 'Genre');
    document.querySelectorAll('[data-en]').forEach(button => { button.textContent = button.dataset.en; });
    empty.querySelector('[data-empty-text]').textContent = 'No games match these filters yet.';
  }

  function update() {
    let visible = 0;
    entries.forEach(entry => {
      const matches = (category === 'all' || entry.dataset.category === category)
        && (!stocks || (entry.dataset.themes || '').split(/\s+/).includes('stocks'));
      entry.hidden = !matches;
      if (matches) visible++;
    });
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category)));
    stockButton.setAttribute('aria-pressed', String(stocks));
    count.textContent = english ? `${visible} of ${entries.length} games` : `${entries.length}作品中 ${visible}作品を表示`;
    empty.hidden = visible !== 0;
  }
  categories.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.categoryFilter;
    update();
  }));
  stockButton.addEventListener('click', () => { stocks = !stocks; update(); });
  reset.addEventListener('click', () => {
    category = 'all';
    stocks = false;
    update();
    categories[0].focus();
  });
  update();
  filters.hidden = false;
})();
