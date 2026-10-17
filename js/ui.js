/* Menu with rendered portraits, stat bars, weapon cards and the inventory HUD. */
(()=>{
const ABN={dash:'Dash, 5s cooldown',shield:'Shield bubble, 3s, 10s cooldown',air:'Airstrike, 14s cooldown',reveal:'Reveal enemy, 10s cooldown'};
const hex=c=>'#'+c.toString(16).padStart(6,'0'),RN=LV.NAMES;
function rig(w,h){const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(w,h);return r}
function stage(){const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x667788,1.1));const d=new THREE.DirectionalLight(0xffffff,.9);d.position.set(3,5,4);s.add(d);return s}
const tr=rig(150,190),ts=stage(),tc=new THREE.PerspectiveCamera(30,150/190,.1,50);tc.position.set(0,1.42,5.5);tc.lookAt(0,1.17,0);
const gr=rig(200,100),gs=stage(),gc=new THREE.PerspectiveCamera(28,2,.1,50);gc.position.set(3.6,.3,-.15);gc.lookAt(0,0,-.2);
function fig(id,w,big){const f=mini(LOOK[id]);f.ham.visible=false;if(big&&w==='rpg')f.gs=1.35;attachGun(f,w);return f} // f.gs only enlarges the rocket launcher on the fighter screen, never in a match
const PC={};function portrait(id){if(PC[id])return PC[id];const f=fig(id,'rifle');f.g.rotation.y=Math.PI-.3;ts.add(f.g);tr.render(ts,tc);const u=tr.domElement.toDataURL();ts.remove(f.g);return PC[id]=u}
const GC={};function gunPic(id){if(GC[id])return GC[id];const g=buildGun(id,true);gs.add(g);const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3());
 const d=Math.max(sz.z*1.1/1.0,sz.y*1.35/.5); // camera distance so the gun fills ~90% of the card width (or height for tall guns)
 gc.position.set(d,ct.y+.02,ct.z);gc.lookAt(0,ct.y,ct.z);gr.render(gs,gc);const u=gr.domElement.toDataURL();gs.remove(g);return GC[id]=u}
const bar=(l,v,m,t)=>'<div class="st"><span>'+l+'</span><div><i style="width:'+Math.min(100,v/m*100)+'%"></i></div><em>'+t+'</em></div>';

function brickTitle(){return'<img id="btl" class="btitle" src="'+window.LOGO+'" alt="Brick Royale: Memewars">'}
const menu=$('menu'),go=$('go'),pv=rig(300,380);pv.domElement.id='pv';
menu.innerHTML='<div class="shell"><div class="side"><div id="pvh"></div><h2 id="pn"></h2><p id="pp"></p><div id="pst"></div></div>'+
 '<div class="main"><div class="mtop" id="mtop">'+brickTitle()+'</div><h3>Choose your fighter</h3><div class="cg" id="cg"></div><h3>Choose your weapon</h3><div id="lo"></div><div class="wg" id="wg"></div><div id="gh"></div>'+
 '<p class="help">WASD move &middot; Space jump &middot; Mouse aim &middot; Click shoot &middot; Right click or F hammer &middot; Q ability &middot; 1 gun (press again to swap to your secondary) &middot; 2 hammer &middot; 3 4 5 use items &middot; T sprint &middot; Shift crouch &middot; R reload &middot; M mute<br>Grab loot bags for grenades, healing, shields and traps. Walk over a green plus for health or a blue shield for armor (only when you need it).</p></div></div>';
