const assert=require('node:assert/strict'),SM=require('./core'),Demo=require('./demo-data'),fs=require('node:fs');
const original=SM.document();original.data.title='PRIVATE REAL CONTEST';const before=JSON.stringify(original),steps=Demo.build(SM);
assert.equal(steps.length,28);assert.equal(JSON.stringify(original),before);
assert.equal(new Set(steps.map(s=>s.id)).size,28);
for(const s of steps){SM.validateDocument(s.record.doc);assert.ok(s.title.bg&&s.title.en&&s.body.bg&&s.body.en);assert.ok(!JSON.stringify(s).includes('PRIVATE REAL CONTEST'));if(s.record.sync)assert.equal(new URL(s.record.sync.url).hostname,'demo.invalid');for(const q of s.record.queue)SM.validateOperation(q);}
const truck=steps.find(s=>s.id==='review').record.doc;assert.deepEqual(SM.eventScores(truck.data,truck.data.events[0]).map(x=>x.points),[4,3,1.5,1.5]);
const end=steps.find(s=>s.id==='exports').record.doc;assert.equal(end.data.phase,'finished');assert.equal(SM.standings(end.data)[0].total,10.5);
const undo=SM.apply(end,SM.reverse(end));assert.equal(undo.data.phase,'live');assert.equal(SM.apply(undo,SM.reverse(undo,true)).data.phase,'finished');
const offline=steps.find(s=>s.id==='offline'),back=steps.find(s=>s.id==='reconnect');assert.equal(offline.record.queue.length,1);assert.equal(offline.offline,true);const merged=SM.apply(back.remoteDoc,back.record.queue[0]);assert.equal(merged.data.results['demo-truck']['demo-a0'].time,42.37);assert.deepEqual(SM.apply(merged,back.record.queue[0]),merged);
const annualData=steps.find(s=>s.id==='champion').record.doc.data;assert.deepEqual(SM.competitionSnapshot(annualData),annualData.season.competitions.find(c=>c.id===annualData.id).data);const annual=annualData.season;assert.equal(annual.closed,true);assert.equal(annual.competitions.length,2);assert.equal(SM.seasonScores(annual)[0].total,50);
for(const s of steps.filter(s=>s.record.drafts&&Object.keys(s.record.drafts).length)){for(const draft of Object.values(s.record.drafts))assert.equal(draft.base,null);}
const source=fs.readFileSync(__dirname+'/demo.js','utf8');assert.ok(source.includes("connect-src \\'none\\'"));assert.ok(source.includes('sandbox="allow-scripts allow-forms allow-downloads allow-modals"'));assert.ok(!source.includes('allow-same-origin'));assert.ok(source.includes('e.source!==frame.contentWindow'));assert.ok(source.includes('e.data.token!==token'));
console.log('PASS 28 validated bilingual demo stages; independent data, ties, final scores, undo/redo, offline replay, annual winner and sandbox policy');
