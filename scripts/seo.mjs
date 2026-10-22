import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pages, games, origin} from './seo-catalog.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const json = value => JSON.stringify(value).replaceAll('<','\\u003c');
const fileFor = p => p === '/' ? 'index.html' : `${p.slice(1)}index.html`;
const read = file => fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n');
const attr = (tag,key) => tag.match(new RegExp(`\\b${key}=["']([^"']*)["']`,'i'))?.[1];
const decode = s => s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
function oldMeta(html, name) {return [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(t=>attr(t,'name')===name||attr(t,'property')===name);}
function metadata(p, html) {
  return {...p,title:p.title||decode(html.match(/<title>([\s\S]*?)<\/title>/i)[1]),description:p.description||decode(attr(oldMeta(html,'description')||'','content')||p.enDescription),image:p.image||(attr(oldMeta(html,'og:image')||'','content')||'/assets/logo.png').replace('https://nikunekostudio.github.io','').replace(origin,''),url:origin+p.path};
}
function graph(m) {
  const org={'@type':'Organization','@id':origin+'/#organization',name:'にくねこスタジオ',alternateName:['Nikuneko Studio','にくねこ企画'],url:origin+'/',logo:origin+'/assets/logo.png',sameAs:['https://x.com/nikunekokikaku','https://suzuri.jp/nikuneko','https://www.youtube.com/@user-nikunekokikaku']};
  const nodes=m.path==='/'?[org,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Nikuneko Studio',alternateName:['にくねこスタジオ','にくねこ企画'],publisher:{'@id':org['@id']}}]:[];
  if(m.game&&!m.collection) nodes.push({'@type':'VideoGame','@id':m.url+'#game',name:m.name,alternateName:m.en,url:m.url,description:m.description,image:origin+m.image,genre:m.genre,gamePlatform:'Web browser',applicationCategory:'Game',isAccessibleForFree:true,playMode:'https://schema.org/SinglePlayer',publisher:{'@type':'Organization','@id':org['@id'],name:org.name,alternateName:org.alternateName,url:org.url}});
  if(m.path!=='/') {
    const crumbs=[{name:'Nikuneko Studio',item:origin+'/'}];
    if(m.path.startsWith('/games/')&&m.path!=='/games/') crumbs.push({name:'ゲーム一覧 / Games',item:origin+'/games/'});
    if(m.path.startsWith('/games/quiz/')&&m.path!=='/games/quiz/') crumbs.push({name:'株の常識クイズ',item:origin+'/games/quiz/'});
    if(m.path.startsWith('/blog/')&&m.path!=='/blog/') crumbs.push({name:'Blog',item:origin+'/blog/'});
    crumbs.push({name:m.name||m.title.split('|')[0].trim(),item:m.url});
    nodes.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
  }
  return {'@context':'https://schema.org','@graph':nodes};
}
function gameInfo(m, html) {
  const heading=/<h1\b/i.test(html)?'h2':'h1';
  const related=m.related.map(slug=>games.find(g=>g.slug===slug));
  const subheading=heading==='h1'?'h2':'h3';
  return `<!-- game-info:start -->
<details class="game-info${m.slug==='tobe-oniku'?' game-info--fullscreen':''}">
  <summary>ゲーム紹介・関連ゲーム / About this game</summary>
  <${heading}>${esc(m.name)} / <span lang="en">${esc(m.en)}</span></${heading}>
  <div lang="ja"><p>${esc(m.description)}</p><${subheading}>特徴</${subheading}><p>${esc(m.features)}</p></div>
  <div lang="en"><${subheading}>About ${esc(m.en)}</${subheading}><p>${esc(m.enDescription)}</p><p>${esc(m.enFeatures)}</p><p>Free to play in your browser. No app installation required.${['kabukura225','sumomo-love'].includes(m.slug)?' The game dialogue is in Japanese.':''}</p></div>
  <${subheading}>関連ゲーム / More games</${subheading}>
  <ul>${related.map(g=>`<li><a href="/games/${g.slug}/">${esc(g.name)} / <span lang="en">${esc(g.en)}</span></a></li>`).join('')}</ul>
  <p><a href="/games/">すべてのゲーム / All browser games</a></p>
</details>
<!-- game-info:end -->\n`;
}
function render(p, input) {
  const m=metadata(p,input);
  let html=input.replace(/<html(?:\s[^>]*)?>/i,'<html lang="ja">');
  html=html.replace(/<!-- game-info:start -->[\s\S]*?<!-- game-info:end -->\n?/g,'');
  html=html.replace(/<script\b[^>]*type=["']application\/(?:ld\+json|json)["'][^>]*>[\s\S]*?<\/script>/gi,t=>t.includes('application/ld+json')||t.includes('seo-language-data')?'':t);
  html=html.replace(/<meta\b[^>]*>/gi,t=>/^(?:description|robots|twitter:.*|og:.*)$/.test(attr(t,'name')||attr(t,'property')||'')?'':t);
  html=html.replace(/<link\b[^>]*>/gi,t=>['canonical'].includes(attr(t,'rel'))||['/seo.css'].includes(attr(t,'href'))?'':t);
  html=html.replace(/<script\b[^>]*src=["']\/seo.js["'][^>]*><\/script>/gi,'');
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(m.title)}</title>`);
  const head=`
  <meta name="description" content="${esc(m.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${m.url}">
  <meta property="og:type" content="${m.path.startsWith('/blog/')&&m.path!=='/blog/'?'article':'website'}">
  <meta property="og:site_name" content="Nikuneko Studio">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:title" content="${esc(m.title)}">
  <meta property="og:description" content="${esc(m.description)}">
  <meta property="og:url" content="${m.url}">
  <meta property="og:image" content="${origin+m.image}">
  <meta property="og:image:alt" content="${esc(m.name||m.title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@nikunekokikaku">
  <meta name="twitter:title" content="${esc(m.title)}">
  <meta name="twitter:description" content="${esc(m.description)}">
  <meta name="twitter:image" content="${origin+m.image}">
  <meta name="twitter:image:alt" content="${esc(m.name||m.title)}">
  <script type="application/ld+json">${json(graph(m))}</script>
  <script type="application/json" id="seo-language-data">${json({title:m.title,description:m.description,enTitle:m.enTitle,enDescription:m.enDescription,url:m.url})}</script>
  ${m.game?'<link rel="stylesheet" href="/seo.css">':''}
  <script src="/seo.js" defer></script>
`;
  html=html.replace('</head>',head+'</head>');
  if(m.game) {
    const anchor=html.includes('<footer')?'<footer':'</body>';
    html=html.replace(anchor,gameInfo(m,html)+anchor);
  }
  // Fix a skipped heading level without changing the article's typography.
  if(m.path==='/blog/nakano-broadway/') html=html.replaceAll('<h3>','<h2 class="article-subheading">').replaceAll('<h2 style="font-size:inherit">','<h2 class="article-subheading">').replaceAll('</h3>','</h2>');
  return html.replace(/[ \t]+$/gm,'').replace(/\n{3,}/g,'\n\n');
}
function patch(file, next) {
  const old=fs.existsSync(path.join(root,file))?read(file):null;
  if(old===next) return '';
  return old===null?`*** Add File: ${file}\n${next.replace(/\n$/,'').split('\n').map(l=>'+'+l).join('\n')}\n`:`*** Update File: ${file}\n@@\n${old.replace(/\n$/,'').split('\n').map(l=>'-'+l).join('\n')}\n${next.replace(/\n$/,'').split('\n').map(l=>'+'+l).join('\n')}\n`;
}
const command=process.argv[2];
if(command==='--patch') {
  const wanted=process.argv[3];
  let changes='';
  for(const p of pages) if(!wanted||wanted===fileFor(p.path)) changes+=patch(fileFor(p.path),render(p,read(fileFor(p.path))));
  process.stdout.write(changes?'*** Begin Patch\n'+changes+'*** End Patch\n':'');
} else if(command==='--sitemap-patch') {
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>`  <url><loc>${origin+p.path}</loc></url>`).join('\n')+'\n</urlset>\n';
  process.stdout.write('*** Begin Patch\n'+patch('sitemap.xml',sitemap)+patch('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)+'*** End Patch\n');
} else if(command==='--check') {
  const titles=new Set();
  let localLinks=0;
  for(const p of pages) {
    const html=read(fileFor(p.path));
    const count=regex=>[...html.matchAll(regex)].length;
    assert.equal(count(/<title>/g),1,p.path+' title');
    assert.equal(count(/name="description"/g),1,p.path+' description');
    assert.equal(count(/rel="canonical"/g),1,p.path+' canonical');
    assert.ok(html.includes(`href="${origin+p.path}"`),p.path+' canonical target');
    for(const tag of html.matchAll(/<(?:meta|link)\b[^>]*>/g))assert.ok(!tag[0].includes('nikunekostudio.github.io'),p.path+' old metadata domain');
    assert.ok(!/name="robots"[^>]*noindex/.test(html),p.path+' noindex');
    assert.ok(html.includes('<html lang="ja">'),p.path+' lang');
    const title=html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title),'duplicate title'); titles.add(title);
    for(const tag of html.matchAll(/<script[^>]*type="application\/(ld\+json|json)"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(tag[2]);
    const img=attr(oldMeta(html,'og:image'),'content');
    assert.ok(/\.(png|jpe?g|webp)$/.test(img),p.path+' raster OGP');
    assert.ok(fs.existsSync(path.join(root,new URL(img).pathname)),p.path+' image exists');
    assert.ok(html.includes('twitter:image:alt'),p.path+' Twitter alt');
    if(p.game) {
      assert.ok(html.includes(p.enDescription),p.path+' static English');
      assert.ok(html.includes(p.description),p.path+' static Japanese');
      assert.ok(html.includes('game-info:start'),p.path+' introduction');
    }
    // All static local links and resource URLs in important HTML must resolve.
    for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const raw=decode(match[1]);
      if(/^(?:#|mailto:|tel:|data:)/.test(raw)) continue;
      const u=new URL(raw,origin+p.path);
      if(u.origin!==origin) continue;
      let filename=decodeURIComponent(u.pathname).replace(/^\//,'');
      if(u.pathname.endsWith('/'))filename+='index.html';
      assert.ok(fs.existsSync(path.join(root,filename)),`${p.path} broken link ${raw}`);
      localLinks++;
    }
  }
  const sitemap=read('sitemap.xml');
  assert.equal([...sitemap.matchAll(/<loc>/g)].length,pages.length);
  for(const p of pages)assert.ok(sitemap.includes(origin+p.path),'sitemap '+p.path);
  assert.ok(!sitemap.includes('playtest'));
  assert.ok(read('404.html').includes('noindex'));
  console.log(`PASS: ${pages.length} pages; unique metadata, JSON-LD, raster OGP, bilingual game HTML, ${localLinks} local links/resources, sitemap and 404.`);
} else if(command==='--report') {
  console.log('| Game / URL | Japanese title | English title | Japanese description | English description |\n|---|---|---|---|---|');
  for(const g of games)console.log(`| [${g.name}](${origin}/games/${g.slug}/) | ${g.title} | ${g.enTitle} | ${g.description} | ${g.enDescription} |`);
} else throw new Error('Use --patch [file], --sitemap-patch, --check or --report');