$('pvh').replaceWith(pv.domElement);$('gh').replaceWith(go);go.textContent='Fight';PR.mount(go);
const ps=stage(),pc=new THREE.PerspectiveCamera(30,300/380,.1,50);pc.position.set(0,1.5,5.8);pc.lookAt(0,1.15,0);
let pf=null;
const PDESC={pepe:'Every hit is boosted by 20% (bullets, rockets and hammer) on top of his level scaling, so Pepe wins damage races. Average health and speed.',
 wojak:'Slowly regenerates 2 health every second while a round is live and has 110 max health at full level, but hits about 10% softer. Stay alive, duck out of fights and heal.',
 foreman:'A tough, slow builder: 120 max health at full level, a little slower than most and hits about 10% softer. Great at taking hits while you wear the enemy down.',
 jester:'Chaos in every shot: 20% of your hits deal double damage, so damage is spiky and unpredictable. Average health and speed.',
 general:'A balanced commander with average health, speed and damage, built around calling in his Airstrike at the right moment.',
 nyan:'The fastest fighter in the game and leaves a rainbow trail while running, but has only 90 health and hits about 15% softer. Hit and run.',
 podcast:'Sees what others cannot: his reveal ability marks the enemy through walls. Average health and speed but hits about 10% softer.',
 trader:'Comes into every round with 40 armor at full level, but hits about 15% softer. The armor soaks up the first burst of damage.',
 giga:'130 max health and a much harder hammer (42 damage instead of 28), but slower on his feet. Close the gap and smash.',
 doge:'Lucky: loot bags give rarer items, health and shield pickups restore both health and armor, and he moves a little faster, but hits about 10% softer.'},
 ADESC={dash:'A quick burst of speed (about five metres) in the direction you are moving. 5 second cooldown. Dodge shots, jump out of an explosion or close the gap.',
 shield:'Throws up a bubble that blocks all damage for 3 seconds. 10 second cooldown. Use it to survive a burst, or to push forward while reloading.',
 air:'Calls down five rockets on the enemy: one lands right on them and the rest scatter around them over about two seconds. 14 second cooldown. Rockets deal heavy splash damage, so keep moving.',
 reveal:'Marks the enemy through walls and cover for 4 seconds. 10 second cooldown. Lets you pre-aim around corners and avoid ambushes.'},
 GDESC={rifle:'The dependable all-rounder: fully automatic with steady accuracy and a big magazine. Good at any range up to mid distance, with no real weakness.',
 burst:'Fires tight three-round bursts with pinpoint accuracy and long range. Each trigger pull lands three bullets, so staying on target matters more than speed.',
 smg:'The highest fire rate of any gun with a huge 35-round magazine and quick reload. Bullets are small and scatter at range, so get in close.',
 pistol:'Accurate, light and quick to reload. Modest damage per shot, but almost every bullet lands, which makes it reliable at any distance.',
 shotgun:'Seven pellets per blast for massive close-range damage that fades quickly with distance. Pump action means slow follow-up shots and a long reload.',
 tac:'A fully automatic six-pellet shotgun. Constant close-quarters pressure, but the pellets scatter widely and the range is very short.',
 sniper:'Slow, heavy single shots with very fast bullets and the longest range. A couple of hits take down most fighters, but a miss leaves you waiting.',
 rpg:'Fires a slow rocket that explodes on impact, damaging everything within five metres, strongest at the centre. One shot per reload, and your own blast hurts you for half damage.'},
 SK=[['Default','common','none'],['Shadow','rare','brightness(.38) contrast(1.15)'],['Neon','epic','hue-rotate(150deg) saturate(2.6) brightness(1.1)'],['Golden','legend','sepia(1) saturate(4) hue-rotate(2deg) brightness(1.15)']];
