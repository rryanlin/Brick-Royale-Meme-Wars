/* Friends list. Everyone has a friend code: the public wallet address if one is linked (Settings > Link wallet), otherwise a code like BR-K4X9Q2M
   that is made once and kept on this device. Share it, or paste a friend's, to add them.
   How it works without a game server: every player listens on a personal inbox channel (fr-CODE, see hub.js). To add you, a friend sends a request to your inbox.
   You accept in the Friends window. Friends then ping each other every 20 seconds to show who is online and which party they are in, and can send party invites.
   Everything is stored on this device only (the friend list, pending requests). The online build only. */
(()=>{
const KEY='brickbrawl.friends',CK='brickbrawl.fcode',RQ='brickbrawl.freq',PING=20000,LIVE=52000;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:d}catch(e){return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let list=ld(KEY,[]),inc=ld(RQ,[]);const live={},ch={};let inbox=null,inboxFor='',tk=null,open=false,msg='';
const WAL=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,BRC=/^BR-[A-Z2-9]{7}$/;
const AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function own(){let c='';try{c=localStorage.getItem(CK)||''}catch(e){}if(!BRC.test(c)){c='BR-';for(let i=0;i<7;i++)c+=AL[Math.floor(Math.random()*AL.length)];try{localStorage.setItem(CK,c)}catch(e){}}return c}
const wallet=()=>window.PROFILE&&PROFILE.linked&&PROFILE.linked()?PROFILE.wallet():'';
const code=()=>wallet()||own();
const norm=c=>{c=String(c||'').trim();return /^br-/i.test(c)?c.toUpperCase():c};
const valid=c=>BRC.test(c)||WAL.test(c);
const shortC=c=>c.length>14?c.slice(0,5)+'…'+c.slice(-5):c;
const avail=()=>!!(window.Supa&&Supa.configured&&Supa.configured()&&window.HUB);
const myName=()=>(window.PROFILE&&PROFILE.name())||'Player';
const pty=()=>window.Online&&Online.party?Online.party():{on:false};
const me=()=>{const p=pty();return{c:code(),n:myName(),lv:window.ACCT?ACCT.level():1,f:(typeof csel!=='undefined'?csel:''),party:p.on&&p.code?p.code:'',full:p.on&&p.size>=(p.max||3)}};
const toast=m=>{try{window.TITLE&&TITLE.toast(m,3800)}catch(e){}};
const find=c=>list.find(x=>x.c===c);
const save=()=>{sv(KEY,list);sv(RQ,inc)};
// ---- channels
function sendTo(c,o){const h=ch[c];if(h)h.send(Object.assign({from:me()},o))}
function chan(c){if(ch[c])return;ch[c]=HUB.join('fr-'+c)}
function unchan(c){if(ch[c]){try{ch[c].leave()}catch(e){}delete ch[c]}}
function sync(){if(!avail())return;
 const my=code();if(inboxFor!==my){if(inbox){try{inbox.leave()}catch(e){}}inbox=HUB.join('fr-'+my,onMsg);inboxFor=my}
 const want=new Set(list.map(x=>x.c).concat(inc.map(x=>x.c)));
 Object.keys(ch).forEach(c=>{if(!want.has(c))unchan(c)});want.forEach(chan)}
function onMsg(m){if(!m||!m.from||!m.from.c||m.from.c===code())return;const f=m.from,fr=find(f.c);
 if(m.t==='req'){
  if(fr){fr.pend=0;fr.n=f.n||fr.n;save();sendTo(f.c,{t:'acc'});toast((f.n||'A friend')+' is now your friend.')}
  else if(!inc.find(x=>x.c===f.c)){inc.push({c:f.c,n:f.n||'Player',at:Date.now()});save();sync();toast((f.n||'Someone')+' wants to be your friend. Open Friends to accept.')}
  paintBadge();render()}
 else if(m.t==='acc'){if(fr){fr.pend=0;fr.n=f.n||fr.n;save();live[f.c]={on:Date.now(),f};toast((f.n||'Your friend')+' accepted your request.');paintBadge();render()}}
 else if(m.t==='rm'){if(fr){list=list.filter(x=>x.c!==f.c);unchan(f.c);save();paintBadge();render()}inc=inc.filter(x=>x.c!==f.c);save()}
 else if(m.t==='ping'){if(fr&&!fr.pend){fr.n=f.n||fr.n;sendTo(f.c,{t:'pong'});live[f.c]={on:Date.now(),f};paintBadge();render()}}
 else if(m.t==='pong'){if(fr){fr.pend=0;fr.n=f.n||fr.n;live[f.c]={on:Date.now(),f};paintBadge();render()}}
 else if(m.t==='inv'&&fr&&!fr.pend&&m.party){invite(f,m.party)}}
function beat(){sync();list.forEach(x=>{if(x.pend)sendTo(x.c,{t:'req'});else sendTo(x.c,{t:'ping'})});paintBadge();render()}
// ---- state
const online=c=>{const l=live[c];return !!(l&&Date.now()-l.on<LIVE)};
const onlineN=()=>list.filter(x=>!x.pend&&online(x.c)).length;
function paintBadge(){const b=document.getElementById('lbfrn');if(!b)return;const n=onlineN(),r=inc.length;b.textContent=r?'!':n||'';b.className=r?'req':n?'on':'';b.style.display=(r||n)?'':'none'}
// ---- add / accept / remove
function add(raw){const c=norm(raw);
 if(!c)return msg='Paste a friend code or wallet address first.';
 if(!valid(c))return msg='That is not a friend code. A code looks like BR-K4X9Q2M, or it is a wallet address.';
 if(c===code())return msg='That is your own code. Send it to a friend.';
 if(find(c))return msg='You are already friends.';
 if(list.length>=60)return msg='Your friend list is full (60).';
 const q=inc.find(x=>x.c===c);
 list.push({c,n:q?q.n:'',pend:q?0:1,at:Date.now()});inc=inc.filter(x=>x.c!==c);save();sync();
 if(q){sendTo(c,{t:'acc'});msg='Friend added.'}else{sendTo(c,{t:'req'});msg='Request sent. They show up as Pending until they accept (they need the game open).'}
 beat()}
function accept(c){const q=inc.find(x=>x.c===c);if(!q)return;inc=inc.filter(x=>x.c!==c);if(!find(c))list.push({c,n:q.n,pend:0,at:Date.now()});save();sync();sendTo(c,{t:'acc'});sendTo(c,{t:'ping'});paintBadge();render()}
function decline(c){sendTo(c,{t:'rm'});inc=inc.filter(x=>x.c!==c);save();sync();paintBadge();render()}
function remove(c){sendTo(c,{t:'rm'});list=list.filter(x=>x.c!==c);delete live[c];save();setTimeout(()=>{sync()},300);paintBadge();render()}
// ---- party invites
let invEl=null,invT=0;
function invite(f,party){if(!invEl){invEl=document.createElement('div');invEl.id='frinv';document.body.appendChild(invEl);
  invEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;clearTimeout(invT);invEl.style.display='none';if(b.dataset.a==='join')joinParty(invEl.dataset.p)})}
 invEl.dataset.p=party;invEl.innerHTML='<b>'+esc(f.n||'A friend')+'</b> invited you to their party<span><button data-a="join">JOIN</button><button data-a="no">NO THANKS</button></span>';invEl.style.display='flex';clearTimeout(invT);invT=setTimeout(()=>invEl.style.display='none',25000)}
