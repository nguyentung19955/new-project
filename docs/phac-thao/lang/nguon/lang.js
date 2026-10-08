// Vẽ làng và người làng cho tờ phác thảo "làng có người". Mọi toạ độ là điểm ảnh logic (khung 480x270).
'use strict';
const TL = G.tinhLinh, TO = {};
const FONT = '"Inter","DejaVu Sans",sans-serif';
const PAGE = '#1c1921', PANEL = '#2b2632', PANEL2 = '#332d3b', CREAM = '#f1ead9', SOFT = '#cfc5b4', GOLDT = '#ffd27a';
function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
function rr(c, x, y, w, h, r, fill, stroke, lw) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } }
function text(c, s, x, y, px, col, bold, align) { c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT; c.fillStyle = col; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }
function wrap(c, s, maxW, px, bold) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT;
  const out = []; let cur = '';
  for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function para(c, s, x, y, maxW, px, col, lh, align, bold) { const ls = wrap(c, s, maxW, px, bold); ls.forEach((l, i) => text(c, l, x, y + i * lh, px, col, bold, align)); return ls.length; }
function p(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
function ell(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.5) * (ry + 0.5))))); c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); }
}
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Viền tối 1 điểm quanh hình (cùng kiểu với em bé hero)
function outlined(w, h, ox, oy, draw, col) {
  const [a, ac] = mk(w, h); ac.translate(ox, oy); draw(ac);
  const [t, tc] = mk(w, h); tc.drawImage(a, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col || '#1a1420'; tc.fillRect(0, 0, w, h);
  const [o, oc] = mk(w, h);
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) oc.drawImage(t, d[0], d[1]);
  oc.drawImage(a, 0, 0);
  return { cv: o, ox, oy };
}
function line(c, x0, y0, x1, y1, t, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) p(c, x0 + ((x1 - x0) * i) / n - (t >> 1), y0 + ((y1 - y0) * i) / n - (t >> 1), t, t, col); }

