/* Map detail kit (round 16): the pieces the map "card art" pass is built from. Giant meme statues made of bricks, torches, crown banners, waterfalls,
   vines, a swirling portal. Everything is visual only (no colliders) unless a function says otherwise, and every function does nothing while a map is only
   being drawn as a thumbnail (MAPS.lib.isDry). Maps call these from their build / env / decor functions: MAPS.kit.dogeStatue(...), and so on. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,glow,sign,banner,anim,isDry,add,TH,shade,mixc,rnd,lerp}=LB;
const PI=Math.PI,GOLD=0xffc828,BLUE=0x1f4fb0,K=MAPS.kit={GOLD,BLUE};
// ---------- a builder with a local frame: position, turn (radians around y) and scale. +z is the front of whatever you build.
function V(ox,oy,oz,ry,s){ry=ry||0;s=s||1;const c=Math.cos(ry),sn=Math.sin(ry);
 const P=(x,z)=>[ox+(x*c+z*sn)*s,oz+(-x*sn+z*c)*s];
 return{ox,oy,oz,ry,s,
  b(x,y,z,w,h,d,col,mt){const p=P(x,z);bx(p[0],oy+y*s,p[1],w*s,h*s,d*s,col,ry,mt)},
  c(x,y,z,r,h,col,mt){const p=P(x,z);cy(p[0],oy+y*s,p[1],r*s,h*s,col,mt)},
  o(x,y,z,r,col,mt){const p=P(x,z);ball(p[0],oy+y*s,p[1],r*s,col,mt)},
  st(x,y,z,col){const p=P(x,z);stud(p[0],oy+y*s,p[1],col)},
  at(x,y,z){const p=P(x,z);return[p[0],oy+y*s,p[1]]},
  glow(x,y,z,size,col){const p=P(x,z);glow(p[0],oy+y*s,p[1],size*s,col)}}}
K.V=V;
// ---------- fire
// a little stack of glowing bricks (flickers through the 'F' material); big=true adds a soft glow sprite as well
function flame(x,y,z,s,big){if(isDry())return;s=s||1;bx(x,y+.16*s,z,.3*s,.34*s,.3*s,0xff7a1a,0,'eF');bx(x,y+.4*s,z,.22*s,.36*s,.22*s,0xffc23a,0,'eF');bx(x,y+.62*s,z,.11*s,.22*s,.11*s,0xfff0a0,0,'eF');if(big)glow(x,y+.35*s,z,2.4*s,0xff9a3a)}
// a torch on a post: wood pole, iron cup, flame
function torch(x,z,h,o){o=o||{};h=h||2.4;if(isDry())return;bx(x,h/2,z,.14,h,.14,o.pole||0x5a3a1c);bx(x,h+.02,z,.34,.16,.34,0x23252b);bx(x,h+.14,z,.26,.12,.26,0x2f3138);flame(x,h+.2,z,o.s||1,o.glow)}
// a torch bracket on a wall; (x,y,z) is on the wall face, ry the way the wall faces (0 = +z)
function wallTorch(x,y,z,ry,o){if(isDry())return;o=o||{};const s=Math.sin(ry),c=Math.cos(ry);bx(x+s*.18,y-.15,z+c*.18,.12,.12,.34,0x23252b,ry);bx(x+s*.34,y,z+c*.34,.3,.14,.3,0x2f3138,ry);flame(x+s*.34,y+.07,z+c*.34,o.s||.9,o.glow)}
// a hanging lantern (emissive brick that glows at dusk) on a short chain
function lantern(x,y,z,c,o){if(isDry())return;o=o||{};const s=o.s||1;
 // it hangs from a bracket: an arm out of the wall (o.arm=[dx,dz] towards it) or a short lamp post beside it (o.pole=[dx,dz]); never from thin air
 {const yt=y+.84*s;if(o.arm){const[ax,az]=o.arm;bx(x+ax/2,yt,z+az/2,Math.abs(ax)+.12,.1,Math.abs(az)+.12,0x23252b)}else{const[px,pz]=o.pole||[.5,0];bx(x+px,yt/2,z+pz,.16,yt,.16,0x23252b);bx(x+px/2,yt,z+pz/2,Math.abs(px)+.12,.1,Math.abs(pz)+.12,0x23252b)}}
 bx(x,y+.55*s,z,.05,.5*s,.05,0x23252b);bx(x,y+.28*s,z,.36*s,.07*s,.36*s,0x23252b);bx(x,y,z,.3*s,.42*s,.3*s,c||0xffb04a,0,'eL');bx(x,y-.26*s,z,.34*s,.07*s,.34*s,0x23252b);if(o.glow!==false)glow(x,y,z,2.2*s,c||0xffa55a)}
// ---------- cloth
// a hanging banner with a gold crown: (x,ytop,z) is the middle of its top edge, ry the way it faces (0 = +z)
function crownBanner(x,ytop,z,ry,w,h,c1,c2,o){if(isDry())return;w=w||1.4;h=h||3;c1=c1||BLUE;c2=c2||GOLD;const v=V(x,ytop,z,ry,1);
 v.b(0,.04,0,w+.4,.1,.16,0x5a3a1c);v.b(0,-h/2,0,w,h,.08,c1);v.b(0,-h-.12,0,w*.66,.28,.08,c1);v.b(0,-h-.34,0,w*.3,.18,.08,c1);
 v.b(0,-h*.12,.06,w*.9,.06,.04,c2);v.b(0,-h*.88,.06,w*.9,.05,.04,c2);
 const cy0=-h*.42;v.b(0,cy0,.06,w*.5,.2,.05,c2,'g');for(const t of[-1,0,1])v.b(t*w*.18,cy0+.2,.06,w*.1,.24,.05,c2,'g');v.b(0,cy0-.22,.06,w*.34,.14,.05,0xe3000b)}
K.crownBanner=crownBanner;
// a tall banner pole with a crown banner (wood or iron)
function bannerPole(x,z,h,ry,o){o=o||{};if(isDry())return;h=h||6;bx(x,h/2,z,.22,h,.22,o.pole||0x4a3420);cy(x,h+.2,z,.2,.25,GOLD,'g');ball(x,h+.5,z,.2,GOLD,'g');crownBanner(x+Math.sin(ry||0)*.18,h-.3,z+Math.cos(ry||0)*.18,ry||0,o.w||1.5,o.h||3.4,o.c1,o.c2)}
// ---------- plants
// hanging ivy: n strands under (x,y,z) on a wall facing ry
function vines(x,y,z,ry,w,len,seed,c1,c2){if(isDry())return;seed=seed||1;const n=Math.max(2,Math.round(w/.45)),s=Math.sin(ry),c=Math.cos(ry);c1=c1||0x3f8f3a;c2=c2||0x58a845;
 for(let i=0;i<n;i++){const t=(i+.5)/n-.5,l=len*(.35+.65*rnd(i,seed,1)),px=x+c*t*w+s*.1,pz=z-s*t*w+c*.1;bx(px,y-l/2,pz,.26,l,.2,i%2?c1:c2,ry);if(rnd(i,seed,2)<.5)bx(px+c*.2,y-l-.12,pz-s*.2,.2,.24,.16,c2,ry)}}
// ---------- water
// a falling sheet of water with foam at the bottom and a splash pool; moves with the animation clock
function fall(x,z,ry,w,top,low,o){if(isDry())return;o=o||{};const len=top-low,cv=document.createElement('canvas');cv.width=64;cv.height=256;const g=cv.getContext('2d');g.fillStyle=o.base||'#8fd8f0';g.fillRect(0,0,64,256);
 for(let i=0;i<24;i++){g.fillStyle=i%2?'rgba(255,255,255,.85)':(o.dark||'rgba(50,140,200,.6)');g.fillRect((i*29)%60,(i*47)%250,3+i%4,40+(i*13)%70)}
 const t=new TH.CanvasTexture(cv);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(1,Math.max(1,len/4));
 const m=new TH.Mesh(new TH.PlaneGeometry(w,len),new TH.MeshBasicMaterial({map:t,transparent:true,opacity:.84,side:TH.DoubleSide,depthWrite:false}));m.position.set(x,low+len/2,z);m.rotation.y=ry;add(m);
 anim((dt,T)=>{t.offset.y=(T*.8)%1;const k=(MAPS.lightKey()||{}).lamp||0,v=1-.45*k;m.material.color.setRGB(v,v,v)});
 const s=Math.sin(ry),c=Math.cos(ry);for(let i=0;i<4;i++)ball(x+s*.4+c*(i-1.5)*w*.2,low+.05,z+c*.4-s*(i-1.5)*w*.2,.5+(i%2)*.25,0xeef9f4)}
// ---------- the Crown (used on statues and trophies)
function crown(v,x,y,z,w,d,o){o=o||{};const g=o.c||GOLD;v.b(x,y+.18,z,w,.36,d,g,'g');
 const n=o.n||5;for(let i=0;i<n;i++){const t=(i/(n-1)-.5)*(w-.4);const h=i%2?.55:.85;v.b(x+t,y+.36+h/2,z+d/2-.2,.34,h,.34,g,'g');v.o(x+t,y+.36+h+.1,z+d/2-.2,.15,i%2?0xe3000b:0xffffff,'g');v.b(x+t,y+.36+h/2,z-d/2+.2,.34,h,.34,g,'g')}
 v.b(x,y+.2,z+d/2+.02,w*.55,.12,.04,0xe3000b)}
K.crown=crown;
// ======================================================================= giant statues. (x,z) is the foot print centre, y0 the top of the plinth.
// ---- Pepe: seated frog on a plinth, crown on his head, a lit torch in the raised hand. Face art comes from the map (a canvas drawing function) so the
// pond keeps its own Pepe.
function pepeStatue(x,y0,z,ry,s,faceArt,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y0,z,ry,s),G=0x4f9a3b,GL=0x6cb64a,GD=0x3b7a2e,BEL=0xcfd88a;
 // crossed legs and feet
 v.b(0,.55,.15,3.5,1.1,2.4,GD);v.b(-1.5,.45,1.55,1.1,.7,1.0,G);v.b(1.5,.45,1.55,1.1,.7,1.0,G);v.b(0,1.15,.2,3.0,.2,2.0,GL);
 for(const t of[-1,0,1])for(const u of[0,1])v.st(t*.9,1.28,u*.8-.2,GL);
 // body and belly
 v.b(0,2.45,-.1,2.7,2.0,2.0,GD);v.b(0,2.3,.92,1.7,1.5,.12,BEL);v.b(0,3.45,-.1,2.8,.3,2.1,G);
 for(const t of[-1,1])for(const u of[-.5,.5])v.st(t*.9,3.62,u,GL);
 // arms: left rests on the knee, right is raised with the torch
 v.b(-1.85,2.3,.25,.8,2.2,.8,G);v.b(-1.85,1.25,.95,.9,.5,1.1,GL);
 v.b(1.85,3.05,.1,.8,.9,.8,G);v.b(2.4,3.05,.2,1.1,.8,.8,G);v.b(2.9,4.2,.3,.8,1.9,.8,G);v.o(2.9,5.3,.3,.5,GL);
 // the torch: pole, cup, flame
 v.b(2.9,6.1,.3,.22,1.5,.22,0x6a4a2a);v.b(2.9,6.88,.3,.62,.26,.62,GOLD,'g');
 const f=v.at(2.9,7.05,.3);flame(f[0],f[1],f[2],1.7*s,true);
 // head: a wide block with the face on every side, the crown on top
 v.b(0,4.9,0,4.5,2.5,3.5,G);v.b(0,6.22,0,4.6,.3,3.6,GL);
 for(const t of[-1.5,-.5,.5,1.5])for(const u of[-1,1])v.st(t,6.41,u,GL);
 for(const t of[-1,1])v.b(t*1.2,5.98,1.78,1.6,.34,.2,GD);
 if(faceArt)for(const[a,px,pz,w2]of[[0,0,1.78,4.3],[PI,0,-1.78,4.3],[PI/2,2.28,0,3.3],[-PI/2,-2.28,0,3.3]]){const p=v.at(px,4.85,pz);sign(p[0],p[1],p[2],a+ry,w2*s,w2*s*.5,faceArt,{pw:512,lit:true})}
 crown(v,0,6.5,0,3.4,2.6);
 v.glow(0,5.2,.6,9*1,0xb8ff9a)}
K.pepeStatue=pepeStatue;
// ---- Doge: a big shiba head and shoulders with a crown, cream muzzle, black nose, pointed ears, a pink tongue
function dogeStatue(x,y0,z,ry,s,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y0,z,ry,s),OR=0xe8a13a,OL=0xf3bd5f,CR=0xfbf0d2,OD=0xc9812a;
 // chest with a blue collar and a gold tag
 v.b(0,1.0,-.2,5.4,2.0,3.4,OR);v.b(0,.35,.9,3.2,1.2,1.4,CR);v.b(0,1.95,.35,4.3,.38,2.6,BLUE);v.o(0,1.45,1.5,.32,GOLD,'g');
 for(const t of[-2,-1,0,1,2])v.st(t*1.0,2.04,-1.1,OR);
 // head
 v.b(0,4.0,0,5.6,3.4,4.0,OR);v.b(0,5.81,0,5.6,.22,4.0,OL);
 for(const t of[-2,-1,0,1,2])for(const u of[-1,0,1])v.st(t*1.05,5.99,u*1.05,OL);
 // cheeks (cream) and the cream muzzle with nose and tongue
 for(const t of[-1,1])v.b(t*2.25,3.55,1.4,1.4,1.7,1.4,CR);
 v.b(0,3.5,2.15,2.6,1.7,1.2,CR);v.b(0,3.12,2.95,1.8,.9,.5,CR);v.b(0,3.95,2.9,1.1,.62,.5,0x1a1410);
 v.b(0,2.45,2.95,.9,.9,.22,0xe36a7a);v.b(0,2.8,2.82,.12,.5,.12,0x1a1410);
 // eyes with a white spark, brows
 for(const t of[-1,1]){v.b(t*1.5,4.5,2.06,.85,.85,.16,0x1a1410);v.b(t*1.38,4.7,2.12,.28,.28,.1,0xffffff);v.b(t*1.5,5.1,2.02,1.1,.2,.14,OD)}
 // ears: tall, stepped, pink inside
 for(const t of[-1,1]){v.b(t*2.2,6.35,-.2,1.5,1.5,1.3,OR);v.b(t*2.25,7.2,-.2,1.1,.9,1.1,OR);v.b(t*2.3,7.8,-.2,.6,.5,.7,OR);v.b(t*2.2,6.4,.5,.8,1.2,.2,0xf0a8b0)}
 crown(v,0,5.95,.2,3.4,2.4);
 v.glow(0,4.5,2,12,0xffe2a0)}
K.dogeStatue=dogeStatue;
// ---- Troll: a huge stone-cream head with bulging eyes, thick brows, high cheeks and a huge toothy grin; moss on top
function trollHead(x,y0,z,ry,s,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y0,z,ry,s),SK=0xe6c79a,SD=0xc9a672,SL=0xf4ddb6,BK=0x14110e;
 // skull block, a pointed chin, ears, and a tuft of moss on top
 v.b(0,2.3,0,6.4,4.4,3.2,SK);v.b(0,4.6,0,6.0,.3,2.9,SL);v.b(0,.1,.5,3.6,.9,2.2,SK);v.b(0,-.35,.9,1.8,.6,1.5,SD);
 for(const t of[-1,1]){v.b(t*3.35,2.6,0,.5,1.7,1.2,SD);v.b(t*3.45,2.6,.1,.2,1.0,.7,SK)}
 for(let i=0;i<7;i++)v.b(-2.4+i*.8,4.85+((i*7)%3)*.1,((i*5)%3-1)*.6,.9,.5,.9,i%2?0x3f8f3a:0x58a845);
 // heavy brows that slope down towards the nose, narrow eyes under half-closed lids
 for(const t of[-1,1]){v.b(t*2.1,3.75,1.62,1.3,.34,.3,BK);v.b(t*1.2,3.55,1.62,1.2,.34,.3,BK);v.b(t*1.75,3.05,1.66,1.9,.62,.28,0xffffff);v.b(t*1.45,3.0,1.84,.5,.5,.12,BK);v.b(t*1.75,3.36,1.8,2.0,.2,.16,BK);v.b(t*1.75,2.68,1.74,1.8,.12,.14,SD)}
 // round bulb nose and big cheeks
 v.b(0,2.2,1.9,1.0,1.1,.8,SD);v.b(0,2.05,2.3,.7,.7,.2,0xd9b684);for(const t of[-1,1])v.b(t*.28,1.82,2.42,.18,.18,.1,BK);
 for(const t of[-1,1]){v.b(t*2.45,1.75,1.7,1.7,1.3,.7,SL);v.b(t*2.65,1.2,1.6,1.2,.8,.6,SK)}
 // the grin: a wide dark mouth that curls up into the cheeks, top teeth with gaps, bottom lip line
 v.b(0,.95,1.93,4.2,.9,.3,0x24100c);for(const t of[-1,1]){v.b(t*2.5,1.25,1.95,1.0,.7,.3,0x24100c);v.b(t*3.0,1.75,1.94,.4,.7,.3,0x24100c)}
 for(let i=-3;i<=3;i++)v.b(i*.56,1.28,2.07,.5,.55,.14,0xffffff);for(let i=-2;i<=2;i++)v.b(i*.6,.68,2.07,.5,.35,.14,0xf4f4f4);
 v.b(0,.28,1.8,2.6,.14,.14,SD);
 v.glow(0,2.4,2.5,9,0xffe0a0)}
K.trollHead=trollHead;
// ---- Pig: the big pink pig head used on Pork Portal Plaza (square head, snout, ears, golden crown)
function pigHead(x,y0,z,ry,s,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y0,z,ry,s),PK=0xf1a0b8,PL=0xffc6d6,PD=0xd9788f;
 v.b(0,2.0,0,5.4,4.0,3.6,PK);v.b(0,4.15,0,5.4,.3,3.6,PL);for(const t of[-2,-1,0,1,2])for(const u of[-1,0,1])v.st(t*1.02,4.4,u*1.02,PL);
 v.b(0,1.4,2.15,2.4,1.7,.9,PD);v.b(0,1.4,2.62,2.0,1.35,.1,0xf6b4c6);for(const t of[-1,1])v.b(t*.55,1.4,2.7,.38,.55,.1,0x6a2a3c);
 for(const t of[-1,1]){v.b(t*1.45,2.8,1.82,.95,.95,.22,0x1a1018);v.b(t*1.38,2.95,1.95,.3,.3,.12,0xffffff);v.b(t*2.6,4.5,-.2,1.5,1.2,1.0,PK);v.b(t*2.6,4.5,.4,.9,.8,.2,PD)}
 crown(v,0,4.3,0,3.4,2.4)}
K.pigHead=pigHead;
// ---- Stonks man: a blocky suited statue with gold head, black sunglasses, red tie, one thumb up
function suitStatue(x,y0,z,ry,s,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y0,z,ry,s),SU=0x2b3560,SL=0x3a4684,GH=0xf2c034;
 v.b(0,2.6,0,5.8,5.2,2.8,SU);v.b(0,2.6,1.43,1.2,4.6,.1,0xf2f2f2);v.b(0,3.3,1.5,.55,2.8,.16,0xd0002a);v.b(0,4.9,1.5,.7,.5,.2,0xd0002a);
 for(const t of[-1,1]){v.b(t*1.55,3.7,1.46,1.5,.2,.12,SL);v.b(t*3.6,3.4,.2,1.3,3.8,1.5,SU)}
 v.b(3.65,5.5,.9,.7,.9,.7,GH);v.b(3.65,6.3,.9,.4,.8,.4,GH);
 v.b(0,6.1,0,3.0,2.6,2.6,GH);for(const i of[-1,0,1])for(const j of[-1,0,1])v.st(i*.9,7.45,j*.9,GH);
 v.b(0,6.45,1.35,2.8,.62,.2,0x0b0b10);for(const t of[-1,1])v.b(t*1.45,6.45,.9,.2,.5,1.2,0x0b0b10);
 v.b(0,5.7,1.35,.5,.5,.2,shade(GH,.8));v.b(0,5.2,1.35,1.3,.22,.14,0x6a3a1a);v.b(0,5.2,1.35,.8,.3,.1,0xffffff)}
K.suitStatue=suitStatue;
// ---- Nyan cat: a pop-tart body with sprinkles, a grey head and paws, flying with a rainbow trail along -x (before rotation)
function nyanCat(x,y,z,ry,s,o){if(isDry())return;o=o||{};s=s||1;const v=V(x,y,z,ry,s);
 const RB=[0xff2a2a,0xff9a1a,0xffe81a,0x2ae82a,0x2a8aff,0x8a3aff];
 for(let i=0;i<6;i++)for(let k=0;k<14;k++){const t=k/13,wave=Math.round(Math.sin(k*.7)*.5)*.5;v.b(-3.4-k*1.1,2.5-i*.62+wave-1.6,0,1.1,.62,.9,RB[i])}
 v.b(0,0,0,6.6,5.2,1.3,0xf6e6a8);v.b(0,0,.2,6.0,4.6,1.2,0xf49ac2);
 for(const[px,py]of[[-2,1.4],[1.9,1.6],[-.6,.2],[2.4,-.7],[-2.2,-1.2],[0.4,-1.7],[-1.1,1.9]]){v.b(px,py,.85,.55,.28,.2,0xff3a7a)}
 v.b(4.7,.55,.1,3.8,3.4,1.6,0x8a8a92);v.b(4.7,.55,.95,3.4,3.0,.2,0x9a9aa2);
 for(const t of[-1,1]){v.b(3.4+t*1.4,2.6,.1,.9,1.0,.8,0x7a7a82);v.b(4.7+t*1.2,.9,.98,.5,.5,.12,0xffffff);v.b(4.7+t*1.2,.9,1.02,.22,.22,.1,0x14110e);v.b(4.7+t*1.2,-.4,1.04,.4,.4,.1,0xff9ab0)}
 v.b(4.7,.2,1.02,.5,.18,.1,0x14110e);
 for(const[px,py]of[[-2.6,-3],[-.8,-3],[2.2,-3],[3.8,-3]])v.b(px,py,.2,.9,.9,.8,0x7a7a82);v.b(-3.8,-1.2,.25,1.6,.5,.6,0x8a8a92)}
K.nyanCat=nyanCat;
// ======================================================================= portal: a purple glowing disc that spins (animated texture), in a ring of bricks
function portal(x,y,z,ry,w,h,o){if(isDry())return;o=o||{};const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 const draw=a=>{g.clearRect(0,0,256,256);const r=g.createRadialGradient(128,128,4,128,128,128);r.addColorStop(0,'#fff0ff');r.addColorStop(.25,'#e060ff');r.addColorStop(.7,'#7a14d0');r.addColorStop(1,'#3a0a7a');g.fillStyle=r;g.fillRect(0,0,256,256);
  g.lineWidth=14;for(let k=0;k<5;k++){g.strokeStyle=k%2?'rgba(255,255,255,.55)':'rgba(255,120,255,.7)';g.beginPath();for(let t=0;t<=1;t+=.02){const rr=6+t*120,an=a+k*PI*2/5+t*7;const px=128+Math.cos(an)*rr,py=128+Math.sin(an)*rr;t?g.lineTo(px,py):g.moveTo(px,py)}g.stroke()}};
 draw(0);const tx=new TH.CanvasTexture(c);const m=new TH.Mesh(new TH.PlaneGeometry(w,h),new TH.MeshBasicMaterial({map:tx,side:TH.DoubleSide,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry;add(m);
 let acc=0;anim((dt,T)=>{acc+=dt;if(acc>.07){acc=0;draw(T*2.2);tx.needsUpdate=true}});glow(x,y,z,Math.max(w,h)*1.6,0xc050ff)}
K.portal=portal;
// ---------- scenery
function pine(x,y,z,s){if(isDry())return;s=s||1;bx(x,y+.6*s,z,.5*s,1.2*s,.5*s,0x6a4a2a);for(let i=0;i<4;i++){const w=(2.6-i*.6)*s;bx(x,y+(1.5+i*.8)*s,z,w,.85*s,w,i%2?0x2d7a3a:0x246a32)}}
// a stepped peak: w wide at the bottom, h high, snow on the top fifth when o.snow is a colour
function peak(x,z,w,h,c,o){if(isDry())return;o=o||{};const k=Math.max(4,Math.round(h/2.4)),y0=o.y0===undefined?-3:o.y0;
 for(let i=0;i<k;i++){const f=1-.82*(i+.5)/k+(rnd(i,x,z)-.5)*.1,top=o.snow&&i>k*.78;bx(x+(rnd(i,z,3)-.5)*w*.06,y0+h*(i+.5)/k,z+(rnd(i,x,4)-.5)*w*.06,w*f,h/k+.05,w*f*.92,top?o.snow:shade(c,1+(i%2?.07:-.05)-i*.012))}}
// torches on the edge of every walkable cell that borders water or void (a hashed share of the edges), y = the height of the curb lip
function edgeTorches(prob,y,seed,o){if(isDry())return;o=o||{};let g=0;
 for(let j=0;j<30;j++)for(let i=0;i<30;i++){const x=i*2-29,z=j*2-29;if(!MAPS.walk(x,z))continue;
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx*2,nz=z+dz*2;if(Math.abs(nx)>30||Math.abs(nz)>30)continue;if(MAPS.walk(nx,nz)||MAPS.cell(nx,nz)==='K')continue;
   if(rnd(x,z,seed+dx*3+dz*5)>=prob)continue;const px=x+dx*.86+(dz?(rnd(x,z,seed+9)-.5)*1.2:0),pz=z+dz*.86+(dx?(rnd(x,z,seed+11)-.5)*1.2:0);
   bx(px,y+.5*(o.h||1),pz,.18,(o.h||1),.18,o.pole||0x3a2a1a);bx(px,y+(o.h||1)+.08,pz,.34,.14,.34,0x23252b);flame(px,y+(o.h||1)+.15,pz,o.s||.9,(g++%(o.glowEvery||4))===0&&g<(o.max||50))}}}
// a big puffy cumulus made of overlapping bricks: flat shaded underside, bright top
function cumulus(x,y,z,s,c){if(isDry())return;c=c||0xffffff;s=s||1;const u=shade(c,.86),t=shade(c,1.02),n=5+Math.floor(rnd(x,z,3)*3);
 bx(x,y,z,16*s,2.4*s,9*s,u);for(let i=0;i<n;i++){const a=(rnd(x,z,i+5)-.5)*13*s,b=(rnd(z,x,i+9)-.5)*5*s,w=(5+rnd(i,x,z)*5)*s,h=(3+rnd(i,z,x)*3)*s;bx(x+a,y+1.2*s+h/2,z+b,w,h,w*.8,i%2?c:t)}}
// ---------- construction: a yellow lattice tower crane with a jib and a hanging load, and an unfinished concrete building frame with scaffolding
function towerCrane(x,z,h,ry,o){if(isDry())return;o=o||{};const v=V(x,0,z,ry||0,o.s||1),Y=o.c||0xf2b21c,D=0x3a3f48,L=o.jib||22;
 v.b(0,.4,0,3,.8,3,0x6a707a);for(const a of[-1,1])for(const b of[-1,1])v.b(a*.8,h/2,b*.8,.22,h,.22,Y);
 for(let y=1.4;y<h;y+=1.5){v.b(0,y,.8,1.7,.12,.12,Y);v.b(0,y,-.8,1.7,.12,.12,Y);v.b(.8,y,0,.12,.12,1.7,Y);v.b(-.8,y,0,.12,.12,1.7,Y);v.b(0,y+.75,.8,1.9,.1,.1,shade(Y,.8));v.b(.8,y+.75,0,.1,.1,1.9,shade(Y,.8))}
 v.b(0,h+.7,0,2.2,1.4,2.2,0xe9e6dc);v.b(0,h+.9,1.12,1.6,.7,.06,0x2d3a4a);v.b(0,h+1.6,0,2.6,.2,2.6,D);
 v.b(0,h+2.0,L*.38,.7,.6,L,Y);v.b(0,h+2.9,L*.38,.16,.16,L,D);for(let k=0;k<L/1.6;k++)v.b(0,h+2.45,-L*.12+k*1.6+.8,.12,.9,.12,Y);
 v.b(0,h+1.9,-6,1.6,1.1,6,0x6a707a);v.b(0,h+2.7,-6.5,1.2,.6,3,0x555a63);v.b(0,h+3.0,0,.3,2.4,.3,Y);
 const lz=L*.62;v.b(0,h+1.6,lz,.9,.5,.9,D);v.b(0,h-1.5,lz,.05,6.2,.05,0x2a2a2a);v.b(0,h-4.9,lz,.7,.5,.7,0xd63a3a);
 if(o.load!==false){v.b(0,h-6.2,lz,1.8,1.6,1.8,o.load||0xe8902a);v.b(0,h-6.2,lz,1.9,.14,1.9,0x6b4423);v.b(0,h-5.4,lz,.04,1.2,.04,0x2a2a2a)}
 v.b(0,h+2.5,L*.02,.3,.3,.3,0xff4a3a,'eL')}
function buildingFrame(x,z,w,d,floors,ry,seed){if(isDry())return;seed=seed||1;const v=V(x,0,z,ry||0,1),fh=3.4,CO=0xa6a6a1,CD=0x8a8a85,OR=0xe8902a;
 const nx=Math.max(2,Math.round(w/4.2)+1),nz=Math.max(2,Math.round(d/4.2)+1);
 for(let f=0;f<floors;f++){const y=(f+1)*fh;
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const px=-w/2+.4+i*(w-.8)/(nx-1),pz=-d/2+.4+j*(d-.8)/(nz-1);v.b(px,f*fh+fh/2,pz,.7,fh,.7,(i+j+f)%2?CO:CD)}
  v.b(0,y,0,w,.5,d,CO);v.b(0,y-.3,0,w+.2,.12,d+.2,CD);
  for(let q=0;q<Math.round(w/.9);q++)v.st(-w/2+.5+q*.9,y+.31,d/2-.45,CO);
  // scaffolding on the front and the back: orange rails, posts, ladders
  for(const sg of[-1,1]){v.b(0,y+.55,sg*(d/2+.45),w+.4,.08,.08,OR);v.b(0,y+.05,sg*(d/2+.45),w+.4,.08,.08,OR);
   for(let q=0;q<=Math.round(w/2.4);q++)v.b(-w/2+q*w/Math.round(w/2.4),y-fh/2+.3,sg*(d/2+.45),.1,fh,.1,OR);
   v.b(0,y-fh+.55,sg*(d/2+.45),w+.4,.08,.08,OR)}
  // a half-built brick wall, crates, a tarp
  if(rnd(seed,f,1)<.8)v.b(-w*.2+rnd(seed,f,2)*w*.3,y+.95,-d*.25,3.2+rnd(seed,f,3)*3,1.4,.45,0xc8742f);
  if(rnd(seed,f,4)<.7)v.b(w*.25,y+.8,d*.15,1.2,1.1,1.2,0xa57c45);if(rnd(seed,f,5)<.5)v.b(-w*.3,y+.7,d*.2,1.0,.9,1.0,0xc9a05a);
  if(rnd(seed,f,6)<.5)v.b(-w/2+1.6+rnd(seed,f,7)*3,y-fh/2,d/2+.5,2.6,fh*.7,.05,rnd(seed,f,8)<.5?0x3a7ad0:OR)}
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){if((i+j)%2)continue;const px=-w/2+.4+i*(w-.8)/(nx-1),pz=-d/2+.4+j*(d-.8)/(nz-1);v.b(px,floors*fh+1.0,pz,.07,2.0,.07,0x8a5a3a)}}
// ---------- rock: a terraced cliff face with mossy ledges, pines and waterfalls (visual only). +z is the face that looks at the arena.
function cliff(x,z,w,d,h,ry,seed,nfall){if(isDry())return;seed=seed||1;const v=V(x,0,z,ry||0,1),n=Math.max(4,Math.round(h/2.6)),RK=[0x7d8794,0x6f7a88,0x8a8f98,0x737c8a];
 for(let k=0;k<n;k++){const f=1-.55*k/n,hh=h/n;v.b((rnd(seed,k,1)-.5)*w*.08,-3+hh*k+hh/2+3,-k*d*.04,w*f,hh+.05,d*f,RK[k%4]);
  v.b((rnd(seed,k,1)-.5)*w*.08,hh*(k+1)-.2+3,-k*d*.04+d*f*.1,w*f*.98,.5,d*f*.82,0x4f8f3c);
  for(let q=0;q<2;q++){const px=(rnd(seed,k,q+3)-.5)*w*f*.8;pine(...v.at(px,hh*(k+1)+.1+3,-k*d*.04+d*f*.15),1+rnd(seed,k,q+9)*.8)}}
 for(let i=0;i<(nfall||2);i++){const px=((i+.5)/(nfall||2)-.5)*w*.6,top=h*(.35+.25*rnd(seed,i,4))+3;const p=v.at(px,0,d*.5+.4);fall(p[0],p[2],ry||0,Math.min(4,w*.18),top,0);const q=v.at(px,0,d*.5+2.6);bx(q[0],.06,q[2],5.5,.12,5.5,0x5ab8f0,ry||0,'t75')}}
// ---------- a slim round tower with a stepped blue cone roof, torches and a flag (visual only)
function spireTower(x,z,r,hgt,c,roof,o){if(isDry())return;o=o||{};c=c||0x9a9aa4;roof=roof||BLUE;const nc=Math.max(2,Math.round(hgt/.9));
 for(let k=0;k<nc;k++)cy(x,(k+.5)*hgt/nc,z,r*(1-.03*k/nc),hgt/nc-.03,k%2?shade(c,.95):c);
 cy(x,hgt+.2,z,r+.3,.4,shade(c,1.05));const k=6;for(let i=0;i<k;i++){const ra=lerp(r+.5,.25,i/k),rb=lerp(r+.5,.25,(i+1)/k);fr(x,hgt+.4+(i+.5)*(r*.55),z,ra,rb,r*.55-.02,i%3===2?shade(roof,1.2):roof)}
 const top=hgt+.4+k*r*.55;cy(x,top+.1,z,.12,.3,GOLD,'g');ball(x,top+.3,z,.18,GOLD,'g');bx(x,top+1.1,z,.06,1.5,.06,0xcfcfcf);bx(x+.4,top+1.5,z,.8,.5,.05,o.flag||BLUE);
 for(let a=0;a<4;a++)bx(x+Math.sin(a*PI/2+.4)*(r+.02),hgt*.62,z+Math.cos(a*PI/2+.4)*(r+.02),.28,.9,.14,0x1a2230,a*PI/2+.4);
 if(o.flames)for(let a=0;a<2;a++)flame(x+Math.sin(a*PI)*(r+.5),hgt*.45,z+Math.cos(a*PI)*(r+.5),.9,false)}
K.towerCrane=towerCrane;K.buildingFrame=buildingFrame;K.cliff=cliff;K.spireTower=spireTower;
K.cumulus=cumulus;K.pine=pine;K.peak=peak;K.edgeTorches=edgeTorches;
K.flame=flame;K.torch=torch;K.wallTorch=wallTorch;K.lantern=lantern;K.bannerPole=bannerPole;K.vines=vines;K.fall=fall;
})();
