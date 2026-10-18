const $=id=>document.getElementById(id),A=30;
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);document.body.prepend(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x8fd3ff);S.fog=new THREE.Fog(0x8fd3ff,45,120);
const C=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,200);
S.add(new THREE.HemisphereLight(0xffffff,0x6a8a5a,.95));
const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(20,40,10);S.add(sun);
const mats={},M=c=>mats[c]||(mats[c]=new THREE.MeshStandardMaterial({color:c,roughness:.22,metalness:0,envMapIntensity:.6})),B=(a,b,c)=>new THREE.BoxGeometry(a,b,c);
const sg=new THREE.CylinderGeometry(.5,.5,.25,10),boxes=[],dm=new THREE.Object3D();
function studs(x,z,w,d,y,c){const nx=Math.floor(w/2),nz=Math.floor(d/2),im=new THREE.InstancedMesh(sg,M(c),nx*nz);let i=0;
 for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){dm.position.set(x-w/2+1+a*2,y+.12,z-d/2+1+b*2);dm.updateMatrix();im.setMatrixAt(i++,dm.matrix)}S.add(im)}
function brick(x,z,w,h,d,c){const m=new THREE.Mesh(B(w,h,d),M(c));m.position.set(x,h/2,z);S.add(m);boxes.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2,h});studs(x,z,w,d,h,c)}
const base=new THREE.Mesh(B(2*A,1,2*A),M(0x246d2e));base.position.y=-.5;S.add(base);studs(0,0,2*A,2*A,0,0x246d2e);
[[0,-A-.5,2*A+2,4,1,0x9c2f2a],[0,A+.5,2*A+2,4,1,0x2a5090],[-A-.5,0,1,4,2*A,0xa8861f],[A+.5,0,1,4,2*A,0xa85f1a]
].forEach(a=>brick(...a));
// first hit (0..1) of the segment a->b against every collider, or null; roofs and lintels (y0) count for bullets only
function segBox(ax,ay,az,bx,by,bz){let best=2;const o=[ax,ay,az],d=[bx-ax,by-ay,bz-az];
 for(const b of boxes){const mn=[b.x1,b.y0||0,b.z1],mx=[b.x2,b.h,b.z2];let t0=0,t1=1,ok=true;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-9){if(o[i]<mn[i]||o[i]>mx[i]){ok=false;break}}
   else{let u=(mn[i]-o[i])/d[i],v=(mx[i]-o[i])/d[i];if(u>v){const w=u;u=v;v=w}t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1){ok=false;break}}}
  if(ok&&t0<best)best=t0}
 return best<=1?best:null}
function inBox(p){for(const b of boxes)if(p.y<b.h&&p.y>=(b.y0||0)&&p.x>b.x1&&p.x<b.x2&&p.z>b.z1&&p.z<b.z2)return true;return false}
function gh(x,z){let h=0;for(const b of boxes)if(!b.y0&&x>b.x1&&x<b.x2&&z>b.z1&&z<b.z2&&b.h>h)h=b.h;return h}
const WP={rifle:{n:'Rifle',rate:.11,dmg:7,spd:75,pel:1,spr:.015,life:1.2,auto:1,gl:1.1,gw:.22,gc:0x333333},
 shotgun:{n:'Shotgun',rate:.85,dmg:8,spd:55,pel:7,spr:.1,life:.35,gl:.9,gw:.3,gc:0x6b4423},
 rpg:{n:'RPG',rate:1.5,dmg:0,spd:30,pel:1,spr:0,life:2.5,rocket:1,gl:1.5,gw:.4,gc:0x556b2f}};
