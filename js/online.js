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
function vParty(code){const link=inviteLink(code);box('<h2>YOUR PARTY</h2><p>Give your friend this code:</p><div class="pcode" id="opc">'+esc(code)+'</div><div class="wbtn"><button id="ocp">Copy code</button><button id="ocl">Copy invite link</button></div><div class="spin sm"></div><p id="ops">Waiting for a friend to join&hellip;</p><div class="wbtn"><button id="oc">Leave party</button></div>');
 bind('oc',()=>endSession(true));const cp=(id,txt,msg)=>bind(id,()=>{try{navigator.clipboard.writeText(txt).then(()=>$('ops').textContent=msg,()=>$('ops').textContent=txt)}catch(e){$('ops').textContent=txt}});cp('ocp',code,'Code copied. Waiting for a friend to join…');cp('ocl',link,'Invite link copied. Waiting for a friend to join…')}
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
 S={kind:'party',phase:'lobby',role:'host',code,room:'P-'+code};vParty(code);
 const me=S;poll=setInterval(async()=>{if(S!==me){clearInterval(poll);return}
  try{const st=await Supa.rpc('party_status',{p_code:code});if(S!==me)return;
   if(!st||!st.open){clearInterval(poll);vErr('Your party closed. Create a new one.',[['OK',()=>endSession(true)]]);return}
   if(st.guest){clearInterval(poll);S.phase='link';vBusy('Friend joined! Connecting…');
    try{const c=await RTC.link({room:S.room,offerer:true});if(S!==me)return c.close();matched(c)}
    catch(e){vErr('Could not connect to your friend through the game server. Check Supabase Realtime is on (see README) and try again.',[['OK',()=>endSession(true)]])}}}
  catch(e){}},1000)}
function joinPrompt(code){S={kind:'party',phase:'join',role:'guest'};vJoin();if(code){$('oj').value=code;submitJoin()}}
async function submitJoin(){const code=($('oj').value||'').trim().toUpperCase();if(code.length<5){$('ojm').textContent='Enter the 5-letter code.';return}
 if(!window.Supa||!Supa.configured())return netErr();
 const me=S;vBusy('Joining party '+code+'…');let r;
 try{r=await Supa.rpc('party_join',{p_code:code})}catch(e){return netErr(e)}
 if(S!==me)return;
 if(!r||!r.ok){vJoin(r&&r.err==='full'?'That party is full.':r&&r.err==='self'?'That is your own party. Send the code to a friend.':'No party found with that code. Check it and try again.');return}
 S.code=code;S.room=r.room;S.phase='link';vBusy('Connecting to your friend…');
 try{const c=await RTC.link({room:r.room,offerer:false,after:r.head||0});if(S!==me)return c.close();matched(c)}
 catch(e){vErr('Could not connect to your friend through the game server. Check Supabase Realtime is on (see README) and try again.',[['OK',()=>endSession(true)]])}}

// ---------------------------------------------------------------- connected: pick fighters, both press Ready
function matched(conn){NET.conn=conn;NET.role=S.role;NET.opp={rk:S.oppRating,setup:null};
 conn.onmessage=NET.onMsg;conn.onclose=()=>onClose('closed');NET.onFlow=onFlow;NET.onEnd=onEnd;NET.onDrop=()=>onClose('timeout');S.conn=conn;hide();toSelect()}
function toSelect(){S.phase='select';S.myReady=false;S.oppReady=!!S.oppSetup;S.started=false;NET.opp.setup=S.oppSetup||null;NET.fin=false;
 menu.classList.remove('onl-ready');go.textContent='Ready';go.disabled=false;TITLE.showSelect();banner()}
function banner(){if(!S||S.phase!=='select'){bar.style.display='none';return}
 const k=S.kind==='rank'?'<b class="ob1">RANKED</b> You '+chip(RK.r)+' <span>vs</span> '+(S.oppRating!=null?chip(S.oppRating):'Opponent'):'<b class="ob1">PARTY</b> '+(S.code?esc(S.code)+' &middot; ':'')+'You vs your friend';
 const st=S.myReady?(S.oppReady?'Starting&hellip;':'You are ready. Waiting for your opponent&hellip;'):(S.oppReady?'Your opponent is ready. Pick your fighter and press Ready.':'Pick your fighter and weapon, then press Ready.');
 bar.innerHTML=k+'<em>'+st+'</em>';bar.style.display='flex'}
