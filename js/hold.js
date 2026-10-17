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
function solveArm(S,T,pole,axisT,L1=.4,L2=.52){
 const d=V.sub(T,S),dist=V.len(d),u=V.mul(d,1/(dist||1)),D=Math.min(Math.max(dist,Math.abs(L1-L2)+.02),L1+L2-.004);
 const a=(L1*L1-L2*L2+D*D)/(2*D),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 const v=V.norm(V.sub(pole,V.mul(u,V.dot(pole,u))));
 const E=V.add(S,V.add(V.mul(u,a),V.mul(v,h)));
 const d1=V.norm(V.sub(E,S)),d2=V.norm(V.sub(T,E));
 const q1=qfrom(DOWN,d1);let q2=qfrom(DOWN,d2);
 const z0=qrot(q2,[0,0,1]);let A=V.sub(axisT,V.mul(d2,V.dot(axisT,d2)));
 if(V.len(A)>1e-4){A=V.norm(A);let phi=Math.atan2(V.dot(d2,V.cross(z0,A)),V.dot(z0,A));if(phi>Math.PI/2)phi-=Math.PI;else if(phi<-Math.PI/2)phi+=Math.PI;q2=qmul(qaxis(d2,phi),q2)}
 return{q1,qf:qmul(qinv(q1),q2),E,hand:V.add(E,V.mul(d2,L2)),reach:dist}}

// low-ready carry like the soldier reference photo: the gun lies diagonally across the front of the body;
// pistol = two-handed ready stance, arms out straight; rpg = tube on the shoulder with the left hand on the foregrip.
// g = grip centre in gun frame [z,y] (the right fist wraps it), gt = grip lean, tp = how much the gun follows aim pitch
// per gun: p = right-hand grip point (body frame), yaw = turn of the barrel toward the character's left (deg),
// pitch = barrel tilt down (deg), sc = gun scale, lh = point on the gun the left hand holds, g = [z,y] of the grip top
const CFG={"rifle":{"p":[0.342,1.273,-0.445],"yaw":70,"pitch":-30,"sc":0.68,"lh":[0,-0.01,-0.62],"g":[0.12,-0.22],"gt":0.25},"burst":{"p":[0.447,1.269,-0.408],"yaw":65,"pitch":-20,"sc":0.66,"lh":[0,-0.01,-0.68],"g":[0.12,-0.22],"gt":0.25},"smg":{"p":[0.344,1.269,-0.404],"yaw":70,"pitch":-30,"sc":0.85,"lh":[0,-0.12,-0.42],"g":[0.12,-0.2],"gt":0.18,"lv":1},"shotgun":{"p":[0.446,1.271,-0.368],"yaw":65,"pitch":-20,"sc":0.7,"lh":[0,-0.07,-0.62],"g":[0.14,-0.2],"gt":0.25},"tac":{"p":[0.34,1.258,-0.445],"yaw":70,"pitch":-25,"sc":0.78,"lh":[0,-0.17,-0.62],"g":[0.06,-0.22],"gt":0.22,"lv":1},"sniper":{"p":[0.329,1.285,-0.49],"yaw":70,"pitch":-25,"sc":0.6,"lh":[0,0.02,-0.7],"g":[0.1,-0.22],"gt":0.22},"pistol":{"p":[0.06,1.58,-0.7],"yaw":0,"pitch":0,"sc":1.0,"lh":[-0.02,-0.27,0.1],"g":[0.1,-0.12],"gt":0.2,"two":1,"tp":0.7},"rpg":{"p":[0.44,1.74,-0.14],"yaw":22,"pitch":0,"sc":0.55,"lh":[0,-0.17,-0.6],"g":[-0.12,-0.2],"gt":0.22,"lv":1,"pr":[1,-0.5,-0.4]}};
const PR=[.8,-1,.3],PL=[-.6,-1,.3]; // minifig.js loads after this file, so body measurements (window.BODY) are read at update time
function update(e){
 if(!e||!e.aim||!e.hid||!e.ra||!e.la||!e.ra.fa||!e.la.fa)return;const c=CFG[e.hid]||CFG.rifle;
 if(e.sw>0||e.mel){ // melee swing (or hammer held): the swing code drives the right arm, left arm relaxes
  e.ra.rotation.y=0;e.ra.rotation.z=.08;e.ra.fa.rotation.set(.35,0,0);e.la.rotation.y=0;e.la.rotation.z=-.08;e.la.fa.rotation.set(.45,0,0);return}
 const BD=window.BODY||{SHX:.575,SHY:1.62,DY:0},SR=[BD.SHX,BD.SHY,0],SL=[-BD.SHX,BD.SHY,0];
 const th=Math.max(-.6,Math.min(.8,e.pitch||0))*.85,psi=c.yaw*Math.PI/180,phi=c.pitch*Math.PI/180+th*(c.tp||.3),k=c.sc*(e.gs||1),P=[c.p[0],c.p[1]+BD.DY,c.p[2]],anc=[0,c.g[1],c.g[0]];
 if(e.gun&&e.gs)e.gun.scale.setScalar(k);
 e.aim.position.set(P[0],P[1],P[2]);e.aim.rotation.order='YXZ';e.aim.rotation.set(phi,psi,0);
 const gA=[0,-Math.cos(c.gt),-Math.sin(c.gt)], // grip axis in gun frame (grip leans back at the top)
  Tl=V.add(P,ry(rx(V.mul(V.sub(c.lh,anc),k),phi),psi)),Ar=ry(rx(gA,phi),psi),
  Al=c.two?Ar:ry(rx(c.lv?DOWN:[0,0,-1],phi),psi); // left hand: barrel axis on a handguard, upright axis on a foregrip / second pistol grip
 const r=solveArm(SR,P,c.pr||PR,Ar),l=solveArm(SL,Tl,c.pl||PL,Al);
 e.ra.quaternion.set(r.q1[0],r.q1[1],r.q1[2],r.q1[3]);e.ra.fa.quaternion.set(r.qf[0],r.qf[1],r.qf[2],r.qf[3]);
 e.la.quaternion.set(l.q1[0],l.q1[1],l.q1[2],l.q1[3]);e.la.fa.quaternion.set(l.qf[0],l.qf[1],l.qf[2],l.qf[3])}
window.HOLD={CFG,solveArm,update,V,qrot,qmul,rx,ry};
})();
