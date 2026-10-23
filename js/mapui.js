/* "Choose your map" page of the fighter menu: one card per arena with a top-down picture drawn from the real map data, plus a Random card. */
(()=>{
const host=document.getElementById('pga');if(!host||!window.MAPS)return;
if(MAPS.by[MAPS.pickId]&&(MAPS.by[MAPS.pickId].hide||MAPS.by[MAPS.pickId].tour)&&!window.__TOWNOK)MAPS.set('random'); // (Brick Town and Spookstone Keep were removed from the choices: a saved pick of one of them becomes Random)
const ORDER=['pond','docks','trolls','nyan','stonks','backbrick','pork','worksite','castle'];
// colour of the cells that are not floor (water, sky, canal) and a few chips per map
const VC={castle:'#2f7fc0',docks:'#2a78c8',stonks:'#17222c',backbrick:'#2a2410',nyan:'#a9dcff',trolls:'#16303c',pond:'#1d4a3c',pork:'#2a2540',worksite:'#4a4c4f',colosseum:'#6b4a2a',rift:'#1a0f33',town:'#4a9a3a',spook:'#0c1424'};
const CH={castle:['Moat & bridges','Day to sunset'],backbrick:['Indoor maze','Flickering lights'],docks:['Canals & cranes','Day to dusk'],stonks:['Skybridges','Neon dusk'],nyan:['Launch pads','Sky islands'],trolls:['Chokepoint bridge','Stormy dusk'],pond:['Boardwalks','Shrine high ground'],pork:['Teleporter pads','Neon dusk'],worksite:['Catwalks & pit','Rainy dusk'],town:['Open streets','Classic'],spook:['Night keep','Graveyard fence']};
const hex=c=>'#'+('000000'+(c|0).toString(16)).slice(-6);
const sc={};
function cell(d,x,z){let ch=d.grid[Math.min(14,Math.floor(Math.abs(z)/2))][Math.min(14,Math.floor(Math.abs(x)/2))];if(d.fix)ch=d.fix(x,z,ch)||ch;return ch}
function tileCol(d,ch,x,z){const t=d.tiles&&d.tiles[ch];if(!t)return null;const c=typeof t.c==='function'?t.c(x,z):t.c;return hex(c)}
function thumb(id,px){
 const key=id+'@'+px;if(sc[key])return sc[key];
 const cv=document.createElement('canvas');cv.width=cv.height=px;const g=cv.getContext('2d'),k=px/62,X=x=>(x+31)*k,Z=z=>(z+31)*k;
 const d=MAPS.by[id];g.fillStyle=VC[id]||'#335';g.fillRect(0,0,px,px);
 if(d&&d.grid){
  for(let j=0;j<30;j++)for(let i=0;i<30;i++){const x=i*2-29,z=j*2-29,ch=cell(d,x,z),c=tileCol(d,ch,x,z);if(!c)continue;g.fillStyle=c;g.fillRect(X(x-1),Z(z-1),2*k+.6,2*k+.6)}
 }else{g.fillStyle='#58b04a';g.fillRect(X(-30),Z(-30),60*k,60*k)}
 const bs=id==='town'?(window.TOWN?TOWN.b:[]):MAPS.dryBoxes(id);
 for(const b of bs){if(b.nb||!(b.h>0))continue;const w=b.x2-b.x1,h=b.z2-b.z1;if(w>=58&&h<=2)continue; // skip the arena frame
  const lo=b.h<1.3,hi=b.h>=4;g.fillStyle=b.y0?'rgba(230,235,245,.5)':lo?'rgba(255,255,255,.55)':hi?'#5b6070':'#8e93a2';g.fillRect(X(b.x1),Z(b.z1),Math.max(1,w*k),Math.max(1,h*k));
  if(!lo&&!b.y0){g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1;g.strokeRect(X(b.x1)+.5,Z(b.z1)+.5,Math.max(1,w*k-1),Math.max(1,h*k-1))}}
 // the two spawn points
 for(const[x,c]of[[-22,'#3d9bff'],[22,'#ff4a4a']]){g.beginPath();g.arc(X(x),Z(0),Math.max(3,k*1.6),0,7);g.fillStyle=c;g.fill();g.lineWidth=2;g.strokeStyle='#fff';g.stroke()}
 // storm ring (where the first circle starts)
 g.setLineDash([4,4]);g.strokeStyle='rgba(255,60,60,.7)';g.lineWidth=2;g.beginPath();g.arc(px/2,px/2,46*k,0,7);g.stroke();g.setLineDash([]);
 return sc[key]=cv}
// the Random card is drawn in the same style as the card pictures: gold frame, name banner, a fan of the real card pictures and a big question mark
function randomArt(){const W=264,H=392,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const draw=()=>{g.clearRect(0,0,W,H);const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2f5c');bg.addColorStop(1,'#0a1630');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const ids=ORDER.filter(i=>MAPS.by[i]&&imgs[i]&&imgs[i].complete&&imgs[i].naturalWidth).slice(0,6);
  ids.forEach((id,n)=>{const w=76,h=112,x=14+(n%3)*79,y=70+Math.floor(n/3)*118;g.save();g.translate(x+w/2,y+h/2);g.rotate(((n%3)-1)*.06+(n>2?.03:-.03));g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=8;g.drawImage(imgs[id],-w/2,-h/2,w,h);g.restore()});
  g.fillStyle='rgba(8,16,40,.55)';g.fillRect(0,70,W,236);
  g.textAlign='center';g.lineJoin='round';g.font='bold 120px "Poppins",sans-serif';g.lineWidth=10;g.strokeStyle='#2a1a00';g.strokeText('?',W/2,258);g.fillStyle='#ffd02f';g.fillText('?',W/2,258);
  g.fillStyle='#0d1c3a';g.fillRect(8,8,W-16,52);g.strokeStyle='#e3b92a';g.lineWidth=2;g.strokeRect(8,8,W-16,52);
  g.font='bold 30px "Poppins",sans-serif';g.lineWidth=6;g.strokeStyle='#2a1a00';g.strokeText('Random Map',W/2+10,46);g.fillStyle='#ffd02f';g.fillText('Random Map',W/2+10,46);
  crown(g,34,34,.9);
  g.fillStyle='#0d1c3a';g.fillRect(8,H-58,W-16,50);g.strokeStyle='#e3b92a';g.strokeRect(8,H-58,W-16,50);
  ['ALL MAPS','STORM','FATE'].forEach((t,i)=>{g.font='bold 12px "Poppins",sans-serif';g.fillStyle='#cfe6ff';g.fillText(t,50+i*82,H-28)});
  g.lineWidth=5;g.strokeStyle='#e3b92a';rr(g,2.5,2.5,W-5,H-5,14);g.stroke()};
 draw();Object.keys(imgs).forEach(k=>{if(!imgs[k].complete)imgs[k].addEventListener('load',draw)});return cv}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function crown(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#ffd02f';g.strokeStyle='#2a1a00';g.lineWidth=2;g.beginPath();g.moveTo(-14,10);g.lineTo(-16,-8);g.lineTo(-7,0);g.lineTo(0,-12);g.lineTo(7,0);g.lineTo(16,-8);g.lineTo(14,10);g.closePath();g.fill();g.stroke();g.restore()}
// card pictures (js/mapcards.js); a map without one falls back to a top-down picture drawn from its real map data
const imgs={};
function cardImg(id){if(imgs[id])return imgs[id];const u=window.MAPCARDS&&MAPCARDS[id];if(!u)return null;const im=new Image();im.decoding='async';im.src=u;return imgs[id]=im}
function card(id){
 const b=document.createElement('button');b.type='button';b.className='mpc';b.dataset.m=id;
 const rnd=id==='random',d=MAPS.by[id];
 const art=document.createElement('div');art.className='mpt';
 const pic=rnd?null:cardImg(id);
 if(pic){const im=document.createElement('img');im.className='mpi';im.alt=d.name;im.draggable=false;im.src=pic.src;art.appendChild(im)}
 else if(rnd){const cv=randomArt();cv.className='mpr';art.appendChild(cv)}
 else{const cv=thumb(id,240);const c2=document.createElement('canvas');c2.width=cv.width;c2.height=cv.height;c2.getContext('2d').drawImage(cv,0,0);art.appendChild(c2);const th=d.th||['#3d9bff','#1a447d'];art.style.setProperty('--m1',th[0]);art.style.setProperty('--m2',th[1])}
 b.appendChild(art);
 const nm=document.createElement('b');nm.className='mpn';nm.textContent=rnd?'Random map':d.name;b.appendChild(nm);
 const tg=document.createElement('em');tg.className='mpg2';tg.textContent=rnd?'A different arena every match':d.tag;b.appendChild(tg);
 const bl=document.createElement('p');bl.className='mpb';bl.textContent=rnd?'Let fate decide: every match picks one of the arenas.':d.blurb;b.appendChild(bl);
 const ch=document.createElement('div');ch.className='mpk';(rnd?['All maps','Storm on every map']:(CH[id]||[]).concat(['Storm circle'])).forEach(t=>{const s=document.createElement('span');s.textContent=t;ch.appendChild(s)});b.appendChild(ch);
 const sel=document.createElement('u');sel.className='mps';sel.textContent='SELECTED';b.appendChild(sel);
 b.onclick=()=>{MAPS.set(id);if(window.PICK)PICK.a=1;mark();try{window.UIpick&&UIpick()}catch(e){}};return b}
let built=false;
function cur(){if(window.PICK&&!PICK.a)return '';const p=MAPS.pickId;return p&&MAPS.by[p]?p:'random'}
function mark(){[...host.querySelectorAll('.mpc')].forEach(b=>b.classList.toggle('sel',b.dataset.m===cur()));const n=document.getElementById('mpsum');if(n){const id=cur();n.innerHTML=!id?'Map: <b class="lowarn">not picked yet</b> <small>Choose an arena above, or Random.</small>':id==='random'?'Map: Random <small>Every match picks one of the arenas.</small>':'Map: '+MAPS.by[id].name+' <small>'+(MAPS.by[id].blurb||'')+'</small>'}}
function build(){
 if(built)return;built=true;host.innerHTML='<div class="mph"><h3>Choose your arena</h3><p>Pick the battleground. Every arena has the shrinking storm, and Random lets fate decide.</p></div><div class="mpgrid" id="mpgrid"></div><div class="mpsum" id="mpsum"></div>';
 ORDER.forEach(cardImg);const grid=document.getElementById('mpgrid');grid.appendChild(card('random'));ORDER.filter(i=>MAPS.by[i]).forEach(id=>grid.appendChild(card(id)));
 MAPS.list.filter(m=>m.grid&&!m.tour&&!m.hide&&!ORDER.includes(m.id)).forEach(m=>grid.appendChild(card(m.id)));mark()}
window.UImap={show(){build();mark()},thumb,order:()=>ORDER.slice(),built:()=>built};
})();
