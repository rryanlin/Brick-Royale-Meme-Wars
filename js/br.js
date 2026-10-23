/* Battle Royale: you and 19 CPU fighters on one map, one life each, floor loot, and a storm that closes in until one is left.
   How it plugs in:
   - While a match runs, window.BRX exists. game.js asks BRX for the list of fighters (ENTS) and for "who is the foe of this one" (FOE), so bullets, melee, explosions,
     traps and the other systems work on all twenty instead of two. Outside Battle Royale BRX is null and everything is the normal 1v1.
   - Every CPU fighter runs the normal bot brain (game.js bot + nav.js), pointed at a target. With nobody to fight it walks to loot or a wander point instead and does not fire.
   - STORM (storm.js) is configured for a long match (STORM.cfg) and burns every fighter outside the circle; BRX.died is called for every elimination. */
(()=>{
let N=20,TEAM=0,RK=false;const TIERS=[{n:'Common',c:0xc3cbd6,L:1,w:46},{n:'Uncommon',c:0x4cd964,L:6,w:28},{n:'Rare',c:0x3d9bff,L:11,w:15},{n:'Epic',c:0xb44dff,L:16,w:8},{n:'Legendary',c:0xffb300,L:21,w:3}];
const NAMES=['Brickzilla','Studmuffin','LegoLass','Clutch Kid','Plate Eater','Snap Judge','Bluey Bricks','Sir Studs','Gluegun Gary','Pixel Pete','Knobby','Minifig Mike','Rubble Rose','Block Star','Duplo Dan','Tile Tony','Hinge Hank','Axle Annie','Lug Nut','Baseplate Bo','Cheese Slope','Jumper Jim','Round Rick','Arch Angel','Wedge Will','Antenna Al'];
const rnd=(a,b)=>a+Math.random()*(b-a),pickOf=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tierOf=w=>{const L=(w&&w.lv)||1;return L>=21?4:L>=16?3:L>=11?2:L>=6?1:0};
const power=w=>w?w.dmg*(w.seq?1:(w.pel||1))/w.rate*(w.rocket?.8:1):0;
window.BRX=null;
const pool=[];                       // the 18 extra CPU fighters, kept between matches (the 20th is the normal opponent E)
const LOOT=[];                       // things on the floor
let alive=N,kills=0,feedEl,hudEl,endEl,tagEl,promptEl=null,promptKey='',timeStart=0,res=null,gens=0;
const el=(t,id,html,par)=>{const d=document.createElement(t);if(id)d.id=id;if(html!=null)d.innerHTML=html;(par||document.body).appendChild(d);return d};

// ---------- HUD
hudEl=el('div','bralive','<b>20</b> ALIVE<span> &middot; <b>0</b> KILLS</span>',$('mid'));
feedEl=el('div','brfeed','',$('hud'));
promptEl=el('div','brprompt','',$('hud'));promptEl.style.display='none';
tagEl=el('div','brtag','<b>BATTLE ROYALE</b> You + 19 CPU fighters. One life. Loot guns, stay inside the storm, be the last one standing.',null);
{const go=$('go');if(go&&go.parentNode)go.parentNode.insertBefore(tagEl,go)}
endEl=el('div','brend','<div class="wbox"><h2 id="brh">VICTORY ROYALE!</h2><p id="brp"></p><div id="brs"></div><div class="brb"><button id="bragain" class="pgo">PLAY AGAIN</button><button id="brmenu">MENU</button></div></div>');
const nameOf=e=>e===P?(window.PROFILE&&PROFILE.name()||'You'):(e.bn||LOOK[e.id].nm);
function feed(by,e,why){const d=document.createElement('div');
 d.innerHTML=by&&by!==e?'<b'+(by===P?' class="me"':'')+'>'+nameOf(by)+'</b> eliminated <b'+(e===P?' class="me"':'')+'>'+nameOf(e)+'</b>':'<b'+(e===P?' class="me"':'')+'>'+nameOf(e)+'</b> '+(why||'was caught in the storm');
 feedEl.appendChild(d);while(feedEl.children.length>5)feedEl.removeChild(feedEl.firstChild);setTimeout(()=>d.remove(),5200)}
const teamsAlive=()=>{const t=new Set();if(BRX)for(const e of BRX.ents)if(e.hp>0)t.add(e.team);return t.size},NT=()=>TEAM?Math.ceil(N/TEAM):N,ally=(a,b)=>!!TEAM&&!!a&&!!b&&a!==b&&a.team===b.team;
let teamEl=null;
function teamHud(){if(!TEAM||!BRX){if(teamEl)teamEl.style.display='none';return}
 if(!teamEl){teamEl=el('div','brteam','',$('hud'))}
 const h=BRX.ents.filter(e=>e!==P&&e.team===P.team).map(e=>'<div class="'+(e.hp<=0?'dn ':'')+(e.hu?'hu':'')+'"><b>'+nameOf(e)+'</b><i><u style="width:'+Math.round(Math.max(0,e.hp)/e.mx*100)+'%"></u></i></div>').join('');
 teamEl.style.display='block';if(teamEl.dataset.h!==h){teamEl.dataset.h=h;teamEl.innerHTML='<small>YOUR TEAM</small>'+h}}
function hud(){const a=aliveN(),t=TEAM?teamsAlive():0,key=kills+'|'+t;if(a!==alive||hudEl.dataset.k!==key){alive=a;hudEl.dataset.k=key;hudEl.innerHTML='<b>'+a+'</b> ALIVE'+(TEAM?'<span> &middot; <b>'+t+'</b> TEAMS</span>':'')+'<span> &middot; <b>'+kills+'</b> KILLS</span>'}teamHud()}
const aliveN=()=>BRX?BRX.ents.reduce((n,e)=>n+(e.hp>0?1:0),0):N;

// ---------- picking spots on open floor (the arena is 180 x 180 m: three times the normal one in each direction)
const mainOk=(x,z)=>!window.MAPS||!MAPS.mainWalk||MAPS.mainWalk(x,z);
const okAt=(x,z)=>Math.abs(x)<A-3&&Math.abs(z)<A-3&&(!window.NAV||NAV.ok(x,z))&&mainOk(x,z);
function spotNear(x,z,used,gap){gap=gap||4.5;const fine=(px,pz)=>okAt(px,pz)&&(!used||used.every(q=>Math.hypot(q[0]-px,q[1]-pz)>=gap));if(fine(x,z))return[x,z];
 for(let r=1;r<18;r+=1){for(let i=0;i<12;i++){const a=Math.random()*6.2832,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(fine(px,pz))return[px,pz]}}return[x,z]}
function randSpot(rad,avoid){rad=rad||A-6;for(let i=0;i<120;i++){const x=rnd(-rad,rad),z=rnd(-rad,rad);if(!okAt(x,z))continue;if(avoid&&avoid.some(q=>Math.hypot(q[0]-x,q[1]-z)<avoid.d))continue;return[x,z]}return spotNear(0,0)}
// the spot (out of 40 random tries) that is farthest from every spot in `others`: used to land the CPU fighters evenly over the arena
function farSpot(others){let best=null,bd=-1;for(let t=0;t<40;t++){const s=randSpot(A-8);let m=1e9;for(const q of others)m=Math.min(m,Math.hypot(q[0]-s[0],q[1]-s[1]));if(m>bd){bd=m;best=s}}return best}
// a spot near x,z that fighters can really stand on (the drop zone screen uses these)
function nearSpawn(x,z,r){if(okAt(x,z))return[x,z];for(let d=1;d<=r;d+=1){for(let i=0;i<16;i++){const a=i/16*6.2832,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(okAt(px,pz))return[px,pz]}}return null}

// ---------- things on the floor. There is NO random loot lying around: guns, melee weapons and items only appear when a fighter is eliminated and drops what they carried.
// Only health and armour pickups are spread over the map. Kinds: 'gun' (a whole weapon, level and stats kept), 'mel' (a melee weapon id), 'item' (an item key), 'h' health, 's' armour.
const lootGeo=()=>({disc:new THREE.CylinderGeometry(.62,.62,.06,18),beam:new THREE.CylinderGeometry(.1,.1,4.5,8,1,true)});
let LG=null;
const STM={br:[50,290],duos:[50,290],trios:[50,290],solo:[45,260],ranked:[32,200]}; // when the storm starts closing and when it is at its smallest (seconds)
const hexOf=c=>typeof c==='string'?parseInt(c.replace('#',''),16):c;
const MRAR={common:0xc3cbd6,rare:0x3d9bff,epic:0xb44dff,legend:0xffb300};
const gunName=w=>(w.n||w.base||w.id||'gun');
const melName=id=>{const m=window.MW&&MW.by&&MW.by[id];return m?(m.sn||m.name):id};
const itemName=k=>(window.IT&&IT[k]&&IT[k].n)||(window.ITEMS&&ITEMS.def[k]&&ITEMS.def[k].n)||k;
function colOf(kind,pl){
 if(kind==='gun')return TIERS[tierOf(pl)].c;
 if(kind==='mel'){const m=window.MW&&MW.by&&MW.by[pl];return MRAR[m&&m.rar]||0xc3cbd6}
 if(kind==='item'){const r=window.IT&&IT[pl]&&IT[pl].r,R=window.ITEMS&&ITEMS.rar&&ITEMS.rar[r];return R?hexOf(R.c):0x7df9ff}
 return kind==='h'?0x2fd24c:0x3d8bff}
function fitModel(raw,size){const bb=new THREE.Box3().setFromObject(raw),s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),m=Math.max(s.x,s.y,s.z);
 if(!(isFinite(m+c.x+c.y+c.z)&&m>.05))return null;raw.position.set(-c.x,-c.y,-c.z);const h=new THREE.Group();h.add(raw);h.scale.setScalar(size/m);return h}
function fillIt(l){l.it.children.slice().forEach(c=>l.it.remove(c));let m=null;
 try{if(l.kind==='gun'&&window.buildGun)m=fitModel(buildGun(l.pl.sig||l.pl.id,true),1.25);
  else if(l.kind==='mel'&&window.MW)m=fitModel(MW.build(l.pl),1.6);
  else if(l.kind==='item'&&window.ITEMS)m=fitModel(ITEMS.model(l.pl),1.05)}catch(e){m=null}
 if(!m)m=new THREE.Mesh(B(.6,.6,.6),M(l.col));
 l.it.add(m);
 if(l.kind==='h'){l.it.add(new THREE.Mesh(B(.9,.28,.28),M(0xffffff)));l.it.add(new THREE.Mesh(B(.28,.9,.28),M(0xffffff)))}
 if(l.kind==='s')l.it.add(new THREE.Mesh(B(.8,.9,.2),M(0x7fb8ff)))}
function recolor(l){l.col=colOf(l.kind,l.pl);l.ti=l.kind==='gun'?tierOf(l.pl):0;l.m.children[0].material.color.setHex(l.col);l.m.children[1].material.color.setHex(l.col)}
function addLoot(kind,x,z,pl,y){LG=LG||lootGeo();const col=colOf(kind,pl);
 const g=new THREE.Group();g.position.set(x,y||0,z);
 const d=new THREE.Mesh(LG.disc,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85}));d.position.y=.05;d.userData.sh=1;g.add(d);
 const b=new THREE.Mesh(LG.beam,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.y=2.3;b.userData.sh=1;g.add(b);
 const it=new THREE.Group();it.position.y=1.0;g.add(it);
 S.add(g);const l={kind,x,z,y:y||0,pl,w:kind==='gun'?pl:null,ti:kind==='gun'?tierOf(pl):0,col,m:g,it,on:true,ph:Math.random()*6,t:0};fillIt(l);LOOT.push(l);return l}
