// HỆ THỐNG MỚI ĐỢT 1 — phần ở làng (docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-1-VU-KHI.md).
//   - Cô Thợ May: không may / bán quần áo kiểu cũ nữa (đợt 3: khung nâng bộ hiện thêm 3 skill của bộ đang mặc). Bảng của cô nay chỉ có khung nâng cấp bộ trang phục Zed (cùng khung ở Hành trang ›
//     Nhân vật, js/vk_moi.js VM.boPanel) và lời giải thích; đổi bộ ở Hành trang.
// Luật, số liệu, bản lưu: js/vk_moi.js. Đợt 2: bảng cũ js/tailor.js và cờ ?hethongcu=1 đã xoá, đây là bảng duy nhất của Cô Thợ May.
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VA = G.villageApi, VM = G.vkMoi;
  if (!VA || !VM || !T) return;
  const TXT = '#f1e6c6';
  const CX = 160, CW = 304; // vùng nội dung bên phải (như js/village.js)

  function boPanel() {
    VA.frame('Thợ may');
    let y = ui.para('Quần áo cũ đã đổi ra vàng và linh khí. Cu Tí có 4 bộ, hạ trùm vùng để mở bộ, đổi bộ ở Hành trang › Nhân vật.', CX + 2, 80, CW - 4, { size: 7, color: TXT }); // đợt 3: câu ngắn lại để đủ chỗ cho 3 dòng skill bộ
    y = VM.boPanel(CX + 2, y + 2, CW - 6, false, VA.say);
    if (G.hanhTrang && T.sbtn(CX + 2, Math.min(y + 6, 240), 150, 17, 'Mở Hành trang › Nhân vật', { size: 7, pad: 2 })) {
      G.hanhTrang.openVillage(); G.hanhTrang.tab = 'hero';
      return null;
    }
    return VM.boDuoc(G.save, G.zedBo ? G.zedBo() : 'ninja') === '' ? 'Đủ linh khí và vàng rồi, cô nâng bộ cho cháu nhé!' : 'Bộ nào cũng nâng được 3 cấp, mỗi cấp mở thêm một skill riêng. Gom linh khí và vàng rồi quay lại nhé.';
  }
  VA.PANELS.outfit = boPanel;
})();
