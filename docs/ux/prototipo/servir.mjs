import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../work/cauce-experiencia');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.woff2':'font/woff2','.webm':'video/webm','.mp4':'video/mp4'};
const frames=path.resolve(root,'../../work/cauce-ux/frames');
await fs.mkdir(frames,{recursive:true});
http.createServer(async(req,res)=>{
 try{
  const frameMatch=req.url.match(/^\/capture-frame\/(\d{1,3})$/);
  if(req.method==='POST'&&(req.url==='/capture'||frameMatch)){
   if(req.headers.origin!=='http://127.0.0.1:8851'){res.writeHead(403).end();return;}
   if(frameMatch&&Number(frameMatch[1])>899){res.writeHead(400).end();return;}
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>(frameMatch?2:30)*1024*1024){res.writeHead(413).end();return;}chunks.push(chunk);}
   const target=frameMatch?path.join(frames,String(Number(frameMatch[1])).padStart(5,'0')+'.jpg'):path.join(root,'recorrido-demo.webm');
   await fs.writeFile(target,Buffer.concat(chunks));res.writeHead(200,{'Content-Type':'application/json'}).end('{"saved":true}');return;
  }
  if(req.method!=='GET'){res.writeHead(405).end();return;}
  const requested=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);const target=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const body=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
 }catch{res.writeHead(404).end('Not found');}
}).listen(8851,'127.0.0.1',()=>console.log('Local URL: http://127.0.0.1:8851/'));
