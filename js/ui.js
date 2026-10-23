/* Menu with rendered portraits, stat bars, weapon cards and the inventory HUD. */
(()=>{
const ABN={dash:'Dash, 5s cooldown',shield:'Shield bubble, 3s, 10s cooldown',air:'Airstrike, 24s cooldown',reveal:'Reveal enemy, 10s cooldown',troll:'Troll Prank, 21s cooldown',stonks:'Stonks Zone, 22s cooldown',slam:'Sahur Slam, 20s cooldown',portal:'Pork Portal, 20s cooldown',
 frog:'Frog Hop, 16s cooldown',doom:'Doom Spiral, 18s cooldown',build:'Quick Build, 20s cooldown',juke:'Jackpot Juke, 19s cooldown',mic:'Mic Check, 17s cooldown',rush:'Rainbow Rush, 16s cooldown',clock:'Overclock, 18s cooldown',alpha:'Alpha Rush, 18s cooldown',wow:'Such Wow, 18s cooldown'};
const hex=c=>'#'+c.toString(16).padStart(6,'0'),RN=LV.NAMES;
function rig(w,h){const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(w,h);return r}
function stage(){const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x667788,1.1));const d=new THREE.DirectionalLight(0xffffff,.9);d.position.set(3,5,4);s.add(d);return s}
const tr=rig(150,190),ts=stage(),tc=new THREE.PerspectiveCamera(30,150/190,.1,50);tc.position.set(0,1.42,5.5);tc.lookAt(0,1.17,0);
const gr=rig(400,200),gs=stage(),gc=new THREE.PerspectiveCamera(28,2,.1,50);gc.position.set(3.6,.3,-.15);gc.lookAt(0,0,-.2);
function fig(id,w,big,k,out){if(window.UIpLog)UIpLog.push(['fig',id,w,!!out]);const f=window.SKN?SKN.with(k|0,()=>mini(LOOK[id])):mini(LOOK[id]);f.ham.visible=false;if(big&&(w==='rpg'||w==='sg_sahur'))f.gs=1.35;if(out)f.ads=window.HOLDOUT||.9;attachGun(f,w);return f} // f.gs only enlarges the rocket launcher on the fighter screen, never in a match
const PC={};function portrait(id,k,gun,out){k=k|0;gun=gun||'rifle';if(window.UIpLog)UIpLog.push(['portrait',id,gun,!!out]);const key=(k?id+'#'+k:id)+(gun==='rifle'&&!out?'':'@'+gun+(out?'o':''));if(PC[key])return PC[key];const f=fig(id,gun,0,k,out);f.g.rotation.y=Math.PI-(out?(window.HOLDROT||.5):.3);if(out)f.g.position.x=window.HOLDX||.34;ts.add(f.g);tr.render(ts,tc);const u=tr.domElement.toDataURL();ts.remove(f.g);return PC[key]=u}
window.UIportrait=portrait;
// a big, sharp full-body picture of a fighter for the lobby (transparent background, no weapon, turned a little toward the camera); cached per fighter + skin + size
const BIGC={};let bigR=null,bigS=null,bigC=null;
window.UIbig=function(id,k,w,h,gun,fx){k=k|0;w=w||1050;h=h||1040;if(!LOOK[id])return'';gun=gun&&window.WP&&WP[gun]?gun:'';fx=fx&&window.SHINE&&SHINE.valid(fx)?fx:'';const key=id+'#'+k+'@'+w+'x'+h+(gun?'+'+gun:'')+(fx?'~'+fx:'');if(BIGC[key])return BIGC[key];
 try{if(!bigR){bigR=rig(w,h);bigS=stage();const rim=new THREE.DirectionalLight(0x9fd0ff,.55);rim.position.set(-4,3,-3);bigS.add(rim);bigC=new THREE.PerspectiveCamera(22,w/h,.1,60)}
  bigR.setSize(w,h);bigC.aspect=w/h;
  const f=window.SKN?SKN.with(k,()=>mini(LOOK[id])):mini(LOOK[id]);f.ham.visible=false;try{f.ham.parent&&f.ham.parent.remove(f.ham)}catch(e){}
  f.g.rotation.y=Math.PI-(gun?(window.HOLDROT||.5):.38); // the same turn and held-out pose as the picture on the weapons page
  bigS.add(f.g);
  const body=new THREE.Box3().setFromObject(f.g); // the body alone sets the size on screen (fighters are always drawn the same height); the gun and the effect only have to fit in the picture
  if(gun&&window.attachGun){try{f.ads=window.HOLDOUT||.9;attachGun(f,gun)}catch(e){console.warn('lobby gun',e)}}
  if(fx){try{SHINE.deco(f,fx);SHINE.tick(f,1.3)}catch(e){console.warn('lobby effect',e)}}
  f.g.updateMatrixWorld(true);
  const sz=body.getSize(new THREE.Vector3()),ct=body.getCenter(new THREE.Vector3()),th=2*Math.tan(11*Math.PI/180),d=Math.max(sz.y*1.03/th,2),V=d*th*(h/960); // V = the picture's height in world units at the fighter; the extra height over the old 960 picture is headroom for the effect's halo
  bigC.fov=2*Math.atan(Math.tan(11*Math.PI/180)*h/960)*180/Math.PI;bigC.updateProjectionMatrix();
  const yc=body.min.y-sz.y*.015+V/2; // the feet stay a hair above the bottom edge
  bigC.position.set(0,yc,ct.z+d);bigC.lookAt(0,yc,ct.z);bigR.render(bigS,bigC);const u=bigR.domElement.toDataURL();bigS.remove(f.g);return BIGC[key]=u}catch(e){return''}};
const GC={};function gunPic(id){if(GC[id])return GC[id];const g=buildGun(id,true);gs.add(g);const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3());
 const d=Math.max(sz.z*1.1/1.0,sz.y*1.35/.5); // camera distance so the gun fills ~90% of the card width (or height for tall guns)
 gc.position.set(d,ct.y+.02,ct.z);gc.lookAt(0,ct.y,ct.z);gr.render(gs,gc);const u=gr.domElement.toDataURL();gs.remove(g);return GC[id]=u}
// melee card pictures: the real 3D model, turned to face the camera and tilted diagonally with the head up-right (falls back to the flat icon if the picture could not be drawn)
const MPC={};function meleePic(id){if(MPC[id])return MPC[id];try{
 const m=MW.build(id),face=new THREE.Group(),tilt=new THREE.Group();face.add(m);face.rotation.y=Math.PI/2;tilt.add(face);tilt.rotation.x=2.2;gs.add(tilt);
 const bb=new THREE.Box3().setFromObject(tilt),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),d=Math.max(sz.z*1.1,sz.y*2.7);
 gc.position.set(d,ct.y+.02,ct.z);gc.lookAt(0,ct.y,ct.z);gr.render(gs,gc);const u=gr.domElement.toDataURL();gs.remove(tilt);
 return MPC[id]=u.length>400?u:MW.pic(id)}catch(e){return MW.pic(id)}}
window.meleePic=meleePic;
const bar=(l,v,m,t)=>'<div class="st"><span>'+l+'</span><div><i style="width:'+Math.min(100,v/m*100)+'%"></i></div><em>'+t+'</em></div>';

// ---- what the player has picked this time round. Everything starts unpicked and is cleared again after every finished match.
// (window.__NOPICK = test/automation mode: everything counts as picked and nothing resets)
const NOP=!!window.__NOPICK,PK=window.PICK={on:!NOP,f:NOP,w:NOP,s:NOP,m:NOP,a:NOP,noSec:false,
 missing(){const m=[];if(!PK.f)m.push('f');if(!PK.w)m.push('w');if(!PK.s)m.push('s');if(!PK.m)m.push('m');if(!PK.a&&!window.WZNOMAP)m.push('a');return m}};
