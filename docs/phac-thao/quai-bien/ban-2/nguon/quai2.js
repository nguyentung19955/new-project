// BẢN 2: tám quái thường vùng Hang biển, dữ hơn và nhiều chi tiết hơn.
const L2 = ['#0e2a5a', '#1b4c92', '#3883d4', '#a6deff'], N2 = ['#063b3c', '#0e746e', '#1fb49c', '#98f3da'], S2 = ['#6a1220', '#b32a2c', '#ee5c3a', '#ffbe88'], T2 = ['#110b2c', '#281d62', '#4836a0', '#988aee'], B2 = ['#4f86b0', '#a9d8ee', '#e6f8ff', '#ffffff'], DA2 = ['#3b4350', '#6b7684', '#a3aeb8', '#dfe6ea'];
const VANG = '#ffe14a', MAU = '#3a0a14', TR = '#fff8e0', REU = ['#2c5628', '#5a9838', '#a8da5c'];
// quả cầu bóng 3 lớp + điểm sáng: [tối nhất, tối, vừa, sáng]
function ball4(g, cx, cy, rx, ry, c) { ell(g, cx, cy, rx, ry, c[0]); ell(g, cx - rx * .04, cy - ry * .1, rx * .93, ry * .88, c[1]); ell(g, cx - rx * .1, cy - ry * .22, rx * .78, ry * .7, c[2]); ell(g, cx - rx * .4, cy - ry * .5, Math.max(1, rx * .26), Math.max(.8, ry * .17), c[3]); }
// mắt dữ: hẹp, tròng sáng, con ngươi dọc, mày chau xuống phía trong. side=1: phía trong ở bên phải.
function mat(g, x, y, r, side, ic) { ell(g, x, y, r, r * .85, '#1c0f18'); ell(g, x, y, r - .7, r * .85 - .6, ic || VANG);
  const px = Math.floor(x + side * .5), py = Math.floor(y - r * .35); rect(g, px, py, 1, Math.max(2, Math.round(r * .8)), OL); set(g, px - side, py, '#ffffff');
  line(g, x - side * (r + 1), y - r * .85 - 1.2, x + side * (r + .4), y - r * .15, OL, 1.8); }
function mieng(g, x, y, w, h) { rect(g, x, y, w, h, MAU); for (let i = 0; i < w; i++) { if (i % 2 === 0) set(g, x + i, y, TR); else if (h > 2) set(g, x + i, y + h - 1, TR); } }
function ha(g, x, y) { rect(g, x, y, 3, 2, DA2[2]); set(g, x + 1, y, DA2[0]); set(g, x, y + 1, DA2[1]); set(g, x + 2, y, DA2[3]); }
// viền tối, dày hơn ở phía dưới
function vien(g) { outline(g); const add = []; for (let y = 2; y < g.h; y++) for (let x = 0; x < g.w; x++) { const a = get(g, x, y - 1), b = get(g, x, y - 2); if (!g.d[y * g.w + x] && a === OL && b && b !== OL) add.push(y * g.w + x); } for (const i of add) g.d[i] = '#0a0c1e'; return g; }
function bong(g, pts, c) { for (const p of pts) { set(g, p[0], p[1], c || '#9fd8f5'); if (p[2]) { set(g, p[0] + 1, p[1], c || '#9fd8f5'); set(g, p[0], p[1] + 1, '#5fa8d8'); set(g, p[0] + 1, p[1] + 1, '#5fa8d8'); set(g, p[0], p[1], '#ffffff'); } } }
const Q2 = {};
Q2.cua = function () { const g = S(50, 40);
  line(g, 14, 27, 8, 25, L2[1], 1.8); line(g, 8, 25, 4, 31, L2[0], 1.4);
  line(g, 15, 29, 10, 29, L2[1], 1.8); line(g, 10, 29, 8, 34, L2[0], 1.4);
  line(g, 17, 31, 14, 32, L2[1], 1.8); line(g, 14, 32, 13, 35, L2[0], 1.4);
  line(g, 14, 23, 8, 19, S2[1], 2.8);
  ball4(g, 7.5, 13, 5.4, 5.4, S2); poly(g, [[4.5, 6], [10, 6], [8, 13]], null);
  poly(g, [[2, 11], [3, 5], [6, 8]], S2[2]); poly(g, [[9, 8], [12, 5], [12.5, 11]], S2[2]);
  set(g, 5, 9, TR); set(g, 9, 9, TR); set(g, 6, 11, TR); set(g, 8, 11, TR);
  set(g, 4, 16, S2[0]); set(g, 6, 17, S2[0]); set(g, 10, 15, S2[0]);
  line(g, 19, 20, 18, 14, L2[1], 1.8);
  ball4(g, 25, 26, 12, 7.2, L2);
  set(g, 14, 22, L2[3]); set(g, 16, 20, L2[3]); set(g, 19, 19, L2[3]); set(g, 13, 24, L2[3]);
  ell(g, 25, 30.5, 8, 1.8, '#bcd9ee');
  mirror(g);
  mat(g, 18, 11.5, 2.9, 1); mat(g, 32, 11.5, 2.9, -1);
  mieng(g, 20, 28, 11, 3);
  ball4(g, 25, 19, 4.6, 3, B2); line(g, 21, 20, 29, 20, B2[0], 1); poly(g, [[24, 17], [25.5, 10], [27, 17]], '#ffd27a'); set(g, 25, 12, '#ffffff');
  line(g, 31, 22, 35, 26, L2[0], 1); set(g, 32, 22, L2[3]); set(g, 34, 24, L2[3]); set(g, 33, 26, L2[0]);
  for (const p of [[17, 24], [20, 23], [28, 23], [22, 25], [30, 25]]) set(g, p[0], p[1], L2[1]);
  ha(g, 14, 25); set(g, 36, 21, REU[1]); set(g, 37, 22, REU[1]); set(g, 36, 22, REU[2]);
  vien(g); bong(g, [[44, 3, 1], [47, 8], [2, 2]]); return g; };
