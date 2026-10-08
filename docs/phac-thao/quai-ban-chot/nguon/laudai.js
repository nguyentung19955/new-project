// Vùng LÂU ĐÀI CỔ (hệ Lửa): tám quái thường và hai tinh anh. Bảng màu: đỏ cam, vàng lửa, đen than.
const LD_GI = ['#3a1a10', '#6e3418', '#a85a26', '#e09a4c'], LD_DA = ['#2c2830', '#57505a', '#8a8288', '#cbc3c0'], LD_MA = ['#2a0c18', '#5c1a22', '#9a3428', '#e07048'], LD_GOM = ['#2a1210', '#5c2418', '#96402a', '#d8805a'];
const LD_GX = ['#33202a', '#6a3c40', '#a2625a', '#d8a698'], LD_GOMS = ['#4a1410', '#9a2c18', '#dc542a', '#ffa868'];
const LD_HONG = '#f0506e', LD_HONGT = '#a8324a';
// ngọn lửa nhỏ, đáy ở (x, y), r là nửa bề ngang
function LD_lua(g, x, y, r) { poly(g, [[x - r, y - r * .7], [x + .5, y - r * 3.1], [x + r + 1, y - r * .7]], LUAV[0]); ell(g, x + .5, y - r * .8, r, r * .9, LUAV[0]);
  poly(g, [[x - r * .5, y - r * .6], [x + .5, y - r * 2.1], [x + r * .5 + 1, y - r * .6]], LUAV[2]); ell(g, x + .5, y - r * .65, r * .58, r * .58, LUAV[2]); set(g, x, y - Math.round(r * .7), LUAV[3]); }
// tia lửa: một chấm sáng có bốn cánh
function LD_tia(g, pts) { for (const q of pts) { set(g, q[0] - 1, q[1], LUAV[1]); set(g, q[0] + 1, q[1], LUAV[1]); set(g, q[0], q[1] - 1, LUAV[1]); set(g, q[0], q[1] + 1, LUAV[0]); set(g, q[0], q[1], LUAV[3]); } }
function LD_dom(g, pts) { for (const q of pts) set(g, q[0], q[1], q[2] || LUAV[1]); }
// viền sáng hồng than ở mép trên của phần đen than, để đọc được trên nền tối
function LD_ria(g, col) { const add = []; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const c = g.d[y * g.w + x]; if ((c === THANH[0] || c === THANH[1] || c === THANH[2]) && !get(g, x, y - 1)) add.push(y * g.w + x); } for (const i of add) g.d[i] = col; }
const QL = {};
// Lính Ma Giáp Gỉ: hồn lính đội nón, chĩa giáo lao tới
QL.linh = function () { const g = S(52, 40);
  poly(g, [[20, 23], [33, 22], [37, 27], [44, 29], [48, 32], [38, 33], [31, 31], [27, 33], [23, 30], [19, 33], [17, 27]], LD_MA[1]);
  poly(g, [[21, 25], [31, 24], [35, 28], [41, 30], [33, 31], [27, 29], [22, 29]], LD_MA[2]);
  line(g, 24, 27, 30, 29, LD_MA[3], 1); LD_dom(g, [[45, 31, LD_MA[3]], [20, 31, LD_MA[3]], [27, 31, LD_MA[0]], [36, 30, LD_MA[0]]]);
  line(g, 5, 26, 42, 17, NAUG[2], 1.8); line(g, 8, 25, 40, 17, NAUG[3], 1);
  poly(g, [[0, 27.5], [8, 22], [9.5, 27.5]], XUONGT[2]); line(g, 1, 27, 7, 23, XUONGT[3], 1); set(g, 8, 26, XUONGT[0]);
  ell(g, 11, 25.5, 1.8, 1.8, DOCAM[2]); set(g, 11, 28, DOCAM[1]); set(g, 12, 29, DOCAM[2]); set(g, 10, 27, DOCAM[1]);
  line(g, 30, 19, 35, 18, LD_GX[1], 2.4); ell(g, 36, 18.5, 1.8, 1.8, LD_MA[3]);
  ball4(g, 24.5, 22, 7, 5.6, LD_GX);
  line(g, 18, 21, 30, 20, LD_GX[0], 1); line(g, 19, 24, 30, 23, LD_GX[0], 1); line(g, 24, 17, 24, 26, LD_GX[0], 1);
  LD_dom(g, [[20, 19, LD_GX[3]], [27, 18, LD_GX[3]], [21, 22, LD_GX[3]], [28, 22, LD_GX[3]], [22, 25, DOCAM[2]], [29, 25, DOCAM[1]], [26, 21, DOCAM[2]], [19, 23, THANH[1]], [27, 25, THANH[1]]]);
  ball4(g, 30, 17.5, 3.6, 3, LD_GX); poly(g, [[31, 15], [35, 12], [33, 17]], LD_GX[2]);
  line(g, 20, 21, 14, 24, LD_GX[1], 2.4); ell(g, 13.5, 24.5, 2, 2, LD_MA[3]); set(g, 12, 23, TR); set(g, 12, 26, TR);
  ell(g, 18.5, 16, 5.8, 4.6, THANH[0]); ell(g, 18.5, 16.5, 4.4, 3, '#1a141e'); ell(g, 18, 18.5, 4, 2.6, THANH[1]); mieng(g, 15, 19, 6, 2);
  poly(g, [[6, 13.5], [18.5, 4.5], [32, 13.5]], NAUG[1]); poly(g, [[18.5, 4.5], [32, 13.5], [21, 13.5]], NAUG[0]);
  line(g, 17, 6, 9, 12, NAUG[2], 1); line(g, 18, 7, 14, 12, NAUG[2], 1); line(g, 13, 10, 24, 10, NAUG[0], 1); line(g, 22, 8, 27, 12, NAUG[1], 1); rect(g, 7, 13, 25, 1, '#1e100a'); rect(g, 8, 12, 12, 1, NAUG[2]); set(g, 18, 5, NAUG[3]);
  LD_dom(g, [[15, 9, NAUG[0]], [11, 11, NAUG[0]], [25, 11, NAUG[1]], [27, 12, DOCAM[1]]]); set(g, 28, 12, null); set(g, 29, 12, null); set(g, 28, 11, null);
  vien(g); for (const k of [0, 1]) { const X = d => k ? 37 - d : d; LD_dom(g, [[X(14), 15, LUAV[1]], [X(15), 15, DOCAM[2]], [X(14), 16, LUAV[2]], [X(15), 16, LUAV[3]], [X(16), 16, LUAV[2]], [X(17), 16, DOCAM[2]], [X(15), 17, LUAV[1]], [X(16), 17, LUAV[3]], [X(17), 17, LUAV[2]], [X(13), 14, LUAV[1]], [X(12), 13, DOCAM[2]], [X(13), 15, LUAV[0]]]); }
  LD_dom(g, [[44, 25, LUAV[1]], [47, 27, DOCAM[2]], [41, 24, DOCAM[2]], [49, 30, LUAV[0]]]); for (const r of [[44, 20, 5], [46, 23, 4]]) rect(g, r[0], r[1], r[2], 1, DOCAM[2]); g.cx = 24; return g; };
