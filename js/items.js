/* Twelve loot items (round 14). They drop from loot bags beside the old items and use hotbar keys 3 4 5.
     Chug Brick     heal 30 over 1.5 s            Brick Boots   +25% speed 6 s          Armor Patch   +35 armor
     Smoke Studs    thrown, 8 s cloud blocks sight  Decoy Bag     ghost clone 8 s, soaks shots   Bounce Pad Kit  launch pad 25 s
     Banana Brick   thrown peel, slips 20 s        Speed Soda    +35% speed 12 s         Shock Mine    30 dmg + 1 s stun, 40 s
     Zipline Kit    line along the aim, ride it    Radar Goggles see the enemy 15 s + radar   Mini Barricade  4 wide wall 20 s
   Every item has a LEGO model (used for the hotbar icon and for the object in the world), a rarity (loot weight + frame colour) and a CPU rule.
   Online: the 'it' message replays an item on the other screen; harmful effects are decided by the victim's own game (like every hit).
   API: ITEMS.def, ITEMS.use(e,k,dir,pos), ITEMS.bot(e,d,dir,at), ITEMS.icon(k), ITEMS.model(k), ITEMS.state(), ITEMS.give(e,k) */
(()=>{
const TH=THREE,V3=TH.Vector3,PI=Math.PI,NETON=()=>!!(window.NET&&NET.on),other=e=>FOE(e);
const H=(window.MEME&&MEME.H)||{};
const fxRing=(...a)=>{try{H.ring&&H.ring(...a)}catch(x){}},fxPuff=(...a)=>{try{H.puff&&H.puff(...a)}catch(x){}},fxAdd=(...a)=>{try{H.fx&&H.fx(...a)}catch(x){}};
const snd=k=>{try{window.SFX&&SFX[k]&&SFX[k]()}catch(x){}};
const RAR={common:{c:'#c3ccd6',w:14,n:'COMMON'},uncommon:{c:'#4cd964',w:9,n:'UNCOMMON'},rare:{c:'#3d8bff',w:5.5,n:'RARE'},epic:{c:'#b05cff',w:3,n:'EPIC'},legendary:{c:'#ffb02e',w:1.6,n:'LEGENDARY'}};
const DEF={
 chug:{n:'Chug Brick',r:'common',c:0x39d96b,d:'Drink to restore 30 health over 1.5 seconds.'},
 boots:{n:'Brick Boots',r:'uncommon',c:0x35e6ff,d:'+25% run speed for 6 seconds.'},
 patch:{n:'Armor Patch',r:'common',c:0x3d8bff,d:'Adds 35 armor (up to 50).'},
 smoke:{n:'Smoke Studs',r:'uncommon',c:0xb0b8c0,d:'Throw it: a smoke cloud blocks sight for 8 seconds.'},
 decoy:{n:'Decoy Bag',r:'rare',c:0xc9a36a,d:'A ghost copy of you runs beside you for 8 seconds and soaks up shots.'},
 pad:{n:'Bounce Pad Kit',r:'uncommon',c:0x39d96b,d:'Drop a pad that launches whoever steps on it. Lasts 25 seconds.'},
 banana:{n:'Banana Brick',r:'common',c:0xffd02f,d:'Throw it: whoever steps on the peel slips. Lasts 20 seconds.'},
 soda:{n:'Speed Soda',r:'uncommon',c:0xff4a3a,d:'+35% run speed for 12 seconds.'},
 mine:{n:'Shock Mine',r:'rare',c:0x35a8ff,d:'Arms in 1 second. Zaps for 30 damage and stuns for 1 second. Lasts 40 seconds.'},
 zip:{n:'Zipline Kit',r:'epic',c:0xff8c00,d:'Fires a line along your aim and carries you across. Anyone can ride it. 20 seconds.'},
 radar:{n:'Radar Goggles',r:'rare',c:0x44ff88,d:'See the enemy through walls, plus a radar, for 15 seconds.'},
 barr:{n:'Mini Barricade',r:'uncommon',c:0xe3000b,d:'Place a 4-wide wall of bricks to hide behind. Lasts 20 seconds.'}};
// add to the loot table; the older items get a rarity too (for the hotbar frame)
Object.keys(DEF).forEach(k=>{const d=DEF[k];IT[k]={n:d.n,c:d.c,w:RAR[d.r].w,r:d.r,d:d.d}});
Object.entries({grenade:'uncommon',bandage:'common',medkit:'uncommon',shield:'common',slurp:'rare',fish:'common',trap:'uncommon',fort:'epic'}).forEach(([k,r])=>{if(IT[k])IT[k].r=r});
const KEYS=Object.keys(DEF);
// ================================================================== models
const MC={};
const sm=(c,o)=>{o=o||{};const k=c+'|'+(o.e||0)+'|'+(o.ei||0)+'|'+(o.m||0)+'|'+(o.r==null?'':o.r)+'|'+(o.t||0)+'|'+(o.a?1:0);
 return MC[k]||(MC[k]=new TH.MeshStandardMaterial({color:c,roughness:o.r==null?.38:o.r,metalness:Math.min(o.m||0,.3),emissive:o.e||0,emissiveIntensity:o.ei||0,transparent:!!(o.t||o.a),opacity:o.t||1,depthWrite:!o.a,blending:o.a?TH.AdditiveBlending:TH.NormalBlending}))};
const GEO={};
const rb=(w,h,d,r)=>{r=r==null?Math.min(w,h,d)*.2:r;const k=[w,h,d,r].map(v=>Math.round(v*1000)).join();return GEO[k]||(GEO[k]=window.rbx(w,h,d,r))};
const put=(g,geo,m,x,y,z,rx,ry,rz)=>{const q=new TH.Mesh(geo,m);q.position.set(x||0,y||0,z||0);if(rx||ry||rz)q.rotation.set(rx||0,ry||0,rz||0);if(m.transparent)q.userData.sh=1;g.add(q);return q};
const bk=(g,w,h,d,x,y,z,m,r)=>put(g,rb(w,h,d,r),m,x,y,z);
const cy=(g,r0,r1,h,x,y,z,m,rx,ry,rz,sg)=>put(g,new TH.CylinderGeometry(r0,r1,h,sg||22),m,x,y,z,rx,ry,rz);
const SPH=new TH.SphereGeometry(1,16,12),SG=new TH.CylinderGeometry(1,1,1,16);
const ball=(g,r,x,y,z,m)=>{const q=new TH.Mesh(SPH,m);q.scale.setScalar(r);q.position.set(x,y,z);g.add(q);return q};
const stud=(g,x,y,z,m,r)=>{const q=new TH.Mesh(SG,m);q.scale.set(r||.1,.07,r||.1);q.position.set(x,y,z);g.add(q);return q};
const tor=(g,R,t,x,y,z,m,rx,ry,rz,arc)=>put(g,new TH.TorusGeometry(R,t,10,28,arc||PI*2),m,x,y,z,rx,ry,rz);
function boltShape(){const s=new TH.Shape();s.moveTo(.1,.5);s.lineTo(-.24,-.02);s.lineTo(-.03,-.02);s.lineTo(-.13,-.5);s.lineTo(.25,.1);s.lineTo(.03,.1);s.lineTo(.1,.5);s.closePath();return s}
const bolt=(g,sc,x,y,z,m,depth)=>{const q=new TH.Mesh(new TH.ExtrudeGeometry(boltShape(),{depth:depth||.05,bevelEnabled:false}),m);q.scale.setScalar(sc);q.position.set(x,y,z);g.add(q);return q};
const WHITE=sm(0xf4f4f4,{r:.3}),BLACK=sm(0x1a1c1f,{r:.4}),DARK=sm(0x2c333d,{r:.4,m:.2}),STEEL=sm(0xb7c0c9,{m:.85,r:.25}),YEL=sm(0xffd02f,{r:.3}),RED=sm(0xe3000b,{r:.3});
const MODEL={
 // a clear green bottle-brick with a glowing drink, yellow cap with studs and a red bendy straw
 chug(){const g=new TH.Group();
  bk(g,.64,.8,.64,0,.4,0,sm(0x8ff0b4,{t:.42,r:.08,e:0x1fae52,ei:.25}),.12);
  bk(g,.54,.56,.54,0,.33,0,sm(0x2ee06a,{e:0x14c74e,ei:.6,r:.2}),.1);
  bk(g,.66,.12,.66,0,.84,0,YEL,.04);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>stud(g,a*.17,.93,b*.17,YEL,.1));
  cy(g,.035,.035,.52,.2,1.16,.18,sm(0xe3000b,{r:.3}));cy(g,.035,.035,.24,.12,1.43,.18,sm(0xe3000b,{r:.3}),0,0,PI/2.7);
  bk(g,.66,.26,.03,0,.42,.33,WHITE,.02);bk(g,.17,.05,.035,0,.42,.35,RED,.01);bk(g,.05,.17,.035,0,.42,.35,RED,.01);
  ball(g,.045,-.15,.22,.1,sm(0xffffff,{t:.6}));ball(g,.035,.12,.5,-.05,sm(0xffffff,{t:.6}));ball(g,.03,-.05,.6,.1,sm(0xffffff,{t:.6}));return g},
 // a pair of boots: yellow soles, graphite uppers, red cuffs and glowing cyan speed stripes
 boots(){const g=new TH.Group(),boot=(x,s)=>{
   bk(g,.36,.1,.8,x,.05,.04,YEL,.04);bk(g,.34,.26,.6,x,.23,.1,sm(0x2a2f38,{r:.35}),.07);bk(g,.32,.46,.34,x,.5,-.14,sm(0x2a2f38,{r:.35}),.07);
   bk(g,.37,.1,.39,x,.76,-.14,RED,.03);stud(g,x-.08,.37,.3,sm(0x2a2f38),.08);stud(g,x+.08,.37,.3,sm(0x2a2f38),.08);
   bk(g,.025,.07,.52,x+s*.18,.25,.1,sm(0x35e6ff,{e:0x35e6ff,ei:.9}),.01);bk(g,.025,.22,.07,x+s*.17,.55,-.14,sm(0x35e6ff,{e:0x35e6ff,ei:.9}),.01);
   bk(g,.05,.3,.22,x+s*.21,.62,-.2,WHITE,.02).rotation.z=s*.18};
  boot(-.3,-1);boot(.3,1);g.position.y=0;return g},
 // a steel plate with a blue panel, white plus, rivets and a row of studs
 patch(){const g=new TH.Group();
  bk(g,.92,.92,.14,0,.5,0,sm(0xaab4be,{m:.7,r:.28}),.05);bk(g,.74,.74,.06,0,.5,.09,sm(0x2f7dff,{e:0x2f7dff,ei:.45,r:.25}),.03);
  bk(g,.42,.11,.05,0,.5,.13,WHITE,.015);bk(g,.11,.42,.05,0,.5,.13,WHITE,.015);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cy(g,.045,.045,.05,a*.38,.5+b*.38,.12,STEEL,PI/2,0,0,12));
  for(let i=0;i<4;i++)stud(g,-.3+i*.2,1.0,0,sm(0xaab4be,{m:.7,r:.28}),.08);return g},
 // a grey canister with an orange band, studs on the shoulder, pull ring and smoke puffs
 smoke(){const g=new TH.Group(),body=sm(0x7d8995,{m:.3,r:.4});
  cy(g,.27,.27,.7,0,.42,0,body);cy(g,.276,.276,.14,0,.3,0,sm(0xffa31a,{r:.3}));cy(g,.2,.27,.14,0,.84,0,STEEL);cy(g,.27,.23,.06,0,.09,0,STEEL);
  for(let i=0;i<6;i++){const a=i*PI/3;stud(g,Math.cos(a)*.13,.93,Math.sin(a)*.13,STEEL,.055)}
  cy(g,.07,.07,.1,0,.96,0,DARK);tor(g,.09,.02,.2,.9,0,sm(0xffd02f,{m:.5,r:.3}),0,PI/2,0);bk(g,.05,.03,.4,.0,.99,.02,STEEL,.01);
  ball(g,.075,0,.5,.27,sm(0xffffff,{e:0xffffff,ei:.35}));ball(g,.06,.11,.58,.26,sm(0xffffff,{e:0xffffff,ei:.35}));ball(g,.055,-.1,.45,.26,sm(0xffffff,{e:0xffffff,ei:.35}));return g},
 // a tan duffel with a minifig head peeking out (red shades) and a tag
 decoy(){const g=new TH.Group(),tan=sm(0xc9a36a,{r:.7});
  bk(g,.96,.5,.54,0,.3,0,tan,.17);bk(g,.98,.12,.56,0,.1,0,sm(0x8a6a3a,{r:.7}),.05);bk(g,.82,.05,.42,0,.56,0,sm(0x2a1c0c),.02);bk(g,.9,.03,.03,0,.52,.27,sm(0x4a3a20),.01);
  tor(g,.2,.03,-.0,.58,.16,sm(0x5a3d22,{r:.6}),0,0,0,PI);tor(g,.2,.03,0,.58,-.16,sm(0x5a3d22,{r:.6}),0,0,0,PI);
  cy(g,.2,.2,.26,0,.72,0,YEL);stud(g,0,.88,0,YEL,.09);cy(g,.022,.022,.02,-.07,.75,.2,BLACK,PI/2);cy(g,.022,.022,.02,.07,.75,.2,BLACK,PI/2);
  bk(g,.32,.07,.03,0,.77,.2,sm(0xe3000b,{r:.2}),.02);bk(g,.12,.02,.02,0,.67,.2,BLACK,.01);
  bk(g,.2,.14,.02,.3,.36,.28,RED,.01);bk(g,.1,.03,.025,.3,.38,.295,WHITE,.005);return g},
 // a case with a spring and a glowing green pad
 pad(){const g=new TH.Group();
  bk(g,.96,.18,.96,0,.09,0,DARK,.06);for(const s of[-1,1]){bk(g,.96,.04,.1,0,.2,s*.42,YEL,.01);bk(g,.1,.04,.96,s*.42,.2,0,YEL,.01)}
  for(let i=0;i<4;i++)tor(g,.2,.032,0,.27+i*.1,0,STEEL,PI/2);
  cy(g,.42,.42,.1,0,.68,0,sm(0x39d96b,{e:0x39d96b,ei:.55,r:.25}));tor(g,.42,.03,0,.74,0,WHITE,PI/2);
  bk(g,.3,.03,.09,-.1,.75,.0,WHITE,.01).rotation.y=.7;bk(g,.3,.03,.09,.1,.75,0,WHITE,.01).rotation.y=-.7;return g},
 // a yellow banana brick: a curved tube with brown tip, green stem and studs along the inside
 banana(){const g=new TH.Group(),arc=PI*.85,R=.6,t=.17,th0=-PI/2-arc/2,cx=0,cyy=.78,yel=sm(0xffd02f,{r:.3});
  const b=put(g,new TH.TorusGeometry(R,t,14,28,arc),yel,cx,cyy,0,0,0,th0);
  const pt=(a,r)=>[cx+Math.cos(a)*r,cyy+Math.sin(a)*r];
  let p=pt(th0,R);ball(g,t*.85,p[0],p[1],0,sm(0x4a3018,{r:.5}));p=pt(th0+arc,R);ball(g,t*.8,p[0],p[1],0,sm(0x8aa63a,{r:.5}));
  const q=pt(th0+arc,R+.04);cy(g,.05,.07,.18,q[0]+.01,q[1]+.1,0,sm(0x6b7f2a,{r:.6}),0,0,-.45);
  [.3,.5,.7].forEach(f=>{const a=th0+arc*f,pp=pt(a,R-t-.02),s=stud(g,pp[0],pp[1],0,yel,.09);s.rotation.z=a+PI/2});
  [.22,.45,.62,.8].forEach(f=>{const a=th0+arc*f,pp=pt(a,R+t*.95);ball(g,.025,pp[0],pp[1],.0,sm(0x6b4a1a,{r:.6}))});
  return g},
 // a red soda can with a white band, steel lid and a yellow lightning bolt
 soda(){const g=new TH.Group(),red=sm(0xff3b2f,{r:.22,m:.3});
  cy(g,.3,.3,.66,0,.42,0,red);cy(g,.305,.305,.1,0,.2,0,sm(0x3f8cff,{r:.3,m:.3}));cy(g,.305,.305,.08,0,.64,0,WHITE);cy(g,.25,.3,.1,0,.8,0,STEEL);cy(g,.25,.26,.04,0,.07,0,STEEL);cy(g,.25,.25,.05,0,.88,0,STEEL);
  bk(g,.14,.02,.08,.06,.91,0,STEEL,.008);for(let i=0;i<4;i++){const a=i*PI/2+PI/4;stud(g,Math.cos(a)*.11,.92,Math.sin(a)*.11,STEEL,.05)}
  bolt(g,.6,0,.42,.29,sm(0xffe14a,{e:0xffc400,ei:.8}),.05);return g},
 // a black disc with a hazard ring, glowing blue core, gold electrodes and a blinking light
 mine(){const g=new TH.Group();
  cy(g,.52,.58,.16,0,.08,0,sm(0x38404c,{m:.3,r:.35}));
  for(let i=0;i<14;i++){const a=i*PI*2/14,q=bk(g,.15,.04,.1,Math.cos(a)*.43,.18,Math.sin(a)*.43,i%2?YEL:BLACK,.01);q.rotation.y=-a}
  cy(g,.24,.28,.12,0,.22,0,sm(0x262d37,{m:.3,r:.3}));const core=ball(g,.16,0,.3,0,sm(0x35a8ff,{e:0x35a8ff,ei:1.2,r:.15}));g.userData.core=core;
  for(let i=0;i<3;i++){const a=i*PI*2/3+.5,x=Math.cos(a)*.3,z=Math.sin(a)*.3;cy(g,.012,.04,.3,x,.38,z,sm(0xffc840,{m:.8,r:.25}),0,0,0,10);ball(g,.03,x,.54,z,sm(0x9fe6ff,{e:0x9fe6ff,ei:1}))}
  const led=cy(g,.04,.04,.03,0,.17,.5,sm(0xff3b3b,{e:0xff3b3b,ei:1}),PI/2);g.userData.led=led;return g},
 // a cable reel on a handle bar with a carabiner
 zip(){const g=new TH.Group();
  cy(g,.34,.34,.2,0,.68,0,sm(0xff8c00,{r:.3}),PI/2);for(const s of[-1,1])cy(g,.4,.4,.05,0,.68,s*.12,sm(0xd96f00,{r:.3}),PI/2);cy(g,.12,.12,.34,0,.68,0,STEEL,PI/2);
  tor(g,.27,.055,0,.68,0,sm(0xe9e9e9,{r:.6}));
  for(const s of[-1,1])cy(g,.02,.02,.5,s*.2,.4,0,BLACK);bk(g,.64,.09,.09,0,.14,0,RED,.03);for(const s of[-1,1])cy(g,.06,.06,.2,s*.22,.14,0,BLACK,0,0,PI/2);
  tor(g,.1,.026,0,1.15,0,sm(0xffd02f,{m:.5,r:.3}),0,0,0);bk(g,.04,.12,.04,0,1.0,0,STEEL,.01);return g},
 // goggles with a dark housing, glowing green lenses with a radar sweep and an antenna
 radar(){const g=new TH.Group();
  tor(g,.44,.05,0,.5,-.08,sm(0x23282f,{r:.6}),PI/2);bk(g,1.0,.5,.3,0,.5,.4,sm(0x222831,{r:.3}),.12);
  for(const s of[-1,1]){cy(g,.23,.23,.08,s*.26,.5,.58,sm(0xffd02f,{m:.3,r:.3}),PI/2);cy(g,.18,.18,.05,s*.26,.5,.63,sm(0x1affa0,{e:0x1affa0,ei:.95,t:.88,r:.1}),PI/2);
   tor(g,.1,.01,s*.26,.5,.66,WHITE,0,0,0);tor(g,.05,.008,s*.26,.5,.66,WHITE,0,0,0);bk(g,.014,.15,.012,s*.26,.575,.665,sm(0xffffff,{e:0xffffff,ei:1}),.004);stud(g,s*.26,.77,.4,sm(0x222831),.08)}
  bk(g,.12,.16,.12,0,.5,.55,BLACK,.04);cy(g,.015,.015,.3,.42,.88,.35,BLACK);ball(g,.035,.42,1.04,.35,sm(0xff3b3b,{e:0xff3b3b,ei:1}));return g},
 barr(L,Hh){return barrier(L||1.3,Hh||.82)}};