function clearLoot(){for(const l of LOOT)S.remove(l.m);LOOT.length=0}
function removeLoot(l){S.remove(l.m);const i=LOOT.indexOf(l);if(i>=0)LOOT.splice(i,1)}
const gunIds=()=>Object.keys(LV.BASE).filter(id=>WP[id]&&!LV.BASE[id].cls);
const mkGun=(id,L)=>LV.weapon(id,clamp(Math.round(L),1,LV.MAXL));
let bagT=0;
function putBag(){const k=randItem();if(!k)return;const rad=Math.min(A-6,window.STORM&&STORM.on()?Math.max(10,STORM.radius()-5):A-6),s=randSpot(rad);const l=addLoot('item',s[0],s[1],k);l.bag=1}
// Duos and Trios: a new loot bag every few seconds all match long (up to 34 on the floor)
function bagTick(dt,act){if(!TEAM||!act||!BRX)return;bagT-=dt;if(bagT>0)return;bagT=6;if(LOOT.reduce((n,l)=>n+(l.bag?1:0),0)<34)putBag()}
function spreadLoot(){clearLoot();const used=[];used.d=9;
 const put=kind=>{const s=randSpot(A-6,used);used.push(s);addLoot(kind,s[0],s[1])};
 const nh=TEAM?30:RK?14:window.BRKIND==='solo'?24:18;for(let i=0;i<nh;i++)put('h');for(let i=0;i<nh;i++)put('s');
 if(TEAM)for(let i=0;i<40;i++)putBag()} // (Duos and Trios: a bit more health and armour, and loot bags lying around from the first second)
