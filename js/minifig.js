/* Minifig builder v3: rounded LEGO body parts plus painted face and torso prints for each character, following the model sheets. */
(()=>{
const D=(a,b,c)=>new THREE.BoxGeometry(a,b,c),Y=(a,b,h,n=16)=>new THREE.CylinderGeometry(a,b,h,n),Sp=r=>new THREE.SphereGeometry(r,14,10),Co=(r,h,n=10)=>new THREE.ConeGeometry(r,h,n),Tr=(r,a)=>new THREE.TorusGeometry(r,.055,6,16,a||Math.PI*2);
const RBX=(w,h,d,r=.05)=>{const sh=new THREE.Shape(),x=w/2-r,y=h/2-r;sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:4});g.translate(0,0,-(d-2*r)/2);return g};
const TOR=(()=>{const s=new THREE.Shape();s.moveTo(-.44,-.39);s.lineTo(.44,-.39);s.lineTo(.41,.26);s.lineTo(.33,.39);s.lineTo(-.33,.39);s.lineTo(-.41,.26);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.43,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:4,curveSegments:4});g.translate(0,0,-.215);return g})();
const V2=a=>a.map(([x,y])=>new THREE.Vector2(x,y));
const BAR=new THREE.CylinderGeometry(.39,.39,.5,56,1,true),
 CAPT=new THREE.LatheGeometry(V2([[.39,.25],[.375,.272],[.34,.28],[.17,.28],[.17,.39],[.155,.415],[.12,.415],[.11,.37],[0,.37]]),56),
 CAPB=new THREE.LatheGeometry(V2([[0,-.28],[.34,-.28],[.375,-.272],[.39,-.25]]),56),
 CAPF=new THREE.LatheGeometry(V2([[.39,.25],[.378,.272],[.35,.282],[0,.282]]),56);
const HD=new THREE.CylinderGeometry(.402,.402,.5,28,1,true,Math.PI-.9,1.8),TP=new THREE.PlaneGeometry(.84,.76),NP2=new THREE.PlaneGeometry(.46,.46),NP=new THREE.PlaneGeometry(.88,.6);
// ---- canvas painting helpers
const rc=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)},pg=(x,c,p)=>{x.fillStyle=c;x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill()},
 ci=(x,c,a,b,r)=>{x.fillStyle=c;x.beginPath();x.arc(a,b,r,0,7);x.fill()},el=(x,c,a,b,rx,ry)=>{x.fillStyle=c;x.beginPath();x.ellipse(a,b,rx,ry,0,0,7);x.fill()},
 ln=(x,c,w,p)=>{x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke()},
 belt=x=>rc(x,'#151515',0,222,300,48);
const SP={
pepe:{s:0x44cb33,t:0x2e6bff,l:0x1e3a8a,hip:0x1e3a8a,sh:0x1a1a1a,
 hd:x=>{[104,216].forEach((a,i)=>{el(x,'#fff',a,100,42,30);el(x,'#111',a+(i?8:12),104,13,15);ci(x,'#fff',a+(i?11:15),98,4);rc(x,'#44cb33',a-46,64,92,28);ln(x,'#1f6e12',6,[[a-46,92],[a,88],[a+46,92]]);ln(x,'#2a8a18',4,[[a-40,136],[a,144],[a+40,136]]);ln(x,'#2a8a18',4,[[a-52,60],[a,50],[a+52,62]])});
 x.fillStyle='#e8392b';x.beginPath();x.moveTo(62,154);x.quadraticCurveTo(160,120,258,154);x.quadraticCurveTo(160,216,62,154);x.fill();ln(x,'#9a1c14',5,[[66,156],[160,148],[254,156]]);ln(x,'#2a8a18',5,[[54,146],[64,156]]);ln(x,'#2a8a18',5,[[266,146],[256,156]]);el(x,'#ff6a5c',160,184,52,8)},
 td:belt,x:()=>{}},
wojak:{s:0xffffff,t:0xbfbfbf,l:0x2e6bff,hip:0x2457d6,sh:0x1a1a1a,
 hd:x=>{[104,216].forEach(a=>{ln(x,'#1a1a1a',4,[[a-36,102],[a-12,90],[a+12,90],[a+36,102]]);ln(x,'#1a1a1a',3,[[a-32,108],[a,118],[a+32,108]]);el(x,'#111',a,103,12,9);ln(x,'#1a1a1a',3,[[a-40,76],[a-10,66],[a+34,74]]);ln(x,'#555',2,[[a-34,126],[a,132],[a+34,126]])});
 [34,46,58].forEach(y=>ln(x,'#555',2,[[84,y],[130,y-5],[190,y-3],[236,y]]));ln(x,'#1a1a1a',3,[[160,92],[152,134],[164,140]]);ln(x,'#1a1a1a',3,[[96,126],[90,158]]);ln(x,'#1a1a1a',3,[[224,126],[230,158]]);ln(x,'#1a1a1a',4,[[126,172],[160,167],[194,173]])},
 td:belt,x:()=>{}},
foreman:{s:0xffd500,t:0xff8c00,l:0x2e6bff,hip:0x2457d6,sh:0x1a1a1a,
 hd:x=>{[112,168].forEach(a=>{rc(x,'#fff',a,82,40,44);rc(x,'#000',a+8,90,22,30)})},
 td:x=>{rc(x,'#a7a7a7',58,0,34,222);rc(x,'#a7a7a7',208,0,34,222);rc(x,'#a7a7a7',34,160,232,40);[[58,0,58,222],[92,0,92,160],[208,0,208,160],[242,0,242,222]].forEach(([a,b,c,d])=>ln(x,'#111',3,[[a,b],[c,d]]));belt(x);rc(x,'#b8bec6',128,226,46,38);rc(x,'#111',139,236,24,18)},
 x:({add})=>{add(new THREE.SphereGeometry(.46,26,14,0,Math.PI*2,0,Math.PI/2),0xffd500,0,2.2,0);add(Y(.58,.58,.06,32),0xffd500,0,2.21,0);add(RBX(.7,.06,.3,.025),0xffd500,0,2.215,-.5);add(RBX(.14,.1,.5,.04),0xffd500,0,2.62,0)}},
jester:{s:0xffffff,t:0x1a1a1a,l:0x262626,hip:0x1a1a1a,sh:0x1a1a1a,h:0xffffff,
 hd:x=>{rc(x,'#000',118,86,28,30);rc(x,'#000',176,86,28,30)},
 td:x=>{[0,1,2,3,4].forEach(i=>pg(x,'#fff',[[i*60-10,0],[i*60+50,0],[i*60+20,46]]));[[75,'#4d4d4d'],[125,'#4d4d4d'],[175,'#fff'],[225,'#fff']].forEach(([a,c])=>pg(x,c,[[a,96],[a+24,140],[a,184],[a-24,140]]));[[100,'#fff'],[150,'#4d4d4d'],[200,'#fff']].forEach(([a,c])=>pg(x,c,[[a,128],[a+24,172],[a,216],[a-24,172]]));rc(x,'#1f1f1f',0,222,300,48)},
 x:({add})=>{add(Y(.5,.5,.06,30),0x1a1a1a,0,2.3,0);add(Y(.34,.32,.4,26),0x1a1a1a,0,2.5,0);
  // curved horns built from tapered segments so the bells stay attached; black on the viewer's left, white on the right
  const hn=(s,c)=>{const B=t=>{const u=1-t;return[u*u*s*.26+2*u*t*s*.62+t*t*s*.8,u*u*2.46+2*u*t*2.78+t*t*2.38]};let p=B(0);
   for(let i=0;i<8;i++){const q=B((i+1)/8),r0=.14-.08*i/8,r1=.14-.08*(i+1)/8,a=new THREE.Vector3(p[0],p[1],0),b=new THREE.Vector3(q[0],q[1],0),d=b.clone().sub(a),len=d.length();
    const m=add(Y(r1,r0,len,14),c,(a.x+b.x)/2,(a.y+b.y)/2,0);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());add(Sp(r1),c,b.x,b.y,0);p=q}
   add(Sp(.12),0xffffff,p[0],p[1]-.03,0)};
  hn(1,0x1a1a1a);hn(-1,0xffffff)}},
