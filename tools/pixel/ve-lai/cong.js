// Cổng thành 5 kiểu (nen/cong-*, 64×64) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 1.
// Game vẽ ảnh vuông 124×124 (toạ độ thiết kế) ở cuối đường, đáy ảnh = cuối đường + 38% → cửa đặt ở giữa-dưới.
// Chạy: node tools/pixel/ve-lai/cong.js [--xem DIR]   (ghi tools/pixel/src/nen/cong-*.txt)
const { Ve, ghi, png } = require('./ve');

// mái ngói cong (đầu đao vểnh): bờ nóc y0 từ x1..x2, diềm mái y1 từ e1..e2; hai đầu diềm cong vểnh lên dy điểm
function mai(v, x1, x2, y0, e1, e2, y1, ngoi = ['son-toi', 'son', 'son-sang'], dy = 3) {
  const c = (e1 + e2) / 2, hw = (e2 - e1) / 2, L = Math.min(7, hw * 0.5);
  const lift = (x) => { const d = Math.max(0, Math.abs(x - c) - (hw - L)); return Math.round((d / L) ** 2 * dy); };
  for (let x = e1; x <= e2; x++) {
    const top = x < x1 ? y0 + Math.round(((x1 - x) / (x1 - e1)) * (y1 - y0 - 1)) : x > x2 ? y0 + Math.round(((x - x2) / (e2 - x2)) * (y1 - y0 - 1)) : y0;
    const yb = y1 - lift(x), yt = Math.min(top - lift(x), yb);
    v.vl(x, yt, yb, ngoi[1]);
    for (let y = yt + 2; y < yb; y++) if ((x - e1) % 3 === 2) v.p(x, y, ngoi[0]);   // rãnh ngói
    v.p(x, yt, ngoi[2]);
    v.p(x, yb, 'toi'); v.p(x, yb - 1, ngoi[0]);   // diềm mái
  }
  // bờ nóc đậm + đầu kìm cong hai đầu
  v.hl(x1 - 1, x2 + 1, y0 - 1, 'dong-toi'); v.hl(x1, x2, y0 - 2, 'dong'); v.p(x1 - 2, y0 - 2, 'dong-toi'); v.p(x2 + 2, y0 - 2, 'dong-toi');
  v.p(x1 - 2, y0 - 3, 'dong-sang'); v.p(x2 + 2, y0 - 3, 'dong-sang');
  // mũi đầu đao: móc cong sáng
  v.p(e1, y1 - dy - 1, ngoi[2]); v.p(e2, y1 - dy - 1, ngoi[2]); v.p(e1 - 1, y1 - dy - 2, 'dong-sang'); v.p(e2 + 1, y1 - dy - 2, 'dong-sang');
}
// khóm tre: các thân dọc + lá nhọn
function tre(v, x, y0, y1, flip = false) {
  const s = flip ? -1 : 1;
  for (const [dx, top] of [[0, 0], [3, 5], [-2, 9], [5, 12]]) { v.vl(x + dx * s, y0 + top, y1, 'reu'); v.vl(x + dx * s + 1, y0 + top, y1, 'la-toi'); for (let y = y0 + top + 3; y < y1; y += 5) v.p(x + dx * s, y, 'reu-toi'); }
  const la = (cx, cy) => { v.line(cx, cy, cx - 3, cy + 2, 'la'); v.line(cx, cy, cx + 3, cy + 2, 'la-ma'); v.p(cx, cy - 1, 'la-sang'); };
  for (const [dx, dy] of [[0, 0], [2, 4], [-2, 7], [4, 9], [-1, 12], [5, 15], [1, 18]]) la(x + dx * s, y0 + dy);
}

