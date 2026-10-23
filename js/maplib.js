/* Map framework: more arenas besides Brick Town.
   A map is a 30 x 30 grid of 2 m cells (we only write one quarter and mirror it), a list of structures built from LEGO-style bricks, and a sky
   that slowly turns from day to dusk while the round clock runs. Everything is built from the same few pieces (courses of bricks with seams and
   studs, round bricks, plates, stairs, crates, banners, lamps) so the maps look like they come from one box of bricks.
   The grid decides what you can walk on: every cell that is not floor gets an invisible wall (nb = stops fighters, never stops bullets or the camera),
   so water, moats and the gaps between sky islands work for the CPU and for fighters without any extra code.
   Colliders use the same {x1,x2,z1,z2,h,[y0]} boxes as the town, so storm, pickups, nav, abilities and online play need nothing special. */
(()=>{
const TH=THREE,PI=Math.PI,MAPS=window.MAPS={list:[],by:{},cur:'town',pickId:'random'};
const BH=.64,BL=2; // brick height and length, the same as the town
// ---------- small helpers
const shade=(c,f)=>{const r=Math.min(255,Math.round((c>>16&255)*f)),g=Math.min(255,Math.round((c>>8&255)*f)),b=Math.min(255,Math.round((c&255)*f));return r<<16|g<<8|b};
const mixc=(a,b,t)=>{const r=Math.round((a>>16&255)*(1-t)+(b>>16&255)*t),g=Math.round((a>>8&255)*(1-t)+(b>>8&255)*t),bl=Math.round((a&255)*(1-t)+(b&255)*t);return r<<16|g<<8|bl};
const rnd=(a,b,c)=>{let h=Math.imul((a*1000+1)|0,374761393)^Math.imul(((b||0)*1000+7)|0,668265263)^Math.imul(((c||0)*1000+13)|0,2147483647);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const lerp=(a,b,t)=>a+(b-a)*t;
// ---------- state of the map that is built right now
let TLS=null,TILED=null,INS=null,dry=false,pend=[],mo=[],anim=[],glows=[],curDef=null,gridDef=null,P0=[],spawnPts=[[-22,0],[22,0]];
const GEO={};
function geo(k){if(GEO[k])return GEO[k];let g;
 if(k==='b')g=new TH.BoxGeometry(1,1,1);else if(k==='c')g=new TH.CylinderGeometry(1,1,1,20);else if(k==='c8')g=new TH.CylinderGeometry(1,1,1,8);else if(k==='c6')g=new TH.CylinderGeometry(1,1,1,6);
 else if(k==='s')g=new TH.CylinderGeometry(.2,.2,.14,12);else if(k[0]==='f')g=new TH.CylinderGeometry(+k.slice(1)/100,1,1,16);else g=new TH.SphereGeometry(1,12,8);
 return GEO[k]=g}
const MC={};
function matFor(c,mt){const key=c+'|'+(mt||'');if(MC[key])return MC[key];let m;
 if(!mt)m=M(c);
 else if(mt[0]==='t'){m=new TH.MeshStandardMaterial({color:c,roughness:.12,metalness:.1,transparent:true,opacity:+mt.slice(1)/100,depthWrite:false})}
 else if(mt[0]==='g'){m=new TH.MeshStandardMaterial({color:c,roughness:.35,metalness:.3,emissive:c,emissiveIntensity:.2})} // shiny gold / metal
 else{ // emissive: e<kind>
  m=new TH.MeshStandardMaterial({color:mt[1]==='W'?shade(c,.22):c,emissive:c,emissiveIntensity:1,roughness:mt[1]==='W'?.2:.5});glows.push({m,kind:mt[1],base:mt[1]==='F'?1.3:1})}
 return MC[key]=m}
function ib(k,c,x,y,z,sx,sy,sz,ry,mt){if(dry||!INS)return;const key=k+'|'+c+'|'+(mt||'');let g=INS.get(key);if(!g){g={k,c,mt,a:[]};INS.set(key,g)}g.a.push(x,y,z,sx,sy,sz,ry||0)}
function add(o){if(dry)return o;S.add(o);mo.push(o);return o}
let LAST=[];
// "everything is connected": any little piece of scenery that ended up hanging in the air a short way from the rest
// (a lantern off its wall, a canopy above a trunk, a torch beside its bracket) gets a thin strut to the nearest grounded brick
function fixFloaters(M){
 const B=[],G=[],IX=[];
 for(const g of M.values()){if(g.k==='s')continue;const a=g.a;
  for(let i=0;i<a.length;i+=7){const x=a[i],y=a[i+1],z=a[i+2],sx=Math.abs(a[i+3]),sy=Math.abs(a[i+4]),sz=Math.abs(a[i+5]),ry=a[i+6];let ex,ey,ez;
   if(g.k==='b'){const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));ex=c*sx/2+s*sz/2;ez=s*sx/2+c*sz/2;ey=sy/2}
   else if(g.k==='o'){ex=sx;ey=sy;ez=sz}else{ex=sx;ey=sy/2;ez=sx}
   B.push([x-ex,x+ex,y-ey,y+ey,z-ez,z+ez]);G.push(g);IX.push(i)}}
 const n=B.length;if(n<2||n>60000)return;
 const par=new Int32Array(n);for(let i=0;i<n;i++)par[i]=i;
 const f=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i};
 const TOL=.16,CELL=3,H=new Map(),key=(a,b)=>a*4096+b+2048*4096;
 const cells=(b,t)=>{const r=[];for(let gx=Math.floor((b[0]-t)/CELL);gx<=Math.floor((b[1]+t)/CELL);gx++)for(let gz=Math.floor((b[4]-t)/CELL);gz<=Math.floor((b[5]+t)/CELL);gz++)r.push(key(gx,gz));return r};
 for(let i=0;i<n;i++)for(const k of cells(B[i],TOL)){let l=H.get(k);if(!l){l=[];H.set(k,l)}l.push(i)}
 for(const l of H.values())for(let a=0;a<l.length;a++){const i=l[a],bi=B[i];for(let c=a+1;c<l.length;c++){const j=l[c],bj=B[j];
  if(bi[0]<=bj[1]+TOL&&bj[0]<=bi[1]+TOL&&bi[2]<=bj[3]+TOL&&bj[2]<=bi[3]+TOL&&bi[4]<=bj[5]+TOL&&bj[4]<=bi[5]+TOL){const p=f(i),q=f(j);if(p!==q)par[p]=q}}}
 const low=new Map();for(let i=0;i<n;i++){const r=f(i);const v=low.get(r);if(v===undefined||B[i][2]<v)low.set(r,B[i][2])}
 const cnt=new Map();for(let i=0;i<n;i++){const r=f(i);cnt.set(r,(cnt.get(r)||0)+1)}
 const anchor=r=>low.get(r)<=.12||cnt.get(r)>=15; // the ground, or a whole structure (a floating island is one)
 const GH=new Map(),gb=[];
 for(let i=0;i<n;i++)if(anchor(f(i))){gb.push(i);for(const k of cells(B[i],3.25)){let l=GH.get(k);if(!l){l=[];GH.set(k,l)}l.push(i)}}
 const gap=(a,b)=>{const dx=Math.max(0,a[0]-b[1],b[0]-a[1]),dy=Math.max(0,a[2]-b[3],b[2]-a[3]),dz=Math.max(0,a[4]-b[5],b[4]-a[5]);return Math.sqrt(dx*dx+dy*dy+dz*dz)};
 const best=new Map(),loose=new Map(); // component -> [gap, floating box, grounded box]
 for(let i=0;i<n;i++){const r=f(i);if(anchor(r))continue;const b=B[i];
  const R=cnt.get(r)<=8?3.25:1.05,seen=new Set();
  for(const k of cells(b,R)){const l=GH.get(k);if(!l)continue;for(const j of l){if(seen.has(j))continue;seen.add(j);const d=gap(b,B[j]);if(d>R)continue;const v=best.get(r);if(!v||d<v[0])best.set(r,[d,i,j])}}
  let l=loose.get(r);if(!l){l=[];loose.set(r,l)}l.push(i)}
 const add=[],drop=new Map();
 for(const[r,ix]of loose){const v=best.get(r);
  if(v){const[d0,i,j]=v,a=B[i],b=B[j],lo=[],hi=[];
   for(let q=0;q<6;q+=2){const o0=Math.max(a[q],b[q]),o1=Math.min(a[q+1],b[q+1]);
    if(o1>o0){const m=(o0+o1)/2,h=Math.min((o1-o0)/2,.12);lo.push(m-h);hi.push(m+h)}
    else{lo.push(Math.min(a[q+1],b[q+1])-.03);hi.push(Math.max(a[q],b[q])+.03)}}
   const g=G[j];add.push([lo,hi,g.mt?0x2a2c33:g.c])}
  else if(ix.length<=4){ // a stray bit hanging in the playable space with nothing to hold it: it goes
   let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9;for(const i of ix){const b=B[i];x0=Math.min(x0,b[0]);x1=Math.max(x1,b[1]);z0=Math.min(z0,b[4]);z1=Math.max(z1,b[5]);y0=Math.min(y0,b[2])}
   if(Math.abs((x0+x1)/2)<58&&Math.abs((z0+z1)/2)<58&&y0<22&&y0>1.5)for(const i of ix){let st=drop.get(G[i]);if(!st){st=new Set();drop.set(G[i],st)}st.add(IX[i])}}}
 for(const[g,st]of drop){const k=[];for(let i=0;i<g.a.length;i+=7)if(!st.has(i))for(let q=0;q<7;q++)k.push(g.a[i+q]);g.a=k}
 for(const[lo,hi,c]of add){const w=Math.max(.12,hi[0]-lo[0]),h=Math.max(.12,hi[1]-lo[1]),d=Math.max(.12,hi[2]-lo[2]);ib('b',c,(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2,w,h,d,0)}
 return add.length}
let PW=null;const plainW=()=>PW||(PW=new TH.MeshStandardMaterial({color:0xffffff,roughness:.22,metalness:0,envMapIntensity:.6})); // (same look as the plain brick material, white, so the per-brick colour is the colour)
function flush(){if(!INS)return;try{fixFloaters(INS)}catch(e){console.error(e)}LAST=[...INS.values()];const o=new TH.Object3D(),tc=new TH.Color();
 // every plain (matt) brick of one shape is ONE instanced mesh whose colour is stored per brick: a map is a few dozen draw calls instead of hundreds (lighter on the GPU and on the CPU, and in the shadow pass too)
 const put=(im,i,a,j)=>{o.position.set(a[j],a[j+1],a[j+2]);o.scale.set(a[j+3],a[j+4],a[j+5]);o.rotation.set(0,a[j+6],0);o.updateMatrix();im.setMatrixAt(i,o.matrix)};
 const byK=new Map();for(const g of INS.values()){if(g.mt||!g.a.length)continue;let l=byK.get(g.k);if(!l){l=[];byK.set(g.k,l)}l.push(g)}
 for(const[k,l]of byK){let n=0;for(const g of l)n+=g.a.length/7;
  const im=new TH.InstancedMesh(geo(k),plainW(),n);let i=0;
  for(const g of l){tc.setHex(g.c);for(let j=0;j<g.a.length;j+=7,i++){put(im,i,g.a,j);im.setColorAt(i,tc)}}
  if(im.instanceMatrix)im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;add(im)}
 for(const g of INS.values()){if(!g.mt)continue;const n=g.a.length/7,im=new TH.InstancedMesh(geo(g.k),matFor(g.c,g.mt),n);
  for(let i=0;i<n;i++)put(im,i,g.a,i*7);
  if(im.instanceMatrix)im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;add(im)}
 INS=null}
// ---------- primitives (everything is centred on x,y,z; sizes are full size)
const bx=(x,y,z,w,h,d,c,ry,mt)=>ib('b',c,x,y,z,w,h,d,ry,mt);
const cy=(x,y,z,r,h,c,mt,k)=>ib(k||'c',c,x,y,z,r,h,r,0,mt);
const fr=(x,y,z,rb,rt,h,c,mt)=>ib('f'+Math.round(rt/rb*100),c,x,y,z,rb,h,rb,0,mt);
const stud=(x,y,z,c)=>ib('s',c,x,y,z,1,1,1,0);
const ball=(x,y,z,r,c,mt)=>ib('o',c,x,y,z,r,r,r,0,mt);
function studs(x1,x2,z1,z2,y,c,sp){sp=sp||1;const nx=Math.max(1,Math.floor((x2-x1)/sp+.01)),nz=Math.max(1,Math.floor((z2-z1)/sp+.01));
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)stud(x1+(i+.5)*(x2-x1)/nx,y+.07,z1+(j+.5)*(z2-z1)/nz,c)}
// collider (not added to the real world while a map is only being drawn as a thumbnail)
function col(x1,x2,z1,z2,top,y0,tag){const b={x1,x2,z1,z2,h:top};if(y0)b.y0=y0;if(tag)Object.assign(b,tag);pend.push(b);return b}
// ---------- a wall of real brick courses: running bond, seams, a darker core behind the seams, optional studs, band row and merlons
function wall(x1,x2,z1,z2,h,c,o){o=o||{};const y0=o.y0||0,lx=x2-x1,lz=z2-z1,ax=lx>=lz,Ln=ax?lx:lz,t=ax?lz:lx,cx=(x1+x2)/2,cz=(z1+z2)/2;
 if(o.col!==false)col(x1,x2,z1,z2,y0+h,y0);
 if(dry)return;
 const nc=Math.max(1,Math.round(h/BH)),ch=h/nc,n=Math.max(1,Math.round(Ln/BL)),l=Ln/n;
 bx(cx,y0+h/2,cz,ax?Ln-.1:t-.12,h-.02,ax?t-.12:Ln-.1,shade(c,.55));
 for(let k=0;k<nc;k++){const y=y0+(k+.5)*ch;let bs=[];for(let i=0;i<=n;i++)bs.push(i*l);if(k%2&&n>=2){bs=[0];for(let i=0;i<n;i++)bs.push((i+.5)*l);bs.push(Ln)}
  for(let i=0;i<bs.length-1;i++){const bl=bs[i+1]-bs[i]-.04,a=(bs[i]+bs[i+1])/2-Ln/2,v=rnd(k,i,cx*7+cz*3),
    cc=o.band&&k===o.band[0]?o.band[1]:shade(c,v<.16?.9:v>.86?1.07:1);
   bx(ax?cx+a:cx,y,ax?cz:cz+a,ax?bl:t-.02,ch-.03,ax?t-.02:bl,cc)}}
 if(o.studs&&Ln>=1&&t>=.9)studs(x1,x2,z1,z2,y0+h,o.sc||c);
 if(o.cren)cren(x1,x2,z1,z2,y0+h,o.cc||c,o.ch||.7)}
