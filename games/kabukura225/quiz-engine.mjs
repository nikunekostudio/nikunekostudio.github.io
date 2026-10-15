// Pure-data reference engine. Integer arithmetic avoids rounding-based ties.
// Session state is JSON-serializable. Persist it, not only its seed, for resume.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const mapQuestions = data => new Map(data.questions.map(q => [q.id, q]));
function assertDataVersion(data, session) {
  if (data.data_version !== session.dataVersion) throw new Error('Session data version mismatch');
}
function canAdd(candidate, selected, config) {
  return selected.filter(q => q.similar_group === candidate.similar_group).length < config.max_per_similar_group
    && selected.filter(q => q.scene === candidate.scene).length < config.max_per_scene;
}
function chooseBase(data, seed) {
  const random = rng(seed);
  const axisIds = data.axes.map(a => a.id);
  const firstRound = shuffle(axisIds, random);
  const secondRound = shuffle(axisIds, random);
  if (secondRound[0] === firstRound.at(-1)) {
    [secondRound[0], secondRound[1]] = [secondRound[1], secondRound[0]];
  }
  const firstDirections = Object.fromEntries(axisIds.map(id => [id, random() < 0.5 ? 1 : -1]));
  const slots = [...firstRound.map(axis => ({axis, direction:firstDirections[axis]})),
    ...secondRound.map(axis => ({axis, direction:-firstDirections[axis]}))];
  const candidates = slots.map(slot => shuffle(data.questions.filter(q => q.axis_id === slot.axis && q.direction === slot.direction), random));
  function search(index, selected) {
    if (index === slots.length) return selected;
    for (const question of candidates[index]) {
      if (!canAdd(question, selected, data.config)) continue;
      const solution = search(index + 1, [...selected, question]);
      if (solution) return solution;
    }
    return null;
  }
  const result = search(0, []);
  if (!result) throw new Error('Question pool cannot satisfy sampling constraints');
  return result.map(q => q.id);
}
export function createSession(data, seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) throw new Error('Seed must be uint32');
  return {dataVersion:data.data_version, seed, baseIds:chooseBase(data, seed), followupIds:[], answers:{}};
}
function axisStats(data, session, ids = [...session.baseIds, ...session.followupIds]) {
  const lookup = mapQuestions(data);
  return data.axes.map(axis => {
    const contributions = ids.filter(id => lookup.get(id).axis_id === axis.id && Object.hasOwn(session.answers,id))
      .map(id => lookup.get(id).score_units[session.answers[id]]);
    const sumUnits = contributions.reduce((s,x) => s+x,0);
    const mixed = contributions.some(x => x>0) && contributions.some(x => x<0);
    const sign = Math.sign(sumUnits);
    const side = sign>0 ? axis.positive : sign<0 ? axis.negative : null;
    return {axisId:axis.id, count:contributions.length, sumUnits, score:sumUnits/data.config.integer_scale,
      sign, side, mixed, displayLabel:side ? (mixed ? `やや${side}寄り（場面で変わる傾向）` : `${side}寄り`) : '中間',
      // Describes observed answers only: this is NOT a validated confidence level.
      evidenceLabel:contributions.length ? (mixed ? `${contributions.length}問の回答が分かれた` : `${contributions.length}問で方向が一致`) : '未回答'};
  });
}
function requiredFollowups(data, session) {
  const initial = axisStats(data, session, session.baseIds);
  const tieOrder = shuffle(data.axes.map(a => a.id), rng((session.seed ^ 0xA5A5A5A5) >>> 0));
  return initial.filter(a => a.count === data.config.base_per_axis && a.mixed)
    .sort((a,b) => Math.abs(a.sumUnits)-Math.abs(b.sumUnits) || tieOrder.indexOf(a.axisId)-tieOrder.indexOf(b.axisId));
}
function planFollowups(data, session) {
  const lookup = mapQuestions(data);
  const required = requiredFollowups(data, session);
  const random = rng((session.seed ^ 0x13579BDF) >>> 0);
  const candidates = required.map(a => shuffle(data.questions.filter(q => q.axis_id === a.axisId), random));
  const base = session.baseIds.map(id => lookup.get(id));
  function search(index, selected) {
    if (index === required.length) return selected;
    for (const q of candidates[index]) {
      if (!canAdd(q, [...base,...selected],data.config)) continue;
      const result = search(index+1,[...selected,q]);
      if (result) return result;
    }
    return null;
  }
  const result = search(0,[]);
  if (!result) throw new Error('Question pool cannot satisfy followup constraints');
  return result.map(q => q.id);
}
export function nextQuestion(data, session) {
  assertDataVersion(data, session);
  const lookup = mapQuestions(data);
  const unansweredBase = session.baseIds.find(id => !Object.hasOwn(session.answers,id));
  if (unansweredBase) return lookup.get(unansweredBase);
  // Deterministic from seed plus base answers; calling this twice does not add questions.
  const planned = planFollowups(data,session);
  if (planned.length !== session.followupIds.length || planned.some((id,i) => id !== session.followupIds[i])) {
    if (session.followupIds.some(id => Object.hasOwn(session.answers,id))) throw new Error('Base answers changed without editAnswer');
    session.followupIds = planned;
  }
  const nextId = session.followupIds.find(id => !Object.hasOwn(session.answers,id));
  return nextId ? lookup.get(nextId) : null;
}
export function answerQuestion(data, session, questionId, optionId) {
  if (!data.answer_options.some(o => o.id === optionId)) throw new Error('Invalid option');
  const expected = nextQuestion(data,session);
  if (!expected || expected.id !== questionId) throw new Error('Answer only the current question');
  session.answers[questionId] = optionId;
  return session;
}
export function editAnswer(data, session, questionId, optionId) {
  assertDataVersion(data, session);
  if (!Object.hasOwn(session.answers,questionId)) throw new Error('Cannot edit an unanswered question');
  if (!data.answer_options.some(o => o.id === optionId)) throw new Error('Invalid option');
  if (session.answers[questionId] === optionId) return session;
  if (session.baseIds.includes(questionId)) {
    // Earlier answer edits may change required axes and context exclusions.
    for (const id of session.followupIds) delete session.answers[id];
    session.followupIds = [];
  }
  session.answers[questionId] = optionId;
  return session;
}
export function getResult(data, session) {
  const next = nextQuestion(data,session);
  const axes = axisStats(data,session);
  const count = Object.keys(session.answers).length;
  const complete = next === null;
  const type = complete ? data.types.find(t => axes.every(a => t.axis_signs[a.axisId] === a.sign)) : null;
  if (complete && (!type || axes.some(a => a.count < 2 || a.count > 3 || !a.sign))) {
    throw new Error('Invalid final classification');
  }
  return {complete, answered:count, nextQuestionId:next?.id??null,
    plannedTotal:session.baseIds.length + session.followupIds.length,
    maxTotal:data.config.max_questions, typeId:type?.id??null,
    axes, hasContextDependentAxes:axes.some(a => a.mixed),
    note:axes.some(a => a.mixed) ? '場面によって回答が変わる軸があります。今回は多かった傾向で分類しています。' : '今回の回答で一致した傾向から分類しています。'};
}
