/* Maps, part 5: the two tournament arenas, Last Brick Colosseum and Royal Rift Arena. They are marked tour:true, so the map picker and Random never use them;
   only the Tournament tab does. Same kit and the same grid rules as the other map files. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,wall,cren,plain,stairs,crate,barrel,lamp,brazier,banner,glow,sign,shade,mixc,rnd,lerp,anim,curbs,rail,clouds,win,door,gable,isDry,TH,add}=LB;
const PI=Math.PI,mir=(f,z)=>{for(const sx of[-1,1]){if(z===false)f(sx,1);else for(const sz of[-1,1])f(sx,sz)}};
const FONT='"Comic Sans MS","Chalkboard SE",cursive,sans-serif';
function merge(sel){const N=30,u=[],used=[];for(let j=0;j<N;j++){u.push([]);used.push([]);for(let i=0;i<N;i++){u[j].push(!!sel(i*2-29,j*2-29));used[j].push(false)}}
 const out=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(!u[j][i]||used[j][i])continue;let w=1;while(i+w<N&&u[j][i+w]&&!used[j][i+w])w++;let h=1;
  for(;j+h<N;h++){let ok=true;for(let k=0;k<w;k++)if(!u[j+h][i+k]||used[j+h][i+k]){ok=false;break}if(!ok)break}
  for(let a=0;a<h;a++)for(let b=0;b<w;b++)used[j+a][i+b]=true;out.push([i*2-30,(i+w)*2-30,j*2-30,(j+h)*2-30])}return out}
const GOLD=0xffd02f;
function crownArt(c1,c2,txt){return(g,w,h)=>{g.fillStyle=c2;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.07)';for(let k=0;k<8;k++)g.fillRect(0,k*h/8,w,h/16);
 g.strokeStyle='#ffd02f';g.lineWidth=h*.035;g.strokeRect(h*.05,h*.05,w-h*.1,h*.9);
 const cx=w/2,cy0=h*.46,cw=w*.34,ch=h*.34;g.fillStyle=c1;g.strokeStyle='#14141c';g.lineWidth=h*.02;
 g.beginPath();g.moveTo(cx-cw/2,cy0+ch/2);g.lineTo(cx-cw/2,cy0-ch*.2);g.lineTo(cx-cw*.25,cy0+ch*.05);g.lineTo(cx,cy0-ch*.5);g.lineTo(cx+cw*.25,cy0+ch*.05);g.lineTo(cx+cw/2,cy0-ch*.2);g.lineTo(cx+cw/2,cy0+ch/2);g.closePath();g.fill();g.stroke();
 g.fillStyle='#ffd02f';g.fillRect(cx-cw/2,cy0+ch*.25,cw,ch*.25);g.strokeRect(cx-cw/2,cy0+ch*.25,cw,ch*.25);
 g.fillStyle='#fff';for(const x of[-cw*.3,0,cw*.3]){g.beginPath();g.arc(cx+x,cy0+ch*.375,h*.022,0,PI*2);g.fill()}
 g.fillStyle='#fff';g.font='bold '+Math.round(h*.13)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h*.84)}}
// ======================================================================================= Last Brick Colosseum
// An octagonal sand arena inside tiered stands full of cheering minifigs. A raised dais with a gold brick trophy sits in the middle, columns and
// broken walls give cover, a blue gate in the west and a red gate in the east, and a stone tower in every corner (stairs from two sides).
// Grid letters: f = sand, r = dark sand ring, d = dais, s = team spawn plates, K = stands / corner tower.
const CK=(x,z)=>Math.max(Math.floor(Math.abs(x)/2)-13,Math.floor(Math.abs(z)/2)-13,Math.floor(Math.abs(x)/2)+Math.floor(Math.abs(z)/2)-20);
function coCell(c,r){
 const k=Math.max(c-13,r-13,c+r-20);
 if(k>=1)return'K';
 if(c>=9&&c<=10&&r>=9&&r<=10)return'K';
 if(c<=2&&r<=2)return'd';
 if(c>=10&&c<=12&&r<=1)return's';
 const q=c*c+r*r;if(q>=30&&q<=44)return'r';
 return'f';
}
const COG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=coCell(c,r);COG.push(s)}
const STO=0xcbbd9c,STOD=0xa89c7c,SAND=0xd8c08a,BLU=0x2f6fd8,RED=0xd83a3a;
const standH=k=>2.4+Math.min(8,k)*.9;
const SHIRT=[0x2f6fd8,0xd83a3a,0xffd02f,0xf2f2f2,0x3da85a,0xe86ab8,0x2a2c33,0xff9a3a];
function fan(x,y,z,seed){ // a spectator on a stand: body, head, sometimes arms up
 const side=x<0?0:1,col_=rnd(seed,x,z)<.55?SHIRT[side]:SHIRT[Math.floor(rnd(z,seed,x)*SHIRT.length)];
 bx(x,y+.4,z,.5,.8,.4,col_);cy(x,y+.94,z,.2,.3,0xf6c24a);
 if(rnd(x,z,seed)<.4){bx(x-.32,y+1.0,z,.12,.5,.12,col_);bx(x+.32,y+1.0,z,.12,.5,.12,col_)}}
function stands(){
 for(let k=1;k<=8;k++){
  const h=standH(k);
  for(const[x1,x2,z1,z2]of merge((x,z)=>MAPS.cell(x,z)==='K'&&CK(x,z)===k)){
   wall(x1,x2,z1,z2,h,k%2?STO:shade(STO,.93),{studs:true,sc:k%2?STO:shade(STO,.93),band:k===1?[3,0xd9a62a]:undefined});
   if(isDry())continue;
   for(let x=x1+.5;x<x2;x+=1)for(let z=z1+.5;z<z2;z+=1.0){if(rnd(x,z,k)<.2||(Math.abs(Math.abs(x)-22)<1.6&&Math.abs(Math.abs(z)-22)<1.6))continue;fan(x+(rnd(z,x,3)-.5)*.2,h+.07,z+(rnd(x,k,z)-.5)*.2,k)}}}}
function column(x,z,h){col(x-.8,x+.8,z-.8,z+.8,h);if(isDry())return;
 bx(x,.2,z,1.9,.4,1.9,STOD);cy(x,.55,z,.95,.3,STO);cy(x,h/2,z,.72,h-.7,STO);
 for(let k=0;k<6;k++){const a=k/6*PI*2;bx(x+Math.cos(a)*.7,h/2,z+Math.sin(a)*.7,.12,h-.8,.12,shade(STO,.88),a)}
 bx(x,h-.1,z,1.7,.3,1.7,shade(STO,1.05));bx(x,h+.15,z,2.0,.22,2.0,STOD);
 if(h>3){bx(x,h+.5,z,.8,.35,.8,0x23252b);bx(x,h+.8,z,.5,.4,.5,0xff7a1a,0,'eF');bx(x,h+1.1,z,.3,.34,.3,0xffc23a,0,'eF');glow(x,h+1.0,z,3.6,0xff9a3a)}}
function brokenColumn(x,z,h,r){col(x-r,x+r,z-r,z+r,h);if(isDry())return;cy(x,.2,z,r*1.25,.4,STOD);cy(x,h/2,z,r*.9,h,STO);
 for(let k=0;k<5;k++){const a=k/5*PI*2;bx(x+Math.cos(a)*r*.85,h/2,z+Math.sin(a)*r*.85,.1,h-.1,.1,shade(STO,.88),a)}
 cy(x,h+.05,z,r*.95,.1,shade(STO,1.1));stud(x,h+.14,z,STO);bx(x+r*1.3,.2,z+r*.4,.5,.35,.4,STOD,rnd(x,z,1)*3)}
function coTower(sx,sz){
 const cx=sx*20,cz=sz*20,x1=cx-2,x2=cx+2,z1=cz-2,z2=cz+2,DH=3.6;
 col(x1,x2,z1,z2,DH);
 wall(x1,x2,z1,z2,DH,STO,{col:false,studs:true,sc:STOD,band:[2,0xd9a62a]});
 const par=(a,b,c,d)=>{col(a,b,c,d,DH+1.1,DH);wall(a,b,c,d,1.0,STO,{y0:DH,col:false,studs:true,sc:STOD});if(!isDry())cren(a,b,c,d,DH+1.0,STO,.5)};
 par(sx>0?x2-.5:x1,sx>0?x2:x1+.5,z1,z2);par(sx>0?x1:x1+.5,sx>0?x2-.5:x2,sz>0?z2-.5:z1,sz>0?z2:z1+.5);
 if(!isDry()){bx(cx,DH+.05,cz,4.2,.1,4.2,STOD);const tc=sx<0?BLU:RED;
  bx(cx+sx*1.4,DH+2.4,cz+sz*1.4,.07,3.2,.07,0xcfcfcf);bx(cx+sx*1.4+sx*.0,DH+3.5,cz+sz*1.4+.5,.05,.9,1.0,tc);
  for(const[a,b]of[[-1.5,-1.5],[1.5,1.5]]){bx(cx+a,DH+.4,cz+b,.5,.6,.5,0x23252b);bx(cx+a,DH+.8,cz+b,.4,.3,.4,0xff7a1a,0,'eF');glow(cx+a,DH+1.0,cz+b,2.8,0xff9a3a)}}
 stairs(sx*11.6,cz,sx>0?0:1,8,2.4,0xc2b490,.45,.8);stairs(cx,sz*11.6,sz>0?2:3,8,2.4,0xc2b490,.45,.8)}
function coDais(){
 col(-6,6,-6,6,1.5);
 stairs(8.4,0,1,3,4,0xd6cfc0,.5,.8);stairs(-8.4,0,0,3,4,0xd6cfc0,.5,.8);stairs(0,8.4,3,3,4,0xd6cfc0,.5,.8);stairs(0,-8.4,2,3,4,0xd6cfc0,.5,.8);
 // gold brick trophy in the middle and four cover blocks on the corners of the dais
 col(-1.7,1.7,-1.7,1.7,5.0);
 for(const[a,b]of[[-3.7,-3.7],[3.7,-3.7],[-3.7,3.7],[3.7,3.7]])col(a-.8,a+.8,b-.8,b+.8,2.9);
 if(isDry())return;
 wall(-6,6,-6,6,1.5,0xb9b2a4,{col:false,studs:true,sc:0xcfc8ba,band:[1,GOLD]});
 cy(0,1.53,0,4.9,.05,GOLD,'g');cy(0,1.57,0,4.3,.05,0xb9b2a4);
 bx(0,1.9,0,3.4,.8,3.4,0x8a7e66);bx(0,2.6,0,2.8,.6,2.8,0xa99c80);bx(0,3.2,0,2.2,.6,2.2,0x8a7e66);
 bx(0,3.95,0,1.5,.9,3.3*.5,GOLD,0,'g');studs(-.75,.75,-.82,.82,4.4,GOLD,.6);bx(0,4.55,0,.3,.3,.3,0xfff0a0,0,'eN');
 glow(0,4.3,0,6,0xffd566);
 for(const[a,b]of[[-3.7,-3.7],[3.7,-3.7],[-3.7,3.7],[3.7,3.7]]){bx(a,2.25,b,1.6,1.5,1.6,STO);bx(a,3.02,b,1.7,.12,1.7,STOD);studs(a-.8,a+.8,b-.8,b+.8,3.08,STO,.8)}}
function coGate(sx){
 const x=sx*27.96,c=sx<0?BLU:RED;if(isDry())return;
 bx(x,1.6,0,.08,3.2,4.4,0x0b0a10);
 for(let k=-4;k<=4;k++)bx(x-sx*.03,1.6,k*.5,.06,3.2,.1,0x4a4d57);bx(x-sx*.03,1.4,0,.08,.1,4.4,0x4a4d57);bx(x-sx*.03,2.5,0,.08,.1,4.4,0x4a4d57);
 for(const z of[-2.4,2.4])bx(x-sx*.15,1.7,z,.4,3.4,.5,STOD);bx(x-sx*.15,3.45,0,.5,.5,5.4,STOD);bx(x-sx*.18,3.8,0,.5,.3,5.7,shade(STOD,.85));
 for(const z of[-4,4])banner(x-sx*.25,1.9,z,-sx*PI/2,1.2,2.2,c,GOLD)}
function coBanners(){if(isDry())return;
 for(const sx of[-1,1])for(const z of[-12,-8,8,12])banner(sx*27.7,1.9,z,-sx*PI/2,1.4,2.0,sx<0?BLU:RED,GOLD);
 for(const sz of[-1,1])for(const x of[-12,-8,-4,4,8,12])banner(x,1.9,sz*27.7,sz>0?PI:0,1.4,2.0,x<0?BLU:RED,GOLD)}
function coScreens(){if(isDry())return;
 for(const sx of[-1,1]){bx(sx*29.35,6.0,0,.5,3.8,8.0,0x17141f);sign(sx*29.09,6.0,0,-sx*PI/2,7.4,3.4,crownArt(sx<0?'#2f6fd8':'#d83a3a','#17141f',sx<0?'BLUE':'RED'),{pw:512,lit:true});
  bx(sx*29.6,3.3+.9,3.2,.3,1.8,.3,0x2a2c33);bx(sx*29.6,3.3+.9,-3.2,.3,1.8,.3,0x2a2c33)}}
function coLights(){if(isDry())return;
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*27.5,z=sz*27.5,y0=standH(6);
  bx(x,y0+4.5,z,.5,9,.5,0x5a5f68);bx(x,y0+9.2,z,2.8,1.4,.62,0x2a2c33);for(const a of[-.9,0,.9])for(const b of[-.35,.35])bx(x+a,y0+9.2+b,z-sz*.3,.7,.55,.06,0xfff4d0,0,'eL');
  glow(x,y0+9.2,z,8,0xfff0c0)}}
function outerStands(){
 const w=1.9,T=5;
 for(let t=0;t<T;t++){const h=3.3+(t+1)*.95,d0=30+t*w,c=t%2?shade(STO,.93):STO;
  for(const s of[-1,1]){
   bx(s*(d0+w/2),h/2,0,w-.02,h,60,c);bx(0,h/2,s*(d0+w/2),72,h,w-.02,shade(c,.97));
   for(let u=-29;u<=29;u+=1.3){if(rnd(u,t,s)<.18)continue;fan(s*(d0+.55+rnd(u,t,3)*.7),h,u,t+9);}
   for(let u=-35;u<=35;u+=1.3){if(rnd(u,t,s+4)<.18)continue;fan(u,h,s*(d0+.55+rnd(u,t,5)*.7),t+5)}}}
 // colourful pennants on poles at the top of the stands
 for(const[x,z]of[[-38.4,-18],[-38.4,18],[38.4,-18],[38.4,18],[-18,-38.4],[18,-38.4],[-18,38.4],[18,38.4]]){bx(x,10,z,.15,13,.15,0xcfcfcf);bx(x+(x>0?-.7:.7),15.2,z,1.4,.8,.05,x<0||z<0?BLU:RED)}
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*40,z=sz*40;bx(x,11,z,.6,22,.6,0x5a5f68);bx(x,22.5,z,3.4,1.8,.5,0x2a2c33);for(const a of[-1.1,0,1.1])for(const b of[-.45,.45])bx(x+a,22.5+b,z-sz*.3,.8,.7,.06,0xfff4d0,0,'eL');glow(x,22.5,z,10,0xfff0c0)}}
MAPS.reg({id:'colosseum',name:'Last Brick Colosseum',tag:'Tournament arena',theme:'An octagonal sand arena inside tiered stands, with a gold brick trophy on a raised dais.',
 blurb:'The quarterfinal arena: fight around the dais, climb a corner tower for the high ground and win in front of the crowd.',
 th:['#d8c08a','#6b4a2a'],tour:true,
 grid:COG,
 tiles:{f:{c:SAND,a:0xcdb47c,v:.1,s:1},r:{c:0xc2a86e,a:0xb89e66,v:.1,s:1},d:{c:0xb9b2a4,a:0xaaa395,v:.06,s:1},s:{c:(px,pz)=>px<0?0x4a78c8:0xc84a4a,a:(px,pz)=>px<0?0x3f6cba:0xb8404f,v:.05,s:1}},
 light:[{t:0,top:0x3d8ae0,mid:0x9acaf0,bot:0xfff0d4,fog:0xe0e4e8,fn:100,ff:280,sun:0xfff2d8,si:.62,sp:[26,52,18],hs:0xe6eeff,hg:0xa89a7a,hi:.56,disc:0xfff0c8,dsz:30,lamp:.05,star:0},
  {t:.55,top:0x3a3a8a,mid:0xe08a6a,bot:0xffcf8a,fog:0xd8a888,fn:75,ff:230,sun:0xffa660,si:.5,sp:[-54,14,-18],hs:0xe8b898,hg:0x7a5a4a,hi:.52,disc:0xffa660,dsz:50,lamp:.6,star:.05},
  {t:1,top:0x0c0e30,mid:0x3a2a6a,bot:0xa8505a,fog:0x3a2d5a,fn:55,ff:200,sun:0x9ab0ff,si:.32,sp:[-40,28,28],hs:0x8a8ae0,hg:0x3a2f58,hi:.5,disc:0xe6ecff,dsz:22,lamp:1,star:.8}],
 build(L){
  curbs(c=>c==='s'?0x8a8f99:0xb8a478,{h:.16});
  stands();
  mir((sx,sz)=>{coTower(sx,sz);
   column(sx*13.5,sz*13.5,5.2);brokenColumn(sx*8.6,sz*14.4,1.5,.75);brokenColumn(sx*16.2,sz*7.8,1.4,.7);brokenColumn(sx*21.8,sz*9.2,1.2,.65);
   crate(sx*17.6,sz*3.4,1.5,0x9b6a3c);barrel(sx*18.9,sz*3.8);barrel(sx*18.9,sz*2.7);crate(sx*5.4,sz*12.2,1.4,0x8f6a3c);
   // low sandstone walls as cover
   wall(rg(sx,10,12.6)[0],rg(sx,10,12.6)[1],sz*5.2-.3,sz*5.2+.3,1.3,STO,{studs:true,sc:STOD});
   wall(sx*19.7-.3,sx*19.7+.3,rg(sz,5.6,8.4)[0],rg(sz,5.6,8.4)[1],1.3,STO,{studs:true,sc:STOD});
   brazier(sx*24.2,sz*3.8)});
  coDais();coGate(-1);coGate(1);coBanners();coScreens();coLights();
 },
 env(){
  outerStands();
  clouds(12,34,90,180,0xffffff,6);
  const hill=(x,z,w,h,c)=>{const k=Math.max(4,Math.round(h/2.4));for(let i=0;i<k;i++){const f=1-i/(k+.5);bx(x,h*(i+.5)/k-2,z,w*f,h/k+.05,w*f*(.8+.2*Math.sin(i+x)),shade(c,1+(i%2?.06:-.04)))}};
  for(let i=0;i<9;i++){const a=i/9*PI*2+.2,r=120+rnd(i,2)*40;hill(Math.cos(a)*r,Math.sin(a)*r,40+rnd(i,3)*24,14+rnd(i,4)*14,[0x8a8a62,0x7a8a5a,0x8f8260][i%3])}
 },
 // round 16: torches along the arena edge and crown banner poles at the corners
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  for(const s of[-1,1])for(const t of[-18,-9,0,9,18]){KT.torch(s*24.5,t,2.6,{glow:t%18===0});KT.torch(t,s*24.5,2.6,{glow:t%18===0})}
  for(const sx of[-1,1])for(const sz of[-1,1])KT.bannerPole(sx*22,sz*22,6.5,Math.atan2(-sx,-sz),{c1:0xb82a2a,c2:0xffc828})}
});
function rg(s,a,b){return s>0?[a,b]:[-b,-a]}
// ======================================================================================= Royal Rift Arena
// Two royal courtyards face each other over a glowing rift. Three stone bridges cross it (a wide one in the middle, two narrow ones), diagonal bridges lead
// to the corner islands, and launch pads throw you from an island onto its watch tower. A floating crown hangs in a purple beam above the middle.
// Grid letters: f = flagstones, q = royal carpet, b = bridge stone, g = island stone, K = throne wall / tower, space = the rift (no walking).
function rfCell(c,r){
 if(c<=3)return(r===0||r===7)?'b':' ';
 if(c===14&&r<=4)return'K';
 if(c>=12&&c<=13&&r>=12&&r<=13)return'K';
 if(c>=11&&r>=11)return'g';
 if(r<=7)return(c>=10&&c<=12&&r<=1)?'q':'f';
 if(c>=7&&c<=11&&r>=7&&r<=11&&Math.abs(c-r)<=1)return'b';
 return' ';
}
const RFG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=rfCell(c,r);RFG.push(s)}
const PUR=0x7a3fc8,PURD=0x4a2a82,RS=0xcfc6dc,RSD=0x9a8fb6,RFPADS=[];for(const sx of[-1,1])for(const sz of[-1,1])RFPADS.push([sx*23,sz*26],[sx*26,sz*23]);
const RKC=[0x6a5a7e,0x5d4e70,0x514263,0x453757,0x392c49,0x2e233b,0x241b2e];
function rock(cx,cz,w,d,k){for(let i=0;i<k;i++){const s=1-i*.12;bx(cx,-1.95-i*1.5,cz,w*s,1.5,d*s,RKC[i%RKC.length])}}
function rfPad(x,z,c){cy(x,.09,z,.96,.18,0x3a2f58);cy(x,.2,z,.78,.08,0x1d1530);cy(x,.27,z,.62,.06,c,'eN');
 for(let i=0;i<3;i++)bx(x,.33,z+(i-1)*.3,.62-Math.abs(i-1)*.24,.04,.1,0xffffff,0,'eN');glow(x,.7,z,3.2,c)}
function knight(x,z,dir){col(x-.8,x+.8,z-.8,z+.8,4.2);if(isDry())return;
 bx(x,.4,z,1.7,.8,1.7,RSD);bx(x,.9,z,1.4,.2,1.4,RS);
 const A=0xb8bcc8,A2=0x8e93a2;
 bx(x,1.7,z,.9,1.3,.55,A);bx(x,2.55,z,.8,.7,.6,A2);cy(x,3.2,z,.38,.6,A);bx(x+dir*.3,3.28,z,.06,.12,.5,0x14141c);
 bx(x,3.62,z,.14,.5,.14,PUR);bx(x,3.9,z,.1,.3,.5,PUR);
 for(const s of[-1,1]){bx(x+s*.62,1.9,z,.3,1.0,.4,A2);bx(x+s*.62,1.2,z,.26,.7,.36,A)}
 bx(x+.7,1.85,z+.2,.12,2.4,.12,0x6a5a3a);bx(x-.7,1.5,z+.1,.12,1.5,.5,PUR)}
function arch(x,z,ax,half,h){ // pillars at +-half, a lintel you can walk under
 const p=(a,b)=>{col(a-.5,a+.5,b-.5,b+.5,h);if(!isDry()){bx(a,h/2,b,1.0,h,1.0,RS);bx(a,.2,b,1.3,.4,1.3,RSD);bx(a,h-.15,b,1.3,.3,1.3,RSD);stud(a,h+.03,b,RS)}};
 if(ax){p(x,z-half);p(x,z+half)}else{p(x-half,z);p(x+half,z)}
 if(ax)col(x-.5,x+.5,z-half,z+half,h+.8,h-.2);else col(x-half,x+half,z-.5,z+.5,h+.8,h-.2);
 if(isDry())return;
 if(ax){bx(x,h+.25,z,1.1,.6,half*2+1.2,RS);bx(x,h+.7,z,.8,.3,half*2+.8,RSD);ball(x,h+1.1,z,.3,GOLD,'g')}
 else{bx(x,h+.25,z,half*2+1.2,.6,1.1,RS);bx(x,h+.7,z,half*2+.8,.3,.8,RSD);ball(x,h+1.1,z,.3,GOLD,'g')}}
function rfTower(sx,sz){
 const cx=sx*26,cz=sz*26,x1=cx-2,x2=cx+2,z1=cz-2,z2=cz+2,DH=3.6;
 col(x1,x2,z1,z2,DH);
 wall(x1,x2,z1,z2,DH,RS,{col:false,studs:true,sc:RSD,band:[2,PUR]});
 const par=(a,b,c,d)=>{col(a,b,c,d,DH+1.1,DH);wall(a,b,c,d,1.0,RS,{y0:DH,col:false,studs:true,sc:RSD});if(!isDry())cren(a,b,c,d,DH+1.0,RS,.5)};
 par(sx>0?x2-.5:x1,sx>0?x2:x1+.5,z1,z2);par(sx>0?x1:x1+.5,sx>0?x2-.5:x2,sz>0?z2-.5:z1,sz>0?z2:z1+.5);
 if(isDry())return;
 bx(cx,DH+.05,cz,4.2,.1,4.2,RSD);
 bx(cx-sx*.6,DH+2.2,cz-sz*.6,.08,3.0,.08,0xcfcfcf);bx(cx-sx*.6,DH+3.4,cz-sz*.6+.5,.05,.9,1.0,PUR);
 bx(cx,DH+.4,cz,.7,.6,.7,0x2a2040);bx(cx,DH+.82,cz,.55,.3,.55,0xb06aff,0,'eN');glow(cx,DH+1.0,cz,3.4,0xc08aff)}
function rfCrown(){
 if(isDry())return;
 const g=new TH.Group(),mat=new TH.MeshStandardMaterial({color:GOLD,emissive:0xffb020,emissiveIntensity:.55,roughness:.3,metalness:.5}),gem=new TH.MeshStandardMaterial({color:0xff4a8a,emissive:0xff2a6a,emissiveIntensity:.8,roughness:.2});
 const B=(x,y,z,w,h,d,m)=>{const q=new TH.Mesh(new TH.BoxGeometry(w,h,d),m||mat);q.position.set(x,y,z);g.add(q)};
 for(const s of[-1,1]){B(s*1.5,0,0,.4,1.0,3.4);B(0,0,s*1.5,3.4,1.0,.4)}
 for(const a of[-1,0,1])for(const b of[-1,0,1]){if(a&&b||(!a&&!b))continue;B(a*1.5,.9,b*1.5,.5,.9,.5)}
 B(0,.95,-1.5,.5,1.2,.5);B(0,.95,1.5,.5,1.2,.5);B(-1.5,.95,0,.5,1.2,.5);B(1.5,.95,0,.5,1.2,.5);
 for(const[a,b]of[[-1.5,-1.5],[1.5,1.5],[-1.5,1.5],[1.5,-1.5]]){B(a,1.7,b,.6,.8,.6);const m=new TH.Mesh(new TH.SphereGeometry(.3,10,8),gem);m.position.set(a,2.3,b);g.add(m)}
 const gm=new TH.Mesh(new TH.SphereGeometry(.5,12,8),gem);gm.position.set(0,.1,1.72);g.add(gm);
 g.position.set(0,11,0);g.scale.set(1.3,1.3,1.3);add(g);
 const beam=new TH.Mesh(new TH.CylinderGeometry(1.7,2.6,90,24,1,true),new TH.MeshBasicMaterial({color:0xb06aff,transparent:true,opacity:.2,depthWrite:false,side:TH.DoubleSide,blending:TH.AdditiveBlending,fog:false}));
 beam.position.set(0,-6,0);add(beam);glow(0,11,0,18,0xe0b0ff);
 anim((dt,T)=>{g.rotation.y=T*.6;g.position.y=11+Math.sin(T*1.1)*.5;beam.material.opacity=.17+.06*Math.sin(T*2.2)})}
function rfCourt(sx){
 const x1=sx>0?8:-30,x2=sx>0?30:-8;
 // rock underside and an inlaid royal carpet line to the throne wall
 rock((x1+x2)/2,0,x2-x1-1,31,7);
 if(isDry())return;
 // carpet runner under the spawn
 for(let i=0;i<9;i++)bx(sx*(20+i*.8)+0,.025,0,.8,.04,3.2,i%2?0x7a2f8a:0x8f3fa0)}
MAPS.reg({id:'rift',name:'Royal Rift Arena',tag:'Tournament arena',theme:'Two royal courtyards over a glowing rift, a floating crown, jump pads and corner watch towers.',
 blurb:'The semifinal and final arena: hold the bridges, ride a launch pad onto a watch tower and keep your footing above the rift.',
 th:['#7a3fc8','#1a0f33'],tour:true,
 grid:RFG,
 tiles:{f:{c:0xb4a8cc,a:0xa89cc0,v:.06,s:1},q:{c:0x7a2f8a,a:0x6a2a7a,v:.05,s:1},b:{c:0xd8cbaa,a:0xccbf9e,v:.06,s:1},g:{c:0xa090c4,a:0x9484b8,v:.08,s:1}},
 light:[{t:0,top:0x4a3a98,mid:0x9a7ad0,bot:0xf0b8d8,fog:0x9a82c8,fn:90,ff:280,sun:0xffe8c8,si:.5,sp:[28,48,22],hs:0xd0c0f8,hg:0x6a4a98,hi:.48,disc:0xffe8c8,dsz:30,lamp:.15,star:.12},
  {t:.55,top:0x2c1c68,mid:0xc04a9a,bot:0xff9a6a,fog:0xa06ab8,fn:60,ff:210,sun:0xff9a7a,si:.45,sp:[-52,16,-22],hs:0xb89aff,hg:0x5a3a8a,hi:.52,disc:0xff9a7a,dsz:48,lamp:.7,star:.4},
  {t:1,top:0x0a0820,mid:0x3a1a6a,bot:0xa03a8a,fog:0x35205a,fn:45,ff:180,sun:0x9aa8ff,si:.3,sp:[-40,30,26],hs:0x8a7aff,hg:0x3a2a6a,hi:.5,disc:0xe6ecff,dsz:22,lamp:1,star:.95}],
 build(L){
  curbs(c=>c==='b'?0xf2e6c8:c==='g'?0x8c7eb0:0xa89cc2,{h:.2});
  rfCourt(1);rfCourt(-1);
  // corner islands: rock, towers, pads
  mir((sx,sz)=>{rock(sx*26,sz*26,8,8,7);rfTower(sx,sz);rfPad(sx*23,sz*26,0xc08aff);rfPad(sx*26,sz*23,0x7ae8ff)});
  // diagonal bridges: arches and golden rails
  mir((sx,sz)=>{
   for(let i=8;i<=10;i++)rock(sx*(i*2+1),sz*(i*2+1),2.4,2.4,2)});
  // the three bridges over the rift
  for(const z of[-1,0,1]){const zc=z*15,half=z?1:2;
   if(!isDry()){bx(0,-1.5,zc,15,.6,half*2-.4,0xb8aa90);
    for(const e of[-1,1])rail(-8,zc+e*(half-.12),8,zc+e*(half-.12),GOLD,.9);
    for(let k=-3;k<=3;k++)for(const e of[-1,1])bx(k*2.2,.55,zc+e*(half-.12),.3,1.1,.3,GOLD,0,'g')}}
  if(!isDry()){cy(0,.03,0,1.7,.05,GOLD,'g');cy(0,.06,0,1.3,.05,0xe8dcc0);cy(0,.09,0,.7,.05,0x7a3fc8,'eN')}
  // courtyards: knights, arches, cover walls, braziers, banners and the throne wall
  mir((sx,sz)=>{
   knight(sx*11,sz*5.6,-sx);knight(sx*19,sz*10.6,-sx);
   wall(rg(sx,10,12.6)[0],rg(sx,10,12.6)[1],sz*10.8-.3,sz*10.8+.3,1.4,RS,{studs:true,sc:RSD,cren:true,cc:RS,ch:.45});
   wall(sx*12.6-.3,sx*12.6+.3,rg(sz,8.2,10.8)[0],rg(sz,8.2,10.8)[1],1.4,RS,{studs:true,sc:RSD,cren:true,cc:RS,ch:.45});
   wall(rg(sx,19,22)[0],rg(sx,19,22)[1],sz*3.9-.3,sz*3.9+.3,1.4,RS,{studs:true,sc:RSD,cren:true,cc:RS,ch:.45});
   brazier(sx*9.2,sz*3.6);lamp(sx*16,sz*13.4,3.6,0xc08aff);lamp(sx*24.6,sz*13,3.6,0xc08aff);crate(sx*25.4,sz*8,1.5,0xa07abf)});
  for(const sx of[-1,1]){
   col(sx>0?28:-30,sx>0?30:-28,-10,10,6);
   if(!isDry()){wall(sx>0?28:-30,sx>0?30:-28,-10,10,6,RS,{col:false,studs:true,sc:RSD,band:[3,PUR]});
    sign(sx*27.97,3.4,0,-sx*PI/2,6.4,3.2,crownArt('#7a3fc8','#1b1230','ROYAL RIFT'),{pw:512,lit:true});
    for(const z of[-8,-5.6,5.6,8])banner(sx*27.9,3.4,z,-sx*PI/2,1.3,3.2,PUR,GOLD);
    for(const z of[-3.4,3.4]){col(sx*27.5-.45,sx*27.5+.45,z-.45,z+.45,.9);bx(sx*27.5,.45,z,.9,.9,.9,RSD);bx(sx*27.5,1.1,z,.5,.5,.5,0xb06aff,0,'eN');glow(sx*27.5,1.1,z,3,0xc08aff)}}}
  for(const sx of[-1,1])arch(sx*14.6,0,true,2.6,3.6);
  rfCrown();
  // launch pads: fighters standing on one are thrown up and can steer onto the tower
  anim((dt,T)=>{for(const e of ENTS()){if(!e||(e===E&&!E.bot))continue;if(!e.gr||e.y>.4||e.hp<=0)continue;for(const p of RFPADS)if(Math.hypot(e.x-p[0],e.z-p[1])<1.2){e.vy=16.6;e.gr=false;break}}});
 },
 env(){
  // the rift: an energy glow far below, rising light columns, floating islets with crystals
  bx(0,-23,0,320,1,320,0x4a1a9a,0,'eF');bx(0,-22.4,0,320,.1,320,0x8a4aff,0,'eN');
  for(let i=0;i<22;i++){const a=rnd(i,1)*PI*2,r=6+rnd(i,2)*30,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)>8&&Math.abs(z)<18)continue;
   bx(x,-16+rnd(i,3)*3,z,.7,14,.7,0xc08aff,0,'eN')}
  clouds(14,18,80,180,0x9a7ac8,8);
  for(let i=0;i<9;i++){const a=i/9*PI*2+.3,r=95+rnd(i,6)*40,x=Math.cos(a)*r,z=Math.sin(a)*r,y=-6+rnd(i,7)*22,w=16+rnd(i,8)*14;
   bx(x,y,z,w,2,w,0x9a8cc0);for(let k=0;k<6;k++)bx(x,y-1-k*2-1,z,w*(1-k*.14),2,w*(1-k*.14),RKC[k]);
   for(let q=0;q<3;q++){const h=4+rnd(i,q,3)*7;bx(x+(q-1)*w*.2,y+1+h/2,z+(rnd(i,q,4)-.5)*w*.3,1.1,h,1.1,0xb06aff,0,'eN')}}
 },
 // round 16: flame torches on the island edges, crown banner poles and tall spire towers on the far islands
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  KT.edgeTorches(.22,.2,41,{max:40,h:1.2});
  for(const sx of[-1,1]){KT.bannerPole(sx*9,-12,6,0,{c1:0x6a3ab8,c2:0xffc828});KT.bannerPole(sx*9,12,6,PI,{c1:0x6a3ab8,c2:0xffc828});}}
});
})();
