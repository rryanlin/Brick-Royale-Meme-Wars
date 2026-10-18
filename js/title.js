/* Title screen: your Brick Royale: Memewars artwork as the backdrop, with live buttons placed over the PLAY / Fighters / Spin / How to Play controls. */
(()=>{
const menu=$('menu');menu.style.display='none';
const W0=1672,H0=941,HS={tplay:[652,640,367,80],tfight:[491,734,220,81],twheel:[720,734,231,81],thow:[960,734,221,81]};
const T=document.createElement('div');T.id='title';
T.innerHTML='<div class="tbg"></div><button class="hs" id="tplay" aria-label="Play, choose a game mode"></button><button class="hs" id="tfight" aria-label="Fighters"></button><button class="hs" id="twheel" aria-label="Spin the wheel"></button><button class="hs" id="thow" aria-label="How to play"></button><span id="tspin"></span><div id="tbar"><b>10 FIGHTERS</b><i></i><b>8 WEAPONS</b><i></i><b>1V1-20V20</b><i></i><b>FREE TO PLAY</b></div>';
document.body.appendChild(T);document.documentElement.style.setProperty('--bgimg','url("'+new URL('img/title.jpg',location.href).href+'")');
const H=document.createElement('div');H.id='howto';
H.innerHTML='<div class="wbox"><h2>HOW TO PLAY</h2><ul><li><b>WASD</b> move, <b>Space</b> jump</li><li><b>Mouse</b> aim, <b>Left click</b> shoot</li><li><b>Right click</b> or <b>F</b> swing the hammer</li><li><b>Q</b> special ability, <b>R</b> reload</li><li><b>1</b> gun (press again to swap primary and secondary, or use <b>X</b> / mouse wheel), <b>2</b> hammer</li><li><b>T</b> sprint (uses stamina), <b>Shift</b> crouch</li><li><b>3 4 5</b> use loot items, <b>M</b> mute</li><li>Win 2 rounds to win the match</li><li>Every 5 kills and every match win gives a wheel spin</li></ul><div class="wbtn"><button id="hx">Got it</button></div></div>';
document.body.appendChild(H);
// Play opens a mode picker. Only Play vs CPU is playable today; the online modes show a SOON tag and say so when clicked.
const IC={cpu:'<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="22" rx="4" fill="#ffd02f" stroke="#000" stroke-width="3"/><rect x="16" y="21" width="5" height="7" fill="#000"/><rect x="27" y="21" width="5" height="7" fill="#000"/><rect x="22" y="6" width="4" height="8" fill="#000"/><circle cx="24" cy="6" r="3.5" fill="#ff2a35" stroke="#000" stroke-width="2"/><rect x="18" y="31" width="12" height="2.5" fill="#000"/></svg>',
 rank:'<svg viewBox="0 0 48 48"><path d="M14 8h20v10c0 8-4 13-10 13S14 26 14 18z" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M14 11H7c0 8 3 12 8 13M34 11h7c0 8-3 12-8 13" fill="none" stroke="#000" stroke-width="3"/><rect x="21" y="31" width="6" height="7" fill="#c98a00" stroke="#000" stroke-width="2.5"/><rect x="14" y="38" width="20" height="5" rx="1.5" fill="#ffd02f" stroke="#000" stroke-width="3"/></svg>',
 party:'<svg viewBox="0 0 48 48"><circle cx="17" cy="16" r="6" fill="#4cc3ff" stroke="#000" stroke-width="3"/><path d="M5 38c0-8 5-13 12-13s12 5 12 13z" fill="#4cc3ff" stroke="#000" stroke-width="3"/><circle cx="33" cy="19" r="5" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M26 38c0-6 3-11 9-11s9 5 9 11z" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M38 4v10M33 9h10" stroke="#3ddc6e" stroke-width="4"/></svg>',
 join:'<svg viewBox="0 0 48 48"><rect x="6" y="12" width="26" height="24" rx="4" fill="#4cc3ff" stroke="#000" stroke-width="3"/><path d="M14 24h22M29 16l9 8-9 8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 24h22M29 16l9 8-9 8" fill="none" stroke="#000" stroke-width="1.5"/></svg>'};
const MODES=[['cpu','Play vs CPU','1v1 against the bot',0],['rank','Play Ranked','Climb the ladder',0],['party','Create a Party','Invite friends with a code',0],['join','Join a Party','Enter a friend\u2019s code',0]];
const PM=document.createElement('div');PM.id='pmodes';
PM.innerHTML='<div class="wbox"><h2>CHOOSE A MODE</h2><div class="mgrid">'+MODES.map(m=>'<button class="mcard'+(m[3]?' soon':'')+'" data-m="'+m[0]+'"><span class="mi">'+IC[m[0]]+'</span><span class="mt">'+m[1]+'</span><span class="ms">'+m[2]+'</span>'+(m[3]?'<em>SOON</em>':'')+'</button>').join('')+'</div><p id="mnote"></p><div class="wbtn"><button id="mx">Back</button></div></div>';
document.body.appendChild(PM);
const MODEOPEN=()=>PM.style.display==='flex',modesOpen=()=>{$('mnote').textContent='';const rk=PM.querySelector('[data-m=rank] .ms');if(rk&&window.Online)rk.textContent='Your rank: '+Online.text();PM.style.display='flex'},modesClose=()=>PM.style.display='none';
PM.addEventListener('click',e=>{if(e.target===PM)return modesClose();const c=e.target.closest('.mcard');if(!c)return;
 if(c.dataset.m==='cpu'){modesClose();showSelect()}
 else if(window.Online){modesClose();Online.start(c.dataset.m)}else $('mnote').textContent='Online play could not load. Refresh the page and try again.'});
$('mx').onclick=modesClose;
function lay(){const W=innerWidth,Hh=innerHeight;
 // fill the whole window with no stretching and no side strips: scale the art uniformly to cover and trim the top/bottom if the window is wider than the art
 const sx=Math.min(Math.max(W/W0,Hh/H0),Hh/795,W/760),sy=sx,ox=(W-W0*sx)/2,Hv=Hh/sy,Y0=Hv<H0?Math.max(0,Math.min(68,H0-Hv)):0,oy=sy*H0>=Hh?-Y0*sy:(Hh-H0*sy)/2;
 $('tbar').style.display=sy*H0>=Hh&&Y0+Hv<885?'flex':'none';
 const b=T.firstChild.style;b.inset='auto';b.left=ox+'px';b.top=oy+'px';b.width=W0*sx+'px';b.height=H0*sy+'px';b.backgroundSize='100% 100%';
 for(const id in HS){const[x,y,w,h]=HS[id],e=$(id).style;e.left=ox+x*sx+'px';e.top=oy+y*sy+'px';e.width=w*sx+'px';e.height=h*sy+'px'}
 // the artwork has "7 Spins Ready" painted on the Spin button, so a matching patch carries the live count on top of it
 const t=$('tspin').style;t.left=ox+808*sx+'px';t.top=oy+777*sy+'px';t.width=126*sx+'px';t.height=28*sy+'px';t.lineHeight=28*sy+'px';t.fontSize=Math.max(10,19*sx)+'px'}
const spin=()=>{$('tspin').textContent=PR.S.spins+' Spin'+(PR.S.spins===1?'':'s')+' Ready'};
const showSelect=()=>{T.style.display='none';menu.style.display='flex';window.UIfit&&UIfit()},showTitle=()=>{menu.style.display='none';T.style.display='block';spin();lay()};
$('tplay').onclick=modesOpen;$('tfight').onclick=showSelect;$('twheel').onclick=()=>PR.open();$('thow').onclick=()=>H.style.display='flex';$('hx').onclick=()=>H.style.display='none';
const bk=document.createElement('button');bk.id='back';bk.innerHTML='<span class="bi">\u25C0</span> Title Screen';bk.onclick=showTitle;$('mtop').prepend(bk);
addEventListener('resize',lay);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&MODEOPEN())return modesClose();if(e.key==='Enter'&&T.style.display!=='none'&&H.style.display!=='flex'&&$('wheel').style.display!=='flex'){if(MODEOPEN()){modesClose();showSelect()}else modesOpen()}});
window.TITLE={showSelect,showTitle};
showTitle();
})();
