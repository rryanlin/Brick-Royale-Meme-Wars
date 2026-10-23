/* Fighter skins: every fighter has Default + two alternate skins of its own (modelled on the skin sheets), plus a locked Golden slot.
   A skin rebuilds the minifig with its own colours/prints (via a variant of the fighter's spec) and then bolts extra LEGO-style parts onto the
   same rig groups (head, torso, arms, legs), so every animation keeps working. The pick is saved per fighter and sent to the opponent online. */
(()=>{
const KEY='brickbrawl.skins',TH=window.THREE;let S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
const ok=k=>k===0||k===1||k===2||k===3||k===4;   // 3 = Golden <Name> skin, 4 = Shiny <Name> skin (unlocked with the Golden / Shiny effect, see shine.js)
// ownership: Default is always yours; the two special skins of a fighter have to be bought in the Store with Brick Bucks (saved in this browser)
const OKEY='brickbrawl.skinown';let OW={};try{OW=JSON.parse(localStorage.getItem(OKEY)||'{}')||{}}catch(e){}
const owned=(id,k)=>{k|=0;if(k>=3)return!!(window.SHINE&&SHINE.skinOwned(id,k));return k===0||(ok(k)&&Array.isArray(OW[id])&&OW[id].includes(k))},
 saveOW=()=>{try{localStorage.setItem(OKEY,JSON.stringify(OW))}catch(e){}};
// price of a special skin: set by the fighter's rarity; the second skin of a fighter costs 1.5x the first
const PRICE={common:[400,600],uncommon:[600,900],rare:[900,1350],epic:[1400,2100],legend:[2000,3000]};
const rarOf=id=>{try{return LOOK[id].r||'common'}catch(e){return'common'}},price=(id,k)=>{k|=0;if(k<1||k>2)return 0;return (PRICE[rarOf(id)]||PRICE.common)[k-1]};
const get=id=>{const v=S[id]|0;return ok(v)&&owned(id,v)?v:0},set=(id,k)=>{k|=0;if(!ok(k)||!owned(id,k))return false;S[id]=k;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}return true};
// ---- item shop: only 5 special skins are for sale at a time and the line-up changes every hour. The line-up comes from the clock (hour number) alone,
// so every player sees the same 5 items at the same time. Every 4 hours 20 skins (2 each from 10 of the fighters) come round once: each hour shows 5 skins from 5 different fighters,
// no skin is in two hours in a row (not even across the 4-hour seam), and which skins/fighters come when is shuffled every cycle.
const HOUR=36e5,SHOP_N=5,nowMs=()=>window.SKN&&SKN.__now?SKN.__now():Date.now();
const mulb=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function cycle(c){const r=mulb(((c*2654435761)>>>0)+12345),F=Object.keys(SK).sort();
 for(let i=F.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=F[i];F[i]=F[j];F[j]=t}
 const P=F.slice(0,SHOP_N),Q=F.slice(SHOP_N,SHOP_N*2),tq=Q.map(()=>1+((r()*2)|0)),pt=P.map(()=>1+((r()*2)|0));return{P,Q,tq,pt}}
function shopAt(h){const c=Math.floor(h/4),i=((h%4)+4)%4,cu=cycle(c),pv=cycle(c-1);
 // hours 0 and 2 show the P fighters (one skin each), hours 1 and 3 the Q fighters. A P fighter that was in last cycle's final hour gets the other skin than that one.
 const t=cu.P.map((id,n)=>{const q=pv.Q.indexOf(id);return q>=0?pv.tq[q]:cu.pt[n]});
 const g=[cu.P.map((id,n)=>id+'#'+t[n]),cu.Q.map((id,n)=>id+'#'+cu.tq[n]),cu.P.map((id,n)=>id+'#'+(3-t[n])),cu.Q.map((id,n)=>id+'#'+(3-cu.tq[n]))];return g[i]}
const shop=()=>(window.SKN&&SKN.__stock?SKN.__stock.slice():shopAt(Math.floor(nowMs()/HOUR))).map(key=>{const[id,k]=key.split('#');return{id,k:+k,key}}),
 inShop=(id,k)=>shop().some(x=>x.key===id+'#'+(k|0)),nextIn=()=>HOUR-(nowMs()%HOUR);
function buy(id,k){k|=0;if(!(id in SK)||k<1||k>2||!SK[id][k-1])return{ok:false,why:'nope'};if(owned(id,k))return{ok:false,why:'owned'};if(!inShop(id,k))return{ok:false,why:'shop'};
 const c=price(id,k);if(!window.BUX||!BUX.spend(c))return{ok:false,why:'poor',cost:c};
 (OW[id]=OW[id]||[]).push(k);saveOW();return{ok:true,cost:c}}
const PI=Math.PI;
// ---------- geometry / material helpers (same chunky rounded-brick look as the base minifig) ----------
const GC={},gc=(k,f)=>GC[k]||(GC[k]=f());
const RBX=(w,h,d,r)=>gc('r'+[w,h,d,r],()=>{const sh=new TH.Shape(),x=w/2-r,y=h/2-r;sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.closePath();
 const g=new TH.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g});
const MC={},PL=(c,m)=>{const k=c+(m?JSON.stringify(m):'');return MC[k]||(MC[k]=new TH.MeshPhysicalMaterial(Object.assign({color:c,roughness:.3,metalness:0,clearcoat:.85,clearcoatRoughness:.12,envMapIntensity:.7},m||{})))};
const GD=c=>PL(c||0xe6b422,{metalness:.5,roughness:.22,envMapIntensity:1.3});                                   // shiny gold plastic
const GL=c=>{const k='gl'+c;return MC[k]||(MC[k]=new TH.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.6,roughness:.45}))};   // glowing neon
const GS=(c,o)=>PL(c,{transparent:true,opacity:o||.35,roughness:.05,clearcoat:1,depthWrite:false});                // clear plastic
const DS=c=>PL(c,{side:TH.DoubleSide});
const mt=c=>typeof c==='object'?c:PL(c);
function add(p,geo,m,x,y,z,rot,sc){const o=new TH.Mesh(geo,m);o.position.set(x||0,y||0,z||0);if(rot){o.rotation.order=rot[3]||'XYZ';o.rotation.set(rot[0],rot[1],rot[2])}if(sc)o.scale.set(sc[0],sc[1],sc[2]);o.castShadow=true;o.userData.sh=1;o.userData.sk=1;p.add(o);return o}
const box=(p,w,h,d,c,x,y,z,rot,r)=>add(p,RBX(w,h,d,r===undefined?.03:r),mt(c),x,y,z,rot);
const cyl=(p,r1,r2,h,c,x,y,z,rot,seg)=>add(p,gc('y'+[r1,r2,h,seg||22],()=>new TH.CylinderGeometry(r1,r2,h,seg||22)),mt(c),x,y,z,rot);
const sph=(p,r,c,x,y,z,sc)=>add(p,gc('s'+r,()=>new TH.SphereGeometry(r,16,12)),mt(c),x,y,z,0,sc);
const half=(p,r,c,x,y,z,sc,rot)=>add(p,gc('h'+r,()=>new TH.SphereGeometry(r,22,10,0,PI*2,0,PI/2)),mt(c),x,y,z,rot,sc);
const cone=(p,r,h,c,x,y,z,rot,seg)=>add(p,gc('c'+[r,h,seg||8],()=>new TH.ConeGeometry(r,h,seg||8)),mt(c),x,y,z,rot);
const tor=(p,R,t,c,x,y,z,rot,arc)=>add(p,gc('t'+[R,t,arc||0],()=>new TH.TorusGeometry(R,t,10,30,arc||PI*2)),mt(c),x,y,z,rot);
// painted decal plane (canvas, 400px per unit). ry=PI faces the front of the fighter; draw(ctx,W,H)
const DT={};
function dec(p,w,h,key,draw,x,y,z,ry,rx,basic){const W=Math.round(w*400),H=Math.round(h*400);let t=DT[key];
 if(!t){const c=document.createElement('canvas');c.width=W;c.height=H;draw(c.getContext('2d'),W,H);t=DT[key]=new TH.CanvasTexture(c);t.anisotropy=8}
 const m=basic?new TH.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}):new TH.MeshStandardMaterial({map:t,transparent:true,roughness:.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
 const o=new TH.Mesh(new TH.PlaneGeometry(w,h),m);o.position.set(x||0,y||0,z||0);o.rotation.order='YXZ';o.rotation.set(rx||0,ry===undefined?PI:ry,0);o.userData.sh=1;o.userData.sk=1;p.add(o);return o}
// canvas helpers
const rc=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)},pg=(x,c,p)=>{x.fillStyle=c;x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill()},
 ci=(x,c,a,b,r)=>{x.fillStyle=c;x.beginPath();x.arc(a,b,r,0,7);x.fill()},ln=(x,c,w,p)=>{x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke()};
