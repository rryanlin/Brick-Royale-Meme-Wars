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
 CAPB=new THREE.LatheGeometry(V2([[0,-.28],[.34,-.28],[.375,-.272],[.39,-.25]]),56);
const HD=new THREE.CylinderGeometry(.402,.402,.5,28,1,true,Math.PI-.9,1.8),TP=new THREE.PlaneGeometry(.84,.76),NP=new THREE.PlaneGeometry(.88,.6);
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
  ['#ff3b3b','#ff8c1a','#ffd93b','#3ad66b','#3b82f6','#b366ff'].forEach((c,i)=>[0,1,2,3,4,5,6,7].forEach(k=>{const w=.3-k*.018;body(RBX(w,.1,.19,.02),parseInt(c.slice(1),16),0,1.5-i*.1+k*.028+Math.sin(k*.9)*.03,.36+k*.15)}))}},
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
 if(V.box){ah(RBX(.9,.62,.8,.05),V.s,0,2,0);ah(Y(.12,.12,.1,12),V.s,0,2.36,0);
  const m=new THREE.Mesh(NP,dm(tex(L.nm+'h',360,250,V.hd)));m.position.set(0,.3,-.408);m.rotation.y=Math.PI;m.userData.sh=1;hg.add(m)}
 else{const T=tex(L.nm+'h',2048,416,(x,c)=>{x.fillStyle=css(V.s);x.fillRect(0,0,2048,416);x.save();x.translate(1024,208);x.scale(1.88,1.88);x.translate(-160,-111);V.hd(x);x.restore()});
  const b=new THREE.Mesh(BAR,new THREE.MeshStandardMaterial({map:T,roughness:.22,metalness:0,envMapIntensity:.6}));b.position.y=.3;b.castShadow=true;b.userData.sh=1;hg.add(b);
  ah(CAPT,V.s,0,2,0);ah(CAPB,V.s,0,2,0)}
 const tt=new THREE.Mesh(TP,dm(tex(L.nm+'t',300,270,V.td)));tt.position.set(0,.88+.39*TS,-.285*TS);tt.scale.setScalar(TS);tt.rotation.y=Math.PI;tt.userData.sh=1;bg.add(tt);
 V.x({add:ah,body:(geo,c,x,y,z)=>{const m=add(geo,c,x*TS,y+DY,z);m.scale.setScalar(1/BS);return m},RBX,D,Y,Sp,Co,Tr});
 const aim=new THREE.Group();bg.add(aim);const gun=new THREE.Group();aim.add(gun);const ham=new THREE.Group();fa.add(ham);ham.position.y=.4;ham.visible=false;
 add(D(.12,1.2,.12),0x8b5a2b,0,-.9,0,ham);add(D(.16,.1,.16),0xffd02f,0,-.45,0,ham);add(D(.16,.1,.16),0xffd02f,0,-1.1,0,ham);add(RBX(1,.5,.55,.05),0x9aa0a6,0,-1.55,0,ham);add(RBX(.14,.56,.6,.04),0xe3000b,-.6,-1.55,0,ham);add(RBX(.14,.56,.6,.04),0xe3000b,.6,-1.55,0,ham);add(RBX(.3,.3,.3,.04),0x6e747a,0,-1.9,0,ham);
 const bub=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.3}));bub.position.y=1.2;bub.visible=false;bub.userData.sh=1;g.add(bub);
 return{g,bg,hg,hy:hg.position.y,ra,fa,gun,ham,bub,lg,la,aim}};
skin(P,P.id);skin(E,E.id);
})();