// merlons along the top of a wall (visual only)
function cren(x1,x2,z1,z2,y,c,hh){if(dry)return;const lx=x2-x1,lz=z2-z1,ax=lx>=lz,Ln=ax?lx:lz,t=ax?lz:lx,cx=(x1+x2)/2,cz=(z1+z2)/2,n=Math.max(1,Math.floor(Ln/1.6)),l=Ln/n;
 for(let i=0;i<n;i+=1){const a=-Ln/2+(i+.5)*l,w=l*.55;bx(ax?cx+a:cx,y+hh/2,ax?cz:cz+a,ax?w:t,hh,ax?t:w,shade(c,i%2?.96:1.02));stud(ax?cx+a:cx,y+hh,ax?cz:cz+a,c)}}
// a stack of plain brick courses for solid blocks that are not walls (buildings' cores etc.) with no collider
function plain(x1,x2,z1,z2,y0,y1,c){if(dry)return;bx((x1+x2)/2,(y0+y1)/2,(z1+z2)/2,x2-x1,y1-y0,z2-z1,c)}
// round tower made of round bricks with arrow slits, a ring of merlons and a stepped cone roof
function rtower(cx,cz,r,h,c,o){o=o||{};col(cx-r,cx+r,cz-r,cz+r,h,0);if(dry)return;
 const nc=Math.max(1,Math.round(h/BH)),ch=h/nc;
 cy(cx,h/2,cz,r*.93,h-.02,shade(c,.55));
 for(let k=0;k<nc;k++){const v=rnd(k,cx,cz);ib('c',k%2?shade(c,.96):c,cx,(k+.5)*ch,cz,r,ch-.03,r,k*.31);if(v>.86)ib('c',shade(c,1.07),cx,(k+.5)*ch,cz,r*1.004,ch-.03,r*1.004,0)}
 cy(cx,h+.18,cz,r+.16,.36,shade(c,1.05)); // corbel ring under the parapet
 const nm=Math.max(6,Math.round(r*3.2));for(let i=0;i<nm;i++){const a=i/nm*PI*2;bx(cx+Math.sin(a)*(r+.04),h+.36+.34,cz+Math.cos(a)*(r+.04),r*PI*2/nm*.55,.68,.5,shade(c,1.02),a);stud(cx+Math.sin(a)*(r+.04),h+1.04,cz+Math.cos(a)*(r+.04),c)}
 const nw=o.slits===undefined?4:o.slits;for(let j=0;j<nw;j++){const a=(o.sa||0)+j*PI*2/nw,y=h*(.45+.25*(j%2));bx(cx+Math.sin(a)*(r+.02),y,cz+Math.cos(a)*(r+.02),.32,1.1,.14,0x1a2230,a);bx(cx+Math.sin(a)*(r+.02),y,cz+Math.cos(a)*(r+.02),.5,.14,.2,shade(c,1.15),a)}
 if(o.roof){const rc=o.roof,k=7,rh=.62,r0=r+.5;let y=h+.72;ib('c',shade(rc,.9),cx,y+.09,cz,r+.62,.18,r+.62,0);
  for(let i=0;i<k;i++){const ra=lerp(r0,.3,i/k),rb=lerp(r0,.3,(i+1)/k);fr(cx,y+.18+(i+.5)*rh,cz,ra,rb,rh-.02,i%3===2?shade(rc,1.18):rc)}
  y+=.18+k*rh;cy(cx,y+.12,cz,.16,.24,0xffd02f);ball(cx,y+.34,cz,.2,0xffd02f);
  if(o.flag){bx(cx,y+1.2,cz,.07,1.8,.07,0xcfcfcf);bx(cx+.5,y+1.75,cz,.9,.55,.05,o.flag,0,undefined)}}}
