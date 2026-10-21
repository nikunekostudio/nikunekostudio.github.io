// Presentation metadata only. Game state, controls and storage are untouched.
(() => {
  function update() {
    const data = document.getElementById('seo-language-data');
    if (!data) return;
    const meta = JSON.parse(data.textContent);
    const english = new URLSearchParams(location.search).get('lang') === 'en';
    const title = english ? meta.enTitle : meta.title;
    const description = english ? meta.enDescription : meta.description;
    document.title = title;
    for (const [selector, value] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title], ['meta[property="og:description"]', description],
      ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', description]
    ]) document.querySelector(selector)?.setAttribute('content', value);
    // Query-language views are currently partial client-side translations, not
    // independently rendered translations. Keep one stable, official canonical.
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', meta.url);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update, {once:true});
  else update();
})();
