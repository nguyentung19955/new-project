// Vùng Rừng Già (hệ Độc): tám quái thường và hai tinh anh. Bảng màu lục, nâu, tím độc.
const QR = {};
const R_DO = '#ff5a3c', R_DEN = '#1a1210', R_HEO = ['#24140e', '#4e3018', '#80542c', '#c89460'], R_MAI = ['#2a1a0c', '#6a4a1e', '#b08a3a', '#f4dc94'], R_ONGV = ['#6a3a08', '#c4801a', '#ffc83c', '#fff6b0'];
// đốm bào tử phát sáng (vẽ sau viền)
function R_lap(g, pts, c1, c2) { for (const q of pts) { set(g, q[0], q[1], c1 || '#f4ffb0'); if (q[2]) { set(g, q[0] - 1, q[1], c2 || '#78b818'); set(g, q[0] + 1, q[1], c2 || '#78b818'); set(g, q[0], q[1] - 1, c2 || '#78b818'); set(g, q[0], q[1] + 1, c2 || '#78b818'); } } }
// Heo Rừng Con: đầu chúi, nanh chĩa, bờm dựng, bụi tung sau chân.
QR.heo = function () { const g = S(60, 42);
  line(g, 37, 29, 39, 35, R_HEO[0], 3); line(g, 19, 30, 14, 34, R_HEO[0], 3);
  line(g, 45, 21, 50, 17, R_HEO[1], 1.6); poly(g, [[49, 18], [53, 13], [52, 19]], R_DEN);
  for (let i = 0; i < 9; i++) { const x = 13 + i * 3.6, yb = 18 - Math.sin(i / 8 * Math.PI) * 3 + (i < 2 ? 2 : 0), h = 4 + (i % 2) * 2.5 + (i > 1 && i < 6 ? 1 : 0);
    poly(g, [[x - 2, yb + 2], [x + 2.5, yb - h], [x + 3, yb + 2]], R_DEN); line(g, x + 1.5, yb - h + 2, x + 2.5, yb - h, LUCR[1], 1); }
  ball4(g, 32, 24, 14, 8.6, R_HEO);
  for (let x = 25; x < 44; x++) { const k = Math.sin((x - 25) / 19 * Math.PI); if (x % 6 !== 0) set(g, x, 20 - Math.round(k * 1.6), R_HEO[3]); if (x % 7 !== 3) set(g, x - 1, 24 - Math.round(k * 1.2), '#e8c890'); if (x % 5 !== 1 && x < 42) set(g, x, 28 - Math.round(k * .8), R_HEO[3]); }
  ell(g, 31, 31, 9, 1.6, R_HEO[0]);
  line(g, 43, 29, 46, 35, R_HEO[1], 3.4); line(g, 23, 31, 19, 35, R_HEO[1], 3.4);
  rect(g, 45, 35, 4, 2, R_DEN); rect(g, 17, 35, 4, 2, R_DEN); rect(g, 38, 35, 3, 2, R_DEN); rect(g, 12, 34, 3, 2, R_DEN);
  set(g, 45, 33, R_HEO[3]); set(g, 21, 34, R_HEO[3]);
  poly(g, [[18, 20], [23, 12], [24, 21]], R_HEO[1]); line(g, 21, 19, 23, 14, '#c8707a', 1); set(g, 23, 12, R_DEN);
  ball4(g, 16, 26, 8.6, 7.6, R_HEO);
  ell(g, 8, 30, 5, 3.6, R_HEO[2]); ell(g, 4.5, 30, 2, 3, '#d88a80'); set(g, 4, 29, MAU); set(g, 4, 31, MAU); set(g, 3, 28, '#ffc0b0');
  rect(g, 6, 33, 7, 1, MAU); set(g, 7, 33, TR); set(g, 9, 33, TR); set(g, 11, 33, TR);
  poly(g, [[8, 35], [13, 33.5], [8, 26], [5, 20], [6.5, 27]], TR); line(g, 10, 33, 8, 27, '#b0a488', 1); set(g, 5, 21, '#ffffff'); set(g, 6, 22, '#ffffff');
  poly(g, [[13, 34], [16, 33], [13, 27]], '#e8e0c4');
  mat(g, 15, 24, 2.8, -1, R_DO);
  line(g, 17, 20, 21, 27, '#e8a090', 1); set(g, 18, 24, MAU); set(g, 20, 23, MAU);
  for (const p of [[36, 17], [37, 16], [38, 17], [40, 18]]) set(g, p[0], p[1], LUCR[2]); set(g, 37, 17, LUCR[3]);
  for (const p of [[28, 30], [35, 31], [40, 26], [30, 22], [26, 26]]) set(g, p[0], p[1], R_HEO[0]);
  vien(g);
  for (const r of [[52, 22, 6], [53, 27, 5], [51, 31, 7]]) rect(g, r[0], r[1], r[2], 1, NAUG[3]);
  for (const p of [[50, 35], [52, 34], [54, 36], [9, 36], [27, 36]]) set(g, p[0], p[1], NAUG[2]); set(g, 53, 33, NAUG[3]);
  g.cx = 28; return g; };
