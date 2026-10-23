/* Melee weapons: twenty-five chooseable weapons (the original Builder Hammer, the nine from the first Melee Weapons sheet, the Tung Tung Tung Sahur bat, the nine signature weapons and the ten from the "New Melee Weapons" sheet).
   Each one has a LEGO-style model that hangs from the right hand along -y (grip around y = -0.9, head toward -y), and its own damage, swing speed, reach and a small special effect.
   The pick is saved in this browser, shown on the weapons page, sent to the opponent online, and picked at random by the CPU each round.
   game.js melee() reads MW.of(e) for the numbers and calls MW.hit() after a hit. */
(()=>{
const TH=window.THREE,PI=Math.PI,KEY='brickbrawl.melee';
// ---- stats. dmg x (1/cd) lands every weapon at roughly 42-50 damage per second, so the choice is about feel (fast, heavy, long, special) and not about a best pick.
const LIST=[
 {id:'hammer',sn:'Hammer',name:'Builder Hammer',tag:'The classic.',rar:'common',dmg:28,cd:.6,range:2.4,sd:.42,fx:'No tricks. Reliable.',h:{sty:'smash',gy:-.55,sc:.95,phi:.22}},
 {id:'bat',sn:'Brick Bat',name:'Brick Bat',tag:'Hits different.',rar:'common',dmg:23,cd:.5,range:3.2,sd:.34,fx:'Quick swings with a small shove.',knock:[8,.12],h:{sty:'slash',gy:-.3,sc:.92,phi:.3}},
 {id:'ban',sn:'Ban Hammer',name:'Ban Hammer',tag:'Rules are pain.',rar:'rare',dmg:40,cd:.95,range:2.6,sd:.56,fx:'Slow and heavy. A hit stuns for 0.35 s.',stun:.35,h:{sty:'smash',gy:-.42,sc:.85,phi:.12}},
 {id:'crown',sn:'Crusher',name:'Crown Crusher',tag:'Royalty hurts.',rar:'legend',dmg:33,cd:.8,range:3.0,sd:.48,fx:'Spiked mace. 25% more damage against armor.',armor:1.25,h:{sty:'smash',gy:-.36,sc:.85,phi:.2}},
 {id:'paddle',sn:'Paddle',name:'Prank Paddle',tag:'Slap happens.',rar:'rare',dmg:20,cd:.42,range:3.2,sd:.3,fx:'Very fast. Every slap knocks them back.',knock:[10,.15],h:{sty:'slash',gy:-.32,sc:.88,phi:.35}},
 {id:'katana',sig:'nyan',sn:'Katana',name:'Pixel Katana',tag:'404 block not found.',rar:'epic',dmg:18,cd:.43,range:3.0,sd:.32,fx:'Long reach. 15% chance of a x1.75 crit.',crit:[.15,1.75],h:{sty:'diag',gy:-.55,sc:.68,phi:.95,s:.9,el:1.0}},
 {id:'wrench',sn:'Wrench',name:'Builder Wrench',tag:'Fixes problems permanently.',rar:'common',dmg:27,cd:.65,range:2.6,sd:.42,fx:'Every hit repairs you: +2 health, +1 armor.',heal:[2,1],h:{sty:'smash',gy:-.62,sc:.85,phi:.4}},
 {id:'bone',sig:'doge',sn:'Bone Club',name:'Doge Bone Club',tag:'Such damage. Very bonk.',rar:'legend',dmg:22,cd:.6,range:2.6,sd:.38,fx:'Wow! Each swing deals 80% to 150% damage.',roll:[.8,1.5],h:{sty:'diag',gy:-.6,sc:.88,phi:.35}},
 {id:'brain',sig:'trader',sn:'Bonker',name:'Brain Bonker',tag:'Ideas hurt.',rar:'epic',dmg:40,cd:1,range:3.0,sd:.62,fx:'Slow. 25% chance to stun for 0.6 s.',stunc:[.25,.6],h:{sty:'chop',gy:-.5,sc:.82,phi:.15}},
 {id:'sahurbat',sig:'sahur',sn:'Sahur Bat',name:'Tung Tung Tung Sahur Bat',tag:'Sahur. Sahur. Sahur.',rar:'legend',dmg:37,cd:.82,range:2.8,sd:.5,fx:'Knocks them back on every hit.',knock:[10,.18],h:{sty:'chop',gy:-.42,sc:.85,phi:.2}},
 {id:'sabre',sn:'Sabre',name:'Command Sabre',tag:'Orders are orders.',rar:'epic',sig:'general',dmg:22,cd:.5,range:3.2,sd:.34,fx:'Fast and sharp. Swings while you are sprinting deal +50% damage.',sprint:1.5,h:{sty:'diag',gy:-.55,sc:.72,phi:.9,s:.9,el:1.0}},
 {id:'baton',sn:'Baton',name:'Bull Market Baton',tag:'Buy high. Hit higher.',rar:'epic',sig:'stonks',dmg:26,cd:.58,range:3.0,sd:.38,fx:'After a hit you run 15% faster for 2.5 s.',haste:[2.5,1.15],h:{sty:'slash',gy:-.5,sc:.76,phi:.3}},
 {id:'hotline',sn:'Hotline',name:'Hotline Hammer',tag:'Please hold.',rar:'epic',sig:'pork',dmg:38,cd:.85,range:2.4,sd:.5,fx:'Slows the target by 35% for 1.6 s.',slow:[1.6,.65],h:{sty:'smash',gy:-.5,sc:.85,phi:.15}},
 {id:'chad',sn:'Crusher',name:'Chad Crusher',tag:'Never skip arm day.',rar:'legend',sig:'giga',dmg:52,cd:1.1,range:2.4,sd:.62,fx:'Very heavy. Every hit launches them back.',knock:[14,.24],h:{sty:'smash',gy:-.5,sc:.8,phi:.12}},
 {id:'mallet',sn:'Mallet',name:'Meme Mallet',tag:'Squeak. Bonk. Gone.',rar:'legend',sig:'troll',dmg:33,cd:.75,range:2.4,sd:.46,fx:'+50% damage when you hit from behind, plus a small shove.',back:1.5,knock:[9,.15],h:{sty:'smash',gy:-.5,sc:.85,phi:.2}}, {id:'crowbar',sn:'Crowbar',name:'Brick Crowbar',tag:'Simple. Solid. Reliable.',rar:'common',dmg:25,cd:.55,range:2.8,sd:.4,fx:'Pries armor apart: every hit strips 8 extra armor.',strip:8,h:{sty:'slash',gy:-.8,sc:0.64,phi:.3}},
 {id:'shovel',sn:'Shovel',name:'Shock Shovel',tag:'Dig deep. Hit harder.',rar:'rare',dmg:30,cd:.7,range:2.8,sd:.46,fx:'Shocks the target: 25% slower for 1.2 s.',slow:[1.2,.75],h:{sty:'smash',gy:-.9,sc:0.7,phi:.2}},
 {id:'tongs',sn:'Tongs',name:'Trap Tongs',tag:'Clamp first. Regret later.',rar:'rare',dmg:28,cd:.65,range:2.8,sd:.42,fx:'Clamps the target: 60% slower for 0.9 s.',slow:[.9,.4],h:{sty:'chop',gy:-.7,sc:0.72,phi:.2}},
 {id:'nunchucks',sn:'Nunchucks',name:'Neon Nunchucks',tag:'Fast hands. Bright pain.',rar:'epic',dmg:12,cd:.3,range:2.6,sd:.24,fx:'Very fast. Each hit in a chain adds 8% damage, up to 3 stacks.',combo:[.08,3],h:{sty:'slash',gy:-.65,sc:0.7,phi:.25}},
 {id:'rammer',sn:'Rammer',name:'Royal Rammer',tag:'Knock with authority.',rar:'epic',dmg:36,cd:.8,range:2.6,sd:.5,fx:'Launches the target back on every hit.',knock:[11,.2],h:{sty:'smash',gy:-.8,sc:0.88,phi:.2}},
 {id:'racket',sn:'Racket',name:'Rocket Racket',tag:'Serve. Smash. Repeat.',rar:'epic',dmg:24,cd:.55,range:3.0,sd:.34,fx:'Smashes the target away like a ball.',knock:[18,.14],h:{sty:'diag',gy:-.7,sc:0.72,phi:.3,s:.9,el:1.0}},
 {id:'mememace',sn:'Meme Mace',name:'Meme Mace',tag:'Maximum bonk energy.',rar:'epic',dmg:30,cd:.75,range:2.8,sd:.46,fx:'20% chance of a x1.8 BONK crit.',crit:[.2,1.8],h:{sty:'smash',gy:-.8,sc:.8,phi:.2}},
 {id:'pike',sn:'Pike',name:'Portal Pike',tag:'Poke through space.',rar:'legend',dmg:27,cd:.62,range:3.6,sd:.4,fx:'Longest reach. Hits from beyond 2.9 m deal +35%.',tip:[2.9,1.35],h:{sty:'thrust',gy:-.9,sc:0.76,phi:.4}},
 {id:'gavel',sn:'Gavel',name:'Thunder Gavel',tag:'Verdict: BONK.',rar:'legend',dmg:47,cd:1.05,range:2.8,sd:.6,fx:'Very heavy. Every hit stuns for 0.45 s.',stun:.45,h:{sty:'smash',gy:-.8,sc:0.9,phi:.15}},
 {id:'scythe',sn:'Scythe',name:'Glitch Scythe',tag:'Corrupt the battlefield.',rar:'legend',dmg:28,cd:.7,range:3.2,sd:.46,fx:'Corrupts: every hit adds 25% of its damage again over 2 s.',dot:[.25,2],h:{sty:'slash',gy:-.8,sc:.66,phi:.3}}];
const BY={};LIST.forEach(w=>BY[w.id]=w);
let sel='hammer';try{const v=localStorage.getItem(KEY);if(BY[v])sel=v}catch(e){}
// signature weapons belong to one fighter (epic and legendary only) and unlock when that fighter reaches the top level
const need=()=>(window.LV&&LV.MAXL)||30;
// ---- ownership (round 18): the common melee weapons are yours from the start; every Rare, Epic and Legendary one starts locked and is won from Melee Crates in the Store
const OWN='brickbrawl.melee.owned',owned=new Set(),ownSubs=[];
try{(JSON.parse(localStorage.getItem(OWN)||'[]')||[]).forEach(id=>{if(BY[id]&&!BY[id].sig)owned.add(id)})}catch(e){}
const isFree=w=>!w.sig&&w.rar==='common',isOwned=id=>{const w=BY[id];return !!w&&!w.sig&&(isFree(w)||owned.has(id))};
const saveOwn=()=>{try{localStorage.setItem(OWN,JSON.stringify([...owned]))}catch(e){}ownSubs.forEach(f=>{try{f()}catch(e){}})};
const unlocked=id=>{const w=BY[id];if(!w)return false;if(!w.sig)return isOwned(id);const c=csel;return w.sig===c&&!!window.LV&&LV.lvl('c',c)>=need()};
// the crates: price in Brick Bucks and the chance of each rarity. A crate never gives a weapon you own while there is still one you do not own (it tries its other rarities first, then any rarity); once you own every melee, a crate pays Bucks back.
const CRATES=[{id:'std',name:'Brick Crate',price:300,odds:{rare:70,epic:25,legend:5},c:'#3d9bff',tag:'Mostly Rare, a chance of Epic.'},
 {id:'elite',name:'Elite Crate',price:900,odds:{rare:30,epic:50,legend:20},c:'#b46bff',tag:'Epic is the most likely prize.'},
 {id:'royal',name:'Royal Crate',price:2500,odds:{epic:35,legend:65},c:'#ffc400',tag:'No Rares. Mostly Legendary.'}],REFUND={rare:150,epic:350,legend:800};
const pool=r=>LIST.filter(w=>!w.sig&&w.rar===r&&!isOwned(w.id));
function roll(cr,rn){rn=rn||Math.random;const ks=Object.keys(cr.odds);let tot=ks.reduce((a,k)=>a+cr.odds[k],0),x=rn()*tot,r=ks[ks.length-1];for(const k of ks){if(x<cr.odds[k]){r=k;break}x-=cr.odds[k]}
 let p=pool(r);if(!p.length){const alt=ks.filter(k=>pool(k).length);if(alt.length){r=alt[(rn()*alt.length)|0];p=pool(r)}else{const left=LIST.filter(w=>!w.sig&&w.rar!=='common'&&!isOwned(w.id));if(left.length){const w=left[(rn()*left.length)|0];return{id:w.id,rar:w.rar,dup:false,refund:0}}const any=LIST.filter(w=>!w.sig&&w.rar!=='common'&&cr.odds[w.rar]);if(!any.length)return null;const w=any[(rn()*any.length)|0];return{id:w.id,rar:w.rar,dup:true,refund:REFUND[w.rar]||100}}}
 const w=p[(rn()*p.length)|0];return{id:w.id,rar:w.rar,dup:false,refund:0}}
const crates={list:CRATES,refund:REFUND,
 // locked generic melee (the ones crates can give), and how many you own
 pool:()=>LIST.filter(w=>!w.sig&&w.rar!=='common'),owned:isOwned,count:()=>LIST.filter(w=>!w.sig&&w.rar!=='common'&&isOwned(w.id)).length,
 left:()=>LIST.filter(w=>!w.sig&&w.rar!=='common'&&!isOwned(w.id)).length,
 // buy and open one crate: {ok,id,rar,dup,refund} or {ok:false,why:'poor'|'none'}
 open(cid,rn){const cr=CRATES.find(c=>c.id===cid);if(!cr)return{ok:false,why:'none'};if(!window.BUX||BUX.get()<cr.price)return{ok:false,why:'poor'};
  const r=roll(cr,rn);if(!r)return{ok:false,why:'none'};if(!BUX.spend(cr.price))return{ok:false,why:'poor'};
  if(r.dup)BUX.add(r.refund);else{owned.add(r.id);saveOwn()}return Object.assign({ok:true,crate:cr.id},r)},
 give(id){if(BY[id]&&!BY[id].sig){owned.add(id);saveOwn()}},all(){LIST.forEach(w=>{if(!w.sig)owned.add(w.id)});saveOwn()},reset(){owned.clear();saveOwn()},on:f=>ownSubs.push(f),roll};

const fix=id=>unlocked(id)?id:'hammer';
const sigOf=f=>LIST.find(w=>w.sig===f);
const pickE=()=>{const gen=LIST.filter(w=>!w.sig),sg=E&&sigOf(E.id);return(sg&&(E.lv||0)>=need()&&Math.random()<.5?sg:gen[(Math.random()*gen.length)|0]).id};
// ---- materials and little builders
const M=(c,o)=>new TH.MeshStandardMaterial(Object.assign({color:c,roughness:.36,metalness:.04},o||{}));
const GL=(c,i)=>M(c,{emissive:c,emissiveIntensity:i==null?.55:i,roughness:.3});
const V3=(x,y,z)=>new TH.Vector3(x,y,z);
const RB=(w,h,d,r)=>{r=r||.04;const sh=new TH.Shape(),x=w/2-r,y=h/2-r;sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.closePath();
 const g=new TH.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g};
function Maker(){const G=new TH.Group();
 const mk=(g,m,x,y,z)=>{const o=new TH.Mesh(g,m.isMaterial?m:M(m));o.position.set(x||0,y||0,z||0);o.castShadow=true;o.userData.sh=1;G.add(o);return o};
 const cyl=(rt,rb,h,m,y,x,z,n)=>mk(new TH.CylinderGeometry(rt,rb,h,n||22),m,x||0,y,z||0);
 const box=(w,h,d,m,x,y,z,r)=>mk(RB(w,h,d,r),m,x,y,z);
 const sph=(r,m,x,y,z,sx,sy,sz)=>{const o=mk(new TH.SphereGeometry(r,16,12),m,x,y,z);if(sx)o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);return o};
 const cone=(r,h,m,x,y,z,n)=>mk(new TH.ConeGeometry(r,h,n||10),m,x,y,z);
 const tor=(r,t,m,x,y,z,rx,ry,rz)=>{const o=mk(new TH.TorusGeometry(r,t,10,28),m,x,y,z);o.rotation.set(rx||0,ry||0,rz||0);return o};
 // a LEGO stud sitting on a surface point, pointing along dir
 const stud=(p,dir,m,r)=>{const o=mk(new TH.CylinderGeometry(r||.05,r||.05,.045,12),m,p.x,p.y,p.z);o.quaternion.setFromUnitVectors(V3(0,1,0),dir.clone().normalize());o.position.addScaledVector(dir.clone().normalize(),.02);return o};
 const ringStuds=(y,r,n,m,sr)=>{for(let i=0;i<n;i++){const a=i*PI*2/n+.2;stud(V3(r*Math.cos(a),y,r*Math.sin(a)),V3(Math.cos(a),0,Math.sin(a)),m,sr)}};
 const plane=(w,h,tex,x,y,z,ry)=>{const o=new TH.Mesh(new TH.PlaneGeometry(w,h),new TH.MeshBasicMaterial({map:tex,transparent:true,side:TH.DoubleSide}));o.position.set(x,y,z);o.rotation.set(0,ry||0,PI);G.add(o);return o}; // turned 180 degrees in its own plane: the weapon is held with the head up, so the lettering stays the right way up
 return{G,mk,cyl,box,sph,cone,tor,stud,ringStuds,plane}}
const TX={};const tex=(k,w,h,f)=>TX[k]||(TX[k]=(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new TH.CanvasTexture(c);t.anisotropy=4;return t})());
const font=(x,s,w)=>{x.font=(w||900)+' '+s+'px Arial Black,Impact,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle'};
// ---- the models
const B={};
B.hammer=()=>{const m=Maker();const{cyl,box}=m;cyl(.07,.07,1.2,0x8b5a2b,-.9);box(.16,.1,.16,0xffd02f,0,-.45);box(.16,.1,.16,0xffd02f,0,-1.1);box(1,.5,.55,0x9aa0a6,0,-1.55,0,.05);box(.14,.56,.6,0xe3000b,-.6,-1.55,0,.04);box(.14,.56,.6,0xe3000b,.6,-1.55,0,.04);box(.3,.3,.3,0x6e747a,0,-1.9,0,.04);return m.G};
B.bat=()=>{const m=Maker(),{cyl,sph,box,stud,ringStuds,plane}=m,Y=0xffd02f,BL=0x2f6bff,K=0x1b1b1f;
 cyl(.11,.11,.08,Y,-.1);cyl(.075,.075,.9,K,-.6);[-.35,-.55,-.75].forEach(y=>cyl(.088,.088,.035,0x3a3a40,y));
 const segs=[Y,BL,Y,BL,Y,BL],r0=.115,r1=.26,y0=-1.05,h=.22;
 segs.forEach((c,i)=>{const ra=r0+(r1-r0)*i/6,rb=r0+(r1-r0)*(i+1)/6;cyl(ra,rb,h,c,y0-h*(i+.5)-.0);ringStuds(y0-h*(i+.5),(ra+rb)/2+.005,8,segs[(i+1)%2?0:1]===c?Y:Y,.045)});
 cyl(.26,.26,.05,BL,y0-h*6-.02);for(let i=0;i<5;i++){const a=i?(i-1)*PI/2:0,r=i?.14:0;stud(V3(r*Math.cos(a),y0-h*6-.06,r*Math.sin(a)),V3(0,-1,0),Y,.05)}
 const T=tex('batface',128,128,(x,w)=>{x.fillStyle='#ffd02f';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.lineWidth=5;x.strokeStyle='#1b1b1f';x.stroke();x.fillStyle='#1b1b1f';x.beginPath();x.arc(44,52,8,0,7);x.arc(84,52,8,0,7);x.fill();x.lineWidth=6;x.beginPath();x.arc(64,66,28,.15*PI,.85*PI);x.stroke();
  x.fillStyle='#2f6bff';[[34,14],[64,6],[94,14]].forEach(([a,b])=>{x.beginPath();x.moveTo(a-9,b+14);x.lineTo(a,b-6);x.lineTo(a+9,b+14);x.fill()})});
 plane(.26,.26,T,0,-1.72,.205,0);plane(.26,.26,T,0,-1.72,-.205,PI);return m.G};
