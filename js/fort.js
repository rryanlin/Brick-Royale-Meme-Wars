/* Port-a-Fortress: a throwable loot item. It lands, and a brick tower (6x6, 6 high, with corner battlements) rises on the spot, with a
   bounce pad on the ground next to it. Step on the pad and it flings you up and over onto the roof, where you can spray down on the enemy.
   Everything on it is solid (colliders in boxes[]), bullets are blocked by it, and at most two stand at once.
   Online: the thrower picks the spot and tells the other player (message 'ft'), so both screens build it in exactly the same place. */
(()=>{
const TW=6,TH=6,PD=1.3,CORN=1.3,V3=THREE.Vector3;
const FT=[],PADS=[],FP=[];let uid=0;
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.05},o));
const stone=[mat(0x9aa1a9),mat(0x868d96)],dark=mat(0x2b2f36),red=mat(0xc0392b),gold=mat(0xffd02f,{emissive:0xffd02f,emissiveIntensity:.25});
const add=(g,geo,m,x,y,z)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);g.add(q);return q};
const stud=new THREE.CylinderGeometry(.28,.28,.2,12);
// local model: the pad side faces +z; the whole group is rotated to the chosen direction
function model(){const g=new THREE.Group(),n=10,ch=TH/n;
 for(let k=0;k<n;k++)add(g,B(TW-(k%2?.0:.06),ch-.02,TW-(k%2?.0:.06)),stone[k%2],0,(k+.5)*ch,0);
 add(g,B(TW,.12,TW),mat(0xb3bac2),0,TH+.06,0);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)add(g,stud,mat(0xb3bac2),(i-1)*1.5,TH+.22,(j-1)*1.5-.2);
 const o=TW/2-CORN/2;
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{add(g,B(CORN,1.5,CORN),stone[1],a*o,TH+.75,b*o);add(g,stud,mat(0xb3bac2),a*o,TH+1.6,b*o)});
 // gate + banners on the pad side, arrow slits on the other sides
 add(g,B(1.7,2.5,.12),dark,0,1.25,TW/2+.03);add(g,B(1.7,.5,.12),dark,0,2.6,TW/2+.03);
 [-1,1].forEach(s=>{add(g,B(.55,1.9,.08),red,s*1.9,3.3,TW/2+.03);add(g,B(.35,.35,.1),gold,s*1.9,3.9,TW/2+.05)});
 [-1,1].forEach(s=>{add(g,B(.14,1,.12),dark,s*1,3.6,-TW/2-.02);add(g,B(.12,1,.14),dark,TW/2+.02,3.6,s*1);add(g,B(.12,1,.14),dark,-TW/2-.02,3.6,s*1)});
 add(g,new THREE.CylinderGeometry(.06,.06,2.2,8),mat(0x555a60),o,TH+2.6,o);add(g,B(.9,.55,.05),red,o+.5,TH+3.4,o);
 return g}
function padModel(){const g=new THREE.Group();
 add(g,new THREE.CylinderGeometry(.82,.9,.16,24),mat(0x3a4048),0,.08,0);
 const top=add(g,new THREE.CylinderGeometry(.7,.7,.12,24),mat(0x39d96b,{emissive:0x39d96b,emissiveIntensity:.5}),0,.2,0);
 add(g,new THREE.TorusGeometry(.78,.05,8,28),mat(0xffee66,{emissive:0xffee66,emissiveIntensity:.6}),0,.24,0).rotation.x=Math.PI/2;
 [-.28,.05,.38].forEach(z=>{const a=add(g,B(.5,.04,.12),mat(0xffffff,{emissive:0xffffff,emissiveIntensity:.5}),0,.275,z);a.rotation.y=0});
 g.userData.top=top;return g}
const boxOf=(x1,x2,z1,z2,h,id)=>({x1,x2,z1,z2,h,ft:id});
function rects(cx,cz,dx,dz){const px=cx+dx*(TW/2+PD),pz=cz+dz*(TW/2+PD);return[[cx-TW/2-.25,cx+TW/2+.25,cz-TW/2-.25,cz+TW/2+.25],[px-1.2,px+1.2,pz-1.2,pz+1.2]]}
function free(cx,cz,dx,dz){const R=rects(cx,cz,dx,dz);
 for(const r of R)if(r[0]<-A+.3||r[1]>A-.3||r[2]<-A+.3||r[3]>A-.3)return false;
 for(const b of boxes)for(const r of R)if(b.x1<r[1]&&b.x2>r[0]&&b.z1<r[3]&&b.z2>r[2])return false;
 for(const q of ENTS())for(const r of R)if(q.x>r[0]-.7&&q.x<r[1]+.7&&q.z>r[2]-.7&&q.z<r[3]+.7)return false;
 return true}
function remove(f){S.remove(f.g);S.remove(f.pad);for(let i=boxes.length-1;i>=0;i--)if(boxes[i].ft===f.id)boxes.splice(i,1);
 for(let i=PADS.length-1;i>=0;i--)if(PADS[i].id===f.id)PADS.splice(i,1)}
function build(cx,cz,dx,dz,owner){while(FT.length>=2)remove(FT.shift());
 const id=++uid,g=model();g.rotation.y=Math.atan2(dx,dz);g.position.set(cx,-TH,cz);S.add(g);
 const px=cx+dx*(TW/2+PD),pz=cz+dz*(TW/2+PD),pad=padModel();pad.position.set(px,0,pz);S.add(pad);
 const h=TW/2,o=h-CORN;
 const bs=[boxOf(cx-h,cx+h,cz-h,cz+h,TH,id)];
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=cx+a*(h-CORN/2),z=cz+b*(h-CORN/2);bs.push(boxOf(x-CORN/2,x+CORN/2,z-CORN/2,z+CORN/2,TH+1.5,id))});
 bs.forEach(b=>boxes.push(b));
 PADS.push({id,x:px,z:pz,dx:-dx,dz:-dz,pad});
 FT.push({id,g,pad,t:0,boxes:bs,cx,cz});
 window.NAV&&NAV.rebuild();
 for(const e of ENTS())eject(e,bs);
 try{window.SFX&&SFX.boom&&SFX.pick&&SFX.pick()}catch(x){}
 return id}