const PKN={f:'a fighter',w:'a primary weapon',s:'a secondary weapon (Pistol, SMG or Auto Pistol)',m:'a melee weapon',a:'a map'},PKL={f:'Fighter',w:'Primary weapon',s:'Secondary weapon',m:'Melee',a:'Map'},PKP={f:'f',w:'w',s:'w',m:'m',a:'a'};
function brickTitle(){return'<img id="btl" class="btitle" src="'+window.LOGO+'" alt="Brick Royale: Memewars">'}
const menu=$('menu'),go=$('go'),pv=rig(300,380);pv.domElement.id='pv';
menu.innerHTML='<div class="shell"><div class="side"><div id="pvh"></div><h2 id="pn"></h2><p id="pp"></p><div id="pst"></div></div>'+
 '<div class="main"><div class="mtop" id="mtop">'+brickTitle()+'</div><div class="brot" id="brot"></div><div class="pgtabs" id="pgtabs"><button data-p="f" class="on"><i>1</i>Choose your fighter</button><button data-p="w"><i>2</i>Choose your weapon</button><button data-p="m"><i>3</i>Choose your melee</button><button data-p="a"><i>4</i>Choose your map</button></div>'+
 '<section class="mpg on" id="pgf"><div class="cg" id="cg"></div></section><section class="mpg" id="pgw"><div id="wsig"></div><div class="wg" id="wg"></div><div id="lo"></div></section><section class="mpg" id="pgm"><div id="mg"></div><div id="mlo"></div></section><section class="mpg" id="pgb"><div id="bwg"></div><div id="blo"></div></section><section class="mpg" id="pga"></section><section class="mpg" id="pgt"></section><div id="gh"></div>'+
 '<p class="help">WASD move &middot; Space jump &middot; Mouse aim &middot; Click shoot &middot; Hold right click aim / scope &middot; V first / third person &middot; F melee &middot; Q ability &middot; 1 gun (press again to swap to your secondary) &middot; 2 melee weapon &middot; 3 4 5 use items &middot; T sprint &middot; Shift crouch &middot; R reload &middot; M mute<br>Grab loot bags for grenades, healing, shields and traps. Walk over a green plus for health or a blue shield for armor (only when you need it).</p></div></div>';
$('pvh').replaceWith(pv.domElement);$('gh').replaceWith(go);go.textContent='Fight';const gnext=document.createElement('button');gnext.id='gnext';gnext.type='button';gnext.textContent='Continue: Choose Your Weapon';go.before(gnext);
const ps=stage(),pc=new THREE.PerspectiveCamera(30,300/380,.1,50);pc.position.set(0,1.5,5.8);pc.lookAt(0,1.15,0);
let pf=null;
const PDESC={pepe:'Every hit is boosted by 20% (bullets, rockets and melee) on top of his level scaling, so Pepe wins damage races. Average health and speed. Frog Hop leaps him sideways out of trouble and leaves a slowing slime puddle.',
 wojak:'Slowly regenerates 2 health every second while a round is live and has 110 max health at full level, but hits about 10% softer. Stay alive, duck out of fights and heal. Doom Spiral blurs the enemy and weakens their hits.',
 foreman:'A tough, slow builder: 120 max health at full level, a little slower than most and hits about 10% softer. Great at taking hits while you wear the enemy down. Quick Build drops a brick wall to hide behind.',
 jester:'Chaos in every shot: 20% of your hits deal double damage, so damage is spiky and unpredictable. Average health and speed. Jackpot Juke throws a decoy that bursts into stunning confetti.',
 general:'A balanced commander with average health, speed and damage, built around calling in his Airstrike at the right moment.',
 nyan:'<span class="rbt">Leaves a cool RAINBOW TRAIL everywhere it runs!</span> The fastest fighter in the game, but only 90 health and hits about 15% softer. Hit and run: Rainbow Rush dashes forward and the rainbow trail speeds her up.',
 podcast:'Sees what others cannot: his Mic Check pulse marks the enemy through walls. Average health and speed but hits about 10% softer.',
 trader:'Comes into every round with 40 armor at full level, but hits about 15% softer. The armor soaks up the first burst of damage. Overclock tightens the spread, softens recoil and speeds up reloads.',
 giga:'130 max health and a much harder melee swing (50% more damage with any melee weapon), but slower on his feet. Close the gap and smash: Alpha Rush charges in, shrugging off damage, and throws the first enemy back.',
 doge:'Lucky: loot bags give rarer items, health and shield pickups restore both health and armor, and he moves a little faster, but hits about 10% softer. Such Wow gives speed, fast reloads and a small shield.',
 troll:'Fast and slippery with 95 health. His Troll Prank leaves a fake chest; whoever opens it gets a silly surprise: an explosion, a launch, a slip or a stun.',
 stonks:'Starts every round with armor (15 at full level). His Stonks Boost zone makes him faster and harder hitting while he stands in it, so fight inside the green.',
 sahur:'A wooden bruiser: 125 health and hits 10% harder, but a bit slower. Sahur Slam is a huge club swing that knocks back and stuns anyone close.',
 pork:'Quick on his trotters but hits about 5% softer. Pork Portal blinks him a short distance through a swirling portal to escape a fight or close the gap.'},
 ADESC={dash:'A quick burst of speed (about five metres) in the direction you are moving. 5 second cooldown. Dodge shots, jump out of an explosion or close the gap.',
 shield:'Throws up a bubble that blocks all damage for 3 seconds. 10 second cooldown. Use it to survive a burst, or to push forward while reloading.',
 air:'Marks a small area on the enemy and calls down five delayed explosive shells: one lands right on the mark and the rest scatter close around it over about two seconds. Red rings show where each shell will land. 24 second cooldown. Shells deal heavy splash damage, so keep moving.',
 reveal:'Marks the enemy through walls and cover for 4 seconds. 10 second cooldown. Lets you pre-aim around corners and avoid ambushes.',
 troll:'Drops a fake chest in front of you that looks like a loot bag and lasts 20 seconds. When the enemy opens it a random prank hits them: an explosion, a launch into the air, a slip or a short stun. 21 second cooldown.',
 stonks:'Places a green stonks zone for 8 seconds. While you stand in it you move 35% faster and deal 30% more damage. 22 second cooldown.',
 slam:'Swings a giant wooden club in a wide area around you: an enemy close by takes damage, is knocked back and stunned for 1.6 seconds. 20 second cooldown.',
 portal:'Opens a portal and blinks you about nine metres in the direction you are aiming. 20 second cooldown. Escape a fight or close the gap.',
 frog:'A quick leap to the side (the way you are pressing, or a random side) that leaves a slime puddle behind. Enemies who touch the puddle are slowed by 45% and stay slowed for 2.5 seconds after leaving it. The puddle lasts 5 seconds. 16 second cooldown.',
 doom:'Sends out a grey pulse. If it reaches the enemy their screen is blurred and they deal 25% less damage for 3 seconds. 18 second cooldown. A shield bubble stops it.',
 build:'Instantly raises a short brick wall about three metres in front of you, side-on to where you face. Bullets and fighters cannot pass through it and it lasts 14 seconds. 20 second cooldown. You can have two walls at once.',
 juke:'Throws a prank decoy that lands up to nine metres away, wobbles for a moment and then bursts into confetti. Anyone close to it when it pops is stunned for 1.3 seconds, so keep your distance. 19 second cooldown.',
 mic:'Sends out a sonar pulse that marks the enemy through walls and cover for 4 seconds. 17 second cooldown. Lets you pre-aim around corners and avoid ambushes.',
 rush:'A dash forward that leaves a rainbow trail for 5 seconds. Running over your own trail gives you a speed boost (40%). 16 second cooldown. Dodge shots or close the gap, then run the trail.',
 clock:'For 6 seconds your gun scatters much less (bloom and spread cut by more than half), kicks softer and reloads about 70% faster. 18 second cooldown.',
 alpha:'A short forward charge that cuts damage you take by half for almost two seconds. The first enemy it reaches takes damage, is stunned for a moment and is thrown back hard. 18 second cooldown.',
 wow:'For 5 seconds you move 30% faster, reload 60% faster and get a small golden shield that absorbs 25 damage. 18 second cooldown.'},
 GDESC={rifle:'The dependable all-rounder: fully automatic with steady accuracy and a big magazine. Good at any range up to mid distance, with no real weakness.',
 burst:'Fires tight three-round bursts with pinpoint accuracy and long range. Each trigger pull lands three bullets, so staying on target matters more than speed.',
 smg:'The highest fire rate of any gun with a huge 35-round magazine and quick reload. Bullets are small and scatter at range, so get in close.',
 pistol:'Accurate, light and quick to reload. Modest damage per shot, but almost every bullet lands, which makes it reliable at any distance.',
 shotgun:'Seven pellets per blast for massive close-range damage that fades quickly with distance. Pump action means slow follow-up shots and a long reload.',
 tac:'A fully automatic six-pellet shotgun. Constant close-quarters pressure, but the pellets scatter widely and the range is very short.',
 sniper:'One bullet per magazine: a slow, heavy single shot with very fast bullets and the longest range. A couple of hits take down most fighters, and a long reload after every shot, so a miss leaves you waiting.',
 rpg:'Fires a slow rocket that explodes on impact, damaging everything within five metres, strongest at the centre. One shot per reload, and your own blast hurts you for half damage.'},
 SKR=['common','rare','epic','legend','legend'];
