/* BrickBrawl polish layer. Loaded after game.js; wraps its global functions. */
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;let ac,muted=false,shake=0,TS=1;
function tone(f,d,type='square',v=.06,sl=0){if(muted)return;try{ac=ac||new AC();if(ac.state==='suspended')ac.resume();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
 o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+sl),t+d);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(t+d)}catch(e){}}
const SFX={rifle:()=>tone(420,.07,'square',.04,-250),shotgun:()=>tone(160,.2,'sawtooth',.09,-110),rpg:()=>tone(110,.35,'sawtooth',.09,-60),
 hit:()=>tone(900,.06,'triangle',.07),hurt:()=>tone(180,.12,'sawtooth',.08,-80),boom:()=>tone(90,.5,'sawtooth',.14,-60),swing:()=>tone(220,.12,'triangle',.08,-120),
 pick:()=>{tone(600,.08,'sine',.07);setTimeout(()=>tone(900,.12,'sine',.07),70)},win:()=>[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.18,'square',.06),i*110)),
 lose:()=>[330,262,196].forEach((f,i)=>setTimeout(()=>tone(f,.22,'sawtooth',.06),i*130))};
window.SFX=SFX;
const MAG=window.MAG={},key=e=>e.w.id,mg=e=>[e.w.mag||MAG[e.w.id][0],e.w.rl||MAG[e.w.id][1]]; // mag/reload come from the weapon object, so gun levels can change them
function am(e){if(e.ammoW!==e.w){e.ammoW=e.w;e.ammo=mg(e)[0];e.rl=0}}
function pop(n){const v=new THREE.Vector3(E.x,E.y+2.8,E.z).project(C);if(v.z>1)return;const d=document.createElement('div');d.className='pop';d.textContent=Math.round(n);
 d.style.left=(v.x*.5+.5)*innerWidth+'px';d.style.top=(-v.y*.5+.5)*innerHeight+'px';$('hud').appendChild(d);setTimeout(()=>d.remove(),700)}
function marker(){window.XH&&XH.hit()}

const _shoot=shoot;
shoot=function(e,dir){am(e);if(e.rl>0||e.cd.f>0)return;if(e.ammo<=0){e.rl=mg(e)[1];return}
 e.ammo--;_shoot(e,dir);if(e===P||Math.hypot(P.x-e.x,P.z-e.z)<30)(SFX[key(e)]||SFX.rifle)();if(e.ammo<=0)e.rl=mg(e)[1]};

const _dmg=dmg;
dmg=function(e,n){const before=e.hp+e.ar;_dmg(e,n);const t=before-(e.hp+e.ar);if(t<=0)return;
 if(e===E){pop(t);marker();SFX.hit()}else{shake=Math.max(shake,.3);SFX.hurt()}};

const _boom=boom;
boom=function(p,o){_boom(p,o);SFX.boom();shake=Math.max(shake,Math.max(0,.7-p.distanceTo(C.position)/35))};

const _melee=melee;
melee=function(e,t){const ready=e.cd.m<=0;_melee(e,t);if(ready)SFX.swing()};

const _say=say;
say=function(t,s){if(/^\+/.test(t))SFX.pick();_say(t,s)};

const _er=endRound;
endRound=function(w){_er(w);SFX[w===P?'win':'lose']()};

const _rr=resetRound;
resetRound=function(i){_rr(i);P.ammoW=E.ammoW=null;TS=1;shake=0};

const _step=step;
step=function(dt){
 TS=over?.35:1;dt*=TS;
 // Bot reacts to incoming fire: jump and sometimes dash sideways.
 if(!over&&introT<=0&&E.gr&&((E.dq=(E.dq||0)-dt)<=0)){
  for(const b of bl){if(b.e!==P)continue;const dx=E.x-b.p.x,dy=E.y+1.2-b.p.y,dz=E.z-b.p.z,d=Math.hypot(dx,dy,dz)||1;
   if(d<9&&(dx*b.v.x+dy*b.v.y+dz*b.v.z)/(d*b.v.length())>.9){E.vy=10;E.dq=1.2;
    if(E.cd.a<=0&&E.ab==='dash'){const h=Math.hypot(dx,dz)||1,s=Math.random()<.5?1:-1;ability(E,-dz/h*s,dx/h*s)}break}}}
 _step(dt);
 for(const e of[P,E]){am(e);if(e.rl>0){e.rl-=dt;if(e.rl<=0){e.ammo=mg(e)[0];e.rl=0}}}
 if(shake>0){C.position.x+=(Math.random()-.5)*shake;C.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*1.6)}
 $('wn').textContent=P.w.n+'  '+(P.rl>0?'RELOADING':P.ammo+'/'+mg(P)[0])+(P.cd.m>0?'':'  |  Hammer ready');
};
addEventListener('keydown',e=>{const c=e.key.toLowerCase();
 if(c==='m'){muted=!muted;if(mode==='play')say(muted?'SOUND OFF':'SOUND ON',.8)}
 if(c==='r'&&mode==='play'){am(P);if(P.rl<=0&&P.ammo<mg(P)[0])P.rl=mg(P)[1]}});
})();
