// Tranh ngang 320×180: phông truyện (canh/truyen-nen-*), cảnh thắng / thua (canh/thang-*, thua-*, nen-thang, nen-thua),
// tranh truyện Sơn Tinh (canh/truyen-sontinh-1..3) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 7–8.
// Lớp: trời (dải màu phẳng) · mặt trời / trăng / mặt trống đồng · núi xa 2–3 lớp (đỉnh gãy khúc, sườn trái sáng) · trung cảnh · đất.
// Nhân vật = sprite pixel vẽ tay của game (tools/pixel/src/tuong|boss) phóng nguyên lần → cùng nét với trận.
// Chạy: node tools/pixel/ve-lai/tranh-ngang.js [--xem DIR] [mã…]
const { Ve, ghi, png, sprite, phong } = require('./ve');
const { rng, S, dau, LA, RUNG, NHA } = require('./canh');

function troi(v, mau, cuts) {   // mau: [trên … dưới], cuts: dòng chuyển dải
  let y0 = 0; mau.forEach((c, i) => { const y1 = i < cuts.length ? cuts[i] : v.h; v.rect(0, y0, v.w, y1 - y0, c); y0 = y1; });
}
// dãy núi: đỉnh gãy khúc theo seed, tô kín tới đáy; mép trên sườn đi lên (trái → phải) sáng
function day(v, r, y, cao, mau, sang = null, buoc = [18, 40]) {
  const pts = []; let x = -10;
  while (x < v.w + 40) { pts.push([x, y - r() * cao]); x += buoc[0] + r() * (buoc[1] - buoc[0]); pts.push([x, y - cao * 0.15 - r() * cao * 0.3]); x += buoc[0] * 0.6 + r() * buoc[0]; }
  const yAt = (X) => { for (let i = 0; i + 1 < pts.length; i++) if (X >= pts[i][0] && X <= pts[i + 1][0]) return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (X - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return y; };
  for (let X = 0; X < v.w; X++) {
    const t = Math.round(yAt(X)); v.vl(X, t, v.h - 1, mau);
    if (sang && yAt(X + 1) < yAt(X) - 0.2) { v.p(X, t, sang); v.p(X, t + 1, sang); }
  }
  return yAt;
}
function may(v, x, y, w, c = ['trang', 'sang', 'trang-xam']) {
  v.rect(x, y, w, 3, c[0]); v.rect(x + 3, y - 2, w * 0.5, 2, c[0]); v.rect(x + w * 0.35, y - 4, w * 0.35, 2, c[1]); v.hl(x + 4, x + w * 0.5, y - 2, c[1]); v.hl(x, x + w - 1, y + 3, c[2]);
}
function matTroi(v, x, y, R, mau = ['vang-sang', 'sang']) { v.ell(x, y, R, R, mau[0]); v.ell(x - R * 0.2, y - R * 0.2, R * 0.6, R * 0.6, mau[1]); }
function trong(v, x, y, R) {   // mặt trống đồng làm mặt trời
  v.ell(x, y, R, R, 'dong-sang'); v.ring(x, y, R, R, 'dong'); v.ring(x, y, R - 3, R - 3, 'dong'); v.ring(x, y, R * 0.45, R * 0.45, 'dong');
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; v.line(x, y, x + Math.cos(a) * R * 0.4, y + Math.sin(a) * R * 0.4, 'vang-sang'); }
  for (let k = 0; k < 24; k++) { const a = (k * Math.PI) / 12; v.p(x + Math.cos(a) * (R - 1.5), y + Math.sin(a) * (R - 1.5), 'vang-nghe'); }
}
function tia(v, x, y, r0, r1, n, c) { for (let k = 0; k < n; k++) { const a = Math.PI + (k + 0.5) * Math.PI / n; v.line(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, c); } }
function dat(v, y, mau, r, tuft = true) {
  v.rect(0, y, v.w, v.h - y, mau[1]); v.hl(0, v.w - 1, y, mau[2]);
  if (tuft) for (let i = 0; i < 90; i++) { const x = Math.floor(r() * v.w), yy = y + 3 + Math.floor(r() * (v.h - y - 4)); v.p(x, yy, mau[i % 2 ? 0 : 2]); v.p(x + 2, yy, mau[i % 2 ? 0 : 2]); v.p(x + 1, yy - 1, mau[i % 2 ? 0 : 2]); }
}
function nhanVat(v, nhom, ma, x, chan, k, anim, i = 0, lat = false) {
  const s = phong(sprite(nhom, ma, anim, i), k); v.put(s, Math.round(x - s.w / 2), Math.round(chan - s.h + k), lat);
}
function songNuoc(v, r, y, mau = ['cham', 'nuoc', 'nuoc-sang', 'troi']) {
  v.rect(0, y, v.w, v.h - y, mau[1]); v.hl(0, v.w - 1, y, mau[3]);
  for (let i = 0; i < 70; i++) { const x = r() * v.w, yy = y + 3 + r() * (v.h - y - 4); dau(v, 'song', x, yy, { w: i % 3 ? mau[2] : mau[0] }); }
}
function lua(v, x, y, h) {   // ngọn lửa 3 tông
  v.poly([[x - h * 0.35, y], [x - h * 0.1, y - h * 0.6], [x, y - h], [x + h * 0.15, y - h * 0.55], [x + h * 0.35, y]], 'son-sang');
  v.poly([[x - h * 0.22, y], [x - h * 0.05, y - h * 0.5], [x + h * 0.05, y - h * 0.75], [x + h * 0.22, y]], 'lua');
  v.poly([[x - h * 0.1, y], [x, y - h * 0.35], [x + h * 0.1, y]], 'lua-sang');
}
function mua(v, r, n, c = 'nuoc-sang') { for (let i = 0; i < n; i++) { const x = r() * v.w, y = r() * v.h; v.line(x, y, x - 2, y + 5, c); } }