const xpBar=(l,i)=>'<div class="st xp"><span>'+l+' '+i.L+'</span><div><i style="width:'+(i.max?100:Math.min(100,i.x/i.need*100))+'%"></i></div><em>'+(i.max?'MAX':i.x+'/'+i.need)+'</em></div>';
let tab='abil',gv=null,bro=null;const PW=id=>LO.isSec(id)?'rifle':id;wsel=PW(wsel);
// Until the player picks a gun in the weapon tab, every fighter holds out their own signature gun (even a locked one); after that they all show the chosen weapon.
let gunPicked=false;const sigGun=id=>(window.SIG&&SIG.of(id))||LOOK[id].sw||'rifle',shownGun=id=>gunPicked?(gv&&LO.isSec(gv)?gv:wsel):sigGun(id);
window.UIgunPicked=()=>gunPicked;
function refreshPortraits(){[...document.querySelectorAll('#cg .cc')].forEach(b=>{const im=b.querySelector('img');if(im)im.src=portrait(b.dataset.id,0,sigGun(b.dataset.id),true)})}
const nextTxt=(i,card)=>{if(i.max)return'<b>MAX LEVEL</b>'+(card?'':' &middot; full power unlocked');const nt=LV.tier(i.L+1);return'<b>'+(i.need-i.x)+(card?' dmg</b> to LV ':' more damage</b> to reach LV ')+(i.L+1)+(nt!==i.tier?' <span class="up r-'+nt+'">'+RN[nt]+'</span>':'')};
const gdesc=id=>GDESC[id]||(window.XW&&XW[id]?XW[id].tag+' '+XW[id].fx:'')||(window.SIGDEF&&SIGDEF[id]?SIGDEF[id].tag+' '+SIGDEF[id].fx+' It is '+LOOK[SIGDEF[id].owner].nm+"'s signature gun, a side-grade of the "+LV.BASE[SIGDEF[id].cls].n+' (about the same damage per second), unlocked at fighter LV '+SIGDEF[id].unlock+'.':'');
// the fighter's signature gear, with what is locked and when it opens
const sigBlock=()=>{const f=csel,L=LV.lvl('c',f),nm=LOOK[f].nm,gid=SIG.of(f),gd=SIGDEF[gid],mw=MW.sigOf(f),gk=L>=gd.unlock,mk=!!mw&&L>=LV.MAXL,tg=(ok,t)=>'<span class="sgt '+(ok?'ok':'no')+'">'+t+'</span> ';
 return'<div class="ab sgear"><b>Signature gear</b><br>'+tg(gk,gk?'UNLOCKED':'LOCKED')+'<b>Gun: '+gd.n+'</b> ('+LV.BASE[gd.cls].n+' side-grade). '+gd.tag+' '+gd.fx+' Unlocks when '+nm+' reaches LV '+gd.unlock+(gk?'.':' (now LV '+L+').')+'<br>'+
  (mw?tg(mk,mk?'UNLOCKED':'LOCKED')+'<b>Melee: '+mw.name+'.</b> '+mw.fx+' Unlocks when '+nm+' reaches max level, LV '+LV.MAXL+(mk?'.':' (now LV '+L+').'):tg(false,'NO MELEE')+nm+' has no signature melee: only some fighters get one.')+'</div>'};
const dmgTxt=w=>w.rocket?Math.round(w.sdm)+' splash':w.pel>1?w.dmg.toFixed(1)+' x '+w.pel:w.dmg.toFixed(1);
function tabHTML(){const L=LOOK[csel],ci=LV.cinfo(csel),gid=gv||wsel,gi=LV.info('g',gid),w=LV.weapon(gid,gi.L);
 if(tab==='skin'){const cur=window.SKN?SKN.get(csel):0,nm=L.nm,fx=window.SHINE?SHINE.sel(csel):'',r=window.SHINE?SHINE.rar(csel):'common',RLn=RN[r]||r;
  const eff=(kind,label,ic)=>{const own=SHINE.own(csel,kind),on=fx===kind;let cost,can;
   if(kind==='shiny'){const c=SHINE.tokCost(csel),have=PR.tokens()[r];can=have>=c;cost=c+' '+RLn+' Tokens (you have '+have+')'}
   else{const c=SHINE.scrCost(csel),have=PR.scrolls()[csel]||0;can=have>=c;cost=c+' '+nm+' Scrolls (you have '+have+')'}
   return'<button type="button" class="fxb '+kind+(on?' on':'')+(own?'':' lock')+(!own&&can?' can':'')+'" data-fx="'+kind+'"><i>'+ic+'</i><span><b>'+label+'</b><small>'+SHINE.BOOST[kind].t+(own?'':' &middot; costs '+cost)+'</small></span><em>'+(on?'EQUIPPED':own?'EQUIP':can?'UNLOCK':'LOCKED')+'</em></button>'};
  const fxh=window.SHINE?'<div class="fxh"><b>EFFECTS</b> <small>stronger fighter, works on any skin, one at a time</small></div><div class="fxl"><button type="button" class="fxb none'+(fx?'':' on')+'" data-fx=""><i>&#8856;</i><span><b>No effect</b><small>Normal stats</small></span><em>'+(fx?'EQUIP':'EQUIPPED')+'</em></button>'+eff('shiny','Shiny '+nm,'&#10022;')+eff('gold','Golden '+nm,'&#9733;')+'</div>':'';
  const lab=(k,i)=>k.lock?'LOCKED':i>=3?(k.fx==='gold'?'GOLDEN':'SHINY')+(i===cur?' &middot; EQUIPPED':''):i===cur?'EQUIPPED':RN[SKR[i]];
  return'<div class="ab"><b>'+L.nm+' skins</b><br>Skins change how '+L.nm+' looks in a match. Tap one to equip it; your opponent sees it online too.</div>'+fxh+'<div class="skg">'+
  SKN.list(csel).map((k,i)=>{const nb=i>0&&i<3&&!k.lock&&!SKN.owned(csel,i);return'<button class="sk r-'+SKR[i]+(i>=3?' fxs-'+k.fx:'')+(i===cur?' on':'')+(k.lock?' lock':'')+(nb?' buyable':'')+'" data-i="'+i+'"><span class="sw"><img src="'+portrait(csel,k.lock&&i<3?0:i)+'" alt=""></span>'+(k.lock||nb?'<span class="lk"></span>':'')+'<b>'+k.name+'</b><i class="rb r-'+SKR[i]+'">'+(nb?'':lab(k,i))+(nb?(SKN.inShop(csel,i)?'<img class="buxcoin" alt="" src="'+BUX.coin+'"> '+BUX.fmt(SKN.price(csel,i)):'NOT IN SHOP'):'')+'</i></button>'}).join('')+'</div>'+
  '<div class="ab lvn">Special skins are bought with Brick Bucks in the <b>Item Shop</b>, which only stocks 5 skins at a time and changes every hour. Unlocking <b>Shiny</b> (rarity tokens) or <b>Golden</b> (fighter Scrolls) also gives you the matching skin.</div>'}
 if(tab==='gun'){const dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);
  return'<div class="ab"><b>'+w.base+'</b> <i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i><br>'+gdesc(gid)+'</div><div class="gst">'+
   bar('Damage',dm,90,dmgTxt(w))+bar('Fire rate',1/w.rate,14,(1/w.rate).toFixed(1)+'/s')+bar('Magazine',w.mag*(w.seq?w.pel:1),36,w.mag*(w.seq?w.pel:1)+' rounds')+bar('Reload',Math.max(.05,Math.min(1,(2.7-w.rl)/1.9)),1,w.rl+'s')+bar('Range',w.br,24,w.br)+bar('DPS',dps,90,Math.round(dps))+'</div>'+
   '<div class="gxp">'+xpBar('Level',gi)+'<div class="nx">'+nextTxt(gi)+'</div></div>'+
   '<div class="ab lvn">Guns start Common at Lv 1 and gain a rarity every 5 levels (Uncommon 6, Rare 11, Epic 16, Legendary 21, max Lv 30). Damage you deal earns gun XP, plus 50 for each round you win.</div>'}
 return'<div class="ab"><b>'+L.an+'</b> <small>(passive)</small><br>'+(PDESC[csel]||L.ad)+'</div>'+
  '<div class="ab"><b>Q ability: '+ABN[L.ab].split(',')[0]+'</b><br>'+ADESC[L.ab]+'</div>'+sigBlock()+
  '<div class="ab lvn">Rarity: '+RN[ci.base]+' (fixed). Fighters level up to 30 by earning XP from damage and wins; levels raise health, speed and damage, never rarity.</div>'}
