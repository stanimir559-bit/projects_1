(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const round=x=>Math.round((Number(x)+Number.EPSILON)*100)/100;
function number(x){if(typeof x==='number')return x;const s=String(x??'').trim().replace(',','.');return s===''?NaN:Number(s);}
function time(x){const s=String(x??'').trim().replace(',','.');if(!s.includes(':'))return number(s);if(!/^\d+:[0-5]\d(?:\.\d{1,2})?$/.test(s))return NaN;const [m,s2]=s.split(':').map(Number);return m*60+s2;}
const distanceUnit=e=>e.unit==='deg'?'°':'m';
const modes=['race','reps','max','hold','distance','series','medley','height','tiers','manual'];
function fresh(){return {schema:1,id:uid(),title:'',date:new Date().toLocaleDateString('en-CA'),venue:'',athletes:[],events:[],results:{},rules:{tie:'shared',zero:'zero'},phase:'setup'};}
function document(data=fresh()){return {schema:1,data,log:[],undo:[],redo:[],revision:0};}
function get(o,path){for(const key of path){if(o==null)return null;o=o[key];}return o===undefined?null:o;}
function put(o,path,value){let cur=o;path.slice(0,-1).forEach(k=>{if(!cur[k])cur[k]={};cur=cur[k];});if(value===null)delete cur[path.at(-1)];else cur[path.at(-1)]=clone(value);}
function putCopy(o,path,value){if(!path.length)return clone(value);const [key,...rest]=path,out=Array.isArray(o)?o.slice():{...o};if(rest.length)out[key]=putCopy(o?.[key],rest,value);else if(value===null)delete out[key];else out[key]=clone(value);return out;}
function operation(doc,changes,label,actor='Judge',extra={}){return {id:uid(),at:new Date().toISOString(),actor:actor.slice(0,100),label,competitionId:doc.data.id,changes:changes.map(c=>({path:c.path,prev:clone(Object.hasOwn(c,'prev')?c.prev:get(doc,c.path)),next:clone(c.next)})),...extra};}
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,150}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
function validateOperation(op){if(!op||!safeId(op.id)||typeof op.actor!=='string'||op.actor.length>100||typeof op.label!=='string'||op.label.length>500||typeof op.at!=='string'||!Number.isFinite(Date.parse(op.at))||!Array.isArray(op.changes)||!op.changes.length||op.changes.length>200||op.kind&&!['undo','redo'].includes(op.kind))throw Error('INVALID_OPERATION');for(const c of op.changes){if(!Array.isArray(c.path)||!c.path.length||c.path.length>8||c.path[0]!=='data'||c.path.some(p=>typeof p!=='string'||!p||['__proto__','constructor','prototype'].includes(p))||!Object.hasOwn(c,'prev')||!Object.hasOwn(c,'next'))throw Error('INVALID_PATH');}return true;}
function overlapping(changes){for(let i=0;i<changes.length;i++)for(let j=i+1;j<changes.length;j++){const a=changes[i].path,b=changes[j].path;if(a.slice(0,Math.min(a.length,b.length)).every((x,k)=>x===b[k]))return true;}return false;}
function matchesHistoryAction(op,target){return Boolean(target&&!target.kind&&op.changes.length===target.changes.length&&op.changes.every((change,i)=>JSON.stringify(change.path)===JSON.stringify(target.changes[i].path)&&JSON.stringify(change.next)===JSON.stringify(op.kind==='undo'?target.changes[i].prev:target.changes[i].next)));}
function validateDocument(doc){
 if(!doc||doc.schema!==1||!Array.isArray(doc.log)||!Array.isArray(doc.undo)||!Array.isArray(doc.redo)||!Number.isSafeInteger(doc.revision)||doc.revision<0||doc.revision!==doc.log.length)throw Error('INVALID_DOCUMENT');
 validate(doc.data);
 const ids=new Map(),undo=[],redo=[];
 for(const op of doc.log){
  validateOperation(op);
  if(ids.has(op.id)||overlapping(op.changes))throw Error('INVALID_DOCUMENT');
  if(op.kind==='undo'){
   if(!op.target||undo.at(-1)!==op.target||!matchesHistoryAction(op,ids.get(op.target)))throw Error('INVALID_DOCUMENT');
   undo.pop();redo.push(op.target);
  }else if(op.kind==='redo'){
   if(!op.target||redo.at(-1)!==op.target||!matchesHistoryAction(op,ids.get(op.target)))throw Error('INVALID_DOCUMENT');
   redo.pop();undo.push(op.target);
  }else{undo.push(op.id);redo.length=0;}
  ids.set(op.id,op);
 }
 if(JSON.stringify(doc.undo)!==JSON.stringify(undo)||JSON.stringify(doc.redo)!==JSON.stringify(redo))throw Error('INVALID_DOCUMENT');
 // Rewind to a possible base, then replay with the same precondition checks as apply().
 // Replaying avoids mistaking an auto-created empty parent for a corrupted snapshot.
 const current={data:clone(doc.data)};
 for(let i=doc.log.length-1;i>=0;i--)for(const change of doc.log[i].changes)put(current,change.path,change.prev);
 for(const op of doc.log){
  for(const change of op.changes)if(JSON.stringify(get(current,change.path))!==JSON.stringify(change.prev))throw Error('INVALID_DOCUMENT');
  for(const change of op.changes)put(current,change.path,change.next);
 }
 if(JSON.stringify(current.data)!==JSON.stringify(doc.data))throw Error('INVALID_DOCUMENT');
 return true;
}