// một con dơi than: cx là trục giữa, f = 0 cánh giương, 1 cánh cụp
function LD_doi1(g, cx, cy, f) { const W = f ? [[2, -1], [8, -3], [11, 3], [9, 2], [8, 5], [6, 2], [4, 4], [2, 2]] : [[2, -1], [9, -7], [12, -2], [10, -2], [9, 1], [7, -1], [5, 2], [3, 0], [2, 2]];
  for (const s of [-1, 1]) { poly(g, W.map(p => [cx + s * p[0], cy + p[1]]), THANH[1]); const X = d => s > 0 ? cx + d : cx - 1 - d;
    if (f) { line(g, X(2), cy - 1, X(7), cy - 3, LD_HONG, 1); line(g, X(8), cy - 3, X(10), cy + 2, LD_HONGT, 1); line(g, X(3), cy, X(7), cy + 3, THANH[2], 1); line(g, X(3), cy - 1, X(5), cy + 3, THANH[2], 1); }
    else { line(g, X(2), cy - 2, X(8), cy - 7, LD_HONG, 1); line(g, X(9), cy - 6, X(11), cy - 3, LD_HONGT, 1); line(g, X(3), cy - 1, X(8), cy, THANH[2], 1); line(g, X(3), cy - 2, X(6), cy + 1, THANH[2], 1); set(g, X(9), cy - 8, TR); }
    poly(g, [[cx + s * .5, cy - 4], [cx + s * 3.2, cy - 9], [cx + s * 3.8, cy - 3]], THANH[1]); }
  ell(g, cx, cy + 1.5, 2.6, 3.6, THANH[1]); ell(g, cx, cy - 2.5, 3.2, 2.7, THANH[2]); set(g, cx - 1, cy + 2, THANH[2]); set(g, cx, cy + 3, THANH[2]); set(g, cx - 1, cy + 5, TR); set(g, cx, cy + 5, TR);
  for (const s of [-1, 1]) { const X = d => s > 0 ? cx + d : cx - 1 - d; set(g, X(2), cy - 6, LD_HONG); set(g, X(2), cy - 5, LD_HONGT); set(g, X(1), cy - 3, LUAV[2]); set(g, X(2), cy - 3, DOCAM[2]); set(g, X(2), cy - 4, OL); set(g, X(1), cy - 4, THANH[0]); set(g, X(1), cy, TR); set(g, X(1), cy + 1, TR); }
  rect(g, cx - 2, cy - 1, 4, 1, MAU); }
QL.doi = function () { const g = S(50, 38); LD_doi1(g, 14, 12, 0); LD_doi1(g, 35, 18, 1); LD_doi1(g, 16, 26, 0); vien(g);
  LD_tia(g, [[30, 6], [42, 28]]); LD_dom(g, [[25, 4, LUAV[1]], [45, 8, DOCAM[2]], [4, 19, DOCAM[2]], [31, 31, LUAV[0]], [27, 22, LUAV[1]], [40, 5, LUAV[0]]]); return g; };
// Tượng Đá Cầm Khiên: khiên lớn chắn phía trái
QL.tuong = function () { const g = S(52, 44), D = LD_DA;
  line(g, 44, 28, 47, 9, D[1], 2.4); line(g, 44, 26, 46, 10, D[3], 1); rect(g, 42, 27, 6, 2, LD_GI[2]); set(g, 47, 8, D[3]); set(g, 46, 15, D[0]); set(g, 45, 20, DOCAM[2]);
  rect(g, 24, 30, 6, 3, D[1]); rect(g, 32, 30, 6, 3, D[1]); rect(g, 25, 30, 2, 3, D[2]); rect(g, 33, 30, 2, 3, D[2]); rect(g, 22, 32, 9, 2, D[2]); rect(g, 31, 32, 9, 2, D[2]); rect(g, 22, 32, 4, 1, D[3]); rect(g, 31, 32, 4, 1, D[3]); rect(g, 30, 30, 2, 2, D[0]);
  poly(g, [[20, 17], [41, 17], [39, 31], [22, 31]], D[1]); poly(g, [[21, 18], [36, 18], [35, 30], [23, 30]], D[2]); rect(g, 23, 19, 7, 2, D[3]);
  line(g, 21, 22, 39, 22, D[0], 1); line(g, 22, 26, 39, 26, D[0], 1); rect(g, 22, 29, 17, 2, LD_GI[1]); rect(g, 29, 28, 3, 4, LD_GI[2]); set(g, 30, 29, LUAV[1]);
  for (const p of [[25, 24], [29, 24], [33, 24], [27, 28], [35, 28], [37, 20]]) set(g, p[0], p[1], D[0]);
  ball4(g, 40.5, 19, 4.4, 3.8, D); line(g, 42, 22, 44, 27, D[1], 3); ell(g, 44.5, 27.5, 2.2, 2.2, D[2]);
  ball4(g, 30, 12, 5.6, 5, D); rect(g, 27, 16, 6, 1, D[0]); set(g, 28, 17, D[3]); set(g, 31, 17, D[3]);
  mat(g, 27.3, 13.2, 2.3, 1, DOCAM[2]); mat(g, 32.7, 13.2, 2.3, -1, DOCAM[2]); set(g, 27, 13, LUAV[2]); set(g, 33, 13, LUAV[2]);
  poly(g, [[22, 11.5], [30, 4.5], [38, 11.5]], D[2]); poly(g, [[30, 4.5], [38, 11.5], [32, 11.5]], D[1]); line(g, 29, 6, 24, 10, D[3], 1); rect(g, 22, 11, 16, 1, D[0]); set(g, 29, 5, D[3]);
  set(g, 36, 10, null); set(g, 37, 10, null); set(g, 37, 11, null);
  pl(g, [[34, 6], [33, 9], [35, 12], [34, 15]], DOCAM[2], 1); set(g, 33, 9, LUAV[2]);
  pl(g, [[35, 18], [33, 21], [36, 24], [34, 28]], DOCAM[2], 1); set(g, 33, 21, LUAV[2]); set(g, 36, 24, LUAV[2]); line(g, 36, 24, 38, 25, DOCAM[1], 1);
  // khiên
  poly(g, [[5, 9.5], [21, 9.5], [22, 26], [13.5, 34.5], [4.5, 26]], D[0]); poly(g, [[6.5, 11], [19.5, 11], [20.5, 25.5], [13.5, 32.5], [6, 25.5]], D[2]); poly(g, [[14, 11], [19.5, 11], [20.5, 25.5], [14, 32]], D[1]);
  line(g, 7, 12, 7, 26, D[3], 1); line(g, 8, 12, 12, 12, D[3], 1); line(g, 7, 26, 12, 31, D[3], 1);
  for (const p of [[9, 14], [18, 14], [9, 25], [18, 25], [13, 30]]) { set(g, p[0], p[1], LD_GI[3]); set(g, p[0], p[1] + 1, D[0]); }
  ball4(g, 13.5, 21, 3.4, 3.4, LD_GI); set(g, 13, 21, LUAV[1]);
  poly(g, [[5, 14], [1, 15.5], [5, 17]], D[3]); poly(g, [[4.5, 20], [0.5, 21.5], [4.5, 23]], D[3]); poly(g, [[5, 26], [1.5, 27.5], [6, 29]], D[3]);
  pl(g, [[17, 11], [15, 15], [18, 18]], DOCAM[2], 1); pl(g, [[10, 17], [8, 20], [10, 24], [9, 27], [12, 29]], DOCAM[2], 1); pl(g, [[16, 24], [18, 26], [16, 29]], DOCAM[2], 1);
  LD_dom(g, [[15, 15, LUAV[2]], [8, 20, LUAV[2]], [10, 24, LUAV[1]], [18, 26, LUAV[2]], [9, 27, LUAV[2]]]);
  LD_dom(g, [[11, 13, THANH[2]], [16, 20, THANH[2]], [12, 27, THANH[2]], [26, 20, THANH[2]], [24, 31, THANH[1]], [35, 31, THANH[1]]]);
  vien(g); LD_dom(g, [[20, 5, LUAV[1]], [41, 4, DOCAM[2]], [2, 9, LUAV[0]], [49, 22, DOCAM[2]]]); g.cx = 24; return g; };
