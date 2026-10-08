// Trùm vùng: Ngư Tinh. p = pha 1, 2, 3.
function pl(g, pts, c, t) { for (let i = 0; i < pts.length - 1; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, t); }
function nuoc(g, lv, rough, ph) { for (let x = 0; x < g.w; x++) { const top = Math.round(lv + Math.sin(x * .32 + ph) * rough + Math.sin(x * .11) * rough * .6); for (let y = top; y < g.h; y++) { const d = y - top; set(g, x, y, d === 0 ? '#eafaff' : d < 3 ? '#6fd0ee' : d < 7 ? '#2f8fc8' : '#1f5f9c'); } if (x % 9 === 3) set(g, x, top + 4, '#9fe0f5'); if (x % 13 === 6) { set(g, x, top + 8, '#2f8fc8'); set(g, x + 1, top + 8, '#2f8fc8'); } } }
Q.nguTinh = function (p) { p = p || 1; const g = S(150, 104);
  const B = p === 3 ? ['#4d8fc0', '#a8dcf5', '#ffffff'] : ['#16335f', '#2b68ad', '#6fc0ea'], F = p === 3 ? ['#5aa6cf', '#bfeaff', '#ffffff'] : NGOC, GAI = p === 2 ? ['#c9463d', '#ff9d7a', '#ffe3d0'] : BANG;
  // vây buồm trên lưng
  const sail = p === 2 ? [[64, 40], [74, 4], [90, 1], [104, 9], [113, 24], [106, 46]] : [[64, 40], [76, 9], [90, 6], [102, 14], [110, 27], [106, 46]];
  poly(g, sail, F[1]); for (let i = 1; i <= 4; i++) line(g, 66 + i * 8, 42, sail[i][0], sail[i][1] + 1, F[0], 1); pl(g, sail.slice(1, 5), p === 3 ? '#ffffff' : '#ff7a5c', 1.8);
  // đuôi
  poly(g, [[112, 58], [137, 33], [131, 58], [139, 85]], F[1]); for (const t of [[134, 38], [131, 50], [131, 66], [136, 80]]) line(g, 114, 58, t[0], t[1], F[0], 1); pl(g, [[137, 33], [131, 58], [139, 85]], p === 3 ? '#ffffff' : '#ff7a5c', 1.6);
  poly(g, [[98, 42], [121, 55], [121, 63], [98, 76]], B[0]);
  // gai đầu
  const gs = p === 1 ? [[36, 42, 40, 41, 27], [44, 51, 38, 52, 21], [53, 60, 38, 62, 19], [61, 67, 39, 70, 25]] : [[35, 42, 40, 34, 19], [43, 51, 38, 45, 9], [52, 60, 38, 58, 6], [60, 67, 39, 68, 15]];
  for (const s of gs) crystal(g, s[0], s[1], s[2], s[3], s[4], GAI);
  // thân và đầu
  ell(g, 76, 58, 39, 23.5, B[0]); ell(g, 48, 55, 24.5, 23.5, B[0]); ell(g, 75, 55, 37, 20, B[1]); ell(g, 48, 52, 22.5, 20, B[1]);
  ell(g, 52, 37, 10, 2.4, B[2]); ell(g, 86, 39, 14, 2.6, B[2]); ell(g, 76, 72, 30, 6.5, p === 3 ? '#ffffff' : '#dff6ff');
  for (let y = 45, r = 0; y <= 64; y += 6, r++) for (let x = 70 + (r % 2) * 3; x <= 108; x += 7) if (get(g, x, y) === B[1] && get(g, x + 2, y) === B[1]) { set(g, x, y, B[0]); set(g, x + 1, y + 1, B[0]); set(g, x + 2, y, B[0]); }
  line(g, 65, 45, 67, 54, B[0], 1.6); line(g, 67, 54, 65, 63, B[0], 1.6); if (p === 2) { line(g, 68, 47, 70, 54, '#ff7a5c', 1.6); line(g, 70, 54, 68, 61, '#ff7a5c', 1.6); }
  // hàm dưới, miệng, răng
  poly(g, [[21, 69], [23, 80], [36, 85], [55, 83], [65, 73], [62, 67], [50, 76], [32, 77]], B[0]); poly(g, [[24, 76], [36, 81], [54, 79], [60, 73], [50, 78], [32, 79]], B[1]);
  poly(g, [[25, 58], [40, 55], [60, 60], [62, 68], [50, 76], [32, 77], [24, 70]], '#4a1028'); ell(g, 49, 66, 8, 4.5, '#24071a'); ell(g, 42, 73, 7, 2.2, '#ff7a5c');
  for (let i = 0; i < 7; i++) { const x = 26 + i * 5, by = 56 + i * .7, L = i === 0 ? 9 : i % 2 ? 5 : 7; poly(g, [[x, by], [x + 4, by], [x + 2, by + L]], '#ffffff'); set(g, x + 3, by + 1, '#bfe0f0'); }
  for (let i = 0; i < 5; i++) { const x = 27 + i * 5.2, by = 78 - i * .4, L = i === 0 ? 8 : 5; poly(g, [[x, by], [x + 4, by], [x + 2, by - L]], '#ffffff'); }
  rect(g, 29, 47, 2, 2, OL);
  // mắt
  if (p === 3) { ell(g, 46, 43, 7, 7, '#ffd84a'); ell(g, 46, 43, 5.2, 5.2, '#fff6a8'); ell(g, 46, 43, 2.8, 2.8, '#ffffff'); }
  else { ell(g, 46, 43, 6.6, 6.6, '#ffffff'); ell(g, 45, 43.6, 3.8, 3.8, p === 2 ? '#ff3b30' : '#d9772a'); ell(g, 45, 43.6, 1.6, 2.8, OL); rect(g, 42, 41, 2, 2, '#ffffff'); }
  poly(g, [[35, 38], [54, 31], [56, 35], [37, 42]], B[0]);
  if (p === 2) { ell(g, 58, 62, 4.5, 2.2, '#ff7a5c'); pl(g, [[58, 26], [61, 29], [58, 31]], '#ff5a46', 1); }
  // vây ngực
  poly(g, [[66, 66], [91, 80], [85, 91], [70, 87], [60, 75]], F[1]); line(g, 66, 66, 91, 80, B[0], 1.6); for (const t of [[84, 88], [74, 86], [64, 77]]) line(g, 67, 68, t[0], t[1], F[0], 1);
  // râu dài
  const R = p === 3 ? ['#dff6ff', '#ffffff'] : ['#ffb08a', '#ffe3d0'];
  const r1 = p === 2 ? [[29, 56], [19, 49], [13, 39], [15, 29], [22, 25]] : [[29, 56], [20, 52], [13, 56], [10, 66], [13, 75]], r2 = p === 2 ? [[33, 82], [22, 80], [13, 71], [11, 60]] : [[33, 82], [26, 88], [18, 88], [13, 82]];
  pl(g, r1, R[0], 2.2); pl(g, r2, R[0], 2.2); set(g, r1[4][0], r1[4][1], R[1]); set(g, r2[3][0], r2[3][1], R[1]);
  if (p === 3) { ell(g, 86, 48, 8, 2.6, '#ffffff'); ell(g, 100, 62, 5, 2, '#ffffff'); ell(g, 58, 47, 4, 1.6, '#ffffff'); crystal(g, 78, 86, 37, 85, 22, BANG); crystal(g, 94, 101, 40, 103, 28, BANG);
    poly(g, [[38, 85], [43, 85], [40.5, 94]], BANG[1]); poly(g, [[49, 84], [54, 84], [51.5, 91]], BANG[1]); poly(g, [[76, 88], [80, 88], [78, 95]], BANG[1]); }
  outline(g);
  if (p === 3) { for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + .5; line(g, 46 + Math.cos(a) * 9.5, 43 + Math.sin(a) * 9.5, 46 + Math.cos(a) * 13, 43 + Math.sin(a) * 13, '#fff6a8', 1); }
    for (let x = 0; x < g.w; x++) for (let y = 95; y < g.h; y++) set(g, x, y, y === 95 ? '#ffffff' : y < 98 ? '#c8ecfa' : '#8fc4e0');
    for (const s of [[3, 12, 96, 8, 74], [14, 21, 96, 19, 84], [128, 137, 96, 134, 70], [138, 146, 96, 143, 82], [112, 118, 96, 114, 87]]) crystal(g, s[0], s[1], s[2], s[3], s[4], BANG);
    for (const q of [[20, 20], [120, 16], [140, 50], [8, 40], [100, 96 - 60]]) { set(g, q[0], q[1], '#ffffff'); set(g, q[0] - 1, q[1], '#bfe9ff'); set(g, q[0] + 1, q[1], '#bfe9ff'); set(g, q[0], q[1] - 1, '#bfe9ff'); set(g, q[0], q[1] + 1, '#bfe9ff'); } }
  else if (p === 2) { nuoc(g, 82, 3, 1); for (const q of [[8, 70], [16, 62], [142, 68], [126, 72], [30, 74 + 14], [100, 73 + 14]]) { rect(g, q[0], q[1] - 12, 2, 3, '#6fd0ee'); set(g, q[0], q[1] - 13, '#eafaff'); } }
  else nuoc(g, 91, 1.6, 0);
  g.cx = 75; g.foot = g.h; return g; };
