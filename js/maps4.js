/* Maps, part 4: Pork Portal Plaza and Wojak Worksite. Same kit and the same grid rules as maps1.js / maps2.js. */
(()=>{
const LB=MAPS.lib,{bx,cy,fr,ball,stud,studs,col,wall,plain,stairs,crate,barrel,lamp,glow,sign,water,bank,shade,mixc,rnd,lerp,anim,curbs,rail,clouds,win,door,gable,tree0,planter,bench,isDry,TH,add}=LB;
const PI=Math.PI,mir=(f,z)=>{for(const sx of[-1,1]){if(z===false)f(sx,1);else for(const sz of[-1,1])f(sx,sz)}};
const rg=(s,a,b)=>s>0?[a,b]:[-b,-a];
const FONT='"Comic Sans MS","Chalkboard SE",cursive,sans-serif';
const neonTxt=(t,fg,bg,k)=>(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=h*.05;g.strokeRect(h*.06,h*.08,w-h*.12,h*.84);
 g.fillStyle=fg;g.shadowColor=fg;g.shadowBlur=h*.25;g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(h*(k||.52))+'px '+FONT;g.fillText(t,w/2,h*.54);g.shadowBlur=0};
// ======================================================================================= Pork Portal Plaza
// A neon corporate plaza: a stepped plinth with the pig statue in the middle, four office blocks with skybridges you can walk under (stairs to the
// roofs), teleporter pads that swap you across the plaza, and a portal gate behind each spawn.
// Grid letters: a = pavers, b = plum ring, c = spawn pads, K = plinth / office / facade.
function pkCell(c,r){
 if(c<=1&&r<=1)return'K';
 if(c===14||r===14)return'K';
 if(((c>=5&&c<=6)||(c>=9&&c<=10))&&r>=8&&r<=11)return'K';
 if(c>=10&&c<=12&&r<=1)return'c';
 const q=c*c+r*r;if(q>=4&&q<=13)return'b';
 return'a';
}
const PKG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=pkCell(c,r);PKG.push(s)}
const PINK=0xf2a6bb,PLUM=0x6f5190,NEP=0xff4fd8,NEC=0x4fe8ff;
function pigArt(g,w,h){
 g.fillStyle='#f4a9bf';g.fillRect(0,0,w,h);g.fillStyle='#e993ad';g.fillRect(0,h*.88,w,h*.12);
 g.fillStyle='rgba(255,120,150,.35)';for(const x of[.14,.86]){g.beginPath();g.ellipse(w*x,h*.62,w*.09,h*.07,0,0,PI*2);g.fill()}
 g.fillStyle='#e585a3';g.beginPath();g.ellipse(w*.5,h*.7,w*.27,h*.17,0,0,PI*2);g.fill();g.lineWidth=w*.012;g.strokeStyle='#b8476a';g.stroke();
 g.fillStyle='#a63a5c';for(const x of[.42,.58]){g.beginPath();g.ellipse(w*x,h*.7,w*.035,h*.055,0,0,PI*2);g.fill()}
 g.fillStyle='#14141c';g.fillRect(w*.07,h*.3,w*.86,h*.15);g.fillRect(w*.45,h*.28,w*.1,h*.04); // sunglasses
 g.fillStyle='#232338';g.fillRect(w*.1,h*.32,w*.34,h*.11);g.fillRect(w*.56,h*.32,w*.34,h*.11);
 g.fillStyle='rgba(255,255,255,.55)';g.fillRect(w*.14,h*.33,w*.1,h*.025);g.fillRect(w*.6,h*.33,w*.1,h*.025);
 g.fillStyle='#ffd02f';g.fillRect(w*.3,h*.9,w*.4,h*.05)}
function pkSignArt(t){return(g,w,h)=>{g.fillStyle='#17102a';g.fillRect(0,0,w,h);
 g.strokeStyle='#ff4fd8';g.lineWidth=h*.06;g.shadowColor='#ff4fd8';g.shadowBlur=h*.3;g.strokeRect(h*.08,h*.1,w-h*.16,h*.8);
 g.fillStyle='#ffd0f4';g.font='bold '+Math.round(h*.5)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(t,w*.54,h*.54);
 g.shadowBlur=0;g.fillStyle='#f4a9bf';g.beginPath();g.ellipse(h*.62,h*.5,h*.26,h*.24,0,0,PI*2);g.fill();g.fillStyle='#14141c';g.fillRect(h*.4,h*.4,h*.44,h*.1);g.fillStyle='#e585a3';g.beginPath();g.ellipse(h*.62,h*.62,h*.1,h*.07,0,0,PI*2);g.fill()}}
const pkFlash=[0,0,0,0],pkGl=[];
const PKPADS=[[8,10,-8,-10,NEP],[-8,-10,8,10,NEP],[8,-10,-8,10,NEC],[-8,10,8,-10,NEC]];
function pkPad(i){const[x,z,,,c]=PKPADS[i];
 cy(x,.1,z,1.55,.2,0x2a2540);cy(x,.22,z,1.25,.08,c,'eN');cy(x,.28,z,.85,.06,0xffffff,'eN');
 for(let k=0;k<8;k++){const a=k/8*PI*2;bx(x+Math.cos(a)*1.45,.16,z+Math.sin(a)*1.45,.34,.14,.34,0x2a2540,a)}
 if(isDry())return;
 glow(x,.9,z,3.8,c);const G=LB.glows();pkGl[i]=G[G.length-1].sp;
 const beam=new TH.Mesh(new TH.CylinderGeometry(1.0,1.0,7,20,1,true),new TH.MeshBasicMaterial({color:c,transparent:true,opacity:.2,depthWrite:false,side:TH.DoubleSide,blending:TH.AdditiveBlending}));
 beam.position.set(x,3.6,z);add(beam);pkGl[i]._beam=beam}
function pkOffice(sx,sz,which){
 const[x1,x2]=rg(sx,which?18:10,which?22:14),z1=sz>0?16:-24,z2=sz>0?24:-16,cx=(x1+x2)/2,cz=(z1+z2)/2,H=4.0,c=which?0x7a9db4:0x9a86b8;
 col(x1,x2,z1,z2,H);
 if(isDry())return;
 wall(x1,x2,z1,z2,H,c,{col:false,studs:true,sc:shade(c,.9),band:[1,0xffffff]});
 bx(cx,H+.05,cz,x2-x1+.2,.1,z2-z1+.2,0x3a3550);
 // window bays on the two long faces and the two ends
 const gl=0xffd6f2;for(const fx of[x1,x2]){const out=fx===x1?-1:1;for(let k=0;k<4;k++){const zz=z1+1+k*2;win(fx+out*.02,2.5,zz,false,1.2,1.3,gl,0xf2f2f2)}}
 for(const fz of[z1,z2]){const out=fz===z1?-1:1;for(let k=0;k<2;k++){const xx=x1+1+k*2;win(xx,2.5,fz+out*.02,true,1.2,1.3,gl,0xf2f2f2)}}
 // rooftop machinery
 const ac=(a,b)=>{col(a-.7,a+.7,b-.7,b+.7,H+1.2);bx(a,H+.6,b,1.4,1.2,1.4,0xb8bcc8);bx(a,H+1.25,b,1.2,.1,1.2,0x7a7f8e);cy(a,H+1.36,b,.45,.06,0x3a3f4e)};
 ac((x1+x2)/2+(sx>0?.6:-.6),cz+(sz>0?2.6:-2.6));
 bx(cx+(sx>0?.9:-.9),H+1.9,cz-(sz>0?2.4:-2.4),.07,1.8,.07,0xcfcfcf);
 // parapet: the outer side and the back, stairs arrive at the front and the bridge at the other end
 const par=(a,b,c2,d)=>{col(a,b,c2,d,H+1.1,H);wall(a,b,c2,d,1.0,c,{y0:H,col:false,studs:true,sc:shade(c,.92)})};
 const outer=which?rg(sx,21.5,22):rg(sx,10,10.5),back=sz>0?[23.5,24]:[-24,-23.5];
 par(outer[0],outer[1],z1,z2);par(x1,x2,back[0],back[1]);
 // stairs to the roof, on the side that faces the middle of the plaza
 stairs((x1+x2)/2,sz*9.6,sz>0?2:3,8,2.4,0x9a8cc0,.5,.8);
 // a door on the tunnel side
 door(which?(sx>0?x1-.0:x2+.0):(sx>0?x2:x1),sz*20,false,2.0,2.4,0x3a3550,0xd8d2e8);
 // neon sign on the plaza-facing wall of the outer block
 if(!which)sign(sx>0?x1-.03:x2+.03,2.6,cz,sx>0?-PI/2:PI/2,6.4,1.4,pkSignArt('PORK CORP'),{pw:512,lit:true})}
function pkBridge(sx,sz){const[x1,x2]=rg(sx,14,18),z1=sz>0?16:-24,z2=sz>0?24:-16,cx=(x1+x2)/2,cz=(z1+z2)/2;
 col(x1,x2,z1,z2,4.0,3.0);if(isDry())return;
 bx(cx,3.5,cz,4,1.0,8,0x4a4268);bx(cx,3.5,cz,3.9,.96,8.02,0x57507a);
 for(const o of[-1.3,0,1.3])bx(cx+o,2.95,cz,.22,.08,7.4,0xffe0f4,0,'eN');
 bx(cx,3.98,cz,4.05,.08,8.05,0x3a3550);
 // light strips under the bridge and little wall lamps at the tunnel ends
 for(const z of[z1+.5,z2-.5])bx(cx,2.8,z,3.6,.1,.18,NEP,0,'eN')}
function pkFacade(){
 // four perimeter strips, 2 m thick and 6.4 m high
 const H=6.4,strips=[[-30,30,28,30],[-30,30,-30,-28]],bandsC=0x2c3040;
 col(28,30,-30,30,H);col(-30,-28,-30,30,H);col(-28,28,28,30,H);col(-28,28,-30,-28,H);
 if(isDry())return;
 const face=(ax,s)=>{ // ax: the wall runs along x (it is a z-wall); s: -1/1 the side of the arena it stands on
  const L=ax?56:60,mid=ax?0:0,o=s*28;
  const px=(a,y,w,h,d,c,mt)=>ax?bx(a,y,o+s*(2-d/2),w,h,d,c,0,mt):bx(o+s*(2-d/2),y,a,d,h,w,c,0,mt);
  px(0,H/2,L,H,2,bandsC);px(0,.45,L,.9,2.1,0x1d2030);px(0,H-.3,L,.6,2.15,0x1d2030);px(0,2.9,L,.12,2.05,0x7a5a96);
  const nb=Math.floor(L/2.4);for(let k=0;k<nb;k++){const a=-L/2+1.2+k*L/nb;
   for(const y of[1.9,3.8,5.2]){if(rnd(k,y,ax*3+s)<.18)continue;const wc=rnd(k,y,7)<.5?0xffd0ee:0xbfeaff;
    const g=(ww,hh,dd,yy,c,mt)=>ax?bx(a,yy,o-s*.03,ww,hh,dd,c,0,mt):bx(o-s*.03,yy,a,dd,hh,ww,c,0,mt);
    g(1.3,.9,.06,y,wc,'eW')}
   if(k%3===0)px(a+1.2,H/2,.18,H,2.12,0x1d2030)}}
 face(true,1);face(true,-1);face(false,1);face(false,-1);
 // PORK CORP signs on the facades
 for(const[x,z,ry]of[[-14,27.96,PI],[14,27.96,PI],[-14,-27.96,0],[14,-27.96,0],[27.96,-14,-PI/2],[27.96,14,-PI/2],[-27.96,-14,PI/2],[-27.96,14,PI/2]])sign(x,4.4,z,ry,9,1.6,pkSignArt(rnd(x,z,3)<.5?'PORK CORP':'BACON FUTURES'),{pw:512,lit:true})}
function pkPlinth(){
 const ring=(a,b,h)=>{col(-a,a,-a,-b,h);col(-a,a,b,a,h);col(-a,-b,-b,b,h);col(b,a,-b,b,h)};
 ring(4,3.2,.5);ring(3.2,2.4,1.0);col(-2.4,2.4,-2.4,2.4,14);
 if(isDry())return;
 bx(0,.25,0,8,.5,8,0x8b6ca8);studs(-4,4,-4,4,.5,0x8b6ca8,1);bx(0,.75,0,6.4,.5,6.4,0x9c7fb8);studs(-3.2,3.2,-3.2,3.2,1.0,0x9c7fb8,1);
 bx(0,1.55,0,4.8,1.1,4.8,0x6f5190);bx(0,2.15,0,5.0,.2,5.0,0xd6c2ee);
 for(const s of[-1,1]){bx(s*4.01,.52,0,.06,.06,8.08,NEP,0,'eN');bx(0,.52,s*4.01,8.08,.06,.06,NEP,0,'eN')}
 // pedestal, the pig head and ears, a gold plaque and a floating halo of portal discs
 bx(0,2.7,0,3.4,.9,3.4,0xcdbde0);studs(-1.7,1.7,-1.7,1.7,3.15,0xcdbde0,1);
 bx(0,4.55,0,3.1,2.8,3.1,PINK);
 for(const[ry,x,z]of[[0,0,1.56],[PI,0,-1.56],[PI/2,1.56,0],[-PI/2,-1.56,0]])sign(x,4.45,z,ry,3.0,2.6,pigArt,{pw:256});
 for(const a of[-1,1])for(const b of[-1,1]){bx(a*1.05,6.15,b*1.05,.7,.55,.7,0xe993ad);bx(a*1.05,6.5,b*1.05,.5,.2,.5,PINK)}
 bx(0,6.1,0,3.1,.2,3.1,0xe993ad);
 bx(0,7.05,0,.4,1.7,.4,0xd6c2ee);cy(0,7.9,0,3.0,.14,NEP,'eN');cy(0,8.12,0,2.3,.14,NEC,'eN');cy(0,8.34,0,1.5,.14,0xffffff,'eN');
 glow(0,5,0,9,0xff7ad8);
 for(const s of[-1,1])for(const t of[-1,1])sign(t*1.2,1.6,s*2.43,s>0?0:PI,2.0,.7,neonTxt(t>0?'PORK':'CORP','#ffd0f4','#17102a'),{pw:256,lit:true})}
function pkGate(sx){const x=sx*26.4;
 for(const z of[-3.5,3.5]){col(x-.4,x+.4,z-.4,z+.4,7);if(!isDry()){bx(x,3.5,z,.8,7,.8,0x2c2742);bx(x,.2,z,1.1,.4,1.1,0x1a1730);bx(x,6.9,z,1.0,.3,1.0,NEP,0,'eN')}}
 // a dark brick backing wall carries the giant crowned pig head; the purple portal swirls in the arch (round 16)
 col(sx>0?28.4:-30,sx>0?30:-28.4,-4.6,4.6,9.6);
 if(isDry())return;
 const ry=sx>0?-PI/2:PI/2,face=-sx;
 wall(sx>0?28.4:-30,sx>0?30:-28.4,-4.6,4.6,9.6,0x2c2742,{col:false,studs:true,sc:0x3a3358,band:[3,0x4a3f6a]});
 bx(x,7.3,0,.9,.7,8.2,0x2c2742);bx(x,6.93,0,.5,.1,7.0,NEC,0,'eN');
 MAPS.kit.portal(x+sx*.5,3.4,0,ry,6.0,6.0);
 bx(x+sx*.2,.1,0,1.4,.2,7,NEP,0,'eN');
 MAPS.kit.pigHead(x+sx*1.6,7.7,0,ry,1.35);
 for(const z of[-3.5,3.5])MAPS.kit.crownBanner(x+face*.5,6.6,z,ry,1.0,2.6);
 for(const z of[-4.1,4.1]){bx(x+face*.2,7.5,z,.5,.5,.5,0x23252b);MAPS.kit.flame(x+face*.2,7.75,z,1.2,true)}}
// teleporter pads: step on one and you arrive on the opposite one
function pkTeleport(){
 anim((dt,T)=>{
  for(let i=0;i<4;i++)pkFlash[i]=Math.max(0,pkFlash[i]-dt*1.6);
  for(const e of ENTS()){if(!e||e===E&&!E.bot)continue;e._tp=Math.max(0,(e._tp||0)-dt);if(e._tp>0||e.hp<=0||e.y>.5)continue;
   for(let i=0;i<4;i++){const p=PKPADS[i];if(Math.hypot(e.x-p[0],e.z-p[1])<1.0){e.x=p[2];e.z=p[3];e._tp=1.4;pkFlash[i]=1;
    for(let j=0;j<4;j++)if(PKPADS[j][0]===p[2]&&PKPADS[j][1]===p[3])pkFlash[j]=1;break}}}
  for(let i=0;i<4;i++){const sp=pkGl[i];if(!sp)continue;const f=pkFlash[i],s=3.8*(1+f*1.3);sp.scale.set(s,s,1);if(sp._beam)sp._beam.material.opacity=.14+.08*Math.sin(T*3+i)+.5*f*.5}});
}
function pkProps(){
 mir((sx,sz)=>{
  // kiosks and planters
  const kx=sx*6.8,kz=sz*4.6;col(kx-1.3,kx+1.3,kz-1.3,kz+1.3,2.6);
  if(!isDry()){bx(kx,1.2,kz,2.6,2.4,2.6,0xf2d6e4);bx(kx,2.55,kz,3.0,.2,3.0,NEP);for(let i=0;i<5;i++)bx(kx+(i-2)*.6,2.38,kz+sz*-1.55+sz*.12,.5,.3,.1,i%2?0xffffff:0xff9ad4);
   bx(kx,1.5,kz-sz*1.31,2.0,.9,.06,0x2a2540);bx(kx,1.5,kz-sz*1.33,1.8,.7,.04,0xffd0f4,0,'eN');stud(kx-.8,2.72,kz,NEP);stud(kx+.8,2.72,kz,NEP)}
  planter(sx*16.2,sz*5.4,3.4,1.2,0xe4d8f0,{leaf:0xf06ab8});
  bench(sx*13.2,sz*6.9,true,0xb08ad0);bench(sx*3,sz*13.2,true,0xb08ad0);
  crate(sx*24.4,sz*3.2,1.6,0xc9a0d8);barrel(sx*25.5,sz*5.2,0xb86ad0);barrel(sx*25.4,sz*6.4,0xb86ad0);crate(sx*17.2,sz*13.2,1.5,0xc9a0d8);crate(sx*26,sz*10.6,1.6,0xc9a0d8);
  lamp(sx*11,sz*7.4,3.6,NEP);lamp(sx*5,sz*10.6,3.6,NEC);lamp(sx*20.4,sz*7.8,3.6,NEC);lamp(sx*24,sz*14,3.6,NEP);lamp(sx*13,sz*26.2,3.6,NEC);lamp(sx*5.4,sz*21,3.4,NEP);
  // low planter walls as cover along the road to the spawns
  wall(rg(sx,13.5,16.3)[0],rg(sx,13.5,16.3)[1],sz*2.6-.15,sz*2.6+.15,1.2,0xcdbde0,{studs:true,sc:0xb9a6d0});
 });
 // the pad plates
 for(let i=0;i<4;i++)pkPad(i)}
MAPS.reg({id:'pork',name:'Pork Portal Plaza',tag:'Neon plaza with teleporters',theme:'A corporate plaza at neon dusk: pig statue, skybridge offices and teleporter pads.',
 blurb:'Own the plinth, run the skybridges and jump the teleporter pads to flank your rival across the plaza.',
 th:['#ff4fd8','#2a1d4a'],
 grid:PKG,
 tiles:{a:{c:0x8d90ac,a:0x80839f,v:.07,s:1},b:{c:0x7a5a96,a:0x6f5190,v:.07,s:1},c:{c:(px,pz)=>px<0?0x4a78c8:0xc84a5a,a:(px,pz)=>px<0?0x3f6cba:0xb8404f,v:.05,s:1}},
 light:[{t:0,top:0x3a2a8a,mid:0xd8508c,bot:0xffa860,fog:0xc86a8a,fn:75,ff:230,sun:0xffb080,si:.5,sp:[-40,24,-30],hs:0xe0a0ff,hg:0x6a3a5a,hi:.52,disc:0xffc080,dsz:46,lamp:.55,star:.05},
  {t:.5,top:0x2a1a6a,mid:0xc0408a,bot:0xff8850,fog:0xa85080,fn:60,ff:210,sun:0xff9a7a,si:.45,sp:[-52,15,-20],hs:0xc79aff,hg:0x5a3a7a,hi:.55,disc:0xff9a7a,dsz:48,lamp:.8,star:.1},
  {t:1,top:0x100a3a,mid:0x5a2a7a,bot:0xe0604a,fog:0x6a2a62,fn:50,ff:190,sun:0xff9a8a,si:.34,sp:[-40,28,28],hs:0x9a7aff,hg:0x4a2a6a,hi:.5,disc:0xffd0b0,dsz:26,lamp:1,star:.6}],
 build(L){
  curbs(c=>c==='b'?0x5a4078:0x7b7d96,{h:.18});
  pkPlinth();pkFacade();
  mir((sx,sz)=>{pkOffice(sx,sz,0);pkOffice(sx,sz,1);pkBridge(sx,sz)});
  pkGate(1);pkGate(-1);pkProps();pkTeleport();
  // painted lanes on the spawn roads
  for(const sx of[-1,1]){for(let k=0;k<4;k++)bx(sx*(11+k*2.6),.03,0,1.3,.04,.22,0xffffff);bx(sx*22,.03,0,.3,.04,3.6,0xffd02f)}
 },
 env(){
  clouds(12,26,70,170,0xc890b8,5);
 },
 // round 16: the card-art pass: a fiery magenta sky, floating dark-brick islands with torches and banners over a lava glow instead of the plain skyline
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  // lava far below, and the whole plaza floats on a stepped cone of dark brick with glowing cracks
  bx(0,-58,0,900,2,900,0xff5a1a,0,'eF');bx(0,-56.6,0,900,.6,900,0xffb040,0,'eF');
  for(let k=0;k<17;k++){const f=1-.93*(k+.5)/17,w=64*f,y=-1.5-k*3;bx(0,y,0,w,3.05,w,shade(k%2?0x2e2638:0x382d44,.92+rnd(k,2,3)*.16));if(k%3===1){for(const sg of[-1,1]){bx(sg*w/2,y,0,.14,2.4,w*.6,0xff7a2a,0,'eF');bx(0,y,sg*w/2,w*.6,2.4,.14,0xff7a2a,0,'eF')}}}
  glow(0,-40,0,60,0xff6a1a);
  const DK=0x3a2f45,DL=0x4c3f5c;
  const island=(x,y,z,w,d,seed,tall)=>{
   bx(x,y-.6,z,w,1.2,d,DK);bx(x,y+.08,z,w+.4,.3,d+.4,DL);
   const k=Math.round(w/1.4);for(let i=0;i<k;i++){const f=1-.9*(i+.5)/k,h=2.4+rnd(seed,i,2)*.8;bx(x+(rnd(seed,i,3)-.5)*w*.1,y-1.2-(i+.5)*h*.62,z+(rnd(seed,i,4)-.5)*d*.1,w*f,h*.62+.05,d*f,shade(i%2?0x2e2638:0x382d44,.9+rnd(seed,i,5)*.2));
    if(i%3===1)bx(x+w*f*.5-.05,y-1.2-(i+.5)*h*.62,z,.12,h*.5,d*f*.6,0xff7a2a,0,'eF')}
   // a keep with torches and banners, merlons round the rim
   if(tall){const th=6.4+rnd(seed,1,1)*7;bx(x,y+th/2,z,w*.36,th,d*.36,DK);bx(x,y+th+.2,z,w*.44,.5,d*.44,DL);for(const a of[-1,1])for(const b of[-1,1]){bx(x+a*w*.19,y+th+.8,z+b*d*.19,.7,1,.7,DL)}for(const a of[-1,1])for(const yy of[th*.4,th*.7])bx(x+a*w*.18,y+yy,z+d*.18+.02,.5,1.0,.1,0xff9a3a,0,'eF');
    KT.flame(x+w*.2,y+th+1.3,z,1.6,true);KT.flame(x-w*.2,y+th+1.3,z,1.6,true);KT.crownBanner(x,y+th-.6,z+d*.18+.1,0,1.4,3.2);KT.crownBanner(x,y+th-.6,z-d*.18-.1,PI,1.4,3.2)}
   for(let i=0;i<Math.round(w/1.6);i++){const t=(i+.5)/Math.round(w/1.6)-.5;bx(x+t*w,y+.55,z+d/2,.8,.8,.5,DL);bx(x+t*w,y+.55,z-d/2,.8,.8,.5,DL)}
   for(const a of[-1,1])for(const b of[-1,1])bx(x+a*w*.42,y+.55,z+b*d*.42,.22,.7,.22,0x23252b);
   KT.flame(x+w*.42,y+.9,z+d*.42,1,i0++%2===0);KT.flame(x-w*.42,y+.9,z-d*.42,1,false);KT.flame(x+w*.42,y+.9,z-d*.42,1,false);KT.flame(x-w*.42,y+.9,z+d*.42,1,i0%2===0);
   if(seed%2===0)KT.crownBanner(x+w*.5+.1,y+.4-.1,z,PI/2,1.2,3.2);
   // trees of dead brown wood
   if(!tall)for(let i=0;i<2;i++)bx(x+(i?-1:1)*w*.25,y+1.4,z,.5,2.6,.5,0x4a3426)};
  let i0=0;
  for(let i=0;i<16;i++){const a=i/16*PI*2+.25,r=56+rnd(i,7)*56,w=14+rnd(i,8)*14,d=14+rnd(i,9)*10,y=4+rnd(i,10)*26;island(Math.cos(a)*r,y,Math.sin(a)*r,w,d,i,i%2===0)}
  // two bridges of dark brick with torches span the gap to the nearest islands
  for(const sx of[-1,1]){island(sx*44,2,-34,10,10,31,true);bx(sx*38,1.6,-24,3,.5,17,0x4c3f5c,.55*sx)}
  for(let i=0;i<14;i++){const a=rnd(i,21)*PI*2,r=25+rnd(i,22)*30;glow(Math.cos(a)*r*1.5,8+rnd(i,23)*14,Math.sin(a)*r*1.5,2.4,0xff9a3a)}
 }
});
// ======================================================================================= Wojak Worksite
// A rainy construction site around a big excavation pit. Catwalks run along both sides of the crane, cubicle ruins, forklifts and shipping containers give cover.
// Grid letters: c = concrete, a = asphalt road, d = churned dirt, K = container wall, space = the pit.
function wjCell(c,r){
 if(c<=1&&r<=1)return' ';
 if(c===14||r===14)return'K';
 if(r<=1&&c>=3)return'a';
 if(c*c+r*r<=25)return'd';
 return'c';
}
const WJG=[];for(let r=0;r<15;r++){let s='';for(let c=0;c<15;c++)s+=wjCell(c,r);WJG.push(s)}
const YEL=0xffc928,CRN=0xc8402e;
function wojakArt(txt,sub){return(g,w,h)=>{g.fillStyle='#d9d3bf';g.fillRect(0,0,w,h);g.fillStyle='#c9392b';g.fillRect(0,0,w,h*.12);g.fillRect(0,h*.88,w,h*.12);
 const ink='#17171a',fx=w*.27,fy=h*.5,fr_=h*.34;
 g.fillStyle='#f3e2cf';g.strokeStyle=ink;g.lineWidth=h*.025;g.beginPath();g.moveTo(fx-fr_*.82,fy-fr_*.2);g.quadraticCurveTo(fx-fr_*.85,fy-fr_*1.1,fx,fy-fr_*1.1);g.quadraticCurveTo(fx+fr_*.85,fy-fr_*1.1,fx+fr_*.82,fy-fr_*.2);
  g.quadraticCurveTo(fx+fr_*.78,fy+fr_*.7,fx,fy+fr_*1.1);g.quadraticCurveTo(fx-fr_*.78,fy+fr_*.7,fx-fr_*.82,fy-fr_*.2);g.fill();g.stroke();
 g.lineWidth=h*.02;g.beginPath();g.moveTo(fx-fr_*.55,fy-fr_*.15);g.lineTo(fx-fr_*.15,fy-fr_*.3);g.moveTo(fx+fr_*.55,fy-fr_*.15);g.lineTo(fx+fr_*.15,fy-fr_*.3);g.stroke();
 g.fillStyle=ink;for(const s of[-1,1]){g.beginPath();g.arc(fx+s*fr_*.33,fy-fr_*.02,h*.02,0,PI*2);g.fill()}
 g.lineWidth=h*.015;g.beginPath();g.moveTo(fx,fy-fr_*.05);g.lineTo(fx-fr_*.06,fy+fr_*.22);g.lineTo(fx+fr_*.04,fy+fr_*.22);g.stroke();
 g.beginPath();g.moveTo(fx-fr_*.3,fy+fr_*.62);g.quadraticCurveTo(fx,fy+fr_*.45,fx+fr_*.3,fy+fr_*.62);g.stroke();
 g.fillStyle='#8ac0e8';g.beginPath();g.ellipse(fx-fr_*.33,fy+fr_*.3,h*.018,h*.04,0,0,PI*2);g.fill();
 g.fillStyle=ink;g.textAlign='left';g.textBaseline='middle';g.font='bold '+Math.round(h*.2)+'px '+FONT;g.fillText(txt,w*.5,h*.4);g.font='bold '+Math.round(h*.12)+'px '+FONT;g.fillStyle='#8a2a1e';g.fillText(sub,w*.5,h*.64)}}