// stairs: n steps rising in direction dir (0 +x, 1 -x, 2 +z, 3 -z). (x,z) is the middle of the bottom step's start edge. Every step is a collider the fighter can walk up (sh <= .6)
function stairs(x,z,dir,n,w,c,sh,run){sh=sh||.5;run=run||.9;
 for(let i=0;i<n;i++){const top=(i+1)*sh,d0=i*run,d1=(i+1)*run;let x1,x2,z1,z2;
  if(dir===0){x1=x+d0;x2=x+d1;z1=z-w/2;z2=z+w/2}else if(dir===1){x1=x-d1;x2=x-d0;z1=z-w/2;z2=z+w/2}else if(dir===2){x1=x-w/2;x2=x+w/2;z1=z+d0;z2=z+d1}else{x1=x-w/2;x2=x+w/2;z1=z-d1;z2=z-d0}
  col(x1,x2,z1,z2,top);if(dry)continue;
  bx((x1+x2)/2,top/2,(z1+z2)/2,x2-x1-.03,top,z2-z1-.03,shade(c,i%2?.94:1.02));studs(x1,x2,z1,z2,top,c)}}
// ---------- props
function crate(x,z,s,c,ry){s=s||1.5;col(x-s/2,x+s/2,z-s/2,z+s/2,s);if(dry)return;c=c||0x9b6a3c;const p=s*.07;
 bx(x,s/2,z,s,s,s,c,ry);{const pp=p+.02;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bx(x+a*(s/2+.01-pp/2),s/2,z+b*(s/2+.01-pp/2),pp,s+.02,pp,0x6b4423)}
 for(const e of[-1,1]){bx(x,s/2+e*(s/2-p/2+.01),z,s+.02,p+.02,s+.02,0x7a5230)}
 for(const f of[-1,1]){bx(x,s/2,z+f*(s/2+.005),s*.9,.07,.04,0x7a5230,0);bx(x+f*(s/2+.005),s/2,z,.04,.07,s*.9,0x7a5230,0)}
 studs(x-s/2+.1,x+s/2-.1,z-s/2+.1,z+s/2-.1,s,c)}
function barrel(x,z,c){col(x-.5,x+.5,z-.5,z+.5,1.15);if(dry)return;c=c||0x8a5a2b;cy(x,.57,z,.5,1.12,c);for(const y of[.22,.92])cy(x,y,z,.53,.1,0x3b3b44);cy(x,1.14,z,.46,.05,shade(c,1.15));stud(x,1.2,z,c)}
function lamp(x,z,h,c,o){h=h||3.4;col(x-.12,x+.12,z-.12,z+.12,h);if(dry)return;o=o||{};bx(x,.15,z,.5,.3,.5,0x23252b);cy(x,h/2,z,.09,h,0x23252b);bx(x,h+.25,z,.5,.5,.5,c||0xffd566,0,'eL');bx(x,h+.58,z,.62,.12,.62,0x23252b);glow(x,h+.25,z,o.sz||2.6,c||0xffd566)}
function brazier(x,z,o){o=o||{};col(x-.5,x+.5,z-.5,z+.5,1.2);if(dry)return;cy(x,.45,z,.12,.9,0x23252b);cy(x,.95,z,.55,.2,0x2a2c33);cy(x,1.1,z,.5,.1,0x1a1b20);
 bx(x,1.32,z,.5,.4,.5,0xff7a1a,0,'eF');bx(x,1.62,z,.32,.38,.32,0xffc23a,0,'eF');bx(x,1.88,z,.16,.3,.16,0xfff0a0,0,'eF');glow(x,1.6,z,3.2,0xff9a3a)}
function banner(x,y,z,ry,w,h,c1,c2,o){if(dry)return;o=o||{};const s=Math.sin(ry),cs=Math.cos(ry);
 bx(x,y+h/2+.18,z,.0+Math.abs(cs)*(w+.5)+Math.abs(s)*.14,.14,Math.abs(s)*(w+.5)+Math.abs(cs)*.14,0x6b4423,0); // rod
 const px=x+s*.08,pz=z+cs*.08;bx(px,y-h/2+.15,pz,Math.abs(cs)*w+Math.abs(s)*.06,h,Math.abs(s)*w+Math.abs(cs)*.06,c1,0);
 // pointed bottom: two small wedges as stepped boxes
 for(let i=0;i<3;i++){const ww=w*(1-.3*(i+1)),yy=y-h+.15-(i+.5)*.22;bx(px,yy,pz,Math.abs(cs)*ww+Math.abs(s)*.06,.22,Math.abs(s)*ww+Math.abs(cs)*.06,c1,0)}
 const ex=s*.12,ez=cs*.12;if(o.emb!==false){ // a golden crown / emblem made of studs and bricks
  bx(px+ex*.5,y-h*.4,pz+ez*.5,Math.abs(cs)*w*.5+Math.abs(s)*.05,.18,Math.abs(s)*w*.5+Math.abs(cs)*.05,c2);for(const k of[-1,0,1])bx(px+ex*.5+cs*k*w*.18,y-h*.4+.2,pz+ez*.5-s*k*w*.18,Math.abs(cs)*.14+Math.abs(s)*.05,.22,Math.abs(s)*.14+Math.abs(cs)*.05,c2);
  bx(px+ex*.5,y-h*.62,pz+ez*.5,Math.abs(cs)*w*.3+Math.abs(s)*.05,h*.22,Math.abs(s)*w*.3+Math.abs(cs)*.05,c2)}}
function tree(x,z,s,o){o=o||{};s=s||1;col(x-.4*s,x+.4*s,z-.4*s,z+.4*s,2.6*s);if(dry)return;const c1=o.c1||0x1f8a33,c2=o.c2||0x2e9b3a;bx(x,1.25*s,z,.8*s,2.5*s,.8*s,0x8b5a2b);
 for(let i=0;i<3;i++){bx(x,(2.9+i*1.1)*s,z,(3.1-i*.9)*s,1.15*s,(3.1-i*.9)*s,i%2?c2:c1);studs(x-(3.1-i*.9)*s/2+.4,x+(3.1-i*.9)*s/2-.4,z-(3.1-i*.9)*s/2+.4,z+(3.1-i*.9)*s/2-.4,(2.9+i*1.1)*s+.57*s,i%2?c2:c1,1.2)}}
function tree0(x,z,s,o){ // scenery tree without a collider
 o=o||{};const c1=o.c1||0x1f8a33,c2=o.c2||0x2e9b3a;if(dry)return;bx(x,1.25*s,z,.8*s,2.5*s,.8*s,0x8b5a2b);for(let i=0;i<3;i++)bx(x,(2.9+i*1.1)*s,z,(3.1-i*.9)*s,1.15*s,(3.1-i*.9)*s,i%2?c2:c1)}
function bush(x,z,s,c){if(dry)return;s=s||1;c=c||0x2f9a3c;bx(x,.4*s,z,1.3*s,.8*s,1.3*s,c);bx(x,.95*s,z,.8*s,.5*s,.8*s,shade(c,1.1));stud(x,1.25*s,z,c)}
function bench(x,z,ax,c){const w=ax?2.2:.7,d=ax?.7:2.2;col(x-w/2,x+w/2,z-d/2,z+d/2,.9);if(dry)return;c=c||0x9a6a3a;bx(x,.45,z,w,.1,d,c);bx(x,.12,z,ax?w-.3:.5,.24,ax?.5:d-.3,0x2a2c33);
 if(ax)bx(x,.85,z+(d/2-.05),w,.5,.1,c);else bx(x+(w/2-.05),.85,z,.1,.5,d,c)}
function planter(x,z,w,d,c,o){o=o||{};col(x-w/2,x+w/2,z-d/2,z+d/2,.8);if(dry)return;bx(x,.35,z,w,.7,d,c||0xcfd2d6);bx(x,.78,z,w-.3,.12,d-.3,0x5a3d22);const n=Math.max(2,Math.round(w*d/2.4));
 for(let i=0;i<n;i++){const a=rnd(x,z,i)*.8-.4,b=rnd(z,x,i)*.8-.4;bx(x+a*(w-.8)/.8*.5,1.1,z+b*(d-.8)/.8*.5,.7,.6,.7,o.leaf||0x2f9a3c);}}
function fence(x1,z1,x2,z2,c){const ax=Math.abs(x2-x1)>=Math.abs(z2-z1);c=c||0xa57c45;
 if(ax)wall(Math.min(x1,x2),Math.max(x1,x2),z1-.12,z1+.12,1.1,c,{studs:false});else wall(x1-.12,x1+.12,Math.min(z1,z2),Math.max(z1,z2),1.1,c,{studs:false});
 if(dry)return;const L=ax?Math.abs(x2-x1):Math.abs(z2-z1),n=Math.max(1,Math.floor(L/2));for(let i=0;i<=n;i++){const a=i*L/n;bx(ax?Math.min(x1,x2)+a:x1,.75,ax?z1:Math.min(z1,z2)+a,.3,1.5,.3,0x6b4c25)}}