// ---------------------------------------------------------------- phông truyện (nhân vật game vẽ đè, chân ở y ≈ 150)
function nen(theme) {
  const v = new Ve(320, 180), r = rng(theme.length * 31 + theme.charCodeAt(1));
  if (theme === 'bien') {
    troi(v, ['nuoc', 'nuoc-sang', 'troi', 'sang'], [22, 50, 80]); matTroi(v, 250, 38, 12);
    may(v, 30, 30, 40); may(v, 160, 22, 30);
    songNuoc(v, r, 92, ['cham', 'nuoc', 'nuoc-sang', 'troi']);
    v.ell(64, 92, 26, 5, 'cham-sang'); day(v, r, 92, 12, 'cham-sang', null, [8, 14]);   // đảo xa
    songNuoc(v, r, 92);
    v.poly([[0, 140], [120, 132], [240, 138], [320, 130], [320, 180], [0, 180]], 'cat'); v.line(0, 140, 120, 132, 'trang'); v.line(120, 132, 240, 138, 'trang'); v.line(240, 138, 320, 130, 'trang');
    for (let i = 0; i < 40; i++) v.hl(Math.floor(r() * 320), Math.floor(r() * 320) % 320 + 1, 145 + Math.floor(r() * 34), 'dat-sang');
    const DUA = ['..aa..aa..', '.aAAaaAAa.', 'aa..aa..aa', '....tt....', '....t.....', '...tt.....', '...t......', '..tt......', '..t.......', '..t.......', '.tt.......'];
    v.put(phong(new Ve(10, 11).stamp(DUA, { a: 'la', A: 'la-ma', t: 'dat' }), 3), 268, 108);
  } else if (theme === 'dam') {
    troi(v, ['nuoc', 'nuoc-sang', 'troi', 'sang'], [24, 54, 88]); matTroi(v, 70, 40, 9);
    day(v, r, 104, 28, 'cham-sang', null); day(v, r, 110, 16, 'reu-sang', 'la-sang');
    v.rect(0, 112, 320, 30, 'nuoc'); v.hl(0, 319, 112, 'troi');
    for (let i = 0; i < 30; i++) dau(v, 'song', r() * 320, 116 + r() * 22, { w: 'nuoc-sang' });
    for (let i = 0; i < 14; i++) { const x = r() * 320, y = 116 + r() * 22; v.ell(x, y, 5, 2, 'la'); v.hl(Math.round(x) - 3, Math.round(x) + 3, Math.round(y) - 1, 'la-ma'); if (i % 3 === 0) { v.vl(Math.round(x), Math.round(y) - 7, Math.round(y) - 2, 'la-toi'); v.ell(x, y - 8, 2, 2, 'hong'); v.p(x, y - 9, 'trang'); } }
    dat(v, 142, ['la-toi', 'la', 'la-ma'], r);
    for (let x = 0; x < 320; x += 5 + Math.floor(r() * 4)) { const h = 10 + r() * 14; v.vl(x, Math.round(142 - h), 145, 'reu'); v.p(x, Math.round(142 - h), 'cat'); v.p(x, Math.round(142 - h) + 1, 'dat-sang'); }
  } else if (theme === 'dem') {
    troi(v, ['cham-toi', 'cham', 'cham-sang'], [50, 96]);
    for (let i = 0; i < 40; i++) v.p(Math.floor(r() * 320), Math.floor(r() * 100), i % 4 ? 'troi' : 'sang');
    v.ell(250, 34, 11, 11, 'trang'); v.ell(246, 31, 7, 7, 'sang'); v.ell(255, 30, 9, 9, 'cham');
    day(v, r, 120, 34, 'cham-toi', 'cham');
    // làng tối: nhà sàn đèn vàng + lũy tre
    for (const [x, w] of [[40, 34], [120, 28], [210, 36]]) { v.rect(x, 118, w, 14, 'khoi'); v.poly([[x - 6, 120], [x + w / 2, 104], [x + w + 6, 120]], 'vien'); v.rect(x + 6, 122, 4, 4, 'vang-nghe'); v.rect(x + w - 10, 122, 4, 4, 'lua-sang'); for (let k = x + 2; k < x + w; k += 6) v.vl(k, 132, 140, 'vien'); }
    for (let x = 0; x < 320; x += 3) { const h = 16 + ((x * 7) % 11); v.vl(x, 140 - h, 140, 'la-toi'); if (x % 6 === 0) v.line(x, 140 - h, x - 3, 140 - h + 3, 'la-toi'); }
    dat(v, 140, ['vien', 'khoi', 'toi'], r);
  } else if (theme === 'dong') {
    troi(v, ['nuoc', 'nuoc-sang', 'troi', 'sang'], [20, 46, 76]); matTroi(v, 60, 30, 10); may(v, 180, 28, 46);
    day(v, r, 96, 34, 'cham-sang', 'nuoc-sang'); day(v, r, 108, 18, 'la', 'la-ma');
    // ruộng bậc phẳng: dải xanh / vàng có bờ
    for (let j = 0; j < 4; j++) { const y = 108 + j * 9; v.rect(0, y, 320, 9, j % 2 ? 'vang-nghe' : 'la-ma'); v.hl(0, 319, y, 'dat-sang'); for (let x = (j * 5) % 7; x < 320; x += 7) v.p(x, y + 4, j % 2 ? 'cat' : 'la-sang'); }
    dat(v, 144, ['dat', 'dat-sang', 'cat'], r);
  } else if (theme === 'hang') {
    v.rect(0, 0, 320, 180, 'toi');
    // cửa hang sáng xa: mảng đá viền gãy khúc, ánh ngày xám xanh, tia sáng xiên
    v.poly([[110, 120], [104, 70], [124, 34], [160, 24], [196, 36], [214, 72], [208, 120]], 'sat-toi');
    v.poly([[122, 118], [118, 74], [134, 44], [160, 36], [186, 46], [200, 76], [196, 118]], 'sat');
    v.poly([[134, 116], [132, 78], [146, 54], [162, 48], [178, 56], [188, 80], [186, 116]], 'cham-sang');
    v.poly([[146, 112], [146, 82], [160, 64], [174, 82], [174, 112]], 'nuoc-sang');
    for (let x = 0; x < 320; x += 9) { const h = 8 + ((x * 13) % 26); v.poly([[x, 0], [x + 9, 0], [x + 4.5, h]], 'khoi'); v.p(x + 3, 2, 'sat-toi'); }
    day(v, r, 146, 20, 'khoi', 'sat-toi', [10, 20]);
    for (let i = 0; i < 6; i++) { const x = 20 + r() * 280; v.poly([[x - 5, 150], [x, 120 - r() * 10], [x + 5, 150]], 'sat-toi'); }
    for (const [x, y] of [[40, 120], [276, 112], [90, 134]]) { v.poly([[x, y + 10], [x + 3, y], [x + 6, y + 10]], 'tim'); v.vl(x + 3, y + 2, y + 8, 'tim-sang'); }
    dat(v, 150, ['vien', 'khoi', 'sat-toi'], r);
  } else if (theme === 'nui') {
    troi(v, ['cham-sang', 'nuoc-sang', 'troi', 'sang'], [22, 50, 80]); matTroi(v, 254, 40, 10);
    day(v, r, 104, 60, 'cham-sang', 'nuoc-sang', [24, 46]); may(v, 40, 70, 50); may(v, 210, 78, 40);
    day(v, r, 124, 40, 'reu', 'reu-sang', [20, 40]); day(v, r, 140, 18, 'la', 'la-ma');
    dat(v, 148, ['la-toi', 'la', 'la-ma'], r);
  } else if (theme === 'rung') {
    troi(v, ['la-sang', 'reu-sang', 'la-ma'], [40, 90]);
    day(v, r, 90, 30, 'reu', 'reu-sang', [10, 20]);
    for (let i = 0; i < 22; i++) { const x = r() * 320, w = 6 + r() * 6; v.rect(Math.round(x), 30, Math.round(w), 120, i % 2 ? 'dat-toi' : 'dat'); v.vl(Math.round(x), 30, 149, 'dat-sang'); }
    for (let i = 0; i < 60; i++) v.ell(r() * 320, r() * 50, 14 + r() * 16, 8 + r() * 8, i % 3 ? 'la' : 'la-toi');
    for (let i = 0; i < 30; i++) v.ell(r() * 320, 10 + r() * 40, 5, 3, 'la-ma');
    dat(v, 148, ['la-toi', 'la', 'reu'], r);
    for (let i = 0; i < 18; i++) dau(v, 'bui', r() * 320, 144 + r() * 6, LA);
  } else if (theme === 'thanh') {
    troi(v, ['tim-sang', 'hong', 'lua-sang', 'vang-sang'], [18, 40, 66]); matTroi(v, 70, 50, 12);
    day(v, r, 100, 24, 'cham-sang', null);
    // ba lớp lũy đất Cổ Loa
    for (const [y, c, cs] of [[104, 'dat', 'dat-sang'], [116, 'dat-sang', 'cat'], [128, 'dat', 'dat-sang']]) { v.rect(0, y, 320, 14, c); v.hl(0, 319, y, 'reu'); v.hl(0, 319, y + 1, cs); for (let x = 0; x < 320; x += 4) v.vl(x, y - 4, y - 1, 'dat-toi'); }
    v.rect(140, 82, 40, 24, 'dat'); v.poly([[132, 84], [160, 70], [188, 84]], 'son'); v.hl(132, 188, 84, 'son-toi'); v.rect(156, 92, 8, 14, 'toi'); v.vl(186, 60, 84, 'dat'); v.rect(187, 60, 10, 6, 'vang-nghe');
    dat(v, 142, ['dat', 'dat-sang', 'cat'], r);
  }
  return v;
}