// a point on the plan: rot turns a local layout by 90 degrees steps
const loc=(cx,cz,rot)=>(lx,lz)=>[[cx+lx,cz+lz],[cx-lz,cz+lx],[cx-lx,cz-lz],[cx+lz,cz-lx]][rot];
function wjWall(cx,cz,rot,x1,x2,z1,z2,h,c,o){const p=loc(cx,cz,rot),a=p(x1,z1),b=p(x2,z2);wall(Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1]),h,c,o||{studs:false})}
function cubicle(cx,cz,rot){
 const C=0x7e90a8,W=.22;
 wjWall(cx,cz,rot,-1.7,1.7,-1.7,-1.7+W,1.3,C);wjWall(cx,cz,rot,-1.7,-1.7+W,-1.7,1.7,1.3,C);wjWall(cx,cz,rot,1.7-W,1.7,-1.7,1.0,1.3,C);
 if(isDry())return;const p=loc(cx,cz,rot);
 const d=p(0,-1.0);bx(d[0],.55,d[1],rot%2?.9:2.0,1.1,rot%2?2.0:.9,0xb09468);bx(d[0],1.13,d[1],rot%2?.96:2.06,.08,rot%2?2.06:.96,0xcdb584);
 const m=p(.2,-1.2);bx(m[0],1.5,m[1],rot%2?.1:.8,.6,rot%2?.8:.1,0x23252b);bx(m[0],1.5,m[1],rot%2?.06:.7,.5,rot%2?.7:.06,0x3a5a6a,0,'eX');
 const ch=p(.5,.2);bx(ch[0],.45,ch[1],.6,.1,.6,0x2a2c33);bx(ch[0],.25,ch[1],.1,.5,.1,0x1c1d22);
 for(let k=0;k<5;k++){const q=p((rnd(k,cx,1)-.5)*3,(rnd(k,cz,2)-.5)*3);bx(q[0],.02,q[1],.4,.01,.3,0xf4f0e4,rnd(k,cx,cz)*3)}}