B.ban=()=>{const m=Maker(),{cyl,box,sph,mk}=m,K=0x17171b,R=0xd91f26,GR=0x9aa0a8;
 cyl(.085,.085,1.45,K,-.85);[-.3,-.55,-1.4].forEach(y=>cyl(.105,.105,.08,R,y));sph(.12,R,0,-.1,0);
 box(1.05,.72,.72,K,0,-1.95,0,.05);[-1,1].forEach(s=>{box(.2,.64,.64,GR,s*.6,-1.95,0,.04);const c=cyl(.25,.25,.14,GL(R,.7),-1.95,s*.78,0,24);c.rotation.z=PI/2;const d=cyl(.12,.12,.03,0x35e6ff,-1.95,s*.86,0,18);d.rotation.z=PI/2});
 for(let i=0;i<5;i++)m.stud(V3(-.4+i*.2,-1.6,.15),V3(0,1,0),GR,.05);
 const T=tex('ban',256,200,(x,w,h)=>{x.fillStyle='#17171b';x.fillRect(0,0,w,h);x.fillStyle='#240a0c';x.fillRect(20,12,w-40,126);x.fillStyle='#ff2a2a';x.beginPath();x.moveTo(w/2,22);x.lineTo(w/2+62,126);x.lineTo(w/2-62,126);x.closePath();x.fill();x.fillStyle='#240a0c';x.beginPath();x.moveTo(w/2,48);x.lineTo(w/2+40,112);x.lineTo(w/2-40,112);x.closePath();x.fill();
  x.fillStyle='#ff4a3a';x.fillRect(w/2-6,64,12,28);x.fillRect(w/2-6,98,12,12);x.shadowColor='#ff2a2a';x.shadowBlur=12;x.strokeStyle='#ff2a2a';x.lineWidth=5;x.strokeRect(20,12,w-40,126);x.shadowBlur=0;font(x,46);x.fillStyle='#fff';x.fillText('BAN',w/2,170)});
 m.plane(.7,.55,T,0,-1.95,.37,0);m.plane(.7,.55,T,0,-1.95,-.37,PI);return m.G};
B.crown=()=>{const m=Maker(),{cyl,sph,cone,tor,box}=m,G1=0xe3b92a,G2=0xb88a14,RD=0xc4161c;
 [0xd4af37,0xc4161c,0xf2f2f2,0xc4161c,0xd4af37,0x6b4a2f].forEach((c,i)=>cyl(.085,.085,.21,c,-.25-i*.2));cyl(.1,.1,.06,G1,-.1);
 cyl(.1,.2,.18,G1,-1.43);tor(.2,.04,G2,0,-1.52,0,PI/2);
 const HY=-1.95,R=.44;sph(R,M(G1,{metalness:.3,roughness:.22}),0,HY,0);tor(R*.99,.045,G2,0,HY,0,PI/2);tor(R*.97,.04,G2,0,HY,0,0,0,0);tor(R*.97,.04,G2,0,HY,0,0,PI/2,0);
 const ga=PI*(3-Math.sqrt(5));for(let i=0;i<16;i++){const t=(i+.5)/16,cy=.75-1.6*t,s=Math.sqrt(1-cy*cy),a=i*ga,dir=V3(s*Math.cos(a),cy,s*Math.sin(a));if(cy<-.62)continue;
  const sp=cone(.075,.32,G1,dir.x*(R+.1),HY+dir.y*(R+.1),dir.z*(R+.1),8);sp.quaternion.setFromUnitVectors(V3(0,1,0),dir)}
 const tip=cone(.1,.36,G1,0,HY-R-.12,0,8);tip.rotation.x=PI;
 for(let i=0;i<6;i++){const a=i*PI/3+.5,dir=V3(Math.cos(a),.15*(i%2?1:-1),Math.sin(a)).normalize(),g=sph(.075,GL(RD,.6),dir.x*R,HY+dir.y*R,dir.z*R,1,1,.55);g.quaternion.setFromUnitVectors(V3(0,0,1),dir)}
 return m.G};