// a sprite glow around a lamp; fades in at dusk
function glow(x,y,z,s,c){if(dry)return;const sp=new TH.Sprite(new TH.SpriteMaterial({map:glowTex(),color:c,transparent:true,depthWrite:false,blending:TH.AdditiveBlending,opacity:.4,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);sp.renderOrder=6;add(sp);glows.push({sp,kind:'L',base:.55})}
let _gt=null;function glowTex(){if(_gt)return _gt;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return _gt=new TH.CanvasTexture(c)}
// a flat picture (banner art, ticker boards, wall carvings). draw(ctx,w,h) paints a pw x ph canvas.
function sign(x,y,z,ry,w,h,draw,o){if(dry)return;o=o||{};const pw=o.pw||256,ph=Math.max(16,Math.min(1024,Math.pow(2,Math.round(Math.log2(pw*h/w))))),c=document.createElement('canvas');c.width=pw;c.height=ph;h=w*ph/pw;draw(c.getContext('2d'),pw,ph);const t=new TH.CanvasTexture(c);
 const m=o.lit?new TH.MeshBasicMaterial({map:t,transparent:!!o.tr,side:TH.DoubleSide}):new TH.MeshStandardMaterial({map:t,roughness:.5,transparent:!!o.tr,side:TH.DoubleSide});
 const p=new TH.Mesh(new TH.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.y=ry;p.userData.sh=1;add(p);if(o.lit)glows.push({kind:'S',sig:p});return p}
// ---------- water and floor
let waterTex=null;
function wtex(c1,c2){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle=c1;g.fillRect(0,0,128,128);g.fillStyle=c2;
 for(let i=0;i<26;i++){const x=(i*53)%128,y=(i*37)%128,w=10+(i*7)%16;g.globalAlpha=.35;g.fillRect(x,y,w,3);g.fillRect((x+64)%128,(y+40)%128,w*.6,2)}g.globalAlpha=1;
 const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(10,10);return t}
function water(o){if(dry)return;o=o||{};const y=o.y===undefined?-.45:o.y,sz=o.size||64,t=wtex(o.c1||'#2a78c8',o.c2||'#8fd4ff');t.repeat.set(sz/6,sz/6);
 const w=new TH.Mesh(new TH.PlaneGeometry(sz,sz),new TH.MeshStandardMaterial({map:t,color:0xffffff,roughness:.1,metalness:.15,transparent:true,opacity:o.op||.88}));
 w.rotation.x=-PI/2;w.position.set(0,y,0);w.userData.sh=1;w.userData.keep=1;add(w);if(TLS&&!TLS.water)TLS.water={c:o.c1||'#2a78c8'};anim.push((dt,T)=>{t.offset.x=T*.012;t.offset.y=T*.007});
 const bed=new TH.Mesh(new TH.PlaneGeometry(sz*3,sz*3),new TH.MeshStandardMaterial({color:o.bed||0x0e3358,roughness:.9}));bed.rotation.x=-PI/2;bed.position.y=y-.9;bed.userData.sh=1;bed.userData.keep=1;add(bed);return w}
// big ground slab outside the playfield; the frame has a hole of 62 x 62 so water or void inside stays visible
function bank(y,c,o){if(dry)return;o=o||{};if(TLS){if(!TLS.bank)TLS.bank=[y,c,o];return} // (Battle Royale: one ground slab around the whole big world, built at the end)
 const h=o.h||2,hole=o.hole||31,R=o.R||220,m=matFor(c);
 for(const[x,z,w,d]of[[0,-(hole+R)/2,2*R,R-hole],[0,(hole+R)/2,2*R,R-hole],[-(hole+R)/2,0,R-hole,2*hole],[(hole+R)/2,0,R-hole,2*hole]]){const b=new TH.Mesh(new TH.BoxGeometry(w,h,d),m);b.position.set(x,y-h/2,z);b.userData.sh=1;add(b)}}
// the floor: every walkable cell is four 1 m tiles (so seams show), with studs on the tile types that ask for them
function floorTiles(d){const T=d.tiles;for(let j=-15;j<15;j++)for(let i=-15;i<15;i++){const x=i*2+1,z=j*2+1,ch=cellAt(x,z),tp=T[ch];if(!tp)continue;
  for(let a=0;a<2;a++)for(let b=0;b<2;b++){const px=i*2+a+.5,pz=j*2+b+.5,v=rnd(px,pz,7),c0r=(tp.a&&((i+j)&1))?tp.a:tp.c,c0=typeof c0r==='function'?c0r(px,pz):c0r,c=shade(c0,1+(v-.5)*(tp.v===undefined?.1:tp.v));
   ib('b',c,px,-.6,pz,.98,1.2,.98);if(tp.s)stud(px,.07,pz,c)}}}
// ---------- the grid
function cellAt(x,z){const g=gridDef;if(!g)return' ';const i=Math.min(14,Math.max(0,Math.floor(Math.abs(x)/2))),j=Math.min(14,Math.max(0,Math.floor(Math.abs(z)/2)));let ch=g.grid[j][i];if(g.fix)ch=g.fix(x,z,ch)||ch;return ch}
const walkable=(d,ch)=>!!d.tiles[ch];
MAPS.cell=cellAt;
MAPS.walk=(x,z)=>{if(!gridDef)return true;return Math.abs(x)<=30&&Math.abs(z)<=30&&walkable(gridDef,cellAt(x,z))};
// invisible walls on every non-floor cell, merged into as few boxes as possible
function voidBoxes(d){const N=30,u=[];for(let j=0;j<N;j++){u.push([]);for(let i=0;i<N;i++){const ch=cellAt(i*2-29,j*2-29);u[j].push(!walkable(d,ch)&&ch!=='K')}}
 const used=u.map(r=>r.map(()=>false));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(!u[j][i]||used[j][i])continue;let w=1;while(i+w<N&&u[j][i+w]&&!used[j][i+w])w++;let h=1;
  for(;j+h<N;h++){let ok=true;for(let k=0;k<w;k++)if(!u[j+h][i+k]||used[j+h][i+k]){ok=false;break}if(!ok)break}
  for(let a=0;a<h;a++)for(let b=0;b<w;b++)used[j+a][i+b]=true;
  pend.push({x1:i*2-30,x2:(i+w)*2-30,z1:j*2-30,z2:(j+h)*2-30,h:30,nb:1})}}
// ---------- lighting and sky: keyframes along the round clock
const SK={cv:null,tx:null,spr:null,stars:null,last:-1,cfg:null};
const hexc=c=>[c>>16&255,c>>8&255,c&255],css=a=>'rgb('+a.map(v=>Math.round(v)).join(',')+')';
function lc(a,b,t){const x=hexc(a),y=hexc(b);return[lerp(x[0],y[0],t),lerp(x[1],y[1],t),lerp(x[2],y[2],t)]}
const tohex=a=>Math.round(a[0])<<16|Math.round(a[1])<<8|Math.round(a[2]);
function keyAt(keys,t){if(keys.length===1)return keys[0];let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;const a=keys[i],b=keys[i+1],u=Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t||1)));
 const o={};for(const k in a){if(k==='t')continue;const va=a[k],vb=b[k]===undefined?a[k]:b[k];
  if(k==='sp')o[k]=[lerp(va[0],vb[0],u),lerp(va[1],vb[1],u),lerp(va[2],vb[2],u)];
  else if(k==='top'||k==='mid'||k==='bot'||k==='fog'||k==='sun'||k==='hs'||k==='hg'||k==='disc')o[k]=tohex(lc(va,vb,u));
  else o[k]=lerp(va,vb,u)}return o}
function skyInit(){if(!SK.cv){SK.cv=document.createElement('canvas');SK.cv.width=2;SK.cv.height=256;SK.tx=new TH.CanvasTexture(SK.cv)}
 if(!SK.spr){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,255,255,1)');r.addColorStop(.22,'rgba(255,255,255,.55)');r.addColorStop(.6,'rgba(255,255,255,.14)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);
  SK.spr=new TH.Sprite(new TH.SpriteMaterial({map:new TH.CanvasTexture(c),transparent:true,depthWrite:false,fog:false,blending:TH.AdditiveBlending}));SK.spr.renderOrder=-1;SK.spr.visible=false;S.add(SK.spr)}
 if(!SK.stars){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,1024,512);
  for(let i=0;i<420;i++){const x=rnd(i,1)*1024,y=rnd(i,2)*330,s=rnd(i,3)<.12?3:1.6;g.globalAlpha=.5+rnd(i,4)*.5;g.fillStyle=rnd(i,5)<.2?'#ffe9a8':'#ffffff';g.fillRect(x,y,s,s)}
  SK.stars=new TH.Mesh(new TH.SphereGeometry(185,24,12),new TH.MeshBasicMaterial({map:new TH.CanvasTexture(c),transparent:true,opacity:0,depthWrite:false,side:TH.BackSide,fog:false}));SK.stars.visible=false;SK.stars.renderOrder=-2;S.add(SK.stars)}}
