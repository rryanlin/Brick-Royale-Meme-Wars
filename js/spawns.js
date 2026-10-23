/* Where pickups go: health, armor and loot bags are never at fixed spots (see the notes inside). */
(()=>{
// ---- where the pickups go. Nothing is at a fixed spot: each round, and each time one is picked up and comes back, it lands somewhere new.
// Health and armor each have two, one in each of two opposite quarters of the arena (so both fighters have one near them); there is one loot bag, in the middle strip.
// Placement comes from a hash of (match seed, round, pickup, how many times it has respawned), not from a running random generator, so online both screens agree.
const hs=v=>{if(typeof v==='string'){let h=7;for(let i=0;i<v.length;i++)h=Math.imul(h^v.charCodeAt(i),16777619);return h>>>0}return(v|0)>>>0};
const mix=(...a)=>{let h=2166136261;for(const v of a){h^=hs(v)+0x9e3779b9;h=Math.imul(h,16777619);h^=h>>>13;h=Math.imul(h,1274126177);h^=h>>>16}return h>>>0};
const mb=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let base=(Math.random()*4294967296)>>>0;
const roundNo=()=>score[0]+score[1];
const QS=[[-1,-1],[1,-1],[-1,1],[1,1]];
const free=(x,z)=>{for(const b of boxes){if(b.y0||b.ft)continue;if(x>b.x1-1&&x<b.x2+1&&z>b.z1-1&&z<b.z2+1)return false}return true};
function pick(key,region,n){const r=mb(mix(base,roundNo(),key,n));
 for(let i=0;i<120;i++){let x,z;
  if(region==='mid'){x=(r()*2-1)*9;z=(r()*2-1)*(A-4)}else{const q=QS[region];x=q[0]*(3+r()*(A-8));z=q[1]*(3+r()*(A-8))}
  if(Math.hypot(Math.abs(x)-22,z)<6)continue; // not on top of a fighter's start
  if(free(x,z))return[+x.toFixed(2),+z.toFixed(2)]}
 // 120 tries all missed (a map with a mostly blocked middle strip): walk a grid from a seeded start so the pickup still lands on open floor
 {const ok=(x,z)=>free(x,z)&&(!window.MAPS||!MAPS.walk||MAPS.walk(x,z))&&(!window.NAV||!NAV.ok||NAV.ok(x,z));
  const xs=region==='mid'?[-9,9]:[QS[region][0]<0?-A+3:3,QS[region][0]<0?-3:A-3],zs=region==='mid'?[-A+4,A-4]:[QS[region][1]<0?-A+3:3,QS[region][1]<0?-3:A-3],st=1.5,nx=Math.floor((xs[1]-xs[0])/st)+1,nz=Math.floor((zs[1]-zs[0])/st)+1,o=Math.floor(r()*nx*nz);
  for(let i=0;i<nx*nz;i++){const j=(i+o)%(nx*nz),x=xs[0]+(j%nx)*st,z=zs[0]+Math.floor(j/nx)*st;if(Math.hypot(Math.abs(x)-22,z)<6)continue;if(ok(x,z))return[+x.toFixed(2),+z.toFixed(2)]}}
 return region==='mid'?[0,6]:[QS[region][0]*14,QS[region][1]*10]}
const kinds=()=>{const d=mix(base,roundNo(),'diag')&1,H=d?[1,2]:[0,3],S2=d?[0,3]:[1,2];return{h:H,s:S2}};
function put(o,xz){o.x=xz[0];o.z=xz[1];o.m.position.x=xz[0];o.m.position.z=xz[1]}
function layout(){const K=kinds();let hi=0,si=0;
 chests.forEach((c,i)=>{c.n=0;c.id=i;c.q=c.k==='h'?K.h[hi++]:K.s[si++];put(c,pick('c'+i,c.q,0))});
 SPOTS.forEach((s,i)=>{s.n=0;s.id=i;put(s,pick('b'+i,'mid',0))})}
window.PK={again(o){o.n=(o.n||0)+1;if(o.q!==undefined)put(o,pick('c'+o.id,o.q,o.n));else put(o,pick('b'+o.id,'mid',o.n))},layout,
 counts:()=>({health:chests.filter(c=>c.k==='h').length,armor:chests.filter(c=>c.k==='s').length,bags:SPOTS.length})};
const _rrp=resetRound;resetRound=function(i){_rrp(i);if(roundNo()===0)base=window.NETH&&NETH.on()&&NETH.seed?hs(NETH.seed()):(Math.random()*4294967296)>>>0;layout()};
layout();


})();