// một con ong vò vẽ: bụng cong chĩa ngòi về trước
function R_ongVe(g, cx, cy, c, ngoi) {
  poly(g, [[cx, cy - 2], [cx + 4, cy - 9], [cx + 8, cy - 7], [cx + 4, cy - 2]], '#d8f4ec'); poly(g, [[cx - 1, cy - 2], [cx - 2, cy - 7], [cx + 1.5, cy - 6], [cx + 1.5, cy - 2]], '#9cc8c0'); line(g, cx + 1, cy - 2, cx + 6, cy - 7, '#7aa8a4', 1);
  line(g, cx - 1, cy + 2, cx - 4, cy + 5, R_DEN, 1); line(g, cx + 1, cy + 2, cx - 1, cy + 6, R_DEN, 1);
  ell(g, cx + 5, cy + 2.5, 4.6, 3.3, c[0]); ell(g, cx + 5, cy + 2, 4, 2.6, c[2]); rect(g, cx + 2, cy, 2, 1, c[3]);
  for (const x of [3, 6]) line(g, cx + x, cy - 1, cx + x - 1, cy + 5, R_DEN, 1); set(g, cx + 8, cy + 2, R_DEN);
  poly(g, [[cx + 1, cy + 4], [cx - 5, cy + 8.5], [cx + 3, cy + 6]], c[1]); line(g, cx - 1, cy + 6, cx - 5, cy + 9, ngoi, 1); set(g, cx - 6, cy + 9, '#ffffff');
  ell(g, cx + .5, cy + .5, 2.8, 2.6, R_DEN); set(g, cx, cy - 1, c[1]); set(g, cx + 1, cy - 1, c[1]);
  ell(g, cx - 3, cy + .5, 2.6, 2.6, c[1]); set(g, cx - 4, cy - 1, c[3]);
  rect(g, cx - 5, cy, 2, 2, R_DO); set(g, cx - 5, cy, '#ffffff'); line(g, cx - 6, cy - 2, cx - 2, cy - 1, OL, 1);
  set(g, cx - 5, cy + 3, TR); set(g, cx - 3, cy + 3, TR);
  line(g, cx - 4, cy - 2, cx - 7, cy - 5, R_DEN, 1); line(g, cx - 2, cy - 2, cx - 4, cy - 6, R_DEN, 1); }
QR.ong = function () { const g = S(50, 40);
  R_ongVe(g, 14, 11, R_ONGV, TIMD[2]); R_ongVe(g, 32, 19, [DOCX[0], '#a8901a', '#e8d83c', DOCX[3]], DOCX[2]); R_ongVe(g, 15, 29, [DOCAM[0], '#c45a1a', '#ff9a2a', '#ffe0a0'], TIMD[3]);
  vien(g);
  for (const r of [[25, 8, 4], [27, 11, 3], [43, 16, 4], [44, 20, 3], [26, 27, 4], [27, 31, 3]]) rect(g, r[0], r[1], r[2], 1, '#c8e8e0');
  R_lap(g, [[6, 22, 1], [24, 37], [3, 5]], TIMD[3], TIMD[2]); return g; };
// Bọ Hung Mai Cứng: tấm mai sừng dày chắn phía trước.
QR.boHung = function () { const g = S(58, 42), C = ['#0c2a22', '#1a5a40', '#3a9a5c', '#b4f0b0'];
  line(g, 25, 31, 20, 34, R_DEN, 1.8); line(g, 20, 34, 18, 37, R_DEN, 1.4); line(g, 33, 32, 32, 35, R_DEN, 1.8); line(g, 32, 35, 34, 37, R_DEN, 1.4); line(g, 41, 31, 44, 34, R_DEN, 1.8); line(g, 44, 34, 47, 37, R_DEN, 1.4);
  set(g, 17, 37, NAUG[2]); set(g, 35, 37, NAUG[2]); set(g, 48, 37, NAUG[2]);
  ball4(g, 36, 24, 14, 10, C);
  for (let k = 0; k < 4; k++) for (let t = 0; t < 22; t++) { const a = Math.PI * (1.1 + t / 22 * .85), r = 1 - k * .2; if (t % 5 !== 4) set(g, 37 + Math.cos(a) * 13 * r, 27 + Math.sin(a) * 11.5 * r, k % 2 ? C[3] : C[0]); }
  for (const p of [[30, 18], [36, 16], [42, 19], [45, 24], [33, 23], [40, 25]]) set(g, p[0], p[1], TIMD[2]); set(g, 37, 16, TIMD[3]);
  ell(g, 36, 32, 10, 1.8, R_DEN); for (let x = 28; x < 45; x += 3) set(g, x, 32, NAUG[1]);
  line(g, 41, 14, 41, 12, XUONGT[2], 1.6); ell(g, 41.5, 11.5, 3, 1.8, DOCAM[1]); set(g, 40, 11, '#ffffff'); set(g, 43, 11, '#ffffff'); line(g, 46, 17, 47, 14, XUONGT[2], 1); ell(g, 47.5, 13.5, 2, 1.2, DOCAM[2]);
  for (const p of [[30, 14], [31, 13], [32, 14], [33, 13], [29, 16]]) set(g, p[0], p[1], LUCR[2]); set(g, 31, 14, LUCR[3]);
  ball4(g, 23, 25, 5.5, 5.5, ['#0a0e12', '#1c2228', '#343c44', '#6a7480']);
  mat(g, 23.5, 22.5, 2.6, -1, DOCX[2]); mieng(g, 19, 27, 6, 2);
  poly(g, [[13, 14], [4, 7], [2, 11], [9, 18]], R_MAI[1]); line(g, 4, 8, 11, 14, R_MAI[3], 1); set(g, 3, 8, '#ffffff');
  poly(g, [[16, 12], [16, 7], [19, 12]], R_MAI[1]); set(g, 16, 8, R_MAI[3]);
  ball4(g, 14.5, 24, 6.6, 12, R_MAI);
  poly(g, [[9, 21], [3, 22.5], [9, 24.5]], TR); poly(g, [[10, 15], [5, 15.5], [10, 18.5]], TR); poly(g, [[9.5, 29], [4.5, 31.5], [10, 32.5]], TR);
  line(g, 15, 13, 16, 35, R_MAI[0], 1); line(g, 17, 14, 19, 22, R_MAI[3], 1); line(g, 19, 22, 18, 30, R_MAI[2], 1);
  for (const p of [[12, 15], [12, 20], [12, 27], [13, 33], [18, 15], [19, 32]]) { set(g, p[0], p[1], R_MAI[0]); set(g, p[0], p[1] - 1, R_MAI[3]); }
  line(g, 11, 24, 14, 27, R_DEN, 1); line(g, 14, 27, 12, 30, R_DEN, 1); line(g, 14, 27, 17, 28, R_DEN, 1);
  rect(g, 13, 12, 4, 1, R_MAI[3]);
  vien(g); R_lap(g, [[52, 8, 1], [54, 14], [2, 36]], TIMD[3], TIMD[2]); g.cx = 29; return g; };