const LOOK={pepe:{nm:'Pepe',pk:'Sad but deadly: +20% damage',ab:'dash',t:0x2f5fd0,l:0x1b2a55,s:0x4caf2f,a:f=>{[-1,1].forEach(i=>{f(B(.3,.3,.25),0xffffff,i*.2,2.38,-.15);f(B(.12,.12,.1),0,i*.2,2.36,-.29)});f(B(.5,.07,.05),0xc0392b,0,1.88,-.38)}},
nyan:{nm:'Nyan Cat',pk:'Faster, leaves a rainbow trail',ab:'dash',t:0xff9ecb,l:0x2a2a33,s:0x8a8a95,a:f=>{[-1,1].forEach(i=>f(B(.2,.28,.15),0x8a8a95,i*.24,2.5,0));f(B(.3,.06,.05),0,0,1.9,-.38)}},
jester:{nm:'Jester',pk:'Chaos: 20% of hits deal double',ab:'dash',t:0xe3000b,l:0x0a6ed1,s:0xf2f2f2,a:f=>{f(B(.5,.9,.58),0x0a6ed1,.25,1.25,0);f(B(.32,.55,.32),0xe3000b,-.22,2.6,0);f(B(.32,.55,.32),0x0a6ed1,.22,2.6,0);f(B(.8,.18,.8),0xffd02f,0,2.35,0)}},
giga:{nm:'Gigachad',pk:'Huge: 130 health, shield ability',ab:'shield',k:1.2,t:0x9a9a9a,l:0x333333,s:0x9a9a9a,a:f=>{f(B(.8,.18,.8),0x111111,0,2.38,0);f(B(.55,.22,.1),0x111111,0,1.78,-.34)}},
wojak:{nm:'Wojak',pk:'Feels no pain: slow regeneration',ab:'shield',t:0x9aa0a6,l:0x2b3a67,s:0xf4f4f4,a:f=>{f(B(.3,.06,.05),0,0,1.82,-.38)}},
doge:{nm:'Doge',pk:'Much loot: chests give health and armor',ab:'dash',t:0xd8c080,l:0x6b4a2a,s:0xe0b060,a:f=>{[-1,1].forEach(i=>f(B(.18,.32,.15),0xe0b060,i*.26,2.5,0));f(B(.32,.22,.2),0xfff0cf,0,1.88,-.42)}},
general:{nm:'General',pk:'Airstrike: rockets rain on the enemy',ab:'air',t:0x4b5a2a,l:0x33401f,s:0xffd02f,a:f=>{f(B(.9,.3,.9),0x5b6b2f,0,2.42,0);f(B(.12,.5,.05),0xe3000b,0,1.3,-.3)}},
foreman:{nm:'Foreman',pk:'Hard hat: temporary shield',ab:'shield',t:0xfe8a18,l:0x2b3a67,s:0xffd02f,a:f=>{f(new THREE.CylinderGeometry(.45,.45,.25,12),0xffc400,0,2.38,0);f(B(.9,.06,.5),0xffc400,0,2.28,-.3)}},
podcast:{nm:'Podcaster',pk:'Reveals the enemy through walls',ab:'reveal',t:0x151515,l:0x151515,s:0xffd02f,a:f=>{f(B(.8,.2,.8),0x2b1b10,0,2.38,0);f(B(.12,.5,.05),0xffffff,0,1.3,-.3);[-1,1].forEach(i=>f(B(.1,.3,.1),0x111111,i*.4,2,0));f(B(.5,.05,.05),0x111111,0,2.45,0)}},
trader:{nm:'Big Brain',pk:'Starts with 25 armor',ab:'dash',t:0x1f3a5f,l:0x1f3a5f,s:0xffd02f,a:f=>{f(B(.8,.18,.8),0x111111,0,2.38,0);[-1,1].forEach(i=>f(B(.2,.14,.05),0x222222,i*.13,2.05,-.4));f(B(.12,.5,.05),0x2e9b3a,0,1.3,-.3)}}};
function mini(L){const col=L.t,g=new THREE.Group(),add=(geo,c,x,y,z,p=g)=>{const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);p.add(m);return m};
 const lg=[-.23,.23].map(x=>{const p=new THREE.Group();p.position.set(x,.8,0);g.add(p);add(B(.42,.8,.5),L.l,0,-.4,0,p);add(B(.44,.16,.58),0x222222,0,-.74,-.04,p);return p});add(B(1,.9,.55),col,0,1.25,0);add(B(1.04,.14,.58),0x1a1a1a,0,.9,0);add(B(.98,.2,.54),L.l,0,.78,0);const la=new THREE.Group();la.position.set(-.66,1.6,0);g.add(la);add(B(.3,.8,.36),col,0,-.4,0,la);add(new THREE.TorusGeometry(.13,.06,6,10,4.8),L.s,0,-.85,0,la).rotation.y=1.57;
 const ra=new THREE.Group();ra.position.set(.66,1.6,0);g.add(ra);add(B(.3,.8,.36),col,0,-.4,0,ra);add(new THREE.TorusGeometry(.13,.06,6,10,4.8),L.s,0,-.85,0,ra).rotation.y=1.57;
 const gun=add(B(1,1,1),0x333333,0,-1,0,ra),ham=new THREE.Group();ra.add(ham);ham.visible=false;
 add(B(.12,1.2,.12),0x8b5a2b,0,-.9,0,ham);add(B(.16,.1,.16),0xffd02f,0,-.45,0,ham);add(B(.16,.1,.16),0xffd02f,0,-1.1,0,ham);add(B(1,.5,.55),0x9aa0a6,0,-1.55,0,ham);add(B(.14,.56,.6),0xe3000b,-.5,-1.55,0,ham);add(B(.14,.56,.6),0xe3000b,.5,-1.55,0,ham);add(B(.3,.3,.3),0x6e747a,0,-1.9,0,ham);
 add(new THREE.CylinderGeometry(.36,.4,.55,18),L.s,0,2,0);add(new THREE.CylinderGeometry(.17,.17,.15,10),L.s,0,2.35,0);
 add(B(.15,.15,.03),0xffffff,-.13,2.06,-.375);add(B(.15,.15,.03),0xffffff,.13,2.06,-.375);add(B(.07,.09,.05),0,-.13,2.05,-.39);add(B(.07,.09,.05),0,.13,2.05,-.39);L.a&&L.a(add);L.b&&L.b(add);L.k&&g.scale.set(L.k,1,L.k);
 const bub=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.3}));bub.position.y=1.2;bub.visible=false;g.add(bub);
 return{g,ra,gun,ham,bub,lg,la}}
