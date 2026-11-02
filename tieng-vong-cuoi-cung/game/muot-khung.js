'use strict';
/* muot-khung.js – (camgiac) CHẠY MƯỢT, dùng chung cho Vùng 1, Vùng 2, Làng Chuông.
   Đo 02/11 (docs/cam-giac/BAO-CAO.md): mốc thời gian khung hình trên iPhone/Safari bị làm tròn 1 ms (16, 17, 17, 16…) nên
   vòng lặp "60 bước cố định" chạy 0 – 1 – 2 bước xen kẽ mỗi khung → nền và nhân vật đứng-nhảy-đứng (giật). Màn 120 Hz thì
   mỗi bước vẽ 2 lần y hệt → nhân vật đi bậc thang.
   Sửa:  1) bắt nhịp: khoảng giữa 2 khung lệch < 1,5 ms so với bội số của nửa bước (8,33 ms) → kéo về đúng bội số đó;
         2) nội suy: ghi vị trí trước mỗi bước logic, khi vẽ đặt tạm vị trí = giữa bước trước và bước hiện tại theo thời gian thừa.
   Logic game vẫn 60 bước/giây cố định (khung hoạt ảnh, va chạm không đổi). */
window.MuotKhung = (() => {
  const DT = 1000 / 60, NUA = DT / 2;
  function bacNhip(d){ const k = Math.round(d / NUA); return k >= 1 && Math.abs(d - k * NUA) < 1.5 ? k * NUA : d; }
  // ghi vị trí hiện tại (x, y) của từng vật trước khi chạy 1 bước logic
  function ghi(ds){ for (const o of ds) if (o){ o._mx = o.x; o._my = o.y; } }
  // đặt tạm x, y = vị trí nội suy (a = 0..1 giữa bước trước và bước hiện tại), gọi fn() rồi trả lại vị trí thật
  const LUU = [];
  function noiSuy(ds, a, fn){
    LUU.length = 0;
    if (a < 0.999) for (const o of ds){
      if (!o || typeof o._mx !== 'number') continue;
      const dx = o.x - o._mx, dy = typeof o.y === 'number' && typeof o._my === 'number' ? o.y - o._my : 0;
      if (Math.abs(dx) > 96 || Math.abs(dy) > 96) continue;   // dịch chuyển tức thời (đổi phòng, hồi sinh, dịch chuyển) → không nội suy
      LUU.push(o, o.x, o.y); o.x = o._mx + dx * a; if (dy) o.y = o._my + dy * a;
    }
    try { fn(); } finally { for (let i = 0; i < LUU.length; i += 3){ LUU[i].x = LUU[i + 1]; LUU[i].y = LUU[i + 2]; } LUU.length = 0; }
  }
  // một nhịp vòng lặp: trả về {n: số bước đã chạy, a: phần thừa 0..1 để nội suy}
  function taoDongHo(){
    let last = 0, acc = 0;
    return function(now, mot, ds){
      let d = last ? Math.min(100, now - last) : DT; last = now; d = bacNhip(d);
      acc += d; let n = 0;
      while (acc >= DT - 1e-6 && n < 4){ if (ds) ghi(ds()); mot(); acc -= DT; n++; }
      if (acc >= DT) acc = 0;   // máy quá chậm: bỏ bớt thời gian thay vì chạy dồn
      if (acc < 0) acc = 0;
      return {n, a:acc / DT};
    };
  }
  return {DT, bacNhip, ghi, noiSuy, taoDongHo};
})();
