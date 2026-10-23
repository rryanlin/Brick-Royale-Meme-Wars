/* Lobby / title screen: a 16:9 stage (1672 x 941 design pixels, scaled to fit any window) over your lobby artwork.
   Top bar: Play, Fighters, Weapons, Locker, Item Shop, Career, Brick Bucks. Left: level card, daily quests, resources.
   Middle: your fighter on the glowing pad (a friend in your party stands on the side pad). Right: party panel, mode picker and the PLAY button.
   The party itself (codes, the link to your friend, ready/start messages) lives in js/online.js and talks to this file through Online.party() and TITLE.sync(). */
(()=>{
const menu=$('menu');menu.style.display='none';
const LIMG=''+new URL('img/lobby.jpg',location.href).href+'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const SV={
 crown:'<svg viewBox="0 0 48 48"><path d="M7 17l7 7 10-13 10 13 7-7-3 20H10z" fill="#ffd02f" stroke="#7a4a00" stroke-width="2.5" stroke-linejoin="round"/><rect x="10" y="37" width="28" height="5" rx="1.5" fill="#e9a400" stroke="#7a4a00" stroke-width="2"/></svg>',
 clip:'<svg viewBox="0 0 48 48"><rect x="9" y="8" width="30" height="36" rx="4" fill="#fff" stroke="#0a2a5e" stroke-width="3"/><rect x="17" y="4" width="14" height="8" rx="3" fill="#35d0ff" stroke="#0a2a5e" stroke-width="3"/><path d="M15 21h18M15 29h18M15 37h11" stroke="#1d6fe0" stroke-width="3.5" stroke-linecap="round"/></svg>',
 trophy:'<svg viewBox="0 0 48 48"><path d="M14 8h20v10c0 8-4 13-10 13S14 26 14 18z" fill="#ffd02f" stroke="#7a4a00" stroke-width="3"/><path d="M14 11H7c0 8 3 12 8 13M34 11h7c0 8-3 12-8 13" fill="none" stroke="#7a4a00" stroke-width="3"/><rect x="21" y="31" width="6" height="7" fill="#e9a400" stroke="#7a4a00" stroke-width="2.5"/><rect x="14" y="38" width="20" height="5" rx="1.5" fill="#ffd02f" stroke="#7a4a00" stroke-width="3"/></svg>',
 skull:'<svg viewBox="0 0 48 48"><path d="M24 5C14 5 8 12 8 21c0 6 3 10 7 12v7h18v-7c4-2 7-6 7-12 0-9-6-16-16-16z" fill="#fff"/><circle cx="17" cy="23" r="4.5" fill="#0a2a5e"/><circle cx="31" cy="23" r="4.5" fill="#0a2a5e"/><path d="M24 28l-3 5h6zM20 36v4M24 36v4M28 36v4" stroke="#0a2a5e" stroke-width="2.5" fill="#0a2a5e" stroke-linecap="round"/></svg>',
 people:'<svg viewBox="0 0 48 48"><circle cx="17" cy="15" r="7" fill="#7fb4ff"/><path d="M3 40c0-9 6-14 14-14s14 5 14 14z" fill="#7fb4ff"/><circle cx="34" cy="18" r="6" fill="#bcd6ff"/><path d="M26 40c0-7 3-12 9-12s11 5 11 12z" fill="#bcd6ff"/></svg>',
 swords:'<svg viewBox="0 0 48 48"><path d="M8 8l8 2 22 22-4 4L10 14zM40 8l-8 2L10 32l4 4 22-22z" fill="#7fb4ff"/><path d="M6 38l5-5 4 4-5 5zM42 38l-5-5-4 4 5 5z" fill="#bcd6ff"/></svg>',
 brick:'<svg viewBox="0 0 48 48"><rect x="6" y="20" width="36" height="20" rx="3" fill="#7fb4ff"/><rect x="11" y="12" width="9" height="9" rx="2" fill="#bcd6ff"/><rect x="28" y="12" width="9" height="9" rx="2" fill="#bcd6ff"/><path d="M6 33h36" stroke="#4c86d6" stroke-width="2.5"/></svg>',
 star:'<svg viewBox="0 0 48 48"><path d="M24 4l6 13 14 2-10 10 3 14-13-7-13 7 3-14L4 19l14-2z" fill="#ffd02f" stroke="#a87100" stroke-width="2" stroke-linejoin="round"/></svg>',
 plus:'<svg viewBox="0 0 48 48"><path d="M24 11v26M11 24h26" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
 chev:'<svg viewBox="0 0 24 24"><path d="M8 4l9 8-9 8" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2" fill="none" stroke="#fff" stroke-width="3.6" stroke-dasharray="3.4 2.6"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="12" cy="12" r="2.2" fill="#fff"/></svg>',
 caret:'<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
// where the party members stand: you are in the middle; friends fill these places (x = centre, fy = feet, h = height, py = the "+" frame), all centred on you
const SLOTS=[{x:1124,fy:708,h:390,py:522,z:2},{x:548,fy:708,h:390,py:522,z:2}];
const T=document.createElement('div');T.id='title';
T.innerHTML='<div class="lbbg"></div><div class="lbst" id="lbst">'+
 '<img class="lbart" alt="" draggable="false">'+
 '<div class="lbpad" id="lbpad"><i></i></div>'+
 SLOTS.map((o,i)=>'<button class="lbplus" id="lbplus'+(i+1)+'" data-s="'+i+'" aria-label="Invite a friend" style="left:'+(o.x-28)+'px;top:'+o.py+'px">'+SV.plus+'</button>').join('')+
 SLOTS.map((o,i)=>{const w=Math.round(o.h*1.094),hh=Math.round(o.h*1.083);return'<div class="lbpeer" id="lbpeer'+(i?i+1:'')+'" data-s="'+i+'" style="z-index:'+o.z+';left:'+Math.round(o.x-w/2)+'px;top:'+(o.fy-hh+Math.round(o.h*.015))+'px;width:'+w+'px;height:'+hh+'px"><img alt="" draggable="false"></div>'}).join('')+
 SLOTS.map((o,i)=>'<div class="lbtag sm lbptg" id="lbptag'+(i?i+1:'')+'" style="left:'+o.x+'px;top:'+(o.fy-o.h-84)+'px;--ts:'+(o.z>1?.86:.7)+';display:none"></div>').join('')+
 '<div class="lbhero" id="lbhero" title="Choose your fighter"><img alt="" draggable="false"></div>'+
 '<div class="lbtag" id="lbtag"></div>'+
 '<div class="lbleft">'+
  '<div class="lbcard lvl" id="lblvl"></div>'+
  '<button class="lbq" id="lbqb"><i class="qi">'+SV.clip+'<u id="lbqn">!</u></i><b>NEW QUESTS</b><s>'+SV.chev+'</s></button>'+
  '<div class="lbcard res"><h4>RESOURCES</h4><div class="rw"><img class="buxcoin" alt="" draggable="false"><span>BRICK BUCKS</span><b data-bux></b></div><div class="rw"><i>'+SV.trophy+'</i><span>WINS</span><b id="lbwins">0</b></div><div class="rw"><i>'+SV.skull+'</i><span>KILLS</span><b id="lbkills">0</b></div></div>'+
  '<div class="lbcard eq" id="lbeq"></div>'+
 '</div>'+
 '<div class="lbparty" id="lbparty"></div>'+
 '<button class="lbmode" id="tmode"></button><button class="lbplay" id="tplay"><span>PLAY!</span></button>'+
 '<div class="lbbot" id="tbar"><div><i>'+SV.people+'</i><b id="lbnf">14</b><span>FIGHTERS</span></div><div><i>'+SV.swords+'</i><b id="lbnw">12</b><span>WEAPONS</span></div><div><i>'+SV.brick+'</i><span>LEGO BATTLES</span></div><div><i>'+SV.star+'</i><span>FREE TO PLAY</span></div></div>'+
 '<div class="lbtoast" id="lbtoast"></div>'+
 '</div>';
document.body.appendChild(T);
T.querySelector('#lbeq').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.er');if(b)goTab(b.dataset.t)});
// the top bar belongs to every page of the lobby (lobby, fighters, weapons, melee, item shop, career, brick bucks): it never goes away and the page you are on is lit white
const G=document.createElement('div');G.id='gtop';
G.innerHTML='<div class="gtin"><button class="lbham" id="lbham" aria-label="Friends" title="Friends"><i></i><i></i><i></i><u id="lbfrn" style="display:none"></u></button><img class="lblogo" alt="Brick Royale: Memewars" draggable="false"><nav id="lbnav"></nav>'+
 '<button id="tbux" aria-label="Brick Bucks"><img class="buxcoin" alt="" draggable="false"><span><small>Brick Bucks</small><b data-bux></b></span></button><button class="lbgear" id="lbgear" aria-label="Settings">'+SV.gear+'</button></div>';
document.body.appendChild(G);
{const d=document.createElement('div');d.className='lbdrawer';d.id='lbdrawer';document.body.appendChild(d)}
const $t=s=>T.querySelector(s)||G.querySelector(s)||document.getElementById(s.slice(1)),st=T.querySelector('#lbst');
T.querySelector('.lbart').src=LIMG;T.querySelector('.lbbg').style.backgroundImage='url("'+LIMG+'")';G.querySelector('.lblogo').src=window.LOGO||'';
document.documentElement.style.setProperty('--lobbyimg','url("'+LIMG+'")');
// ---------------------------------------------------------------- how to play + mode picker (modal windows)
const H=document.createElement('div');H.id='howto';
H.innerHTML='<div class="wbox"><h2>HOW TO PLAY</h2><ul><li><b>WASD</b> move, <b>Space</b> jump</li><li><b>Mouse</b> aim, <b>Left click</b> shoot</li><li><b>Hold right click</b> to aim (or scope in, if the gun has a scope)</li><li><b>V</b> first person / third person view</li><li><b>F</b> swing your melee weapon</li><li><b>Q</b> special ability, <b>R</b> reload</li><li><b>1</b> gun (press again to swap primary and secondary, or use <b>X</b> / mouse wheel), <b>2</b> melee weapon</li><li><b>T</b> sprint (uses stamina), <b>Shift</b> crouch</li><li><b>3 4 5</b> use loot items, <b>M</b> mute</li><li>Battle Royale: <b>E</b> picks up or swaps loot, hold <b>Tab</b> for the big map</li><li>Win 2 rounds to win the match</li><li>Every 5 kills and every match win gives a wheel spin</li></ul><div class="wbtn"><button id="hx">Got it</button></div></div>';
document.body.appendChild(H);
const IC={cpu:'<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="22" rx="4" fill="#ffd02f" stroke="#000" stroke-width="3"/><rect x="16" y="21" width="5" height="7" fill="#000"/><rect x="27" y="21" width="5" height="7" fill="#000"/><rect x="22" y="6" width="4" height="8" fill="#000"/><circle cx="24" cy="6" r="3.5" fill="#ff2a35" stroke="#000" stroke-width="2"/><rect x="18" y="31" width="12" height="2.5" fill="#000"/></svg>',
 br:'<svg viewBox="0 0 48 48"><path d="M8 18l6 6 10-12 10 12 6-6-3 18H11z" fill="#ffd02f" stroke="#000" stroke-width="3" stroke-linejoin="round"/><circle cx="8" cy="15" r="3" fill="#ff2a35" stroke="#000" stroke-width="2"/><circle cx="24" cy="8" r="3" fill="#4cc3ff" stroke="#000" stroke-width="2"/><circle cx="40" cy="15" r="3" fill="#3ddc6e" stroke="#000" stroke-width="2"/><rect x="11" y="38" width="26" height="5" rx="1.5" fill="#c98a00" stroke="#000" stroke-width="2.5"/></svg>',
 rank:'<svg viewBox="0 0 48 48"><path d="M14 8h20v10c0 8-4 13-10 13S14 26 14 18z" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M14 11H7c0 8 3 12 8 13M34 11h7c0 8-3 12-8 13" fill="none" stroke="#000" stroke-width="3"/><rect x="21" y="31" width="6" height="7" fill="#c98a00" stroke="#000" stroke-width="2.5"/><rect x="14" y="38" width="20" height="5" rx="1.5" fill="#ffd02f" stroke="#000" stroke-width="3"/></svg>',
 party:'<svg viewBox="0 0 48 48"><circle cx="17" cy="16" r="6" fill="#4cc3ff" stroke="#000" stroke-width="3"/><path d="M5 38c0-8 5-13 12-13s12 5 12 13z" fill="#4cc3ff" stroke="#000" stroke-width="3"/><circle cx="33" cy="19" r="5" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M26 38c0-6 3-11 9-11s9 5 9 11z" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M38 4v10M33 9h10" stroke="#3ddc6e" stroke-width="4"/></svg>',
 join:'<svg viewBox="0 0 48 48"><rect x="6" y="12" width="26" height="24" rx="4" fill="#4cc3ff" stroke="#000" stroke-width="3"/><path d="M14 24h22M29 16l9 8-9 8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 24h22M29 16l9 8-9 8" fill="none" stroke="#000" stroke-width="1.5"/></svg>'};
const MODES=[['cpu','Play vs CPU','1v1 against the bot'],['br','Battle Royale','20 players \u00b7 last one standing'],['duos','Duos','30 players \u00b7 teams of 2'],['trios','Trios','30 players \u00b7 teams of 3'],['solo','Solo','30 players \u00b7 free for all'],['tour','Tournament','3 matches \u00b7 win the crown'],['v1','1v1','Random online opponent']];
const MINFO={};MODES.forEach(m=>MINFO[m[0]]={n:m[1],s:m[2]});IC.duos=IC.party;IC.v1=IC.rank;IC.tour='<svg viewBox="0 0 48 48"><path d="M6 8h10v8H6zM6 32h10v8H6zM32 20h10v8H32z" fill="#ffd02f" stroke="#000" stroke-width="2.6"/><path d="M16 12h8v24h-8M24 24h8" fill="none" stroke="#000" stroke-width="3"/></svg>';IC.solo='<svg viewBox="0 0 48 48"><circle cx="24" cy="15" r="7" fill="#ffd02f" stroke="#000" stroke-width="3"/><path d="M10 41c0-10 6-16 14-16s14 6 14 16z" fill="#ffd02f" stroke="#000" stroke-width="3"/><circle cx="24" cy="26" r="20" fill="none" stroke="#ff2a35" stroke-width="2.6" stroke-dasharray="5 4"/></svg>';IC.trios='<svg viewBox="0 0 48 48"><circle cx="24" cy="12" r="5.5" fill="#ffd02f" stroke="#000" stroke-width="2.6"/><path d="M14 31c0-7 4-11 10-11s10 4 10 11z" fill="#ffd02f" stroke="#000" stroke-width="2.6"/><circle cx="9" cy="20" r="5" fill="#4cc3ff" stroke="#000" stroke-width="2.6"/><path d="M0 39c0-6 3-9 9-9s8 3 8 9z" fill="#4cc3ff" stroke="#000" stroke-width="2.6"/><circle cx="39" cy="20" r="5" fill="#ff6b6b" stroke="#000" stroke-width="2.6"/><path d="M31 39c0-6 3-9 9-9s8 3 8 9z" fill="#ff6b6b" stroke="#000" stroke-width="2.6"/></svg>';
let LMODE='cpu';try{const v=localStorage.getItem('brickbrawl.lbmode');if(v==='rank')LMODE='v1';else if(v&&MINFO[v])LMODE=v}catch(e){}
const PM=document.createElement('div');PM.id='pmodes';
PM.innerHTML='<div class="wbox"><h2>CHOOSE A MODE</h2><div class="mgrid">'+MODES.map(m=>'<button class="mcard" data-m="'+m[0]+'"><span class="mi">'+IC[m[0]]+'</span><span class="mt">'+m[1]+'</span><span class="ms">'+m[2]+'</span><em></em></button>').join('')+'</div><div id="mdiff"><span>Play vs CPU difficulty</span><div class="dseg">'+['easy','normal','hard'].map(d=>'<button type="button" data-d="'+d+'">'+d[0].toUpperCase()+d.slice(1)+'</button>').join('')+'</div></div><div id="mrank"><span>Solo mode</span><button type="button" id="mrt" class="rsw"><i></i><b>RANKED</b></button><small id="mri"></small></div><div id="mfill" class="mrk"><span>Duos / Trios teammates</span><button type="button" id="mfl" class="rsw"><i></i><b>CPU</b></button><small id="mfi"></small></div><p id="mwho"></p><p id="mnote"></p><div class="wbtn"><button id="mx">Close</button></div></div>';
document.body.appendChild(PM);
const party=()=>window.Online&&Online.party?Online.party():{on:false};
const SQM=m=>m==='duos'||m==='trios';
let LFILL=false;try{LFILL=localStorage.getItem('brickbrawl.fill')==='1'}catch(e){}
// the mode the lobby shows: a party plays 1v1 against each other, except when its leader picked Duos or Trios (then the party is one squad against the CPU teams)
const curMode=p=>!p.on?LMODE:(p.role==='host'?(SQM(LMODE)?LMODE:'v1'):(SQM(p.hostMode)?p.hostMode:'v1'));
const MODEOPEN=()=>PM.style.display==='flex';
function modeCards(){const p=party();[...PM.querySelectorAll('.mcard')].forEach(c=>{const m=c.dataset.m,em=c.querySelector('em');let tag='';
  if(m!=='v1'&&p.on&&!SQM(m))tag='SOLO';else if(SQM(m)&&p.on&&p.role!=='host')tag='LEADER';
  c.classList.toggle('soon',!!tag);em.textContent=tag;em.style.display=tag?'':'none';c.classList.toggle('cur',curMode(p)===m)});
 fillRow();
 const v=PM.querySelector('[data-m=v1] .ms');if(v)v.textContent=p.on?'Your party, 1v1 against each other':'Random online opponent'+(window.Online?' \u00b7 '+Online.text():'');
 rankRow()}
// teammates for Duos and Trios: CPU fighters, or other players who are also looking (and no party of their own)
function fillRow(){const b=PM.querySelector('#mfl'),i=PM.querySelector('#mfi'),p=party();if(!b)return;b.classList.toggle('on',LFILL);b.querySelector('b').textContent=LFILL?'FILL WITH PLAYERS':'CPU TEAMMATES';
 i.innerHTML=p.on?'In a party, your party is the squad. Empty seats are CPU teammates.':LFILL?'Matched with other players looking for a squad. CPU fills empty seats after ~30 s.':'Your teammates are CPU fighters. Switch Fill on to team up with players.'}
// the Ranked switch of Solo: shows your rank and ELO, and turns the ladder on or off
function rankRow(){const R=window.RANK;if(!R)return;const on=R.on(),t=R.tier(R.state().elo),b=PM.querySelector('#mrt'),i=PM.querySelector('#mri'),s=PM.querySelector('[data-m=solo] .ms');
 b.classList.toggle('on',on);b.querySelector('b').textContent=on?'RANKED ON':'RANKED OFF';
 i.innerHTML=on?'<u style="color:'+t.color+'">'+t.label+'</u> &middot; '+R.state().elo+' ELO &middot; Solo ladder, separate from 1v1':'Casual Solo: no ELO. Switch Ranked on to climb the ranks.';
 if(s)s.textContent=on?'Ranked \u00b7 '+t.label+' \u00b7 '+R.state().elo+' ELO':'30 players \u00b7 free for all'}
const modesOpen=()=>{if(window.PROFILE&&!PROFILE.name())return PROFILE.ensure(modesOpen);$('mnote').textContent='';const who=$('mwho');if(who&&window.PROFILE)who.innerHTML='Playing as <b>'+esc(PROFILE.name())+'</b> <button id="mchg">Change name</button> <button id="mwal" class="'+(PROFILE.linked()?'linked':'')+'">'+(PROFILE.linked()?'Wallet '+PROFILE.short():'Link wallet')+'</button>';modeCards();PM.style.display='flex'},modesClose=()=>PM.style.display='none';
const dsync=()=>{[...PM.querySelectorAll('#mdiff button')].forEach(b=>b.classList.toggle('on',window.DIFF&&b.dataset.d===DIFF.get()));const m=PM.querySelector('[data-m=cpu] .ms');if(m&&window.DIFF)m.textContent='1v1 against the bot \u00b7 '+DIFF.get()[0].toUpperCase()+DIFF.get().slice(1)};dsync();
PM.addEventListener('click',e=>{if(e.target===PM)return modesClose();const db=e.target.closest('#mdiff button');if(db){window.DIFF&&DIFF.set(db.dataset.d);dsync();return}
  if(e.target.closest('#mfl')){LFILL=!LFILL;try{localStorage.setItem('brickbrawl.fill',LFILL?'1':'0')}catch(x){}fillRow();return}
 if(e.target.closest('#mrt')){window.RANK&&RANK.set(!RANK.on());rankRow();paint();return}
 const c=e.target.closest('.mcard');if(!c)return;const m=c.dataset.m,p=party();
 if(m==='tour'&&!p.on){modesClose();showSelect();window.UIpage&&UIpage('t');return}
 if(p.on&&p.role!=='host'&&(SQM(m)||m==='v1')){$('mnote').textContent='Your party leader picks the mode.';return}
 if(m!=='v1'&&p.on&&!SQM(m)){$('mnote').textContent='Leave the party first to play this mode on your own. A party plays 1v1 against each other, or Duos / Trios together.';return}
 {LMODE=m;try{localStorage.setItem('brickbrawl.lbmode',m)}catch(e){}}
 modesClose();paint()});
$('mx').onclick=modesClose;$('mwho').addEventListener('click',e=>{if(e.target.id==='mchg'){modesClose();PROFILE.edit(modesOpen)}if(e.target.id==='mwal'){modesClose();PROFILE.edit(modesOpen,'wallet')}});
// small pop-up windows of the lobby (quests, Brick Bucks, settings)
const LM=document.createElement('div');LM.className='lbm';LM.id='lbm';document.body.appendChild(LM);
const lmClose=()=>{LM.style.display='none';LM.innerHTML=''},lmOpen=h=>{LM.innerHTML='<div class="wbox">'+h+'</div>';LM.style.display='flex'};
LM.addEventListener('click',e=>{if(e.target===LM)lmClose()});
// ---------------------------------------------------------------- toast
let toastT=0;const toast=(m,ms)=>{const t=$t('#lbtoast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms||2600)};
// ---------------------------------------------------------------- daily quests: progress is counted from your account totals, rewards are Brick Bucks
const QK='brickbrawl.quests',QD=[{id:'play',t:'Play 3 matches',k:'games',n:3,r:100},{id:'win',t:'Win a match',k:'wins',n:1,r:150},{id:'ko',t:'Get 5 KOs',k:'kills',n:5,r:200}];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},tot=()=>window.ACCT?ACCT.stats():{games:0,wins:0,kills:0};
function qs(){let s=null;try{s=JSON.parse(localStorage.getItem(QK))}catch(e){}
 if(!window.ACCT)return{day:today(),base:{games:0,wins:0,kills:0},claimed:[],seen:true,tmp:1}; // (the account loads after this file; do not start the day's count before it is there)
 if(!s||s.day!==today()||!s.base){const t=tot();s={day:today(),base:{games:t.games|0,wins:t.wins|0,kills:t.kills|0},claimed:[],seen:false};qsave(s)}return s}
const qsave=s=>{try{localStorage.setItem(QK,JSON.stringify(s))}catch(e){}},qcur=(s,q)=>Math.max(0,Math.min(q.n,(tot()[q.k]|0)-(s.base[q.k]|0)));
const qready=s=>QD.filter(q=>qcur(s,q)>=q.n&&!s.claimed.includes(q.id));
function qpaint(){const s=qs(),n=qready(s).length,b=$t('#lbqn');b.style.display=(n||!s.seen)?'':'none';b.textContent=n?n:'!'}
function qopen(){const s=qs();s.seen=true;qsave(s);
 lmOpen('<h2>DAILY QUESTS</h2><div class="lbql">'+QD.map(q=>{const c=qcur(s,q),done=c>=q.n,cl=s.claimed.includes(q.id);return'<div class="qrow'+(done?' done':'')+'"><div class="qt"><b>'+q.t+'</b><div class="qbar"><i style="width:'+Math.round(c/q.n*100)+'%"></i></div><small>'+c+' / '+q.n+'</small></div><button data-q="'+q.id+'"'+(done&&!cl?'':' disabled')+'>'+(cl?'CLAIMED':done?'CLAIM +'+q.r:'+'+q.r)+'</button></div>'}).join('')+'</div><p class="lbnote">New quests every day. Rewards are Brick Bucks.</p><div class="wbtn"><button id="lmx">Close</button></div>');
 $('lmx').onclick=lmClose;LM.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const s=qs(),q=QD.find(x=>x.id===b.dataset.q);if(!q||s.claimed.includes(q.id)||qcur(s,q)<q.n)return;s.claimed.push(q.id);qsave(s);window.BUX&&BUX.add(q.r);toast('Quest complete! +'+q.r+' Brick Bucks');qopen()});qpaint()}
// ---------------------------------------------------------------- other pop-ups
function bucksOpen_old(){lmOpen('<h2>BRICK BUCKS</h2><div class="lbbal"><img class="buxcoin" alt="" draggable="false"><b data-bux></b></div><p>Earn <b>25</b> for every kill and <b>150</b> for every match win. Quests and Battle Royale placings pay too.</p><div class="wbtn"><button id="lmshop">Open Item Shop</button><button id="lmx">Close</button></div>');window.BUX&&BUX.paint();$('lmx').onclick=lmClose;$('lmshop').onclick=()=>{lmClose();window.STORE&&STORE.open()}}
let soundOn=true;
function settingsOpen(){lmOpen('<h2>SETTINGS</h2><div class="lbset"><button id="lsnd">Sound: '+(soundOn?'ON':'OFF')+'</button><button id="lnm">Change name</button><button id="lwl">'+(window.PROFILE&&PROFILE.linked()?'Wallet '+PROFILE.short():'Link wallet')+'</button><button id="lhw">How to play</button></div><div class="lbset lbmore">'+DRI.map((d,i)=>d[1]?'<button data-dr="'+i+'">'+d[0]+'</button>':'').join('')+'</div><div class="wbtn"><button id="lmx">Close</button></div>');
 LM.querySelectorAll('[data-dr]').forEach(b=>b.onclick=()=>{lmClose();DRI[+b.dataset.dr][1]()});
 $('lmx').onclick=lmClose;$('lsnd').onclick=()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'m'}));soundOn=!soundOn;$('lsnd').textContent='Sound: '+(soundOn?'ON':'OFF')};
 $('lnm').onclick=()=>{lmClose();window.PROFILE&&PROFILE.edit(paint)};$('lwl').onclick=()=>{lmClose();window.PROFILE&&PROFILE.edit(paint,'wallet')};$('lhw').onclick=()=>{lmClose();H.style.display='flex'}}