general:{s:0xffd500,t:0x556b2f,l:0x556b2f,hip:0x4a5f28,sh:0x1a1a1a,
 hd:x=>{[86,176].forEach(a=>{rc(x,'#fff',a,76,60,56);rc(x,'#000',a+16,86,34,38)})},
 td:x=>{ln(x,'#111',4,[[56,0],[132,100]]);ln(x,'#111',4,[[244,0],[168,100]]);pg(x,'#ff2d2d',[[138,4],[162,4],[160,36],[176,150],[150,178],[124,150],[140,36]]);rc(x,'#ff2d2d',214,66,12,44);rc(x,'#fff',226,66,12,44);rc(x,'#2e6bff',238,66,12,44);ci(x,'#d4af37',232,128,13);belt(x);rc(x,'#d4af37',128,226,44,36)},
 x:({add,body})=>{add(RBX(.8,.12,.76,.04),0x6b8e23,0,2.34,0);add(RBX(.96,.26,.88,.06),0x6b8e23,0,2.53,0);[-1,1].forEach(s=>body(D(.3,.05,.22),0xd4af37,s*.4,1.74,0))}},
nyan:{s:0xa0a0a0,t:0xf0d9a7,sl:0xa0a0a0,l:0xa0a0a0,hip:0x8a8a8a,sh:0x1a1a1a,box:1,
 hd:x=>{[84,230].forEach(a=>rc(x,'#000',a,60,46,70));[34,276].forEach(a=>rc(x,'#ff69b4',a,128,52,48));rc(x,'#000',164,124,32,22);rc(x,'#000',130,140,34,22);rc(x,'#000',196,140,34,22);rc(x,'#000',164,156,32,18)},
 td:x=>{rc(x,'#ff8ad6',30,28,240,214);[['#ff3b3b',80,60,-.3],['#ffd93b',150,86,.5],['#3b82f6',216,60,.2],['#3ad66b',64,150,.4],['#ffd93b',100,196,-.5],['#3b82f6',170,150,.8],['#ff3b3b',226,150,-.4],['#b366ff',216,200,.6]].forEach(([c,a,b,r])=>{x.save();x.translate(a,b);x.rotate(r);rc(x,c,-9,-14,18,28);x.restore()})},
 x:({add,body})=>{[-1,1].forEach(s=>{add(RBX(.28,.34,.16,.03),0xa0a0a0,s*.27,2.46,0);add(D(.15,.2,.02),0xffb3d9,s*.27,2.46,-.09)});
  }},
podcast:{s:0xffffff,t:0x0a0a0a,l:0x0a0a0a,hip:0x0a0a0a,sh:0x1a1a1a,h:0xffffff,
 hd:x=>{rc(x,'#000',112,92,38,38);rc(x,'#000',184,92,38,38)},
 td:x=>{ln(x,'#666',5,[[62,0],[62,44]]);ln(x,'#666',5,[[238,0],[238,44]]);rc(x,'#a0a0a0',128,54,44,88);[70,86,102,118].forEach(y=>rc(x,'#1a1a1a',128,y,44,3));x.strokeStyle='#a0a0a0';x.lineWidth=8;x.beginPath();x.arc(150,118,38,0,Math.PI);x.stroke();rc(x,'#a0a0a0',146,154,8,34);rc(x,'#a0a0a0',122,186,56,8);
  [[0,26],[1,44],[2,64],[3,38]].forEach(([i,h])=>{rc(x,'#a0a0a0',104-i*16,110-h/2,6,h);rc(x,'#a0a0a0',190+i*16,110-h/2,6,h)});belt(x)},
 x:({add})=>{add(new THREE.SphereGeometry(.44,22,12,0,Math.PI*2,0,Math.PI/2),0x1a1a1a,0,2.22,0);add(RBX(.78,.05,.55,.02),0x1a1a1a,0,2.22,-.5);
  [-1,1].forEach(s=>{add(Y(.2,.2,.14,18),0x000000,s*.44,2.0,0).rotation.z=1.57;add(Y(.14,.14,.16,18),0x6b6b6b,s*.5,2.0,0).rotation.z=1.57});add(Y(.02,.02,.42,6),0x000000,-.34,1.86,-.28).rotation.x=.9;add(Sp(.08),0x1a1a1a,-.2,1.82,-.42)}},
trader:{s:0xffffff,t:0xffffff,l:0x0b0b0b,hip:0x0b0b0b,sh:0x0b0b0b,h:0xffffff,cuff:0x0b0b0b,
 hd:x=>{[[84,84,64,44],[172,84,64,44]].forEach(([a,b,w,h])=>{x.strokeStyle='#000';x.lineWidth=8;x.strokeRect(a,b,w,h)});ln(x,'#000',8,[[148,100],[172,100]])},
 td:x=>{rc(x,'#0b0b0b',112,56,76,166);pg(x,'#fff',[[96,0],[150,0],[150,56]]);pg(x,'#fff',[[204,0],[150,0],[150,56]]);ln(x,'#0b0b0b',4,[[84,0],[120,84],[100,84]]);ln(x,'#0b0b0b',4,[[216,0],[180,84],[200,84]]);pg(x,'#000',[[138,10],[162,10],[168,50],[150,170],[132,50]]);[110,142,174].forEach(b=>ci(x,'#777',150,b,6));
  ci(x,'#fff',226,98,24);x.strokeStyle='#000';x.lineWidth=4;x.beginPath();x.arc(226,98,22,0,7);x.stroke();ln(x,'#000',3,[[226,80],[226,116]]);ln(x,'#000',3,[[210,92],[242,92]]);ln(x,'#000',3,[[210,106],[242,106]]);rc(x,'#999',206,136,40,4);rc(x,'#0b0b0b',0,222,300,48)},
 x:({add})=>{const pk=0xf2b6be,pd=0xe79aa6,ga=Math.PI*(3-Math.sqrt(5));
  // brain: two hemispheres (half-ellipsoids with flat bottoms) sitting exactly on the top of the head, with a fissure down the middle and bumpy folds
  const TOP=2.25;
  [-1,1].forEach(s=>{const A=.2,Bh=.3,Cd=.37,cx=s*.2,cy=TOP;
   add(new THREE.SphereGeometry(1,26,12,0,Math.PI*2,0,Math.PI/2),pk,cx,cy,0).scale.set(A,Bh,Cd);
   for(let n=0;n<34;n++){const t=(n+.5)/34,ct=1-.72*t,st=Math.sqrt(1-ct*ct),ph=n*ga+(s>0?0:1.3),r=.062+.012*(n%3);
    const x=cx+A*.93*st*Math.cos(ph),z=Cd*.93*st*Math.sin(ph),y=cy+Bh*.93*ct;add(Sp(r),n%2?pd:pk,x,Math.max(y,cy+r*.9),z)}});
  }},
giga:{s:0xf2f2f2,t:0xbfbfbf,l:0x1a1a1a,hip:0x1a1a1a,sh:0x1a1a1a,h:0x111111,
 hd:x=>{rc(x,'#000',86,76,66,16);rc(x,'#000',168,76,66,16);rc(x,'#000',96,96,40,36);rc(x,'#000',184,96,40,36);rc(x,'#000',70,138,180,84);rc(x,'#f2f2f2',122,152,76,20);rc(x,'#000',144,162,32,16)},
 td:x=>{const g='#6b6b6b';ln(x,g,7,[[150,66],[110,72],[70,60],[46,34]]);ln(x,g,7,[[150,66],[190,72],[230,60],[254,34]]);ln(x,g,6,[[150,66],[150,210]]);[110,146,182].forEach(b=>{ln(x,g,6,[[116,b],[146,b]]);ln(x,g,6,[[184,b],[154,b]])});ln(x,g,6,[[86,100],[70,200]]);ln(x,g,6,[[214,100],[230,200]]);belt(x)},
 x:({add})=>{add(RBX(.84,.14,.8,.04),0x000000,0,2.35,0);add(RBX(1,.24,.94,.09),0x000000,0,2.5,0);add(Y(.14,.14,.08,14),0x000000,0,2.65,0)}},
