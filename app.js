const scenes=[...document.querySelectorAll('.scene')];
const progressBar=document.getElementById('progressBar');
const counter=document.getElementById('counter');
const panel=document.getElementById('indexPanel');
const indexButton=document.getElementById('indexButton');
let activeIndex=0;

const format=n=>String(n).padStart(2,'0');
function update(index){
  activeIndex=Math.max(0,Math.min(index,scenes.length-1));
  scenes.forEach((scene,sceneIndex)=>scene.classList.toggle('is-active',sceneIndex===activeIndex));
  counter.textContent=`${format(activeIndex+1)} / ${format(scenes.length)}`;
  progressBar.style.width=`${((activeIndex+1)/scenes.length)*100}%`;
  document.title=`${scenes[activeIndex].dataset.title} — Kortex para Clami`;
}
let transitionTimer;
function go(delta){
  const next=Math.max(0,Math.min(activeIndex+delta,scenes.length-1));
  if(next===activeIndex)return;
  document.body.classList.remove('is-transitioning');
  void document.body.offsetWidth;
  document.body.classList.add('is-transitioning');
  clearTimeout(transitionTimer);
  transitionTimer=setTimeout(()=>document.body.classList.remove('is-transitioning'),900);
  update(next);
  scenes[next].scrollIntoView({behavior:'smooth'});
}
let scrollFrame=0;
function trackScene(){
  scrollFrame=0;
  const anchor=window.innerHeight*.35;
  let selected=0;
  scenes.forEach((scene,i)=>{if(scene.getBoundingClientRect().top<=anchor)selected=i});
  if(selected!==activeIndex)update(selected);
}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(trackScene)},{passive:true});
window.addEventListener('resize',()=>{trackScene();syncFullscreenButton()});

document.getElementById('prevButton').addEventListener('click',()=>go(-1));
document.getElementById('nextButton').addEventListener('click',()=>go(1));
document.addEventListener('keydown',event=>{
  if(panel.classList.contains('open')) return;
  if(event.key==='F11'){
    event.preventDefault();
    toggleFullscreen();
    return;
  }
  if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();go(1)}
  if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(-1)}
  if(event.key==='Home'){event.preventDefault();scenes[0].scrollIntoView({behavior:'smooth'})}
  if(event.key==='End'){event.preventDefault();scenes.at(-1).scrollIntoView({behavior:'smooth'})}
});

function setPanel(open){panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));indexButton.setAttribute('aria-expanded',String(open));}
indexButton.addEventListener('click',()=>setPanel(!panel.classList.contains('open')));
document.getElementById('closeIndex').addEventListener('click',()=>setPanel(false));
panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setPanel(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setPanel(false)});

const fullscreenButton=document.getElementById('fullscreenButton');
const isPresentationFullscreen=()=>Boolean(document.fullscreenElement);
function syncFullscreenButton(){
  const active=isPresentationFullscreen();
  fullscreenButton.classList.toggle('is-active',active);
  fullscreenButton.querySelector('.fullscreen-label').textContent=active?'Sair da tela cheia':'Tela cheia';
  fullscreenButton.setAttribute('aria-label',active?'Sair da tela cheia':'Abrir em tela cheia');
  fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.title=active?'Sair da tela cheia':'Abrir em tela cheia';
}
async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }finally{
    setTimeout(syncFullscreenButton,80);
  }
}
fullscreenButton.addEventListener('click',toggleFullscreen);

let wheelLock=false;
let wheelRelease;
window.addEventListener('wheel',event=>{
  if(window.innerWidth<=800||panel.classList.contains('open')||Math.abs(event.deltaY)<8)return;
  event.preventDefault();
  if(wheelLock)return;
  wheelLock=true;
  go(event.deltaY>0?1:-1);
  clearTimeout(wheelRelease);
  wheelRelease=setTimeout(()=>{wheelLock=false},760);
},{passive:false});

let touchStart=0;
document.addEventListener('touchstart',event=>{touchStart=event.changedTouches[0].clientY},{passive:true});
document.addEventListener('touchend',event=>{
  if(window.innerWidth<=800) return;
  const distance=touchStart-event.changedTouches[0].clientY;
  if(Math.abs(distance)>70) go(distance>0?1:-1);
},{passive:true});

update(0);
syncFullscreenButton();

const storeData=[['showroom-gabriel.jpg','Gabriel Monteiro da Silva'],['showroom-teodoro.jpg','Pinheiros'],['showroom-lar-center.jpg','Shopping Lar Center'],['showroom-dd.jpg','D&D Shopping']];
document.querySelectorAll('[data-store]').forEach(button=>button.addEventListener('click',()=>{
 const [photo,name]=storeData[Number(button.dataset.store)];
 document.getElementById('store-photo').src=''+photo;
 document.getElementById('store-photo').alt='Loja Clami '+name;
 document.getElementById('store-name').textContent=name;
 document.querySelectorAll('[data-store]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));

document.addEventListener('fullscreenchange',syncFullscreenButton);
