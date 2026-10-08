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
  ws.forEach((w, i) => { const y = 96 + i * 34; R(16, y, 284, 30, i === 0 ? '#5a4226' : '#2e2830', i === 0 ? '#ffd27a' : '#5a5060'); R(20, y + 3, 24, 24, '#1a1420', w[2]); const sp = TL.weaponSprite(w[3], 'thuong', 'idle', -45, 0); c.save(); c.beginPath(); c.rect(X + T(21), Y + T(y + 4), T(22), T(22)); c.clip(); c.imageSmoothingEnabled = false; c.drawImage(sp.cv, X + T(w[3] === 'bow' ? 36 : 25) - sp.ox * s * 0.5, Y + T(y + (w[3] === 'bow' ? 21 : 23)) - sp.oy * s * 0.5, sp.cv.width * s * 0.5, sp.cv.height * s * 0.5); c.restore(); text(c, w[0], X + T(50), Y + T(y + 13), T(8.5), w[2], true); text(c, w[1], X + T(50), Y + T(y + 24), T(6.5), SOFT); });
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
      hud(c, X, Y, S, { noPad: true, dots, sel: 'ren' }); bangLoRen(c, X + 164 * S, Y, S);
      putNpc(c, 'ren', X + 84 * S, Y + 250 * S, 0, { look: 1 }, S * 3);
      bubble(c, 'Đưa đây ông xem lưỡi nào!', X + 84 * S, Y + 112 * S, 22, { maxW: 240 });
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

