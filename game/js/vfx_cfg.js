// Cấu hình cường độ hiệu ứng hình ảnh (VFX) ở một chỗ: chỉnh số ở đây là đổi cả game, không phải sửa nhiều file.
// 1 = mức mặc định. 0 = tắt hẳn. Chỉ ảnh hưởng hình ảnh, không đổi luật chơi, vùng đánh hay thời gian ra đòn.
(function () {
  const G = (window.G = window.G || {});
  G.VFX = Object.assign({
    rung: 1,        // rung màn hình (camera shake)
    khung: 1,       // khựng hình khi đánh trúng (hit-stop)
    hat: 1,         // số hạt (particle) sinh ra
    vet: 1,         // độ dài và độ sáng vệt vũ khí
    nhun: 1,        // nhún, co giãn (squash & stretch) của em bé và quái
    moiTruong: 1,   // chuyển động môi trường: cỏ lay, đèn chập chờn, nước gợn, đom đóm
    giaoDien: 1,    // hiệu ứng giao diện: thanh máu tụt dần, nút nảy, chữ thông báo
    vien: 1,        // vành sáng mép trên của em bé, quái, trùm (tách hình khỏi nền trên điện thoại); đổi lúc đang chơi thì gọi G.monsterArt.xoaNho()
    bui: 1,         // bụi bước chân, bụi chạm đất của em bé và quái
  }, G.VFX || {});

  // V41: tuỳ chọn "Giảm hiệu ứng" (bảng cài đặt của Anh Mõ, lưu trong bản lưu: G.save.lowFx).
  // Bật: rung màn hình còn 35% (chớp cả màn hình đi theo rung nên cũng nhạt còn khoảng 35%, js/fx.js drawUI), hạt còn một nửa.
  // KHÔNG đổi: khựng hình (khung), vệt vũ khí, viền sáng, giao diện — và mọi tín hiệu báo nguy hiểm
  // (viền đỏ khi trúng đòn/máu thấp, vùng báo đòn của quái, chớp cảnh báo lúc quái bắn) vẫn giữ nguyên.
  // Tắt: trả lại đúng các số trước khi bật (kể cả số ai đó đã chỉnh tay ở trên).
  const LOW = { rung: 0.35, hat: 0.5 };
  let saved = null; // số gốc trước khi giảm
  G.applyLowFx = function (on) {
    if (on) {
      if (!saved) { saved = {}; for (const k in LOW) saved[k] = G.VFX[k]; }
      for (const k in LOW) G.VFX[k] = Math.min(saved[k] == null ? 1 : saved[k], LOW[k]);
    } else if (saved) {
      for (const k in saved) G.VFX[k] = saved[k];
      saved = null;
    }
  };
})();
