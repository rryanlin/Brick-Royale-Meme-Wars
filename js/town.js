/* Town: buildings made of real brick courses (running bond, seams, top studs), solid corners with no gaps, stepped brick roofs, fences and crates. */
(()=>{
const vis=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(B(w,h,d),M(c));m.position.set(x,y,z);S.add(m);return m},F=0xf2f2f2;
const INS={},STD={},addI=(c,x,y,z,sx,sy,sz)=>(INS[c]||(INS[c]=[])).push([x,y,z,sx,sy,sz]),addS=(c,x,y,z)=>(STD[c]||(STD[c]=[])).push([x,y,z]);
const shade=(c,f)=>{const r=Math.round((c>>16&255)*f),g=Math.round((c>>8&255)*f),b=Math.round((c&255)*f);return r<<16|g<<8|b};
function flush(){const o=new THREE.Object3D(),sg=new THREE.CylinderGeometry(.2,.2,.14,12);
 for(const c in INS){const a=INS[c],im=new THREE.InstancedMesh(B(1,1,1),M(+c),a.length);a.forEach(([x,y,z,sx,sy,sz],i)=>{o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(i,o.matrix)});S.add(im)}
 o.scale.set(1,1,1);for(const c in STD){const a=STD[c],im=new THREE.InstancedMesh(sg,M(+c),a.length);a.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.updateMatrix();im.setMatrixAt(i,o.matrix)});S.add(im)}}
// a rectangle of brick courses; solid collider when col is set
function wallRect(x1,x2,z1,z2,h,c,col,y0,st){const lx=x2-x1,lz=z2-z1,ax=lx>=lz,L=ax?lx:lz,t=ax?lz:lx,cx=(x1+x2)/2,cz=(z1+z2)/2;
 if(col===2)boxes.push({x1,x2,z1,z2,y0,h:y0+h}); // bullet-only (door lintel)
 else if(col)boxes.push({x1,x2,z1,z2,h:y0+h});
 const nc=Math.max(1,Math.round(h/.64)),ch=h/nc,n=Math.max(1,Math.round(L/2)),l=L/n;
 for(let k=0;k<nc;k++){const y=y0+(k+.5)*ch;let b=[];for(let i=0;i<=n;i++)b.push(i*l);
  if(k%2&&n>=2){b=[0];for(let i=0;i<n;i++)b.push((i+.5)*l);b.push(L)}
  for(let i=0;i<b.length-1;i++){const bl=b[i+1]-b[i]-.03,a=(b[i]+b[i+1])/2-L/2,col2=((k*7+i*3)%5===0)?shade(c,.9):c,x=ax?cx+a:cx,z=ax?cz:cz+a;
   addI(col2,x,y,z,ax?bl:t-.02,ch-.03,ax?t-.02:bl)}}
 if(st&&L>=1)for(let i=0;i<Math.floor(L);i++){const a=-L/2+.5+i;addS(c,ax?cx+a:cx,y0+h+.07,ax?cz:cz+a)}}
function win(x,y,z,ax){const v=(L,H,T,dx,dy,c)=>ax?vis(L,H,T,x+dx,y+dy,z,c):vis(T,H,L,x,y+dy,z+dx,c);
 v(1.1,1,.08,0,0,0x29445e);v(1.4,.12,.14,0,.56,F);v(1.4,.12,.14,0,-.56,F);v(.12,1.2,.14,-.64,0,F);v(.12,1.2,.14,.64,0,F);v(.07,1,.16,0,0,F);v(1.1,.07,.16,0,0,F)}