// ---------------------------------------------------------------- cổng làng (village)
function congLang() {
  const v = new Ve(64, 64);
  tre(v, 3, 24, 52); tre(v, 59, 24, 52, true);
  // hai tường cánh thấp
  for (const [a, b] of [[6, 16], [47, 57]]) {
    v.rect(a, 38, b - a + 1, 20, 'trang-xam'); v.shade('trang-xam', 'trang', 'sat-sang');
    v.rect(a - 1, 35, b - a + 3, 3, 'son'); v.hl(a - 1, b + 1, 35, 'son-sang'); v.hl(a - 1, b + 1, 38, 'toi');
    v.rect(a + 3, 43, b - a - 5, 5, 'sat-sang'); for (let x = a + 4; x < b - 2; x += 2) v.vl(x, 44, 46, 'toi');   // ô thoáng con tiện
  }
  // mái chồng hai tầng (vẽ trước, trụ biểu đứng trước mái)
  mai(v, 27, 36, 6, 15, 48, 14, ['son-toi', 'son', 'son-sang'], 3);
  v.rect(22, 15, 20, 3, 'trang-xam'); v.hl(22, 41, 15, 'toi');   // cổ diêm giữa hai tầng
  v.hl(24, 39, 16, 'sat-sang'); for (let x = 24; x < 40; x += 3) v.p(x, 16, 'toi');
  mai(v, 22, 41, 18, 3, 60, 28, ['son-toi', 'son', 'son-sang'], 5);
  v.p(31, 1, 'vang-nghe'); v.p(32, 1, 'vang-nghe'); v.rect(31, 2, 2, 2, 'dong');           // hồ lô nóc
  // thân cổng
  v.rect(17, 29, 30, 29, 'trang'); v.shade('trang', 'sang', 'trang-xam');
  // hai trụ biểu
  for (const x of [12, 46]) {
    v.rect(x, 25, 6, 33, 'trang-xam'); v.vl(x, 25, 57, 'trang'); v.vl(x + 5, 25, 57, 'sat-sang');
    v.rect(x - 1, 22, 8, 3, 'son'); v.hl(x - 1, x + 6, 22, 'son-sang'); v.hl(x - 1, x + 6, 25, 'toi');   // đấu trụ
    v.rect(x + 1, 18, 4, 4, 'dong'); v.vl(x + 1, 18, 21, 'dong-sang'); v.vl(x + 4, 18, 21, 'dong-toi'); v.p(x + 2, 17, 'vang-nghe'); v.p(x + 3, 17, 'dong-sang');   // búp sen đầu trụ
    v.hl(x, x + 5, 34, 'sat-sang'); v.hl(x, x + 5, 50, 'sat-sang');
  }
  // vòm cuốn
  v.rect(25, 40, 14, 18, 'vien'); v.ell(31.5, 40, 7, 6, 'vien');
  v.ring(31.5, 40, 7, 6, 'sat-sang'); v.rect(24, 40, 1, 18, 'sat-sang'); v.rect(39, 40, 1, 18, 'trang-xam');
  v.rect(25, 40, 14, 18, 'toi'); v.ell(31.5, 40, 6, 5, 'toi');
  v.rect(25, 53, 14, 1, 'khoi');
  // cánh cửa gỗ son mở hé
  v.rect(26, 45, 3, 13, 'son-toi'); v.vl(26, 45, 57, 'son'); v.rect(35, 45, 3, 13, 'son-toi'); v.vl(37, 45, 57, 'son');
  // biển chữ
  v.rect(23, 29, 18, 6, 'son-toi'); v.hl(23, 40, 29, 'son'); v.rect(22, 28, 20, 1, 'dong'); v.rect(22, 35, 20, 1, 'dong-toi');
  // ba chữ Hán cách điệu (khối 3×3)
  for (const [x, m] of [[25, ['ttt', '.t.', 'ttt']], [30, ['t.t', 'ttt', 't.t']], [35, ['tt.', '.tt', 'ttt']]]) v.stamp(m, { t: 'vang-nghe' }, x + 1, 31);
  // thềm bậc
  v.rect(20, 58, 24, 2, 'sat'); v.hl(20, 43, 58, 'sat-sang'); v.rect(22, 60, 20, 1, 'sat-toi');
  v.outline();
  return v;
}

