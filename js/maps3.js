/* Maps, part 3: Pepe's Pond. Same kit and the same grid rules as maps1.js / maps2.js. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,wall,cren,plain,stairs,crate,barrel,glow,sign,water,bank,shade,mixc,rnd,lerp,anim,curbs,win,door,gable,clouds,tree0,isDry,TH,add}=LB;
const PI=Math.PI,mir=(f,z)=>{for(const sx of[-1,1]){if(z===false)f(sx,1);else for(const sz of[-1,1])f(sx,sz)}};
const WOOD=0x9a6b3d,WOODD=0x6e4a2a,MOSS=0x5f8f3c,ST=0x8c968a,STD=0x6a7568,RED=0xa8322e,GOLD=0xffd02f,GRN=0x4f9a3b,THATCH=0xc9a24a;
// ======================================================================================= Pepe's Pond
// A calm green pond. A two-tier shrine to the Rare Pepe stands on the middle island; wooden boardwalks and a stone causeway ring lead out to
// the spawn docks and the four stilted watch huts in the corners. Everything that is not a walkway is water (invisible walls).
// Grid letters: p = planks, g = mossy island stone, w = causeway stone, K = shrine / hut / watch hut, space = water.
function ppCell(c,r){
 if(c<=1&&r<=1)return'K';
 if(c>=12&&c<=13&&r>=12&&r<=13)return'K';
 if(c>=13&&r<=1)return'K';
 if((c>=8&&c<=11&&r>=12&&r<=13)||(c>=12&&c<=13&&r>=8&&r<=11))return'p';
 if(c>=9&&c<=12&&r<=1)return'p';
 if((r===0&&c>=4&&c<=12)||(c===0&&r>=4&&r<=11))return'p';
 if(c<=2&&r>=12)return'g';
 if(c*c+r*r<=26)return'g';
 if(Math.max(c,r)>=7&&Math.max(c,r)<=8)return'w';
 if(c>=4&&r>=4&&c<=11&&r<=11&&Math.abs(c-r)<=1)return'p';
 return' ';
}
const PPG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=ppCell(c,r);PPG.push(s)}
function pepeArt(g,w,h){
 g.fillStyle='#5aa03a';g.fillRect(0,0,w,h);
 g.fillStyle='#4a8c30';g.fillRect(0,h*.86,w,h*.14);g.fillStyle='#6cb64a';g.fillRect(0,0,w,h*.1);
 const ink='#14210f';
 for(const x of[.29,.71]){ // big sleepy eyes
  g.fillStyle='#f4f4ec';g.beginPath();g.ellipse(w*x,h*.4,w*.17,h*.15,0,0,PI*2);g.fill();g.lineWidth=w*.014;g.strokeStyle=ink;g.stroke();
  g.fillStyle=ink;g.beginPath();g.arc(w*(x+(x<.5?.03:-.03)),h*.43,w*.04,0,PI*2);g.fill();
  g.fillStyle='#5aa03a';g.beginPath();g.ellipse(w*x,h*.4,w*.175,h*.155,0,PI,PI*2);g.fill(); // heavy upper lid
  g.lineWidth=w*.02;g.strokeStyle=ink;g.beginPath();g.moveTo(w*(x-.17),h*.4);g.lineTo(w*(x+.17),h*.4);g.stroke()}
 g.fillStyle='#e0554a';g.beginPath();g.ellipse(w*.5,h*.74,w*.3,h*.075,0,0,PI*2);g.fill(); // wide lips
 g.fillStyle='#b8342c';g.beginPath();g.ellipse(w*.5,h*.775,w*.26,h*.045,0,0,PI);g.fill();
 g.lineWidth=w*.016;g.strokeStyle=ink;g.beginPath();g.moveTo(w*.2,h*.735);g.quadraticCurveTo(w*.5,h*.8,w*.8,h*.735);g.stroke();
 g.lineWidth=w*.012;g.beginPath();g.moveTo(w*.46,h*.58);g.lineTo(w*.5,h*.62);g.lineTo(w*.54,h*.58);g.stroke()}
const plaque=(t1,t2)=>(g,w,h)=>{g.fillStyle='#3a2a1a';g.fillRect(0,0,w,h);g.strokeStyle=GOLD&&'#e8c24a';g.lineWidth=h*.06;g.strokeRect(h*.07,h*.07,w-h*.14,h*.86);
 g.fillStyle='#f2dc8a';g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(h*.34)+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.fillText(t1,w/2,h*.38);
 g.fillStyle='#8fd16a';g.font='bold '+Math.round(h*.24)+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.fillText(t2,w/2,h*.72)};
function ppFall(x,z,ry,w,top,low){
 if(isDry())return;const len=top-low;
 const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#8fd8c0';g.fillRect(0,0,64,256);
 for(let i=0;i<22;i++){g.fillStyle=i%2?'rgba(255,255,255,.8)':'rgba(60,150,130,.6)';g.fillRect((i*29)%60,(i*47)%250,3+i%4,40+(i*13)%70)}
 const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(1,2);
 const m=new TH.Mesh(new TH.PlaneGeometry(w,len),new TH.MeshBasicMaterial({map:t,transparent:true,opacity:.82,side:TH.DoubleSide,depthWrite:false}));
 m.position.set(x,low+len/2,z);m.rotation.y=ry;add(m);
 anim((dt,T)=>{t.offset.y=(T*.7)%1;const k=(MAPS.lightKey()||{}).lamp||0;const v=1-.5*k;m.material.color.setRGB(v,v,v)});
 for(let i=0;i<3;i++)ball(x+Math.sin(ry)*.35,low+.05,z+Math.cos(ry)*.35,.55+i*.25,0xeef9f4)}
function toro(x,z){col(x-.38,x+.38,z-.38,z+.38,2.2);if(isDry())return;cy(x,.12,z,.46,.24,STD);cy(x,.72,z,.17,1.1,ST);cy(x,1.42,z,.4,.2,ST);bx(x,1.8,z,.6,.56,.6,0xffe08a,0,'eL');bx(x,2.2,z,.95,.18,.95,STD);bx(x,2.38,z,.5,.16,.5,STD);ball(x,2.55,z,.14,GOLD);glow(x,1.8,z,2.8,0xffc870)}
function pLamp(x,z){col(x-.16,x+.16,z-.16,z+.16,3.4);if(isDry())return;bx(x,1.7,z,.26,3.4,.26,WOODD);bx(x,3.38,z,.9,.1,.1,WOODD);bx(x,3.38,z,.1,.1,.9,WOODD);
 bx(x,3.0,z,.58,.66,.58,0xff9a3a,0,'eL');bx(x,3.4,z,.66,.1,.66,RED);bx(x,2.62,z,.66,.1,.66,RED);glow(x,3.0,z,3.0,0xffa55a)}
function willow(x,z,s){s=s||1;col(x-.5*s,x+.5*s,z-.5*s,z+.5*s,3*s);if(isDry())return;
 bx(x,1.6*s,z,.9*s,3.2*s,.9*s,0x6a4a2a);bx(x,.15,z,1.4*s,.3,1.4*s,0x6a4a2a);
 bx(x,3.9*s,z,4.2*s,.9*s,4.2*s,0x4f8f3c);bx(x,4.6*s,z,3.0*s,.7*s,3.0*s,0x5fa047);bx(x,5.15*s,z,1.7*s,.5*s,1.7*s,0x6cb04f);
 for(let i=0;i<16;i++){const a=i/16*PI*2,rr=(1.62+rnd(i,x,z)*.38)*s,len=(1.7+rnd(i,z,x)*1.8)*s;bx(x+Math.cos(a)*rr,3.9*s-len/2,z+Math.sin(a)*rr,.17*s,len,.17*s,i%3?0x6aa84c:0x588f3e)}}
function torii(x,z,ax,half){ // ax: the gate spans along z (posts at z = +-half) when true
 const post=(a,b)=>{col(a-.3,a+.3,b-.3,b+.3,4.4);if(!isDry()){bx(a,2.2,b,.6,4.4,.6,RED);bx(a,.15,b,.84,.3,.84,0x2a2420)}};
 if(ax){post(x,z-half);post(x,z+half)}else{post(x-half,z);post(x+half,z)}
 if(isDry())return;const L=half*2+1.8;
 if(ax){bx(x,3.75,z,.5,.34,half*2,RED);bx(x,4.5,z,.7,.3,L+1.2,0x2a2420);bx(x,4.78,z,.5,.2,L+1.5,0x2a2420)}
 else{bx(x,3.75,z,half*2,.34,.5,RED);bx(x,4.5,z,L+1.2,.3,.7,0x2a2420);bx(x,4.78,z,L+1.5,.2,.5,0x2a2420)}}
// stilted watch hut: 4 x 4, deck at 3.6, open stair sides towards the middle of the pond, thatched roof on corner posts
function watchHut(sx,sz){
 const cx=sx*26,cz=sz*26,x1=cx-2,x2=cx+2,z1=cz-2,z2=cz+2,DH=3.6;
 col(x1,x2,z1,z2,DH);
 wall(x1,x2,z1,z2,DH,0x7a5230,{col:false,studs:true,sc:WOODD,band:[2,0x5e3f22]});
 if(!isDry()){bx(cx,DH+.05,cz,4.2,.1,4.2,WOODD);for(const a of[x1+.35,x2-.35])for(const b of[z1+.35,z2-.35])bx(a,.25,b,.7,.5,.7,0x4a3420)}
 const par=(a,b,c,d)=>{col(a,b,c,d,DH+1.1,DH);wall(a,b,c,d,1.0,WOOD,{y0:DH,col:false,studs:true,sc:0x8c5f35})};
 // parapet on the two outer sides only (the stairs arrive on the inner sides)
 par(sx>0?x2-.5:x1,sx>0?x2:x1+.5,z1,z2);par(sx>0?x1:x1+.5,sx>0?x2-.5:x2,sz>0?z2-.5:z1,sz>0?z2:z1+.5);
 if(!isDry()){
  for(const a of[x1+.2,x2-.2])for(const b of[z1+.2,z2-.2]){const onPar=(a>cx)===(sx>0)||(b>cz)===(sz>0),y0=onPar?DH+1.1:DH;bx(a,(y0+DH+2.9)/2,b,.3,DH+2.9-y0,.3,RED)}
  bx(cx,DH+3.05,cz,4.9,.3,4.9,shade(THATCH,.85));bx(cx,DH+3.35,cz,4.0,.3,4.0,THATCH);bx(cx,DH+3.65,cz,2.9,.3,2.9,shade(THATCH,1.1));bx(cx,DH+3.95,cz,1.7,.3,1.7,THATCH);
  bx(cx,DH+4.3,cz,.9,.4,.9,shade(THATCH,.8));bx(cx,DH+5.1,cz,.07,1.4,.07,0xcfcfcf);bx(cx+.45,DH+5.45,cz,.9,.6,.05,GRN);
  // a hanging lantern under the roof
  bx(cx,DH+2.2,cz,.5,.6,.5,0xff9a3a,0,'eL');glow(cx,DH+2.2,cz,3.2,0xffa55a)}
 stairs(sx*17.6,sz*26,sx>0?0:1,8,2.4,0x9a7a52,.45,.8);       // along x
 stairs(sx*26,sz*17.6,sz>0?2:3,8,2.4,0x9a7a52,.45,.8)}       // along z
function hut(sx){
 const x1=sx>0?26:-30,x2=sx>0?30:-26,cx=(x1+x2)/2,face=sx>0?x1:x2,H=2.8;
 col(x1,x2,-4,4,6);
 wall(x1,x2,-4,4,H,0x8a5a30,{col:false,studs:false,band:[2,0x6e4a2a]});
 if(isDry())return;
 gable(cx,0,4,8,H,0x9c7a34,false,.6);
 door(face-sx*0.02,0,false,2.2,2.3,0x6b4423,0xd8c9a0);
 for(const z of[-2.6,2.6])win(face,1.7,z,false,1.0,1.1,0xffd27a,0xd8c9a0);
 // porch posts and a lantern
 bx(face-sx*1.05,3.1,-1.9,.3,.3,.3,WOODD);
 bx(face-sx*.3,2.1,1.8,.36,.5,.36,0xff9a3a,0,'eL');glow(face-sx*.3,2.1,1.8,2.6,0xffa55a)}
function shrine(){
 const D=2.5;
 col(-4,4,-4,4,D);
 if(!isDry()){
  wall(-4,4,-4,4,D,ST,{col:false,studs:true,sc:0x76806f,band:[1,0xb7c2b0]});
  bx(0,D+.05,0,8.2,.1,8.2,STD);
  for(const s of[-1,1]){bx(s*4.1,.25,0,.3,.5,8.4,STD);bx(0,.25,s*4.1,8.4,.5,.3,STD)}
  studs(-4,4,-4,4,D+.1,STD,1)}
 // deck rail: low walls on the sides, open where the stairs arrive
 const par=(a,b,c,d)=>{col(a,b,c,d,D+1.1,D);wall(a,b,c,d,1.0,ST,{y0:D,col:false,studs:true,sc:0x76806f})};
 par(-4,-3.5,-4,4);par(3.5,4,-4,4);par(-4,-1.6,-4,-3.5);par(1.6,4,-4,-3.5);par(-4,-1.6,3.5,4);par(1.6,4,3.5,4);
 stairs(0,-7.6,2,5,3,0x9aa396,.5,.72);stairs(0,7.6,3,5,3,0x9aa396,.5,.72);
 // waterfalls on the two long faces
 if(!isDry()){for(const sx of[-1,1]){ppFall(sx*4.25,-1.7,PI/2,2.4,D,-.45);ppFall(sx*4.25,1.7,PI/2,2.4,D,-.45);bx(sx*4.1,D-.1,0,.4,.3,6.4,STD)}}
 // the statue: a stepped plinth and a giant seated Pepe with a crown and a lit torch (MAPS.kit.pepeStatue), flame pillars on the deck corners
 col(-1.9,1.9,-1.9,1.9,12);
 if(!isDry()){
  bx(0,D+.35,0,4.6,.7,4.6,STD);studs(-2.3,2.3,-2.3,2.3,D+.7,STD,1);bx(0,D+.85,0,4.2,.3,4.2,0xb7c2b0);bx(0,D+1.05,0,3.9,.1,3.9,STD);
  MAPS.kit.pepeStatue(0,D+1.1,0,0,1,pepeArt);
  for(const a of[-3.75,3.75])for(const b of[-3.75,3.75]){bx(a,D+1.1+.8,b,.5,1.6,.5,ST);bx(a,D+1.1+1.7,b,.7,.2,.7,GOLD,0,'g');MAPS.kit.flame(a,D+1.1+1.8,b,1.1,true)}
  for(const s2 of[-1,1]){MAPS.kit.bannerPole(s2*3.75,0,3.2,s2>0?PI/2:-PI/2,{});}
 }
 // plaques beside the stairs
 for(const s of[-1,1])for(const t of[-1,1]){sign(t*2.8,1.5,s*4.03,s>0?0:PI,1.9,.9,plaque(t>0?'RARE PEPE':'FEELS GOOD',t>0?'SHRINE':'MAN'),{pw:256})}}
// pads, flowers and reeds
function pondLife(){
 if(isDry())return;
 for(let j=0;j<30;j++)for(let i=0;i<30;i++){const x=i*2-29,z=j*2-29,ch=MAPS.cell(x,z);if(MAPS.walk(x,z)||ch==='K')continue;
  const n=Math.floor(rnd(i,j,1)*3.6);for(let k=0;k<n;k++){const px=x+(rnd(i,j,k+5)-.5)*1.7,pz=z+(rnd(j,i,k+9)-.5)*1.7,r=.45+rnd(i,j,k+13)*.5;
   cy(px,-.43,pz,r,.04,rnd(k,i,j)<.5?0x3f8f3a:0x4a9c3f);if(rnd(i,j,k+21)<.16){ball(px+.12,-.33,pz,.15,rnd(k,j,i)<.5?0xff9ac8:0xffffff);ball(px+.12,-.26,pz,.07,0xffd02f)}}}
}
function eachEdge(cb){for(let j=0;j<30;j++)for(let i=0;i<30;i++){const x=i*2-29,z=j*2-29;if(!MAPS.walk(x,z))continue;const ch=MAPS.cell(x,z);
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx*2,nz=z+dz*2;if(Math.abs(nx)>30||Math.abs(nz)>30)continue;if(MAPS.walk(nx,nz)||MAPS.cell(nx,nz)==='K')continue;cb(ch,x,z,dx,dz,i,j)}}}
function edges(){
 if(isDry())return;const posts=new Set(),piles=new Set();
 eachEdge((ch,x,z,dx,dz,i,j)=>{
  const ex=x+dx,ez=z+dz,ax=dx===0; // ax: the edge runs along x
  if(ch==='p'){
   const mx=ex,mz=ez;for(const y of[.5,.92])bx(mx,y,mz,ax?2:.1,.1,ax?.1:2,0x8a6238);
   for(const s of[-1,1]){const px=ax?x+s:ex,pz=ax?ez:z+s,key=px+','+pz;if(posts.has(key))continue;posts.add(key);bx(px,.55,pz,.2,1.1,.2,WOODD);stud(px,1.15,pz,WOODD);
    cy(px,-1.1,pz,.2,2.2,0x4a3420)}}
  else{ // reeds and cattails on the stone edges
   const n=1+Math.floor(rnd(i,j,dx+dz*3)*3);for(let k=0;k<n;k++){const t=(rnd(i,j,k+30)-.5)*1.7,px=ax?x+t:ex+dx*.2,pz=ax?ez+dz*.2:z+t;
    for(let q=0;q<3;q++){const h=1.2+rnd(i+q,j,k)*1.1,ox=(rnd(q,k,i)-.5)*.5,oz=(rnd(q,k,j)-.5)*.5;bx(px+ox,h/2-.1,pz+oz,.07,h,.07,rnd(q,i,j)<.5?0x5b8f3a:0x6aa04a);
     if(rnd(q,j,i)<.45)bx(px+ox,h-.1,pz+oz,.13,.4,.13,0x6b4a2a)}}}});
}
MAPS.reg({id:'pond',name:"Pepe's Pond",tag:'Boardwalks over a swamp shrine',theme:'Wooden boardwalks, lily pads and a two-tier shrine to the Rare Pepe in the middle of a calm green pond.',
 blurb:"Climb the shrine for the high ground, race the boardwalks and take the watch huts in the corners before the storm closes in.",
 th:['#5aa03a','#1d4a3c'],
 grid:PPG,
 tiles:{p:{c:(px,pz)=>((Math.floor(px)+Math.floor(pz))&1)?0x9a6b3d:0x8c5f35,v:.06,s:0},g:{c:0x6c9a4a,a:0x63903f,v:.1,s:1},w:{c:0x8d9a92,a:0x838f87,v:.08,s:1}},
 light:[{t:0,top:0x4a9ee0,mid:0xa8d2ee,bot:0xffdcc4,fog:0xb4d6c6,fn:70,ff:230,sun:0xfff0c0,si:.62,sp:[28,50,20],hs:0xd8f0d8,hg:0x5a7a44,hi:.58,disc:0xfff2c0,dsz:30,lamp:0,star:0},
  {t:.55,top:0x3a6a8a,mid:0xe0b070,bot:0xffd08a,fog:0xc8a870,fn:55,ff:190,sun:0xffb060,si:.5,sp:[-52,16,-18],hs:0xe8c898,hg:0x5a5a3a,hi:.52,disc:0xffb060,dsz:46,lamp:.6,star:.05},
  {t:1,top:0x0f1a3c,mid:0x2a4a5a,bot:0xb06a52,fog:0x30503f,fn:40,ff:150,sun:0xff8a5a,si:.3,sp:[-48,10,-24],hs:0x6a8aa8,hg:0x2a3a2a,hi:.5,disc:0xff7a50,dsz:40,lamp:1,star:.5}],
 build(L){
  curbs(c=>c==='p'?0x7a5230:c==='g'?0x7a8a70:0x6a7568,{h:.22});
  edges();pondLife();
  shrine();
  mir((sx,sz)=>{watchHut(sx,sz)});
  hut(1);hut(-1);
  // island: ruin walls, willows, lanterns
  mir((sx,sz)=>{
   const f=(a,b,c,d)=>wall(Math.min(sx*a,sx*b),Math.max(sx*a,sx*b),Math.min(sz*c,sz*d),Math.max(sz*c,sz*d),1.3,ST,{studs:true,sc:0x76806f});
   f(6,9,5.2,6);f(5.2,6,6,9);
   willow(sx*9.4,sz*3.5,.8);
   toro(sx*2.5,sz*7.9);toro(sx*8.2,sz*2.4)});
  // boardwalks: gates, crates, lanterns
  mir((sx,sz)=>{
   crate(sx*15.2,sz*3.6,1.4,0x8f6a3c);barrel(sx*16.4,-sz*3.4);
   crate(sz*3.6,sx*15.2,1.4,0x9b6a3c);barrel(-sz*3.4,sx*16.4);
   // the causeway ring: low stone cover
   wall(Math.min(sx*15.5,sx*16.5),Math.max(sx*15.5,sx*16.5),Math.min(sz*6.5,sz*9.5),Math.max(sz*6.5,sz*9.5),1.3,ST,{studs:true,sc:0x76806f});
   wall(Math.min(sx*6.5,sx*9.5),Math.max(sx*6.5,sx*9.5),Math.min(sz*15.5,sz*16.5),Math.max(sz*15.5,sz*16.5),1.3,ST,{studs:true,sc:0x76806f});
   // spawn docks
   crate(sx*24.6,sz*2.9,1.5,0x8f6a3c);pLamp(sx*19,sz*3.5);
   pLamp(sx*18,sz*24.35);pLamp(sx*24.35,sz*18);
   toro(sx*5.2,sz*28.6)});
  torii(12.5,0,true,2.45);torii(-12.5,0,true,2.45);torii(0,12.5,false,2.45);torii(0,-12.5,false,2.45);
  torii(0,27.2,false,2.6);torii(0,-27.2,false,2.6);
 },
 env(){
  water({size:92,y:-.5,c1:'#1d4a3c',c2:'#7fc4a2',bed:0x10281f,op:.93});
  bank(0,0x56703a,{h:2,hole:30,R:200});
  clouds(14,22,70,170,0xeef4ee,4);
  const hill=(x,z,w,h,c)=>{const k=Math.max(4,Math.round(h/2.4));for(let i=0;i<k;i++){const f=1-i/(k+.5);bx(x,h*(i+.5)/k-2,z,w*f,h/k+.05,w*f*(.8+.2*Math.sin(i+x)),shade(c,1+(i%2?.06:-.04)))}};
  for(let i=0;i<11;i++){const a=i/11*PI*2+.2,r=100+rnd(i,2)*40;hill(Math.cos(a)*r,Math.sin(a)*r,34+rnd(i,3)*24,12+rnd(i,4)*14,[0x3f6a3c,0x4a7a44,0x36603a][i%3])}
  for(let i=0;i<46;i++){const a=i/46*PI*2+.1,r=36+rnd(i,6)*40,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<33&&Math.abs(z)<33)continue;
   if(i%3===0)willow(x,z,1.2+rnd(i,28)*.6);else tree0(x,z,1.3+rnd(i,27)*.9,{c1:0x2f7a3a,c2:0x3d8f45})}
  // giant lily pads and reed beds on the far bank
  for(let i=0;i<30;i++){const a=rnd(i,11)*PI*2,r=33+rnd(i,12)*6,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<31.5&&Math.abs(z)<31.5)continue;
   for(let q=0;q<4;q++){const h=1.4+rnd(i,q,3)*1.4;bx(x+(q-1.5)*.3,h/2,z+(rnd(i,q,5)-.5)*.5,.08,h,.08,0x5b8f3a);if(q%2)bx(x+(q-1.5)*.3,h,z,.14,.45,.14,0x6b4a2a)}}
  // fireflies
  const fl=[];for(let i=0;i<30;i++){const a=rnd(i,21)*PI*2,r=6+rnd(i,22)*34,x=Math.cos(a)*r,z=Math.sin(a)*r,y=.8+rnd(i,23)*2.6;
   glow(x,y,z,.7,i%3?0xd8ff7a:0xffe08a);const G=LB.glows();fl.push({sp:G[G.length-1].sp,x,y,z,p:rnd(i,24)*9})}
  anim((dt,T)=>{for(const f of fl){f.sp.position.set(f.x+Math.sin(T*.6+f.p)*1.2,f.y+Math.sin(T*1.1+f.p*2)*.5,f.z+Math.cos(T*.5+f.p)*1.2);f.sp.material.opacity=Math.min(.9,.15+.75*((MAPS.lightKey()||{}).lamp||0)*(.6+.4*Math.sin(T*3+f.p)))}});
 },
 // round 16: the card-art pass: flame posts and lanterns on the boardwalks, banners on the gates, tall mossy rock spires with pines and falls behind the pond
 decor(){
  if(isDry())return;const KT=MAPS.kit;
  // torches on every third boardwalk post, a few with a glow
  const seen=new Set();let g=0;
  eachEdge((ch,x,z,dx,dz,i,j)=>{if(ch!=='p')return;const ex=x+dx,ez=z+dz,ax=dx===0;
   for(const sg of[-1,1]){const px=ax?x+sg:ex,pz=ax?ez:z+sg,key=px+','+pz;if(seen.has(key))continue;seen.add(key);
    if(rnd(px,pz,77)<.34){bx(px,1.22,pz,.3,.12,.3,0x23252b);KT.flame(px,1.28,pz,.85,(g++%3)===0&&g<60)}}});
  // crown banners hang from the crossbeams of the red gates
  for(const[gx,gz,ax]of[[12.5,0,true],[-12.5,0,true],[0,12.5,false],[0,-12.5,false],[0,27.2,false],[0,-27.2,false]]){const ry=ax?PI/2:0;
   for(const sd of[-1,1])KT.crownBanner(gx+(ax?sd*.45:0),3.55,gz+(ax?0:sd*.45),ry+(sd<0?PI:0),1.1,2.0)}
  // lanterns on the huts and a banner pole at each corner dock
  for(const sx of[-1,1])for(const sz of[-1,1]){KT.bannerPole(sx*26+sx*2.4,sz*26+sz*2.4,7.2,Math.atan2(-sx,-sz),{h:3.2});KT.lantern(sx*24.2,3.3,sz*24.2,0xffa04a,{s:1.1,pole:[sx*.5,0]})}
  // rock spires behind the pond
  const pine=(x,y,z,s)=>{bx(x,y+.6*s,z,.5*s,1.2*s,.5*s,0x6a4a2a);for(let i=0;i<4;i++){const w=(2.6-i*.6)*s;bx(x,y+(1.5+i*.8)*s,z,w,.85*s,w,i%2?0x2d7a3a:0x246a32)}};
  for(let i=0;i<9;i++){const a=i/9*PI*2+.35,r=84+rnd(i,91)*34,x=Math.cos(a)*r,z=Math.sin(a)*r,w=11+rnd(i,92)*7,h=26+rnd(i,93)*22,k=Math.round(h/2.4);
   for(let q=0;q<k;q++){const f=1-.55*q/k+(rnd(q,i,3)-.5)*.16;bx(x+(rnd(q,i,5)-.5)*1.4,-3+h*(q+.5)/k,z+(rnd(q,i,6)-.5)*1.4,w*f,h/k+.05,w*f*.9,shade(0x7f90a4,1+(q%2?.06:-.05)))}
   bx(x,h-2.9,z,w*.5,.7,w*.45,0x4f8f3c);pine(x-w*.1,h-2.6,z,1.6+rnd(i,94));pine(x+w*.12,h-2.6,z+w*.08,1.2+rnd(i,95)*.8);
   if(i%2===0){const fa=a+PI;KT.fall(x+Math.cos(a+PI)*w*.34+Math.sin(a)*1.2,z+Math.sin(a+PI)*w*.34-Math.cos(a)*1.2,-a+PI/2,2.2,h-4,-1)}}
 }
});
})();
