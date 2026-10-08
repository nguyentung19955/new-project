// Tranh nhỏ (giao-dien/tranh-*, 96×96) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 3.
// Hiển thị ≈ 100–180 px trong ô "giếng" của bảng Sính lễ / Hũ báu / Kho lúa → vật lớn, khối rõ, nền trong suốt, viền 1px.
// Chạy: node tools/pixel/ve-lai/tranh.js [--xem DIR] [mã…]
const { Ve, ghi, png } = require('./ve');

// đóng dấu lưới xoay quanh tâm (lấy mẫu ngược, không thủng lỗ)
function rotStamp(v, rows, map, cx, cy, ang) {
  const H = rows.length, W = rows[0].length, R = Math.ceil(Math.hypot(W, H) / 2) + 1, c = Math.cos(-ang), s = Math.sin(-ang);
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const u = Math.round(x * c - y * s + (W - 1) / 2), w = Math.round(x * s + y * c + (H - 1) / 2);
    if (u < 0 || w < 0 || u >= W || w >= H) continue;
    const ch = rows[w][u]; if (ch !== '.' && map[ch]) v.p(cx + x, cy + y, map[ch]);
  }
}
const dist = (x, y, cx, cy) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy);

// ---------------------------------------------------------------- mặt trống đồng Đông Sơn
function trongDong() {
  const v = new Ve(96, 96), C = 48;
  for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) {
    const r = dist(x, y, C, C) * (46 / 42), a = Math.atan2(y + 0.5 - C, x + 0.5 - C);
    if (r > 46) continue;
    let c = 'dong';
    if (r > 44) c = 'dong-toi';
    else if (r > 42.6) c = 'dong-sang';
    else if (r > 40 && r <= 42.6) c = (Math.round((a + Math.PI) * 40 / Math.PI) % 2) ? 'dong' : 'dong-toi';    // vành chấm ngoài
    else if (r > 39 && r <= 40) c = 'dong-toi';
    else if (r > 33 && r <= 39) {                                                                                // răng cưa
      const t = ((a + Math.PI) * 36 / Math.PI) % 1, h = 33 + 6 * (t < 0.5 ? t * 2 : 2 - t * 2);
      c = r < h ? 'dong-sang' : 'dong';
    } else if (r > 32 && r <= 33) c = 'dong-toi';
    else if (r > 31 && r <= 32) c = 'dong-sang';
    else if (r > 18 && r <= 19) c = 'dong-toi';
    else if (r > 17 && r <= 18) c = 'dong-sang';
    else if (r > 11 && r <= 17) {                                                                                // vòng tròn tiếp tuyến có chấm
      const k = Math.round((a + Math.PI) * 18 / (2 * Math.PI)), ca = (k * 2 * Math.PI) / 18 - Math.PI, px = C + Math.cos(ca) * 14, py = C + Math.sin(ca) * 14, d = dist(x, y, px, py);
      c = d < 1.2 ? 'vang-nghe' : d < 2.6 ? 'dong' : d < 3.4 ? 'dong-toi' : 'dong';
    } else if (r > 10 && r <= 11) c = 'dong-toi';
    else if (r <= 10) {                                                                                         // ngôi sao 12 cánh
      const t = (((a + Math.PI) * 12) / (2 * Math.PI)) % 1, ray = 2.5 + 7.5 * (1 - Math.abs(t - 0.5) * 2) ** 1.6;
      c = r < 2.5 ? 'vang-sang' : r < ray ? 'vang-nghe' : 'dong-toi';
    }
    v.p(x, y, c);
  }
  // 6 chim Lạc bay ngược chiều kim đồng hồ ở vành giữa (19..31)
  const chim = ['......bb....', '.....bbbb...', 'bbbbbbbbbbbb', '...bbbbbb...', '..bb....bb..', '.b........b.'];
  // vẽ chim cách điệu: thân dài, mỏ nhọn, cánh xoè
  const lac = [
    '..........kk..',
    '.........kkkk.',
    'kkkkkkkkkkkkkk',
    '..kkkkkkkk....',
    '....kkkk......',
    '...kk.kk......',
    '..k....k......',
  ];
  for (let i = 0; i < 6; i++) { const a = (i * Math.PI * 2) / 6 + 0.2; rotStamp(v, lac, { k: 'dong-toi' }, C + Math.cos(a) * 23, C + Math.sin(a) * 23, a + Math.PI / 2); }
  void chim;
  // ánh sáng trên-trái: mặt đồng gốc → đồng sáng ở góc trên-trái, mép dưới-phải tối hơn
  // ánh sáng trên-trái: vầng sáng lệch tâm (lõm sáng ở góc trên-trái), mép dưới-phải tối
  v.swap('dong', 'dong-sang', (x, y) => dist(x, y, C - 27, C - 27) < 31);
  v.swap('dong-sang', 'vang-nghe', (x, y) => dist(x, y, C - 31, C - 31) < 20 && dist(x, y, C, C) > 30);
  v.swap('dong', 'dong-toi', (x, y) => dist(x, y, C + 31, C + 31) < 24 && dist(x, y, C, C) > 35.5);
  // nâng cả mặt trống lên một tông (đồng mới đánh bóng, đọc rõ ở cỡ nhỏ); vành ngoài giữ tối
  const len = { 'vang-nghe': 'vang-sang', 'dong-sang': 'vang-nghe', dong: 'dong-sang', 'dong-toi': 'dong' };
  for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) { const c = v.g[y][x]; if (c && len[c] && dist(x, y, C, C) < 39.7 && dist(x, y, C, C) > 10 && c !== 'vang-sang') v.g[y][x] = len[c]; }
  v.outline();
  return v;
}

