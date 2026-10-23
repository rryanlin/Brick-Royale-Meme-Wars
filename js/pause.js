/* In-game pause menu (ESC) and clean-up of floating overlays when a match is not being played. */
(()=>{
const $=id=>document.getElementById(id);
const ov=document.createElement('div');ov.id='pause';
ov.innerHTML='<div class="pbox"><h2>PAUSED</h2><button id="pzres" class="pgo">RESUME</button><button id="pzrs">RESTART MATCH</button><button id="pzcf">CHANGE FIGHTERS</button><button id="pzqt">QUIT TO TITLE</button><p id="pznote"></p></div>';
document.body.appendChild(ov);
let open=false,quiet=0,lk=false;
const online=()=>!!(window.NET&&NET.on&&!NET.fin);
const lock=()=>{try{R.domElement.requestPointerLock()}catch(e){}};
const unlock=()=>{quiet=performance.now()+400;try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}};
const picking=()=>!!(window.BRMAP&&BRMAP.picking); // the Battle Royale drop zone screen is open: ESC and a lost mouse lock must not pop the pause menu over it
function openP(){if(open||mode!=='play'||over||picking())return;open=true;const on=online();
 for(const x in k)k[x]=false;firing=false;
 if(!on)window.PAUSED=true;
 $('pzrs').style.display=$('pzcf').style.display=on?'none':'block';
 $('pznote').textContent=on?'Online match: the game keeps running. Quitting forfeits the match.':'ESC to resume';
 ov.style.display='flex';unlock()}
function closeP(){if(!open)return;open=false;window.PAUSED=false;ov.style.display='none';for(const x in k)k[x]=false;firing=false}
function toMenu(show){closeP();unlock();window.TOUR&&TOUR.cancel&&TOUR.cancel();$('hud').style.display='none';mode='menu';score=[0,0];$('score').textContent='0 - 0';resetRound(true);show()}
$('pzres').onclick=()=>{closeP();lock()};
$('pzrs').onclick=()=>{closeP();$('go').click()};
$('pzcf').onclick=()=>toMenu(()=>{const T=window.TITLE;if(T&&T.showSelect)T.showSelect(window.BRPEND===true);else $('menu').style.display='flex'});
$('pzqt').onclick=()=>{if(online()){closeP();window.Online&&Online.forfeit&&Online.forfeit();return}toMenu(()=>{const T=window.TITLE;if(T&&T.showTitle)T.showTitle();else $('menu').style.display='flex'})};
// ESC: toggles the menu. While the mouse is captured the browser keeps ESC for itself and only reports that the capture ended, so that opens it too.
addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(open){e.preventDefault();e.stopImmediatePropagation();closeP();lock()}else if(mode==='play'&&!over){e.preventDefault();openP()}return}
 if(open)e.stopImmediatePropagation()},true);
for(const t of['mousedown','mouseup','wheel'])addEventListener(t,e=>{if(open&&!ov.contains(e.target))e.stopImmediatePropagation()},true);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement){lk=true;return}
 if(lk){lk=false;if(performance.now()>quiet&&mode==='play'&&!over&&!open&&!picking())openP()}});
// when no match is running, nothing from the match HUD may stay on top of the menus (floating names, bars, the zone tint)
const zh=()=>$('zhurt');
(function frame(){requestAnimationFrame(frame);
 if(mode!=='play'){document.querySelectorAll('.ob').forEach(d=>{d.style.display='none'});const z=zh();if(z)z.style.display='none';if(open)closeP()}
 else{const z=zh();if(z&&z.style.display==='none')z.style.display=''}})();
window.PAUSE={open:()=>open,show:openP,hide:closeP,quiet:ms=>{quiet=performance.now()+(ms||600)}};
})();