// ---------- 5. Bản đồ vùng dạng tranh vẽ ----------
function saoNho(c, x, y, on) { const col = on ? '#e8a020' : '#b0a078'; p(c, x, y - 1, 1, 3, col); p(c, x - 1, y, 3, 1, col); }
function veBanDo() {
  const [cv, c] = mk(480, 270), rd = rng(11), INKB = '#4a3626';
  p(c, 0, 0, 480, 270, '#e6d8b0');
  for (let i = 0; i < 900; i++) p(c, rd() * 480, rd() * 270, 1 + (rd() < 0.2 ? 1 : 0), 1, rd() < 0.5 ? '#d8c898' : '#f0e6c8');
  for (let i = 0; i < 14; i++) ell(c, rd() * 480, rd() * 270, 10 + rd() * 26, 5 + rd() * 12, 'rgba(190,160,100,0.10)');
  // biển phía dưới
  for (let y = 214; y < 270; y++) { for (let x = 60; x < 480; x++) { const e = 222 + Math.sin(x * 0.045) * 6 + Math.sin(x * 0.13) * 2 + (x < 110 ? (110 - x) * 0.9 : 0); if (y > e) { p(c, x, y, 1, 1, y - e < 2 ? '#7a9aa4' : '#b4cac8'); } } }
  for (let i = 0; i < 60; i++) { const x = 70 + rd() * 400, y = 232 + rd() * 36; p(c, x, y, 4, 1, '#7a9aa4'); p(c, x + 4, y - 1, 2, 1, '#7a9aa4'); }
  // sông từ làng ra biển
  const song = [[40, 132], [52, 160], [70, 182], [64, 206], [84, 232]]; for (let i = 0; i < song.length - 1; i++) { line(c, song[i][0], song[i][1], song[i + 1][0], song[i + 1][1], 5, '#7a9aa4'); line(c, song[i][0], song[i][1], song[i + 1][0], song[i + 1][1], 3, '#b4cac8'); }
  // núi mờ phía xa
  for (const m of [[250, 40, 30], [300, 30, 22], [200, 34, 18], [360, 44, 26]]) for (let i = 0; i < m[2]; i++) p(c, m[0] - i, m[1] + i, i * 2, 1, i < 3 ? '#b8a880' : '#d0c098');
  // --- Rừng già
  for (let i = 0; i < 34; i++) { const x = 76 + rd() * 130, y = 40 + rd() * 62 + (x - 76) * -0.1; p(c, x, y, 2, 5, '#5a4030'); ell(c, x + 1, y - 2, 5, 4, i % 3 ? '#4a7a4a' : '#2f5a3a'); ell(c, x, y - 4, 3, 2, '#6a9a5a'); }
  // --- Hang biển
  ell(c, 160, 200, 62, 18, '#c8c0a0'); for (const r of [[110, 196, 12, 9], [140, 186, 16, 12], [176, 194, 14, 10], [206, 184, 18, 14], [228, 198, 10, 8]]) { ell(c, r[0], r[1], r[2], r[3], '#6a7a84'); ell(c, r[0] - 2, r[1] - 2, r[2] - 3, r[3] - 3, '#8a9aa0'); }
  ell(c, 206, 190, 8, 7, '#2a3440'); p(c, 198, 190, 17, 8, '#2a3440'); for (let i = 0; i < 4; i++) p(c, 199 + i * 4, 183 + (i % 2), 2, 4, '#c8d8dc');
  // --- Lâu đài cổ
  p(c, 256, 92, 86, 24, '#8a8088'); for (let i = 0; i < 11; i++) p(c, 256 + i * 8, 88, 5, 4, '#8a8088'); for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) p(c, 258 + j * 9 - (i % 2) * 4, 96 + i * 5, 7, 1, '#6a606a');
  for (const tx of [262, 330]) { p(c, tx - 8, 70, 16, 46, '#7a707a'); p(c, tx - 10, 66, 20, 5, '#5a505a'); for (let i = 0; i < 8; i++) p(c, tx - 10 + i, 58 + i, 20 - i * 2, 1, '#8a3a2e'); p(c, tx, 50, 1, 9, INKB); p(c, tx + 1, 50, 6, 4, '#c8402e'); p(c, tx - 2, 82, 4, 6, '#2a2430'); }
  p(c, 290, 98, 18, 18, '#2a2430'); ell(c, 299, 98, 9, 6, '#2a2430'); for (let i = 0; i < 9; i++) p(c, 280 + i, 78 + i, 38 - i * 2, 1, '#8a3a2e'); p(c, 276, 86, 46, 3, '#5e241d');
  // --- Ba vùng sắp thêm (mờ, mây che)
  const mo = '#c4b48c', mo2 = '#b0a078';
  for (let i = 0; i < 26; i++) { p(c, 400 - i * 1.3, 40 + i, i * 2.6, 1, i < 8 ? '#f4eee0' : mo); } for (let i = 0; i < 18; i++) p(c, 436 - i * 1.2, 52 + i, i * 2.4, 1, i < 5 ? '#f4eee0' : mo2); // núi tuyết
  for (let i = 0; i < 26; i++) p(c, 436 - i * 1.4 - 3, 134 + i, i * 2.8 + 6, 1, mo2); p(c, 432, 130, 8, 5, '#d08a5a'); p(c, 434, 124, 3, 6, '#e0a070'); p(c, 438, 120, 2, 5, '#e0b890'); p(c, 430, 136, 2, 8, '#d08a5a'); p(c, 440, 138, 2, 12, '#d08a5a'); // núi lửa
  ell(c, 356, 194, 34, 12, mo); for (let i = 0; i < 7; i++) { const x = 330 + i * 9, y = 190 + (i % 3) * 4; p(c, x, y - 8, 1, 8, mo2); p(c, x - 1, y - 10, 3, 3, '#8a7a58'); p(c, x + 3, y - 5, 1, 5, mo2); } ell(c, 350, 198, 8, 2, '#a8b8a0'); ell(c, 372, 192, 6, 2, '#a8b8a0'); // đầm lầy
  for (const q of [[392, 76], [420, 84], [446, 68], [420, 164], [450, 158], [340, 204], [372, 204], [404, 150]]) { ell(c, q[0], q[1], 12, 4, '#f6f0dc'); ell(c, q[0] - 6, q[1] - 3, 7, 3, '#f6f0dc'); ell(c, q[0] + 5, q[1] - 2, 6, 3, '#fbf7ea'); p(c, q[0] - 10, q[1] + 4, 20, 1, '#c8b890'); }
  // --- làng
  p(c, 26, 122, 22, 10, '#8a5a34'); for (let i = 0; i < 7; i++) p(c, 24 + i, 115 + i, 26 - i * 2 + i, 1, '#c8402e'); p(c, 22, 121, 30, 2, '#8a3a2e'); p(c, 12, 118, 2, 10, '#5a4030'); ell(c, 13, 114, 6, 5, '#4a7a4a'); p(c, 34, 126, 5, 6, '#2a2430');
  ell(c, 58, 166, 7, 2, '#5a4030'); p(c, 54, 162, 8, 2, '#c9a24f'); // con đò
  // --- đường đi và điểm ải
  const V = [40, 138];
  const R = [
    { n: [[86, 116], [110, 94], [138, 102], [160, 80], [190, 62]], st: [3, 3, 2, 3, 2], from: V },
    { n: [[96, 180], [122, 206], [152, 174], [182, 208], [222, 180]], st: [3, 2, 3, 1, 2], from: [70, 182] },
    { n: [[230, 140], [250, 128], [272, 142], [300, 128], [318, 78]], st: [3, 1, 0, -1, -1], from: [190, 62] },
  ];
  function dash(a, b, col) { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4); for (let j = 1; j < n; j++) if (j % 2) p(c, a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n, 2, 2, col); }
  dash([190, 62], [230, 140], '#8a6a48'); dash([222, 180], [230, 140], '#8a6a48');
  dash([318, 78], [392, 70], '#c0ae84'); dash([300, 128], [420, 150], '#c0ae84'); dash([222, 180], [330, 196], '#c0ae84');
  const out = { R, cur: null };
  R.forEach((r, ri) => {
    if (ri < 2) dash(r.from, r.n[0], '#8a6a48');
    for (let i = 0; i < 4; i++) dash(r.n[i], r.n[i + 1], r.st[i + 1] >= 0 ? '#7a4a30' : '#b0a078');
    r.n.forEach((q, i) => {
      const s = r.st[i], boss = i === 4;
      if (boss) { ell(c, q[0], q[1], 8, 8, INKB); ell(c, q[0], q[1], 7, 7, s > 0 ? '#c8402e' : s === 0 ? '#ffd23f' : '#cbbd96'); ell(c, q[0], q[1], 5, 5, s > 0 ? '#8a2a1e' : '#a89870'); }
      else { ell(c, q[0], q[1], 5, 5, INKB); ell(c, q[0], q[1], 4, 4, s > 0 ? '#c8402e' : s === 0 ? '#ffd23f' : '#cbbd96'); if (s > 0) { p(c, q[0] - 2, q[1], 2, 2, '#fbf7ee'); p(c, q[0], q[1] + 1, 1, 2, '#fbf7ee'); p(c, q[0] + 1, q[1] - 2, 2, 3, '#fbf7ee'); } else if (s < 0) { p(c, q[0] - 1, q[1] - 1, 3, 3, '#8a7a58'); p(c, q[0] - 1, q[1] - 3, 3, 1, '#8a7a58'); p(c, q[0] - 2, q[1] - 2, 1, 1, '#8a7a58'); p(c, q[0] + 2, q[1] - 2, 1, 1, '#8a7a58'); } }
      
      if (s === 0) out.cur = q;
    });
  });
  // hình trùm nhỏ
  let b = R[0].n[4]; const bx = (q) => [q[0], q[1] - 12];
  let [x, y] = bx(b); const T1 = outlined(32, 32, 16, 28, (g) => { p(g, -5, -10, 10, 10, '#7a5234'); p(g, -7, -2, 14, 2, '#5a3a22'); ell(g, 0, -13, 8, 4, '#4a8a4a'); ell(g, -3, -16, 4, 3, '#6aaa5a'); p(g, -3, -8, 2, 3, '#ff5a3a'); p(g, 2, -8, 2, 3, '#ff5a3a'); p(g, -2, -3, 5, 1, '#2a1c18'); p(g, -9, -8, 4, 2, '#7a5234'); p(g, 6, -9, 4, 2, '#7a5234'); }); c.drawImage(T1.cv, x - 16, y - 28 + 3);
  [x, y] = bx(R[1].n[4]); const T2 = outlined(32, 32, 16, 28, (g) => { ell(g, 0, -7, 9, 6, '#3a7a9a'); ell(g, -1, -8, 6, 3, '#5aa0c0'); p(g, 8, -11, 4, 3, '#3a7a9a'); p(g, 8, -5, 4, 3, '#3a7a9a'); p(g, -2, -15, 5, 3, '#2a5a7a'); p(g, -6, -9, 2, 2, '#ff5a3a'); for (let i = 0; i < 3; i++) p(g, -8 + i * 2, -4, 1, 2, '#fff'); }); c.drawImage(T2.cv, x - 16, y - 28 + 3);
  [x, y] = bx(R[2].n[4]); const T3 = outlined(32, 32, 16, 28, (g) => { ell(g, 0, -7, 7, 6, '#e0782a'); p(g, -7, -16, 4, 6, '#e0782a'); p(g, 4, -16, 4, 6, '#e0782a'); p(g, -6, -14, 2, 3, '#2a1c18'); p(g, 5, -14, 2, 3, '#2a1c18'); ell(g, 0, -4, 4, 3, '#fbf7ee'); p(g, -4, -9, 2, 2, '#ffe07a'); p(g, 3, -9, 2, 2, '#ffe07a'); p(g, 0, -5, 1, 1, '#2a1c18'); p(g, 8, -8, 5, 3, '#e0782a'); p(g, 11, -11, 3, 4, '#fbf7ee'); }); c.drawImage(T3.cv, x - 16, y - 28 + 3);
  // em bé đứng ở ải đang tới
  if (out.cur) { const q = out.cur; for (const r of [9, 8]) { c.strokeStyle = '#c8402e'; c.lineWidth = 1; c.beginPath(); c.ellipse(q[0] + 0.5, q[1] + 0.5, r, r * 0.8, 0, 0, 7); if (r === 9) c.stroke(); } putHero(c, q[0], q[1] - 3, 1, {}); }
  // la bàn, viền
  p(c, 22, 14, 1, 18, INKB); p(c, 14, 22, 17, 1, INKB); p(c, 21, 12, 3, 3, '#c8402e'); ell(c, 22, 22, 3, 3, '#e6d8b0'); ell(c, 22, 22, 1, 1, INKB);
  for (const k of [0, 1, 2]) { c.strokeStyle = ['#6a4a30', '#a88a58', '#6a4a30'][k]; c.lineWidth = 1; c.strokeRect(k * 2 + 0.5, k * 2 + 0.5, 479 - k * 4, 269 - k * 4); }
  return { cv, out };
}
TO['ban-do-vung'] = function () {
  const S = 4, M = 40, [cv, c] = mk(2000, 170 + 1080 + 330), X = M, Y = 170, T = (v) => v * S;
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Bản đồ vùng là một tấm tranh', M, 80, 60, GOLDT, true);
  text(c, 'Nói chuyện với Chú Lái Đò thì tranh mở ra. Chạm một điểm ải trên tranh, rồi bấm "Lên đò". Hình phóng 4 lần.', M, 124, 27, CREAM);
  const m = veBanDo(); blit(c, m.cv, X, Y, S);
  const nm = (s, x, y, px, col) => { c.font = '700 ' + px + 'px ' + FONT; c.lineWidth = px / 4; c.strokeStyle = 'rgba(240,230,200,0.85)'; c.textAlign = 'center'; c.strokeText(s, X + T(x), Y + T(y)); text(c, s, X + T(x), Y + T(y), px, col, true, 'center'); };
  nm('Làng', 36, 112, 30, '#4a3626'); nm('Rừng già', 126, 34, 38, '#2f5a3a'); nm('Hang biển', 150, 228, 38, '#2a5a7a'); nm('Lâu đài cổ', 300, 46, 38, '#7a2a22');
  nm('Mộc Tinh', 222, 60, 22, '#4a3626'); nm('Ngư Tinh', 256, 176, 22, '#4a3626'); nm('Hồ Tinh', 346, 62, 22, '#4a3626');
  nm('Núi tuyết', 412, 34, 30, '#8a7a58'); nm('Núi lửa', 432, 112, 30, '#8a7a58'); nm('Đầm lầy', 356, 176, 30, '#8a7a58');
  for (const q of [[412, 96], [432, 174], [356, 162]]) { rr(c, X + T(q[0]) - 62, Y + T(q[1]) - 22, 124, 32, 16, 'rgba(74,54,38,0.85)'); text(c, 'sắp có', X + T(q[0]), Y + T(q[1]), 22, '#f0e6c8', true, 'center'); }
  m.out.R.forEach((r) => r.n.forEach((q, i) => { const s = r.st[i]; if (s > 0) for (let k = 0; k < 3; k++) { c.font = '700 20px ' + FONT; c.lineWidth = 4; c.strokeStyle = '#4a3626'; c.textAlign = 'center'; const sx = X + T(q[0]) + (k - 1) * 19, sy = Y + T(q[1] + (i === 4 ? 14.5 : 11.5)); c.strokeText('★', sx, sy); text(c, '★', sx, sy, 20, k < s ? '#ffd23f' : '#d8caa0', true, 'center'); } }));
  // thẻ ải đang chọn + lái đò
  const q = m.out.cur; bubble(c, 'Ải 3', X + T(q[0]), Y + T(q[1] - 30), 26, { bg: '#ffe9a8' });
  putNpc(c, 'lai', X + T(34), Y + T(262), 0, { look: 1, noShadow: true }, S * 2); bubble(c, 'Đi đâu hả cháu?', X + T(40), Y + T(196), 26, { dx: 40 });
  rr(c, X + T(250), Y + T(214), T(222), T(50), T(4), 'rgba(28,22,30,0.94)', '#c9a24f', T(1));
  text(c, 'Lâu đài cổ · Ải 3', X + T(258), Y + T(229), T(10), GOLDT, true); text(c, 'Hệ chủ đạo: Lửa · Gợi ý cấp hero 20', X + T(258), Y + T(241), T(7), CREAM); text(c, 'Thưởng: kinh nghiệm, vàng, đá lửa', X + T(258), Y + T(251), T(7), SOFT);
  rr(c, X + T(258), Y + T(254.5), T(78), T(7), T(2), null, null); text(c, 'Độ khó: thường (chạm để đổi)', X + T(258), Y + T(260.5), T(6.5), '#d48af5', true);
  rr(c, X + T(396), Y + T(222), T(68), T(34), T(4), '#a8452a', '#ffd27a', T(1)); text(c, 'Lên đò', X + T(430), Y + T(243), T(12), '#fff', true, 'center');
  rr(c, X + T(404), Y + T(6), T(58), T(16), T(3), '#5a4030', '#c9a24f', T(0.8)); text(c, '✕ Về làng', X + T(433), Y + T(17.5), T(8), '#fff', true, 'center');
  rr(c, X, Y, 1920, 1080, 4, null, '#5a5060', 3);
  // chú giải
  const y0 = Y + 1080 + 40; rr(c, M, y0, 1920, 250, 16, PANEL);
  const [lg, lc] = mk(120, 20); p(lc, 0, 0, 120, 20, '#e6d8b0');
  const items = [['Ải đã qua, bên dưới là số sao', (x, y) => { ell(lc, x, y, 5, 5, '#4a3626'); ell(lc, x, y, 4, 4, '#c8402e'); }], ['Ải đang tới: em bé đứng ở đó', (x, y) => { ell(lc, x, y + 3, 5, 5, '#4a3626'); ell(lc, x, y + 3, 4, 4, '#ffd23f'); }], ['Ải chưa mở (có khoá)', (x, y) => { ell(lc, x, y, 5, 5, '#4a3626'); ell(lc, x, y, 4, 4, '#cbbd96'); p(lc, x - 1, y - 1, 3, 3, '#8a7a58'); }], ['Ải trùm: vòng to, có hình trùm', (x, y) => { ell(lc, x, y, 8, 8, '#4a3626'); ell(lc, x, y, 7, 7, '#c8402e'); ell(lc, x, y, 5, 5, '#8a2a1e'); }]];
  items.forEach((it, i) => { const [g, gc] = mk(22, 22); p(gc, 0, 0, 22, 22, '#e6d8b0'); p(lc, 0, 0, 120, 20, '#e6d8b0'); it[1](11, 10); gc.drawImage(lg, 0, 0, 22, 20, 0, 1, 22, 20); const x = M + 30 + i * 470; c.save(); c.beginPath(); c.roundRect(x, y0 + 28, 66, 66, 10); c.clip(); blit(c, g, x, y0 + 28, 3); c.restore(); para(c, it[0], x + 82, y0 + 56, 350, 24, CREAM, 30); });
  text(c, 'Đường nét đứt nối các ải theo thứ tự. Hạ trùm vùng này thì đường sang vùng sau hiện ra.', M + 30, y0 + 142, 25, CREAM);
  text(c, 'Ba vùng sắp thêm (Đầm lầy, Núi tuyết, Núi lửa) đã có chỗ sẵn trên tranh, đang bị mây che. Thêm vùng không phải vẽ lại bản đồ.', M + 30, y0 + 180, 25, CREAM);
  text(c, 'Độ khó 2 đổi tranh sang màu đêm. Số sao và ổ khoá lấy đúng theo tiến trình đang lưu.', M + 30, y0 + 218, 25, SOFT);
  return cv;
};