function setW(e,w){e.w=w;e.gun.scale.set(w.gw,w.gl,w.gw);e.gun.position.y=-.5-w.gl/2;e.gun.material=M(w.gc)}
function ent(id,bot){const o=mini(LOOK[id]);S.add(o.g);return Object.assign(o,{id,mx:100,sp:9,dm:1,rev:0,x:0,y:0,z:0,vx:0,vz:0,vy:0,yaw:0,pitch:0,hp:100,ar:0,bot,cd:{f:0,m:0,a:0},sh:0,dash:0,dvx:0,dvz:0,sw:0,ab:'dash',blk:false,gr:true,sd:Math.random()*9,w:WP.rifle})}
const P=ent('pepe',false),E=ent('doge',true);setW(P,WP.rifle);setW(E,WP.rifle);function skin(e,id){const w=e.w;S.remove(e.g);Object.assign(e,mini(LOOK[id]));S.add(e.g);e.id=id;e.ab=LOOK[id].ab;const T=window.STATS&&STATS[id];e.mx=T?T[0]:100;e.sp=T?T[1]:9;e.dm=T?T[2]:1;e.sa=T?T[3]:0;setW(e,w)}skin(P,'pepe');skin(E,'doge');
const chests=[[-16,0,'h'],[16,0,'h'],[0,-10,'s'],[0,10,'s'],[-6,-15,'h'],[6,15,'s']].map(([x,z,k])=>{const m=new THREE.Group();
 const a=new THREE.Mesh(B(.8,.8,.8),M(k==='h'?0x2fcf4a:0x3d8bff));a.position.y=.6;m.add(a);
 m.position.set(x,0,z);S.add(m);return{m,x,z,k,t:0}});