doge:{s:0xffd500,t:0xffd500,l:0xffd500,hip:0xe6bd00,sh:0x1a1a1a,h:0xffd500,
 hd:x=>{el(x,'#f7e1b0',160,152,128,78);ci(x,'#f7e1b0',160,70,32);ln(x,'#f7e1b0',26,[[160,40],[160,90]]);[104,216].forEach((a,i)=>{el(x,'#fff',a,98,24,28);el(x,'#000',a+(i?-6:6),100,14,20);ci(x,'#fff',a+(i?-10:2),93,4);ln(x,'#e0a800',6,[[a-26,64],[a,56],[a+26,62]])});
 el(x,'#000',160,126,23,15);el(x,'#444',156,121,8,4);ln(x,'#000',5,[[160,140],[160,154]]);ln(x,'#000',5,[[104,150],[130,178],[160,154]]);ln(x,'#000',5,[[216,150],[190,178],[160,154]]);[[128,138],[138,146],[132,152],[192,138],[182,146],[188,152]].forEach(([a,b])=>ci(x,'#c9a96a',a,b,2.5))},
 td:x=>{ci(x,'#8b5e3c',150,118,96);ci(x,'#d4af37',150,118,88);ci(x,'#8b5e3c',150,118,70);ci(x,'#d4af37',150,118,64);x.font='900 118px Arial Black,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#8b5e3c';x.strokeText('D',150,124);x.fillStyle='#f0c84a';x.fillText('D',150,124);belt(x)},
 x:({add})=>{[-1,1].forEach(s=>{add(Co(.19,.42,4),0xffd500,s*.27,2.47,0).rotation.y=.785;add(Co(.1,.28,4),0x8b5e3c,s*.27,2.45,-.06).rotation.y=.785})}}};
// ---- v4 faces: bigger, cleaner, closer to the model sheets (design space 320x222, box heads 360x250)
let SMX=null;const sm=(c,w,p)=>{const x=SMX;x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++){const mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;x.quadraticCurveTo(p[i][0],p[i][1],mx,my)}x.lineTo(p[p.length-1][0],p[p.length-1][1]);x.stroke()};
const FACE={
pepe:x=>{SMX=x;
 // Pepe from the model sheet: huge heavy-lidded eyes that merge in the middle, big black pupils with two glints looking to the side,
 // lid mounds, eye bags, and one wide flat red mouth with a split line.
 const G='#44cb33',DG='#2f9f22',DD='#1b6410';
 [[98,-1],[222,1]].forEach(([cx,o])=>{
  x.save();x.beginPath();x.ellipse(cx,106,68,47,0,0,7);x.clip();
  x.fillStyle='#fff';x.fillRect(cx-72,50,144,110);
  const px=cx+11,py=104;ci(x,'#0a0a0a',px,py,30);ci(x,'#fff',px+10,py-10,9);ci(x,'#fff',px-10,py+11,3.8);
  pg(x,G,[[cx+o*74,96],[cx+o*36,78],[cx-o*10,70],[cx-o*72,76],[cx-o*72,30],[cx+o*74,30]]);   // heavy lid covers the top of the eye
  x.restore();
  sm(DD,4.6,[[cx+o*76,97],[cx+o*36,77],[cx-o*10,69],[cx-o*70,76]]);                              // lid edge
  sm(DG,3.4,[[cx+o*66,68],[cx+o*30,47],[cx-o*10,40],[cx-o*58,52]]);                               // lid mound crease
  x.strokeStyle=DD;x.lineWidth=3.8;x.beginPath();x.ellipse(cx,106,68,47,0,.12,Math.PI-.12);x.stroke();                  // lower lid
  sm(DG,3,[[cx+o*60,134],[cx+o*30,158],[cx-o*8,163],[cx-o*44,156]]);                              // eye bag
 });
 sm(DG,3,[[150,148],[142,164],[124,178]]);sm(DG,3,[[170,148],[178,164],[196,178]]);                // cheek creases toward the mouth
 x.fillStyle='#e0452f';x.beginPath();x.moveTo(34,172);x.quadraticCurveTo(160,176,286,166);x.quadraticCurveTo(160,232,34,172);x.closePath();x.fill();
 x.strokeStyle='#8f2016';x.lineWidth=3.4;x.lineJoin='round';x.stroke();
 sm('#8f2016',3,[[50,177],[160,187],[270,175]]);                                                    // lip split
 el(x,'#f4725c',160,203,62,4.2);
 sm(DG,3,[[27,164],[34,172]]);sm(DG,3,[[293,158],[286,166]]);
},
wojak:x=>{SMX=x;
 // Wojak from the model sheet: thin black lines on a white face - forehead wrinkles, tired droopy brows, half-closed eyes with bags,
 // a long nose with a hook and a flat, slightly sad mouth.
 const K='#141414',Kt='#2a2a2a';
 sm(Kt,2.8,[[88,57],[120,52],[160,54],[190,55]]);sm(Kt,3,[[75,79],[122,69],[182,70],[242,78]]);       // forehead wrinkles
 sm(K,3.2,[[78,98],[102,91],[130,95]]);sm(K,3,[[84,107],[104,102],[128,105]]);                         // left brow + fold
 sm(K,3.2,[[190,97],[217,91],[248,98]]);sm(K,3,[[192,106],[216,102],[242,105]]);                       // right brow + fold
 sm(Kt,2.4,[[130,101],[137,110]]);sm(Kt,2.4,[[190,101],[194,110]]);                                    // marks beside the nose
 [[104,-1],[219,1]].forEach(([cx,s])=>{
  sm(K,4.6,[[cx-24,128],[cx-12,120],[cx+12,119],[cx+24,127]]);                                         // heavy upper lid
  el(x,K,cx-s*1,128.5,14,8.6);                                                                         // iris covers most of the eye
  ci(x,'#fff',cx-s*1+3,126,2.2);
  sm(K,2.6,[[cx-20,131],[cx,135],[cx+22,130]]);                                                        // lower lid
  sm(Kt,2.6,[[cx-17,143],[cx,147],[cx+17,144]]);sm(Kt,2.4,[[cx-14,149],[cx,152],[cx+13,150]]);        // bags
 });
 sm(K,3.6,[[152,142],[143,158],[136,173],[141,188],[159,192]]);sm(K,3,[[165,190],[171,191]]);          // long nose with a hook
 sm(K,3.8,[[120,212],[128,208],[190,207],[199,212]]);                                                  // flat sad mouth
},
foreman:x=>{[76,180].forEach(a=>{rc(x,'#fff',a,66,68,66);rc(x,'#000',a+32,74,30,50)});
 // bushy brows and a big handlebar mustache
 [[70,52,142,58],[178,58,250,52]].forEach(([a,b,c,d])=>ln(x,'#4a2a12',11,[[a,b],[c,d]]));
 x.fillStyle='#4a2a12';x.beginPath();x.moveTo(160,152);x.quadraticCurveTo(214,136,248,170);x.quadraticCurveTo(206,164,160,172);x.quadraticCurveTo(114,164,72,170);x.quadraticCurveTo(106,136,160,152);x.fill();
 ln(x,'#4a2a12',5,[[130,186],[160,192],[190,186]]);
},
jester:x=>{rc(x,'#000',86,66,44,46);rc(x,'#000',190,66,44,46);
 x.strokeStyle='#000';x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(160,88,92,.22*Math.PI,.78*Math.PI);x.stroke();
 [.26,.34,.42,.5,.58,.66,.74].forEach(a=>{const t=a*Math.PI;ln(x,'#000',4.5,[[160+Math.cos(t)*83,88+Math.sin(t)*83],[160+Math.cos(t)*101,88+Math.sin(t)*101]])});
 pg(x,'#4d4d4d',[[96,118],[106,132],[96,146],[86,132]]);
},
general:x=>{[76,180].forEach(a=>{rc(x,'#fff',a,64,68,64);rc(x,'#000',a+26,72,34,48)});
 ln(x,'#000',12,[[68,44],[142,62]]);ln(x,'#000',12,[[178,62],[252,44]]);
 ln(x,'#000',6,[[116,178],[204,178]]);
 // battle scar across the viewer's-left cheek
 ln(x,'#b3261e',6,[[78,128],[112,176]]);[[86,134,94,126],[94,144,102,136],[102,156,110,148]].forEach(([a,b,c,d])=>ln(x,'#b3261e',4,[[a,b],[c,d]]));
},
podcast:x=>{rc(x,'#000',82,94,54,56);rc(x,'#000',184,94,54,56)},
trader:x=>{
 const K='#000';
 x.strokeStyle=K;x.lineWidth=13;x.lineJoin='miter';
 x.strokeRect(46,92,92,58);x.strokeRect(182,92,92,58);
 rc(x,K,134,98,52,13);rc(x,K,16,98,34,13);rc(x,K,270,98,34,13);
},
nyan:x=>{
 rc(x,'#000',100,64,36,50);rc(x,'#000',224,64,36,50);
 rc(x,'#ff69b4',38,128,50,50);rc(x,'#ff69b4',272,128,50,50);
 [[0,0],[2,0],[4,0],[1,1],[3,1]].forEach(([c,r])=>rc(x,'#000',120+c*24,134+r*24,24,24));
}};
// ---- meme roster 2: Trollface, Stonks Guy, Tung Tung Tung Sahur, John Pork. Built from the model sheet: same painted-barrel head, printed torso and bolted-on parts as the rest.
// tapered ink stroke through bezier control points (2 = line, 3 = quadratic, 4 = cubic); width grows from w0 to wm in the middle and back to w1
const bez=(P,t)=>{let Q=P;while(Q.length>1){const R=[];for(let i=0;i<Q.length-1;i++)R.push([Q[i][0]+(Q[i+1][0]-Q[i][0])*t,Q[i][1]+(Q[i+1][1]-Q[i][1])*t]);Q=R}return Q[0]};
const ink=(x,c,P,w0,wm,w1)=>{const N=26,L=[],R=[];if(w1==null)w1=w0;if(wm==null)wm=Math.max(w0,w1);
 for(let i=0;i<=N;i++){const t=i/N,p=bez(P,t),q=bez(P,Math.min(1,t+.02)),o=bez(P,Math.max(0,t-.02));let dx=q[0]-o[0],dy=q[1]-o[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  const w=(t<.5?w0+(wm-w0)*Math.sin(t*Math.PI):w1+(wm-w1)*Math.sin(t*Math.PI))/2;L.push([p[0]-dy*w,p[1]+dx*w]);R.push([p[0]+dy*w,p[1]-dx*w])}
 x.fillStyle=c;x.beginPath();L.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));R.reverse().forEach(p=>x.lineTo(p[0],p[1]));x.closePath();x.fill();ci(x,c,P[0][0],P[0][1],w0/2);ci(x,c,P[P.length-1][0],P[P.length-1][1],w1/2)};
