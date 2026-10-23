/* Arsenal, brick gun models, extra cover, loot bags and items, LEGO walk cycle, overhead health bars. */
(()=>{
// ---------- weapons
Object.entries(WP).forEach(([id,w])=>w.id=id);
Object.assign(WP.rifle,{n:'Assault Rifle',mag:30,rl:1.4,br:12});
Object.assign(WP.shotgun,{n:'Pump Shotgun',mag:6,rl:1.8,br:5});
Object.assign(WP.rpg,{n:'Rocket Launcher',mag:1,rl:1.9,br:15});
Object.assign(WP,{
 burst:{id:'burst',n:'Burst Rifle',rate:.5,dmg:11,spd:80,pel:3,spr:.006,life:1.3,mag:8,rl:1.5,br:14},
 smg:{id:'smg',n:'SMG',rate:.075,dmg:5,spd:65,pel:1,spr:.04,life:.9,auto:1,mag:35,rl:1.3,br:8},
 pistol:{id:'pistol',n:'Pistol',rate:.28,dmg:14,spd:70,pel:1,spr:.01,life:1,mag:12,rl:1.1,br:10},
 tac:{id:'tac',n:'Tactical Shotgun',rate:.35,dmg:6,spd:55,pel:6,spr:.12,life:.3,auto:1,mag:8,rl:2,br:6},
 sniper:{id:'sniper',n:'Sniper Rifle',rate:1.3,dmg:55,spd:140,pel:1,spr:0,life:1.5,mag:1,rl:3.2,br:24}});
Object.values(WP).forEach(w=>MAG[w.id]=[w.mag,w.rl]);
// ---------- detailed LEGO-style guns. Barrel points to -Z, grip hangs down (-Y), stock toward +Z.
// op formats: ['b',w,h,d,x,y,z,color,kind?,tiltX?,round?]  rounded brick
//             ['c',radius,length,x,y,z,color,kind?]           cylinder along Z
//             ['k',rFront,rBack,length,x,y,z,color,kind?]     cone/taper along Z (rFront at -Z)
//             ['s',count,x,y,z0,dz,color]                     row of studs on top
const rbx=window.rbx=(w,h,d,r)=>{r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const sh=new THREE.Shape(),x=w/2-r,y=h/2-r;sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g};
const GM={},gm=(c,k='p')=>GM[c+k]||(GM[c+k]=new THREE.MeshPhysicalMaterial(k==='m'?{color:c,metalness:.85,roughness:.3,envMapIntensity:1.1}:k==='t'?{color:c,transparent:true,opacity:.62,roughness:.05,clearcoat:1,envMapIntensity:1.2}:{color:c,roughness:.3,clearcoat:.9,clearcoatRoughness:.1,envMapIntensity:.8}));
const SG=new THREE.CylinderGeometry(.03,.03,.028,12);
const BLK=0x1a1c1f,DGY=0x2c3036,GRY=0x474d55;
const RDOT=(x,y,z)=>[['b',.1,.035,.16,x,y,z,BLK],['b',.085,.085,.03,x,y+.06,z+.065,BLK],['b',.085,.085,.03,x,y+.06,z-.065,BLK],['b',.05,.06,.012,x,y+.06,z-.07,0x66ccff,'t'],['b',.012,.012,.012,x,y+.075,z-.05,0xff2222]];
const SCOPE=(y,z,len,r)=>[['c',r,len,0,y,z,BLK,'m'],['c',r*1.45,.1,0,y,z-len/2,BLK,'m'],['c',r*1.2,.08,0,y,z+len/2,BLK,'m'],['c',r*1.3,.012,0,y,z-len/2-.055,0x66aaff,'t'],['b',.06,.09,.09,0,y-r-.035,z,BLK],['c',.02,.05,0,y+r+.015,z,GRY,'m']];
const TG=(y,z)=>[['b',.022,.022,.2,0,y,z,BLK],['b',.022,.1,.022,0,y+.05,z-.1,BLK],['b',.02,.016,.04,0,y+.035,z+.02,0xcccccc,'m']];
const GUN={
 rifle:[['b',.15,.19,.62,0,0,-.05,DGY],['b',.154,.05,.14,0,.035,-.02,0x0a0a0a],['b',.1,.04,.78,0,.115,-.12,BLK],['s',6,0,.142,-.45,.12,BLK],
  ['b',.145,.155,.56,0,-.01,-.6,GRY],['b',.148,.04,.34,0,.02,-.62,0x101214],['b',.148,.04,.34,0,-.05,-.62,0x101214],
  ['c',.03,.5,0,.0,-1.12,0x0d0d0d,'m'],['c',.052,.15,0,0,-1.4,BLK,'m'],['b',.03,.12,.03,0,.065,-1.05,BLK],
  ['b',.11,.2,.52,0,-.03,.46,DGY],['b',.12,.25,.07,0,-.03,.74,0x0d0d0d],['b',.1,.04,.3,0,.075,.44,BLK],
  ['b',.09,.26,.11,0,-.22,.12,BLK,'p',.25],['b',.085,.3,.15,0,-.25,-.2,BLK,'p',.12],['b',.09,.04,.16,0,-.41,-.18,0xff8c00,'p',.12],...TG(-.12,-.02),...RDOT(0,.135,-.08)],
 burst:[['b',.15,.18,.7,0,0,-.05,0x8a7a55],['b',.154,.05,.14,0,.03,0,0x0a0a0a],['b',.14,.14,.6,0,-.01,-.65,0x5a3d22],['b',.145,.03,.5,0,.045,-.68,0x3b2814],['b',.145,.03,.5,0,-.065,-.68,0x3b2814],
  ['c',.03,.58,0,0,-1.16,0x0d0d0d,'m'],['c',.048,.12,0,0,-1.46,BLK,'m'],['b',.03,.12,.03,0,.07,-1.25,BLK],
  ['b',.11,.21,.46,0,-.03,.52,0x5a3d22],['b',.12,.25,.07,0,-.03,.78,0x0d0d0d],
  ['b',.09,.26,.11,0,-.22,.12,0x5a3d22,'p',.25],['b',.08,.26,.14,0,-.22,-.22,0x3b2814,'p',.1],...SCOPE(.2,-.05,.36,.045),...TG(-.12,-.02)],
 smg:[['b',.14,.18,.52,0,0,-.05,0x25282b],['b',.1,.035,.52,0,.105,-.05,BLK],['s',5,0,.131,-.25,.12,BLK],
  ['c',.058,.44,0,0,-.52,BLK,'m'],['c',.062,.02,0,0,-.46,0x333333,'m'],['c',.062,.02,0,0,-.56,0x333333,'m'],['c',.062,.02,0,0,-.66,0x333333,'m'],['c',.03,.12,0,0,-.78,0x0d0d0d,'m'],
  ['b',.08,.14,.34,0,0,.36,0x25282b],['b',.09,.17,.05,0,0,.54,0x0d0d0d],['b',.04,.04,.3,.04,.05,.36,GRY,'m'],
  ['b',.085,.36,.1,0,-.27,-.15,BLK,'p',.05],['b',.09,.04,.11,0,-.46,-.145,0xff8c00,'p',.05],['b',.09,.22,.1,0,-.2,.12,BLK,'p',.18],['b',.07,.15,.08,0,-.115,-.42,BLK],...RDOT(0,.12,-.1),...TG(-.1,0)],
 pistol:[['b',.12,.12,.48,0,.075,-.1,0x1c1e21],['b',.124,.03,.3,0,.09,-.05,0x0a0a0a],['b',.11,.08,.42,0,-.01,-.07,0x3a3f45],['c',.026,.06,0,.075,-.37,0x0d0d0d,'m'],
  ['b',.1,.26,.13,0,-.15,.1,0x3a3f45,'p',.2],['b',.101,.03,.14,0,-.26,.085,0x1c1e21,'p',.2],['b',.03,.035,.03,0,.15,-.3,BLK],['b',.05,.035,.03,0,.15,.12,BLK],
  ['b',.02,.02,.14,0,-.075,-.06,BLK],['b',.02,.07,.02,0,-.035,-.13,BLK],['b',.02,.04,.02,0,-.06,.02,0xcccccc,'m'],['s',3,0,.032,-.28,.07,0x3a3f45]],
 shotgun:[['b',.14,.17,.5,0,0,0,0x2a2d31],['b',.144,.05,.14,0,.03,.04,0x0a0a0a],['c',.045,1.1,0,.03,-.73,0x16181a,'m'],['c',.038,.9,0,-.065,-.63,0x2a2d31,'m'],['c',.05,.04,0,.03,-1.29,0x888888,'m'],
  ['b',.13,.12,.34,0,-.07,-.62,0x6b4423],['b',.134,.015,.02,0,-.07,-.52,0x2a1808],['b',.134,.015,.02,0,-.07,-.6,0x2a1808],['b',.134,.015,.02,0,-.07,-.68,0x2a1808],['b',.134,.015,.02,0,-.07,-.76,0x2a1808],
  ['b',.12,.22,.5,0,-.03,.48,0x6b4423,'p',.0],['b',.12,.25,.07,0,-.03,.75,0x1a1a1a],['b',.09,.24,.11,0,-.2,.14,0x6b4423,'p',.25],['b',.03,.04,.03,0,.075,-1.2,0xffd02f],...TG(-.12,.0)],
 tac:[['b',.17,.2,.66,0,0,-.05,0x2a2d31],['b',.1,.04,.76,0,.12,-.1,BLK],['s',6,0,.148,-.42,.12,BLK],
  ['c',.05,.72,0,.02,-.65,0x16181a,'m'],['b',.15,.15,.4,0,.0,-.68,0x3a3f45],['b',.152,.03,.3,0,.04,-.68,0x0a0a0a],['b',.152,.03,.3,0,-.02,-.68,0x0a0a0a],['c',.056,.05,0,.02,-1.03,0x888888,'m'],
  ['b',.11,.21,.34,0,-.02,.42,0x2a2d31],['b',.12,.25,.06,0,-.02,.62,0x0d0d0d],['b',.09,.26,.11,0,-.22,.06,BLK,'p',.22],
  ['b',.11,.2,.13,0,-.15,-.62,0xe3000b],['b',.115,.03,.14,0,-.26,-.62,0xa80008],['b',.11,.26,.2,0,-.2,-.2,0xe3000b,'p',.05],...TG(-.11,-.02)],
 sniper:[['b',.13,.17,.9,0,0,-.05,0x4a5a3a],['b',.134,.05,.14,0,.03,.0,0x0a0a0a],['b',.1,.035,.9,0,.1,-.1,BLK],['s',7,0,.128,-.5,.12,BLK],
  ['c',.034,1.05,0,.02,-1.0,0x0d0d0d,'m'],['c',.055,.16,0,.02,-1.58,BLK,'m'],['c',.05,.05,0,.02,-1.5,0x333333,'m'],
  ['b',.11,.23,.5,0,-.02,.62,0x4a5a3a],['b',.12,.27,.07,0,-.02,.9,0x0d0d0d],['b',.1,.06,.26,0,.12,.58,0x2f3b25],
  ['b',.09,.26,.11,0,-.22,.1,0x2f3b25,'p',.22],['b',.085,.2,.13,0,-.2,-.2,BLK,'p',.08],
  ['b',.025,.3,.025,.07,-.15,-.78,GRY,'m',-1.25],['b',.025,.3,.025,-.07,-.15,-.78,GRY,'m',-1.25],['b',.19,.16,.06,0,-.08,-.8,GRY,'m'],
  ...SCOPE(.2,-.15,.6,.05),['c',.025,.05,.0,.255,-.15,0x888888,'m'],...TG(-.115,-.02)],
 rpg:[['c',.14,1.15,0,0,-.2,0x556b2f],['c',.15,.07,0,0,-.55,0x2f3b1c],['c',.15,.07,0,0,.1,0x2f3b1c],['k',.14,.22,.46,0,0,.53,0x333a40],['c',.2,.05,0,0,.78,0x333a40,'m'],
  ['c',.19,.13,0,0,-.83,0x2f3b1c],['k',.01,.185,.46,0,0,-1.08,0xe3000b],['c',.07,.02,0,0,-1.32,0xffd02f],
  ['b',.09,.24,.11,0,-.2,-.12,BLK,'p',.22],['b',.08,.2,.09,0,-.19,-.6,BLK],['b',.05,.14,.04,0,.2,-.25,BLK],['b',.04,.04,.02,0,.28,-.25,0x66ccff,'t'],['b',.06,.04,.2,0,.15,-.3,BLK],...TG(-.13,-.22)]};
window.GUN=GUN;window.GUNK={BLK,DGY,GRY,SCOPE,TG,RDOT}; // shared parts for newguns.js

const GC=id=>window.SIGDEF&&SIGDEF[id]?SIGDEF[id].cls:window.XW&&XW[id]?XW[id].cls:id; // a signature gun (or one of the new guns in newguns.js) is held, aimed and sounds like its class
function buildGun(id,raw){const i=new THREE.Group();
 (GUN[id]||GUN[GC(id)]||GUN.rifle).forEach(o=>{const t=o[0];let m;
  if(t==='b'){m=new THREE.Mesh(rbx(o[1],o[2],o[3],o[10]||.018),gm(o[7],o[8]));m.position.set(o[4],o[5],o[6]);m.rotation.x=o[9]||0}
  else if(t==='c'){const g=new THREE.CylinderGeometry(o[1],o[1],o[2],18);g.rotateX(Math.PI/2);m=new THREE.Mesh(g,gm(o[6],o[7]));m.position.set(o[3],o[4],o[5])}
  else if(t==='y'||t==='x'){const g=new THREE.CylinderGeometry(o[1],o[1],o[2],18);if(t==='x')g.rotateZ(Math.PI/2);m=new THREE.Mesh(g,gm(o[6],o[7]));m.position.set(o[3],o[4],o[5])} // y: cylinder standing up (shells, knobs), x: cylinder across the gun (side studs, pins)
  else if(t==='k'){const g=new THREE.CylinderGeometry(o[1],o[2],o[3],20);g.rotateX(-Math.PI/2);m=new THREE.Mesh(g,gm(o[7],o[8]));m.position.set(o[4],o[5],o[6])}
  else{const st=new THREE.Group();for(let n=0;n<o[1];n++){const s=new THREE.Mesh(SG,gm(o[6]));s.position.set(o[2],o[3],o[4]+n*o[5]);st.add(s)}i.add(st);return}
  i.add(m)});
 if(raw)return i;const w=new THREE.Group(),c=(window.HOLD&&HOLD.CFG[GC(id)])||{sc:.6,g:[.12,-.09]};
 // the top of the grip sits at the group origin (where the right hand is); the gun is scaled to minifig size
 i.position.set(0,-c.g[1],-c.g[0]);w.add(i);w.scale.setScalar(c.sc);return w}
window.buildGun=buildGun;
function attachGun(e,id){if(e.gun&&e.gun.parent)e.gun.parent.remove(e.gun);e.gun=buildGun(id);(e.aim||e.fa||e.ra).add(e.gun);e.hid=GC(id);window.HOLD&&HOLD.update(e)}
window.attachGun=attachGun;
setW=function(e,w){e.w=w;attachGun(e,w.sig||w.id)};
setW(P,P.w);setW(E,E.w);



// ---------- loot bags and items
const IT=window.IT={grenade:{n:'Grenade',c:0x44aaff,w:16},bandage:{n:'Bandage',c:0xffffff,w:22},medkit:{n:'Medkit',c:0xff3b3b,w:12},
 shield:{n:'Shield Potion',c:0x3399ff,w:18},slurp:{n:'Shield Jar',c:0x66e0ff,w:8},fish:{n:'Fish',c:0xff9a3b,w:14},trap:{n:'Trap',c:0x999999,w:10},
 fort:{n:'Port-a-Fortress',c:0xb08040,w:7}};
const rr=()=>window.NETH&&NETH.on()?NETH.rnd():Math.random(); // online matches share a seeded generator so both players see the same loot timers
const roll=()=>{let tot=0;for(const k in IT)tot+=IT[k].w;let r=Math.random()*tot;for(const k in IT){r-=IT[k].w;if(r<=0)return k}return'bandage'};
P.inv=[];E.inv=[];
const spots=[[0,0]].map(([x,z])=>{const m=new THREE.Group(),a=new THREE.Mesh(B(.9,.7,.7),M(0x3a6fd8)),b=new THREE.Mesh(B(.94,.18,.74),M(0xffd02f));
 a.position.y=.35;b.position.y=.5;m.add(a);m.add(b);m.position.set(x,0,z);m.visible=true;S.add(m);return{x,z,m,t:0,on:true}});
window.SPOTS=spots;
const GR=[],TP=[];
function throwG(e,d){const m=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),M(0x44aaff)),p=new THREE.Vector3(e.x,e.y+1.6,e.z).addScaledVector(d,.8);m.position.copy(p);S.add(m);
 GR.push({m,p,v:d.clone().multiplyScalar(17).add(new THREE.Vector3(0,4,0)),t:1.6,o:e})}