const bl=[],FX=[],bg=B(.15,.15,.7),rg=new THREE.SphereGeometry(.3,8,6),bm=new THREE.MeshBasicMaterial({color:0xfff27a}),rm=new THREE.MeshBasicMaterial({color:0xff7a00});
const TR=[],AS=[],RB=[0xff0000,0xff9900,0xffee00,0x33dd33,0x3399ff,0x9933ff],mk=new THREE.Mesh(new THREE.OctahedronGeometry(.4),new THREE.MeshBasicMaterial({color:0xff2222,depthTest:false}));mk.visible=false;mk.renderOrder=9;S.add(mk);
let csel='pepe',mode='menu',over=false,introT=0,score=[0,0],yaw=0,pitch=0,T=0,firing=false,clicked=false,wsel='rifle',asel='dash',msgT=0;const k={};
function say(t,s=1.2){$('msg').textContent=t;msgT=s}
function out(e,n){n*=e.dm;return e.id==='jester'&&Math.random()<.2?n*2:n}
function dmg(e,n){if(e.sh>0||over||introT>0)return;if(e.ar>0){const a=Math.min(e.ar,n);e.ar-=a;n-=a}e.hp-=n;if(e===P){$('hurt').style.opacity=1;setTimeout(()=>$('hurt').style.opacity=0,120)}
 if(e.hp<=0){e.hp=0;endRound(e===P?E:P)}}
function boom(p,o){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),new THREE.MeshBasicMaterial({color:0xff9a1a,transparent:true,opacity:.8}));m.position.copy(p);S.add(m);FX.push({m,t:0});
 for(const e of[P,E]){const d=Math.hypot(p.x-e.x,p.y-e.y-1.2,p.z-e.z);if(d<5&&segBox(p.x,p.y,p.z,e.x,e.y+1.2,e.z)===null){let n=out(o,((o.w&&o.w.sdm)||60)*(1-d/5)+10);if(e===o)n*=.5;dmg(e,n)}}}
function fire(e,dir){const w=e.w,ey=e.y+1.4-(e.cr||0)*.45,o=new THREE.Vector3(e.x,ey,e.z).addScaledVector(dir,.9);
 for(let i=0;i<w.pel;i++){const d=dir.clone().add(new THREE.Vector3((Math.random()-.5)*w.spr*2,(Math.random()-.5)*w.spr*2,(Math.random()-.5)*w.spr*2)).normalize();
  const m=new THREE.Mesh(w.rocket?rg:bg,w.rocket?rm:bm);m.position.copy(o);m.lookAt(o.clone().add(d));S.add(m);bl.push({m,p:o.clone(),q:new THREE.Vector3(e.x,ey,e.z),v:d.multiplyScalar(w.spd),life:w.life,e,w})}}
function shoot(e,dir){if(e.cd.f>0)return;e.cd.f=e.w.rate;fire(e,dir)}
function melee(e,t){if(e.cd.m>0)return;e.cd.m=.6;e.sw=.3;const dx=t.x-e.x,dz=t.z-e.z,d=Math.hypot(dx,dz);
 if(d<2.7&&Math.abs(t.y-e.y)<2&&segBox(e.x,e.y+1.2,e.z,t.x,t.y+1.2,t.z)===null&&(dx*-Math.sin(e.yaw)+dz*-Math.cos(e.yaw))/(d||1)>.3){dmg(t,out(e,e.id==='giga'?42:28));}}
function ability(e,dx,dz){if(e.cd.a>0)return;const t=e===P?E:P;if(e.ab==='dash'){e.dash=.18;e.dvx=dx*30;e.dvz=dz*30;e.cd.a=5}else if(e.ab==='shield'){e.sh=3;e.cd.a=10}else if(e.ab==='air'){e.cd.a=14;for(let i=0;i<5;i++)AS.push({t:.9+i*.3,x:t.x+(i?(Math.random()-.5)*7:0),z:t.z+(i?(Math.random()-.5)*7:0),o:e});if(e===P)say('AIRSTRIKE INBOUND',1)}else{e.rev=4;e.cd.a=10}}
function phys(e,dt){e.vy-=26*dt;e.y+=e.vy*dt;e.x+=e.vx*dt;e.z+=e.vz*dt;e.blk=false;
 for(const b of boxes){if(b.y0||e.y>b.h-.3)continue;const cx=Math.max(b.x1,Math.min(b.x2,e.x)),cz=Math.max(b.z1,Math.min(b.z2,e.z)),dx=e.x-cx,dz=e.z-cz,d=Math.hypot(dx,dz);
  if(d<.5){e.blk=true;if(d>1e-4){e.x=cx+dx/d*.5;e.z=cz+dz/d*.5}else{const l=e.x-b.x1,r=b.x2-e.x,t=e.z-b.z1,u=b.z2-e.z,m=Math.min(l,r,t,u);
   if(m==l)e.x=b.x1-.5;else if(m==r)e.x=b.x2+.5;else if(m==t)e.z=b.z1-.5;else e.z=b.z2+.5}}}
 const g=gh(e.x,e.z);if(e.y<=g){e.y=g;e.vy=0;e.gr=true}else e.gr=false}