const a0=c=>{const n=parseInt(c.slice(1),16);return'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+',0)'};
const soft=(x,c,cx,cy,rx,ry,a)=>{x.save();x.translate(cx,cy);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,c);g.addColorStop(1,a0(c));x.globalAlpha=a==null?1:a;x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,7);x.fill();x.restore()};
// ---- the classic trollface, drawn in head design space (about 280 wide, centred near 162,112). Also used on the laptop sticker and by skins.
const drawTroll=(x,K,face)=>{K=K||'#0d0d0d';
 const TC=[[34,104],[100,136],[206,134],[300,84]],BC=[[34,104],[44,196],[206,218],[300,84]];
 const S1=[];for(let i=0;i<=240;i++){const t=i/240;S1.push([bez(TC,t),bez(BC,t)])}
 // y on the top and bottom edge of the grin at a given x
 const yy=(xq,k)=>{let best=1e9,y=0;for(const p of S1){const q=p[k];const d=Math.abs(q[0]-xq);if(d<best){best=d;y=q[1]}}return y};
 const zone=(xq,f)=>{const a=yy(xq,0),b=yy(xq,1);return[xq,a+(b-a)*f]};
 x.save();x.lineCap='round';x.lineJoin='round';
 // forehead creases: thin tapered arcs
 [[[66,40],[108,16],[150,28]],[[60,56],[104,30],[152,44]],[[76,26],[116,8],[152,16]]].forEach(P=>ink(x,'#2b2b2b',P,1,3.4,1));
 [[[176,24],[222,12],[264,32]],[[178,40],[226,24],[272,48]],[[186,10],[226,3],[256,16]]].forEach(P=>ink(x,'#2b2b2b',P,1,3.4,1));
 ink(x,'#3a3a3a',[[72,66],[112,48],[160,58]],1,3,1);ink(x,'#3a3a3a',[[176,56],[224,42],[270,56]],1,3,1);
 // eyes: white slivers under heavy black lids with small pupils
 [[[138,87,34,9,146],[[76,90],[96,56],[150,52],[182,76]],[[150,76],[112,82],[76,90]]],[[234,88,34,9,226],[[204,88],[214,56],[266,50],[300,74]],[[266,74],[232,80],[204,88]]]].forEach(([e,up,lo])=>{
  el(x,'#fff',e[0],e[1],e[2],e[3]);ci(x,K,e[4],e[1]+1,6.5);
  x.fillStyle=K;x.beginPath();x.moveTo(...up[0]);x.bezierCurveTo(...up[1],...up[2],...up[3]);x.bezierCurveTo(...lo[0],...lo[1],...lo[2]);x.closePath();x.fill();
  ink(x,K,[[e[0]-30,e[1]+10],[e[0],e[1]+15],[e[0]+30,e[1]+9]],1.5,3,1.5)});
 // nose and the crease from the right eye
 ink(x,K,[[154,98],[146,118],[172,124]],2.4,5,2.4);ink(x,K,[[176,122],[190,116],[196,106]],2,3.4,1.4);
 ink(x,K,[[218,98],[236,110],[212,134]],2,4.6,2);ink(x,'#333',[[160,86],[158,98]],1.2,2.4,1.2);
 // the grin: black outline, white teeth in two rows
 x.fillStyle=K;x.beginPath();S1.forEach((p,i)=>i?x.lineTo(p[0][0],p[0][1]):x.moveTo(p[0][0],p[0][1]));for(let i=S1.length-1;i>=0;i--)x.lineTo(S1[i][1][0],S1[i][1][1]);x.closePath();x.fill();
 const f0=.1,f1=.9,fm=.5,X0=46,X1=290,NX=48;
 const teeth=(fa,fb)=>{x.fillStyle='#f6f6f4';x.beginPath();for(let i=0;i<=NX;i++){const p=zone(X0+(X1-X0)*i/NX,fa);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])}for(let i=NX;i>=0;i--){const p=zone(X0+(X1-X0)*i/NX,fb);x.lineTo(p[0],p[1])}x.closePath();x.fill()};
 teeth(f0,fm-.03);teeth(fm+.03,f1);
 // tooth gaps: nearly vertical, a little different in each row
 for(let i=1;i<12;i++){const xq=X0+(X1-X0)*i/12,j=((i*37)%7-3)*1.1;ink(x,K,[zone(xq+j,f0-.02),zone(xq+j+2,fm-.02)],2,3.6,2);ink(x,K,[zone(xq-j+9,fm+.02),zone(xq-j+10,f1+.02)],2,3.2,2)}
 ink(x,K,[zone(X0-4,fm),zone((X0+X1)/2,fm),zone(X1+4,fm)],2.6,4,2.6);
 // shading in the grin corners and the cheek folds
 soft(x,'#000',62,114,28,16,.3);soft(x,'#000',284,90,18,24,.25);
 ink(x,K,[[32,106],[20,88],[32,72]],2,6,2);ink(x,K,[[302,84],[314,70],[306,52]],2,6,2);
 ink(x,K,[[22,76],[8,118],[36,168]],2,6.5,2);ink(x,K,[[316,52],[324,90],[306,136]],2,5.5,2);
 ink(x,'#222',[[118,214],[162,220],[208,212]],1.4,3.4,1.4);
 [[84,162],[94,172],[74,174],[246,196],[258,188]].forEach(([a,b])=>ci(x,'#444',a,b,1.1));
 x.restore()};
