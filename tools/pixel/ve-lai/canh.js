// Cảnh 320×180 (canh/chuong-*, canh/ban-do-*) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 5–6.
// Bản đồ chương = bản đồ cổ nhìn từ trên (núi vẽ 3/4 như tranh bản đồ): địa hình mảng lớn, cây / nhà / ruộng đóng dấu vẽ tay,
// chừa dải giữa thoáng cho đường nét đứt + nút ải game vẽ đè. Vị trí vật dùng bộ sinh số cố định (seed) — không nhiễu từng điểm.
// Chạy: node tools/pixel/ve-lai/canh.js [--xem DIR] [mã…]
const { Ve, ghi, png } = require('./ve');

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---- vật đóng dấu (nhìn từ trên / 3/4)
const S = {
  cay: ['..aAAa..', '.aAAAAa.', 'aAAaAAAa', 'aAaaaAAb', 'baaaaabb', '.bbaabb.', '...tt...'],          // tán cây tròn + gốc
  cayNho: ['.aAa.', 'aAAab', 'baabb', '..t..'],
  tre: ['..a.a..', '.aAaAa.', 'aAaAaAa', 'baAaAab', '.b.t.b.'],
  bui: ['.aAa.', 'aaaab', '.bbb.'],
  da: ['.sSs.', 'sSssk', 'kkkk.'],
  nha: ['....rr....', '..rrRRrr..', '.rRRRRRRr.', 'rrrrrrrrrr', '.wwwddwww.', '.wwwddwww.'],      // nhà mái rơm
  dua: ['a.a.a', '.aAa.', 'aa.aa', '..t..', '..t..', '..t..'],
  sen: ['.aa.', 'aAAa', '.ab.'],
  lau: ['y.y', 'tyt', '.t.'],
  song: ['ww...ww', '..www..'],
  thuyen: ['.dddddd.', 'dDDDDDDd', '.dddddd.'],
};
function dau(v, k, x, y, map) { v.stamp(S[k], map, Math.round(x), Math.round(y)); }
const LA = { a: 'la', A: 'la-ma', b: 'la-toi', t: 'dat-toi' };
const RUNG = { a: 'la-toi', A: 'la', b: 'vien', t: 'dat-toi' };
const DA = { s: 'sat', S: 'sat-sang', k: 'sat-toi' };
const NHA = { r: 'cat', R: 'vang-sang', w: 'dat-sang', d: 'dat-toi' };