// ---------------------------------------------------------------- cảnh thắng (bình minh, trống đồng mặt trời, tướng đứng giữa)
// và thua (đêm bão / lửa, boss chiếm giữa) theo chương — chủ thể ở giữa (màn kết quả cắt hai bên)
function canhKetQua(ch, thang) {
  const v = new Ve(320, 180), r = rng(ch.length * 13 + (thang ? 1 : 7));
  if (thang) {
    troi(v, ['lua-sang', 'vang-sang', 'sang', 'vang-sang'], [34, 70, 100]);
    tia(v, 160, 70, 34, 140, 14, 'sang'); trong(v, 160, 62, 26);
    may(v, 30, 56, 46, ['sang', 'sang', 'vang-sang']); may(v, 240, 50, 50, ['sang', 'sang', 'vang-sang']);
  } else {
    troi(v, ch === 'giong' || ch === 'adv' ? ['vien', 'son-toi', 'son', 'lua'] : ['vien', 'cham-toi', 'cham', 'cham-sang'], [36, 76, 110]);
    for (let i = 0; i < 8; i++) v.ell(r() * 320, 10 + r() * 34, 30 + r() * 30, 8 + r() * 6, i % 2 ? 'khoi' : 'toi');   // mây đen
  }
  const ngay = thang;
  if (ch === 'sontinh') {
    day(v, r, 120, 30, ngay ? 'cham-sang' : 'cham-toi', null);
    if (ngay) {   // Tản Viên ba đỉnh, nước rút xuống chân núi
      v.poly([[50, 160], [112, 118], [134, 124], [160, 100], [186, 124], [208, 118], [270, 160]], 'reu'); v.poly([[160, 100], [186, 124], [208, 118], [270, 160], [168, 160]], 'reu-toi');
      v.line(50, 159, 112, 118, 'reu-sang'); v.line(134, 124, 160, 100, 'reu-sang'); v.rect(150, 100, 21, 3, 'reu-sang');
      songNuoc(v, r, 156); v.ell(160, 106, 16, 4, 'reu-sang'); v.ell(160, 107, 14, 3, 'reu'); nhanVat(v, 'tuong', 'tanvien', 160, 106, 3, 'idle');
    } else {   // thành Phong Châu chìm, mưa, Thủy Tinh cưỡi sóng
      v.put(phong(require('./cong').DS['cong-phong-chau'][0](), 2), 10, 26);
      songNuoc(v, r, 118, ['cham-toi', 'cham', 'nuoc', 'nuoc-sang']);
      for (let x = 0; x < 320; x += 24) v.poly([[x, 120], [x + 12, 108], [x + 20, 112], [x + 24, 120]], 'nuoc'), v.line(x + 12, 108, x + 20, 112, 'troi');
      nhanVat(v, 'boss', 'thuytinh', 210, 150, 2, 'walk', 0, true); mua(v, r, 160);
    }
  } else if (ch === 'giong') {
    day(v, r, 118, 30, ngay ? 'cham-sang' : 'son-toi', ngay ? 'nuoc-sang' : null);
    for (let j = 0; j < 3; j++) { const y = 118 + j * 8; v.rect(0, y, 320, 8, ngay ? (j % 2 ? 'vang-nghe' : 'la-ma') : (j % 2 ? 'dat-toi' : 'toi')); v.hl(0, 319, y, ngay ? 'dat-sang' : 'dat'); }
    dat(v, 142, ngay ? ['la', 'la-ma', 'la-sang'] : ['vien', 'toi', 'dat-toi'], r);
    for (const x of [16, 40, 262, 290]) { for (let k = 0; k < 5; k++) v.vl(x + k * 3, 96 + (k % 3) * 4, 142, ngay ? 'reu' : 'vien'); }   // lũy tre
    if (ngay) nhanVat(v, 'tuong', 'giong', 160, 150, 3, 'idle');
    else { for (const [x, h] of [[60, 34], [96, 26], [228, 30], [262, 38]]) { v.rect(x - 12, 128, 24, 14, 'vien'); v.poly([[x - 16, 130], [x, 116], [x + 16, 130]], 'khoi'); lua(v, x, 130, h); } nhanVat(v, 'boss', 'anvuong', 160, 150, 2, 'walk', 0, true); }
  } else if (ch === 'thachsanh') {
    for (let i = 0; i < 14; i++) { const x = (i * 23 + r() * 10) % 320, w = 6 + r() * 5; if (x > 110 && x < 210) continue; v.rect(Math.round(x), 40, Math.round(w), 110, ngay ? 'dat' : 'vien'); v.vl(Math.round(x), 40, 149, ngay ? 'dat-sang' : 'khoi'); }
    for (let i = 0; i < 26; i++) { const x = r() * 320; if (x > 120 && x < 200) continue; v.ell(x, 20 + r() * 40, 18 + r() * 10, 10 + r() * 6, ngay ? (i % 2 ? 'la' : 'la-toi') : (i % 2 ? 'la-toi' : 'vien')); }
    dat(v, 148, ngay ? ['la-toi', 'la', 'la-ma'] : ['vien', 'la-toi', 'khoi'], r);
    if (ngay) nhanVat(v, 'tuong', 'thachsanh', 160, 156, 3, 'idle');
    else { v.rect(0, 136, 320, 12, 'sat-toi'); v.hl(0, 319, 136, 'sat'); nhanVat(v, 'boss', 'chantinh', 160, 156, 2, 'walk', 0, true); for (const [x, y] of [[40, 130], [270, 126], [70, 100], [250, 96]]) { v.p(x, y, 'lua-sang'); v.p(x + 4, y, 'lua-sang'); } }
  } else if (ch === 'llq') {
    songNuoc(v, r, 104, ngay ? ['cham', 'nuoc', 'nuoc-sang', 'troi'] : ['cham-toi', 'cham', 'cham-sang', 'nuoc']);
    if (!ngay) for (let x = -10; x < 320; x += 40) { v.poly([[x, 140], [x + 18, 96], [x + 30, 104], [x + 40, 140]], 'cham'); v.line(x + 18, 96, x + 30, 104, 'troi'); v.p(x + 18, 95, 'sang'); }
    v.poly([[110, 180], [124, 150], [150, 142], [178, 146], [204, 158], [214, 180]], ngay ? 'sat' : 'sat-toi'); v.line(124, 150, 150, 142, ngay ? 'sat-sang' : 'sat');
    if (ngay) nhanVat(v, 'tuong', 'llq', 162, 150, 3, 'idle');
    else { nhanVat(v, 'boss', 'ngutinh', 162, 150, 2, 'walk', 0, true); mua(v, r, 120); v.put(new Ve(18, 6).stamp(['..dddddddd', 'ddDDDDDDDDdd', '.dddddddddd.'], { d: 'dat-toi', D: 'dat' }), 40, 130); }
  } else if (ch === 'adv') {
    day(v, r, 104, 20, ngay ? 'cham-sang' : 'son-toi', null);
    for (const [y, c, cs] of [[104, 'dat', 'dat-sang'], [118, 'dat-sang', 'cat'], [132, 'dat', 'dat-sang']]) { v.rect(0, y, 320, 14, ngay ? c : 'dat-toi'); v.hl(0, 319, y, ngay ? 'reu' : 'toi'); v.hl(0, 319, y + 1, ngay ? cs : 'dat'); for (let x = 0; x < 320; x += 4) v.vl(x, y - 4, y - 1, ngay ? 'dat-toi' : 'vien'); }
    dat(v, 146, ngay ? ['dat', 'dat-sang', 'cat'] : ['vien', 'toi', 'dat-toi'], r);
    if (ngay) nhanVat(v, 'tuong', 'adv', 160, 154, 3, 'idle');
    else { for (const [x, h] of [[40, 30], [84, 22], [240, 26], [284, 34]]) lua(v, x, 118, h); nhanVat(v, 'boss', 'trieuda', 160, 154, 2, 'walk', 0, true); }
  }
  return v;
}
// ---------------------------------------------------------------- tranh truyện Sơn Tinh – Thủy Tinh (3 cảnh)
function truyenSonTinh(n) {
  const v = new Ve(320, 180), r = rng(40 + n), T = require('./tranh').DS;
  const thu = (ma, x, y) => { const t = T[ma][0](); const m = new Ve(48, 48); for (let j = 0; j < 48; j++) for (let i = 0; i < 48; i++) m.g[j][i] = t.g[j * 2][i * 2]; v.put(m, x, y); };
  if (n === 1) {   // hai chàng đến kén rể trước cổng Phong Châu
    troi(v, ['nuoc', 'nuoc-sang', 'troi', 'sang'], [24, 54, 86]); may(v, 30, 34, 40); may(v, 236, 28, 44);
    day(v, r, 110, 26, 'cham-sang', 'nuoc-sang');
    v.put(phong(require('./cong').DS['cong-phong-chau'][0](), 2), 96, 14);
    dat(v, 140, ['dat', 'dat-sang', 'cat'], r);
    nhanVat(v, 'tuong', 'tanvien', 64, 150, 2, 'idle'); nhanVat(v, 'boss', 'thuytinh', 262, 152, 1, 'walk', 0, true);
    for (const x of [96, 224]) { v.vl(x, 96, 140, 'dat'); v.rect(x + 1, 96, 8, 6, 'son'); }
  } else if (n === 2) {   // sính lễ: Sơn Tinh đến trước với voi chín ngà, gà chín cựa, ngựa chín hồng mao
    troi(v, ['lua-sang', 'vang-sang', 'sang', 'vang-sang'], [30, 64, 96]); tia(v, 160, 60, 30, 120, 12, 'sang'); trong(v, 160, 54, 20);
    day(v, r, 112, 28, 'cham-sang', 'nuoc-sang'); day(v, r, 124, 14, 'la', 'la-ma');
    dat(v, 136, ['la', 'la-ma', 'la-sang'], r);
    thu('tranh-qua-voi', 6, 100); thu('tranh-qua-ga', 112, 104); thu('tranh-qua-ngua', 214, 100);
    nhanVat(v, 'tuong', 'tanvien', 280, 152, 2, 'idle', 0, true);
  } else {   // giao chiến: Sơn Tinh dời núi, Thủy Tinh dâng nước, mưa sét
    troi(v, ['vien', 'cham-toi', 'cham', 'cham-sang'], [30, 70, 100]);
    for (let i = 0; i < 7; i++) v.ell(170 + r() * 160, 10 + r() * 30, 30 + r() * 20, 8 + r() * 5, i % 2 ? 'khoi' : 'toi');
    v.line(250, 0, 240, 30, 'vang-sang'); v.line(240, 30, 252, 44, 'vang-sang'); v.line(252, 44, 244, 70, 'sang');
    v.poly([[0, 180], [0, 100], [30, 82], [58, 94], [86, 70], [120, 100], [156, 114], [156, 180]], 'reu'); v.poly([[86, 70], [120, 100], [156, 114], [156, 180], [96, 180]], 'reu-toi');
    v.line(0, 100, 30, 82, 'reu-sang'); v.line(58, 94, 86, 70, 'reu-sang');
    v.ell(86, 74, 12, 4, 'reu-sang'); v.ell(86, 76, 11, 4, 'reu'); nhanVat(v, 'tuong', 'tanvien', 86, 74, 2, 'cast', 1);
    songNuoc(v, r, 112, ['cham-toi', 'cham', 'nuoc', 'nuoc-sang']);
    for (let x = 150; x < 320; x += 26) { v.poly([[x, 114], [x + 12, 98], [x + 20, 104], [x + 26, 114]], 'nuoc'); v.line(x + 12, 98, x + 20, 104, 'troi'); }
    nhanVat(v, 'boss', 'thuytinh', 246, 150, 2, 'attack', 1, true);
    mua(v, r, 140);
  }
  return v;
}
const TRUYEN = ['Sơn Tinh (trái) và Thủy Tinh (phải) đến cầu hôn trước thành Phong Châu (nhà cổng mái thuyền), cờ son',
  'Bình minh, trống đồng mặt trời: Sơn Tinh đến trước với voi chín ngà, gà chín cựa, ngựa chín hồng mao',
  'Giao chiến: Sơn Tinh trên núi rêu tung phép dời núi; Thủy Tinh cưỡi sóng dâng nước, mây đen, mưa, sét'];