// Hoa Phun Bào Tử: cây ăn thịt đứng yên, há miệng phun viên bào tử.
QR.hoa = function () { const g = S(58, 46);
  poly(g, [[33, 34], [20, 29], [14, 32], [26, 35]], LUCR[1]); line(g, 17, 31, 30, 34, LUCR[3], 1); poly(g, [[35, 34], [48, 28], [54, 31], [42, 35]], LUCR[1]); line(g, 51, 30, 38, 34, LUCR[2], 1);
  poly(g, [[33, 33], [23, 25], [21, 28], [30, 34]], LUCR[0]); line(g, 23, 27, 31, 33, LUCR[2], 1); poly(g, [[37, 33], [46, 24], [48, 27], [40, 34]], LUCR[0]); line(g, 46, 26, 39, 33, LUCR[2], 1);
  line(g, 34, 34, 37, 29, LUCR[0], 4.4); line(g, 37, 29, 33, 23, LUCR[0], 4.4); line(g, 34, 33, 37, 29, LUCR[1], 2.6); line(g, 37, 29, 33, 23, LUCR[1], 2.6); line(g, 33, 33, 36, 29, LUCR[2], 1);
  for (const p of [[39, 31, 1], [33, 30, -1], [39, 27, 1]]) { set(g, p[0] + p[2], p[1], TR); set(g, p[0] + 2 * p[2], p[1] - 1, TR); }
  poly(g, [[36, 10], [46, 4], [42, 14]], DOCAM[1]); line(g, 38, 10, 44, 5, DOCAM[3], 1); poly(g, [[38, 16], [50, 13], [41, 21]], DOCAM[2]); line(g, 40, 17, 48, 14, DOCAM[0], 1); poly(g, [[36, 22], [46, 27], [34, 26]], DOCAM[1]); poly(g, [[29, 8], [31, 3], [35, 8]], DOCAM[2]); set(g, 31, 4, DOCAM[3]);
  ball4(g, 28, 16, 11, 10, TIMD);
  poly(g, [[11, 7], [29, 16], [11, 25]], MAU); poly(g, [[14, 12], [27, 16], [14, 20]], '#7a1028'); line(g, 26, 16, 17, 18, '#ff6a8a', 1.6); set(g, 16, 19, '#ffb0c0');
  line(g, 14, 7, 29, 15, DOCX[1], 2.2); line(g, 14, 25, 29, 17, DOCX[1], 2.2); line(g, 14, 6, 27, 13, DOCX[3], 1); line(g, 15, 25, 27, 19, DOCX[0], 1);
  poly(g, [[13, 5], [17, 6], [12, 9]], DOCX[1]); poly(g, [[13, 27], [17, 26], [12, 23]], DOCX[1]);
  for (let k = 0; k < 4; k++) { const x = 13.5 + k * 3.4, y = 8.5 + k * 1.7; poly(g, [[x, y], [x + .6, y + 4.4 - k * .5], [x + 2.4, y + 1.2]], TR); const y2 = 23.5 - k * 1.7; poly(g, [[x, y2], [x + .6, y2 - 4.4 + k * .5], [x + 2.4, y2 - 1.2]], TR); }
  for (const p of [[30, 8], [34, 10], [36, 14], [31, 23], [35, 20], [26, 24]]) set(g, p[0], p[1], TIMD[3]);
  for (const p of [[33, 13], [36, 18], [29, 22]]) { rect(g, p[0], p[1], 2, 2, DOCX[1]); set(g, p[0], p[1], DOCX[3]); }
  mat(g, 28.5, 9.5, 2.8, -1, DOCX[2]);
  ell(g, 5, 15.5, 2.8, 2.8, DOCX[0]); ell(g, 4.8, 15.2, 2, 2, DOCX[2]); set(g, 4, 14, '#ffffff');
  rect(g, 44, 33, 4, 2, DA2[1]); set(g, 45, 33, DA2[3]); ell(g, 21, 34.5, 2, 1, NAUG[1]);
  vien(g);
  for (const r of [[9, 15, 2], [9, 17, 3]]) rect(g, r[0], r[1], r[2], 1, DOCX[2]);
  R_lap(g, [[3, 8, 1], [8, 3], [2, 24], [7, 29, 1], [52, 6]]); g.cx = 33; return g; };