// the barricade: A-frame legs, three red and white striped boards, studs along the top and amber lights
function barrier(L,Hh){const g=new TH.Group(),n=Math.max(4,Math.round(L/(Hh*.32))),sg=L/n,bh=Hh*.22,ys=[.3,.6,.88].map(f=>f*Hh),legs=L>2.4?[-L/2+.28,0,L/2-.28]:[-L/2+.2,L/2-.2],th=Math.min(.16,Hh*.2);
 for(const x of legs)for(const s of[-1,1]){const q=bk(g,th,Hh*1.04,th*.9,x,Hh/2,s*Hh*.22,sm(0x39414c,{m:.2,r:.4}),th*.2);q.rotation.x=-s*.2}
 ys.forEach((y,j)=>{for(let i=0;i<n;i++)bk(g,sg*.99,bh,th*1.3,-L/2+sg*(i+.5),y,0,(i+j)%2?WHITE:RED,Math.min(.03,bh*.2))});
 const topN=Math.max(2,Math.round(L/.5));for(let i=0;i<topN;i++)stud(g,-L/2+L*(i+.5)/topN,ys[2]+bh/2+.03,0,RED,Math.min(.1,Hh*.1));
 const lamps=[];for(const s of[-1,1]){const m=sm(0xffb020,{e:0xff9a00,ei:.9,r:.2}),b=ball(g,Math.max(.07,Hh*.08),s*(L/2-.1),Hh*1.04+Math.max(.07,Hh*.08),0,m);lamps.push(b)}
 g.userData.lamps=lamps;return g}
