/* ======================= THỬ – chỉ có trong game/thu-quai-boss/thu-quai-boss.html, KHÔNG ghép vào demo.html =======================
   Tham số địa chỉ:
     ?vao=quai    vào thẳng Sân chuông (3 quái)          ?vao=boss   vào thẳng phòng boss        ?vao=boss2  boss vào pha 2 ngay sau khi gầm
     ?hitbox=1    bật overlay hitbox (hoặc phím H / nút ▣ góc trên phải)
     ?batTu=1     Lam không chết (vẫn trúng đòn, bị đẩy lùi) – dùng khi quay thử
     ?bot=quai | ?bot=boss   Lam tự đánh (để xem / quay)          ?kiem=1  chuỗi kiểm đòn cận cảnh 2 hướng, sát / rìa / ngoài tầm
     ?ghi=1       chế độ quay video: không tự chạy, mỗi khung gọi TVTHU.khung() (60 bước/giây cố định, 1 bước = 1 khung video) */
const THU=(()=>{ let q; try{ q=new URLSearchParams(location.search); }catch(e){ q=new Map(); }
  return {hb:q.get('hitbox')==='1', vao:q.get('vao')||'', batTu:q.get('batTu')==='1'||q.get('battu')==='1',
    ghi:q.get('ghi')==='1', bot:q.get('bot')||'', kiem:q.get('kiem')==='1', cap:''}; })();
if(THU.kiem){ THU.batTu=true; THU.hb=true; }
const btnHb=document.getElementById('btn-hb');
function hbSet(v){ THU.hb=v; btnHb.classList.toggle('on',v); document.body.classList.toggle('hb',v); btnHb.setAttribute('aria-pressed',v?'true':'false'); }
btnHb.addEventListener('click',e=>{ audioInit(); hbSet(!THU.hb); e.currentTarget.blur(); });
addEventListener('keydown',e=>{ if(e.code==='KeyH' && !e.repeat) hbSet(!THU.hb); });
hbSet(THU.hb);

/* ---------- vào nhanh ---------- */
const _newGame=newGame;
newGame=function(){
  _newGame();
  if(THU.vao==='quai'){ placePlayer(RB.x0*T+56, FLOOR-pl.h); pl.drawT=0; S.cp=BELLS[1]; BELLS[1].on=true; }
  else if(THU.vao==='boss'||THU.vao==='boss2'||THU.kiem){ placePlayer((RE.x0+3)*T, FLOOR-pl.h); pl.drawT=0; }
  for(const q of Q) q.H=null; boss.H=null;
};

