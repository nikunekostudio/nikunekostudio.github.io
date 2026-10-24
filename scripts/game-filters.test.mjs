import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('games/index.html');
const source = read('games/game-filters.js');
const cards = [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)];
const attribute = (text, name) => text.match(new RegExp(`${name}="([^"]*)"`))?.[1];
function element(dataset = {}) {
  return { dataset, hidden: false, textContent: '', attributes: {}, events: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, callback) { this.events[key] = callback; },
    click() { this.events.click(); }, focus() { this.focused = true; } };
}
function setup(search = '') {
  const entries = cards.map(([_, attrs]) => element({ category: attribute(attrs, 'data-category'), themes: attribute(attrs, 'data-themes') }));
  const categories = ['all','action','table','quiz','diagnosis','simulation'].map(categoryFilter => element({ categoryFilter }));
  const stock = element(), count = element(), empty = element(), reset = element(), group = element(), emptyText = element();
  const filters = element();
  filters.querySelectorAll = () => categories;
  filters.querySelector = selector => ({ '[data-stock-filter]': stock, '[data-filter-count]': count, '[role="group"]': group })[selector];
  empty.querySelector = () => emptyText;
  const document = {
    querySelector: selector => ({ '.game-filters': filters, '.game-filter-empty': empty, '[data-filter-reset]': reset })[selector],
    querySelectorAll: selector => selector === '#game-list > .game-entry' ? entries : [],
  };
  vm.runInNewContext(source, { document, location: { search }, URLSearchParams });
  return { entries, categories, stock, count, empty, reset, filters, emptyText, visible: () => entries.filter(entry => !entry.hidden).length };
}
test('all nine static cards keep their order, links, and category mappings', () => {
  assert.equal(cards.length, 9);
  assert.deepEqual(cards.map(([_, attrs]) => attribute(attrs, 'data-category')), ['table','action','diagnosis','diagnosis','simulation','action','action','quiz','quiz']);
  assert.deepEqual(cards.map(([_, attrs, body]) => body.match(/href="([^"?#]+\/)(?:["?#])/)[1]), ['oniku-mahjong/','shooting-star-oniku-2/','sumomo-love/','kabukura225/','orega-utta/','tobe-oniku/','hashire-oniku/','ai-or-not/','quiz/']);
  for (const [_, attrs] of cards) assert.ok(!/\bhidden\b/.test(attrs));
  assert.match(html, /class="game-filters"[^>]*hidden/);
});
test('category counts, stock intersection, empty state and reset', () => {
  const ui = setup();
  assert.equal(ui.visible(), 9);
  [9,3,1,2,2,1].forEach((count, index) => {
    ui.categories[index].click();
    assert.equal(ui.visible(), count);
    assert.equal(ui.categories[index].attributes['aria-pressed'], 'true');
    assert.equal(ui.categories.filter(button => button.attributes['aria-pressed'] === 'true').length, 1);
  });
  ui.categories[0].click(); ui.stock.click(); assert.equal(ui.visible(), 4);
  ui.categories[3].click(); assert.equal(ui.visible(), 1);
  ui.categories[1].click(); assert.equal(ui.visible(), 0); assert.equal(ui.empty.hidden, false);
  ui.reset.click(); assert.equal(ui.visible(), 9); assert.equal(ui.empty.hidden, true);
  assert.equal(ui.stock.attributes['aria-pressed'], 'false'); assert.equal(ui.categories[0].focused, true);
  assert.equal(ui.count.textContent, '9作品中 9作品を表示');
});
test('English mode announces counts and empty results in English', () => {
  const ui = setup('?lang=en');
  assert.equal(ui.count.textContent, '9 of 9 games');
  assert.equal(ui.filters.attributes['aria-label'], 'Filter games');
  assert.equal(ui.emptyText.textContent, 'No games match these filters yet.');
});