function sendReady(){const id=csel,L=LV.lvl('c',id),st=LV.cstats(id,L),w=wsel;NET.send({t:'rdy',s:{f:id,lv:L,mx:st[0],sp:st[1],dm:st[2],sa:st[3],w,wl:LV.lvl('g',w)}})}
function maybeStart(){if(S.role==='host'&&S.myReady&&S.oppReady&&!S.started){const seed=Math.floor(Math.random()*1e9);NET.send({t:'go',seed});start(seed)}}
function start(seed){if(S.started)return;S.started=true;S.phase='play';NET.opp.setup=S.oppSetup;S.oppReady=false;S.oppSetup=null;bar.style.display='none';menu.classList.remove('onl-ready');NET.begin(seed)}
function onFlow(m){if(!S)return;
 if(m.t==='rdy'&&m.s&&LOOK[m.s.f]&&S.phase!=='play'){S.oppSetup=m.s;if(S.phase==='select'){S.oppReady=true;NET.opp.setup=m.s;banner();maybeStart()}}
 else if(m.t==='go'&&S.phase==='select'&&S.myReady)start(m.seed|0);
 else if(m.t==='bye')onClose('bye')}
// the Ready button: in an online session it does not start the match by itself
document.addEventListener('click',e=>{if(!S||S.phase!=='select'||NET.starting||!e.target.closest)return;
 if(e.target.closest('#go')){e.stopPropagation();e.preventDefault();if(S.myReady)return;S.myReady=true;menu.classList.add('onl-ready');go.textContent='Waiting for opponent…';sendReady();banner();setTimeout(maybeStart,0)}
 else if(e.target.closest('#back'))endSession(false)},true);

// ---------------------------------------------------------------- match end, results, leaving
async function onEnd(won,sc,why){if(!S)return;S.phase='result';S.oppReady=false;S.oppSetup=null;S.won=won;S.sc=sc;S.why=why;bar.style.display='none';
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
 else{add('Rematch',()=>{hide();toSelect()},gone||!(S.conn&&S.conn.open));add('Leave party',()=>endSession(true))}}
function onClose(why){if(!S||S.closing)return;
 if(S.phase==='play'&&NET.on&&!NET.fin){S.oppGone=true;NET.abort(true);return}
 if(S.phase==='result'){S.oppGone=true;resultView();return}
 if(S.phase==='select'||S.phase==='link'||S.phase==='lobby'){const k=S.kind;endSession(false);vErr('Your opponent left.',[['OK',()=>endSession(true)]]);return}}
// leaving: from the in-match Leave button (forfeit), the Back button, or the result screen
function forfeit(){if(!S)return;if(S.phase==='play'&&NET.on&&!NET.fin){S.left=true;NET.send({t:'bye'});
  if(S.kind==='rank'&&S.matchId)Supa.rpc('report_result',{p_match:S.matchId,p_won:false}).catch(()=>{});NET.abort(false);return}
 endSession(true)}
function endSession(toTitle){const s=S;S=null;Q.on=false;clearInterval(tk);clearInterval(poll);
 if(s){if(s.conn){try{NET.send({t:'bye'})}catch(e){}setTimeout(()=>{try{s.conn.close()}catch(e){}},150)}
  if(s.kind==='party'&&s.code&&s.role==='host')Supa.rpc('party_close',{p_code:s.code}).catch(()=>{});
  if(s.kind==='rank'&&s.phase==='search')Supa.rpc('leave_queue').catch(()=>{})}
 NET.off();NET.conn=null;NET.onFlow=NET.onEnd=NET.onDrop=null;bar.style.display='none';menu.classList.remove('onl-ready');go.textContent='Fight';go.disabled=false;hide();
 if(toTitle){if(mode==='play'||mode==='over')mode='menu';window.TITLE&&TITLE.showTitle()}}
addEventListener('beforeunload',()=>{if(S&&S.phase==='play'&&NET.on&&!NET.fin){try{NET.send({t:'bye'})}catch(e){}if(S.kind==='rank'&&S.matchId&&window.Supa&&Supa.uid()){try{const c=window.BB_CONFIG,t=JSON.parse(localStorage.getItem('brickbrawl.sb')||'{}').access_token;
  fetch(c.SUPABASE_URL+'/rest/v1/rpc/report_result',{method:'POST',keepalive:true,headers:{apikey:c.SUPABASE_KEY,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({p_match:S.matchId,p_won:false})})}catch(e){}}}});

window.Online={start(m,code){if(S&&(S.phase==='select'||S.phase==='link'||S.phase==='play'))return;if(S)endSession(false);
  if(m==='rank')ranked();else if(m==='party')createParty();else if(m==='join')joinPrompt(code)},
 label:()=>chip(RK.r),text:()=>tierName(RK.r)+' '+RK.r,forfeit,tier:tierName,rating:()=>RK.r};
// invite links: ?join=ABCDE opens the join screen with the code filled in
try{const j=new URLSearchParams(location.search).get('join');if(j&&/^[A-Za-z0-9]{5}$/.test(j))setTimeout(()=>Online.start('join',j.toUpperCase()),400)}catch(e){}
})();