/* ---------- overlay hitbox ---------- */
const HBV={x:0,y:0,w:0,h:0}, HBF={x:0,y:0,w:0,h:0};
function hbRect(x,y,w,h,c,kieu){   // toạ độ thế giới → màn
  const X=x-ox, Y=y-oy;
  if(kieu==='fill'){ ctx.globalAlpha=0.28; ctx.fillStyle=c; ctx.fillRect(X,Y,w,h); ctx.globalAlpha=1; ctx.setLineDash([]); }
  else ctx.setLineDash(kieu==='dash'?[5,4]:[]);
  ctx.strokeStyle=c; ctx.strokeRect(X+0.5,Y+0.5,w-1,h-1); ctx.setLineDash([]);
}
function hbChu(s,x,y,c){ ctx.fillStyle='rgba(12,15,20,.75)'; const w=ctx.measureText(s).width; ctx.fillRect(x-2,y-1,w+4,13); ctx.fillStyle=c||'#fff'; ctx.fillText(s,x,y); }
function nam(H,nv,ten,fx,fy,lat){ return QBR.hopManh(nv,H.cur,ten,fx,fy,lat,HBF); }
function drawHitbox(al){
  ctx.save(); ctx.lineWidth=1.5; ctx.font='bold 10px ui-monospace,Menlo,monospace'; ctx.textBaseline='top';
  const px=lerp(pl.px,pl.x,al), py=lerp(pl.py,pl.y,al), ddx=px-pl.x, ddy=py-pl.y;
  hbRect(px,py,pl.w,pl.h,'#4fb4ff');
  const hu=hurtBox(); hbRect(hu.x+ddx,hu.y+ddy,hu.w,hu.h,'#78e68c','dash');
  const hb=pl.dead?null:atkBox(pl,pl.atkN,pl.atkT,pl.face,HBV); if(hb) hbRect(hb.x+ddx,hb.y+ddy,hb.w,hb.h,'#ff4a4a','fill');
  if(echo && !echo.done && echo.cur.hb){ const c=echo.cur; hbRect(c.hx,c.hy,c.hw,c.hh,'#CEF0D6','fill'); }
  for(const q of Q){ if(q.gone||!q.H) continue; const qx=lerp(q.px,q.x,al), qy=lerp(q.py,q.y,al); if(qx-ox<-200||qx-ox>W+200) continue;
    const dq=qx-q.x;
    hbRect(qx,qy,q.w,q.h,'#4fb4ff');
    if(q.st==='wind'||q.st==='strike'){ quaiHitbox(q,QR); const bat=q.st==='strike'&&q.t>=5&&q.t<=10;
      hbRect(QR.x+dq,QR.y,QR.w,QR.h,bat?'#ff4a4a':'#ffa640',bat?'fill':'dash'); }
    if(q.st!=='die'){ const f=nam(q.H,'quai','tay-truoc',qx+q.w/2-ox+ox,qy+q.h,q.face>0); hbRect(f.x,f.y,f.w,f.h,'#e46cff','dash'); }
    hbChu(q.H.info,qx-ox-30,qy-oy-150,'#f6d0f6'); }
  if(S.room>=ROOMS.length-2 && boss.H){ const b=boss, bx=lerp(b.px,b.x,al), by=lerp(b.py,b.y,al), db=bx-b.x, fx=bx+b.w/2, fy=by+b.h;
    const cham=(b.st==='slamRec'&&b.t<=1)||(b.st==='stun'&&b.t<=1);
    hbRect(bx,by,b.w,b.h,cham?'#ff4a4a':(b.st==='slamAir'?'#ffa640':'#4fb4ff'),cham?'fill':(b.st==='slamAir'?'dash':''));
    if(b.st==='sweepPrep'||b.st==='sweep'){ sweepRect(SWR); const bat=b.st==='sweep'&&b.t>=2&&b.t<=10; hbRect(SWR.x+db,SWR.y,SWR.w,SWR.h,bat?'#ff4a4a':'#ffa640',bat?'fill':'dash'); }
    if(!b.dead) for(const n of ['tay-truoc','tay-sau']){ const f=nam(b.H,'boss',n,fx,fy,b.face>0); hbRect(f.x,f.y,f.w,f.h,'#e46cff','dash'); }
    hbChu(b.H.info+'  máu '+b.hp+'/'+b.max+'  pha '+b.phase,Math.max(4,Math.min(W-330,fx-ox-140)),Math.max(118,by-oy-16),'#f6d0f6'); }
  for(const w of WAVES) if(w.on) hbRect(w.x-10,FLOOR-24,20,24,'#ff4a4a','fill');
  for(const s of SHARDS) if(s.on){ if(s.st==='warn') hbRect(s.x-8,70,16,FLOOR-70,'#ffa640','dash'); else hbRect(s.x-8,s.y,16,22,'#ff4a4a','fill'); }
  // chú giải
  ctx.font='bold 10px ui-monospace,Menlo,monospace';
  hbChu('HITBOX (H)  xanh: thân  lục: vùng ăn đòn Lam  đỏ: đòn ĐANG gây sát thương  cam: sắp bật  tím: nắm tay (hình)',8,H-16,'#fff');
  if(THU.cap){ let cx=W/2, cy=46, fs=18; if(THU.kiem){ const t=tamManHinh(), c=khungCat(); cx=Math.min(Math.max(t[0],c[0]/2),W-c[0]/2); cy=Math.min(Math.max(t[1]-c[1]/2-20,0),H-c[1])+8; fs=c[0]<600?13:18; }
    ctx.font='bold '+fs+'px "Be Vietnam Pro",sans-serif'; const w=ctx.measureText(THU.cap).width; ctx.fillStyle='rgba(12,15,20,.82)'; ctx.fillRect(cx-w/2-8,cy,w+16,fs+9); ctx.fillStyle='#E1B85A'; ctx.fillText(THU.cap,cx-w/2,cy+4); }
  ctx.restore(); ctx.textBaseline='alphabetic';
}