// ================================================================== hotbar icons (3D models rendered once)
const IROT={soda:.5,patch:.34,chug:.45,decoy:.55,radar:.42,zip:.6,boots:.95,smoke:.3,banana:.3,mine:.4,pad:.4,barr:-.62};
const IC={};let ir=null,is=null,ic=null;
function fallbackIcon(k){const d=DEF[k],c='#'+d.c.toString(16).padStart(6,'0');return'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="7" fill="'+c+'" stroke="#000" stroke-width="2.5"/><text x="20" y="27" text-anchor="middle" font-size="18" font-family="Arial" font-weight="bold" fill="#000">'+d.n[0]+'</text></svg>')}
function iconPic(k){if(IC[k])return IC[k];if(!DEF[k])return'';
 try{if(!ir){ir=new TH.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});ir.setPixelRatio(1);ir.setSize(256,256);try{ir.domElement.width=ir.domElement.height=256}catch(x){}is=new TH.Scene();
   is.add(new TH.HemisphereLight(0xffffff,0x56627a,1.05));const d1=new TH.DirectionalLight(0xffffff,.95);d1.position.set(3,5,4);is.add(d1);const d2=new TH.DirectionalLight(0x9fd0ff,.4);d2.position.set(-4,2,-3);is.add(d2);ic=new TH.PerspectiveCamera(24,1,.1,60)}
  const g=MODEL[k]();g.rotation.y=IROT[k]==null?.4:IROT[k];is.add(g);
  const bb=new TH.Box3().setFromObject(g),sz=bb.getSize(new V3()),ct=bb.getCenter(new V3()),rad=Math.hypot(sz.x,sz.y,sz.z)*.5,dist=rad/Math.sin(12*PI/180)*.88,nv=new V3(.5,.55,1).normalize();
  ic.position.set(ct.x+nv.x*dist,ct.y+nv.y*dist,ct.z+nv.z*dist);ic.lookAt(ct);ic.updateProjectionMatrix&&ic.updateProjectionMatrix();ir.render(is,ic);is.remove(g);
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d'),col=RAR[DEF[k].r].c;
  const gr=x.createRadialGradient(128,134,8,128,134,122);gr.addColorStop(0,col+'66');gr.addColorStop(1,col+'00');x.fillStyle=gr;x.fillRect(0,0,256,256);
  x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(128,218,66,13,0,0,7);x.fill();
  x.drawImage(ir.domElement,0,0);const u=cv.toDataURL();return IC[k]=u&&u.length>40?u:fallbackIcon(k)}catch(e){return IC[k]=fallbackIcon(k)}}