function drawTab(){const t=$('tabc');if(!t)return;t.innerHTML=tabHTML();[...document.querySelectorAll('.tabs button')].forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 [...t.querySelectorAll('.sk')].forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(window.SKN){const k=SKN.list(csel)[i];if(!k||k.lock){PR.toast(k&&k.fx?'Locked: unlock '+(k.fx==='gold'?'Golden':'Shiny')+' '+LOOK[csel].nm+' with the '+(k.fx==='gold'?'Scrolls ('+SHINE.scrCost(csel)+' needed)':'Skin Tokens ('+SHINE.tokCost(csel)+' needed)')+' first.':'Locked.');return}if(!SKN.owned(csel,i)){if(SKN.inShop(csel,i)&&window.STORE)STORE.open(csel);else PR.toast('Not in the Item Shop right now. The shop changes every hour.');return}SKN.set(csel,i);PR.toast(i?k.name+' equipped.':'Default skin equipped.');drawTab();showFighter()}});[...t.querySelectorAll('.fxb')].forEach(b=>b.onclick=()=>{const kind=b.dataset.fx,fx=SHINE.sel(csel);
  if(!kind){SHINE.equip(csel,'');PR.toast('No effect equipped.')}
  else if(SHINE.own(csel,kind)){const off=fx===kind;SHINE.equip(csel,off?'':kind);PR.toast(off?'Effect removed.':(kind==='gold'?'Golden ':'Shiny ')+LOOK[csel].nm+' equipped: '+SHINE.BOOST[kind].t+'.')}
  else{askFx(kind);return}
  drawTab();showFighter();buildCards();window.UIpick&&UIpick()});window.UIfit&&UIfit()}
// ---- confirm before spending tokens / scrolls on Shiny or Golden
const ccon=document.createElement('div');ccon.id='ccon';ccon.innerHTML='<div class="wbox"><h2 id="cconh"></h2><div id="cconp"></div><p id="cconm"></p><div class="wbtn"><button id="cconno" type="button">Not now</button><button id="cconyes" type="button">Unlock</button></div></div>';document.body.appendChild(ccon);let cfx=null;
function askFx(kind){const id=csel,nm=LOOK[id].nm,gold=kind==='gold',r=SHINE.rar(id),c=gold?SHINE.scrCost(id):SHINE.tokCost(id),have=gold?(PR.scrolls()[id]||0):PR.tokens()[r],what=gold?nm+' Scrolls':(RN[r]||r)+' Skin Tokens';
 if(have<c){PR.toast('You need '+(c-have)+' more '+what+' ('+have+' / '+c+').'+(gold?' Trade a duplicate '+nm+' on the wheel for a Scroll.':' Duplicate wheel prizes can become Skin Tokens.'));return}
 cfx=kind;$('cconh').textContent='UNLOCK '+(gold?'GOLDEN':'SHINY')+' '+nm.toUpperCase()+'?';let pic='';try{pic='<img src="'+portrait(id,gold?3:4)+'" alt="">'}catch(e){}$('cconp').innerHTML=pic;
 $('cconm').innerHTML='Costs <b>'+c+' '+what+'</b> (you have '+have+'). You get <b>'+SHINE.BOOST[kind].t+'</b>, the effect on any skin, and the '+(gold?'Golden ':'Shiny ')+nm+' skin.';ccon.style.display='flex'}
const noFx=()=>{cfx=null;ccon.style.display='none'};$('cconno').onclick=noFx;ccon.addEventListener('click',e=>{if(e.target===ccon)noFx()});
$('cconyes').onclick=()=>{const k=cfx;noFx();if(!k)return;const r=SHINE.unlock(csel,k);
 if(r.ok){SHINE.equip(csel,k);PR.toast((k==='gold'?'Golden ':'Shiny ')+LOOK[csel].nm+' unlocked and equipped! Its skin is in the skin list.');drawTab();showFighter();buildCards()}else PR.toast(r.why==='poor'?'Not enough '+(k==='gold'?'Scrolls':'Skin Tokens')+'.':r.why==='locked'?'Unlock the fighter first.':'Already unlocked.')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ccon.style.display==='flex')noFx()});
function showFighter(){if(pf)ps.remove(pf.g);pf=fig(csel,(bro?UIequip():curPg==='w'?shownGun(csel):sigGun(csel)),1,window.SKN?SKN.get(csel):0,true);ps.add(pf.g);if(window.SHINE&&SHINE.sel(csel))SHINE.deco(pf,SHINE.sel(csel));pv.domElement.classList.toggle('nopick',!(PK.f||bro));
 if(bro==='w'){const gid=UIequip(),gi=LV.info('g',gid),w=LV.weapon(gid,gi.L),dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);
  $('pn').innerHTML=w.base+' <i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i>';$('pn').className='r-'+gi.tier;pv.domElement.dataset.r=gi.tier;$('pp').textContent=gdesc(gid);
  $('pst').innerHTML='<div class="gst">'+bar('Damage',dm,90,dmgTxt(w))+bar('Fire rate',1/w.rate,14,(1/w.rate).toFixed(1)+'/s')+bar('Magazine',w.mag*(w.seq?w.pel:1),36,w.mag*(w.seq?w.pel:1)+' rounds')+bar('Reload',Math.max(.05,Math.min(1,(2.7-w.rl)/1.9)),1,w.rl+'s')+bar('Range',w.br,24,w.br)+bar('DPS',dps,90,Math.round(dps))+'</div><div class="gxp">'+xpBar('Level',gi)+'<div class="nx">'+nextTxt(gi)+'</div></div>';return}
 if(!(PK.f||bro)){$('pn').innerHTML='Pick a fighter';$('pn').className='';pv.domElement.dataset.r='';$('pp').textContent='Choose one from the roster on the Fighter page to see their stats, abilities and skins.';$('pst').innerHTML='';return}
 const L=LOOK[csel],ci=LV.cinfo(csel),c0=(window.SHINE?SHINE.stats:LV.cstats)(csel,ci.L),s=[c0[0],c0[1],Math.round(c0[2]*100),c0[3]],fxk=window.SHINE?SHINE.sel(csel):'';
 $('pn').innerHTML=(fxk?'<span class="fxn '+fxk+'">'+(fxk==='gold'?'Golden':'Shiny')+'</span> ':'')+L.nm+' <i class="rb r-'+ci.rar+'">LV '+ci.L+' '+RN[ci.rar]+'</i>';$('pn').className='r-'+ci.rar;pv.domElement.dataset.r=ci.rar;$('pp').textContent=L.pk;
 $('pst').innerHTML=xpBar('Level',ci)+bar('Health',s[0],130,s[0])+bar('Speed',s[1],11.5,s[1])+bar('Damage',Math.min(100,s[2]),100,s[2]>100?'100% (+'+(s[2]-100)+'%)':s[2]+'%')+bar('Start armor',s[3],50,s[3])+
  '<div class="tabs"><button data-t="abil">Abilities</button><button data-t="gun">Gun</button><button data-t="skin">Skins</button></div><div id="tabc"></div>';
 [...document.querySelectorAll('.tabs button:not(.locked)')].forEach(b=>b.onclick=()=>{tab=b.dataset.t;drawTab()});drawTab()}
const cg=$('cg'),wg=$('wg');
const ORD=LV.RANK;
const wcard={};
function markSel(){const sc=LO.sec;
 Object.keys(wcard).forEach(id=>{const b=wcard[id],on=!!PK.w&&id===wsel,sn=!!PK.s&&id===sc;b.classList.toggle('sel',on);b.classList.toggle('sec',sn);const t=b.querySelector('.tg');t.textContent=on?'PRIMARY':sn?'SECONDARY':'';t.className='tg'+(on?' p':sn?' s':'')});
 const gp=LV.info('g',wsel),gs=LV.info('g',sc),pw=LV.weapon(wsel,gp.L),sw=LV.weapon(sc,gs.L);
 const lp=(h,ok,t,i)=>'<div class="lop'+(ok?'':' none'+(h==='SECONDARY'?' req':''))+'"><small>'+h+'</small><b>'+(ok?t:h==='SECONDARY'?'REQUIRED: not picked':'Not picked')+'</b>'+(ok?i:'')+'</div>';
 $('lo').innerHTML=lp('PRIMARY',PK.w,pw.base,'<i class="rb r-'+gp.tier+'">LV '+gp.L+'</i>')+lp('SECONDARY',PK.s,sw.base,'<i class="rb r-'+gs.tier+'">LV '+gs.L+'</i>')+
  '<p>'+(PK.w?'':'<b class="lowarn">Pick a primary gun.</b> ')+(PK.s?'':'<b class="lowarn">You MUST pick a secondary weapon before you can fight.</b> ')+'Pick one gun from Short, Mid or Long range as your <b>primary</b> and a <b>Pistol, SMG or Auto Pistol</b> as your <b>secondary</b>. Swap in a match with <b>X</b> or the mouse wheel.</p>'}