function joinParty(pc){const p=pty();if(p.on)return toast('Leave your party first to join a friend’s.');if(!window.Online)return;
 const go=()=>Online.start('join',pc);if(window.PROFILE&&!PROFILE.name())PROFILE.ensure(go);else go();close()}
// ---- the window
const ov=document.createElement('div');ov.id='frm';ov.style.display='none';document.body.appendChild(ov);
function status(x){if(x.pend)return['Pending','pend'];const l=live[x.c];if(!online(x.c))return['Offline','off'];return l.f&&l.f.party?['In a party','party']:['Online','on']}
function render(){if(!open)return;
 const p=pty(),w=wallet(),c=code();
 const req=inc.map(q=>'<div class="frr"><i class="dot req"></i><b>'+esc(q.n)+'</b><small>wants to be friends</small><span><button data-a="acc" data-c="'+esc(q.c)+'">ACCEPT</button><button data-a="dec" data-c="'+esc(q.c)+'" class="x">NO</button></span></div>').join('');
 const rows=list.slice().sort((a,b)=>(online(b.c)-online(a.c))||String(a.n).localeCompare(String(b.n))).map(x=>{const[s,k]=status(x),l=live[x.c],f=l&&l.f,pc=f&&f.party;
  let act='';if(!x.pend&&online(x.c)){if(p.on&&!(pc&&pc===p.code))act+='<button data-a="inv" data-c="'+esc(x.c)+'">INVITE</button>';if(pc&&!p.on)act+='<button data-a="jn" data-c="'+esc(x.c)+'" data-p="'+esc(pc)+'">JOIN</button>'}
  return'<div class="frr"><i class="dot '+k+'"></i><b>'+esc(x.n||shortC(x.c))+(f&&f.lv?' <em>LV '+f.lv+'</em>':'')+'</b><small class="'+k+'">'+s+'</small><span>'+act+'<button data-a="rm" data-c="'+esc(x.c)+'" class="x" title="Remove friend">×</button></span></div>'}).join('');
 ov.innerHTML='<div class="wbox fr"><h2>FRIENDS</h2>'+
  '<div class="frcode"><small>YOUR FRIEND CODE'+(w?' <em>(your wallet address)</em>':'')+'</small><div><b id="frc">'+esc(shortC(c))+'</b><button data-a="copy">COPY</button></div>'+(w?'':'<small class="frhint">Link a wallet in Settings and your wallet address becomes your code.</small>')+'</div>'+
  '<div class="fradd"><input id="fra" placeholder="Paste a friend code or wallet address" autocomplete="off" spellcheck="false" autocapitalize="off"><button data-a="add">ADD</button></div>'+
  '<p class="frmsg" id="frmsg">'+esc(msg)+'</p>'+
  (inc.length?'<h3>REQUESTS</h3><div class="frl">'+req+'</div>':'')+
  '<h3>FRIENDS <em>'+onlineN()+' online</em></h3><div class="frl">'+(rows||'<p class="fre">No friends yet. Send your code, or paste theirs above.</p>')+'</div>'+
  '<div class="wbtn"><button data-a="close">Close</button></div></div>';
 const i=document.getElementById('fra');if(i){i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){add(i.value);render()}};i.onkeyup=e=>e.stopPropagation()}}
