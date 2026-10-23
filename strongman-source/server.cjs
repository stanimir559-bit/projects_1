'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os');
const SM=require('./core.js');const dir=__dirname,dataDir=process.env.SM_DATA_DIR||path.join(dir,'server-data');fs.mkdirSync(dataDir,{recursive:true});
const htmlDir=fs.existsSync(path.join(dir,'strongman-arena.html'))?dir:path.resolve(dir,'../strongman');
const configFile=path.join(dataDir,'config.json'),stateFile=path.join(dataDir,'competition.json');
let config;if(fs.existsSync(configFile))config=JSON.parse(fs.readFileSync(configFile,'utf8'));else{config={key:crypto.randomBytes(12).toString('hex')};fs.writeFileSync(configFile,JSON.stringify(config));}
if(process.env.SM_KEY)config.key=process.env.SM_KEY;
let doc=null;if(fs.existsSync(stateFile)){doc=JSON.parse(fs.readFileSync(stateFile,'utf8'));SM.validate(doc.data);}
function save(next){const temp=stateFile+'.tmp';fs.writeFileSync(temp,JSON.stringify(next));if(fs.existsSync(stateFile))fs.copyFileSync(stateFile,stateFile+'.bak');fs.renameSync(temp,stateFile);doc=next;}
function equal(a,b){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, If-None-Match');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 const url=new URL(req.url,'http://localhost');url.pathname=url.pathname.replace(/^\/strongman\/api\//,'/api/');
 if(url.pathname==='/health'){res.setHeader('Content-Type','application/json');res.end('{"ok":true}');return;}
 if(['/visitors','/visitors.html','/strongman/visitors','/strongman/visitors.html'].includes(url.pathname)){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(htmlDir,'visitors.html')));return;}
 if(url.pathname==='/sw.js'){res.setHeader('Content-Type','application/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(htmlDir,'sw.js')));return;}
 if(url.pathname==='/'||url.pathname==='/strongman-arena.html'){if(req.method!=='GET'){res.writeHead(405);res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(htmlDir,'strongman-arena.html')));return;}
 if(!url.pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type','application/json; charset=utf-8');const reply=(status,obj)=>{res.writeHead(status);res.end(JSON.stringify(obj));};
 if(req.method==='GET'&&url.pathname==='/api/viewer'){if(!doc?.data.audience?.enabled){reply(404,{error:'VIEWER_DISABLED'});return;}const etag='"viewer-'+doc.revision+'"';res.setHeader('ETag',etag);if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}reply(200,{...SM.publicState(doc.data),revision:doc.revision});return;}
 if(!equal(req.headers.authorization||'','Bearer '+config.key)){reply(401,{error:'UNAUTHORIZED'});return;}
 if(req.method==='GET'&&url.pathname==='/api/state'){const etag='"'+(doc?.revision??-1)+'"';res.setHeader('ETag',etag);if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}reply(200,{doc});return;}
 if(req.method!=='POST'){reply(405,{error:'METHOD'});return;}
 try{
 req.setEncoding('utf8');let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>30000000){reply(413,{error:'TOO_LARGE'});return;}}
 const body=JSON.parse(raw);
 if(url.pathname==='/api/init'){if(doc){reply(409,{error:'EXISTS'});return;}SM.validateDocument(body.doc);save(body.doc);reply(200,{doc});return;}
 if(url.pathname==='/api/op'){if(!body.competitionId){reply(409,{error:'UPDATE_REQUIRED'});return;}if(!doc){reply(409,{error:'EMPTY'});return;}if(typeof body.actor!=='string'||body.actor.length>100||typeof body.label!=='string'||body.label.length>500||typeof body.at!=='string')throw Error('INVALID_OPERATION');const op={...body,receivedAt:new Date().toISOString()};SM.validateOperation(op);save(SM.apply(doc,op));reply(200,{doc});return;}
 reply(404,{error:'NOT_FOUND'});
 }catch(err){reply(err.message==='CONFLICT'?409:400,{error:err.message||'INVALID_DATA'});}
});
const port=Number(process.env.PORT||8787);server.listen(port,'0.0.0.0',()=>{console.log('\nSTRONGMAN ARENA — shared scoring server\n');console.log('Computer: http://localhost:'+port);for(const list of Object.values(os.networkInterfaces()))for(const address of list||[])if(address.family==='IPv4'&&!address.internal)console.log('Phones / Wi-Fi: http://'+address.address+':'+port);console.log('\nAccess code: '+config.key+'\n\nKeep this window open. Data is saved in server-data.\nFor internet access use an HTTPS reverse proxy. Do not expose plain HTTP publicly.\n');});
