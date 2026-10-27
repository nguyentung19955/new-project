/* ======================= THỬ – chỉ có trong game/thu-cong-lang/thu-cong-lang.html, KHÔNG ghép vào demo.html =======================
   Tham số địa chỉ:
     ?tt=0         TẮT trang trí địa hình (để so TRƯỚC / SAU cùng vị trí camera)      ?vao=cong2   vào thẳng nửa sau Cổng làng (bệ, cổng)
     ?hitbox=1     bật overlay collider + hitbox (hoặc phím H / nút ▣ góc trên phải)
     ?ghi=1        chế độ chụp / quay: không tự chạy, mỗi khung gọi TVTHU.khung() (60 bước/giây cố định, 1 bước = 1 khung video) */
const THU=(()=>{ let q; try{ q=new URLSearchParams(location.search); }catch(e){ q=new Map(); }
  return {tt:q.get('tt')!=='0', vao:q.get('vao')||'', ghi:q.get('ghi')==='1'}; })();
TT.bat=THU.tt;

/* ---------- vào nhanh ---------- */
const _newGame=newGame;
newGame=function(){ _newGame(); if(THU.vao==='cong2'){ placePlayer(A2.x0*T+40, FLOOR-pl.h); pl.drawT=0; } for(const q of Q) q.H=null; boss.H=null; };

/* ---------- bot kịch bản: chạy / nhảy qua Cổng làng (chỉ để quay video) ----------
   A1: chạy phải, nhảy khi có ô chặn ngay trước chân hoặc hố phía trước; tới chân khối tường (x 896, cao 10 ô – cần nhảy tường
   + Tiếng Vọng, bot không làm) thì "cắt cảnh" sang A2. A2: chạy phải, nhảy lên bệ rễ đỡ, đứng công tắc mở cổng, qua cổng tới cuối phòng. */
const BOT={on:false, s:'a1', t:0, xong:false, giuJ:false, giuT:0, dung:0};
function botTha(){ for(const k of KEYS){ kb[k]=0; } }
// nhảy: GIỮ phím nhảy suốt pha bay lên (game cắt nhảy khi thả sớm → nhảy ngắn), thả ở đỉnh
function botNhay(){ if(!BOT.giuJ){ BOT.giuJ=true; BOT.giuT=0; } }
function botGiu(){ if(!BOT.giuJ) return; kb.j=1; BOT.giuT++; if((pl.vy>=0 && !pl.onGround) || BOT.giuT>40) BOT.giuJ=false; }
function botBuoc(){
  if(!BOT.on || pl.dead) return; botTha(); BOT.t++; botGiu();
  const fx=pl.x+pl.w/2, fy=pl.y+pl.h;                       // chân Lam
  const dac=(x,y)=>solidC(tile(Math.floor(x/T),Math.floor(y/T)));
  if(BOT.s==='a1'){
    kb.r=1;
    if(fx>820){ placePlayer(A2.x0*T+40, FLOOR-pl.h); pl.drawT=0; BOT.s='a2'; BOT.t=0; return; }   // cắt cảnh
    const vatCan=dac(fx+58,fy-4)||dac(fx+58,fy-40);                 // ô chặn trước mặt ~2 ô: nhảy sớm để không đâm vào mặt bậc
    const quaHo=fy<=12*T+1 && fx>=528;                                   // đang trên bậc 2: nhảy từ mép bậc để bay qua hố (608..704)
    if(pl.onGround && (vatCan||quaHo) && !pl.jumping) botNhay();
  } else if(BOT.s==='a2'){
    const beX0=A2.x0*T+5*T, beX1=A2.x0*T+8*T, ct=SW.g1;
    if(fx<beX0-70) kb.r=1;
    else if(fx<beX0-20 && pl.onGround && fy>=FLOOR){ kb.r=1; botNhay(); }   // bật lên bệ rễ đỡ
    else if(fy<FLOOR-20){ kb.r=1; }                                          // trên bệ: chạy tới mép rồi rơi xuống
    else if(fx<ct.x+16-6) kb.r=1;
    else {   // trên công tắc: ghi Tiếng Vọng (V) đứng giữ công tắc ~1 s rồi dừng ghi (V) → bóng giữ công tắc, cổng mở
      if(!BOT.dung) BOT.dung=BOT.t;
      const d=BOT.t-BOT.dung;
      if(d===4 || d===64) kb.v=1;
      if(d>=76) BOT.s='qua';
    }
  } else if(BOT.s==='qua'){
    if(fx>1690 && fx<1730 && dA.open<0.6) { /* chờ cổng mở hẳn */ }
    else kb.r=1;
    if(fx>(A2.x0+A2.w)*T-60){ BOT.xong=true; BOT.on=false; botTha(); }
  }
}
const _step=step;
step=function(){ botBuoc(); _step(); };

/* ---------- API chụp / quay (TVTHU) ---------- */
if(THU.ghi) loop=function(){};   // chụp / quay: không tự chạy theo rAF – trình chụp gọi TVTHU.khung() / datCam()
window.TVTHU={
  thu:THU, bot:BOT,
  async batDau(){ while(!(window.TVDEMO&&TVDEMO.ready&&loadEl.hidden)) await wait(50); audioInit(); startEl.hidden=true; S.paused=false; document.getElementById('warn').hidden=true; },
  /* đặt Lam đứng sàn tại x (thế giới), camera đúng camx (clamp trong phòng), đi 2 bước cho ổn, vẽ 1 khung */
  datCam(x,camx,y){ placePlayer(x, (y===undefined?FLOOR:y)-pl.h); pl.drawT=0; pl.face=1; const r=ROOMS[S.room];
    S.camx=S.pcx=clamp(camx,r.x0*T,(r.x0+r.w)*T-W); S.look=48; for(let i=0;i<2;i++){ savePrev(); step(); } S.camx=S.pcx=clamp(camx,r.x0*T,(r.x0+r.w)*T-W); render(1);
    return {camx:S.camx, ox, oy, x:pl.x, y:pl.y, room:S.room}; },
  khung(n){ for(let i=0;i<(n||1);i++){ savePrev(); step(); } render(1);
    return {f:S.frame, x:+pl.x.toFixed(1), y:+pl.y.toFixed(1), ox, room:S.room, xong:BOT.xong, bot:BOT.s, cong:+dA.open.toFixed(2)}; },
  batBot(){ BOT.on=true; BOT.s=S.room>=1?'a2':'a1'; BOT.t=0; BOT.dung=0; BOT.xong=false; BOT.giuJ=false; },
  hb(v){ hbSet(!!v); },
  tt(v){ TT.bat=!!v; },
  so(){ return {tt:TT.so, lc:LC_SO, qbr:QBR.so, bk:BK, dat:TT.DL['cong-lang'].dat.length}; }
};
// hiện số đo trang trí trên màn bắt đầu
(function hienSo(){ if(!(window.TVDEMO&&TVDEMO.ready)){ setTimeout(hienSo,100); return; } const p=document.createElement('p');
  p.style.cssText='font-size:13px;color:var(--soft)'; p.textContent='Bản thử trang trí địa hình Cổng làng – ?tt=0 tắt trang trí, H bật collider. '+(TT.bat?'Trang trí: BẬT':'Trang trí: TẮT');
  document.querySelector('#start .box').insertBefore(p,document.getElementById('btn-start')); })();
