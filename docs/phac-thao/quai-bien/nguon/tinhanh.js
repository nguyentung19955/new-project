// Hai tinh anh và trùm nhỏ Cua Đá.
const DA = ['#39445e', '#5d6f8f', '#9db0cc'];
function crystal(g, x0, x1, yb, tx, ty, cols) { poly(g, [[x0, yb], [tx, ty], [x1, yb]], cols[1]); poly(g, [[x0, yb], [tx, ty], [(x0 + x1) / 2 - .5, yb]], cols[2]); poly(g, [[x1 - 1.5, yb], [tx + .5, ty + 2], [x1, yb]], cols[0]); }
function aura(c, x, y, s, rx, ry, rgb) { for (let k = 0; k < 3; k++) { const g = S(120, 120); ell(g, 60, 60, rx - k * 4, ry - k * 4, 'rgba(' + rgb + ',' + (.10 + k * .07) + ')'); g.cx = 60; g.foot = 60; draw(c, g, x, y, s); } }
Q.cuaTuong = function () { const g = S(80, 60);
  line(g, 22, 42, 12, 50, LAM[0], 2.8); line(g, 25, 45, 18, 52, LAM[0], 2.8); line(g, 20, 39, 8, 45, LAM[0], 2.8);
  line(g, 22, 34, 13, 27, SANHO[0], 4.4); ball(g, 11, 20, 8, 8, SANHO); poly(g, [[8, 10], [14, 10], [12.5, 20]], null); rect(g, 6, 22, 2, 2, SANHO[0]);
  line(g, 28, 28, 25, 22, LAM[0], 2.6);
  ball(g, 40, 37, 18.5, 11.5, LAM); ell(g, 40, 44, 12.5, 3.4, '#dff6ff'); ell(g, 28, 36, 2.2, 1.4, LAM[0]); ell(g, 33, 31, 1.6, 1, LAM[0]); rect(g, 24, 40, 3, 1, LAM[0]);
  mirror(g);
  eye(g, 25, 19, 4.4, .9, .6, 1, '#7a1f2a'); eye(g, 55, 19, 4.4, -.9, .6, -1, '#7a1f2a');
  rect(g, 36, 41, 8, 1, OL); set(g, 36, 40, OL); set(g, 43, 40, OL); set(g, 38, 42, '#ffffff'); set(g, 41, 42, '#ffffff');
  line(g, 45, 30, 50, 35, '#dff6ff', 1); // vết sẹo
  // vương miện san hô
  line(g, 36, 26, 33, 18, SANHO[1], 2.2); line(g, 40, 26, 40, 14, SANHO[1], 2.4); line(g, 44, 26, 47, 18, SANHO[1], 2.2); line(g, 40, 19, 43, 16, SANHO[1], 1.6); line(g, 34, 21, 31, 20, SANHO[1], 1.6); line(g, 46, 21, 49, 20, SANHO[1], 1.6);
  for (const p of [[33, 17], [40, 13], [47, 17], [43, 15]]) set(g, p[0], p[1], SANHO[2]);
  rect(g, 34, 25, 13, 3, '#ffd27a'); rect(g, 34, 27, 13, 1, '#c9953a'); set(g, 40, 26, '#22b5a5'); set(g, 36, 26, '#ff7a5c'); set(g, 44, 26, '#ff7a5c');
  return outline(g); };
