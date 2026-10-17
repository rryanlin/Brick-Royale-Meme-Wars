/* Loadout: weapon categories, one primary gun (any) plus an optional secondary (pistol or SMG), swapped in a match with X or the mouse wheel. */
(()=>{
const GROUPS=[['Short range',['shotgun','tac']],['Mid range',['rifle','burst']],['Long range',['sniper','rpg']],['Secondary weapons',['pistol','smg']]],SECS=['pistol','smg'],KEY='brickbrawl.sec';
let sec='pistol';try{const v=localStorage.getItem(KEY);if(SECS.includes(v))sec=v}catch(e){}
window.LO={GROUPS,SECS,get sec(){return sec},set(id){if(SECS.includes(id))sec=id;try{localStorage.setItem(KEY,sec)}catch(e){}}};
const full=w=>w.mag||(window.MAG&&MAG[w.id]?MAG[w.id][0]:10);
function swap(){if(mode!=='play'||over||!P.slots||!P.slots[1])return;
 P.sv[P.si]={ammo:P.ammo,rl:P.rl};P.si^=1;const w=P.slots[P.si];setW(P,w);P.ammoW=w;const s=P.sv[P.si];P.ammo=s.ammo==null?full(w):s.ammo;P.rl=s.rl||0;P.cd.f=Math.max(P.cd.f,.4);P.swapT=.35;
 try{say(w.n.toUpperCase(),.5)}catch(e){}}
window.LO.swap=swap;
document.getElementById('go').addEventListener('click',()=>{ // runs after game.js has set the primary
 P.sv=[{},{}];P.si=0;P.mel=false;P.slots=[P.w,null];
 if(sec!==P.w.id){const sw=LV.weapon(sec,LV.lvl('g',sec));P.slots[1]=sw}});
const _rr=resetRound;resetRound=function(i){if(P.slots&&P.si){P.si=0;setW(P,P.slots[0])}P.sv=[{},{}];P.mel=false;_rr(i)};
// hotbar keys: 1 = gun (press again to swap primary and secondary), 2 = hammer; 3 4 5 are the utility slots (arsenal.js)
addEventListener('keydown',e=>{if(mode!=='play'||over)return;const c=e.key.toLowerCase();
 if(e.code==='Digit1'||e.code==='Numpad1'){if(P.mel){P.mel=false;P.cd.f=Math.max(P.cd.f,.3)}else swap()}
 else if(e.code==='Digit2'||e.code==='Numpad2'){P.mel=true}
 else if(c==='x'){P.mel=false;swap()}});
addEventListener('wheel',e=>{if(mode==='play'&&Math.abs(e.deltaY)>4){P.mel=false;swap()}},{passive:true});
const _st=step;step=function(dt){P.swapT=Math.max(0,(P.swapT||0)-dt);_st(dt)};
})();
