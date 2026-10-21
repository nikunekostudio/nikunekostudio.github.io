// 月間ランキングは日本時間の暦月で区切る。
const currentMonth = () =>
  new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 7);

const previousMonth = () => {
  const now = new Date(Date.now() + 9 * 3600_000);
  now.setUTCDate(1);
  now.setUTCMonth(now.getUTCMonth() - 1);
  return now.toISOString().slice(0, 7);
};

const games = new Set(['tobe-oniku', 'hashire-oniku', 'orega-utta', 'shooting-star-oniku-2']);
const allowed = new Set([
  'https://nikunekostudio.github.io',
  'https://nikuneko.pages.dev',
  'https://nikuneko.com',
  'https://www.nikuneko.com',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
]);

const cors = origin => ({
  'Access-Control-Allow-Origin': allowed.has(origin)
    ? origin : 'https://nikunekostudio.github.io',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
});

const reply = (body, status = 200, origin = '') =>
  Response.json(body, {status, headers: cors(origin)});

async function ensureSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS scores_v2 (
    game TEXT NOT NULL,
    month TEXT NOT NULL,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (game, month, player_id)
  )`).run();
  // 旧テーブルの記録はすべて「飛べ！おにく！」として一度だけ移行する。
  await db.prepare(`INSERT OR IGNORE INTO scores_v2
    (game, month, player_id, player_name, score, updated_at)
    SELECT 'tobe-oniku', month, player_id, player_name, score, updated_at
    FROM scores`).run();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (url.pathname !== '/scores')
      return reply({error: 'Not found'}, 404, origin);
    if (request.method === 'OPTIONS')
      return new Response(null, {status: 204, headers: cors(origin)});

    await ensureSchema(env.DB);

    if (request.method === 'GET') {
      const game = url.searchParams.get('game') || 'tobe-oniku';
      if (!games.has(game)) return reply({error: 'Invalid game'}, 400, origin);
      const period = url.searchParams.get('period') || 'current';
      if (!['current', 'previous', 'all'].includes(period))
        return reply({error: 'Invalid period'}, 400, origin);
      if (period === 'all') {
        // Oniku 2 ranks public names, even across different browser/device IDs.
        // Other games retain their existing per-player ranking semantics.
        const identity = game === 'shooting-star-oniku-2' ? 'player_name' : 'player_id';
        const {results} = await env.DB.prepare(`SELECT name, score FROM (
          SELECT player_name AS name, score, updated_at,
            ROW_NUMBER() OVER (PARTITION BY ${identity} ORDER BY score DESC, updated_at ASC, player_id ASC) AS position
          FROM scores_v2 WHERE game = ?
        ) WHERE position = 1 ORDER BY score DESC, updated_at ASC LIMIT 10`).bind(game).all();
        return reply({game, period, timezone: 'Asia/Tokyo', entries: results}, 200, origin);
      }
      const month = period === 'previous' ? previousMonth() : currentMonth();
      if (game === 'shooting-star-oniku-2') {
        const {results} = await env.DB.prepare(`SELECT name, score FROM (
          SELECT player_name AS name, score, updated_at,
            ROW_NUMBER() OVER (PARTITION BY player_name ORDER BY score DESC, updated_at ASC, player_id ASC) AS position
          FROM scores_v2 WHERE game = ? AND month = ?
        ) WHERE position = 1 ORDER BY score DESC, updated_at ASC LIMIT 10`).bind(game, month).all();
        return reply({game, month, timezone: 'Asia/Tokyo', entries: results}, 200, origin);
      }
      const {results} = await env.DB.prepare(`SELECT player_name AS name, score
        FROM scores_v2 WHERE game = ? AND month = ?
        ORDER BY score DESC, updated_at ASC LIMIT 10`).bind(game, month).all();
      return reply({game, month, timezone: 'Asia/Tokyo', entries: results}, 200, origin);
    }

    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); }
      catch { return reply({error: 'Invalid JSON'}, 400, origin); }
      const game = body.game || 'tobe-oniku';
      const name = String(body.name || '').trim().slice(0, 20);
      const playerId = String(body.playerId || '').slice(0, 80);
      const score = Number(body.score);
      if (!games.has(game) || !name || !playerId ||
          !Number.isSafeInteger(score) || score < (game === 'orega-utta' ? -3_000_000 : 0) || score > (game === 'orega-utta' ? 20_000_000 : 10_000_000))
        return reply({error: 'Invalid score'}, 400, origin);
      const result = await env.DB.prepare(`INSERT INTO scores_v2
        (game, month, player_id, player_name, score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(game, month, player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = excluded.score,
          updated_at = excluded.updated_at
        WHERE excluded.score > scores_v2.score
          AND excluded.updated_at >= scores_v2.updated_at + 30000`)
        .bind(game, currentMonth(), playerId, name, score, Date.now()).run();
      return reply({ok: true, updated: result.meta.changes > 0}, 200, origin);
    }

    return reply({error: 'Method not allowed'}, 405, origin);
  }
};
