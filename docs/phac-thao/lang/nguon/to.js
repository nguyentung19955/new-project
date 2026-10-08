// Xếp các tờ phác thảo "làng có người". Hình vẽ nằm trong lang.js.
'use strict';
function badge(c, n, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = '#ffd27a'; c.fill(); c.lineWidth = Math.max(3, r / 6); c.strokeStyle = '#1a1420'; c.stroke(); text(c, String(n), x, y + r * 0.38, r * 1.15, '#1a1420', true, 'center'); }
function blit(c, cv, x, y, s, sx, sy, sw, sh) { c.imageSmoothingEnabled = false; sx = sx || 0; sy = sy || 0; sw = sw || cv.width; sh = sh || cv.height; c.drawImage(cv, sx, sy, sw, sh, x, y, sw * s, sh * s); }

// ---------- 1. Toàn cảnh làng ----------
TO['lang-toan-canh'] = function () {
  const B = BO_CUC.rong, S = 3, M = 40, IW = B.W * S, top = 190;
  const [cv, c] = mk(IW + M * 2, top + 270 * S + 610);
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Làng có người', M, 84, 64, GOLDT, true);
  text(c, 'Không còn danh sách nút. Em bé đi trong làng, mỗi chức năng là một người đứng ở chỗ của mình.', M, 134, 30, CREAM);
  text(c, 'Làng rộng bằng 1,5 màn hình, màn hình trượt ngang theo em bé. Khung nét đứt: phần nhìn thấy lúc vừa về làng.', M, 172, 26, SOFT);
  const v = veLang(B, { f: 0, bang: ['ren', 'do'] });
  blit(c, v, M, top, S);
  // khung màn hình lúc mới về làng (bên phải)
  c.save(); c.setLineDash([18, 12]); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.strokeRect(M + 240 * S + 2, top + 2, 480 * S - 4, 270 * S - 4); c.restore();
  // số trên hình
  const ex = [];
  NGUOI.forEach((n, i) => { const q = B[n.pos]; ex.push([i + 1, q[0] - 17, q[1] + NPCS[n.k].top - 8]); });
  ex.push([8, B.hero[0] + 14, B.hero[1] - 34]);
  for (const e of ex) badge(c, e[0], M + e[1] * S, top + e[2] * S, 24);
  // chú thích
  const y0 = top + 270 * S + 36, cw = (IW - 3 * 24) / 4, ch = 150;
  const rows = NGUOI.map((n) => [n.ten + ' · ' + n.noi, n.viec]).concat([['Em bé và vũ khí sống', 'Vũ khí bay theo sau em bé. Chạm vào nó để xem vũ khí']]);
  rows.forEach((r, i) => {
    const x = M + (i % 4) * (cw + 24), y = y0 + Math.floor(i / 4) * (ch + 20);
    rr(c, x, y, cw, ch, 14, PANEL); badge(c, i + 1, x + 40, y + 42, 24);
    text(c, r[0], x + 78, y + 52, 28, GOLDT, true); para(c, r[1], x + 22, y + 96, cw - 40, 24, CREAM, 32);
  });
  const y1 = y0 + 2 * (ch + 20) + 10;
  rr(c, M, y1, IW, 150, 14, PANEL2);
  text(c, 'Cách dùng', M + 24, y1 + 44, 28, GOLDT, true);
  text(c, 'Đi tới gần một người: người đó ngẩng lên, nút Đánh đổi thành nút "Nói chuyện". Hoặc chạm thẳng vào người đó, em bé tự chạy tới.', M + 24, y1 + 84, 25, CREAM);
  text(c, 'Dấu chấm than vàng: người đó đang có việc mới cho bạn (ở hình: thợ rèn đủ nguyên liệu nâng bậc, cụ đồ có điểm kỹ năng chưa dùng).', M + 24, y1 + 122, 25, CREAM);
  text(c, 'Từ ải về, em bé xuống đò ở bến bên phải: lái đò, thợ rèn, hàng xén, thợ may đều nằm ngay trong màn hình đầu tiên.', M, y1 + 196, 25, SOFT);
  return cv;
};