// menu drawer behind the hamburger button
const DR=$t('#lbdrawer');
const DRI=[['Spin the Wheel',()=>window.PR&&PR.open()],['Leaderboard',()=>window.LBOARD&&LBOARD.open()],['Battle Pass',()=>window.BPASS&&BPASS.open()],['Choose your map',()=>{showSelect();UIpage('a')}],['How to play',null,'thow']];
DR.innerHTML=DRI.map((d,i)=>'<button data-i="'+i+'"'+(d[2]?' id="'+d[2]+'"':'')+'>'+d[0]+'</button>').join('');
const drClose=()=>DR.classList.remove('on');
DR.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;drClose();const d=DRI[+b.dataset.i];if(d[1])d[1]();else H.style.display='flex'});
$t('#lbham').onclick=e=>{e.stopPropagation();window.FR?FR.open():toast('Friends need the online version of the game.')}; // the three lines open the friends list
document.addEventListener('click',e=>{if(!e.target.closest('#lbdrawer,#lbham'))drClose()});
// ---------------------------------------------------------------- top navigation
const NAV=[['play','PLAY',()=>goTab('play')],['fight','FIGHTERS',()=>goTab('fight'),'tfight'],['weap','WEAPONS',()=>goTab('weap')],['melee','MELEE',()=>goTab('melee')],
 ['shop','ITEM SHOP',()=>goTab('shop')],['care','CAREER',()=>goTab('care')],['bux','BRICK BUCKS',()=>goTab('bux')]];
