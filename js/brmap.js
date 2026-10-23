/* Battle Royale maps (round 26): a picture of the whole big arena, drawn from the bricks that are really in it, used three ways.
   - the DROP ZONE screen shown when a match loads: click the map to choose where you land (the other 19 land at random);
   - the minimap in the top right corner of the screen: you, the storm circle and the loot that fallen fighters left behind;
   - the big map: hold TAB to see the whole arena.
   API: BRMAP.build() draws the picture of the current world, BRMAP.pick(cb) opens the drop zone screen and calls cb(x,z), BRMAP.tick(dt) redraws the minimap,
        BRMAP.hide() removes everything again, BRMAP.select(x,z) / BRMAP.confirm() are what a click and the DROP IN button do (the tests use them). */
(()=>{
const SZ=1280;                                   // size of the picture, in pixels
let base=null,half=90,ok=null,sel=null,pickCb=null,timer=0,left=0,tcount=null,bigOn=false,acc=0;
const el=(t,id,html,par)=>{const d=document.createElement(t);if(id)d.id=id;if(html!=null)d.innerHTML=html;(par||document.body).appendChild(d);return d};
const css=c=>'#'+(c&0xffffff).toString(16).padStart(6,'0');
// ---------- the picture of the world, seen from above (low things first, tall things painted over them)
function render(){const W=MAPS.world&&MAPS.world();half=W?W.half:30;const sc=SZ/(2*half),c=document.createElement('canvas');c.width=c.height=SZ;const g=c.getContext('2d');
 g.fillStyle=W&&W.bg?W.bg:W&&W.town?'#2e7d3a':'#1a2230';g.fillRect(0,0,SZ,SZ);
 const X=x=>(x+half)*sc,Z=z=>(z+half)*sc;
 // a LEGO baseplate: a faint stud every 2 m
 g.fillStyle='rgba(255,255,255,.10)';for(let a=1;a<half;a+=2)for(let b=1;b<half;b+=2)for(const [u,v] of [[a,b],[-a,b],[a,-b],[-a,-b]]){g.beginPath();g.arc(X(u),Z(v),sc*.55,0,6.2832);g.fill()}
 const items=[]; // [top, shape, colour, x, z, sx, sz, ry]
 const ins=(MAPS.instances&&MAPS.instances())||[];
 for(const gp of ins){const a=gp.a,k=gp.k,mt=gp.mt||'';if(k==='s'||mt[0]==='t')continue;
  for(let j=0;j<a.length;j+=7){const y=a[j+1],sx=a[j+3],sy=a[j+4],sz=a[j+5],top=y+(k==='o'?sx:sy/2);
   if(top<-.1||y-sy/2>30||sx>120||sz>120||(sx>=40&&sz>=40&&sy<1&&y>3))continue; // (huge flat ceilings of indoor maps would hide the whole picture)
   items.push([top,k==='b'?0:1,gp.c,a[j],a[j+2],sx,sz,a[j+6]])}}
 if(!items.length){ // the town (and tests with no bricks): the real boxes of the town, or its colliders
  let n=0;
  try{for(const t of(MAPS.worldObjs?MAPS.worldObjs():[])){t.traverse(o=>{const gm=o.geometry;if(!o.isMesh||o.isInstancedMesh||!gm||!gm.parameters||gm.type!=='BoxGeometry'||!o.material||!o.material.color)return;
     const p=gm.parameters;if(p.width>100||p.depth>100)return;o.updateWorldMatrix(true,false);const e=o.matrixWorld.elements,top=e[13]+p.height/2*Math.hypot(e[4],e[5],e[6]);
     if(top<.05||e[13]-p.height/2>30)return;const sx=p.width*Math.hypot(e[0],e[1],e[2]),sz=p.depth*Math.hypot(e[8],e[9],e[10]);items.push([top,0,o.material.color.getHex(),e[12],e[14],sx,sz,Math.atan2(-e[8],e[10])]);n++})}}catch(e){}
  if(!n)for(const b of boxes){if(b.nb||b.h<.3||(b.y0||0)>3)continue;const t=Math.min(1,b.h/8);items.push([b.h,0,((90+t*80)<<16)|((80+t*30)<<8)|(70-t*20),(b.x1+b.x2)/2,(b.z1+b.z2)/2,b.x2-b.x1,b.z2-b.z1,0])}}
 const ord=items.map((_,i)=>i).sort((p,q)=>items[p][0]-items[q][0]),tint={};
 // soft shadows first (taller things throw a longer one, down and to the right), so buildings stand up off the ground
 g.fillStyle='rgba(0,0,0,.22)';
 for(const i of ord){const[top,sh,col,x,z,sx,sz,ry]=items[i];if(top<1.2)continue;const d=Math.min(top,14)*.32,ox=X(x)+d*sc,oz=Z(z)+d*sc;
  if(sh){g.beginPath();g.arc(ox,oz,Math.max(.5,sx*sc)*1.05,0,6.2832);g.fill();continue}
  g.save();g.translate(ox,oz);g.rotate(-ry);g.fillRect(-sx*sc/2,-sz*sc/2,Math.max(sx*sc,1),Math.max(sz*sc,1));g.restore()}
 g.lineJoin='round';
 for(const i of ord){const[top,sh,col,x,z,sx,sz,ry]=items[i];let c2=tint[col];
  if(!c2)c2=tint[col]=css(col);g.fillStyle=c2;
  // lighter the higher it is, so roofs read as roofs
  const lift=Math.min(.28,top/60);
  if(sh){const r=Math.max(.5,sx*sc);g.beginPath();g.arc(X(x),Z(z),r,0,6.2832);g.fill();g.fillStyle='rgba(255,255,255,'+lift+')';g.fill();if(r>3){g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.2;g.stroke()}continue}
  g.save();g.translate(X(x),Z(z));g.rotate(-ry);const w=Math.max(sx*sc,1),h=Math.max(sz*sc,1);
  g.fillRect(-w/2,-h/2,w,h);if(lift>.02){g.fillStyle='rgba(255,255,255,'+lift+')';g.fillRect(-w/2,-h/2,w,h)}
  if(w>5&&h>5){g.strokeStyle='rgba(0,0,0,.34)';g.lineWidth=1.3;g.strokeRect(-w/2,-h/2,w,h)}g.restore()}
 // soften it a little so it reads like a map, not a screenshot
 {const v=g.createRadialGradient(SZ/2,SZ/2,SZ*.38,SZ/2,SZ/2,SZ*.75);v.addColorStop(0,'rgba(8,14,26,0)');v.addColorStop(1,'rgba(8,14,26,.28)');g.fillStyle=v;g.fillRect(0,0,SZ,SZ)}
 base=c;return c}
// ---------- one drawing routine for the minimap, the big map and the drop zone screen
const LCOL={gun:'#ffd02f',mel:'#ff8a1f',item:'#7df9ff',h:'#4cff6a',s:'#4aa0ff'};
function paint(cv,o){o=o||{};const g=cv.getContext('2d'),S=cv.width,k=S/SZ;if(!base)return;
 const v=o.view||{x:0,y:0,w:SZ},f=S/v.w,bsc=SZ/(2*half);
 g.clearRect(0,0,S,S);g.drawImage(base,v.x,v.y,v.w,v.w,0,0,S,S);
 const sc=bsc*f,X=x=>((x+half)*bsc-v.x)*f,Z=z=>((z+half)*bsc-v.y)*f;
 // map grid: faint dotted lines and small letters / numbers along the edges (A-C across, 1-3 down), like a real map
 if(o.grid){const n=half>40?3:1,fs=Math.max(10,Math.round(S/44));g.save();g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=Math.max(1,S/700);g.setLineDash([3,7]);
  for(let i=1;i<n;i++){const p=i*2*half/n-half;g.beginPath();g.moveTo(X(p),0);g.lineTo(X(p),S);g.moveTo(0,Z(p));g.lineTo(S,Z(p));g.stroke()}g.setLineDash([]);
  g.font='800 '+fs+'px system-ui,sans-serif';g.textBaseline='middle';g.textAlign='center';g.lineWidth=fs/4;g.strokeStyle='rgba(0,0,0,.75)';g.fillStyle='#fff';
  for(let i=0;i<n;i++){const c=((i+.5)*2*half/n-half),tx=X(c),tz=Z(c);if(tx>fs&&tx<S-fs){g.strokeText('ABC'[i],tx,fs*.8);g.fillText('ABC'[i],tx,fs*.8)}if(tz>fs&&tz<S-fs){g.strokeText(String(i+1),fs*.8,tz);g.fillText(String(i+1),fs*.8,tz)}}g.restore()}
 // the storm: everything outside the circle is red
 if(window.STORM&&STORM.on&&STORM.on()){const r=STORM.radius()*sc;g.save();g.beginPath();g.rect(0,0,S,S);g.arc(X(0),Z(0),r,0,6.2832,true);g.fillStyle='rgba(255,30,30,.34)';g.fill('evenodd');g.restore();
  g.strokeStyle='#ff5a4a';g.lineWidth=Math.max(1.5,S/220);g.beginPath();g.arc(X(0),Z(0),r,0,6.2832);g.stroke()}
 else if(window.STORM){const r0=(window.BRX&&BRX.r0||half*1.4)*sc;g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=Math.max(1,S/300);g.setLineDash([4,5]);g.beginPath();g.arc(X(0),Z(0),r0,0,6.2832);g.stroke();g.setLineDash([])}
 // loot that fallen fighters left (guns, melee, items) - health and armour are small dots
 if(window.BR&&BR.loot&&o.loot!==false){for(const l of BR.loot){const big=l.kind==='gun'||l.kind==='mel'||l.kind==='item',r=(big?Math.max(2.4,S/120):Math.max(1.6,S/200));
   g.fillStyle='#000';g.fillRect(X(l.x)-r-1,Z(l.z)-r-1,2*r+2,2*r+2);g.fillStyle=LCOL[l.kind]||'#fff';g.fillRect(X(l.x)-r,Z(l.z)-r,2*r,2*r)}}
 // where you will land
 if(o.sel){const x=X(o.sel[0]),z=Z(o.sel[1]),t=performance.now()/1000,r=S/50+Math.sin(t*5)*S/180;g.strokeStyle='#fff';g.lineWidth=Math.max(2,S/180);g.fillStyle='rgba(255,208,47,.9)';
  g.beginPath();g.arc(x,z,r,0,6.2832);g.fill();g.stroke();g.beginPath();g.moveTo(x,z-r*2.2);g.lineTo(x,z-r*1.2);g.moveTo(x,z+r*2.2);g.lineTo(x,z+r*1.2);g.moveTo(x-r*2.2,z);g.lineTo(x-r*1.2,z);g.moveTo(x+r*2.2,z);g.lineTo(x+r*1.2,z);g.stroke()}
 if(o.hover){const x=X(o.hover[0]),z=Z(o.hover[1]),r=S/60;g.strokeStyle=o.hover[2]?'#7dff9a':'#ff5a4a';g.lineWidth=Math.max(2,S/200);g.beginPath();g.arc(x,z,r,0,6.2832);g.stroke();
  if(!o.hover[2]){g.beginPath();g.moveTo(x-r*.7,z-r*.7);g.lineTo(x+r*.7,z+r*.7);g.moveTo(x+r*.7,z-r*.7);g.lineTo(x-r*.7,z+r*.7);g.stroke()}}
 // you, as an arrow that points where you look
 if(o.me&&window.P){const x=X(P.x),z=Z(P.z),a=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)),r=Math.max(5,S/38);g.save();g.translate(x,z);g.rotate(a);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=Math.max(1.5,S/200);
  g.beginPath();g.moveTo(r*1.25,0);g.lineTo(-r*.8,r*.8);g.lineTo(-r*.35,0);g.lineTo(-r*.8,-r*.8);g.closePath();g.fill();g.stroke();g.restore()}
 g.strokeStyle='#000';g.lineWidth=Math.max(2,S/150);g.strokeRect(0,0,S,S)}
