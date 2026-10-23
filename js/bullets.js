/* Bullets and weapon feel: glowing tracers sized per gun, rockets with an exhaust flame and a smoke trail, muzzle flashes, ejected casings,
   impact sparks and dust, and accurate shooting: the first shots are tight, then the spread blooms while you hold the trigger and recovers
   when you stop. Shotguns fire an even ring of pellets. The burst rifle fires a real three-round burst. */
(()=>{
const TH=THREE,rnd=Math.random;
// bloom per gun: add = spread added per shot, rec = recovery per second, min/max = share of the gun's base spread at rest / at full bloom
const BK={rifle:{add:.11,rec:2.4,min:.28,max:2.0,mv:.4},smg:{add:.075,rec:2.2,min:.35,max:2.4,mv:.08},pistol:{add:.33,rec:3,min:.35,max:1.6,mv:.12},burst:{add:.22,rec:2.6,min:.22,max:1.25,mv:.45},tac:{add:.06,rec:2.2,min:.8,max:1.3,mv:.25}};
// mv = extra spread while moving: the SMG is the run-and-gun weapon, the rifle and burst rifle want you to stop
const MUZ={rifle:1.5,burst:1.52,smg:.8,pistol:.4,shotgun:1.3,tac:1.06,sniper:1.66,rpg:1.35};            // muzzle distance in front of the gun's centre
const TR={rifle:[1.5,.016,0xffd27a],burst:[1.6,.018,0xffc866],smg:[.9,.013,0xffe0a0],pistol:[1,.015,0xffdc8a],shotgun:[.45,.011,0xffcf8a],tac:[.45,.011,0xffcf8a],sniper:[3.4,.026,0xcfeaff]};
const fxo=w=>(w&&w.sig&&window.XW&&XW.fx[w.sig])||null,bkw=w=>{const o=fxo(w);return(o&&o.bk)||BK[w&&w.id]}; // per-gun tuning for the guns in newguns.js (muzzle distance, tracer, bloom)
const sh=m=>{m.userData.sh=1;m.castShadow=false;return m};
const bas=(c,op,add)=>new TH.MeshBasicMaterial({color:c,transparent:op<1||!!add,opacity:op,blending:add?TH.AdditiveBlending:TH.NormalBlending,depthWrite:false});
// ---- textures
function tex(draw){const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));return new TH.CanvasTexture(c)}
const FT=tex(x=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,240,1)');g.addColorStop(.25,'rgba(255,214,120,.95)');g.addColorStop(.6,'rgba(255,120,30,.35)');g.addColorStop(1,'rgba(255,80,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
 x.translate(64,64);x.fillStyle='rgba(255,230,160,.9)';for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,-3);x.lineTo(60,0);x.lineTo(0,3);x.fill()}});
const PT=tex(x=>{const g=x.createRadialGradient(64,64,0,64,64,62);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)});
// ---- shared geometry and materials
const GEO={};const tgeo=(len,r)=>{const k=len+'_'+r;if(GEO[k])return GEO[k];const g=new TH.CylinderGeometry(r,r,len,6,1,false);g.rotateX(Math.PI/2);g.translate(0,0,-len/2);return GEO[k]=g}; // axis along z, head at the origin
const HEAD=new TH.SphereGeometry(1,8,6),CASE=new TH.BoxGeometry(.03,.03,.085),SHELL=new TH.BoxGeometry(.045,.045,.1),CHIP=new TH.BoxGeometry(.06,.06,.06);
const MAT={};const mat=(c,op,add)=>{const k=c+'|'+op+'|'+(add?1:0);return MAT[k]||(MAT[k]=bas(c,op,add))};
const SPR=[];function sprite(map,col,add,op){const m=new TH.SpriteMaterial({map,color:col,transparent:true,opacity:op,blending:add?TH.AdditiveBlending:TH.NormalBlending,depthWrite:false}),s=new TH.Sprite(m);s.userData.sh=1;return s}
// ---- bullet models
function rocketModel(g){const olive=new TH.MeshStandardMaterial({color:0x5b6b3a,roughness:.5,metalness:.2}),red=new TH.MeshStandardMaterial({color:0xe3000b,roughness:.4}),grey=new TH.MeshStandardMaterial({color:0x3a4046,roughness:.4,metalness:.5});
 const body=sh(new TH.Mesh(new TH.CylinderGeometry(.1,.1,.75,12),olive));body.rotation.x=Math.PI/2;body.position.z=-.3;g.add(body);
 const nose=sh(new TH.Mesh(new TH.ConeGeometry(.1,.28,12),red));nose.rotation.x=Math.PI/2;nose.position.z=.2;g.add(nose);
 const band=sh(new TH.Mesh(new TH.CylinderGeometry(.105,.105,.05,12),grey));band.rotation.x=Math.PI/2;band.position.z=.02;g.add(band);
 for(let i=0;i<4;i++){const f=sh(new TH.Mesh(new TH.BoxGeometry(.02,.2,.2),red));f.position.z=-.58;f.rotation.z=i*Math.PI/2;f.position.x=Math.cos(i*Math.PI/2)*.12;f.position.y=Math.sin(i*Math.PI/2)*.12;f.rotation.z=i*Math.PI/2+Math.PI/2;g.add(f)}
 const fl=sh(new TH.Mesh(new TH.ConeGeometry(.1,.9,10),mat(0xff8a1a,.85,1)));fl.rotation.x=-Math.PI/2;fl.position.z=-1.05;g.add(fl);
 const fi=sh(new TH.Mesh(new TH.ConeGeometry(.05,.55,8),mat(0xfff0b0,.95,1)));fi.rotation.x=-Math.PI/2;fi.position.z=-.9;g.add(fi);g.userData.fl=[fl,fi];g.userData.rk=1}
