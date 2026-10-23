/* Ranked Solo (round 30): Solo is a 30-fighter free-for-all on an expanded map. Switch Ranked on (Choose a mode) and the match counts: you win or lose ELO by
   where you finish and how many fighters you eliminate, you climb through the ranks and the CPU fighters play harder as you go up.
   This is a local ladder (it lives in this browser and the opponents are CPU fighters); there is no server behind it in the offline game.
   API: RANK.on() / RANK.set(bool), RANK.state() {elo,games,wins,top5,kills,best}, RANK.tier(elo), RANK.label(), RANK.apply(place,n,kills,won), RANK.diff(), RANK.reset() */
(()=>{
const KEY='brickbrawl.ranked',ONK='brickbrawl.rankon';
const TIERS=[['Bronze',0,'#d08a4e'],['Silver',900,'#c9d2de'],['Gold',1100,'#ffd02f'],['Platinum',1300,'#4fe3d1'],['Diamond',1500,'#5db6ff'],['Legend',1700,'#ff5ad1']]; // (the same ranks and colours as the online 1v1 ladder in js/online.js; this ladder is separate)
const S={elo:1000,games:0,wins:0,top5:0,kills:0,best:1000,last:0};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
let ON=false;try{ON=localStorage.getItem(ONK)==='1'}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function tier(elo){elo=Math.max(0,Math.round(elo));let k=0;for(let i=0;i<TIERS.length;i++)if(elo>=TIERS[i][1])k=i;const t=TIERS[k],nx=TIERS[k+1],w=nx?nx[1]-t[1]:0;
 const third=nx?Math.min(2,Math.floor((elo-t[1])/(w/3))):0,div=nx?['III','II','I'][third]:'';
 return{k,name:t[0],div,label:t[0]+(div?' '+div:''),color:t[2],lo:t[1],next:nx?nx[1]:null,pct:nx?Math.round((elo-t[1])/w*100):100,icon:t[0][0]}}
const label=()=>tier(S.elo).label;
// ELO against the whole field: every other fighter counts as an opponent rated around yours; your score is the share of them you outlast
function apply(place,n,kills,won){n=Math.max(2,n|0);place=Math.max(1,Math.min(n,place|0));kills=kills|0;
 const R=S.elo,opp=[];for(let i=0;i<n-1;i++)opp.push(R+(i-(n-2)/2)*22);
 const E=opp.reduce((a,o)=>a+1/(1+Math.pow(10,(o-R)/400)),0)/opp.length,sc=(n-place)/(n-1);
 let d=Math.round(64*(sc-E))+Math.min(kills,5)*2+(won?8:0);if(S.elo+d<0)d=-S.elo;
 const a=tier(R);S.elo+=d;S.games++;S.kills+=kills;if(won)S.wins++;if(place<=5)S.top5++;S.best=Math.max(S.best,S.elo);S.last=d;save();
 const b=tier(S.elo);return{d,from:R,to:S.elo,before:a,after:b,up:b.k>a.k||(b.k===a.k&&b.div!==a.div&&b.pct>a.pct),promoted:b.k>a.k,place,n,kills,won:!!won}}
// how hard the CPU plays at this rating (DIFF levels): Bronze and Silver face Normal fighters, Gold and up face Hard ones
const diff=()=>tier(S.elo).k>=2?'hard':'normal';
window.RANK={on:()=>ON,set(v){ON=!!v;try{localStorage.setItem(ONK,ON?'1':'0')}catch(e){}},state:()=>Object.assign({},S),tier,label,apply,diff,TIERS,
 reset(){Object.assign(S,{elo:1000,games:0,wins:0,top5:0,kills:0,best:1000,last:0});save()}};
})();