// hàng cọc nhọn (rào tre / gỗ) từ x1..x2, chân y, cao h
function rao(v, x1, x2, y, h, mau = ['dat-toi', 'dat', 'dat-sang']) {
  for (let x = x1; x <= x2; x += 3) {
    const hh = h + ((x * 7) % 3) - 1;
    v.vl(x, y - hh + 1, y, mau[1]); v.vl(x + 1, y - hh + 1, y, mau[0]); v.p(x, y - hh, mau[2]);
  }
  v.hl(x1, x2 + 1, y - Math.round(h / 2), 'dat-toi');   // nẹp ngang
}
// cờ đuôi nheo trên cán
function co(v, x, y0, y1, mau = 'son', flip = false) {
  v.vl(x, y0, y1, 'dat'); v.p(x, y0 - 1, 'vang-nghe');
  const s = flip ? -1 : 1;
  for (let j = 0; j < 6; j++) { const w = 7 - Math.abs(j - 2); for (let i = 1; i <= w; i++) v.p(x + i * s, y0 + j, j === 0 ? mau + '-sang' : mau); }
  v.p(x + 7 * s, y0 + 3, mau + '-toi');
}
// tán cây tròn đổ bóng 3 tông
function tan(v, cx, cy, r) {
  for (const [dx, dy, k] of [[0, 0, 1], [-r * 0.6, r * 0.3, 0.75], [r * 0.6, r * 0.3, 0.75], [0, -r * 0.5, 0.7]]) v.ell(cx + dx, cy + dy, r * k, r * k * 0.85, 'la');
  v.shade('la', 'la-ma', 'la-toi', 2, 1);
  for (const [dx, dy] of [[-r * 0.4, -r * 0.3], [r * 0.1, -r * 0.7], [-r * 0.9, r * 0.1]]) { v.p(cx + dx, cy + dy, 'la-sang'); v.p(cx + dx + 1, cy + dy, 'la-sang'); }
}
// trống đồng (mặt trời nhiều tia + vành chấm) tâm cx, cy, bán kính r
function matTrong(v, cx, cy, r) {
  v.ell(cx, cy, r, r, 'dong'); v.ring(cx, cy, r, r, 'dong-toi'); v.ring(cx, cy, r - 2, r - 2, 'dong-sang');
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; v.p(cx + Math.cos(a) * (r * 0.45), cy + Math.sin(a) * (r * 0.45), 'vang-nghe'); }
  v.p(cx, cy, 'vang-sang'); v.p(cx - 1, cy, 'vang-nghe'); v.p(cx + 1, cy, 'vang-nghe'); v.p(cx, cy - 1, 'vang-nghe'); v.p(cx, cy + 1, 'vang-nghe');
}