function equip(e,w){if(e===P&&P.slots)P.slots[P.si]=w;setW(e,w);if(e===P)P.mel=false}
// swap the gun in e's hands with the gun on the floor: the old one stays on the floor spot with all its stats
function swapGun(e,l){const old=e.w,nw=l.pl;equip(e,nw);
 if(old&&old.lv&&power(old)>0){l.pl=old;l.w=old;recolor(l);fillIt(l);l.t=1.2;return'swap'}
 removeLoot(l);return true}
function swapMel(e,l){const old=e.mw,nw=l.pl;e.mw=nw;try{MW.apply(e)}catch(x){}
 if(old){l.pl=old;recolor(l);fillIt(l);l.t=1.2;return'swap'}removeLoot(l);return true}
function swapItem(e,l){if(!e.inv)e.inv=[];
 if(e.inv.length<3){e.inv.push(l.pl);removeLoot(l);return true}
 const old=e.inv.pop();e.inv.push(l.pl);l.pl=old;recolor(l);fillIt(l);l.t=1.2;return'swap'}
// what the CPU picks up by itself: a better gun, items while the bag has room, health and armour when needed (it keeps its own melee weapon)
function botTake(e,l){
 if(l.kind==='gun'){if(power(l.pl)<=power(e.w)*1.08)return false;return swapGun(e,l)}
 if(l.kind==='item'){if(!e.inv||e.inv.length>=3)return false;e.inv.push(l.pl);removeLoot(l);return true}
 if(l.kind==='h'){if(e.hp>=e.mx)return false;e.hp=Math.min(e.mx,e.hp+35*(e.hs||1));removeLoot(l);return true}
 if(l.kind==='s'){if(e.ar>=50)return false;e.ar=Math.min(50,e.ar+25);removeLoot(l);return true}
 return false}
// what you do with E: take it or swap it with what you hold
function describe(l){
 if(l.kind==='gun'){const w=l.pl,cur=P.w;return{k:'gun',c:l.col,t:TIERS[tierOf(w)].n.toUpperCase()+' '+gunName(w).toUpperCase()+' &middot; LV '+(w.lv||1),s:'DPS '+Math.round(power(w))+(cur?' (yours '+Math.round(power(cur))+')':''),v:'SWAP GUN'}}
 if(l.kind==='mel'){const m=MW.by[l.pl]||{},cur=MW.by[P.mw]||{};return{k:'mel',c:l.col,t:melName(l.pl).toUpperCase(),s:(m.dmg||0)+' dmg (yours '+(cur.dmg||0)+')',v:'SWAP MELEE'}}
 const room=(P.inv||[]).length<3;return{k:'item',c:l.col,t:itemName(l.pl).toUpperCase(),s:room?'':'bag full - swaps your last item',v:room?'PICK UP':'SWAP ITEM'}}