// núi 3/4 kiểu tranh bản đồ: tam giác sườn sáng trái / tối phải, đỉnh có thể phủ đá
function nui(v, x, y, w, h, mau = ['reu-toi', 'reu', 'reu-sang'], dinh = null) {
  const pk = x + w / 2;
  v.poly([[x, y], [pk, y - h], [x + w, y]], mau[1]);
  v.poly([[pk, y - h], [x + w, y], [pk + w * 0.08, y]], mau[0]);
  v.line(x, y - 1, pk, y - h, mau[2]);
  if (dinh) v.poly([[pk - h * 0.18, y - h * 0.72], [pk, y - h], [pk + h * 0.18, y - h * 0.72]], dinh);
  v.hl(Math.round(x), Math.round(x + w), y, 'toi');
}
// vùng nước: đa giác + bờ sáng + sóng lặp
function nuoc(v, pts, r, deep = false) {
  const m = new Ve(v.w, v.h); m.poly(pts, 1);
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (m.g[y][x]) {
    const bo = !m.get(x - 1, y) || !m.get(x + 1, y) || !m.get(x, y - 1) || !m.get(x, y + 1);
    const bo2 = !m.get(x - 2, y) || !m.get(x + 2, y) || !m.get(x, y - 2) || !m.get(x, y + 2);
    v.p(x, y, bo ? 'cat' : bo2 ? 'nuoc-sang' : deep ? 'cham' : 'nuoc');
  }
  for (let i = 0; i < (deep ? 26 : 10); i++) { const x = Math.floor(r() * v.w), y = Math.floor(r() * v.h); if (m.get(x, y) && m.get(x + 6, y + 1) && m.get(x, y + 2)) dau(v, 'song', x, y, { w: deep ? 'nuoc' : 'nuoc-sang' }); }
  return m;
}
// sông uốn: dải theo đường bậc ba qua các điểm, rộng w
function songUon(v, pts, w, r) {
  const m = new Ve(v.w, v.h);
  for (let i = 0; i + 1 < pts.length; i++) for (let t = 0; t <= 1; t += 0.01) {
    const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t + Math.sin(t * Math.PI) * (pts[i][2] || 0);
    m.ell(x, y, w, w * 0.8, 1);
  }
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (m.g[y][x]) {
    const bo = !m.get(x - 1, y) || !m.get(x + 1, y) || !m.get(x, y - 1) || !m.get(x, y + 1);
    const bo2 = !m.get(x - 2, y) || !m.get(x + 2, y) || !m.get(x, y - 2) || !m.get(x, y + 2);
    v.p(x, y, bo ? 'dat-sang' : bo2 ? 'nuoc-sang' : 'nuoc');
  }
  for (let i = 0; i < 18; i++) { const x = Math.floor(r() * v.w), y = Math.floor(r() * v.h); if (m.get(x - 1, y) && m.get(x + 7, y + 1)) dau(v, 'song', x, y, { w: 'nuoc-sang' }); }
  return m;
}
// rải vật trong vùng, tránh mặt nạ (nước / dải chừa)
function rai(v, r, n, k, map, ok, x0 = 0, y0 = 0, x1 = 320, y1 = 180) {
  const dat = [];
  for (let i = 0, t = 0; i < n && t < n * 30; t++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (!ok(x, y) || dat.some(([a, b]) => Math.abs(a - x) < S[k][0].length && Math.abs(b - y) < S[k].length)) continue;
    dat.push([x, y]); i++;
  }
  dat.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => dau(v, k, x, y, map));
}
// nền cỏ 2–3 tông mảng lớn (vệt elip), không điểm lẻ
function nen(v, r, mau, n = 40) {
  v.rect(0, 0, v.w, v.h, mau[1]);
  for (let i = 0; i < n * 0.6; i++) v.ell(r() * v.w, r() * v.h, 8 + r() * 14, 2 + r() * 3, mau[0]);   // vệt cỏ tối dẹt
  for (let i = 0; i < n * 3; i++) {                                                                    // khóm cỏ 3 điểm
    const x = Math.floor(r() * v.w), y = Math.floor(r() * v.h), c = i % 3 ? mau[0] : mau[2];
    v.p(x, y, c); v.p(x + 2, y, c); v.p(x + 1, y - 1, c);
  }
}
// dải chừa cho đường ải (nút: toạ độ 640×382 → 320×180): cột x 55..265, hàng y 70..128
const giua = (x, y) => x > 40 && x < 280 && y > 58 && y < 140;
// khung viền giấy dó: 2 vạch tối + đồng
function khung(v) {
  for (let i = 0; i < 2; i++) { v.rect(i, i, v.w - i * 2, 1, i ? 'dong' : 'vien'); v.rect(i, v.h - 1 - i, v.w - i * 2, 1, i ? 'dong-toi' : 'vien'); v.rect(i, i, 1, v.h - i * 2, i ? 'dong' : 'vien'); v.rect(v.w - 1 - i, i, 1, v.h - i * 2, i ? 'dong-toi' : 'vien'); }
}

// ---------------------------------------------------------------- chương Thạch Sanh: rừng sâu, cây đa + miếu, hang Chằn Tinh, đại bàng
function chuongThachSanh() {
  const v = new Ve(320, 180), r = rng(7);
  nen(v, r, ['la-toi', 'la', 'reu']);
  const W = songUon(v, [[-5, 150, 0], [60, 160, -10], [120, 172, 0], [200, 168, 10], [325, 176]], 5, r);
  // rừng rậm viền trên + hai bên
  rai(v, r, 120, 'cay', RUNG, (x, y) => !giua(x, y) && !W.get(x + 4, y + 6) && !(x > 230 && y < 60));
  rai(v, r, 40, 'cayNho', LA, (x, y) => !giua(x + 2, y) && !W.get(x + 2, y + 3));
  // cây đa + miếu (trái giữa)
  v.ell(30, 92, 22, 16, 'la-toi'); v.ell(26, 88, 17, 12, 'la'); v.ell(22, 84, 9, 6, 'la-ma'); v.rect(28, 100, 5, 10, 'dat'); v.vl(28, 100, 109, 'dat-sang');
  for (const x of [20, 24, 36, 40]) v.vl(x, 98, 108, 'dat-toi');   // rễ phụ
  v.rect(40, 104, 12, 7, 'trang-xam'); v.poly([[38, 105], [46, 98], [54, 105]], 'son'); v.hl(39, 53, 105, 'son-toi'); v.rect(44, 107, 3, 4, 'toi');
  // hang Chằn Tinh: núi đá + miệng hang (phải trên)
  nui(v, 236, 58, 76, 44, ['sat-toi', 'sat', 'sat-sang']); nui(v, 262, 52, 50, 30, ['sat-toi', 'sat', 'sat-sang']);
  v.ell(274, 52, 9, 7, 'vien'); v.rect(265, 52, 19, 6, 'vien'); v.ell(274, 53, 6, 5, 'khoi');
  for (const x of [268, 272, 277, 281]) { v.p(x, 47 + (x % 3), 'trang'); v.p(x, 48 + (x % 3), 'trang-xam'); }
  // đại bàng bay (trên)
  v.stamp(['k........k', 'kk......kk', '.kkkkkkkk.', '...kkkk...', '....kk....'], { k: 'vien' }, 150, 16);
  v.stamp(['k......k', '.kkkkkk.', '...kk...'], { k: 'vien' }, 180, 28);
  khung(v);
  return v;
}