// ---------------------------------------------------------------- thành Phong Châu (castle) — nhà mái thuyền Đông Sơn
function congPhongChau() {
  const v = new Ve(64, 64);
  co(v, 3, 22, 44, 'son'); co(v, 60, 22, 44, 'son', true);
  // tường thành đất đắp
  v.poly([[0, 40], [63, 40], [63, 59], [0, 59]], 'dat-sang'); v.shade('dat-sang', 'cat', 'dat', 1, 1);
  for (let x = 2; x < 62; x += 6) for (let y = 44; y < 58; y += 5) v.hl(x + ((y / 5) % 2) * 3, x + ((y / 5) % 2) * 3 + 3, y, 'dat');   // lớp đất nện
  rao(v, 0, 62, 39, 7);
  // nhà cổng gỗ trên sàn
  v.rect(18, 22, 28, 37, 'dat'); v.shade('dat', 'dat-sang', 'dat-toi');
  for (const x of [18, 45]) v.vl(x, 22, 58, 'dat-toi');
  for (const x of [21, 42]) { v.vl(x, 24, 58, 'son-toi'); v.vl(x + 1, 24, 58, 'son'); }   // cột son
  v.rect(17, 34, 30, 2, 'son-toi'); v.hl(17, 46, 34, 'son-sang');   // xà ngang
  // lan can sàn
  v.rect(16, 30, 32, 1, 'dat-toi'); for (let x = 17; x < 47; x += 2) v.vl(x, 31, 33, 'dat-sang');
  // cửa gỗ hai cánh + đinh đồng
  v.rect(25, 40, 14, 18, 'vien'); v.rect(26, 41, 12, 17, 'son'); v.vl(31, 41, 57, 'son-toi'); v.vl(32, 41, 57, 'son-toi');
  v.vl(26, 41, 57, 'son-sang'); v.hl(26, 37, 41, 'son-sang');
  for (const y of [44, 49, 54]) for (const x of [28, 30, 34, 36]) v.p(x, y, 'vang-nghe');
  matTrong(v, 31.5, 26.5, 4);
  // mái thuyền: nóc võng, hai đầu vểnh như mũi thuyền
  const nocY = (x) => 10 - Math.round(((x - 31.5) / 21) ** 2 * 7);   // nóc võng: giữa 10, hai đầu 3
  for (let x = 11; x <= 52; x++) {
    const t = nocY(x), b = 21 - (Math.abs(x - 31.5) > 18 ? 1 : 0);
    v.vl(x, t, b, 'cat');
    for (let y = t + 3; y < b; y += 3) if ((x + y) % 4) v.p(x, y, 'dat-sang');   // lớp rơm
    v.p(x, t, 'dong-toi'); v.p(x, t + 1, 'vang-sang'); v.p(x, b, 'dat-toi'); v.p(x, b - 1, 'dat');
  }
  // đầu đao mũi thuyền + chim Lạc trên nóc
  v.line(8, 0, 11, 3, 'dong-toi'); v.line(55, 0, 52, 3, 'dong-toi'); v.p(8, 0, 'vang-nghe'); v.p(55, 0, 'vang-nghe'); v.p(9, 0, 'dong-sang'); v.p(54, 0, 'dong-sang');
  v.stamp(['.kk...', 'kkkkkk', '..kk..', '...k..'], { k: 'dong-toi' }, 29, 6);
  v.rect(14, 59, 36, 2, 'dat-toi'); v.hl(14, 49, 59, 'dat');
  v.outline();
  return v;
}