// ---------------------------------------------------------------- hũ báu vua Hùng (hũ đồng + nắp + hào quang + vàng)
function huBau() {
  const v = new Ve(96, 96);
  // hào quang: 12 tia hình nêm sạch, xen kẽ vàng nghệ / lửa sáng
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6 + Math.PI / 12, w = k % 2 ? 0.12 : 0.17, r1 = k % 2 ? 29 : 34;
    v.poly([[48, 40], [48 + Math.cos(a - w) * r1, 40 + Math.sin(a - w) * r1], [48 + Math.cos(a + w) * r1, 40 + Math.sin(a + w) * r1]], k % 2 ? 'vang-nghe' : 'lua-sang');
  }
  v.ell(48, 30, 15, 9, 'vang-sang');
  // thân hũ
  const than = new Ve(96, 96);
  than.ell(48, 60, 25, 24, 'dong'); than.rect(36, 30, 25, 8, 'dong'); than.ell(48, 36, 15, 5, 'dong'); than.rect(38, 80, 21, 6, 'dong');
  than.shade('dong', 'dong-sang', 'dong-toi', 3, 2);
  than.swap('dong-sang', 'vang-nghe', (x, y) => x < 36 && y < 56);
  v.put(than);
  // dải hoa văn: răng cưa + vòng chấm
  for (let x = 25; x < 72; x++) { const y = 50; if (than.get(x, y) && than.get(x, y + 6)) { v.p(x, y, 'dong-toi'); v.p(x, y + 6, 'dong-toi'); const t = x % 6, h = t < 3 ? t : 6 - t; for (let j = 0; j <= h; j++) v.p(x, y + 5 - j, 'vang-nghe'); } }
  for (let x = 29; x < 70; x += 6) { v.ring(x, 64, 1.6, 1.6, 'dong-toi'); v.p(x, 64, 'vang-nghe'); }
  v.hl(30, 66, 70, 'dong-toi');
  // cổ + miệng hũ, nắp đặt lệch, ánh vàng tràn ra
  v.rect(35, 26, 27, 4, 'dong-sang'); v.hl(35, 61, 26, 'vang-nghe'); v.hl(35, 61, 29, 'dong-toi');
  v.ell(48, 26, 13, 3, 'vang-sang'); v.ell(48, 26, 10, 2, 'sang');
  v.ell(64, 18, 9, 3, 'dong'); v.hl(57, 72, 17, 'dong-sang'); v.hl(57, 71, 20, 'dong-toi'); v.rect(63, 13, 3, 3, 'dong-sang');
  // đồng vàng rơi quanh chân
  const xu = (x, y) => { v.ell(x, y, 4, 2.5, 'vang-nghe'); v.hl(x - 2, x + 2, y - 1, 'vang-sang'); v.hl(x - 3, x + 3, y + 2, 'dong'); v.p(x, y, 'dong'); };
  xu(20, 84); xu(28, 87); xu(72, 85); xu(80, 82); xu(64, 87);
  // lấp lánh
  for (const [x, y] of [[22, 22], [76, 30], [14, 50]]) { v.vl(x, y - 2, y + 2, 'sang'); v.hl(x - 2, x + 2, y, 'sang'); }
  v.outline();
  return v;
}

