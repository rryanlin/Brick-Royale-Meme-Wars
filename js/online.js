/* Online lobby: Play Ranked (Supabase queue + server-kept rating), Create / Join a Party (code or invite link),
   the "both ready" handshake and the results screen. In-match sync is in net.js, the Supabase Realtime link in rtc.js. */
(()=>{
const TIERS=[['Bronze',0,'#d08a4b'],['Silver',900,'#cfd8e0'],['Gold',1100,'#ffd02f'],['Platinum',1300,'#5fe0d0'],['Diamond',1500,'#6bb8ff'],['Legend',1700,'#ff5ad1']];
const tierOf=r=>{let t=TIERS[0];for(const x of TIERS)if(r>=x[1])t=x;return t},tierName=r=>tierOf(r)[0];
let RK={r:1000,w:0,l:0};try{const v=JSON.parse(localStorage.getItem('brickbrawl.rk'));if(v&&v.r>=0)RK=v}catch(e){}
const setRK=p=>{if(p&&typeof p.rating==='number'){RK={r:p.rating,w:p.wins||0,l:p.losses||0};try{localStorage.setItem('brickbrawl.rk',JSON.stringify(RK))}catch(e){}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const chip=r=>{const t=tierOf(r);return'<b class="tier" style="color:'+t[2]+'">'+t[0]+'</b> '+r};

let S=null,Q={on:false},poll=null,tk=null;
const ov=document.createElement('div');ov.id='onl';document.body.appendChild(ov);
const box=(h,c)=>{ov.innerHTML='<div class="wbox onl'+(c?' '+c:'')+'">'+h+'</div>';ov.style.display='flex'},hide=()=>{ov.style.display='none';ov.innerHTML=''};
const bind=(id,fn)=>{const e=document.getElementById(id);if(e)e.onclick=fn};
const bar=document.createElement('div');bar.id='nbar';document.body.appendChild(bar);
const menu=$('menu'),go=$('go');

// ---------------------------------------------------------------- views
function vBusy(msg,cancel){box('<h2>ONLINE</h2><div class="spin"></div><p>'+esc(msg)+'</p>'+(cancel?'<div class="wbtn"><button id="oc">Cancel</button></div>':''));if(cancel)bind('oc',cancel)}
function vErr(msg,btns){box('<h2>HOLD ON</h2><p class="oerr">'+esc(msg)+'</p><div class="wbtn" id="obt"></div>');const b=$('obt');
 (btns||[['OK',()=>endSession(true)]]).forEach(([t,f])=>{const x=document.createElement('button');x.textContent=t;x.onclick=f;b.appendChild(x)})}
const why=e=>{if(!e)return '';const m=String(e.message||e);if(/anonymous/i.test(m))return ' Fix: in Supabase turn on Authentication > Sign In / Providers > Allow anonymous sign-ins.';if(/Could not find the function|schema cache|does not exist|relation/i.test(m)||e.status===404)return ' Fix: run setup.sql in the Supabase SQL Editor.';if(e.status===401||e.status===403||/jwt|api key|apikey|permission/i.test(m))return ' Check the key in js/config.js and that setup.sql was run.';if(m==='network'||/failed to fetch|networkerror|load failed/i.test(m))return ' The browser could not connect. Check the project URL in js/config.js and that the Supabase project is not paused.';return ''};
const netErr=e=>vErr(Supa.configured()?'Could not reach the online service.'+why(e)+(e?' ['+String(e.message||e).slice(0,160)+(e.status?' / '+e.status:'')+']':''):'Online play is not set up yet.',[['OK',()=>endSession(true)]]);
function vSearch(){box('<h2>FINDING A MATCH</h2><div class="rk">Your rank: '+chip(RK.r)+' <small>'+RK.w+'W '+RK.l+'L</small></div><div class="spin"></div><p id="osr">Searching near your rank&hellip; 0s</p><small>The search widens the longer you wait.</small><div class="wbtn"><button id="oc">Cancel</button></div>');bind('oc',cancelSearch)}
function vJoin(msg){box('<h2>JOIN A PARTY</h2><p>Enter your friend&rsquo;s 5-letter code:</p><input id="oj" maxlength="5" autocomplete="off" spellcheck="false" placeholder="ABCDE"><p class="oerr" id="ojm">'+(msg?esc(msg):'&nbsp;')+'</p><div class="wbtn"><button id="ojg">Join</button><button id="oc">Back</button></div>');
 const i=$('oj');i.oninput=()=>{i.value=i.value.toUpperCase().replace(/[^A-Z0-9]/g,'')};i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')submitJoin()};setTimeout(()=>i.focus(),50);bind('ojg',submitJoin);bind('oc',()=>endSession(true))}
const inviteLink=code=>{try{return location.origin+location.pathname+'?join='+code}catch(e){return code}};

// ---------------------------------------------------------------- ranked
async function ranked(){
 if(!window.Supa||!Supa.configured())return netErr();
 vBusy('Connecting to the online service…');
 try{setRK(await Supa.rpc('ensure_player'))}catch(e){return netErr(e)}
 S={kind:'rank',phase:'search'};Q={on:true,t0:Date.now()};vSearch();
 tk=setInterval(()=>{const e=$('osr');if(e)e.innerHTML='Searching near your rank&hellip; '+Math.round((Date.now()-Q.t0)/1000)+'s'},500);
 try{while(Q.on){const r=await Supa.rpc('find_match');if(!Q.on)break;if(r&&r.match){clearInterval(tk);Q.on=false;return foundRanked(r)}await sleep(2000)}}
 catch(e){if(Q.on){Q.on=false;clearInterval(tk);netErr(e)}}
 clearInterval(tk)}
function cancelSearch(){Q.on=false;clearInterval(tk);Supa.rpc('leave_queue').catch(()=>{});endSession(true)}
async function foundRanked(r){
 S={kind:'rank',phase:'link',role:r.host?'host':'guest',matchId:r.match,room:r.match,oppRating:r.opp_rating};
 vBusy('Opponent found ('+tierName(r.opp_rating)+', '+r.opp_rating+'). Connecting…');
 try{const c=await RTC.link({room:r.match,offerer:r.host});if(!S||S.matchId!==r.match)return c.close();matched(c)}
 catch(e){const m=S&&S.matchId;Supa.rpc('cancel_match',{p_match:m}).catch(()=>{});
  vErr('Could not connect to your opponent through the game server. No rating was changed.',[['Search again',()=>{endSession(false);ranked()}],['Cancel',()=>endSession(true)]])}}

// ---------------------------------------------------------------- parties
async function createParty(){
 if(!window.Supa||!Supa.configured())return netErr();
 vBusy('Creating your party…');let code;
 try{code=await Supa.rpc('party_create')}catch(e){return netErr(e)}
 S={kind:'party',phase:'lobby',role:'host',code,room:'P-'+code};crewOpen(code);hide();showLobby();
 const me=S;poll=setInterval(async()=>{if(S!==me){clearInterval(poll);return}
  try{const st=await Supa.rpc('party_status',{p_code:code});if(S!==me)return;
   if(!st||!st.open){clearInterval(poll);vErr('Your party closed. Create a new one.',[['OK',()=>endSession(true)]]);return}
   if(st.guest){clearInterval(poll);S.phase='link';sync();
    try{const c=await RTC.link({room:S.room,offerer:true});if(S!==me)return c.close();matched(c)}
    catch(e){vErr('Could not connect to your friend through the game server. Check Supabase Realtime is on (see README) and try again.',[['OK',()=>endSession(true)]])}}}
  catch(e){}},1000)}
function joinPrompt(code){S={kind:'party',phase:'join',role:'guest'};vJoin();if(code){$('oj').value=code;submitJoin()}}
async function submitJoin(){const code=($('oj').value||'').trim().toUpperCase();if(code.length<5){$('ojm').textContent='Enter the 5-letter code.';return}
 if(!window.Supa||!Supa.configured())return netErr();
 const me=S;vBusy('Joining party '+code+'…');let r;
 try{r=await Supa.rpc('party_join',{p_code:code})}catch(e){return netErr(e)}
 if(S!==me)return;
 if(r&&r.err==='full')return joinAsMember(code);
 if(!r||!r.ok){vJoin(r&&r.err==='full'?'That party is full.':r&&r.err==='self'?'That is your own party. Send the code to a friend.':'No party found with that code. Check it and try again.');return}
 S.code=code;S.room=r.room;S.phase='link';crewOpen(code);hide();showLobby();
 try{const c=await RTC.link({room:r.room,offerer:false,after:r.head||0});if(S!==me)return c.close();matched(c)}
 catch(e){vErr('Could not connect to your friend through the game server. Check Supabase Realtime is on (see README) and try again.',[['OK',()=>endSession(true)]])}}

// ---------------------------------------------------------------- connected: pick fighters, both press Ready
function matched(conn){NET.conn=conn;NET.role=S.role;NET.opp={rk:S.oppRating,setup:null};
 conn.onmessage=NET.onMsg;conn.onclose=()=>onClose('closed');NET.onFlow=onFlow;NET.onEnd=onEnd;NET.onDrop=()=>onClose('timeout');S.conn=conn;hide();if(S.kind==='party')toPLobby(false);else toSelect()}
// ---------------------------------------------------------------- the party roster: up to 3 players see each other in the lobby
// Everyone in a party (the leader, the friend who holds the 1v1 seat and up to 3 more) joins a small broadcast channel called crew-CODE and says hello every 3 seconds.
// The 1v1 itself still runs over the direct link between the leader and the first friend; the others stand in the lobby with you.
const CREWMAX=3;let crew=null,crewT=null,myCid='';const crewPeers=new Map();
const crewMsg=t=>({t,c:myCid,h:!!(S&&S.role==='host'),r:!!(S&&S.myPR),p:myProfile(),md:(S&&S.role==='host'&&window.TITLE&&TITLE.mode&&/^(duos|trios)$/.test(TITLE.mode()))?TITLE.mode():''});
function crewBeat(){if(crew&&S)crew.h.send(crewMsg('hi'))}
function crewOpen(code){crewClose();myCid=((window.Supa&&Supa.uid&&Supa.uid())||'')+'-'+Math.random().toString(36).slice(2,8);crewPeers.clear();
 const h=HUB.join('crew-'+code,m=>{if(!m||!m.c||m.c===myCid||!S||S.code!==code)return;
  if(m.t==='hi'){const old=crewPeers.get(m.c);crewPeers.set(m.c,{c:m.c,p:m.p||{},h:!!m.h,r:!!m.r,md:m.md||'',at:Date.now(),t:old?old.t:Date.now()});if(!old){crewBeat()}sync()}
  else if(m.t==='sq'){if(m.h&&Array.isArray(m.order))squadGo(m)}
  else if(m.t==='bye'){crewPeers.delete(m.c);if(m.h)crewHostGone();sync()}});
 crew={h,code};crewBeat();
 crewT=setInterval(()=>{crewBeat();const now=Date.now();let lost=false,host=false;crewPeers.forEach((v,k)=>{if(now-v.at>11000){crewPeers.delete(k);lost=true;if(v.h)host=true}});if(host)crewHostGone();else if(lost)sync()},3000)}
function crewClose(){clearInterval(crewT);crewT=null;if(crew){try{crew.h.send({t:'bye',c:myCid,h:!!(S&&S.role==='host')})}catch(e){}const c=crew;crew=null;setTimeout(()=>{try{c.h.leave()}catch(e){}},400)}crewPeers.clear()}
function crewHostGone(){if(!S||S.kind!=='party'||S.role==='host')return;if(S.role==='guest'&&S.conn&&S.conn.open!==false&&S.phase!=='plobby')return; // (a guest in a match: the direct link reports it)
 const was=S.phase;endSession(false);if(was!=='join')try{window.TITLE&&TITLE.toast('The party was closed by its leader.')}catch(e){}}
const crewList=()=>[...crewPeers.values()].sort((a,b)=>(b.h-a.h)||(a.t-b.t)).map(v=>Object.assign({},v.p,{c:v.c,host:v.h,md:v.md,r:(S&&S.peer&&S.peer.cid===v.c)?!!S.peerReady:v.r,seat:!!(S&&S.peer&&S.peer.cid===v.c)}));
// the party is full (the 1v1 seat is taken): join the roster only
async function joinAsMember(code){const me=S;S.code=code;crewOpen(code);vBusy('Joining party '+code+'…');
 const t0=Date.now();while(Date.now()-t0<4200&&S===me){if([...crewPeers.values()].some(x=>x.h))break;await sleep(150)}
 if(S!==me)return;
 if(![...crewPeers.values()].some(x=>x.h)){crewClose();S={kind:'party',phase:'join',role:'guest'};return vJoin('That party is full.')}
 if(crewPeers.size>=CREWMAX){crewClose();S={kind:'party',phase:'join',role:'guest'};return vJoin('That party is full (3 players).')}
 S.role='member';S.phase='plobby';S.crewOnly=true;S.myPR=false;hide();showLobby();sendPP()}
// the party lobby (the title screen shows both fighters; the leader picks the mode and starts)
const sync=()=>{try{window.TITLE&&TITLE.sync&&TITLE.sync()}catch(e){}};
function showLobby(){try{window.TITLE&&TITLE.showTitle()}catch(e){}sync()}
function myProfile(){const id=(typeof csel!=='undefined'&&LOOK[csel])?csel:Object.keys(LOOK)[0];return{n:(window.PROFILE&&PROFILE.name())||'Player',f:id,k:window.SKN?SKN.get(id):0,g:window.UIequip?UIequip():'',fx:window.SHINE?SHINE.sel(id):'',lv:window.ACCT?ACCT.level():1,cid:myCid}}
function sendPP(){crewBeat();if(S&&S.kind==='party'&&S.conn&&S.conn.open!==false&&(S.phase==='plobby')){try{NET.send({t:'pp',s:myProfile(),r:!!S.myPR})}catch(e){}}}
function toPLobby(notify){S.phase='plobby';S.myPR=false;S.peerReady=false;S.myReady=false;S.oppReady=false;S.oppSetup=null;S.started=false;NET.fin=false;S.note='';menu.classList.remove('onl-ready');bar.style.display='none';go.textContent='Back to party lobby';go.disabled=false;
 if(notify){try{NET.send({t:'pback'})}catch(e){}}showLobby();sendPP()}
function partyStart(){if(!S||S.kind!=='party'||S.phase!=='plobby'||S.role!=='host'||!S.peer||!S.peerReady)return false;NET.send({t:'pgo'});toSelect();return true}
function partyReady(b){if(!S||S.kind!=='party'||S.phase!=='plobby'||S.role!=='guest')return;S.myPR=!!b;sendPP();crewBeat();sync()}
function partyView(){if(!S||S.kind!=='party'||S.phase==='join')return{on:false};
 const hp=[...crewPeers.values()].find(x=>x.h);
 return{on:true,hostMode:S.role==='host'?'':(hp&&hp.md)||'',code:S.code,link:inviteLink(S.code),role:S.role,phase:S.phase,peer:S.peer?Object.assign({},S.peer,{r:!!S.peerReady}):null,peers:crewList(),size:crewPeers.size+1,max:CREWMAX,ready:!!S.myPR,note:S.note||''}}
function toSelect(){S.phase='select';S.myReady=false;S.oppReady=!!S.oppSetup;S.started=false;NET.opp.setup=S.oppSetup||null;NET.fin=false;
 menu.classList.remove('onl-ready');go.textContent='Ready';go.disabled=false;TITLE.showSelect(false,true);banner()}
function banner(){if(!S||S.phase!=='select'){bar.style.display='none';return}
 const k=S.kind==='rank'?'<b class="ob1">RANKED</b> You '+chip(RK.r)+' <span>vs</span> '+(S.oppRating!=null?chip(S.oppRating):'Opponent'):'<b class="ob1">PARTY</b> '+(S.code?esc(S.code)+' &middot; ':'')+'You vs your friend';
 const st=S.myReady?(S.oppReady?'Starting&hellip;':'You are ready. Waiting for your opponent&hellip;'):(S.oppReady?'Your opponent is ready. Pick your fighter and press Ready.':'Pick your fighter and weapon, then press Ready.');
 bar.innerHTML=k+'<em>'+st+'</em>';bar.style.display='flex'}
function sendReady(){const id=csel,L=LV.lvl('c',id),st=window.SHINE?SHINE.stats(id,L):LV.cstats(id,L),w=window.SIG&&SIG.is(wsel)&&!SIG.ok(wsel)?LOOK[id].sw:wsel;NET.send({t:'rdy',s:{n:(window.PROFILE&&PROFILE.name())||'',f:id,k:(window.SKN?SKN.get(id):0),fx:(window.SHINE?SHINE.sel(id):''),lv:L,mx:st[0],sp:st[1],dm:st[2],sa:st[3],w,wl:LV.lvl('g',w),mw:window.MW?MW.sel:'hammer'}})}
function maybeStart(){if(S.role==='host'&&S.myReady&&S.oppReady&&!S.started){const seed=Math.floor(Math.random()*1e9),map=window.MAPS?MAPS.resolve(seed):'town';NET.send({t:'go',seed,map});start(seed,map)}}
function start(seed,map){if(S.started)return;S.started=true;NET.map=window.MAPS&&MAPS.by[map]?map:'town';S.phase='play';NET.opp.setup=S.oppSetup;S.oppReady=false;S.oppSetup=null;bar.style.display='none';menu.classList.remove('onl-ready');NET.begin(seed)}
function onFlow(m){if(!S)return;
 if(m.t==='pp'){if(m.s&&LOOK[m.s.f]&&S.kind==='party'){const first=!S.peer;S.peer={n:String(m.s.n||'').slice(0,20),f:m.s.f,k:m.s.k|0,lv:m.s.lv|0,cid:String(m.s.cid||'').slice(0,60),g:String(m.s.g||'').slice(0,24),fx:window.SHINE?SHINE.valid(m.s.fx):''};S.peerReady=!!m.r;if(first)sendPP();sync()}return}
 if(m.t==='pgo'){if(S.kind==='party'&&S.phase==='plobby'&&S.role==='guest')toSelect();return}
 if(m.t==='pback'){if(S.kind==='party'&&(S.phase==='select'||S.phase==='result'))toPLobby(false);return}
 if(m.t==='rdy'&&m.s&&LOOK[m.s.f]&&S.phase!=='play'){S.oppSetup=m.s;if(S.phase==='select'){S.oppReady=true;NET.opp.setup=m.s;banner();maybeStart()}}
 else if(m.t==='go'&&S.phase==='select'&&S.myReady)start(m.seed|0,m.map);
 else if(m.t==='bye')onClose('bye')}
// ---------------------------------------------------------------- squads: Duos and Trios with real teammates (js/squad.js plays the match)
const mapFor=id=>{const l=window.MAPS&&MAPS.ring&&MAPS.ring.ids?MAPS.ring.ids():[];if(!l.length)return 'random';let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return l[h%l.length]};
// the party leader presses PLAY on Duos / Trios: everyone in the party joins one squad (the rest of the seats are CPU teammates)
function squadStart(kind){if(!S||S.kind!=='party'||S.role!=='host'||!crew)return false;if(S.phase==='squad'||S.phase==='select'||S.phase==='play')return false;
 const peers=[...crewPeers.values()].sort((a,b)=>a.t-b.t);if(!peers.length)return 'alone';
 const need=kind==='duos'?2:3;if(peers.length+1>need)return 'full';
 const id=S.code+'-'+Math.random().toString(36).slice(2,6),order=[myCid].concat(peers.map(v=>v.c)),map=mapFor(id);
 const m={t:'sq',c:myCid,h:true,id,kind,map,order};crew.h.send(m);crew.h.send(m);squadGo(m);return true}
function squadGo(m){if(!S||S.kind!=='party'||S.phase==='squad'||S.phase==='select'||S.phase==='play'||!window.SQ||!window.TITLE)return;
 const idx=m.order.indexOf(myCid);if(idx<0||!/^(duos|trios)$/.test(m.kind))return;
 S.pre=S.phase;S.phase='squad';SQ.arm({id:String(m.id).slice(0,40),kind:m.kind,idx,size:m.order.length,map:String(m.map||'random')});TITLE.squad(m.kind,String(m.map||'random'));sync()}
// the squad match is over (the player went back to the menu): the party lobby is as it was
function sqEnd(){if(S&&S.phase==='squad'){S.phase=S.pre||'plobby';S.pre=null;sync()}}
// Fill: no party, but real teammates from the waiting room (supabase fill_join); CPU teammates fill the seats nobody takes
async function fill(kind){
 if(!window.Supa||!Supa.configured())return netErr();
 vBusy('Connecting to the online service…');
 try{await Supa.rpc('ensure_player')}catch(e){return netErr(e)}
 const me=S={kind:'fill',phase:'search'};const t0=Date.now();
 box('<h2>FINDING TEAMMATES</h2><div class="rk">'+(kind==='duos'?'Duos &middot; 1 teammate':'Trios &middot; 2 teammates')+'</div><div class="spin"></div><p id="osr">Looking for players&hellip; 0s</p><small>If nobody else is looking, CPU teammates fill the empty seats.</small><div class="wbtn"><button id="oc">Cancel</button></div>');
 bind('oc',()=>{Supa.rpc('fill_leave').catch(()=>{});endSession(true)});
 try{while(S===me){const w=(Date.now()-t0)/1000;const r=await Supa.rpc('fill_join',{p_kind:kind,p_force:w>14});if(S!==me)return;
   if(r&&r.status==='match'){S=null;hide();const id=r.id;SQ.arm({id,kind,idx:r.seat|0,size:r.size|0,map:mapFor(id)});TITLE.squad(kind,mapFor(id));return}
   if(w>30){Supa.rpc('fill_leave').catch(()=>{});S=null;hide();try{TITLE.toast('Nobody else was looking, so CPU teammates fill your squad.',4000)}catch(e){}TITLE.squad(kind,'random');return}
   const e=$('osr');if(e)e.innerHTML='Looking for players&hellip; '+Math.round(w)+'s';
   await sleep(1500)}}
 catch(e){if(S===me){S=null;netErr(e)}}}
// the Ready button: in an online session it does not start the match by itself
document.addEventListener('click',e=>{if(S&&S.kind==='party'&&S.phase==='plobby'&&e.target.closest&&e.target.closest('#go')){e.stopPropagation();e.preventDefault();showLobby();return}
 if(!S||S.phase!=='select'||NET.starting||!e.target.closest)return;
 if(e.target.closest('#go')){e.stopPropagation();e.preventDefault();if(S.myReady)return;S.myReady=true;menu.classList.add('onl-ready');go.textContent='Waiting for opponent…';sendReady();banner();setTimeout(maybeStart,0)}
 else if(e.target.closest('#back')){if(S.kind==='party')toPLobby(true);else endSession(false)}},true);

// ---------------------------------------------------------------- match end, results, leaving
async function onEnd(won,sc,why){if(!S)return;window.PICK&&PICK.reset&&PICK.reset();S.phase='result';S.oppReady=false;S.oppSetup=null;S.won=won;S.sc=sc;S.why=why;bar.style.display='none';
 if(S.kind==='rank'&&S.matchId){S.rate='wait';resultView();
  try{const r=await Supa.rpc('report_result',{p_match:S.matchId,p_won:!!won});applyRate(r);
   for(let i=0;i<28&&S&&S.rate==='wait'&&S.phase==='result';i++){await sleep(1500);if(!S||S.phase!=='result')break;applyRate(await Supa.rpc('match_result',{p_match:S.matchId}))}}catch(e){if(S&&S.rate==='wait'){S.rate='fail';resultView()}}}
 else resultView()}
function applyRate(r){if(!S||!r)return;if(r.status==='applied'){S.rate='done';S.delta=r.delta;setRK(r)}else if(r.status==='disputed'||r.status==='void')S.rate=r.status;else S.rate='wait';resultView()}
function resultView(){if(!S||S.phase!=='result')return;const won=S.won,sc=S.sc||[0,0],gone=S.why==='opp-left'||S.oppGone;
 const head=won?'VICTORY!':'DEFEAT',sub=S.why==='opp-left'?'Your opponent left the match.':S.why==='me-left'?'You left the match.':'Final score '+sc[0]+' - '+sc[1];
 let rk='';if(S.kind==='rank'){const d=S.delta,r=RK.r;
  rk=S.rate==='done'?'<div class="rres '+(d>=0?'up':'dn')+'"><span>'+(d>=0?'+':'')+d+'</span> rating &rarr; '+chip(r)+'<small>'+RK.w+'W '+RK.l+'L</small></div>':
   S.rate==='wait'?'<div class="rres"><div class="spin sm"></div> Updating your rating&hellip;</div>':
   S.rate==='disputed'?'<div class="rres">Results did not match, so no rating change.</div>':
   S.rate==='void'?'<div class="rres">Match voided. No rating change.</div>':'<div class="rres">Could not update your rating right now.</div>'}
 box('<h2 class="'+(won?'win':'lose')+'">'+head+'</h2><p>'+sub+'</p>'+rk+'<div class="wbtn" id="orb"></div>','res');
 const bt=$('orb'),add=(t,f,dis)=>{const x=document.createElement('button');x.textContent=t;x.onclick=f;if(dis)x.disabled=true;bt.appendChild(x)};
 if(S.kind==='rank'){add('Find another match',()=>{const k=S;endSession(false);ranked()});add('Back to title',()=>endSession(true))}
 else{add('Rematch',()=>{hide();toSelect()},gone||!(S.conn&&S.conn.open));add('Party lobby',()=>{hide();toPLobby(true)},gone||!(S.conn&&S.conn.open));add('Leave party',()=>endSession(true))}}
function onClose(why){if(!S||S.closing)return;
 if(S.phase==='play'&&NET.on&&!NET.fin){S.oppGone=true;NET.abort(true);return}
 if(S.phase==='result'){S.oppGone=true;resultView();return}
 if(S.phase==='plobby'){endSession(false);showLobby();try{TITLE.toast('Your friend left the party.')}catch(e){}return}
 if(S.phase==='select'||S.phase==='link'||S.phase==='lobby'){const k=S.kind;endSession(false);vErr('Your opponent left.',[['OK',()=>endSession(true)]]);return}}
// leaving: from the in-match Leave button (forfeit), the Back button, or the result screen
function forfeit(){if(!S)return;if(S.phase==='play'&&NET.on&&!NET.fin){S.left=true;NET.send({t:'bye'});
  if(S.kind==='rank'&&S.matchId)Supa.rpc('report_result',{p_match:S.matchId,p_won:false}).catch(()=>{});NET.abort(false);return}
 endSession(true)}
function endSession(toTitle){const s=S;crewClose();S=null;Q.on=false;clearInterval(tk);clearInterval(poll);
 if(s){if(s.conn){try{NET.send({t:'bye'})}catch(e){}setTimeout(()=>{try{s.conn.close()}catch(e){}},150)}
  if(s.kind==='party'&&s.code&&s.role==='host')Supa.rpc('party_close',{p_code:s.code}).catch(()=>{});
  if(s.kind==='rank'&&s.phase==='search')Supa.rpc('leave_queue').catch(()=>{});if(s.kind==='fill')Supa.rpc('fill_leave').catch(()=>{})}
 NET.off();NET.conn=null;NET.onFlow=NET.onEnd=NET.onDrop=null;bar.style.display='none';menu.classList.remove('onl-ready');go.textContent='Fight';go.disabled=false;hide();
 if(toTitle){if(mode==='play'||mode==='over')mode='menu';window.TITLE&&TITLE.showTitle()}sync()}
addEventListener('beforeunload',()=>{if(S&&S.phase==='play'&&NET.on&&!NET.fin){try{NET.send({t:'bye'})}catch(e){}if(S.kind==='rank'&&S.matchId&&window.Supa&&Supa.uid()){try{const c=window.BB_CONFIG,t=JSON.parse(localStorage.getItem('brickbrawl.sb')||'{}').access_token;
  fetch(c.SUPABASE_URL+'/rest/v1/rpc/report_result',{method:'POST',keepalive:true,headers:{apikey:c.SUPABASE_KEY,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({p_match:S.matchId,p_won:false})})}catch(e){}}}});

window.Online={start(m,code){if(S&&(S.phase==='select'||S.phase==='link'||S.phase==='play'||S.phase==='plobby'))return;if(S)endSession(false);
  if(m==='rank')ranked();else if(m==='party')createParty();else if(m==='join')joinPrompt(code)},
 party:partyView,partyStart,squadStart,fill,sqEnd,partyReady,leave:()=>endSession(true),pp:sendPP,label:()=>chip(RK.r),text:()=>tierName(RK.r)+' '+RK.r,forfeit,tier:tierName,rating:()=>RK.r};
// invite links: ?join=ABCDE opens the join screen with the code filled in
try{const j=new URLSearchParams(location.search).get('join');if(j&&/^[A-Za-z0-9]{5}$/.test(j))setTimeout(()=>Online.start('join',j.toUpperCase()),400)}catch(e){}
})();