function blocked(a,b){return segBox(a.x,a.y+1.4-(a.cr||0)*.45,a.z,b.x,b.y+1.4-(b.cr||0)*.45,b.z)!==null}
function bot(dt){const e=E,p=P,dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1;e.yaw=Math.atan2(-dx,-dz);
 const r=e.w.br||12,mv=d>r+2?1:d<r-2?-1:0,st=Math.sin(T*1.1+e.sd)>0?1:-1;
 let ux=dx/d*mv-dz/d*st*.8,uz=dz/d*mv+dx/d*st*.8;
 if(e.hp<45){let c=null,bd=99;chests.forEach(h=>{if(h.t<=0&&(h.k==='h'||e.id==='doge')){const q=Math.hypot(h.x-e.x,h.z-e.z);if(q<bd){bd=q;c=h}}});if(c){ux=(c.x-e.x)/bd;uz=(c.z-e.z)/bd}}
 const l=Math.hypot(ux,uz)||1;if(e.dash>0){e.vx=e.dvx;e.vz=e.dvz}else{e.vx=ux/l*e.sp*.9;e.vz=uz/l*e.sp*.9}
 if(e.blk&&e.gr)e.vy=10;
 const los=!blocked(e,p);
 if(los&&d<32){const tx=p.x+(Math.random()-.5)*(.6+d*.05),ty=p.y+1.2+(Math.random()-.5)*.8,tz=p.z+(Math.random()-.5)*(.6+d*.05);
  const dir=new THREE.Vector3(tx-e.x,ty-e.y-1.4,tz-e.z).normalize();e.pitch=dir.y;
  if(e.w.auto?Math.sin(T*2+e.sd)>-.3:true)shoot(e,dir)}
 if(d<2.5)melee(e,p);
 if(e.cd.a<=0&&(e.hp<60&&los||d<3||e.ab==='air'&&los))ability(e,-dz/d*st,dx/d*st)}
function endRound(w){over=true;const i=w===P?0:1;score[i]++;const lo=w===P?E:P;
 say(w===P?'YOU WIN THE ROUND!':(window.NETH&&NETH.on()?'OPPONENT WINS THE ROUND':'BOT WINS THE ROUND'),2.4);$('score').textContent=score[0]+' - '+score[1];
 setTimeout(()=>{if(score[i]>=2){if(window.NETH&&NETH.on()){mode='over';document.exitPointerLock&&document.exitPointerLock();$('hud').style.display='none';NETH.end(i===0);return}mode='over';document.exitPointerLock&&document.exitPointerLock();$('hud').style.display='none';
   $('menu').style.display='flex';$('go').textContent=(i===0?'You won the match! ':'Bot won the match. ')+'Rematch';score=[0,0];resetRound(true)}else resetRound()},2500)}
function resetRound(idle){P.x=-22;P.z=0;yaw=-Math.PI/2;pitch=0;E.x=22;E.z=0;E.yaw=Math.PI/2;
 for(const e of[P,E]){e.y=0;e.vy=0;e.vx=e.vz=0;e.hp=e.mx;e.ar=e.sa||0;e.rev=0;e.sh=0;e.dash=0;e.sw=0;e.cd.f=e.cd.m=e.cd.a=0}
 bl.splice(0).forEach(b=>S.remove(b.m));AS.length=0;TR.splice(0).forEach(q=>S.remove(q.m));chests.forEach(c=>{c.t=0;c.m.visible=true});over=false;
 if(!idle){introT=1.4;say('ROUND '+(score[0]+score[1]+1)+' - FIGHT!',1.4)}}