function nearLoot(){let best=null,bd=2.6;for(const l of LOOT){if(l.kind==='h'||l.kind==='s'||Math.abs(P.y-l.y)>1.8)continue;const d=Math.hypot(P.x-l.x,P.z-l.z);if(d<bd){bd=d;best=l}}return best}
function interact(){const l=BRX&&P.hp>0&&!over&&mode==='play'&&!BRX.picking?nearLoot():null;if(!l)return false;
 let r;
 if(l.kind==='gun'){const n=TIERS[tierOf(l.pl)].n.toUpperCase()+' '+gunName(l.pl).toUpperCase();r=swapGun(P,l);say((r==='swap'?'SWAPPED: ':'PICKED UP: ')+n,1.3)}
 else if(l.kind==='mel'){const n=melName(l.pl).toUpperCase();r=swapMel(P,l);say((r==='swap'?'MELEE SWAPPED: ':'MELEE: ')+n,1.3)}
 else{const n=itemName(l.pl).toUpperCase();r=swapItem(P,l);say((r==='swap'?'ITEM SWAPPED: ':'PICKED UP: ')+n,1.1)}
 try{window.SFX&&SFX.pick&&SFX.pick()}catch(e){}
 return r}
function prompt(){const l=BRX&&!BRX.picking&&P.hp>0&&!over&&mode==='play'?nearLoot():null,key=l?l.kind+l.col+(l.pl&&(l.pl.id||l.pl)||'')+(P.inv?P.inv.length:0):'';
 if(key===promptKey)return;promptKey=key;
 if(!l){promptEl.style.display='none';return}
 const d=describe(l);promptEl.style.display='flex';promptEl.style.setProperty('--c','#'+d.c.toString(16).padStart(6,'0'));
 promptEl.innerHTML='<i>E</i><div><b>'+d.t+'</b><small>'+d.v+(d.s?' &middot; '+d.s:'')+'</small></div>'}
function lootStep(dt,act){for(let i=LOOT.length-1;i>=0;i--){const l=LOOT[i];l.m.visible=true;l.it.rotation.y+=dt*1.6;l.it.position.y=1.0+Math.sin(T*2.4+l.ph)*.12;
  l.t=Math.max(0,l.t-dt);if(!act||l.t>0)continue;
  for(const e of BRX.ents){if(e.hp<=0||Math.abs(e.y-l.y)>1.5||Math.hypot(e.x-l.x,e.z-l.z)>1.5)continue;
   if(e===P){ // you only walk over health and armour; guns, melee weapons and items wait for E
    if(l.kind==='h'){if(e.hp>=e.mx)continue;e.hp=Math.min(e.mx,e.hp+35*(e.hs||1));say('+HEALTH',.8);removeLoot(l);break}
    if(l.kind==='s'){if(e.ar>=50)continue;e.ar=Math.min(50,e.ar+25);say('+ARMOR',.8);removeLoot(l);break}
    continue}
   if(botTake(e,l))break}}
 prompt()}
// a fighter went down: everything they carried falls to the floor on the spot, with its level and stats
function dropAll(e){if(e.dropped)return;e.dropped=true;const out=[];
 const guns=[];if(e.w&&e.w.lv&&power(e.w)>0)guns.push(e.w);if(e===P&&P.slots)for(const w of P.slots)if(w&&w.lv&&!guns.includes(w))guns.push(w);
 for(const w of guns)out.push(['gun',w]);
 if(e.mw)out.push(['mel',e.mw]);
 for(const k of(e.inv||[]))out.push(['item',k]);
 e.inv=[];const n=out.length,hi=e.y>.7;
 out.forEach((o,i)=>{let x=e.x,z=e.z,y=Math.max(0,e.y);
  if(n>1){const a=i/n*6.2832+Math.random()*.4,r=hi?.8:1.7,px=e.x+Math.cos(a)*r,pz=e.z+Math.sin(a)*r;if(hi||!window.NAV||NAV.ok(px,pz)){x=px;z=pz}} // (a ring around where they fell; on a roof or a wall's edge they stay close together)
  addLoot(o[0],x,z,o[1],y)})}
function randItem(){const keys=Object.keys((window.ITEMS&&ITEMS.def)||{});if(!keys.length)return null;const W=k=>(window.ITEMS.rar[ITEMS.def[k].r]||{w:5}).w;let r=Math.random()*keys.reduce((s,k)=>s+W(k),0);for(const k of keys){r-=W(k);if(r<=0)return k}return keys[0]}