B.paddle=()=>{const m=Maker(),{cyl,box,sph,stud,plane}=m,RD=0xd91f26,W=0xf2f2f2,K=0x1b1b1f;
 [W,K,RD,W,K].forEach((c,i)=>cyl(.08,.08,.24,c,-.2-i*.24));cyl(.13,.13,.07,W,-.06);
 box(.88,.82,.15,RD,0,-1.78,0,.05);[[-.33,.52],[-.11,.64],[.11,.6],[.33,.48]].forEach(([x,h])=>{box(.19,h,.15,RD,x,-2.2-h/2+.25+.2,0,.05);sph(.095,RD,x,-2.2-h+.25+.2+.04,0,1,.7,.8)});
 const th=box(.2,.5,.15,RD,.52,-1.7,0,.05);th.rotation.z=.9;
 for(let r=0;r<3;r++)for(let c=0;c<3;c++){[1,-1].forEach(s=>stud(V3(-.28+c*.28,-1.58-r*.22,.075*s),V3(0,0,s),RD,.05))}
 const T=tex('slap',200,160,(x,w,h)=>{x.translate(w/2,h/2);x.fillStyle='#fff';x.beginPath();for(let i=0;i<20;i++){const a=i*PI/10,r=i%2?44:78;x.lineTo(Math.cos(a)*r*1.2,Math.sin(a)*r*.95)}x.closePath();x.fill();x.lineWidth=5;x.strokeStyle='#1b1b1f';x.stroke();
  x.rotate(-.18);font(x,36);x.lineWidth=7;x.strokeStyle='#1b1b1f';x.strokeText('SLAP!',0,2);x.fillStyle='#e0202a';x.fillText('SLAP!',0,2)});
 plane(.62,.5,T,0,-1.82,.09,0);plane(.62,.5,T,0,-1.82,-.09,PI);return m.G};
B.katana=()=>{const m=Maker(),{cyl,box,tor,stud}=m,K=0x17171b,YE=0xffd02f;
 cyl(.07,.07,.95,K,-.62);[-.35,-.6,-.85].forEach(y=>cyl(.088,.088,.06,GL(0xff3ec8,.7),y));cyl(.13,.13,.07,YE,-.1);
 cyl(.27,.27,.07,YE,-1.15);cyl(.19,.19,.05,K,-1.2);for(let i=0;i<6;i++){const a=i*PI/3;stud(V3(Math.cos(a)*.2,-1.115,Math.sin(a)*.2),V3(0,1,0),YE,.045)}
 const cols=[0x35e6ff,0x2fc4ff,0x4a9bff,0x6a7bff,0x8f62ff,0xb15cff,0xd24dec,0xff3ec8];
 const N=14,L=.17;for(let i=0;i<N;i++){const f=i/(N-1),c=cols[Math.min(cols.length-1,Math.floor(f*cols.length))],w=.2*(1-.45*f**1.6),y=-1.3-i*L-L/2;
  box(w,L*.98,.075,GL(c,.55),0,y,0,.012);
  if(i%2===0)box(w*.38,L*.98,.075,GL(c,.8),w/2+.025,y+L*.5,0,.012);else box(w*.34,L*.98,.075,GL(c,.4),-w/2-.02,y-L*.3,0,.012)}
 box(.1,.17,.075,GL(0xff3ec8,.9),0,-1.3-N*L-.05,0,.012);
 for(let i=0;i<6;i++){const f=i/6;box(.045,.045,.045,GL(i%2?0x35e6ff:0xff3ec8,.9),(i%2?-1:1)*(.15+f*.04),-1.5-f*1.9,.0,.01)}
 return m.G};
B.wrench=()=>{const m=Maker(),{cyl,box,sph,tor,stud}=m,OR=0xf08a1c,OD=0xc96a0c,GR=M(0xb4bac2,{metalness:.5,roughness:.3}),K=0x1b1b1f,DK=0x2c2c33;
 // butt: a flat loop to hang it from
 box(.34,.3,.17,OR,0,-.22,0,.04);cyl(.085,.085,.19,0x8b4a08,-.22,0,0,16).rotation.x=PI/2;
 // handle: a fat orange bar with a black rubber grip and ribs
 box(.3,1.3,.17,OR,0,-1.0,0,.04);box(.35,.82,.21,K,0,-.95,0,.05);for(let i=0;i<6;i++)box(.37,.045,.225,DK,0,-.64-i*.13,0,.01);
 for(let i=0;i<3;i++)stud(V3(0,-.5-i*.04,.105),V3(0,0,1),OR,.05);
 box(.36,.1,.2,OD,0,-.5,0,.03);box(.36,.1,.2,OD,0,-1.4,0,.03);
 // neck and head
 box(.44,.4,.18,OR,0,-1.78,0,.05);box(.7,.6,.2,OR,0,-2.12,0,.06);
 // jaws: a fixed one on the left, a sliding one on the right, a steel worm screw between them
 box(.24,.62,.2,OR,-.27,-2.5,0,.05);box(.2,.46,.2,GR,.3,-2.42,0,.04);box(.1,.2,.2,OD,.3,-2.12,0,.02);
 const sc=cyl(.07,.07,.5,GR,-2.12,.0,.0,14);sc.rotation.z=PI/2;for(let i=0;i<5;i++){const r=tor(.075,.016,0x6e747a,-.2+i*.1,-2.12,0,0,PI/2,0)}
 cyl(.09,.09,.06,GR,-2.12,.34,0,14).rotation.z=PI/2;
 for(let i=0;i<2;i++)stud(V3(-.15+i*.3,-2.43,.105),V3(0,0,1),OR,.045);
 return m.G};
B.bone=()=>{const m=Maker(),{cyl,sph,box,tor,plane}=m,GO=M(0xeab927,{metalness:.3,roughness:.2}),BR=0x6b4a2f;
 cyl(.14,.14,1.6,GO,-1.05);[-1,1].forEach(s=>{sph(.2,GO,s*.14,-.14,0);sph(.28,GO,s*.2,-2.08,0);sph(.12,GO,s*.1,-1.92,0,1.2,1,1.2)});
 [-.75,-.95,-1.15].forEach((y,i)=>{cyl(.165,.165,.1,BR,y);[0,1,2,3].forEach(k=>{const a=k*PI/2+.3;m.stud(V3(Math.cos(a)*.165,y,Math.sin(a)*.165),V3(Math.cos(a),0,Math.sin(a)),i%2?0xe3b92a:0x3a2a1a,.03)})});
 const T=tex('doge',128,128,(x,w)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.fillStyle='#e8b45a';x.beginPath();x.arc(64,70,44,0,7);x.fill();
  x.fillStyle='#e8b45a';x.beginPath();x.moveTo(30,40);x.lineTo(28,8);x.lineTo(54,30);x.fill();x.beginPath();x.moveTo(98,40);x.lineTo(100,8);x.lineTo(74,30);x.fill();
  x.fillStyle='#fbe9c4';x.beginPath();x.ellipse(64,86,26,22,0,0,7);x.fill();x.fillStyle='#17171b';x.beginPath();x.arc(46,62,6,0,7);x.arc(82,62,6,0,7);x.fill();x.beginPath();x.ellipse(64,76,9,6,0,0,7);x.fill();x.lineWidth=3;x.strokeStyle='#17171b';x.beginPath();x.moveTo(64,82);x.lineTo(64,94);x.stroke()});
 plane(.28,.28,T,0,-1.55,.16,0);plane(.28,.28,T,0,-1.55,-.16,PI);return m.G};
B.brain=()=>{const m=Maker(),{cyl,box,sph,mk,tor}=m,K=0x17171b,PK=0xff3ec8,BR=0xf4a6b8,BD=0xe27c95;
 cyl(.085,.085,1.2,K,-.75);[-.3,-.55].forEach(y=>cyl(.105,.105,.07,GL(PK,.6),y));cyl(.13,.13,.07,PK,-.08);cyl(.13,.1,.22,K,-1.45);
 const HY=-2.05;
 [-1,1].forEach(s=>{const a=cyl(.46,.46,.2,K,HY,s*.58,0,28);a.rotation.z=PI/2;const b=cyl(.37,.37,.1,GL(PK,.45),HY,s*.7,0,28);b.rotation.z=PI/2;const c=cyl(.46,.46,.06,0x2c2c33,HY,s*.44,0,28);c.rotation.z=PI/2});
 const g=cyl(.4,.4,.86,M(0xffd0f0,{transparent:true,opacity:.26,roughness:.05,metalness:.1,depthWrite:false}),HY,0,0,28);g.rotation.z=PI/2;
 const bw=sph(1,BR,0,HY,0,.5,.3,.3);const ga=PI*(3-Math.sqrt(5));for(let n=0;n<40;n++){const t=(n+.5)/40,ct=1-2*t,st=Math.sqrt(1-ct*ct),ph=n*ga;sph(.075+.02*(n%3)/2,n%2?BD:BR,.5*.92*ct,HY+.3*.92*st*Math.cos(ph),.3*.92*st*Math.sin(ph))}
 return m.G};
B.sahurbat=()=>{const m=Maker(),{cyl,tor,sph,stud,plane}=m,OD=0x7a3a08,OR=M(0xd9801f,{roughness:.3,metalness:.02}),
 // a baseball bat built like a LEGO model: the barrel and handle are a stack of thin round plates cut to the bat's curve (flared knob, thin handle, long swelling taper into the barrel), printed with wood grain
 WT=tex('sahurwood2',128,256,(x,w,h)=>{if(window.WOODV)WOODV(x,0,0,w,h,63,{base:'#dc8a2a',dark:'#9a5410',light:'#f7b95c',crack:'#6a3306',n:120,knots:0});else{x.fillStyle='#dc8a2a';x.fillRect(0,0,w,h)}}),
 bm=new TH.MeshStandardMaterial({map:WT,roughness:.3,metalness:.02}),
 PR=[[0,.1],[.04,.14],[.12,.14],[.2,.1],[.3,.082],[1.0,.088],[1.2,.105],[1.5,.175],[1.78,.238],[1.98,.262],[2.3,.268],[2.38,.255]], // distance from the butt end, radius
 rad=s=>{for(let i=1;i<PR.length;i++)if(s<=PR[i][0]){const a=PR[i-1],b=PR[i],t=(s-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t}return PR[PR.length-1][1]},
 N=30,L=2.38,h=L/N;
 for(let i=0;i<N;i++){const s0=i*h,s1=s0+h;cyl(rad(s0),rad(s1),h*1.02,bm,-(s0+h/2),0,0,26)}
 // plate seams every few layers, like the joins between stacked LEGO plates
 [.3,.6,.9,1.2,1.5,1.8,2.1].forEach(s=>tor(rad(s)+.004,.007,OD,0,-s,0,PI/2));
 // end cap: a flat round plate with studs on top
 cyl(.262,.262,.07,OR,-2.415,0,0,26);cyl(.12,.12,.045,OR,-2.47,0,0,16);[0,1,2,3,4,5].forEach(i=>{const a=i*PI/3+.3;stud(V3(Math.cos(a)*.17,-2.45,Math.sin(a)*.17),V3(0,-1,0),OR,.055)});
 // a printed 1x2 tile on the barrel with the name, front and back, and a wood knot on the taper
 const LB=tex('sahurlabel',64,256,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,w,h);x.save();x.translate(w/2,h/2);x.rotate(-PI/2);x.fillStyle='#4a2204';x.font='900 40px Impact,Arial Black,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TUNG TUNG TUNG',0,0);x.restore()});
 [0,PI].forEach(ry=>plane(.17,.82,LB,Math.sin(ry)*.275,-2.0,Math.cos(ry)*.275,ry));
 [1,-1].forEach(sg=>{const k=sph(.1,0x6a3306,0,-1.42,sg*.172,1,1.7,.22);k.rotation.x=sg*.28;const k2=sph(.05,0xb86a18,0,-1.42,sg*.185,1,1.6,.15)});
 return m.G};

// ---- signature weapons of the epic and legendary fighters (the same LEGO build language: stacked plates, rounded bricks, studs, printed tiles)
B.sabre=()=>{const m=Maker(),{cyl,box,sph,cone,stud}=m,GO=M(0xe3b92a,{metalness:.35,roughness:.25}),OL=0x4b5a2a,RD=0xc4161c,ST=M(0xd6dde6,{metalness:.55,roughness:.22}),BL=GL(0x6ab7ff,.5);
 // pommel with a red jewel, an olive grip wrapped in gold rings, a flared cross-guard with studs
 sph(.11,GO,0,-.08,0);sph(.055,GL(RD,.7),0,-.08,.1,1,1,.6);sph(.055,GL(RD,.7),0,-.08,-.1,1,1,.6);
 cyl(.07,.07,.82,OL,-.55);[-.3,-.5,-.7].forEach(y=>cyl(.088,.088,.05,GO,y));
 cyl(.12,.1,.1,GO,-1.0);box(.7,.1,.2,GO,0,-1.06,0,.04);[-1,1].forEach(sg=>{const q=cone(.07,.2,GO,sg*.4,-1.06,0,8);q.rotation.z=-sg*PI/2;stud(V3(sg*.18,-1.0,0),V3(0,1,0),GO,.04)});
 box(.34,.2,.2,GO,0,-1.15,0,.05);const gem=sph(.07,GL(RD,.8),0,-1.15,.105,1,1,.5);sph(.07,GL(RD,.8),0,-1.15,-.105,1,1,.5);
 // the curved blade: stacked silver plates that slide sideways a little more with each layer, a glowing fuller down the middle, a spine in gold
 const N=14,Lp=.17;for(let i=0;i<N;i++){const f=i/(N-1),w=.2*(1-.42*f**1.5),x=.16*f*f,y=-1.28-i*Lp-Lp/2;
  box(w,Lp*.98,.075,ST,x,y,0,.012);box(w*.28,Lp*.98,.085,BL,x-.005,y,0,.01);box(.045,Lp*.98,.08,GO,x-w/2-.02,y,0,.01)}
 const tip=cone(.1,.24,ST,.16+.0,-1.28-N*Lp-.1,0,4);tip.rotation.y=PI/4;tip.scale.z=.4;tip.rotation.x=PI;
 return m.G};
