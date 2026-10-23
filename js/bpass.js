/* Battle Pass (round 22): 100 tiers, one per account level (see account.js). Every tier has a FREE reward; the PREMIUM track is open to players who hold $BRICKROYALE
   in the wallet they linked (the same read-only holder check as the leaderboard name colour). Rewards you have not claimed wait for you, so premium tiers you
   passed before getting premium can still be claimed once it is on. Rewards: Brick Bucks, wheel spins, Skin Tokens and character Scrolls (see scrolls in progress.js).
   API: BPASS.open(), BPASS.close(), BPASS.reward(tier, 'f'|'p'), BPASS.claim(tier, 'f'|'p'), BPASS.claimAll(), BPASS.claimable(), BPASS.premium() */
(()=>{
const $=id=>document.getElementById(id),MAXL=100,PER=10,RL={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legend:'Legendary'},TC={common:'#b8c4d0',uncommon:'#4cd05a',rare:'#2f8cff',epic:'#a44dff',legend:'#ffc400'};
const BR=t=>t<=20?'common':t<=40?'uncommon':t<=60?'rare':t<=80?'epic':'legend';
const FREE=t=>t===100?{k:'tok',r:'legend',n:3}:t%25===0?{k:'spin',n:2}:t%10===0?{k:'tok',r:BR(t),n:2}:t%5===0?{k:'spin',n:1}:{k:'bux',n:50+5*t};
const PREM=t=>t===100?{k:'scr',r:'legend',n:3}:t%20===0?{k:'scr',r:BR(t),n:1}:t%10===0?{k:'tok',r:BR(t),n:3}:t%5===0?{k:'spin',n:1}:{k:'bux',n:100+8*t};
const reward=(t,k)=>k==='p'?PREM(t):FREE(t);
const premium=()=>!!(window.PROFILE&&PROFILE.linked()&&PROFILE.holder());
const lvl=()=>window.ACCT?ACCT.level():1;
function claimable(){let n=0;const L=lvl(),p=premium();for(let t=1;t<=Math.min(L,MAXL);t++){if(!ACCT.claimed(t,'f'))n++;if(p&&!ACCT.claimed(t,'p'))n++}return n}
function apply(r){switch(r.k){
 case'bux':BUX.add(r.n);return r.n.toLocaleString('en-US')+' Brick Bucks';
 case'spin':PR.giveSpins(r.n);return r.n+' wheel spin'+(r.n>1?'s':'');
 case'tok':PR.giveTokens(r.r,r.n);return r.n+' '+RL[r.r]+' Skin Token'+(r.n>1?'s':'');
 case'scr':{const ids=Object.keys(LOOK).filter(i=>LOOK[i].r===r.r);if(!ids.length)return'';const id=ids[Math.floor(Math.random()*ids.length)];PR.giveScroll(id,r.n);return r.n+' '+LOOK[id].nm+' Scroll'+(r.n>1?'s':'')}}return''}
function claim(t,k){t=+t;if(!(t>=1&&t<=MAXL)||t>lvl()||ACCT.claimed(t,k))return null;if(k==='p'&&!premium())return null;const msg=apply(reward(t,k));ACCT.markClaimed(t,k);return msg||'claimed'}
function claimAll(){const got=[];for(let t=1;t<=Math.min(lvl(),MAXL);t++)for(const k of['f','p']){const m=claim(t,k);if(m)got.push(m)}return got}
// ---- page
const ov=document.createElement('div');ov.id='bpass';
ov.innerHTML='<div class="spshell"><div class="sptop"><button id="bpx"><span class="bi">◀</span> Back</button><h1>BATTLE PASS</h1><div id="bplv"></div></div><div class="bpbody"><div class="bpban" id="bpban"></div><div class="bpnav"><button id="bpl" type="button">&#9664;</button><b id="bppg"></b><button id="bpr" type="button">&#9654;</button></div><div class="bpg" id="bpg"></div><div class="bpdots" id="bpdots"></div></div></div>';
document.body.appendChild(ov);
let page=0,from='title';const pages=MAXL/PER;
const ico=r=>r.k==='bux'?'<img class="buxcoin" alt="" src="'+BUX.coin+'">':r.k==='spin'?'<span class="bpi wheel"></span>':r.k==='tok'?'<i class="tkc" style="--c:'+TC[r.r]+'"></i>':'<span class="bpi scroll" style="--c:'+TC[r.r]+'"></span>';
const txt=r=>r.k==='bux'?r.n.toLocaleString('en-US'):r.k==='spin'?r.n+' Spin'+(r.n>1?'s':''):r.k==='tok'?r.n+' '+RL[r.r]+' Token':r.n+' '+RL[r.r]+' Scroll';
const sub=r=>r.k==='bux'?'Brick Bucks':r.k==='spin'?'Wheel':r.k==='tok'?'Skin Token':'Random character';
function cell(t,k){const r=reward(t,k),L=lvl(),got=ACCT.claimed(t,k),open=t<=L,prem=k==='p',lockP=prem&&!premium();
 const st=got?'got':!open?'wait':lockP?'plock':'ready';
 return'<button type="button" class="bpc '+k+' '+st+(r.k==='scr'||r.k==='tok'?' big':'')+'" data-t="'+t+'" data-k="'+k+'" aria-label="Tier '+t+' '+(prem?'premium':'free')+' reward">'+ico(r)+'<b>'+txt(r)+'</b><small>'+sub(r)+'</small>'+(got?'<s class="bpck">&#10003;</s>':st==='plock'?'<s class="bplk">&#128274;</s>':st==='ready'?'<em>CLAIM</em>':'')+'</button>'}
function draw(){const i=ACCT.info(),L=i.L,p=premium(),live=window.PROFILE&&PROFILE.tokenLive();
 $('bplv').innerHTML='<div class="alv"><small>LV</small><b>'+L+'</b></div><div class="axp"><i style="width:'+Math.round(i.frac*100)+'%"></i></div><small>'+(i.max?'MAX LEVEL':i.into+' / '+i.need+' XP')+'</small>';
 const n=claimable();
 $('bpban').innerHTML='<div class="bpp'+(p?' on':'')+'"><b>'+(p?'&#9733; PREMIUM PASS ACTIVE':'&#128274; PREMIUM PASS LOCKED')+'</b><span>'+(p?'You hold $BRICKROYALE in your linked wallet, so every premium reward is yours to claim.':!window.PROFILE||!PROFILE.linked()?'Link your wallet and hold <b>$BRICKROYALE</b> to unlock the premium rewards. The wallet is read-only: we never ask you to sign anything.':!live?'Your wallet is linked. The $BRICKROYALE holder check goes live when the coin launches.':'Your linked wallet does not hold $BRICKROYALE right now. Hold some, then press Re-check.')+'</span></div>'+
  '<div class="bpbt">'+(p?'':'<button type="button" id="bpw">'+(window.PROFILE&&PROFILE.linked()?'Re-check wallet':'Link wallet')+'</button>')+'<button type="button" id="bpall"'+(n?'':' disabled')+'>Claim all'+(n?' ('+n+')':'')+'</button></div>';
 $('bppg').textContent='Tiers '+(page*PER+1)+' - '+(page*PER+PER);$('bpl').disabled=page<=0;$('bpr').disabled=page>=pages-1;
 let h='';for(let t=page*PER+1;t<=page*PER+PER;t++)h+='<div class="bpt'+(t<=L?' reach':'')+(t===L?' cur':'')+'"><div class="bpn"><b>'+t+'</b></div>'+cell(t,'p')+cell(t,'f')+'</div>';
 h='<div class="bplab"><span>PREMIUM</span><span>FREE</span></div><div class="bpcols">'+h+'</div>';$('bpg').innerHTML=h;
 $('bpdots').innerHTML=Array.from({length:pages},(_,q)=>'<button type="button" data-q="'+q+'" class="'+(q===page?'on':'')+'" aria-label="Tiers '+(q*PER+1)+' to '+(q*PER+PER)+'"></button>').join('');
 if(window.ACCT)ACCT.paint()}
function open(){const m=$('menu'),t=$('title');from=m&&m.style.display!=='none'?'select':'title';if(t)t.style.display='none';if(m)m.style.display='none';['spinpg','storepg'].forEach(i=>{const e=$(i);if(e)e.style.display='none'});
 const L=lvl();let f=0;for(let q=1;q<=Math.min(L,MAXL);q++)if(!ACCT.claimed(q,'f')){f=q;break}page=Math.min(pages-1,Math.floor(((f||L)-1)/PER));ov.style.display='flex';draw()}
function close(){if(ov.style.display!=='flex')return;ov.style.display='none';window.TITLE&&(from==='select'?TITLE.showSelect():TITLE.showTitle());if(window.ACCT)ACCT.paint()}
$('bpx').onclick=close;$('bpl').onclick=()=>{page=Math.max(0,page-1);draw()};$('bpr').onclick=()=>{page=Math.min(pages-1,page+1);draw()};
ov.addEventListener('click',e=>{
 const d=e.target.closest('#bpdots button');if(d){page=+d.dataset.q;draw();return}
 if(e.target.closest('#bpall')){const g=claimAll();PR.toast(g.length?'Claimed: '+g.slice(0,4).join(', ')+(g.length>4?' and '+(g.length-4)+' more':'')+'!':'Nothing to claim yet.');draw();return}
 if(e.target.closest('#bpw')){if(window.PROFILE&&PROFILE.linked()){PROFILE.check(true).then(()=>draw());PR.toast('Checking your wallet...')}else PROFILE.edit(draw,'wallet');return}
 const c=e.target.closest('.bpc');if(!c)return;const t=+c.dataset.t,k=c.dataset.k;
 if(c.classList.contains('got'))return PR.toast('Already claimed.');
 if(c.classList.contains('wait'))return PR.toast('Reach account level '+t+' to claim this (you are level '+lvl()+').');
 if(c.classList.contains('plock'))return PR.toast('Premium reward: link your wallet and hold $BRICKROYALE.');
 const m=claim(t,k);if(m){PR.toast('Claimed '+m+'!');draw()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.style.display==='flex')close()});
document.addEventListener('bb-profile',()=>{if(ov.style.display==='flex')draw()});
if(window.ACCT)ACCT.on(()=>{if(ov.style.display==='flex')draw()});
window.BPASS={open,close,reward,claim,claimAll,claimable,premium,isOpen:()=>ov.style.display==='flex',TC};
if(window.ACCT)ACCT.paint();
})();