function caRang(g, cx, cy, c) {
  poly(g, [[cx + 3, cy], [cx + 9, cy - 4], [cx + 7, cy], [cx + 9, cy + 4]], c[1]);
  poly(g, [[cx - 2, cy - 2.5], [cx, cy - 6.5], [cx + 1.5, cy - 4.5], [cx + 3.5, cy - 6], [cx + 4, cy - 2]], c[0]);
  poly(g, [[cx, cy + 3], [cx + 2, cy + 5.5], [cx + 3, cy + 3]], c[0]);
  ball4(g, cx, cy, 5.1, 3.6, c); ell(g, cx + .5, cy + 2, 3.2, 1.1, c[3]);
  set(g, cx + 1, cy - 1, c[1]); set(g, cx + 3, cy, c[1]); set(g, cx + 2, cy + 1, c[1]); set(g, cx, cy, c[1]);
  rect(g, cx - 6, cy, 4, 3, MAU); set(g, cx - 6, cy, '#ffffff'); set(g, cx - 4, cy, '#ffffff'); set(g, cx - 5, cy + 2, '#ffffff'); set(g, cx - 3, cy + 2, '#ffffff');
  rect(g, cx - 6, cy + 3, 5, 1, c[1]);
  rect(g, cx - 4, cy - 3, 3, 2, VANG); set(g, cx - 3, cy - 2, OL); set(g, cx - 3, cy - 3, OL); line(g, cx - 5, cy - 3, cx - 1, cy - 5, OL, 1); }
