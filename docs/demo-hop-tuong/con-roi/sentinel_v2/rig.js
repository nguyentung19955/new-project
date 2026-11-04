// Con rối 2D: mảnh rời + khung xương, nội suy mượt 60fps
const RIG={};
RIG.load=async function(def,base){const imgs={};await Promise.all(Object.keys(def.parts).map(k=>new Promise(r=>{const i=new Image();i.onload=r;i.src=base+def.parts[k].img;imgs[k]=i;})));return {def,imgs};};
const ease={lin:t=>t,inOut:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,out:t=>1-Math.pow(1-t,3),in:t=>t*t*t,back:t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}};
RIG.ease=ease;
// clip: {dur, loop, keys:[{t, ease, pose:{part:{a,x,y}}}]}
RIG.sample=function(clip,time){
  let t=clip.loop?time%clip.dur:Math.min(time,clip.dur);
  const ks=clip.keys; let i=0; while(i<ks.length-1&&ks[i+1].t<=t) i++;
  const k0=ks[i],k1=ks[Math.min(i+1,ks.length-1)];
  const span=(k1.t-k0.t)||1; const u=(ease[k1.ease||'inOut'])(Math.max(0,Math.min(1,(t-k0.t)/span)));
  const out={}; const names=new Set([...Object.keys(k0.pose),...Object.keys(k1.pose)]);
  for(const n of names){const a=k0.pose[n]||{},b=k1.pose[n]||{};out[n]={a:(a.a||0)+((b.a||0)-(a.a||0))*u,x:(a.x||0)+((b.x||0)-(a.x||0))*u,y:(a.y||0)+((b.y||0)-(a.y||0))*u};}
  return out;};
RIG.add=function(...ps){const o={};for(const p of ps)for(const n in p){o[n]=o[n]||{a:0,x:0,y:0};o[n].a+=p[n].a||0;o[n].x+=p[n].x||0;o[n].y+=p[n].y||0;}return o;};
RIG.draw=function(ctx,R,pose,x,y,scale,flip,swap){
  const D=R.def; const M={};
  const world=n=>{ if(M[n]) return M[n]; const p=D.parts[n]; const q=pose[n]||{}; const po={a:q.a||0,x:q.x||0,y:q.y||0};
    let m=p.parent?world(p.parent):new DOMMatrix().translate(x,y).scale(flip?-scale:scale,scale);
    const at=p.at||[0,0]; const pp=p.parent?D.parts[p.parent].pivot:[0,0];
    m=m.translate(at[0]-pp[0]+po.x,at[1]-pp[1]+po.y).rotate((p.rest||0)+po.a).scale(p.s||1);
    M[n]=m; return m;};
  for(const n of D.order){const p=D.parts[n]; let img=R.imgs[n]; let piv=p.pivot;
    if(swap&&swap[n]){img=R.imgs[swap[n]];piv=D.parts[swap[n]].pivot;}
    const m=world(n).translate(-piv[0],-piv[1]); ctx.setTransform(m); ctx.drawImage(img,0,0);}
  ctx.setTransform(1,0,0,1,0,0);};
if(typeof module!=='undefined') module.exports=RIG;