function buildSig(){const host=$('wsig');if(!host||!window.SIG)return;host.innerHTML='';Object.keys(wcard).forEach(k=>{if(window.SIGDEF&&SIGDEF[k])delete wcard[k]});
 const id=SIG.of(csel);if(!id)return;const d=SIGDEF[id],ok=SIG.ok(id),L=LV.lvl('c',csel),gi=LV.info('g',id),w=LV.weapon(id,gi.L),nm=LOOK[csel].nm;
 const g=document.createElement('div');g.className='wgrp g-sig';g.innerHTML='<div class="wgh">Signature gun <small>'+nm+(ok?'':' &middot; locked')+'</small></div><div class="wgc"></div>';
 const b=document.createElement('button');b.className='wc sgc r-'+gi.tier+(ok?'':' lock');b.dataset.w=id;wcard[id]=b;
 const dm=w.rocket?w.sdm+10:w.dmg*w.pel;
 b.innerHTML='<u class="tg"></u><div class="gimg"><img src="'+gunPic(id)+'" alt="'+w.base+'"></div><i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i><b>'+w.base+'</b>'+bar('Dmg',dm,70,Math.round(dm))+bar('Rate',1/w.rate,14,(1/w.rate).toFixed(1))+bar('Mag',w.mag*(w.seq?w.pel:1),36,w.mag*(w.seq?w.pel:1))+bar('Range',w.br,24,w.br)+'<small class="mfx">'+d.fx+'</small>'+
  (ok?'':'<div class="lockov"><span>LOCKED</span>Reach LV '+d.unlock+' with '+nm+'<br>(now LV '+L+')</div>');
 b.onclick=()=>{if(!ok){PR.toast('Locked! '+nm+' unlocks the '+w.base+' at LV '+d.unlock+' (now LV '+L+').');return}
  if(LO.isSec(id)){LO.set(id);gv=id;PK.s=1;PK.noSec=false}else{wsel=id;gv=null;PK.w=1}gunPicked=true;tab='gun';markSel();showFighter();refreshPortraits();pkSync()};
 g.querySelector('.wgc').appendChild(b);host.appendChild(g)}
function buildCards(){cg.innerHTML='';wg.innerHTML='';
 Object.keys(LOOK).sort((a,b)=>ORD[LOOK[a].r]-ORD[LOOK[b].r]).forEach(id=>{const ci=LV.cinfo(id),b=document.createElement('button');b.dataset.id=id;const fxs=window.SHINE?SHINE.sel(id):'';b.className='cc r-'+ci.rar+(PK.f&&id===csel?' sel':'')+(PR.isOpen(id)?'':' lock')+(fxs?' fx-'+fxs:'');
  b.innerHTML='<img src="'+portrait(id,0,sigGun(id),true)+'" alt=""><div class="crow"><div class="lvb"><small>LEVEL</small><strong>'+ci.L+'</strong></div><div class="cnm'+(LOOK[id].nm.length>14?' ln':'')+'"><b>'+LOOK[id].nm+'</b></div></div><i class="rb r-'+ci.rar+'">'+RN[ci.rar]+'</i><div class="cxp"><i style="width:'+(ci.max?100:Math.min(100,ci.x/ci.need*100))+'%"></i></div><em class="cxt">'+(ci.max?'MAX LEVEL':ci.x+' / '+ci.need+' XP')+'</em><s class="lk"></s>'+(fxs?'<u class="fxs">'+(fxs==='gold'?'&#9733;':'&#10022;')+'</u>':'');
  b.onclick=()=>{if(!PR.isOpen(id)){PR.toast('Locked! Win '+LOOK[id].nm+' on the wheel.');return}csel=id;PK.f=1;if(!(PK.on&&PK.w&&WP[wsel]&&(!window.SIGDEF||!SIGDEF[wsel]||SIG.ok(wsel)))){wsel=PW(LOOK[id].sw);gv=null;gunPicked=false}buildSig();buildMelee();markSel();[...cg.children].forEach(c=>c.classList.remove('sel'));b.classList.add('sel');showFighter();pkSync()};cg.appendChild(b)});

 LO.GROUPS.forEach(([nm,ids])=>{const g=document.createElement('div');g.className='wgrp g-'+ids[0];g.innerHTML='<div class="wgh">'+nm+'</div><div class="wgc"></div>';const gc2=g.querySelector('.wgc');
  ids.forEach(id=>{const w0=WP[id],gi=LV.info('g',id),w=LV.weapon(id,gi.L),b=document.createElement('button');b.className='wc r-'+gi.tier;b.dataset.w=id;wcard[id]=b;
   const dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);b.innerHTML='<u class="tg"></u><img src="'+gunPic(id)+'" alt=""><i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i><b>'+w.base+'</b>'+bar('Dmg',dm,70,Math.round(dm))+bar('Rate',1/w.rate,14,(1/w.rate).toFixed(1))+bar('Range',w.br,24,w.br)+bar('DPS',dps,90,Math.round(dps))+'<div class="st xp"><span>XP</span><div><i style="width:'+(gi.max?100:Math.min(100,gi.x/gi.need*100))+'%"></i></div><em>'+(gi.max?'MAX':gi.x+'/'+gi.need)+'</em></div><div class="nx">'+nextTxt(gi,1)+'</div>';
   b.querySelector('img').outerHTML='<div class="gimg"><img src="'+gunPic(id)+'" alt="'+w.base+'"></div>';
   b.onclick=()=>{if(LO.isSec(id)){LO.set(id);gv=id;PK.s=1;PK.noSec=false}else{wsel=id;gv=null;PK.w=1}gunPicked=true;tab='gun';markSel();showFighter();refreshPortraits();pkSync()};
   gc2.appendChild(b)});wg.appendChild(g)});

 buildSig();markSel()}
function buildMelee(){const mg=$('mg');if(!mg||!window.MW)return;mg.innerHTML='';const cards={};
 // the melee page is built exactly like the weapon page (loadout strip, signature box, one labelled row per group), with melee weapons in place of guns
 const dps=w=>w.dmg/w.cd,MS=window.MW.list.filter(w=>!w.sig),CR=MW.crates;
 function stats(w,m){return bar('Dmg',w.dmg,m||45,w.dmg)+bar('Speed',1/w.cd,2.6,(1/w.cd).toFixed(1))+bar('Reach',w.range,3.2,w.range.toFixed(1))+bar('DPS',dps(w),70,Math.round(dps(w)))}
 let desc=null;
 function strip(){const w=MW.by[desc||MW.sel]||MS[0],e=MW.by[MW.sel]||MS[0],own=MS.length-CR.left();
  $('mlo').innerHTML='<div class="lop'+(PK.m?'':' none')+'"><small>EQUIPPED</small><b>'+(PK.m?e.name:'Not picked')+'</b>'+(PK.m?'<i class="rb r-'+e.rar+'">'+(RN[e.rar]||e.rar)+'</i>':'')+'</div><div class="lop"><small>UNLOCKED</small><b>'+own+' / '+MS.length+'</b></div><button type="button" class="mcrb" id="mcrb">MELEE CRATES</button>'+
   '<p><b>'+w.name+'</b> ('+(RN[w.rar]||w.rar)+'): '+w.tag+' '+w.fx+'</p>';
  $('mcrb').onclick=()=>{if(window.STORE)STORE.open('crates')}}
 function card(w,sg){const ok=MW.avail(w.id),b=document.createElement('button');b.type='button';b.className='wc mc r-'+w.rar+(sg?' sgc':'')+(ok?'':' lock');b.dataset.m=w.id;cards[w.id]=b;
  b.innerHTML='<u class="tg"></u><div class="gimg"><img src="'+meleePic(w.id)+'" alt="'+w.name+'"></div><i class="rb r-'+w.rar+'">'+(RN[w.rar]||w.rar)+'</i><b>'+w.name+'</b>'+stats(w,sg?52:45)+(sg?'<small class="mfx">'+w.fx+'</small>':'<div class="mtg">'+w.tag+'</div>')+
   (ok?'':'<div class="lockov"><span>LOCKED</span>'+(w.sig?'Reach max level (LV '+LV.MAXL+')<br>with '+LOOK[w.sig].nm+' (now LV '+LV.lvl('c',w.sig)+')':'Win it in a Melee Crate')+'</div>');
  b.onmouseenter=b.onfocus=()=>{desc=w.id;strip()};b.onmouseleave=()=>{desc=null;strip()};
  b.onclick=()=>{if(!ok){PR.toast(w.sig?'Locked! '+LOOK[w.sig].nm+' unlocks the '+w.name+' at max level, LV '+LV.MAXL+' (now LV '+LV.lvl('c',w.sig)+').':'Locked! Win the '+w.name+' in a Melee Crate (Store).');return}MW.set(w.id);PK.m=1;mark();pkSync();if(window.hudUpdate)try{hudUpdate()}catch(e){}};return b}
 // this fighter's signature melee (only some fighters have one), locked until the fighter is at max level
 {const sw=MW.sigOf(csel),nm=LOOK[csel].nm,ok=!!sw&&MW.avail(sw.id),sg=document.createElement('div');sg.className='wgrp mtier msig g-sig';
  sg.innerHTML='<div class="wgh">Signature melee <small>'+nm+(sw&&!ok?' &middot; locked':'')+'</small></div><div class="wgc"></div>';const gc=sg.querySelector('.wgc');
  if(!sw)gc.innerHTML='<p class="mnone">'+nm+' has no signature melee. Only some fighters get one, and it unlocks at max level (LV '+LV.MAXL+').</p>';else gc.appendChild(card(sw,true));
  mg.appendChild(sg)}
 // one row per rarity, rarest last, strongest-looking last inside each (by damage per second)
 [...new Set(MS.map(w=>w.rar))].sort((a,b)=>LV.RANK[a]-LV.RANK[b]).forEach(r=>{const g=document.createElement('div');g.className='wgrp mtier r-'+r;
  g.innerHTML='<div class="wgh">'+(RN[r]||r)+'</div><div class="wgc"></div>';const gc=g.querySelector('.wgc');
  MS.filter(w=>w.rar===r).sort((a,b)=>dps(a)-dps(b)).forEach(w=>gc.appendChild(card(w)));mg.appendChild(g)});
 function mark(){Object.keys(cards).forEach(id=>{const on=!!PK.m&&id===MW.sel,b=cards[id];b.classList.toggle('sel',on);const t=b.querySelector('.tg');t.textContent=on?'EQUIPPED':'';t.className='tg'+(on?' p':'')});strip()}
 mark()}