function mk(w,o,d){const g=new TH.Group();g.position.copy(o);
 if(w.rocket)rocketModel(g);
 else{const s=(fxo(w)&&fxo(w).tr)||TR[w.id]||TR.rifle,len=s[0],r=s[1],col=w.tc==='rainbow'?SIG.RB[(rnd()*6)|0]:s[2];
  g.add(sh(new TH.Mesh(tgeo(len,r*1.9),mat(col,.55,1))));g.add(sh(new TH.Mesh(tgeo(len*.8,r*.5),mat(0xfff6dc,1,0))));
  const h=sh(new TH.Mesh(HEAD,mat(col,.9,1)));h.scale.setScalar(r*2.7);g.add(h)}
 g.lookAt(o.clone().add(d));return g}
// ---- spread with bloom
function spread(e,w,dir,n){const out=[],k=bkw(w);let R=(w.spr||0)*(window.ADS?ADS.spr(e):1)*(window.SIG?SIG.spr(e,w):1);
 const ex=e===P&&window.ADS&&!(n>1&&!w.seq)?Math.max(0,Math.min(1,(ADS.z()-.8)/.2)):0; // fully aimed in: no spread at all, the shot goes exactly where the crosshair is (shotgun pellets keep their pattern, centred on it)
 const mv=Math.hypot(e.vx||0,e.vz||0),f=1+(mv>1?(k&&k.mv!=null?k.mv:.25):0)+(e.gr===false?.8:0)-((e.cr||0)>.5?.3:0)+(e.spr?.3:0);
 if(w.id==='sniper')R=(mv>2?.01:0)+(e.gr===false?.03:0);
 R*=1-ex;
 const dx=dir.x,dy=dir.y,dz=dir.z,hy=Math.hypot(dx,dz)||1,rx=dz/hy,rz=-dx/hy,ux=-dy*dx/hy,uy=hy,uz=-dy*dz/hy;
 const a0=rnd()*6.2832;
 for(let i=0;i<n;i++){let rad,ang;
  if(n>1&&!w.seq){const Rs=R*1.3*(w.auto?.85+.4*(e.bl||0):1);ang=a0+i*2.39996;rad=Rs*Math.sqrt((i+.5)/n)*(.85+.3*rnd())}   // an even ring of pellets
  else{const b=k?k.min+(k.max-k.min)*(e.bl||0):1;rad=R*b*f*Math.sqrt(rnd());ang=rnd()*6.2832}
  const c=Math.cos(ang)*rad,s=Math.sin(ang)*rad,x=dx+rx*c+ux*s,y=dy+uy*s,z=dz+rz*c+uz*s,l=Math.hypot(x,y,z)||1;out.push(new TH.Vector3(x/l,y/l,z/l))}
 return out}
