/* ======================= Dữ liệu trang trí địa hình – màn CỔNG LÀNG (phòng A1 + A2 của demo.html) =======================
   Toạ độ THẾ GIỚI logic (px, ô 32). Bản đồ Cổng làng (demo.html):
     A1 (x 0..1152):  cột đá x 0..32 (hàng 0–13) · bậc 1 x 288..384 mặt y 416 · bậc 2 x 448..544 mặt y 384 · hố x 608..704 đáy y 512
                      · cột treo x 768..800 (y 96..288) · khối tường x 896..992 (y 128..448) · sàn y 448
     A2 (x 1152..2112): bệ ván x 1312..1408 mặt y 352 (ô 41–43 hàng 11) · cột đá treo x 1792..1824 (y 0..288) · cổng · sàn y 448
   Mảnh (atlas art/the-gioi-moi/cong-lang-v3/): mang-go* (6 mảng gỗ 112×108, đã tối 7 %), chan-re-thap* (2 chân rễ thấp 65×21,
   chỉ rễ), re-om-cot-1/2 (rễ ôm cột, không đá), mep (dải mép đất: 2 bộ), van-day (bệ VÁN TREO DÂY: ván 96×24 + dây lên quá mép
   trên màn), tien-canh-trai/phai. Mọi vị trí cố định; biến thể 'ho*' chọn theo băm (x,y) ô → không đổi giữa các khung.
   Duyệt 27/10 (chủ dự án): bệ neo = ván treo dây (thay bệ rễ đỡ); mảng gỗ tối thêm; ngắt rêu 3 → 2 chỗ; giữ cả 2 tiền cảnh;
   BỎ cửa nhà ở chân khối tường. Cột treo x 768..800 (y 96..288) vẫn lơ lửng: chưa có ảnh rễ treo từ mép trên → để nguyên.
   Quy tắc an toàn: mặt đứng = mép trên collider; hình chỉ nhô LÊN tối đa 2 px (neo của mép đất đã trừ sẵn; nút buộc dây ở 2 đầu
   ván là DÂY, không phải mặt); mảng gỗ cắt theo ô gỗ ('dac'); chân rễ nằm thấp (≤ 23 logic), không có mặt phẳng ngang nào ngoài collider. */