const xpBar=(l,i)=>'<div class="st xp"><span>'+l+' '+i.L+'</span><div><i style="width:'+(i.max?100:Math.min(100,i.x/i.need*100))+'%"></i></div><em>'+(i.max?'MAX':i.x+'/'+i.need)+'</em></div>';
let tab='abil',gv=null;const PW=id=>LO.SECS.includes(id)?'rifle':id;wsel=PW(wsel);
const nextTxt=(i,card)=>{if(i.max)return'<b>MAX LEVEL</b>'+(card?'':' &middot; full power unlocked');const nt=LV.tier(i.L+1);return'<b>'+(i.need-i.x)+(card?' dmg</b> to LV ':' more damage</b> to reach LV ')+(i.L+1)+(nt!==i.tier?' <span class="up r-'+nt+'">'+RN[nt]+'</span>':'')};
const dmgTxt=w=>w.rocket?Math.round(w.sdm)+' splash':w.pel>1?w.dmg.toFixed(1)+' x '+w.pel:w.dmg.toFixed(1);
function tabHTML(){const L=LOOK[csel],ci=LV.cinfo(csel),gid=gv||wsel,gi=LV.info('g',gid),w=LV.weapon(gid,gi.L);
 if(tab==='skin')return'<div class="ab"><b>'+L.nm+' skins</b> <small>(locked for now)</small><br>Skins change how '+L.nm+' looks in a match. None can be unlocked yet; they are coming in a later update.</div><div class="skg">'+
  SK.map((k,i)=>'<button class="sk r-'+k[1]+(i?' lock':' on')+'" data-i="'+i+'"><span class="sw"><img src="'+portrait(csel)+'" alt="" style="filter:'+k[2]+'">'+(i?'<s class="lk"></s>':'')+'</span><b>'+(i?k[0]+' '+L.nm:'Default')+'</b><i class="rb r-'+k[1]+'">'+(i?RN[k[1]]+' &middot; LOCKED':'EQUIPPED')+'</i></button>').join('')+'</div>';
 if(tab==='gun'){const dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);
  return'<div class="ab"><b>'+w.base+'</b> <i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i><br>'+GDESC[gid]+'</div><div class="gst">'+
   bar('Damage',dm,70,dmgTxt(w))+bar('Fire rate',1/w.rate,14,(1/w.rate).toFixed(1)+'/s')+bar('Magazine',w.mag,36,w.mag+' rounds')+bar('Reload',Math.max(.05,Math.min(1,(2.7-w.rl)/1.9)),1,w.rl+'s')+bar('Range',w.br,24,w.br)+bar('DPS',dps,50,Math.round(dps))+'</div>'+
   '<div class="gxp">'+xpBar('Level',gi)+'<div class="nx">'+nextTxt(gi)+'</div></div>'+
   '<div class="ab lvn">Guns start Common at Lv 1 and gain a rarity every 5 levels (Uncommon 6, Rare 11, Epic 16, Legendary 21, max Lv 30). Damage you deal earns gun XP, plus 50 for each round you win.</div>'}
 return'<div class="ab"><b>'+L.an+'</b> <small>(passive)</small><br>'+(PDESC[csel]||L.ad)+'</div>'+
  '<div class="ab"><b>Q ability: '+ABN[L.ab].split(',')[0]+'</b><br>'+ADESC[L.ab]+'</div>'+
  '<div class="ab lvn">Starting rarity: '+RN[ci.base]+'. Fighters gain a rarity every 5 levels (Uncommon 6, Rare 11, Epic 16, Legendary 21, max Lv 30) and earn XP from damage and wins.</div>'}
function drawTab(){const t=$('tabc');if(!t)return;t.innerHTML=tabHTML();[...document.querySelectorAll('.tabs button')].forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 [...t.querySelectorAll('.sk')].forEach(b=>b.onclick=()=>{PR.toast(b.dataset.i==='0'?'Default skin is equipped.':'Locked! Skins will unlock in a later update.')});window.UIfit&&UIfit()}
function showFighter(){if(pf)ps.remove(pf.g);pf=fig(csel,wsel,1);ps.add(pf.g);const L=LOOK[csel],ci=LV.cinfo(csel),c0=LV.cstats(csel,ci.L),s=[c0[0],c0[1],Math.round(c0[2]*100),c0[3]];
 $('pn').innerHTML=L.nm+' <i class="rb r-'+ci.rar+'">LV '+ci.L+' '+RN[ci.rar]+'</i>';$('pn').className='r-'+ci.rar;pv.domElement.dataset.r=ci.rar;$('pp').textContent=L.pk;
 $('pst').innerHTML=xpBar('Level',ci)+bar('Health',s[0],130,s[0])+bar('Speed',s[1],11.5,s[1])+bar('Damage',Math.min(100,s[2]),100,s[2]>100?'100% (+'+(s[2]-100)+'%)':s[2]+'%')+bar('Start armor',s[3],50,s[3])+
  '<div class="tabs"><button data-t="abil">Abilities</button><button data-t="gun">Gun</button><button data-t="skin" class="locked" disabled title="Skins are locked for now"><span class="lk2"></span>Skins</button></div><div id="tabc"></div>';
 [...document.querySelectorAll('.tabs button:not(.locked)')].forEach(b=>b.onclick=()=>{tab=b.dataset.t;drawTab()});if(tab==='skin')tab='abil';drawTab()}
