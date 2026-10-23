/* Q abilities from the Fighter Design Sheet. memes.js already runs Troll Prank, Stonks Zone, Sahur Slam and Pork Portal; this file adds the rest in the same way:
   Frog Hop (Pepe), Doom Spiral (Wojak), Quick Build (Foreman), Jackpot Juke (Jester), Mic Check (Podcaster), Rainbow Rush (Nyan Cat),
   Overclock (Big Brain), Alpha Rush (Gigachad), Such Wow (Doge), plus the marker rings that show where Airstrike shells (General) will land.
   Online it works like every other ability: the caster sends one cast message, both games play it, and whoever is hit decides what happens to them
   (so my game applies a debuff, stun, knockback or slow to ME, and only draws it when it is on the opponent).
   Cooldowns come from the sheet: Frog 16, Doom 18, Build 20, Juke 19, Mic 17, Rush 16, Overclock 18, Alpha 18, Wow 18 (Airstrike 24 in game.js, Troll 21, Stonks 22, Slam 20, Portal 20 in memes.js). */
(()=>{
const TH=window.THREE,PI=Math.PI,{fx,ring,puff,mat,knock,stun,free,shake,other,NETON}=MEME.H,{CD,CAST,AIM,BOT}=MEME;
Object.assign(CD,{frog:16,doom:18,build:20,juke:19,mic:17,rush:16,clock:18,alpha:18,wow:18});
const D={doom:{R:17,t:3,dm:.75},frog:{R:2.2,t:5,slow:2.5,f:.55},build:{L:4.4,Hh:1.8,T:.7,t:14,max:2},juke:{R:5.5,stun:1.3,fuse:1.25},rush:{t:5,boost:1.4},clock:{t:6,spr:.45,rl:.7},
 alpha:{res:.5,resT:1.8,hit:10,kn:24,knt:.45},wow:{t:5,sh:25,spd:1.3,rl:.6}};
MEME.D=D;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// a floating word that pops up above someone
function popText(x,y,z,txt,col,dur){const c=document.createElement('canvas');c.width=384;c.height=96;const g=c.getContext('2d');let fs=58;g.font='900 '+fs+'px Arial Black,Impact,sans-serif';const tw=g.measureText(txt).width;if(tw>340){fs=Math.floor(fs*340/tw);g.font='900 '+fs+'px Arial Black,Impact,sans-serif'}g.textAlign='center';g.textBaseline='middle';g.lineWidth=10;g.strokeStyle='#000';g.lineJoin='round';g.strokeText(txt,192,50);g.fillStyle=col;g.fillText(txt,192,50);
 const s=new TH.Sprite(new TH.SpriteMaterial({map:new TH.CanvasTexture(c),transparent:true,depthWrite:false,depthTest:false}));s.position.set(x,y,z);s.scale.set(.1,.04,1);s.renderOrder=9;
 fx(s,dur||1.1,(o,k)=>{const sc=k<.15?k/.15:1;o.scale.set(3.9*sc,.98*sc,1);o.position.y=y+k*1.1;o.material.opacity=k<.65?1:Math.max(0,(1-k)/.35)})}
const sayP=(e,t,s)=>{if(e===P)say(t,s||1)};

// ================== FROG HOP (Pepe): a quick leap to the side that leaves a slime puddle ==================
const PUD=[];
AIM.frog=()=>{const s=k.d&&!k.a?1:k.a&&!k.d?-1:(Math.random()<.5?1:-1);return[Math.cos(yaw)*s,-Math.sin(yaw)*s]}; // the side you press, or a random side
function puddle(x,y,z,o){const g=new TH.Group(),d=new TH.Mesh(new TH.CylinderGeometry(D.frog.R,D.frog.R,.06,32),mat(0x6dd13b,{opacity:.55}));d.position.y=.05;g.add(d);
 const r=new TH.Mesh(new TH.TorusGeometry(D.frog.R,.07,6,36),mat(0xb6ff5a,{opacity:.85}));r.rotation.x=PI/2;r.position.y=.08;g.add(r);
 for(let i=0;i<5;i++){const b=new TH.Mesh(new TH.SphereGeometry(.14+.07*(i%2),8,6),mat(0xcaff7a,{opacity:.85}));b.userData={a:i*PI*2/5,p:Math.random()};g.add(b)}
 g.position.set(x,y,z);S.add(g);PUD.push({o,x,y,z,t:D.frog.t,g,d,r})}
CAST.frog=(e,dx,dz)=>{puddle(e.x,e.y,e.z,e);ring(e.x,e.y+.1,e.z,.5,2.8,0x6dd13b,.5,1);puff(e.x,e.y+.3,e.z,0x8be04a,8,3,.6,.14);
 e.vy=Math.max(e.vy||0,7.5);e.gr=false;e.y+=.05;e.dash=.38;e.dvx=dx*17;e.dvz=dz*17;sayP(e,'FROG HOP!',.8)};
function puddleStep(dt){for(let i=PUD.length-1;i>=0;i--){const p=PUD[i];p.t-=dt;const f=Math.min(1,p.t/1);
  p.d.material.opacity=.55*f;p.r.material.opacity=.85*f;p.g.children.forEach(c=>{if(c.userData.a!==undefined){const q=(T*.8+c.userData.p)%1;c.position.set(Math.cos(c.userData.a)*D.frog.R*.6,.1+Math.sin(q*PI)*.45,Math.sin(c.userData.a)*D.frog.R*.6);c.material.opacity=.85*f*Math.sin(q*PI)}});
  const v=other(p.o);if(p.t>0&&v.hp>0&&!(NETON()&&v===E)&&dist(v,p)<D.frog.R&&Math.abs(v.y-p.y)<1.4){if(!(v.slowT>0)&&v===P)say('SLIMED! SLOWED',1);
   v.slowF=v.slowT>0?Math.min(v.slowF||1,D.frog.f):D.frog.f;v.slowT=Math.max(v.slowT||0,D.frog.slow)}
  if(p.t<=0){S.remove(p.g);PUD.splice(i,1)}}}

// ================== DOOM SPIRAL (Wojak): a grey pulse that blurs the enemy's screen and weakens their hits ==================
CAST.doom=e=>{const R=D.doom.R,g=new TH.Group();for(let i=0;i<28;i++){const a=i*.62,r=.3+i*.1,m=new TH.Mesh(new TH.SphereGeometry(.12+i*.004,6,5),mat(i%2?0x9097a3:0x5a606c,{opacity:.9}));m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);g.add(m)}
 g.position.set(e.x,e.y+.2,e.z);S.add(g);fx(g,.9,(o,k2)=>{const s=.4+k2*(R/3.2);o.scale.set(s,s,s);o.rotation.y=k2*9;o.children.forEach(c=>c.material.opacity=.9*(1-k2))});
 ring(e.x,e.y+.15,e.z,.5,R,0x9097a3,.8,1);ring(e.x,e.y+.15,e.z,.3,R*.7,0x5a606c,.7,1);
 const v=other(e);if(v.hp>0&&v.sh<=0&&dist(v,e)<R&&!(NETON()&&v===E)){v.doomT=D.doom.t;if(v===P)say('DOOM SPIRAL: BLURRED AND WEAKENED',1.6);popText(v.x,v.y+3.1,v.z,'DOOMED','#c8ccd6',1.2)}
 sayP(e,'DOOM SPIRAL',.8)};
const _out=out;out=function(e,n){const r=_out(e,n);return e&&e.doomT>0?r*D.doom.dm:r}; // a doomed fighter hits 25% softer

// ================== QUICK BUILD (Foreman): a short brick wall to hide behind ==================
const WALLS=[];let wid=0;
function wallModel(alongZ){const g=new TH.Group(),rows=3,rh=D.build.Hh/rows,cols=[0xfe8a18,0xffc400],bl=1.1,n=4;
 for(let r=0;r<rows;r++){const off=r%2?bl/2:0,cnt=r%2?n+1:n;for(let i=0;i<cnt;i++){let w=bl-.04,x=(i-(n-1)/2)*bl+off;if(r%2&&(i===0||i===cnt-1)){w=bl/2-.04;x=(i===0?-1:1)*(n*bl/2-bl/4)}
   const m=new TH.Mesh(B(w,rh-.03,D.build.T),M(cols[(r+i)%2]));m.position.set(x,rh*(r+.5),0);g.add(m)}}
 for(let i=0;i<n;i++)for(let j=0;j<2;j++){const s=new TH.Mesh(new TH.CylinderGeometry(.2,.2,.1,12),M(0xffc400));s.position.set((i-(n-1)/2)*bl,D.build.Hh+.05,(j-.5)*.34);g.add(s)}
 g.rotation.y=alongZ?PI/2:0;return g}
CAST.build=(e,dx,dz)=>{let cx=0,cz=0,ok=false;const alongZ=Math.abs(dx)>=Math.abs(dz);
 for(const L of[3.4,2.8,2.3]){cx=e.x+dx*L;cz=e.z+dz*L;const h=D.build.L/2-.4,a=alongZ?[[cx,cz],[cx,cz-h],[cx,cz+h]]:[[cx,cz],[cx-h,cz],[cx+h,cz]];if(a.every(q=>free(q[0],q[1]))){ok=true;break}}
 if(!ok){sayP(e,'NO ROOM TO BUILD',.8);return false}
 for(let i=WALLS.length-1,n=0;i>=0;i--)if(WALLS[i].o===e&&++n>=D.build.max)dropWall(WALLS[i],i);
 const id=++wid,hl=D.build.L/2,ht=D.build.T/2,g=wallModel(alongZ);g.position.set(cx,0,cz);g.scale.y=.05;S.add(g);
 const b=alongZ?{x1:cx-ht,x2:cx+ht,z1:cz-hl,z2:cz+hl,h:D.build.Hh,qb:id}:{x1:cx-hl,x2:cx+hl,z1:cz-ht,z2:cz+ht,h:D.build.Hh,qb:id};boxes.push(b);if(window.NAV)NAV.rebuild();
 WALLS.push({id,o:e,g,t:D.build.t,age:0,b});puff(cx,.3,cz,0xd9b36a,10,4,.6,.2);shake(.2);sayP(e,'QUICK BUILD!',.8)};
function dropWall(w,i){S.remove(w.g);for(let j=boxes.length-1;j>=0;j--)if(boxes[j].qb===w.id)boxes.splice(j,1);if(window.NAV)NAV.rebuild();const k2=WALLS.indexOf(w);if(k2>=0)WALLS.splice(k2,1)}
function wallStep(dt){for(let i=WALLS.length-1;i>=0;i--){const w=WALLS[i];w.t-=dt;w.age+=dt;const up=Math.min(1,w.age/.2);w.g.scale.y=.05+.95*(1-(1-up)*(1-up));
  if(w.t<.8){w.g.position.y=-(1-Math.max(0,w.t)/.8)*D.build.Hh}if(w.t<=0)dropWall(w,i)}}

// ================== JACKPOT JUKE (Jester): a prank decoy that pops into confetti and stuns whoever is close ==================
const JK=[];
function doll(){const g=new TH.Group(),a=(geo,c,x,y,z)=>{const m=new TH.Mesh(geo,M(c));m.position.set(x,y,z);g.add(m);return m};
 a(B(.3,.9,.5),0xe3000b,-.15,1.15,0);a(B(.3,.9,.5),0x0a6ed1,.15,1.15,0);a(B(.24,.8,.3),0x0a6ed1,-.14,.4,0);a(B(.24,.8,.3),0xe3000b,.14,.4,0);
 a(B(.5,.5,.5),0xf2f2f2,0,1.85,0);a(B(.08,.08,.02),0x111111,-.12,1.9,-.26);a(B(.08,.08,.02),0x111111,.12,1.9,-.26);a(B(.26,.05,.02),0x111111,0,1.72,-.26);
 const h1=a(B(.22,.55,.22),0xe3000b,-.14,2.3,0),h2=a(B(.22,.55,.22),0x0a6ed1,.14,2.3,0);h1.rotation.z=.35;h2.rotation.z=-.35;a(new TH.SphereGeometry(.1,8,6),0xffd02f,-.3,2.55,0);a(new TH.SphereGeometry(.1,8,6),0xffd02f,.3,2.55,0);
 [-1,1].forEach(s=>{const m=a(B(.16,.7,.2),s<0?0xe3000b:0x0a6ed1,s*.38,1.2,0);m.rotation.z=s*.6});return g}
CAST.juke=(e,dx,dz)=>{let L=9,x,z;for(;L>=3;L-=1.5){x=e.x+dx*L;z=e.z+dz*L;if(free(x,z))break}if(L<3){x=e.x+dx*2.5;z=e.z+dz*2.5}
 const g=doll();g.position.set(e.x,e.y+1.6,e.z);S.add(g);const w=new TH.Mesh(new TH.TorusGeometry(D.juke.R,.07,6,44),mat(0xff3e3e,{opacity:0}));w.rotation.x=PI/2;w.position.set(x,e.y+.08,z);S.add(w);
 JK.push({o:e,g,w,x,z,y:e.y,sx:e.x,sz:e.z,sy:e.y+1.6,t:0});sayP(e,'JACKPOT JUKE!',.8)};
function jukeStep(dt){for(let i=JK.length-1;i>=0;i--){const q=JK[i];q.t+=dt;const f=Math.min(1,q.t/.5);
  if(f<1){q.g.position.set(q.sx+(q.x-q.sx)*f,q.sy+(q.y-q.sy)*f+Math.sin(f*PI)*3.2,q.sz+(q.z-q.sz)*f);q.g.rotation.y+=dt*14;q.g.rotation.x=Math.sin(f*PI)*.4}
  else{q.g.position.set(q.x,q.y,q.z);q.g.rotation.x=0;q.g.rotation.z=Math.sin(q.t*26)*.12*(q.t>.9?1.6:1);q.g.rotation.y+=dt*3;q.w.material.opacity=(Math.sin(q.t*14)*.25+.45)*Math.min(1,(q.t-.5)/.2)}
  if(q.t>=D.juke.fuse){S.remove(q.g);S.remove(q.w);JK.splice(i,1);const cs=[0xff3e3e,0xffd02f,0x35e6ff,0x4cff7a,0xff6bd6,0x8f62ff];cs.forEach(c=>puff(q.x,q.y+1.2,q.z,c,5,8,1.1,.1));ring(q.x,q.y+.15,q.z,.5,D.juke.R,0xffd02f,.5,1);shake(.3);popText(q.x,q.y+2.2,q.z,'JACKPOT!','#ffd02f',1.2);
   const v=other(q.o);if(v.hp>0&&v.sh<=0&&!(NETON()&&v===E)&&Math.hypot(v.x-q.x,v.z-q.z)<D.juke.R&&Math.abs(v.y-q.y)<2.6){stun(v,D.juke.stun);if(v===P)say('JACKPOT! STUNNED',1.4)}}}}

// ================== MIC CHECK (Podcaster): a reveal pulse ==================
CAST.mic=e=>{e.rev=4;[0,1,2].forEach(i=>ring(e.x,e.y+1.2,e.z,.5+i*.3,26,i===1?0xffd02f:0x35e6ff,.7+i*.25,0));sayP(e,'MIC CHECK: ENEMY MARKED',1.2)};

// ================== RAINBOW RUSH (Nyan Cat): a dash that leaves a rainbow trail; crossing it gives a speed boost ==================
const TRL=[];
CAST.rush=(e,dx,dz)=>{e.dash=.3;e.dvx=dx*30;e.dvz=dz*30;e.rushT=.32;e._rp=null;e._rh=Math.atan2(dx,dz);puff(e.x,e.y+.5,e.z,0xff9ecb,8,4,.5,.14);sayP(e,'RAINBOW RUSH!',.8)};
function trailSeg(e){const g=new TH.Group(),ms=[];for(let i=0;i<6;i++){const m=mat(RB[i],{opacity:.95}),b=new TH.Mesh(B(.15,.05,.62),m);b.position.set((i-2.5)*.16,0,0);g.add(b);ms.push(m)}
 g.position.set(e.x,e.y+.05,e.z);g.rotation.y=e._rh;S.add(g);TRL.push({o:e,x:e.x,z:e.z,y:e.y,t:D.rush.t,g,ms})}
function trailStep(dt){for(const e of ENTS()){if(e.rushT>0){e.rushT-=dt;
   if(!e._rp){trailSeg(e);e._rp=[e.x,e.z]}
   else{const rx=e._rp[0],rz=e._rp[1],d=Math.hypot(e.x-rx,e.z-rz);if(d>.45){const n=Math.floor(d/.45),ox=e.x,oz=e.z; // fill the whole stretch moved this frame so the trail has no gaps
    for(let i=1;i<=n;i++){e.x=rx+(ox-rx)*i*.45/d;e.z=rz+(oz-rz)*i*.45/d;trailSeg(e)}e.x=ox;e.z=oz;e._rp=[rx+(ox-rx)*n*.45/d,rz+(oz-rz)*n*.45/d]}}}}
 for(let i=TRL.length-1;i>=0;i--){const s=TRL[i];s.t-=dt;const f=Math.min(1,s.t/1);s.ms.forEach(m=>m.opacity=.95*f);const v=s.o;
  if(s.t>0&&v.hp>0&&!(v.rushT>0)&&Math.hypot(v.x-s.x,v.z-s.z)<1.1&&Math.abs(v.y-s.y)<1.6){v.hasteT=Math.max(v.hasteT||0,.6);v.hasteF=Math.max(v.hasteF||1,D.rush.boost)}
  if(s.t<=0){S.remove(s.g);TRL.splice(i,1)}}}

// ================== OVERCLOCK (Big Brain): tighter bloom, softer recoil, faster reloads ==================
CAST.clock=e=>{e.ocT=D.clock.t;ring(e.x,e.y+.2,e.z,.4,3.4,0x35e6ff,.6,1);ring(e.x,e.y+1.2,e.z,.3,2.4,0xffd02f,.5,0);sayP(e,'OVERCLOCK!',1);popText(e.x,e.y+3.1,e.z,'OVERCLOCK','#35e6ff',1.1)};
if(window.SIG&&SIG.spr){const _spr=SIG.spr;SIG.spr=(e,w)=>_spr(e,w)*(e&&e.ocT>0?D.clock.spr:1)}

// ================== ALPHA RUSH (Gigachad): a charge that shrugs off damage and sends the first enemy flying ==================
CAST.alpha=(e,dx,dz)=>{e.dash=.35;e.dvx=dx*26;e.dvz=dz*26;e.alT=.35;e._alh=false;e.resT=D.alpha.resT;puff(e.x,e.y+.4,e.z,0xcfcfcf,10,5,.6,.18);ring(e.x,e.y+.15,e.z,.5,2.5,0xffd02f,.45,1);sayP(e,'ALPHA RUSH!',.8)};

// ================== SUCH WOW (Doge): a burst of speed, quick reloads and a small shield ==================
CAST.wow=e=>{e.wowT=D.wow.t;e.wowS=D.wow.sh;e.hasteT=Math.max(e.hasteT||0,D.wow.t);e.hasteF=Math.max(e.hasteF||1,D.wow.spd);ring(e.x,e.y+.2,e.z,.4,3.2,0xffd02f,.6,1);puff(e.x,e.y+1.4,e.z,0xffe27a,10,5,.7,.14);popText(e.x,e.y+3.1,e.z,'SUCH WOW','#ffd02f',1.2);sayP(e,'SUCH WOW!',1)};

// ---- damage: resist (Alpha Rush) and the small shield (Such Wow)
const _dmg=dmg;dmg=function(e,n){if(e.resT>0)n*=D.alpha.res;
 if(e.wowT>0&&e.wowS>0&&!over&&introT<=0&&!(e.sh>0)){const a=Math.min(e.wowS,n);e.wowS-=a;n-=a;puff(e.x,e.y+1.3,e.z,0xffe27a,3,3,.4,.1);if(n<=.001)return}
 return _dmg(e,n)};

// ---- the shield bubble and the little aura on whoever has a buff
const AUR=new Map();
function auraStep(){for(const e of ENTS()){let a=AUR.get(e);if(!a){a={bub:new TH.Mesh(new TH.SphereGeometry(1.45,16,12),mat(0xffe27a,{opacity:.25})),rg:new TH.Mesh(new TH.TorusGeometry(.9,.06,6,28),mat(0x35e6ff,{opacity:.8}))};a.rg.rotation.x=PI/2;a.bub.visible=a.rg.visible=false;S.add(a.bub);S.add(a.rg);AUR.set(e,a)}
  const live=e.hp>0;a.bub.visible=live&&e.wowT>0&&e.wowS>0;if(a.bub.visible){a.bub.position.set(e.x,e.y+1.3,e.z);a.bub.material.opacity=.14+.12*Math.min(1,e.wowS/D.wow.sh)+Math.sin(T*8)*.03}
  const col=e.ocT>0?0x35e6ff:e.resT>0?0xcfcfcf:0;a.rg.visible=live&&!!col;if(a.rg.visible){a.rg.material.color.setHex(col);a.rg.position.set(e.x,e.y+.12,e.z);const s=1+Math.sin(T*9)*.08;a.rg.scale.set(s,s,s)}}}

// ---- airstrike: a red ring on the ground for every shell that is on its way
const MK=new Map();
function markStep(){for(const a of AS){if(!MK.has(a)){const g=new TH.Group(),d=new TH.Mesh(new TH.CylinderGeometry(3,3,.05,28),mat(0xff2a2a,{opacity:.2})),r=new TH.Mesh(new TH.TorusGeometry(3,.08,6,36),mat(0xff4a3a,{opacity:.9}));r.rotation.x=PI/2;d.position.y=.06;r.position.y=.09;g.add(d);g.add(r);g.position.set(a.x,0,a.z);S.add(g);MK.set(a,{g,d,r})}}
 for(const [a,m] of MK){if(AS.indexOf(a)<0){S.remove(m.g);MK.delete(a)}else{const p=Math.max(0,a.t),f=Math.sin(T*(8+Math.max(0,1.2-p)*14))*.5+.5;m.r.material.opacity=.55+.4*f;m.d.material.opacity=.12+.2*f;}}}

// ---- CPU rules for using them (the CPU also uses Frog Hop / Rainbow Rush to dodge, see polish.js, and any ability when hurt, see game.js)
const side=()=>Math.random()<.5?1:-1;
BOT.frog=(e,d,los,ux,uz)=>{if(los&&d<10&&Math.random()<.3){const s=side();ability(e,-uz*s,ux*s)}};
BOT.doom=(e,d,los)=>{if(los&&d<15&&Math.random()<.4)ability(e,0,-1)};
BOT.build=(e,d,los,ux,uz)=>{if(los&&d>6&&d<22&&(e.hp<e.mx*.8||Math.random()<.2))ability(e,ux,uz)};
BOT.juke=(e,d,los,ux,uz)=>{if(los&&d>3.5&&d<14&&Math.random()<.4)ability(e,ux,uz)};
BOT.rush=(e,d,los,ux,uz)=>{if(d>13&&Math.random()<.35)ability(e,ux,uz)};
BOT.clock=(e,d,los)=>{if(los&&d<30&&Math.random()<.4)ability(e,0,-1)};
BOT.alpha=(e,d,los,ux,uz)=>{if(los&&d>2.5&&d<10&&Math.random()<.5)ability(e,ux,uz)};
BOT.wow=(e,d,los)=>{if(los&&d<24&&Math.random()<.35)ability(e,0,-1)};

// ================== per-frame ==================
const _step=step;
step=function(dt){_step(dt);
 const act=!over&&introT<=0;
 for(const e of ENTS()){
  for(const q of['ocT','wowT','resT','doomT','alT'])if(e[q]>0){e[q]=Math.max(0,e[q]-dt)}
  if(e.wowT<=0)e.wowS=0;
  if(!(e.hasteT>0))e.hasteF=1; // no stale speed factor once a boost has run out
  // faster reloads (Overclock, Such Wow); the last bit is left to the normal reload code so the magazine is refilled there
  const x=(e.ocT>0?D.clock.rl:0)+(e.wowT>0?D.wow.rl:0);if(x&&e.rl>0){e.rl-=dt*x;if(e.rl<=0)e.rl=.0001}
  if(e.ocT>0&&e.rc>.45)e.rc=.45; // a softer kick on the gun
  // the Alpha Rush: the first enemy the charge reaches is hit hard and thrown back, and the charge stops
  if(e.alT>0&&!e._alh&&e.hp>0){const v=other(e);if(v.hp>0&&dist(v,e)<1.7&&Math.abs(v.y-e.y)<1.8){e._alh=true;e.dash=0;e.alT=0;ring(e.x,e.y+.2,e.z,.5,3.4,0xffd02f,.45,1);puff(v.x,v.y+1.2,v.z,0xffe27a,10,6,.6,.16);shake(.7);
    if(v.sh<=0&&!(NETON()&&v===E)){dmg(v,D.alpha.hit*(v.hs||1));knock(v,e.x,e.z,D.alpha.kn,D.alpha.knt);stun(v,.35);if(v===P)say('ALPHA RUSH! SENT FLYING',1.4)}}}}
 document.body.classList.toggle('doom',P.doomT>0&&!over);
 puddleStep(dt);wallStep(dt);jukeStep(dt);trailStep(dt);auraStep();markStep()};
// fresh round: everything cleared
const _rr=resetRound;resetRound=function(i){_rr(i);
 PUD.splice(0).forEach(p=>S.remove(p.g));for(let j=WALLS.length-1;j>=0;j--)dropWall(WALLS[j],j);JK.splice(0).forEach(q=>{S.remove(q.g);S.remove(q.w)});TRL.splice(0).forEach(s=>S.remove(s.g));
 for(const[a,m]of MK){S.remove(m.g)}MK.clear();
 for(const e of ENTS()){e.ocT=e.wowT=e.wowS=e.resT=e.doomT=e.alT=e.rushT=0;e._rp=null}document.body.classList.remove('doom')};
const _skin=skin;skin=function(e,id){e.ocT=e.wowT=e.wowS=e.resT=e.doomT=e.alT=e.rushT=0;_skin(e,id)};
window.SKILLS={PUD,WALLS,JK,TRL,MK,D,popText,counts:()=>({pud:PUD.length,walls:WALLS.length,jk:JK.length,trl:TRL.length,mk:MK.size})};
})();