B.baton=()=>{const m=Maker(),{cyl,box,tor,stud,ringStuds,plane}=m,YE=0xffd02f,YG=0xe3b92a,GN=0x20d46a,K=0x17171b,DK=0x2c2c33;
 // a black ribbed grip with a green end cap, then a thick yellow shaft built from stacked plates that swells toward the tip, green ring seams, studs
 cyl(.12,.12,.07,GN,-.08);cyl(.075,.075,.78,K,-.5);for(let i=0;i<6;i++)cyl(.088,.088,.035,DK,-.25-i*.12);
 box(.34,.1,.2,YG,0,-.98,0,.04);
 const segs=9,r0=.11,r1=.2,y0=-1.08,h=.2;
 for(let i=0;i<segs;i++){const ra=r0+(r1-r0)*i/segs,rb=r0+(r1-r0)*(i+1)/segs,c=i%2?YG:YE,y=y0-h*(i+.5);cyl(ra,rb,h,c,y);ringStuds(y,(ra+rb)/2+.005,8,i%2?YE:YG,.045)}
 for(let i=1;i<segs;i++){const r=r0+(r1-r0)*i/segs;tor(r+.004,.01,GL(GN,.6),0,y0-h*i,0,PI/2)}
 cyl(.2,.2,.06,GN,y0-h*segs-.03);for(let i=0;i<5;i++){const a=i?(i-1)*PI/2:0,r=i?.11:0;stud(V3(r*Math.cos(a),y0-h*segs-.06,r*Math.sin(a)),V3(0,-1,0),YE,.05)}
 // a printed tile on both sides: a green stock chart and arrow rising
 const T=tex('batonchart',128,128,(x,w,h)=>{x.fillStyle='#10161c';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.lineWidth=5;x.strokeStyle='#20d46a';x.stroke();
  [[28,80,22],[44,70,26],[60,76,20],[76,56,30],[92,44,34]].forEach(([a,b,c],i)=>{x.fillStyle=i===2?'#e0402a':'#20d46a';x.fillRect(a-5,b-c/2,10,c);x.fillRect(a-1,b-c/2-8,2,c+16)});
  x.strokeStyle='#8cffb4';x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(20,96);x.lineTo(50,70);x.lineTo(66,82);x.lineTo(104,30);x.stroke();x.fillStyle='#8cffb4';x.beginPath();x.moveTo(110,22);x.lineTo(112,50);x.lineTo(86,34);x.fill()});
 plane(.3,.3,T,0,-1.78,.215,0);plane(.3,.3,T,0,-1.78,-.215,PI);return m.G};
B.hotline=()=>{const m=Maker(),{cyl,box,tor,stud,plane}=m,PK=0xf2a0b3,PD=0xc9647c,K=0x17171b,DK=0x2c2c33,WH=0xf2f2f2;
 // a black handle with a pink butt and a curly phone cord wound round it
 cyl(.13,.13,.07,PK,-.08);cyl(.075,.075,1.25,K,-.75);for(let i=0;i<9;i++)tor(.085,.014,PD,0,-.3-i*.1,0,PI/2);
 box(.28,.14,.2,PK,0,-1.42,0,.04);
 // the head is a big retro handset: a black bar with two round pink ear and mouth pieces that are the hammer faces
 box(.8,.32,.36,K,0,-1.8,0,.06);[-1,1].forEach(sg=>{const a=cyl(.34,.34,.34,PK,-1.8,sg*.62,0,28);a.rotation.z=PI/2;const b=cyl(.26,.26,.07,K,-1.8,sg*.82,0,28);b.rotation.z=PI/2;const c=cyl(.14,.14,.04,PK,-1.8,sg*.865,0,22);c.rotation.z=PI/2;
  for(let k=0;k<8;k++){const an=k*PI/4;stud(V3(sg*.82,-1.8+Math.cos(an)*.2,Math.sin(an)*.2),V3(sg,0,0),WH,.035)}});
 // keypad: three by three studs on the front and back of the bar, the cord loops down from it
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)[1,-1].forEach(sg=>stud(V3(-.15+c*.15,-1.9+r*.1,.18*sg),V3(0,0,sg),r===1&&c===1?PK:WH,.04));
 tor(.2,.016,PD,0,-1.5,0,PI/2,0,0);
 return m.G};
B.chad=()=>{const m=Maker(),{cyl,box,tor,stud,plane}=m,K=0x17171b,DK=0x2c2c33,GO=M(0xe3b92a,{metalness:.4,roughness:.25}),SI=M(0xb4bac2,{metalness:.6,roughness:.3});
 // a dumbbell on a handle: a knurled black grip with gold rings, a steel bar through the head, stacked weight plates with studs and a printed 45
 cyl(.13,.13,.07,GO,-.08);cyl(.08,.08,1.2,K,-.72);for(let i=0;i<8;i++)cyl(.092,.092,.03,DK,-.3-i*.12);[-.3,-1.1].forEach(y=>cyl(.1,.1,.05,GO,y));
 box(.3,.14,.22,K,0,-1.4,0,.04);
 const HY=-1.8,bar=cyl(.075,.075,1.7,SI,HY);bar.rotation.z=PI/2;
 const T=tex('plate45',128,128,(x,w,h)=>{x.fillStyle='#232329';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.lineWidth=6;x.strokeStyle='#e3b92a';x.beginPath();x.arc(64,64,54,0,7);x.stroke();font(x,52);x.fillStyle='#e3b92a';x.fillText('45',64,60);font(x,18);x.fillStyle='#b4bac2';x.fillText('LB',64,100)});
 [-1,1].forEach(sg=>{const a=cyl(.5,.5,.18,DK,HY,sg*.45,0,32);a.rotation.z=PI/2;const b=cyl(.4,.4,.16,K,HY,sg*.62,0,32);b.rotation.z=PI/2;const c=cyl(.12,.12,.1,GO,HY,sg*.78,0,18);c.rotation.z=PI/2;
  const t=tor(.5,.025,GO,sg*.54,HY,0,0,PI/2,0);
  for(let k=0;k<8;k++){const an=k*PI/4+.2;stud(V3(sg*.7,HY+Math.cos(an)*.3,Math.sin(an)*.3),V3(sg,0,0),GO,.045)}
  plane(.5,.5,T,sg*.72,HY,0,sg*PI/2)});
 return m.G};
B.mallet=()=>{const m=Maker(),{cyl,box,sph,stud,plane,tor}=m,RD=M(0xd91f26,{roughness:.22}),RD2=0xa8141a,WH=0xf2f2f2,K=0x17171b,YE=0xffd02f;
 // a white handle with red rings, a squeaker on top of a fat red head with white end caps printed with the troll face
 sph(.13,RD,0,-.08,0);cyl(.075,.075,1.2,WH,-.75);[-.3,-.6,-.9,-1.2].forEach((y,i)=>cyl(.09,.09,.06,i%2?K:RD,y));
 box(.3,.14,.22,RD2,0,-1.4,0,.04);
 const HY=-1.8,h=cyl(.4,.4,1.05,RD,HY,0,0,32);h.rotation.z=PI/2;
 [-1,1].forEach(sg=>{const c=cyl(.43,.43,.09,WH,HY,sg*.57,0,32);c.rotation.z=PI/2;const t=tor(.4,.03,RD2,sg*.5,HY,0,0,PI/2,0)});
 [-.3,-.1,.1,.3].forEach(x=>stud(V3(x,HY+.4,0),V3(0,1,0),RD2,.055));cyl(.11,.11,.2,YE,HY+.52,0,0,16);sph(.09,YE,0,HY+.64,0,1,.7,1);
 const T=tex('trollmm',128,128,(x,w)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.lineWidth=4;x.strokeStyle='#17171b';x.stroke();
  x.fillStyle='#17171b';x.beginPath();x.arc(42,46,8,0,7);x.arc(86,46,8,0,7);x.fill();x.lineWidth=5;x.beginPath();x.moveTo(36,34);x.lineTo(52,28);x.moveTo(92,34);x.lineTo(76,28);x.stroke();
  x.beginPath();x.moveTo(26,70);x.quadraticCurveTo(64,126,102,70);x.quadraticCurveTo(64,84,26,70);x.fill();x.fillStyle='#fff';for(let i=0;i<6;i++)x.fillRect(34+i*10,76+(i%3===1?4:0),7,9)});
 plane(.74,.74,T,.625,HY,0,PI/2);plane(.74,.74,T,-.625,HY,0,-PI/2);
 return m.G};

// ---- round 11: ten more weapons from the "New Melee Weapons" sheet (same build language: stacked plates, rounded bricks, studs, printed tiles)
const SG=M(0xb4bac2,{metalness:.5,roughness:.3});
B.crowbar=()=>{const m=Maker(),{box,stud}=m,RD=0xd91f26,RD2=0xa8141a,GR=M(0x9aa0a8,{metalness:.45,roughness:.3}),DK=0x2c2c33,N=11,L=.2;
 // a long bar of stacked red plates with grey bands and studs; a small claw on the butt and a bent hook at the tip
 for(let i=0;i<N;i++){const y=-.3-i*L-L/2,band=i%4===3;box(.2,L*.98,.2,band?GR:(i%2?RD2:RD),0,y,0,.03);if(!band){stud(V3(0,y,.1),V3(0,0,1),i%2?RD:RD2,.045);stud(V3(0,y,-.1),V3(0,0,-1),i%2?RD:RD2,.045)}}
 box(.22,.2,.22,GR,0,-.2,0,.03);box(.3,.12,.22,GR,0,-.06,0,.03); // flat chisel end on the butt
 // the pry end: the bar bends round in a curve and ends in a flat split claw
 const y0=-.3-N*L,R=.62,A=1.75;box(.24,.14,.22,DK,0,y0-.04,0,.03);
 for(let i=0;i<6;i++){const a=PI+(i+.5)/6*A,len=R*A/6*1.12;box(.2,len,.22,i%2?RD:RD2,R+R*Math.cos(a),y0+R*Math.sin(a),0,.03).rotation.z=a}
 const ae=PI+A,ex=R+R*Math.cos(ae),ey=y0+R*Math.sin(ae);box(.26,.24,.22,GR,ex-.1,ey+.1,0,.03).rotation.z=ae;
 [-1,1].forEach(s=>box(.09,.3,.2,GR,ex-.18+s*.0,ey+.26+(s>0?.0:0),s*.07,.02).rotation.z=ae+s*.18);
 return m.G};
B.shovel=()=>{const m=Maker(),{cyl,box}=m,Y=0xffd02f,K=0x1b1b1f,BL=0x2f6bff,CY=GL(0x35e6ff,.9),GR=M(0xb4bac2,{metalness:.5,roughness:.3}),GD=M(0x8a929c,{metalness:.5,roughness:.35});
 // a D-grip, a handle of yellow and black bricks with blue connectors, and a pointed steel blade with a glowing core and sparks
 box(.46,.12,.18,K,0,-.08,0,.04);[-1,1].forEach(s=>box(.12,.3,.18,K,s*.17,-.2,0,.03));
 for(let i=0;i<9;i++)cyl(.085,.085,.2,i%2?Y:K,-.5-i*.2);[-.4,-1.2,-2.0].forEach(y=>cyl(.11,.11,.08,BL,y));
 box(.5,.22,.22,BL,0,-2.35,0,.04);
 [[.86,-2.58],[.86,-2.74],[.78,-2.9],[.66,-3.06],[.5,-3.2],[.34,-3.32],[.18,-3.42]].forEach(([w,y],i)=>box(w,.16,.14,i%2?GR:GD,0,y,0,.02));
 box(.16,.9,.17,CY,0,-2.95,0,.02);[-1,1].forEach(s=>box(.06,.62,.15,GL(0x2f6bff,.9),s*.3,-2.88,0,.01));
 [[.5,-2.7,.5],[.62,-3.0,-.4],[-.5,-2.8,.3],[-.55,-3.1,-.5],[.2,-3.5,.2],[-.2,-3.45,-.3]].forEach(([x,y,r])=>{box(.05,.34,.05,GL(0x9cf6ff,1.2),x,y,.1,.01).rotation.z=r;box(.05,.3,.05,GL(0x9cf6ff,1.2),x,y,-.1,.01).rotation.z=-r});
 return m.G};
