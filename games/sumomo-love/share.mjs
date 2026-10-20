const TITLE = 'すももちゃんの恋の気配値相談室';

export function shareUrl(result, pageUrl) {
  // Explicit allowlist: never include answers, metrics, circumstances or summaries.
  const text = result.stock && result.type
    ? `『${TITLE}』の結果は「${result.type.label}」！\n企業にたとえるなら「${result.stock.companyName}」でした。`
    : `『${TITLE}』ですももちゃんに相談してみたよ。`;
  const params = new URLSearchParams({ text, hashtags: 'すももちゃんの恋の気配値相談室,にくねこスタジオ' });
  const page = new URL(pageUrl);
  // Local previews are not reachable by others. Do not share loopback URLs.
  if (page.protocol === 'https:' && ['nikuneko.com', 'www.nikuneko.com', 'nikunekostudio.github.io'].includes(page.hostname)) {
    params.set('url', `${page.origin}${page.pathname}`);
  }
  return `https://twitter.com/intent/tweet?${params}`;
}