if(window.ICON)KEYS.forEach(k=>Object.defineProperty(ICON,k,{configurable:true,enumerable:true,get:()=>'<img src="'+iconPic(k)+'" alt="">'}));
// ================================================================== helpers
const hd=(dir,e)=>{if(!dir||!isFinite(dir.x)||!isFinite(dir.z)||Math.hypot(dir.x,dir.z)<1e-4)return[-Math.sin(e.yaw||0),-Math.cos(e.yaw||0)];const l=Math.hypot(dir.x,dir.z);return[dir.x/l,dir.z/l]};
const okAt=(x,z)=>H.free?H.free(x,z):(Math.abs(x)<A-1&&Math.abs(z)<A-1&&!inBox(new V3(x,.5,z)));
const rise=(m,t,dur)=>{const k=Math.min(1,t/dur);m.scale.y=Math.max(.001,k*k*(3-2*k))};
const SMK=[],PEL=[],MIN=[],PAD=[],BAR=[],ZIP=[],DCY=[],THR=[];let uid=0;
const lifeFade=(g,t,life)=>{const k=Math.max(0,Math.min(1,(life-t)/1.2));return k};
// ================================================================== buffs
function bf(e){return e.bf||(e.bf={})}
const SPD={boots:1.25,soda:1.35};
function buff(e,k,T){const b=bf(e);b[k]={t:T,T}}
const mulOf=e=>{let m=1;if(e.bf)for(const k in SPD)if(e.bf[k]&&e.bf[k].t>0)m=Math.max(m,SPD[k]);return m};
function buffs(dt,act){for(const e of ENTS()){if(!e.bf)continue;for(const k in e.bf){const b=e.bf[k];if(b.t>0){b.t-=dt;
  if(act&&e.hp>0&&(k==='boots'||k==='soda')&&((b.tk=(b.tk||0)-dt)<=0)&&Math.hypot(e.vx||0,e.vz||0)>2){b.tk=k==='soda'?.1:.06;fxPuff(e.x-(e.vx||0)*.05,e.y+.25,e.z-(e.vz||0)*.05,k==='soda'?0xff7a6a:0x6ff3ff,1,.6,.35,.12)}}}}
 for(const e of ENTS()){if(!e.chug)continue;const c=e.chug;if(e.hp<=0||over){e.chug=null;continue}const d=Math.min(dt,c.t);c.t-=dt;e.hp=Math.min(e.mx,e.hp+c.amt/1.5*d);
  if(((c.tk=(c.tk||0)-dt)<=0)){c.tk=.14;fxPuff(e.x+(Math.random()-.5)*.6,e.y+.3+Math.random(),e.z+(Math.random()-.5)*.6,0x59ff8a,1,.4,.55,.09)}if(c.t<=0)e.chug=null}}
// ================================================================== using an item
const USE={
 chug(e){if(e===P&&e.hp>=e.mx&&!NETON()){say('HEALTH FULL',.8);return false}e.chug={t:1.5,amt:30*(e.hs||1)};fxRing(e.x,e.y+.1,e.z,.4,1.8,0x59ff8a,.7);snd('pick')},
 boots(e){buff(e,'boots',6);fxRing(e.x,e.y+.1,e.z,.4,2,0x35e6ff,.6);snd('pick')},
 soda(e){buff(e,'soda',12);fxRing(e.x,e.y+.1,e.z,.4,2.2,0xff6a5a,.6);fxPuff(e.x,e.y+1.8,e.z,0xffffff,8,2.5,.7,.1);snd('pick')},
 patch(e){if(e===P&&e.ar>=50&&!NETON()){say('ARMOR FULL',.8);return false}e.ar=Math.min(50,e.ar+35);fxRing(e.x,e.y+.1,e.z,.4,1.8,0x4aa8ff,.7);fxRing(e.x,e.y+1.2,e.z,.3,1.3,0xbfe0ff,.5);snd('pick')},
 radar(e){buff(e,'radar',15);if(e===P)e.rev=Math.max(e.rev||0,15);fxRing(e.x,e.y+1.8,e.z,.3,1.5,0x44ff88,.7);snd('pick')},
 smoke(e,dir,pos){lob(e,'smoke',dir,pos)},
 banana(e,dir,pos){lob(e,'banana',dir,pos)},
 decoy(e,dir,pos){spawnDecoy(e,dir,pos)},
 pad(e,dir,pos){return placePad(e,dir,pos)},
 mine(e,dir,pos){return placeMine(e,dir,pos)},
 barr(e,dir,pos){return placeBar(e,dir,pos)},
 zip(e,dir,pos){return placeZip(e,dir,pos)}};
function use(e,k,dir,pos){const f=USE[k];if(!f||e.hp<=0)return false;
 if(pos&&!(isFinite(pos.x)&&isFinite(pos.y)&&isFinite(pos.z)))pos=null;
 return f(e,dir,pos)}
// ================================================================== thrown items: smoke canister and banana
function lob(e,k,dir,pos){const o=pos||e,d=dir&&isFinite(dir.x)?dir.clone().normalize():new V3(-Math.sin(e.yaw||0),.25,-Math.cos(e.yaw||0));
 const p=new V3(o.x,o.y+1.6,o.z).addScaledVector(d,.8),m=MODEL[k]();m.scale.setScalar(k==='smoke'?.55:.6);m.position.copy(p);S.add(m);
 const sp=k==='smoke'?15:13;THR.push({k,m,p,v:d.clone().multiplyScalar(sp).add(new V3(0,k==='smoke'?4.5:3.4,0)),t:0,o:e})}
function flights(dt,act){for(let i=THR.length-1;i>=0;i--){const q=THR[i];q.t+=dt;q.v.y-=22*dt;const pr=q.p.clone();q.p.addScaledVector(q.v,dt);
  let land=false;if(q.t>.12&&inBox(q.p)){q.p.copy(pr);land=true}if(q.p.y<=.2&&q.v.y<0){q.p.y=Math.max(.2,gh(q.p.x,q.p.z,pr.y)+.1);land=true}if(q.t>3)land=true;
  if(Math.abs(q.p.x)>A-.4)q.p.x=Math.sign(q.p.x)*(A-.4);if(Math.abs(q.p.z)>A-.4)q.p.z=Math.sign(q.p.z)*(A-.4);
  q.m.position.copy(q.p);q.m.rotation.x+=dt*9;q.m.rotation.z+=dt*3;
  if(land){S.remove(q.m);THR.splice(i,1);q.k==='smoke'?smokeAt(q.p.x,q.p.z,q.p.y,q.o):peelAt(q.p.x,q.p.z,q.o)}}}
// ---------------------------------------------------------------- smoke cloud
const SR=4.2,SMKC=[0xe6ebef,0xcfd6dc,0xb5bec6];
function smokeAt(x,z,y,o){while(SMK.length>=3)killSmoke(SMK.shift());
 const g=new TH.Group(),mats=SMKC.map(c=>new TH.MeshStandardMaterial({color:c,roughness:1,metalness:0,emissive:c,emissiveIntensity:.32,transparent:true,opacity:.7,depthWrite:false})),puffs=[];
 for(let i=0;i<22;i++){const a=Math.random()*PI*2,rr=Math.sqrt(Math.random())*SR*.62,r=.95+Math.random()*.85,m=new TH.Mesh(SPH,mats[i%3]);m.userData.sh=1;
  const bx=Math.cos(a)*rr,bz=Math.sin(a)*rr,by=.55+Math.random()*2.5;m.position.set(bx,by,bz);m.scale.setScalar(.01);g.add(m);puffs.push({m,bx,by,bz,r,ph:Math.random()*6})}
 const can=MODEL.smoke();can.scale.setScalar(.5);can.rotation.z=PI/2;can.position.set(0,.2,0);g.add(can);
 g.position.set(x,Math.max(0,y-.2),z);S.add(g);SMK.push({g,x,z,y:1.7,t:0,life:8,puffs,mats,can,o});
 fxRing(x,.2,z,.5,SR,0xdfe6ec,.9,true);snd('swing')}
function killSmoke(c){S.remove(c.g)}
function smokeStep(dt){for(let i=SMK.length-1;i>=0;i--){const c=SMK[i];c.t+=dt;if(c.t>=c.life){killSmoke(c);SMK.splice(i,1);continue}
  const grow=Math.min(1,c.t/.8),ge=1-Math.pow(1-grow,3),fade=Math.max(0,Math.min(1,(c.life-c.t)/1.6));
  c.mats.forEach(m=>m.opacity=.72*fade);
  for(const p of c.puffs){const s=p.r*ge*(.82+.18*fade);p.m.scale.setScalar(Math.max(.01,s*(1+Math.sin(T*.9+p.ph)*.05)));
   p.m.position.set(p.bx*ge+Math.sin(T*.5+p.ph)*.22,p.by*(.55+.45*ge)+Math.sin(T*.7+p.ph*1.3)*.14+(1-fade)*.8,p.bz*ge+Math.cos(T*.45+p.ph)*.22)}
  c.can.visible=c.t<c.life-1}}
function smokeCut(ax,ay,az,bx,by,bz){for(const c of SMK){if(c.t<.3)continue;const R=SR*.78*Math.min(1,c.t/.8),dx=bx-ax,dy=by-ay,dz=bz-az,L2=dx*dx+dy*dy+dz*dz||1,
   t=Math.max(0,Math.min(1,((c.x-ax)*dx+(c.y-ay)*dy+(c.z-az)*dz)/L2)),px=ax+dx*t-c.x,py=ay+dy*t-c.y,pz=az+dz*t-c.z;if(px*px+py*py+pz*pz<R*R)return true}return false}
