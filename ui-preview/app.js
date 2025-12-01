const screens={start:document.getElementById('start'),hud:document.getElementById('hud'),result:document.getElementById('result'),settings:document.getElementById('settings')}
const toolbar=document.querySelector('.toolbar')
function show(name){Object.values(screens).forEach(s=>s.classList.add('hidden'));if(name==='result'||name==='settings'){screens[name].classList.remove('hidden');screens.hud.classList.add('hidden');screens.start.classList.add('hidden')}else{screens[name].classList.remove('hidden');screens.result.classList.add('hidden');screens.settings.classList.add('hidden')}}
toolbar.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;show(t.dataset.screen);if(t.dataset.screen==='hud'){spawnDemo()}})
show('start')
const play=document.getElementById('playarea')
function rand(a,b){return Math.random()*(b-a)+a}
function placeCenters(count,w,h,margin,minDist){const out=[];let tries=0;const max=2000;while(out.length<count&&tries<max){const x=rand(margin,w-margin),y=rand(margin,h-margin);let ok=true;for(let i=0;i<out.length;i++){const dx=x-out[i].x,dy=y-out[i].y;if(Math.hypot(dx,dy)<minDist){ok=false;break}}if(ok)out.push({x,y});tries++}return out}
function clearPlay(){while(play.firstChild)play.removeChild(play.firstChild)}
function spawnRing(x,y,size,cls){const r=document.createElement('div');r.className='ring '+cls;r.style.width=size+'px';r.style.height=size+'px';r.style.left=x-size/2+'px';r.style.top=y-size/2+'px';play.appendChild(r);return r}
function spawnDemo(){clearPlay();const rect=play.getBoundingClientRect();const w=rect.width,h=rect.height;const margin=32;const minDist=140;const centers=placeCenters(2,w,h,margin,minDist);centers.forEach((c,i)=>{const size=i===0?180:150;spawnRing(c.x,c.y,size,i===0?'active':'target')});const extra=placeCenters(1,w,h,margin,minDist);extra.forEach(c=>spawnRing(c.x,c.y,120,'inactive'))}