// ---------------------------------------------------------------- chương Thánh Gióng: làng Phù Đổng, ruộng, lũy tre, núi Sóc
function chuongGiong() {
  const v = new Ve(320, 180), r = rng(11);
  nen(v, r, ['la', 'reu', 'la-ma'], 30);
  // ruộng lúa ô vuông có bờ (dưới + phải)
  const ruong = (x, y, w, h, c) => { v.rect(x, y, w, h, c); v.rect(x, y, w, 1, 'dat-sang'); v.rect(x, y, 1, h, 'dat-sang'); v.rect(x + w - 1, y, 1, h, 'dat'); v.rect(x, y + h - 1, w, 1, 'dat'); for (let j = y + 3; j < y + h - 1; j += 3) for (let i = x + 2; i < x + w - 1; i += 3) v.p(i, j, c === 'vang-nghe' ? 'cat' : 'la-ma'); };
  for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { const x = 8 + i * 30 + (j % 2) * 8, y = 140 + j * 14; if (x < 300) ruong(x, y, 26, 12, (i + j) % 3 ? 'la' : 'vang-nghe'); }
  for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) ruong(272 + i * 22, 66 + j * 16, 20, 14, (i + j) % 2 ? 'vang-nghe' : 'la');
  // núi Sóc (Gióng bay về trời) phải trên
  nui(v, 200, 52, 90, 46, ['la-toi', 'la', 'la-ma']); nui(v, 248, 50, 66, 34, ['reu-toi', 'reu', 'reu-sang']);
  for (let i = 0; i < 6; i++) v.p(250 + i * 3, 14 - i * 2, 'lua-sang');   // vệt lửa ngựa sắt bay
  v.ell(268, 6, 3, 2, 'lua');
  // làng Phù Đổng (trái trên): lũy tre bao quanh + nhà rơm + đình
  for (let a = 0; a < Math.PI * 2; a += 0.16) dau(v, 'tre', 52 + Math.cos(a) * 46, 30 + Math.sin(a) * 24, LA);
  for (const [x, y] of [[26, 20], [44, 14], [62, 22], [34, 36], [72, 36], [52, 40]]) dau(v, 'nha', x, y, NHA);
  v.rect(48, 26, 18, 6, 'trang-xam'); v.poly([[44, 27], [57, 18], [70, 27]], 'son'); v.hl(45, 69, 27, 'son-toi'); v.p(44, 25, 'son-sang'); v.p(70, 25, 'son-sang');   // đình làng
  // giặc Ân: trại lều đen + cờ (trái dưới)
  for (const [x, y] of [[14, 112], [30, 120], [8, 128]]) { v.poly([[x, y + 8], [x + 6, y], [x + 12, y + 8]], 'khoi'); v.hl(x, x + 12, y + 8, 'vien'); v.vl(x + 6, y - 6, y, 'dat'); v.rect(x + 7, y - 6, 4, 3, 'tim'); }
  rai(v, r, 26, 'cayNho', LA, (x, y) => !giua(x, y) && y < 136 && x < 260 && !(x < 105 && y < 62));
  khung(v);
  return v;
}