// Đèn Lồng Ma: lơ lửng, phun đốm lửa
QL.den = function () { const g = S(50, 46), cx = 28, cy = 21, rx = 9.6, ry = 8.6, D = DOCAM;
  for (const t of [[23, 0], [26, 1], [29, 0], [32, 1], [34, 0]]) for (let y = 30; y < 34 + t[1]; y++) set(g, t[0] + Math.round(Math.sin(y * 1.3 + t[0]) * .7), y, y > 32 ? LUAV[1] : y % 2 ? D[2] : D[1]);
  pl(g, [[28, 9], [28, 8], [30, 7], [31, 8]], NAUG[2], 1);
  ball4(g, cx, cy, rx, ry, D);
  for (const k of [.38, .72]) for (let y = cy - ry; y <= cy + ry; y += .5) { const q = Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)); set(g, Math.floor(cx - rx * k * q), Math.floor(y), D[0]); set(g, Math.floor(cx + rx * k * q), Math.floor(y), D[0]); }
  ell(g, cx - 1, cy + 3, 5.5, 3.6, D[2]); ell(g, cx - 1, cy + 3.5, 3.6, 2.2, LUAV[1]);
  rect(g, 21, 10, 14, 3, THANH[1]); rect(g, 21, 10, 14, 1, THANH[2]); rect(g, 21, 12, 14, 1, LUAV[1]); set(g, 23, 12, LUAV[3]); rect(g, 22, 29, 12, 2, THANH[1]); rect(g, 22, 29, 12, 1, LUAV[1]);
  mat(g, 23.5, 19, 3.3, 1, LUAV[2]); mat(g, 32.5, 19, 3.3, -1, LUAV[2]);
  mieng(g, 22, 23, 11, 4); rect(g, 24, 24, 7, 2, LUAV[1]); rect(g, 26, 24, 3, 2, LUAV[3]); poly(g, [[22, 23], [24, 23], [22.5, 27.5]], TR); poly(g, [[31, 23], [33, 23], [32.5, 27.5]], TR);
  rect(g, 35, 15, 2, 3, THANH[0]); set(g, 35, 16, LUAV[2]); set(g, 36, 14, D[3]); rect(g, 20, 14, 2, 1, D[3]); line(g, 30, 13, 32, 16, XUONGT[2], 1); line(g, 31, 13, 30, 16, XUONGT[1], 1);
  LD_dom(g, [[19, 22, D[0]], [37, 24, D[0]], [25, 14, D[3]], [36, 21, THANH[1]], [20, 25, THANH[1]]]);
  vien(g);
  LD_lua(g, 13, 27, 2.2); for (const r of [[17, 25, 3], [17, 27, 2]]) rect(g, r[0], r[1], r[2], 1, LUAV[0]);
  LD_lua(g, 5, 22, 1.5); LD_tia(g, [[9, 31], [2, 28]]); LD_dom(g, [[9, 24, LUAV[0]], [16, 31, DOCAM[2]], [42, 9, LUAV[1]], [44, 14, DOCAM[2]], [40, 31, LUAV[0]]]);
  g.cx = 26; g.foot = 40; return g; };
// Mèo Đen Hai Đuôi: gầy, lưng cong, hai đuôi lửa
QL.meo = function () { const g = S(64, 40), T = THANH;
  pl(g, [[42, 22], [46, 19], [48, 14], [46, 10]], T[1], 2.2); pl(g, [[43, 23], [50, 22], [54, 17], [54, 12]], T[1], 2.2);
  line(g, 40, 24, 45, 29, T[0], 2.6); line(g, 45, 29, 43, 34, T[0], 1.8); rect(g, 41, 34, 3, 1, T[1]);
  line(g, 17, 25, 11, 32, T[0], 2); rect(g, 8, 33, 4, 1, T[1]);
  ell(g, 29, 19.5, 10.5, 5, T[1]); ell(g, 27, 18, 7, 2.6, T[2]); ell(g, 29, 26, 6.5, 2.6, null);
  for (let x = 21; x <= 38; x += 3) { const ty = 19.5 - 5 * Math.sqrt(Math.max(0, 1 - ((x + 1 - 29) / 10.5) ** 2)); poly(g, [[x - .5, ty + 1.5], [x + 2.5, ty - 3.2], [x + 3, ty + 1.5]], T[1]); set(g, x + 2, Math.round(ty - 3), LD_HONG); }
  for (const x of [25, 28, 31, 34]) line(g, x, 19, x + 1, 23, T[0], 1);
  ell(g, 38.5, 23.5, 4.6, 5, T[1]); set(g, 37, 21, T[2]); set(g, 38, 21, T[2]); set(g, 37, 22, T[2]); line(g, 38, 27, 41, 31, T[1], 2.4); line(g, 41, 31, 38, 34, T[1], 1.8); rect(g, 35, 34, 4, 1, T[2]);
  ell(g, 19.5, 22, 5, 4.8, T[1]); line(g, 20, 25, 17, 30, T[1], 2.4); line(g, 17, 30, 14, 34, T[1], 1.8); rect(g, 11, 34, 4, 1, T[2]);
  LD_dom(g, [[10, 35, TR], [12, 35, TR], [14, 35, TR], [7, 34, TR], [9, 34, TR], [34, 35, TR], [36, 35, TR], [40, 35, TR], [42, 35, TR]]);
  poly(g, [[8, 16], [6, 8], [13, 13]], T[1]); poly(g, [[14, 13], [18, 7], [19, 15]], T[1]); set(g, 8, 12, LD_HONG); set(g, 8, 13, LD_HONGT); set(g, 17, 10, LD_HONG); set(g, 17, 11, LD_HONGT);
  ell(g, 13, 18.5, 6, 4.6, T[2]); ell(g, 12, 16.5, 3.4, 1.4, T[3]); ell(g, 13, 21.5, 4.5, 1.8, T[1]); poly(g, [[18, 19], [21, 22], [17, 22]], T[1]); poly(g, [[7, 20], [4, 23], [9, 22]], T[1]);
  mat(g, 10.3, 18.5, 2.5, 1, LUAV[2]); mat(g, 15.7, 18.5, 2.5, -1, LUAV[2]);
  rect(g, 10, 21, 6, 2, MAU); LD_dom(g, [[10, 21, TR], [10, 22, TR], [10, 23, TR], [15, 21, TR], [15, 22, TR], [15, 23, TR], [12, 21, TR], [13, 21, TR]]); set(g, 13, 22, DOCAM[2]); set(g, 12, 20, LD_HONGT);
  line(g, 8, 21, 4, 19, T[3], 1); line(g, 17, 21, 22, 19, T[3], 1); line(g, 7, 15, 9, 20, DOCAM[2], 1);
  LD_ria(g, LD_HONGT); for (let y = 0; y < 21; y++) for (let x = 0; x < 44; x++) if (g.d[y * g.w + x] === LD_HONGT) g.d[y * g.w + x] = LD_HONG;
  for (let y = 15; y < 22; y++) { let x = 0; while (x < 14 && !get(g, x, y)) x++; if (x < 14 && get(g, x, y) !== LD_HONG) set(g, x, y, LD_HONGT); } vien(g);
  LD_lua(g, 46, 12, 1.8); LD_lua(g, 54, 14, 2); LD_dom(g, [[50, 8, LUAV[1]], [58, 9, DOCAM[2]], [42, 9, LUAV[0]]]);
  for (const r of [[49, 26, 8], [51, 29, 10], [48, 32, 6], [56, 23, 5]]) { rect(g, r[0], r[1], r[2], 1, DOCAM[2]); set(g, r[0], r[1], LUAV[1]); }
  g.cx = 27; return g; };