// ---------- the minimap (top right) and the big map (hold TAB)
const mm=el('div','brmm','<canvas width="190" height="190"></canvas><i>N</i>',document.getElementById('hud')||document.body);
const mmc=mm.firstChild;
const big=el('div','brbig','<canvas></canvas><small>HOLD TAB &middot; THE WHOLE ARENA</small>');
const bigc=big.firstChild;
function fit(cv,max){const s=Math.floor(Math.min(innerWidth-30,innerHeight-(max||80)));cv.style.width=cv.style.height=s+'px';cv.width=cv.height=Math.min(900,Math.round(s*Math.min(devicePixelRatio||1,2)))}
function showBig(on){bigOn=on&&!!base&&!!window.BRX&&!pickCb;big.style.display=bigOn?'flex':'none';if(bigOn){fit(bigc,90);paint(bigc,{grid:true,me:true})}}
addEventListener('keydown',e=>{if(e.key==='Tab'){if(window.BRX&&mode==='play'){e.preventDefault();if(!e.repeat)showBig(true)}}});
addEventListener('keyup',e=>{if(e.key==='Tab'){e.preventDefault&&e.preventDefault();showBig(false)}});
addEventListener('blur',()=>showBig(false));
// ---------- the drop zone screen: one centred panel (title, the map, buttons). Scroll or +/- to zoom, drag to move, click to choose.
const pk=el('div','brpick','<div class="pkc"><div class="pkh"><h2>CHOOSE YOUR DROP ZONE</h2><p id="pkp">Click the map where you want to land. The other 19 fighters drop in at random.</p></div>'
 +'<div class="pkm"><canvas></canvas><div class="pkz"><button id="pkzi" title="Zoom in">+</button><button id="pkzo" title="Zoom out">&minus;</button></div><div class="pkn">N</div><div class="pks"></div></div>'
 +'<div class="pkb"><span id="pkinfo">Click on the map</span><button id="pkrand">RANDOM</button><button id="pkgo" disabled>DROP IN</button><b id="pkt"></b></div>'
 +'<small class="pkhint">Scroll to zoom &middot; drag to move around &middot; the arena is 3 x the area of a normal map</small></div>');
