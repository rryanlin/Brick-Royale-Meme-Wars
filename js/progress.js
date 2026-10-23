/* Progress: kill counter, spins, unlocks (saved in the browser) and the spin-the-wheel screen. */
(()=>{
const KEY='brickbrawl.v2',OPEN=['pepe','wojak','foreman'];let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!Array.isArray(S.unlocked))S={spins:1,kills:0,unlocked:[...OPEN]};
// Skin Tokens (one kind per rarity) come from duplicate wheel prizes; S.pending holds a duplicate that has not been traded in yet
const RAR=['common','uncommon','rare','epic','legend'],RNM={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legend:'Legendary'},TV={common:100,uncommon:250,rare:500,epic:1000,legend:2000},TC={common:'#b8c4d0',uncommon:'#4cd05a',rare:'#2f8cff',epic:'#a44dff',legend:'#ffc400'};
if(!S.tokens||typeof S.tokens!=='object')S.tokens={};RAR.forEach(r=>{S.tokens[r]=Math.max(0,Math.floor(+S.tokens[r])||0)});
if(S.pending&&!(S.pending.id&&RAR.includes(S.pending.r)))S.pending=null;
if(!S.scrolls||typeof S.scrolls!=='object')S.scrolls={};Object.keys(S.scrolls).forEach(k=>{S.scrolls[k]=Math.max(0,Math.floor(+S.scrolls[k])||0);if(!S.scrolls[k])delete S.scrolls[k]});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const tz=document.createElement('div');tz.id='toast';document.body.appendChild(tz);let tt;
function toast(t){tz.textContent=t;tz.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>tz.style.opacity=0,2800)}
const SEG=['none','rare','none','epic','rare','none','legend','epic'],COL={none:'#5b6470',rare:'#2f8cff',epic:'#a44dff',legend:'#ffc400'},LBL={none:'TRY AGAIN',rare:'RARE',epic:'EPIC',legend:'LEGENDARY'};
// ---- full-screen spin page (opened from the Spin the Wheel button beside Title Screen, or the title art). Extra panels can be added with PR.addPanel(id,label,el,onShow).
const ov=document.createElement('div');ov.id='spinpg';
ov.innerHTML='<div class="spshell"><div class="sptop"><button id="wx"><span class="bi">◀</span> Back</button><h1>SPIN THE WHEEL</h1><div class="sptabs" id="sptabs"></div></div>'+
 '<div class="spbody" id="spbody"><section class="sppanel on" id="sp-wheel"><div class="spcard spmain"><p id="wsp"></p><div class="wrap"><canvas id="wc" width="520" height="520"></canvas><i class="ptr"></i></div><p id="wres">&nbsp;</p><div class="wbtn"><button id="wgo">SPIN</button></div><small>1 spin for every 5 kills and 1 spin for winning a match.</small></div>'+
 '<div class="spcard spinfo"><h3>PRIZES</h3><div id="sprz"></div><small class="spdup">A prize can be any fighter of that rarity. Win one you already own? Trade the duplicate for Brick Bucks, a reroll, a Skin Token (for Shiny) or that fighter\'s Scroll (for Golden).</small><h3>SKIN TOKENS</h3><div id="sptok"></div><h3>SCROLLS</h3><div id="spscr"></div><h3>YOUR FIGHTERS</h3><div id="spcol"></div></div></section></div></div>';
document.body.appendChild(ov);
const cx=$('wc').getContext('2d');let ang=0,busy=false;
function draw(){const W=520,R=W/2;cx.clearRect(0,0,W,W);cx.save();cx.translate(R,R);cx.rotate(ang*Math.PI/180);
 SEG.forEach((s,i)=>{const a0=(i*45-90)*Math.PI/180,a1=((i+1)*45-90)*Math.PI/180;cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,R-10,a0,a1);cx.closePath();cx.fillStyle=COL[s];cx.fill();cx.lineWidth=5;cx.strokeStyle='#000';cx.stroke();
  cx.save();cx.rotate((a0+a1)/2);cx.font='25px "Lilita One",sans-serif';cx.textAlign='right';cx.lineWidth=4;cx.strokeStyle='#000';cx.fillStyle='#fff';cx.strokeText(LBL[s],R-30,9);cx.fillText(LBL[s],R-30,9);cx.restore()});
 cx.beginPath();cx.arc(0,0,30,0,7);cx.fillStyle='#ffd02f';cx.fill();cx.lineWidth=5;cx.stroke();cx.restore()}
