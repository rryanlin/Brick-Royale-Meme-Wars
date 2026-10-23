/* Two-handed gun holds. Arms are solved with a two-bone IK so both hands land on the grip and the front of the gun,
   like the soldier reference photo. Guns are scaled to realistic minifig size. Maths is plain arrays (testable in node). */
(()=>{
// Plain-array vector/quaternion maths and a two-bone arm solver (no THREE dependency, so it can be unit-tested in node).
const V={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(a[0],a[1],a[2]),
 norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]}};
const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qinv=q=>[-q[0],-q[1],-q[2],q[3]];
const qrot=(q,v)=>{const u=[q[0],q[1],q[2]],t=V.mul(V.cross(u,v),2);return V.add(V.add(v,V.mul(t,q[3])),V.cross(u,t))};
const qaxis=(ax,ang)=>{const s=Math.sin(ang/2);return[ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(ang/2)]};
const qfrom=(a,b)=>{const r=V.dot(a,b)+1;let q;if(r<1e-6)q=Math.abs(a[0])>Math.abs(a[2])?[-a[1],a[0],0,0]:[0,-a[2],a[1],0];else{const c=V.cross(a,b);q=[c[0],c[1],c[2],r]}const l=Math.hypot(q[0],q[1],q[2],q[3]);return q.map(x=>x/l)};
const rx=(v,t)=>{const c=Math.cos(t),s=Math.sin(t);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]};
const ry=(v,t)=>{const c=Math.cos(t),s=Math.sin(t);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]};
const DOWN=[0,-1,0];
// Shoulder S, wanted hand centre T, elbow pole direction, ring axis the claw should line up with.
function solveArm(S,T,pole,axisT,L1=.4,L2=.52,tw){
 const d=V.sub(T,S),dist=V.len(d),u=V.mul(d,1/(dist||1)),D=Math.min(Math.max(dist,Math.abs(L1-L2)+.02),L1+L2-.004);
 const a=(L1*L1-L2*L2+D*D)/(2*D),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 const v=V.norm(V.sub(pole,V.mul(u,V.dot(pole,u))));
 const E=V.add(S,V.add(V.mul(u,a),V.mul(v,h)));
 const d1=V.norm(V.sub(E,S)),d2=V.norm(V.sub(T,E));
 const q1=qfrom(DOWN,d1);let q2=qfrom(DOWN,d2);
 const z0=qrot(q2,[0,0,1]);let A=V.sub(axisT,V.mul(d2,V.dot(axisT,d2)));
 if(V.len(A)>1e-4){A=V.norm(A);let phi=Math.atan2(V.dot(d2,V.cross(z0,A)),V.dot(z0,A)),pi=Math.PI;
  if(phi>pi/2)phi-=pi;else if(phi<-pi/2)phi+=pi; // the ring axis looks the same turned half a way round, so the nearer twist is wanted...
  if(tw){ // ...but when that choice flips, the open hand and forearm details must not pop half a turn: the twist chases its target at a limited speed instead
   const tn=typeof T==='number'?T:0,dq=Math.max(0,Math.min(.1,tn-(tw.t===undefined?tn:tw.t)));tw.t=tn;
   if(tw.p===undefined)tw.p=phi;else{const df=phi-tw.p,mx=12*dq;tw.p+=Math.abs(df)<=mx?df:Math.sign(df)*mx}
   phi=tw.p}
  q2=qmul(qaxis(d2,phi),q2)}
 return{q1,qf:qmul(qinv(q1),q2),E,hand:V.add(E,V.mul(d2,L2)),reach:dist}}

