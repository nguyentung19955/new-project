/* ======================= Dữ liệu trang trí địa hình – PHÒNG BOSS "Chuông Gác Làng" (phòng RE của demo.html) =======================
   Toạ độ THẾ GIỚI logic (px, ô 32). Bản đồ phòng boss (RE: x 5312..6272, 30 ô = đúng 1 màn, camera đứng yên; sàn y 448):
     trần đá y 0..64 cả phòng · tường đá trái x 5312..5376 treo từ trần (y 64..288, cửa vào ở cột 1, Lam đi dưới) · tường đá phải
     x 6240..6272 (y 64..448, chạm sàn) · sân boss x 5376..6240 · công tắc chuông x 5504 · boss 200×290 đi sàn, đập (nhảy tới chỗ Lam),
     quét thấp 170×40 sát sàn; PHA 2 boss TREO TRẦN ở x 5824..6024, y −40..250.
   Quy tắc riêng phòng boss: trang trí chỉ nằm ở lớp TRƯỚC Lam/boss (không bao giờ che boss hay Lam) và không có gì trong sân boss
   ngoài mảng gỗ dưới mặt sàn (phủ thân, không nhô). Trần: ĐỂ NGUYÊN (đá; boss treo giữa trần; chưa có ảnh rễ treo hợp đá).
   Tiền cảnh rễ-đá thu 0,6 + dời lên 40 → tip ≈ y 149 < đỉnh boss đứng sàn (158), cách xa chỗ boss treo (x 5824..6024).
   Không có cạnh sàn lộ (sàn chạy suốt dưới 2 tường) → không đặt mép đất. Không đổi bản đồ / collider / gameplay. */
TT.them('phong-boss', {
  phong: ['Chuông Gác Làng (RE)'],
  dat: [
    // ---- LỚP THÂN: mảng gỗ phủ thân sàn (cắt theo ô gỗ; ô đá của tường phải không dính)
    {lop: 'than', o: 'mang-go*', x: 5330, y: 470, cat: 'dac', lat: 1},
    {lop: 'than', o: 'mang-go*', x: 5560, y: 452, cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 5790, y: 410, cat: 'dac', lat: 1},   // ngắt rêu (1 chỗ duy nhất ở phòng boss)
    {lop: 'than', o: 'mang-go*', x: 6010, y: 466, cat: 'dac'},
    {lop: 'than', o: 'mang-go*', x: 6190, y: 452, cat: 'dac', lat: 1},

    // ---- LỚP MẶT: rễ ôm chân tường đá phải (chỗ ĐÁ GẶP GỖ) – lật để rễ bám mặt trái tường, loang ra sàn; vẽ TRƯỚC boss
    {lop: 'mat', o: 're-om-cot-1', x: 6232, y: 450, lat: 1},
    {lop: 'mat', o: 'chan-re-2-thap', x: 6228, y: 452, lat: 1}
  ],
  tien_canh: [{x0: 5312, x1: 6272, tren: -40, k: 0.6}]
});