// ---------- the fighters
function newBot(){const b=ent('doge',true);b.brBot=true;return b}
function dress(b,first){const ids=Object.keys(LOOK).filter(i=>i!==P.id);
 skin(b,pickOf(ids));if(b.ab!=='dash'&&b.ab!=='shield'){b.ab=Math.random()<.5?'dash':'shield'}
 const g=gunIds(),id=pickOf(g);setW(b,mkGun(id,rnd(1,12)));
 if(window.MW){const list=MW.list.filter(w=>!w.sig);b.mw=pickOf(list).id;try{MW.apply(b)}catch(e){}}
 b.inv=[];{const n=(Math.random()<.5?1:0)+(Math.random()<.2?1:0);for(let i=0;i<n;i++){const k=randItem();if(k)b.inv.push(k)}}b.dropped=false;b.bn=NAMES[Math.floor(Math.random()*NAMES.length)]+(Math.random()<.4?' '+(1+Math.floor(Math.random()*99)):'');b.nofire=false;b.dead=false;b.nv=null;b.tg=null;b.tgT=0;b.goT=0;b.wander=null;b.kc=0;b.place=0;
 b.dum=b.dum||{x:0,y:0,z:0,vx:0,vz:0,vy:0,hp:99,mx:99,ar:0,cr:0,dummy:true,id:'doge',sh:0,hh:2.4};b.g.visible=true}
function reset(b){b.hp=b.mx;b.ar=b.sa||0;b.vx=b.vz=b.vy=0;b.y=0;b.dash=0;b.sh=0;b.sw=0;b.rev=0;b.cd.f=b.cd.m=b.cd.a=0;b.dead=false;b.g.visible=true;b.place=0;b.kc=0}

// ---------- bot brain: pick something to shoot, or something to walk to
const nearest=(b)=>{let q=null,bd=1e9;for(const o of BRX.ents){if(o===b||o.hp<=0||ally(b,o))continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d<bd){bd=d;q=o}}return[q,bd]};
function choose(b){ // a fight when someone is close or in sight, otherwise loot or a wander point
 const[q,d]=nearest(b);
 if(q&&(d<9||(d<28&&!blocked(b,q)))&&Math.abs(q.y-b.y)<4){b.tg=q;return q}
 b.tg=null;return null}
function goal(b){const zr=window.STORM&&STORM.on()?STORM.radius():A*1.42,lim=Math.max(3,zr-5);let best=null,bd=1e9;
 const needH=b.hp<b.mx*.65,needS=b.ar<25,pw=power(b.w);
 const mate=TEAM&&b.team===P.team&&b!==P&&P.hp>0;
 for(const l of LOOT){if(!l.on||Math.hypot(l.x,l.z)>lim||l.t>0)continue;if(mate&&Math.hypot(l.x-P.x,l.z-P.z)>26)continue;
  const want=l.kind==='gun'?power(l.pl)>pw*1.12:l.kind==='item'?(b.inv&&b.inv.length<3):l.kind==='h'?needH:l.kind==='s'?needS:false;if(!want)continue;
  const d=Math.hypot(l.x-b.x,l.z-b.z)-(l.kind==='gun'?l.ti*3:0);if(d<bd&&d<70){bd=d;best=l}}
 if(best)return[best.x,best.z];
 if(mate){if(!b.wander||b.wT<=0||Math.hypot(P.x-b.x,P.z-b.z)>9){b.wander=spotNear(P.x+rnd(-4,4),P.z+rnd(-4,4),null,2);b.wT=rnd(2,4)}return b.wander}
 if(!b.wander||Math.hypot(b.wander[0]-b.x,b.wander[1]-b.z)<2.2||b.wT<=0||Math.hypot(b.wander[0],b.wander[1])>lim){
  // somewhere 15-50 m away; once the storm is out it drifts toward the middle
  let w=null;const inw=STORM_ON();
  for(let i=0;i<30&&!w;i++){const a=Math.random()*6.2832,r=rnd(15,50),tx=b.x+Math.cos(a)*r,tz=b.z+Math.sin(a)*r,m=Math.hypot(tx,tz);if(m>lim)continue;if(inw&&m>Math.hypot(b.x,b.z)+4)continue;if(okAt(tx,tz))w=[tx,tz]}
  b.wander=w||spotNear(b.x*.7,b.z*.7);b.wT=rnd(8,14)}
 return b.wander}
const STORM_ON=()=>window.STORM&&STORM.on();
let frame=0,_bot0=null;
function think(dt){const L=BRX.bots,n=L.length;window.NAVBUD=2;frame++;
 for(let k=0;k<n;k++){const b=L[(k+frame)%n];if(b.hp<=0||b.remote)continue; // (a real teammate in a squad match is driven by their own game)
  
  b.tgT-=dt;b.wT=(b.wT||0)-dt;
  if(b.tgT<=0||!b.tg||b.tg.hp<=0){b.tgT=rnd(.35,.7);choose(b)}
  let p=b.tg;
  if(p&&p.hp>0){b.nofire=false}
  else{p=b.dum;b.nofire=true;const g=goal(b);p.x=g[0];p.z=g[1];p.y=0}
  window.__BE=b;window.__BP=p;
  try{_bot0(dt)}finally{window.__BE=window.__BP=null}}
 window.NAVBUD=undefined}

// ---------- eliminations and the end of the match
function died(e,by){if(e.dead)return;e.dead=true;e.hp=0;e.vx=e.vz=0;if(window.SQ&&SQ.on)SQ.died(e,by);e.place=TEAM?teamsAlive()+(BRX.ents.some(o=>o.hp>0&&o.team===e.team)?0:1):aliveN()+1;
 if(by&&by!==e&&by.hp>0){by.kc=(by.kc||0)+1;if(by===P){kills++;say('ELIMINATED '+nameOf(e).toUpperCase(),1.2)}}
 feed(by,e);
 if(e!==P)e.g.visible=false;
 try{dropAll(e)}catch(x){console.error(x)}
 hud();
 if(e===P)return finish(e.place,false);
 if((TEAM?teamsAlive():aliveN())<=1&&P.hp>0)finish(1,true)}
