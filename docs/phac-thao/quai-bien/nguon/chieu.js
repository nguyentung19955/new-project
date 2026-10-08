// Bốn chiêu của Ngư Tinh, minh họa bằng hình và mũi tên.
function label(c, s, x, y, col) { c.font = '500 21px ' + FONT; const tw = c.measureText(s).width; rr(c, x - tw / 2 - 10, y - 23, tw + 20, 32, 8, 'rgba(10,14,28,.85)'); text(c, s, x, y, 21, col || CREAM, false, 'center'); }
function cotNuoc() { const g = S(26, 76); for (let y = 10; y < 76; y++) for (let x = 6; x < 20; x++) set(g, x + Math.round(Math.sin(y * .5) * 1), y, x < 8 ? '#1f5f9c' : x < 11 ? '#2f8fc8' : x < 15 ? '#6fd0ee' : x < 17 ? '#eafaff' : '#2f8fc8');
  ball(g, 13, 9, 9, 6, ['#6fd0ee', '#eafaff', '#ffffff']); ell(g, 5, 13, 3, 2.4, '#eafaff'); ell(g, 21, 13, 3, 2.4, '#eafaff'); set(g, 2, 5, '#eafaff'); set(g, 24, 4, '#eafaff'); set(g, 13, 0, '#eafaff'); return g; }