window.DRAWTROLL=(x,cx,cy,sc,k)=>{const s=(sc||1)*.72;x.save();x.translate(cx,cy);x.scale(s,s);x.translate(-162,-104);drawTroll(x,k&&k!=='#111'?k:'#0d0d0d');x.restore()};
// ---- wood: vertical grain with streaks, cracks and knots, painted into the rectangle x0,y0,W,H
const woodV=(x,x0,y0,W,H,seed,o)=>{let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 rc(x,o.base,x0,y0,W,H);
 for(let i=0;i<Math.round(W/18);i++){const cx=x0+r()*W,w=14+r()*46,g=x.createLinearGradient(cx-w,0,cx+w,0),lt=r()<.5;const cc=lt?o.light:o.dark;g.addColorStop(0,a0(cc));g.addColorStop(.5,cc);g.addColorStop(1,a0(cc));x.globalAlpha=lt?.32:.4;x.fillStyle=g;x.fillRect(cx-w,y0,w*2,H)}
 x.globalAlpha=1;x.lineCap='round';
 for(let i=0;i<o.n;i++){const px=x0+r()*W,len=H*(.18+r()*.8),py=y0+r()*(H-len),w=.7+r()*2.6,dk=r()<.58;x.strokeStyle=dk?o.dark:o.light;x.globalAlpha=(dk?.3:.38)+r()*.4;x.lineWidth=w;x.beginPath();x.moveTo(px,py);
  for(let k=1;k<=7;k++)x.lineTo(px+Math.sin(k*1.9+i*.7)*(1+r()*2.2),py+len*k/7);x.stroke()}
 x.globalAlpha=1;
 for(let i=0;i<Math.round(W/70)+1;i++){const px=x0+r()*W,py=y0+H*(.1+r()*.5),len=H*(.2+r()*.3);ink(x,o.crack,[[px,py],[px+(r()-.5)*8,py+len*.5],[px+(r()-.5)*10,py+len]],.8,2.6,.6)}
 for(let i=0;i<(o.knots||0);i++){const a=x0+W*(.12+r()*.76),b=y0+H*(.15+r()*.7);[14,10,6].forEach((rr,j)=>{x.strokeStyle=o.crack;x.globalAlpha=.55;x.lineWidth=2;x.beginPath();x.ellipse(a,b,rr*.8,rr*1.5,0,0,7);x.stroke()});x.globalAlpha=1;el(x,o.crack,a,b,2.6,4.6)}};
const WOOD={base:'#c8832c',dark:'#7a3f0d',light:'#eaa850',crack:'#4a2406',n:220,knots:2};
const WOODT={base:'#a8631e',dark:'#6a330a',light:'#d08a3c',crack:'#3d1c04',n:140,knots:2};
const WOODL={base:'#8f4d15',dark:'#5d2d08',light:'#b97330',crack:'#341802',n:60,knots:1};
// ---- the hoodie's hood: a collar ring round the neck and a bunched flap down the upper back (never over the head)
const hoodGear=({body,BS},c)=>{const t=body(new THREE.TorusGeometry(.27,.09,10,30),c,0,1.7,.03);t.rotation.x=Math.PI/2;t.scale.set(1/BS*1.1,1/BS*1.15,1/BS*.8);t.userData.hood=1;
 const f=body(new THREE.SphereGeometry(1,26,14),c,0,1.74,.3);f.scale.set(.42/BS,.2/BS,.15/BS);f.rotation.x=-.18;f.userData.hood=1;
 const m=body(new THREE.SphereGeometry(1,20,12),c,0,1.86,.24);m.scale.set(.2/BS,.12/BS,.1/BS);m.userData.hood=1;
 [-1,1].forEach(s=>{const b=body(new THREE.SphereGeometry(1,18,10),c,s*.32,1.7,.2);b.scale.set(.14/BS,.13/BS,.14/BS);b.userData.hood=1})};
SP.troll={s:0xffffff,t:0x141416,sl:0x141416,l:0x1b1b20,hip:0x101013,sh:0x0a0a0b,h:0xffffff,
 hd:x=>{},
 td:x=>{ // black hoodie: V neck over a white tee, white drawstrings with metal tips, kangaroo pocket, ribbed hem
  rc(x,'#141416',0,0,300,270);
  pg(x,'#f1f1f1',[[104,0],[196,0],[150,60]]);pg(x,'#16161a',[[116,0],[184,0],[150,44]]);
  ln(x,'#2c2c32',5,[[96,0],[150,66]]);ln(x,'#2c2c32',5,[[204,0],[150,66]]);
  [[128,-1],[172,1]].forEach(([a,s])=>{ln(x,'#e9e9ee',4.5,[[a,38],[a+s*2,128]]);x.fillStyle='#b8bcc6';x.fillRect(a+s*2-3,126,6,14)});
  ln(x,'#34343a',3,[[66,160],[84,150],[216,150],[234,160]]);ln(x,'#34343a',3.4,[[66,160],[58,214]]);ln(x,'#34343a',3.4,[[234,160],[242,214]]);
  ln(x,'#2a2a30',2.4,[[90,150],[100,210]]);ln(x,'#2a2a30',2.4,[[210,150],[200,210]]);ln(x,'#34343a',3,[[96,214],[204,214]]);
  ln(x,'#26262c',2,[[70,40],[60,120]]);ln(x,'#26262c',2,[[230,40],[240,120]]);
  rc(x,'#101013',0,222,300,48);ln(x,'#5b5b64',3,[[0,226],[300,226]]);for(let i=0;i<30;i++)ln(x,'#1b1b20',2,[[i*10+4,230],[i*10+4,268]])},
 tb:x=>{rc(x,'#141416',0,0,300,270);ln(x,'#26262c',2.4,[[150,40],[150,222]]);ln(x,'#26262c',2,[[60,60],[70,200]]);ln(x,'#26262c',2,[[240,60],[230,200]]);rc(x,'#101013',0,222,300,48);ln(x,'#4a4a52',3,[[0,226],[300,226]])},
 x:(a)=>{const{body,part,la,RBX,BS}=a;hoodGear(a,0x141416);}};