// ---------------------------------------------------------------- chương Lạc Long Quân: bờ biển, đảo, rồng biển, Ngư tinh
function chuongLlq() {
  const v = new Ve(320, 180), r = rng(5);
  v.rect(0, 0, 320, 180, 'cham');
  for (let i = 0; i < 30; i++) v.ell(r() * 320, r() * 180, 10 + r() * 24, 1.5 + r() * 2, i % 3 ? 'cham-toi' : 'cham-sang');
  // đất liền trái dưới, bãi cát
  const L = new Ve(320, 180); L.poly([[0, 40], [40, 46], [70, 70], [120, 84], [180, 96], [230, 126], [260, 180], [0, 180]], 1);
  for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) if (L.g[y][x]) {
    const d = [1, 2, 3, 4, 5, 6].find((k) => !L.get(x, y - k) || !L.get(x + k, y)) || 9;
    v.p(x, y, d <= 1 ? 'nuoc-sang' : d <= 2 ? 'trang' : d <= 6 ? 'cat' : 'la');
  }
  for (let i = 0; i < 20; i++) { const x = r() * 200, y = 110 + r() * 70; if (L.get(Math.round(x), Math.round(y)) && v.get(Math.round(x), Math.round(y)) === 'la') v.ell(x, y, 5 + r() * 7, 1.5 + r() * 1.5, 'la-toi'); }
  rai(v, r, 18, 'dua', { a: 'la', A: 'la-ma', t: 'dat' }, (x, y) => L.get(Math.round(x), Math.round(y) + 6) && !giua(x, y) && v.get(Math.round(x), Math.round(y)) !== 'cham');
  rai(v, r, 10, 'nha', NHA, (x, y) => L.get(Math.round(x), Math.round(y + 6)) && y > 140 && !giua(x, y));
  // sóng biển
  for (let i = 0; i < 70; i++) { const x = r() * 320, y = r() * 180; if (!L.get(Math.round(x), Math.round(y) + 3) && !L.get(Math.round(x) + 7, Math.round(y))) dau(v, 'song', x, y, { w: i % 3 ? 'nuoc' : 'nuoc-sang' }); }
  // đảo + hang Ngư tinh (phải trên)
  v.ell(270, 38, 30, 14, 'cat'); v.ell(270, 36, 26, 11, 'la'); nui(v, 250, 40, 44, 26, ['sat-toi', 'sat', 'sat-sang']);
  v.ell(272, 38, 5, 4, 'vien');
  v.ell(212, 22, 10, 5, 'cat'); v.ell(212, 21, 8, 3.5, 'la-ma');
  // rồng Lạc Long Quân uốn trên sóng (giữa trên)
  const rong = [[110, 30], [122, 22], [134, 30], [146, 22], [158, 30], [170, 22]];
  for (let i = 0; i + 1 < rong.length; i++) { v.line(rong[i][0], rong[i][1], rong[i + 1][0], rong[i + 1][1], 'ngoc'); v.line(rong[i][0], rong[i][1] + 1, rong[i + 1][0], rong[i + 1][1] + 1, 'ngoc'); v.line(rong[i][0], rong[i][1] + 2, rong[i + 1][0], rong[i + 1][1] + 2, 'ngoc'); v.line(rong[i][0], rong[i][1] - 1, rong[i + 1][0], rong[i + 1][1] - 1, 'ngoc-sang'); v.line(rong[i][0], rong[i][1] + 3, rong[i + 1][0], rong[i + 1][1] + 3, 'cham-toi'); }
  for (const [x, y] of rong.slice(0, -1)) v.p(x + 6, y - 3, 'vang-nghe');
  v.stamp(['..gg..', 'gggggk', 'gGgggg', '.gg...'], { g: 'ngoc', G: 'vang-sang', k: 'vien' }, 170, 19);
  // thuyền
  for (const [x, y] of [[200, 60], [150, 64]]) dau(v, 'thuyen', x, y, { d: 'dat-toi', D: 'dat' });
  khung(v);
  return v;
}

