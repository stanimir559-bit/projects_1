import SM from './scoring.mjs';
const PREFIX='/strongman/api/';
const viewerMemo=new WeakMap();
const headers={
 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Content-Type, If-None-Match',
 'Access-Control-Allow-Methods':'GET, POST, OPTIONS','X-Content-Type-Options':'nosniff'
};
const reply=(status,body,extra={})=>new Response(status===304||status===204?null:JSON.stringify(body),{status,headers:{...headers,...extra}});
async function authorised(request,key){if(!key||key.length<16)return false;const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));const [a,b]=await Promise.all([digest(request.headers.get('Authorization')||''),digest('Bearer '+key)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;}
async function bodyText(request){const reader=request.body?.getReader();if(!reader)return '';const decoder=new TextDecoder(),parts=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>30000000){await reader.cancel();throw Error('TOO_LARGE');}parts.push(decoder.decode(value,{stream:true}));}parts.push(decoder.decode());return parts.join('');}
async function load(db){
 const [head,chunks]=await db.batch([
 db.prepare('SELECT revision, snapshot FROM sm_head WHERE id = 1'),
 db.prepare('SELECT s.content FROM sm_snapshots s JOIN sm_head h ON h.snapshot = s.snapshot WHERE h.id = 1 ORDER BY s.part')]);
 if(!head.results.length)return null;
 return {head:head.results[0],doc:JSON.parse(chunks.results.map(x=>x.content).join(''))};
}
async function store(db,next,previous){
 const snapshot=crypto.randomUUID(),text=JSON.stringify(next);if(new TextEncoder().encode(text).length>30000000)throw Error('TOO_LARGE');
 const parts=[];for(let i=0;i<text.length;){let end=Math.min(i+300000,text.length);const last=text.charCodeAt(end-1);if(end<text.length&&last>=0xd800&&last<=0xdbff)end--;parts.push(text.slice(i,end));i=end;}
 if(parts.length>80)throw Error('TOO_LARGE');
 const sql=[],expected=previous?.head;
 for(let i=0;i<parts.length;i++)sql.push(expected?
 db.prepare('INSERT INTO sm_snapshots(snapshot, part, content) SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM sm_head WHERE id = 1 AND revision = ? AND snapshot = ?)').bind(snapshot,i,parts[i],expected.revision,expected.snapshot):
 db.prepare('INSERT INTO sm_snapshots(snapshot, part, content) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM sm_head WHERE id = 1)').bind(snapshot,i,parts[i]));
 const headIndex=sql.length;
 sql.push(expected?db.prepare('UPDATE sm_head SET revision = ?, snapshot = ? WHERE id = 1 AND revision = ? AND snapshot = ?').bind(next.revision,snapshot,expected.revision,expected.snapshot):db.prepare('INSERT OR IGNORE INTO sm_head(id, revision, snapshot) VALUES (1, ?, ?)').bind(next.revision,snapshot));
 sql.push(db.prepare('DELETE FROM sm_snapshots WHERE snapshot <> (SELECT snapshot FROM sm_head WHERE id = 1)'));
 const out=await db.batch(sql);return out[headIndex].meta.changes===1;
}
export async function handleAPI(request,env){
 if(request.method==='OPTIONS')return reply(204);
 const endpoint=new URL(request.url).pathname.slice(PREFIX.length);
 if(request.method==='GET'&&endpoint==='viewer'){
 if(!env.SM_DB)return reply(503,{error:'NOT_CONFIGURED'});
 try{const db=env.SM_DB.withSession?env.SM_DB.withSession('first-primary'):env.SM_DB;const head=await db.prepare('SELECT revision FROM sm_head WHERE id = 1').first();if(!head)return reply(404,{error:'VIEWER_DISABLED'});let cached=viewerMemo.get(env.SM_DB);if(!cached||cached.revision!==head.revision){const state=await load(db);cached={revision:state.doc.revision,enabled:!!state.doc.data.audience?.enabled,body:null};if(cached.enabled)cached.body=JSON.stringify({...SM.publicState(state.doc.data),revision:state.doc.revision});viewerMemo.set(env.SM_DB,cached);}if(!cached.enabled)return reply(404,{error:'VIEWER_DISABLED'});const etag='"viewer-'+cached.revision+'"';if(request.headers.get('If-None-Match')===etag)return reply(304,null,{ETag:etag});return new Response(cached.body,{status:200,headers:{...headers,ETag:etag}});}catch{return reply(503,{error:'UNAVAILABLE'});}
 }
 if(!env.SM_DB||!env.SM_KEY||env.SM_KEY.length<16)return reply(503,{error:'NOT_CONFIGURED',message:'Set the SM_DB D1 binding, run schema.sql and add a 16+ character SM_KEY secret in Cloudflare.'});
 if(!await authorised(request,env.SM_KEY))return reply(401,{error:'UNAUTHORIZED'});
 const db=env.SM_DB.withSession?env.SM_DB.withSession('first-primary'):env.SM_DB;
 try{
 if(request.method==='GET'&&endpoint==='state'){
 const head=await db.prepare('SELECT revision FROM sm_head WHERE id = 1').first();
 if(head&&request.headers.get('If-None-Match')==='"'+head.revision+'"')return reply(304,null,{ETag:'"'+head.revision+'"'});
 const state=await load(db);return reply(200,{doc:state?.doc||null},{ETag:'"'+(state?.doc.revision??-1)+'"'});
 }
 if(request.method!=='POST')return reply(405,{error:'METHOD'});
 if(Number(request.headers.get('Content-Length')||0)>30000000)return reply(413,{error:'TOO_LARGE'});
 const raw=await bodyText(request);const body=JSON.parse(raw);
 if(endpoint==='init'){
 SM.validateDocument(body.doc);
 if(!await store(db,body.doc,null))return reply(409,{error:'EXISTS'});return reply(200,{doc:body.doc});
 }
 if(endpoint==='op'){
 if(!body.competitionId)return reply(409,{error:'UPDATE_REQUIRED'});
 if(typeof body.actor!=='string'||body.actor.length>100||typeof body.label!=='string'||body.label.length>500||typeof body.at!=='string'||typeof body.id!=='string'||body.id.length>150)throw Error('INVALID_OPERATION');
 const op={...body,receivedAt:new Date().toISOString()};
 SM.validateOperation(op);
 // CAS covers the entire snapshot. Independent rows are rebased and retried;
 // a changed value at the same path is a referee-visible conflict.
 for(let retry=0;retry<5;retry++){
 const current=await load(db);if(!current)return reply(409,{error:'EMPTY'});
 if(current.doc.log.some(x=>x.id===op.id))return reply(200,{doc:current.doc});
 const next=SM.apply(current.doc,op);if(await store(db,next,current))return reply(200,{doc:next});
 }
 return reply(503,{error:'BUSY'});
 }
 return reply(404,{error:'NOT_FOUND'});
 }catch(err){if(err.message==='CONFLICT')return reply(409,{error:'CONFLICT'});if(err.message==='TOO_LARGE')return reply(413,{error:'TOO_LARGE'});if(err.message?.includes('no such table'))return reply(503,{error:'SCHEMA_MISSING'});return reply(400,{error:'INVALID_DATA'});}
}
export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path.startsWith(PREFIX))return handleAPI(request,env);return env.ASSETS.fetch(request);}};