// ---------------------------------------------------------------- kho lúa (nhà kho sàn mái thuyền + bó lúa + thúng thóc)
function khoLua() {
  const v = new Ve(96, 96);
  // cột sàn
  for (const x of [26, 40, 56, 70]) { v.rect(x, 58, 3, 24, 'dat'); v.vl(x, 58, 81, 'dat-sang'); v.vl(x + 2, 58, 81, 'dat-toi'); }
  v.rect(18, 56, 60, 3, 'dat-sang'); v.hl(18, 77, 56, 'cat'); v.hl(18, 77, 58, 'dat-toi');
  // thân kho vách tre đan
  v.rect(22, 36, 52, 20, 'cat'); for (let x = 24; x < 74; x += 3) v.vl(x, 37, 54, 'dat-sang'); v.hl(22, 73, 45, 'dat'); v.hl(22, 73, 46, 'vang-sang');
  v.vl(22, 36, 55, 'vang-sang'); v.vl(73, 36, 55, 'dat'); v.hl(22, 73, 55, 'dat');
  v.rect(42, 42, 12, 14, 'dat-toi'); v.rect(43, 43, 10, 13, 'toi'); v.hl(42, 53, 42, 'dat');   // cửa kho
  // mái thuyền: nóc võng, hai đầu vểnh cao
  for (let x = 8; x <= 87; x++) {
    const t = 28 - Math.round(((x - 47.5) / 40) ** 2 * 15), b = 37 + (Math.abs(x - 47.5) > 34 ? -2 : 0);
    v.vl(x, t, b, 'cat'); for (let y = t + 3; y < b; y++) if ((y - t) % 4 === 3) v.p(x, y, 'dat-sang');
    v.p(x, t, 'dong-toi'); v.p(x, t + 1, 'vang-sang'); v.p(x, b, 'dat-toi'); v.p(x, b - 1, 'dat');
  }
  v.line(5, 8, 8, 13, 'dong-toi'); v.line(90, 8, 87, 13, 'dong-toi'); v.p(5, 8, 'vang-nghe'); v.p(90, 8, 'vang-nghe');
  v.stamp(['.kk.....', 'kkkkkkkk', '..kkk...', '...k.k..'], { k: 'dong-toi' }, 44, 24);   // chim Lạc trên nóc
  // bó lúa + thúng thóc phía trước
  const bo = (x, y) => { for (let i = -4; i <= 4; i++) v.line(x, y, x + i * 1.4, y - 14, i % 2 ? 'vang-nghe' : 'cat'); for (let i = -4; i <= 4; i += 2) v.p(x + i * 1.4, y - 15, 'vang-sang'); v.rect(x - 2, y - 6, 5, 2, 'dat'); v.rect(x - 1, y - 4, 3, 5, 'cat'); };
  bo(12, 92); bo(84, 92);
  v.ell(48, 87, 14, 5, 'dat'); v.rect(34, 80, 29, 7, 'dat'); v.ell(48, 80, 14, 4, 'vang-nghe'); v.ell(48, 79, 10, 2, 'vang-sang');
  for (let x = 36; x < 61; x += 3) v.vl(x, 82, 89, 'dat-toi'); v.hl(34, 62, 84, 'dat-sang');
  v.outline();
  return v;
}

