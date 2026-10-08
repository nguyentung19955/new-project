// Quái và trùm vẽ lại cho cùng nét với em bé tinh linh và vũ khí sống.
// Nạp SAU art.js thì thay G.art.enemy và G.art.boss; hàm cũ giữ ở G.art.enemyOld và G.art.bossOld,
// bản mới lỗi thì tự gọi lại hàm cũ. File tự đứng một mình: tờ phác thảo cũng nạp chính file này.
// Gốc (0,0) của mọi hình là điểm giữa chân chạm đất, x sang phải, y âm là lên trên. Hình gốc quay mặt sang PHẢI.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const INK = '#1b1118';

  // ====================================================================
  // 1. BỘ VẼ ĐIỂM ẢNH (cùng cách làm với hero_tinhlinh.js để ra cùng nét)
  // Chất liệu là bộ ba sắc độ [tối, vừa, sáng]: mép trên tự sáng, mép dưới và mép trái tự tối.
  // Mỗi "miếng" (part) tự có viền tối bao quanh; miếng vẽ sau đè lên miếng vẽ trước.
  // ====================================================================
  const Dk = (r) => ({ c: r, t: 0, f: true });
  const Md = (r) => ({ c: r, t: 1, f: true });
  const Lt = (r) => ({ c: r, t: 2, f: true });
  function norm(c) {
    if (typeof c === 'string') return { c: [c, c, c], t: 1, f: true };
    if (Array.isArray(c)) return { c: c, t: 1, f: false };
    return { c: c.c, t: c.t, f: c.f };
  }
  const D2R = Math.PI / 180;

  class Spr {
    constructor(w, h, ox, oy) {
      this.w = w; this.h = h; this.ox = ox; this.oy = oy;
      const n = w * h;
      this.main = new Array(n).fill(null);
      this.olf = new Uint8Array(n); // điểm này là viền
      this.nol = new Uint8Array(n); // điểm này không cần viền ngoài (hiệu ứng)
      this.lay = null; this.clip = false;
      this.buf = new Array(n).fill(null);
      this.bx0 = 0; this.bx1 = -1; this.by0 = 0; this.by1 = -1;
    }
    p(x, y, c) {
      x = Math.round(x) + this.ox; y = Math.round(y) + this.oy;
      if (x < 1 || y < 1 || x >= this.w - 1 || y >= this.h - 1) return;
      const i = y * this.w + x;
      if (this.clip && !this.lay[i]) return;
      this.lay[i] = c === 0 ? null : norm(c);
      if (x < this.bx0) this.bx0 = x; if (x > this.bx1) this.bx1 = x; if (y < this.by0) this.by0 = y; if (y > this.by1) this.by1 = y;
    }
    r(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.p(x + i, y + j, c); }
    e(cx, cy, rx, ry, c) {
      const a = rx + 0.35, b = ry + 0.35;
      for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
        for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
          const dx = (x - cx) / a, dy = (y - cy) / b;
          if (dx * dx + dy * dy <= 1) this.p(x, y, c);
        }
    }
    // bầu dục xoay một góc
    er(cx, cy, rx, ry, deg, c) {
      const a = rx + 0.35, b = ry + 0.35, R = Math.max(rx, ry) + 1, r = deg * D2R, cs = Math.cos(r), sn = Math.sin(r);
      for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++)
        for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
          const ux = (x - cx) * cs + (y - cy) * sn, uy = -(x - cx) * sn + (y - cy) * cs;
          if ((ux / a) * (ux / a) + (uy / b) * (uy / b) <= 1) this.p(x, y, c);
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
    // đường gấp khúc; w có thể là mảng độ dày cho từng đoạn (thon dần)
    pl(pts, w, c) { for (let i = 0; i + 1 < pts.length; i++) this.l(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], Array.isArray(w) ? w[Math.min(i, w.length - 1)] : w, c); }
    // đường cong mềm qua các điểm mốc (dùng cho râu, đuôi, xúc tu); w0 là độ dày đầu, w1 là độ dày cuối
    cv(pts, w0, w1, c) {
      const n = pts.length; if (n < 2) return;
      const at = (i) => pts[Math.max(0, Math.min(n - 1, i))];
      const steps = 6;
      let px = pts[0][0], py = pts[0][1];
      for (let i = 0; i < n - 1; i++) {
        const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
        for (let s = 1; s <= steps; s++) {
          const t = s / steps, t2 = t * t, t3 = t2 * t;
          const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
          const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
          const k = (i + t) / (n - 1), w = Math.max(1, Math.round(w0 + (w1 - w0) * k));
          this.l(px, py, x, y, w, c);
          px = x; py = y;
        }
      }
    }
    // chỉ vẽ đè lên chỗ lớp này đã có điểm (thêm bóng, hoa văn mà không tràn ra ngoài)
    in(fn) { const o = this.clip; this.clip = true; fn(this); this.clip = o; }
    // Một miếng: opt.ol màu viền (false là không viền), opt.bevel false là không tự đánh sáng tối, opt.fx là hiệu ứng.
    part(opt, fn) {
      if (typeof opt === 'function') { fn = opt; opt = {}; }
      const W = this.w, L = this.buf;
      this.lay = L; this.clip = false; this.bx0 = this.w; this.bx1 = -1; this.by0 = this.h; this.by1 = -1;
      fn(this);
      const x0 = this.bx0, x1 = this.bx1, y0 = this.by0, y1 = this.by1, ol = opt.fx ? false : (opt.ol === undefined ? INK : opt.ol);
      if (opt.bevel !== false && !opt.fx) {
        for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
          const q = L[i]; if (!q || q.f) continue;
          q.t = !L[i - W] ? 2 : !L[i + W] || !L[i - 1] ? 0 : 1;
        }
      }
      if (ol) {
        for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
          if (!L[i]) continue;
          if (!L[i - 1]) { this.main[i - 1] = ol; this.olf[i - 1] = 1; this.nol[i - 1] = 0; }
          if (!L[i + 1]) { this.main[i + 1] = ol; this.olf[i + 1] = 1; this.nol[i + 1] = 0; }
          if (!L[i - W]) { this.main[i - W] = ol; this.olf[i - W] = 1; this.nol[i - W] = 0; }
          if (!L[i + W]) { this.main[i + W] = ol; this.olf[i + W] = 1; this.nol[i + W] = 0; }
        }
      }
      const fx = opt.fx ? 1 : 0;
      for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
        const q = L[i]; if (!q) continue;
        this.main[i] = q.c[q.t]; this.olf[i] = 0; this.nol[i] = fx; L[i] = null;
      }
      this.lay = null;
    }
    // chi tiết phẳng vẽ đè (mắt, miệng, hoa văn): không viền, không tự đánh sáng tối
    flat(fn) { this.part({ ol: false, bevel: false }, fn); }
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
      let x0 = this.w, x1 = -1, y0 = this.h, y1 = -1;
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.main[y * this.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) { x0 = y0 = 0; x1 = y1 = 0; }
      const cv = document.createElement('canvas'); cv.width = x1 - x0 + 1; cv.height = y1 - y0 + 1;
      const c = cv.getContext('2d');
      const im = c.createImageData(cv.width, cv.height), d = im.data;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const q = this.main[y * this.w + x]; if (!q) continue;
        const v = rgbOf(q), k = ((y - y0) * cv.width + (x - x0)) * 4;
        d[k] = v[0]; d[k + 1] = v[1]; d[k + 2] = v[2]; d[k + 3] = 255;
      }
      c.putImageData(im, 0, 0);
      return { cv, ox: this.ox - x0, oy: this.oy - y0, bb: { x0: x0 - this.ox, x1: x1 - this.ox, y0: y0 - this.oy, y1: y1 - this.oy } };
    }
    // Hệ toạ độ con: gốc (ox,oy), xoay deg độ. Đồ vẽ qua hệ này bám theo khi bộ phận xoay.
    fr(ox, oy, deg) { return new Fr(this, ox, oy, deg || 0); }
  }
  const RGB = new Map();
  function rgbOf(hex) {
    let v = RGB.get(hex);
    if (!v) { const n = parseInt(hex.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; RGB.set(hex, v); }
    return v;
  }
  function mixHex(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const m = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
    return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
  }
  const mix3 = (A, B, k) => [mixHex(A[0], B[0], k), mixHex(A[1], B[1], k), mixHex(A[2], B[2], k)];
  class Fr {
    constructor(S, ox, oy, deg) {
      this.S = S; this.deg = deg; this.z = Math.abs(deg) < 0.01;
      this.ox = this.z ? Math.round(ox) : ox; this.oy = this.z ? Math.round(oy) : oy;
      const r = deg * D2R; this.cs = Math.cos(r); this.sn = Math.sin(r);
    }
    pt(u, v) { return [this.ox + u * this.cs - v * this.sn, this.oy + u * this.sn + v * this.cs]; }
    sub(u, v, deg) { const q = this.pt(u, v); return new Fr(this.S, q[0], q[1], this.deg + (deg || 0)); }
    p(u, v, c) { const q = this.pt(u, v); this.S.p(q[0], q[1], c); }
    r(u, v, w, h, c) {
      if (this.z) return this.S.r(this.ox + Math.round(u), this.oy + Math.round(v), w, h, c);
      if (w === 1 && h === 1) return this.p(u, v, c);
      this.S.g([this.pt(u, v), this.pt(u + w - 1, v), this.pt(u + w - 1, v + h - 1), this.pt(u, v + h - 1)], c);
    }
    e(u, v, rx, ry, c) {
      if (this.z) return this.S.e(this.ox + u, this.oy + v, rx, ry, c);
      const q = this.pt(u, v); this.S.er(q[0], q[1], rx, ry, this.deg, c);
    }
    g(pts, c) { this.S.g(pts.map((q) => this.pt(q[0], q[1])), c); }
    l(u0, v0, u1, v1, w, c) { const a = this.pt(u0, v0), b = this.pt(u1, v1); this.S.l(a[0], a[1], b[0], b[1], w, c); }
    pl(pts, w, c) { this.S.pl(pts.map((q) => this.pt(q[0], q[1])), w, c); }
    cv(pts, w0, w1, c) { this.S.cv(pts.map((q) => this.pt(q[0], q[1])), w0, w1, c); }
  }

  // ====================================================================
  // 2. BẢNG MÀU
  // Mỗi vùng một bảng chủ đạo: rừng lục và tím độc, biển lam và trắng băng, lâu đài đỏ cam và vàng lửa.
  // ====================================================================
  const WHITE = ['#c9c0ae', '#f6f0e2', '#ffffff'];   // trắng mặt nạ của bé
  const BONE = ['#a89c84', '#e8dec6', '#fffaf0'];
  const GOLD = ['#9c7426', '#e2b64e', '#ffe9a0'];
  const STEEL = ['#5f6b84', '#b4c0d4', '#f4f8ff'];
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const BARK = ['#4a3018', '#7a5632', '#a8804e'];
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const PINK = ['#a83a52', '#e8708a', '#ffb4bc'];
  // rừng
  const GRN = ['#255a2c', '#479544', '#8fd070'];
  const TOX = ['#1d5a2a', '#49a83c', '#b5ea6a'];
  const MOSS = ['#3a4a20', '#64803a', '#a2bc62'];
  const PURP = ['#3d1d55', '#6b3a8f', '#a56fd0'];
  const CREAM = ['#b0a078', '#ead9aa', '#fff6d8'];
  // biển
  const SEA = ['#1f5f85', '#3f8fb5', '#8fd0ea'];
  const DEEP = ['#182a4e', '#2c4c84', '#5a86c4'];
  const ICE = ['#2f62ad', '#7fc4f2', '#eafcff'];
  const FOAM = ['#9cbcd4', '#e2f2fc', '#ffffff'];
  const SHELL = ['#7c7a9c', '#c4c0dc', '#f4f0ff'];
  const ROCK = ['#34425a', '#5c7088', '#9cb2c4'];
  const TEAL = ['#1c5a64', '#3a9a9a', '#8adcc8'];
  // lâu đài
  const FIRE = ['#a32418', '#f2622a', '#ffc64c'];
  const EMBER = ['#7a2a12', '#c4562a', '#f69a52'];
  const FLAME = ['#e8492a', '#ffb347', '#fff0b0'];
  const STONE = ['#4c4248', '#7c7078', '#b4a8ac'];
  const IRON = ['#33303c', '#5c5868', '#9a96a8'];
  const NIGHT = ['#1e1a30', '#3a3458', '#6c66a0'];
  const FUR = ['#b8b0a8', '#f0ece2', '#ffffff'];
  const ORG = ['#9a4a16', '#dd7c2a', '#f8b25c'];
  const SH = '#ffffff';
  const MOUTH = '#5a1014', TONGUE = '#e0483e';
  // Màu theo hệ, dùng cho tinh anh, dấu kháng hệ và điểm yếu của trùm.
  const ELP = {
    fire: { B: ['#8a1c12', '#e8492a', '#ffb347'], glow: '#ffc64c', hot: '#fff0b0', name: 'Lửa' },
    poison: { B: ['#1d5a2a', '#49a83c', '#b5ea6a'], glow: '#b5ea6a', hot: '#e6f58a', name: 'Độc' },
    ice: { B: ['#2f62ad', '#7fc4f2', '#eafcff'], glow: '#bfe9ff', hot: '#ffffff', name: 'Băng' },
  };
  const WEAK = { fire: 'ice', ice: 'poison', poison: 'fire' };

  // ====================================================================
  // 3. MẮT VÀ MIỆNG (cùng kiểu mắt to tròn của vũ khí sống)
  // ====================================================================
  // Khối bo góc.
  function rd(s, x, y, w, h, c) {
    if (w < 3 || h < 3) { s.r(x, y, w, h, c); return; }
    if (w >= 7 && h >= 7) { s.r(x + 2, y, w - 4, 1, c); s.r(x + 1, y + 1, w - 2, 1, c); s.r(x, y + 2, w, h - 4, c); s.r(x + 1, y + h - 2, w - 2, 1, c); s.r(x + 2, y + h - 1, w - 4, 1, c); return; }
    s.r(x + 1, y, w - 2, 1, c); s.r(x, y + 1, w, h - 2, c); s.r(x + 1, y + h - 1, w - 2, 1, c);
  }
  // Con mắt to: tâm (x, y). o: w, h (số lẻ, mặc định 5), rim (màu vành), col (lòng trắng), pc (con ngươi),
  // look [x, y] hướng nhìn, lid (số hàng mí trên), low (mí dưới), brow ('angry', 'sad', 'flat'), side (1 hoặc -1: phía mày chúc xuống),
  // shut (nhắm), x (mắt chữ X khi gục), glow (màu quầng sáng quanh mắt).
  function eye(s, x, y, o) {
    o = o || {};
    const w = o.w || 5, h = o.h || 5, hw = (w - 1) / 2, hh = (h - 1) / 2, side = o.side || 1;
    const rim = o.rim || INK, col = o.col || '#ffffff', pc = o.pc || INK, look = o.look || [1, 0];
    const X = Math.round(x), Y = Math.round(y);
    if (o.glow) rd(s, X - hw - 2, Y - hh - 2, w + 4, h + 4, o.glow);
    rd(s, X - hw - 1, Y - hh - 1, w + 2, h + 2, rim);
    if (o.x) {
      rd(s, X - hw, Y - hh, w, h, o.lidc || '#c8c8b8');
      for (let i = -1; i <= 1; i++) { s.p(X + i, Y + i, INK); s.p(X + i, Y - i, INK); }
      return;
    }
    if (o.shut) {
      rd(s, X - hw, Y - hh, w, h, o.lidc || rim);
      s.r(X - hw, Y + (o.happy ? -1 : 0), w, 1, o.lidc ? INK : mixHex(rim, '#ffffff', 0.35));
      if (o.brow) brow(s, X, Y, hw, hh, o.brow, side);
      return;
    }
    rd(s, X - hw, Y - hh, w, h, col);
    const lid = o.lid || 0, low = o.low || 0, top = -hh + lid, bot = hh - low;
    if (o.pup === 'slit') { const px = look[0] > 0 ? 1 : look[0] < 0 ? -1 : 0; s.r(X + px, Y + top, 1, bot - top + 1, pc); }
    else if (o.pup === 'dot') { s.p(X + (look[0] > 0 ? 1 : look[0] < 0 ? -1 : 0), Y + (look[1] > 0 ? 1 : look[1] < 0 ? -1 : 0), pc); }
    else {
      const ps = w >= 7 ? 3 : w <= 3 ? 1 : 2, pv = h >= 7 ? 3 : h <= 3 ? Math.min(2, h) : 2;
      let px = w <= 3 ? (look[0] > 0 ? hw : look[0] < 0 ? -hw : 0) : look[0] > 0 ? hw - ps + 1 : look[0] < 0 ? -hw : -Math.floor(ps / 2);
      let py = look[1] > 0 ? bot - pv + 1 : look[1] < 0 ? top : -Math.floor(pv / 2) + (h >= 5 ? 0 : 0);
      if (py < top) py = top; if (py + pv - 1 > bot) py = bot - pv + 1;
      s.r(X + px, Y + py, ps, pv, pc);
      if (!o.nohl && w >= 4) s.p(X + px + (look[0] < 0 ? 0 : ps - 1), Y + py, SH);
    }
    for (let j = 0; j < lid; j++) { const ins = j === 0 && w >= 4 ? 1 : 0; s.r(X - hw + ins, Y - hh + j, w - ins * 2, 1, o.lidc || rim); }
    for (let j = 0; j < low; j++) { const ins = j === 0 && w >= 4 ? 1 : 0; s.r(X - hw + ins, Y + hh - j, w - ins * 2, 1, o.lidc || rim); }
    if (o.brow) brow(s, X, Y, hw, hh, o.brow, side);
  }
  function brow(s, X, Y, hw, hh, kind, side) {
    const y = Y - hh - 2, w = hw * 2 + 1;
    if (kind === 'flat') { s.r(X - hw - 1, y + 1, w + 2, 1, INK); return; }
    const sg = kind === 'angry' ? side : -side;
    // mày xếch: đầu mày phía mũi chúc xuống, đè một phần lên mắt
    for (let i = 0; i < w + 2; i++) { const f = i / (w + 1); const x = sg > 0 ? X - hw - 1 + i : X + hw + 1 - i; s.p(x, y + Math.round(f * 2.4), INK); s.p(x, y + Math.round(f * 2.4) + 1, INK); }
  }
  // Mắt hạt nhỏ cho quái bé: khối mực có đốm sáng.
  function bead(s, x, y, o) {
    o = o || {};
    const X = Math.round(x), Y = Math.round(y), h = o.h || 2;
    if (o.x) { s.p(X, Y, INK); s.p(X + 1, Y + 1, INK); s.p(X + 1, Y, INK); s.p(X, Y + 1, INK); return; }
    if (o.shut) { s.r(X, Y + h - 1, 2, 1, INK); return; }
    if (o.white) rd(s, X - 1, Y - 1, 4, h + 2, '#ffffff');
    s.r(X, Y, 2, h, o.pc || INK); s.p(X + (o.back ? 0 : 1), Y, SH);
    if (o.angry) { s.p(X - 1, Y - 2, INK); s.p(X, Y - 1, INK); s.p(X + 1, Y - 1, INK); }
  }
  // Miếng vẽ từ chuỗi ký tự.
  const MMAP = { K: INK, W: '#ffffff', R: TONGUE, D: MOUTH, B: '#9fdcff', Y: '#ffe36a' };
  function stamp(s, rows, cx, y, map) {
    map = map || MMAP;
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j], x0 = Math.round(cx) - (r.length >> 1);
      for (let i = 0; i < r.length; i++) { const col = map[r[i]]; if (col) s.p(x0 + i, Math.round(y) + j, col); }
    }
  }
  const MOUTHS = {
    smile: ['K...K', '.KKK.'], frown: ['.KKK.', 'K...K'], flat: ['KKK'], tiny: ['KK'], o: ['KK', 'KK'],
    open: ['KKKK', 'KDDK', 'KRRK', '.KK.'], fang: ['KKKKKK', 'KWDDWK', 'KDRRDK', '.KKKK.'],
    big: ['KKKKKKK', 'KWDWDWK', 'KDDDDDK', 'KDRRRDK', '.KKKKK.'], grit: ['KKKKKK', 'KWKWKW', 'KKKKKK'],
    wavy: ['.K.K.', 'K.K.K'], cat: ['K.K.K', '.K.K.'],
  };
  const mouth = (s, kind, cx, y) => stamp(s, MOUTHS[kind], cx, y);

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (v) => v * v * (3 - 2 * v);
  const easeOut = (v) => 1 - (1 - v) * (1 - v);
  const easeIn = (v) => v * v;
  const hsh = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const WX = [2, 0, -2, 0]; // độ vung chân theo 4 khung bước
  const hop = (P) => (P.w === 1 || P.w === 3 ? -1 : 0); // nhún khi bước

  // ====================================================================
  // 4. QUÁI THƯỜNG VÀ TINH ANH
  // Mỗi con: draw(S, P, X). P là tư thế rời rạc:
  //   w: khung bước 0..3 (-1 là đứng), br: nhịp thở 0/1, bl: chớp mắt, an: báo đòn 0..3 (3 là sắp ra đòn),
  //   sk: vừa ra đòn 1..3 (1 là lúc vung mạnh nhất), lg: đang lao tới, tl: nhịp phụ 0..3 (đuôi, xúc tu, cánh), dead: đã gục.
  // X: { el: hệ của con này (tinh anh luôn có), E: bảng màu hệ }.
  // Khai báo: size [rộng, cao] của khung vẽ, org [x, y] chỗ đặt gốc trong khung, top: chiều cao hình (để đặt dấu báo trên đầu).
  // ====================================================================
  const MON = [{}, {}, {}]; // theo vùng: 0 Rừng già, 1 Hang biển, 2 Lâu đài cổ
  const MINI = [null, null, null];
  const BOSS = {};
  function defMon(reg, role, o) { MON[reg][role] = Object.assign({ size: [64, 56], org: [32, 46], top: 22, sh: 8 }, o); }
  const mood = (P) => (P.dead ? 'dead' : P.an || P.sk || P.lg ? 'angry' : 'idle');
  // mắt theo tâm trạng chung của quái
  function eyeOf(P, o) {
    const m = mood(P);
    return Object.assign({}, o, m === 'dead' ? { x: 1 } : m === 'angry' ? { brow: 'angry', lid: 0 } : P.bl ? { shut: 1 } : {});
  }
  const beadOf = (P, o) => Object.assign({}, o, P.dead ? { x: 1 } : P.an || P.sk || P.lg ? { angry: 1 } : P.bl ? { shut: 1 } : {});

  // ====================================================================
  // 4A. RỪNG GIÀ (hệ độc): lục và tím độc
  // ====================================================================
  const rgFUR = mix3(BARK, MOSS, 0.4);  // lông chồn: nâu ngả màu rêu
  const rgSAC = mix3(CREAM, PINK, 0.3); // túi họng của cóc
  // Chiếc lá: gốc lá ở (x, y), chĩa theo góc deg, dài len, rộng wid. rib là có gân giữa.
  function rgLeaf(s, x, y, deg, len, wid, C, rib) {
    const r = deg * D2R, cs = Math.cos(r), sn = Math.sin(r);
    s.er(x + cs * len * 0.5, y + sn * len * 0.5, len * 0.5, wid * 0.5, deg, C);
    s.p(x + cs * (len + 0.7), y + sn * (len + 0.7), C);
    if (rib) s.in(() => s.l(x + cs, y + sn, x + cs * (len - 1.5), y + sn * (len - 1.5), 1, Dk(C)));
  }
  // Chấm bụi, bào tử bay: mỗi phần tử là [x, y, màu].
  function rgPuff(S, pts) { S.part({ fx: 1 }, (s) => { for (const q of pts) s.p(q[0], q[1], q[2]); }); }

  // ----- Mầm Gỗ (lính xông): gốc cây biết đi, giơ cành chùy lên rồi bổ xuống -----
  defMon(0, 'rusher', {
    name: 'Mầm Gỗ', top: 24, sh: 8,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w], k = P.tl & 1;
      const tx = P.an ? -P.an : P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0; // đỉnh thân ngả sau hay chúi trước
      const ty = -17 + by + (P.sk === 1 ? 2 : 0);
      const ex = Math.round(tx * 0.6);
      // góc và độ dài của tay cầm chùy
      const ang = P.an ? -90 - P.an * 13 : P.sk === 1 ? 18 : P.sk === 2 ? -5 : P.sk === 3 ? -35 : -62 + (P.w >= 0 ? WX[P.w] * 4 : 0) - (P.br ? 5 : 0);
      const armL = P.an ? 4 + P.an * 1.8 : P.sk === 1 ? 7 : 4;
      const shx = ex + 6, shy = ty + 8 - (P.an || 0);
      // nấm tím mọc bên hông
      S.part((s) => { const x = -7 + tx * 0.4, y = ty + 10; s.e(x, y, 3, 2, PURP); s.r(x - 4, y + 1, 9, 3, 0); s.in(() => s.p(x - 1, y - 1, Lt(CREAM))); });
      // cành nhỏ phía sau
      S.part((s) => {
        const x1 = -9 + tx * 0.7, y1 = ty + 5 - k - (P.an ? P.an : 0);
        s.l(-5 + tx * 0.6, ty + 8, x1, y1, 1, Md(BARK));
        rgLeaf(s, x1, y1, -140 - (P.an ? 20 : 0), 4, 2.6, GRN);
      });
      // hai chân rễ
      S.part((s) => {
        s.r(-6 + fo, -3, 4, 3, BARK); s.p(-7 + fo, -1, Dk(BARK));
        s.r(2 - fo, -3, 4, 3, BARK); s.p(6 - fo, -1, Dk(BARK));
      });
      // thân gốc cây, mặt cắt có vân gỗ
      S.part((s) => {
        s.g([[-7, -3], [-6 + tx, ty + 1], [6 + tx, ty + 1], [7, -3]], BARK);
        s.e(tx, ty + 1, 6, 2, BARK);
        s.in(() => {
          s.e(tx, ty + 1, 5, 1.2, Md(CREAM)); s.r(tx - 2, ty + 1, 4, 1, Dk(CREAM)); s.p(tx, ty + 1, Md(WD));
          s.l(-6 + tx * 0.8, ty + 6, -6, -6, 1, Dk(BARK)); s.l(5 + tx * 0.3, -7, 5, -4, 1, Dk(BARK));
          s.p(-2 + tx * 0.2, -4, Dk(BARK)); s.p(-3 + tx * 0.2, -5, Dk(BARK)); s.p(4 + tx * 0.8, ty + 5, Lt(BARK));
          s.r(tx - 7, ty + 3, 4, 1, Md(MOSS)); s.r(tx - 7, ty + 4, 2, 1, Md(MOSS)); s.p(tx - 6, ty + 5, Dk(MOSS)); s.p(tx + 5, ty + 3, Md(MOSS));
        });
      });
      // mầm lá trên đầu
      S.part((s) => {
        const sx = tx, sy = ty - 2;
        s.l(sx, ty, sx, sy, 1, Md(GRN));
        rgLeaf(s, sx, sy, -152 + k * 14 - (P.sk === 1 ? 25 : 0), 5, 3, GRN);
        rgLeaf(s, sx + 1, sy, -34 - k * 14 - (P.an ? P.an * 8 : 0), 6, 3.4, TOX);
      });
      // tay cành cầm chùy gỗ
      S.part((s) => {
        const r = ang * D2R, cs = Math.cos(r), sn = Math.sin(r);
        const cx = shx + cs * (armL + 5), cy = shy + sn * (armL + 5);
        s.l(shx, shy, shx + cs * (armL + 3), shy + sn * (armL + 3), 2, Md(BARK));
        s.e(cx, cy, 3.4, 3.4, WD);
        s.in(() => { s.p(cx - 1, cy + 1, Dk(WD)); s.p(cx + 1, cy - 1, Lt(WD)); s.r(cx - cs * 3 - 1, cy - sn * 3 - 1, 2, 2, Md(MOSS)); });
      });
      if (P.sk === 1) rgPuff(S, [[shx + 17, -1, CREAM[2]], [shx + 18, -4, CREAM[1]], [shx + 15, -7, CREAM[2]], [shx + 19, -7, CREAM[1]], [shx + 7, -1, CREAM[1]]]);
      S.flat((s) => {
        const ey = ty + 9, mx = ex + 2;
        eye(s, ex - 2, ey, eyeOf(P, { look: [1, 0], rim: BARK[0] }));
        eye(s, ex + 4, ey, eyeOf(P, { w: 3, look: [1, 0], rim: BARK[0], side: -1 }));
        if (P.dead) mouth(s, 'wavy', mx, -5);
        else if (P.sk === 1) stamp(s, ['KKKK', 'KDDK', 'KKKK'], mx, -6);
        else if (P.an) s.r(mx - 2, -5, 4, 1, INK);
        else s.r(mx - 1, -5, 2, 1, INK);
      });
    },
  });

  // ----- Nấm Con (bầy nhỏ): ngồi thụp cho mũ bẹt ra rồi bật lên húc đầu, tung bào tử -----
  defMon(0, 'swarm', {
    name: 'Nấm Con', top: 15, sh: 5,
    draw(S, P) {
      const sq = P.an || 0, jump = P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0;
      const cx = P.sk === 1 ? 4 : P.sk === 2 ? 2 : P.an ? -1 : 0;
      const by = (P.br ? -1 : 0) + hop(P), lg = P.w < 0 ? 0 : WX[P.w] >> 1;
      const tilt = P.sk === 1 ? 26 : P.sk === 2 ? 10 : 0;
      const capY = -9 + by - jump + (sq ? 1 + (sq >> 1) : 0); // mép dưới của mũ
      const rx = 6.5 + sq * 0.7, ry = 4.2 - sq * 0.4, fy = -jump;
      // chân tí hon
      S.part((s) => { s.r(cx - 3 + lg - (jump ? 1 : 0), -2 + fy, 2, 2, Md(PURP)); s.r(cx + 2 - lg - (jump ? 1 : 0), -2 + fy, 2, 2, Md(PURP)); });
      // cuống nấm
      S.part((s) => {
        s.r(cx - 3 - (sq ? 1 : 0), capY, 8 + (sq ? 2 : 0), -2 + fy - capY, CREAM);
        s.p(cx - 3 - (sq ? 1 : 0), -3 + fy, 0); s.p(cx + 4 + (sq ? 1 : 0), -3 + fy, 0);
      });
      // mũ nấm tím đốm kem
      S.part((s) => {
        const f = S.fr(cx + (tilt ? 1 : 0), capY - (tilt ? 1 : 0), tilt);
        f.e(0.5, -1, rx, ry, PURP);
        f.g([[-rx - 3, 1], [rx + 3, 1], [rx + 3, ry + 4], [-rx - 3, ry + 4]], 0);
        s.in(() => {
          f.e(-3, -3, 1.3, 1, Lt(CREAM)); f.e(2, -4, 1, 0.6, Lt(CREAM)); f.p(4, -2, Lt(CREAM)); f.p(-5, -1, Md(CREAM)); f.p(0, -1, Md(CREAM));
          f.r(-rx, 0, rx * 2 + 1, 1, Dk(PURP));
        });
      });
      if (P.sk === 1) rgPuff(S, [[cx - 8, capY - 2, TOX[2]], [cx - 10, capY - 5, PURP[2]], [cx - 7, capY - 7, TOX[2]], [cx - 11, capY, TOX[1]], [cx - 4, capY - 9, PURP[2]], [cx - 9, capY + 3, TOX[2]]]);
      else if (P.sk === 2) rgPuff(S, [[cx - 9, capY - 6, TOX[2]], [cx - 12, capY - 3, PURP[2]], [cx - 6, capY - 9, TOX[1]], [cx - 11, capY + 2, TOX[2]]]);
      else if (P.an === 3) rgPuff(S, [[cx - 4, capY - 8, TOX[2]], [cx + 3, capY - 9, TOX[2]]]);
      S.flat((s) => {
        const ey = capY + 3;
        const eh = ey + 2 <= -3 + fy ? 3 : 2;
        bead(s, cx - 1, ey, beadOf(P, { h: eh })); bead(s, cx + 2, ey, beadOf(P, { h: eh }));
        if (eh === 3) {
          if (P.sk === 1) s.r(cx + 1, ey + 2, 1, 2, MOUTH); else if (!P.an) s.p(cx + 1, ey + 2, INK);
          s.p(cx - 2, ey + 2, PINK[2]); s.p(cx + 4, ey + 2, PINK[2]);
        }
      });
    },
  });

  // ----- Bọ Gai (khiên): thu mình, chúc sừng xuống rồi thúc sừng tới -----
  defMon(0, 'shield', {
    name: 'Bọ Gai', top: 22, sh: 10,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w];
      const tuck = P.an || 0, jab = P.sk === 1 ? 4 : P.sk === 2 ? 2 : 0;
      const bx = (P.sk === 1 ? 3 : jab ? 1 : 0) - (tuck ? 1 : 0), cx = bx - 2, rx = 9;
      const cy = -10 + by + (tuck >= 2 ? 1 : 0), ry = 8.2 - (tuck >= 2 ? 0.8 : 0);
      const hx = bx + 7 - tuck * 0.7 + jab, hy = -6 + by + (tuck ? 1 : 0);
      const hdeg = jab ? (P.sk === 1 ? -4 : -20) : -58 + tuck * 18, hl = P.sk === 1 ? 10 : 8;
      // gai quanh mai: thu mình thì gai dựng dài ra
      S.part((s) => {
        for (let i = 0; i < 6; i++) {
          const a = (-200 + i * 30) * D2R, c = Math.cos(a), sn = Math.sin(a), L = 3 + tuck * 0.8 + (i & 1);
          const px = cx + c * (rx - 1), py = cy + sn * (ry - 1), qx = cx + c * (rx + L), qy = cy + sn * (ry + L);
          s.g([[px - sn * 1.8, py + c * 1.8], [qx, qy], [px + sn * 1.8, py - c * 1.8]], PURP);
          s.p(qx, qy, Lt(CREAM));
        }
      });
      // ba chân
      S.part((s) => {
        for (let i = 0; i < 3; i++) { const x0 = bx - 8 + i * 5, f = (i & 1 ? -fo : fo) * 0.6; s.l(x0, -4, x0 + f, -1, 2, Md(PURP)); }
      });
      // mai cứng
      S.part((s) => {
        s.e(cx, cy, rx, ry, GRN);
        s.r(cx - rx - 2, -2, rx * 2 + 5, 12, 0);
        s.in(() => {
          s.r(cx - rx, -4, rx * 2 + 1, 2, Md(PURP)); s.r(cx - rx, -5, rx * 2 + 1, 1, Dk(GRN));
          s.cv([[cx - rx, cy + 1], [cx - 2, cy - 4], [cx + rx, cy - 1]], 1, 1, Dk(GRN));
          for (const q of [[-6, -2], [0, -6], [-2, 1], [4, -3]]) { s.r(cx + q[0], cy + q[1], 2, 2, Md(PURP)); s.p(cx + q[0], cy + q[1], Lt(PURP)); }
          s.e(cx - 3, cy - ry + 2, 3, 0.8, Lt(GRN)); s.p(cx + 4, cy - ry + 3, Lt(TOX));
        });
      });
      // sừng
      S.part((s) => {
        const r = hdeg * D2R, c = Math.cos(r), sn = Math.sin(r), x0 = hx + 2, y0 = hy - 2;
        s.g([[x0 - sn * 2.2, y0 + c * 2.2], [x0 + c * hl, y0 + sn * hl], [x0 + sn * 2.2, y0 - c * 2.2]], CREAM);
        s.g([[hx - 2, hy - 3], [hx - 1, hy - 6 + (tuck ? 1 : 0)], [hx + 1, hy - 3]], CREAM); // sừng nhỏ phía sau
      });
      // đầu
      S.part((s) => {
        s.l(bx + 4, hy + 1, hx, hy + 1, 4, PURP); // cổ
        s.e(hx, hy, 4.4, 4, PURP);
        s.in(() => { s.r(hx - 1, hy + 3, 6, 1, Dk(PURP)); s.p(hx - 3, hy - 2, Lt(PURP)); s.p(hx + 4, hy + 2, Lt(CREAM)); });
      });
      if (P.sk === 1) rgPuff(S, [[hx + 13, hy - 5, CREAM[2]], [hx + 14, hy - 1, CREAM[2]], [hx + 12, hy + 1, CREAM[1]]]);
      S.flat((s) => {
        eye(s, hx + 1, hy - 1, eyeOf(P, { w: 3, h: 3, look: [1, 0] }));
        if (P.sk === 1) s.r(hx + 2, hy + 2, 2, 1, MOUTH);
      });
    },
  });

  // ----- Hoa Phun Độc (xạ thủ): ngửa đầu, phồng nụ rồi bổ tới há miệng phun hạt độc -----
  defMon(0, 'archer', {
    name: 'Hoa Phun Độc', top: 26, sh: 7,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w] >> 1, k = P.tl & 1;
      const lean = P.an ? -P.an * 1.4 : P.sk === 1 ? 6 : P.sk === 2 ? 2 : 0;
      const r = 5.4 + (P.an ? P.an * 0.6 : P.sk === 1 ? 1 : 0);
      const open = P.sk === 1 ? 2 : P.sk === 2 ? 1 : 0;
      const hx = Math.round(1 + lean), hy = Math.round(-17 + by + (P.sk === 1 ? 1 : 0) + (P.an ? 1 - P.an * 0.4 : 0));
      const nx = hx - 1 - lean * 0.25, ny = hy + r - 1;
      const mx = -1 + lean * 0.25, my = -7 + by;
      // rễ làm chân
      S.part((s) => { s.l(-1, -3, -4 + fo, -1, 2, Md(BARK)); s.l(1, -3, 4 - fo, -1, 2, Md(BARK)); s.r(-1, -4, 3, 3, BARK); });
      // thân dây leo
      S.part((s) => { s.cv([[0, -4], [-2 + lean * 0.15, -7], [mx + 2, -11 + by], [nx, ny]], 2, 2, GRN); });
      // hai tay lá
      S.part((s) => {
        const la = P.an ? -160 + P.an * 14 : P.sk === 1 ? -205 : -166 + k * 12, ra = P.an ? -20 - P.an * 14 : P.sk === 1 ? 25 : -14 - k * 12;
        rgLeaf(s, mx, my, la, 6, 3.4, GRN, 1); rgLeaf(s, mx + 1, my, ra, 6, 3.4, GRN, 1);
      });
      // cánh hoa quanh gáy
      S.part((s) => {
        for (let i = 0; i < 4; i++) {
          const a = -208 + i * 38 - (P.an ? P.an * 4 : 0) + (open === 2 ? 8 : 0), ra = a * D2R, d = r + (open === 2 ? 2 : 1);
          s.er(hx + Math.cos(ra) * d, hy + Math.sin(ra) * d, 2.6, 2, a, CREAM);
        }
      });
      // lòng miệng (chỉ thấy khi há)
      if (open) S.part({ ol: false }, (s) => { s.e(hx + 1, hy + 2, r - 1, r - 1.6, MOUTH); s.in(() => s.r(hx + 1, hy + 3, 4, 2, TONGUE)); });
      // nụ hoa tím
      S.part((s) => {
        s.e(hx, hy, r, r * 0.92, PURP);
        if (open === 2) s.e(hx + 2, hy + 5, 4.6, 2.2, PURP); // hàm dưới trễ xuống
        if (open) s.g([[hx - 2, hy + 2], [hx + r + 3, hy + 2 - open * 2], [hx + r + 3, hy + 2 + open * 1.8]], 0);
        s.in(() => {
          s.e(hx - 2, hy + r, r * 0.8, 2.2, Md(GRN));
          s.p(hx - 3, hy - r + 2, Lt(CREAM)); s.p(hx - 5, hy - 1, Lt(CREAM)); s.p(hx + 1, hy - r + 1, Md(CREAM));
          if (P.an >= 2) { s.p(hx + r - 2, hy + 2, Md(PINK)); s.p(hx + r - 3, hy + 2, Md(PINK)); }
        });
      });
      if (P.sk === 1) rgPuff(S, [[hx + r + 3, hy + 1, TOX[2]], [hx + r + 5, hy, TOX[2]], [hx + r + 5, hy + 3, TOX[1]], [hx + r + 7, hy + 1, TOX[2]]]);
      S.flat((s) => {
        if (open === 2) {
          // há to: mắt dồn lên trên, răng nhọn hai hàm
          eye(s, hx - 2, hy - 3, { w: 3, h: 3, look: [1, 0], rim: PURP[0] });
          eye(s, hx + 2, hy - 3, { w: 3, h: 3, look: [1, 0], rim: PURP[0] });
          s.r(hx - 4, hy - 6, 3, 1, INK); s.p(hx - 1, hy - 5, INK); s.p(hx + 4, hy - 6, INK); s.p(hx + 3, hy - 5, INK);
          s.p(hx + 2, hy + 1, '#ffffff'); s.p(hx + 4, hy, '#ffffff'); s.p(hx + 6, hy, '#ffffff'); s.p(hx + 3, hy + 4, '#ffffff'); s.p(hx + 5, hy + 5, '#ffffff');
          return;
        }
        const ey = hy - 2;
        eye(s, hx - 1, ey, eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: PURP[0] }));
        eye(s, hx + 3, ey, eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: PURP[0], side: -1 }));
        if (open) return;
        if (P.dead) mouth(s, 'wavy', hx + 2, hy + 3);
        else if (P.an) s.r(hx + r - 2, hy + 3, 2, 2, TOX[2]);
        else s.r(hx + 1, hy + 3, 4, 1, INK);
      });
    },
  });

  // ----- Chồn Rừng (nhanh nhẹn): chổng mông lấy đà rồi phóng dài người vồ tới -----
  defMon(0, 'nimble', {
    name: 'Chồn Rừng', top: 17, sh: 9,
    draw(S, P) {
      const k = P.tl & 1, run = P.w >= 0 && !P.an && !P.lg, gat = run && (P.w & 1);
      let hip, sho, hd, ta, ft; // ft: bàn chân [sau gần, sau xa, trước gần, trước xa]
      if (P.lg) { hip = [-8, -8]; sho = [4, -9]; hd = [10, -9]; ta = 172; ft = [[-15, -5], [-13, -3], [12, -5], [10, -3]]; }
      else if (P.an) { const a = P.an; hip = [-5, -7 - a]; sho = [3, -6 + a * 0.6]; hd = [8, -8 + a]; ta = -100 + a * 4; ft = [[-7, -1], [-4, -1], [5 + a, -1], [3 + a, -1]]; }
      else if (run) {
        if (gat) { hip = [-5, -8]; sho = [3, -7]; hd = [8, -9]; ta = -150; ft = [[-2, -1], [-4, -1], [1, -1], [3, -1]]; }
        else { hip = [-7, -6]; sho = [4, -7]; hd = [9, -10]; ta = P.w ? 165 : -170; ft = [[-12, -2], [-10, -1], [9, -2], [7, -1]]; }
      } else { const b = P.br ? -1 : 0; hip = [-6, -6]; sho = [3, -7 + b]; hd = [8, -10 + b]; ta = -128 + k * 12; ft = [[-7, -1], [-4, -1], [3, -1], [6, -1]]; }
      const hx = hd[0], hy = hd[1];
      const leg = (s, a, f, C) => { s.l(a[0], a[1] + 1, f[0], f[1], 2, C); s.p(f[0] + 1, f[1], C); };
      // đuôi xù như chiếc lá
      S.part((s) => { rgLeaf(s, hip[0] - 2, hip[1], ta, 10, 5.6, GRN, 1); s.in(() => { s.p(hip[0] - 2 + Math.cos(ta * D2R) * 8, hip[1] + Math.sin(ta * D2R) * 8 - 1, Lt(TOX)); }); });
      // chân phía xa
      S.part((s) => { leg(s, hip, ft[1], Dk(rgFUR)); leg(s, sho, ft[3], Dk(rgFUR)); });
      // tai phía xa
      S.part((s) => { s.g([[hx - 1, hy - 2], [hx, hy - 6], [hx + 2, hy - 3]], Dk(rgFUR)); });
      // thân dài
      S.part((s) => {
        const mx = (hip[0] + sho[0]) / 2, my = (hip[1] + sho[1]) / 2, dx = sho[0] - hip[0], dy = sho[1] - hip[1];
        const bl = Math.hypot(dx, dy), ba = Math.atan2(dy, dx) / D2R;
        s.er(mx, my, bl / 2 + 3, 3.3, ba, rgFUR);
        s.l(sho[0], sho[1], hx - 1, hy + 2, 4, rgFUR);
        s.in(() => {
          s.er(mx + 1, my + 2.8, bl / 2 + 1, 1, ba, Md(CREAM));
          s.er(mx - 1, my - 2.6, bl / 2 - 1, 0.8, ba, Md(GRN)); s.p(mx - 3, my - 1, Md(GRN)); s.p(mx + 2, my - 1, Md(GRN));
        });
      });
      // chân phía gần
      S.part((s) => { leg(s, hip, ft[0], rgFUR); leg(s, sho, ft[2], rgFUR); });
      // đầu, mõm nhọn, tai
      S.part((s) => {
        s.e(hx, hy, 4, 3.3, rgFUR);
        s.g([[hx + 2, hy - 1], [hx + 7, hy + 1], [hx + 2, hy + 3]], rgFUR);
        s.g([[hx - 4, hy - 1], [hx - 4, hy - 6], [hx - 1, hy - 3]], rgFUR);
        s.in(() => { s.e(hx + 3, hy + 2.6, 4, 1.4, Md(CREAM)); s.p(hx - 3, hy - 3, Md(PINK)); });
      });
      S.flat((s) => {
        eye(s, hx + 1, hy - 1, eyeOf(P, { w: 3, h: 3, look: [1, 0], rim: rgFUR[0], col: '#e6f58a', lid: 1 }));
        s.p(hx + 7, hy + 1, INK);
        if (P.lg || P.an === 3) { s.r(hx + 3, hy + 2, 3, 2, MOUTH); s.p(hx + 5, hy + 2, '#ffffff'); s.p(hx + 3, hy + 3, '#ffffff'); }
        if (P.lg) { s.p(ft[2][0] + 2, ft[2][1], '#ffffff'); s.p(ft[3][0] + 2, ft[3][1], '#ffffff'); }
      });
    },
  });

  // ----- Cóc Tía (tinh anh): cậu ông trời. Phồng túi họng, đứng dậy bằng chân sau rồi đập bụng, phóng lưỡi -----
  defMon(0, 'elite', {
    name: 'Cóc Tía', size: [104, 84], org: [42, 74], top: 37, sh: 15,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.poison, CR = E.B;
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w];
      const up = P.an || 0, slam = P.sk === 1 ? 2 : P.sk === 2 ? 1 : 0;
      const bx = Math.round(slam * 2.5 - up * 0.7), cx = bx - 3;
      const rx = 15 + slam, ry = 12 - slam + (up ? 1 : 0);
      const cy = -1 - ry + by - up * 2;
      const hx = Math.round(bx + 7 - up * 0.6 + slam * 1.5), hy = Math.round(cy - 10 - up * 0.7 + slam * 2);
      const sx = bx + 6, sy = cy + 4; // vai
      const an = P.an || P.sk || P.lg;
      // tay trước: far là tay phía xa
      const arm = (s, far) => {
        const C = far ? Dk(PURP) : PURP, o = far ? 5 : 0;
        let hxn, hyn;
        if (up) { hxn = sx + o + 7 + up; hyn = sy + 5 - up * 2; s.pl([[sx + o, sy], [sx + o + 4, sy + 4], [hxn, hyn]], 3, C); }
        else if (slam) { hxn = sx + o + 8 + slam * 2; hyn = -2; s.l(sx + o, sy, hxn, hyn, 3, C); }
        else { hxn = sx + o + 2 + (far ? -fo : fo) * 0.6; hyn = -2; s.l(sx + o, sy, hxn, hyn, 3, C); }
        s.r(hxn - 1, hyn - 1, 5, 2, C); s.p(hxn + 4, hyn - 1, C); s.p(hxn + 4, hyn + (up ? 1 : 0), C); s.p(hxn + 2, hyn - 2, C);
      };
      S.part((s) => arm(s, 1));
      // hàng nấm theo màu hệ mọc trên lưng
      for (const m of [[-152, 3], [-122, 4], [-92, 3]]) S.part((s) => {
        const a = m[0] * D2R, r = m[1], x = Math.round(cx + Math.cos(a) * (rx - 1)), y = Math.round(cy + Math.sin(a) * (ry - 1));
        s.e(x, y - r - 2, r, r * 0.8, CR);
        s.r(x - r - 1, y - r - 1, r * 2 + 3, r + 1, 0);
        s.r(x - 1, y - r - 1, 3, r + 3, Md(CREAM));
        s.in(() => { s.p(x - 1, y - r - 4, E.glow); if (r > 3) s.p(x + 2, y - r - 3, E.glow); });
      });
      // thân
      S.part((s) => {
        s.e(cx, cy, rx, ry, PURP);
        s.in(() => {
          s.e(cx + 8, cy + 5, 9, ry - 4, Md(CREAM)); s.e(cx + 6, cy + 6, 6, ry - 6, Dk(CREAM));
          s.e(cx - 8, cy - 4, 1.8, 1.2, Md(MOSS)); s.e(cx - 2, cy - 8, 1.2, 0.8, Md(MOSS)); s.e(cx - 12, cy + 2, 1.2, 1.2, Md(MOSS)); s.p(cx - 8, cy - 5, Lt(MOSS)); s.p(cx - 12, cy + 1, Lt(MOSS));
          for (const q of [[-10, -7], [-5, -5], [-13, -2], [-6, -1], [-10, 4], [-3, -10], [0, -3]]) { s.p(cx + q[0], cy + q[1], Lt(PURP)); s.p(cx + q[0] + 1, cy + q[1] + 1, Dk(PURP)); }
        });
      });
      // chân sau gập, bàn chân dài
      S.part((s) => {
        if (slam === 2) { s.er(bx - 13, -6, 9, 4.6, -14, PURP); s.r(bx - 25, -3, 10, 2, PURP); s.p(bx - 26, -3, PURP); s.p(bx - 26, -1, PURP); }
        else {
          s.e(bx - 9, -7 - up * 1.6, 8 - up * 0.5, 6 + up * 1.1, PURP);
          const f0 = bx - 12 + fo;
          s.r(f0, -3, 13, 2, PURP); s.r(f0 + 12, -4, 2, 1, PURP); s.p(f0 + 14, -2, PURP); s.p(f0 + 13, -1, PURP);
        }
        s.in(() => {
          const tx = slam === 2 ? bx - 14 : bx - 10, tyy = slam === 2 ? -7 : -8 - up * 1.6;
          s.e(tx, tyy, 1.8, 1.2, Md(MOSS)); s.p(tx, tyy - 1, Lt(MOSS)); s.p(tx + 5, tyy - 1, Lt(PURP)); s.p(tx + 6, tyy, Dk(PURP)); s.p(tx - 3, tyy + 3, Lt(PURP)); s.p(tx + 3, tyy + 3, Lt(PURP));
        });
      });
      // túi họng
      S.part((s) => {
        const qx = hx + 3 + up * 0.8, qy = hy + 8 + up * 0.6, qrx = slam ? 7 : 6 + up * 1.6, qry = slam ? 3 : 4 + up * 1.5;
        s.e(qx, qy, qrx, qry, rgSAC);
        s.in(() => { s.e(qx + qrx * 0.35, qy - qry * 0.3, qrx * 0.3, qry * 0.25, Lt(rgSAC)); if (up >= 2) { s.p(qx - 2, qy + qry - 2, Dk(rgSAC)); s.p(qx + 3, qy + qry - 1, Dk(rgSAC)); } });
      });
      // đầu to, hai u mắt lồi
      S.part((s) => {
        s.e(hx, hy, 11, 7.5, PURP);
        s.e(hx - 3, hy - 7, 4.7, 4.7, PURP); s.e(hx + 6, hy - 7, 3.7, 4.7, PURP);
        s.in(() => {
          s.e(hx + 1, hy + 8, 12, 4, Md(CREAM));
          s.e(hx - 8, hy - 1, 1.2, 0.8, Md(MOSS)); s.p(hx - 9, hy - 4, Lt(PURP)); s.p(hx - 6, hy + 1, Lt(PURP)); s.p(hx - 5, hy + 2, Dk(PURP));
          s.p(hx + 10, hy - 1, Dk(PURP)); s.p(hx + 2, hy - 4, Md(CR)); s.p(hx + 1, hy - 1, Md(CR)); s.p(hx + 1, hy - 2, E.glow);
        });
      });
      S.part((s) => arm(s, 0));
      // lưỡi phóng ra
      if (slam) S.part((s) => {
        const pts = slam === 2 ? [[hx + 7, hy + 4], [hx + 15, hy + 2], [hx + 23, hy + 6], [hx + 27, hy + 12]] : [[hx + 7, hy + 4], [hx + 12, hy + 3], [hx + 16, hy + 6]];
        const t = pts[pts.length - 1];
        s.cv(pts, 2, 2, PINK); s.e(t[0], t[1], 2.4, 2.4, PINK);
      });
      if (up >= 2) rgPuff(S, [[cx - 14, cy - 22 - up, E.glow], [cx - 6, cy - 25 - up * 2, E.hot], [cx - 18, cy - 14, E.glow], [cx - 1, cy - 22, E.glow]].slice(0, up + 1));
      if (slam === 2) rgPuff(S, [[bx + 22, -1, CREAM[1]], [bx + 25, -3, CREAM[2]], [bx - 28, -4, CREAM[1]], [hx + 31, hy + 9, E.glow], [hx + 30, hy + 15, E.glow]]);
      S.flat((s) => {
        const ey = hy - 7, o = { look: [1, 0], rim: PURP[0], col: '#fff0b0', lid: P.bl ? 5 : 1, brow: 'angry', glow: an ? E.glow : null };
        eye(s, hx - 3, ey, P.dead ? { x: 1, rim: PURP[0] } : o);
        eye(s, hx + 6, ey, P.dead ? { x: 1, w: 3, rim: PURP[0] } : Object.assign({}, o, { w: 3, side: -1 }));
        if (slam) { s.g([[hx - 5, hy + 3], [hx + 10, hy + 2], [hx + 10, hy + 5], [hx - 2, hy + 6]], MOUTH); s.l(hx - 6, hy + 3, hx + 10, hy + 2, 1, INK); }
        else { s.l(hx - 5, hy + 3, hx + 10, hy + 3, 1, INK); s.p(hx - 6, hy + 4, INK); s.p(hx - 7, hy + 5, INK); }
      });
    },
  });

  // ====================================================================
  // 4A-2. TRÙM NHỎ RỪNG GIÀ: NẤM CHÚA
  // ====================================================================
  const rgARM = mix3(CREAM, BARK, 0.25); // tay của Nấm Chúa
  // P có thêm: kd tên đòn ('' | 'slam' | 'charge' | 'burst' | 'summon' | 'swipe'), roar gầm, f3 khung nháy nhanh 0..2, tired thở dốc.
  // Góc tay tính theo màn hình: 0 là chĩa sang phải, 90 là chĩa xuống, -90 là chĩa lên.
  MINI[0] = {
    name: 'Nấm Chúa', size: [120, 100], org: [60, 88], top: 55, sh: 18,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.poison, DR = E.B;
      const an = P.an || 0, sk = P.sk || 0, f3 = P.f3 || 0, k = (P.tl || 0) & 1;
      const w = P.w == null ? -1 : P.w, fo = w < 0 ? 0 : WX[w];
      const atk = P.kd || (an || sk ? 'swipe' : '');
      const roar = P.roar || (atk === 'summon' && (sk || an === 3));
      // ---- tư thế: sq bẹp (dương) hay vươn (âm), tilt nghiêng mũ, lean xô thân, aL aR góc hai tay ----
      let sq = P.br ? 0.07 : 0, tilt = 0, lean = 0, aL = 112, aR = 68, lenL = 7, lenR = 7, mo = 'frown';
      let swell = 0, crUp = 0, jit = 0, cheeks = 0, mad = 0;
      if (P.dead) { sq = 0.45; tilt = 14; aL = 96; aR = 84; mo = 'wavy'; }
      else if (roar) { sq = -0.4; tilt = -7; aL = -118; aR = -62; lenL = lenR = 11; mo = 'roar'; jit = f3 - 1; mad = 1; }
      else if (P.tired) { sq = 0.35 + (k ? 0.08 : 0); tilt = 9; lean = 2; aL = 99; aR = 81; mo = 'pant'; }
      else if (atk === 'slam') {
        mad = 1; mo = 'grit';
        if (an === 3) { sq = -1; aL = -112; aR = -68; lenL = lenR = 11; } // vươn hết cỡ, sắp bật lên
        else if (an) { sq = an * 0.42; aL = 142; aR = 38; }
        else { sq = [0, 1, 0.55, 0.2][sk]; aL = 176; aR = 4; if (sk === 1) mo = 'big'; }
      } else if (atk === 'charge') {
        mad = 1; mo = 'grit';
        if (an) { tilt = an * 14; lean = an * 1.5; sq = 0.2; aL = 152; aR = 132; jit = an === 3 ? f3 - 1 : 0; }
        else { tilt = 52; lean = 7; sq = 0.15; aL = 172; aR = 160; }
      } else if (atk === 'burst') {
        mad = 1; aL = 150; aR = 30;
        if (an) { swell = an * 1.6 + (f3 === 1 ? 1 : 0); sq = an * 0.1; cheeks = 1; mo = 'puff'; }
        else { swell = [0, -3, 2, 0.5][sk]; crUp = [0, 8, 4, 1][sk]; sq = [0, 0.3, -0.1, 0][sk]; mo = sk === 1 ? 'o' : 'grit'; }
      } else if (atk === 'summon') { sq = an * 0.2; tilt = -an * 3; lean = -an; aL = 122; aR = 58; cheeks = 1; mo = 'puff'; mad = 1; } // hít hơi
      else if (atk === 'swipe') {
        mad = 1; mo = 'grit'; aL = 140;
        if (an) { lean = -an * 1.5; tilt = -an * 5; aR = -40 - an * 12; lenR = 8 + an; }
        else { lean = [0, 5, 3, 1][sk]; tilt = [0, 14, 8, 3][sk]; aR = [0, 12, 55, 70][sk]; lenR = [7, 17, 12, 9][sk]; aL = 155; if (sk === 1) mo = 'big'; }
      } else if (w >= 0) { aL += fo * 6; aR += fo * 6; }
      const by = w === 1 || w === 3 ? -1 : 0;
      const H = sq >= 0 ? 28 - 10 * sq : 28 - 7 * sq, Wd = sq >= 0 ? 12 + 4 * sq : 12 + 2 * sq;
      const rx = (sq >= 0 ? 25 + 5 * sq : 25 + 3 * sq) + swell, ry = (sq >= 0 ? 16 - 5 * sq : 16 - 2 * sq) + swell;
      const capY = Math.round(-2 - H + by), lx = Math.round(lean + jit), fl = lx * 0.6;
      const f = S.fr(lx, capY, tilt);
      // bàn chân tím
      S.part((s) => {
        const sp = sq > 0 ? sq * 3 : 0, up = an === 3 && atk === 'slam' ? 0 : 0;
        rd(s, -12 - sp + fo, -5 + up - (w === 0 ? 1 : 0), 10, 5, PURP); rd(s, 3 + sp - fo, -5 + up - (w === 2 ? 1 : 0), 10, 5, PURP);
      });
      // thân (cuống nấm) mập
      S.part((s) => {
        const yt = capY + 2;
        s.g([[-Wd - 1, -9], [-Wd + 2 + lx, yt], [Wd - 2 + lx, yt], [Wd + 1, -9]], CREAM);
        s.e(lx * 0.15, -10, Wd + 1.5, 6.5, CREAM);
        s.in(() => {
          s.l(-Wd + 1, -8, -Wd + 3 + lx, yt + 3, 2, Dk(CREAM)); s.e(lx * 0.15 - 3, -5, Wd - 3, 1.5, Dk(CREAM));
          s.l(-Wd + 3 + lx, yt + 2, Wd - 3 + lx, yt + 2, 3, Dk(CREAM)); // bóng mũ đổ xuống
          s.p(Wd - 3 + fl, -8, Lt(CREAM)); s.p(Wd - 4 + fl, -12, Lt(CREAM));
        });
      });
      // phiến dưới mũ
      S.part((s) => { f.e(0, 2, rx - 3, 3.2, Dk(CREAM)); s.in(() => { for (let i = -3; i <= 3; i++) f.l(i * (rx / 4.2), 1, i * (rx / 3.6), 5, 1, Md(CREAM)); }); });
      // mũ nấm tím, mép lượn sóng
      S.part((s) => {
        f.e(0, 0, rx, ry, PURP);
        f.g([[-rx - 3, 3], [rx + 3, 3], [rx + 3, ry + 4], [-rx - 3, ry + 4]], 0);
        for (let i = 0; i < 7; i++) f.e(-rx + 4 + (i * (rx * 2 - 8)) / 6, 2.4, 4, 2.6, PURP);
        s.in(() => {
          const u = rx / 25, v = ry / 16;
          f.e(-13 * u, -6 * v, 4.4, 3.2, Md(CREAM)); f.e(-13.6 * u, -6.6 * v, 3, 2, Lt(CREAM));
          f.e(3 * u, -11 * v, 5.2, 3.4, Md(CREAM)); f.e(2.4 * u, -11.6 * v, 3.6, 2, Lt(CREAM));
          f.e(15 * u, -5 * v, 3.4, 2.6, Md(CREAM)); f.e(14.6 * u, -5.6 * v, 2, 1.4, Lt(CREAM));
          f.e(-3 * u, -2 * v, 2, 1.4, Md(CREAM)); f.e(-20 * u, 0, 1.6, 1.2, Md(CREAM)); f.e(21 * u, 0.5, 1.4, 1, Md(CREAM)); f.e(-7 * u, -13 * v, 1.4, 1, Md(CREAM));
          f.e(-rx * 0.45, -ry * 0.8, rx * 0.22, 1, Lt(PURP)); f.e(0, 3.4, rx - 2, 1.4, Dk(PURP));
          if (atk === 'burst') { f.e(1, -ry + 1.5, 4.5, 1.6, Dk(PURP)); if (an >= 2 || sk === 1) f.e(1, -ry + 1.5, 3, 0.8, E.glow); } // lỗ phun trên đỉnh mũ
        });
      });
      // nhựa độc nhỏ giọt quanh mép mũ
      S.part((s) => {
        const xs = [-0.86, -0.62, -0.4, 0.66, 0.88], ls = [3, 5, 2, 4, 3];
        for (let i = 0; i < 5; i++) {
          const q = f.pt(xs[i] * rx, 4), len = ls[i] + ((i + k) & 1) + (swell > 2 ? 2 : 0), x = Math.round(q[0]), y = Math.round(q[1]);
          s.r(x, y, 2, len, Md(DR)); s.e(x + 0.5, y + len, 1.5, 1.5, DR);
        }
      });
      // vương miện vàng, giữa có ngọc màu hệ
      S.part((s) => {
        const c = P.dead ? f.sub(9, -ry + 4, 38) : f.sub(1, -ry + 2 - crUp, crUp ? -6 : 0);
        c.g([[-7, 0], [-8, -7], [-4, -3], [0, -9], [4, -3], [8, -7], [7, 0]], GOLD);
        c.r(-7, -2, 15, 3, GOLD);
        s.in(() => { c.r(-1, -5, 3, 3, Md(DR)); c.p(0, -5, E.hot); c.p(-5, -1, Dk(GOLD)); c.p(5, -1, Dk(GOLD)); c.p(-7, -6, Lt(GOLD)); c.p(7, -6, Lt(GOLD)); });
      });
      // hai tay ngắn
      const shy = capY + 4 + H * 0.5;
      const arm = (sx, a, len) => S.part((s) => {
        const r = a * D2R, ex = sx + Math.cos(r) * len, ey = shy + Math.sin(r) * len;
        s.l(sx, shy, ex, ey, 5, rgARM); s.e(ex, ey, 4, 4, rgARM);
        s.in(() => { s.p(ex + 1, ey - 2, Lt(rgARM)); s.p(ex - 1, ey + 2, Dk(rgARM)); });
      });
      arm(-Wd + 1 + fl, aL, lenL); arm(Wd - 1 + fl, aR, lenR);
      // ---- hiệu ứng ----
      const fxp = [];
      if (atk === 'slam' && sk === 1) for (const sg of [-1, 1]) { fxp.push([sg * (rx + 5), -2, CREAM[1]], [sg * (rx + 8), -4, CREAM[2]], [sg * (rx + 11), -2, CREAM[1]], [sg * (rx + 9), -7, CREAM[2]], [sg * (rx + 14), -5, CREAM[1]]); }
      if (atk === 'charge' && sk) for (let i = 0; i < 5; i++) { const y = -6 - i * 9, x = -34 - ((i * 7 + f3 * 5) % 12); for (let j = 0; j < 7 - (i & 1) * 2; j++) fxp.push([x - j, y, i & 1 ? CREAM[1] : '#ffffff']); }
      if (P.tired) { const d = f3 + k; fxp.push([lx + rx * 0.7 + 4, capY - 8 + d, '#9fdcff'], [lx + rx * 0.7 + 4, capY - 7 + d, '#9fdcff'], [lx + rx * 0.7 + 8, capY + 2 + d, '#9fdcff'], [lx - rx * 0.7 - 5, capY - 4 + d * 2, '#9fdcff'], [lx - rx * 0.7 - 5, capY - 3 + d * 2, '#9fdcff']); }
      if (roar || (atk === 'burst' && (an >= 2 || sk))) for (let i = 0; i < 9; i++) {
        const a = (-170 + i * 20 + f3 * 7) * D2R, d = 1.18 + ((i + f3) % 3) * 0.14;
        fxp.push([lx + Math.cos(a) * rx * d, capY - 2 + Math.sin(a) * ry * d * 1.25, i & 1 ? E.glow : E.hot]);
      }
      if (!atk && !P.dead) fxp.push([lx - rx + 3 + k, capY - ry - 2 - k, E.glow], [lx + rx - 6, capY - ry + 1 + k * 2, E.glow], [lx + rx + 2, capY + 9 - k, DR[1]]);
      if (fxp.length) rgPuff(S, fxp);
      if (atk === 'burst' && sk === 1) S.part({ fx: 1 }, (s) => { const q = f.pt(1, -ry - 2); s.e(q[0], q[1], 5, 2.6, E.glow); s.e(q[0], q[1] - 1, 2.6, 1.4, E.hot); });
      if (atk === 'swipe' && sk === 1) S.part({ fx: 1 }, (s) => { // vệt quét tay
        const sx = Wd - 1 + fl, pts = [];
        for (let a = -95; a <= 0; a += 19) pts.push([sx + Math.cos(a * D2R) * 24, shy + Math.sin(a * D2R) * 22]);
        s.cv(pts, 1, 4, CREAM[2]);
      });
      // ---- mặt vua cau có ----
      S.flat((s) => {
        const eh = sq > 0.5 ? 5 : 7, ey = capY + 7 + (eh + 1) / 2, ex = Math.round(fl), my = ey + (eh >> 1) + 3;
        let o = { look: [1, 0], lid: 2, brow: 'flat' };
        if (P.dead) o = { x: 1 };
        else if (P.tired) o = { look: [1, 1], lid: 3, brow: 'sad' };
        else if (mad) o = { look: [1, 0], brow: 'angry' };
        else if (P.bl) o = { shut: 1, brow: 'flat', lidc: CREAM[0] };
        eye(s, ex - 3, ey, Object.assign({ w: 7, h: eh }, o));
        eye(s, ex + 6, ey, Object.assign({ w: 5, h: eh, side: -1 }, o));
        const mx = ex + 2;
        if (cheeks) { s.r(ex - 9, ey + 3, 3, 2, PINK[1]); s.r(ex + 9, ey + 3, 2, 2, PINK[1]); } else { s.r(ex - 8, ey + 4, 2, 1, PINK[2]); s.p(ex + 9, ey + 4, PINK[2]); }
        if (mo === 'frown') stamp(s, ['.KKKKK.', 'K.....K'], mx, my);
        else if (mo === 'grit') mouth(s, 'grit', mx, my);
        else if (mo === 'big') mouth(s, 'big', mx, my - 1);
        else if (mo === 'roar') stamp(s, ['.KKKKKKK.', 'KWDWDWDWK', 'KDDDDDDDK', 'KDDRRRDDK', 'KDRRRRRDK', 'KWDRRRDWK', '.KKKKKKK.'], mx, my - 1);
        else if (mo === 'pant') { stamp(s, ['KKKKK', 'KDDDK', 'KRRRK', '.KRK.'], mx, my); if (k) s.p(mx, my + 4, TONGUE); }
        else if (mo === 'puff') s.r(mx - 1, my, 2, 2, INK);
        else if (mo === 'o') stamp(s, ['.KK.', 'KDDK', 'KDDK', '.KK.'], mx, my);
        else mouth(s, 'wavy', mx, my);
      });
    },
  };

  // ====================================================================
  // 4A-3. TRÙM RỪNG GIÀ: MỘC TINH (cây cổ thụ thành tinh)
  // Thân đứng giữa gốc toạ độ, mặt nhìn thẳng ra. "Trái" là bên trái màn hình (x âm).
  // ====================================================================
  const rgLF0 = ['#143a20', '#235c2c', '#3d8840'];  // lớp lá phía sau, tối hơn
  const rgCHAR = ['#1c1216', '#3a282c', '#62444a']; // vỏ cháy thành than (giáp hệ lửa)
  const rgSOIL = ['#33221a', '#584030', '#7c6044']; // đất bị xới
  const rgBROW = ['#2a190c', '#432a14', '#6a4826']; // mày và mũi: vỏ cây sẫm
  // Điểm trên đường cong mềm đi qua các mốc pts, u chạy 0..1 (cùng công thức với Spr.cv).
  function rgCR(pts, u) {
    const n = pts.length, at = (i) => pts[Math.max(0, Math.min(n - 1, i))];
    const f = Math.min(n - 1.0001, Math.max(0, u * (n - 1))), i = Math.floor(f), t = f - i, t2 = t * t, t3 = t2 * t;
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
    return [c(0), c(1)];
  }
  // Cụm lá: bầu dục mép lượn sóng, đáy có bóng, bên trong có nét lá nhỏ. Nên gọi mỗi cụm trong một miếng riêng.
  function rgClump(s, cx, cy, rx, ry, C, seed) {
    s.e(cx, cy, rx, ry, C);
    const n = Math.round((rx + ry) * 0.55);
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + seed, r = 2.6 + hsh(seed * 7 + i) * 1.6; s.e(cx + Math.cos(a) * rx * 0.92, cy + Math.sin(a) * ry * 0.9, r, r * 0.85, C); }
    s.in(() => {
      s.e(cx, cy + ry * 0.62, rx * 0.9, ry * 0.45, Dk(C)); s.e(cx, cy + ry * 0.36, rx * 0.92, ry * 0.42, Md(C));
      const m = Math.round(rx * ry * 0.07);
      for (let i = 0; i < m; i++) {
        const x = cx + (hsh(seed + i * 3.1) * 2 - 1) * rx * 0.8, y = cy + (hsh(seed * 2 + i * 5.7) * 2 - 1) * ry * 0.7;
        if (hsh(i + seed) > 0.45) { s.p(x, y, Lt(C)); s.p(x + 1, y, Lt(C)); s.p(x - 1, y + 1, Lt(C)); } else { s.p(x, y, Dk(C)); s.p(x + 1, y + 1, Dk(C)); }
      }
    });
  }
  // Khung xương của Mộc Tinh theo tư thế Q: phép dời điểm T và các khớp tay. Dùng chung cho hàm vẽ và hàm anchor.
  function rgMocGeo(Q) {
    const lean = Q.lean * 8, slump = Q.slump * 7, br = Q.breath * 1.5;
    // T: đưa một điểm của dáng đứng thẳng về chỗ thật sau khi nghiêng, sụp xuống, thở
    const T = (x, y) => { const h = Math.max(0, -y); return [x + lean * Math.pow(h / 80, 1.3), y + slump * clamp01((h - 8) / 50) - br * clamp01((h - 30) / 40)]; };
    const arm = (sg, a1, a2) => {
      const sh = T(sg * 24, -62), r1 = a1 * D2R, r2 = a2 * D2R, L2 = 25 + Q.dig * 22;
      const el = [sh[0] + sg * Math.cos(r1) * 24, sh[1] + Math.sin(r1) * 24];
      const hd = [el[0] + sg * Math.cos(r2) * L2, el[1] + Math.sin(r2) * L2];
      return { sg, sh, el, hd, a2 };
    };
    const L = arm(-1, Q.la1, Q.la2), R = arm(1, Q.ra1, Q.ra2);
    const tip = [lerp(L.hd[0], Q.whipX, clamp01(Q.whip)), lerp(L.hd[1], Q.whipY, clamp01(Q.whip))];
    return { T, L, R, tip };
  }

  BOSS.moc = {
    name: 'Mộc Tinh', size: [300, 180], org: [196, 152], top: 122, sh: 34,
    // ----- Tư thế Q (mọi trường là số liên tục, trừ eye) -----
    pose() {
      return {
        lean: 0,     // -1..1: thân nghiêng sang trái (âm) hay phải (dương), ngọn lệch tối đa khoảng 14 điểm ảnh
        slump: 0,    // 0..1: thân trên sụp xuống (mệt, lộ sơ hở, cúi cắm tay xuống đất)
        breath: 0,   // 0..1: nhịp thở, nửa thân trên nhô lên một chút
        sway: 0,     // -1..1: dây leo, rêu, lửa mắt đung đưa
        eye: 'normal', // 'normal' | 'angry' | 'dazed' (choáng) | 'dead'
        blink: 0,    // 0..1: mí sụp dần, từ 0.8 là nhắm hẳn
        lookX: -1, lookY: 0, // -1..1: hướng nhìn
        eyeGlow: 0,  // 0..1: mắt rực lên (từ 0.5 có lửa ở đuôi mắt); phase 1 trở đi luôn rực
        mouth: 0,    // 0..1: 0 ngậm, 0.3 nói, 0.6 quát, 1 gầm
        core: 0.3,   // 0..1: lõi nhựa sáng trong miệng; trên 0.75 mà miệng mở to thì lõi lòi hẳn ra (lúc lộ sơ hở)
        la1: 42, la2: 100, // góc bắp tay và cẳng tay TRÁI (độ): 0 là chĩa ngang ra ngoài, 90 chĩa xuống, -90 chĩa lên, trên 90 là gập vào trong
        ra1: 42, ra2: 100, // như trên cho tay PHẢI (tự lật gương)
        gripL: 0, gripR: 0, // 0..1: nắm ngón cành lại
        whip: 0,     // 0..1: tay trái hoá roi dây leo, 1 là vươn tới hẳn điểm (whipX, whipY)
        whipX: -150, whipY: -8, // đầu roi, tính từ gốc (giữa chân). Khung vẽ chỉ chứa được tới x = -194, xa hơn bị cắt (xem anchor)
        whipWave: 0.5, // -1..1: độ uốn lượn của roi
        dig: 0,      // 0..1: cẳng tay mọc dài cắm xuống đất (đòn rễ)
        pump: 0,     // 0..1: nhịp bơm của đòn rễ, rễ trồi lên chạy ra xa
        shake: 0,    // điểm ảnh: tán cây xô ngang (đòn rụng quả), khoảng -4..4
        fruit: 0,    // 0..1: quả độc lớn dần và chín tím
        thorn: 0,    // 0..1: gai quanh gốc dựng lên
        burst: 0,    // 0..1: gai bung ra (dài thêm, có vệt)
        footL: 0, footR: 0, // 0..1: nhấc chân rễ trái, phải (phase 2 biết đi)
        crack: 0.5,  // 0..1: độ sáng vết nứt (chỉ thấy ở phase 2)
        pulse: 0.5,  // 0..1: nhịp đập của lõi điểm yếu
      };
    },
    // Các điểm mốc (toạ độ tính từ gốc) để game vẽ thêm hiệu ứng hay nối dài roi: vai, khuỷu, bàn tay trái phải, đầu roi, miệng, điểm yếu, mắt thứ ba.
    anchor(Q0) {
      const Q = Object.assign(this.pose(), Q0 || {}), g = rgMocGeo(Q);
      return { shL: g.L.sh, elL: g.L.el, handL: g.L.hd, shR: g.R.sh, elR: g.R.el, handR: g.R.hd, tip: g.tip, mouth: g.T(0, -35), weak: g.T(10, -18), eye3: g.T(0, -69), top: g.T(0, -121) };
    },
    // X: { phase 0..2, el + E (hệ đang kháng), weak + W (hệ khắc), aR chống bắn xa, aM chống đánh gần, aD đọc né }
    draw(S, Q0, X) {
      const Q = Object.assign(this.pose(), Q0 || {}); X = X || {};
      const ph = X.phase || 0, E = X.el ? X.E || ELP[X.el] : null, W = X.weak ? X.W || ELP[X.weak] : null;
      const SAP = ELP.poison, geo = rgMocGeo(Q), T = geo.T, sw = Q.sway * 2;
      const C = (x, y) => { const q = T(x, y); return [q[0] + Q.shake, q[1]]; }; // điểm thuộc tán cây
      const burn = ph >= 1 || Q.eyeGlow >= 0.5, angry = ph >= 1 || Q.eye === 'angry';
      const AC = E ? (X.el === 'fire' ? rgCHAR : E.B) : null; // chất liệu lớp giáp hệ
      const fx = [];
      // ---- đồ nghề vẽ giáp hệ ----
      // sơn một mảng giáp (gọi trong s.in): lửa là vỏ cháy có khe than hồng, băng là lớp băng, độc là nhớt
      const plate = (s, pts, noEdge) => {
        if (!E) return;
        s.g(pts, Md(AC));
        let cx = 0, cy = 0; for (const q of pts) { cx += q[0]; cy += q[1]; } cx /= pts.length; cy /= pts.length;
        if (!noEdge) for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s.l(a[0], a[1], b[0], b[1], 1, X.el === 'ice' ? Lt(AC) : Dk(AC)); }
        if (X.el === 'fire') { for (const q of pts) s.l(cx, cy, lerp(cx, q[0], 0.75), lerp(cy, q[1], 0.75), 1, E.B[1]); s.r(cx - 1, cy - 1, 2, 2, E.glow); }
        else if (X.el === 'ice') { s.l(cx - 3, cy - 1, cx + 1, cy - 4, 1, '#ffffff'); s.p(cx + 2, cy + 1, '#ffffff'); s.p(cx - 2, cy + 3, Dk(AC)); s.p(cx + 3, cy + 4, Dk(AC)); }
        else { s.e(cx - 1, cy - 1, 2.4, 1.4, Lt(AC)); s.p(cx + 3, cy + 2, Dk(AC)); s.p(cx - 3, cy + 3, Dk(AC)); }
      };
      // thứ mọc nhô lên trên giáp: ngọn lửa, cụm băng nhọn, nấm độc to
      const growth = (x, y, r) => {
        if (!E) return;
        if (X.el === 'fire') S.part({ ol: E.B[0] }, (s) => {
          s.g([[x - r * 0.8, y], [x - r * 0.6, y - r], [x - r * 0.15 + sw * 0.4, y - r * 0.7], [x + sw, y - r * 2.1], [x + r * 0.55, y - r * 0.9], [x + r * 0.8, y]], Md(E.B));
          s.in(() => s.g([[x - r * 0.4, y], [x + sw * 0.5, y - r * 1.2], [x + r * 0.4, y]], E.glow));
        });
        else if (X.el === 'ice') S.part((s) => { s.g([[x - r * 0.8, y], [x - r * 0.3, y - r * 1.9], [x + r * 0.3, y]], AC); s.g([[x - r * 0.1, y], [x + r * 0.7, y - r * 1.2], [x + r, y]], AC); s.in(() => s.l(x - r * 0.3, y - r * 1.5, x - r * 0.2, y - 2, 1, '#ffffff')); });
        else S.part((s) => {
          s.e(x, y - r, r, r * 0.8, AC); s.r(x - r - 1, y - r + 1, r * 2 + 3, r, 0); s.r(x - 1, y - r + 1, 3, r, Md(CREAM));
          s.in(() => { s.r(x - r * 0.5, y - r - 1, 2, 2, E.hot); s.p(x + r * 0.4, y - r - 2, E.hot); s.p(x + r * 0.5, y - r, E.hot); });
        });
      };
      // thứ rủ xuống dưới giáp: trụ băng hay giọt nhớt
      const hang = (x, y, len) => {
        if (!E || X.el === 'fire') return;
        S.part((s) => { if (X.el === 'ice') { s.g([[x - 2, y], [x + 2, y], [x, y + len]], AC); } else { s.r(x - 1, y, 2, len - 1, Md(AC)); s.e(x - 0.5, y + len - 1, 1.4, 1.4, AC); } });
      };

      // ============ 1. PHÍA SAU: tán lá hay cành trụi ============
      if (ph === 0) S.part((s) => { for (const q of [[-27, -95, 24, 17], [27, -96, 24, 17], [0, -104, 27, 16]]) { const c = C(q[0], q[1]); s.e(c[0], c[1], q[2], q[3], rgLF0); } });
      else S.part((s) => {
        const br = (pts, w0, w1) => s.cv(pts.map((q) => C(q[0], q[1])), w0, w1, BARK);
        br([[-10, -72], [-19, -89], [-36, -98], [-45, -113]], 7, 2); br([[-21, -90], [-25, -105], [-18, -117]], 4, 1); br([[-35, -97], [-49, -97], [-56, -105]], 3, 1);
        br([[10, -72], [21, -91], [35, -102], [40, -119]], 7, 2); br([[22, -92], [19, -108], [26, -120]], 4, 1); br([[34, -100], [48, -101], [55, -110]], 3, 1);
        br([[0, -74], [-2, -95], [4, -110]], 6, 2); br([[-1, -93], [-9, -103], [-8, -113]], 3, 1); br([[2, -100], [10, -108], [9, -116]], 2, 1);
        for (const q of [[-45, -113], [26, -120], [-56, -105]]) { const c = C(q[0], q[1]); rgLeaf(s, c[0], c[1], 70 + sw * 8, 5, 3, WD); } // vài lá khô còn sót
      });

      // ============ 2. CHÂN RỄ ============
      const foot = (sg, lift) => S.part((s) => {
        const ox = sg * 15 + sg * lift * 2, oy = -lift * 7;
        s.g([[ox - sg * 9, oy - 16], [ox + sg * 10, oy - 14], [ox + sg * 19, oy - 5], [ox + sg * 18, oy - 1], [ox - sg * 8, oy - 1]], BARK);
        s.l(ox + sg * 14, oy - 6, ox + sg * 27, oy - 2, 4, BARK); s.l(ox + sg * 4, oy - 6, ox + sg * 6, oy - 2, 4, BARK); s.l(ox - sg * 5, oy - 6, ox - sg * 9, oy - 2, 4, BARK);
        if (lift > 0.2) { s.l(ox + sg * 2, oy, ox + sg * 1, oy + 4 * lift, 1, Dk(BARK)); s.l(ox + sg * 12, oy, ox + sg * 13, oy + 5 * lift, 1, Dk(BARK)); s.l(ox - sg * 4, oy, ox - sg * 5, oy + 3 * lift, 1, Dk(BARK)); }
        else s.cv([[ox + sg * 16, oy - 5], [ox + sg * 26, oy - 5], [ox + sg * 33, oy - 2]], 3, 2, BARK);
        s.in(() => {
          s.l(ox + sg * 3, oy - 12, ox + sg * 12, oy - 4, 1, Dk(BARK)); s.l(ox - sg * 3, oy - 11, ox - sg * 1, oy - 4, 1, Dk(BARK));
          s.e(ox + sg * 12, oy - 9, 4, 1.6, Md(MOSS)); s.p(ox + sg * 11, oy - 10, Lt(MOSS));
          if (E) plate(s, [[ox + sg * 6, oy - 14], [ox + sg * 20, oy - 11], [ox + sg * 24, oy - 3], [ox + sg * 10, oy - 5]]);
        });
      });
      foot(-1, Q.footL); foot(1, Q.footR);
      { const lf = Q.footR; S.part((s) => { const x = 27 + lf * 2, y = -9 - lf * 7; s.e(x, y - 4, 3.6, 2.6, PURP); s.r(x - 5, y - 3, 10, 4, 0); s.r(x - 1, y - 3, 2, 4, Md(CREAM)); s.in(() => s.p(x - 1, y - 6, Lt(CREAM))); }); } // nấm tím trên rễ phải

      // ============ 3. THÂN ============
      const prof = [[-4, 26], [-12, 24], [-28, 21], [-46, 20], [-60, 22], [-75, 25], [-81, 19]]; // [độ cao y, nửa bề rộng]
      S.part((s) => { for (const q of [[-23, -41, 5], [-24, -33, 4]]) { const c = T(q[0], q[1]); s.e(c[0] - 2, c[1], q[2], q[2] * 0.55, PURP); s.r(c[0] - 9, c[1] + 1, 12, 4, 0); s.in(() => s.p(c[0] - 3, c[1] - 1, Lt(CREAM))); } }); // nấm tai mèo tím bên sườn trái
      S.part((s) => {
        const pts = [];
        for (const q of prof) pts.push(T(-q[1], q[0]));
        for (let i = prof.length - 1; i >= 0; i--) pts.push(T(prof[i][1], prof[i][0]));
        s.g(pts, BARK);
        s.in(() => {
          // mép trái tối, mép phải sáng
          for (let i = 0; i + 1 < prof.length; i++) {
            const a = prof[i], b = prof[i + 1], p0 = T(-a[1], a[0]), p1 = T(-b[1], b[0]), q0 = T(a[1], a[0]), q1 = T(b[1], b[0]);
            s.l(p0[0] + 2, p0[1], p1[0] + 2, p1[1], 3, Dk(BARK)); s.l(q0[0] - 2, q0[1], q1[0] - 2, q1[1], 2, Lt(BARK));
          }
          if (ph === 0) { const a = T(-25, -76), b = T(25, -76); s.l(a[0], a[1], b[0], b[1], 7, Dk(BARK)); } // bóng tán đổ lên trán
          // thớ vỏ
          for (let i = 0; i < 18; i++) {
            const x = -20 + hsh(i * 3.3) * 40, y = -6 - hsh(i * 7.1) * 60, L = 5 + hsh(i) * 9, a = T(x, y), b = T(x + hsh(i * 2) * 2 - 1, y - L);
            s.l(a[0], a[1], b[0], b[1], 1, Dk(BARK)); if (i & 1) s.l(a[0] + 1, a[1] - 1, b[0] + 1, b[1] + 2, 1, Lt(BARK));
          }
          for (const sg of [-1, 1]) { const e = T(sg * 11, -51); s.e(e[0], e[1], 8.5, 8, Dk(BARK)); } // hốc mắt
          { const m = T(14, -12); s.e(m[0], m[1] + 6, 6, 2, Md(MOSS)); s.p(m[0] - 2, m[1] + 5, Lt(MOSS)); const n = T(-15, -58); s.e(n[0], n[1] - 8, 4, 1.6, Md(MOSS)); }
          if (E) {
            plate(s, [T(-28, -33), T(-9, -29), T(-6, -15), T(-11, -3), T(-29, -3)]);
            plate(s, [T(14, -82), T(27, -82), T(24, -62), T(17, -66)]);
            plate(s, [T(-27, -82), T(-13, -82), T(-17, -67), T(-24, -64)]);
          }
          if (ph >= 2) { // vết nứt sáng
            const cc = mixHex(SAP.B[1], SAP.hot, Q.crack);
            for (const pl of [[[-14, -28], [-17, -20], [-12, -14], [-16, -6]], [[15, -44], [19, -38], [14, -30], [18, -24]], [[-13, -60], [-16, -67], [-12, -74]], [[-2, -22], [-5, -14], [-1, -6]], [[19, -60], [16, -66], [19, -72]]]) {
              const tp = pl.map((q) => T(q[0], q[1])); s.pl(tp.map((q) => [q[0] - 1, q[1]]), 1, INK); s.pl(tp, 1, cc);
            }
          }
        });
      });
      if (E) { const a = T(-19, -31), b = T(20, -79); growth(a[0], a[1] + 1, 5); hang(T(-24, -64)[0], T(-24, -64)[1], 5); hang(b[0] + 2, T(20, -63)[1], 4); if (X.el !== 'fire') hang(a[0] + 8, T(0, -15)[1], 5); }

      // ============ 4. ĐIỂM YẾU: hốc nứt có lõi đập ============
      if (W) {
        const c = T(10, -18), x = Math.round(c[0]), y = Math.round(c[1]), r = 2.6 + Q.pulse * 1.6;
        S.part((s) => { s.e(x, y, 7.5, 8, Lt(BARK)); });
        S.flat((s) => {
          s.e(x, y, 6, 6.6, '#160a10');
          for (const q of [[-7, -7, -11, -11], [7, -6, 12, -9], [-7, 6, -11, 10], [6, 7, 9, 12], [0, -8, 1, -13]]) { s.l(x + q[0] * 0.8, y + q[1] * 0.8, x + q[2], y + q[3], 1, INK); }
          s.e(x, y, r + 1.4, r + 1.4, W.B[0]); s.e(x, y, r, r, W.B[1]); s.e(x, y, r * 0.6, r * 0.6, W.glow); s.p(x, y - 1, W.hot); s.p(x - 1, y - 1, W.hot);
        });
        const d = 9 + Q.pulse * 3; fx.push([x - d, y - 2, W.glow], [x + d, y + 1, W.glow], [x - 2, y - d - 1, W.glow], [x + 3, y + d, W.B[1]]);
      }

      // ============ 5. TÁN LÁ PHÍA TRƯỚC, QUẢ, DÂY RỦ ============
      if (ph === 0) {
        const cl = [[-37, -88, 15, 11, GRN, 1.3], [37, -89, 15, 11, GRN, 2.1], [-20, -101, 18, 13, GRN, 3.7], [21, -102, 18, 13, GRN, 4.2], [0, -108, 16, 11, TOX, 5.5], [-1, -86, 21, 9, GRN, 6.4]];
        for (const q of cl) S.part((s) => { const c = C(q[0], q[1]); rgClump(s, Math.round(c[0]), Math.round(c[1]), q[2], q[3], q[4], q[5]); });
        S.part((s) => { // dây leo rủ từ tán
          for (const q of [[-47, -80, 16], [-31, -77, 10], [31, -77, 12], [47, -81, 18]]) {
            const c = C(q[0], q[1]), L = q[2];
            s.cv([c, [c[0] + sw * 0.5, c[1] + L * 0.5], [c[0] + sw * 1.4 + Q.shake * 0.5, c[1] + L]], 2, 1, GRN);
            s.e(c[0] + sw * 1.4 + Q.shake * 0.5, c[1] + L + 1, 1.6, 1.6, TOX); s.e(c[0] + sw * 0.5 + 2, c[1] + L * 0.5, 1.4, 1.2, GRN);
          }
        });
      }
      if (Q.fruit > 0.05) for (const q of [[-39, -84], [-19, -96], [5, -99], [25, -95], [41, -85]]) S.part((s) => {
        const c = C(q[0], q[1]), r = 1.2 + Q.fruit * 3, ripe = Q.fruit > 0.45;
        s.l(c[0], c[1] - r - 2, c[0], c[1] - r, 1, Dk(GRN)); s.e(c[0], c[1], r, r * 1.1, ripe ? PURP : TOX);
        s.in(() => { s.p(c[0] - r * 0.4, c[1] - r * 0.4, ripe ? Lt(PURP) : '#ffffff'); if (Q.fruit > 0.85) s.p(c[0] + 1, c[1] + 1, SAP.glow); });
        if (Q.fruit > 0.85) fx.push([c[0] + r + 2, c[1] - r, SAP.glow]);
      });
      if (Math.abs(Q.shake) > 1.5 && ph === 0) for (let i = 0; i < 6; i++) { const x = -44 + i * 17 + hsh(i) * 6, y = -70 + hsh(i * 3) * 22; fx.push([x, y, TOX[2]], [x + 1, y + 1, GRN[1]], [x + 2, y + 1, GRN[1]]); }

      // ============ 6. MẮT THỨ BA (đọc cú né) ============
      if (X.aD) {
        const c = T(0, -69), x = Math.round(c[0]), y = Math.round(c[1]);
        S.part((s) => { s.e(x, y, 7, 6.6, BARK); });
        S.flat((s) => eye(s, x, y, Q.eye === 'dead' ? { w: 7, h: 7, x: 1 } : { w: 7, h: 7, look: [Q.lookX < -0.33 ? -1 : Q.lookX > 0.33 ? 1 : 0, 1], pc: '#8c1c6f', col: '#ffe9f4', glow: PURP[2] }));
      }

      // ============ 7. MẶT ============
      // mày vỏ cây
      S.part((s) => {
        for (const sg of [-1, 1]) {
          const iy = Q.eye === 'dazed' ? -62 : angry ? -55 : -57, oy = Q.eye === 'dazed' ? -57 : angry ? -64 : -60;
          const a = T(sg * 4, iy), b = T(sg * 19, oy);
          s.l(a[0], a[1], b[0], b[1], 4, rgBROW); s.l(b[0], b[1], b[0] + sg * 3, b[1] - 2, 2, rgBROW);
        }
        const nz = T(0, -45); s.e(nz[0], nz[1], 2.6, 3.6, rgBROW); s.in(() => s.p(nz[0], nz[1] - 2, Lt(rgBROW))); // mũi là mấu cành gãy
      });
      S.flat((s) => {
        const lk = [Q.lookX < -0.33 ? -1 : Q.lookX > 0.33 ? 1 : 0, Q.lookY < -0.33 ? -1 : Q.lookY > 0.33 ? 1 : 0];
        const col = burn ? '#fff7b8' : '#eaf7b0';
        for (const sg of [-1, 1]) {
          const e = T(sg * 11, -51), x = Math.round(e[0]), y = Math.round(e[1]);
          if (Q.eye === 'dead') { rd(s, x - 5, y - 5, 11, 11, INK); rd(s, x - 4, y - 4, 9, 9, '#9a9484'); for (let i = -2; i <= 2; i++) { s.p(x + i, y + i, INK); s.p(x + i, y - i, INK); } }
          else if (Q.eye === 'dazed') { // mắt xoáy
            const o = Q.sway > 0 ? sg : 0;
            rd(s, x - 5, y - 5, 11, 11, INK); rd(s, x - 4, y - 4, 9, 9, col); rd(s, x - 3 + o, y - 3, 7, 7, INK); rd(s, x - 2 + o, y - 2, 5, 5, col); s.r(x - 1 + o, y - 1, 3, 3, INK); s.p(x + o, y, col); s.p(x + 2 + o, y + 2, col); s.p(x - 3 + o, y, col);
          } else {
            const shut = Q.blink >= 0.8;
            eye(s, x, y, { w: 9, h: 9, look: lk, col, shut: shut ? 1 : 0, lid: shut ? 0 : Math.round(Q.blink * 8) + (angry ? 0 : 1), glow: burn ? SAP.glow : SAP.B[1] });
            if (burn) { // lửa xanh ở đuôi mắt
              const fxx = x + sg * 5, fy = y - 6;
              for (let i = 0; i < 6; i++) { const yy = fy - i, ww = i < 2 ? 3 : i < 4 ? 2 : 1, xo = Math.round(Math.sin(i * 0.9 + Q.sway * 3) * 1.2) + sg * (i >> 1); for (let j = 0; j < ww; j++) fx.push([fxx + xo + j * sg, yy, i < 3 ? SAP.hot : SAP.glow]); }
            }
          }
        }
        // miệng răng cưa, trong có lõi nhựa sáng
        const m = T(0, -34), op = Q.mouth * 16, hw = 14 + Q.mouth * 3, top = m[1] - 2 - op * 0.3, bot = m[1] + 2 + op * 0.7, n = 8, up = [], lo = [];
        for (let i = 0; i <= n; i++) {
          const x = m[0] - hw + (i * 2 * hw) / n, d = Math.pow((i - n / 2) / (n / 2), 2) * 3;
          up.push([x, top + d + (i & 1 ? 3 : 0)]); lo.push([x, bot + d - (i & 1 ? 0 : 3)]);
        }
        s.g(up.concat(lo.slice().reverse()), '#221016');
        if (Q.core > 0.05) s.in(() => {
          const r = 1 + Q.core * 5, cy = (top + bot) / 2 + 2;
          s.e(m[0], cy, r + 1.6, r + 1.6, SAP.B[0]); s.e(m[0], cy, r, r, SAP.B[1]); s.e(m[0], cy, r * 0.6, r * 0.6, SAP.glow); s.p(m[0], cy - 1, SAP.hot); s.p(m[0] - 1, cy - 1, SAP.hot);
        });
        s.pl(up, 1, INK); s.pl(lo, 1, INK);
        s.p(up[0][0] - 1, up[0][1] + 1, INK); s.p(up[n][0] + 1, up[n][1] + 1, INK);
        for (let i = 1; i < n; i += 2) s.p(up[i][0], up[i][1] - 1, BARK[2]);
        if (Q.mouth > 0.85) for (let i = 0; i < 5; i++) fx.push([m[0] - 8 + i * 4 + (i & 1), bot + 4 + (i & 1) * 2 + (i === 2 ? 2 : 0), SAP.glow]);
      });
      // lõi nhựa lòi ra khi lộ sơ hở
      if (Q.core > 0.75 && Q.mouth > 0.55) {
        const m = T(0, -34), cy = m[1] + Q.mouth * 4 + 2, r = 4.5 + (Q.core - 0.75) * 8;
        S.part({ ol: SAP.B[0] }, (s) => { s.e(m[0], cy, r, r, SAP.B); s.in(() => { s.e(m[0], cy, r * 0.62, r * 0.62, SAP.glow); s.e(m[0] - 1, cy - 1, r * 0.3, r * 0.3, SAP.hot); }); });
        for (let i = 0; i < 8; i++) { const a = i * 0.785 + Q.pulse, d = r + 3 + (i & 1) * 2 + Q.pulse * 2; fx.push([m[0] + Math.cos(a) * d, cy + Math.sin(a) * d, i & 1 ? SAP.glow : SAP.hot]); }
        fx.push([m[0] - 2, cy + r + 3, SAP.B[1]], [m[0] - 2, cy + r + 4, SAP.glow], [m[0] + 3, cy + r + 6, SAP.glow]);
      }
      if (Q.eye === 'dazed') for (let i = 0; i < 3; i++) { const a = i * 2.09 + Q.sway * 2, c = T(0, -76), x = c[0] + Math.cos(a) * 16, y = c[1] + Math.sin(a) * 4; fx.push([x, y, '#ffe36a'], [x - 1, y, '#ffe36a'], [x + 1, y, '#ffe36a'], [x, y - 1, '#ffe36a'], [x, y + 1, '#ffe36a']); }

      // ============ 8. MÀN DÂY LEO (chống bắn xa) ============
      if (X.aR) {
        const strand = (x, y0, y1, i) => S.part((s) => {
          const a = T(x, y0), b = T(x, y1), k = sw * (0.6 + (i & 1) * 0.5), pts = [[a[0], a[1]], [a[0] + k * 0.4 + (i & 1 ? 1.5 : -1.5), lerp(a[1], b[1], 0.5)], [b[0] + k, b[1]]];
          const n = Math.max(1, Math.round((y1 - y0) / 9));
          for (let j = 0; j < n; j++) { const q = rgCR(pts, (j + 0.6) / n), sd = (j + i) & 1; rgLeaf(s, q[0], q[1], sd ? 35 : 145, 6, 3.6, (j + i) % 3 ? GRN : TOX, 1); }
          s.cv(pts, 2, 2, Md(rgLF0));
          const e = pts[2]; rgLeaf(s, e[0], e[1], 90, 5, 3.4, TOX);
        });
        [-35, -27, -19, 19, 27, 35].forEach((x, i) => strand(x, -75, -10 - (i % 3) * 5 - (Math.abs(x) === 27 ? 0 : 6), i));
        if (!X.aD) [-8, 0, 8].forEach((x, i) => strand(x, -77, -65 + (i & 1) * 3, i + 1));
      }

      // ============ 9. HAI TAY CÀNH ============
      const drawArm = (A, left) => {
        const sg = A.sg, sh = A.sh, el = A.el, hd = A.hd, r2 = A.a2 * D2R, dug = hd[1] > -4, whipOn = left && Q.whip > 0.02;
        const ux = el[0] - sh[0], uy = el[1] - sh[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul;
        const mid = [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2];
        const up = py < 0 ? 1 : -1; // phía "trên" của bắp tay
        S.part((s) => {
          s.cv([sh, [mid[0], mid[1] - 1], el], 12, 10, BARK); s.cv([el, hd], 9, 7, BARK); s.e(el[0], el[1], 6, 6, BARK);
          if (dug) s.r(hd[0] - 16, 0, 32, 40, 0);
          else {
            s.e(hd[0], hd[1], 5, 5, BARK);
            if (!whipOn) {
              const grip = left ? Q.gripL : Q.gripR;
              for (let i = -1; i <= 1; i++) {
                const a = r2 + i * (0.62 - grip * 0.35), L = (i ? 8 : 10) * (1 - grip * 0.45), cx = sg * Math.cos(a), cy = Math.sin(a);
                s.l(hd[0] + cx * 3, hd[1] + cy * 3, hd[0] + cx * (4 + L), hd[1] + cy * (4 + L), 2, BARK); s.p(hd[0] + cx * (4.5 + L), hd[1] + cy * (4.5 + L), Dk(BARK));
              }
            }
            s.r(hd[0] - 22, 1, 44, 30, 0); // ngón không chọc xuống dưới mặt đất
          }
          s.in(() => {
            s.l(lerp(sh[0], el[0], 0.2), lerp(sh[1], el[1], 0.2) + 2, lerp(sh[0], el[0], 0.75), lerp(sh[1], el[1], 0.75) + 2, 1, Dk(BARK));
            s.l(lerp(el[0], hd[0], 0.25) - 1, lerp(el[1], hd[1], 0.25), lerp(el[0], hd[0], 0.75) - 1, lerp(el[1], hd[1], 0.75), 1, Dk(BARK));
            s.l(lerp(el[0], hd[0], 0.3) + 2, lerp(el[1], hd[1], 0.3), lerp(el[0], hd[0], 0.6) + 2, lerp(el[1], hd[1], 0.6), 1, Lt(BARK));
            s.e(mid[0] + px * up * 4, mid[1] + py * up * 4, 6, 2.2, Md(MOSS)); s.p(mid[0] + px * up * 4 - 2, mid[1] + py * up * 4 - 1, Lt(MOSS));
            s.p(el[0] - 1, el[1] - 1, Lt(BARK)); s.r(el[0], el[1], 2, 2, Dk(BARK));
            if (E) { // giáp phủ kín bắp tay, chừa khuỷu
              const a = [lerp(sh[0], el[0], -0.3), lerp(sh[1], el[1], -0.3)], b = [lerp(sh[0], el[0], 0.78), lerp(sh[1], el[1], 0.78)];
              plate(s, [[a[0] + px * 9, a[1] + py * 9], [b[0] + px * 9, b[1] + py * 9], [b[0] - px * 9, b[1] - py * 9], [a[0] - px * 9, a[1] - py * 9]], 1);
              s.l(b[0] + px * 8, b[1] + py * 8, b[0] - px * 8, b[1] - py * 8, 1, Dk(AC));
            }
          });
        });
        if (E) { growth(mid[0] + px * up * 4, mid[1] + py * up * 4 + 1, 6); const q = [lerp(el[0], hd[0], 0.45), lerp(el[1], hd[1], 0.45)]; hang(mid[0], mid[1] + 5, 6); hang(q[0] + sg * 1, q[1] + 3, 5); }
        else S.part((s) => { // rêu rủ dưới bắp tay
          for (const t of [0.35, 0.7]) { const x = lerp(sh[0], el[0], t), y = lerp(sh[1], el[1], t) + 5, L = t < 0.5 ? 9 : 6; s.cv([[x, y], [x + sw * 0.4, y + L * 0.5], [x + sw, y + L]], 1, 1, Md(MOSS)); s.p(x + sw, y + L + 1, Lt(TOX)); }
        });
        if (dug) { // tay cắm xuống đất: ụ đất và rễ trồi lên chạy ra xa
          const gx = el[0] + (hd[0] - el[0]) * ((-1 - el[1]) / ((hd[1] - el[1]) || 1));
          S.part((s) => { for (let j = 0; j < 2; j++) { const x = gx + sg * (12 + Q.pump * 26 + j * 14), h = 4 + Q.pump * 3 - j * 2; s.cv([[x - 5, 0], [x, -h], [x + 5, 0]], 3, 3, BARK); } s.r(gx - 90, 0, 180, 8, 0); });
          S.part((s) => { s.e(gx, -1, 9 + Q.pump * 2, 3.4 + Q.pump * 1.5, rgSOIL); s.r(gx - 16, 0, 32, 10, 0); });
          for (let i = 0; i < 4; i++) fx.push([gx + sg * (4 + i * 5) - 8, -6 - ((i * 3 + Math.round(Q.pump * 6)) % 7), i & 1 ? rgSOIL[2] : CREAM[1]]);
        }
        if (whipOn) { // roi dây leo
          const tip = geo.tip, dx = tip[0] - hd[0], dy = tip[1] - hd[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
          const amp = Q.whipWave * Math.min(16, len * 0.14), dir = Math.atan2(dy, dx) / D2R;
          const pts = [hd, [hd[0] + dx * 0.33 + nx * amp, hd[1] + dy * 0.33 + ny * amp], [hd[0] + dx * 0.68 - nx * amp, hd[1] + dy * 0.68 - ny * amp], tip];
          S.part((s) => {
            s.cv(pts, 6, 2, GRN);
            const n = Math.floor(len / 13);
            for (let i = 1; i < n; i++) { const q = rgCR(pts, i / n); rgLeaf(s, q[0], q[1], dir + 180 + (i & 1 ? 52 : -52), 6, 3.4, i % 3 ? GRN : TOX); }
            s.e(tip[0], tip[1], 2.8, 2.8, PURP);
            s.in(() => { for (let i = 1; i < n * 2; i++) { const q = rgCR(pts, i / (n * 2)); s.p(q[0], q[1], i & 1 ? Lt(GRN) : Dk(GRN)); } s.p(tip[0] - 1, tip[1] - 1, Lt(PURP)); });
          });
        }
      };
      drawArm(geo.R, false); drawArm(geo.L, true);

      // ============ 10. VÒNG GAI QUANH GỐC ============
      {
        const base = X.aM ? 11 + Q.thorn * 5 : Q.thorn * 13, h0 = base + Q.burst * 7;
        if (h0 > 1) {
          const TC = X.aM ? BONE : PURP;
          S.part((s) => {
            for (let i = 0; i < 10; i++) {
              const x = -40.5 + i * 9, k = (x / 40), h = h0 * (0.75 + 0.25 * (i & 1)) * (1 - Math.abs(k) * 0.25);
              s.g([[x - 3.5, -1], [x + k * (5 + Q.burst * 5), -1 - h], [x + 3.5, -1]], TC);
              if (!X.aM) s.p(x + k * (5 + Q.burst * 5), -1 - h, Lt(TOX));
              if (Q.burst > 0.3) { const tx = x + k * (8 + Q.burst * 9), ty = -4 - h - Q.burst * 6; fx.push([tx, ty, '#ffffff'], [tx + k, ty - 2, X.aM ? BONE[1] : SAP.glow], [tx + k * 2, ty - 4, X.aM ? BONE[1] : SAP.glow]); }
            }
          });
        }
      }
      // ============ 11. HIỆU ỨNG ============
      if (X.el === 'fire') for (let i = 0; i < 6; i++) fx.push([-30 + hsh(i * 2.2) * 60, -30 - hsh(i * 5.1) * 60 - sw, i & 1 ? E.glow : E.B[1]]);
      if (X.el === 'ice') for (let i = 0; i < 5; i++) { const x = -34 + hsh(i * 2.7) * 68, y = -24 - hsh(i * 4.3) * 60; fx.push([x, y, '#ffffff'], [x - 1, y, E.glow], [x + 1, y, E.glow], [x, y - 1, E.glow], [x, y + 1, E.glow]); }
      if (X.el === 'poison') for (let i = 0; i < 6; i++) fx.push([-36 + hsh(i * 2.9) * 72, -40 - hsh(i * 3.7) * 50 + sw, i & 1 ? E.glow : E.hot]);
      if (fx.length) rgPuff(S, fx);
    },
    demos: [
      { id: 'idle', label: 'Đứng yên (giai đoạn 0)', Q: {}, X: {} },
      { id: 'phase1', label: 'Nổi giận (giai đoạn 1)', Q: { eye: 'angry', mouth: 0.3, la1: 35, la2: 70, ra1: 35, ra2: 70, gripL: 0.6, gripR: 0.6 }, X: { phase: 1 } },
      { id: 'phase2', label: 'Hóa cuồng, bước đi', Q: { eye: 'angry', mouth: 0.6, core: 0.6, lean: -0.5, footL: 1, la1: 20, la2: 60, ra1: 65, ra2: 115, crack: 1 }, X: { phase: 2 } },
      { id: 'sweepUp', label: 'Quét: giơ tay lấy đà', Q: { eye: 'angry', mouth: 0.2, lean: 0.7, la1: -55, la2: -105, gripL: 0.3, ra1: 60, ra2: 110 }, X: {} },
      { id: 'sweepOut', label: 'Quét: roi vươn dài', Q: { eye: 'angry', mouth: 0.7, lean: -0.8, la1: 12, la2: 6, whip: 1, whipX: -186, whipY: -7, whipWave: 0.7, ra1: 30, ra2: 120 }, X: {} },
      { id: 'exposed', label: 'Mệt, lộ lõi nhựa', Q: { eye: 'dazed', sway: 1, slump: 1, lean: -0.3, mouth: 0.95, core: 1, la1: 55, la2: 108, ra1: 55, ra2: 108 }, X: {} },
      { id: 'roots', label: 'Cắm tay, bơm rễ', Q: { eye: 'angry', mouth: 0.3, slump: 0.8, dig: 1, pump: 0.6, la1: 32, la2: 86, ra1: 32, ra2: 86 }, X: {} },
      { id: 'fruit', label: 'Rung tán rụng quả', Q: { eye: 'angry', mouth: 0.5, shake: 3, fruit: 1, la1: -58, la2: -82, ra1: -58, ra2: -82 }, X: {} },
      { id: 'roar', label: 'Gầm gọi bầy', Q: { eye: 'angry', eyeGlow: 1, mouth: 1, core: 0.6, lean: -0.4, la1: -30, la2: -70, ra1: -30, ra2: -70 }, X: {} },
      { id: 'thorn', label: 'Gai gốc bung ra', Q: { eye: 'angry', mouth: 0.4, slump: 0.5, thorn: 1, burst: 0.8, la1: 70, la2: 40, ra1: 70, ra2: 40, gripL: 1, gripR: 1 }, X: {} },
      { id: 'elFire', label: 'Kháng Lửa, yếu Băng', Q: {}, X: { el: 'fire', weak: 'ice' } },
      { id: 'elPoison', label: 'Kháng Độc, yếu Lửa', Q: {}, X: { el: 'poison', weak: 'fire' } },
      { id: 'elIce', label: 'Kháng Băng, yếu Độc', Q: {}, X: { el: 'ice', weak: 'poison' } },
      { id: 'aR', label: 'Chống bắn xa: màn dây leo', Q: {}, X: { aR: 1 } },
      { id: 'aM', label: 'Chống đánh gần: vòng gai', Q: {}, X: { aM: 1 } },
      { id: 'aD', label: 'Đọc cú né: mắt thứ ba', Q: {}, X: { aD: 1 } },
      { id: 'all', label: 'Bật hết', Q: { eye: 'angry', mouth: 0.3 }, X: { el: 'fire', weak: 'ice', aR: 1, aM: 1, aD: 1 } },
      { id: 'dead', label: 'Gục', Q: { eye: 'dead', slump: 1, lean: 0.4, mouth: 0.5, core: 0, la1: 80, la2: 100, ra1: 80, ra2: 100 }, X: { phase: 2 } },
    ],
  };

  // ====================================================================
  // 4B. HANG BIỂN (hệ băng): lam và trắng băng
  // ====================================================================
  // ----- Cá Nóc Lính (lính xông): phồng người lên trước khi húc -----
  defMon(1, 'rusher', {
    name: 'Cá Nóc Lính', top: 22, sh: 8,
    draw(S, P) {
      const puff = P.an || (P.sk === 1 ? 3 : P.sk === 2 ? 2 : P.sk === 3 ? 1 : 0);
      const cx = P.sk === 1 ? 3 : P.sk === 2 ? 1 : P.an ? -Math.ceil(P.an / 2) : 0;
      const rx = 8 + puff * 0.9, ry = 7 + puff * 0.9;
      const cy = -4 - ry + (P.br ? -1 : 0) + hop(P);
      const fo = P.w < 0 ? 0 : WX[P.w], k = P.tl & 1;
      // vây đuôi
      S.part((s) => {
        const tx = cx - rx + 2;
        s.g([[tx, cy - 2], [tx - 6, cy - 6 + k], [tx - 4, cy], [tx - 6, cy + 5 - k], [tx, cy + 2]], ICE);
        s.in(() => { s.l(tx - 4, cy - 3 + k, tx - 1, cy - 1, 1, Dk(ICE)); s.l(tx - 4, cy + 3 - k, tx - 1, cy + 1, 1, Dk(ICE)); });
      });
      // hai chân vây
      S.part((s) => { s.r(cx - 5 + fo, -3, 4, 3, Dk(SEA)); s.r(cx + 2 - fo, -3, 4, 3, Dk(SEA)); s.p(cx - 2 + fo, -1, Md(SEA)); s.p(cx + 5 - fo, -1, Md(SEA)); });
      // gai quanh lưng: phồng càng to gai càng dài
      S.part((s) => {
        for (let i = 0; i < 8; i++) {
          const a = (-205 + i * 26) * D2R, L = 1.6 + puff * 1.1;
          s.l(cx + Math.cos(a) * (rx - 1), cy + Math.sin(a) * (ry - 1), cx + Math.cos(a) * (rx + L), cy + Math.sin(a) * (ry + L), puff >= 2 ? 2 : 1, Lt(FOAM));
        }
      });
      // thân tròn
      S.part((s) => {
        s.e(cx, cy, rx, ry, SEA);
        s.in(() => {
          s.e(cx + 1, cy + ry * 0.62, rx * 0.86, ry * 0.5, Md(FOAM));
          s.e(cx + 2, cy + ry * 0.8, rx * 0.6, ry * 0.3, Lt(FOAM));
          s.p(cx - 4, cy - ry + 2, Dk(SEA)); s.p(cx - 1, cy - ry + 1, Lt(SEA)); s.p(cx - 6, cy - 2, Dk(SEA)); s.p(cx - 3, cy - 4, Dk(SEA));
        });
      });
      // vây bên
      S.part((s) => { s.g([[cx - 3, cy + 1], [cx - 7, cy + 3 + k * 2], [cx - 2, cy + 4]], ICE); });
      S.flat((s) => {
        const ex = cx + rx - 5, ey = cy - 2;
        eye(s, ex, ey, eyeOf(P, { look: [1, 0], rim: SEA[0] }));
        if (P.dead) mouth(s, 'wavy', cx + rx - 3, cy + 3);
        else if (P.sk === 1 || P.lg) stamp(s, ['KKK', 'KDK', 'KRK', 'KKK'], cx + rx - 1, cy + 2);
        else if (puff) { s.r(cx + rx - 1, cy + 3, 2, 2, PINK[1]); s.p(cx + rx - 5, cy + 3, PINK[2]); s.p(cx + rx - 6, cy + 3, PINK[2]); }
        else { s.r(cx + rx - 2, cy + 3, 2, 1, INK); s.p(cx + rx - 6, cy + 3, PINK[2]); }
      });
    },
  });

  // ----- Cua Con (bầy nhỏ): chạy ngang, giơ càng doạ -----
  defMon(1, 'swarm', {
    name: 'Cua Con', top: 12, sh: 6,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), lg = P.w < 0 ? 0 : P.w & 1;
      const up = P.an ? 1 + P.an : 0, snap = P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0;
      // chân
      S.part((s) => {
        for (let i = 0; i < 3; i++) {
          const k = (i + lg) & 1;
          s.l(-3 - i, -3 + by, -6 - i, -1 + (k ? -1 : 0), 1, Dk(SEA));
          s.l(3 + i, -3 + by, 6 + i, -1 + (k ? 0 : -1), 1, Dk(SEA));
        }
      });
      // càng nhỏ phía sau, càng to phía trước
      S.part((s) => {
        s.l(-5, -5 + by, -7, -8 + by - up * 0.6, 1, Md(ICE)); s.e(-7.5, -9 + by - up * 0.6, 1.6, 1.6, ICE);
        s.l(5, -5 + by, 8 + snap, -7 + by - up, 2, Md(ICE));
        s.e(9 + snap, -9 + by - up, 3, 2.6, ICE);
        s.p(11 + snap, -9 + by - up, 0); s.p(12 + snap, -9 + by - up, 0); if (P.an || P.sk === 2) s.p(10 + snap, -9 + by - up, 0);
      });
      // mai
      S.part((s) => {
        s.e(0, -5 + by, 5.6, 3.6, SEA);
        s.in(() => { s.r(-3, -3 + by, 7, 1, Md(FOAM)); s.p(-2, -8 + by, Lt(SEA)); s.p(2, -7 + by, Dk(SEA)); s.p(-3, -6 + by, Dk(SEA)); });
      });
      // mắt trên cuống
      S.part((s) => { s.r(-3, -11 + by, 2, 4, Md(SEA)); s.r(2, -11 + by, 2, 4, Md(SEA)); });
      S.flat((s) => {
        bead(s, -3, -12 + by, beadOf(P, { white: 1 })); bead(s, 2, -12 + by, beadOf(P, { white: 1 }));
        if (P.sk || P.an) s.r(-1, -4 + by, 3, 1, INK); else s.p(0, -4 + by, INK);
        s.p(-4, -4 + by, PINK[2]); s.p(4, -4 + by, PINK[2]);
      });
    },
  });

  // ----- Ốc Mượn Hồn (khiên): rụt vào vỏ rồi thò càng ra đấm -----
  defMon(1, 'shield', {
    name: 'Ốc Mượn Hồn', top: 21, sh: 10,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w];
      const hide = P.an ? P.an : 0, punch = P.sk === 1 ? 6 : P.sk === 2 ? 3 : 0;
      const hx = 7 - hide * 1.4 + (punch ? 1 : 0), hy = -6 + by + (hide ? 1 : 0);
      // chân nhỏ
      S.part((s) => { s.l(4 + fo, -3, 6 + fo, 0, 1, Dk(TEAL)); s.l(8 - fo, -3, 10 - fo, 0, 1, Dk(TEAL)); s.l(1 - fo, -3, 1 - fo, 0, 1, Dk(TEAL)); });
      // đầu cua thò ra
      S.part((s) => { s.e(hx, hy, 4, 3.4, TEAL); s.in(() => { s.r(hx - 2, hy + 2, 5, 1, Md(FOAM)); }); });
      // cuống mắt
      if (hide < 3) S.part((s) => { s.r(hx - 2, hy - 8 + hide, 2, 6 - hide, Md(TEAL)); s.r(hx + 3, hy - 8 + hide, 2, 6 - hide, Md(TEAL)); });
      // vỏ ốc xoắn, đỉnh mọc tinh thể băng
      S.part((s) => { s.g([[-9, -19 + by], [-7, -24 + by], [-5, -18 + by]], ICE); s.g([[-5, -19 + by], [-2, -22 + by], [-2, -17 + by]], ICE); });
      S.part((s) => {
        s.g([[-10, -11 + by], [-8, -19 + by], [-3, -19 + by], [3, -13 + by]], SHELL);
        s.e(-2, -9 + by, 8.4, 7.6, SHELL);
        s.in(() => {
          s.cv([[-9, -15 + by], [-4, -14 + by], [1, -16 + by]], 1, 1, Dk(SHELL));
          s.cv([[-10, -10 + by], [-3, -9 + by], [5, -12 + by]], 1, 1, Dk(SHELL));
          s.cv([[-8, -4 + by], [-2, -4 + by], [5, -6 + by]], 1, 1, Dk(SHELL));
          s.e(4, -7 + by, 2.6, 3.4, Md(DEEP)); // miệng vỏ
          s.p(-5, -17 + by, Lt(SHELL)); s.p(-4, -12 + by, Lt(SHELL)); s.p(-6, -7 + by, Lt(SHELL));
          s.p(-9, -7 + by, Md(SEA)); s.p(-7, -3 + by, Md(SEA)); s.p(0, -15 + by, Md(SEA));
        });
      });
      // càng đấm
      S.part((s) => {
        const ax = hx + 3 + punch, ay = hy + 3 - (hide ? 1 : 0);
        s.l(hx, hy + 2, ax, ay, 2, Md(TEAL));
        s.e(ax + 2, ay - 1, 3.2, 2.8, ICE);
        s.p(ax + 5, ay - 1, 0); if (!punch) s.p(ax + 4, ay - 1, 0);
      });
      S.flat((s) => {
        if (hide < 3) { bead(s, hx - 2, hy - 10 + hide, beadOf(P, { white: 1, h: 3 })); bead(s, hx + 3, hy - 10 + hide, beadOf(P, { white: 1, h: 3 })); }
        else { s.r(hx - 2, hy - 3, 2, 1, '#ffffff'); s.r(hx + 2, hy - 3, 2, 1, '#ffffff'); s.p(hx - 1, hy - 3, INK); s.p(hx + 3, hy - 3, INK); }
        if (P.sk === 1) s.r(hx - 1, hy, 3, 2, MOUTH);
      });
    },
  });

  // ----- Hải Quỳ Bắn (xạ thủ): phồng má rồi nhổ ngọc băng -----
  defMon(1, 'archer', {
    name: 'Hải Quỳ Bắn', top: 25, sh: 7,
    draw(S, P) {
      const by = P.br ? -1 : 0, fo = P.w < 0 ? 0 : WX[P.w] >> 1;
      const lean = P.an ? -P.an : P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0;
      const sq = P.an ? P.an : 0; // lùn xuống khi lấy hơi
      const topY = -14 + sq + by, tx = lean;
      // chùm xúc tu trên đầu
      S.part((s) => {
        for (let i = 0; i < 7; i++) {
          const a = (P.an ? -126 + i * 12 : -150 + i * 20) * D2R, sway = P.an ? -P.an * 0.6 : Math.sin((P.tl + i) * 1.57) * 1.2 + (P.sk === 1 ? 5 : P.sk === 2 ? 2 : 0);
          const L = 9 - sq * 1.6 + (P.sk === 1 ? 2 : 0) + (i % 2);
          const bx = tx + (i - 3) * 1.5, ex = bx + Math.cos(a) * L + sway, ey = topY + Math.sin(a) * L;
          s.cv([[bx, topY + 1], [bx + Math.cos(a) * L * 0.5 - sway * 0.2, topY + Math.sin(a) * L * 0.55], [ex, ey]], 2, 1, i % 2 ? ICE : Md(ICE));
          s.p(ex, ey, Lt(FOAM)); s.p(ex, ey - 1, Md(PINK));
        }
      });
      // đế bám
      S.part((s) => { s.e(fo, -2, 7, 2.4, Dk(TEAL)); s.p(-6 + fo, -1, Md(TEAL)); s.p(5 + fo, -1, Md(TEAL)); });
      // thân trụ
      S.part((s) => {
        s.g([[-5 + fo, -2], [-4 + tx, topY], [4 + tx, topY], [5 + fo, -2]], TEAL);
        s.e(tx, topY + 1, 5, 2.4, TEAL);
        if (P.an >= 2) s.e(tx + 4, topY + 6, 3, 3, TEAL); // má phồng
        s.in(() => { s.l(-3 + fo, -3, -3 + tx, topY + 2, 1, Dk(TEAL)); s.p(-1 + tx, topY + 9, Lt(TEAL)); s.p(tx, -4, Dk(TEAL)); s.r(-4 + fo, -3, 9, 1, Dk(TEAL)); });
      });
      S.flat((s) => {
        const ey = topY + 5;
        eye(s, tx - 1, ey, eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: TEAL[0] }));
        eye(s, tx + 4, ey, eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: TEAL[0], side: -1 }));
        if (P.sk === 1) stamp(s, ['KKKK', 'KDDK', 'KDDK', 'KKKK'], tx + 3, ey + 4);
        else if (P.an) s.r(tx + 5, ey + 5, 2, 2, PINK[1]);
        else if (P.dead) mouth(s, 'wavy', tx + 2, ey + 5);
        else s.r(tx + 2, ey + 5, 2, 2, INK);
      });
    },
  });

  // ----- Rắn Biển (nhanh nhẹn): cuộn mình rồi phóng thẳng như mũi tên -----
  defMon(1, 'nimble', {
    name: 'Rắn Biển', top: 17, sh: 9,
    draw(S, P) {
      let pts, hx, hy;
      const ph = (P.w < 0 ? P.tl : P.w) * 1.57;
      if (P.lg) { pts = [[-16, -5], [-9, -6], [-2, -5], [5, -6]]; hx = 10; hy = -6; }
      else if (P.an) { const k = P.an; pts = [[-9 + k, -2], [-3, -3], [2 - k, -5], [-4 + k * 0.5, -9], [1 - k, -13 - k]]; hx = 4 - k; hy = -14 - k; }
      else {
        const wv = (i) => Math.sin(ph + i * 1.6) * (P.w < 0 ? 1 : 2);
        pts = [[-13, -3 + wv(0) * 0.5], [-8, -3 + wv(1)], [-3, -4 + wv(2)], [2, -5 + wv(3) * 0.6], [5, -9 + (P.br ? -1 : 0)]]; hx = 8; hy = -12 + (P.br ? -1 : 0);
      }
      const tail = pts[0];
      // vây đuôi
      S.part((s) => { s.g([[tail[0] + 1, tail[1] - 1], [tail[0] - 4, tail[1] - 4], [tail[0] - 3, tail[1] + 2]], ICE); });
      // thân có khoang trắng
      S.part((s) => {
        s.cv(pts.concat([[hx - 2, hy + 1]]), 3, 4, DEEP);
        s.in(() => {
          const all = pts.concat([[hx - 2, hy + 1]]);
          for (let i = 0; i < all.length - 1; i++) {
            const a = all[i], b = all[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            s.l(mx, my - 2, mx, my + 2, 2, Md(FOAM));
          }
        });
      });
      // vây lưng
      if (!P.lg) S.part((s) => { const m = pts[2]; s.g([[m[0] - 2, m[1] - 2], [m[0], m[1] - 5], [m[0] + 3, m[1] - 2]], ICE); });
      // đầu
      S.part((s) => {
        s.e(hx, hy, 4.2, 3.3, DEEP);
        if (P.lg || P.an === 3) s.g([[hx + 1, hy], [hx + 7, hy - 3], [hx + 7, hy + 4], [hx + 1, hy + 3]], DEEP);
        s.in(() => { s.r(hx - 2, hy + 2, 6, 1, Md(FOAM)); s.p(hx - 1, hy - 3, Lt(DEEP)); });
      });
      S.flat((s) => {
        eye(s, hx + 1, hy - 1, eyeOf(P, { w: 3, h: 3, look: [1, 0], rim: DEEP[0], col: '#fff6a0' }));
        if (P.lg || P.an === 3) { s.r(hx + 3, hy + 1, 4, 2, MOUTH); s.p(hx + 6, hy, '#ffffff'); s.p(hx + 4, hy + 3, '#ffffff'); s.p(hx + 6, hy + 3, '#ffffff'); }
        else if (!P.dead && (P.tl & 1)) { s.r(hx + 5, hy + 1, 2, 1, TONGUE); s.p(hx + 7, hy, TONGUE); s.p(hx + 7, hy + 2, TONGUE); }
      });
    },
  });

  // ----- Sứa Chúa (tinh anh): sứa lớn đội vương miện tinh thể, quật hai xúc tu to xuống đất -----
  defMon(1, 'elite', {
    name: 'Sứa Chúa', size: [88, 80], org: [44, 70], top: 40, sh: 12,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.ice, CR = E.B;
      const bob = (P.br ? -1 : 0) + (P.w === 1 || P.w === 3 ? -1 : 0);
      const sq = P.an ? P.an : P.sk === 1 ? -2 : 0; // co chuông khi lấy đà, giãn khi quật
      const cy = -27 + bob - (P.an ? P.an : 0) + (P.sk === 1 ? 3 : 0), rx = 13 + sq * 0.7, ry = 10 - sq * 0.8;
      const rim = cy + 4;
      const sw = (i) => Math.sin((P.tl + i) * 1.57 + i) * 1.5;
      // xúc tu mảnh
      S.part((s) => {
        for (let i = 0; i < 5; i++) {
          const bx = -9 + i * 4.5, L = 17 + (i % 2) * 3 - (P.dead ? 6 : 0);
          s.cv([[bx, rim], [bx - sw(i), rim + L * 0.35], [bx + sw(i + 1) - 2, rim + L * 0.7], [bx - 1 + sw(i) * 0.5, rim + L]], 2, 1, i % 2 ? Md(ICE) : Md(SEA));
        }
      });
      // hai xúc tu to để đánh
      S.part((s) => {
        const arm = (side) => {
          const bx = side * 8;
          let p1, p2, p3;
          if (P.an) { const k = P.an / 3; p1 = [bx + side * (6 + 3 * k), rim - 2 - 6 * k]; p2 = [bx + side * (9 + 2 * k), rim - 12 - 12 * k]; p3 = [bx + side * (5 - 2 * k), rim - 20 - 14 * k]; }
          else if (P.sk === 1 || P.sk === 2) { p1 = [bx + 6 + side * 2, rim + 5]; p2 = [bx + 13 + side * 2, rim + 12]; p3 = [bx + 17 + side * 3, -3]; }
          else { p1 = [bx + side * 5 + sw(side), rim + 7]; p2 = [bx + side * 6 - sw(side), rim + 14]; p3 = [bx + side * 9 + sw(side + 2), rim + 20]; }
          s.cv([[bx, rim], p1, p2, p3], 3, 2, CR);
          s.e(p3[0], p3[1], 2.2, 2.2, Lt(CR));
        };
        arm(-1); arm(1);
      });
      // vương miện tinh thể theo màu hệ
      S.part((s) => {
        const ty = cy - ry + 1;
        s.g([[-7, ty + 2], [-8, ty - 5], [-3, ty]], CR); s.g([[-3, ty], [0, ty - 9], [3, ty]], CR); s.g([[3, ty], [8, ty - 5], [7, ty + 2]], CR);
        s.in(() => { s.l(0, ty - 7, 0, ty - 1, 1, Lt(CR)); s.p(-7, ty - 3, Lt(CR)); s.p(7, ty - 3, Lt(CR)); });
      });
      // chuông
      S.part((s) => {
        s.e(0, cy, rx, ry, ICE);
        s.r(-rx - 2, cy + 1, rx * 2 + 5, ry + 3, 0);
        s.r(-rx - 1, cy, rx * 2 + 3, 3, ICE);
        for (let i = 0; i < 7; i++) s.e(-rx + i * ((rx * 2) / 6), cy + 3, 2.3, 2, i % 2 ? Md(SEA) : ICE);
        s.in(() => {
          s.e(-4, cy - ry * 0.45, rx * 0.5, ry * 0.3, Lt(ICE));
          s.r(-rx, cy + 1, rx * 2 + 1, 1, Md(SEA));
          s.p(-rx + 3, cy - 2, Dk(ICE)); s.p(-rx + 4, cy - 4, Dk(ICE)); s.p(rx - 3, cy - 5, Lt(FOAM));
          s.p(-2, cy - ry + 3, Md(CR)); s.p(5, cy - ry + 3, Md(CR));
        });
      });
      S.flat((s) => {
        const ey = cy - 2;
        const an = P.an || P.sk || P.lg;
        eye(s, 2, ey, P.dead ? { x: 1 } : { look: [1, 0], rim: DEEP[0], lid: P.bl ? 5 : 1, brow: 'angry', glow: an ? E.glow : null });
        eye(s, 9, ey, P.dead ? { x: 1, w: 3 } : { w: 3, look: [1, 0], rim: DEEP[0], lid: P.bl ? 5 : 1, brow: 'angry', side: -1, glow: an ? E.glow : null });
        if (P.sk === 1) mouth(s, 'fang', 6, ey + 4); else mouth(s, 'frown', 6, ey + 5);
      });
    },
  });

  // ----- Cua Đá (trùm nhỏ): mai là một tảng đá mọc tinh thể băng, một càng khổng lồ. Vẽ nhìn từ phía trước, càng to ở bên phải. -----
  // Cái càng: vai (sx, sy), góc bắp a1, góc cẳng a2 (độ; 0 là chĩa sang phải, âm là chĩa lên), size là cỡ càng, open là độ há 0..1,
  // fv = -1 thì lật càng (dùng cho càng bên trái).
  function bnClaw(S, sx, sy, a1, L1, a2, L2, size, open, tipC, fv) {
    fv = fv || 1;
    const r1 = a1 * D2R, r2 = a2 * D2R, z = size;
    const ex = sx + Math.cos(r1) * L1, ey = sy + Math.sin(r1) * L1, wx = ex + Math.cos(r2) * L2, wy = ey + Math.sin(r2) * L2;
    const aw = z > 14 ? 7 : 5;
    S.part((s) => { s.l(sx, sy, ex, ey, aw, ROCK); s.l(ex, ey, wx, wy, aw - 1, ROCK); s.e(ex, ey, aw * 0.6, aw * 0.6, ROCK); });
    const F = S.fr(wx, wy, a2), V = (q) => q.map((p) => [p[0], p[1] * fv]);
    // ngón dưới (ngón động)
    const Fl = F.sub(z * 0.35, z * 0.22 * fv, open * 36 * fv);
    S.part((s) => {
      Fl.g(V([[-2, -2], [z * 0.8, -1], [z * 1.2, -z * 0.14], [z * 0.85, z * 0.34], [0, z * 0.36]]), ROCK);
      s.in(() => { Fl.l(z * 0.9, -1 * fv, z * 1.15, -z * 0.12 * fv, 2, Lt(tipC)); for (let i = 0; i < 3; i++) Fl.p(z * (0.3 + i * 0.2), -2 * fv, '#ffffff'); });
    });
    // bàn càng và ngón trên
    S.part((s) => {
      F.e(z * 0.42, -z * 0.06 * fv, z * 0.6, z * 0.5, ROCK);
      F.g(V([[z * 0.4, -z * 0.56], [z * 1.15, -z * 0.56], [z * 1.6, -z * 0.14], [z * 1.15, -z * 0.02], [z * 0.6, z * 0.12]]), ROCK);
      s.in(() => {
        F.l(z * 1.2, -z * 0.36 * fv, z * 1.52, -z * 0.14 * fv, 2, Lt(tipC));
        F.e(z * 0.3, -z * 0.26 * fv, z * 0.3, z * 0.14, Lt(ROCK));
        F.e(z * 0.5, z * 0.1 * fv, z * 0.4, z * 0.2, Dk(ROCK));
        F.p(z * 0.2, z * 0.02 * fv, Md(FOAM)); F.p(z * 0.75, -z * 0.3 * fv, Md(FOAM)); F.p(z * 0.55, -z * 0.12 * fv, Md(TEAL));
        for (let i = 0; i < 3; i++) F.r(z * (0.72 + i * 0.18), (fv > 0 ? -1 : 0), 1, 2, '#ffffff'); // răng càng
      });
    });
    return { ex, ey, wx, wy, tx: wx + Math.cos(r2) * z * 1.4, ty: wy + Math.sin(r2) * z * 1.4 };
  }
  MINI[1] = {
    name: 'Cua Đá', size: [200, 140], org: [92, 116], top: 56, sh: 30,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.ice, CR = E.B;
      const kd = P.kd || (P.an || P.sk ? 'swipe' : ''), an = P.an | 0, sk = P.sk | 0, roar = P.roar || (kd === 'summon' && (an === 3 || sk));
      const jit = (P.f3 | 0) - 1;
      let by = (P.br ? -1 : 0) + (P.w === 1 || P.w === 3 ? -1 : 0), bx = 0, squash = 0;
      // càng to: [a1, a2, độ há]; càng nhỏ: [a1, a2, độ há]
      let big = [-38, -74, 0.25 + (P.br ? 0.2 : 0)], small = [-140, -104, 0.2], grow = 0, mouthK = 0, eyeM = P.dead ? 'dead' : 'normal';
      if (kd === 'slam') {
        if (an) { big = [-60 - an * 8, -84 - an * 8, 1]; by -= an; bx = -an; eyeM = 'angry'; mouthK = an === 3 ? 0.6 : 0; }
        else if (sk === 1) { big = [14, 52, 0.1]; by += 4; bx = 3; squash = 3; eyeM = 'angry'; mouthK = 1; }
        else if (sk === 2) { big = [4, 34, 0.2]; by += 2; squash = 1; eyeM = 'angry'; }
      } else if (kd === 'charge') {
        if (an) { big = [30 - an * 4, -150 - an * 8, 0]; small = [150 + an * 4, -30 + an * 8, 0]; by += 1 + an; bx = -an * 2 + (an === 3 ? jit : 0); squash = an; eyeM = 'angry'; }
        else if (sk) { big = [-8, -4, 0.7]; small = [-176, -20, 0.6]; by += 3; bx = 6; squash = 3; eyeM = 'angry'; mouthK = 0.6; }
      } else if (kd === 'burst') {
        if (an) { grow = an + (an === 3 && P.f3 === 1 ? 1 : 0); by += an; squash = an; eyeM = 'angry'; big = [-20, -50, 0.1]; small = [-160, -130, 0.1]; }
        else if (sk === 1) { grow = 6; by -= 3; squash = -2; mouthK = 0.6; eyeM = 'angry'; }
        else if (sk === 2) { grow = 1; }
      } else if (kd === 'swipe') {
        if (an) { big = [-24 - an * 4, -40 - an * 14, 1]; bx = -an * 2; eyeM = 'angry'; }
        else if (sk === 1) { big = [8, 16, 1]; bx = 5; eyeM = 'angry'; mouthK = 0.6; }
        else if (sk === 2) { big = [22, 50, 0.4]; bx = 2; eyeM = 'angry'; }
      }
      if (roar) { big = [-58 + jit * 3, -98, 1]; small = [-122 - jit * 3, -82, 1]; mouthK = 1; eyeM = 'angry'; by -= 2; squash = -1; }
      if (P.tired) { big = [34, 72, 0.3]; small = [146, 108, 0.3]; by += 4; squash = 2; mouthK = 0.5; eyeM = 'tired'; }
      if (P.dead) { big = [40, 80, 0.6]; small = [140, 100, 0.6]; by += 6; squash = 3; mouthK = 0.4; }
      const cx = bx, cy = -27 + by, rx = 30 + squash, ry = 19 - squash;
      const fo = P.w < 0 ? 0 : WX[P.w];
      // sáu chân xoè hai bên
      S.part((s) => {
        for (let i = 0; i < 3; i++) for (const d of [-1, 1]) {
          const k = ((i & 1) ^ (d > 0 ? 1 : 0) ? fo : -fo) * 0.8, lift = P.w >= 0 && ((P.w + i + (d > 0 ? 1 : 0)) & 1) ? -2 : 0;
          const sx = cx + d * (16 + i * 5), kx = cx + d * (29 + i * 6) + k * 0.5, fx = d * (27 + i * 8) + bx * 0.3 + k;
          s.pl([[sx, cy + 9], [kx, cy + 1 - i * 3], [fx, lift]], [6, 4], i === 1 ? ROCK : Md(ROCK));
          s.p(fx, lift, Lt(CR));
        }
      });
      // càng nhỏ bên trái
      bnClaw(S, cx - 24, cy + 2, small[0], 9, small[1], 8, 10, small[2], CR, -1);
      // tinh thể băng mọc trên mai (theo màu hệ); lúc bắn thì dài ra
      S.part((s) => {
        const ty = cy - ry + 4, g = grow * 2.2;
        const sp = (x, h, w, lean) => s.g([[cx + x - w, ty + 4], [cx + x + lean, ty - h - g], [cx + x + w, ty + 4]], CR);
        sp(-20, 9, 4, -4); sp(-10, 17, 5, -2); sp(1, 22, 6, 0); sp(12, 15, 5, 3); sp(21, 8, 4, 5);
        s.in(() => { s.l(cx + 1, ty - 19 - g, cx + 1, ty, 2, Lt(CR)); s.l(cx - 11, ty - 13 - g, cx - 10, ty, 1, Lt(CR)); s.l(cx + 14, ty - 11 - g, cx + 12, ty, 1, Lt(CR)); s.p(cx - 22, ty - 4, Lt(CR)); s.p(cx + 24, ty - 3, Lt(CR)); });
      });
      // mai đá
      S.part((s) => {
        s.e(cx, cy, rx, ry, ROCK);
        s.g([[cx - rx + 3, cy + 2], [cx - rx + 10, cy + ry + 1], [cx + rx - 10, cy + ry + 1], [cx + rx - 3, cy + 2]], ROCK);
        s.in(() => {
          s.e(cx - 6, cy - ry * 0.62, rx * 0.62, ry * 0.2, Lt(ROCK));
          s.pl([[cx - 24, cy - 8], [cx - 19, cy - 2], [cx - 23, cy + 5]], 1, Dk(ROCK));
          s.pl([[cx + 20, cy - 12], [cx + 25, cy - 5], [cx + 22, cy]], 1, Dk(ROCK));
          s.pl([[cx - 4, cy - 17], [cx, cy - 13]], 1, Dk(ROCK));
          s.e(cx - 20, cy - 12, 4, 2, Md(TEAL)); s.e(cx + 16, cy - 15, 3, 1.6, Md(TEAL)); s.p(cx - 21, cy - 13, Lt(TEAL));
          s.p(cx - 27, cy + 1, Md(FOAM)); s.p(cx + 27, cy - 1, Md(FOAM)); s.p(cx + 10, cy - 17, Md(FOAM));
          // hốc mặt tối
          s.e(cx + 1, cy + 5, 21, 11, Md(DEEP));
          s.e(cx + 1, cy + 9, 19, 8, Dk(DEEP));
        });
      });
      // mặt: hai mắt to dưới gờ đá, miệng răng lởm chởm
      const fxx = cx + 1, fyy = cy + 3;
      S.flat((s) => {
        const eo = eyeM === 'dead' ? { x: 1 } : eyeM === 'tired' ? { lid: 4, look: [0, 1] } : eyeM === 'angry' ? { lid: 1, glow: an === 3 ? E.glow : null } : P.bl ? { shut: 1 } : { lid: 2 };
        eye(s, fxx - 9, fyy, Object.assign({ w: 9, h: 9, rim: DEEP[0], col: '#fff6c8', look: [1, 0] }, eo));
        eye(s, fxx + 9, fyy, Object.assign({ w: 9, h: 9, rim: DEEP[0], col: '#fff6c8', look: [1, 0] }, eo));
        const my = fyy + 7;
        if (mouthK >= 0.9) stamp(s, ['KKKKKKKKKKKKK', 'KWKWKDDDKWKWK', 'KDDDDDDDDDDDK', 'KDDDRRRRRDDDK', 'KWDRRRRRRRDWK', '.KKKKKKKKKKK.'], fxx, my - 1);
        else if (mouthK > 0) stamp(s, ['KKKKKKKKKKK', 'KWDWDWDWDWK', 'KDDRRRRRDDK', '.KKKKKKKKK.'], fxx, my);
        else stamp(s, ['K.........K', 'KWKWKWKWKWK', '.KKKKKKKKK.'], fxx, my + 1);
        if (P.tired) { s.r(fxx + 20, fyy - 10, 2, 3, '#9fdcff'); s.r(fxx - 22, fyy - 6, 2, 3, '#9fdcff'); }
      });
      // gờ đá trên mắt: cụp xuống giữa khi giận
      S.part((s) => {
        const d = eyeM === 'angry' ? 3 : eyeM === 'tired' || P.dead ? -2 : 1;
        s.g([[fxx - 17, fyy - 7 - d], [fxx - 2, fyy - 6 + d], [fxx - 2, fyy - 3 + d], [fxx - 17, fyy - 4 - d]], ROCK);
        s.g([[fxx + 17, fyy - 7 - d], [fxx + 2, fyy - 6 + d], [fxx + 2, fyy - 3 + d], [fxx + 17, fyy - 4 - d]], ROCK);
      });
      // càng to bên phải
      const c2 = bnClaw(S, cx + 25, cy + 2, big[0], 13, big[1], 11, 19, big[2], CR, 1);
      // hiệu ứng nướng sẵn: vệt quét, tia băng lúc bắn
      if (kd === 'swipe' && sk === 1) S.part({ fx: 1 }, (s) => { s.cv([[c2.tx - 10, c2.ty - 26], [c2.tx + 6, c2.ty - 10], [c2.tx + 4, c2.ty + 8]], 3, 1, '#ffffff'); });
      if (kd === 'burst' && sk === 1) S.part({ fx: 1 }, (s) => { s.r(cx, cy - ry - 44, 2, 8, E.hot); s.p(cx - 5, cy - ry - 36, E.glow); s.p(cx + 6, cy - ry - 38, E.glow); });
    },
  };

  // ====================================================================
  // NGƯ TINH: thủy quái trong truyện Lạc Long Quân diệt Ngư Tinh. Cá khổng lồ đầu mọc gai, miệng rộng, râu dài.
  // Hình gốc quay mặt sang PHẢI, gốc (0,0) là mặt nước dưới giữa bụng (phần dưới y = 4 chìm trong nước).
  // Q (tư thế, số liên tục):
  //   jaw 0..1 độ há hàm; tail -1..1 đuôi quẫy (dương là vểnh lên); up 0..1 gai lưng và gai đầu dựng lên; red 0..1 gai đỏ rực;
  //   eye 'normal' | 'angry' | 'dazed' | 'dead'; blink 0..1; look -1..1 hướng nhìn; gill 0..2 mang sáng (2 là lộ mang, lúc đánh trả);
  //   pf 0..1 vây ngực quạt; wh -1..1 râu phất; puff 0..1 phồng má lấy nước; glow 0..1 miệng sáng lúc phun; pulse 0..1 nhịp điểm yếu; orb 0..1 góc xoay bong bóng.
  // X (dạng thích nghi): el hệ đang kháng, weak hệ khắc chế, aR chống đánh xa, aM chống áp sát, aD bắt bài lăn né, phase 0..2.
  // ====================================================================
  const NG_TOP = [[72, -34], [67, -50], [52, -64], [32, -70], [8, -68], [-14, -60], [-34, -48], [-52, -37], [-63, -31]];
  function ngTopAt(x) {
    for (let i = 0; i + 1 < NG_TOP.length; i++) { const a = NG_TOP[i], b = NG_TOP[i + 1]; if (x <= a[0] && x >= b[0]) return a[1] + ((b[1] - a[1]) * (a[0] - x)) / (a[0] - b[0]); }
    return x > 72 ? -34 : -31;
  }
  // Con mắt lớn của Ngư Tinh: tâm (x, y), lòng vàng, con ngươi khe dọc.
  function ngEye(s, x, y, o) {
    rd(s, x - 8, y - 8, 17, 17, o.glow || DEEP[0]);
    rd(s, x - 7, y - 7, 15, 15, DEEP[0]);
    if (o.dead) { rd(s, x - 6, y - 6, 13, 13, '#c8c8b8'); for (let i = -3; i <= 3; i++) { s.r(x + i, y + i, 2, 1, INK); s.r(x + i, y - i, 2, 1, INK); } return; }
    if (o.shut) { rd(s, x - 6, y - 6, 13, 13, DEEP[1]); s.r(x - 6, y + 1, 13, 2, DEEP[0]); return; }
    rd(s, x - 6, y - 6, 13, 13, o.col);
    rd(s, x - 4 + o.look, y - 5, 9, 11, o.iris);
    s.r(x - 1 + o.look * 2, y - 5, 3, 11, '#2a0808'); s.r(x - 2 + o.look * 2, y - 2, 5, 5, '#2a0808');
    s.r(x + 1 + o.look * 2, y - 5, 3, 3, '#ffffff'); s.p(x - 3 + o.look * 2, y + 3, '#ffffff');
    for (let j = 0; j < (o.lid | 0); j++) s.r(x - 6 + (j === 0 ? 1 : 0), y - 6 + j, 13 - (j === 0 ? 2 : 0), 1, DEEP[0]);
    if (o.dazed) { s.r(x - 6, y - 6, 13, 6, DEEP[1]); s.r(x - 6, y, 13, 1, DEEP[0]); }
  }
  BOSS.ngu = {
    name: 'Ngư Tinh', size: [260, 196], org: [126, 148], top: 70, sh: 62,
    pose() { return { jaw: 0.15, tail: 0, up: 0, red: 0, eye: 'normal', blink: 0, look: 1, gill: 0, pf: 0, wh: 0, puff: 0, glow: 0, pulse: 0, orb: 0 }; },
    // Các điểm mốc (tính từ gốc) để game đặt hiệu ứng: miệng, ngọc điểm yếu, mắt thứ ba, chóp đuôi, đỉnh đầu, mang.
    anchor(Q) {
      Q = Object.assign(this.pose(), Q || {});
      const j = Q.jaw * 32 * D2R;
      return { mouth: [70, -24 + Q.jaw * 8], gem: [-10, -30], eye3: [74, -98], tail: [-94, -34 - Q.tail * 18], top: [32, -74 - Q.up * 12], gill: [2, -34], jawTip: [24 + Math.cos(j) * 52, -16 + Math.sin(j) * 52] };
    },
    draw(S, Q, X) {
      Q = Object.assign(this.pose(), Q || {}); X = X || {};
      const ph = X.phase | 0, E = X.el ? (X.E || ELP[X.el]) : null, W = X.weak ? (X.W || ELP[X.weak]) : null;
      const up = Math.max(Q.up, ph === 2 ? 0.3 : 0), hot = Q.red > 0.5, tipC = hot ? RED : ph >= 1 ? PINK : FOAM;
      const FIN = ICE, wh = Q.wh, dead = Q.eye === 'dead', lk = Q.look >= 0 ? 1 : -1;
      // --- râu xa (vẽ trước, nằm sau thân) ---
      S.part((s) => { s.cv([[62, -36], [78, -46], [84, -62 + wh * 4], [74, -76 + wh * 6], [58, -84 + wh * 8]], 2, 1, Md(ICE)); });
      // --- đuôi chẻ đôi ---
      const T = S.fr(-62, -26, -Q.tail * 24);
      S.part((s) => {
        T.g([[5, -7], [-8, -11], [-22, -27], [-37, -43], [-28, -17], [-19, -1]], FIN);
        T.g([[5, 7], [-8, 10], [-22, 23], [-34, 36], [-26, 13], [-19, -1]], FIN);
        s.in(() => {
          T.l(-2, -6, -31, -36, 1, Dk(FIN)); T.l(-4, -3, -25, -17, 1, Dk(FIN)); T.l(-10, -8, -27, -26, 1, Md(SEA));
          T.l(-2, 6, -29, 30, 1, Dk(FIN)); T.l(-4, 3, -23, 14, 1, Dk(FIN)); T.l(-10, 8, -25, 22, 1, Md(SEA));
          T.l(-25, -30, -36, -42, 2, Lt(FOAM)); T.l(-24, 25, -33, 35, 2, Lt(FOAM));
        });
      });
      // --- vây lưng như cánh buồm có gai ---
      S.part((s) => {
        const xs = [14, 1, -12, -25, -37, -48], pts = [[22, ngTopAt(22) + 2]];
        xs.forEach((x, i) => {
          const h = 15 + (i % 2) * 3 - i * 1.4 + up * 13;
          pts.push([x - 6 - up * 2, ngTopAt(x) - h]);
          pts.push([x - 8, ngTopAt(x - 8) - h * 0.42]);
        });
        pts.push([-57, ngTopAt(-57) + 2]);
        s.g(pts, FIN);
        s.in(() => { xs.forEach((x, i) => { const h = 15 + (i % 2) * 3 - i * 1.4 + up * 13; s.l(x, ngTopAt(x), x - 6 - up * 2, ngTopAt(x) - h, 1, Dk(FIN)); s.l(x - 6 - up * 2, ngTopAt(x) - h, x - 5 - up * 2, ngTopAt(x) - h + 4, 2, Lt(tipC)); }); });
      });
      // --- gai trên đầu: gai trước là cái sừng to ---
      S.part((s) => {
        const H = [[61, 20, 9, 6], [49, 15, 1, 5], [38, 13, -4, 4], [27, 10, -6, 4]];
        H.forEach((q) => {
          const x = q[0], y = ngTopAt(x) + 3, h = q[1] + up * 10, tx = x + q[2] - up * 2;
          s.g([[x - q[3], y], [tx, y - h], [x + q[3], y + 1]], hot ? RED : DEEP);
          s.in(() => { s.l(tx, y - h, x + q[2] * 0.4, y - h * 0.45, 2, Lt(tipC)); });
        });
      });
      // --- thân ---
      const body = NG_TOP.concat([[-63, -21], [-46, -10], [-26, -2], [-4, 4], [20, 6], [34, 3], [30, -8], [26, -24], [50, -29], [72, -30]]);
      S.part((s) => {
        s.g(body, SEA);
        if (Q.puff > 0) s.e(24, -12, 9 + Q.puff * 6, 9 + Q.puff * 5, SEA);
        s.in(() => {
          // lưng sẫm
          s.g(NG_TOP.concat(NG_TOP.slice().reverse().map((q) => [q[0] - 3, q[1] + 12])), Md(DEEP));
          s.cv(NG_TOP.map((q) => [q[0] - 1, q[1] + 2]), 1, 1, Lt(DEEP));
          // bụng trắng băng
          s.g([[34, -10], [12, -6], [-14, -8], [-40, -16], [-66, -25], [-66, 12], [36, 12]], Md(FOAM));
          s.g([[30, -2], [6, 1], [-20, -3], [-44, -12], [-44, 12], [30, 12]], Lt(FOAM));
          for (let x = -42; x <= 26; x += 9) s.l(x, -8 + Math.abs(x + 6) * 0.1, x - 2, 5, 1, Dk(FOAM));
          // vảy
          for (let r = 0; r < 4; r++) for (let x = -54 + (r & 1) * 5; x <= -2; x += 10) {
            const y = -50 + r * 9 + Math.max(0, (-x - 14) * 0.42);
            if (y < ngTopAt(x) + 13 || y > -16 - Math.max(0, (-x - 20) * 0.2)) continue;
            s.p(x, y, Lt(SEA)); s.p(x + 1, y + 1, Lt(SEA)); s.p(x + 2, y + 1, Lt(SEA)); s.p(x + 3, y, Lt(SEA)); s.p(x + 1, y + 2, Dk(SEA)); s.p(x + 2, y + 2, Dk(SEA));
          }
          // nắp mang
          s.cv([[18, -64], [9, -44], [12, -24], [22, -10]], 2, 1, Dk(SEA));
          s.cv([[22, -60], [14, -44], [17, -26]], 1, 1, Lt(SEA));
          // môi trên dày
          s.pl([[27, -25], [50, -30], [71, -31]], 3, Md(DEEP));
          s.pl([[30, -27], [50, -32], [70, -33]], 1, Lt(DEEP));
          // má sáng dưới mắt
          s.e(52, -37, 9, 3, Lt(SEA));
          if (Q.puff > 0) s.e(26, -13, 5 + Q.puff * 4, 5 + Q.puff * 3, Lt(SEA));
          // sẹo khi nổi giận, vết nứt đỏ khi hoá cuồng
          if (ph >= 1) { s.l(-22, -52, -12, -36, 1, Dk(DEEP)); s.l(-17, -54, -7, -38, 1, Dk(DEEP)); s.l(-40, -38, -34, -26, 1, Dk(DEEP)); s.l(30, -66, 36, -56, 1, Lt(SEA)); }
          if (ph >= 2) { s.pl([[-2, -58], [4, -46], [-1, -40], [5, -30]], 1, Md(RED)); s.pl([[-30, -46], [-25, -37], [-31, -30]], 1, Md(RED)); s.pl([[58, -56], [62, -48], [58, -44]], 1, Md(RED)); }
        });
      });
      // --- giáp vảy kháng hệ: lớp vảy to màu hệ phủ dọc lưng và mũ giáp trên trán ---
      if (E) {
        const EB = E.B, EH = [E.B[1], E.B[2], E.hot];
        S.part((s) => {
          for (let i = 0; i < 6; i++) { const x = 12 - i * 13; s.e(x, ngTopAt(x) + 11 + (i % 2), 8.5, 7.5, EB); }
          s.g([[30, -71], [52, -65], [67, -51], [70, -40], [58, -46], [40, -56], [26, -58]], EB);
          s.in(() => {
            for (let i = 0; i < 6; i++) { const x = 12 - i * 13, y = ngTopAt(x) + 11 + (i % 2); s.cv([[x - 7, y + 3], [x, y + 7], [x + 7, y + 3]], 1, 1, Dk(EB)); s.r(x - 3, y - 5, 4, 1, E.hot); }
            s.pl([[32, -67], [50, -61], [64, -49]], 1, E.hot); s.pl([[34, -61], [48, -56], [60, -46]], 1, Dk(EB));
          });
        });
        // món trang trí riêng của từng hệ: lửa bốc, tinh thể băng, bọng độc
        S.part((s) => {
          for (let i = 0; i < 5; i++) {
            const x = 6 - i * 13, y = ngTopAt(x) + 4;
            if (X.el === 'fire') s.g([[x - 4, y], [x - 2, y - 9 - (i % 2) * 4], [x, y - 4], [x + 3, y - 8], [x + 4, y]], EH);
            else if (X.el === 'ice') { s.g([[x - 4, y], [x - 2, y - 10 - (i % 2) * 4], [x + 2, y]], EH); s.g([[x + 1, y], [x + 5, y - 6], [x + 6, y]], EH); }
            else { s.e(x, y - 3, 3.6, 3.6, EB); s.e(x + 6, y - 1, 2, 2, EB); }
          }
        });
        S.flat((s) => {
          for (let i = 0; i < 5; i++) {
            const x = 6 - i * 13, y = ngTopAt(x) + 4;
            if (X.el === 'poison') { s.p(x - 1, y - 5, E.hot); s.p(x - 2, y - 4, E.hot); s.r(x + 9, y + 20 + (i % 2) * 4, 1, 3, EB[2]); s.p(x + 9, y + 24 + (i % 2) * 4, EB[1]); }
            if (X.el === 'fire') { s.p(x + 4, y + 9, E.hot); s.p(x + 5, y + 10, EB[2]); s.p(x - 3, y + 12, EB[2]); s.p(x - 4, y + 11, E.hot); }
            if (X.el === 'ice') { s.p(x - 2, y - 6, '#ffffff'); s.p(x + 8, y + 14, '#ffffff'); }
          }
        });
      }
      // --- gai xương dọc sườn và quanh hàm: chống áp sát ---
      if (X.aM) S.part((s) => {
        for (let i = 0; i < 7; i++) { const x = 22 - i * 13, y = -13 - (i > 3 ? (i - 3) * 2.6 : 0); s.g([[x - 4, y - 2], [x - 10, y + 12 + (i % 2) * 3], [x + 4, y + 1]], BONE); }
        s.g([[64, -52], [80, -58], [69, -45]], BONE); s.g([[44, -68], [50, -82], [53, -64]], BONE);
      });
      // --- mang ---
      S.flat((s) => {
        const g = Q.gill, col = g >= 2 ? '#ffffff' : g >= 1 ? ICE[1] : SEA[0];
        for (let i = 0; i < 3; i++) {
          const gx = 4 - i * 7, pts = [[gx + 4, -52 + i * 3], [gx - 2, -36], [gx + 3, -20 - i * 2]];
          if (g >= 2) s.cv(pts, 4, 4, PINK[1]);
          s.cv(pts, g >= 1 ? 2 : 1, g >= 1 ? 2 : 1, col);
        }
      });
      // --- điểm yếu: viên ngọc lộ ra giữa sườn, sáng màu hệ khắc ---
      if (W) {
        const r = 6 + Q.pulse * 1.5, gx = -24, gy = -30;
        S.part({ ol: W.B[0] }, (s) => { s.e(gx, gy, r + 2.4, r + 2.4, Md(DEEP)); });
        S.part((s) => { s.e(gx, gy, r, r, W.B); s.in(() => { s.e(gx - 1, gy - 1, r * 0.55, r * 0.55, Lt(W.B)); s.r(gx - 3, gy - 4, 2, 2, '#ffffff'); s.p(gx + 2, gy + 3, W.hot); }); });
        S.part({ fx: 1 }, (s) => { const k = r + 5; s.r(gx, gy - k - 1, 1, 2, W.glow); s.r(gx, gy + k, 1, 2, W.glow); s.r(gx - k - 1, gy, 2, 1, W.glow); s.r(gx + k, gy, 2, 1, W.glow); s.p(gx - k + 2, gy - k + 2, W.glow); s.p(gx + k - 2, gy - k + 2, W.glow); s.p(gx - k + 2, gy + k - 2, W.glow); s.p(gx + k - 2, gy + k - 2, W.glow); });
      }
      // --- vây ngực xoè như quạt ---
      const PF = S.fr(10, -8, 8 + Q.pf * 38);
      S.part((s) => {
        PF.g([[3, -4], [-10, -9], [-22, -8], [-29, 0], [-27, 9], [-17, 13], [-3, 7]], FIN);
        s.in(() => { PF.l(0, -1, -24, -5, 1, Dk(FIN)); PF.l(0, 1, -26, 3, 1, Dk(FIN)); PF.l(0, 3, -20, 10, 1, Dk(FIN)); PF.pl([[-22, -8], [-29, 0], [-27, 9], [-17, 13]], 1, Lt(FOAM)); });
      });
      // --- miệng rộng: lòng miệng, răng trên, hàm dưới trề ---
      const JA = Q.jaw * 32, J = S.fr(24, -16, JA);
      S.part({ ol: false, bevel: false }, (s) => {
        const a = J.pt(50, -8), b = J.pt(2, -3);
        s.g([[27, -24], [50, -29], [71, -29], a, b], MOUTH);
        if (Q.jaw > 0.3) { const m = J.pt(22, -6); s.e(m[0] + 2, m[1] - 2, 14, 2 + Q.jaw * 4, TONGUE); s.e(m[0] + 4, m[1] - 3, 9, 1 + Q.jaw * 2, PINK[2]); }
        if (Q.glow > 0) { const m = J.pt(28, -8); s.e(m[0], m[1] - 4 - Q.jaw * 4, 13, 3 + Q.jaw * 6, ICE[1]); s.e(m[0] + 2, m[1] - 4 - Q.jaw * 4, 9, 1.5 + Q.jaw * 4, '#ffffff'); }
        for (let i = 0; i < 7; i++) { const x = 31 + i * 6, y = -26 - Math.min(i, 4) * 0.9, h = 5 + (i % 2) * 3 + (i === 6 ? 2 : 0); s.g([[x - 2, y], [x, y + h], [x + 2, y]], '#ffffff'); s.p(x - 1, y + 1, FOAM[0]); }
      });
      S.part((s) => {
        J.g([[-3, -3], [12, -6], [50, -10], [56, -4], [46, 10], [20, 18], [-3, 13]], SEA);
        s.in(() => { J.g([[2, 4], [46, 0], [44, 11], [20, 19], [0, 14]], Md(FOAM)); J.g([[8, 9], [40, 6], [38, 12], [20, 19], [8, 16]], Lt(FOAM)); J.pl([[6, -5], [50, -9]], 2, Md(DEEP)); J.l(10, 9, 34, 6, 1, Dk(FOAM)); J.l(14, 13, 30, 11, 1, Dk(FOAM)); });
      });
      S.part({ ol: false, bevel: false }, (s) => {
        for (let i = 0; i < 7; i++) { const u = 11 + i * 6, v = -7 - i * 0.45, h = 5 + ((i + 1) % 2) * 3 + (i === 6 ? 5 : 0); s.g([J.pt(u - 2, v), J.pt(u, v - h), J.pt(u + 2, v)], '#ffffff'); }
      });
      // râu cằm
      S.part((s) => { const a = J.pt(38, 10); s.cv([a, [a[0] + 6, a[1] + 8 + wh], [a[0] + 1 - wh * 2, a[1] + 17], [a[0] - 7 - wh * 3, a[1] + 22]], 2, 1, Md(FOAM)); });
      // --- mắt ---
      S.flat((s) => {
        const ang = Q.eye === 'angry' || ph >= 1;
        ngEye(s, 45, -47, { dead, shut: Q.blink > 0.6, dazed: Q.eye === 'dazed', look: lk, lid: ang ? 2 : 0, col: ph >= 2 ? '#ffb347' : '#ffe98a', iris: ph >= 2 ? '#e8492a' : ang ? '#f2902a' : '#f2c02a', glow: ph >= 2 && !dead ? '#ff6a3a' : null });
        s.r(66, -40, 2, 2, DEEP[0]); // lỗ mũi
        if (Q.eye === 'dazed') { s.r(38, -62, 2, 2, '#ffe36a'); s.r(54, -64, 2, 2, '#ffe36a'); s.p(46, -66, '#ffffff'); }
      });
      // gờ mày xếch
      S.part((s) => { const d = Q.eye === 'angry' || ph >= 1 ? 4 : Q.eye === 'dazed' || dead ? -1 : 1; s.g([[33, -56 - d], [38, -60 - d], [58, -53 + d], [59, -49 + d], [38, -55 - d]], DEEP); });
      // --- râu gần: dài, uốn như râu rồng ---
      S.part((s) => { s.cv([[68, -34], [86, -40], [94, -58 + wh * 5], [86, -76 + wh * 7], [68, -86 + wh * 9], [58, -82 + wh * 10]], 3, 1, FOAM); });
      // --- mắt thứ ba treo trên cần câu: bắt bài lăn né ---
      if (X.aD) {
        S.part((s) => { s.cv([[34, -70], [34, -92], [48, -106], [68, -106], [74, -98]], 3, 2, DEEP); });
        S.part({ fx: 1 }, (s) => { rd(s, 66, -105, 17, 17, '#ffe36a'); s.r(74, -108, 1, 2, '#ffe36a'); s.r(63, -97, 2, 1, '#ffe36a'); s.r(84, -97, 2, 1, '#ffe36a'); s.r(74, -87, 1, 2, '#ffe36a'); });
        S.flat((s) => { eye(s, 74, -97, { w: 11, h: 11, rim: PURP[0], col: '#ffffff', pc: PURP[1], look: [lk, 1] }); });
      }
      // --- bong bóng nước che chắn: chống đánh xa ---
      if (X.aR) {
        for (let i = 0; i < 3; i++) {
          const a = (-64 + i * 52 + Q.orb * 40) * D2R, bx = 66 + Math.cos(a) * 40, by = -28 + Math.sin(a) * 40, r = 9 - (i === 1 ? 0 : 1.5);
          S.part({ ol: ICE[0] }, (s) => { s.e(bx, by, r, r, Md(ICE)); s.in(() => { s.e(bx, by, r - 1.6, r - 1.6, Md(SEA)); s.e(bx + 1, by + 1, r - 3, r - 3, Dk(SEA)); s.r(bx - 3, by - 4, 2, 2, '#ffffff'); s.p(bx - 4, by - 2, '#ffffff'); s.p(bx + 3, by + 4, Lt(ICE)); s.cv([[bx - 2, by + 2], [bx + 1, by], [bx + 3, by - 3]], 1, 1, Md(ICE)); }); });
        }
      }
      // hơi lạnh ở miệng khi hoá cuồng
      if (ph >= 2 && !dead) S.part({ fx: 1 }, (s) => { const m = J.pt(54, -10); s.r(m[0] + 4, m[1] - 5, 2, 2, '#eafcff'); s.r(m[0] + 8, m[1] - 9, 3, 2, '#eafcff'); s.p(m[0] + 13, m[1] - 6, '#bfe9ff'); s.r(m[0] + 10, m[1] - 14, 2, 2, '#bfe9ff'); });
    },
    demos: [
      { id: 'idle', label: 'Bơi tại chỗ', Q: {}, X: {} },
      { id: 'roar', label: 'Gầm: nước dâng', Q: { jaw: 1, eye: 'angry', up: 0.6, wh: -0.6 }, X: {} },
      { id: 'spout', label: 'Phun cột nước', Q: { jaw: 0.5, glow: 1, eye: 'angry', puff: 0.4 }, X: {} },
      { id: 'wave', label: 'Vểnh đuôi đập sóng', Q: { tail: 1, eye: 'angry' }, X: {} },
      { id: 'spikes', label: 'Dựng gai', Q: { up: 1, red: 1, eye: 'angry', jaw: 0.5 }, X: {} },
      { id: 'exposed', label: 'Mệt, lộ mang', Q: { jaw: 0.6, eye: 'dazed', gill: 2 }, X: {} },
      { id: 'dead', label: 'Gục', Q: { jaw: 0.7, eye: 'dead' }, X: {} },
      { id: 'phase1', label: 'Nổi giận', Q: { eye: 'angry' }, X: { phase: 1 } },
      { id: 'phase2', label: 'Hóa cuồng', Q: { eye: 'angry', jaw: 0.5 }, X: { phase: 2 } },
      { id: 'elFire', label: 'Kháng Lửa, yếu Băng', Q: {}, X: { el: 'fire', weak: 'ice' } },
      { id: 'elPoison', label: 'Kháng Độc, yếu Lửa', Q: {}, X: { el: 'poison', weak: 'fire' } },
      { id: 'elIce', label: 'Kháng Băng, yếu Độc', Q: {}, X: { el: 'ice', weak: 'poison' } },
      { id: 'aR', label: 'Chống đánh xa: bong bóng nước', Q: {}, X: { aR: 1 } },
      { id: 'aM', label: 'Chống áp sát: gai xương', Q: {}, X: { aM: 1 } },
      { id: 'aD', label: 'Bắt bài lăn né: mắt thứ ba', Q: {}, X: { aD: 1 } },
      { id: 'all', label: 'Bật hết', Q: { jaw: 0.5, eye: 'angry' }, X: { el: 'fire', weak: 'ice', aR: 1, aM: 1, aD: 1, phase: 2 } },
    ],
  };

  // ====================================================================
  // 4C. LÂU ĐÀI CỔ (hệ lửa): đỏ cam và vàng lửa, nền đá sắt tối
  // ====================================================================
  const LD_EYE = '#ffd75a', LD_PUP = '#8c1c1f'; // mắt than hồng của ma lâu đài
  // Ngọn lửa nhỏ: chân lửa ở (x, y), rộng w, cao h, k là nhịp lay 0..3. f là mặt vẽ (S hoặc hệ con), B là bộ ba màu.
  function ldFlame(S, f, x, y, w, h, k, B) {
    const r = w / 2, ln = [0, 1, 0, -1][k & 3];
    f.e(x, y - r, r, r, Md(B));
    f.g([[x - r, y - r], [x + ln, y - h], [x + r, y - r]], Md(B));
    if (w >= 5) f.g([[x - r, y - r - 1], [x - r - ln, y - h * 0.62], [x, y - r]], Md(B));
    S.in(() => {
      f.e(x, y - r + 0.5, Math.max(0.6, r - 1.4), Math.max(0.6, r - 1.2), Lt(B));
      if (h >= 7) f.l(x, y - r, x + ln * 0.5, y - h * 0.6, 1, Lt(B));
      f.p(x + ln, y - h, Dk(B));
    });
  }
  // Cây giáo ngắn: gốc hệ con là bàn tay, trục u chạy về phía mũi giáo.
  function ldSpear(S, f) {
    S.part((s) => { f.l(-8, 0, 9, 0, 1, Lt(WD)); });
    S.part((s) => { f.g([[9, -2], [15, 0], [9, 2]], STEEL); });
    S.part((s) => { f.r(7, -1, 2, 3, Md(RED)); f.p(6, 2, Md(RED)); f.p(7, 3, Lt(RED)); });
  }
  // Cây đại đao: gốc hệ con là bàn tay trước, trục u chạy về phía lưỡi, lưỡi sắc quay về phía v dương.
  function ldDao(S, f, E) {
    S.part((s) => {
      f.l(-15, 0, 13, 0, 2, Md(WD));
      S.in(() => { f.l(-15, 0, -13, 0, 2, Md(GOLD)); f.l(-4, 0, -3, 0, 2, Dk(RED)); f.l(4, 0, 5, 0, 2, Dk(RED)); });
    });
    // tua đỏ dưới lưỡi
    S.part((s) => { f.g([[10, 1], [12, 6], [8, 7], [8, 2]], RED); });
    S.part((s) => {
      f.g([[13, -3], [20, -4], [27, -8], [26, -1], [22, 4], [15, 5], [13, 2]], STEEL);
      S.in(() => {
        f.l(15, 4, 22, 3, 1, Md(E.B)); f.l(22, 3, 26, -2, 1, Md(E.B)); f.l(23, 1, 25, -2, 1, Lt(E.B));
        f.l(15, -2, 22, -3, 1, Lt(STEEL));
      });
    });
    S.part((s) => { f.r(11, -3, 3, 7, Md(GOLD)); S.in(() => { f.l(12, -3, 12, 3, 1, Lt(GOLD)); }); });
  }

  // ----- Lính Ma (lính xông): hồn lính đội nón, rút giáo về rồi đâm thẳng -----
  defMon(2, 'rusher', {
    name: 'Lính Ma', top: 26, sh: 8,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), k = (P.w < 0 ? P.tl : P.w) & 3;
      const cx = P.sk === 1 ? 4 : P.sk === 2 ? 2 : P.an ? -P.an : 0;
      const tilt = P.sk === 1 ? 1 : P.an ? -(P.an + 1 >> 1) : 0; // nón nghiêng theo đà
      let hx, hy, deg;
      if (P.an) { hx = cx + 4 - P.an * 2; hy = -8 + by; deg = -3 * P.an; }
      else if (P.sk === 1) { hx = cx + 10; hy = -8 + by; deg = 0; }
      else if (P.sk === 2) { hx = cx + 8; hy = -8 + by; deg = -6; }
      else { hx = cx + 8; hy = -7 + by; deg = -70 + (P.w < 0 ? 0 : WX[P.w] * 2); }
      // đuôi khói phía sau
      S.part((s) => {
        const bk = P.sk === 1 ? 4 : P.w >= 0 ? 2 : 0;
        s.cv([[cx - 5, -7], [cx - 9 - bk, -5 - (k & 1)], [cx - 12 - bk, -7 + (k >> 1)]], 3, 1, Md(IRON));
        s.in(() => { s.p(cx - 12 - bk, -7 + (k >> 1), Md(FIRE)); });
      });
      // thân khói, gấu áo rách cháy than hồng
      S.part((s) => {
        s.e(cx, -13 + by, 7, 6, IRON);
        s.g([[cx - 7, -13 + by], [cx + 7, -13 + by], [cx + 7, -6], [cx - 8, -6]], IRON);
        const tip = [];
        for (let i = 0; i < 4; i++) {
          const x = cx - 8 + i * 4, d = (i + k) & 1, q = [x + 1 - (P.sk === 1 || P.w >= 0 ? 1 : 0), -1 - d];
          s.g([[x, -6], [x + 3, -6], q], IRON); tip.push(q);
        }
        s.in(() => {
          for (const q of tip) { s.p(q[0], q[1], Md(FIRE)); s.p(q[0], q[1] - 1, Dk(FIRE)); s.p(q[0] + 1, q[1] - 1, Dk(FIRE)); }
          s.e(cx + 2, -14 + by, 6, 4, Dk(IRON)); // mặt tối dưới vành nón
          s.p(cx - 5, -7, Lt(IRON)); s.p(cx + 3, -6, Lt(IRON)); s.p(cx - 1, -7, Dk(IRON));
        });
      });
      // khăn đỏ quấn cổ
      S.part((s) => {
        s.r(cx - 6, -10 + by, 13, 2, RED);
        s.g([[cx - 5, -10 + by], [cx - 11, -10 + by + (k & 1)], [cx - 10, -7 + by], [cx - 5, -8 + by]], RED);
      });
      // tua đỏ trên chóp nón
      S.part((s) => { s.cv([[cx + tilt, -25 + by], [cx - 3 + tilt, -25 + by], [cx - 6 + tilt, -22 + by + (k & 1)]], 2, 1, Md(RED)); });
      // nón lính thú
      S.part((s) => {
        s.g([[cx - 9 + tilt, -18 + by], [cx + tilt, -24 + by], [cx + 9 + tilt, -18 + by]], ORG);
        s.r(cx - 9 + tilt, -18 + by, 19, 1, ORG);
        s.in(() => {
          s.r(cx - 6 + tilt, -20 + by, 13, 1, Md(RED));
          s.l(cx + 1 + tilt, -23 + by, cx + 4 + tilt, -21 + by, 1, Lt(ORG));
        });
      });
      S.part((s) => { s.r(cx - 1 + tilt, -26 + by, 3, 2, Lt(GOLD)); });
      S.flat((s) => {
        const ey = -14 + by;
        eye(s, cx, ey, eyeOf(P, { look: [1, 0], rim: IRON[0], col: LD_EYE, pc: LD_PUP }));
        eye(s, cx + 5, ey, eyeOf(P, { w: 3, look: [1, 0], rim: IRON[0], col: LD_EYE, pc: LD_PUP, side: -1 }));
        if (P.dead) mouth(s, 'wavy', cx + 3, -6 + by);
      });
      // giáo và bàn tay khói
      ldSpear(S, S.fr(hx, hy, deg));
      S.part((s) => { s.e(hx, hy, 1.6, 1.6, Lt(IRON)); if (P.an || P.sk) s.e(hx - 5, hy + 1, 1.6, 1.6, Md(IRON)); });
      // mũi giáo loé sáng ngay trước khi đâm
      if (P.an === 3) S.part({ fx: 1 }, (s) => { const q = S.fr(hx, hy, deg).pt(15, 0); s.r(q[0] - 1, q[1], 3, 1, SH); s.r(q[0], q[1] - 1, 1, 3, SH); });
    },
  });

  // ----- Dơi Lửa (bầy nhỏ): luôn vỗ cánh, giương cánh há miệng rồi bổ nhào cắn -----
  defMon(2, 'swarm', {
    name: 'Dơi Lửa', top: 17, sh: 5,
    draw(S, P) {
      const fl = P.tl & 3;
      const cx = P.sk === 1 ? 4 : P.sk === 2 ? 2 : P.an ? -1 : 0;
      const cy = -9 + (P.dead ? 2 : [1, 0, -1, 0][fl]) - (P.an ? P.an : 0) + (P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0);
      // độ nâng đầu cánh: âm là giương lên
      const wy = P.dead ? 4 : P.an ? -7 - (fl & 1) : P.sk === 1 ? -6 : [-6, -1, 4, -1][fl];
      const wl = P.sk === 1 ? 8 : wy > 2 ? 9 : 10;
      // màng cánh rực than hồng
      S.part((s) => {
        const wing = (sd) => {
          const rx = cx + sd * 2, tx = rx + sd * wl - (P.sk === 1 ? 3 : 0), ty = cy + wy, lo = wy > 0 ? 3 : 1;
          const pts = [[rx, cy - 2], [tx - sd * 3, ty - 1], [tx, ty], [tx - sd * 2, ty + 4], [rx + sd * 5, cy + lo], [rx + sd * 3, cy + 3], [rx, cy + 2]];
          s.g(pts, Md(FIRE));
          s.in(() => {
            s.pl([pts[2], pts[3], pts[4], pts[5]], 1, Lt(FIRE)); // mép màng sáng rực
            s.pl([pts[0], pts[1], pts[2]], 1, Dk(FIRE)); // xương cánh
          });
        };
        wing(-1); wing(1);
      });
      // tai to
      S.part((s) => {
        s.g([[cx - 4, cy - 2], [cx - 5, cy - 8], [cx - 1, cy - 4]], NIGHT); s.g([[cx + 1, cy - 4], [cx + 5, cy - 8], [cx + 4, cy - 2]], NIGHT);
        s.in(() => { s.p(cx - 4, cy - 5, Md(FLAME)); s.p(cx - 3, cy - 4, Md(FLAME)); s.p(cx + 4, cy - 5, Md(FLAME)); s.p(cx + 3, cy - 4, Md(FLAME)); });
      });
      // thân tròn
      S.part((s) => {
        s.e(cx, cy, 4.2, 4, NIGHT);
        s.in(() => { s.e(cx + 1, cy + 3, 2.2, 1.4, Md(EMBER)); s.p(cx - 2, cy - 3, Lt(NIGHT)); });
      });
      // chân bé
      S.part((s) => { s.p(cx - 1, cy + 5, Md(EMBER)); s.p(cx + 2, cy + 5, Md(EMBER)); });
      S.flat((s) => {
        bead(s, cx - 2, cy - 2, beadOf(P, { white: 1 })); bead(s, cx + 2, cy - 2, beadOf(P, { white: 1 }));
        if (P.an || P.sk === 1) { s.r(cx - 1, cy + 1, 4, 2 + (P.an >= 2 ? 1 : 0), MOUTH); s.p(cx - 1, cy + 1, '#ffffff'); s.p(cx + 2, cy + 1, '#ffffff'); if (P.an >= 2) s.r(cx, cy + 3, 2, 1, TONGUE); }
        else if (P.dead) s.r(cx, cy + 2, 2, 1, INK);
        else { s.r(cx, cy + 1, 3, 1, INK); s.p(cx, cy + 2, '#ffffff'); s.p(cx + 2, cy + 2, '#ffffff'); }
      });
    },
  });

  // ----- Nghê Đá (khiên): tượng nghê sống dậy, cúi đầu cào đất rồi húc -----
  defMon(2, 'shield', {
    name: 'Nghê Đá', top: 21, sh: 10,
    draw(S, P) {
      const by = (P.br ? -1 : 0) + hop(P), fo = P.w < 0 ? 0 : WX[P.w];
      const low = P.an ? 1 + P.an : P.sk === 1 ? 2 : P.sk === 2 ? 1 : 0; // cúi đầu
      const bx = P.sk === 1 ? 4 : P.sk === 2 ? 2 : P.an ? -1 : 0;
      const hx = bx + 5 + (P.sk === 1 ? 6 : P.sk === 2 ? 2 : P.an ? -1 : 0), hy = -13 + by + low;
      const paw = P.an === 1 || P.an === 3 ? 1 : 0, rear = P.an ? -1 : 0;
      const HOT = Md(FIRE), GLW = Md(FLAME);
      // đuôi xoắn hình ngọn lửa
      S.part((s) => {
        const k = P.tl & 1, tx = bx - 9, ty = -10 + by + rear;
        s.cv([[tx + 2, ty + 1], [tx - 3, ty - 1], [tx - 3 + k, ty - 6], [tx + 1, ty - 8 - (P.an ? 1 : 0)]], 3, 2, Md(FIRE));
        s.in(() => { s.p(tx - 2, ty - 2, Lt(FIRE)); s.p(tx - 2 + k, ty - 5, Lt(FIRE)); s.p(tx + 1, ty - 8 - (P.an ? 1 : 0), Lt(FIRE)); });
      });
      // hai chân phía xa
      S.part((s) => { s.r(bx - 5 + fo, -4, 3, 4, Dk(STONE)); s.r(bx + 4 - fo, -4, 3, 4, Dk(STONE)); });
      // thân đá có vết nứt rực lửa
      S.part((s) => {
        s.e(bx - 2, -9 + by + rear * 0.5, 7.5, 5, STONE);
        s.in(() => {
          const y = -9 + by;
          s.pl([[bx - 7, y - 3], [bx - 5, y - 1], [bx - 6, y + 1], [bx - 4, y + 3]], 1, HOT);
          s.pl([[bx - 1, y - 4], [bx, y - 1], [bx - 2, y + 1]], 1, HOT);
          s.p(bx - 5, y - 1, GLW); s.p(bx, y - 1, GLW);
          s.p(bx - 3, y - 4, Lt(STONE)); s.p(bx + 2, y + 3, Dk(STONE));
        });
      });
      // hai chân phía gần
      S.part((s) => {
        s.r(bx - 9 - fo, -5, 4, 5, STONE);
        if (paw) s.r(bx + 3, -7, 4, 4, STONE); else s.r(bx + 1 + fo + (P.an === 2 ? 3 : 0), -5, 4, 5, STONE);
        s.in(() => { s.p(bx - 6 - fo, -1, Dk(STONE)); if (!paw) s.p(bx + 4 + fo + (P.an === 2 ? 3 : 0), -1, Dk(STONE)); });
      });
      // bụi đất khi cào
      if (P.an === 2) S.part({ fx: 1 }, (s) => { s.p(bx - 1, -1, STONE[2]); s.p(bx - 3, -2, STONE[1]); s.p(bx, -3, STONE[2]); });
      // bờm xoăn
      S.part((s) => {
        for (let i = 0; i < 6; i++) {
          const a = (95 + i * 34) * D2R;
          s.e(hx - 1 + Math.cos(a) * 6, hy + Math.sin(a) * 5.6, 2.4, 2.4, STONE);
        }
        s.in(() => {
          for (let i = 0; i < 6; i++) { const a = (95 + i * 34) * D2R; s.p(hx - 1 + Math.cos(a) * 6.4, hy + Math.sin(a) * 6, i % 2 ? Dk(STONE) : HOT); }
        });
      });
      // đầu và mõm
      S.part((s) => {
        s.g([[hx - 3, hy - 5], [hx - 2, hy - 9], [hx + 1, hy - 5]], STONE); // tai
        s.e(hx, hy, 6, 5.6, STONE);
        s.e(hx + 5, hy + 2, 3, 2.6, STONE);
        s.in(() => {
          s.pl([[hx - 4, hy - 4], [hx - 3, hy - 2], [hx - 5, hy]], 1, HOT); s.p(hx - 3, hy - 2, GLW);
          s.p(hx + 1, hy - 5, Lt(STONE)); s.r(hx - 2, hy + 5, 5, 1, Dk(STONE));
        });
      });
      // chuông vàng dưới cổ
      S.part((s) => { s.r(hx - 1, hy + 6, 3, 3, GOLD); });
      S.flat((s) => {
        const ey = hy - 1;
        eye(s, hx, ey, eyeOf(P, { look: [1, 0], rim: STONE[0], col: FLAME[2], pc: LD_PUP, lid: 1 }));
        eye(s, hx + 5, ey, eyeOf(P, { w: 3, look: [1, 0], rim: STONE[0], col: FLAME[2], pc: LD_PUP, lid: 1, side: -1 }));
        s.r(hx + 6, hy + 1, 2, 1, INK); // mũi
        if (P.sk === 1) stamp(s, ['KKKKK', 'KWKWK', 'KKKKK'], hx + 5, hy + 3);
        else if (P.dead) mouth(s, 'wavy', hx + 4, hy + 3);
        else if (P.an) { s.r(hx + 3, hy + 4, 5, 1, INK); s.p(hx + 4, hy + 3, '#ffffff'); s.p(hx + 6, hy + 3, '#ffffff'); }
        else { s.r(hx + 3, hy + 4, 4, 1, INK); s.p(hx + 7, hy + 3, INK); }
      });
    },
  });

  // ----- Đèn Lồng Ma (xạ thủ): lửa phình to, ngả ra sau rồi phun cầu lửa -----
  defMon(2, 'archer', {
    name: 'Đèn Lồng Ma', top: 27, sh: 6,
    draw(S, P) {
      const bob = (P.br ? -1 : 0) + hop(P), k = P.tl & 3;
      const lean = P.an ? -P.an * 6 : P.sk === 1 ? 14 : P.sk === 2 ? 6 : 0;
      const cx = P.an ? -P.an : P.sk === 1 ? 3 : P.sk === 2 ? 1 : 0;
      const cy = -14 + bob + (P.dead ? 3 : 0);
      const f = S.fr(cx, cy, lean);
      const sw = P.an ? P.an : P.sk === 1 ? 1 : 0;
      // tua rủ thay chân: dây đỏ, nút thắt, chùm tua vàng
      S.part((s) => {
        const b = f.pt(0, 9), sx = [0, 1, 0, -1][k] - Math.round(lean * 0.1) - (P.w >= 0 ? 1 : 0);
        const x0 = Math.round(b[0]), y0 = Math.round(b[1]), x1 = Math.round(cx + sx), y1 = Math.max(y0 + 2, -6);
        s.l(x0, y0, x1, y1, 1, Md(RED));
        s.r(x1 - 1, y1, 3, 2, Md(RED));
        s.r(x1 - 1, y1 + 2, 3, Math.max(2, -1 - y1 - 1), GOLD);
        s.in(() => { s.r(x1, y1 + 3, 1, 3, Dk(GOLD)); s.p(x1, y1, Lt(RED)); });
      });
      // ngọn lửa trên chóp
      S.part((s) => { ldFlame(S, f, 0, -8, 5 + sw, 6 + sw * 2, k, FLAME); });
      // hai nắp đèn
      S.part((s) => { f.r(-3, -9, 7, 2, Md(IRON)); f.r(-3, 7, 7, 2, Md(IRON)); S.in(() => { f.l(-3, -9, 3, -9, 1, Md(GOLD)); f.l(-3, 8, 3, 8, 1, Md(GOLD)); }); });
      // thân đèn giấy đỏ
      S.part((s) => {
        f.e(0, 0, 7.5 + (P.an >= 2 ? 0.6 : 0), 7, RED);
        S.in(() => {
          f.e(1, 1, 5, 4.6, Md(FIRE)); f.e(1, 1, 3, 2.6, Lt(FIRE)); // ánh lửa bên trong
          f.l(-5, -4, -6, 0, 1, Dk(RED)); f.l(-6, 0, -5, 4, 1, Dk(RED));
          f.l(6, -4, 7, 0, 1, Dk(RED)); f.l(7, 0, 6, 4, 1, Dk(RED));
          f.l(-4, -6, 4, -6, 1, Md(RED)); f.l(-4, 6, 4, 6, 1, Dk(RED));
        });
      });
      // hai bàn tay lửa
      S.part((s) => {
        const up = P.an ? P.an : 0;
        const a = f.pt(-10, 1 - up), b = f.pt(10 + (P.sk === 1 ? 1 : 0), 1 - up * 1.5);
        ldFlame(S, S, a[0], a[1] + 2, 3, 5, k + 1, FLAME); ldFlame(S, S, b[0], b[1] + 2, 3, 5, k + 3, FLAME);
      });
      S.flat((s) => {
        const a = f.pt(-1, -1), b = f.pt(4, -1), m = f.pt(2, 3);
        eye(s, a[0], a[1], eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: RED[0], col: FLAME[2] }));
        eye(s, b[0], b[1], eyeOf(P, { w: 3, h: 5, look: [1, 0], rim: RED[0], col: FLAME[2], side: -1 }));
        if (P.sk === 1) stamp(s, ['.KKK.', 'KDDDK', 'KDYYK', 'KDDDK', '.KKK.'], m[0] + 2, m[1] - 1);
        else if (P.an) { s.r(m[0], m[1] + 1, 2, 2, INK); if (P.an >= 2) s.r(m[0] + 2, m[1] + 1, 1, 2, FLAME[1]); }
        else if (P.dead) mouth(s, 'wavy', m[0], m[1] + 1);
        else mouth(s, 'smile', m[0], m[1] + 1);
      });
    },
  });

  // ----- Cáo Lửa (nhanh nhẹn): chổng mông lấy đà rồi phóng dài người -----
  defMon(2, 'nimble', {
    name: 'Cáo Lửa', top: 17, sh: 9,
    draw(S, P) {
      const k = P.tl & 3, by = (P.br ? -1 : 0) + hop(P);
      const SOCK = Dk(EMBER);
      let bx, bcy, brx, deg, hx, hy, tail, tdeg, legs;
      if (P.lg) {
        bx = 0; bcy = -9; brx = 8.5; deg = -6; hx = 10; hy = -12;
        tail = [[-8, -9], [-13, -10], [-18, -9]]; tdeg = -98;
        legs = [[5, -8, 13, -6], [6, -8, 15, -8], [-6, -8, -13, -5], [-5, -8, -15, -7]];
      } else if (P.an) {
        const a = P.an;
        bx = -1 - (a >> 1); bcy = -6 - (a > 1 ? 1 : 0); brx = 6.5; deg = 6 + a * 5; hx = 7 - (a >> 1); hy = -8 + a;
        tail = [[bx - 6, bcy - 3], [bx - 10, bcy - 7 - a], [bx - 8, bcy - 11 - a]]; tdeg = 12;
        legs = [[bx + 4, bcy + 2, bx + 8, 0], [bx + 5, bcy + 2, bx + 10, 0], [bx - 5, bcy, bx - 6, 0], [bx - 4, bcy, bx - 3, 0]];
      } else {
        const w = P.w, st = w < 0 ? 0 : [4, 0, -3, 0][w];
        bx = -1; bcy = -7 + by; brx = 6.5 + (w === 0 || w === 2 ? 0.6 : 0); deg = w === 0 ? -4 : w === 2 ? 4 : 0; hx = 7; hy = -10 + by + (w === 2 ? 1 : 0);
        const tu = w < 0 ? (k & 1) : w & 1;
        tail = [[bx - 6, bcy - 1], [bx - 11, bcy - 3 - tu], [bx - 11 + tu, bcy - 7 - tu]]; tdeg = -10 - (w >= 0 ? 25 : 0);
        const up = w === 1 || w === 3 ? -1 : 0;
        legs = [[bx + 4, bcy + 2, bx + 5 + st, up], [bx + 5, bcy + 2, bx + 6 - st * 0.7, 0], [bx - 5, bcy + 2, bx - 5 - st, up], [bx - 4, bcy + 2, bx - 4 + st * 0.7, 0]];
        if (P.dead) hy += 2;
      }
      const tip = tail[2];
      // hai chân phía xa
      S.part((s) => { s.l(legs[1][0], legs[1][1], legs[1][2], legs[1][3] - 1, 2, SOCK); s.l(legs[3][0], legs[3][1], legs[3][2], legs[3][3] - 1, 2, SOCK); });
      // đuôi xù
      S.part((s) => { s.cv(tail, 3, 5, ORG); });
      // chóp đuôi trắng rồi cháy thành lửa
      S.part((s) => {
        const f = S.fr(tip[0], tip[1], tdeg);
        ldFlame(S, f, 0, 2, 6, P.lg ? 10 : 8, k, FIRE);
        S.in(() => { f.e(0, 0, 2, 1.6, Lt(FUR)); });
      });
      // thân
      S.part((s) => {
        s.er(bx, bcy, brx, 3.8, deg, ORG);
        s.in(() => {
          const r = deg * D2R, fx = bx + Math.cos(r) * (brx - 2), fy = bcy + Math.sin(r) * (brx - 2);
          s.e(fx, fy + 2, 3, 2.4, Md(FUR)); s.e(fx + 1, fy + 3, 2, 1.4, Lt(FUR));
          s.p(bx - 3, bcy - 3, Lt(ORG)); s.p(bx - 5, bcy, Dk(ORG));
        });
      });
      // hai chân phía gần, đi tất sẫm
      S.part((s) => {
        for (const i of [0, 2]) { const q = legs[i]; s.l(q[0], q[1], q[2], q[3] - 1, 2, Md(ORG)); }
        s.in(() => { for (const i of [0, 2]) { const q = legs[i]; s.r(Math.round(q[2]) - 1, Math.round(q[3]) - 2, 2, 2, SOCK); } });
      });
      // tai nhọn
      S.part((s) => {
        s.g([[hx - 4, hy - 1], [hx - 4, hy - 7], [hx - 1, hy - 3]], ORG); s.g([[hx, hy - 3], [hx + 2, hy - 7], [hx + 3, hy - 2]], ORG);
        s.in(() => { s.p(hx - 4, hy - 7, Dk(NIGHT)); s.p(hx - 4, hy - 6, Dk(NIGHT)); s.p(hx + 2, hy - 7, Dk(NIGHT)); s.p(hx + 2, hy - 6, Dk(NIGHT)); });
      });
      // đầu, mõm nhọn, má trắng
      S.part((s) => {
        s.e(hx, hy, 4.4, 3.8, ORG);
        s.g([[hx + 2, hy - 1], [hx + 8, hy + 2], [hx + 2, hy + 3]], ORG);
        s.in(() => { s.e(hx + 3, hy + 3, 4.6, 1.6, Md(FUR)); s.e(hx - 2, hy + 3, 2, 1.4, Md(FUR)); s.p(hx - 1, hy - 3, Lt(ORG)); });
      });
      S.flat((s) => {
        eye(s, hx + 1, hy - 1, eyeOf(P, { w: 3, h: 3, look: [1, 0], rim: EMBER[0], col: '#fff6a0', pup: 'slit', lid: P.w < 0 ? 1 : 0 }));
        s.p(hx + 8, hy + 2, INK); s.p(hx + 7, hy + 1, INK); // mũi
        if (P.lg || P.an === 3) { s.r(hx + 4, hy + 3, 3, 1, MOUTH); s.p(hx + 6, hy + 4, '#ffffff'); }
        else if (!P.dead) s.r(hx + 4, hy + 3, 2, 1, INK);
      });
    },
  });

  // ----- Tướng Ma (tinh anh): bộ giáp tướng rỗng, lửa cháy trong mũ, giơ đại đao rồi bổ xuống -----
  defMon(2, 'elite', {
    name: 'Tướng Ma', size: [116, 108], org: [50, 88], top: 40, sh: 13,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.fire, B = E.B, HOLE = '#2a0c14';
      const k = P.tl & 3, fo = P.w < 0 ? 0 : WX[P.w];
      const tx = P.an ? -P.an : P.sk === 1 ? 4 : P.sk === 2 ? 2 : 0;
      const ty = (P.br ? -1 : 0) + hop(P) + (P.sk === 1 ? 3 : P.sk === 2 ? 1 : P.an >= 2 ? -1 : 0);
      const an = P.an || P.sk || P.lg;
      // tư thế đại đao: bàn tay trước (gx, gy), góc gd
      let gx, gy, gd;
      if (P.an) { gx = tx + 14; gy = -22 - P.an * 3 + ty; gd = -92 - P.an * 4; }
      else if (P.sk === 1) { gx = tx + 10; gy = -13 + ty; gd = 30; }
      else if (P.sk === 2) { gx = tx + 10; gy = -14 + ty; gd = 22; }
      else if (P.sk === 3) { gx = tx + 12; gy = -16 + ty; gd = -35; }
      else { gx = tx + 17; gy = -13 + ty + (P.w === 1 || P.w === 3 ? -1 : 0); gd = -80; }
      const gf = S.fr(gx, gy, gd), two = P.an || P.sk === 1 || P.sk === 2;
      const sx = tx + 9, sy = -21 + ty; // vai trước
      const hx = tx + 1 + (P.sk === 1 ? 1 : 0), hy = -31 + ty + (P.sk === 1 ? 1 : 0); // tâm mũ
      // áo choàng đỏ rách phía sau
      S.part((s) => {
        const fl = P.sk === 1 ? 5 : P.w >= 0 ? 2 : 0, w = k & 1;
        s.g([[tx - 7, -25 + ty], [tx, -25 + ty], [tx - 1, -4], [tx - 15 - fl, -4], [tx - 13 - fl * 0.5, -18 + ty]], RED);
        s.g([[tx - 15 - fl, -5], [tx - 17 - fl - w, -1], [tx - 11 - fl, -4]], RED); s.g([[tx - 10 - fl, -5], [tx - 10 - fl + w, -1], [tx - 6, -4]], RED);
        s.in(() => { s.l(tx - 10, -20 + ty, tx - 13 - fl, -5, 1, Dk(RED)); s.l(tx - 12, -16 + ty, tx - 14 - fl, -8, 1, Lt(RED)); });
      });
      // tay sau buông bên hông
      if (!two) S.part((s) => { s.l(tx - 9, -21 + ty, tx - 11, -15 + ty, 3, Md(IRON)); s.e(tx - 11, -13 + ty, 2.2, 2.2, IRON); });
      // hai ống giày sắt
      S.part((s) => {
        for (const d of [-1, 1]) {
          const x = Math.round(tx * 0.4 + d * 4 + d * fo * 0.5) - 2, up = (d < 0 ? P.w === 1 : P.w === 3) ? -1 : 0;
          rd(s, x - 1, -7 + up, 6, 7, IRON); s.r(x + 3, -3 + up, 3, 3, IRON);
          s.in(() => { s.r(x - 1, -1 + up, 7, 1, Md(GOLD)); s.r(x, -6 + up, 4, 1, Lt(IRON)); });
        }
      });
      // váy giáp nhiều mảnh
      S.part((s) => {
        const m = Math.round(tx * 0.5);
        s.g([[tx - 7, -15 + ty], [tx + 7, -15 + ty], [m + 10, -6], [m - 9, -6]], IRON);
        s.in(() => {
          for (let i = -2; i <= 2; i++) s.l(tx + i * 3.4, -14 + ty, m + i * 4.4, -6, 1, Dk(IRON));
          s.l(m - 9, -6, m + 10, -6, 1, Md(GOLD)); s.l(m - 8, -10, m + 9, -10, 1, Dk(GOLD));
        });
      });
      // thân giáp, đai vàng, hộ tâm kính rực màu hệ
      S.part((s) => {
        rd(s, tx - 8, -25 + ty, 17, 12, IRON);
        s.in(() => {
          s.r(tx - 8, -15 + ty, 17, 2, Md(GOLD)); s.r(tx - 1, -16 + ty, 4, 3, Lt(GOLD));
          s.e(tx + 2, -20 + ty, 3, 2.6, Md(GOLD)); s.e(tx + 2, -20 + ty, 1.6, 1.4, Md(B)); s.p(tx + 2, -21 + ty, Lt(B));
          s.l(tx - 7, -23 + ty, tx - 7, -17 + ty, 1, Dk(IRON)); s.l(tx - 5, -18 + ty, tx - 3, -18 + ty, 1, Dk(IRON));
        });
      });
      // giáp vai sau
      S.part((s) => { s.e(tx - 9, -23 + ty, 4, 3.4, IRON); s.in(() => { s.l(tx - 13, -22 + ty, tx - 6, -21 + ty, 1, Md(GOLD)); }); });
      // chùm lửa trên chóp mũ, theo màu hệ
      S.part((s) => {
        const big = an ? 1 : 0, f = S.fr(hx - 1, hy - 7, P.sk === 1 ? -40 : P.an ? -8 - P.an * 6 : -10);
        ldFlame(S, f, 0, 1, 8 + big, 12 + big * 3, k, B);
        S.in(() => { f.p(0, -3, E.hot); f.p(0, -2, E.hot); });
      });
      // sừng mũ
      S.part((s) => {
        s.cv([[hx - 7, hy - 3], [hx - 11, hy - 6], [hx - 10, hy - 11]], 3, 1, GOLD);
        s.cv([[hx + 7, hy - 3], [hx + 11, hy - 6], [hx + 10, hy - 11]], 3, 1, GOLD);
      });
      // mũ trụ: vòm sắt, diềm che gáy và má
      S.part((s) => {
        s.e(hx, hy - 1, 9, 7, IRON);
        s.g([[hx - 9, hy - 1], [hx - 11, hy + 7], [hx + 10, hy + 7], [hx + 9, hy - 1]], IRON);
        s.in(() => {
          s.l(hx - 11, hy + 7, hx + 10, hy + 7, 1, Md(GOLD));
          s.l(hx - 7, hy + 1, hx - 8, hy + 5, 1, Dk(IRON)); s.l(hx - 5, hy - 6, hx - 2, hy - 7, 1, Lt(IRON));
        });
      });
      // lòng mũ rỗng, chỉ có lửa
      S.part({ ol: false, bevel: false }, (s) => {
        rd(s, hx - 4, hy - 2, 14, 9, HOLE);
        s.in(() => {
          const fl = an ? 1 : 0;
          for (let i = 0; i < 7; i++) {
            const h = 1 + ((i + k) & 1) + (i === 0 || i === 6 ? 1 + fl * 2 : i === 3 ? fl : 0), x = hx - 4 + i * 2;
            s.r(x, hy + 7 - h, 2, h, B[0]); if (h > 1) s.r(x, hy + 8 - h, 1 + (i & 1), h - 1, B[1]);
          }
          s.r(hx - 2, hy + 6, 10, 1, B[2]);
        });
      });
      // viền vàng trên trán và chỏm trán
      S.part((s) => {
        s.r(hx - 5, hy - 4, 16, 2, GOLD);
        s.g([[hx + 1, hy - 4], [hx + 3, hy - 9], [hx + 5, hy - 4]], GOLD);
        s.in(() => { s.p(hx + 3, hy - 5, Md(B)); s.p(hx + 3, hy - 6, Lt(B)); });
      });
      S.flat((s) => {
        const ey = hy + 2, o = { look: [1, 0], rim: HOLE, col: E.hot, pc: B[0], brow: 'angry' };
        eye(s, hx + 1, ey, P.dead ? { x: 1, rim: HOLE } : Object.assign({}, o, P.bl ? { shut: 1, lidc: B[0] } : {}));
        eye(s, hx + 7, ey, P.dead ? { x: 1, w: 3, rim: HOLE } : Object.assign({ w: 3, side: -1 }, o, P.bl ? { shut: 1, lidc: B[0] } : {}));
      });
      // đại đao
      ldDao(S, gf, E);
      // tay sau cùng nắm cán khi đánh
      if (two) S.part((s) => {
        const h = gf.pt(-7, 0);
        if (!P.an) s.l(tx - 5, -21 + ty, h[0], h[1], 3, Md(IRON));
        s.e(h[0], h[1], 2.2, 2.2, IRON);
      });
      // tay trước và găng sắt
      S.part((s) => {
        s.l(sx, sy + 1, gx, gy, 3, Md(IRON));
        s.e(gx, gy, 2.6, 2.6, IRON);
        s.in(() => { s.p(gx, gy - 1, Md(GOLD)); s.p(gx + 1, gy, Md(GOLD)); });
      });
      // giáp vai trước
      S.part((s) => {
        s.e(sx + 1, sy - 1, 4.6, 3.8, IRON);
        s.in(() => { s.l(sx - 3, sy + 1, sx + 5, sy + 1, 1, Md(GOLD)); s.p(sx + 1, sy - 3, Lt(IRON)); s.p(sx + 1, sy - 1, Md(B)); });
      });
    },
  });

  // ====================================================================
  // 4C-2. TRÙM NHỎ LÂU ĐÀI: HỔ LỬA
  // ====================================================================
  const ldSTRIPE = ['#2e1210', '#4a1a14', '#6e2a1a']; // vằn hổ sẫm
  const ldFAR = mix3(ORG, EMBER, 0.6); // chân phía xa, sẫm hơn
  // P có thêm: kd tên đòn ('' | 'slam' | 'charge' | 'burst' | 'summon' | 'swipe'), roar gầm, f3 khung nháy nhanh 0..2, tired thở dốc.
  MINI[2] = {
    name: 'Hổ Lửa', size: [180, 124], org: [86, 110], top: 57, sh: 24,
    draw(S, P, X) {
      const E = (X && X.E) || ELP.fire, B = E.B;
      const an = P.an || 0, sk = P.sk || 0, f3 = P.f3 || 0, k = (P.tl || 0) & 3, w = P.w == null ? -1 : P.w;
      const atk = P.kd || (an || sk ? 'swipe' : '');
      const roar = !P.dead && (P.roar || (atk === 'summon' && (sk === 1 || sk === 2)));
      // ---- tư thế ----
      // thân: tâm (bx, by), bán kính rx ry, góc deg (âm là ngẩng đầu, dương là chúi đầu)
      let bx = -10, by = -27 + (P.br ? -1 : 0), rx = 25, ry = 14, deg = 0;
      let hox = 8, hoy = -4, hdeg = 0; // đầu: lệch so với cổ, góc ngửa
      // bốn bàn chân: gần trước, xa trước, gần sau, xa sau. FNr, FFr là chân trước tính từ vai (khi giơ lên khỏi đất).
      let FN = [4, 0], FF = [11, 0], HN = [-27, 0], HF = [-20, 0], FNr = null, FFr = null;
      let fl = 1, flDeg = 0, mo = 'shut', mad = 0, claws = 0, spike = 0, lid = 0, armBack = 0;
      let tl = [-13, -14, -9, -27, 12]; // đuôi: điểm giữa và chóp tính từ gốc đuôi, rồi góc ngọn lửa ở chóp
      if (P.dead) {
        by = -13; hoy = 5; hdeg = 8; FN = [22, 0]; FF = [28, -1]; HN = [-44, 0]; HF = [-38, -1]; fl = 0; tl = [-12, 6, -24, 10, 0];
      } else if (roar) {
        deg = -12; by = -28; bx += f3 - 1; hox = 2; hoy = -10; hdeg = -30; mo = 'roar'; mad = 1; fl = 1.6; FN = [5, 0]; FF = [12, 0];
        tl = [-10, -15, -7, -30, 0];
      } else if (P.tired) {
        by = -22 + (k & 1); hox = 9; hoy = 5; hdeg = 6; mo = 'pant'; fl = 0.5; lid = 3; FN = [6, 0]; FF = [13, 0]; tl = [-14, 0, -25, -5, -40];
      } else if (atk === 'slam') {
        mad = 1; mo = 'snarl';
        if (an === 1) { by = -23; deg = 4; hoy = -2; }
        else if (an === 2) { bx = -13; by = -31; deg = -26; FNr = [10, 9]; FFr = [14, 6]; HN = [-27, 0]; HF = [-18, 0]; }
        else if (an === 3) { bx = -16; by = -37; deg = -52; FNr = [13, -1]; FFr = [17, 5]; claws = 1; mo = 'roar'; hdeg = -10; HN = [-26, 0]; HF = [-15, 0]; fl = 1.4; }
        else if (sk === 1) { bx = -4; by = -21; deg = 9; FN = [20, 0]; FF = [29, 0]; claws = 1; hox = 9; hoy = 1; mo = 'roar'; fl = 1.5; HN = [-24, 0]; HF = [-16, 0]; }
        else if (sk === 2) { bx = -7; by = -24; deg = 5; FN = [14, 0]; FF = [22, 0]; }
      } else if (atk === 'charge') {
        mad = 1; mo = 'snarl';
        if (an) { by = -27 + an * 2.5; deg = an * 3; hox = 8 + an; hoy = -4 + an; FN = [8 + an, 0]; FF = [15 + an, 0]; HN = [-26, 0]; HF = [-19, 0]; tl = [-8, -14, -5, -28 - an, 0]; fl = 1 + an * 0.25; }
        else if (sk === 1) {
          by = -25 + (f3 === 1 ? -1 : 0); rx = 29; ry = 12; deg = -3; FN = [36, -8]; FF = [42, -12]; HN = [-50, -6]; HF = [-44, -10];
          hox = 10; hoy = 1; mo = 'roar'; fl = 1.7; flDeg = -55; tl = [-14, -1, -26, -2 + (f3 - 1), -80]; claws = 1;
        } else if (sk === 2) { bx = -8; by = -23; deg = 6; FN = [14, 0]; FF = [22, 0]; HN = [-22, 0]; HF = [-14, 0]; fl = 1.2; flDeg = -25; }
      } else if (atk === 'burst') {
        mad = 1; mo = 'snarl';
        if (an) { by = -27 - an * 2; ry = 14 + an * 0.7; hoy = -4 + an * 3; hox = 8 - an * 0.5; hdeg = an * 4; FN = [2, 0]; FF = [8, 0]; HN = [-22, 0]; HF = [-16, 0]; fl = 1 + an * 0.45; tl = [-13, -4, -20, -13, -30]; }
        else if (sk === 1) { by = -25; fl = 2.3; spike = 1; mo = 'roar'; hoy = 1; tl = [-13, -4, -20, -13, -30]; }
        else if (sk === 2) fl = 0.5; else fl = 0.8;
      } else if (atk === 'summon') {
        mad = 1; mo = 'snarl';
        if (an) { deg = -4 * an; hoy = -4 - an * 1.5; hox = 8 - an; hdeg = -8 * an; fl = 1 + an * 0.2; }
      } else if (atk === 'swipe') {
        mad = 1; mo = 'snarl';
        if (an) { bx = -10 - an; deg = -4 * an; hdeg = -3 * an; FN = [[37, -32], [38, -50], [31, -66]][an - 1]; claws = 1; armBack = 1; } // tay giơ cao sau đầu, vuốt ló ra
        else if (sk === 1) { bx = -4; by = -26; deg = 7; FN = [40, -12]; claws = 1; mo = 'roar'; }
        else if (sk === 2) { bx = -6; deg = 4; FN = [24, 0]; }
      } else if (w >= 0) {
        // rảo bước nặng nề: chân chéo nhau đi cùng nhịp
        const a = [6, 0, -6, 0][w], up3 = w === 3 ? -3 : 0, up1 = w === 1 ? -3 : 0;
        FN = [4 + a, up3]; HF = [-20 + a, up3]; FF = [11 - a, up1]; HN = [-27 - a, up1];
        by += hop(P); hoy += w === 0 || w === 2 ? 1 : 0;
      }
      const bf = S.fr(bx, by, deg);
      const shN = bf.pt(rx * 0.5, ry * 0.4), shF = bf.pt(rx * 0.72, ry * 0.35), hpN = bf.pt(-rx * 0.68, ry * 0.35), hpF = bf.pt(-rx * 0.45, ry * 0.35);
      if (FNr) FN = [shN[0] + FNr[0], shN[1] + FNr[1]];
      if (FFr) FF = [shF[0] + FFr[0], shF[1] + FFr[1]];
      const nk = bf.pt(rx * 0.85, -ry * 0.5), hx = nk[0] + hox, hy = nk[1] + hoy;
      const hf = S.fr(hx, hy, hdeg);
      const fk = (i) => (f3 + k + i) & 3; // nhịp lay của từng ngọn lửa
      const HOT = mad ? E.glow : B[1]; // than hồng trong vằn, rực lên khi nổi giận
      // một cái chân: ống chân dày và bàn chân tròn
      const leg = (sh, pw, far, cl) => {
        const C = far ? ldFAR : ORG;
        S.part((s) => {
          s.e(sh[0], sh[1], 5.6, 6, C);
          s.cv([sh, [(sh[0] + pw[0]) / 2, (sh[1] + pw[1] - 4) / 2], [pw[0], pw[1] - 4]], 9, 6, C);
          if (pw[1] < -6) { s.l(sh[0], sh[1], pw[0], pw[1] - 3, 7, C); s.e(pw[0] + 1, pw[1] - 3, 7, 5.6, C); } // bàn chân giơ lên thì tròn to hơn
          else s.e(pw[0] + 1.5, pw[1] - 3, 6, 3, C);
          s.in(() => {
            if (!far) for (const q of [0.4, 0.75]) { const x = lerp(sh[0], pw[0], q), y = lerp(sh[1], pw[1] - 5, q); s.g([[x - 5, y - 1], [x + 1, y], [x - 5, y + 2]], Md(ldSTRIPE)); s.p(x - 3, y, HOT); }
            s.p(pw[0] + 1, pw[1] - 1, Dk(C)); s.p(pw[0] + 4, pw[1] - 1, Dk(C)); s.p(pw[0] + 1, pw[1] - 2, Dk(C)); s.p(pw[0] + 4, pw[1] - 2, Dk(C));
          });
        });
        if (cl) S.part((s) => { for (let i = 0; i < 3; i++) s.g([[pw[0] + 3 + i * 2.5, pw[1] - 3], [pw[0] + 6.5 + i * 2.5, pw[1]], [pw[0] + 3 + i * 2.5, pw[1] - 1]], Lt(BONE)); });
      };
      // ---- đuôi, chóp đuôi cháy ----
      const tb = bf.pt(-rx + 2, -4), tm = [tb[0] + tl[0], tb[1] + tl[1]], te = [tb[0] + tl[2], tb[1] + tl[3]];
      const sw = P.dead ? 0 : [0, 1, 0, -1][k];
      S.part((s) => {
        s.cv([tb, [tm[0] - sw, tm[1]], [te[0] + sw, te[1]]], 6, 5, ORG);
        s.in(() => { for (const q of [0.3, 0.55, 0.8]) { const x = lerp(tb[0], te[0], q) + tl[0] * 0.45 * Math.sin(q * 3.14), y = lerp(tb[1], te[1], q) + (tl[1] - tl[3] * 0.5) * 0.45 * Math.sin(q * 3.14); s.l(x - 2, y - 1, x + 2, y + 1, 3, Md(ldSTRIPE)); } });
      });
      if (fl > 0) S.part((s) => { ldFlame(S, S.fr(te[0] + sw, te[1], tl[4]), 0, 3, 8, 10 + fl * 4, fk(1), B); });
      else S.part({ fx: 1 }, (s) => { s.p(te[0] - 1, te[1] - 4, STONE[1]); s.p(te[0] + 1, te[1] - 7, STONE[2]); s.p(te[0] - 2, te[1] - 9, STONE[1]); });
      // ---- hai chân phía xa ----
      leg(hpF, HF, 1, 0); leg(shF, FF, 1, claws && atk === 'slam');
      // ---- lửa dọc sống lưng ----
      if (fl > 0) S.part((s) => {
        const us = [-0.68, -0.38, -0.06, 0.26, 0.54], hs = [9, 12, 14, 13, 10];
        for (let i = 0; i < 5; i++) ldFlame(S, bf.sub(us[i] * rx, -ry + 3, flDeg), 0, 0, 7 + (i & 1) + (fl > 1.5 ? 1 : 0), hs[i] * fl, fk(i), B);
        if (spike) { const f = bf.sub(-2, -ry + 3, 0); ldFlame(S, f, 0, 0, 10, 40, fk(2), B); S.in(() => { f.l(0, -5, 0, -26, 2, E.hot); }); }
      });
      // ---- thân ----
      S.part((s) => {
        bf.e(0, 0, rx, ry, ORG); bf.e(-rx * 0.55, 1, rx * 0.42, ry, ORG); bf.e(rx * 0.55, 0, rx * 0.42, ry, ORG);
        s.in(() => {
          bf.e(2, ry * 0.82, rx * 0.8, ry * 0.34, Md(FUR)); bf.e(4, ry * 0.97, rx * 0.6, ry * 0.2, Lt(FUR));
          for (let i = 0; i < 5; i++) {
            const u = -rx * 0.78 + i * rx * 0.34, L = ry * (i & 1 ? 1.05 : 1.4);
            bf.g([[u - 3, -ry - 1], [u + 3, -ry - 1], [u + 1.5, -ry + L]], Md(ldSTRIPE));
            bf.l(u, -ry + 3, u + 1, -ry + L * 0.62, 1, HOT);
          }
          bf.g([[-rx - 1, -2], [-rx + 7, 0], [-rx - 1, 3]], Md(ldSTRIPE));
        });
      });
      // ---- chân sau phía gần ----
      leg(hpN, HN, 0, 0);
      if (armBack) leg(shN, FN, 0, claws);
      // ---- bờm lửa sau gáy ----
      if (fl > 0) S.part((s) => {
        const M = [[-14, 5, -112], [-15, -4, -78], [-11, -10, -48], [-4, -14, -18]];
        M.forEach((m, i) => ldFlame(S, hf.sub(m[0], m[1], m[2] + flDeg * 0.4), 0, 2, 7, (9 + (i & 1) * 3) * Math.min(fl, 1.8), fk(i + 2), B));
      });
      // ---- tai ----
      S.part((s) => {
        hf.e(-10, -12, 5, 5, ORG); hf.e(7, -13.5, 5, 5, ORG);
        s.in(() => { hf.e(-10, -11, 2.4, 2.4, Md(FUR)); hf.e(7, -12.5, 2.4, 2.4, Md(FUR)); hf.l(-13, -16, -8, -17, 2, Md(ldSTRIPE)); hf.l(4, -17, 9, -18, 2, Md(ldSTRIPE)); });
      });
      // ---- hàm dưới khi há miệng ----
      if (mo === 'roar' || mo === 'pant') S.part((s) => { hf.e(9.5, mo === 'roar' ? 15 : 12.5, 8.5, mo === 'roar' ? 6.5 : 4.4, FUR); });
      // ---- đầu to, má xù, mõm trắng, vằn chữ vương ----
      S.part((s) => {
        hf.e(0, 0, 16, 14, ORG);
        hf.g([[-14, 1], [-21, 7], [-12, 10]], ORG); hf.g([[-11, 7], [-16, 15], [-4, 13]], ORG);
        hf.e(10, 8, 8, 5.6, ORG);
        s.in(() => {
          hf.e(-11, 10, 7, 5, Md(FUR)); hf.e(9.5, 8.5, 8, 5, Md(FUR)); hf.e(10, 7.5, 5.5, 2.8, Lt(FUR));
          hf.g([[-17, -7], [-8, -4], [-17, -1]], Md(ldSTRIPE)); hf.g([[-16, 3], [-8, 4], [-15, 7]], Md(ldSTRIPE));
          hf.g([[-9, -14], [-5, -7], [-3, -15]], Md(ldSTRIPE)); hf.g([[13, -13], [12, -8], [16, -9]], Md(ldSTRIPE));
          hf.r(4, -13, 6, 1, Md(ldSTRIPE)); hf.r(5, -11, 4, 1, Md(ldSTRIPE)); hf.r(4, -9, 6, 1, Md(ldSTRIPE)); hf.r(6, -13, 2, 5, Md(ldSTRIPE));
          hf.p(6, -11, HOT); hf.p(7, -11, HOT); hf.l(-14, -4, -11, -4, 1, HOT); hf.l(-13, 5, -11, 5, 1, HOT); hf.p(-6, -11, HOT);
        });
      });
      // ---- mặt ----
      S.flat((s) => {
        const e1 = hf.pt(1, -2), e2 = hf.pt(12, -2);
        const eo = P.dead ? { x: 1 } : P.bl ? { shut: 1 } : { look: [1, 0], col: '#fff3c4', lid: lid || (mad ? 0 : 1), brow: mad ? 'angry' : lid ? 'sad' : null };
        eye(s, e1[0], e1[1], Object.assign({ w: 7, h: 7 }, eo));
        eye(s, e2[0], e2[1], Object.assign({ w: 5, h: 7, side: -1 }, eo));
        hf.r(8, 4, 4, 2, PINK[0]); hf.r(9, 6, 2, 1, PINK[0]); // mũi
        const Wt = '#ffffff';
        if (mo === 'roar') {
          hf.g([[2, 8], [17, 8], [17, 17], [13, 21], [6, 21], [2, 17]], INK);
          hf.g([[3, 9], [16, 9], [16, 17], [13, 20], [6, 20], [3, 17]], MOUTH);
          hf.e(9.5, 17.5, 4, 2, TONGUE);
          hf.r(4, 9, 2, 4, Wt); hf.r(14, 9, 2, 4, Wt); hf.p(7, 9, Wt); hf.p(9, 9, Wt); hf.p(10, 9, Wt); hf.p(12, 9, Wt);
          hf.r(5, 17, 2, 2, Wt); hf.r(13, 17, 2, 2, Wt);
        } else if (mo === 'pant') {
          hf.r(5, 9, 10, 4, INK); hf.r(6, 10, 8, 2, MOUTH); hf.r(8, 11, 4, 4 + (k & 1), TONGUE); hf.p(6, 10, Wt); hf.p(13, 10, Wt);
        } else if (mo === 'snarl') {
          hf.r(4, 9, 13, 3, INK); for (let i = 0; i < 6; i++) hf.p(5 + i * 2, 10, Wt);
          hf.r(5, 10, 2, 3, Wt); hf.r(14, 10, 2, 3, Wt);
        } else {
          hf.l(10, 7, 10, 8, 1, INK); hf.l(6, 10, 9, 10, 1, INK); hf.l(11, 10, 14, 10, 1, INK); hf.p(5, 9, INK); hf.p(15, 9, INK); hf.p(10, 9, INK);
          if (!P.dead) { hf.r(6, 11, 1, 2, Wt); hf.r(14, 11, 1, 2, Wt); }
        }
      });
      // ---- chân trước phía gần (vẽ sau cùng để giơ lên che được đầu) ----
      if (!armBack) leg(shN, FN, 0, claws);
      // ---- hiệu ứng theo đòn ----
      if (atk === 'swipe' && sk === 1) S.part({ fx: 1 }, (s) => {
        for (let j = 0; j < 3; j++) s.cv([[22 + j * 4, -56 + j * 2], [42 + j * 3, -42 + j * 2], [49 + j, -20 + j * 3]], 1, 2, j === 1 ? '#ffffff' : E.glow);
      });
      if (atk === 'slam' && sk === 1) S.part({ fx: 1 }, (s) => {
        for (let j = 0; j < 7; j++) { const x = 12 + j * 5 + hsh(j) * 3, h = 3 + hsh(j * 3.3) * 6; s.l(x, -1, x + (j - 3) * 0.8, -1 - h, 1, j & 1 ? E.glow : B[1]); }
      });
    },
  };

  // ====================================================================
  // 4C-3. TRÙM LÂU ĐÀI: HỒ TINH (cáo chín đuôi Hồ Tây)
  // ====================================================================
  const ldFUR2 = ['#9c949c', '#d6d0cc', '#f2eee8']; // lông trắng ở lớp phía sau, hơi tối
  const ldTALI = ['#b0902e', '#f0d870', '#fff6c0']; // giấy bùa vàng
  const ldMIASMA = ['#3d1d55', '#6b3a8f', '#a56fd0']; // chướng khí tím của giáp độc
  // Khung xương của Hồ Tinh theo tư thế Q: thân, đầu, bốn chân, các đuôi. Dùng chung cho hàm vẽ và hàm anchor.
  function ldHoGeo(Q) {
    const cr = Math.max(0, Q.crouch), st = clamp01(Q.stretch), tired = clamp01(Q.tired);
    const bx = -3, by = -21 - Q.lift + cr * 6 - Q.breath * 0.7, rx = 15 + st * 5, ry = 8.5 - st * 1.5, deg = -Q.pitch * 25;
    const r = deg * D2R, cs = Math.cos(r), sn = Math.sin(r);
    const pt = (u, v) => [bx + u * cs - v * sn, by + u * sn + v * cs];
    const nk = pt(rx * 0.8, -ry * 0.7);
    const head = [nk[0] + 7 + Q.headX + tired * 2, nk[1] - 7 + Q.headY + tired * 9];
    const hdeg = -Q.headTilt * 40 + tired * 12;
    // bàn chân theo kiểu đứng, chạy, bay
    const F = [
      [[11, 0], [15, 0], [-15, 0], [-11, 0]],          // 0 đứng
      [[21, -3], [24, -6], [-21, 0], [-17, 0]],        // 1 chạy: chân trước vươn, chân sau đạp
      [[15, 0], [19, 0], [-8, -5], [-4, -6]],          // 2 chạy: chân trước chạm đất, chân sau thu về
      [[5, 0], [9, -2], [-3, 0], [1, 0]],              // 3 chạy: bốn chân chụm dưới bụng
      [[15, -7], [18, -9], [-17, 0], [-13, 0]],        // 4 chạy: bật lên
      [[27, -13], [30, -15], [-29, -11], [-26, -13]],  // 5 bay: duỗi dài
      [[10, -8], [13, -9], [-8, -7], [-5, -8]],        // 6 bay: co chân
    ][Math.max(0, Math.min(6, Math.round(Q.feet)))];
    const air = Q.feet >= 5 ? 1 : 0;
    const paw = F.map((q) => [q[0], q[1] - (air ? Q.lift : Math.min(0, q[1]) ? 0 : 0) - (Q.feet < 5 && Q.lift ? Q.lift * 0.6 : 0)]);
    const joint = [pt(rx * 0.6, ry * 0.4), pt(rx * 0.82, ry * 0.3), pt(-rx * 0.66, ry * 0.4), pt(-rx * 0.44, ry * 0.3)];
    // các đuôi
    const n = Math.max(0, Math.min(9, Q.n)), cnt = Math.ceil(n - 0.001), ring = clamp01(Q.ring), droop = clamp01(Q.droop + tired * 0.7);
    const tb = pt(-rx + 3, -2), rc = [bx, by - 4];
    const span = cnt > 1 ? 112 * Q.fan * Math.min(1, (cnt - 1) / 5 + 0.3) : 0, mid = -118 - droop * 48;
    const tails = [];
    for (let i = 0; i < cnt; i++) {
      const t = cnt > 1 ? i / (cnt - 1) : 0.5;
      const a = lerp(mid - span / 2 + span * t, -90 + Q.spin + (i * 360) / cnt, ring) * D2R, dx = Math.cos(a), dy = Math.sin(a);
      const base = [lerp(tb[0], rc[0] + dx * 7, ring), lerp(tb[1], rc[1] + dy * 7, ring)];
      const L = 42 * Q.tlen * (i === cnt - 1 && n < cnt ? n - (cnt - 1) : 1) * lerp(0.9 + 0.1 * Math.sin(t * 3.14), 0.86, ring);
      const bend = ((i & 1 ? 1 : -1) * 3 + Q.sway * 3 * Math.sin(i * 1.7 + 0.6)) * (1 - ring * 0.5);
      const lx = Q.lagX * 9 * (1 - ring), ly = Q.lagY * 9 * (1 - ring) + droop * L * 0.3;
      const p1 = [base[0] + dx * L * 0.38 - dy * bend + lx * 0.15, base[1] + dy * L * 0.38 + dx * bend + ly * 0.15];
      const p2 = [base[0] + dx * L * 0.72 + dy * bend * 0.6 + lx * 0.55, base[1] + dy * L * 0.72 - dx * bend * 0.6 + ly * 0.55];
      const tip = [base[0] + dx * L + lx, base[1] + dy * L + ly];
      if (ring < 0.5) { tip[1] = Math.min(tip[1], -4); p2[1] = Math.min(p2[1], -4); } // đuôi rũ không chui xuống đất
      tails.push({ i, base, p1, p2, tip, deg: Math.atan2(tip[1] - p2[1], tip[0] - p2[0]) / D2R + 90, L });
    }
    return { bx, by, rx, ry, deg, pt, nk, head, hdeg, paw, joint, tails, tb, rc, tired, droop, ring };
  }

  BOSS.ho = {
    name: 'Hồ Tinh', size: [188, 134], org: [96, 114], top: 76, sh: 24,
    // ----- Tư thế Q (số liên tục, trừ feet và eye) -----
    pose() {
      return {
        feet: 0,     // kiểu chân: 0 đứng, 1..4 bốn khung chạy, 5 bay duỗi dài (vồ), 6 bay co chân (nhảy lùi, ảo ảnh)
        crouch: 0,   // 0..1: hạ thân xuống, chân gập (lấy đà vồ, tiếp đất); cho tới 1.5 là nằm rạp
        stretch: 0,  // 0..1: thân duỗi dài (đang bay tới)
        pitch: 0,    // -1..1: dương là ngẩng thân trước, âm là chúi đầu chổng mông
        lift: 0,     // điểm ảnh: thân bay lên khỏi mặt đất (đòn nova), khoảng 0..12
        breath: 0,   // 0..1: nhịp thở
        headX: 0, headY: 0, // điểm ảnh: đầu lệch đi, khoảng -8..8 (headY dương là cúi)
        headTilt: 0, // -1..1: dương là ngửa đầu ra sau (hú), âm là cúi gằm
        ears: 0,     // 0..1: tai cụp ra sau
        mouth: 0,    // 0..1: 0 ngậm, 0.35 nhe nanh, 0.7 há to (cắn), 1 hú
        blink: 0,    // 0..1: từ 0.8 là nhắm hẳn
        eye: 'normal', // 'normal' | 'angry' | 'dazed' (choáng) | 'dead'
        tired: 0,    // 0..1: thở dốc, đầu cúi thấp, lưỡi thè, đuôi rũ
        n: 9,        // số đuôi còn lại 9..0; số lẻ thì đuôi cuối ngắn dần (tắt từng cái)
        fan: 1,      // độ xoè quạt đuôi: 0 chụm, 1 thường, 1.4 xoè hết cỡ
        tlen: 1,     // hệ số chiều dài đuôi
        lagX: 0, lagY: 0, // -1..1: chóp đuôi trễ lại phía sau chuyển động
        sway: 0,     // -1..1: đuôi uốn lượn
        droop: 0,    // 0..1: đuôi rũ xuống
        tipB: null,  // bộ ba màu chóp đuôi (mặc định màu lửa, hoặc màu hệ đang kháng)
        flare: 0,    // 0..1: chóp đuôi bùng to
        ring: 0,     // 0..1: đuôi xếp thành bánh xe sau lưng (đòn nova)
        spin: 0,     // độ: góc quay của bánh xe đuôi
        burst: 0,    // 0..1: bánh xe đuôi nổ tia ra ngoài theo màu chóp
        big: 0,      // 0/1: dáng cuồng nộ (lông dựng, lửa nhiều, mắt rực)
        orb: 0,      // 0..1: góc quay của ba lá bùa hộ thân (aR)
        pulse: 0.5,  // 0..1: nhịp đập của viên ngọc điểm yếu
      };
    },
    // Các điểm mốc (tính từ gốc) để game vẽ thêm hiệu ứng: chóp từng đuôi, miệng, ngọc, mắt thứ ba, tâm bánh xe đuôi.
    anchor(Q0) {
      const Q = Object.assign(this.pose(), Q0 || {}), g = ldHoGeo(Q), h = S0fr(g.head, g.hdeg);
      return { tips: g.tails.map((t) => t.tip), mouth: h(17, 8), eye3: h(6, -9), gem: [g.nk[0] + 4, g.nk[1] + 9], head: g.head, ring: g.rc };
    },
    // X: { phase 0..2, el + E (hệ đang kháng), weak + W (hệ khắc), aR chống bắn xa, aM chống đánh gần, aD đọc né }
    draw(S, Q0, X) {
      const Q = Object.assign(this.pose(), Q0 || {}); X = X || {};
      const g = ldHoGeo(Q), el = X.el || null, E = el ? X.E || ELP[el] : null, W = X.weak ? X.W || ELP[X.weak] : null;
      const big = Q.big ? 1 : 0, ph = X.phase || 0;
      const MK = E ? E.B : RED;                      // màu hoa văn: tai, tất, vệt mắt, dấu trán
      const TB = Q.tipB || (E ? E.B : FIRE);         // màu chóp đuôi
      const AB = E ? E.B : FIRE;                     // màu lửa chân (aM) và lửa mắt
      const flare = clamp01(Q.flare) + big * 0.35, fk = Math.round(Q.sway * 2 + Q.spin / 30) & 3;
      const bf = S.fr(g.bx, g.by, g.deg), hf = S.fr(g.head[0], g.head[1], g.hdeg), rx = g.rx, ry = g.ry;
      const angry = Q.eye === 'angry' || big || ph >= 2, dead = Q.eye === 'dead';
      // ---- lá bùa hộ thân (aR): ba lá bay quanh; lá ở nửa sau vẽ ngay sau đuôi, lá ở nửa trước vẽ cuối cùng ----
      const tali = [];
      if (X.aR) for (let i = 0; i < 3; i++) { const a = (Q.orb * 360 + i * 120 + 35) * D2R; tali.push({ x: 2 + Math.cos(a) * 40, y: g.by - 12 + Math.sin(a) * 20, front: Math.sin(a) > 0, i }); }
      const drawTali = (front) => tali.forEach((q) => {
        if (q.front !== front) return;
        const f = S.fr(q.x, q.y, (q.x - 2) * 0.4);
        S.part((s) => { f.g([[-4, -7], [4, -7], [4, 7], [-4, 7]], ldTALI); S.in(() => { f.l(0, -5, 0, 5, 1, Md(RED)); f.l(-2, -4, 2, -4, 1, Md(RED)); f.l(-2, -1, 2, -1, 1, Md(RED)); f.l(-2, 3, 2, 2, 1, Md(RED)); f.l(-3, 6, 3, 6, 1, Dk(ldTALI)); }); });
        S.part({ fx: 1 }, (s) => { const d = (q.i + fk) & 1; s.p(q.x - 7, q.y - 6 + d * 3, GOLD[2]); s.p(q.x + 7, q.y + 5 - d * 3, GOLD[2]); s.p(q.x + 6 - d * 11, q.y - 10, '#ffffff'); });
      });
      // ---- vòng lửa quanh chân (aM): nửa sau ----
      const footFire = (front) => { for (let i = 0; i < 7; i++) if ((i & 1) === (front ? 0 : 1)) S.part((s) => { ldFlame(S, S, -27 + i * 9, front ? 1 : -2, 6, 9 + ((i + fk) & 1) * 2, fk + i, AB); }); };
      if (X.aM) footFire(false);
      // ---- tia nổ của nova ----
      if (Q.burst > 0) S.part({ fx: 1 }, (s) => {
        for (const t of g.tails) { const a = (t.deg - 90) * D2R, d0 = 9, d1 = 9 + Q.burst * 16; s.l(t.tip[0] + Math.cos(a) * d0, t.tip[1] + Math.sin(a) * d0, t.tip[0] + Math.cos(a) * d1, t.tip[1] + Math.sin(a) * d1, 2, TB[1]); s.l(t.tip[0] + Math.cos(a) * d0, t.tip[1] + Math.sin(a) * d0, t.tip[0] + Math.cos(a) * (d1 - 4), t.tip[1] + Math.sin(a) * (d1 - 4), 1, TB[2]); }
      });
      // ---- các đuôi: lớp sau (số chẵn) rồi lớp trước (số lẻ) ----
      const drawTail = (t) => {
        const C = t.i & 1 ? FUR : ldFUR2;
        S.part((s) => {
          s.cv([t.base, t.p1, t.p2, t.tip], 3, 7, C);
          if (big) { const m = [(t.p1[0] + t.p2[0]) / 2, (t.p1[1] + t.p2[1]) / 2], a = (t.deg - 90) * D2R; s.g([[m[0] - Math.sin(a) * 2, m[1] + Math.cos(a) * 2], [m[0] - Math.sin(a) * 6 - Math.cos(a) * 3, m[1] + Math.cos(a) * 6 - Math.sin(a) * 3], [m[0] + Math.cos(a) * 4, m[1] + Math.sin(a) * 4]], C); }
        });
        if (t.L < 8) return;
        const f = S.fr(t.tip[0], t.tip[1], t.deg), h = 9 + flare * 7;
        S.part((s) => {
          if (el === 'ice') { f.g([[-3.5, 2], [-2, -h * 0.5], [0, -h - 1], [2, -h * 0.5], [3.5, 2], [0, 4]], TB); S.in(() => { f.l(-1, 1, 0, -h + 2, 1, Lt(TB)); f.p(1, -2, Dk(TB)); }); }
          else if (el === 'poison') { f.e(0, -1, 3.6, 4, Md(TB)); f.g([[-3, -2], [0, -h + 1], [3, -2]], Md(TB)); S.in(() => { f.e(-0.5, -1, 1.6, 2, Lt(TB)); f.p(1, 1, Dk(TB)); f.p(0, -h + 2, Md(ldMIASMA)); }); }
          else ldFlame(S, f, 0, 3, 7, h + 2, fk + t.i, TB);
        });
        if (el === 'poison') S.part((s) => { const d = (t.i * 3 + fk) % 5; s.r(Math.round(t.tip[0]) + (t.i & 1 ? 2 : -2), Math.round(t.tip[1]) + 5 + d, 1, 2, Lt(TB)); });
      };
      for (const t of g.tails) if (!(t.i & 1)) drawTail(t);
      for (const t of g.tails) if (t.i & 1) drawTail(t);
      drawTali(false);
      // ---- chân: đùi to, ống chân thon, đi tất màu hoa văn ----
      const leg = (k, far) => {
        const J = g.joint[k], P = g.paw[k], C = far ? ldFUR2 : FUR, hind = k >= 2;
        const top = [P[0], P[1] - 2], d = Math.hypot(top[0] - J[0], top[1] - J[1]), bend = Math.max(1.2, (16 - d) * 0.9) * (hind ? -1 : 0.6);
        const kn = [(J[0] + top[0]) / 2 + bend, (J[1] + top[1]) / 2 - (hind ? 1 : 0)];
        S.part((s) => {
          s.e(J[0], J[1], hind ? 4.2 : 3, hind ? 4.8 : 3.4, C);
          s.cv([J, kn, top], 4, 3, C);
          s.e(P[0] + 1, P[1] - 1.6, 3, 1.6, C);
          s.in(() => { s.e(P[0] + 0.5, P[1] - 2, 3.5, 3.6, far ? Dk(MK) : Md(MK)); if (!far) s.p(P[0] + 1, P[1] - 4, Lt(MK)); });
        });
        if (X.aM || el === 'fire') S.part((s) => { ldFlame(S, S, P[0] + 1, P[1] - 1, 5, 7, fk + k, AB); S.in(() => { s.r(P[0] - 1, P[1] - 2, 5, 2, far ? Dk(MK) : Md(MK)); }); });
      };
      leg(3, 1); leg(1, 1);
      // ---- thân ----
      if (big) S.part((s) => { for (let i = 0; i < 3; i++) { const u = -rx * 0.55 + i * rx * 0.4; bf.g([[u - 3, -ry + 3], [u - 4, -ry - 5 - (i & 1) * 2], [u + 4, -ry + 3]], FUR); } });
      S.part((s) => {
        bf.e(0, -1, rx, ry - 1.6, FUR); bf.e(-rx * 0.5, 0.5, rx * 0.5, ry, FUR); bf.e(rx * 0.55, -1, rx * 0.5, ry + 0.5, FUR);
        s.in(() => {
          bf.e(0, ry * 0.9, rx * 0.8, ry * 0.3, Dk(FUR));
          // hoa văn mây cuộn trên hông, hai nét lửa trên vai
          bf.cv([[-rx * 0.8, -1], [-rx * 0.62, -5], [-rx * 0.36, -3], [-rx * 0.42, 1], [-rx * 0.56, 0]], 2, 1, Md(MK));
          bf.p(-rx * 0.36, -3, Lt(MK)); bf.p(-rx * 0.3, 2, Md(MK));
          bf.g([[rx * 0.02, -ry], [rx * 0.2, -ry], [rx * 0.16, -ry * 0.3]], Md(MK)); bf.g([[rx * 0.26, -ry], [rx * 0.4, -ry], [rx * 0.38, -ry * 0.5]], Md(MK));
          if (ph >= 1 || big) { bf.g([[-rx * 0.2, -ry], [-rx * 0.08, -ry], [-rx * 0.1, -ry * 0.5]], Md(MK)); bf.l(-rx * 0.95, 2, -rx * 0.8, 4, 1, Md(MK)); }
        });
      });
      leg(2, 0); leg(0, 0);
      // ---- cổ ----
      S.part((s) => { const a = bf.pt(rx * 0.62, -3); s.cv([a, [(a[0] + g.head[0]) / 2 - 1, (a[1] + g.head[1]) / 2 + 2], [g.head[0] - 3, g.head[1] + 4]], 10, 8, FUR); });
      // ---- cổ: yếm lông, hoặc giáp hệ ----
      const cp = (u, v) => bf.pt(rx * 0.72 + u, v);
      if (!el) S.part((s) => {
        const c = cp(0, 1);
        s.g([[c[0] - 5, c[1] - 7], [c[0] + 6, c[1] - 5], [c[0] + 7, c[1] + 1], [c[0] + 4, c[1]], [c[0] + 4, c[1] + 6], [c[0] + 1, c[1] + 3], [c[0] - 1, c[1] + 8], [c[0] - 3, c[1] + 3], [c[0] - 6, c[1] + 4]], Lt(FUR));
        s.in(() => { s.l(c[0] - 3, c[1] - 1, c[0] - 2, c[1] + 4, 1, Md(FUR)); s.l(c[0] + 2, c[1] - 1, c[0] + 2, c[1] + 2, 1, Md(FUR)); });
      });
      else {
        // vòng giáp quanh cổ: 6 chỗ từ gáy xuống ngực
        const R = [[-7, -9, -150], [-2, -11, -100], [-8, -3, -200], [-5, 4, -235], [1, 8, 170], [6, 5, 120]];
        R.forEach((q, i) => {
          const c = cp(q[0], q[1]), a = q[2] * D2R, ox = Math.cos(a), oy = Math.sin(a);
          if (el === 'fire') S.part((s) => { ldFlame(S, S.fr(c[0], c[1], lerp(q[2] + 90, -20, 0.55)), 0, 2, 6, 9 + (i & 1) * 2 + flare * 3, fk + i, E.B); });
          else if (el === 'ice') S.part((s) => { const L = 8 + (i & 1) * 3; s.g([[c[0] - oy * 2.5, c[1] + ox * 2.5], [c[0] + ox * L, c[1] + oy * L], [c[0] + oy * 2.5, c[1] - ox * 2.5], [c[0] - ox * 2, c[1] - oy * 2]], E.B); s.in(() => { s.l(c[0], c[1], c[0] + ox * (L - 2), c[1] + oy * (L - 2), 1, Lt(E.B)); }); });
          else S.part((s) => { s.e(c[0] + ox * 2, c[1] + oy * 2, 3.6 + (i & 1), 3.2, i & 1 ? ldMIASMA : E.B); s.in(() => { s.p(c[0] + ox * 2 - 1, c[1] + oy * 2 - 1, Lt(i & 1 ? ldMIASMA : E.B)); }); });
        });
        if (el === 'poison') S.part({ fx: 1 }, (s) => { for (let i = 0; i < 5; i++) { const c = cp(-8 + hsh(i * 2.3) * 14, -14 - hsh(i * 4.1) * 8); s.p(c[0], c[1], i & 1 ? E.glow : ldMIASMA[2]); } });
      }
      // ---- vòng cổ đỏ và viên ngọc (điểm yếu thì ngọc to, rực màu hệ khắc) ----
      const gm = [g.nk[0] + 4, g.nk[1] + 9], gr = W ? 3.4 + Q.pulse * 1.2 : 2.4;
      if (W) S.part({ fx: 1 }, (s) => { s.e(gm[0], gm[1], gr + 2.6, gr + 2.6, mixHex(W.glow, '#2a2530', 0.45)); });
      S.part((s) => { s.l(g.nk[0] - 3, g.nk[1] + 2, gm[0] - 1, gm[1] - 1, 2, Md(el ? GOLD : RED)); });
      S.part({ ol: GOLD[0] }, (s) => {
        s.e(gm[0], gm[1], gr, gr, W ? Md(W.B) : Md(SHELL));
        s.in(() => { s.e(gm[0] - 0.5, gm[1] - 0.5, gr * 0.55, gr * 0.55, W ? W.glow : SHELL[2]); s.p(gm[0] - 1, gm[1] - 1, '#ffffff'); if (W) s.p(gm[0] + 1, gm[1] + 2, Dk(W.B)); });
      });
      if (W) S.part({ fx: 1 }, (s) => { const d = gr + 3 + Q.pulse * 2; for (const q of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { s.p(gm[0] + q[0] * d, gm[1] + q[1] * d, W.hot); s.p(gm[0] + q[0] * (d - 1), gm[1] + q[1] * (d - 1), W.glow); } });
      // ---- tai dài ----
      const eb = clamp01(Q.ears + g.tired * 0.5);
      S.part((s) => {
        const t1 = [-10 - eb * 9, -22 + eb * 11], t2 = [5 - eb * 12, -23 + eb * 12];
        hf.g([[-10, -3], t1, [-2, -9]], FUR); hf.g([[-1, -9], t2, [9, -6]], FUR);
        S.in(() => {
          hf.g([[-8, -6], [lerp(-7, t1[0], 0.78), lerp(-6, t1[1], 0.78)], [-4, -9]], Md(MK)); hf.g([[1, -9], [lerp(3, t2[0], 0.78), lerp(-9, t2[1], 0.78)], [6, -8]], Md(MK));
          hf.l(t1[0], t1[1], lerp(-6, t1[0], 0.85), lerp(-6, t1[1], 0.85), 1, Dk(MK)); hf.l(t2[0], t2[1], lerp(3, t2[0], 0.85), lerp(-8, t2[1], 0.85), 1, Dk(MK));
        });
      });
      // ---- hàm dưới khi há miệng ----
      const mo = Q.mouth, op = mo >= 0.85 ? 6 : mo >= 0.5 ? 2 + (mo - 0.5) * 9 : g.tired > 0.5 ? 2 : 0;
      if (op) S.part((s) => {
        hf.g([[5, 7], [17, 7], [15, 8 + op], [5, 10]], Md(MOUTH));
        hf.g([[4, 9], [6, 8 + op * 0.5], [15, 8 + op], [14, 10 + op], [4, 12]], FUR);
        S.in(() => { hf.l(7, 8 + op * 0.6, 12, 8 + op * 0.9, 1, TONGUE); });
      });
      // ---- đầu: má xù, mõm nhọn ----
      S.part((s) => {
        hf.e(0, 0, 12, 10.5, FUR);
        hf.g([[-10, 0], [-18 - big * 2, 5], [-10, 6]], FUR); hf.g([[-10, 5], [-15 - big * 2, 12], [-3, 10]], FUR);
        if (big) hf.g([[-11, -4], [-18, -4], [-11, 1]], FUR);
        hf.g([[4, -2], [19, 4], [18, 8], [5, 10]], FUR);
        S.in(() => {
          hf.e(-7, 9, 6, 2.6, Dk(FUR)); hf.l(6, 9, 16, 8, 1, Dk(FUR));
          hf.l(-4, -3, -7, -6, 2, Md(MK)); hf.p(-9, -7, Md(MK)); // vệt mắt xếch
          hf.l(-5, 3, -9, 5, 1, Md(MK)); hf.l(-5, 5, -8, 7, 1, Md(MK)); // hai nét trên má
        });
      });
      // ---- mặt ----
      S.flat((s) => {
        const e1 = hf.pt(1, -1), e2 = hf.pt(10, -1), Wt = '#ffffff';
        let eo;
        if (dead) eo = { x: 1 };
        else if (Q.blink >= 0.8) eo = { shut: 1 };
        else if (Q.eye === 'dazed') eo = { col: Wt, pup: 'dot', look: [fk & 1 ? 1 : -1, fk & 2 ? 1 : -1], brow: 'sad' };
        else eo = { look: [1, 0], col: angry ? '#fff6c0' : '#ffe36a', pc: angry ? '#8c1c1f' : INK, pup: 'slit', lid: angry ? 0 : g.tired > 0.5 ? 2 : 1, brow: angry ? 'angry' : g.tired > 0.5 ? 'sad' : null };
        eye(s, e1[0], e1[1], Object.assign({ w: 7, h: 5 }, eo));
        eye(s, e2[0], e2[1], Object.assign({ w: 3, h: 5, side: -1 }, eo));
        // lửa mắt khi cuồng nộ hoặc từ giai đoạn 1
        if ((big || ph >= 1) && !dead) { hf.l(-4, -4, -7 - big * 2, -7 - big * 2, 2, AB[1]); hf.l(-5, -5, -8 - big * 2, -9 - big * 2, 1, AB[2]); if (big) hf.p(-11, -12, AB[1]); }
        hf.r(17, 4, 2, 2, INK); // mũi
        if (op) { hf.r(15, 8, 1, 2, Wt); hf.p(12, 8, Wt); hf.p(14, 7 + op, Wt); hf.p(11, 7 + op, Wt); if (g.tired > 0.5) hf.r(9, 9 + op, 2, 2 + (Q.breath > 0.5 ? 1 : 0), TONGUE); }
        else if (mo >= 0.2) { hf.l(8, 9, 17, 8, 1, INK); hf.l(8, 11, 15, 10, 1, INK); hf.l(9, 10, 16, 9, 1, Wt); hf.p(11, 10, INK); hf.p(13, 10, INK); hf.r(15, 9, 1, 2, Wt); }
        else { hf.l(10, 9, 17, 8, 1, INK); hf.p(9, 8, INK); }
        // dấu đỏ trên trán, hoặc mắt thứ ba (aD)
        const m3 = hf.pt(6, -9);
        if (X.aD) eye(s, m3[0], m3[1], { w: 5, h: 5, look: [0, 0], col: Wt, pc: MK[0], rim: INK, glow: '#ffd75a', nohl: 1 });
        else { hf.p(6, -9, MK[2]); hf.r(5, -8, 3, 1, MK[1]); hf.r(5, -7, 3, 1, MK[1]); hf.p(6, -6, MK[0]); }
      });
      if (Q.eye === 'dazed') S.part({ fx: 1 }, (s) => { for (let i = 0; i < 3; i++) { const q = hf.pt(-6 + i * 7, -22 - (i & 1) * 3 - (fk & 1)); s.p(q[0], q[1], '#fff0b0'); s.p(q[0] - 1, q[1], GOLD[1]); s.p(q[0] + 1, q[1], GOLD[1]); s.p(q[0], q[1] - 1, GOLD[1]); s.p(q[0], q[1] + 1, GOLD[1]); } });
      // ---- lớp phía trước: lửa chân, lá bùa ----
      if (X.aM) footFire(true);
      drawTali(true);
    },
    demos: [
      { id: 'idle', label: 'Đứng yên, 9 đuôi', Q: {}, X: {} },
      { id: 'run', label: 'Chạy', Q: { feet: 1, stretch: 0.4, lagX: -0.8, lagY: 0.2, fan: 0.8, ears: 0.5, eye: 'angry' }, X: {} },
      { id: 'pounceCrouch', label: 'Vồ: thu mình', Q: { crouch: 1, pitch: -0.3, headY: 3, ears: 1, eye: 'angry', mouth: 0.35, fan: 0.7, lagY: -0.4 }, X: {} },
      { id: 'pounceLeap', label: 'Vồ: bay tới', Q: { feet: 5, stretch: 1, pitch: 0.25, eye: 'angry', mouth: 0.7, ears: 1, lagX: -1, lagY: 0.3, fan: 0.6 }, X: {} },
      { id: 'pounceLand', label: 'Vồ: tiếp đất', Q: { crouch: 1.2, pitch: -0.15, headY: 4, eye: 'angry', mouth: 0.35, lagY: -0.8, fan: 1.2 }, X: {} },
      { id: 'foxFire', label: 'Hồ hỏa: xoè đuôi hú', Q: { fan: 1.4, flare: 1, headTilt: 0.9, mouth: 1, ears: 0.8, eye: 'angry', pitch: 0.2 }, X: {} },
      { id: 'novaRing', label: 'Nova: đuôi xoay vòng', Q: { ring: 1, spin: 20, lift: 9, feet: 6, flare: 0.6, eye: 'angry', mouth: 0.35, tipB: ELP.ice.B }, X: {} },
      { id: 'novaBurst', label: 'Nova: nổ', Q: { ring: 1, spin: 50, lift: 9, feet: 6, flare: 1, burst: 1, eye: 'angry', mouth: 1, headTilt: 0.4, tipB: ELP.ice.B }, X: {} },
      { id: 'bite', label: 'Cắn: há hàm', Q: { feet: 4, stretch: 0.6, headX: 4, mouth: 0.75, eye: 'angry', ears: 1, lagX: -0.7, fan: 0.7 }, X: {} },
      { id: 'biteSnap', label: 'Cắn: ngoạm', Q: { feet: 2, stretch: 0.3, headX: 6, headY: 2, mouth: 0.35, eye: 'angry', ears: 1, lagX: -0.4 }, X: {} },
      { id: 'hop', label: 'Nhảy lùi', Q: { feet: 6, pitch: 0.3, lagX: 0.8, lagY: 0.5, ears: 0.4 }, X: {} },
      { id: 'howl', label: 'Hú chuyển giai đoạn', Q: { headTilt: 1, mouth: 1, pitch: 0.35, ears: 1, eye: 'angry', fan: 1.25, flare: 0.5 }, X: { phase: 1 } },
      { id: 'tired', label: 'Mệt, thở dốc', Q: { tired: 1, crouch: 0.4, breath: 1 }, X: {} },
      { id: 'tails3', label: 'Chỉ còn 3 đuôi', Q: { n: 3 }, X: { phase: 2 } },
      { id: 'rage', label: 'Cuồng nộ', Q: { big: 1, mouth: 0.35, fan: 1.2 }, X: { phase: 2 } },
      { id: 'elFire', label: 'Kháng Lửa, yếu Băng', Q: {}, X: { el: 'fire', weak: 'ice' } },
      { id: 'elPoison', label: 'Kháng Độc, yếu Lửa', Q: {}, X: { el: 'poison', weak: 'fire' } },
      { id: 'elIce', label: 'Kháng Băng, yếu Độc', Q: {}, X: { el: 'ice', weak: 'poison' } },
      { id: 'aR', label: 'Chống bắn xa: bùa hộ thân', Q: {}, X: { aR: 1 } },
      { id: 'aM', label: 'Chống đánh gần: vòng lửa chân', Q: {}, X: { aM: 1 } },
      { id: 'aD', label: 'Đọc cú né: mắt thứ ba', Q: {}, X: { aD: 1 } },
      { id: 'all', label: 'Bật hết', Q: { eye: 'angry', mouth: 0.35 }, X: { el: 'ice', weak: 'poison', aR: 1, aM: 1, aD: 1, phase: 1 } },
      { id: 'dazed', label: 'Choáng', Q: { eye: 'dazed', tired: 0.6, crouch: 0.6, mouth: 0 }, X: {} },
      { id: 'dead', label: 'Gục, đuôi tắt hết', Q: { eye: 'dead', n: 0, crouch: 1.5, headY: 6, ears: 1 }, X: { phase: 2 } },
    ],
  };
  // điểm trong hệ con của đầu, không cần khung vẽ (cho anchor)
  function S0fr(o, deg) { const r = deg * D2R, cs = Math.cos(r), sn = Math.sin(r); return (u, v) => [o[0] + u * cs - v * sn, o[1] + u * sn + v * cs]; }

  // ====================================================================
  // 9. XUẤT RA
  // ====================================================================
  const P0 = { w: -1, br: 0, bl: 0, an: 0, sk: 0, lg: 0, tl: 0, dead: 0 };
  function buildMon(reg, role, P, el) {
    const D = MON[reg][role];
    const S = new Spr(D.size[0], D.size[1], D.org[0], D.org[1]);
    D.draw(S, Object.assign({}, P0, P), { el: el || null, E: el ? ELP[el] : null });
    S.finish();
    return S.toCanvas();
  }
  // Dựng một hình bất kỳ từ khai báo D (quái, trùm nhỏ, trùm): trả về { cv, ox, oy, bb }.
  function build(D, a, b) {
    const S = new Spr(D.size[0], D.size[1], D.org[0], D.org[1]);
    D.draw(S, a, b);
    S.finish();
    return S.toCanvas();
  }
  G.monsterArt = { Spr, MON, MINI, BOSS, ELP, buildMon, build, pal: { INK } };
})();
