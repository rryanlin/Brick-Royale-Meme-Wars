/* Loadout: weapon categories, one primary gun (any) plus an optional secondary (pistol or SMG), swapped in a match with X or the mouse wheel. */
(()=>{
const GROUPS=[['Short range',['shotgun','tac','breacher']],['Mid range',['rifle','burst','dmr']],['Long range',['sniper','rpg','huntsman']],['Secondary',['pistol','smg','autopistol']]],SECS=['pistol','smg','autopistol'],KEY='brickbrawl.sec';
let sec='pistol';try{const v=localStorage.getItem(KEY);if(SECS.includes(v))sec=v}catch(e){}
let sigSec=null; // a signature pistol or SMG picked as the secondary (only while its owner is picked and unlocked; it is not saved)
const isSec=id=>SECS.includes(id)||!!(window.SIGDEF&&SIGDEF[id]&&SECS.includes(SIGDEF[id].cls)); // (the new guns in newguns.js are listed in SECS themselves)
window.LO={GROUPS,SECS,isSec,get sec(){return sigSec&&window.SIG&&SIG.ok(sigSec)?sigSec:sec},reset(){sigSec=null},set(id){if(window.SIGDEF&&SIGDEF[id]){if(isSec(id))sigSec=id;return}if(SECS.includes(id)){sec=id;sigSec=null}try{localStorage.setItem(KEY,sec)}catch(e){}}};
const full=w=>w.mag||(window.MAG&&MAG[w.id]?MAG[w.id][0]:10);
// A swap has two halves: the gun in your hands goes back over the shoulder (hol), then the other gun is pulled out from your back (drw).
// The weapon itself changes in the middle, when your hand is at your back. The gun you are not holding hangs on your back.
const SW=()=>window.SWT||{hol:.26,drw:.36};
function swap(){if(mode!=='play'||over||!P.slots||!P.slots[1]||(P.swapT||0)>0||P.swapQ!=null)return;
 const t=SW();P.swapQ=P.si^1;P.hol=t.hol;P.swapT=t.hol+t.drw;P.cd.f=Math.max(P.cd.f,t.hol+t.drw);try{window.SFX&&SFX.swing&&SFX.swing()}catch(e){}}
function applySwap(){const ni=P.swapQ;P.swapQ=null;if(ni==null||!P.slots||!P.slots[ni])return;
 P.sv[P.si]={ammo:P.ammo,rl:P.rl};P.si=ni;const w=P.slots[P.si];setW(P,w);P.ammoW=w;const s=P.sv[P.si];P.ammo=s.ammo==null?full(w):s.ammo;P.rl=s.rl||0;P.drw=SW().drw;P.hol=0;
 try{say(w.n.toUpperCase(),.5)}catch(e){}sling()}
// the spare gun lies flat against the middle of your back on a diagonal (barrel up over the left shoulder, grip low on the right where your hand reaches).
// It is sized to fit inside the shoulders and sits right on top of whatever the skin has on the back (pack, cape, tanks), so it never floats away from the body.
function backDepth(){let z=.2475;const bg=P.bg,skip=[P.la,P.ra,P.lg&&P.lg[0],P.lg&&P.lg[1],P.aim,P.sl];
 try{bg.children.forEach(c=>{if(!c.isMesh||!c.geometry||c.visible===false||skip.includes(c)||c.userData.noBack)return;
  const g=c.geometry;if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox;if(!bb)return;c.updateMatrix();
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z1=-1e9;
  for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const zz of[bb.min.z,bb.max.z]){const v=new THREE.Vector3(x,y,zz).applyMatrix4(c.matrix);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);z1=Math.max(z1,v.z)}
  if(isFinite(z1)&&y1>.95&&y0<1.6&&x0<.42&&x1>-.42&&z1>z)z=z1})}catch(e){}
 return Math.min(z,.8)}
