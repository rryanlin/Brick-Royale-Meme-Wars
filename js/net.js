/* Online play, in-match sync. Two players, peer to peer: each browser simulates its own fighter and reports it ~20 times a second,
   shots / melee / airstrikes / grenades go as events, and every hit is decided by the player being hit (the victim is authoritative),
   so nobody can be hurt by a lag-ghost. The opponent is the game's "E" entity, driven by the other player's reports instead of the bot.
   Lobbies, matchmaking and ranked live in online.js. */
(()=>{
const NET=window.NET={on:false,role:'host',conn:null,opp:null,rs:null,rtt:0,seed:1,rounds:0,legit:false,rcv:false,starting:false,fin:false,lastRx:0,ls:0,lp:0,myDeath:0,
 onFlow:null,onEnd:null,onDrop:null};
const send=NET.send=o=>{const c=NET.conn;if(c&&c.open){try{c.send(o)}catch(e){}}};
// seeded generator shared by both players (loot timers must match)
let rs=1;NET.rnd=()=>{rs|=0;rs=rs+0x6D2B79F5|0;let t=Math.imul(rs^rs>>>15,1|rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
NET.reseed=n=>{rs=(NET.seed|0)+n*7919};
const r2=v=>Math.round(v*100)/100,lerpA=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k};
const wc={},WPN=(id,l)=>{const k=id+':'+l;return wc[k]||(wc[k]=LV.weapon(id,l))};

window.NETH={on:()=>NET.on,rnd:()=>NET.rnd(),
 use:(k,dir)=>{if(NET.on&&dir&&(k==='grenade'||k==='trap'))send({t:'it',k,d:[r2(dir.x),r2(dir.y),r2(dir.z)]})},
 spot:i=>{if(NET.on&&i>=0)send({t:'sp',i})},
 end:won=>{const sc=score.slice();score=[0,0];NET.on=false;NET.fin=true;NET.hideHud();resetRound(true);NET.onEnd&&NET.onEnd(won,sc,'normal')}};

// ---- incoming messages
function onMsg(m){if(!m||typeof m!=='object')return;NET.lastRx=performance.now();
 switch(m.t){
  case 's':NET.rs={x:m.x,y:m.y,z:m.z,yaw:m.a,pitch:m.p,cr:m.c,vx:m.vx,vz:m.vz,gr:m.g,hp:m.hp,ar:m.ar,sh:m.sh,mel:m.ml,wid:m.w,wl:m.l,at:performance.now(),fresh:true};break;
  case 'f':if(NET.on&&mode==='play')recvFire(m);break;
  case 'm':if(NET.on&&mode==='play'&&!over&&introT<=0){NET.rcv=true;E.cd.m=0;melee(E,P);NET.rcv=false}break;
  case 'a':if(NET.on&&mode==='play')for(const s of m.s)AS.push({t:s[0],x:s[1],z:s[2],o:E});break;
  case 'it':if(NET.on&&mode==='play'&&window.BB){const d=new THREE.Vector3(m.d[0],m.d[1],m.d[2]);E.inv=[m.k];NET.rcv=true;BB.use(E,0,d);NET.rcv=false;E.inv=[]}break;
  case 'sp':{const s=window.SPOTS&&SPOTS[m.i];if(s&&NET.on){s.on=false;s.m.visible=false;s.t=45}break}
  case 'd':if(!NET.on||mode!=='play')break;
   if(over){ // both fighters went down together: nobody scores, replay the round
    if(NET.myDeath&&performance.now()-NET.myDeath<1500){score[1]=Math.max(0,score[1]-1);$('score').textContent=score[0]+' - '+score[1];say('DOUBLE KO - REPLAY',2)}
    break}
   NET.legit=true;E.hp=0;endRound(P);NET.legit=false;break;
  case 'p':send({t:'q',ts:m.ts});break;
  case 'q':{const v=performance.now()-m.ts;NET.rtt=NET.rtt?NET.rtt*.7+v*.3:v;break}
  default:NET.onFlow&&NET.onFlow(m)}}
NET.onMsg=onMsg;

function recvFire(m){const w=WPN(m.w,m.l),lat=Math.min(.12,(NET.rtt||60)/2000);
 for(const b of m.b){const p=new THREE.Vector3(b[0],b[1],b[2]),v=new THREE.Vector3(b[3],b[4],b[5]),q=new THREE.Vector3(b[6],b[7],b[8]);
  const me=new THREE.Mesh(w.rocket?rg:bg,w.rocket?rm:bm);me.position.copy(p);me.lookAt(p.clone().add(v));S.add(me);
  p.addScaledVector(v,lat);bl.push({m:me,p,q,v,life:w.life-lat,e:E,w})}
 if(window.SFX&&Math.hypot(P.x-E.x,P.z-E.z)<40)(SFX[w.id]||SFX.rifle)()}

// ---- the opponent: the bot's slot is driven by their reports
function netBot(dt){const s=NET.rs;if(!s)return;
 const age=Math.min(.12,(performance.now()-s.at)/1000),tx=s.x+s.vx*age,tz=s.z+s.vz*age,k=Math.min(1,1-Math.exp(-dt*16)),far=Math.hypot(tx-E.x,tz-E.z)>5;
 E.x=far?tx:E.x+(tx-E.x)*k;E.z=far?tz:E.z+(tz-E.z)*k;E.y=far?s.y:E.y+(s.y-E.y)*Math.min(1,k*1.5);
 E.yaw=lerpA(E.yaw,s.yaw,Math.min(1,k*1.4));E.pitch+=(s.pitch-E.pitch)*k;E.cr=(E.cr||0)+(s.cr-(E.cr||0))*k;
 E.vx=s.vx;E.vz=s.vz;E.vy=0;E.gr=!!s.gr;E.blk=false;E.mel=!!s.mel;
 if(s.fresh){s.fresh=false;E.hp=s.hp;E.ar=s.ar;E.sh=s.sh;if(s.wid&&(!E.w||E.w.id!==s.wid||(E.w.lv||1)!==s.wl))setW(E,WPN(s.wid,s.wl))}}

// ---- wrappers (outermost, installed last)
const _bot=bot;bot=function(dt){if(NET.on)return netBot(dt);_bot(dt)};
const _phys=phys;phys=function(e,dt){if(NET.on&&e===E)return;_phys(e,dt)};
const _fire=fire;fire=function(e,dt0){if(!NET.on)return _fire(e,dt0);if(e===E){if(!NET.rcv)return;return _fire(e,dt0)}
 const n=bl.length;_fire(e,dt0);const b=[];for(let i=n;i<bl.length;i++){const x=bl[i];b.push([r2(x.p.x),r2(x.p.y),r2(x.p.z),r2(x.v.x),r2(x.v.y),r2(x.v.z),r2(x.q.x),r2(x.q.y),r2(x.q.z)])}
 if(b.length)send({t:'f',w:e.w.id,l:e.w.lv||1,b})};
const _melee=melee;melee=function(e,t){if(!NET.on)return _melee(e,t);if(e===E){if(!NET.rcv)return;return _melee(e,t)}const ready=e.cd.m<=0;_melee(e,t);if(ready)send({t:'m'})};
const _ability=ability;ability=function(e,dx,dz){if(!NET.on)return _ability(e,dx,dz);if(e===E){if(!NET.rcv)return;return _ability(e,dx,dz)}
 const n=AS.length,had=e.cd.a<=0;_ability(e,dx,dz);if(had&&e.ab==='air'&&AS.length>n)send({t:'a',s:AS.slice(n).map(a=>[r2(a.t),r2(a.x),r2(a.z)])})};
// hits on the opponent are only a prediction (hit marker, damage numbers); their own game decides the real damage
const _dmg=dmg;dmg=function(e,n){if(!NET.on||e!==E)return _dmg(e,n);_dmg(e,n);if(E.hp<1)E.hp=1};
// a round only ends for me when I go down (and I tell them) or when they tell me they went down
const _er=endRound;endRound=function(w){if(!NET.on)return _er(w);if(w===P&&!NET.legit)return;if(w===E){NET.myDeath=performance.now();send({t:'d'})}_er(w)};
const _rr=resetRound;resetRound=function(i){if(NET.on)NET.reseed(NET.rounds++);_rr(i);
 if(NET.on){const h=NET.role==='host',s=h?-22:22;P.x=s;E.x=-s;P.z=E.z=0;yaw=h?-Math.PI/2:Math.PI/2;pitch=0;P.yaw=yaw;E.yaw=h?Math.PI/2:-Math.PI/2;E.cr=0}};
const _step=step;step=function(dt){_step(dt);if(!NET.on||mode!=='play')return;const n=performance.now();
 if(n-NET.ls>=50){NET.ls=n;send({t:'s',x:r2(P.x),y:r2(P.y),z:r2(P.z),a:r2(P.yaw),p:r2(P.pitch),c:r2(P.cr||0),vx:r2(P.vx),vz:r2(P.vz),g:P.gr?1:0,hp:r2(P.hp),ar:r2(P.ar),sh:r2(P.sh),ml:P.mel?1:0,w:P.w.id,l:P.w.lv||1})}
 if(n-NET.lp>=2000){NET.lp=n;send({t:'p',ts:n})}
 if(n-NET.lastRx>9000&&!NET.fin){NET.fin=true;NET.onDrop&&NET.onDrop('timeout')}
 hud(n)};

// ---- small in-match HUD: ping and a leave button
const nh=document.createElement('div');nh.id='nhud';nh.innerHTML='<span id="nping"></span><button id="nleave">Leave</button>';document.body.appendChild(nh);
let hv=0,armed=0;
function hud(n){if(n-hv<500)return;hv=n;nh.style.display='flex';const r=Math.round(NET.rtt||0);$('nping').textContent=NET.rtt?r+' ms':'...';$('nping').className=r<80?'g':r<160?'y':'r';
 if(armed&&n-armed>3000){armed=0;$('nleave').textContent='Leave'}}
$('nleave').addEventListener('mousedown',e=>e.stopPropagation());
$('nleave').onclick=()=>{if(!armed){armed=performance.now();$('nleave').textContent='Forfeit?';return}armed=0;$('nleave').textContent='Leave';window.Online&&Online.forfeit()};
NET.hideHud=()=>{nh.style.display='none';armed=0;$('nleave').textContent='Leave'};

// ---- start of a match (both players ready): run the normal Fight setup, then swap the bot for the other player
NET.begin=seed=>{NET.seed=seed;NET.rounds=0;NET.fin=false;NET.on=true;NET.rs=null;NET.ls=NET.lp=0;NET.lastRx=performance.now();NET.rtt=0;
 NET.starting=true;try{$('go').click()}finally{NET.starting=false}
 const o=NET.opp.setup;skin(E,o.f);E.lv=o.lv;E.mx=o.mx;E.sp=o.sp;E.dm=o.dm;E.sa=o.sa;E.inv=[];setW(E,WPN(o.w,o.wl));
 $('n2').textContent=LOOK[o.f].nm.toUpperCase();const im=$('n2').parentNode.querySelector('img');if(im&&window.UIportrait)im.src=UIportrait(o.f);
 resetRound();send({t:'p',ts:performance.now()})};
// a match that ends because someone left or the connection dropped
NET.abort=oppLeft=>{const sc=score.slice();if(mode==='play'){mode='over';document.exitPointerLock&&document.exitPointerLock();$('hud').style.display='none'}
 score=[0,0];NET.on=false;NET.fin=true;NET.hideHud();bl.splice(0).forEach(b=>S.remove(b.m));NET.onEnd&&NET.onEnd(oppLeft,sc,oppLeft?'opp-left':'me-left')};
NET.off=()=>{NET.on=false;NET.fin=true;NET.rs=null;NET.hideHud()};
})();