// Hũ Lửa Sống: puff là lúc phồng to sắp nổ
QL.hu = function (puff) { const g = S(68, 66), cx = 34, cy = 38, R = puff ? 15 : 9.6, C = puff ? ['#5a0e0c', '#b0261a', '#f0582a', '#ffc08a'] : LD_GOMS, ry = R * .95;
  for (const s of [-1, 1]) { rect(g, Math.round(cx + s * R * .5 - 1.5), Math.round(cy + ry - 1), 3, 4, LD_GOM[1]); rect(g, Math.round(cx + s * R * .5 - 1.5 + (s < 0 ? -1 : 1)), Math.round(cy + ry + 2), 3, 1, LD_GOM[2]);
    ell(g, cx + s * (R + 1.2), cy - R * .3, 2.8, 3.6, C[1]); ell(g, cx + s * (R + 1.6), cy - R * .3, 1.2, 1.9, null); }
  rect(g, Math.round(cx - R * .5), Math.round(cy - ry - 3), Math.round(R), 5, C[1]); rect(g, Math.round(cx - R * .5), Math.round(cy - ry - 3), 2, 4, C[2]);
  ball4(g, cx, cy, R, ry, C);
  ell(g, cx, cy - ry - 3, R * .66, 1.7, C[2]); ell(g, cx, cy - ry - 3.3, R * .46, .9, puff ? LUAV[2] : LUAV[1]); rect(g, Math.round(cx - R * .6), Math.round(cy - ry - 4), 3, 1, C[3]);
  for (let x = -Math.round(R * .78); x <= R * .78; x++) { const q = Math.sqrt(1 - (x / R) ** 2), yy = cy - ry * .55 * q - ry * .12; set(g, cx + x, Math.round(yy + (Math.abs(x) % 4 < 2 ? 0 : 1)), puff ? LUAV[1] : NAUG[2]); if (Math.abs(x) % 4 === 0) set(g, cx + x, Math.round(yy) + 2, C[0]); }
  for (const p of [[-.5, .62], [.3, .7], [.62, .4], [-.72, .3], [0, .82], [.75, -.05]]) rect(g, Math.round(cx + R * p[0]), Math.round(cy + ry * p[1]), puff ? 2 : 1, 1, C[0]);
  const er = puff ? 3.9 : 3.2, ex = puff ? 6.5 : 4.4, ic = puff ? LUAV[3] : LUAV[2], ey = cy - R * .12; mat(g, cx - ex, ey, er, 1, ic); mat(g, cx + ex, ey, er, -1, ic);
  if (puff) { mieng(g, cx - 5, cy + 5, 11, 4); rect(g, cx - 3, cy + 6, 7, 2, LUAV[1]); rect(g, cx - 1, cy + 6, 3, 2, LUAV[3]);
    for (const k of [[[-12, -5], [-9, -1], [-11, 3], [-8, 7]], [[9, -9], [12, -4], [10, 0], [13, 4]], [[-3, -13], [0, -9], [-2, -6]], [[4, 9], [7, 12], [5, 14]], [[-9, 9], [-6, 12]]]) { pl(g, k.map(p => [cx + p[0], cy + p[1]]), LUAV[2], 1); set(g, cx + k[1][0], cy + k[1][1], LUAV[3]); }
    set(g, cx - 13, cy - 5, DOCAM[3]); set(g, cx + 14, cy + 4, DOCAM[3]); }
  else { mieng(g, cx - 4, cy + 3, 9, 3); rect(g, cx - 2, cy + 4, 5, 1, LUAV[1]); set(g, cx, cy + 4, LUAV[3]); LD_dom(g, [[cx - 4, cy + 4, TR], [cx - 4, cy + 5, TR], [cx - 4, cy + 6, TR], [cx + 4, cy + 4, TR], [cx + 4, cy + 5, TR], [cx + 4, cy + 6, TR]]);
    for (const k of [[[3, -9], [6, -7], [5, -5]], [[-8, 3], [-6, 6], [-7, 8]], [[8, 3], [7, 6], [8, 7]]]) { pl(g, k.map(p => [cx + p[0], cy + p[1]]), LUAV[1], 1); set(g, cx + k[1][0], cy + k[1][1], LUAV[3]); } }
  rect(g, Math.round(cx - R * .5), Math.round(cy - ry), Math.round(R), 1, NAUG[2]); set(g, Math.round(cx + R * .3), Math.round(cy - ry) + 1, NAUG[2]); set(g, Math.round(cx + R * .3) + 1, Math.round(cy - ry) + 2, NAUG[3]);
  vien(g);
  if (puff) { LD_lua(g, cx - 6, cy - ry - 3, 2.2); LD_lua(g, cx + 5, cy - ry - 3, 2.4); LD_lua(g, cx - 1, cy - ry - 3, 3.6); LD_lua(g, cx - 17, cy - 2, 1.8); LD_lua(g, cx + 17, cy + 7, 1.8); LD_lua(g, cx - 11, cy - 11, 1.5);
    LD_tia(g, [[6, 14], [61, 12], [4, 44], [63, 46], [14, 6], [56, 28], [50, 5]]); LD_dom(g, [[10, 26, LUAV[0]], [58, 36, DOCAM[2]], [24, 8, LUAV[1]], [44, 10, LUAV[0]]]); }
  else { LD_lua(g, cx - 1, cy - ry - 3, 1.8); LD_lua(g, cx - 5, cy - ry - 2, 1.1); LD_lua(g, cx + 3, cy - ry - 2, 1.2); LD_dom(g, [[cx + 4, cy - ry - 6, LUAV[1]], [cx - 5, cy - ry - 5, DOCAM[2]], [cx + 12, cy - 12, LUAV[0]], [cx - 13, cy - 9, DOCAM[2]]]); }
  g.cx = cx; g.foot = Math.round(cy + ry + 3) + 1; return g; };