window.TROLLSTK=(()=>{let T=null;return()=>T||(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');ci(x,'#fff',128,128,126);x.save();x.beginPath();x.arc(128,128,122,0,7);x.clip();window.DRAWTROLL(x,128,124,.9);x.restore();T=new THREE.CanvasTexture(c);return T})()})();
SP.stonks={s:0xe2b88e,t:0x17181c,sl:0x17181c,l:0x1a1b1f,hip:0x0e0f12,sh:0x0b0b0c,h:0xf0dcc4,
 hd:x=>{},
 td:x=>{ // black suit, white shirt, blue tie, lapels, pocket flaps and buttons
  rc(x,'#17181c',0,0,300,270);
  pg(x,'#f6f6f4',[[108,0],[192,0],[150,92]]);ln(x,'#d4d4d8',2.4,[[122,4],[150,40]]);ln(x,'#d4d4d8',2.4,[[178,4],[150,40]]);
  pg(x,'#101114',[[60,0],[108,0],[150,102],[140,136],[100,70]]);pg(x,'#101114',[[240,0],[192,0],[150,102],[160,136],[200,70]]);
  ln(x,'#34363e',3,[[108,0],[148,98]]);ln(x,'#34363e',3,[[192,0],[152,98]]);ln(x,'#2a2c33',2.6,[[104,70],[140,134]]);ln(x,'#2a2c33',2.6,[[196,70],[160,134]]);
  pg(x,'#1763c9',[[139,10],[161,10],[158,34],[142,34]]);pg(x,'#1763c9',[[143,34],[157,34],[168,142],[150,184],[132,142]]);
  pg(x,'#0f4a9e',[[150,36],[157,34],[168,142],[150,184]]);ln(x,'#4a8ae0',2,[[145,40],[138,138]]);
  ln(x,'#2c2e36',2.4,[[150,134],[150,222]]);[160,184,206].forEach(y=>ci(x,'#07080a',150,y,4.4));
  [[78,172,-1],[222,172,1]].forEach(([a,b,s])=>{ln(x,'#2f3138',3,[[a-s*22,b],[a+s*22,b+4]]);ln(x,'#2f3138',3,[[a-s*22,b],[a-s*20,b+44]]);ln(x,'#2f3138',3,[[a+s*22,b+4],[a+s*22,b+48]]);ln(x,'#2a2c33',2.4,[[a-s*20,b+44],[a+s*22,b+48]])});
  rc(x,'#f1f1f1',208,84,32,5);ln(x,'#2a2c33',2.4,[[206,92],[242,92]]);
  rc(x,'#0f1013',0,222,300,48);ln(x,'#2a2c33',3,[[0,226],[300,226]]);ci(x,'#6b6d75',150,246,5)},
 tb:x=>{rc(x,'#17181c',0,0,300,270);ln(x,'#2a2c33',2.6,[[150,30],[150,222]]);ln(x,'#2a2c33',2.2,[[96,0],[110,170]]);ln(x,'#2a2c33',2.2,[[204,0],[190,170]]);ln(x,'#2a2c33',2.4,[[150,150],[150,222]]);rc(x,'#0f1013',0,222,300,48);ln(x,'#2a2c33',3,[[0,226],[300,226]])},
 x:()=>{}};
window.STONKSARR=(()=>{let T=null;return()=>T||(()=>{const c=document.createElement('canvas');c.width=256;c.height=200;const x=c.getContext('2d');rc(x,'#0f1a12',16,16,224,168);x.strokeStyle='#20c05a';x.lineWidth=6;x.strokeRect(16,16,224,168);
  x.strokeStyle='#2fe070';x.fillStyle='#2fe070';x.lineWidth=18;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(48,148);x.lineTo(104,100);x.lineTo(140,124);x.lineTo(190,66);x.stroke();
  x.beginPath();x.moveTo(214,44);x.lineTo(214,96);x.lineTo(160,72);x.closePath();x.fill();T=new THREE.CanvasTexture(c);return T})()})();
SP.sahur={s:0xc8832c,t:0xa8631e,sl:0x8a4a12,l:0x8f4d15,hip:0x6e3a0f,sh:0x5a2d08,h:0xe3952f,hh:1.9,
 hd:x=>{},
 td:x=>{woodV(x,0,0,300,222,77,WOODT);ln(x,'#4a2406',3.4,[[150,0],[150,222]]);ln(x,'#4a2406',2.4,[[78,0],[74,222]]);ln(x,'#4a2406',2.4,[[222,0],[226,222]]);
  rc(x,'#6a3410',0,222,300,48);woodV(x,0,222,300,48,19,{base:'#6a3410',dark:'#3c1c06',light:'#8a5018',crack:'#2a1204',n:60,knots:0});ln(x,'#2a1204',3,[[0,224],[300,224]]);[1,2,3,4,5].forEach(i=>ln(x,'#2a1204',2.4,[[i*50,224],[i*50-2,270]]))},
 tb:x=>{woodV(x,0,0,300,222,91,WOODT);ln(x,'#4a2406',3.4,[[150,0],[150,222]]);ln(x,'#4a2406',2.4,[[100,0],[96,222]]);ln(x,'#4a2406',2.4,[[200,0],[204,222]]);
  woodV(x,0,222,300,48,23,{base:'#6a3410',dark:'#3c1c06',light:'#8a5018',crack:'#2a1204',n:60,knots:0});ln(x,'#2a1204',3,[[0,224],[300,224]])},
 ld:x=>{woodV(x,0,0,128,128,41,WOODL);ln(x,'#341802',2.6,[[64,0],[62,128]])},
 x:({add,body,part,RBX,D,Y,Sp,Co})=>{
  // flat log top with bark rings; the tall log head is built in mini()
  [.36,.26,.15].forEach((r,j)=>{const t=add(new THREE.TorusGeometry(r,.011,6,36),0x7a3f0d,0,2.742,0);t.rotation.x=Math.PI/2});
  // carved nose, pointing forward
  const n=add(Co(.075,.22,10),0xc8832c,0,2.15,-.47);n.rotation.x=-Math.PI/2;
  const nb=add(Sp(.075),0xc8832c,0,2.17,-.4);nb.scale.set(1,1.1,.8);
  }};
SP.pork={s:0xf7a0c0,t:0x131316,sl:0x131316,l:0x1b1b20,hip:0x0e0e11,sh:0x0a0a0c,h:0xf7a0c0,
 hd:x=>{},
 td:x=>{ // black hoodie, white drawstrings, JOHN PORK across the chest, kangaroo pocket
  rc(x,'#131316',0,0,300,270);
  pg(x,'#1d1d22',[[96,0],[204,0],[150,64]]);pg(x,'#0c0c0e',[[116,0],[184,0],[150,42]]);ln(x,'#2d2d34',4,[[92,0],[150,68]]);ln(x,'#2d2d34',4,[[208,0],[150,68]]);
  [[126,-1],[174,1]].forEach(([a,s])=>{ln(x,'#ececf0',4,[[a,40],[a+s*2,120]]);x.fillStyle='#b8bcc6';x.fillRect(a+s*2-3,118,6,14)});
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f4f4f6';x.font='700 62px Impact,Arial Narrow,Arial Black,sans-serif';
  x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=2;x.fillText('JOHN',150,104);x.fillText('PORK',150,164);x.shadowBlur=0;
  ln(x,'#34343a',3,[[64,186],[84,176],[216,176],[236,186]]);ln(x,'#34343a',3.4,[[64,186],[56,222]]);ln(x,'#34343a',3.4,[[236,186],[244,222]]);
  rc(x,'#0f0f12',0,222,300,48);ln(x,'#4a4a52',3,[[0,226],[300,226]]);for(let i=0;i<30;i++)ln(x,'#1b1b20',2,[[i*10+4,230],[i*10+4,268]])},
 tb:x=>{rc(x,'#131316',0,0,300,270);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f4f4f6';x.font='700 62px Impact,Arial Narrow,Arial Black,sans-serif';x.fillText('JOHN',150,104);x.fillText('PORK',150,164);
  ln(x,'#2a2a30',2.4,[[150,170],[150,222]]);rc(x,'#0f0f12',0,222,300,48);ln(x,'#4a4a52',3,[[0,226],[300,226]])},
 x:(a)=>{const{add,body,Y,Sp,Co}=a;hoodGear(a,0x131316);
  const PK=0xf7a0c0,PD=0xe0708f,PL=0xfbb8d0;
  // snout: a short fat tube with a darker rim and two tall nostrils, in front of the face
  const sn=add(Y(.13,.145,.13,26),PK,0,1.962,-.43);sn.rotation.x=Math.PI/2;
  const rm=add(new THREE.TorusGeometry(.13,.026,8,26),PL,0,1.962,-.5);
  const fc=add(Y(.12,.12,.02,26),0xf08bb0,0,1.962,-.495);fc.rotation.x=Math.PI/2;
  [-1,1].forEach(s=>{const n=add(Sp(.03),0x5a1f30,s*.048,1.965,-.512);n.scale.set(.8,1.5,.45)});
  // ears: flat triangles on top, tipped outward, darker inside
  [-1,1].forEach(s=>{const e=add(Co(.19,.3,3),PK,s*.27,2.33,-.04);e.rotation.set(-.1,0,-s*.5);e.scale.set(1,1,.42);
   const i=add(Co(.12,.2,3),PD,s*.27,2.32,-.075);i.rotation.set(-.1,0,-s*.5);i.scale.set(1,1,.3)});
  // headphones: slim band over the head and thick cups with a dark pad outside and a grey cap
  const band=add(new THREE.TorusGeometry(.5,.034,10,36,Math.PI),0x16161a,0,2.0,0.02);band.scale.set(.93,.74,1);
  [-1,1].forEach(s=>{const c=add(Y(.215,.215,.17,26),0x121216,s*.46,2.0,0.02);c.rotation.z=Math.PI/2;
   const p=add(Y(.175,.175,.05,26),0x2c2c33,s*.55,2.0,0.02);p.rotation.z=Math.PI/2;
   const k=add(new THREE.TorusGeometry(.2,.026,8,26),0x1b1b20,s*.395,2.0,0.02);k.rotation.y=Math.PI/2;
   const y=add(Y(.03,.03,.1,10),0x2c2c33,s*.46,2.2,0.02);y.rotation.z=0})}};
// face paintings. Head texture design space is 320x222 (x 160 = straight ahead); the tall log head uses 320 x 222*hh
FACE.troll=x=>{x.save();x.translate(2,2);drawTroll(x);x.restore()};
FACE.stonks=x=>{SMX=x;const cx=176,B='#2a1a12',SK='#b98a5e';
 // a slightly turned, calm face: thin arched brows, almond eyes looking to the side, a long nose and a small smile
 soft(x,'#fff1da',110,44,120,50,.28);soft(x,'#c99668',300,150,70,90,.16);
 soft(x,'#c79a6c',cx-34,100,34,12,.35);soft(x,'#c79a6c',cx+34,100,34,12,.35);
 ink(x,'#3a2418',[[cx-66,80],[cx-34,64],[cx-4,74]],1.6,5.6,3);ink(x,'#3a2418',[[cx+8,74],[cx+38,62],[cx+68,76]],3,5.6,1.6);
 [[cx-34,-1],[cx+36,1]].forEach(([a,o],i)=>{
  x.save();x.beginPath();x.moveTo(a-30,98);x.quadraticCurveTo(a,78,a+30,96);x.quadraticCurveTo(a,114,a-30,98);x.closePath();x.clip();
  x.fillStyle='#fbfaf4';x.fillRect(a-32,76,64,42);ci(x,'#2a1c16',a-9+(i?2:0),97,13);ci(x,'#07070a',a-9+(i?2:0),97,7);ci(x,'#fff',a-13+(i?2:0),93,3);
  soft(x,'#8c5a3a',a,82,32,10,.5);x.restore();
  ink(x,'#2a1810',[[a-31,99],[a-4,76],[a+31,97]],1.6,3.8,1.6);ink(x,'#a8764c',[[a-24,106],[a,115],[a+26,105]],1,2,1)});
 // nose: long bridge, shaded side, rounded tip and nostril wing
 soft(x,'#c28b5c',cx+10,126,10,34,.55);ink(x,'#b27a50',[[cx-1,92],[cx-3,126],[cx-10,146]],1.5,4,2.5);
 ink(x,'#8e5a38',[[cx-16,148],[cx-4,155],[cx+12,150]],2,3.8,2);ink(x,'#a8704a',[[cx+14,138],[cx+19,148],[cx+10,153]],1.4,2.6,1.4);ci(x,'#7a4a30',cx-6,152,2.6);ci(x,'#7a4a30',cx+8,151,2.4);
 // mouth and chin
 soft(x,'#a8704a',cx+2,178,26,8,.45);
 ink(x,'#6a2e24',[[cx-30,171],[cx-6,181],[cx+34,168]],1.4,4.2,2);ink(x,'#8a4a3a',[[cx-26,166],[cx-34,168]],1,2,1);
 ink(x,'#b88a60',[[cx-18,196],[cx+2,201],[cx+22,195]],1,2,1)};
const WOODH=Object.assign({},WOOD,{n:230,knots:3});
FACE.sahur=x=>{SMX=x;const H=222*1.9;x.save();woodV(x,-400,0,1120,H,31,WOODH);
 // lighter belt of wood near the top and the bottom for a rounded look
 soft(x,'#fff2c8',160,60,260,90,.18);soft(x,'#000',160,H,380,60,.25);
 // brow ridges
 [[-1,160-82],[1,160+82]].forEach(([s,ex])=>{ink(x,'#5e2e08',[[ex-s*62,112],[ex,86],[ex+s*60,106]],2,9,3);ink(x,'#e8a850',[[ex-s*54,102],[ex,78],[ex+s*52,98]],1,4,1)});
 // big round eyes
 [[160-84,1],[160+84,-1]].forEach(([ex,s])=>{const ey=168;ci(x,'#4a2406',ex,ey,72);ci(x,'#ffffff',ex,ey,66);soft(x,'#bbb',ex,ey-44,60,18,.45);
  ci(x,'#0b0b0d',ex+s*8,ey+6,34);ci(x,'#2b2b33',ex+s*8,ey+6,28);ci(x,'#0b0b0d',ex+s*8,ey+6,24);ci(x,'#fff',ex+s*8-12,ey-8,10);ci(x,'#fff',ex+s*8+9,ey+15,4.4)});
 // nose shading (the nose itself is a cone)
 soft(x,'#4a2406',160,246,26,16,.4);
 // wide open smile: dark mouth, white teeth along the top, and a tongue
 const mt=t=>bez([[56,312],[110,372],[210,372],[264,310]],t),mb=t=>bez([[56,312],[110,318],[210,318],[264,310]],t);
 x.fillStyle='#2a0e06';x.beginPath();for(let i=0;i<=30;i++){const p=mt(i/30);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])}for(let i=30;i>=0;i--){const p=mb(i/30);x.lineTo(p[0],p[1])}x.closePath();x.fill();
 x.save();x.beginPath();for(let i=0;i<=30;i++){const p=mt(i/30);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])}for(let i=30;i>=0;i--){const p=mb(i/30);x.lineTo(p[0],p[1])}x.closePath();x.clip();
 x.fillStyle='#f6f2e8';x.beginPath();x.moveTo(56,312);x.bezierCurveTo(110,318,210,318,264,310);x.lineTo(264,328);x.bezierCurveTo(210,336,110,336,56,330);x.closePath();x.fill();
 for(let i=1;i<9;i++)ln(x,'#8a6a4a',1.8,[[56+i*26,318],[56+i*26,336]]);
 el(x,'#b8453a',160,364,56,16);x.restore();
 ink(x,'#4a1a0c',[[50,306],[110,364],[210,364],[270,304]],2,5,2);ink(x,'#8a4a14',[[44,296],[52,312]],1,3.4,1);ink(x,'#8a4a14',[[276,294],[268,310]],1,3.4,1);
 ink(x,'#5e2e08',[[80,262],[70,300]],1,3,1);ink(x,'#5e2e08',[[240,262],[250,300]],1,3,1);
 x.restore()};