/* ---------- đo khớp hình ↔ hitbox gameplay (mỗi bước logic, tư thế đúng của bước) ---------- */
const KHOP=[];
function ngang(a,b){ return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)); }
function doc(a,b){ return Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)); }
function giao(a,b){ const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x), h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y); return (w>0&&h>0)?w*h:0; }
let khopF=-1;
function doKhop(){
  if(S.frame===khopF) return; khopF=S.frame;   // khựng đòn (hitstop): bước không chạy → không ghi trùng
  for(const q of Q){ if(q.gone||!q.H||q.st!=='strike'||q.t<5||q.t>10) continue;
    QBR.tinh(q.H,S.frame,1); const f=QBR.hopManh('quai',q.H.cur,'tay-truoc',q.x+q.w/2,q.y+q.h,q.face>0,{}); quaiHitbox(q,QR);
    KHOP.push({loai:'quai-dam',huong:q.face>0?'phai':'trai',t:q.t,clip_ms:+q.H.t.toFixed(1),khung:QBR.khungSo('quai','dam',q.H.t),
      ngang_trong_hop:+(ngang(f,QR)/f.w).toFixed(3),doc_trong_hop:+(doc(f,QR)/f.h).toFixed(3),lam_trung:!!overlap(hurtBox(),QR),cap:THU.cap}); }
  const b=boss; if(!b.H) return;
  if(b.st==='sweep'&&b.t>=2&&b.t<=10){ QBR.tinh(b.H,S.frame,1); const f=QBR.hopManh('boss',b.H.cur,'tay-truoc',b.x+b.w/2,b.y+b.h,b.face>0,{}); sweepRect(SWR);
    KHOP.push({loai:'boss-quet',huong:b.face>0?'phai':'trai',t:b.t,clip_ms:+b.H.t.toFixed(1),khung:QBR.khungSo('boss','quet',b.H.t),
      ngang_trong_hop:+(ngang(f,SWR)/f.w).toFixed(3),day_nam_tay_so_dat:+(f.y+f.h-FLOOR).toFixed(2),cham_hop:giao(f,SWR)>0,lam_trung:!!overlap(hurtBox(),SWR),cap:THU.cap}); }
  if(b.st==='slamAir'||(b.st==='slamRec'&&b.t===0)){
    QBR.tinh(b.H,S.frame,1);
    const t1=QBR.hopManh('boss',b.H.cur,'tay-truoc',b.x+b.w/2,b.y+b.h,b.face>0,{}), t2=QBR.hopManh('boss',b.H.cur,'tay-sau',b.x+b.w/2,b.y+b.h,b.face>0,{});
    KHOP.push({loai:b.st==='slamAir'?'boss-dap-tren-khong':'boss-dap-tiep-dat',t:b.t,vy:+b.vy.toFixed(2),do_cao_game:+(FLOOR-(b.y+b.h)).toFixed(1),
      clip_ms:+b.H.t.toFixed(1),khung:QBR.khungSo('boss','dap',b.H.t),
      goc_than_tren_neo:+(-QBR.diemNut('boss',b.H.cur,'than')[1]).toFixed(2),   // gốc nút thân cao hơn điểm neo bao nhiêu px (nghỉ = 15,2) – không tăng khi bay = không cộng độ cao
      day_tay_truoc_so_dat:+(t1.y+t1.h-FLOOR).toFixed(2),day_tay_sau_so_dat:+(t2.y+t2.h-FLOOR).toFixed(2),lam_trung:b.st==='slamRec'&&!!overlap(hurtBox(),b),cap:THU.cap}); }
}

