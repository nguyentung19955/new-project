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
