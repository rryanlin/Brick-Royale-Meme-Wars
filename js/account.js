/* Account level (round 22). One general level for the whole account, 1 to 100.
   - It never changes stats in a match. It unlocks PERKS on the title screen and on the leaderboard (nameplate frames, brick rain, sparkles, name colours, a crown).
   - XP comes from finishing matches: a win is worth 100 and a loss 40, plus 15 for every KO (round you won by knocking the other fighter down);
     online matches pay 1.5x, CPU matches scale with the difficulty (Easy 0.7x, Normal 1x, Hard 1.3x).
   - The same level opens the tiers of the Battle Pass (js/bpass.js).
   - Everything is saved in this browser (the leaderboard copy is sent by js/lboard.js after online matches).
   API: ACCT.info(), ACCT.level(), ACCT.add(xp), ACCT.tier(L), ACCT.name(name, L, holder) -> HTML, ACCT.stats(), ACCT.PERKS, ACCT.xpFor(won, kos, online) */
(()=>{
const $=id=>document.getElementById(id),KEY='brickbrawl.acct',MAXL=100;
let A={xp:0,games:0,wins:0,kills:0,og:0,ow:0,ok:0,cf:[],cp:[]};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')Object.assign(A,s)}catch(e){}
['xp','games','wins','kills','og','ow','ok'].forEach(k=>{A[k]=Math.max(0,Math.floor(+A[k])||0)});['cf','cp'].forEach(k=>{A[k]=Array.isArray(A[k])?A[k].filter(n=>n>=1&&n<=MAXL):[]});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(A))}catch(e){}};
const need=L=>100+10*L,cum=L=>100*(L-1)+5*L*(L-1); // xp needed to go from level L to L+1, and total xp at which level L starts
function lvOf(xp){let L=1;while(L<MAXL&&xp>=cum(L+1))L++;return L}
function info(){const L=lvOf(A.xp),max=L>=MAXL,into=A.xp-cum(L),nd=need(L);return{L,max,into:max?nd:into,need:nd,frac:max?1:into/nd,xp:A.xp}}
// ---- frames and perks
const TIERS=[[1,'rookie','Rookie','#8fa6c4'],[5,'bronze','Bronze','#d08a4b'],[20,'silver','Silver','#cfd8e0'],[40,'gold','Gold','#ffd02f'],[60,'platinum','Platinum','#5fe0d0'],[75,'diamond','Diamond','#6bb8ff'],[100,'legend','Legend','#ff5ad1']];
const tier=L=>{let t=TIERS[0];for(const x of TIERS)if(L>=x[0])t=x;return{lv:t[0],id:t[1],name:t[2],c:t[3]}};
const PERKS=[
 [1,'Level badge','Your level and XP bar sit on the title screen.','title'],
 [5,'Bronze nameplate','A bronze frame around your title card and your leaderboard level.','both'],
 [10,'Brick rain','Little bricks drift down the title screen.','title'],
 [20,'Silver nameplate','Silver frame on the title card and the leaderboard.','both'],
 [30,'Sparkle card','Your title card glitters.','title'],
 [40,'Gold nameplate','Gold frame on the title card and the leaderboard.','both'],
 [50,'Golden name','Your name is gold on the leaderboard.','board'],
 [60,'Platinum nameplate and glow','Platinum frame, and your title card glows.','both'],
 [75,'Diamond nameplate','Diamond frame on the title card and the leaderboard.','both'],
 [90,'Shimmering name','Your leaderboard name shimmers.','board'],
 [100,'Legend nameplate and crown','The Legend frame, plus a crown over your title card.','both']];