// ---------------------------------------------------------------- chương An Dương Vương: thành Cổ Loa xoáy ốc, sông, ruộng
function chuongAdv() {
  const v = new Ve(320, 180), r = rng(3);
  nen(v, r, ['la', 'reu', 'la-ma'], 30);
  const W = songUon(v, [[-5, 20, 0], [70, 30, 12], [140, 18, -10], [210, 26, 0], [325, 14]], 6, r);
  // thành ốc: 3 vòng thành đất (xoáy) quanh nội thành, phải giữa
  const cx = 240, cy = 104;
  for (const [rx, ry] of [[50, 34], [36, 24], [22, 14]]) {
    const m = new Ve(320, 180); m.ell(cx, cy, rx, ry, 1); m.ell(cx, cy, rx - 4, ry - 3, '_');
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) if (m.g[y][x]) v.p(x, y, y < cy ? 'dat-sang' : 'dat');
    v.ring(cx, cy, rx, ry, 'reu-toi'); v.ring(cx, cy, rx - 4, ry - 3, 'dat-toi');
    // cửa thành (khe ở bên trái mỗi vòng, lệch nhau tạo hình xoáy)
    v.rect(cx - rx + (rx === 50 ? 0 : 1), cy - 2 + (rx === 36 ? -6 : rx === 22 ? 5 : 0), 5, 4, 'la-ma');
  }
  // nội thành: điện + cờ + nỏ thần
  v.rect(cx - 8, cy - 4, 16, 8, 'trang-xam'); v.poly([[cx - 11, cy - 3], [cx, cy - 11], [cx + 11, cy - 3]], 'son'); v.hl(cx - 11, cx + 11, cy - 3, 'son-toi'); v.rect(cx - 2, cy + 1, 4, 3, 'toi');
  v.vl(cx + 14, cy - 18, cy - 2, 'dat'); v.rect(cx + 15, cy - 18, 6, 4, 'vang-nghe');
  v.stamp(['d.....d', '.d...d.', '..ddd..', '...D...', '...D...'], { d: 'dong-sang', D: 'dong' }, cx - 3, cy - 26);
  // ruộng + làng (trái dưới), quân Triệu Đà (lều tím) góc trái trên
  for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) { const x = 12 + i * 34, y = 146 + j * 15; v.rect(x, y, 30, 12, (i + j) % 2 ? 'la' : 'vang-nghe'); v.rect(x, y, 30, 1, 'dat-sang'); v.rect(x, y + 11, 30, 1, 'dat'); }
  for (const [x, y] of [[12, 44], [26, 50], [40, 42]]) { v.poly([[x, y + 8], [x + 6, y], [x + 12, y + 8]], 'tim-toi'); v.hl(x, x + 12, y + 8, 'vien'); v.vl(x + 6, y - 6, y, 'dat'); v.rect(x + 7, y - 6, 4, 3, 'son'); }
  rai(v, r, 30, 'cayNho', LA, (x, y) => !giua(x, y) && !W.get(Math.round(x) + 2, Math.round(y) + 3) && !(x > 183 && y > 62) && y < 140);
  khung(v);
  return v;
}

// sàn lát đá: ô Voronoi (mỗi ô một tông, khe tối, mép trên-trái ô sáng) trong vùng ok(x, y)
function sanDa(v, r, n, tong, khe, ok, sang = null) {
  const P = Array.from({ length: n }, () => [r() * v.w, r() * v.h, tong[Math.floor(r() * tong.length)]]);
  const id = (x, y) => { let b = 0, d = 1e9; for (let i = 0; i < P.length; i++) { const e = (P[i][0] - x) ** 2 + ((P[i][1] - y) * 1.6) ** 2; if (e < d) { d = e; b = i; } } return b; };
  const I = Array.from({ length: v.h }, (_, y) => Array.from({ length: v.w }, (_, x) => id(x, y)));
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (ok(x, y)) {
    const c = I[y][x], k = (x + 1 < v.w && I[y][x + 1] !== c) || (y + 1 < v.h && I[y + 1][x] !== c);
    const t = (x > 0 && I[y][x - 1] !== c) || (y > 0 && I[y - 1][x] !== c);
    v.p(x, y, k ? khe : t && sang ? sang : P[c][2]);
  }
}
// khoảng sân giữa hình hữu cơ (hợp nhiều elip) — mặt nạ
function sanGiua(r, rx = 112, ry = 52) {
  const m = new Ve(320, 180);
  for (let i = 0; i < 7; i++) m.ell(160 + (r() - 0.5) * 90, 94 + (r() - 0.5) * 34, rx * (0.55 + r() * 0.3), ry * (0.6 + r() * 0.3), 1);
  return m;
}
const tuMat = (v, m, mau, vien) => { for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) if (m.g[y][x]) v.p(x, y, (!m.get(x - 1, y) || !m.get(x + 1, y) || !m.get(x, y - 1) || !m.get(x, y + 1)) && vien ? vien : mau); };
const ao = (v, r, x, y, w, h) => { const pts = []; for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5, q = 0.75 + r() * 0.3; pts.push([x + Math.cos(a) * w * q, y + Math.sin(a) * h * q]); } return nuoc(v, pts, r); };