function finish(place,won){if(res||!window.BRX)return;res={place,won,kills,t:(performance.now()-timeStart)/1000};over=true;if(window.SQ&&SQ.on)SQ.fin(place,won);
 say(won?'VICTORY ROYALE!':'ELIMINATED  -  #'+place+' OF '+NT(),3);try{window.SFX&&SFX[won?'win':'lose']&&SFX[won?'win':'lose']()}catch(e){}
 setTimeout(()=>{if(window.BRX&&res)showEnd()},won?2600:2200)}
function reward(r){const xp=Math.round(30+(NT()-r.place)*6+r.kills*25+(r.won?150:0)),bx=Math.round(5+r.kills*5+(r.won?100:r.place<=3?20:0));let lv=null;
 try{if(window.ACCT){lv=ACCT.add(xp);ACCT.record&&ACCT.record(1,r.won?1:0,r.kills)}}catch(e){}try{if(window.BUX)BUX.add(bx)}catch(e){}return{xp,bx,lv}}
function showEnd(){const r=res;mode='over';if(RK&&window.RANK&&!r.rk)r.rk=RANK.apply(r.place,N,r.kills,r.won);try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}$('hud').style.display='none';
 const rw=reward(r);r.rw=rw;
 $('brh').textContent=r.won?'VICTORY ROYALE!':'#'+r.place+' OF '+NT();$('brh').className=r.won?'win':'';
 $('brp').textContent=RK&&!r.won?(r.place<=5?'Top 5, good placing. Win more to climb the ranks.':'Ranked loss. Loot up and stay inside the circle.'):r.won?(TEAM?'Your team was the last one standing.':'You were the last one standing.'):r.place<=3?'So close. You made the top 3.':'You were eliminated. Loot up and stay inside the circle.';
 const m=Math.floor(r.t/60),s=Math.floor(r.t%60);
 $('brs').innerHTML='<div><b>#'+r.place+'</b><small>PLACE</small></div><div><b>'+r.kills+'</b><small>ELIMINATIONS</small></div><div><b>'+m+':'+String(s).padStart(2,'0')+'</b><small>SURVIVED</small></div><div><b>+'+rw.xp+'</b><small>XP'+(rw.lv&&rw.lv.to>rw.lv.from?' &middot; LEVEL UP '+rw.lv.to:'')+'</small></div><div><b>+'+rw.bx+'</b><small>BRICK BUCKS</small></div>';
 if(r.rk){const k=r.rk,t=k.after;$('brs').insertAdjacentHTML('afterend','<div id="brrk"><b class="'+(k.d>=0?'up':'dn')+'">'+(k.d>=0?'+':'')+k.d+' ELO</b><span><u style="color:'+t.color+'">'+t.label+'</u> &middot; '+k.to+' ELO'+(k.promoted?' &middot; <em>RANK UP!</em>':'')+'</span><i><s style="width:'+t.pct+'%;background:'+t.color+'"></s></i></div>')}
 else{const o=document.getElementById('brrk');if(o)o.remove()}
 $('bragain').style.display=window.SQ&&SQ.on?'none':'';
 endEl.style.display='flex'}
function hideEnd(){endEl.style.display='none';const o=document.getElementById('brrk');if(o)o.remove()}
$('bragain').onclick=()=>{if(window.SQ&&SQ.on)SQ.stop();hideEnd();$('hud').style.display='block';mode='play';start()};
$('brmenu').onclick=()=>{hideEnd();cleanup();resetRound(true);if(window.TITLE)TITLE.showTitle()};

// ---------- start / stop
let R0=Math.round(52*1.42); // the storm starts just outside the corners of the 104 x 104 m arena (set again for every match)
function cleanup(){if(teamEl)teamEl.style.display='none';if(window.SQ&&(SQ.on||SQ.pending)&&!SQ.keep)SQ.stop();
 if(RK&&window.RANK&&window.BRX&&!res&&!BRX.picking&&P.hp>0){try{RANK.apply(N,N,kills,false)}catch(e){}} // (leaving a ranked match counts as a loss)
 if(!window.BRX){document.body.classList.remove('br');if(window.DIFF)DIFF.tmp(null);return}
 window.BRX=null;window.__BE=window.__BP=null;window.NAVBUD=undefined;document.body.classList.remove('br');if(window.DIFF)DIFF.tmp(null);
 for(const b of pool)S.remove(b.g);clearLoot();feedEl.innerHTML='';res=null;promptKey='';promptEl.style.display='none';
 if(window.BRMAP)BRMAP.hide();
 try{sun.target.position.set(0,0,0)}catch(e){}
 E.g.visible=true;E.nofire=false;E.dead=false;E.brBot=false;
 if(window.STORM)STORM.def();
 if(window.MAPS&&MAPS.tiled&&MAPS.tiled()){try{MAPS.apply(MAPS.cur)}catch(e){console.error(e)}} // back to the normal 60 m arena
 }
