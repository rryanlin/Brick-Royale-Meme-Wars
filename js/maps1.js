/* Maps, part 1: Crownfall Castle, Doge Docks, Stonks Plaza. Layout sheet: one quarter of the 60 x 60 arena, 2 m per letter, row 0 is the middle line (z = 0..2), column 0 is x = 0..2.
   . = water (blocked, bullets fly over), a space = empty air, any letter listed in `tiles` is floor, K = solid structure that draws its own floor. */
(()=>{
const {bx,cy,fr,ball,stud,studs,col,wall,cren,plain,rtower,stairs,crate,barrel,lamp,brazier,banner,tree,tree0,bush,bench,planter,fence,glow,sign,water,bank,shade,mixc,rnd,lerp,BH,anim}=MAPS.lib;
const PI=Math.PI;
const mir=(f,z)=>{for(const sx of[-1,1]){if(z===false)f(sx,1);else for(const sz of[-1,1])f(sx,sz)}};
// a square tower: four thin brick walls around a dark core, merlons, arrow slits and a stepped pyramid roof
function sqtower(cx,cz,w,h,c,o){o=o||{};col(cx-w/2,cx+w/2,cz-w/2,cz+w/2,h,0);if(MAPS.lib.isDry())return;const t=.7;
 plain(cx-w/2+.1,cx+w/2-.1,cz-w/2+.1,cz+w/2-.1,0,h,shade(c,.55));
 wall(cx-w/2,cx+w/2,cz-w/2,cz-w/2+t,h,c,{col:false});wall(cx-w/2,cx+w/2,cz+w/2-t,cz+w/2,h,c,{col:false});wall(cx-w/2,cx-w/2+t,cz-w/2+t,cz+w/2-t,h,c,{col:false});wall(cx+w/2-t,cx+w/2,cz-w/2+t,cz+w/2-t,h,c,{col:false});
 bx(cx,h+.2,cz,w+.5,.4,w+.5,shade(c,1.06)); // corbel
 for(const[a,b,c2,d]of[[cx-w/2-.25,cx+w/2+.25,cz-w/2-.25,cz-w/2+.3],[cx-w/2-.25,cx+w/2+.25,cz+w/2-.3,cz+w/2+.25],[cx-w/2-.25,cx-w/2+.3,cz-w/2+.3,cz+w/2-.3],[cx+w/2-.3,cx+w/2+.25,cz-w/2+.3,cz+w/2-.3]])cren(a,b,c2,d,h+.4,c,.7);
 const ns=o.slits===undefined?1:o.slits;for(const[dx,dz,ry]of[[0,-1,0],[0,1,0],[-1,0,PI/2],[1,0,PI/2]])for(let k=0;k<ns;k++){const y=h*(.5+.22*k);bx(cx+dx*(w/2+.02),y,cz+dz*(w/2+.02),ry?.14:.34,1.1,ry?.34:.14,0x1a2230);bx(cx+dx*(w/2+.02),y+.62,cz+dz*(w/2+.02),ry?.2:.5,.14,ry?.5:.2,shade(c,1.15))}
 if(o.roof){const k=5,rc=o.roof;let y=h+.4+.7;for(let i=0;i<k;i++){const ww=(w+.5)*(1-i/(k+.4))*1.02;bx(cx,y+i*.62+.31,cz,ww,.6,ww,i%3===2?shade(rc,1.2):rc)}
  y+=k*.62;cy(cx,y+.1,cz,.15,.2,0xffd02f);ball(cx,y+.3,cz,.2,0xffd02f);if(o.flag){bx(cx,y+1.1,cz,.07,1.6,.07,0xcfcfcf);bx(cx+.45,y+1.6,cz,.8,.5,.05,o.flag)}}}
function wtorch(x,y,z,ry){if(MAPS.lib.isDry())return;const s=Math.sin(ry),c=Math.cos(ry);bx(x,y,z,.18+Math.abs(s)*.3,.18,.18+Math.abs(c)*.3,0x23252b);bx(x+s*.3,y+.22,z+c*.3,.26,.22,.26,0x2a2c33);bx(x+s*.3,y+.46,z+c*.3,.22,.3,.22,0xff7a1a,0,'eF');bx(x+s*.3,y+.72,z+c*.3,.12,.24,.12,0xffd45a,0,'eF');glow(x+s*.3,y+.55,z+c*.3,2.4,0xff9a3a)}
const hill=(x,z,w,h,c,sn)=>{const k=Math.max(4,Math.round(h/2.4));for(let i=0;i<k;i++){const f=1-i/(k+.5);bx(x,h*(i+.5)/k,z,w*f,h/k+.05,w*f*(.8+.2*Math.sin(i+x)),i>k-3&&sn?0xeef2f6:shade(c,1+(i%2?.06:-.04)))}};
const GRN=0x2f8a3a;
MAPS.reg({id:'castle',name:'Crownfall Castle',tag:'Medieval fortress showdown',theme:'A symmetrical courtyard with side battlements and tower routes.',
 blurb:'Fight across the courtyard, hold the ramparts and watch the moat: bridges, braziers and a golden sunset.',
 th:['#e7b86b','#2b4fa6'],
 grid:['ppppccccccccwww','ppppccccccccwww','ppppcccccccc...','ppppcccccccc...','cccccccccccc...','cccccccccccc...','cccccccccccc...','ccccc...........','ccccc...........','ccccc...........','ccccc...........','ccccc...........','ww.............','ww.............','ww.............'],
 tiles:{p:{c:0xb4ab94,a:0xa59c86,v:.06},c:{c:0x968e7b,a:0x8b8370,v:.1},w:{c:0x7e522c,a:0x704925,v:.12}},
 fix:(x,z,ch)=>{if(z<-14&&z>=-24&&Math.abs(x)<10)return'K';if(z<-24)return'.';return ch},
 light:[{t:0,top:0x4a7ad8,mid:0xf3b8a0,bot:0xfde0b4,fog:0xe6cdb4,fn:80,ff:230,sun:0xfff0cf,si:.68,sp:[40,34,-26],hs:0xdfe8ff,hg:0x6f7a4a,hi:.5,disc:0xfff3d0,dsz:36,lamp:0,star:0},
  {t:1,top:0x2a2866,mid:0xc1587c,bot:0xfaa05a,fog:0xa07a82,fn:52,ff:170,sun:0xff9a55,si:.5,sp:[58,11,-34],hs:0x9a8fcf,hg:0x4a3a48,hi:.52,disc:0xffa564,dsz:46,lamp:1,star:.12}],
 build(L){const ST=0xa49c88,STD=0x7c7668,BLUE=0x2b4fa6,GOLD=0xffc828,CRM=0xc9c0aa;
  // ---- curtain walls around the bailey (they stand on the edge of the moat)
  const WH=5.4,WT=1.6;
  for(const sx of[-1,1]){const a=sx*24.2,b=sx*25.8,x1=Math.min(a,b),x2=Math.max(a,b);
   wall(x1,x2,9.4,21.8,WH,ST,{cren:true,studs:true,band:[0,STD]});wall(x1,x2,-21.8,-9.4,WH,ST,{cren:true,studs:true,band:[0,STD]});
   // gate: lintel over the bridge with a raised portcullis and a stepped arch
   col(x1-1,x2+1,-5,5,6.2,4.4);wall(x1-1,x2+1,-5,5,1.8,ST,{y0:4.4,col:false,cren:true});
   for(const z of[-1,1]){bx(sx*25,3.9,z*4.5,3.8,1,1,ST);bx(sx*25,3.4,z*4.1,3.8,1,.8,shade(ST,.95))}
   for(let k=-4;k<=4;k++)bx(sx*24.5,3.55,k*.55,.1,1.1,.1,0x2a2c33);bx(sx*24.5,3.05,0,.1,.12,5,0x2a2c33);
   for(const z of[-1,1]){sqtower(sx*25.4,z*7.2,4.6,8.2,ST,{roof:BLUE,flag:BLUE,slits:2});wtorch(sx*22.6,3.0,z*3.6,-sx*PI/2+PI/2);wtorch(sx*22.9,3.0,z*7.2+z*2.4,-sx*PI/2+PI/2)}
   // towers along the wall
   for(const z of[-1,1]){rtower(sx*25,z*25,3.6,11.5,ST,{roof:BLUE,flag:BLUE,sa:.3});banner(sx*23.95,4.6,z*12.5,-sx*PI/2,1.6,3.4,BLUE,GOLD);banner(sx*23.95,4.6,z*19,-sx*PI/2,1.6,3.4,BLUE,GOLD)}
   // bridge outside the gate
   fence(sx*24.6,-3.6,sx*29.8,-3.6,0x7a4e28);fence(sx*24.6,3.6,sx*29.8,3.6,0x7a4e28);
   for(const z of[-1,1]){const px=sx*29.4;col(px-.3,px+.3,z*3.6-.3,z*3.6+.3,1.9);bx(px,.95,z*3.6,.6,1.9,.6,0x5c3a1e);bx(px,2,z*3.6,.7,.15,.7,0x3a3a42);brazier(sx*27.2,z*2.9);}
  }
  // north and south walls
  wall(-21.8,21.8,-25.8,-24.2,WH,ST,{cren:true,studs:true,band:[0,STD]});
  for(const sx of[-1,1]){wall(sx>0?5.0:-21.8,sx>0?21.8:-5.0,24.2,25.8,WH,ST,{cren:true,studs:true,band:[0,STD]})}
  col(-5,5,23.2,26.8,6.2,4.4);wall(-5,5,23.2,26.8,1.8,ST,{y0:4.4,col:false,cren:true});for(let k=-4;k<=4;k++)bx(k*.55,3.55,24.4,.1,1.1,.1,0x2a2c33);
  for(const sx of[-1,1]){sqtower(sx*7.4,25.4,4.6,8.2,ST,{roof:BLUE,flag:BLUE,slits:2});bridgeRails(sx)}
  function bridgeRails(sx){fence(sx*3.6,25.8,sx*3.6,29.8,0x7a4e28)}
  // ---- the keep, north of the courtyard
  col(-10,10,-24,-14,9,0);
  if(!MAPS.lib.isDry()){
   plain(-9.9,9.9,-23.9,-14.1,-1.3,9,shade(ST,.6));
   const fz=-14.05;wall(-10,-2.8,fz-.7,fz,7.6,ST,{col:false,cren:false});wall(2.8,10,fz-.7,fz,7.6,ST,{col:false});wall(-3.2,3.2,fz-.7,fz,2.8,ST,{y0:4.8,col:false});
   for(const[hw,y1]of[[2.6,4.4],[1.9,5.0],[1.1,5.5]]){for(const s of[-1,1])bx(s*(hw+.6),y1-.1,fz-.35,1.2,.62,.7,ST)}
   bx(0,2.3,fz-.5,5.2,4.6,.3,0x2a1a10);bx(0,2.3,fz-.62,5.0,4.4,.2,0xffb347,0,'eL');for(let k=-4;k<=4;k++)bx(k*.55,2.6,fz-.78,.12,4.6,.1,0x2a2c33);for(const y of[1,2.2,3.4,4.5])bx(0,y,fz-.8,5.2,.1,.1,0x2a2c33);
   wall(-9.9,9.9,-14.05-.7,-14.05,.9,STD,{y0:7.6,col:false,cren:false});cren(-10,10,fz-.7,fz,8.5,ST,.8);
   // second tier and the central tower
   wall(-7,7,-21.6,-15.6,3.4,ST,{y0:9,col:false,cren:true,studs:true});plain(-6.9,6.9,-21.5,-15.7,8.9,12.4,shade(ST,.6));
   col(-3.8,3.8,-21,-17,15,9);wall(-3.8,3.8,-21,-17,6.4,ST,{y0:12.4,col:false,cren:true,studs:true});
   for(const s of[-1,1]){bx(s*4.6,6.2,fz-.5,.5,1.4,.12,0x1a2230);bx(s*4.6,6.8,fz-.5,.7,.14,.2,shade(ST,1.15))}
   banner(-6.6,7.4,fz-.85,0,1.9,5.4,BLUE,GOLD);banner(6.6,7.4,fz-.85,0,1.9,5.4,BLUE,GOLD);
   banner(0,16.6,-16.95,0,2.2,5.8,BLUE,GOLD);
   wtorch(-3.9,3.2,fz-.7,0);wtorch(3.9,3.2,fz-.7,0);wtorch(-9.2,3.2,fz-.7,0);wtorch(9.2,3.2,fz-.7,0)}
  for(const sx of[-1,1]){rtower(sx*10.3,-14.8,2.5,11,ST,{roof:BLUE,flag:BLUE,sa:.4});rtower(sx*10.3,-24,2.5,11,ST,{roof:BLUE,flag:BLUE});
   col(sx*3.6-.1,sx*3.6+.1,-16,-14,0)}
  // spire on the tall tower
  if(!MAPS.lib.isDry()){const k=6,rc=BLUE;for(let i=0;i<k;i++){const ww=(8.0)*(1-i/(k+.4));bx(0,15.5+i*.7+.35,-19,ww,.68,ww*.78,i%3===2?shade(rc,1.2):rc)}cy(0,15.5+k*.7+.15,-19,.14,.3,0xffd02f);bx(0,15.5+k*.7+1.2,-19,.07,1.6,.07,0xcfcfcf);bx(.45,15.5+k*.7+1.7,-19,.8,.5,.05,BLUE)}
  stairs(0,-11,3,4,6.4,0xb2aa96,.5,.75); // up to the gate
  for(const sx of[-1,1]){brazier(sx*4.7,-11.5)}
  // ---- ramparts: raised wall-walks with a parapet, reached by stairs from the courtyard
  mir((sx,sz)=>{const x1=sx>0?15:-23,x2=sx>0?23:-15,z1=sz>0?9:-14,z2=sz>0?14:-9;
   wall(x1,x2,z1,z2,2.0,ST,{studs:true,sc:0xc4bca6});
   wall(sx>0?x2-.45:x1,sx>0?x2:x1+.45,z1,z2,1.0,ST,{y0:2,cren:true}); // parapet on the far end
   wall(x1,x2,sz>0?z2-.45:z1,sz>0?z2:z1+.45,1.0,ST,{y0:2,cren:true}); // and along the water side
   stairs(sx>0?x1-3.6:x2+3.6,sz>0?11.5:-11.5,sx>0?0:1,4,3,0xb2aa96,.5,.9); // stairs on the courtyard side climb towards the rampart
  });
  // ---- cover in the courtyard
  mir((sx,sz)=>{crate(sx*14,sz*4.8,1.6);crate(sx*15.7,sz*5.7,1.3,0xa8763f,.3);barrel(sx*12.7,sz*5.9);
   wall(sx>0?3:-7,sx>0?7:-3,sz*5.6-.35,sz*5.6+.35,1.25,ST,{studs:true,cren:false})});
  for(const sz of[-1,1])brazier(0,sz*2.6);
  // courtyard inlay: a gold crest on the pale paving
  if(!MAPS.lib.isDry()){for(const[w,c,y,h]of[[7.4,0xb9ad8e,.012,.03],[5.6,0xcfc6b0,.019,.044]])bx(0,y,0,w,h,w,c);for(const k of[0,1,2,3])bx(Math.cos(k*PI/2)*2.1,.03,Math.sin(k*PI/2)*2.1,1.1,.06,1.1,GOLD);bx(0,.03,0,1.5,.06,1.5,0x2b4fa6)}
  // lily pads in the pools
  if(!MAPS.lib.isDry())mir((sx,sz)=>{for(const[x,z]of[[13,16.5],[17.5,21],[21.5,17],[12.2,22.2],[19.4,15.2]])cy(sx*x,-.4,sz*z,.55,.06,0x3fae4c)});
 },
 env(L){water({});bank(-.2,0x3b8a37,{h:2});
  // far hills of stacked bricks and a pair of far castles
  for(let i=0;i<14;i++){const a=i/14*PI*2+.3,r=118+(i%3)*16;hill(Math.cos(a)*r,Math.sin(a)*r,34+(i%4)*8,16+(i*7%5)*6,i%2?0x7a8a72:0x8a8a7e,i%4===0)}
  for(let i=0;i<26;i++){const a=i/26*PI*2+.1,r=40+(i%3)*8+rnd(i,2)*4;tree0(Math.cos(a)*r,Math.sin(a)*r,1.1+(i%4)*.25)}
  for(const[x,z]of[[-70,-95],[88,-60]]){plain(x-6,x+6,z-6,z+6,0,16,0x8d8e92);for(const dx of[-6,6])for(const dz of[-6,6])plain(x+dx-1.8,x+dx+1.8,z+dz-1.8,z+dz+1.8,0,22,0x8d8e92)}},
 // round 16: the card-art pass: tall green cliffs with waterfalls behind the keep, far fairytale castles with blue spires, ivy and lanterns on the curtain walls, a pink sunset
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  KT.cliff(0,-64,70,24,36,0,3,3);KT.cliff(-52,-50,32,18,26,.6,4,2);KT.cliff(52,-50,32,18,26,-.6,5,2);KT.cliff(-70,10,26,30,24,PI/2,6,2);KT.cliff(70,10,26,30,24,-PI/2,7,2);
  for(const[x,z,s]of[[-34,-84,1],[40,-88,1.2],[0,-96,1.4]]){for(let k=-2;k<=2;k++)KT.spireTower(x+k*7*s,z+(k%2)*3,2.1*s,(14+((k*7)&3)*3)*s,0x9a9aa4,KT.BLUE,{flames:true});bx(x,5*s,z+1,36*s,10*s,5,0x8d8e98);for(let q=0;q<6;q++)bx(x-15*s+q*6*s,10.6*s,z+3.6,2.4,1.4,1,0x9a9aa4)}
  for(const sx of[-1,1]){const ix=sx>0?24.1:-24.1,ry=sx>0?-PI/2:PI/2;
   for(const z of[-17,-8,8,17])KT.vines(ix,5.2,z,ry,2.6,3.6,z+sx*9);
   for(const z of[-14,-6.5,6.5,14,20])KT.lantern(ix+(sx>0?-.3:.3),3.6,z,0xffa84a,{s:1.1,arm:[sx>0?.6:-.6,0]})}
  for(let i=0;i<8;i++){const a=i/8*PI*2+.3,r=150+rnd(i,3)*40;KT.cumulus(Math.cos(a)*r,50+rnd(i,4)*24,Math.sin(a)*r,1.8+rnd(i,5),0xffe6e0)}
 }
});
// ======================================================================================= Doge Docks
const {curbs,rail,clouds,win,door,gable,glass}=MAPS.lib;
const txt=(t,fg,bg,font,o)=>(g,w,h)=>{o=o||{};if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}g.fillStyle=fg;g.font=(font||'bold ')+Math.round(h*(o.k||.62))+'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2+h*.04)};
function dogeStatue(){
 const G=0xffc828,GD=0xe0a400,CR=0xf6e2a8,K=0x2a1a10;
 col(-2.8,2.8,-2.8,2.8,.5);col(-2.3,2.3,-2.3,2.3,1.1);col(-1.7,1.7,-1.7,1.7,2.2);col(-2.8,2.8,-1.9,1.9,12.6,2.2);
 if(MAPS.lib.isDry())return;
 for(const[w,h,y,c]of[[5.6,.5,.25,0xc7bba0],[4.6,.6,.8,0xd8ccb0],[3.4,1.1,1.65,0xe6dcc4]]){bx(0,y,0,w,h,w,c);studs(-w/2+.2,w/2-.2,-w/2+.2,w/2-.2,y+h/2,c)}
 const y=2.2,gm='g';
 MAPS.kit.dogeStatue(0,2.2,0,0,1);
 for(const[a,b,t]of[[0,1.72,'WOW'],[1.72,0,'SUCH DOCK'],[0,-1.72,'MUCH COIN'],[-1.72,0,'VERY BRICK']]){
  sign(a,1.65,b,a?(a>0?PI/2:-PI/2):(b>0?0:PI),2.4,.8,txt(t,'#3b2a14','#ffd957','bold ',{k:.5}),{pw:256})}
 for(const s of[-1,1])for(const t of[-1,1]){const px=s*2.5,pz=t*2.5;bx(px,.7,pz,.4,.4,.4,0x3a3f48);bx(px,.98,pz,.3,.16,.3,0xffe9a0,0,'eL');glow(px,1.2,pz,2.2,0xffe9a0)}}
function stall(x,z,c1,c2,label){
 col(x-1.8,x+1.8,z-.7,z+.7,1.15);if(MAPS.lib.isDry())return;
 bx(x,.55,z,3.5,1.1,1.3,0x9b6a3c);bx(x,1.14,z,3.7,.14,1.5,0xc89a62);studs(x-1.7,x+1.7,z-.6,z+.6,1.2,0xc89a62);
 for(const a of[-1,1])for(const b of[-1,1])bx(x+a*1.75,1.3,z+b*.95,.16,2.6,.16,0xe8e8e8);
 for(let i=0;i<6;i++){const cc=i%2?c1:c2;bx(x-1.67+i*.67,2.78,z,.67,.14,2.1,cc);bx(x-1.67+i*.67,2.62,z-1.02,.67,.2,.14,cc)}
 for(let i=0;i<6;i++)stud(x-1.67+i*.67,2.9,z,i%2?c1:c2);
 bx(x,2.2,z+.92,3.4,.12,.1,0x6b4423);sign(x,1.8,z-.78,0,1.9,.56,txt(label,'#ffffff',null,'bold ',{k:.62}),{pw:256,tr:true});
 for(let i=0;i<3;i++){bx(x-1.1+i*1.1,1.34,z-.15,.7,.22,.5,[0x9fd0ff,0xff9aa0,0xffd28a][i]);bx(x-1.1+i*1.1,1.5,z-.15,.5,.12,.35,[0x7ab8f0,0xf27a82,0xf2b866][i])}
 bx(x-.9,2.1,z-.7,.2,.3,.2,0xffd566,0,'eL');bx(x+.9,2.1,z-.7,.2,.3,.2,0xffd566,0,'eL')}
function crane(x,z,sz){
 col(x-.9,x+.9,z-.9,z+.9,13);if(MAPS.lib.isDry())return;const Y=0xf2b21c,D=0x3a3f48;
 bx(x,.4,z,2.8,.8,2.8,D);for(const a of[-1,1])for(const b of[-1,1])bx(x+a*.78,6.9,z+b*.78,.24,12.2,.24,Y);
 for(let y=1.8;y<12.6;y+=1.9){bx(x,y,z+.78,1.8,.14,.14,Y);bx(x,y,z-.78,1.8,.14,.14,Y);bx(x+.78,y,z,.14,.14,1.8,Y);bx(x-.78,y,z,.14,.14,1.8,Y)}
 bx(x,13.4,z,2.4,1.5,2.4,0xe9e6dc);bx(x,13.5,z+sz*1.22,1.6,.8,.06,0x2d3a4a);bx(x,14.35,z,2.6,.2,2.6,D);
 bx(x,14.7,z+sz*5,.5,.5,16.5,Y);bx(x,15.5,z+sz*5,.14,.14,16.5,D);for(let k=0;k<7;k++)bx(x,15.1,z+sz*(-2.5+k*2.4),.12,.7,.12,Y);
 bx(x,14.5,z-sz*3.6,2,1.3,2,0x6a707a);bx(x,15.3,z-sz*3.6,1.6,.4,1.6,0x555a63);
 bx(x,16.3,z+sz*.2,.3,2.0,.3,Y);bx(x,16.1,z+sz*3.2,.1,.1,6.4,D);
 bx(x,12.6,z+sz*10.5,.06,6,.06,0x2a2a2a);bx(x,9.4,z+sz*10.5,.5,.7,.5,0xd63a3a);bx(x,9.0,z+sz*10.5,.12,.4,.12,0x2a2a2a);
 bx(x,15.0,z+sz*1.4,.2,.2,.2,0xff4a3a,0,'eL')}
function boat(x,z,len,c,ry,sail){ // hull along z unless ry
 if(MAPS.lib.isDry())return;const hl=len,y0=-.5;
 const f=(dx,dy,dz,w,h,d,cc,mt)=>{const s=Math.sin(ry||0),co=Math.cos(ry||0);bx(x+dx*co+dz*s,y0+dy,z-dx*s+dz*co,w,h,d,cc,ry||0,mt)};
 f(0,.35,0,hl*.34,.7,hl,shade(c,.9));f(0,.8,0,hl*.34+.3,.16,hl*1.02,0xf4efe0);f(0,.1,0,hl*.3,.3,hl*.9,0x2b2f3a);f(0,.3,hl*.56,hl*.2,.6,hl*.18,shade(c,.9));f(0,.3,-hl*.5,hl*.3,.6,.4,shade(c,.9));
 f(0,1.4,-hl*.12,hl*.24,1,hl*.3,0xf4efe0);f(0,2.0,-hl*.12,hl*.28,.16,hl*.34,c);f(0,1.45,-hl*.12+hl*.16,hl*.16,.4,.06,0x2d3a4a);
 if(sail){f(0,3.5,hl*.1,.14,5.6,.14,0xcfcfcf);f(0,3.8,hl*.1-.4,.08,4.2,1.8,0xffffff);f(0,3.2,hl*.1-.6,.1,3,1.2,c)}
 else{f(0,2.0,-hl*.14,.12,1.3,.12,0xcfcfcf);f(.2,2.6,-hl*.14,.7,.45,.05,0xffc828)}}
function warehouse(sx,sz){
 const x1=sx>0?22:-30,x2=sx>0?30:-22,z1=sz>0?6:-12,z2=sz>0?12:-6,ST=0xe8dcc0,H=4.6,RC=0x2f6fd0;
 col(x1,x2,z1,z2,H+2.2);if(MAPS.lib.isDry())return;
 plain(x1+.1,x2-.1,z1+.1,z2-.1,0,H,shade(ST,.6));
 wall(x1,x2,z1,z1+.5,H,ST,{col:false,studs:false,band:[0,0xb8aa88]});wall(x1,x2,z2-.5,z2,H,ST,{col:false,band:[0,0xb8aa88]});wall(x1,x1+.5,z1+.5,z2-.5,H,ST,{col:false,band:[0,0xb8aa88]});wall(x2-.5,x2,z1+.5,z2-.5,H,ST,{col:false,band:[0,0xb8aa88]});
 const fz=sz>0?z1:z2,fx=sx>0?x1:x2,nz=sz>0?-1:1,nx=sx>0?-1:1;
 gable((x1+x2)/2,(z1+z2)/2,x2-x1,z2-z1,H,RC,true,.45);
 for(let i=0;i<3;i++)win((x1+x2)/2-2.6+i*2.6,2.7,fz+nz*.06,true,1.2,1.3);
 door(fx+nx*.05,(z1+z2)/2,false,2.6,3.2,0x5a7bb0,0xf2efe6);
 sign(fx+nx*.2,4.1,(z1+z2)/2,sx>0?-PI/2:PI/2,3.2,.7,txt('DOGE DOCKS','#ffffff','#2f6fd0','bold ',{k:.5}),{pw:256});
 for(const k of[0,1])bx(fx+nx*.1,3.1,z1+1.2+k*(z2-z1-2.4),.06,.5,.5,0xffe9a0,0,'eW');
 // crates and barrels against the walls
 crate(fx+nx*1.2,z1+1.1+(sz>0?0:z2-z1-2.2),1.4);barrel(fx+nx*1.0,z2-1-(sz>0?0:z2-z1-2));
 bx((x1+x2)/2+sx*1.2,H+1.9,(z1+z2)/2,.9,1.6,.9,0xb8aa88);}
function container(x,z,ax,c,lvl){ // ax: long side along x
 const w=ax?4.8:2.2,d=ax?2.2:4.8,h=2.2;col(x-w/2,x+w/2,z-d/2,z+d/2,h*(lvl||1));if(MAPS.lib.isDry())return;
 for(let l=0;l<(lvl||1);l++){const cc=Array.isArray(c)?c[l%c.length]:c,y=h/2+l*h;bx(x,y,z,w-.03,h-.04,d-.03,cc);
  const n=ax?9:9;for(let i=0;i<n;i++){const a=-(ax?w:d)/2+.3+i*((ax?w:d)-.6)/(n-1);if(ax){bx(x+a,y,z+d/2,.1,h-.1,.06,shade(cc,.8));bx(x+a,y,z-d/2,.1,h-.1,.06,shade(cc,.8))}else{bx(x+w/2,y,z+a,.06,h-.1,.1,shade(cc,.8));bx(x-w/2,y,z+a,.06,h-.1,.1,shade(cc,.8))}}
  bx(x,y+h/2,z,w+.04,.08,d+.04,shade(cc,.7));if(l===0)bx(x,.06,z,w+.04,.12,d+.04,shade(cc,.7));studs(x-w/2+.2,x+w/2-.2,z-d/2+.2,z+d/2-.2,y+h/2,cc,1.2)}}
function lighthouse(x,z){
 col(x-2,x+2,z-2,z+2,18);if(MAPS.lib.isDry())return;
 bx(x,.5,z,5.2,1,5.2,0xb9b19c);const n=10;
 for(let k=0;k<n;k++){const r0=2.1-k*.08,cc=k%2?0xf4f1ea:0xd63a3a;cy(x,1+.95*k+.5,z,r0,.95,cc)}
 cy(x,1+.95*n+.15,z,2.1,.3,0x3a3f48);cy(x,1+.95*n+.4,z,2.3,.25,0x55606e);
 for(let i=0;i<12;i++){const a=i/12*PI*2;bx(x+Math.sin(a)*2.3,1+.95*n+1.0,z+Math.cos(a)*2.3,.2,.9,.2,0xf4f1ea,a)}
 cy(x,1+.95*n+1.3,z,1.1,1.5,0xfff0b0,'eL');cy(x,1+.95*n+2.25,z,1.35,.3,0x3a3f48);
 const t=1+.95*n+2.4;for(let i=0;i<4;i++)fr(x,t+.35+i*.5,z,1.3-i*.3,1.3-i*.3-.3,.5,0xd63a3a);ball(x,t+2.4,z,.22,0xffd02f);glow(x,1+.95*n+1.4,z,9,0xffe9a0);
 door(x+.2,z-2.0,true,1.2,2.0,0x6b4423,0xf2efe6);
 const beam=new THREE.Mesh(new THREE.PlaneGeometry(46,3.4),new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
 beam.rotation.x=-PI/2;beam.position.set(x,1+.95*n+1.3,z);const g=new THREE.Group();g.position.set(x,1+.95*n+1.3,z);beam.position.set(23,0,0);g.add(beam);MAPS.lib.add(g);
 MAPS.lib.anim((dt,T)=>{g.rotation.y=T*.9;beam.material.opacity=.5*((MAPS.lightKey()||{}).lamp||0)})}
const woodC=c=>c==='p'?0xb8aa88:c==='s'?0x8a9096:0x8c5f33;
MAPS.reg({id:'docks',name:'Doge Docks',tag:'Playful harbor brawl',theme:'A sunny harbor with a golden Doge statue, canals, cranes and boats.',
 blurb:'Loop the docks, cross the canal bridges and duel round the golden Doge. Such cover, much wow.',
 th:['#dcd0b0','#2a78c8'],
 grid:['ppppppddbbsssss','ppppppddbbsssss','ppppppdd..sssss','ppppppdd..sKKKK','ppppppdd..sKKKK','ppppppdd..sKKKK','ddddddddbbsssss','ddddddddbbsssss','bb........sssss','bb........sssss','ddddddddddsssss','dd..dd..ddsssss','dd..dd..ddsssss','dd..dd..ddsssKK','dd..dd..ddsssKK'],
 tiles:{p:{c:0xad9f7c,a:0xa09271,v:.05},d:{c:0x8c5f33,a:0x7e542c,v:.12,s:1},s:{c:0x8a9096,a:0x7e848a,v:.07},b:{c:0x7a502a,a:0x6e4724,v:.12,s:1}},
 fix:(x,z,ch)=>{const ax=Math.abs(x),az=Math.abs(z);if(ax>=26&&az>=26)return x*z>0?'K':'s';if(ax>=22&&az>=6&&az<12)return'K';return ch},
 light:[{t:0,top:0x3b8be0,mid:0xa9d8f4,bot:0xfdf3d8,fog:0xcfe6f2,fn:85,ff:240,sun:0xfff6dc,si:.58,sp:[38,52,22],hs:0xe3edff,hg:0x7a8a60,hi:.5,disc:0xfff4cf,dsz:34,lamp:0,star:0},
  {t:1,top:0x383a86,mid:0xe56f8c,bot:0xffb166,fog:0xc88a82,fn:55,ff:190,sun:0xff9a55,si:.52,sp:[-62,12,24],hs:0xa89acf,hg:0x5a4a50,hi:.55,disc:0xffa564,dsz:50,lamp:1,star:.1}],
 build(L){
  curbs(woodC,{h:.2});
  // ---- plaza: a rug of rings around the golden statue, studs on the paving
  if(!MAPS.lib.isDry()){for(const[w,c,y]of[[21,0x8ea3bb,.012],[17,0xb8ae92,.02],[13,0x6c93b8,.028],[9.6,0xbcb296,.036]])bx(0,y,0,w,.03,w,c);
   for(let k=0;k<4;k++){const a=k*PI/2;for(const r of[7.2]){bx(Math.cos(a)*r,.05,Math.sin(a)*r,1.4,.05,1.4,0xffc828)}}
   for(let i=-5;i<=5;i++)for(const s of[-1,1]){bx(i*1.8,.045,s*10.2,.7,.04,.7,i%2?0x5aa6e8:0xffffff)}}
  dogeStatue();
  // ---- market stalls and planters on the plaza
  mir((sx,sz)=>{stall(sx*9.5,sz*6,sx*sz>0?0xe34a4a:0x2f6fd0,0xffffff,sx>0?'SUCH FISH':'VERY CRAB');planter(sx*5.5,sz*10.2,3.2,1.2,0xe9e2cf,{leaf:0x2f9a3c});
   lamp(sx*11,sz*11,3.6);lamp(sx*15.5,sz*8.2,3.6);
   bench(sx*8.6,sz*2.0,true);crate(sx*10.8,sz*3.2,1.2);barrel(sx*11.7,sz*2.4)});
  // ---- cranes, boats and bollards
  mir((sx,sz)=>{crane(sx*10,sz*23.6,sz);boat(sx*6,sz*26,5.6,0xd63a3a,0);boat(sx*14,sz*26,5.4,0x2f6fd0,0,true);boat(sx*14,sz*18,4,0xffc828,PI/2);boat(sx*8,sz*18,3.8,0x2f9a3c,PI/2+.2);
   container(sx*24.5,sz*18,true,[0xd63a3a,0x2f6fd0],2);container(sx*27,sz*22.2,true,[0xffc828],1);container(sx*23.5,sz*26,false,[0x2f9a3c,0xd63a3a],1);if(sx*sz<0){container(sx*27.2,sz*27.4,true,[0x2f6fd0,0xffc828,0xd63a3a],3);crate(sx*25,sz*25,1.4);barrel(sx*26.4,sz*24.8)}
   warehouse(sx,sz);
   for(const[x,z]of[[15.6,5],[15.6,8.5],[15.6,11],[6,15.6],[10,15.6],[13.5,15.6],[6,20.4],[10,20.4],[14.5,20.4]]){const bx_=sx*x,bz=sz*z;col(bx_-.3,bx_+.3,bz-.3,bz+.3,.7);cy(bx_,.35,bz,.3,.7,0x2b2f3a);cy(bx_,.72,bz,.36,.1,0xffc828)}
   lamp(sx*18,sz*14,3.6);lamp(sx*5,sz*21,3.6);lamp(sx*27,sz*3,3.6);
   // bridges: rails along the sides
   rail(sx*16,sz*4,sx*20,sz*4,0xf2f2f2);rail(sx*16,sz*12,sx*20,sz*12,0xf2f2f2);rail(sx*16,sz*16,sx*20,sz*16,0xf2f2f2);rail(sx*4,sz*16,sx*4,sz*20,0xf2f2f2);
   tree(sx*28,sz*14,1);tree(sx*23.5,sz*14.6,.8);bush(sx*28.6,sz*16.8,1.2,0x2f9a3c)});
  lighthouse(27.5,27.5);lighthouse(-27.5,-27.5);
 },
 env(L){water({size:420,c1:'#2a7fd0',c2:'#9fdcff',op:.9});bank(-.2,0xbfab7e,{h:2,hole:31,R:70});
  for(let i=0;i<16;i++){const a=i/16*PI*2+.2,r=150+(i%3)*18;hill(Math.cos(a)*r,Math.sin(a)*r,38+(i%4)*8,12+(i*5%4)*7,i%2?0x5d9a62:0x7d8d6e,false)}
  clouds(14,52,90,180,0xffffff,3);
  for(let i=0;i<5;i++){const a=i*1.3+.4,r=96+i*9,x=Math.cos(a)*r,z=Math.sin(a)*r;bx(x,-.2,z,6,1.2,2,0xf4efe0);bx(x,3,z,.12,6.5,.12,0xcfcfcf);bx(x,3,z+.4,.08,5,2.4,0xffffff)}
 },
 // round 16: the card-art pass: torches along the quays, crown banners on the warehouses and round the Doge, snowy peaks behind
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  KT.edgeTorches(.2,.2,31,{max:42});
  for(const sx of[-1,1])for(const sz of[-1,1]){const zc=(sz>0?9:-9),fx=sx>0?21.8:-21.8,ry=sx>0?-PI/2:PI/2;
   for(const d of[-1.9,1.9])KT.crownBanner(fx,4.3,zc+d,ry,1.1,2.2);
   KT.bannerPole(sx*5.4,sz*5.4,5.2,Math.atan2(-sx,-sz),{h:2.6});
   KT.lantern(sx*20.4,3.2,sz*9,0xffb04a,{s:1,pole:[sx*.5,0]})}
  for(let i=0;i<9;i++){const a=i/9*PI*2+.6,r=205+rnd(i,3)*30;KT.peak(Math.cos(a)*r,Math.sin(a)*r,60+rnd(i,4)*30,48+rnd(i,5)*34,0x7e8fa4,{snow:0xf4f8ff,y0:-6})}
 }
});
// ======================================================================================= Stonks Plaza
function bull(){
 const G=0xffc828,GD=0xdf9f00,CR=0xf6e8c0,K=0x2a1a10,y=2.0,gm='g';
 col(-5,5,-5,5,.8);col(-1.6,1.6,-1.6,1.6,5.8);if(MAPS.lib.isDry())return;
 // fountain basin
 for(const[a,b,w,d]of[[0,-4.8,10,.4],[0,4.8,10,.4],[-4.8,0,.4,9.2],[4.8,0,.4,9.2]]){bx(a,.4,b,w,.8,d,0xd9dde2);}
 bx(0,.82,-4.8,10.2,.1,.6,0xeceff2);bx(0,.82,4.8,10.2,.1,.6,0xeceff2);bx(-4.8,.82,0,.6,.1,9.2,0xeceff2);bx(4.8,.82,0,.6,.1,9.2,0xeceff2);
 for(let i=-4;i<=4;i++){stud(i*1.1,.92,-4.8,0xeceff2);stud(i*1.1,.92,4.8,0xeceff2)}for(let i=-3;i<=3;i++){stud(-4.8,.92,i*1.2,0xeceff2);stud(4.8,.92,i*1.2,0xeceff2)}
 bx(0,.5,0,9.2,.14,9.2,0x3f9fe0,0,'t82');bx(0,.2,0,9.2,.1,9.2,0x24608f);
 for(const s of[-1,1])for(const t of[-1,1]){bx(s*3.4,1.0,t*3.4,.8,.6,.8,0xd9dde2);bx(s*3.4,1.7,t*3.4,.22,1.0,.22,0xcfeaff,0,'t60');bx(s*3.4,2.3,t*3.4,.5,.2,.5,0xcfeaff,0,'t60');bx(s*3.4,1.1,t*3.4,.9,.08,.9,0x39ff88,0,'eN')}
 // pedestal
 bx(0,.95,0,3.4,2.1,3.4,0xe6e9ec);bx(0,1.95,0,3.8,.2,3.8,0xc9ccd2);studs(-1.7,1.7,-1.7,1.7,2.05,0xe6e9ec,1.1);
 for(const[a,b,r,t]of[[0,1.72,0,'BUY'],[1.72,0,PI/2,'HODL'],[0,-1.72,PI,'WAGMI'],[-1.72,0,-PI/2,'TO THE MOON']])sign(a,1.2,b,r,2.6,.8,txt(t,'#0b3d1f','#7ee08f','bold ',{k:.55}),{pw:256});
 // the bull, charging towards +x
 bx(0,y+1.7,0,3.4,1.6,1.7,G,0,gm);bx(.8,y+2.45,0,1.5,.9,1.5,G,0,gm);bx(-1.2,y+1.6,0,1.1,1.5,1.6,G,0,gm);bx(.1,y+1.05,0,3,.2,1.3,GD,0,gm);
 for(const s of[-1,1]){bx(1.15,y+.65,s*.55,.5,1.3,.5,G,0,gm);bx(1.15,y+.08,s*.55,.6,.16,.7,K);bx(-1.35,y+.6,s*.55,.5,1.2,.5,G,0,gm);bx(-1.45,y+.08,s*.55,.6,.16,.7,K);
  bx(2.0,y+2.8,s*.62,.28,.28,.5,CR);bx(2.0,y+3.15,s*.92,.28,.55,.28,CR);bx(2.45,y+2.28,s*.35,.14,.18,.12,K)}
 bx(1.95,y+2.1,0,1.1,1.15,1.2,G,0,gm);bx(2.65,y+1.8,0,.75,.75,.95,GD,0,gm);bx(2.95,y+1.8,0,.12,.28,.5,0xe87c7c);
 bx(-1.9,y+2.1,0,.2,1.3,.2,G,0,gm);bx(-1.9,y+1.35,0,.4,.4,.4,GD,0,gm);
 for(const s of[-1,1])for(const t of[-1,1]){bx(s*2.7,.05,t*2.7,.5,.1,.5,0x39ff88,0,'eN');glow(s*2.7,.4,t*2.7,2,0x39ff88)}}
function stonkTower(cx,cz,y0){
 const GL=0x9fd8ff,WH=0xeef1f4,GR=0x39ff88;
 col(cx-2.6,cx+2.6,cz-2.6,cz+2.6,y0+26);if(MAPS.lib.isDry())return;
 let y=y0;
 for(const[w,h,c]of[[5.2,8.6,0xd5dae0],[4.4,8.6,0xdfe3e8],[3.5,7.4,0xe9ecef]]){
  plain(cx-w/2,cx+w/2,cz-w/2,cz+w/2,y,y+h,shade(0x2b4a6a,1));
  const nf=Math.round(h/3.1),fh=h/nf;
  for(let f=0;f<nf;f++){const yy=y+f*fh+fh*.5;
   for(const[dx,dz,ax]of[[0,-1,true],[0,1,true],[-1,0,false],[1,0,false]]){const px=cx+dx*(w/2+.02),pz=cz+dz*(w/2+.02);
    if(ax){bx(px,yy,pz,w-.5,fh*.62,.12,GL,0,'eW');bx(px,y+f*fh+.15,pz,w+.1,.3,.2,c)}else{bx(px,yy,pz,.12,fh*.62,w-.5,GL,0,'eW');bx(px,y+f*fh+.15,pz,.2,.3,w+.1,c)}}}
  for(const a of[-1,1])for(const b of[-1,1])bx(cx+a*(w/2),y+h/2,cz+b*(w/2),.34,h,.34,WH);
  for(let k=-1;k<=1;k+=2)for(const m of[-.3,.3]){bx(cx+m*w,y+h/2,cz+k*(w/2+.03),.12,h,.12,WH);bx(cx+k*(w/2+.03),y+h/2,cz+m*w,.12,h,.12,WH)}
  bx(cx,y+h+.15,cz,w+.5,.3,w+.5,WH);bx(cx,y+h+.05,cz,w+.3,.08,w+.3,GR,0,'eN');studs(cx-w/2,cx+w/2,cz-w/2,cz+w/2,y+h+.3,WH,1.1);
  y+=h+.3}
 cy(cx,y+1.4,cz,.12,2.8,0xcfcfcf);cy(cx,y+2.9,cz,.2,.2,0xff3b30,'eL');glow(cx,y+2.9,cz,3,0xff5040);bx(cx,y+.5,cz,1.4,1,1.4,0x8a9099);}
function rooftopPlanter(x,y,z,w,d){col(x-w/2,x+w/2,z-d/2,z+d/2,y+.8,y);if(MAPS.lib.isDry())return;bx(x,y+.35,z,w,.7,d,0xcfd4da);bx(x,y+.78,z,w-.3,.12,d-.3,0x5a3d22);for(let i=0;i<Math.round(w*d/2.2);i++)bx(x+(rnd(x,z,i)-.5)*(w-.9),y+1.1,z+(rnd(z,x,i)-.5)*(d-.9),.7,.6,.7,0x3dae52)}
function podium(sx,sz){
 const H=3.6,W=0xdfe3e8,X=a=>sx*a,Z=b=>sz*b,R=(a1,a2,b1,b2)=>[Math.min(X(a1),X(a2)),Math.max(X(a1),X(a2)),Math.min(Z(b1),Z(b2)),Math.max(Z(b1),Z(b2))],lib=MAPS.lib;
 const[x1,x2,z1,z2]=R(16,28,8,20);col(x1,x2,z1,z2,H);if(lib.isDry())return;
 wall(x1,x2,z1,z2,H,W,{studs:true,col:false,band:[0,0x2fae5a],sc:0xd2d6dc});
 const par=(a1,a2,b1,b2)=>{const[a,b,c,d]=R(a1,a2,b1,b2);wall(a,b,c,d,1.0,0xcfd4da,{y0:H,col:false,studs:true});col(a,b,c,d,H+1.1,H);
  const L=Math.max(b-a,d-c),n=Math.max(1,Math.round(L/1.2)),l=L/n;for(let q=0;q<n;q++){const t=(q+.5)*l;if(b-a>d-c)bx(a+t,H+1.55,(c+d)/2,l*.8,.9,.08,0xbfe6ff,0,'t35');else bx((a+b)/2,H+1.55,c+t,.08,.9,l*.8,0xbfe6ff,0,'t35')}};
 par(16,16.4,8,12.25);par(16,16.4,15.75,20);par(27.6,28,8,20);par(16.4,23,8,8.4);par(27,27.6,8,8.4);par(16.4,20.25,19.6,20);par(23.75,27.6,19.6,20);
 // entrance with a glass door on the avenue face
 const ex=X(19.6),ez=Z(8)-sz*.06;bx(ex,1.4,ez,3,2.8,.12,0xbfe6ff,0,'eW');bx(ex,2.95,ez,3.5,.3,.3,0xeef1f4);bx(ex-X(1.7)+X(0),1.4,ez,.2,2.9,.3,0xeef1f4);bx(ex+X(1.7),1.4,ez,.2,2.9,.3,0xeef1f4);bx(ex,1.4,ez,.1,2.8,.2,0xeef1f4);
 sign(ex,3.28,ez-sz*.1,sz>0?PI:0,2.8,.5,txt('STONKS BANK','#ffffff','#1f8a4a','bold ',{k:.55}),{pw:256});bx(ex,3.0,ez-sz*.2,3.2,.06,.1,0x39ff88,0,'eN');
 for(const a of[22.9,25.6])win(X(a),2.2,Z(8)-sz*.06,true,1.3,1.4,0xffe6a0);
 for(const a of[17.4,25.4])win(X(a),2.2,Z(20)+sz*.06,true,1.3,1.4,0xffe6a0);
 for(const b of[10.4,13,15.6,18.2])win(X(28)+sx*.06,2.2,Z(b),false,1.3,1.4,0xffe6a0);
 bx(X(22),H+.04,Z(8)-sz*.04,12.2,.08,.1,0x39ff88,0,'eN');
 for(const[a,b]of[[17.2,9.7],[17.2,18.3],[26.6,9.7],[26.6,18.3]])rooftopPlanter(X(a),H,Z(b),1.3,2.4);
 stonkTower(X(22),Z(14),H);ticker(X(19.3),H+3.1,Z(14),sx>0?-PI/2:PI/2,4.4,1.5,(sx>0?1:3)+(sz>0?0:1))}
function skybridge(sx){
 const x1=sx>0?23:-27,x2=sx>0?27:-23,cx=(x1+x2)/2;
 col(x1,x2,-8,8,3.6,3.0);col(x1,x1+.3,-8,8,4.7,3.6);col(x2-.3,x2,-8,8,4.7,3.6);
 if(MAPS.lib.isDry())return;
 bx(cx,3.3,0,4,.6,16,0xc7ccd3);bx(cx,2.96,0,3.6,.08,15.4,0x39ff88,0,'eN');studs(x1+.3,x2-.3,-7.8,7.8,3.6,0xc7ccd3,1);
 for(const e of[x1,x2]){bx(e+(e===x1?.05:-.05),4.65,0,.1,2.1,16,0xbfe6ff,0,'t35')}
 for(let z=-8;z<=8;z+=2){for(const e of[x1,x2])bx(e+(e===x1?.05:-.05),4.65,z,.16,2.2,.16,0xeef1f4);bx(cx,5.76,z,4.1,.2,.16,0xeef1f4);}
 bx(cx,5.74,0,3.8,.08,16,0xbfe6ff,0,'t35');bx(cx,3.64,0,.1,.04,16,0x39ff88,0,'eN');
 for(const z of[-1,1])bx(cx,3.25,z*7.62,4.4,.9,.86,0xdfe3e8)}
function ticker(x,y,z,ry,w,h,seed){
 if(MAPS.lib.isDry())return;
 const c=document.createElement('canvas');c.width=512;c.height=128;h=w*128/512;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,fog:false,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;MAPS.lib.add(m);
 const syms=[['$BRICK',420.69,1],['DOGE',.69,1],['PEPE',1.337,0],['WOJK',8.5,0],['STNK',69.0,1],['GIGA',999,1],['NYAN',7.77,1],['TROLL',4.2,0],['BONK',.0042,1]];
 let off=seed*40,last=-1;
 const draw=T=>{g.fillStyle='#07120c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#0f2a1b';g.fillRect(0,0,c.width,6);g.fillRect(0,c.height-6,c.width,6);
  g.font='bold '+Math.round(c.height*.5)+'px "Courier New",monospace';g.textBaseline='middle';
  const cw=g.measureText('W').width*10.2;let o=-((T*60+off)%cw);
  for(let k=0;k<6;k++){const s=syms[(k+seed)%syms.length],px=o+k*cw,up=s[2]?1:0,v=(s[1]*(1+Math.sin(T*.7+k*2.3+seed)*.02)).toFixed(s[1]<1?4:2);
   g.fillStyle='#e8f6ec';g.fillText(s[0],px+6,c.height*.54);g.fillStyle=up?'#39ff88':'#ff4d5e';g.fillText((up?'▲':'▼')+v,px+cw*.42,c.height*.54)}
  t.needsUpdate=true};
 draw(0);MAPS.lib.anim((dt,T)=>{const f=Math.floor(T*10);if(f!==last){last=f;draw(T)}})}
function kiosk(x,z,c){
 col(x-1.3,x+1.3,z-1.3,z+1.3,3.0);if(MAPS.lib.isDry())return;
 bx(x,.55,z,2.6,1.1,2.6,0xdfe3e8);bx(x,1.15,z,2.8,.14,2.8,0xb9bfc7);studs(x-1.3,x+1.3,z-1.3,z+1.3,1.22,0xb9bfc7,1.2);
 for(const a of[-1,1])for(const b of[-1,1])bx(x+a*1.25,2.2,z+b*1.25,.14,2.1,.14,0xeef1f4);
 for(const a of[-1,1]){bx(x+a*1.25,2.2,z,.08,1.7,2.4,0xbfe6ff,0,'t40');bx(x,2.2,z+a*1.25,2.4,1.7,.08,0xbfe6ff,0,'t40')}
 bx(x,3.3,z,3.2,.22,3.2,c);bx(x,3.5,z,2.6,.18,2.6,shade(c,1.15));studs(x-1.2,x+1.2,z-1.2,z+1.2,3.6,c,1.2);bx(x,3.2,z,3.3,.06,3.3,0x39ff88,0,'eN');
 for(let i=0;i<3;i++)bx(x-.7+i*.7,1.5,z,.4,.5,.4,[0xffc828,0x39ff88,0xff6b6b][i]);
 sign(x,2.0,z+1.32,0,1.8,.4,txt('$STONKS','#0b3d1f','#7ee08f','bold ',{k:.62}),{pw:256});}
function heli(x,z,c,ry){
 const s=Math.sin(ry),co=Math.cos(ry);col(x-1.7,x+1.7,z-1.7,z+1.7,2.4);if(MAPS.lib.isDry())return;
 const f=(dx,dy,dz,w,h,d,cc,mt)=>bx(x+dx*co+dz*s,dy,z-dx*s+dz*co,w,h,d,cc,ry,mt);
 f(0,1.3,0,1.9,1.5,3.2,c);f(0,1.6,1.8,1.5,1.0,.9,0xbfe6ff,'t50'.length?'t55':0);f(0,1.2,-2.6,.6,.7,2.6,c);f(0,1.9,-3.7,.2,1.2,.9,c);f(0,2.2,0,.3,.6,.3,0x3a3f48);
 f(0,2.55,0,7,.1,.35,0x2a2a2a);f(0,2.55,0,.35,.1,7,0x2a2a2a);for(const a of[-1,1]){f(a*1.2,.2,0,.15,.15,3.4,0x2a2a2a);f(a*1.2,.6,.9,.1,.8,.1,0x2a2a2a);f(a*1.2,.6,-.9,.1,.8,.1,0x2a2a2a)}
 f(0,1.6,1.82,.2,.2,.1,0xff3b30,'eL');}
function helipad(x,z,r){
 if(MAPS.lib.isDry())return;
 cy(x,.03,z,6,.06,0x4d5058);cy(x,.07,z,5.3,.04,0xe8eaee);cy(x,.09,z,5.0,.04,0x4d5058);
 for(const[a,b,w,d]of[[-1.2,0,.5,3.6],[1.2,0,.5,3.6],[0,0,2.4,.5]])bx(x+a,.12,z+b,w,.04,d,0xffd02f);
 for(let i=0;i<12;i++){const a=i/12*PI*2;bx(x+Math.cos(a)*5.65,.12,z+Math.sin(a)*5.65,.34,.14,.34,0x39ff88,0,'eN')}}
const asph=c=>c==='a'?0x3a3e46:c==='p'?0x9ea3a9:c==='g'?0x3f8a38:c==='h'?0x474a52:0x8a8f96;
function skyline(){
 const pal=[0x6f8aa8,0x8a9db4,0x5c7690,0x9aa7b5,0x7b8f9e,0x4f6b86];
 for(let i=0;i<30;i++){const a=i/30*PI*2+rnd(i,1)*.15,r=82+rnd(i,2)*48,x=Math.cos(a)*r,z=Math.sin(a)*r,w=11+rnd(i,3)*9,h=34+rnd(i,4)*60,c=pal[i%pal.length],ry=a;
  bx(x,h/2,z,w,h,w,c,ry);bx(x,h+.6,z,w+1,1.2,w+1,shade(c,1.15),ry);
  const nf=Math.floor(h/4.5);for(let f=0;f<nf;f++){for(let q=0;q<4;q++){const aa=ry+q*PI/2,ox=Math.sin(aa)*(w/2+.06),oz=Math.cos(aa)*(w/2+.06);bx(x+ox,3+f*4.5,z+oz,w*.78,1.7,.1,0xbfe6ff,aa,'eW')}}
  if(i%3===0){cy(x,h+4,z,.25,6,0xcfcfcf);cy(x,h+7,z,.3,.3,0xff3b30,'eL')}}}
function blimp(){
 if(MAPS.lib.isDry())return;const g=new THREE.Group(),body=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),new THREE.MeshStandardMaterial({color:0xe9edf2,roughness:.5}));body.scale.set(12,4.6,4.6);g.add(body);
 const c=document.createElement('canvas');c.width=512;c.height=128;txt('\u25B2 STONKS','#0b3d1f','#39ff88','bold ',{k:.6})(c.getContext('2d'),512,128);const t=new THREE.CanvasTexture(c);
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(13,3.25),new THREE.MeshBasicMaterial({map:t,transparent:false,fog:false}));p.position.set(0,.2,s*4.65);p.rotation.y=s>0?0:PI;g.add(p)}
 const gm=new THREE.MeshStandardMaterial({color:0x39ff88,roughness:.6});for(const[dx,dy,dz,w,h,d]of[[-11,0,0,3,.5,.5],[-10.5,2.6,0,2.8,2.4,.4],[-10.5,-2.6,0,2.8,2.4,.4],[-10.5,0,2.6,2.8,.4,2.4],[-10.5,0,-2.6,2.8,.4,2.4]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),gm);m.position.set(dx,dy,dz);g.add(m)}
 const gon=new THREE.Mesh(new THREE.BoxGeometry(5,1.4,1.8),new THREE.MeshStandardMaterial({color:0x4d5058}));gon.position.y=-5.4;g.add(gon);
 for(const dx of[-1.6,1.6]){const s=new THREE.Mesh(new THREE.BoxGeometry(.12,1.2,.12),new THREE.MeshStandardMaterial({color:0x2a2a2a}));s.position.set(dx,-4.5,0);g.add(s)}
 g.position.y=44;MAPS.lib.add(g);MAPS.lib.anim((dt,T)=>{const a=T*.035+1.2;g.position.x=Math.cos(a)*84;g.position.z=Math.sin(a)*84;g.rotation.y=-a-PI/2+PI/2*0})}