const nv=$t('#lbnav');NAV.forEach(n=>{const b=document.createElement('button');b.textContent=n[1];b.dataset.n=n[0];if(n[3])b.id=n[3];b.onclick=n[2];nv.appendChild(b)});
// ---- the pages behind the tabs. Each tab shows its own page right under the top bar; the tab you are on is white.
const BXP=document.createElement('div');BXP.id='bxpage';
BXP.innerHTML='<div class="bxbox"><h2>BRICK BUCKS</h2><div class="lbbal"><img class="buxcoin" alt="" draggable="false"><b data-bux></b></div><p>Earn <b>25</b> for every kill and <b>150</b> for every match win. Quests and Battle Royale placings pay too.</p><div class="bxrow"><div><b>25</b><small>per KO</small></div><div><b>150</b><small>per win</small></div><div><b>+100</b><small>Royale victory</small></div></div><div class="wbtn"><button id="bxshop">Open Item Shop</button></div></div>';
document.body.appendChild(BXP);
const vis=e=>!!e&&getComputedStyle(e).display!=='none';
let curTab='play';
function pageNow(){if(vis(BXP))return'bux';if(window.STORE&&STORE.isOpen())return'shop';const ac=document.getElementById('acct');if(vis(ac))return'care';
 if(vis(menu)){if(menu.classList.contains('bro-f'))return'fight';if(menu.classList.contains('bro-w'))return'weap';if(menu.classList.contains('bro-m'))return'melee';return''}
 return vis(T)?'play':''}