ov.addEventListener('click',e=>{if(e.target===ov)return close();const b=e.target.closest('button');if(!b)return;const a=b.dataset.a,c=b.dataset.c;
 if(a==='close')close();
 else if(a==='copy'){const t=code(),done=()=>{msg='Code copied: '+t;render()};try{navigator.clipboard.writeText(t).then(done,()=>{msg='Your code: '+t;render()})}catch(x){msg='Your code: '+t;render()}}
 else if(a==='add'){const i=document.getElementById('fra');add(i?i.value:'');render()}
 else if(a==='acc')accept(c);else if(a==='dec')decline(c);else if(a==='rm')remove(c);
 else if(a==='inv'){const p=pty();if(p.on&&p.code){sendTo(c,{t:'inv',party:p.code});msg='Invite sent.';render()}}
 else if(a==='jn')joinParty(b.dataset.p)});
function openW(mode){if(!avail())return toast('Friends need the online version of the game.');if(window.PROFILE&&!PROFILE.name())return PROFILE.ensure(()=>openW(mode));
 open=true;msg=mode==='invite'?'Tap INVITE next to a friend who is online.':'';ov.style.display='flex';beat();render()}
function close(){open=false;ov.style.display='none';ov.innerHTML=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)close()});
// ---- go
if(avail()){setTimeout(()=>{sync();beat();tk=setInterval(beat,PING)},2500);document.addEventListener('bb-profile',()=>{sync()})}
window.FR={open:openW,close,on:avail,code,own,wallet,list:()=>list.map(x=>Object.assign({},x,{online:online(x.c)})),requests:()=>inc.slice(),add,accept,decline,remove,beat,norm,valid,onlineN};
setInterval(paintBadge,5000);
})();
