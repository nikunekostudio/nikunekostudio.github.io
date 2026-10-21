const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.mp3':'audio/mpeg','.aac':'audio/aac','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const size=fs.statSync(file).size;
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    let start=0,end=size-1;const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
    headers['Content-Length']=end-start+1;res.writeHead(range?206:200,headers);
    if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(root,'404.html')).pipe(res);}
}).listen(4181,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4181/games/'));
