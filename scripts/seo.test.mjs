import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {pages,origin} from './seo-catalog.mjs';
const source=fs.readFileSync(new URL('../seo.js',import.meta.url),'utf8');
for(const lang of ['ja','en'])test(`metadata is stable and complete for ${lang}, including DOMContentLoaded ordering`,()=>{
  for(const p of pages){
    const html=fs.readFileSync(new URL('..'+p.path+'index.html',import.meta.url),'utf8');
    const data=JSON.parse(html.match(/id="seo-language-data">(.*?)<\/script>/s)[1]);
    for(const state of ['loading','interactive','complete']){
      const values={};let listener;
      const document={readyState:state,title:'previous title',getElementById:()=>({textContent:JSON.stringify(data)}),querySelector:s=>({setAttribute:(k,v)=>{values[s+':'+k]=v}}),addEventListener:(name,fn)=>{assert.equal(name,'DOMContentLoaded');listener=fn}};
      vm.runInNewContext(source,{document,location:{search:`?lang=${lang}&utm_source=test`},URLSearchParams});
      if(state==='loading')listener();
      assert.equal(document.title,lang==='en'?data.enTitle:data.title);
      assert.equal(values['meta[name="description"]:content'],lang==='en'?data.enDescription:data.description);
      assert.equal(values['link[rel="canonical"]:href'],origin+p.path);
      assert.equal(values['meta[property="og:url"]:content'],origin+p.path);
      assert.equal(values['meta[name="twitter:title"]:content'],document.title);
    }
  }
});
test('game runtime, storage, fetch, canvas and language state are not modified by SEO script',()=>{
  assert.ok(!/localStorage|sessionStorage|fetch\(|getContext|documentElement|\.lang\s*=/.test(source));
});