// ======================= NGƯỜI LÀNG =======================
const MASK = '#f4eee0', MASK2 = '#d9cfbb', INK = '#1a1420';
const NPCS = {
  ren: { ten: 'Ông Thợ Rèn', robe: '#9a4a30', robe2: '#7a3622', wide: 2, top: -27 },
  xen: { ten: 'Bà Hàng Xén', robe: '#8a5a38', robe2: '#6e4428', wide: 1, top: -23 },
  may: { ten: 'Cô Thợ May', robe: '#d86a7a', robe2: '#b04a5e', wide: -1, top: -28 },
  do: { ten: 'Cụ Đồ', robe: '#4a548c', robe2: '#363e6c', wide: 0, top: -24, sit: true },
  tu: { ten: 'Ông Từ', robe: '#d0a440', robe2: '#a87e2a', wide: 0, top: -27 },
  lai: { ten: 'Chú Lái Đò', robe: '#8a5632', robe2: '#6a3e22', wide: 0, top: -27 },
  mo: { ten: 'Anh Mõ', robe: '#3f9a8c', robe2: '#2c7468', wide: -1, top: -26 },
};
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
  // mắt
  const ex = look > 0 ? 1 : look < 0 ? -1 : 0, blink = o.blink;
  if (kind === 'do' && !look) { p(c, -5, y + 6, 3, 1, INK); p(c, 2, y + 6, 3, 1, INK); p(c, -4, y + 5, 1, 1, INK); p(c, 3, y + 5, 1, 1, INK); }
  else if (blink) { p(c, -5 + ex, y + 6, 3, 1, INK); p(c, 2 + ex, y + 6, 3, 1, INK); }
  else { const eh = look ? 4 : 3, ey = look ? y + 4 : y + 5; p(c, -5 + ex, ey, 3, eh, INK); p(c, 2 + ex, ey, 3, eh, INK); p(c, -4 + ex, ey, 1, 1, '#fff'); p(c, 3 + ex, ey, 1, 1, '#fff'); }
  p(c, -7, y + 8, 2, 1, '#f0a090'); p(c, 5, y + 8, 2, 1, '#f0a090');
  // đầu tóc, mũ, râu
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
  // tay và đồ cầm
  const sh = b0 + 2, A = N.robe, hwid = 5 + w;
  function arm(side, hx, hy) { line(c, side * (hwid + 1), sh, hx, hy, 3, side > 0 ? N.robe2 : A); p(c, hx - 1, hy - 1, 3, 3, MASK); }
  if (kind === 'ren') {
    const H = [[11, -24], [13, -17], [11, -8]][f % 3];
    arm(-1, -9, -9); arm(1, H[0], H[1]);
    if (f % 3 === 0) { p(c, H[0], H[1] - 9, 2, 9, '#8a5a34'); p(c, H[0] - 3, H[1] - 14, 8, 6, '#9aa0aa'); p(c, H[0] - 3, H[1] - 14, 8, 2, '#c8ccd4'); }
    else if (f % 3 === 1) { line(c, H[0], H[1], H[0] + 6, H[1] - 6, 2, '#8a5a34'); p(c, H[0] + 4, H[1] - 11, 7, 7, '#9aa0aa'); p(c, H[0] + 4, H[1] - 11, 7, 2, '#c8ccd4'); }
    else { p(c, H[0], H[1], 8, 2, '#8a5a34'); p(c, H[0] + 7, H[1] - 2, 6, 8, '#9aa0aa'); p(c, H[0] + 7, H[1] - 2, 6, 2, '#c8ccd4'); p(c, 22, -11, 1, 2, '#ffe07a'); p(c, 25, -8, 2, 1, '#ffb040'); p(c, 16, -13, 1, 1, '#fff3b0'); p(c, 24, -14, 1, 1, '#ffe07a'); }
  }
  if (kind === 'xen') {
    arm(-1, -4, -8); arm(1, 4, -8);
    const cy = [-11, -15, -12][f % 3]; p(c, -1, cy, 3, 3, '#ffd23f'); p(c, 0, cy, 1, 1, '#fff3b0'); p(c, -3, -8, 2, 1, '#ffd23f'); if (f % 3 === 1) p(c, 3, -17, 1, 1, '#fff3b0');
  }
  if (kind === 'may') { const d = f % 2; arm(-1, 7, -12 + d * 2); arm(1, 10, -9 - d * 2); }
  if (kind === 'do') {
    if (f % 3 === 2) { arm(-1, -8, -7); arm(1, 10, -8); line(c, 10, -8, 13, -3, 1, '#8a5a34'); p(c, 13, -3, 1, 2, INK); }
    else { arm(-1, -8, -6); arm(1, 2, f % 3 ? -9 : -13); }
  }
  if (kind === 'tu') {
    const d = f % 2 ? 4 : -2; arm(-1, -8, -10); arm(1, 8, -11);
    line(c, -8, -10, 8, -11, 1, '#8a5a34'); line(c, 8, -11, 12 + d, -3, 2, '#b08a4a'); for (let i = 0; i < 5; i++) p(c, 10 + d + i, -3 + (i % 2), 1, 3, i % 2 ? '#d8b860' : '#b08a4a');
    line(c, -8, -10, -12, -22, 1, '#8a5a34'); if (f % 2) { p(c, 20, -2, 1, 1, '#d9cdb8'); p(c, 22, -4, 1, 1, '#d9cdb8'); }
  }
  if (kind === 'lai') { const d = f % 2; arm(-1, -8, -9); arm(1, 9 + d, -13); line(c, 9 + d * 3, -36, 9 - d, 0, 2, '#b8a45a'); p(c, 8 + d, -14, 3, 3, MASK); }
  if (kind === 'mo') {
    arm(-1, -9, -12); p(c, -13, -15, 7, 6, '#8a5a34'); p(c, -13, -15, 7, 1, '#b07a48'); p(c, -11, -12, 4, 1, '#3a2418');
    if (f % 2) { arm(1, -4, -17); line(c, -4, -17, -8, -18, 1, '#e8d9a0'); p(c, -16, -20, 2, 1, '#fff3b0'); p(c, -18, -17, 1, 2, '#fff3b0'); p(c, -15, -23, 1, 2, '#fff3b0'); }
    else { arm(1, 8, -18); line(c, 8, -18, 6, -25, 1, '#e8d9a0'); }
  }
}
const NCACHE = {};
function npcSprite(kind, f, o) {
  o = o || {}; const id = kind + f + (o.look || 0) + (o.blink ? 'b' : '');
  return NCACHE[id] || (NCACHE[id] = outlined(64, 64, 30, 50, (c) => drawNpc(c, kind, f, o)));
}
function putNpc(c, kind, x, y, f, o, s) {
  s = s || 1; const sp = npcSprite(kind, f || 0, o);
  if (!(o && o.noShadow)) { c.fillStyle = 'rgba(10,8,20,0.35)'; c.fillRect(Math.round(x - 8 * s), Math.round(y - 1 * s), 16 * s, 3 * s); c.fillRect(Math.round(x - 6 * s), Math.round(y + 2 * s), 12 * s, s); }
  c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(x - sp.ox * s), Math.round(y - sp.oy * s), 64 * s, 64 * s);
}
// dấu chấm than "có việc mới"
function bang(c, x, y, s) { s = s || 1; c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s); p(c, -4, -11, 9, 11, INK); p(c, -3, -12, 7, 13, INK); p(c, -3, -10, 7, 9, '#ffd23f'); p(c, -2, -11, 5, 11, '#ffd23f'); p(c, -1, -9, 3, 5, '#7a2a12'); p(c, -1, -3, 3, 2, '#7a2a12'); p(c, -1, 1, 3, 2, INK); c.restore(); }
// em bé hero (không cầm vũ khí) và vũ khí sống bay theo sau
function putHero(c, x, y, s, o) {
  s = s || 1; o = o || {};
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s);
  TL.hero(c, Object.assign({ x: 0, y: 0, face: 1, atk: -1, dodge: -1, t: 0, anim: 'idle', f: 0, v: 0, key: 'smith', weapon: null }, o));
  c.restore();
}
function putWeapon(c, x, y, s, type, bob) {
  s = s || 1; const sp = TL.weaponSprite(type || 'sword', 'thuong', 'idle', -90, 0);
  c.fillStyle = 'rgba(10,8,20,0.3)'; c.fillRect(Math.round(x - 4 * s), Math.round(y - s), 9 * s, 2 * s);
  c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(x - sp.ox * s), Math.round(y - (14 + (bob || 0)) * s - sp.oy * s), sp.cv.width * s, sp.cv.height * s);
}

