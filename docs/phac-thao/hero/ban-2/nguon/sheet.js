// Xếp tờ phác thảo: tiêu đề, bốn nhân vật vẽ to, tư thế đánh, vũ khí tiến hoá, dải cỡ thật trong phòng.
'use strict';
const HUONGS = [];
const FONT = '"Inter","DejaVu Sans",sans-serif';
const PAGE = '#1c1921', PANEL = '#2b2632', PANEL2 = '#332d3b', CREAM = '#f1ead9', SOFT = '#cfc5b4', GOLDT = '#ffd27a';

function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
function rr(c, x, y, w, h, r, fill) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); }
function text(c, s, x, y, px, col, bold, align) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT; c.fillStyle = col; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y);
}
function wrap(c, s, maxW, px, bold) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT;
  const ws = s.split(' '), out = []; let cur = '';
  for (const w of ws) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function para(c, s, x, y, maxW, px, col, lh, align) {
  const ls = wrap(c, s, maxW, px, false);
  ls.forEach((l, i) => text(c, l, x, y + i * lh, px, col, false, align));
  return ls.length;
}
// Vẽ hình đã dựng, phóng s lần, điểm giữa hai chân đặt tại (x,y).
function put(c, sp, x, y, s) {
  c.imageSmoothingEnabled = false;
  c.drawImage(sp.cv, Math.round(x - sp.ox * s), Math.round(y - sp.oy * s), sp.cv.width * s, sp.cv.height * s);
}
// Bóng đổ hoặc gợn nước dưới chân (vẽ theo ô điểm ảnh, phóng s lần).
function base(c, kind, x, y, hw, s) {
  const px = (ix, iy, w, col) => { c.fillStyle = col; c.fillRect(Math.round(x + ix * s), Math.round(y + iy * s), w * s, s); };
  if (kind === 'nuoc') {
    const W = hw + 5;
    px(-W + 3, -2, 2 * W - 6, 'rgba(70,150,170,0.55)');
    px(-W + 1, -1, 2 * W - 2, 'rgba(70,150,170,0.55)');
    px(-W, 0, 2 * W, 'rgba(60,135,160,0.6)');
    px(-W + 1, 1, 2 * W - 2, 'rgba(50,115,145,0.6)');
    px(-W + 3, 2, 2 * W - 6, 'rgba(50,115,145,0.6)');
    // vòng gợn sáng
    px(-W + 4, -2, 5, '#bfeaf0'); px(W - 8, -2, 3, '#8fd0dc');
    px(-W + 1, -1, 3, '#8fd0dc'); px(W - 4, -1, 3, '#bfeaf0');
    px(-W, 0, 1, '#8fd0dc'); px(W - 1, 0, 1, '#8fd0dc');
    px(-W + 2, 1, 3, '#8fd0dc'); px(W - 6, 1, 4, '#8fd0dc');
    px(-W + 5, 2, 6, '#6fb7c9'); px(2, 2, 4, '#6fb7c9');
    // gợn ngoài
    px(-W - 4, 0, 2, 'rgba(143,208,220,0.6)'); px(W + 2, 0, 2, 'rgba(143,208,220,0.6)');
    px(-W - 1, 3, 4, 'rgba(143,208,220,0.45)'); px(W - 4, 3, 5, 'rgba(143,208,220,0.45)');
  } else {
    px(-hw + 2, -1, 2 * hw - 4, 'rgba(0,0,0,0.32)');
    px(-hw, 0, 2 * hw, 'rgba(0,0,0,0.32)');
    px(-hw + 2, 1, 2 * hw - 4, 'rgba(0,0,0,0.32)');
  }
}
const cache = new Map();
function spr(h, key, fn) {
  const id = h.id + '|' + key; let s = cache.get(id);
  if (!s) { s = sprite(fn); cache.set(id, s); } return s;
}
function heroSpr(h, i) { return spr(h, 'h' + i, h.heroes[i].draw); }
// Đặt nhân vật sao cho thân nằm giữa ô: dùng tâm chân, có thể chỉnh lệch bằng dx.
function putHero(c, h, i, x, y, s) {
  const he = h.heroes[i];
  x -= (he.dx || 0) * s;
  base(c, h.base || 'bong', x + (he.bx || 0) * s, y, he.bw || 9, s);
  put(c, heroSpr(h, i), x, y, s);
}

