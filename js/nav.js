/* Bot navigation: a walkability grid built from the solid colliders, A* paths with string pulling (so it leaves buildings through the door),
   local wall avoidance, stuck detection, and smooth turning toward where it is walking. Combat decisions stay in game.js bot(). */
(()=>{
const CS=.4,HALF=A+2,N=Math.round(HALF*2/CS),R0=.42;let blk=null;
const ci=v=>Math.floor((v+HALF)/CS),cc=i=>-HALF+(i+.5)*CS;
function build(){blk=new Uint8Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=cc(i),z=cc(j);for(const b of boxes){if(b.y0)continue;if(x>b.x1-R0&&x<b.x2+R0&&z>b.z1-R0&&z<b.z2+R0){blk[j*N+i]=1;break}}}}
const ok=(i,j)=>i>=0&&j>=0&&i<N&&j<N&&!blk[j*N+i];
// straight walk test; the cells right around the start are ignored so a bot pressed against a wall can still slide away from it
function los(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/(CS*.5)));for(let s=0;s<=n;s++){const t=s/n;if(t*d<CS*1.2)continue;if(!ok(ci(x0+(x1-x0)*t),ci(z0+(z1-z0)*t)))return false}return true}
function nearest(i,j){if(ok(i,j))return[i,j];for(let r=1;r<30;r++){let best=null,bd=1e9;for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(ok(i+di,j+dj)){const d=di*di+dj*dj;if(d<bd){bd=d;best=[i+di,j+dj]}}}if(best)return best}return null}
function astar(sx,sz,gx,gz){const s=nearest(ci(sx),ci(sz)),g=nearest(ci(gx),ci(gz));if(!s||!g)return null;
 const G=new Float32Array(N*N).fill(1e9),from=new Int32Array(N*N).fill(-1),done=new Uint8Array(N*N),heap=[];
 const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;const t=heap[p];heap[p]=heap[i];heap[i]=t;i=p}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;const t=heap[m];heap[m]=heap[i];heap[i]=t;i=m}}return top};
 const h=(i,j)=>{const dx=Math.abs(i-g[0]),dz=Math.abs(j-g[1]);return dx+dz+(Math.SQRT2-2)*Math.min(dx,dz)};
 const sk=s[1]*N+s[0];G[sk]=0;push(h(s[0],s[1]),sk);
 while(heap.length){const k=pop()[1];if(done[k])continue;done[k]=1;const i=k%N,j=(k/N)|0;if(i===g[0]&&j===g[1])break;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(!ok(a,b))continue;if(di&&dj&&(!ok(i+di,j)||!ok(i,j+dj)))continue;
   const nk=b*N+a,ng=G[k]+(di&&dj?1.4142:1);if(ng<G[nk]){G[nk]=ng;from[nk]=k;push(ng+h(a,b),nk)}}}
 const gk=g[1]*N+g[0];if(!done[gk])return null;const pts=[];for(let k=gk;k!==-1;k=from[k])pts.push({x:cc(k%N),z:cc((k/N)|0)});pts.reverse();return pts}
window.NAV={ok:(x,z)=>{if(!blk)build();return ok(ci(x),ci(z))},path:(a,b,c,d)=>{if(!blk)build();return astar(a,b,c,d)},los:(a,b,c,d)=>{if(!blk)build();return los(a,b,c,d)}};
const _bot=bot;
bot=function(dt){const e=E,p=P,vy0=e.vy;_bot(dt);if(!blk)build();
 if(e.vy===10&&vy0!==10)e.vy=vy0; // no pointless hops against walls
 if(e.dash>0||over)return;
 const n=e.nv||(e.nv={path:null,t:0,sx:e.x,sz:e.z,st:0,force:0,gx:0,gz:0});
 let gx=p.x,gz=p.z;
 if(e.hp<45){let c=null,bd=99;chests.forEach(h=>{if(h.t<=0&&(h.k==='h'||e.id==='doge')){const q=Math.hypot(h.x-e.x,h.z-e.z);if(q<bd){bd=q;c=h}}});if(c){gx=c.x;gz=c.z}}
 const sees=!blocked(e,p),direct=los(e.x,e.z,gx,gz);
 n.st+=dt;if(n.st>=1){const mv=Math.hypot(e.x-n.sx,e.z-n.sz),want=Math.hypot(e.vx,e.vz);if(mv<.6&&want>1){n.force=2;n.path=null}n.sx=e.x;n.sz=e.z;n.st=0}
 n.force=Math.max(0,n.force-dt);
 let vx=e.vx,vz=e.vz;const sp0=e.sp*.9;
 if(!direct||n.force>0){
  n.t-=dt;if(!n.path||n.t<=0||Math.hypot(gx-n.gx,gz-n.gz)>2){n.path=astar(e.x,e.z,gx,gz);n.t=.5;n.gx=gx;n.gz=gz}
  const path=n.path;
  if(path&&path.length){while(path.length>1&&(Math.hypot(path[0].x-e.x,path[0].z-e.z)<.45||los(e.x,e.z,path[1].x,path[1].z)))path.shift();
   const w=path[0],dx=w.x-e.x,dz=w.z-e.z,d=Math.hypot(dx,dz)||1;if(d>.2){vx=dx/d*sp0;vz=dz/d*sp0}else{vx=vz=0}}
 }else{
  const sp=Math.hypot(vx,vz);
  if(sp>.01){const ux=vx/sp,uz=vz/sp,tries=[0,.5,-.5,1,-1,1.6,-1.6,2.4,-2.4];let found=false;
   for(const a of tries){const cs=Math.cos(a),sn=Math.sin(a),tx=ux*cs-uz*sn,tz=ux*sn+uz*cs;if(los(e.x,e.z,e.x+tx*1.2,e.z+tz*1.2)){vx=tx*sp;vz=tz*sp;found=true;break}}
   if(!found){vx=vz=0}}
 }
 e.vx=vx;e.vz=vz;
 // face where it walks unless it can see the player (then it keeps aiming at them while it moves)
 const s=Math.hypot(vx,vz);if(!sees&&s>.5){const want=Math.atan2(-vx,-vz);let dl=want-e.yaw;dl=Math.atan2(Math.sin(dl),Math.cos(dl));e.yaw+=Math.max(-9*dt,Math.min(9*dt,dl))}};
})();
