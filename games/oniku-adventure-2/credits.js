/* Standalone credits: no save writes, network requests or gameplay progression. */
(() => {
  'use strict';
  const data = window.ONIKU_CREDITS_DATA;
  if (!data) return;
  const artwork = [
    'assets/work-dandelion-story.png',
    'assets/credits-village-corrected.png',
    'assets/work-sourcing.png',
    'assets/credits-b-rank-factory.png',
    'assets/credits-shipping-truck.png',
    'assets/credits-factory-sunset.png'
  ];
  const captions = [
    'たんぽぽをひとつ。勇気をひとつ。',
    '暗い洞窟を、少しずつ先へ。',
    '魚を釣って、作業場を守り、食材を届けました。',
    'また次の冒険で。'
  ];
  const scenes = [
    [artwork[0], captions[0]],
    [artwork[1], captions[1]],
    [artwork[2], captions[2]],
    [artwork[3], captions[2]],
    [artwork[4], captions[2]],
    [artwork[5], captions[3]]
  ];
  const st = { open: false, paused: false, list: false, ended: false, elapsed: 0,
    last: 0, raf: 0, generation: 0, scene: -1, image: '', timeLabel: '', muted: false,
    audioFailed: false, blocked: false, volume: .12, originalInert: false,
    originalOverflow: '', focus: null };
  let root, track, viewport, picture, caption, time, pause, listButton, mute, status, audio;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const duration = () => Number.isFinite(audio?.duration) && audio.duration > 1 ? audio.duration : data.music.durationSeconds;
  const format = n => Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
  function names() {
    return [...new Set([...data.names, ...data.additionalNames].filter(n => typeof n === 'string' && n.trim()).map(n => n.trim()))];
  }
  function section(kicker, title, lines, className = '') {
    const group = el('section', 'credits-group ' + className);
    if (kicker) group.append(el('small', 'credits-kicker', kicker));
    group.append(el('h3', '', title));
    for (const line of lines) group.append(el('p', 'credits-line', line));
    track.append(group); return group;
  }
  function control(label, handler) {
    const button = el('button', '', label);
    button.type = 'button'; button.addEventListener('click', handler); return button;
  }
  function build() {
    root = el('section', 'credits-screen'); root.id = 'credits-root'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'credits-title');
    const header = el('div', 'credits-header'), heading = el('div');
    const title = el('h2', '', 'SPECIAL THANKS'); title.id = 'credits-title'; heading.append(title);
    const back = control('作業場へ戻る', close); back.id = 'credits-back'; header.append(heading, back);
    const main = el('div', 'credits-main'), memories = el('figure', 'credits-memories');
    picture = el('img'); picture.alt = ''; caption = el('figcaption'); memories.append(picture, caption);
    viewport = el('div', 'credits-viewport'); viewport.tabIndex = 0;
    viewport.setAttribute('aria-label', 'スタッフロール。一覧表示でゆっくり読めます。');
    track = el('div', 'credits-track'); viewport.append(track); main.append(memories, viewport);
    section("ONIKU'S LITTLE ADVENTURE", 'みんなでつくる\nおにくの冒険２', ['ひとつひとつの修正指示が、', 'この冒険をつくりました。']);
    const contributors = section('THANK YOU FOR YOUR IDEAS', '修正指示をくれたみなさま', []);
    const list = el('ul', 'credits-names');
    for (const name of names()) list.append(el('li', '', name));
    contributors.append(list);
    if (data.hasAnonymous) contributors.append(el('p', 'credits-anonymous', '名前を入力せずに投稿してくれたみなさん'));
    section('MUSIC', data.music.title, [data.music.version + ' version']);
    section('', '制作PRODUCTION', [data.production], 'credits-production');
    section('AND YOU', '遊んでくれたあなたへ', ['いっしょにつくってくれて、', 'ありがとうございました'], 'credits-finale');
    const footer = el('div', 'credits-footer'), progress = el('div', 'credits-progress');
    progress.setAttribute('aria-hidden', 'true'); progress.append(el('i'));
    const controls = el('div', 'credits-controls');
    pause = control('一時停止', togglePause);
    listButton = control('一覧表示', toggleList); mute = control('音を消す', toggleMute);
    time = el('span', 'credits-time', '0:00 / ' + format(duration()));
    controls.append(pause, control('最初から', restart), listButton, mute, time);
    status = el('p', 'credits-status', ''); status.setAttribute('role', 'status');
    footer.append(progress, controls, status); root.append(header, main, footer); document.body.append(root);
    audio = new Audio(); audio.preload = 'none'; audio.src = data.music.src;
    audio.addEventListener('error', () => {
      st.audioFailed = true; audio.pause();
      if (st.open) status.textContent = '音源を読み込めませんでした。ロールはそのまま見られます。';
    });
    audio.addEventListener('ended', () => { if (st.open && !st.list) finish(); });
    root.addEventListener('keydown', onKeyDown);
  }
  function syncAudio() {
    if (!audio) return;
    audio.volume = st.volume; audio.muted = st.muted;
    if (!st.open || st.paused || st.list || st.ended || document.hidden) { audio.pause(); return; }
    if (!audio.paused) return;
    const generation = st.generation, attempt = audio.play();
    if (attempt) attempt.then(() => {
      if (generation !== st.generation) return;
      if (!st.open || st.paused || st.list || st.ended || document.hidden) audio.pause();
      else { st.blocked = false; if (!st.audioFailed) status.textContent = ''; updateControls(); }
    }).catch(() => {
      if (generation === st.generation && st.open && !st.audioFailed) {
        st.blocked = true; status.textContent = 'BGMを再生できませんでした。「音を出す」で再試行できます。'; updateControls();
      }
    });
  }
  function updateControls() {
    pause.textContent = st.ended ? '再生終了' : st.paused ? '再生する' : '一時停止';
    pause.disabled = st.ended || st.list;
    listButton.textContent = st.list ? 'ロールに戻る' : '一覧表示';
    listButton.setAttribute('aria-pressed', String(st.list));
    mute.textContent = st.muted || st.blocked ? '音を出す' : '音を消す';
    mute.setAttribute('aria-pressed', String(st.muted));
  }
  function draw() {
    const ratio = Math.min(1, st.elapsed / duration());
    if (!st.list) {
      const start = viewport.clientHeight * 0.68, end = Math.max(0, track.scrollHeight - viewport.clientHeight * 0.76);
      track.style.transform = 'translateY(' + (start - (start + end) * ratio) + 'px)';
    }
    const scene = Math.min(scenes.length - 1, Math.floor(ratio * scenes.length));
    if (st.scene !== scene) {
      if (st.image !== scenes[scene][0]) { picture.src = scenes[scene][0]; st.image = scenes[scene][0]; }
      caption.textContent = scenes[scene][1]; st.scene = scene;
    }
    root.querySelector('.credits-progress i').style.width = ratio * 100 + '%';
    const label = format(st.elapsed) + ' / ' + format(duration());
    if (label !== st.timeLabel) { time.textContent = label; st.timeLabel = label; }
  }
  function frame(now) {
    if (!st.open) return;
    if (mode !== 'credits') { close(false); return; }
    if (!st.paused && !st.list && !st.ended && !document.hidden) {
      const dt = Math.max(0, Math.min(.25, (now - st.last) / 1000));
      st.elapsed = !st.audioFailed && !audio.paused && Number.isFinite(audio.currentTime) ? audio.currentTime : st.elapsed + dt;
      if (st.elapsed >= duration()) finish();
    }
    st.last = now; draw(); st.raf = requestAnimationFrame(frame);
  }
  function finish() {
    st.elapsed = duration(); st.ended = true; audio.pause(); updateControls(); draw();
    status.textContent = '';
  }
  function open() {
    if (st.open || mode !== 'work') return;
    if (!root) build();
    st.open = true; st.generation++; st.elapsed = 0; st.last = performance.now(); st.scene = -1;
    st.paused = false; st.ended = false; st.audioFailed = false; st.blocked = false;
    st.list = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    st.muted = !s.volume; st.volume = s.volume ? Math.min(1, Math.max(0, s.volume * .7)) : .12;
    st.focus = document.activeElement; st.originalInert = document.querySelector('main').inert;
    document.querySelector('main').inert = true;
    st.originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    mode = 'credits'; keys = {}; syncMusic(); syncMobile();
    root.hidden = false; root.classList.toggle('is-list', st.list);
    viewport.scrollTop = 0; track.style.transform = ''; audio.currentTime = 0; status.textContent = '';
    syncAudio(); updateControls(); draw(); document.getElementById('credits-back').focus();
    st.raf = requestAnimationFrame(frame);
  }
  function close(restore = true) {
    if (!st.open) return;
    st.open = false; st.generation++; cancelAnimationFrame(st.raf); audio.pause(); audio.currentTime = 0;
    root.hidden = true; document.body.style.overflow = st.originalOverflow;
    document.querySelector('main').inert = st.originalInert; keys = {};
    if (restore && mode === 'credits') { mode = 'work'; syncMobile(); syncMusic(); }
    if (restore && st.focus?.isConnected) st.focus.focus();
  }
  function togglePause() {
    if (st.list || st.ended) return;
    st.paused = !st.paused; st.last = performance.now();
    if (!st.paused && Number.isFinite(audio.duration)) audio.currentTime = Math.min(st.elapsed, audio.duration);
    syncAudio(); updateControls();
  }
  function restart() {
    st.elapsed = 0; st.ended = false; st.paused = false; st.last = performance.now();
    audio.currentTime = 0; viewport.scrollTop = 0; status.textContent = '';
    syncAudio(); updateControls(); draw();
  }
  function toggleList() {
    st.list = !st.list; root.classList.toggle('is-list', st.list);
    if (st.list) { track.style.transform = ''; viewport.scrollTop = 0; }
    else { st.last = performance.now(); if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(st.elapsed, audio.duration); }
    syncAudio(); updateControls(); draw();
  }
  function toggleMute() {
    st.muted = st.blocked ? false : !st.muted; st.blocked = false;
    syncAudio(); updateControls();
  }
  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (event.key === 'Tab') {
      const nodes = [...root.querySelectorAll('button:not([disabled]), [tabindex="0"]')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    event.stopPropagation(); // Do not let the game's Space handler swallow control clicks.
  }
  document.addEventListener('visibilitychange', () => {
    if (!st.open) return; st.last = performance.now(); syncAudio();
  });
  window.addEventListener('pagehide', () => close());
  window.addEventListener('resize', () => { if (st.open) draw(); });
  document.getElementById('open-credits')?.addEventListener('click', open);
})();