function start(){try{return start0()}finally{if(window.SQ)SQ.unseed()}}
function start0(){const sq=window.SQ&&SQ.take();gens++;hideEnd();res=null;kills=0;timeStart=performance.now();feedEl.innerHTML='';promptKey='';
 // the arena: the chosen map as the 60 x 60 core in the middle with four new regions around it (104 x 104 m, three times the area)
 try{let id=MAPS.cur;if(MAPS.ring&&(!MAPS.ring.has(id)||(MAPS.by[id]&&MAPS.by[id].tour&&!MAPS.force))){const l=MAPS.ring.ids();id=l[Math.floor(Math.random()*l.length)]}MAPS.applyTiled(id,1,{ring:1})}catch(e){console.error(e)}
 R0=Math.round(A*1.42);
 if(sq)SQ.seed(1);
 while(pool.length<N-2)pool.push(newBot()); // (the same 18 extra fighters are reused every match, so nothing piles up in the scene)
 E.brBot=true;
 const ents=[P,E].concat(pool.slice(0,N-2)),bots=ents.slice(1);const sz=TEAM||1;ents.forEach((e,i)=>e.team=Math.floor(i/sz));bagT=0;
 window.BRX={on:true,ents,bots,foe:null,nearTo:null,died,picking:true,r0:R0,team:TEAM};
 BRX.foe=e=>{let q=null,bd=1e9;for(const o of ents){if(o===e||o.hp<=0||ally(e,o))continue;const dx=o.x-e.x,dz=o.z-e.z,d=Math.hypot(dx,dz);let s=d;if(e===P&&d>.01){const f=(dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw))/d;s=d*(1.7-.7*Math.max(0,f))} // for you: whoever is in front of you counts as closer (your hammer swing goes where you face)
   if(s<bd){bd=s;q=o}}return q||(e===P?E:P)};
 BRX.nearTo=(x,z,owner,r)=>{let q=null,bd=r;for(const o of ents){if(o===owner||o.hp<=0||ally(owner,o))continue;const d=Math.hypot(o.x-x,o.z-z);if(d<bd){bd=d;q=o}}return q};
 BRX.ally=ally;BRX.loot=LOOT;BRX.alive=aliveN;BRX.kills=()=>kills;BRX.finish=finish;BRX.start=start;
 for(const e of ents){e.dead=false;e.place=0;e.kc=0;e.nofire=false;e.tg=null;e.dropped=false}
 document.body.classList.add('br');
 {const t=RK?STM.ranked:(STM[window.BRKIND||'br']||STM.br);STORM.cfg(t[0],t[1],R0,2)}
 if(window.DIFF)DIFF.tmp(RK&&window.RANK?RANK.diff():null); // (ranked: the CPU fighters play as hard as your rank deserves)
 if(sq)SQ.seed(2);
 for(const b of ents){if(b===P)continue;dress(b)}
 resetRound(); // (clears pickups and effects for every fighter; the normal "ROUND 1" intro is replaced below)
 for(const b of bots)reset(b);
 P.inv=P.inv||[];P.dropped=false;
 // the 1v1 pickups (health, armour, loot bag) are not used here: the arena has its own, and guns only come from fallen fighters
 for(const c of chests){c.t=1e9;c.m.visible=false}for(const q of SPOTS){q.on=false;q.t=1e9;q.m.visible=false}
 if(sq)SQ.seed(3);
 spreadLoot();
 if(sq)SQ.seed(4);
 // everyone else lands at random, well apart from each other; you choose your spot on the drop zone screen
 const placed=[],lead={};
 ents.forEach(e=>{if(e===P)return;let s;if(TEAM&&e.team!==P.team&&lead[e.team])s=spotNear(lead[e.team][0],lead[e.team][1],placed,3);else{s=farSpot(placed);if(TEAM)lead[e.team]=s}placed.push(s);e.x=s[0];e.z=s[1];e.y=0;e.vx=e.vz=e.vy=0;e.yaw=Math.atan2(e.x,e.z);e.nv=null;e.wander=null});
 P.x=0;P.z=0;P.y=0;P.vx=P.vz=P.vy=0;
 if(sq)SQ.unseed();
 if(window.BRMAP)BRMAP.build();
 if(sq)SQ.onStart();
 yaw=P.yaw;pitch=0;$('score').textContent='';hud();
 introT=3.2;
 if(window.BRMAP&&!window.BRNOPICK)BRMAP.pick((x,z)=>drop(x,z),40);else{const s=randSpot(A-8,placed);drop(s[0],s[1])}}
// you have chosen: land there (anyone who landed too close is moved away)
function drop(x,z){if(!window.BRX)return;const s=nearSpawn(x,z,12)||randSpot(A-8);
 P.x=s[0];P.z=s[1];P.y=0;P.vx=P.vz=P.vy=0;P.yaw=Math.atan2(P.x,P.z);yaw=P.yaw;pitch=0;
 {const mates=BRX.bots.filter(b=>ally(P,b)),others=BRX.bots.filter(b=>!ally(P,b)),keep=others.filter(b=>Math.hypot(b.x-P.x,b.z-P.z)>=22).map(b=>[b.x,b.z]);keep.push([P.x,P.z]);
  mates.forEach((b,i)=>{const q=spotNear(P.x+rnd(-4,4),P.z+rnd(-4,4),[[P.x,P.z]].concat(mates.slice(0,i).map(m=>[m.x,m.z])),2.2);b.x=q[0];b.z=q[1];b.y=0;b.nv=null;b.wander=null});
  for(const b of others)if(Math.hypot(b.x-P.x,b.z-P.z)<22){const q=farSpot(keep);keep.push(q);b.x=q[0];b.z=q[1];b.y=0;b.nv=null;b.wander=null}} // (nobody starts right next to you)
 BRX.picking=false;introT=3;timeStart=performance.now();if(window.SQ&&SQ.on)SQ.landed();try{if(window.PAUSE)PAUSE.quiet(1500);if(window.MAPS&&MAPS.cull)MAPS.cull(P.x,P.z)}catch(e){}
 say(TEAM?(TEAM===2?'DUOS':'TRIOS')+' - '+N+' FIGHTERS - LAST TEAM STANDING':window.BRKIND==='solo'?(RK?'RANKED SOLO':'SOLO')+' - 30 FIGHTERS - LAST ONE STANDING':'BATTLE ROYALE - 20 FIGHTERS - LAST ONE STANDING',3);
 try{R.domElement.requestPointerLock()}catch(e){}}

