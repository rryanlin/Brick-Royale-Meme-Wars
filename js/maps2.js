/* Maps, part 2: Backbrick Rooms, Nyan Skyway, Troll Toll Ruins. Same kit and the same grid rules as maps1.js. */
(()=>{
const {bx,cy,fr,ball,stud,studs,col,wall,cren,plain,rtower,stairs,crate,barrel,lamp,brazier,banner,tree,tree0,bush,bench,planter,fence,glow,sign,water,bank,shade,mixc,rnd,lerp,BH,anim,curbs,rail,clouds,win,door,gable,glass,isDry,TH,add}=MAPS.lib;
const PI=Math.PI,mir=(f,z)=>{for(const sx of[-1,1]){if(z===false)f(sx,1);else for(const sz of[-1,1])f(sx,sz)}};
const txt=(t,fg,bg,font,o)=>(g,w,h)=>{o=o||{};if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}g.fillStyle=fg;g.font=(font||'bold ')+Math.round(h*(o.k||.62))+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2+h*.04)};
// merge the cells that pass `sel` into as few rectangles as possible (30 x 30 cells of 2 m, whole arena)
function merge(sel){const N=30,u=[],used=[];for(let j=0;j<N;j++){u.push([]);used.push([]);for(let i=0;i<N;i++){u[j].push(!!sel(i*2-29,j*2-29));used[j].push(false)}}
 const out=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(!u[j][i]||used[j][i])continue;let w=1;while(i+w<N&&u[j][i+w]&&!used[j][i+w])w++;let h=1;
  for(;j+h<N;h++){let ok=true;for(let k=0;k<w;k++)if(!u[j+h][i+k]||used[j+h][i+k]){ok=false;break}if(!ok)break}
  for(let a=0;a<h;a++)for(let b=0;b<w;b++)used[j+a][i+b]=true;out.push([i*2-30,(i+w)*2-30,j*2-30,(j+h)*2-30])}return out}
// ======================================================================================= Backbrick Rooms
const BBQ=['...............','...............','..p..##o###oo##','.....#....#....','.....#....#....','..####....#....','..#...###.#.###','..o...#p.....p.','..#...#..d....d','..#.....d#o#...','..#####..oc#.d.','..o......###d..','..o...#....d...','..#...#p..d....','..#...#.d......'];
const bbc=(x,z)=>{const c=Math.min(14,Math.floor(Math.abs(x)/2)),r=Math.min(14,Math.floor(Math.abs(z)/2));return BBQ[r][c]};
const BBH=5.6,BBC=6.6;
function desk(x,z,ax){const w=ax?1.9:1.2,d=ax?1.2:1.9;col(x-w/2,x+w/2,z-d/2,z+d/2,1.1);if(isDry())return;
 bx(x,1.02,z,w,.12,d,0xb8955a);for(const a of[-1,1])for(const b of[-1,1])bx(x+a*(w/2-.1),.5,z+b*(d/2-.1),.1,1,.1,0x6b5a3a);
 const s=ax?1:-1;bx(x,1.5,z-(ax?.3:0),ax?.7:.1,.55,ax?.1:.7,0x23252b);bx(x,1.5,z-(ax?.34:0)+(ax?0:0),ax?.6:.06,.45,ax?.06:.6,0x8fb8a0,0,'eX');bx(x,1.12,z+(ax?.25:0),ax?.5:.3,.05,ax?.2:.5,0xdcd8cc);
 // chair
 const cx=ax?x:x+1.2,cz=ax?z+1.1:z;bx(cx,.55,cz,.6,.1,.6,0x3a3a42);bx(cx,.28,cz,.1,.5,.1,0x2a2a30);bx(ax?cx:cx+.28,.95,ax?cz+.28:cz,ax?.6:.1,.7,ax?.1:.6,0x3a3a42)}