function house(cx,cz,w,d,h,door,wc,rc,lean){const t=.5,dw=2.6,hx=w/2,hz=d/2,nc=Math.max(1,Math.round(h/.64)),ch=h/nc,dh=Math.max(1,nc-1)*ch;
 const SD={n:[cx-hx,cx+hx,cz-hz,cz-hz+t,1],s:[cx-hx,cx+hx,cz+hz-t,cz+hz,1],w:[cx-hx,cx-hx+t,cz-hz+t,cz+hz-t,0],e:[cx+hx-t,cx+hx,cz-hz+t,cz+hz-t,0]};
 for(const k in SD){const[x1,x2,z1,z2,ax]=SD[k],L=ax?x2-x1:z2-z1,mid=ax?(x1+x2)/2:(z1+z2)/2,out=(k==='n'||k==='w'?-1:1)*.05,face=k==='n'?z1:k==='s'?z2:k==='w'?x1:x2;
  if(k===door){const seg=(L-dw)/2,o=dw/2+seg/2,g1=mid-dw/2,g2=mid+dw/2;
   if(ax){wallRect(x1,g1,z1,z2,h,wc,1,0,1);wallRect(g2,x2,z1,z2,h,wc,1,0,1);wallRect(g1,g2,z1,z2,h-dh,wc,2,dh,1)}
   else{wallRect(x1,x2,z1,g1,h,wc,1,0,1);wallRect(x1,x2,g2,z2,h,wc,1,0,1);wallRect(x1,x2,g1,g2,h-dh,wc,2,dh,1)}
   if(seg>2.2)[-o,o].forEach(p=>ax?win(mid+p,1.7,face+out,1):win(face+out,1.7,mid+p,0))}
  else{wallRect(x1,x2,z1,z2,h,wc,1,0,1);const n=Math.max(1,Math.floor(L/4.2));for(let i=0;i<n;i++){const p=(i-(n-1)/2)*4;ax?win(mid+p,1.7,face+out,1):win(face+out,1.7,mid+p,0)}}}
 // stepped brick roof
 const ov=.4,rw=w+2*ov;let top;
 if(lean){const k=3,sp=d+2*ov;for(let j=0;j<k;j++){wallRect(cx-rw/2,cx+rw/2,cz-hz-ov,cz-hz-ov+sp*(1-j/k),.5,rc,0,h+j*.5,j===k-1);top=h+(j+1)*.5}}
 else{const k=Math.max(3,Math.round(hz/.9)),s=(hz+ov)/k;for(let j=0;j<k;j++){const zs=(hz+ov)-j*s;wallRect(cx-rw/2,cx+rw/2,cz-zs,cz+zs,.5,rc,0,h+j*.5,j===k-1)}top=h+k*.5;
  const n=Math.ceil((top-h+.9)/.5);for(let i=0;i<n;i++)addI(0x8a3b2a,cx+w*.25,h+.5+(i+.5)*.5,cz-.3,.85,.47,.85);addI(0x5c2a1e,cx+w*.25,h+.5+n*.5+.1,cz-.3,1.05,.2,1.05)}
 boxes.push({x1:cx-rw/2,x2:cx+rw/2,z1:cz-hz-ov,z2:cz+hz+ov,y0:h,h:top+.2})}
function fence(x1,z1,x2,z2){const ax=Math.abs(x2-x1)>=Math.abs(z2-z1),T=.125,L=ax?Math.abs(x2-x1):Math.abs(z2-z1),n=Math.max(1,Math.floor(L/2));
 if(ax){wallRect(Math.min(x1,x2),Math.max(x1,x2),z1-T,z1+T,1.1,0xa57c45,1,0,1);for(let i=0;i<=n;i++)addI(0x6b4c25,Math.min(x1,x2)+i*L/n,.75,z1,.3,1.5,.3)}
 else{wallRect(x1-T,x1+T,Math.min(z1,z2),Math.max(z1,z2),1.1,0xa57c45,1,0,1);for(let i=0;i<=n;i++)addI(0x6b4c25,x1,.75,Math.min(z1,z2)+i*L/n,.3,1.5,.3)}}
house(-14,-16,10,8,3.2,'s',0xe0cfa8,0xa5352b);
house(14,16,10,8,3.2,'n',0xc9d3da,0x2c5aa0);
house(-14,14,5,5,3,'e',0xe8b93c,0x7a3322,1);
house(14,-14,5,5,3,'w',0x6f9fd0,0x4d3a2c,1);
house(0,24,10,5,3.6,'n',0xb03a2e,0x4a5057);
house(0,-24,10,5,3.6,'s',0xb03a2e,0x4a5057);
fence(-6,-8,6,-8);fence(-6,8,6,8);fence(-18,-4,-18,4);fence(18,-4,18,4);
[[-3,3],[3,-3],[-10,0],[10,0]].forEach(([x,z])=>wallRect(x-.8,x+.8,z-.8,z+.8,1.2,0x9a6b3a,1,0,0));
flush();
})();