// quả pháo đứng: tâm x, đỉnh y0, cao h; trả về chỗ đầu ngòi
function LD_phao(g, x, y0, h) { rect(g, x - 3, y0, 7, h, DOCAM[1]); rect(g, x - 2, y0, 1, h, DOCAM[3]); rect(g, x - 1, y0, 2, h, DOCAM[2]); rect(g, x + 3, y0, 1, h, DOCAM[0]);
  rect(g, x - 3, y0, 7, 1, LD_GOM[0]); rect(g, x - 3, y0 + 1, 7, 1, LUAV[2]); rect(g, x - 3, y0 + h - 2, 7, 1, LUAV[2]); rect(g, x - 3, y0 + h - 1, 7, 1, LD_GOM[1]); set(g, x - 2, y0 + 1, LUAV[3]); set(g, x - 2, y0 + h - 2, LUAV[3]); set(g, x + 3, y0 + 1, LUAV[0]); set(g, x + 3, y0 + h - 2, LUAV[0]);
  const m = y0 + Math.floor(h / 2); rect(g, x - 1, m - 1, 3, 3, LUAV[2]); set(g, x, m, THANH[0]); set(g, x - 1, m - 1, LUAV[3]);
  pl(g, [[x, y0 - 1], [x, y0 - 3], [x - 2, y0 - 5]], XUONGT[1], 1); return [x - 3, y0 - 6]; }
// Tiểu Yêu Ném Pháo
QL.yeu = function () { const g = S(54, 42), D = DOCAM;
  pl(g, [[31, 29], [37, 31], [41, 28], [42, 23]], D[1], 1.8); poly(g, [[39.5, 23], [42.5, 18], [45.5, 23]], D[2]); set(g, 42, 20, D[3]);
  line(g, 25, 31, 24, 32, D[1], 2.4); line(g, 30, 31, 31, 32, D[1], 2.4); rect(g, 20, 33, 6, 1, D[0]); rect(g, 29, 33, 5, 1, D[0]); LD_dom(g, [[19, 33, TR], [21, 34, TR], [28, 33, TR], [30, 34, TR]]);
  ball4(g, 28, 27, 6.2, 5.6, D); ell(g, 26, 29, 3.2, 2.4, D[3]); LD_dom(g, [[25, 28, D[2]], [27, 30, D[2]], [32, 24, D[0]], [31, 27, D[0]]]);
  poly(g, [[22, 30], [34, 30], [32, 33], [28, 32], [25, 33.5], [23, 32]], NAUG[1]); rect(g, 22, 30, 12, 1, NAUG[2]); set(g, 27, 32, NAUG[3]); set(g, 31, 32, NAUG[0]);
  poly(g, [[28, 12], [36, 7], [31, 17]], D[1]); line(g, 30, 13, 34, 9, D[3], 1); poly(g, [[15, 13], [8, 8], [14, 17]], D[1]); line(g, 13, 13, 10, 10, D[3], 1);
  ball4(g, 22, 15, 7.6, 6.6, D);
  poly(g, [[16, 10.5], [14.5, 6.2], [20, 9]], XUONGT[2]); poly(g, [[24, 9], [27.5, 6.2], [29, 10.5]], XUONGT[2]); set(g, 15, 7, XUONGT[3]); set(g, 27, 6, XUONGT[3]); set(g, 17, 9, XUONGT[0]); set(g, 27, 9, XUONGT[0]);
  poly(g, [[20, 9], [22, 5.5], [24, 9]], THANH[1]); set(g, 22, 7, THANH[2]);
  mat(g, 18.3, 14.5, 2.9, 1); mat(g, 25.7, 14.5, 2.9, -1);
  mieng(g, 17, 18, 10, 3); poly(g, [[17, 18], [19, 18], [17.5, 22]], TR); set(g, 26, 21, TR);
  LD_dom(g, [[28, 13, D[0]], [29, 17, D[0]], [15, 17, D[0]], [22, 12, D[1]], [21, 16, D[0]], [22, 16, D[0]]]);
  const f = LD_phao(g, 11, 22, 11);
  line(g, 23, 25, 16, 25, D[1], 2.6); ell(g, 14.5, 25.5, 2, 2, D[2]); LD_dom(g, [[13, 24, TR], [13, 26, TR], [12, 25, TR]]);
  line(g, 24, 29, 16, 31, D[0], 2.4); ell(g, 14.5, 31.5, 1.8, 1.8, D[1]); LD_dom(g, [[13, 31, TR], [13, 33, TR]]);
  vien(g); LD_tia(g, [f]); LD_dom(g, [[f[0] - 3, f[1] - 2, LUAV[1]], [f[0] + 2, f[1] - 3, DOCAM[2]], [f[0] - 2, f[1] + 3, LUAV[0]], [48, 12, DOCAM[2]], [46, 30, LUAV[0]]]); g.cx = 24; return g; };
// quả pháo nằm trên sàn (bó ba quả, ngòi đang cháy)
QL.bom = function () { const g = S(26, 26);
  rect(g, 5, 13, 4, 9, DOCAM[0]); rect(g, 5, 13, 1, 9, DOCAM[2]); rect(g, 5, 14, 4, 1, LUAV[1]); rect(g, 5, 20, 4, 1, LUAV[1]);
  rect(g, 17, 13, 4, 9, DOCAM[0]); rect(g, 18, 13, 1, 9, DOCAM[1]); rect(g, 17, 14, 4, 1, LUAV[1]); rect(g, 17, 20, 4, 1, LUAV[1]);
  const f = LD_phao(g, 13, 10, 13); rect(g, 5, 17, 16, 1, NAUG[2]); set(g, 9, 17, NAUG[3]); set(g, 16, 18, NAUG[1]); set(g, 12, 15, DOCAM[0]); set(g, 14, 15, DOCAM[0]);
  vien(g); LD_tia(g, [f]); LD_dom(g, [[f[0] - 2, f[1] - 2, LUAV[1]], [f[0] + 3, f[1] - 2, DOCAM[2]]]); g.cx = 13; g.foot = 24; return g; };
