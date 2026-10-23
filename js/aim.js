/* Aim / scope. Hold right click: zoom in, turn and walk slower, spread tightens. Guns listed in SCOPED get a full scope overlay (and the fighter is hidden
   so the camera behind them is clear). With the hammer out, right click still swings it (handled in game.js). */
(()=>{
const SCOPED={sniper:1},ZF={sniper:22,rpg:58,pistol:56,smg:56,rifle:54,burst:50,shotgun:58,tac:58}; // target field of view while aiming (normal is 70)
let want=false,z=0,hid=false;
const sc=document.createElement('div');sc.id='scope';
sc.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><defs><mask id="scm" maskUnits="userSpaceOnUse" x="-500" y="-500" width="1100" height="1100"><rect x="-500" y="-500" width="1100" height="1100" fill="#fff"/><circle cx="50" cy="50" r="48" fill="#000"/></mask></defs><rect x="-500" y="-500" width="1100" height="1100" fill="#000" mask="url(#scm)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#000" stroke-width=".8"/><path d="M2 50H46M54 50H98M50 2V46M50 54V98" stroke="#000" stroke-width=".3"/><circle cx="50" cy="50" r=".45" fill="#e11"/><g stroke="#000" stroke-width=".25">'+[56,60,64,68,72].map(y=>'<path d="M49.2 '+y+'H50.8"/>').join('')+[14,18,22,26,30].map(x=>'<path d="M'+x+' 49.4V50.6"/><path d="M'+(100-x)+' 49.4V50.6"/>').join('')+'</g></svg>';
document.body.appendChild(sc);
const gid=()=>(P.w&&P.w.id)||'rifle';
const can=()=>want&&mode==='play'&&!window.PAUSED&&!P.mel&&P.hp>0;
window.ADS={set:v=>{want=!!v},z:()=>z,
 fov:base=>{const fx=window.XW&&P.w&&P.w.sig&&XW.fx[P.w.sig],t=(fx&&fx.zoom)||ZF[gid()]||56;return base+(t-base)*z},
 sens:()=>{const t=ZF[gid()]||56;return 1+(t/70-1)*z},
 sm:()=>1-(SCOPED[gid()]?.55:.3)*z,
 spr:e=>e===P?1-.5*z:1,
 cam:()=>SCOPED[gid()]?0:z, // how far the camera has slid in over the shoulder (the sniper keeps its centred scope view)
 scoped:()=>z>.85&&!!SCOPED[gid()]};
let last=performance.now();
function loop(now){const dt=Math.min(.25,(now-last)/1000);last=now;
 if(!can()&&want&&(mode!=='play'||P.mel||P.hp<=0))want=false;
 const tgt=can()?1:0;z+=(tgt-z)*Math.min(1,dt*(tgt?10:14));if(Math.abs(tgt-z)<.01)z=tgt;
 P.ads=z;
 const sco=ADS.scoped();sc.style.display=sco?'block':'none';
 const cr=document.getElementById('cross');if(cr){cr.style.visibility=sco?'hidden':'';cr.style.transform='scale('+(1-.3*z).toFixed(3)+')'}
 if(P.g){if(sco&&!hid){P.g.visible=false;hid=true}else if(!sco&&hid){P.g.visible=true;hid=false}}
 if(window.XH&&XH.kind)XH.kind(gid()==='rpg'?'rpg':'std');
 requestAnimationFrame(loop)}
requestAnimationFrame(loop);
// losing the mouse (pause, alt-tab, round over) always lets go of aim
for(const ev of['blur','contextmenu'])addEventListener(ev,()=>{want=false});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)want=false});
})();
