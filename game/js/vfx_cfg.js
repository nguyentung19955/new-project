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
})();