const pkc=pk.querySelector('canvas'),pkinfo=pk.querySelector('#pkinfo'),pkgo=pk.querySelector('#pkgo'),pkt=pk.querySelector('#pkt'),pks=pk.querySelector('.pks');
let hover=null,vz=1,vcx=0,vcy=0; // zoom and the centre of the view, in picture pixels
const view=()=>{const w=SZ/vz;return{x:Math.max(0,Math.min(SZ-w,vcx-w/2)),y:Math.max(0,Math.min(SZ-w,vcy-w/2)),w}};
const valid=(x,z)=>!!(window.BR&&BR.okSpawn?BR.okSpawn(x,z):true);
const zone=(x,z)=>{const n=half>40?3:1,cs=2*half/n;return 'ABC'[Math.min(n-1,Math.max(0,Math.floor((x+half)/cs)))]+(Math.min(n-1,Math.max(0,Math.floor((z+half)/cs)))+1)};
function redraw(){if(!pickCb)return;paint(pkc,{grid:true,sel:sel,hover:hover,loot:false,me:false,view:view()});
 const w=view().w/SZ*2*half;pks.textContent=Math.round(w/4/5)*5+' m'}
function toWorld(ev){const r=pkc.getBoundingClientRect(),v=view(),bsc=SZ/(2*half);return[((v.x+(ev.clientX-r.left)/r.width*v.w)/bsc)-half,((v.y+(ev.clientY-r.top)/r.height*v.w)/bsc)-half]}
function zoomTo(z,ev){const o=view(),r=ev?pkc.getBoundingClientRect():null,fx=ev?(ev.clientX-r.left)/r.width:.5,fy=ev?(ev.clientY-r.top)/r.height:.5,px=o.x+fx*o.w,py=o.y+fy*o.w;
 vz=Math.max(1,Math.min(4,z));const w=SZ/vz;vcx=px-fx*w+w/2;vcy=py-fy*w+w/2;redraw()}