function step(dt){
 for(const e of[P,E]){for(const q in e.cd)e.cd[q]=Math.max(0,e.cd[q]-dt);e.sh=Math.max(0,e.sh-dt);e.dash=Math.max(0,e.dash-dt);e.sw=Math.max(0,e.sw-dt)}
 introT=Math.max(0,introT-dt);const act=!over&&introT<=0;
 for(const e of[P,E]){e.rev=Math.max(0,e.rev-dt);if(act&&e.id==='wojak'&&e.hp>0)e.hp=Math.min(e.mx,e.hp+2*dt);
  if(act&&e.id==='nyan'&&(e.vx||e.vz)&&((e.tt=(e.tt||0)-dt)<=0)){e.tt=.07;for(let i=0;i<6;i++){const m=new THREE.Mesh(B(.35,.2,.35),M(RB[i]));m.position.set(e.x,e.y+.5+i*.2,e.z);S.add(m);TR.push({m,t:.8})}}}
 for(let i=TR.length-1;i>=0;i--){const q=TR[i];q.t-=dt;q.m.scale.setScalar(Math.max(.01,q.t/.8));if(q.t<=0){S.remove(q.m);TR.splice(i,1)}}
 if(act)for(let i=AS.length-1;i>=0;i--){const a=AS[i];a.t-=dt;if(a.t<=0){boom(new THREE.Vector3(a.x,1,a.z),a.o);AS.splice(i,1)}}
 mk.visible=P.rev>0&&E.hp>0;mk.position.set(E.x,E.y+3.2,E.z);mk.rotation.y=T*3;
 if(k.arrowleft)yaw+=2*dt;if(k.arrowright)yaw-=2*dt;if(k.arrowup)pitch=Math.min(.8,pitch+1.5*dt);if(k.arrowdown)pitch=Math.max(-.6,pitch-1.5*dt);
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 let ix=0,iz=0;if(act){if(k.w){ix+=fx;iz+=fz}if(k.s){ix-=fx;iz-=fz}if(k.d){ix+=rx;iz+=rz}if(k.a){ix-=rx;iz-=rz}}
 const l=Math.hypot(ix,iz)||1;
 { // Shift crouches (slower, smaller target), hold T to sprint while moving forward (uses stamina)
  const crT=act&&k.shift&&P.gr&&!(P.dash>0)?1:0;P.cr=(P.cr||0)+(crT-(P.cr||0))*Math.min(1,dt*10);if(P.stam==null)P.stam=1;
  const fwd=(ix||iz)&&(ix*fx+iz*fz)/l>.2,want=act&&k.t&&!crT&&fwd&&(P.stam>.2||(P.spr&&P.stam>0));P.spr=!!want;
  if(P.spr){P.stam=Math.max(0,P.stam-dt*.3);P.stT=1}else{P.stT=Math.max(0,(P.stT||0)-dt);if(P.stT<=0)P.stam=Math.min(1,P.stam+dt*.2)}
  P.sm=(P.cr>.5?.5:1)*(P.spr?1.55:1);P.hh=2.4-.55*P.cr;E.hh=2.4-.55*(E.cr||0)}
 if(P.dash>0){P.vx=P.dvx;P.vz=P.dvz}else{P.vx=ix/l*P.sp*P.sm;P.vz=iz/l*P.sp*P.sm}
 if(act&&k[' ']&&P.gr&&P.cr<.3)P.vy=10;
 P.yaw=yaw;P.pitch=pitch;
 if(act){const tg=new THREE.Vector3(P.x,P.y+1.8,P.z),fw=C.getWorldDirection(new THREE.Vector3()),L=Math.max(8,Math.min(60,(E.x-C.position.x)*fw.x+(E.y+1.2-C.position.y)*fw.y+(E.z-C.position.z)*fw.z)),aim=C.position.clone().addScaledVector(fw,L),
  mz=new THREE.Vector3(P.x+fx*.9,P.y+1.4-P.cr*.45,P.z+fz*.9),dir=aim.sub(mz).normalize();
  if(firing&&(P.mel||P.w.auto||clicked)){if(P.mel)melee(P,E);else shoot(P,dir)}clicked=false;
  if(k.f)melee(P,E);
  if(k.q)ability(P,ix?ix/l:fx,iz?iz/l:fz);
  bot(dt)}else{E.vx=E.vz=0;if(!over){P.vx=P.vz=0}}
 phys(P,dt);phys(E,dt);
 for(let i=bl.length-1;i>=0;i--){const b=bl[i];b.life-=dt;const f=b.q||b.p.clone();b.q=b.p.clone();b.p.addScaledVector(b.v,dt);
  const t=b.e===P?E:P,dx=b.p.x-f.x,dy=b.p.y-f.y,dz=b.p.z-f.z,l2=dx*dx+dz*dz;let hit=b.life<=0,ts=2,tgd=2;const tw=segBox(f.x,f.y,f.z,b.p.x,b.p.y,b.p.z),w0=tw===null?2:tw;
  if(b.p.y<0&&f.y>=0)tgd=f.y/((f.y-b.p.y)||1);
  {const s2=l2>1e-9?Math.max(0,Math.min(1,((t.x-f.x)*dx+(t.z-f.z)*dz)/l2)):0,cx=f.x+dx*s2,cz=f.z+dz*s2,cy=f.y+dy*s2;
   if(Math.hypot(cx-t.x,cz-t.z)<.75&&cy>t.y&&cy<t.y+(t.hh||2.4))ts=s2}
  const m1=Math.min(w0,ts,tgd);
  if(m1<=1){hit=true;const u=m1===w0?Math.max(0,w0-.01):m1;b.p.set(f.x+dx*u,f.y+dy*u,f.z+dz*u);if(m1===ts&&m1!==w0&&!b.w.rocket)dmg(t,out(b.e,b.w.dmg))}
  else if(b.p.y<0){hit=true;b.p.y=0}
  b.m.position.copy(b.p);
  if(hit){if(b.w.rocket)boom(b.p,b.e);S.remove(b.m);bl.splice(i,1)}}
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;const s=1+f.t*13;f.m.scale.setScalar(s);f.m.material.opacity=Math.max(0,.8-f.t*2.4);if(f.t>.35){S.remove(f.m);FX.splice(i,1)}}
 for(const c of chests){if(c.t>0){c.t-=dt;if(c.t<=0)c.m.visible=true;continue}c.m.rotation.y+=dt*2;c.m.position.y=.12+Math.sin(T*3+c.x)*.1;
  for(const e of[P,E]){if(over||Math.hypot(e.x-c.x,e.z-c.z)>1.6)continue;const dg=e.id==='doge',uh=e.hp<e.mx,us=e.ar<50;
   if(!(dg?uh||us:c.k==='h'?uh:us))continue;c.t=28;c.m.visible=false;
   const gh2=(c.k==='h'||dg)&&uh,gs=(c.k==='s'||dg)&&us;if(gh2)e.hp=Math.min(e.mx,e.hp+40);if(gs)e.ar=Math.min(50,e.ar+30);
   if(e===P)say(gh2&&gs?'+40 HEALTH +30 ARMOR':gh2?'+40 HEALTH':'+30 ARMOR',.9);break}}
 for(const e of[P,E]){if(e.bg){const d=.3*(e.cr||0);e.bg.position.y=-d;e.hg.position.y=e.hy-d;e.lg.forEach(q=>q.scale.y=1-d/.558)}
  e.g.position.set(e.x,e.y+(e.hp<=0?.5:0),e.z);e.g.rotation.y=e.yaw;e.g.rotation.z=e.hp<=0?1.5:0;e.bub.visible=e.sh>0;
  if(e.sw>0||e.mel){e.gun.visible=false;e.ham.visible=true;e.ra.rotation.x=e.sw>0?1.2+e.sw/.3*2:1.05+Math.sin(T*2)*.03}else{e.gun.visible=true;e.ham.visible=false;e.ra.rotation.x=1.2+e.pitch*.8}}
 const tg=new THREE.Vector3(P.x,P.y+1.8-P.cr*.4,P.z),f3=new THREE.Vector3(-Math.sin(yaw)*cp,sp,-Math.cos(yaw)*cp);let dist=6;
 for(let s=.5;s<=6;s+=.5){const q=tg.clone().addScaledVector(f3,-s);if(inBox(q)||q.y<.3){dist=Math.max(1,s-.5);break}}
 C.position.copy(tg).addScaledVector(f3,-dist);C.position.y=Math.max(C.position.y+2.4,.4);C.lookAt(tg.clone().addScaledVector(f3,20));
 C.fov+=((P.spr?78:70)-C.fov)*Math.min(1,dt*8);C.updateProjectionMatrix();
 $('hp1').style.width=P.hp/P.mx*100+'%';$('hp2').style.width=E.hp/E.mx*100+'%';$('ar1').style.width=P.ar*2+'%';$('ar2').style.width=E.ar*2+'%';
 $('wn').textContent=P.w.n+(P.cd.m>0?'':'  |  Hammer ready');$('ab').textContent='Q '+({dash:'Dash',shield:'Shield',air:'Airstrike',reveal:'Reveal enemy'})[P.ab]+': '+(P.cd.a>0?P.cd.a.toFixed(1)+'s':'ready')+'  |  T sprint '+Math.round(P.stam*100)+'%  |  Shift crouch';
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent=''}}
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-loop.l)/1000||0,.05);loop.l=now;T+=dt;
 if(mode==='play')step(dt);else{C.position.set(Math.cos(T*.2)*38,20,Math.sin(T*.2)*38);C.lookAt(0,1,0);for(const e of[P,E]){e.g.position.set(e.x,0,e.z);e.g.rotation.y=e.yaw;e.g.rotation.z=0}}
 R.render(S,C)}