function song(k) { const g = S(30, 22); k = k || 1; poly(g, [[29, 22], [26, 12], [20, 5], [12, 2], [6, 5], [10, 7], [13, 11], [11, 22]], '#2f8fc8'); poly(g, [[26, 22], [23, 13], [18, 7], [13, 5], [15, 9], [17, 14], [16, 22]], '#6fd0ee'); pl(g, [[26, 12], [20, 5], [12, 2], [6, 5]], '#eafaff', 1.6); set(g, 3, 8, '#eafaff'); set(g, 5, 11, '#eafaff'); set(g, 1, 3, '#eafaff'); g.foot = 22; return g; }
function nuocDai(wu, hu) { const g = S(wu, hu); nuoc(g, 3, 1.5, 0); g.foot = hu; return g; }
function ring(c, x, y, rx, ry, a) { c.fillStyle = 'rgba(255,70,50,' + (.2 * a) + ')'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,80,60,' + a + ')'; c.lineWidth = 5; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.stroke(); }
TO['ngu-tinh-chieu'] = function () {
  const [cv, c, y0] = page(1080, 2500, 'Bốn chiêu của Ngư Tinh', 'Mỗi chiêu đều có dấu báo trước để bé kịp né. Mũi tên vàng là đòn của trùm, mũi tên trắng là cách né.');
  let y = y0; const WH = '#ffffff';
  const T = [['Phun cột nước', 'Vòng đỏ hiện trên sàn báo chỗ sắp phun. Một nhịp sau, cột nước phụt lên đúng chỗ đó. Thấy vòng đỏ là chạy ra ngay.'], ['Dâng nước thu hẹp sàn', 'Nước dâng lên từ hai bên, phần sàn đứng được nhỏ dần. Bé phải đánh trong khoảng sàn còn lại ở giữa.'], ['Quẫy đuôi tạo sóng lan', 'Ngư Tinh quay lưng, quẫy đuôi một cái. Từng đợt sóng chạy dọc sàn về phía bé, phải nhảy hoặc lướt qua.'], ['Gọi Cua Lính', 'Ngư Tinh gầm lên. Cua Lính từ dưới nước bò lên vây lấy bé. Dọn cua nhanh rồi quay lại đánh trùm.']];
  T.forEach((t, i) => { panel(c, 16, y, 1048, 480); const sx = 28, sy = y + 12, fl = sy + 250; caveBg(c, sx, sy, 1024, 310, 250);
    c.save(); c.beginPath(); c.roundRect(sx, sy, 1024, 310, 14); c.clip();
    if (i === 0) { draw(c, Q.nguTinh(1), sx + 800, fl + 30, 3); ring(c, sx + 300, fl + 16, 66, 15, 1); ring(c, sx + 500, fl + 16, 66, 15, .5); draw(c, cotNuoc(), sx + 500, fl + 22, 3);
      put(c, { key: 'smith', weapon: W('sword') }, sx + 300, fl + 14, 3); arrow(c, sx + 640, fl - 70, sx + 560, fl - 110, GOLDT, 6); arrow(c, sx + 235, fl - 40, sx + 130, fl - 40, WH, 6);
      label(c, 'Vòng đỏ báo trước', sx + 300, sy + 40, '#ff9d8a'); label(c, 'Cột nước phụt lên', sx + 500, sy + 40); label(c, 'Chạy ra!', sx + 150, fl - 70, WH); }
    if (i === 1) { draw(c, Q.nguTinh(2), sx + 810, fl + 30, 3); draw(c, nuocDai(70, 34), sx + 105, fl + 62, 3); draw(c, nuocDai(160, 34), sx + 800, fl + 62, 3);
      put(c, { key: 'healer', weapon: W('spear') }, sx + 380, fl + 14, 3); arrow(c, sx + 110, fl - 75, sx + 240, fl - 75, GOLDT, 6); arrow(c, sx + 640, fl - 150, sx + 540, fl - 150, GOLDT, 6);
      c.strokeStyle = WH; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 222, fl + 44); c.lineTo(sx + 222, fl + 34); c.lineTo(sx + 552, fl + 34); c.lineTo(sx + 552, fl + 44); c.stroke();
      label(c, 'Nước dâng', sx + 120, sy + 40); label(c, 'Sàn còn lại', sx + 285, fl - 10, WH); label(c, 'Nước dâng', sx + 590, sy + 40); }
    if (i === 2) { draw(c, Q.nguTinh(1), sx + 800, fl + 30, 3, true); [[520, 1], [380, 1], [250, 1]].forEach(w => draw(c, song(), sx + w[0], fl + 22, 4)); 
      put(c, { key: 'hunter', weapon: W('bow') }, sx + 250, fl - 80, 3); arrow(c, sx + 600, fl - 120, sx + 520, fl - 80, GOLDT, 6); arrow(c, sx + 470, fl + 40, sx + 180, fl + 40, GOLDT, 6); arrow(c, sx + 190, fl - 30, sx + 190, fl - 130, WH, 6);
      label(c, 'Quẫy đuôi', sx + 610, sy + 40); label(c, 'Sóng chạy dọc sàn', sx + 400, sy + 40); label(c, 'Nhảy qua!', sx + 110, fl - 150, WH); }
    if (i === 3) { draw(c, Q.nguTinh(2), sx + 800, fl + 30, 3); c.strokeStyle = CREAM; c.lineWidth = 5; for (const r of [26, 44, 62]) { c.beginPath(); c.arc(sx + 665, fl - 85, r, Math.PI - .7, Math.PI + .7); c.stroke(); }
      draw(c, Q.cua(), sx + 520, fl + 26, 3); draw(c, nuocDai(34, 8), sx + 520, fl + 34, 3); draw(c, Q.cua(), sx + 400, fl + 14, 3); draw(c, Q.cua(), sx + 290, fl + 18, 3);
      put(c, { key: 'wrestler', weapon: W('hammer') }, sx + 130, fl + 14, 3); arrow(c, sx + 480, fl - 95, sx + 200, fl - 95, GOLDT, 6);
      label(c, 'Gầm lên gọi lính', sx + 620, sy + 40); label(c, 'Cua Lính bò lên vây bé', sx + 340, sy + 40); }
    c.restore();
    badge(c, i + 1, 60, y + 362); text(c, t[0], 96, y + 376, 36, GOLDT, true); para(c, t[1], 40, y + 416, 1000, 23, CREAM, 30);
    y += 496; });
  return cut(cv, y + 6);
};