function use(e,i,dir,pos){const k=e.inv[i];if(!k)return;if(e===P&&window.NETH)NETH.use(k,dir);
 const hq=e.hs||1;if(window.ITEMS&&ITEMS.def[k]){if(ITEMS.use(e,k,dir,pos)===false)return}else if(k==='bandage')e.hp=Math.min(e.mx,e.hp+15*hq);else if(k==='medkit')e.hp=Math.min(e.mx,e.hp+50*hq);else if(k==='fish')e.hp=Math.min(e.mx,e.hp+30*hq);
 else if(k==='shield')e.ar=Math.min(50,e.ar+25);else if(k==='slurp')e.ar=50;
 else if(k==='grenade')throwG(e,dir);
 else if(k==='fort'){if(window.FORT&&FORT.throw(e,dir)===false)return}
 else if(k==='trap'){const m=new THREE.Mesh(B(1.4,.12,1.4),M(0x888888));m.position.set(e.x,e.y+.06,e.z);S.add(m);TP.push({m,x:e.x,z:e.z,y:e.y,o:e,t:.6})}
 e.inv.splice(i,1);if(e===P)say(IT[k].n.toUpperCase(),.7)}
window.BB={use};
function botItems(be,bp){const X=be||E,Y=bp||P,d=Math.hypot(Y.x-X.x,Y.z-X.z),at=k=>X.inv.indexOf(k),dir=new THREE.Vector3(Y.x-X.x,.3,Y.z-X.z).normalize();
 if(X.hp<55){for(const k of['medkit','fish','bandage']){const i=at(k);if(i>=0)return use(X,i,dir)}}
 if(X.ar<20){for(const k of['slurp','shield']){const i=at(k);if(i>=0)return use(X,i,dir)}}
 if(d>6&&d<18&&Math.random()<.4){const i=at('grenade');if(i>=0)return use(X,i,dir)}
 if(d<10&&Math.random()<.3){const i=at('trap');if(i>=0)return use(X,i,dir)}
 if(window.ITEMS)ITEMS.bot(X,d,dir,at)}