// ---------------------------------------------------------------- miệng hang (cave)
function congHang() {
  const v = new Ve(64, 64);
  // khối đá: các mảng phẳng nhiều tông (sáng trên-trái)
  v.poly([[2, 60], [4, 34], [10, 20], [20, 10], [33, 6], [46, 10], [56, 22], [61, 38], [62, 60]], 'sat');
  const M = v.clone();
  v.poly([[10, 20], [20, 10], [33, 6], [30, 16], [18, 24]], 'sat-sang');
  v.poly([[4, 34], [10, 20], [18, 24], [12, 38]], 'sat-sang');
  v.poly([[46, 10], [56, 22], [61, 38], [52, 30], [44, 18]], 'sat-toi');
  v.poly([[52, 30], [61, 38], [62, 60], [54, 60]], 'sat-toi');
  v.line(18, 24, 30, 16, 'sat-toi'); v.line(12, 38, 18, 24, 'sat-toi'); v.line(44, 18, 52, 30, 'sat-toi'); v.line(33, 6, 30, 16, 'sat-toi');
  for (const [x, y] of [[24, 13], [39, 11], [8, 44], [56, 46], [14, 52]]) { v.p(x, y, 'bac'); v.p(x + 1, y, 'sat-sang'); }
  // rêu phủ đỉnh
  for (let x = 14; x < 50; x++) { const y = Math.round(9 + Math.abs(x - 33) * 0.55); if (M.get(x, y)) { v.p(x, y, 'reu'); if (x % 3) v.p(x, y + 1, 'reu-toi'); if (x % 4 === 0) v.p(x, y - 1 + (M.get(x, y - 1) ? 0 : 1), 'reu-sang'); } }
  // miệng hang
  v.ell(32, 40, 15, 13, 'vien'); v.rect(17, 40, 31, 21, 'vien');
  v.ell(32, 41, 12, 11, 'khoi'); v.rect(20, 41, 25, 20, 'khoi'); v.ell(32, 44, 8, 8, 'vien'); v.rect(24, 44, 17, 17, 'vien');
  // nhũ đá răng nanh
  for (const [x, l] of [[21, 4], [25, 6], [29, 3], [34, 5], [38, 3], [42, 5]]) for (let k = 0; k < l; k++) { const y = 30 + Math.round(Math.abs(x - 32) * 0.35) + k; v.p(x, y, k === 0 ? 'sat-sang' : 'sat'); if (k < l - 2) v.p(x + 1, y, 'sat-toi'); }
  for (const [x, l] of [[23, 3], [41, 4]]) for (let k = 0; k < l; k++) v.p(x, 60 - k, k === l - 1 ? 'sat-sang' : 'sat');
  // đuốc hai bên
  for (const x of [13, 50]) { v.vl(x, 40, 50, 'dat'); v.vl(x + 1, 40, 50, 'dat-toi'); v.rect(x - 1, 39, 4, 2, 'dong-toi'); v.stamp(['.l.', 'lLl', 'lYl', '.L.'], { l: 'lua', L: 'lua-sang', Y: 'vang-sang' }, x - 1, 35); }
  v.outline();
  return v;
}

// ---------------------------------------------------------------- bản rừng (hut) — cổng gỗ treo sừng trâu, rào cọc, cây đa
function congBanRung() {
  const v = new Ve(64, 64);
  tan(v, 10, 18, 11); tan(v, 54, 16, 12);
  for (const x of [9, 53]) { v.rect(x - 1, 26, 4, 30, 'dat'); v.vl(x - 1, 26, 55, 'dat-sang'); v.vl(x + 2, 26, 55, 'dat-toi'); }
  rao(v, 0, 18, 56, 14); rao(v, 45, 62, 56, 14);
  // hai cột cổng gỗ lớn
  for (const x of [18, 42]) { v.rect(x, 18, 5, 41, 'dat'); v.vl(x, 18, 58, 'dat-sang'); v.vl(x + 4, 18, 58, 'dat-toi'); for (const y of [26, 40, 52]) v.hl(x, x + 4, y, 'dat-toi'); v.rect(x - 1, 46, 7, 2, 'son'); }
  // xà ngang + mái lá nhỏ
  v.rect(14, 18, 36, 3, 'dat-sang'); v.hl(14, 49, 18, 'cat'); v.hl(14, 49, 20, 'dat-toi');
  v.poly([[16, 17], [48, 17], [44, 9], [20, 9]], 'cat'); for (let x = 18; x < 47; x += 2) v.line(x, 10, x - 1, 16, 'dat-sang'); v.hl(20, 43, 9, 'vang-sang'); v.hl(15, 48, 17, 'dat');
  // sọ trâu + sừng
  v.stamp([
    'hh..........hh',
    '.hh........hh.',
    '..hHH....HHh..',
    '....tTTTTt....',
    '....tvTTvt....',
    '.....tTTt.....',
    '.....tvvt.....',
    '......tt......',
  ], { h: 'trang-xam', H: 'trang', t: 'trang-xam', T: 'trang', v: 'vien' }, 25, 21);
  // lối vào tối + bóng
  v.rect(23, 30, 19, 29, 'dat-toi'); v.rect(23, 30, 19, 2, 'toi');
  for (let x = 25; x < 41; x += 4) v.vl(x, 34, 58, 'dat');   // cổng chấn song tre
  v.hl(23, 41, 44, 'dat');
  v.outline();
  return v;
}

