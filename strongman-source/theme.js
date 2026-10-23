/* Appearance is device-local and never changes competition data. */
(function(){
 const key='sm-appearance-v1',media=matchMedia('(prefers-color-scheme: dark)');let choice=null;
 try{const saved=localStorage.getItem(key);if(['light','dark'].includes(saved))choice=saved;}catch{}
 const apply=()=>{const dark=(choice|| (media.matches?'dark':'light'))==='dark';document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';const bg=document.documentElement.lang==='bg';for(const b of document.querySelectorAll('[data-theme-toggle]')){b.textContent=(dark?'☀ ':'☾ ')+(bg?(dark?'Светло':'Тъмно'):(dark?'Light':'Dark'));b.setAttribute('aria-label',bg?(dark?'Превключи към светъл режим':'Превключи към тъмен режим'):(dark?'Switch to light mode':'Switch to dark mode'));b.setAttribute('aria-pressed',String(dark));}};
 apply();document.addEventListener('DOMContentLoaded',apply);new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.addEventListener('click',ev=>{if(!ev.target.closest('[data-theme-toggle]'))return;choice=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,choice);}catch{}apply();});
 media.addEventListener('change',()=>{if(!choice)apply();});
 window.addEventListener('storage',ev=>{if(ev.key===key){choice=['dark','light'].includes(ev.newValue)?ev.newValue:null;apply();}});
 let printDetails=[];window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('main details')].filter(e=>!e.open&&!e.closest('.noprint'));printDetails.forEach(e=>e.open=true);});window.addEventListener('afterprint',()=>{printDetails.forEach(e=>e.open=false);printDetails=[];});
})();