// hotbar: 1 gun, 2 hammer, 3 4 5 = utility slots (keys read by code so Shift + digit still works while crouching)
addEventListener('keydown',e=>{if(mode!=='play'||over||introT>0)return;const i={Digit3:0,Digit4:1,Digit5:2,Numpad3:0,Numpad4:1,Numpad5:2}[e.code];if(i!==undefined)use(P,i,C.getWorldDirection(new THREE.Vector3()))});
const _dmgA=dmg;dmg=function(e,n){const b=e.hp+e.ar;_dmgA(e,n);if(e.hp+e.ar<b)e.hitT=3.5}; // marks the victim; the opponent's health bar is only drawn for a few seconds after you hit them
const _rr=resetRound;
resetRound=function(i){_rr(i);P.inv=[];E.inv=[];P.hitT=E.hitT=0;GR.splice(0).forEach(g=>S.remove(g.m));TP.splice(0).forEach(t=>S.remove(t.m));spots.forEach(s=>{s.on=true;s.m.visible=true;s.t=0})}; // loot bags are there from the start of every round (pickups.js picks where)

// ---------- overhead health bars
const ob=[];function obar(i){if(!ob[i]){const d=document.createElement('div');d.className='ob'+(i?' foe':'');d.innerHTML='<b></b><div class="h"><i></i></div><div class="a"><i></i></div>';document.body.appendChild(d);ob[i]=d}return ob[i]}
function bars(){C.updateMatrixWorld();const L=ENTS();for(let i=L.length;i<ob.length;i++)if(ob[i])ob[i].style.display='none';L.forEach((e,i)=>{const d=obar(i),v=new THREE.Vector3(e.x,e.y+2.85-(e.cr||0)*.3,e.z).project(C),al=i>0&&window.BRX&&BRX.ally&&BRX.ally(P,e),show=mode==='play'&&v.z<1&&e.hp>0&&(i===0||e.hitT>0||al)&&!(i===0&&window.FPV&&FPV.on()); // (a teammate in Duos / Trios always has a teal bar with a star, so you can tell them from enemies) // your own bar is always on (only you see it); the other fighter's bar only shows for a few seconds after you hit them
 d.style.display=show?'block':'none';if(!show)return;d.style.left=(v.x*.5+.5)*innerWidth+'px';d.style.top=(-v.y*.5+.5)*innerHeight+'px';
 d.classList.toggle('ally',!!al);d.classList.toggle('human',!!(al&&e.hu));d.firstChild.textContent=al?(e.hu?'\u2605 ':'\u25C6 ')+(e.bn||LOOK[e.id].nm):(i===0&&window.PROFILE&&PROFILE.name()?PROFILE.name():LOOK[e.id].nm)+(e.lv?' Lv'+e.lv:'');d.children[1].firstChild.style.width=e.hp/e.mx*100+'%';d.children[2].firstChild.style.width=e.ar*2+'%'})}


