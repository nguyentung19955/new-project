// Núi Tản Viên 5 giai đoạn (giao-dien/nui-tan-vien-1..5, 48×48) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 4.
// Bảng "Núi Tản Viên": ô 100 px cao, ảnh vuông (contain). Mỗi giai đoạn một khung cảnh vuông đầy đủ (trời · núi · đất),
// núi lớn dần: Gò Đất → Đồi Nhỏ → Núi Non → Núi Cao → Núi Thần (ba đỉnh trên mây, hào quang vàng, mái đền trên đỉnh).
// Chạy: node tools/pixel/ve-lai/nui.js [--xem DIR]
const { Ve, ghi, png } = require('./ve');

// khối núi: đa giác + đổ bóng sườn phải (ánh sáng trên-trái)
function khoi(v, pts, mau, dinhX) {
  const m = new Ve(v.w, v.h); m.poly(pts, 1);
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (m.g[y][x]) {
    const phai = x > dinhX + (y - pts[0][1]) * 0.15;
    v.p(x, y, phai ? mau[0] : mau[1]);
    if (!m.get(x, y - 1) || !m.get(x - 1, y)) v.p(x, y, phai ? mau[1] : mau[2]);
  }
}
function may(v, cx, cy, w) {
  v.ell(cx, cy, w, 2.2, 'trang'); v.ell(cx - w * 0.4, cy - 1.5, w * 0.5, 2, 'sang'); v.ell(cx + w * 0.3, cy - 1, w * 0.45, 1.8, 'trang');
  v.hl(Math.round(cx - w + 1), Math.round(cx + w - 1), Math.round(cy + 2), 'trang-xam');
}
function canh(gd) {
  const v = new Ve(48, 48);
  // trời theo giai đoạn: ngày → chiều vàng ở Núi Thần
  const troi = gd === 5 ? ['lua-sang', 'vang-sang', 'sang'] : ['nuoc', 'nuoc-sang', 'troi'];
  v.rect(0, 0, 48, 14, troi[0]); v.rect(0, 14, 48, 12, troi[1]); v.rect(0, 26, 48, 22, troi[2]);
  if (gd === 5) { v.ell(24, 14, 10, 10, 'vang-sang'); v.ell(24, 14, 7, 7, 'sang'); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; v.line(24 + Math.cos(a) * 12, 14 + Math.sin(a) * 12, 24 + Math.cos(a) * 17, 14 + Math.sin(a) * 17, 'vang-sang'); } }
  else { v.ell(38, 8, 3, 3, 'sang'); v.ell(38, 8, 2, 2, 'vang-sang'); }
  // dãy núi xa mờ
  khoi(v, [[0, 36], [8, 27], [15, 32], [22, 25], [32, 33], [40, 26], [48, 31], [48, 40], [0, 40]], ['cham-sang', 'cham-sang', 'nuoc-sang'], 99);
  // núi chính
  const L = ['la-toi', 'la', 'la-ma'], R = ['reu-toi', 'reu', 'reu-sang'], D = ['dat-toi', 'dat', 'dat-sang'];
  if (gd === 1) {
    khoi(v, [[12, 40], [18, 34], [24, 32], [30, 34], [36, 40]], D, 24);
    for (const x of [16, 22, 29]) { v.p(x, 33 + (x === 22 ? -1 : 1), 'la-ma'); v.p(x + 1, 32 + (x === 22 ? -1 : 1), 'la-sang'); }
  } else if (gd === 2) {
    khoi(v, [[6, 40], [16, 28], [24, 24], [32, 28], [42, 40]], L, 24);
    v.vl(30, 21, 27, 'dat'); v.ell(30, 20, 3, 2.5, 'la'); v.p(29, 19, 'la-sang');
  } else if (gd === 3) {
    khoi(v, [[2, 40], [12, 26], [17, 22], [21, 26], [27, 17], [36, 27], [46, 40]], L, 27);
    v.poly([[25, 19], [27, 17], [29, 19], [27, 21]], 'sat-sang');
  } else if (gd === 4) {
    khoi(v, [[0, 40], [10, 24], [16, 18], [24, 8], [32, 18], [40, 26], [48, 40]], R, 24);
    v.poly([[21, 12], [24, 8], [27, 12], [25, 14], [23, 13]], 'sat-sang'); v.p(24, 9, 'bac');
    v.vl(28, 22, 34, 'nuoc-sang'); v.vl(29, 23, 34, 'troi');   // thác
    may(v, 12, 26, 7); may(v, 38, 24, 6);
  } else {
    // Tản Viên ba đỉnh (hình tán ô) nhô trên biển mây, mái đền trên đỉnh giữa
    khoi(v, [[0, 40], [6, 24], [11, 18], [16, 24], [24, 9], [32, 24], [37, 18], [42, 24], [48, 40]], R, 24);
    for (const [x, y] of [[11, 18], [37, 18]]) v.poly([[x - 2, y + 2], [x, y], [x + 2, y + 2]], 'reu-sang');
    v.rect(21, 7, 7, 2, 'son'); v.hl(20, 28, 6, 'son-sang'); v.p(19, 5, 'son-sang'); v.p(29, 5, 'son-sang'); v.vl(22, 9, 10, 'son-toi'); v.vl(26, 9, 10, 'son-toi');
    may(v, 9, 31, 9); may(v, 38, 32, 10); may(v, 24, 35, 8);
  }
  // đất / bãi cỏ phía trước
  v.rect(0, 40, 48, 8, 'la'); v.hl(0, 47, 40, 'la-ma');
  for (let x = 2; x < 48; x += 7) { v.p(x, 42 + (x % 3), 'la-sang'); v.p(x + 3, 45, 'la-toi'); }
  v.ell(10, 47, 12, 2, 'dat'); v.ell(38, 47, 9, 1.5, 'dat');
  // viền khung đồng 1px tối + 1px đồng
  v.rect(0, 0, 48, 1, 'vien'); v.rect(0, 47, 48, 1, 'vien'); v.rect(0, 0, 1, 48, 'vien'); v.rect(47, 0, 1, 48, 'vien');
  v.hl(1, 46, 1, 'dong'); v.hl(1, 46, 46, 'dong-toi'); v.vl(1, 1, 46, 'dong'); v.vl(46, 1, 46, 'dong-toi');
  return v;
}
const TEN = ['Gò Đất', 'Đồi Nhỏ', 'Núi Non', 'Núi Cao', 'Núi Thần'];
const MO = ['gò đất nâu nhú cỏ', 'đồi xanh tròn có một cây', 'núi hai đỉnh xanh lá, đỉnh đá', 'núi cao rêu đỉnh đá, thác nước, mây lưng chừng',
  'Tản Viên ba đỉnh (tán ô) trên biển mây, mặt trời vàng tia sáng, mái đền son trên đỉnh'];
const DS = {}; TEN.forEach((t, i) => { DS['nui-tan-vien-' + (i + 1)] = [() => canh(i + 1), 'Núi Tản Viên ' + (i + 1) + ' · ' + t, MO[i]]; });
module.exports = { DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 6); }
    else console.log(ghi('giao-dien', ma, ten, 'Khung cảnh vuông: ' + mo, v, { script: 'nui' }).f);
  }
}