// low-ready carry like the soldier reference photo: the gun lies diagonally across the front of the body;
// pistol = two-handed ready stance, arms out straight; rpg = tube on the shoulder with the left hand on the foregrip.
// g = grip centre in gun frame [z,y] (the right fist wraps it), gt = grip lean, tp = how much the gun follows aim pitch
// per gun: p = right-hand grip point (body frame), yaw = turn of the barrel toward the character's left (deg),
// pitch = barrel tilt down (deg), sc = gun scale, lh = point on the gun the left hand holds, g = [z,y] of the grip top
const CFG={"rifle":{"p":[0.342,1.273,-0.445],"yaw":70,"pitch":-30,"sc":0.68,"lh":[0,-0.01,-0.62],"g":[0.12,-0.22],"gt":0.25},"burst":{"p":[0.447,1.269,-0.408],"yaw":65,"pitch":-20,"sc":0.66,"lh":[0,-0.01,-0.68],"g":[0.12,-0.22],"gt":0.25},"smg":{"p":[0.344,1.269,-0.404],"yaw":70,"pitch":-30,"sc":0.85,"lh":[0,-0.12,-0.42],"g":[0.12,-0.2],"gt":0.18,"lv":1},"shotgun":{"p":[0.446,1.271,-0.368],"yaw":65,"pitch":-20,"sc":0.7,"lh":[0,-0.07,-0.62],"g":[0.14,-0.2],"gt":0.25},"tac":{"p":[0.34,1.258,-0.445],"yaw":70,"pitch":-25,"sc":0.78,"lh":[0,-0.17,-0.62],"g":[0.06,-0.22],"gt":0.22,"lv":1},"sniper":{"p":[0.329,1.285,-0.49],"yaw":70,"pitch":-25,"sc":0.6,"lh":[0,0.02,-0.7],"g":[0.1,-0.22],"gt":0.22},"pistol":{"p":[0.06,1.58,-0.7],"yaw":0,"pitch":0,"sc":1.0,"lh":[-0.02,-0.27,0.1],"g":[0.1,-0.12],"gt":0.2,"two":1,"tp":0.7},"rpg":{"p":[0.44,1.74,-0.14],"yaw":22,"pitch":0,"sc":0.55,"lh":[0,-0.17,-0.6],"g":[-0.12,-0.2],"gt":0.22,"lv":1,"pr":[1,-0.5,-0.4]}};
CFG.pistol.ap=[.06,1.6,-.7];CFG.rpg.ap=[.2,1.55,-.45]; // aim-down-sights grip points that differ from the default
const SWT=window.SWT={hol:.26,drw:.36},BACK=[.3,1.02,.34]; // times of the two halves of a weapon swap; where the hand goes to reach the back
const FPG={d:[[.12,-.4,-.25],[.03,-.17,-.25]],pistol:[[.04,-.34,-.3],[0,-.14,-.3]],rpg:[[.3,-.3,-.05],[.2,-.22,-.05]]}; // first person: where the grip sits relative to the eyes, hip then aimed ([right, up, forward])
const AP=[.1,1.52,-.46]; // where the grip hand sits when aiming down the sights (body frame); a gun's CFG may override it with `ap`
const PR=[.8,-1,.3],PL=[-.6,-1,.3]; // minifig.js loads after this file, so body measurements (window.BODY) are read at update time
function smoothRc(e){ // the recoil kick builds over a couple of frames instead of snapping, so the hands do not jolt on every shot
 const tn=typeof T==='number'?T:0,dq=Math.max(0,Math.min(.1,tn-(e._rt===undefined?tn:e._rt))),r=e.rc||0;e._rt=tn;
 if(e._rs===undefined||r<=e._rs)e._rs=r;else e._rs=Math.min(r,e._rs+Math.max(dq,.008)*20);return e._rs}
