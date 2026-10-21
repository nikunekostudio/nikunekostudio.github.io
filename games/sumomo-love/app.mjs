import { Consultation, OMIT } from './engine.mjs';
import { shareUrl } from './share.mjs';
import { renderResultReport, reportClues } from './result-report.mjs';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const modalBody = document.querySelector('#modal-body');
const title = 'すももちゃんの恋の気配値相談室';
const esc = v => String(v ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
let game, data, rules, stocks, screen = 'title', toastTimer;

const button = (text, action, cls = 'choice', attrs = '') => `<button class="${cls}" data-action="${action}" ${attrs}>${esc(text)}</button>`;
function sprite(expression = 0, extra = '') {
  return `<div class="character ${extra}" style="background-position:${(expression % 4) * 100 / 3}% ${Math.floor(expression / 4) * 50}%" role="img" aria-label="すももちゃん"></div>`;
}
function scene(expression) {
  return `<aside class="room-scene" aria-label="すももちゃんの相談室"><div class="scene-window" aria-hidden="true"></div><div class="scene-floor" aria-hidden="true"></div><span class="mug" aria-hidden="true"></span><span class="flower" aria-hidden="true">✿</span>${sprite(expression)}</aside>`;
}
function expression() {
  if (game.special || game.route === 'breakup' || ['消耗', '対面消耗', '修復難', '生活圧迫'].some(t => game.tags.has(t))) return rules.expressions.listening;
  const last = game.answers.at(-1);
  if (last && ['消耗', '自己抑制', '対面消耗', '修復難', '生活圧迫', '頻度負担'].includes(last.tag)) return rules.expressions.sad;
  if (last && ['期待', '対面快', '生活充実', '単独充実'].includes(last.tag)) return rules.expressions.smile;
  if (['link', 'partial', 'reflection'].includes(game.stage)) return rules.expressions.listening;
  return rules.expressions.normal;
}
function speech(text, intro = '') {
  // Separate longer original responses into short, readable bubbles.
  const sentences = String(text).match(/[^。！？]+[。！？]?/g) || [text];
  const chunks = []; for (let i = 0; i < sentences.length; i += 2) chunks.push(sentences.slice(i, i + 2).join(''));
  return `<div class="speech" tabindex="-1" aria-live="polite">${intro ? `<p class="intro-line">${esc(intro)}</p>` : ''}${chunks.map(t => `<p>${esc(t)}</p>`).join('')}</div>`;
}
function showTitle() {
  screen = 'title';
  app.innerHTML = `<section class="room title-room"><div class="intro-copy"><p class="eyebrow">SUMOMO'S LOVE QUOTE ROOM</p><h1 class="title-name"><span class="small">すももちゃんの</span><em>恋の気配値</em><br>相談室</h1><p class="lead">その恋、いまどんな気配？<br>すももちゃんがあなたの恋を株に例えて診断してくれるよ</p>${button('すももちゃんに相談する　→', 'start', 'primary')}<button class="text-button" data-action="about">この相談室について</button></div>${scene(1)}</section>`;
  app.removeAttribute('aria-busy');
}
function sessionHeader() {
  return `<div class="session-header"><p class="session-title">すももちゃんの<br><span>恋の気配値相談室</span></p><div class="session-controls">${button('会話の記録', 'history', '')}${button('前の回答を変える', 'back', '', !game.answers.length ? 'disabled' : '')}${button('今日はここまで', 'finish', '')}</div></div>`;
}
function render() {
  if (game.stage === 'result') return renderResults();
  screen = 'session';
  const q = game.current;
  let content = '', controls = '';
  if (game.stage === 'question') {
    content = speech(q.prompt);
    controls = `<div class="choices">${q.options.map(o => button(o.label, 'answer', 'choice', `data-id="${esc(o.id)}"`)).join('')}</div><div class="omit">${OMIT.map(o => button(o.label, 'answer', '', `data-id="${o.id}"`)).join('')}</div>`;
  } else if (game.stage === 'reply') {
    content = `${q.kind === 'answer' ? `<div class="your-answer">あなた：${esc(q.label)}</div>` : ''}${speech(q.reply)}`;
    if (q.perspective) content += `<div class="thought"><p>${esc(q.perspective)}</p></div>`;
    controls = `<div class="conversation-bottom">${button('続きを話す　→', 'continue', 'primary')}</div>`;
  } else if (game.stage === 'link') {
    content = speech(q.text, 'さっきの話をつなげると……。今の受け取り方は近いかな？');
    controls = `<div class="choices">${button(q.choices[0], 'confirm', 'choice', 'data-status="accepted"')}${button('一部だけ近い', 'confirm', 'choice', 'data-status="partial"')}${button('それは違う', 'confirm', 'choice', 'data-status="rejected"')}${button('まだ分からない', 'confirm', 'choice', 'data-status="unknown"')}</div>`;
  } else if (game.stage === 'partial') {
    content = speech('全部ではなく、近い部分だけ教えてもらえる？');
    controls = `<div class="choices">${q.parts.map(p => button(p, 'partial', 'choice', `data-part="${esc(p)}"`)).join('')}${button('どれも近くない', 'confirm', 'choice', 'data-status="rejected"')}</div>`;
  } else if (game.stage === 'specialReply') {
    content = speech(q.reply);
    controls = `<div class="conversation-bottom">${button(game.special === 'unsafe' ? '安心を大切に、ここで振り返る' : '気持ちを整理する話を続ける', game.special === 'unsafe' ? 'finish' : 'continue', 'primary')}${game.special !== 'unsafe' ? button('話題を選び直す', 'edit', 'text-button') : ''}${button('今日は終える', 'finish', 'text-button')}</div>`;
  } else if (game.stage === 'reflection') {
    const s = game.summary();
    content = `${speech('ここまで聞いた話を、少しまとめてみるね。')}<ul class="reflection-list">${s.facts.length ? s.facts.map(f => `<li>${esc(f)}</li>`).join('') : '<li>まだ、はっきり選べる言葉は少なかったね。今日は分からないところを、そのまま置いておこう。</li>'}</ul>${s.confirmed.length ? `<p class="ref-label">あなたが近いと感じた読み取り</p><ul class="reflection-list confirmed">${s.confirmed.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}${s.special ? `<p class="special-note">「${esc(s.special)}」という事情も、大切にして考えるね。</p>` : ''}`;
    controls = `<div class="choices">${button('だいたい合っている。見立てを聞く', 'results')}${button('直したいところがある', 'edit')}${!game.hasExtended && game.candidates().length && !game.special && game.turns < rules.limits.maxTurns ? button('まだ話したいことがある', 'more') : ''}</div>`;
  }
  app.innerHTML = `${sessionHeader()}<section class="room session-layout"><div class="conversation"><p class="speaker">すももちゃん</p>${content}${controls}<div class="conversation-bottom">${button('別の事情がある', 'special', 'text-button')}</div></div>${scene(expression())}</section>`;
  focusSpeech();
}
function focusSpeech() { requestAnimationFrame(() => app.querySelector('.speech')?.focus({ preventScroll: true })); }
function renderResults() {
  screen = 'result'; const result = game.results();
  app.innerHTML = `<section class="room">${result.stock ? `<aside class="stock-note"><p class="eyebrow">恋を、ちょっと株にたとえると。</p><h2>${esc(result.type.label)}</h2><p>${esc(result.stock.bridgeText)}</p></aside>` : ''}<header class="result-header"><div><p class="eyebrow">A NOTE FROM SUMOMO</p></div>${sprite(result.special || result.route === 'breakup' || ['消耗', '自己抑制', '対面消耗', '修復難', '生活圧迫'].some(t => game.tags.has(t)) ? 4 : 1)}</header><div class="result-content">${result.materialCount < 2 ? '<p class="special-note">今日はまだ材料が少ないから、分からないところは分からないままにしておくね。</p>' : ''}${renderResultReport(result, esc)}<details class="result-summary"><summary>今回話したことを振り返る</summary><ul>${reportClues(result).map(f => `<li>${esc(f)}</li>`).join('')}</ul></details><div class="result-actions"><a class="primary share-x" href="${esc(shareUrl(result, window.location.href))}" target="_blank" rel="noopener noreferrer">Xで結果を共有 ↗</a>${button('もう一度、相談する', 'restart', 'primary')}${button('会話の記録を見る', 'history', 'secondary')}${button('回答を直す', 'edit', 'text-button')}${button('タイトルへ戻る', 'title', 'text-button')}</div></div></section>`;
  app.querySelector('.room h2')?.setAttribute('tabindex', '-1');
  app.querySelector('.room h2')?.focus({ preventScroll: true });
}
function openModal(name, content) {
  document.querySelector('#modal-title').textContent = name; modalBody.innerHTML = content;
  if (!modal.open) modal.showModal();
}
function closeModal() { modal.close(); }
function showHistory(edit = false) {
  const rows = game.events.map(e => {
    if (e.kind === 'answer') {
      const i = game.answers.indexOf(e);
      return edit ? `<div class="edit-row"><span>${esc(e.prompt)}<br><strong>${esc(e.label)}</strong></span>${button('ここから直す', 'rewind-confirm', 'secondary', `data-index="${i}"`)}</div>` : `<div class="history-item"><p>${esc(e.prompt)}</p><p class="user">あなた：${esc(e.label)}</p><p>${esc(e.reply)}</p>${button('回答を直す', 'rewind-confirm', 'text-button', `data-index="${i}"`)}</div>`;
    }
    if (edit) return '';
    if (e.kind === 'link') return `<div class="history-item"><p class="muted">受け取り方の確認 · ${({ accepted: '近い', partial: '一部だけ近い', rejected: '違う', unknown: '分からない' })[e.status]}</p><p>${esc(e.text)}</p>${e.status === 'partial' ? `<p class="user">近かった部分：${esc(e.confirmedText)}</p>` : ''}</div>`;
    return `<div class="history-item"><p>${esc(e.text)}</p></div>`;
  }).join('');
  openModal(edit ? 'どこから直そうか？' : 'ここまでの会話', `${edit ? '<p class="modal-copy">答えを変えた地点から、後の会話をやり直します。前の読み取りも、そのまま使うことはありません。</p>' : ''}${rows || '<p class="modal-copy">まだ、会話を始めたところです。</p>'}`);
}
function showSpecial() {
  openModal('別の事情がある', `<p class="modal-copy">話しておきたい事情があれば、選んでね。</p><div class="modal-choices">${Object.entries(rules.specials).map(([id, s]) => button(s.label, 'set-special', 'choice', `data-id="${id}"`)).join('')}${button('ここにはない / 戻る', 'close', 'secondary')}</div>`);
}
function toast(text) { const n = document.querySelector('#notice'); n.textContent = text; n.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('show'), 4500); }
function start() { game = new Consultation(data, rules, stocks); render(); window.scrollTo({ top: 0 }); }
function dispatch(event) {
  const b = event.target.closest('button[data-action]'); if (!b || b.disabled) return;
  switch (b.dataset.action) {
    case 'start': case 'restart': closeModal(); start(); break;
    case 'answer': if (game.answer(b.dataset.id)) render(); break;
    case 'continue': game.advance(); render(); break;
    case 'confirm': if (game.confirm(b.dataset.status)) render(); break;
    case 'partial': if (game.confirm('partial', b.dataset.part)) render(); break;
    case 'finish': game.reflect(); render(); window.scrollTo({ top: 0 }); break;
    case 'results': game.results(); render(); window.scrollTo({ top: 0 }); break;
    case 'more': if (!game.more()) { toast('まだ聞いていない関連する話は、ここまでみたい。直したい回答があれば選べるよ。'); showHistory(true); } else render(); break;
    case 'history': showHistory(); break;
    case 'edit': showHistory(true); break;
    case 'back': if (game.answers.length) confirmRewind(game.answers.length - 1); break;
    case 'rewind-confirm': confirmRewind(Number(b.dataset.index)); break;
    case 'rewind': closeModal(); game.rewind(Number(b.dataset.index)); render(); window.scrollTo({ top: 0 }); break;
    case 'special': showSpecial(); break;
    case 'set-special': closeModal(); game.markSpecial(b.dataset.id); render(); break;
    case 'title': game = null; showTitle(); window.scrollTo({ top: 0 }); break;
    case 'close': closeModal(); break;
    case 'about': openModal('この相談室について', '<div class="modal-copy"><p>すももちゃんが、あなた自身の恋の話を聞く会話ゲームです。正解を選ぶクイズではないので、今の気持ちに近い言葉を選んでね。</p><p>分からないところは飛ばせます。前の回答を変えたり、「今日はここまで」で途中で振り返ったりもできます。</p><p>相談内容はこのページの中だけで扱います。保存・送信はしません。ページを再読み込みすると、会話は消えます。</p><p>恋の気配は、回答からのゲーム内の見立て。相手の本心や、実際の成就確率を決めるものではありません。</p></div>'); break;
  }
}
function confirmRewind(index) {
  const a = game.answers[index]; if (!a) return;
  openModal('この回答から直す？', `<p class="modal-copy">「${esc(a.label)}」という回答を選び直します。<br>この後の会話はやり直しになります。</p><div class="modal-actions">${button('この回答を直す', 'rewind', 'primary', `data-index="${index}"`)}${button('やめる', 'close', 'secondary')}</div>`);
}
document.addEventListener('click', dispatch);
document.querySelector('#close-modal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal && e.clientX < modal.getBoundingClientRect().left) closeModal(); });
try {
  [data, rules, stocks] = await Promise.all(['dialogue', 'rules', 'stocks'].map(async name => {
    const r = await fetch(`data/${name}.json`); if (!r.ok) throw Error(`Cannot load ${name}`); return r.json();
  }));
  showTitle();
} catch {
  app.innerHTML = `<div class="room error"><h1>${esc(title)}</h1><p>相談室のデータを読み込めませんでした。<br>少し時間を置いて、ページを読み込み直してください。</p>${button('もう一度読み込む', 'reload', 'primary')}</div>`;
  app.querySelector('button').addEventListener('click', () => location.reload()); app.removeAttribute('aria-busy');
}