// ---------------------------------------------------------------- thành Cổ Loa (citadel) — ba vòng thành ốc + vọng lâu
function congCoLoa() {
  const v = new Ve(64, 64);
  co(v, 31, 3, 18, 'son');
  // ba vòng thành đất (sau cao hơn), mặt trên cỏ
  const vong = (y, x1, x2, h) => {
    v.poly([[x1, y + h], [x1 + 3, y], [x2 - 3, y], [x2, y + h]], 'dat-sang');
    v.hl(x1 + 3, x2 - 3, y, 'reu'); v.hl(x1 + 2, x2 - 2, y + 1, 'reu-toi');
    for (let x = x1 + 4; x < x2 - 4; x += 4) v.p(x, y - 1, 'reu-sang');
  };
  vong(22, 2, 61, 12); vong(32, 0, 63, 12); vong(42, 0, 63, 17);
  v.shade('dat-sang', 'cat', 'dat', 1, 0);
  for (const y of [28, 38, 50, 55]) for (let x = 3 + (y % 3); x < 61; x += 7) v.hl(x, x + 2, y, 'dat');
  rao(v, 4, 59, 21, 4, ['dat-toi', 'dat', 'dat-sang']);
  // vọng lâu gỗ trên cổng
  v.rect(21, 22, 22, 12, 'dat'); v.shade('dat', 'dat-sang', 'dat-toi');
  for (let x = 23; x < 42; x += 3) v.vl(x, 26, 32, 'dat-toi');
  mai(v, 26, 37, 15, 17, 46, 21, ['son-toi', 'son', 'son-sang'], 3);
  // cổng chính: cửa vòm trên vòng ngoài
  v.rect(24, 44, 16, 15, 'vien'); v.ell(31.5, 44, 8, 6, 'vien');
  v.rect(25, 45, 14, 14, 'son'); v.ell(31.5, 45, 7, 5, 'son'); v.vl(31, 41, 58, 'son-toi'); v.vl(32, 41, 58, 'son-toi');
  v.vl(25, 45, 58, 'son-sang');
  for (const y of [47, 52, 56]) for (const x of [27, 29, 34, 36]) v.p(x, y, 'vang-nghe');
  // nỏ thần khắc trên cổng
  v.stamp(['d.......d', '.d.....d.', '..ddddd..', '....D....', '....D....'], { d: 'dong-sang', D: 'dong' }, 27, 34);
  v.outline();
  return v;
}

const DS = {
  'cong-lang-tre': [congLang, 'Cổng làng tre', 'Cổng làng: hai trụ biểu búp sen, vòm cuốn, biển chữ son, mái ngói hai tầng đầu đao vểnh, khóm tre hai bên'],
  'cong-phong-chau': [congPhongChau, 'Thành Phong Châu', 'Nhà cổng gỗ mái thuyền Đông Sơn (nóc võng, hai đầu vểnh, chim Lạc), mặt trống đồng trên cửa son đinh đồng, tường đất nện + rào cọc, cờ son'],
  'cong-hang': [congHang, 'Miệng hang đá', 'Khối đá mảng phẳng sáng trên-trái, rêu phủ đỉnh, miệng hang tối có nhũ đá răng nanh, hai đuốc lửa'],
  'cong-ban-rung': [congBanRung, 'Cổng bản rừng', 'Cổng gỗ hai cột, mái lá, sọ trâu sừng cong treo xà, rào cọc nhọn, hai cây đa tán tròn'],
  'cong-co-loa': [congCoLoa, 'Thành Cổ Loa', 'Ba vòng thành đất (thành ốc) cỏ phủ, vọng lâu gỗ mái ngói cong, cửa vòm son, nỏ thần khắc trên cổng, cờ son'],
};
module.exports = { congLang, mai, tre, rao, co, tan, matTrong, DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 8, 'sat-toi'); }
    else console.log(ghi('nen', ma, ten, mo, v, { script: 'cong' }));
  }
}