// Chồn Bóng: thân dài mảnh, lao vụt để lại vệt bóng tím.
QR.chon = function () { const g = S(66, 34), C = ['#0c0816', '#221836', '#40305e', '#9a88c8'];
  poly(g, [[40, 17], [51, 7], [58, 6], [61, 9], [55, 12], [58, 15], [50, 16], [46, 21]], C[1]); line(g, 43, 17, 52, 9, C[2], 1); line(g, 52, 9, 58, 8, C[3], 1); poly(g, [[57, 6], [62, 8], [58, 11]], TIMD[2]); set(g, 60, 8, TIMD[3]);
  line(g, 37, 20, 45, 25, C[0], 2.4); line(g, 45, 25, 51, 24, C[0], 1.8); line(g, 19, 20, 9, 25, C[0], 2.2);
  for (const x of [22, 26, 30, 34, 38]) poly(g, [[x - 1.5, 15], [x + 1.5, 11 + (x % 4)], [x + 2, 15]], C[0]);
  ball4(g, 28, 18, 13.5, 4.3, C); ell(g, 26, 21, 9, 1.3, '#b8a8d8');
  for (let x = 20; x < 40; x += 3) { set(g, x, 17, C[1]); set(g, x + 1, 19, C[1]); } line(g, 22, 15, 36, 15, C[3], 1); set(g, 27, 15, C[2]); set(g, 32, 15, C[2]);
  line(g, 39, 20, 46, 27, C[1], 2.6); line(g, 46, 27, 52, 27, C[1], 1.8); for (const p of [[53, 26], [53, 28], [54, 27]]) set(g, p[0], p[1], TR);
  line(g, 20, 21, 12, 27, C[1], 2.4); line(g, 12, 27, 8, 27, C[1], 1.6); for (const p of [[6, 26], [6, 28], [5, 27], [7, 24], [6, 23]]) set(g, p[0], p[1], TR);
  poly(g, [[15, 14], [17, 7], [19, 14]], C[1]); set(g, 17, 9, '#c8707a'); set(g, 17, 10, '#c8707a'); poly(g, [[18, 15], [22, 9], [22, 16]], C[0]); poly(g, [[18.5, 10], [20, 12.5], [17.5, 12.5]], null);
  ball4(g, 14, 17, 5.6, 4.4, C); poly(g, [[10, 14.5], [3, 18.5], [10, 21]], C[2]); line(g, 5, 18, 10, 15, C[3], 1); set(g, 3, 18, R_DEN); set(g, 4, 18, R_DEN);
  ell(g, 12, 20, 2.6, 1.3, '#d8cce8');
  rect(g, 5, 20, 7, 1, MAU); set(g, 6, 20, TR); set(g, 8, 20, TR); set(g, 10, 20, TR); set(g, 7, 21, TR); set(g, 7, 22, TR); set(g, 9, 21, TR);
  mat(g, 13, 16.5, 2.5, -1, '#f070ff'); line(g, 16, 13, 18, 19, C[3], 1); set(g, 17, 16, C[0]);
  for (const p of [[30, 20], [36, 18], [24, 19]]) set(g, p[0], p[1], C[0]);
  vien(g); set(g, 13, 15, '#ffffff');
  for (const r of [[49, 19, 8, 1], [52, 22, 9, 2], [56, 13, 6, 1], [47, 30, 6, 2], [60, 17, 5, 2], [42, 10, 5, 2], [34, 26, 7, 2], [58, 25, 6, 1]]) rect(g, r[0], r[1], r[2], 1, TIMD[r[3]]);
  for (const p of [[44, 4], [63, 3], [22, 28], [28, 6]]) set(g, p[0], p[1], TIMD[2]); R_lap(g, [[38, 5, 1]], TIMD[3], TIMD[1]); g.cx = 28; return g; };
// thân nấm dùng chung: o = {Rx, Ry: mũ; sw, sh: nửa rộng và cao thân; c: màu mũ; ic: màu mắt; er, ex: mắt; mw, mh: miệng; nut: có vết nứt sáng}
function R_namThan(g, cx, foot, o) { const capY = foot - o.sh, yb = Math.round(capY + o.Ry * .3), c = o.c;
  ball4(g, cx, capY, o.Rx, o.Ry, c); rect(g, 0, yb, g.w, g.h - yb, null);
  for (let x = Math.round(cx - o.Rx * .93); x < cx + o.Rx * .93 - 2; x += 4) poly(g, [[x, yb], [x + 1.5, yb + 2.6 + (x % 3) * .6], [x + 3, yb]], c[1]);
  ell(g, cx, yb + .5, o.Rx * .78, 2, c[0]); for (let x = Math.round(cx - o.Rx * .7); x < cx + o.Rx * .7; x += 2) set(g, x, yb + 1, XUONGT[0]);
  line(g, cx - o.sw + 1, foot - 3, cx - o.sw - 3, foot - 1, NAUG[1], 2); line(g, cx + o.sw - 1, foot - 3, cx + o.sw + 3, foot - 1, NAUG[1], 2); line(g, cx - 2, foot - 2, cx - 4, foot, NAUG[0], 1.6); line(g, cx + 2, foot - 2, cx + 4, foot, NAUG[0], 1.6);
  ball4(g, cx, foot - o.sh * .5, o.sw, o.sh * .56, XUONGT);
  ell(g, cx, yb + 2.5, o.sw + 1.4, 1.5, XUONGT[1]); for (let x = Math.round(cx - o.sw - 1); x <= cx + o.sw + 1; x += 2) set(g, x, yb + 4, XUONGT[1]);
  const ey = foot - o.sh * .5;
  line(g, cx - o.sw + 1, ey + 3, cx - o.sw - 4, ey + 6, XUONGT[1], 2); line(g, cx + o.sw - 1, ey + 3, cx + o.sw + 4, ey + 6, XUONGT[1], 2);
  for (const d of [-1, 1]) { set(g, cx + d * (o.sw + 5), ey + 7, TR); set(g, cx + d * (o.sw + 6), ey + 6, TR); set(g, cx + d * (o.sw + 4), ey + 8, TR); }
  const wr = Math.max(1.4, o.Rx / 7.5);
  for (const p of [[-.5, -.5], [.1, -.72], [.58, -.38], [-.78, -.08], [.28, -.3], [.8, 0], [-.2, -.2], [-.3, -.82], [.45, -.02]]) { const wx = cx + o.Rx * p[0], wy = capY + o.Ry * p[1]; ell(g, wx, wy, wr, wr * .75, DOCX[0]); ell(g, wx - .2, wy - .3, wr * .7, wr * .5, o.nut ? DOCX[3] : DOCX[1]); set(g, Math.floor(wx - wr * .4), Math.floor(wy - wr * .5), o.nut ? '#ffffff' : DOCX[3]); }
  for (const p of [[-.6, .15], [.65, .12], [0, .2], [.3, .15], [-.3, .12]]) set(g, cx + o.Rx * p[0], capY + o.Ry * p[1], c[0]);
  if (o.nut) { const z = (pts) => { for (let i = 1; i < pts.length; i++) line(g, cx + o.Rx * pts[i - 1][0], capY + o.Ry * pts[i - 1][1], cx + o.Rx * pts[i][0], capY + o.Ry * pts[i][1], DOCX[3], 1); };
    z([[-.72, -.45], [-.55, -.15], [-.68, .1]]); z([[.4, -.75], [.52, -.5], [.38, -.3], [.5, -.12]]); z([[-.1, -.9], [-.02, -.6], [-.14, -.42]]); z([[-.55, -.15], [-.4, -.05]]); }
  mat(g, cx - o.ex, ey, o.er, 1, o.ic); mat(g, cx + o.ex, ey, o.er, -1, o.ic);
  mieng(g, Math.round(cx - o.mw / 2), Math.round(foot - o.sh * .27), o.mw, o.mh);
  for (const p of [[-.6, -.2], [.55, -.3], [.3, -.12], [-.35, -.1]]) set(g, cx + o.sw * p[0], foot + o.sh * p[1], XUONGT[0]);
  return { capY, yb, ey }; }
