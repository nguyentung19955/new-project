/* ======================= Dữ liệu trang trí địa hình – màn SÂN CHUÔNG (phòng RB của demo.html) =======================
   Toạ độ THẾ GIỚI logic (px, ô 32). Bản đồ Sân chuông (demo.html, RB: x 2112..3328, 38 ô; sàn y 448):
     khối đá x 2560..2848 (ô 14–22, hàng 11–13) mặt y 352 · bệ ván lơ lửng 2 ô x 2912..2976 mặt y 320 (ô 25–26, hàng 10)
     · cột đá treo x 3232..3264 (y 0..288, cổng dưới cột) · điểm lưu x 2192 · quái ở x 2336, trên khối đá (x 2688), gác cổng x 3072
   Cùng bộ quy tắc Cổng làng (xem cong-lang.js): mảng gỗ CÓ VÂN che vân lặp (chỉ cắt theo ô GỖ – không lan sang khối đá); mép ĐÁ RÊU
   (v4, kieu 'da') trên mặt khối đá (2 đầu thật; thay mép đất nâu); rễ ôm cột đá ở 2 góc chân khối đá (chỗ đá gặp gỗ; cắt hộp để không
   cao hơn mặt khối quá 2 px, vẽ TRƯỚC mép đá nên đầu cắt nằm dưới dải đá); bệ lơ lửng → ván treo dây móc vào XÀ 'xa-day-2' ở mép trên
   màn; cổng cuối sân = cổng rễ cây (TT.veCong); tiền cảnh rễ-đá 2 mép phòng.
   Ngắt rêu bằng mép gỗ trơ: 1 chỗ (x 2380). Không đổi bản đồ / collider / gameplay. */
TT.them('san-chuong', {
  phong: ['Sân chuông (RB)'],
  cong: true,   // cổng cuối sân (x 3248) vẽ bằng cổng rễ cây
  // 2 ô ván của bệ lơ lửng (ô 91–92, hàng 10): không vẽ ván nữa (collider '=' giữ nguyên) → ván treo dây 2 ô
  an_o: [[91, 10], [92, 10]],
  dat: [
    // ---- LỚP SAU: bệ ván treo dây 2 ô – mặt ván = y 320 = mặt collider; dây lên quá mép trên màn (không có gì ở trên)
    // dây móc vào xà 'xa-day-2' (126×66, 2 dây cách 42 = đúng 2 dây ván 2 ô): đáy đoạn dây xà y 70 → xà chiếm y ≈ 4..70 sát mép trên màn
    {lop: 'sau', giai: 'van-day', x0: 2912, x1: 2976, y: 320, xa: 'xa-day-2', xa_y: 70},

    // ---- LỚP THÂN: mảng gỗ lớn phủ thân sàn (cắt theo ô gỗ; dưới khối đá x 2560..2848 chỉ còn thân sàn y ≥ 448)
    {lop: 'than', o: 'mang-go-van*', x: 2150, y: 470, cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go-van*', x: 2380, y: 410, cat: 'dac'},            // ngắt rêu (1 chỗ duy nhất ở Sân chuông)
    {lop: 'than', o: 'mang-go-van*', x: 2600, y: 466, cat: 'dac', lat: 1},   // dưới khối đá (thân sàn)
    {lop: 'than', o: 'mang-go-van*', x: 2790, y: 452, cat: 'dac'},
    {lop: 'than', o: 'mang-go-van*', x: 3010, y: 472, cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go-van*', x: 3220, y: 456, cat: 'dac'},

    // ---- LỚP MẶT: rễ ôm cột đá ở 2 góc chân khối đá (chỗ ĐÁ GẶP GỖ): cắt hộp từ y 350 → không có gì cao hơn mặt khối quá 2 px;
    // vẽ TRƯỚC dải mép đá → đầu cắt phẳng nằm khuất dưới dải đá (y 351..386); lật để rễ bám mặt TRÁI khối ở góc trái
    {lop: 'mat', o: 're-om-cot-2', x: 2552, y: 452, lat: 1, cat: [2440, 350, 2700, 600]},
    {lop: 'mat', o: 're-om-cot-1', x: 2856, y: 452,         cat: [2700, 350, 2980, 600]},
    // mép ĐÁ RÊU (v4) trên mặt khối đá: 2 đầu thật (đầu trái / phải có góc đá tròn), bộ 2 theo seed; mặt rêu = mặt collider + 1 px,
    // lá nhô tối đa 4 px (cắt); cao 34 px phủ hàng gạch đá trên cùng (y 352..386). Quái đi trên khối vẽ SAU nên không bị che
    {lop: 'mat', giai: 'mep', kieu: 'da', x0: 2560, x1: 2848, y: 352, bo: 2, trai: true, phai: true},
    // chân rễ thấp ở 2 góc chân khối (nửa ngoài loang ra sàn)
    {lop: 'mat', o: 'chan-re-1-thap', x: 2556, y: 452},
    {lop: 'mat', o: 'chan-re-2-thap', x: 2852, y: 452, lat: 1}
  ],
  // tiền cảnh rễ-đá 2 mép phòng, dời lên 60 (tip ≈ y 255 < đầu Lam 336; quái gác cổng x 3072 cao 120 → đầu y 328, không bị che)
  tien_canh: [{x0: 2112, x1: 3328, tren: -60}]
});