function forklift(x,z,ax){const w=ax?3.4:1.8,d=ax?1.8:3.4;col(x-w/2,x+w/2,z-d/2,z+d/2,1.6);if(isDry())return;
 const s=ax?1:0,t=(a,b)=>ax?[a,b]:[b,a];
 const body=t(0,0),b2=t(-.2,0);bx(x+body[0]*0,.7,z,w*(ax?.7:1)-(ax?0:.4),1.0,d*(ax?1:.7)-(ax?.4:0),YEL);
 const cab=t(.6,0);bx(x+(ax?-.5:0),1.65,z+(ax?0:-.5),ax?1.2:1.3,.1,ax?1.3:1.2,0x2a2c33);
 for(const a of[-.55,.55])for(const b of[-.55,.55]){const o=ax?[-.5+a*.5,b*.6]:[b*.6,-.5+a*.5];bx(x+o[0],1.2,z+o[1],.1,.95,.1,0x2a2c33)}
 const mx=ax?x+w/2-.1:x,mz=ax?z:z+d/2-.1;bx(mx,1.4,mz,ax?.16:1.2,2.4,ax?1.2:.16,0x4a4d57);
 for(const o of[-.35,.35])bx(ax?mx+.55:mx+o,.12,ax?mz+o:mz+.55,ax?1.1:.18,.1,ax?.18:1.1,0xb8bcc8);
 for(const o of[-.7,.7])for(const q of[-.55,.55]){const c2=ax?[x+o*w*.3,z+q*d*.55]:[x+q*w*.55,z+o*d*.3];cy(c2[0],.32,c2[1],.32,.34,0x1c1d22)}
 bx(x+(ax?-.9:0),1.9,z+(ax?0:-.9),.3,.2,.3,0xff9a1a,0,'eN');}