TT.them('cong-lang', {
  phong: ['Cổng làng (A1)', 'Cổng làng (A2)'],
  // 3 ô ván của bệ lơ lửng A2 (ô 41–43, hàng 11): KHÔNG vẽ ván nữa (collider '=' giữ nguyên) → thay bằng bệ VÁN TREO DÂY
  an_o: [[41, 11], [42, 11], [43, 11]],
  dat: [
    // ---- LỚP SAU (trước gạch): bệ ván treo dây – mặt ván = y 352 = mặt collider ván cũ, rộng đúng 96 = 3 ô; 2 dây lên quá mép trên màn
    {lop: 'sau', giai: 'van-day', x0: 1312, x1: 1408, y: 352},

    // ---- LỚP THÂN (sau gạch, trước mảng rễ rong-re): mảng gỗ lớn che vân lặp; cắt theo ô đặc (lùi 1,5 px ở cạnh lộ)
    // sàn A1: mảng đặt cao (y 408–418) bị cắt phẳng ở 449,5 = sát dưới viền đen mặt sàn → mép gỗ trơ NGẮT dải rêu (duyệt: chỉ 2 chỗ
    // trong cả Cổng làng: x 332 ở A1, x 1848 ở A2); y 449,5 = chỉ đỉnh nhọn chạm mặt; y 452+ = nằm dưới dải rêu (rêu còn nguyên)
    {lop: 'than', o: 'mang-go*', x: 96,   y: 472,   cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 332,  y: 408,   cat: 'dac', lat: 1},   // đặt cao, bị cắt ở 449,5 → mép gỗ trơ ngắt dải rêu một đoạn dài
    {lop: 'than', o: 'mang-go*', x: 556,  y: 452,   cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 770,  y: 474,   cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go*', x: 1012, y: 456,   cat: 'dac'},            // (đã hạ xuống dưới rêu – bỏ chỗ ngắt thứ 3)
    // khối tường A1 (x 896..992, y 128..448): 2 mảng chồng lên thân, cắt theo khối (giữ viền 2 mặt)
    {lop: 'than', o: 'mang-go*', x: 890,  y: 146,   cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 888,  y: 236,   cat: 'dac', lat: 1},
    // sàn A2
    {lop: 'than', o: 'mang-go*', x: 1176, y: 470,   cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go*', x: 1396, y: 449.5, cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 1656, y: 452,   cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go*', x: 1848, y: 410,   cat: 'dac'},            // ngắt rêu (trước cổng)
    {lop: 'than', o: 'mang-go*', x: 2004, y: 472,   cat: 'dac', lat: 1},

    // ---- LỚP MẶT (sau rong-re, trước Lam): dải mép đất rễ-rêu ở MÉP sàn / khối (mặt rêu đúng mặt collider, nhô ≤ 2 px)
    {lop: 'mat', giai: 'mep', x0: 288, x1: 384, y: 416, bo: 1, trai: true,  phai: true},    // mặt bậc 1
    {lop: 'mat', giai: 'mep', x0: 448, x1: 544, y: 384, bo: 2, trai: true,  phai: true},    // mặt bậc 2
    {lop: 'mat', giai: 'mep', x0: 544, x1: 608, y: 448, bo: 1, trai: false, phai: true},    // sàn → mép hố (đầu trái cắt phẳng vào chân bậc 2)
    {lop: 'mat', giai: 'mep', x0: 608, x1: 704, y: 512, bo: 2, trai: false, phai: false},   // đáy hố (2 đầu đụng vách hố)
    {lop: 'mat', giai: 'mep', x0: 704, x1: 800, y: 448, bo: 2, trai: true,  phai: false},   // mép hố → sàn
    {lop: 'mat', giai: 'mep', x0: 896, x1: 992, y: 128, bo: 1, trai: true,  phai: true},    // đỉnh khối tường
    // chân rễ thấp (chỉ rễ, 65×21): neo giữa đáy đặt ở góc chân khối, lún 4 px vào dải rêu sàn; nửa trong nằm đè mặt khối
    {lop: 'mat', o: 'chan-re-1-thap', x: 290,  y: 452},            // chân bậc 1 trái
    {lop: 'mat', o: 'chan-re-2-thap', x: 382,  y: 452, lat: 1},    // chân bậc 1 phải
    {lop: 'mat', o: 'chan-re-2-thap', x: 450,  y: 452},            // chân bậc 2 trái
    {lop: 'mat', o: 'chan-re-1-thap', x: 542,  y: 452, lat: 1},    // chân bậc 2 phải (che đầu cắt của dải mép hố)
    {lop: 'mat', o: 'chan-re-1-thap', x: 612,  y: 516, lat: 1},    // góc đáy hố trái
    {lop: 'mat', o: 'chan-re-2-thap', x: 700,  y: 516},            // góc đáy hố phải
    {lop: 'mat', o: 'chan-re-2-thap', x: 894,  y: 452},            // chân khối tường trái
    {lop: 'mat', o: 'chan-re-1-thap', x: 994,  y: 452, lat: 1},    // chân khối tường phải
    // rễ ôm cột đá (đã bỏ đá): quấn mặt phải cột đá đầu A1 (x 0..32), rễ loang ra sàn – chỗ ĐÁ GẶP GỖ
    {lop: 'mat', o: 're-om-cot-1', x: 40, y: 450}
    // (cửa nhà ở chân khối tường: ĐÃ BỎ theo duyệt 27/10 – khối tường chỉ là vỏ cây + 2 mảng gỗ)
  ],
  // tiền cảnh rễ-đá: cụm trái ở mép trái phòng, cụm phải ở mép phải phòng; dời lên 60 px (tip thấp nhất ≈ y 255, trên đầu Lam 336); cuộn 1,05
  tien_canh: [{x0: 0, x1: 1152, tren: -60}, {x0: 1152, x1: 2112, tren: -60}]
});
