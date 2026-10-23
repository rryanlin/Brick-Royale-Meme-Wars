/* Tournament: a separate tab with a three-match bracket against CPU fighters, fought on the two tournament-only arenas
   (Last Brick Colosseum and Royal Rift Arena). Every match is a normal best-of-three against a stronger opponent, with your own fighter, weapon and melee.
   Win all three to be crowned champion and take the prizes in Brick Bucks. Lose once and you are out. Offline only.
   API: TOUR.show() (build/refresh the tab), TOUR.begin(), TOUR.cancel(), TOUR.opp ({id,w} or null), TOUR.run (state or null), TOUR.stages, TOUR.rec() */
(()=>{
const $=id=>document.getElementById(id);
const KEY='brickbrawl.tour',LV=['easy','normal','hard'],LVN={easy:'Easy',normal:'Normal',hard:'Hard'};
const ST=[
 {k:'QUARTERFINAL',map:'colosseum',opp:['foreman','shotgun'],alt:['wojak','shotgun'],prize:150,line:'A brawler with a hard hat and a shotgun.'},
 {k:'SEMIFINAL',map:'rift',opp:['podcast','burst'],alt:['jester','burst'],prize:300,line:'Sees you through walls. Do not stand still.'},
 {k:'FINAL',map:'colosseum',opp:['giga','rifle'],alt:['doge','rifle'],prize:600,line:'The reigning champion: tough, fast and accurate.'}];
const CHAMP=250;
let run=null,host=null,ov=null;
const rec=()=>{try{const r=JSON.parse(localStorage.getItem(KEY)||'{}');return{runs:r.runs|0,champs:r.champs|0,best:r.best|0}}catch(e){return{runs:0,champs:0,best:0}}};
const save=r=>{try{localStorage.setItem(KEY,JSON.stringify(r))}catch(e){}};
const dstage=s=>{const b=Math.max(0,LV.indexOf(window.DIFF?DIFF.get():'normal'));return LV[Math.min(2,b+s)]};
function oppFor(s){const st=ST[s],me=csel;const p=st.opp[0]===me?st.alt:st.opp;return{id:p[0],w:p[1]}}
const nm=id=>(typeof LOOK!=='undefined'&&LOOK[id]?LOOK[id].nm:id);
const wn=w=>(typeof WP!=='undefined'&&WP[w]?WP[w].n:w);
function arenaCanvas(id,px){const c=document.createElement('canvas');c.width=c.height=px;try{c.getContext('2d').drawImage(UImap.thumb(id,px),0,0)}catch(e){}return c}
function coin(){return'<img class="buxcoin" alt="" draggable="false" src="'+(window.BUX?BUX.coin:'')+'">'}
const mapName=id=>(MAPS.by[id]||{}).name||id;
// ---------------------------------------------------------------- the tab
function build(){
 host=$('pgt');if(!host)return;
 host.innerHTML='<div class="trh"><h3>Brick Royale Tournament</h3><p>Three matches, two legendary arenas. Win them all to be crowned champion and win Brick Bucks. One loss and you are out.</p></div>'+
  '<div class="trb" id="trb"></div>'+
  '<div class="trs"><div class="trme" id="trme"></div><div class="trrules"><h4>How it works</h4><ul><li>Every match is best of three rounds against a CPU fighter, with the storm closing in as usual.</li><li>You play with the fighter, weapon and melee you chose on the other tabs.</li><li>Opponents get tougher each round, and the Final is the hardest.</li><li>Prizes are paid after each win, plus a champion bonus. Quitting ends the run.</li></ul><div class="trrec" id="trrec"></div></div>'+
  '<button type="button" id="tourgo" class="trgo"><b>START TOURNAMENT</b><small>Offline vs CPU</small></button></div>';
 $('tourgo').onclick=begin;
}
function paint(){
 if(!host)return;const b=$('trb');b.innerHTML='';
 ST.forEach((st,i)=>{const o=oppFor(i),d=dstage(i);
  const el=document.createElement('div');el.className='trm s'+i;
  el.innerHTML='<div class="trk"><i>'+(i+1)+'</i><b>'+st.k+'</b></div><div class="trart"></div><div class="trmap">'+mapName(st.map)+'</div>'+
   '<div class="trvs"><img alt="" src="'+UIportrait(o.id,0,o.w,true)+'"><div><small>VS</small><b>'+nm(o.id)+'</b><em>'+wn(o.w)+'</em></div></div>'+
   '<p class="trln">'+st.line+'</p><div class="trfoot"><span class="trd d-'+d+'">'+LVN[d]+' CPU</span><span class="trpz">'+coin()+'<b>'+st.prize+'</b></span></div>';
  el.querySelector('.trart').appendChild(arenaCanvas(st.map,240));
  b.appendChild(el);if(i<ST.length-1){const a=document.createElement('div');a.className='tra';a.innerHTML='<svg viewBox="0 0 40 24"><path d="M2 12h28M22 4l10 8-10 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';b.appendChild(a)}});
 const gun=(typeof shownGun==='function'?shownGun(csel):wsel)||'rifle',me=$('trme');
 me.innerHTML='<img alt="" src="'+UIportrait(csel,0,gun,true)+'"><div><small>YOUR FIGHTER</small><b>'+nm(csel)+'</b><em>'+wn(gun)+'</em></div><div class="trch">CHAMPION BONUS<span>'+coin()+'<b>'+CHAMP+'</b></span></div>';
 const r=rec();$('trrec').innerHTML='<span>Champion <b>'+r.champs+'</b>x</span><span>Best run <b>'+(r.best?r.best+' of 3 matches won':'none yet')+'</b></span>';
 const off=!!(window.NET&&NET.on);$('tourgo').disabled=off;$('tourgo').querySelector('small').textContent=off?'Not available online':'Offline vs CPU'}
// ---------------------------------------------------------------- run
function overlay(html,btns){
 if(!ov){ov=document.createElement('div');ov.id='tourov';document.body.appendChild(ov)}
 ov.innerHTML='<div class="tob">'+html+'<div class="tobb"></div></div>';const bb=ov.querySelector('.tobb');
 btns.forEach(([t,f,c])=>{const b=document.createElement('button');b.type='button';b.textContent=t;if(c)b.className=c;b.onclick=f;bb.appendChild(b)});
 ov.style.display='flex'}
const hideOv=()=>{if(ov)ov.style.display='none'};
function ladder(s,done){return'<div class="tol">'+ST.map((st,i)=>'<div class="'+(i<done?'w':i===s?'c':'')+'"><small>'+st.k+'</small><b>'+mapName(st.map)+'</b></div>').join('<u></u>')+'</div>'}
function begin(){
 if(window.NET&&NET.on)return;
 run={s:0,won:0};const r=rec();r.runs++;save(r);startMatch()}
function startMatch(){
 if(!run)return;hideOv();const st=ST[run.s],o=oppFor(run.s);
 MAPS.force=st.map;TOUR.opp=o;if(window.DIFF)DIFF.tmp(dstage(run.s));
 $('go').click();
 if(window.say)say(st.k+': '+mapName(st.map)+' vs '+nm(o.id).toUpperCase(),3.2)}
function end(){run=null;MAPS.force=null;TOUR.opp=null;if(window.DIFF)DIFF.tmp(null);hideOv()}
function cancel(){if(!run&&!(ov&&ov.style.display!=='none'))return;end()}
function matchDone(win){
 if(!run)return;const s=run.s,st=ST[s];
 if(win){run.won++;if(window.BUX){BUX.add(st.prize);BUX.pop([[st.prize,st.k+' PRIZE']])}
  const r=rec();r.best=Math.max(r.best,run.won);
  if(s>=ST.length-1){if(window.BUX)setTimeout(()=>BUX.pop([[CHAMP,'CHAMPION BONUS']]),3400),BUX.add(CHAMP);r.champs++;save(r);
   overlay('<div class="trophy">&#127942;</div><h2>CHAMPION!</h2><p>You beat '+nm(oppFor(s).id)+' in the final and took the crown. Prizes: <b>'+(ST.reduce((a,x)=>a+x.prize,0)+CHAMP)+'</b> Brick Bucks.</p>'+ladder(s,3),
    [['PLAY AGAIN',()=>{end();begin()},'pgo'],['BACK TO MENU',()=>{end();back()}]])}
  else{save(r);run.s++;
   overlay('<h2>'+st.k+' WON</h2><p>+<b>'+st.prize+'</b> Brick Bucks. Next up: <b>'+ST[run.s].k+'</b> on '+mapName(ST[run.s].map)+' against <b>'+nm(oppFor(run.s).id)+'</b>.</p>'+ladder(run.s,run.won),
    [['CONTINUE',startMatch,'pgo'],['QUIT TOURNAMENT',()=>{end();back()}]])}}
 else{const r=rec();save(r);
  overlay('<h2 class="lose">ELIMINATED</h2><p>'+nm(oppFor(s).id)+' knocked you out in the '+st.k.toLowerCase()+'. Matches won: <b>'+run.won+'</b> of '+ST.length+'.</p>'+ladder(s,run.won),
   [['TRY AGAIN',()=>{end();begin()},'pgo'],['BACK TO MENU',()=>{end();back()}]])}}
function back(){$('menu').style.display='flex';if(window.PICK&&PICK.reset)PICK.reset();if(window.UIpage)UIpage('t')}
// after the last round of a match the game shows the menu; the bracket takes over from there
const _er=endRound;
endRound=function(w){const was=over;_er(w);if(was||!run)return;const i=w===P?0:1;if(score[i]>=2){const win=w===P;setTimeout(()=>matchDone(win),2700)}};
window.TOUR={opp:null,get run(){return run},stages:ST,rec,show(){if(!host)build();paint()},begin,cancel,end,matchDone,startMatch};
})();
