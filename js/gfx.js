/* Graphics: glossy plastic shading, soft shadows, sky, brick trees and distant brick scenery. */
(()=>{
const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene(),ek=document.createElement('canvas');ek.width=2;ek.height=128;const ec=ek.getContext('2d'),eq=ec.createLinearGradient(0,0,0,128);
eq.addColorStop(0,'#6f93b8');eq.addColorStop(.5,'#c7d0d8');eq.addColorStop(1,'#5f6f55');ec.fillStyle=eq;ec.fillRect(0,0,2,128);
es.add(new THREE.Mesh(new THREE.SphereGeometry(40,32,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ek),side:THREE.BackSide})));
[[0,30,10,30,6],[-30,10,0,6,20],[30,10,5,6,20]].forEach(([x,y,z,w,h])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)});
S.environment=pm.fromScene(es,.02).texture;S.traverse(o=>{if(o.isHemisphereLight)o.intensity=.32});
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
sun.castShadow=true;sun.intensity=.6;sun.position.set(25,50,15);sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
const sc=sun.shadow.camera;sc.left=sc.bottom=-42;sc.right=sc.top=42;sc.near=1;sc.far=130;
const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
gr.addColorStop(0,'#2a5f9e');gr.addColorStop(.55,'#7f9fbd');gr.addColorStop(1,'#b7c4cf');g.fillStyle=gr;g.fillRect(0,0,2,256);
S.background=new THREE.CanvasTexture(c);S.fog=new THREE.Fog(0x8fa6ba,60,170);
const _g0=S.children.length,GFX0={bg:S.background,fog:S.fog,sunI:sun.intensity,sunP:sun.position.clone(),hemiI:.32};
const floor=new THREE.Mesh(B(500,1,500),M(0x2a6133));floor.position.y=-1.1;S.add(floor);
function tree(x,z,s){const t=new THREE.Group(),k=new THREE.Mesh(B(.8*s,2.5*s,.8*s),M(0x8b5a2b));k.position.y=1.25*s;t.add(k);
 [0,1,2].forEach(i=>{const l=new THREE.Mesh(B((3.4-i)*s,1.2*s,(3.4-i)*s),M(i%2?0x2e9b3a:0x1f8a33));l.position.y=(2.9+i*1.1)*s;t.add(l)});t.position.set(x,0,z);S.add(t)}
for(let i=0;i<26;i++){const a=i/26*Math.PI*2+.1,r=40+(i%3)*7;tree(Math.cos(a)*r,Math.sin(a)*r,1+(i%4)*.25)}
for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=95+(i%2)*15,h=14+(i*7%13),w=10+(i%3)*4,m=new THREE.Mesh(B(w,h,w),M([0x7d8794,0x9aa3ad,0x6b7480][i%3]));m.position.set(Math.cos(a)*r,h/2-1,Math.sin(a)*r);S.add(m)}
window.SCEN0={o:S.children.slice(_g0)};window.GFX0=GFX0;
const mark=()=>S.traverse(o=>{if(o.isMesh&&!o.userData.sh){o.userData.sh=1;o.castShadow=true;o.receiveShadow=o.parent===S}});
mark();setInterval(mark,600);
})();