function closePages(){BXP.style.display='none';const ac=document.getElementById('acct');if(ac)ac.style.display='none';
 if(window.STORE&&STORE.isOpen()){try{STORE.hide()}catch(e){}}
 const sp=document.getElementById('spinpg');if(sp)sp.style.display='none';lmClose();modesClose();drClose()}
function goTab(n){closePages();const wasMenu=vis(menu);
 if(n==='play'){menu.style.display='none';T.style.display='block';fit();paint()}
 else if(n==='fight'||n==='weap'||n==='melee'){showBrowse(n==='fight'?'f':n==='weap'?'w':'m')}
 else{T.style.display='none';menu.style.display='none';
  if(n==='shop'){window.STORE&&STORE.open()}
  else if(n==='care'){window.ACCT&&ACCT.open()}
  else if(n==='bux'){BXP.style.display='flex';window.BUX&&BUX.paint()}}
 curTab=n;tabsSync()}
let lastP='';
function tabsSync(){const p=pageNow();
 if(!p&&(lastP==='care'||lastP==='shop'||lastP==='bux')&&!vis(menu)&&!vis(document.getElementById('spinpg'))&&$('hud').style.display!=='block')return showTitle();lastP=p;[...nv.children].forEach(b=>b.classList.toggle('on',b.dataset.n===p));
 // the bar shows on the lobby and on every tab page; the old step-by-step screen and the match have their own screens
 const show=!!p;G.style.display=show?'block':'none';document.body.classList.toggle('gbar',show);
 if(p!=='play'&&p)T.style.display='none'}