// ---------------------------------------------------------------- xoay máy (điện thoại xoay ngang + mũi tên vòng)
function xoay() {
  const v = new Ve(96, 96);
  // mũi tên cung tròn trên + dưới
  for (let a = 0; a < 360; a += 1) {
    const r = a * Math.PI / 180, ok = (a > 200 && a < 330) || (a > 20 && a < 150);
    if (!ok) continue;
    for (const d of [0, 1, 2]) v.p(48 + Math.cos(r) * (40 - d), 48 + Math.sin(r) * (34 - d), d === 0 ? 'dong' : d === 1 ? 'vang-nghe' : 'vang-sang');
  }
  v.stamp(['aaaaaaa', '.aaaaa.', '..aaa..', '...a...'], { a: 'vang-nghe' }, 76, 30);
  v.stamp(['...a...', '..aaa..', '.aaaaa.', 'aaaaaaa'], { a: 'vang-nghe' }, 13, 62);
  // điện thoại nằm ngang: vỏ đồng tối, màn hình cảnh sông
  v.rect(20, 32, 56, 32, 'toi'); v.rect(21, 33, 54, 30, 'sat-toi'); v.hl(21, 74, 33, 'sat'); v.vl(21, 33, 62, 'sat');
  v.rect(25, 36, 46, 24, 'troi');
  v.rect(25, 46, 46, 14, 'la'); v.poly([[25, 46], [35, 39], [43, 46]], 'reu'); v.poly([[38, 46], [50, 37], [62, 46]], 'reu-sang'); v.poly([[56, 46], [64, 41], [71, 46]], 'reu');
  v.poly([[25, 53], [71, 50], [71, 55], [25, 57]], 'nuoc'); v.hl(30, 40, 54, 'nuoc-sang'); v.hl(52, 60, 52, 'nuoc-sang');
  v.rect(58, 47, 3, 3, 'son'); v.p(59, 46, 'son-sang');
  v.rect(72, 46, 2, 4, 'sat-sang');
  v.outline();
  return v;
}

// nét cong dày: đi theo đường bậc hai a→b (điều khiển c), bán kính r0→r1
function net(v, a, c, b, r0, r1, mau) {
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1];
    v.ell(x, y, r0 + (r1 - r0) * t, r0 + (r1 - r0) * t, mau);
  }
}
const bong = (v, cx, cy, rx, ry = 1.6) => { const m = new Ve(v.w, v.h); m.ell(cx, cy, rx, ry, 1); for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (m.g[y][x] && !v.g[y][x]) v.g[y][x] = 'toi'; };

// phóng ×2 (vẽ thú ở 48×48 cho khối gọn, điểm to ngang sprite tướng; file vẫn 96×96)
function x2(v) { const o = new Ve(v.w * 2, v.h * 2); for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.g[y][x] = v.g[y >> 1][x >> 1]; return o; }