TO['ngu-tinh'] = function () {
  const [cv, c, y0] = page(1080, 2400, 'Trùm vùng: Ngư Tinh', 'Con cá khổng lồ trong truyện Lạc Long Quân diệt Ngư Tinh. Đầu mọc gai, miệng rộng đầy răng, râu dài, vây lưng như cánh buồm. Vẽ phóng to 5 lần.');
  let y = y0; panel(c, 16, y, 1048, 690); const fy = y + 560;
  aura(c, 600, fy - 270, 5, 60, 58, '90,170,255'); aura(c, 600, fy - 250, 5, 59, 40, '90,200,255');
  draw(c, Q.nguTinh(1), 610, fy, 5); put(c, { key: 'smith', weapon: W('sword') }, 110, fy - 45, 5);
  rr(c, 60, fy - 45, 110, 6, 3, PANEL2); text(c, 'Em bé', 110, fy - 8, 24, SOFT, false, 'center');
  text(c, 'Ngư Tinh', 540, y + 616, 44, '#7cc4ee', true, 'center'); text(c, 'Rộng gấp năm lần em bé. Sóng nước lúc nào cũng cuộn quanh thân.', 540, y + 656, 24, CREAM, false, 'center');
  y += 690 + 26; text(c, 'Ba pha của trận đánh', 22, y + 34, 34, GOLDT, true); y += 52;
  const P = [['Pha 1: bình thường', 'Bơi chậm, gai nằm xuôi, nước lặng.', '#7cc4ee'], ['Pha 2: giận dữ', 'Gai dựng đỏ, râu quất lên, nước dâng cao.', '#ff9d8a'], ['Pha 3: hóa băng', 'Mắt rực sáng, toàn thân phủ băng, sàn đóng băng.', '#dff6ff']];
  P.forEach((d, i) => { const x = 16 + i * 355, w = 338; panel(c, x, y, w, 400); draw(c, Q.nguTinh(i + 1), x + w / 2, y + 250, 2); text(c, d[0], x + w / 2, y + 300, 28, d[2], true, 'center'); para(c, d[1], x + w / 2, y + 336, w - 30, 21, CREAM, 28, 'center'); });
  y += 400 + 26; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 380, 330); const f2 = y + 336; put(c, { key: 'smith', weapon: W('sword') }, 150, f2, 3); put(c, { key: 'hunter', weapon: W('bow') }, 250, f2, 3); draw(c, Q.nguTinh(1), 640, f2 + 24, 3);
  return cut(cv, y + 380 + 22);
};