setInterval(tabsSync,120);
BXP.addEventListener('click',e=>{if(e.target.id==='bxshop')goTab('shop')});
$t('#tbux').onclick=()=>goTab('bux');$t('#tbux').title='Brick Bucks';
$t('#lbgear').onclick=settingsOpen;$t('#lbqb').onclick=qopen;
// ---------------------------------------------------------------- the lobby itself
const nameNow=()=>(window.PROFILE&&PROFILE.name())||'Player';
function figure(id,k,gun,fx){return window.UIbig?UIbig(id,k,1050,1040,gun,fx):''}
// the picture is measured and moved so the fighter's FEET land exactly on the given spot of the stage (x = between the feet, y = the soles); this keeps every fighter centred on their pad whatever pose or effect they have
function placeFeet(box,img,fx,fy){try{const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;const sc=.25,cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc)),c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d');x.drawImage(img,0,0,cw,ch);const d=x.getImageData(0,0,cw,ch).data;
 let my=-1;for(let y=ch-1;y>=0&&my<0;y--)for(let i=0;i<cw;i++)if(d[(y*cw+i)*4+3]>40){my=y;break}
 if(my<0)return;let mn=1e9,mx=-1;for(let y=Math.max(0,my-Math.round(ch*.03));y<=my;y++)for(let i=0;i<cw;i++)if(d[(y*cw+i)*4+3]>40){if(i<mn)mn=i;if(i>mx)mx=i}
 const bw=box.offsetWidth,bh=box.offsetHeight,s=Math.min(bw/w,bh/h),ox=(bw-w*s)/2,oy=bh-h*s,px=ox+((mn+mx)/2/cw)*w*s,py=oy+((my+1)/ch)*h*s;
 box.style.left=Math.round(fx-px)+'px';box.style.top=Math.round(fy-py)+'px';img.style.setProperty('--ox',(px/bw*100).toFixed(1)+'%');img.style.setProperty('--oy',(py/bh*100).toFixed(1)+'%')}catch(e){}}