Q2.caCon = function () { const g = S(48, 38); caRang(g, 14, 11, L2); caRang(g, 30, 19, N2); caRang(g, 15, 28, S2); vien(g); bong(g, [[5, 4, 1], [22, 9], [7, 20], [24, 30, 1], [40, 10]]); return g; };
Q2.oc = function () { const g = S(54, 44), V = ['#2c3a7c', '#5265ae', '#9bb4e8', '#eef8ff'], K = ['#4a0c18', '#8f2428', '#d84e38', '#ffb890'];
  line(g, 23, 34, 19, 39, S2[1], 1.8); line(g, 28, 34, 27, 39, S2[1], 1.8); line(g, 18, 33, 13, 38, S2[1], 1.8);
  poly(g, [[35, 11], [45, 2], [41, 16]], B2[1]); line(g, 37, 11, 43, 5, B2[0], 1); poly(g, [[29, 11], [31, 4], [34, 10]], B2[1]); poly(g, [[41, 19], [49, 16], [43, 24]], B2[1]); poly(g, [[40, 28], [47, 29], [40, 32]], B2[1]);
  ball4(g, 32, 23, 11, 11, V);
  for (let a = 0; a < 72; a++) { const t = a / 10, r = 1 + t * 1.3; set(g, 33 + Math.cos(t + 1) * r, 24 + Math.sin(t + 1) * r, V[0]); }
  for (let a = 0; a < 60; a += 4) { const t = a / 10, r = 2 + t * 1.3; set(g, 33 + Math.cos(t + 1) * r, 24 + Math.sin(t + 1) * r, V[3]); }
  line(g, 38, 14, 40, 17, OL, 1); line(g, 40, 17, 38, 19, OL, 1); line(g, 40, 17, 42, 18, OL, 1);
  for (const p of [[26, 13], [27, 12], [28, 12], [29, 13], [25, 15], [26, 14]]) set(g, p[0], p[1], REU[1]); set(g, 27, 13, REU[2]); set(g, 25, 16, REU[0]);
  ha(g, 39, 29); ha(g, 34, 31);
  ball4(g, 20, 29, 6.2, 5, S2);
  line(g, 20, 24, 20, 20, S2[1], 1.8); line(g, 26, 24, 26, 20, S2[1], 1.8);
  mat(g, 19.5, 18, 2.8, 1); mat(g, 26.5, 18, 2.8, -1);
  mieng(g, 16, 30, 7, 2);
  ball4(g, 10.5, 26.5, 5.6, 9, K);
  poly(g, [[5.5, 25], [1.5, 26.5], [5.5, 28]], TR); poly(g, [[7, 19.5], [3.5, 20.5], [6.5, 22.5]], TR); poly(g, [[6.5, 30.5], [3.5, 32.5], [7, 33.5]], TR);
  line(g, 10, 19, 11, 34, K[0], 1); line(g, 12, 22, 14, 27, K[3], 1); set(g, 13, 23, K[0]); rect(g, 9, 18, 3, 1, K[3]); set(g, 8, 30, K[0]); set(g, 13, 31, K[0]);
  vien(g); bong(g, [[48, 8], [50, 4, 1]]); return g; };
Q2.haiQuy = function () { const g = S(50, 44);
  const tips = [[7, 18], [10, 12], [16, 8], [23, 7], [30, 8], [36, 12], [39, 18]];
  tips.forEach((t, i) => { line(g, 23, 22, t[0], t[1], N2[0], 3.4); line(g, 23, 22, t[0], t[1], N2[1], 2); line(g, (23 + t[0]) / 2, (22 + t[1]) / 2, t[0], t[1], N2[2], 1);
    ell(g, t[0] + .5, t[1] + .5, 2, 2, i % 2 ? VANG : N2[3]); set(g, t[0], t[1], '#ffffff'); });
  poly(g, [[14, 39], [33, 39], [31, 20], [16, 20]], S2[0]); poly(g, [[16, 38], [31, 38], [29.5, 21], [17.5, 21]], S2[1]); poly(g, [[17, 37], [28, 37], [27, 22], [18, 22]], S2[2]); rect(g, 18, 23, 2, 9, S2[3]);
  for (const p of [[22, 23], [26, 24], [29, 30], [18, 34], [24, 36], [28, 35], [21, 35]]) set(g, p[0], p[1], S2[0]);
  ell(g, 23.5, 39, 11.5, 2.6, S2[0]); ell(g, 22, 38.5, 8, 1.2, S2[1]);
  mat(g, 19.5, 26.5, 2.9, 1); mat(g, 27.5, 26.5, 2.9, -1);
  mieng(g, 19, 31, 9, 3); set(g, 20, 33, TR); set(g, 26, 33, TR); set(g, 20, 34, TR); set(g, 26, 34, TR);
  ha(g, 11, 39); rect(g, 35, 38, 4, 3, DA2[1]); set(g, 36, 38, DA2[3]); line(g, 37, 38, 39, 31, REU[1], 1); set(g, 40, 30, REU[2]); set(g, 38, 34, REU[2]);
  ball4(g, 45, 9, 3.2, 3.2, L2);
  vien(g); bong(g, [[40, 14], [42, 12], [48, 4]]); return g; };
