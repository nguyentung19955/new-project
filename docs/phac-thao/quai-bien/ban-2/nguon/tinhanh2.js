// BẢN 2: hai tinh anh và trùm nhỏ Cua Đá. Đáng gờm hơn, nhiều chi tiết hơn.
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
TO['tinh-anh-va-trum-nho'] = function () {
  const [cv, c, y0] = page(1080, 2700, 'Tinh anh và trùm nhỏ (bản 2)', 'Bản 2: đáng gờm hơn, nhiều chi tiết hơn. Tinh anh có dấu hiệu riêng để nhìn là biết. Trùm nhỏ Cua Đá gác giữa vùng.');
  let y = y0; const pw = 516, ph = 520;
  const E = [['cuaTuong', 'Cua Tướng', 'Tinh anh của Cua Lính. Vương miện san hô, mắt đỏ rực, càng răng cưa, vai vắt lưới rách.', '#7cc4ee', '90,180,255'], ['caNocChua', 'Cá Nóc Chúa', 'Tinh anh của Cá Nóc. Vương miện băng, nanh dài, sẹo qua mắt, hào quang lạnh.', '#8ff0d8', '150,240,255']];
  E.forEach((d, i) => { const x = 16 + i * 532; panel(c, x, y, pw, ph); const fy = y + 384; aura(c, x + pw / 2, fy - 150, 6, 38, 27, d[4]); floor(c, x + 12, fy, pw - 24); draw(c, Q2[d[0]](), x + pw / 2, fy, 6);
    text(c, d[1], x + pw / 2, y + 436, 38, d[3], true, 'center'); para(c, d[2], x + pw / 2, y + 470, pw - 30, 23, CREAM, 30, 'center'); });
  y += ph + 16; panel(c, 16, y, 1048, 620); const fy = y + 470; aura(c, 640, fy - 190, 6, 62, 38, '95,240,216'); floor(c, 28, fy, 1024);
  put(c, { key: 'smith', weapon: W('sword') }, 120, fy, 6); draw(c, Q2.cuaDa(), 640, fy, 6);
  text(c, 'Em bé', 120, fy + 40, 24, SOFT, false, 'center');
  text(c, 'Cua Đá', 540, y + 536, 42, '#9db0cc', true, 'center'); para(c, 'Trùm nhỏ. Thân và hai càng bằng đá nứt, càng có răng, lưng mọc tinh thể và cắm một mỏ neo gỉ. Mắt và vết nứt phát sáng xanh ngọc. Đập càng xuống đất làm rung cả sàn.', 540, y + 572, 980, 23, CREAM, 30, 'center');
  y += 620 + 26; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 300, 240); let f2 = y + 246;
  put(c, { key: 'smith', weapon: W('sword') }, 90, f2, 3);
  [['cua', 250], ['cuaTuong', 480], ['caNoc', 700], ['caNocChua', 900]].forEach(d => { shadow(c, d[1], f2 + 3, 20, 3); draw(c, Q2[d[0]](), d[1], f2, 3); });
  y += 316; caveBg(c, 16, y, 1048, 320, 260); f2 = y + 266; put(c, { key: 'smith', weapon: W('sword') }, 250, f2, 3); shadow(c, 620, f2 + 3, 70, 3); draw(c, Q2.cuaDa(), 620, f2, 3);
  return cut(cv, y + 320 + 22);
};
