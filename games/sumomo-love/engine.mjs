export const OMIT = Object.freeze([
  { id: 'different', label: 'どれとも違う', reply: '選択肢にはない気持ちなんだね。無理に当てはめなくて大丈夫。' },
  { id: 'unknown', label: 'まだ分からない', reply: '今は、分からないままにしておこう。' },
  { id: 'skip', label: 'この話は飛ばす', reply: 'うん。この話は飛ばして、話せるところからにしよう。' },
  { id: 'na', label: '自分には該当しない', reply: 'あなたには当てはまらない話だったね。ここは見立てに使わないよ。' }
]);

export class Consultation {
  constructor(dialogue, rules, stocks, random = Math.random) {
    this.data = dialogue; this.rules = rules; this.stocks = stocks; this.random = random;
    this.events = []; this.variants = {}; this.extra = 0; this.hasExtended = false;
    this.finished = null; this.pending = null; this.stage = 'question';
    this.current = this.question('START');
  }
  get answers() { return this.events.filter(e => e.kind === 'answer'); }
  get route() { return this.rules.routeByTag[this.answers.find(e => e.id === 'START')?.tag] || 'unresolved'; }
  get special() { return this.events.filter(e => e.kind === 'special').at(-1)?.id || null; }
  get tags() { return new Set(this.answers.filter(e => e.status === 'answered').map(e => e.tag)); }
  get hypotheses() { return this.events.filter(e => e.kind === 'link'); }
  get confirmed() { return this.hypotheses.filter(e => e.status === 'accepted' || e.status === 'partial'); }
  get turns() { return this.answers.length + this.hypotheses.length; }
  matches(condition = {}) {
    const tags = this.tags;
    return (!condition.allTags || condition.allTags.every(t => tags.has(t))) &&
      (!condition.anyTags || condition.anyTags.some(t => tags.has(t)));
  }
  eligible(q) {
    if (this.answers.some(e => e.group === q.group)) return false;
    if (!q.routes.includes(this.route)) return false;
    if (!this.matches(q.require)) return false;
    if ((q.exclude.anyTags?.length || q.exclude.allTags?.length) && this.matches(q.exclude)) return false;
    if (this.special === 'unsafe') return false;
    if (this.special && ['CONTACT', 'CONTACT_FEEL', 'REPLY', 'INIT', 'SPECIAL', 'SPECIAL_EVENT', 'DIST'].includes(q.id)) return false;
    return true;
  }
  question(id) {
    const raw = this.data.questions.find(q => q.id === id);
    if (!raw) throw Error(`Unknown question: ${id}`);
    const q = structuredClone(raw);
    if (this.route === 'breakup' && this.rules.past[id]) {
      const past = this.rules.past[id]; q.variants = past.variants;
      q.options = q.options.map(o => ({ ...o, ...past.options?.[o.tag] }));
    }
    if (id === 'LIFE' && ['none', 'breakup', 'unresolved'].includes(this.route)) {
      q.variants = ['いま、趣味や友達との時間は持てている？'];
      q.options = q.options.map(o => o.tag === '生活充実' ? { ...o, label: '最近、毎日が楽しい', reply: '日々に楽しめる時間があるんだね。' } : o.tag === '生活圧迫' ? { ...o, label: '考えごとで手いっぱい', reply: '考えごとが、自分の時間にも入ってきているんだね。' } : o);
    }
    if (id === 'WISH' && this.special === 'rejected') q.options = q.options.filter(o => o.tag !== '接近希望');
    if (!(id in this.variants)) this.variants[id] = Math.floor(this.random() * q.variants.length);
    q.variant = this.variants[id] % q.variants.length;
    q.prompt = q.variants[q.variant];
    return q;
  }
  candidates() {
    return this.data.questions.filter(q => this.eligible(q)).map(q => {
      let priority = q.priority;
      for (const boost of this.rules.boosts) if (boost.when.every(t => this.tags.has(t))) priority += boost.questions[q.id] || 0;
      return { ...q, rank: priority };
    }).sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
  }
  nextLink() {
    if (this.special || this.answers.length < 5 || this.hypotheses.length >= this.rules.limits.maxLinks) return null;
    return this.data.links.find(l => l.enabled && !this.hypotheses.some(h => h.id === l.id) && l.allTags.every(t => this.tags.has(t))) || null;
  }
  advance() {
    if (this.special === 'unsafe') return this.reflect();
    const link = this.nextLink();
    if (link && this.turns < this.rules.limits.maxTurns) {
      this.stage = 'link'; this.current = structuredClone(link); return;
    }
    const root = !this.answers.some(e => e.id === 'START') ? 'START' : !this.answers.some(e => e.id === 'NEED') ? 'NEED' : null;
    if (root) { this.current = this.question(root); this.stage = 'question'; return; }
    const target = Math.min(this.rules.limits.maxTurns, this.rules.limits.targetTurns + this.extra);
    const wish = this.data.questions.find(q => q.id === 'WISH');
    const candidates = this.candidates();
    if (this.turns >= target || !candidates.length) return this.reflect();
    const selected = this.turns === target - 1 && wish && this.eligible(wish) ? wish : candidates[0];
    this.current = this.question(selected.id); this.stage = 'question';
  }
  answer(answerId) {
    if (this.stage !== 'question') return false;
    const q = this.current;
    const option = q.options.find(o => o.id === answerId);
    const omit = OMIT.find(o => o.id === answerId);
    if (!option && !omit) return false;
    const value = option || omit;
    const event = { kind: 'answer', id: q.id, group: q.group, answerId, status: option ? 'answered' : answerId, label: value.label, tag: option?.tag || null, prompt: q.prompt, variant: q.variant, reply: value.reply };
    this.events.push(event); this.finished = null;
    this.current = { ...event, perspective: this.perspective() }; this.stage = 'reply';
    return true;
  }
  perspective() {
    if (this.special) return '';
    const need = this.answers.find(e => e.id === 'NEED')?.tag;
    // Listening/reassurance routes pause with reflection more often, without changing the evidence.
    const spacing = ['傾聴', '安心'].includes(need) ? 2 : 3;
    if (this.answers.length % spacing) return '';
    const used = new Set(this.events.filter(e => e.kind === 'perspective').map(e => e.text));
    const p = this.rules.perspectives.find(p => !used.has(p.text) &&
      (p.unknownCount ? this.answers.filter(a => a.status !== 'answered').length >= p.unknownCount : p.tags.every(t => this.tags.has(t))));
    if (p) { this.events.push({ kind: 'perspective', text: p.text }); return p.text; }
    return '';
  }
  confirm(status, part = null) {
    if (this.stage !== 'link' && this.stage !== 'partial') return false;
    const l = this.current;
    if (status === 'partial' && !part) { this.stage = 'partial'; return true; }
    if (!['accepted', 'partial', 'rejected', 'unknown'].includes(status)) return false;
    if (status === 'partial' && !l.parts.includes(part)) return false;
    this.events.push({ kind: 'link', id: l.id, status, text: l.text, confirmedText: status === 'accepted' ? l.text : status === 'partial' ? part : '', sourceIds: this.answers.filter(a => l.allTags.includes(a.tag)).map(a => a.id) });
    this.current = { reply: l.confirmationTexts[status === 'accepted' ? 'accept' : status === 'rejected' ? 'reject' : status === 'partial' ? 'accept' : 'unknown'] };
    this.stage = 'reply'; this.finished = null; return true;
  }
  markSpecial(id) {
    if (!this.rules.specials[id]) return false;
    this.events.push({ kind: 'special', id, text: this.rules.specials[id].text });
    this.finished = null; this.current = { reply: this.rules.specials[id].text }; this.stage = 'specialReply'; return true;
  }
  rewind(answerIndex) {
    const index = this.events.map((e, i) => ({ e, i })).filter(x => x.e.kind === 'answer')[answerIndex]?.i;
    if (index === undefined) return false;
    const id = this.events[index].id;
    this.events = this.events.slice(0, index); this.finished = null; this.pending = null;
    this.extra = 0; this.hasExtended = false; this.current = this.question(id); this.stage = 'question'; return true;
  }
  summary() {
    const facts = [];
    const start = this.answers.find(a => a.id === 'START' && a.status === 'answered');
    if (start) facts.push(`今日は「${start.label}」について話したね。`);
    for (const [id, template] of Object.entries(this.rules.summaryPhrases)) {
      const a = this.answers.find(a => a.id === id && a.status === 'answered');
      if (a && !['理由未整理', '希望未知'].includes(a.tag)) facts.push(template.replace('{label}', a.label));
    }
    return { facts, confirmed: this.confirmed.map(h => h.confirmedText), special: this.special ? this.rules.specials[this.special].label : null };
  }
  reflect() { this.stage = 'reflection'; this.current = this.summary(); }
  more() {
    if (this.hasExtended || this.turns >= this.rules.limits.maxTurns || this.special === 'unsafe' || !this.candidates().length) return false;
    this.hasExtended = true;
    this.extra = Math.max(0, this.turns - this.rules.limits.targetTurns) + this.rules.limits.extraQuestions;
    // A short route only adds available, relevant questions.
    this.advance(); return this.stage !== 'reflection';
  }
  metric(rule) {
    if (this.route === 'couple' && rule.couple) rule = { ...rule, ...rule.couple };
    const noPartner = ['none', 'unresolved'].includes(this.route);
    const past = this.route === 'breakup';
    const special = this.special ? this.rules.specials[this.special] : null;
    if (noPartner || past || special?.stopScoring || (rule.id === 'progress' && special?.pauseProgress)) {
      return { id: rule.id, name: rule.name, level: null, evidence: [], label: special?.stopScoring ? '安心を最優先' : rule.id === 'progress' && special?.pauseProgress ? this.rules.specialUnknowns[this.special] : '今回は見立てなし', comment: special?.stopScoring ? '関係の採点をせず、あなたの安心を優先するね。' : past ? '終わった関係についての話から、今の関係を採点することはしないよ。' : noPartner ? '特定の相手との関係を測る項目なので、今回は見立てないよ。' : '相手の意思や関係の事情を尊重して、進展の見通しは保留にするね。' };
    }
    const seen = new Set();
    let evidence = this.answers.filter(a => a.status === 'answered' && Object.hasOwn(rule.scores, a.tag) && !seen.has(a.group) && (seen.add(a.group), true));
    if (rule.id === 'progress' && !evidence.some(e => e.id === 'INIT' || e.id === 'SPECIAL_EVENT')) evidence = [];
    if (rule.id === 'self' && !evidence.some(e => e.id === 'SELF')) evidence = [];
    if (rule.id === 'comfort' && !evidence.some(e => e.id === 'TOGETHER')) evidence = [];
    if (rule.id === 'mismatch' && !evidence.some(e => e.id === 'VOICE' || e.id === 'REPAIR')) evidence = [];
    if (evidence.length < this.rules.limits.minIndependentEvidence) return { id: rule.id, name: rule.name, level: null, label: rule.unknown, comment: rule.unknownComment, evidence: evidence.map(e => ({ id: e.id, answerId: e.answerId, label: e.label })) };
    const value = evidence.reduce((s, e) => s + rule.scores[e.tag], 0) / evidence.length;
    const level = value < rule.thresholds[0] ? 0 : value < rule.thresholds[1] ? 1 : 2;
    return { id: rule.id, name: rule.name, level, label: rule.labels[level], comment: rule.comments[level], evidence: evidence.map(e => ({ id: e.id, answerId: e.answerId, label: e.label })) };
  }
  results() {
    if (this.finished) return this.finished;
    const metrics = this.rules.metrics.map(r => this.metric(r));
    const special = this.special ? this.rules.specials[this.special] : null;
    let stock = null, type = null;
    const material = this.answers.filter(a => a.status === 'answered' && !['START', 'NEED'].includes(a.id));
    if (!special && material.length >= 3) {
      const typeId = this.rules.stockRules.find(r => r.tags.every(t => this.tags.has(t)))?.type;
      type = this.stocks.types.find(t => t.id === typeId);
      if (type?.stocks?.length) stock = type.stocks[Math.floor(this.random() * type.stocks.length) % type.stocks.length];
    }
    const closing = special?.closing || this.rules.endings.find(e => e.tags.every(t => this.tags.has(t))).text;
    this.finished = { metrics, closing, stock, type, summary: this.summary(), answerCount: this.answers.length, materialCount: material.length, special: this.special, route: this.route };
    this.stage = 'result'; return this.finished;
  }
}
