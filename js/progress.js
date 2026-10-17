/* Progress: kill counter, spins, unlocks (saved in the browser) and the spin-the-wheel screen. */
(()=>{
const KEY='brickbrawl.v2',OPEN=['pepe','wojak','foreman'];let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!Array.isArray(S.unlocked))S={spins:1,kills:0,unlocked:[...OPEN]};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const tz=document.createElement('div');tz.id='toast';document.body.appendChild(tz);let tt;
function toast(t){tz.textContent=t;tz.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>tz.style.opacity=0,2800)}
const SEG=['none','rare','none','epic','rare','none','legend','epic'],COL={none:'#5b6470',rare:'#2f8cff',epic:'#a44dff',legend:'#ffc400'},LBL={none:'TRY AGAIN',rare:'RARE',epic:'EPIC',legend:'LEGENDARY'};
const ov=document.createElement('div');ov.id='wheel';
ov.innerHTML='<div class="wbox"><h2>SPIN THE WHEEL</h2><p id="wsp"></p><div class="wrap"><canvas id="wc" width="360" height="360"></canvas><i class="ptr"></i></div><p id="wres">&nbsp;</p><div class="wbtn"><button id="wgo">SPIN</button><button id="wx">Close</button></div><small>1 spin for every 5 kills and 1 spin for winning a match.</small></div>';
document.body.appendChild(ov);
const cx=$('wc').getContext('2d');let ang=0,busy=false;
function draw(){cx.clearRect(0,0,360,360);cx.save();cx.translate(180,180);cx.rotate(ang*Math.PI/180);
 SEG.forEach((s,i)=>{const a0=(i*45-90)*Math.PI/180,a1=((i+1)*45-90)*Math.PI/180;cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,170,a0,a1);cx.closePath();cx.fillStyle=COL[s];cx.fill();cx.lineWidth=4;cx.strokeStyle='#000';cx.stroke();
  cx.save();cx.rotate((a0+a1)/2);cx.font='17px "Lilita One",sans-serif';cx.textAlign='right';cx.lineWidth=3;cx.strokeStyle='#000';cx.fillStyle='#fff';cx.strokeText(LBL[s],154,6);cx.fillText(LBL[s],154,6);cx.restore()});
 cx.beginPath();cx.arc(0,0,22,0,7);cx.fillStyle='#ffd02f';cx.fill();cx.stroke();cx.restore()}
function upd(){const b=$('wbtn');if(b)b.textContent='Spin the wheel ('+S.spins+')';
 $('wsp').textContent='Spins: '+S.spins+'  |  Kills: '+S.kills+' (next spin at '+(Math.floor(S.kills/5)+1)*5+')';$('wgo').disabled=busy||S.spins<1}
function done(type){busy=false;let msg='Try again! No prize this time.';
 if(type!=='none'){const pool=Object.keys(LOOK).filter(id=>LOOK[id].r===type&&!S.unlocked.includes(id));
  if(!pool.length){S.spins++;msg='You own every '+LBL[type].toLowerCase()+' fighter. Spin refunded!'}
  else{const id=pool[Math.floor(Math.random()*pool.length)];S.unlocked.push(id);msg='UNLOCKED: '+LOOK[id].nm+' ('+LBL[type]+')!';
   document.querySelectorAll('.cc').forEach(b=>b.classList.toggle('lock',!S.unlocked.includes(b.dataset.id)))}}
 save();upd();$('wres').textContent=msg}
function spin(){if(busy||S.spins<1)return;busy=true;S.spins--;save();upd();$('wres').innerHTML='&nbsp;';
 const r=Math.random()*100,type=r<30?'none':r<70?'rare':r<92?'epic':'legend',idxs=SEG.map((s,i)=>s===type?i:-1).filter(i=>i>=0),idx=idxs[Math.floor(Math.random()*idxs.length)];
 const target=-(idx*45+22.5+(Math.random()-.5)*26),a0=ang,delta=((target-a0)%360+360)%360+360*6,t0=performance.now(),D=4800;
 (function f(n){const t=Math.min(1,(n-t0)/D),e=1-Math.pow(1-t,3);ang=a0+delta*e;draw();if(t<1)requestAnimationFrame(f);else done(type)})(t0)}
$('wgo').onclick=spin;$('wx').onclick=()=>{if(!busy)ov.style.display='none'};
const _er=endRound;
endRound=function(w){_er(w);if(w!==P)return;S.kills++;const m=[];if(S.kills%5===0){S.spins++;m.push('5 kills')}if(score[0]>=2){S.spins++;m.push('match win')}
 if(m.length)toast('+'+m.length+' SPIN ('+m.join(' + ')+')! Open the wheel from the menu.');save();upd()};
window.PR={isOpen:id=>S.unlocked.includes(id),toast,done,spin,S,open:()=>{ov.style.display='flex';draw();upd()},
 mount(go){const b=document.createElement('button');b.id='wbtn';b.onclick=()=>{ov.style.display='flex';draw();upd()};go.parentNode.insertBefore(b,go);upd()}};
})();