FACE.pork=x=>{SMX=x;const K='#0d0809';
 soft(x,'#fff0f6',120,40,120,60,.35);soft(x,'#d9708f',290,160,80,90,.22);
 // cheek blush and a few forehead creases
 [[54,120],[266,120]].forEach(([a,b])=>soft(x,'#f06a96',a,b,28,20,.38));
 ink(x,'#e0789c',[[100,20],[132,14],[160,18]],1,3,1);ink(x,'#e0789c',[[168,18],[200,14],[232,22]],1,3,1);
 // small round black eyes with glints and soft lids
 [[100,1],[220,-1]].forEach(([a,s])=>{soft(x,'#e0789c',a,44,22,8,.5);ci(x,K,a,64,10.5);ci(x,'#fff',a+s*3-3,60,3.4);ink(x,'#c8587c',[[a-18,44],[a,36],[a+18,44]],1,3,1)});
 // a wide soft smile under the snout, with dimples
 ink(x,K,[[120,194],[160,212],[204,192]],2,5,2.6);ink(x,K,[[210,192],[220,182]],1,3,1);ink(x,K,[[114,196],[106,184]],1,3,1);
 ink(x,'#d9708f',[[72,150],[80,164]],1,2.4,1);ink(x,'#d9708f',[[248,150],[240,164]],1,2.4,1);
 [[62,90],[258,96],[88,30],[236,36]].forEach(([a,b])=>ci(x,'#e58aa8',a,b,1.5))};