const cg=$('cg'),wg=$('wg');
const ORD=LV.RANK;
const wcard={};
function markSel(){const sc=LO.sec;
 Object.keys(wcard).forEach(id=>{const b=wcard[id],on=id===wsel,sn=id===sc;b.classList.toggle('sel',on);b.classList.toggle('sec',sn);const t=b.querySelector('.tg');t.textContent=on?'PRIMARY':sn?'SECONDARY':'';t.className='tg'+(on?' p':sn?' s':'')});
 const gp=LV.info('g',wsel),gs=LV.info('g',sc),pw=LV.weapon(wsel,gp.L),sw=LV.weapon(sc,gs.L);
 $('lo').innerHTML='<div class="lop"><small>PRIMARY</small><b>'+pw.base+'</b><i class="rb r-'+gp.tier+'">LV '+gp.L+'</i></div><div class="lop"><small>SECONDARY</small><b>'+sw.base+'</b><i class="rb r-'+gs.tier+'">LV '+gs.L+'</i></div><p>Pick one gun from Short, Mid or Long range as your <b>primary</b> and a <b>Pistol or SMG</b> as your <b>secondary</b>. Swap in a match with <b>X</b> or the mouse wheel.</p>'}
function buildCards(){cg.innerHTML='';wg.innerHTML='';
 Object.keys(LOOK).sort((a,b)=>ORD[LOOK[a].r]-ORD[LOOK[b].r]).forEach(id=>{const ci=LV.cinfo(id),b=document.createElement('button');b.dataset.id=id;b.className='cc r-'+ci.rar+(id===csel?' sel':'')+(PR.isOpen(id)?'':' lock');
  b.innerHTML='<img src="'+portrait(id)+'" alt=""><div class="crow"><div class="lvb"><small>LEVEL</small><strong>'+ci.L+'</strong></div><div class="cnm"><b>'+LOOK[id].nm+'</b></div></div><i class="rb r-'+ci.rar+'">'+RN[ci.rar]+'</i><div class="cxp"><i style="width:'+(ci.max?100:Math.min(100,ci.x/ci.need*100))+'%"></i></div><em class="cxt">'+(ci.max?'MAX LEVEL':ci.x+' / '+ci.need+' XP')+'</em><s class="lk"></s>';
  b.onclick=()=>{if(!PR.isOpen(id)){PR.toast('Locked! Win '+LOOK[id].nm+' on the wheel.');return}csel=id;wsel=PW(LOOK[id].sw);gv=null;markSel();[...cg.children].forEach(c=>c.classList.remove('sel'));b.classList.add('sel');showFighter()};cg.appendChild(b)});
 LO.GROUPS.forEach(([nm,ids])=>{const g=document.createElement('div');g.className='wgrp g-'+ids[0];g.innerHTML='<div class="wgh">'+nm+'</div><div class="wgc"></div>';const gc2=g.querySelector('.wgc');
  ids.forEach(id=>{const w0=WP[id],gi=LV.info('g',id),w=LV.weapon(id,gi.L),b=document.createElement('button');b.className='wc r-'+gi.tier;b.dataset.w=id;wcard[id]=b;
   const dm=w.rocket?w.sdm+10:w.dmg*w.pel,dps=w.mag*dm/((w.mag-1)*w.rate+w.rl);b.innerHTML='<u class="tg"></u><img src="'+gunPic(id)+'" alt=""><i class="rb r-'+gi.tier+'">LV '+gi.L+' '+RN[gi.tier]+'</i><b>'+w.base+'</b>'+bar('Dmg',dm,70,Math.round(dm))+bar('Rate',1/w.rate,14,(1/w.rate).toFixed(1))+bar('Range',w.br,24,w.br)+bar('DPS',dps,50,Math.round(dps))+'<div class="st xp"><span>XP</span><div><i style="width:'+(gi.max?100:Math.min(100,gi.x/gi.need*100))+'%"></i></div><em>'+(gi.max?'MAX':gi.x+'/'+gi.need)+'</em></div><div class="nx">'+nextTxt(gi,1)+'</div>';
   b.onclick=()=>{if(LO.SECS.includes(id)){LO.set(id);gv=id}else{wsel=id;gv=null}tab='gun';markSel();showFighter()};
   gc2.appendChild(b)});wg.appendChild(g)});
 markSel()}