let drag=null,moved=0;
pkc.addEventListener('mousedown',ev=>{if(!pickCb||ev.button!==0)return;drag={x:ev.clientX,y:ev.clientY,cx:vcx,cy:vcy};moved=0});
addEventListener('mouseup',()=>{drag=null});
pkc.addEventListener('mousemove',ev=>{if(!pickCb)return;
 if(drag&&vz>1){const r=pkc.getBoundingClientRect(),v=view(),dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;moved=Math.max(moved,Math.hypot(dx,dy));vcx=drag.cx-dx/r.width*v.w;vcy=drag.cy-dy/r.height*v.w;pkc.style.cursor='grabbing';redraw();return}
 const[x,z]=toWorld(ev);hover=[x,z,valid(x,z)];pkc.style.cursor=hover[2]?'crosshair':'not-allowed';redraw()});
pkc.addEventListener('mouseleave',()=>{hover=null;drag=null;redraw()});
pkc.addEventListener('click',ev=>{if(!pickCb||moved>6)return;const[x,z]=toWorld(ev);select(x,z)});
pkc.addEventListener('wheel',ev=>{if(!pickCb)return;ev.preventDefault();zoomTo(vz*(ev.deltaY<0?1.25:.8),ev)},{passive:false});
pk.querySelector('#pkzi').onclick=()=>zoomTo(vz*1.4);pk.querySelector('#pkzo').onclick=()=>zoomTo(vz/1.4);
function select(x,z){if(!pickCb)return false;
 if(!valid(x,z)){const n=window.BR&&BR.nearSpawn?BR.nearSpawn(x,z,10):null;if(!n){pkinfo.textContent='You cannot land there - pick solid ground';pkinfo.className='bad';return false}x=n[0];z=n[1]}
 sel=[x,z];pkinfo.className='';pkinfo.textContent='Landing near '+zone(x,z);pkgo.disabled=false;redraw();return true}
