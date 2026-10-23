/* Signature guns: one per fighter, a side-grade of a core gun class (about the same damage per second, a different way of getting there).
   A signature gun unlocks when its fighter reaches LV 20. It behaves as its class everywhere (sounds, grip, recoil, scope: the weapon object keeps the class as its id and
   carries the signature in w.sig), has its own LEGO model, and some have a small effect (headshot bonus, armor bonus, reveal, mark, steadier aim, bright tracers).
   Loaded after arsenal.js (needs GUN, WP) and before levels.js (which adds BASE entries from SIGDEF). */
(()=>{
const GUN=window.GUN,UNLOCK=20,RB=[0xff3b3b,0xff9a1a,0xffe21a,0x3ddc5a,0x35b6ff,0xb15cff];
// ---- recolour a base model (op colour slot: b=7, c=6, k=7, s=6) and add parts
const RC=(ops,map)=>ops.map(o=>{const i=o[0]==='b'||o[0]==='k'?7:6,c=map[o[i]];if(c==null)return o;const n=o.slice();n[i]=c;return n});
const DEF={
 pepe:{cls:'smg',n:'Swamp Spray',tag:'Compact SMG with a tight spread and strong hip-fire.',fx:'Very tight spread, easy to control.',
  st:{dmg:5.0,rate:.08,spr:.026,mag:30,rl:1.3,br:9},
  ops:b=>[...RC(b,{0x25282b:0x2fae44,0x333333:0x1d7a2e,0xff8c00:0xb6ff3d,0x474d55:0x1d7a2e}),['b',.147,.03,.34,0,.045,-.05,0xb6ff3d],['b',.1,.035,.1,0,.145,-.3,0xb6ff3d],['b',.04,.06,.03,.03,.2,-.3,0xffffff],['b',.04,.06,.03,-.03,.2,-.3,0xffffff],['b',.015,.015,.012,.03,.2,-.318,0x111111],['b',.015,.015,.012,-.03,.2,-.318,0x111111]]},
 wojak:{cls:'pistol',n:'Coping Pistol',tag:'Accurate pistol with a high first-shot reward.',fx:'Very accurate and heavy-hitting. Headshots deal x2.1.',
  st:{dmg:16.5,rate:.32,spr:.004,mag:10,rl:1.0,spd:80,br:12,hsm:2.1},
  ops:b=>[...RC(b,{0x3a3f45:0xe7e0d0,0x1c1e21:0x2b2f36}),['b',.126,.025,.32,0,.115,-.1,0x9aa0a6,'m'],['c',.032,.14,0,.075,-.42,0xe7e0d0,'m'],['b',.104,.05,.05,0,-.24,.1,0x9aa0a6,'p',.2]]},
 foreman:{cls:'shotgun',n:'Nail Driver',tag:'Pump shotgun with a tight spread and a strong close-range burst.',fx:'Eight tight pellets: a harder, tighter blast than the pump.',
  st:{dmg:9,pel:8,rate:.85,spr:.07,mag:6,rl:1.8,life:.38,br:6},
  ops:b=>[...RC(b,{0x6b4423:0xffb81c,0x2a2d31:0x3a3f45,0x2a1808:0x8a5a00}),['c',.056,.07,0,.03,-.55,0xff6a00],['c',.056,.07,0,.03,-.8,0xffffff],['c',.056,.07,0,.03,-1.05,0xff6a00],['b',.152,.03,.3,0,.075,-.08,0xff6a00],['b',.1,.2,.02,.0,-.01,-.9,0xe3000b,'t']]},
 jester:{cls:'pistol',n:'Trickshot Revolver',tag:'High-damage pistol with a strong headshot reward.',fx:'Six heavy shots. Headshots deal x2.4.',
  st:{dmg:24,rate:.42,spr:.008,mag:6,rl:1.6,spd:80,br:12,hsm:2.4},
  ops:b=>{const keep=b.filter((o,i)=>i>1&&!(o[0]==='s'));const r=RC(keep,{0x3a3f45:0xe3000b});const cyl=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl.push(['c',.02,.205,Math.cos(a)*.055,.035+Math.sin(a)*.055,-.06,0x17171b,'m'])}
   return[...r,['b',.07,.07,.55,0,.1,-.12,0xffd02f],['c',.034,.5,0,.085,-.42,0x2c3036,'m'],['c',.088,.2,0,.035,-.06,0xd6dde6,'m'],...cyl,['b',.028,.08,.034,0,.14,.16,0xd6dde6,'m'],['b',.06,.04,.06,0,.03,-.43,0x0a6ed1],['c',.045,.05,0,.085,-.7,0xffd02f,'m'],['b',.03,.035,.03,0,.145,-.32,0xf2f2f2]]}},
 podcast:{cls:'smg',n:'Broadcast Blaster',tag:'Suppressed SMG. Hits briefly reveal the target.',fx:'Suppressed. Every hit reveals the enemy through walls for 1.5 s.',
  st:{dmg:4.6,rate:.075,spr:.034,mag:34,rl:1.4,rev:1.5,br:8},
  ops:b=>[...RC(b,{0x25282b:0x16191d,0x333333:0x0f1114,0x474d55:0x2c3036}),['c',.088,.5,0,0,-.98,0x1a1d21,'m'],['c',.092,.05,0,0,-.78,0x35c8ff,'m'],['c',.092,.05,0,0,-1.2,0x35c8ff,'m'],['c',.035,.12,0,.2,-.1,0x9aa0a6,'m'],['c',.055,.06,0,.2,-.2,0x111111],['b',.09,.02,.02,0,.2,-.24,0x35c8ff,'t']]},
 nyan:{cls:'rifle',n:'Starburst Carbine',tag:'Bright rifle with a quick reload and visible tracers.',fx:'Quick reload and rainbow tracers.',
  st:{dmg:7.3,rate:.135,spr:.016,mag:28,rl:1.1,tc:'rainbow'},
  ops:b=>[...RC(b,{0x2c3036:0xf1f1f6,0x474d55:0x8f45e8,0xff8c00:0xff6fd0,0x1a1c1f:0x3a3a44}),...RB.map((c,i)=>['b',.152,.022,.34,0,.07-i*.022,-.62,c]),['b',.1,.045,.4,0,.17,-.2,0x35b6ff],['s',5,0,.145,-.35,.12,0xff6fd0]]},
 general:{cls:'burst',n:'Medal Burst',tag:'Disciplined burst rifle with excellent mid-range accuracy.',fx:'Pinpoint three-round bursts with extra range.',
  st:{dmg:9.2,rate:.52,spr:.003,mag:8,rl:1.5,br:16},
  ops:b=>[...RC(b,{0x8a7a55:0x5b6b2f,0x5a3d22:0x4b5a2a,0x3b2814:0x33401f}),['c',.052,.06,0,0,-.95,0xe3b92a,'m'],['c',.052,.06,0,0,-1.2,0xe3b92a,'m'],['b',.156,.03,.12,0,.02,.1,0xc4161c],['b',.156,.03,.05,0,.02,.18,0xe3b92a,'m'],['b',.05,.04,.05,0,.19,-.3,0xe3b92a,'m'],['b',.03,.05,.03,0,.17,-.3,0xc4161c]]},
 trader:{cls:'rifle',n:'Neuro Rifle',tag:'Accurate rifle that deals bonus armor damage.',fx:'Accurate. +30% damage against armor.',
  st:{dmg:7.4,rate:.14,spr:.012,mag:30,rl:1.5,arm:1.3},
  ops:b=>[...RC(b,{0x2c3036:0xeeeeee,0x474d55:0xf4a6b8,0xff8c00:0xff3ec8}),['b',.1,.07,.16,0,.2,-.42,0xf4a6b8],['b',.07,.06,.1,.04,.24,-.42,0xe27c95],['b',.07,.06,.1,-.04,.24,-.42,0xe27c95],['b',.09,.2,.02,0,-.12,-.5,0xff3ec8,'t']]},
 stonks:{cls:'burst',n:'Green Candle',tag:'Burst rifle that steadies with consecutive hits.',fx:'Each consecutive hit tightens your spread, up to 70% tighter.',
  st:{dmg:8.6,rate:.5,spr:.007,mag:8,rl:1.5,steady:1},
  ops:b=>[...RC(b,{0x8a7a55:0x1b8f35,0x5a3d22:0x15171c,0x3b2814:0x0d0d0d}),['b',.148,.03,.34,0,.0,-.68,0xe3b92a,'m'],['b',.012,.3,.012,0,.3,-.1,0x7dff9a],['b',.075,.16,.075,0,.18,-.1,0x20c050,'p'],['b',.012,.18,.012,0,.04,-.1,0x7dff9a],['b',.15,.02,.04,0,-.07,.1,0xe8c9a3]]},
 pork:{cls:'pistol',n:'Incoming Call',tag:'Accurate sidearm that marks enemies on the first hit.',fx:'A hit marks the target: you deal +12% damage to them for 3 s.',
  st:{dmg:12.5,rate:.24,spr:.008,mag:12,rl:1.0,mark:1},
  ops:b=>[...RC(b,{0x1c1e21:0xf2a0b3,0x3a3f45:0x141414}),['b',.126,.03,.3,0,.12,-.1,0xf2f2f2],['c',.06,.05,0,.075,-.4,0x141414,'m'],['b',.05,.05,.03,0,.17,-.2,0xffd02f],['b',.03,.035,.03,0,.17,.1,0xf2f2f2]]},
 giga:{cls:'shotgun',n:'Titan Pump',tag:'Pump shotgun with massive first-shot damage.',fx:'Huge damage per blast, slower to pump.',
  st:{dmg:12,pel:7,rate:1.0,spr:.09,mag:5,rl:2.0,life:.38,br:6},
  ops:b=>[...RC(b,{0x6b4423:0xe8721c,0x2a2d31:0x26292e,0x2a1808:0x8a3a00}),['c',.065,.95,0,.03,-.85,0x3a3f45,'m'],['c',.088,.04,0,.03,-.55,0xe3b92a,'m'],['c',.088,.04,0,.03,-1.2,0xe3b92a,'m'],['c',.085,.05,0,-.07,-.8,0x17171b],['c',.085,.05,0,-.07,-.9,0x17171b],['b',.152,.04,.34,0,.075,-.05,0xe3b92a,'m']]},
 doge:{cls:'rifle',n:'Wow Blaster',tag:'Golden rifle with smooth handling and good hip-fire.',fx:'Very tight spread and a big magazine.',
  st:{dmg:7.4,rate:.13,spr:.009,mag:32,rl:1.5},
  ops:b=>[...RC(b,{0x2c3036:0xf2c84b,0x474d55:0xd99a1a,0xff8c00:0xffffff,0x1a1c1f:0x5a3d22}),['c',.062,.05,0,0,-1.25,0xffe27a,'m'],['b',.152,.03,.3,0,.0,-.1,0xfbe9c4],['s',6,0,.142,-.45,.12,0xffe27a],['b',.05,.04,.08,0,.18,-.05,0xffffff]]},
 troll:{cls:'burst',n:'Bait Blaster',tag:'Burst weapon built for ambushes with sharp burst damage.',fx:'Sharp bursts, shorter range.',
  st:{dmg:9.8,rate:.55,spr:.007,mag:7,rl:1.4,life:1.1,br:12},
  ops:b=>[...RC(b,{0x8a7a55:0xc4161c,0x5a3d22:0x17171b,0x3b2814:0x0d0d0d}),['b',.155,.11,.14,0,.0,-.28,0xf2f2f2],['b',.158,.02,.08,0,.03,-.28,0x17171b],['b',.158,.02,.08,0,-.02,-.28,0x17171b],['b',.1,.03,.1,0,-.12,-.9,0xffd02f],['b',.02,.12,.02,0,-.2,-.9,0xffd02f,'m']]},
 sahur:{cls:'rpg',n:'Wake-Up Cannon',tag:'Heavy explosive launcher with a loud impact.',fx:'Bigger blast damage, but a slower rocket and reload.',
  st:{sdm:72,rate:1.5,spd:40,rl:2.1,br:15},
  ops:b=>[...RC(b,{0x556b2f:0xffc400,0x2f3b1c:0x17171b,0x333a40:0x6b4a2f,0xffd02f:0xffffff}),['c',.09,.05,0,.18,-.2,0xffffff],['c',.045,.05,.0,.205,-.2,0xe3000b],['c',.045,.05,.06,.21,-.35,0xe3000b,'m'],['c',.045,.05,-.06,.21,-.35,0xe3000b,'m'],['c',.148,.05,0,0,-.35,0x17171b],['c',.148,.05,0,0,-.05,0x17171b]]}
};
// ---- register: model, base weapon, lookups
const SIGDEF={},BYF={};
Object.keys(DEF).forEach(f=>{const d=DEF[f],id='sg_'+f;SIGDEF[id]=Object.assign({id,owner:f,unlock:UNLOCK},d);BYF[f]=id;
 if(GUN[d.cls])GUN[id]=d.ops(GUN[d.cls]);
 WP[id]={id,n:d.n,cls:d.cls}});
window.SIGDEF=SIGDEF;
window.SIG={DEF:SIGDEF,of:f=>BYF[f],unlock:UNLOCK,RB,
 owner:id=>SIGDEF[id]&&SIGDEF[id].owner,
 is:id=>!!SIGDEF[id],
 // may this fighter use that gun right now? plain guns are always fine; a signature gun needs its owner picked and at LV 20
 ok:(id,f)=>{const d=SIGDEF[id];if(!d)return true;f=f||csel;return d.owner===f&&!!window.LV&&LV.lvl('c',f)>=UNLOCK},
 fix:(id,f)=>SIG.ok(id,f)?id:null,
 // damage and effects of a bullet that hit (called from game.js)
 mult:(e,t,w,hs)=>{let m=1;if(w.arm&&t.ar>0)m*=w.arm;if(w.mark&&t.mkBy===e&&(t.mkT||0)>(T||0))m*=1.12;return m},
 hit:(e,t,w)=>{if(w.rev)e.rev=Math.max(e.rev||0,w.rev);if(w.mark){t.mkBy=e;t.mkT=(T||0)+3}if(w.steady){e.gst=((e.gT||0)>(T||0)?(e.gst||0):0)+1;e.gT=(T||0)+2.2}},
 spr:(e,w)=>w.steady&&(e.gT||0)>(T||0)?Math.max(.3,1-.14*(e.gst||0)):1};
})();
