/* Direct player-to-player connection (WebRTC). The two browsers swap their connection details through the Supabase sig_send / sig_poll
   functions, then talk directly. Fast state updates ride an unreliable channel (like UDP), everything else a reliable one. */
(()=>{
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:global.stun.twilio.com:3478'}]};
// Strict home/mobile networks sometimes need a relay: add {urls:'turn:your.host:3478',username:'..',credential:'..'} to the list above.
function link(o){const room=o.room,offerer=!!o.offerer,timeout=o.timeout||25000;
 return new Promise((resolve,reject)=>{
  if(!window.RTCPeerConnection)return reject(new Error('webrtc'));
  const pc=new RTCPeerConnection(ICE);let done=false,after=o.after||0,pend=[],hasRemote=false,rel=null,unr=null,tm=null,poll=null,busy=false,disc=null,relAt=0;
  const conn={open:false,onmessage:null,onclose:null,pc,
   send(m){const s=JSON.stringify(m);try{if(m.t==='s'&&unr&&unr.readyState==='open')unr.send(s);else if(rel&&rel.readyState==='open')rel.send(s)}catch(e){}},
   close(){clearInterval(poll);clearTimeout(tm);conn.open=false;try{rel&&rel.close()}catch(e){}try{unr&&unr.close()}catch(e){}try{pc.close()}catch(e){}}};
  const stop=()=>{clearInterval(poll);clearTimeout(tm)};
  const fail=e=>{if(done)return;done=true;stop();try{pc.close()}catch(x){}reject(e)};
  const closed=()=>{if(conn.open){conn.open=false;conn.onclose&&conn.onclose()}};
  const sig=(k,b)=>Supa.rpc('sig_send',{p_room:room,p_kind:k,p_body:b}).catch(()=>{});
  const fin=()=>{if(done)return;done=true;stop();conn.open=true;resolve(conn)};
  const check=()=>{if(done||!rel||rel.readyState!=='open')return;if(!relAt)relAt=Date.now();
   if((unr&&unr.readyState==='open')||Date.now()-relAt>1500)fin();else setTimeout(check,150)};
  const wire=ch=>{if(ch.label==='r')rel=ch;else unr=ch;ch.onopen=check;ch.onclose=closed;
   ch.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}conn.onmessage&&conn.onmessage(m)}};
  pc.onicecandidate=e=>{if(e.candidate)sig('ice',e.candidate.toJSON())};
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;
   if(s==='failed'){if(!done)fail(new Error('ice'));else closed()}
   else if(s==='closed')closed();
   else if(s==='disconnected'){clearTimeout(disc);disc=setTimeout(()=>{if(pc.connectionState==='disconnected'){if(!done)fail(new Error('ice'));else closed()}},6000)}
   else if(s==='connected')clearTimeout(disc)};
  const flush=async()=>{for(const c of pend.splice(0))try{await pc.addIceCandidate(c)}catch(e){}};
  const handle=async r=>{try{
   if(r.kind==='offer'&&!offerer){await pc.setRemoteDescription(r.body);hasRemote=true;await flush();const a=await pc.createAnswer();await pc.setLocalDescription(a);sig('answer',pc.localDescription.toJSON())}
   else if(r.kind==='answer'&&offerer){await pc.setRemoteDescription(r.body);hasRemote=true;await flush()}
   else if(r.kind==='ice'){if(hasRemote)await pc.addIceCandidate(r.body);else pend.push(r.body)}}catch(e){}};
  const pump=async()=>{if(busy||done)return;busy=true;try{const rows=await Supa.rpc('sig_poll',{p_room:room,p_after:after})||[];for(const r of rows){after=Math.max(after,r.id);await handle(r)}}catch(e){}busy=false};
  if(offerer){wire(pc.createDataChannel('r',{ordered:true}));wire(pc.createDataChannel('u',{ordered:false,maxRetransmits:0}));
   pc.createOffer().then(of=>pc.setLocalDescription(of)).then(()=>sig('offer',pc.localDescription.toJSON())).catch(fail)}
  else pc.ondatachannel=e=>wire(e.channel);
  poll=setInterval(pump,500);pump();tm=setTimeout(()=>fail(new Error('timeout')),timeout)})}
window.RTC={link};
})();