function container(x1,x2,z1,z2,c,h,rot){ // any rectangle; ribs on the long faces
 const H=h||2.6;col(x1,x2,z1,z2,H);if(isDry())return;
 const ax=(x2-x1)>=(z2-z1),L=ax?x2-x1:z2-z1,cx=(x1+x2)/2,cz=(z1+z2)/2,t=ax?z2-z1:x2-x1;
 bx(cx,H/2,cz,x2-x1-.04,H-.04,z2-z1-.04,c);bx(cx,.12,cz,x2-x1,.24,z2-z1,shade(c,.6));bx(cx,H-.1,cz,x2-x1,.2,z2-z1,shade(c,.7));
 const n=Math.floor(L/.5);for(let k=0;k<n;k++){const a=-L/2+(k+.5)*L/n;for(const s of[-1,1]){if(ax)bx(cx+a,H/2,cz+s*(t/2+.01),.12,H-.4,.06,shade(c,.82));else bx(cx+s*(t/2+.01),H/2,cz+a,.06,H-.4,.12,shade(c,.82))}}
 bx(cx,H/2,cz,x2-x1+.02,.14,z2-z1+.02,shade(c,.55))}
const CCOL=[0xc8402e,0x2f6aa8,0xd49a2a,0x3d8a4e,0x8a4a2a,0x6a7a8a,0xb8452a,0x23518a];
function jersey(x1,z1,x2,z2){const ax=Math.abs(x2-x1)>=Math.abs(z2-z1);const a=ax?[Math.min(x1,x2),Math.max(x1,x2),z1-.3,z1+.3]:[x1-.3,x1+.3,Math.min(z1,z2),Math.max(z1,z2)];
 col(a[0],a[1],a[2],a[3],.95);if(isDry())return;const L=ax?a[1]-a[0]:a[3]-a[2],n=Math.max(1,Math.round(L/1.5)),cx=(a[0]+a[1])/2,cz=(a[2]+a[3])/2;
 for(let i=0;i<n;i++){const o=-L/2+(i+.5)*L/n,w=L/n-.05;const p=ax?[cx+o,cz]:[cx,cz+o];
  bx(p[0],.3,p[1],ax?w:.6,.6,ax?.6:w,0xcfcfca);bx(p[0],.75,p[1],ax?w:.34,.3,ax?.34:w,0xcfcfca);
  bx(p[0],.52,p[1],ax?w*.5:.62,.1,ax?.62:w*.5,i%2?0xd8402e:0xf2f2ee)}}
