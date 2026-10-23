/* First-person view (press V). The camera sits at your eyes, your own head, torso and legs are hidden (so a roof or wall can never block the view and you never look
   through your own body), and the arms and gun stay, held up in front of you (hold.js reads P.fpv / P.fpvEye). Dead = third person again. */
(()=>{
let want=false;try{want=localStorage.getItem('brickbrawl.fpv')==='1'}catch(e){}
const on=()=>want&&mode==='play'&&P.hp>0;
const eye=()=>P.y+(P.hg?P.hg.position.y:1.9)+.24; // eye height: the head group's height + a little to the face
const keepOf=()=>[P.la,P.ra,P.aim];
function hide(g,keep){if(!g)return;for(const c of g.children){if(keep&&keep.includes(c))continue;if(c.userData.fv===undefined)c.userData.fv=c.visible;c.visible=false}}
function show(g){if(!g)return;for(const c of g.children)if(c.userData.fv!==undefined){c.visible=c.userData.fv;delete c.userData.fv}}
let last=null; // the model parts currently hidden (a new skin builds new parts)
function apply(){const f=on();
 if(last&&(last.bg!==P.bg||last.hg!==P.hg)){show(last.bg);show(last.hg);last=null}
 if(f){if(!last)last={bg:P.bg,hg:P.hg};hide(P.bg,keepOf());if(P.hg)P.hg.visible=false;if(P.hg)P.hg.userData.fv=P.hg.userData.fv===undefined?true:P.hg.userData.fv}
 else if(last){show(last.bg);if(last.hg){last.hg.visible=true;delete last.hg.userData.fv}last=null}}
window.FPV={on,eye,
 set(v){want=!!v;try{localStorage.setItem('brickbrawl.fpv',want?'1':'0')}catch(e){}},
 toggle(){this.set(!want);if(window.say)say(want?'FIRST PERSON (V to switch back)':'THIRD PERSON',.9)}};
const _s=step;step=function(dt){P.fpv=on()?1:0;P.fpvEye=(P.hy||1.9)+.24;_s(dt);apply()};
addEventListener('keydown',e=>{if(e.code==='KeyV'&&!e.repeat&&mode==='play'&&!window.PAUSED&&!e.ctrlKey&&!e.metaKey){FPV.toggle()}});
})();
