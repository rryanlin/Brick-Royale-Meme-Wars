/* Expanded arenas (round 30): Battle Royale, Duos, Trios and Solo are played on the "3x expanded" version of a map.
   The original 60 x 60 m arena stays exactly as it was in the middle (the "core"); around it a 22 m ring of four new regions is built, so the whole
   world is 104 x 104 m = 3 x the area (1.73 x the width and depth). The regions are named after the Map Expansion Specs sheet (north, east, south, west),
   take their colours and style from it, and are joined to the core by eight carved gateways (two on every side). Spawn markers on the sheet are ignored:
   the player still chooses where to drop in (js/brmap.js) and everybody else lands at random.
   MAPS.ring.build(T,d,gates) is called by MAPS.applyTiled (js/maplib.js) while the world is made; it uses the same brick helpers as the maps. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,wall,rtower,stairs,crate,barrel,lamp,tree,bench,planter,gable,win,sign,add,shade,mixc,rnd,TH}=LB;
const H=52,C=30,TOP=2.4;
const SPEC={
pond:{st:'swamp',ac:0x74deab,tr:0x32594d,bd:0x977f56,wt:0x166f8d,bg:0x21433f,core:"Frog Shrine",nm:["North Marsh", "Sunken Boardwalk", "South Stilt Village", "West Reed Maze"],intro:"A wider swamp with flanking boardwalk loops and four stilt villages."},
docks:{st:'docks',ac:0xefc37a,tr:0x6a7779,bd:0xbd9160,wt:0x145b81,bg:0x23435c,core:"Doge Statue",nm:["Lighthouse Quay", "Freight Yard", "Fish Market", "Crane Terminal"],intro:"New docks and warehouses surround the original harbor plaza."},
trolls:{st:'ruins',ac:0xd3c29a,tr:0x535e58,bd:0xafa68a,wt:0x125a7f,bg:0x353d45,core:"Toll Bridge",nm:["North Gate", "Flooded Pass", "South Court", "Cliffside Tunnels"],intro:"Two outer ruin districts break up the old central bridge fight."},
nyan:{st:'sky',ac:0xf9a8d4,tr:0x6d6fbb,bd:0xe9deda,wt:0x4773c3,bg:0x253c7a,core:"Sky Castle",nm:["Cloud Gardens", "Pixel Arcade", "Star Landing", "Rainbow Spine"],intro:"Four additional islands create safe side routes around the sky castle."},
stonks:{st:'city',ac:0x6ee9a3,tr:0x344e57,bd:0x7298a9,wt:0x236987,bg:0x1c3c46,core:"Exchange",nm:["Bull Market", "Parking Deck", "Broker Block", "Rooftop Exchange"],intro:"A three-block financial district with stronger ground-to-roof loops."},
backbrick:{st:'maze',ac:0xe2c46d,tr:0x776f51,bd:0xd4ba69,wt:0x617668,bg:0x3a352b,core:"Atrium",nm:["North Office", "Archive Corridor", "Maintenance Wing", "South Storage"],intro:"A larger office labyrinth with multiple short connecting routes."},
pork:{st:'portal',ac:0xf38fd8,tr:0x4f4372,bd:0x9a8cb1,wt:0x5d7abb,bg:0x32294d,core:"Main Portal",nm:["Pork Hq", "Neon Market", "Transit Roof", "Service Tunnels"],intro:"A larger cyber plaza with two side districts and portal shortcuts."},
worksite:{st:'build',ac:0xf4bd64,tr:0x59626a,bd:0xcf9f64,wt:0x37576d,bg:0x3c444c,core:"Crane Yard",nm:["North Build", "Scaffold Row", "South Office", "Concrete Depot"],intro:"Two new half-built structures link the existing crane courtyard."},
castle:{st:'castle',ac:0xeac78d,tr:0x646a64,bd:0xc1b39b,wt:0x1f6587,bg:0x42424a,core:"Throne Court",nm:["North Bailey", "East Armory", "South Gardens", "West Stables"],intro:"Expanded bailey walls form a complete medieval fortress beyond the courtyard."},
colosseum:{st:'stadium',ac:0xfdc86a,tr:0x685765,bd:0xb3a491,wt:0x315f85,bg:0x414055,core:"Final Ring",nm:["North Concourse", "Fighter Tunnels", "South Concourse", "Vip Balconies"],intro:"A true tournament stadium with extended concourses and broadcast lanes."},
rift:{st:'rift',ac:0xbda2fc,tr:0x514886,bd:0xa8a6d2,wt:0x6a53cc,bg:0x302a61,core:"Rift Bridge",nm:["West Stronghold", "North Sky Deck", "East Stronghold", "South Sky Deck"],intro:"Three linked islands per side, keeping the main rift bridge contested."}};
// per style: the big pieces (sk), small cover (sm), landmark (tl), what the pond is (pk) and which layout every region gets (tpl: 0 yard, 1 lanes, 2 plaza with water or a gap, 3 blocks)
const STY={
 swamp:{sk:'hut',sm:['reeds','crates','reeds'],tl:'tree',pk:'water',roof:0x2f7a3c,tpl:[3,2,0,1]},
 docks:{sk:'container',sm:['crates','crates','barrier'],tl:'lighthouse',pk:'water',tpl:[1,2,3,1]},
 ruins:{sk:'stone',sm:['rubble','rubble','crates'],tl:'ruin',pk:'water',tpl:[0,2,3,1]},
 sky:{sk:'cloud',sm:['toy','toy','crates'],tl:'toytower',pk:'void',tpl:[3,2,0,2]},
 city:{sk:'block',sm:['planter','seat','neon'],tl:'pylon',pk:null,tpl:[3,1,0,3]},
 maze:{sk:'office',sm:['cabinet','cabinet','crates'],tl:'pylon',pk:null,tpl:[1,1,3,1]},
 portal:{sk:'block',sm:['neon','neon','crates'],tl:'pylon',pk:null,neon:1,tpl:[3,0,1,3]},
 build:{sk:'concrete',sm:['barrier','crates','barrier'],tl:'crane',pk:null,tpl:[0,1,3,1]},
 castle:{sk:'stone',sm:['hay','crates','barrel'],tl:'castle',pk:'water',cren:1,tpl:[3,0,2,0]},
 stadium:{sk:'stand',sm:['barrier','crates','seat'],tl:'flood',pk:null,tpl:[1,3,1,3]},
 rift:{sk:'crystal',sm:['rune','rune','crates'],tl:'spire',pk:'void',neon:1,tpl:[3,2,1,2]}};
const SIDES=['N','E','S','W'];
function sideOrder(nm){ // each new region goes to the side its name asks for (North, East, ...); the rest fill the free sides in order
 const o={},left=[];for(const n of nm){const u=n.toUpperCase();const k=SIDES.find(s=>new RegExp('\\b'+({N:'NORTH',E:'EAST',S:'SOUTH',W:'WEST'})[s]+'\\b').test(u));if(k&&!o[k])o[k]=n;else left.push(n)}
 for(const s of SIDES)if(!o[s])o[s]=left.shift();return o}
function frame(side){const vv={N:[0,-1],S:[0,1],W:[-1,0],E:[1,0]}[side];
 return{side,vv,len:side==='N'||side==='S'?H:C,
  r:(u1,u2,v1,v2)=>side==='N'?[u1,u2,-(C+v2),-(C+v1)]:side==='S'?[u1,u2,C+v1,C+v2]:side==='W'?[-(C+v2),-(C+v1),u1,u2]:[C+v1,C+v2,u1,u2],
  p:(u,v)=>side==='N'?[u,-(C+v)]:side==='S'?[u,C+v]:side==='W'?[-(C+v),u]:[C+v,u],
  // a local piece of size lu (along the region) x lv (across it), centred on (u,v) -> world rectangle
  c:(u,v,lu,lv)=>{const q=side==='N'||side==='S'?[u,v,lu,lv]:[u,v,lu,lv];return side==='N'?[u-lu/2,u+lu/2,-(C+v+lv/2),-(C+v-lv/2)]:side==='S'?[u-lu/2,u+lu/2,C+v-lv/2,C+v+lv/2]:side==='W'?[-(C+v+lv/2),-(C+v-lv/2),u-lu/2,u+lu/2]:[C+v-lv/2,C+v+lv/2,u-lu/2,u+lu/2]}}}
const GL=0xffd27a,PAL=[0xc0392b,0x2e6fb5,0xe0a020,0x2f8f5a,0x7a7f86,0x8e4fb5],RB=[0xff5d5d,0xffa24a,0xffe45a,0x6be07a,0x5ab6ff,0x9a7bff,0xff8ae0];
function build(T,d,gates){
 const S0=SPEC[d.id];if(!S0)return null;const S=Object.assign({},STY[S0.st],S0);const seed=(d.id.charCodeAt(0)*31+d.id.length*7)%97+1;
 const occ=[],keep=[];
 for(const g of gates||[])keep.push(g.keep);
 const ovl=(a,b,p)=>a[0]<b[1]+p&&a[1]>b[0]-p&&a[2]<b[3]+p&&a[3]>b[2]-p;
 const free=(r,p)=>{p=p===undefined?1.1:p;
  if(r[0]<-H+TOP+.2||r[1]>H-TOP-.2||r[2]<-H+TOP+.2||r[3]>H-TOP-.2)return false;
  if(ovl(r,[-C-1.5,C+1.5,-C-1.5,C+1.5],0))return false;
  for(const k of keep)if(ovl(r,k,0))return false;
  for(const o of occ)if(ovl(r,o,p))return false;return true};
 const use=r=>{occ.push(r)};
 const pools=[]; // holes in the floor (water or gaps)
 const names=sideOrder(S.nm);
 // ---------------------------------------------------------------- pieces
 const wallR=(r,h,c,o)=>wall(r[0],r[1],r[2],r[3],h,c,o);
 const SOL={
  hut(r,rg){const h=3;wallR(r,h,S.bd,{studs:false});const ax=(r[1]-r[0])>=(r[3]-r[2]);gable((r[0]+r[1])/2,(r[2]+r[3])/2,r[1]-r[0],r[3]-r[2],h,S.roof||shade(S.ac,.7),ax);return h+1.5},
  container(r,rg){const ax=(r[1]-r[0])>=(r[3]-r[2]),n=2,L=ax?r[3]-r[2]:r[1]-r[0],w=(L-.6)/n;
   for(let i=0;i<n;i++){const a=(ax?r[2]:r[0])+i*(w+.6),c=PAL[Math.floor(rnd(seed,r[0]+i,r[2])*PAL.length)],q=ax?[r[0],r[1],a,a+w]:[a,a+w,r[2],r[3]];
    wallR(q,2.5,c,{studs:false,band:[2,shade(c,.7)]});if(rnd(seed,q[0],q[2])>.55){wallR(q,2.5,PAL[(i+2)%PAL.length],{studs:false,y0:2.5})}}return 5},
  stone(r,rg){const h=4.2;wallR(r,h,S.bd,{studs:true,cren:!!S.cren});return h},
  cloud(r,rg){const h=3.2;wallR(r,h,0xf2f5ff,{studs:true});const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;ball(cx-1.2,h+.6,cz,1.2,0xffffff);ball(cx+1,h+.5,cz+.4,1,0xf6f8ff);return h},
  block(r,rg){const h=6+Math.floor(rnd(seed,r[0],r[2])*3)*2.2;wallR(r,h,S.bd,{studs:false});const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2,w=r[1]-r[0],dd=r[3]-r[2];
   for(let y=1.6;y<h-.8;y+=2.2){for(const s of[-1,1]){for(let k=-1;k<=1;k++){win(cx+k*w*.28,y,cz+s*(dd/2+.02),true,1.2,1.1,S.neon?S.ac:GL);win(cx+s*(w/2+.02),y,cz+k*dd*.28,false,1.2,1.1,S.neon?S.ac:GL)}}}
   bx(cx,h+.12,cz,w+.3,.24,dd+.3,S.ac,0,S.neon?'eN':undefined);return h},
  office(r,rg){const h=3;wallR(r,h,S.bd,{studs:false,band:[3,shade(S.bd,.75)]});bx((r[0]+r[1])/2,h+.1,(r[2]+r[3])/2,r[1]-r[0]-.3,.2,r[3]-r[2]-.3,shade(S.bd,1.12));return h},
  concrete(r,rg){const h=4;wallR(r,h,0x8c9096,{studs:false});const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bx(cx+a*(r[1]-r[0])/2*.8,h+.9,cz+b*(r[3]-r[2])/2*.8,.12,1.8,.12,0xb05a2a);return h},
  stand(r,rg){const w=r[1]-r[0],dd=r[3]-r[2],ax=w>=dd,n=3;for(let i=0;i<n;i++){const k=i/n,q=ax?[r[0],r[1],r[2]+dd*k*.5,r[3]]:[r[0]+w*k*.5,r[1],r[2],r[3]];wallR(q,1.2*(i+1),shade(S.bd,1-i*.08),{studs:true,y0:0})}return 3.6},
  crystal(r,rg){const h=3;wallR(r,h,0x4b3d8f,{studs:true});const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;fr(cx,h+1.6,cz,1.3,.15,3.2,0xa88cff,'eN');return h+3}};
 const SMALL={
  crates(x,z){crate(x-.9,z,1.7,0x9b6a3c);crate(x+.9,z+.5,1.4,0x8a5a2b);barrel(x-.2,z+1.4)},
  reeds(x,z){wall(x-.6,x+.6,z-.6,z+.6,1.9,0x3f8a3a,{studs:false});bx(x,2.1,z,1.4,.5,1.4,0x57a84a)},
  rubble(x,z){wall(x-1.2,x+1,z-.7,z+.8,1,S.bd,{studs:true});wall(x+.2,x+1.4,z-1.4,z-.4,.6,shade(S.bd,.85),{studs:false})},
  toy(x,z){const c=RB[Math.floor(rnd(seed,x,z)*RB.length)];wall(x-.8,x+.8,z-.8,z+.8,1.6,c,{studs:true});ball(x,2.05,z,.35,0xffe45a,'gE')},
  planter(x,z){planter(x,z,2.6,1.2,0xcfd2d6);bench(x,z+1.7,true)},
  seat(x,z){bench(x,z,true);bench(x,z+2.2,true)},
  cabinet(x,z){wall(x-.6,x+.6,z-.5,z+.5,1.5,0x8b8f94,{studs:false});bx(x,1.62,z,1.1,.14,.9,0x6c7076);for(const y of[.4,.9,1.3])bx(x,y,z+.51,1,.05,.02,0x4a4d52)},
  neon(x,z){wall(x-.8,x+.8,z-.8,z+.8,1.4,0x2a2540,{studs:false});bx(x,1.45,z,1.5,.08,1.5,S.ac,0,'eN')},
  barrier(x,z){wall(x-1.3,x+1.3,z-.25,z+.25,1,0xe5e5e5,{studs:false,band:[1,0xd9382a]});wall(x-.4,x+.4,z+1,z+1.8,.9,0xff7a1a,{studs:false})},
  hay(x,z){wall(x-.8,x+.8,z-.8,z+.8,1.3,0xd8b85a,{studs:true});barrel(x+1.5,z)},
  barrel(x,z){barrel(x,z);barrel(x+1.2,z+.3);barrel(x+.5,z-1.1)},
  rune(x,z){wall(x-.7,x+.7,z-.7,z+.7,1.5,0x514886,{studs:true});bx(x,1.65,z,.9,.1,.9,S.ac,0,'eN')}};
 const TALL={
  tree(x,z){tree(x,z,1.8,{c1:0x2c7a3a,c2:0x3d9a45})},
  lighthouse(x,z){rtower(x,z,2.2,10,0xf2f2f2,{roof:0xd9382a});bx(x,10.8,z,1.2,.8,1.2,0xffe27a,0,'eL')},
  ruin(x,z){wall(x-1,x+1,z-1,z+1,5.5,S.bd,{studs:false});wall(x-1.5,x-.5,z+1,z+2.4,3,shade(S.bd,.9),{studs:false})},
  toytower(x,z){rtower(x,z,2.2,7,0xff9ad9,{roof:0x5ab6ff,flag:0xffe45a})},
  pylon(x,z){wall(x-.8,x+.8,z-.8,z+.8,8,0x24243a,{studs:false});for(const y of[2,4.5,7])bx(x,y,z,1.8,.14,1.8,S.ac,0,'eN')},
  crane(x,z){wall(x-3.6,x-2.8,z-.4,z+.4,9,0xf0b020,{studs:false});wall(x+2.8,x+3.6,z-.4,z+.4,9,0xf0b020,{studs:false});bx(x,9.4,z,9.2,.7,.8,0xf0b020);bx(x+3.6,8.2,z,.1,2.2,.1,0x3a3a3a);bx(x-4,9.4,z,1.6,.9,1,0x555a60)},
  castle(x,z){rtower(x,z,2.4,8,S.bd,{roof:0x3a5fa0,flag:0xd9382a})},
  flood(x,z){lamp(x,z,9,0xfff2c0,{sz:7})},
  spire(x,z){wall(x-1,x+1,z-1,z+1,2,0x3a2f78,{studs:true});fr(x,5,z,1.3,.1,6,0xa88cff,'eN')}};
 const pieces={
  house(f,u,v,s){const r=f.c(u,v,8,6);if(!free(r))return false;use(r);const[x1,x2,z1,z2]=r,t=.8,ax=(x2-x1)>=(z2-z1),h=2.8,g=1.4,cx=(x1+x2)/2,cz=(z1+z2)/2;
   const seg=(a,b,c,d)=>{if(b-a>.3&&d-c>.3)wall(a,b,c,d,h,S.bd,{studs:false,cren:!!S.cren})};
   if(ax){seg(x1,cx-g,z1,z1+t);seg(cx+g,x2,z1,z1+t);seg(x1,cx-g,z2-t,z2);seg(cx+g,x2,z2-t,z2);seg(x1,x1+t,z1+t,z2-t);seg(x2-t,x2,z1+t,z2-t);win(x1+t/2,1.9,cz,false,1,1,GL)}
   else{seg(x1,x1+t,z1,cz-g);seg(x1,x1+t,cz+g,z2);seg(x2-t,x2,z1,cz-g);seg(x2-t,x2,cz+g,z2);seg(x1+t,x2-t,z1,z1+t);seg(x1+t,x2-t,z2-t,z2)}
   bx(cx,.03,cz,x2-x1-2*t,.06,z2-z1-2*t,shade(S.tr,1.35));return true},
  deck(f,u,v,s){const hgt=2,n=Math.ceil(hgt/.5),run=.9,L=n*run,sg=v<11?1:-1,vv=f.vv,lv=6,lu=6;
   const r=f.c(u,v,lu,lv),ext=f.c(u,v+sg*L/2,lu,lv+L);if(!free(ext))return false;use(ext);
   wallR(r,hgt,shade(S.bd,1.05),{studs:true});
   const sx=-vv[0]*sg,sz=-vv[1]*sg,dir=sx>0?0:sx<0?1:sz>0?2:3,cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2,hv=lv/2,x0=cx+vv[0]*sg*(hv+L),z0=cz+vv[1]*sg*(hv+L);
   stairs(x0,z0,dir,n,2.4,S.bd,.5,run);
   const pw=.3,ph=.9,sd=(a,b,c,dd)=>wall(a,b,c,dd,ph,shade(S.bd,.9),{studs:false,y0:hgt});
   const stx=vv[0]*sg,stz=vv[1]*sg;
   if(stx!==1)sd(r[1]-pw,r[1],r[2],r[3]);if(stx!==-1)sd(r[0],r[0]+pw,r[2],r[3]);if(stz!==1)sd(r[0],r[1],r[3]-pw,r[3]);if(stz!==-1)sd(r[0],r[1],r[2],r[2]+pw);return true},
  solid(f,u,v,s){const r=f.c(u,v,7,7);if(!free(r))return false;use(r);SOL[S.sk](r,s);return true},
  lane(f,u,v,s){const long=9+Math.floor(rnd(seed,u,v)*5),perp=rnd(seed,v,u)>.5,r=perp?f.c(u,v,.8,long):f.c(u,v,long,.8);if(!free(r,1.6))return false;use(r);
   const h=1.3+rnd(seed,u+1,v)*.3;wallR(r,h,shade(S.bd,.95),{studs:true,cren:!!S.cren});return true},
  small(f,u,v,s){const r=f.c(u,v,2.8,2.8);if(!free(r))return false;use(r);const k=S.sm[Math.floor(rnd(seed,u,v)*S.sm.length)],p=f.p(u,v);SMALL[k](p[0],p[1]);return true},
  tower(f,u,v,s){const r=f.c(u,v,5,5);if(!free(r))return false;use(r);const p=f.p(u,v);TALL[S.tl](p[0],p[1]);return true}};
 const TPL=[['house','house','deck','small','small','tower'],['lane','lane','solid','small','small','lane'],['small','small','deck','small','lane','solid'],['solid','solid','solid','small','tower','house']];
 // ---------------------------------------------------------------- ponds (water, or a gap in the floor) crossed by bridges
 const pond=(f,u0,u1,bridges)=>{const v0=3,v1=19,r=f.r(u0,u1,v0,v1);if(!free(r,0))return false;use(r);pools.push(r);
  const w=r[1]-r[0],dd=r[3]-r[2],cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;
  if(S.pk==='water'){const m=new TH.Mesh(new TH.PlaneGeometry(w,dd),new TH.MeshStandardMaterial({color:S.wt,roughness:.1,metalness:.1,transparent:true,opacity:.86}));m.rotation.x=-Math.PI/2;m.position.set(cx,-.32,cz);m.userData.sh=1;add(m);
   bx(cx,-1.1,cz,w,.2,dd,shade(S.wt,.35))}
  // fighters cannot cross it except on the bridges (the colliders stop fighters, never bullets)
  let a=v0;for(const b of bridges.concat([[v1+1,v1+2]])){if(b[0]-.01>a){const q=f.r(u0,u1,a,Math.min(b[0],v1));col(q[0],q[1],q[2],q[3],30,0,{nb:1})}a=Math.max(a,b[1])}
  for(const b of bridges){const q=f.r(u0-1,u1+1,b[0],b[1]),L=Math.max(q[1]-q[0],q[3]-q[2]),ax=(q[1]-q[0])>=(q[3]-q[2]),np=Math.round(L/.7);
   for(let i=0;i<np;i++){const t=(i+.5)/np,c=S.st==='sky'?RB[i%RB.length]:S.st==='rift'?(i%2?0x7a5cff:0xa88cff):(i%2?0x9b6a3c:0x8a5a2b),e=S.st==='rift'?'eN':undefined;
    if(ax)bx(q[0]+t*(q[1]-q[0]),-.04,(q[2]+q[3])/2,L/np-.04,.2,q[3]-q[2],c,0,e);else bx((q[0]+q[1])/2,-.04,q[2]+t*(q[3]-q[2]),q[1]-q[0],.2,L/np-.04,c,0,e)}
   for(const sd of[0,1]){if(ax)bx((q[0]+q[1])/2,.5,sd?q[3]-.08:q[2]+.08,q[1]-q[0],.12,.14,shade(S.bd,.8));else bx(sd?q[1]-.08:q[0]+.08,.5,(q[2]+q[3])/2,.14,.12,q[3]-q[2],shade(S.bd,.8))}}
  return true};
 // ---------------------------------------------------------------- one region
 const regions=[];
 for(let k=0;k<4;k++){const side=SIDES[k],f=frame(side),tp=S.tpl[k],tl=TPL[tp],len=f.len;
  if(tp===2&&S.pk){for(const du of[0,14,-14,26,-26]){if(Math.abs(du)+10>len)continue;if(pond(f,du-6,du+6,[[10.2,11.8],[5.2,6.8]].slice(0,rnd(seed,k,3)>.4?2:1)))break}}
  let n=0;
  for(let b=0;b<2;b++){const vb=b?15.8:7.2;
   for(let u=-len+8+b*6;u<=len-7;u+=12){const kk=Math.floor(rnd(seed,k*13+b,u)*tl.length),jit=(rnd(seed,u,b+k)-.5)*3,type=tl[kk];
    if(pieces[type](f,u+jit,vb+(rnd(seed,u+3,k)-.5)*1.4,seed))n++}}
  // loose cover scattered over the rest
  for(let i=0;i<Math.round(len*1.3);i++){const u=(rnd(seed,k*50+i,1)*2-1)*(len-5),v=3.5+rnd(seed,k*50+i,2)*16,ty=rnd(seed,k*50+i,3)>.3?'small':'lane';if(pieces[ty](f,u,v,seed))n++}
  // the landmark of the region (and a lamp or two along the road)
  for(const uu of[0,-14,14,-28,28]){if(Math.abs(uu)>len-8)continue;if(pieces.tower(f,uu,11.3,seed)){n++;break}}
  for(let u=-len+7;u<=len-6;u+=14){const p=f.p(u,13.3),r=[p[0]-.4,p[0]+.4,p[1]-.4,p[1]+.4];if(!free(r,.8))continue;use(r);lamp(p[0],p[1],3.4,S.ac)}
  regions.push({side,name:names[side],n})}
 // the four corners: a big landmark each
 for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=sx*(H-5),z=sz*(H-5),r=[x-3,x+3,z-3,z+3];if(!free(r,0))continue;use(r);TALL[S.tl](x,z)}
 // ---------------------------------------------------------------- the floor of the ring (tiles of 4 m, a road in a loop around the core, studs every 2 m), minus the ponds
 const road=(x,z)=>{const m=Math.max(Math.abs(x),Math.abs(z));return m>=C+9.75&&m<=C+12.75&&Math.min(Math.abs(x),Math.abs(z))<=C+12.75};
 const ground=mixc(S.tr,0xffffff,.1),rd=mixc(S.tr,S.ac,.32);
 for(let i=-13;i<13;i++)for(let j=-13;j<13;j++){const x=i*4+2,z=j*4+2;if(Math.abs(x)<C&&Math.abs(z)<C)continue;
  if(pools.some(p=>x>p[0]&&x<p[1]&&z>p[2]&&z<p[3]))continue;
  const rdd=road(x,z),v=rnd(i,j,seed),c=shade(rdd?rd:ground,(((i+j)&1)?.95:1.03)*(1+(v-.5)*.08));
  bx(x,-.6,z,3.96,1.2,3.96,c);
  for(const a of[-1,1])for(const b of[-1,1])stud(x+a,.07,z+b,c)}
 // the wall around the whole world (low, with a name board for every region)
 const wc=shade(S.bd,.9);
 wall(-H,H,-H,-H+TOP*.65,TOP,wc,{studs:true,cren:!!S.cren});wall(-H,H,H-TOP*.65,H,TOP,wc,{studs:true,cren:!!S.cren});
 wall(-H,-H+TOP*.65,-H+TOP*.65,H-TOP*.65,TOP,wc,{studs:true,cren:!!S.cren});wall(H-TOP*.65,H,-H+TOP*.65,H-TOP*.65,TOP,wc,{studs:true,cren:!!S.cren});
 const hexs=c=>'#'+(c&0xffffff).toString(16).padStart(6,'0');
 for(const rg of regions){const f=frame(rg.side),p=f.p(0,.1),pos=rg.side==='N'?[0,-H+1.1]:rg.side==='S'?[0,H-1.1]:rg.side==='W'?[-H+1.1,0]:[H-1.1,0],ry=rg.side==='N'?0:rg.side==='S'?Math.PI:rg.side==='W'?Math.PI/2:-Math.PI/2;
  sign(pos[0],TOP+2.1,pos[1],ry,13,3,(g,w,h)=>{g.fillStyle='#0e1426';g.fillRect(0,0,w,h);g.strokeStyle=hexs(S.ac);g.lineWidth=h*.05;g.strokeRect(h*.04,h*.04,w-h*.08,h-h*.08);
   g.fillStyle=hexs(S.ac);g.font='800 '+Math.round(h*.46)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((rg.name||'').toUpperCase(),w/2,h*.54)},{pw:512,lit:true})}
 return{regions,names,core:S.core,intro:S.intro}}
MAPS.ring={build,has:id=>!!SPEC[id],spec:id=>SPEC[id],ids:()=>Object.keys(SPEC).filter(i=>!(MAPS.by[i]&&MAPS.by[i].tour)),half:H,sideOrder};
})();
