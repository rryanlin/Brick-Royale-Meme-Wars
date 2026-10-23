/* Realtime hub: many named broadcast channels over ONE Supabase Realtime socket (same protocol as rtc.js).
   Used by the party roster (everyone in a party sees everyone, up to 3) and by the friends list (a personal inbox per player).
   HUB.join(name, onMessage) -> { send(obj), leave() }. Messages are plain JSON objects. The socket reconnects by itself and rejoins every channel.
   Without Supabase (the offline build) nothing happens: join() returns a handle that never delivers or sends. */
(()=>{
const C=window.BB_CONFIG||{},subs=new Map();
let ws=null,ref=0,hb=null,up=false,retry=0,tm=null,conn=false;
const topicOf=n=>'realtime:hub-'+String(n).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,90);
const raw=o=>{try{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));return true}catch(e){return false}};
function joinT(t,tok){raw({topic:t,event:'phx_join',payload:{config:{broadcast:{ack:false,self:false},presence:{key:''},postgres_changes:[],private:false},access_token:tok},ref:String(++ref),join_ref:String(ref)})}
function flush(t){const s=subs.get(t);if(!s||!s.ok)return;while(s.q.length)raw({topic:t,event:'broadcast',payload:{type:'broadcast',event:'m',payload:s.q.shift()},ref:String(++ref)})}
function connect(){
 if(ws||conn||!window.Supa||!Supa.configured()||!subs.size)return;conn=true;
 Supa.auth(900).then(s=>{conn=false;if(ws||!subs.size)return;
  const sock=new WebSocket(C.SUPABASE_URL.replace(/^http/,'ws')+'/realtime/v1/websocket?apikey='+encodeURIComponent(C.SUPABASE_KEY)+'&vsn=1.0.0');ws=sock;
  sock.onopen=()=>{up=true;retry=0;subs.forEach((v,t)=>{v.ok=false;joinT(t,s.access_token)});
   hb=setInterval(()=>raw({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++ref)}),25000)};
  sock.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
   const v=subs.get(m.topic);if(!v)return;
   if(m.event==='phx_reply'){if(m.payload&&m.payload.status==='ok'&&!v.ok){v.ok=true;flush(m.topic)}}
   else if(m.event==='phx_error'||m.event==='phx_close'){v.ok=false;setTimeout(()=>{if(subs.get(m.topic)===v&&ws&&up)Supa.auth(900).then(t=>{if(subs.get(m.topic)===v&&ws&&up)joinT(m.topic,t.access_token)}).catch(()=>{})},2000)}
   else if(m.event==='broadcast'){const p=m.payload&&m.payload.payload;if(p)v.cbs.forEach(f=>{try{f(p)}catch(x){}})}};
  const gone=()=>{if(ws!==sock)return;ws=null;up=false;clearInterval(hb);subs.forEach(v=>v.ok=false);
   if(subs.size){clearTimeout(tm);tm=setTimeout(connect,Math.min(15000,800*Math.pow(2,retry++)))}};
  sock.onclose=gone;sock.onerror=()=>{try{sock.close()}catch(x){}}
 }).catch(()=>{conn=false;if(subs.size){clearTimeout(tm);tm=setTimeout(connect,Math.min(15000,1500*Math.pow(2,retry++)))}})}
function join(name,cb){const t=topicOf(name);let v=subs.get(t);
 if(!v){v={cbs:new Set(),q:[],ok:false};subs.set(t,v);
  if(ws&&up){Supa.auth(900).then(s=>{if(subs.get(t)===v&&ws&&up)joinT(t,s.access_token)}).catch(()=>{})}else connect()}
 if(cb)v.cbs.add(cb);
 return{topic:t,send(o){const s=subs.get(t);if(!s||!o)return false;s.q.push(o);if(s.q.length>60)s.q.shift();flush(t);return true},
  ready:()=>{const s=subs.get(t);return!!(s&&s.ok)},
  leave(){const s=subs.get(t);if(!s)return;if(cb)s.cbs.delete(cb);if(!s.cbs.size){subs.delete(t);raw({topic:t,event:'phx_leave',payload:{},ref:String(++ref)});
    if(!subs.size){clearInterval(hb);clearTimeout(tm);const w=ws;ws=null;up=false;try{w&&w.close()}catch(x){}}}}}}
window.HUB={join,up:()=>up,count:()=>subs.size};
})();