const ORDR={common:0,uncommon:1,rare:2,epic:3,legend:4},ODDS={none:30,rare:40,epic:22,legend:8},CAT=id=>{const r=LOOK[id].r;return r==='uncommon'&&!OPEN.includes(id)?'rare':r}, // the wheel has no Uncommon prize: an Uncommon fighter that is not free (the Podcaster) is won with the Rare prize
TOTAL=r=>Object.keys(LOOK).filter(id=>CAT(id)===r).length,OWN=r=>Object.keys(LOOK).filter(id=>CAT(id)===r&&S.unlocked.includes(id)).length;
const scrHTML=()=>{const ids=Object.keys(S.scrolls).filter(id=>LOOK[id]&&S.scrolls[id]>0).sort((a,b)=>S.scrolls[b]-S.scrolls[a]);return ids.length?ids.map(id=>'<div class="tok scr" style="--c:'+TC[LOOK[id].r||'common']+'"><i class="scc"></i><b>'+LOOK[id].nm+' Scroll</b><em>'+S.scrolls[id]+'</em></div>').join(''):'<small class="spdup">No scrolls yet. Trade a duplicate fighter for its Scroll.</small>'};
const tokHTML=()=>RAR.map(r=>'<div class="tok" style="--c:'+TC[r]+'"><i class="tkc"></i><b>'+RNM[r]+' Skin Token</b><em>'+S.tokens[r]+'</em></div>').join('');
function panels(){$('sptok').innerHTML=tokHTML();$('spscr').innerHTML=scrHTML();$('sprz').innerHTML=['legend','epic','rare','none'].map(r=>'<div class="prz" style="--c:'+COL[r]+'"><i></i><b>'+LBL[r]+'</b><span>'+(r==='none'?'No prize':OWN(r)+' / '+TOTAL(r)+' unlocked')+'</span><em>'+ODDS[r]+'%</em></div>').join('');
 $('spcol').innerHTML=Object.keys(LOOK).sort((x,y)=>(ORDR[LOOK[x].r||'common']||0)-(ORDR[LOOK[y].r||'common']||0)).map(id=>{const o=S.unlocked.includes(id),r=LOOK[id].r||'common',pic=window.UIportrait?UIportrait(id):'';return'<div class="fcd fr-'+r+(o?'':' lock')+'"><div class="fim">'+(pic?'<img src="'+pic+'" alt="">':'')+(o?'':'<s></s>')+'</div><b>'+LOOK[id].nm+'</b><i>'+({common:'COMMON',uncommon:'UNCOMMON',rare:'RARE',epic:'EPIC',legend:'LEGENDARY'}[r])+'</i></div>'}).join('')}
function upd(){const b=$('wbtn');if(b)b.textContent='Spin the Wheel ('+S.spins+')';
 $('wsp').innerHTML='<b>'+S.spins+'</b> spin'+(S.spins===1?'':'s')+' left &nbsp;|&nbsp; Kills: '+S.kills+' (next spin at '+(Math.floor(S.kills/5)+1)*5+')';$('wgo').disabled=busy||S.spins<1;panels()}
function done(type){busy=false;let msg='Try again! No prize this time.';
 if(type!=='none'){
  // the prize can be ANY fighter of that rarity, even one you already own (then it is a duplicate you can trade in)
  const all=Object.keys(LOOK).filter(id=>CAT(id)===type);
  if(!all.length){S.spins++;msg='Nothing to win here. Spin refunded!'}
  else{const id=all[Math.floor(Math.random()*all.length)];
   if(S.unlocked.includes(id)){S.pending={id,r:LOOK[id].r||'common'};save();upd();msg='DUPLICATE! Choose what to do with it.';$('wres').textContent=msg;showDupe();return}
   S.unlocked.push(id);msg='UNLOCKED: '+LOOK[id].nm+' ('+LBL[type]+')!';
   document.querySelectorAll('.cc').forEach(b=>b.classList.toggle('lock',!S.unlocked.includes(b.dataset.id)))}}
 save();upd();$('wres').textContent=msg}
function spin(){if(busy||S.spins<1)return;busy=true;S.spins--;save();upd();$('wres').innerHTML='&nbsp;';
 const r=Math.random()*100,type=r<30?'none':r<70?'rare':r<92?'epic':'legend',idxs=SEG.map((s,i)=>s===type?i:-1).filter(i=>i>=0),idx=idxs[Math.floor(Math.random()*idxs.length)];
 const target=-(idx*45+22.5+(Math.random()-.5)*26),a0=ang,delta=((target-a0)%360+360)%360+360*6,t0=performance.now(),D=4800;
 (function f(n){const t=Math.min(1,(n-t0)/D),e=1-Math.pow(1-t,3);ang=a0+delta*e;draw();if(t<1)requestAnimationFrame(f);else done(type)})(t0)}