// Nhím Than Hồng: xu là lúc xù gai đỏ rực
QL.nhim = function (xu) { const g = S(68, 58), cx = 34, cy = 39, n = 19, T = THANH;
  for (let i = 0; i < n; i++) { const aa = Math.PI * .9 + i / (n - 1) * Math.PI * 1.2, gay = i === 12; let r1 = (xu ? 20 : 13) - (i % 2 ? (xu ? 3.5 : 2.6) : 0); if (gay) r1 *= .6; const tl = xu ? 8 : 2.6, ca = Math.cos(aa), sa = Math.sin(aa);
    line(g, cx, cy, cx + ca * (r1 - 2), cy + sa * (r1 - 2), T[1], xu ? 2.6 : 2.2); line(g, cx + ca * r1 * .45, cy + sa * r1 * .45, cx + ca * r1, cy + sa * r1, T[2], 1);
    if (!gay) { line(g, cx + ca * (r1 - tl), cy + sa * (r1 - tl), cx + ca * r1, cy + sa * r1, xu ? DOCAM[2] : LD_HONG, 1); if (xu) line(g, cx + ca * (r1 - 4), cy + sa * (r1 - 4), cx + ca * r1, cy + sa * r1, LUAV[1], 1); set(g, cx + ca * r1, cy + sa * r1, xu ? LUAV[3] : DOCAM[3]); } else set(g, cx + ca * r1, cy + sa * r1, T[3]); }
  ball4(g, cx, cy, 8.8, 7.8, [T[0], T[1], T[2], T[3]]);
  poly(g, [[cx - 1.5, cy + 4], [cx, cy + 9], [cx + 1.5, cy + 4]], T[1]);
  pl(g, [[cx - 6, cy - 5], [cx - 3, cy - 4], [cx - 2, cy - 6]], xu ? LUAV[1] : DOCAM[1], 1); pl(g, [[cx + 2, cy - 6], [cx + 4, cy - 4], [cx + 7, cy - 4]], xu ? LUAV[1] : DOCAM[1], 1); pl(g, [[cx + 6, cy + 3], [cx + 7, cy + 5]], xu ? LUAV[1] : DOCAM[1], 1); pl(g, [[cx - 8, cy + 2], [cx - 6, cy + 5]], xu ? LUAV[1] : DOCAM[1], 1);
  LD_dom(g, [[cx - 3, cy - 4, xu ? LUAV[3] : DOCAM[2]], [cx + 4, cy - 4, xu ? LUAV[3] : DOCAM[2]], [cx, cy - 7, DOCAM[2]]]);
  const ic = xu ? LUAV[3] : LUAV[1]; mat(g, cx - 4, cy + .5, 2.9, 1, ic); mat(g, cx + 4, cy + .5, 2.9, -1, ic);
  if (xu) { mieng(g, cx - 3, cy + 4, 7, 3); set(g, cx, cy + 5, LUAV[1]); } else { mieng(g, cx - 2, cy + 5, 5, 1); set(g, cx - 3, cy + 5, TR); set(g, cx + 3, cy + 5, TR); }
  rect(g, cx - 7, cy + 7, 3, 2, T[1]); rect(g, cx + 5, cy + 7, 3, 2, T[1]); set(g, cx - 8, cy + 8, TR); set(g, cx + 8, cy + 8, TR);
  vien(g);
  if (xu) { LD_tia(g, [[8, 14], [60, 16], [34, 9], [5, 36], [63, 38]]); LD_dom(g, [[18, 10, LUAV[1]], [50, 9, LUAV[0]], [10, 26, DOCAM[2]], [58, 27, LUAV[1]]]); }
  else LD_dom(g, [[cx - 12, cy - 15, LUAV[1]], [cx + 10, cy - 16, DOCAM[2]], [cx + 15, cy - 9, LUAV[0]], [cx - 2, cy - 17, DOCAM[2]]]);
  g.cx = cx; g.foot = cy + 10; return g; };