for(const id in FACE)SP[id].hd=FACE[id];

for(const id in SP)LOOK[id].v=SP[id];
const TEX={},tex=(k,w,h,f)=>TEX[k]||(TEX[k]=(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),c);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t})());
const css=n=>'#'+n.toString(16).padStart(6,'0');
const dm=t=>new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
const PMc={},PMAT=c=>PMc[c]||(PMc[c]=new THREE.MeshPhysicalMaterial({color:c,roughness:.3,metalness:0,clearcoat:.85,clearcoatRoughness:.12,envMapIntensity:.7}));
const BS=.9; // body scale; the head keeps its own smaller scale so it stays in proportion
const TS=.9,DY=-(.78*(1-TS)+.0),SHX=.575*TS; // torso is a touch smaller; legs/hip stay put, everything above the hip drops by DY
window.BODY={TS,DY,SHX,SHY:1.62+DY};
mini=function(L){const V=L.v,g=new THREE.Group(),bg=new THREE.Group();bg.scale.setScalar(BS);g.add(bg);const add=(geo,c,x,y,z,p=bg)=>{const m=new THREE.Mesh(geo,PMAT(c));m.position.set(x,y,z);m.castShadow=true;m.userData.sh=1;p.add(m);return m};
 // legs: hip bottom 0.62, leg 0.46, shoe 0.16 stacked with no overlap
 const lg=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.235,.62,0);bg.add(p);add(RBX(.46,.46,.5,.05),V.l,0,-.23,0,p);add(RBX(.47,.16,.6,.04),V.sh,0,-.54,-.05,p);return p});
 add(RBX(.94,.2,.55,.05),V.hip,0,.72,0);add(TOR,V.t,0,.88+.39*TS,0).scale.setScalar(TS);
 const AC=V.sl||V.t,arm=(s,bend)=>{const p=new THREE.Group();p.position.set(s*SHX,1.62+DY,0);p.rotation.z=s*.08;bg.add(p);
  add(Sp(.17),AC,0,0,0,p);add(Y(.17,.15,.4,24),AC,0,-.2,0,p);
  const f=new THREE.Group();f.position.y=-.4;f.rotation.x=bend;p.add(f);
  add(Sp(.15),AC,0,0,0,f);add(Y(.15,.14,.34,24),AC,0,-.17,0,f);
  if(V.cuff){add(Y(.158,.158,.035,20),V.cuff,0,-.2,0,f);add(Y(.152,.152,.035,20),V.cuff,0,-.28,0,f)}
  add(Y(.1,.1,.16,14),V.h||V.s,0,-.42,0,f);add(new THREE.TorusGeometry(.115,.07,10,24,4.9),V.h||V.s,0,-.52,0,f).rotation.set(0,0,s>0?.68:3.82);p.fa=f;return p};
 const la=arm(-1,.45),ra=arm(1,.35),fa=ra.fa;
 // everything above the neck lives in one group, scaled down so the head is in proportion with the body
 const HS=.8,hg=new THREE.Group();hg.position.set(0,(1.7+DY)*BS,0);hg.scale.setScalar(HS);g.add(hg);const ah=(geo,c,x,y,z)=>add(geo,c,x,y-1.7,z,hg);
 add(Y(.27,.3,.26,24),V.t,0,-.04,0,hg); // neck: the head stands .05 above the torso top, this fills it (it rides on the head group so it turns with the head)
 if(V.box){ah(RBX(.9,.62,.8,.05),V.s,0,2,0);ah(Y(.12,.12,.1,12),V.s,0,2.36,0);
  const m=new THREE.Mesh(NP,dm(tex(L.nm+'h',360,250,V.hd)));m.position.set(0,.3,-.408);m.rotation.y=Math.PI;m.userData.sh=1;hg.add(m)}
 else{const hh=V.hh||1,TH2=Math.round(416*hh),T=tex(L.nm+'h',2048,TH2,(x,c)=>{x.fillStyle=css(V.s);x.fillRect(0,0,2048,TH2);x.save();x.translate(1024,TH2/2);x.scale(1.88,1.88);x.translate(-160,-111*hh);V.hd(x);x.restore()});
  // hh > 1 stretches the barrel upwards into a tall log head (flat top, no stud); the bottom stays on the neck
  const b=new THREE.Mesh(hh>1?new THREE.CylinderGeometry(.39,.39,.5*hh,56,1,true):BAR,new THREE.MeshStandardMaterial({map:T,roughness:.22,metalness:0,envMapIntensity:.6}));b.position.y=.05+.25*hh;b.castShadow=true;b.userData.sh=1;hg.add(b);
  ah(hh>1?CAPF:CAPT,V.s,0,2+.5*(hh-1),0);ah(CAPB,V.s,0,2,0)}
 const tt=new THREE.Mesh(TP,dm(tex(L.nm+'t',300,270,V.td)));tt.position.set(0,.88+.39*TS,-.285*TS);tt.scale.setScalar(TS);tt.rotation.y=Math.PI;tt.userData.sh=1;bg.add(tt);
 if(V.tb){const tb=new THREE.Mesh(TP,dm(tex(L.nm+'tb',300,270,V.tb)));tb.position.set(0,.88+.39*TS,.285*TS);tb.scale.setScalar(TS);tb.userData.sh=1;bg.add(tb)}
 if(V.ld)lg.forEach(p=>{const m=new THREE.Mesh(NP2,dm(tex(L.nm+'ld',128,128,V.ld)));m.position.set(0,-.23,-.256);m.rotation.y=Math.PI;m.userData.sh=1;p.add(m)});
 V.x({add:ah,body:(geo,c,x,y,z)=>{const m=add(geo,c,x*TS,y+DY,z);m.scale.setScalar(1/BS);return m},part:add,la,ra,BS,TS,DY,RBX,D,Y,Sp,Co,Tr});
 const aim=new THREE.Group();bg.add(aim);const gun=new THREE.Group();aim.add(gun);const ham=new THREE.Group();fa.add(ham);ham.position.y=.4;ham.visible=false;
 add(D(.12,1.2,.12),0x8b5a2b,0,-.9,0,ham);add(D(.16,.1,.16),0xffd02f,0,-.45,0,ham);add(D(.16,.1,.16),0xffd02f,0,-1.1,0,ham);add(RBX(1,.5,.55,.05),0x9aa0a6,0,-1.55,0,ham);add(RBX(.14,.56,.6,.04),0xe3000b,-.6,-1.55,0,ham);add(RBX(.14,.56,.6,.04),0xe3000b,.6,-1.55,0,ham);add(RBX(.3,.3,.3,.04),0x6e747a,0,-1.9,0,ham);
 const bub=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.3}));bub.position.y=1.2;bub.visible=false;bub.userData.sh=1;g.add(bub);
 return{g,bg,hg,hy:hg.position.y,ra,fa,gun,ham,bub,lg,la,aim}};
skin(P,P.id);skin(E,E.id);
window.WOODV=woodV;
})();
