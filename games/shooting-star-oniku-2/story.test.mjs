import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('approved opening, stage and ending story text is used in the game',()=>{
  const source=fs.readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
  for(const text of ['キッシーダに文句を言いに','キッシーダに文句を伝えに','キッシーダは潮風の向こうへ','キッシーダは眼鏡屋にいる','文句、届けた！','キッシーダは、たまった文句を受け取った。','おにくの旅は、ひとまずおしまい。'])assert(source.includes(text),text);
  for(const text of ['キッシーダに文句をいいに','文句を届ける旅が、はじまる。','キッシーダに、たまった文句を届けた。'])assert(!source.includes(text),text);
});