// ---------------------------------------------------------------- voi chín ngà (Sơn Tinh dâng)
function voi() {
  const v = new Ve(48, 48), T = 'trang';
  const F = new Ve(48, 48); F.rect(15, 30, 4, 12, T); F.rect(24, 30, 4, 12, T); F.swap(T, 'trang-xam'); F.shade('trang-xam', null, 'sat-sang', 1, 0); v.put(F);
  const B = new Ve(48, 48);
  B.ell(22, 24, 14, 10, T); B.rect(9, 29, 5, 14, T); B.rect(28, 29, 5, 14, T);
  B.ell(35, 19, 8, 8.5, T);
  v.put(B);
  // ngà (sau vòi): 3 ngà cong vểnh — xếp lớp gợi "chín ngà"
  const V = new Ve(48, 48); net(V, [40, 21], [45, 30], [42, 38], 2.6, 1.6, T); net(V, [42, 38], [42, 41], [45, 40], 1.6, 1, T); v.put(V);
  v.shade(T, 'sang', 'trang-xam', 1, 1);
  // ngà: 3 ngà cong vểnh về trước, vắt qua vòi — xếp lớp gợi "chín ngà"
  for (const [dy, m] of [[2, 'trang-xam'], [0, 'vang-sang'], [-2, 'sang']]) { net(v, [36, 26 + dy], [43, 31 + dy], [47, 22 + dy], 0.7, 0.5, m); }
  v.p(47, 20, 'sang'); v.p(47, 22, 'vang-sang');
  for (const x of [9, 28]) { v.hl(x, x + 4, 42, 'trang-xam'); v.p(x + 1, 42, 'sang'); v.p(x + 3, 42, 'sang'); }
  // tai
  v.ell(31, 20, 4.6, 7.2, 'trang-xam'); v.ell(30.5, 19.5, 3.4, 5.8, T); v.ell(30.5, 20.5, 2, 4.2, 'hong');
  v.p(38, 17, 'vien'); v.p(37, 16, 'trang-xam'); v.p(38, 16, 'trang-xam');
  // yên vải son viền vàng
  v.poly([[13, 13], [27, 13], [28.5, 28], [12, 28]], 'son'); v.hl(13, 26, 13, 'son-sang'); v.vl(13, 14, 27, 'son-sang'); v.vl(28, 14, 27, 'son-toi');
  for (let x = 12; x <= 28; x++) { v.p(x, 27, 'vang-nghe'); if (x % 2) v.p(x, 26, 'vang-nghe'); }
  for (const x of [16, 20, 24]) { v.p(x, 19, 'vang-nghe'); v.p(x - 1, 20, 'vang-nghe'); v.p(x + 1, 20, 'vang-nghe'); v.p(x, 21, 'vang-nghe'); v.p(x, 20, 'son-toi'); }
  // mũ trán đồng
  v.rect(33, 10, 6, 2, 'vang-nghe'); v.hl(33, 38, 10, 'vang-sang'); v.p(35, 9, 'son-sang'); v.p(36, 9, 'son');
  // đuôi
  v.line(8, 21, 6, 29, 'trang-xam'); v.rect(5, 29, 2, 2, 'sat-sang');
  v.outline(); bong(v, 24, 44, 19);
  return x2(v);
}

// ---------------------------------------------------------------- gà chín cựa
function ga() {
  const v = new Ve(48, 48);
  // đuôi cong (xanh đen ánh ngọc) sau thân
  net(v, [18, 23], [6, 4], [3, 20], 2, 1, 'la-toi'); net(v, [18, 25], [8, 12], [5, 27], 2, 1, 'cham'); net(v, [19, 27], [11, 20], [9, 33], 1.6, 0.8, 'la-toi');
  net(v, [17, 22], [7, 6], [4, 18], 0.5, 0.4, 'ngoc'); net(v, [18, 25], [9, 15], [6, 25], 0.5, 0.4, 'ngoc-sang');
  // chân vàng + chín cựa trắng (5 chân gần, 4 chân xa)
  for (const [x, n, m, ms] of [[21, 4, 'dong', 'dong-sang'], [27, 5, 'vang-nghe', 'vang-sang']]) {
    v.rect(x, 33, 2, 10, m); v.vl(x, 33, 42, ms); v.hl(x - 2, x + 4, 43, m); v.p(x + 5, 43, m);
    for (let i = 0; i < n; i++) { const y = 34 + i * 2; v.p(x - 1, y, 'trang'); v.p(x - 2, y - 1 + (i % 2), 'sang'); }
  }
  // thân son
  v.ell(24, 27, 10, 8, 'son'); v.shade('son', 'son-sang', 'son-toi', 1, 1);
  // cánh đồng
  v.poly([[15, 24], [24, 23], [27, 27], [22, 31], [15, 30]], 'dong'); v.shade('dong', 'dong-sang', 'dong-toi', 1, 1);
  for (const x of [16, 19, 22]) { v.p(x, 31, 'dong-toi'); v.p(x + 1, 32, 'dong-toi'); }
  // cổ bờm vàng cam
  v.poly([[27, 23], [30, 12], [37, 11], [36, 21], [32, 28]], 'lua');
  for (const y of [14, 17, 20, 23]) v.line(31, y, 35, y + 1, 'lua-sang');
  v.shade('lua', 'vang-nghe', null, 1, 1);
  // đầu + mào răng cưa + mỏ + tích
  v.ell(34.5, 10, 3.6, 3.6, 'son-sang'); v.p(36, 9, 'vien');
  v.stamp(['.m.m.m', 'mmmmmm', 'mmmmm.'], { m: 'son' }, 30, 4); v.p(31, 4, 'son-sang'); v.p(33, 4, 'son-sang');
  v.poly([[38, 9], [42, 10.5], [38, 12]], 'vang-nghe');
  v.ell(36.5, 14, 1.2, 1.8, 'son');
  v.outline(); bong(v, 25, 45, 13);
  return x2(v);
}

