// Bút vẽ pixel: vẽ hình vào lưới ô, rồi tự thêm viền tối.
const OL = '#14182e';
function S(w, h) { return { w, h, d: new Array(w * h).fill(null) }; }
function set(g, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.d[y * g.w + x] = c; }
function get(g, x, y) { return (x >= 0 && y >= 0 && x < g.w && y < g.h) ? g.d[y * g.w + x] : null; }
function ell(g, cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) set(g, x, y, c); } }
function rect(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c); }
function line(g, x0, y0, x1, y1, c, t) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2; t = t || 1; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (t <= 1) set(g, x, y, c); else ell(g, x + .5, y + .5, t / 2, t / 2, c); } }
function poly(g, pts, c) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) { const px = x + .5, py = y + .5; let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } if (ins) set(g, x, y, c); } }
// quả cầu có bóng: [tối, vừa, sáng]
function ball(g, cx, cy, rx, ry, cols) { ell(g, cx, cy, rx, ry, cols[0]); ell(g, cx - rx * .06, cy - ry * .14, rx * .9, ry * .84, cols[1]); if (cols[2]) ell(g, cx - rx * .38, cy - ry * .45, Math.max(1, rx * .3), Math.max(.8, ry * .22), cols[2]); }
// mắt to tròn: r bán kính, (dx,dy) hướng nhìn, brow: 0 không, 1 giận nghiêng trái thấp, -1 nghiêng phải thấp
function eye(g, x, y, r, dx, dy, brow, pc) { ell(g, x, y, r, r, '#ffffff'); const pr = Math.max(1, r * .55); ell(g, x + (dx || 0), y + (dy || 0), pr, pr, pc || '#14182e'); set(g, Math.floor(x + (dx || 0) - pr * .6), Math.floor(y + (dy || 0) - pr * .7), '#ffffff');
  if (brow) line(g, Math.round(x - r - .5), Math.round(y - r - (brow > 0 ? 1.2 : -.2)), Math.round(x + r - .5), Math.round(y - r - (brow > 0 ? -.2 : 1.2)), OL, 1); }
function mirror(g) { for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w / 2; x++) { const a = g.d[y * g.w + x], b = g.d[y * g.w + g.w - 1 - x]; if (a && !b) g.d[y * g.w + g.w - 1 - x] = a; else if (b && !a) g.d[y * g.w + x] = b; } }
function outline(g, col) { col = col || OL; const add = []; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (!g.d[y * g.w + x] && (get(g, x - 1, y) || get(g, x + 1, y) || get(g, x, y - 1) || get(g, x, y + 1))) add.push(y * g.w + x); for (const i of add) g.d[i] = col; return g; }
function bbox(g) { let x0 = g.w, x1 = 0, y0 = g.h, y1 = 0; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.d[y * g.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }; }
// Vẽ lưới ra canvas, chân (giữa đáy) đặt tại (x,y), phóng s lần. g.foot: hàng đáy tính làm chân (nếu có hiệu ứng thừa ra).
function draw(c, g, x, y, s, flip) { const b = g.bb || (g.bb = bbox(g)); const cx = g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, fy = g.foot != null ? g.foot : b.y1 + 1;
  for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) { const col = g.d[j * g.w + i]; if (!col) continue; c.fillStyle = col; const px = flip ? (cx - i - 1) : (i - cx); c.fillRect(Math.round(x + px * s), Math.round(y + (j - fy) * s), s, s); } }
function shadow(c, x, y, w, s) { c.fillStyle = 'rgba(0,0,0,.28)'; for (let j = 0; j < 2; j++) c.fillRect(Math.round(x - (w / 2 - j) * s), Math.round(y - s + j * s), Math.round((w - 2 * j) * s), s); }