// ---------------------------------------------------------------- nền sân theo chủ đề (canh/ban-do-*): khoảng giữa thoáng, trang trí dồn ra mép
const vienSan = (x, y, m = 34) => x < m || x > 320 - m || y < m * 0.7 || y > 180 - m * 0.7;
function banDo(theme) {
  const v = new Ve(320, 180), r = rng(theme.length * 97 + theme.charCodeAt(0));
  if (theme === 'song' || theme === 'dam') {
    nen(v, r, ['la', 'reu', 'la-ma'], 34);
    const G = sanGiua(r); tuMat(v, G, 'reu-sang', 'reu');
    for (let i = 0; i < 260; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 180); if (v.get(x, y) === 'reu-sang' && v.get(x + 2, y) === 'reu-sang') { v.p(x, y, 'reu'); v.p(x + 2, y, 'reu'); v.p(x + 1, y - 1, 'la-sang'); } }
    if (theme === 'song') {
      const W = songUon(v, [[-5, 16, 0], [80, 22, 8], [170, 12, -6], [250, 20, 0], [325, 8]], 8, r);
      songUon(v, [[300, 20, 0], [312, 90, 6], [326, 180]], 7, r);
      rai(v, r, 30, 'lau', { y: 'cat', t: 'reu-toi' }, (x, y) => !W.get(x, y + 3) && y < 40 && W.get(x, y - 6));
      rai(v, r, 44, 'cay', LA, (x, y) => vienSan(x, y) && !G.get(x + 4, y + 4) && !W.get(x + 4, y + 4) && !W.get(x + 4, y + 8) && x < 290);
      rai(v, r, 16, 'da', DA, (x, y) => vienSan(x, y, 44) && !W.get(x + 2, y + 2) && !G.get(x, y));
    } else {
      for (const [x, y, w, h] of [[34, 32, 30, 14], [276, 44, 28, 18], [44, 150, 36, 14], [258, 152, 42, 15], [168, 14, 36, 9]]) {
        const M = ao(v, r, x, y, w, h);
        rai(v, r, 7, 'sen', { a: 'la', A: 'la-ma', b: 'hong' }, (a, b) => M.get(a, b) && M.get(a + 4, b + 3) && M.get(a + 4, b) && M.get(a, b + 3), x - w, y - h, x + w, y + h);
      }
      rai(v, r, 44, 'lau', { y: 'cat', t: 'reu-toi' }, (x, y) => vienSan(x, y) && !G.get(x, y) && !['nuoc', 'nuoc-sang', 'cat'].includes(v.get(x + 1, y + 2)));
      rai(v, r, 14, 'cayNho', LA, (x, y) => vienSan(x, y, 26) && !['nuoc', 'cat', 'nuoc-sang'].includes(v.get(x + 2, y + 3)));
    }
  } else if (theme === 'rung') {
    nen(v, r, ['la-toi', 'la', 'reu'], 30);
    const G = sanGiua(r, 122, 58); tuMat(v, G, 'dat-sang', 'dat');
    for (let i = 0; i < 240; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 180); if (v.get(x, y) === 'dat-sang') v.hl(x, x + 1, y, i % 3 ? 'dat' : 'cat'); }
    rai(v, r, 120, 'bui', LA, (x, y) => G.get(x, y) && !G.get(x, y - 8) || (G.get(x + 3, y) && !G.get(x - 6, y)));
    rai(v, r, 180, 'cay', RUNG, (x, y) => !G.get(x + 4, y + 3) && !G.get(x + 4, y + 7));
    rai(v, r, 8, 'da', DA, (x, y) => G.get(x, y) && G.get(x + 5, y + 3));
  } else if (theme === 'hang') {
    v.rect(0, 0, 320, 180, 'vien');
    const G = sanGiua(r, 132, 64);
    sanDa(v, r, 220, ['sat-toi', 'sat', 'sat'], 'vien', (x, y) => !G.get(x, y), 'sat-sang');
    sanDa(v, r, 170, ['dat', 'dat', 'dat-sang'], 'dat-toi', (x, y) => G.get(x, y), 'cat');
    const TT = ['..c..', '.cCc.', 'cCcCk', 'ckckk', '.kkk.'];
    for (let i = 0; i < 40; i++) { const x = r() * 310, y = r() * 172; if (!G.get(x + 2, y + 4) && !G.get(x - 4, y) && !G.get(x + 8, y)) v.stamp(TT, i % 2 ? { c: 'tim', C: 'tim-sang', k: 'tim-toi' } : { c: 'ngoc', C: 'ngoc-sang', k: 'cham-toi' }, Math.round(x), Math.round(y)); }
    for (let i = 0; i < 18; i++) { const x = r() * 310, y = r() * 172; if (!G.get(x + 3, y + 9)) nui(v, Math.round(x), Math.round(y) + 9, 7, 12, ['sat-toi', 'sat', 'sat-sang']); }
    for (const [x, y] of [[100, 58], [226, 128], [124, 134]]) v.stamp(['t.....t', '.ttttt.', 't.....t'], { t: 'trang-xam' }, x, y);
  } else if (theme === 'dong') {
    v.rect(0, 0, 320, 180, 'la');
    for (let j = 0; j < 9; j++) for (let i = 0; i < 12; i++) {
      const x = i * 28 - 6 + (j % 2) * 10, y = j * 21 - 4, c = (i * 3 + j) % 4 === 0 ? 'vang-nghe' : (i + j) % 3 === 0 ? 'la-ma' : 'la';
      v.rect(x, y, 26, 19, c); v.rect(x, y, 26, 1, 'dat-sang'); v.rect(x, y, 1, 19, 'dat-sang'); v.rect(x + 25, y, 1, 19, 'dat'); v.rect(x, y + 18, 26, 1, 'dat');
      for (let b = y + 3; b < y + 17; b += 3) for (let a = x + 2; a < x + 25; a += 3) v.p(a, b, c === 'vang-nghe' ? 'cat' : c === 'la' ? 'la-ma' : 'la-sang');
    }
    const G = sanGiua(r, 104, 50); tuMat(v, G, 'cat', 'dat-sang');
    for (let i = 0; i < 200; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 180); if (v.get(x, y) === 'cat') v.hl(x, x + 1, y, i % 2 ? 'dat-sang' : 'vang-sang'); }
    const TRAU = ['..kk....kk', '.kkkkkkkkk', 'kkkkkkkkk.', 'kkkkkkkk..', '.k.k..k.k.'];
    for (const [x, y] of [[30, 30], [272, 140], [250, 24]]) v.stamp(TRAU, { k: 'khoi' }, x, y);
    for (const [x, y] of [[20, 150], [290, 60]]) dau(v, 'nha', x, y, NHA);
  } else if (theme === 'bien') {
    v.rect(0, 0, 320, 180, 'cat');
    for (let i = 0; i < 260; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 180); v.hl(x, x + 1, y, i % 2 ? 'vang-sang' : 'dat-sang'); }
    const pts = [[-4, -4], [324, -4], [324, 180], [292, 180], [282, 120], [264, 66], [222, 46], [140, 40], [60, 36], [-4, 40]];
    // cát ướt: dải sẫm dọc mép nước
    const U = new Ve(320, 180); U.poly(pts.map(([x, y]) => [x + (x > 250 ? -8 : 0), y + (y < 60 ? 8 : 0)]), 1); tuMat(v, U, 'dat-sang', null);
    const M = nuoc(v, pts, r, true);
    for (let i = 0; i < 70; i++) { const x = r() * 320, y = r() * 180; if (M.get(x, y) && M.get(x + 7, y + 1) && M.get(x, y + 3)) dau(v, 'song', x, y, { w: 'nuoc-sang' }); }
    const DUA = ['.a..a..a.', 'aAa.a.aAa', '..aAAAa..', '.aa.t.aa.', 'a...t...a', '....t....', '....t....', '...ttt...'];
    for (const [x, y] of [[10, 52], [28, 140], [6, 160], [240, 156], [262, 134], [56, 160]]) v.stamp(DUA, { a: 'la', A: 'la-ma', t: 'dat' }, x, y);
    const SO = ['.hh.', 'hHHh', 'hhhk'], SAO = ['..s..', 'sssss', '.sSs.', 's...s'];
    for (let i = 0; i < 16; i++) { const x = r() * 250, y = 56 + r() * 120; if (!U.get(x, y) && !M.get(x + 6, y)) v.stamp(i % 3 ? SO : SAO, i % 3 ? { h: 'hong', H: 'trang', k: 'dat' } : { s: 'lua', S: 'lua-sang' }, Math.round(x), Math.round(y)); }
    for (const [x, y] of [[36, 70], [210, 150], [150, 168]]) dau(v, 'da', x, y, DA);
    for (const [x, y] of [[236, 26], [120, 18]]) dau(v, 'thuyen', x, y, { d: 'dat-toi', D: 'dat' });
  } else if (theme === 'thanh') {
    v.rect(0, 0, 320, 180, 'dat');
    sanDa(v, r, 260, ['cat', 'cat', 'cat', 'dat-sang'], 'dat', (x, y) => y > 36 && x > 13 && x < 306, 'vang-sang');
    v.ring(160, 106, 46, 23, 'dong'); v.ring(160, 106, 47, 24, 'dong-toi');
    for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8; v.p(160 + Math.cos(a) * 54, 106 + Math.sin(a) * 27, 'dong'); }
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; v.line(160, 106, 160 + Math.cos(a) * 10, 106 + Math.sin(a) * 5, 'dong'); }
    // tường thành trên: lũy đất + rào cọc + vọng lâu + cờ
    v.rect(0, 0, 320, 34, 'dat'); v.rect(0, 0, 320, 6, 'reu'); v.hl(0, 319, 6, 'reu-toi'); v.rect(0, 34, 320, 3, 'dat-toi');
    for (let x = 0; x < 320; x += 6) { v.rect(x, 26, 5, 3, 'dat-sang'); v.hl(x, x + 4, 29, 'dat-toi'); }
    for (let x = 2; x < 320; x += 4) { v.vl(x, 8, 14, 'dat-toi'); v.p(x, 7, 'dat-sang'); }
    for (const x of [40, 160, 280]) { v.rect(x - 12, 10, 24, 16, 'dat-sang'); v.rect(x - 12, 10, 24, 1, 'cat'); v.poly([[x - 15, 11], [x, 2], [x + 15, 11]], 'son'); v.hl(x - 15, x + 15, 11, 'son-toi'); v.rect(x - 3, 18, 6, 8, 'toi'); v.vl(x + 16, 0, 10, 'dat'); v.rect(x + 17, 0, 6, 4, 'vang-nghe'); }
    v.rect(0, 34, 14, 146, 'dat'); v.rect(306, 34, 14, 146, 'dat'); v.vl(13, 34, 179, 'dat-toi'); v.vl(306, 34, 179, 'dat-sang');
    for (const [x, y] of [[32, 160], [288, 160]]) { v.ell(x, y, 12, 9, 'dong'); v.ring(x, y, 12, 9, 'dong-toi'); v.ring(x, y, 8, 6, 'dong-sang'); v.ell(x, y, 2, 2, 'vang-sang'); }
  }
  khung(v);
  return v;
}
const BAN_DO = { song: 'sông: bãi cỏ giữa sáng, sông uốn mép trên + mép phải có bờ cát, lau sậy, cây tán tròn ở rìa',
  dam: 'đầm: 5 ao nước có bờ cát + sen hồng, lau sậy, cây nhỏ ở rìa, bãi cỏ giữa',
  rung: 'rừng: vòng cây tán tối dày quanh, khoảng đất sáng giữa, bụi + đá',
  hang: 'hang: nền đá tối, sàn đất nứt gãy khúc giữa, đá, tinh thể tím / ngọc, măng đá, xương',
  dong: 'đồng: ruộng lúa ô bờ (xanh + vàng chín) phủ kín, sân đất giữa, trâu đen, nhà rơm',
  bien: 'biển: bãi cát vàng giữa, biển chàm sâu mép trên + phải có sóng, dừa, vỏ ốc, thuyền',
  thanh: 'thành: sân gạch lát so le + vòng trống đồng giữa, lũy đất rào cọc + 3 vọng lâu mái son cờ vàng ở trên, tường hai bên, trống đồng góc' };

