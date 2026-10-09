// Cảnh làng có người (bố cục A): làng rộng 720 điểm, màn hình 480 trượt ngang theo em bé.
// Em bé đi tám hướng bằng cần điều khiển, vũ khí sống bay theo. Bảy người làng đứng cạnh công trình của mình,
// tới gần thì nút tròn thành "Nói chuyện"; chạm thẳng vào người (hoặc khuôn mặt ở dải lối tắt) thì em bé tự chạy tới.
// Tệp này chỉ thêm G.villageScene. Nơi dùng gắn hai hàm: onTalk(mã người) để mở bảng, onWeapon(mã vũ khí) để xem vũ khí.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const VS = (G.villageScene = {});
  const W = 720, H = 270;
  // Cảnh làng vẽ lùi xuống OY điểm để dải khuôn mặt ở mép trên không đè lên mái nhà, ngọn cây.
  const OY = 14;
  VS.W = W; VS.OY = OY;

  // ======================= đồ vẽ pixel dùng chung =======================
  function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
  function p(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col; rx = Math.round(rx); ry = Math.round(ry);
    for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.5) * (ry + 0.5))))); c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); }
  }
  function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function line(c, x0, y0, x1, y1, t, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) p(c, x0 + ((x1 - x0) * i) / n - (t >> 1), y0 + ((y1 - y0) * i) / n - (t >> 1), t, t, col); }
  // Viền tối 1 điểm quanh hình (cùng kiểu với em bé hero)
  function outlined(w, h, ox, oy, draw, col) {
    const [a, ac] = mk(w, h); ac.translate(ox, oy); draw(ac);
    const [t, tc] = mk(w, h); tc.drawImage(a, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col || '#1a1420'; tc.fillRect(0, 0, w, h);
    const [o, oc] = mk(w, h);
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) oc.drawImage(t, d[0], d[1]);
    oc.drawImage(a, 0, 0);
    return { cv: o, ox, oy };
  }

  // ======================= bảy người làng =======================
  const MASK = '#f4eee0', MASK2 = '#d9cfbb', INK = '#1a1420';
  // viec: tên chức năng hiện trong bong bóng; chao: câu nói khi mở bảng; ve: câu chào khi đóng bảng;
  // pos: chỗ đứng; den: chỗ em bé đứng khi nói chuyện.
  const NPCS = {
    lai: { ten: 'Chú Lái Đò', viec: 'Vào ải', ngan: 'Vào ải', chao: 'Đi đâu hả cháu?', ve: 'Đi cẩn thận nhé!', robe: '#8a5632', robe2: '#6a3e22', wide: 0, top: -27, pos: [638, 152], den: [620, 163] },
    ren: { ten: 'Ông Thợ Rèn', viec: 'Lò rèn', ngan: 'Lò rèn', chao: 'Đưa đây ông xem lưỡi nào!', ve: 'Đi cẩn thận nhé!', robe: '#9a4a30', robe2: '#7a3622', wide: 2, top: -27, pos: [468, 132], den: [447, 141] },
    xen: { ten: 'Bà Hàng Xén', viec: 'Hàng xén', ngan: 'Vũ khí', chao: 'Mua gì bán gì, vào đây với bà.', ve: 'Lần sau lại ghé bà nhé.', robe: '#8a5a38', robe2: '#6e4428', wide: 1, top: -23, pos: [540, 198], den: [540, 214] },
    may: { ten: 'Cô Thợ May', viec: 'Thợ may', ngan: 'Mũ áo', chao: 'Bé thử cái mũ mới xem nào.', ve: 'Mặc đẹp lắm đó!', robe: '#d86a7a', robe2: '#b04a5e', wide: -1, top: -28, pos: [574, 132], den: [555, 141] },
    do: { ten: 'Cụ Đồ', viec: 'Kỹ năng', ngan: 'Kỹ năng', chao: 'Ngồi xuống đây, lão chỉ cho một chiêu.', ve: 'Học rồi nhớ luyện nghe con.', robe: '#4a548c', robe2: '#363e6c', wide: 0, top: -24, sit: true, pos: [364, 150], den: [342, 160] },
    tu: { ten: 'Ông Từ', viec: 'Chọn hero', ngan: 'Hero', chao: 'Khẽ thôi, các bé đang chơi trong sân.', ve: 'Các bé chơi ngoan nhé.', robe: '#d0a440', robe2: '#a87e2a', wide: 0, top: -27, pos: [142, 140], den: [124, 151] },
    mo: { ten: 'Anh Mõ', viec: 'Cài đặt', ngan: 'Cài đặt', chao: 'Cốc cốc cốc! Làng nước nghe đây!', ve: 'Có gì cứ gọi anh Mõ!', robe: '#3f9a8c', robe2: '#2c7468', wide: -1, top: -26, pos: [100, 92], den: [118, 102] },
  };
  const ORDER = ['lai', 'ren', 'xen', 'may', 'do', 'tu', 'mo']; // thứ tự trên dải lối tắt
  VS.NPCS = NPCS; VS.ORDER = ORDER;
  function drawNpc(c, kind, f, o) {
    o = o || {}; const N = NPCS[kind], w = N.wide, y = N.top, look = o.look || 0;
    // chân
    if (N.sit) { p(c, -8 - w, -4, 17 + w * 2, 4, N.robe2); p(c, -9, -2, 4, 2, MASK2); p(c, 6, -2, 4, 2, MASK2); }
    else if (kind === 'lai') { p(c, -4, -4, 3, 4, MASK2); p(c, 2, -4, 3, 4, MASK2); p(c, -5, -1, 4, 1, MASK2); p(c, 2, -1, 4, 1, MASK2); }
    else { p(c, -5, -3, 4, 3, '#2a2230'); p(c, 2, -3, 4, 3, '#2a2230'); }
    // thân
    const b0 = y + 10, bb = N.sit ? -4 : (kind === 'lai' ? -4 : -3);
    for (let yy = b0; yy < bb; yy++) { const k = (yy - b0) / (bb - b0), hw = Math.round(5 + w + k * 2.2); p(c, -hw, yy, hw * 2 + 1, 1, N.robe); p(c, hw - 2, yy, 3, 1, N.robe2); }
    // chi tiết áo
    if (kind === 'ren') { p(c, -4, b0 + 2, 9, bb - b0 - 2, '#3a2a26'); p(c, -4, b0 + 2, 9, 1, '#5a4438'); p(c, -1, b0 + 5, 3, 2, '#c9a24f'); }
    if (kind === 'xen') { p(c, -2, b0 + 1, 5, 5, '#c8402e'); p(c, -7, b0 + 6, 15, 2, '#6fb060'); p(c, 4, b0 + 8, 2, 4, '#6fb060'); }
    if (kind === 'may') { p(c, -2, b0 + 1, 5, 4, '#f4eee0'); p(c, -5, b0 + 6, 11, 2, '#6fc0d0'); for (let yy = b0 + 8; yy < bb; yy++) { const hw = Math.round(4 + ((yy - b0) / (bb - b0)) * 2.2); p(c, -hw, yy, hw * 2 + 1, 1, '#2e2838'); } p(c, -5, b0 + 8, 2, 5, '#6fc0d0'); }
    if (kind === 'do') { p(c, -1, b0 + 1, 3, bb - b0 - 2, '#6a76b4'); }
    if (kind === 'tu') { p(c, -1, b0 + 1, 3, 4, '#f4eee0'); p(c, -6, b0 + 6, 13, 2, '#8a3a2e'); }
    if (kind === 'lai') { p(c, -6, b0 + 6, 13, 2, '#4a2c1a'); p(c, -2, b0 + 1, 5, 2, MASK2); }
    if (kind === 'mo') { p(c, -5, b0 + 6, 11, 2, '#e8c04a'); p(c, -1, b0 + 1, 3, 3, '#f4eee0'); }
    // đầu (mặt nạ tinh linh)
    p(c, -5, y, 11, 1, MASK); p(c, -6, y + 1, 13, 1, MASK); p(c, -7, y + 2, 15, 7, MASK); p(c, -6, y + 9, 13, 1, MASK); p(c, -5, y + 10, 11, 1, MASK2);
    p(c, 6, y + 3, 2, 6, MASK2);
    // mắt: tới gần thì mắt mở to và nhìn về phía em bé
    const ex = look > 0 ? 1 : look < 0 ? -1 : 0, blink = o.blink;
    if (kind === 'do' && !look) { p(c, -5, y + 6, 3, 1, INK); p(c, 2, y + 6, 3, 1, INK); p(c, -4, y + 5, 1, 1, INK); p(c, 3, y + 5, 1, 1, INK); }
    else if (blink) { p(c, -5 + ex, y + 6, 3, 1, INK); p(c, 2 + ex, y + 6, 3, 1, INK); }
    else { const eh = look ? 4 : 3, ey = look ? y + 4 : y + 5; p(c, -5 + ex, ey, 3, eh, INK); p(c, 2 + ex, ey, 3, eh, INK); p(c, -4 + ex, ey, 1, 1, '#fff'); p(c, 3 + ex, ey, 1, 1, '#fff'); }
    p(c, -7, y + 8, 2, 1, '#f0a090'); p(c, 5, y + 8, 2, 1, '#f0a090');
    // tóc, mũ, râu
    if (kind === 'ren') {
      p(c, -7, y + 1, 15, 2, '#d8482e'); p(c, 7, y + 1, 3, 2, '#d8482e'); p(c, 8, y + 3, 2, 3, '#b0341e');
      p(c, -6, y + 3, 4, 1, '#6a6460'); p(c, 2, y + 3, 4, 1, '#6a6460');
      p(c, -6, y + 8, 13, 3, '#d4cfc4'); p(c, -4, y + 11, 9, 2, '#d4cfc4'); p(c, -2, y + 13, 5, 1, '#b8b2a6'); p(c, -1, y + 9, 3, 1, '#8a8480');
    }
    if (kind === 'xen') {
      p(c, -5, y - 2, 11, 2, '#2e2838'); p(c, -7, y, 15, 2, '#2e2838'); p(c, -8, y + 2, 2, 8, '#2e2838'); p(c, 7, y + 2, 2, 8, '#2e2838'); p(c, -1, y - 4, 3, 2, '#2e2838');
      p(c, -7, y + 2, 4, 1, '#2e2838'); p(c, 4, y + 2, 4, 1, '#2e2838'); p(c, -3, y + 10, 7, 2, '#2e2838'); p(c, -1, y + 8, 3, 1, '#b05a50');
    }
    if (kind === 'may') {
      p(c, -5, y - 1, 11, 2, '#2e2838'); p(c, -7, y + 1, 15, 2, '#2e2838'); p(c, -8, y + 2, 2, 6, '#2e2838'); p(c, 7, y + 2, 2, 6, '#2e2838');
      p(c, -6, y, 13, 1, '#f08aa8'); p(c, 5, y - 3, 4, 4, '#2e2838'); p(c, 6, y - 2, 2, 1, '#f08aa8'); p(c, -1, y + 8, 2, 1, '#d0606a');
    }
    if (kind === 'do') {
      p(c, -6, y - 2, 13, 2, '#221c2c'); p(c, -7, y, 15, 3, '#221c2c'); p(c, -7, y + 1, 15, 1, '#3a3248');
      p(c, -5, y + 4, 3, 1, '#d4cfc4'); p(c, 2, y + 4, 3, 1, '#d4cfc4');
      p(c, -4, y + 8, 9, 2, '#fbf7ee'); p(c, -3, y + 10, 7, 3, '#fbf7ee'); p(c, -2, y + 13, 5, 3, '#fbf7ee'); p(c, -1, y + 16, 3, 2, '#e0d9c8');
    }
    if (kind === 'tu') {
      p(c, -6, y - 2, 13, 2, '#7a3a2a'); p(c, -7, y, 15, 3, '#7a3a2a'); p(c, -7, y + 1, 15, 1, '#9a5038');
      p(c, -4, y + 8, 3, 1, '#b8b2a6'); p(c, 2, y + 8, 3, 1, '#b8b2a6'); p(c, -1, y + 9, 3, 3, '#d4cfc4');
    }
    if (kind === 'lai') {
      for (let i = 0; i < 7; i++) { const hw = 1 + i * 2; p(c, -hw, y - 5 + i, hw * 2 + 1, 1, i % 2 ? '#e8d9a0' : '#f0e4b4'); p(c, hw - 3, y - 5 + i, 3, 1, '#c4b078'); }
      p(c, -13, y + 2, 27, 1, '#a89460'); p(c, -3, y + 8, 2, 1, '#8a5a4a'); p(c, -6, y + 9, 1, 2, '#a83a2e'); p(c, 6, y + 9, 1, 2, '#a83a2e');
    }
    if (kind === 'mo') {
      p(c, -7, y, 15, 3, '#3a4a8a'); p(c, -5, y - 1, 11, 1, '#3a4a8a'); p(c, -8, y - 3, 3, 4, '#3a4a8a'); p(c, 6, y - 3, 3, 4, '#3a4a8a'); p(c, -7, y + 1, 15, 1, '#5468b0');
      p(c, -1, y + 8, 3, f % 2 ? 2 : 1, '#7a2a2a');
    }
    // tay và đồ cầm: mỗi người một động tác khi rảnh
    const sh = b0 + 2, A = N.robe, hwid = 5 + w;
    function arm(side, hx, hy) { line(c, side * (hwid + 1), sh, hx, hy, 3, side > 0 ? N.robe2 : A); p(c, hx - 1, hy - 1, 3, 3, MASK); }
    if (kind === 'ren') { // quai búa lên đe, toé lửa
      const Hh = [[11, -24], [13, -17], [11, -8]][f % 3];
      arm(-1, -9, -9); arm(1, Hh[0], Hh[1]);
      if (f % 3 === 0) { p(c, Hh[0], Hh[1] - 9, 2, 9, '#8a5a34'); p(c, Hh[0] - 3, Hh[1] - 14, 8, 6, '#9aa0aa'); p(c, Hh[0] - 3, Hh[1] - 14, 8, 2, '#c8ccd4'); }
      else if (f % 3 === 1) { line(c, Hh[0], Hh[1], Hh[0] + 6, Hh[1] - 6, 2, '#8a5a34'); p(c, Hh[0] + 4, Hh[1] - 11, 7, 7, '#9aa0aa'); p(c, Hh[0] + 4, Hh[1] - 11, 7, 2, '#c8ccd4'); }
      else { p(c, Hh[0], Hh[1], 8, 2, '#8a5a34'); p(c, Hh[0] + 7, Hh[1] - 2, 6, 8, '#9aa0aa'); p(c, Hh[0] + 7, Hh[1] - 2, 6, 2, '#c8ccd4'); p(c, 22, -11, 1, 2, '#ffe07a'); p(c, 25, -8, 2, 1, '#ffb040'); p(c, 16, -13, 1, 1, '#fff3b0'); p(c, 24, -14, 1, 1, '#ffe07a'); }
    }
    if (kind === 'xen') { // tung đồng xu
      arm(-1, -4, -8); arm(1, 4, -8);
      const cy = [-11, -17, -13][f % 3]; p(c, -1, cy, 3, 3, '#ffd23f'); p(c, 0, cy, 1, 1, '#fff3b0'); p(c, -3, -8, 2, 1, '#ffd23f'); if (f % 3 === 1) p(c, 3, -19, 1, 1, '#fff3b0');
    }
    if (kind === 'may') { // đưa thoi qua lại
      const d = [0, 2, 4][f % 3]; arm(-1, 6 + d, -13 + d); arm(1, 12 - d, -8 - d); p(c, 8, -11, 3, 1, '#ffd23f');
    }
    if (kind === 'do') { // vuốt râu rồi viết chữ
      if (f % 3 === 2) { arm(-1, -8, -7); arm(1, 10, -8); line(c, 10, -8, 13, -3, 1, '#8a5a34'); p(c, 13, -3, 1, 2, INK); }
      else { arm(-1, -8, -6); arm(1, 2, f % 3 ? -9 : -13); }
    }
    if (kind === 'tu') { // quét sân đình
      const d = [-3, 1, 5][f % 3]; arm(-1, -8, -10); arm(1, 8, -11);
      line(c, -8, -10, 8, -11, 1, '#8a5a34'); line(c, 8, -11, 12 + d, -3, 2, '#b08a4a'); for (let i = 0; i < 5; i++) p(c, 10 + d + i, -3 + (i % 2), 1, 3, i % 2 ? '#d8b860' : '#b08a4a');
      line(c, -8, -10, -12, -22, 1, '#8a5a34'); if (f % 3 === 2) { p(c, 20, -2, 1, 1, '#d9cdb8'); p(c, 22, -4, 1, 1, '#d9cdb8'); p(c, 24, -1, 1, 1, '#d9cdb8'); }
    }
    if (kind === 'lai') { // chống sào
      const d = [0, 1, 2][f % 3]; arm(-1, -8, -9); arm(1, 9 + d, -13 + d); line(c, 9 + d * 3, -36, 9 - d, 0, 2, '#b8a45a'); p(c, 8 + d, -14 + d, 3, 3, MASK);
    }
    if (kind === 'mo') { // gõ mõ, rao làng
      arm(-1, -9, -12); p(c, -13, -15, 7, 6, '#8a5a34'); p(c, -13, -15, 7, 1, '#b07a48'); p(c, -11, -12, 4, 1, '#3a2418');
      if (f % 2) { arm(1, -4, -17); line(c, -4, -17, -8, -18, 1, '#e8d9a0'); p(c, -16, -20, 2, 1, '#fff3b0'); p(c, -18, -17, 1, 2, '#fff3b0'); p(c, -15, -23, 1, 2, '#fff3b0'); }
      else { arm(1, 8, -18); line(c, 8, -18, 6, -25, 1, '#e8d9a0'); }
    }
  }
  const NCACHE = {};
  function npcSprite(kind, f, o) {
    o = o || {}; const id = kind + f + '|' + (o.look || 0) + (o.blink ? 'b' : '');
    return NCACHE[id] || (NCACHE[id] = outlined(64, 64, 30, 50, (c) => drawNpc(c, kind, f, o)));
  }
  function putNpc(c, kind, x, y, f, o, s) {
    s = s || 1; const sp = npcSprite(kind, f || 0, o);
    if (!(o && o.noShadow)) { c.fillStyle = 'rgba(10,8,20,0.35)'; c.fillRect(Math.round(x - 8 * s), Math.round(y - 1 * s), 16 * s, 3 * s); c.fillRect(Math.round(x - 6 * s), Math.round(y + 2 * s), 12 * s, s); }
    c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(x - sp.ox * s), Math.round(y - sp.oy * s), 64 * s, 64 * s);
  }
  // Dấu chấm than vàng "có việc mới"
  function bang(c, x, y) { x = Math.round(x); y = Math.round(y); p(c, x - 4, y - 11, 9, 11, INK); p(c, x - 3, y - 12, 7, 13, INK); p(c, x - 3, y - 10, 7, 9, '#ffd23f'); p(c, x - 2, y - 11, 5, 11, '#ffd23f'); p(c, x - 1, y - 9, 3, 5, '#7a2a12'); p(c, x - 1, y - 3, 3, 2, '#7a2a12'); }
  // Khuôn mặt một người (dùng cho dải lối tắt và khung thoại). ctx bất kỳ, s: số lần phóng.
  VS.face = function (ctx, k, cx, cy, s) {
    const sp = npcSprite(k, 0, { look: 1 }), ty = 50 + NPCS[k].top - 6;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(sp.cv, 19, ty, 23, 20, cx - 11.5 * s, cy - 10 * s, 23 * s, 20 * s);
  };
  // Vẽ một người cỡ lớn (đứng cạnh bảng). (x, y) là chân.
  VS.bigNpc = function (ctx, k, x, y, s, f) { const sv = ctx.imageSmoothingEnabled; putNpc(ctx, k, x, y, f || 0, { look: 1, noShadow: true }, s); ctx.imageSmoothingEnabled = sv; };

  // ======================= công trình =======================
  function thatch(c, x, y, w, h) {
    for (let i = 0; i < h; i++) { const k = i / h, ins = Math.round((1 - k) * 6); p(c, x + ins, y + i, w - ins * 2, 1, i % 3 === 0 ? '#b8923f' : '#d4ae56'); }
    for (let i = 0; i < w; i += 3) p(c, x + i, y + h - 2 + ((i / 3) % 2), 2, 3, '#a07a30');
    p(c, x + 6, y, w - 12, 2, '#8a6628'); p(c, x, y + h + 1, w, 2, 'rgba(10,8,20,0.35)');
  }
  function lantern(c, x, y) { p(c, x, y - 2, 1, 2, '#3a2a26'); p(c, x - 2, y, 5, 6, '#e8402e'); p(c, x - 1, y + 1, 3, 4, '#ffb040'); p(c, x - 2, y, 5, 1, '#8a2a1e'); p(c, x - 2, y + 5, 5, 1, '#8a2a1e'); p(c, x, y + 6, 1, 2, '#ffd23f'); }
  function lampPost(c, x, y) { p(c, x, y - 26, 2, 26, '#4a3428'); p(c, x - 5, y - 26, 8, 2, '#4a3428'); lantern(c, x - 4, y - 23); }
  function dinh(c, x, y) {
    p(c, x - 56, y - 6, 112, 6, '#8e8a80'); p(c, x - 56, y - 6, 112, 1, '#b4b0a4'); p(c, x - 14, y - 3, 28, 3, '#a6a296'); p(c, x - 56, y - 1, 112, 1, '#5e5a58');
    p(c, x - 48, y - 34, 96, 28, '#5a3426'); for (let i = 0; i < 6; i++) p(c, x - 48 + i * 18 + (i > 2 ? 2 : 0), y - 34, 4, 28, '#a8382a');
    p(c, x - 10, y - 30, 20, 24, '#1c1418'); p(c, x - 6, y - 16, 12, 10, '#5a2a1e'); p(c, x - 4, y - 20, 8, 4, '#ffd23f'); p(c, x - 1, y - 24, 2, 4, '#ffb040'); p(c, x - 7, y - 12, 14, 1, '#c9a24f');
    p(c, x - 40, y - 28, 12, 14, '#3a2018'); p(c, x + 28, y - 28, 12, 14, '#3a2018'); for (let i = 0; i < 3; i++) { p(c, x - 38 + i * 4, y - 27, 1, 12, '#7a4a30'); p(c, x + 30 + i * 4, y - 27, 1, 12, '#7a4a30'); }
    for (let i = 0; i < 26; i++) { const k = i / 25, hw = Math.round(36 + k * k * 26 + k * 2); p(c, x - hw, y - 60 + i, hw * 2, 1, i % 4 === 3 ? '#5e241d' : '#8a3a2e'); if (i % 4 !== 3) for (let j = -hw + (i % 2) * 3; j < hw; j += 6) p(c, x + j, y - 60 + i, 1, 1, '#742e24'); }
    p(c, x - 68, y - 38, 6, 3, '#8a3a2e'); p(c, x - 71, y - 41, 5, 3, '#8a3a2e'); p(c, x - 72, y - 44, 3, 3, '#5e241d'); p(c, x + 62, y - 38, 6, 3, '#8a3a2e'); p(c, x + 66, y - 41, 5, 3, '#8a3a2e'); p(c, x + 69, y - 44, 3, 3, '#5e241d');
    p(c, x - 38, y - 63, 76, 4, '#3a2a2e'); p(c, x - 41, y - 66, 5, 4, '#3a2a2e'); p(c, x + 36, y - 66, 5, 4, '#3a2a2e'); ell(c, x, y - 66, 4, 4, '#ffd23f'); ell(c, x, y - 66, 2, 2, '#e8402e');
    p(c, x - 64, y - 34, 128, 2, 'rgba(10,8,20,0.4)'); lantern(c, x - 30, y - 32); lantern(c, x + 30, y - 32);
  }
  function cayDa(c, x, y) {
    const rd = rng(7);
    for (const dx of [-24, -17, 19, 27, 33]) p(c, x + dx, y - 44, 1, 40 + Math.round(rd() * 4), '#4a3428');
    p(c, x - 9, y - 40, 18, 40, '#5e4432'); p(c, x - 9, y - 40, 4, 40, '#74563e'); p(c, x + 5, y - 40, 4, 40, '#46301f'); p(c, x - 14, y - 6, 28, 6, '#5e4432'); p(c, x - 17, y - 2, 34, 2, '#46301f'); p(c, x - 2, y - 30, 3, 14, '#46301f');
    const blobs = [[-30, -52, 18, 13], [28, -54, 20, 13], [0, -62, 26, 16], [-16, -70, 18, 11], [18, -72, 17, 10], [-40, -44, 10, 7], [42, -44, 10, 7], [0, -48, 20, 9]];
    for (const b of blobs) ell(c, x + b[0], y + b[1] + 3, b[2], b[3], '#1c3a2c');
    for (const b of blobs) ell(c, x + b[0], y + b[1], b[2], b[3], '#2f6a44');
    for (const b of blobs) ell(c, x + b[0] - 3, y + b[1] - 3, b[2] - 5, b[3] - 4, '#44884f');
    for (let i = 0; i < 40; i++) { const b = blobs[Math.floor(rd() * blobs.length)]; p(c, x + b[0] + (rd() - 0.5) * b[2] * 1.5, y + b[1] + (rd() - 0.6) * b[3] * 1.4, 2, 1, rd() > 0.5 ? '#58a05a' : '#234a34'); }
    p(c, x - 9, y - 22, 18, 2, '#d8482e'); p(c, x + 7, y - 20, 2, 5, '#d8482e');
    lantern(c, x - 34, y - 38); lantern(c, x + 38, y - 40); lantern(c, x - 14, y - 44);
  }
  function loRen(c, x, y) {
    p(c, x - 24, y - 70, 10, 20, '#6a4a44'); p(c, x - 25, y - 71, 12, 3, '#4a3230');
    p(c, x - 32, y - 36, 34, 34, '#7a4a40'); for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) p(c, x - 32 + j * 8 - (i % 2) * 4, y - 36 + i * 6, 7, 1, '#5a3430');
    p(c, x - 26, y - 24, 20, 18, '#2a1818'); p(c, x - 24, y - 20, 16, 14, '#e8562a'); p(c, x - 22, y - 16, 12, 10, '#ffb040'); p(c, x - 19, y - 12, 6, 6, '#fff3b0'); p(c, x - 21, y - 22, 2, 3, '#ffb040'); p(c, x - 13, y - 23, 2, 4, '#ffd23f');
    p(c, x - 34, y - 2, 38, 2, '#4a3230');
    p(c, x - 36, y - 40, 3, 40, '#5e4432'); p(c, x + 34, y - 40, 3, 40, '#5e4432');
    p(c, x + 22, y - 26, 12, 2, '#5e4432'); p(c, x + 24, y - 24, 2, 20, '#c8ccd4'); p(c, x + 23, y - 8, 4, 1, '#c9a24f'); p(c, x + 29, y - 24, 2, 16, '#9aa0aa'); p(c, x + 28, y - 26, 4, 3, '#8a5a34');
    thatch(c, x - 42, y - 58, 84, 20);
    lantern(c, x + 30, y - 36);
  }
  function de(c, x, y) { p(c, x - 5, y - 4, 10, 4, '#5e4432'); p(c, x - 3, y - 8, 7, 4, '#4a4a54'); p(c, x - 7, y - 12, 15, 4, '#6a6a76'); p(c, x - 7, y - 12, 15, 1, '#9aa0aa'); p(c, x + 8, y - 11, 3, 2, '#6a6a76'); p(c, x - 1, y - 13, 5, 1, '#ffb040'); }
  function hangXen(c, x, y) {
    p(c, x - 1, y - 40, 2, 40, '#6a4a34'); ell(c, x, y - 40, 22, 7, '#b8822a'); ell(c, x, y - 42, 20, 6, '#e8b040'); for (let i = -3; i <= 3; i++) line(c, x, y - 47, x + i * 6, y - 37, 1, '#b8822a'); p(c, x - 1, y - 49, 3, 3, '#d8482e');
    p(c, x + 8, y - 6, 28, 12, '#a8553a'); p(c, x + 8, y - 6, 28, 1, '#c87050'); p(c, x + 8, y + 5, 28, 1, '#7a3a26');
    const cols = ['#6fc0d0', '#ffd23f', '#f08aa8', '#9be07a', '#f4eee0', '#d48af5'];
    for (let i = 0; i < 6; i++) p(c, x + 11 + (i % 3) * 8, y - 4 + Math.floor(i / 3) * 5, 4, 3, cols[i]);
    ell(c, x - 22, y - 3, 8, 4, '#8a6a34'); ell(c, x - 22, y - 5, 8, 3, '#c9a24f'); p(c, x - 26, y - 7, 3, 2, '#d8482e'); p(c, x - 21, y - 8, 3, 3, '#9be07a'); p(c, x - 18, y - 6, 2, 2, '#ffd23f');
    line(c, x - 30, y - 5, x - 22, y - 20, 1, '#6a4a34'); line(c, x - 14, y - 5, x - 22, y - 20, 1, '#6a4a34'); line(c, x - 36, y - 18, x - 8, y - 22, 2, '#b8a45a');
    p(c, x + 12, y - 24, 20, 13, '#6a4428'); p(c, x + 12, y - 24, 20, 5, '#8a5a34'); p(c, x + 12, y - 19, 20, 1, '#3a2418'); p(c, x + 20, y - 21, 4, 5, '#ffd23f'); p(c, x + 12, y - 24, 2, 13, '#c9a24f'); p(c, x + 30, y - 24, 2, 13, '#c9a24f');
  }
  function nhaMay(c, x, y) {
    p(c, x - 30, y - 34, 60, 32, '#c4a46c'); p(c, x - 30, y - 34, 60, 3, '#8a6e44'); p(c, x - 30, y - 4, 60, 2, '#8a6e44'); p(c, x - 8, y - 26, 14, 24, '#2a1c18'); p(c, x - 8, y - 26, 14, 2, '#5e4432');
    p(c, x + 12, y - 26, 12, 10, '#3a2a22'); p(c, x + 17, y - 26, 1, 10, '#8a6e44'); p(c, x + 12, y - 21, 12, 1, '#8a6e44');
    thatch(c, x - 38, y - 56, 76, 24);
    lantern(c, x - 20, y - 30);
  }
  function khungCui(c, x, y, f) {
    p(c, x - 10, y - 20, 2, 20, '#8a5a34'); p(c, x + 10, y - 22, 2, 22, '#8a5a34'); p(c, x - 10, y - 20, 22, 2, '#a8703f'); p(c, x - 12, y - 2, 26, 2, '#6a4428');
    for (let i = 0; i < 8; i++) p(c, x - 7 + i * 2, y - 18, 1, 9, '#f4eee0');
    p(c, x - 8, y - 9, 18, 6, '#f08aa8'); p(c, x - 8, y - 9, 18, 1, '#ffd0dc'); p(c, x - 8, y - 6, 18, 1, '#6fc0d0'); p(c, x - 6 + f * 5, y - 12, 5, 2, '#ffd23f');
    p(c, x + 12, y - 16, 4, 12, '#6fc0d0'); p(c, x + 12, y - 16, 4, 2, '#f4eee0');
  }
  function dayPhoi(c, x, y, w) {
    p(c, x, y - 26, 2, 26, '#b8a45a'); p(c, x + w, y - 26, 2, 26, '#b8a45a'); p(c, x, y - 24, w, 1, '#d9cdb8');
    const cols = ['#d8482e', '#6fc0d0', '#ffd23f', '#9be07a']; const n = Math.floor((w - 6) / 10);
    for (let i = 0; i < n; i++) { const xx = x + 5 + i * 10; p(c, xx, y - 23, 7, 9, cols[i % 4]); p(c, xx - 2, y - 23, 11, 3, cols[i % 4]); p(c, xx + 2, y - 23, 3, 2, '#1a1420'); }
  }
  function gieng(c, x, y) {
    ell(c, x, y - 4, 13, 7, '#5e5a58'); ell(c, x, y - 7, 13, 7, '#9a968a'); ell(c, x, y - 8, 12, 6, '#b4b0a4'); ell(c, x, y - 7, 9, 4, '#16283a'); ell(c, x - 2, y - 6, 4, 1, '#3a6a8a');
    p(c, x + 14, y - 8, 6, 7, '#8a5a34'); p(c, x + 14, y - 8, 6, 1, '#c9a24f'); p(c, x + 13, y - 11, 8, 1, '#6a4a34');
  }
  function coc(c, x, y) { p(c, x - 3, y - 4, 6, 4, '#5a8a3a'); p(c, x - 3, y - 6, 2, 2, '#7ab04a'); p(c, x + 1, y - 6, 2, 2, '#7ab04a'); p(c, x - 3, y - 5, 1, 1, INK); p(c, x + 2, y - 5, 1, 1, INK); p(c, x - 4, y - 1, 8, 1, '#3a5a26'); }
  function aoSen(c, x, y, rx, ry) {
    ell(c, x, y + 2, rx + 2, ry + 1, '#2a2a2e'); ell(c, x, y, rx, ry, '#24465c'); ell(c, x - 3, y - 2, rx - 5, ry - 4, '#2e5870');
    const rd = rng(rx * 31 + 5);
    for (let i = 0; i < Math.round(rx / 3.5); i++) { const a = rd() * 6.28, r = Math.sqrt(rd()) * 0.8, px = x + Math.cos(a) * r * rx, py = y + Math.sin(a) * r * ry; ell(c, px, py, 3, 1, '#3f8a4c'); p(c, px - 1, py - 1, 2, 1, '#58a05a'); if (i % 2 === 0) { p(c, px + 1, py - 4, 3, 3, '#f08aa8'); p(c, px + 2, py - 5, 1, 2, '#ffd0dc'); p(c, px + 2, py - 2, 1, 1, '#ffd23f'); } }
    for (let i = 0; i < 4; i++) p(c, x - rx * 0.5 + i * rx * 0.3, y + ry * 0.4 - (i % 2) * 6, 5, 1, '#4a80a0');
  }
  function cong(c, x, y) {
    p(c, x - 13, y - 44, 26, 44, '#141018'); p(c, x - 9, y - 30, 18, 30, '#5a4a40'); p(c, x - 5, y - 20, 10, 20, '#6e5a4c');
    for (const s of [-1, 1]) { const px = x + s * 18 - 6; p(c, px, y - 46, 12, 46, '#9a6a54'); for (let i = 0; i < 8; i++) p(c, px + (i % 2) * 5, y - 44 + i * 6, 6, 1, '#7a4e3e'); p(c, px + 9, y - 46, 3, 46, '#7a4e3e'); p(c, px - 2, y - 50, 16, 4, '#8a3a2e'); p(c, px, y - 53, 12, 3, '#5e241d'); }
    p(c, x - 22, y - 46, 44, 8, '#9a6a54'); p(c, x - 12, y - 45, 24, 6, '#3a2a2e'); p(c, x - 9, y - 43, 18, 2, '#ffd23f');
    p(c, x - 28, y - 52, 56, 4, '#8a3a2e'); p(c, x - 24, y - 56, 48, 4, '#5e241d'); p(c, x - 31, y - 54, 4, 2, '#8a3a2e'); p(c, x + 27, y - 54, 4, 2, '#8a3a2e');
    lantern(c, x - 27, y - 30); lantern(c, x + 27, y - 30);
  }
  function thuyen(c, x, y) {
    ell(c, x, y + 1, 24, 5, '#16283a'); ell(c, x, y - 2, 23, 5, '#4a3020'); ell(c, x, y - 4, 21, 3, '#7a5234'); p(c, x - 24, y - 6, 4, 3, '#4a3020'); p(c, x + 21, y - 6, 4, 3, '#4a3020');
    for (let i = 0; i < 7; i++) { const hw = 4 + i; p(c, x - hw, y - 15 + i, hw * 2, 1, i % 2 ? '#b8923f' : '#d4ae56'); } p(c, x - 4, y - 9, 8, 4, '#2a1c18');
    p(c, x + 18, y - 18, 1, 13, '#4a3020'); lantern(c, x + 16, y - 17);
  }
  function cau(c, x, y, w) { p(c, x, y - 4, w, 12, '#7a5a3c'); for (let i = 0; i < w; i += 6) p(c, x + i, y - 4, 1, 12, '#5a4028'); p(c, x, y - 4, w, 1, '#a07a50'); p(c, x, y + 8, w, 2, '#3a2a1e'); p(c, x + w - 3, y - 10, 3, 8, '#5a4028'); p(c, x + w - 3, y + 4, 3, 8, '#5a4028'); }
  function bangTranh(c, x, y) { p(c, x - 9, y - 22, 2, 22, '#5e4432'); p(c, x + 8, y - 22, 2, 22, '#5e4432'); p(c, x - 11, y - 24, 23, 16, '#8a5a34'); p(c, x - 9, y - 22, 19, 12, '#e8dcb8'); p(c, x - 6, y - 14, 2, 2, '#d8482e'); p(c, x - 2, y - 18, 2, 2, '#d8482e'); p(c, x + 3, y - 15, 2, 2, '#d8482e'); p(c, x + 6, y - 20, 2, 2, '#3a2a2e'); line(c, x - 5, y - 13, x - 1, y - 17, 1, '#8a6a48'); line(c, x - 1, y - 17, x + 4, y - 14, 1, '#8a6a48'); line(c, x + 4, y - 14, x + 7, y - 19, 1, '#8a6a48'); }
  function cayRom(c, x, y) { ell(c, x, y - 3, 13, 4, '#8a6628'); for (let i = 0; i < 20; i++) { const hw = Math.round(4 + Math.sqrt(i / 20) * 9); p(c, x - hw, y - 24 + i, hw * 2, 1, i % 3 ? '#d4ae56' : '#b8923f'); } p(c, x - 1, y - 30, 2, 8, '#6a4a34'); ell(c, x, y - 25, 4, 2, '#e4c470'); }
  function chum(c, x, y) { ell(c, x, y - 5, 5, 5, '#6a4034'); ell(c, x - 1, y - 6, 3, 3, '#8a5646'); p(c, x - 3, y - 11, 7, 2, '#4a2c24'); }
  function ga(c, x, y, col, peck) { const d = peck ? 2 : 0; p(c, x - 3, y - 4, 6, 3, col || '#f4eee0'); p(c, x + 2, y - 6 + d, 2, 3, col || '#f4eee0'); p(c, x + 2, y - 7 + d, 2, 1, '#d8482e'); p(c, x + 4, y - 5 + d, 1, 1, '#ffb040'); p(c, x - 4, y - 5, 2, 2, col || '#f4eee0'); p(c, x - 1, y - 1, 1, 1, '#ffb040'); p(c, x + 1, y - 1, 1, 1, '#ffb040'); }
  function chieu(c, x, y) { p(c, x - 14, y - 5, 28, 9, '#c8a060'); p(c, x - 14, y - 5, 28, 1, '#e0c080'); p(c, x - 14, y + 3, 28, 1, '#8a6a38'); p(c, x + 4, y - 3, 8, 6, '#d8482e'); p(c, x + 6, y - 2, 1, 3, INK); p(c, x + 8, y - 1, 2, 1, INK); p(c, x - 12, y - 3, 4, 3, '#2a2230'); p(c, x - 12, y + 1, 9, 2, '#e8dcb8'); }
  function glow(c, x, y, r, col) { for (let i = 3; i >= 1; i--) ell(c, x, y, Math.round((r * i) / 3), Math.round((r * i) / 4.4), col || 'rgba(255,150,60,0.07)'); }

  // ======================= bố cục làng (phương án A đã duyệt) =======================
  const B = {
    cong: [64, 60], dinh: [196, 116], be: [[186, 134], [206, 142], [226, 134]], da: [338, 128], gieng: [296, 196],
    ren: [462, 112], xen: [552, 196], may: [594, 108], cui: [592, 132], phoi: [520, 104, 38], song: 652,
    cau: [636, 156, 36], thuyen: [694, 178], tranh: [618, 196], ao: [86, 228, 58, 24], rom: [404, 240],
    den: [[262, 152], [420, 180], [130, 190]], yM: 160,
  };
  const bo = (y) => B.song + Math.round(Math.sin(y * 0.06) * 5 + Math.sin(y * 0.17) * 2); // mép bờ sông tại dòng y
  function grass(c) {
    p(c, 0, 0, W, H, '#3a5a40'); const rd = rng(W);
    for (let i = 0; i < W * 0.9; i++) { const x = rd() * W, y = 56 + rd() * 214, k = rd(); if (k < 0.35) ell(c, x, y, 6 + rd() * 14, 3 + rd() * 5, k < 0.18 ? '#345238' : '#40624a'); }
    for (let i = 0; i < W * 1.6; i++) { const x = rd() * W, y = 58 + rd() * 212, k = rd(); if (k < 0.5) { p(c, x, y, 1, 2, '#4f7a52'); p(c, x + 1, y + 1, 1, 1, '#4f7a52'); } else if (k < 0.8) p(c, x, y, 2, 1, '#2e4a36'); else if (k < 0.9) p(c, x, y, 1, 1, '#f4eee0'); else p(c, x, y, 1, 1, '#ffd23f'); }
  }
  function path(c, pts, r, seed) {
    const rd = rng(seed || 9);
    for (const pass of [0, 1, 2]) for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4); for (let j = 0; j <= n; j++) { const x = a[0] + ((b[0] - a[0]) * j) / n, y = a[1] + ((b[1] - a[1]) * j) / n, rr2 = r + Math.round(Math.sin(x * 0.11 + y * 0.07) * 2); if (pass === 0) ell(c, x, y + 1, rr2 + 2, Math.round(rr2 * 0.6) + 1, '#5a4a3c'); else if (pass === 1) ell(c, x, y, rr2, Math.round(rr2 * 0.6), '#8a705a'); else if (rd() < 0.5) p(c, x + (rd() - 0.5) * rr2 * 1.6, y + (rd() - 0.5) * rr2, rd() < 0.5 ? 2 : 1, 1, rd() < 0.5 ? '#a08670' : '#70584a'); } }
  }
  function hedge(c) {
    p(c, 0, 0, W, 54, '#16261e'); const rd = rng(21);
    for (let x = 0; x < W; x += 5) { const h = 30 + rd() * 22; p(c, x + rd() * 3, 54 - h, 2, h, rd() < 0.5 ? '#4a7a48' : '#3a6240'); if (rd() < 0.6) p(c, x, 54 - h * rd(), 3, 1, '#2a4a34'); }
    for (let i = 0; i < W / 3; i++) { const x = rd() * W, y = rd() * 40; ell(c, x, y, 5 + rd() * 6, 2 + rd() * 3, rd() < 0.5 ? '#244a34' : '#2e5a3c'); }
    for (let i = 0; i < W / 4; i++) { const x = rd() * W, y = rd() * 46; p(c, x, y, 3, 1, '#4f8a52'); p(c, x + 1, y + 1, 3, 1, '#3a6a44'); }
    p(c, 0, 52, W, 3, '#101a16'); p(c, 0, 55, W, 2, '#2e4a36');
  }
  function river(c) {
    for (let y = 0; y < H; y++) { const e = bo(y); p(c, e - 3, y, 3, 1, '#6a5a44'); p(c, e, y, W - e, 1, '#24465c'); p(c, e, y, 2, 1, '#3a6a8a'); }
    const rd = rng(5); for (let i = 0; i < 40; i++) { const x = B.song + 8 + rd() * (W - B.song - 12), y = rd() * H; p(c, x, y, 4 + rd() * 5, 1, rd() < 0.5 ? '#2e5870' : '#4a80a0'); }
    for (let i = 0; i < 5; i++) { const y = 20 + i * 52 + rd() * 20, e = B.song + Math.round(Math.sin(y * 0.06) * 5); p(c, e - 5, y - 9, 1, 10, '#4f7a52'); p(c, e - 7, y - 7, 1, 8, '#3a6240'); p(c, e - 3, y - 6, 1, 7, '#4f7a52'); p(c, e - 5, y - 11, 1, 2, '#8a5a34'); }
  }
  const NIGHT = '#b6b0dc'; // trời chạng vạng: nhân màu này lên nền và công trình, người thì giữ sáng
  function tint(cv) {
    const [o, oc] = mk(cv.width, cv.height);
    oc.drawImage(cv, 0, 0); oc.globalCompositeOperation = 'multiply'; oc.fillStyle = NIGHT; oc.fillRect(0, 0, o.width, o.height);
    oc.globalCompositeOperation = 'destination-in'; oc.drawImage(cv, 0, 0);
    return o;
  }
  // Vẽ một vật vào canvas tạm cỡ cả làng rồi cắt sát hình. Trả về { cv, x, y0, y } với y là chân vật (để xếp trước sau).
  let TMP = null;
  function sprite(baseY, draw, bright) {
    if (!TMP) TMP = mk(W, H);
    const cv = TMP[0], c = TMP[1];
    c.clearRect(0, 0, W, H); draw(c);
    const d = c.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const [o, oc] = mk(x1 - x0 + 1, y1 - y0 + 1);
    oc.drawImage(cv, -x0, -y0);
    return { cv: bright ? o : tint(o), x: x0, y0, y: baseY };
  }
  let BUILT = null;
  function build() {
    if (BUILT) return BUILT;
    const [gcv, g] = mk(W, H);
    grass(g); hedge(g); river(g);
    const yM = B.yM, dx = B.dinh[0], dy = B.dinh[1], rN = NPCS.ren.pos, xN = NPCS.xen.pos, mN = NPCS.may.pos;
    path(g, [[B.cong[0], 58], [B.cong[0] + 6, yM - 20], [B.cong[0] + 40, yM], [dx, yM + 6], [B.da[0], yM + 2], [B.ren[0], yM], [628, yM]], 9, 4);
    path(g, [[dx, dy], [dx, yM + 4]], 8, 5); path(g, [[rN[0], rN[1]], [rN[0], yM]], 8, 6);
    path(g, [[B.gieng[0], yM], [B.gieng[0], B.gieng[1]]], 7, 7); path(g, [[xN[0] + 6, yM], [xN[0] + 10, xN[1] + 4]], 9, 8);
    path(g, [[mN[0] + 6, mN[1]], [mN[0] + 6, yM]], 8, 10);
    // sân đình lát gạch
    p(g, dx - 60, dy, 120, 34, '#7a5e52'); for (let i = 0; i < 5; i++) for (let j = 0; j < 15; j++) p(g, dx - 60 + j * 8 + (i % 2) * 4, dy + i * 7, 7, 6, (i + j) % 3 ? '#96705e' : '#a47c68'); p(g, dx - 60, dy + 34, 120, 1, '#4a3a34');
    aoSen(g, B.ao[0], B.ao[1], B.ao[2], B.ao[3]);
    cau(g, B.cau[0], B.cau[1], B.cau[2]); // cầu bến đò nằm sát đất, em bé đứng lên trên
    chieu(g, NPCS.do.pos[0] + 4, NPCS.do.pos[1]);
    const ground = tint(gcv);
    // các vật đứng: xếp trước sau với người theo chân vật
    const objs = [];
    const add = (y, fn, bright) => { const s = sprite(y, fn, bright); if (s) objs.push(s); return s; };
    add(58, (c) => cong(c, B.cong[0], B.cong[1]));
    add(dy, (c) => dinh(c, dx, dy));
    add(B.da[1], (c) => cayDa(c, B.da[0], B.da[1]));
    add(B.ren[1], (c) => loRen(c, B.ren[0], B.ren[1]));
    add(rN[1] - 1, (c) => de(c, rN[0] + 20, rN[1] + 1));
    add(B.xen[1] - 2, (c) => hangXen(c, B.xen[0], B.xen[1]));
    add(B.may[1], (c) => nhaMay(c, B.may[0], B.may[1]));
    const cui = [0, 1, 2].map((f) => sprite(B.cui[1] + 1, (c) => khungCui(c, B.cui[0], B.cui[1] + 1, f)));
    add(B.phoi[1], (c) => dayPhoi(c, B.phoi[0], B.phoi[1], B.phoi[2]));
    add(B.gieng[1], (c) => gieng(c, B.gieng[0], B.gieng[1]));
    const thuyenS = sprite(B.thuyen[1], (c) => thuyen(c, B.thuyen[0], B.thuyen[1]));
    add(B.tranh[1], (c) => bangTranh(c, B.tranh[0], B.tranh[1]));
    add(B.rom[1], (c) => cayRom(c, B.rom[0], B.rom[1]));
    add(B.rom[1] + 2, (c) => { chum(c, B.rom[0] + 22, B.rom[1] + 2); chum(c, B.rom[0] + 32, B.rom[1] - 2); });
    for (const q of B.den) add(q[1], (c) => lampPost(c, q[0], q[1]));
    // quầng sáng đèn lồng, lò rèn: vẽ sẵn một lớp, lúc chạy cộng sáng lên cảnh
    const [lcv, l] = mk(W, H);
    glow(l, B.ren[0] - 16, B.ren[1] - 6, 46, 'rgba(255,130,50,0.10)'); glow(l, dx, dy - 4, 60); glow(l, B.da[0], B.da[1] - 14, 54); glow(l, B.cong[0], 44, 40);
    glow(l, B.may[0] - 10, B.may[1], 40); glow(l, B.thuyen[0] + 10, B.thuyen[1] - 6, 30); glow(l, B.tranh[0], B.tranh[1] - 12, 26, 'rgba(255,190,80,0.05)'); glow(l, B.xen[0], B.xen[1] - 10, 30, 'rgba(255,190,80,0.05)');
    for (const q of B.den) glow(l, q[0] - 4, q[1] - 12, 30);
    const rd = rng(77), flies = [];
    for (let i = 0; i < W / 14; i++) flies.push([rd() * W, 40 + rd() * 220, rd() * 6.28, 0.5 + rd()]);
    BUILT = { ground, objs, cui, thuyenS, light: lcv, flies };
    return BUILT;
  }

  // ======================= chỗ không đi được =======================
  // [x0, y0, x1, y1] theo chân em bé
  const RECTS = [
    [138, 56, 254, 113], // đình
    [321, 115, 355, 131], // gốc đa
    [423, 56, 501, 113], // lò rèn
    [478, 118, 500, 135], // đe
    [561, 56, 627, 109], // nhà thợ may
    [579, 122, 610, 135], // khung cửi
    [517, 99, 561, 106], // dây phơi
    [557, 170, 592, 203], // rương và chiếu hàng
    [520, 186, 537, 197], // quang gánh
    [281, 183, 319, 198], // giếng
    [390, 230, 418, 243], [420, 233, 442, 244], // cây rơm, chum
    [606, 191, 630, 198], // bảng tranh
    [36, 56, 52, 62], [76, 56, 92, 62], // trụ cổng
    [259, 149, 266, 154], [417, 177, 424, 182], [127, 187, 134, 192], // cột đèn
  ];
  function seats() { // ba bé không được chọn ngồi chơi ở sân đình
    const keys = (G.HKEYS || []).filter((k) => G.save && k !== G.save.hero);
    return keys.slice(0, 3).map((k, i) => ({ key: k, x: B.be[i][0], y: B.be[i][1] }));
  }
  function blocked(x, y) {
    if (x < 8 || y < 62 || y > 250) return true;
    const onDock = x >= B.cau[0] - 2 && x <= B.cau[0] + B.cau[2] - 5 && y >= B.cau[1] - 5 && y <= B.cau[1] + 9;
    if (!onDock && x > bo(y) - 6) return true;
    for (const r of RECTS) if (x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]) return true;
    const a = B.ao, ex = (x - a[0]) / (a[2] + 4), ey = (y - a[1]) / (a[3] + 4);
    if (ex * ex + ey * ey < 1) return true;
    for (const k of ORDER) { const q = NPCS[k].pos; if (Math.hypot(x - q[0], (y - q[1]) * 1.5) < 7) return true; }
    for (const q of B.be) if (Math.hypot(x - q[0], (y - q[1]) * 1.5) < 6) return true;
    return false;
  }
  VS.blocked = blocked;
  // Tìm đường trên lưới ô 6 điểm (tìm theo chiều rộng), rồi bỏ bớt điểm giữa khi đi thẳng được.
  const CELL = 6, GC = Math.ceil(W / CELL), GR = Math.ceil(H / CELL);
  const cellFree = (i, j) => i >= 0 && j >= 0 && i < GC && j < GR && !blocked(i * CELL + 3, j * CELL + 3);
  function clear(x0, y0, x1, y1) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3); for (let i = 1; i <= n; i++) if (blocked(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n)) return false; return true; }
  function findPath(x0, y0, x1, y1) {
    if (clear(x0, y0, x1, y1)) return [[x1, y1]];
    const near = (x, y) => { // ô trống gần nhất
      const ci = G.clamp(Math.floor(x / CELL), 0, GC - 1), cj = G.clamp(Math.floor(y / CELL), 0, GR - 1);
      for (let r = 0; r < 12; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) if ((Math.abs(i - ci) === r || Math.abs(j - cj) === r) && cellFree(i, j)) return [i, j];
      return null;
    };
    const s = near(x0, y0), t = near(x1, y1);
    if (!s || !t) return null;
    const prev = new Int32Array(GC * GR).fill(-1), q = [s[1] * GC + s[0]];
    prev[q[0]] = q[0];
    const goal = t[1] * GC + t[0];
    for (let h = 0; h < q.length; h++) {
      const cur = q[h]; if (cur === goal) break;
      const ci = cur % GC, cj = (cur / GC) | 0;
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const ni = ci + d[0], nj = cj + d[1], id = nj * GC + ni;
        if (!cellFree(ni, nj) || prev[id] >= 0) continue;
        if (d[0] && d[1] && (!cellFree(ci + d[0], cj) || !cellFree(ci, cj + d[1]))) continue;
        prev[id] = cur; q.push(id);
      }
    }
    if (prev[goal] < 0) return null;
    let pts = [];
    for (let cur = goal; ; cur = prev[cur]) { pts.push([(cur % GC) * CELL + 3, ((cur / GC) | 0) * CELL + 3]); if (prev[cur] === cur) break; }
    pts.reverse();
    if (!blocked(x1, y1)) pts.push([x1, y1]);
    const out = []; let ax = x0, ay = y0, i = 0;
    while (i < pts.length) { let j = pts.length - 1; while (j > i && !clear(ax, ay, pts[j][0], pts[j][1])) j--; out.push(pts[j]); ax = pts[j][0]; ay = pts[j][1]; i = j + 1; }
    return out;
  }

  // ======================= trạng thái =======================
  const S = (VS.state = {
    x: 610, y: 166, face: -1, moving: false, cam: 240, t: 0,
    path: null, goal: null, // goal: { kind: 'npc' | 'kid' | 'weapon', id, open }
    near: null, talk: null, bubble: null, // bubble: { who, s, t }
    wp: [{ x: 0, y: 0 }, { x: 0, y: 0 }], joy: null, tapT: 0, frogT: 0, msg: null, msgT: 0, news: {}, newsT: 0, hintT: 0,
  });
  const SPEED = 108, KY = 0.75; // ở làng em bé chạy nhanh gấp rưỡi trong trận (72)
  const btnAt = () => [430 + (G.cx || 0), 220 + (G.cy || 0), 28];
  VS.btnAt = btnAt;
  // Dải bảy khuôn mặt: vị trí khuôn thứ i trên màn hình
  const STRIP = { y: 28, r: 10, gap: 31 };
  function stripAt(i) { return [240 - ((ORDER.length - 1) * STRIP.gap) / 2 + i * STRIP.gap, STRIP.y]; }
  VS.stripAt = stripAt;

  // Người nào đang có việc mới. Mốc "đã xem" ghi vào save.tut.lang (bản lưu cũ không có thì coi như chưa xem gì).
  function seen() { const sv = G.save; if (!sv.tut || typeof sv.tut !== 'object') sv.tut = {}; if (!sv.tut.lang || typeof sv.tut.lang !== 'object') sv.tut.lang = {}; return sv.tut.lang; }
  function counts() {
    const sv = G.save, o = sv.owned || {};
    return {
      lai: Object.keys(sv.stars || {}).length + Object.keys(sv.stars2 || {}).length + 1,
      xen: sv.nextId || 0,
      may: ['helm', 'armor', 'charm'].reduce((n, k) => n + ((o[k] || []).length), 0),
      tu: (G.HKEYS || []).filter((k) => sv.heroes[k] && sv.heroes[k].unlocked).length,
      mo: 1,
    };
  }
  function checkNews() {
    const sv = G.save, sn = seen(), c = counts(), n = {};
    for (const k in c) n[k] = c[k] > (sn[k] || 0);
    try {
      const hs = sv.heroes[sv.hero];
      n.do = Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem) > 0;
      // thợ rèn: đủ nguyên liệu để mài một món đang mang, nâng lò, hoặc nâng bậc
      const pay = G.villageApi && G.villageApi.canPay;
      n.ren = false;
      if (pay) {
        const up = G.FORGE_UP && G.FORGE_UP[sv.forge];
        if (up && pay(up)) n.ren = true;
        for (const id of sv.carry) {
          const w = G.weaponById(id); if (!w) continue;
          if (w.sharpen < Math.min(10, G.FORGE_CAP[sv.forge])) { const q = G.sharpenCost(w.sharpen), cost = { ore: q.ore, gold: q.gold, mat: [0, 0, 0] }; if (q.mat) cost.mat[w.sharpen < 7 ? 1 : 2] = q.mat; if (pay(cost)) n.ren = true; }
          if (G.wRar(w) < 2 && pay(G.TIER_UP[G.wRar(w) + 1])) n.ren = true;
        }
      }
    } catch (e) { /* thiếu số liệu thì coi như không có việc mới */ }
    S.news = n;
  }
  VS.checkNews = checkNews;
  function markSeen(k) { const c = counts(); if (c[k] != null) { seen()[k] = c[k]; G.persist(); } checkNews(); }
  VS.markSeen = markSeen;
  function say(s) { S.msg = s; S.msgT = 2.4; }
  VS.say = say;

  // o.from: 'stage' (từ ải về: xuống đò ở bến bên phải) | 'title' | 'keep' (giữ chỗ đang đứng)
  VS.enter = function (o) {
    o = o || {};
    build();
    if (o.from !== 'keep') {
      S.x = 662; S.y = 160; S.face = -1; S.cam = 240;
      S.path = findPath(S.x, S.y, 590, 166); S.goal = null;
    }
    S.talk = null; S.near = null; S.joy = null; S.bubble = null;
    for (let i = 0; i < 2; i++) { S.wp[i].x = S.x + 17 + i * 12; S.wp[i].y = S.y - 2 + i * 6; }
    // Bản lưu chưa từng vào làng mới: lấy số đang có làm mốc, để không phải ai cũng báo "có việc mới" ngay từ đầu.
    const sn = seen();
    if (sn.base !== 1) { const c = counts(); for (const k of ['xen', 'may', 'tu']) if (sn[k] == null) sn[k] = c[k]; sn.base = 1; }
    checkNews();
    if (!sn.hint) S.hintT = 9;
  };
  function goTo(x, y, goal, fast) {
    const pth = findPath(S.x, S.y, x, y);
    S.path = pth; S.goal = pth ? goal || null : null; S.fast = !!fast;
    return !!pth;
  }
  // Đi tới một người rồi mở bảng. now: tới ngay không cần chạy (bấm lần hai, hoặc đang mở bảng khác).
  VS.goNpc = function (k, now) {
    const N = NPCS[k];
    if (now) { S.x = N.den[0]; S.y = N.den[1]; S.path = null; S.goal = null; interact({ kind: 'npc', id: k }); return; }
    if (S.goal && S.goal.kind === 'npc' && S.goal.id === k) { VS.goNpc(k, true); return; } // chạm lần hai: tới luôn
    if (!goTo(N.den[0], N.den[1], { kind: 'npc', id: k }, true)) VS.goNpc(k, true);
  };
  function interact(g) {
    S.path = null; S.goal = null;
    if (g.kind === 'npc') {
      const N = NPCS[g.id];
      S.face = N.pos[0] >= S.x ? 1 : -1;
      S.talk = g.id; markSeen(g.id);
      if (!seen().hint) { seen().hint = 1; S.hintT = 0; G.persist(); }
      G.sfx && G.sfx('ui');
      if (VS.onTalk) VS.onTalk(g.id); else { S.bubble = { who: g.id, s: N.chao, t: 2.6 }; S.talk = null; }
    } else if (g.kind === 'kid') {
      const sv = G.save, hs = sv.heroes[g.id], Hh = G.HEROES[g.id];
      if (hs && hs.unlocked) { sv.hero = g.id; G.persist(); G.sfx && G.sfx('pick'); say('Đã đổi sang ' + Hh.name); markSeen('tu'); }
      else { say(Hh.name + ' chưa mở: ' + Hh.unlock); G.sfx && G.sfx('warn'); }
    } else if (g.kind === 'weapon') {
      G.sfx && G.sfx('ui');
      if (VS.onWeapon) VS.onWeapon(g.id); else { const w = G.weaponById(g.id); if (w) say(G.wName ? G.wName(w) : 'Vũ khí sống'); }
    }
  }
  // Bảng đã đóng: người đó chào, dấu chấm than tắt (nếu hết việc)
  VS.closeTalk = function () {
    if (S.talk) S.bubble = { who: S.talk, s: NPCS[S.talk].ve, t: 1.8 };
    S.talk = null; checkNews();
  };
  // Vật chạm được tại điểm (x, y) của màn hình
  function hitAt(sx, sy) {
    const wx = sx + S.cam, wy = sy - OY;
    for (let i = 0; i < 2; i++) { const w = G.weaponById(G.save.carry[i]); if (w && Math.abs(wx - S.wp[i].x) < 13 && wy > S.wp[i].y - 50 && wy < S.wp[i].y + 6) return { kind: 'weapon', id: w.id }; }
    let best = null, bd = 1e9;
    for (const k of ORDER) { const q = NPCS[k].pos; if (Math.abs(wx - q[0]) < 17 && wy > q[1] - 40 && wy < q[1] + 10) { const d = Math.hypot(wx - q[0], wy - q[1] + 14); if (d < bd) { bd = d; best = { kind: 'npc', id: k }; } } }
    for (const st of seats()) if (Math.abs(wx - st.x) < 14 && wy > st.y - 32 && wy < st.y + 8) { const d = Math.hypot(wx - st.x, wy - st.y + 12); if (d < bd) { bd = d; best = { kind: 'kid', id: st.key, x: st.x, y: st.y }; } }
    if (!best && S.frogT <= 0 && Math.abs(wx - (B.gieng[0] - 9)) < 9 && Math.abs(wy - (B.gieng[1] - 12)) < 9) return { kind: 'frog' };
    return best;
  }
  function tapWorld(sx, sy) {
    const h = hitAt(sx, sy);
    if (!h) { goTo(G.clamp(sx + S.cam, 10, W - 10), G.clamp(sy - OY, 64, 249), null, false); return; }
    if (h.kind === 'frog') { S.frogT = 6; S.bubble = { at: [B.gieng[0] - 9, B.gieng[1] - 20], s: 'Ộp!', t: 1 }; G.sfx && G.sfx('pick', 0.6); return; }
    if (h.kind === 'weapon') { interact(h); return; }
    if (h.kind === 'npc') { VS.goNpc(h.id); return; }
    if (!goTo(h.x, h.y + 13, h, true)) interact(h);
  }

  // locked: đang mở bảng, cảnh đứng yên (chỉ còn cử động khi rảnh)
  VS.update = function (dt, locked) {
    S.t += dt;
    if (S.msgT > 0) S.msgT -= dt;
    if (S.frogT > 0) S.frogT -= dt;
    if (S.hintT > 0) S.hintT -= dt;
    if (S.bubble) { S.bubble.t -= dt; if (S.bubble.t <= 0) S.bubble = null; }
    if ((S.newsT -= dt) <= 0) { S.newsT = 1; checkNews(); }
    let mx = 0, my = 0;
    if (!locked) {
      const k = G.keys, kp = G.keyP, bt = btnAt();
      mx = (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0);
      my = (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0);
      let talkP = !!(kp.KeyJ || kp.KeyZ || kp.Space || kp.Enter);
      for (const d of G.downs) {
        if (d.role) continue;
        // nút tròn chỉ nhận ngón khi đang có người ở gần; lúc mờ thì chạm xuyên qua được (để chạm người đứng dưới nút)
        if (S.near && Math.hypot(d.x - bt[0], d.y - bt[1]) <= bt[2] + 6) { d.role = 'talk'; talkP = true; continue; }
        if (d.y < 50) continue; // dải trên cùng và dải khuôn mặt: xử lý như một lần chạm
        if (hitAt(d.x, d.y)) continue; // chạm vào người hay vật: chờ nhấc ngón
        if (d.x < 240 && !S.joy) { d.role = 'joy'; S.joy = { p: d, t: S.t, far: 0 }; }
      }
      // cần điều khiển; chạm nhanh không kéo thì coi như chạm vào đất để đi tới đó
      if (S.joy) {
        const J = S.joy, pp = J.p, held = G.pointers.get(pp.id) === pp;
        let dx = (pp.x - pp.sx) / 24, dy = (pp.y - pp.sy) / 24; const l = Math.hypot(dx, dy);
        J.far = Math.max(J.far, l);
        if (!held) { S.joy = null; if (J.far < 0.3 && S.t - J.t < 0.35) tapWorld(pp.sx, pp.sy); }
        else { if (l > 1) { dx /= l; dy /= l; } if (l > 0.18) { mx += dx; my += dy; } }
      }
      if (talkP && S.near) interact(S.near);
    } else S.joy = null;
    // đi
    const ml = Math.hypot(mx, my);
    S.moving = false;
    if (ml > 0.01 && !locked) {
      S.path = null; S.goal = null;
      const sp = SPEED * Math.min(1, ml), vx = (mx / ml) * sp * dt, vy = (my / ml) * sp * KY * dt;
      if (!blocked(S.x + vx, S.y)) S.x += vx;
      if (!blocked(S.x, S.y + vy)) S.y += vy;
      if (Math.abs(mx) > 0.15) S.face = mx > 0 ? 1 : -1;
      S.moving = true;
    } else if (S.path && !locked) {
      let step = SPEED * (S.fast ? 1.9 : 1.15) * dt;
      while (step > 0 && S.path && S.path.length) {
        const q = S.path[0], dx = q[0] - S.x, dy = (q[1] - S.y) / KY, d = Math.hypot(dx, dy);
        if (d <= step) { S.x = q[0]; S.y = q[1]; S.path.shift(); step -= d; }
        else { S.x += (dx / d) * step; S.y += (dy / d) * step * KY; if (Math.abs(dx) > 0.5) S.face = dx > 0 ? 1 : -1; step = 0; }
      }
      S.moving = true;
      if (!S.path.length) { S.path = null; const g = S.goal; S.goal = null; if (g) interact(g); }
    }
    // ai đang ở gần
    S.near = null;
    if (!locked && !S.path) {
      let bd = 30;
      for (const k of ORDER) { const q = NPCS[k].pos, d = Math.hypot(S.x - q[0], (S.y - q[1]) * 1.6); if (d < bd) { bd = d; S.near = { kind: 'npc', id: k }; } }
      for (const st of seats()) { const d = Math.hypot(S.x - st.x, (S.y - st.y) * 1.6) + 6; if (d < bd) { bd = d; S.near = { kind: 'kid', id: st.key }; } }
    }
    // vũ khí sống bay theo sau
    for (let i = 0; i < 2; i++) {
      const tx = S.x - S.face * (17 + i * 13), ty = S.y - 2 + i * 5, w = S.wp[i], k = Math.min(1, dt * (5 - i * 1.5));
      w.x += (tx - w.x) * k; w.y += (ty - w.y) * k;
    }
    // màn hình trượt theo em bé; đang nói chuyện thì giữ người đó trong khung
    const tc = G.clamp(S.x - 240, 0, W - 480);
    S.cam += (tc - S.cam) * Math.min(1, dt * 6);
    if (Math.abs(tc - S.cam) < 0.3) S.cam = tc;
  };

  // ======================= vẽ =======================
  function drawWeapon(c, i) {
    const sv = G.save, w = G.weaponById(sv.carry[i]); if (!w) return;
    const q = S.wp[i], bob = Math.round(Math.sin(S.t * 3 + i * 1.7) * 1.5), x = Math.round(q.x - S.cam), y = Math.round(q.y);
    c.fillStyle = 'rgba(10,8,20,0.3)'; c.fillRect(x - 4, y - 1, 9, 2);
    const WA = G.weaponArt;
    try {
      if (WA) { const o = WA.fromWeapon(w, { mood: S.near || S.talk ? 'calm' : 'idle', t: S.t + i }); WA.draw(c, o, x, y - 14 - bob - (w.type === 'bow' ? 8 : 0), WA.REST[w.type], 0); }
      else if (G.tinhLinh) { const sp = G.tinhLinh.weaponSprite(w.type, 'thuong', 'idle', -90, 0); c.drawImage(sp.cv, x - sp.ox, y - 14 - bob - sp.oy); }
    } catch (e) { /* thiếu hình vũ khí thì bỏ qua */ }
  }
  function drawKid(c, key, x, y, face, o) {
    const sv = G.save;
    try { G.art.hero(c, Object.assign({ x: Math.round(x), y: Math.round(y), face, key, move: false, t: S.t, atk: -1, dodge: -1, weapon: null, helm: null, armor: null }, o || {})); } catch (e) { p(c, x - 4, y - 18, 9, 18, '#c8402e'); }
    void sv;
  }
  // dim: độ tối phủ lên cảnh (khi mở bảng). hideHero: không vẽ em bé (bản đồ, bảng lớn).
  VS.drawWorld = function (o) {
    o = o || {};
    const c = G.wx, Bt = build(), cam = Math.round(S.cam), sv = G.save, t = S.t;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#101a1a'; c.fillRect(0, 0, 480, OY);
    c.translate(0, OY);
    c.drawImage(Bt.ground, -cam, 0);
    // nước lấp lánh
    for (let i = 0; i < 10; i++) { const y = (i * 53 + 17) % H, x = bo(y) + 10 + ((i * 37) % 50) - cam, k = Math.sin(t * 1.4 + i * 2.1); if (k > 0.3 && x < 480) p(c, x + Math.round(k * 3), y, 5, 1, '#6a9ab8'); }
    const L = [];
    for (const ob of Bt.objs) if (ob.x - cam < 480 && ob.x + ob.cv.width - cam > 0) L.push([ob.y, () => c.drawImage(ob.cv, ob.x - cam, ob.y0)]);
    const cf = Bt.cui[Math.floor(t * 2.2) % 3]; L.push([cf.y, () => c.drawImage(cf.cv, cf.x - cam, cf.y0)]);
    const tb = Math.round(Math.sin(t * 1.3)); L.push([Bt.thuyenS.y, () => c.drawImage(Bt.thuyenS.cv, Bt.thuyenS.x - cam, Bt.thuyenS.y0 + tb)]);
    // lửa lò rèn bập bùng, khói bay
    L.push([B.ren[1] + 0.2, () => {
      const x = B.ren[0] - cam, y = B.ren[1], f = Math.floor(t * 7) % 3;
      p(c, x - 19 + f, y - 13 + (f % 2), 6 - f, 5, '#fff3b0'); p(c, x - 22 + f * 3, y - 21 - (f % 2), 2, 3, '#ffd23f'); p(c, x - 12 - f, y - 19, 2, 2 + f, '#ffb040');
      for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; c.globalAlpha = 0.45 * (1 - ph); ell(c, x - 19 + Math.round(ph * 12 + Math.sin(ph * 6 + i) * 2), y - 74 - Math.round(ph * 22), 3 + Math.round(ph * 3), 2 + Math.round(ph), '#c8bec8'); }
      c.globalAlpha = 1;
    }]);
    // đàn gà, con cóc
    const gp = [[-34, -18, null, 0], [-22, -8, '#c87050', 1.3], [-44, -4, '#ffd23f', 2.6]];
    for (const q of gp) L.push([B.rom[1] + q[1], () => ga(c, B.rom[0] + q[0] - cam + Math.round(Math.sin(t * 0.4 + q[3]) * 3), B.rom[1] + q[1], q[2], Math.sin(t * 2.2 + q[3] * 2) > 0.55)]);
    if (S.frogT <= 0) L.push([B.gieng[1] + 0.1, () => coc(c, B.gieng[0] - 9 - cam, B.gieng[1] - 10 - (Math.sin(t * 0.9) > 0.96 ? 1 : 0))]);
    // người làng
    for (const k of ORDER) {
      const N = NPCS[k], q = N.pos, nearMe = (S.near && S.near.kind === 'npc' && S.near.id === k) || S.talk === k || (S.bubble && S.bubble.who === k);
      const look = nearMe ? (S.x >= q[0] ? 1 : -1) : 0;
      const f = look ? 0 : Math.floor(t * 2.4 + k.length * 0.7) % 3, blink = !look && ((t * 0.31 + k.length * 0.37) % 1) > 0.95;
      L.push([q[1], () => {
        putNpc(c, k, q[0] - cam, q[1], f, { look, blink });
        if (S.news[k] && S.talk !== k) bang(c, q[0] - cam - (k === 'ren' ? 6 : 0), q[1] + N.top - 9 + Math.round(Math.sin(t * 4) * 1.2));
      }]);
    }
    // ba bé ngồi chơi ở sân đình
    for (const st of seats()) {
      const un = sv.heroes[st.key] && sv.heroes[st.key].unlocked;
      L.push([st.y, () => drawKid(c, st.key, st.x - cam, st.y, st.x > B.dinh[0] ? -1 : 1, { alpha: un ? null : 0.45, move: un && Math.sin(t * 1.1 + st.x) > 0.75 })]);
    }
    if (!o.hideHero) {
      for (let i = 1; i >= 0; i--) L.push([S.wp[i].y - 0.5, () => drawWeapon(c, i)]);
      L.push([S.y, () => drawKid(c, sv.hero, S.x - cam, S.y, S.face, { move: S.moving, helm: sv.helm, armor: sv.armor })]);
    }
    L.sort((a, b) => a[0] - b[0]);
    for (const l of L) l[1]();
    // quầng sáng và đom đóm
    c.globalCompositeOperation = 'lighter'; c.drawImage(Bt.light, -cam, 0); c.globalCompositeOperation = 'source-over';
    for (const fl of Bt.flies) {
      const x = Math.round(fl[0] + Math.sin(t * 0.5 * fl[3] + fl[2]) * 8 - cam), y = Math.round(fl[1] + Math.cos(t * 0.37 * fl[3] + fl[2]) * 5);
      if (x < -2 || x > 482) continue;
      const a = 0.5 + 0.5 * Math.sin(t * 2 * fl[3] + fl[2]);
      if (a < 0.25) continue;
      c.fillStyle = 'rgba(210,255,120,' + (0.22 * a).toFixed(2) + ')'; c.fillRect(x - 1, y - 1, 3, 3); p(c, x, y, 1, 1, '#eaff9a');
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (o.dim) { c.fillStyle = 'rgba(10,8,16,' + o.dim + ')'; c.fillRect(0, 0, 480, H); }
  };
  // Đổi một điểm trong làng sang toạ độ màn hình
  VS.screen = (wx, wy) => [wx - S.cam, wy + OY];

  // ---------- lớp chữ và nút (canvas giao diện) ----------
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
  // Bong bóng nói, đuôi chỉ xuống tại (x, y). o: { bg, size, maxW }
  VS.bubble = function (s, x, y, o) {
    o = o || {};
    const ui = G.ui, c = G.ux, size = o.size || 8.5;
    const ls = o.maxW ? ui.wrap(s, o.maxW, size, true) : [s];
    ui.font(size, true);
    let w = 0; for (const l of ls) w = Math.max(w, c.measureText(l).width);
    const pad = 5, bw = w + pad * 2, bh = ls.length * (size + 2.5) + 6;
    let by = y - bh - 5; if (by < 17) { y += 17 - by; by = 17; }
    const bx = G.clamp(x - bw / 2, 3, 477 - bw);
    c.save();
    rrect(c, bx, by, bw, bh, 4); c.fillStyle = o.bg || '#fbf7ee'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(x - 3.5, by + bh - 0.6); c.lineTo(x, y); c.lineTo(x + 3.5, by + bh - 0.6); c.fillStyle = o.bg || '#fbf7ee'; c.fill();
    c.beginPath(); c.moveTo(x - 3.5, by + bh); c.lineTo(x, y); c.lineTo(x + 3.5, by + bh); c.stroke();
    c.restore();
    ls.forEach((l, i) => ui.text(l, bx + bw / 2, by + 4 + size * 0.86 + i * (size + 2.5), { size, bold: true, align: 'center', color: INK, shadow: false }));
  };
  // Dải bảy khuôn mặt lối tắt. sel: người đang được chọn. Trả về mã người vừa được chạm (khi clickable).
  VS.drawStrip = function (sel, clickable, compact) {
    const ui = G.ui, c = G.ux, n = ORDER.length, a = stripAt(0), b = stripAt(n - 1);
    let hit = null;
    c.save();
    rrect(c, a[0] - 16, 16.5, b[0] - a[0] + 32, compact ? 23.5 : 33, 9); c.fillStyle = 'rgba(10,22,22,0.72)'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(168,117,47,0.9)'; c.stroke();
    c.restore();
    ORDER.forEach((k, i) => {
      const q = stripAt(i), cx = q[0], cy = q[1], on = sel === k;
      c.save();
      c.beginPath(); c.arc(cx, cy, STRIP.r, 0, 7); c.fillStyle = on ? '#8a2f22' : '#1f4f4a'; c.fill(); c.lineWidth = on ? 1.6 : 1; c.strokeStyle = on ? '#f6dc92' : '#a8752f'; c.stroke();
      c.beginPath(); c.arc(cx, cy, STRIP.r - 1, 0, 7); c.clip(); VS.face(c, k, cx, cy + 1, 1);
      c.restore();
      if (S.news[k]) { c.save(); c.beginPath(); c.arc(cx + 7.5, cy - 7.5, 3, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke(); c.restore(); }
      if (!compact) ui.text(NPCS[k].ngan, cx, 46.5, { size: 6.5, bold: true, align: 'center', color: on ? '#f6dc92' : '#e8dcc0' });
      if (clickable && G.click && Math.abs(G.click.x - cx) <= STRIP.gap / 2 && G.click.y >= 14 && G.click.y <= (compact ? 43 : 50)) { hit = k; G.click = null; G.sfx && G.sfx('ui'); }
    });
    return hit;
  };
  // Dải tài nguyên trên cùng (có G.theme thì dùng khung trống đồng)
  VS.resParts = function () {
    const sv = G.save;
    return [['gold', sv.gold, '#ffd23f'], ['ore', sv.ore, '#c9ccd2'], ['stone', sv.stones, '#d48af5'],
      ['mat0', sv.mats[0], '#9bd14a'], ['mat1', sv.mats[1], '#7fd4ff'], ['mat2', sv.mats[2], '#ff9a5a'],
      ['shard0', sv.shards[0], '#c8e8a0'], ['shard1', sv.shards[1], '#a8d8ff'], ['shard2', sv.shards[2], '#ffc0a0']];
  };
  VS.drawTop = function () {
    const sv = G.save, ui = G.ui, parts = VS.resParts(), right = G.HEROES[sv.hero].name + ' · cấp ' + sv.heroes[sv.hero].lvl + ' · sức mạnh ' + G.power();
    if (G.theme && G.theme.topBar) { G.theme.topBar(parts, right); return; }
    ui.rect(0, 0, 480, 15, 'rgba(12,10,18,0.82)');
    let x = 6; for (const q of parts) { const t = String(q[1]); ui.text(t, x, 10.5, { size: 7, bold: true, color: q[2] }); ui.font(7, true); x += G.ux.measureText(t).width + 8; }
    ui.text(right, 474, 10.5, { size: 7, bold: true, align: 'right' });
  };
  // Lớp nút khi đang đi trong làng
  VS.drawHud = function () {
    const ui = G.ui, c = G.ux, cam = S.cam, T = G.theme;
    VS.drawTop();
    // em bé đi tới sát mép trên, ngay dưới dải khuôn mặt, thì dải mờ đi để không che
    const under = S.y + OY < 96 && Math.abs(S.x - cam - 240) < 124;
    c.save(); if (under) c.globalAlpha = 0.4;
    VS.drawStrip(S.goal && S.goal.kind === 'npc' ? S.goal.id : S.near && S.near.kind === 'npc' ? S.near.id : null, false);
    c.restore();
    // bong bóng tên chức năng trên đầu người đang ở gần
    if (S.near && S.near.kind === 'npc' && !S.bubble) { const N = NPCS[S.near.id]; VS.bubble(N.viec + (S.news[S.near.id] ? '  !' : ''), N.pos[0] - cam, N.pos[1] + N.top - 12 + OY, { bg: '#ffe9a8' }); }
    if (S.near && S.near.kind === 'kid') { const st = seats().find((q) => q.key === S.near.id); if (st) VS.bubble(G.HEROES[st.key].name, st.x - cam, st.y - 30 + OY, { bg: '#ffe9a8', size: 7.5 }); }
    if (S.bubble) { const bq = S.bubble.who ? [NPCS[S.bubble.who].pos[0], NPCS[S.bubble.who].pos[1] + NPCS[S.bubble.who].top - 12] : S.bubble.at; VS.bubble(S.bubble.s, bq[0] - cam, bq[1] + OY, { maxW: 130 }); }
    // cần điều khiển
    const BA = G.btnArt;
    if (BA) {
      if (S.joy) { let dx = S.joy.p.x - S.joy.p.sx, dy = S.joy.p.y - S.joy.p.sy; const l = Math.hypot(dx, dy); if (l > 24) { dx *= 24 / l; dy *= 24 / l; } BA.stick(c, S.joy.p.sx, S.joy.p.sy, 24, dx, dy, true); }
      else BA.stick(c, 62 - (G.cx || 0) * 0.6, 216 + (G.cy || 0), 24, 0, 0, false);
    }
    // nút tròn: có người ở gần thì sáng lên thành "Nói chuyện"
    const bt = btnAt(), lab = S.near ? (S.near.kind === 'npc' ? 'Nói chuyện' : 'Đổi hero') : null;
    const held = [...G.pointers.values()].some((q) => q.role === 'talk');
    if (T && T.round) T.round(bt[0], bt[1], bt[2], 'talk', { lit: !!S.near, pressed: held, dim: !S.near, label: lab });
    else { ui.circle(bt[0], bt[1], bt[2], S.near ? 'rgba(200,120,40,0.92)' : 'rgba(60,50,44,0.5)', S.near ? '#ffe9a8' : 'rgba(255,255,255,0.3)'); if (lab) ui.text(lab, bt[0], bt[1] + 3, { size: 8.5, bold: true, align: 'center' }); }
    if (S.hintT > 0 && !S.near) {
      const s = 'Kéo bên trái để đi. Chạm vào một người để nói chuyện.';
      if (T && T.toast) T.toast(110, 236, 260, s, { size: 7.5 }); else { ui.rect(110, 238, 260, 16, 'rgba(10,8,6,0.82)', '#ffd27a'); ui.text(s, 240, 249, { size: 7.5, align: 'center', bold: true }); }
    }
    if (S.msgT > 0 && S.msg) { if (T && T.toast) T.toast(130, 60, 220, S.msg); else { ui.rect(130, 60, 220, 16, 'rgba(10,8,6,0.9)', '#ffd27a'); ui.text(S.msg, 240, 71, { size: 8, align: 'center' }); } }
    // Một lần chạm trọn vẹn (G.click) phải xử lý ngay lúc vẽ: bộ máy xoá nó sau mỗi khung hình, kể cả khung không chạy bước cập nhật nào.
    if (G.click) {
      const cl = G.click;
      let used = false;
      for (let i = 0; i < ORDER.length && !used; i++) { const q = stripAt(i); if (Math.abs(cl.x - q[0]) <= STRIP.gap / 2 && cl.y >= 14 && cl.y < 50) { VS.goNpc(ORDER[i]); G.sfx && G.sfx('ui'); used = true; } }
      if (!used && cl.y >= 50) { tapWorld(cl.x, cl.y); used = true; }
      if (used) G.click = null;
    }
  };
  VS.draw = function () { VS.drawWorld(); VS.drawHud(); };


  // ======================= tranh bản đồ vùng (Chú Lái Đò) =======================
  // Toạ độ 15 điểm ải trên tranh: 3 vùng, mỗi vùng 5 ải, ải thứ năm là trùm vùng.
  const MAP = (VS.MAP = {
    nodes: [
      [[86, 118], [112, 96], [140, 106], [164, 82], [192, 60]],
      [[112, 186], [136, 208], [160, 180], [188, 206], [222, 182]],
      [[246, 146], [270, 128], [296, 148], [322, 130], [326, 84]],
    ],
    from: [[40, 138], [70, 182], [192, 60]], // đường vào ải đầu của từng vùng
    names: [[126, 34, '#2f5a3a'], [150, 236, '#2a5a7a'], [300, 44, '#7a2a22']], // chỗ ghi tên vùng và màu chữ
    soon: [['Núi tuyết', 412, 34, 412, 92], ['Núi lửa', 436, 112, 436, 176], ['Đầm lầy', 372, 172, 0, 0]], // vùng sắp có
  });
  const MCACHE = {};
  VS.mapArt = function (night) {
    const id = night ? 'n' : 'd';
    if (MCACHE[id]) return MCACHE[id];
    const [cv, c] = mk(480, 270), rd = rng(11), INKB = '#4a3626';
    p(c, 0, 0, 480, 270, '#e6d8b0');
    for (let i = 0; i < 900; i++) p(c, rd() * 480, rd() * 270, 1 + (rd() < 0.2 ? 1 : 0), 1, rd() < 0.5 ? '#d8c898' : '#f0e6c8');
    for (let i = 0; i < 14; i++) ell(c, rd() * 480, rd() * 270, 10 + rd() * 26, 5 + rd() * 12, 'rgba(190,160,100,0.10)');
    // biển phía dưới
    for (let x = 60; x < 480; x++) { const e = Math.round(222 + Math.sin(x * 0.045) * 6 + Math.sin(x * 0.13) * 2 + (x < 110 ? (110 - x) * 0.9 : 0)); if (e < 270) { p(c, x, e + 1, 1, 2, '#7a9aa4'); p(c, x, e + 3, 1, 270 - e - 3, '#b4cac8'); } }
    for (let i = 0; i < 60; i++) { const x = 70 + rd() * 400, y = 236 + rd() * 32; p(c, x, y, 4, 1, '#7a9aa4'); p(c, x + 4, y - 1, 2, 1, '#7a9aa4'); }
    // sông từ làng ra biển
    const song = [[40, 132], [52, 160], [70, 182], [64, 206], [84, 232]]; for (let i = 0; i < song.length - 1; i++) { line(c, song[i][0], song[i][1], song[i + 1][0], song[i + 1][1], 5, '#7a9aa4'); line(c, song[i][0], song[i][1], song[i + 1][0], song[i + 1][1], 3, '#b4cac8'); }
    // núi mờ phía xa
    for (const m of [[250, 40, 30], [300, 30, 22], [200, 34, 18], [360, 44, 26]]) for (let i = 0; i < m[2]; i++) p(c, m[0] - i, m[1] + i, i * 2, 1, i < 3 ? '#b8a880' : '#d0c098');
    // Rừng già
    for (let i = 0; i < 34; i++) { const x = 76 + rd() * 130, y = 40 + rd() * 62 + (x - 76) * -0.1; p(c, x, y, 2, 5, '#5a4030'); ell(c, x + 1, y - 2, 5, 4, i % 3 ? '#4a7a4a' : '#2f5a3a'); ell(c, x, y - 4, 3, 2, '#6a9a5a'); }
    // Hang biển
    ell(c, 160, 200, 62, 18, '#c8c0a0'); for (const r of [[110, 196, 12, 9], [140, 186, 16, 12], [176, 194, 14, 10], [206, 184, 18, 14], [228, 198, 10, 8]]) { ell(c, r[0], r[1], r[2], r[3], '#6a7a84'); ell(c, r[0] - 2, r[1] - 2, r[2] - 3, r[3] - 3, '#8a9aa0'); }
    ell(c, 206, 190, 8, 7, '#2a3440'); p(c, 198, 190, 17, 8, '#2a3440'); for (let i = 0; i < 4; i++) p(c, 199 + i * 4, 183 + (i % 2), 2, 4, '#c8d8dc');
    // Lâu đài cổ
    p(c, 256, 92, 86, 24, '#8a8088'); for (let i = 0; i < 11; i++) p(c, 256 + i * 8, 88, 5, 4, '#8a8088'); for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) p(c, 258 + j * 9 - (i % 2) * 4, 96 + i * 5, 7, 1, '#6a606a');
    for (const tx of [262, 330]) { p(c, tx - 8, 70, 16, 46, '#7a707a'); p(c, tx - 10, 66, 20, 5, '#5a505a'); for (let i = 0; i < 8; i++) p(c, tx - 10 + i, 58 + i, 20 - i * 2, 1, '#8a3a2e'); p(c, tx, 50, 1, 9, INKB); p(c, tx + 1, 50, 6, 4, '#c8402e'); p(c, tx - 2, 82, 4, 6, '#2a2430'); }
    p(c, 290, 98, 18, 18, '#2a2430'); ell(c, 299, 98, 9, 6, '#2a2430'); for (let i = 0; i < 9; i++) p(c, 280 + i, 78 + i, 38 - i * 2, 1, '#8a3a2e'); p(c, 276, 86, 46, 3, '#5e241d');
    // ba vùng sắp thêm (mờ, mây che)
    const mo = '#c4b48c', mo2 = '#b0a078';
    for (let i = 0; i < 26; i++) p(c, 400 - i * 1.3, 40 + i, i * 2.6, 1, i < 8 ? '#f4eee0' : mo); for (let i = 0; i < 18; i++) p(c, 436 - i * 1.2, 52 + i, i * 2.4, 1, i < 5 ? '#f4eee0' : mo2);
    for (let i = 0; i < 26; i++) p(c, 436 - i * 1.4 - 3, 134 + i, i * 2.8 + 6, 1, mo2); p(c, 432, 130, 8, 5, '#d08a5a'); p(c, 434, 124, 3, 6, '#e0a070'); p(c, 438, 120, 2, 5, '#e0b890'); p(c, 430, 136, 2, 8, '#d08a5a'); p(c, 440, 138, 2, 12, '#d08a5a');
    ell(c, 372, 192, 30, 10, mo); for (let i = 0; i < 6; i++) { const x = 350 + i * 9, y = 189 + (i % 3) * 3; p(c, x, y - 8, 1, 8, mo2); p(c, x - 1, y - 10, 3, 3, '#8a7a58'); p(c, x + 3, y - 5, 1, 5, mo2); } ell(c, 366, 195, 8, 2, '#a8b8a0'); ell(c, 386, 190, 6, 2, '#a8b8a0');
    for (const q of [[392, 76], [420, 84], [446, 68], [420, 164], [450, 158], [356, 200], [388, 200], [404, 150]]) { ell(c, q[0], q[1], 12, 4, '#f6f0dc'); ell(c, q[0] - 6, q[1] - 3, 7, 3, '#f6f0dc'); ell(c, q[0] + 5, q[1] - 2, 6, 3, '#fbf7ea'); p(c, q[0] - 10, q[1] + 4, 20, 1, '#c8b890'); }
    // làng và con đò
    p(c, 26, 122, 22, 10, '#8a5a34'); for (let i = 0; i < 7; i++) p(c, 24 + i, 115 + i, 26 - i * 2 + i, 1, '#c8402e'); p(c, 22, 121, 30, 2, '#8a3a2e'); p(c, 12, 118, 2, 10, '#5a4030'); ell(c, 13, 114, 6, 5, '#4a7a4a'); p(c, 34, 126, 5, 6, '#2a2430');
    ell(c, 58, 166, 7, 2, '#5a4030'); p(c, 54, 162, 8, 2, '#c9a24f');
    // hình trùm nhỏ cạnh ải trùm
    const bs = [
      (g) => { p(g, -5, -10, 10, 10, '#7a5234'); p(g, -7, -2, 14, 2, '#5a3a22'); ell(g, 0, -13, 8, 4, '#4a8a4a'); ell(g, -3, -16, 4, 3, '#6aaa5a'); p(g, -3, -8, 2, 3, '#ff5a3a'); p(g, 2, -8, 2, 3, '#ff5a3a'); p(g, -2, -3, 5, 1, '#2a1c18'); p(g, -9, -8, 4, 2, '#7a5234'); p(g, 6, -9, 4, 2, '#7a5234'); },
      (g) => { ell(g, 0, -7, 9, 6, '#3a7a9a'); ell(g, -1, -8, 6, 3, '#5aa0c0'); p(g, 8, -11, 4, 3, '#3a7a9a'); p(g, 8, -5, 4, 3, '#3a7a9a'); p(g, -2, -15, 5, 3, '#2a5a7a'); p(g, -6, -9, 2, 2, '#ff5a3a'); for (let i = 0; i < 3; i++) p(g, -8 + i * 2, -4, 1, 2, '#fff'); },
      (g) => { ell(g, 0, -7, 7, 6, '#e0782a'); p(g, -7, -16, 4, 6, '#e0782a'); p(g, 4, -16, 4, 6, '#e0782a'); p(g, -6, -14, 2, 3, '#2a1c18'); p(g, 5, -14, 2, 3, '#2a1c18'); ell(g, 0, -4, 4, 3, '#fbf7ee'); p(g, -4, -9, 2, 2, '#ffe07a'); p(g, 3, -9, 2, 2, '#ffe07a'); p(g, 0, -5, 1, 1, '#2a1c18'); p(g, 8, -8, 5, 3, '#e0782a'); p(g, 11, -11, 3, 4, '#fbf7ee'); },
    ];
    bs.forEach((fn, r) => { const q = MAP.nodes[r][4], sp = outlined(32, 32, 16, 28, fn); c.drawImage(sp.cv, q[0] - 16 + (r === 2 ? -22 : 0), q[1] - 28 - 13 + (r === 2 ? 12 : 0)); });
    // la bàn và viền tranh
    p(c, 22, 14, 1, 18, INKB); p(c, 14, 22, 17, 1, INKB); p(c, 21, 12, 3, 3, '#c8402e'); ell(c, 22, 22, 3, 3, '#e6d8b0'); ell(c, 22, 22, 1, 1, INKB);
    for (const k of [0, 1, 2]) { c.strokeStyle = ['#6a4a30', '#a88a58', '#6a4a30'][k]; c.lineWidth = 1; c.strokeRect(k * 2 + 0.5, k * 2 + 0.5, 479 - k * 4, 269 - k * 4); }
    if (night) { c.globalCompositeOperation = 'multiply'; c.fillStyle = '#8c88c4'; c.fillRect(0, 0, 480, 270); c.globalCompositeOperation = 'source-over'; } // độ khó 2: tranh màu đêm
    return (MCACHE[id] = cv);
  };
  // Đường nét đứt nối hai điểm trên tranh
  VS.mapDash = function (c, a, b, col) { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4); for (let j = 1; j < n; j++) if (j % 2) p(c, a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n, 2, 2, col); };
  VS.putNpc = putNpc;

  // Cảnh chạy riêng (dùng để xem thử khi chưa ghép vào màn làng của game)
  G.VillageDemo = { enter() { VS.enter({ from: 'stage' }); }, update(dt) { VS.update(dt, false); }, draw() { VS.draw(); } };
})();
