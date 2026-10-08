// Khung thanh máu (giao-dien/thanh-mau-tuong 32×8, thanh-mau-quai 24×8, thanh-mau-boss 96×12) — VẼ LẠI tay, THIET-KE-LAI.md mục 10.
// Game tô nền tối + máu trước rồi vẽ khung đè (kéo giãn): LÒNG KHUNG PHẢI TRONG SUỐT đúng chỗ thanh máu, viền chỉ ở mép.
// Chạy: node tools/pixel/ve-lai/khung.js [--xem DIR]
const { Ve, ghi, png } = require('./ve');

// khung chữ nhật: viền vien 1px, gờ kim loại dày t (sáng trên / trái, tối dưới / phải), lòng [x1..x2]×[y1..y2] trong suốt
function khung(w, h, m, t, cap = null) {
  const v = new Ve(w, h);
  v.rect(1, 0, w - 2, h, 'vien'); v.rect(0, 1, w, h - 2, 'vien');
  v.rect(1, 1, w - 2, h - 2, m[1]);
  v.hl(2, w - 3, 1, m[2]); v.vl(1, 2, h - 3, m[2]); v.hl(2, w - 2, h - 2, m[0]); v.vl(w - 2, 2, h - 2, m[0]);
  v.rect(1 + t, 1 + t, w - 2 - t * 2, h - 2 - t * 2, '_');
  if (cap) cap(v);
  return v;
}
const DONG = ['dong-toi', 'dong', 'dong-sang'], SAT = ['sat-toi', 'sat', 'sat-sang'], SON = ['son-toi', 'son', 'son-sang'];
function tuong() {   // đồng, đinh vàng hai đầu
  return khung(32, 8, DONG, 1, (v) => { v.p(1, 3, 'vang-nghe'); v.p(1, 4, 'vang-sang'); v.p(30, 3, 'vang-nghe'); v.p(30, 4, 'dong'); v.hl(13, 18, 0, 'dong-sang'); v.hl(14, 17, 0, 'vang-nghe'); });
}
function quai() {   // sắt mộc mạc
  return khung(24, 8, SAT, 1);
}
function boss() {   // sơn son viền đồng, hai đầu mũi giáo đồng + đinh, giữa có mặt trống nhỏ trên mép
  const v = khung(96, 12, SON, 2, (v) => {
    // hai đầu ốp đồng
    for (const [x0, s] of [[0, 1], [95, -1]]) {
      for (let i = 0; i < 6; i++) v.vl(x0 + s * i, 1 + (i === 0 ? 1 : 0), 10 - (i === 0 ? 1 : 0), i < 2 ? 'dong-sang' : i < 5 ? 'dong' : 'dong-toi');
      v.vl(x0, 2, 9, 'vien'); v.p(x0 + s * 3, 5, 'vang-sang'); v.p(x0 + s * 3, 6, 'vang-nghe');
    }
    for (let x = 12; x < 86; x += 8) { v.p(x, 1, 'dong-sang'); v.p(x, 10, 'dong'); }   // đinh đồng trên gờ son
    v.hl(42, 53, 0, 'dong'); v.hl(44, 51, 0, 'vang-nghe'); v.p(47, 1, 'vang-sang'); v.p(48, 1, 'vang-sang');
  });
  // lòng: cột 6..89 hàng 4..7 trong suốt
  v.rect(6, 4, 84, 4, '_'); v.hl(5, 90, 3, 'vien'); v.hl(5, 90, 8, 'vien'); v.vl(5, 3, 8, 'vien'); v.vl(90, 3, 8, 'vien');
  return v;
}
// khung người chơi (menu, 192×66 — CSS kéo 100%): huy chương trống đồng bên trái ôm ảnh đại diện (tâm 32,32, lỗ r≈11),
// bảng tối viền đồng răng cưa Đông Sơn bên phải (chữ sáng ở x 67..168)
function nguoiChoi() {
  const v = new Ve(192, 66);
  // bảng
  v.rect(50, 12, 138, 44, 'vien'); v.rect(51, 13, 136, 42, 'dong-toi'); v.rect(52, 14, 134, 40, 'dong'); v.hl(52, 185, 14, 'dong-sang'); v.vl(185, 15, 53, 'dong-toi'); v.hl(52, 185, 53, 'dong-toi');
  v.rect(54, 16, 130, 36, 'vien'); v.rect(55, 17, 128, 34, 'toi');
  for (let x = 56; x < 182; x++) { const t = x % 6, h = t < 3 ? t : 6 - t; v.vl(x, 17, 17 + h, 'dong-toi'); }   // răng cưa trong mép trên
  for (let x = 60; x < 182; x += 8) v.p(x, 49, 'dong-toi');
  // mũi nhọn đầu phải
  v.poly([[186, 26], [191, 33], [186, 40]], 'dong'); v.line(186, 26, 190, 32, 'dong-sang'); v.p(191, 33, 'vien'); v.line(187, 25, 191, 31, 'vien'); v.line(187, 41, 191, 35, 'vien');
  // huy chương trống đồng
  v.ell(32, 33, 30, 30, 'vien'); v.ell(32, 33, 29, 29, 'dong-toi'); v.ell(32, 33, 28, 28, 'dong');
  for (let y = 0; y < 66; y++) for (let x = 0; x < 64; x++) { const d = Math.hypot(x + 0.5 - 32, y + 0.5 - 33); if (d < 28 && d > 13) { if (Math.hypot(x + 0.5 - 14, y + 0.5 - 15) < 16) v.p(x, y, 'dong-sang'); else if (Math.hypot(x + 0.5 - 52, y + 0.5 - 53) < 18) v.p(x, y, 'dong-toi'); } }
  v.ring(32, 33, 24, 24, 'dong-toi'); v.ring(32, 33, 15, 15, 'dong-sang');
  for (let k = 0; k < 24; k++) { const a = (k * Math.PI) / 12; v.p(32 + Math.cos(a) * 20, 33 + Math.sin(a) * 20, 'vang-nghe'); }
  for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + Math.PI / 4; v.stamp(['.kk..', 'kkkkk', '..k..'], { k: 'dong-toi' }, Math.round(32 + Math.cos(a) * 26) - 2, Math.round(33 + Math.sin(a) * 26) - 1); }
  v.ell(32, 33, 13, 13, 'vien'); v.ell(32, 33, 12, 12, 'dat-toi');   // lỗ ảnh đại diện
  return v;
}
// nút chính (menu, 208×46 — CSS kéo 100%): tấm vàng nghệ vát cạnh, hai đầu ốp đồng khắc sao trống, răng cưa mép
function nutChinh() {
  const v = new Ve(208, 46);
  v.rect(2, 0, 204, 46, 'vien'); v.rect(0, 2, 208, 42, 'vien'); v.rect(1, 1, 206, 44, 'vien');
  v.rect(2, 2, 204, 42, 'dong-toi'); v.rect(3, 3, 202, 40, 'dong');
  // tấm vàng giữa
  v.rect(22, 6, 164, 34, 'vang-nghe'); v.rect(22, 6, 164, 3, 'vang-sang'); v.hl(22, 185, 9, 'sang'); v.rect(22, 34, 164, 6, 'dong-sang'); v.hl(22, 185, 39, 'dong');
  v.vl(21, 6, 39, 'dong-toi'); v.vl(186, 6, 39, 'dong-toi');
  for (let x = 24; x < 184; x++) { const t = x % 8, h = t < 4 ? t : 8 - t; if (h) v.p(x, 40 - h + 1, 'dong'); }   // răng cưa đáy
  // hai đầu ốp đồng + sao trống
  for (const cx of [11, 196]) {
    v.rect(cx - 8, 3, 17, 40, 'dong'); v.vl(cx - 8, 3, 42, 'dong-sang'); v.vl(cx + 8, 3, 42, 'dong-toi');
    v.ell(cx, 23, 7, 7, 'dong-toi'); v.ell(cx, 23, 6, 6, 'dong-sang'); v.ring(cx, 23, 6, 6, 'dong');
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; v.line(cx, 23, cx + Math.cos(a) * 4, 23 + Math.sin(a) * 4, 'vang-nghe'); }
    v.p(cx, 23, 'sang'); v.p(cx, 6, 'vang-sang'); v.p(cx, 40, 'vang-nghe');
  }
  v.hl(3, 204, 3, 'dong-sang');
  return v;
}
const DS = {
  'khung-nguoi-choi': [nguoiChoi, 'Khung người chơi', 'Huy chương trống đồng (vành chấm vàng, 4 chim Lạc, lỗ ảnh đại diện tâm 32,33) + bảng tối viền đồng răng cưa, mũi nhọn đầu phải'],
  'khung-nut-chinh': [nutChinh, 'Khung nút chính', 'Tấm vàng nghệ vát sáng trên / đồng dưới, răng cưa đáy, hai đầu ốp đồng khắc sao trống'],
  'thanh-mau-tuong': [tuong, 'Khung thanh máu tướng', 'Khung đồng 3 tông, khe tối, đinh vàng hai đầu, mấu đồng giữa mép trên; lòng trong suốt (cột 2..29, hàng 2..5)'],
  'thanh-mau-quai': [quai, 'Khung thanh máu quái', 'Khung sắt 3 tông mộc mạc; lòng trong suốt (cột 2..21, hàng 2..5)'],
  'thanh-mau-boss': [boss, 'Khung thanh máu boss', 'Khung sơn son đinh đồng, hai đầu ốp đồng có đinh vàng, mấu đồng giữa; lòng trong suốt (cột 6..89, hàng 4..7)'],
};
module.exports = { DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, v.w > 100 ? 4 : 10, 'la'); }
    else console.log(ghi('giao-dien', ma, ten, mo, v, { script: 'khung' }).f);
  }
}