function sling(){const o=P.slots&&P.slots[1]?P.slots[P.si^1]:null;if(!o||!P.bg||!window.buildGun){if(P.sl)P.sl.visible=false;return}
 const key=P.id+'#'+(P.skn|0);
 if(P.slId!==(o.sig||o.id)||P.slF!==key||(P.sl&&P.sl.parent!==P.bg)){if(P.sl&&P.sl.parent)P.sl.parent.remove(P.sl);
  const raw=buildGun(o.sig||o.id,true);let c=[0,0,0],sz=[.3,.3,1.6];
  try{const b=new THREE.Box3().setFromObject(raw),s=b.getSize(new THREE.Vector3()),q=b.getCenter(new THREE.Vector3());if(isFinite(s.x+s.y+s.z+q.x+q.y+q.z)&&Math.max(s.x,s.y,s.z)>.05){sz=[s.x,s.y,s.z];c=[q.x,q.y,q.z]}}catch(e){}
  raw.position.set(-c[0],-c[1],-c[2]);const g=new THREE.Group();g.add(raw);
  const k=(window.HOLD&&HOLD.CFG[o.id])||{sc:.6},hx=sz[0]/2,hy=sz[1]/2,hz=sz[2]/2;
  // on the diagonal the gun covers .7071*(height+length) both across and up; keep that inside the shoulders (+-.4) and the torso height
  const sc=Math.min(k.sc,1.0/Math.max(sz[0],sz[1],sz[2]),.4/(.7071*(hy+hz)));g.scale.setScalar(sc);
  g.rotation.order='ZYX';g.rotation.set(0,Math.PI/2,-Math.PI/4); // the side of the gun against your back, barrel pointing up and to the left
  const z=backDepth()+.012+sc*hx;g.position.set(0,1.22,z);window.SLZ=z;P.bg.add(g);P.sl=g;P.slId=o.sig||o.id;P.slF=key}
 P.sl.visible=true}
window.LO.swap=swap;window.LO.sling=sling;
document.getElementById('go').addEventListener('click',()=>{ // runs after game.js has set the primary
 P.sv=[{},{}];P.si=0;P.mel=false;P.slots=[P.w,null];P.hol=P.drw=0;P.swapQ=null;P.slId=null;
 {const sc=LO.sec;if(!(window.PICK&&PICK.noSec)&&sc!==P.w.id&&sc!==P.w.sig){const sw=LV.weapon(sc,LV.lvl('g',sc));P.slots[1]=sw}}if(P.sl){if(P.sl.parent)P.sl.parent.remove(P.sl);P.sl=null}sling()});
const _rr=resetRound;resetRound=function(i){if(P.slots&&P.si){P.si=0;setW(P,P.slots[0])}P.sv=[{},{}];P.mel=false;P.hol=P.drw=0;P.swapQ=null;P.swapT=0;E.drw=0;_rr(i);sling()};
// hotbar keys: 1 = gun (press again to swap primary and secondary), 2 = hammer; 3 4 5 are the utility slots (arsenal.js)
addEventListener('keydown',e=>{if(mode!=='play'||over)return;const c=e.key.toLowerCase();
 if(e.code==='Digit1'||e.code==='Numpad1'){if(P.mel){P.mel=false;P.cd.f=Math.max(P.cd.f,.3)}else swap()}
 else if(e.code==='Digit2'||e.code==='Numpad2'){P.mel=true}
 else if(c==='x'){P.mel=false;swap()}});
addEventListener('wheel',e=>{if(mode==='play'&&Math.abs(e.deltaY)>4){P.mel=false;swap()}},{passive:true});
// the opponent's gun changes online: play the draw half so their swap looks the same
const _sw=setW;setW=function(e,w){const had=e.w&&(e.w.sig||e.w.id);_sw(e,w);if(e===E&&mode==='play'&&!over&&introT<=0&&had&&had!==(w.sig||w.id))E.drw=SW().drw};
const _st=step;step=function(dt){P.swapT=Math.max(0,(P.swapT||0)-dt);for(const e of ENTS()){if(e.hol>0)e.hol=Math.max(0,e.hol-dt);if(e.drw>0)e.drw=Math.max(0,e.drw-dt)}
 if(P.swapQ!=null&&!(P.hol>0))applySwap();_st(dt)};
})();
