/* Four more guns from the Weapon Skin Concepts sheet, one for each group on the weapon page:
     Breacher Shotgun (short range), Brick DMR (mid range), Huntsman Rifle (long range), Auto Pistol (secondary).
   Each is a full weapon of its own (own LEGO model, own level and XP, own card), and it is held, aimed, scoped and sounds like its class (shotgun / rifle / sniper / pistol),
   exactly like a signature gun: the weapon object keeps the class as its id and carries the gun's own id in w.sig (see levels.js weapon()).
   Loaded after sigs.js (needs GUN, WP, GUNK from arsenal.js) and before levels.js, which builds the stats from XW.st.
   Models use the same LEGO parts as the other guns (see arsenal.js): op 'b' rounded brick, 'c' barrel cylinder, 'k' cone, 's' stud row, plus 'x' / 'y' cylinders for side studs, shells and knobs.
   API: XW[id] = {id,cls,n,tag,fx,st,grp,fire}, XW.ids, XW.fx (per-gun muzzle / tracer / bloom / zoom tuning read by bullets.js and aim.js) */
(()=>{
const GUN=window.GUN,{BLK,DGY,GRY,TG}=window.GUNK;
const RED=0xe3000b,REDD=0xa80008,GOLD=0xe3b92a,GOLDL=0xffd34a,WHITE=0xf2f2f2,BLUE=0x1f5fd0,BLUED=0x143f9a,BLUEL=0x3a8cff,WOOD=0xa84f16,WOODD=0x6f3209,WOODL=0xc86a26,STEEL=0xaab0b8,BODY=0x1b1d20,PLATE=0x2c3036;
// ---- shared LEGO details
// round studs on both sides of the gun (x across): n studs from z0 stepping dz at height y, sitting on a flat of half-width hw
const SIDEST=(n,y,z0,dz,hw,c,r=.014)=>{const o=[];for(let i=0;i<n;i++)for(const s of[-1,1])o.push(['x',r,.016,s*(hw+.007),y,z0+i*dz,c]);return o};
// the Brick Royale crown on both sides of a gun (x = half-width of the flat it sits on), k = size
const CROWN=(hw,y,z,k,c)=>{const o=[];for(const s of[-1,1]){const x=s*(hw+.006);
 o.push(['b',.014,.022*k,.1*k,x,y,z,c,'m'],['b',.014,.05*k,.022*k,x,y+.034*k,z-.036*k,c,'m'],['b',.014,.066*k,.022*k,x,y+.042*k,z,c,'m'],['b',.014,.05*k,.022*k,x,y+.034*k,z+.036*k,c,'m'],
  ['b',.016,.014*k,.014*k,x,y+.08*k,z,0xff3b3b],['b',.016,.012*k,.012*k,x,y+.064*k,z-.036*k,0x35b6ff],['b',.016,.012*k,.012*k,x,y+.064*k,z+.036*k,0x35b6ff])}return o};
// ribs: thin dark ridges across a grip or slide
const RIBS=(n,w,h,y0,dy,z,c,rx)=>{const o=[];for(let i=0;i<n;i++)o.push(['b',w,.012,h,0,y0+i*dy,z,c,'p',rx||0]);return o};
const TRG=(y,z)=>[['b',.022,.022,.2,0,y,z+.02,BLK],['b',.022,.1,.022,0,y+.05,z-.08,BLK],['b',.02,.05,.026,0,y+.035,z+.04,RED,'p']]; // trigger guard with a red trigger

const DEF={
// ======================================================================= Breacher Shotgun (short range, shotgun class)
breacher:{cls:'shotgun',grp:'Short range',n:'Breacher Shotgun',tag:'Small spaces. Big problems.',
 fx:'Semi-automatic and wide: eight pellets a blast, fired much faster than the pump, but they spread wide and die out at close range.',
 st:{dmg:8.6,pel:8,rate:.64,spr:.13,mag:5,rl:2.2,life:.3,br:4,spd:55},
 fire:{muz:1.17,tr:[.4,.011,0xffb06a],bk:null},
 ops:[
  // receiver, top cover with studs, ejection port, side plates
  ['b',.15,.2,.74,0,0,-.04,BODY],['b',.13,.04,.64,0,.13,-.06,BLK],['s',7,0,.152,-.36,.085,BLK],['b',.154,.07,.2,0,.045,.08,0x050505],['b',.158,.12,.26,0,-.02,-.21,0x3a3f45,'m'],
  ['b',.158,.1,.14,0,-.005,.2,RED],...CROWN(.079,-.005,.2,1.05,GOLDL),...SIDEST(5,.075,-.3,.115,.075,0x3a3f45),
  // side saddle: three red shells with brass bases
  ['b',.04,.17,.38,.102,0,-.2,DGY],
  ...[0,1,2].flatMap(i=>{const z=-.34+i*.11;return[['y',.03,.115,.138,.0,z,RED],['y',.032,.03,.138,-.07,z,GOLD,'m'],['y',.026,.014,.138,.062,z,REDD]]}),
  ['b',.012,.014,.36,.126,.09,-.2,GRY,'m'],['b',.012,.014,.36,.126,-.09,-.2,GRY,'m'],
  // barrel and magazine tube
  ['c',.04,.5,0,.035,-.62,0x16181a,'m'],['c',.034,.5,0,-.06,-.62,0x2a2d31,'m'],
  // vented handguard, heat shield, vertical grip
  ['b',.157,.15,.38,0,.0,-.57,0x24272b],...[-.45,-.53,-.61,-.69].map(z=>['b',.162,.05,.04,0,.01,z,0x050505]),['b',.1,.03,.36,0,.09,-.57,PLATE],['s',3,0,.118,-.47,-.1,PLATE],
  ['b',.07,.2,.085,0,-.155,-.57,BODY],...RIBS(4,.076,.092,-.2,.035,-.57,PLATE),
  // red breacher muzzle: collar, drum, slots, bore
  ['c',.092,.03,0,.025,-.88,BODY,'m'],['c',.088,.26,0,.025,-1.0,RED],['c',.092,.03,0,.025,-1.14,BODY,'m'],['c',.05,.012,0,.025,-1.152,0x000000],['c',.062,.02,0,.025,-1.135,0x050505],
  ['b',.045,.026,.15,0,.11,-1.0,0x1a0000],['b',.045,.026,.15,0,-.06,-1.0,0x1a0000],['b',.026,.045,.15,.086,.025,-1.0,0x1a0000],['b',.026,.045,.15,-.086,.025,-1.0,0x1a0000],
  ['b',.03,.03,.15,.062,.087,-1.0,0x1a0000],['b',.03,.03,.15,-.062,.087,-1.0,0x1a0000],['b',.03,.03,.15,.062,-.037,-1.0,0x1a0000],['b',.03,.03,.15,-.062,-.037,-1.0,0x1a0000],
  // sights
  ['b',.035,.075,.04,0,.14,-.92,RED],['b',.07,.05,.05,0,.17,.14,BLK],['b',.014,.034,.014,.02,.2,.14,RED],['b',.014,.034,.014,-.02,.2,.14,RED],
  // pistol grip, trigger
  ['b',.09,.27,.115,0,-.22,.14,BODY,'p',.25],...RIBS(5,.094,.12,-.13,.04,.14,PLATE,.25),...TRG(-.12,.0),
  // skeleton stock with rivets and a rubber pad
  ['b',.11,.2,.46,0,-.03,.5,BODY],['b',.07,.06,.42,0,.08,.5,PLATE],['b',.118,.07,.12,0,-.02,.44,0x050505],['b',.118,.07,.12,0,-.02,.62,0x050505],['b',.12,.26,.08,0,-.03,.77,0x0d0d0d],
  ...SIDEST(3,.04,.36,.14,.055,0x888888,.011)]},

// ======================================================================= Brick DMR (mid range, rifle class)
dmr:{cls:'rifle',grp:'Mid range',n:'Brick DMR',tag:'Precision built. Memes at a distance.',
 fx:'Semi-automatic marksman rifle: every pull of the trigger is one accurate, hard-hitting shot. Zooms in tight when aimed.',
 st:{dmg:22,pel:1,rate:.38,spr:.004,mag:12,rl:1.8,life:1.4,br:18,spd:115,auto:0},
 fire:{muz:1.62,tr:[1.8,.017,0x9fd0ff],bk:{add:.2,rec:2.4,min:.25,max:1.4,mv:.5},zoom:34},
 ops:[
  // black upper and blue lower receiver, rail with studs, ejection port, charging handle
  ['b',.15,.19,.64,0,0,-.05,0x1a1c1f],['b',.156,.1,.5,0,-.07,.0,BLUE],['b',.1,.04,.92,0,.115,-.2,BLK],['s',9,0,.142,-.6,.1,BLK],['b',.156,.06,.16,0,.03,.0,0x050505],['b',.03,.03,.1,.08,.04,.16,GRY,'m'],
  ...CROWN(.077,-.07,-.03,1.15,WHITE),...SIDEST(4,.04,-.28,.1,.075,BLUED),
  // blue handguard with black rails and side studs
  ['b',.145,.155,.62,0,-.01,-.64,BLUE],['b',.148,.04,.52,0,.045,-.67,BLK],['b',.148,.04,.52,0,-.065,-.67,BLK],...SIDEST(5,-.01,-.44,-.11,.0725,BLUED),['s',5,0,.092,-.44,-.11,BLK],
  // long barrel, gas block, muzzle brake
  ['c',.028,.52,0,0,-1.18,STEEL,'m'],['b',.05,.06,.08,0,.03,-.86,BLK],['c',.052,.18,0,0,-1.5,BLK,'m'],['b',.058,.03,.03,0,.0,-1.46,0x050505],['b',.058,.03,.03,0,.0,-1.54,0x050505],['c',.04,.012,0,0,-1.598,0x000000],
  // stock with a cheek riser and crown panels
  ['b',.11,.22,.5,0,-.03,.46,BLUE],['b',.1,.05,.32,0,.1,.44,BLK],['s',3,0,.134,.34,.1,BLK],['b',.12,.27,.07,0,-.03,.76,0x111111],...CROWN(.055,-.03,.46,1.25,WHITE),...SIDEST(3,-.1,.34,.12,.055,BLUED,.012),
  // magazine with a blue base plate, grip, trigger guard
  ['b',.09,.28,.15,0,-.25,-.2,BLK,'p',.12],['b',.09,.04,.16,0,-.41,-.18,BLUE,'p',.12],['b',.09,.26,.11,0,-.22,.12,BLK,'p',.25],...RIBS(4,.094,.11,-.15,.04,.12,PLATE,.25),...TG(-.125,-.02),
  // tactical optic: blue body with a crown, black ends, glass, turrets
  ['b',.07,.09,.1,0,.165,-.14,BLK],['b',.07,.09,.1,0,.165,.14,BLK],['c',.048,.7,0,.225,-.02,BLK,'m'],['c',.066,.24,0,.225,-.0,BLUE,'m'],['c',.082,.2,0,.225,-.42,BLUE,'m'],['c',.088,.04,0,.225,-.53,BLK,'m'],['c',.078,.012,0,.225,-.545,BLUEL,'t'],
  ['c',.062,.12,0,.225,.36,BLK,'m'],['c',.068,.04,0,.225,.44,0x111111],['y',.03,.05,0,.305,-.0,STEEL,'m'],['x',.03,.05,.09,.225,-.0,STEEL,'m'],...CROWN(.067,.225,-.02,.95,WHITE)]},

// ======================================================================= Huntsman Rifle (long range, sniper class)
huntsman:{cls:'sniper',grp:'Long range',n:'Huntsman Rifle',tag:'One shot. A legend follows.',
 fx:'Bolt-action hunting rifle: slow, but three rounds, a long reload, and each round hits harder than the Sniper Rifle. Hold still for the best accuracy.',
 st:{dmg:80,pel:1,rate:1.55,spr:0,mag:3,rl:3.8,life:1.6,br:26,spd:150},
 fire:{muz:1.68,tr:[3.6,.026,0xffd9a0],zoom:20},
 ops:[
  // black receiver with a steel bolt and a brass knob
  ['b',.12,.17,.62,0,.0,-.15,BLK],['b',.08,.05,.5,0,.11,-.12,PLATE,'m'],['b',.124,.09,.16,0,.02,-.12,0x050505],['x',.012,.14,.112,.044,.045,.12,STEEL,'m'],['y',.026,.06,.178,.045,.12,GOLD,'m'],['b',.03,.04,.1,.05,.07,.03,STEEL,'m'],
  // wooden forestock: brick seams and side studs
  ['b',.115,.14,.85,0,-.04,-.72,WOOD],...[-.45,-.65,-.85,-1.05].map(z=>['b',.126,.145,.012,0,-.04,z,WOODD]),...SIDEST(8,-.04,-.4,-.1,.0575,WOODL),['s',7,0,.045,-.4,-.115,WOODL],
  // barrel with a brass band and crown ring
  ['c',.03,1.22,0,.02,-1.0,0x2a2d31,'m'],['c',.04,.05,0,.02,-1.12,GOLD,'m'],['c',.046,.08,0,.02,-1.6,GOLD,'m'],['c',.03,.012,0,.02,-1.644,0x000000],['b',.012,.03,.012,0,.065,-1.58,STEEL,'m'],
  // wrist, comb, long butt with a gold crown plate, rubber pad
  ['b',.09,.26,.11,0,-.22,.1,WOOD,'p',.22],['b',.11,.2,.4,0,-.04,.36,WOOD],['b',.1,.08,.42,0,.095,.5,WOOD],['b',.115,.26,.44,0,-.05,.7,WOOD],['b',.119,.012,.1,0,-.05,.5,WOODD],['b',.119,.012,.1,0,-.05,.7,WOODD],['s',5,0,.139,.34,.1,WOODL],
  ['b',.125,.3,.07,0,-.06,.96,0x16181a],...CROWN(.0575,-.04,.68,1.7,GOLDL),...SIDEST(3,.06,.38,.11,.055,WOODL,.012),
  // magazine box, trigger guard
  ['b',.08,.1,.2,0,-.13,-.18,WOODD],['b',.09,.04,.2,0,-.12,-.12,BLK],...TG(-.115,-.02),
  // long scope on two mounts: tube, objective bell with a brass ring, glass, eyepiece and turrets
  ['b',.05,.06,.08,0,.16,-.42],['b',.05,.06,.08,0,.16,.08],['c',.04,.9,0,.19,-.17,BLK,'m'],['c',.056,.22,0,.19,-.64,BLK,'m'],['c',.059,.03,0,.19,-.52,GOLD,'m'],['c',.05,.012,0,.19,-.754,BLUEL,'t'],['c',.05,.12,0,.19,.33,BLK,'m'],['y',.024,.05,0,.24,-.15,GOLD,'m'],['x',.024,.05,.06,.19,-.15,GOLD,'m']]},

// ======================================================================= Auto Pistol (secondary, pistol class)
autopistol:{cls:'pistol',grp:'Secondary',n:'Auto Pistol',tag:'Fast. Reliable. Always a backup plan.',
 fx:'A fully automatic machine pistol: a fast stream of light shots with a long magazine. Best at close and medium range.',
 st:{dmg:6.2,pel:1,rate:.095,spr:.035,mag:20,rl:1.2,life:.8,br:8,spd:68,auto:1},
 fire:{muz:.56,tr:[.8,.013,0xffdc8a],bk:{add:.09,rec:2.8,min:.4,max:2.1,mv:.15}},
 ops:[
  // aggressive slide: serrations, top vents, ejection port, crown
  ['b',.125,.13,.54,0,.085,-.1,0x15171a],...[0,1,2,3,4].map(i=>['b',.13,.11,.012,0,.085,.052+i*.024,PLATE]),...[0,1,2].map(i=>['b',.09,.02,.06,0,.15,-.12-i*.085,0x000000]),['b',.128,.05,.12,0,.1,-.02,0x000000],
  ...CROWN(.0625,.085,-.17,1.25,WHITE),['b',.115,.08,.1,0,.09,-.36,0x15171a],['s',4,0,.164,-.28,.07,0x15171a],
  // frame with an accessory rail
  ['b',.11,.07,.46,0,0,-.07,PLATE],['b',.09,.02,.2,0,-.04,-.25,0x0a0a0a],['s',3,0,-.065,-.2,-.07,0x0a0a0a],
  // compensator with ports and a dark bore
  ['b',.1,.1,.16,0,.085,-.47,0x0a0a0a],...[0,1,2].map(i=>['b',.062,.02,.034,0,.14,-.42-i*.045,0x15171a]),...SIDEST(3,.085,-.43,-.04,.05,0x15171a,.011),['c',.022,.01,0,.085,-.555,0x000000],
  // grip with studs, extended magazine
  ['b',.1,.28,.14,0,-.16,.1,0x1c1e21,'p',.2],...SIDEST(3,-.1,.06,.06,.05,PLATE,.013),...SIDEST(3,-.17,.05,.06,.05,PLATE,.013),['b',.105,.05,.15,0,-.315,.075,0x3a3f45,'p',.2],
  // trigger, guard, selector, sights
  ['b',.02,.045,.02,0,-.04,.0,RED,'p'],['b',.02,.02,.14,0,-.075,-.05,BLK],['b',.02,.07,.02,0,-.035,-.12,BLK],['x',.012,.03,.067,.03,.03,0xcccccc,'m'],
  ['b',.07,.04,.03,0,.17,.15,BLK],['b',.012,.022,.012,.02,.19,.15,RED],['b',.012,.022,.012,-.02,.19,.15,RED],['b',.022,.04,.022,0,.17,-.34,BLK]]}
};
const XW=window.XW={ids:Object.keys(DEF),fx:{}};
XW.ids.forEach(id=>{const d=DEF[id];XW[id]=Object.assign({id},d);GUN[id]=d.ops;XW.fx[id]=d.fire||{};WP[id]={id,n:d.n,cls:d.cls}});
})();
