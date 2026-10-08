// Đồ (do/*, 24×24) xấu / na ná — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 11.
// Mỗi món một DÁNG riêng đọc được ở 24 px (ngọc: viên mài / ngọc trai / đĩa bích / giọt nước; sừng: mũ sừng / mũi giáo sừng / sừng tê…),
// sáng trên-trái, viền vien 1px. Chạy: node tools/pixel/ve-lai/do.js [--xem DIR]
const { Ve, ghi, png } = require('./ve');
const L = (s) => s.replace(/^\n|\n\s*$/g, '').split('\n').map((r) => r.trim());

const DS = {};
const them = (ma, ten, mo, fn) => { DS[ma] = [fn, ten, mo]; };
const lap = (v, x, y) => { v.p(x, y, 'sang'); v.p(x - 1, y, 'trang'); v.p(x + 1, y, 'trang'); v.p(x, y - 1, 'trang'); v.p(x, y + 1, 'trang'); };   // lấp lánh

them('ngoc_hoi_sinh', 'Ngọc Hồi Sinh', 'viên hồng ngọc mài giác (mặt trên sáng, cạnh tối) trên đế đồng, lấp lánh', () => {
  const v = new Ve(24, 24);
  v.poly([[5, 9], [8, 4], [16, 4], [19, 9], [12, 20]], 'son'); v.poly([[8, 4], [16, 4], [14, 9], [10, 9]], 'son-sang'); v.poly([[5, 9], [10, 9], [12, 20]], 'son-sang');
  v.poly([[14, 9], [19, 9], [12, 20]], 'son-toi'); v.hl(6, 18, 9, 'lua'); v.p(10, 5, 'hong'); v.p(11, 5, 'hong');
  v.rect(9, 19, 7, 2, 'dong'); v.hl(9, 15, 19, 'dong-sang'); v.hl(8, 16, 21, 'dong-toi');
  lap(v, 19, 3); v.outline(); return v;
});
them('ngoc_minh_chau', 'Ngọc Minh Châu', 'ngọc trai trắng tròn phát sáng nằm trong vỏ sò đồng', () => {
  const v = new Ve(24, 24);
  v.poly([[2, 14], [12, 22], [22, 14], [18, 17], [12, 18], [6, 17]], 'dong'); for (const x of [6, 9, 12, 15, 18]) v.line(12, 21, x, 15, 'dong-toi'); v.hl(4, 20, 14, 'dong-sang');
  v.ell(12, 10, 6.5, 6.5, 'trang'); v.ell(10.5, 8.5, 3.5, 3.5, 'sang'); v.p(9, 7, 'sang'); v.ring(12, 10, 6.5, 6.5, 'trang-xam'); v.p(15, 13, 'trang-xam'); v.p(14, 14, 'trang-xam');
  lap(v, 19, 4); v.outline(); return v;
});
them('ngoc_sinh_luc', 'Ngọc Sinh Lực', 'ngọc bích hình đĩa có lỗ (ngọc bích cổ) xanh lá, tua đỏ buộc dưới', () => {
  const v = new Ve(24, 24);
  v.ell(12, 10, 8.5, 8.5, 'la'); v.ell(10.5, 8.5, 6, 6, 'la-ma'); v.ell(9, 7, 3, 3, 'la-sang'); v.ring(12, 10, 8.5, 8.5, 'la-toi');
  v.ell(12, 10, 2.6, 2.6, '_'); v.ring(12, 10, 3.3, 3.3, 'la-toi');
  v.vl(12, 18, 19, 'son-toi'); v.rect(11, 20, 3, 1, 'son'); v.vl(11, 21, 22, 'son'); v.vl(12, 21, 22, 'son-sang'); v.vl(13, 21, 21, 'son-toi');
  v.outline(); return v;
});
them('ngoc_tran_thuy', 'Ngọc Trấn Thủy', 'ngọc hình giọt nước xanh, sóng trắng bên trong, chóp đồng có khuyên', () => {
  const v = new Ve(24, 24);
  v.poly([[12, 4], [18, 13], [18, 16], [15, 20], [9, 20], [6, 16], [6, 13]], 'nuoc'); v.poly([[12, 4], [8, 12], [7, 15], [9, 13]], 'nuoc-sang');
  v.poly([[15, 20], [18, 16], [18, 13], [16, 17]], 'cham'); v.line(8, 15, 10, 14, 'troi'); v.line(10, 14, 12, 15, 'troi'); v.line(12, 15, 14, 14, 'troi'); v.line(14, 14, 16, 15, 'troi');
  v.rect(10, 3, 5, 2, 'dong-sang'); v.hl(11, 13, 1, 'dong'); v.p(11, 2, 'dong'); v.p(13, 2, 'dong');
  v.outline(); return v;
});
them('mu_sung', 'Mũ Sừng', 'mũ đồng chỏm tròn, vành đinh, hai sừng trâu cong vểnh ngà', () => {
  const v = new Ve(24, 24);
  for (const [s, x0] of [[-1, 6], [1, 17]]) { v.line(x0, 12, x0 + s * 3, 8, 'trang'); v.line(x0 + s * 3, 8, x0 + s * 4, 3, 'trang'); v.line(x0 + s, 12, x0 + s * 4, 8, 'trang-xam'); v.p(x0 + s * 4, 2, 'sang'); }
  v.ell(12, 14, 7, 6, 'dong'); v.rect(5, 14, 15, 5, 'dong'); v.ell(10, 11, 3, 2.5, 'dong-sang'); v.vl(18, 13, 18, 'dong-toi');
  v.rect(4, 18, 17, 3, 'dong-toi'); v.hl(4, 20, 18, 'dong-sang'); for (const x of [6, 9, 12, 15, 18]) v.p(x, 19, 'vang-nghe');
  v.p(12, 8, 'son'); v.p(12, 7, 'son-sang');
  v.outline(); return v;
});
them('mui_sung', 'Mũi Sừng Phá Giáp', 'mũi giáo bằng sừng nhọn hoắt chéo lên phải, khâu đồng, tua son — dáng mũi giáo (khác sừng tê)', () => {
  const v = new Ve(24, 24);
  v.line(2, 22, 9, 15, 'dat'); v.line(3, 22, 10, 15, 'dat-toi');
  v.poly([[9, 13], [12, 12], [12, 15], [10, 16]], 'dong'); v.p(10, 13, 'dong-sang');
  v.poly([[11, 12], [21, 2], [14, 14], [12, 14]], 'trang'); v.line(12, 12, 20, 3, 'sang'); v.line(13, 14, 20, 4, 'trang-xam');
  v.p(8, 17, 'son'); v.p(7, 18, 'son-sang'); v.p(7, 16, 'son'); v.p(6, 17, 'son-toi');
  v.outline(); return v;
});
them('sung_te', 'Sừng Tê', 'sừng tê giác to bè, cong nhẹ, gốc sẫm có vân ngang, chóp ngà', () => {
  const v = new Ve(24, 24);
  v.poly([[5, 21], [19, 21], [16, 15], [13, 9], [11, 4], [9, 9], [6, 15]], 'dat-sang'); v.poly([[11, 4], [9, 9], [12, 9]], 'trang'); v.poly([[9, 9], [6, 15], [10, 15], [12, 9]], 'cat');
  v.poly([[13, 9], [16, 15], [19, 21], [15, 21], [14, 15]], 'dat'); for (const y of [12, 15, 18]) v.hl(7 + (21 - y) / 3, 17 - (21 - y) / 4, y, 'dat');
  v.rect(5, 19, 15, 3, 'dat-toi'); v.hl(6, 18, 19, 'dat');
  v.outline(); return v;
});
them('ao_vay_ca', 'Áo Vảy Cá', 'áo giáp hình áo (vai + thân) phủ vảy cá bạc xanh xếp lớp, viền đồng cổ áo', () => {
  const v = new Ve(24, 24);
  v.poly([[3, 7], [8, 3], [10, 5], [14, 5], [16, 3], [21, 7], [19, 11], [17, 10], [17, 21], [7, 21], [7, 10], [5, 11]], 'nuoc-sang');
  const M = v.clone(); const q = (x, y, c) => { if (M.get(x, y)) v.p(x, y, c); };
  for (let y = 7; y < 21; y += 3) for (let x = 6 + ((y / 3) % 2) * 2; x < 19; x += 4) { q(x, y + 1, 'nuoc'); q(x + 1, y + 2, 'nuoc'); q(x + 2, y + 1, 'nuoc'); q(x + 1, y, 'troi'); }
  v.vl(17, 10, 21, 'nuoc'); v.hl(7, 17, 21, 'cham-sang');
  v.line(10, 5, 12, 8, 'dong-sang'); v.line(14, 5, 12, 8, 'dong'); v.p(12, 8, 'dong-toi');
  v.outline(); return v;
});
them('vay_ca', 'Vảy Cá', 'ba chiếc vảy cá lớn bạc xanh xoè hình quạt, gân vảy sáng', () => {
  const v = new Ve(24, 24);
  // vảy hình khiên tròn đáy nhọn, xếp chồng: trái / phải sau, giữa trước — viền tối tách từng chiếc
  const vay = (cx, cy, c) => { v.ell(cx, cy, 5.5, 5.5, 'vien'); v.poly([[cx - 5, cy + 1], [cx + 5, cy + 1], [cx, cy + 9]], 'vien');
    v.ell(cx, cy, 4.5, 4.5, c[1]); v.poly([[cx - 4, cy + 1], [cx + 4, cy + 1], [cx, cy + 7.5]], c[1]); v.ell(cx - 1.5, cy - 1.5, 2.2, 2.2, c[2]);
    v.line(cx, cy - 2, cx, cy + 6, c[0]); v.line(cx - 2, cy + 1, cx, cy + 3, c[0]); v.line(cx + 2, cy + 1, cx, cy + 3, c[0]); };
  vay(6, 9, ['cham', 'nuoc', 'nuoc-sang']); vay(18, 9, ['cham', 'nuoc', 'nuoc-sang']); vay(12, 11, ['cham-sang', 'nuoc-sang', 'troi']);
  v.outline(); return v;
});
them('giap_vay_rong', 'Giáp Vảy Rồng', 'giáp ngực ngọc lục phủ vảy rồng hình chữ U, viền vàng, mặt trống nhỏ giữa ngực', () => {
  const v = new Ve(24, 24);
  v.poly([[4, 5], [9, 3], [15, 3], [20, 5], [20, 17], [12, 22], [4, 17]], 'ngoc');
  for (let y = 6; y < 19; y += 3) for (let x = 5 + ((y / 3) % 2) * 2; x < 20; x += 4) { v.p(x, y, 'cham-toi'); v.p(x + 1, y + 1, 'cham-toi'); v.p(x + 2, y, 'cham-toi'); v.p(x + 1, y - 1, 'ngoc-sang'); }
  v.line(4, 5, 9, 3, 'vang-sang'); v.hl(9, 15, 3, 'vang-nghe'); v.line(15, 3, 20, 5, 'vang-nghe'); v.vl(4, 6, 17, 'vang-nghe'); v.vl(20, 6, 17, 'dong'); v.line(4, 17, 12, 22, 'dong'); v.line(20, 17, 12, 22, 'dong-toi');
  v.ell(12, 11, 2.5, 2.5, 'vang-nghe'); v.p(12, 11, 'sang');
  v.outline(); return v;
});
them('luoi_hai', 'Lưỡi Hái Chí Tử', 'lưỡi hái: cán gỗ dài chéo, lưỡi cong lớn sắt tím sẫm sắc cạnh sáng, khâu đồng', () => {
  const v = new Ve(24, 24);
  v.line(5, 22, 16, 4, 'dat'); v.line(6, 22, 17, 4, 'dat-toi');
  v.rect(15, 3, 3, 3, 'dong'); v.p(15, 3, 'dong-sang');
  v.poly([[16, 4], [10, 2], [4, 3], [1, 7], [4, 5], [9, 5], [15, 6]], 'tim'); v.line(1, 7, 4, 4, 'tim-sang'); v.line(4, 4, 10, 3, 'tim-sang'); v.line(4, 5, 14, 6, 'tim-toi');
  v.outline(); return v;
});
them('ngua_hong_mao', 'Ngựa Chín Hồng Mao', 'đầu ngựa lông vàng nghiêng phải, bờm đỏ lửa nhiều lọn, cương son', () => {
  const v = new Ve(24, 24);
  v.poly([[7, 22], [8, 12], [11, 5], [14, 4], [21, 13], [20, 16], [16, 15], [14, 22]], 'cat'); v.poly([[14, 4], [21, 13], [19, 14], [13, 7]], 'vang-sang'); v.poly([[8, 12], [7, 22], [10, 22], [10, 14]], 'dat-sang');
  v.poly([[11, 5], [12, 1], [14, 4]], 'cat'); v.p(15, 9, 'vien'); v.p(20, 14, 'dat-toi');
  for (const [x, y] of [[10, 4], [8, 7], [7, 10], [6, 13], [5, 16]]) { v.line(x, y, x - 3, y + 2, 'son'); v.line(x + 1, y + 1, x - 2, y + 3, 'son-sang'); v.p(x - 3, y + 3, 'lua'); }
  v.line(13, 15, 18, 12, 'son-toi');
  v.outline(); return v;
});
them('voi_chin_nga', 'Voi Chín Ngà', 'đầu voi trắng nhìn thẳng, tai lớn, vòi buông, nhiều ngà cong vàng ngà hai bên, mũ trán đồng', () => {
  const v = new Ve(24, 24);
  v.ell(4.5, 10, 3.4, 5.5, 'trang-xam'); v.ell(19.5, 10, 3.4, 5.5, 'trang-xam'); v.ell(4.5, 10, 1.8, 3.6, 'hong'); v.ell(19.5, 10, 1.8, 3.6, 'hong');
  v.ell(12, 10, 6, 6, 'trang'); v.rect(10, 14, 5, 7, 'trang'); v.rect(11, 20, 3, 2, 'trang-xam'); v.ell(10, 8, 3, 3, 'sang'); v.vl(14, 14, 20, 'trang-xam');
  for (const [s, x] of [[-1, 9], [1, 15]]) for (let k = 0; k < 3; k++) v.line(x, 16 + k, x + s * (3 + k), 13 + k * 2, k === 1 ? 'vang-sang' : 'sang');
  v.rect(10, 4, 5, 2, 'vang-nghe'); v.p(12, 3, 'son'); v.p(9, 10, 'vien'); v.p(15, 10, 'vien');
  v.outline(); return v;
});
them('mat_trong', 'Mặt Trống', 'mặt trống da căng nhìn nghiêng 3/4: elip da sáng có sao tâm, tang gỗ son, đinh đồng', () => {
  const v = new Ve(24, 24);
  v.ell(12, 15, 10, 5, 'son-toi'); v.rect(2, 11, 21, 5, 'son'); v.ell(12, 11, 10, 5, 'cat'); v.ell(11, 10, 7, 3.5, 'vang-sang');
  v.ring(12, 11, 10, 5, 'dat'); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; v.p(12 + Math.cos(a) * 3, 11 + Math.sin(a) * 1.5, 'dat-sang'); } v.p(12, 11, 'son');
  for (const x of [4, 8, 12, 16, 20]) v.p(x, 15 + (x === 12 ? 2 : x === 8 || x === 16 ? 1 : 0), 'vang-nghe');
  v.hl(2, 22, 13, 'son-sang');
  v.outline(); return v;
});
them('trong_dong', 'Trống Đồng', 'trống đồng nhìn ngang: mặt trên có tượng cóc, tang phình, thân thắt eo, chân loe, đai hoa văn', () => {
  const v = new Ve(24, 24);
  v.ell(12, 6, 10, 2.5, 'dong-sang'); v.rect(2, 6, 21, 5, 'dong'); v.poly([[3, 11], [21, 11], [18, 16], [6, 16]], 'dong'); v.poly([[6, 16], [18, 16], [21, 21], [3, 21]], 'dong');
  v.vl(3, 6, 11, 'dong-sang'); v.vl(4, 12, 15, 'dong-sang'); v.poly([[16, 6], [22, 6], [22, 11], [18, 16], [21, 21], [17, 21], [15, 16], [17, 11]], 'dong-toi');
  v.hl(3, 21, 9, 'vang-nghe'); for (let x = 4; x < 21; x += 2) v.p(x, 8, 'dong-toi'); v.hl(4, 20, 19, 'vang-nghe');
  v.ell(12, 6, 2, 1, 'vang-sang'); v.stamp(['.c.', 'ccc'], { c: 'dong-toi' }, 4, 3); v.stamp(['.c.', 'ccc'], { c: 'dong-toi' }, 17, 3);
  v.outline(); return v;
});
them('dui_trong', 'Dùi Trống', 'đôi dùi trống gỗ bắt chéo, đầu quấn vải son buộc dây, chuôi đồng', () => {
  const v = new Ve(24, 24);
  for (const [a, b, c, d] of [[3, 21, 15, 7], [21, 21, 9, 7]]) { v.line(a, b, c, d, 'dat-sang'); v.line(a + (a < 12 ? 1 : -1), b, c + (a < 12 ? 1 : -1), d, 'dat'); }
  for (const [x, y] of [[16, 5], [8, 5]]) { v.ell(x, y, 3.5, 3.5, 'son'); v.ell(x - 1, y - 1, 1.6, 1.6, 'son-sang'); v.p(x + 2, y + 2, 'son-toi'); v.hl(x - 2, x + 2, y + 3, 'vang-nghe'); }
  for (const x of [3, 20]) v.rect(x, 20, 2, 2, 'dong');
  v.outline(); return v;
});

module.exports = { DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/do-${ma}.png`, 8, 'toi'); }
    else console.log(ghi('do', ma, ten, mo, v, { script: 'do' }).f);
  }
}
void L;