// ---------- dùng chung ----------
const THOAI = {
  lai: ['"Lên đò đi cháu, nước đang êm."', 'chống sào, ngó ra sông', 'vừa mở ải mới hoặc vùng mới'],
  ren: ['"Đưa đây ông xem lưỡi nào!"', 'quai búa lên đe, toé lửa', 'đủ nguyên liệu để mài, nâng bậc hoặc nâng lò'],
  xen: ['"Mua gì bán gì, vào đây với bà."', 'tung đồng xu, đếm tiền', 'vừa nhặt được vũ khí mới, hoặc rương sắp đầy'],
  may: ['"Bé thử cái mũ mới xem nào."', 'đưa thoi, dệt vải', 'có mũ, áo, bùa mới chưa mặc'],
  do: ['"Ngồi xuống đây, lão chỉ cho một chiêu."', 'vuốt râu, viết chữ', 'còn điểm kỹ năng chưa dùng'],
  tu: ['"Khẽ thôi, các bé đang chơi trong sân."', 'quét sân đình', 'có bé tinh linh mới được mở'],
  mo: ['"Cốc cốc cốc! Làng nước nghe đây!"', 'gõ mõ, rao làng', 'lần đầu vào làng, hoặc có tin mới'],
};
const TAM = { lai: [654, 140], ren: [466, 106], xen: [556, 184], may: [588, 108], do: [356, 124], tu: [168, 120], mo: [90, 68] };
function bubble(c, s, x, y, px, o) { // bong bóng nói, đuôi chỉ xuống tại (x,y)
  o = o || {}; c.font = '700 ' + px + 'px ' + FONT; const ls = o.maxW ? wrap(c, s, o.maxW, px, true) : [s]; let w = 0; for (const l of ls) w = Math.max(w, c.measureText(l).width);
  const pad = px * 0.6, bw = w + pad * 2, bh = ls.length * px * 1.3 + pad * 1.4, bx = x - bw / 2 + (o.dx || 0), by = y - bh - px * 0.6;
  rr(c, bx, by, bw, bh, px * 0.5, o.bg || '#fbf7ee', '#1a1420', Math.max(2, px / 8));
  c.beginPath(); c.moveTo(x - px * 0.4, by + bh - 1); c.lineTo(x, y); c.lineTo(x + px * 0.4, by + bh - 1); c.fillStyle = o.bg || '#fbf7ee'; c.fill(); c.strokeStyle = '#1a1420'; c.lineWidth = Math.max(2, px / 8); c.beginPath(); c.moveTo(x - px * 0.4, by + bh); c.lineTo(x, y); c.lineTo(x + px * 0.4, by + bh); c.stroke();
  ls.forEach((l, i) => text(c, l, bx + bw / 2, by + pad * 0.7 + px * 0.95 + i * px * 1.3, px, o.col || '#1a1420', true, 'center'));
}
function face(c, k, cx, cy, s) { const sp = npcSprite(k, 0, { look: 1 }), ty = 50 + NPCS[k].top - 6; c.imageSmoothingEnabled = false; c.drawImage(sp.cv, 19, ty, 23, 20, Math.round(cx - 11.5 * s), Math.round(cy - 10 * s), 23 * s, 20 * s); }
// Lớp nút trên màn hình. (X,Y) góc trên trái màn hình, s: số lần phóng. o: { btn, hot, joy:[dx,dy], strip, sel, dots:[..], noPad }
function hud(c, X, Y, s, o) {
  o = o || {}; const T = (v) => v * s;
  c.fillStyle = 'rgba(12,10,18,0.78)'; c.fillRect(X, Y, T(480), T(13));
  const res = [['Vàng 3200', '#ffd23f'], ['Quặng 46', '#c9ccd2'], ['Đá tôi 5', '#d48af5'], ['Gỗ linh 24', '#9be07a'], ['Vảy cá 18', '#7ac8f0'], ['Đá lửa 9', '#ffa05a']];
  res.forEach((r, i) => text(c, r[0], X + T(8 + i * 58), Y + T(9.5), T(6.5), r[1], true));
  text(c, 'Thợ Rèn · cấp 14', X + T(472), Y + T(9.5), T(6.5), CREAM, true, 'right');
  if (o.strip !== false) {
    const ks = NGUOI.map((n) => n.k), n = ks.length, gap = 27, x0 = 240 - ((n - 1) * gap) / 2;
    rr(c, X + T(x0 - 17), Y + T(16), T((n - 1) * gap + 34), T(25), T(12.5), 'rgba(12,10,18,0.6)');
    ks.forEach((k, i) => { const cx = X + T(x0 + i * gap), cy = Y + T(28.5); c.beginPath(); c.arc(cx, cy, T(11), 0, 7); c.fillStyle = o.sel === k ? '#b5672f' : '#3a322c'; c.fill(); c.lineWidth = T(1); c.strokeStyle = o.sel === k ? '#ffd27a' : '#8a7a60'; c.stroke(); c.save(); c.beginPath(); c.arc(cx, cy, T(10), 0, 7); c.clip(); face(c, k, cx, cy + T(1), s); c.restore(); if (o.dots && o.dots.includes(k)) { c.beginPath(); c.arc(cx + T(8), cy - T(8), T(3.2), 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = T(0.8); c.strokeStyle = '#1a1420'; c.stroke(); } });
  }
  if (o.noPad) return;
  const jx = X + T(62), jy = Y + T(212), j = o.joy || [0, 0];
  c.beginPath(); c.arc(jx, jy, T(30), 0, 7); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fill(); c.lineWidth = T(1.2); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke();
  c.beginPath(); c.arc(jx + T(j[0]), jy + T(j[1]), T(13), 0, 7); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fill();
  const bx = X + T(424), by = Y + T(214);
  c.beginPath(); c.arc(bx, by, T(31), 0, 7); c.fillStyle = o.hot ? 'rgba(200,120,40,0.92)' : 'rgba(120,60,40,0.7)'; c.fill(); c.lineWidth = T(o.hot ? 2 : 1.2); c.strokeStyle = o.hot ? '#ffe9a8' : 'rgba(255,255,255,0.5)'; c.stroke();
  text(c, o.btn || 'Đánh', bx, by + T(o.hot ? 3 : 3.5), T(o.hot ? 9.5 : 11), '#fff', true, 'center');
  c.beginPath(); c.arc(X + T(374), Y + T(240), T(17), 0, 7); c.fillStyle = 'rgba(40,40,60,0.5)'; c.fill(); c.lineWidth = T(1); c.strokeStyle = 'rgba(255,255,255,0.3)'; c.stroke(); text(c, 'Né', X + T(374), Y + T(243), T(8), 'rgba(255,255,255,0.7)', true, 'center');
}
function ngon(c, x, y, rx, ry, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fillStyle = 'rgba(232,180,150,0.5)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(120,70,50,0.6)'; c.stroke(); c.restore(); }
// Bảng lò rèn mẫu (toạ độ logic, vẽ ở s lần)
function bangLoRen(c, X, Y, s) {
  const T = (v) => v * s, R = (x, y, w, h, f, st) => rr(c, X + T(x), Y + T(y), T(w), T(h), T(2), f, st, T(0.8));
  R(8, 44, 300, 218, 'rgba(22,18,26,0.96)', '#c9a24f'); text(c, 'Lò rèn cấp 2', X + T(18), Y + T(60), T(11), GOLDT, true);
  R(250, 49, 52, 16, '#6a2a22', '#e8b080'); text(c, '✕ Xong', X + T(276), Y + T(60.5), T(7.5), '#fff', true, 'center');
  ['Mài', 'Nâng bậc', 'Tôi lại', 'Rèn đồ', 'Nâng lò'].forEach((t, i) => { R(16 + i * 57, 70, 54, 18, i === 0 ? '#b5672f' : '#4a3a30', i === 0 ? '#ffd27a' : '#7a6a58'); text(c, t, X + T(43 + i * 57), Y + T(82.5), T(7.5), '#fff', true, 'center'); if (i === 1) { c.beginPath(); c.arc(X + T(68 + i * 57), Y + T(72), T(3), 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); } });
  const ws = [['Gươm Rồng Xích Diệm +4', 'Lửa · Thành hình · bậc Tím', '#d48af5', 'sword'], ['Rồng Rắn Sương Giá +2', 'Băng · Mầm · bậc Lam', '#7ac8f0', 'bow'], ['Giáo Sắt +0', 'Chưa mang hệ · bậc Thường', '#d9cdb8', 'spear']];
  ws.forEach((w, i) => { const y = 96 + i * 34; R(16, y, 284, 30, i === 0 ? '#5a4226' : '#2e2830', i === 0 ? '#ffd27a' : '#5a5060'); R(20, y + 3, 24, 24, '#1a1420', w[2]); const sp = TL.weaponSprite(w[3], 'thuong', 'idle', -45, 0); c.save(); c.beginPath(); c.rect(X + T(21), Y + T(y + 4), T(22), T(22)); c.clip(); c.imageSmoothingEnabled = false; c.drawImage(sp.cv, X + T(25) - sp.ox * s * 0.5, Y + T(y + 23) - sp.oy * s * 0.5, sp.cv.width * s * 0.5, sp.cv.height * s * 0.5); c.restore(); text(c, w[0], X + T(50), Y + T(y + 13), T(8.5), w[2], true); text(c, w[1], X + T(50), Y + T(y + 24), T(6.5), SOFT); });
  text(c, 'Lên +5 tốn: 400 vàng, 6 quặng', X + T(18), Y + T(216), T(8), CREAM); text(c, 'Sát thương mỗi đòn 21,4 → 22,6', X + T(18), Y + T(230), T(7.5), '#9be07a');
  R(216, 224, 84, 30, '#a8452a', '#ffd27a'); text(c, 'Mài', X + T(258), Y + T(243.5), T(12), '#fff', true, 'center');
}
function man(B, cam, o) { const v = veLang(B, o); const [cv, c] = mk(480, 270); c.drawImage(v, -cam, 0); return cv; }

// ---------- 2. Từng người ----------
TO['nguoi-trong-lang'] = function () {
  const B = BO_CUC.rong, M = 40, G2 = 24, CW = 1068, CH = 500;
  const [cv, c] = mk(2240, 150 + 4 * (CH + G2) + 30);
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Bảy người trong làng', M, 80, 60, GOLDT, true);
  text(c, 'Cùng nét với em bé hero (mặt nạ tinh linh, đầu to) nhưng lớn tuổi hơn, mỗi người một dáng và một việc. Hình phóng 6 lần.', M, 124, 27, CREAM);
  const v = veLang(B, { f: 0, hero: null });
  NGUOI.forEach((n, i) => {
    const x = M + (i % 2) * (CW + G2), y = 150 + Math.floor(i / 2) * (CH + G2), t = TAM[n.k], th = THOAI[n.k];
    rr(c, x, y, CW, CH, 16, PANEL);
    c.save(); c.beginPath(); c.roundRect(x + 20, y + 20, 480, 460, 10); c.clip(); blit(c, v, x + 20, y + 20, 6, Math.max(0, Math.min(B.W - 80, t[0] - 40)), Math.max(0, t[1] - 38), 80, 77); c.restore();
    const tx = x + 524, tw = CW - 524 - 24;
    text(c, n.ten, tx, y + 62, 42, GOLDT, true); text(c, 'ở ' + n.noi, tx + c.measureText(n.ten).width + 16, y + 62, 26, SOFT);
    const nl = para(c, n.viec, tx, y + 104, tw, 26, CREAM, 34);
    const by = y + 104 + nl * 34 - 8; rr(c, tx, by, tw, 58, 12, '#fbf7ee'); text(c, th[0], tx + 18, by + 39, 25, '#1a1420', true);
    // khung động tác
    const fy = y + 290, bw = 122;
    text(c, 'Khi rảnh: ' + th[1], tx, fy - 14, 23, SOFT);
    for (let k = 0; k < 4; k++) {
      const fx = tx + k * (bw + 8); rr(c, fx, fy, bw, 132, 10, k === 3 ? '#4a3a26' : PANEL2);
      const sp = npcSprite(n.k, k === 3 ? 0 : k, { look: k === 3 ? 1 : 0 }); c.imageSmoothingEnabled = false; c.drawImage(sp.cv, 11, 6, 40, 46, fx + 1, fy - 3, 120, 138);
      if (k === 3) bang(c, fx + 100, fy + 40, 3);
    }
    para(c, 'Có việc mới: ' + th[2], tx, fy + 162, tw, 22, '#ffd27a', 28);
  });
  // ô thứ tám: em bé và vũ khí sống
  const x = M + CW + G2, y = 150 + 3 * (CH + G2); rr(c, x, y, CW, CH, 16, PANEL);
  const [s8, c8] = mk(80, 77); grass(c8, 80, 4); path(c8, [[-10, 62], [90, 60]], 9, 3); gieng(c8, 60, 34); putWeapon(c8, 24, 60, 1, 'sword', 0); putHero(c8, 42, 62, 1, {});
  c.save(); c.beginPath(); c.roundRect(x + 20, y + 20, 480, 460, 10); c.clip(); blit(c, s8, x + 20, y + 20, 6); c.restore();
  const tx = x + 524, tw = CW - 548;
  text(c, 'Vũ khí sống đi theo', tx, y + 62, 40, GOLDT, true);
  let yy = y + 106; yy += para(c, 'Trong làng em bé không cầm vũ khí. Món đang mang bay lơ lửng theo sau, mắt nhìn quanh.', tx, yy, tw, 26, CREAM, 34) * 34 + 14;
  yy += para(c, 'Chạm vào vũ khí: mở bảng Xem vũ khí (bậc, dòng phụ, đặc trưng hệ).', tx, yy, tw, 26, CREAM, 34) * 34 + 14;
  yy += para(c, 'Con cóc ở giếng chỉ để vui: chạm vào thì nó kêu và nhảy xuống giếng.', tx, yy, tw, 26, CREAM, 34) * 34 + 14;
  para(c, 'Ba bé hero còn lại ngồi chơi trong sân đình cạnh Ông Từ. Chạm vào một bé là đổi sang bé đó.', tx, yy, tw, 26, SOFT, 34);
  return cv;
};

// ---------- 3. Tương tác ----------
TO['tuong-tac'] = function () {
  const B = BO_CUC.rong, S = 2, M = 40, FW = 480 * S, FH = 270 * S, GX = 2240 - M * 2 - FW * 2, cam = 240;
  const [cv, c] = mk(2240, 150 + 2 * (FH + 110) + 520);
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Nói chuyện với một người', M, 80, 60, GOLDT, true);
  text(c, 'Bốn bước, lấy Ông Thợ Rèn làm ví dụ. Mỗi khung là đúng một màn hình điện thoại.', M, 124, 27, CREAM);
  const cap = ['1. Đẩy cần điều khiển, em bé đi tới lò rèn', '2. Tới gần: ông ngẩng lên, nút Đánh thành "Nói chuyện"', '3. Bấm nút: bảng Lò rèn mở, ông đứng cạnh nói một câu', '4. Bấm Xong: bảng đóng, ông chào, dấu chấm than tắt'];
  const W2 = (x) => (x - cam) * S, dots = ['ren', 'do'];
  for (let i = 0; i < 4; i++) {
    const X = M + (i % 2) * (FW + GX), Y = 190 + Math.floor(i / 2) * (FH + 110), rN = B.renN;
    text(c, cap[i], X, Y - 16, 27, GOLDT, true);
    c.save(); c.beginPath(); c.roundRect(X, Y, FW, FH, 14); c.clip();
    if (i === 0) {
      blit(c, man(B, cam, { f: 0, bang: dots, hero: [512, 176, -1] }), X, Y, S);
      c.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 4; k++) c.fillRect(X + W2(506 - k * 8), Y + (166 - k * 9) * S, 4, 4);
      hud(c, X, Y, S, { joy: [-12, -12], dots });
    } else if (i === 1) {
      blit(c, man(B, cam, { f: 0, look: { ren: 1 }, hero: [494, 138, -1] }), X, Y, S);
      c.save(); c.setLineDash([6, 6]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,233,168,0.8)'; c.beginPath(); c.ellipse(X + W2(rN[0]), Y + rN[1] * S, 34 * S, 15 * S, 0, 0, 7); c.stroke(); c.restore();
      bubble(c, 'Lò rèn  !', X + W2(rN[0]), Y + (rN[1] - 44) * S, 24, { bg: '#ffe9a8' });
      hud(c, X, Y, S, { btn: 'Nói chuyện', hot: true, dots, sel: 'ren' });
    } else if (i === 2) {
      blit(c, man(B, cam, { f: 0, hero: null }), X, Y, S); c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(X, Y, FW, FH);
      hud(c, X, Y, S, { noPad: true, dots, sel: 'ren' }); bangLoRen(c, X, Y, S);
      putNpc(c, 'ren', X + 392 * S, Y + 250 * S, 0, { look: -1 }, S * 3);
      bubble(c, 'Đưa đây ông xem lưỡi nào!', X + 392 * S, Y + 106 * S, 22, { maxW: 240 });
    } else {
      blit(c, man(B, cam, { f: 1, look: { ren: 1 }, hero: [492, 146, -1] }), X, Y, S);
      bubble(c, 'Đi cẩn thận nhé!', X + W2(rN[0]), Y + (rN[1] - 44) * S, 22);
      rr(c, X + 140 * S, Y + 236 * S, 200 * S, 20 * S, 10 * S, 'rgba(20,60,30,0.9)', '#9be07a'); text(c, 'Đã mài Gươm Rồng Xích Diệm lên +5', X + 240 * S, Y + 249.5 * S, 19, '#d8ffd0', true, 'center');
      hud(c, X, Y, S, { dots: ['do'] });
    }
    c.restore(); rr(c, X, Y, FW, FH, 14, null, '#5a5060', 3);
  }
  // dải lối tắt
  const y0 = 190 + 2 * (FH + 110) - 30; rr(c, M, y0, 2160, 470, 16, PANEL);
  text(c, 'Dải lối tắt ở mép trên màn hình', M + 30, y0 + 56, 38, GOLDT, true);
  text(c, 'Cho ai lười đi: chạm một khuôn mặt, em bé tự chạy tới người đó rồi mở bảng luôn. Chấm đỏ là người đang có việc mới.', M + 30, y0 + 100, 26, CREAM);
  NGUOI.forEach((n, i) => {
    const cx = M + 170 + i * 300, cy = y0 + 220; c.beginPath(); c.arc(cx, cy, 78, 0, 7); c.fillStyle = '#3a322c'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#c9a24f'; c.stroke();
    c.save(); c.beginPath(); c.arc(cx, cy, 74, 0, 7); c.clip(); face(c, n.k, cx, cy + 8, 7); c.restore();
    if (dots.includes(n.k)) { c.beginPath(); c.arc(cx + 58, cy - 58, 20, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a1420'; c.stroke(); }
    text(c, n.ten, cx, cy + 124, 28, GOLDT, true, 'center'); text(c, ['Vào ải', 'Lò rèn', 'Vũ khí, bán đồ', 'Mũ, áo, bùa', 'Kỹ năng, hướng dẫn', 'Chọn hero', 'Cài đặt'][i], cx, cy + 160, 24, SOFT, false, 'center');
  });
  text(c, 'Chạm thẳng vào người trên cảnh cũng được. Vào ải nhanh nhất: chạm mặt Chú Lái Đò, tranh bản đồ mở ngay.', M + 30, y0 + 440, 25, SOFT);
  return cv;
};

// ---------- 4. Hai bố cục ----------
TO['hai-bo-cuc'] = function () {
  const S = 2, M = 40, [cv, c] = mk(2240, 150 + 2 * (540 + 150) + 150);
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Hai cách bày làng', M, 80, 60, GOLDT, true);
  text(c, 'Cùng một cỡ phóng (2 lần). Vòng mờ là chỗ hai ngón cái đặt lên: cần điều khiển bên trái, nút bên phải.', M, 124, 27, CREAM);
  const rows = [
    { B: BO_CUC.rong, ten: 'A. Làng rộng 1,5 màn hình, màn hình trượt ngang', chon: true, cam: 240,
      duoc: ['Thoáng. Mỗi người có một góc riêng, nhìn công trình là biết ai.', 'Cảnh trượt nên không ai bị ngón tay che mãi.', 'Còn đất để thêm người mới sau này.', 'Có cảm giác đi dạo trong làng thật.'],
      mat: ['Đi từ bến đò sang cổng làng mất chừng 7 giây (đã có lối tắt).', 'Không thấy hết làng cùng lúc.', 'Tốn công vẽ hơn khoảng một phần ba.'] },
    { B: BO_CUC.vua, ten: 'B. Làng vừa đúng một màn hình', cam: 0,
      duoc: ['Thấy hết mọi người cùng lúc.', 'Chạm một lần là tới, gần như không phải đi.', 'Làm nhanh hơn, không cần trượt màn hình.'],
      mat: ['Chật. Bảy người chen nhau, người nhỏ khó chạm trúng.', 'Hai góc dưới bị ngón tay che: chỉ dùng được hai phần ba màn hình.', 'Phải bỏ nhà thợ may, ao sen, cây rơm. Hết chỗ thêm người mới.'] },
  ];
  rows.forEach((r, i) => {
    const y = 190 + i * 690, v = veLang(r.B, { f: 0, bang: ['ren', 'do'] }), w = r.B.W * S;
    text(c, r.ten, M, y - 16, 34, r.chon ? '#9be07a' : GOLDT, true); if (r.chon) { rr(c, M + 830, y - 50, 250, 44, 22, '#2e6a3a'); text(c, 'NÊN CHỌN', M + 955, y - 19, 26, '#fff', true, 'center'); }
    blit(c, v, M, y, S);
    const sx = M + r.cam * S; rr(c, sx + 2, y + 2, 960 - 4, 540 - 4, 6, null, 'rgba(255,255,255,0.8)', 4);
    for (const q of [[62, 212, 36], [424, 214, 38]]) { c.beginPath(); c.arc(sx + q[0] * S, y + q[1] * S, q[2] * S, 0, 7); c.fillStyle = 'rgba(232,180,150,0.28)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,220,200,0.6)'; c.stroke(); }
    text(c, 'một màn hình', sx + 14, y + 532, 20, '#fff', true);
    const tx = M + w + 30, tw = 2240 - M - tx - 10, half = i === 0 ? tw : (tw - 30) / 2; let yy = y + 30;
    text(c, 'Được', tx, yy, 30, '#9be07a', true); yy += 40;
    for (const s of r.duoc) { text(c, '+', tx, yy, 25, '#9be07a', true); yy += para(c, s, tx + 28, yy, half - 30, 25, CREAM, 33) * 33 + 8; }
    let x2 = tx, y2 = yy + 26; if (i === 1) { x2 = tx + half + 30; y2 = y + 30; }
    text(c, 'Mất', x2, y2, 30, '#ff9a7a', true); y2 += 40;
    for (const s of r.mat) { text(c, '–', x2, y2, 25, '#ff9a7a', true); y2 += para(c, s, x2 + 28, y2, half - 30, 25, CREAM, 33) * 33 + 8; }
  });
  const yb = 190 + 2 * 690 - 100; rr(c, M, yb, 2160, 170, 16, PANEL2);
  text(c, 'Khuyên chọn A cho điện thoại', M + 30, yb + 52, 34, '#9be07a', true);
  text(c, 'Trên điện thoại hai ngón cái che mất hai góc dưới. Làng một màn hình vì thế còn rất ít chỗ, người phải vẽ nhỏ và đứng sát nhau.', M + 30, yb + 96, 26, CREAM);
  text(c, 'Làng rộng thì bốn người hay dùng nhất nằm ngay màn hình đầu, ba người còn lại cách một lần chạm vào dải lối tắt.', M + 30, yb + 134, 26, CREAM);
  return cv;
};