buildMelee();
window.UIpick=()=>pkSync();buildCards();window.UIrefresh=()=>{buildCards();buildMelee();if(bro==='w')buildBW();showFighter()};
// ---- lobby pages: FIGHTERS and WEAPONS in the lobby's top bar only show the roster / only the guns (no steps, melee, map or Fight button)
window.UIsigGun=id=>{const g=window.SIG&&SIG.of(id);return(g&&WP[g])?g:PW(LOOK[id].sw)};
window.UIequip=()=>{if(gunPicked){const g=gv&&LO.isSec(gv)?gv:wsel;if(WP[g])return g}const g=window.SIG&&SIG.of(csel);return(g&&WP[g]&&SIG.ok(g))?g:PW(LOOK[csel].sw)}; // the gun your fighter holds in the lobby
const bwc={};let bdesc=null;
// the weapons page is built exactly like the melee page: a loadout strip, the fighter's signature gun in its own gold box on top, then one labelled row per range group
function bmark(){const held=UIequip(),sc=LO.sec;Object.keys(bwc).forEach(id=>{const b=bwc[id],on=id===held,p=!on&&!!PK.w&&id===wsel,sn=!on&&!p&&!!PK.s&&id===sc;b.classList.toggle('sel',on||p||sn);const t=b.querySelector('.tg');t.textContent=on?'EQUIPPED':p?'PRIMARY':sn?'SECONDARY':'';t.className='tg'+(on||p?' p':sn?' s':'')});bstrip()}
function bstrip(){const host=$('blo');if(!host)return;const held=UIequip(),sc=LO.sec,show=bdesc||held,w=LV.weapon(show,LV.info('g',show).L),e=LV.weapon(held,LV.info('g',held).L),s=LV.weapon(sc,LV.info('g',sc).L),ge=LV.info('g',held),gs=LV.info('g',sc),gw=LV.info('g',show);
 host.innerHTML='<div class="lop"><small>EQUIPPED</small><b>'+e.base+'</b><i class="rb r-'+ge.tier+'">LV '+ge.L+'</i></div><div class="lop"><small>SECONDARY</small><b>'+s.base+'</b><i class="rb r-'+gs.tier+'">LV '+gs.L+'</i></div>'+
  '<p><b>'+w.base+'</b> ('+(RN[gw.tier]||gw.tier)+'): '+gdesc(show)+'</p>'}
function buildBW(){const host=$('bwg');if(!host)return;host.innerHTML='';Object.keys(bwc).forEach(k=>delete bwc[k]);
 const stat=(w,id)=>{const dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);return bar('Dmg',dm,70,Math.round(dm))+bar('Rate',1/w.rate,14,(1/w.rate).toFixed(1))+bar('Range',w.br,24,w.br)+bar('DPS',dps,90,Math.round(dps))};
 function card(id,owner){const d=owner?SIGDEF[id]:null,ok=!owner||SIG.ok(id),gi=LV.info('g',id),w=LV.weapon(id,gi.L),nm=owner?LOOK[owner].nm:'',b=document.createElement('button');b.type='button';b.dataset.w=id;bwc[id]=b;
  b.className='wc mc r-'+gi.tier+(owner?' sgc':'')+(ok?'':' lock');
  const xp='<div class="st xp"><span>XP</span><div><i style="width:'+(gi.max?100:Math.min(100,gi.x/gi.need*100))+'%"></i></div><em>'+(gi.max?'MAX':gi.x+'/'+gi.need)+'</em></div>';
  b.innerHTML='<u class="tg"></u><div class="gimg"><img src="'+gunPic(id)+'" alt="'+w.base+'"></div><i class="rb r-'+gi.tier+'">LV '+gi.L+' '+(RN[gi.tier]||gi.tier)+'</i><b>'+w.base+'</b>'+stat(w,id)+xp+(owner?'<small class="mfx">'+d.fx+'</small>':'')+
   (ok?'':'<div class="lockov"><span>LOCKED</span>Reach LV '+d.unlock+' with '+nm+'<br>(now LV '+LV.lvl('c',owner)+')</div>');
  b.onmouseenter=b.onfocus=()=>{bdesc=id;bstrip()};b.onmouseleave=()=>{bdesc=null;bstrip()};
  b.onclick=()=>{if(!ok){PR.toast('Locked! '+nm+' unlocks the '+w.base+' at LV '+d.unlock+' (now LV '+LV.lvl('c',owner)+').');return}
   if(LO.isSec(id)){LO.set(id);gv=id;PK.s=1;PK.noSec=false}else{wsel=id;gv=null;PK.w=1}gunPicked=true;bmark();showFighter();refreshPortraits();pkSync()};
  return b}
 // this fighter's signature gun in its own gold box (locked until the fighter reaches the unlock level)
 {const g=window.SIG&&SIG.of(csel),nm=LOOK[csel].nm,ok=!!g&&SIGDEF[g]&&SIG.ok(g),sg=document.createElement('div');sg.className='wgrp mtier msig g-sig';
  sg.innerHTML='<div class="wgh">Signature gun <small>'+nm+(g&&!ok?' &middot; locked':'')+'</small></div><div class="wgc"></div>';const gc=sg.querySelector('.wgc');
  if(g&&SIGDEF[g]&&WP[g]){const c=card(g,csel);const sb=document.createElement('span');sb.className='sigbadge';sb.textContent='SIGNATURE';c.prepend(sb);gc.appendChild(c)}else gc.innerHTML='<p class="mnone">'+nm+' has no signature gun.</p>';
  host.appendChild(sg)}
 LO.GROUPS.forEach(([nm,ids])=>{const g=document.createElement('div');g.className='wgrp mtier gun-'+ids[0];g.innerHTML='<div class="wgh">'+nm+'</div><div class="wgc"></div>';const gc=g.querySelector('.wgc');ids.forEach(id=>gc.appendChild(card(id,'')));host.appendChild(g)});
 bmark()}
window.UIbrowse=k=>{bro=k||null;menu.classList.toggle('bro',!!bro);menu.classList.toggle('bro-f',bro==='f');menu.classList.toggle('bro-w',bro==='w');menu.classList.toggle('bro-m',bro==='m');
 const hd=$('brot');if(hd)hd.innerHTML=bro==='f'?'<b>FIGHTERS</b><span>'+Object.keys(LOOK).length+' to collect. Tap one to pick it for the lobby.</span>':bro==='w'?'<b>WEAPONS</b><span>Tap a gun to hold it in the lobby. Guns level up as you fight with them.</span>':bro==='m'?'<b>MELEE</b><span>Tap a melee weapon to equip it. Win more in Melee Crates.</span>':'';
 if(bro==='w'){tab='gun';buildBW()}else if(tab==='gun'&&bro==='f')tab='abil';
 UIpage(bro==='w'?'b':bro==='m'?'m':'f');showFighter();UIfit&&UIfit()};
