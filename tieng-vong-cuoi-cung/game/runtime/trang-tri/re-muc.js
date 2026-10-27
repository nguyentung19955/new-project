/* ======================= Dữ liệu trang trí địa hình – RỄ MỤC (màn thử game/thu-re-muc/thu-re-muc.html) =======================
   Mảnh lấy từ art/re-muc/trang-tri/re-muc-tt.json (mang-re*, chan-re-1/2) + bệ ván treo dây của Cổng làng v3 (be-van-day-3, day-treo).
   Toạ độ THẾ GIỚI logic (px, ô 32). Phòng Rễ Mục nối sau Phòng boss: x0 = 196 ô = 6272 px (RMX), rộng 42 ô, cao 36 hàng (1152 px).
   Bản đồ (toạ độ ô trong phòng): trần hàng 0–1 · khối trái cột 0–8 (sàn vào hàng 14, thân xuống đáy) · giếng cột 9–12 ·
   khối phải cột 13–41 hàng 14–22 (mặt trên hàng 14, đáy = trần hành lang) · hành lang hàng 23–31 · sàn hàng 32–35 ·
   tường mục leo được: cột 8 hàng 18–31 (lộ phải), cột 13 hàng 15–21 (lộ trái) · bệ ván treo cột 24–26 hàng 29 · bậc cột 30–32 hàng 30–31.
   Quy tắc như 3 màn đã ghép: giữ collider; mảng rễ cắt theo ô đặc (không thò ra ngoài, lùi 1,5 px ở cạnh lộ); chân rễ góc chỉ ở chỗ
   sàn gặp tường; không mặt đứng giả; cùng hệ toạ độ camera (không parallax); seed cố định (băm vị trí). */
(function () {
  const RMX = 6272, T = 32;
  const X = c => RMX + c * T, Y = r => r * T;
  TT.them('re-muc', {
    phong: ['Rễ Mục (RM)'],
    an_o: [[196 + 24, 29], [196 + 25, 29], [196 + 26, 29]],          // 3 ô ván '=' → vẽ bệ ván treo dây thay (collider '=' giữ nguyên)
    dat: [
      // ---- LỚP SAU: bệ ván treo dây (ván 3 ô, dây lên trần hành lang; trần vẽ sau nên dây "chui" vào khối trần)
      {lop: 'sau', giai: 'van-day', x0: X(24), x1: X(27), y: Y(29)},

      // ---- LỚP THÂN: mảng rễ lớn phá nhịp vân 32 px (cắt theo ô đặc R/M)
      {lop: 'than', o: 'mang-re*', x: X(0) + 24, y: Y(15) - 6, cat: 'dac'},            // sàn vào (khối trái, phần trên)
      {lop: 'than', o: 'mang-re*', x: X(0) + 40 + 118, y: Y(19), cat: 'dac', lat: 1},  // khối trái, giữa (lat: x = MÉP PHẢI hộp)
      {lop: 'than', o: 'mang-re*', x: X(2) + 10, y: Y(24), cat: 'dac'},
      {lop: 'than', o: 'mang-re*', x: X(0) + 30 + 118, y: Y(29) + 8, cat: 'dac', lat: 1},
      {lop: 'than', o: 'mang-re*', x: X(14) + 20, y: Y(15), cat: 'dac'},               // khối phải (trần hành lang)
      {lop: 'than', o: 'mang-re*', x: X(21) + 118, y: Y(16) + 10, cat: 'dac', lat: 1},
      {lop: 'than', o: 'mang-re*', x: X(28) + 16, y: Y(15) - 4, cat: 'dac'},
      {lop: 'than', o: 'mang-re*', x: X(35) + 8 + 118, y: Y(16) + 6, cat: 'dac', lat: 1},
      {lop: 'than', o: 'mang-re*', x: X(15) + 12, y: Y(33) - 10, cat: 'dac'},          // sàn hành lang (nửa dưới ngoài màn ở hàng 36+)
      {lop: 'than', o: 'mang-re*', x: X(22) + 24 + 118, y: Y(32) + 12, cat: 'dac', lat: 1},
      {lop: 'than', o: 'mang-re*', x: X(29), y: Y(33), cat: 'dac'},
      {lop: 'than', o: 'mang-re*', x: X(36) + 4 + 118, y: Y(32) + 14, cat: 'dac', lat: 1},

      // ---- LỚP MẶT: chân rễ góc (chỗ sàn gặp tường), vẽ TRƯỚC Lam / quái / đồ vật
      {lop: 'mat', o: 'chan-re-1', x: X(9), y: Y(32)},                                 // chân khối trái (đáy giếng, mặt tường x = cột 9)
      {lop: 'mat', o: 'chan-re-1', x: X(41), y: Y(32), lat: 1},                        // chân tường phải cuối màn
      {lop: 'mat', o: 'chan-re-2', x: X(30) - 2, y: Y(32), lat: 1},                    // chân bậc 2 ô (mặt trái bậc)
      {lop: 'mat', o: 'chan-re-2', x: X(40) + 8, y: Y(14), lat: 1}                     // chân tường phải ở tầng trên (mặt khối phải, hàng 14)
    ],
    tien_canh: []                                                                      // không dùng tiền cảnh rễ-đá (lớp gần Rễ Mục làm khung)
  });
})();