const _bl=blocked;blocked=function(a,b){return _bl(a,b)||smokeCut(a.x,a.y+1.4-(a.cr||0)*.45,a.z,b.x,b.y+1.4-(b.cr||0)*.45,b.z)};
// a grey veil when your camera is inside a cloud
let veil=null;
function veilStep(){if(!veil){veil=document.createElement('div');veil.id='smkov';document.body.appendChild(veil)}
 let o=0;if(mode==='play')for(const c of SMK){const d=Math.hypot(C.position.x-c.x,C.position.y-c.y,C.position.z-c.z),R=SR*.8*Math.min(1,c.t/.8);if(d<R)o=Math.max(o,Math.min(.62,(1-d/R)*1.5))}
 veil.style.opacity=o.toFixed(2)}
// ---------------------------------------------------------------- banana peel + slip
function slip(v,x,z){if(v.sh>0||v.slip>0)return;const s=Math.hypot(v.vx||0,v.vz||0);let a=s>.5?Math.atan2(v.vz,v.vx):Math.random()*PI*2;v.slip=1.3;v.dash=1.3;v.dvx=Math.cos(a)*10;v.dvz=Math.sin(a)*10;
 H.stun&&H.stun(v,1.3);fxPuff(x,.3,z,0xfff2a8,7,3,.7,.12);if(v===P)say('SLIPPED!',1.2);snd('hit')}
function peelAt(x,z,o){while(PEL.length>=4){S.remove(PEL.shift().m)}
 if(!okAt(x,z)){for(let r=.8;r<3;r+=.8){let f=false;for(let a=0;a<6.3&&!f;a+=1.05){const nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(okAt(nx,nz)){x=nx;z=nz;f=true}}if(f)break}}
 const m=MODEL.banana();m.scale.setScalar(.8);m.rotation.x=-PI/2;m.rotation.z=Math.random()*PI*2;m.position.set(x,Math.max(0,gh(x,z,2))+.14,z);S.add(m);PEL.push({m,x,z,o,t:20,arm:.7})}
function peelStep(dt,act){for(let i=PEL.length-1;i>=0;i--){const q=PEL[i];q.t-=dt;q.arm-=dt;const f2=q.t<2?(Math.sin(T*18)>0):true;q.m.visible=f2;
  if(q.t<=0){S.remove(q.m);PEL.splice(i,1);continue}
  if(act&&q.arm<=0)for(const f of ENTS()){if(f.hp<=0||f.y>q.m.position.y+.7||Math.hypot(f.x-q.x,f.z-q.z)>1.0)continue;
   if(f===E&&NETON()){S.remove(q.m);PEL.splice(i,1);break}      // the other player's game decides their own slip
   slip(f,q.x,q.z);S.remove(q.m);PEL.splice(i,1);break}}}
// ================================================================== decoy bag
function spawnDecoy(e,dir,pos){const o=pos||e;for(let i=DCY.length-1;i>=0;i--)if(DCY[i].o===e){killDecoy(DCY[i]);DCY.splice(i,1)}
 const [dx,dz]=hd(dir,e),sides=[[-dz,dx],[dz,-dx],[dx,dz],[-dx,-dz]];let x=o.x,z=o.z;
 for(const [sx,sz] of sides){for(const L of[2.6,2,1.4]){const px=o.x+sx*L,pz=o.z+sz*L;if(okAt(px,pz)){x=px;z=pz;sides.length=0;break}}if(!sides.length)break}
 let f=null;try{const k=e.skn|0,lk=LOOK[e.id];f=window.SKN?SKN.with(k,()=>mini(lk)):mini(lk);if(f.ham)f.ham.visible=false;attachGun(f,e.w.sig||e.w.id);
  f.g.traverse(m=>{if(m.isMesh&&m.material&&!Array.isArray(m.material)&&m.material.clone){const c=m.material.clone();c.transparent=true;c.opacity=.5;c.depthWrite=false;if(c.emissive&&c.emissive.set){c.emissive.set(0x35e6ff);c.emissiveIntensity=.38}m.material=c;m.userData.sh=1;m.castShadow=false}})}catch(x2){f=null}
 const ring=new TH.Mesh(new TH.TorusGeometry(.8,.04,8,32),new TH.MeshBasicMaterial({color:0x35e6ff,transparent:true,opacity:.7,depthWrite:false}));ring.rotation.x=PI/2;ring.userData.sh=1;
 const d={o:e,f,x,z,y:e.y,t:8,hp:60,fool:Math.random()<.75,ring,id:++uid,ph:0};
 if(f){f.g.position.set(x,e.y,z);f.g.rotation.y=e.yaw||0;S.add(f.g)}S.add(ring);ring.position.set(x,.08,z);DCY.push(d);
 fxPuff(x,e.y+1,z,0x9fe9ff,10,2.5,.6,.14);fxRing(x,.1,z,.3,1.8,0x35e6ff,.6,true);if(e===P)say('DECOY OUT',.8)}
function killDecoy(d){if(d.f)S.remove(d.f.g);S.remove(d.ring)}
function decoyPop(d){fxPuff(d.x,d.y+1,d.z,0x9fe9ff,14,3.5,.7,.14);fxRing(d.x,d.y+.1,d.z,.4,2.2,0x35e6ff,.5,true);killDecoy(d);const i=DCY.indexOf(d);if(i>=0)DCY.splice(i,1)}
function decoyStep(dt,act){for(let i=DCY.length-1;i>=0;i--){const d=DCY[i],o=d.o;d.t-=dt;if(d.t<=0||o.hp<=0){decoyPop(d);continue}
  if(act){const nx=d.x+(o.vx||0)*dt,nz=d.z+(o.vz||0)*dt;if(okAt(nx,d.z))d.x=nx;if(okAt(d.x,nz))d.z=nz}
  d.y=gh(d.x,d.z,Math.max(o.y,0)+.1);const sp=Math.hypot(o.vx||0,o.vz||0),wk=Math.min(1.2,sp/Math.max(o.sp||9,1));
  if(d.f){const f=d.f;f.g.position.set(d.x,d.y,d.z);f.g.rotation.y=o.yaw||0;d.ph+=sp*dt*1.25;f.wk=wk;f.wp=d.ph;const a=Math.sin(d.ph)*.8*Math.min(1,wk);
   if(f.lg){f.lg[0].rotation.x=a;f.lg[1].rotation.x=-a}f.pitch=o.pitch||0;try{window.HOLD&&HOLD.update(f)}catch(x){}
   f.g.traverse(m=>{if(m.isMesh&&m.material&&m.material.emissiveIntensity!=null&&m.userData.sh)m.material.emissiveIntensity=.3+.15*Math.sin(T*6)});}
  d.ring.position.set(d.x,d.y+.08,d.z);d.ring.material.opacity=d.t<1.5?(Math.sin(T*20)>0?.7:.15):.55+.15*Math.sin(T*5)}}
// bullets that reach a decoy hit the decoy instead
function decoyBullets(dt){if(!DCY.length)return;for(const d of DCY){const foe=other(d.o),tg={x:d.x,y:d.y,z:d.z,hh:2.4};
  for(let i=bl.length-1;i>=0;i--){const b=bl[i];if(b.e!==foe)continue;const dx=b.v.x*dt*1.2,dy=b.v.y*dt*1.2,dz=b.v.z*dt*1.2;
   const s=cylS(b.p.x,b.p.y,b.p.z,dx,dy,dz,tg);if(s>1)continue;
   const sr=cylS(b.p.x,b.p.y,b.p.z,dx,dy,dz,d.o);if(sr<=1&&sr<s)continue;      // the real fighter is in front of it
   const w=segBox(b.p.x,b.p.y,b.p.z,b.p.x+dx,b.p.y+dy,b.p.z+dz);if(w!==null&&w<s)continue;
   S.remove(b.m);bl.splice(i,1);
   if(b.w.rocket){boom(new V3(d.x,d.y+1,d.z),b.e);decoyPop(d);break}
   d.hp-=Math.max(4,(b.w.dmg||8)*(b.e.dm||1));fxPuff(d.x,d.y+1.3,d.z,0x9fe9ff,3,2.5,.35,.1);
   if(d.hp<=0){decoyPop(d);break}}}}
