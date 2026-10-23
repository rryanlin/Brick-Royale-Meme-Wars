/* Shiny and Golden (round 22).
   - SHINY: spend rarity tokens of the fighter's rarity (Common 5, Uncommon 10, Rare 15, Epic 20, Legendary 25). Tokens come from duplicate wheel prizes.
   - GOLDEN: spend that fighter's own Scrolls (Common 10, Uncommon 15, Rare 20, Epic 25, Legendary 30). A Scroll comes from trading in a duplicate of that fighter on the wheel.
   - Both are EFFECTS: a stat boost (Shiny +10% health +5% damage, Golden +20% health +10% damage) and a glittering look that sits on top of ANY skin the fighter wears.
     You can only wear one effect at a time (none / shiny / gold). The effect is sent to your opponent online, and the boost is part of the stats you send.
   - Unlocking an effect also unlocks a matching SKIN for that fighter ("Shiny <Name>" or "Golden <Name>"), a full make-over you can wear with or without the effect.
   Saved in this browser. API: SHINE.tokCost(id), scrCost(id), own(id,'shiny'|'gold'), unlock(id,kind), equip(id,kind|''), sel(id), stats(id,L), deco(fig,kind), BOOST */
(()=>{
const TH=window.THREE,KEY='brickbrawl.shine',RK={common:0,uncommon:1,rare:2,epic:3,legend:4};
let D={own:{},sel:{}};try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')D=Object.assign(D,s)}catch(e){}
if(!D.own||typeof D.own!=='object')D.own={};if(!D.sel||typeof D.sel!=='object')D.sel={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}};
const rar=id=>(typeof LOOK!=='undefined'&&LOOK[id]&&LOOK[id].r)||'common',rk=id=>RK[rar(id)]||0;
const tokCost=id=>5*(rk(id)+1),scrCost=id=>10+5*rk(id);
const BOOST={shiny:{hp:1.10,dm:1.05,t:'+10% health, +5% damage'},gold:{hp:1.20,dm:1.10,t:'+20% health, +10% damage'}};
const KEYK={shiny:'s',gold:'g'};
const own=(id,k)=>!!(D.own[id]&&D.own[id][KEYK[k]]);
const sel=id=>{const v=D.sel[id];return v&&BOOST[v]&&own(id,v)?v:''};
function unlock(id,kind){if(typeof LOOK==='undefined'||!LOOK[id]||!BOOST[kind])return{ok:false,why:'nope'};if(!PR.isOpen(id))return{ok:false,why:'locked'};if(own(id,kind))return{ok:false,why:'owned'};
 const r=rar(id);
 if(kind==='shiny'){const c=tokCost(id);if(!PR.spendTokens(r,c))return{ok:false,why:'poor',need:c,have:PR.tokens()[r]}}
 else{const c=scrCost(id);if(!PR.spendScrolls(id,c))return{ok:false,why:'poor',need:c,have:PR.scrolls()[id]||0}}
 (D.own[id]=D.own[id]||{})[KEYK[kind]]=1;if(!sel(id))D.sel[id]=kind;save();return{ok:true}}
function equip(id,kind){kind=kind||'';if(kind&&(!BOOST[kind]||!own(id,kind)))return false;D.sel[id]=kind;save();return true}
function stats(id,L){const s=LV.cstats(id,L).slice(),k=sel(id);if(k){s[0]=Math.round(s[0]*BOOST[k].hp);s[2]=+(s[2]*BOOST[k].dm).toFixed(3)}return s}
// ---------------------------------------------------------------- look: gold / sparkle tint on every part (per-fighter copies of the materials), sparkles, a floor ring and a halo
const mix=(a,b,t)=>{const r=(x,s)=>(x>>s)&255,m=s=>Math.round(r(a,s)+(r(b,s)-r(a,s))*t);return(m(16)<<16)|(m(8)<<8)|m(0)};
const LOOKS={ // tint colour, how much of it, glow, extra look
 gold:{c:0xffc21a,t:.42,em:0x6a4300,ei:.6,spark:[0xffe27a,0xfff4c0,0xffb400],ring:0xffc21a},
 goldskin:{c:0xffc21a,t:.78,em:0x7a4c00,ei:.8,spark:[0xffe27a,0xfff4c0,0xffb400],ring:0xffc21a,halo:[0xffc21a]},
 shiny:{c:0x9fe8ff,t:.2,em:0x1f5a78,ei:.5,spark:[0xffffff,0x9fe8ff,0xff9ff0,0xfff09f],ring:0x9fe8ff},
 shinyskin:{c:0xc9a8ff,t:.34,em:0x4a2a7a,ei:.7,spark:[0xffffff,0x9fe8ff,0xff9ff0,0xfff09f],ring:0xc9a8ff,halo:[0xff7ad9,0x7af0ff,0xfff07a]}};
function recolor(g,L){let n=0;g.traverse(o=>{if(!o.isMesh||!o.material||o.userData.fxkeep)return;const m=o.material;if(m.userData&&m.userData.fx)return;
  try{const c=m.clone?m.clone():new m.constructor(m.opts||{});c.userData={fx:1};const hx=c.color&&(c.color.getHex?c.color.getHex():c.color.hex);
   if(typeof hx==='number'&&c.color.set)c.color.set(mix(hx,L.c,L.t));
   if(c.emissive&&c.emissive.set&&!(m.emissiveIntensity>1)){c.emissive.set(L.em);if('emissiveIntensity' in c)c.emissiveIntensity=L.ei}
   if(L.t>.5&&'metalness' in c){c.metalness=Math.max(c.metalness||0,.55);c.roughness=Math.min(c.roughness==null?.5:c.roughness,.35)}
   o.material=c;n++}catch(e){}});return n}
function star(col,s){const G=TH.OctahedronGeometry||TH.BoxGeometry,m=new TH.Mesh(new G(.07*s,0),new TH.MeshBasicMaterial({color:col,transparent:true,opacity:.95}));m.scale.y=1.7;m.userData.fxkeep=1;return m}
function ring(col,R,t,y){const m=new TH.Mesh(new TH.TorusGeometry(R,t,6,36),new TH.MeshBasicMaterial({color:col,transparent:true,opacity:.75}));m.rotation.x=Math.PI/2;m.position.y=y;m.userData.fxkeep=1;return m}
function deco(f,kind){const L=LOOKS[kind];if(!f||!f.g||!L||!TH)return f;const P_=/skin$/.test(kind)?'fxs':'fxg';
 try{if(f[P_]&&f[P_].parent)f[P_].parent.remove(f[P_]);recolor(f.g,L);
  const g=new TH.Group();g.userData.fxkeep=1;let top=2.3;
  try{const b=new TH.Box3().setFromObject(f.g);if(isFinite(b.max.y)&&b.max.y>1.2)top=b.max.y}catch(e){}
  // orbiting sparkles
  const N=L.halo?9:7;for(let i=0;i<N;i++){const s=star(L.spark[i%L.spark.length],i%3===0?1.5:1);s.userData.ph=i/N*Math.PI*2;s.userData.hy=.25+(top-.35)*((i*.37)%1);s.userData.r=.62+.12*(i%3);g.add(s)}
  g.add(ring(L.ring,.7,.03,.04));
  if(L.halo)L.halo.forEach((c,i)=>{const h=ring(c,.34-i*.03,.025,top+.16+i*.045);h.userData.halo=1;g.add(h)});
  f.g.add(g);f[P_]=g}catch(e){}
 return f}
function tick(f,t){if(!f)return;['fxg','fxs'].forEach(k=>{const g=f[k];if(g)anim(g,t)})}
function anim(g,t){g.children.forEach(c=>{const u=c.userData;if(u.ph==null){if(u.halo)c.rotation.z=t*.8;return}
  const a=u.ph+t*1.3;c.position.set(Math.cos(a)*u.r,u.hy+Math.sin(t*2+u.ph*3)*.08,Math.sin(a)*u.r);c.rotation.y=t*3;c.scale.setScalar(.75+.35*Math.sin(t*5+u.ph*2))})}
// ---------------------------------------------------------------- in a match: you wear your chosen effect, the online opponent wears theirs (the CPU never does)
const valid=v=>v==='shiny'||v==='gold'?v:'';
{const _skin=skin;skin=function(e,id){let fx='';if(e===P)fx=sel(id);else if(window.NET&&NET.on)fx=valid(e.fx);
  e.fxg=e.fxs=null;_skin(e,id);e.fx=fx;if(fx)deco(e,fx)}}
{const _step=step;step=function(dt){_step(dt);const t=performance.now()/1000;tick(P,t);tick(E,t)}}
window.SHINE={tokCost,scrCost,own,sel,unlock,equip,stats,deco,tick,BOOST,valid,rar,reset(){D={own:{},sel:{}};save()},
 // the Shiny and Golden skins a fighter gets by unlocking the matching effect
 skinOwned:(id,k)=>k===3?own(id,'gold'):k===4?own(id,'shiny'):false};
})();