// TINH ANH: Tướng Ma
QL.tuongMa = function () { const g = S(74, 56), D = DOCAM;
  poly(g, [[34, 20], [50, 22], [58, 29], [62, 40], [57, 37], [55, 43], [50, 37], [47, 42], [43, 35], [38, 38]], D[0]);
  poly(g, [[36, 22], [49, 24], [56, 30], [58, 36], [53, 34], [48, 35], [43, 31]], D[1]); line(g, 47, 25, 53, 33, D[0], 1); line(g, 51, 25, 57, 31, D[2], 1); line(g, 44, 26, 47, 34, D[2], 1);
  set(g, 54, 33, null); set(g, 55, 33, null); set(g, 55, 34, null); set(g, 49, 30, null); set(g, 49, 31, null); set(g, 59, 36, null);
  poly(g, [[19, 35], [41, 35], [43, 39], [47, 41], [42, 42], [37, 39.5], [33, 42], [29, 39.5], [25, 42], [22, 39], [17, 40.5]], LD_MA[1]);
  poly(g, [[21, 35], [39, 35], [40, 38], [36, 38], [33, 41], [29, 38], [25, 41], [23, 37]], LD_MA[2]); LD_dom(g, [[25, 39, LD_MA[3]], [33, 39, LD_MA[3]], [38, 37, LD_MA[3]], [44, 41, LD_MA[3]], [19, 39, LD_MA[3]]]);
  line(g, 10, 40, 13.5, 13, NAUG[2], 2); line(g, 10, 39, 13, 14, NAUG[3], 1); poly(g, [[8.5, 40], [10.5, 43.5], [12.5, 40]], XUONGT[1]); rect(g, 9, 39, 4, 1, LUAV[1]);
  poly(g, [[10.5, 17], [7, 14], [5, 10], [5.5, 6], [9, 3.5], [17, 3], [13.5, 6], [13.5, 9.5], [19, 8.5], [16, 12.5], [16.5, 17]], XUONGT[2]); pl(g, [[10, 16], [7, 14], [5, 10], [6, 6], [9, 4], [15, 3]], XUONGT[3], 1); pl(g, [[10, 15], [8, 13], [6, 10], [7, 6], [10, 4]], XUONGT[3], 1); pl(g, [[15, 4], [13, 6], [13, 10], [15, 12], [15, 16]], XUONGT[1], 1); pl(g, [[14, 10], [18, 9]], XUONGT[1], 1); pl(g, [[14, 12], [14, 16]], XUONGT[0], 1); set(g, 13, 7, XUONGT[0]); set(g, 16, 10, OL); set(g, 9, 8, D[2]); set(g, 10, 12, D[2]); set(g, 11, 6, XUONGT[1]); set(g, 6, 8, '#ffffff'); set(g, 8, 5, '#ffffff');
  rect(g, 9, 17, 9, 2, LUAV[1]); rect(g, 9, 17, 9, 1, LUAV[2]); set(g, 13, 18, D[2]); line(g, 9, 19, 7, 23, D[2], 1); set(g, 7, 24, D[1]); set(g, 8, 24, D[2]);
  for (let i = 0; i < 6; i++) { const x = 19 + i * 4, h = 5 + (i % 2); rect(g, x, 32, 4, h, LD_GI[1 + (i % 2)]); rect(g, x, 32, 1, h, LD_GI[0]); set(g, x + 2, 32 + h - 1, LUAV[1]); set(g, x + 1, 33, LD_GI[3]); }
  poly(g, [[20, 20], [41, 20], [42, 32], [19, 32]], LD_GI[1]);
  for (let r = 0; r < 5; r++) { const y = 21 + r * 2, off = (r % 2) * 2; for (let x = 20; x <= 41; x++) { const m = (x + off) % 4; set(g, x, y, m === 0 ? LD_GI[0] : m === 2 ? LD_GI[3] : LD_GI[2]); set(g, x, y + 1, m === 1 || m === 3 ? LD_GI[0] : LD_GI[1]); } }
  ball4(g, 30.5, 25, 3.4, 3.2, [LUAV[0], LUAV[1], LUAV[2], LUAV[3]]); set(g, 30, 25, D[1]); set(g, 31, 26, D[1]);
  rect(g, 19, 30, 24, 2, LUAV[1]); rect(g, 19, 30, 24, 1, LUAV[2]); rect(g, 28, 29, 6, 4, LD_GI[0]); rect(g, 29, 30, 4, 2, D[2]); set(g, 29, 30, LUAV[3]); set(g, 32, 30, LUAV[3]); set(g, 23, 31, D[1]); set(g, 38, 31, D[1]);
  line(g, 43, 24, 46, 30, LD_GI[1], 3.2); ell(g, 46.5, 31.5, 2.5, 2.5, LD_GI[2]); set(g, 46, 31, LD_GI[3]); set(g, 45, 34, TR); set(g, 47, 34, TR);
  ball4(g, 42, 21.5, 5, 4, LD_GI); poly(g, [[43, 18.5], [48, 13], [46.5, 20]], XUONGT[2]); rect(g, 38, 24, 9, 1, LUAV[1]);
  line(g, 18, 24, 14, 27, LD_GI[1], 3.2); line(g, 17, 24, 14, 26, LD_GI[3], 1); rect(g, 9, 26, 6, 5, LD_GI[3]); rect(g, 9, 27, 5, 1, LD_GI[0]); rect(g, 9, 29, 5, 1, LD_GI[0]); rect(g, 14, 26, 1, 5, LD_GI[2]); rect(g, 15, 25, 2, 5, LUAV[1]); rect(g, 15, 25, 2, 1, LUAV[2]); LD_dom(g, [[9, 26, XUONGT[2]], [9, 28, XUONGT[2]], [9, 30, XUONGT[2]]]);
  ball4(g, 19, 21.5, 5.2, 4.2, LD_GI); rect(g, 15, 24, 9, 1, LUAV[1]); poly(g, [[19, 18.5], [20.5, 14], [22, 18.5]], XUONGT[2]);
  ell(g, 30.5, 15.5, 5.8, 4.8, THANH[0]); ell(g, 30, 15, 4.4, 3.2, THANH[1]); rect(g, 27, 18, 7, 2, XUONGT[1]); mieng(g, 27, 18, 7, 2); set(g, 27, 20, TR); set(g, 33, 20, TR);
  mat(g, 27.2, 16, 2.7, 1, LUAV[2]); mat(g, 33.8, 16, 2.7, -1, LUAV[2]);
  rect(g, 23, 13, 3, 6, LD_GI[1]); rect(g, 23, 13, 1, 6, LD_GI[2]); rect(g, 36, 13, 3, 6, LD_GI[0]); poly(g, [[38, 12], [44, 16], [38, 17]], LD_GI[1]); set(g, 24, 18, LUAV[1]); set(g, 37, 18, LUAV[1]);
  poly(g, [[22, 13], [23, 9], [27, 6], [34, 6], [38, 9], [39, 13]], LD_GI[1]); poly(g, [[24, 12], [25, 9], [28, 7], [32, 7], [31, 12]], LD_GI[2]); rect(g, 26, 8, 3, 1, LD_GI[3]);
  rect(g, 21, 12, 19, 2, LUAV[1]); rect(g, 21, 12, 19, 1, LUAV[2]); rect(g, 29, 10, 3, 3, LUAV[2]); set(g, 30, 11, D[2]); set(g, 24, 13, D[1]); set(g, 36, 13, D[1]); rect(g, 30, 14, 1, 2, LUAV[1]);
  rect(g, 30, 4, 1, 3, LUAV[2]); poly(g, [[31, 6], [33, 3.5], [39, 3], [44, 6], [46, 10], [42, 8], [38, 6], [35, 6.5], [33, 8]], D[2]); line(g, 34, 4, 39, 4, D[3], 1); line(g, 40, 5, 44, 8, D[1], 1); set(g, 36, 5, D[1]);
  LD_dom(g, [[34, 9, LD_GI[0]], [36, 10, D[2]], [25, 10, LD_GI[0]], [22, 26, THANH[1]], [40, 28, THANH[1]], [35, 22, D[2]]]);
  vien(g);
  LD_dom(g, [[27, 16, LUAV[3]], [28, 16, LUAV[2]], [33, 16, LUAV[2]], [34, 16, LUAV[3]], [27, 17, LUAV[1]], [34, 17, LUAV[1]], [24, 15, LUAV[1]], [37, 15, LUAV[1]]]);
  LD_tia(g, [[5, 12], [52, 14], [64, 30]]); LD_dom(g, [[15, 43, LUAV[1]], [49, 43, DOCAM[2]], [35, 44, LUAV[0]], [27, 44, LUAV[1]], [3, 22, DOCAM[2]], [58, 20, LUAV[0]], [66, 38, DOCAM[2]]]);
  g.cx = 30; g.foot = 46; return g; };