function setLight(tn,force){const d=curDef;if(!d||!d.light)return;const k=keyAt(d.light,tn);
 if(Math.abs(tn-SK.last)<.003&&!force&&!d.flick)return;SK.last=tn;
 const g=SK.cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,css(hexc(k.top)));gr.addColorStop(.5,css(hexc(k.mid)));gr.addColorStop(1,css(hexc(k.bot)));g.fillStyle=gr;g.fillRect(0,0,2,256);
 SK.tx.needsUpdate=true;S.background=SK.tx;
 if(S.fog){S.fog.color.setHex(k.fog);S.fog.near=k.fn;S.fog.far=k.ff}
 sun.color.setHex(k.sun);sun.intensity=k.si;sun.position.set(k.sp[0],k.sp[1],k.sp[2]);
 HEMI.color.setHex(k.hs);HEMI.groundColor.setHex(k.hg);HEMI.intensity=k.hi;
 const sd=Math.hypot(k.sp[0],k.sp[1],k.sp[2])||1;
 if(k.disc!==undefined&&!d.indoor){SK.spr.visible=true;SK.spr.material.color.setHex(k.disc);SK.spr.material.opacity=k.dop===undefined?.95:k.dop;SK.spr.position.set(k.sp[0]/sd*160,k.sp[1]/sd*160,k.sp[2]/sd*160);const s=k.dsz||30;SK.spr.scale.set(s,s,1)}else SK.spr.visible=false;
 SK.stars.visible=(k.star||0)>.02;SK.stars.material.opacity=k.star||0;
 SK.lamp=k.lamp===undefined?0:k.lamp;SK.k=k}
function glowTick(T){const lamp=SK.lamp||0;for(const g of glows){let f=1;
  if(g.kind==='L')f=.25+1.35*lamp;else if(g.kind==='F')f=.85+.3*Math.sin(T*13+(g.base*7))+.15*Math.sin(T*29);else if(g.kind==='N')f=.35+1.1*lamp;else if(g.kind==='W')f=.15+1.0*lamp;else if(g.kind==='X')f=SK.flick===undefined?1:SK.flick;
  if(g.m)g.m.emissiveIntensity=g.base*f;else if(g.sp)g.sp.material.opacity=Math.min(.9,g.base*f*(g.kind==='L'?.6:1))}}
// ---------- build / remove
function clearMap(){untile();LAST=[];for(const o of mo)S.remove(o);mo=[];for(const b of P0){const i=boxes.indexOf(b);if(i>=0)boxes.splice(i,1)}P0=[];anim=[];glows=[];INS=null;for(const k in MC)delete MC[k]}
function commit(){for(const b of pend){boxes.push(b);P0.push(b)}pend=[]}
function setTown(on){(window.TOWN?TOWN.o:[]).forEach(o=>o.visible=on);(window.SCEN0?SCEN0.o:[]).forEach(o=>o.visible=on);WORLD0.o.forEach(o=>o.visible=on);
 if(window.TOWN)for(const b of TOWN.b){const i=boxes.indexOf(b);if(on&&i<0)boxes.push(b);if(!on&&i>=0)boxes.splice(i,1)}}
function make(d,isDry){dry=!!isDry;pend=[];INS=new Map();curDef=d;gridDef=d;glows=dry?glows:[];
 if(!dry)anim=[];
 const L={};
 voidBoxes(d);
 if(!dry){floorTiles(d)}
 d.build(L);
 if(d.env&&!dry)d.env(L);
 if(d.decor)d.decor(L); // round 16: the card-art detail pass (visual bricks, torches, banners, statues)
 if(!dry)flush();
 INS=null}

// ---------- Battle Royale world: the chosen map built 3 x 3 times side by side (180 x 180 m), same bricks and props, with passages cut through the seams
const TILE=60;
const OVR=(a,b,c,d,e,f,g,h)=>a<f&&b>e&&c<h&&d>g;
function untile(){if(!TILED)return;const T=TILED;TILED=null;
 for(const o of T.extra){if(o.parent)o.parent.remove(o)}
 if(window.WORLD0)for(const b of WORLD0.b)if(boxes.indexOf(b)<0)boxes.push(b);
 A=30;if(window.STORM&&STORM.size)STORM.size(30);if(window.NAV)NAV.rebuild()}
const T_keep=[];
function carve(T,x1,x2,z1,z2){ // open a passage: no walls, no void in the way, a road plate over whatever was there
 for(const t of T.tiles){
  if(!OVR(x1,x2,z1,z2,t.ox-31,t.ox+31,t.oz-31,t.oz+31))continue;
  const out=[];
  for(const b of t.pend){
   if((b.y0||0)>=2.5||!OVR(b.x1,b.x2,b.z1,b.z2,x1,x2,z1,z2)){out.push(b);continue}
   const cp=(a,c,d,e)=>{if(c-a>.05&&e-d>.05){const n=Object.assign({},b);n.x1=a;n.x2=c;n.z1=d;n.z2=e;out.push(n)}};
   cp(b.x1,Math.min(b.x2,x1),b.z1,b.z2);cp(Math.max(b.x1,x2),b.x2,b.z1,b.z2);
   const m1=Math.max(b.x1,x1),m2=Math.min(b.x2,x2);cp(m1,m2,b.z1,Math.min(b.z2,z1));cp(m1,m2,Math.max(b.z1,z2),b.z2)}
  t.pend=out;
  for(const g of t.INS.values()){const a=g.a,k=[],GH=7; // a gateway is 7 m high; whatever stands higher (a lintel, a roof) stays and bridges it
   const put=(x,y,z,sx,sy,sz,ry)=>{k.push(x,y,z,sx,sy,sz,ry)};
   for(let j=0;j<a.length;j+=7){const x=a[j],y=a[j+1],z=a[j+2],sx=a[j+3],sy=a[j+4],sz=a[j+5],ry=a[j+6];
    if(g.k==='b'&&!ry){ // a box (a long wall slab, a container, a brick...): cut the gateway out of it instead of keeping or dropping it whole
     const hx=Math.abs(sx)/2,hy=Math.abs(sy)/2,hz=Math.abs(sz)/2,bx1=x-hx,bx2=x+hx,by1=y-hy,by2=y+hy,bz1=z-hz,bz2=z+hz;
     if(!(bx1<x2&&bx2>x1&&bz1<z2&&bz2>z1&&by1<GH&&by2>.05)){put(x,y,z,sx,sy,sz,ry);continue}
     const sgx=sx<0?-1:1,sgy=sy<0?-1:1,sgz=sz<0?-1:1,E=.04;
     const piece=(ax,bx,ay,by,az,bz)=>{if(bx-ax>E&&by-ay>E&&bz-az>E)put((ax+bx)/2,(ay+by)/2,(az+bz)/2,(bx-ax)*sgx,(by-ay)*sgy,(bz-az)*sgz,0)};
     const m1=Math.max(bx1,x1),m2=Math.min(bx2,x2);
     piece(bx1,Math.min(bx2,x1),by1,by2,bz1,bz2);piece(Math.max(bx1,x2),bx2,by1,by2,bz1,bz2);
     piece(m1,m2,by1,by2,bz1,Math.min(bz2,z1));piece(m1,m2,by1,by2,Math.max(bz1,z2),bz2);
     if(by2>GH)piece(m1,m2,Math.max(by1,GH),by2,Math.max(bz1,z1),Math.min(bz2,z2));
     continue}
    const big=Math.max(Math.abs(sx),Math.abs(sz))>4.5;
    if(!big&&y<GH+1&&x>x1-.1&&x<x2+.1&&z>z1-.1&&z<z2+.1)continue;
    // a round tower or a big drum that stays standing in the opening: it must stay solid there (the cut above left only the part outside the opening of its collider)
    if(g.k!=='b'&&g.k!=='s'&&g.k!=='o'&&Math.abs(sx)>=1.6&&y-Math.abs(sy)/2<1&&Math.abs(sy)>=3){const r=Math.abs(sx)*.9;if(x+r>x1&&x-r<x2&&z+r>z1&&z-r<z2)T_keep.push({x1:x-r,x2:x+r,z1:z-r,z2:z+r,h:y+Math.abs(sy)/2})}
    put(x,y,z,sx,sy,sz,ry)}
   g.a=k}
  for(const c of T_keep){if(!t.pend.some(b=>b.x1<=c.x1+.01&&b.x2>=c.x2-.01&&b.z1<=c.z1+.01&&b.z2>=c.z2-.01&&b.h>=c.h-.01&&!(b.y0>0)))t.pend.push(c)}
  T_keep.length=0}
 // the road: a brick-coloured plate with studs, a hair above the floor so it never flickers against it
 const cx=(x1+x2)/2,cz=(z1+z2)/2,w=x2-x1,d=z2-z1,E=T.extraINS;
 const put=(k,c,x,y,z,sx,sy,sz)=>{const key=k+'|'+c+'|';let g=E.get(key);if(!g){g={k,c,mt:'',a:[]};E.set(key,g)}g.a.push(x,y,z,sx,sy,sz,0)};
 put('b',0xb9a27a,cx,-.57,cz,w,1.2,d);
 for(let sx=x1+.5;sx<x2;sx+=1)for(let sz=z1+.5;sz<z2;sz+=1)put('s',0xc8b184,sx,.1,sz,1,1,1);
 for(const e of[[x1+.12,cz,.24,d],[x2-.12,cz,.24,d],[cx,z1+.12,w,.24],[cx,z2-.12,w,.24]])put('b',0x8a7653,e[0],.06,e[1],e[2],.3,e[3])}