// ---------- 6. Trên màn hình thật ----------
TO['tren-man-hinh-that'] = function () {
  const B = BO_CUC.rong, S = 3, M = 100, SW = 480 * S, SH = 270 * S, cam = 240, [cv, c] = mk(2000, 150 + 2 * (SH + 290) + 10);
  p(c, 0, 0, cv.width, cv.height, PAGE);
  text(c, 'Trên điện thoại thật', 40, 80, 60, GOLDT, true);
  text(c, 'Hai ngón cái đặt ở hai góc dưới. Người và bảng đều nằm ngoài chỗ ngón tay che. Hình phóng 3 lần.', 40, 124, 27, CREAM);
  for (let i = 0; i < 2; i++) {
    const Y = 230 + i * (SH + 290), X = (2000 - SW) / 2;
    text(c, i === 0 ? 'Lúc đi trong làng' : 'Lúc bảng đang mở', X - 60, Y - 56, 32, GOLDT, true);
    rr(c, X - 70, Y - 34, SW + 140, SH + 68, 60, '#0c0a10', '#4a4454', 4); rr(c, X - 46, Y + SH / 2 - 60, 16, 120, 8, '#1c1921');
    c.save(); c.beginPath(); c.roundRect(X, Y, SW, SH, 26); c.clip();
    if (i === 0) {
      blit(c, man(B, cam, { f: 0, bang: ['ren'], look: { xen: -1 }, hero: [514, 204, 1] }), X, Y, S);
      const q = B.xenN; bubble(c, 'Hàng xén', X + (q[0] - cam) * S, Y + (q[1] - 40) * S, 34, { bg: '#ffe9a8' });
      hud(c, X, Y, S, { btn: 'Nói chuyện', hot: true, dots: ['ren', 'do'], sel: 'xen', joy: [8, -4] });
      for (const z of [[18, 172, 92, 94], [358, 172, 116, 94]]) { c.save(); c.setLineDash([14, 10]); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.strokeRect(X + z[0] * S, Y + z[1] * S, z[2] * S, z[3] * S); c.restore(); }
      text(c, 'chỗ ngón trái che', X + 20 * S, Y + 169 * S, 22, '#fff', true); text(c, 'chỗ ngón phải che', X + 470 * S, Y + 169 * S, 22, '#fff', true, 'right');
    } else {
      blit(c, man(B, cam, { f: 0, hero: null }), X, Y, S); c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(X, Y, SW, SH);
      hud(c, X, Y, S, { noPad: true, dots: ['ren', 'do'], sel: 'ren' }); bangLoRen(c, X + 164 * S, Y, S);
      putNpc(c, 'ren', X + 84 * S, Y + 250 * S, 0, { look: 1 }, S * 3); bubble(c, 'Đưa đây ông xem lưỡi nào!', X + 84 * S, Y + 112 * S, 30, { maxW: 330 });
    }
    c.restore();
    ngon(c, X + 36 * S, Y + 250 * S, 30 * S, 52 * S, 0.6); ngon(c, X + 448 * S, Y + (i ? 262 : 250) * S, 30 * S, 52 * S, -0.55);
    const yy = Y + SH + 110;
    if (i === 0) { text(c, 'Người đứng ở hàng trên và giữa màn hình. Dưới ngón tay chỉ có giếng, cây rơm, tấm tranh, con đò: che cũng không sao.', X - 60, yy, 25, CREAM); text(c, 'Bà Hàng Xén đứng thấp nhất nhưng nằm giữa hai ngón tay. Dải khuôn mặt ở mép trên, không ngón nào che.', X - 60, yy + 36, 25, CREAM); }
    else { text(c, 'Bảng nằm bên phải: nút chính (Mài) rơi đúng chỗ ngón phải vẫn bấm nút Đánh, không phải với tay.', X - 60, yy, 25, CREAM); text(c, 'Người đứng bên trái bảng và nói. Cần điều khiển ẩn đi khi bảng mở. Chạm khuôn mặt khác ở mép trên để sang người khác.', X - 60, yy + 36, 25, CREAM); }
  }
  return cv;
};
