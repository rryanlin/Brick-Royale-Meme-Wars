/* Map statues, second pass (round 17): the giant meme characters standing in the maps (Pepe, Doge, the Troll, the Pig, the Stonks man) rebuilt with rounded
   ellipsoid bricks, shaded colour layers and real faces so they look like the card art instead of flat blocks. This file replaces K.pepeStatue, K.dogeStatue,
   K.trollHead, K.pigHead and K.suitStatue of js/mapkit.js with the same signatures (x, y0, z, ry, s): (x,z) foot centre, y0 the plinth top, +z the front.
   Visual only, and nothing is drawn while a map is only being drawn as a thumbnail. */
(()=>{
const LB=MAPS.lib,K=MAPS.kit,{bx,cy,fr,ib,glow,isDry,shade,rnd}=LB;
const PI=Math.PI,GOLD=K.GOLD,BLUE=K.BLUE,flame=K.flame,crown=K.crown;
// local frame builder with ellipsoids (e), limbs made of a chain of balls (limb), boxes (b), cylinders (c), cones (k) and studs
function W(ox,oy,oz,ry,s){ry=ry||0;s=s||1;const c=Math.cos(ry),sn=Math.sin(ry);
 const P=(x,z)=>[ox+(x*c+z*sn)*s,oz+(-x*sn+z*c)*s];
 const v={ox,oy,oz,ry,s,
  b(x,y,z,w,h,d,col,mt){const p=P(x,z);bx(p[0],oy+y*s,p[1],w*s,h*s,d*s,col,ry,mt)},
  c(x,y,z,r,h,col,mt){const p=P(x,z);cy(p[0],oy+y*s,p[1],r*s,h*s,col,mt)},
  k(x,y,z,rb,rt,h,col,mt){const p=P(x,z);fr(p[0],oy+y*s,p[1],rb*s,rt*s,h*s,col,mt)},
  e(x,y,z,rx,ry2,rz,col,mt){const p=P(x,z);ib('o',col,p[0],oy+y*s,p[1],rx*s,ry2*s,rz*s,ry,mt)},
  o(x,y,z,r,col,mt){v.e(x,y,z,r,r,r,col,mt)},
  at(x,y,z){const p=P(x,z);return[p[0],oy+y*s,p[1]]},
  glow(x,y,z,size,col){const p=P(x,z);glow(p[0],oy+y*s,p[1],size*s,col)},
  limb(a,b,r0,r1,n,col,mt){for(let i=0;i<=n;i++){const t=i/n,r=r0+(r1-r0)*t;v.o(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,r,col,mt)}}};
 return v}
K.W=W;
// ======================================================================= Pepe: a hunched, seated frog with a big heavy-lidded face, red lips, a crown and a lit torch
function pepeStatue(x,y0,z,ry,s,faceArt,o){if(isDry())return;s=s||1;const v=W(x,y0,z,ry,s),G=0x5aa63c,GD=0x3f8a2e,GL=0x7cc455,BEL=0xdbe39a,LIP=0xb53a3a,DK=0x24421a;
 // thighs, knees and big flat feet with toes
 for(const t of[-1,1]){v.e(t*2.15,1.45,-.1,1.75,1.45,2.5,GD);v.e(t*2.4,1.5,1.5,1.35,1.15,1.3,G);v.e(t*2.25,.5,2.75,1.45,.5,1.1,GL);
  for(const q of[-1,0,1])v.o(t*2.25+q*.9,.4,3.7,.42,GL)}
 // torso, belly, shoulders
 v.e(0,3.9,-.2,2.85,2.55,2.35,G);v.e(0,3.45,1.05,1.95,2.0,1.15,BEL);v.e(0,5.2,-.1,2.7,1.2,2.0,GL);
 for(const q of[-1,0,1])v.e(q*1.0,3.0,2.05,.55,.1,.3,shade(BEL,.9));
 // left arm rests on the knee, right arm holds the torch up high
 v.limb([-2.6,4.9,0],[-3.3,3.5,.6],.8,.72,4,G);v.limb([-3.3,3.5,.6],[-2.7,2.55,1.9],.72,.7,3,G);v.e(-2.6,2.5,2.2,.95,.7,.9,GL);for(const q of[-1,0,1])v.o(-2.6+q*.55,2.3,3.0,.3,GL);
 v.limb([2.6,4.9,0],[3.8,4.7,.7],.8,.72,4,G);v.limb([3.8,4.7,.7],[4.1,6.5,1.0],.72,.7,4,G);v.o(4.1,6.9,1.0,.95,GL);for(const q of[-1,0,1])v.o(3.65+q*.0+.1*q,7.45,1.35+q*.0,.28,GL);
 v.b(4.1,7.9,1.0,.24,2.4,.24,0x6a4a2a);v.c(4.1,9.15,1.0,.5,.3,GOLD,'g');const f=v.at(4.1,9.5,1.0);flame(f[0],f[1],f[2],1.9*s,true);
 // head: wide ellipsoid, cheeks, brow ridge, big eyes with heavy lids, wide red-lipped mouth
 v.e(0,7.0,.15,3.45,2.45,2.65,G);v.e(0,8.4,.2,2.8,.75,2.2,GL);
 for(const t of[-1,1]){v.e(t*2.6,6.3,1.0,1.15,.95,1.0,GL);v.e(t*1.5,7.7,1.7,1.12,.9,.75,0xffffff);v.o(t*1.42,7.55,2.3,.4,0x14110e);v.o(t*1.55,7.72,2.58,.12,0xffffff);
  v.e(t*1.5,8.2,1.85,1.22,.55,.85,G);v.e(t*1.5,7.98,2.12,1.18,.1,.55,DK);v.e(t*1.5,8.62,1.9,1.1,.28,.7,GD)}
 v.e(0,6.32,2.12,2.5,.27,.46,LIP);v.e(0,6.08,2.16,2.2,.09,.4,0x4a1216);v.e(0,5.86,2.12,2.1,.28,.46,LIP);v.e(0,5.2,1.95,1.3,.35,.7,GD);
 for(const t of[-1,1]){v.o(t*.38,6.95,2.55,.14,DK);v.o(t*2.55,6.15,1.75,.3,LIP)}
 crown(v,0,9.35,.2,3.4,2.6);
 v.glow(0,7.0,1.2,10,0xb8ff9a)}
K.pepeStatue=pepeStatue;
// ======================================================================= Doge: a fluffy shiba bust, cream mask and chest, blue collar with a gold tag, cone ears, crown
function dogeStatue(x,y0,z,ry,s,o){if(isDry())return;s=s||1;const v=W(x,y0,z,ry,s),OR=0xe8a13a,OL=0xf5c36a,OD=0xc9812a,CR=0xfbf0d2,PK=0xf0a8b0;
 // chest and shoulders with a cream bib, blue collar and a gold tag
 v.e(0,1.55,-.3,3.45,2.2,2.5,OR);v.e(0,1.35,1.2,1.95,1.75,1.1,CR);v.e(0,.9,-1.5,2.2,1.2,1.4,OD);
 v.e(0,2.95,.4,2.55,.5,2.15,BLUE);v.o(0,2.35,2.35,.5,GOLD,'g');v.e(0,2.35,2.55,.3,.3,.12,0xfff0a0,'g');
 for(const t of[-1,1]){v.e(t*3.0,1.2,.6,.9,1.2,1.1,OR);v.e(t*3.1,.35,1.3,.85,.4,.9,CR)}
 // head: wide round shiba skull with fluffy cheeks, cream mask, muzzle, black nose, smile and tongue
 v.e(0,5.2,.2,3.55,2.85,2.8,OR);v.e(0,6.9,.1,2.7,.9,2.2,OL);
 for(const t of[-1,1]){v.e(t*2.55,4.4,1.1,1.35,1.5,1.3,CR);v.e(t*2.95,3.9,.9,.7,.7,.7,CR);v.o(t*1.22,6.15,2.35,.34,CR)}
 v.e(0,5.9,2.35,.75,.95,.45,CR);v.e(0,4.35,2.25,1.7,1.25,1.3,CR);v.e(0,3.7,2.3,1.2,.6,.9,CR);v.e(0,4.78,3.3,.55,.4,.4,0x14110e);
 v.e(0,3.62,3.1,.7,.1,.35,0x3a2418);v.e(0,3.15,2.85,.45,.28,.5,0xe36a7a);
 for(const t of[-1,1]){v.e(t*1.45,5.35,2.5,.5,.62,.3,0x14110e);v.o(t*1.32,5.58,2.72,.14,0xffffff);v.e(t*1.5,6.05,2.4,.7,.1,.2,OD)}
 // ears: tall cones with pink inside
 for(const t of[-1,1]){v.k(t*2.2,7.9,0,1.25,.12,2.6,OR);v.k(t*2.2,7.75,.5,.8,.1,2.0,PK)}
 crown(v,0,7.45,.2,2.9,2.2);
 v.glow(0,5.2,2,12,0xffe2a0)}
K.dogeStatue=dogeStatue;
// ======================================================================= Troll: a huge round-skulled face with a wide toothy grin, heavy brows, a bulb nose and a tuft of moss
function trollHead(x,y0,z,ry,s,o){if(isDry())return;s=s||1;const v=W(x,y0,z,ry,s),SK=0xeccf9f,SD=0xcfa977,SL=0xf8e4bd,BK=0x14110e,MO=0x2a120e;
 // round skull, wide cheeks that push up under the eyes, short chin, ears
 v.e(0,2.7,0,3.45,3.0,2.2,SK);v.e(0,1.0,.35,2.6,1.4,1.75,SK);v.e(0,.35,.75,1.0,.55,.9,SD);
 for(const t of[-1,1]){v.e(t*2.3,1.95,.95,1.5,1.25,1.15,SL);v.e(t*3.5,2.7,-.1,.55,1.0,.85,SD);v.e(t*3.55,2.7,.05,.25,.6,.5,SK)}
 // heavy brows sloping down to the nose, half-closed lids, white eyes with black pupils
 for(const t of[-1,1]){v.e(t*2.05,4.0,1.65,1.1,.42,.7,BK);v.e(t*.95,3.7,1.78,.85,.4,.65,BK);
  v.e(t*1.6,3.15,1.8,1.1,.55,.55,0xffffff);v.o(t*1.4,3.1,2.2,.32,BK);v.e(t*1.6,3.45,1.9,1.18,.28,.6,SK);v.e(t*1.6,3.57,1.95,1.18,.08,.55,BK)}
 // nose and the big grin: a wide mouth with the corners curling up into the cheeks, a row of teeth along the top and a smaller row below
 v.o(0,2.35,2.1,.62,SD);v.o(0,2.2,2.55,.42,0xd9b684);for(const t of[-1,1])v.o(t*.2,2.0,2.9,.1,BK);
 v.e(0,1.35,1.8,3.0,.62,.35,MO);for(const t of[-1,1]){v.e(t*2.9,1.7,1.6,.6,.45,.35,MO);v.e(t*3.3,2.15,1.4,.32,.38,.35,MO)}
 for(let i=-4;i<=4;i++){v.b(i*.6,1.68,2.2,.52,.5,.24,0xffffff);if(Math.abs(i)<4)v.b(i*.6,1.02,2.18,.52,.34,.24,0xf2f2f2)}
 v.e(0,.78,1.9,1.9,.2,.45,SD);
 // moss tuft on top
 for(let i=0;i<7;i++)v.e(-2.4+i*.8,5.5+((i*7)%3)*.12,((i*5)%3-1)*.5,.7,.42,.7,i%2?0x3f8f3a:0x58a845);
 v.glow(0,2.6,2.6,10,0xffe0a0)}
K.trollHead=trollHead;
// ======================================================================= Pig: the big blocky voxel pig head of Pork Portal Plaza (bevelled block, snout, folded ears, glinting eyes, crown)
function pigHead(x,y0,z,ry,s,o){if(isDry())return;s=s||1;const v=W(x,y0,z,ry,s),PK=0xf1a0b8,PL=0xffc6d6,PD=0xd9788f,PH=0xf8b4c8;
 // bevelled block head, lighter top, cheek blush, studs
 v.b(0,2.0,0,5.4,3.6,3.6,PK);v.b(0,2.0,0,5.0,4.0,3.2,PK);v.b(0,2.0,0,4.6,4.2,2.9,PH);v.b(0,4.18,0,5.0,.3,3.2,PL);
 for(const t of[-2,-1,0,1,2])for(const u of[-1,0,1])v.b(t*.98,4.4,u*.98,.62,.14,.62,PL);
 for(const t of[-1,1])v.e(t*2.2,1.55,1.7,.75,.55,.2,PD);
 // snout with two dark nostrils
 v.b(0,1.3,2.15,2.5,1.7,.9,PD);v.b(0,1.3,2.62,2.2,1.4,.12,0xf6b4c6);v.b(0,1.3,2.55,2.3,1.5,.1,PD);
 for(const t of[-1,1]){v.b(t*.58,1.3,2.72,.42,.6,.1,0x6a2a3c)}
 v.b(0,.55,1.85,2.6,.16,.1,PD);
 // eyes: white, dark pupil, glint, brows
 for(const t of[-1,1]){v.b(t*1.5,2.85,1.82,1.1,1.0,.2,0xffffff);v.b(t*1.58,2.85,1.95,.6,.8,.14,0x1a1018);v.b(t*1.45,3.1,2.03,.26,.26,.1,0xffffff);v.b(t*1.5,3.55,1.82,1.2,.22,.2,PD)}
 // ears flop forward at the top corners
 for(const t of[-1,1]){v.b(t*2.6,4.5,-.2,1.5,1.3,1.1,PK);v.b(t*2.7,4.35,.45,1.0,.9,.2,PD);v.b(t*2.5,5.3,-.2,1.0,.4,.9,PL)}
 crown(v,0,4.3,0,3.4,2.4)}
K.pigHead=pigHead;
// ======================================================================= Stonks man: a minifig-style suited giant: gold head with a stud, sunglasses, smirk, red tie, lapels, thumbs-up
function suitStatue(x,y0,z,ry,s,o){if(isDry())return;s=s||1;const v=W(x,y0,z,ry,s),SU=0x2b3560,SL=0x3a4684,SD=0x1d2548,GH=0xf2c034,GD=0xd6a21e,WH=0xf4f4f4,RD=0xd0002a;
 // legs hidden behind the plinth: waist and jacket
 v.b(0,.9,0,4.4,1.8,2.5,SD);v.b(0,3.0,0,5.6,3.0,2.8,SU);v.b(0,5.0,0,6.2,1.2,2.8,SU);v.e(0,5.7,0,3.1,.7,1.45,SU);
 // shirt, tie (knot and blade), lapels, buttons, pocket square
 v.b(0,3.7,1.43,1.5,3.6,.1,WH);v.b(0,5.5,1.46,1.0,.6,.14,RD);v.b(0,4.1,1.5,.62,3.0,.14,RD);v.b(0,2.45,1.52,.55,.5,.14,RD);
 for(const t of[-1,1]){v.b(t*1.0,4.4,1.45,.9,2.6,.16,SL);v.b(t*.85,5.4,1.5,.75,.5,.14,SL);v.b(t*1.9,2.7,1.5,.2,.2,.1,GD);v.b(t*2.2,4.3,1.5,.7,.5,.12,WH)}
 // shoulders rounded with cylinders, arms: left hangs, right gives a thumbs-up
 for(const t of[-1,1])v.o(t*3.25,5.3,0,1.05,SU);
 v.b(-3.6,3.0,.1,1.3,3.6,1.5,SU);v.b(-3.6,.95,.35,1.1,.8,1.1,GH);
 v.b(3.7,4.2,.55,1.3,1.5,1.7,SU);v.b(3.75,5.3,1.5,1.2,1.2,1.5,SU);v.b(3.75,5.9,2.3,1.1,.9,1.0,GH);v.b(3.85,6.75,2.3,.5,.9,.5,GH);
 // head: yellow minifig cylinder with a stud, neck, sunglasses with glints, smirk
 v.c(0,6.35,0,.9,.7,GH);v.c(0,7.7,0,1.65,2.5,GH);v.c(0,9.1,0,.55,.35,GH);
 v.b(0,7.85,1.32,3.3,.7,.3,0x0b0b10);for(const t of[-1,1]){v.b(t*1.45,7.85,.7,.22,.6,1.3,0x0b0b10);v.b(t*.85,7.95,1.5,.9,.2,.1,0x2a3a5a)}
 v.b(0,7.4,1.55,.4,.5,.2,GD);v.b(0,6.8,1.58,1.5,.2,.14,0x7a3a1a);v.b(.5,6.88,1.62,.5,.18,.12,0x7a3a1a);v.b(0,6.8,1.5,1.0,.14,.1,0xffffff);
 v.glow(0,7.8,2,8,0xffe49a)}
K.suitStatue=suitStatue;
// ======================================================================= Nyan cat: a frosted pop-tart with sprinkles, a round grey cat head with a face, cone ears, stubby paws and a wavy rainbow trail along -x
function nyanCat(x,y,z,ry,s,o){if(isDry())return;s=s||1;const v=W(x,y,z,ry,s),GR=0x8d8d96,GL=0xa4a4ad,GD=0x6e6e78,RB=[0xff2a2a,0xff9a1a,0xffe81a,0x2ae82a,0x2a8aff,0x8a3aff];
 for(let i=0;i<6;i++)for(let k=0;k<14;k++){const wave=Math.round(Math.sin(k*.7)*.5)*.5;v.b(-3.4-k*1.1,2.5-i*.62+wave-1.6,0,1.1,.62,.9,RB[i])}
 // pop-tart: tan biscuit with a pink frosting layer, dark rim and sprinkles
 v.b(0,0,0,6.6,5.2,1.3,0xf6e6a8);v.b(0,0,.2,6.0,4.6,1.2,0xf49ac2);v.e(0,0,.62,2.9,2.2,.12,0xf8aad0);
 for(const[px,py]of[[-2,1.4],[1.9,1.6],[-.6,.2],[2.4,-.7],[-2.2,-1.2],[0.4,-1.7],[-1.1,1.9],[1.2,.6],[-1.6,-.2]])v.b(px,py,.85,.55,.28,.2,0xff3a7a);
 // head: round, with cheeks, whites, pupils, nose, smile; ears are cones
 v.e(4.7,.55,.15,2.1,1.85,1.15,GR);v.e(4.7,.45,1.0,1.8,1.55,.35,GL);
 for(const t of[-1,1]){v.k(4.7+t*1.3,2.15,.1,.8,.08,1.5,GD);v.k(4.7+t*1.3,2.1,.55,.5,.06,1.1,0xf0a8b0);
  v.e(4.7+t*1.15,.95,1.12,.5,.5,.2,0xffffff);v.o(4.7+t*1.15+t*.05,.9,1.28,.22,0x14110e);v.o(4.7+t*1.15+t*.12,1.02,1.4,.07,0xffffff);v.e(4.7+t*1.35,-.4,1.1,.42,.38,.2,0xff9ab0)}
 v.e(4.7,.25,1.35,.2,.14,.12,0x14110e);v.b(4.35,-.2,1.3,.45,.1,.1,0x14110e);v.b(5.05,-.2,1.3,.45,.1,.1,0x14110e);v.b(4.7,-.12,1.3,.2,.1,.1,0x14110e);
 for(const[px,py]of[[-2.6,-3],[-.8,-3],[2.2,-3],[3.8,-3]])v.e(px,py,.2,.55,.5,.5,GR);v.limb([-3.2,-1.2,.2],[-4.5,-.6,.2],.28,.22,3,GR)}
K.nyanCat=nyanCat;
})();