// a coarse picture of where a fighter can walk in one tile (1 m cells), and which cells belong to the main connected area, so that passages only open where both sides lead somewhere
function tileRaster(t){const W=60,g=new Uint8Array(W*W);
 for(const q of t.pend){if(q.h<.7||(q.y0||0)>=1.2)continue;const i0=Math.max(0,Math.floor(q.x1-t.ox+30)),i1=Math.min(W-1,Math.ceil(q.x2-t.ox+30)-1),j0=Math.max(0,Math.floor(q.z1-t.oz+30)),j1=Math.min(W-1,Math.ceil(q.z2-t.oz+30)-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)g[j*W+i]=1}
 const lab=new Int16Array(W*W),sz=[0];let nl=0;
 for(let k=0;k<W*W;k++){if(g[k]||lab[k])continue;nl++;let n=0;const st=[k];lab[k]=nl;
  while(st.length){const c=st.pop();n++;const x=c%W,y=(c/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||b<0||a>=W||b>=W)continue;const m=b*W+a;if(g[m]||lab[m])continue;lab[m]=nl;st.push(m)}}
  sz[nl]=n}
 let main=1;for(let i=1;i<=nl;i++)if(sz[i]>sz[main])main=i;
 return(x,z)=>{const i=Math.floor(x-t.ox+30),j=Math.floor(z-t.oz+30);return i>=0&&j>=0&&i<W&&j<W&&lab[j*W+i]===main}}
function pickSeams(T,vertical){ // along each seam between two tiles: two corridors (8 m wide) that run on each side until they reach the main walkable area of that tile, where the least stands in the way
 const res=[];
 for(const t of T.tiles)if(!t.walk)t.walk=tileRaster(t);
 for(let a=0;a<T.n;a++)for(let b=0;b<T.n-1;b++){
  const ti=vertical?T.at(b,a):T.at(a,b),tj=vertical?T.at(b+1,a):T.at(a,b+1),line=(vertical?ti.ox:ti.oz)+30,mid=vertical?ti.oz:ti.ox;
  const W=(t,u,c)=>vertical?t.walk(u,c):t.walk(c,u); // u runs across the seam, c along it
  const reach=(t,dir,c)=>{for(let d=1;d<=26;d++){const u=line+dir*d;let n=0;for(let r=-2;r<=2;r++)if(W(t,u,c+r))n++;if(n>=4)return d}return 0};
  const score=c=>{const da=reach(ti,-1,c),db=reach(tj,1,c);if(!da||!db)return[1e9,0,0];
   const A1=Math.max(4,da+2),B1=Math.max(4,db+2),bx1=vertical?line-A1:c-4,bx2=vertical?line+B1:c+4,bz1=vertical?c-4:line-A1,bz2=vertical?c+4:line+B1;let s=0;
   for(const t of[ti,tj])for(const q of t.pend){if((q.y0||0)>=2.5||q.h<.3)continue;
    const ox=Math.min(q.x2,bx2)-Math.max(q.x1,bx1),oz=Math.min(q.z2,bz2)-Math.max(q.z1,bz1);if(ox>0&&oz>0)s+=ox*oz*(q.nb?.7:1.4)}
   return[s+(A1+B1)*3,A1,B1]};
  const cand=[];for(let o=-24;o<=24;o+=4){const[s,A1,B1]=score(mid+o);cand.push([s+Math.abs(o)*.3,mid+o,A1,B1])}cand.sort((p,q)=>p[0]-q[0]);
  const c1=cand[0],c2=cand.find(q=>Math.abs(q[1]-c1[1])>=20&&q[0]<1e8)||(cand[1][0]<1e8?cand[1]:null);
  for(const q of[c1,c2]){if(!q)continue;const c=q[1],A1=q[2]||5,B1=q[3]||5;res.push(vertical?[line-A1,line+B1,c-4,c+4]:[c-4,c+4,line-A1,line+B1])}
  if(c1[0]>=1e8)res.push(vertical?[line-5,line+5,mid-4,mid+4]:[mid-4,mid+4,line-5,line+5])}
 return res}
// Expanded arena: where the 60 x 60 core opens to the new ring. Two gateways on every side of the core, where the least stands in the way (same idea as pickSeams)
function ringGates(t){const out=[];if(!t.walk)t.walk=tileRaster(t);
 for(let side=0;side<4;side++){const vert=side<2,sg=(side===0||side===2)?1:-1,line=sg*30;
  const W=(u,c)=>vert?t.walk(u,c):t.walk(c,u);
  const reach=c=>{for(let d=1;d<=26;d++){const u=line-sg*d;let n=0;for(let r=-2;r<=2;r++)if(W(u,c+r))n++;if(n>=4)return d}return 0};
  const rect=(c,A1)=>{const lo=sg>0?line-A1:line-4,hi=sg>0?line+4:line+A1;return vert?[lo,hi,c-4,c+4]:[c-4,c+4,lo,hi]};
  const score=c=>{const dd=reach(c);if(!dd)return[1e9,0];const A1=Math.max(4,dd+2),q=rect(c,A1);let s=0;
   for(const b of t.pend){if((b.y0||0)>=2.5||b.h<.3)continue;const ox=Math.min(b.x2,q[1])-Math.max(b.x1,q[0]),oz=Math.min(b.z2,q[3])-Math.max(b.z1,q[2]);if(ox>0&&oz>0)s+=ox*oz*(b.nb?.7:1.4)}
   return[s+A1*3,A1]};
  const cand=[];for(let o=-24;o<=24;o+=4){const[s,A1]=score(o);cand.push([s+Math.abs(o)*.3,o,A1])}cand.sort((p,q)=>p[0]-q[0]);
  const c1=cand[0],c2=cand.find(q=>Math.abs(q[1]-c1[1])>=20&&q[0]<1e8)||(cand[1][0]<1e8?cand[1]:null);
  const list=[c1,c2].filter(q=>q&&q[0]<1e8);if(!list.length)list.push([0,0,5]);
  for(const q of list){const c=q[1],A1=q[2]||5,rc=rect(c,A1),far=sg*10;
   // the part outside the core that must stay clear of new props
   const keep=vert?[Math.min(line,line+far)-1,Math.max(line,line+far)+1,c-6,c+6]:[c-6,c+6,Math.min(line,line+far)-1,Math.max(line,line+far)+1];
   out.push({side,c,rect:rc,keep})}}
 return out}
// Expanded arena: which 2 m cells of the ring a fighter can really walk to from the gateways (props can close a pocket), so nobody spawns or drops loot in a sealed corner
function ringReach(T,gates){const N=52,vis=new Uint8Array(N*N),cx=i=>-51+2*i,ci=v=>Math.max(0,Math.min(N-1,Math.floor((v+52)/2)));
 const q=[];for(const g of gates){const vert=g.side<2,sg=(g.side===0||g.side===2)?1:-1,u=sg*33,x=vert?u:g.c,z=vert?g.c:u,i=ci(x),j=ci(z);if(!vis[j*N+i]&&NAV.ok(cx(i),cx(j))){vis[j*N+i]=1;q.push(j*N+i)}}
 while(q.length){const k=q.pop(),i=k%N,j=(k/N)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N||vis[b*N+a])continue;
  if(NAV.ok(cx(a),cx(b))&&NAV.walk(cx(i),cx(j),0,cx(a),cx(b),0)&&NAV.walk(cx(a),cx(b),0,cx(i),cx(j),0)){vis[b*N+a]=1;q.push(b*N+a)}}}
 return(x,z)=>vis[ci(z)*N+ci(x)]===1}