// Nấm Phồng: lại gần thì phồng to, nứt sáng rồi nổ ra khí độc.
QR.nam = function (puff) { const g = S(64, 56), cx = 32, foot = 50;
  if (puff) R_namThan(g, cx, foot, { Rx: 18, Ry: 14.5, sw: 9, sh: 18, c: ['#3a0e5c', '#7a28b0', '#c060f0', '#f8d0ff'], ic: R_DO, er: 3.7, ex: 4.6, mw: 9, mh: 3, nut: 1 });
  else R_namThan(g, cx, foot, { Rx: 11.5, Ry: 9, sw: 6, sh: 15, c: TIMD, ic: VANG, er: 2.8, ex: 3.3, mw: 5, mh: 2 });
  vien(g);
  if (puff) { for (const p of [[9, 22], [54, 18], [7, 38], [57, 40], [14, 9], [50, 7], [32, 4]]) { ell(g, p[0], p[1], 2.2, 1.6, 'rgba(196,244,60,.45)'); set(g, p[0], p[1], DOCX[3]); } R_lap(g, [[5, 30, 1], [59, 28, 1], [22, 5], [43, 3, 1], [10, 14], [55, 12]]); }
  else R_lap(g, [[17, 26, 1], [47, 30], [44, 24]]);
  g.cx = cx; g.foot = foot + 1; return g; };
// quả nổ: quả gai tím có mặt dữ, vết nứt sáng và ngòi
const R_QUA = ['#160a26', '#3c1860', '#7a38b0', '#e4a8ff'];
function R_quaNo(g, x, y, r) { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .3; poly(g, [[x + Math.cos(a - .25) * (r - 1), y + Math.sin(a - .25) * (r - 1)], [x + Math.cos(a) * (r + 2.2), y + Math.sin(a) * (r + 2.2)], [x + Math.cos(a + .25) * (r - 1), y + Math.sin(a + .25) * (r - 1)]], DOCX[1]); }
  ball4(g, x, y, r, r, R_QUA); line(g, x - r + 1, y + 1, x + r - 1, y + 1, R_QUA[0], 1);
  set(g, x - 2, y - 1, R_DO); set(g, x + 2, y - 1, R_DO); set(g, x - 3, y - 2, R_QUA[0]); set(g, x + 3, y - 2, R_QUA[0]); rect(g, x - 1, y + 2, 3, 1, TR);
  line(g, x + 1, y - r + 1, x + 3, y - 2, DOCX[2], 1); set(g, x + 2, y - r + 3, DOCX[3]);
  line(g, x, y - r, x + 1, y - r - 2, NAUG[2], 1.6); set(g, x + 2, y - r - 3, NAUG[3]); }
function R_tiaLua(g, x, y) { set(g, x, y, '#ffffff'); set(g, x - 1, y, '#ff7a5c'); set(g, x + 1, y, '#ff7a5c'); set(g, x, y - 1, '#ffd27a'); set(g, x, y + 1, '#ffd27a'); set(g, x + 2, y - 2, '#ffd27a'); set(g, x - 2, y - 2, '#ff7a5c'); }
// Sóc Ném Quả Nổ: ôm quả nổ có ngòi đang cháy, đuôi xù răng cưa.
QR.soc = function () { const g = S(54, 40), C = ['#3a1408', '#8a3a14', '#d0682a', '#ffb870'];
  ball4(g, 38, 21, 8, 11, C); ball4(g, 41, 11, 6, 5, C); ell(g, 37, 10, 2.4, 2.2, C[0]);
  for (const p of [[46, 13, 51, 11], [46, 18, 51, 18], [45, 24, 50, 26], [43, 29, 47, 32], [45, 8, 50, 6], [41, 7, 43, 4]]) poly(g, [[p[0] - 1, p[1] - 2], [p[2], p[3]], [p[0] - 1, p[1] + 2]], C[1]);
  line(g, 38, 13, 40, 29, C[0], 1); line(g, 41, 14, 43, 26, C[3], 1); for (const y of [16, 20, 24]) { set(g, 37, y, C[0]); set(g, 42, y + 1, C[0]); }
  ball4(g, 25, 26, 7.4, 8, C); ell(g, 21.5, 28, 3.6, 5, '#f0d8a8'); set(g, 20, 26, '#fff4d8'); set(g, 22, 30, '#c8a878'); set(g, 20, 31, '#c8a878');
  ell(g, 28, 33.5, 5.4, 3.6, C[1]); ell(g, 27.5, 33, 4, 2.4, C[2]); rect(g, 19, 36, 10, 2, C[0]); for (const x of [18, 20, 22]) set(g, x, 37, TR);
  line(g, 20, 21, 30, 31, NAUG[0], 1.6); for (const p of [[22, 23], [25, 26], [28, 29]]) { set(g, p[0], p[1], DOCX[2]); set(g, p[0] + 1, p[1], DOCX[0]); }
  poly(g, [[19, 9], [21, 4], [25, 9]], C[1]); line(g, 21, 6, 22, 8, '#c8707a', 1); set(g, 21, 4, R_DEN); poly(g, [[23, 10], [27, 5], [28, 11]], C[0]); poly(g, [[26, 6.5], [28.5, 8], [26, 9]], null);
  ball4(g, 18.5, 14, 7, 6, C); poly(g, [[13, 11], [7, 15.5], [13, 19]], C[2]); set(g, 7, 15, R_DEN); set(g, 8, 15, R_DEN); set(g, 8, 14, R_DEN);
  ell(g, 15, 18, 3.4, 2, '#f0d8a8'); rect(g, 9, 18, 6, 1, MAU); rect(g, 10, 18, 2, 3, TR); set(g, 10, 20, '#b0a488'); set(g, 13, 18, TR);
  mat(g, 16.5, 12.5, 2.9, -1, VANG); line(g, 20, 9, 22, 16, '#ffd0a0', 1); set(g, 21, 13, C[0]);
  for (const p of [[22, 17], [24, 12], [20, 18]]) set(g, p[0], p[1], C[0]);
  R_quaNo(g, 10.5, 28.5, 5.2);
  line(g, 22, 23, 14, 25, C[1], 2.6); line(g, 21, 22, 15, 24, C[2], 1); for (const p of [[12, 24], [12, 26], [11, 25]]) set(g, p[0], p[1], TR);
  line(g, 20, 30, 15, 32, C[1], 2.2); set(g, 13, 32, TR); set(g, 13, 33, TR);
  vien(g); R_tiaLua(g, 13, 19); R_lap(g, [[4, 18], [3, 36, 1], [50, 36]], TIMD[3], TIMD[2]); g.cx = 27; return g; };
