import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const args=process.argv.slice(2), idx=args.indexOf('--port');
const port=Number(idx>=0?args[idx+1]:process.env.PORT||3000);
const root=path.resolve(args.includes('--dist')?'dist':'.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.ogg':'audio/ogg','.wav':'audio/wav','.png':'image/png','.json':'application/json'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  if(!args.includes('--dist')&&rel.startsWith('audio/')) rel='public/'+rel;
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)||rel.startsWith('reference/')||rel.split('/').some(p=>p.startsWith('.'))) {res.writeHead(403);res.end();return;}
  if(!(await stat(file)).isFile()) throw Error('Not file');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Solar web on http://localhost:${port}`));
