/* Bot navigation (round 17). Height-aware: every 0.4 m cell has one node per surface a fighter can stand on (the ground, stair steps, roof decks, crate tops,
   bridges), so the bot walks up stairs and ramps, jumps small ledges and steps off edges, and finds its way to a player on a deck or in a keep.
   Paths come from A*, are smoothed by a 3D walk test, and when the goal cannot be reached the bot walks to the nearest reachable spot instead of lapping.
   The bot keeps inside the closing storm circle while it still chases you (the goal is clamped to the circle). Combat decisions stay in game.js bot(). */
(()=>{
const CS=.4,R0=.46,JMP=1.35,MAXY=14,UP=STEP-.02; // a ledge of exactly STEP is not steppable in phys(), so the nav only steps up less than that
let D=null,HALF=A+2,N=Math.round(HALF*2/CS),SA=null; // (HALF and N are worked out again in build(): the Battle Royale arena is three times as wide)
const ci=v=>Math.floor((v+HALF)/CS),cc=i=>-HALF+(i+.5)*CS;
function build(){
 HALF=A+2;N=Math.round(HALF*2/CS);
 const cover=new Array(N*N),near=new Array(N*N);
 for(const b of boxes){const nb=!!b.nb,i0=Math.max(0,ci(b.x1-R0)),i1=Math.min(N-1,ci(b.x2+R0)),j0=Math.max(0,ci(b.z1-R0)),j1=Math.min(N-1,ci(b.z2+R0));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=cc(i),z=cc(j),k=j*N+i;
   if(x>b.x1-R0&&x<b.x2+R0&&z>b.z1-R0&&z<b.z2+R0)(near[k]||(near[k]=[])).push(b);
   if(!nb&&x>b.x1-.03&&x<b.x2+.03&&z>b.z1-.03&&z<b.z2+.03)(cover[k]||(cover[k]=[])).push(b)}}
 const first=new Int32Array(N*N).fill(-1),cnt=new Uint8Array(N*N),ny=[],nk=[];
 for(let k=0;k<N*N;k++){const cv=cover[k],nr=near[k]||[];let tops=[0];if(cv)for(const b of cv)if(b.h<=MAXY)tops.push(b.h);
  tops.sort((a,b)=>a-b);
  for(let q=0;q<tops.length;q++){const t=tops[q];if(q&&t-tops[q-1]<.04)continue;let ok=true;
   if(cv)for(const b of cv){if(b.h>t+.01&&(b.y0||0)<t+HEAD){ok=false;break}} // inside a solid, or a roof right over the head
   if(!ok)continue;
   for(const b of nr){const y0=b.y0||0;if(b.h>t+UP&&!(y0>0&&t+HEAD<=y0)){ok=false;break}} // too tall to step onto, and not high enough to walk under
   if(ok){if(first[k]<0)first[k]=ny.length;cnt[k]++;ny.push(t);nk.push(k)}}}
 D={first,cnt,ny:Float32Array.from(ny),nk:Int32Array.from(nk),n:ny.length}}
// the highest node in cell k that a fighter standing at height y can walk (or drop) onto
function pick(k,y,up){const f=D.first[k];if(f<0)return -1;let best=-1;for(let m=f,e=f+D.cnt[k];m<e;m++){if(D.ny[m]<=y+up)best=m;else break}return best}
function inGrid(i,j){return i>=0&&j>=0&&i<N&&j<N}
// walk test: from (x0,z0) at height y0 in a straight line to (x1,z1); true if every step of the way is a step-up or a short drop. y1 (optional) = height it must arrive at.
function walk(x0,z0,y0,x1,z1,y1){if(!D)build();const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/(CS*.5)));let y=y0;
 for(let s=1;s<=n;s++){const t=s/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,i=ci(x),j=ci(z);if(!inGrid(i,j))return false;const m=pick(j*N+i,y,UP);
  if(m<0){if(t*d<CS*1.3)continue;return false}
  const h=D.ny[m];if(y0-h>1.2)return false;y=h}
 return y1===undefined||Math.abs(y-y1)<.45}
function locate(x,z,y){const i0=ci(x),j0=ci(z);let best=-1,bs=1e9,br=99;
 for(let r=0;r<=14;r++){if(r>br+1)break;
  for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(!inGrid(i,j))continue;const k=j*N+i,f=D.first[k];if(f<0)continue;
   for(let m=f,e=f+D.cnt[k];m<e;m++){const dy=D.ny[m]-y,sc=r*1.2+(dy>UP?Math.abs(dy)*3+1:Math.abs(dy));if(sc<bs){bs=sc;best=m;br=r}}}}
 return best}