// anyone standing in the footprint is pushed out to the nearest side
function eject(e,bs){for(const b of bs){if(e.x>b.x1-.5&&e.x<b.x2+.5&&e.z>b.z1-.5&&e.z<b.z2+.5&&e.y<b.h-.3){
  const d=[[e.x-b.x1+.55,-1,0],[b.x2-e.x+.55,1,0],[e.z-b.z1+.55,0,-1],[b.z2-e.z+.55,0,1]].sort((a,c)=>a[0]-c[0])[0];e.x+=d[1]*d[0];e.z+=d[2]*d[0]}}}
function place(e,lx,lz){
 const tx=e.x-lx,tz=e.z-lz,pref=Math.abs(tx)>Math.abs(tz)?(tx>0?[1,0]:[-1,0]):(tz>0?[0,1]:[0,-1]);
 const dirs=[pref,[-pref[1],pref[0]],[pref[1],-pref[0]],[-pref[0],-pref[1]]];
 for(let r=0;r<=14;r+=1){const n=r?16:1;for(let k=0;k<n;k++){const a=k/n*6.2832,x=+(lx+Math.cos(a)*r).toFixed(2),z=+(lz+Math.sin(a)*r).toFixed(2);
  for(const d of dirs)if(free(x,z,d[0],d[1])){build(x,z,d[0],d[1],e);if(e===P&&window.NETH&&NETH.on())NETH.fort({x,z,dx:d[0],dz:d[1]});return true}}}
 return false}
function thr(e,dir){const m=new THREE.Group();add(m,B(.5,.5,.5),mat(0xb08040),0,0,0);add(m,B(.54,.12,.54),gold,0,.22,0);add(m,B(.04,.5,.04),mat(0x555a60),0,.5,0);add(m,B(.3,.2,.03),red,.17,.62,0);
 const p=new V3(e.x,e.y+1.6,e.z).addScaledVector(dir,.8);m.position.copy(p);S.add(m);
 FP.push({m,p,v:dir.clone().multiplyScalar(16).add(new V3(0,5,0)),o:e,t:0})}
function land(f,i){S.remove(f.m);FP.splice(i,1);
 if(!place(f.o,f.p.x,f.p.z)){const o=f.o;if(o.inv&&o.inv.length<3)o.inv.push('fort');if(o===P)say('NO ROOM FOR A FORTRESS',1.2)}}
function pads(dt){if(over||introT>0)return;
 for(const e of ENTS()){if(e===E&&window.NETH&&NETH.on())continue;e.pcd=Math.max(0,(e.pcd||0)-dt);if(e.pf||e.pcd>0||e.hp<=0)continue;
  if(!(e.gr||e.y<.35))continue;
  for(const q of PADS)if(Math.hypot(e.x-q.x,e.z-q.z)<.95){e.vy=19;e.gr=false;e.y+=.05;e.pf={t:0,dx:q.dx,dz:q.dz};e.pcd=.6;e.dash=0;q.pad.userData.t=.3;
   if(e===P){say('BOUNCE!',.5);window.SFX&&SFX.pick&&SFX.pick()}break}}}
window.FORT={
 throw(e,dir){thr(e,dir)},
 remote(m){if(!m||typeof m.x!=='number'||typeof m.z!=='number')return;const dx=m.dx|0,dz=m.dz|0;if(!(Math.abs(dx)+Math.abs(dz)===1))return;build(m.x,m.z,dx,dz,E)},
 clear(){FT.splice(0).forEach(remove);FP.splice(0).forEach(f=>S.remove(f.m));window.NAV&&NAV.rebuild()},
 count:()=>FT.length};
// flight off a pad is scripted for about a second: drift slowly while rising past the wall, then glide over the roof
const _phys=phys;phys=function(e,dt){if(e.pf){e.pf.t+=dt;const s=e.pf.t<.4?.8:5;e.vx=e.pf.dx*s;e.vz=e.pf.dz*s;if(e.pf.t>.3&&e.gr)e.pf=null}_phys(e,dt)};
const _rr=resetRound;resetRound=function(i){FORT.clear();for(const e of ENTS()){e.pf=null;e.pcd=0}_rr(i)};
const _step=step;step=function(dt){_step(dt);
 for(let i=FP.length-1;i>=0;i--){const f=FP[i];f.t+=dt;f.v.y-=22*dt;f.p.addScaledVector(f.v,dt);f.m.position.copy(f.p);f.m.rotation.y+=dt*6;
  if(f.t>3||(f.p.y<=.3&&f.v.y<0)||(f.t>.15&&inBox(f.p)))land(f,i)}
 for(const f of FT){if(f.t<.5){f.t+=dt;const k=Math.min(1,f.t/.5);f.g.position.y=-TH*(1-k*k*(3-2*k))}}
 for(const q of PADS){const u=q.pad.userData;u.t=Math.max(0,(u.t||0)-dt);q.pad.scale.set(1,1-.5*Math.min(1,u.t/.3),1);if(u.top)u.top.material.emissiveIntensity=.5}
 if(mode==='play')pads(dt)};
})();