// TINH ANH: Hũ Lửa Chúa
QL.huChua = function () { const g = S(88, 72), cx = 44, cy = 46, R = 13.4, ry = 12.4, C = ['#3a0c0c', '#8a1c16', '#d2401e', '#ff9a5a'], top = cy - ry;
  for (const s of [-1, 1]) { ell(g, cx + s * (R + 2), cy - 4, 3.6, 4.8, C[1]); ell(g, cx + s * (R + 2.6), cy - 4, 1.6, 2.6, null); set(g, Math.round(cx + s * (R + 4) - .5), cy - 6, C[3]);
    rect(g, cx + s * 7 - 2, cy + 11, 4, 4, LD_GOM[1]); rect(g, cx + s * 7 - 2 + s, cy + 14, 4, 1, LD_GOM[2]); set(g, cx + s * 9 - (s < 0 ? 1 : 0), cy + 15, TR); set(g, cx + s * 6 - (s < 0 ? 1 : 0), cy + 15, TR); }
  for (let k = 0; k < 7; k++) set(g, cx + R + 4 + (k % 2), cy + 1 + k, k % 2 ? THANH[3] : THANH[2]);
  crystal(g, cx - 11, cx - 6.5, top - 2, cx - 12.5, top - 8, LUAV); crystal(g, cx + 6.5, cx + 11, top - 2, cx + 12.5, top - 8, LUAV);
  crystal(g, cx - 7.5, cx - 2.5, top - 2, cx - 6, top - 10, LUAV); crystal(g, cx + 2.5, cx + 7.5, top - 2, cx + 6, top - 10, LUAV);
  crystal(g, cx - 3, cx + 3, top - 2, cx, top - 12.5, LUAV); LD_dom(g, [[cx - 1, top - 4, LUAV[3]], [cx, top - 6, LUAV[3]], [cx - 6, top - 4, LUAV[3]], [cx + 5, top - 4, LUAV[3]], [cx - 10, top - 3, LUAV[3]], [cx + 9, top - 3, LUAV[3]]]);
  rect(g, cx - 8, top - 3, 16, 5, C[1]); rect(g, cx - 7, top - 2, 2, 4, C[2]);
  ball4(g, cx, cy, R, ry, C);
  ell(g, cx, top - 2.5, 10.5, 1.9, LUAV[1]); rect(g, cx - 10, top - 3, 20, 1, LUAV[2]); for (const x of [-7, 0, 7]) { set(g, cx + x, top - 2, C[2]); set(g, cx + x - 1, top - 2, C[0]); } set(g, cx - 9, top - 3, LUAV[3]);
  for (let x = -11; x <= 11; x++) { const q = Math.sqrt(1 - (x / R) ** 2), yy = cy - ry * .56 * q - 2; set(g, cx + x, Math.round(yy + (Math.abs(x) % 4 < 2 ? 0 : 1)), LUAV[1]); set(g, cx + x, Math.round(yy + (Math.abs(x) % 4 < 2 ? 0 : 1)) + 1, C[0]); if (Math.abs(x) % 4 === 1) set(g, cx + x, Math.round(yy) + 3, LUAV[0]); }
  for (const p of [[-6, 9], [5, 10], [9, 6], [-10, 5], [0, 11], [10, -1], [-11, 0]]) rect(g, cx + p[0], cy + p[1], 2, 1, C[0]);
  mat(g, cx - 6, cy - 1.5, 4.3, 1, LUAV[3]); mat(g, cx + 6, cy - 1.5, 4.3, -1, LUAV[3]);
  mieng(g, cx - 6, cy + 5, 13, 4); rect(g, cx - 4, cy + 6, 9, 2, LUAV[1]); rect(g, cx - 2, cy + 6, 5, 2, LUAV[3]); poly(g, [[cx - 6, cy + 5], [cx - 3.5, cy + 5], [cx - 5, cy + 10.5]], TR); poly(g, [[cx + 4.5, cy + 5], [cx + 7, cy + 5], [cx + 6, cy + 10.5]], TR);
  for (const k of [[[-11, -4], [-9, 0], [-11, 3], [-8, 7]], [[9, -9], [11, -5], [9, -2]], [[11, 2], [9, 5], [11, 8]], [[-3, -10], [-1, -7], [-3, -5]], [[2, 10], [0, 12]], [[-7, 9], [-5, 11]]]) { pl(g, k.map(p => [cx + p[0], cy + p[1]]), LUAV[2], 1); set(g, cx + k[1][0], cy + k[1][1], LUAV[3]); }
  line(g, cx + 3, cy - 8, cx + 9, cy + 3, XUONGT[1], 1); line(g, cx + 5, cy - 3, cx + 8, cy - 5, XUONGT[1], 1); line(g, cx + 6, cy, cx + 9, cy - 2, XUONGT[1], 1);
  vien(g);
  const b = bbox(g), my = (b.y0 + b.y1 + 1) / 2, hh = (b.y1 - b.y0 + 1) / 2;
  for (let y = b.y0; y <= b.y1; y++) for (let x = 0; x < g.w; x++) { if (g.d[y * g.w + x]) continue; const dx = (x + .5 - cx) / 34, dy = (y + .5 - my) / (hh + 3), q = dx * dx + dy * dy; if (q <= 1) g.d[y * g.w + x] = q < .42 ? 'rgba(255,120,40,.26)' : q < .7 ? 'rgba(255,110,40,.16)' : 'rgba(255,90,40,.08)'; }
  LD_lua(g, cx - R - 6, cy - 9, 1.8); LD_lua(g, cx + R + 7, cy - 12, 1.6); LD_lua(g, cx - R - 4, cy + 12, 1.5);
  LD_tia(g, [[cx - 26, cy - 2], [cx + 27, cy + 4], [cx + 20, cy - 20], [cx - 19, cy - 20], [cx + 23, cy + 12]]); LD_dom(g, [[cx - 22, cy + 8, LUAV[1]], [cx + 18, cy - 8, LUAV[0]], [cx - 15, cy - 14, LUAV[1]], [cx + 15, cy + 15, DOCAM[2]], [cx - 30, cy - 10, DOCAM[2]]]);
  g.cx = cx; return g; };
const LD_DS = [
  ['linh', 'Lính Ma Giáp Gỉ', 'Xông tới: thấy bé là chĩa giáo lao thẳng vào đâm.', '#e09a4c'],
  ['doi', 'Bầy Dơi Than', 'Bầy nhỏ: dơi than yếu nhưng đông, cả bầy sà xuống cắn.', '#f0708a'],
  ['tuong', 'Tượng Đá Cầm Khiên', 'Giáp: giơ khiên đá chắn phía trước, phải vòng ra sau lưng.', '#cbc3c0'],
  ['den', 'Đèn Lồng Ma', 'Bắn xa: lơ lửng một chỗ, phun đốm lửa từ xa.', '#ff8a5a'],
  ['meo', 'Mèo Đen Hai Đuôi', 'Nhanh nhẹn: lướt vèo qua, cào một cái rồi vọt đi.', '#f0708a'],
  ['hu', 'Hũ Lửa Sống', 'Cảm tử: lại gần thì phồng to rồi nổ ra lửa cháy trên sàn.', '#ffb070', 'puff'],
  ['yeu', 'Tiểu Yêu Ném Pháo', 'Ném pháo xuống sàn, có vòng đếm ngược rồi mới nổ.', '#ff8a5a', 'bom'],
  ['nhim', 'Nhím Than Hồng', 'Gai: lúc xù gai đỏ rực mà đánh vào thì bé bị phản đòn.', '#ffd23c', 'xu'],
];
const LD_TA = [
  ['tuongMa', 'Tướng Ma', 'Tinh anh của Lính Ma. Mũ trụ có ngù, giáp vảy, đại đao, áo choàng rách, mắt lửa.', '#e09a4c'],
  ['huChua', 'Hũ Lửa Chúa', 'Tinh anh của Hũ Lửa. Vương miện lửa, nanh dài, vết nứt sáng, hào quang nóng.', '#ffb070'],
];