buildCards();window.UIrefresh=()=>{buildCards();showFighter()};
const shellEl=menu.querySelector('.shell');
window.UIfit=()=>{if(getComputedStyle(menu).display==='none')return;const cw=menu.clientWidth,ah=menu.clientHeight-44;
 if(cw<=860){shellEl.style.zoom=1;shellEl.style.width='';shellEl.classList.remove('wide');return}
 // widen the panels to fill the screen, then zoom out only as far as needed so everything fits without scrolling
 let z=1;for(;;){shellEl.style.zoom=z;const w=Math.min(2100,(cw-28)/z);shellEl.style.width=w+'px';shellEl.classList.toggle('wide',w>=1150);
  if(shellEl.getBoundingClientRect().height<=ah||z<=.42)break;z=Math.round((z-.03)*100)/100}};
addEventListener('resize',()=>UIfit());
showFighter();
(function spin(t){requestAnimationFrame(spin);if(mode==='play')return;pf.g.rotation.y=Math.PI-.5+t/1800;pf.lg[0].rotation.x=0;pv.render(ps,pc)})(0);

// HUD: hotbar (1 gun + secondary box, 2 hammer, 3 4 5 utilities) and portraits beside the top bars
const inv=document.createElement('div');inv.id='inv';$('hud').appendChild(inv);let last='';
const ICON={
 grenade:'<svg viewBox="0 0 40 40"><circle cx="20" cy="23" r="12" fill="#3f9bff" stroke="#000" stroke-width="2.5"/><path d="M12 19q8-6 16 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><rect x="16" y="6" width="8" height="6" rx="1" fill="#9aa0a6" stroke="#000" stroke-width="2"/><circle cx="29" cy="9" r="3.5" fill="none" stroke="#ffd02f" stroke-width="2.5"/></svg>',
 bandage:'<svg viewBox="0 0 40 40"><rect x="5" y="14" width="30" height="13" rx="4" transform="rotate(-25 20 20)" fill="#f4f4f4" stroke="#000" stroke-width="2.5"/><rect x="15" y="14" width="10" height="13" transform="rotate(-25 20 20)" fill="#ffb3b3" stroke="#000" stroke-width="1.5"/></svg>',
 medkit:'<svg viewBox="0 0 40 40"><rect x="5" y="11" width="30" height="23" rx="4" fill="#e63b3b" stroke="#000" stroke-width="2.5"/><rect x="14" y="6" width="12" height="7" rx="2" fill="none" stroke="#000" stroke-width="2.5"/><rect x="17.5" y="16" width="5" height="14" fill="#fff"/><rect x="13" y="20.5" width="14" height="5" fill="#fff"/></svg>',
 shield:'<svg viewBox="0 0 40 40"><rect x="15" y="5" width="10" height="7" rx="2" fill="#bbb" stroke="#000" stroke-width="2"/><path d="M13 12h14l5 16q0 7-12 7t-12-7z" fill="#3d8bff" stroke="#000" stroke-width="2.5"/><path d="M15 22q5 3 10 0" stroke="#bfe0ff" stroke-width="2" fill="none"/></svg>',
 slurp:'<svg viewBox="0 0 40 40"><rect x="9" y="8" width="22" height="5" rx="2" fill="#c9a36a" stroke="#000" stroke-width="2"/><rect x="8" y="13" width="24" height="23" rx="6" fill="#66e0ff" stroke="#000" stroke-width="2.5"/><rect x="12" y="19" width="5" height="12" rx="2" fill="#fff" opacity=".55"/></svg>',
 fish:'<svg viewBox="0 0 40 40"><path d="M5 20q10-13 22 0q-12 13-22 0z" fill="#ff9a3b" stroke="#000" stroke-width="2.5"/><path d="M27 20l9-8v16z" fill="#ff7a1a" stroke="#000" stroke-width="2.5"/><circle cx="13" cy="18" r="2" fill="#000"/></svg>',
 trap:'<svg viewBox="0 0 40 40"><rect x="4" y="24" width="32" height="8" rx="2" fill="#8a8f96" stroke="#000" stroke-width="2.5"/><path d="M7 24l3-12 3 12M15 24l3-14 3 14M23 24l3-12 3 12" fill="#d0d4d8" stroke="#000" stroke-width="2"/></svg>'};
