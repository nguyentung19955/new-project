/* ---------- QUÁI + BOSS vẽ từ MẢNH (game/runtime/quai-boss-runtime.js) ----------
   Neo = chân (quái: giữa đáy hitbox; boss: trục chuông, giữa đáy hitbox) ĐÚNG mặt đất (không lún như sheet chibi cũ).
   Tư thế tính lúc vẽ: QBR.tinh(H, bước, al) nội suy giữa 2 bước logic (al) → mượt ở 60/90/120 Hz.
   Nháy trắng: GAME quản lý (q.flash / b.flash) → phủ ảnh trắng cache sẵn; clip đã bỏ nháy nướng sẵn.
   Lóe vàng lấy đà / vỏ cứng quái gác: phủ ảnh vàng cache sẵn. Không xử lý pixel mỗi khung. */
let ANIM_AL=1;
const DO={n:0, tong:0, max:0, qb:0, qbMax:0, lan:0, ds:[],   // đo thời gian vẽ (ms) – toàn khung và riêng quái+boss
  ve(ms){ this.n++; this.tong+=ms; if(ms>this.max) this.max=ms; this.ds.push(ms); if(this.ds.length>4000) this.ds.shift(); },
  qbT(ms){ this.qb+=ms; if(ms>this.qbMax) this.qbMax=ms; },
  trung(){ (this.hurt||(this.hurt=[])).push({f:S.frame, quai:Q.map(q=>q.st+':'+q.t+(q.face>0?'→':'←')), boss:boss.st+':'+boss.t+(boss.face>0?'→':'←'), lam:[+(pl.x+pl.w/2).toFixed(1),+(pl.y+pl.h).toFixed(1)]}); },
  reset(){ this.n=this.tong=this.max=this.qb=this.qbMax=0; this.ds.length=0; }};