// ---------- walk cycle. Smooth legs that swing with speed (and reverse when backing up), a bob at every footfall, a forward lean, a little
// hip sway, head that stays level, a landing dip, and recoil. The arms hold the gun by IK (hold.js), so the walk reaches them through the gun:
// e.wk (walk amount), e.wp (stride phase), e.rc (recoil) are read there and the gun sways with each step with both hands following it.
function walkAnim(e,dt){if(!e.lg||!e.g)return;
 const sp0=Math.max(e.sp||9,1),s=e.gr?Math.hypot(e.vx,e.vz):0,tgt=s>.35?Math.min(1.35,s/sp0):0,k=1-Math.exp(-dt*(tgt>(e.wk||0)?12:9));
 e.wk=(e.wk||0)+(tgt-(e.wk||0))*k;
 const fw=-Math.sin(e.yaw||0)*e.vx-Math.cos(e.yaw||0)*e.vz,dir=s>.35&&fw<-.35*s?-1:1,sd=s>.35&&Math.abs(fw)<.6*s?1:0; // backing up reverses the legs; sideways steps splay them
 e.wp=(e.wp||0)+dir*s*dt*1.25;e.rc=Math.max(0,(e.rc||0)-dt*9);
 const ph=e.wp,a=Math.sin(ph),wk=Math.min(e.wk,1.35),cr=e.cr||0,amp=.8*wk*(1-.45*cr);
 // landing dip
 if(e.gr&&!e.wasG)e.lt=Math.min(.2,.05+Math.abs(e.lvy||0)*.01);e.wasG=e.gr;e.lvy=e.vy;e.lt=Math.max(0,(e.lt||0)-dt);
 if(e.hp<=0)return;
 if(e.gr){const f=Math.min(1,dt*26);e.lg[0].rotation.x+=(a*amp-e.lg[0].rotation.x)*f;e.lg[1].rotation.x+=(-a*amp-e.lg[1].rotation.x)*f;e.lg[0].rotation.z=sd?(Math.max(0,-a))*.18*wk:0;e.lg[1].rotation.z=sd?(-Math.max(0,a))*.18*wk:0}
 else{const j=e.vy>0?1:.6;e.lg[0].rotation.x+=((.65*j)-e.lg[0].rotation.x)*Math.min(1,dt*14);e.lg[1].rotation.x+=((-.4*j)-e.lg[1].rotation.x)*Math.min(1,dt*14);e.lg[0].rotation.z=e.lg[1].rotation.z=0}
 const bob=Math.abs(Math.cos(ph))*.075*wk*(1-.5*cr),dip=Math.sin(Math.min(1,e.lt/.2)*Math.PI/2)*.14*(e.lt>0?1:0);
 e.g.position.y+=bob-dip;
 if(e.gr){ // keep the toes and heels out of the floor: a leg swung back or forward tilts the flat shoe, so lift the body by however far the lowest corner of either shoe has sunk
  const sy=1-.3*cr/.558,yb=-.558*sy;let lo=0;
  for(const l of e.lg){const th=l.rotation.x,c=Math.cos(th),sn=Math.sin(th);lo=Math.min(lo,.558+yb*c+.315*sn+(bob-dip),.558+yb*c-.225*sn+(bob-dip))}
  if(lo<0)e.g.position.y+=-lo}
 e.g.rotation.z=a*.035*wk;                              // hips sway side to side with each step
 const lean=-(.07+.05*(e.spr?1:0))*wk*(dir>0?1:-.4);    // lean into the run (forward is -z)
 if(e.bg){e._bl=(e._bl||0)+(lean-(e._bl||0))*Math.min(1,dt*10);e.bg.rotation.x=e._bl+(e._bx||0);e.bg.rotation.y=a*.07*wk} // _bx = the bow of a melee swing (melee.js), kept apart from the running lean
 if(e.hg){const rx=e.bg?e.bg.rotation.x:0;e.hg.position.z=1.44*Math.sin(rx);e.hg.position.y=e.hy-.3*(e.cr||0)-e.hy*(1-Math.cos(rx)); // the neck sits 1.44 above the hips: the head follows the torso top as the body leans or bows
  e.hg.rotation.x=-(e.bg?e.bg.rotation.x:0)*.9+Math.abs(Math.cos(ph))*.025*wk} // head stays level and nods a little
 if(!(e.sw>0||e.mel)){} // gun arms are solved in hold.js
}