Q.caNocChua = function () { const g = S(70, 64), cx = 35, cy = 38, R = 13.5;
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + .22; line(g, cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1), cx + Math.cos(a) * (R + 3.2), cy + Math.sin(a) * (R + 3.2), BANG[1], 1.6); }
  crystal(g, 27, 32, 28, 28, 17, BANG); crystal(g, 32, 39, 27, 35.5, 12, BANG); crystal(g, 38, 43, 28, 43, 17, BANG); // vương miện băng
  poly(g, [[cx + R - 1, cy], [cx + R + 6, cy - 5], [cx + R + 6, cy + 5]], SANHO[1]);
  ball(g, cx, cy, R, R * .95, NGOC); ell(g, cx, cy + R * .45, R * .8, R * .48, '#f4fbff');
  poly(g, [[cx - R + 1, cy + 2], [cx - R - 5, cy + 7], [cx - R + 3, cy + 7]], SANHO[1]);
  eye(g, cx - 6, cy - 3, 4.2, -.8, .4, 1, '#7a1f2a'); eye(g, cx + 6, cy - 3, 4.2, -.8, .4, -1, '#7a1f2a');
  rect(g, cx - 2, cy + 5, 5, 3, SANHO[0]); rect(g, cx - 1, cy + 6, 3, 1, OL); set(g, cx - 1, cy + 5, '#fff'); set(g, cx + 1, cy + 5, '#fff');
  ell(g, cx - 10, cy + 3, 2, 1.2, '#ff9d8a'); ell(g, cx + 10, cy + 3, 2, 1.2, '#ff9d8a');
  rect(g, cx - 9, cy - 10, 5, 1, NGOC[0]); rect(g, cx + 4, cy - 11, 4, 1, NGOC[0]);
  outline(g);
  for (const p of [[14, 20], [58, 26], [10, 44], [60, 50]]) { set(g, p[0], p[1], '#ffffff'); set(g, p[0] - 1, p[1], '#bfe9ff'); set(g, p[0] + 1, p[1], '#bfe9ff'); set(g, p[0], p[1] - 1, '#bfe9ff'); set(g, p[0], p[1] + 1, '#bfe9ff'); }
  g.cx = cx; g.foot = cy + R + 4; return g; };
Q.cuaDa = function () { const g = S(116, 80), GL = '#5ff0d8';
  // tinh thể trên lưng
  crystal(g, 36, 44, 40, 37, 26, NGOC); crystal(g, 44, 53, 36, 46, 20, BANG); crystal(g, 53, 63, 36, 59, 16, ['#1fa0a0', '#4fd8d0', '#d6fffa']); crystal(g, 63, 71, 38, 70, 23, BANG); crystal(g, 71, 78, 42, 78, 30, NGOC);
  // chân đá
  poly(g, [[36, 58], [26, 62], [22, 72], [29, 72], [32, 65], [40, 63]], DA[0]); poly(g, [[44, 62], [38, 66], [36, 72], [43, 72], [45, 67]], DA[0]);
  // thân đá
  poly(g, [[30, 62], [28, 50], [34, 40], [44, 34], [58, 32], [58, 67], [42, 67]], DA[1]);
  poly(g, [[30, 62], [42, 67], [58, 67], [58, 61], [40, 61], [29, 56]], DA[0]);
  poly(g, [[35, 41], [44, 35.5], [54, 34], [44, 39], [36, 46]], DA[2]);
  poly(g, [[42, 47], [58, 45], [58, 57], [44, 57]], '#161b2c'); // hốc mặt
  ell(g, 50, 51.5, 3.4, 3.4, GL); ell(g, 50.6, 51.8, 1.4, 2, OL); set(g, 49, 50, '#ffffff'); line(g, 45, 46, 54, 49, DA[0], 2);
  mirror(g);
  line(g, 60, 39, 56, 44, GL, 1); line(g, 70, 44, 74, 50, '#161b2c', 1); line(g, 38, 44, 35, 50, '#161b2c', 1); line(g, 35, 50, 37, 54, GL, 1); // vết nứt
  for (let x = 52; x <= 64; x += 3) { set(g, x, 59, '#dfe8f5'); set(g, x, 60, '#dfe8f5'); } rect(g, 51, 58, 15, 1, OL); // răng
  // càng trái: giơ cao
  line(g, 30, 52, 18, 44, DA[0], 7);
  poly(g, [[2, 42], [4, 26], [14, 17], [25, 21], [28, 34], [22, 45], [10, 47]], DA[1]); poly(g, [[4, 40], [14, 37], [25, 37], [22, 45], [10, 47]], DA[0]); poly(g, [[6, 27], [14, 19.5], [22, 22], [13, 26]], DA[2]);
  poly(g, [[1, 33], [15, 31], [15, 34.5], [2, 37]], null); line(g, 18, 26, 21, 33, GL, 1); set(g, 9, 43, '#ff7a5c'); set(g, 10, 42, '#ff7a5c'); set(g, 11, 43, '#ff7a5c');
  // càng phải: to hơn, chống xuống đất
  line(g, 86, 54, 95, 52, DA[0], 7);
  poly(g, [[88, 64], [86, 46], [94, 37], [107, 39], [113, 52], [108, 68], [94, 70]], DA[1]); poly(g, [[88, 62], [98, 60], [112, 58], [108, 68], [94, 70]], DA[0]); poly(g, [[89, 46], [95, 39], [105, 40.5], [96, 44]], DA[2]);
  poly(g, [[99, 52], [115, 50], [115, 54], [100, 56]], null); line(g, 92, 48, 96, 56, GL, 1); line(g, 96, 56, 94, 60, GL, 1);
  set(g, 103, 44, '#22b5a5'); set(g, 104, 44, '#22b5a5'); set(g, 104, 45, '#22b5a5');
  outline(g); g.cx = 58; g.foot = 73; return g; };