/* ---------- bot (Lam tự đánh) ---------- */
const BOT={rel:[], last:{}, s:'', t:0, ka:0, F:0, tx:0, xong:0, thu:0, hj:0};
function tha(){ for(const k of BOT.rel) kb[k]=0; BOT.rel.length=0; kb.l=kb.r=0; kb.j=BOT.hj>0?1:0; if(BOT.hj>0) BOT.hj--; }
function nhayBot(n){ if(BOT.hj<=0 && !I.j && !kb.j){ kb.j=1; BOT.hj=n; } }   // giữ nút nhảy n bước (nhả sớm = nhảy thấp)
function tap(k){ if(S.frame-(BOT.last[k]||-9)<2) return; kb[k]=1; BOT.rel.push(k); BOT.last[k]=S.frame; }
function di(d){ if(d<0) kb.l=1; else if(d>0) kb.r=1; if(d && pl.onGround && collide(pl.x+d*8,pl.y,pl.w,pl.h)) nhayBot(22); }   // vướng bậc / bệ đá: nhảy lên
function chem(){ if(!pl.atkN) tap('a'); else { const a=ATK[pl.atkN]; if(pl.atkT>=a.su+a.ac-1) tap('a'); } }
function botQuai(){
  const song=Q.filter(q=>!q.dead&&q.st!=='die'&&!q.gone), lc=pl.x+pl.w/2;
  if(!song.length){ if(!BOT.xong) BOT.xong=S.frame; if(S.frame-BOT.xong<60) return; di(1); return; }
  const q=song[0], qc=q.x+q.w/2, dx=qc-lc, adx=Math.abs(dx), d=Math.sign(dx)||1, cao=(q.y+q.h)<(pl.y+pl.h)-20;
  if(q.guard){   // quái gác vỏ cứng: chỉ Cộng hưởng mới đau → ghi 1 nhát chém bằng Tiếng Vọng rồi chém cùng lúc với bóng
    if(BOT.s===''){ if(adx>86){ di(d); return; } if(pl.face!==d){ di(d); return; } if(pl.onGround&&!pl.atkN&&Math.abs(pl.vx)<0.3){ tap('v'); BOT.s='ghi'; BOT.t=S.frame; } return; }
    if(BOT.s==='ghi'){ if(S.frame-BOT.t===6){ tap('a'); BOT.ka=S.frame-BOT.t; } if(S.frame-BOT.t>=6+30){ tap('v'); BOT.s='cho'; BOT.F=S.frame; } return; }
    if(BOT.s==='cho'){ if(S.frame-BOT.F===BOT.ka+1) tap('a'); if(S.frame-BOT.F>BOT.ka+90){ BOT.s=''; BOT.thu++; } return; }
    return;
  }
  const nguy=q.st==='wind'||(q.st==='strike'&&q.t<12);
  if(nguy && adx<178 && !cao){ di(-d); return; }
  if(cao){ di(d); if(pl.onGround && adx<230) nhayBot(22); return; }
  if(adx>104){ di(d); return; }
  if(pl.face!==d && !pl.atkN){ di(d); return; }
  chem();
}
function ranh(a){ const lc=pl.x+pl.w/2; return a<0?lc-ARENA0:ARENA1-lc; }   // khoảng trống tới mép sàn đấu theo hướng a
function botBoss(){
  const b=boss, lc=pl.x+pl.w/2, bc=b.x+b.w/2, dx=bc-lc, adx=Math.abs(dx), d=Math.sign(dx)||1;
  if(b.dead){ return; }
  if(b.st==='sleep'){ di(1); return; }
  for(const w of WAVES) if(w.on && (lc-w.x)*w.dir>0 && Math.abs(w.x-lc)<64 && pl.onGround){ nhayBot(10); break; }
  for(const s of SHARDS) if(s.on && Math.abs(s.x-lc)<34 && b.st!=='stun' && !rec){ di(s.x>lc?-1:1); return; }
  if(b.st!==BOT.bst){ if(b.st==='slamPrep'||b.st==='sweepPrep') BOT.nDon=(BOT.nDon||0)+1; BOT.bst=b.st; }
  switch(b.st){
    case 'intro': case 'toP2': return;
    case 'slamPrep': if(adx<240){ let a=-d; if(ranh(a)<150) a=d; di(a); } return;
    case 'slamAir': { if(!BOT.tx||b.t<=1) BOT.tx=bc+b.vx*38; const e=lc-BOT.tx, a=Math.sign(e)||(lc<(ARENA0+ARENA1)/2?1:-1);
      if(Math.abs(e)<210){ let c=a; if(ranh(c)<230-Math.abs(e)) c=-c; di(c); if(pl.onGround && pl.dashCd<=0) tap('s'); } return; }
    case 'sweepPrep': if(adx<300 && b.t>=24 && pl.onGround && (b.face>0?dx<0:dx>0)) nhayBot(30); if(pl.face!==d) di(d); return;
    case 'sweep': return;
    case 'hang': case 'shakeCeil': case 'rise': {
      const px=SW.btn.x+16;
      if(b.phase===2 && b.st!=='rise'){
        if(BOT.s==='keo'){ if(S.frame-BOT.t>=16){ tap('v'); BOT.s='thoat'; BOT.t=S.frame; } return; }
        if(BOT.s==='thoat'){ if(S.frame-BOT.t<40) di(1); else BOT.s=(echo&&echo.done&&!SW.btn.byEcho)?'':BOT.s; if(S.frame-BOT.t>200) BOT.s=''; return; }
        if(Math.abs(lc-px)>4){ di(Math.sign(px-lc)); return; }
        if(pl.onGround && !rec && Math.abs(pl.vx)<0.5){ tap('v'); BOT.s='keo'; BOT.t=S.frame; }
        return;
      }
      if(adx<200) di(-d); return; }
    case 'pulled': BOT.s=''; if(adx<190) di(-d); return;
    case 'stun': if(adx>130){ di(d); return; } if(pl.face!==d&&!pl.atkN){ di(d); return; } chem(); return;
    default:   // walk, slamRec, sweepRec
      if(b.phase===1 && (BOT.nDon||0)<4 && b.st==='walk'){ if(adx<175){ if(ranh(-d)>90) di(-d); else if(pl.face!==d) di(d); } else if(adx>210) di(d); else if(pl.face!==d) di(d); return; }   // pha 1: để boss ra đủ đập + quét trước khi dồn đánh
      if(adx>150){ di(d); return; } if(adx<110 && ranh(-d)>60){ di(-d); return; } if(pl.face!==d&&!pl.atkN){ di(d); return; } chem();
  }
}

