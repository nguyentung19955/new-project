// Thanh trên trong trận — VẼ LẠI tay (claude/ve-lai-pixel), THIET-KE-LAI.md mục 13:
//   giao-dien/thanh-tien-do 96×16: thanh tiến độ đợt cắt 9 mảnh (CSS border-image 0 13 0 13): hai đầu huy chương đồng ngọc bích
//     (cột 0..12 / 83..95, không giãn), rãnh giữa đồng đồng đều (giãn ngang không méo), lòng rãnh tối hàng 3..11 = chỗ phần đầy
//   icon/toc-do-x1..x3 16×16: chữ "x1 / x2 / x3" pixel đậm (x1 bạc — x2 / x3 vàng sáng = đang tăng tốc)
//   icon/an-giao-dien 16×16: con mắt (cùng dáng ui-tran-1-4) gạch chéo đỏ · icon/menu 16×16: ba thanh đồng
// Chạy: node tools/pixel/ve-lai/topbar.js [--xem DIR]
const { Ve, ghi, png } = require('./ve');

function thanhTienDo() {
  const v = new Ve(96, 16);
  // rãnh giữa: viền / gờ sáng / lòng tối / gờ tối / viền — mọi cột như nhau
  v.hl(6, 89, 1, 'vien'); v.hl(6, 89, 2, 'dong-sang'); v.rect(6, 3, 84, 9, 'toi'); v.hl(6, 89, 3, 'khoi'); v.hl(6, 89, 12, 'dong-toi'); v.hl(6, 89, 13, 'vien');
  // hai đầu huy chương đồng, giữa ngọc bích
  for (const cx of [6.5, 89.5]) {
    v.ell(cx, 7.5, 6.6, 6.6, 'vien'); v.ell(cx, 7.5, 5.6, 5.6, 'dong-toi'); v.ell(cx - 0.6, 6.9, 4.8, 4.8, 'dong'); v.ell(cx - 1.6, 5.9, 2.6, 2.6, 'dong-sang');
    v.ring(cx, 7.5, 4.1, 4.1, 'dong-toi');
    v.ell(cx, 7.5, 2.7, 2.7, 'la-toi'); v.ell(cx - 0.4, 7.1, 1.9, 1.9, 'la'); v.p(Math.floor(cx) - 1, 6, 'la-sang');
  }
  return v;
}
// chữ đậm 6×9 (nét 2 điểm)
const SO = {
  1: ['..kk..', '.kkk..', 'kkkk..', '..kk..', '..kk..', '..kk..', '..kk..', '..kk..', 'kkkkkk'],
  2: ['.kkkk.', 'kk..kk', '....kk', '...kk.', '..kk..', '.kk...', 'kk....', 'kk....', 'kkkkkk'],
  3: ['.kkkk.', 'kk..kk', '....kk', '..kkk.', '....kk', '....kk', 'kk..kk', 'kk..kk', '.kkkk.'],
};
const CHU_X = ['kk..kk', '.kkkk.', '..kk..', '.kkkk.', 'kk..kk'];
function tocDo(n) {
  const v = new Ve(16, 16), bat = n > 1;
  const mau = (y, y0, h) => { const t = (y - y0) / h; return bat ? (t < 0.3 ? 'vang-sang' : t < 0.75 ? 'vang-nghe' : 'dong-sang') : (t < 0.3 ? 'trang' : t < 0.75 ? 'trang-xam' : 'bac'); };
  CHU_X.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'k') v.p(1 + x, 7 + y, mau(7 + y, 7, 5)); }));
  SO[n].forEach((r, y) => [...r].forEach((c, x) => { if (c === 'k') v.p(8 + x, 3 + y, mau(3 + y, 3, 9)); }));
  if (bat) v.p(9, 3, 'sang');   // lấp lánh khi đang tăng tốc
  v.outline();
  return v;
}
function anGiaoDien() {   // mắt (lòng trắng, tròng xanh) + gạch chéo đỏ
  const v = new Ve(16, 16);
  v.poly([[1, 8], [5, 4], [11, 4], [15, 8], [11, 12], [5, 12]], 'trang'); v.hl(4, 11, 5, 'sang'); v.hl(4, 11, 11, 'trang-xam');
  v.ell(8, 8, 2.8, 2.8, 'cham'); v.ell(8, 8, 1.4, 1.4, 'vien'); v.p(7, 7, 'sang');
  v.outline();
  for (let i = 0; i < 12; i++) { v.p(2 + i, 2 + i, 'son'); v.p(3 + i, 2 + i, 'son-sang'); }
  v.p(2, 1, 'vien'); v.p(14, 14, 'vien');
  return v;
}
function menu() {   // ba thanh đồng
  const v = new Ve(16, 16);
  for (const y of [3, 7, 11]) { v.rect(2, y, 12, 2, 'dong'); v.hl(2, 13, y, 'dong-sang'); v.p(13, y + 1, 'dong-toi'); }
  v.outline();
  return v;
}
const DS = {
  'giao-dien/thanh-tien-do': [thanhTienDo, 'Thanh tiến độ đợt', 'Cắt 9 mảnh 0 13 0 13: hai đầu huy chương đồng ngọc bích, rãnh đồng giữa giãn ngang, lòng tối hàng 3..11 (phần đầy CSS phủ lên)'],
  'icon/toc-do-x1': [() => tocDo(1), 'Tốc độ x1', 'chữ x1 bạc (chưa tăng tốc)'],
  'icon/toc-do-x2': [() => tocDo(2), 'Tốc độ x2', 'chữ x2 vàng sáng (đang tăng tốc)'],
  'icon/toc-do-x3': [() => tocDo(3), 'Tốc độ x3', 'chữ x3 vàng sáng (đang tăng tốc)'],
  'icon/an-giao-dien': [anGiaoDien, 'Ẩn giao diện', 'con mắt trắng tròng xanh, gạch chéo đỏ'],
  'icon/menu': [menu, 'Menu', 'ba thanh đồng ngang'],
};
module.exports = { DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [k, [fn, ten, mo]] of Object.entries(DS)) {
    const [nhom, ma] = k.split('/'), v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 10, 'toi'); }
    else console.log(ghi(nhom, ma, ten, mo, v, { script: 'topbar' }).f);
  }
}