const KQ = { sontinh: ['Tản Viên ba đỉnh, nước rút, Sơn Tinh đứng giữa dưới mặt trống đồng mặt trời', 'thành Phong Châu chìm lũ, mưa xiên, sóng nhọn, Thủy Tinh cưỡi sóng'],
  giong: ['đồng lúa + lũy tre bình minh, Thánh Gióng đứng giữa', 'làng Phù Đổng cháy (lửa 3 tông), trời đỏ khói, Ân Vương giữa'],
  thachsanh: ['rừng sáng có khoảng trống, Thạch Sanh đứng giữa', 'rừng đen sương mù dải, Chằn Tinh giữa'],
  llq: ['biển lặng, đá ngầm, Lạc Long Quân đứng giữa', 'biển bão sóng nhọn, mưa, thuyền vỡ, Ngư tinh giữa'],
  adv: ['3 lớp lũy Cổ Loa bình minh, An Dương Vương giữa', 'Cổ Loa cháy, trời đỏ, Triệu Đà giữa'] };

const DS = {};
const NEN = { bien: 'biển trưa: đảo xa, sóng, bãi cát, dừa', dam: 'đầm sen: đồi xa, mặt nước có lá + hoa sen, lau sậy tiền cảnh',
  dem: 'đêm làng: trời chàm, trăng khuyết, sao, nhà sàn đèn vàng, lũy tre đen', dong: 'đồng lúa: núi xa, ruộng bậc xanh / vàng, đường đất',
  hang: 'trong hang: nhũ đá rủ, cửa hang sáng xa, măng đá, tinh thể tím', nui: 'núi non: 3 lớp núi, mây, trời tím chiều',
  rung: 'rừng sâu: thân cây, tán lá dày, bụi', thanh: 'Cổ Loa: trời chiều, 3 lớp lũy đất rào cọc, vọng lâu mái son cờ vàng' };