B.tongs=()=>{const m=Maker(),{cyl,box,cone,tor,plane}=m,RD=0xd91f26,RD2=0xa8141a,K=0x17171b,DK=0x2c2c33,YE=0xffd02f;
 // a ribbed black grip, a coil spring, a red housing with a hazard sign and two toothed jaws
 cyl(.12,.12,.07,SG,-.08);box(.26,1.15,.2,K,0,-.7,0,.04);for(let i=0;i<6;i++)box(.3,.05,.22,DK,0,-.35-i*.14,0,.01);
 box(.3,.1,.22,RD2,0,-1.3,0,.03);cyl(.07,.07,.34,SG,-1.52);for(let i=0;i<5;i++)tor(.1,.02,YE,0,-1.4-i*.07,0,PI/2);
 box(.5,.4,.3,RD,0,-1.86,0,.05);
 const T=tex('hazard',128,128,x=>{x.fillStyle='#ffd02f';x.beginPath();x.moveTo(64,10);x.lineTo(118,108);x.lineTo(10,108);x.closePath();x.fill();x.lineWidth=8;x.strokeStyle='#17171b';x.lineJoin='round';x.stroke();x.fillStyle='#17171b';x.fillRect(58,44,12,38);x.fillRect(58,90,12,12)});
 plane(.32,.32,T,0,-1.86,.155,0);plane(.32,.32,T,0,-1.86,-.155,PI);
 [-1,1].forEach(s=>{box(.2,.5,.24,RD,s*.22,-2.22,0,.04).rotation.z=s*.35;box(.2,.5,.24,RD2,s*.4,-2.62,0,.04).rotation.z=-s*.1;box(.18,.4,.24,RD,s*.3,-3.0,0,.04).rotation.z=-s*.5;
  for(let k=0;k<4;k++){const c=cone(.05,.17,SG,s*(.27-k*.02),-2.45-k*.16,0,6);c.rotation.z=s*PI/2}});
 return m.G};
B.nunchucks=()=>{const m=Maker(),{cyl,box,tor}=m,K=0x17171b,MG=0xff3ec8,CY=0x35e6ff;
 // two black sticks with neon windows and rings, joined by a steel chain
 const stick=(y0,f)=>{cyl(.11,.11,.08,GL(f?CY:MG,1),y0-.04);for(let i=0;i<4;i++){const y=y0-.2-i*.26,c=(i+f)%2?CY:MG;cyl(.1,.1,.24,K,y);box(.13,.13,.24,GL(c,.9),0,y,0,.02);tor(.105,.018,GL(c,.8),0,y+.13,0,PI/2)}cyl(.11,.11,.08,GL(f?MG:CY,1),y0-1.28)};
 stick(-.05,0);for(let k=0;k<4;k++)tor(.065,.02,SG,0,-1.38-k*.1,0,0,k%2?PI/2:0,0);stick(-1.72,1);
 return m.G};
B.rammer=()=>{const m=Maker(),{cyl,sph,cone,ringStuds}=m,GO=M(0xe3b92a,{metalness:.4,roughness:.25}),GO2=M(0xb88a14,{metalness:.35,roughness:.3}),RD=0xc4161c,WH=0xf2f2f2,BL=GL(0x35a8ff,.7),RJ=GL(0xff3030,.8);
 // a red and white handle with gold rings, a flared gold cup and a big crown as the striking head
 sph(.12,GO,0,-.08,0);cyl(.08,.08,1.3,WH,-.8);[-.35,-.65,-.95,-1.25].forEach((y,i)=>cyl(.095,.095,.1,i%2?GO:RD,y));
 cyl(.12,.3,.3,GO,-1.6);cyl(.3,.3,.08,GO2,-1.78);
 const HY=-2.18;cyl(.44,.44,.34,GO,HY,0,0,30);ringStuds(HY+.0,.45,12,GO2,.05);cyl(.46,.46,.06,RD,HY+.12,0,0,30);cyl(.46,.46,.06,RD,HY-.12,0,0,30);
 sph(.36,M(RD,{roughness:.5}),0,HY-.26,0,1,.7,1);
 for(let i=0;i<7;i++){const a=i*PI*2/7,x=Math.cos(a)*.4,z=Math.sin(a)*.4,c=cone(.11,.4,GO,x,HY-.34,z,8);c.rotation.x=PI;sph(.07,i%2?BL:RJ,x,HY-.58,z)}
 return m.G};
B.racket=()=>{const m=Maker(),{cyl,box,sph,cone,stud,tor}=m,RD=0xd91f26,WH=0xf2f2f2,BL=0x2f6bff,K=0x17171b,DK=0x2c2c33,FL=GL(0xff9a1c,1),FL2=GL(0xffe14a,1);
 // a striped grip, a white throat, a ring of red and white bricks strung with a net, a tennis ball with studs, and a rocket on each side of the handle
 cyl(.12,.12,.07,K,-.08);[WH,RD,WH,RD,WH].forEach((c,i)=>cyl(.08,.08,.2,c,-.25-i*.2));
 [-1,1].forEach(s=>box(.1,.55,.14,WH,s*.17,-1.55,0,.03).rotation.z=s*.42);
 const cy=-2.6,rx=.62,ry=.78,N=28;
 for(let i=0;i<N;i++){const a=i*PI*2/N+.05;box(.2,.2,.17,i%2?RD:WH,rx*Math.cos(a),cy+ry*Math.sin(a),0,.04).rotation.z=Math.atan2(ry*Math.cos(a),-rx*Math.sin(a))}
 for(let x=-.4;x<=.41;x+=.2){const h=2*ry*Math.sqrt(1-(x/rx)**2)-.14;box(.03,h,.03,WH,x,cy,0,.005)}
 for(let y=-.6;y<=.61;y+=.2){const w=2*rx*Math.sqrt(1-(y/ry)**2)-.14;box(w,.03,.03,WH,0,cy+y,0,.005)}
 sph(.22,0xb5e61d,.05,cy+.12,.17);tor(.215,.014,WH,.05,cy+.12,.17,0,PI/2,.6);for(let k=0;k<5;k++){const a=k*PI*2/5;stud(V3(.05+Math.cos(a)*.12,cy+.12+Math.sin(a)*.12,.37-.2),V3(0,0,1),0x9ac81a,.04)}
 [-1,1].forEach(s=>{cyl(.1,.12,.8,K,-.95,s*.27,0,18);cyl(.125,.125,.1,RD,-.58,s*.27,0,18);cyl(.125,.125,.1,WH,-1.2,s*.27,0,18);cone(.1,.36,FL,s*.27,-.35,0,10);cone(.055,.28,FL2,s*.27,-.32,0,8)});
 return m.G};
B.mememace=()=>{const m=Maker(),{cyl,sph,cone,plane}=m,K=0x17171b,PK=0xff3ec8,YE=0xffd02f,PAL=[0xff3ec8,0xffd02f,0x35e6ff,0x20d46a,0x2f6bff,0xe0402a,0x8f62ff,0xf2f2f2];
 // a black handle with neon rings, a spiky ball built of colourful bricks with a shades emoji, a doge badge and a BONK tag
 sph(.12,GL(PK,.5),0,-.08,0);cyl(.08,.08,1.3,K,-.8);[-.3,-.6,-.9,-1.2].forEach((y,i)=>cyl(.095,.095,.07,i%2?YE:PK,y));cyl(.13,.2,.2,YE,-1.55);
 const HY=-2.2,R=.52,BT=tex('memeball',256,128,(x,w,h)=>{for(let i=0;i<16;i++)for(let j=0;j<8;j++){const k=Math.floor((Math.sin(i*12.9898+j*78.233)*43758.5453%1+1)%1*PAL.length);x.fillStyle='#'+PAL[k].toString(16).padStart(6,'0');x.fillRect(i*16,j*16,16,16);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;x.strokeRect(i*16+1,j*16+1,14,14)}});
 sph(R,new TH.MeshStandardMaterial({map:BT,roughness:.35}),0,HY,0);
 const ga=PI*(3-Math.sqrt(5));for(let i=0;i<30;i++){const t=(i+.5)/30,cy=1-2*t,s=Math.sqrt(1-cy*cy),a=i*ga,d=V3(s*Math.cos(a),cy,s*Math.sin(a));if(cy>.8||Math.abs(d.z)>.82||Math.abs(d.x)>.82)continue;
  const sp=cone(.09,.34,PAL[i%PAL.length],d.x*(R+.1),HY+d.y*(R+.1),d.z*(R+.1),8);sp.quaternion.setFromUnitVectors(V3(0,1,0),d)}
 const EM=tex('shades',128,128,x=>{x.fillStyle='#ffd02f';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.lineWidth=5;x.strokeStyle='#17171b';x.stroke();x.fillStyle='#17171b';x.fillRect(14,44,100,22);x.fillRect(58,40,12,10);x.lineWidth=7;x.beginPath();x.arc(64,76,28,.2,PI-.2);x.stroke();x.fillStyle='#fff';x.fillRect(22,48,22,6)});
 const DG=tex('dogebadge',128,128,x=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.lineWidth=5;x.strokeStyle='#17171b';x.stroke();x.fillStyle='#e8b45a';x.beginPath();x.arc(64,70,42,0,7);x.fill();x.beginPath();x.moveTo(30,40);x.lineTo(28,8);x.lineTo(54,30);x.fill();x.beginPath();x.moveTo(98,40);x.lineTo(100,8);x.lineTo(74,30);x.fill();x.fillStyle='#fbe9c4';x.beginPath();x.ellipse(64,86,26,20,0,0,7);x.fill();x.fillStyle='#17171b';x.beginPath();x.arc(46,62,6,0,7);x.arc(82,62,6,0,7);x.fill();x.beginPath();x.ellipse(64,76,9,6,0,0,7);x.fill()});
 const BK=tex('bonktag',200,100,(x,w,h)=>{x.fillStyle='#e0202a';x.fillRect(4,16,w-8,h-32);x.lineWidth=6;x.strokeStyle='#fff';x.strokeRect(4,16,w-8,h-32);font(x,46);x.fillStyle='#fff';x.fillText('BONK',w/2,h/2+2)});
 plane(.5,.5,EM,0,HY,R+.005,0);plane(.5,.5,EM,0,HY,-R-.005,PI);plane(.42,.42,DG,R+.005,HY,0,PI/2);plane(.5,.25,BK,-R-.005,HY,0,-PI/2);
 return m.G};
B.pike=()=>{const m=Maker(),{cyl,cone,tor,box}=m,K=0x17171b,Y=0xffd02f,CY=GL(0x35e6ff,.9),PU=GL(0x8f62ff,.75),BL=GL(0x4a9bff,.9);
 // a long shaft of black and yellow plates with glowing rings, two floating portal rings and a crystal blade
 cone(.09,.3,CY,0,.05,0,6);for(let i=0;i<10;i++)cyl(.075,.075,.3,i%2?Y:K,-.2-i*.3,0,0,16);
 [-.5,-1.1,-1.7,-2.3].forEach(y=>tor(.098,.02,CY,0,y,0,PI/2));
 tor(.3,.035,GL(0x35e6ff,1),0,-2.65,0,PI/2);tor(.22,.03,GL(0x8f62ff,1),0,-2.95,0,PI/2);tor(.16,.025,GL(0x35e6ff,1),0,-3.2,0,PI/2);
 cyl(.15,.1,.14,Y,-3.42);const PU2=M(0x7b4dff,{emissive:0x5a2bd6,emissiveIntensity:.55,roughness:.3});const hd=cone(.24,.9,PU2,0,-3.95,0,4);hd.rotation.x=PI;hd.rotation.y=PI/4;hd.scale.z=.45;
 const hi=cone(.12,.7,BL,0,-3.9,0,4);hi.rotation.x=PI;hi.rotation.y=PI/4;hi.scale.z=.8;
 [-1,1].forEach(s=>{const w=cone(.1,.34,PU2,s*.2,-3.55,0,4);w.rotation.z=s*.9;w.rotation.y=PI/4;w.scale.z=.45});
 return m.G};
