/* Player profile: display name (asked the first time you press Play) plus an OPTIONAL public Solana wallet address.
   The wallet is only used to look up whether it holds the memecoin; the game never connects to a wallet, never asks you to sign anything and
   never sends the address anywhere except the read-only balance lookup. Everything is saved in this browser only.
   To switch the holder check on at launch, set TOKEN_MINT (the memecoin's mint address) in js/config.js. */
(()=>{
const KEY='brickbrawl.profile',CF=()=>window.BB_CONFIG||{};let P0={name:'',wallet:'',holder:false,checked:0};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')P0=Object.assign(P0,s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P0))}catch(e){}try{document.dispatchEvent(new Event('bb-profile'))}catch(e){}};
// ---- name filter: swears, slurs, sexual/hate terms and "<religion or race> + insult" combinations (word lists are ROT13 so the file stays readable)
const E=s=>s.replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-97+13)%26+97)).split(' ');
const STRICT=E('shpx fuvg ovgpu phag chffl juber fyhg onfgneq nffubyr nefrubyr obyybpx jnax gjng avttre avttn avtt snttbg sntt ergneq genaal ornare jrgonpx enturnq gbjryurnq fnaqavt pbbanff anmv uvgyre urvyuvgyre xxx fjnfgvxn ubybpnhfg trabpvqr crqb cnrqb encvfg zbyrfg vaprfg cbea qvyqb oybjwbo unaqwbo wvmm phzfubg uragnv znfgheong pbpxfhpx zbgureshpx qvpxurnq ohyyfuvg ubefrfuvg');
const WORD=E('nff phz pbpx qvpx snt fcvp puvax tbbx xvxr pbba qlxr cnxv gneq fcnm zbat frk nany cravf intvan obbo obbof gvg gvgf zvys ubeal ahqr ahqrf avccyr encr encvfg xlf vfvf pevccyr cevpx funt fynt ohttre abapr');
const ID=E('wrj wrjvfu whqnvfz zhfyvz vfynz vfynzvp puevfgvna pngubyvp uvaqh ohqquvfg fvxu oynpx juvgr nfvna nsevpna neno zrkvpna vaqvna puvarfr wncnarfr xberna yngvab uvfcnavp tnl yrfovna genaf vfenryv cnyrfgvavna');
const NEGL=E('fynir xvyy fphz svygu qvegl obzo ohea ungr unat ylapu greebe irezva genfu pnapre zbaxrl fhouhzna vasrevbe qrcbeg trabpvqr anmv uvgyre');
const NEGS=E('qvr eng ncr cvt tnf xlf');
const PHR=E('juvgrcbjre juvgrcevqr tnfpunzore znfgrepenpr nelna fvrt');
const RES=E('nqzva zbqrengbe bssvpvny fgnss');
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','@':'a','$':'s','!':'i','+':'t','|':'i'},LEETL=Object.assign({},LEET,{'1':'l','|':'l','!':'l'});
const nrm=(s,m)=>{s=String(s).toLowerCase();let o='';for(const ch of s)o+=m[ch]||ch;return o.replace(/[^a-z]/g,'')},col=s=>s.replace(/(.)\1+/g,'$1');
const OKW=['therapist','scunthorpe','shitake','shiitake','torpedo','swank','retardant'];
function bad(name){const raw=String(name||'');if(!raw)return false;
 const toks=raw.replace(/([a-z])([A-Z])/g,'$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean),vs=k=>[k,k.replace(/(.)\1{2,}/g,'$1$1'),k.replace(/(.)\1{2,}/g,'$1')];
 for(const m of[LEET,LEETL]){let n=nrm(raw,m);OKW.forEach(w=>{n=n.split(w).join('')});const c=col(n);
  if(STRICT.some(w=>n.includes(w)||(col(w).length>=4&&c.includes(col(w)))))return true;
  if(PHR.some(w=>n.includes(w))||n.includes('admin')||n.includes('moderator'))return true;
  if(toks.some(t=>RES.includes(nrm(t,m))))return true;
  if(ID.some(w=>n.includes(w))){if(NEGL.some(w=>n.includes(w)))return true;
   for(const i of ID)for(const g of NEGS)if(n.includes(i+g)||n.includes(g+i))return true}
  for(const t of toks){if(vs(nrm(t,m)).some(k=>WORD.some(w=>k===w||k===w+'s')))return true}
  const j=toks.map(t=>nrm(t,m)).join('');if(vs(j).some(k=>WORD.some(w=>w.length>=3&&k===w)))return true}
 return false}
const clean=n=>{n=String(n||'').replace(/[^A-Za-z0-9_]/g,'').slice(0,16);return n.length>=3&&!bad(n)?n:''};
const NAME_OK=/^[A-Za-z0-9_]{3,16}$/,WAL_OK=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const ov=document.createElement('div');ov.id='prof';
ov.innerHTML='<div class="wbox"><h2>CHOOSE YOUR NAME</h2><p class="pnote">This is the name other players see.</p>'+
 '<input id="pfn" maxlength="16" placeholder="PepeTheFrog" autocomplete="off" autocapitalize="off" spellcheck="false"><p class="perr" id="pfe">&nbsp;</p>'+
 '<div class="pwal"><label for="pfw">SOLANA WALLET <em>OPTIONAL</em></label><input id="pfw" placeholder="Paste your public wallet address" autocomplete="off" autocapitalize="off" spellcheck="false">'+
 '<small>Hold <span class="tk">$BRICKROYALE</span> in this wallet to unlock a hidden special character, rainbow name on the leaderboard, and a custom nametag in game! <b>*READ ONLY*</b> We won\u2019t ask you for any passwords or to connect anything.</small></div>'+
 '<div class="wbtn"><button id="pfok">Let’s go</button><button id="pfun" type="button">Unlink wallet</button><button id="pfx">Cancel</button></div></div>';
document.body.appendChild(ov);
const $$=id=>document.getElementById(id);let after=null,editing=false;
function open(cb,edit,focus){after=cb||null;editing=!!edit;$$('pfn').value=P0.name;$$('pfw').value=P0.wallet;$$('pfe').innerHTML='&nbsp;';$$('pfx').style.display=edit?'':'none';$$('pfun').style.display=edit&&P0.wallet?'':'none';
 ov.querySelector('h2').textContent=edit?(focus==='wallet'?'LINK YOUR WALLET':'YOUR PROFILE'):'CHOOSE YOUR NAME';ov.classList.toggle('wfocus',focus==='wallet');ov.style.display='flex';setTimeout(()=>$$(focus==='wallet'?'pfw':'pfn').focus(),30)}
function close(){ov.style.display='none'}
function ok(){const n=$$('pfn').value.trim(),w=$$('pfw').value.trim(),e=$$('pfe');
 if(!NAME_OK.test(n)){e.textContent='Use 3 to 16 letters, numbers or underscores, like PepeTheFrog.';$$('pfn').focus();return}
 if(bad(n)){e.textContent='That name is not allowed. Please pick a different one.';$$('pfn').focus();return}
 if(w&&!WAL_OK.test(w)){e.textContent='That does not look like a Solana wallet address. Leave it empty to skip.';$$('pfw').focus();return}
 const changed=w!==P0.wallet;P0.name=n;P0.wallet=w;if(changed){P0.holder=false;P0.checked=0}save();close();
 if(w)check(true);else{window.UIrefresh&&UIrefresh()}
 const cb=after;after=null;cb&&cb()}
$$('pfun').onclick=()=>{$$('pfw').value='';ok()};
$$('pfok').onclick=ok;$$('pfx').onclick=()=>{after=null;close()};
ov.addEventListener('keydown',e=>{if(e.key==='Enter')ok();if(e.key==='Escape'&&editing)$$('pfx').click();e.stopPropagation()});
ov.addEventListener('click',e=>{if(e.target===ov&&editing)$$('pfx').click()});
// read-only holder lookup (needs TOKEN_MINT in js/config.js); never blocks play and fails quietly
async function check(force){const c=CF();if(!P0.wallet||!c.TOKEN_MINT)return P0.holder;if(!force&&Date.now()-P0.checked<6e5)return P0.holder;
 try{const r=await fetch(c.SOLANA_RPC||'https://api.mainnet-beta.solana.com',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getTokenAccountsByOwner',params:[P0.wallet,{mint:c.TOKEN_MINT},{encoding:'jsonParsed'}]})}),j=await r.json();
  const amt=((j.result&&j.result.value)||[]).reduce((s,a)=>s+(((((a.account||{}).data||{}).parsed||{}).info||{}).tokenAmount||{}).uiAmount||0,0),was=P0.holder;
  P0.holder=amt>(c.MIN_HOLD||0);P0.checked=Date.now();save();
  if(P0.holder&&!was&&window.PR)PR.toast('Holder verified! A secret character is waiting for you.');
  window.UIrefresh&&UIrefresh()}catch(e){}
 return P0.holder}
window.PROFILE={clean,bad,name:()=>P0.name,wallet:()=>P0.wallet,holder:()=>!!P0.holder,ensure:cb=>P0.name?cb():open(cb,false),edit:(cb,focus)=>open(cb,true,focus),check,
 short:()=>P0.wallet?P0.wallet.slice(0,4)+'\u2026'+P0.wallet.slice(-4):'',tokenLive:()=>!!CF().TOKEN_MINT,linked:()=>!!P0.wallet};
if(P0.wallet)setTimeout(()=>check(false),1500);
})();
