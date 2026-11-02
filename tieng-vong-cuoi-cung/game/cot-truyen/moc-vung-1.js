'use strict';
/* moc-vung-1.js – móc nối nhỏ Cốt truyện ↔ Vùng 1 (phiên cottruyen). Chỉ THÊM, không đổi hành vi cũ.
   - Bảng Rest Bell có thêm nút "Return to Bell Village" CHỈ KHI người chơi đã từng mở được Làng Chuông
     (cờ LuuChung 'lang_mo' – làng chỉ đặt cờ khi đủ ảnh). Chưa có làng → Vùng 1 y hệt cũ.
   - Bấm nút: Rest Bell vừa lưu game rồi → ghi điểm quay về, sang trang làng với ?tu=vung-1 (làng phát hiệu ứng dịch chuyển). */
(function(){
  const V1 = window.V1, LC = window.LuuChung;
  if (!V1 || !LC) return;
  const M = window.MocCotTruyen = {nut: null, ve: 0};
  const goc = V1.moChuong;
  if (typeof goc !== 'function') return;
  V1.moChuong = function(gui, ok){
    goc.apply(this, arguments);
    try {
      if (!LC.co('lang_mo')) { if (M.nut) M.nut.hidden = true; return; }
      if (!M.nut){
        const hang = document.querySelector('#l-chuong .hang'); if (!hang) return;
        const b = M.nut = document.createElement('button'); b.type = 'button'; b.id = 'b-lang'; b.textContent = 'Return to Bell Village';
        b.onclick = () => M.veLang();
        hang.appendChild(b);
      }
      M.nut.hidden = false;
    } catch (e){}
  };
  M.veLang = function(){
    const G = window.TV && TV.G, c = G && G.phong && G.phong.chuong_luu;
    LC.datDiemVe({vung:'vung-1', phong: G && G.id, cot: c && c.cot, hang: c && c.hang});
    M.ve++;
    if (new URLSearchParams(location.search).get('tu') === '1') return;   // cổng kiểm thử: không rời trang
    location.href = '../lang-chuong/index.html?tu=vung-1';
  };
})();