TO['tinh-anh-va-trum-nho'] = function () {
  const [cv, c, y0] = page(1080, 2200, 'Tinh anh và trùm nhỏ', 'Tinh anh là bản to, dữ hơn của quái thường, có dấu hiệu riêng để nhìn là biết. Trùm nhỏ Cua Đá gác giữa vùng.');
  let y = y0; const pw = 516, ph = 440;
  const E = [['cuaTuong', 'Cua Tướng', 'Tinh anh của Cua Lính. Đội vương miện san hô, mắt đỏ, càng to gấp đôi.', '#7cc4ee', '90,180,255'], ['caNocChua', 'Cá Nóc Chúa', 'Tinh anh của Cá Nóc. Đội vương miện băng, quanh mình có hào quang lạnh.', '#8ff0d8', '150,240,255']];
  E.forEach((d, i) => { const x = 16 + i * 532; panel(c, x, y, pw, ph); const fy = y + 300; aura(c, x + pw / 2, fy - 120, 6, 36, 24, d[4]); floor(c, x + 12, fy, pw - 24); draw(c, Q[d[0]](), x + pw / 2, fy, 6);
    text(c, d[1], x + pw / 2, y + 354, 38, d[3], true, 'center'); para(c, d[2], x + pw / 2, y + 390, pw - 40, 23, CREAM, 30, 'center'); });
  y += ph + 16; panel(c, 16, y, 1048, 560); const fy = y + 420; aura(c, 640, fy - 170, 6, 62, 34, '95,240,216'); floor(c, 28, fy, 1024);
  put(c, { key: 'smith', weapon: W('sword') }, 120, fy, 6); draw(c, Q.cuaDa(), 640, fy, 6);
  text(c, 'Em bé', 120, fy + 40, 24, SOFT, false, 'center');
  text(c, 'Cua Đá', 540, y + 484, 42, '#9db0cc', true, 'center'); para(c, 'Trùm nhỏ. Thân và hai càng bằng đá, lưng mọc tinh thể, mắt và vết nứt phát sáng xanh ngọc. Đập càng xuống đất làm rung cả sàn.', 540, y + 520, 960, 23, CREAM, 30, 'center');
  y += 560 + 26; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 300, 240); const f2 = y + 246;
  put(c, { key: 'smith', weapon: W('sword') }, 70, f2, 3);
  [['cua', 205], ['cuaTuong', 375], ['caNoc', 525], ['caNocChua', 640], ['cuaDa', 870]].forEach(d => { const g = Q[d[0]](); shadow(c, d[1], f2 + 3, d[0] === 'cuaDa' ? 70 : 20, 3); draw(c, g, d[1], f2, 3); });
  return cut(cv, y + 300 + 22);
};