const shellEl=menu.querySelector('.shell');
let curPg='f';const NXT={f:['w','Continue: Choose Your Weapon'],w:['m','Continue: Choose Your Melee'],m:['a','Continue: Choose Your Map']};
window.UIpage=pg=>{const was=curPg;curPg=pg;if(was!==pg&&(pg==='f'||pg==='w'||pg==='b'))showFighter();[...document.querySelectorAll('#pgtabs button')].forEach(b=>b.classList.toggle('on',b.dataset.p===pg));$('pgf').classList.toggle('on',pg==='f');$('pgw').classList.toggle('on',pg==='w');$('pgm').classList.toggle('on',pg==='m');$('pgb').classList.toggle('on',pg==='b');$('pga').classList.toggle('on',pg==='a');$('pgt').classList.toggle('on',pg==='t');if(pg==='a'&&window.UImap)UImap.show();if(pg==='t'&&window.TOUR)TOUR.show();
 menu.classList.toggle('nomap',!!window.WZNOMAP);const LP=window.WZNOMAP?'m':'a';go.style.display=pg===LP?'':'none';gm.style.display=pg===LP&&PK.on?'':'none';const n=window.WZNOMAP&&pg==='m'?null:NXT[pg];$('gnext').style.display=n?'block':'none';if(n)$('gnext').textContent=n[1];menu.scrollTop=0;window.UIfit&&UIfit()};$('gnext').onclick=()=>{const n=NXT[curPg];if(curPg==='w'&&PK.on&&PK.w&&!PK.s&&window.PR)PR.toast('Heads up: you cannot fight until you pick a secondary weapon.');if(n)UIpage(n[0])};
// ---- pick status, ticks on the page tabs, Fight gating, the no-secondary warning, and the reset after a finished match
const gm=document.createElement('p');gm.id='gmiss';go.before(gm);
function pkSync(){savePk();const t={f:PK.f,w:PK.w&&PK.s,m:PK.m,a:PK.a};[...document.querySelectorAll('#pgtabs button[data-p]')].forEach(b=>{if(b.dataset.p in t)b.classList.toggle('done',!!t[b.dataset.p])});
 const m=PK.on?PK.missing():[];gm.className=m.length?'bad':'ok';go.classList.toggle('locked',m.length>0);go.title=m.length?'Still to pick: '+m.map(k=>PKL[k]).join(', '):'';
 gm.innerHTML=m.length?'You cannot fight yet. Still to pick: <b>'+m.map(k=>PKL[k]).join(', ')+'</b>':'Everything is picked. Good luck!'}
