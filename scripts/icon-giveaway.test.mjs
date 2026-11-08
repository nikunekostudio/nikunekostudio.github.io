import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {pages,origin} from './seo-catalog.mjs';
const route='/blog/icon-giveaway-202611/';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const html=read(route.slice(1)+'index.html');
const text=html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
test('campaign keeps the supplied introduction, prizes, entry steps and deadline',()=>{
 for(const value of ['🎁 アイコンプレゼント企画 🎁','株クラのあの人のアイコンも描いたおにくさんのアイコンがもらえる……？👀','フォロー＆リポストプレゼントキャンペーン！','🎨 イラスト：1名様','👾 ドット絵 36×36：1名様','🎮 ドット絵 24×24：3名様','✏️ 落書き風：5名様','@nikunekokikaku をフォロー','この投稿を引用リポスト','欲しいアイコンタイプをコメント','当選者にはDMでご連絡📩','ぜひお気軽にご参加ください！'])assert.ok(text.includes(value),value);
 assert.ok(html.includes('datetime="2026-11-15T23:59:00+09:00"'));
 assert.ok(text.includes('2026年11月15日 23:59'));assert.ok(text.includes('日本時間'));
 assert.match(html,/<a class="x-link" href="https:\/\/x.com\/nikunekokikaku"/);
});
test('all nine supplied participation rules are preserved',()=>{
 const terms=html.match(/<section class="terms"[\s\S]*?<\/section>/)[0];
 assert.equal([...terms.matchAll(/<li>/g)].length,9);
 for(const rule of [
 '応募はお一人様1回までです。複数アカウントでの応募はご遠慮ください',
 '引用リポストの際、希望するアイコンの種類を記載してください。',
 '当選者にはDMでご連絡します。DMを受け取れる設定でご参加ください。',
 '非公開アカウントは応募を確認できない場合があります。',
 '当選連絡後、７日以内にご返信がない場合は当選を無効とさせていただきます。',
 'アイコンの制作内容やお渡し時期は、当選後にご相談します。',
 '当選権利の譲渡・販売はできません。','本企画はX社とは関係ありません。','再配布、AI学習、加工等は禁止となります。'])assert.ok(terms.includes(rule),rule);
});
test('poster is the unmodified attachment and all local article links resolve',()=>{
 const png=fs.readFileSync(new URL('../blog/icon-giveaway-202611/images/campaign_quote_repost.png',import.meta.url));
 assert.equal(crypto.createHash('sha256').update(png).digest('hex'),'3fc41151b93eb2bec63b6c8104bfe1a6a7a0ab1461caf2c7bc2b91b2c18aedab');
 assert.equal(png.readUInt32BE(16),1672);assert.equal(png.readUInt32BE(20),941);
 for(const [,ref] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
  if(/^(?:https?:|#|mailto:)/.test(ref))continue;
  const url=new URL(ref,origin+route);const relative=url.pathname.slice(1)+(url.pathname.endsWith('/')?'index.html':'');
  assert.ok(fs.existsSync(new URL('../'+relative,import.meta.url)),ref);
 }
});
test('blog navigation, sitemap and bilingual share metadata include the new article',()=>{
 assert.ok(read('blog/index.html').includes('href="icon-giveaway-202611/"'));
 assert.ok(read('sitemap.xml').includes(`<loc>${origin+route}</loc>`));assert.ok(pages.some(page=>page.path===route));
 assert.equal([...html.matchAll(/<h1>/g)].length,1);
 assert.equal([...html.matchAll(/rel="canonical"/g)].length,1);assert.ok(html.includes(`href="${origin+route}"`));
 assert.ok(html.includes('property="og:type" content="article"'));assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
 const data=JSON.parse(html.match(/id="seo-language-data">(.*?)<\/script>/)[1]);assert.ok(data.enTitle.includes('Giveaway'));assert.ok(data.enDescription.includes('November 15, 2026'));
 assert.ok(!/name="robots"[^>]*noindex/.test(html));
});