const nameHTML=(n,L,holder)=>{const esc=String(n||'Player').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const c=holder?'nm-holder':L>=90?'nm-shim':L>=50?'nm-gold':'';return'<span class="nm '+c+'">'+esc+'</span>'};
// ---- XP from a finished match
const MULT={easy:.7,normal:1,hard:1.3};
function xpFor(won,kos,online){const m=online?1.5:(MULT[window.DIFF?DIFF.get():'normal']||1);return Math.round(((won?100:40)+15*(kos||0))*m)}
const subs=[];
function add(n){n=Math.floor(+n)||0;if(n<=0)return{gained:0,from:info().L,to:info().L};const a=info().L;A.xp+=n;save();const b=info().L;paint();subs.forEach(f=>{try{f()}catch(e){}});return{gained:n,from:a,to:b}}
// ---- popup after a match
const pop=document.createElement('div');pop.id='xppop';document.body.appendChild(pop);let pt;
function showPop(r,won,kos,online){const i=info();
 pop.innerHTML='<div class="xpr"><b>+'+r.gained+' XP</b><span>'+(won?'VICTORY':'DEFEAT')+(kos?' &middot; '+kos+' KO'+(kos>1?'s':''):'')+(online?' &middot; online x1.5':'')+'</span></div>'+
  '<div class="xpl">LEVEL <b>'+i.L+'</b><div class="xpb"><i style="width:'+Math.round(i.frac*100)+'%"></i></div>'+(i.max?'<em>MAX</em>':'<em>'+i.into+' / '+i.need+'</em>')+'</div>'+
  (r.to>r.from?'<div class="xpup">LEVEL UP! '+r.from+' &rarr; '+r.to+'</div>':'');
 pop.classList.remove('go');void pop.offsetWidth;pop.classList.add('go');clearTimeout(pt);pt=setTimeout(()=>pop.classList.remove('go'),4600)}
let K=0;
{const go=$('go');if(go)go.addEventListener('click',()=>{K=0})}
{const _e=endRound;endRound=function(w){const was=over;_e(w);if(was)return;const i=w===P?0:1;if(w===P&&E&&E.hp<=0)K++;
  if(score[i]>=2){const won=i===0,online=!!(window.NETH&&NETH.on()),kos=K;K=0;A.games++;if(won)A.wins++;A.kills+=kos;if(online){A.og++;if(won)A.ow++;A.ok+=kos}
   const r=add(xpFor(won,kos,online));save();setTimeout(()=>showPop(r,won,kos,online),900);
   if(window.BPASS&&r.to>r.from)setTimeout(()=>window.PR&&PR.toast('Battle Pass tier '+r.to+' reached! Open the Battle Pass to claim.'),5600);
   if(online&&window.LBOARD)setTimeout(()=>LBOARD.sync(),1500)}}}
// ---- title screen: player card (top left) + buttons (top right) + perk effects
const T=$('title');
const card=document.createElement('button');card.id='acard';card.type='button';card.title='Open your player card';
const right=document.createElement('div');right.id='tright';
right.innerHTML='<button type="button" id="tlb" class="trb"><i>&#127942;</i><span>Leaderboard</span></button><button type="button" id="tbp" class="trb"><i>&#9733;</i><span>Battle Pass</span><u id="tbpn"></u></button><button type="button" id="twl" class="trb"><i>&#9672;</i><span id="twlt">Link wallet</span></button>';
const rain=document.createElement('div');rain.className='train';for(let i=0;i<16;i++){const b=document.createElement('i');b.style.left=(i*6.4+Math.random()*3)+'%';b.style.animationDelay=(-Math.random()*9)+'s';b.style.animationDuration=(7+Math.random()*6)+'s';b.style.setProperty('--c',['#ff3b3b','#3d9bff','#ffd02f','#3ddc6e'][i%4]);rain.appendChild(b)}
if(T){T.appendChild(rain);T.appendChild(card);T.appendChild(right)}
function paint(){const i=info(),t=tier(i.L),nm=window.PROFILE?PROFILE.name():'',hold=window.PROFILE&&PROFILE.holder();
 card.className='acard t-'+t.id+(i.L>=30?' spk':'')+(i.L>=60?' glow':'')+(i.L>=100?' crown':'');card.style.setProperty('--tc',t.c);
 card.innerHTML='<div class="alv"><small>LV</small><b>'+i.L+'</b></div><div class="anm"><b>'+(nm?nameHTML(nm,i.L,hold):'<span class="nm">Set your name</span>')+'</b><div class="axp"><i style="width:'+Math.round(i.frac*100)+'%"></i></div><small>'+t.name+' &middot; '+(i.max?'MAX LEVEL':i.into+' / '+i.need+' XP')+'</small></div>'+(i.L>=100?'<s class="acr">&#9819;</s>':'');
 if(T){T.classList.toggle('perk-rain',i.L>=10)}
 const lk=window.PROFILE&&PROFILE.linked(),wb=$('twl');if(wb){wb.classList.toggle('linked',!!lk);wb.classList.toggle('hold',!!hold);$('twlt').textContent=lk?(hold?'Holder '+PROFILE.short():'Wallet '+PROFILE.short()):'Link wallet'}
 const n=window.BPASS?BPASS.claimable():0,bn=$('tbpn');if(bn){bn.textContent=n||'';bn.style.display=n?'':'none'}}