function cone(x,z){cy(x,.05,z,.42,.1,0x2a2c33);fr(x,.4,z,.32,.1,.7,0xff7a1a);cy(x,.38,z,.27,.12,0xffffff)}
function flood(x,z){col(x-.3,x+.3,z-.3,z+.3,8.4);if(isDry())return;bx(x,.3,z,1.0,.6,1.0,0x3a3d45);bx(x,4.2,z,.36,8.4,.36,0x5a5f68);
 bx(x,8.4,z,1.8,.9,.4,0x2a2c33);for(const o of[-.6,0,.6])bx(x+o,8.4,z-.2,.5,.6,.06,0xfff4d0,0,'eL');glow(x,8.4,z,5.5,0xfff0c0)}
function wjCatwalk(sz){
 const z1=sz*12-1.2,z2=sz*12+1.2,za=Math.min(z1,z2),zb=Math.max(z1,z2);
 col(-14,14,za,zb,3.0,2.4);
 if(!isDry()){bx(0,2.7,sz*12,28,.6,2.4,0x6a6f78);bx(0,3.0,sz*12,28.02,.06,2.42,0x4a4f58);
  for(let i=0;i<14;i++)bx(-13+i*2,3.04,sz*12,.9,.02,2.2,i%2?0x7a808a:0x6a7078);
  for(const e of[-1,1])bx(0,2.45,sz*12+e*1.2,28,.1,.1,YEL);
  for(const x of[-13.5,-7,0,7,13.5])for(const e of[-1,1]){bx(x,1.2,sz*12+e*1.0,.4,2.4,.4,0x4a4f58)}
  for(const e of[-1,1])rail(-14,sz*12+e*1.12,14,sz*12+e*1.12,YEL,1.0,3.0);
  }
 for(const x of[-13.5,-7,0,7,13.5])for(const e of[-1,1])col(x-.2,x+.2,sz*12+e*1.0-.2,sz*12+e*1.0+.2,2.4);
 // stairs on both ends (the rail closes the side, the deck is open where the stairs arrive)
 for(const sx of[-1,1])stairs(sx*18.8,sz*12,sx>0?1:0,6,2.4,0x8a8f98,.5,.8)}
