/* ===== CAMERA KIỂU DEAD CELLS (28/10) – chèn bởi tao-am-dao.py ngay sau roomAt(). ?cam=phong: camera khoá theo phòng như cũ (để so) =====
   Ngang: đi theo Lam LIÊN TỤC qua các phòng nối liền (không khoá theo phòng), chỉ kẹp ở mép KHU chơi = mép thế giới (đầu / cuối bản đồ).
          Khu = các phòng liền nhau; ranh phòng bịt kín cả chiều cao (tường đặc mọi hàng trên sàn) tách khu → không bao giờ thấy sang khu khác.
          Look-ahead theo TỐC ĐỘ chạy (đứng: nhỏ, chạy hết tốc: lớn), đổi mượt; quay đầu phải giữ hướng mới TRE_QUAY bước mới đổi hướng nhìn.
   Dọc:   vùng chết – nhảy thường không kéo camera; chỉ theo khi Lam ĐỨNG lên mặt đất cao / thấp hơn mốc > VC_DAT, hoặc rơi xa hơn VC_ROI;
          rơi nhanh → nhìn xuống trước. Giữ lệch +28 cho cảm ứng (nút không che nhân vật). Kẹp dọc trong [min(0, lệch), max(đáy thế giới − màn, lệch)].
   Boss thật đang đánh (bossActive) và Lam trong sân boss → khoá sân boss như cũ. Tinh anh (P0-C phòng E) KHÔNG khoá.
   Trục nền S.rc: CỐ ĐỊNH trong khu (= trục giữa phòng đầu khu) → nền xa cuộn liên tục theo camera, không nhảy theo tâm phòng. */
const CAM={phong:(()=>{ try{ return new URLSearchParams(location.search).get('cam')==='phong'; }catch(e){ return false; } })(),
  BAM:0.11,                        // bám ngang: mỗi bước camera đi 11 % quãng còn lại tới đích (≈ 0,35 s đuổi kịp)
  LOOK_DUNG:24, LOOK_CHAY:120,     // look-ahead (px logic) khi đứng / khi chạy hết tốc
  CHAY_LEN:0.04, CHAY_XUONG:0.02,  // mức "đang chạy" (0–1) tăng / giảm mỗi bước → look-ahead tăng mượt khi chạy, giảm chậm hơn khi dừng
  LOOK_MEM:0.08, LOOK_TOC:4,       // look-ahead đi 8 % quãng còn lại mỗi bước, tối đa 4 px / bước (quay đầu: đổi dần ≈ 1 s)
  TRE_QUAY:8,                      // quay đầu phải giữ hướng mới 8 bước (≈ 0,13 s) mới đổi hướng nhìn → bấm qua lại không rung
  VC_DAT:44,                       // vùng chết dọc khi đứng đất: mặt đất mới lệch mốc > 44 px (hơn 1 ô) mới theo
  VC_ROI:120,                      // trên không: chân thấp hơn mốc > 120 px (rơi xa) mới kéo theo
  NHIN_XUONG:48, VY_NHANH:7,       // rơi nhanh (vy > 7): nhìn xuống trước tối đa 48 px
  BAM_DOC:0.06, LECH_CAM:28,       // bám dọc 6 % / bước; lệch dọc cảm ứng +28
  huong:1, giu:0, chay:0, moc:0, xuong:0, khu:null};
function camKhu(lai){
  if(CAM.khu && !lai) return CAM.khu;
  const K=[], hang=Math.floor(FLOOR/T); let a=ROOMS[0];
  for(let i=1;i<=ROOMS.length;i++){ const b=ROOMS[i]; let kin=true;
    if(b){ const X=b.x0; for(let y=0;y<hang;y++) if(!solidC(tile(X-1,y)) && !solidC(tile(X,y))){ kin=false; break; } }
    if(!b || kin){ const z=ROOMS[i-1]; K.push({a:a.x0*T, b:(z.x0+z.w)*T, rc:a.x0*T+a.w*T/2-W/2, tu:a.name, den:z.name}); a=b; }
  }
  return CAM.khu=K;
}
function camKhuCua(x){ const K=camKhu(); for(const k of K) if(x>=k.a && x<k.b) return k; return x<K[0].a?K[0]:K[K.length-1]; }
function camKep(x){
  const k=camKhuCua(pl.x+pl.w/2); let a=k.a, b=k.b-W;
  if(typeof RE!=='undefined' && bossActive() && ROOMS[S.room]===RE){ a=RE.x0*T; b=(RE.x0+RE.w)*T-W; }   // boss thật: khoá sân boss như cũ
  return b<a?a:clamp(x,a,b);
}
function camDocDich(){
  const lech=touchMode?CAM.LECH_CAM:0, ty=lech+(CAM.moc-FLOOR)+CAM.xuong;
  return clamp(ty,Math.min(0,lech),Math.max(ROWS*T-H,lech));
}
function camDat(){   // đặt thẳng (vào ván / hồi sinh / dịch chỗ): không trôi
  camKhu(true);
  CAM.huong=pl.face||1; CAM.giu=0; CAM.chay=0; CAM.xuong=0; CAM.moc=pl.y+pl.h; S.look=CAM.huong*CAM.LOOK_DUNG;
  S.camx=camKep(pl.x+pl.w/2-W/2+S.look); S.pcx=S.camx;
  S.rc=S.prc=camKhuCua(pl.x+pl.w/2).rc;
}
function camBuoc(){
  // hướng nhìn (trễ quay đầu)
  if(pl.face!==CAM.huong){ if(++CAM.giu>=CAM.TRE_QUAY){ CAM.huong=pl.face; CAM.giu=0; } } else CAM.giu=0;
  // mức chạy 0–1 theo dịch ngang THỰC (va tường → 0), lướt tính như chạy hết tốc
  const v=Math.min(1,Math.abs(pl.dxT||0)/P.runSpeed), chayT=v>0.5?1:0;
  CAM.chay=approach(CAM.chay,chayT,chayT>CAM.chay?CAM.CHAY_LEN:CAM.CHAY_XUONG);
  const e=CAM.chay*CAM.chay*(3-2*CAM.chay), lookT=CAM.huong*(CAM.LOOK_DUNG+(CAM.LOOK_CHAY-CAM.LOOK_DUNG)*e);
  S.look+=clamp((lookT-S.look)*CAM.LOOK_MEM,-CAM.LOOK_TOC,CAM.LOOK_TOC);
  const tx=camKep(pl.x+pl.w/2-W/2+S.look);
  S.camx+=(tx-S.camx)*CAM.BAM; if(Math.abs(tx-S.camx)<0.02) S.camx=tx;
  // dọc: vùng chết
  const chan=pl.y+pl.h;
  if(pl.dead){}
  else if(pl.onGround){ if(Math.abs(chan-CAM.moc)>CAM.VC_DAT) CAM.moc=chan; }
  else if(chan-CAM.moc>CAM.VC_ROI) CAM.moc=chan-CAM.VC_ROI;
  CAM.xuong=approach(CAM.xuong,(!pl.onGround && pl.vy>CAM.VY_NHANH)?CAM.NHIN_XUONG:0,1.5);
  const ty=camDocDich(); S.camy+=(ty-S.camy)*CAM.BAM_DOC; if(Math.abs(ty-S.camy)<0.05) S.camy=ty;
  S.rc=camKhuCua(pl.x+pl.w/2).rc;   // cố định trong khu → nền cuộn liên tục
}
