/* Measure the real header so sticky panels and keyboard targets stay clear of it. */
(function(){
 const root=document.documentElement,header=document.getElementById('appHeader'),banner=document.getElementById('storageError');
 if(!header)return;let scheduled=false;
 const measure=()=>{scheduled=false;const height=Math.ceil(header.getBoundingClientRect().height),warning=Math.ceil(banner?.getBoundingClientRect().height||0);root.style.setProperty('--app-header-height',height+'px');root.style.setProperty('--storage-banner-height',warning+'px');};
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(measure);}};
 if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(schedule);observer.observe(header);if(banner)observer.observe(banner);}
 new MutationObserver(schedule).observe(header,{childList:true,subtree:true});
 window.addEventListener('resize',schedule);document.addEventListener('DOMContentLoaded',schedule);measure();
})();