/* ---------- kiểm đòn cận cảnh: quái đấm / boss quét / boss đập, 2 hướng, Lam sát / rìa trong / ngoài tầm 2 px ---------- */
const KIEM=[];
for(const loai of ['quai','quet']) for(const huong of [-1,1]) for(const kc of ['sat','ria','ngoai']) KIEM.push({loai,huong,kc});
KIEM.push({loai:'dap',huong:-1,kc:'sat'},{loai:'dap',huong:1,kc:'sat'});
const KC_TEN={sat:'Lam SÁT',ria:'Lam ở RÌA tầm (lấn 2 px)',ngoai:'Lam NGOÀI tầm 2 px'};
const KM={i:-1,f:0,dai:0,ketQua:[]};
function kiemDat(k){
  for(const q of Q){ q.gone=true; q.dead=true; }
  for(const w of WAVES) w.on=false; for(const s of SHARDS) s.on=false;
  if(DO.hurt) DO.hurt.length=0;
  pl.iframes=0; pl.hp=P.maxHp; pl.vx=pl.vy=0; pl.atkN=0; rec=null; echo=null;
  const dTen=k.huong<0?'quay TRÁI':'quay PHẢI';
  if(k.loai==='quai'){
    const q=Q[0]; resetQuai(q); q.gone=false; q.dead=false; q.hp=99; const X0=(RB.x0+8)*T;
    q.x=X0-q.w/2; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.face=k.huong; q.st='wind'; q.t=0; q.H=null; q.at=0;
    const fx1=X0+k.huong*18, off={sat:47,ria:90+20-2,ngoai:90+20+2}[k.kc];   // sau cú lao 18 px; hộp đấm 24–90 px trước chân
    placePlayer(fx1+k.huong*off-pl.w/2, FLOOR-pl.h); pl.face=-k.huong; KM.dai=100;
    THU.cap='Quái đấm '+dTen+' · '+KC_TEN[k.kc];
  } else {
    resetBoss(); const b=boss, bc0=(RE.x0+15)*T; b.x=bc0-b.w/2; b.y=FLOOR-b.h; b.px=b.x; b.py=b.y; b.face=k.huong; b.H=null; b.at=0; b.hittable=true; b.hp=b.max;
    if(k.loai==='quet'){ b.st='sweepPrep'; b.t=0; const tam=220+8*3.6, off={sat:130,ria:tam+20-2,ngoai:tam+20+2}[k.kc];   // hộp quét tới 220 px + boss lướt 8×3,6 px
      placePlayer(bc0+k.huong*off-pl.w/2, FLOOR-pl.h); KM.dai=96; THU.cap='Boss quét '+dTen+' · '+KC_TEN[k.kc]; }
    else { b.st='slamPrep'; b.t=0; placePlayer(bc0+k.huong*210-pl.w/2, FLOOR-pl.h); KM.dai=135; THU.cap='Boss đập '+dTen+' · Lam đứng dưới chỗ đáp'; }
    pl.face=-k.huong; bossBar(true);
  }
  pl.drawT=0; S.look=pl.face*48;
}
function kiemBuoc(){
  if(KM.i>=KIEM.length) return;
  if(KM.i<0 || KM.f>=KM.dai){
    if(KM.i>=0){ const k=KIEM[KM.i]; KM.ketQua.push({cap:THU.cap, loai:k.loai, huong:k.huong<0?'trai':'phai', kc:k.kc, lam_bi_trung:(DO.hurt||[]).length>0, luc:(DO.hurt||[]).map(h=>k.loai==='quai'?h.quai[0]:h.boss)}); }
    KM.i++; KM.f=0; if(KM.i>=KIEM.length){ THU.cap='Hết kiểm đòn'; return; }
    kiemDat(KIEM[KM.i]);
  }
  KM.f++;
}

