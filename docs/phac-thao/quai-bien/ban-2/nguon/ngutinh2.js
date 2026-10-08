// BẢN 2: trùm vùng Ngư Tinh. Dữ và uy nghi hơn: răng lởm chởm, sẹo, gai gãy, hà bám, mắt sâu rực sáng, vây rách.
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
TO['ngu-tinh'] = function () {
  const [cv, c, y0] = page(1080, 2500, 'Trùm vùng: Ngư Tinh (bản 2)', 'Bản 2: dữ và uy nghi hơn. Răng nanh lởm chởm, mắt sâu rực sáng, sẹo cào bên sườn, gai gãy, vây rách, hà bám, lưng còn cắm cây lao cũ. Vẽ phóng to 5 lần.');
  let y = y0; panel(c, 16, y, 1048, 700); const fy = y + 570;
  aura(c, 600, fy - 270, 5, 60, 58, '70,140,255'); aura(c, 600, fy - 250, 5, 59, 40, '255,120,80');
  draw(c, Q2.nguTinh(1), 610, fy, 5); put(c, { key: 'smith', weapon: W('sword') }, 110, fy - 45, 5);
  rr(c, 60, fy - 45, 110, 6, 3, PANEL2); text(c, 'Em bé', 110, fy - 8, 24, SOFT, false, 'center');
  text(c, 'Ngư Tinh', 540, y + 626, 44, '#7cc4ee', true, 'center'); text(c, 'Rộng gấp năm lần em bé. Sóng nước lúc nào cũng cuộn quanh thân.', 540, y + 666, 24, CREAM, false, 'center');
  y += 700 + 26; text(c, 'Ba pha của trận đánh', 22, y + 34, 34, GOLDT, true); y += 52;
  const P = [['Pha 1: rình mồi', 'Bơi chậm, gai nằm xuôi, nước lặng, mắt cam.', '#7cc4ee'], ['Pha 2: giận dữ', 'Gai dựng đỏ, mắt đỏ rực, râu quất lên, nước dâng cao.', '#ff9d8a'], ['Pha 3: hóa băng', 'Mắt rực sáng, toàn thân phủ băng, sàn đóng băng.', '#dff6ff']];
  P.forEach((d, i) => { const x = 16 + i * 355, w = 338; panel(c, x, y, w, 400); draw(c, Q2.nguTinh(i + 1), x + w / 2, y + 250, 2); text(c, d[0], x + w / 2, y + 300, 28, d[2], true, 'center'); para(c, d[1], x + w / 2, y + 336, w - 30, 21, CREAM, 28, 'center'); });
  y += 400 + 26; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 380, 330); const f2 = y + 336; put(c, { key: 'smith', weapon: W('sword') }, 150, f2, 3); put(c, { key: 'hunter', weapon: W('bow') }, 250, f2, 3); draw(c, Q2.nguTinh(1), 640, f2 + 24, 3);
  return cut(cv, y + 380 + 22);
};
