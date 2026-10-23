/* Fit every full-screen page to the screen so nothing ever needs scrolling (round 20).
   The menu pages are fitted by UIfit() in ui.js. This does the same for the other pages and pop-ups (store, wheel, how to play, game modes, profile, pause, online lobby,
   prize and crate pop-ups, tournament bracket): while one is on screen its box is zoomed out just enough to fit the window (never below 40%), and back to normal on a big screen. */
(()=>{
const SEL=['#storepg>.spshell','#spinpg>.spshell','#howto>*','#pmodes>*','#prof>*','#pause>*','#onl>*','#wheel>*','#dupe>*','#tourov>*','#crov>*','#stconf>*','#secw>*','#bpass>*','#lbd>*','#acct>*','#ccon>*'];
const vis=e=>{const o=e.parentElement;return o&&getComputedStyle(o).display!=='none'&&e.offsetParent!==null||o&&getComputedStyle(o).position==='fixed'&&getComputedStyle(o).display!=='none'};
function fit(){
 SEL.forEach(s=>document.querySelectorAll(s).forEach(b=>{const o=b.parentElement;if(!o||getComputedStyle(o).display==='none'){if(b.style.zoom)b.style.zoom='';return}
  const cs=getComputedStyle(o),padV=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0),padH=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0);
  const z=parseFloat(b.style.zoom)||1,r=b.getBoundingClientRect();if(!r.height)return;
  const nh=r.height/z,nw=r.width/z,ah=o.clientHeight-padV,aw=o.clientWidth-padH;
  let t=Math.min(1,ah/nh,aw/nw);t=Math.max(.4,Math.floor(t*100)/100);
  if(Math.abs(t-z)>.005)b.style.zoom=t===1?'':t}))}
window.FITOV={fit};
addEventListener('resize',fit);setInterval(fit,100);
})();