// A* over the nodes; returns {pts:[{x,z,y,jump}], reached}. If the goal is not reachable, the path ends at the explored node closest to it.
function search(sx,sz,sy,gx,gz,gy){if(!D)build();const s=locate(sx,sz,sy),g=locate(gx,gz,gy===undefined?0:gy);if(s<0||g<0)return null;
 const n=D.n;if(!SA||SA.n!==n)SA={n,G:new Float32Array(n),from:new Int32Array(n),jf:new Uint8Array(n),done:new Uint8Array(n),st:new Uint32Array(n),cur:0};
 const cur=++SA.cur,G=SA.G,from=SA.from,jf=SA.jf,done=SA.done,st=SA.st,heap=[]; // (the arrays are reused between searches; st[] says which entries belong to this one)
 const touch=m=>{if(st[m]!==cur){st[m]=cur;G[m]=1e9;from[m]=-1;jf[m]=0;done[m]=0}};
 const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;const t=heap[p];heap[p]=heap[i];heap[i]=t;i=p}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;const t=heap[m];heap[m]=heap[i];heap[i]=t;i=m}}return top};
 const gi=D.nk[g]%N,gj=(D.nk[g]/N)|0,gyy=D.ny[g];
 const h=m=>{const k=D.nk[m],dx=Math.abs(k%N-gi),dz=Math.abs(((k/N)|0)-gj);return dx+dz+(Math.SQRT2-2)*Math.min(dx,dz)+Math.abs(D.ny[m]-gyy)*.4};
 touch(s);G[s]=0;push(h(s),s);let bestN=s,bestH=h(s),it=0;
 const cap=window.BRX?30000:70000;
 while(heap.length&&it++<cap){const m=pop()[1];if(done[m])continue;done[m]=1;if(m===g){bestN=g;break}
  const hm=h(m);if(hm<bestH-1e-3||(Math.abs(hm-bestH)<1e-3&&G[m]<G[bestN])){bestH=hm;bestN=m}
  const k=D.nk[m],i=k%N,j=(k/N)|0,y=D.ny[m];
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(!inGrid(a,b))continue;const k2=b*N+a,diag=di&&dj;
   if(diag){const o1=(j)*N+(i+di),o2=(j+dj)*N+i;if(!inGrid(i+di,j)||!inGrid(i,j+dj)||pick(o1,y,UP)<0||pick(o2,y,UP)<0)continue}
   const base=diag?1.4142:1;
   const w=pick(k2,y,UP);
   if(w>=0)touch(w);
   if(w>=0&&!done[w]){const dyy=D.ny[w]-y,c=base+(dyy<-.8?2+(-dyy)*1.2:Math.abs(dyy)*.5),ng=G[m]+c;if(ng<G[w]){G[w]=ng;from[w]=m;jf[w]=0;push(ng+h(w),w)}}
   if(!diag){const q=pick(k2,y,JMP);if(q>=0)touch(q);if(q>=0&&!done[q]&&D.ny[q]>y+UP&&(w<0||D.ny[q]>D.ny[w]+.05)){const ng=G[m]+base+5;if(ng<G[q]){G[q]=ng;from[q]=m;jf[q]=1;push(ng+h(q),q)}}}}}
 const pts=[];for(let m=bestN;m!==-1;m=from[m]){const k=D.nk[m];pts.push({x:cc(k%N),z:cc((k/N)|0),y:D.ny[m],jump:jf[m]})}pts.reverse();return{pts,reached:bestN===g}}
const okAt=(x,z)=>{if(!D)build();const i=ci(x),j=ci(z);if(!inGrid(i,j))return false;const k=j*N+i,f=D.first[k];if(f<0)return false;for(let m=f,e=f+D.cnt[k];m<e;m++)if(D.ny[m]<.7)return true;return false};
window.NAV={rebuild:()=>{D=null},nodes:(x,z)=>{if(!D)build();const k=ci(z)*N+ci(x),f=D.first[k],o=[];if(f>=0)for(let m=f;m<f+D.cnt[k];m++)o.push(+D.ny[m].toFixed(2));return o},ok:okAt,path:(a,b,c,d)=>{const r=search(a,b,0,c,d,0);return r&&r.pts},search,walk,
 can:(a,b,c,d,e,f)=>{const r=search(a,b,c,d,e,f);return !!(r&&r.reached)}};