// ======================= CÔNG TRÌNH =======================
function thatch(c, x, y, w, h) { // mái rơm: (x,y) góc trên trái
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
function loRen(c, x, y, f) {
  // ống khói và khói
  p(c, x - 24, y - 70, 10, 20, '#6a4a44'); p(c, x - 25, y - 71, 12, 3, '#4a3230'); ell(c, x - 18, y - 76, 4, 3, 'rgba(200,190,200,0.5)'); ell(c, x - 14, y - 83, 5, 3, 'rgba(200,190,200,0.35)'); ell(c, x - 8, y - 90, 4, 2, 'rgba(200,190,200,0.2)');
  // lò gạch
  p(c, x - 32, y - 36, 34, 34, '#7a4a40'); for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) p(c, x - 32 + j * 8 - (i % 2) * 4, y - 36 + i * 6, 7, 1, '#5a3430');
  p(c, x - 26, y - 24, 20, 18, '#2a1818'); p(c, x - 24, y - 20, 16, 14, '#e8562a'); p(c, x - 22, y - 16, 12, 10, '#ffb040'); p(c, x - 19, y - 12, 6, 6, '#fff3b0'); p(c, x - 21, y - 22, 2, 3, '#ffb040'); p(c, x - 13, y - 23, 2, 4, '#ffd23f');
  p(c, x - 34, y - 2, 38, 2, '#4a3230');
  // cột, giá vũ khí
  p(c, x - 36, y - 40, 3, 40, '#5e4432'); p(c, x + 34, y - 40, 3, 40, '#5e4432');
  p(c, x + 22, y - 26, 12, 2, '#5e4432'); p(c, x + 24, y - 24, 2, 20, '#c8ccd4'); p(c, x + 23, y - 8, 4, 1, '#c9a24f'); p(c, x + 29, y - 24, 2, 16, '#9aa0aa'); p(c, x + 28, y - 26, 4, 3, '#8a5a34');
  thatch(c, x - 42, y - 58, 84, 20);
  lantern(c, x + 30, y - 36);
}
function de(c, x, y) { p(c, x - 5, y - 4, 10, 4, '#5e4432'); p(c, x - 3, y - 8, 7, 4, '#4a4a54'); p(c, x - 7, y - 12, 15, 4, '#6a6a76'); p(c, x - 7, y - 12, 15, 1, '#9aa0aa'); p(c, x + 8, y - 11, 3, 2, '#6a6a76'); p(c, x - 1, y - 13, 5, 1, '#ffb040'); }
function hangXen(c, x, y) {
  // ô giấy
  p(c, x - 1, y - 40, 2, 40, '#6a4a34'); ell(c, x, y - 40, 22, 7, '#b8822a'); ell(c, x, y - 42, 20, 6, '#e8b040'); for (let i = -3; i <= 3; i++) line(c, x, y - 47, x + i * 6, y - 37, 1, '#b8822a'); p(c, x - 1, y - 49, 3, 3, '#d8482e');
  // chiếu hàng
  p(c, x + 8, y - 6, 28, 12, '#a8553a'); p(c, x + 8, y - 6, 28, 1, '#c87050'); p(c, x + 8, y + 5, 28, 1, '#7a3a26');
  const cols = ['#6fc0d0', '#ffd23f', '#f08aa8', '#9be07a', '#f4eee0', '#d48af5'];
  for (let i = 0; i < 6; i++) p(c, x + 11 + (i % 3) * 8, y - 4 + Math.floor(i / 3) * 5, 4, 3, cols[i]);
  // quang gánh
  ell(c, x - 22, y - 3, 8, 4, '#8a6a34'); ell(c, x - 22, y - 5, 8, 3, '#c9a24f'); p(c, x - 26, y - 7, 3, 2, '#d8482e'); p(c, x - 21, y - 8, 3, 3, '#9be07a'); p(c, x - 18, y - 6, 2, 2, '#ffd23f');
  line(c, x - 30, y - 5, x - 22, y - 20, 1, '#6a4a34'); line(c, x - 14, y - 5, x - 22, y - 20, 1, '#6a4a34'); line(c, x - 36, y - 18, x - 8, y - 22, 2, '#b8a45a');
  // rương đồ
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
  p(c, x - 8, y - 9, 18, 6, '#f08aa8'); p(c, x - 8, y - 9, 18, 1, '#ffd0dc'); p(c, x - 8, y - 6, 18, 1, '#6fc0d0'); p(c, x - 6 + (f % 2) * 10, y - 12, 5, 2, '#ffd23f');
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
  // con cóc
  p(c, x - 12, y - 14, 6, 4, '#5a8a3a'); p(c, x - 12, y - 16, 2, 2, '#7ab04a'); p(c, x - 8, y - 16, 2, 2, '#7ab04a'); p(c, x - 12, y - 15, 1, 1, INK); p(c, x - 7, y - 15, 1, 1, INK); p(c, x - 13, y - 11, 8, 1, '#3a5a26');
}
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
function ga(c, x, y, col) { p(c, x - 3, y - 4, 6, 3, col || '#f4eee0'); p(c, x + 2, y - 6, 2, 3, col || '#f4eee0'); p(c, x + 2, y - 7, 2, 1, '#d8482e'); p(c, x + 4, y - 5, 1, 1, '#ffb040'); p(c, x - 4, y - 5, 2, 2, col || '#f4eee0'); p(c, x - 1, y - 1, 1, 1, '#ffb040'); p(c, x + 1, y - 1, 1, 1, '#ffb040'); }
function chieu(c, x, y) { p(c, x - 14, y - 5, 28, 9, '#c8a060'); p(c, x - 14, y - 5, 28, 1, '#e0c080'); p(c, x - 14, y + 3, 28, 1, '#8a6a38'); p(c, x + 4, y - 3, 8, 6, '#d8482e'); p(c, x + 6, y - 2, 1, 3, INK); p(c, x + 8, y - 1, 2, 1, INK); p(c, x - 12, y - 3, 4, 3, '#2a2230'); p(c, x - 12, y + 1, 9, 2, '#e8dcb8'); }
function glow(c, x, y, r, col) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 3; i >= 1; i--) ell(c, x, y, Math.round((r * i) / 3), Math.round((r * i) / 4.4), col || 'rgba(255,150,60,0.07)'); c.restore(); }