const DS = {
  ...Object.fromEntries(Object.entries(BAN_DO).map(([k, mo]) => ['ban-do-' + k, [() => banDo(k), 'Nền sân ' + k, 'Nền sân ' + mo]])),
  'chuong-thachsanh': [chuongThachSanh, 'Bản đồ chương Thạch Sanh', 'Rừng sâu tán tối, cây đa cổ thụ + miếu son, hang Chằn Tinh trong núi đá (răng nhũ), đại bàng bay, suối dưới'],
  'chuong-giong': [chuongGiong, 'Bản đồ chương Thánh Gióng', 'Làng Phù Đổng trong lũy tre (nhà rơm, đình son), ruộng lúa ô bờ, núi Sóc + vệt lửa ngựa sắt bay, trại giặc Ân lều đen cờ tím'],
  'chuong-llq': [chuongLlq, 'Bản đồ chương Lạc Long Quân', 'Bờ biển cát + dừa + làng chài, biển chàm sóng, đảo hang Ngư tinh, rồng ngọc uốn trên sóng, thuyền'],
  'chuong-adv': [chuongAdv, 'Bản đồ chương An Dương Vương', 'Thành Cổ Loa 3 vòng đất xoáy ốc + điện son + nỏ thần, sông uốn phía trên, ruộng, trại Triệu Đà lều tím'],
};
module.exports = { DS, Ve, rng, nui, nuoc, songUon, rai, nen, dau, khung, S, LA, RUNG, DA, NHA };
if (require.main === module) {
  const a = process.argv.slice(2), xi = a.indexOf('--xem'), xem = xi >= 0 && a[xi + 1], chon = a.filter((s, i) => !s.startsWith('--') && i !== xi + 1);
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    if (chon.length && !chon.includes(ma)) continue;
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 3); }
    else console.log(ghi('canh', ma, ten, mo, v, { script: 'canh' }).f);
  }
}
