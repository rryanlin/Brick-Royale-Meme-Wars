/* Levels: balanced guns, gun + fighter XP, levels 1-30 and level tiers (saved in the browser).
   Every gun is tuned so its sustained damage per second is about the same (~42) and the difference is how it gets there:
   range, accuracy, burst, magazine and reload. The numbers in BASE are the full-power (level 30) stats; lower levels are nerfed. */
(()=>{
const KEY='brickbrawl.lv1',MAXL=30;
// ---- balanced full-power gun stats (sustained dps incl. reload ~42 for most guns; the shotguns are deliberately much stronger because they only work up close) ----
const BASE={
 rifle:  {n:'Assault Rifle',    dmg:7.8, pel:1,rate:.14,spd:75, spr:.015,life:1.2, mag:30,rl:1.5,br:12,auto:1},
 burst:  {n:'Burst Rifle',      dmg:8.8, pel:3,rate:.5, spd:80, spr:.006,life:1.3, mag:8, rl:1.5,br:14,seq:1}, // seq: the three rounds leave one after another
 smg:    {n:'SMG',              dmg:4.5, pel:1,rate:.07,spd:65, spr:.04, life:.9,  mag:35,rl:1.4,br:8, auto:1},
 pistol: {n:'Pistol',           dmg:13,  pel:1,rate:.25,spd:70, spr:.01, life:1,   mag:12,rl:1.0,br:10},
 shotgun:{n:'Pump Shotgun',     dmg:10,   pel:7,rate:.85,spd:55, spr:.1,  life:.35, mag:6, rl:1.8,br:5},
 tac:    {n:'Tactical Shotgun', dmg:5.4, pel:6,rate:.33,spd:55, spr:.12, life:.3,  mag:8, rl:2.0,br:6, auto:1},
 sniper: {n:'Sniper Rifle',     dmg:62,  pel:1,rate:1.2,spd:140,spr:0,   life:1.5, mag:1, rl:3.2,br:24},
 rpg:    {n:'Rocket Launcher',  dmg:0,   sdm:64,pel:1,rate:1.5,spd:44,spr:0,life:2,mag:1,rl:1.8,br:15,rocket:1}};
Object.keys(BASE).forEach(id=>{const w=WP[id];if(w){Object.assign(w,BASE[id]);if(!BASE[id].auto)delete w.auto}});
// signature guns (sigs.js): same numbers as their class with the overrides, and a model of their own
Object.keys(window.SIGDEF||{}).forEach(id=>{const d=SIGDEF[id];BASE[id]=Object.assign({},BASE[d.cls],d.st,{n:d.n,cls:d.cls});Object.assign(WP[id]||(WP[id]={}),{id,cls:d.cls})});
// the four guns from newguns.js: their own stats on top of their class, level and XP of their own
(window.XW?XW.ids:[]).forEach(id=>{const d=XW[id];BASE[id]=Object.assign({},BASE[d.cls],d.st,{n:d.n,cls:d.cls});Object.assign(WP[id]||(WP[id]={}),{id,cls:d.cls})});
const NAMES={common:'COMMON',uncommon:'UNCOMMON',rare:'RARE',epic:'EPIC',legend:'LEGENDARY'};
const tier=L=>L<=5?'common':L<=10?'uncommon':L<=15?'rare':L<=20?'epic':'legend';
const need=L=>Math.round(30+8*L+.5*L*L); // xp from level L to L+1
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.g)S={g:{},c:{}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
// one-time clean-up: an earlier build copied the class gun's XP into a signature gun the first time it earned any, so reset every signature gun to LV 1 once
if(S.sv!==2){Object.keys(window.SIGDEF||{}).forEach(id=>{delete S.g[id]});S.sv=2;save()}
// a signature gun has its own level: it starts at LV 1 and earns its own XP; its class gun (e.g. the Assault Rifle for the Wow Blaster) keeps its own level and is never changed by it
const xpOf=(kind,id)=>(S[kind][id])||0;
function info(kind,id){const xp=xpOf(kind,id);let L=1,x=xp;while(L<MAXL&&x>=need(L)){x-=need(L);L++}return{L,x,need:L<MAXL?need(L):0,xp,tier:tier(L),max:L>=MAXL}}
const RANK={common:0,uncommon:1,rare:2,epic:3,legend:4},ORDR=['common','uncommon','rare','epic','legend'];
function cinfo(id){const i=info('c',id),b=(LOOK[id]&&LOOK[id].r)||'common';i.base=b;i.rar=b;return i} // a fighter's rarity is fixed; only level and stats change as they level up (guns still gain a tier every 5 levels)
const lvl=(kind,id)=>info(kind,id).L,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---- level scaling: t=0 at level 1 (heavily nerfed), t=1 at level 30 (full stats) ----
const tt=L=>(clamp(L,1,MAXL)-1)/(MAXL-1);
function weapon(id,L){const b=BASE[id],t=tt(L),w=Object.assign({},WP[id],b);
 w.id=id;w.lv=L;w.n=b.n+' Lv'+L;w.base=b.n;if(b.cls){w.sig=id;w.id=b.cls}
 if(b.dmg)w.dmg=+(b.dmg*(.5+.5*t)).toFixed(2);if(b.sdm)w.sdm=+(b.sdm*(.3+.7*t)).toFixed(1); // rocket splash scales harder: one hit must not delete a level-1 fighter (36 hp) when it only takes 74% of a full-health one
 w.rate=+(b.rate/(.7+.3*t)).toFixed(3);               // fires slower at low level
 w.mag=b.mag>1?Math.max(2,Math.round(b.mag*(.6+.4*t))):1;
 w.rl=+(b.rl*(1.5-.5*t)).toFixed(2);                   // reloads slower at low level
 w.spr=b.spr*(2-t);                                    // sloppier aim at low level
 w.spd=b.spd*(.85+.15*t);w.life=b.life*(.85+.15*t);
 if(!b.auto)delete w.auto;return w}
const CS=id=>{const T=STATS[id]||[100,9,1,0];return T}; // [health, speed, damage multiplier, starting armor] at level 30
// Health scale: a fighter's health follows how much damage a gun of their level does (damage per second at that level vs level 30),
// so low-level fights take as long as high-level ones instead of dragging on. Armor, heals and fixed damage (hammer, grenades, traps,
// airstrikes) are scaled by the same number in game.js / arsenal.js.
const gdps=L=>{const w=weapon('rifle',L);return w.dmg*w.pel/w.rate},hs=L=>+Math.min(1,gdps(L)/gdps(MAXL)).toFixed(3);
function cstats(id,L){const T=CS(id),t=tt(L);return[Math.round(T[0]*hs(L)),+(T[1]*(.88+.12*t)).toFixed(2),+(T[2]*(.7+.3*t)).toFixed(3),Math.round(T[3]*t)]}
// ---- hooks into the match ----
const _skin=skin;
skin=function(e,id){_skin(e,id);const L=e===P?lvl('c',id):clamp(lvl('c',P.id)+Math.floor(Math.random()*5)-2,1,MAXL),s=e===P&&window.SHINE?SHINE.stats(id,L):cstats(id,L);
 e.lv=L;e.hs=hs(L);e.mx=s[0];e.sp=s[1];e.dm=s[2];e.sa=s[3];e.hp=e.mx};
const _setW=setW;
setW=function(e,w){if(!w.lv){const id=w.sig||w.id,L=e===P?lvl('g',id):clamp(lvl('g',P.w&&(P.w.sig||P.w.id)||id)+Math.floor(Math.random()*5)-2,1,MAXL);w=weapon(id,L)}_setW(e,w)};
let acc=0,byG={};const _dmg=dmg;
dmg=function(e,n){const b=e.hp+e.ar;_dmg(e,n);if(e===E&&mode==='play'){const d=Math.max(0,b-(e.hp+e.ar));acc+=d;const g=P.w&&(P.w.sig||P.w.id);if(g)byG[g]=(byG[g]||0)+d}};
const _er=endRound;
endRound=function(w){_er(w);const dealt=Math.round(acc),bg=byG;acc=0;byG={};if(!P.w||!P.id)return;
 const win=w===P,matchWin=win&&score[0]>=2,cid=P.id,cb=cinfo(cid),cx=dealt+(win?50:10)+(matchWin?50:0),m=[];
 // each gun earns the damage it dealt; every gun that dealt damage (or the one in hand) shares the round-win bonus
 const gids=Object.keys(bg).filter(g=>bg[g]>0);if(!gids.length)gids.push(P.w.sig||P.w.id);let gx=0;
 gids.forEach(gid=>{const gb=info('g',gid),x=Math.round(bg[gid]||0)+(win?50:0);gx+=x;S.g[gid]=xpOf('g',gid)+x;const ga=info('g',gid);
  if(ga.L>gb.L)m.push(BASE[gid].n+' reached LV '+ga.L+(ga.tier!==gb.tier?' ('+NAMES[ga.tier]+')':''))});
 S.c[cid]=(S.c[cid]||0)+cx;save();
 const ca=cinfo(cid);
 if(ca.L>cb.L)m.push(LOOK[cid].nm+' reached LV '+ca.L+(ca.rar!==cb.rar?' ('+NAMES[ca.rar]+')':''));
 setTimeout(()=>{window.PR&&PR.toast('+'+gx+' gun XP, +'+cx+' fighter XP'+(m.length?'  |  LEVEL UP: '+m.join(' + '):''))},900);
 window.UIrefresh&&UIrefresh()};
window.LV={hs,BASE,NAMES,tier,need,info,cinfo,RANK,lvl,weapon,cstats,MAXL};
})();