function confirm(){if(!pickCb||!sel)return false;const cb=pickCb;pickCb=null;clearInterval(timer);clearInterval(tcount);pk.style.display='none';hover=null;const s=sel;cb(s[0],s[1]);return true}
function random(){const s=window.BR&&BR.randSpawn?BR.randSpawn():[0,0];sel=[s[0],s[1]];pkgo.disabled=false;confirm()}
pkgo.onclick=confirm;pk.querySelector('#pkrand').onclick=random;
addEventListener('keydown',e=>{if(pickCb&&(e.key==='Enter'||e.key===' ')){e.preventDefault();confirm()}});
// the square map is sized to the screen and stays in the middle
function fitPick(){const s=Math.floor(Math.max(260,Math.min(innerWidth-48,innerHeight-210,900)));pkc.style.width=pkc.style.height=s+'px';pkc.width=pkc.height=Math.min(1100,Math.round(s*Math.min(devicePixelRatio||1,2)))}
addEventListener('resize',()=>{if(pickCb){fitPick();redraw()}});
function pick(cb,secs){if(!base)render();{const pp=document.getElementById('pkp');if(pp)pp.textContent='Click the map where you want to land. The other '+((window.BR&&BR.N||20)-1)+' fighters drop in at random.'}sel=null;hover=null;pickCb=cb;vz=1;vcx=vcy=SZ/2;pk.style.display='flex';pkgo.disabled=true;pkinfo.className='';pkinfo.textContent='Click on the map';fitPick();redraw();
 try{window.PAUSE&&PAUSE.quiet&&PAUSE.quiet(1500)}catch(e){}
 try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
 left=secs||40;pkt.textContent=left;clearInterval(timer);timer=setInterval(()=>{if(!pickCb){clearInterval(timer);return}left--;pkt.textContent=left>0?left:'';if(left<=0){if(sel)confirm();else random()}else{redraw()}},1000);
 clearInterval(tcount);tcount=setInterval(()=>{if(!pickCb){clearInterval(tcount);return}redraw()},100)}
function hide(){pickCb=null;clearInterval(timer);clearInterval(tcount);pk.style.display='none';big.style.display='none';bigOn=false;mm.style.display='none'}
function tick(dt){if(!window.BRX||!base){mm.style.display='none';return}
 mm.style.display='block';acc+=dt;if(acc<.08)return;acc=0;paint(mmc,{me:true});if(bigOn)paint(bigc,{grid:true,me:true})}
window.BRMAP={build(){return render()},pick,hide,tick,select,confirm,random,paint,get picking(){return!!pickCb},get base(){return base},get sel(){return sel},half:()=>half,zone};
})();