MAPS.reg({id:'stonks',name:'Stonks Plaza',tag:'Meme stock district',theme:'Glass towers, a golden bull fountain, ticker boards and rooftop skybridges.',
 blurb:'Charge round the golden bull, climb the tower stairs and snipe across the glass skybridges.',
 th:['#c4c8cc','#39ff88'],
 grid:['pppppaaaaaaaaaa','pppppaaaaaaaaaa','pppppaaaaaaaaaa','pppppkkkkkkkkkk','pppppkkkKKKKKKk','aaakkgggKKKKKKk','aaakkgggKKKKKKk','aaakkgggKKKKKKk','aaakkgggKKKKKKk','aaakkgggKKKKKKk','aaakkgggkkkkkkk','aaakkgggggggggg','hhhkkgggggggggg','hhhkkgggggggggg','hhhkkgggggggggg'],
 tiles:{p:{c:0x9ea3a9,a:0x90959b,v:.04},a:{c:0x3a3e46,a:0x353840,v:.05},k:{c:0x8a8f96,a:0x7f848b,v:.05,s:1},g:{c:0x3f8a38,a:0x398032,v:.1,s:1},h:{c:0x474a52,a:0x42454d,v:.04}},
 light:[{t:0,top:0x3d86dc,mid:0xa8d6f2,bot:0xf4f1e2,fog:0xd2e4ee,fn:90,ff:250,sun:0xfff4de,si:.58,sp:[30,56,-22],hs:0xe3edff,hg:0x7a8a78,hi:.5,disc:0xfff4cf,dsz:34,lamp:0,star:0},
  {t:1,top:0x1f2a66,mid:0x9a5aa0,bot:0xff9a62,fog:0x8a6c88,fn:55,ff:190,sun:0xff9a62,si:.36,sp:[-60,12,-30],hs:0x8478b8,hg:0x3a3650,hi:.42,disc:0xffa564,dsz:50,lamp:1,star:.14}],
 build(L){
  const lib=MAPS.lib;curbs(c=>asph(c),{h:.18});
  if(!lib.isDry()){
   for(let x=11;x<30;x+=2.6){bx(x,.024,0,1.3,.03,.22,0xf2f2f2);bx(-x,.024,0,1.3,.03,.22,0xf2f2f2)}for(let z=11;z<30;z+=2.6){bx(0,.02,z,.22,.03,1.3,0xf2f2f2);bx(0,.02,-z,.22,.03,1.3,0xf2f2f2)}
   for(let k=-5;k<=5;k++){bx(11.4,.025,k,1.2,.03,.5,0xf2f2f2);bx(-11.4,.025,k,1.2,.03,.5,0xf2f2f2);bx(k,.025,11.4,.5,.03,1.2,0xf2f2f2);bx(k,.025,-11.4,.5,.03,1.2,0xf2f2f2)}
   for(const s of[-1,1]){bx(s*22,.02,0,4.4,.03,4.4,0x2fae5a);bx(s*22,.03,0,3.6,.03,3.6,0x434750);bx(s*22,.04,0,2,.03,.5,0x39ff88,0,'eN');bx(s*22,.04,0,.5,.03,2,0x39ff88,0,'eN')}
   for(const[w,c,y]of[[19.5,0x8a9096,.012],[17,0xa9aeb4,.02],[14.5,0x62b878,.028],[12,0xa9aeb4,.036]])bx(0,y,0,w,.03,w,c);
   for(const s of[-1,1]){bx(0,.6,s*30.35,61,1.2,.9,0x2f8a3a);studs(-30,30,s*30.35-.3,s*30.35+.3,1.2,0x2f8a3a,1.2);bx(s*30.35,.6,0,.9,1.2,61,0x2f8a3a);studs(s*30.35-.3,s*30.35+.3,-30,30,1.2,0x2f8a3a,1.2)}}
  bull();{skybridge(1);skybridge(-1)}
  for(const s of[-1,1]){helipad(0,s*27,6);heli(0,s*27,s>0?0xd63a3a:0x2f6fd0,s>0?.4:PI-.4)}
  mir((sx,sz)=>{podium(sx,sz);
   kiosk(sx*8.2,sz*8.2,sx*sz>0?0x2fae5a:0x1f8fd0);
   {planter(sx*13,sz*6.6,4.4,1.2,0xcfd4da,{leaf:0x3dae52});planter(sx*7,sz*12.6,1.2,3.6,0xcfd4da,{leaf:0x3dae52})}
   {lamp(sx*9.8,sz*9.8,4,0xbff5d0);lamp(sx*14.5,sz*5,4,0xbff5d0);lamp(sx*5.2,sz*14.5,4,0xbff5d0);lamp(sx*5.2,sz*21.5,4,0xbff5d0);lamp(sx*29,sz*5,4,0xbff5d0)}
   {bench(sx*11.6,sz*9.6,true,0xb9bfc7);bench(sx*10,sz*13.4,false,0xb9bfc7)}
   {if(sx>0)stairs(10.9,sz*14,0,8,3.5,0xcfd4da,.45,.64);else stairs(-10.9,sz*14,1,8,3.5,0xcfd4da,.45,.64);
   if(sz>0)stairs(sx*22,25.1,3,8,3.5,0xcfd4da,.45,.64);else stairs(sx*22,-25.1,2,8,3.5,0xcfd4da,.45,.64)}
   {tree(sx*12,sz*26,1.1);tree(sx*17.5,sz*27.4,.9);tree(sx*27.4,sz*26.4,1);bush(sx*14.6,sz*23.6,1.1);bush(sx*25.5,sz*23.2,1.1);bench(sx*17,sz*24,true,0xb9bfc7);bench(sx*10.4,sz*20.5,false,0xb9bfc7)}});
 },
 env(L){bank(-.2,0x7d838b,{h:2,hole:31,R:80});skyline();blimp();clouds(12,58,70,170,0xffffff,5)},
 // round 16: the card-art pass: two giant suited statues with neon signs behind the avenue, neon panels and ticker boards at the plaza ends, big dusk clouds
 decor(){
  if(MAPS.lib.isDry())return;const KT=MAPS.kit;
  const neon=(t1,t2,c1,c2)=>(g,w,h)=>{g.fillStyle='#070b1e';g.fillRect(0,0,w,h);g.strokeStyle=c1;g.lineWidth=h*.05;g.strokeRect(h*.08,h*.08,w-h*.16,h*.84);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=h*.012;g.strokeRect(h*.1,h*.1,w-h*.2,h*.8);
   g.textAlign='center';g.textBaseline='middle';g.shadowColor=c1;g.shadowBlur=h*.22;g.fillStyle=c1;g.font='bold '+Math.round(h*.42)+'px "Poppins","Arial Black",sans-serif';g.fillText(t1,w/2,h*(t2?.36:.52));
   if(t2){g.shadowColor=c2;g.fillStyle=c2;g.font='bold '+Math.round(h*.24)+'px "Poppins",sans-serif';g.fillText(t2,w/2,h*.74)}g.shadowBlur=0};
  const diamond=(g,w,h)=>{g.fillStyle='#120a2a';g.fillRect(0,0,w,h);g.strokeStyle='#ff4fd8';g.lineWidth=h*.04;g.strokeRect(h*.06,h*.06,w-h*.12,h*.88);
   g.shadowColor='#3fd6ff';g.shadowBlur=h*.2;g.fillStyle='#3fd6ff';g.beginPath();g.moveTo(w*.5,h*.16);g.lineTo(w*.78,h*.42);g.lineTo(w*.5,h*.86);g.lineTo(w*.22,h*.42);g.closePath();g.fill();
   g.strokeStyle='#e8fbff';g.lineWidth=h*.025;g.beginPath();g.moveTo(w*.22,h*.42);g.lineTo(w*.78,h*.42);g.moveTo(w*.38,h*.16);g.lineTo(w*.34,h*.42);g.lineTo(w*.5,h*.86);g.lineTo(w*.66,h*.42);g.lineTo(w*.62,h*.16);g.stroke();g.shadowBlur=0};
  const chart=(g,w,h)=>{g.fillStyle='#120a2a';g.fillRect(0,0,w,h);g.strokeStyle='#ff4fd8';g.lineWidth=h*.04;g.strokeRect(h*.06,h*.06,w-h*.12,h*.88);g.shadowColor='#39ff88';g.shadowBlur=h*.2;g.strokeStyle='#39ff88';g.lineWidth=h*.06;g.lineJoin='round';
   g.beginPath();g.moveTo(w*.14,h*.76);g.lineTo(w*.34,h*.5);g.lineTo(w*.5,h*.62);g.lineTo(w*.84,h*.24);g.stroke();g.fillStyle='#39ff88';g.beginPath();g.moveTo(w*.9,h*.18);g.lineTo(w*.7,h*.2);g.lineTo(w*.86,h*.38);g.fill();g.shadowBlur=0};
  for(const sx of[-1,1]){const X=sx*41,ry=sx>0?-PI/2:PI/2,face=-sx;
   // plinth with steps and neon trim
   bx(X,1.0,0,10,2.0,16,0x2a2f44,ry);bx(X,2.2,0,8.6,.5,14.6,0x3a4262,ry);bx(X+face*4.6,1.3,0,.18,.3,15,0x39ff88,0,'eN');bx(X+face*4.6,2.2,0,.18,.3,14.2,0xff4fd8,0,'eN');
   KT.suitStatue(X,2.45,0,ry,2.0);
   // glowing signs on the plinth face
   sign(X+face*5.05,1.2,-5.2,sx>0?-PI/2:PI/2,4.2,1.6,neon('STONKS','TO THE MOON','#39ff88','#ffd02f'),{pw:512,lit:true});sign(X+face*5.05,1.2,0,sx>0?-PI/2:PI/2,3.2,3.2,diamond,{pw:256,lit:true});sign(X+face*5.05,1.2,5.2,sx>0?-PI/2:PI/2,3.2,3.2,chart,{pw:256,lit:true});
   for(const z of[-1,1]){bx(X+face*3,5.2,z*10.6,.6,10.4,.6,0x2a2f44);sign(X+face*3.4,6.4,z*10.6,sx>0?-PI/2:PI/2,4.4,4.4*.5,neon(z>0?'STONKS':'BUY','HODL','#3fd6ff','#ff4fd8'),{pw:512,lit:true});sign(X+face*3.4,3.4,z*10.6,sx>0?-PI/2:PI/2,3.0,3.0,z>0?diamond:chart,{pw:256,lit:true})}}
  // ticker boards high on the plaza ends and neon strips over the avenue
  for(const sz of[-1,1]){ticker(0,9.2,sz*30.3,sz>0?PI:0,9.5,3,2+sz);bx(0,7.2,sz*30.3,10,.3,.5,0x39ff88,0,'eN');for(const q of[-1,1])bx(q*5.1,5.3,sz*30.3,.5,10.6,.6,0x3a3f48);bx(0,7.6,sz*30.3,10.6,.5,.6,0x3a3f48);bx(0,10.55,sz*30.3,10.6,.3,.6,0x3a3f48); // the board stands on two steel legs
   KT.bannerPole(-13,sz*27.2,6.4,sz>0?PI:0,{c1:0x1f8a4a,c2:0xffd02f,h:3});KT.bannerPole(13,sz*27.2,6.4,sz>0?PI:0,{c1:0x1f8a4a,c2:0xffd02f,h:3})}
  for(let i=0;i<9;i++){const a=i/9*PI*2+.2,r=150+rnd(i,3)*40;KT.cumulus(Math.cos(a)*r,52+rnd(i,4)*20,Math.sin(a)*r,1.8+rnd(i,5),0xffe3f0)}
 }
});
})();