// ---- effects
const FL=[],PF=[],SP=[],CS=[],Q=[];
function mpos(e,w,o){try{if(e.gun&&e.gun.localToWorld){e.g.updateMatrixWorld(true);const v=new TH.Vector3(0,0,-((fxo(w)&&fxo(w).muz)||MUZ[w.id]||1));e.gun.localToWorld(v);if(isFinite(v.x)&&isFinite(v.y)&&isFinite(v.z)&&Math.hypot(v.x-e.x,v.z-e.z)<4)return v}}catch(x){}return o}
function flash(p,size){if(FL.length>14){const f=FL.shift();S.remove(f.s)}const s=sprite(FT,0xffd890,1,1);s.position.copy(p);s.scale.set(size,size,1);s.material.rotation=rnd()*6.28;S.add(s);FL.push({s,t:0,life:.06,size})}
function puff(p,vx,vy,vz,s0,s1,life,col,op){if(PF.length>60){const q=PF.shift();S.remove(q.s)}const s=sprite(PT,col,0,op);s.position.copy(p);s.scale.set(s0,s0,1);s.material.rotation=rnd()*6.28;S.add(s);PF.push({s,v:[vx,vy,vz],t:0,life,s0,s1,op})}
const BITS=[0xe3000b,0x0055bf,0xfac80a,0x237841,0xf2f2f2,0xff8c00];
function spark(p,vx,vy,vz,col,life,grav){if(SP.length>70){const q=SP.shift();S.remove(q.m)}const m=sh(new TH.Mesh(CHIP,mat(col,1,0)));m.position.copy(p);m.scale.setScalar(col===0xffd27a?.35:.8);S.add(m);SP.push({m,v:[vx,vy,vz],t:0,life,g:grav,s:col===0xffd27a?.35:.8})}
function casing(e,w,dir,ey){if(w.rocket)return;if(CS.length>36){const q=CS.shift();S.remove(q.m)}
 const hy=Math.hypot(dir.x,dir.z)||1,rx=dir.z/hy,rz=-dir.x/hy,sh2=w.id==='shotgun'||w.id==='tac',m=sh(new TH.Mesh(sh2?SHELL:CASE,mat(sh2?0xd23a2a:0xd8a93a,1,0)));
 m.position.set(e.x+dir.x*.4+rx*.24,ey-.05,e.z+dir.z*.4+rz*.24);m.rotation.set(rnd()*6,rnd()*6,rnd()*6);S.add(m);
 CS.push({m,v:[rx*(1.8+rnd())-dir.x*.5,2.4+rnd()*1.2,rz*(1.8+rnd())-dir.z*.5],w:[rnd()*20-10,rnd()*20-10,rnd()*20-10],t:0,gnd:0})}
function fired(e,w,o,dir,n,remote){const k=bkw(w);if(k&&!remote){e.bl=Math.min(1,(e.bl||0)+k.add);e.bld=.11}
 const mp=mpos(e,w,o);flash(mp,w.rocket?1.5:w.id==='sniper'?1.1:w.id==='shotgun'||w.id==='tac'?1:w.id==='pistol'?.5:.7+rnd()*.25);
 if(w.rocket){for(let i=0;i<7;i++)puff(new TH.Vector3(mp.x-dir.x*.9,mp.y-dir.y*.9,mp.z-dir.z*.9),-dir.x*(2+rnd()*3)+(rnd()-.5)*2,(rnd()-.2)*1.5,-dir.z*(2+rnd()*3)+(rnd()-.5)*2,.4,1.5+rnd(),.8,0xb8b8b8,.5)}
 else puff(mp,dir.x*1.5,.3,dir.z*1.5,.12,.35,.35,0xcfcfcf,.35);
 casing(e,w,dir,e.y+1.4-(e.cr||0)*.45);
 if(w.seq&&!e._one&&!remote&&w.pel>1)for(let i=1;i<w.pel;i++)Q.push({e,dir:dir.clone(),t:.075*i})}
function hit(b,kind){if(!kind||b.w.rocket)return;const p=b.p,v=b.v,l=Math.hypot(v.x,v.y,v.z)||1,nx=-v.x/l,ny=-v.y/l,nz=-v.z/l;
 for(let i=0;i<(kind===2?4:7);i++){const s=1.5+rnd()*4;spark(p,nx*s+(rnd()-.5)*4,ny*s+rnd()*3+1,nz*s+(rnd()-.5)*4,kind===2||i%3===0?0xffd27a:BITS[(rnd()*BITS.length)|0],.35+rnd()*.3,16)}
 puff(p,nx*.6,.8,nz*.6,.25,.9,.45,kind===2?0xffffff:0xb9b3a8,.5)}
