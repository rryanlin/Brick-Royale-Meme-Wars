/* Round clock and the closing red zone.
   0:00-1:30  normal round. A countdown shows when the zone starts.
   1:30       no more health, shield or loot-bag spawns (anything on the ground is removed) and a red circular zone starts closing in
              from the whole arena toward the middle. Standing outside it burns health.
   2:30       the zone is only a few blocks wide. If nobody has died by now, the round goes to whoever has more health (armor, then
              the host, breaks a tie). Online, both players swap their numbers first so they always agree on the result. */
(()=>{
let T0=90,T1=150,R0=46,R1=3,BURN=.07; // (Battle Royale changes these through STORM.cfg) zone starts, time up, start radius, end radius, health burned per second as a share of max health
let t=0,ended=false,mine=null,opp=null,tmAt=0,warned=false;
const zr=()=>t<T0?R0:R0+(R1-R0)*Math.min(1,(t-T0)/(T1-T0));
const r2=v=>Math.round(v*100)/100,fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
// ---- HUD: timer + red edge when you are in the storm
const zt=document.createElement('div');zt.id='zt';zt.innerHTML='<i class="zf"></i><span class="zs"></span>';$('mid').appendChild(zt);
const zf=zt.firstChild,zs=zt.lastChild;
function setZt(cls,text,frac){zt.className=cls||'';zs.textContent=text;zf.style.width=Math.max(0,Math.min(1,frac||0))*100+'%';zt.style.display=text?'block':'none'} // a bar that drains as time runs out, with the countdown written inside it
const zh=document.createElement('div');zh.id='zhurt';document.body.appendChild(zh);
// danger warning: big banner + arrow that points to the safe middle (relative to where the camera looks) + health bar flash
const zw=document.createElement('div');zw.id='zwarn';zw.innerHTML='<i id="zarr"></i><div><b></b><small></small></div>';$('mid').appendChild(zw);
const zwB=zw.querySelector('b'),zwS=zw.querySelector('small'),zarr=zw.querySelector('#zarr'),hpBar=document.querySelector('#hud .bar');let tick=0,wstate='';
function danger(state,r){ // state: '' | 'near' | 'burn'
 if(state!==wstate){wstate=state;zw.className=state;zh.className=state;if(hpBar)hpBar.classList.toggle('zburn',state==='burn');
  if(state==='burn'){zwB.textContent='OUT OF THE ZONE';zwS.textContent='TAKING DAMAGE - RUN TO THE MIDDLE'}
  else if(state==='near'){zwB.textContent='ZONE EDGE';zwS.textContent='STAY INSIDE THE CIRCLE'}}
 if(state){const dx=-P.x,dz=-P.z,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
  zarr.style.transform='rotate('+Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz)+'rad)'}}
// ---- the zone itself: a red wall and a red tint on the ground outside the circle
const RED=0xff1e1e; // ONE flat red for the wall, the rim and the ground outside. fog:false on all three: the map fog (blue, pink, yellow...) used to tint the far side of the wall, which made the storm change colour from place to place.
const wall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,70,96,1,true),new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:.3,side:THREE.BackSide,fog:false,depthWrite:false}));
wall.position.y=30;wall.visible=false;wall.userData.sh=1;wall.renderOrder=8;S.add(wall);
const edge=new THREE.Mesh(new THREE.TorusGeometry(1,.06,6,96),new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:.75,fog:false,depthWrite:false}));
edge.rotation.x=Math.PI/2;edge.position.y=.35;edge.visible=false;edge.userData.sh=1;S.add(edge);
const A0=A;let TA=A;const CVS=512;const cv=document.createElement('canvas');cv.width=cv.height=CVS;const cx=cv.getContext('2d'),tex=new THREE.CanvasTexture(cv);
const tint=new THREE.Mesh(new THREE.PlaneGeometry(2*A,2*A),new THREE.MeshBasicMaterial({map:tex,transparent:true,fog:false,depthWrite:false}));
tint.rotation.x=-Math.PI/2;tint.position.y=.32;tint.visible=false;tint.userData.sh=1;tint.renderOrder=7;S.add(tint);
let drawn=-1;
function paint(r){if(Math.abs(r-drawn)<.12)return;drawn=r;cx.globalCompositeOperation='source-over';cx.clearRect(0,0,CVS,CVS);cx.fillStyle='rgba(255,30,30,.32)';cx.fillRect(0,0,CVS,CVS);
 cx.globalCompositeOperation='destination-out';cx.beginPath();cx.arc(CVS/2,CVS/2,Math.max(1,r*CVS/(2*TA)),0,6.2832);cx.fill();tex.needsUpdate=true}