// ---------------------------------------------------------------- ngựa chín hồng mao
function ngua() {
  const v = new Ve(48, 48), T = 'cat';
  const F = new Ve(48, 48);
  F.poly([[12, 25], [18, 26], [17, 33], [16, 42], [14, 42], [14, 34]], T); F.rect(29, 28, 3, 15, T);
  F.swap(T, 'dat-sang'); F.shade('dat-sang', null, 'dat', 1, 0); v.put(F);
  const B = new Ve(48, 48);
  B.ell(22, 25, 12, 6.5, T);
  B.poly([[28, 22], [32, 11], [37, 10], [35, 25]], T);           // cổ
  B.poly([[34, 9], [38, 7], [44, 15], [43, 18], [39, 18]], T);   // đầu dài
  B.ell(36, 10, 3, 3, T);
  B.poly([[8, 24], [15, 26], [13, 33], [12, 42], [10, 42], [10, 34]], T);   // chân sau gần (khuỷu gập)
  B.poly([[27, 28], [30, 28], [35, 33], [33, 35]], T); B.poly([[33, 33], [35, 35], [33, 39], [31, 38]], T);   // chân trước giơ gập
  B.shade(T, 'vang-sang', 'dat-sang', 1, 1);
  B.swap(T, 'dat-sang', (x, y) => y >= 29 && x > 12 && x < 30);
  v.put(B);
  for (const [x, y] of [[10, 42], [14, 42], [29, 42]]) v.hl(x, x + 2, y, 'toi'); v.hl(31, 33, 39, 'toi');
  v.hl(14, 30, 31, 'dat-sang');   // bụng tối
  v.p(39, 11, 'vien'); v.p(43, 16, 'dat-toi');
  v.poly([[34, 7], [35, 4], [37, 7]], T); v.p(35, 6, 'dat-sang');
  // chín lọn bờm đỏ bay về sau + đuôi đỏ
  // từng lọn như lưỡi lửa vuốt ngược gió: viền son tối rồi lõi sáng, xếp từ vai lên gáy (lọn trên đè lọn dưới)
  for (let i = 8; i >= 0; i--) {
    const bx = 35.5 - i * 1.05, by = 6.5 + i * 1.75, ex = bx - 9 - (i % 2) * 2, ey = by - 2.5 + (i % 3);
    net(v, [bx, by], [bx - 4, by + 1], [ex, ey], 1.7, 0.6, 'son-toi');
    net(v, [bx, by], [bx - 4, by + 1], [ex, ey], 1.0, 0.3, i % 2 ? 'son-sang' : 'lua');
  }
  net(v, [11, 22], [3, 23], [4, 35], 1.6, 0.8, 'son'); net(v, [11, 22], [5, 22], [6, 33], 0.7, 0.4, 'son-sang');
  // dây cương son + chuông đồng
  v.line(38, 17, 33, 20, 'son-toi'); v.p(33, 21, 'vang-nghe');
  v.outline(); bong(v, 23, 45, 16);
  return x2(v);
}