// the CPU is fooled by your decoy most of the time: it shoots at the ghost
const _shoot=shoot;shoot=function(e,dir){if(e===E&&E.bot&&!NETON()&&DCY.length){const d=DCY.find(q=>q.o===P&&q.fool&&q.t>.4);if(d)dir=new V3(d.x-E.x,d.y+1.2-(E.y+1.4),d.z-E.z).normalize()}_shoot(e,dir)};
// ================================================================== bounce pad
function padModel(){const g=new TH.Group();
 cy(g,.98,1.05,.16,0,.08,0,DARK);for(let i=0;i<16;i++){const a=i*PI*2/16,q=bk(g,.24,.04,.14,Math.cos(a)*.86,.17,Math.sin(a)*.86,i%2?YEL:BLACK,.01);q.rotation.y=-a}
 const top=cy(g,.74,.74,.14,0,.26,0,sm(0x39d96b,{e:0x39d96b,ei:.6,r:.25}));g.userData.top=top;tor(g,.76,.05,0,.34,0,sm(0xffee66,{e:0xffee66,ei:.7}),PI/2);
 for(const z of[-.3,.02,.34]){const a=bk(g,.5,.04,.12,0,.35,z,sm(0xffffff,{e:0xffffff,ei:.5}),.01);a.scale.x=1-(z+.3)*.4}
 const glow=cy(g,.92,.92,.02,0,.03,0,sm(0x39ff7a,{a:true,t:.35}));glow.userData.sh=1;g.userData.glow=glow;return g}
function placePad(e,dir,pos){const o=pos||e,[dx,dz]=hd(dir,e);let x=null,z=null;
 for(const L of[2.2,1.7,1.2,0])if(okAt(o.x+dx*L,o.z+dz*L)){x=o.x+dx*L;z=o.z+dz*L;break}
 if(x===null){if(e===P)say('NO ROOM',.9);return false}
 while(PAD.length>=3)S.remove(PAD.shift().g);
 const g=padModel();g.position.set(x,Math.max(0,gh(x,z,o.y+.1)),z);S.add(g);PAD.push({g,x,z,y:g.position.y,o:e,t:25,hit:0,bt:0});fxRing(x,g.position.y+.1,z,.3,1.9,0x39ff7a,.6,true);snd('pick')}
function padStep(dt,act){for(let i=PAD.length-1;i>=0;i--){const q=PAD[i];q.t-=dt;q.hit=Math.max(0,q.hit-dt);if(q.t<=0){S.remove(q.g);PAD.splice(i,1);continue}
  q.g.visible=q.t>2||Math.sin(T*18)>0;q.g.scale.set(1,1-.55*Math.min(1,q.hit/.3),1);const u=q.g.userData;if(u.glow)u.glow.material.opacity=.3+.15*Math.sin(T*4+q.x);
  if(!act)continue;
  for(const f of ENTS()){if(f===E&&NETON())continue;f.bpc=Math.max(0,(f.bpc||0)-dt/Math.max(1,PAD.length));if(f.bpc>0||f.hp<=0||f.zip)continue;
   if(Math.hypot(f.x-q.x,f.z-q.z)<.95&&f.y<q.y+.7){f.vy=20;f.gr=false;f.y+=.06;f.bpc=.5;q.hit=.3;fxRing(q.x,q.y+.2,q.z,.4,1.8,0x39ff7a,.45);if(f===P){say('BOUNCE!',.5);snd('pick')}}}}}
// ================================================================== shock mine
const LEDON=sm(0xff3b3b,{e:0xff3b3b,ei:1}),LEDOFF=sm(0x5a1010,{e:0x5a1010,ei:.1});
function placeMine(e,dir,pos){const o=pos||e,[dx,dz]=hd(dir,e);let x=null,z=null;
 for(const L of[1.4,.9,0])if(okAt(o.x+dx*L,o.z+dz*L)){x=o.x+dx*L;z=o.z+dz*L;break}
 if(x===null){if(e===P)say('NO ROOM',.9);return false}
 while(MIN.length>=4)killMine(MIN.shift());
 const g=MODEL.mine();g.scale.setScalar(.85);if(g.userData.core)g.userData.core.material=g.userData.core.material.clone();const y=Math.max(0,gh(x,z,o.y+.1));g.position.set(x,y,z);S.add(g);
 const own=new TH.Mesh(new TH.TorusGeometry(1.6,.035,6,40),new TH.MeshBasicMaterial({color:0x35a8ff,transparent:true,opacity:.5,depthWrite:false}));own.rotation.x=PI/2;own.position.set(x,y+.05,z);own.visible=e===P;own.userData.sh=1;S.add(own);
 MIN.push({g,own,x,z,y,o:e,t:40,arm:1});fxPuff(x,y+.2,z,0x9fe6ff,5,1.5,.4,.08);snd('pick')}
function killMine(m){S.remove(m.g);S.remove(m.own)}
function zap(x,y,z){const g=new TH.Group(),mt=new TH.MeshBasicMaterial({color:0xbfeaff,transparent:true,opacity:1,depthWrite:false,blending:TH.AdditiveBlending}),mt2=new TH.MeshBasicMaterial({color:0x35a8ff,transparent:true,opacity:.8,depthWrite:false,blending:TH.AdditiveBlending});
 let px=0,pz=0;for(let i=0;i<7;i++){const nx=(Math.random()-.5)*.9,nz=(Math.random()-.5)*.9,q=new TH.Mesh(new TH.BoxGeometry(.09,.55,.09),i%2?mt:mt2);q.position.set((px+nx)/2,.3+i*.5,(pz+nz)/2);q.rotation.z=(nx-px)*1.1;q.rotation.x=-(nz-pz)*1.1;q.userData.sh=1;g.add(q);px=nx;pz=nz}
 g.position.set(x,y,z);fxAdd(g,.45,(o,k)=>{mt.opacity=1-k;mt2.opacity=.8*(1-k);o.scale.set(1+k*.3,1,1+k*.3)});fxRing(x,y+.2,z,.4,3,0x35a8ff,.5);fxRing(x,y+1.2,z,.3,2,0xbfeaff,.35)}
function mineStep(dt,act){for(let i=MIN.length-1;i>=0;i--){const m=MIN[i];m.t-=dt;m.arm-=dt;
  if(m.t<=0){killMine(m);MIN.splice(i,1);continue}
  const u=m.g.userData,armed=m.arm<=0;if(u.core)u.core.material.emissiveIntensity=armed?1.0+.5*Math.sin(T*10):.15;
  if(u.led)u.led.material=(armed?Math.sin(T*8)>0:Math.sin(T*22)>0)?LEDON:LEDOFF;
  m.g.visible=m.t>2||Math.sin(T*16)>0;m.own.visible=m.o===P&&armed;
  if(!(act&&armed))continue;const foe=other(m.o);
  if(foe.hp>0&&Math.hypot(foe.x-m.x,foe.z-m.z)<1.6&&foe.y<m.y+1.4&&!foe.zip){
   zap(m.x,m.y,m.z);killMine(m);MIN.splice(i,1);
   if(!(foe===E&&NETON())&&!(foe.sh>0)){dmg(foe,30*(foe.hs||1));H.stun&&H.stun(foe,1);if(foe===P)say('ZAPPED!',1);try{H.shake&&H.shake(.5)}catch(x){}}}}}
// ================================================================== mini barricade
function placeBar(e,dir,pos){const o=pos||e,[dx,dz]=hd(dir,e),axX=Math.abs(dx)>=Math.abs(dz),ux=axX?Math.sign(dx)||1:0,uz=axX?0:Math.sign(dz)||1;let ok=null;
 for(const L of[3.4,2.8,2.3,1.9]){const cx=o.x+ux*L,cz=o.z+uz*L,hx=axX?.5:2,hz=axX?2:.5,r=[cx-hx,cx+hx,cz-hz,cz+hz];
  if(r[0]<-A+.4||r[1]>A-.4||r[2]<-A+.4||r[3]>A-.4)continue;let bad=false;
  for(const b of boxes){if(b.nb)continue;if(b.x1<r[1]&&b.x2>r[0]&&b.z1<r[3]&&b.z2>r[2]&&b.h>.3&&(b.y0||0)<1.2){bad=true;break}}
  if(!bad)for(const q of ENTS())if(q.x>r[0]-.7&&q.x<r[1]+.7&&q.z>r[2]-.7&&q.z<r[3]+.7){bad=true;break}
  if(!bad){ok={cx,cz,r,axX};break}}
 if(!ok){if(e===P)say('NO ROOM',.9);return false}
 while(BAR.length>=3)killBar(BAR.shift());
 const id=++uid,box={x1:ok.r[0],x2:ok.r[1],z1:ok.r[2],z2:ok.r[3],h:1.6,bar:id};boxes.push(box);
 const g=barrier(4,1.6);g.position.set(ok.cx,0,ok.cz);g.rotation.y=ok.axX?PI/2:0;g.scale.y=.001;S.add(g);BAR.push({g,box,id,t:20,age:0,o:e});
 window.NAV&&NAV.rebuild();fxPuff(ok.cx,.3,ok.cz,0xd8dde2,12,3,.5,.2);snd('pick')}