function show(on){wall.visible=edge.visible=tint.visible=on;if(!on)drawn=-1}
function noLoot(){for(const c of chests){c.t=1e9;c.m.visible=false}for(const s of SPOTS){s.on=false;s.t=1e9;s.m.visible=false}}
// ---- time up
const net=()=>window.NET&&NET.on;
const cmp=(a,b,host)=>a[0]!==b[0]?(a[0]>b[0]?1:-1):a[1]!==b[1]?(a[1]>b[1]?1:-1):(host?1:-1);
function verdict(){ended=true;setZt('over','TIME UP!',0);
 if(!net()){const a=[r2(P.hp),r2(P.ar)],b=[r2(E.hp),r2(E.ar)];endRound(cmp(a,b,true)>0?P:E);return}
 mine=[r2(P.hp),r2(P.ar)];tmAt=performance.now();NETH.tm(mine);decide()}
function decide(){if(!ended||over||!mine||!net())return;
 if(!opp){if(performance.now()-tmAt>4000){opp=[r2(E.hp),r2(E.ar)]}else return}
 const iWin=cmp(mine,opp,NETH.role()==='host')>0;mine=null;
 if(!iWin)endRound(E); // tells the other player (message 'd'); the winner just waits for it
}
window.STORM={size(a){TA=a;tint.scale.setScalar(a/A0);drawn=-1},center(){return[0,0]},_seek:v=>{t=v},cfg(a,b,c,d){T0=a;T1=b;R0=c;R1=d},def(){T0=90;T1=150;R0=46;R1=3},onOpp(v){if(Array.isArray(v)&&v.length===2){opp=[+v[0]||0,+v[1]||0];decide()}},time:()=>t,radius:()=>zr(),on:()=>t>=T0};
// the bot keeps out of the storm inside nav.js (it uses STORM.on and STORM.radius)
const _rr=resetRound;resetRound=function(i){_rr(i);if(!window.BRX){T0=90;T1=150;R0=46;R1=3}t=0;ended=false;mine=opp=null;warned=false;show(false);setZt('','',0);danger('',0);tick=0};
const _step=step;step=function(dt){const act=!over&&introT<=0&&mode==='play';_step(dt);
 if(mode!=='play'){show(false);setZt('','',0);danger('',0);return}
 if(!act){if(over)danger('',0);return}
 t+=dt;
 if(t<T0){const left=T0-t;setZt(left<10?'warn':'','ZONE CLOSES IN '+fmt(left),left/T0)}
 else{if(!warned){warned=true;say(window.BRX?'THE STORM IS CLOSING IN - STAY INSIDE THE CIRCLE':'THE ZONE IS CLOSING - NO MORE HEALS OR LOOT - MORE HEALTH WINS',3);try{window.SFX&&SFX.boom&&SFX.boom()}catch(e){}}
  if(!window.BRX)noLoot();const r=zr();show(true);paint(r);wall.scale.set(r,1,r);edge.scale.set(r,r,r);
  const left=T1-t;if(!ended)setZt(left<10?'zone blink':'zone','ZONE CLOSING '+fmt(left),left/(T1-T0))
  // burn anyone outside the circle (online, each player burns themselves; the other side reports it in their health)
  let hurtMe=false;
  const bn=window.BRX?BURN*(1+2*Math.min(1,(t-T0)/(T1-T0))):BURN; // Battle Royale: the storm hurts more the longer it runs
  for(const e of ENTS()){if(e===E&&net())continue;if(e.hp>0&&Math.hypot(e.x,e.z)>r){if(e===P)hurtMe=true;e.hp-=e.mx*bn*dt;if(e.hp<=0){e.hp=0;if(window.BRX){BRX.died(e,null);if(over)break}else{endRound(e===P?E:P);break}}}}
  const dP=Math.hypot(P.x,P.z);danger(over?'':hurtMe?'burn':dP>r-4?'near':'',r);
  if(hurtMe&&!over){tick-=dt;if(tick<=0){tick=.5;try{window.SFX&&SFX.hurt&&SFX.hurt()}catch(e){}}}
  if(!ended&&t>=T1&&!over&&!window.BRX)verdict()}
 if(ended&&net())decide()};
})();