function opts(id,list,cur,fn){const el=$(id);el.innerHTML='';list.forEach(([v,t])=>{const b=document.createElement('button');b.textContent=t;b.className=v===cur?'sel':'';b.onclick=()=>{fn(v);[...el.children].forEach(c=>c.className='');b.className='sel'};el.appendChild(b)})}
opts('wsel',[['rifle','1 Assault rifle'],['shotgun','2 Shotgun'],['rpg','3 RPG']],wsel,v=>wsel=v);
{const el=$('csel');Object.entries(LOOK).forEach(([id,L])=>{const b=document.createElement('button');b.innerHTML='<span class="sw" style="background:#'+L.s.toString(16).padStart(6,'0')+'"></span><span><b>'+L.nm+'</b><small>'+L.pk+'</small></span>';b.className=id===csel?'sel':'';b.onclick=()=>{csel=id;[...el.children].forEach(c=>c.className='');b.className='sel';skin(P,id)};el.appendChild(b)})}
$('go').onclick=()=>{setW(P,WP[wsel]);const o=Object.keys(WP),ids=Object.keys(LOOK).filter(i=>i!==csel);skin(P,csel);skin(E,ids[Math.floor(Math.random()*ids.length)]);setW(E,WP[o[Math.floor(Math.random()*o.length)]]);$('n1').textContent=LOOK[csel].nm.toUpperCase();$('n2').textContent=LOOK[E.id].nm.toUpperCase();
 score=[0,0];$('score').textContent='0 - 0';$('menu').style.display='none';$('hud').style.display='block';mode='play';resetRound();
 try{R.domElement.requestPointerLock()}catch(e){}};
addEventListener('keydown',e=>{const c=e.key.toLowerCase();k[c]=true;if(c===' '||c.startsWith('arrow'))e.preventDefault()});
addEventListener('keyup',e=>k[e.key.toLowerCase()]=false);
addEventListener('mousemove',e=>{if(mode==='play'&&document.pointerLockElement){yaw-=e.movementX*.0025;pitch=Math.max(-.6,Math.min(.8,pitch-e.movementY*.0025))}});
addEventListener('mousedown',e=>{if(mode!=='play')return;if(!document.pointerLockElement)try{R.domElement.requestPointerLock()}catch(x){}
 if(e.button===0){firing=true;clicked=true}if(e.button===2)k.f=true});
addEventListener('mouseup',e=>{if(e.button===0)firing=false;if(e.button===2)k.f=false});
addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{$('tip').style.opacity=document.pointerLockElement?0:1});
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()});
resetRound(true);requestAnimationFrame(loop);
