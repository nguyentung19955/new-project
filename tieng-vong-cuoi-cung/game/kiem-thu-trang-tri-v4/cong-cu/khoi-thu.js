/* ======================= THỬ – chỉ có trong game/kiem-thu-trang-tri-v4/kiem-thu.html, KHÔNG có trong demo.html =======================
   demo.html đã có sẵn: ?tt=0 (tắt trang trí), ?vao=quai | ?vao=boss, ?hitbox=1 / phím H. Khối này thêm:
     ?vao=cong2    vào thẳng nửa sau Cổng làng (bệ ván treo, cổng)
     ?quai=0       bỏ quái Sân chuông (chỉ để quay video Lam đi qua màn, không đánh nhau)
     ?ghi=1        chế độ chụp / quay: không tự chạy, mỗi khung gọi TVTHU.khung() (60 bước/giây cố định, 1 bước = 1 khung video) */
const THU=(()=>{ let q; try{ q=new URLSearchParams(location.search); }catch(e){ q=new Map(); }
  return {vao:q.get('vao')||'', ghi:q.get('ghi')==='1', quai:q.get('quai')!=='0'}; })();

/* ---------- vào nhanh ---------- */
const _newGame=newGame;
newGame=function(){ _newGame(); if(THU.vao==='cong2'){ placePlayer(A2.x0*T+40, FLOOR-pl.h); pl.drawT=0; }
  if(!THU.quai) for(const q of Q){ q.gone=true; q.dead=true; }
  for(const q of Q) q.H=null; boss.H=null; };

/* ---------- bot kịch bản (chỉ để quay video) ----------
   Mỗi đoạn: đặt Lam ở x0, chạy phải, nhảy khi có ô chặn ngay trước chân hoặc hố phía trước; hết đoạn khi fx ≥ x1 (hoặc hết thời gian).
   Đoạn 'a2': nhảy lên bệ ván treo, đứng công tắc ghi Tiếng Vọng mở cổng, qua cổng. Đoạn 'boss': đi vào, boss thức; sau 1 đòn
   đập ép máu về 9 để boss treo lên trần (pha 2) – chỉ để xem trần, không phải chơi thật. */
const BOT={on:false, s:'', t:0, xong:false, giuJ:false, giuT:0, dung:0, x1:0, p2:false};
function botTha(){ for(const k of KEYS){ kb[k]=0; } }
function botNhay(){ if(!BOT.giuJ){ BOT.giuJ=true; BOT.giuT=0; } }
function botGiu(){ if(!BOT.giuJ) return; kb.j=1; BOT.giuT++; if((pl.vy>=0 && !pl.onGround) || BOT.giuT>40) BOT.giuJ=false; }
function botChayPhai(fx,fy){
  const dac=(x,y)=>solidC(tile(Math.floor(x/T),Math.floor(y/T)));
  kb.r=1;
  const vatCan=dac(fx+58,fy-4)||dac(fx+58,fy-40);
  const ho=!dac(fx+40,fy+8) && !dac(fx+40,fy+40) && fy>=FLOOR-1;   // hố ngay trước chân
  if(pl.onGround && (vatCan||ho) && !pl.jumping) botNhay();
}
function botBuoc(){
  if(!BOT.on || pl.dead) return; botTha(); BOT.t++; botGiu();
  const fx=pl.x+pl.w/2, fy=pl.y+pl.h;
  if(BOT.s==='a1'){ botChayPhai(fx,fy); const quaHo=fy<=12*T+1 && fx>=528;   // trên bậc 2: nhảy từ mép bậc để bay qua hố (608..704)
    if(pl.onGround && quaHo && !pl.jumping) botNhay();
    if(fx>820||BOT.t>600){ BOT.xong=true; BOT.on=false; botTha(); } }
  else if(BOT.s==='a2'){
    const beX0=A2.x0*T+5*T, ct=SW.g1;
    if(fx<beX0-70) kb.r=1;
    else if(fx<beX0-20 && pl.onGround && fy>=FLOOR){ kb.r=1; botNhay(); }
    else if(fy<FLOOR-20){ kb.r=1; }
    else if(fx<ct.x+16-6) kb.r=1;
    else { if(!BOT.dung) BOT.dung=BOT.t; const d=BOT.t-BOT.dung; if(d===4 || d===64) kb.v=1; if(d>=76) BOT.s='a2qua'; }
  } else if(BOT.s==='a2qua'){
    if(fx>1690 && fx<1730 && dA.open<0.6) { } else kb.r=1;
    if(fx>(A2.x0+A2.w)*T-60 || BOT.t>900){ BOT.xong=true; BOT.on=false; botTha(); }
  } else if(BOT.s==='rb'){ botChayPhai(fx,fy); if(fx>=BOT.x1||BOT.t>900){ BOT.xong=true; BOT.on=false; botTha(); } }
  else if(BOT.s==='boss'){
    const b=boss; if(pl.hp<2) pl.hp=P.maxHp;   // chỉ để quay: không để Lam chết giữa đoạn
    if(b.st==='sleep') kb.r=1;
    else if(b.st==='intro') { }
    else if(!BOT.p2 && (b.st==='slamRec')){ BOT.p2=true; b.hp=9; }          // sau cú đập đầu tiên: ép sang pha 2 (treo trần)
    else if(b.phase===2 && b.st==='hang' && BOT.t>BOT.x1){ BOT.xong=true; BOT.on=false; botTha(); }
    if(b.st==='slamAir' && Math.abs((b.x+b.w/2)-fx)<200 && pl.onGround) { kb.l=1; }   // né nhẹ
  }
}
const _step=step;
step=function(){ botBuoc(); _step(); };

