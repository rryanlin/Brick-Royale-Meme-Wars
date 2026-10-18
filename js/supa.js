/* Tiny Supabase client (no library): anonymous sign-in and function calls over fetch. */
(()=>{
const C=window.BB_CONFIG||{},KEY='brickbrawl.sb';let ses=null,inflight=null;try{ses=JSON.parse(localStorage.getItem(KEY))}catch(e){}
const save=()=>{try{ses?localStorage.setItem(KEY,JSON.stringify(ses)):localStorage.removeItem(KEY)}catch(e){}};
const hdr=tok=>{const h={'apikey':C.SUPABASE_KEY,'Content-Type':'application/json'};if(tok)h.Authorization='Bearer '+tok;return h};
async function post(path,body,tok){const r=await fetch(C.SUPABASE_URL+path,{method:'POST',headers:hdr(tok),body:JSON.stringify(body||{})});
 const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
 if(!r.ok){const er=new Error((j&&(j.message||j.msg||j.error_description||j.hint))||('HTTP '+r.status));er.status=r.status;er.body=j;throw er}return j}
const stamp=s=>{s.expires_at=s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600);return s};
function auth(){if(!C.SUPABASE_URL||!C.SUPABASE_KEY)return Promise.reject(new Error('not configured'));
 if(ses&&ses.access_token&&ses.expires_at-Date.now()/1000>60)return Promise.resolve(ses);
 if(inflight)return inflight;
 inflight=(async()=>{try{
  if(ses&&ses.refresh_token){try{ses=stamp(await post('/auth/v1/token?grant_type=refresh_token',{refresh_token:ses.refresh_token}));save();return ses}catch(e){if(!e.status||e.status>=500)throw e;ses=null}}
  ses=stamp(await post('/auth/v1/signup',{data:{}}));save();return ses}finally{inflight=null}})();
 return inflight}
async function rpc(fn,args,retry){const s=await auth();let r;
 try{r=await fetch(C.SUPABASE_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:hdr(s.access_token),body:JSON.stringify(args||{})})}catch(e){throw new Error('network')}
 if(r.status===401&&!retry){ses=null;save();return rpc(fn,args,1)}
 const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
 if(!r.ok){const er=new Error((j&&(j.message||j.hint))||('HTTP '+r.status));er.status=r.status;throw er}return j}
window.Supa={auth,rpc,uid:()=>ses&&ses.user&&ses.user.id,configured:()=>!!(C.SUPABASE_URL&&C.SUPABASE_KEY)};
})();