function wjCrane(){
 const R=0xc8402e;
 for(const a of[-5,5])for(const b of[-5,5]){col(a-.4,a+.4,b-.4,b+.4,9.4);if(!isDry()){bx(a,.3,b,1.3,.6,1.3,0x3a3d45);bx(a,4.7,b,.7,9.4,.7,R);for(let k=0;k<5;k++)bx(a,1+k*1.8,b,.8,.12,.8,shade(R,.75))}}
 if(isDry())return;
 for(const s of[-5,5]){bx(0,9.4,s,10.8,.6,.7,R);bx(s,9.4,0,.7,.6,10.8,R)}
 bx(0,9.4,0,10.8,.6,.7,R);bx(0,9.4,0,.7,.6,10.8,R); // the trolley rails cross over the middle, so the hook block hangs from something
 bx(0,9.8,0,2.6,.5,2.6,0x2a2c33);bx(0,10.2,0,.5,.3,.5,0xff3a2a,0,'eN');
 // hanging slab with chains and rebar
 for(const a of[-1.4,1.4])for(const b of[-1.4,1.4])bx(a,8.0,b,.08,2.8,.08,0x2a2a2a);
 for(const a of[-1.4,1.4])bx(a,9.05,0,.3,.2,3.4,0x2a2a2a); // spreader bars under the rail
 bx(0,6.4,0,4.2,.7,4.2,0x9a9a96);bx(0,6.8,0,4.3,.06,4.3,0xb4b4b0);
 for(let k=0;k<7;k++)bx(-1.8+k*.6,5.8,(rnd(k,3,1)-.5)*3,.07,.9,.07,0x8a5a3a);
 // pit walls: strata, stripes round the lip, a floor with a puddle and glowing work lights
 const wl=[0x6e5a43,0x8a6a45,0x6a6a6e,0x5a4a3a];
 for(let k=0;k<4;k++){const y=-.9-k*1.6;for(const s of[-1,1]){bx(s*3.93,y,0,.14,1.6,8,wl[k]);bx(0,y,s*3.93,8,1.6,.14,wl[k])}}
 bx(0,-7.5,0,8,1,8,0x4a3d30);bx(0,-7.0,0,3.4,.04,3.0,0x2a4a66);
 for(const a of[-3,3])for(const b of[-3,3]){bx(a,-6.5,b,.5,1,.5,0xd49a2a);bx(a,-5.9,b,.4,.2,.4,0xfff0c0,0,'eL')}
 glow(0,-5,0,9,0xffe0a0);
 for(let k=0;k<8;k++){const e=-3.5+k;for(const s of[-1,1]){bx(e,.03,s*4.2,.5,.04,.4,k%2?YEL:0x2a2a2a);bx(s*4.2,.03,e,.4,.04,.5,k%2?YEL:0x2a2a2a)}}
 for(const s of[-1,1]){rail(-4.4,s*4.5,4.4,s*4.5,YEL,.9);rail(s*4.5,-4.4,s*4.5,4.4,YEL,.9)}}