function tag(el,name,lv,sub,cls){el.className='lbtag '+(cls||'');el.innerHTML='<div class="shw"><i class="cr">'+SV.crown+'</i><div class="sh"><b>'+lv+'</b></div></div><div class="tx"><b>'+esc(name)+'</b><small>'+esc(sub)+'</small></div>'}
function paint(){
 const p=party(),i=window.ACCT?ACCT.info():{L:1,into:0,need:110,frac:0,max:false,xp:0},tr=window.ACCT?ACCT.tier(i.L):{name:'Rookie',c:'#8fa6c4'};
 // me
 const id=(typeof csel!=='undefined'&&LOOK[csel])?csel:Object.keys(LOOK)[0],k=window.SKN?SKN.get(id):0,gn=window.UIequip?UIequip():'',fxk=window.SHINE?SHINE.sel(id):'',src=figure(id,k,gn,fxk),hi=$t('#lbhero img');
 if(src&&hi.dataset.k!==id+'#'+k+'+'+gn+'~'+fxk){hi.src=src;hi.dataset.k=id+'#'+k+'+'+gn+'~'+fxk}hi.style.visibility=src?'visible':'hidden';$t('#lbhero').dataset.fx=fxk||'';
 const sub=!p.on?'Solo':p.role==='member'?'In party':p.phase!=='plobby'?(p.role==='host'?'Party leader':'Party'):(p.role==='host'?'Party leader':(p.ready?'Ready':'Not Ready'));
 tag($t('#lbtag'),nameNow(),i.L,sub,'me '+(p.on&&p.role==='guest'?(p.ready?'ok':'bad'):p.on?'lead':''));
 // level card
 const lc=$t('#lblvl');lc.style.borderColor=i.L>=5?tr.c:'';lc.style.boxShadow=i.L>=60?'0 8px 22px #0007,0 0 26px '+tr.c:'';lc.classList.toggle('spk',i.L>=30);
 $t('#lblvl').innerHTML='<div class="pn">'+esc(nameNow())+'</div><div class="ct" style="--tc:'+tr.c+'">'+SV.crown+'<small>'+esc(tr.name)+'</small></div><div class="lv">LEVEL <b>'+i.L+'</b></div><div class="xb"><i style="width:'+Math.round(i.frac*100)+'%"></i></div><div class="xt">'+(i.max?'MAX LEVEL':i.into.toLocaleString('en-US')+' / '+i.need.toLocaleString('en-US')+' XP')+'</div>';
 const s=window.ACCT?ACCT.stats():{wins:0,kills:0};$t('#lbwins').textContent=(s.wins|0).toLocaleString('en-US');$t('#lbkills').textContent=(s.kills|0).toLocaleString('en-US');
 window.BUX&&BUX.paint();qpaint();
 // what you have equipped (stays until you pick something else)
 try{const PK=window.PICK||{on:false},on=PK.on,nm=(o,f)=>o&&(o[f]||o.n||o.name)||'',
  rows=[['fight','FIGHTER',!on||PK.f,LOOK[csel]&&LOOK[csel].nm],['weap','PRIMARY',!on||PK.w,typeof WP!=='undefined'&&WP[wsel]&&nm(WP[wsel],'n')],['weap','SECONDARY',!on||PK.s,typeof WP!=='undefined'&&WP[LO.sec]&&nm(WP[LO.sec],'n')],['melee','MELEE',!on||PK.m,window.MW&&MW.by[MW.sel]&&MW.by[MW.sel].name]];
  $t('#lbeq').innerHTML='<h4>EQUIPPED</h4>'+rows.map(r=>'<button class="er'+(r[2]&&r[3]?'':' no')+'" data-t="'+r[0]+'"><span>'+r[1]+'</span><b>'+(r[2]&&r[3]?esc(r[3]):'Not picked')+'</b></button>').join('')}catch(e){console.error(e)}
 // bottom bar counts
 try{$t('#lbnf').textContent=Object.keys(LOOK).length;$t('#lbnw').textContent=LO.GROUPS.reduce((a,g)=>a+g[1].length,0)}catch(e){}
 // party members: you in the middle, the others on the side pads (up to 2 friends, 3 players in all)
 const peers=!p.on?[]:(p.peers&&p.peers.length?p.peers:(p.peer?[Object.assign({host:p.role==='guest',seat:true},p.peer)]:[])).filter(x=>x&&LOOK[x.f]).slice(0,SLOTS.length);
 let firstEmpty=-1;
 SLOTS.forEach((o,k)=>{const q=peers[k]||null,pe=document.getElementById(k?'lbpeer'+(k+1):'lbpeer'),pl=document.getElementById('lbplus'+(k+1));pe.classList.toggle('on',!!q);
  if(q){const pi=pe.querySelector('img'),pg=q.g&&window.WP&&WP[q.g]?q.g:(window.UIsigGun?UIsigGun(q.f):''),ps=figure(q.f,q.k|0,pg,q.fx),key=q.f+'#'+(q.k|0)+'+'+pg+'~'+(q.fx||'');if(ps&&pi.dataset.k!==key){pi.src=ps;pi.dataset.k=key}
   const sub=q.host?'Party leader':q.seat?(q.r?'Ready':'Not Ready'):'In party';
   const tg=document.getElementById('lbptag'+(k?k+1:''));tag(tg,q.n||'Friend',q.lv||1,sub,'peer lbptg sm '+(q.host?'lead':q.seat?(q.r?'ok':'bad'):''));tg.style.display=''}
  else{document.getElementById('lbptag'+(k?k+1:'')).style.display='none';if(firstEmpty<0)firstEmpty=k}
  pl.style.display=q?'none':'';pl.classList.toggle('wait',p.on&&!q&&firstEmpty===k)});
 const q=peers.find(x=>x.seat)||null;
 partyPanel(p,q,i);
 // mode + play
 const m=MINFO[curMode(p)],mb=$t('#tmode');
 mb.innerHTML='<span class="mi">'+IC[curMode(p)]+'</span><span class="mx"><small>MODE</small><b>'+m.n+(!p.on&&LMODE==='solo'&&window.RANK&&RANK.on()?' \u00b7 Ranked':'')+'</b></span><s>'+SV.caret+'</s>';mb.disabled=!!(p.on&&p.role!=='host');
 const pb=$t('#tplay'),pl=pb.querySelector('span');let txt='PLAY!',dis=false;
 const sqm=p.on&&SQM(curMode(p));
 if(sqm){if(p.role!=='host'){txt='WAITING…';dis=true}else{const n=(p.peers||[]).length;txt=p.phase==='squad'?'IN MATCH':n?'START!':'WAITING…';dis=!n||p.phase==='squad'}}
 else if(p.on){if(p.role==='member'){txt='WAITING…';dis=true}else if(p.phase!=='plobby'){txt=p.phase==='link'?'CONNECTING…':'WAITING…';dis=true}else if(p.role==='host'){txt=q?(q.r?'START!':'WAITING…'):'WAITING…';dis=!(q&&q.r)}else{txt=p.ready?'NOT READY':'READY!'}}
 pl.textContent=txt;pb.classList.toggle('dis',dis);pb.classList.toggle('ready',!!(p.on&&p.role==='guest'&&p.ready));pb.classList.toggle('long',txt.length>7);pb.classList.toggle('xlong',txt.length>9)}