QR.bom = function () { const g = S(24, 26); R_quaNo(g, 12, 15, 5.6); vien(g); R_tiaLua(g, 14, 5); g.cx = 12; g.foot = 23; return g; };
// Nhím Gai Độc: lúc xù gai thì gai dài ra, đầu gai rực đỏ tím, đánh vào bị phản đòn.
QR.nhim = function (xu) { const g = S(76, 62), cx = 40, cy = 46, n = 19, C = ['#1c1210', '#3e2a20', '#6a4c38', '#b89878'];
  for (let i = 0; i < n; i++) { const aa = Math.PI * 1.02 + i / (n - 1) * Math.PI * 1.02, gay = i === 12; let r1 = (xu ? 27 : 15) - (i % 2 ? (xu ? 5 : 3) : 0) + (i > 5 && i < 14 ? (xu ? 3 : 2) : 0); if (gay) r1 *= .6; const ca = Math.cos(aa), sa = Math.sin(aa) * (xu ? 1 : .85), ox = cx + 2 + ca * 4, oy = cy - 2;
    line(g, ox, oy, ox + ca * (r1 - 2), oy + sa * (r1 - 2), C[0], xu ? 2.6 : 2.2); line(g, ox + ca * r1 * .3, oy + sa * r1 * .3, ox + ca * r1 * .62, oy + sa * r1 * .62, XUONGT[2], 1); line(g, ox + ca * r1 * .62, oy + sa * r1 * .62, ox + ca * r1, oy + sa * r1, TIMD[2], 1);
    if (!gay) { if (xu) line(g, ox + ca * (r1 - 6), oy + sa * (r1 - 6), ox + ca * r1, oy + sa * r1, i % 3 ? R_DO : '#f070ff', 1); set(g, ox + ca * r1, oy + sa * r1, xu ? VANG : TIMD[3]); } }
  line(g, cx - 4, cy + 4, cx - 6, cy + 8, C[0], 2.6); line(g, cx + 8, cy + 4, cx + 10, cy + 8, C[0], 2.6);
  ball4(g, cx + 2, cy, 12, 7, C);
  for (let i = 0; i < 7; i++) { line(g, cx - 4 + i * 2.6, cy + 1, cx - 2 + i * 2.6, cy - 5 + (i % 2), C[0], 1); set(g, cx - 2 + i * 2.6, cy - 5 + (i % 2), XUONGT[2]); }
  line(g, cx - 1, cy + 4, cx - 3, cy + 8, C[1], 3); line(g, cx + 11, cy + 4, cx + 13, cy + 8, C[1], 3); rect(g, cx - 6, cy + 8, 5, 2, C[0]); rect(g, cx + 11, cy + 8, 5, 2, C[0]); for (const x of [-7, -5, -3, 10, 12]) set(g, cx + x, cy + 9, TR);
  ball4(g, cx - 9, cy + 1, 6.4, 5.4, C); poly(g, [[cx - 13, cy - 2], [cx - 20, cy + 3], [cx - 13, cy + 5.5]], C[2]); line(g, cx - 18, cy + 2, cx - 13, cy - 1, C[3], 1); rect(g, cx - 20, cy + 2, 2, 2, R_DEN); set(g, cx - 20, cy + 2, '#8a6a6a');
  poly(g, [[cx - 7, cy - 3], [cx - 5, cy - 8], [cx - 3, cy - 3]], C[1]); set(g, cx - 5, cy - 6, '#c8707a');
  if (xu) { rect(g, cx - 18, cy + 4, 8, 3, MAU); for (const x of [-18, -16, -14, -12]) set(g, cx + x, cy + 4, TR); for (const x of [-17, -15, -13]) set(g, cx + x, cy + 6, TR); rect(g, cx - 18, cy + 7, 8, 1, C[1]); }
  else { rect(g, cx - 18, cy + 5, 7, 1, MAU); for (const x of [-17, -15, -13]) set(g, cx + x, cy + 5, TR); set(g, cx - 16, cy + 6, TR); }
  mat(g, cx - 10, cy, 2.8, -1, xu ? R_DO : VANG);
  for (const p of [[3, 3], [8, 2], [-2, 4], [12, 1]]) set(g, cx + p[0], cy + p[1], C[0]); for (const p of [[6, -5], [7, -6], [8, -5]]) set(g, cx + p[0], cy + p[1], LUCR[2]);
  vien(g);
  if (xu) { R_lap(g, [[cx - 24, cy - 14, 1], [cx + 30, cy - 12, 1], [cx - 8, cy - 31], [cx + 14, cy - 30, 1], [cx - 27, cy - 3]], TIMD[3], TIMD[2]); for (const p of [[cx - 14, cy - 22], [cx + 22, cy - 22], [cx + 3, cy - 33]]) { set(g, p[0], p[1], TIMD[2]); set(g, p[0], p[1] + 1, TIMD[2]); set(g, p[0], p[1] + 2, TIMD[3]); } }
  g.cx = cx; g.foot = cy + 11; return g; };