for (const [k, mo] of Object.entries(NEN)) DS['truyen-nen-' + k] = [() => nen(k), 'Phông truyện ' + k, 'Phông truyện ' + mo];
for (const [k, [mt, mb]] of Object.entries(KQ)) {
  DS['thang-' + k] = [() => canhKetQua(k, true), 'Thắng · ' + k, 'Cảnh thắng: ' + mt];
  DS['thua-' + k] = [() => canhKetQua(k, false), 'Thua · ' + k, 'Cảnh thua: ' + mb];
}
TRUYEN.forEach((mo, i) => { DS['truyen-sontinh-' + (i + 1)] = [() => truyenSonTinh(i + 1), 'Truyện Sơn Tinh ' + (i + 1), 'Tranh truyện: ' + mo]; });
DS['nen-man-phu'] = [() => {   // nền màn phụ: đen nâu + hoạ tiết trống đồng chìm (designer N7: bớt rối sau bảng)
  const v = new Ve(320, 180); v.rect(0, 0, 320, 180, 'vien');
  const tr = (cx, cy, R) => {
    for (const k of [1, 0.78, 0.5, 0.3]) v.ring(cx, cy, R * k, R * k, 'dong-toi');
    for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; v.line(cx, cy, cx + Math.cos(a) * R * 0.28, cy + Math.sin(a) * R * 0.28, 'dong-toi'); }
    for (let i = 0; i < 36; i++) { const a = (i * Math.PI) / 18; v.p(cx + Math.cos(a) * R * 0.89, cy + Math.sin(a) * R * 0.89, 'khoi'); }
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 + 0.3; v.stamp(['.kk..', 'kkkkk', '..k..'], { k: 'khoi' }, Math.round(cx + Math.cos(a) * R * 0.64) - 2, Math.round(cy + Math.sin(a) * R * 0.64) - 1); }
  };
  tr(160, 90, 76); tr(16, 10, 46); tr(304, 170, 46); tr(300, 6, 30); tr(10, 172, 30);
  return v;
}, 'Nền màn phụ', 'Nền màn phụ: đen nâu + mặt trống đồng chìm (vòng, sao, chấm, chim Lạc) tông toi / khói'];
DS['nen-thang'] = [() => canhKetQua('sontinh', true), 'Thắng (Sơn Tinh)', 'Cảnh thắng chung = thang-sontinh: ' + KQ.sontinh[0]];
DS['nen-thua'] = [() => canhKetQua('sontinh', false), 'Thua (Sơn Tinh)', 'Cảnh thua chung = thua-sontinh: ' + KQ.sontinh[1]];
module.exports = { DS, troi, day, may, matTroi, trong, tia, dat, nhanVat, songNuoc, lua, mua, nen };
if (require.main === module) {
  const a = process.argv.slice(2), xi = a.indexOf('--xem'), xem = xi >= 0 && a[xi + 1], chon = a.filter((s, i) => !s.startsWith('--') && i !== xi + 1);
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    if (chon.length && !chon.includes(ma)) continue;
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 2); }
    else console.log(ghi('canh', ma, ten, mo, v, { script: 'tranh-ngang' }).f);
  }
}