MAPS.applyTiled=(id,n,opt)=>{n=n||3;const d=MAPS.by[id];const R=!!(opt&&opt.ring&&MAPS.ring&&MAPS.ring.has(id));if(R)n=1;
 if(!R&&(id==='town'||!d||!d.grid))return MAPS.applyTiledTown(n);
 const HW=R?MAPS.ring.half:n*TILE/2;
 clearMap();C.far=420;C.updateProjectionMatrix();MAPS.cur=d.id;curDef=d;gridDef=d;setTown(false);skyInit();
 if(window.WORLD0)for(const b of WORLD0.b){const i=boxes.indexOf(b);if(i>=0)boxes.splice(i,1)}
 const h=(n-1)/2,T={n,tiles:[],extra:[],extraINS:new Map(),at:(i,j)=>T.tiles.find(t=>t.i===i&&t.j===j),bank:null,water:null};
 TLS=T;const allGlows=[],allAnim=[],order=[];
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)order.push([i,j]);
 order.sort((a,b)=>(Math.abs(b[0]-h)+Math.abs(b[1]-h))-(Math.abs(a[0]-h)+Math.abs(a[1]-h))); // the middle one is built last, so module-level state (pads, sprites) belongs to it
 try{for(const[i,j]of order){const ox=(i-h)*TILE,oz=(j-h)*TILE,centre=i===h&&j===h;
  dry=false;pend=[];INS=new Map();glows=[];anim=[];const m0=mo.length;
  voidBoxes(d);floorTiles(d);const L={};d.build(L);
  if(d.env){const snap=new Map();for(const[k,g]of INS)snap.set(k,g.a.length);const e0=mo.length;d.env(L);
   // the scenery that lies inside the playable airspace is dropped (it would hang over the fighters); the far-below cloud sea stays
   for(const[k,g]of INS){const from=snap.get(k)||0;if(g.a.length<=from)continue;const env=g.a.splice(from);
    if(centre){for(let q=0;q<env.length;q+=7){const x=env[q],y=env[q+1],z=env[q+2];if(Math.abs(x)<HW+10&&Math.abs(z)<HW+10&&y>-8)continue;for(let r=0;r<7;r++)g.a.push(env[q+r])}}}
   if(!centre)for(let q=mo.length-1;q>=e0;q--){const o=mo[q];if(!o.userData.keep){S.remove(o);mo.splice(q,1)}}}
  if(d.decor)d.decor(L);
  for(const b of pend){b.x1+=ox;b.x2+=ox;b.z1+=oz;b.z2+=oz}
  for(const g of INS.values())for(let q=0;q<g.a.length;q+=7){g.a[q]+=ox;g.a[q+2]+=oz}
  const objs=mo.slice(m0);if(ox||oz)for(const o of objs){o.position.x+=ox;o.position.z+=oz}
  const an=[];for(const f of anim){if(!ox&&!oz){an.push(f);continue}const src=f.toString();
   if(/ENTS|\bE\b|\bP\b/.test(src))an.push((dt,t)=>{const l=ENTS();for(const e of l){e.x-=ox;e.z-=oz}try{f(dt,t)}finally{for(const e of l){e.x+=ox;e.z+=oz}}});
   else if(!/position\.(set|x|z)/.test(src))an.push(f)}
  for(const f of an)allAnim.push(f);for(const g of glows)allGlows.push(g);
  T.tiles.push({i,j,ox,oz,pend,INS,objs,meshes:[]})}}
 finally{TLS=null}
 for(const t of T.tiles)t.walk=tileRaster(t); // (before the passages are cut)
 // passages through every seam
 let gates=null;
 if(R){T.ring=true;gates=T.gates=ringGates(T.tiles[0]);for(const g of gates)carve(T,g.rect[0],g.rect[1],g.rect[2],g.rect[3])}
 else{const seams=pickSeams(T,true).concat(pickSeams(T,false));for(const r of seams)carve(T,r[0],r[1],r[2],r[3])}
 // flush: one set of instanced meshes per tile (so far tiles can be switched off), then the road plates
 dry=false;glows=allGlows;anim=allAnim;pend=[];
 const all=[];
 for(const t of T.tiles){const m1=mo.length;INS=t.INS;flush();t.meshes=mo.slice(m1).concat(t.objs.filter(o=>o.parent));for(const g of LAST)all.push(g);t.pend.forEach(b=>pend.push(b))}
 INS=T.extraINS;{const m1=mo.length;if(R){try{T.info=MAPS.ring.build(T,d,gates)}catch(e){console.error(e)}}flush();for(const o of mo.slice(m1))T.extra.push(o);for(const g of LAST)all.push(g)}INS=null;LAST=all;
 // one ground slab around everything (the maps' own banks would cover the neighbouring tiles)
 if(T.bank){const[y,c,o]=T.bank;const sv=TLS;TLS=null;bank(y,c,Object.assign({},o,{hole:HW+1,R:HW+1+Math.max(120,(o&&o.R)||0)}));TLS=sv}
 const E4=HW; // the edge of the world: four tall invisible walls, so nobody leaves it (bullets still fly over)
 pend.push({x1:-E4-1,x2:E4+1,z1:-E4-1,z2:-E4,h:30,nb:1},{x1:-E4-1,x2:E4+1,z1:E4,z2:E4+1,h:30,nb:1},{x1:-E4-1,x2:-E4,z1:-E4,z2:E4,h:30,nb:1},{x1:E4,x2:E4+1,z1:-E4,z2:E4,h:30,nb:1});
 commit();A=E4;TILED=T;T.size=E4;T.bg=T.water?T.water.c:null;
 window.SKY0=1;SK.last=-1;SK.flick=1;setLight(0,true);
 if(window.STORM&&STORM.size)STORM.size(A);if(window.NAV)NAV.rebuild();
 if(R&&window.NAV&&NAV.walk){try{T.reach=ringReach(T,gates)}catch(e){console.error(e)}}
 MAPS.cull(0,0,true);
 return d};
// the town, three by three: the houses and the baseplate are copied (same pieces, no walls between the copies)
MAPS.applyTiledTown=n=>{n=n||3;MAPS.apply('town');setTown(true);
 const h=(n-1)/2,T={n,tiles:[],extra:[],extraINS:new Map(),at:(i,j)=>T.tiles.find(t=>t.i===i&&t.j===j),bank:null,water:null,town:true};
 if(window.WORLD0)for(const b of WORLD0.b){const i=boxes.indexOf(b);if(i>=0)boxes.splice(i,1)}
 // the baseplate objects are the first two (green plate and its studs); the four wall bricks after them stay hidden
 if(window.WORLD0)WORLD0.o.forEach((o,k)=>{if(k>=2)o.visible=false});
 const src=[].concat(window.TOWN?TOWN.o:[],window.WORLD0?WORLD0.o.slice(0,2):[]);
 if(window.SCEN0)SCEN0.o.forEach(o=>{const big=o.geometry&&o.geometry.parameters&&o.geometry.parameters.width>=400;o.visible=!!big});
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const ox=(i-h)*TILE,oz=(j-h)*TILE,centre=i===h&&j===h,objs=[];
  if(centre){for(const o of src)objs.push(o)}
  else{for(const o of src){const c=o.clone();c.position.x+=ox;c.position.z+=oz;c.visible=true;S.add(c);T.extra.push(c);objs.push(c)}
   if(window.TOWN)for(const b of TOWN.b){const c=Object.assign({},b);c.x1+=ox;c.x2+=ox;c.z1+=oz;c.z2+=oz;boxes.push(c);P0.push(c)}}
  T.tiles.push({i,j,ox,oz,pend:[],INS:new Map(),objs,meshes:objs})}
 const E4=n*TILE/2,w=[{x1:-E4-1,x2:E4+1,z1:-E4-1,z2:-E4,h:30,nb:1},{x1:-E4-1,x2:E4+1,z1:E4,z2:E4+1,h:30,nb:1},{x1:-E4-1,x2:-E4,z1:-E4,z2:E4,h:30,nb:1},{x1:E4,x2:E4+1,z1:-E4,z2:E4,h:30,nb:1}];
 for(const b of w){boxes.push(b);P0.push(b)}
 LAST=[];A=E4;TILED=T;T.size=E4;T.bg=null;C.far=420;C.updateProjectionMatrix();
 if(window.STORM&&STORM.size)STORM.size(A);if(window.NAV)NAV.rebuild();MAPS.cull(0,0,true);return MAPS.by.town};
// switch off the tiles that are far away (not drawn at all) and the shadows of tiles beyond the shadow camera
MAPS.cull=(x,z,force)=>{const T=TILED;if(!T)return;const far=(S.fog?Math.min(S.fog.far,260):200)+25;
 for(const t of T.tiles){const dx=Math.max(Math.abs(x-t.ox)-30,0),dz=Math.max(Math.abs(z-t.oz)-30,0),dist=Math.hypot(dx,dz),vis=dist<far,sh=dist<62;
  if(!force&&t.vis===vis&&t.sh===sh)continue;t.vis=vis;t.sh=sh;
  for(const o of t.meshes){o.visible=vis;if(o.isMesh){const u=o.userData;if(u.cs===undefined){u.cs=u.sh?!!o.castShadow:true;if(!u.sh){u.sh=1;o.receiveShadow=o.parent===S}}o.castShadow=u.cs&&sh}}}};
MAPS.tiled=()=>TILED;
MAPS.gates=()=>TILED&&TILED.gates||[];
MAPS.worldObjs=()=>TILED?[].concat(...TILED.tiles.map(t=>t.objs||[])):[];
MAPS.mainWalk=(x,z)=>{const T=TILED;if(!T)return true;if(T.ring&&(Math.abs(x)>30||Math.abs(z)>30))return Math.abs(x)<=T.size&&Math.abs(z)<=T.size&&(!T.reach||T.reach(x,z));for(const t of T.tiles)if(Math.abs(x-t.ox)<=30&&Math.abs(z-t.oz)<=30)return t.walk?t.walk(x,z):true;return false}; // inside the main connected area of its tile
MAPS.world=()=>TILED?{n:TILED.n,half:TILED.size,bg:TILED.bg,town:!!TILED.town,ring:!!TILED.ring,info:TILED.info||null}:null;
MAPS.reg=d=>{MAPS.list.push(d);MAPS.by[d.id]=d;return d};
MAPS.reg({id:'town',hide:true,name:'Brick Town',tag:'The original arena',theme:'Sunny brick village',blurb:'Houses, fences and crates in the open: the classic arena.',grid:null,tiles:{}});
MAPS.apply=id=>{const d=MAPS.by[id]||MAPS.by.town;clearMap();C.far=d.id==='town'?200:420;C.updateProjectionMatrix();MAPS.cur=d.id;gridDef=null;curDef=d;
 const town=d.id==='town';setTown(town);
 if(town){restoreTown()}else{skyInit();gridDef=d;make(d,false);commit();window.SKY0=1;SK.last=-1;SK.flick=1;setLight(0,true)}
 if(window.NAV)NAV.rebuild();return d};
