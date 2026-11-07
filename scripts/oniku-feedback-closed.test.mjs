import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const apiSource = fs.readFileSync(new URL('functions/api/oniku-feedback.js', root), 'utf8');
const gameSource = fs.readFileSync(new URL('games/oniku-adventure-2/game.js', root), 'utf8');
const html = fs.readFileSync(new URL('games/oniku-adventure-2/index.html', root), 'utf8');
const api = await import('data:text/javascript;base64,' + Buffer.from(apiSource).toString('base64'));
const closedMessage = '修正投稿の受付は終了しました。過去の投稿は引き続き閲覧できます。';

function clientFunction(name) {
  const line = gameSource.split('\n').find(line => new RegExp('^(?:async )?function ' + name + '\\(').test(line));
  assert.ok(line, `${name} exists`);
  return line;
}

test('POST always rejects before reading any request or touching the database', async () => {
  const context = new Proxy({}, {get() { throw Error('No request or database access allowed'); }});
  for (let i = 0; i < 2; i++) {
    const response = await api.onRequestPost(context);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {error: closedMessage, code: 'FEEDBACK_CLOSED'});
  }
  assert.doesNotMatch(apiSource, /INSERT|UPDATE|DELETE|\.run\(/);
});

test('GET preserves existing records and ordering with a read-only query', async () => {
  const entries = [
    {id: 'newer', body: '大切な修正履歴', created_at: 2000, nickname: '参加者'},
    {id: 'older', body: '<img src=x onerror=alert(1)>', created_at: 1000, nickname: null},
  ];
  const before = structuredClone(entries);
  const env = {FEEDBACK_DB: {prepare(sql) {
    assert.equal(sql, 'SELECT id, body, created_at, nickname FROM feedback ORDER BY created_at DESC LIMIT 100');
    return {async all() { return {results: entries}; }};
  }}};
  const response = await api.onRequestGet({env});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), {entries});
  assert.deepEqual(entries, before);
});

test('GET retains its empty-list and temporary database-error responses', async () => {
  const empty = await api.onRequestGet({env: {FEEDBACK_DB: {prepare() {return {async all() {return {results: []};}};}}}});
  assert.deepEqual(await empty.json(), {entries: []});
  const failure = await api.onRequestGet({env: {}});
  assert.equal(failure.status, 503);
  assert.deepEqual(await failure.json(), {error: '一時的に読み込めません'});
});

test('feedback screen is read-only, can be reopened, and still loads history', async () => {
  let panels = [], reads = 0, musicCalls = 0;
  const context = vm.createContext({mode: 'work', syncMusic() {musicCalls++;}, panel(markup) {panels.push(markup);}, async refreshFeedback() {reads++;}});
  vm.runInContext(clientFunction('feedback'), context);
  await context.feedback();
  await context.feedback();
  assert.equal(context.mode, 'feedback');
  assert.equal(reads, 2);
  assert.equal(musicCalls, 2);
  for (const markup of panels) {
    assert.match(markup, /修正投稿の受付は終了しました/);
    assert.match(markup, /過去の書き込みは引き続き閲覧できます/);
    assert.match(markup, /id="feedback-list"/);
    assert.match(markup, /onclick="work\(\)"/);
    assert.doesNotMatch(markup, /<form|<textarea|<input|type="submit"|投稿する/);
  }
});

test('legacy client submit handler does not send a new request', async () => {
  let prevented = 0, opened = 0;
  const context = vm.createContext({async feedback() {opened++;}, fetch() {throw Error('Unexpected network write');}});
  vm.runInContext(clientFunction('submitFeedback'), context);
  await context.submitFeedback({preventDefault() {prevented++;}});
  await context.submitFeedback();
  assert.equal(prevented, 1);
  assert.equal(opened, 2);
});

test('history rendering uses safe text and the existing GET endpoint', async () => {
  const list = {rows: [], replaceChildren() {this.rows = [];}, append(row) {this.rows.push(row);}};
  const entries = [{id: 'test', nickname: '<b>参加者</b>', body: '<script>alert(1)</script>', created_at: 0}];
  const context = vm.createContext({document: {
    querySelector(selector) {assert.equal(selector, '#feedback-list');return list;},
    createElement(tag) {return {tag, children: [], append(...children) {this.children.push(...children);}};},
  }, async fetch(url, options) {
    assert.equal(url, '/api/oniku-feedback');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.method, undefined);
    return {ok: true, async json() {return {entries};}};
  }});
  vm.runInContext(clientFunction('refreshFeedback'), context);
  await context.refreshFeedback();
  assert.equal(list.rows.length, 1);
  assert.equal(list.rows[0].children[1].textContent, entries[0].body);
  assert.equal(list.rows[0].children[1].innerHTML, undefined);
});

test('mobile and desktop links, help text, and script cache version reflect closure', () => {
  assert.match(html, /id="mobile-feedback">みんなの修正履歴/);
  assert.match(html, /game\.js\?v=20261107-feedback-closed1/);
  assert.match(gameSource, /button\(520,485,200,'みんなの修正履歴'\)/);
  assert.match(clientFunction('instructions'), /修正投稿の受付は終了しました/);
  assert.doesNotMatch(clientFunction('instructions'), /どんどん修正指示|画像は |締め切りは2026/);
  assert.doesNotMatch(gameSource, /fetch\('\/api\/oniku-feedback',\{method:'POST'/);
  new vm.Script(gameSource);
});
