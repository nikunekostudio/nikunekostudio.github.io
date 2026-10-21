// Combine the existing readings without changing scoring or stock selection.
export function reportParagraphs(result) {
  const comments = [...new Set(result.metrics.map(metric => metric.comment).filter(Boolean))];
  // Read as a short letter, not four separately graded categories.
  const paragraphs = [];
  for (let i = 0; i < comments.length; i += 2) paragraphs.push(comments.slice(i, i + 2).join(''));
  if (result.closing && !comments.includes(result.closing)) paragraphs.push(result.closing);
  return paragraphs;
}

export function reportClues(result) {
  return [...new Set([
    ...result.summary.facts,
    ...result.summary.confirmed,
    ...result.metrics.flatMap(metric => metric.evidence.map(item => item.label))
  ].filter(Boolean))];
}

export function renderResultReport(result, escape) {
  return `<section class="closing" aria-labelledby="result-report-title"><h2 id="result-report-title">すももちゃんのまとめ</h2>${reportParagraphs(result).map(text => `<p>${escape(text)}</p>`).join('')}</section>`;
}