// ---- per-frame update
function tick(dt){
 for(let i=FL.length-1;i>=0;i--){const f=FL[i];f.t+=dt;const u=f.t/f.life;if(u>=1){S.remove(f.s);FL.splice(i,1);continue}f.s.material.opacity=1-u;f.s.scale.set(f.size*(1+u*.4),f.size*(1+u*.4),1)}
 for(let i=PF.length-1;i>=0;i--){const q=PF[i];q.t+=dt;const u=q.t/q.life;if(u>=1){S.remove(q.s);PF.splice(i,1);continue}q.s.position.x+=q.v[0]*dt;q.s.position.y+=q.v[1]*dt;q.s.position.z+=q.v[2]*dt;q.v[1]+=.6*dt;const s=q.s0+(q.s1-q.s0)*Math.sqrt(u);q.s.scale.set(s,s,1);q.s.material.opacity=q.op*(1-u)}
 for(let i=SP.length-1;i>=0;i--){const q=SP[i];q.t+=dt;if(q.t>=q.life){S.remove(q.m);SP.splice(i,1);continue}q.v[1]-=q.g*dt;const p=q.m.position;p.x+=q.v[0]*dt;p.y=Math.max(.03,p.y+q.v[1]*dt);p.z+=q.v[2]*dt;if(p.y<=.031){q.v[1]*=-.3;q.v[0]*=.6;q.v[2]*=.6}q.m.rotation.x+=dt*9;q.m.scale.setScalar(q.s*(1-q.t/q.life*.6))}
 for(let i=CS.length-1;i>=0;i--){const q=CS[i];q.t+=dt;if(q.t>1.6){S.remove(q.m);CS.splice(i,1);continue}const p=q.m.position;q.v[1]-=18*dt;p.x+=q.v[0]*dt;p.y+=q.v[1]*dt;p.z+=q.v[2]*dt;
  if(p.y<=.03){p.y=.03;if(Math.abs(q.v[1])>1){q.v[1]*=-.35;q.v[0]*=.5;q.v[2]*=.5}else{q.v[1]=0;q.v[0]*=.8;q.v[2]*=.8;q.w=[0,0,0]}}q.m.rotation.x+=q.w[0]*dt;q.m.rotation.y+=q.w[1]*dt;q.m.rotation.z+=q.w[2]*dt}
 // rockets: flickering exhaust and a smoke trail
 for(const b of bl){if(!b.w.rocket)continue;const fl=b.m.userData&&b.m.userData.fl;if(fl){const s=.75+rnd()*.6;fl[0].scale.set(1,s,1);fl[1].scale.set(1,.8+rnd()*.5,1)}
  b.tr=(b.tr||0)-dt;if(b.tr<=0){b.tr=.035;const l=Math.hypot(b.v.x,b.v.y,b.v.z)||1;puff(new TH.Vector3(b.p.x-b.v.x/l*.9,b.p.y-b.v.y/l*.9,b.p.z-b.v.z/l*.9),(rnd()-.5)*.6,(rnd()-.3)*.5,(rnd()-.5)*.6,.22,.8,.9,0xc9c9c9,.55)}}
 // true three-round bursts
 for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t>0)continue;Q.splice(i,1);const e=q.e;if(over||mode!=='play'||e.hp<=0||e.w.id!=='burst')continue;
  e._one=1;try{const as=e===P&&window.AIMSOLVE?AIMSOLVE(0):null;if(as){window.SHOT_O=as.o;fire(e,as.dir);window.SHOT_O=null;P.ad=as.vis}else fire(e,q.dir);e.rc=1;if(e===P||Math.hypot(P.x-e.x,P.z-e.z)<30)window.SFX&&SFX.rifle&&SFX.rifle()}finally{e._one=0}}
 // bloom settles when you stop shooting
 for(const e of ENTS()){if((e.bld||0)>0){e.bld-=dt;continue}if(e.bl>0){const k=bkw(e.w);e.bl=Math.max(0,e.bl-dt*(k?k.rec:2.4))}}
 const cr=document.getElementById('cross');if(cr&&mode==='play'){const s=Math.round(52*(1+.6*(P.bl||0)*(1-(window.ADS?Math.max(0,Math.min(1,(ADS.z()-.8)/.2)):0))));if(cr._s!==s){cr._s=s;cr.style.width=cr.style.height=s+'px';cr.style.margin=(-s/2)+'px 0 0 '+(-s/2)+'px'}}}
const _step=step;
window.BV={mk,spread,fired,hit,step:tick,Q,muzzle:(e,w)=>mpos(e,w,null)};
step=function(dt){_step(dt);BV.step(dt)};
const _rr=resetRound;resetRound=function(i){_rr(i);for(const a of[FL,PF,SP,CS])for(const q of a.splice(0))S.remove(q.s||q.m);Q.length=0;P.bl=E.bl=0;P.bld=E.bld=0};
})();
