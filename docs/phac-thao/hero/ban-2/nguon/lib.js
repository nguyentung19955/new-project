// Bộ vẽ pixel nhỏ cho các tờ phác thảo hero.
// Mỗi hình là dữ liệu điểm ảnh đặt tay: toạ độ từng khối, từng điểm, và các miếng chuỗi ký tự ánh xạ qua bảng màu.
// Gốc (0,0) là điểm giữa hai bàn chân, x sang phải, y âm là lên trên. Hero quay mặt sang phải, sáng từ trên bên phải.
'use strict';
const INK = '#1b1118';

// Chất liệu là bộ ba sắc độ [tối, vừa, sáng]. Vẽ bằng bộ ba thì mép trên tự sáng, mép dưới và mép trái tự tối.
const Dk = (r) => ({ c: r, t: 0, f: true });
const Md = (r) => ({ c: r, t: 1, f: true });
const Lt = (r) => ({ c: r, t: 2, f: true });
function norm(c) {
  if (typeof c === 'string') return { c: [c, c, c], t: 1, f: true };
  if (Array.isArray(c)) return { c: c, t: 1, f: false };
  return { c: c.c, t: c.t, f: c.f };
}

class Spr {
  constructor(w, h, ox, oy) {
    this.w = w || 112; this.h = h || 96; this.ox = ox == null ? 48 : ox; this.oy = oy == null ? 86 : oy;
    const n = this.w * this.h;
    this.main = new Array(n).fill(null);
    this.olf = new Uint8Array(n); // điểm này là viền
    this.nol = new Uint8Array(n); // điểm này không cần viền ngoài (hiệu ứng, ánh sáng)
    this.lay = null; this.clip = false;
  }
  _i(x, y) {
    x = Math.round(x) + this.ox; y = Math.round(y) + this.oy;
    if (x < 1 || y < 1 || x >= this.w - 1 || y >= this.h - 1) return -1;
    return y * this.w + x;
  }
  // ----- các lệnh vẽ (vẽ vào lớp đang mở) -----
  p(x, y, c) {
    const i = this._i(x, y); if (i < 0) return;
    if (this.clip && !this.lay[i]) return;
    this.lay[i] = c === 0 ? null : norm(c);
  }
  r(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.p(x + i, y + j, c); }
  // hình bầu dục đặc, tâm (cx,cy) có thể là số lẻ .5
  e(cx, cy, rx, ry, c) {
    const a = rx + 0.35, b = ry + 0.35;
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x - cx) / a, dy = (y - cy) / b;
        if (dx * dx + dy * dy <= 1) this.p(x, y, c);
      }
  }
  // đa giác đặc
  g(pts, c) {
    let y0 = 1e9, y1 = -1e9; const n = pts.length;
    for (const q of pts) { if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    for (let y = Math.ceil(y0 - 0.5); y <= Math.floor(y1 + 0.5); y++) {
      const yy = Math.min(y1 - 0.01, Math.max(y0 + 0.01, y + 0.003)); const xs = [];
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        if ((a[1] <= yy) !== (b[1] <= yy)) xs.push(a[0] + ((yy - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) this.p(x, y, c);
    }
  }
  // đoạn thẳng dày w
  l(x0, y0, x1, y1, w, c) {
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))), o = w >> 1;
    for (let i = 0; i <= n; i++) this.r(Math.round(x0 + (dx * i) / n) - o, Math.round(y0 + (dy * i) / n) - o, w, w, c);
  }
  // đường gấp khúc dày w
  pl(pts, w, c) { for (let i = 0; i + 1 < pts.length; i++) this.l(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, c); }
  // dán miếng chuỗi: mỗi ký tự là một màu trong map, dấu chấm là trống, dấu ~ là xoá
  b(rows, x, y, map, flip) {
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[flip ? r.length - 1 - i : i];
        if (ch === '.' || ch === ' ') continue;
        if (ch === '~') { this.p(x + i, y + j, 0); continue; }
        const c = map[ch];
        if (c != null) this.p(x + i, y + j, c);
      }
    }
  }
  // chỉ vẽ đè lên chỗ lớp này đã có điểm (để thêm bóng, hoa văn mà không tràn ra ngoài)
  in(fn) { const o = this.clip; this.clip = true; fn(this); this.clip = o; }

  // ----- lớp -----
  // opt.ol: màu viền quanh lớp (mặc định mực tối; false là không viền)
  // opt.bevel: false thì không tự đánh sáng tối theo mép
  // opt.fx: lớp hiệu ứng (không viền, không tính vào bóng dáng)
  // opt.under: chỉ vẽ vào chỗ còn trống phía sau
  part(opt, fn) {
    if (typeof opt === 'function') { fn = opt; opt = {}; }
    const W = this.w, n = W * this.h;
    this.lay = new Array(n).fill(null); this.clip = false;
    fn(this);
    const L = this.lay, ol = opt.fx ? false : (opt.ol === undefined ? INK : opt.ol);
    if (opt.bevel !== false && !opt.fx) {
      const tone = new Int8Array(n);
      for (let i = W; i < n - W; i++) {
        const q = L[i]; if (!q || q.f) continue;
        if (!L[i - W]) tone[i] = 2; else if (!L[i + W] || !L[i - 1]) tone[i] = 0; else tone[i] = 1;
      }
      for (let i = W; i < n - W; i++) { const q = L[i]; if (q && !q.f) q.t = tone[i]; }
    }
    if (ol) {
      for (let i = W; i < n - W; i++) {
        if (!L[i]) continue;
        for (const d of [-1, 1, -W, W]) {
          const k = i + d;
          if (!L[k] && !(opt.under && this.main[k])) { this.main[k] = ol; this.olf[k] = 1; this.nol[k] = 0; }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const q = L[i]; if (!q) continue;
      if (opt.under && this.main[i] && !this.olf[i]) continue;
      if (opt.under && this.main[i]) continue;
      this.main[i] = q.c[q.t]; this.olf[i] = 0; this.nol[i] = opt.fx ? 1 : 0;
    }
    this.lay = null;
  }
  // khép viền ngoài bằng mực tối
  finish() {
    const W = this.w, n = W * this.h, M = this.main, add = [];
    for (let i = W; i < n - W; i++) {
      if (!M[i] || this.nol[i]) continue;
      let edge = false;
      for (const d of [-1, 1, -W, W]) if (!M[i + d] || this.nol[i + d]) { edge = true; if (!this.olf[i]) add.push(i + d); }
      if (edge && this.olf[i]) M[i] = INK;
    }
    for (const k of add) { M[k] = INK; this.olf[k] = 1; this.nol[k] = 0; }
    return this;
  }
  toCanvas() {
    const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
    const c = cv.getContext('2d');
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const q = this.main[y * this.w + x]; if (!q) continue;
      c.fillStyle = q; c.fillRect(x, y, 1, 1);
    }
    return cv;
  }
  // khung bao phần có hình
  bounds() {
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.main[y * this.w + x]) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { x0: x0 - this.ox, x1: x1 - this.ox, y0: y0 - this.oy, y1: y1 - this.oy };
  }
}

// Dựng một hình: fn(S) vẽ các lớp từ sau ra trước.
function sprite(fn, w, h, ox, oy) {
  const S = new Spr(w, h, ox, oy);
  fn(S); S.finish();
  return { cv: S.toCanvas(), ox: S.ox, oy: S.oy, bb: S.bounds() };
}