function killBar(b){S.remove(b.g);const i=boxes.indexOf(b.box);if(i>=0)boxes.splice(i,1);window.NAV&&NAV.rebuild()}
function barStep(dt){for(let i=BAR.length-1;i>=0;i--){const b=BAR[i];b.t-=dt;b.age+=dt;if(b.t<=0){fxPuff((b.box.x1+b.box.x2)/2,.5,(b.box.z1+b.box.z2)/2,0xd8dde2,10,3,.5,.2);killBar(b);BAR.splice(i,1);continue}
  rise(b.g,b.age,.3);b.g.visible=b.t>2||Math.sin(T*16)>0;const L=b.g.userData.lamps;if(L)L.forEach((l,j)=>{l.material=Math.sin(T*6+j*PI)>0?sm(0xffb020,{e:0xff9a00,ei:1.1,r:.2}):sm(0x6a4a10,{e:0x3a2a00,ei:.1,r:.2})})}}
// ================================================================== zipline
function anchorModel(h){const g=new TH.Group();cy(g,.07,.09,Math.max(.1,h),0,h/2,0,DARK);bk(g,.46,.1,.46,0,h,0,sm(0xff8c00,{r:.3}),.03);stud(g,0,h+.08,0,YEL,.1);tor(g,.1,.022,0,h-.12,0,STEEL,PI/2);return g}
function placeZip(e,dir,pos){const o=pos||e,d=dir&&isFinite(dir.x)&&dir.length()>0?dir.clone().normalize():new V3(-Math.sin(e.yaw||0),0,-Math.cos(e.yaw||0)),[dx,dz]=hd(d,e);
 const ey=o.y+1.6,eye=new V3(o.x,ey,o.z);let last=eye.clone(),hit=false;
 for(let s=.5;s<=22;s+=.5){const p=eye.clone().addScaledVector(d,s);if(inBox(p)||p.y<=0||Math.abs(p.x)>A-.3||Math.abs(p.z)>A-.3){hit=true;break}last=p}
 const B=last.clone().addScaledVector(d,-.1);B.x=Math.max(-A+.3,Math.min(A-.3,B.x));B.z=Math.max(-A+.3,Math.min(A-.3,B.z));B.y=Math.max(2.8,B.y);
 const gA=Math.max(0,gh(o.x+dx*.8,o.z+dz*.8,o.y+.1)),Aa=new V3(o.x+dx*.8,Math.max(o.y,gA)+3.0,o.z+dz*.8),len=Aa.distanceTo(B);
 if(len<5){if(e===P)say('TOO CLOSE',.9);return false}
 while(ZIP.length>=2)killZip(ZIP.shift());
 const g=new TH.Group(),pa=anchorModel(Aa.y-gA),gB=Math.max(0,gh(B.x,B.z,B.y)),pb=B.y>4.4?anchorModel(.3):anchorModel(Math.max(.3,B.y-gB));
 pa.position.set(Aa.x,gA,Aa.z);pb.position.set(B.x,B.y>4.4?B.y-.3:gB,B.z);g.add(pa);g.add(pb);
 const cab=new TH.Mesh(new TH.CylinderGeometry(.028,.028,len,6),sm(0xe9e9e9,{r:.5,m:.3}));cab.position.copy(Aa).add(B).multiplyScalar(.5);cab.quaternion.setFromUnitVectors(new V3(0,1,0),B.clone().sub(Aa).normalize());g.add(cab);
 const tr=new TH.Group();bk(tr,.5,.1,.14,0,0,0,YEL,.03);cy(tr,.1,.1,.06,0,.1,0,STEEL,PI/2);tr.visible=false;g.add(tr);S.add(g);
 const ln={g,A:Aa,B,len,t:20,tr,riders:0,id:++uid};ZIP.push(ln);
 if(!(e===E&&NETON()))ride(e,ln,1);fxRing(Aa.x,Aa.y,Aa.z,.3,1.5,0xff8c00,.5);fxRing(B.x,B.y,B.z,.3,1.5,0xff8c00,.5);snd('pick')}
function killZip(l){S.remove(l.g);for(const e of ENTS())if(e.zip&&e.zip.ln===l)e.zip=null}
function ride(e,ln,dir){if(e.zip||e.hp<=0)return;e.zip={ln,s:dir>0?0:1,dir,sp:15};e.vy=0;e.dash=0;e.pf=null;if(e===P)say('ZIPLINE!',.8)}
function zipEnd(e){const z=e.zip;if(!z)return;const dx=(z.ln.B.x-z.ln.A.x)*z.dir,dz=(z.ln.B.z-z.ln.A.z)*z.dir,l=Math.hypot(dx,dz)||1;e.zip=null;e.zcd=1.2;e.zlast=z.ln;e.vx=dx/l*7;e.vz=dz/l*7;e.vy=1.5;e.gr=false}
function zipPhys(e,dt){const z=e.zip,l=z.ln,sd=z.sp/l.len*dt*z.dir;z.s+=sd;const s=Math.max(0,Math.min(1,z.s));
 const x=l.A.x+(l.B.x-l.A.x)*s,y=l.A.y+(l.B.y-l.A.y)*s,zz=l.A.z+(l.B.z-l.A.z)*s;e.x=x;e.z=zz;e.y=Math.max(gh(x,zz,y-2.75),y-2.75);e.vy=0;e.gr=false;
 e.vx=(l.B.x-l.A.x)/l.len*z.sp*z.dir;e.vz=(l.B.z-l.A.z)/l.len*z.sp*z.dir;l.tr.visible=true;l.tr.position.set(x,y+.05,zz);l.tr.rotation.y=Math.atan2(l.B.x-l.A.x,l.B.z-l.A.z);
 if(z.s>=1.0||z.s<=0)zipEnd(e)}
const _phys=phys;phys=function(e,dt){if(e.zip){if(e.hp<=0||over)e.zip=null;else{zipPhys(e,dt);return}}_phys(e,dt)};
function zipStep(dt,act){for(let i=ZIP.length-1;i>=0;i--){const l=ZIP[i];l.t-=dt;if(l.t<=0){killZip(l);ZIP.splice(i,1);continue}
  l.tr.visible=l.tr.visible&&(P.zip&&P.zip.ln===l||E.zip&&E.zip.ln===l);l.g.visible=l.t>2||Math.sin(T*16)>0;
  if(!act)continue;const f=P;f.zcd=Math.max(0,(f.zcd||0)-dt/Math.max(1,ZIP.length));
  if(!f.zip&&f.hp>0){const dA=Math.hypot(f.x-l.A.x,f.z-l.A.z),dB=Math.hypot(f.x-l.B.x,f.z-l.B.z);
   if(f.zlast===l){if(dA>2.6&&dB>2.6)f.zlast=null}   // you have to walk away from the post before it carries you again
   else if(f.zcd<=0){if(dA<1.3&&f.y<l.A.y-1.2)ride(f,l,1);else if(dB<1.3&&f.y<l.B.y-1.2)ride(f,l,-1)}}}
 if(P.zip&&k[' ']&&P.zip.s>0.05&&P.zip.s<.95){zipEnd(P);P.vy=6}}