const _bot=bot;
bot=function(dt){const e=window.__BE||E,p=window.__BP||P,vy0=e.vy;_bot(dt);if(!D)build();
 if(e.vy===10&&vy0!==10)e.vy=vy0; // no pointless hops; the nav asks for jumps itself
 if(e.dash>0||over)return;
 const n=e.nv||(e.nv={path:null,t:0,gx:0,gz:0,sx:e.x,sz:e.z,st:0,stuck:0,jit:0,ja:0,sg:1,sgT:1,yaw:e.yaw,pe:false});
 const sp0=e.sp*.9*(e.sx||1),dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1,dy=p.y-e.y,sees=!blocked(e,p),r=e.w.br||12;
 // ---- storm: the circle the bot may stand in, and where the player is relative to it
 const zon=window.STORM&&STORM.on&&STORM.on(),zr=zon?STORM.radius():99,zs=Math.max(1.8,zr-3.5),eR=Math.hypot(e.x,e.z);
 let gx=p.x,gz=p.z,gy=p.y,clamped=false;
 if(e.hp<45){let c=null,bd=99;chests.forEach(h=>{if(h.t<=0&&(h.k==='h'||e.id==='doge')){const q=Math.hypot(h.x-e.x,h.z-e.z);if(q<bd){bd=q;c=h}}});if(c){gx=c.x;gz=c.z;gy=0}}
 if(zon){const gR=Math.hypot(gx,gz);if(gR>zs-.8){const s=(zs-.8)/gR;gx*=s;gz*=s;gy=0;clamped=true}}
 const outside=zon&&eR>zs+.3,same=Math.abs(dy)<1.3,chase=gx===p.x&&gz===p.z;
 // ---- stuck check: pressed against something for a second while it wanted to move
 n.st+=dt;if(n.st>=.8){const mv=Math.hypot(e.x-n.sx,e.z-n.sz),want=Math.hypot(e.vx,e.vz);if(mv<.45&&want>1){n.stuck++;n.path=null;n.jit=.6;n.ja=(Math.random()<.5?1:-1)*(1.2+Math.random()*.8)}else n.stuck=0;n.sx=e.x;n.sz=e.z;n.st=0}
 n.jit=Math.max(0,n.jit-dt);
 // ---- strafing direction flips at random times, so it never orbits you for whole laps
 n.sgT-=dt;if(n.sgT<=0){n.sg=Math.random()<.5?-1:1;n.sgT=.8+Math.random()*1.4}
 let vx=0,vz=0,mode='combat';
 const combat=chase&&sees&&same&&!outside&&!clamped&&!p.dummy; // (Battle Royale: a dummy target is just a place to walk to)
 const probe=(ux,uz)=>{const l=Math.hypot(ux,uz)||1;ux/=l;uz/=l;for(const a of[0,.5,-.5,1,-1,1.6,-1.6,2.4,-2.4]){const cs=Math.cos(a),sn=Math.sin(a),tx=ux*cs-uz*sn,tz=ux*sn+uz*cs,px=e.x+tx*1.4,pz=e.z+tz*1.4;
   if(zon&&Math.hypot(px,pz)>zs+.2&&Math.hypot(px,pz)>eR)continue;if(walk(e.x,e.z,e.y,px,pz))return[tx,tz]}return null};
 if(combat&&n.jit<=0){
  const rad=d>r+2?1:d<r-2?-1:0;
  if(rad===1&&!walk(e.x,e.z,e.y,p.x,p.z))mode='path';
  else{const ux=dx/d*rad-dz/d*n.sg*(rad?.45:.6),uz=dz/d*rad+dx/d*n.sg*(rad?.45:.6);let q=probe(ux,uz);if(!q&&rad)q=probe(-dz/d*n.sg,dx/d*n.sg);if(q){vx=q[0]*sp0;vz=q[1]*sp0}} // boxed in: hold the spot and keep shooting
 }else mode=n.jit>0?'jit':'path';
 if(mode==='jit'){const c=Math.cos(n.ja),s=Math.sin(n.ja),ux=dx/d,uz=dz/d;vx=(ux*c-uz*s)*sp0;vz=(ux*s+uz*c)*sp0;if(n.stuck>=2&&e.gr&&n.jit>.3)e.vy=10}
 if(mode==='path'){
  n.t-=dt;
  if((!n.path||n.t<=0||Math.hypot(gx-n.gx,gz-n.gz)>1.5||n.pe!==outside)&&(window.NAVBUD===undefined||window.NAVBUD-->0)){const r2=search(e.x,e.z,e.y,gx,gz,gy);n.path=r2?r2.pts:null;n.t=.4;n.gx=gx;n.gz=gz;n.pe=outside}
  const path=n.path;
  if(path&&path.length){
   while(path.length>1){const w=path[0],nx=path[1];if(Math.hypot(w.x-e.x,w.z-e.z)<.45&&Math.abs(w.y-e.y)<1.2||(!nx.jump&&walk(e.x,e.z,e.y,nx.x,nx.z,nx.y)))path.shift();else break}
   const w=path[0],wx=w.x-e.x,wz=w.z-e.z,wd=Math.hypot(wx,wz);
   if(wd>.22){vx=wx/wd*sp0;vz=wz/wd*sp0}
   else if(path.length===1&&sees&&same){const q=probe(-dz/d*n.sg,dx/d*n.sg);if(q){vx=q[0]*sp0*.6;vz=q[1]*sp0*.6}}
   if(w.jump&&e.gr&&wd<1.3&&w.y>e.y+UP)e.vy=10;
   else if(w.y>e.y+UP&&e.gr&&wd<1.0)e.vy=10}
 }
 // ---- never walk further out into the storm
 if(zon){const ux=e.x/(eR||1),uz=e.z/(eR||1),vr=vx*ux+vz*uz;if(vr>0&&eR+vr*.5>zs&&eR>zs-1.2){vx-=ux*vr;vz-=uz*vr}}
 e.vx=vx;e.vz=vz;
 // ---- face where it walks unless it can see the player (then it keeps aiming at them while it moves)
 const s=Math.hypot(vx,vz);
 if(sees||s<.5)n.yaw=e.yaw;else{const want=Math.atan2(-vx,-vz);let dl=want-n.yaw;dl=Math.atan2(Math.sin(dl),Math.cos(dl));n.yaw+=Math.max(-9*dt,Math.min(9*dt,dl));e.yaw=n.yaw}};
})();
