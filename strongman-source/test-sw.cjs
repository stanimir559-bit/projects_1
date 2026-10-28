'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../strongman/sw.js'),'utf8');

async function navigation(put){
 const listeners={},writes=[],lifetimes=[],response={ok:true,clone(){return {copy:true}}};
 const cache={put:async(key,copy)=>{writes.push({key,copy});return put();}};
 const self={location:{href:'https://arena.test/strongman/sw.js',origin:'https://arena.test'},addEventListener(type,handler){listeners[type]=handler;}};
 vm.runInNewContext(source,{self,URL,caches:{open:async()=>cache},fetch:async()=>response});
 let result;
 listeners.fetch({request:{url:'https://arena.test/strongman/strongman-arena',method:'GET',mode:'navigate'},respondWith(promise){result=promise;},waitUntil(promise){lifetimes.push(promise);}});
 assert.equal(await result,response,'online navigation remains available');
 return {writes,lifetimes};
}

(async()=>{
 let finishPut,putFinished=false;
 const waiting=new Promise(resolve=>{finishPut=()=>{putFinished=true;resolve();};});
 const first=await navigation(()=>waiting);
 assert.equal(first.writes.length,1);
 assert.equal(first.writes[0].key,'./strongman-arena.html');
 assert.equal(first.writes[0].copy.copy,true);
 assert.equal(first.lifetimes.length,1,'cache update must extend the fetch event lifetime');
 assert.equal(putFinished,false,'navigation may finish before the cache write');
 finishPut();await first.lifetimes[0];
 assert.equal(putFinished,true);
 console.log('PASS online navigation keeps the service worker alive until offline cache update finishes');
 const failed=await navigation(()=>Promise.reject(Error('cache full')));
 await Promise.all(failed.lifetimes);
 console.log('PASS failed cache write does not replace a successful online navigation');
})().catch(error=>{console.error(error);process.exitCode=1;});
