// So sánh bản 1 và bản 2 của tám quái thường, cùng tỉ lệ.
TO['so-sanh-ban-1-ban-2'] = function () {
  const [cv, c, y0] = page(1080, 2600, 'So sánh bản 1 và bản 2', 'Từng con: bản 1 bên trái, bản 2 bên phải, cùng tỉ lệ (phóng 4 lần). Bản 2 dữ hơn, nhiều chi tiết hơn, to hơn một chút.');
  const pw = 516, ph = 290; let y = y0;
  DS2.forEach((d, i) => { const x = 16 + (i % 2) * 532, py = y + Math.floor(i / 2) * (ph + 16); panel(c, x, py, pw, ph); const fy = py + 200; floor(c, x + 12, fy, pw - 24);
    draw(c, Q[d[0]](), x + pw * .25, fy, 4); draw(c, Q2[d[0]](), x + pw * .73, fy, 4);
    c.fillStyle = PANEL2; c.fillRect(x + pw / 2 - 2, py + 20, 3, 170);
    text(c, 'Bản 1', x + pw * .25, py + 236, 22, SOFT, false, 'center'); text(c, 'Bản 2', x + pw * .73, py + 236, 22, GOLDT, true, 'center');
    text(c, d[1], x + pw / 2, py + 272, 30, d[3], true, 'center'); });
  y += 4 * (ph + 16) + 10; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 240, 180); let fy = y + 186; text(c, 'Bản 1', 34, y + 36, 26, SOFT, true);
  put(c, { key: 'smith', weapon: W('sword') }, 70, fy, 3);
  DS.forEach((d, i) => { const x = 215 + i * 112; shadow(c, x, fy + 3, 16, 3); draw(c, Q[d[0]](), x, fy, 3); });
  for (let r = 0; r < 2; r++) { y += 256; caveBg(c, 16, y, 1048, 240, 180); fy = y + 186; text(c, 'Bản 2', 34, y + 36, 26, GOLDT, true);
    put(c, { key: 'smith', weapon: W('sword') }, 90, fy, 3);
    DS2.slice(r * 4, r * 4 + 4).forEach((d, i) => { const x = 300 + i * 222; shadow(c, x, fy + 3, 16, 3); draw(c, Q2[d[0]](), x, fy, 3); }); }
  return cut(cv, y + 240 + 22);
};
