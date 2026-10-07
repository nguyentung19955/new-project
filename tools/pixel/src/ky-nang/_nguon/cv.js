// Vẽ lưới 18×18 bằng hình cơ bản (rồi gen.js tự đổ bóng)
class Cv {
  constructor(base) { this.g = base ? base.map((r) => [...r]) : Array.from({ length: 18 }, () => Array(18).fill('.')); }
  p(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < 18 && y < 18) this.g[y][x] = c; return this; }
  disc(cx, cy, r, c) { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.g[y][x] = c; return this; }
  ell(cx, cy, rx, ry, c) { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) this.g[y][x] = c; return this; }
  ring(cx, cy, r, c, w = 1) { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) { const d = Math.hypot(x - cx, y - cy); if (d <= r + 0.5 && d > r + 0.5 - w) this.g[y][x] = c; } return this; }
  arc(cx, cy, r, a0, a1, c, w = 1) { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) { const d = Math.hypot(x - cx, y - cy); let a = Math.atan2(y - cy, x - cx) * 180 / Math.PI; if (a < 0) a += 360; const inA = a0 <= a1 ? (a >= a0 && a <= a1) : (a >= a0 || a <= a1); if (inA && d <= r + 0.5 && d > r + 0.5 - w) this.g[y][x] = c; } return this; }
  rect(x0, y0, w, h, c) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.p(x, y, c); return this; }
  line(x0, y0, x1, y1, c, w = 1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 || 1; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) this.p(x + dx - (w - 1) / 2, y + dy - (w - 1) / 2, c); } return this; }
  poly(pts, c) { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y + 0.5) !== (yj > y + 0.5) && x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi) ins = !ins; } if (ins) this.g[y][x] = c; } return this; }
  stamp(rows, x0 = 0, y0 = 0) { rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') this.p(x0 + x, y0 + y, c); })); return this; }
  rep(from, to) { this.g = this.g.map((r) => r.map((c) => (from.includes(c) ? to : c))); return this; }
  rows() { return this.g.map((r) => r.join('')); }
}
module.exports = (base) => new Cv(base);