function partyPanel(p,q,i){const el=$t('#lbparty');let h;
 if(!p.on){h='<h3><i>'+SV.people+'</i>PARTY</h3><p>Play with friends: up to 3 in a party. Make a party and share the code, or enter theirs.</p><div class="lbrow"><button data-a="create">CREATE PARTY</button><button data-a="join">JOIN PARTY</button></div>'}
 else{const row=(lv,nm,tx,cl)=>'<div class="mem"><i class="lvb">'+lv+'</i><b>'+esc(nm)+'</b><small class="'+(cl||'')+'">'+tx+'</small></div>';
  const lead=p.role==='host';let rows=row(i.L,nameNow(),lead?'LEADER':p.role==='member'?'IN PARTY':'YOU',p.role==='guest'?(p.ready?'ok':'bad'):'');
  (p.peers&&p.peers.length?p.peers:(p.peer?[Object.assign({host:p.role==='guest',seat:true},p.peer)]:[])).forEach(x=>{rows+=row(x.lv||1,x.n||'Friend',x.host?'LEADER':x.seat?(x.r?'READY':'NOT READY'):'IN PARTY',x.host?'':x.seat?(x.r?'ok':'bad'):'')});
  const n=1+(p.peers&&p.peers.length?p.peers.length:(p.peer?1:0));
  if(n<(p.max||3))rows+='<div class="mem wait"><span class="lbspin"></span><b>'+(p.phase==='link'?'Friend joined, connecting\u2026':'Waiting for friends ('+n+' / '+(p.max||3)+')')+'</b></div>';
  h='<h3><i>'+SV.people+'</i>PARTY <em>'+esc(p.code||'')+'</em></h3>'+rows+'<div class="lbrow"><button data-a="code">COPY CODE</button><button data-a="link">COPY LINK</button></div>'+(window.FR&&FR.on&&FR.on()?'<button class="lbinv" data-a="invite">INVITE FRIENDS</button>':'')+'<button class="lbleave" data-a="leave">LEAVE PARTY</button>'+(p.note?'<p class="lbnote">'+esc(p.note)+'</p>':'')}
 if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}}
$t('#lbparty').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a;
 if(a==='create'||a==='join'){if(!window.Online)return toast('Parties need the online version of the game.');if(window.PROFILE&&!PROFILE.name())return PROFILE.ensure(()=>Online.start(a==='create'?'party':'join'));Online.start(a==='create'?'party':'join')}
 else if(a==='leave'){window.Online&&Online.leave&&Online.leave()}
 else if(a==='invite'){window.FR&&FR.open('invite')}
 else{const p=party(),txt=a==='code'?p.code:p.link;if(!txt)return;const done=()=>toast(a==='code'?'Party code copied: '+p.code:'Invite link copied');try{navigator.clipboard.writeText(txt).then(done,()=>toast(txt,6000))}catch(x){toast(txt,6000)}}});
// the + slots open the party menu: who is in the party, the code to join it, and the buttons to share or leave
let pmT=0;
function partyMenuHtml(){const p=party(),i=window.ACCT?ACCT.info():{L:1};
 if(!p.on)return'<h2>PARTY</h2><p>Play with friends: up to 3 in a party. Make a party and share the code, or enter a friend\u2019s code.</p><div class="pmb"><button data-pm="create">CREATE PARTY</button><button data-pm="join">JOIN PARTY</button></div><div class="pmb"><button data-pm="close" class="sec">CLOSE</button></div>';
 const row=(lv,nm,tx,cl)=>'<div class="pmr"><i class="lvb">'+lv+'</i><b>'+esc(nm)+'</b><small class="'+(cl||'')+'">'+tx+'</small></div>';
 const lead=p.role==='host';let rows=row(i.L,nameNow()+' (you)',lead?'LEADER':p.role==='member'?'IN PARTY':p.phase==='plobby'?(p.ready?'READY':'NOT READY'):'IN PARTY',p.role==='guest'&&p.phase==='plobby'?(p.ready?'ok':'bad'):'');
 const peers=(p.peers&&p.peers.length?p.peers:(p.peer?[Object.assign({host:p.role==='guest',seat:true},p.peer)]:[]));
 peers.forEach(x=>{rows+=row(x.lv||1,x.n||'Friend',x.host?'LEADER':x.seat&&p.phase==='plobby'?(x.r?'READY':'NOT READY'):'IN PARTY',x.host?'':x.seat&&p.phase==='plobby'?(x.r?'ok':'bad'):'')});
 const n=1+peers.length,mx=p.max||3;for(let k=n;k<mx;k++)rows+='<div class="pmr wait"><span class="lbspin"></span><b>Waiting for a friend\u2026</b></div>';
 return'<h2>PARTY <small>'+n+' / '+mx+'</small></h2><p>Friends join with this code:</p><div class="pmc" id="pmcode">'+esc(p.code||'')+'</div><div class="pml">'+rows+'</div>'
  +'<div class="pmb"><button data-pm="code">COPY CODE</button><button data-pm="link">COPY LINK</button></div>'
  +(window.FR&&FR.on&&FR.on()?'<div class="pmb"><button data-pm="invite">INVITE FRIENDS</button></div>':'')
  +'<div class="pmb"><button data-pm="leave" class="bad">LEAVE PARTY</button><button data-pm="close" class="sec">CLOSE</button></div>'}
function partyMenu(){lmOpen('<div id="pmenu">'+partyMenuHtml()+'</div>');pmPaint();clearInterval(pmT);pmT=setInterval(pmPaint,700)}
function pmPaint(){const el=document.getElementById('pmenu');if(!el||LM.style.display==='none'){clearInterval(pmT);return}const h=partyMenuHtml();if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}}
LM.addEventListener('click',e=>{const b=e.target.closest('[data-pm]');if(!b||!document.getElementById('pmenu'))return;const a=b.dataset.pm,p=party();
 if(a==='close'){lmClose();return}
 if(a==='create'||a==='join'){if(!window.Online){toast('Parties need the online version of the game.');return}lmClose();const go=()=>Online.start(a==='create'?'party':'join');if(window.PROFILE&&!PROFILE.name())PROFILE.ensure(go);else go();return}
 if(a==='leave'){lmClose();window.Online&&Online.leave&&Online.leave();return}
 if(a==='invite'){lmClose();window.FR&&FR.open('invite');return}
 const txt=a==='code'?p.code:p.link;if(!txt)return;const done=()=>toast(a==='code'?'Party code copied: '+p.code:'Invite link copied');try{navigator.clipboard.writeText(txt).then(done,()=>toast(txt,6000))}catch(x){toast(txt,6000)}});
