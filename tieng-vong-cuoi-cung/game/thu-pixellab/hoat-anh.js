'use strict';
/* =====================================================================================================================
   hoat-anh.js – BỘ ĐIỀU KHIỂN ANIMATION: TÁCH khỏi gameplay.
   Mỗi bước logic 60 Hz (không chạy trong hitstop) đọc trạng thái + pha đòn từ engine (DongCo.trangThai) rồi CHỌN HÌNH:
     • đòn đánh: pha lấy đà / ra đòn / hồi do ENGINE quyết (su / ac / re theo atkT). Trong mỗi pha, hình = ánh xạ TỈ LỆ thời gian của pha
       lên danh sách hình của pha đó trong clip (clip.pha hoặc suy từ "manh"). Clip 4 hình hay 12 hình thì đòn VẪN dài đúng su+ac+re bước;
       hình "mạnh" luôn hiện đúng lúc hộp chém bật. Pha không có hình nào → giữ hình kề.
     • chạy: theo QUÃNG ĐƯỜNG (dx thực / quang px mỗi vòng), pha chạy sống liên tục, không reset.
     • bị đánh, lướt, nhảy/rơi, tiếp đất, nhảy vách: theo biến game (hurtT, bước lướt, vy, landT, wjT) – không có đồng hồ riêng.
     • đứng, chết, (clip khác không gắn biến): theo ms/fps trong JSON – CHỈ là hình, chết vẫn hồi sinh đúng bước 104 của engine.
   ===================================================================================================================== */
const HoatAnh = (() => {
  const A = {ten:'', t:0, phaChay:0, clip:null, k:0, st:null};
  const cuoi = ds => ds.length ? ds[ds.length - 1] : undefined;
  function capNhat(){
    const st = DongCo.trangThai(), pl = DongCo.pl;
    if (st.ten !== A.ten){ A.ten = st.ten; A.t = 0; } else A.t++;
    A.st = st;
    const C = SpritePL.chon(st.ten); A.clip = C;
    if (st.ten === 'chay' && !(C && C.def.phat === 'quang_duong')) A.phaChay = (A.phaChay + Math.abs(pl.dxT) / 132) % 1;
    if (!C){ A.k = 0; return; }
    const n = C.hinh.length; let k = 0;
    if (st.n){                                   // đòn: theo pha của engine
      const ds = C.pha[st.pha];
      if (ds.length) k = ds[Math.min(ds.length - 1, Math.floor(st.tiLe * ds.length))];
      else if (st.pha === 'layda') k = C.pha.rado[0] ?? 0;
      else if (st.pha === 'rado') k = cuoi(C.pha.layda) ?? C.pha.hoi[0] ?? 0;
      else k = cuoi(C.pha.rado) ?? n - 1;
    } else if (st.ten === 'chay' && C.def.phat === 'quang_duong'){
      A.phaChay = (A.phaChay + Math.abs(pl.dxT) / (C.def.quang || 132)) % 1;
      k = Math.floor(A.phaChay * n);
    } else if (st.ten === 'tuong'){
      k = st.bam || n < 2 ? 0 : 1 + (Math.floor(A.t / 8) % (n - 1));
    } else if (st.tiLe !== undefined){           // theo biến game
      k = Math.floor(Math.max(0, Math.min(0.999, st.tiLe)) * n);
    } else {                                     // theo thời gian (ms / fps của clip)
      const ms = A.t * 1000 / 60; let m = C.lap ? ms % C.tong : Math.min(ms, C.tong - 0.001);
      while (k < n - 1 && m >= C.ms[k]){ m -= C.ms[k]; k++; }
    }
    A.k = Math.max(0, Math.min(n - 1, k));
  }
  // dòng chữ ?anim=debug
  function moTa(){
    const st = A.st || {}, C = A.clip;
    let s = st.ten + ' → ' + (C ? (C.tam ? 'TẠM ' : '') + C.ten + ' hình ' + (A.k + 1) + '/' + C.hinh.length : 'KHỐI MÀU (chưa có clip)');
    if (st.n) s += ' · pha ' + ({layda:'lấy đà', rado:'RA ĐÒN', hoi:'hồi'})[st.pha] + ' ' + (st.phaT + 1) + '/' + st.phaDai + ' · atkT ' + st.atkT;
    if (st.ten === 'chay') s += ' · pha chạy ' + A.phaChay.toFixed(2);
    return s;
  }
  return {capNhat, moTa, A};
})();