const rng=s=>()=>(s=(s*16807)%2147483647)/2147483647;
const css=n=>'#'+n.toString(16).padStart(6,'0');
// a point/rotation on a dome (head hat) so flat parts sit tangent on it: centre height cy, radius r, elevation e, azimuth f (PI = straight ahead of the face)
const dome=(cy,r,e,f)=>[r*Math.cos(e)*Math.sin(f),cy+r*Math.sin(e),r*Math.cos(e)*Math.cos(f),[-e,f,0,'YXZ']];
// ---------- shared pieces ----------
function crown(p,y,m,gem,R){R=R||.37;cyl(p,R,R+.01,.15,m,0,y+.075,0);for(let i=0;i<5;i++){const a=i*PI*2/5+PI/5,x=R*.86*Math.sin(a),z=R*.86*Math.cos(a);cone(p,.08,.24,m,x,y+.27,z,0,6);sph(p,.045,m,x,y+.4,z)}
 if(gem){sph(p,.05,gem,0,y+.08,-R-.01);sph(p,.04,gem,R*.8,y+.08,-R*.6);sph(p,.04,gem,-R*.8,y+.08,-R*.6)}}
function hood(p,c){const m=DS(c);add(p,gc('hood',()=>new TH.CylinderGeometry(.5,.5,.62,30,1,true,PI+.95,PI*2-1.9)),m,0,.3,0);half(p,.5,m,0,.6,0,[1,.78,1]);cyl(p,.5,.42,.06,m,0,.0,0,0,28)}
function scarf(p,c,R,t){tor(p,R,t,c,0,.02,0,[PI/2,0,0])}
function fluff(p,c,n,R,r){for(let i=0;i<n;i++){const a=i*PI*2/n;sph(p,r,c,R*Math.sin(a),.03+(i%2)*.04,R*Math.cos(a))}tor(p,R,r*.9,c,0,.03,0,[PI/2,0,0])}
function pad(p,c,trim,R,gem){half(p,R,c,0,.02,0,[1,.72,1.08]);if(trim)tor(p,R*.98,.03,trim,0,.04,0,[PI/2,0,0]);if(gem)sph(p,.045,gem,0,R*.72+.03,0)}
function pocket(lg,c,strip,s){box(lg,.24,.2,.13,c,s*.06,-.17,-.3);if(strip)box(lg,.15,.035,.02,strip,s*.06,-.17,-.375)}
function straps(bg,c,y,h){[-1,1].forEach(s=>box(bg,.07,h||.52,.04,c,s*.2,y||1.3,-.275,0,.01))}
function pouches(bg,c,y,n,z){const w=.15;for(let i=0;i<n;i++)box(bg,w,.15,.1,c,(i-(n-1)/2)*(w+.03),y,z||-.35)}
function belt(bg,c,buckle,y){box(bg,.95,.09,.54,c,0,y||.87,0,0,.02);if(buckle)box(bg,.14,.1,.04,buckle,0,y||.87,-.28,0,.01)}
function recolorHat(hg,minY,fn){hg.children.forEach(m=>{if(m.isMesh&&m.position.y>minY&&m.material&&m.material.color&&!m.userData.sk){const n=fn(m);if(n!==undefined&&n!==null)m.material=mt(n)}})}
function hide(hg,f){hg.children.forEach(m=>{if(m.isMesh&&!m.userData.sk&&f(m))m.visible=false})}
const arc=(p,r,h,y,c,tl,open)=>add(p,gc('a'+[r,h,tl,open],()=>new TH.CylinderGeometry(r,r,h,24,1,!!open,PI-tl/2,tl)),mt(c),0,y,0);
const legMat=(r,i,c)=>{const m=r.lg[i].children[0];if(m)m.material=PL(c)};
// canvas icons
function crownIcon(x,W,H,c,c2){const u=W/100;pg(x,c,[[10*u,70*u],[16*u,24*u],[34*u,46*u],[50*u,14*u],[66*u,46*u],[84*u,24*u],[90*u,70*u]]);rc(x,c2||c,10*u,70*u,80*u,12*u);[16,50,84].forEach(a=>ci(x,c,a*u,(a===50?12:22)*u,6*u))}
function starIcon(x,cx,cy,R,c){x.fillStyle=c;x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?R*.45:R;x.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}x.closePath();x.fill()}
function pawIcon(x,cx,cy,s,c){ci(x,c,cx,cy+s*.25,s*.34);[[-.42,-.18],[-.15,-.45],[.15,-.45],[.42,-.18]].forEach(([a,b])=>ci(x,c,cx+a*s,cy+b*s,s*.15))}
function plusStars(x,W,H,seed,n,c,big){const r=rng(seed);for(let i=0;i<n;i++){const a=r()*W,b=r()*H,s=big&&i%4===0?W*.07:W*.025;x.fillStyle=c;if(big&&i%4===0){x.fillRect(a-s/6,b-s/2,s/3,s);x.fillRect(a-s/2,b-s/6,s,s/3)}else x.fillRect(a,b,s*.6,s*.6)}}
// ---------- the skins ----------
const NV=PL(0x1b3a7d),KB=0x1a1a1a;
const SK={
pepe:[
 {name:'Crowned Commando',ov:{},build(r){const{bg,hg}=r;crown(hg,.58,GD(),0xd02a2a);
   box(bg,.56,.42,.12,NV,0,1.3,-.31);dec(bg,.36,.28,'pcc',(x,W,H)=>crownIcon(x,W,H,'#f2c230','#f2c230'),0,1.32,-.375);
   straps(bg,KB);belt(bg,KB,0xf2c230);
   [r.la,r.ra].forEach((a,i)=>{pad(a,NV,GD(),.23);box(a,.1,.1,.05,GD(),(i?1:-1)*.2,.04,0)});
   r.lg.forEach((l,i)=>pocket(l,KB,0xf2c230,i?1:-1))}},
 {name:'Swamp Royale',ov:{sl:0x5a8f3c},build(r){const{bg,hg}=r,OL=0x6d7a3b,OD=0x59662f;hood(hg,0x4d8a35);
   [-1,1].forEach(s=>{sph(hg,.17,0xffffff,s*.25,.93,-.2);sph(hg,.085,0x111111,s*.25,.94,-.34);[[.3,.8,-.1],[.4,.7,.1]].forEach(([a,b,c])=>sph(hg,.07,0x3b6e2a,s*a,b,c,[1,.7,1]))});
   box(bg,.64,.5,.14,OL,0,1.28,-.32);dec(bg,.3,.26,'psf',(x,W,H)=>{ci(x,'#6fd04a',W*.5,H*.58,W*.3);ci(x,'#fff',W*.3,H*.28,W*.16);ci(x,'#fff',W*.7,H*.28,W*.16);ci(x,'#111',W*.3,H*.3,W*.07);ci(x,'#111',W*.7,H*.3,W*.07);ln(x,'#1b5a14',W*.04,[[W*.28,H*.66],[W*.5,H*.78],[W*.72,H*.66]])},0,1.34,-.395);
   pouches(bg,OD,1.04,3,-.4);[-1,1].forEach(s=>box(bg,.14,.09,.3,OL,s*.34,1.58,0));
   box(bg,.5,.5,.18,OD,0,1.25,.35);
   [r.la,r.ra].forEach(a=>{[[0,-.12,.1],[.06,-.28,.12]].forEach(([x,y,z],i)=>sph(a,.07,0x3b6e2a,x+(i?.06:-.06),y,z,[1,1.1,.5]))});
   r.lg.forEach((l,i)=>pocket(l,OL,0x4a5a22,i?1:-1))}}],
doge:[
 {name:'Coin King',ov:{sh:0xe0ad1f,cuff:0xe0ad1f},build(r){const{bg,hg}=r;hide(hg,m=>m.geometry&&m.geometry.type==='ConeGeometry');crown(hg,.58,GD(),0xd02a2a,.36);
   box(bg,.68,.5,.14,GD(),0,1.28,-.31);dec(bg,.36,.36,'dcn',(x,W,H)=>{ci(x,'#8a5a1c',W/2,H/2,W*.46);ci(x,'#f2c64a',W/2,H/2,W*.4);ci(x,'#8a5a1c',W/2,H/2,W*.3);ci(x,'#f2c64a',W/2,H/2,W*.26);x.font='900 '+W*.42+'px Arial Black,Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#8a5a1c';x.fillText('D',W/2,H*.54)},0,1.28,-.385);
   sph(bg,.06,0xd02a2a,0,1.5,-.4);fluff(hg,0xffffff,10,.4,.1);for(let i=0;i<5;i++){const a=i*1.3+.4;sph(hg,.025,0x111111,.41*Math.sin(a),.07,.41*Math.cos(a))}
   box(bg,.95,.1,.54,GD(),0,.87,0,0,.02);box(bg,.3,.55,.05,0xc4161c,0,.5,-.3);box(bg,.34,.05,.06,GD(),0,.24,-.3);
   box(bg,.92,1.2,.05,0xc4161c,0,.98,.31);box(bg,.98,.1,.07,0xffffff,0,1.58,.31);[-1,1].forEach(s=>box(bg,.07,1.2,.07,0xffffff,s*.49,.98,.31));for(let i=0;i<6;i++)sph(bg,.025,0x111111,(i%3-1)*.3,1.56,.35);
   [r.la,r.ra].forEach(a=>{pad(a,GD(),GD(0xf0c850),.26,0xd02a2a)});
   r.lg.forEach((l,i)=>{box(l,.4,.28,.08,GD(),0,-.2,-.285);sph(l,.1,GD(),0,-.05,-.3)})}},
 {name:'Shiba Sentinel',ov:{l:0xefeee9,hip:0xdedcd5,sh:0xc9a24a},build(r){const{bg,hg}=r,BR=0x5b4030;fluff(hg,0xf4f2ec,10,.4,.11);
   box(bg,.66,.5,.14,0xf3f1ec,0,1.28,-.31);dec(bg,.28,.32,'dsh',(x,W,H)=>{x.fillStyle='#c8a24a';x.beginPath();x.moveTo(W*.1,H*.08);x.lineTo(W*.9,H*.08);x.lineTo(W*.9,H*.6);x.quadraticCurveTo(W*.5,H*1.0,W*.1,H*.6);x.closePath();x.fill();ln(x,'#6b4a1a',W*.05,[[W*.12,H*.1],[W*.88,H*.1],[W*.88,H*.58]]);pg(x,'#f6e3a8',[[W*.26,H*.42],[W*.3,H*.16],[W*.42,H*.28],[W*.58,H*.28],[W*.7,H*.16],[W*.74,H*.42],[W*.5,H*.68]]);ci(x,'#222',W*.4,H*.42,W*.03);ci(x,'#222',W*.6,H*.42,W*.03)},-.04,1.3,-.385);
   straps(bg,BR,1.3,.52);box(bg,.7,.07,.04,BR,0,1.12,-.275,0,.01);pouches(bg,0x6b4a2f,1.0,3,-.37);belt(bg,BR,0xc8a24a);
   [r.la,r.ra].forEach((a,i)=>{pad(a,0xf3f1ec,GD(0xc8a24a),.23);if(i)dec(a,.2,.2,'dpw',(x,W,H)=>pawIcon(x,W/2,H/2,W*.8,'#5b4030'),.21,.04,0,PI/2,0)});
   box(bg,.5,.95,.04,0xf1ede0,-.26,1.1,.31,[0,0,.07]);
   r.lg.forEach((l,i)=>{pocket(l,BR,0xc8a24a,i?1:-1);box(l,.3,.12,.07,GD(0xc8a24a),0,-.08,-.285)})}}],
wojak:[
 {name:'Arctic Wojak',ov:{t:0xdde9f7,sl:0xe6eefa,l:0xe6eefa,hip:0xcddbee,cuff:0x6ea0e0,sh:0x2e6bff},td(x){const q=rng(7);rc(x,'#e8f0fb',0,0,300,270);for(let i=0;i<60;i++){const c=['#a9c8f0','#7fa9e2','#ffffff','#c4daf5'][(q()*4)|0];rc(x,c,((q()*10)|0)*30,((q()*8)|0)*30,30+((q()*2)|0)*30,30)}rc(x,'#151515',0,222,300,48)},
  build(r){const{bg,hg}=r;cyl(hg,.43,.43,.14,0xb9d5f5,0,.6,0);half(hg,.43,0x9ec4ee,0,.62,0,[1,.85,1]);fluff(hg,0xffffff,11,.4,.11);
   straps(bg,KB);pouches(bg,0x16181c,1.0,3,-.34);box(bg,.2,.16,.08,0x16181c,0,1.4,-.3);belt(bg,KB);
   r.lg.forEach((l,i)=>{dec(l,.46,.46,'wcm'+i,(x,W,H)=>{const q=rng(31+i);rc(x,'#e8f0fb',0,0,W,H);for(let n=0;n<26;n++){rc(x,['#a9c8f0','#7fa9e2','#ffffff','#c4daf5'][(q()*4)|0],((q()*7)|0)*W/7,((q()*7)|0)*H/7,W/7*(1+((q()*2)|0)),H/7)}},0,-.23,-.253,PI,0);pocket(l,0x16181c,null,i?1:-1)})}},
 {name:'Doomer Ops',ov:{t:0x1a1a1f,sl:0x1d1d22,l:0x1d1d22,hip:0x141418,sh:0x111114},td(x){rc(x,'#1a1a1f',0,0,300,270);ln(x,'#9a9aa4',5,[[112,0],[108,70]]);ln(x,'#9a9aa4',5,[[188,0],[192,70]]);ci(x,'#9a9aa4',108,74,6);ci(x,'#9a9aa4',192,74,6);rc(x,'#101014',0,222,300,48)},
  build(r){const{bg,hg}=r,DK=0x26262c;hood(hg,0x16161a);half(hg,.41,0x0c0c0e,0,.55,0,[1,.7,1.02]);cyl(hg,.41,.41,.1,0x0c0c0e,0,.56,0);
   straps(bg,DK);box(bg,.42,.28,.1,0x2c2c33,0,1.3,-.33);dec(bg,.24,.24,'wsk',(x,W,H)=>{ci(x,'#c9c9d2',W/2,H*.42,W*.34);rc(x,'#c9c9d2',W*.3,H*.55,W*.4,H*.3);ci(x,'#1a1a1f',W*.36,H*.42,W*.09);ci(x,'#1a1a1f',W*.64,H*.42,W*.09);pg(x,'#1a1a1f',[[W*.47,H*.55],[W*.53,H*.55],[W*.5,H*.64]])},0,1.3,-.385);
   pouches(bg,DK,1.02,3,-.36);box(bg,.5,.5,.16,0x1c1c20,0,1.25,.34);belt(bg,0x0e0e10);
   r.lg.forEach((l,i)=>pocket(l,DK,null,i?1:-1))}}],
foreman:[
 {name:'Site Supervisor',ov:{t:0xffd500,sl:0xffd500,cuff:0xbfc4c9},td(x){rc(x,'#c6ee18',34,0,232,222);pg(x,'#fff',[[96,0],[204,0],[150,92]]);rc(x,'#ff8a1f',58,0,16,222);rc(x,'#ff8a1f',226,0,16,222);rc(x,'#bfc4c9',34,150,232,22);rc(x,'#151515',0,222,300,48);rc(x,'#fff',34,0,62,1)},
  build(r){const{bg,hg}=r;recolorHat(hg,.45,()=>0xf4f4f4);dec(hg,.2,.24,'fcl',(x,W,H)=>{rc(x,'#fff',0,0,W,H);x.strokeStyle='#222';x.lineWidth=W*.06;x.strokeRect(W*.12,H*.14,W*.76,H*.78);rc(x,'#222',W*.34,H*.04,W*.32,H*.14);[.38,.52,.66].forEach(a=>ln(x,'#222',W*.05,[[W*.26,H*a],[W*.74,H*a]]))},0,.72,-.42,PI,-.35);
   box(bg,.12,.2,.07,0x1b1b1b,-.2,1.42,-.3);cyl(bg,.012,.012,.16,0x1b1b1b,-.2,1.58,-.3);box(bg,.14,.17,.025,0xffffff,.14,1.27,-.285);box(bg,.97,.09,.55,0x5a3a22,0,.86,0,0,.02);
   [-.28,0,.28].forEach(x=>box(bg,.16,.17,.1,0x7a5232,x,.8,-.3));cyl(bg,.022,.022,.28,0x9aa0a6,.36,.72,-.3,[0,0,.2]);cyl(bg,.02,.02,.26,0xd62020,.42,.7,-.3,[0,0,-.1]);
   r.lg.forEach((l,i)=>pocket(l,0x1c2f6a,0xffd500,i?1:-1))}},
 {name:'Hazmat Builder',ov:{t:0xff7a00,sl:0xff7a00,l:0xff7a00,hip:0xd96400,sh:0x1f1f1f,h:0x1c1c1c},td(x){rc(x,'#ff7a00',0,0,300,270);pg(x,'#ffd500',[[150,52],[222,168],[78,168]]);ln(x,'#111',9,[[150,52],[222,168],[78,168],[150,52]]);rc(x,'#111',141,88,18,44);ci(x,'#111',150,148,10);rc(x,'#151515',0,222,300,48)},
  build(r){const{bg,hg}=r;for(let i=0;i<8;i++){const d=dome(.5,.465,.95,i*PI/4);box(hg,.1,.2,.03,0x161616,d[0],d[1],d[2],d[3],.005)}
   arc(hg,.43,.05,.5,0x1b1b1b,1.9);arc(hg,.43,.05,.215,0x1b1b1b,1.9);arc(hg,.425,.28,.357,GS(0xbfd2da,.3),1.9,1);[-1,1].forEach(s=>box(hg,.05,.3,.09,0x1b1b1b,s*.33,.357,-.27,[0,s*.8,0]));
   box(hg,.46,.24,.2,0x1b1b1b,0,.1,-.44);[-1,1].forEach(s=>{cyl(hg,.11,.11,.13,0x1b1b1b,s*.25,.09,-.46,[PI/2,0,0]);cyl(hg,.115,.115,.035,0xffd500,s*.25,.09,-.54,[PI/2,0,0])});
   straps(bg,KB,1.3,.54);box(bg,.2,.12,.05,0x6b6f75,0,1.1,-.3);belt(bg,0x1a1a1a,0x6b6f75);
   cyl(bg,.13,.13,.7,0xffd500,.2,1.3,.37);cyl(bg,.13,.13,.7,0xffd500,-.2,1.3,.37);tor(bg,.2,.025,0x1a1a1a,.0,1.62,.12,[PI/2,0,0],PI);
   r.la.fa&&cyl(r.la.fa,.158,.158,.06,0x161616,0,-.2,0);r.ra.fa&&cyl(r.ra.fa,.158,.158,.06,0x161616,0,-.2,0);
   r.lg.forEach((l,i)=>{box(l,.3,.2,.08,0x2a2a2a,0,-.12,-.285);box(l,.48,.05,.52,0x161616,0,-.38,0,0,.01);box(l,.48,.05,.52,0x161616,0,-.46,0,0,.01)})}}],
jester:[
 {name:'Royal Fool',ov:{sl:0xb3001b,cuff:0xe0b020,hip:0x1a1a1a},td(x){for(let i=0;i<6;i++)rc(x,i%2?'#111':'#b3001b',i*50,0,50,222);[0,1,2,3,4].forEach(i=>pg(x,'#e0b020',[[i*60-10,0],[i*60+50,0],[i*60+20,46]]));[96,150,204].forEach((a,i)=>pg(x,'#e0b020',[[a,70+i%2*40],[a+14,100+i%2*40],[a,130+i%2*40],[a-14,100+i%2*40]]));rc(x,'#1f1f1f',0,222,300,48);rc(x,'#e0b020',0,222,300,6)},
  build(r){const{bg,hg}=r;recolorHat(hg,.5,m=>{const c=m.material.color.getHex(),g=m.geometry&&m.geometry.parameters;if(g&&g.radius===.12)return GD();if(g&&g.radiusTop===.34)return 0xc1121f;if(c===0x1a1a1a&&!(g&&g.radiusTop===.5))return 0xc1121f;if(c===0xffffff)return 0x111111});
   cyl(hg,.51,.51,.07,GD(),0,.63,0);[0,1,2,3,4,5,6].forEach(i=>{const a=i*PI*2/7;cone(hg,.06,.16,GD(),.51*Math.sin(a),.74,.51*Math.cos(a),0,5)});
   [-.26,0,.26].forEach((x,i)=>{sph(bg,.075,GD(),x,.68-(i%2)*.05,-.31);cone(bg,.05,.12,GD(),x,.6-(i%2)*.05,-.31,[PI,0,0],5)});
   [r.la,r.ra].forEach(a=>{[-.12,0,.12].forEach(z=>cone(a,.05,.2,GD(),z*.6,.1,z*.5,[0,0,0],5))});
   r.lg.forEach((l,i)=>{dec(l,.46,.46,'jdl'+i,(x,W,H)=>{rc(x,i?'#111':'#b3001b',0,0,W,H);for(let a=0;a<2;a++)for(let b=0;b<2;b++)pg(x,i?'#b3001b':'#111',[[W*(a+.5)/2,H*b/2],[W*(a+1)/2,H*(b+.5)/2],[W*(a+.5)/2,H*(b+1)/2],[W*a/2,H*(b+.5)/2]])},0,-.23,-.253,PI,0);box(l,.47,.05,.52,GD(),0,-.02,0,0,.01)})}},
 {name:'Night Circus',ov:{t:0x15101c,sl:0x15101c,cuff:0x8a3fe0,hip:0x15101c},hd(x){[[132,126],[190,126]].forEach(([a,b])=>{pg(x,'#8a3fe0',[[a,b],[a+11,b+16],[a,b+34],[a-11,b+16]]);pg(x,'#c9a0ff',[[a,b+6],[a+4,b+16],[a,b+26],[a-4,b+16]])})},
  td(x){[0,1,2,3,4].forEach(i=>pg(x,'#9b4de0',[[i*60-10,0],[i*60+50,0],[i*60+20,46]]));[[75,'#6a2fb0'],[125,'#b57cff'],[175,'#6a2fb0'],[225,'#b57cff']].forEach(([a,c])=>pg(x,c,[[a,96],[a+24,140],[a,184],[a-24,140]]));[[100,'#b57cff'],[150,'#6a2fb0'],[200,'#b57cff']].forEach(([a,c])=>pg(x,c,[[a,128],[a+24,172],[a,216],[a-24,172]]));rc(x,'#1b1328',0,222,300,48);rc(x,'#8a3fe0',0,222,300,6)},
  build(r){const{bg,hg}=r,PU=0x7a2fd0;recolorHat(hg,.5,m=>{const c=m.material.color.getHex(),g=m.geometry&&m.geometry.parameters;if(g&&g.radius===.12)return PL(PU,{metalness:.5,roughness:.2});if(c===0x1a1a1a&&!(g&&(g.radiusTop===.5||g.radiusTop===.34)))return 0x6a1fb0;if(c===0xffffff)return 0x1a1a1a});
   tor(hg,.5,.04,PU,0,.64,0,[PI/2,0,0]);[-1,1].forEach(s=>[.6,.9].forEach(k=>cone(r[s<0?'la':'ra'],.05,.2,PU,0,.1,k*.1,0,5)));
   for(let i=0;i<7;i++){const t=i/6,x=-.34+t*.68,y=.66-.1*Math.sin(t*PI);tor(bg,.045,.012,0xd5d8de,x,y,-.31,[i%2?PI/2:0,i%2?0:.3,0])}
   r.lg.forEach((l,i)=>{dec(l,.46,.46,'ncl2'+i,(x,W,H)=>{rc(x,i?'#6a2fb0':'#15101c',0,0,W,H);for(let a=0;a<2;a++)for(let b=0;b<2;b++)pg(x,i?'#15101c':'#8a3fe0',[[W*(a+.5)/2,H*b/2],[W*(a+1)/2,H*(b+.5)/2],[W*(a+.5)/2,H*(b+1)/2],[W*a/2,H*(b+.5)/2]])},0,-.23,-.253,PI,0);box(l,.47,.05,.52,0x8a3fe0,0,-.02,0,0,.01)})}}],
podcast:[
 {name:'Streamer Pro',ov:{},build(r){const{bg,hg}=r,PUG=GL(0xb44cff);const d=dome(.52,.445,.5,PI);dec(hg,.34,.28,'psl',(x,W,H)=>{x.strokeStyle='#d58bff';x.lineWidth=W*.07;x.lineJoin='round';x.beginPath();x.moveTo(W*.1,H*.82);x.lineTo(W*.16,H*.3);x.lineTo(W*.34,H*.55);x.lineTo(W*.5,H*.14);x.lineTo(W*.66,H*.55);x.lineTo(W*.84,H*.3);x.lineTo(W*.9,H*.82);x.closePath();x.stroke()},d[0],d[1],d[2]-.01,PI,-.5,1);
   [-1,1].forEach(s=>tor(hg,.2,.035,PUG,s*.53,.3,0,[0,PI/2,0]));
   [-1,1].forEach(s=>box(bg,.04,.55,.02,PUG,s*.31,1.25,-.265,0,.005));dec(bg,.3,.28,'pst',(x,W,H)=>{x.strokeStyle='#d58bff';x.lineWidth=W*.07;x.lineJoin='round';x.beginPath();x.moveTo(W*.12,H*.1);x.lineTo(W*.88,H*.1);x.lineTo(W*.88,H*.62);x.lineTo(W*.6,H*.62);x.lineTo(W*.4,H*.84);x.lineTo(W*.4,H*.62);x.lineTo(W*.12,H*.62);x.closePath();x.stroke();rc(x,'#d58bff',W*.36,H*.26,W*.07,H*.22);rc(x,'#d58bff',W*.56,H*.26,W*.07,H*.22)},0,1.3,-.268,PI,0,1);
   [r.la,r.ra].forEach((a,i)=>{box(a,.035,.34,.035,PUG,(i?1:-1)*.01,-.2,-.175);a.fa&&box(a.fa,.035,.3,.035,PUG,(i?1:-1)*.01,-.17,-.155)});
   r.lg.forEach((l,i)=>{box(l,.04,.38,.02,PUG,i?.12:-.12,-.23,-.255);pocket(l,KB,0xb44cff,i?1:-1)})}},
 {name:'On-Air Tactical',ov:{},build(r){const{bg,hg}=r,RD=GL(0xff2a2a);const d=dome(.52,.445,.5,PI);box(hg,.46,.19,.06,0xb0141c,d[0],d[1]+.02,d[2]-.015,d[3],.02);dec(hg,.42,.15,'poa',(x,W,H)=>{x.fillStyle='#fff';x.font='900 '+H*.8+'px Arial Black,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('ON AIR',W/2,H*.56)},d[0],d[1]+.02,d[2]-.052,PI,-.5);
   [-1,1].forEach(s=>tor(hg,.2,.035,RD,s*.53,.3,0,[0,PI/2,0]));
   straps(bg,0x222226,1.3,.54);box(bg,.2,.22,.06,0xffffff,-.18,1.3,-.3);dec(bg,.2,.22,'ppr',(x,W,H)=>{x.fillStyle='#222';x.font='900 '+H*.2+'px Arial Black,Arial';x.textAlign='center';x.fillText('PRESS',W/2,H*.3);rc(x,'#e01818',W*.3,H*.42,W*.4,H*.38)},-.18,1.3,-.332);
   pouches(bg,0x1c1c1f,1.03,4,-.36);cyl(bg,.014,.014,.5,0x111111,.3,1.85,.26);box(bg,.14,.2,.1,0x1c1c1f,.3,1.4,.28);belt(bg,0x111);
   dec(r.ra,.17,.17,'pcw',(x,W,H)=>{ci(x,'#d01818',W/2,H/2,W*.46);[.18,.3,.42].forEach((rr,i)=>{x.strokeStyle='#fff';x.lineWidth=W*.05;x.beginPath();x.arc(W*.34,H*.7,W*rr*1.15,-PI*.6,-PI*.1);x.stroke()});ci(x,'#fff',W*.34,H*.7,W*.05)},.178,-.15,0,PI/2);
   r.lg.forEach((l,i)=>{pocket(l,0x1c1c1f,i?0xd01818:null,i?1:-1)})}}],
nyan:[
 {name:'Pastel Arcade',ov:{sl:0xf3f3f7,l:0xf3f3f7,hip:0xe3e3ea,cuff:0xff9ad0},td(x){rc(x,'#f3d9a4',30,28,240,214);rc(x,'#ff8ad6',48,44,204,182);[['#ff3b3b',80,70,-.3],['#ffd93b',150,92,.5],['#3b82f6',216,70,.2],['#3ad66b',70,150,.4],['#ffd93b',104,190,-.5],['#3b82f6',170,150,.8],['#ff3b3b',226,150,-.4],['#b366ff',216,196,.6]].forEach(([c,a,b,r])=>{x.save();x.translate(a,b);x.rotate(r);rc(x,c,-8,-12,16,24);x.restore()});rc(x,'#151515',0,222,300,48)},
  build(r){const{bg,hg}=r;tor(hg,.46,.05,0xff8fcd,0,.3,0,0,PI);[-1,1].forEach(s=>{cyl(hg,.17,.17,.12,0xff8fcd,s*.52,.3,0,[0,0,PI/2]);cyl(hg,.12,.12,.04,0x39d3e8,s*.58,.3,0,[0,0,PI/2])});
   dec(hg,.16,.16,'nyh',(x,W,H)=>{const h=[[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]];h.forEach(([a,b])=>rc(x,'#fff',W*.1+a*W*.16,H*.1+b*H*.16,W*.16,H*.16))},.592,.3,0,PI/2,0);
   [r.la,r.ra].forEach(a=>{[['#ff8fcd',-.1],['#ffe14d',-.18],['#39d3e8',-.26]].forEach(([c,y])=>cyl(a,.178,.165,.05,css(parseInt(c.slice(1),16)),0,y,0));a.fa&&[['#ff8fcd',-.06],['#ffe14d',-.13],['#39d3e8',-.2]].forEach(([c,y])=>cyl(a.fa,.155,.15,.05,parseInt(c.slice(1),16),0,y,0))});
   r.lg.forEach((l,i)=>{if(i){[[0xff8fcd,-.1],[0x39d3e8,-.19],[0xff8fcd,-.3]].forEach(([c,y])=>box(l,.485,.07,.52,c,0,y,0,0,.01))}else{legMat(r,0,0xffe0f0);box(l,.485,.07,.52,0xff8fcd,0,-.1,0,0,.01);dec(l,.3,.3,'nyhl',(x,W,H)=>{['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'].forEach((row,b)=>[...row].forEach((c,a)=>{if(c==='X')rc(x,'#ff3fa4',W*.08+a*W*.12,H*.14+b*H*.12,W*.12,H*.12)}))},0,-.23,-.257,PI,0)}})}},
 {name:'Cosmic Nyan',ov:{t:0x1a2370,sl:0x2c2f96,l:0x2c2f96,hip:0x1b1f66,cuff:0x6a4fd0},build(r){const{bg,hg}=r;
   box(hg,.05,.6,.78,0x25307f,-.43,.3,0,0,.015);dec(hg,.7,.55,'ncg',(x,W,H)=>{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#27338a');g.addColorStop(.5,'#6a3fc8');g.addColorStop(1,'#2a63d6');x.fillStyle=g;x.fillRect(0,0,W,H);plusStars(x,W,H,11,26,'#fff',1)},-.457,.3,0,-PI/2);
   dec(hg,.16,.16,'nys',(x,W,H)=>{rc(x,'#ffe14d',W*.4,0,W*.2,H);rc(x,'#ffe14d',0,H*.4,W,H*.2)},-.25,.62,-.26,PI,-.6);
   dec(bg,.78,.74,'nct',(x,W,H)=>{plusStars(x,W,H,5,30,'#fff',1)},0,1.23,-.262);
   [r.la,r.ra].forEach((a,i)=>{dec(a,.2,.34,'nca'+i,(x,W,H)=>plusStars(x,W,H,20+i,10,'#fff',1),(i?1:-1)*.001,-.2,-.172,PI)});
   r.lg.forEach((l,i)=>{dec(l,.44,.44,'ncl'+i,(x,W,H)=>{plusStars(x,W,H,40+i,12,'#fff',1);if(!i){starIcon(x,W*.66,H*.58,W*.27,'#ffd23a');['#ff3b3b','#ff9a2b','#ffe14d','#3ad66b','#3ab7ff','#b366ff'].forEach((c,k)=>{x.fillStyle=c;x.beginPath();x.moveTo(W*.5-k*0,H*.3+k*H*.05);x.fillRect(W*.02,H*.38+k*H*.075,W*.46,H*.075)})}},0,-.23,-.256)})}}],
general:[
 {name:'Desert Marshal',ov:{t:0xd9c28f,sl:0xd9c28f,l:0xd2ba86,hip:0xbfa772,sh:0x4b3a28},build(r){const{bg,hg}=r;hide(hg,m=>m.position.y>.6);cap(hg,0xd8c08e,0x151515,GD());
   box(bg,.1,.82,.04,0x5a3a22,0,1.25,-.28,[0,0,.62],.01);box(bg,.97,.09,.55,0x5a3a22,0,.86,0,0,.02);box(bg,.14,.1,.04,GD(),0,.86,-.28);
   r.lg.forEach((l,i)=>{box(l,.2,.22,.12,0x5a3a22,i?.1:-.1,-.15,-.3)})}},
 {name:'Victory Parade',ov:{t:0x0e5a2d,sl:0x0e5a2d,l:0x0e5a2d,hip:0x0a4422,sh:0x111111},build(r){const{bg,hg}=r;hide(hg,m=>m.position.y>.6);cap(hg,0x0d5a2b,0x111111,GD());tor(hg,.5,.02,GD(),0,.74,0,[PI/2,0,0]);
   box(bg,.15,.98,.05,0xc4161c,0,1.25,-.285,[0,0,-.62],.01);[0,1,2,3,4].forEach(i=>cyl(bg,.015,.015,.14,GD(),-.38+i*.05*0-.3+i*.06,.78-i*.05+.02,-.3));
   [.04,.12,.2].forEach((x,i)=>{box(bg,.045,.12,.02,[0xc4161c,0xffffff,0x1f9d4a][i],-.2+x*.7,1.43,-.285,0,.005);sph(bg,.06,GD(),-.2+x*.7,1.31,-.3,[1,1,.4])});starIcon&&sph(bg,.07,GD(),-.1,1.15,-.3,[1,1,.4]);
   [r.la,r.ra].forEach(a=>{box(a,.4,.07,.28,GD(),0,.06,0,0,.02);for(let i=0;i<5;i++)cyl(a,.016,.016,.14,GD(),(i-2)*.07,-.06,.1)});
   box(bg,.97,.09,.55,0x151515,0,.86,0,0,.02);box(bg,.16,.12,.04,GD(),0,.86,-.28);
   r.lg.forEach((l,i)=>box(l,.02,.44,.22,GD(),(i?1:-1)*.24,-.23,0,0,.005))}}],
trader:[
 {name:'Neon Genius',ov:{},build(r){const{bg,hg}=r,CY=GL(0x35e6ff);[0,1,2].forEach(i=>tor(hg,.32,.012,CY,0,.62,0,[PI/2-.5+i*.5,i*.9,0]));
   box(bg,.6,.46,.12,0x16181c,0,1.28,-.31);dec(bg,.3,.3,'tat',(x,W,H)=>{x.strokeStyle='#35e6ff';x.lineWidth=W*.04;[0,PI/3,2*PI/3].forEach(a=>{x.save();x.translate(W/2,H/2);x.rotate(a);x.beginPath();x.ellipse(0,0,W*.42,W*.16,0,0,7);x.stroke();x.restore()});ci(x,'#35e6ff',W/2,H/2,W*.06)},0,1.3,-.372,PI,0,1);
   straps(bg,0x16181c);box(bg,.14,.14,.05,0x2a2d33,.22,1.1,-.34);box(bg,.09,.07,.02,CY,.22,1.12,-.37,0,.005);belt(bg,0x16181c,CY);
   [r.la,r.ra].forEach(a=>{box(a,.2,.04,.04,CY,0,-.12,-.17);a.fa&&box(a.fa,.04,.3,.04,CY,0,-.17,-.15)});
   cyl(bg,.12,.12,.7,GS(0x39d6ff,.55),.24,1.28,.37);cyl(bg,.125,.125,.06,0x16181c,.24,1.65,.37);cyl(bg,.125,.125,.06,0x16181c,.24,.93,.37);box(bg,.5,.5,.1,0x16181c,-.1,1.25,.34);
   r.lg.forEach((l,i)=>{pocket(l,0x16181c,0x35e6ff,i?1:-1);box(l,.04,.34,.02,CY,i?-.1:.1,-.2,-.255)})}},
 {name:'Mad Professor',ov:{t:0xf1efe6,sl:0xf1efe6},td(x){rc(x,'#f1efe6',0,0,300,270);pg(x,'#fff',[[96,0],[150,0],[150,100]]);pg(x,'#fff',[[204,0],[150,0],[150,100]]);ln(x,'#222',5,[[84,0],[122,92],[100,92]]);ln(x,'#222',5,[[216,0],[178,92],[200,92]]);pg(x,'#111',[[138,10],[162,10],[168,52],[150,176],[132,52]]);[['#6fd830',70,120,22],['#b04bd8',220,150,18],['#6fd830',200,60,12],['#b04bd8',90,190,14]].forEach(([c,a,b,rr])=>{ci(x,c,a,b,rr);ci(x,c,a+rr*.9,b+rr*.4,rr*.45)});rc(x,'#151515',0,222,300,48)},
  build(r){const{bg,hg}=r,GR=GL(0x66ff3a);[[-.3,.55,0],[.3,.55,.4],[-.2,.82,1.2],[.25,.85,2],[0,.62,-.42]].forEach(([x,y,a],i)=>tor(hg,.11,.035,0xf3a6b6,x*1.25,y,i%2?.3:-.3,[a,i*.8,a*.5],4.2));
   tor(hg,.41,.03,0x1b1b1b,0,.54,0,[PI/2,0,0]);[-1,1].forEach(s=>{cyl(hg,.16,.16,.09,0x1b1b1b,s*.17,.6,-.38,[PI/2,0,0]);cyl(hg,.12,.12,.1,GR,s*.17,.6,-.43,[PI/2,0,0])});
   box(bg,.4,.6,.08,0xf1efe6,-.23,.5,-.3);box(bg,.4,.6,.08,0xf1efe6,.23,.5,-.3);box(bg,.95,.6,.08,0xf1efe6,0,.52,.3);
   box(bg,.1,.85,.04,0x6b4426,0,1.22,-.28,[0,0,.5],.01);belt(bg,0x6b4426,0x9a9a9a);[-.2,-.07,.07,.2].forEach((x,i)=>cyl(bg,.035,.035,.2,GL(i%2?0xb44cff:0x66ff3a),x,.8,-.33));
   box(bg,.22,.22,.07,0x3a3a3f,.18,1.35,-.3);dec(bg,.16,.16,'tfl',(x,W,H)=>{x.fillStyle='#66ff3a';x.beginPath();x.moveTo(W*.4,H*.1);x.lineTo(W*.6,H*.1);x.lineTo(W*.6,H*.4);x.lineTo(W*.82,H*.85);x.lineTo(W*.18,H*.85);x.lineTo(W*.4,H*.4);x.closePath();x.fill()},.18,1.35,-.338,PI,0,1);
   box(bg,.46,.58,.16,0x6b4426,-.18,1.22,.36);cyl(bg,.05,.05,.6,GL(0x66ff3a),.1,1.3,.4);cyl(bg,.05,.05,.5,GL(0xb44cff),.2,1.25,.4);cyl(bg,.012,.012,.55,0x222,-.36,1.55,.38);sph(bg,.06,GR,-.36,1.85,.38);
   [[.25,1.3,-.3,.07,0x66ff3a],[-.2,1.15,-.3,.06,0xb44cff],[.3,.62,-.34,.07,0xb44cff],[-.35,.5,-.34,.06,0x66ff3a]].forEach(([x,y,z,rr,c])=>sph(bg,rr,c,x,y,z,[1,1,.3]));
   [r.la,r.ra].forEach((a,i)=>sph(a,.07,i?0x66ff3a:0xb44cff,0,-.15,-.15,[1,1,.35]))}}],
giga:[
 {name:'Arena Titan',ov:{},build(r){const{bg,hg}=r;[r.la,r.ra].forEach(a=>{pad(a,GD(),GD(0xf0c850),.28);[-1,0,1].forEach(z=>sph(a,.03,0x1a1a1a,z*.16,.12,.14))});
   [-1,1].forEach(s=>box(bg,.08,.9,.04,KB,s*.1,1.25,-.27,[0,0,s*.45],.01));box(bg,.96,.14,.55,KB,0,.88,0,0,.02);cyl(bg,.2,.2,.07,GD(),0,.88,-.3,[PI/2,0,0],8);dec(bg,.22,.22,'gcr',(x,W,H)=>crownIcon(x,W*.9,H*.9,'#1a1a1a'),0,.88,-.34);
   box(bg,.32,.3,.06,KB,0,.6,-.3);box(bg,.26,.04,.02,GD(),0,.72,-.335);[-1,1].forEach(s=>box(bg,.05,.28,.02,GD(),s*.14,.6,-.335));
   [r.la,r.ra].forEach(a=>a.fa&&cyl(a.fa,.17,.16,.14,GD(),0,-.1,0));
   r.lg.forEach((l,i)=>{box(l,.24,.2,.07,GD(),(i?1:-1)*.07,-.1,-.285);box(l,.22,.16,.07,GD(),0,-.33,-.285);box(l,.48,.04,.5,GD(),0,-.46,0,0,.01);box(l,.48,.04,.5,GD(),0,-.02,0,0,.01)})}},
 {name:'Shadow Flex',ov:{sl:0x1d1d21,l:0x17171a,hip:0x111113},build(r){const{bg,hg}=r,BL=0x1c1c20,GY=0x55555b;tor(hg,.4,.13,0x16161a,0,.03,0,[PI/2,0,0]);
   [-1,1].forEach(s=>{box(bg,.3,.48,.12,BL,s*.19,1.3,-.31);[0,1,2].forEach(i=>box(bg,.13,.14,.09,0x2b2b30,s*.19,1.12-i*.0,-.385+0,0,.02).position.set(s*.19,1.2-i*.12,-.4));box(bg,.06,.05,.03,GY,s*.19,1.45,-.375)});
   straps(bg,0x111114,1.3,.54);belt(bg,0x111114,GY);[r.la,r.ra].forEach(a=>{pad(a,0x1b1b1f,null,.29);[-1,1].forEach(z=>sph(a,.03,GY,z*.15,.1,.18));a.fa&&cyl(a.fa,.17,.16,.16,0x1b1b1f,0,-.1,0)});
   r.lg.forEach((l,i)=>{pocket(l,0x2b2b30,null,i?1:-1);box(l,.26,.2,.09,GY,0,-.02,-.285)})}}],
troll:[
 {name:'Rage Mode',ov:{t:0x8a1218,sl:0x8a1218,hip:0x4a0a0e,cuff:0x3a0508},build(r){const{bg,hg}=r,RD=0xc01f26;
   [-1,1].forEach(s=>{cone(hg,.11,.44,RD,s*.25,.8,-.02,[0,0,-s*.4],10);cyl(hg,.12,.14,.08,0x4a0a0e,s*.2,.6,-.02,[0,0,-s*.4])});
   dec(bg,.34,.3,'trg',(x,W,H)=>{[[.28,.78,.3],[.5,.9,.42],[.72,.76,.3]].forEach(([a,b,c],i)=>{x.fillStyle=['#ff8a00','#ffd23a','#ff8a00'][i];x.beginPath();x.moveTo(W*(a-.17),H*.96);x.quadraticCurveTo(W*(a-.2),H*(1-c*1.3),W*a,H*(1-b));x.quadraticCurveTo(W*(a+.2),H*(1-c*1.3),W*(a+.17),H*.96);x.closePath();x.fill()});
     x.fillStyle='#ff3b1c';x.beginPath();x.moveTo(W*.12,H*.97);x.quadraticCurveTo(W*.5,H*.52,W*.88,H*.97);x.closePath();x.fill()},0,1.12,-.272);
   [r.la,r.ra].forEach((a,i)=>[-1,0,1].forEach(z=>cone(a,.05,.2,0x2a0508,0,.2,z*.1,[0,0,(i?-1:1)*.5],6)));box(bg,.16,.1,.04,0xc01f26,0,.87,-.28,0,.012)}},
 {name:'Gold Meme Lord',ov:{},build(r){const{bg,hg}=r;hide(bg,m=>m.userData.hood);crown(hg,.58,GD(),0xd02a2a);
   tor(bg,.34,.045,GD(),0,1.58,-.02,[PI/2,0,0]);box(bg,.16,.16,.04,GD(),0,1.3,-.29,0,.02);dec(bg,.14,.14,'tgm',(x,W,H)=>{ci(x,'#fff',W/2,H/2,W*.46);DRAWTROLL(x,W/2,H/2+W*.02,W/250,'#111')},0,1.3,-.318);
   [r.la,r.ra].forEach(a=>pad(a,GD(),GD(0xf0c850),.27));box(bg,.7,.5,.1,GD(),0,1.32,.36)}}],
stonks:[
 {name:'Bull Market',ov:{t:0x17603a,sl:0x17603a,l:0x17603a,hip:0x0f3f26},build(r){const{bg,hg}=r;
   [-1,1].forEach(s=>{cyl(hg,.09,.12,.2,0xf1ead6,s*.45,.56,0,[0,0,s*PI/2]);cone(hg,.09,.4,0xf1ead6,s*.66,.7,0,[0,0,-s*.7],10)});
   tor(hg,.065,.016,GD(),0,.2,-.43);box(bg,.1,.1,.04,GD(),.2,1.3,-.275,0,.015);box(bg,.16,.04,.04,GD(),0,1.28,-.285,0,.01);
   dec(bg,.2,.2,'sbu',(x,W,H)=>{x.fillStyle='#20e070';x.beginPath();x.moveTo(W*.1,H*.9);x.lineTo(W*.5,H*.1);x.lineTo(W*.9,H*.9);x.lineTo(W*.62,H*.9);x.lineTo(W*.5,H*.55);x.lineTo(W*.38,H*.9);x.closePath();x.fill()},-.2,1.1,-.272)}},
 {name:'Bear Market',ov:{t:0x6e1b1b,sl:0x6e1b1b,l:0x4a1313,hip:0x330c0c},build(r){const{bg,hg}=r;
   [-1,1].forEach(s=>{sph(hg,.15,0x5a3a22,s*.3,.64,0,[1,1,.7]);sph(hg,.08,0xe8c9a3,s*.3,.64,-.07,[1,1,.5])});
   dec(bg,.34,.34,'sbd2',(x,W,H)=>{x.fillStyle='#ff4a4a';x.beginPath();x.moveTo(W*.3,H*.1);x.lineTo(W*.7,H*.1);x.lineTo(W*.7,H*.5);x.lineTo(W*.9,H*.5);x.lineTo(W*.5,H*.92);x.lineTo(W*.1,H*.5);x.lineTo(W*.3,H*.5);x.closePath();x.fill()},0,1.2,.516,0);
   [-1,1].forEach(s=>{sph(hg,.22,0x6b4a2e,s*.2,.08,-.1,[1.4,.6,1.2])});[r.la,r.ra].forEach(a=>{sph(a,.09,0x5a3a22,0,-.2,.12,[1.2,.9,.7])});box(bg,.1,.12,.04,0xff4a4a,0,1.0,-.285,0,.012)}}],
sahur:[
 {name:'Rune Totem',ov:{},build(r){const{bg,hg}=r,CY=GL(0x35e6ff);
   // Tung Tung Tung is a tall log: head cylinder r .31, boxy torso/legs. Rings hug those shapes (no floating discs).
   const rune=(x,W,H)=>{x.strokeStyle='#35e6ff';x.lineWidth=W*.045;x.lineCap='round';x.lineJoin='round';
     x.beginPath();x.arc(W*.5,H*.36,W*.2,0,7);x.stroke();ln(x,'#35e6ff',W*.05,[[W*.5,H*.08],[W*.5,H*.7]]);ln(x,'#35e6ff',W*.05,[[W*.28,H*.28],[W*.5,H*.5],[W*.72,H*.28]]);
     ln(x,'#35e6ff',W*.05,[[W*.14,H*.8],[W*.34,H*.94],[W*.54,H*.8],[W*.74,H*.94],[W*.88,H*.82]])};
   dec(bg,.56,.5,'srn',rune,0,1.25,-.272,PI,0,true);dec(bg,.56,.5,'srn',rune,0,1.25,.272,0,0,true);
   [r.la,r.ra].forEach(a=>{tor(a,.17,.02,CY,0,-.18,0,[PI/2,0,0]);a.fa&&tor(a.fa,.17,.02,CY,0,-.15,0,[PI/2,0,0])});
   r.lg.forEach(l=>{box(l,.46,.035,.48,CY,0,-.2,-.01,0,.01);box(l,.46,.035,.48,CY,0,-.38,-.01,0,.01)});
   box(bg,.86,.035,.5,CY,0,.64,0,0,.01);
   tor(hg,.4,.02,CY,0,.1,0,[PI/2,0,0]);tor(hg,.4,.02,CY,0,.97,0,[PI/2,0,0])}},
 {name:'Spring Sprout',ov:{},build(r){const{bg,hg}=r,GR=0x4caf2f;
   const U=.45; // the log head of Tung Tung Tung is taller than a normal head, so the sprout sits higher
   cyl(hg,.03,.04,.3,0x3b7a22,0,.84+U,0);[[-1,.3],[1,-.3]].forEach(([s,z])=>{sph(hg,.14,GR,s*.15,1.0+U,0,[1.5,.35,.8]).rotation.z=-s*.5});
   [[.3,.6,-.1],[-.25,.62,.15],[0,.6,.3]].forEach(([a,b,c])=>sph(hg,.09,0x3b7a22,a,b+U,c,[1.2,.5,1.2]));
   [r.la,r.ra].forEach((a,i)=>{sph(a,.13,0x3b7a22,0,.02,0,[1.3,.5,1.1]);sph(a,.06,i?0xff7ab8:0xffd23a,0,.1,.02,[1,.8,1])});
   [[-.2,1.0,-.27],[.18,.7,-.27]].forEach(([a,b,c],i)=>{sph(bg,.07,0x3b7a22,a,b,c,[1.4,.8,.5]);sph(bg,.035,i?0xffd23a:0xff7ab8,a+.02,b+.03,c-.02)});
   [-.2,.15].forEach((x,i)=>{sph(bg,.08,0x3b7a22,x,.95+i*.2,.255,[1.3,.8,.5]);sph(bg,.035,i?0xffd23a:0xff7ab8,x+.02,.98+i*.2,.27)})}}],
pork:[
 {name:'Chef Pork',ov:{},build(r){const{bg,hg}=r;hide(hg,m=>m.geometry&&(m.geometry.type==='ConeGeometry'||m.geometry.type==='TorusGeometry'||Math.abs(m.position.x)>.4));
   cyl(hg,.42,.43,.1,0xf4f4f4,0,.6,0);cyl(hg,.47,.43,.34,0xffffff,0,.82,0);[0,1,2,3,4].forEach(i=>{const a=i*PI*2/5;sph(hg,.17,0xffffff,.27*Math.sin(a),1.06,.27*Math.cos(a),[1,.9,1])});sph(hg,.28,0xffffff,0,1.14,0,[1,.7,1]);
   [-1,1].forEach(s=>sph(hg,.1,0xf2a0b3,s*.4,.52,.02,[.6,1,.9]));
   box(bg,.64,.58,.04,0xf4f4f4,0,1.08,-.27,0,.012);box(bg,.5,.05,.05,0xf4f4f4,0,1.4,-.255,0,.01);
   dec(bg,.3,.2,'pcf',(x,W,H)=>{ci(x,'#f2a0b3',W*.5,H*.55,W*.28);ci(x,'#f6b3c2',W*.5,H*.62,W*.14);[-1,1].forEach(s=>ci(x,'#6b2a3a',W*(.5+s*.05),H*.62,W*.02))},0,1.1,-.296);
   box(bg,.2,.1,.05,0xf4f4f4,.22,.82,-.28);cyl(bg,.025,.025,.5,0xc89a62,.4,1.2,.38,[0,0,.2]);sph(bg,.08,0xc89a62,.46,1.46,.38,[1,1.4,.5])}},
 {name:'Neon DJ',ov:{},build(r){const{bg,hg}=r,CY=GL(0x35e6ff),PN=GL(0xff3ec8);
   recolorHat(hg,-9,m=>m.geometry.type==='TorusGeometry'?PN:(Math.abs(m.position.x)>.4?(Math.abs(m.position.x)>.5?CY:0x111111):undefined));
   [-1,1].forEach(s=>tor(hg,.2,.02,CY,s*.57,.3,.02,[0,PI/2,0]));
   dec(bg,.52,.4,'pdj',(x,W,H)=>{x.textAlign='center';x.textBaseline='middle';x.font='900 '+(H*.42)+'px Arial Black,Impact,sans-serif';x.shadowColor='#ff3ec8';x.shadowBlur=14;x.fillStyle='#ffd0f0';x.fillText('JOHN',W/2,H*.3);x.shadowColor='#35e6ff';x.fillStyle='#d4fbff';x.fillText('PORK',W/2,H*.72)},0,1.26,-.274,PI,0,true);
   cyl(bg,.34,.34,.05,0x111111,0,1.3,.38,[PI/2,0,0],36);cyl(bg,.12,.12,.06,0xff3ec8,0,1.3,.4,[PI/2,0,0]);tor(bg,.25,.012,CY,0,1.3,.41);tor(bg,.31,.012,PN,0,1.3,.41);
   [r.la,r.ra].forEach(a=>tor(a,.17,.018,PN,0,-.1,0,[PI/2,0,0]))}}]
};
function cap(hg,c,band,gold){cyl(hg,.43,.43,.1,band,0,.62,0);cyl(hg,.62,.45,.2,c,0,.77,0);cyl(hg,.62,.62,.05,c,0,.9,0);half(hg,.62,c,0,.92,0,[1,.12,1]);
 add(hg,gc('cpk',()=>new TH.CylinderGeometry(.46,.46,.08,24,1,false,PI-.8,1.6)),mt(0x111111),0,.62,0);box(hg,.5,.04,.3,0x111111,0,.58,-.52,[.2,0,0],.015);tor(hg,.44,.016,gold,0,.675,0,[PI/2,0,0]);
 dec(hg,.3,.26,'gcp'+(c===0xd8c08e?'a':'b'),(x,W,H)=>{ci(x,'#e6b422',W/2,H*.52,W*.2);starIcon(x,W/2,H*.52,W*.2,'#8a5a1c');x.strokeStyle='#e6b422';x.lineWidth=W*.05;x.beginPath();x.arc(W/2,H*.5,W*.34,PI*.1,PI*.9);x.stroke()},0,.76,-.56,PI,-.28)}
// ---------- plumbing ----------
const ID={};try{for(const id in LOOK)ID[LOOK[id].nm]=id}catch(e){}
const _mini=mini;
mini=function(L){const k=window.__SKN|0,id=ID[L.nm]||(L.nm&&ID[L.nm.split('~')[0]]),d=ok(k)&&k>0&&id&&SK[id]&&SK[id][k-1];
 if(!d){const r=_mini(L);if(k>=3&&ok(k)&&id&&window.SHINE)try{SHINE.deco(r,k===3?'goldskin':'shinyskin')}catch(e){}return r}
 const V=Object.assign({},L.v,d.ov||{});if(d.td){const o=L.v.td;V.td=x=>{d.td(x)}}
 if(d.hd){const o=L.v.hd;V.hd=x=>{o(x);d.hd(x)}}
 const r=_mini(Object.assign({},L,{nm:L.nm+'~'+k,v:V}));try{d.build(r)}catch(e){console.error('skin',id,k,e)}return r};
const withK=(k,fn)=>{const o=window.__SKN;window.__SKN=k|0;try{return fn()}finally{window.__SKN=o}};
const NAMES=id=>{const d=SK[id]||[],nm=(()=>{try{return LOOK[id].nm}catch(e){return id}})();return[{name:'Default'},{name:d[0]?d[0].name:'Skin 1'},{name:d[1]?d[1].name:'Skin 2'},{name:'Golden '+nm,lock:!owned(id,3),fx:'gold'},{name:'Shiny '+nm,lock:!owned(id,4),fx:'shiny'}]};
window.SKN={get,set,list:NAMES,with:withK,owned,price,buy,rarity:rarOf,shop,inShop,nextIn,HOUR};
// every time a fighter is built: you wear your chosen skin; online the opponent wears theirs; the CPU sometimes wears one
const _skin=skin;skin=function(e,id){let k=0;
 if(e===window.P||e===P)k=get(id);else if(window.NET&&NET.on)k=(e.skn|0);else k=Math.random()<.3?1+((Math.random()*2)|0):0;
 k=ok(k)?k:0;e.skn=k;withK(k,()=>_skin(e,id))};
})();
