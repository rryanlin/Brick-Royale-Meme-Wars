/* Crosshair: outlined cross at rest; on a hit it pops outward, fills solid red and shows a centre square, then eases back.
   Geometry is measured from the two reference images (units are % of the 100x100 box). One rAF loop, only running while animating. */
(()=>{
const el=document.getElementById('cross');if(!el)return;
const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('width','100%');svg.setAttribute('height','100%');
const mk=n=>{const r=document.createElementNS(NS,'rect');r.setAttribute('stroke','#000');r.setAttribute('shape-rendering','geometricPrecision');svg.appendChild(r);return r};
const bars=[mk(),mk(),mk(),mk()],dot=mk();el.appendChild(svg);
// rocket launcher reticle: open white ring with four gaps, small inner ticks and a centre dot. A hit pushes it outward and turns it red, then it eases back
const rsvg=document.createElementNS(NS,'svg');rsvg.setAttribute('viewBox','0 0 100 100');rsvg.setAttribute('width','100%');rsvg.setAttribute('height','100%');rsvg.style.display='none';
const rmk=(t,a)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);rsvg.appendChild(n);return n};
const rOut=rmk('circle',{cx:50,cy:50,fill:'none',stroke:'#000','stroke-linecap':'butt'}),rRing=rmk('circle',{cx:50,cy:50,fill:'none','stroke-linecap':'butt'}),
 rTicks=[0,1,2,3].map(i=>[rmk('line',{stroke:'#000','stroke-linecap':'round'}),rmk('line',{'stroke-linecap':'round'})]),rDotO=rmk('circle',{cx:50,cy:50,fill:'#000'}),rDot=rmk('circle',{cx:50,cy:50});
el.appendChild(rsvg);let kind='std';
// rest = image 1 (hollow bars), hit = image 2 (solid, longer, further out, centre square)
const REST={t:9.2,L:24,g:7.8,s:2.3},HIT={t:6.25,L:31.25,g:12.5,s:2.3,dot:6.25};
const lerp=(a,b,h)=>a+(b-a)*h,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const easeOutBack=x=>{const c1=2.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const easeInOut=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
let h=0,from=0,t0=0,peak=1,running=false;
function drawR(){const hv=Math.max(0,h),k=clamp(hv*1.5),r=lerp(22,31,Math.min(hv,1.2)),c=2*Math.PI*r,q=c/4,gp=q*.3,dsh=q-gp,col='rgb(255,'+Math.round(255-217*k)+','+Math.round(255-217*k)+')';
 for(const [n,w,s] of[[rOut,5.4,'#000'],[rRing,2.6,col]]){n.setAttribute('r',r);n.setAttribute('stroke-width',w);n.setAttribute('stroke',s);n.setAttribute('stroke-dasharray',dsh+' '+gp);n.setAttribute('stroke-dashoffset',-gp/2)}
 const ti=r-11-hv*3,to=r-4;[[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy],i)=>{const[o,f]=rTicks[i];for(const[n,w,s]of[[o,5,'#000'],[f,2.4,col]]){n.setAttribute('x1',50+dx*ti);n.setAttribute('y1',50+dy*ti);n.setAttribute('x2',50+dx*to);n.setAttribute('y2',50+dy*to);n.setAttribute('stroke-width',w);n.setAttribute('stroke',s)}});
 const d=1.9+hv*2.2;rDotO.setAttribute('r',d+1.1);rDot.setAttribute('r',d);rDot.setAttribute('fill',col);
 rsvg.style.transform='scale('+(1+Math.max(0,hv-1)*.4)+')'}
function draw(){
 if(kind==='rpg')return drawR();
 const t=lerp(REST.t,HIT.t,Math.min(h,1.2)),L=lerp(REST.L,HIT.L,h),g=lerp(REST.g,HIT.g,h),s=lerp(REST.s,.8,clamp(h*1.5)),k=clamp(h*1.5),fill='rgb('+Math.round(255+(255-255)*k)+','+Math.round(255-(255-38)*k)+','+Math.round(255-(255-38)*k)+')'; // white -> red
 // each bar: [x,y,w,h] around the centre (50,50); the outline is drawn inside the outer size
 const o=[[50-t/2,50-g-L,t,L],[50-t/2,50+g,t,L],[50-g-L,50-t/2,L,t],[50+g,50-t/2,L,t]];
 bars.forEach((r,i)=>{const[x,y,w,hh]=o[i];r.setAttribute('x',x+s/2);r.setAttribute('y',y+s/2);r.setAttribute('width',Math.max(0,w-s));r.setAttribute('height',Math.max(0,hh-s));r.setAttribute('stroke-width',s);r.setAttribute('fill',fill);r.setAttribute('stroke','rgb('+Math.round(110*clamp(h*1.5))+',0,0)')});
 const d=HIT.dot*clamp((h-.2)/.8)*(1+Math.max(0,h-1)*.6);dot.setAttribute('x',50-d/2);dot.setAttribute('y',50-d/2);dot.setAttribute('width',d);dot.setAttribute('height',d);dot.setAttribute('stroke-width',0);dot.setAttribute('fill','#ff2626');dot.setAttribute('opacity',d>.2?1:0);
 svg.style.transform='scale('+(1+Math.max(0,h-1)*.5)+')'}
function frame(now){
 const t=(now-t0)/1000;
 if(t<.075)h=from+(peak-from)*easeOutBack(t/.075);           // quick pop outward with a little overshoot
 else if(t<.16)h=peak;                                         // brief hold on the solid marker
 else if(t<.48)h=peak*(1-easeInOut((t-.16)/.32));              // smooth ease back to the hollow cross
 else{h=0;draw();running=false;return}
 draw();requestAnimationFrame(frame)}
window.XH={kind(k){if(k===kind)return;kind=k;svg.style.display=k==='rpg'?'none':'';rsvg.style.display=k==='rpg'?'':'none';draw()},hit(power=1){peak=power;from=h;t0=performance.now();if(!running){running=true;requestAnimationFrame(frame)}},reset(){h=0;running=false;draw()}};
draw();
})();