Q2.caChuon = function () { const g = S(58, 40);
  poly(g, [[34, 21], [45, 11], [40, 21], [45, 30]], L2[1]); poly(g, [[42, 13.5], [45.5, 15.5], [41, 16.5]], null); line(g, 36, 21, 42, 15, L2[2], 1); line(g, 36, 22, 42, 27, L2[0], 1);
  poly(g, [[20, 24], [30, 35], [26, 23]], B2[0]); line(g, 22, 25, 28, 32, B2[1], 1);
  ball4(g, 23, 21, 13, 4.6, L2); ell(g, 22, 23.6, 10, 1.7, '#d9ecfa');
  poly(g, [[12, 18], [4, 22], [12, 24]], L2[1]); line(g, 6, 21, 12, 19, L2[2], 1);
  for (let x = 19; x < 34; x += 3) { set(g, x, 20, L2[1]); set(g, x + 1, 22, L2[1]); }
  poly(g, [[17, 19], [29, 2], [39, 4], [35, 9], [37, 10], [32, 13], [33.5, 14.5], [28, 19]], B2[1]);
  line(g, 19, 18, 29, 4, B2[0], 1); line(g, 23, 18, 33, 6, B2[0], 1); line(g, 26, 18, 35, 10, B2[0], 1); line(g, 20, 16, 30, 3, B2[3], 1);
  poly(g, [[29, 2], [39, 4], [36, 7], [30, 5]], S2[2]); line(g, 30, 3, 37, 4, S2[3], 1);
  mat(g, 14.5, 19.5, 2.7, -1);
  rect(g, 6, 22, 7, 1, MAU); set(g, 7, 22, TR); set(g, 9, 22, TR); set(g, 11, 22, TR); set(g, 8, 23, TR); set(g, 10, 23, TR);
  line(g, 27, 18, 30, 21, L2[0], 1); set(g, 28, 18, L2[3]);
  vien(g); for (const r of [[48, 15, 6], [49, 21, 8], [47, 26, 5], [52, 18, 4]]) rect(g, r[0], r[1], r[2], 1, '#9fd8f5'); bong(g, [[10, 30], [14, 33], [50, 9]]); g.cx = 25; return g; };
Q2.caNoc = function (puff) { const g = S(64, 60), cx = 32, cy = 32, R = puff ? 15.5 : 9.8, c = puff ? ['#0c5673', '#1a8fb0', '#55cfe0', '#d8fbff'] : N2;
  const n = puff ? 18 : 12; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .2, r1 = R + (puff ? 6 : 2.8), w = puff ? .13 : .16;
    poly(g, [[cx + Math.cos(a - w) * (R - 1), cy + Math.sin(a - w) * (R - 1)], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a + w) * (R - 1), cy + Math.sin(a + w) * (R - 1)]], puff ? B2[2] : B2[1]);
    line(g, cx + Math.cos(a) * (r1 - 1.5), cy + Math.sin(a) * (r1 - 1.5), cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, '#ffffff', 1); }
  poly(g, [[cx + R - 1, cy], [cx + R + 5, cy - 4], [cx + R + 3.5, cy], [cx + R + 5, cy + 4]], S2[2]);
  ball4(g, cx, cy, R, R * .95, c); ell(g, cx, cy + R * .46, R * .76, R * .45, '#e6f4f2'); ell(g, cx, cy + R * .6, R * .55, R * .25, '#ffffff');
  for (const p of [[-.3, -.72], [.2, -.78], [.55, -.5], [-.62, -.42], [0, -.55], [.72, -.15], [-.78, -.1], [.38, -.62]]) rect(g, Math.round(cx + R * p[0]), Math.round(cy + R * p[1]), puff ? 2 : 1, 1, c[0]);
  poly(g, [[cx - R + 1, cy + 1], [cx - R - 4, cy + 5], [cx - R + 2, cy + 5]], S2[2]); poly(g, [[cx + R - 1, cy + 2], [cx + R + 2, cy + 6], [cx + R - 3, cy + 5]], S2[1]);
  const er = puff ? 3.9 : 3, ex = puff ? 6.5 : 4.4, ic = puff ? '#ff5a3c' : VANG; mat(g, cx - ex, cy - R * .2, er, 1, ic); mat(g, cx + ex, cy - R * .2, er, -1, ic);
  if (puff) { mieng(g, cx - 4, cy + 5, 9, 4); line(g, cx - 12, cy - 6, cx - 9, cy - 1, '#f2ffff', 1); line(g, cx - 9, cy - 1, cx - 11, cy + 3, '#f2ffff', 1); line(g, cx + 9, cy - 9, cx + 12, cy - 4, '#f2ffff', 1); line(g, cx + 12, cy - 4, cx + 10, cy, '#f2ffff', 1); line(g, cx - 2, cy - 13, cx + 1, cy - 9, '#f2ffff', 1); }
  else { mieng(g, cx - 3, cy + 3, 7, 3); line(g, cx + 4, cy - 8, cx + 7, cy - 5, c[0], 1); set(g, cx + 5, cy - 8, c[3]); }
  vien(g);
  if (puff) for (const p of [[6, 10], [58, 8], [4, 38], [60, 42], [16, 4], [48, 56], [56, 24]]) { set(g, p[0], p[1], '#ffffff'); set(g, p[0] - 1, p[1], '#bfe9ff'); set(g, p[0] + 1, p[1], '#bfe9ff'); set(g, p[0], p[1] - 1, '#bfe9ff'); set(g, p[0], p[1] + 1, '#bfe9ff'); }
  else bong(g, [[cx - 14, cy - 12, 1], [cx - 16, cy - 6]]);
  g.cx = cx; g.foot = cy + R + (puff ? 6.5 : 3.5); return g; };