const HAMMER='<svg viewBox="0 0 48 48" width="40" height="40"><rect x="22" y="14" width="5" height="30" rx="2" fill="#8b5a2b" stroke="#000" stroke-width="2"/><rect x="21" y="30" width="7" height="3" fill="#ffd02f"/><rect x="9" y="5" width="30" height="13" rx="3" fill="#9aa0a6" stroke="#000" stroke-width="2.5"/><rect x="5" y="6" width="6" height="11" rx="2" fill="#e3000b" stroke="#000" stroke-width="2"/><rect x="37" y="6" width="6" height="11" rx="2" fill="#e3000b" stroke="#000" stroke-width="2"/></svg>';
inv.innerHTML='<div class="slot gun" id="hs1"><div class="sg" id="hsb" title="Press 1, X or the mouse wheel to swap"><img id="hg2" alt=""><i>⇄</i><small id="hg2n"></small></div><u>1</u><img id="hg1" alt=""><b id="hg1n"></b><em id="hg1a"></em></div>'+
 '<div class="slot" id="hs2"><u>2</u><div class="hm">'+HAMMER+'</div><b>Hammer</b></div>'+
 [3,4,5].map(n=>'<div class="slot ut" id="hs'+n+'"><u>'+n+'</u><div class="ico"></div><span></span></div>').join('');
const H=id=>document.getElementById(id);let hgid='',hsid='',hflip=0;
window.hudUpdate=()=>{if(!P.w)return;const mel=!!P.mel;H('hs1').classList.toggle('on',!mel);H('hs2').classList.toggle('on',mel);
 if(hgid!==P.w.id){hgid=P.w.id;H('hg1').src=gunPic(P.w.id)}H('hg1n').textContent=P.w.n;
 const mag=P.w.mag||(window.MAG&&MAG[P.w.id]?MAG[P.w.id][0]:'');H('hg1a').textContent=P.rl>0?'RELOADING':(P.ammo==null?mag:P.ammo)+' / '+mag;H('hg1a').classList.toggle('rl',P.rl>0);
 const o=P.slots&&P.slots[1]?P.slots[P.si^1]:null;H('hsb').style.display=o?'block':'none';
 if(o){if(hsid!==o.id){hsid=o.id;H('hg2').src=gunPic(o.id)}H('hg2n').textContent=o.base||o.n}
 const fl=(P.swapT||0)>0;H('hs1').classList.toggle('flip',fl);H('hsb').classList.toggle('flip',fl);
 [0,1,2].forEach(i=>{const it=P.inv[i]||'',el=H('hs'+(i+3));el.classList.toggle('has',!!it);if(el.dataset.k!==it){el.dataset.k=it;el.querySelector('.ico').innerHTML=ICON[it]||'';el.querySelector('span').textContent=it?IT[it].n:''}})};
go.addEventListener('click',()=>{last='';hgid='';hsid='';[['n1',P],['n2',E]].forEach(([id,e])=>{const b=$(id).parentNode;let im=b.querySelector('img');if(!im){im=document.createElement('img');b.prepend(im)}im.src=portrait(e.id)})});
})();