let qbKhung=0;
function nhay(f){ return f>0 ? (f>4?0.8:0.45) : 0; }   // cường độ nháy trắng theo bộ đếm nháy của game
function drawQuai(q,al){
  if(q.gone||!QB||!q.H) return;
  const x=lerp(q.px,q.x,al)+q.w/2-ox, y=lerp(q.py,q.y,al)+q.h-oy, flip=q.face>0;   // quái nhìn trái
  if(x<-140||x>W+140) return;
  const t0=performance.now();
  QBR.tinh(q.H,S.frame,ANIM_AL);
  ctx.globalAlpha=q.fade; if(q.st!=='die') bong(x,y-1,40,0.3); ctx.globalAlpha=1;
  let va=(q.guard&&!q.dead)?0.18:0;                                                  // vỏ cứng: ánh đồng
  if(q.st==='wind') va=Math.max(va,0.15+0.35*(0.5+0.5*Math.sin(q.t*0.7)));          // lấy đà: lóe vàng
  QBR.ve(ctx,'quai',q.H.cur,snap(x),snap(y),flip,{alpha:q.fade,trang:nhay(q.flash),vang:va});
  if(q.st==='wind'){ ctx.globalAlpha=1; at(x,y-150); ctx.fillStyle='#0C0F14'; ctx.fillRect(-2,-1,5,10); ctx.fillStyle='#E1B85A'; ctx.fillRect(-1,0,3,5); ctx.fillRect(-1,6,3,2); ctx.restore(); ctx.imageSmoothingEnabled=true; }
  ctx.globalAlpha=1;
  DO.qbT(performance.now()-t0);
}
function chain(x0,y0,x1,y1,c1,c2){
  const d=Math.hypot(x1-x0,y1-y0), n=Math.max(1,Math.floor(d/7));
  for(let i=0;i<=n;i++){ ctx.fillStyle=i%2?c1:c2; ctx.fillRect(Math.round(lerp(x0,x1,i/n))-3,Math.round(lerp(y0,y1,i/n))-3,6,6); }
}
function drawBoss(al){
  const b=boss; if(!QB||!b.H) return;
  const t0=performance.now();
  const X=lerp(b.px,b.x,al)+b.w/2-ox, Y=lerp(b.py,b.y,al)+b.h-oy, flip=b.face>0, top=Y-330;   // boss cao 330 px, neo = mặt dưới hitbox
  const hook=X, hang=b.phase===2 && !b.dead && (b.st==='hang'||b.st==='shakeCeil'||b.st==='rise'||(b.st==='toP2'&&b.t>30)||(b.st==='pulled'&&b.t<14));
  if(hang) chain(hook,-oy-6,hook,top+8,'#4A5A6E','#2A2C33');
  const s=SW.btn, bx=s.x+16-ox;
  if(b.phase===2 && !b.dead){
    ctx.fillStyle='#0C0F14'; ctx.beginPath(); ctx.arc(bx,58-oy,10,0,7); ctx.fill(); ctx.fillStyle='#9C6B30'; ctx.fillRect(bx-5,53-oy,10,10);
    if(b.st==='pulled' || (s.byEcho && b.st!=='stun')){
      const gl=(S.frame>>2)%2, c1=gl?'#E1B85A':'#9C6B30', c2=gl?'#F3E6C8':'#E1B85A';
      chain(bx,FLOOR-oy-20,bx,58-oy,c1,c2); chain(bx,58-oy,hook,58-oy,c1,c2);
      if(b.st==='pulled') chain(hook,58-oy,hook,top+8,c1,c2);
    }
  }
  if(b.st==='sweepPrep'){ sweepRect(SWR); const a=0.25+0.25*(0.5+0.5*Math.sin(b.t*0.6)), rx=SWR.x-ox;
    ctx.globalAlpha=a*0.6; ctx.fillStyle='#E1B85A'; ctx.fillRect(rx,SWR.y-oy,SWR.w,SWR.h);
    ctx.globalAlpha=Math.min(1,a*2.2); for(let k=0;k<SWR.w;k+=12) ctx.fillRect(rx+k,FLOOR-oy-4,8,4); ctx.globalAlpha=1; }
  if(b.st==='slamAir'){ const h=FLOOR-(b.y+b.h); bong(X,FLOOR-oy+2,Math.max(40,120-h*0.2),0.45); }
  else if(Y>FLOOR-oy-10) bong(X,Y-2,110,0.35);
  // Thân / tay: KHÔNG co giãn thêm ở đây (clip đã nhún / nén) → không cộng hai lần
  QBR.tinh(b.H,S.frame,ANIM_AL);
  const alpha=(b.st==='die' && b.t>120)?Math.max(0,1-(b.t-120)/50):1;
  const va=(b.st==='slamPrep'||b.st==='sweepPrep'||b.st==='intro')?0.12+0.3*(0.5+0.5*Math.sin(b.t*0.7)):0;
  QBR.ve(ctx,'boss',b.H.cur,snap(X),snap(Y),flip,{alpha,trang:nhay(b.flash),vang:va});
  if(b.st==='slamPrep'||b.st==='sweepPrep'){ at(X,top-30); ctx.fillStyle='#0C0F14'; ctx.fillRect(-3,-1,7,13); ctx.fillStyle='#E1B85A'; ctx.fillRect(-1,0,3,7); ctx.fillRect(-1,9,3,2); ctx.restore(); ctx.imageSmoothingEnabled=true; }
  ctx.globalAlpha=1;
  if(b.st==='stun'){ at(X,top+60);
    for(let i=0;i<5;i++){ const an=S.frame*0.09+i*1.2566, sx2=Math.round(Math.cos(an)*44), sy2=Math.round(Math.sin(an)*8);
      ctx.fillStyle='#0C0F14'; ctx.fillRect(sx2-2,sy2-1,5,3); ctx.fillRect(sx2-1,sy2-2,3,5);
      ctx.fillStyle=i%2?'#F3E6C8':'#E1B85A'; ctx.fillRect(sx2-1,sy2,3,1); ctx.fillRect(sx2,sy2-1,1,3); }
    ctx.restore(); ctx.imageSmoothingEnabled=true; }
  DO.qbT(performance.now()-t0);
}