function bom2(g, x, y) { ball4(g, x, y, 5.4, 5.4, ['#070f2a', '#16285c', '#2b5f9e', '#9fd8f5']); rect(g, x - 1, y - 7, 2, 2, '#e8d9b0'); line(g, x - 5, y + 1, x + 4, y + 1, '#070f2a', 1); set(g, x - 2, y - 1, '#ff5a46'); set(g, x + 2, y - 1, '#ff5a46'); set(g, x - 3, y - 2, '#070f2a'); set(g, x + 3, y - 2, '#070f2a'); rect(g, x - 1, y + 2, 3, 1, TR); }
Q2.sua = function () { const g = S(50, 46), SU = ['#0f437a', '#2273b2', '#50bde6', '#d4f5ff'];
  ball4(g, 24, 15, 12.3, 10.5, SU); rect(g, 10, 21, 30, 8, null);
  for (const x of [12, 16, 32, 36]) { const len = x % 8 ? 37 : 33; for (let y = 20; y < len; y++) set(g, x + Math.round(Math.sin(y * .9 + x) * 1.3), y, y % 3 === 0 ? '#c8f2ff' : '#3fa8d8'); set(g, x + Math.round(Math.sin(len * .9 + x) * 1.3), len, '#ff7a5c'); }
  line(g, 20, 20, 20, 28, '#3fa8d8', 1.8); line(g, 28, 20, 28, 28, '#3fa8d8', 1.8); line(g, 20, 21, 20, 27, '#8fdcf5', 1);
  bom2(g, 24, 34);
  for (const x of [13.5, 18.7, 24, 29.3, 34.5]) { ell(g, x, 20.6, 2.8, 1.9, SU[0]); ell(g, x, 20.2, 2.2, 1.3, SU[1]); }
  for (const p of [[30, 8], [33, 12], [17, 6], [27, 5], [34, 16], [14, 15], [22, 8]]) set(g, p[0], p[1], SU[1]); rect(g, 30, 10, 2, 1, SU[3]); rect(g, 25, 6, 2, 1, SU[3]);
  mat(g, 19, 14.5, 3, 1, '#ff8a3c'); mat(g, 29, 14.5, 3, -1, '#ff8a3c'); mieng(g, 21, 17, 7, 2);
  vien(g); set(g, 24, 25, '#ffd27a'); set(g, 25, 24, '#ff7a5c'); set(g, 23, 24, '#ff7a5c'); set(g, 24, 23, '#ffffff'); set(g, 26, 22, '#ffd27a');
  bong(g, [[6, 8, 1], [42, 5], [44, 22]]); return g; };
Q2.nhim = function (xu) { const g = S(64, 54), cx = 32, cy = 35, n = 19;
  for (let i = 0; i < n; i++) { const aa = Math.PI * .9 + i / (n - 1) * Math.PI * 1.2, gay = i === 6; let r1 = (xu ? 19.5 : 12.8) - (i % 2 ? (xu ? 3.5 : 2.6) : 0); if (gay) r1 *= .62; const tl = xu ? 5 : 2.6, ca = Math.cos(aa), sa = Math.sin(aa);
    line(g, cx, cy, cx + ca * (r1 - 2), cy + sa * (r1 - 2), T2[1], xu ? 2.4 : 2); line(g, cx + ca * r1 * .5, cy + sa * r1 * .5, cx + ca * r1, cy + sa * r1, T2[2], 1);
    if (!gay) { line(g, cx + ca * (r1 - tl), cy + sa * (r1 - tl), cx + ca * r1, cy + sa * r1, xu ? '#ff5a3c' : '#bfe9ff', 1); set(g, cx + ca * r1, cy + sa * r1, xu ? VANG : '#ffffff'); } }
  ball4(g, cx, cy, 8.6, 7.8, T2);
  for (const p of [[-5, -4], [3, -5], [6, -2], [-2, -6], [1, -3]]) set(g, cx + p[0], cy + p[1], T2[3]);
  const ic = xu ? '#ff5a3c' : VANG; mat(g, cx - 4, cy + .5, 2.9, 1, ic); mat(g, cx + 4, cy + .5, 2.9, -1, ic);
  if (xu) mieng(g, cx - 3, cy + 4, 7, 3); else mieng(g, cx - 2, cy + 5, 5, 1);
  ha(g, cx + 5, cy - 6); set(g, cx - 7, cy + 4, REU[1]); set(g, cx - 6, cy + 5, REU[1]);
  vien(g); g.cx = cx; g.foot = cy + 9.5; return g; };