function renderSheet(h, bg) {
  const W = 1080, M = 20, CW = (W - M * 3) / 2;
  const [cv, c] = mk(W, 2400);
  c.fillStyle = PAGE; c.fillRect(0, 0, W, 2400);
  // tiêu đề
  text(c, h.title, M + 6, 80, 58, GOLDT, true);
  const n = para(c, h.intro, M + 6, 130, W - 2 * M - 12, 32, CREAM, 44);
  let y = 130 + (n - 1) * 44 + 34;
  // bốn nhân vật
  const S = h.scale || 8, CH = 580;
  for (let i = 0; i < 4; i++) {
    const cx = M + (i % 2) * (CW + M), cy = y + Math.floor(i / 2) * (CH + M), he = h.heroes[i];
    rr(c, cx, cy, CW, CH, 18, PANEL);
    rr(c, cx + 14, cy + 410, CW - 28, 6, 3, PANEL2);
    putHero(c, h, i, cx + CW / 2, cy + 404, S);
    text(c, he.name, cx + CW / 2, cy + 470, 46, he.col || GOLDT, true, 'center');
    para(c, he.desc, cx + CW / 2, cy + 514, CW - 36, 30, CREAM, 38, 'center');
  }
  y += 2 * (CH + M);
  // tư thế đánh
  const AH = 570;
  rr(c, M, y, CW, AH, 18, PANEL);
  text(c, 'Lúc đang đánh', M + 22, y + 50, 36, GOLDT, true);
  rr(c, M + 14, y + 496, CW - 28, 6, 3, PANEL2);
  const at = h.attack, as = at.scale || S, ax = M + CW / 2 - (at.dx || 0) * as;
  base(c, h.base || 'bong', ax + (at.bx || 0) * as, y + 490, at.bw || 10, as);
  put(c, spr(h, 'atk', at.draw), ax, y + 490, as);
  text(c, at.desc, M + CW / 2, y + 544, 28, SOFT, false, 'center');
  // vũ khí tiến hoá
  const wx = M * 2 + CW;
  rr(c, wx, y, CW, AH, 18, PANEL);
  text(c, h.weaponTitle || 'Vũ khí tiến hoá', wx + 22, y + 50, 36, GOLDT, true);
  const ws = h.weaponScale || 5;
  h.weapons.forEach((w, i) => {
    const qx = wx + (i % 2) * (CW / 2) + CW / 4, qy = y + 62 + Math.floor(i / 2) * 250;
    const sp = spr(h, 'w' + i, w.draw);
    // canh giữa theo khung bao của hình
    const mx = (sp.bb.x0 + sp.bb.x1 + 1) / 2, by = sp.bb.y1 + 1;
    put(c, sp, qx - mx * ws, qy + 200 - by * ws, ws);
    text(c, w.label, qx, qy + 238, 32, w.col, true, 'center');
  });
  y += AH + M;
  // cỡ thật trong phòng
  text(c, 'Cỡ thật trong game', M + 6, y + 44, 36, GOLDT, true);
  y += 62;
  const sw = Math.floor((W - 2 * M) / 3), sh = 132, sx = Math.floor((480 - sw) / 2), sy = 100;
  c.save(); c.beginPath(); c.roundRect(M, y, sw * 3, sh * 3, 14); c.clip();
  c.drawImage(bg, sx, sy, sw, sh, M, y, sw * 3, sh * 3);
  for (let i = 0; i < 4; i++) {
    const gx = Math.round(sw * (0.14 + i * 0.24)), gy = 200 - sy;
    putHero(c, h, i, M + gx * 3, y + gy * 3, 3);
  }
  c.restore();
  y += sh * 3 + M;
  const [out, oc] = mk(W, y);
  oc.drawImage(cv, 0, 0);
  return out;
}

// Tờ xem thử để soát từng điểm ảnh lúc làm.
function renderPreview(h, which, s) {
  s = s || 10;
  const items = [];
  h.heroes.forEach((he, i) => items.push(['h' + i, he.draw]));
  items.push(['atk', h.attack.draw]);
  h.weapons.forEach((w, i) => items.push(['w' + i, w.draw]));
  const sel = which ? items.filter((q) => which.includes(q[0])) : items;
  const sps = sel.map((q) => spr(h, q[0], q[1]));
  let W = 0, top = 0, bot = 0;
  for (const sp of sps) { W += (sp.bb.x1 - sp.bb.x0 + 9) * s; top = Math.min(top, sp.bb.y0); bot = Math.max(bot, sp.bb.y1); }
  const H = (bot - top + 8) * s;
  const [cv, c] = mk(W, H);
  c.fillStyle = PANEL; c.fillRect(0, 0, W, H);
  let x = 0;
  for (const sp of sps) {
    const w = (sp.bb.x1 - sp.bb.x0 + 9) * s;
    put(c, sp, x + (4 - sp.bb.x0) * s, (4 - top) * s, s);
    x += w;
  }
  return cv;
}

// Tờ so sánh: hero hiện tại và bốn hướng.
function renderCompare(cur) {
  const W = 1080, M = 20, S = 5, RH = 330;
  const [cv, c] = mk(W, 150 + 5 * (RH + M));
  c.fillStyle = PAGE; c.fillRect(0, 0, W, cv.height);
  text(c, 'So sánh bốn hướng tạo hình', M + 6, 74, 54, GOLDT, true);
  text(c, 'Hàng đầu là nhân vật đang có trong game.', M + 6, 122, 30, CREAM, false);
  let y = 150;
  const CW = (W - 2 * M) / 4;
  const row = (label, fn) => {
    rr(c, M, y, W - 2 * M, RH, 18, PANEL);
    text(c, label, M + 20, y + 48, 38, GOLDT, true);
    rr(c, M + 14, y + RH - 34, W - 2 * M - 28, 5, 2, PANEL2);
    for (let i = 0; i < 4; i++) fn(i, M + CW * i + CW / 2, y + RH - 38);
    y += RH + M;
  };
  row('Hiện tại', (i, x, fy) => {
    base(c, 'bong', x - 3 * S, fy, 9, S);
    c.drawImage(cur, i * 96, 0, 96, 80, Math.round(x - 43 * S), Math.round(fy - 70 * S), 96 * S, 80 * S);
  });
  for (const h of HUONGS) row(h.title, (i, x, fy) => putHero(c, h, i, x, fy, h.cmpScale || S));
  return cv;
}
