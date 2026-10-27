const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB = path.join(DATA_DIR, 'database.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({version:1,updatedAt:new Date().toISOString(),storage:{}}, null, 2));

let state = JSON.parse(fs.readFileSync(DB,'utf8'));
let writeChain = Promise.resolve();
function save(){
  const tmp=DB+'.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state,null,2));
  fs.renameSync(tmp, DB);
}
function queueSave(){ writeChain=writeChain.then(()=>save()); return writeChain; }
function send(res,status,obj,headers={}){const body=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers,'Content-Length':body.length});res.end(body);}
function readBody(req){return new Promise((resolve,reject)=>{let d='';req.on('data',c=>{d+=c;if(d.length>2e6) req.destroy();});req.on('end',()=>{try{resolve(d?JSON.parse(d):{})}catch(e){reject(e)}});req.on('error',reject);});}
function safeKey(k){return String(k||'').replace(/[^a-zA-Z0-9._:-]/g,'_').slice(0,200);}

const server=http.createServer(async (req,res)=>{
  try{
    const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
    if(u.pathname==='/api/health') return send(res,200,{ok:true,version:'3.3',serverTime:new Date().toISOString()});
    if(u.pathname==='/api/storage' && req.method==='GET'){
      const prefix=u.searchParams.get('prefix')||'';
      const keys=Object.keys(state.storage).filter(k=>k.startsWith(prefix));
      return send(res,200,{keys});
    }
    if(u.pathname.startsWith('/api/storage/')){
      const key=safeKey(decodeURIComponent(u.pathname.slice('/api/storage/'.length)));
      if(req.method==='GET'){
        if(!(key in state.storage)) return send(res,404,{error:'not_found'});
        return send(res,200,{key,value:state.storage[key]});
      }
      if(req.method==='PUT'){
        const b=await readBody(req); if(typeof b.value!=='string') return send(res,400,{error:'value_must_be_string'});
        state.storage[key]=b.value; await queueSave(); return send(res,200,{ok:true,key});
      }
      if(req.method==='DELETE'){
        delete state.storage[key]; await queueSave(); return send(res,200,{ok:true,key});
      }
    }
    // Serve the application and static assets.
    let pathname=decodeURIComponent(u.pathname);
    if(pathname==='/'||pathname==='/index.html') pathname='/sistem-servis-indah-v3.3.html';
    const file=path.normalize(path.join(ROOT,pathname));
    if(!file.startsWith(ROOT)) return send(res,403,{error:'forbidden'});
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()) return send(res,404,{error:'not_found'});
    const ext=path.extname(file).toLowerCase();
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.jsx':'text/plain; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  }catch(e){console.error(e);send(res,500,{error:'server_error',message:e.message});}
});
server.listen(PORT,HOST,()=>console.log(`IPI Sistem Servis V3.3 running on http://localhost:${PORT}`));