let wjRain=null;
function rainMesh(r,hh,rep,op,spd){
 const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.clearRect(0,0,64,256);
 for(let i=0;i<46;i++){const x=(i*37)%64,y=(i*91)%256,l=24+(i*13)%36;g.fillStyle='rgba(200,225,255,'+(.25+(i%5)*.12)+')';g.fillRect(x,y,1.6,l)}
 const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(rep,1.5);
 const m=new TH.Mesh(new TH.CylinderGeometry(r,r,hh,24,1,true),new TH.MeshBasicMaterial({map:t,transparent:true,opacity:op,depthWrite:false,side:TH.DoubleSide,fog:false}));
 add(m);return{m,t,op,spd}}
MAPS.reg({id:'worksite',name:'Wojak Worksite',tag:'Rainy pit and catwalk fight',theme:'An overtime construction site in the rain: crane over a deep pit, catwalks, cubicle ruins and forklifts.',
 blurb:'Fight across the catwalks, hide in the cubicle ruins and keep out of the pit while the rain and the storm close in.',
 th:['#c8402e','#3d4a62'],
 grid:WJG,
 tiles:{c:{c:0x8d9093,a:0x84878a,v:.08,s:0},a:{c:0x4a4d53,a:0x45484e,v:.05,s:0},d:{c:0x7a6a54,a:0x716149,v:.14,s:0}},
 light:[{t:0,top:0x3a8fe0,mid:0x9ccdf0,bot:0xf6e8c8,fog:0xc4dcee,fn:80,ff:250,sun:0xfff0d0,si:.62,sp:[28,46,20],hs:0xdce8f6,hg:0x6a6a60,hi:.6,disc:0xfff4d8,dsz:30,dop:.8,lamp:0,star:0},
  {t:.55,top:0x4a6ab0,mid:0xf0a880,bot:0xffd090,fog:0xc8a890,fn:60,ff:200,sun:0xffb080,si:.5,sp:[-50,16,-20],hs:0xc0b0c8,hg:0x5a5048,hi:.55,disc:0xffb080,dsz:44,dop:.8,lamp:.6,star:0},
  {t:1,top:0x1a2040,mid:0x5a4a6a,bot:0xd08060,fog:0x4a4258,fn:38,ff:150,sun:0xff9a70,si:.26,sp:[-45,10,-30],hs:0x6a7aa0,hg:0x30323c,hi:.5,disc:0xff9a70,dsz:38,dop:.5,lamp:1,star:0}],
 build(L){
  curbs(c=>0x6a6d70,{h:.18});
  wjCrane();
  wjCatwalk(1);wjCatwalk(-1);
  // perimeter: two-high shipping containers
  col(28,30,-30,30,5.2);col(-30,-28,-30,30,5.2);col(-28,28,28,30,5.2);col(-28,28,-30,-28,5.2);
  if(!isDry()){
   const cc=(k,i)=>CCOL[Math.floor(rnd(k,i,4)*CCOL.length)];
   for(let k=0;k<2;k++)for(let i=0;i<10;i++){const a=-30+i*6;const hh=2.6;
    for(const sx of[-1,1]){const x1=sx>0?28:-30,x2=sx>0?30:-28;
     bx((x1+x2)/2,k*hh+hh/2,a+3,2-.04,hh-.04,6-.04,cc(i+k*10,sx));bx((x1+x2)/2,k*hh+.12,a+3,2,.24,6,0x2a2c33);
     const inner=sx>0?28:-28;for(let q=0;q<12;q++)bx(inner-sx*.0+(-sx*.02),k*hh+hh/2,a+.25+q*.5,.06,hh-.4,.12,shade(cc(i+k*10,sx),.8))}}
   for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=-28+i*6.2222,w=56/9;const hh=2.6;
    for(const sz of[-1,1]){const inner=sz>0?28:-28;
     bx(a+w/2,k*hh+hh/2,sz*29,w-.04,hh-.04,2-.04,cc(i+k*10,sz+5));bx(a+w/2,k*hh+.12,sz*29,w,.24,2,0x2a2c33);
     for(let q=0;q<12;q++)bx(a+.25+q*(w-.5)/11,k*hh+hh/2,inner-sz*.02,.12,hh-.4,.06,shade(cc(i+k*10,sz+5),.8))}}
   // banners on the inner faces
   for(const[x,z,ry,t,s]of[[-27.9,-10,PI/2,'FEELS BAD','MAN'],[27.9,10,-PI/2,'OVERTIME','AGAIN'],[27.9,-16,-PI/2,'SAFETY','FIRST (LAST)'],[-27.9,16,PI/2,'NO RAIN','NO GAIN'],[8,27.9,PI,'WORK','HARD???'],[-8,-27.9,0,'DEADLINE','WAS FRIDAY'],[16,-27.9,0,'FEELS BAD','MAN'],[-16,27.9,PI,'OVERTIME','AGAIN']])sign(x,3.0,z,ry,6.2,3.0,wojakArt(t,s),{pw:512})}
  // cubicle ruins
  cubicle(14.5,5.4,0);cubicle(-14.5,-5.4,2);cubicle(-14.5,5.4,0);cubicle(14.5,-5.4,2);cubicle(7.5,-17.5,1);cubicle(-7.5,17.5,3);cubicle(7.5,17.5,1);cubicle(-7.5,-17.5,3);
  // containers as cover, forklifts, barriers, pallets
  container(5.2,7.6,-26.6,-20.8,0x8a4a2a,2.6);container(-7.6,-5.2,20.8,26.6,0x2f6aa8,2.6);container(20,26,-12.6,-10.2,0xd49a2a,2.6);container(-26,-20,10.2,12.6,0x3d8a4e,2.6);
  forklift(19.5,6.6,true);forklift(-19.5,-6.6,true);forklift(-11,24,false);forklift(11,-24,false);
  jersey(9,0,9,3);jersey(-9,0,-9,-3);jersey(9,-4.4,9,-7.4);jersey(-9,4.4,-9,7.4);jersey(22,-16,26,-16);jersey(-22,16,-26,16);
  for(const sx of[-1,1]){const x=sx*21;crate(x,-3.6*sx,1.6,0xa57c45);crate(x+sx*1.7,-3.6*sx,1.4,0x8f6a3c);crate(x,3.4*sx,1.5,0xa57c45);barrel(sx*26.6,-4.6);barrel(sx*26.6,-3.4);barrel(sx*26.8,4.6)}
  mir((sx,sz)=>{crate(sx*11,sz*20,1.6,0xa57c45);crate(sx*12.8,sz*20.4,1.3,0x8f6a3c);cone(sx*4.4,sz*7.4);cone(sx*7.2,sz*7.6);cone(sx*22.4,sz*2.6);flood(sx*10.4,sz*9);flood(sx*22,sz*17)});
  flood(25,-6.4);flood(-25,6.4);
  // painted road markings
  for(const sx of[-1,1]){for(let k=0;k<4;k++)bx(sx*(11+k*2.6),.03,0,1.3,.04,.22,0xffd02f);bx(sx*22,.03,0,.3,.04,3.6,0xffffff)}
  // rain, a curtain that follows the camera and a thin far one
  if(!isDry()){wjRain=[rainMesh(9,16,6,.5,2.3),rainMesh(20,30,10,.35,1.7)];
   anim((dt,T)=>{const tn=Math.max(0,Math.min(1,(window.STORM?STORM.time():0)/150)),k=Math.max(0,tn*1.35-.35);
    for(const r of wjRain){r.m.position.set(C.position.x,C.position.y-3,C.position.z);r.t.offset.y-=dt*r.spd;r.t.offset.x+=dt*.03;r.m.material.opacity=r.op*k}})}
 },
 env(){
  bank(0,0x4a4c4f,{h:2,hole:30,R:240});
  clouds(18,24,60,170,0x6a727e,7);
  // far cranes and buildings in the haze
  for(let i=0;i<12;i++){const a=i/12*PI*2+.3,r=80+rnd(i,2)*40,x=Math.cos(a)*r,z=Math.sin(a)*r,h=18+rnd(i,3)*30,w=12+rnd(i,4)*10;
   bx(x,h/2-2,z,w,h,w,[0x4a4f5a,0x565b66,0x3f444f][i%3]);for(let k=1;k<h/3.5;k++)if(rnd(i,k,5)<.4)bx(x,k*3.5-1,z+(z>0?-1:1)*(w/2+.02),w*.6,.9,.05,0xffe0a0,0,'eW')}
  for(const[x,z]of[[-70,-60],[78,40],[10,-95]]){bx(x,30,z,1.2,60,1.2,0xc8402e);bx(x+10,58,z,34,1.2,1.2,0xc8402e);bx(x+23,50,z,.12,16,.12,0x2a2a2a);bx(x-4,56.5,z,3,2,2,0x2a2c33)}
 },
 // round 16: the card-art pass: unfinished concrete buildings with scaffolding and yellow tower cranes behind the container wall, a big WORK HARDER hoarding, a bright blue sky
 decor(){
  if(isDry())return;const KT=MAPS.kit;
  for(const[x,z,w,d,f,ry]of[[-50,-48,16,13,7,0],[48,-52,14,14,9,.3],[-62,6,13,16,8,PI/2],[64,-4,15,14,6,-PI/2],[8,-66,18,12,10,0],[-8,64,16,14,8,PI],[50,50,13,15,6,.4],[-48,52,15,12,9,-.3]])KT.buildingFrame(x,z,w,d,f,ry,x+z);
  for(const[x,z,h,ry]of[[-38,-40,40,.6],[40,-42,46,-.5],[-52,24,36,2.2],[54,22,42,1.2],[-20,-56,44,0.1],[22,58,38,3.2],[0,-52,48,PI/2+.4]])KT.towerCrane(x,z,h,ry,{jib:22});
  for(let i=0;i<14;i++){const a=i/14*PI*2+.2,r=125+rnd(i,3)*45,x=Math.cos(a)*r,z=Math.sin(a)*r,w=12+rnd(i,4)*8,h=40+rnd(i,5)*60,c=[0x7d92ae,0x6c84a2,0x8fa3ba,0x768ca8][i%4];
   bx(x,h/2-2,z,w,h,w,c);bx(x,h-1.4,z,w+1,1.2,w+1,shade(c,1.12));for(let k=1;k<h/4.2;k++){for(let q=0;q<4;q++){const aa=q*PI/2,ox=Math.sin(aa)*(w/2+.06),oz=Math.cos(aa)*(w/2+.06);bx(x+ox,k*4.2-1,z+oz,w*.74,1.7,.1,0xcfe8ff,aa,'eW')}}}
  // big hoarding with the worker on top of the container wall
  for(const[x,z,ry]of[[-12,-28.7,0],[12,28.7,PI]]){wall(x-7.4,x+7.4,Math.min(z,z+(ry?.8:-.8)),Math.max(z,z+(ry?.8:-.8)),6.6,0xb9b5a8,{y0:5.2,col:false,studs:true,sc:0xaaa698,band:[2,0xa09c90]});
   sign(x,8.5,z+(ry?-.82:.82),ry,12.6,6.0,wojakArt('WORK','HARDER'),{pw:512});
   for(const sg of[-1,1])KT.wallTorch(x+sg*8,6.3,z+(ry?-.82:.82),ry,{glow:true})}
 }
});
})();
