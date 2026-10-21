(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const round=x=>Math.round((Number(x)+Number.EPSILON)*100)/100;
function number(x){if(typeof x==='number')return x;const s=String(x??'').trim().replace(',','.');return s===''?NaN:Number(s);}
function time(x){const s=String(x??'').trim().replace(',','.');if(!s.includes(':'))return number(s);if(!/^\d+:[0-5]\d(?:\.\d{1,2})?$/.test(s))return NaN;const [m,s2]=s.split(':').map(Number);return m*60+s2;}
const modes=['race','reps','max','hold','distance','series','medley','height','tiers','manual'];
function fresh(){return {schema:1,id:uid(),title:'',date:new Date().toLocaleDateString('en-CA'),venue:'',athletes:[],events:[],results:{},rules:{tie:'shared',zero:'zero'},phase:'setup'};}
function document(data=fresh()){return {schema:1,data,log:[],undo:[],redo:[],revision:0};}
function get(o,path){for(const key of path){if(o==null)return null;o=o[key];}return o===undefined?null:o;}
function put(o,path,value){let cur=o;path.slice(0,-1).forEach(k=>{if(!cur[k])cur[k]={};cur=cur[k];});if(value===null)delete cur[path.at(-1)];else cur[path.at(-1)]=clone(value);}
function operation(doc,changes,label,actor='Judge',extra={}){return {id:uid(),at:new Date().toISOString(),actor:actor.slice(0,100),label,changes:changes.map(c=>({path:c.path,prev:clone(Object.hasOwn(c,'prev')?c.prev:get(doc,c.path)),next:clone(c.next)})),...extra};}
function apply(doc,op){
 if(doc.log.some(x=>x.id===op.id))return doc;
 if(!op||typeof op.id!=='string'||!Array.isArray(op.changes)||!op.changes.length)throw Error('INVALID_OPERATION');
 if(op.kind==='undo'&&doc.undo.at(-1)!==op.target)throw Error('CONFLICT');
 if(op.kind==='redo'&&doc.redo.at(-1)!==op.target)throw Error('CONFLICT');
 for(const c of op.changes){if(!Array.isArray(c.path)||c.path[0]!=='data'||c.path.some(p=>['__proto__','constructor','prototype'].includes(p)))throw Error('INVALID_PATH');if(JSON.stringify(get(doc,c.path))!==JSON.stringify(c.prev))throw Error('CONFLICT');}
 const out=clone(doc);for(const c of op.changes)put(out,c.path,c.next);
 validate(out.data);
 out.log.push(clone(op));out.revision++;
 if(op.kind==='undo'){out.undo.pop();out.redo.push(op.target);}else if(op.kind==='redo'){out.redo.pop();out.undo.push(op.target);}else{out.undo.push(op.id);out.redo=[];}
 return out;
}
function reverse(doc,redo,actor){const ids=redo?doc.redo:doc.undo;const entry=doc.log.find(x=>x.id===ids.at(-1));if(!entry)return null;return operation(doc,entry.changes.map(c=>({path:c.path,next:redo?c.next:c.prev})),redo?'redo':'undo',actor,{kind:redo?'redo':'undo',target:entry.id});}
function validate(d){
 if(!d||d.schema!==1||typeof d.id!=='string'||!Array.isArray(d.athletes)||!Array.isArray(d.events)||!d.results||!d.rules)throw Error('INVALID_DATA');
 if(d.athletes.length>150||d.events.length>50)throw Error('LIMIT');
 if(!['setup','live','finished'].includes(d.phase)||!['shared','countback','last'].includes(d.rules.tie)||!['zero','rank'].includes(d.rules.zero))throw Error('INVALID_RULES');
 const ids=new Set();for(const a of d.athletes){if(!a.id||ids.has(a.id)||typeof a.name!=='string'||!a.name.trim()||a.name.length>150)throw Error('INVALID_ATHLETE');ids.add(a.id);}
 const eids=new Set();for(const e of d.events){if(!e.id||eids.has(e.id)||!modes.includes(e.mode)||!e.names||typeof e.names.bg!=='string'||typeof e.names.en!=='string'||!['none','all','finishers'].includes(e.secondary)||!Number.isFinite(e.target)||e.target<0||!Number.isFinite(e.cap)||e.cap<0)throw Error('INVALID_EVENT');eids.add(e.id);}
 for(const [eid,rr] of Object.entries(d.results)){const e=d.events.find(x=>x.id===eid);if(!e)throw Error('INVALID_EVENT_RESULT');for(const [aid,r]of Object.entries(rr)){if(!ids.has(aid))throw Error('INVALID_ATHLETE_RESULT');validateResult(e,r);}}
 return true;
}
function validateResult(e,r){
 if(!r||!['ok','dnf','zero','dns','wd','dq'].includes(r.status))throw Error('INVALID_STATUS');
 if(!Number.isFinite(r.penalty)||r.penalty<0||!Number.isFinite(r.deduction)||r.deduction<0)throw Error('INVALID_PENALTY');
 if((r.penalty||r.deduction)&&!r.note?.trim())throw Error('PENALTY_NOTE');
 if(['zero','dns','wd','dq'].includes(r.status))return true;
 const positive=(k,zero=false)=>{if(!Number.isFinite(r[k])||r[k]<(zero?0:0.00001))throw Error('INVALID_'+k.toUpperCase());};
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
function zero(e,r){if(r.status==='zero')return true;if(r.status==='dnf')return !r.distance;switch(e.mode){case'race':return false;case'reps':return !r.reps;case'max':return !r.weight;case'hold':return !r.time;case'distance':return !r.distance;case'series':return !r.count;case'medley':return !r.count&&!r.partial;case'height':return !r.height;case'tiers':return !r.heavy&&!r.medium&&!r.light;case'manual':return false;}}
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
const api={clone,uid,round,number,time,modes,fresh,document,get,operation,apply,reverse,validate,validateResult,key,compare,zero,eventScores,standings};
root.SM=api;
})(typeof window!=='undefined'?window:globalThis);

export default globalThis.SM;
