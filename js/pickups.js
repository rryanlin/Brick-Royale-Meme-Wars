/* Pickup models: a green LEGO plus (health), a blue heater shield with a star (armor) and a burlap loot bag with a gold star and a light beam.
   Each sits on a glowing ground ring that only shows while the pickup is available. */
(()=>{
const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.26,metalness:.05,emissive:c,emissiveIntensity:.16},o));
const glow=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});
const ext=(sh,d,bv)=>new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:bv,bevelSize:bv,bevelSegments:3,curveSegments:14});
const add=(g,geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(mat.transparent)m.userData.sh=1;g.add(m);return m}; // userData.sh=1 keeps glows and beams out of the shadow pass
const stud=new THREE.CylinderGeometry(.11,.11,.09,14);
function clear(g){g.children.slice().forEach(c=>g.remove(c))}
// ---- health: white-rimmed green plus built from bricks with studs
function healthModel(g){const green=std(0x2fd24c),dark=std(0x178a2e),white=std(0xffffff,{emissiveIntensity:.25}),u=.5,P=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
 const plate=new THREE.Group();g.add(plate);
 P.forEach(([x,y])=>{add(plate,new THREE.BoxGeometry(u+.14,u+.14,.26),white,x*u,y*u,-.06)}); // white rim behind
 P.forEach(([x,y])=>{add(plate,new THREE.BoxGeometry(u-.02,u-.02,.34),green,x*u,y*u,0);const s=add(plate,stud,green,x*u,y*u,.2);s.rotation.x=Math.PI/2});
 add(plate,new THREE.BoxGeometry(.3,.08,.02),std(0xbdf5c7,{emissiveIntensity:.3}),-.08,.22,.18); // shine
 add(plate,new THREE.BoxGeometry(1.52,.5,.1),dark,0,0,-.2);add(plate,new THREE.BoxGeometry(.5,1.52,.1),dark,0,0,-.2);
 plate.position.y=.95;plate.scale.setScalar(.9);
 add(g,new THREE.SphereGeometry(.95,16,12),glow(0x3dff6a,.14),0,.95,0)}
// ---- shield: blue heater shield, silver rim, white star
function shieldShape(){const s=new THREE.Shape();s.moveTo(-.55,.6);s.lineTo(.55,.6);s.lineTo(.55,.05);s.bezierCurveTo(.55,-.45,.2,-.75,0,-.92);s.bezierCurveTo(-.2,-.75,-.55,-.45,-.55,.05);s.closePath();return s}
function starShape(R,r){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,q=i%2?r:R;i?s.lineTo(Math.cos(a)*q,Math.sin(a)*q):s.moveTo(Math.cos(a)*q,Math.sin(a)*q)}s.closePath();return s}
function shieldModel(g){const sh=new THREE.Group();g.add(sh);
 const rim=add(sh,ext(shieldShape(),.12,.05),std(0xe6eef7,{emissiveIntensity:.2,metalness:.5,roughness:.2}));rim.scale.set(1.2,1.14,1);rim.position.set(0,.02,-.07);
 add(sh,ext(shieldShape(),.12,.06),std(0x2f7dff,{emissiveIntensity:.22}),0,0,0);
 const band=add(sh,new THREE.BoxGeometry(1.0,.12,.05),std(0x7fb8ff,{emissiveIntensity:.3}),0,.38,.22);
 add(sh,ext(starShape(.3,.13),.04,.02),std(0xffffff,{emissiveIntensity:.35}),0,-.05,.2);
 add(sh,new THREE.BoxGeometry(.08,.9,.04),std(0x9fd0ff,{emissiveIntensity:.25}),-.3,-.05,.23);
 sh.position.y=1.05;sh.scale.setScalar(1.05);
 add(g,new THREE.SphereGeometry(1,16,12),glow(0x4aa8ff,.15),0,1.0,0)}
// ---- loot bag: burlap sack, red tie, gold star, beam of light
function burlap(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#c9993f';x.fillRect(0,0,128,128);
 for(let i=0;i<128;i+=4){x.fillStyle=i%8?'#b7852f':'#d8a84c';x.fillRect(i,0,2,128);x.fillRect(0,i,128,2)}
 for(let i=0;i<260;i++){x.fillStyle='rgba(90,55,10,'+Math.random()*.25+')';x.fillRect(Math.random()*128,Math.random()*128,2,2)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1.5);return t}
function bagModel(g){const tx=burlap(),cloth=new THREE.MeshStandardMaterial({map:tx,roughness:.85,metalness:0,emissive:0x5a3a08,emissiveIntensity:.18});
 const body=add(g,new THREE.SphereGeometry(1,22,16),cloth,0,.62,0);body.scale.set(.62,.55,.62);
 add(g,new THREE.CylinderGeometry(.2,.3,.3,16),cloth,0,1.16,0);
 const fl=add(g,new THREE.ConeGeometry(.42,.34,16,1,true),cloth,0,1.46,0);fl.material=cloth.clone();fl.material.side=THREE.DoubleSide;
 const tie=add(g,new THREE.TorusGeometry(.23,.05,8,18),std(0xe03232),0,1.28,0);tie.rotation.x=Math.PI/2;
 const star=add(g,ext(starShape(.26,.12),.05,.025),std(0xffd02f,{emissiveIntensity:.45,metalness:.35}),0,.66,.58);
 add(g,new THREE.CylinderGeometry(.34,.5,7,16,1,true),new THREE.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),0,3.6,0);
 g.scale.setScalar(.95)}
// ---- ground rings
const rings=[];
function ring(x,z,c,owner){const g=new THREE.Group(),r=new THREE.Mesh(new THREE.TorusGeometry(.95,.06,8,32),glow(c,.8));r.rotation.x=Math.PI/2;r.userData.sh=1;g.add(r);
 const d=new THREE.Mesh(new THREE.CircleGeometry(.95,32),glow(c,.12));d.rotation.x=-Math.PI/2;d.userData.sh=1;g.add(d);g.position.set(x,.05,z);S.add(g);rings.push({g,o:owner,x})}
chests.forEach(c=>{clear(c.m);c.k==='h'?healthModel(c.m):shieldModel(c.m);ring(c.x,c.z,c.k==='h'?0x3dff6a:0x4aa8ff,c)});
SPOTS.forEach(s=>{clear(s.m);bagModel(s.m);ring(s.x,s.z,0xffd02f,s)});
const _st=step;step=function(dt){_st(dt);for(const r of rings){r.g.visible=r.o.m.visible;r.g.position.set(r.o.x,.05,r.o.z);r.g.scale.setScalar(1+.07*Math.sin(T*3+r.o.x))}};
})();
