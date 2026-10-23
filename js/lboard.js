/* Leaderboards (round 22): Top Rank, Top Level, Top Games Won and Top Kills. The lists come from the online service (see leaderboard() in supabase/setup.sql).
   Games won and kills on the boards only count ONLINE matches. Your own numbers are sent after online matches and whenever the board is opened.
   Players show their level frame (account.js perks), and holders of $BRICKROYALE get the rainbow name.
   API: LBOARD.open(kind?), LBOARD.close(), LBOARD.sync(), LBOARD.render(kind, rows) */
(()=>{
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const KINDS=[['rating','Top Rank'],['level','Top Level'],['wins','Top Games Won'],['kills','Top Kills']];
const VAL={rating:r=>(window.Online?Online.tier(r.rating)+' ':'')+r.rating,level:r=>'Lv '+r.level,wins:r=>r.wins+' won',kills:r=>r.kills+' kills'};
const ov=document.createElement('div');ov.id='lbd';
ov.innerHTML='<div class="spshell"><div class="sptop"><button id="lbx"><span class="bi">◀</span> Back</button><h1>LEADERBOARD</h1><div class="sptabs" id="lbtabs"></div></div><div class="lbbody"><p class="lbnote" id="lbnote"></p><div class="lbl" id="lbl"></div><div class="lbme" id="lbme"></div></div></div>';
document.body.appendChild(ov);
let kind='rating',from='title',tok=0,sent=0;
const tabs=$('lbtabs');KINDS.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.k=k;b.onclick=()=>{kind=k;load()};tabs.appendChild(b)});
const mine=()=>{const s=ACCT.stats(),i=ACCT.info();return{name:PROFILE.name()||'You',level:i.L,rating:window.Online?Online.rating():1000,wins:s.ow,kills:s.ok,holder:PROFILE.holder(),me:true}};
async function sync(force){if(!window.Supa||!Supa.configured()||!window.ACCT||!window.PROFILE||!PROFILE.name())return false;if(!force&&Date.now()-sent<20000)return true;sent=Date.now();const s=ACCT.stats();
 try{await Supa.rpc('ensure_player');await Supa.rpc('sync_profile',{p_name:PROFILE.name(),p_xp:s.xp,p_won:s.ow,p_kills:s.ok,p_holder:!!PROFILE.holder()});return true}catch(e){return false}}
const medal=n=>n===1?'<s class="md g">1</s>':n===2?'<s class="md s">2</s>':n===3?'<s class="md b">3</s>':'<s class="md">'+n+'</s>';
function row(r,k){const t=ACCT.tier(r.level);return'<div class="lbr'+(r.me?' me':'')+(r.rank<=3?' top':'')+'">'+medal(r.rank||'-')+'<div class="lbv t-'+t.id+'" style="--tc:'+t.c+'" title="'+t.name+' nameplate"><small>LV</small><b>'+r.level+'</b></div><div class="lbn">'+ACCT.name(r.name,r.level,r.holder)+(r.me?' <em>YOU</em>':'')+'</div><div class="lbs">'+VAL[k](r)+'</div></div>'}
function render(k,rows,note){const top=rows.filter(r=>r.rank<=20),me=rows.find(r=>r.me);
 $('lbl').innerHTML=top.length?'<div class="lbcol">'+top.slice(0,10).map(r=>row(r,k)).join('')+'</div><div class="lbcol">'+top.slice(10).map(r=>row(r,k)).join('')+'</div>':'<p class="lbempty">'+(note||'Nobody is on this board yet. Play online matches to get on it!')+'</p>';
 $('lbme').innerHTML=me&&me.rank>20?'<div class="lbcol one">'+row(me,k)+'</div>':'';
 [...tabs.children].forEach(b=>b.classList.toggle('on',b.dataset.k===k))}
const NOTE={rating:'Rank is your online rating from ranked matches. ',level:'Level is your account level. ',wins:'Counts matches you won online. ',kills:'Counts KOs you scored in online matches. '};
async function load(){const t=++tok,k=kind;[...tabs.children].forEach(b=>b.classList.toggle('on',b.dataset.k===k));
 $('lbnote').textContent=NOTE[k]+'Loading...';$('lbl').innerHTML='<div class="spin"></div>';$('lbme').innerHTML='';
 let rows=null;
 try{if(!window.Supa||!Supa.configured())throw new Error('off');await sync();rows=await Supa.rpc('leaderboard',{p_kind:k})}catch(e){rows=null}
 if(t!==tok)return;
 if(!Array.isArray(rows)){$('lbnote').textContent=NOTE[k]+'The online service could not be reached, so only your own numbers are shown.';const m=mine();m.rank=0;$('lbl').innerHTML='<div class="lbcol one">'+row(m,k)+'</div>';return}
 $('lbnote').textContent=NOTE[k]+'Top 20 of all players. '+(PROFILE.name()?'':'Pick a name to be listed.');render(k,rows)}
function open(k){if(k)kind=k;const m=$('menu'),t=$('title');from=m&&m.style.display!=='none'?'select':'title';if(t)t.style.display='none';if(m)m.style.display='none';['spinpg','storepg','bpass'].forEach(i=>{const e=$(i);if(e)e.style.display='none'});
 ov.style.display='flex';load()}
function close(){if(ov.style.display!=='flex')return;ov.style.display='none';tok++;window.TITLE&&(from==='select'?TITLE.showSelect():TITLE.showTitle())}
$('lbx').onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.style.display==='flex')close()});
window.LBOARD={open,close,sync:()=>sync(true),render,isOpen:()=>ov.style.display==='flex',load,mine};
})();
