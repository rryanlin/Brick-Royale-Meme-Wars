/* CPU difficulty: Easy / Normal / Hard. Only affects the offline bot (never online matches). Normal is the original bot.
   aim = aim spread multiplier, react = seconds before it starts shooting once it sees you, duty/semi = how steadily it holds the trigger (auto / semi-auto guns; lower = more),
   lead = how well it aims ahead of your movement, spd = move speed, dmg = damage it deals, abhp = health below which it uses its Q ability. */
(()=>{const KEY='brickbrawl.diff',L=['easy','normal','hard'];let cur='normal',tmp=null;try{const v=localStorage.getItem(KEY);if(L.includes(v))cur=v}catch(e){}
const D={easy:{aim:2.6,react:.8,duty:.2,semi:.05,lead:0,spd:.8,dmg:.65,abhp:30},
 normal:{aim:1,react:0,duty:-.3,semi:-2,lead:0,spd:1,dmg:1,abhp:60},
 hard:{aim:.35,react:0,duty:-.9,semi:-2,lead:.7,spd:1.08,dmg:1.15,abhp:90}};
const cpu=()=>!(window.NET&&NET.on);
const cd=()=>tmp||cur;window.DIFF={tmp:d=>{tmp=L.includes(d)?d:null},get:()=>cur,set:d=>{if(!L.includes(d))return;cur=d;try{localStorage.setItem(KEY,d)}catch(e){}},p:()=>cpu()?D[cd()]:D.normal,names:L};
const _out=out;out=function(e,n){n=_out(e,n);return (e===E||e.brBot)&&cpu()?n*D[cd()].dmg:n};
const _bot=bot;bot=function(dt){_bot(dt);const e=window.__BE||E;if(cpu()&&!over&&e.dash<=0){const s=D[cd()].spd;if(s!==1){e.vx*=s;e.vz*=s}}};
})();
