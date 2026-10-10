// LINH KHÍ: hình và hoạt hình cử động của toàn bộ quái và trùm (36 con).
// TỆP NÀY ĐƯỢC GHÉP TỰ ĐỘNG bằng docs/phac-thao/quai-hoat-hinh/nguon/ghep.py. Muốn sửa thì sửa tệp nguồn ở đó rồi ghép lại.
// Cách dùng: G.monsterArt.draw(c, id, x, y, {anim, t, face, dir, phase, hit});  G.monsterArt.list = danh sách quái.
(function () {
'use strict';
const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
const TO = {};
// ================= PHẦN 1: mã vẽ hình gốc của bản chốt (giữ nguyên) =================
// ----- từ quai-bien/nguon/but.js -----
// Bút vẽ pixel: vẽ hình vào lưới ô, rồi tự thêm viền tối.
const OL = '#14182e';
function S(w, h) { return { w, h, d: new Array(w * h).fill(null) }; }
function set(g, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.d[y * g.w + x] = c; }
function get(g, x, y) { return (x >= 0 && y >= 0 && x < g.w && y < g.h) ? g.d[y * g.w + x] : null; }
function ell(g, cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) set(g, x, y, c); } }
function rect(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c); }
function line(g, x0, y0, x1, y1, c, t) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2; t = t || 1; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (t <= 1) set(g, x, y, c); else ell(g, x + .5, y + .5, t / 2, t / 2, c); } }
function poly(g, pts, c) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) { const px = x + .5, py = y + .5; let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } if (ins) set(g, x, y, c); } }
// quả cầu có bóng: [tối, vừa, sáng]
function ball(g, cx, cy, rx, ry, cols) { ell(g, cx, cy, rx, ry, cols[0]); ell(g, cx - rx * .06, cy - ry * .14, rx * .9, ry * .84, cols[1]); if (cols[2]) ell(g, cx - rx * .38, cy - ry * .45, Math.max(1, rx * .3), Math.max(.8, ry * .22), cols[2]); }
// mắt to tròn: r bán kính, (dx,dy) hướng nhìn, brow: 0 không, 1 giận nghiêng trái thấp, -1 nghiêng phải thấp
function eye(g, x, y, r, dx, dy, brow, pc) { ell(g, x, y, r, r, '#ffffff'); const pr = Math.max(1, r * .55); ell(g, x + (dx || 0), y + (dy || 0), pr, pr, pc || '#14182e'); set(g, Math.floor(x + (dx || 0) - pr * .6), Math.floor(y + (dy || 0) - pr * .7), '#ffffff');
  if (brow) line(g, Math.round(x - r - .5), Math.round(y - r - (brow > 0 ? 1.2 : -.2)), Math.round(x + r - .5), Math.round(y - r - (brow > 0 ? -.2 : 1.2)), OL, 1); }
function mirror(g) { for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w / 2; x++) { const a = g.d[y * g.w + x], b = g.d[y * g.w + g.w - 1 - x]; if (a && !b) g.d[y * g.w + g.w - 1 - x] = a; else if (b && !a) g.d[y * g.w + x] = b; } }
function outline(g, col) { col = col || OL; const add = []; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (!g.d[y * g.w + x] && (get(g, x - 1, y) || get(g, x + 1, y) || get(g, x, y - 1) || get(g, x, y + 1))) add.push(y * g.w + x); for (const i of add) g.d[i] = col; return g; }
function bbox(g) { let x0 = g.w, x1 = 0, y0 = g.h, y1 = 0; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.d[y * g.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }; }
// Vẽ lưới ra canvas, chân (giữa đáy) đặt tại (x,y), phóng s lần. g.foot: hàng đáy tính làm chân (nếu có hiệu ứng thừa ra).
function draw(c, g, x, y, s, flip) { const b = g.bb || (g.bb = bbox(g)); const cx = g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, fy = g.foot != null ? g.foot : b.y1 + 1;
  for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) { const col = g.d[j * g.w + i]; if (!col) continue; c.fillStyle = col; const px = flip ? (cx - i - 1) : (i - cx); c.fillRect(Math.round(x + px * s), Math.round(y + (j - fy) * s), s, s); } }
function shadow(c, x, y, w, s) { c.fillStyle = 'rgba(0,0,0,.28)'; for (let j = 0; j < 2; j++) c.fillRect(Math.round(x - (w / 2 - j) * s), Math.round(y - s + j * s), Math.round((w - 2 * j) * s), s); }

// ----- từ quai-bien/nguon/quai.js -----
const LAM = ['#1f5f9c', '#3f8fd0', '#9fd8f5'], NGOC = ['#12827e', '#22b5a5', '#8ff0d8'], SANHO = ['#c9463d', '#ff7a5c', '#ffc2a0'], BANG = ['#8fc4e0', '#dff6ff', '#ffffff'], TIM = ['#231a4a', '#3d3184', '#7a6dd0'];
// ----- từ quai-bien/nguon/tinhanh.js -----
const DA = ['#39445e', '#5d6f8f', '#9db0cc'];
function crystal(g, x0, x1, yb, tx, ty, cols) { poly(g, [[x0, yb], [tx, ty], [x1, yb]], cols[1]); poly(g, [[x0, yb], [tx, ty], [(x0 + x1) / 2 - .5, yb]], cols[2]); poly(g, [[x1 - 1.5, yb], [tx + .5, ty + 2], [x1, yb]], cols[0]); }
// ----- từ quai-bien/nguon/ngutinh.js -----
function pl(g, pts, c, t) { for (let i = 0; i < pts.length - 1; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, t); }
function nuoc(g, lv, rough, ph) { for (let x = 0; x < g.w; x++) { const top = Math.round(lv + Math.sin(x * .32 + ph) * rough + Math.sin(x * .11) * rough * .6); for (let y = top; y < g.h; y++) { const d = y - top; set(g, x, y, d === 0 ? '#eafaff' : d < 3 ? '#6fd0ee' : d < 7 ? '#2f8fc8' : '#1f5f9c'); } if (x % 9 === 3) set(g, x, top + 4, '#9fe0f5'); if (x % 13 === 6) { set(g, x, top + 8, '#2f8fc8'); set(g, x + 1, top + 8, '#2f8fc8'); } } }
// ----- từ quai-bien/nguon/chieu.js -----
function cotNuoc() { const g = S(26, 76); for (let y = 10; y < 76; y++) for (let x = 6; x < 20; x++) set(g, x + Math.round(Math.sin(y * .5) * 1), y, x < 8 ? '#1f5f9c' : x < 11 ? '#2f8fc8' : x < 15 ? '#6fd0ee' : x < 17 ? '#eafaff' : '#2f8fc8');
  ball(g, 13, 9, 9, 6, ['#6fd0ee', '#eafaff', '#ffffff']); ell(g, 5, 13, 3, 2.4, '#eafaff'); ell(g, 21, 13, 3, 2.4, '#eafaff'); set(g, 2, 5, '#eafaff'); set(g, 24, 4, '#eafaff'); set(g, 13, 0, '#eafaff'); return g; }
function song(k) { const g = S(30, 22); k = k || 1; poly(g, [[29, 22], [26, 12], [20, 5], [12, 2], [6, 5], [10, 7], [13, 11], [11, 22]], '#2f8fc8'); poly(g, [[26, 22], [23, 13], [18, 7], [13, 5], [15, 9], [17, 14], [16, 22]], '#6fd0ee'); pl(g, [[26, 12], [20, 5], [12, 2], [6, 5]], '#eafaff', 1.6); set(g, 3, 8, '#eafaff'); set(g, 5, 11, '#eafaff'); set(g, 1, 3, '#eafaff'); g.foot = 22; return g; }
function nuocDai(wu, hu) { const g = S(wu, hu); nuoc(g, 3, 1.5, 0); g.foot = hu; return g; }
// ----- từ quai-bien/ban-2/nguon/quai2.js -----
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
function vien0(g) { outline(g); const add = []; for (let y = 2; y < g.h; y++) for (let x = 0; x < g.w; x++) { const a = get(g, x, y - 1), b = get(g, x, y - 2); if (!g.d[y * g.w + x] && a === OL && b && b !== OL) add.push(y * g.w + x); } for (const i of add) g.d[i] = '#0a0c1e'; return g; }
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

// ----- từ quai-bien/ban-2/nguon/tinhanh2.js -----
const DO = '#ff4a36', GI = ['#5a2a18', '#8a4a2a', '#c97a3a'], D3 = ['#222a40', '#46567a', '#7187a8', '#a9bcd8'];
function lap(g, pts) { for (const q of pts) { set(g, q[0], q[1], '#ffffff'); set(g, q[0] - 1, q[1], '#bfe9ff'); set(g, q[0] + 1, q[1], '#bfe9ff'); set(g, q[0], q[1] - 1, '#bfe9ff'); set(g, q[0], q[1] + 1, '#bfe9ff'); } }
Q2.cuaTuong = function () { const g = S(84, 68);
  line(g, 24, 46, 14, 43, L2[1], 3); line(g, 14, 43, 7, 55, L2[0], 2.2); line(g, 26, 49, 18, 49, L2[1], 3); line(g, 18, 49, 14, 59, L2[0], 2.2); line(g, 29, 52, 24, 54, L2[1], 3); line(g, 24, 54, 22, 61, L2[0], 2.2);
  set(g, 14, 42, L2[3]); set(g, 18, 48, L2[3]); set(g, 24, 53, L2[3]); set(g, 10, 48, L2[2]); set(g, 16, 54, L2[2]);
  line(g, 24, 39, 15, 31, S2[1], 5); line(g, 23, 37, 16, 30, S2[2], 2);
  ball4(g, 13, 21, 9.5, 9.5, S2); poly(g, [[9, 9], [17, 9], [14.5, 21]], null);
  poly(g, [[3, 18], [5, 6], [10, 12]], S2[2]); poly(g, [[15, 12], [21, 6], [22, 17]], S2[2]);
  for (let k = 0; k < 4; k++) { set(g, Math.round(10 + k * .9), 12 + k * 2, TR); set(g, Math.round(16 - k * .5), 12 + k * 2, TR); }
  poly(g, [[4, 21], [0, 23], [4, 25]], S2[3]); poly(g, [[6, 27], [3, 31], [9, 30]], S2[3]);
  for (const p of [[8, 24], [11, 27], [16, 25], [18, 21], [13, 29], [6, 19]]) set(g, p[0], p[1], S2[0]);
  line(g, 30, 32, 28, 25, L2[1], 3);
  ball4(g, 42, 42, 20.5, 12.5, L2);
  for (const s of [[24, 36], [27, 32], [32, 29]]) poly(g, [[s[0] - 1.5, s[1] + 2], [s[0] - 1, s[1] - 3], [s[0] + 2, s[1] + 1]], L2[3]);
  line(g, 31, 36, 35, 44, L2[1], 1); line(g, 27, 42, 33, 47, L2[1], 1); ell(g, 30, 40, 2.2, 1.4, L2[0]); ell(g, 36, 34, 1.6, 1, L2[0]); rect(g, 25, 45, 3, 1, L2[0]);
  ell(g, 42, 50, 13.5, 3.2, '#bcd9ee'); ell(g, 42, 51, 9, 1.6, '#e6f4fb');
  mirror(g);
  mat(g, 27.5, 21.5, 4.7, 1, DO); mat(g, 56.5, 21.5, 4.7, -1, DO);
  mieng(g, 33, 46, 19, 4); poly(g, [[33, 46], [36, 46], [34.5, 52]], TR); poly(g, [[49, 46], [52, 46], [50.5, 52]], TR);
  line(g, 48, 33, 55, 40, '#dff6ff', 1); line(g, 49, 36, 52, 33, '#dff6ff', 1); line(g, 52, 39, 55, 36, '#dff6ff', 1);
  line(g, 68, 16, 75, 26, S2[0], 1); set(g, 69, 16, S2[3]); set(g, 72, 20, S2[3]);
  ha(g, 21, 44); ha(g, 58, 34); ha(g, 61, 37); for (const p of [[26, 33], [27, 32], [28, 33], [25, 35]]) set(g, p[0], p[1], REU[1]);
  line(g, 38, 31, 34, 21, S2[2], 2.4); line(g, 42, 31, 42, 14, S2[2], 2.6); line(g, 46, 31, 50, 21, S2[2], 2.4); line(g, 42, 22, 46, 18, S2[2], 1.6); line(g, 36, 25, 32, 24, S2[2], 1.6); line(g, 48, 25, 52, 24, S2[2], 1.6); line(g, 42, 30, 42, 16, S2[1], 1);
  for (const p of [[34, 20], [42, 13], [50, 20], [46, 17], [32, 24], [52, 24]]) set(g, p[0], p[1], S2[3]);
  rect(g, 35, 30, 15, 3, '#ffd27a'); rect(g, 35, 30, 15, 1, '#fff0b0'); rect(g, 35, 32, 15, 1, '#a8742a'); set(g, 42, 31, '#22b5a5'); set(g, 37, 31, DO); set(g, 47, 31, DO);
  for (let i = 0; i < 4; i++) line(g, 60 + i * 3, 33, 63 + i * 3, 43 + (i % 2) * 2, '#c9b078', 1); line(g, 60, 36, 72, 37, '#c9b078', 1); line(g, 62, 40, 74, 41, '#c9b078', 1);
  vien(g); bong(g, [[4, 2, 1], [78, 4], [80, 40, 1], [2, 40]]); g.cx = 42; return g; };
Q2.caNocChua = function () { const g = S(80, 74), cx = 40, cy = 45, R = 14.5, c = ['#052f33', '#0c6a66', '#1aa894', '#8ff0d8'];
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + .2, r1 = R + 4.4 + (i % 2) * 1.6, w = .13;
    poly(g, [[cx + Math.cos(a - w) * (R - 1), cy + Math.sin(a - w) * (R - 1)], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a + w) * (R - 1), cy + Math.sin(a + w) * (R - 1)]], B2[1]);
    line(g, cx + Math.cos(a) * (r1 - 2), cy + Math.sin(a) * (r1 - 2), cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, '#ffffff', 1); }
  crystal(g, 27, 33, 35, 26, 21, BANG); crystal(g, 32, 38, 33, 33, 14, BANG); crystal(g, 37, 45, 32, 40.5, 6, BANG); crystal(g, 44, 50, 33, 49, 14, BANG); crystal(g, 49, 55, 35, 56, 21, BANG);
  poly(g, [[cx + R - 1, cy], [cx + R + 8, cy - 7], [cx + R + 5, cy], [cx + R + 8, cy + 7]], S2[2]); line(g, cx + R, cy, cx + R + 7, cy - 5, S2[0], 1); line(g, cx + R, cy, cx + R + 7, cy + 5, S2[0], 1); poly(g, [[cx + R + 6, cy + 2], [cx + R + 9, cy + 3.5], [cx + R + 5, cy + 4.5]], null);
  ball4(g, cx, cy, R, R * .95, c); ell(g, cx, cy + R * .46, R * .76, R * .45, '#e6f4f2'); ell(g, cx, cy + R * .6, R * .55, R * .25, '#ffffff');
  for (const p of [[-.3, -.72], [.2, -.78], [.55, -.5], [-.62, -.42], [0, -.55], [.74, -.15], [-.8, -.1], [.38, -.62], [-.45, -.6], [.82, .1], [-.86, .12]]) rect(g, Math.round(cx + R * p[0]), Math.round(cy + R * p[1]), 2, 1, c[0]);
  ell(g, cx + 8, cy - 10, 3, 1.2, B2[2]); ell(g, cx - 9, cy - 9, 2.2, 1, B2[2]); ell(g, cx - 1, cy - 12, 2.5, .9, B2[3]);
  poly(g, [[cx - R + 1, cy + 2], [cx - R - 6, cy + 8], [cx - R + 3, cy + 8]], S2[2]); line(g, cx - R, cy + 3, cx - R - 4, cy + 7, S2[0], 1); poly(g, [[cx + R - 1, cy + 3], [cx + R + 3, cy + 9], [cx + R - 4, cy + 8]], S2[1]);
  mat(g, cx - 6.5, cy - 3, 4.5, 1, DO); mat(g, cx + 6.5, cy - 3, 4.5, -1, DO);
  line(g, cx + 5, cy - 11, cx + 7, cy - 8, '#ffc8b8', 1); line(g, cx + 9, cy + 1, cx + 11, cy + 5, '#ffc8b8', 1);
  mieng(g, cx - 5, cy + 5, 11, 5); poly(g, [[cx - 5, cy + 5], [cx - 2, cy + 5], [cx - 3.5, cy + 11]], TR); poly(g, [[cx + 3, cy + 5], [cx + 6, cy + 5], [cx + 4.5, cy + 11]], TR);
  line(g, cx - 7, cy + 9, cx - 11, cy + 14, S2[3], 1); line(g, cx + 7, cy + 9, cx + 11, cy + 14, S2[3], 1);
  vien(g); lap(g, [[12, 24], [68, 28], [8, 50], [70, 58], [20, 10], [62, 12]]); for (const p of [[14, 46], [11, 44], [9, 47], [6, 45]]) set(g, p[0], p[1], '#dff6ff');
  g.cx = cx; g.foot = cy + R + 6; return g; };
Q2.cuaDa = function () { const g = S(116, 84), GL = '#5ff0d8', o = 4, D = D3, T = ['#1fa0a0', '#4fd8d0', '#d6fffa'];
  const P = (pts, c) => poly(g, pts.map(p => [p[0], p[1] + o]), c), Ln = (a, b, c2, d, col, t) => line(g, a, b + o, c2, d + o, col, t), C = (a, b, yb, tx, ty, cols) => crystal(g, a, b, yb + o, tx, ty + o, cols);
  C(31, 38, 44, 30, 31, NGOC); C(36, 44, 40, 36, 22, NGOC); C(44, 53, 36, 45, 14, BANG); C(53, 63, 36, 59, 8, T); C(63, 71, 38, 71, 17, BANG); C(71, 78, 42, 79, 26, NGOC); C(49, 55, 36, 52, 26, T);
  P([[36, 58], [26, 62], [22, 72], [29, 72], [32, 65], [40, 63]], D[0]); P([[44, 62], [38, 66], [36, 72], [43, 72], [45, 67]], D[0]); P([[22, 72], [20, 76], [30, 76], [29, 72]], D[1]); P([[36, 72], [35, 76], [44, 76], [43, 72]], D[1]);
  P([[30, 62], [28, 50], [34, 40], [44, 34], [58, 32], [58, 67], [42, 67]], D[2]);
  P([[30, 62], [42, 67], [58, 67], [58, 60], [40, 60], [29, 55]], D[1]); P([[32, 64], [42, 67], [58, 67], [58, 64], [42, 64]], D[0]);
  P([[35, 41], [44, 35.5], [54, 34], [44, 39], [36, 46]], D[3]);
  for (const q of [[40, 44], [36, 50], [44, 42], [33, 56], [50, 38], [47, 60], [38, 58]]) { set(g, q[0], q[1] + o, D[1]); set(g, q[0] + 1, q[1] + o, D[1]); set(g, q[0], q[1] + 1 + o, D[3]); }
  P([[41, 46], [58, 44], [58, 58], [43, 58]], '#0e1220');
  P([[44, 49], [54, 52], [53, 55], [46, 54]], GL); P([[46, 50.5], [52, 52.5], [51, 54], [47, 53.5]], '#d6fffa'); rect(g, 50, 51 + o, 2, 3, OL); Ln(43, 46, 55, 50, D[1], 2.8); Ln(43, 45, 54, 48.5, D[3], 1);
  mirror(g);
  Ln(60, 39, 56, 44, GL, 1); Ln(70, 44, 74, 50, '#0e1220', 1); Ln(74, 50, 72, 55, GL, 1); Ln(38, 44, 35, 50, '#0e1220', 1); Ln(35, 50, 37, 54, GL, 1); Ln(37, 54, 34, 58, GL, 1); Ln(64, 36, 66, 41, '#0e1220', 1); Ln(80, 52, 84, 58, '#0e1220', 1); Ln(58, 32, 58, 38, GL, 1);
  P([[47, 58], [69, 58], [67, 65], [49, 65]], '#2a0a18'); for (let x = 48; x <= 66; x += 4) P([[x, 58], [x + 3, 58], [x + 1.5, 61.5]], '#eef4fb'); for (let x = 50; x <= 64; x += 4) P([[x, 65], [x + 3, 65], [x + 1.5, 62]], '#cfd9e8'); P([[47, 58], [50, 58], [48.5, 64]], '#ffffff'); P([[66, 58], [69, 58], [67.5, 64]], '#ffffff');
  for (const q of [[38, 37], [39, 36], [40, 36], [41, 35], [74, 37], [75, 38], [76, 38], [66, 34]]) set(g, q[0], q[1] + o, REU[1]); set(g, 40, 37 + o, REU[2]); set(g, 75, 39 + o, REU[0]);
  ha(g, 33, 52 + o); ha(g, 76, 46 + o); ha(g, 80, 44 + o); ha(g, 62, 42 + o);
  // mỏ neo gỉ cắm ngược trên lưng, có dây xích
  Ln(83, 46, 87, 31, GI[1], 2.4); Ln(84, 44, 87, 32, GI[2], 1); for (const q of [[79, 36], [80, 32], [83, 29], [88, 28], [92, 30], [94, 34]]) ell(g, q[0], q[1] + o, 1.5, 1.5, GI[1]); P([[77, 37], [79, 33], [81, 38]], GI[0]); P([[92, 35], [95, 31], [96, 37]], GI[0]); set(g, 84, 29 + o, GI[2]); set(g, 89, 28 + o, GI[2]);
  for (let y = 46; y < 60; y += 2) set(g, 84 + ((y >> 1) % 2), y + o, GI[2]);
  // càng trái giơ cao
  Ln(30, 52, 18, 44, D[1], 7); Ln(29, 50, 19, 43, D[2], 2);
  P([[2, 42], [4, 26], [14, 17], [25, 21], [28, 34], [22, 45], [10, 47]], D[2]); P([[4, 40], [14, 37], [25, 37], [22, 45], [10, 47]], D[1]); P([[6, 44], [14, 42], [22, 43], [20, 46], [10, 47]], D[0]); P([[6, 27], [14, 19.5], [22, 22], [13, 26]], D[3]);
  P([[1, 33], [15, 31], [15, 34.5], [2, 37]], null); for (let x = 3; x <= 12; x += 3) { P([[x, 31], [x + 2, 31], [x + 1, 33.5]], '#eef4fb'); P([[x + 1, 37.5], [x + 3, 37], [x + 2, 35]], '#cfd9e8'); }
  P([[2, 28], [-1, 22], [5, 25]], D[3]);
  Ln(18, 26, 21, 33, GL, 1); Ln(21, 33, 19, 36, GL, 1); Ln(9, 28, 11, 24, '#0e1220', 1); set(g, 9, 43 + o, REU[1]); set(g, 10, 42 + o, REU[1]); set(g, 11, 43 + o, REU[2]); ha(g, 23, 30 + o);
  // càng phải chống đất
  Ln(86, 54, 95, 52, D[1], 7);
  P([[88, 64], [86, 46], [94, 37], [107, 39], [113, 52], [108, 68], [94, 70]], D[2]); P([[88, 62], [98, 60], [112, 58], [108, 68], [94, 70]], D[1]); P([[90, 66], [100, 65], [110, 63], [108, 68], [94, 70]], D[0]); P([[89, 46], [95, 39], [105, 40.5], [96, 44]], D[3]);
  P([[99, 52], [116, 50], [116, 54], [100, 56]], null); for (let x = 101; x <= 111; x += 3) { P([[x, 51.6], [x + 2, 51.4], [x + 1, 53.5]], '#eef4fb'); }
  P([[112, 58], [116, 61], [111, 63]], D[3]);
  Ln(92, 48, 96, 56, GL, 1); Ln(96, 56, 94, 60, GL, 1); Ln(94, 60, 97, 64, GL, 1); Ln(104, 44, 107, 48, '#0e1220', 1); ha(g, 101, 42 + o); set(g, 91, 44 + o, REU[1]); set(g, 92, 43 + o, REU[1]);
  vien(g); for (const q of [[30, 14], [84, 20], [100, 28]]) { set(g, q[0], q[1], GL); set(g, q[0], q[1] - 3, '#d6fffa'); } for (const q of [[112, 74], [3, 54], [5, 58]]) rect(g, q[0], q[1], 2, 2, D[1]);
  g.cx = 58; g.foot = 73 + o + 4; return g; };
// ----- từ quai-bien/ban-2/nguon/ngutinh2.js -----
Q2.nguTinh = function (p) { p = p || 1; const g = S(150, 104);
  const B = p === 3 ? ['#3f7fb5', '#9fd4f0', '#ffffff'] : ['#0c2148', '#1f559a', '#5fb0e6'], Bm = p === 3 ? '#74b4dc' : '#163c75', Bl = p === 3 ? '#c4e8fa' : '#2b6cb8';
  const F = p === 3 ? ['#4a96c2', '#b0e2fa', '#ffffff'] : ['#06504e', '#149c8c', '#5fe0c8'], GAI = p === 2 ? ['#a82a2c', '#ff8a66', '#ffe3d0'] : BANG, RIM = p === 3 ? '#ffffff' : '#ff5a46';
  const cat = (a, b, tx, ty) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy), k = 3 / n, d = Math.hypot(tx - mx, ty - my); poly(g, [[mx - dx * k, my - dy * k], [mx + (tx - mx) / d * 10, my + (ty - my) / d * 10], [mx + dx * k, my + dy * k]], null); };
  // vây buồm, rách
  const sail = p === 2 ? [[64, 40], [74, 4], [90, 1], [104, 9], [113, 24], [106, 46]] : [[64, 40], [76, 9], [90, 6], [102, 14], [110, 27], [106, 46]];
  poly(g, sail, F[1]); for (let i = 1; i <= 4; i++) { line(g, 66 + i * 8, 42, sail[i][0], sail[i][1] + 1, F[0], 1); line(g, 68 + i * 8, 40, sail[i][0] + 1, sail[i][1] + 4, F[2], 1); } pl(g, sail.slice(1, 5), RIM, 1.8);
  for (let i = 1; i <= 4; i++) crystal(g, sail[i][0] - 2, sail[i][0] + 2, sail[i][1] + 2, sail[i][0] + (i - 2), sail[i][1] - 5, GAI);
  for (let i = 1; i <= 3; i++) cat(sail[i], sail[i + 1], 86, 44); poly(g, [[92, 24], [95, 22], [96, 27], [93, 29]], null);
  // đuôi rách
  poly(g, [[112, 58], [138, 31], [131, 58], [140, 87]], F[1]); for (const t of [[135, 37], [131, 50], [131, 66], [137, 81]]) line(g, 114, 58, t[0], t[1], F[0], 1); pl(g, [[138, 31], [131, 58], [140, 87]], RIM, 1.6);
  poly(g, [[137, 39], [127, 47], [135, 48]], null); poly(g, [[138, 76], [128, 69], [134, 66]], null); poly(g, [[133, 55], [126, 58], [133, 61]], null);
  poly(g, [[98, 42], [121, 55], [121, 63], [98, 76]], B[0]);
  // cây lao cũ cắm trên lưng, dây thừng
  line(g, 108, 50, 121, 29, '#8a5a34', 1.8); line(g, 109, 48, 120, 30, '#c98a54', 1); pl(g, [[121, 29], [124, 34], [122, 40], [125, 46]], '#c9b078', 1);
  // gai đầu, một cái gãy
  const gs = p === 1 ? [[30, 36, 44, 33, 35], [36, 42, 40, 41, 25], [44, 51, 38, 52, 19], [53, 60, 38, 62, 17], [61, 67, 39, 70, 24]] : [[29, 36, 44, 27, 28], [35, 42, 40, 33, 16], [43, 51, 38, 45, 6], [52, 60, 38, 58, 3], [60, 67, 39, 68, 13]];
  gs.forEach((s, i) => { crystal(g, s[0], s[1], s[2], s[3], s[4], GAI); if (i === 3) { const my = (s[2] + s[4]) / 2 - 1, mx = (s[3] + (s[0] + s[1]) / 2) / 2; poly(g, [[mx - 9, s[4] - 3], [mx + 9, s[4] - 3], [mx + 9, my - 1], [mx + 1, my + 2], [mx - 2, my - 1], [mx - 9, my + 1]], null); } });
  // thân và đầu, bóng 3 lớp
  ell(g, 76, 58, 39, 23.5, B[0]); ell(g, 48, 55, 24.5, 23.5, B[0]); ell(g, 75, 55, 37, 20, B[1]); ell(g, 48, 52, 22.5, 20, B[1]);
  for (let y = 30; y < 80; y++) for (let x = 20; x < 116; x++) if (get(g, x, y) === B[1]) { if (y >= 65 || (y >= 62 && (x + y) % 2)) set(g, x, y, Bm); else if (y <= 41 || (y <= 43 && (x + y) % 2)) set(g, x, y, Bl); }
  ell(g, 52, 36, 10, 2, B[2]); ell(g, 86, 38.5, 13, 2.2, B[2]); ell(g, 76, 72, 30, 6.5, p === 3 ? '#ffffff' : '#cfe8f5'); ell(g, 74, 74, 22, 3.4, '#ffffff');
  for (let y = 45, r = 0; y <= 65; y += 5, r++) for (let x = 69 + (r % 2) * 3; x <= 110; x += 6) { const c0 = get(g, x, y); if ((c0 === B[1] || c0 === Bm) && get(g, x + 2, y) === c0) { set(g, x, y, B[0]); set(g, x + 1, y + 1, B[0]); set(g, x + 2, y, B[0]); set(g, x + 1, y - 1, p === 3 ? '#ffffff' : '#3f86d0'); } }
  // mang
  line(g, 65, 44, 67, 54, B[0], 1.8); line(g, 67, 54, 65, 64, B[0], 1.8); line(g, 62, 47, 63, 54, B[0], 1); line(g, 63, 54, 62, 61, B[0], 1); if (p === 2) { line(g, 68, 46, 70, 54, '#ff5a46', 1.6); line(g, 70, 54, 68, 62, '#ff5a46', 1.6); } else line(g, 68, 47, 69, 60, Bl, 1);
  // sẹo cào bên sườn
  for (let k = 0; k < 3; k++) { line(g, 80 + k * 5, 46 + k, 86 + k * 5, 59 + k, p === 3 ? '#5a9cc8' : '#8fc8f0', 1); line(g, 81 + k * 5, 46 + k, 87 + k * 5, 59 + k, B[0], 1); }
  // hà bám và rêu
  ha(g, 58, 44); ha(g, 61, 46); ha(g, 97, 44); ha(g, 104, 60); ha(g, 30, 50); ha(g, 72, 66);
  if (p !== 3) for (const q of [[73, 37], [74, 36], [75, 36], [76, 37], [78, 37], [100, 43], [101, 42]]) set(g, q[0], q[1], REU[1]);
  // hàm dưới, miệng
  poly(g, [[20, 68], [22, 81], [36, 87], [56, 84], [66, 73], [62, 67], [50, 76], [32, 77]], B[0]); poly(g, [[24, 77], [36, 82], [54, 80], [60, 73], [50, 78], [32, 79]], Bm); line(g, 26, 80, 36, 84, B[1], 1);
  if (p === 3) for (const x of [28, 38, 47]) poly(g, [[x, 85], [x + 3, 85.5], [x + 1.5, 91]], BANG[1]);
  poly(g, [[25, 58], [40, 55], [60, 60], [62, 68], [50, 76], [32, 77], [24, 70]], '#3a0a20'); ell(g, 49, 66, 8.5, 5, '#16040f'); ell(g, 42, 73, 7, 2.2, '#e0523c'); ell(g, 41, 72.6, 4, 1, '#ff8a6a');
  // răng lởm chởm, hai hàng
  const LT = [13, 6, 10, 5, 11, 7, 9, 5], LB = [11, 5, 8, 6, 9, 5, 7];
  LT.forEach((L, i) => { const x = 25 + i * 4.6, by = 56 + i * .6; poly(g, [[x, by], [x + 4.2, by], [x + 2.1 + (i % 3 - 1) * .6, by + L]], '#ffffff'); line(g, x + 3, by + 1, x + 2.4, by + L * .6, '#bfdcee', 1); });
  LB.forEach((L, i) => { const x = 26 + i * 5, by = 79.5 - i * .6; poly(g, [[x, by], [x + 4, by], [x + 2 + (i % 2 - .5), by - L]], '#ffffff'); line(g, x + 3, by - 1, x + 2.4, by - L * .6, '#bfdcee', 1); });
  line(g, 25, 56, 60, 60, B[0], 1.6); rect(g, 28, 47, 2, 2, OL); rect(g, 32, 46, 2, 1, OL);
  // mắt sâu rực sáng
  ell(g, 46, 43.5, 8.2, 7.6, '#060a1c');
  if (p === 3) { ell(g, 46, 44, 6, 5.4, '#ffd84a'); ell(g, 46, 44, 4.4, 4, '#fff6a8'); ell(g, 46, 44, 2.4, 2.4, '#ffffff'); }
  else { ell(g, 45.5, 44.5, 5.6, 5, p === 2 ? '#ff2a20' : '#ff8a1e'); ell(g, 45.5, 44.5, 3.8, 3.4, p === 2 ? '#ff8a5a' : '#ffe45c'); ell(g, 45, 44.5, 1.1, 3, OL); rect(g, 42, 42, 2, 2, '#ffffff'); }
  poly(g, [[33, 39], [55, 29], [59, 35], [38, 44]], B[0]); line(g, 35, 39, 55, 30, Bl, 1); poly(g, [[52, 31], [55, 24], [57, 31]], B[0]);
  line(g, 51, 27, 53, 33, '#bfe0f5', 1); line(g, 55, 46, 57, 53, '#bfe0f5', 1); set(g, 52, 28, B[0]);
  if (p === 2) { ell(g, 58, 62, 4.5, 2.2, '#ff7a5c'); pl(g, [[60, 24], [63, 27], [60, 29]], '#ff5a46', 1); for (const q of [[[72, 44], [76, 50], [73, 56]], [[94, 46], [98, 52], [95, 58]], [[40, 34], [44, 37]]]) pl(g, q, '#ff5a46', 1); }
  // vây ngực rách
  poly(g, [[66, 66], [92, 80], [86, 92], [70, 88], [60, 75]], F[1]); line(g, 66, 66, 92, 80, B[0], 1.8); for (const t of [[85, 89], [75, 87], [64, 77]]) { line(g, 67, 68, t[0], t[1], F[0], 1); line(g, 68, 68, t[0] + 1, t[1] - 1, F[2], 1); } pl(g, [[92, 80], [86, 92], [70, 88]], RIM, 1.2);
  poly(g, [[90, 86], [80, 82], [83, 91]], null); poly(g, [[79, 91], [74, 84], [72, 90]], null);
  // râu dài
  const R = p === 3 ? ['#dff6ff', '#ffffff'] : ['#ff9a70', '#ffe3d0'];
  const r1 = p === 2 ? [[29, 56], [19, 49], [13, 39], [15, 29], [22, 25]] : [[29, 56], [20, 52], [13, 56], [10, 66], [13, 75]], r2 = p === 2 ? [[33, 82], [22, 80], [13, 71], [11, 60]] : [[33, 82], [26, 88], [18, 88], [13, 82]];
  pl(g, r1, R[0], 2.4); pl(g, r2, R[0], 2.4); pl(g, r1.slice(1), R[1], 1); set(g, r1[4][0], r1[4][1], R[1]); set(g, r2[3][0], r2[3][1], R[1]);
  pl(g, p === 2 ? [[27, 60], [20, 60], [16, 54]] : [[27, 60], [21, 63], [19, 70]], R[0], 1.4);
  if (p === 3) { ell(g, 86, 48, 8, 2.6, '#ffffff'); ell(g, 100, 62, 5, 2, '#ffffff'); ell(g, 58, 47, 4, 1.6, '#ffffff'); crystal(g, 78, 86, 37, 85, 20, BANG); crystal(g, 94, 101, 40, 103, 26, BANG); crystal(g, 104, 110, 46, 113, 36, BANG);
    poly(g, [[55, 85], [59, 85], [57, 93]], BANG[1]); poly(g, [[76, 88], [80, 88], [78, 96]], BANG[1]); poly(g, [[92, 84], [96, 84], [94, 91]], BANG[1]); }
  vien(g);
  if (p !== 3 || true) { const ec = p === 3 ? '#fff6a8' : p === 2 ? '#ff7a5c' : '#ffb04a'; for (let k = 0; k < (p === 1 ? 0 : 6); k++) { const a = k / 6 * 6.283 + .5; line(g, 46 + Math.cos(a) * 10.5, 44 + Math.sin(a) * 10, 46 + Math.cos(a) * 14, 44 + Math.sin(a) * 13.5, ec, 1); } }
  if (p === 3) {
    for (let x = 0; x < g.w; x++) for (let y = 95; y < g.h; y++) set(g, x, y, y === 95 ? '#ffffff' : y < 98 ? '#c8ecfa' : '#8fc4e0');
    for (const s of [[3, 12, 96, 8, 72], [14, 21, 96, 19, 84], [128, 137, 96, 134, 68], [138, 146, 96, 143, 82], [112, 118, 96, 114, 87], [22, 27, 96, 26, 89]]) crystal(g, s[0], s[1], s[2], s[3], s[4], BANG);
    lap(g, [[20, 20], [120, 16], [140, 50], [8, 40], [100, 30], [130, 8]]); }
  else if (p === 2) { nuoc(g, 82, 3, 1); for (const q of [[8, 70], [16, 62], [142, 68], [126, 72], [30, 88], [100, 87], [4, 56], [146, 58]]) { rect(g, q[0], q[1] - 12, 2, 3, '#6fd0ee'); set(g, q[0], q[1] - 13, '#eafaff'); } }
  else { nuoc(g, 91, 1.6, 0); bong(g, [[10, 46, 1], [6, 38], [14, 30, 1], [144, 40], [140, 24, 1]]); }
  g.cx = 75; g.foot = g.h; return g; };
// ----- từ quai-ban-chot/nguon/chung.js -----
const LUCR = ['#123a1c', '#22692c', '#46a83c', '#b4ec6c'], NAUG = ['#2e1a10', '#5c3a1e', '#96643a', '#d8a870'], TIMD = ['#2a0e44', '#58208c', '#9a48d4', '#e4a8ff'], DOCX = ['#3c5a0c', '#78b818', '#c4f43c', '#f4ffb0'];
const DOCAM = ['#5a0e0c', '#b0261a', '#f0582a', '#ffb070'], LUAV = ['#c43c10', '#ff8a1e', '#ffd23c', '#fff6b0'], THANH = ['#0e0c12', '#26222c', '#48424e', '#8a8290'], XUONGT = ['#6a5c48', '#b0a488', '#e8e0c4', '#fffbe8'];
// ----- từ quai-ban-chot/nguon/rung.js -----
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
// ----- từ quai-ban-chot/nguon/laudai.js -----
const LD_GI = ['#3a1a10', '#6e3418', '#a85a26', '#e09a4c'], LD_DA = ['#2c2830', '#57505a', '#8a8288', '#cbc3c0'], LD_MA = ['#2a0c18', '#5c1a22', '#9a3428', '#e07048'], LD_GOM = ['#2a1210', '#5c2418', '#96402a', '#d8805a'];
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
  line(g, 30, 19, 35, 18, LD_GI[1], 2.4); ell(g, 36, 18.5, 1.8, 1.8, LD_MA[3]);
  ball4(g, 24.5, 22, 7, 5.6, LD_GI);
  line(g, 18, 21, 30, 20, LD_GI[0], 1); line(g, 19, 24, 30, 23, LD_GI[0], 1); line(g, 24, 17, 24, 26, LD_GI[0], 1);
  LD_dom(g, [[20, 19, LD_GI[3]], [27, 18, LD_GI[3]], [21, 22, LD_GI[3]], [28, 22, LD_GI[3]], [22, 25, DOCAM[2]], [29, 25, DOCAM[1]], [26, 21, DOCAM[2]], [19, 23, THANH[1]], [27, 25, THANH[1]]]);
  ball4(g, 30, 17.5, 3.6, 3, LD_GI); poly(g, [[31, 15], [35, 12], [33, 17]], LD_GI[2]);
  line(g, 20, 21, 14, 24, LD_GI[1], 2.4); ell(g, 13.5, 24.5, 2, 2, LD_MA[3]); set(g, 12, 23, TR); set(g, 12, 26, TR);
  ell(g, 18.5, 15.5, 5.4, 4.3, THANH[0]); ell(g, 18, 15.5, 4.2, 3.2, THANH[1]); ell(g, 18, 18.5, 4, 2.6, THANH[1]); mieng(g, 15, 19, 6, 2);
  mat(g, 15.6, 16, 2.5, 1, LUAV[2]); mat(g, 21.4, 16, 2.5, -1, LUAV[2]);
  poly(g, [[6, 13.5], [18.5, 4.5], [32, 13.5]], LD_GI[2]); poly(g, [[18.5, 4.5], [32, 13.5], [21, 13.5]], LD_GI[1]);
  line(g, 17, 6, 9, 12, LD_GI[3], 1); rect(g, 7, 13, 25, 1, LD_GI[0]); set(g, 18, 5, LUAV[2]);
  LD_dom(g, [[14, 10, DOCAM[1]], [22, 9, LD_GI[0]], [25, 11, LD_GI[0]], [27, 12, DOCAM[2]], [12, 12, LD_GI[1]]]); set(g, 28, 12, null); set(g, 29, 12, null); set(g, 28, 11, null);
  vien(g); LD_dom(g, [[15, 16, LUAV[3]], [16, 16, LUAV[2]], [21, 16, LUAV[2]], [22, 16, LUAV[3]], [15, 17, LUAV[1]], [22, 17, LUAV[1]], [13, 15, LUAV[1]], [24, 15, LUAV[1]]]);
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
  ell(g, 13, 18.5, 6, 4.6, T[1]); ell(g, 12, 17.5, 4, 2.6, T[2]); poly(g, [[18, 19], [21, 22], [17, 22]], T[1]); poly(g, [[7, 20], [4, 23], [9, 22]], T[1]);
  mat(g, 10.3, 18.5, 2.5, 1, LUAV[2]); mat(g, 15.7, 18.5, 2.5, -1, LUAV[2]);
  rect(g, 10, 21, 6, 2, MAU); set(g, 10, 21, TR); set(g, 10, 22, TR); set(g, 15, 21, TR); set(g, 15, 22, TR); set(g, 12, 21, TR); set(g, 13, 22, DOCAM[2]); set(g, 12, 20, LD_HONGT);
  line(g, 8, 21, 4, 19, T[3], 1); line(g, 17, 21, 22, 19, T[3], 1); line(g, 7, 15, 9, 20, DOCAM[2], 1);
  LD_ria(g, LD_HONGT); vien(g);
  LD_lua(g, 46, 12, 1.8); LD_lua(g, 54, 14, 2); LD_dom(g, [[50, 8, LUAV[1]], [58, 9, DOCAM[2]], [42, 9, LUAV[0]]]);
  for (const r of [[49, 26, 8], [51, 29, 10], [48, 32, 6], [56, 23, 5]]) { rect(g, r[0], r[1], r[2], 1, DOCAM[2]); set(g, r[0], r[1], LUAV[1]); }
  g.cx = 27; return g; };
// Hũ Lửa Sống: puff là lúc phồng to sắp nổ
QL.hu = function (puff) { const g = S(68, 66), cx = 34, cy = 38, R = puff ? 15 : 9.6, C = puff ? ['#5a0e0c', '#b0261a', '#f0582a', '#ffc08a'] : LD_GOM, ry = R * .95;
  for (const s of [-1, 1]) { rect(g, Math.round(cx + s * R * .5 - 1.5), Math.round(cy + ry - 1), 3, 4, LD_GOM[1]); rect(g, Math.round(cx + s * R * .5 - 1.5 + (s < 0 ? -1 : 1)), Math.round(cy + ry + 2), 3, 1, LD_GOM[2]);
    ell(g, cx + s * (R + 1.2), cy - R * .3, 2.8, 3.6, C[1]); ell(g, cx + s * (R + 1.6), cy - R * .3, 1.2, 1.9, null); }
  rect(g, Math.round(cx - R * .5), Math.round(cy - ry - 3), Math.round(R), 5, C[1]); rect(g, Math.round(cx - R * .5), Math.round(cy - ry - 3), 2, 4, C[2]);
  ball4(g, cx, cy, R, ry, C);
  ell(g, cx, cy - ry - 3, R * .66, 1.7, C[2]); ell(g, cx, cy - ry - 3.3, R * .46, .9, puff ? LUAV[2] : MAU); rect(g, Math.round(cx - R * .6), Math.round(cy - ry - 4), 3, 1, C[3]);
  for (let x = -Math.round(R * .78); x <= R * .78; x++) { const q = Math.sqrt(1 - (x / R) ** 2), yy = cy - ry * .55 * q - ry * .12; set(g, cx + x, Math.round(yy + (Math.abs(x) % 4 < 2 ? 0 : 1)), puff ? LUAV[1] : NAUG[2]); if (Math.abs(x) % 4 === 0) set(g, cx + x, Math.round(yy) + 2, C[0]); }
  for (const p of [[-.5, .62], [.3, .7], [.62, .4], [-.72, .3], [0, .82], [.75, -.05]]) rect(g, Math.round(cx + R * p[0]), Math.round(cy + ry * p[1]), puff ? 2 : 1, 1, C[0]);
  const er = puff ? 3.9 : 3.2, ex = puff ? 6.5 : 4.4, ic = puff ? LUAV[3] : LUAV[2], ey = cy - R * .12; mat(g, cx - ex, ey, er, 1, ic); mat(g, cx + ex, ey, er, -1, ic);
  if (puff) { mieng(g, cx - 5, cy + 5, 11, 4); rect(g, cx - 3, cy + 6, 7, 2, LUAV[1]); rect(g, cx - 1, cy + 6, 3, 2, LUAV[3]);
    for (const k of [[[-12, -5], [-9, -1], [-11, 3], [-8, 7]], [[9, -9], [12, -4], [10, 0], [13, 4]], [[-3, -13], [0, -9], [-2, -6]], [[4, 9], [7, 12], [5, 14]], [[-9, 9], [-6, 12]]]) { pl(g, k.map(p => [cx + p[0], cy + p[1]]), LUAV[2], 1); set(g, cx + k[1][0], cy + k[1][1], LUAV[3]); }
    set(g, cx - 13, cy - 5, DOCAM[3]); set(g, cx + 14, cy + 4, DOCAM[3]); }
  else { mieng(g, cx - 3, cy + 3, 7, 3); set(g, cx, cy + 4, LUAV[1]); pl(g, [[cx + 3, cy - 8], [cx + 6, cy - 5], [cx + 5, cy - 2]], DOCAM[2], 1); set(g, cx + 6, cy - 5, LUAV[2]); pl(g, [[cx - 7, cy + 2], [cx - 5, cy + 5], [cx - 6, cy + 7]], DOCAM[2], 1); set(g, cx - 5, cy + 5, LUAV[1]); }
  rect(g, Math.round(cx - R * .5), Math.round(cy - ry), Math.round(R), 1, NAUG[2]); set(g, Math.round(cx + R * .3), Math.round(cy - ry) + 1, NAUG[2]); set(g, Math.round(cx + R * .3) + 1, Math.round(cy - ry) + 2, NAUG[3]);
  vien(g);
  if (puff) { LD_lua(g, cx - 6, cy - ry - 3, 2.2); LD_lua(g, cx + 5, cy - ry - 3, 2.4); LD_lua(g, cx - 1, cy - ry - 3, 3.6); LD_lua(g, cx - 17, cy - 2, 1.8); LD_lua(g, cx + 17, cy + 7, 1.8); LD_lua(g, cx - 11, cy - 11, 1.5);
    LD_tia(g, [[6, 14], [61, 12], [4, 44], [63, 46], [14, 6], [56, 28], [50, 5]]); LD_dom(g, [[10, 26, LUAV[0]], [58, 36, DOCAM[2]], [24, 8, LUAV[1]], [44, 10, LUAV[0]]]); }
  else { LD_lua(g, cx - 1, cy - ry - 3, 1.5); LD_dom(g, [[cx + 4, cy - ry - 6, LUAV[1]], [cx - 5, cy - ry - 5, DOCAM[2]], [cx + 12, cy - 12, LUAV[0]], [cx - 13, cy - 9, DOCAM[2]]]); }
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
  line(g, 10, 40, 13.5, 13, NAUG[1], 2); line(g, 10, 39, 13, 14, NAUG[2], 1); poly(g, [[8.5, 40], [10.5, 43.5], [12.5, 40]], XUONGT[1]); rect(g, 9, 39, 4, 1, LUAV[1]);
  poly(g, [[10.5, 17], [8, 13], [7, 8], [9.5, 4.5], [15.5, 3], [17, 7], [21, 6], [18.5, 10], [16.5, 12], [16.5, 17]], XUONGT[2]); pl(g, [[10, 16], [8, 13], [7, 8], [9, 5], [14, 3]], XUONGT[3], 1); pl(g, [[11, 15], [9, 12], [8, 8]], XUONGT[3], 1); pl(g, [[15, 4], [16, 7], [16, 16]], XUONGT[1], 1); line(g, 17, 8, 19, 7, XUONGT[1], 1); line(g, 13, 15, 13, 7, XUONGT[1], 1); set(g, 15, 10, XUONGT[0]); set(g, 11, 6, D[2]); set(g, 10, 9, D[2]); set(g, 8, 6, LUAV[1]);
  rect(g, 9, 17, 9, 2, LUAV[1]); rect(g, 9, 17, 9, 1, LUAV[2]); set(g, 13, 18, D[2]); line(g, 9, 19, 7, 23, D[2], 1); set(g, 7, 24, D[1]); set(g, 8, 24, D[2]);
  for (let i = 0; i < 6; i++) { const x = 19 + i * 4, h = 5 + (i % 2); rect(g, x, 32, 4, h, LD_GI[1 + (i % 2)]); rect(g, x, 32, 1, h, LD_GI[0]); set(g, x + 2, 32 + h - 1, LUAV[1]); set(g, x + 1, 33, LD_GI[3]); }
  poly(g, [[20, 20], [41, 20], [42, 32], [19, 32]], LD_GI[1]);
  for (let r = 0; r < 5; r++) { const y = 21 + r * 2, off = (r % 2) * 2; for (let x = 20; x <= 41; x++) { const m = (x + off) % 4; set(g, x, y, m === 0 ? LD_GI[0] : m === 2 ? LD_GI[3] : LD_GI[2]); set(g, x, y + 1, m === 1 || m === 3 ? LD_GI[0] : LD_GI[1]); } }
  ball4(g, 30.5, 25, 3.4, 3.2, [LUAV[0], LUAV[1], LUAV[2], LUAV[3]]); set(g, 30, 25, D[1]); set(g, 31, 26, D[1]);
  rect(g, 19, 30, 24, 2, LUAV[1]); rect(g, 19, 30, 24, 1, LUAV[2]); rect(g, 28, 29, 6, 4, LD_GI[0]); rect(g, 29, 30, 4, 2, D[2]); set(g, 29, 30, LUAV[3]); set(g, 32, 30, LUAV[3]); set(g, 23, 31, D[1]); set(g, 38, 31, D[1]);
  line(g, 43, 24, 46, 30, LD_GI[1], 3.2); ell(g, 46.5, 31.5, 2.5, 2.5, LD_GI[2]); set(g, 46, 31, LD_GI[3]); set(g, 45, 34, TR); set(g, 47, 34, TR);
  ball4(g, 42, 21.5, 5, 4, LD_GI); poly(g, [[43, 18.5], [48, 13], [46.5, 20]], XUONGT[2]); rect(g, 38, 24, 9, 1, LUAV[1]);
  line(g, 18, 24, 13, 28, LD_GI[1], 3.2); ell(g, 12, 28.5, 2.8, 2.6, LD_GI[2]); LD_dom(g, [[10, 27, TR], [10, 29, TR], [11, 28, LD_GI[3]], [16, 25, LD_GI[3]]]);
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
// ----- từ quai-ban-chot/nguon/trum.js -----
const QT = {};
const TM_GO = '#e8cf9a', TM_HOC = '#0c0610';
function TM_h(x, y) { return (((x * 73856093) ^ (y * 19349663)) >>> 0); }
// chỉ tô vào ô còn trống (khói, khí độc sau viền)
function TM_khi(g, cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1 && x >= 0 && y >= 0 && x < g.w && y < g.h && !g.d[y * g.w + x]) g.d[y * g.w + x] = c; } }
// tô hình chỉ lên những ô đang có màu trong danh sách
function TM_phu(g, on, fn) { const t = S(g.w, g.h); fn(t); for (let i = 0; i < t.d.length; i++) if (t.d[i] && on.indexOf(g.d[i]) >= 0) g.d[i] = t.d[i]; }
// cành hoặc rễ thuôn dần, có vuốt ở đầu
function TM_canh(g, pts, t0, t1, c, vuot, vl) { const n = pts.length - 1;
  for (let i = 0; i < n; i++) { const t = t0 + (t1 - t0) * i / n; line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c[1], t); }
  for (let i = 0; i < n; i++) { const t = t0 + (t1 - t0) * i / n; line(g, pts[i][0] - 1, pts[i][1] - t * .3, pts[i + 1][0] - 1, pts[i + 1][1] - t * .3, c[2], 1); line(g, pts[i][0] + 1, pts[i][1] + t * .35, pts[i + 1][0] + 1, pts[i + 1][1] + t * .35, c[0], 1); }
  const a = pts[n - 1], b = pts[n], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  if (vuot) for (const da of (vuot === 1 ? [0] : [-.75, 0, .75])) { const L = (vl || 10) * (da ? .85 : 1), ex = b[0] + Math.cos(ang + da) * L, ey = b[1] + Math.sin(ang + da) * L, mx = b[0] + Math.cos(ang + da * 1.6) * L * .5, my = b[1] + Math.sin(ang + da * 1.6) * L * .5;
    line(g, b[0], b[1], mx, my, c[1], 2.6); line(g, mx, my, ex, ey, c[0], 1.8); line(g, (mx + ex) / 2, (my + ey) / 2, ex, ey, TM_GO, 1); set(g, ex, ey, '#fffbe8'); } }
function TM_nam(g, x, y, r, c) { c = c || TIMD; rect(g, x - 1, y, 2, Math.max(2, Math.round(r * .8)), XUONGT[1]); set(g, x, y, XUONGT[2]);
  for (let j = 0; j <= r; j++) { const w = Math.round(r * Math.sqrt(1 - (j / (r + .5)) * (j / (r + .5)))); rect(g, x - w, y - 1 - j, w * 2, 1, j === 0 ? c[0] : j > r * .5 ? c[2] : c[1]); }
  set(g, x - Math.round(r * .5), y - Math.round(r * .6) - 1, c[3]); set(g, x + Math.round(r * .4), y - 2, DOCX[2]); }
function TM_bua(g, x, y, ng) { const P = (dx, dy) => [x + dx + (ng || 0) * dy * .5, y + dy - (ng || 0) * dx * .4];
  poly(g, [P(0, 0), P(5, 0), P(5, 10), P(0, 10)], '#f0cc3c'); line(g, P(0, 0)[0], P(0, 0)[1], P(0, 9)[0], P(0, 9)[1], '#fff2a8', 1); line(g, P(4, 1)[0], P(4, 1)[1], P(4, 9)[0], P(4, 9)[1], '#b8922a', 1);
  for (const q of [[2, 1], [1, 2], [3, 2], [2, 3], [2, 4], [1, 5], [3, 6], [2, 7], [1, 8], [3, 8]]) { const z = P(q[0], q[1]); set(g, z[0], z[1], '#d01c1c'); } }

// TRÙM VÙNG Rừng già: Mộc Tinh. p = 1 đứng lặng, 2 nổi giận, 3 hóa độc.
QT.mocTinh = function (p) { p = p || 1; const g = S(164, 142), o = 2, mx = x => 160 - x;
  const L = p === 3 ? ['#220a3a', '#4a1a78', '#8a3cc4', '#d894ff'] : p === 2 ? ['#0e3018', '#1c5c28', '#3c9a34', '#a8e060'] : LUCR, N = NAUG;
  const EY = p === 1 ? ['#5a8a10', '#d8f43c', '#ffffc0'] : p === 2 ? ['#8a0e10', '#ff3020', '#ffc080'] : ['#4a1880', '#d060ff', '#ffe8ff'];
  const GL = p === 2 ? '#ff5a2a' : p === 3 ? '#c860ff' : null;
  const X = pts => pts.map(q => [q[0] + o, q[1]]), MX = pts => pts.map(q => [mx(q[0]) + o, q[1]]);
  // tán lá sau
  const tan = [[80, 28, 33, 18], [47, 34, 25, 15], [113, 34, 25, 15], [29, 44, 14, 10], [131, 44, 14, 10], [61, 22, 19, 11], [99, 22, 19, 11], [80, 42, 37, 10]];
  const xu = 4;
  tan.forEach((b, bi) => { const n = 11; for (let k = 0; k < n; k++) { const a = Math.PI * (1.02 + k / (n - 1) * .96) + (bi % 2) * .1, len = xu * (.6 + (TM_h(k + 3, bi + 7) % 5) / 6) * (p === 2 ? 1 + Math.abs(Math.cos(a)) * 1.3 : 1); const bx = b[0] + o + Math.cos(a) * b[2] * .9, by = b[1] + Math.sin(a) * b[3] * .9, tx = b[0] + o + Math.cos(a) * (b[2] + len), ty = b[1] + Math.sin(a) * (b[3] + len);
    poly(g, [[bx - Math.sin(a) * 3, by + Math.cos(a) * 3], [tx, ty], [bx + Math.sin(a) * 3, by - Math.cos(a) * 3]], k % 2 ? L[1] : L[0]); } });
  for (const b of tan) ell(g, b[0] + o, b[1] + 2, b[2], b[3], L[0]);
  for (const b of tan) ell(g, b[0] + o, b[1], b[2] - 1, b[3] - 1.5, L[1]);
  for (const b of tan) ell(g, b[0] + o - b[2] * .1, b[1] - b[3] * .2, b[2] * .74, b[3] * .64, L[2]);
  // cụm lá: vòng cung tối và điểm sáng
  for (let y = 0; y < 60; y++) for (let x = 0; x < g.w; x++) { const c0 = get(g, x, y), h = TM_h(x, y);
    if (c0 === L[2]) { if (h % 23 === 0) { set(g, x, y, L[3]); set(g, x + 1, y, L[3]); set(g, x, y + 1, L[3]); } else if (h % 11 === 1) { set(g, x, y, L[1]); set(g, x + 1, y + 1, L[1]); set(g, x - 1, y + 1, L[1]); } }
    else if (c0 === L[1]) { if (h % 13 === 0) { set(g, x, y, L[0]); set(g, x + 1, y + 1, L[0]); } else if (h % 29 === 3) set(g, x, y, L[2]); } }
  for (const q of [[58, 25, 9], [84, 18, 10], [104, 28, 9], [40, 34, 8], [122, 36, 8], [76, 34, 10]]) for (let a = 3.5; a < 6; a += .12) set(g, q[0] + o + Math.cos(a) * q[2], q[1] + Math.sin(a) * q[2] * .6, L[3]);
  if (p === 3) for (const q of [[52, 26], [90, 20], [112, 30], [70, 16], [30, 42], [128, 44], [78, 36]]) { ell(g, q[0] + o, q[1], 2.2, 1.8, DOCX[1]); set(g, q[0] + o - 1, q[1] - 1, DOCX[3]); }
  // tay cành
  const tayT = p === 1 ? [[62, 66], [44, 59], [30, 64], [23, 78]] : p === 2 ? [[62, 66], [43, 58], [29, 46], [22, 31]] : [[62, 66], [44, 58], [30, 57], [20, 66]];
  const tayP = p === 1 ? [[98, 64], [117, 58], [131, 65], [137, 80]] : p === 2 ? [[98, 64], [118, 57], [132, 44], [139, 29]] : [[98, 64], [116, 55], [131, 55], [141, 64]];
  TM_canh(g, X(tayT), 9, 5, N, 3, 12); TM_canh(g, X(tayP), 9, 5, N, 3, 12);
  // nhánh con trên tay
  for (const t of [tayT, tayP]) { const e = t[1], s = t === tayT ? -1 : 1; line(g, e[0] + o, e[1] - 2, e[0] + o + s * 5, e[1] - 10, N[1], 1.8); line(g, e[0] + o + s * 5, e[1] - 10, e[0] + o + s * 3, e[1] - 15, N[0], 1); ell(g, e[0] + o + s * 6, e[1] - 12, 2.5, 1.6, L[2]); set(g, e[0] + o + s * 6, e[1] - 13, L[3]);
    const m = t[2]; for (const q of [[-2, -3], [-1, -4], [0, -4], [1, -3], [2, -4]]) set(g, m[0] + o + q[0], m[1] + q[1], REU[1]); set(g, m[0] + o, m[1] - 5, REU[2]); }
  // rễ như vuốt bấu đất
  const reT = p === 2 ? [[56, 116], [38, 119], [24, 116], [17, 105]] : [[56, 116], [38, 117], [24, 123], [18, 127]];
  TM_canh(g, X(reT), 10, 5, N, 1, 7); TM_canh(g, MX(reT), 10, 5, N, 1, 7);
  TM_canh(g, X([[60, 121], [46, 124], [38, 128]]), 8, 4, N, 1, 5); TM_canh(g, MX([[60, 121], [46, 124], [38, 128]]), 8, 4, N, 1, 5);
  if (p === 2) { TM_canh(g, X([[52, 122], [36, 127], [29, 121]]), 6, 3, N, 1, 6); TM_canh(g, MX([[52, 122], [36, 127], [31, 120]]), 6, 3, N, 1, 6); }
  // thân xù xì
  poly(g, X([[61, 46], [99, 46], [101, 74], [104, 104], [111, 127], [49, 127], [56, 104], [59, 74]]), N[1]);
  poly(g, X([[61, 46], [70, 46], [68, 74], [66, 104], [62, 127], [49, 127], [56, 104], [59, 74]]), N[2]);
  poly(g, X([[91, 46], [99, 46], [101, 74], [104, 104], [111, 127], [100, 127], [96, 104], [93, 74]]), N[0]);
  for (let y = 48; y < 127; y++) for (const q of [[63, 3, N[3]], [67, 5, N[1]], [72, 7, N[0]], [77, 4, N[0]], [84, 6, N[0]], [88, 3, N[2]], [94, 5, N[1]], [98, 7, '#1c0e08']]) { const h = TM_h(q[0], Math.floor(y / q[1])); if (h % 4 !== 0) set(g, q[0] + o + Math.round(Math.sin(y * .21 + q[0]) * 1.4) + (y > 104 ? Math.round((q[0] - 80) * (y - 104) / 90) : 0), y, q[2]); }
  TM_canh(g, X([[72, 123], [69, 128]]), 6, 3, N, 1, 4); TM_canh(g, X([[89, 123], [93, 128]]), 6, 3, N, 1, 4);
  // u gỗ, mắt gỗ
  ball4(g, 63 + o, 58, 4, 3.4, N); ell(g, 63 + o, 58, 1.6, 1.2, N[0]); ball4(g, 97 + o, 112, 4.4, 3.6, [N[0], N[0], N[1], N[2]]); ell(g, 97 + o, 112, 1.6, 1.2, '#1c0e08');
  // sẹo rìu chém
  for (const q of [[60, 108, 68, 113], [61, 113, 67, 117], [90, 54, 96, 58], [86, 118, 92, 115]]) { line(g, q[0] + o, q[1], q[2] + o, q[3], '#1c0e08', 1.8); line(g, q[0] + o, q[1] - 1, q[2] + o, q[3] - 1, N[3], 1); }
  // tán lá trước che đầu thân, dây leo
  ell(g, 80 + o, 46, 27, 7, L[0]); ell(g, 79 + o, 44, 25, 6, L[1]); ell(g, 76 + o, 42, 18, 3.6, L[2]);
  for (let x = 54; x < 108; x += 3) { const h = TM_h(x, 5); poly(g, [[x + o - 2, 49], [x + o + 2, 49], [x + o + (h % 3) - 1, 52 + h % 4]], h % 2 ? L[1] : L[0]); }
  for (let y = 38; y < 50; y++) for (let x = 54; x < 108; x++) { const c0 = get(g, x, y), h = TM_h(x, y); if (c0 === L[2] && h % 9 === 0) set(g, x, y, L[3]); else if (c0 === L[1] && h % 7 === 0) set(g, x, y, L[0]); }
  const dayC = p === 3 ? [TIMD[1], TIMD[2]] : [LUCR[1], LUCR[2]];
  for (const v of [[23, 50, 12], [31, 52, 20], [43, 47, 26], [53, 50, 13], [107, 50, 15], [118, 47, 27], [129, 52, 18], [138, 50, 11], [68, 50, 8], [93, 50, 10]]) { const dir = v[0] < 80 ? -1 : 1, sl = p === 2 ? dir * .45 : 0;
    for (let i = 0; i < v[2]; i++) { const x = v[0] + o + Math.round(Math.sin(i * .7 + v[0]) * 1.1 + i * sl), y = v[1] + i; set(g, x, y, dayC[0]); if (i % 4 === 2) { set(g, x + (i % 8 === 2 ? 1 : -1), y, dayC[1]); set(g, x + (i % 8 === 2 ? 2 : -2), y + 1, dayC[1]); } if (i === v[2] - 1) { set(g, x, y + 1, dayC[1]); if (p === 3) set(g, x, y + 2, DOCX[2]); } } }
  // bùa cũ: p1 dán trán và treo cành; p2 bung ra bay; p3 rách sạm
  if (p !== 2) { for (const q of [[35, 62], [121, 64]]) { line(g, q[0] + o + 2, q[1] - 10, q[0] + o + 2, q[1], '#b02020', 1); TM_bua(g, q[0] + o, q[1], 0); if (p === 3) { poly(g, [[q[0] + o, q[1] + 7], [q[0] + o + 6, q[1] + 5], [q[0] + o + 6, q[1] + 11], [q[0] + o, q[1] + 11]], null); set(g, q[0] + o + 1, q[1] + 6, '#5a3a10'); set(g, q[0] + o + 3, q[1] + 5, '#5a3a10'); } } }
  if (p === 1) TM_bua(g, 77 + o, 52, 0); else { rect(g, 77 + o, 52, 5, 3, '#b8922a'); set(g, 78 + o, 55, '#b8922a'); set(g, 80 + o, 55, '#f0cc3c'); set(g, 79 + o, 53, '#d01c1c'); }
  // nấm tím, nấm bậc thang, rêu
  for (let k = 0; k < 3; k++) { ell(g, 104 + o + k, 92 + k * 5, 4.5, 1.6, TIMD[1]); rect(g, 101 + o + k, 91 + k * 5, 6, 1, TIMD[2]); set(g, 104 + o + k, 91 + k * 5, TIMD[3]); rect(g, 100 + o + k, 93 + k * 5, 7, 1, TIMD[0]); }
  for (let k = 0; k < 2; k++) { ell(g, 55 + o - k, 84 + k * 5, 4, 1.5, TIMD[1]); rect(g, 53 + o - k, 83 + k * 5, 5, 1, TIMD[2]); rect(g, 52 + o - k, 85 + k * 5, 6, 1, TIMD[0]); }
  TM_nam(g, 40 + o, 118, 4); TM_nam(g, 34 + o, 120, 2.5); TM_nam(g, 122 + o, 118, 3.5); TM_nam(g, 128 + o, 121, 2.5); TM_nam(g, 66 + o, 122, 3); TM_nam(g, 109 + o, 121, 3);
  for (const q of [[62, 50, 7], [59, 62, 3], [57, 96, 5], [51, 123, 8], [100, 120, 6], [30, 119, 6], [124, 122, 6], [71, 119, 4]]) for (let i = 0; i < q[2]; i++) { const h = TM_h(q[0] + i, q[1]); set(g, q[0] + o + i, q[1] + (h % 2), REU[1]); if (h % 3 === 0) set(g, q[0] + o + i, q[1] - 1, REU[2]); if (h % 4 === 0) set(g, q[0] + o + i, q[1] + 1 + (h % 2), REU[0]); }
  // rìu gỉ cắm bên sườn
  line(g, 100 + o, 80, 121 + o, 69, '#6a4426', 2.6); line(g, 101 + o, 79, 121 + o, 68, '#b07c48', 1); rect(g, 120 + o, 67, 3, 3, '#4a2e18');
  poly(g, X([[94, 74], [103, 71], [106, 84], [97, 88], [92, 81]]), '#6e737c'); poly(g, X([[94, 75], [97, 74], [95, 82], [93, 81]]), '#c8ccd4'); line(g, 100 + o, 73, 103 + o, 84, '#3c4048', 1);
  for (const q of [[98, 77], [100, 80], [99, 84], [102, 76], [96, 85]]) set(g, q[0] + o, q[1], '#b0542a'); set(g, 99 + o, 78, '#d87a3a'); line(g, 91 + o, 80, 96 + o, 89, '#1c0e08', 1); line(g, 90 + o, 79, 92 + o, 84, N[3], 1);
  // MẶT NGƯỜI DỮ: hốc mắt sâu rực sáng
  for (const M of [X, MX]) { poly(g, M([[61, 73], [78, 81], [78, 88], [66, 88], [60, 81]]), TM_HOC); poly(g, M([[64, 77], [76, 83], [76, 86.5], [67, 86.5], [63, 81]]), EY[0]); poly(g, M([[66, 79.5], [75, 84], [75, 86], [68, 86]]), EY[1]); ell(g, M([[71.5, 0]])[0][0], 84.2, 2.4, 1.5, EY[2]);
    if (p !== 3) rect(g, Math.round(M([[72, 0]])[0][0]) - (M === MX ? 1 : 0), 81, 1, 5, OL);
    poly(g, M([[56, 67], [79, 78], [80, 83], [58, 74]]), N[0]); const a = M([[56, 66], [79, 77]]); line(g, a[0][0], a[0][1], a[1][0], a[1][1], N[3], 1); const b = M([[58, 63], [70, 68]]); line(g, b[0][0], b[0][1], b[1][0], b[1][1], N[0], 1);
    const c2 = M([[62, 90], [70, 92], [64, 93], [69, 95]]); line(g, c2[0][0], c2[0][1], c2[1][0], c2[1][1], N[0], 1); line(g, c2[2][0], c2[2][1], c2[3][0], c2[3][1], N[0], 1); }
  poly(g, X([[77, 77], [83, 77], [82, 84], [80, 86], [78, 84]]), N[0]); line(g, 79 + o, 70, 78 + o, 76, N[0], 1); line(g, 82 + o, 69, 82 + o, 76, N[0], 1);
  poly(g, X([[77, 88], [80, 85], [83, 88], [82, 93], [78, 93]]), N[2]); line(g, 78 + o, 87, 78 + o, 92, N[3], 1); rect(g, 78 + o, 93, 2, 2, TM_HOC); rect(g, 81 + o, 93, 2, 2, TM_HOC);
  // miệng là vết nứt đầy răng gỗ nhọn
  const mo = p === 1 ? 0 : 3;
  poly(g, X([[59, 97], [66, 99], [73, 97], [80, 100], [87, 97], [94, 99], [101, 96], [99, 106 + mo], [92, 112 + mo], [86, 109 + mo], [80, 113 + mo], [74, 109 + mo], [68, 112 + mo], [61, 106 + mo]]), '#16060e');
  ell(g, 80 + o, 105 + mo * .6, 9, 3, p === 3 ? '#4a1880' : p === 2 ? '#7a1410' : '#3a0a14'); if (p > 1) ell(g, 80 + o, 105.5 + mo * .6, 5, 1.5, p === 3 ? '#c860ff' : '#ff5a2a');
  [8, 5, 7, 4, 9, 5, 7, 4, 8].forEach((Lg, i) => { const x = 60.5 + i * 4.5, y0 = 97 + [0, 1.6, 1, 0, 2, 2, 0, 1, .5][i]; poly(g, [[x + o, y0], [x + o + 4.4, y0], [x + o + 2.2 + (i % 3 - 1) * .7, y0 + Lg]], TM_GO); line(g, x + o + 3.4, y0 + 1, x + o + 2.6, y0 + Lg * .6, N[2], 1); set(g, x + o + 1, y0, '#fffbe8'); });
  [5, 7, 4, 6, 4, 7, 5].forEach((Lg, i) => { const x = 63 + i * 5, y0 = [108, 111, 109, 111, 109, 111, 108][i] + mo; poly(g, [[x + o, y0], [x + o + 4, y0], [x + o + 2 + (i % 2 - .5), y0 - Lg]], '#d0b47c'); line(g, x + o + 3, y0 - 1, x + o + 2.5, y0 - Lg * .6, N[2], 1); });
  pl(g, X([[59, 97], [54, 93], [53, 88]]), '#1c0e08', 1); pl(g, X([[101, 96], [106, 92], [105, 87]]), '#1c0e08', 1); pl(g, X([[61, 107 + mo], [57, 112 + mo]]), '#1c0e08', 1); pl(g, X([[99, 107 + mo], [103, 113 + mo]]), '#1c0e08', 1);
  // vết nứt phát sáng theo pha, nhựa độc
  if (GL) { for (const q of [[[66, 52], [69, 58], [67, 64]], [[90, 60], [93, 66], [91, 71]], [[55, 100], [58, 106], [56, 114], [59, 120]], [[103, 100], [101, 108], [105, 116]], [[74, 116 + mo], [76, 120], [73, 125]], [[40, 60], [34, 60], [31, 64]], [[119, 58], [126, 59]]]) pl(g, X(q), GL, 1);
    for (const M of [X, MX]) { const a = M([[60, 80], [56, 82]]); line(g, a[0][0], a[0][1], a[1][0], a[1][1], GL, 1); } }
  if (p === 3) { for (const q of [[66, 88, 9], [77, 88, 5], [83, 88, 7], [94, 88, 11], [70, 112 + mo, 8], [80, 113 + mo, 5], [90, 112 + mo, 10], [63, 107 + mo, 6]]) { line(g, q[0] + o, q[1], q[0] + o, q[1] + q[2], TIMD[2], 1); set(g, q[0] + o, q[1] + 1, TIMD[3]); rect(g, q[0] + o - 1, q[1] + q[2], 2, 2, TIMD[2]); set(g, q[0] + o - 1, q[1] + q[2], TIMD[3]); }
    for (const q of [[97, 89, 6], [104, 70, 5]]) { line(g, q[0] + o, q[1], q[0] + o, q[1] + q[2], DOCX[1], 1); set(g, q[0] + o, q[1] + q[2], DOCX[2]); } }
  vien(g);
  // hiệu ứng sau viền
  for (const M of [X, MX]) { const a = M([[70, 0], [73, 0]]); set(g, a[0][0], 83, '#ffffff'); if (p > 1) { set(g, M([[61, 0]])[0][0], 76, EY[1]); set(g, M([[59, 0]])[0][0], 74, EY[0]); } }
  if (p === 1) { for (const q of [[14, 70], [146, 58], [48, 78], [112, 96], [26, 96]]) { set(g, q[0] + o, q[1], DOCX[3]); set(g, q[0] + o, q[1] + 1, DOCX[1]); } for (const q of [[14, 60, 1], [146, 74, -1], [44, 96, 1]]) { set(g, q[0] + o, q[1], L[2]); set(g, q[0] + o + q[2], q[1] + 1, L[1]); } }
  if (p === 2) { TM_bua(g, 12 + o, 64, .7); TM_bua(g, 142 + o, 72, -.6); TM_bua(g, 70 + o, 36, .5);
    for (const q of [[13, 46, 1], [147, 50, -1], [30, 84, 1], [132, 92, -1], [50, 9, 1], [112, 8, -1], [16, 92, -1], [144, 96, 1], [12, 82, 1], [148, 86, -1]]) { set(g, q[0] + o, q[1], L[3]); set(g, q[0] + o + q[2], q[1] + 1, L[2]); set(g, q[0] + o + q[2] * 2, q[1] + 1, L[1]); }
    for (const q of [[20, 128], [30, 129], [132, 129], [140, 127], [12, 124], [148, 125]]) rect(g, q[0] + o, q[1], 2, 2, N[1]); }
  if (p === 3) { for (const q of [[24, 123, 14, 7], [136, 123, 14, 7], [52, 127, 22, 4], [110, 127, 22, 4], [16, 108, 7, 6], [144, 106, 7, 6], [80, 128, 30, 3]]) TM_khi(g, q[0] + o, q[1], q[2], q[3], 'rgba(154,72,212,.30)');
    for (const q of [[26, 121, 9, 4], [134, 122, 9, 4], [60, 128, 12, 2], [104, 128, 12, 2]]) TM_khi(g, q[0] + o, q[1], q[2], q[3], 'rgba(200,120,255,.30)');
    for (const q of [[14, 30], [146, 28], [13, 80], [147, 84], [40, 80], [124, 92], [30, 12], [132, 12], [16, 98], [146, 44], [50, 100], [116, 78]]) { set(g, q[0] + o, q[1], '#ffffff'); for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(g, q[0] + o + d[0], q[1] + d[1], TIMD[3]); }
    for (const q of [[20, 20], [140, 60], [12, 52], [148, 100], [34, 100], [128, 110], [18, 112], [62, 9], [100, 9]]) set(g, q[0] + o, q[1], DOCX[2]); }
  g.foot = 131; g.cx = 80 + o; return g; };

// TRÙM NHỎ Rừng già: Nấm Chúa
QT.namChua = function () { const g = S(100, 76), T = TIMD, K = ['#4a3c40', '#9a8a78', '#d4c8a8', '#f4ecd0'], cx = 50, mx = x => 100 - x;
  const GAI = ['#3a1460', T[2], T[3]];
  // gai trên mũ
  for (const q of [[14, 22, 30, 5, 18], [20, 28, 20, 13, 5], [31, 38, 15, 28, 4]]) { crystal(g, q[0], q[1], q[2], q[3], q[4], GAI); crystal(g, mx(q[1]), mx(q[0]), q[2], mx(q[3]), q[4], GAI); }
  // mũ nấm lớn
  ball4(g, cx, 28, 38, 18, T); rect(g, 0, 34, 100, 42, null);
  for (let y = 8; y < 34; y++) for (let x = 12; x < 88; x++) { const c0 = get(g, x, y), h = TM_h(x, y); if (c0 === T[2] && h % 17 === 0) set(g, x, y, T[1]); else if (c0 === T[1] && h % 19 === 0) set(g, x, y, T[0]); }
  ell(g, cx, 33.5, 37.5, 4.6, '#1a0830'); for (let x = 14; x < 87; x += 3) { const dy = Math.round(Math.abs(x - cx) / 14); line(g, x, 32 - dy + 1, x + (x < cx ? 1 : -1), 36, T[1], 1); } ell(g, cx, 31, 37, 1.6, T[0]); for (let x = 13; x < 88; x += 2) set(g, x, 31 + ((x >> 1) % 2), T[2]);
  // mép mũ rách nhỏ giọt
  for (const q of [[14, 4], [22, 6], [78, 5], [86, 3], [30, 3], [70, 4]]) { poly(g, [[q[0] - 2, 35], [q[0] + 2, 35], [q[0], 36 + q[1]]], T[0]); set(g, q[0], 37 + q[1], DOCX[2]); }
  // đốm độc
  for (const q of [[28, 18, 3.4], [50, 17, 3.4], [70, 18, 3.2], [19, 27, 2.2], [81, 26, 2.4], [40, 24, 2.2], [60, 25, 2.6], [37, 14, 1.6], [64, 13, 1.4]]) { ell(g, q[0], q[1] + .6, q[2] + 1, q[2] * .8 + 1, T[0]); ell(g, q[0], q[1], q[2], q[2] * .8, DOCX[1]); ell(g, q[0] - .5, q[1] - .4, q[2] * .6, q[2] * .45, DOCX[2]); set(g, q[0] - 1, q[1] - 1, DOCX[3]); }
  // sẹo trên mũ
  line(g, 54, 19, 60, 14, T[0], 1); line(g, 56, 21, 62, 16, T[0], 1); line(g, 22, 20, 25, 24, T[0], 1);
  // tay rễ có vuốt
  TM_canh(g, [[38, 50], [26, 53], [16, 46], [12, 38]], 7, 4, NAUG, 3, 9); TM_canh(g, [[62, 50], [75, 54], [85, 50], [90, 42]], 7, 4, NAUG, 3, 9);
  // chân rễ
  for (const q of [[[38, 55], [28, 59], [20, 62]], [[44, 57], [38, 60], [35, 62]], [[62, 55], [72, 59], [80, 62]], [[56, 57], [62, 60], [65, 62]]]) TM_canh(g, q, 7, 3, NAUG, 1, 4);
  // thân chắc
  poly(g, [[35, 34], [65, 34], [67, 52], [69, 62], [31, 62], [33, 52]], K[1]); poly(g, [[35, 34], [44, 34], [42, 52], [41, 62], [31, 62], [33, 52]], K[2]); poly(g, [[59, 34], [65, 34], [67, 52], [69, 62], [62, 62], [61, 52]], K[0]);
  rect(g, 35, 34, 30, 3, '#2a1838'); rect(g, 36, 37, 28, 1, K[0]);
  for (let y = 40; y < 62; y++) for (const x of [37, 46, 57, 63]) if (TM_h(x, y >> 2) % 3) set(g, x + Math.round(Math.sin(y * .4 + x)), y, x < 45 ? K[3] : K[0]);
  // mặt dữ
  mat(g, 42.5, 43, 4.4, 1, DOCX[2]); mat(g, 57.5, 43, 4.4, -1, DOCX[2]); line(g, 36, 38, 47, 42, '#1c0f18', 2.4); line(g, 64, 38, 53, 42, '#1c0f18', 2.4);
  line(g, 49, 38, 49, 41, K[0], 1); line(g, 51, 38, 51, 41, K[0], 1); line(g, 59, 47, 63, 53, '#6a1a2a', 1); line(g, 60, 46, 64, 52, K[0], 1);
  poly(g, [[37, 49], [43, 51], [50, 50], [57, 51], [63, 49], [61, 56], [50, 59], [39, 56]], '#2a0614'); ell(g, 50, 55, 6, 2, '#6a1030');
  [6, 3, 4, 3, 4, 3, 6].forEach((Lg, i) => { const x = 38 + i * 3.5; poly(g, [[x, 49.5 + (i % 2)], [x + 3.4, 49.5 + (i % 2)], [x + 1.7, 50 + Lg]], '#fff8e0'); });
  [3, 4, 3, 4, 3].forEach((Lg, i) => { const x = 41.5 + i * 3.5; poly(g, [[x, 58], [x + 3.2, 58], [x + 1.6, 58 - Lg]], '#d8ccb0'); });
  line(g, 45, 58, 45, 61, DOCX[1], 1); set(g, 45, 62, DOCX[2]); line(g, 55, 58, 55, 61, DOCX[1], 1);
  // vương miện xương gỗ nạm ngọc độc
  rect(g, 41, 9, 19, 4, '#b8801a'); rect(g, 41, 9, 19, 1, '#ffe07a'); rect(g, 41, 12, 19, 1, '#7a4c10');
  for (const q of [[41, 5], [45.5, 6.5], [50.5, 3.5], [55.5, 6.5], [60, 5]]) { poly(g, [[q[0] - 2.5, 10], [q[0], q[1]], [q[0] + 2.5, 10]], '#e8b020'); line(g, q[0] - 1, 9, q[0], q[1] + 1, '#ffe88a', 1); }
  rect(g, 49, 9, 3, 3, DOCX[2]); set(g, 49, 9, '#ffffff'); set(g, 44, 10, '#d01c1c'); set(g, 57, 10, '#d01c1c');
  // nấm con mọc quanh chân
  TM_nam(g, 14, 59, 5); TM_nam(g, 23, 61, 3); TM_nam(g, 86, 59, 4.5); TM_nam(g, 77, 61, 3); TM_nam(g, 7, 61, 2.5); TM_nam(g, 93, 61, 2.5);
  for (const q of [[33, 60, 5], [60, 60, 6], [47, 61, 4]]) for (let i = 0; i < q[2]; i++) { set(g, q[0] + i, q[1] + (i % 2), REU[1]); if (i % 2) set(g, q[0] + i, q[1] - 1, REU[2]); }
  vien(g);
  // bào tử độc bay
  for (const q of [[6, 12], [92, 10], [4, 38], [95, 34], [24, 44], [76, 40], [10, 50], [90, 52]]) { set(g, q[0], q[1], '#ffffff'); for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(g, q[0] + d[0], q[1] + d[1], DOCX[2]); }
  for (const q of [[9, 22], [95, 22], [3, 30], [28, 5], [72, 4], [28, 50], [72, 48], [5, 46], [96, 44]]) set(g, q[0], q[1], T[3]);
  g.cx = 50; return g; };

// TRÙM NHỎ Lâu đài cổ: Hổ Lửa. Nhìn về bên trái.
function TM_lua(g, bx, by, w, h, lean) { const cs = [DOCAM[2], LUAV[1], LUAV[2], LUAV[3]]; cs.forEach((c, i) => { const k = 1 - i * .24, W = w * k, H = h * k, ln = lean * k; poly(g, [[bx - W / 2, by], [bx - W * .32 + ln * .3, by - H * .5], [bx + ln, by - H], [bx + W * .3 + ln * .7, by - H * .55], [bx + W * .55 + ln * .9, by - H * .8], [bx + W / 2, by]], c); }); }
QT.hoLua = function () { const g = S(124, 84), C = ['#140a0e', '#2e1a1c', '#52302a', '#84503c'], E = LUAV, TR2 = '#fff8e0', oy = 4;
  const P = (pts, c) => poly(g, pts.map(q => [q[0], q[1] + oy]), c), Ln = (a, b, c2, d, col, t) => line(g, a, b + oy, c2, d + oy, col, t), El = (a, b, c2, d, col) => ell(g, a, b + oy, c2, d, col);
  const van = (pts, on) => TM_phu(g, on || [C[1], C[2], C[3], C[0]], t => { poly(t, pts.map(q => [q[0], q[1] + oy]), E[0]); const m = pts.length === 3 ? [[(pts[0][0] * 2 + pts[1][0]) / 3, (pts[0][1] * 2 + pts[1][1]) / 3], [(pts[1][0] * 2 + pts[0][0]) / 3, (pts[1][1] * 2 + pts[0][1]) / 3], [pts[2][0] * .75 + (pts[0][0] + pts[1][0]) / 8, pts[2][1] * .75 + (pts[0][1] + pts[1][1]) / 8]] : pts; if (pts.length === 3) { poly(t, m.map(q => [q[0], q[1] + oy]), E[1]); line(t, (m[0][0] + m[1][0]) / 2, (m[0][1] + m[1][1]) / 2 + oy, (m[2][0] + (m[0][0] + m[1][0]) / 2) / 2, (m[2][1] + (m[0][1] + m[1][1]) / 2) / 2 + oy, E[2], 1); } });
  // chân xa
  P([[40, 44], [28, 48], [14, 53], [7, 56], [6, 62], [18, 63], [32, 58], [46, 52]], C[0]); P([[30, 48], [16, 53], [9, 56], [16, 56], [30, 52]], C[1]);
  for (let i = 0; i < 3; i++) P([[7 + i * 4, 60], [4 + i * 4, 65.5], [10 + i * 4, 63]], TR2);
  P([[78, 48], [72, 58], [70, 66], [66, 72], [80, 72], [80, 66], [88, 54]], C[0]); for (let i = 0; i < 2; i++) P([[67 + i * 4, 70], [64 + i * 4, 72.6], [70 + i * 4, 72.6]], TR2);
  // đuôi
  const dc = [[95, 42], [101, 42], [104, 36], [103, 28], [99, 23]]; for (let i = 0; i < 4; i++) Ln(dc[i][0], dc[i][1], dc[i + 1][0], dc[i + 1][1], C[1], 5 - i * .5); for (let i = 0; i < 4; i++) Ln(dc[i][0] - 1, dc[i][1] - 1, dc[i + 1][0] - 1, dc[i + 1][1] - 1, C[2], 1);
  for (const q of [[99, 39, 100, 45], [102, 36, 107, 38], [101, 30, 106, 30], [98, 25, 102, 23]]) { Ln(q[0], q[1], q[2], q[3], E[0], 2); Ln(q[0], q[1], q[2], q[3], E[1], 1); }
  // thân: hông, lưng võng, vai u
  El(87, 44, 13, 13.5, C[1]); El(68, 43, 22, 11.5, C[1]); El(51, 38, 18, 16, C[1]);
  El(50, 32, 15, 9, C[2]); El(69, 37, 19, 5, C[2]); El(87, 37, 10, 6, C[2]); El(47, 27, 9, 3, C[3]); El(86, 33.5, 6, 1.6, C[3]); El(68, 33.5, 10, 1.2, C[3]);
  El(68, 52, 19, 3.4, C[0]); P([[58, 50], [80, 50], [76, 55], [62, 55]], C[0]);
  // cơ vai
  Ln(42, 30, 46, 42, C[0], 1); Ln(58, 28, 60, 44, C[0], 1); Ln(80, 36, 78, 50, C[0], 1);
  // vằn than hồng trên thân
  [[57, 2], [63, 1], [69, 0], [75, -1], [81, -2]].forEach((q, i) => van([[q[0], 22], [q[0] + 4.5, 22], [q[0] + 2 + q[1], 44 + (i % 2) * 3]]));
  [[64, 0], [71, -1], [77, -2]].forEach(q => van([[q[0], 58], [q[0] + 3.5, 58], [q[0] + 2, 48]]));
  van([[84, 30], [89, 30], [84, 44]]); van([[90, 31], [95, 33], [88, 46]]); van([[96, 36], [100, 40], [91, 50]]);
  van([[45, 20], [50, 20], [48, 34]]); van([[51, 20], [56, 21], [53, 36]]);
  // chân sau gần
  P([[82, 50], [96, 48], [101, 58], [96, 65], [99, 72], [84, 72], [85, 66], [89, 60]], C[1]); P([[84, 51], [94, 50], [98, 58], [94, 63], [90, 58]], C[2]); P([[84, 68], [99, 68], [99, 72], [84, 72]], C[2]);
  for (let i = 0; i < 3; i++) P([[84 + i * 4, 69.5], [80.5 + i * 4, 72.8], [87 + i * 4, 72.8]], TR2);
  van([[90, 53], [99, 55], [92, 57]]); van([[91, 59], [98, 62], [92, 63]]); van([[88, 64], [96, 66], [89, 67.5]]);
  // chân trước gần: bắp to, vuốt lộ
  El(49, 47, 9, 11, C[1]); El(48, 45, 7, 8, C[2]); El(46, 41, 3.5, 3, C[3]); Ln(46, 55, 34, 64, C[1], 9); Ln(45, 53, 34, 62, C[2], 3);
  P([[20, 66], [26, 62], [38, 62], [42, 68], [40, 72], [20, 72]], C[1]); P([[22, 66], [27, 63.5], [37, 63.5], [39, 67]], C[2]); for (const x of [26, 31, 36]) Ln(x, 67, x - 1, 71, C[0], 1);
  for (let i = 0; i < 4; i++) P([[19 + i * 5, 68], [15 + i * 5, 73.6], [22.5 + i * 5, 71.5]], TR2);
  van([[44, 44], [53, 46], [45, 48]]); van([[43, 50], [53, 52], [44, 54]]); van([[38, 57], [46, 60], [38, 61]]); van([[33, 61], [40, 64.5], [33, 65]]);
  // bờm cổ xù
  for (const q of [[[36, 28], [48, 30], [40, 36]], [[36, 36], [49, 42], [38, 44]], [[34, 44], [46, 54], [33, 51]], [[30, 50], [39, 62], [27, 57]]]) { P(q, q[0][1] > 40 ? '#9a8a78' : C[1]); Ln(q[0][0], q[0][1], q[1][0], q[1][1], q[0][1] > 40 ? '#e0d4b8' : C[3], 1); }
  El(34, 39, 9, 11, C[1]);
  // đầu to, hàm vuông
  P([[41, 25], [28, 22], [17, 27], [10, 34], [4, 38], [3, 44], [7, 47.5], [26, 49], [38, 49], [43, 40]], C[2]);
  P([[39, 26], [28, 23.5], [18, 28], [12, 34], [22, 31], [36, 31]], C[3]); P([[30, 24], [20, 28], [26, 27]], '#a8684a'); P([[30, 38], [43, 40], [38, 49], [28, 49]], C[1]);
  P([[11, 36], [4, 38.5], [3, 44], [7, 47.5], [23, 48.5], [24, 40]], '#9a8a78'); P([[10, 36.5], [5, 39], [4, 42], [16, 41]], '#e0d4b8'); P([[24, 40], [30, 42], [29, 49], [23, 48.5]], '#6e5c50');
  P([[2, 38], [7, 37], [8, 41], [3, 42]], '#080406'); set(g, 5, 40 + oy, E[1]); for (const q of [[11, 43], [14, 44], [12, 46], [16, 46], [18, 43], [20, 45]]) set(g, q[0], q[1] + oy, C[0]);
  // tai cụp ra sau
  P([[33, 24], [43, 13], [45, 27]], C[1]); P([[37, 23], [42, 17], [43, 25]], DOCAM[1]); Ln(33, 24, 43, 13, C[3], 1); P([[26, 23], [31, 16], [35, 23]], C[0]);
  // hàm dưới há rộng
  P([[11, 57], [9, 61], [14, 65], [28, 65], [37, 57], [40, 48], [32, 52], [22, 58]], C[1]); P([[12, 61], [16, 63.5], [27, 63.5], [34, 57], [26, 61]], C[0]); P([[9, 61], [13, 57.5], [22, 59], [16, 63], [12, 63]], '#9a8a78'); P([[10, 60.5], [13, 58.5], [18, 59.5]], '#e0d4b8');
  P([[7, 47.5], [38, 48], [34, 53], [24, 59], [12, 58]], '#3a0810'); El(22, 54.5, 7, 2.2, '#c8301c'); El(21, 54, 4, 1, '#f0704a'); El(31, 51, 4, 2.4, E[1]); El(31.5, 51, 2.4, 1.3, E[2]); set(g, 32, 51 + oy, E[3]);
  // nanh dài và răng
  P([[7, 47], [11.5, 47], [8.6, 58]], '#ffffff'); Ln(10, 48, 9, 54, '#d8ccb0', 1); P([[13, 47.5], [16, 47.5], [14.5, 52]], TR2); P([[17, 48], [19.5, 48], [18.2, 51]], TR2); P([[21, 48], [23.5, 48], [22.2, 51.5]], TR2); P([[25.5, 48], [29, 48], [27, 54]], '#ffffff');
  P([[12.5, 59], [16, 59], [13.6, 50]], '#ffffff'); P([[17, 59.5], [19.5, 59.5], [18.2, 56]], TR2); P([[21, 59], [23.5, 58.5], [22.4, 55.5]], TR2); P([[25, 58], [28, 57], [27, 53]], TR2);
  Ln(4, 46.5, 24, 48, C[0], 1);
  // mắt xếch rực
  P([[10, 32], [27, 27], [29, 35], [17, 39.5]], '#080406'); P([[13, 33.5], [26, 29.5], [27, 34.5], [17.5, 38]], DOCAM[2]); P([[14.5, 34], [25, 30.6], [26, 34], [18, 37]], E[2]); P([[16, 34.4], [22, 32.6], [22, 35], [18.4, 36.2]], E[3]); rect(g, 21, 31 + oy, 2, 5, OL);
  P([[8, 33.5], [28, 24.5], [31, 28.5], [13, 35.5]], C[0]); Ln(9, 33, 28, 24.5, '#a8684a', 1); Ln(13, 30, 16, 27, C[0], 1); Ln(26, 35, 30, 36, C[0], 1);
  // vằn mặt, sẹo, râu
  van([[20, 22], [23, 22], [20, 27]]); van([[25, 21], [28.5, 21], [26, 28]]); van([[31, 22], [35, 23], [32, 29]]); van([[28, 37], [28, 40], [37, 39]]); van([[27, 42], [27, 45], [36, 45]]); van([[38, 30], [41, 31], [36, 36]]);
  Ln(15, 38, 19, 46, '#c84a3a', 1); Ln(17, 38, 21, 45, '#c84a3a', 1);
  Ln(9, 43, 3, 46, XUONGT[3], 1); Ln(10, 45, 5, 50, XUONGT[3], 1); Ln(12, 62, 6, 66, C[2], 1); Ln(15, 64, 12, 68, C[2], 1);
  vien(g);
  // lửa: bờm gáy, chóp đuôi, hơi thở, tàn lửa
  [[35, 27, 9, 10, 5], [41, 24, 10, 12, 7], [48, 23, 10, 12, 8], [55, 24, 9, 11, 7], [62, 27, 8, 8, 6], [70, 31, 7, 5, 5]].forEach(q => TM_lua(g, q[0], q[1] + oy, q[2], q[3], q[4]));
  TM_lua(g, 99, 25 + oy, 9, 12, 3); TM_lua(g, 102, 28 + oy, 6, 7, 3);
  set(g, 19, 35 + oy, '#ffffff'); set(g, 29, 31 + oy, E[1]); set(g, 31, 30 + oy, E[0]);
  for (const q of [[5, 53], [7, 55], [4, 57]]) set(g, q[0], q[1] + oy, E[2]); set(g, 6, 54 + oy, E[1]);
  for (const q of [[30, 16], [60, 15], [74, 19], [103, 14], [96, 30], [92, 22], [26, 18], [66, 17]]) { set(g, q[0], q[1], E[2]); set(g, q[0], q[1] + 1, E[1]); }
  for (const q of [[38, 15], [94, 16], [84, 24]]) set(g, q[0], q[1], E[0]);
  return g; };

// ----- từ quai-ban-chot/nguon/hotinh.js -----
// Mọi nét vẽ đi qua phép biến đổi HT_T (dời, xoay, phóng k) nên pha 3 được vẽ thật ở cỡ gấp rưỡi.
const HT_IV = ['#7a5a52', '#c9ad98', '#f2e6cf', '#fffdf2'], HT_IVX = ['#4e3a40', '#8c7468', '#b8a48e', '#d8cab2'];
const HT_CAM = ['#8a2a10', '#e0661e', '#ff9a3a', '#ffd27a'], HT_CAMX = ['#5a1c10', '#a0481a', '#c8702c', '#e0a060'];
const HT_DO = ['#5a0e0c', '#b0261a', '#e8442a', '#ff8a5a'], HT_DOX = ['#3c0a0c', '#7a1c16', '#a83020', '#c86448'];
const HT_MA = ['#2a3cc8', '#3aa0ff', '#8fe6ff', '#ffffff'], HT_LUA = ['#b0261a', '#ff8a1e', '#ffd23c', '#fff6b0'];
const HT_T = { k: 1, ox: 0, oy: 0, a: 0 };
function HT_p(x, y) { const T = HT_T, c = Math.cos(T.a), s = Math.sin(T.a); return [(T.ox + x * c - y * s) * T.k, (T.oy + x * s + y * c) * T.k]; }
function HT_E(g, x, y, rx, ry, col) { const T = HT_T, q = HT_p(x, y), cx = q[0], cy = q[1]; rx *= T.k; ry *= T.k; if (rx < .35 || ry < .35) return; if (!T.a) { ell(g, cx, cy, rx, ry, col); return; }
  const c = Math.cos(T.a), s = Math.sin(T.a), R = Math.max(rx, ry) + 1; for (let py = Math.floor(cy - R); py <= cy + R; py++) for (let px = Math.floor(cx - R); px <= cx + R; px++) { const dx = px + .5 - cx, dy = py + .5 - cy, u = (dx * c + dy * s) / rx, w = (-dx * s + dy * c) / ry; if (u * u + w * w <= 1) set(g, px, py, col); } }
function HT_P(g, pts, col) { poly(g, pts.map(q => HT_p(q[0], q[1])), col); }
function HT_L(g, x0, y0, x1, y1, col, t) { const a = HT_p(x0, y0), b = HT_p(x1, y1); line(g, a[0], a[1], b[0], b[1], col, (t || 1) * (HT_T.k > 1 && (t || 1) <= 1 ? 1.6 : HT_T.k)); }
function HT_D(g, x, y, col) { const q = HT_p(x, y); if (HT_T.k > 1) rect(g, Math.round(q[0]), Math.round(q[1]), 2, 2, col); else set(g, q[0], q[1], col); }
function HT_bz(a, b, c, d, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } return o; }
// ống mềm có bóng 4 lớp: pts là các điểm dọc thân, rf(t) bán kính, cf(t, i) dải màu, edge màu viền ngăn cách
function HT_ong(g, pts, rf, cf, edge) { const n = pts.length - 1, R = pts.map((q, i) => rf(i / n)), C = pts.map((q, i) => cf(i / n, i));
  if (edge) pts.forEach((q, i) => HT_E(g, q[0], q[1], R[i] + 1.1, R[i] + 1.1, edge));
  pts.forEach((q, i) => HT_E(g, q[0], q[1], R[i], R[i], C[i][0]));
  pts.forEach((q, i) => HT_E(g, q[0] - R[i] * .08, q[1] - R[i] * .18, R[i] * .86, R[i] * .86, C[i][1]));
  pts.forEach((q, i) => HT_E(g, q[0] - R[i] * .2, q[1] - R[i] * .36, R[i] * .62, R[i] * .62, C[i][2]));
  pts.forEach((q, i) => { if (R[i] > 2.6) HT_E(g, q[0] - R[i] * .34, q[1] - R[i] * .62, R[i] * .24, R[i] * .2, C[i][3]); }); }
// lưỡi lửa ba lớp, gốc tại (x, y), cao h, rộng w, ngả lean
function HT_lua(g, x, y, h, w, cols, lean) { for (let i = 0; i < 3; i++) { const f = 1 - i * .3, W = w * f, H = h * f, l = (lean || 0) * f; HT_P(g, [[x - W, y], [x - W * .75, y - H * .4], [x - W * .1 + l * .5, y - H * .62], [x + l, y - H], [x + W * .55 + l * .4, y - H * .5], [x + W, y - H * .15], [x + W * .8, y]], cols[i]); } }
function HT_cf(t, i) { const u = t + ((i % 4) < 2 ? .03 : -.03); return u < .5 ? HT_IV : u < .68 ? HT_CAM : HT_DO; }
function HT_cfx(t, i) { const u = t + ((i % 4) < 2 ? .03 : -.03); return u < .5 ? HT_IVX : u < .68 ? HT_CAMX : HT_DOX; }
// đầu cáo nhìn trái, gốc tọa độ ở giữa sọ
function HT_dau(g, p) { const I = HT_IV, m = p === 3 ? 5.5 : p === 2 ? 3.6 : 2.6, f = p === 3 ? 6.5 : p === 2 ? 3.6 : 3;
  // tai xa, tai gần
  HT_P(g, [[-4, -6], [-1, -24], [6, -8]], HT_IVX[2]); HT_P(g, [[-2, -8], [-.6, -19], [3.5, -9]], '#5a1420'); HT_P(g, [[-2.2, -17], [-1, -24], [1.2, -16.5]], HT_DOX[2]);
  HT_P(g, [[2, -5], [11, -28], [17, -3]], I[1]); HT_P(g, [[2, -5], [11, -28], [9, -5]], I[2]); HT_P(g, [[7, -7], [11, -21], [14.5, -6]], '#7a1c2a'); HT_P(g, [[9, -9], [11, -16], [12.5, -8]], '#b0403a'); HT_P(g, [[8.4, -19], [11, -28], [13.6, -18]], HT_DO[2]); HT_P(g, [[9.6, -22], [11, -28], [12.2, -22]], HT_CAM[2]);
  if (p === 3) { HT_P(g, [[14, -6], [22, -14], [17, -1]], I[2]); HT_P(g, [[-8, -7], [-9, -15], [-3, -9]], I[2]); }
  // sọ
  HT_E(g, 0, 0, 11, 9.6, I[0]); HT_E(g, -.4, -.9, 10.3, 8.5, I[1]); HT_E(g, -1, -2, 8.8, 6.8, I[2]); HT_E(g, -3.5, -5.6, 3.4, 1.5, I[3]);
  // lông má chĩa ra sau, chóp cam
  const s = p === 3 ? 1.35 : 1; HT_P(g, [[3, -1], [3 + 16 * s, 2 * s], [8, 7]], I[2]); HT_P(g, [[2, 4], [2 + 15 * s, 10 * s], [4, 10]], I[1]); HT_P(g, [[-1, 6], [-1 + 11 * s, 15 * s], [-2, 11]], I[1]);
  HT_P(g, [[3 + 11 * s, 1 * s], [3 + 16 * s, 2 * s], [3 + 11 * s, 3.6 * s]], HT_CAM[2]); HT_P(g, [[2 + 10.5 * s, 7.4 * s], [2 + 15 * s, 10 * s], [2 + 10 * s, 9 * s]], HT_CAM[1]);
  // hàm dưới, họng, mõm trên
  HT_P(g, [[-7, 4], [-22.5, 4.5], [-20, 6.2 + m], [-7, 8 + m]], I[1]); HT_P(g, [[-8, 4.5], [-22.5, 4.8], [-19.6, 5 + m], [-8, 5.4 + m]], '#3a0a14'); HT_P(g, [[-9, 4 + m], [-17, 4.4 + m], [-9, 5.4 + m]], '#c8384a');
  HT_P(g, [[-7, -6], [-25.5, 1.5], [-25.5, 4.6], [-7, 5]], I[2]); HT_P(g, [[-7, -6], [-25.5, 1.5], [-15, .8], [-7, -.5]], I[3]); HT_L(g, -24, 4.8, -9, 5, I[0], 1);
  HT_E(g, -24.6, 2.8, 1.7, 1.6, '#1c0f18'); HT_D(g, -25.4, 2, '#8a8290');
  // nanh
  for (const q of [[-21, f], [-17.4, f * .55], [-14, f * .7], [-10.8, f * .45]]) HT_P(g, [[q[0] - .9, 4.8], [q[0] + .9, 4.8], [q[0] + .2, 4.8 + q[1]]], '#fff8e0');
  for (const q of [[-19, f * .6], [-15.6, f * .4], [-12.4, f * .4]]) HT_P(g, [[q[0] - .8, 5.2 + m], [q[0] + .8, 5.2 + m], [q[0], 5.2 + m - q[1]]], '#fff8e0');
  // hoa văn đỏ như mặt nạ cáo
  const R = HT_DO[2]; HT_L(g, -9, -6, -4.5, -8.6, R, 1.5); HT_L(g, -4, -8.8, -2.4, -6.6, R, 1.2); HT_D(g, -.5, -8.6, R); HT_D(g, 2, -8, HT_DO[1]);
  HT_L(g, 0, -4.6, 5.5, -6.4, R, 1.3); HT_L(g, -6.5, .6, -1, 2.6, R, 1.3); HT_L(g, -5.5, 3.2, -.5, 5.2, R, 1.3); HT_L(g, -19, .4, -14.5, -1.4, HT_DO[1], 1); HT_D(g, 5, 1.5, R);
  // mắt xếch
  const ec = p === 3 ? '#ffffff' : p === 2 ? '#d86cff' : '#ffd23c', e2 = p === 3 ? '#f0b0ff' : p === 2 ? '#f6d0ff' : '#fff6b0';
  HT_P(g, [[-11, -2.4], [-2, -7.6], [.6, -4.4], [-6, -.6]], '#1c0f18'); HT_P(g, [[-9, -2.5], [-2.4, -6.2], [-.8, -4.5], [-6, -1.8]], ec); HT_P(g, [[-7, -3.2], [-3, -5.4], [-2.4, -4.6], [-6, -2.6]], e2);
  if (p !== 3) HT_L(g, -5, -5, -4.5, -2.6, '#14182e', 1); HT_L(g, -12.5, -3.4, 1.5, -9.6, '#2a1420', 1.7); }
const HT_DANG = {
  1: { w: 196, h: 140, gy: 131, tb: [100, 116], A: [1, 13, 25, 37, 49, 61, 73, 85, 96], L: [58, 68, 76, 82, 86, 88, 90, 90, 88], cu: 0, tw: 6.6,
    torso: [[95, 111], [92, 96], [80, 88], [70, 86]], tr: [14, 11], hip: [91, 113, 15, 14], chest: [70, 91, 11, 12], neck: [[70, 84], [67, 76], [62, 70], [59, 64]], nr: [9, 6.6], head: [54, 56, .18],
    legs: [{ far: 1, pts: [[75, 96], [71, 112], [73.5, 128]], r: [5, 3.4], paw: [70.5, 128.4] }, { pts: [[93, 124], [84, 128.4], [78, 128.2]], r: [4.6, 3.4], paw: [75, 128.4] }, { pts: [[68, 96], [62.5, 112], [65, 128]], r: [5.4, 3.6], paw: [62, 128.4] }],
    hat: [[73, 75], [70, 86], [62, 86], [58, 79]], mark: [89, 110] },
  2: { w: 196, h: 124, gy: 116, tb: [124, 84], A: [-4, 13, 30, 47, 64, 81, 98, 115, 132], L: [52, 58, 68, 74, 76, 74, 72, 72, 70], cu: 0, tw: 6.4,
    torso: [[118, 84], [104, 82], [90, 92], [76, 94]], tr: [13, 11], hip: [116, 86, 13, 12], chest: [76, 95, 12, 10], neck: [[72, 93], [64, 93], [56, 95], [50, 96]], nr: [9.4, 7.4], head: [44, 96, -.14],
    legs: [{ far: 1, pts: [[80, 99], [78, 108], [66, 113]], r: [5, 3.4], paw: [62, 113.4] }, { far: 1, pts: [[110, 92], [118, 106], [108, 113]], r: [5.6, 3.4], paw: [104.5, 113.4] }, { pts: [[120, 90], [130, 102], [119, 113]], r: [6.6, 3.6], paw: [115.5, 113.4] }, { pts: [[73, 99], [68, 110], [54, 113]], r: [5.4, 3.6], paw: [50, 113.4] }],
    hat: [[70, 86], [68, 99], [60, 103], [57, 101]], mark: [116, 84] },
  3: { w: 200, h: 144, gy: 135, tb: [114, 112], A: [-14, 0, 14, 28, 42, 56, 70, 84, 97], L: [66, 74, 80, 84, 86, 88, 88, 86, 82], cu: 1, tw: 6.4,
    torso: [[107, 108], [104, 92], [94, 80], [84, 75]], tr: [13.5, 11.5], hip: [106, 110, 13, 13], chest: [83, 77, 12, 12], neck: [[81, 72], [76, 62], [71, 57], [67, 53]], nr: [10, 7.4], head: [62, 49, -.22],
    legs: [{ far: 1, pts: [[86, 84], [72, 94], [62, 88]], r: [5, 3.2], paw: [59, 86.5], up: 1 }, { far: 1, pts: [[112, 114], [116, 124], [112, 132]], r: [5.6, 3.4], paw: [108.5, 132.4] }, { pts: [[104, 116], [97, 124], [102, 132]], r: [6.4, 3.6], paw: [98.5, 132.4] }, { pts: [[79, 80], [64, 84], [56, 74]], r: [5.4, 3.4], paw: [54, 71.5], up: 1 }],
    hat: [[86, 66], [82, 78], [74, 78], [70, 68]], mark: [106, 108] } };
function HT_than(v, p) { const P = HT_DANG[v] || HT_DANG[1], k = p === 3 ? 1.5 : 1, g = S(Math.ceil(P.w * k), Math.ceil(P.h * k)), T = HT_T; T.k = k; T.ox = 0; T.oy = 0; T.a = 0;
  const tips = [], sp = HT_bz(P.torso[0], P.torso[1], P.torso[2], P.torso[3], 26), nk = HT_bz(P.neck[0], P.neck[1], P.neck[2], P.neck[3], 16);
  // đường các đuôi
  const tails = P.A.map((ad, i) => { const a = ad * Math.PI / 180, L = P.L[i] * (p === 3 ? 1.04 : 1), d = [Math.cos(a), -Math.sin(a)], n = [-Math.sin(a), -Math.cos(a)], B = P.tb;
    const c = P.cu ? 1 : Math.max(-1, Math.min(.55, (ad - 54) / 52)), o1 = P.cu ? -12 : -c * 7, o2 = P.cu ? 14 : c * 15, o3 = P.cu ? 3 : c * 4;
    return HT_bz(B, [B[0] + d[0] * L * .36 + n[0] * o1, B[1] + d[1] * L * .36 + n[1] * o1], [B[0] + d[0] * L * .8 + n[0] * o2, B[1] + d[1] * L * .8 + n[1] * o2], [B[0] + d[0] * L + n[0] * (o2 + o3) * (P.cu ? 1.5 : 1), B[1] + d[1] * L + n[1] * (o2 + o3) * (P.cu ? 1.5 : 1)], 64); });
  const up = (pts, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; let nx = ty, ny = -tx; if (ny > 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; } return [tx, ty, nx, ny]; };
  const trf = t => P.tr[0] + (P.tr[1] - P.tr[0]) * t, nrf = t => P.nr[0] + (P.nr[1] - P.nr[0]) * t;
  // pha 3: lửa cháy sau lưng và dọc các đuôi
  if (p === 3) { tails.forEach((tl, i) => { for (const j of [18, 30, 42, 54]) HT_lua(g, tl[j][0], tl[j][1], 15 + (i + j) % 3 * 4, 6, [HT_LUA[0], HT_LUA[1], HT_LUA[2]], 3); });
    for (let i = 2; i < sp.length; i += 5) { const u = up(sp, i), r = trf(i / 26); HT_lua(g, sp[i][0] + u[2] * r, sp[i][1] + u[3] * r + 3, 20 + i % 3 * 3, 7, HT_LUA, 4); }
    HT_lua(g, P.head[0] + 8, P.head[1] - 14, 22, 8, HT_LUA, 5); }
  // chín đuôi: vẽ từ hai mép vào giữa
  const tw = t => P.tw * (t < .62 ? .3 + .7 * Math.sin(t / .62 * 1.5708) : Math.pow(Math.max(0, Math.cos((t - .62) / .38 * 1.5708)), .75));
  for (const i of [0, 8, 1, 7, 2, 6, 3, 5, 4]) { const tl = tails[i]; HT_ong(g, tl, tw, HT_cf, '#3a1420');
    for (let j = 10; j < 40; j += 6) { const u = up(tl, j), r = tw(j / 64) * .5; HT_L(g, tl[j][0] - u[2] * r, tl[j][1] - u[3] * r, tl[j + 3][0] - u[2] * r, tl[j + 3][1] - u[3] * r, HT_IV[1], 1); }
    if (p === 3) for (const j of [14, 26, 38]) { const u = up(tl, j), r = tw(j / 64); HT_P(g, [[tl[j][0] + u[2] * (r - 1) - u[0] * 2.4, tl[j][1] + u[3] * (r - 1) - u[1] * 2.4], [tl[j][0] + u[2] * (r - 1) + u[0] * 2.4, tl[j][1] + u[3] * (r - 1) + u[1] * 2.4], [tl[j][0] + u[2] * (r + 5) + u[0] * 5, tl[j][1] + u[3] * (r + 5) + u[1] * 5]], HT_IV[2]); }
    tips[i] = tl[64]; }
  // chân phía xa
  const chan = (lg) => { const far = lg.far, q = lg.pts, cf = far ? HT_cfx : HT_cf, I = far ? HT_DOX : HT_DO; HT_ong(g, HT_bz(q[0], q[1], q[1], q[2], 18), t => lg.r[0] + (lg.r[1] - lg.r[0]) * t, (t, i) => cf(t * .92, i), '#3a1420');
    const x = lg.paw[0], y = lg.paw[1]; if (lg.up) { HT_E(g, x, y, 4.2, 3.6, I[1]); HT_E(g, x - .4, y - .6, 3.2, 2.5, I[2]); for (const d of [[-4.5, -3.4], [-5.4, -.6], [-4.6, 2.2]]) HT_L(g, x - 2.6, y + d[1] * .5, x + d[0] - (p === 3 ? 1.6 : 0), y + d[1], '#fff8e0', 1); }
    else { HT_E(g, x, y, 5, 2.6, I[1]); HT_E(g, x - .4, y - .7, 4, 1.6, I[2]); for (const d of [-4.6, -2.4, -.2]) { HT_L(g, x + d, y + .6, x + d - 1.2 - (p === 3 ? 1.4 : 0), y + 2.2, '#fff8e0', 1); } } };
  P.legs.filter(l => l.far).forEach(chan);
  // gai lông dọc sống lưng và gáy
  const gai = (pts, rf, st, h, col) => { for (let i = 2; i < pts.length - 1; i += st) { const u = up(pts, i), r = rf(i / (pts.length - 1)), bx = pts[i][0] + u[2] * (r - 1.5), by = pts[i][1] + u[3] * (r - 1.5); HT_P(g, [[bx - u[0] * 2.6, by - u[1] * 2.6], [bx + u[0] * 2.6, by + u[1] * 2.6], [bx + u[2] * h - u[0] * h * .7, by + u[3] * h - u[1] * h * .7]], col); } };
  gai(sp, trf, p === 3 ? 3 : 4, p === 3 ? 9 : 3.6, HT_IV[2]); gai(nk, nrf, 3, p === 3 ? 8 : 3.4, HT_IV[2]);
  // thân: hông, mình, ngực, cổ
  const cI = () => HT_IV; { const h = P.hip, c = P.chest; HT_E(g, h[0], h[1], h[2], h[3], HT_IV[0]); HT_E(g, c[0], c[1], c[2], c[3], HT_IV[0]); HT_ong(g, sp, trf, cI);
    HT_E(g, h[0] - .6, h[1] - 1.4, h[2] * .93, h[3] * .88, HT_IV[1]); HT_E(g, h[0] - 1.6, h[1] - 3, h[2] * .76, h[3] * .68, HT_IV[2]); HT_E(g, h[0] - 5, h[1] - 7, h[2] * .26, h[3] * .16, HT_IV[3]);
    HT_E(g, c[0] - .5, c[1] - 1.2, c[2] * .93, c[3] * .88, HT_IV[1]); HT_E(g, c[0] - 1.2, c[1] - 2.4, c[2] * .76, c[3] * .7, HT_IV[2]);
    HT_ong(g, nk, nrf, cI);
    // bờm ngực
    for (const d of [[-.9, -.5, -5, 7], [-.6, .2, -5, 8], [-.2, .7, -3, 8], [.25, .85, -1, 6]]) { const x = c[0] + d[0] * c[2], y = c[1] + d[1] * c[3]; HT_P(g, [[x - 2.6, y - 3], [x + 3, y - 1], [x + d[2], y + d[3] * (p === 3 ? 1.5 : 1)]], HT_IV[3]); HT_L(g, x + 2.6, y - .6, x + d[2] + .8, y + d[3] * .8, HT_IV[1], 1); }
    // hoa văn đỏ ở hông và vai
    const m = P.mark, R = HT_DO[2]; pl(g, [[m[0] - 5, m[1] - 3], [m[0], m[1] - 6], [m[0] + 5, m[1] - 3], [m[0] + 4, m[1] + 2], [m[0], m[1] + 3], [m[0] - 1, m[1]]].map(q => HT_p(q[0], q[1])), R, 1.3 * k); HT_L(g, m[0] - 8, m[1] + 2, m[0] - 4, m[1] + 6, HT_DO[1], 1.2); HT_L(g, m[0] + 7, m[1] + 4, m[0] + 3, m[1] + 8, HT_DO[1], 1.2);
    HT_L(g, c[0] + 3, c[1] - 6, c[0] + 7, c[1] - 2, R, 1.2); HT_L(g, c[0] + 1, c[1] - 3, c[0] + 5, c[1] + 1, HT_DO[1], 1.2); }
  P.legs.filter(l => !l.far).forEach(chan);
  // chuỗi hạt và lá bùa
  { const hb = HT_bz(P.hat[0], P.hat[1], P.hat[2], P.hat[3], 9); const bm = hb[5]; HT_L(g, bm[0], bm[1], bm[0] - .5, bm[1] + 4, '#8a2a10', 1); HT_P(g, [[bm[0] - 3.4, bm[1] + 3.4], [bm[0] + 2.6, bm[1] + 3.4], [bm[0] + 2.6, bm[1] + 13], [bm[0] - 3.4, bm[1] + 13]], '#ffd23c'); HT_P(g, [[bm[0] - 3.4, bm[1] + 3.4], [bm[0] - 1.6, bm[1] + 3.4], [bm[0] - 1.6, bm[1] + 13], [bm[0] - 3.4, bm[1] + 13]], '#fff6b0');
    HT_L(g, bm[0] - .4, bm[1] + 5, bm[0] - .4, bm[1] + 11, '#b0261a', 1); HT_L(g, bm[0] - 2, bm[1] + 6.4, bm[0] + 1.4, bm[1] + 6.4, '#b0261a', 1); HT_L(g, bm[0] - 2, bm[1] + 9.4, bm[0] + 1.4, bm[1] + 9.4, '#b0261a', 1);
    hb.forEach((q, i) => { const big = i === 5, c = i % 2 ? ['#8a2a10', '#e8442a', '#ffb070'] : ['#1a5a4a', '#3ad0a0', '#c8fff0']; HT_E(g, q[0], q[1], big ? 2.6 : 1.9, big ? 2.6 : 1.9, big ? '#c48a10' : c[0]); HT_E(g, q[0] - .2, q[1] - .3, big ? 1.9 : 1.3, big ? 1.9 : 1.3, big ? '#ffd23c' : c[1]); HT_D(g, q[0] - .8, q[1] - 1, big ? '#fff6b0' : c[2]); }); }
  // đầu
  T.ox = P.head[0]; T.oy = P.head[1]; T.a = P.head[2]; HT_dau(g, p); const eye = HT_p(-5, -4); T.ox = 0; T.oy = 0; T.a = 0;
  vien(g);
  // sau viền: mắt rực, lửa ma đầu đuôi, lửa trùm thân
  if (p >= 2) { const ec = p === 3 ? '#ffd0ff' : '#e08cff'; for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + .4; line(g, eye[0] + Math.cos(a) * 6 * k, eye[1] + Math.sin(a) * 4.5 * k, eye[0] + Math.cos(a) * 9 * k, eye[1] + Math.sin(a) * 7 * k, ec, 1); } }
  if (p === 3) { for (let i = 1; i < sp.length; i += 4) { const u = up(sp, i), r = trf(i / 26); HT_lua(g, sp[i][0] + u[2] * (r - 2) + 2, sp[i][1] + u[3] * (r - 2), 12 + i % 3 * 3, 4.4, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 3); }
    for (const lg of P.legs) if (!lg.up) HT_lua(g, lg.paw[0] + 3, lg.paw[1] + 2, 12, 4.6, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 2);
    tails.forEach((tl, i) => { const j = 20 + (i * 7) % 24; HT_lua(g, tl[j][0], tl[j][1], 10, 3.6, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 2); });
    for (let i = 0; i < 26; i++) { const x = (i * 53 + 17) % P.w, y = (i * 41 + 5) % (P.gy - 24); HT_D(g, x, y, i % 3 ? '#ffd23c' : '#ff8a1e'); } }
  tips.forEach((q, i) => { const s = (p === 3 ? 1.25 : 1) * (i % 2 ? 1 : 1.15); HT_lua(g, q[0], q[1] + 2, 11 * s, 3.6 * s, HT_MA, 1.5); HT_E(g, q[0], q[1], 3.4 * s, 3 * s, HT_MA[1]); HT_E(g, q[0], q[1] + .2, 2.2 * s, 1.9 * s, HT_MA[2]); HT_E(g, q[0], q[1] + .4, 1 * s, .9 * s, HT_MA[3]); HT_D(g, q[0] + 3, q[1] - 13 * s, HT_MA[2]); HT_D(g, q[0] - 4, q[1] - 8 * s, HT_MA[1]); });
  T.k = 1; g.foot = Math.round(P.gy * k); return g; }
// pha 2: phân thân mờ màu lửa ma ở hai bên
function HT_phanThan(g0) { const mx = 58, g = S(g0.w + mx * 2, g0.h + 8); const st = (ox, oy, al) => { for (let y = 0; y < g0.h; y++) for (let x = 0; x < g0.w; x++) { const c = g0.d[y * g0.w + x]; if (!c) continue; const X = x + ox, Y = y + oy; if (X < 0 || Y < 0 || X >= g.w || Y >= g.h || g.d[Y * g.w + X]) continue;
      g.d[Y * g.w + X] = al ? ((c === OL || c === '#0a0c1e') ? 'rgba(170,235,255,' + (al + .3) + ')' : ((x + y) % 2 ? 'rgba(90,170,255,' + al + ')' : 'rgba(150,110,255,' + al + ')')) : c; } };
  st(mx, 8, 0); st(mx - 30, 4, .34); st(mx + 28, 4, .3); st(mx - 56, 0, .17); st(mx + 54, 0, .15); g.foot = g0.foot + 8; return g; }
const QH = {};
QH.chon = 1;
QH.hoTinh = function (v, p) { v = v || 1; p = p || 1; const g = HT_than(v, p); return p === 2 ? HT_phanThan(g) : g; };
// nền lâu đài đỏ than
// ================= PHẦN 2: máy hoạt hình =================
// Máy hoạt hình: cắt hình gốc thành từng bộ phận (càng, chân, đuôi...), xoay / uốn / co giãn từng bộ phận
// theo thời gian, rồi tô lại viền tối cho từng khung. Hình đứng yên giống hệt bản chốt.
const MA = G.monsterArt = { list: [], loi: [], fps: 12, det: 1 };
const DEFS = {}; MA._defs = DEFS;
const PI = Math.PI, TAU = PI * 2;
const sn = u => Math.sin(u * TAU), cs = u => Math.cos(u * TAU);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const EASE = { lin: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t), io: t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t),
  back: t => { const x = t - 1; return 1 + 2.70158 * x * x * x + 1.70158 * x * x; },
  nay: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; } };
// Mốc chuyển động: kf(u, [[0, 0], [.3, -20, 'out'], [1, 0, 'back']]) -> giá trị tại u. Kiểu chuyển: lin, in, out, io (mặc định), back (vọt quá rồi về), nay (nảy).
function kf(u, K) { if (u <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * EASE[b[2] || 'io']((u - a[0]) / ((b[0] - a[0]) || 1)); } return K[K.length - 1][1]; }
// Tiến độ 0..1 của đoạn [a, b] bên trong u.
function seg(u, a, b) { return clamp((u - a) / (b - a), 0, 1); }
// Số ngẫu nhiên cố định 0..1 theo (x, y, s).
function hh(x, y, s) { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 7, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
// Bọc hàm viền của bản chốt để giữ lại lớp "thân chưa viền" (pre) và lớp hiệu ứng vẽ sau viền.
function vien(g) { if (g.pre) g.nhieu = true; else g.pre = g.d.slice(); vien0(g); g.sauVien = g.d.slice(); return g; }
const XOA = '';

// ---------- chuẩn bị hình gốc và mặt nạ bộ phận ----------
const GOC_CACHE = {};
function trongHinh(s, x, y) {
  if (Array.isArray(s)) return x >= s[0] && x < s[2] + 1 && y >= s[1] && y < s[3] + 1;
  if (s.e) { const dx = (x - s.e[0]) / s.e[2], dy = (y - s.e[1]) / s.e[3]; return dx * dx + dy * dy <= 1; }
  if (s.p) { let ins = false; const p = s.p; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } return ins; }
  return false;
}
// hv: biến thể hình (vd 'xu' lúc xù gai, 'phong' lúc phồng), do cử động chọn qua an.hinh(u)
function goc(d, ph, hv) {
  const key = d.id + '|' + ph + '|' + (hv || ''); if (GOC_CACHE[key]) return GOC_CACHE[key];
  const g = d.luoi(ph, hv), w = g.w, h = g.h, n = w * h, b = bbox(g);
  const B = { w, h, cx: g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, foot: g.foot != null ? g.foot : b.y1 + 1, bw: b.w, bh: b.h, bb: b, g };
  if (d.chan != null) B.foot = typeof d.chan === 'function' ? d.chan(ph) : d.chan;
  if (d.tam != null) B.cx = typeof d.tam === 'function' ? d.tam(ph) : d.tam;
  B.foot = Math.round(B.foot); B.bh = B.foot - b.y0;
  if (g.pre && !g.nhieu && !d.giuVien) { B.pre = g.pre; B.fxl = new Array(n).fill(null); let co = false; for (let i = 0; i < n; i++) if (g.d[i] !== g.sauVien[i]) { B.fxl[i] = g.d[i] || XOA; co = true; } if (!co) B.fxl = null; B.A = true; }
  else { B.pre = g.d.slice(); B.fxl = null; B.A = false; }
  const occ = i => B.pre[i] || (B.fxl && B.fxl[i]);
  const pd = (typeof d.parts === 'function' ? d.parts(ph, hv) : d.parts) || [];
  B.owner = new Int16Array(n); B.keep = new Uint8Array(n); B.parts = []; B.pi = {};
  pd.forEach((p, k) => { const idx = k + 1, P = { n: p.n, pv: p.pv, z: p.z == null ? 1 : p.z, idx, keep: p.keep == null ? 1.5 : p.keep, cha: p.cha, L: p.L || 0 }; B.parts.push(P); B.pi[p.n] = P;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!occ(i)) continue; let ins = false; for (const s of p.m) { if (s.tru) { if (trongHinh(s.tru, x + .5, y + .5)) ins = false; } else if (trongHinh(s, x + .5, y + .5)) ins = true; }
      if (ins && p.mau && p.mau.indexOf(B.pre[i]) < 0) ins = false; if (ins && p.kmau && p.kmau.indexOf(B.pre[i]) >= 0) ins = false; if (ins) B.owner[i] = idx; } });
  for (const P of B.parts) { let L = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (B.owner[i] !== P.idx) continue; const dd = Math.hypot(x + .5 - P.pv[0], y + .5 - P.pv[1]); if (dd > L) L = dd; if (dd <= P.keep) B.keep[i] = 1; } if (!P.L) P.L = Math.max(1, L);
    P.chain = []; let q = P, guard = 0; while (q && guard++ < 8) { P.chain.unshift(q.idx); q = q.cha ? B.pi[q.cha] : null; } }
  B.M = Math.ceil(Math.max(b.w, B.bh) * (d.le || .3)) + 10;
  return GOC_CACHE[key] = B;
}
MA._goc = (id, ph, hv) => goc(DEFS[id], ph || 1, hv);

// ---------- tư thế ----------
function Pose(d, B, anim, u, t, o, dir, face, ph) {
  this.d = d; this.B = B; this.anim = anim; this.u = u; this.t = t; this.o = o; this.dir = dir; this.face = face; this.phase = ph;
  this.fx = Math.cos(dir); this.fy = Math.sin(dir); this.aim = this.fy < -.5 ? -1 : this.fy > .5 ? 1 : 0;
  this.x = 0; this.y = 0; this.h = d.bay ? (d.cao || 8) : 0; this.sx = 1; this.sy = 1; this.rot = 0; this.sh = 0; this.a = 1; this.flash = 0; this.tint = null; this.tan = null; this.bong = 1;
  this.p = {}; this._u = []; this._o = []; this.bongMa = null;
}
Pose.prototype = {
  P(n) { return this.p[n] || (this.p[n] = { r: 0, dx: 0, dy: 0, sx: 1, sy: 1, b: 0, w: 0, wp: 0, wk: .3 }); },
  // xoay bộ phận n thêm deg độ (dương = theo chiều kim đồng hồ trên hình gốc mặt quay trái)
  r(n, deg) { this.P(n).r += deg; return this; },
  // dời bộ phận (theo hệ hình gốc: x âm = về phía trước mặt)
  m(n, dx, dy) { const q = this.P(n); q.dx += dx || 0; q.dy += dy || 0; return this; },
  // uốn cong dần về phía ngọn (đuôi, râu, tua): ngọn lệch deg độ
  b(n, deg) { this.P(n).b += deg; return this; },
  // lượn sóng dọc bộ phận: biên độ deg, pha (vòng 0..1), độ dày sóng
  w(n, deg, pha, k) { const q = this.P(n); q.w = deg; q.wp = (pha || 0) * TAU; if (k) q.wk = k; return this; },
  // co giãn bộ phận quanh khớp
  s(n, sx, sy) { const q = this.P(n); q.sx *= sx; q.sy *= (sy == null ? sx : sy); return this; },
  // nhún thở: thân phình / xẹp quanh chân
  tho(amp, u) { const v = sn(u == null ? this.u : u) * (amp || .03); this.sy *= 1 + v; this.sx *= 1 - v * .7; return this; },
  // tiến n điểm ảnh về phía mặt đang quay; theo(n): tiến theo hướng đòn (dir)
  tien(n) { this.x += n * this.face; return this; },
  theo(n) { this.x += n * this.fx; this.y += n * this.fy * MA.det; return this; },
  // đổi điểm trên hình gốc (sx, sy) thành toạ độ quanh chân quái (đã tính lật mặt, độ cao)
  pt(sx, sy) { const B = this.B; return [this.x + (B.cx - sx) * this.face, this.y - this.h + (sy - B.foot)]; },
  under(f) { this._u.push(f); return this; }, over(f) { this._o.push(f); return this; },
  // hiệu ứng mặc định của đòn thường (vùng báo trước, vệt chém, đạn...) theo d.don
  fxBao(u) { DON.bao(this, u == null ? this.u : u); return this; }, fxDon(u) { DON.don(this, u == null ? this.u : u); return this; },
};

// ---------- dựng một khung hình từ tư thế ----------
function ghepHinh(B, P) {
  const M = B.M, w = B.w, h = B.h, W = w + 2 * M, H = h + 2 * M, o1 = new Array(W * H).fill(null), o2 = B.fxl ? new Array(W * H).fill(null) : null;
  const rot = -(P.rot || 0) * PI / 180, cr = Math.cos(rot), sr = Math.sin(rot), sx = P.sx || .001, sy = P.sy || .001, sh = P.sh || 0, Hh = B.bh || 1;
  const T = [], moved = new Uint8Array(B.parts.length + 1);
  for (const p of B.parts) { const q = P.p[p.n]; if (q && (q.r || q.dx || q.dy || q.b || q.w || q.sx !== 1 || q.sy !== 1)) T[p.idx] = { px: p.pv[0], py: p.pv[1], r: q.r * PI / 180, dx: q.dx, dy: q.dy, sx: q.sx || .001, sy: q.sy || .001, b: q.b * PI / 180, w: q.w * PI / 180, wp: q.wp, wk: q.wk, L: p.L }; }
  const up = [], dn = [];
  for (const p of B.parts) { let mv = false; for (const k of p.chain) if (T[k]) mv = true; if (mv) { moved[p.idx] = 1; (p.z >= 0 ? up : dn).push(p); } }
  up.sort((a, b) => b.z - a.z); dn.sort((a, b) => b.z - a.z);
  const owner = B.owner, keep = B.keep, pre = B.pre, fxl = B.fxl; let qx = 0, qy = 0;
  const inv = (p, x, y) => { for (const k of p.chain) { const t = T[k]; if (!t) continue; let vx = x - t.dx - t.px, vy = y - t.dy - t.py; const dd = Math.hypot(vx, vy), f = dd / t.L, a = t.r + t.b * Math.min(1.6, f) + (t.w ? t.w * Math.sin(t.wp + dd * t.wk) * Math.min(1, f) : 0), c = Math.cos(a), s = Math.sin(a); const rx = vx * c + vy * s, ry = -vx * s + vy * c; x = t.px + rx / t.sx; y = t.py + ry / t.sy; } qx = x; qy = y; };
  const plain = !rot && sx === 1 && sy === 1 && !sh;
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    let px, py; if (plain) { px = X + .5 - M; py = Y + .5 - M; } else { const ax = X + .5 - M - B.cx, ay = Y + .5 - M - B.foot; let bx = ax * cr - ay * sr, by = ax * sr + ay * cr; by /= sy; bx /= sx; bx += sh * by / Hh; px = B.cx + bx; py = B.foot + by; }
    let hit = -1;
    for (let k = 0; k < up.length; k++) { const p = up[k]; inv(p, px, py); const cx = Math.floor(qx), cy = Math.floor(qy); if (cx >= 0 && cy >= 0 && cx < w && cy < h && owner[cy * w + cx] === p.idx) { hit = cy * w + cx; break; } }
    if (hit < 0) { const cx = Math.floor(px), cy = Math.floor(py); if (cx >= 0 && cy >= 0 && cx < w && cy < h) { const i = cy * w + cx, ow = owner[i]; if ((pre[i] || (fxl && fxl[i])) && (!ow || keep[i] || !moved[ow])) hit = i; } }
    if (hit < 0) for (let k = 0; k < dn.length; k++) { const p = dn[k]; inv(p, px, py); const cx = Math.floor(qx), cy = Math.floor(qy); if (cx >= 0 && cy >= 0 && cx < w && cy < h && owner[cy * w + cx] === p.idx) { hit = cy * w + cx; break; } }
    if (hit >= 0) { o1[Y * W + X] = pre[hit]; if (o2) o2[Y * W + X] = fxl[hit]; }
  }
  const F = { w: W, h: H, d: o1 };
  if (B.A) vien0(F);
  vanhSang(F); // vành sáng mép trên (trước lớp hiệu ứng rời để không viền lên tia sáng, bong bóng)
  if (B.A && o2) for (let i = 0; i < o2.length; i++) if (o2[i] != null) F.d[i] = o2[i] === XOA ? null : o2[i];
  F.ox = M + B.cx; F.oy = M + B.foot; return F;
}
// ---------- vành sáng (rim light) và viền đều cho hình nhỏ trên điện thoại (giai đoạn 3, dt-nhan-vat) ----------
// Làm một lần lúc dựng khung (khung được nhớ trong KHUNG), không tốn thêm gì lúc vẽ.
// 1) Điểm thân nằm ngay dưới viền tối ở MÉP TRÊN hình (phía trên viền là khoảng trống) sáng lên một nấc: ánh sáng từ trên chiếu xuống,
//    lật hình trái/phải vẫn đúng. Hai bên sườn sáng nhẹ hơn. Tách thân quái khỏi nền tối cùng tông (lợn rừng nâu trên đất nâu).
// 2) Viền tối 1 điểm ảnh: mọi khung đều đã được tô viền lại sau khi xoay bộ phận (vien0 ở trên), đã kiểm: cả 36 con.
// Cường độ: G.VFX.vien (0 = tắt, như cũ). Đổi G.VFX.vien lúc đang chơi thì gọi G.monsterArt.xoaNho() để dựng lại khung.
const SANG = new Map();
function laTo(col) { return !col || col === OL || col === '#0a0c1e' || col === '#1c0f18' || doSang(col) < 13; }
const DOSANG = new Map();
function doSang(col) { let v = DOSANG.get(col); if (v != null) return v; v = 999; if (col[0] === '#' && col.length === 7) { const n = parseInt(col.slice(1), 16); v = ((n >> 16) * .3 + ((n >> 8) & 255) * .55 + (n & 255) * .15) / 2.55; } DOSANG.set(col, v); return v; }
function sangLen(col, k) { const key = col + k; let s = SANG.get(key); if (s) return s; s = col;
  if (col[0] === '#' && col.length === 7) { const n = parseInt(col.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, m = (a, t) => Math.round(a + (t - a) * k);
    s = '#' + ((1 << 24) + (m(r, 255) << 16) + (m(g, 246) << 8) + m(b, 222)).toString(16).slice(1); }
  SANG.set(key, s); return s; }
function vanhSang(F) {
  const k = G.VFX && G.VFX.vien != null ? +G.VFX.vien : 1; if (!(k > 0)) return;
  const W = F.w, H = F.h, d = F.d, tren = .38 * Math.min(1.5, k), ben = .15 * Math.min(1.5, k);
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x, c = d[i]; if (!c || laTo(c)) continue;
    const u = d[i - W];
    if (u && laTo(u) && !d[i - 2 * W]) { d[i] = sangLen(c, tren); continue; } // mép trên
    if (u && !laTo(u) && ((laTo(d[i - 1]) && d[i - 1] && !d[i - 2]) || (laTo(d[i + 1]) && d[i + 1] && !d[i + 2]))) d[i] = sangLen(c, ben); } // hai sườn, nhẹ hơn
}
MA._ghep = ghepHinh;
function taoCanvas(w, h) { let cv; if (typeof document !== 'undefined') { cv = document.createElement('canvas'); cv.width = w; cv.height = h; } else cv = new OffscreenCanvas(w, h); return cv; }
// Các kiểu tan rã / hiện hình ở mức điểm ảnh. T = {k: kiểu, u: 0..1, mau: [màu hạt]}
function tanRa(put, F, T, B, E) {
  const W = F.w, H = F.h, u = clamp(T.u, 0, 1), k = T.k, mau = T.mau || ['#ffffff'], ox = F.ox, oy = F.oy, bh = B.bh, bw = B.bw, top = oy - bh, size = Math.max(bw, bh), mcx = ox, mcy = oy - bh / 2, sd = T.hat || 0;
  const cs2 = Math.max(2, Math.round(size / 9));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let c = F.d[y * W + x]; if (!c) continue; const r = hh(x, y, sd); let nx = x, ny = y;
    if (k === 'vo' || k === 'no') { const q = k === 'vo' ? cs2 : (T.co || 2), gx = Math.floor(x / q), gy = Math.floor(y / q), r1 = hh(gx, gy, 1), r2 = hh(gx, gy, 2), r3 = hh(gx, gy, 3); if (u > .45 + .55 * r3) continue; if (k === 'no' && r < u * .95) continue; // nổ: mảnh 2 điểm, thưa dần khi bay (bớt đám bụi điểm ảnh che sân)
      let dx = (gx + .5) * q - mcx, dy = (gy + .5) * q - mcy; const dl = Math.hypot(dx, dy) || 1; dx = dx / dl + (r1 - .5) * .9; dy = dy / dl + (r2 - .5) * .9 - (k === 'vo' ? .5 : 0); const e = 1 - (1 - u) * (1 - u), sp = size * (k === 'vo' ? .55 : .62) * (.35 + .65 * r1);
      nx = x + dx * sp * e; ny = y + dy * sp * e + (k === 'vo' ? size * .9 * u * u : 0); if (k === 'vo' && ny > oy - 1) ny = oy - 1 - (r2 * 2 | 0); if (u < .05 && !T.hien) c = '#ffffff'; else if (r > 1.25 - u) c = mau[(r1 * mau.length) | 0]; }
    else if (k === 'tan') { if (r < u * 1.25 - .3) continue; const e = Math.pow(1 - u, 1.6); ny = oy - (oy - y) * (e * .95 + .05) ; nx = mcx + (x - mcx) * (1 + u * .9) + Math.sin(y * .7 + u * 9) * u * 1.5; if (r > 1.3 - u * 1.2) c = mau[(r * 7 % 1 * mau.length) | 0]; }
    else if (k === 'chay') { const yb = top - 4 + u * (bh + 12), dd = yb - y; if (dd > 0) { const life = dd / (8 + r * 14); if (life > 1 || r < .45) continue; ny = y - dd * (.5 + r) * .8; nx = x + Math.sin(dd * .4 + r * 6) * 2 * life; c = mau[Math.min(mau.length - 1, (life * mau.length) | 0)]; } else if (dd > -2) c = '#fff6b0'; else if (dd > -5 && r < .6) c = '#ff8a1e'; }
    else if (k === 'ra') { const del = r * .45 + (y - top) / bh * .15, tt = u - del; if (tt > 0) { ny = Math.min(oy - 1 - ((r * 3) | 0), y + size * 2.4 * tt * tt); nx = x + (hh(x, y, 5) - .5) * tt * size * .5; if (ny >= oy - 3) { if (u > .7 + r * .3) continue; c = mau[(r * mau.length) | 0]; } } }
    else if (k === 'hon') { if (r < u * 1.2 - .12) continue; const a = u * (.4 + r) * size * .9; ny = y - a; nx = x + Math.sin(u * 7 + r * 6 + y * .2) * 4 * u; if (r * .8 + .1 < u) c = mau[(hh(x, y, 4) * mau.length) | 0]; }
    else if (k === 'chim') { ny = y + Math.round(u * (bh + 2)); if (ny >= oy) continue; }
    else if (k === 'bui') { const del = (T.trai ? (x - (ox - bw / 2)) : ((ox + bw / 2) - x)) / bw * .45 + r * .2, tt = u - del; if (tt > 0) { if (tt > .25 + r * .3) continue; nx = x + (T.trai ? -1 : 1) * tt * size * 1.6 * (.5 + r); ny = y + Math.sin(tt * 14 + r * 6) * 3 - tt * size * (T.len == null ? .4 : T.len); c = mau[(r * mau.length) | 0]; } }
    else if (k === 'tu') { const a = r * TAU, e = 1 - u, dist = size * 1.1 * e * e * (.3 + hh(x, y, 2)); if (u < r * .5) continue; nx = x + Math.cos(a + e * 3) * dist; ny = y + Math.sin(a + e * 3) * dist; if (e > .25) c = mau[(r * mau.length) | 0]; }
    else if (k === 'heo') { const del = r * .5; if (u > del + .15) { const lum = (parseInt(c.slice(1, 3), 16) * .3 + parseInt(c.slice(3, 5), 16) * .5 + parseInt(c.slice(5, 7), 16) * .2) || 0; c = mau[clamp((lum / 256 * mau.length) | 0, 0, mau.length - 1)]; } const tt = u - .5 - r * .3; if (tt > 0) { ny = Math.min(oy - 1, y + size * 2.2 * tt * tt); nx = x + Math.sin(tt * 12 + r * 6) * 3; if (ny >= oy - 1 && u > .85) continue; } }
    else if (k === 'quet') { const yb = top + (T.len ? (1 - u) : u) * (bh + 2); if (T.len ? y < yb : y > yb) continue; if (Math.abs(y - yb) < 2) c = mau[0]; }
    put(nx, ny, c); }
}
const KHUNG = new Map();
function veKhung(B, P, key) {
  let fr = key && KHUNG.get(key); if (fr) return fr;
  const F = ghepHinh(B, P), E = P.tan ? Math.ceil(Math.max(B.bw, B.bh) * .7) + 16 : 0, cv = taoCanvas(F.w + 2 * E, F.h + 2 * E), c = cv.getContext('2d'); let last = null;
  const put = (x, y, col) => { if (col !== last) { c.fillStyle = col; last = col; } c.fillRect(Math.round(x) + E, Math.round(y) + E, 1, 1); };
  if (P.tan) tanRa(put, F, P.tan, B, E);
  else for (let y = 0; y < F.h; y++) { let x = 0; while (x < F.w) { const col = F.d[y * F.w + x]; if (!col) { x++; continue; } let x1 = x + 1; while (x1 < F.w && F.d[y * F.w + x1] === col) x1++; if (col !== last) { c.fillStyle = col; last = col; } c.fillRect(x + E, y + E, x1 - x, 1); x = x1; } }
  fr = { cv, ox: Math.round(F.ox) + E, oy: Math.round(F.oy) + E, sil: {} };
  if (key) { if (KHUNG.size > 2500) KHUNG.clear(); KHUNG.set(key, fr); } return fr;
}
function bongHinh(fr, col) { let s = fr.sil[col]; if (s) return s; s = taoCanvas(fr.cv.width, fr.cv.height); const c = s.getContext('2d'); c.drawImage(fr.cv, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, s.width, s.height); return fr.sil[col] = s; }

// ---------- bộ vẽ hiệu ứng kiểu điểm ảnh (toạ độ quanh chân quái; mọi thứ xoay được theo góc bất kỳ) ----------
const F = MA.fx = {};
F.px = (c, x, y, col, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); };
F.a = (c, a) => { c.globalAlpha = clamp(a, 0, 1); };
F.duong = (c, x0, y0, x1, y1, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), o = Math.floor(th / 2); for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n) - o, Math.round(y0 + (y1 - y0) * i / n) - o, th, th); };
F.elip = (c, x, y, rx, ry, col) => { c.fillStyle = col; x = Math.round(x); y = Math.round(y); for (let j = -Math.ceil(ry); j <= ry; j++) { const t = 1 - (j * j) / (ry * ry || 1); if (t < 0) continue; const hw = Math.round(rx * Math.sqrt(t)); if (hw > 0) c.fillRect(x - hw, y + j, hw * 2, 1); else if (rx >= .5) c.fillRect(x, y + j, 1, 1); } };
F.dia = (c, x, y, r, col) => F.elip(c, x, y, r, r, col);
F.vong = (c, x, y, rx, ry, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.ceil(TAU * Math.max(rx, ry, 1) * 1.3); for (let i = 0; i < n; i++) { const a = i / n * TAU; c.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), th, th); } };
F.cung = (c, x, y, r, a0, a1, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.ceil(Math.abs(a1 - a0) * Math.max(r, 1) * 1.4) + 1; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; c.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * MA.det), th, th); } };
F.cau = (c, x, y, r, cols) => { F.dia(c, x, y, r, cols[0]); if (r >= 2) F.dia(c, x - r * .15, y - r * .2, r * .7, cols[1] || cols[0]); if (cols[2]) F.px(c, x - r * .4, y - r * .5, cols[2], Math.max(1, Math.round(r * .35)), Math.max(1, Math.round(r * .3))); };
F.sao = (c, x, y, r, col) => { c.fillStyle = col; x = Math.round(x); y = Math.round(y); c.fillRect(x - r, y, r * 2 + 1, 1); c.fillRect(x, y - r, 1, r * 2 + 1); };
// Vệt chém hình lưỡi liềm: tâm (x, y), bán kính r, hướng dir, độ mở span (radian), u = tiến độ 0..1 (vệt quét rồi mờ), cols = [đậm, vừa, sáng]
F.liem = (c, x, y, r, dir, span, u, cols, day) => { cols = cols || ['#7cc4ee', '#dff4ff', '#ffffff']; day = day || Math.max(3, r * .28); const sw = clamp(u / .45, 0, 1), fade = clamp((u - .45) / .55, 0, 1), a0 = dir - span / 2, a1 = a0 + span * sw, n = Math.ceil(span * r * 1.5);
  for (let i = 0; i <= n; i++) { const a = a0 + span * i / n; if (a > a1) break; const f = i / n, tail = (a1 - a) / span; if (tail > 1 - fade * .95) continue; const wd = day * Math.sin(PI * f) * (1 - fade * .5); for (let k = 0; k < wd; k++) { const rr = r - k, col = k < 1 ? cols[2] : k < wd * .5 ? cols[1] : cols[0]; if (fade > .5 && ((i + k) & 1)) continue; c.fillStyle = col; c.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * MA.det), 1, 1); } } };
// Tia sét / vết nứt gấp khúc
F.set = (c, x0, y0, x1, y1, seed, col, th, lech) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 6)); let px = x0, py = y0; const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1; for (let i = 1; i <= n; i++) { const f = i / n, o = i < n ? (hh(i, seed, 3) - .5) * (lech || 6) : 0, qx = x0 + (x1 - x0) * f + nx / nl * o, qy = y0 + (y1 - y0) * f + ny / nl * o; F.duong(c, px, py, qx, qy, col, th); px = qx; py = qy; } };
// Chùm hạt bắn ra: n hạt, seed, u 0..1; o = {v: quãng bay, g: rơi, goc: hướng giữa, xoe: độ xoè, cols, to: cỡ hạt}
F.hat = (c, x, y, n, seed, u, o) => { o = o || {}; const cols = o.cols || ['#ffffff'], v = o.v || 16, xoe = o.xoe == null ? TAU : o.xoe, g = o.g || 0; for (let i = 0; i < n; i++) { const r1 = hh(i, seed, 1), r2 = hh(i, seed, 2), r3 = hh(i, seed, 3); if (u > .45 + .55 * r3 || u <= 0) continue; const a = (o.goc || 0) + (r1 - .5) * xoe, e = 1 - (1 - u) * (1 - u), sp = v * (.35 + .65 * r2), s = (o.to || 1) > 1 && u < .5 ? o.to : 1; c.fillStyle = cols[Math.min(cols.length - 1, (u * cols.length) | 0)]; c.fillRect(Math.round(x + Math.cos(a) * sp * e), Math.round(y + Math.sin(a) * sp * e * (o.det || 1) + g * u * u), s, s); } };
// Ngọn lửa bập bùng: gốc (x, y), rộng w, cao h, t giây, cols từ ngoài vào trong
F.lua = (c, x, y, w, h, t, cols, seed) => { cols = cols || ['#c43c10', '#ff8a1e', '#ffd23c', '#fff6b0']; for (let L = 0; L < cols.length; L++) { const f = 1 - L / cols.length * .85, hh2 = h * f, ww = w * f; c.fillStyle = cols[L]; for (let j = 0; j < hh2; j++) { const q = j / hh2, wd = ww * (1 - q) * (.75 + .25 * Math.sin(t * 13 + j * .9 + (seed || 0))), off = Math.sin(t * 9 + j * .45 + (seed || 0) * 2) * q * w * .28; if (wd >= .6) c.fillRect(Math.round(x + off - wd / 2), Math.round(y - j - 1), Math.max(1, Math.round(wd)), 1); } } };
// Cụm khói / bụi nở ra rồi tan
F.khoi = (c, x, y, r, u, cols, seed, n) => { cols = cols || ['#8a8290', '#48424e']; n = n || 5; for (let i = 0; i < n; i++) { const a = hh(i, seed || 0, 1) * TAU, d = r * (.2 + .8 * u) * (.4 + hh(i, seed || 0, 2)), rr = r * .45 * (1 - u) * (.6 + hh(i, seed || 0, 3)); if (rr < .6) continue; F.dia(c, x + Math.cos(a) * d, y + Math.sin(a) * d * .6 - u * r * .5, rr, cols[i % cols.length]); } };
// Vòng sóng lan trên sàn
F.song = (c, x, y, r, u, cols, th) => { cols = cols || ['#ffffff', '#9fd8f5']; const a = 1 - u; if (a <= 0) return; c.save(); c.globalAlpha *= Math.min(1, a * 1.6); F.vong(c, x, y, r * u, r * u * MA.det, cols[0], th || 2); if (u > .15) F.vong(c, x, y, r * u * .8, r * u * .8 * MA.det, cols[1] || cols[0], 1); c.restore(); };
// Vẽ một lưới hình nhỏ (đạn, mảnh...) tâm tại (x, y), xoay rot radian, phóng s
F.luoi = (c, g, x, y, o) => { o = o || {}; const rot = o.rot || 0, s = o.s || 1, b = g.bb || (g.bb = bbox(g)), mx = (b.x0 + b.x1 + 1) / 2, my = (b.y0 + b.y1 + 1) / 2, R = Math.ceil(Math.hypot(b.w, b.h) / 2 * s) + 1, cr = Math.cos(-rot), sr = Math.sin(-rot); let last = null;
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { let ux = (i * cr - j * sr) / s, uy = (i * sr + j * cr) / s; if (o.lat) ux = -ux; const gx = Math.floor(mx + ux), gy = Math.floor(my + uy); if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) continue; const col = g.d[gy * g.w + gx]; if (!col) continue; if (col !== last) { c.fillStyle = o.mau || col; last = col; } c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); } };
// --- vùng báo trước trên sàn (đỏ, đầy dần theo u, chớp sáng khi sắp ra đòn) ---
MA.mauBao = ['rgba(255,60,40,.16)', 'rgba(255,70,45,.34)', '#ff5a46', '#ffe9c8'];
function baoTo(c, x0, y0, x1, y1, trong, u, r0) { const m = MA.mauBao, chop = u > .78 && ((u * 24) | 0) % 2 === 0;
  for (let y = Math.floor(y0); y <= y1; y++) { let run = -1, lv = 0; for (let x = Math.floor(x0); x <= x1 + 1; x++) { const v = x <= x1 ? trong(x + .5, y + .5) : 0; if (v !== lv) { if (lv) { c.fillStyle = lv === 3 ? (chop ? m[3] : m[2]) : m[lv - 1]; c.fillRect(run, y, x - run, 1); } run = x; lv = v; } } } }
// Quạt: tâm (x, y), bán kính r, hướng dir, độ mở span
F.baoQuat = (c, x, y, r, dir, span, u) => { if (MA._tatBao) return; const kd = MA.det, ru = r * clamp(u * 1.15, 0, 1); baoTo(c, x - r - 1, y - r * kd - 1, x + r + 1, y + r * kd + 1, (px, py) => { const dx = px - x, dy = (py - y) / kd, d = Math.hypot(dx, dy); if (d > r) return 0; let da = Math.atan2(dy, dx) - dir; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > span / 2) return 0; if (d > r - 1.2 || (Math.abs(da) > span / 2 - 1.3 / Math.max(d, 1) && span < TAU - .01)) return 3; return d <= ru ? 2 : 1; }, u); };
// Đường thẳng: từ (x, y) theo hướng dir, dài len, rộng rong
F.baoDuong = (c, x, y, len, rong, dir, u) => { if (MA._tatBao) return; const kd = MA.det, cxx = Math.cos(dir), sy = Math.sin(dir), lu = len * clamp(u * 1.15, 0, 1), R = len + rong; baoTo(c, x - R, y - R, x + R, y + R, (px, py) => { const dx = px - x, dy = (py - y) / kd, al = dx * cxx + dy * sy, ac = -dx * sy + dy * cxx; if (al < 0 || al > len || Math.abs(ac) > rong / 2) return 0; if (al < 1.2 || al > len - 1.2 || Math.abs(ac) > rong / 2 - 1.2) return 3; return al <= lu ? 2 : 1; }, u); };
// Vòng tròn: tâm (x, y), bán kính r
F.baoTron = (c, x, y, r, u) => F.baoQuat(c, x, y, r, 0, TAU, u);

// ---------- hiệu ứng đòn thường mặc định, theo d.don = {kieu, tam, mau, rong, xoe, mom: [x, y] trên hình gốc} ----------
const DON = {
  mom(P) { const d = P.d.don || {}, B = P.B; return d.mom ? P.pt(d.mom[0], d.mom[1]) : [P.x, P.y - P.h - B.bh * .45]; },
  bao(P, u) { const d = P.d.don || {}, k = d.kieu || 'chem', tam = d.tam || 24, dir = P.dir;
    P.under(c => { if (k === 'chem') F.baoQuat(c, 0, 0, tam, dir, d.xoe || 1.9, u); else if (k === 'lao') F.baoDuong(c, 0, 0, tam, d.rong || Math.max(10, P.B.bw * .6), dir, u); else if (k === 'ban') F.baoDuong(c, 0, 0, tam, d.rong || 5, dir, u);
      else if (k === 'no' || k === 'gai' || k === 'dap') F.baoTron(c, 0, 0, tam, u); else if (k === 'phun') F.baoQuat(c, 0, 0, tam, dir, d.xoe || 1.1, u); else if (k === 'nem') F.baoTron(c, Math.cos(dir) * tam, Math.sin(dir) * tam * MA.det, d.rong || 12, u); });
    if (k === 'ban' || k === 'phun' || k === 'nem') P.over(c => { const m = DON.mom(P), cols = d.mau || ['#7cc4ee', '#dff4ff', '#ffffff']; F.hat(c, m[0], m[1], 6, 11, 1 - (u * 3 % 1), { v: -7, cols: [cols[1], cols[2] || cols[1]] }); F.dia(c, m[0], m[1], 1 + u * 2, cols[1]); F.px(c, m[0], m[1], '#ffffff'); }); },
  don(P, u) { const d = P.d.don || {}, k = d.kieu || 'chem', tam = d.tam || 24, dir = P.dir, cols = d.mau || ['#7cc4ee', '#dff4ff', '#ffffff'], dx = Math.cos(dir), dy = Math.sin(dir) * MA.det, B = P.B;
    if (k === 'chem') P.over(c => { F.liem(c, dx * 4, dy * 4 - B.bh * .3, tam - 3, dir, d.xoe || 1.9, u, cols); });
    else if (k === 'lao') P.under(c => { for (let i = 0; i < 5; i++) { const f = (i + 1) / 6, a = (1 - u) * (1 - f); if (a <= .05) continue; c.globalAlpha = a; F.duong(c, P.x - dx * (6 + f * tam * .7) - dy * (i - 2) * 3, P.y - dy * (6 + f * tam * .7) + dx * (i - 2) * 3 - B.bh * .3, P.x - dx * (10 + f * tam * .9) - dy * (i - 2) * 3, P.y - dy * (10 + f * tam * .9) + dx * (i - 2) * 3 - B.bh * .3, cols[1], 1); } c.globalAlpha = 1; F.khoi(c, P.x - dx * 8, P.y - dy * 8, 7, u, ['#8a8290', '#5a5460'], 3); });
    else if (k === 'ban') P.over(c => { const m = DON.mom(P), q = seg(u, .1, .85), x = m[0] + dx * tam * q, y = m[1] + dy * tam * q; if (u < .25) F.hat(c, m[0], m[1], 8, 5, u * 4, { v: 9, goc: dir, xoe: 1.4, cols: [cols[2] || cols[1], cols[1]] }); if (q < 1) { for (let i = 1; i < 5; i++) { c.globalAlpha = .7 - i * .15; F.dia(c, x - dx * i * 3, y - dy * i * 3, (d.co || 2.5) * (1 - i * .18), cols[0]); } c.globalAlpha = 1; F.cau(c, x, y, d.co || 2.5, cols); } else F.hat(c, m[0] + dx * tam, m[1] + dy * tam, 10, 7, seg(u, .85, 1), { v: 10, cols: [cols[2] || '#fff', cols[1], cols[0]] }); });
    else if (k === 'no') P.over(c => { const cy = -P.h - B.bh * .4; if (u < .22) { F.dia(c, 0, cy, tam * (.25 + u * 2.4), cols[1]); F.dia(c, 0, cy, tam * (.15 + u * 2), cols[2] || '#fff'); } else if (u < .55) { const e = seg(u, .22, .55); F.vong(c, 0, cy, tam * (.8 + e * .3), tam * (.8 + e * .3), cols[1], Math.max(1, Math.round(4 * (1 - e)))); F.a(c, 1 - e); F.dia(c, 0, cy, tam * .45 * (1 - e), cols[2] || '#fff'); F.a(c, 1); } F.song(c, 0, 0, tam, seg(u, .05, .8), [cols[2] || '#fff', cols[1]], 2); F.hat(c, 0, cy, 26, 9, u, { v: tam * 1.1, cols: [cols[2] || '#fff', cols[1], cols[0]], to: 2 }); F.khoi(c, 0, cy, tam * .7, seg(u, .2, 1), [cols[0], '#48424e'], 4, 7); });
    else if (k === 'gai') P.over(c => { const cy = -P.h - B.bh * .4, q = seg(u, 0, .6), n = d.so || 8; for (let i = 0; i < n; i++) { const a = dir + i / n * TAU, r0 = B.bw * .35 + (tam - B.bw * .35) * q, x = Math.cos(a) * r0, y = cy + Math.sin(a) * r0 * MA.det; if (q < 1) { F.duong(c, x - Math.cos(a) * 5, y - Math.sin(a) * 5, x, y, cols[1], 1); F.px(c, x, y, cols[2] || '#fff'); F.px(c, x - Math.cos(a) * 6, y - Math.sin(a) * 6, cols[0]); } else F.hat(c, x, y, 3, i, seg(u, .6, 1), { v: 5, cols: [cols[1]] }); } });
    else if (k === 'dap') { P.under(c => { F.song(c, 0, 0, tam, seg(u, .1, .9), [cols[2] || '#fff', cols[1]], 2); F.song(c, 0, 0, tam * .7, seg(u, .25, 1), [cols[1], cols[0]], 1); }); P.over(c => { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3; F.hat(c, Math.cos(a) * tam * .5 * u, Math.sin(a) * tam * .5 * u * MA.det, 3, i, u, { v: 8, goc: -PI / 2, xoe: 1.2, g: 14, cols: [cols[1], cols[0]] }); } }); }
    else if (k === 'phun') P.over(c => { const m = DON.mom(P), xo = d.xoe || 1.1, n = d.so || 34; for (let i = 0; i < n; i++) { const r1 = hh(i, 3, 1), r2 = hh(i, 3, 2), ph = (u * 1.6 + r2) % 1, a = dir + (r1 - .5) * xo, rr = (tam - 6) * ph * (u < .8 ? 1 : 1); if (u > .75 && ph < seg(u, .75, 1)) continue; if (u < .2 && ph > u * 5) continue; c.fillStyle = cols[(i + ((ph * 3) | 0)) % cols.length]; const s = ph < .6 ? 2 : 1; c.fillRect(Math.round(m[0] + Math.cos(a) * (6 + rr)), Math.round(m[1] + Math.sin(a) * (6 + rr) * MA.det + ph * ph * (d.roi == null ? 6 : d.roi)), s, s); } });
    else if (k === 'nem') { const tx = dx * tam, ty = dy * tam; P.over(c => { const m = DON.mom(P), q = seg(u, .08, .62); if (q < 1) { const x = lerp(m[0], tx, q), y = lerp(m[1], ty, q) - Math.sin(q * PI) * (d.vong || 22); c.globalAlpha = .3; F.elip(c, lerp(m[0], tx, q), lerp(P.y, ty, q), 3, 1.5, '#000000'); c.globalAlpha = 1; if (d.dan) d.dan(c, x, y, q, P); else { F.cau(c, x, y, d.co || 3, cols); F.px(c, x - dx * 3, y - 3, cols[2] || '#fff'); } } else { const e = seg(u, .62, 1); if (e < .35) F.dia(c, tx, ty - 3, (d.rong || 12) * (.4 + e * 1.6), cols[2] || '#fff'); F.song(c, tx, ty, (d.rong || 12) * 1.1, e, [cols[2] || '#fff', cols[1]], 2); F.hat(c, tx, ty - 3, 18, 6, e, { v: (d.rong || 12) * 1.3, cols: [cols[2] || '#fff', cols[1], cols[0]], to: 2 }); } }); }
  },
};
MA._don = DON;

// ---------- chiêu dùng chung (tinh anh, trùm). Mọi chiêu đều xoay theo P.dir bất kỳ ----------
const CHIEU = MA.chieu = {
  // Lao n lần liên tiếp, mỗi lần lệch hướng một chút (zíc zắc). Mỗi lần: 45% báo trước (vệt đỏ), rồi lao tới và lùi về.
  laoNhieu(P, n, tam, rong, cols, lech) { const u = P.u, k = Math.min(n - 1, Math.floor(u * n)), q = u * n - k, dir = P.dir + (k - (n - 1) / 2) * (lech == null ? .55 : lech), ex = Math.cos(dir), ey = Math.sin(dir) * MA.det, bh = P.B.bh;
    cols = cols || ['#8a8290', '#cbc3c0', '#ffffff'];
    if (q < .45) { const v = q / .45; P.under(c => F.baoDuong(c, 0, 0, tam, rong, dir, v)); P.x -= ex * 3 * v; P.y -= ey * 3 * v; P.sy *= 1 - .08 * v; P.sx *= 1 + .06 * v; if (v > .5) P.x += ((u * 48 | 0) % 2 ? .6 : -.6); }
    else { const v = (q - .45) / .55, f = kf(v, [[0, 0], [.35, 1, 'out'], [.7, 1], [1, 0, 'io']]); P.x += ex * (tam - 6) * f; P.y += ey * (tam - 6) * f; P.sx *= v < .35 ? 1.12 : 1; P.sy *= v < .35 ? .9 : 1;
      if (v < .5) { P.bongMa = [1, 2, 3].map(i => ({ x: -ex * i * 6, y: -ey * i * 6, a: .32 - i * .08, mau: cols[1] })); const ox = P.x, oy = P.y; P.under(c => { for (let i = 0; i < 4; i++) { const o = (i - 1.5) * 3; F.a(c, .6 - v); F.duong(c, ox - ex * 6 - ey * o, oy - ey * 6 + ex * o - bh * .35, ox - ex * (16 + i * 4) - ey * o, oy - ey * (16 + i * 4) + ex * o - bh * .35, cols[1], 1); } F.a(c, 1); F.khoi(c, ox - ex * 10, oy - ey * 10, 7, v * 2, [cols[0], '#48424e'], k + 3); }); }
      if (v > .3 && v < .6) { const tx = ex * tam, ty = ey * tam; P.over(c => F.hat(c, tx, ty - bh * .4, 10, k * 7 + 1, (v - .3) / .3, { v: 12, cols: [cols[2], cols[1], cols[0]] })); } } },
  // Xoay tròn chém quanh mình: hình lật qua lại như đang quay, vệt chém tròn.
  xoay(P, tam, cols, vong) { const u = P.u, bh = P.B.bh; vong = vong || 2; cols = cols || ['#c43c10', '#ffd23c', '#fff6b0'];
    if (u < .35) { const v = u / .35; P.under(c => F.baoTron(c, 0, 0, tam, v)); P.sy *= 1 - .1 * v; P.sx *= 1 + .08 * v; P.rot += -12 * v; }
    else { const v = (u - .35) / .65, a = EASE.out(Math.min(1, v * 1.25)) * vong; const cc = Math.cos(a * TAU); P.sx *= Math.sign(cc || 1) * Math.max(.2, Math.abs(cc)); P.rot += 8 * (1 - v);
      P.over(c => { for (let i = 0; i < vong; i++) { const w = clamp(v * 1.25 * vong - i, 0, 1); if (w > 0 && w < 1) F.liem(c, 0, -bh * .3, tam - 3, P.dir + i * PI + w * TAU, TAU * .85, w, cols, 5); } if (v > .2) F.song(c, 0, 0, tam, seg(v, .2, 1), [cols[2], cols[1]], 2); }); } },
  // Mưa đạn: bắn n quả bay vòng cung, rơi vào n vùng tròn quanh hướng dir; dan(c, x, y, q) vẽ quả đạn (bỏ trống: quả cầu màu cols).
  muaNem(P, n, tam, rong, cols, dan, sauNo) { const u = P.u, m = DON.mom(P); cols = cols || ['#3c5a0c', '#78b818', '#f4ffb0'];
    const T = []; for (let i = 0; i < n; i++) { const a = P.dir + (i - (n - 1) / 2) * (TAU * .7 / n), r = tam * (.55 + .45 * hh(i, 3, 9)); T.push([Math.cos(a) * r, Math.sin(a) * r * MA.det, .3 + i * .07]); }
    P.under(c => { for (const [x, y, t0] of T) if (u < t0 + .25) F.baoTron(c, x, y, rong, clamp(u / (t0 + .25), 0, 1)); });
    P.over(c => { for (let i = 0; i < n; i++) { const [x, y, t0] = T[i], q = seg(u, t0 - .2, t0 + .25), e = seg(u, t0 + .25, t0 + .6); if (q > 0 && q < 1) { const px = lerp(m[0], x, q), py = lerp(m[1], y, q) - Math.sin(q * PI) * 26; if (dan) dan(c, px, py, q); else F.cau(c, px, py, 2.5, cols); }
      if (e > 0 && e < 1) { if (e < .3) F.dia(c, x, y - 2, rong * (.5 + e * 1.5), cols[2]); F.song(c, x, y, rong * 1.1, e, [cols[2], cols[1]], 1); F.hat(c, x, y - 2, 12, i + 5, e, { v: rong * 1.2, cols: [cols[2], cols[1], cols[0]] }); if (sauNo) sauNo(c, x, y, e, i); } } });
    if (u < .3) { const v = u / .3; P.sy *= 1 + .1 * v; P.sx *= 1 - .07 * v; } else { const v = seg(u, .3, .8); P.sy *= 1 + .08 * Math.sin(v * PI * 5) * (1 - v); } },
  // Vòng đạn: bắn n viên toả tròn quanh mình (bắt đầu từ hướng dir), có thể 2 đợt lệch nhau.
  vongDan(P, n, tam, cols, dot) { const u = P.u, bh = P.B.bh, cy = -P.h - bh * .45; cols = cols || ['#c43c10', '#ff8a1e', '#fff6b0']; dot = dot || 1;
    if (u < .35) { const v = u / .35; P.sx *= 1 + .12 * v; P.sy *= 1 + .12 * v; P.flash = v > .6 && ((u * 30) | 0) % 2 ? .4 : 0; P.under(c => { for (let i = 0; i < n * dot; i++) { const a = P.dir + i / (n * dot) * TAU + (i % dot) * PI / n; F.baoDuong(c, Math.cos(a) * 6, Math.sin(a) * 6 * MA.det, tam - 6, 4, a, v); } }); P.over(c => { F.dia(c, 0, cy, 2 + v * 4, cols[1]); F.dia(c, 0, cy, 1 + v * 2, cols[2]); }); }
    else { const k = kf(u, [[.35, 1.15], [.45, .95], [.6, 1]]); P.sx *= k; P.sy *= k;
      P.over(c => { for (let j = 0; j < dot; j++) { const q = seg(u, .35 + j * .15, .85 + j * .15); if (q <= 0 || q >= 1) continue; for (let i = 0; i < n; i++) { const a = P.dir + (i + j * .5) / n * TAU, r = 6 + (tam - 6) * q, x = Math.cos(a) * r, y = cy + Math.sin(a) * r * MA.det + q * bh * .4; for (let t = 1; t < 4; t++) { F.a(c, .6 - t * .15); F.dia(c, x - Math.cos(a) * t * 3, y - Math.sin(a) * t * 3 * MA.det, 2 - t * .4, cols[0]); } F.a(c, 1); F.cau(c, x, y, 2.5, [cols[0], cols[1], cols[2]]); } } if (u < .5) F.song(c, 0, 0, tam * .5, seg(u, .35, .5), [cols[2], cols[1]], 1); }); } },
};

// ---------- bộ cử động chuẩn (dùng khi con quái không tự viết) ----------
const NHAN = { idle: 'Đứng thở', move: 'Di chuyển', tele: 'Báo trước đòn', atk: 'Ra đòn', hit: 'Trúng đòn', die: 'Chết', spawn: 'Xuất hiện', intro: 'Ra mắt', stun: 'Choáng', phase2: 'Chuyển sang pha 2', phase3: 'Chuyển sang pha 3' };
const BUI = ['#8a8290', '#5a5460', '#cbc3c0'];
const CH = MA.chuan = {
  idle(P) { P.tho(.035); if (P.d.bay) { P.h += sn(P.u) * 1.5; P.rot += 2 * sn(P.u + .2); } else { P.rot += 1.5 * sn(P.u + .25); P.sh += .6 * sn(P.u); } }, // thở + lắc lư nhẹ (con không tự viết cử động đứng)
  move(P) { if (P.d.bay) { P.h += sn(P.u * 2) * 1.5; P.rot += -4 + sn(P.u) * 2; P.tho(.03, P.u * 2); } else { const s = Math.abs(sn(P.u)); P.h += s * 2; P.sy *= 1 + s * .06 - .03; P.sx *= 1 - s * .04 + .02; P.rot += sn(P.u) * 3 - 2; } },
  tele(P) { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); P.theo(-3 * k); P.sy *= 1 - .1 * k; P.sx *= 1 + .07 * k; P.rot += -P.aim * 10 * k; if (u > .35) P.x += (((u * 24) | 0) % 2 ? .6 : -.6); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(u); },
  atk(P) { const u = P.u, k = kf(u, [[0, -3], [.18, 8, 'out'], [.45, 6], [1, 0, 'io']]); P.theo(k); const st = kf(u, [[0, .9], [.18, 1.14, 'out'], [.4, .94], [.6, 1.03], [1, 1]]); P.sx *= st; P.sy *= 2 - st; P.rot += -P.aim * 12 * (1 - u) + kf(u, [[0, 0], [.18, -8, 'out'], [1, 0]]); P.fxDon(u); },
  hit(P) { const u = P.u, k = kf(u, [[0, 0], [.15, 1, 'out'], [1, 0, 'io']]); P.tien(-4 * k); P.rot += 9 * k; P.sy *= 1 - .12 * k; P.sx *= 1 + .1 * k; P.flash = u < .3 ? 1 - u * 2.5 : 0; if (u < .5) P.x += ((u * 24 | 0) % 2 ? 1 : -1); },
  // ngã ra (25% đầu) rồi tan theo kiểu của d.chet = {k, mau} hoặc tên kiểu
  die(P) { const u = P.u, d = P.d, ct = typeof d.chet === 'string' ? { k: d.chet } : (d.chet || { k: 'no' }), k = kf(u, [[0, 0], [.12, 1, 'out'], [.3, .6]]); P.tien(-3 * k); P.rot += 10 * k; P.flash = u < .14 ? 1 - u * 5 : 0; if (d.bay) P.h *= 1 - seg(u, .1, .5) * (ct.k === 'hon' || ct.k === 'bui' ? 0 : 1);
    if (ct.k === 'no') { const q = seg(u, .1, .3); P.sx *= 1 + q * .3; P.sy *= 1 + q * .3; }
    if (u > .25) P.tan = { k: ct.k, u: seg(u, .25, 1), mau: ct.mau || BUI, trai: P.face > 0, len: ct.len }; P.bong = 1 - seg(u, .3, .8); },
  // xuất hiện theo d.hien = tên kiểu hoặc {k, mau}
  spawn(P) { const u = P.u, d = P.d, hv = typeof d.hien === 'string' ? { k: d.hien } : (d.hien || { k: 'moc' }), k = hv.k, mau = hv.mau || BUI, bw = P.B.bw, bh = P.B.bh;
    if (k === 'cat' || k === 'nuoc' || k === 'bong') { const q = seg(u, .25, .75), e = EASE.back(q); P.tan = { k: 'chim', u: clamp(1 - e, 0, 1) }; if (e > 1) P.h += (e - 1) * bh * .8; if (u < .6) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.bong = seg(u, .2, .6); const st = kf(u, [[.7, 1], [.8, 1.08], [.9, .96], [1, 1]]); P.sy *= st; P.sx *= 2 - st;
      P.under(c => { if (k === 'cat') { const m = Math.sin(seg(u, 0, .8) * PI); F.elip(c, 0, 1, bw * .5 * m + 2, 2 + m * 2, mau[1] || mau[0]); F.elip(c, 0, 0, bw * .4 * m + 1, 1 + m * 1.5, mau[0]); } else if (k === 'nuoc') { for (let i = 0; i < 3; i++) { const q2 = (u * 1.6 + i / 3) % 1; c.globalAlpha = (1 - q2) * (1 - seg(u, .8, 1)); F.vong(c, 0, 0, bw * (.3 + q2 * .6), bw * (.12 + q2 * .2), mau[i % mau.length], 1); } c.globalAlpha = 1; } else { const m = Math.sin(seg(u, 0, .9) * PI); F.elip(c, 0, 0, bw * .6 * m + 1, (bw * .22 * m + 1), mau[0]); } });
      P.over(c => { if (k === 'bong') return; F.hat(c, 0, -2, 14, 3, seg(u, .2, .8), { v: bw * .7, goc: -PI / 2, xoe: 2.2, g: bh * .9, cols: mau, to: k === 'nuoc' ? 2 : 1 }); F.hat(c, 0, -2, 8, 8, seg(u, .0, .4), { v: bw * .4, goc: -PI / 2, xoe: 2.6, g: 10, cols: mau }); }); }
    else if (k === 'roi') { const q = seg(u, 0, .5); P.h += (1 - q * q) * (hv.cao || 90) * (q < 1 ? 1 : 0); const st = u < .5 ? 1 + .2 * q : kf(u, [[.5, .62], [.68, 1.12, 'out'], [.84, .95], [1, 1]]); P.sy *= st; P.sx *= u < .5 ? 1 - .12 * q : 1 + (1 - st) * .8; P.bong = .3 + .7 * q; if (u >= .5) P.over(c => { const e = seg(u, .5, 1); F.khoi(c, -bw * .45, 0, 7, e, mau, 1); F.khoi(c, bw * .45, 0, 7, e, mau, 2); F.hat(c, 0, 0, 10, 4, e, { v: bw * .7, goc: -PI / 2, xoe: 2.8, g: 12, cols: mau }); }); if (u >= .5 && u < .6) P.y += 1; }
    else if (k === 'moc') { const q = kf(u, [[0, .04], [.15, .1], [.6, 1.14, 'out'], [.78, .94], [.9, 1.03], [1, 1]]); P.sy *= q; P.sx *= kf(u, [[0, .5], [.5, .85], [.6, .9], [.78, 1.06], [1, 1]]); if (u < .5) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.bong = seg(u, 0, .5); P.over(c => { F.hat(c, 0, -1, 14, 2, seg(u, .05, .7), { v: bw * .6, goc: -PI / 2, xoe: 2.4, g: 16, cols: mau }); }); P.under(c => { const m = 1 - seg(u, .6, 1); if (m > 0) F.elip(c, 0, 1, bw * .4 * m + 1, 2 * m + 1, mau[1] || mau[0]); }); }
    else if (k === 'den') { const q = seg(u, .3, .8), s = kf(q, [[0, .08], [.7, 1.1, 'out'], [1, 1]]); P.sx *= s; P.sy *= s; P.h += (1 - q) * 10 + Math.sin(q * PI) * 6; P.rot += (1 - q) * (1 - q) * 140; P.flash = (1 - q) * .8; P.tint = ['#ffb040', (1 - q) * .7]; P.bong = q;
      P.under(c => { const m = 1 - seg(u, .75, 1); if (m > 0) { F.px(c, -3, -9, '#2e1a10', 6, 1); F.px(c, -2, -8, '#b0261a', 4, 6); F.px(c, -1, -7, u < .5 && ((u * 16) | 0) % 2 ? '#fff6b0' : '#ffd23c', 2, 4); F.px(c, -3, -2, '#2e1a10', 6, 1); F.px(c, 0, -12, '#5c3a1e', 1, 3); } }); P.over(c => { const m = Math.sin(seg(u, 0, .8) * PI); if (m > 0) F.lua(c, 0, -4, 6 + m * 8, 6 + m * 14, P.t, null, 1); F.hat(c, 0, -8, 12, 5, seg(u, .25, .9), { v: 18, goc: -PI / 2, xoe: 2.6, cols: ['#fff6b0', '#ffd23c', '#ff8a1e'] }); }); }
    else if (k === 'bay') { const q = EASE.out(seg(u, 0, .8)); P.tien(-(1 - q) * (hv.xa || 46)); P.h += (1 - q) * (hv.cao || 34); P.rot += (1 - q) * -18; P.a = seg(u, 0, .25); P.bong = q; const st = kf(u, [[.8, 1], [.88, .92], [1, 1]]); P.sy *= st; }
    else if (k === 'no') { const q = seg(u, .45, .75), s = kf(q, [[0, .1], [.6, 1.2, 'out'], [1, 1, 'io']]); P.sx *= u < .45 ? .12 + u * .5 : s; P.sy *= u < .45 ? .12 + u * .5 : s; if (u < .45) { P.x += ((u * 24 | 0) % 2 ? .7 : -.7); P.flash = .5; } P.bong = seg(u, .3, .7); P.over(c => { F.hat(c, 0, -bh * .4, 18, 4, seg(u, .45, 1), { v: bw * .9, cols: mau, to: 2 }); F.song(c, 0, 0, bw * .8, seg(u, .45, .9), [mau[0], mau[1] || mau[0]], 1); }); }
    else { const m = { khoi: 'hon', ghep: 'vo', tu: 'tu', bui: 'bui', quet: 'quet' }[k] || 'tu'; if (m === 'tu') P.tan = { k: 'tu', u, mau }; else if (m === 'quet') P.tan = { k: 'quet', u: seg(u, .1, .9), mau, len: 1 }; else P.tan = { k: m, u: 1 - EASE.io(seg(u, 0, .85)), mau, trai: P.face < 0, hien: true }; if (u > .85) { const st = kf(u, [[.85, 1.06], [.93, .96], [1, 1]]); P.sy *= st; } P.bong = seg(u, .3, .9); }
  },
};

// ---------- cử động chung của trùm vùng: chuyển pha, choáng, chết hoành tráng ----------
const TRUM = MA.trum = {
  // Chuyển pha: gồng mình, khí tụ vào, chớp trắng (đổi hình ở giữa), gầm lên với sóng lan. cols = [đậm, vừa, sáng]
  doiPha(P, cols) { const u = P.u, bh = P.B.bh, bw = P.B.bw, cy = -P.h - bh * .5, R = Math.max(bw, bh) * .75;
    if (u < .45) { const v = u / .45; P.x += (((u * 40) | 0) % 2 ? 1 : -1) * v * 1.5; P.sy *= 1 - .06 * v; P.sx *= 1 + .05 * v; P.tint = [cols[1], v * .45];
      P.over(c => { for (let i = 0; i < 26; i++) { const a = hh(i, 1, 3) * TAU, q = (v * 1.8 + hh(i, 2, 3)) % 1, r = R * (1.1 - q); F.a(c, q); F.px(c, Math.cos(a) * r, cy + Math.sin(a) * r * .8, i % 3 ? cols[1] : cols[2], q > .6 ? 2 : 1, q > .6 ? 2 : 1); } F.a(c, 1); }); }
    else if (u < .58) { const v = seg(u, .45, .58); P.flash = 1 - v * .5; P.sx *= 1 + .12 * v; P.sy *= 1 + .12 * v; P.over(c => { F.vong(c, 0, cy, R * (.5 + v * .8), R * .4 * (1 + v), '#ffffff', 3); F.hat(c, 0, cy, 24, 2, v, { v: R * .9, cols: ['#ffffff', cols[2]], to: 2 }); }); }
    else { const v = seg(u, .58, 1), k = kf(v, [[0, 1.12], [.25, .96], [.5, 1.03], [1, 1]]); P.sx *= k; P.sy *= k; P.tint = [cols[1], .4 * (1 - v)]; P.x += v < .5 ? (((u * 40) | 0) % 2 ? 1 : -1) : 0;
      P.under(c => { F.song(c, 0, 0, R * 1.6, v, [cols[2], cols[1]], 3); F.song(c, 0, 0, R * 1.2, seg(v, .15, 1), [cols[1], cols[0]], 2); });
      P.over(c => { F.hat(c, 0, cy, 40, 7, v, { v: R * 1.3, cols: [cols[2], cols[1], cols[0]], to: 2 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .2, r0 = R * .4, r1 = R * (.6 + v * 1.1); F.a(c, 1 - v); F.duong(c, Math.cos(a) * r0, cy + Math.sin(a) * r0, Math.cos(a) * r1, cy + Math.sin(a) * r1, cols[2], 1); } F.a(c, 1); }); } },
  // Choáng: lảo đảo, sao vàng xoay quanh đỉnh đầu (hx, hy là điểm trên hình gốc).
  choang(P, hx, hy) { const u = P.u; P.rot += 5 * sn(u); P.sh += 3 * sn(u + .25); P.sy *= .96 + .02 * sn(u * 2); const q = P.pt(hx, hy);
    P.over(c => { for (let i = 0; i < 4; i++) { const a = (u + i / 4) * TAU, x = q[0] + Math.cos(a) * 20, y = q[1] - 10 + Math.sin(a) * 6; const truoc = Math.sin(a) > 0; F.a(c, truoc ? 1 : .6); F.sao(c, x, y, truoc ? 3 : 2, i % 2 ? '#ffd23c' : '#fff6b0'); F.dia(c, x, y, 1.2, '#ffffff'); } F.a(c, 1); }); },
  // Chết hoành tráng: rung dữ dội, nổ lốp bốp khắp thân, tia sáng toả, chớp trắng lớn, rồi tan theo kiểu k.
  chetLon(P, k, cols, mauTan) { const u = P.u, B = P.B, bh = B.bh, bw = B.bw, cy = -P.h - bh * .5, R = Math.max(bw, bh) * .6;
    if (u < .55) { const v = u / .55; P.x += (((u * 48) | 0) % 2 ? 1 : -1) * (1 + v * 2); P.rot += 6 * v * sn(u * 6); P.flash = ((u * 24) | 0) % 3 === 0 ? .7 : 0; P.sy *= 1 - .05 * v;
      P.over(c => { for (let i = 0; i < 9; i++) { const t0 = i / 9 * .9, e = seg(v, t0, t0 + .22); if (e <= 0 || e >= 1) continue; const x = (hh(i, 3, 1) - .5) * bw * .8, y = cy + (hh(i, 4, 1) - .5) * bh * .8; if (e < .3) F.dia(c, x, y, 3 + e * 14, '#ffffff'); F.dia(c, x, y, (2 + e * 7) * (1 - e), cols[1]); F.hat(c, x, y, 10, i, e, { v: 16, cols: [cols[2], cols[1], cols[0]], to: 2 }); }
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + v, L = R * (.3 + v * 1.6); F.a(c, v * .7); F.duong(c, Math.cos(a) * 8, cy + Math.sin(a) * 8, Math.cos(a) * L, cy + Math.sin(a) * L, i % 2 ? cols[2] : '#ffffff', i % 2 ? 1 : 2); } F.a(c, 1); }); }
    else { const v = seg(u, .55, 1); P.tan = { k, u: seg(u, .6, 1), mau: mauTan || cols, trai: P.face > 0 }; P.flash = v < .15 ? 1 : 0; P.bong = 1 - v;
      P.under(c => { F.song(c, 0, 0, R * 2.2, v, [cols[2], cols[1]], 3); F.song(c, 0, 0, R * 1.6, seg(v, .1, 1), ['#ffffff', cols[2]], 2); });
      P.over(c => { if (v < .3) { const e = v / .3; F.vong(c, 0, cy, R * (.6 + e * 1.4), R * (.5 + e * 1.1), '#ffffff', Math.max(1, Math.round(4 * (1 - e)))); F.dia(c, 0, cy, R * .35 * (1 - e), '#ffffff'); } F.hat(c, 0, cy, 50, 3, v, { v: R * 2, cols: ['#ffffff', cols[2], cols[1], cols[0]], to: 2 }); }); } },
};
const DMAC = { idle: [1.2, true], move: [.6, true], tele: [.7, false], atk: [.55, false], hit: [.35, false], die: [1.1, false], spawn: [1.1, false] };

// ---------- khai báo quái ----------
// def(id, {ten, vung, loai, luoi: pha => lưới, parts: [...], anims: {ten: {d, lap, f, nhan}}, don, chet, hien, bay, cao, pha})
function def(id, d) { d.id = id; d.anims = d.anims || {}; DEFS[id] = d; return d; }
MA._def = def;
// Viết gọn một cử động: A(thời lượng giây, hàm tư thế, {lap: lặp, nhan: tên tiếng Việt, moc: [hết báo trước, hết ra đòn] tính theo 0..1})
function A(dd, f, o) { return Object.assign({ d: dd, f }, o || {}); }
MA._xong = function () { MA.list.length = 0; const TT = ['bien', 'rung', 'laudai'], LL = ['thuong', 'tinhanh', 'trumnho', 'trum'];
  for (const id of Object.keys(DEFS)) { const d = DEFS[id];
    for (const k of Object.keys(DMAC)) if (!d.anims[k]) d.anims[k] = { d: DMAC[k][0], lap: DMAC[k][1], f: CH[k] };
    for (const k of Object.keys(d.anims)) { const a = d.anims[k]; if (typeof a === 'function') d.anims[k] = { d: DMAC[k] ? DMAC[k][0] : 1, f: a }; const b = d.anims[k]; if (b.lap == null) b.lap = !!(DMAC[k] && DMAC[k][1]); if (!b.nhan) b.nhan = NHAN[k] || k; }
    let w = 0, h = 0; try { const B = goc(d, 1); w = B.bw; h = B.bh; } catch (e) { MA.loi.push(id + ': ' + (e && e.stack || e)); }
    MA.list.push({ id, ten: d.ten, vung: d.vung, loai: d.loai, w, h, pha: d.pha || 1, bay: !!d.bay, anims: Object.keys(d.anims).map(k => ({ id: k, ten: d.anims[k].nhan, d: d.anims[k].d, lap: !!d.anims[k].lap, moc: d.anims[k].moc || null })) }); }
  MA.list.sort((a, b) => (TT.indexOf(a.vung) - TT.indexOf(b.vung)) || (LL.indexOf(a.loai) - LL.indexOf(b.loai)) || (DEFS[a.id].tt || 0) - (DEFS[b.id].tt || 0)); };

// ---------- VẼ ----------
// c: bút canvas 2D (đơn vị = điểm ảnh của game). (x, y): điểm chân quái. o: {anim, t (giây từ lúc bắt đầu cử động), face (-1 trái, 1 phải),
// dir (góc radian của đòn: 0 = phải, PI/2 = xuống), phase (1..3, chỉ trùm vùng), hit (0..1 chớp trắng), bao: false để tắt vùng báo trước, fx: false để tắt hết hiệu ứng rời,
// tint: [màu, độ phủ] nhuộm cả hình (nhịp độc, cháy), chop: hệ số 0..1 nhân vào chớp trắng của chính cử động (lúc khựng hình)}
MA.draw = function (c, id, x, y, o) {
  const d = DEFS[id]; if (!d) return; o = o || {};
  let ph = d.pha ? clamp(o.phase || 1, 1, d.pha) : 1; const nm = d.anims[o.anim] ? o.anim : 'idle', an = d.anims[nm];
  const t = Math.max(0, o.t || 0), nf = Math.max(1, Math.round(an.d * MA.fps)); let fi = Math.floor(t * MA.fps + 1e-6); fi = an.lap ? fi % nf : Math.min(fi, nf - 1);
  const u = an.lap ? fi / nf : (nf > 1 ? fi / (nf - 1) : 0);
  let face = o.face || 0, dir = o.dir; if (dir == null) dir = (face || -1) < 0 ? PI : 0; if (!face) { const cx = Math.cos(dir); face = cx > .01 ? 1 : -1; }
  const ph0 = ph; if (an.pha) ph = clamp(an.pha(u, ph) || ph, 1, d.pha || 1); // cử động chuyển pha tự đổi hình giữa chừng
  const hv = an.hinh ? an.hinh(u, ph) : 0, B = goc(d, ph, hv), P = new Pose(d, B, nm, u, fi / MA.fps, o, dir, face, ph); P.pha0 = ph0;
  MA._tatBao = o.bao === false; an.f(P);
  const key = P.khongNho ? null : id + '|' + ph + '|' + (hv || '') + '|' + nm + '|' + fi + '|' + P.aim + (P.khoa || ''), fr = veKhung(B, P, key);
  c.save(); c.translate(Math.round(x), Math.round(y)); c.imageSmoothingEnabled = false; const ga = c.globalAlpha;
  if (P.bong > 0 && d.bong !== 0) { const bw = (d.bong || B.bw * .62) * (1 - Math.min(.5, P.h / 80)) * Math.min(1, P.bong + .3); c.globalAlpha = ga * .28 * Math.min(1, P.bong); F.elip(c, P.x, P.y, bw / 2, Math.max(1.5, bw * .14), '#000000'); c.globalAlpha = ga; }
  if (o.fx !== false) for (const f of P._u) { c.save(); f(c, P); c.restore(); }
  const sx = Math.round(P.x), sy = Math.round(P.y - P.h);
  const ve = (img, dx, dy, a) => { c.save(); c.globalAlpha = ga * a; c.translate(sx + dx, sy + dy); if (face > 0) c.scale(-1, 1); c.drawImage(img, -fr.ox, -fr.oy); c.restore(); };
  if (P.bongMa) for (const m of P.bongMa) { ve(fr.cv, m.x || 0, m.y || 0, (m.a == null ? .3 : m.a) * P.a); if (m.mau) ve(bongHinh(fr, m.mau), m.x || 0, m.y || 0, (m.a == null ? .3 : m.a) * .7 * P.a); }
  if (P.a > 0) { ve(fr.cv, 0, 0, P.a); if (P.tint && P.tint[1] > 0) ve(bongHinh(fr, P.tint[0]), 0, 0, P.a * clamp(P.tint[1], 0, 1));
    if (o.tint && o.tint[1] > 0) ve(bongHinh(fr, o.tint[0]), 0, 0, P.a * clamp(o.tint[1], 0, 1)); // nhuộm màu hệ (nhịp độc / cháy) do game truyền vào
    const fl = Math.max((P.flash || 0) * (o.chop == null ? 1 : o.chop), o.hit || 0); if (fl > 0) ve(bongHinh(fr, '#ffffff'), 0, 0, P.a * clamp(fl, 0, 1)); } // o.chop: hệ số chớp trắng của cử động (khựng hình thì nhạt đi)
  if (o.fx !== false) for (const f of P._o) { c.save(); f(c, P); c.restore(); }
  c.restore();
};
// Tiện cho game: thời lượng một cử động (giây), và xoá bộ nhớ khung hình.
// Chiều cao hình thật (điểm ảnh, từ chân tới đỉnh) gồm cả độ bay của quái bay và chừa 2 điểm cho nhịp thở: để đặt thanh máu, biểu tượng trên đầu.
MA.cao = (id) => { const d = DEFS[id]; if (!d) return 0; const B = goc(d, 1); return B.bh + (d.bay ? (d.cao || 8) + 2 : 0) + 2; };
MA.dur = (id, anim) => { const d = DEFS[id]; return d && d.anims[anim] ? d.anims[anim].d : 0; };
MA.xoaNho = () => KHUNG.clear();

// ================= PHẦN 3: cử động từng con =================
// ----- bien.js -----
try { (function () {
// Vùng Hang biển (hệ Băng): 8 quái thường + 2 tinh anh.
const BANG = ['#4f86b0', '#a9d8ee', '#ffffff'], CAT = ['#d8c08a', '#a88a58', '#f0e0b0'], NUOC = ['#9fd8f5', '#3f8fd0', '#ffffff'];
// Lật toạ độ x cho bộ phận bên phải của hình đối xứng rộng w.
const lat = (w, pts) => pts.map(q => [w - q[0], q[1]]);
// ---- Cua Lính: hai càng (tay + càng), sáu chân ----
const CUA_C = [[[13, 25], [8, 22.5], [2, 31], [5, 33], [9, 27.4], [13, 28.4]], [[13.5, 28.4], [9, 27.6], [6, 34], [9, 36], [11, 30.6], [14, 30.6]], [[13, 31], [17.5, 30.6], [16, 37], [11.5, 37]]];
def('cua', { ten: 'Cua Lính', vung: 'bien', loai: 'thuong', tt: 1, luoi: () => Q2.cua(), don: { kieu: 'chem', tam: 26 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT },
  parts: [
    { n: 'tayT', m: [{ p: [[6, 18], [13, 17.5], [16.5, 21.5], [15, 25.5], [11, 24.5], [6, 21]] }], pv: [14.5, 23] }, { n: 'cangT', m: [[0, 3, 13, 18]], pv: [8, 18], cha: 'tayT' },
    { n: 'tayP', m: [{ p: lat(50, [[6, 18], [13, 17.5], [16.5, 21.5], [15, 25.5], [11, 24.5], [6, 21]]) }], pv: [35.5, 23] }, { n: 'cangP', m: [[36, 3, 49, 18]], pv: [42, 18], cha: 'tayP' },
    { n: 'cT1', m: [{ p: CUA_C[0] }], pv: [13.5, 27], z: -1 }, { n: 'cT2', m: [{ p: CUA_C[1] }], pv: [14, 29.5], z: -1 }, { n: 'cT3', m: [{ p: CUA_C[2] }], pv: [16, 31], z: -1 },
    { n: 'cP1', m: [{ p: lat(50, CUA_C[0]) }], pv: [36.5, 27], z: -1 }, { n: 'cP2', m: [{ p: lat(50, CUA_C[1]) }], pv: [36, 29.5], z: -1 }, { n: 'cP3', m: [{ p: lat(50, CUA_C[2]) }], pv: [34, 31], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.035); P.r('tayT', 3 * sn(u + .2)).r('tayP', -3 * sn(u + .2)).r('cangT', 7 * sn(u)).r('cangP', -7 * sn(u + .1)); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 3 * sn(u + i * .2)); P.r('cP' + i, -3 * sn(u + i * .2)); } }),
    move: A(.5, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.2; P.rot += 3 * sn(u); P.x += sn(u * 2) * .6; for (let i = 1; i <= 3; i++) { P.r('cT' + i, 20 * sn(u * 2 + i / 3)); P.r('cP' + i, 20 * sn(u * 2 + i / 3 + .5)); } P.r('tayT', 6 * sn(u * 2)).r('tayP', 6 * sn(u * 2)).r('cangT', 5 * sn(u * 2 + .3)).r('cangP', 5 * sn(u * 2 + .3)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]), rung = u > .4 ? sn(u * 9) * 6 : 0; CH.tele(P); P.r('tayT', 30 * k).r('tayP', -30 * k).r('cangT', 18 * k + rung).r('cangP', -18 * k - rung); for (let i = 1; i <= 3; i++) { P.r('cT' + i, -8 * k); P.r('cP' + i, 8 * k); } }),
    atk: A(.55, P => { const u = P.u, a = kf(u, [[0, 30], [.2, -42, 'in'], [.45, -30], [1, 0, 'back']]); CH.atk(P); P.r('tayT', a).r('tayP', -a).r('cangT', a * .5).r('cangP', -a * .5); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 10 * sn(u * 2 + i / 3)); P.r('cP' + i, -10 * sn(u * 2 + i / 3)); } }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('tayT', -25 * k).r('tayP', 25 * k).r('cangT', -15 * k).r('cangP', 15 * k); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 14 * k); P.r('cP' + i, -14 * k); } }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.sy *= 1 - .25 * k; P.r('tayT', -45 * k).r('tayP', 45 * k).r('cangT', -20 * k).r('cangP', 20 * k); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 22 * k); P.r('cP' + i, -22 * k); } }),
    spawn: A(1.2, P => { const u = P.u, k = kf(u, [[0, 1], [.7, 1], [.85, 0, 'out'], [.92, .5], [1, 0]]); CH.spawn(P); P.r('tayT', 30 * k).r('tayP', -30 * k).r('cangT', 12 * sn(u * 6) * (u > .6 ? 1 : 0)).r('cangP', -12 * sn(u * 6) * (u > .6 ? 1 : 0)); }),
  } });
// ---- Bầy Cá Con: ba con cá bơi lệch nhịp, đuôi quẫy ----
function caConNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3; P.m('ca' + i, sn(ph) * .8, sn(ph + .25) * (amp || 1.5)); P.r('ca' + i, 4 * sn(ph + .1)); const q = sn(u * sp + i * .37); P.r('duoi' + i, 22 * q).s('duoi' + i, 1 - .25 * Math.abs(q), 1); }); }
def('caCon', { ten: 'Bầy Cá Con', vung: 'bien', loai: 'thuong', tt: 2, luoi: () => Q2.caCon(), bay: true, cao: 4, don: { kieu: 'lao', tam: 40, rong: 16 }, chet: { k: 'bui', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC },
  parts: [{ n: 'ca1', m: [[6, 3, 24, 16]], pv: [14, 11] }, { n: 'ca2', m: [[23, 12, 40, 25]], pv: [30, 19] }, { n: 'ca3', m: [[7, 21, 25, 34]], pv: [15, 28] },
    { n: 'duoi1', m: [[18, 6, 24, 16]], pv: [17, 11], cha: 'ca1' }, { n: 'duoi2', m: [[34, 14, 40, 24]], pv: [33, 19], cha: 'ca2' }, { n: 'duoi3', m: [[19, 23, 25, 33]], pv: [18, 28], cha: 'ca3' }],
  anims: {
    idle: A(1.5, P => { caConNhip(P, 3, 1.5); }),
    move: A(.6, P => { caConNhip(P, 4, 1); P.rot += -3; [1, 2, 3].forEach(i => P.m('ca' + i, -1.5 * sn(P.u + i / 3), 0)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); caConNhip(P, 8, .5); P.theo(-4 * k); P.m('ca1', 3 * k, 3 * k).m('ca2', -3 * k, 0).m('ca3', 3 * k, -3 * k); if (u > .4) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; caConNhip(P, 8, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.12 + i * .08, -12, 'in'], [.5 + i * .05, -9], [1, 0, 'io']]); P.m('ca' + i, q, 0); P.s('ca' + i, 1 + .15 * seg(u, .05 + i * .08, .2 + i * .08) * (1 - seg(u, .3, .6)), 1); }); P.theo(kf(u, [[0, -4], [.25, 6, 'out'], [1, 0]])); P.rot += -P.aim * 12 * (1 - u); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('ca1', -3 * k, -4 * k).m('ca2', 5 * k, 0).m('ca3', -3 * k, 4 * k); P.r('ca1', 25 * k).r('ca2', -20 * k).r('ca3', -25 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('ca1', -4 * k, -5 * k).m('ca2', 6 * k, 0).m('ca3', -4 * k, 5 * k); P.r('ca1', 90 * k).r('ca2', -120 * k).r('ca3', 150 * k); }),
  } });
// ---- Ốc Mượn Hồn: càng to, ba chân, rụt vào vỏ khi trúng đòn ----
def('oc', { ten: 'Ốc Mượn Hồn', vung: 'bien', loai: 'thuong', tt: 3, luoi: () => Q2.oc(), don: { kieu: 'chem', tam: 26, xoe: 1.6 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT },
  parts: [{ n: 'cang', m: [[3, 16, 17, 36]], pv: [17, 28] }, { n: 'chan1', m: [[10, 33, 18, 40]], pv: [18, 33], z: -1 }, { n: 'chan2', m: [[18.5, 35, 23, 41]], pv: [23, 34.5], z: -1 }, { n: 'chan3', m: [[25, 36, 30, 41]], pv: [28, 35], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.03); P.r('cang', 5 * sn(u)).s('cang', 1 + .04 * sn(u + .2)); P.r('chan1', 3 * sn(u + .3)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1; P.rot += 4 * sn(u) - 2; P.r('chan1', 22 * sn(u)).r('chan2', 22 * sn(u + .33)).r('chan3', 22 * sn(u + .66)); P.r('cang', 6 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('cang', 38 * k + (u > .4 ? sn(u * 9) * 4 : 0)).s('cang', 1 + .12 * k); P.rot += 6 * k; }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.r('cang', kf(u, [[0, 38], [.2, -40, 'in'], [.45, -30], [1, 0, 'back']])).s('cang', kf(u, [[0, 1.12], [.2, 1.25], [1, 1]])); P.r('chan1', 12 * sn(u * 2)).r('chan2', -12 * sn(u * 2)); }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [.6, 1], [1, 0]]); CH.hit(P); P.m('cang', 7 * k, 2 * k).s('cang', 1 - .3 * k); P.m('chan1', 5 * k, -3 * k).m('chan2', 2 * k, -4 * k).m('chan3', 0, -4 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('cang', -30 * k).r('chan1', 30 * k).r('chan2', 10 * k).r('chan3', -25 * k); P.rot += 8 * k; }),
  } });
// ---- Hải Quỳ: chùm tua lượn sóng, ném bong bóng nổ ----
def('haiQuy', { ten: 'Hải Quỳ', vung: 'bien', loai: 'thuong', tt: 4, luoi: () => Q2.haiQuy(), don: { kieu: 'nem', tam: 56, rong: 13, mau: ['#1b4c92', '#3883d4', '#a6deff'], mom: [44, 10] }, chet: { k: 'tan', mau: ['#ee5c3a', '#b32a2c', '#1fb49c'] }, hien: { k: 'moc', mau: CAT },
  parts: [{ n: 'tuaT', m: [{ p: [[2, 3], [20, 3], [24.5, 20], [15, 20], [2, 23]] }], pv: [24, 21], z: -1 }, { n: 'tuaG', m: [{ p: [[20, 0], [33, 0], [30, 20], [24.5, 20]] }], pv: [27, 21], z: -1 }, { n: 'tuaP', m: [{ p: [[50, 3], [33, 3], [30, 20], [38, 20], [50, 23]] }], pv: [30, 21], z: -1 },
    { n: 'rong', m: [[41, 28, 48, 41]], pv: [44, 42] }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.tho(.04); P.w('tuaT', 9, -u, .35).w('tuaG', 7, -u + .2, .35).w('tuaP', 9, -u + .4, .35); P.r('tuaT', 4 * sn(u)).r('tuaP', 4 * sn(u)); P.b('rong', 14 * sn(u)); }),
    move: A(.8, P => { const u = P.u, s = sn(u); P.sy *= 1 + .1 * s; P.sx *= 1 - .08 * s; P.sh += 3 * sn(u + .25); P.b('tuaT', -14 * s).b('tuaG', -14 * sn(u - .1)).b('tuaP', -14 * s); P.w('tuaT', 6, -u * 2).w('tuaP', 6, -u * 2); P.b('rong', 20 * sn(u - .2)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'out'], [1, 1]]); P.sy *= 1 + .12 * k; P.sx *= 1 - .08 * k; P.r('tuaT', 22 * k).r('tuaP', -22 * k).b('tuaT', 14 * k).b('tuaP', -14 * k); P.w('tuaG', 10 * k, -u * 4); if (u > .45) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.flash = u > .75 ? ((u * 24 | 0) % 2 ? .3 : 0) : 0; P.fxBao(); }),
    atk: A(.9, P => { const u = P.u, k = kf(u, [[0, 1], [.12, -1.2, 'in'], [.4, -.6], [1, 0, 'back']]); P.sy *= 1 + .12 * k; P.sx *= 1 - .09 * k; P.r('tuaT', 22 * k).r('tuaP', -22 * k).b('tuaT', 16 * k).b('tuaP', -16 * k).b('tuaG', -10 * P.face * P.fx * (1 - u)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.b('tuaT', 30 * k).b('tuaG', 30 * k).b('tuaP', 30 * k); }),
    die: A(1.3, P => { const k = seg(P.u, 0, .3); CH.die(P); P.r('tuaT', -35 * k).r('tuaP', 35 * k).b('tuaT', -30 * k).b('tuaP', 30 * k).b('tuaG', 20 * k); P.sy *= 1 - .15 * k; }),
    spawn: A(1.2, P => { const u = P.u, k = 1 - seg(u, .5, .9); CH.spawn(P); P.r('tuaT', 30 * k).r('tuaP', -30 * k); P.w('tuaG', 8, -u * 3); }),
  } });
def('caChuon', { ten: 'Cá Chuồn', vung: 'bien', loai: 'thuong', tt: 5, luoi: () => Q2.caChuon(), bay: true, cao: 8, don: { kieu: 'lao', tam: 70, rong: 10 }, chet: { k: 'bui', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('caNoc', { ten: 'Cá Nóc', vung: 'bien', loai: 'thuong', tt: 6, luoi: () => Q2.caNoc(), bay: true, cao: 6, don: { kieu: 'gai', tam: 34, mau: ['#0e746e', '#fff8e0', '#ffffff'] }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('sua', { ten: 'Sứa Bom', vung: 'bien', loai: 'thuong', tt: 7, luoi: () => Q2.sua(), bay: true, cao: 6, don: { kieu: 'no', tam: 30, mau: ['#1b4c92', '#3883d4', '#a6deff'] }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('nhim', { ten: 'Nhím Biển', vung: 'bien', loai: 'thuong', tt: 8, luoi: () => Q2.nhim(), don: { kieu: 'gai', tam: 30, mau: ['#281d62', '#988aee', '#ffffff'] }, chet: { k: 'vo', mau: ['#4836a0', '#988aee'] }, hien: { k: 'cat', mau: CAT } });
def('cuaTuong', { ten: 'Cua Tướng', vung: 'bien', loai: 'tinhanh', tt: 1, luoi: () => Q2.cuaTuong(), don: { kieu: 'chem', tam: 40 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT } });
def('caNocChua', { ten: 'Cá Nóc Chúa', vung: 'bien', loai: 'tinhanh', tt: 2, luoi: () => Q2.caNocChua(), bay: true, cao: 6, don: { kieu: 'gai', tam: 46, mau: ['#0e746e', '#fff8e0', '#ffffff'], so: 12 }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
// ---- Chiêu riêng của hai tinh anh ----
// Cua Tướng: kẹp chéo, hai càng chém chéo nhau thành hình chữ X trước mặt.
DEFS.cuaTuong.anims.chieu1 = A(1.4, P => { const u = P.u, bh = P.B.bh, tam = 44, cols = ['#b0261a', '#ff9a6a', '#ffffff'];
  if (u < .4) { const v = u / .4; P.theo(-3 * v); P.sy *= 1 - .1 * v; P.sx *= 1 + .07 * v; P.x += v > .5 ? ((u * 48 | 0) % 2 ? .6 : -.6) : 0; P.flash = v > .7 && ((u * 30) | 0) % 2 ? .35 : 0; P.under(c => F.baoQuat(c, 0, 0, tam, P.dir, 2.4, v)); }
  else { const v = (u - .4) / .6, ex = P.fx * 5, ey = P.fy * 5 * MA.det - bh * .35; P.theo(kf(v, [[0, 0], [.2, 9, 'out'], [.6, 7], [1, 0]])); P.sx *= kf(v, [[0, 1.12], [.2, .94], [.5, 1]]); P.sy *= kf(v, [[0, .9], [.2, 1.06], [.5, 1]]);
    P.over(c => { F.liem(c, ex, ey, tam - 4, P.dir - .45, 1.7, clamp(v * 1.7, 0, 1), cols, 6); F.liem(c, ex, ey, tam - 8, P.dir + .45, 1.7, clamp(v * 1.7 - .3, 0, 1), cols, 6); if (v > .15 && v < .6) F.hat(c, Math.cos(P.dir) * tam * .7, Math.sin(P.dir) * tam * .7 * MA.det - bh * .3, 14, 3, (v - .15) / .45, { v: 12, cols: ['#ffffff', '#ff9a6a', '#b0261a'] }); }); } }, { nhan: 'Chiêu: kẹp chéo' });
// Cá Nóc Chúa: gai xoáy, phồng lên rồi bắn hai đợt gai băng toả tròn.
DEFS.caNocChua.anims.chieu1 = A(1.6, P => { CHIEU.vongDan(P, 12, 58, ['#0e746e', '#8ff0d8', '#ffffff'], 2); }, { nhan: 'Chiêu: gai xoáy' });

})(); } catch (e) { MA.loi.push('bien.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art bien.js', e); }
// ----- rung.js -----
try { (function () {
// Vùng Rừng già (hệ Độc): 8 quái thường + 2 tinh anh. Bảng màu dùng chung của bản chốt: LUCR, NAUG, TIMD, DOCX.
const DAT = [NAUG[2], NAUG[1], NAUG[3]], LA = [LUCR[2], LUCR[1], LUCR[3]], DOC = [DOCX[0], DOCX[1], DOCX[3]], TIM = [TIMD[1], TIMD[2], TIMD[3]], ONG = ['#c4801a', '#ffc83c', '#fff6b0'];
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .6 : -.6) : 0);
// ---- Heo Rừng Con: đầu chúi, chân đạp, bờm dựng; lao húc ----
def('heoCon', { ten: 'Heo Rừng Con', vung: 'rung', loai: 'thuong', tt: 1, luoi: () => QR.heo(), don: { kieu: 'lao', tam: 46, rong: 14, mau: DAT }, chet: { k: 'ra', mau: DAT }, hien: { k: 'bui', mau: DAT },
  parts: [{ n: 'dau', m: [[2, 16, 22, 39]], pv: [21, 27] }, { n: 'chanT', m: [[8, 33, 21, 41]], pv: [15, 33], z: -1 }, { n: 'chanS', m: [[37, 32, 52, 41]], pv: [44, 32], z: -1 },
    { n: 'bom', m: [[12, 6, 47, 17]], pv: [30, 17], keep: 0 }, { n: 'bui', m: [[50, 20, 60, 36]], pv: [50, 28] }],
  anims: {
    idle: A(1.2, P => { const u = P.u; P.tho(.03); P.r('dau', 3 * sn(u)).r('chanT', 4 * sn(u * 2) * (u > .5 ? 1 : 0)); P.s('bom', 1, 1 + .1 * sn(u)); P.s('bui', 0); }),
    move: A(.45, P => { const u = P.u; CH.move(P); P.r('chanT', 26 * sn(u)).r('chanS', -26 * sn(u)).r('dau', 4 * sn(u * 2)); P.s('bom', 1, 1 + .12 * sn(u * 2)); P.m('bui', 2 * sn(u * 2), 0); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -12 * k).m('dau', -1 * k, 2 * k); P.r('chanS', 20 * sn(u * 4) * k); P.s('bom', 1, 1 + .3 * k); P.s('bui', 0);
      P.under(c => F.khoi(c, P.x + 14 * P.face * -1, P.y, 6, (u * 3) % 1, DAT, (u * 3) | 0)); }),
    atk: A(.6, P => { const u = P.u, k = kf(u, [[0, -1], [.15, 1, 'out'], [.5, 1], [1, 0]]); CH.atk(P); P.theo(10 * k); P.r('dau', -16 * k).r('chanT', 30 * sn(u * 3)).r('chanS', -30 * sn(u * 3)); P.s('bom', 1, 1 + .3 * k); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 18 * k).r('chanT', -15 * k); P.s('bom', 1, 1 - .3 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -40 * k).r('chanS', 40 * k); P.s('bom', 1, 1 - .5 * k); P.s('bui', 0); }),
    spawn: A(1.1, P => { CH.spawn(P); P.r('chanT', 25 * sn(P.u * 4) * (P.u > .7 ? 1 : 0)); }),
  } });
// ---- Bầy Ong Vò Vẽ: ba con ong, cánh vẫy rất nhanh ----
function ongNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3; P.m('ong' + i, sn(ph) * 1.2, sn(ph * 2 + .25) * (amp || 1.5)); P.r('ong' + i, 6 * sn(ph)); P.s('canh' + i, 1, ((P.t * 24 + i) | 0) % 2 ? .35 : 1); }); }
def('ongVo', { ten: 'Bầy Ong Vò Vẽ', vung: 'rung', loai: 'thuong', tt: 2, luoi: () => QR.ong(), bay: true, cao: 8, don: { kieu: 'lao', tam: 36, rong: 18, mau: ONG }, chet: { k: 'bui', mau: ONG }, hien: { k: 'bay', xa: 40, cao: 30 },
  parts: [{ n: 'ong1', m: [[5, 3, 26, 22]], pv: [16, 14] }, { n: 'ong2', m: [[26, 5, 49, 31]], pv: [36, 19] }, { n: 'ong3', m: [[3, 16, 26, 40]], pv: [15, 29] },
    { n: 'canh1', m: [[12, 2, 25, 11]], pv: [17, 11], cha: 'ong1' }, { n: 'canh2', m: [[30, 6, 41, 17]], pv: [34, 17], cha: 'ong2' }, { n: 'canh3', m: [[12, 16, 25, 25]], pv: [16, 25], cha: 'ong3' }],
  anims: {
    idle: A(1.2, P => { ongNhip(P, 3, 1.5); P.h += sn(P.u) * 1.5; }),
    move: A(.6, P => { ongNhip(P, 4, 1); P.rot += -4; [1, 2, 3].forEach(i => P.m('ong' + i, -2 * sn(P.u + i / 3), 0)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); ongNhip(P, 8, .5); P.theo(-3 * k); P.r('ong1', -20 * k).r('ong2', -20 * k).r('ong3', -20 * k); P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; ongNhip(P, 8, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.1 + i * .08, -14, 'in'], [.5 + i * .05, -10], [1, 0]]); P.m('ong' + i, q, 0); P.r('ong' + i, -25 * (1 - u)); }); P.theo(kf(u, [[0, -3], [.25, 6, 'out'], [1, 0]])); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('ong1', -3 * k, -4 * k).m('ong2', 5 * k, 0).m('ong3', -3 * k, 4 * k); ongNhip(P, 6, .3); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('ong1', -4 * k, -5 * k).m('ong2', 6 * k, 2 * k).m('ong3', -4 * k, 5 * k); P.r('ong1', 120 * k).r('ong2', -150 * k).r('ong3', 180 * k); }),
  } });
// ---- Bọ Hung Mai Cứng: giơ mai sừng chắn trước, sáu chân bò ----
def('boHung', { ten: 'Bọ Hung Mai Cứng', vung: 'rung', loai: 'thuong', tt: 3, luoi: () => QR.boHung(), don: { kieu: 'dap', tam: 26, mau: LA }, chet: { k: 'vo', mau: ['#1a5a40', '#3a9a5c', '#b4f0b0'] }, hien: { k: 'cat', mau: DAT },
  parts: [{ n: 'mai', m: [[1, 5, 22, 37]], pv: [21, 26] }, { n: 'c1', m: [[20, 32, 30, 41]], pv: [26, 32], z: -1 }, { n: 'c2', m: [[30, 32, 40, 41]], pv: [35, 32], z: -1 }, { n: 'c3', m: [[40, 32, 52, 41]], pv: [45, 32], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.025); P.r('mai', 3 * sn(u)); }),
    move: A(.6, P => { const u = P.u; P.h += Math.abs(sn(u * 2)) * .8; P.rot += 2 * sn(u); P.r('c1', 22 * sn(u * 2)).r('c2', 22 * sn(u * 2 + .33)).r('c3', 22 * sn(u * 2 + .66)); P.r('mai', 4 * sn(u * 2)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('mai', 28 * k).m('mai', 2 * k, -3 * k); P.rot += 8 * k; }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 28], [.2, -14, 'in'], [.45, -8], [1, 0, 'back']]); CH.atk(P); P.r('mai', a); P.rot += kf(u, [[0, 8], [.2, -6, 'in'], [1, 0]]); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('mai', -12 * k); P.r('c1', 20 * k).r('c3', -20 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('mai', -30 * k).m('mai', -3 * k, 2 * k); P.r('c1', 40 * k).r('c2', 20 * k).r('c3', -30 * k); }),
  } });
// ---- Hoa Phun Bào Tử: đầu hoa lắc, há miệng phun viên bào tử ----
def('hoaBaoTu', { ten: 'Hoa Phun Bào Tử', vung: 'rung', loai: 'thuong', tt: 4, luoi: () => QR.hoa(), don: { kieu: 'ban', tam: 70, rong: 7, co: 3, mau: DOC, mom: [8, 16] }, chet: { k: 'heo', mau: [NAUG[0], NAUG[1], NAUG[2], '#7a6a3a'] }, hien: { k: 'moc', mau: LA },
  parts: [{ n: 'dau', m: [[2, 3, 36, 28]], pv: [33, 26] }, { n: 'la', m: [[35, 3, 48, 29]], pv: [36, 25] }, { n: 'bao', m: [[3, 8, 12, 23]], pv: [8, 16], cha: 'dau' }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.r('dau', 6 * sn(u)).s('dau', 1 + .03 * sn(u * 2)); P.r('la', -8 * sn(u + .2)); P.m('bao', 0, 1.5 * sn(u * 2)); }),
    move: A(.9, P => { const u = P.u; P.sh += 3 * sn(u); P.sy *= 1 + .05 * sn(u * 2); P.r('dau', 10 * sn(u)).r('la', -12 * sn(u)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'out'], [1, 1]]); P.r('dau', 22 * k).r('la', -16 * k); P.s('bao', 1 + .6 * k); P.x += rung(u, .45); P.flash = u > .75 ? ((u * 24 | 0) % 2 ? .3 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 22], [.15, -18, 'in'], [.45, -10], [1, 0, 'back']]); P.r('dau', a).r('la', -a * .6); P.s('bao', u < .12 ? 1.6 : 0); P.sy *= kf(u, [[0, .92], [.15, 1.08], [.5, 1]]); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', -24 * k).r('la', 18 * k); }),
    die: A(1.4, P => { const k = kf(P.u, [[0, 0], [.3, 1, 'out']]); CH.die(P); P.r('dau', -50 * k).m('dau', 0, 6 * k).r('la', 40 * k); P.s('bao', 1 - k); }),
    spawn: A(1.2, P => { const u = P.u, k = 1 - seg(u, .4, .9); CH.spawn(P); P.r('dau', 40 * k).r('la', -30 * k); }),
  } });
// ---- Chồn Bóng: thân dài, đuôi lượn, lao vụt để lại vệt bóng tím ----
def('chonBong', { ten: 'Chồn Bóng', vung: 'rung', loai: 'thuong', tt: 5, luoi: () => QR.chon(), don: { kieu: 'lao', tam: 62, rong: 10, mau: TIM }, chet: { k: 'hon', mau: TIM }, hien: { k: 'bong', mau: ['#221836', '#40305e'] },
  parts: [{ n: 'dau', m: [[2, 10, 19, 31]], pv: [18, 20] }, { n: 'duoi', m: [[42, 2, 64, 24]], pv: [42, 19], keep: 0 }, { n: 'chanT', m: [[3, 22, 15, 32]], pv: [11, 22], z: -1 }, { n: 'chanS', m: [[45, 23, 58, 32]], pv: [50, 23], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.w('duoi', 8, -u, .25).r('dau', 3 * sn(u)); }),
    move: A(.4, P => { const u = P.u; CH.move(P); P.r('chanT', 30 * sn(u)).r('chanS', -30 * sn(u)); P.w('duoi', 10, -u * 2, .25); P.bongMa = [{ x: 6 * -P.face, a: .25, mau: TIMD[2] }]; }),
    tele: A(.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -8 * k).b('duoi', -25 * k); P.r('chanS', -15 * k); }),
    atk: A(.55, P => { const u = P.u, k = kf(u, [[0, 0], [.2, 1, 'out'], [.55, 1], [1, 0]]); P.theo(18 * k - 2); P.sx *= 1 + .15 * k; P.sy *= 1 - .1 * k; P.r('chanT', -30 * k).r('chanS', 30 * k).b('duoi', -20 * k);
      if (u < .6) P.bongMa = [1, 2, 3].map(i => ({ x: -P.fx * i * 7, y: -P.fy * i * 7, a: .35 - i * .09, mau: TIMD[2] })); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 30 * k).b('duoi', 40 * k).r('chanT', -40 * k).r('chanS', 40 * k); }),
  } });
// ---- Nấm Phồng: mũ nhún; lại gần thì phồng to (đổi sang hình phồng) rồi nổ khí độc ----
const khiDoc = (c, x, y, r, e, s) => { F.a(c, (1 - e) * .5); F.khoi(c, x, y, r, e * .7, [DOCX[2], DOCX[1], TIMD[3]], s, 7); F.a(c, 1); };
def('namPhong', { ten: 'Nấm Phồng', vung: 'rung', loai: 'thuong', tt: 6, luoi: (p, hv) => QR.nam(hv === 'phong'), don: { kieu: 'no', tam: 34, mau: DOC }, chet: { k: 'no', mau: DOC }, hien: { k: 'tu', mau: [TIMD[2], DOCX[2], DOCX[3]] },
  parts: hv => hv === 'phong' ? [] : [{ n: 'mu', m: [[18, 23, 46, 38]], pv: [32, 38] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.05); P.s('mu', 1 + .05 * sn(u + .25), 1 - .05 * sn(u + .25)); }),
    move: A(.5, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .1 - .05; P.sx *= 1 - s * .08 + .04; P.r('mu', 5 * sn(u)); }),
    tele: A(.8, P => { const u = P.u; P.sx *= 1 + .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.flash = u > .6 ? ((u * 24 | 0) % 2 ? .4 : 0) : 0; P.fxBao(); }, { hinh: u => u > .45 ? 'phong' : 0 }),
    atk: A(.9, P => { const u = P.u, cy = -P.B.bh * .4; P.sx *= 1 + seg(u, 0, .15) * .2; P.sy *= 1 + seg(u, 0, .15) * .2; P.flash = u < .18 ? (((u * 30) | 0) % 2 ? .8 : .2) : 0; P.a = u < .2 ? 1 : seg(u, .88, 1); P.bong = P.a; if (u >= .88) { const s = seg(u, .88, 1); P.sx *= s; P.sy *= s; }
      if (u > .18) { P.under(c => khiDoc(c, 0, 0, 30, seg(u, .2, 1), 4)); P.fxDon(seg(u, .18, .8)); } }, { hinh: u => u < .2 ? 'phong' : 0 }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .15 * k, 1 - .2 * k); }),
    die: A(1.1, P => { CH.die(P); if (P.u > .25) P.under(c => khiDoc(c, 0, 0, 22, seg(P.u, .25, 1), 2)); }),
  } });
// ---- Sóc Ném Quả Nổ: ôm quả nổ, đuôi xù; ném quả nổ vòng cung ----
let BOM_R = null; const quaNo = (c, x, y, q) => { F.luoi(c, BOM_R || (BOM_R = QR.bom()), x, y, { rot: q * 9 }); };
def('socNo', { ten: 'Sóc Ném Quả Nổ', vung: 'rung', loai: 'thuong', tt: 7, luoi: () => QR.soc(), don: { kieu: 'nem', tam: 56, rong: 14, vong: 26, mau: [TIMD[1], '#ff8a1e', '#fff6b0'], mom: [10, 24], dan: (c, x, y, q) => quaNo(c, x, y, q) }, chet: { k: 'chay', mau: ['#ff8a1e', '#c43c10', '#48424e'] }, hien: { k: 'roi', cao: 80, mau: LA },
  parts: [{ n: 'qua', m: [[3, 19, 17, 36]], pv: [16, 28] }, { n: 'duoi', m: [[28, 3, 52, 36]], pv: [31, 30], keep: 0 }, { n: 'dau', m: [[9, 4, 28, 22]], pv: [22, 22] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.w('duoi', 6, -u, .2).r('dau', 3 * sn(u)).m('qua', 0, .8 * sn(u * 2)); }),
    move: A(.45, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 4; P.sy *= 1 + s * .08 - .04; P.rot += 4 * sn(u); P.b('duoi', 14 * sn(u)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('qua', 70 * k).m('qua', 6 * k, -10 * k).r('dau', 8 * k).b('duoi', 15 * k); }),
    atk: A(.75, P => { const u = P.u, a = kf(u, [[0, 70], [.1, -50, 'in'], [.3, -30], [1, 0, 'back']]); CH.atk(P); P.r('qua', a).m('qua', 6 * (1 - seg(u, 0, .15)), -10 * (1 - seg(u, 0, .15))); P.s('qua', u > .08 && u < .9 ? 0 : 1); P.b('duoi', -10 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 25 * k).m('qua', 2 * k, -2 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).b('duoi', 35 * k).r('qua', -40 * k); if (P.u < .3) P.over(c => { const m = P.pt(10, 28); F.dia(c, m[0], m[1], 2 + P.u * 30, P.u < .15 ? '#fff6b0' : '#ff8a1e'); }); }),
  } });
// ---- Nhím Gai Độc: lúc báo trước và ra đòn thì xù gai (đổi sang hình xù), bắn gai độc ----
def('nhimDoc', { ten: 'Nhím Gai Độc', vung: 'rung', loai: 'thuong', tt: 8, luoi: (p, hv) => QR.nhim(hv === 'xu'), don: { kieu: 'gai', tam: 36, so: 10, mau: [TIMD[1], DOCX[2], '#ffffff'] }, chet: { k: 'tan', mau: [TIMD[2], NAUG[2], DOCX[2]] }, hien: { k: 'ghep', mau: [NAUG[1], TIMD[2]] },
  parts: hv => hv === 'xu' ? [] : [{ n: 'dau', m: [[18, 42, 34, 56]], pv: [33, 50] }],
  anims: {
    idle: A(1.5, P => { const u = P.u; P.tho(.035); P.r('dau', 4 * sn(u)); }),
    move: A(.55, P => { const u = P.u; CH.move(P); P.r('dau', 5 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u; CH.tele(P); P.sy *= 1 + .06 * seg(u, .3, .4); }, { hinh: u => u > .3 ? 'xu' : 0 }),
    atk: A(.6, P => { const u = P.u; P.sx *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.sy *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.fxDon(); }, { hinh: u => u < .7 ? 'xu' : 0 }),
    hit: A(.35, P => { CH.hit(P); }, { hinh: u => u < .5 ? 'xu' : 0 }),
  } });
// ---- TINH ANH: Heo Rừng Nanh Dài. Chiêu riêng: húc ba lần liền (zíc zắc) ----
def('heoNanh', { ten: 'Heo Rừng Nanh Dài', vung: 'rung', loai: 'tinhanh', tt: 1, luoi: () => QR.heoNanh(), don: { kieu: 'lao', tam: 64, rong: 22, mau: DAT }, chet: { k: 'chim', mau: DAT }, hien: { k: 'khoi', mau: ['#5a6a50', '#8a9a80', '#c0d0b0'] },
  parts: [{ n: 'dau', m: [[0, 18, 33, 57]], pv: [32, 40] }, { n: 'chanT', m: [[13, 47, 31, 57]], pv: [22, 47], z: -1 }, { n: 'chanS', m: [[58, 46, 77, 58]], pv: [67, 46], z: -1 }, { n: 'bui', m: [[77, 30, 96, 50]], pv: [78, 40] }, { n: 'bom', m: [[24, 12, 82, 27]], pv: [52, 27], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.r('dau', 3 * sn(u)); P.s('bom', 1, 1 + .12 * sn(u)); P.s('bui', 0); }),
    move: A(.55, P => { const u = P.u; CH.move(P); P.r('chanT', 24 * sn(u)).r('chanS', -24 * sn(u)).r('dau', 4 * sn(u * 2)); P.m('bui', 3 * sn(u * 2), 0); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -12 * k).r('chanS', 25 * sn(u * 4) * k); P.s('bom', 1, 1 + .35 * k); P.s('bui', 0); P.under(c => F.khoi(c, P.x - 26 * P.face, P.y, 9, (u * 3) % 1, DAT, (u * 3) | 0)); }),
    atk: A(.65, P => { const u = P.u, k = kf(u, [[0, -1], [.15, 1, 'out'], [.5, 1], [1, 0]]); CH.atk(P); P.theo(12 * k); P.r('dau', -18 * k).r('chanT', 30 * sn(u * 3)).r('chanS', -30 * sn(u * 3)); P.s('bom', 1, 1 + .35 * k); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k); P.s('bom', 1, 1 - .3 * k); }),
    die: A(1.4, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -40 * k).r('chanS', 40 * k); P.s('bom', 1, 1 - .5 * k); P.s('bui', 0); }),
    chieu1: A(2.1, P => { const u = P.u, q = (u * 3) % 1; CHIEU.laoNhieu(P, 3, 60, 22, DAT, .6); P.r('dau', q > .45 ? -18 : -8 * q / .45).r('chanT', 30 * sn(u * 9)).r('chanS', -30 * sn(u * 9)); P.s('bom', 1, 1.35); P.s('bui', 0); }, { nhan: 'Chiêu: húc ba lần' }),
  } });
// ---- TINH ANH: Nấm Phồng Chúa. Chiêu riêng: mưa bào tử (phun 5 quả rơi quanh, để lại khí độc) ----
def('namPhongChua', { ten: 'Nấm Phồng Chúa', vung: 'rung', loai: 'tinhanh', tt: 2, luoi: () => QR.namPhongChua(), don: { kieu: 'no', tam: 44, mau: [TIMD[2], DOCX[2], '#f4ffb0'] }, chet: { k: 'no', mau: [TIMD[2], DOCX[1], DOCX[3]] }, hien: { k: 'moc', mau: TIM },
  parts: [{ n: 'mu', m: [[18, 18, 70, 52]], pv: [44, 52] }],
  anims: {
    idle: A(1.5, P => { const u = P.u; P.tho(.04); P.s('mu', 1 + .04 * sn(u + .25), 1 - .04 * sn(u + .25)); P.under(c => khiDoc(c, 0, -4, 26, (u + .3) % 1, 1)); }),
    move: A(.6, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .08 - .04; P.r('mu', 4 * sn(u)); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); P.s('mu', 1 + .15 * k, 1 - .1 * k); P.sy *= 1 - .08 * k; P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.7, P => { const u = P.u; P.s('mu', kf(u, [[0, 1.15], [.15, .9], [.4, 1.05], [1, 1]]), kf(u, [[0, .9], [.15, 1.15], [1, 1]])); P.under(c => khiDoc(c, 0, 0, 40, u, 6)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .12 * k, 1 - .15 * k); }),
    die: A(1.4, P => { CH.die(P); if (P.u > .25) P.under(c => khiDoc(c, 0, 0, 40, seg(P.u, .25, 1), 3)); }),
    chieu1: A(1.9, P => { const u = P.u; CHIEU.muaNem(P, 5, 60, 10, DOC, null, (c, x, y, e, i) => khiDoc(c, x, y, 12, e, i)); P.s('mu', 1 + .12 * Math.abs(sn(u * 5)) * (u > .3 && u < .8 ? 1 : 0), 1); }, { nhan: 'Chiêu: mưa bào tử' }),
  } });

})(); } catch (e) { MA.loi.push('rung.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art rung.js', e); }
// ----- laudai.js -----
try { (function () {
// Vùng Lâu đài cổ (hệ Lửa): 8 quái thường + 2 tinh anh. Bảng màu dùng chung của bản chốt: DOCAM, LUAV, THANH, XUONGT.
const LUA = [LUAV[0], LUAV[2], LUAV[3]], TRO = [THANH[2], THANH[3], '#cbc3c0'], DA = ['#5a5460', '#8a8290', '#cbc3c0'], HON = ['#ff8a1e', '#ffd23c', '#fff6b0'];
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .6 : -.6) : 0);
const tiaLua = (c, x, y, n, s, u) => F.hat(c, x, y, n, s, u, { v: 10, goc: -PI / 2, xoe: 1.4, cols: ['#fff6b0', '#ffd23c', '#ff8a1e', '#c43c10'] });
// ---- Lính Ma Giáp Gỉ: giáo chĩa trước, nón, áo choàng bay; đâm giáo ----
def('linhMa', { ten: 'Lính Ma Giáp Gỉ', vung: 'laudai', loai: 'thuong', tt: 1, luoi: () => QL.linh(), don: { kieu: 'lao', tam: 44, rong: 10, mau: HON }, chet: { k: 'hon', mau: HON }, hien: { k: 'khoi', mau: TRO },
  parts: [{ n: 'giao', m: [[0, 19, 19, 29]], pv: [19, 24] }, { n: 'non', m: [[5, 3, 27, 15]], pv: [16, 15] }, { n: 'ao', m: [[25, 14, 52, 34]], pv: [26, 24], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.h += sn(u) * 1; P.w('ao', 8, -u, .3).r('giao', 3 * sn(u)).r('non', 2 * sn(u + .2)); }),
    move: A(.6, P => { const u = P.u; P.h += 1.5 + sn(u * 2) * 1.2; P.rot += -3; P.w('ao', 12, -u * 2, .3).r('giao', 4 * sn(u * 2)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.m('giao', 5 * k, 0).r('giao', -5 * k); P.w('ao', 10, -u * 3, .3); }),
    atk: A(.55, P => { const u = P.u, k = kf(u, [[0, 5], [.15, -10, 'in'], [.45, -8], [1, 0]]); CH.atk(P); P.m('giao', k, 0); P.b('ao', 20 * seg(u, 0, .3) * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('giao', 20 * k).r('non', -15 * k).b('ao', 25 * k); }),
    die: A(1.3, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('giao', 50 * k).m('non', -2 * k, -6 * k).r('non', -30 * k).b('ao', 30 * k); }),
  } });
// ---- Bầy Dơi Than: ba con dơi vỗ cánh lệch nhịp ----
function doiNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3, v = sn(u * sp + i * .3); P.m('d' + i, sn(ph) * 1.2, sn(ph + .25) * (amp || 1.5) - v * .8); P.r('cT' + i, 35 * v).r('cP' + i, -35 * v); }); }
const DOI_P = []; [[1, [4, 3, 26, 22], [14, 12], [4, 4, 12, 17], [12, 11], [17, 4, 26, 17], [17, 11]], [2, [24, 10, 47, 28], [33, 18], [24, 11, 30, 25], [30, 18], [37, 11, 47, 25], [37, 18]], [3, [4, 18, 26, 37], [14, 26], [4, 19, 12, 31], [12, 25], [17, 19, 26, 31], [17, 25]]].forEach(q => {
  DOI_P.push({ n: 'd' + q[0], m: [q[1]], pv: q[2] }, { n: 'cT' + q[0], m: [q[3]], pv: q[4], cha: 'd' + q[0], keep: 1 }, { n: 'cP' + q[0], m: [q[5]], pv: q[6], cha: 'd' + q[0], keep: 1 }); });
def('doiThan', { ten: 'Bầy Dơi Than', vung: 'laudai', loai: 'thuong', tt: 2, luoi: () => QL.doi(), bay: true, cao: 10, don: { kieu: 'lao', tam: 40, rong: 18, mau: ['#5a0e0c', '#f0708a', '#ffd0d8'] }, chet: { k: 'bui', mau: TRO }, hien: { k: 'bay', xa: 50, cao: 40 }, parts: DOI_P,
  anims: {
    idle: A(1.2, P => { doiNhip(P, 3, 2); }),
    move: A(.5, P => { doiNhip(P, 4, 1.2); P.rot += -5; }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); doiNhip(P, 6, 1); P.theo(-3 * k); P.h += 4 * k; P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; doiNhip(P, 6, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.1 + i * .08, -14, 'in'], [.5 + i * .05, -10], [1, 0]]); P.m('d' + i, q, 3 * Math.sin(seg(u, 0, .5) * PI)); }); P.h -= 4 * Math.sin(seg(u, 0, .6) * PI); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('d1', -3 * k, -4 * k).m('d2', 5 * k, 0).m('d3', -3 * k, 4 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('d1', -4 * k, -5 * k).m('d2', 6 * k, 2 * k).m('d3', -4 * k, 5 * k); P.r('d1', 90 * k).r('d2', -120 * k).r('d3', 150 * k); }),
  } });
// ---- Tượng Đá Cầm Khiên: khiên chắn trước, chùy giơ sau; đập khiên xuống đất ----
def('tuongDa', { ten: 'Tượng Đá Cầm Khiên', vung: 'laudai', loai: 'thuong', tt: 3, luoi: () => QL.tuong(), don: { kieu: 'dap', tam: 28, mau: ['#5a5460', '#ff8a1e', '#fff6b0'] }, chet: { k: 'vo', mau: DA }, hien: { k: 'ghep', mau: DA },
  parts: [{ n: 'khien', m: [[0, 8, 21, 35]], pv: [21, 22] }, { n: 'chuy', m: [[36, 5, 48, 32]], pv: [37, 21] }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.tho(.015); P.r('khien', 2 * sn(u)).r('chuy', -3 * sn(u + .3)); }),
    move: A(.8, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1; P.rot += 3 * sn(u); P.r('khien', 3 * sn(u)).r('chuy', 5 * sn(u)); if (Math.abs(sn(u)) < .1) P.y += .5; }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'back'], [1, 1]]); CH.tele(P); P.m('khien', 2 * k, -6 * k).r('khien', 10 * k).r('chuy', -30 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, -6], [.18, 3, 'in'], [.5, 2], [1, 0]]); CH.atk(P); P.m('khien', 0, a).r('khien', kf(u, [[0, 10], [.18, -6, 'in'], [1, 0]])).r('chuy', kf(u, [[0, -30], [.2, 20, 'in'], [1, 0]])); if (u > .15 && u < .3) P.y += 1; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('khien', -8 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('khien', -25 * k).m('khien', -3 * k, 4 * k).r('chuy', 35 * k); }),
  } });
// ---- Đèn Lồng Ma: lơ lửng, tua lay; phun cầu lửa ----
def('denLong', { ten: 'Đèn Lồng Ma', vung: 'laudai', loai: 'thuong', tt: 4, luoi: () => QL.den(), bay: true, cao: 8, don: { kieu: 'ban', tam: 70, rong: 7, co: 3, mau: LUA, mom: [24, 26] }, chet: { k: 'chay', mau: ['#ffd23c', '#ff8a1e', '#48424e'] }, hien: { k: 'den' },
  parts: [{ n: 'tua', m: [[18, 30, 38, 40]], pv: [28, 30], keep: 0 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.h += sn(u) * 2; P.rot += 3 * sn(u + .25); P.w('tua', 10, -u, .4); P.over(c => tiaLua(c, P.x, P.y - P.h - 26, 3, (u * 4) | 0, (u * 4) % 1)); }),
    move: A(.8, P => { const u = P.u; P.h += sn(u * 2) * 1.5; P.rot += -6 + 2 * sn(u); P.b('tua', 25); P.w('tua', 8, -u * 2, .4); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); P.sx *= 1 + .1 * k; P.sy *= 1 + .1 * k; P.theo(-2 * k); P.w('tua', 14, -u * 3, .4); P.x += rung(u, .4); P.tint = ['#ffd23c', k * .3 * (1 + sn(u * 4)) / 2]; P.fxBao(); }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.b('tua', 30 * (1 - u)); P.tint = ['#fff6b0', (1 - seg(u, 0, .3)) * .5]; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.rot += 15 * k; P.b('tua', -30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'out']]); CH.die(P); P.rot += 30 * k; P.b('tua', 40 * k); }),
  } });
// ---- Mèo Đen Hai Đuôi: lưng cong, đuôi lửa vẫy; cào vụt ----
def('meoDen', { ten: 'Mèo Đen Hai Đuôi', vung: 'laudai', loai: 'thuong', tt: 5, luoi: () => QL.meo(), don: { kieu: 'chem', tam: 28, xoe: 1.6, mau: ['#5a0e0c', '#f0708a', '#ffffff'] }, chet: { k: 'tan', mau: [THANH[2], '#f0708a', '#ff8a1e'] }, hien: { k: 'bong', mau: [THANH[1], THANH[0]] },
  parts: [{ n: 'dau', m: [[2, 7, 20, 29]], pv: [19, 20] }, { n: 'duoi', m: [[38, 3, 62, 29]], pv: [40, 26], keep: 0 }, { n: 'chanT', m: [[4, 26, 19, 38]], pv: [12, 26], z: -1 }, { n: 'chanS', m: [[34, 26, 50, 38]], pv: [42, 26], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.035); P.w('duoi', 9, -u, .25).r('dau', 3 * sn(u)); }),
    move: A(.4, P => { const u = P.u; CH.move(P); P.r('chanT', 30 * sn(u)).r('chanS', -30 * sn(u)).w('duoi', 12, -u * 2, .25); }),
    tele: A(.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.sh += -4 * k; P.r('dau', -6 * k).r('chanT', -25 * k).b('duoi', -20 * k); }),
    atk: A(.5, P => { const u = P.u; CH.atk(P); P.theo(kf(u, [[0, 0], [.2, 8, 'out'], [1, 0]])); P.r('chanT', kf(u, [[0, -40], [.2, 30, 'in'], [1, 0]])).r('dau', kf(u, [[0, -6], [.2, 8], [1, 0]])); if (u < .4) P.bongMa = [{ x: -P.fx * 7, y: -P.fy * 7, a: .3, mau: '#f0708a' }]; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 30 * k).b('duoi', 40 * k).r('chanT', -35 * k).r('chanS', 35 * k); }),
  } });
// ---- Hũ Lửa Sống: nắp nảy, lửa phụt; lại gần thì phồng to (hình phồng) rồi nổ ra lửa ----
const luaSan = (c, x, y, r, e, t) => { if (e >= 1) return; F.a(c, 1 - seg(e, .6, 1)); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .4, d = r * (.3 + .5 * hh(i, 2, 7)); F.lua(c, x + Math.cos(a) * d, y + Math.sin(a) * d * MA.det, 6, 8 * (1 - e * .5), t + i, null, i); } F.a(c, 1); };
def('huLua', { ten: 'Hũ Lửa Sống', vung: 'laudai', loai: 'thuong', tt: 6, luoi: (p, hv) => QL.hu(hv === 'phong'), don: { kieu: 'no', tam: 34, mau: LUA }, chet: { k: 'no', mau: LUA }, hien: { k: 'roi', cao: 70, mau: TRO },
  parts: hv => hv === 'phong' ? [] : [{ n: 'nap', m: [[25, 18, 42, 31]], pv: [33, 31] }],
  anims: {
    idle: A(1.2, P => { const u = P.u; P.tho(.04); P.m('nap', 0, -Math.max(0, sn(u * 2)) * 1.5); P.r('nap', 4 * sn(u)); }),
    move: A(.5, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .1 - .05; P.rot += 5 * sn(u); P.m('nap', 0, -s * 2); }),
    tele: A(.8, P => { const u = P.u; P.sx *= 1 + .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.flash = u > .6 ? ((u * 24 | 0) % 2 ? .4 : 0) : 0; P.fxBao(); }, { hinh: u => u > .45 ? 'phong' : 0 }),
    atk: A(1, P => { const u = P.u; P.sx *= 1 + seg(u, 0, .15) * .2; P.sy *= 1 + seg(u, 0, .15) * .2; P.flash = u < .18 ? (((u * 30) | 0) % 2 ? .8 : .2) : 0; P.a = u < .2 ? 1 : seg(u, .9, 1); P.bong = P.a; if (u >= .9) { const s = seg(u, .9, 1); P.sx *= s; P.sy *= s; }
      if (u > .18) { P.under(c => luaSan(c, 0, 0, 22, seg(u, .25, 1), P.t)); P.fxDon(seg(u, .18, .75)); } }, { hinh: u => u < .2 ? 'phong' : 0 }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('nap', 0, -4 * k).r('nap', 20 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .2); CH.die(P); P.m('nap', -3 * k, -10 * k).r('nap', -60 * k); if (P.u > .25) P.under(c => luaSan(c, 0, 0, 16, seg(P.u, .25, 1), P.t)); }),
  } });
// ---- Tiểu Yêu Ném Pháo: ôm pháo, đuôi ngoe nguẩy; ném pháo vòng cung ----
let PHAO = null; const phao = (c, x, y, q) => { F.luoi(c, PHAO || (PHAO = QL.bom()), x, y, { rot: q * 8 }); };
def('tieuYeu', { ten: 'Tiểu Yêu Ném Pháo', vung: 'laudai', loai: 'thuong', tt: 7, luoi: () => QL.yeu(), don: { kieu: 'nem', tam: 56, rong: 14, vong: 26, mau: LUA, mom: [12, 26], dan: phao }, chet: { k: 'ra', mau: [THANH[2], DOCAM[1], LUAV[1]] }, hien: { k: 'no', mau: LUA },
  parts: [{ n: 'phao', m: [[6, 19, 19, 36]], pv: [18, 28] }, { n: 'dau', m: [[12, 4, 37, 25]], pv: [24, 24] }, { n: 'duoi', m: [[37, 18, 48, 35]], pv: [39, 32] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.r('dau', 4 * sn(u)).r('duoi', 15 * sn(u)).m('phao', 0, .8 * sn(u * 2)); }),
    move: A(.45, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.rot += 4 * sn(u); P.r('duoi', 20 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('phao', 60 * k).m('phao', 6 * k, -9 * k).r('dau', 8 * k).r('duoi', 25 * sn(u * 3)); }),
    atk: A(.75, P => { const u = P.u, a = kf(u, [[0, 60], [.1, -45, 'in'], [.3, -25], [1, 0, 'back']]); CH.atk(P); P.r('phao', a).s('phao', u > .08 && u < .9 ? 0 : 1); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).r('duoi', -30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('duoi', 40 * k).r('phao', -50 * k); }),
  } });
// ---- Nhím Than Hồng: xù gai đỏ rực lúc báo trước và ra đòn, bắn gai lửa ----
def('nhimThan', { ten: 'Nhím Than Hồng', vung: 'laudai', loai: 'thuong', tt: 8, luoi: (p, hv) => QL.nhim(hv === 'xu'), don: { kieu: 'gai', tam: 34, so: 10, mau: [DOCAM[0], LUAV[1], '#fff6b0'] }, chet: { k: 'heo', mau: [THANH[0], THANH[1], THANH[2], THANH[3]] }, hien: { k: 'cat', mau: [THANH[2], DOCAM[1], LUAV[1]] },
  anims: {
    idle: A(1.5, P => { P.tho(.04); if (((P.u * 6) | 0) === 2) P.tint = ['#ff8a1e', .25]; }),
    tele: A(.75, P => { CH.tele(P); P.tint = ['#ff8a1e', seg(P.u, .3, 1) * .3]; }, { hinh: u => u > .3 ? 'xu' : 0 }),
    atk: A(.6, P => { const u = P.u; P.sx *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.sy *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.fxDon(); }, { hinh: u => u < .7 ? 'xu' : 0 }),
    hit: A(.35, P => { CH.hit(P); }, { hinh: u => u < .5 ? 'xu' : 0 }),
  } });
// ---- TINH ANH: Tướng Ma. Đại đao chém, áo choàng bay. Chiêu riêng: đao xoáy (xoay hai vòng chém quanh mình) ----
def('tuongMa', { ten: 'Tướng Ma', vung: 'laudai', loai: 'tinhanh', tt: 1, luoi: () => QL.tuongMa(), don: { kieu: 'chem', tam: 44, xoe: 2.2, mau: LUA }, chet: { k: 'chim', mau: LUA }, hien: { k: 'quet', mau: ['#fff6b0', '#ffd23c'] },
  parts: [{ n: 'dao', m: [[5, 3, 24, 44]], pv: [18, 30] }, { n: 'ao', m: [[42, 21, 64, 45]], pv: [44, 27], keep: 0 }, { n: 'ngu', m: [[30, 2, 48, 12]], pv: [32, 11] }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.025); P.w('ao', 7, -u, .25).r('dao', 3 * sn(u)).b('ngu', 12 * sn(u)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.5; P.rot += 2 * sn(u); P.w('ao', 10, -u * 2, .25).r('dao', 5 * sn(u)).b('ngu', 15 * sn(u * 2)); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('dao', 45 * k).m('dao', 4 * k, -4 * k).b('ao', 15 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 45], [.18, -70, 'in'], [.45, -55], [1, 0, 'back']]); CH.atk(P); P.r('dao', a).b('ao', -20 * (1 - u)).b('ngu', -20 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dao', -15 * k).b('ao', 25 * k); }),
    die: A(1.5, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dao', 70 * k).m('dao', -4 * k, 6 * k).b('ao', 30 * k).b('ngu', 40 * k); if (P.u > .2) P.under(c => luaSan(c, 0, 0, 24, seg(P.u, .2, 1), P.t)); }),
    chieu1: A(1.6, P => { const u = P.u; CHIEU.xoay(P, 46, LUA, 2); P.r('dao', u < .35 ? 45 * seg(u, 0, .35) : -60).b('ao', u > .35 ? 30 : 0); }, { nhan: 'Chiêu: đao xoáy' }),
  } });
// ---- TINH ANH: Hũ Lửa Chúa. Vương miện lửa, hào quang nóng. Chiêu riêng: vòng cầu lửa (hai đợt toả tròn) ----
def('huChua', { ten: 'Hũ Lửa Chúa', vung: 'laudai', loai: 'tinhanh', tt: 2, luoi: () => QL.huChua(), don: { kieu: 'no', tam: 44, mau: LUA }, chet: { k: 'no', mau: LUA }, hien: { k: 'no', mau: LUA },
  parts: [{ n: 'mien', m: [[26, 20, 60, 34]], pv: [44, 34] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.m('mien', 0, -Math.max(0, sn(u * 2)) * 1.2); P.over(c => tiaLua(c, P.x, P.y - 40, 4, (u * 3) | 0, (u * 3) % 1)); }),
    move: A(.55, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .08 - .04; P.m('mien', 0, -s * 2); }),
    tele: A(.85, P => { const u = P.u; P.sx *= 1 + .08 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .08 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.tint = ['#ffd23c', seg(u, .3, 1) * .35]; P.fxBao(); }),
    atk: A(.75, P => { const u = P.u; P.sx *= kf(u, [[0, 1.15], [.15, .92], [.4, 1.04], [1, 1]]); P.sy *= kf(u, [[0, 1.15], [.15, .92], [.4, 1.04], [1, 1]]); P.m('mien', 0, kf(u, [[0, -6], [.3, 0, 'nay']])); P.under(c => luaSan(c, 0, 0, 30, u, P.t)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('mien', 0, -5 * k).r('mien', 15 * k); }),
    die: A(1.4, P => { const k = seg(P.u, 0, .2); CH.die(P); P.m('mien', -5 * k, -16 * k).r('mien', -70 * k); if (P.u > .25) P.under(c => luaSan(c, 0, 0, 30, seg(P.u, .25, 1), P.t)); }),
    chieu1: A(1.7, P => { const u = P.u; CHIEU.vongDan(P, 8, 60, LUA, 2); P.m('mien', 0, u > .35 && u < .5 ? -6 : 0); }, { nhan: 'Chiêu: vòng cầu lửa' }),
  } });

})(); } catch (e) { MA.loi.push('laudai.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art laudai.js', e); }
// ----- trumnho.js -----
try { (function () {
// Ba trùm nhỏ: Cua Đá (Hang biển), Nấm Chúa (Rừng già), Hổ Lửa (Lâu đài cổ). Mỗi con 7 cử động chuẩn + 2 chiêu riêng.
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .7 : -.7) : 0);
const DA = ['#4a5468', '#9db0cc', '#e8f0ff'], NGOC = ['#1a7a78', '#5ae8d8', '#e0fff8'], DOC = [DOCX[0], DOCX[1], DOCX[3]], LUA = [LUAV[0], LUAV[2], LUAV[3]];
// Mượn hiệu ứng đòn chuẩn với thông số khác (vd phun lửa hình quạt).
function muonDon(P, don, u, bao) { const g = P.d.don; P.d.don = don; if (bao) DON.bao(P, u); else DON.don(P, u); P.d.don = g; }
// Đập xuống đất: báo trước vòng tròn, đập, sóng chấn động lan + vết nứt toả ra + đá văng.
function dapSan(P, tam, cols, u0) { const u = P.u, a = u0 || .45;
  if (u < a) P.under(c => F.baoTron(c, 0, 0, tam, u / a));
  else { const e = seg(u, a, 1); P.under(c => { for (let i = 0; i < 9; i++) { const g = i / 9 * TAU + .3, r = tam * Math.min(1, e * 2.2); F.a(c, 1 - seg(e, .6, 1)); F.set(c, Math.cos(g) * 6, Math.sin(g) * 6 * MA.det, Math.cos(g) * r, Math.sin(g) * r * MA.det, i + 2, cols[0], 1, 5); F.a(c, 1); } F.song(c, 0, 0, tam, seg(e, 0, .7), [cols[2], cols[1]], 3); F.song(c, 0, 0, tam * .75, seg(e, .15, .9), [cols[1], cols[0]], 2); });
    P.over(c => { for (let i = 0; i < 10; i++) { const g = i / 10 * TAU; F.hat(c, Math.cos(g) * tam * .35, Math.sin(g) * tam * .35 * MA.det, 3, i + 9, e, { v: 10, goc: -PI / 2, xoe: 1.4, g: 18, cols: [cols[2], cols[1], cols[0]], to: 2 }); } }); } }
// Một hàng nổ nối nhau theo hướng dir: n vùng tròn, mỗi vùng báo trước rồi bùng lên lần lượt. ve(c, x, y, e) vẽ cú bùng.
function hangNo(P, n, buoc, rong, ve) { const u = P.u, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det;
  P.under(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, x = ex * buoc * (i + 1), y = ey * buoc * (i + 1); if (u < t0) F.baoTron(c, x, y, rong, clamp(u / t0, 0, 1)); } });
  P.over(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, e = seg(u, t0, t0 + .35); if (e > 0 && e < 1) ve(c, ex * buoc * (i + 1), ey * buoc * (i + 1), e, i); } }); }

// ---- CUA ĐÁ: hai càng đá, lưng tinh thể ----
const tinhThe = (c, x, y, q) => { F.duong(c, x, y - 5, x, y + 3, NGOC[1], 3); F.duong(c, x, y - 4, x, y, NGOC[2], 1); F.px(c, x - 1, y + 3, NGOC[0], 3, 1); };
def('cuaDa', { ten: 'Cua Đá', vung: 'bien', loai: 'trumnho', tt: 1, luoi: () => Q2.cuaDa(), don: { kieu: 'chem', tam: 44, xoe: 2, mau: [DA[0], NGOC[1], NGOC[2]] }, chet: { k: 'vo', mau: DA }, hien: { k: 'cat', mau: ['#d8c08a', '#a88a58', '#f0e0b0'] },
  parts: [{ n: 'cangT', m: [[0, 21, 31, 57]], pv: [29, 48] }, { n: 'cangP', m: [[82, 39, 116, 75]], pv: [85, 57] }, { n: 'chanT', m: [[22, 67, 52, 84]], pv: [38, 67], z: -1 }, { n: 'chanP', m: [[64, 67, 98, 84]], pv: [80, 67], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.02); P.r('cangT', 4 * sn(u)).r('cangP', -4 * sn(u + .15)); P.r('chanT', 2 * sn(u)).r('chanP', -2 * sn(u)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u * 2)) * 1.2; P.rot += 2 * sn(u); P.x += sn(u * 2) * .8; P.r('chanT', 16 * sn(u * 2)).r('chanP', 16 * sn(u * 2 + .5)); P.r('cangT', 5 * sn(u * 2)).r('cangP', 5 * sn(u * 2 + .3)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('cangT', 30 * k + rung(u, .4) * 6).m('cangT', 3 * k, -6 * k).r('cangP', -20 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 30], [.18, -40, 'in'], [.45, -30], [1, 0, 'back']]); CH.atk(P); P.r('cangT', a).m('cangT', 3 * (1 - seg(u, 0, .2)), -6 * (1 - seg(u, 0, .2))); P.r('cangP', -20 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('cangT', -15 * k).r('cangP', 15 * k); P.over(c => F.hat(c, 0, -40, 8, 4, P.u, { v: 14, cols: DA })); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('cangT', -40 * k).m('cangT', 0, 8 * k).r('cangP', 40 * k).m('cangP', 0, 8 * k); P.sy *= 1 - .15 * k; }),
    spawn: A(1.3, P => { const u = P.u; CH.spawn(P); P.r('cangT', 30 * sn(u * 3) * (u > .6 ? 1 : 0)).r('cangP', -30 * sn(u * 3) * (u > .6 ? 1 : 0)); }),
    // Chiêu 1: giơ hai càng lên cao rồi đập xuống, sàn nứt và sóng chấn động lan ra (phải chạy ra ngoài vòng đỏ).
    chieu1: A(1.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [.47, -.4, 'in'], [.7, -.3], [1, 0]]); P.r('cangT', 45 * k).m('cangT', 0, -8 * Math.max(0, k)).r('cangP', -45 * k).m('cangP', 0, -8 * Math.max(0, k)); P.sy *= 1 + .08 * k; P.x += rung(u, .3) * (u < .45 ? 1 : 0);
      if (u > .45 && u < .6) P.y += ((u * 40) | 0) % 2 ? 1 : -1; dapSan(P, 64, [DA[0], NGOC[1], '#ffffff']); }, { nhan: 'Chiêu 1: đập càng rung sàn' }),
    // Chiêu 2: tinh thể trên lưng bắn vọt lên rồi rơi xuống năm chỗ, cắm thành cột băng.
    chieu2: A(1.8, P => { const u = P.u; P.flash = u > .15 && u < .3 && ((u * 30) | 0) % 2 ? .4 : 0; P.tint = ['#5ae8d8', u < .3 ? u / .3 * .22 : .22 * (1 - seg(u, .3, .6))]; CHIEU.muaNem(P, 5, 70, 9, NGOC, tinhThe, (c, x, y, e) => { if (e < .9) { F.duong(c, x, y - 8 * (1 - e * .5), x, y, NGOC[1], 3); F.px(c, x, y - 8 * (1 - e * .5), NGOC[2]); } }); P.r('cangT', 10 * sn(u * 4)).r('cangP', -10 * sn(u * 4)); }, { nhan: 'Chiêu 2: mưa tinh thể' }),
  } });
// ---- NẤM CHÚA: mũ tím đội vương miện, tay rễ có vuốt ----
const khiDoc = (c, x, y, r, e, s) => { F.a(c, (1 - e) * .5); F.khoi(c, x, y, r, e * .7, [DOCX[2], DOCX[1], TIMD[3]], s, 7); F.a(c, 1); };
const namNho = (c, x, y, e) => { const h = Math.min(1, e * 4) * (1 - seg(e, .75, 1)); if (h <= 0) return; F.px(c, x - 1, y - 4 * h, '#d4c8a8', 2, 4 * h + 1); F.elip(c, x, y - 4 * h - 1, 4 * h + 1, 2 * h + 1, TIMD[2]); F.px(c, x - 2, y - 4 * h - 2, TIMD[3], 2, 1); };
def('namChua', { ten: 'Nấm Chúa', vung: 'rung', loai: 'trumnho', tt: 1, luoi: () => QT.namChua(), don: { kieu: 'phun', tam: 52, xoe: 1.2, mau: [DOCX[1], DOCX[2], DOCX[3], TIMD[3]], mom: [40, 52] }, chet: { k: 'heo', mau: [NAUG[0], NAUG[1], '#5a4a6a', '#8a7a9a'] }, hien: { k: 'moc', mau: TIMD },
  parts: [{ n: 'mu', m: [[8, 4, 93, 38]], pv: [50, 38] }, { n: 'tayT', m: [[0, 30, 30, 64]], pv: [29, 48] }, { n: 'tayP', m: [[71, 30, 100, 64]], pv: [72, 48] }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.03); P.s('mu', 1 + .03 * sn(u + .25), 1 - .03 * sn(u + .25)); P.r('tayT', 5 * sn(u)).r('tayP', -5 * sn(u)); P.under(c => khiDoc(c, 0, -2, 30, (u + .5) % 1, 2)); }),
    move: A(.7, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 2.5; P.sy *= 1 + s * .06 - .03; P.r('mu', 3 * sn(u)).r('tayT', 12 * sn(u)).r('tayP', 12 * sn(u)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('tayT', 30 * k).r('tayP', -30 * k).s('mu', 1 + .08 * k, 1 - .06 * k); }),
    atk: A(.8, P => { const u = P.u; P.sy *= kf(u, [[0, .9], [.12, 1.08], [.4, 1]]); P.r('tayT', 30 * (1 - seg(u, 0, .2))).r('tayP', -30 * (1 - seg(u, 0, .2))); P.s('mu', 1, kf(u, [[0, .94], [.12, 1.06], [.5, 1]])); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .1 * k, 1 - .12 * k); P.r('tayT', -20 * k).r('tayP', 20 * k); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.3, 1, 'out']]); CH.die(P); P.r('mu', -15 * k).m('mu', 0, 6 * k).r('tayT', -40 * k).r('tayP', 40 * k); if (P.u > .2) P.under(c => khiDoc(c, 0, 0, 40, seg(P.u, .2, 1), 5)); }),
    // Chiêu 1: cắm tay rễ xuống đất, một hàng nấm độc mọc vọt lên nối nhau theo hướng bé đứng, mỗi cây phụt khí độc.
    chieu1: A(1.7, P => { const u = P.u, k = kf(u, [[0, 0], [.2, 1, 'back'], [.85, 1], [1, 0]]); P.r('tayT', -35 * k).m('tayT', 0, 6 * k).r('tayP', 35 * k).m('tayP', 0, 6 * k); P.sy *= 1 - .06 * k; P.x += rung(u, .2) * (u < .8 ? 1 : 0);
      hangNo(P, 5, 16, 9, (c, x, y, e, i) => { namNho(c, x, y, e); khiDoc(c, x, y - 2, 14, e, i); F.hat(c, x, y - 4, 8, i, e, { v: 9, goc: -PI / 2, xoe: 1.8, cols: [DOCX[3], DOCX[2], TIMD[3]] }); }); }, { nhan: 'Chiêu 1: hàng nấm độc' }),
    // Chiêu 2: xoay mũ, bào tử bắn toả tròn hai đợt và một vòng khí độc lan rộng.
    chieu2: A(1.8, P => { const u = P.u; CHIEU.vongDan(P, 10, 60, [TIMD[1], DOCX[2], DOCX[3]], 2); P.r('mu', u > .35 ? 8 * sn(u * 3) : 0).r('tayT', 30 * Math.min(1, u * 3)).r('tayP', -30 * Math.min(1, u * 3)); if (u > .4) P.under(c => khiDoc(c, 0, 0, 50, seg(u, .4, 1), 8)); }, { nhan: 'Chiêu 2: bão bào tử' }),
  } });
// ---- HỔ LỬA: vằn than hồng, bờm gáy và chóp đuôi cháy ----
// Lửa phun hình quạt: các cụm lửa bay dọc các tia, nở to dần và đổi màu trắng -> vàng -> cam -> đỏ, cuối có khói.
const phunLua = (c, x, y, dir, tam, span, u, gy) => { const C = ['#fff6b0', '#ffd23c', '#ff8a1e', '#c43c10'], n = 46; for (let i = 0; i < n; i++) { const a = dir + (hh(i, 1, 5) - .5) * span * (.6 + .4 * hh(i, 4, 2)), ph = (u * 2.4 + hh(i, 2, 5)) % 1; if (u < .15 && ph > u / .15) continue; if (u > .8 && ph < seg(u, .8, 1)) continue;
  const r = 5 + (tam - 5) * ph, rad = 1 + ph * 4.5, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * MA.det + ph * ((gy == null ? y : gy) - y) * .8 - ph * 3; if (ph > .85) { F.a(c, .5); F.dia(c, px, py - 2, rad, '#48424e'); F.a(c, 1); } else { F.dia(c, px, py, rad, C[Math.min(3, (ph * 4.4) | 0)]); if (ph < .5) F.px(c, px, py, '#fff6b0'); } } };
const vetLua = (c, x0, y0, x1, y1, e, t) => { const n = 9; F.a(c, 1 - seg(e, .75, 1)); for (let i = 0; i < n; i++) { const f = i / (n - 1); F.lua(c, lerp(x0, x1, f), lerp(y0, y1, f), 11, 15 * (1 - e * .4) * (.7 + .3 * hh(i, 1, 4)), t + i * .3, null, i); } F.a(c, 1); };
def('hoLua', { ten: 'Hổ Lửa', vung: 'laudai', loai: 'trumnho', tt: 1, luoi: () => QT.hoLua(), don: { kieu: 'chem', tam: 46, xoe: 1.9, mau: [LUAV[0], LUAV[2], '#fff6b0'] }, chet: { k: 'chay', mau: ['#ffd23c', '#ff8a1e', '#48424e'] }, hien: { k: 'bay', xa: 64, cao: 44 },
  parts: [{ n: 'dau', m: [[2, 23, 38, 67]], pv: [37, 50] }, { n: 'chanT', m: [[10, 63, 46, 82]], pv: [32, 63], z: -1 }, { n: 'chanS', m: [[78, 58, 106, 82]], pv: [89, 58], z: -1 }, { n: 'duoi', m: [[92, 12, 122, 52]], pv: [95, 48], keep: 0 }, { n: 'bom', m: [[34, 12, 78, 33]], pv: [56, 33], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.025); P.r('dau', 3 * sn(u)).w('duoi', 7, -u, .2).w('bom', 5, -u * 2, .5); }),
    move: A(.6, P => { const u = P.u; CH.move(P); P.r('chanT', 22 * sn(u)).r('chanS', -22 * sn(u)).r('dau', 3 * sn(u * 2)).w('duoi', 10, -u * 2, .2).w('bom', 6, -u * 3, .5); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -10 * k).r('chanT', -25 * k).b('duoi', 20 * k).w('bom', 8, -u * 4, .5); }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.r('chanT', kf(u, [[0, -40], [.2, 35, 'in'], [1, 0]])).r('dau', kf(u, [[0, -10], [.2, 10], [1, 0]])).b('duoi', -15 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 14 * k).b('duoi', 25 * k); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -35 * k).r('chanS', 35 * k).b('duoi', 40 * k); }),
    // Chiêu 1: chồm tới vồ thẳng một đường dài, để lại vệt lửa cháy trên sàn.
    chieu1: A(1.5, P => { const u = P.u, tam = 74, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det; CHIEU.laoNhieu(P, 1, tam, 18, LUA, 0); P.r('chanT', u > .45 ? -35 : -20 * u / .45).r('chanS', u > .45 ? 30 : 0).r('dau', u > .45 ? -12 : 0);
      if (u > .5) P.under(c => vetLua(c, ex * 30, ey * 30, ex * (tam + 30), ey * (tam + 30), seg(u, .5, 1.05), P.t)); }, { nhan: 'Chiêu 1: vồ lửa' }),
    // Chiêu 2: ngẩng đầu gầm rồi phun lửa hình quạt rộng.
    chieu2: A(1.7, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'back'], [.45, -.5, 'in'], [.9, -.5], [1, 0]]); P.r('dau', 18 * k).sy *= 1 + .05 * Math.max(0, k);       if (u < .45) { const v = u / .45; P.x += rung(u, .2); const m = P.pt(10, 57), gy = P.y; P.under(c => F.baoQuat(c, m[0], gy, 76, P.dir, 1.2, v)); P.over(c => { F.dia(c, m[0], m[1], 1 + v * 3, '#ff8a1e'); F.hat(c, m[0], m[1], 6, 11, 1 - (v * 3 % 1), { v: -7, cols: ['#ffd23c', '#fff6b0'] }); }); } else { const m = P.pt(10, 57), e = seg(u, .45, 1), gy0 = P.y; P.under(c => F.baoQuat(c, m[0], gy0, 76, P.dir, 1.2, .7)); const gy = P.y; P.over(c => phunLua(c, m[0], m[1], P.dir, 76, 1.2, e, gy)); P.x += ((u * 40) | 0) % 2 ? .5 : -.5; } P.w('bom', 8, -u * 5, .5); }, { nhan: 'Chiêu 2: gầm phun lửa' }),
  } });

})(); } catch (e) { MA.loi.push('trumnho.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art trumnho.js', e); }
// ----- ngutinh.js -----
try { (function () {
// TRÙM VÙNG Hang biển: NGƯ TINH. Ba pha (1 rình mồi, 2 giận dữ, 3 hoá băng). Cá khổng lồ trồi lên khỏi sóng; sóng giữ yên khi thân nhấp nhô.
const NUOC = ['#3f8fd0', '#9fd8f5', '#ffffff'], BANG = ['#4f86b0', '#a9d8ee', '#ffffff'], GIAN = ['#b0261a', '#ff5a3c', '#ffd0a0'];
const mauPha = P => P.phase === 3 ? BANG : P.phase === 2 ? ['#1b4c92', '#ff7a5a', '#ffffff'] : NUOC;
// nhấp nhô: thân lên xuống còn sóng đứng yên
function nhapNho(P, a) { P.h += a; P.m('song', 0, a); }
// tung nước: tia nước bắn lên + vòng sóng
const tungNuoc = (c, x, y, e, s, r, C) => { C = C || NUOC; F.song(c, x, y, r * .45, e, [C[2], C[1]], 1); F.hat(c, x, y - 2, 14, s, e, { v: r * .9, goc: -PI / 2, xoe: 1.6, g: r * 1.2, cols: [C[2], C[1], C[0]], to: 2 }); };
// tường sóng ngang hướng dir, cách gốc d, rộng W
function tuongSong(c, ox, oy, dir, d, W, H, C, a) { for (let k = 6; k >= 1; k -= 2) tuongSong1(c, ox, oy, dir, d - k * 2, W * (1 - k * .04), H * (1 - k * .1), [C[0], C[0], C[1]], (a == null ? 1 : a) * (.5 - k * .05)); tuongSong1(c, ox, oy, dir, d, W, H, C, a); }
function tuongSong1(c, ox, oy, dir, d, W, H, C, a) { const ex = Math.cos(dir), ey = Math.sin(dir) * MA.det, nx = -ey, ny = ex; F.a(c, a == null ? 1 : a);
  for (let j = -W / 2; j <= W / 2; j += 1) { const f = 1 - Math.pow(Math.abs(j) / (W / 2), 2), h = H * (.4 + .6 * f) * (.85 + .15 * Math.sin(j * .7 + d * .3)), x = ox + ex * d + nx * j, y = oy + ey * d + ny * j;
    c.fillStyle = C[0]; c.fillRect(Math.round(x), Math.round(y - h), 1, Math.round(h)); c.fillStyle = C[1]; c.fillRect(Math.round(x), Math.round(y - h), 1, Math.round(h * .45)); c.fillStyle = C[2]; c.fillRect(Math.round(x), Math.round(y - h - 1), 1, 2); if (((j + d) | 0) % 3 === 0) F.px(c, x - ex * 2, y - h - 2 - hh(j, d | 0, 1) * 3, C[2]); } F.a(c, 1); }
// cột băng nhọn cắm trên sàn (cao h)
function cotBang(c, x, y, h, C) { C = C || BANG; for (let j = 0; j < h; j++) { const w = Math.max(1, Math.round(4 * (1 - j / h))); c.fillStyle = j < 2 ? C[0] : (j % 4 < 2 ? C[1] : C[0]); c.fillRect(Math.round(x - w / 2), Math.round(y - j), w, 1); } F.px(c, x - 1, y - h * .6, C[2], 1, Math.max(1, h * .3)); F.px(c, x, y - h, '#ffffff'); }
const NT_P = ph => { const L = [{ n: 'duoi', m: [[112, 26, 150, 90]], pv: [113, 58] }, { n: 'vay', m: [[70, 0, 114, 40]], pv: [92, 42], keep: 0 }, { n: 'vayBung', m: [[62, 74, 100, 92]], pv: [70, 76] },
  { n: 'ham', m: [{ p: [[24, 67], [63, 65], [65, 80], [57, 93], [28, 93], [22, 80]] }], pv: [62, 68] }, { n: 'rau', m: [{ p: [[4, 44], [25, 44], [25, 97], [4, 97]] }], pv: [25, 62] }];
  if (ph < 3) L.unshift({ n: 'song', m: [[0, 86, 150, 104]], pv: [75, 96], keep: 0, z: 2 }); return L; };
def('nguTinh', { ten: 'Ngư Tinh', vung: 'bien', loai: 'trum', tt: 1, pha: 3, luoi: p => Q2.nguTinh(p), parts: NT_P, bong: 0,
  anims: {
    // Ra mắt: bọt nổi, nước xoáy, cá trồi lên giữa cột nước, há miệng gầm.
    intro: A(2.8, P => { const u = P.u, C = mauPha(P), q = seg(u, .25, .62), e = EASE.back(q);
      P.tan = q < 1 ? { k: 'chim', u: clamp(1 - e, 0, 1) } : null; if (e > 1) P.h += (e - 1) * 30; if (u < .62) P.x += ((u * 30) | 0) % 2 ? .8 : -.8;
      const g = kf(u, [[.62, 0], [.72, 1, 'out'], [.9, 1], [1, 0]]); P.r('ham', -22 * g).b('rau', 20 * g).r('vay', -10 * g); P.sy *= 1 + .06 * g; if (u > .7 && u < .9) P.x += ((u * 40) | 0) % 2 ? 1 : -1;
      P.under(c => { for (let i = 0; i < 3; i++) { const q2 = (u * 2 + i / 3) % 1; F.a(c, (1 - q2) * (1 - seg(u, .6, .8))); F.vong(c, 0, 0, 30 + q2 * 50, 8 + q2 * 14, C[i % 2], 1); } F.a(c, 1); if (u > .62) F.song(c, 0, 0, 110, seg(u, .66, 1), [C[2], C[1]], 3); });
      P.over(c => { if (u < .3) for (let i = 0; i < 10; i++) { const q2 = (u * 3 + hh(i, 1, 1)) % 1; F.vong(c, (hh(i, 2, 1) - .5) * 80, -q2 * 20, 1 + q2 * 1.5, 1 + q2 * 1.5, C[2], 1); }
        if (u > .25 && u < .8) for (let i = 0; i < 5; i++) { const x = (i - 2) * 26, e2 = seg(u, .25 + i * .03, .7 + i * .02); if (e2 > 0 && e2 < 1) { F.a(c, 1 - e2); F.px(c, x - 3, -Math.sin(e2 * PI) * 70, C[1], 6, Math.sin(e2 * PI) * 70); F.px(c, x - 1, -Math.sin(e2 * PI) * 74, C[2], 2, Math.sin(e2 * PI) * 74); F.a(c, 1); tungNuoc(c, x, 0, e2, i, 22, C); } } }); }, { nhan: 'Ra mắt' }),
    idle: A(2, P => { const u = P.u; nhapNho(P, sn(u) * 2.5); P.rot += 1.5 * sn(u + .1); P.w('song', 3, -u * 2, .25); P.w('duoi', 6, -u, .15).r('vay', 4 * sn(u)).b('rau', 12 * sn(u + .3)).r('ham', -3 - 3 * sn(u * 2)).r('vayBung', 8 * sn(u + .2)); }),
    move: A(1.2, P => { const u = P.u; nhapNho(P, sn(u * 2) * 2); P.rot += -3; P.w('song', 4, -u * 3, .25); P.w('duoi', 12, -u * 2, .15).b('rau', 25 + 8 * sn(u * 2)).r('vay', -6).r('vayBung', 15 * sn(u * 2)); P.under(c => { F.hat(c, 60 * -P.face, -6, 10, (u * 4) | 0, (u * 4) % 1, { v: 14, goc: -PI / 2 + (P.face > 0 ? -1 : 1) * .6, xoe: 1, g: 8, cols: [NUOC[2], NUOC[1]] }); }); }),
    // Chiêu 1: ĐỚP. Lùi lại há miệng (vệt đỏ thẳng), lao tới đớp, nước bắn tung toé.
    c1: A(1.9, P => { const u = P.u, C = mauPha(P), tam = 90, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det;
      if (u < .4) { const v = u / .4; P.x -= ex * 6 * v; P.y -= ey * 6 * v; P.r('ham', -26 * EASE.out(v)).b('rau', 25 * v).w('duoi', 10, -u * 4, .15); P.x += v > .5 ? (((u * 40) | 0) % 2 ? .7 : -.7) : 0; P.flash = v > .75 && ((u * 30) | 0) % 2 ? .3 : 0; P.under(c => F.baoDuong(c, 0, 0, tam, 40, P.dir, v)); }
      else if (u < .62) { const v = seg(u, .4, .62), f = kf(v, [[0, 0], [.4, 1, 'out'], [1, .9]]); P.x += ex * 50 * f - ex * 6 * (1 - f); P.y += ey * 50 * f; P.r('ham', v < .45 ? -26 : 4).b('rau', -20); P.sx *= 1.06; P.bongMa = [1, 2].map(i => ({ x: -ex * i * 10, y: -ey * i * 10, a: .25, mau: C[1] }));
        if (v > .4) P.over(c => { const x = ex * tam * .75, y = ey * tam * .75; F.hat(c, x, y - 30, 16, 2, seg(v, .4, 1), { v: 26, cols: ['#ffffff', C[1], C[0]], to: 2 }); F.liem(c, x - ex * 10, y - 30, 22, P.dir + PI / 2, 2.4, seg(v, .4, 1), [C[0], C[1], '#ffffff'], 5); }); }
      else { const v = seg(u, .62, 1), f = 1 - EASE.io(v); P.x += ex * 50 * f * .9; P.y += ey * 50 * f * .9; P.r('ham', -6 * (1 - v)); P.under(c => { tungNuoc(c, ex * tam * .7, ey * tam * .7, v, 3, 34, C); F.song(c, ex * tam * .7, ey * tam * .7, 50, seg(v, .2, 1), [C[1], C[0]], 1); }); } }, { nhan: 'Chiêu 1: đớp', moc: [.4, .62] }),
    // Chiêu 2: SÓNG THẦN. Quẫy đuôi gọi sóng; một bức tường nước chạy theo hướng bé, để lại bọt.
    c2: A(2.3, P => { const u = P.u, C = mauPha(P), L = 130, W = 80, dir = P.dir;
      if (u < .38) { const v = u / .38; P.b('duoi', 35 * v).r('vay', -10 * v); nhapNho(P, 5 * v); P.w('song', 6 * v, -u * 6, .25); P.under(c => F.baoDuong(c, 0, 0, L, W, dir, v)); }
      else { const v = seg(u, .38, .8), w = seg(u, .8, 1), k = kf(seg(u, .38, .5), [[0, 1], [1, -.6, 'in']]); P.b('duoi', 35 * k).r('vay', -10 * k); nhapNho(P, 5 * Math.max(0, k)); P.w('song', 8, -u * 6, .25);
        P.under(c => { if (u < .82) tuongSong(c, 0, 0, dir, 10 + (L - 10) * v, W * (.7 + .3 * v), 20 + 10 * Math.sin(v * PI), [C[0], C[1], '#ffffff'], 1 - w);
          for (let i = 0; i < 12; i++) { const d0 = 14 + i * 9; if (d0 > 10 + (L - 10) * v) continue; const j = (hh(i, 7, 2) - .5) * W * .8; F.a(c, .7 * (1 - w)); F.px(c, Math.cos(dir) * d0 - Math.sin(dir) * j, Math.sin(dir) * d0 + Math.cos(dir) * j, '#ffffff', 2, 1); } F.a(c, 1); if (w > 0) F.song(c, Math.cos(dir) * L, Math.sin(dir) * L, 40, w, [C[2], C[1]], 2); }); } }, { nhan: 'Chiêu 2: sóng thần', moc: [.38, .8] }),
    // Chiêu 3: PHUN BĂNG. Há miệng hít vào (gió tụ), phun luồng băng hình quạt, sàn đóng gai băng rồi vỡ.
    c3: A(2.2, P => { const u = P.u, C = BANG, tam = 100, span = 1;
      const mo = () => P.pt(38, 76);
      if (u < .4) { const v = u / .4; P.r('ham', -24 * v).b('rau', 15 * v); P.sx *= 1 + .05 * v; P.under(c => { const m = mo(); F.baoQuat(c, m[0], P.y, tam, P.dir, span, v); }); P.over(c => { const m = mo(); for (let i = 0; i < 14; i++) { const a = P.dir + (hh(i, 1, 4) - .5) * 1.6, q = (v * 2 + hh(i, 2, 4)) % 1, r = 50 * (1 - q); F.px(c, m[0] + Math.cos(a) * r, m[1] + Math.sin(a) * r, C[q > .5 ? 2 : 1]); } F.dia(c, m[0], m[1], 1 + v * 3, C[1]); }); }
      else if (u < .75) { const v = seg(u, .4, .75); P.r('ham', -24).b('rau', -10); P.x += ((u * 40) | 0) % 2 ? .5 : -.5; P.under(c => { const m = mo(); F.baoQuat(c, m[0], P.y, tam, P.dir, span, .7); for (let i = 0; i < 9; i++) { const a = P.dir + (hh(i, 3, 3) - .5) * span * .9, d = 20 + hh(i, 4, 3) * (tam - 25); if (d > tam * v * 1.3) continue; cotBang(c, m[0] + Math.cos(a) * d, P.y + Math.sin(a) * d * MA.det, 4 + hh(i, 5, 3) * 7); } });
        P.over(c => { const m = mo(), n = 50; for (let i = 0; i < n; i++) { const a = P.dir + (hh(i, 1, 6) - .5) * span, ph = (v * 2.6 + hh(i, 2, 6)) % 1; if (v < .1 && ph > v * 10) continue; const r = 4 + (tam - 4) * ph, x = m[0] + Math.cos(a) * r, y = m[1] + Math.sin(a) * r * MA.det + ph * (P.y - m[1]) * .8; F.dia(c, x, y, .6 + ph * 3, ph < .3 ? '#ffffff' : ph < .65 ? C[1] : C[0]); if (i % 5 === 0) F.sao(c, x, y - 2, 1, '#ffffff'); } }); }
      else { const v = seg(u, .75, 1); P.r('ham', -24 * (1 - v)); P.under(c => { const m = mo(); for (let i = 0; i < 9; i++) { const a = P.dir + (hh(i, 3, 3) - .5) * span * .9, d = 20 + hh(i, 4, 3) * (tam - 25), x = m[0] + Math.cos(a) * d, y = P.y + Math.sin(a) * d * MA.det; if (v < .4) cotBang(c, x, y, 4 + hh(i, 5, 3) * 7); else F.hat(c, x, y - 3, 6, i, seg(v, .4, 1), { v: 8, g: 6, cols: ['#ffffff', C[1], C[0]] }); } }); } }, { nhan: 'Chiêu 3: phun băng', moc: [.4, .75] }),
    // Chiêu 4: MƯA BĂNG NHỌN. Ngửa đầu gầm, sáu vùng tròn quanh bé, băng nhọn rơi thẳng từ trên xuống, vỡ vụn.
    c4: A(2.2, P => { const u = P.u, C = BANG, T = []; for (let i = 0; i < 7; i++) { const a = P.dir + (i - 3) * .42, r = 45 + 50 * hh(i, 2, 8); T.push([Math.cos(a) * r, Math.sin(a) * r * MA.det, .32 + i * .06]); }
      const g = kf(u, [[0, 0], [.25, 1, 'out'], [.8, 1], [1, 0]]); P.rot += 8 * g; P.r('ham', -20 * g).b('rau', 20 * g); P.sy *= 1 + .04 * g; if (u < .3) P.x += ((u * 40) | 0) % 2 ? .6 : -.6;
      P.under(c => { for (const [x, y, t0] of T) { if (u < t0 + .12) F.baoTron(c, x, y, 11, clamp(u / (t0 + .12), 0, 1)); const e = seg(u, t0 + .12, t0 + .45); if (e > 0 && e < 1) { if (e < .5) cotBang(c, x, y, 12 * (1 - e)); F.hat(c, x, y - 2, 12, t0 * 100 | 0, e, { v: 14, g: 8, cols: ['#ffffff', C[1], C[0]], to: 2 }); F.song(c, x, y, 16, e, ['#ffffff', C[1]], 1); } } });
      P.over(c => { for (const [x, y, t0] of T) { const q = seg(u, t0 - .1, t0 + .12); if (q > 0 && q < 1) { const yy = y - 90 * (1 - q * q); F.a(c, .35); F.elip(c, x, y, 4 * q + 1, 2 * q + 1, '#000000'); F.a(c, 1); F.duong(c, x, yy - 10, x, yy, C[1], 3); F.duong(c, x, yy - 9, x, yy - 1, '#ffffff', 1); F.px(c, x, yy + 1, '#ffffff'); } } }); }, { nhan: 'Chiêu 4: mưa băng nhọn', moc: [.38, .8] }),
    // Chiêu 5: XOÁY NƯỚC. Xoay mình, nước cuộn thành xoáy lớn quanh thân hút vào; cuối cùng bung ra thành vòng sóng.
    c5: A(2.6, P => { const u = P.u, C = mauPha(P), R = 95;
      if (u < .3) { const v = u / .3; P.under(c => { F.baoTron(c, 0, 0, R, v); F.a(c, .5); F.vong(c, 0, 0, 34, 34 * MA.det, '#ffd0a0', 1); F.a(c, 1); }); P.b('duoi', 25 * v); P.rot += -5 * v; }
      else if (u < .82) { const v = seg(u, .3, .82), sp = EASE.io(v) * 3, cc = Math.cos(sp * TAU); P.sx *= Math.sign(cc || 1) * Math.max(.25, Math.abs(cc)); nhapNho(P, 4 * Math.sin(v * PI)); P.w('duoi', 10, -u * 6, .15);
        P.under(c => { for (let arm = 0; arm < 4; arm++) for (let k = 0; k < 40; k++) { const r = 12 + k / 40 * (R - 12), a = arm / 4 * TAU - sp * TAU * .6 - r * .045; F.a(c, Math.min(1, v * 4) * (1 - k / 60)); F.px(c, Math.cos(a) * r, Math.sin(a) * r * MA.det, k % 7 === 0 ? '#ffffff' : C[(k >> 3) % 2], 2, 2); } F.a(c, 1); F.vong(c, 0, 0, R, R * MA.det, C[0], 1); }); }
      else { const v = seg(u, .82, 1); P.under(c => { F.song(c, 0, 0, R * 1.2, v, ['#ffffff', C[1]], 3); F.song(c, 0, 0, R * .8, seg(v, .1, 1), [C[1], C[0]], 2); }); P.over(c => F.hat(c, 0, -20, 30, 4, v, { v: R, goc: -PI / 2, xoe: TAU, g: 30, cols: ['#ffffff', C[1], C[0]], to: 2 })); } }, { nhan: 'Chiêu 5: xoáy nước', moc: [.3, .82] }),
    phase2: A(2.2, P => { TRUM.doiPha(P, GIAN); nhapNho(P, 0); P.r('ham', -20 * Math.sin(seg(P.u, .5, 1) * PI)).b('rau', 30 * seg(P.u, .5, .7)); }, { nhan: 'Chuyển pha 2: giận dữ', pha: u => u < .5 ? 1 : 2 }),
    phase3: A(2.4, P => { TRUM.doiPha(P, BANG); P.r('ham', -22 * Math.sin(seg(P.u, .5, 1) * PI)); if (P.u > .5) P.under(c => { const e = seg(P.u, .5, 1); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 40 + 60 * e * hh(i, 1, 9); cotBang(c, Math.cos(a) * r, Math.sin(a) * r * MA.det * .6, 6 * Math.min(1, e * 3) * (.6 + hh(i, 2, 9))); } }); }, { nhan: 'Chuyển pha 3: hoá băng', pha: u => u < .5 ? 2 : 3 }),
    stun: A(1.4, P => { TRUM.choang(P, 60, 26); P.r('ham', -10).b('rau', -15 + 8 * sn(P.u)); P.m('song', 0, 0); }, { lap: true }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('ham', -12 * k).b('rau', 25 * k).b('duoi', 20 * k); }),
    die: A(3.2, P => { const u = P.u; TRUM.chetLon(P, P.phase === 3 ? 'vo' : 'chim', mauPha(P), P.phase === 3 ? BANG : NUOC); P.r('ham', -28 * seg(u, 0, .2)).b('rau', 30 * seg(u, 0, .4)).b('duoi', -25 * sn(u * 3)); if (u > .55) P.under(c => { for (let i = 0; i < 6; i++) tungNuoc(c, (i - 2.5) * 22, 0, seg(u, .55 + i * .04, .95), i, 26, NUOC); }); }, { nhan: 'Chết' }),
  } });

})(); } catch (e) { MA.loi.push('ngutinh.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art ngutinh.js', e); }
// ----- moctinh.js -----
try { (function () {
// TRÙM VÙNG Rừng già: MỘC TINH. Ba pha (1 đứng lặng, 2 nổi giận: cành giơ cao, 3 hoá độc: tán tím). Cây cổ thụ có mặt người; cành và rễ là vuốt.
const LAX = [LUCR[1], LUCR[2], LUCR[3]], GO = [NAUG[1], NAUG[2], NAUG[3]], GIAN = ['#5a0e0c', '#ff5a3c', '#ffd0a0'], TIM = [TIMD[1], TIMD[2], TIMD[3]], DOC = [DOCX[0], DOCX[1], DOCX[3]];
const mauLa = P => P.phase === 3 ? TIM : LAX;
const khiDoc = (c, x, y, r, e, s) => { F.a(c, (1 - e) * .5); F.khoi(c, x, y, r, e * .7, [DOCX[2], DOCX[1], TIMD[3]], s, 7); F.a(c, 1); };
// lá rơi lả tả
const laRoi = (c, x, y, n, s, e, C, R) => { for (let i = 0; i < n; i++) { const r1 = hh(i, s, 1), r2 = hh(i, s, 2); if (e > .6 + r2 * .4) continue; const px = x + (r1 - .5) * (R || 90) + Math.sin(e * 9 + i) * 5, py = y + e * 60 * (.5 + r2) - 30 * r2; c.fillStyle = C[i % 3]; c.fillRect(Math.round(px), Math.round(py), 2, 1); c.fillRect(Math.round(px) + ((e * 9 + i) | 0) % 2, Math.round(py) + 1, 1, 1); } };
// gai rễ nhọn trồi lên từ đất
function gaiRe(c, x, y, h, nghieng) { if (h < 1) return; const C = [NAUG[0], NAUG[1], NAUG[2], NAUG[3]]; for (let j = 0; j < h; j++) { const f = j / h, w = Math.max(1, Math.round(5 * (1 - f))), ox = (nghieng || 0) * f * h * .3; c.fillStyle = C[0]; c.fillRect(Math.round(x + ox - w / 2 - 1), Math.round(y - j), w + 2, 1); c.fillStyle = f < .7 ? C[1] : C[2]; c.fillRect(Math.round(x + ox - w / 2), Math.round(y - j), w, 1); if (w > 2) { c.fillStyle = C[2]; c.fillRect(Math.round(x + ox - w / 2), Math.round(y - j), 1, 1); } } F.px(c, x + (nghieng || 0) * h * .3, y - h, C[3]); F.px(c, x - 3, y, C[0], 7, 1); }
// lá bùa giấy vàng chữ đỏ, nghiêng góc a
function bua(c, x, y, a, s) { s = s || 1; const ca = Math.cos(a), sa = Math.sin(a); for (let j = -4; j <= 4; j++) for (let i = -2; i <= 2; i++) { const col = (Math.abs(i) === 2 || Math.abs(j) === 4) ? '#8a5a10' : ((i === 0 && j % 2 === 0) || (j === 1 && Math.abs(i) === 1)) ? '#c0261a' : '#ffd23c'; c.fillStyle = col; c.fillRect(Math.round(x + (i * ca - j * sa) * s), Math.round(y + (i * sa + j * ca) * s), 1, 1); } }
function hangNo(P, n, buoc, rong, ve) { const u = P.u, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det;
  P.under(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, x = ex * buoc * (i + 1), y = ey * buoc * (i + 1); if (u < t0) F.baoTron(c, x, y, rong, clamp(u / t0, 0, 1)); } });
  P.over(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, e = seg(u, t0, t0 + .35); if (e > 0 && e < 1) ve(c, ex * buoc * (i + 1), ey * buoc * (i + 1), e, i); } }); }
const MT_P = ph => { const L = [{ n: 'tan', m: [[8, 0, 156, 54]], pv: [82, 58], keep: 0 }];
  if (ph === 1) L.push({ n: 'canhT', m: [{ p: [[10, 54], [58, 56], [58, 76], [34, 100], [8, 100]] }], pv: [56, 66] }, { n: 'canhP', m: [{ p: [[154, 54], [106, 56], [106, 76], [130, 100], [156, 100]] }], pv: [108, 66] },
    { n: 'reT', m: [[10, 110, 52, 134]], pv: [52, 120], z: -1 }, { n: 'reP', m: [[112, 110, 156, 134]], pv: [112, 120], z: -1 });
  else L.push({ n: 'canhT', m: [{ p: [[6, 10], [32, 10], [36, 48], [60, 60], [60, 80], [40, 80], [6, 46]] }], pv: [58, 70] }, { n: 'canhP', m: [{ p: [[158, 10], [132, 10], [128, 48], [104, 60], [104, 80], [124, 80], [158, 46]] }], pv: [106, 70] },
    { n: 'reT', m: [[8, 92, 52, 134]], pv: [52, 118], z: -1 }, { n: 'reP', m: [[112, 92, 158, 134]], pv: [112, 118], z: -1 });
  L.push({ n: 'ham', m: [[58, 104, 108, 120]], pv: [82, 104] }); return L; };
def('mocTinh', { ten: 'Mộc Tinh', vung: 'rung', loai: 'trum', tt: 1, pha: 3, luoi: p => QT.mocTinh(p), parts: MT_P,
  anims: {
    // Ra mắt: đất rung nứt, rễ ngoi lên, cây trồi lên khỏi đất, mắt bừng sáng, tán rung, lá bay.
    intro: A(3, P => { const u = P.u, C = mauLa(P), q = seg(u, .25, .7), e = EASE.out(q);
      P.tan = q < 1 ? { k: 'chim', u: clamp(1 - e, 0, 1) } : null; if (u < .75) P.x += (((u * 36) | 0) % 2 ? 1 : -1) * (u < .25 ? u * 4 : 1);
      const g = kf(u, [[.7, 0], [.78, 1, 'out'], [.92, 1], [1, 0]]); P.r('canhT', -18 * g).r('canhP', 18 * g).r('ham', 0).m('ham', 0, 4 * g); P.s('tan', 1 + .05 * g); P.flash = u > .7 && u < .76 ? .6 : 0; P.bong = seg(u, .25, .7);
      P.under(c => { const cr = Math.min(1, u * 3); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; F.set(c, 0, 0, Math.cos(a) * 80 * cr, Math.sin(a) * 30 * cr, i + 1, NAUG[0], 1, 6); } if (u > .1 && u < .4) for (let i = 0; i < 5; i++) gaiRe(c, (i - 2) * 30, 0, 14 * Math.sin(seg(u, .1 + i * .03, .4) * PI), i - 2); });
      P.over(c => { if (u > .25 && u < .75) F.hat(c, 0, 0, 30, 2, seg(u, .25, .75), { v: 70, goc: -PI / 2, xoe: 2.4, g: 60, cols: [NAUG[2], NAUG[1], NAUG[3]], to: 2 }); if (u > .7) laRoi(c, 0, -110, 40, 3, seg(u, .7, 1), C, 150); }); }, { nhan: 'Ra mắt' }),
    idle: A(2.4, P => { const u = P.u; P.tho(.012); P.s('tan', 1 + .025 * sn(u), 1 + .02 * sn(u + .25)); P.m('tan', 1.5 * sn(u), 0); P.r('canhT', -4 * sn(u)).r('canhP', 4 * sn(u + .1)); P.r('reT', 2 * sn(u)).r('reP', -2 * sn(u)); P.r('ham', 0).m('ham', 0, 1 + sn(u * 2)); if (P.phase === 3) P.under(c => khiDoc(c, 0, -6, 45, (u * 2) % 1, (u * 2) | 0)); }),
    // Di chuyển: rễ bò như chân, cả cây lắc lư.
    move: A(1.4, P => { const u = P.u; P.rot += 2.5 * sn(u); P.h += Math.abs(sn(u)) * 2; P.m('tan', 3 * sn(u), 0); P.r('reT', 18 * sn(u)).r('reP', 18 * sn(u + .5)).m('reT', 0, -3 * Math.max(0, sn(u))).m('reP', 0, -3 * Math.max(0, sn(u + .5))); P.r('canhT', -8 * sn(u)).r('canhP', -8 * sn(u)); P.under(c => F.khoi(c, -50 * sn(u), 0, 8, (u * 2) % 1, [NAUG[2], NAUG[1]], (u * 2) | 0, 4)); }),
    // Chiêu 1: QUẬT CÀNH. Kéo cành ra sau (vùng quạt lớn), quật mạnh thành vệt lá chém, lá rơi lả tả.
    c1: A(2, P => { const u = P.u, C = mauLa(P), tam = 110, span = 2.2, ben = Math.cos(P.dir) < 0 ? 'canhT' : 'canhP', s = ben === 'canhT' ? 1 : -1;
      if (u < .42) { const v = EASE.out(u / .42); P.r(ben, -30 * s * v).m(ben, 0, -5 * v); P.rot += 4 * s * v; P.x += v > .6 ? (((u * 40) | 0) % 2 ? .7 : -.7) : 0; P.under(c => F.baoQuat(c, 0, 0, tam, P.dir, span, u / .42)); }
      else if (u < .65) { const v = seg(u, .42, .65); P.r(ben, lerp(-30, 55, EASE.in(Math.min(1, v * 1.6))) * s).m(ben, 0, -5 * (1 - v)); P.rot += lerp(4, -5, v) * s; P.over(c => { F.liem(c, 0, -50, tam - 6, P.dir, span, v, [C[0], C[1], C[2]], 9); F.liem(c, 0, -46, tam - 20, P.dir, span * .9, Math.max(0, v - .1), [GO[0], GO[1], GO[2]], 4); }); }
      else { const v = seg(u, .65, 1); P.r(ben, 55 * s * (1 - EASE.io(v))); P.rot += -5 * s * (1 - v); P.over(c => laRoi(c, Math.cos(P.dir) * tam * .55, Math.sin(P.dir) * tam * .55 - 30, 26, 5, v, C, 90)); } }, { nhan: 'Chiêu 1: quật cành', moc: [.42, .65] }),
    // Chiêu 2: RỄ ĐÂM. Cắm rễ xuống đất, một hàng gai rễ trồi lên nối nhau theo hướng bé, rồi rút xuống để lại bụi đất.
    c2: A(2.2, P => { const u = P.u, k = kf(u, [[0, 0], [.2, 1, 'back'], [.85, 1], [1, 0]]); P.r('reT', -14 * k).r('reP', 14 * k).m('reT', 0, 4 * k).m('reP', 0, 4 * k); P.sy *= 1 - .03 * k; P.r('canhT', 10 * k).r('canhP', -10 * k); if (u < .3) P.x += ((u * 40) | 0) % 2 ? .7 : -.7;
      hangNo(P, 6, 20, 11, (c, x, y, e, i) => { const h = 26 * Math.min(1, e * 5) * (1 - seg(e, .65, 1)); for (let j = -1; j <= 1; j++) gaiRe(c, x + j * 6, y + Math.abs(j) * 2, h * (j ? .65 : 1), j * 1.5); F.khoi(c, x, y, 10, e, [NAUG[2], NAUG[1]], i, 5); if (e < .3) F.hat(c, x, y - 2, 10, i, e / .3, { v: 12, goc: -PI / 2, xoe: 1.6, g: 10, cols: [NAUG[3], NAUG[2]] }); }); }, { nhan: 'Chiêu 2: rễ đâm', moc: [.25, .85] }),
    // Chiêu 3: MƯA QUẢ ĐỘC. Lắc tán, quả độc tím rơi vòng cung xuống sáu chỗ, vỡ thành vũng khí độc.
    c3: A(2.3, P => { const u = P.u; P.m('tan', 4 * sn(u * 6) * (u < .7 ? 1 : 0), 0).s('tan', 1 + .04 * Math.abs(sn(u * 6))); P.mom = null;
      CHIEU.muaNem(P, 6, 100, 13, [TIMD[1], DOCX[2], '#f4ffb0'], (c, x, y, q) => { F.cau(c, x, y, 3.2, [TIMD[1], TIMD[2], TIMD[3]]); F.px(c, x, y - 4, LUCR[2], 2, 1); F.px(c, x + 1, y - 5, LUCR[3]); }, (c, x, y, e, i) => { F.a(c, (1 - e) * .7); F.elip(c, x, y, 12 * Math.min(1, e * 3), 5 * Math.min(1, e * 3), DOCX[1]); F.a(c, 1); khiDoc(c, x, y - 3, 14, e, i); }); }, { nhan: 'Chiêu 3: mưa quả độc', moc: [.4, .85] }),
    // Chiêu 4: BÙA BAY. Bùa cũ trên cành bung ra, năm lá bùa bay uốn lượn theo hình quạt, cháy nổ tia tím vàng.
    c4: A(2.2, P => { const u = P.u, n = 5, L = 120, k = kf(u, [[0, 0], [.35, 1, 'out'], [.9, 1], [1, 0]]); P.r('canhT', -12 * k).r('canhP', 12 * k); P.s('tan', 1 + .03 * k);
      P.under(c => { for (let i = 0; i < n; i++) { const a = P.dir + (i - 2) * .32; if (u < .4) F.baoDuong(c, 0, 0, L, 9, a, u / .4); } });
      P.over(c => { const m = P.pt(82, 70); for (let i = 0; i < n; i++) { const a = P.dir + (i - 2) * .32, q = seg(u, .35 + i * .03, .8 + i * .03), e = seg(u, .8 + i * .03, 1); if (u < .4) { const v = u / .4; bua(c, m[0] + (i - 2) * 14 * v, m[1] - 20 * v, Math.sin(u * 20 + i) * .3); }
        else if (q < 1) { const r = 12 + (L - 12) * q, w = Math.sin(q * 10 + i) * 8 * (1 - q), x = m[0] + Math.cos(a) * r - Math.sin(a) * w, y = m[1] + Math.sin(a) * r + Math.cos(a) * w + q * (P.y - m[1]); for (let t = 1; t < 4; t++) { F.a(c, .4 - t * .1); F.px(c, x - Math.cos(a) * t * 4, y - Math.sin(a) * t * 4, TIMD[3], 2, 2); } F.a(c, 1); bua(c, x, y, a + PI / 2 + Math.sin(q * 14) * .4); }
        else if (e < 1) { const x = m[0] + Math.cos(a) * L, y = m[1] + Math.sin(a) * L + (P.y - m[1]); if (e < .25) F.dia(c, x, y, 3 + e * 20, '#fff6b0'); F.hat(c, x, y, 14, i, e, { v: 14, cols: ['#fff6b0', '#ffd23c', TIMD[3], TIMD[2]], to: 2 }); F.a(c, 1 - e); laRoi(c, x, y - 10, 6, i, e, ['#3a2a1a', '#8a5a10', '#48424e'], 14); F.a(c, 1); } } }); }, { nhan: 'Chiêu 4: bùa bay', moc: [.4, .8] }),
    // Chiêu 5: RỪNG GAI. Ba vòng gai rễ trồi lên lan ra từ gốc, chừa bốn khe trống để né (không cần nhảy).
    c5: A(2.6, P => { const u = P.u, khe = [0, 1, 2, 3].map(i => P.dir + PI / 4 + i * PI / 2), rr = [40, 70, 100]; const trong = a => khe.some(k => Math.abs(Math.atan2(Math.sin(a - k), Math.cos(a - k))) < .3);
      const k = kf(u, [[0, 0], [.3, 1, 'back'], [.85, 1], [1, 0]]); P.r('reT', -18 * k).r('reP', 18 * k).r('canhT', -15 * k).r('canhP', 15 * k); P.sy *= 1 + .03 * k; if (u < .35) P.x += ((u * 40) | 0) % 2 ? .7 : -.7;
      P.under(c => { if (u < .35) for (let i = 0; i < 4; i++) F.baoQuat(c, 0, 0, 108, khe[i] + PI / 4, PI / 2 - .6, u / .35); for (let j = 0; j < 3; j++) { const e = seg(u, .35 + j * .12, .75 + j * .08), n = Math.round(rr[j] / 4.5); if (e <= 0 || e >= 1) continue;
        for (let i = 0; i < n; i++) { const a = i / n * TAU; if (trong(a)) continue; gaiRe(c, Math.cos(a) * rr[j], Math.sin(a) * rr[j] * MA.det, 20 * Math.min(1, e * 4) * (1 - seg(e, .7, 1)) * (.7 + .3 * hh(i, j, 3)), Math.cos(a)); } F.song(c, 0, 0, rr[j] + 8, e, [NAUG[3], NAUG[2]], 1); } }); }, { nhan: 'Chiêu 5: rừng gai', moc: [.35, .9] }),
    phase2: A(2.4, P => { const u = P.u; TRUM.doiPha(P, GIAN); if (u > .5) P.over(c => laRoi(c, 0, -110, 40, 7, seg(u, .5, 1), LAX, 150)); }, { nhan: 'Chuyển pha 2: nổi giận', pha: u => u < .5 ? 1 : 2 }),
    phase3: A(2.6, P => { const u = P.u; TRUM.doiPha(P, TIM); if (u > .5) P.under(c => khiDoc(c, 0, -10, 60, seg(u, .5, 1), 9)); }, { nhan: 'Chuyển pha 3: hoá độc', pha: u => u < .5 ? 2 : 3 }),
    stun: A(1.6, P => { TRUM.choang(P, 82, 62); P.r('canhT', 20 + 5 * sn(P.u)).r('canhP', -20 - 5 * sn(P.u)).m('ham', 0, 3); }, { lap: true }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('canhT', 12 * k).r('canhP', -12 * k).m('tan', 3 * k, 0); P.over(c => laRoi(c, 0, -100, 10, 1, P.u, mauLa(P), 120)); }),
    die: A(3.4, P => { const u = P.u, C = mauLa(P); TRUM.chetLon(P, 'heo', [NAUG[1], C[1], '#fff6b0'], [NAUG[0], NAUG[1], '#5a4a3a', '#8a7a5a']); P.r('canhT', 35 * seg(u, 0, .5)).r('canhP', -35 * seg(u, 0, .5)).m('ham', 0, 5 * seg(u, 0, .3)); P.over(c => laRoi(c, 0, -110, 50, 9, u, C, 160)); }, { nhan: 'Chết' }),
  } });

})(); } catch (e) { MA.loi.push('moctinh.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art moctinh.js', e); }
// ----- hotinh.js -----
try { (function () {
// TRÙM VÙNG Lâu đài cổ: HỒ TINH, dáng "RÌNH MỒI" (phương án 2 trong quai-ban-chot/ho-tinh-ve-lai.png): thân hạ thấp, đầu chúi, chín đuôi toả rộng, đầu đuôi có lửa ma xanh.
// Pha 1 kiêu kỳ; pha 2 phân thân (mắt tím, bóng cáo mờ lượn hai bên); pha 3 hoá cuồng (to gấp rưỡi, lửa trùm thân).
const MA_X = ['#1a3a9a', '#3a7aff', '#bfe8ff'], TIMX = ['#3a1060', '#9a48d4', '#e4a8ff'], LUA = [LUAV[0], LUAV[2], LUAV[3]];
const mauHT = P => P.phase === 2 ? TIMX : MA_X;
const TB = [124, 84], GOC = [-141, -123, -107, -88, -66, -46, -23, 4, 27], DAI = [70, 70, 72, 74, 76, 76, 70, 62, 58];
const kHT = ph => ph === 3 ? 1.5 : 1;
// đầu đuôi thứ i (toạ độ trên hình gốc, đã tính cỡ pha)
const dinhDuoi = (i, ph) => { const k = kHT(ph), a = GOC[i] * PI / 180; return [(TB[0] + Math.cos(a) * DAI[i]) * k, (TB[1] + Math.sin(a) * DAI[i]) * k]; };
const HT_PARTS = ph => { const k = kHT(ph), S = q => q.map(p => [p[0] * k, p[1] * k]), L = [
  { n: 'chanT', m: [{ p: S([[36, 102], [84, 100], [84, 120], [36, 120]]) }], pv: [76 * k, 101 * k], z: -1 }, { n: 'chanS', m: [{ p: S([[94, 98], [146, 98], [146, 120], [94, 120]]) }], pv: [108 * k, 98 * k], z: -1 },
  { n: 'dau', m: [{ p: S([[20, 66], [80, 70], [88, 96], [76, 106], [40, 106], [20, 104]]) }], pv: [82 * k, 92 * k] }];
  for (let i = 0; i < 9; i++) { const a0 = (i ? (GOC[i - 1] + GOC[i]) / 2 : GOC[0] - 16) * PI / 180, a1 = (i < 8 ? (GOC[i] + GOC[i + 1]) / 2 : 36) * PI / 180, pts = [];
    for (let j = 0; j <= 6; j++) { const a = a0 + (a1 - a0) * j / 6; pts.push([TB[0] + Math.cos(a) * 18, TB[1] + Math.sin(a) * 18]); }
    for (let j = 6; j >= 0; j--) { const a = a0 + (a1 - a0) * j / 6; pts.push([TB[0] + Math.cos(a) * 125, TB[1] + Math.sin(a) * 125]); }
    const g = GOC[i] * PI / 180; L.push({ n: 'd' + i, m: [{ p: S(pts) }], pv: [(TB[0] + Math.cos(g) * 16) * k, (TB[1] + Math.sin(g) * 16) * k], keep: 0, z: 1 + i * .01 }); }
  return L; };
// đuôi phe phẩy: biên độ a, nhịp sp
function vayDuoi(P, a, sp, b) { for (let i = 0; i < 9; i++) P.w('d' + i, a, -P.u * sp + i * .11, .06).r('d' + i, (b || 0) * sn(P.u * sp * .5 + i * .1)); }
// cầu lửa ma
const cauMa = (c, x, y, r, C) => { F.dia(c, x, y, r + 1, C[0]); F.dia(c, x, y - .5, r, C[1]); F.dia(c, x - r * .2, y - r * .3, r * .55, C[2]); F.px(c, x - r * .3, y - r * .5, '#ffffff'); };
const cotLuaMa = (c, x, y, e, C, t, s) => { const h = 34 * Math.sin(Math.min(1, e * 1.4) * PI * .5) * (1 - seg(e, .7, 1)); if (h < 1) return; F.lua(c, x, y, 9, h, t, [C[0], C[1], C[2], '#ffffff'], s); F.a(c, .5); F.elip(c, x, y, 9, 3, C[1]); F.a(c, 1); };
def('hoTinh', { ten: 'Hồ Tinh', vung: 'laudai', loai: 'trum', tt: 1, pha: 3, luoi: p => HT_than(2, p), parts: HT_PARTS,
  anims: {
    // Ra mắt: đốm lửa ma bay tụ lại thành hình cáo, chín đuôi xoè ra như quạt, ngóc đầu gào, lửa đầu đuôi bùng lên.
    intro: A(3, P => { const u = P.u, C = mauHT(P), q = seg(u, .1, .55), xoe = EASE.back(seg(u, .5, .75));
      if (q < 1) P.tan = { k: 'tu', u: q, mau: [C[0], C[1], C[2]] }; for (let i = 0; i < 9; i++) P.r('d' + i, (GOC[4] - GOC[i]) * (1 - xoe)).s('d' + i, .5 + .5 * Math.min(1, xoe));
      const g = kf(u, [[.72, 0], [.8, 1, 'out'], [.92, 1], [1, 0]]); P.r('dau', 14 * g); P.sy *= 1 + .04 * g; P.bong = q; if (u > .75 && u < .92) P.x += ((u * 40) | 0) % 2 ? .8 : -.8;
      P.under(c => { if (u > .72) { F.song(c, 0, 0, 120, seg(u, .74, 1), [C[2], C[1]], 3); F.song(c, 0, 0, 85, seg(u, .8, 1), [C[1], C[0]], 2); } });
      P.over(c => { if (u < .55) for (let i = 0; i < 16; i++) { const a = hh(i, 2, 1) * TAU, r = 140 * (1 - seg(u, hh(i, 3, 1) * .2, .55)), x = Math.cos(a + u * 3) * r, y = -50 + Math.sin(a + u * 3) * r * .6; if (r > 2) F.lua(c, x, y + 4, 4, 8, P.t + i, [C[0], C[1], C[2], '#ffffff'], i); }
        if (u > .74) for (let i = 0; i < 9; i++) { const d = dinhDuoi(i, P.phase), m = P.pt(d[0], d[1]), e = seg(u, .74, 1); F.hat(c, m[0], m[1], 6, i, e, { v: 14, goc: -PI / 2, xoe: 2, cols: [C[2], C[1]] }); } }); }, { nhan: 'Ra mắt' }),
    idle: A(2.4, P => { const u = P.u; P.tho(.02); vayDuoi(P, 7, 1, 4); P.r('dau', 2 * sn(u)).m('dau', -1 * sn(u * 2), 0); }),
    // Di chuyển: bước rón rén sát đất, đuôi lượn sóng.
    move: A(1.1, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.5; P.rot += 1.5 * sn(u); P.r('chanT', 22 * sn(u)).r('chanS', -22 * sn(u)); vayDuoi(P, 10, 2, 6); P.r('dau', 3 * sn(u * 2)); }),
    // Chiêu 1: HỒ HOẢ. Lửa đầu chín đuôi bùng to, bắn chín cầu lửa ma bay vòng cung xuống chín chỗ quanh bé.
    c1: A(2.4, P => { const u = P.u, C = mauHT(P), T = []; for (let i = 0; i < 9; i++) { const a = P.dir + (i - 4) * .22, r = 70 + 45 * hh(i, 4, 4); T.push([Math.cos(a) * r, Math.sin(a) * r * MA.det, .36 + i * .04]); }
      vayDuoi(P, u < .35 ? 4 : 10, u < .35 ? 4 : 2, 3); P.r('dau', u < .35 ? -6 * u / .35 : -6);
      P.under(c => { for (const [x, y, t0] of T) if (u < t0 + .18) F.baoTron(c, x, y, 10, clamp(u / (t0 + .18), 0, 1)); });
      P.over(c => { for (let i = 0; i < 9; i++) { const d = dinhDuoi(i, P.phase), m = P.pt(d[0], d[1]), [x, y, t0] = T[i], q = seg(u, t0 - .1, t0 + .18), e = seg(u, t0 + .18, t0 + .5);
        if (u < t0 - .1) F.lua(c, m[0], m[1] + 3, 4 + 4 * Math.min(1, u / .3), 9 + 10 * Math.min(1, u / .3), P.t + i, [C[0], C[1], C[2], '#ffffff'], i);
        else if (q < 1) { const px = lerp(m[0], x, q), py = lerp(m[1], y, q) - Math.sin(q * PI) * 30; for (let t = 1; t < 5; t++) { const qq = Math.max(0, q - t * .04); F.a(c, .5 - t * .1); F.dia(c, lerp(m[0], x, qq), lerp(m[1], y, qq) - Math.sin(qq * PI) * 30, 3 - t * .5, C[1]); } F.a(c, 1); cauMa(c, px, py, 3, C); }
        if (e > 0 && e < 1) { if (e < .3) F.dia(c, x, y - 3, 4 + e * 20, C[2]); F.lua(c, x, y, 7 * (1 - e), 16 * (1 - e), P.t + i, [C[0], C[1], C[2], '#ffffff'], i); F.hat(c, x, y - 3, 12, i, e, { v: 14, cols: ['#ffffff', C[2], C[1]], to: 2 }); } } }); }, { nhan: 'Chiêu 1: hồ hoả', moc: [.36, .8] }),
    // Chiêu 2: VỒ MỒI. Rạp mình rồi vồ hai lần liền (zíc zắc), để bóng mờ, cuối cú vồ có vết vuốt.
    c2: A(2, P => { const u = P.u, C = mauHT(P), q = (u * 2) % 1; CHIEU.laoNhieu(P, 2, 96, 26, [C[0], C[1], '#ffffff'], .5); vayDuoi(P, 8, 3, 0); P.r('chanT', q > .45 ? -30 : 10 * q / .45).r('chanS', q > .45 ? 25 : 0).r('dau', q > .45 ? -10 : 4);
      if (q > .55 && q < .85) { const k = Math.min(1, u * 2) | 0, dir = P.dir + (k - .5) * .5, x = Math.cos(dir) * 92, y = Math.sin(dir) * 92 * MA.det; P.over(c => { for (let j = 0; j < 3; j++) F.liem(c, x + j * 3 - 3, y - 14 + j * 3, 16, dir + PI / 2, 1.6, seg(q, .55, .85), [C[0], C[1], '#ffffff'], 2); }); } }, { nhan: 'Chiêu 2: vồ mồi', moc: [.22, .9] }),
    // Chiêu 3: QUẠT ĐUÔI. Chín đuôi kéo về một bên rồi quét mạnh, ba lớp vệt lửa ma hình trăng khuyết, sàn cháy lửa xanh.
    c3: A(2.2, P => { const u = P.u, C = mauHT(P), tam = 120, span = 2.6;
      if (u < .42) { const v = EASE.out(u / .42); for (let i = 0; i < 9; i++) P.r('d' + i, -25 * v).b('d' + i, -15 * v); P.rot += -4 * v; P.under(c => F.baoQuat(c, 0, 0, tam, P.dir, span, u / .42)); }
      else if (u < .68) { const v = seg(u, .42, .68), a = lerp(-25, 40, EASE.in(Math.min(1, v * 1.5))); for (let i = 0; i < 9; i++) P.r('d' + i, a).b('d' + i, 20 * (1 - v)); P.rot += lerp(-4, 4, v);
        P.over(c => { F.liem(c, 0, -30, tam - 4, P.dir, span, v, [C[0], C[1], '#ffffff'], 10); F.liem(c, 0, -30, tam - 22, P.dir, span * .9, Math.max(0, v - .08), [LUA[0], LUA[1], LUA[2]], 6); F.liem(c, 0, -30, tam - 40, P.dir, span * .8, Math.max(0, v - .16), [C[0], C[1], C[2]], 4); }); }
      else { const v = seg(u, .68, 1); for (let i = 0; i < 9; i++) P.r('d' + i, 40 * (1 - EASE.io(v))); P.under(c => { for (let i = 0; i < 7; i++) { const a = P.dir + (i - 3) / 3 * span * .42, r = tam * (.55 + .3 * hh(i, 1, 2)); F.a(c, 1 - seg(v, .5, 1)); F.lua(c, Math.cos(a) * r, Math.sin(a) * r * MA.det, 6, 12, P.t + i, [C[0], C[1], C[2], '#ffffff'], i); } F.a(c, 1); }); } }, { nhan: 'Chiêu 3: quạt đuôi', moc: [.42, .68] }),
    // Chiêu 4: VÒNG LỬA MA. Hai vòng cột lửa ma bùng lên lần lượt quanh mình (vòng trong rồi vòng ngoài, lệch chỗ nhau để có lối né).
    c4: A(2.5, P => { const u = P.u, C = mauHT(P), V = [[62, 8, 0, .3], [102, 12, PI / 12, .5]]; vayDuoi(P, 6, 3, 8); P.r('dau', 8 * Math.sin(seg(u, .2, .5) * PI)); P.sy *= 1 + .04 * Math.sin(seg(u, .2, .5) * PI);
      P.under(c => { for (const [R, n, lech, t0] of V) for (let i = 0; i < n; i++) { const a = P.dir + lech + i / n * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R * MA.det, ti = t0 + i * .015; if (u < ti) F.baoTron(c, x, y, 11, u / ti); } });
      P.over(c => { for (const [R, n, lech, t0] of V) for (let i = 0; i < n; i++) { const a = P.dir + lech + i / n * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R * MA.det, ti = t0 + i * .015, e = seg(u, ti, ti + .42); if (e > 0 && e < 1) { cotLuaMa(c, x, y, e, C, P.t, i); if (e < .25) F.song(c, x, y, 14, e * 4, [C[2], C[1]], 1); } } }); }, { nhan: 'Chiêu 4: vòng lửa ma', moc: [.3, .92] }),
    // Chiêu 5: BÃO HỒ HOẢ. Xoay đuôi tụ lửa, bắn ba đợt cầu lửa toả tròn xoáy (mỗi đợt lệch nhau để luồn qua khe).
    c5: A(2.4, P => { const u = P.u, C = mauHT(P); CHIEU.vongDan(P, 10, 110, [C[0], C[1], C[2]], 3); for (let i = 0; i < 9; i++) P.r('d' + i, u > .35 ? 12 * sn(u * 4 + i * .1) : 0); vayDuoi(P, 8, 4, 0); }, { nhan: 'Chiêu 5: bão hồ hoả', moc: [.35, .95] }),
    phase2: A(2.4, P => { const u = P.u; TRUM.doiPha(P, TIMX); vayDuoi(P, 12 * seg(u, 0, .45), 4, 0); }, { nhan: 'Chuyển pha 2: phân thân', pha: u => u < .5 ? 1 : 2 }),
    phase3: A(2.6, P => { const u = P.u; TRUM.doiPha(P, LUA); vayDuoi(P, 12, 4, 0); if (u > .5) P.under(c => { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 60 + 50 * seg(u, .5, 1); F.a(c, 1 - seg(u, .8, 1)); F.lua(c, Math.cos(a) * r, Math.sin(a) * r * MA.det, 8, 18, P.t + i, null, i); } F.a(c, 1); }); }, { nhan: 'Chuyển pha 3: hoá cuồng', pha: u => u < .5 ? 2 : 3 }),
    stun: A(1.5, P => { const k = kHT(P.phase); TRUM.choang(P, 44 * k, 74 * k); P.r('dau', 10 + 4 * sn(P.u)); for (let i = 0; i < 9; i++) P.r('d' + i, 6 * sn(P.u + i * .05)).b('d' + i, 25); }, { lap: true }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 12 * k); for (let i = 0; i < 9; i++) P.b('d' + i, 25 * k); }),
    die: A(3.4, P => { const u = P.u, C = mauHT(P); TRUM.chetLon(P, 'hon', [C[0], C[1], C[2]], [C[1], C[2], '#ffffff']); for (let i = 0; i < 9; i++) P.r('d' + i, (GOC[4] - GOC[i]) * .5 * seg(u, 0, .5)).b('d' + i, 30 * seg(u, 0, .5)); P.r('dau', 20 * seg(u, 0, .4)); }, { nhan: 'Chết' }),
  } });
// Lớp phủ theo pha cho mọi cử động: pha 2 có hai bóng cáo mờ màu tím lượn hai bên; pha 3 có lửa liếm khắp thân.
(function () { const d = DEFS.hoTinh; for (const k of Object.keys(d.anims)) { const f = d.anims[k].f; d.anims[k].f = function (P) { f(P);
  if (P.phase === 2 && !P.bongMa && k !== 'die' && !P.tan) { const t = P.t; P.bongMa = [{ x: -46 + 6 * Math.sin(t * 2.2), y: -4 + 3 * Math.sin(t * 3), a: .26 + .08 * Math.sin(t * 4), mau: TIMX[1] }, { x: 46 + 6 * Math.sin(t * 2.6 + 1), y: 4 + 3 * Math.sin(t * 2.4), a: .26 + .08 * Math.sin(t * 4 + 2), mau: TIMX[1] }]; }
  if (P.phase === 3 && !P.tan) { const t = P.t, B = P.B; P.over(c => { for (let i = 0; i < 7; i++) { const sx = B.cx + (hh(i, 1, 7) - .3) * B.bw * .6, sy = B.foot - B.bh * (.25 + .3 * hh(i, 2, 7)), m = P.pt(sx, sy); F.a(c, .75); F.lua(c, m[0], m[1], 5, 10 + 5 * Math.sin(t * 7 + i), t + i, null, i); } F.a(c, 1); }); } }; } })();

})(); } catch (e) { MA.loi.push('hotinh.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art hotinh.js', e); }
// ----- chitiet.js -----
try { (function () {
// Chi tiết thêm cho các quái trông "chung chung" (góp ý của chủ dự án: "quái cũng cần chi tiết hơn chút").
// Tệp này chạy SAU các tệp cử động của từng vùng, trước MA._xong():
//  - vẽ thêm điểm ảnh lên hình gốc (vảy, đốm, ánh mắt, nanh...), chỉ trong khung hình cũ để không đổi cỡ va chạm;
//  - tách thêm bộ phận cử động riêng (vây, cánh, đuôi, xúc tu, gai) và viết lại các cử động để bộ phận đó chuyển động.
// Mọi cử động mới đều gọi bộ cử động chuẩn (CH) hoặc cử động cũ trước, rồi mới thêm cử động của bộ phận.
const CT = MA.chiTiet = { sua: [] };
// Vẽ một điểm vào hình gốc: sửa cả lớp "thân chưa viền" (pre) lẫn lớp đã viền, để viền tối vẫn tự tính lại mỗi khung.
// trong = true: chỉ vẽ lên chỗ đã có thân (không mọc thêm ra ngoài).
let CT_BB = null;
function ctDiem(g, x, y, c, trong) {
  x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
  if (CT_BB && (x < CT_BB.x0 || x > CT_BB.x1 || y < CT_BB.y0 || y > CT_BB.y1)) return; // giữ khung cũ (cỡ va chạm)
  const i = y * g.w + x, goc0 = g.pre ? g.pre[i] : g.d[i];
  if (trong && !goc0) return;
  if (g.pre) { g.pre[i] = c; if (g.sauVien && g.d[i] === g.sauVien[i]) { g.d[i] = c; g.sauVien[i] = c; } }
  else g.d[i] = c;
}
// Bọc hàm vẽ hình gốc của con id: ve(g, hv, ph) vẽ thêm chi tiết. Khung hình (cỡ va chạm) được giữ nguyên: điểm nào ngoài khung cũ thì bỏ.
function ctHinh(id, ve) {
  const d = DEFS[id]; if (!d) return; const cu = d.luoi;
  d.luoi = function (ph, hv) {
    const g = cu(ph, hv);
    try { CT_BB = bbox(g); ve(g, hv, ph); g.bb = null; } catch (e) { MA.loi.push('chitiet ' + id + ': ' + (e && e.stack || e)); }
    CT_BB = null; return g;
  };
  CT.sua.push(id);
}
// Thêm bộ phận cử động (danh sách hoặc hàm theo biến thể hình).
function ctPhan(id, ds) {
  const d = DEFS[id]; if (!d) return; const cu = d.parts;
  d.parts = function (ph, hv) { const a = (typeof cu === 'function' ? cu(ph, hv) : cu) || []; const b = typeof ds === 'function' ? ds(ph, hv) : ds; return a.concat(b || []); };
}
// Thêm cử động cho bộ phận: chạy cử động cũ (hoặc chuẩn) rồi gọi them(P).
function ctCu(id, ten, them) {
  const d = DEFS[id]; if (!d) return; const a = d.anims[ten];
  const cu = a ? (typeof a === 'function' ? a : a.f) : CH[ten]; if (!cu) return;
  const f = P => { cu(P); them(P); };
  if (a && typeof a !== 'function') a.f = f; else d.anims[ten] = { d: (a && a.d) || DMAC[ten][0], lap: DMAC[ten] ? DMAC[ten][1] : false, f };
}
// Ghi nhiều cử động một lúc: bang = { idle: P => ..., move: ... }
function ctAnim(id, bang) { for (const k of Object.keys(bang)) ctCu(id, k, bang[k]); }
// Đốm 3 tông: một điểm tối, một điểm sáng chéo phía trên trái.
function ctDom(g, x, y, toi, sang) { ctDiem(g, x, y, toi, true); if (sang) ctDiem(g, x - 1, y - 1, sang, true); }
// Đường thẳng chỉ vẽ lên các điểm đang mang một trong các màu chiMau (để vân không đè lên mắt, miệng).
function ctDuong(g, x0, y0, x1, y1, c, chiMau) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n), q = g.pre ? g.pre[y * g.w + x] : g.d[y * g.w + x]; if (!chiMau || chiMau.indexOf(q) >= 0) ctDiem(g, x, y, c, true); } }
// Khối 2x2 (đốm to dễ thấy ở cỡ thật), chỉ trên thân.
function ctO(g, x, y, c, chiMau) { for (const d of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const q = g.pre ? g.pre[(y + d[1]) * g.w + x + d[0]] : null; if (!chiMau || chiMau.indexOf(q) >= 0) ctDiem(g, x + d[0], y + d[1], c, true); } }
// Lớp vẽ đè mỗi khung (ánh mắt nhấp nháy, tia lửa ngòi...): hàm f(c, x, y) tại điểm (sx, sy) trên hình gốc. Không vẽ khi đang chết.
function ctPhu(P, sx, sy, f) { if (P.anim === 'die' || P.a <= 0) return; const q = P.pt(sx, sy); P.over(c => f(c, q[0], q[1])); }
const ctRung = (u, k) => u > k ? (((u * 24) | 0) % 2 ? .6 : -.6) : 0;

// ============ HANG BIỂN ============
// ---- Cá Nóc: đốm trên lưng, ánh mắt, vây ngực và đuôi vẫy riêng, gai lưng dựng lên khi báo đòn ----
ctHinh('caNoc', g => {
  const LUNG = ['#1fb49c', '#98f3da', '#0e746e'];
  for (const p of [[25, 24], [30, 24], [35, 23], [28, 27], [38, 26], [33, 26], [22, 28]]) ctO(g, p[0], p[1], '#063b3c', LUNG); // đốm báo trên lưng
  for (const p of [[27, 23], [32, 23], [37, 25]]) ctDiem(g, p[0], p[1], '#98f3da', true);
  ctDiem(g, 25, 29, '#ffffff', true); ctDiem(g, 37, 29, '#ffffff', true); // ánh mắt
  ctDiem(g, 27, 30, S2[1], true); ctDiem(g, 36, 30, S2[1], true); // con ngươi đỏ
  for (let x = 27; x <= 36; x += 3) ctDiem(g, x, 39, B2[1], true); // vằn bụng
  ctDiem(g, 29, 38, TR, true); ctDiem(g, 35, 38, TR, true); // nanh dưới
});
ctPhan('caNoc', [
  { n: 'vay', m: [[17, 33, 25, 37]], mau: ['#ee5c3a'], pv: [24, 35] },
  { n: 'duoi', m: [[41, 27, 47, 37]], mau: ['#ee5c3a', '#b32a2c'], pv: [41, 32], keep: 0 },
  { n: 'gai', m: [[26, 19, 37, 24]], mau: ['#ffffff', '#a9d8ee'], pv: [32, 25], keep: 0 },
  { n: 'gaiD', m: [[24, 40, 38, 45]], mau: ['#ffffff', '#a9d8ee'], pv: [31, 40], keep: 0 }]);
ctAnim('caNoc', {
  idle: P => { const u = P.u; P.r('vay', 28 * sn(u * 2)).r('duoi', 16 * sn(u * 1.5 + .2)).s('gai', 1, 1 + .12 * sn(u)).s('gaiD', 1, 1 + .1 * sn(u + .5)); },
  move: P => { const u = P.u; P.r('vay', 40 * sn(u * 2)).r('duoi', 24 * sn(u * 2 + .3)); },
  tele: P => { const u = P.u, k = seg(u, 0, .4); P.s('gai', 1, 1 + .45 * k).s('gaiD', 1, 1 + .35 * k).r('vay', 45 * sn(u * 4)).r('duoi', 20 * sn(u * 4)); },
  atk: P => { const u = P.u, k = 1 - seg(u, .3, 1); P.s('gai', 1, 1 + .5 * k).s('gaiD', 1, 1 + .4 * k).r('vay', -30 * k).r('duoi', 25 * sn(u * 3)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('vay', -35 * k).r('duoi', 30 * k).s('gai', 1, 1 - .3 * k); },
  die: P => { const k = seg(P.u, 0, .25); P.r('vay', 50 * k).r('duoi', -40 * k).s('gai', 1, 1 - .4 * k); },
});
// ---- Sứa Bom: vành chuông có vân sáng, đốm phát quang, ngòi bom sáng; hai chùm xúc tu lượn lệch nhịp, quả bom đung đưa ----
ctHinh('sua', g => {
  const CHUONG = ['#50bde6', '#2273b2', '#d4f5ff'];
  for (const l of [[14, 7, 9, 19], [19, 5, 16, 11], [31, 5, 34, 11], [36, 7, 40, 19], [25, 4, 25, 9]]) ctDuong(g, l[0], l[1], l[2], l[3], '#0f437a', CHUONG); // gân chuông
  for (let x = 8; x <= 35; x += 3) ctDiem(g, x, 20, '#8fdcf5', true); // vân vành chuông
  for (let x = 9; x <= 34; x += 3) ctDiem(g, x, 19, '#50bde6', true);
  for (const p of [[28, 8], [31, 10], [13, 17], [33, 16], [21, 6]]) { ctDiem(g, p[0], p[1], '#d4f5ff', true); ctDiem(g, p[0] + 1, p[1], '#8fdcf5', true); } // đốm phát quang
  ctDiem(g, 26, 28, '#ffe14a'); ctDiem(g, 27, 27, '#ffffff'); ctDiem(g, 25, 27, '#ff8a3c'); // ngòi bom cháy
  ctDiem(g, 22, 33, '#ffe14a', true); ctDiem(g, 23, 33, '#ffe14a', true); // dấu nguy trên bom
  ctDiem(g, 24, 15, '#ffffff', true); ctDiem(g, 18, 17, '#fff8e0', true); ctDiem(g, 28, 17, '#fff8e0', true); // nanh
});
ctPhan('sua', [
  { n: 'tuaT', m: [[5, 22, 19, 40]], mau: ['#3fa8d8', '#c8f2ff', '#ff5a46', '#0f437a', '#ff7a5c'], pv: [13, 22], keep: 0 },
  { n: 'tuaP', m: [[30, 22, 41, 40]], mau: ['#3fa8d8', '#c8f2ff', '#ff5a46', '#0f437a', '#ff7a5c'], pv: [33, 22], keep: 0 },
  { n: 'bom', m: [[19, 22, 30, 40]], pv: [25, 22], keep: 0 }]);
const tiaNgoi = (P) => ctPhu(P, 26, 27, (c, x, y) => { const f = ((P.t * 14) | 0) % 3; F.px(c, x - 1 + (f === 1 ? 1 : 0), y - 1 - (f === 2 ? 1 : 0), f ? '#fff6b0' : '#ff8a1e', f ? 1 : 2, f ? 1 : 2); F.px(c, x + (f - 1) * 2, y - 2 - f, '#ffd23c'); });
ctAnim('sua', {
  spawn: P => { if (P.u > .6) tiaNgoi(P); },
  idle: P => { tiaNgoi(P); const u = P.u; P.w('tuaT', 12, -u, .45).w('tuaP', 12, -u + .5, .45).r('bom', 7 * sn(u + .1)); P.sy *= 1 + .05 * sn(u); P.sx *= 1 - .04 * sn(u); },
  move: P => { tiaNgoi(P); const u = P.u; P.b('tuaT', 18 + 8 * sn(u)).b('tuaP', 18 + 8 * sn(u + .2)).w('tuaT', 9, -u * 2, .45).w('tuaP', 9, -u * 2 + .3, .45).r('bom', 12 * sn(u - .2)); },
  tele: P => { tiaNgoi(P); const u = P.u, k = seg(u, 0, .4); P.r('tuaT', 25 * k).r('tuaP', -25 * k).w('tuaT', 14, -u * 4, .45).w('tuaP', 14, -u * 4, .45).r('bom', 14 * sn(u * 5)); },
  atk: P => { const k = 1 - seg(P.u, 0, .6); P.r('tuaT', 40 * k).r('tuaP', -40 * k).s('bom', 1 + .2 * k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.b('tuaT', -30 * k).b('tuaP', 30 * k).r('bom', 25 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('tuaT', 30 * k).r('tuaP', -30 * k).b('tuaT', 30 * k).b('tuaP', -30 * k); },
});
// ---- Cá Chuồn: ánh mắt, vạch sáng dọc thân; cánh vây vỗ, đuôi quẫy, vây bụng lay ----
ctHinh('caChuon', g => {
  ctDiem(g, 15, 19, '#ffffff', true); ctDiem(g, 16, 20, '#14182e', true); // ánh mắt, con ngươi
  for (let x = 18; x <= 34; x += 2) ctDiem(g, x, 21, '#a6deff', true); // đường sáng dọc thân
  for (let x = 19; x <= 33; x += 4) ctDiem(g, x, 19, '#0e2a5a', true); // vảy lưng
  for (const p of [[25, 6], [27, 9], [29, 12]]) ctDiem(g, p[0], p[1], '#4f86b0', true); // gân cánh
});
ctPhan('caChuon', [
  { n: 'canh', m: [{ p: [[17, 17], [24, 0], [42, 0], [34, 19]] }], mau: ['#a9d8ee', '#ffffff', '#4f86b0', '#ee5c3a', '#ffbe88'], pv: [27, 18], keep: 1 },
  { n: 'duoi', m: [[36, 9, 51, 31]], mau: ['#1b4c92', '#3883d4', '#0e2a5a'], pv: [36, 21], keep: 0 },
  { n: 'vay', m: [[19, 25, 30, 33]], pv: [21, 25], keep: 0 }]);
ctAnim('caChuon', {
  idle: P => { const u = P.u; P.r('canh', 10 * sn(u * 2)).r('duoi', 12 * sn(u * 2 + .2)).r('vay', 10 * sn(u + .3)); },
  move: P => { const u = P.u; P.r('canh', -18 + 22 * sn(u * 2)).r('duoi', 20 * sn(u * 2 + .3)).r('vay', 14 * sn(u * 2)); },
  tele: P => { const u = P.u, k = seg(u, 0, .4); P.r('canh', 25 * k + 6 * sn(u * 6)).b('duoi', -20 * k).r('vay', -15 * k); },
  atk: P => { const u = P.u, k = 1 - seg(u, .5, 1); P.r('canh', 30 * k).r('duoi', 28 * sn(u * 4)).r('vay', 20 * k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('canh', -30 * k).b('duoi', 30 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('canh', 45 * k).b('duoi', 35 * k).r('vay', 30 * k); },
});
// ---- Nhím Biển: ánh mắt, nanh, đốm phát quang; ba chùm gai xù ra riêng ----
ctHinh('nhim', g => {
  ctDiem(g, 26, 34, '#ffffff', true); ctDiem(g, 36, 35, '#ffffff', true);
  ctDiem(g, 30, 41, '#fff8e0', true); ctDiem(g, 34, 41, '#fff8e0', true);
  for (const p of [[28, 30], [35, 31], [24, 37], [40, 37], [32, 28]]) ctDiem(g, p[0], p[1], '#bfe9ff', true);
  for (const p of [[27, 31], [36, 30], [31, 32]]) ctDiem(g, p[0], p[1], '#988aee', true);
  const THAN = ['#4836a0', '#988aee'];
  for (const l of [[32, 29, 32, 33], [27, 30, 29, 33], [37, 30, 35, 33]]) ctDuong(g, l[0], l[1], l[2], l[3], '#281d62', THAN); // rãnh vỏ
  for (const p of [[29, 22], [35, 22], [19, 34], [45, 34], [21, 29], [43, 29], [20, 39], [44, 39]]) ctDiem(g, p[0], p[1], '#ff7a5c', true); // đầu gai đỏ (có độc)
});
ctPhan('nhim', [
  { n: 'gaiTren', m: [[25, 21, 41, 28]], mau: ['#ffffff', '#bfe9ff', '#281d62'], pv: [32, 32], keep: 0 },
  { n: 'gaiT', m: [[18, 28, 26, 42]], mau: ['#ffffff', '#bfe9ff', '#281d62', '#110b2c'], pv: [30, 35], keep: 0 },
  { n: 'gaiP', m: [[39, 28, 47, 42]], mau: ['#ffffff', '#bfe9ff', '#281d62', '#110b2c'], pv: [34, 35], keep: 0 }]);
ctAnim('nhim', {
  idle: P => { const u = P.u; P.s('gaiTren', 1 + .08 * sn(u), 1 + .08 * sn(u)).s('gaiT', 1 + .08 * sn(u + .33)).s('gaiP', 1 + .08 * sn(u + .66)); P.r('gaiTren', 4 * sn(u)); },
  move: P => { const u = P.u; P.r('gaiT', 8 * sn(u * 2)).r('gaiP', -8 * sn(u * 2)).r('gaiTren', 5 * sn(u * 2 + .25)); },
  tele: P => { const k = seg(P.u, 0, .45); P.s('gaiTren', 1 + .3 * k).s('gaiT', 1 + .3 * k).s('gaiP', 1 + .3 * k); },
  atk: P => { const k = kf(P.u, [[0, 1], [.15, 1.45, 'out'], [1, 1]]); P.s('gaiTren', k).s('gaiT', k).s('gaiP', k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gaiTren', 1 - .25 * k).s('gaiT', 1 - .25 * k).s('gaiP', 1 - .25 * k); },
});
// ---- Bầy Cá Con: mỗi con một vằn sẫm ngang thân và ánh mắt trắng (dễ nhận ra ba con riêng) ----
ctHinh('caCon', g => {
  ctDuong(g, 11, 7, 11, 12, '#0e2a5a', ['#3883d4']); ctDuong(g, 28, 15, 28, 20, '#063b3c', ['#1fb49c']); ctDuong(g, 14, 24, 14, 30, '#6a1220', ['#ee5c3a']);
  ctDiem(g, 12, 8, '#ffffff', true); ctDiem(g, 28, 16, '#ffffff', true); ctDiem(g, 13, 25, '#ffffff', true);
});

// ============ RỪNG GIÀ ============
// ---- Bầy Ong Vò Vẽ: gân cánh, kim chích sáng ----
ctHinh('ongVo', g => {
  const CANH = ['#d8f4ec', '#9cc8c0'];
  for (const l of [[17, 3, 13, 8], [36, 11, 32, 16], [18, 21, 14, 26]]) ctDuong(g, l[0], l[1], l[2], l[3], '#7aa8a4', CANH);
  for (const p of [[4, 9], [5, 9], [3, 6]]) ctDiem(g, p[0], p[1], '#fff8e0', true);
});
// ---- Chồn Bóng: vằn sáng dọc sống lưng, mắt rực có lõi trắng, khói bóng tím bay từ chóp đuôi ----
ctHinh('chonBong', g => {
  for (const x of [20, 25, 30, 35]) { ctDiem(g, x, 16, '#9a88c8', true); ctDiem(g, x + 1, 17, '#40305e', true); }
  ctDiem(g, 13, 16, '#ffffff', true); ctDiem(g, 14, 17, '#f070ff', true);
  for (const p of [[49, 9], [51, 11], [53, 13], [47, 13]]) ctDiem(g, p[0], p[1], '#40305e', true); // vằn đuôi
});
const khoiDuoi = P => ctPhu(P, 58, 7, (c, x, y) => { for (let i = 0; i < 3; i++) { const q = (P.t * .9 + i / 3) % 1; F.a(c, (1 - q) * .8); F.px(c, x + q * 10 * P.face + Math.sin(q * 9 + i) * 2, y - q * 8, i ? '#9a48d4' : '#e4a8ff', q < .4 ? 2 : 1, q < .4 ? 2 : 1); } F.a(c, 1); });
ctAnim('chonBong', { idle: khoiDuoi, move: khoiDuoi, tele: khoiDuoi });
// ---- Nấm Phồng: viền đốm độc, ánh mắt, rễ chân cử động riêng, bào tử bốc lên từ mũ ----
ctHinh('namPhong', (g, hv) => {
  if (hv) return;
  for (const p of [[27, 41], [35, 42]]) ctDiem(g, p[0], p[1], '#ffffff', true);
  for (const p of [[22, 37], [26, 38], [37, 38], [41, 37]]) { ctDiem(g, p[0], p[1], '#78b818', true); ctDiem(g, p[0], p[1] + 1, '#c4f43c'); } // giọt độc rỉ dưới vành mũ
  for (const p of [[29, 47], [33, 47]]) ctDiem(g, p[0], p[1], '#fff8e0', true); // nanh
  for (const x of [24, 28, 33, 37]) ctDuong(g, x, 35, x + (x < 31 ? -1 : 1), 37, '#58208c', ['#9a48d4', '#e8e0c4']); // phiến dưới mũ
});
ctPhan('namPhong', (ph, hv) => hv ? [] : [
  { n: 'reT', m: [[17, 46, 27, 52]], mau: ['#5c3a1e', '#2e1a10', '#b0a488', '#6a5c48', '#fff8e0'], pv: [27, 47], keep: 0 },
  { n: 'reP', m: [[37, 46, 47, 52]], mau: ['#5c3a1e', '#2e1a10', '#b0a488', '#6a5c48', '#fff8e0'], pv: [37, 47], keep: 0 }]);
const baoTu = P => ctPhu(P, 32, 27, (c, x, y) => { for (let i = 0; i < 4; i++) { const q = (P.t * .7 + i / 4) % 1; F.a(c, 1 - q); F.px(c, x + (hh(i, 3, 9) - .5) * 22 + Math.sin(q * 7 + i) * 2, y - q * 14, i % 2 ? '#c4f43c' : '#f4ffb0', 1, 1); } F.a(c, 1); });
ctAnim('namPhong', {
  idle: P => { baoTu(P); P.r('reT', 8 * sn(P.u)).r('reP', -8 * sn(P.u + .3)); },
  move: P => { baoTu(P); P.r('reT', 22 * sn(P.u)).r('reP', 22 * sn(P.u + .5)); },
  tele: P => { P.r('reT', -12 * seg(P.u, 0, .4)).r('reP', 12 * seg(P.u, 0, .4)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('reT', 20 * k).r('reP', -20 * k); },
});
// ---- Nhím Gai Độc: chóp gai nhỏ giọt độc xanh, mắt có ánh, mũi hồng; chùm gai phập phồng, bốn chân bước ----
ctHinh('nhimDoc', (g, hv) => {
  if (hv) return;
  for (const p of [[40, 30], [48, 30], [33, 31], [44, 32], [28, 35], [54, 36], [58, 37], [25, 39], [61, 41]]) { ctDiem(g, p[0], p[1], '#c4f43c', true); }
  ctDiem(g, 31, 45, '#ffffff', true); ctDiem(g, 30, 46, '#ff5a3c', true); ctDiem(g, 20, 48, '#c8707a', true);
  for (let x = 37; x <= 50; x += 4) ctDuong(g, x, 41, x - 2, 48, '#1c1210', ['#6a4c38', '#3e2a20']); // vằn lông
});
ctPhan('nhimDoc', (ph, hv) => hv ? [] : [
  { n: 'gai', m: [[27, 29, 63, 40]], mau: ['#e4a8ff', '#9a48d4', '#1c1210', '#c4f43c', '#e8e0c4'], pv: [44, 43], keep: 0 },
  { n: 'chanT', m: [[33, 51, 41, 56]], pv: [37, 51], z: -1 }, { n: 'chanS', m: [[48, 51, 57, 56]], pv: [52, 51], z: -1 }]);
ctAnim('nhimDoc', {
  idle: P => { P.s('gai', 1 + .06 * sn(P.u), 1 + .1 * sn(P.u)); },
  move: P => { P.r('chanT', 28 * sn(P.u * 2)).r('chanS', -28 * sn(P.u * 2)).r('gai', 3 * sn(P.u * 2)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gai', 1 - .15 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('chanT', 30 * k).r('chanS', -30 * k); },
});

// ============ LÂU ĐÀI CỔ ============
// ---- Bầy Dơi Than: gân màng cánh, ánh mắt ----
ctHinh('doiThan', g => {
  const MANG = ['#26222c'];
  for (const l of [[9, 8, 3, 11], [9, 9, 6, 12], [17, 8, 23, 10], [17, 9, 21, 12], [30, 17, 25, 20], [38, 17, 44, 19], [37, 18, 42, 21], [12, 23, 5, 25], [19, 23, 25, 25], [20, 24, 23, 27]]) ctDuong(g, l[0], l[1], l[2], l[3], '#48424e', MANG);
  for (const p of [[12, 9], [16, 9], [32, 15], [36, 15], [15, 24], [19, 24]]) ctDiem(g, p[0], p[1], '#fff6b0', true);
});
// ---- Hũ Lửa Sống: lá bùa vàng dán trán (bùa trấn yểm), vết nứt rực lửa; hai quai vẫy như tay, hai chân bước, tàn lửa bay ----
ctHinh('huLua', (g, hv) => {
  if (hv) return;
  for (let y = 29; y <= 31; y++) for (let x = 31; x <= 36; x++) ctDiem(g, x, y, '#ffd23c', true);
  for (const p of [[32, 30], [33, 29], [34, 30], [35, 31], [33, 31]]) ctDiem(g, p[0], p[1], '#b0261a', true);
  ctDiem(g, 37, 30, '#f0582a', true); ctDiem(g, 36, 32, '#ffd23c', true);
  ctDuong(g, 27, 39, 29, 42, '#f0582a', ['#96402a', '#5c2418']); ctDuong(g, 41, 38, 39, 41, '#f0582a', ['#96402a', '#5c2418']);
  ctDiem(g, 28, 40, '#ffd23c', true); ctDiem(g, 40, 39, '#ffd23c', true);
  ctDiem(g, 26, 36, '#ffffff', true); ctDiem(g, 39, 36, '#ffffff', true);
});
ctPhan('huLua', (ph, hv) => hv ? [] : [
  { n: 'taiT', m: [[19, 31, 25, 39]], pv: [25, 34], keep: 0 }, { n: 'taiP', m: [[43, 31, 49, 39]], pv: [43, 34], keep: 0 },
  { n: 'chanT', m: [[26, 46, 31, 50]], pv: [29, 46], z: -1 }, { n: 'chanS', m: [[36, 46, 42, 50]], pv: [38, 46], z: -1 }]);
const tanLua = P => ctPhu(P, 34, 22, (c, x, y) => { for (let i = 0; i < 3; i++) { const q = (P.t * 1.1 + i / 3) % 1; F.a(c, 1 - q); F.px(c, x + Math.sin(q * 8 + i * 2) * 3, y - q * 12, q < .3 ? '#fff6b0' : q < .6 ? '#ffd23c' : '#f0582a', 1, 1); } F.a(c, 1); });
ctAnim('huLua', {
  idle: P => { tanLua(P); P.r('taiT', 10 * sn(P.u)).r('taiP', -10 * sn(P.u)); },
  move: P => { tanLua(P); P.r('taiT', 18 * sn(P.u)).r('taiP', 18 * sn(P.u)).r('chanT', 25 * sn(P.u)).r('chanS', -25 * sn(P.u)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('taiT', -25 * k).r('taiP', 25 * k); },
  die: P => { const k = seg(P.u, 0, .25); P.r('taiT', -40 * k).r('taiP', 40 * k); },
});
// ---- Đèn Lồng Ma: nan tre trên thân đèn, ánh mắt; quai treo đung đưa, lửa trong đèn chập chờn ----
ctHinh('denLong', g => {
  for (const x of [23, 34]) ctDuong(g, x, 13, x, 22, '#b0261a', ['#f0582a', '#5a0e0c', '#b0261a']);
  ctDiem(g, 21, 18, '#ffffff', true); ctDiem(g, 32, 18, '#ffffff', true);
  for (let x = 22; x <= 32; x += 2) ctDiem(g, x, 29, '#ffd23c', true); // viền vàng đáy đèn
});
ctPhan('denLong', [{ n: 'quai', m: [[25, 6, 34, 10]], pv: [29, 10], keep: 0 }]);
const lepLua = P => ctPhu(P, 27, 24, (c, x, y) => { const f = ((P.t * 10) | 0) % 4; F.a(c, .55 + .15 * (f % 2)); F.px(c, x - 1, y - (f === 3 ? 1 : 0), '#fff6b0', 2 + (f === 1 ? 1 : 0), 1); F.a(c, 1); });
ctAnim('denLong', {
  idle: P => { lepLua(P); P.r('quai', 14 * sn(P.u)); }, move: P => { lepLua(P); P.r('quai', 20 * sn(P.u * 2)); },
  tele: P => { P.r('quai', 25 * sn(P.u * 3)); }, hit: P => { P.r('quai', 30 * kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]])); },
});
// ---- Nhím Than Hồng: vết nứt than đỏ rực trên lưng, mắt có lõi sáng, nanh; ba chùm gai và hai chân cử động riêng, tàn than bay ----
ctHinh('nhimThan', (g, hv) => {
  if (hv) return;
  const LUNG = ['#48424e', '#8a8290'];
  ctDuong(g, 26, 34, 29, 36, '#f0582a', LUNG); ctDuong(g, 33, 32, 34, 35, '#f0582a', LUNG); ctDuong(g, 38, 33, 36, 36, '#f0582a', LUNG); ctDuong(g, 30, 33, 31, 35, '#ff8a1e', LUNG);
  for (const p of [[27, 35], [34, 33], [37, 34]]) ctDiem(g, p[0], p[1], '#fff6b0', true);
  ctDiem(g, 29, 39, '#fff6b0', true); ctDiem(g, 38, 39, '#fff6b0', true);
  ctDiem(g, 32, 45, '#fff8e0', true); ctDiem(g, 36, 45, '#fff8e0', true);
});
ctPhan('nhimThan', (ph, hv) => hv ? [] : [
  { n: 'gaiTren', m: [[25, 25, 41, 32]], mau: ['#f0506e', '#ffb070', '#26222c'], pv: [33, 35], keep: 0 },
  { n: 'gaiT', m: [[20, 31, 27, 44]], mau: ['#f0506e', '#ffb070', '#26222c', '#0e0c12'], pv: [30, 38], keep: 0 },
  { n: 'gaiP', m: [[41, 31, 50, 44]], mau: ['#f0506e', '#ffb070', '#26222c', '#0e0c12'], pv: [38, 38], keep: 0 },
  { n: 'chanT', m: [[25, 45, 31, 48]], pv: [29, 45], z: -1 }, { n: 'chanS', m: [[38, 45, 44, 48]], pv: [40, 45], z: -1 }]);
const tanThan = P => ctPhu(P, 33, 30, (c, x, y) => { for (let i = 0; i < 2; i++) { const q = (P.t * .8 + i / 2) % 1; F.a(c, 1 - q); F.px(c, x + (i ? 5 : -6) + Math.sin(q * 6) * 2, y - q * 12, q < .4 ? '#ffd23c' : '#f0582a', 1, 1); } F.a(c, 1); });
ctAnim('nhimThan', {
  idle: P => { tanThan(P); const u = P.u; P.s('gaiTren', 1 + .08 * sn(u)).s('gaiT', 1 + .08 * sn(u + .33)).s('gaiP', 1 + .08 * sn(u + .66)); },
  move: P => { tanThan(P); P.r('chanT', 28 * sn(P.u * 2)).r('chanS', -28 * sn(P.u * 2)).r('gaiTren', 4 * sn(P.u * 2)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gaiTren', 1 - .2 * k).s('gaiT', 1 - .2 * k).s('gaiP', 1 - .2 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('chanT', 30 * k).r('chanS', -30 * k); },
});

})(); } catch (e) { MA.loi.push('chitiet.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art chitiet.js', e); }
// ----- hết chitiet.js -----
MA._xong();
})();
