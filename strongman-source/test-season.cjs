const assert=require('node:assert/strict'),SM=require('./core.js');
const r=reps=>({status:'ok',reps,penalty:0,deduction:0,note:'PRIVATE referee note'});
function round(id,reps=[3,2,1],entries=['A','B','C']){const d=SM.fresh();Object.assign(d,{id,title:'Round '+id,phase:'finished',athletes:reps.map((_,i)=>({id:id+i,bib:i+1,name:['Ivan','Peter','Georgi'][i]})),events:[{id:'e',names:{bg:'Повторения',en:'Reps'},mode:'reps',target:0,cap:0,secondary:'none',notes:'PRIVATE event note'}],results:{e:{}}});d.athletes.forEach((a,i)=>d.results.e[a.id]=r(reps[i]));return {id,data:d,entries:d.athletes.map((a,i)=>({athleteId:a.id,seasonId:entries[i],status:'ranked'}))};}
const s=SM.seasonFresh();s.title='2026 League';s.athletes=[{id:'A',name:'Ivan'},{id:'B',name:'Peter'},{id:'C',name:'Georgi'}];s.competitions=[round('r1'),round('r2',[1,2,3])];SM.validateSeason(s);
assert.deepEqual(SM.seasonScores(s).map(r=>[r.athlete.id,r.total,r.rank]),[['C',41,1],['A',41,1],['B',40,3]]);
s.competitions[1]=round('r2',[1,3,2]);assert.deepEqual(SM.seasonScores(s).map(r=>[r.athlete.id,r.total]),[['B',45],['A',41],['C',36]]);
s.competitions=[round('r1',[3,3,1])];assert.deepEqual(SM.seasonScores(s).map(r=>r.total),[22.5,22.5,16]);
s.competitions[0].entries[0].status='dq';assert.equal(SM.seasonScores(s).find(r=>r.athlete.id==='A').total,0);
s.competitions=[round('r1'),round('r2',[3,2],['A','C'])];assert.equal(SM.seasonScores(s).find(r=>r.athlete.id==='B').rounds[1],null);assert.equal(SM.seasonScores(s).find(r=>r.athlete.id==='C').total,36);
const invalid=SM.clone(s);invalid.competitions[1].entries[1].seasonId='A';assert.throws(()=>SM.validateSeason(invalid),/INVALID_ENTRIES/);
const incomplete=SM.clone(s);delete incomplete.competitions[0].data.results.e.r10;assert.throws(()=>SM.validateSeason(incomplete),/UNFINISHED_/);
const nested=SM.clone(s);nested.competitions[0].data.season={};assert.throws(()=>SM.validateSeason(nested),/INVALID_ROUND/);
const invalidScale=SM.clone(s);invalidScale.scale=[20,25];assert.throws(()=>SM.validateSeason(invalidScale),/INVALID_SEASON/);
let doc=SM.document(SM.clone(s.competitions[0].data));doc.data.season=SM.clone(s);doc.data.audience={enabled:true};doc=SM.apply(doc,SM.operation(doc,[{path:['data','season','closed'],next:true}],'Finish season','PRIVATE JUDGE'));
const publicDoc=SM.publicState(doc.data);assert.ok(!JSON.stringify(publicDoc).includes('PRIVATE'));assert.ok(!Object.hasOwn(publicDoc,'log'));assert.ok(!Object.hasOwn(publicDoc.competition,'season'));assert.deepEqual(SM.seasonScores(publicDoc.season).map(r=>r.total),SM.seasonScores(s).map(r=>r.total));
doc=SM.apply(doc,SM.reverse(doc,false,'Judge'));assert.equal(doc.data.season.closed,false);
const reset=SM.fresh();reset.season=SM.clone(s);doc=SM.apply(doc,SM.operation(doc,[{path:['data'],next:reset}],'Next round'));assert.equal(doc.data.season.competitions.length,2);doc=SM.apply(doc,SM.reverse(doc,false,'Judge'));assert.equal(doc.data.id,'r1');
console.log('PASS season: fixed scale, annual ties/countback, round correction, ties average, DQ, absence, stable identity, duplicate mapping, incomplete/nested rounds, scale validation, public projection, undo and next round retention');


const noWinner=SM.clone(s);noWinner.closed=true;noWinner.competitions.forEach(c=>c.entries.forEach(e=>e.status='dns'));assert.throws(()=>SM.validateSeason(noWinner),/NO_SEASON_WINNER/);console.log('PASS no annual champion from an empty or all-DNS/DQ points table');