function cabinet(x,z,ax){const w=ax?1.4:.7,d=ax?.7:1.4;col(x-w/2,x+w/2,z-d/2,z+d/2,1.6);if(isDry())return;bx(x,.8,z,w,1.6,d,0x8d9298);for(let i=0;i<3;i++){const y=.35+i*.5;if(ax)bx(x,y,z+(d/2+.01),w-.2,.4,.04,0x777c82);else bx(x+(w/2+.01),y,z,.04,.4,d-.2,0x777c82)}studs(x-w/2,x+w/2,z-d/2,z+d/2,1.6,0x8d9298,.7)}
function plant(x,z){col(x-.4,x+.4,z-.4,z+.4,1.4);if(isDry())return;cy(x,.3,z,.38,.6,0xb55a3c);for(let i=0;i<4;i++){const a=i*PI/2+.4;bx(x+Math.cos(a)*.18,1.0,z+Math.sin(a)*.18,.34,.9,.34,0x4f8f3a,a)}bx(x,1.4,z,.5,.4,.5,0x5da044)}
MAPS.reg({id:'backbrick',name:'Backbrick Rooms',tag:'Eerie office maze',theme:'Yellow offices, flickering lights, pillars and tight corridor loops.',
 blurb:'No sky, no mercy: twist through cubicles and doorways, hold the atrium and trust the flickering lights.',
 th:['#b9a24a','#6b5a1c'],indoor:true,
 plan:BBQ,
 grid:BBQ.map((r,ri)=>[...r].map((ch,ci)=>ch==='#'||ch==='p'?'K':((ri<=1&&ci>=5)||(ci<=1&&ri>=5)||(ri<=4&&ci<=4))?'z':'y').join('')),
 tiles:{y:{c:0xa68f3c,a:0x9c8634,v:.07,s:1},z:{c:0x8c7630,a:0x836e2b,v:.06,s:1}},
 light:[{t:0,top:0xb8a14a,mid:0xb8a14a,bot:0xb8a14a,fog:0xc2ad55,fn:26,ff:95,sun:0xfff2b8,si:.14,sp:[0,50,0],hs:0xfff1a8,hg:0xb09a44,hi:.92,lamp:0,star:0},
  {t:1,top:0x8f7f35,mid:0x8f7f35,bot:0x8f7f35,fog:0x8d7e3d,fn:16,ff:70,sun:0xf2f0a0,si:.08,sp:[0,50,0],hs:0xe8e095,hg:0x80702f,hi:.6,lamp:0,star:0}],
 flick(T,dt,SK){const tn=Math.min(1,(window.STORM?STORM.time():0)/150),n=Math.sin(T*37.1)*Math.sin(T*11.3)+Math.sin(T*5.17)*.8+Math.sin(T*2.9+1)*.5;const thr=1.5-tn*.35,f=n>thr?.18+.1*Math.sin(T*90):.96+.04*Math.sin(T*55);SK.hm=.55+.45*f;SK.flash=0;return f},
 build(L){
  const WALL=0xcdb85a,BASE=0x7d6a24,PIL=0xc5b36c;
  // walls, pillars, doorways
  for(const[a,b,c,d]of merge((x,z)=>bbc(x,z)==='#'))wall(a,b,c,d,BBH,WALL,{band:[0,BASE]});
  for(const[a,b,c,d]of merge((x,z)=>bbc(x,z)==='p')){wall(a,b,c,d,BBH,PIL,{band:[0,BASE]});if(!isDry()){bx((a+b)/2,BBH-.2,(c+d)/2,b-a+.3,.4,d-c+.3,shade(PIL,.85));bx((a+b)/2,.25,(c+d)/2,b-a+.3,.5,d-c+.3,shade(PIL,.8))}}
  for(const[a,b,c,d]of merge((x,z)=>bbc(x,z)==='o')){col(a,b,c,d,BBH,3.4);if(!isDry())wall(a,b,c,d,BBH-3.4,WALL,{y0:3.4,col:false,band:[0,shade(WALL,.8)]})}
  // ceiling: a dark slab with seams and light panels
  col(-31,31,-31,31,40,BBC);
  if(!isDry()){
   bx(0,BBC+.3,0,64,.6,64,0xb09c46);
   for(let k=-28;k<=28;k+=4){bx(k,BBC-.02,0,.14,.05,60,0x8a7830);bx(0,BBC-.02,k,60,.05,.14,0x8a7830)}
   for(let j=0;j<30;j++)for(let i=0;i<30;i++){const x=i*2-29,z=j*2-29,ch=bbc(x,z);if(ch==='#'||ch==='p'||(i%4!==2)||(j%4!==2))continue;
    const dead=rnd(i,j,5)<.12;bx(x,BBC-.1,z,3.2,.14,1.3,dead?0x3d3716:0xfffbe0,0,dead?undefined:'eX');bx(x,BBC-.04,z,3.5,.06,1.6,0x6f6128)}
   // border: the arena edge is a wall too, so no gap shows
   for(const s of[-1,1]){wall(-31,31,s*30,s*31,BBC,WALL,{col:false,band:[0,BASE]});wall(s*30,s*31,-31,31,BBC,WALL,{col:false,band:[0,BASE]})}
   // wall trim: dark skirting strips along the arena walls
  }
  // the atrium: a low stage with a yellow smiley plate, benches and four brick pillars (those are 'p' cells)
  col(-3.6,3.6,-3.6,3.6,.5); // .5 high: a step everyone (and the CPU) can walk straight onto; at .6 it was a wall you had to jump
  if(!isDry()){bx(0,.25,0,7.2,.5,7.2,0x9a8232);studs(-3.6,3.6,-3.6,3.6,.5,0x9a8232,1.2);cy(0,.54,0,2.2,.06,0xffd94a);for(const s of[-1,1])bx(s*.8,.6,-.3,.4,.1,.5,0x23252b);bx(0,.6,.9,1.6,.1,.3,0x23252b);
   sign(0,.56,0,0,4,4,(g,w,h)=>{g.clearRect(0,0,w,h)},{tr:true,pw:16})}
  // desks, a cabinet or two and potted plants
  mir((sx,sz)=>{
   for(let r=0;r<15;r++)for(let c=0;c<15;c++){const ch=BBQ[r][c];if(ch!=='d'&&ch!=='c')continue;const x=sx*(c*2+1),z=sz*(r*2+1);if(ch==='d')desk(x,z,((r+c)&1)===0);}
   crate(sx*20.6,sz*20.6,.9);crate(sx*19.8,sz*21.4,.8,0xa8763f,.3);
   cabinet(sx*12.8,sz*8.8,false);cabinet(sx*19.2,sz*6.7,true);cabinet(sx*26.9,sz*10.7,true);cabinet(sx*28.9,sz*7.6,false);
   plant(sx*11.2,sz*3.1);plant(sx*29,sz*3.2);plant(sx*13,sz*14.9);plant(sx*16.8,sz*25.2);plant(sx*3.4,sz*9.2);
   barrel(sx*28.8,sz*28.8);barrel(sx*27.6,sz*28.9);crate(sx*28.7,sz*26.9,1.3);
   // posters
   sign(sx*9.93,2.5,sz*7,sx>0?-PI/2:PI/2,2.2,1.5,txt('BACKBRICK INC.','#3b2f0f','#e8dc9a','bold ',{k:.2}),{pw:256});
   sign(sx*8,2.8,sz*9.93,sz>0?PI:0,2.6,.9,txt('NO RUNNING IN HALLS','#7a1a1a','#efe7c0','bold ',{k:.2}),{pw:256});
   for(const[x,z,ry]of[[sx*13.9,sz*4.93,sz>0?PI:0],[sx*25,sz*4.93,sz>0?PI:0]]){const w=bx(x,3.6,z+(sz>0?.02:-.02),1.4,.5,.06,0x2f9a3c,0,'eN')}
  });
 },
 env(){},
 // round 16: the card-art pass: BRICK BRICK BRICK stencilled on the pillars, a smiley sprayed on the walls, green exit signs, tile seams on the floor
 decor(){
  if(isDry())return;
  const stencil=(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#4a3d10';g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(h*.27)+'px "Poppins","Arial Black",sans-serif';for(let i=0;i<3;i++)g.fillText('BRICK',w/2,h*(.22+i*.28))};
  const smiley=(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(20,18,8,.85)';g.lineWidth=h*.045;g.lineCap='round';g.beginPath();g.arc(w/2,h/2,h*.42,0,PI*2);g.stroke();for(const s of[-1,1]){g.beginPath();g.moveTo(w/2+s*h*.16,h*.34);g.lineTo(w/2+s*h*.16,h*.5);g.stroke()}g.beginPath();g.arc(w/2,h*.5,h*.26,.25,PI-.25);g.stroke()};
  const exit=(g,w,h)=>{g.fillStyle='#0c6a2c';g.fillRect(0,0,w,h);g.strokeStyle='#d8ffe0';g.lineWidth=h*.06;g.strokeRect(h*.06,h*.06,w-h*.12,h*.88);g.fillStyle='#e8ffee';g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(h*.52)+'px "Poppins",sans-serif';g.fillText('EXIT',w/2,h*.54)};
  let n=0;
  for(const[a,b,c,d]of merge((x,z)=>bbc(x,z)==='p')){const cx=(a+b)/2,cz=(c+d)/2;n++;
   if(Math.abs(cx)>=Math.abs(cz)){const fx=cx>0?a-.03:b+.03;sign(fx,2.7,cz,cx>0?-PI/2:PI/2,1.7,1.7,stencil,{pw:256,tr:true})}
   else{const fz=cz>0?c-.03:d+.03;sign(cx,2.7,fz,cz>0?PI:0,1.7,1.7,stencil,{pw:256,tr:true})}}
  for(const[x,z,ry]of[[-29.94,-9,PI/2],[29.94,12,-PI/2],[-14,29.94,PI],[18,-29.94,0],[-29.94,17,PI/2],[29.94,-18,-PI/2]])sign(x,2.6,z,ry,3.4,3.4,smiley,{pw:256,tr:true});
  for(const[x,z,ry]of[[-29.93,2,PI/2],[29.93,-3,-PI/2],[3,29.93,PI],[-3,-29.93,0]]){sign(x,4.5,z,ry,1.8,.6,exit,{pw:256,lit:true})}
  // a faint tile grid across the floor
  for(let k=-30;k<=30;k+=2){bx(k,.012,0,.05,.01,60,0x80692a);bx(0,.012,k,60,.01,.05,0x80692a)}
 }
});
// ======================================================================================= Nyan Skyway
// Floating islands in the clouds: a round middle island with the pastel castle, a long island on each side,
// a corner island with a cloud tower in each corner and rainbow bridges between them. Grid letters:
// c = middle island, g = grass island, r = rainbow bridge, K = solid (the castle and the four cloud towers), space = sky.
const NYI=[[-10,10,-10,10],[18,30,-6,6],[-30,-18,-6,6],[-6,6,18,30],[-6,6,-30,-18]];
for(const sx of[-1,1])for(const sz of[-1,1])NYI.push([sx>0?20:-30,sx>0?30:-20,sz>0?20:-30,sz>0?30:-20]);
const NYB=[[10,18,-2,2],[-18,-10,-2,2],[-2,2,10,18],[-2,2,-18,-10]];
for(const sx of[-1,1])for(const sz of[-1,1]){NYB.push([sx>0?22:-26,sx>0?26:-22,sz>0?6:-20,sz>0?20:-6]);NYB.push([sx>0?6:-20,sx>0?20:-6,sz>0?22:-26,sz>0?26:-22])}
const NYPADS=[];for(const sx of[-1,1])for(const sz of[-1,1])NYPADS.push([sx*21.4,sz*28.6,17.2,sx*sz>0?0x39e6ff:0xff62b0]);
function nyCell(x,z){const ax=Math.abs(x),az=Math.abs(z);
 if(ax<4&&az<4)return'K';
 if(ax>24&&ax<28&&az>24&&az<28)return'K';
 for(const[a,b,c,d]of NYB)if(x>a&&x<b&&z>c&&z<d)return'r';
 if(ax<10&&az<10&&ax+az<=17)return'c';
 for(let i=1;i<NYI.length;i++){const[x1,x2,z1,z2]=NYI[i];if(x>x1&&x<x2&&z>z1&&z<z2)return'g'}
 return' '}
const NYG=[];for(let j=0;j<15;j++){let s='';for(let i=0;i<15;i++)s+=nyCell(i*2+1,j*2+1);NYG.push(s)}
const RB=[0xff4d6d,0xffd23f,0x5bd15b,0x4da6ff],RB6=[0xff4d6d,0xff9a3d,0xffd23f,0x5bd15b,0x4da6ff,0x9b6bff];
function nyRock(cx,cz,w,d,k){const cs=[0x8b6b4a,0x7d5f40,0x70553a,0x634a33,0x573f2b,0x4c3624,0x40301f];
 for(let i=0;i<k;i++){const s=1-i*.13;bx(cx,-1.95-i*1.5,cz,w*s,1.5,d*s,cs[i%cs.length])}}
function nyCloud(x1,x2,z1,z2,h){col(x1,x2,z1,z2,h);const cx=(x1+x2)/2,cz=(z1+z2)/2,w=x2-x1,d=z2-z1,n=Math.max(2,Math.round(h/.55)),ch=h/n;
 for(let k=0;k<n;k++){const o=k%2?.12:0,v=rnd(k,cx,cz)>.5?1:.97;bx(cx+(w>d?o:0),(k+.5)*ch,cz+(w>d?0:o),w-.04,ch-.03,d-.04,mixc(0xffffff,0xdbe8fb,k%2?.35:.12));}
 studs(x1,x2,z1,z2,h,0xf4f8ff,1)}
function nyPad(x,z,c){
 cy(x,.09,z,1.55,.18,0x3a3f58);cy(x,.2,z,1.25,.08,0x1d2036);cy(x,.27,z,1.0,.06,c,'eN');
 for(let i=0;i<3;i++)bx(x,.33,z+(i-1)*.46,1.0-Math.abs(i-1)*.4,.04,.16,0xffffff,0,'eN');
 glow(x,.7,z,3.4,c)}
function nyanArt(g,w,h){g.fillStyle='#2a1a5a';g.fillRect(0,0,w,h);
 const rc=['#ff4d6d','#ff9a3d','#ffd23f','#5bd15b','#4da6ff','#9b6bff'];
 for(let i=0;i<6;i++){g.fillStyle=rc[i];g.fillRect(0,h*.28+i*h*.07,w*.5,h*.07)}
 g.fillStyle='#f5c27a';g.fillRect(w*.38,h*.26,w*.36,h*.46);g.fillStyle='#ff8fc2';g.fillRect(w*.42,h*.31,w*.28,h*.36);
 g.fillStyle='#ff4d8d';for(const[a,b]of[[.47,.38],[.58,.46],[.5,.58],[.62,.36]])g.fillRect(w*a,h*b,w*.025,h*.03);
 g.fillStyle='#8a8f9a';g.fillRect(w*.66,h*.34,w*.26,h*.34);g.fillRect(w*.66,h*.24,w*.07,h*.12);g.fillRect(w*.85,h*.24,w*.07,h*.12);
 g.fillStyle='#fff';g.fillRect(w*.71,h*.44,w*.045,h*.06);g.fillRect(w*.82,h*.44,w*.045,h*.06);g.fillStyle='#ffb3c6';g.fillRect(w*.74,h*.58,w*.1,h*.04);
 g.fillStyle='#ffd23f';for(const[a,b]of[[.07,.1],[.3,.84],[.9,.12],[.14,.78],[.92,.82],[.55,.1]])g.fillRect(w*a,h*b,w*.035,h*.035)}
function nyFall(x,z,ry,w,len){
 if(isDry())return;
 const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#9adcff';g.fillRect(0,0,64,256);
 for(let i=0;i<22;i++){g.fillStyle=i%2?'rgba(255,255,255,.8)':'rgba(80,165,235,.6)';g.fillRect((i*29)%60,(i*47)%250,3+i%4,40+(i*13)%70)}
 const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(1,3);
 const m=new TH.Mesh(new TH.PlaneGeometry(w,len),new TH.MeshBasicMaterial({map:t,transparent:true,opacity:.85,side:TH.DoubleSide,depthWrite:false}));
 m.position.set(x,-.4-len/2,z);m.rotation.y=ry;add(m);
 anim((dt,T)=>{t.offset.y=(T*.6)%1;const k=(MAPS.lightKey()||{}).lamp||0;{const v=1-.55*k;m.material.color.setRGB(v,v,v)}});
 for(let i=0;i<3;i++)ball(x+Math.sin(ry)*.3,-len-.2+i*.5,z+Math.cos(ry)*.3,1.5+i*.7,0xf2f8ff)}
MAPS.reg({id:'nyan',name:'Nyan Skyway',tag:'Sky island battleground',theme:'Floating islands, rainbow bridges, launch pads and a pastel castle in the clouds.',
 blurb:'Cross rainbow bridges, bounce off launch pads onto the cloud towers and fight for the castle roof.',
 th:['#8fd7ff','#ff62b0'],
 grid:NYG,
 tiles:{c:{c:0x8ccfb4,a:0x80c4a8,v:.05,s:1},g:{c:0x58b647,a:0x4fa83f,v:.1,s:1},
  r:{c:(px,pz)=>{const ax=Math.abs(px),az=Math.abs(pz);const lat=(az<3&&ax>9)?pz:(ax<3&&az>9)?px:((ax>=21&&ax<=27&&az>=5&&az<=21)?px:pz);return RB[((Math.floor(lat)%4)+4)%4]},v:.02,s:1}},
 light:[{t:0,top:0x3c9bff,mid:0x9ad8ff,bot:0xe9f2ff,fog:0xc4e4ff,fn:95,ff:270,sun:0xfff6dc,si:.6,sp:[30,52,20],hs:0xdfeaff,hg:0xa0b4d6,hi:.55,disc:0xfff4cf,dsz:34,lamp:0,star:0},
  {t:.55,top:0x4b2f9a,mid:0xff62b0,bot:0xffb86c,fog:0xe48cbf,fn:70,ff:220,sun:0xff9a6a,si:.5,sp:[-55,14,-20],hs:0xb59aff,hg:0x6a4a8a,hi:.55,disc:0xff9a6a,dsz:50,lamp:.65,star:.12},
  {t:1,top:0x080b34,mid:0x35247a,bot:0xc0509a,fog:0x3a2a78,fn:55,ff:200,sun:0x9ab0ff,si:.34,sp:[-40,30,30],hs:0x8a8ae8,hg:0x3a2f78,hi:.5,disc:0xe6ecff,dsz:22,lamp:1,star:.95}],
 build(L){
  curbs(c=>c==='r'?0xf2f6ff:c==='c'?0x76bda2:0x479a38,{h:.2});
  // earth cones under every island
  for(let i=0;i<NYI.length;i++){const[a,b,c,d]=NYI[i];const q=i?0:5;nyRock((a+b)/2,(c+d)/2,b-a-.8-q,d-c-.8-q,i?6:7)}
  // slim cloud undersides and puffy rails on the rainbow bridges
  for(const[a,b,c,d]of NYB){const ax=(b-a)>(d-c);bx((a+b)/2,-1.8,(c+d)/2,b-a-.2,1.2,d-c-.2,0xe4ecf8);bx((a+b)/2,-2.9,(c+d)/2,ax?b-a-1.2:b-a-.8,1,ax?d-c-.8:d-c-1.2,0xd2ddf0);
   const n=Math.round((ax?b-a:d-c)/1.7);
   for(let i=0;i<n;i++){const t=(i+.5)/n;for(const s of[0,1]){const px=ax?lerp(a,b,t):(s?b-.28:a+.28),pz=ax?(s?d-.28:c+.28):lerp(c,d,t);cy(px,.4,pz,.26,.8,i%2?0xffffff:0xe3eefc);stud(px,.8,pz,i%2?0xffffff:0xe3eefc)}}}
  // ---- the castle on the middle island: a rainbow-banded keep with a roof deck, stairs on all four sides, corner turrets and a tall tower
  const PK=0xf2a0c8,PKD=0xc77aa4,BL=0x4da6ff,GD=0xffd23f,KH=3.0;
  col(-4,4,-4,4,KH);
  plain(-3.9,3.9,-3.9,3.9,0,KH,shade(PK,.55));
  wall(-4,4,-4,-3.5,KH,PK,{col:false,band:[1,0xffffff]});wall(-4,4,3.5,4,KH,PK,{col:false,band:[1,0xffffff]});
  wall(-4,-3.5,-3.5,3.5,KH,PK,{col:false,band:[1,0xffffff]});wall(3.5,4,-3.5,3.5,KH,PK,{col:false,band:[1,0xffffff]});
  bx(0,KH+.08,0,8.2,.16,8.2,PKD);studs(-4,4,-4,4,KH+.16,PKD,1);
  for(let k=0;k<6;k++){const y=.3+k*.4;for(const s of[-1,1]){bx(s*4.03,y,0,.07,.36,8.1,RB6[k]);bx(0,y,s*4.03,8.1,.36,.07,RB6[k])}}
  // roof parapet with a gap where each stair arrives
  const par=(a,b,c,d)=>{col(a,b,c,d,KH+1.1,KH);wall(a,b,c,d,1.0,PK,{y0:KH,col:false,studs:true})};
  par(-4,-1.75,-4,-3.55);par(1.75,4,-4,-3.55);par(-4,-1.75,3.55,4);par(1.75,4,3.55,4);par(-4,-3.55,-3.55,-1.75);par(-4,-3.55,1.75,3.55);par(3.55,4,-3.55,-1.75);par(3.55,4,1.75,3.55);
  // the central tower
  col(-2,2,-2,2,10,KH);
  plain(-1.9,1.9,-1.9,1.9,KH,10,shade(PK,.55));
  for(const[a,b,c,d]of[[-2,2,-2,-1.6],[-2,2,1.6,2],[-2,-1.6,-1.6,1.6],[1.6,2,-1.6,1.6]])wall(a,b,c,d,7,PK,{y0:KH,col:false,band:[3,0xffffff]});
  for(const s of[-1,1]){for(const y of[5.2,8.2])bx(s*2.03,y,0,.08,1.0,.8,GD,0,'eW');}
  for(let i=0;i<6;i++){const w=5-i*.8;bx(0,10.3+i*.62,0,w,.6,w,i%2?shade(BL,1.12):BL)}
  ball(0,14.1,0,.45,GD,'g');bx(0,15.2,0,.07,1.8,.07,0xcfcfcf);
  sign(0,7.1,2.07,0,3.4,3.4,nyanArt,{pw:256});sign(0,7.1,-2.07,PI,3.4,3.4,nyanArt,{pw:256});
  for(const sx of[-1,1])for(const sz of[-1,1])rtower(sx*4,sz*4,1.3,5.6,PK,{roof:BL,flag:GD,slits:2,sa:.5});
  // stairs up to the roof deck, one on each side of the keep
  stairs(8.2,0,1,6,3.4,0xf6cfe0,.5,.7);stairs(-8.2,0,0,6,3.4,0xf6cfe0,.5,.7);stairs(0,8.2,3,6,3.4,0xf6cfe0,.5,.7);stairs(0,-8.2,2,6,3.4,0xf6cfe0,.5,.7);
  // ---- cloud-brick cover on every island
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const f=(a,b,c,d)=>nyCloud(Math.min(sx*a,sx*b),Math.max(sx*a,sx*b),Math.min(sz*c,sz*d),Math.max(sz*c,sz*d),1.6);
   f(5,8,6.2,7.4);f(6.2,7.4,5,8);                       // middle island, an L at each diagonal
   nyCloud(Math.min(sx*21,sx*23.4),Math.max(sx*21,sx*23.4),Math.min(sz*25.4,sz*26.6),Math.max(sz*25.4,sz*26.6),1.5);   // corner islands
   nyCloud(Math.min(sx*25.4,sx*26.6),Math.max(sx*25.4,sx*26.6),Math.min(sz*21,sz*23.4),Math.max(sz*21,sz*23.4),1.5);
   // the long islands: two blocks flanking the middle and one back wall
   if(sz>0){nyCloud(sx>0?25.4:-26.6,sx>0?26.6:-25.4,-4.6,-2.2,1.8);nyCloud(sx>0?25.4:-26.6,sx>0?26.6:-25.4,2.2,4.6,1.8);
    nyCloud(-4.6,-2.2,sx>0?25.4:-26.6,sx>0?26.6:-25.4,1.8);nyCloud(2.2,4.6,sx>0?25.4:-26.6,sx>0?26.6:-25.4,1.8)}}
  // ---- launch pads on the corner islands: they throw you onto the cloud tower
  for(const p of NYPADS)nyPad(p[0],p[1],p[3]);
  // cloud towers
  mir((sx,sz)=>{const x1=sx>0?24:-28,x2=sx>0?28:-24,z1=sz>0?24:-28,z2=sz>0?28:-24,TH2=4.2;
   col(x1,x2,z1,z2,TH2);
   wall(x1,x2,z1,z2,TH2,0xf0f5fc,{studs:true,sc:0xdfe8f6,col:false,band:[2,0xffd23f]});
   for(let i=0;i<4;i++)bx((x1+x2)/2+(i-1.5)*.7,TH2+.16,(z1+z2)/2,.5,.12,.5,RB[i],0,'eN');
   for(const a of[x1+.15,x2-.15])for(const b of[z1+.15,z2-.15])bx(a,TH2+.45,b,.26,.9,.26,GD,0,'g');
   rail(x1+.15,z1+.15,x2-.15,z1+.15,GD,.7,TH2);rail(x1+.15,z2-.15,x2-.15,z2-.15,GD,.7,TH2);rail(x1+.15,z1+.15,x1+.15,z2-.15,GD,.7,TH2);rail(x2-.15,z1+.15,x2-.15,z2-.15,GD,.7,TH2)});
  // lamps
  for(const sx of[-1,1])for(const sz of[-1,1]){lamp(sx*8.6,sz*3.8,3.4,0xffb3e0,{sz:3});lamp(sx*3.8,sz*8.6,3.4,0xffb3e0,{sz:3});lamp(sx*19.6,sz*4.4,3.2,0xffb3e0);lamp(sz*4.4,sx*19.6,3.2,0xffb3e0)}
  // waterfalls pouring off the island edges
  for(const sx of[-1,1]){nyFall(sx*30.2,0,PI/2,6,26);nyFall(0,sx*30.2,0,6,26);for(const sz of[-1,1])nyFall(sx*30.2,sz*25,PI/2,4,26)}
  // twinkling stars
  for(const[x,y,z]of[[-14,9,-6],[15,11,7],[-7,13,16],[8,10,-16],[24,9,12],[-24,10,-12]]){bx(x,(y-.6)/2,z,.34,y-.6,.34,PKD);bx(x,.2,z,.9,.4,.9,PK);col(x-.5,x+.5,z-.5,z+.5,y-.6);bx(x,y,z,1.2,.4,.4,GD,0,'eN');bx(x,y,z,.4,1.2,.4,GD,0,'eN');bx(x,y,z,.5,.5,.5,0xffffff,0,'eN')}
  // launch pads: fighters standing on one are thrown up and can steer onto the tower
  anim((dt,T)=>{for(const e of ENTS()){if(e===E&&!E.bot)continue;if(!e.gr||e.y>.4||e.hp<=0)continue;
   for(const p of NYPADS)if(Math.hypot(e.x-p[0],e.z-p[1])<1.35){e.vy=p[2];e.gr=false;break}}});
 },
 env(){
  // a sea of clouds far below, puffs around the horizon, islets in the distance, a big brick rainbow
  bx(0,-27,0,640,3,640,0xdfe8f6);
  for(let i=0;i<46;i++){const a=rnd(i,1)*PI*2,r=44+rnd(i,2)*150,x=Math.cos(a)*r,z=Math.sin(a)*r,y=-14+rnd(i,3)*8-r*.03,w=9+rnd(i,4)*16;
   bx(x,y,z,w,3,w*.6,0xeef3fb);bx(x+w*.1,y+2.2,z,w*.6,2.4,w*.4,0xf6f9fe);bx(x-w*.2,y+1.2,z+w*.15,w*.5,2,w*.4,0xe8eff9)}
  clouds(16,20,70,170,0xf4f8ff,9);
  for(let i=0;i<7;i++){const a=i/7*PI*2+.4,r=105+rnd(i,6)*35,x=Math.cos(a)*r,z=Math.sin(a)*r,y=-4+rnd(i,7)*18,w=14+rnd(i,8)*10;
   bx(x,y,z,w,2,w,0x58b647);for(let k=0;k<5;k++)bx(x,y-1-k*1.8-.9,z,w*(1-k*.16),1.8,w*(1-k*.16),[0x8b6b4a,0x7d5f40,0x70553a,0x634a33,0x573f2b][k]);
   if(i%2===0){bx(x,y+4,z,3,6,3,0xf2a0c8);bx(x,y+7.6,z,3.8,.6,3.8,0x4da6ff);bx(x,y+8.9,z,2,2,2,0x4da6ff)}else tree0(x,z,1.2)}
  for(let b=0;b<6;b++){const R=66-b*2.7;for(let s=0;s<=64;s++){const a=PI*(s/64);bx(-Math.cos(a)*R,Math.sin(a)*R-20,-141,3.4,3.2,2.2+b*.25,RB6[b])}}
 },
 // round 16: the card-art pass: Nyan cats flying through the sky with rainbow trails, more floating islets with golden towers and pink blossom trees, big puffy clouds
 decor(){
  if(isDry())return;const KT=MAPS.kit;
  KT.nyanCat(-8,38,-92,0,2.2);KT.nyanCat(46,46,84,PI,1.8);KT.nyanCat(92,34,-20,PI/2+.5,1.5);
  const cherry=(x,y,z,s)=>{bx(x,y+1.2*s,z,.7*s,2.4*s,.7*s,0x6a4a3a);for(const[dx,dy,dz,w]of[[0,2.9,0,3.4],[.5,3.8,.2,2.6],[-.6,4.5,-.2,1.8],[0,5.1,.1,1.0]])bx(x+dx*s,y+dy*s,z+dz*s,w*s,.9*s,w*s,(dx+dy)%2?0xf08ab8:0xff9ac8);
   for(let i=0;i<5;i++)bx(x+(rnd(i,x,1)-.5)*3*s,y+2.6*s+rnd(i,z,2)*2*s,z+(rnd(i,y,3)-.5)*3*s,.28*s,.28*s,.28*s,0xffffff)};
  const goldTower=(x,y,z,s,hh)=>{bx(x,y+hh/2,z,1.6*s,hh,1.6*s,0xf6e6b8);for(let k=0;k<3;k++)bx(x,y+hh*(.3+.25*k),z+.82*s,.5*s,.7*s,.06,0xffd23f,0,'eN');
   for(let i=0;i<5;i++){const w=(2.6-i*.5)*s;bx(x,y+hh+(i+.5)*.55*s,z,w,.55*s,w,i%2?0xffd23f:0xf2b21c,0,'g')}bx(x,y+hh+3.3*s,z,.1,1.1*s,.1,0xcfcfcf)};
  for(let i=0;i<12;i++){const a=i/12*PI*2+.5,r=64+rnd(i,3)*30,x=Math.cos(a)*r,z=Math.sin(a)*r,y=-6+rnd(i,4)*22,w=11+rnd(i,5)*7;
   bx(x,y,z,w,1.6,w,0x58b647);bx(x,y+.9,z,w+.4,.3,w+.4,0x6ac856);for(let k=0;k<5;k++)bx(x,y-1.7-k*1.8,z,w*(1-k*.17),1.8,w*(1-k*.17),[0x8b6b4a,0x7d5f40,0x70553a,0x634a33,0x573f2b][k]);
   if(i%3===0)cherry(x,y+1,z,1.3+rnd(i,6)*.5);else{goldTower(x,y+.9,z,1.2,5+rnd(i,7)*5);goldTower(x+w*.3,y+.9,z-w*.2,.8,3+rnd(i,8)*2);if(i%3===1)cherry(x-w*.28,y+1,z+w*.2,.9)}
   KT.flame(x+w*.4,y+1.2,z+w*.4,.9,false);KT.flame(x-w*.4,y+1.2,z-w*.4,.9,false)}
  for(let i=0;i<11;i++){const a=i/11*PI*2+.1,r=130+rnd(i,12)*60;KT.cumulus(Math.cos(a)*r,10+rnd(i,13)*50,Math.sin(a)*r,2+rnd(i,14)*1.5,0xffffff)}
 }
});
// ======================================================================================= Troll Toll Ruins
// A canal runs north-south through the middle and the only dry way over is the toll bridge. Ruined walls with gates, breaches and
// broken sections line both halves, ruined toll booths flank the bridge ends and a watchtower stands in every corner.
// Grid letters: b = bridge stones, p = road, g = cobbles, m = mossy cobbles, K = watchtower, space = canal (water, no walking).
const TRG=[];for(let j=0;j<15;j++){let s='';for(let i=0;i<15;i++){let ch;
 if(i<3&&j>=3)ch=' ';else if(i<3)ch='b';else if(i>=12&&i<=13&&j>=12&&j<=13)ch='K';else if(j<=1)ch='p';else ch=((i*7+j*3)%11===0||(i*5+j*2)%13===0)?'m':'g';
 s+=ch}TRG.push(s)}
const TRS=0x8f948a,TRD=0x6f746b,TRM=0x5f7d46;
function trollArt(g,w,h){g.fillStyle='#8d9288';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=2;for(let k=1;k<6;k++){g.beginPath();g.moveTo(0,h*k/6);g.lineTo(w,h*k/6);g.stroke()}
 g.fillStyle='rgba(95,125,70,.5)';for(const[a,b,c]of[[.02,.0,.2],[.7,.92,.3],[.0,.78,.15]])g.fillRect(w*a,h*b,w*c,h*.08);
 const ink='#1b1b1b';g.lineWidth=w*.014;g.strokeStyle=ink;g.fillStyle='#f6f2ea';
 g.beginPath();g.ellipse(w*.5,h*.52,w*.34,h*.43,0,0,Math.PI*2);g.fill();g.stroke();
 g.lineWidth=w*.03;g.lineCap='round';g.beginPath();g.moveTo(w*.24,h*.3);g.quadraticCurveTo(w*.34,h*.2,w*.45,h*.26);g.moveTo(w*.76,h*.3);g.quadraticCurveTo(w*.66,h*.2,w*.55,h*.26);g.stroke();
 g.lineWidth=w*.014;g.fillStyle='#fff';for(const x of[.34,.66]){g.beginPath();g.ellipse(w*x,h*.37,w*.07,h*.06,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle=ink;g.beginPath();g.arc(w*(x+(x<.5?.012:-.012)),h*.375,w*.016,0,Math.PI*2);g.fill();g.fillStyle='#fff'}
 g.beginPath();g.moveTo(w*.47,h*.45);g.quadraticCurveTo(w*.5,h*.5,w*.53,h*.45);g.stroke();
 g.beginPath();g.moveTo(w*.2,h*.55);g.quadraticCurveTo(w*.5,h*.98,w*.8,h*.55);g.quadraticCurveTo(w*.5,h*.62,w*.2,h*.55);g.fillStyle='#fff';g.fill();g.stroke();
 g.lineWidth=w*.008;for(let k=1;k<6;k++){const x=w*(.2+k*.1);g.beginPath();g.moveTo(x,h*(.585-Math.abs(k-3)*.004));g.lineTo(x,h*(.66+(3-Math.abs(k-3))*.04));g.stroke()}
 g.lineWidth=w*.01;g.beginPath();g.moveTo(w*.18,h*.5);g.quadraticCurveTo(w*.14,h*.58,w*.2,h*.62);g.moveTo(w*.82,h*.5);g.quadraticCurveTo(w*.86,h*.58,w*.8,h*.62);g.stroke()}
function tollArt(l1,l2,bg){return(g,w,h)=>{g.fillStyle=bg||'#6b4a2b';g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.22)';for(let k=1;k<4;k++)g.fillRect(0,h*k/4-1,w,2);
 g.strokeStyle='#d9c27a';g.lineWidth=h*.05;g.strokeRect(h*.06,h*.06,w-h*.12,h*.88);g.fillStyle='#ffe9a8';g.textAlign='center';g.textBaseline='middle';
 g.font='bold '+Math.round(h*.38)+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.fillText(l1,w/2,h*.36);g.font='bold '+Math.round(h*.24)+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.fillStyle='#ffd23f';g.fillText(l2,w/2,h*.72)}}
function trChest(x,z,ax,mimic){const w=ax?1.5:1.0,d=ax?1.0:1.5;col(x-w/2,x+w/2,z-d/2,z+d/2,.95);
 bx(x,.32,z,w,.64,d,0x8a5a2b);bx(x,.78,z,w-.04,.3,d-.04,0x9c6a36);bx(x,.64,z,w+.02,.1,d+.02,0xffd02f,0,'g');
 for(const s of[-1,1]){if(ax)bx(x+s*w*.32,.5,z,.12,.9,d+.04,0xffd02f,0,'g');else bx(x,.5,z+s*d*.32,w+.04,.9,.12,0xffd02f,0,'g')}
 bx(ax?x:x+.0,.6,ax?z+d/2+.03:z+d/2+.03,.2,.22,.06,0xfff0a0,0,'g');
 if(mimic){const n=5;for(let i=0;i<n;i++){const t=(i+.5)/n-.5;if(ax)bx(x+t*w*.9,.7,z+d/2-.04,.1,.14,.07,0xffffff);else bx(x+d*.0+(i%2?0:0),.7,z+t*d*.9,.07,.14,.1,0xffffff)}
  bx(x,.58,z+(ax?d/2-.1:0),ax?w*.7:.05,.08,ax?.05:d*.7,0xd8314a);stud(x-w*.25,.97,z,0xffd02f);stud(x+w*.25,.97,z,0xffd02f)}}
function trWall(x1,x2,z1,z2,h,o){wall(x1,x2,z1,z2,h,TRS,Object.assign({studs:false},o||{}))}
function trRubble(x,z,w,d,h,seed){col(x-w/2,x+w/2,z-d/2,z+d/2,h);const n=Math.max(3,Math.round(w*d*1.2));
 for(let i=0;i<n;i++){const a=(rnd(seed,i,1)-.5)*(w-.5),b=(rnd(seed,i,2)-.5)*(d-.5),s=.5+rnd(seed,i,3)*.6,y=Math.min(h-s/2,.25+rnd(seed,i,4)*(h-.4));bx(x+a,y,z+b,s,s*.9,s*.8,shade(TRS,.8+rnd(seed,i,5)*.3),rnd(seed,i,6)*3)}
 bx(x,h*.5,z,w-.3,h-.1,d-.3,shade(TRS,.6))}
function trCone(x,z){cy(x,.05,z,.42,.1,0x2a2c33);fr(x,.4,z,.32,.1,.7,0xff7a1a);cy(x,.38,z,.27,.12,0xffffff)}
function trArm(x,z1,z2){ // a lowered barrier arm on a post
 const L=Math.abs(z2-z1),n=Math.max(2,Math.round(L/.8)),zz=Math.min(z1,z2),pz=z1;
 col(x-.12,x+.12,zz,zz+L,1.2);bx(x,.55,pz,.5,1.1,.5,0x4a4d57);bx(x,1.15,pz,.6,.12,.6,0xd8314a);
 for(let i=0;i<n;i++)bx(x,1.05,zz+(i+.5)*L/n,.18,.2,L/n-.02,i%2?0xffffff:0xd8314a)}
function trTower(cx,cz,sz){ // watchtower: 4 x 4, deck at 3.6, stairs up the middle-facing side, parapet and a roof on posts
 const x1=cx-2,x2=cx+2,z1=cz-2,z2=cz+2,DH=3.6;
 col(x1,x2,z1,z2,DH);
 wall(x1,x2,z1,z2,DH,TRS,{col:false,studs:true,sc:TRD,band:[2,0x70756c]});
 bx(cx,DH+.05,cz,4.2,.1,4.2,TRD);
 // parapet on three sides, open towards the stairs
 const par=(a,b,c,d)=>{col(a,b,c,d,DH+1.1,DH);wall(a,b,c,d,1.0,TRS,{y0:DH,col:false,studs:true,sc:TRD})};
 par(x1,x2,sz>0?z2-.5:z1,sz>0?z2:z1+.5);par(x1,x1+.5,z1,z2);par(x2-.5,x2,z1,z2);
 for(const[a,b]of[[x1+.2,z1+.2],[x2-.2,z1+.2],[x1+.2,z2-.2],[x2-.2,z2-.2]])bx(a,DH+3.1,b,.3,4.2,.3,0x6b4a2b);
 bx(cx,DH+5.35,cz,4.8,.3,4.8,0x7a3b2e);bx(cx,DH+5.65,cz,3.4,.3,3.4,0x8a4636);bx(cx,DH+5.95,cz,2,.3,2,0x9a5240);
 bx(cx,DH+6.6,cz,.08,1.2,.08,0xcfcfcf);bx(cx+.4,DH+6.9,cz,.8,.5,.05,0x3d9b45);
 if(sz>0)stairs(cx,z1-8*.8,2,8,2.4,0x9a9f94,.45,.8);else stairs(cx,z2+8*.8,3,8,2.4,0x9a9f94,.45,.8)}
MAPS.reg({id:'trolls',name:'Troll Toll Ruins',tag:'Prank-filled bridge showdown',theme:'A mossy toll bridge over a dark canal, ruined walls, fake chests and a grinning troll.',
 blurb:'Fight for the toll bridge, slip through gates and breaches in the ruined walls and watch out for the mimic chests.',
 th:['#6f7a66','#2d4a54'],
 grid:TRG,
 tiles:{b:{c:0x8a8d94,a:0x80838b,v:.06,s:1},p:{c:0x8c8372,a:0x827a69,v:.08,s:0},g:{c:0x74786b,a:0x6c7064,v:.1,s:1},m:{c:0x5f7a48,a:0x587141,v:.12,s:1}},
 light:[{t:0,top:0x4a8fd8,mid:0x9cc4e4,bot:0xf0dcb0,fog:0xa8bcc4,fn:70,ff:230,sun:0xffd9a0,si:.55,sp:[35,38,18],hs:0xc4d0dc,hg:0x5a5648,hi:.58,disc:0xffd9a0,dsz:28,lamp:0,star:0},
  {t:.5,top:0x3b4558,mid:0x7a6f78,bot:0xcf9a6a,fog:0x7b7480,fn:48,ff:170,sun:0xffa066,si:.4,sp:[-45,18,-24],hs:0x8f93b4,hg:0x4a4350,hi:.55,disc:0xffa066,dsz:34,lamp:.6,star:0},
  {t:1,top:0x161a2e,mid:0x40384f,bot:0xa85e46,fog:0x453f55,fn:38,ff:150,sun:0xff7a50,si:.3,sp:[-50,10,-30],hs:0x7078a8,hg:0x352f3e,hi:.5,disc:0xff7a50,dsz:38,lamp:1,star:.05}],
 // stormy dusk: lightning flashes now and then once the storm gets going
 flick(T,dt,SK){const tn=Math.min(1,(window.STORM?STORM.time():0)/150);let fl=0;
  if(tn>.45){const per=9-tn*4,k=Math.floor(T/per),ph=T-k*per,st=rnd(k,3,9)*(per-1.2),u=ph-st;if(u>0&&u<.5)fl=(u<.08?1:u<.16?.1:u<.24?.8:.25*(1-(u-.24)/.26))*.55*tn}
  SK.flash=fl;SK.hm=1;return 1},
 build(L){
  curbs(c=>c==='b'?0x9a9da4:0x6d7164,{h:.22});
  // ---- the toll bridge: parapets with the gantry in the middle, lamps, barrier arms
  for(const sz of[-1,1]){const z1=sz>0?5.4:-6,z2=sz>0?6:-5.4;
   for(const[a,b]of[[-6,-.7],[.7,6]]){col(a,b,z1,z2,1.1);wall(a,b,z1,z2,1.0,TRS,{col:false,studs:true,sc:TRD,cren:false});}
   col(-.7,.7,z1,z2,6.4);wall(-.7,.7,z1,z2,6.2,TRS,{col:false,band:[3,0x70756c]});
   lamp(-5.5,sz*5.1,3.0,0xffcf7a);lamp(5.5,sz*5.1,3.0,0xffcf7a)}
  bx(0,6.5,0,1.4,.5,12.6,0x6b4a2b);bx(0,5.4,0,.3,1.55,5.9,0x4a331d);for(const s of[-2.6,2.6])bx(0,6.0,s,.12,.5,.12,0x23252b);
  sign(.17,5.4,0,PI/2,5.8,1.5,tollArt('TROLL TOLL','PAY 1 BRICK OR ELSE'),{pw:512});sign(-.17,5.4,0,-PI/2,5.8,1.5,tollArt('TROLL TOLL','NO REFUNDS. LOL'),{pw:512});
  trArm(-6.8,-5,-1.2);trArm(6.8,5,1.2);
  // ---- the canal: troll carvings on the stone at both ends, dark tunnel mouths in the banks
  for(const sz of[-1,1]){bx(0,3.6,sz*29.4,12.6,7.2,1.2,TRD);bx(0,.1,sz*29.4,12.8,.2,1.4,0x5a5e56);
   for(const s of[-1,1])bx(s*5.2,4.2,sz*28.7,1.6,.5,.5,TRS)}
  for(const sx of[-1,1])for(const sz of[-1,1]){bx(sx*5.99,-.45,sz*14,.06,1.0,2.4,0x0d1418);bx(sx*5.97,.15,sz*14,.14,.3,2.8,TRS)}
  // ---- the ruined walls that line both halves (gate in the middle, breaches and broken sections)
  for(const sx of[-1,1]){const x1=sx>0?14.4:-15.6,x2=sx>0?15.6:-14.4;
   col(x1,x2,-2.4,2.4,4.4,3.0);wall(x1,x2,-2.4,2.4,1.4,TRS,{y0:3.0,col:false,band:[0,0x70756c]});
   for(const s of[-1,1]){bx(sx*15,4.0,s*2.55,1.4,.3,.5,TRD);bx(sx*15,4.0,s*-2.55,1.4,.3,.5,TRD)}
   for(const sz of[-1,1]){const Z=(a,b)=>[Math.min(sz*a,sz*b),Math.max(sz*a,sz*b)];
    let[a,b]=Z(2.4,6.4);trWall(x1,x2,a,b,3.8,{cren:true,cc:TRS});
    [a,b]=Z(6.4,8.2);trWall(x1,x2,a,b,3.4);[a,b]=Z(8.2,9.6);trWall(x1,x2,a,b,2.4);[a,b]=Z(9.6,11);trWall(x1,x2,a,b,3.0);[a,b]=Z(11,12);trWall(x1,x2,a,b,1.6);
    [a,b]=Z(12,14.5);trRubble(sx*15,(a+b)/2,1.6,2.5,.9,sx*3+sz);
    [a,b]=Z(14.5,21.8);trWall(x1,x2,a,b,3.4,{cren:true,cc:TRS});
    [a,b]=Z(21.8,25);trRubble(sx*15,(a+b)/2,1.6,3.2,1.0,sx*7+sz*2);
    [a,b]=Z(25,30);trWall(x1,x2,a,b,3.8,{cren:true,cc:TRS});
    // a little moss on the wall tops
    for(let i=0;i<5;i++){const zz=sz*(3+i*5.3+rnd(i,sx,sz)*2);bx(sx*15+(rnd(i,3,sz)-.5)*.6,3.45+(i%2)*.35,zz,.7,.18,.7,TRM)}}
   brazier(sx*13.2,2.9);brazier(sx*13.2,-2.9)}
  // ---- ruined toll booths flanking the bridge ends: three walls, the fourth side collapsed
  for(const sx of[-1,1])for(const sz of[-1,1]){const cx=sx*9,cz=sz*6.4,W=1.5;
   col(cx-W,cx+W,cz-W,cz+W,.2);plain(cx-W,cx+W,cz-W,cz+W,0,.2,0x6a6d66);
   const bz=sz>0?[cz+W-.45,cz+W]:[cz-W,cz-W+.45],ix=sx>0?[cx-W,cx-W+.45]:[cx+W-.45,cx+W],ox=sx>0?[cx+W-.45,cx+W]:[cx-W,cx-W+.45];
   trWall(sx>0?cx-W+.45:cx-W,sx>0?cx+W:cx+W-.45,bz[0],bz[1],2.9,{studs:false,cren:false});
   trWall(ix[0],ix[1],cz-W,cz+W,2.9);
   {const hs=sz>0?[1.5,.8]:[.8,1.5];trWall(ox[0],ox[1],cz-W,cz,hs[0]);trWall(ox[0],ox[1],cz,cz+W,hs[1])}
   col(cx-.55,cx+.55,cz-.4,cz+.4,1.0);bx(cx,.5,cz,1.1,1.0,.8,0x6b4a2b);bx(cx,1.04,cz,1.3,.1,1.0,0x8a5a2b);
   bx(cx,3.05,cz+(sz>0?W*.4:-W*.4),W*2+.3,.22,W*1.2,0x7a3b2e);bx(cx,3.27,cz+(sz>0?W*.4:-W*.4),W*2-.3,.2,W*.9,0x8a4636);
  }
  // ---- watchtowers in the corners
  for(const sx of[-1,1])for(const sz of[-1,1])trTower(sx*26,sz*26,sz);
  // ---- fake chests and other pranks
  trChest(10,-12,true,true);trChest(-10,12,true,true);trChest(11.6,15,false,false);trChest(-11.6,-15,false,false);
  trChest(19,-9.5,true,true);trChest(-19,9.5,true,true);
  for(const[x,z]of[[7.6,-2.2],[7.9,-1.3],[-7.6,2.2],[-7.9,1.3],[19.5,11],[-19.5,-11]])trCone(x,z);
  // standing stones with the troll face
  for(const[x,z,ry]of[[9.5,16,-PI/2],[-9.5,-16,PI/2]]){col(x-.7,x+.7,z-.4,z+.4,3.2);bx(x,1.6,z,1.4,3.2,.8,TRD);bx(x,3.3,z,1.6,.2,1.0,TRS);sign(x,2.0,z+(x>0?-.41:.41),x>0?PI:0,1.3,1.3,trollArt,{pw:128})}
  // spawn plazas: some crates and barrels to hide behind
  for(const sx of[-1,1]){crate(sx*20,-6,1.6);crate(sx*20,6.4,1.6);crate(sx*21.6,6.4,1.2,0x7a5232);barrel(sx*18.4,-7.4);barrel(sx*18.6,-6.2);barrel(sx*27,0);barrel(sx*27,1.2);crate(sx*24,-12,1.7);crate(sx*24,12,1.7);lamp(sx*18,-3.4,3.2,0xffcf7a);lamp(sx*18,3.4,3.2,0xffcf7a);lamp(sx*28.6,-6,3.2,0xffcf7a)}
  for(const[x,z]of[[11,-24],[-11,24],[12,24],[-12,-24]]){crate(x,z,1.6);barrel(x+1.6,z+.4)}
 },
 env(){
  // dark canal water, a murky bank all round, stormy clouds, hills and dead trees
  water({size:80,y:-.95,c1:'#16303c',c2:'#5a9aa6',bed:0x0a1c26,op:.9});
  bank(0,0x59604f,{h:2,hole:30,R:200});
  clouds(18,26,60,170,0x6a727e,5);
  const hill=(x,z,w,h,c)=>{const k=Math.max(4,Math.round(h/2.4));for(let i=0;i<k;i++){const f=1-i/(k+.5);bx(x,h*(i+.5)/k-2,z,w*f,h/k+.05,w*f*(.8+.2*Math.sin(i+x)),shade(c,1+(i%2?.06:-.04)))}};
  for(let i=0;i<10;i++){const a=i/10*PI*2+.3,r=95+rnd(i,2)*40;hill(Math.cos(a)*r,Math.sin(a)*r,34+rnd(i,3)*24,12+rnd(i,4)*14,[0x4a5a44,0x55644c,0x3f4f45][i%3])}
  for(let i=0;i<16;i++){const a=i/16*PI*2+.1,r=40+rnd(i,6)*22,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<34&&Math.abs(z)<34)continue;tree0(x,z,1.4+rnd(i,7)*.8,{c1:0x55633a,c2:0x66723f})}
 },
 // round 16: the card-art pass: huge carved troll heads on the end walls with waterfalls beside them, ivy, flaming wall torches, crown banners, big clouds
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  for(const sz of[-1,1]){KT.trollHead(0,2.3,sz*28.35,sz>0?PI:0,1.0);
   for(const sx of[-1,1]){KT.fall(sx*4.7,sz*28.7,sz>0?PI:0,1.7,6.8,-.95);KT.vines(sx*5.2,7.0,sz*28.7,sz>0?PI:0,2.2,5.5,sx+sz*3);
    KT.wallTorch(sx*2.1,3.1,sz*28.7,sz>0?PI:0,{glow:true})}}
  for(const sx of[-1,1]){const ix=sx>0?14.3:-14.3,ry=sx>0?-PI/2:PI/2;
   for(const z of[-4.6,4.6,-17,17,-23.5,23.5])KT.crownBanner(ix,3.6,z,ry,1.2,2.5);
   for(const z of[-7,7,-10.8,10.8,-19.4,19.4,-27,27])KT.wallTorch(ix,2.2,z,ry,{glow:Math.abs(z)<12});
   for(const z of[-8,-15.5,15.5,8,-21,21])KT.vines(ix,3.2,z,ry,2.0,2.6,z+sx*5)}
  for(const sx of[-1,1])for(const sz of[-1,1]){KT.vines(sx*26+sx*2.05,3.6,sz*26,sx>0?PI/2:-PI/2,3,3.4,sx*3+sz);KT.wallTorch(sx*26-sx*2.05,2.6,sz*26+sz*1.2,sx>0?-PI/2:PI/2,{glow:true})}
  for(let i=0;i<10;i++){const a=i/10*PI*2+.3,r=120+rnd(i,9)*70;KT.cumulus(Math.cos(a)*r,46+rnd(i,10)*26,Math.sin(a)*r,1.6+rnd(i,11),0xf4f2f0)}
  for(let i=0;i<8;i++){const a=i/8*PI*2+.8,r=190+rnd(i,12)*30;KT.peak(Math.cos(a)*r,Math.sin(a)*r,60+rnd(i,13)*30,44+rnd(i,14)*30,0x6a7a8c,{snow:0xe8eef4,y0:-6})}
 }
});
})();
