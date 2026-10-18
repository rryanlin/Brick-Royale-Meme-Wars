/* Roster details: rarity, ability names, back bling and signature weapons for each fighter. */
(()=>{
window.STATS={pepe:[100,9,1.2,0],wojak:[110,9,.9,0],foreman:[120,8.5,.9,0],jester:[100,9.5,1,0],general:[100,9,1,0],nyan:[90,11.5,.85,0],podcast:[100,9,.9,0],trader:[100,9,.85,40],giga:[130,8,1,0],doge:[100,9.5,.9,0]};
const RB=[0xff0000,0xff9900,0xffee00,0x33dd33,0x3399ff,0x9933ff];
const R={
 pepe:['common','Alone and Dangerous','Hits 20% harder.','Meme Backpack','rifle',f=>{f(B(.7,.8,.35),0x3aa655,0,1.3,.45);f(B(.5,.3,.1),0x2d7a41,0,1.1,.64)}],
 nyan:['epic','Rainbow Boost','Fastest fighter and leaves a rainbow trail, but hits softer and has less health.','Rainbow Flag','smg',f=>RB.forEach((c,i)=>f(B(.8,.12,.15),c,0,1.7-i*.14,.4))],
 jester:['rare','Random Effect','20% of your hits deal double damage.','Chaos Box','burst',f=>{f(B(.6,.6,.6),0x8b5a2b,0,1.3,.5);f(B(.2,.2,.05),0xffd02f,0,1.3,.82)}],
 giga:['legend','Chad Energy','130 max health and a much harder hammer, but slower.','Gym Bag','pistol',f=>{f(B(.9,.45,.4),0x222222,0,1.2,.45);f(B(.5,.1,.1),0x888888,0,1.5,.45)}],
 wojak:['common','Resilience','Slowly regenerates health, 110 max health, hits a little softer.','Hoodie Pack','pistol',f=>f(B(.7,.8,.35),0x777777,0,1.3,.45)],
 doge:['legend','Luck Boost','Rarer loot from bags, health and shield pickups give both, a bit faster, hits a little softer.','Lucky Coin','smg',f=>{f(new THREE.CylinderGeometry(.35,.35,.1,14),0xffc400,0,1.4,.5).rotation.x=Math.PI/2}],
 general:['epic','Airstrike','Calls rockets down on the enemy.','Field Pack','rpg',f=>f(B(.8,.7,.4),0x4b5a2a,0,1.3,.45)],
 foreman:['uncommon','Hard Hat','Throws up a temporary shield. 120 health, a bit slower, hits a little softer.','Toolbox','shotgun',f=>{f(B(.7,.5,.3),0xe3000b,0,1.2,.42)}],
 podcast:['rare','Deep Talk','Reveals the enemy through walls, but hits softer.','Laptop','burst',f=>f(B(.8,.55,.1),0x555555,0,1.4,.4)],
 trader:['epic','Venture Mindset','Starts every round with 40 armor, but hits much softer.','Investor Pack','tac',f=>{f(B(.7,.7,.3),0x1f3a5f,0,1.3,.45);f(B(.4,.2,.05),0x2e9b3a,0,1.4,.62)}]};
for(const id in R){const[r,an,ad,bn,sw,b]=R[id];Object.assign(LOOK[id],{r,an,ad,bn,sw,b})}
skin(P,P.id);skin(E,E.id);wsel=LOOK[csel].sw;
})();