// TINH ANH: Heo Rừng Nanh Dài. Nanh cong rất dài, sẹo vuốt, bờm gai tím độc, mũi tên gãy cắm trên lưng.
QR.heoNanh = function () { const g = S(96, 62), C = ['#180c0a', '#3a2012', '#644022', '#b08050'];
  line(g, 60, 42, 62, 52, C[0], 4.6); line(g, 32, 44, 25, 50, C[0], 4.6); rect(g, 59, 52, 6, 3, R_DEN); rect(g, 21, 50, 6, 3, R_DEN);
  line(g, 70, 30, 78, 23, C[1], 2.4); poly(g, [[77, 24], [84, 15], [82, 26]], R_DEN); set(g, 83, 17, TIMD[2]);
  for (let i = 0; i < 12; i++) { const x = 21 + i * 4.5, yb = 27 - Math.sin(i / 11 * Math.PI) * 6 + (i < 2 ? 3 : 0), h = 5 + (i % 2) * 3 + (i > 1 && i < 8 ? 1.5 : 0);
    poly(g, [[x - 3, yb + 3], [x + 3, yb - h], [x + 4, yb + 3]], R_DEN); line(g, x + 1, yb - h + 5, x + 3, yb - h, TIMD[2], 1); set(g, x + 3, yb - h, TIMD[3]); line(g, x - 1, yb + 1, x + 1.5, yb - h + 5, C[1], 1); }
  ball4(g, 50, 36, 22, 13.5, C);
  for (const p of [[40, 30], [46, 28], [53, 29], [60, 32], [44, 36], [51, 35], [58, 38], [65, 36], [38, 40], [47, 42], [55, 44], [62, 43], [34, 34]]) { set(g, p[0], p[1], C[1]); set(g, p[0] + 1, p[1] + 1, C[1]); set(g, p[0] + 2, p[1], C[3]); }
  for (let k = 0; k < 3; k++) { line(g, 52 + k * 4, 31, 47 + k * 4, 41, '#e8a090', 1); set(g, 49 + k * 4, 37, MAU); }
  ell(g, 49, 47.5, 15, 2.4, C[0]); for (const p of [[58, 26], [59, 25], [60, 26], [62, 27], [61, 25], [57, 27]]) set(g, p[0], p[1], LUCR[2]); set(g, 59, 26, LUCR[3]); set(g, 61, 26, LUCR[1]);
  line(g, 47, 27, 52, 16, NAUG[2], 1.8); line(g, 48, 26, 52, 17, NAUG[3], 1); poly(g, [[50, 19], [49, 14], [53, 12], [56, 16], [53, 20]], DOCAM[1]); line(g, 52, 18, 53, 13, DOCAM[3], 1); rect(g, 46, 26, 3, 2, MAU);
  line(g, 63, 28, 67, 18, NAUG[2], 1.8); set(g, 68, 16, NAUG[3]); set(g, 66, 17, NAUG[1]); set(g, 69, 18, NAUG[1]); rect(g, 62, 28, 3, 2, MAU);
  line(g, 36, 30, 40, 48, XUONGT[1], 1.6); for (let y = 31; y < 48; y += 3) set(g, Math.round(36 + (y - 30) * .22), y, XUONGT[3]); line(g, 40, 48, 43, 51, XUONGT[1], 1); rect(g, 42, 51, 3, 2, DA2[2]); set(g, 43, 51, DA2[3]);
  line(g, 67, 43, 71, 52, C[1], 5.4); line(g, 37, 46, 30, 52, C[1], 5.4); rect(g, 68, 52, 7, 3, R_DEN); rect(g, 26, 52, 7, 3, R_DEN); set(g, 69, 52, DA2[2]); set(g, 27, 52, DA2[2]);
  for (const p of [[66, 49], [72, 48], [29, 49], [34, 50]]) { set(g, p[0], p[1], C[3]); set(g, p[0], p[1] + 1, C[2]); }
  poly(g, [[28, 30], [35, 16], [38, 31]], C[1]); line(g, 33, 28, 35, 19, '#c8707a', 1.6); poly(g, [[36.5, 21], [39, 24], [35, 25]], null); set(g, 35, 16, R_DEN);
  ball4(g, 25, 40, 13, 11.4, C);
  ell(g, 12, 45, 7.4, 5.4, C[2]); ell(g, 11, 43.5, 5, 2.6, C[3]); ell(g, 6.5, 45, 2.8, 4.4, '#c87a70'); set(g, 6, 43, MAU); set(g, 6, 44, MAU); set(g, 6, 47, MAU); set(g, 5, 42, '#ffc0b0'); line(g, 11, 41, 16, 40, C[1], 1); line(g, 12, 43, 17, 42, C[1], 1);
  rect(g, 9, 50, 13, 2, MAU); for (let x = 10; x < 22; x += 2) set(g, x, 50, TR); for (let x = 11; x < 22; x += 3) set(g, x, 51, TR);
  poly(g, [[22, 50], [27, 48], [24, 38], [20, 31], [21, 40]], XUONGT[1]); line(g, 22, 47, 21, 36, XUONGT[0], 1);
  poly(g, [[13, 52], [19, 50], [14, 42], [10, 35], [9, 28], [10, 21], [7, 26], [5, 34], [8, 44]], TR); line(g, 16, 49, 11, 41, XUONGT[1], 1); line(g, 11, 41, 8, 33, XUONGT[1], 1); line(g, 8, 33, 8, 27, XUONGT[1], 1); line(g, 10, 45, 13, 43, XUONGT[0], 1); line(g, 6, 35, 9, 34, XUONGT[0], 1); set(g, 10, 21, '#ffffff'); set(g, 9, 23, '#ffffff'); set(g, 9, 24, DOCAM[1]); set(g, 8, 26, DOCAM[1]); set(g, 8, 27, DOCAM[2]);
  rect(g, 13, 49, 7, 2, C[1]); set(g, 14, 49, C[3]);
  mat(g, 24, 36, 4.2, -1, R_DO);
  line(g, 28, 28, 32, 44, '#e8a090', 1); for (const y of [32, 36, 40]) { set(g, Math.round(28 + (y - 28) * .25) - 1, y, MAU); set(g, Math.round(28 + (y - 28) * .25) + 1, y, MAU); }
  for (const p of [[30, 46], [26, 48], [33, 38], [19, 44]]) set(g, p[0], p[1], C[0]);
  vien(g); set(g, 24, 34, '#ffffff');
  for (const r of [[0, 40, 3], [1, 47, 2]]) rect(g, r[0], r[1], r[2], 1, '#e8e0c4'); set(g, 15, 52, DOCX[2]); set(g, 15, 53, DOCX[2]); set(g, 15, 54, DOCX[3]);
  for (const r of [[80, 34, 9], [82, 40, 8], [79, 46, 10]]) rect(g, r[0], r[1], r[2], 1, NAUG[3]); for (const p of [[78, 53], [81, 51], [84, 54], [16, 55], [50, 55]]) set(g, p[0], p[1], NAUG[2]);
  R_lap(g, [[14, 18, 1], [74, 14], [88, 20, 1], [42, 13]], TIMD[3], TIMD[2]); g.cx = 44; g.foot = 55; return g; };