// ================================================================== radar HUD and buff chips
let rc=null,rx=null,chips=null;const CH={};
function radarDraw(){const on=P.bf&&P.bf.radar&&P.bf.radar.t>0&&mode==='play'&&!over;
 if(!rc){if(!on)return;rc=document.createElement('canvas');rc.id='radar';rc.width=rc.height=300;(document.getElementById('hud')||document.body).appendChild(rc);rx=rc.getContext('2d')}
 rc.style.display=on?'block':'none';if(!on||!rx)return;
 const W=300,c=W/2,R=c-8,x=rx,range=36,k2=R/range;x.clearRect(0,0,W,W);
 x.save();x.beginPath();x.arc(c,c,R,0,7);x.clip();
 const bg=x.createRadialGradient(c,c,10,c,c,R);bg.addColorStop(0,'rgba(6,40,24,.88)');bg.addColorStop(1,'rgba(2,18,12,.92)');x.fillStyle=bg;x.fillRect(0,0,W,W);
 x.strokeStyle='rgba(80,255,150,.28)';x.lineWidth=1.5;for(let r=1;r<=3;r++){x.beginPath();x.arc(c,c,R*r/3,0,7);x.stroke()}
 x.beginPath();x.moveTo(c,c-R);x.lineTo(c,c+R);x.moveTo(c-R,c);x.lineTo(c+R,c);x.stroke();
 const cy_=Math.cos(yaw),sy=Math.sin(yaw),rxv=cy_,rzv=-sy,fx=-sy,fz=-cy_,toS=(wx,wz)=>{const dx=wx-P.x,dz=wz-P.z;return[c+(dx*rxv+dz*rzv)*k2,c-(dx*fx+dz*fz)*k2]};
 x.fillStyle='rgba(90,255,160,.2)';x.strokeStyle='rgba(120,255,180,.55)';x.lineWidth=1;
 for(const b of boxes){if(b.nb||b.h<.8)continue;const cx=(b.x1+b.x2)/2,cz=(b.z1+b.z2)/2;if(Math.hypot(cx-P.x,cz-P.z)>range+14)continue;
  const p=[toS(b.x1,b.z1),toS(b.x2,b.z1),toS(b.x2,b.z2),toS(b.x1,b.z2)];x.beginPath();x.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)x.lineTo(p[i][0],p[i][1]);x.closePath();x.fill();x.stroke()}
 // the sweep
 const a=T*2.2;x.save();x.translate(c,c);x.rotate(a);const sw=x.createLinearGradient(0,0,R,0);sw.addColorStop(0,'rgba(80,255,150,.0)');sw.addColorStop(1,'rgba(80,255,150,.5)');
 x.fillStyle=sw;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,-.55,0);x.closePath();x.fill();x.strokeStyle='rgba(160,255,200,.9)';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.lineTo(R,0);x.stroke();x.restore();
 // field of view
 x.fillStyle='rgba(255,255,255,.07)';x.beginPath();x.moveTo(c,c);x.arc(c,c,R,-PI/2-.62,-PI/2+.62);x.closePath();x.fill();
 // the enemy
 for(const Ev of(window.BRX?BRX.ents.filter(q=>q!==P):[E]))if(Ev.hp>0){let [ex,ey]=toS(Ev.x,Ev.z),dd=Math.hypot(ex-c,ey-c),edge=false;if(dd>R-10){ex=c+(ex-c)/dd*(R-10);ey=c+(ey-c)/dd*(R-10);edge=true}
  const pulse=1+.35*Math.sin(T*8);x.fillStyle='rgba(255,70,70,.28)';x.beginPath();x.arc(ex,ey,13*pulse,0,7);x.fill();x.fillStyle='#ff4545';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(ex,ey,7,0,7);x.fill();x.stroke();
  const dy=Ev.y-P.y;if(Math.abs(dy)>2){x.fillStyle='#fff';x.font='bold 16px Arial';x.textAlign='center';x.fillText(dy>0?'▲':'▼',ex,ey-12)}
  x.fillStyle='#d6ffe6';x.font='bold 15px Arial';x.textAlign='center';x.fillText(Math.round(Math.hypot(Ev.x-P.x,Ev.z-P.z))+' m',ex,ey+26)}
 // you
 x.fillStyle='#fff';x.beginPath();x.moveTo(c,c-9);x.lineTo(c+7,c+7);x.lineTo(c,c+3);x.lineTo(c-7,c+7);x.closePath();x.fill();
 x.restore();x.strokeStyle='#44ff88';x.lineWidth=5;x.beginPath();x.arc(c,c,R,0,7);x.stroke();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=2;x.beginPath();x.arc(c,c,R+3,0,7);x.stroke();
 x.fillStyle='#44ff88';x.font='bold 17px Arial';x.textAlign='center';x.fillText('RADAR '+Math.ceil(P.bf.radar.t)+'s',c,W-14)}
const CHIP={boots:'boots',soda:'soda',radar:'radar'};
function chipsDraw(){if(!chips){chips=document.createElement('div');chips.id='ibuf';(document.getElementById('hud')||document.body).appendChild(chips)}
 const act=[];if(mode==='play'){for(const k in CHIP){const b=P.bf&&P.bf[k];if(b&&b.t>0)act.push([k,b.t,b.T,DEF[k].n])}
  if(P.chug)act.push(['chug',P.chug.t,1.5,'Chug Brick']);const dc=DCY.find(d=>d.o===P);if(dc)act.push(['decoy',dc.t,8,'Decoy'])}
 for(const k in CH)if(!act.find(a=>a[0]===k)){chips.removeChild(CH[k].el);delete CH[k]}
 for(const [k,t,T0,nm] of act){let c=CH[k];if(!c){const el=document.createElement('div');el.className='ichip';el.style.setProperty('--rc',RAR[DEF[k].r].c);el.innerHTML='<img alt="" src="'+iconPic(k)+'"><div><b>'+nm+'</b><i><u></u></i></div><em></em>';chips.appendChild(el);c=CH[k]={el,u:el.querySelector('u'),t:el.querySelector('em')}}
  c.u.style.width=Math.max(0,Math.min(1,t/T0))*100+'%';c.t.textContent=Math.ceil(Math.max(0,t))+'s'}}
// ================================================================== the CPU
const has=(e,k)=>e.inv.indexOf(k);
function cpu(e,d,dir,at){const los=!blocked(e,P),hpf=e.hp/e.mx;
 const go=(k,dd)=>{const i=at(k);if(i<0)return false;BB.use(e,i,dd||dir);return true};
 if(hpf<.6&&!e.chug&&at('chug')>=0)return go('chug');
 if(e.ar<20&&at('patch')>=0)return go('patch');
 if(!(e.bf&&(e.bf.soda&&e.bf.soda.t>0||e.bf.boots&&e.bf.boots.t>0))&&(d>14||hpf<.45&&los)&&Math.random()<.5){if(at('soda')>=0)return go('soda');if(at('boots')>=0)return go('boots')}
 if(hpf<.5&&los&&d<22&&at('smoke')>=0&&Math.random()<.6){const dd=new V3(P.x-e.x,.9,P.z-e.z).normalize();return go('smoke',dd)}
 if(hpf<.55&&los&&d>5&&at('barr')>=0&&Math.random()<.6)return go('barr',new V3(P.x-e.x,0,P.z-e.z).normalize());
 if(d<20&&los&&!DCY.some(q=>q.o===e)&&at('decoy')>=0&&Math.random()<.4)return go('decoy');
 if(d>5&&d<18&&at('banana')>=0&&Math.random()<.35)return go('banana',new V3(P.x-e.x,.55,P.z-e.z).normalize());
 if(d<13&&d>3&&at('mine')>=0&&Math.random()<.35)return go('mine',new V3(P.x-e.x,0,P.z-e.z).normalize());
 return false}
// ================================================================== per frame
const _st=step;
step=function(dt){const play=mode==='play';if(play&&!over)decoyBullets(dt);
 _st(dt);
 const act=play&&!over&&introT<=0;
 for(const e of ENTS()){const m=mulOf(e);if(m>1)e.sx=(e.sx||1)*m}
 buffs(dt,act);flights(dt,act);smokeStep(dt);peelStep(dt,act);decoyStep(dt,act);padStep(dt,act);mineStep(dt,act);barStep(dt);zipStep(dt,act);
 veilStep();radarDraw();chipsDraw()};
const _rr=resetRound;
resetRound=function(i){_rr(i);
 THR.splice(0).forEach(q=>S.remove(q.m));SMK.splice(0).forEach(killSmoke);PEL.splice(0).forEach(q=>S.remove(q.m));DCY.splice(0).forEach(killDecoy);
 PAD.splice(0).forEach(q=>S.remove(q.g));MIN.splice(0).forEach(killMine);BAR.splice(0).forEach(killBar);ZIP.splice(0).forEach(l=>S.remove(l.g));
 for(const e of ENTS()){e.bf=null;e.chug=null;e.zip=null;e.zcd=0;e.bpc=0;e.slip=0;e.zlast=null}
 if(veil)veil.style.opacity=0};
window.ITEMS={def:DEF,rar:RAR,keys:KEYS,use,bot:cpu,peel:(x,z,o)=>peelAt(x,z,o||P),smokeAt:(x,z,o)=>smokeAt(x,z,0,o||P),model:k=>MODEL[k](),icon:iconPic,smokeCut,
 give:(e,k)=>{if(IT[k]&&e.inv.length<3){e.inv.push(k);return true}return false},
 state:()=>({smoke:SMK.length,peel:PEL.length,decoy:DCY.length,pad:PAD.length,mine:MIN.length,bar:BAR.length,zip:ZIP.length,flying:THR.length}),
 lists:{SMK,PEL,MIN,PAD,BAR,ZIP,DCY,THR}};
setTimeout(()=>{try{KEYS.forEach(iconPic)}catch(e){}},1800);
})();