B.gavel=()=>{const m=Maker(),{cyl,box,stud,plane,tor}=m,BL=0x2f6bff,BD=0x1f4ec4,GO=M(0xe3b92a,{metalness:.4,roughness:.25}),GO2=M(0xb88a14,{metalness:.35,roughness:.3}),WH=0xf2f2f2,K=0x17171b,YE=0xffd02f,LG=GL(0xffe14a,1.2);
 // a blue, black and yellow handle, a big barrel head with gold gear caps, a white band printed with a crown shield, and lightning
 cyl(.13,.13,.07,GO,-.08);cyl(.085,.085,1.3,K,-.8);[-.35,-.65,-.95,-1.25].forEach((y,i)=>cyl(.1,.1,.1,i%2?YE:BL,y));box(.34,.14,.24,BD,0,-1.55,0,.04);
 const HY=-2.12,hd=cyl(.5,.5,1.0,BL,HY,0,0,32);hd.rotation.z=PI/2;
 [-1,1].forEach(s=>{const a=cyl(.57,.57,.14,GO,HY,s*.58,0,32);a.rotation.z=PI/2;const b=cyl(.42,.42,.1,GO2,HY,s*.68,0,32);b.rotation.z=PI/2;const c=cyl(.16,.16,.08,BD,HY,s*.74,0,18);c.rotation.z=PI/2;
  for(let k=0;k<10;k++){const an=k*PI/5+.1;stud(V3(s*.66,HY+Math.cos(an)*.5,Math.sin(an)*.5),V3(s*.2,Math.cos(an),Math.sin(an)),GO,.05)}});
 const bd=cyl(.52,.52,.34,WH,HY,0,0,32);bd.rotation.z=PI/2;
 const T=tex('crest',128,128,(x)=>{x.fillStyle='#f2f2f2';x.fillRect(0,0,128,128);x.fillStyle='#1f4ec4';x.beginPath();x.moveTo(20,16);x.lineTo(108,16);x.lineTo(108,70);x.quadraticCurveTo(64,128,64,120);x.quadraticCurveTo(64,128,20,70);x.closePath();x.fill();x.lineWidth=6;x.strokeStyle='#e3b92a';x.stroke();
  x.fillStyle='#ffd02f';x.beginPath();x.moveTo(38,70);x.lineTo(34,36);x.lineTo(52,52);x.lineTo(64,30);x.lineTo(76,52);x.lineTo(94,36);x.lineTo(90,70);x.closePath();x.fill();x.fillRect(38,72,52,10)});
 plane(.52,.52,T,0,HY,.525,0);plane(.52,.52,T,0,HY,-.525,PI);
 [-.3,0,.3].forEach(x=>stud(V3(x,HY+.5,0),V3(0,1,0),GO,.055));
 [[.95,0],[-.95,PI]].forEach(([x,r])=>{for(let k=0;k<3;k++){const b=box(.05,.3,.05,LG,x+(k%2?.07:-.07),HY+.35-k*.3,0,.01);b.rotation.z=k%2?.6:-.6}});
 [[.25,-2.75,.5],[-.2,-2.8,-.5]].forEach(([x,y,r])=>box(.05,.32,.05,LG,x,y,.5,.01).rotation.z=r);
 return m.G};
B.scythe=()=>{const m=Maker(),{box}=m,K=0x17171b,MG=0xff3ec8,CY=0x35e6ff,PU=0x8f62ff,rnd=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
 // a shaft of pixel cubes with glitching colours, and a crescent blade of glowing pixels fading from magenta to cyan, with debris
 for(let i=0;i<13;i++){const y=-.15-i*.2,c=i%5===2?GL(MG,.8):i%5===4?GL(CY,.8):K;box(.15,.2,.15,c,(rnd(i)-.5)*.06,y,(rnd(i+9)-.5)*.06,.012)}
 const R=1.2,y0=-2.95,N=13;for(let i=0;i<N;i++){const a=(i+.5)/N*1.6,len=R*1.6/N*1.08,th=.28*(1-.8*(i/N)**1.3),f=i/(N-1),c=f<.35?MG:f<.7?PU:CY;box(len,th,.1,GL(c,.5),R*Math.sin(a),y0+R*(1-Math.cos(a)),0,.01).rotation.z=a}
 box(.28,.3,.15,K,0,y0+.02,0,.02);
 [[.5,-3.4,.12],[1.2,-3.0,.1],[.9,-3.55,.08],[-.25,-3.3,.1],[1.28,-2.2,.09],[.2,-3.65,.07]].forEach(([x,y,s],i)=>box(s,s,s,GL(i%2?CY:MG,.9),x,y,(rnd(i+3)-.5)*.2,.005));
 return m.G};

// ---- flat icons for the picker cards and the hotbar (the 3D models above are what you hold in the match)
const SV={
 crowbar:'<rect x="21" y="12" width="6" height="30" rx="2" fill="#d91f26"/><rect x="21" y="22" width="6" height="4" fill="#9aa0a8" stroke="none"/><rect x="21" y="32" width="6" height="4" fill="#9aa0a8" stroke="none"/><path d="M21 42l-1 5h10l3-7-4-1-2 3z" fill="#9aa0a8"/><path d="M21 12q0-8 8-9l1 5q-4 0-4 4z" fill="#9aa0a8"/>',
 shovel:'<rect x="21" y="22" width="6" height="24" rx="2" fill="#ffd02f"/><rect x="21" y="30" width="6" height="4" fill="#1b1b1f" stroke="none"/><rect x="21" y="38" width="6" height="4" fill="#1b1b1f" stroke="none"/><path d="M10 4h28v8L24 24 10 12z" fill="#b4bac2"/><path d="M24 6v14" stroke="#35e6ff" stroke-width="3"/><path d="M8 2l5 6-4 1 5 6" stroke="#35e6ff" stroke-width="1.4" fill="none"/>',
 tongs:'<rect x="21" y="26" width="6" height="20" rx="2" fill="#17171b"/><rect x="17" y="22" width="14" height="8" rx="2" fill="#d91f26"/><path d="M17 22L8 14 7 3l6 3 3 8zM31 22l9-8 1-11-6 3-3 8z" fill="#d91f26"/><path d="M12 6l3 4M36 6l-3 4M10 10l4 2M38 10l-4 2" stroke="#b4bac2" stroke-width="2.4"/>',
 nunchucks:'<rect x="9" y="3" width="7" height="22" rx="2" fill="#17171b" transform="rotate(-14 12 14)"/><rect x="31" y="23" width="7" height="22" rx="2" fill="#17171b" transform="rotate(-14 34 34)"/><rect x="11" y="8" width="3" height="4" fill="#ff3ec8" stroke="none" transform="rotate(-14 12 14)"/><rect x="33" y="30" width="3" height="4" fill="#35e6ff" stroke="none" transform="rotate(-14 34 34)"/><path d="M15 24q8 2 18 0" stroke="#b4bac2" stroke-width="2" fill="none"/>',
 rammer:'<rect x="22" y="22" width="4" height="24" rx="1" fill="#f2f2f2"/><rect x="21" y="32" width="6" height="4" fill="#c4161c" stroke="none"/><path d="M10 22V8l6 6 4-9 4 9 4-9 4 9 6-6v14z" fill="#e3b92a"/><rect x="10" y="18" width="28" height="5" fill="#c4161c"/>',
 racket:'<rect x="22" y="32" width="4" height="14" rx="1" fill="#f2f2f2"/><rect x="22" y="38" width="4" height="3" fill="#d91f26" stroke="none"/><ellipse cx="24" cy="16" rx="13" ry="14" fill="#fff" stroke="#d91f26" stroke-width="3.5"/><path d="M14 10h20M13 17h22M15 24h18M19 4v24M24 3v26M29 4v24" stroke="#999" stroke-width="1"/><circle cx="26" cy="15" r="5" fill="#b5e61d"/>',
 mememace:'<rect x="22" y="26" width="4" height="20" rx="1" fill="#17171b"/><rect x="21" y="34" width="6" height="3" fill="#ff3ec8" stroke="none"/><path d="M24 1l3 6M40 6l-6 4M46 18l-7 1M5 6l6 4M2 18l7 1M24 1l-3 6" stroke="#35e6ff" stroke-width="3"/><circle cx="24" cy="17" r="12" fill="#ffd02f"/><rect x="15" y="14" width="18" height="5" fill="#17171b"/><path d="M17 23q7 5 14 0" fill="none"/>',
 pike:'<rect x="22" y="22" width="4" height="26" rx="1" fill="#17171b"/><rect x="22" y="32" width="4" height="4" fill="#ffd02f" stroke="none"/><path d="M24 0l8 14-8 8-8-8z" fill="#8f62ff"/><path d="M24 4l4 10-4 4-4-4z" fill="#4a9bff" stroke="none"/><ellipse cx="24" cy="29" rx="9" ry="3" fill="none" stroke="#35e6ff" stroke-width="2.4"/>',
 gavel:'<rect x="22" y="22" width="4" height="24" rx="1" fill="#17171b"/><rect x="21" y="32" width="6" height="4" fill="#ffd02f" stroke="none"/><rect x="7" y="4" width="34" height="17" rx="4" fill="#2f6bff"/><rect x="3" y="3" width="7" height="19" rx="2" fill="#e3b92a"/><rect x="38" y="3" width="7" height="19" rx="2" fill="#e3b92a"/><rect x="19" y="4" width="10" height="17" fill="#f2f2f2"/><path d="M42 0l-4 6 5 1-4 6" stroke="#ffe14a" stroke-width="2" fill="none"/>',
 scythe:'<rect x="22" y="14" width="4" height="32" rx="1" fill="#17171b"/><rect x="22" y="24" width="4" height="4" fill="#ff3ec8" stroke="none"/><rect x="22" y="34" width="4" height="4" fill="#35e6ff" stroke="none"/><path d="M24 14C40 12 44 2 40 0 36 8 30 8 22 8z" fill="#ff3ec8"/><path d="M40 0c4 2 4 10-2 14l-4-4c4-2 6-6 6-10z" fill="#35e6ff" stroke="none"/><rect x="34" y="18" width="3" height="3" fill="#35e6ff" stroke="none"/>',
 mallet:'<rect x="22" y="20" width="4" height="26" rx="1" fill="#f2f2f2"/><rect x="21" y="30" width="6" height="4" fill="#d91f26" stroke="none"/><rect x="8" y="4" width="32" height="16" rx="5" fill="#d91f26"/><rect x="5" y="5" width="6" height="14" rx="2" fill="#f2f2f2"/><rect x="37" y="5" width="6" height="14" rx="2" fill="#f2f2f2"/><circle cx="24" cy="2" r="3" fill="#ffd02f" stroke="none"/>',
 chad:'<rect x="22" y="22" width="4" height="24" rx="1" fill="#17171b"/><rect x="20" y="38" width="8" height="4" fill="#e3b92a" stroke="none"/><rect x="12" y="10" width="24" height="5" fill="#b4bac2"/><rect x="5" y="3" width="8" height="19" rx="2" fill="#2c2c33"/><rect x="35" y="3" width="8" height="19" rx="2" fill="#2c2c33"/><rect x="1" y="7" width="5" height="11" rx="1" fill="#17171b"/><rect x="42" y="7" width="5" height="11" rx="1" fill="#17171b"/>',
 hotline:'<rect x="22" y="20" width="4" height="26" rx="1" fill="#17171b"/><rect x="20" y="40" width="8" height="5" fill="#f2a0b3" stroke="none"/><rect x="9" y="5" width="30" height="13" rx="3" fill="#17171b"/><circle cx="9" cy="11" r="7" fill="#f2a0b3"/><circle cx="39" cy="11" r="7" fill="#f2a0b3"/><circle cx="24" cy="11" r="2" fill="#f2f2f2" stroke="none"/>',
 baton:'<rect x="21" y="30" width="6" height="16" rx="2" fill="#17171b"/><rect x="19" y="43" width="10" height="4" rx="1" fill="#20d46a"/><rect x="20" y="22" width="8" height="9" rx="1" fill="#ffd02f"/><rect x="19" y="14" width="10" height="9" rx="1" fill="#e3b92a"/><rect x="18" y="6" width="12" height="9" rx="1" fill="#ffd02f"/><rect x="17" y="1" width="14" height="6" rx="2" fill="#20d46a"/><path d="M20 20l4-4 3 2 4-5" fill="none" stroke="#17171b" stroke-width="2"/>',
 sabre:'<rect x="22" y="36" width="4" height="10" rx="1" fill="#4b5a2a"/><rect x="13" y="32" width="22" height="5" rx="2" fill="#e3b92a"/><path d="M21 32V8q4-8 8-8l-1 10v22z" fill="#d6dde6"/><path d="M23 30V8" stroke="#6ab7ff" stroke-width="2"/><circle cx="24" cy="44" r="3" fill="#c4161c" stroke="none"/>',
 hammer:'<rect x="21" y="14" width="6" height="32" rx="2" fill="#8b5a2b"/><rect x="20" y="30" width="8" height="3" fill="#ffd02f"/><rect x="8" y="4" width="32" height="14" rx="3" fill="#9aa0a6"/><rect x="4" y="5" width="7" height="12" rx="2" fill="#e3000b"/><rect x="37" y="5" width="7" height="12" rx="2" fill="#e3000b"/>',
 bat:'<rect x="21" y="26" width="6" height="20" rx="2" fill="#1b1b1f"/><rect x="19" y="40" width="10" height="4" rx="1" fill="#ffd02f"/><rect x="18" y="20" width="12" height="8" rx="1" fill="#ffd02f"/><rect x="17" y="13" width="14" height="8" rx="1" fill="#2f6bff"/><rect x="16" y="6" width="16" height="8" rx="1" fill="#ffd02f"/><rect x="15" y="1" width="18" height="6" rx="2" fill="#2f6bff"/><circle cx="24" cy="10" r="3" fill="#1b1b1f" stroke="none"/>',
 ban:'<rect x="22" y="18" width="4" height="28" rx="1" fill="#17171b"/><rect x="20" y="40" width="8" height="4" fill="#d91f26"/><rect x="6" y="3" width="36" height="17" rx="3" fill="#17171b"/><rect x="3" y="4" width="7" height="15" rx="2" fill="#9aa0a8"/><rect x="38" y="4" width="7" height="15" rx="2" fill="#9aa0a8"/><path d="M24 6l7 11H17z" fill="#ff2a2a" stroke="none"/><rect x="23" y="9" width="2" height="4" fill="#17171b" stroke="none"/>',
 crown:'<rect x="21" y="22" width="6" height="24" rx="2" fill="#d4af37"/><rect x="21" y="30" width="6" height="4" fill="#c4161c" stroke="none"/><rect x="21" y="38" width="6" height="4" fill="#f2f2f2" stroke="none"/><circle cx="24" cy="14" r="10" fill="#e3b92a"/><path d="M24 0l3 5h-6zM12 5l5 3-3 4zM36 5l-5 3 3 4zM8 15l5-1v5zM40 15l-5-1v5z" fill="#e3b92a"/><circle cx="19" cy="13" r="2.2" fill="#c4161c" stroke="none"/><circle cx="29" cy="13" r="2.2" fill="#c4161c" stroke="none"/>',
 paddle:'<rect x="21" y="26" width="6" height="20" rx="2" fill="#f2f2f2"/><rect x="21" y="32" width="6" height="4" fill="#1b1b1f" stroke="none"/><rect x="21" y="40" width="6" height="4" fill="#d91f26" stroke="none"/><rect x="9" y="3" width="30" height="25" rx="5" fill="#d91f26"/><path d="M24 7l2 5 5-1-3 4 4 3-5 0 0 5-3-4-3 4 0-5-5 0 4-3-3-4 5 1z" fill="#fff" stroke="none"/>',
 katana:'<rect x="22" y="33" width="4" height="13" rx="1" fill="#17171b"/><rect x="14" y="30" width="20" height="4" rx="2" fill="#ffd02f"/><path d="M21 30V6l3-5 3 5v24z" fill="#35e6ff"/><path d="M24 1l3 5v24h-3z" fill="#ff3ec8" stroke="none"/><path d="M21 22h6M21 14h6" stroke="#000" stroke-width="1"/>',
 wrench:'<rect x="21" y="18" width="6" height="28" rx="2" fill="#f08a1c"/><rect x="21" y="30" width="6" height="5" fill="#1b1b1f" stroke="none"/><path d="M14 18V8l4-5h5l1 5 3 0 1-5h5l4 5v10l-6 4H20z" fill="#f08a1c"/><circle cx="24" cy="38" r="0" fill="none"/>',
 bone:'<rect x="20" y="10" width="8" height="30" fill="#eab927"/><circle cx="19" cy="9" r="6" fill="#eab927"/><circle cx="29" cy="9" r="6" fill="#eab927"/><circle cx="19" cy="41" r="6" fill="#eab927"/><circle cx="29" cy="41" r="6" fill="#eab927"/><rect x="20" y="22" width="8" height="5" fill="#6b4a2f" stroke="none"/><circle cx="24" cy="24" r="2" fill="#fff" stroke="none"/>',
 brain:'<rect x="22" y="22" width="4" height="24" rx="1" fill="#17171b"/><rect x="20" y="36" width="8" height="3" fill="#ff3ec8" stroke="none"/><rect x="5" y="3" width="8" height="20" rx="2" fill="#17171b"/><rect x="35" y="3" width="8" height="20" rx="2" fill="#17171b"/><rect x="12" y="6" width="24" height="14" rx="3" fill="#ffd0f0" fill-opacity=".5"/><ellipse cx="24" cy="13" rx="9" ry="5.5" fill="#f4a6b8"/><path d="M18 11q3-3 6 0t6 0M18 15q3 3 6 0t6 0" fill="none" stroke="#c76585" stroke-width="1.4"/>',
 sahurbat:'<path d="M22 46q-2 0-2-2v-4q0-2 2-2h4q2 0 2 2v4q0 2-2 2z" fill="#d9801f"/><path d="M22.4 40L22 30q-.5-6-4-14L16 9q-1-6 8-6t8 6l-2 7q-3.5 8-4 14l-.4 10z" fill="#dc8a2a"/><path d="M18 12h12M17.5 17h13M19.5 24h9" stroke="#9a5410" stroke-width="1.4"/><circle cx="20" cy="6" r="1.6" fill="#f7b95c"/><circle cx="24" cy="5" r="1.6" fill="#f7b95c"/><circle cx="28" cy="6" r="1.6" fill="#f7b95c"/>'};