/* ---------- API quay video / đo (TVTHU) ---------- */
function tamManHinh(){   // điểm giữa Lam và đối thủ đang kiểm (toạ độ màn hình logic) – để quay cận cảnh
  const lx=pl.x+pl.w/2-ox, ly=pl.y+pl.h-60-oy; let ex=lx, ey=ly;
  if(THU.kiem && KM.i>=0 && KM.i<KIEM.length){ if(KIEM[KM.i].loai==='quai'){ const q=Q[0]; ex=q.x+q.w/2-ox; ey=q.y+q.h-60-oy; } else { ex=boss.x+boss.w/2-ox; ey=FLOOR-120-oy; } }
  return [+((lx+ex)/2).toFixed(1), +((ly+ey)/2).toFixed(1)];
}
function khungCat(){ return (THU.kiem && KM.i>=0 && KM.i<KIEM.length && KIEM[KM.i].loai!=='quai') ? [720,405] : [480,270];   // vùng cận cảnh (px logic)
}
function botBuoc(){ tha(); if(THU.kiem) kiemBuoc(); else if(THU.bot==='quai') botQuai(); else if(THU.bot==='boss') botBoss(); }
if(THU.ghi) loop=function(){};   // quay: không tự chạy theo rAF – trình quay gọi TVTHU.khung()
window.TVTHU={
  thu:THU,
  async batDau(){ while(!(window.TVDEMO&&TVDEMO.ready&&loadEl.hidden)) await wait(50); audioInit(); startEl.hidden=true; S.paused=false; },
  bot:()=>({s:BOT.s,t:BOT.t,ka:BOT.ka,F:BOT.F,thu:BOT.thu,rec:!!rec,echo:echo?{id:echo.id,i:echo.i,n:echo.n,done:echo.done}:null,pl:{x:pl.x,face:pl.face,atkN:pl.atkN,vx:pl.vx,drawT:pl.drawT,castT:pl.castT}}),
  khung(n){ for(let i=0;i<(n||1);i++){ botBuoc(); savePrev(); step(); doKhop(); } render(1);
    return {f:S.frame, won:S.won, ketThuc:!endEl.hidden, boss:{st:boss.st,t:boss.t,hp:boss.hp,pha:boss.phase,dead:boss.dead}, quai:Q.map(q=>q.dead?'x':q.st),
      kiem:KM.i, kiemXong:THU.kiem&&KM.i>=KIEM.length, lam:{hp:pl.hp,x:pl.x}, tam:tamManHinh(), cat:khungCat()}; },
  so(){ const ds=DO.ds.slice().sort((a,b)=>a-b), p=x=>ds.length?+ds[Math.min(ds.length-1,Math.floor(ds.length*x))].toFixed(3):0;
    return {nap:QBR.so, ve:{so_khung:DO.n, tb_ms:+(DO.tong/Math.max(1,DO.n)).toFixed(3), p50_ms:p(0.5), p95_ms:p(0.95), max_ms:+DO.max.toFixed(3),
      quai_boss_tb_ms:+(DO.qb/Math.max(1,DO.n)).toFixed(3), quai_boss_max_ms:+DO.qbMax.toFixed(3)}, khop:KHOP, kiem:KM.ketQua, trung:DO.hurt||[], bk:BK}; },
  datLai(){ DO.reset(); KHOP.length=0; }
};
// xem bot / kiểm đòn không cần trình quay: tự bắt đầu khi đã nạp xong
if((THU.bot||THU.kiem) && !THU.ghi){ const cho=()=>{ if(window.TVDEMO&&TVDEMO.ready) TVTHU.batDau(); else setTimeout(cho,100); }; cho(); }
// hiện số đo nạp mảnh trên màn bắt đầu
(function hienSo(){ if(!(window.TVDEMO&&TVDEMO.ready)){ setTimeout(hienSo,100); return; } const s=QBR.so, p=document.createElement('p');
  p.style.cssText='font-size:13px;color:var(--soft)'; p.textContent='Mảnh quái+boss: nạp + giải mã '+s.ms_tong+' ms · '+s.so_anh_png+' ảnh PNG ('+(s.byte_png/1024).toFixed(0)+' KB) + '+s.so_anh_cache+' ảnh cache · bộ nhớ ảnh ≈ '+s.mb_giai_ma_tong+' MB';
  document.querySelector('#start .box').insertBefore(p,document.getElementById('btn-start')); })();