// ---------- hooks
// per frame in a match: far parts of the big arena are switched off, the sun (and its shadows) follows you, and the minimap is redrawn
function world(dt){if(window.MAPS&&MAPS.cull)MAPS.cull(P.x,P.z);
 try{const k=window.MAPS&&MAPS.lightKey&&MAPS.lightKey(),g=window.GFX0,b=k&&k.sp&&MAPS.cur!=='town'?k.sp:g?[g.sunP.x,g.sunP.y,g.sunP.z]:null;
  if(b){if(!sun.target.parent)S.add(sun.target);sun.target.position.set(P.x,0,P.z);sun.position.set(P.x+b[0],b[1],P.z+b[2])}}catch(e){}
 if(window.BRMAP)BRMAP.tick(dt)}
const _step=step;step=function(dt){
 if(!window.BRX)return _step(dt);
 if(BRX.picking||(window.SQ&&SQ.hold()))introT=3.2; // the countdown only starts once you have landed (in a squad: once your teammates have landed too)
 const act=!over&&introT<=0&&mode==='play';
 if(!act)for(const b of BRX.bots)if(!(b.dash>0)){b.vx=b.vz=0}
 _step(dt);
 if(!window.BRX)return;
 if(window.SQ&&SQ.on)SQ.tick(dt);
 lootStep(dt,act&&!BRX.picking);bagTick(dt,act&&!BRX.picking);hud();world(dt)};
{const _bot=bot;_bot0=_bot;bot=function(dt){if(!window.BRX)return _bot(dt);think(dt)}}
{const _s=shoot;shoot=function(e,dir){if(e.nofire)return;_s(e,dir)}}
{const _m=melee;melee=function(e,t){if(e.nofire)return;_m(e,t)}}
{const _r=resetRound;resetRound=function(i){if(window.BRX&&i===true&&mode!=='play')cleanup();_r(i)}}
addEventListener('keydown',e=>{if(e.key&&e.key.toLowerCase()==='e'&&!e.repeat&&window.BRX)interact()});
const loadEl=el('div','brload','<div><b>BUILDING THE ARENA</b><small>104 x 104 m - three times the arena</small></div>');
document.getElementById('go').addEventListener('click',()=>{if(window.BRPEND&&mode==='play'){ // (a moment for the browser to show the loading card before the big build starts)
  loadEl.style.display='flex';setTimeout(()=>{try{if(window.BRPEND&&mode==='play')start()}finally{loadEl.style.display='none'}},40)}
 else if(!window.BRPEND&&window.BRX)cleanup()});
function cfg(kind){N=kind==='duos'||kind==='trios'||kind==='solo'?30:20;TEAM=kind==='duos'?2:kind==='trios'?3:0;window.BRKIND=kind||'br';RK=kind==='solo'&&!!window.RANK&&RANK.on();
 tagEl.innerHTML=kind==='solo'?'<b>'+(RK?'RANKED SOLO':'SOLO')+'</b> You + 29 CPU fighters, every one for themselves.'+(RK?' Your placing and eliminations win or lose ELO.':' Loot guns from fallen fighters, stay inside the storm, be the last one standing.'):TEAM?'<b>'+(TEAM===2?'DUOS':'TRIOS')+'</b> You + '+(TEAM-1)+' CPU teammate'+(TEAM>2?'s':'')+' against '+(N/TEAM-1)+' CPU teams. Shared storm, no friendly fire. Loot bags, health and armour all over the map. Last team standing wins.':'<b>BATTLE ROYALE</b> You + 19 CPU fighters. One life. Loot guns, stay inside the storm, be the last one standing.';
 hudEl.dataset.k='';alive=-1}
window.BR={pick(show,kind){cfg(kind||'br');window.BRPEND=true;BR.sync();show()},cfg,kind:()=>window.BRKIND||'br',sync(){tagEl.style.display=window.BRPEND?'block':'none'},start,cleanup,get N(){return N},get TEAM(){return TEAM},TIERS,tierOf,power,loot:LOOT,end:()=>endEl.style.display==='flex',pool:()=>pool,
 menu(){if(window.BRX)cleanup()},okSpawn:okAt,nearSpawn,randSpawn:()=>randSpot(A-8),drop,dropAll,interact,nearLoot,addLoot,mkGun,gunIds,swapGun,swapMel,swapItem,botTake};
BR.sync();
})();
