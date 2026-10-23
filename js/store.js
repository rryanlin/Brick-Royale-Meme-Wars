/* Store: an item shop. Only 5 special skins are for sale at a time and the line-up changes every hour (the same for every player, see SKN.shop in skins.js). Opened from the Store button,
   the Brick Bucks chip / title display, or a skin that is for sale on the Fighters screen. Shiny and Golden skins are unlocked on the Fighters screen (Skins tab), not bought. Skin Tokens (from duplicate wheel prizes) are shown on the Tokens tab. API: STORE.open(fighterId?), STORE.close(), STORE.render() */
(()=>{
const $=id=>document.getElementById(id),SKR=['common','rare','epic'],ORD={common:0,uncommon:1,rare:2,epic:3,legend:4},RLB={common:'COMMON',uncommon:'UNCOMMON',rare:'RARE',epic:'EPIC',legend:'LEGENDARY'};
const ov=document.createElement('div');ov.id='storepg';
ov.innerHTML='<div class="spshell"><div class="sptop"><button id="stx"><span class="bi">◀</span> Back</button><h1>STORE</h1><div class="sptabs" id="sttabs"></div>'+
 '<div id="stbal" title="Your Brick Bucks"><img class="buxcoin" alt="" draggable="false"><span class="bt"><small>BRICK BUCKS</small><b data-bux></b></span></div></div><div class="stbody" id="stbody"></div></div>'+
 '<div id="stconf"><div class="wbox"><h2>BUY THIS SKIN?</h2><div id="stcpic"></div><p id="stcmsg"></p><div class="wbtn"><button id="stcno">Not now</button><button id="stcyes">Buy</button></div></div></div>';
ov.insertAdjacentHTML('beforeend','<div id="crov"><div class="crbox"><div class="crstage"><div class="crcrate" id="crcrate"></div><div class="crrev" id="crrev"></div></div><p id="crmsg"></p><div class="wbtn"><button id="crmore">Open another</button><button id="crdone">Done</button></div></div></div>');
document.body.appendChild(ov);
let crBusy=false,crLast=null,tab='skins',from='title',pend=null,tkn=0,clk=null,left=0;
const fighters=()=>Object.keys(LOOK).sort((a,b)=>(ORD[LOOK[a].r||'common']||0)-(ORD[LOOK[b].r||'common']||0));
const isOpen=()=>ov.style.display==='flex',coin=n=>'<img class="buxcoin" alt="" src="'+BUX.coin+'"><span>'+BUX.fmt(n)+'</span>';
const tabs=$('sttabs');[['skins','Item Shop'],['crates','Melee Crates'],['tokens','Tokens']].forEach(([id,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.t=id;b.onclick=()=>{tab=id;render()};tabs.appendChild(b)});
// portraits are drawn a few per frame so the store opens instantly
function fill(){const t=++tkn,im=[...ov.querySelectorAll('img[data-pid]')];let i=0;(function f(){if(t!==tkn)return;for(let n=0;n<3&&i<im.length;n++,i++){const m=im[i];try{m.src=UIportrait(m.dataset.pid,+m.dataset.k)}catch(e){}}if(i<im.length)requestAnimationFrame(f)})()}
function skinCards(){const cur=id=>SKN.get(id);
 return SKN.shop().map(({id,k})=>{const nm=SKN.list(id)[k].name,own=SKN.owned(id,k),eq=own&&cur(id)===k,pr=SKN.price(id,k),can=BUX.get()>=pr,fo=window.PR&&PR.isOpen(id);
  return'<div class="stc r-'+SKR[k]+(own?' own':'')+'" data-id="'+id+'" data-k="'+k+'"><div class="stp"><img data-pid="'+id+'" data-k="'+k+'" alt="">'+(own?'':'<s></s>')+'<i class="rb r-'+SKR[k]+'">'+(k===1?'RARE':'EPIC')+'</i></div>'+
   '<b>'+nm+'</b><small>'+LOOK[id].nm+(fo?'':' \u00b7 fighter locked')+'</small>'+
   (own?'<button class="stbtn '+(eq?'eq':'equip')+'" data-a="equip">'+(eq?'EQUIPPED':'EQUIP')+'</button>':'<button class="stbtn buy'+(can?'':' poor')+'" data-a="buy">'+coin(pr)+'</button>')+'</div>'}).join('')}
const mmss=ms=>{const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),q=t%60,p=n=>String(n).padStart(2,'0');return(h?h+':'+p(m):m)+':'+p(q)};
function scrollsHTML(){const S=PR.scrolls?PR.scrolls():{},ids=Object.keys(S).filter(k=>S[k]>0&&LOOK[k]);if(!ids.length)return'<p class="stnote">No Scrolls yet. Win a fighter you already own on the wheel and choose <b>Scroll</b> to get one for that fighter.</p>';
 return'<h3 class="stsc">SCROLLS</h3><div class="stt">'+ids.map(k=>'<div class="tok big scr" style="--c:#ffc21a"><i class="tkc"></i><b>'+LOOK[k].nm+' Scrolls</b><em>'+S[k]+' / '+(window.SHINE?SHINE.scrCost(k):'?')+'</em></div>').join('')+'</div>'}
function render(){if(!isOpen()||crBusy)return;[...tabs.children].forEach(b=>b.classList.toggle('on',b.dataset.t===tab));let h='';
 if(tab==='skins'){h+='<div class="sthead"><div><b>ITEM SHOP</b><small>Only '+SKN.shop().length+' skins are for sale, and the line-up changes every hour.</small></div><div class="stclock">New items in <b id="stclk">'+mmss(SKN.nextIn())+'</b></div></div>'+
  '<p class="stnote">Special skins change how a fighter looks in a match. Buy one with Brick Bucks, then equip it. Skins you own stay yours even when they leave the shop. Earn Brick Bucks: <b>25</b> for every kill and <b>150</b> for every match win.</p><div class="stg">'+skinCards()+'</div>'+
  '<div class="stgold"><span class="lk"></span><div><b>GOLDEN SKINS</b><small>Not for sale. Unlock Shiny with Skin Tokens or Golden with a fighter&#39;s Scrolls on the Fighters screen, and you also get the matching skin.</small></div></div>'}
 else if(tab==='crates'){h+=crateTab()}
 else{const T=PR.tokens();h+='<p class="stnote">Skin Tokens come from duplicate prizes on the wheel (when you win a fighter you already own every one of). Spend them on <b>Shiny</b> (5 Common, 10 Uncommon, +5 per rarity up, 25 Legendary) from a fighter&#39;s Skins tab. <b>Golden</b> uses that fighter&#39;s own <b>Scrolls</b> instead (10 Common, +5 per rarity up, 30 Legendary), made by trading a duplicate fighter on the wheel.</p><div class="stt">'+
  PR.RAR.map(r=>'<div class="tok big" style="--c:'+PR.TC[r]+'"><i class="tkc"></i><b>'+PR.tokenName(r)+'</b><em>'+T[r]+'</em></div>').join('')+'</div>'+scrollsHTML()}
 $('stbody').innerHTML=h;if(tab==='skins')fill()}
// ---- Melee Crates: every Rare, Epic and Legendary melee weapon starts locked; these crates are how you win them (the four Common ones are yours from the start)
const CRL={rare:'RARE',epic:'EPIC',legend:'LEGENDARY'},CRC={rare:'#3d9bff',epic:'#b46bff',legend:'#ffc400'};
function crateTab(){const C=MW.crates,n=C.count(),tt=C.pool().length;
 let h='<div class="sthead"><div><b>MELEE CRATES</b><small>All melee weapons except the Common ones start locked. Open a crate to win one.</small></div><div class="stclock">Unlocked <b>'+n+' / '+tt+'</b></div></div>'+
  '<p class="stnote">A crate never gives you a weapon you already own while there is one you still need. Once you own every melee weapon, a crate pays some Brick Bucks back. Signature melee weapons are not in crates: they unlock when their fighter reaches max level.</p><div class="crg">';
 C.list.forEach(c=>{const odds=Object.keys(c.odds).map(r=>'<span style="--c:'+CRC[r]+'">'+CRL[r]+' '+c.odds[r]+'%</span>').join(''),can=BUX.get()>=c.price,done=!C.left();
  h+='<div class="crc" data-c="'+c.id+'" style="--c:'+c.c+'"><div class="crart"><i></i><i></i><u></u></div><b>'+c.name+'</b><small>'+c.tag+'</small><div class="crodds">'+odds+'</div>'+
   '<button class="crbuy'+(can?'':' poor')+'" data-c="'+c.id+'">'+(done?'ALL WON  ':'OPEN  ')+coin(c.price)+'</button></div>'});
 h+='</div><div class="crcol">';
 [['rare'],['epic'],['legend']].forEach(([r])=>{h+='<div class="crrow" style="--c:'+CRC[r]+'"><b>'+CRL[r]+'</b><div>';C.pool().filter(w=>w.rar===r).forEach(w=>{const o=C.owned(w.id);h+='<span class="crw'+(o?' own':'')+'" title="'+w.name+(o?'':' (locked)')+'"><img src="'+(window.meleePic?meleePic(w.id):'')+'" alt="'+w.name+'"><em>'+w.name+'</em>'+(o?'':'<s>&#128274;</s>')+'</span>'});h+='</div></div>'});
 return h+'</div>'}
function openCrate(cid){if(crBusy)return null;crBusy=true;const r=MW.crates.open(cid);
 if(!r.ok){crBusy=false;PR.toast(r.why==='poor'?'Not enough Brick Bucks for that crate.':'Nothing left to win from that crate.');return r}
 crLast=cid;const c=MW.crates.list.find(x=>x.id===cid),w=MW.by[r.id],cr=$('crcrate'),rv=$('crrev');
 $('crov').style.setProperty('--c',c.c);$('crov').style.display='flex';$('crmore').style.visibility='hidden';$('crdone').style.visibility='hidden';
 cr.className='crcrate shake';cr.innerHTML='<div class="crart big"><i></i><i></i><u></u></div>';rv.className='crrev';rv.innerHTML='';$('crmsg').textContent='Opening '+c.name+'...';
 const fast=!!window.__fastCrate;setTimeout(()=>{cr.className='crcrate pop';rv.className='crrev show r-'+w.rar;rv.style.setProperty('--rc',CRC[w.rar]);
  rv.innerHTML='<img src="'+meleePic(w.id)+'" alt=""><b>'+w.name+'</b><i class="rb r-'+w.rar+'">'+CRL[w.rar]+'</i>';
  $('crmsg').innerHTML=r.dup?'You already own everything! <b>+'+coin(r.refund)+'</b> back.':'<b class="crnew">NEW!</b> '+w.name+' is unlocked. Equip it on the melee page.';
  crBusy=false;$('crmore').style.visibility='visible';$('crdone').style.visibility='visible';render();try{window.UIrefresh&&UIrefresh()}catch(x){}},fast?30:1500);return r}
$('crmore').onclick=()=>{if(crLast){$('crov').style.display='none';openCrate(crLast)}};
$('crdone').onclick=()=>{$('crov').style.display='none'};
$('crov').addEventListener('click',e=>{if(e.target.id==='crov'&&!crBusy)$('crov').style.display='none'});
function ask(id,k){const pr=SKN.price(id,k);if(BUX.get()<pr){PR.toast('Not enough Brick Bucks – you need '+BUX.fmt(pr-BUX.get())+' more.');return}
 pend={id,k};$('stcpic').innerHTML='<img src="'+(()=>{try{return UIportrait(id,k)}catch(e){return''}})()+'" alt="">';
 $('stcmsg').innerHTML='<b>'+SKN.list(id)[k].name+'</b> ('+LOOK[id].nm+')<br>costs <span class="cprice">'+coin(pr)+'</span>';$('stconf').style.display='flex'}
const noAsk=()=>{pend=null;$('stconf').style.display='none'};
$('stcno').onclick=noAsk;$('stconf').addEventListener('click',e=>{if(e.target.id==='stconf')noAsk()});
$('stcyes').onclick=()=>{const p=pend;noAsk();if(!p)return;const r=SKN.buy(p.id,p.k);
 if(r.ok){PR.toast('Bought '+SKN.list(p.id)[p.k].name+'! Tap EQUIP to wear it.');render();try{window.UIrefresh&&UIrefresh()}catch(x){}}else{PR.toast(r.why==='poor'?'Not enough Brick Bucks.':r.why==='shop'?'That item just left the shop.':'You already have that skin.');render()}};
$('stbody').addEventListener('click',e=>{
 const cb=e.target.closest('.crbuy');if(cb){openCrate(cb.dataset.c);return}
 const b=e.target.closest('.stbtn'),c=e.target.closest('.stc');if(!b||!c)return;const id=c.dataset.id,k=+c.dataset.k;
 if(b.dataset.a==='buy')ask(id,k);else if(SKN.set(id,k)){PR.toast(SKN.list(id)[k].name+' equipped.');render();try{window.UIrefresh&&UIrefresh()}catch(x){}}});
function open(id){if(isOpen())return;const m=document.getElementById('menu'),t=document.getElementById('title');from=m&&m.style.display!=='none'?'select':'title';
 if(t)t.style.display='none';if(m)m.style.display='none';const sp=document.getElementById('spinpg');if(sp)sp.style.display='none';
 tab=(id==='crates')?'crates':'skins';BUX.paint();ov.style.display='flex';ov.scrollTop=0;left=SKN.nextIn();render();tick()}
function close(){if(!isOpen())return;noAsk();clearInterval(clk);ov.style.display='none';window.TITLE&&(from==='select'?TITLE.showSelect():TITLE.showTitle())}
function hide(){if(!isOpen())return;noAsk();clearInterval(clk);ov.style.display='none'}
$('stx').onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){if($('crov').style.display==='flex'){if(!crBusy)$('crov').style.display='none'}else if($('stconf').style.display==='flex')noAsk();else close()}});
BUX.on(()=>{if(isOpen())render()});
function tick(){clearInterval(clk);clk=setInterval(()=>{if(!isOpen()){clearInterval(clk);return}const l=SKN.nextIn();if(l>left+1000){left=l;noAsk();render();PR.toast('The Item Shop just changed!');return}left=l;const e=$('stclk');if(e)e.textContent=mmss(l)},1000)}
window.STORE={open,close,hide,render,isOpen,openCrate};
})();