// ======================= BỐ CỤC LÀNG =======================
// Mỗi bố cục: W (bề rộng làng), vị trí công trình và người.
const BO_CUC = {
  rong: { W: 720, cong: [64, 60], mo: [100, 92], dinh: [196, 116], tu: [142, 140], be: [[186, 134, 'hunter'], [206, 142, 'healer'], [226, 134, 'wrestler']], da: [338, 128], doo: [364, 150], gieng: [296, 196], ren: [462, 112], renN: [468, 132], xen: [552, 196], xenN: [540, 198], may: [594, 108], mayN: [574, 132], cui: [592, 132], phoi: [520, 104, 38], song: 652, cau: [636, 156, 36], lai: [638, 154], thuyen: [694, 178], tranh: [618, 196], ao: [86, 228, 58, 24], rom: [404, 240], hero: [500, 184] },
  vua: { W: 480, cong: [40, 60], mo: [70, 90], dinh: [150, 114], tu: [100, 136], be: [[140, 132, 'hunter'], [158, 138, 'healer'], [176, 132, 'wrestler']], da: [262, 104], doo: [282, 128], gieng: [214, 176], ren: [356, 112], renN: [362, 132], xen: [300, 190], xenN: [288, 192], may: [0, 0], mayN: [196, 208], cui: [214, 208], phoi: [150, 196, 28], song: 428, cau: [412, 152, 36], lai: [414, 150], thuyen: [462, 172], tranh: [412, 118], ao: [0, 0, 0, 0], rom: [0, 0], hero: [330, 160] },
};
const NGUOI = [ // thứ tự đánh số trên tờ toàn cảnh
  { k: 'lai', pos: 'lai', ten: 'Chú Lái Đò', noi: 'bến đò', viec: 'Vào ải: tranh bản đồ, chọn vùng, chọn ải, độ khó' },
  { k: 'ren', pos: 'renN', ten: 'Ông Thợ Rèn', noi: 'lò rèn', viec: 'Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò' },
  { k: 'xen', pos: 'xenN', ten: 'Bà Hàng Xén', noi: 'gánh hàng', viec: 'Rương vũ khí, chọn 2 món mang theo, bán đồ' },
  { k: 'may', pos: 'mayN', ten: 'Cô Thợ May', noi: 'khung cửi', viec: 'Mũ, áo, bùa; sắp có: đồ đeo lưng, cánh' },
  { k: 'do', pos: 'doo', ten: 'Cụ Đồ', noi: 'gốc đa', viec: 'Cây kỹ năng, đặt lại điểm, hướng dẫn cách chơi' },
  { k: 'tu', pos: 'tu', ten: 'Ông Từ', noi: 'sân đình', viec: 'Chọn hero, xem chỉ số từng bé' },
  { k: 'mo', pos: 'mo', ten: 'Anh Mõ', noi: 'cổng làng', viec: 'Cài đặt: âm thanh, toàn màn hình, xoá tiến trình' },
];
function grass(c, W, seed) {
  p(c, 0, 0, W, 270, '#3a5a40'); const rd = rng(seed || 3);
  for (let i = 0; i < W * 0.9; i++) { const x = rd() * W, y = 56 + rd() * 214, k = rd(); if (k < 0.35) ell(c, x, y, 6 + rd() * 14, 3 + rd() * 5, k < 0.18 ? '#345238' : '#40624a'); }
  for (let i = 0; i < W * 1.6; i++) { const x = rd() * W, y = 58 + rd() * 212, k = rd(); if (k < 0.5) { p(c, x, y, 1, 2, '#4f7a52'); p(c, x + 1, y + 1, 1, 1, '#4f7a52'); } else if (k < 0.8) p(c, x, y, 2, 1, '#2e4a36'); else if (k < 0.9) p(c, x, y, 1, 1, '#f4eee0'); else p(c, x, y, 1, 1, '#ffd23f'); }
}
function path(c, pts, r, seed) {
  const rd = rng(seed || 9);
  for (const pass of [0, 1, 2]) for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4); for (let j = 0; j <= n; j++) { const x = a[0] + ((b[0] - a[0]) * j) / n, y = a[1] + ((b[1] - a[1]) * j) / n, rr2 = r + Math.round(Math.sin(x * 0.11 + y * 0.07) * 2); if (pass === 0) ell(c, x, y + 1, rr2 + 2, Math.round(rr2 * 0.6) + 1, '#5a4a3c'); else if (pass === 1) ell(c, x, y, rr2, Math.round(rr2 * 0.6), '#8a705a'); else if (rd() < 0.5) p(c, x + (rd() - 0.5) * rr2 * 1.6, y + (rd() - 0.5) * rr2, rd() < 0.5 ? 2 : 1, 1, rd() < 0.5 ? '#a08670' : '#70584a'); } }
}
function hedge(c, W) {
  p(c, 0, 0, W, 54, '#16261e'); const rd = rng(21);
  for (let x = 0; x < W; x += 5) { const h = 30 + rd() * 22; p(c, x + rd() * 3, 54 - h, 2, h, rd() < 0.5 ? '#4a7a48' : '#3a6240'); if (rd() < 0.6) p(c, x, 54 - h * rd(), 3, 1, '#2a4a34'); }
  for (let i = 0; i < W / 3; i++) { const x = rd() * W, y = rd() * 40; ell(c, x, y, 5 + rd() * 6, 2 + rd() * 3, rd() < 0.5 ? '#244a34' : '#2e5a3c'); }
  for (let i = 0; i < W / 4; i++) { const x = rd() * W, y = rd() * 46; p(c, x, y, 3, 1, '#4f8a52'); p(c, x + 1, y + 1, 3, 1, '#3a6a44'); }
  p(c, 0, 52, W, 3, '#101a16'); p(c, 0, 55, W, 2, '#2e4a36');
}
function river(c, W, x0) {
  for (let y = 0; y < 270; y++) { const e = x0 + Math.round(Math.sin(y * 0.06) * 5 + Math.sin(y * 0.17) * 2); p(c, e - 3, y, 3, 1, '#6a5a44'); p(c, e, y, W - e, 1, '#24465c'); p(c, e, y, 2, 1, '#3a6a8a'); }
  const rd = rng(5); for (let i = 0; i < 40; i++) { const x = x0 + 8 + rd() * (W - x0 - 12), y = rd() * 270; p(c, x, y, 4 + rd() * 5, 1, rd() < 0.5 ? '#2e5870' : '#4a80a0'); }
  for (let i = 0; i < 5; i++) { const y = 20 + i * 52 + rd() * 20, e = x0 + Math.round(Math.sin(y * 0.06) * 5); p(c, e - 5, y - 9, 1, 10, '#4f7a52'); p(c, e - 7, y - 7, 1, 8, '#3a6240'); p(c, e - 3, y - 6, 1, 7, '#4f7a52'); p(c, e - 5, y - 11, 1, 2, '#8a5a34'); }
}
// Vẽ làng. o: { f: khung động tác, hero: [x,y] hoặc null, look: { ren: 1 }, bang: ['ren','do'], dem: true, khongNguoi }
function lang(c, B, o) {
  o = o || {}; const W = B.W, f = o.f || 0;
  grass(c, W, W); hedge(c, W); river(c, W, B.song);
  // đường đất
  const yM = B.lai[1] + 6;
  path(c, [[B.cong[0], 58], [B.cong[0] + 6, yM - 20], [B.cong[0] + 40, yM], [B.dinh[0], yM + 6], [B.da[0], yM + 2], [B.ren[0], yM], [B.lai[0] - 10, yM]], 9, 4);
  path(c, [[B.dinh[0], B.dinh[1]], [B.dinh[0], yM + 4]], 8, 5); path(c, [[B.renN[0], B.renN[1]], [B.renN[0], yM]], 8, 6);
  path(c, [[B.gieng[0], yM], [B.gieng[0], B.gieng[1]]], 7, 7); path(c, [[B.xenN[0] + 6, yM], [B.xenN[0] + 10, B.xenN[1] + 4]], 9, 8);
  if (B.may[0]) path(c, [[B.mayN[0] + 6, B.mayN[1]], [B.mayN[0] + 6, yM]], 8, 10); else path(c, [[B.mayN[0] + 10, yM + 4], [B.mayN[0] + 10, B.mayN[1] + 2]], 9, 10);
  // sân đình lát gạch
  const dx = B.dinh[0], dy = B.dinh[1]; p(c, dx - 60, dy, 120, 34, '#7a5e52'); for (let i = 0; i < 5; i++) for (let j = 0; j < 15; j++) p(c, dx - 60 + j * 8 + (i % 2) * 4, dy + i * 7, 7, 6, (i + j) % 3 ? '#96705e' : '#a47c68'); p(c, dx - 60, dy + 34, 120, 1, '#4a3a34');
  if (B.ao[2]) aoSen(c, B.ao[0], B.ao[1], B.ao[2], B.ao[3]);
  // các vật xếp theo chiều sâu
  const L = [];
  L.push([58, () => cong(c, B.cong[0], B.cong[1])]);
  L.push([B.dinh[1], () => dinh(c, dx, dy)]);
  L.push([B.da[1], () => cayDa(c, B.da[0], B.da[1])]);
  L.push([B.doo[1] - 1, () => chieu(c, B.doo[0] + 4, B.doo[1])]);
  L.push([B.ren[1], () => loRen(c, B.ren[0], B.ren[1], f)]);
  L.push([B.renN[1] - 1, () => de(c, B.renN[0] + 20, B.renN[1] + 1)]);
  L.push([B.xen[1] - 2, () => hangXen(c, B.xen[0], B.xen[1])]);
  if (B.may[0]) L.push([B.may[1], () => nhaMay(c, B.may[0], B.may[1])]);
  L.push([B.cui[1] + 1, () => khungCui(c, B.cui[0], B.cui[1] + 1, f)]);
  L.push([B.phoi[1], () => dayPhoi(c, B.phoi[0], B.phoi[1], B.phoi[2])]);
  L.push([B.gieng[1], () => gieng(c, B.gieng[0], B.gieng[1])]);
  L.push([B.cau[1] - 6, () => cau(c, B.cau[0], B.cau[1], B.cau[2])]);
  L.push([B.thuyen[1], () => thuyen(c, B.thuyen[0], B.thuyen[1])]);
  L.push([B.tranh[1], () => bangTranh(c, B.tranh[0], B.tranh[1])]);
  if (B.rom[0]) { L.push([B.rom[1], () => cayRom(c, B.rom[0], B.rom[1])]); L.push([B.rom[1] + 2, () => { chum(c, B.rom[0] + 22, B.rom[1] + 2); chum(c, B.rom[0] + 32, B.rom[1] - 2); }]); L.push([B.rom[1] - 20, () => { ga(c, B.rom[0] - 34, B.rom[1] - 18); ga(c, B.rom[0] - 22, B.rom[1] - 8, '#c87050'); ga(c, B.rom[0] - 44, B.rom[1] - 4, '#ffd23f'); }]); }
  const posts = W > 500 ? [[262, 152], [420, 180], [130, 190]] : [[230, 150], [350, 182]];
  for (const q of posts) L.push([q[1], () => lampPost(c, q[0], q[1])]);
  L.sort((a, b) => a[0] - b[0]); for (const l of L) l[1]();
  // trời chạng vạng và quầng sáng
  if (o.dem !== false) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#b6b0dc'; c.fillRect(0, 0, W, 270); c.restore();
    glow(c, B.ren[0] - 16, B.ren[1] - 6, 46, 'rgba(255,130,50,0.10)'); glow(c, dx, dy - 4, 60); glow(c, B.da[0], B.da[1] - 14, 54); glow(c, B.cong[0], 44, 40);
    if (B.may[0]) glow(c, B.may[0] - 10, B.may[1], 40); glow(c, B.thuyen[0] + 10, B.thuyen[1] - 6, 30); glow(c, B.tranh[0], B.tranh[1] - 12, 26, 'rgba(255,190,80,0.05)'); glow(c, B.xen[0], B.xen[1] - 10, 30, 'rgba(255,190,80,0.05)');
    for (const q of posts) glow(c, q[0] - 4, q[1] - 12, 30);
  }
  if (o.khongNguoi) return;
  // người
  const P = [];
  for (const n of NGUOI) { const q = B[n.pos], lk = (o.look && o.look[n.k]) || 0; P.push([q[1], () => { putNpc(c, n.k, q[0], q[1], lk ? 0 : f + n.k.length, { look: lk }); if (o.bang && o.bang.includes(n.k)) bang(c, q[0] - (n.k === 'ren' ? 6 : 0), q[1] + NPCS[n.k].top - 9); }]); }
  for (const b of B.be) P.push([b[1], () => putHero(c, b[0], b[1], 1, { key: b[2], face: b[0] > dx ? -1 : 1 })]);
  const h = o.hero === undefined ? B.hero : o.hero;
  if (h) { P.push([h[1] - 1, () => putWeapon(c, h[0] - 17 * (h[2] || 1), h[1] - 2, 1, 'sword', f % 2)]); P.push([h[1], () => putHero(c, h[0], h[1], 1, { face: h[2] || 1, anim: h[3] || 'idle', f: h[4] || 0 })]); }
  P.sort((a, b) => a[0] - b[0]); for (const l of P) l[1]();
  // đom đóm
  if (o.dem !== false) { const rd = rng(77); for (let i = 0; i < W / 14; i++) { const x = rd() * W, y = 40 + rd() * 220; c.fillStyle = 'rgba(210,255,120,0.22)'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); p(c, x, y, 1, 1, '#eaff9a'); } }
}
function veLang(B, o) { const [cv, c] = mk(B.W, 270); lang(c, B, o); return cv; }