// CHUẨN KHUNG (góp ý người dùng: "khung không đều"): mọi tranh cùng canvas 96×96, lề trong 4px (nội dung ≤ 88×88),
// cân giữa ngang theo khối hình; vật đứng (thú, hũ, kho) đặt đáy cùng đường chân y = 91; vật tròn / xoay cân giữa dọc.
const LE = 4, CHAN = 91;
function chuan(fn, kieu) {
  return () => {
    const v = fn(); let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
    for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) if (v.g[y][x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    if (w > v.w - LE * 2 || h > v.h - LE * 2) throw new Error(`tranh vượt lề: ${w}×${h}`);
    const o = new Ve(v.w, v.h), dx = Math.round((v.w - w) / 2) - x0, dy = kieu === 'day' ? CHAN - y1 : Math.round((v.h - h) / 2) - y0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.g[y + dy][x + dx] = v.g[y][x];
    return o;
  };
}
const DS = {
  'tranh-trong-dong': [chuan(trongDong, 'giua'), 'Mặt trống đồng', 'Mặt trống đồng Đông Sơn nhìn thẳng: sao 12 cánh, vòng tròn tiếp tuyến có chấm, 6 chim Lạc bay, răng cưa, vành chấm; sáng trên-trái'],
  'tranh-hu-bau': [chuan(huBau, 'day'), 'Hũ báu vua Hùng', 'Hũ đồng bụng tròn khắc răng cưa + vòng chấm, nắp mở lệch, hào quang vàng 12 tia, đồng vàng rơi quanh chân'],
  'tranh-kho-lua': [chuan(khoLua, 'day'), 'Kho lúa', 'Kho sàn mái thuyền Đông Sơn (chim Lạc trên nóc), vách tre đan, thúng thóc vàng, hai bó lúa'],
  'tranh-qua-voi': [chuan(voi, 'day'), 'Voi chín ngà', 'Voi trắng nhìn ngang quay phải, tai lớn lót hồng, vòi cuộn, 5 ngà ngà vểnh xếp lớp (chín ngà), yên vải son viền vàng hoa văn răng cưa + vòng chấm, mũ trán đồng'],
  'tranh-qua-ga': [chuan(ga, 'day'), 'Gà chín cựa', 'Gà trống thân son, bờm cổ vàng cam, mào răng cưa đỏ, đuôi cong xanh đen ánh ngọc, chân vàng có 9 cựa trắng (5 + 4)'],
  'tranh-qua-ngua': [chuan(ngua, 'day'), 'Ngựa chín hồng mao', 'Ngựa lông vàng cát, chân trước giơ gập, 9 lọn bờm đỏ bay về sau + đuôi đỏ, dây cương son chuông đồng'],
  'tranh-xoay': [chuan(xoay, 'giua'), 'Xoay ngang máy', 'Điện thoại nằm ngang (màn cảnh sông núi) giữa hai mũi tên cung tròn vàng đồng'],
};
module.exports = { DS, rotStamp };
if (require.main === module) {
  const a = process.argv.slice(2), xi = a.indexOf('--xem'), xem = xi >= 0 && a[xi + 1], chon = a.filter((s, i) => !s.startsWith('--') && i !== xi + 1);
  for (const [ma, [fn, ten, mo]] of Object.entries(DS)) {
    if (chon.length && !chon.includes(ma)) continue;
    const v = fn();
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 5, 'toi'); }
    else console.log(ghi('giao-dien', ma, ten, mo, v, { script: 'tranh' }));
  }
}