function restoreTown(){const g=window.GFX0;if(!g)return;skyInit();SK.spr.visible=false;SK.stars.visible=false;S.background=g.bg;S.fog=g.fog;sun.color.setHex(0xffffff);sun.intensity=g.sunI;sun.position.copy(g.sunP);HEMI.color.setHex(0xffffff);HEMI.groundColor.setHex(0x6a8a5a);HEMI.intensity=g.hemiI;curDef=MAPS.by.town}
// a map built only to be drawn as a small picture (and for the tests): returns the colliders it would add
MAPS.dryBoxes=id=>{const d=MAPS.by[id];if(!d||!d.grid)return[];const sv=[gridDef,curDef];gridDef=d;make(d,true);const r=pend;pend=[];gridDef=sv[0];curDef=sv[1];dry=false;return r};
MAPS.light=setLight;
MAPS.instances=()=>LAST; // every brick instance of the current map: {k: shape, c: colour, mt: material tag, a: [x,y,z,sx,sy,sz,ry, ...]} (for the tests)
MAPS.lightKey=()=>SK.k;
// per frame: animations and the day-to-dusk clock
const _step=step;step=function(dt){_step(dt);if(MAPS.cur==='town'||!curDef||!curDef.light)return;
 const T0=window.STORM?STORM.time():0,tn=Math.max(0,Math.min(1,T0/(window.BRX?300:150))); // (a Battle Royale match is longer, so the day lasts longer)
 if(curDef.flick){const f=curDef.flick(T,dt,SK);SK.flick=f}
 setLight(tn);if(curDef.flick){const hm=SK.hm===undefined?1:SK.hm,fl=SK.flash||0;HEMI.intensity=HEMI.intensity*hm+fl;sun.intensity=sun.intensity*(.4+.6*hm)+fl*.7}
 glowTick(T);for(const a of anim)a(dt,T)};
// choose
// Brick Town and Spookstone Keep are not offered any more (hide:true); Battle Royale, Duos, Trios and Solo draw from the maps that have an expanded version
MAPS.resolve=seed=>{if(MAPS.force&&MAPS.by[MAPS.force])return MAPS.force;const br=!!window.BRPEND&&!!MAPS.ring;
 const ids=MAPS.list.filter(m=>m.grid&&!m.hide&&!m.tour&&(!br||MAPS.ring.has(m.id))).map(m=>m.id);if(!ids.length)ids.push('town');
 const p=MAPS.by[MAPS.pickId];if(MAPS.pickId==='random'||!p||p.tour||(br&&!ids.includes(p.id)))return ids[((seed|0)>>>0)%ids.length];return MAPS.pickId};
MAPS.set=id=>{MAPS.pickId=id;try{localStorage.setItem('bb_map',id)}catch(e){}};
try{const s=localStorage.getItem('bb_map');if(s)MAPS.pickId=s}catch(e){}
// the Fight button builds the arena first
const _go=$('go').onclick;
$('go').onclick=function(){let id;if(window.NET&&(NET.on||NET.starting)&&NET.map)id=NET.map;else id=MAPS.resolve(Math.floor(Math.random()*1e9));
 if(MAPS.cur!==id||TILED||(MAPS.cur!=='town'&&window.MAPDBG))MAPS.apply(id);return _go.apply(this,arguments)};

// a window: white frame, glass that is dark by day and lights up at dusk. ax: the window faces +-z (spans x), otherwise it faces +-x
function win(x,y,z,ax,w,h,glass,frame){if(dry)return;w=w||1.1;h=h||1.4;glass=glass===undefined?0xffd27a:glass;frame=frame||0xf2f2f2;
 const v=(sl,sh,st,dx,dy,c,mt)=>ax?bx(x+dx,y+dy,z,sl,sh,st,c,0,mt):bx(x,y+dy,z+dx,st,sh,sl,c,0,mt);
 v(w,h,.1,0,0,glass,'eW');v(w+.3,.12,.18,0,h/2+.04,frame);v(w+.3,.12,.18,0,-h/2-.04,frame);v(.1,h+.2,.18,-w/2-.04,0,frame);v(.1,h+.2,.18,w/2+.04,0,frame);v(.06,h,.16,0,0,frame);v(w,.06,.16,0,.05,frame)}
// a wooden double door with a stone frame; (x,z) is the centre of the door on the wall face, ax like win()
function door(x,z,ax,w,h,c,frame){if(dry)return;w=w||2.4;h=h||3;c=c||0x6b4423;frame=frame||0xd8d2c4;const v=(sl,sh,st,dx,dy,cc,mt)=>ax?bx(x+dx,dy,z,sl,sh,st,cc,0,mt):bx(x,dy,z+dx,st,sh,sl,cc,0,mt);
 v(w,h,.16,0,h/2,c);v(.1,h,.2,0,h/2,0x2a1a10);for(const k of[-1,1])v(w*.4,.12,.22,k*w*.25,h*.5,shade(c,1.2));v(w+.5,.4,.3,0,h+.2,frame);v(.4,h+.3,.3,-w/2-.2,h/2,frame);v(.4,h+.3,.3,w/2+.2,h/2,frame);
 v(.2,.2,.24,w*.12,h*.45,0xffc828)}
// a stepped brick roof (gable): ridge along x when ax; k layers .5 high, each narrower. y is the wall top
function gable(cx,cz,w,d,y,c,ax,ov){if(dry)return;ov=ov===undefined?.4:ov;const hw=(ax?d:w)/2+ov,k=Math.max(3,Math.round(hw/.9)),s=hw/k,L=(ax?w:d)+2*ov;
 for(let j=0;j<k;j++){const half=hw-j*s,yy=y+j*.5+.25,cc=shade(c,j%2?.96:1.03);if(ax)bx(cx,yy,cz,L,.5,half*2,cc);else bx(cx,yy,cz,half*2,.5,L,cc)}
 const top=y+k*.5;if(ax)bx(cx,top+.12,cz,L,.24,.5,shade(c,1.12));else bx(cx,top+.12,cz,.5,.24,L,shade(c,1.12));
 for(let i=0;i<Math.floor(L);i++){const a=-L/2+.5+i;ax?stud(cx+a,top+.31,cz,c):stud(cx,top+.31,cz+a,c)}return top}
// glass panel (see-through) and a glowing panel
const glass=(x,y,z,w,h,d,c)=>bx(x,y,z,w,h,d,c||0x7fc8e8,0,'t45');

// a low stone lip on every edge where floor meets water / void, so the edges read as built quays and not as cut-off tiles
function curbs(c,o){if(dry)return;o=o||{};const h=o.h||.22,t=o.t||.34,N=30;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i*2-29,z=j*2-29,ch=cellAt(x,z);if(!walkable(curDef,ch))continue;
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx*2,nz=z+dz*2;if(Math.abs(nx)>30||Math.abs(nz)>30)continue;const n=cellAt(nx,nz);if(walkable(curDef,n)||n==='K')continue;
   const cc=shade(typeof c==='function'?c(ch):c,1+(rnd(x,z,dx+dz*3)-.5)*.1);bx(x+dx*(1-t/2),h/2,z+dz*(1-t/2),dx?t:2,h,dz?t:2,cc);stud(x+dx*(1-t/2),h+.07,z+dz*(1-t/2)-dz*.5,cc);stud(x+dx*(1-t/2),h+.07,z+dz*(1-t/2)+dz*.5,cc);
   if(dx)stud(x+dx*(1-t/2),h+.07,z,cc);else stud(x,h+.07,z+dz*(1-t/2),cc)}}}
// a low visual railing (posts and two bars), no collider
function rail(x1,z1,x2,z2,c,h,y0){if(dry)return;c=c||0xf2f2f2;h=h||1;y0=y0||0;const L=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.round(L/1.6)),ax=Math.abs(x2-x1)>=Math.abs(z2-z1);
 for(let i=0;i<=n;i++){const t=i/n;bx(lerp(x1,x2,t),y0+h/2,lerp(z1,z2,t),.18,h,.18,c)}
 for(const y of[h*.55,h]){bx((x1+x2)/2,y0+y,(z1+z2)/2,ax?L:.12,.12,ax?.12:L,shade(c,.92))}}
// puffy brick clouds around the horizon
function clouds(n,y0,r0,r1,c,seed){if(dry)return;c=c||0xffffff;for(let i=0;i<n;i++){const a=rnd(i,seed||1,3)*PI*2,r=lerp(r0,r1,rnd(i,seed||1,4)),x=Math.cos(a)*r,z=Math.sin(a)*r,y=y0+rnd(i,seed||1,5)*14,w=10+rnd(i,seed||1,6)*14;
  bx(x,y,z,w,3,w*.5,c);bx(x+w*.1,y+2.2,z,w*.6,2.4,w*.4,shade(c,1.02));bx(x-w*.2,y+1.2,z+w*.12,w*.5,2,w*.4,shade(c,.97));
  for(let k=0;k<4;k++)stud(x-w*.3+k*w*.2,y+1.6,z,c)}}
// ---------- the kit the map files use
MAPS.lib={ib,curbs,rail,clouds,win,door,gable,glass,TH,shade,mixc,rnd,lerp,bx,cy,fr,ball,stud,studs,col,wall,cren,plain,rtower,stairs,crate,barrel,lamp,brazier,banner,tree,tree0,bush,bench,planter,fence,glow,sign,water,bank,add,anim:f=>{if(!dry)anim.push(f)},glows:()=>glows,
 cellAt,isDry:()=>dry,glowMat:(c,k)=>matFor(c,'e'+k),BH,BL,rowPlain:plain};
})();