function apply(doc,op){
 validateOperation(op);
 if(doc.log.some(x=>x.id===op.id))return doc;
 if(op.competitionId&&op.competitionId!==doc.data.id)throw Error('CONFLICT');
 if(op.kind==='undo'&&(!op.target||doc.undo.at(-1)!==op.target))throw Error('CONFLICT');
 if(op.kind==='redo'&&(!op.target||doc.redo.at(-1)!==op.target))throw Error('CONFLICT');
 if(op.kind&&!matchesHistoryAction(op,doc.log.find(entry=>entry.id===op.target)))throw Error('CONFLICT');
 for(const c of op.changes){if(!Array.isArray(c.path)||c.path[0]!=='data'||c.path.some(p=>['__proto__','constructor','prototype'].includes(p)))throw Error('INVALID_PATH');if(JSON.stringify(get(doc,c.path))!==JSON.stringify(c.prev))throw Error('CONFLICT');}
 if(overlapping(op.changes))throw Error('INVALID_PATH');
 const out={...doc,data:doc.data,log:doc.log.slice(),undo:doc.undo.slice(),redo:doc.redo.slice()};for(const c of op.changes)out.data=putCopy(out.data,c.path.slice(1),c.next);
 validate(out.data);
 out.log.push(clone(op));out.revision++;
 if(op.kind==='undo'){out.undo.pop();out.redo.push(op.target);}else if(op.kind==='redo'){out.redo.pop();out.undo.push(op.target);}else{out.undo.push(op.id);out.redo=[];}
 return out;
}
function reverse(doc,redo,actor){const ids=redo?doc.redo:doc.undo;const entry=doc.log.find(x=>x.id===ids.at(-1));if(!entry)return null;return operation(doc,entry.changes.map(c=>({path:c.path,next:redo?c.next:c.prev})),redo?'redo':'undo',actor,{kind:redo?'redo':'undo',target:entry.id});}
function validate(d){
 if(!d||d.schema!==1||!safeId(d.id)||!Array.isArray(d.athletes)||!Array.isArray(d.events)||!d.results||Array.isArray(d.results)||!d.rules||typeof d.title!=='string'||d.title.length>150||typeof d.venue!=='string'||d.venue.length>200||typeof d.date!=='string')throw Error('INVALID_DATA');
 if(d.athletes.length>150||d.events.length>50)throw Error('LIMIT');
 if(!['setup','live','finished'].includes(d.phase)||!['shared','countback','last'].includes(d.rules.tie)||!['zero','rank'].includes(d.rules.zero))throw Error('INVALID_RULES');
 const ids=new Set(),bibs=new Set();for(const a of d.athletes){if(!safeId(a.id)||ids.has(a.id)||typeof a.name!=='string'||!a.name.trim()||a.name.length>150||!Number.isSafeInteger(a.bib)||a.bib<1||a.bib>150||bibs.has(a.bib))throw Error('INVALID_ATHLETE');ids.add(a.id);bibs.add(a.bib);}
 const eids=new Set();for(const e of d.events){if(e.unit!==undefined&&(!['m','deg'].includes(e.unit)||e.mode!=='distance'))throw Error('INVALID_EVENT_UNIT');if(!e.id||eids.has(e.id)||!modes.includes(e.mode)||!e.names||typeof e.names.bg!=='string'||typeof e.names.en!=='string'||!['none','all','finishers'].includes(e.secondary)||!Number.isFinite(e.target)||e.target<0||!Number.isFinite(e.cap)||e.cap<0)throw Error('INVALID_EVENT');eids.add(e.id);}
 for(const [eid,rr] of Object.entries(d.results)){const e=d.events.find(x=>x.id===eid);if(!e)throw Error('INVALID_EVENT_RESULT');for(const [aid,r]of Object.entries(rr)){if(!ids.has(aid))throw Error('INVALID_ATHLETE_RESULT');validateResult(e,r);}}
 for(const e of d.events){if(!safeId(e.id)||e.names.bg.length>150||e.names.en.length>150||e.cap>1e9||e.target>1e9)throw Error('INVALID_EVENT');if(d.phase!=='setup'||e.reviewed){if(['race','series','medley'].includes(e.mode)&&e.target<=0||['series','medley'].includes(e.mode)&&!Number.isSafeInteger(e.target)||!['race','reps','series','medley','height'].includes(e.mode)&&e.secondary!=='none'||e.secondary==='finishers'&&!['series','medley'].includes(e.mode))throw Error('INVALID_EVENT');}}
 if(d.phase==='finished'&&(d.athletes.length<2||!d.events.length||!d.events.every(e=>d.athletes.every(a=>d.results[e.id]?.[a.id]))))throw Error('UNFINISHED_COMPETITION');
 if(d.audience!==undefined&&(!d.audience||typeof d.audience.enabled!=='boolean'))throw Error('INVALID_AUDIENCE');
 if(d.season!==undefined&&d.season!==null)validateSeason(d.season);
 return true;
}
function validateResult(e,r){
 if(!r||!['ok','dnf','zero','dns','wd','dq'].includes(r.status))throw Error('INVALID_STATUS');
 if(!Number.isFinite(r.penalty)||r.penalty<0||r.penalty>1e9||!Number.isFinite(r.deduction)||r.deduction<0||r.deduction>1e9||r.note!==undefined&&(typeof r.note!=='string'||r.note.length>4000))throw Error('INVALID_PENALTY');
 if((r.penalty||r.deduction)&&!r.note?.trim())throw Error('PENALTY_NOTE');
 if(['zero','dns','wd','dq'].includes(r.status))return true;
 const positive=(k,zero=false)=>{if(!Number.isFinite(r[k])||r[k]>1e9||r[k]<(zero?0:0.00001)||!zero&&round(r[k])<=0)throw Error('INVALID_'+k.toUpperCase());};
 if(r.status==='dnf'&&e.mode!=='race')throw Error('INVALID_DNF');
 switch(e.mode){
 case 'race':if(r.status==='ok'){positive('time');if(e.cap&&r.time>e.cap)throw Error('TIME_CAP');}else{positive('distance',true);if(e.target&&r.distance>=e.target)throw Error('DISTANCE_TARGET');if(e.secondary==='all'&&r.distance>0)positive('time');}break;
 case 'reps':positive('reps',true);if(!Number.isInteger(r.reps))throw Error('INTEGER');if(e.secondary==='all'&&r.reps>0)positive('time');break;
 case 'max':positive('weight',true);break;
 case 'hold':positive('time',true);if(e.cap&&r.time>e.cap)throw Error('TIME_CAP');break;
 case 'distance':positive('distance',true);break;
 case 'series':case 'medley':positive('count',true);if(!Number.isInteger(r.count)||e.target&&r.count>e.target)throw Error('COUNT_TARGET');if(e.mode==='medley'){positive('partial',true);if(r.count===e.target&&r.partial)throw Error('PARTIAL_FINISH');}if(r.count>0&&(e.secondary==='all'||e.secondary==='finishers'&&r.count===e.target)){positive('time');if(e.cap&&r.time>e.cap)throw Error('TIME_CAP');}break;
 case 'height':positive('height',true);if(e.secondary==='all'){positive('misses',true);positive('totalMisses',true);if(!Number.isInteger(r.misses)||!Number.isInteger(r.totalMisses)||r.misses>r.totalMisses)throw Error('INVALID_MISSES');}break;
 case 'tiers':for(const k of ['heavy','medium','light']){positive(k,true);if(!Number.isInteger(r[k]))throw Error('INTEGER');}break;
 case 'manual':positive('placing');if(!Number.isInteger(r.placing)||!r.note?.trim())throw Error('MANUAL_NOTE');break;
 }
 if(r.penalty&&!(e.mode==='race'&&r.status==='ok'||['reps','series','medley'].includes(e.mode)&&e.secondary!=='none'))throw Error('INVALID_TIME_PENALTY');
 return true;
}
function key(e,r){
 const t=round((r.time||0)+(r.penalty||0));
 switch(e.mode){
 case 'race':return r.status==='ok'?[1,-t,0]:[0,round(r.distance||0),e.secondary==='all'&&r.distance>0?-t:0];
 case 'reps':return [r.reps||0,e.secondary==='all'&&r.reps>0?-t:0];
 case 'max':return [round(r.weight||0)];case 'hold':return [round(r.time||0)];case 'distance':return [round(r.distance||0)];
 case 'series':case 'medley':return [r.count||0,e.mode==='medley'?round(r.partial||0):0,(e.secondary==='all'||e.secondary==='finishers'&&r.count===e.target)&&r.count>0?-t:0];
 case 'height':return [round(r.height||0),e.secondary==='all'?-(r.misses||0):0,e.secondary==='all'?-(r.totalMisses||0):0];
 case 'tiers':return [r.heavy||0,r.medium||0,r.light||0];case 'manual':return [-r.placing];
 }
}
function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const diff=(b[i]||0)-(a[i]||0);if(diff)return diff;}return 0;}
function zero(e,r){if(r.status==='zero')return true;if(r.status==='dnf')return !round(r.distance);switch(e.mode){case'race':return false;case'reps':return !r.reps;case'max':return !round(r.weight);case'hold':return !round(r.time);case'distance':return !round(r.distance);case'series':return !r.count;case'medley':return !r.count&&!round(r.partial);case'height':return !round(r.height);case'tiers':return !r.heavy&&!r.medium&&!r.light;case'manual':return false;}}
function eventScores(d,e){
 const n=d.athletes.length, rr=d.results[e.id]||{},rows=d.athletes.map(a=>({athlete:a,result:rr[a.id]||null,points:null,rank:null}));
 const active=rows.filter(row=>{const r=row.result;return r&&!['dns','wd','dq'].includes(r.status)&&(!zero(e,r)||d.rules.zero==='rank');});
 active.forEach(row=>row.key=zero(e,row.result)?[-Number.MAX_VALUE]:key(e,row.result));active.sort((a,b)=>compare(a.key,b.key));
 for(let i=0;i<active.length;){let j=i+1;while(j<active.length&&!compare(active[i].key,active[j].key))j++;const points=n-(i+j-1)/2;for(let k=i;k<j;k++){active[k].rank=i+1;active[k].tied=j-i>1;active[k].points=Math.max(0,round(points-(active[k].result.deduction||0)));}i=j;}
 rows.forEach(r=>{if(r.result&&r.points===null)r.points=0;});
 return rows.sort((a,b)=>(a.rank??999)-(b.rank??999)||a.athlete.bib-b.athlete.bib);
}
function standings(d,through=d.events.length){
 const events=d.events.slice(0,Math.max(0,Math.min(d.events.length,through)));
 const scores=events.map(e=>eventScores(d,e));const rows=d.athletes.map(a=>({athlete:a,events:scores.map(s=>s.find(r=>r.athlete.id===a.id)),total:0}));
 rows.forEach(r=>{r.total=round(r.events.reduce((s,e)=>s+(e.points||0),0));r.countback=Array.from({length:d.athletes.length},(_,i)=>r.events.filter(e=>e.rank===i+1).length);});
 const cmp=(a,b)=>{if(a.total!==b.total)return b.total-a.total;if(d.rules.tie==='countback')return compare(a.countback,b.countback);if(d.rules.tie==='last'&&events.length===d.events.length){const ar=a.events.at(-1),br=b.events.at(-1);return (ar?.rank??999)-(br?.rank??999);}return 0;};
 rows.sort((a,b)=>cmp(a,b)||a.athlete.bib-b.athlete.bib);rows.forEach((r,i)=>{r.rank=i&&!cmp(rows[i-1],r)?rows[i-1].rank:i+1;r.tied=rows.some(other=>other!==r&&!cmp(r,other));});return rows;
}
function seasonFresh(){return {id:uid(),title:'',year:new Date().getFullYear(),scale:[25,20,16,13,11,10,9,8,7,6,5,4,3,2,1],tie:'countback',closed:false,athletes:[],competitions:[]};}
function competitionSnapshot(d){const out={};for(const k of ['schema','id','title','date','venue','athletes','events','results','rules','phase'])out[k]=clone(d[k]);return out;}
function validateSeason(s){
 if(!s||!safeId(s.id)||typeof s.title!=='string'||!s.title.trim()||s.title.length>150||!Number.isInteger(s.year)||s.year<2000||s.year>2200||!['countback','shared'].includes(s.tie)||typeof s.closed!=='boolean'||!Array.isArray(s.scale)||!s.scale.length||s.scale.length>150||s.scale.some((v,i)=>!Number.isFinite(v)||v<0||i>0&&v>s.scale[i-1])||s.scale[0]<=0||!Array.isArray(s.athletes)||s.athletes.length>500||!Array.isArray(s.competitions)||s.competitions.length>40)throw Error('INVALID_SEASON');
 const ids=new Set();for(const a of s.athletes){if(!safeId(a.id)||ids.has(a.id)||typeof a.name!=='string'||!a.name.trim()||a.name.length>150)throw Error('INVALID_SEASON_ATHLETE');ids.add(a.id);}
 const rounds=new Set();for(const c of s.competitions){if(!c||c.id!==c.data?.id||rounds.has(c.id)||Object.hasOwn(c.data,'season')||Object.hasOwn(c.data,'audience'))throw Error('INVALID_ROUND');rounds.add(c.id);validate(c.data);if(c.data.phase!=='finished'||!c.data.events.length||!c.data.athletes.length||!c.data.events.every(e=>c.data.athletes.every(a=>c.data.results[e.id]?.[a.id])))throw Error('UNFINISHED_ROUND');if(!Array.isArray(c.entries)||c.entries.length!==c.data.athletes.length)throw Error('INVALID_ENTRIES');const seen=new Set(),local=new Set();for(const e of c.entries){if(!ids.has(e.seasonId)||seen.has(e.seasonId)||local.has(e.athleteId)||!c.data.athletes.some(a=>a.id===e.athleteId)||!['ranked','dns','dq'].includes(e.status))throw Error('INVALID_ENTRIES');seen.add(e.seasonId);local.add(e.athleteId);}}
 if(s.closed&&!seasonScores(s).some(r=>r.total>0))throw Error('NO_SEASON_WINNER');
 return true;
}
function seasonScores(s){
 const perRound=s.competitions.map(c=>{const standingsRows=standings(c.data);return c.entries.map(entry=>{const row=standingsRows.find(r=>r.athlete.id===entry.athleteId);let points=0;if(entry.status==='ranked'){const tied=standingsRows.filter(r=>r.rank===row.rank).length;for(let i=row.rank-1;i<row.rank-1+tied;i++)points+=s.scale[i]||0;points=round(points/tied);}return {...entry,rank:row.rank,points,total:row.total};});});
 const rows=s.athletes.map(a=>{const rounds=perRound.map(rr=>rr.find(r=>r.seasonId===a.id)||null);return {athlete:a,rounds,total:round(rounds.reduce((sum,r)=>sum+(r?.points||0),0)),starts:rounds.filter(r=>r&&r.status==='ranked').length,countback:Array.from({length:150},(_,i)=>rounds.filter(r=>r?.status==='ranked'&&r.rank===i+1).length)};}).filter(r=>r.rounds.some(Boolean));
 const cmp=(a,b)=>b.total-a.total||(s.tie==='countback'?compare(a.countback,b.countback):0);rows.sort((a,b)=>cmp(a,b)||a.athlete.name.localeCompare(b.athlete.name));rows.forEach((r,i)=>{r.rank=i&&!cmp(rows[i-1],r)?rows[i-1].rank:i+1;r.tied=rows.some(other=>other!==r&&!cmp(r,other));});return rows;
}
function publicCompetition(d){const out={schema:1,id:d.id,title:d.title,date:d.date,venue:d.venue,phase:d.phase,athletes:d.athletes,events:d.events};out.rules={tie:d.rules.tie,zero:d.rules.zero};out.athletes=out.athletes.map(a=>({id:a.id,bib:a.bib,name:a.name}));out.events=out.events.map(e=>({id:e.id,names:{bg:e.names.bg,en:e.names.en},mode:e.mode,target:e.target,cap:e.cap,secondary:e.secondary,...(e.unit!==undefined?{unit:e.unit}:{})}));const allowed=['status','penalty','deduction','reps','time','distance','weight','count','partial','height','misses','totalMisses','heavy','medium','light','placing'];out.results={};for(const e of out.events){out.results[e.id]={};for(const a of out.athletes){const r=d.results[e.id]?.[a.id];if(r){const clean={};for(const k of allowed)if(r[k]!==undefined)clean[k]=r[k];out.results[e.id][a.id]=clean;}}}return out;}
function publicState(d){const out={competition:publicCompetition(d),season:null};if(d.season){const s=d.season;out.season={id:s.id,title:s.title,year:s.year,scale:clone(s.scale),tie:s.tie,closed:s.closed,athletes:s.athletes.map(a=>({id:a.id,name:a.name})),competitions:s.competitions.map(c=>({id:c.id,data:publicCompetition(c.data),entries:c.entries.map(e=>({athleteId:e.athleteId,seasonId:e.seasonId,status:e.status}))}))};}return out;}
const csvCell=x=>{const s=String(x??'');return typeof x==='string'&&/^[\s\u0000-\u001f]*[=+@-]/.test(s)?"'"+s:s;};
const api={distanceUnit,clone,uid,round,number,time,modes,fresh,document,get,operation,apply,reverse,validate,validateResult,key,compare,zero,eventScores,standings,seasonFresh,competitionSnapshot,validateSeason,seasonScores,publicState,validateOperation,validateDocument,csvCell};
if(typeof module!=='undefined')module.exports=api;root.SM=api;
})(typeof window!=='undefined'?window:globalThis);