const PIC={};
function pic(id,sq){const k=id+(sq?'s':'w');if(PIC[k])return PIC[k];const b=SV[id]||SV.hammer;
 const svg=sq?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g stroke="#000" stroke-width="2" stroke-linejoin="round">'+b+'</g></svg>'
  :'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64"><g transform="translate(48 32) rotate(42) scale(1.38) translate(-24 -24)" stroke="#000" stroke-width="2" stroke-linejoin="round">'+b+'</g></svg>';
 return PIC[k]='data:image/svg+xml;utf8,'+encodeURIComponent(svg)}
// ---- public API
function build(id){const f=B[id]||B.hammer;const g=f();g.userData.mw=id;return g}
function of(e){return BY[(e&&e.mw)]||BY.hammer}
const NETON=()=>!!(window.NET&&NET.on);
function hit(e,t,W){// special effects after a connecting hit. Online, the victim's own game applies what lands on them, so nothing is done to the ghost.
 if(!t||t.hp<=0||t.sh>0)return;const ghost=NETON()&&t===E,mine=!(NETON()&&e===E);
 if(W.heal&&mine&&e.hp>0){e.hp=Math.min(e.mx,e.hp+W.heal[0]);e.ar=Math.min(50,e.ar+W.heal[1])}
 effect(e,t,W);if(ghost)return;
if(W.strip&&t.ar>0)t.ar=Math.max(0,t.ar-W.strip);if(W.combo&&mine){e.cmbT=1.6;e.cmbN=Math.min(W.combo[1],(e.cmbN||0)+1)}if(W.dot){t.dotT=W.dot[1];t.dotK=.5;t.dotR=Math.max(t.dotR||0,W.dmg*W.dot[0]/W.dot[1])}
if(W.haste&&mine&&e.hp>0){e.hasteT=W.haste[0];e.hasteF=W.haste[1]}
 if(W.slow&&!ghost){t.slowT=W.slow[0];t.slowF=W.slow[1]}
 const stun=(W.stun||0)+(W.stunc&&Math.random()<W.stunc[0]?W.stunc[1]:0);if(stun>0)t.stun=Math.max(t.stun||0,stun);
 if(W.knock){const d=Math.hypot(t.x-e.x,t.z-e.z)||1;t.dash=W.knock[1];t.dvx=(t.x-e.x)/d*W.knock[0];t.dvz=(t.z-e.z)/d*W.knock[0]}
 try{if(stun>0&&t===P&&say)say('STUNNED!',.8)}catch(x){}}
// damage multiplier for one swing (random, armor, crit)
const behind=(e,t)=>{const dx=e.x-t.x,dz=e.z-t.z,d=Math.hypot(dx,dz)||1;return(dx*-Math.sin(t.yaw||0)+dz*-Math.cos(t.yaw||0))/d<-.2}; // is the swinger behind the target?
function mult(e,t,W){let m=1;if(W.sprint&&e&&e.spr)m*=W.sprint;if(W.back&&e&&t&&behind(e,t)){m*=W.back;if(e===P&&say)say('BACKSTAB!',.6)}if(W.tip&&e&&t&&Math.hypot(e.x-t.x,e.z-t.z)>W.tip[0])m*=W.tip[1];if(W.combo&&e&&e.cmbT>0&&e.cmbN)m*=1+W.combo[0]*e.cmbN;if(W.roll)m*=W.roll[0]+Math.random()*(W.roll[1]-W.roll[0]);if(W.armor&&t&&t.ar>0)m*=W.armor;if(W.crit&&Math.random()<W.crit[0]){m*=W.crit[1];if(e===P&&say)say('CRIT!',.6)}return m}
// ---- holding: the weapon sits in a pivot at the fist, so it can be turned about the hand. Its angle is kept in world terms: phi = how far the head leans forward from straight up.
const HAND=-.86; // the fist, in the weapon-hand group (the forearm ends there)
function apply(e){if(!e||!e.ham)return;const id=BY[e.mw]?e.mw:'hammer';if(e.ham.userData.mwid===id&&e._piv&&e._piv.parent===e.ham)return;
 e.ham.children.slice().forEach(c=>e.ham.remove(c));const H=BY[id].h,m=build(id),piv=new TH.Group();piv.position.y=HAND;m.scale.setScalar(H.sc);m.position.y=-H.gy*H.sc;piv.add(m);e.ham.add(piv);e._piv=piv;e.ham.userData.mwid=id}
const E_={o:t=>1-(1-t)*(1-t)};
// smooth path through the key poses (monotone cubic): speed builds into the impact and carries on through it, and eases to a stop only at the top of the wind-up and the end of the follow-through
function trk(p,T,V){const n=T.length;let i=1;while(i<n-1&&p>T[i])i++;
 const d=[];for(let k=0;k<n-1;k++)d.push((V[k+1]-V[k])/(T[k+1]-T[k]));
 const m=V.map((_,k)=>k===0||k===n-1||d[k-1]*d[k]<=0?0:Math.sign(d[k])*Math.min((Math.abs(d[k-1])+Math.abs(d[k]))/2,3*Math.min(Math.abs(d[k-1]),Math.abs(d[k]))));
 const h=T[i]-T[i-1],t=Math.max(0,Math.min(1,(p-T[i-1])/h)),t2=t*t,t3=t2*t;
 return(2*t3-3*t2+1)*V[i-1]+(t3-2*t2+t)*h*m[i-1]+(-2*t3+3*t2)*V[i]+(t3-t2)*h*m[i]}