/* ---------- API chụp / quay (TVTHU) ---------- */
if(THU.ghi) loop=function(){};
window.TVTHU={
  thu:THU, bot:BOT,
  async batDau(){ while(!(window.TVDEMO&&TVDEMO.ready&&loadEl.hidden)) await wait(50); audioInit(); startEl.hidden=true; S.paused=false; document.getElementById('warn').hidden=true; },
  /* đặt Lam đứng sàn tại x (thế giới), camera đúng camx (clamp trong phòng), đi 2 bước cho ổn, vẽ 1 khung */
  datCam(x,camx,y){ placePlayer(x, (y===undefined?FLOOR:y)-pl.h); pl.drawT=0; pl.face=1; const r=ROOMS[S.room];
    S.camx=S.pcx=clamp(camx,r.x0*T,(r.x0+r.w)*T-W); S.look=48; for(let i=0;i<2;i++){ savePrev(); step(); } S.camx=S.pcx=clamp(camx,r.x0*T,(r.x0+r.w)*T-W); S.camy=0; render(1);
    return {camx:S.camx, ox, oy, x:pl.x, y:pl.y, room:S.room}; },
  khung(n){ for(let i=0;i<(n||1);i++){ savePrev(); step(); } render(1);
    return {f:S.frame, x:+pl.x.toFixed(1), y:+pl.y.toFixed(1), ox, room:S.room, xong:BOT.xong, bot:BOT.s, boss:boss.st, pha:boss.phase, hp:pl.hp}; },
  /* bắt đầu một đoạn bot: s = 'a1' | 'a2' | 'rb' | 'boss'; x0 = đặt Lam; x1 = mốc kết thúc (rb: x; boss: số khung tối thiểu sau khi treo) */
  batBot(s,x0,x1){ if(x0!==undefined){ placePlayer(x0, FLOOR-pl.h); pl.drawT=0; } Object.assign(BOT,{on:true, s, t:0, dung:0, xong:false, giuJ:false, x1:x1||0, p2:false}); },
  tocMau(){ pl.hp=P.maxHp; },
  hb(v){ hbSet(!!v); },
  tt(v){ TT.bat=!!v; },
  /* đặt tiến độ mở cổng Cổng làng (0 = đóng, 0..1 = đang mở, 1 = mở hẳn) rồi vẽ 1 khung – chỉ để chụp 3 trạng thái cổng rễ */
  cong(o){ dA.force=true; dA.open=o; dA.latched=o>=1; render(1); return {open:dA.open}; },
  so(){ return {tt:TT.so, lc:LC_SO, qbr:QBR.so, bk:BK, dat:Object.fromEntries(Object.entries(TT.DL).map(([k,d])=>[k,(d.dat||[]).length]))}; }
};
(function hienSo(){ if(!(window.TVDEMO&&TVDEMO.ready)){ setTimeout(hienSo,100); return; } const p=document.createElement('p');
  p.style.cssText='font-size:13px;color:var(--soft)'; p.textContent='Bản KIỂM THỬ trang trí địa hình v4 (sinh từ demo.html) – ?tt=0 tắt trang trí, H bật collider, ?vao=cong2|quai|boss. '+(TT.bat?'Trang trí: BẬT':'Trang trí: TẮT');
  document.querySelector('#start .box').insertBefore(p,document.getElementById('btn-start')); })();