$('wgo').onclick=spin;let from='title';
// ---- duplicate prize: only shown when the fighter you won is one you already have (you own every fighter of that rarity)
const dp=document.createElement('div');dp.id='dupe';document.body.appendChild(dp);
function showDupe(){const d=S.pending;if(!d){dp.style.display='none';return}const L=LOOK[d.id],pic=window.UIportrait?UIportrait(d.id):'',R=RNM[d.r];
 dp.innerHTML='<div class="wbox"><h2>DUPLICATE!</h2><div class="dpf" style="--c:'+TC[d.r]+'"><div class="fim">'+(pic?'<img src="'+pic+'" alt="">':'')+'</div><b>'+L.nm+'</b><i>'+R.toUpperCase()+'</i></div>'+
  '<p>You already own <b>'+L.nm+'</b>, so this is a duplicate. Pick what to do with it:</p><div class="dpo">'+
  '<button data-o="bux"><span class="dpi"><img class="buxcoin" alt="" src="'+(window.BUX?BUX.coin:'')+'"></span><span class="dpt"><b>Trade for '+TV[d.r].toLocaleString('en-US')+' Brick Bucks</b><small>Spend them in the Store</small></span></button>'+
  '<button data-o="spin"><span class="dpi dps">&#x21BB;</span><span class="dpt"><b>Trade for a reroll</b><small>Get this spin back and spin again</small></span></button>'+
  '<button data-o="tok"><span class="dpi"><i class="tkc" style="--c:'+TC[d.r]+'"></i></span><span class="dpt"><b>Make a '+R+' Skin Token</b><small>Used to make fighters Shiny (you have '+S.tokens[d.r]+')</small></span></button>'+
  '<button data-o="scr"><span class="dpi"><span class="dpscr" style="--c:'+TC[d.r]+'"></span></span><span class="dpt"><b>Exchange for a '+L.nm+' Scroll</b><small>Collect '+(10+5*ORDR[d.r])+' to unlock Golden '+L.nm+' (you have '+(S.scrolls[d.id]||0)+')</small></span></button></div></div>';
 dp.style.display='flex'}
dp.addEventListener('click',e=>{const b=e.target.closest('[data-o]'),d=S.pending;if(!b||!d)return;let m;
 if(b.dataset.o==='bux'){window.BUX&&BUX.add(TV[d.r]);m='Traded '+LOOK[d.id].nm+' for '+TV[d.r].toLocaleString('en-US')+' Brick Bucks!'}
 else if(b.dataset.o==='spin'){S.spins++;m='Traded '+LOOK[d.id].nm+' for a reroll! Spin again.'}
 else if(b.dataset.o==='scr'){S.scrolls[d.id]=(S.scrolls[d.id]||0)+1;m=LOOK[d.id].nm+' became a '+LOOK[d.id].nm+' Scroll! (you have '+S.scrolls[d.id]+')'}
 else{S.tokens[d.r]++;m=LOOK[d.id].nm+' became a '+RNM[d.r]+' Skin Token! (you have '+S.tokens[d.r]+')'}
 S.pending=null;save();dp.style.display='none';toast(m);upd();$('wres').textContent=m});
const close=()=>{if(busy||S.pending)return;ov.style.display='none';window.TITLE&&(from==='select'?TITLE.showSelect():TITLE.showTitle())},open=()=>{const m=document.getElementById('menu');from=m&&m.style.display!=='none'?'select':'title';
 const t=document.getElementById('title');if(t)t.style.display='none';if(m)m.style.display='none';ov.style.display='flex';draw();upd();if(S.pending)showDupe()};
$('wx').onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.style.display==='flex')close()});
// extra panels: PR.addPanel('id','Tab name',element,onShow) adds a tab beside the wheel
const tabs=$('sptabs');function showPanel(id){[...document.querySelectorAll('#spbody .sppanel')].forEach(p=>p.classList.toggle('on',p.id==='sp-'+id));[...tabs.children].forEach(b=>b.classList.toggle('on',b.dataset.p===id))}
function addPanel(id,label,el,onShow){const sec=document.createElement('section');sec.className='sppanel';sec.id='sp-'+id;sec.appendChild(el);$('spbody').appendChild(sec);
 const b=document.createElement('button');b.textContent=label;b.dataset.p=id;b.onclick=()=>{showPanel(id);onShow&&onShow()};tabs.appendChild(b)}
(()=>{const b=document.createElement('button');b.textContent='Wheel';b.dataset.p='wheel';b.className='on';b.onclick=()=>showPanel('wheel');tabs.appendChild(b)})();
const _er=endRound;
endRound=function(w){_er(w);if(w!==P)return;S.kills++;const m=[];if(S.kills%5===0){S.spins++;m.push('5 kills')}if(score[0]>=2){S.spins++;m.push('match win')}
 if(m.length)toast('+'+m.length+' SPIN ('+m.join(' + ')+')! Open the wheel from the menu.');save();upd()};
window.PR={giveSpins:n=>{S.spins+=Math.max(0,Math.floor(n)||0);save();upd()},giveTokens:(r,n)=>{if(RAR.includes(r)){S.tokens[r]+=Math.max(0,Math.floor(n)||0);save();upd()}},spendTokens:(r,n)=>{n=Math.floor(n);if(!RAR.includes(r)||!(n>0)||S.tokens[r]<n)return false;S.tokens[r]-=n;save();upd();return true},spendScrolls:(id,n)=>{n=Math.floor(n);if(!(n>0)||(S.scrolls[id]||0)<n)return false;S.scrolls[id]-=n;if(!S.scrolls[id])delete S.scrolls[id];save();upd();return true},giveScroll:(id,n)=>{if(!LOOK[id])return;S.scrolls[id]=(S.scrolls[id]||0)+Math.max(0,Math.floor(n)||0);save();upd()},scrolls:()=>S.scrolls,save,isOpen:id=>S.unlocked.includes(id),toast,done,spin,S,open,addPanel,refresh:upd,tokens:()=>S.tokens,tokenName:r=>RNM[r]+' Skin Token',RAR,RNM,TC};
})();
