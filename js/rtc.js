/* Online link through Supabase Realtime (broadcast). Both players join a private room channel on your Supabase project and swap messages
   there, so the whole match runs on Supabase alone: no extra servers, no peer-to-peer, works on any network that can reach Supabase.
   Messages are batched: once every FLUSH ms each side sends one packet holding the newest position plus any events (shots, hits...).
   That keeps a match to about 20 messages a second each way, which matters because Supabase counts every message sent and received
   against a per-second cap (Free 100, Pro 500). The returned connection has the same shape the game already uses:
   {open, onmessage, onclose, send, close}. */
(()=>{
const C=window.BB_CONFIG||{},FLUSH=C.NET_MS||100;
function link(o){
 const room=o.room,timeout=o.timeout||25000;
 return new Promise(async(resolve,reject)=>{
  let ws=null,done=false,hb=null,fl=null,tm=null,ref=0,q=[],ps=null,lastS='',lastSAt=0,beating=0,gotHi=false;
  const topic='realtime:mm-'+room;
  const conn={open:false,onmessage:null,onclose:null,extra:FLUSH/2000,
   send(m){if(!conn.open||!m)return;
    if(m.t==='s'){const k=JSON.stringify(m),n=performance.now();if(k===lastS&&n-lastSAt<600)return;lastS=k;lastSAt=n;ps=m;return}
    q.push(m);if(m.t==='d'||m.t==='bye')flush()},
   close(){conn.open=false;stop();try{ws&&ws.close()}catch(e){}}};
  const stop=()=>{clearInterval(hb);clearInterval(fl);clearTimeout(tm)};
  const fail=e=>{if(done)return;done=true;stop();try{ws&&ws.close()}catch(x){}reject(e)};
  const closed=()=>{stop();if(conn.open){conn.open=false;conn.onclose&&conn.onclose()}else if(!done)fail(new Error('closed'))};
  const raw=(event,payload)=>{try{if(ws&&ws.readyState===1)ws.send(JSON.stringify({topic,event:'broadcast',payload:{type:'broadcast',event,payload},ref:String(++ref)}))}catch(e){}};
  const flush=()=>{if(!q.length&&!ps)return;const items=q.splice(0);if(ps){items.push(ps);ps=null}raw('g',{m:items})};
  const beat=(kind,n)=>{if(beating>=n)return;beating=n;let i=0;const t=setInterval(()=>{raw(kind,{});if(++i>=n){clearInterval(t);beating=0}},300);raw(kind,{})};
  const fin=()=>{if(done)return;done=true;clearTimeout(tm);conn.open=true;fl=setInterval(flush,FLUSH);resolve(conn)};
  function got(m){const p=m.payload&&m.payload.payload,ev=m.payload&&m.payload.event;
   if(ev==='g'){if(conn.open&&conn.onmessage&&p&&Array.isArray(p.m))for(const x of p.m)try{conn.onmessage(x)}catch(e){}}
   else if(ev==='hi'){gotHi=true;beat('ok',5)}
   else if(ev==='ok'){if(!done)fin();beat('ok',3)}}
  try{
   const s=await Supa.auth(900),base=C.SUPABASE_URL.replace(/^http/,'ws')+'/realtime/v1/websocket?apikey='+encodeURIComponent(C.SUPABASE_KEY)+'&vsn=1.0.0';
   if(done)return;
   ws=new WebSocket(base);
   tm=setTimeout(()=>fail(new Error('timeout')),timeout);
   ws.onopen=()=>{ws.send(JSON.stringify({topic,event:'phx_join',payload:{config:{broadcast:{ack:false,self:false},presence:{key:''},postgres_changes:[],private:false},access_token:s.access_token},ref:String(++ref),join_ref:'1'}));
    hb=setInterval(()=>{try{ws.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++ref)}))}catch(e){}},25000)};
   ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
    if(m.event==='phx_reply'&&m.topic===topic&&m.payload){
     if(m.payload.status==='ok'&&m.ref==='1'){let n=0;const t=setInterval(()=>{if(done||++n>80)return clearInterval(t);raw('hi',{})},400);raw('hi',{})}
     else if(m.payload.status==='error')fail(new Error('realtime: '+JSON.stringify(m.payload.response||'').slice(0,160)))}
    else if(m.event==='phx_error'||m.event==='phx_close'){if(m.topic===topic)closed()}
    else if(m.event==='broadcast'&&m.topic===topic)got(m)};
   ws.onclose=closed;ws.onerror=()=>{if(!done)fail(new Error('realtime socket'))}
  }catch(e){fail(e)}})}
window.RTC={link};
})();