// ---------- step wrapper: loot, grenades, traps, walk cycle
const _st=step;
step=function(dt){_st(dt);const act=!over&&introT<=0;for(const e of ENTS())e.hitT=Math.max(0,(e.hitT||0)-dt);
 for(const s of spots){if(!s.on){s.t-=dt;if(s.t<=0){if(window.PK)PK.again(s);s.on=true;s.m.visible=true}continue}
  s.m.rotation.y+=dt*1.5;s.m.position.y=.15+Math.sin(T*3+s.x)*.1;
  if(act)for(const e of ENTS())if(!(e===E&&window.NETH&&NETH.on())&&e.inv.length<3&&Math.hypot(e.x-s.x,e.z-s.z)<1.5){const got=[];for(let n=0,c=1+(Math.random()<.4);n<c&&e.inv.length<3;n++){let k=roll();if(e.id==='doge'){const k2=roll();if(IT[k2].w<IT[k].w)k=k2}e.inv.push(k);got.push(IT[k].n)}
   s.on=false;s.m.visible=false;s.t=45;if(e===P&&window.NETH)NETH.spot(spots.indexOf(s));if(e===P)say('LOOT: '+got.join(' + '),1.2);break}}
 if(act&&!(window.NETH&&NETH.on()))for(const b of window.BRX?BRX.bots:[E])if(b.hp>0&&((b.bt=(b.bt||0)-dt)<=0)){b.bt=.6;botItems(b,FOE(b))}
 for(let i=GR.length-1;i>=0;i--){const g=GR[i];g.v.y-=22*dt;g.p.addScaledVector(g.v,dt);if(g.p.y<.2){g.p.y=.2;g.v.y*=-.4;g.v.x*=.7;g.v.z*=.7}
  if(inBox(g.p)){g.p.addScaledVector(g.v,-dt);g.v.multiplyScalar(-.3)}g.m.position.copy(g.p);g.t-=dt;if(g.t<=0){window.FB=1;boom(g.p.clone(),g.o);window.FB=0;S.remove(g.m);GR.splice(i,1)}}
 for(let i=TP.length-1;i>=0;i--){const t=TP[i];t.t-=dt;if(t.t>0||!act)continue;const f=window.BRX?BRX.nearTo(t.x,t.z,t.o,1.2):(t.o===P?E:P);if(f&&f.hp>0&&Math.hypot(f.x-t.x,f.z-t.z)<1.2&&f.y<t.y+.8){window.DMGSRC=t.o;dmg(f,35*(f.hs||1));window.DMGSRC=null;S.remove(t.m);TP.splice(i,1)}}
 for(const e of ENTS())walkAnim(e,dt);
 if(window.HOLD)for(const e of ENTS())HOLD.update(e);
 bars();window.hudUpdate&&hudUpdate()};
})();
