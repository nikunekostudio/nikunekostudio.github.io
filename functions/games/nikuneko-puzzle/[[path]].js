export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  const prefix = '/games/nikuneko-puzzle';
  const target = new URL('https://oekaki-puzzle.nikunekokikaku.workers.dev');
  target.pathname = incoming.pathname.slice(prefix.length) || '/';
  target.search = incoming.search;
  return fetch(new Request(target.toString(), context.request));
}