card.onclick=()=>openAcct();
$('tlb').onclick=()=>window.LBOARD&&LBOARD.open();
$('tbp').onclick=()=>window.BPASS&&BPASS.open();
$('twl').onclick=()=>{if(window.PROFILE)PROFILE.edit(paint,'wallet')};
document.addEventListener('bb-profile',paint);
if(window.BUX)BUX.on(()=>{});
// ---- player card pop-up with perks and stats
const ac=document.createElement('div');ac.id='acct';ac.innerHTML='<div class="wbox"></div>';document.body.appendChild(ac);
function openAcct(){const i=info(),t=tier(i.L),nm=window.PROFILE?PROFILE.name():'',hold=window.PROFILE&&PROFILE.holder(),rk=window.Online?Online.text():'Bronze 1000';
 const nxt=PERKS.find(p=>p[0]>i.L);
 ac.firstChild.innerHTML='<h2>PLAYER CARD</h2><div class="acp t-'+t.id+'" style="--tc:'+t.c+'"><div class="alv big"><small>LV</small><b>'+i.L+'</b></div><div class="anm"><b>'+(nm?nameHTML(nm,i.L,hold):'No name yet')+'</b><div class="axp"><i style="width:'+Math.round(i.frac*100)+'%"></i></div><small>'+t.name+' nameplate &middot; '+(i.max?'MAX LEVEL':i.into+' / '+i.need+' XP to level '+(i.L+1))+'</small></div></div>'+
  '<div class="acs"><div><b>'+A.games+'</b><small>Matches</small></div><div><b>'+A.wins+'</b><small>Wins</small></div><div><b>'+A.kills+'</b><small>KOs</small></div><div><b>'+A.ow+'</b><small>Online wins</small></div><div><b>'+rk+'</b><small>Rank</small></div></div>'+
  '<div class="apk">'+PERKS.map(p=>{const on=i.L>=p[0];return'<div class="'+(on?'on':'')+'"><u>'+(on?'&#10003;':'LV '+p[0])+'</u><b>'+p[1]+'</b><small>'+p[2]+'</small></div>'}).join('')+'</div>'+
  '<p class="acn">The account level never changes your stats in a match. XP: win 100, loss 40, +15 per KO (online x1.5, Hard x1.3, Easy x0.7).'+(nxt?' Next perk: <b>'+nxt[1]+'</b> at level '+nxt[0]+'.':'')+'</p>'+
  '<div class="wbtn"><button id="acnm">Change name</button><button id="acwl">'+(window.PROFILE&&PROFILE.linked()?'Wallet '+PROFILE.short():'Link wallet')+'</button><button id="acbp">Battle Pass</button><button id="acx">Close</button></div>';
 ac.style.display='flex';
 $('acx').onclick=()=>ac.style.display='none';$('acnm').onclick=()=>{ac.style.display='none';PROFILE.edit(paint)};$('acwl').onclick=()=>{ac.style.display='none';PROFILE.edit(paint,'wallet')};$('acbp').onclick=()=>{ac.style.display='none';window.BPASS&&BPASS.open()}}
ac.addEventListener('click',e=>{if(e.target===ac)ac.style.display='none'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ac.style.display==='flex')ac.style.display='none'});
window.ACCT={info,level:()=>info().L,add,tier,TIERS,PERKS,name:nameHTML,stats:()=>Object.assign({},A),xpFor,need,cum,MAXL,paint,on:f=>subs.push(f),open:openAcct,
 record:(g,w,k)=>{A.games+=g|0;A.wins+=w|0;A.kills+=k|0;save();paint();subs.forEach(f=>{try{f()}catch(e){}})},
 claimed:(tr,k)=>A[k==='p'?'cp':'cf'].includes(tr),markClaimed:(tr,k)=>{const a=A[k==='p'?'cp':'cf'];if(!a.includes(tr)){a.push(tr);save()}},
 // test / support helper: jump to a level
 setXp:n=>{A.xp=Math.max(0,Math.floor(+n)||0);save();paint();subs.forEach(f=>{try{f()}catch(e){}})}};
paint();
})();