function update(e){
 if(!e||!e.aim||!e.hid||!e.ra||!e.la||!e.ra.fa||!e.la.fa)return;const c=CFG[e.hid]||CFG.rifle;
 if(e.sw>0||e.mel){ // melee swing (or hammer held): the swing code drives the right arm, left arm relaxes
  e.ra.rotation.y=0;e.ra.rotation.z=.08;e.ra.fa.rotation.set(.35,0,0);e.la.rotation.y=0;e.la.rotation.z=-.08;e.la.fa.rotation.set(.45+.25*Math.max(0,Math.sin((e.wp||0)))*(e.wk||0),0,0);
  if(!(e.sw>0))e.la.rotation.x=-Math.sin(e.wp||0)*.85*Math.min(e.wk||0,1.3); // free arm swings against the legs while the hammer is carried
  return}
 const BD=window.BODY||{SHX:.575,SHY:1.62,DY:0},SR=[BD.SHX,BD.SHY,0],SL=[-BD.SHX,BD.SHY,0];
 const wk=Math.min(e.wk||0,1.35),ph=e.wp||0,rc=smoothRc(e),spr=e.spr?1:0,br=Math.sin((typeof T==='number'?T:0)*1.9+(e.sd||0))*.007;
 // the gun sways with the stride, kicks back and climbs on every shot, drops to a low carry when sprinting, and breathes at rest; both hands follow it
 let th=Math.max(-.6,Math.min(.8,e.pitch||0))*.85,psi=c.yaw*Math.PI/180+Math.sin(ph)*.085*wk,phi=c.pitch*Math.PI/180+th*(c.tp||.3)+rc*.1+Math.sin(ph*2)*.06*wk-spr*.16*wk,k=c.sc*(e.gs||1),
  P=[c.p[0]+Math.sin(ph)*.07*wk,c.p[1]+BD.DY+Math.sin(ph*2)*.04*wk+br-.05*spr*wk+rc*.02,c.p[2]+.075*rc+Math.cos(ph)*.045*wk],anc=[0,c.g[1],c.g[0]];
 // ---- aiming down the sights (right click): the gun comes up to the shoulder in front of the chest, pointing straight along the aim (pitch follows the camera), both hands on it
 const ad=e.ads||0,fv=e.fpv?1:0,ow=Math.max(ad,fv); // ow = how much the gun points along the shot line (aiming, or always in first person)
 if(ow>.001){const ap=c.ap||AP,pp=Math.max(-.6,Math.min(.8,e.pitch||0)),Pa=[ap[0]+Math.sin(ph)*.01*wk,ap[1]+BD.DY+br*2,ap[2]+.075*rc];
  if(fv){ // first person: the gun is held up in front of the eyes (offsets from the camera: hip / aimed), so it is always in view
   const F=FPG[e.hid]||FPG.d,ey=e.fpvEye||1.95,sw2=Math.sin(ph)*wk;
   const H=[F[0][0]+sw2*.02,ey+F[0][1]+Math.sin(ph*2)*.012*wk+br-.05*spr*wk,-.25+F[0][2]+.075*rc+Math.cos(ph)*.015*wk],Q=[F[1][0],ey+F[1][1]+br,-.25+F[1][2]+.075*rc];
   P=[H[0]+(Q[0]-H[0])*ad,H[1]+(Q[1]-H[1])*ad,H[2]+(Q[2]-H[2])*ad]}
  else P=[P[0]+(Pa[0]-P[0])*ad,P[1]+(Pa[1]-P[1])*ad,P[2]+(Pa[2]-P[2])*ad];
  let psiA=-.03,phiA=pp+.03;
  if(e.ad){ // the barrel points exactly along the shot (muzzle -> the point under the crosshair): world direction into the body frame
   const cy=Math.cos(e.yaw||0),sy=Math.sin(e.yaw||0),lx=e.ad.x*cy-e.ad.z*sy,lz=e.ad.x*sy+e.ad.z*cy;phiA=Math.asin(Math.max(-1,Math.min(1,e.ad.y)));psiA=Math.atan2(-lx,-lz)}
  // the barrel eases toward the shot line instead of snapping (the point under the crosshair can jump from a near wall to the far sky in one frame)
  const tn=typeof T==='number'?T:0,dq=Math.max(0,Math.min(.1,tn-(e._hs||tn)));e._hs=tn;
  if(e._ps===undefined||ow<.6||dq===0){if(e._ps===undefined||ow<.6){e._ps=psiA;e._pp=phiA}}else{const f=1-Math.exp(-dq*16);e._ps+=(psiA-e._ps)*f;e._pp+=(phiA-e._pp)*f}
  psiA=e._ps;phiA=e._pp;
  psi+=(psiA-psi)*ow;phi+=(phiA+rc*.1-phi)*ow}
 if(e.gun&&e.gs)e.gun.scale.setScalar(k);
 // ---- draw / holster / reload poses. The held gun swings back over the shoulder to the back, then the other gun is pulled out from the back into the ready pose.
 const cl=x=>Math.max(0,Math.min(1,x)),ez=x=>x*x*(3-2*x),HOLS=SWT.hol,DRAWT=SWT.drw;
 let bs=0; // 0 = normal carry, 1 = gun at the back
 if(e.hol>0)bs=ez(cl(1-e.hol/HOLS));else if(e.drw>0)bs=1-ez(cl(1-e.drw/DRAWT));
 if(bs>0){P=[P[0]+(BACK[0]-P[0])*bs,P[1]+(BACK[1]-P[1])*bs+.14*Math.sin(bs*Math.PI),P[2]+((window.SLZ||BACK[2])-P[2])*bs];phi+=(1.3-phi)*bs;psi+=(-.2-psi)*bs}
 if(e.gun)e.gun.visible=!(e.hol>0&&bs>.9);
 let rs=0;if(e.rl>0&&!(e.hol>0)&&!(e.drw>0)){rs=Math.sin(Math.PI*cl(1-e.rl/Math.max(.4,(e.w&&e.w.rl)||1.5)))} // reload: gun tips over, off hand drops to the belt for the magazine
 if(rs>0){phi-=.38*rs;psi+=.18*rs;P=[P[0],P[1]-.07*rs,P[2]+.05*rs]}
 e.aim.position.set(P[0],P[1],P[2]);e.aim.rotation.order='YXZ';e.aim.rotation.set(phi,psi,0);
 const tlf=z=>V.add(P,ry(rx(V.mul(V.sub([c.lh[0],c.lh[1],z],anc),k),phi),psi));
 let gA=[0,-Math.cos(c.gt),-Math.sin(c.gt)], // grip axis in gun frame (grip leans back at the top)
  Tl=tlf(c.lh[2]),Ar=ry(rx(gA,phi),psi),
  Al=c.two?Ar:ry(rx(c.lv?DOWN:[0,0,-1],phi),psi);
 if(ow>.001){ // aiming (or first person): the support hand slides back along the gun to the nearest spot the (short) minifig arm can still reach
  const q=[SL[0]-Tl[0],SL[1]-Tl[1],SL[2]-Tl[2]];if(Math.hypot(q[0],q[1],q[2])>.9){ // (the distance is not always steadily shorter further back, so scan the whole barrel first, then refine the first reachable spot)
   const dm=m=>{const t=tlf(c.lh[2]*(1-m));return Math.hypot(SL[0]-t[0],SL[1]-t[1],SL[2]-t[2])};let lo=0,hi=-1,bm=0,bd=1e9;
   for(let i=1;i<=24;i++){const m=i/24,d=dm(m);if(d<bd){bd=d;bm=m}if(d<=.9){hi=m;lo=(i-1)/24;break}}
   if(hi<0)hi=bm;else for(let i=0;i<10;i++){const m=(lo+hi)/2;dm(m)>.9?lo=m:hi=m}
   Tl=tlf(c.lh[2]*(1-hi))}}
 if(bs>0)Tl=[Tl[0]+(-.5-Tl[0])*bs,Tl[1]+(1.0-Tl[1])*bs,Tl[2]+(-.1-Tl[2])*bs];
 if(rs>0)Tl=[Tl[0]+.1*rs,Tl[1]-.34*rs,Tl[2]+.28*rs]; // left hand: barrel axis on a handguard, upright axis on a foregrip / second pistol grip
 const pr0=c.pr||PR,pl0=c.pl||PL,sw=Math.sin(ph)*wk,cw=Math.cos(ph)*wk, // elbows pump in and out with the stride
  tw=e._tw||(e._tw={r:{},l:{}}),r=solveArm(SR,P,[pr0[0]+sw*.32,pr0[1],pr0[2]+cw*.28],Ar,.4,.52,tw.r),l=solveArm(SL,Tl,[pl0[0]-sw*.32,pl0[1],pl0[2]-cw*.28],Al,.4,.52,tw.l);
 e.rr=[r.reach,l.reach];e.ra.quaternion.set(r.q1[0],r.q1[1],r.q1[2],r.q1[3]);e.ra.fa.quaternion.set(r.qf[0],r.qf[1],r.qf[2],r.qf[3]);
 e.la.quaternion.set(l.q1[0],l.q1[1],l.q1[2],l.q1[3]);e.la.fa.quaternion.set(l.qf[0],l.qf[1],l.qf[2],l.qf[3])}
window.HOLD={CFG,solveArm,update,V,qrot,qmul,rx,ry};
})();