// TINH ANH: Nấm Phồng Chúa. Vương miện gai, mắt đỏ, nanh dài, khí độc tỏa quanh.
QR.namPhongChua = function () { const g = S(88, 70), cx = 44, foot = 62;
  for (const p of [[29, 35, 38, 29, 27], [35, 41, 36, 36, 24], [40.5, 47.5, 35, 44, 20], [47, 53, 36, 52, 24], [53, 59, 38, 59, 27]]) { poly(g, [[p[0], p[2]], [p[3], p[4]], [p[1], p[2]]], XUONGT[1]); poly(g, [[p[0], p[2]], [p[3], p[4]], [(p[0] + p[1]) / 2 - .5, p[2]]], XUONGT[3]); line(g, p[3], p[4] + 2, p[3], p[4], DOCAM[1], 1); }
  R_namThan(g, cx, foot, { Rx: 23, Ry: 14, sw: 12, sh: 18, c: ['#2a0a48', '#5c1c98', '#a048e0', '#f0c0ff'], ic: R_DO, er: 4.4, ex: 5.8, mw: 13, mh: 3, nut: 1 });
  for (let x = 28; x < 61; x++) { const y = Math.round(33 + Math.pow((x - 44) / 16, 2) * 3.4); set(g, x, y, NAUG[2]); set(g, x, y + 1, NAUG[0]); if (x % 4 === 0) { set(g, x, y - 1, TR); set(g, x, y + 2, TR); } } rect(g, 43, 33, 3, 2, R_DO); set(g, 43, 33, '#ffffff'); set(g, 36, 34, DOCX[2]); set(g, 52, 34, DOCX[2]);
  poly(g, [[38, 57], [41, 57], [39.5, 62]], TR); poly(g, [[48, 57], [51, 57], [49.5, 62]], TR);
  line(g, 51, 46, 54, 57, '#b06a5a', 1); set(g, 51, 49, MAU); set(g, 54, 54, MAU);
  for (const p of [[21, 50], [25, 52], [67, 50], [63, 52]]) { line(g, p[0], p[1], p[0], p[1] + 3, '#5c1c98', 1.6); set(g, p[0], p[1] + 4, DOCX[2]); }
  vien(g);
  for (const p of [[11, 36, 0], [78, 34, 1], [9, 50, 1], [80, 50, 0], [17, 26, 1], [71, 24, 0], [13, 59, 0], [76, 60, 1]]) { ell(g, p[0], p[1], 2.6, 1.8, p[2] ? 'rgba(196,244,60,.45)' : 'rgba(180,96,240,.5)'); set(g, p[0], p[1], p[2] ? DOCX[3] : TIMD[3]); }
  R_lap(g, [[4, 42, 1], [84, 42, 1], [24, 22, 1], [65, 21], [12, 28], [77, 28], [6, 56], [83, 57, 1]]);
  g.cx = cx; g.foot = foot + 1; return g; };
const R_DS = [
  ['heo', 'Heo Rừng Con', 'Xông tới: thấy bé là chúi đầu, chĩa nanh lao thẳng vào húc.', '#d8a870'],
  ['ong', 'Bầy Ong Vò Vẽ', 'Bầy nhỏ: ong ngòi độc, yếu nhưng đông, cả bầy xúm vào chích.', '#ffd23c'],
  ['boHung', 'Bọ Hung Mai Cứng', 'Giáp: giơ mai sừng chắn phía trước, phải vòng ra sau lưng.', '#b4ec6c'],
  ['hoa', 'Hoa Phun Bào Tử', 'Bắn xa: mọc yên một chỗ, há miệng phun viên bào tử độc từ xa.', '#e4a8ff'],
  ['chon', 'Chồn Bóng', 'Nhanh nhẹn: lướt vèo qua như cái bóng, cắn một cái rồi vọt đi.', '#c9b8ff'],
  ['nam', 'Nấm Phồng', 'Cảm tử: lại gần thì phồng to rồi nổ ra khí độc.', '#e4a8ff', 'puff'],
  ['soc', 'Sóc Ném Quả Nổ', 'Ném quả nổ xuống sàn, có vòng đếm ngược rồi mới nổ.', '#ffb070', 'bom'],
  ['nhim', 'Nhím Gai Độc', 'Gai: lúc xù gai đỏ tím mà đánh vào thì bé bị phản đòn, dính độc.', '#c4f43c', 'xu'],
];
const R_TA = [
  ['heoNanh', 'Heo Rừng Nanh Dài', 'Tinh anh của Heo Rừng Con. Nanh cong rất dài, sẹo vuốt, bờm gai tím độc, lưng cắm mũi tên gãy.', '#d8a870'],
  ['namPhongChua', 'Nấm Phồng Chúa', 'Tinh anh của Nấm Phồng. Vương miện gai, mắt đỏ rực, nanh dài, khí độc tỏa quanh.', '#e4a8ff'],
];
