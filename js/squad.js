/* Squad play (round 31): Duos and Trios with real teammates.
   Everyone in the squad runs their own copy of the Battle Royale match against the CPU fighters. All copies start from the same seed (same map, same loot, same
   fighters), so the world looks the same to everybody. What the squad shares, over one small broadcast channel (sq-ID):
     - where every teammate is and what they hold (about 10 times a second): a teammate is one of the match's team fighters, driven by those reports instead of the CPU brain;
     - every shot a teammate fires, so their bullets hit the CPU fighters in your copy too;
     - eliminations (a CPU fighter that goes down in one copy goes down in all of them), a teammate going down, and the win;
     - a landing barrier: the match clock waits until the teammates who are there have landed.
   Honest limits: the CPU fighters think for themselves in every copy, so they drift apart a little; there is no friendly fire; a teammate who leaves is replaced by a CPU fighter.
   Without a teammate present a slot is a normal CPU teammate, so a squad of 1 plays exactly like the old Duos / Trios. */
(()=>{
const SQ=window.SQ={on:false,cfg:null};
let cfg=null,ch=null,cid='',beatT=0,sendT=0,peers=new Map(),landed=false,landAt=0,rel=false,real=null,rs=1;
const r2=v=>Math.round(v*100)/100,lerpA=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k};
const wc={},WPN=(id,l)=>{const k=id+':'+l;return wc[k]||(wc[k]=LV.weapon(id,Math.max(1,Math.min(LV.MAXL||99,l|0||1))))};
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const E_=()=>window.BRX?BRX.ents:[];
const team=()=>window.BRX?BRX.team:0;
const send=o=>{if(ch)try{ch.send(Object.assign({c:cid,i:cfg.idx},o))}catch(e){}};

// ---------------------------------------------------------------- arming (before the match starts) and the seeded start
// cfg: {id, kind, idx (my seat, 0 = first), size (how many real players should come), map}
SQ.arm=c=>{SQ.stop();cfg=Object.assign({size:1,idx:0},c);cfg.seed=hash(String(cfg.id));SQ.cfg=cfg;SQ.pending=true;return cfg};
SQ.take=()=>{if(!SQ.pending||!cfg)return null;SQ.pending=false;SQ.on=true;peers=new Map();landed=false;landAt=0;rel=false;
 cid=((window.Supa&&Supa.uid&&Supa.uid())||'x')+'-'+Math.random().toString(36).slice(2,8);
 ch=window.HUB?HUB.join('sq-'+cfg.id,onMsg):null;beatT=sendT=0;return cfg};
// a seeded Math.random for the world-building part of the start, the same on every machine
SQ.seed=k=>{if(!SQ.on||!cfg)return;if(!real)real=Math.random;rs=(cfg.seed+k*7919)|0;
 Math.random=()=>{rs=rs+0x6D2B79F5|0;let t=Math.imul(rs^rs>>>15,1|rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
SQ.unseed=()=>{if(real){Math.random=real;real=null}};

// ---------------------------------------------------------------- my profile and the teammates' fighters
const prof=()=>({n:(window.PROFILE&&PROFILE.name())||'Player',f:P.id,k:P.skn|0,fx:P.fx||'',lv:P.lv|0,mx:P.mx,sp:P.sp,dm:P.dm,sa:P.sa,mw:P.mw||'',hs:P.hs||1});
function slotFor(){const L=E_();for(let i=1;i<Math.max(1,team());i++)if(L[i]&&!L[i].remote&&L[i].hp>0)return L[i];return null}
function bind(pr){ // a teammate is in: they take over one of the CPU teammates
 if(pr.ent||!window.BRX)return;const e=slotFor();if(!e)return;const o=pr.p;if(!o||!LOOK[o.f])return;
 pr.ent=e;e.remote=pr.c;e.tg=null;e.nofire=true;e.dead=false;
 e.skn=o.k|0;e.fx=window.SHINE?SHINE.valid(o.fx):'';if(window.MW)e.mw=MW.valid(o.mw);skin(e,o.f);e.lv=o.lv|0;e.hs=o.hs||1;e.mx=o.mx||100;e.sp=o.sp||9;e.dm=o.dm||1;e.sa=o.sa||0;
 e.hp=e.mx;e.ar=e.sa||0;e.inv=[];e.bn=String(o.n||'Teammate').slice(0,20);e.hu=1;e.g.visible=false;e.s=null;e.x=0;e.z=0;e.y=-300;e.vx=e.vz=e.vy=0;
 const g=BR.mkGun(BR.gunIds()[0],1);setW(e,g);try{BRX.hud&&BRX.hud()}catch(x){}}
function unbind(pr,why){const e=pr.ent;if(!e)return;pr.ent=null;e.remote=null;e.hu=0;e.nofire=false;e.tg=null;e.wander=null;e.nv=null;e.s=null;
 if(e.hp>0){e.g.visible=true;if(e.y<-50)e.y=0;if(!e.bn||e.bn===pr.p.n)e.bn='CPU'}
 try{window.TITLE&&TITLE.toast&&TITLE.toast((pr.p&&pr.p.n||'A teammate')+(why==='bye'?' left the match. A CPU fighter takes over.':' lost connection. A CPU fighter takes over.'),3500)}catch(x){}}

// ---------------------------------------------------------------- messages
function onMsg(m){if(!SQ.on||!m||typeof m!=='object'||!m.c||m.c===cid)return;
 let pr=peers.get(m.c);
 if(!pr){pr={c:m.c,idx:m.i|0,p:null,ent:null,s:null,at:performance.now(),ld:false};peers.set(m.c,pr)}
 pr.at=performance.now();
 switch(m.t){
  case 'hi':if(m.l)pr.ld=true;if(m.p&&LOOK[m.p.f]){pr.p=m.p;pr.idx=m.i|0;bind(pr);if(!pr.known){pr.known=1;send({t:'hi',p:prof(),l:landed?1:0})}}break; // (answer a newcomer once so they learn about me at once)
  case 's':pr.ld=true;if(!pr.ent)bind(pr);pr.s={x:m.x,y:m.y,z:m.z,yaw:m.a,pitch:m.p,cr:m.cr,vx:m.vx,vz:m.vz,gr:m.g,hp:m.hp,ar:m.ar,sh:m.sh,wid:m.w,wl:m.l,at:performance.now(),fresh:true};break;
  case 'f':if(pr.ent&&window.BRX&&mode==='play')recvFire(pr.ent,m);break;
  case 'bk':{const e=E_()[m.k];if(e&&e.hp>0&&!e.remote&&BRX.ents.indexOf(e)>=Math.max(1,team())){const by=m.h>=0?entOfMember(m.h):E_()[m.b]||null;SQ.rcv=true;try{BRX.died(e,by)}finally{SQ.rcv=false}}break}
  case 'dead':{if(pr.ent&&pr.ent.hp>0){const by=E_()[m.b]||null;SQ.rcv=true;try{pr.ent.hp=0;BRX.died(pr.ent,by&&by!==pr.ent?by:null)}finally{SQ.rcv=false}}break}
  case 'ld':pr.ld=true;break;
  case 'fin':if(m.w&&window.BRX&&!BRX.picking&&P.hp>0&&BRX.finish)BRX.finish(1,true);break;
  case 'bye':unbind(pr,'bye');peers.delete(m.c);break}}
const entOfMember=h=>{if(h===cfg.idx)return P;for(const pr of peers.values())if(pr.idx===h&&pr.ent)return pr.ent;return null};

function recvFire(e,m){const w=WPN(m.w,m.l);e.rc=1;
 for(const b of m.b){if(!Array.isArray(b)||b.length<9||!b.every(Number.isFinite))continue;
  const p=new THREE.Vector3(b[0],b[1],b[2]),v=new THREE.Vector3(b[3],b[4],b[5]),q=new THREE.Vector3(b[6],b[7],b[8]);let me;
  if(window.BV){const dn=v.clone().normalize();me=BV.mk(w,p,dn);if(!recvFire.fx){recvFire.fx=1;BV.fired(e,w,p,dn,1,true)}}else{me=new THREE.Mesh(w.rocket?rg:bg,w.rocket?rm:bm);me.position.copy(p);me.lookAt(p.clone().add(v))}
  S.add(me);bl.push({m:me,p,q,v,life:w.life,e,w})}
 recvFire.fx=0;if(window.SFX&&Math.hypot(P.x-e.x,P.z-e.z)<40)(SFX[w.id]||SFX.rifle)()}

// ---------------------------------------------------------------- wrappers (installed once; all of them do nothing outside a squad match)
const _phys=phys;phys=function(e,dt){if(e.remote)return;_phys(e,dt)};
const _dmg=dmg;dmg=function(e,n){if(e.remote){e.hitT=3.5;return}_dmg(e,n)};
const _fire=fire;fire=function(e,dir){if(!SQ.on||e!==P||!ch||!window.BRX)return _fire(e,dir);
 const n=bl.length;_fire(e,dir);const b=[];for(let i=n;i<bl.length;i++){const x=bl[i];b.push([r2(x.p.x),r2(x.p.y),r2(x.p.z),r2(x.v.x),r2(x.v.y),r2(x.v.z),r2(x.q.x),r2(x.q.y),r2(x.q.z)])}
 if(b.length&&peers.size)send({t:'f',w:P.w.sig||P.w.id,l:P.w.lv||1,b})};

// ---------------------------------------------------------------- called by the match
// once the match is built: introduce myself
SQ.onStart=()=>{if(!SQ.on)return;send({t:'hi',p:prof(),l:landed?1:0});beatT=performance.now()};
// I chose my landing spot
SQ.landed=()=>{if(!SQ.on)return;landed=true;landAt=performance.now();send({t:'ld'})};
// the match clock waits for the teammates who are there (but not forever)
SQ.hold=()=>{if(!SQ.on||!window.BRX||rel)return false;if(!landed)return false;const now=performance.now();
 const want=Math.max(0,(cfg.size||1)-1),here=[...peers.values()].filter(p=>p.p),ready=here.filter(p=>p.ld).length;
 const wait=(ready<want)&&now-landAt<(here.length?30000:20000)&&!BRX.picking;
 const w=document.getElementById('sqwait');if(w)w.style.display=wait?'block':'none';
 if(!wait)rel=true;return wait};
// an elimination in my copy
SQ.died=(e,by)=>{if(!SQ.on||SQ.rcv||!ch||!window.BRX)return;const L=E_();const t=Math.max(1,team());
 const hm=x=>x===P?cfg.idx:(x&&x.remote?((peers.get(x.remote)||{}).idx):-1);
 if(e===P){send({t:'dead',b:L.indexOf(by)})}
 else if(!e.remote&&L.indexOf(e)>=t){const h=hm(by);send({t:'bk',k:L.indexOf(e),h:h==null?-1:h,b:L.indexOf(by)})}};
SQ.fin=(place,won)=>{if(SQ.on&&!SQ.rcv&&won)send({t:'fin',w:1})};
SQ.tick=dt=>{if(!SQ.on||!window.BRX)return;const now=performance.now();
 if(!BRX.picking&&now-sendT>=100&&P.hp>0){sendT=now;send({t:'s',x:r2(P.x),y:r2(P.y),z:r2(P.z),a:r2(P.yaw),p:r2(P.pitch),cr:r2(P.cr||0),vx:r2(P.vx),vz:r2(P.vz),g:P.gr?1:0,hp:r2(P.hp),ar:r2(P.ar),sh:r2(P.sh),w:P.w.sig||P.w.id,l:P.w.lv||1})}
 if(now-beatT>(peers.size>=Math.max(0,(cfg.size||1)-1)?5000:1500)){beatT=now;send({t:'hi',p:prof(),l:landed?1:0})}
 for(const pr of [...peers.values()]){
  if(!pr.ent&&pr.p)bind(pr);
  if(now-pr.at>7000){unbind(pr,'lost');peers.delete(pr.c);continue}
  const e=pr.ent,s=pr.s;if(!e||!s||e.hp<=0)continue;
  if(s.fresh){s.fresh=false;e.hp=s.hp;e.ar=s.ar;e.sh=s.sh;if(!e.g.visible){e.g.visible=true;e.x=s.x;e.z=s.z;e.y=s.y}
   if(s.wid&&(!e.w||(e.w.sig||e.w.id)!==s.wid||(e.w.lv||1)!==s.wl))try{setW(e,WPN(s.wid,s.wl))}catch(x){}}
  const age=Math.min(.25,(now-s.at)/1000),tx=s.x+s.vx*age,tz=s.z+s.vz*age,k=Math.min(1,1-Math.exp(-dt*16)),far=Math.hypot(tx-e.x,tz-e.z)>5;
  e.x=far?tx:e.x+(tx-e.x)*k;e.z=far?tz:e.z+(tz-e.z)*k;e.y=far?s.y:e.y+(s.y-e.y)*Math.min(1,k*1.5);
  e.yaw=lerpA(e.yaw,s.yaw,Math.min(1,k*1.4));e.pitch+=(s.pitch-e.pitch)*k;e.cr=(e.cr||0)+(s.cr-(e.cr||0))*k;e.vx=s.vx;e.vz=s.vz;e.vy=0;e.gr=!!s.gr;e.blk=false}};
SQ.stop=()=>{SQ.unseed();if(ch){try{send({t:'bye'})}catch(e){}const c=ch;ch=null;setTimeout(()=>{try{c.leave()}catch(e){}},400)}
 for(const pr of peers.values()){const e=pr.ent;if(e){e.remote=null;e.hu=0;e.nofire=false}}peers=new Map();
 const had=SQ.on;SQ.on=false;SQ.pending=false;landed=false;const w=document.getElementById('sqwait');if(w)w.style.display='none';
 if(had&&window.Online&&Online.sqEnd)try{Online.sqEnd()}catch(e){}};
SQ.peers=()=>[...peers.values()].map(p=>({c:p.c,idx:p.idx,n:p.p&&p.p.n,ld:p.ld,bound:!!p.ent}));
const wt=document.createElement('div');wt.id='sqwait';wt.innerHTML='<b>WAITING FOR YOUR TEAM</b><small>The match starts when your teammates have landed.</small>';wt.style.display='none';document.body.appendChild(wt);
})();
