/* Meme abilities, round two: Troll Prank (Trollface), Stonks Boost (Stonks Guy), Sahur Slam (Tung Tung Tung Sahur), Pork Portal (John Pork).
   Everything runs in both players' games from the same cast message, and whoever is hit decides what happens to them (like every hit in online play):
   my game applies the effect to ME when the opponent's slam / fake chest reaches me, and just draws it when it is on them. */
(()=>{
const TH=window.THREE,PI=Math.PI;
const CD={troll:21,stonks:22,slam:20,portal:20};            // cooldowns in seconds (from the fighter design sheet; skills.js adds the rest)
const SPD=1.35,DMGB=1.3;                                    // stonks zone: +35% speed, +30% damage for the one who placed it
const NETON=()=>!!(window.NET&&NET.on),send=o=>{if(NETON())NET.send(o)},r2=v=>Math.round(v*100)/100;
const other=e=>FOE(e);
const TRAPS=[],ZONES=[],SLAMS=[],PORTALS=[],FXS=[],AIM={},BOT={}; // AIM[kind](e,dx,dz) picks the cast direction for the player; BOT[kind](e,d,los,ux,uz) is the CPU's rule for using it
const mat=(c,o,dbl)=>new TH.MeshBasicMaterial(Object.assign({color:c,transparent:true,opacity:1,depthWrite:false},dbl?{side:TH.DoubleSide}:{},o||{}));
function fx(m,dur,upd){S.add(m);FXS.push({m,t:0,dur,upd})}
const free=(x,z)=>{if(Math.abs(x)>28||Math.abs(z)>28)return false;for(const b of boxes){if((b.y0||0)>.5||b.h<1)continue;if(x>b.x1-.7&&x<b.x2+.7&&z>b.z1-.7&&z<b.z2+.7)return false}return true};
const shake=v=>{try{window.__shake?window.__shake(v):0}catch(e){}};
// ---- knock-back, stun and the little effects that go with them
function knock(v,fx0,fz0,sp,dur){const d=Math.hypot(v.x-fx0,v.z-fz0)||1;v.dash=dur;v.dvx=(v.x-fx0)/d*sp;v.dvz=(v.z-fz0)/d*sp}
function stun(v,s){v.stun=Math.max(v.stun||0,s)}
function ring(x,y,z,r0,r1,c,dur,flat){const m=new TH.Mesh(new TH.TorusGeometry(1,flat?.09:.07,8,40),mat(c));m.position.set(x,y,z);m.rotation.x=PI/2;m.scale.set(r0,r0,r0);
 fx(m,dur,(o,k)=>{const s=r0+(r1-r0)*Math.min(1,k*1.4);o.scale.set(s,s,s);o.material.opacity=Math.max(0,1-k)})}
function puff(x,y,z,c,n,sp,dur,size){for(let i=0;i<n;i++){const a=Math.random()*PI*2,u=.4+Math.random()*.6,m=new TH.Mesh(new TH.SphereGeometry(size||.18,6,5),mat(c));m.position.set(x,y,z);
  const vx=Math.cos(a)*sp*u,vz=Math.sin(a)*sp*u,vy=2+Math.random()*sp*.6;fx(m,dur,(o,k)=>{o.position.set(x+vx*k*dur,Math.max(.1,y+vy*k*dur-9*(k*dur)*(k*dur)),z+vz*k*dur);o.material.opacity=1-k;const s=1-k*.5;o.scale.set(s,s,s)})}}
// the trollface that pops out of a fake chest
let TFT=null;function trollTex(){if(TFT)return TFT;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#fff';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.lineWidth=6;x.strokeStyle='#111';x.stroke();
 if(window.DRAWTROLL)DRAWTROLL(x,128,124,.55,'#111');TFT=new TH.CanvasTexture(c);return TFT}
function popFace(px,pz){const s=new TH.Sprite(new TH.SpriteMaterial({map:trollTex(),transparent:true,depthWrite:false}));s.position.set(px,1,pz);s.scale.set(.1,.1,.1);
 fx(s,1.4,(o,k)=>{const sc=k<.2?k/.2*2.2:2.2+Math.sin(k*30)*.08;o.scale.set(sc,sc,sc);o.position.y=1+Math.min(1,k*2)*1.4;o.material.opacity=k<.7?1:Math.max(0,(1-k)/.3)})}
// stars that circle a stunned fighter's head
function stars(e){if(!e.g)return;if(!e._st){const g=new TH.Group();for(let i=0;i<3;i++){const m=new TH.Mesh(new TH.SphereGeometry(.11,8,6),new TH.MeshBasicMaterial({color:0xffe14a}));g.add(m)}g.visible=false;e._st=g;S.add(g)}
 const g=e._st;g.visible=(e.stun||0)>0&&e.hp>0;if(!g.visible)return;g.position.set(e.x,e.y+2.95-(e.cr||0)*.4,e.z);g.children.forEach((m,i)=>{const a=T*7+i*PI*2/3;m.position.set(Math.cos(a)*.5,Math.sin(a*2)*.05,Math.sin(a)*.5)})}

// ================== TROLL PRANK: a fake loot bag on the floor ==================
function bagModel(){try{const b=window.SPOTS&&SPOTS[0]&&SPOTS[0].m;if(b&&b.clone){const c=b.clone();c.visible=true;c.rotation.set(0,0,0);return c}}catch(e){}
 const g=new TH.Group(),a=new TH.Mesh(B(.9,.7,.7),M(0x3a6fd8)),b=new TH.Mesh(B(.94,.18,.74),M(0xffd02f));a.position.y=.35;b.position.y=.5;g.add(a);g.add(b);return g}
function dropTrap(e,dx,dz){let x=e.x,z=e.z,f=false;for(const a of[0,.5,-.5,1,-1])for(const L of[3.2,2.4,1.7]){const c=Math.cos(a),s=Math.sin(a),px=e.x+(dx*c-dz*s)*L,pz=e.z+(dx*s+dz*c)*L;if(free(px,pz)){x=px;z=pz;f=true;break}}if(f===false&&!free(x,z)){x=e.x;z=e.z}
 const m=bagModel();m.position.set(x,.15,z);S.add(m);
 const own=new TH.Mesh(new TH.TorusGeometry(1.4,.04,6,36),mat(0x7dff7d,{opacity:.5}));own.rotation.x=PI/2;own.position.set(x,.05,z);own.visible=e===P;S.add(own); // only you can see where your own fake chest is
 TRAPS.push({m,own,x,z,y:e.y,o:e,t:22,ph:Math.random()*6});if(e===P)say('FAKE CHEST DROPPED',1)}
const PRANKS=['boom','launch','slip','stun'],PTXT={boom:'BOOM! TROLLED',launch:'LAUNCHED! TROLLED',slip:'SLIPPED! TROLLED',stun:'STUNNED! TROLLED'};
function prank(tr,v,kind){if(v.sh>0){return}
 popFace(tr.x,tr.z);if(v===P)say(PTXT[kind],1.6);
 if(kind==='boom'){const m=new TH.Mesh(new TH.SphereGeometry(1,12,10),mat(0xffa21a,{opacity:.8}));m.position.set(tr.x,.8,tr.z);fx(m,.45,(o,k)=>{const s=.5+k*3;o.scale.set(s,s,s);o.material.opacity=.8*(1-k)});
  puff(tr.x,.6,tr.z,0xffd23a,14,7,.9);shake(.5);dmg(v,16*(v.hs||1));knock(v,tr.x,tr.z,15,.35);if(v.gr)v.vy=Math.max(v.vy,6)}
 else if(kind==='launch'){v.vy=17;v.gr=false;v.y+=.1;ring(tr.x,.2,tr.z,.5,3.2,0x7dff7d,.6,1)}
 else if(kind==='slip'){const s=Math.hypot(v.vx,v.vz);let a=s>.5?Math.atan2(v.vz,v.vx):Math.random()*PI*2;v.slip=1.3;v.dash=1.3;v.dvx=Math.cos(a)*10;v.dvz=Math.sin(a)*10;stun(v,1.3);puff(tr.x,.3,tr.z,0xfff2a8,6,3,.7,.12)}
 else{stun(v,2.5)}}
function trapStep(dt,act){for(let i=TRAPS.length-1;i>=0;i--){const q=TRAPS[i];q.t-=dt;q.m.position.y=.15+Math.sin(T*3+q.ph)*.1;q.m.rotation.y+=dt*1.5;
  const v=other(q.o);let gone=q.t<=0;
  if(!gone&&act&&!(NETON()&&v===E)&&v.hp>0&&Math.hypot(v.x-q.x,v.z-q.z)<1.4&&v.y<q.y+.9){prank(q,v,PRANKS[Math.floor(Math.random()*4)]);send({t:'xt',x:r2(q.x),z:r2(q.z)});gone=true}
  if(gone){S.remove(q.m);S.remove(q.own);TRAPS.splice(i,1)}}}

// ================== STONKS BOOST: a green zone ==================
function dropZone(e){const R=4.5,g=new TH.Group();
 const disc=new TH.Mesh(new TH.CylinderGeometry(R,R,.06,40),mat(0x20e070,{opacity:.22}));disc.position.y=.04;g.add(disc);
 const rim=new TH.Mesh(new TH.TorusGeometry(R,.09,6,48),mat(0x35ff8a,{opacity:.85}));rim.rotation.x=PI/2;rim.position.y=.08;g.add(rim);
 const arrows=[];for(let i=0;i<4;i++){const a=new TH.Group(),h=new TH.Mesh(new TH.ConeGeometry(.45,.7,3),mat(0x35ff8a,{opacity:.8})),s=new TH.Mesh(new TH.BoxGeometry(.28,.8,.1),mat(0x35ff8a,{opacity:.8}));h.position.y=.4;s.position.y=-.25;a.add(h);a.add(s);const an=i*PI/2+.4;a.position.set(Math.cos(an)*R*.55,0,Math.sin(an)*R*.55);a.userData.p=i*.25;g.add(a);arrows.push(a)}
 g.position.set(e.x,e.y,e.z);S.add(g);ZONES.push({o:e,x:e.x,y:e.y,z:e.z,r:R,t:8,g,arrows,rim});if(e===P)say('STONKS ZONE: STAND IN IT',1.2)}
function boostSet(e,on){if(on&&!e._sb){e._sb=1;e._sp0=e.sp;e._dm0=e.dm;e.sp*=SPD;e.dm*=DMGB}else if(!on&&e._sb){e._sb=0;e.sp=e._sp0;e.dm=e._dm0}}
function zoneStep(dt){for(let i=ZONES.length-1;i>=0;i--){const z=ZONES[i];z.t-=dt;const k=Math.max(0,Math.min(1,z.t<1?z.t:1));
  z.arrows.forEach(a=>{const p=((T*.7+a.userData.p)%1);a.position.y=.2+p*2.4;a.children.forEach(c=>c.material.opacity=.8*Math.sin(p*PI))});
  z.rim.material.opacity=.85*k;z.g.children[0].material.opacity=.22*k;if(z.t<=0){S.remove(z.g);ZONES.splice(i,1)}}
 for(const e of ENTS()){let inz=false;if(e.hp>0)for(const z of ZONES)if(z.o===e&&Math.hypot(e.x-z.x,e.z-z.z)<z.r&&Math.abs(e.y-z.y)<3){inz=true;break}boostSet(e,inz)}}

// ================== SAHUR SLAM: a wide club swing ==================
function slamCast(e){e.sw=.5;e.cd.m=Math.max(e.cd.m,.8);SLAMS.push({o:e,t:.3});if(e===P)say('SAHUR SLAM!',.8)}
function slamHit(s){const e=s.o,R=7;ring(e.x,.15,e.z,1,R,0xd9a05b,.5,1);ring(e.x,.15,e.z,.5,R*.7,0xffe2b0,.4,1);puff(e.x,.3,e.z,0xb98a55,16,6,.8,.2);shake(.7);
 const v=other(e);if(v.hp<=0||v.sh>0)return;if(NETON()&&v===E){if(Math.hypot(v.x-e.x,v.z-e.z)<R){dmg(v,12*(v.hs||1));stun(v,1.6)}return}
 if(Math.hypot(v.x-e.x,v.z-e.z)<R&&Math.abs(v.y-e.y)<2.6&&segBox(e.x,e.y+1.2,e.z,v.x,v.y+1.2,v.z)===null){dmg(v,12*(v.hs||1));knock(v,e.x,e.z,20,.32);stun(v,1.6);if(v===P)say('SLAMMED! STUNNED',1.4)}}
// ================== PORK PORTAL: blink through a portal ==================
function portalMesh(x,z,ang,c){const g=new TH.Group(),r=new TH.Mesh(new TH.TorusGeometry(1,.11,10,32),mat(c,{opacity:.95})),d=new TH.Mesh(new TH.CircleGeometry(.93,28),mat(0x7a3cff,{opacity:.55},true));
 g.add(d);g.add(r);g.position.set(x,1.25,z);g.rotation.y=ang;g.scale.set(.1,.1,.1);g.userData={r,d};return g}
function portalCast(e,dx,dz){let L=9,x,z;for(;L>=3;L-=1){x=e.x+dx*L;z=e.z+dz*L;if(free(x,z))break}if(L<3)return false;
 const ang=Math.atan2(dx,dz),a=portalMesh(e.x,e.z,ang,0xff7ad9),b=portalMesh(x,z,ang,0x35e6ff);S.add(a);S.add(b);
 PORTALS.push({o:e,tx:x,tz:z,t:.28,life:0,a,b,done:false});if(e===P)say('PORK PORTAL',.8)}
function portalStep(dt){for(let i=PORTALS.length-1;i>=0;i--){const q=PORTALS[i];q.life+=dt;const o=Math.min(1,q.life/.2),f=q.life>1.1?Math.max(0,1-(q.life-1.1)/.4):1;
  [q.a,q.b].forEach(m=>{m.scale.set(o*f+.001,o*f+.001,o*f+.001);m.userData.d.rotation.z+=dt*6;m.userData.r.rotation.z-=dt*3});
  if(!q.done){q.t-=dt;if(q.t<=0){q.done=true;const e=q.o;puff(e.x,1.1,e.z,0xff7ad9,8,3,.5,.14);e.x=q.tx;e.z=q.tz;e.vx=e.vz=0;puff(q.tx,1.1,q.tz,0x35e6ff,8,3,.5,.14);if(e.dash>0)e.dash=0}}
  if(q.life>1.5){S.remove(q.a);S.remove(q.b);PORTALS.splice(i,1)}}}

// ================== casting ==================
const CAST={troll:(e,dx,dz)=>dropTrap(e,dx,dz),stonks:e=>dropZone(e),slam:e=>slamCast(e),portal:(e,dx,dz)=>portalCast(e,dx,dz)};
AIM.portal=()=>[-Math.sin(yaw),-Math.cos(yaw)]; // Pork Portal blinks where you aim
const _ab=ability;
ability=function(e,dx,dz){if(!CD[e.ab])return _ab(e,dx,dz);
 if(e.cd.a>0||over||introT>0||e.hp<=0||(e.stun||0)>0)return;
 if(NETON()&&e===E&&!NET.rcv)return;
 if(e===P&&AIM[e.ab]){const q=AIM[e.ab](e,dx,dz);if(q){dx=q[0];dz=q[1]}}
 const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;if(!isFinite(dx)||!isFinite(dz)){dx=0;dz=-1}
 if(CAST[e.ab](e,dx,dz)===false)return;
 e.cd.a=CD[e.ab];if(e===P&&NETON())send({t:'xa',k:e.ab,dx:r2(dx),dz:r2(dz),x:r2(e.x),z:r2(e.z)})};
window.MEME={onMsg(m){if(!NETON()||mode!=='play')return;
  if(m.t==='xa'){if(over||introT>0||E.ab!==m.k||!CD[m.k])return;E.cd.a=0;E.stun=0;const nr=NET.rcv;NET.rcv=true;try{ability(E,m.dx,m.dz)}finally{NET.rcv=nr}}
  else if(m.t==='xt'){let bi=-1,bd=2.5;TRAPS.forEach((q,i)=>{if(q.o===P){const d=Math.hypot(q.x-m.x,q.z-m.z);if(d<bd){bd=d;bi=i}}});if(bi>=0){const q=TRAPS[bi];popFace(q.x,q.z);S.remove(q.m);S.remove(q.own);TRAPS.splice(bi,1)}}},
 CAST,AIM,BOT,H:{fx,ring,puff,mat,knock,stun,free,shake,other,send,r2,NETON},at:()=>TRAPS.map(q=>[q.x,q.z]),count:()=>({traps:TRAPS.length,zones:ZONES.length,slams:SLAMS.length,portals:PORTALS.length,fx:FXS.length}),CD};

// ================== per-frame ==================
const KEYS=['w','a','s','d',' ','q','f','t','shift'];
const _step=step;
step=function(dt){const act=!over&&introT<=0;
 // a stunned player cannot move, shoot, swing or use an ability: the held keys are read as released for this frame
 const sv=P.stun>0&&act?KEYS.map(q=>[q,k[q]]):null,fv=firing,cv=clicked;
 if(sv){sv.forEach(([q])=>{k[q]=false});firing=false;clicked=false}
 try{_step(dt)}finally{if(sv){sv.forEach(([q,v])=>{k[q]=v});firing=fv;clicked=cv&&false}}
 for(const e of ENTS()){if(e.stun>0)e.stun=Math.max(0,e.stun-dt);if(e.slip>0)e.slip=Math.max(0,e.slip-dt);
  if(e.slip>0&&e.g){const p=1-e.slip/1.3;e.g.rotation.z=Math.sin(Math.min(1,p*1.6)*PI)*1.25;e.g.position.y+=Math.sin(Math.min(1,p*1.6)*PI)*.25}
  stars(e)}
 for(let i=SLAMS.length-1;i>=0;i--){const s=SLAMS[i];s.t-=dt;if(s.t<=0){slamHit(s);SLAMS.splice(i,1)}}
 trapStep(dt,act);zoneStep(dt);portalStep(dt);
 for(let i=FXS.length-1;i>=0;i--){const f=FXS[i];f.t+=dt;const k2=Math.min(1,f.t/f.dur);f.upd&&f.upd(f.m,k2);if(k2>=1){S.remove(f.m);FXS.splice(i,1)}}
 // CPU fighter: uses these abilities on purpose, not only when it is hurt
 if(act&&!NETON()&&E.bot&&CD[E.ab]&&E.cd.a<=0&&E.hp>0&&(E.stun||0)<=0&&((E._mt=(E._mt||0)-dt)<=0)){E._mt=.45;const dx=P.x-E.x,dz=P.z-E.z,d=Math.hypot(dx,dz)||1,los=segBox(E.x,E.y+1.4,E.z,P.x,P.y+1.4,P.z)===null,ux=dx/d,uz=dz/d;
  if(E.ab==='slam'&&d<5.2&&los)ability(E,ux,uz);
  else if(E.ab==='stonks'&&los&&d<24&&Math.random()<.5)ability(E,ux,uz);
  else if(E.ab==='troll'&&d<18&&Math.random()<.45)ability(E,ux,uz);
  else if(E.ab==='portal'&&((d>14&&Math.random()<.4)||(d<5&&E.hp<E.mx*.5)))ability(E,d>14?ux:-uz,d>14?uz:ux);
  else if(BOT[E.ab])BOT[E.ab](E,d,los,ux,uz)}};
// the CPU stands still while stunned (and keeps sliding / flying if it was knocked)
const _bot=bot;bot=function(dt){const E2=window.__BE||E,P2=window.__BP||P;if(E2.stun>0||E2.slip>0){E2.yaw=Math.atan2(-(P2.x-E2.x),-(P2.z-E2.z));if(E2.dash>0){E2.vx=E2.dvx;E2.vz=E2.dvz}else{E2.vx=E2.vz=0}return}_bot(dt)};
// fresh round: everything off the floor, nobody stunned
const _rr=resetRound;resetRound=function(i){_rr(i);
 TRAPS.splice(0).forEach(q=>{S.remove(q.m);S.remove(q.own)});ZONES.splice(0).forEach(z=>S.remove(z.g));SLAMS.length=0;PORTALS.splice(0).forEach(q=>{S.remove(q.a);S.remove(q.b)});FXS.splice(0).forEach(f=>S.remove(f.m));
 for(const e of ENTS()){boostSet(e,false);e.stun=0;e.slip=0;if(e._st)e._st.visible=false}};
const _skin=skin;skin=function(e,id){e._sb=0;e.stun=0;e.slip=0;_skin(e,id)};
})();
