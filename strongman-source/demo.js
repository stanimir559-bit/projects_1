/* Isolated interactive walkthrough. Child frames have opaque origins and no network access. */
(function(){
 const pick=(bg,en)=>document.documentElement.lang==='en'?en:bg;
 let modal=null,frame=null,steps=[],index=0,playing=false,timer=null,watchdog=null,token='',returnFocus=null,ready=false,downloadURL=null;
 const labels={};
 const escDemo=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const literal=x=>JSON.stringify(x).replace(/</g,'\\u003c');
 function bootstrap(config){
  document.documentElement.dataset.demoChild='true';const values=new Map(Object.entries(config.storage||{}));const memory={get length(){return values.size},key:i=>[...values.keys()][i]||null,getItem:k=>values.has(String(k))?values.get(String(k)):null,setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(String(k)),clear:()=>values.clear()};
  Object.defineProperty(window,'localStorage',{value:memory,configurable:false});Object.defineProperty(window,'sessionStorage',{value:memory,configurable:false});
  Object.defineProperty(window,'indexedDB',{value:undefined,configurable:false});
  let remote=config.remoteDoc;
  window.fetch=async function(input,options){options=options||{};if(config.offline)throw TypeError('DEMO_OFFLINE');const path=new URL(String(input),'https://demo.invalid').pathname;let result,status=200;
   if(path.endsWith('/api/viewer')){if(!remote.data.audience?.enabled){status=404;result={error:'VIEWER_DISABLED'};}else result=Object.assign(window.SM.publicState(remote.data),{revision:remote.revision});}
   else if(path.endsWith('/api/state'))result={doc:remote};
   else if(path.endsWith('/api/init'))result={doc:remote};
   else if(path.endsWith('/api/op')){try{remote=window.SM.apply(remote,JSON.parse(options.body));result={doc:remote};}catch(e){status=409;result={error:e.message};}}
   else{status=404;result={error:'DEMO_ONLY'};}
   return new Response(JSON.stringify(result),{status,headers:{'Content-Type':'application/json',ETag:'"demo-'+remote.revision+'"'}});
  };
  window.__SM_DEMO_CONFIG=config;
 }
 function bridge(){
  const config=window.__SM_DEMO_CONFIG,send=(kind,extra)=>parent.postMessage(Object.assign({smDemo:true,token:config.token,kind},extra||{}),'*');
  if(config.role==='judge')download=(name,blob)=>send('download',{name,blob});
  if(window.SMStorage)window.SMStorage={load:async()=>null,save:async()=>true};
  let done=false,tries=0;
  const check=setInterval(function(){try{
   const ok=config.role==='judge'?typeof storageReady!=='undefined'&&storageReady:typeof state!=='undefined'&&state;
   if(!ok){if(++tries>120){clearInterval(check);send('error',{message:'Demo could not load'});}return;}
   clearInterval(check);
   if(config.role==='judge'){if(config.action==='catalog')showCatalog();if(config.action==='settings')editEvent('demo-truck');}
   else if(config.action==='tv'){tvMode=true;render();}
   if(config.target){const el=document.querySelector(config.target);if(el)el.scrollIntoView({block:'center',behavior:'instant'});}
   done=true;send('ready');
  }catch(e){clearInterval(check);send('error',{message:e.message});}},30);
  document.addEventListener('pointerdown',()=>send('interact'),true);document.addEventListener('keydown',function(e){send('interact');if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&!(typeof tvMode!=='undefined'&&tvMode))send('close');},true);
  document.addEventListener('click',function(e){const control=e.target.closest('button,a');if(!control)return;
   const blocked=control.dataset.act==='downloadHtml'||control.dataset.act==='openVisitor'||control.dataset.act==='copyVisitor'||control.id==='shareView'||control.matches('a[target="_blank"]');
   if(!blocked)return;e.preventDefault();e.stopImmediatePropagation();
   if(control.dataset.act==='openVisitor'){send('viewer');return;}
   const message=document.documentElement.lang==='en'?'Demo only. Public links and the offline HTML copy are available from the real application.':'Само демо. Публичният линк и офлайн HTML файлът се вземат от реалното приложение.';
   if(typeof toast==='function')toast(message);else if(document.querySelector('#shareInfo'))document.querySelector('#shareInfo').textContent=message;
  },true);
 }
 const skeleton='<a class="skip-link" href="#main">Skip to content / Към съдържанието</a><div id="storageError" role="alert"></div><header class="app-header" id="appHeader"><div class="topbar"><div class="brand"><div class="brand-wordmark">Strongman<span>Arena</span><small id="roleLabel">DEMO</small></div></div><div class="topactions"><button type="button" data-theme-toggle class="small theme-switch">◐</button><span id="savebadge" class="savebadge" role="status"></span><button type="button" id="language" data-act="language" class="small switcher">EN</button></div></div><div class="header-nav-shell"><nav class="nav" id="nav" aria-label="Main navigation"></nav></div></header><div class="shell"><div id="syncAlert" role="alert"></div><main id="main"></main><footer id="footer" class="foot"></footer></div><dialog id="dialog" aria-label="Demo dialog"></dialog><div id="toast" class="toast" role="status" hidden></div><input type="file" id="importFile" class="fileinput" accept=".json,application/json">';
 const viewerSkeleton='<header class="app-header" id="appHeader"><div class="topbar"><div class="brand"><div class="brand-wordmark">Strongman<span>Arena</span><small id="roleLabel">DEMO</small></div></div><div class="topactions"><button data-theme-toggle class="small theme-switch">◐</button><span id="liveState" role="status"></span><button id="language" class="small switcher">EN</button></div></div><div class="header-nav-shell" id="visitorNavHost"></div></header><main class="shell visitor" id="main"><p id="updated" class="caption" role="status"></p><div id="controls"></div><div id="content"></div><footer class="foot">DEMO · LIVE RESULTS</footer></main>';
 function script(code){return '<script>'+code.replace(/<\/script/gi,'<\\/script')+'</'+'script>';}
 function source(step){
  const language=document.documentElement.lang==='en'?'en':'bg',theme=document.documentElement.dataset.theme||'light',pref=Object.assign({competitionId:step.record.doc.data.id,pinned:[],roundId:'',through:-1,tab:'competition',athleteId:'',selectedEvent:''},step.visitor||{});
  const config={token,role:step.role,action:step.action,target:step.target,offline:!!step.offline,remoteDoc:step.remoteDoc||step.record.doc,storage:{'strongman-arena-v1':JSON.stringify(step.record),'sm-lang':language,'sm-visitor-lang':language,'sm-appearance-v1':theme,'sm-visitor-ui-v2':JSON.stringify(pref)}};
  const styles=[...document.querySelectorAll('head style')].map(x=>x.textContent).join('\n');
  const scripts=step.role==='visitor'?window.SMDemoAssets.viewer:[...document.querySelectorAll('script:not([data-demo-source])')].filter(s=>!s.src).map(s=>s.textContent.replace("if('serviceWorker' in navigator&&","if(false&&"));
  return '<!doctype html><html lang="'+language+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; font-src data:; img-src data: blob:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'"><title>DEMO</title><style>'+styles+'</style>'+script('('+bootstrap.toString()+')('+literal(config)+');')+'</head><body>'+(step.role==='visitor'?viewerSkeleton:skeleton)+scripts.map(script).join('')+script('('+bridge.toString()+')();')+'</body></html>';
 }
 function clearDownload(){if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=null;if(modal)modal.querySelector('#demoFileSlot')?.replaceChildren();}
 function clearTimers(){clearTimeout(timer);clearTimeout(watchdog);timer=null;watchdog=null;}
 function schedule(){clearTimeout(timer);timer=null;if(playing&&ready&&!steps[index].last)timer=setTimeout(()=>show(index+1),14000);}
 function paint(){
  if(!modal)return;const lang=document.documentElement.lang==='en'?'en':'bg',step=steps[index];modal.querySelector('#demoCount').textContent=(index+1)+' / '+steps.length;
  modal.querySelector('#demoTitle').textContent=step.title[lang];modal.querySelector('#demoDescription').textContent=step.body[lang];
  modal.querySelector('#demoPlay').textContent=playing?pick('Ⅱ Пауза','Ⅱ Pause'):pick('▶ Автоматично','▶ Auto-play');modal.querySelector('#demoPlay').setAttribute('aria-pressed',String(playing));
  modal.querySelector('#demoPrev').disabled=index===0;modal.querySelector('#demoNext').textContent=step.last?pick('↻ Отначало','↻ Restart'):pick('Напред →','Next →');
  modal.querySelector('#demoStep').value=String(index);modal.querySelector('#demoProgress').style.width=(100*(index+1)/steps.length)+'%';
  modal.querySelector('#demoStatus').textContent=!ready?pick('Зареждане на примера…','Loading sample…'):playing?pick('Автоматично · 14 s на стъпка · кликът поставя на пауза','Auto-play · 14 s per step · interacting pauses'):pick('На пауза · можеш да пробваш бутоните в примера','Paused · try the controls in the sample');
 }
 function show(next){
  clearTimers();clearDownload();index=Math.max(0,Math.min(next,steps.length-1));if(steps[index].last)playing=false;ready=false;token=SM.uid();paint();frame.setAttribute('title',pick('Демо: ','Demo: ')+steps[index].title[document.documentElement.lang==='en'?'en':'bg']);frame.srcdoc=source(steps[index]);
  watchdog=setTimeout(()=>{if(!modal||ready)return;playing=false;modal.querySelector('#demoStatus').textContent=pick('Примерът не се зареди. Избери друга стъпка или „Отначало“.','The sample did not load. Select another step or restart.');},10000);
 }
 function close(){
  if(!modal)return;clearTimers();clearDownload();playing=false;const node=modal;modal=null;frame=null;steps=[];node.close();node.remove();returnFocus?.focus();
 }
 function launch(trigger){
  if(modal)return;returnFocus=trigger||document.activeElement;steps=SMDemoData.build(SM);playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;index=0;
  modal=document.createElement('dialog');modal.id='smDemo';modal.className='sm-demo';modal.setAttribute('aria-labelledby','demoHeading');
  modal.innerHTML='<div class="demo-shell"><header class="demo-top"><div><strong id="demoHeading">'+pick('Демо','Demo')+'</strong> <span class="demo-sample">'+pick('ПРИМЕРНИ ДАННИ','SAMPLE DATA')+'</span></div><div><span id="demoCount"></span><button id="demoClose" aria-label="'+pick('Изход от демото','Exit demo')+'">'+pick('✕ Изход','✕ Exit')+'</button></div></header><section class="demo-coach"><h2 id="demoTitle"></h2><p id="demoDescription"></p><div class="demo-controls"><button id="demoPrev" aria-label="'+pick('Предишна стъпка','Previous step')+'">←</button><button id="demoPlay"></button><select id="demoStep" aria-label="'+pick('Избери стъпка от демото','Choose demo step')+'">'+steps.map((s,i)=>'<option value="'+i+'">'+(i+1)+'. '+escDemo(s.title[document.documentElement.lang==='en'?'en':'bg'])+'</option>').join('')+'</select><button id="demoNext"></button></div><p class="demo-status" id="demoStatus" role="status"></p><div id="demoFileSlot" aria-live="polite"></div></section><div class="demo-meter" aria-hidden="true"><span id="demoProgress"></span></div><iframe id="demoFrame" sandbox="allow-scripts allow-forms allow-downloads allow-modals" referrerpolicy="no-referrer"></iframe></div>';
  document.body.appendChild(modal);frame=modal.querySelector('#demoFrame');
  modal.querySelector('#demoClose').onclick=close;
  modal.querySelector('#demoPrev').onclick=()=>{playing=false;show(index-1);};
  modal.querySelector('#demoNext').onclick=()=>{playing=false;show(steps[index].last?0:index+1);};
  modal.querySelector('#demoStep').onchange=e=>{playing=false;show(Number(e.target.value));};
  modal.querySelector('#demoPlay').onclick=()=>{playing=!playing;paint();schedule();};
  modal.addEventListener('cancel',e=>{e.preventDefault();close();});modal.showModal();show(0);
 }
 window.addEventListener('message',e=>{
  if(!modal||e.source!==frame.contentWindow||!e.data?.smDemo||e.data.token!==token)return;
  if(e.data.kind==='download'&&e.data.blob instanceof Blob&&e.data.blob.size<=30000000&&/^[a-zA-Z0-9_.-]+\.(docx|csv|json)$/.test(e.data.name||'')){clearDownload();playing=false;clearTimeout(timer);paint();downloadURL=URL.createObjectURL(e.data.blob);const a=document.createElement('a');a.href=downloadURL;a.download='DEMO-'+e.data.name;a.textContent=pick('↓ Изтегли демо файла','↓ Download demo file')+' · '+a.download;modal.querySelector('#demoFileSlot').appendChild(a);}
  if(e.data.kind==='ready'){ready=true;clearTimeout(watchdog);paint();schedule();}
  if(e.data.kind==='interact'&&playing){playing=false;clearTimeout(timer);paint();}
  if(e.data.kind==='close')close();
  if(e.data.kind==='viewer'){playing=false;show(steps.findIndex(s=>s.id==='spectators'));}
  if(e.data.kind==='error'){playing=false;clearTimers();modal.querySelector('#demoStatus').textContent=pick('Неуспешно зареждане на примера. Избери друга стъпка.','Sample could not load. Select another step.');}
 });
 document.addEventListener('click',e=>{if(!e.target.closest('[data-act="demoLaunch"]'))return;e.preventDefault();e.stopImmediatePropagation();launch(e.target.closest('[data-act="demoLaunch"]'));},true);
})();