const DS2 = [
  ['cua', 'Cua Lính', 'Xông tới: thấy bé là giơ càng lao thẳng vào kẹp.', '#7cc4ee'],
  ['caCon', 'Bầy Cá Con', 'Bầy nhỏ: cá răng nhọn, yếu nhưng đông, cả đàn xúm vào cắn.', '#8ff0d8'],
  ['oc', 'Ốc Mượn Hồn', 'Giáp: giơ càng khiên chắn phía trước, phải vòng ra sau lưng.', '#c9b8ff'],
  ['haiQuy', 'Hải Quỳ', 'Bắn xa: đứng yên một chỗ, phun viên nước từ xa.', '#ff9d8a'],
  ['caChuon', 'Cá Chuồn', 'Nhanh nhẹn: lướt vèo qua, đánh một cái rồi vọt đi.', '#9fd8f5'],
  ['caNoc', 'Cá Nóc', 'Cảm tử: lại gần thì phồng to rồi nổ ra băng làm bé chậm.', '#8ff0d8', 'puff'],
  ['sua', 'Sứa Bom', 'Thả bom nước xuống sàn, có vòng đếm ngược rồi mới nổ.', '#9fd8f5', 'bom'],
  ['nhim', 'Nhím Biển', 'Gai: lúc xù gai đỏ mà đánh vào thì bé bị phản đòn.', '#b6a8ff', 'xu'],
];
function bomSan2(c, x, y, s) { const g = S(20, 22); bom2(g, 10, 13); vien(g); set(g, 10, 5, '#ffd27a'); set(g, 11, 4, '#ff7a5c'); set(g, 9, 4, '#ff7a5c'); set(g, 10, 3, '#ffffff'); g.foot = 20;
  c.strokeStyle = 'rgba(255,90,70,.35)'; c.lineWidth = s; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, 0, 7); c.stroke();
  c.strokeStyle = '#ff5a46'; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, -1.2, 2.6); c.stroke(); draw(c, g, x, y, s); }
TO['quai-bien'] = function () {
  const [cv, c, y0] = page(1080, 2600, 'Quái vùng Hang biển (bản 2)', 'Bản 2: dữ hơn và nhiều chi tiết hơn. Tám quái thường, vẽ phóng to 6 lần.');
  const pw = 516, ph = 370; let y = y0;
  DS2.forEach((d, i) => { const x = 16 + (i % 2) * 532, py = y + Math.floor(i / 2) * (ph + 16); panel(c, x, py, pw, ph); const fy = py + 240; floor(c, x + 12, fy, pw - 24);
    const ex = d[4]; const mx = ex ? x + pw * .27 : x + pw / 2; const g = Q2[d[0]](); draw(c, g, mx, fy, 6);
    if (ex) { arrow(c, x + pw * .48, fy - 70, x + pw * .57, fy - 70, GOLDT, 6);
      if (ex === 'puff') draw(c, Q2.caNoc(true), x + pw * .79, fy, 5); if (ex === 'xu') draw(c, Q2.nhim(true), x + pw * .79, fy, 5); if (ex === 'bom') bomSan2(c, x + pw * .78, fy, 6); }
    text(c, d[1], x + pw / 2, py + 290, 38, d[3], true, 'center'); para(c, d[2], x + pw / 2, py + 324, pw - 40, 23, CREAM, 30, 'center'); });
  y += 4 * (ph + 16) + 10; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  for (let r = 0; r < 2; r++) { caveBg(c, 16, y, 1048, 240, 180); const fy = y + 186;
    put(c, { key: 'smith', weapon: W('sword') }, 90, fy, 3);
    DS2.slice(r * 4, r * 4 + 4).forEach((d, i) => { const g = Q2[d[0]](); const x = 300 + i * 222; shadow(c, x, fy + 3, 16, 3); draw(c, g, x, fy, 3); }); if (r === 0) y += 256; }
  return cut(cv, y + 240 + 22);
};