// swing styles. Every one is a right-handed swing that cuts ACROSS the body: wound up behind the right shoulder with the torso turned right, then the hips and shoulders unwind to the left, the weapon passes the target and carries on across to the left side before it is brought back to guard.
// keys: guard, wind-up, impact (the hit lands here), follow-through, back to guard. 'I' = the held pose.
// phi = weapon lean (0 up, 1.57 level ahead, 2.3 pointing forward-down); s/el = shoulder and elbow; rz = arm out to the side (+ right, - across the body); pz = weapon tilt sideways;
// tw = torso twist (- right, + left); la/laz = free arm pitch and out-swing; L = weight onto the front (left) foot.
const KT=[0,.24,.46,.72,1];
const STY={
 smash:{T:KT,phi:['I',-.9,2.0,2.7,'I'],s:['I',2.9,1.35,.7,'I'],el:['I',1.7,.35,.25,'I'],rz:['I',.15,0,-.12,'I'],pz:[0,.1,0,-.1,0],tw:[0,-.2,.12,.2,0],bx:[0,-.14,.32,.38,0],la:[0,.55,-.3,-.3,0],laz:[0,.12,-.1,-.2,0],L:[0,0,1,.9,0]},
 thrust:{T:KT,phi:['I',1.45,1.58,1.6,'I'],s:['I',-.15,1.45,1.35,'I'],el:['I',1.7,.08,.2,'I'],rz:['I',.4,-.05,-.2,'I'],pz:[0,.05,0,0,0],tw:[0,-.55,.3,.35,0],bx:[0,-.05,.2,.18,0],la:[0,.5,-.3,-.3,0],laz:[0,0,-.15,-.2,0],L:[0,0,1,.9,0]},
 chop:{T:KT,phi:['I',-.35,1.65,2.25,'I'],s:['I',2.45,1.05,.75,'I'],el:['I',1.5,.25,.15,'I'],rz:['I',.45,-.1,-.65,'I'],pz:[0,.25,-.15,-.6,0],tw:[0,-.45,.3,.62,0],la:[0,.4,-.5,-.5,0],laz:[0,0,-.2,-.45,0],L:[0,0,1,.8,0]},
 slash:{T:KT,phi:['I',1.15,1.5,1.15,'I'],s:['I',1.0,1.3,1.5,'I'],el:['I',.55,.15,.5,'I'],rz:['I',.9,-.1,-.95,'I'],pz:[0,.2,0,-.5,0],tw:[0,-.7,.35,.85,0],la:[0,.3,-.5,-.6,0],laz:[0,0,-.25,-.5,0],L:[0,0,1,.8,0]},
 diag:{T:KT,phi:['I',-.15,1.55,2.3,'I'],s:['I',2.6,1.2,.7,'I'],el:['I',1.5,.35,.3,'I'],rz:['I',.75,-.05,-.9,'I'],pz:[0,.55,-.1,-.95,0],tw:[0,-.5,.3,.7,0],bx:[0,-.06,.14,.2,0],la:[0,.4,-.5,-.55,0],laz:[0,0,-.2,-.5,0],L:[0,0,1,.8,0]},
 diag2:{T:KT,phi:['I',.9,1.5,1.05,'I'],s:['I',1.5,1.25,1.0,'I'],el:['I',.7,.3,.5,'I'],rz:['I',-.75,.05,.3,'I'],pz:[0,-.6,0,.5,0],tw:[0,.45,-.3,-.25,0],bx:[0,0,.1,.12,0],la:[0,-.3,.4,.5,0],laz:[0,0,.15,.4,0],L:[0,0,1,.8,0]}};
const FIX=(a,I)=>a.map(v=>v==='I'?I:v);
// pose(e, dt, pOverride): drives the right arm, torso twist, legs, free arm and weapon lean for one fighter
function pose(e,dt,po){
 if(!e||!e.ra||!e.ra.fa||!e.ham||!e._piv)return;if(e.hp<=0&&po===undefined)return;
 const hold=e.sw>0||e.mel||po!==undefined;if(!hold){e._bx=0;e._eq=0;e._lsw=0;if(e._tw0){e._tw0=0;e.lg&&e.lg.forEach(l=>l.rotation.y=0)}return}
 const W=of(e),H=W.h,wk=Math.min(e.wk||0,1.35),ph=e.wp||0,spr=e.spr?1:0,tt=typeof T==='number'?T:0;
 let sw=po!==undefined?po:null;
 if(sw===null&&e.sw>0){if(e.sw>(e._lsw||0)+.001){e._swm=e.sw;if(po===undefined&&H.sty==='diag')e._alt=!e._alt}e._lsw=e.sw;sw=Math.max(0,Math.min(1,1-e.sw/(e._swm||W.sd)));e._eq=1}else if(po===undefined)e._lsw=0;
 e._eq=Math.min(1,(e._eq||0)+(dt||.016)/.2);
 // the guard (held pose)
 const S0=(H.s==null?.5:H.s)+Math.sin(ph)*wk*.07+Math.sin(tt*2+(e.sd||0))*.015,E0=H.el==null?.95:H.el,
  F0=H.phi+spr*.45*wk+(e.fpv?.28:0)+Math.cos(ph*2)*wk*.035;
 // drawing it: starts low by the leg and comes up
 const q=po!==undefined?1:E_.o(e._eq),sG=.12+(S0-.12)*q,eG=.3+(E0-.3)*q,fG=2.3+(F0-2.3)*q;
 let s=sG,el=eG,phi=fG,rz=.08,tw=0,pz=0,la=0,laz=0,L=0,bx=0;
 if(sw!==null){const D=STY[H.sty==='diag'&&e._alt?'diag2':H.sty]||STY.chop;
  s=trk(sw,D.T,FIX(D.s,sG));el=trk(sw,D.T,FIX(D.el,eG));phi=trk(sw,D.T,FIX(D.phi,fG));rz=trk(sw,D.T,FIX(D.rz,.08));
  tw=trk(sw,D.T,D.tw);pz=trk(sw,D.T,D.pz);la=trk(sw,D.T,D.la);laz=trk(sw,D.T,D.laz);L=trk(sw,D.T,D.L);if(D.bx)bx=trk(sw,D.T,D.bx)}
 e._bx=bx;
 const ra=e.ra,fa=ra.fa;ra.rotation.x=s;fa.rotation.x=el;ra.rotation.z=rz;ra.rotation.y=0;
 e._piv.rotation.set(PI-phi-(s+el),0,pz);
 if(tw||e._tw0){e.bg.rotation.y+=tw;e.lg&&e.lg.forEach(l=>l.rotation.y=-tw*.6);e._tw0=tw?1:0}
 if(sw!==null){
  // the free arm: its own walking swing plus the counter-swing, SET each frame (hold.js leaves it alone during a swing, so adding to it would wind it up and twist)
  e.la.rotation.x=-Math.sin(ph)*.85*Math.min(wk,1.3)+la;e.la.rotation.z=-.08+laz;e.la.rotation.y=0;e.la.fa.rotation.x=.45+.25*Math.max(0,Math.sin(ph))*wk+Math.max(0,-la)*.5-Math.max(0,la)*.2;
  // weight onto the front foot while standing still
  if(wk<.4&&L&&e.lg&&e.gr!==false){e.lg[0].rotation.x=.32*L;e.lg[1].rotation.x=-.22*L}}}
// ---- the blow lands partway through the swing: a short queue of pending hits
const QH=[];
// ---- the blow is decided by the weapon itself: while the swing is in its fast part, points along the weapon (from the fist to the end of the head) are tested against the other fighter's body.
// The first touch deals the damage. Nothing lands unless the weapon really reaches them, and anything the weapon visibly touches is hit.
const GEO={};
function geo(id){if(GEO[id])return GEO[id];const W=BY[id],H=W.h;let g={L:1.6,hr:.2,f0:.55};
 try{const m=build(id);m.updateMatrixWorld&&m.updateMatrixWorld(true);const bb=new TH.Box3().setFromObject(m); // the head hangs from the fist toward -y
  const hx=Math.max(Math.abs(bb.min.x),Math.abs(bb.max.x),Math.abs(bb.min.z),Math.abs(bb.max.z));
  g={L:Math.max(.8,(H.gy-bb.min.y)*H.sc),hr:Math.max(.12,Math.min(.35,hx*H.sc*.55)),f0:id==='katana'?.3:id==='paddle'?.45:.55}}catch(x){}
 return GEO[id]=g}
function blade(e,W){const g=geo(W.id),p=e._piv;if(!p||!e.g||!p.localToWorld)return null;e.g.updateMatrixWorld(true);const o=[];
 for(let i=0;i<=8;i++){const t=i/8,v=new TH.Vector3(0,-t*g.L,0);p.localToWorld(v);if(!isFinite(v.x+v.y+v.z))return null;o.push([v.x,v.y,v.z,t<g.f0?.09:g.hr])}
 const a=o[0],z=o[8];if(Math.hypot(a[0]-z[0],a[1]-z[1],a[2]-z[2])<.2)return null; // no real transforms (a test stub): fall back to the timed distance check
 return o}
const BODY_R=.5; // half the width of a fighter (an upright cylinder from the feet to the top of the head)
function touch(t,pts){const y0=t.y,y1=t.y+(t.hh||2.4);for(const q of pts){if(q[1]<y0-q[3]||q[1]>y1+q[3])continue;if(Math.hypot(q[0]-t.x,q[2]-t.z)<BODY_R+q[3])return q}return null}
function queue(e,t,W){if(!W.sd||W.nodelay)return false;QH.push({e,t,W,age:0,prev:null});return true}
function qstep(dt){for(let i=QH.length-1;i>=0;i--){const q=QH[i],W=q.W;q.age+=dt;const p=q.age/W.sd;
  if(q.e.hp<=0||(q.e.stun||0)>0||over||introT>0||p>.9){QH.splice(i,1);continue}
  if(p<.15)continue;
  const cur=blade(q.e,W);
  if(!cur){if(p>=KT[2]){QH.splice(i,1);meleeHit(q.e,q.t,W)}continue}
  if(p>=.24&&p<=.86){const pv=q.prev||cur;let hit=null;
   for(const s of[.25,.5,.75,1]){hit=touch(q.t,cur.map((c,k)=>[pv[k][0]+(c[0]-pv[k][0])*s,pv[k][1]+(c[1]-pv[k][1])*s,pv[k][2]+(c[2]-pv[k][2])*s,c[3]]));if(hit)break}
   if(hit&&segBox(q.e.x,q.e.y+1.2,q.e.z,hit[0],hit[1],hit[2])===null){QH.splice(i,1);meleeHit(q.e,q.t,W,true);continue}}
  q.prev=cur}}
function effect(e,t,W){// a puff and a little shake where it lands
 try{const c={bat:0xffd02f,ban:0xff2a2a,crown:0xffd34a,paddle:0xffffff,katana:0x35e6ff,wrench:0xf08a1c,bone:0xffe9a8,brain:0xff7ad9,sahurbat:0xd9a05b,sabre:0xd6dde6,baton:0x20d46a,hotline:0xf2a0b3,chad:0xe3b92a,mallet:0xff4a4a,crowbar:0xd91f26,shovel:0x35e6ff,tongs:0xd91f26,nunchucks:0xff3ec8,rammer:0xe3b92a,racket:0xb5e61d,mememace:0xff3ec8,pike:0x8f62ff,gavel:0xffe14a,scythe:0xff3ec8}[W.id]||0xdddddd;
  puff(t.x,t.y+1.3,t.z,c,W.id==='ban'||W.id==='brain'||W.id==='crown'||W.id==='gavel'||W.id==='rammer'?10:6,4,.5,.14);if((e===P||t===P)&&window.shake)shake(W.sd>.45?.45:.25)}catch(x){}}
window.MW={crates,owned:isOwned,clear(){QH.length=0},geo,blade,pose,queue,pic,list:LIST,by:BY,build,of,hit,mult,apply,get sel(){return fix(sel)},avail:unlocked,sigOf,pickE,
 valid:id=>BY[id]?id:'hammer',
 set(id){if(!BY[id]||!unlocked(id))return false;sel=id;try{localStorage.setItem(KEY,id)}catch(e){}if(P){P.mw=id;apply(P)}return true},
 idle:e=>1.05};
// ---- hook into the game: rebuild the held model whenever a fighter's rig is rebuilt (skin()), and pick weapons at the start of a round
const _stepM=step;step=function(dt){_stepM(dt);for(const f of ENTS()){if(f.hasteT>0)f.hasteT-=dt;if(f.slowT>0)f.slowT-=dt;if(f.cmbT>0){f.cmbT-=dt;if(f.cmbT<=0)f.cmbN=0}if(f.dotT>0){f.dotT-=dt;f.dotK-=dt;if(f.dotK<=0){f.dotK+=.5;if(f.hp>0&&!over&&introT<=0)dmg(f,f.dotR*.5)}}else f.dotR=0;f.sx=(f.slowT>0?f.slowF:1)*(f.hasteT>0?f.hasteF:1)}pose(P,dt);pose(E,dt);qstep(dt)};
if(typeof skin==='function'){const _skin=skin;skin=function(e,id){_skin(e,id);apply(e)}}
if(typeof resetRound==='function'){const _rr=resetRound;resetRound=function(i){
  if(P)P.mw=fix(sel);
  for(const f of ENTS()){f.hasteT=f.slowT=0;f.sx=1;f.dotT=f.dotR=0;f.cmbN=f.cmbT=0}
  if(E&&!NETON())E.mw=pickE();
  QH.length=0;_rr(i);apply(P);apply(E)}}
if(P)P.mw=fix(sel);if(E)E.mw=pickE();
if(P)apply(P);if(E)apply(E);
})();