const plus=()=>partyMenu();
SLOTS.forEach((o,k)=>{$t('#lbplus'+(k+1)).onclick=plus});
$t('#tmode').onclick=modesOpen;
$t('#lbhero').onclick=()=>showBrowse('f');
// PLAY: starts the chosen mode; in a party the leader starts the duel and the friend readies up
// when your fighter, guns and melee are already picked (on the Fighters, Weapons and Melee tabs) PLAY goes straight on: to the map pick, or, in Battle Royale and the team modes (random map), to the drop screen
const ready=()=>!!(window.PICK&&PICK.on&&PICK.f&&PICK.w&&PICK.s&&PICK.m);
const savedMap=()=>{let v='random';try{v=localStorage.getItem('bb_map')||'random'}catch(e){}const d=window.MAPS&&MAPS.by[v];return d&&(d.hide||d.tour)&&!window.__TOWNOK?'random':v}; // (a saved pick of a removed map becomes Random)
function launch(m){
 const team=m==='br'||m==='duos'||m==='trios'||m==='solo';window.WZNOMAP=team;
 if(window.MAPS)MAPS.pickId=team?'random':savedMap(); // (Battle Royale and the team modes always use a random map)
 if(m==='cpu'){window.BRPEND=false;window.BR&&BR.sync();showSelect(false,true)}
 else if(team){if(!window.BR)return toast('Battle Royale could not load. Refresh the page.');
  if(SQM(m)&&LFILL&&!party().on){if(!window.Online||!Online.fill)return toast('Fill needs the online version of the game. Switch it off to play with CPU teammates.');return Online.fill(m)}
  if(ready()){BR.pick(()=>{window.PICK&&(PICK.a=1);T.style.display='none';menu.style.display='none';$('go').click()},m)} // everything is picked: random map, then straight to the drop screen
  else BR.pick(()=>showSelect(true,false),m)}
 else if(m==='v1'){if(window.Online)Online.start('rank');else toast('1v1 against a random opponent needs the online version of the game.')}}
function play(){const p=party();
 if(p.on&&SQM(curMode(p))){if(p.role!=='host')return toast('Your party leader starts the match.');if(p.phase==='squad')return;
  const r=window.Online&&Online.squadStart(LMODE);if(r==='alone')return toast('Waiting for a friend to join your party.');if(r==='full')return toast('Duos is for 2 players. Pick Trios for a party of 3.');if(r!==true)toast('Hang on a moment, then try again.');return}
 if(p.on){if(p.role==='member')return toast('Your party leader starts the match.');
  if(p.phase!=='plobby')return toast('Hang on, connecting to your friend…');
  if(p.role==='host'){if(!p.peer)return toast('Waiting for a friend to join');if(!p.peer.r)return toast('Your friend is not ready yet');Online.partyStart()}
  else Online.partyReady(!p.ready);return}
 if(window.PROFILE&&!PROFILE.name())return PROFILE.ensure(()=>launch(LMODE));launch(LMODE)}
$t('#tplay').onclick=play;
// ---------------------------------------------------------------- screen switching + scaling
function fit(){const W=innerWidth,Hh=innerHeight,s=Math.min(W/1672,Hh/941);st.style.transform='translate(-50%,-50%) scale('+s+')';document.documentElement.style.setProperty('--lbs',s)}
const showSelect=(keep,quick)=>{if(keep!==true){window.BRPEND=false;window.BR&&BR.sync()}if(!keep&&!window.BRPEND)window.WZNOMAP=false;T.style.display='none';menu.style.display='flex';if(window.UIbrowse)UIbrowse(null);else window.UIpage&&UIpage('f');if(quick&&ready()&&!window.WZNOMAP)window.UIpage&&UIpage('a')},
 showBrowse=k=>{window.BRPEND=false;window.BR&&BR.sync();T.style.display='none';menu.style.display='flex';if(window.UIbrowse)UIbrowse(k);window.UIfit&&UIfit()},
 showTitle=()=>{window.BRPEND=false;window.BR&&BR.sync();menu.style.display='none';T.style.display='block';drClose();fit();paint();try{window.Online&&Online.pp&&Online.pp()}catch(e){}};
const bk=document.createElement('button');bk.id='back';bk.innerHTML='<span class="bi">\u25C0</span> Lobby';bk.onclick=showTitle;
// Spin the Wheel sits right beside Title Screen; it switches the whole UI to the spin page
const sw=document.createElement('button');sw.id='wbtn';sw.onclick=()=>PR.open();
const stb=document.createElement('button');stb.id='stbtn';stb.innerHTML='<img class="buxcoin sti" alt="" draggable="false"><span class="stl">Store</span>';stb.onclick=()=>STORE.open();
const nav=document.createElement('div');nav.className='mnav';nav.append(bk,sw,stb);$('mtop').prepend(nav);{const lg=$('mtop').querySelector('.btitle');$('mtop').insertBefore(BUX.pill(),lg||null)}PR.refresh();
$('thow')&&0;$('hx').onclick=()=>H.style.display='none';
addEventListener('resize',fit);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(MODEOPEN())return modesClose();if(LM.style.display==='flex')return lmClose();if(DR.classList.contains('on'))return drClose()}
 if(e.key==='Enter'&&T.style.display!=='none'&&H.style.display!=='flex'&&$('spinpg').style.display!=='flex'&&LM.style.display!=='flex'&&!/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName||'')){if(MODEOPEN()){modesClose()}else play()}});
// a squad match (party or Fill): the map is decided, go straight to the fighter pick (or the drop screen when everything is picked)
function squad(kind,map){window.WZNOMAP=true;if(window.MAPS)MAPS.pickId=map&&MAPS.by[map]?map:'random';if(!window.BR)return toast('Battle Royale could not load. Refresh the page.');
 if(ready()){BR.pick(()=>{window.PICK&&(PICK.a=1);T.style.display='none';menu.style.display='none';$('go').click()},kind)}else BR.pick(()=>showSelect(true,false),kind)}
window.TITLE={squad,showSelect,showBrowse,showTitle,sync:()=>{paint();if(MODEOPEN())modeCards()},toast,mode:()=>LMODE,play};
{const hb=$t('#lbhero'),hi=$t('#lbhero img');hi.onload=()=>placeFeet(hb,hi,842,746);
 SLOTS.forEach((o,k)=>{const pe=document.getElementById(k?'lbpeer'+(k+1):'lbpeer'),pi=pe.querySelector('img');pi.onload=()=>placeFeet(pe,pi,o.x,o.fy)})}
showTitle();
// the account, quests and fighter pictures come from scripts that load after this one
const late=()=>{const rn=T.querySelector('.train');if(rn)st.insertBefore(rn,T.querySelector('.lbpad'));window.ACCT&&ACCT.on(paint);document.addEventListener('bb-profile',paint);paint()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',late);else late();
})();
