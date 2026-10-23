/* Brick Bucks: the in-game currency. You earn 25 for every kill and 150 for every match win, and spend them in the Store (special skins).
   The balance is saved in this browser. API: BUX.get(), BUX.add(n), BUX.spend(n) -> true/false, BUX.set(n), BUX.on(fn), BUX.fmt(n), BUX.coin (image), BUX.pill() (the header chip). */
(()=>{
const KEY='brickbrawl.bucks',MAX=999999999,COIN=''+new URL('img/brickbucks.png',location.href).href+'';
let bal=0;try{bal=Math.floor(+localStorage.getItem(KEY))||0}catch(e){}
bal=Math.max(0,Math.min(MAX,bal));
const subs=[],fmt=n=>Math.floor(n).toLocaleString('en-US');
function paint(){document.querySelectorAll('[data-bux]').forEach(e=>e.textContent=fmt(bal));document.querySelectorAll('img.buxcoin').forEach(i=>{if(i.getAttribute('src')!==COIN)i.src=COIN});subs.forEach(f=>{try{f(bal)}catch(e){}})}
function set(n){n=Math.floor(+n);if(!isFinite(n))return bal;bal=Math.max(0,Math.min(MAX,n));try{localStorage.setItem(KEY,String(bal))}catch(e){}paint();return bal}
const BUX={get:()=>bal,set,add:n=>set(bal+Math.floor(+n||0)),spend:n=>{n=Math.floor(+n);if(!(n>0)||n>bal)return false;set(bal-n);return true},on:f=>subs.push(f),fmt,coin:COIN,
 // the little chip shown in the header of the fighter and weapon screens
 pill(){let p=document.getElementById('buxpill');if(p)return p;p=document.createElement('div');p.id='buxpill';p.title='Open the Store';p.onclick=()=>window.STORE&&STORE.open();
  p.innerHTML='<img class="buxcoin" alt="" draggable="false"><span class="bt"><small>BRICK BUCKS</small><b data-bux>'+fmt(bal)+'</b></span>';paint();return p},
 paint};
window.BUX=BUX;
// ---- earning: +25 for every kill you get, +150 when you win the match. (A kill = the round ends because the other fighter went down; a round won on the storm timer with both alive is not a kill.)
BUX.KILL=25;BUX.WIN=150;
const pop=document.createElement('div');pop.id='buxpop';document.body.appendChild(pop);let pt;
function showPop(lines){pop.innerHTML=lines.map(l=>'<div><img src="'+COIN+'" alt=""><b>+'+l[0]+'</b><span>'+l[1]+'</span></div>').join('');pop.classList.remove('go');void pop.offsetWidth;pop.classList.add('go');clearTimeout(pt);pt=setTimeout(()=>pop.classList.remove('go'),3200)}
const _er=endRound;
endRound=function(w){const was=over;_er(w);if(was||w!==P)return;const L=[];
 if(E&&E.hp<=0)L.push([BUX.KILL,'KILL']);if(score[0]>=2)L.push([BUX.WIN,'MATCH WIN']);
 if(L.length){BUX.add(L.reduce((a,l)=>a+l[0],0));showPop(L)}};
BUX.pop=showPop;
addEventListener('storage',e=>{if(e.key===KEY){try{bal=Math.max(0,Math.min(MAX,Math.floor(+e.newValue)||0))}catch(x){}paint()}});
})();