function need(k){UIpage(PKP[k]);window.PR&&PR.toast(k==='s'?'You cannot fight without a secondary weapon. Pick a Pistol, SMG or Auto Pistol.':'Pick '+PKN[k]+' first.');if(k==='s'){const r=document.querySelector('#lo .lop.req');if(r){r.classList.remove('flash');void r.offsetWidth;r.classList.add('flash')}}const b=document.querySelector('#pgtabs button[data-p="'+k+'"]');if(b){b.classList.remove('need');void b.offsetWidth;b.classList.add('need')}}
go.addEventListener('click',e=>{if(!e.isTrusted||!PK.on)return;const m=PK.missing();
 if(m.length){e.stopImmediatePropagation();e.preventDefault();need(m[0]);return}
},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#tourgo');if(!t||!e.isTrusted||!PK.on)return;const m=['f','w','s','m'].filter(k=>!PK[k]);if(m.length){e.stopImmediatePropagation();e.preventDefault();need(m[0])}},true);
// ---- what you have equipped stays equipped (also after a reload) until you pick something else; only the map is asked for again
const EQK='brickbrawl.equip';let restoring=false;
function savePk(){if(!PK.on||restoring)return;try{localStorage.setItem(EQK,JSON.stringify({f:PK.f?csel:null,w:PK.w?wsel:null,s:PK.s?LO.sec:null,v:gv&&LO.isSec(gv)?gv:null,m:PK.m&&window.MW?MW.sel:null,gp:gunPicked?1:0}))}catch(e){}}
function restorePk(){if(!PK.on)return;let d=null;try{d=JSON.parse(localStorage.getItem(EQK)||'null')}catch(e){}if(!d)return;restoring=true;
 try{
  if(d.f&&LOOK[d.f]&&PR.isOpen(d.f)){csel=d.f;PK.f=1;wsel=PW(LOOK[d.f].sw)}
  if(d.w&&WP[d.w]&&!LO.isSec(d.w)&&(!window.SIGDEF||!SIGDEF[d.w]||SIG.ok(d.w))){wsel=d.w;PK.w=1}
  if(d.s&&WP[d.s]){LO.set(d.s);if(LO.sec===d.s){PK.s=1;if(d.v===d.s)gv=d.s}}
  if(d.m&&window.MW&&MW.set(d.m))PK.m=1;
  gunPicked=!!d.gp&&(PK.w||PK.s)
 }catch(e){console.error(e)}
 restoring=false;buildCards();buildMelee();showFighter()}
PK.reset=()=>{if(!PK.on)return;PK.a=0;PK.noSec=false;buildCards();buildMelee();showFighter();try{window.UImap&&UImap.built()&&UImap.show()}catch(e){}UIpage('f');pkSync()};
{const _e=endRound;endRound=function(w){const was=over;_e(w);if(was||!PK.on)return;if(score[0]>=2||score[1]>=2)setTimeout(()=>{if(!(window.TOUR&&TOUR.run))PK.reset()},2650)}}
restorePk();UIpage('f');pkSync();
[...document.querySelectorAll('#pgtabs button')].forEach(b=>b.onclick=()=>UIpage(b.dataset.p));
window.UIfit=()=>{if(getComputedStyle(menu).display==='none')return;const cw=menu.clientWidth,ah=menu.clientHeight-44;
 if(cw<=860){shellEl.style.zoom=1;shellEl.style.width='';shellEl.classList.remove('wide');shellEl.classList.remove('xwide');return}
 // widen the panels to fill the screen, then zoom out as far as needed so the whole page fits the screen and never scrolls (floor 40%)
 let z=1;for(;;){shellEl.style.zoom=z;const w=Math.min(1840,(cw-28)/z);shellEl.style.width=w+'px';shellEl.classList.toggle('wide',w>=1150);shellEl.classList.toggle('xwide',w>=1700);
  if(shellEl.getBoundingClientRect().height<=ah||z<=.4)break;z=Math.round((z-.03)*100)/100}};
addEventListener('resize',()=>UIfit());
showFighter();
(function spin(t){requestAnimationFrame(spin);if(mode==='play')return;pf.g.rotation.y=Math.PI-.5+t/1800;if(window.SHINE)SHINE.tick(pf,t/1000);pf.lg[0].rotation.x=0;pv.render(ps,pc)})(0);

// HUD: hotbar (1 gun + secondary box, 2 melee, 3 4 5 utilities) and portraits beside the top bars
const inv=document.createElement('div');inv.id='inv';$('hud').appendChild(inv);let last='';
const ICON={
 grenade:'<svg viewBox="0 0 40 40"><circle cx="20" cy="23" r="12" fill="#3f9bff" stroke="#000" stroke-width="2.5"/><path d="M12 19q8-6 16 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><rect x="16" y="6" width="8" height="6" rx="1" fill="#9aa0a6" stroke="#000" stroke-width="2"/><circle cx="29" cy="9" r="3.5" fill="none" stroke="#ffd02f" stroke-width="2.5"/></svg>',
 bandage:'<svg viewBox="0 0 40 40"><rect x="5" y="14" width="30" height="13" rx="4" transform="rotate(-25 20 20)" fill="#f4f4f4" stroke="#000" stroke-width="2.5"/><rect x="15" y="14" width="10" height="13" transform="rotate(-25 20 20)" fill="#ffb3b3" stroke="#000" stroke-width="1.5"/></svg>',
 medkit:'<svg viewBox="0 0 40 40"><rect x="5" y="11" width="30" height="23" rx="4" fill="#e63b3b" stroke="#000" stroke-width="2.5"/><rect x="14" y="6" width="12" height="7" rx="2" fill="none" stroke="#000" stroke-width="2.5"/><rect x="17.5" y="16" width="5" height="14" fill="#fff"/><rect x="13" y="20.5" width="14" height="5" fill="#fff"/></svg>',
 shield:'<svg viewBox="0 0 40 40"><rect x="15" y="5" width="10" height="7" rx="2" fill="#bbb" stroke="#000" stroke-width="2"/><path d="M13 12h14l5 16q0 7-12 7t-12-7z" fill="#3d8bff" stroke="#000" stroke-width="2.5"/><path d="M15 22q5 3 10 0" stroke="#bfe0ff" stroke-width="2" fill="none"/></svg>',
 slurp:'<svg viewBox="0 0 40 40"><rect x="9" y="8" width="22" height="5" rx="2" fill="#c9a36a" stroke="#000" stroke-width="2"/><rect x="8" y="13" width="24" height="23" rx="6" fill="#66e0ff" stroke="#000" stroke-width="2.5"/><rect x="12" y="19" width="5" height="12" rx="2" fill="#fff" opacity=".55"/></svg>',
 fish:'<svg viewBox="0 0 40 40"><path d="M5 20q10-13 22 0q-12 13-22 0z" fill="#ff9a3b" stroke="#000" stroke-width="2.5"/><path d="M27 20l9-8v16z" fill="#ff7a1a" stroke="#000" stroke-width="2.5"/><circle cx="13" cy="18" r="2" fill="#000"/></svg>',
 fort:'<svg viewBox="0 0 40 40"><rect x="15" y="11" width="20" height="24" fill="#9aa1a9" stroke="#000" stroke-width="2.5"/><path d="M15 11v-5h4v3h3v-3h4v3h3v-3h4v5" fill="#868d96" stroke="#000" stroke-width="2"/><rect x="22" y="24" width="6" height="11" fill="#2b2f36"/><ellipse cx="8" cy="34" rx="6" ry="2.6" fill="#39d96b" stroke="#000" stroke-width="2"/><path d="M8 30v-8m-3 3l3-4 3 4" stroke="#ffd02f" stroke-width="2.4" fill="none"/></svg>',
 trap:'<svg viewBox="0 0 40 40"><rect x="4" y="24" width="32" height="8" rx="2" fill="#8a8f96" stroke="#000" stroke-width="2.5"/><path d="M7 24l3-12 3 12M15 24l3-14 3 14M23 24l3-12 3 12" fill="#d0d4d8" stroke="#000" stroke-width="2"/></svg>'};
window.ICON=ICON;const HAMMER='<svg viewBox="0 0 48 48" width="40" height="40"><rect x="22" y="14" width="5" height="30" rx="2" fill="#8b5a2b" stroke="#000" stroke-width="2"/><rect x="21" y="30" width="7" height="3" fill="#ffd02f"/><rect x="9" y="5" width="30" height="13" rx="3" fill="#9aa0a6" stroke="#000" stroke-width="2.5"/><rect x="5" y="6" width="6" height="11" rx="2" fill="#e3000b" stroke="#000" stroke-width="2"/><rect x="37" y="6" width="6" height="11" rx="2" fill="#e3000b" stroke="#000" stroke-width="2"/></svg>';
inv.innerHTML='<div class="slot gun" id="hs1"><div class="sg" id="hsb" title="Press 1, X or the mouse wheel to swap"><img id="hg2" alt=""><i>⇄</i><small id="hg2n"></small></div><u>1</u><img id="hg1" alt=""><b id="hg1n"></b><em id="hg1a"></em></div>'+
 '<div class="slot" id="hs2"><u>2</u><div class="hm">'+HAMMER+'</div><b>Hammer</b></div>'+
 [3,4,5].map(n=>'<div class="slot ut" id="hs'+n+'"><u>'+n+'</u><div class="ico"></div><span></span></div>').join('');
const H=id=>document.getElementById(id);let hgid='',hsid='',hflip=0,hmw='';
// the top-left card: health number inside the health bar, then special cooldown, sprint and gun ammo together
// ammo shown as real bullets: a burst gun with 5 bursts left shows 15 (rounds still waiting to leave the barrel count too)
const ABUL=()=>{const s=P.w&&P.w.seq&&P.w.pel>1?P.w.pel:1,q=s>1&&window.BV?BV.Q.filter(x=>x.e===P).length:0;return{k:s,q}};
let kqMax=0;const ABNM={dash:'DASH',shield:'SHIELD',air:'AIRSTRIKE',reveal:'REVEAL',troll:'TROLL PRANK',stonks:'STONKS ZONE',slam:'SAHUR SLAM',portal:'PORK PORTAL',frog:'FROG HOP',doom:'DOOM SPIRAL',build:'QUICK BUILD',juke:'JACKPOT JUKE',mic:'MIC CHECK',rush:'RAINBOW RUSH',clock:'OVERCLOCK',alpha:'ALPHA RUSH',wow:'SUCH WOW'};
function kit(){if(!H('hpt'))return;H('hpt').textContent=Math.max(0,Math.ceil(P.hp))+' / '+Math.round(P.mx);
 const cd=P.cd?P.cd.a:0;if(cd<=0)kqMax=0;else kqMax=Math.max(kqMax,cd);
 H('kqn').textContent=ABNM[P.ab]||'SPECIAL';H('kqf').style.width=(cd>0?(1-cd/kqMax)*100:100)+'%';H('kqv').textContent=cd>0?cd.toFixed(1)+'s':'READY';H('krq').classList.toggle('rdy',cd<=0);
 const st=P.stam==null?1:P.stam;H('ktf').style.width=Math.round(st*100)+'%';H('ktv').textContent=Math.round(st*100)+'%';H('krt').classList.toggle('low',st<.2);H('krt').classList.toggle('on',!!P.spr);
 const mg0=P.w.mag||(window.MAG&&MAG[P.w.id]?MAG[P.w.id][0]:1),AB=ABUL(),mag=mg0*AB.k,am=(P.ammo==null?mg0:P.ammo)*AB.k+AB.q;H('kgn').textContent=(P.w.base||P.w.n).toUpperCase();
 H('kgf').style.width=(P.rl>0?(1-Math.min(1,P.rl/(P.w.rl||1.5)))*100:am/mag*100)+'%';H('kgv').textContent=P.rl>0?'RELOAD':am+' / '+mag;H('krg').classList.toggle('rl',P.rl>0)}
window.hudUpdate=()=>{if(!P.w)return;const mel=!!P.mel;kit();if(window.MW&&hmw!==P.mw){hmw=P.mw;const W=MW.of(P);H('hs2').querySelector('.hm').innerHTML='<img src="'+meleePic(W.id)+'" alt="">';H('hs2').querySelector('b').textContent=W.sn}H('hs1').classList.toggle('on',!mel);H('hs2').classList.toggle('on',mel);
 if(hgid!==(P.w.sig||P.w.id)){hgid=P.w.sig||P.w.id;H('hg1').src=gunPic(hgid)}H('hg1n').textContent=P.w.n;
 const mg1=P.w.mag||(window.MAG&&MAG[P.w.id]?MAG[P.w.id][0]:''),AB=ABUL(),mag=mg1===''?'':mg1*AB.k;H('hg1a').textContent=P.rl>0?'RELOADING':((P.ammo==null?mg1:P.ammo)*AB.k+AB.q)+' / '+mag;H('hg1a').classList.toggle('rl',P.rl>0);
 const o=P.slots&&P.slots[1]?P.slots[P.si^1]:null;H('hsb').style.display=o?'block':'none';
 if(o){if(hsid!==(o.sig||o.id)){hsid=o.sig||o.id;H('hg2').src=gunPic(hsid)}H('hg2n').textContent=o.base||o.n}
 const fl=(P.swapT||0)>0;H('hs1').classList.toggle('flip',fl);H('hsb').classList.toggle('flip',fl);
 [0,1,2].forEach(i=>{const it=P.inv[i]||'',el=H('hs'+(i+3));el.classList.toggle('has',!!it);if(el.dataset.k!==it){el.dataset.k=it;el.querySelector('.ico').innerHTML=ICON[it]||'';el.querySelector('span').textContent=it?IT[it].n:'';el.dataset.r=it&&IT[it].r||'';el.title=it&&IT[it].d?IT[it].n+': '+IT[it].d:''}})};
go.addEventListener('click',()=>{last='';hgid='';hsid='';if(window.PROFILE&&PROFILE.name())$('n1').textContent=PROFILE.name().toUpperCase();[['n1',P],['n2',E]].forEach(([id,e])=>{const b=$(id).parentNode;let im=b.querySelector('img');if(!im){im=document.createElement('img');b.prepend(im)}im.src=portrait(e.id)})});
})();
