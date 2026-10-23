/* Maps, part 6 (round 16): Spookstone Keep, the twelfth arena from the Map Vote Preview Cards sheet. A haunted castle keep at night with green-lit windows,
   a graveyard of tombstones, crypts and dead trees, iron fences and flame posts, a full moon and bats. Same kit and the same grid rules as the other maps.
   Grid letters: c = cobbles, g = graveyard earth, K = solid (the keep and the four corner crypts). The keep has a roof deck (3.6 high) that is reached by four
   stairs, a tall central tower and four round corner towers. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,wall,cren,plain,rtower,stairs,crate,barrel,lamp,brazier,glow,sign,anim,curbs,bank,shade,mixc,rnd,lerp,add,TH,isDry,win,rail,gable,clouds}=LB;
const PI=Math.PI,mir=(f)=>{for(const sx of[-1,1])for(const sz of[-1,1])f(sx,sz)};
const STN=0x4b5066,STD=0x363a4c,STL=0x646a82,MOS=0x3f6a3c,GRN=0x39ff7a,GLS=0x7dffa8,ORG=0xff8a2a,ROOF=0x2c3f66,WD=0x3a2a22,IRON=0x1b1d27;
const KT=()=>MAPS.kit;
function skCell(c,r){
 if(c<=4&&r<=3)return'K';
 if(c>=13&&r>=13)return'K';
 if(r<=1&&c>=5)return'c';
 if(c<=1&&r>=4)return'c';
 if((c>=5&&c<=6&&r<=5)||(r>=4&&r<=5&&c<=6))return'c';
 return'g'}
const SKG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=skCell(c,r);SKG.push(s)}
// ---------------------------------------------------------------- the keep
function keep(){
 const H=3.6;
 col(-10,10,-8,8,H);
 // roof parapet with a gap where each of the four stairs arrives
 const par=(a,b,c,d)=>{col(a,b,c,d,H+1.1,H);if(!isDry())wall(a,b,c,d,1.0,STN,{y0:H,col:false,studs:true,sc:STD})};
 for(const sz of[-1,1]){const z1=sz>0?7.5:-8,z2=sz>0?8:-7.5;par(-10,-7.5,z1,z2);par(-4.5,4.5,z1,z2);par(7.5,10,z1,z2)}
 par(-10,-9.5,-7.5,7.5);par(9.5,10,-7.5,7.5);
 // the central tower
 col(-3.2,3.2,-3,3,19,H);
 if(isDry())return;
 wall(-10,10,-8,8,H,STN,{col:false,studs:false,band:[0,STD]});
 bx(0,H+.06,0,19.6,.12,15.6,STD);studs(-9.6,9.6,-7.6,7.6,H+.12,STD,1.2);
 wall(-3.2,3.2,-3,3,13,STN,{y0:H,col:false,band:[3,STD]});
 for(const[ax,x,z]of[[true,0,3.05],[true,0,-3.05],[false,3.25,0],[false,-3.25,0]])for(const y of[H+4,H+8.6]){win(ax?x:x,y,ax?z:z,ax,.9,2.0,GLS,STL)}
 for(let i=0;i<7;i++){const w=7.4-i*1.05,y=H+13+.35+i*.62;bx(0,y,0,w,.6,w*.92,i%3===2?shade(ROOF,1.25):ROOF)}
 cy(0,H+13+7*.62+.4,0,.16,.5,0xffc828,'g');bx(0,H+13+7*.62+1.5,0,.07,1.9,.07,0xcfcfcf);bx(.5,H+13+7*.62+2.1,0,1.0,.6,.05,0x2a8a5a);
 // facade: tall gothic windows with green light, a dark door with an orange glow, banners and torches
 for(const sz of[-1,1]){const fz=sz*8.02,ry=sz>0?0:PI;
  for(const x of[-9,-3.5,3.5,9])win(x,1.9,fz,true,.95,1.9,GLS,STL);
  bx(0,1.5,fz,3.0,3.0,.14,0x14121a);bx(0,1.5,fz+sz*.08,2.5,2.6,.1,0xffa040,0,'eL');for(let k=-3;k<=3;k++)bx(k*.38,1.6,fz+sz*.16,.1,2.8,.1,IRON);bx(0,1.5,fz+sz*.16,2.6,.1,.1,IRON);
  bx(0,3.2,fz,3.6,.5,.4,STL);bx(0,3.55,fz,2.2,.3,.34,STL);
  for(const x of[-2.4,2.4]){KT().wallTorch(x,2.4,fz+sz*.05,ry,{glow:true})}
  for(const x of[-6.6,6.6])KT().crownBanner(x,3.4,fz+sz*.05,ry,1.3,2.8,0x2a4a8a,0xffc828)}
 for(const sx of[-1,1]){const fx=sx*10.02,ry=sx>0?PI/2:-PI/2;for(const z of[-4,0,4])win(fx,1.9,z,false,.95,1.9,GLS,STL);KT().vines(fx,3.4,-5.5,ry,2.6,3,sx+1);KT().vines(fx,3.4,5.5,ry,2.6,3,sx+3)}
 // flames on the roof corners
 for(const a of[-9.6,9.6])for(const b of[-7.6,7.6]){bx(a,H+1.3,b,.5,.3,.5,STL);KT().flame(a,H+1.45,b,1.2,true)}
 // four round corner towers
}
function keepTowers(){for(const sx of[-1,1])for(const sz of[-1,1])rtower(sx*10,sz*8,2.4,11.5,STN,{roof:ROOF,flag:0x2a8a5a,slits:4,sa:.4})}
// ---------------------------------------------------------------- graveyard
function tomb(x,z,ry,kind){
 const w=kind===1?.3:.95,d=kind===1?.3:.4;col(x-.5,x+.5,z-.5,z+.5,kind===1?1.6:1.3);if(isDry())return;
 bx(x,.14,z,1.1,.28,.7,STD,ry);
 if(kind===1){bx(x,.9,z,.3,1.5,.3,STL,ry);const s=Math.sin(ry||0),c=Math.cos(ry||0);bx(x,1.2,z,.95,.28,.28,STL,ry)}
 else{bx(x,.65,z,w,1.0,d,STL,ry);bx(x,1.22,z,w-.15,.22,d,STL,ry);bx(x,1.36,z,w-.5,.12,d,shade(STL,1.1),ry);bx(x+Math.cos(ry||0)*.2,.9,z-Math.sin(ry||0)*.2,.3,.06,d+.02,0x2a2d3a,ry);bx(x,.5,z,.5,.5,d+.03,0x2a2d3a,ry)}
 if(rnd(x,z,4)<.6)bx(x+.2,.32,z+.35,.5,.2,.4,MOS)}
function crypt(cx,cz,w,d,face){ // face: +1/-1 which z side the door looks to
 const H=3.2;col(cx-w/2,cx+w/2,cz-d/2,cz+d/2,H+1.6);if(isDry())return;
 wall(cx-w/2,cx+w/2,cz-d/2,cz+d/2,H,STN,{col:false,studs:true,sc:STD,band:[0,STD]});
 gable(cx,cz,w,d,H,ROOF,true,.4);
 const fz=cz+face*(d/2+.02);bx(cx,1.35,fz,1.6,2.5,.16,0x14121a);bx(cx,1.3,fz+face*.06,1.3,2.1,.1,GRN,0,'eW');bx(cx,2.7,fz,2.0,.35,.3,STL);
 for(const s of[-1,1]){bx(cx+s*1.4,1.1,fz,.3,2.2,.3,STL);KT().flame(cx+s*1.7,2.6,fz+face*.1,1.0,s>0)}
 bx(cx,H+2.2,cz,.14,.9,.14,STL);bx(cx,H+2.4,cz,.6,.14,.14,STL)}
function deadTree(x,z,s,seed){
 s=s||1;col(x-.45*s,x+.45*s,z-.45*s,z+.45*s,3.4*s);if(isDry())return;
 bx(x,.7*s,z,1.0*s,1.4*s,1.0*s,WD);bx(x,1.9*s,z,.8*s,1.2*s,.8*s,shade(WD,.95));bx(x,3.0*s,z,.6*s,1.2*s,.6*s,WD);bx(x,3.9*s,z,.42*s,.9*s,.42*s,shade(WD,.9));
 for(let i=0;i<7;i++){const a=rnd(seed,i,1)*PI*2,h=(2.0+rnd(seed,i,2)*2.2)*s,L=(.9+rnd(seed,i,3)*1.0)*s;
  const bxx=x+Math.cos(a)*L*.5,bzz=z+Math.sin(a)*L*.5;bx(bxx,h,bzz,Math.abs(Math.cos(a))*L+.18*s,.2*s,Math.abs(Math.sin(a))*L+.18*s,shade(WD,.85));
  bx(x+Math.cos(a)*L,h+.55*s,z+Math.sin(a)*L,.16*s,1.1*s,.16*s,WD);if(i%2)bx(x+Math.cos(a)*L*.7,h+.9*s,z+Math.sin(a)*L*.7,.14*s,.9*s,.14*s,WD)}
 bx(x+.9*s,.12,z+.4*s,.9*s,.24*s,.4*s,WD,.5)}
function ironFence(x1,z1,x2,z2,posts,col0){ // visual iron railings, optional stone posts with flames
 if(isDry())return;const ax=Math.abs(x2-x1)>=Math.abs(z2-z1),L=ax?Math.abs(x2-x1):Math.abs(z2-z1),n=Math.max(2,Math.round(L/.45)),X=(t)=>x1+(x2-x1)*t,Z=(t)=>z1+(z2-z1)*t;
 for(let i=0;i<=n;i++){const t=i/n;bx(X(t),.85,Z(t),.07,1.7,.07,IRON);bx(X(t),1.78,Z(t),.12,.2,.12,IRON)}
 bx((x1+x2)/2,.4,(z1+z2)/2,ax?L:.06,.07,ax?.06:L,IRON);bx((x1+x2)/2,1.3,(z1+z2)/2,ax?L:.06,.07,ax?.06:L,IRON);
 if(posts){const m=Math.max(1,Math.round(L/6));for(let i=0;i<=m;i++){const t=i/m,px=X(t),pz=Z(t);bx(px,1.1,pz,.6,2.2,.6,STN);bx(px,2.3,pz,.8,.2,.8,STL);if(i%2===0)KT().flame(px,2.4,pz,1.1,i%4===0)}}}
function pumpkin(x,z,s){if(isDry())return;s=s||1;bx(x,.3*s,z,.7*s,.55*s,.7*s,0xff8a1a,0,'eF');bx(x,.62*s,z,.1*s,.18*s,.1*s,0x3a5a1c);bx(x,.34*s,z+.36*s,.42*s,.22*s,.06,0x3a1400);bx(x,.5*s,z+.36*s,.46*s,.1*s,.06,0xffe28a,0,'eF')}
function coffin(x,z,ry){const ax=!(Math.abs(Math.sin(ry||0))>.5),w=ax?2.3:.95,d=ax?.95:2.3;col(x-w/2,x+w/2,z-d/2,z+d/2,.85);if(isDry())return;
 bx(x,.4,z,w,.7,d,0x4a352a);bx(x,.78,z,w-.12,.14,d-.12,0x5d4535);bx(x,.5,z,w+.02,.07,d+.02,0x2a2118);if(ax){bx(x,.88,z,.12,.06,.5,0xc9b27a);bx(x,.88,z,.6,.06,.12,0xc9b27a)}else{bx(x,.88,z,.5,.06,.12,0xc9b27a);bx(x,.88,z,.12,.06,.6,0xc9b27a)}}
function spawnGate(sx){const x=sx*27.6;
 for(const z of[-3.4,3.4]){col(x-.5,x+.5,z-.5,z+.5,5);if(!isDry()){bx(x,2.5,z,1.0,5,1.0,STN);bx(x,.2,z,1.3,.4,1.3,STD);bx(x,5.1,z,1.3,.25,1.3,STL);KT().flame(x,5.25,z,1.5,true)}}
 if(isDry())return;bx(x,4.7,0,.8,.7,7.4,STD);bx(x,4.2,0,.2,.3,6.3,IRON);for(let k=-6;k<=6;k++)bx(x,3.4,k*.5,.07,1.6,.07,IRON);
 KT().crownBanner(x-sx*.55,4.4,-3.4,sx>0?-PI/2:PI/2,1.0,2.4,0x2a4a8a,0xffc828);KT().crownBanner(x-sx*.55,4.4,3.4,sx>0?-PI/2:PI/2,1.0,2.4,0x2a4a8a,0xffc828)}
// bats: dark little boxes with flapping wings circling in the moonlight
function bats(){if(isDry())return;const B=[];for(let i=0;i<9;i++){const g=new TH.Group(),m=new TH.MeshBasicMaterial({color:0x07070d,fog:false});
  const body=new TH.Mesh(new TH.BoxGeometry(.35,.3,.6),m),w1=new TH.Mesh(new TH.BoxGeometry(1.2,.06,.5),m),w2=new TH.Mesh(new TH.BoxGeometry(1.2,.06,.5),m);
  w1.position.x=-.7;w2.position.x=.7;g.add(body,w1,w2);g.scale.set(1.6,1.6,1.6);add(g);B.push({g,w1,w2,r:16+rnd(i,1)*26,h:11+rnd(i,2)*14,sp:(.25+rnd(i,3)*.3)*(i%2?1:-1),ph:rnd(i,4)*9,cx:(rnd(i,5)-.5)*14,cz:(rnd(i,6)-.5)*14})}
 anim((dt,T)=>{for(const b of B){const a=T*b.sp+b.ph;b.g.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(T*1.3+b.ph)*1.5,b.cz+Math.sin(a)*b.r);b.g.rotation.y=-a+(b.sp>0?0:PI);const f=Math.sin(T*14+b.ph)*.7;b.w1.rotation.z=f;b.w2.rotation.z=-f}})}
MAPS.reg({id:'spook',hide:true,name:'Spookstone Keep',tag:'Haunted keep at night',theme:'A haunted castle keep under a full moon: green-lit windows, a graveyard of tombstones and crypts, dead trees and flaming iron gates.',
 blurb:'Fight through the graveyard, hide behind tombstones and crypts and climb the keep stairs to the roof deck while the bats circle the moon.',
 th:['#3a8a78','#0a1630'],
 grid:SKG,
 tiles:{c:{c:0x6a7088,a:0x5f6580,v:.08,s:1},g:{c:0x35432f,a:0x2f3c2a,v:.14,s:0}},
 light:[{t:0,top:0x050b1e,mid:0x0f2a44,bot:0x1f4a52,fog:0x16343e,fn:40,ff:160,sun:0x9ac8ff,si:.3,sp:[-36,46,-40],hs:0x6a9ac8,hg:0x2a3a3a,hi:.52,disc:0xe8f6ff,dsz:60,dop:.95,lamp:1,star:.9},
  {t:1,top:0x030814,mid:0x0a1c32,bot:0x16363e,fog:0x102830,fn:30,ff:130,sun:0x7aa8e8,si:.24,sp:[-34,50,-36],hs:0x5a80b0,hg:0x1a2828,hi:.44,disc:0xdbeeff,dsz:56,dop:.9,lamp:1,star:1}],
 build(L){
  curbs(c=>c==='c'?0x4a4f62:0x2a3226,{h:.14});
  keep();keepTowers();
  // the four stairs up to the roof deck: two on the south face, two on the north face
  for(const sx of[-1,1]){stairs(sx*6,8+8*.75,3,8,3,0x5d6379,.45,.75);stairs(sx*6,-8-8*.75,2,8,3,0x5d6379,.45,.75)}
  spawnGate(1);spawnGate(-1);
  mir((sx,sz)=>{
   // graveyard: tombstones and crosses in loose rows
   for(const[x,z,k]of[[15.5,7.6,0],[18,7,1],[20.5,7.8,0],[16.5,10.4,1],[19.2,10,0],[22,10.6,0],[15.2,13.4,0],[18,14,1],[21,13.6,0],[24.2,14.2,1],[25,8.2,0],[12.4,17.4,0],[16,19.4,1],[20.4,18,0],[8.6,19.6,0]])
    tomb(sx*x,sz*z,(rnd(x,z,9)-.5)*.5+(sx>0?0:PI),k);
   for(const[x,z,s,sd]of[[13,16.4,.9,1],[24.5,6.2,.8,2],[9,22.6,1,3],[26.4,19.6,.9,4],[20.6,22.4,.8,5]])deadTree(sx*x,sz*z,s,sd+sx*3+sz*7);
   crypt(sx*28,sz*28,4,4,-sz);
   coffin(sx*23,sz*4.8,0);coffin(sx*12.6,sz*21,PI/2);
   // iron fences between the road and the graveyard, and a flame lamp every few metres along the road
   ironFence(sx*7,sz*4.4,sx*26,sz*4.4,false);ironFence(sx*4.4,sz*14.6,sx*4.4,sz*26,false);
   for(const x of[8,13,18,23])lamp(sx*x,sz*4.7,3.4,GLS);for(const z of[17,22])lamp(sx*4.7,sz*z,3.4,GLS);
   for(const[x,z]of[[14.4,9.6],[22.8,16.2],[10.6,13.2],[18.6,23.4]])pumpkin(sx*x,sz*z,1+rnd(x,z,2)*.3);
   // low ruined walls as cover
   wall(Math.min(sx*16,sx*19.6),Math.max(sx*16,sx*19.6),sz*5.9-.3,sz*5.9+.3,1.25,STN,{studs:true,sc:STD});
   wall(sx*10.8-.3,sx*10.8+.3,Math.min(sz*16,sz*19.6),Math.max(sz*16,sz*19.6),1.25,STN,{studs:true,sc:STD});
   barrel(sx*14.4,sz*5.6,0x5a4030);crate(sx*26.4,sz*10.4,1.5,0x4a3a2c);
  });
  // perimeter railings (visual) with stone posts and flames
  for(const s of[-1,1]){ironFence(-29.8,s*29.8,29.8,s*29.8,true);ironFence(s*29.8,-29.8,s*29.8,29.8,true)}
  bats();
  // a green witch-fire glow at the foot of the keep
  if(!isDry())for(const x of[-5,5])glow(x,.8,10.5,5.5,0x39ff7a);
 },
 env(){
  bank(0,0x1d2624,{h:2,hole:30,R:240});
  clouds(14,34,70,170,0x23304a,6);
  // black hills with dead trees and a far, tall fortress with green windows
  const hill=(x,z,w,h,c)=>{const k=Math.max(4,Math.round(h/2.4));for(let i=0;i<k;i++){const f=1-i/(k+.5);bx(x,h*(i+.5)/k-2,z,w*f,h/k+.05,w*f*(.8+.2*Math.sin(i+x)),shade(c,1+(i%2?.05:-.04)))}};
  for(let i=0;i<10;i++){const a=i/10*PI*2+.3,r=100+rnd(i,2)*40;hill(Math.cos(a)*r,Math.sin(a)*r,34+rnd(i,3)*24,14+rnd(i,4)*16,[0x1c2a2c,0x222f33,0x182426][i%3])}
  for(let i=0;i<30;i++){const a=i/30*PI*2+.1,r=36+rnd(i,6)*50,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<33&&Math.abs(z)<33)continue;deadTree(x,z,1.0+rnd(i,7)*.7,i)}
  for(const[x,z,s]of[[-60,-110,1.4],[70,-100,1.2],[0,-130,1.8]]){bx(x,10*s,z,34*s,20*s,8*s,0x2a2f40);for(let k=-3;k<=3;k++){KT().spireTower(x+k*5*s,z+(k%2)*3,1.8*s,(18+((k*5)&7)*2)*s,0x343a50,ROOF,{flames:true});}
   for(let k=-6;k<=6;k++)bx(x+k*2.4*s,10.8*s+.5,z+4.2*s,1.4,1.6,.8,0x343a50);for(let k=0;k<5;k++)bx(x-12*s+k*6*s,12*s,z+4.2*s+.05,1.0,2.4,.1,GRN,0,'eW')}
 }
});
})();
