// Quái và trùm vẽ lại cho cùng nét với em bé tinh linh và vũ khí sống.
// Nạp SAU art.js thì thay G.art.enemy, G.art.boss và G.art.proj (chỉ phần đạn của quái xạ thủ);
// hàm cũ giữ ở G.art.enemyOld, G.art.bossOld, G.art.projOld. Bản mới lỗi thì tự gọi lại hàm cũ.
// Chữ ký và mọi trường hoạt ảnh đọc từ quái, trùm giữ đúng như art.js cũ. Không sửa luật chơi, không dùng G.rnd.
// File tự đứng một mình: tờ phác thảo cũng nạp chính file này. Mục lục: 1 bộ vẽ, 2 bảng màu, 3 mắt miệng,
// 4 quái ba vùng (kèm trùm nhỏ và hình trùm), 8 vẽ trong game (quái, trùm nhỏ, Mộc Tinh, Ngư Tinh, Hồ Tinh), 9 nối vào game.
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
    name: 'Mộc Tinh', size: [240, 176], org: [134, 150], top: 122, sh: 34,
    // ----- Tư thế Q (mọi trường là số liên tục, trừ eye) -----
    pose() {
      return {
        lean: 0,     // -1..1: thân nghiêng sang trái (âm) hay phải (dương), ngọn lệch tối đa khoảng 14 điểm ảnh
        slump: 0,    // 0..1: thân trên sụp xuống (mệt, lộ sơ hở, cúi cắm tay xuống đất)
        breath: 0,   // 0..1: nhịp thở, nửa thân trên nhô lên một chút
        sway: 0,     // -1..1: dây leo, rêu, lửa mắt đung đưa
        eye: 'normal', // 'normal' | 'angry' | 'tired' (mệt, mí sụp) | 'dazed' (choáng, mắt xoáy) | 'dead'
        blink: 0,    // 0..1: mí sụp dần, từ 0.8 là nhắm hẳn
        lookX: -1, lookY: 0, // -1..1: hướng nhìn
        eyeGlow: 0,  // 0..1: mắt rực lên (từ 0.5 có lửa ở đuôi mắt); phase 1 trở đi luôn rực
        mouth: 0,    // 0..1: 0 ngậm, 0.3 nói, 0.6 quát, 1 gầm
        core: 0.3,   // 0..1: lõi nhựa sáng trong miệng; trên 0.75 mà miệng mở to thì lõi lòi hẳn ra (lúc lộ sơ hở)
        la1: 42, la2: 100, // góc bắp tay và cẳng tay TRÁI (độ): 0 là chĩa ngang ra ngoài, 90 chĩa xuống, -90 chĩa lên, trên 90 là gập vào trong
        ra1: 42, ra2: 100, // như trên cho tay PHẢI (tự lật gương)
        gripL: 0, gripR: 0, // 0..1: nắm ngón cành lại
        whip: 0,     // 0..1: tay trái hoá roi dây leo, 1 là vươn tới hẳn điểm (whipX, whipY)
        whipX: -120, whipY: -8, // đầu roi, tính từ gốc (giữa chân). Khung vẽ chỉ chứa tới x = -132; trong game roi dài do 81-moc.js vẽ riêng theo toạ độ thế giới
        stub: 0,     // 1: bàn tay trái không vẽ ngón, chỉ còn mấu xanh làm gốc roi (để game tự nối roi dài vào)
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
      const burn = (ph >= 1 || Q.eyeGlow >= 0.5) && Q.eye !== 'tired', angry = ph >= 1 || Q.eye === 'angry';
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
          const sad = Q.eye === 'dazed' || Q.eye === 'tired', iy = sad ? -62 : angry ? -55 : -57, oy = sad ? -57 : angry ? -64 : -60;
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
            eye(s, x, y, { w: 9, h: 9, look: Q.eye === 'tired' ? [lk[0], 1] : lk, col, shut: shut ? 1 : 0, lidc: shut ? BARK[1] : null, lid: shut ? 0 : Math.max(Q.eye === 'tired' ? 4 : 0, Math.round(Q.blink * 8) + (angry ? 0 : 1)), glow: burn ? SAP.glow : SAP.B[1] });
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
        const sg = A.sg, sh = A.sh, el = A.el, hd = A.hd, r2 = A.a2 * D2R, dug = hd[1] > -4, stub = left && Q.stub > 0.5, whipOn = left && Q.whip > 0.02 && !stub;
        const ux = el[0] - sh[0], uy = el[1] - sh[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul;
        const mid = [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2];
        const up = py < 0 ? 1 : -1; // phía "trên" của bắp tay
        S.part((s) => {
          s.cv([sh, [mid[0], mid[1] - 1], el], 12, 10, BARK); s.cv([el, hd], 9, 7, BARK); s.e(el[0], el[1], 6, 6, BARK);
          if (dug) s.r(hd[0] - 16, 0, 32, 40, 0);
          else {
            s.e(hd[0], hd[1], 5, 5, BARK);
            if (stub) s.e(hd[0], hd[1], 4, 4, GRN);
            else if (!whipOn) {
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
      { id: 'sweepOut', label: 'Quét: roi vươn dài', Q: { eye: 'angry', mouth: 0.7, lean: -0.8, la1: 12, la2: 6, whip: 1, whipX: -124, whipY: -7, whipWave: 0.7, ra1: 30, ra2: 120 }, X: {} },
      { id: 'exposed', label: 'Mệt, lộ lõi nhựa', Q: { eye: 'tired', slump: 1, lean: -0.3, mouth: 0.95, core: 1, la1: 55, la2: 108, ra1: 55, ra2: 108 }, X: {} },
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
      { id: 'stun', label: 'Choáng', Q: { eye: 'dazed', sway: 1, lean: 0.15 }, X: {} },
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
          const a = (-64 + i * 52 + Q.orb * 52) * D2R, bx = 66 + Math.cos(a) * 40, by = -28 + Math.sin(a) * 40, r = 9 - (i === 1 ? 0 : 1.5);
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
  // 8. VẼ TRONG GAME
  // Phần này chỉ đọc trạng thái của quái và trùm (không đụng luật chơi, không dùng G.rnd).
  // Hình dựng bằng bộ vẽ ở trên rồi cất vào kho; tư thế đổi 10 đến 12 lần mỗi giây, còn vị trí, rung, nghiêng thì mượt theo từng khung.
  // ====================================================================
  const ST0 = { fire: 0, poisonN: 0, iceN: 0, frozen: 0, stun: 0, root: 0 };
  function mk(w, h) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    return g;
  }
  const SCR = {};
  // Khung nháp dùng lại theo tên.
  function scr(slot, w, h) {
    let g = SCR[slot];
    if (!g || g.canvas.width < w || g.canvas.height < h) g = SCR[slot] = mk(Math.max(w, g ? g.canvas.width : 0), Math.max(h, g ? g.canvas.height : 0));
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, g.canvas.width, g.canvas.height);
    return g;
  }
  // Bản phủ màu của một hình: mode 'source-atop' là nhuộm, 'source-in' là bóng đặc một màu. Trả về canvas cùng cỡ với src.
  function tinted(slot, src, col, alpha, mode) {
    const g = scr(slot, src.width, src.height);
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = mode || 'source-atop'; g.globalAlpha = alpha; g.fillStyle = col;
    g.fillRect(0, 0, src.width, src.height);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    return g.canvas;
  }
  // Vẽ src đã phủ màu ra c tại (dx, dy): chỉ lấy đúng vùng của src trong khung nháp.
  function blitT(c, slot, src, dx, dy, col, alpha, mode) {
    const t = tinted(slot, src, col, alpha, mode);
    c.drawImage(t, 0, 0, src.width, src.height, dx, dy, src.width, src.height);
  }
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function hexA(hex, a) { const v = rgbOf(hex); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(2) + ')'; }
  // Bầu dục đặc theo điểm ảnh.
  function ell(c, x, y, rx, ry, col) {
    c.fillStyle = col; x = Math.round(x); y = Math.round(y);
    const R = Math.max(1, Math.round(ry));
    for (let j = -R; j <= R; j++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (R * R + 0.01)))); if (w > 0 || j === 0) c.fillRect(x - w, y + j, w * 2 + 1, 1); }
  }
  // Vành bầu dục mảnh.
  function ring(c, x, y, rx, ry, col, th) {
    c.fillStyle = col; x = Math.round(x); y = Math.round(y); th = th || 1;
    const n = Math.max(10, Math.round((rx + ry) * 1.6));
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; c.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), th, th); }
  }
  function line(c, x0, y0, x1, y1, col, th) {
    c.fillStyle = col; th = th || 1;
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
    for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (dx * i) / n), Math.round(y0 + (dy * i) / n), th, th);
  }
  // Mảnh vụn bay ra theo vòng quanh gốc toạ độ hiện tại: v là tiến độ 0..1.
  function bits(c, n, v, r, col, col2, seed, up) {
    if (v <= 0 || v >= 1) return;
    for (let i = 0; i < n; i++) {
      const an = i * 2.399 + seed, sp = 0.5 + hsh(i + seed * 7) * 0.7;
      const bx = Math.cos(an) * r * sp * easeOut(v), by = Math.sin(an) * r * 0.5 * sp * easeOut(v) - (up || 12) * v + (up || 12) * 2.2 * v * v;
      const s = v < 0.5 && i % 3 === 0 ? 2 : 1;
      if (v > 0.75 && i % 2) continue;
      px(c, bx, by, s, s, i % 3 === 1 && col2 ? col2 : col);
    }
  }
  // Viên đạn tròn có viền: B là bộ ba màu.
  function blob(c, x, y, r, B) {
    x = Math.round(x); y = Math.round(y);
    ell(c, x, y, r + 1, r + 1, INK); ell(c, x, y, r, r, B[1]);
    px(c, x - r + 1, y + 1, r * 2 - 1, r - 1, B[0]); ell(c, x, y - 1, r - 1, r - 1, B[1]);
    px(c, x - Math.ceil(r / 2), y - r + 1, Math.max(1, r - 1), 1, B[2]); px(c, x - r + 1, y - Math.ceil(r / 2), 1, Math.max(1, r - 2), B[2]);
  }
  // Vật bay theo cung từ (x0, y0 - z0) xuống mặt đất tại (x1, y1); u là tiến độ 0..1, h là độ cao cung.
  function lob(c, x0, y0, z0, x1, y1, u, h, B, big) {
    if (u <= 0 || u >= 1) return;
    ell(c, x1, y1, 3 + 5 * u, 1 + 2 * u, 'rgba(0,0,0,' + (0.15 + 0.2 * u).toFixed(2) + ')');
    for (let i = 2; i >= 0; i--) {
      const v = u - i * 0.05;
      if (v <= 0) continue;
      const bx = lerp(x0, x1, v), by = lerp(y0 - z0, y1, v) - h * 4 * v * (1 - v);
      if (i) px(c, bx - 1, by - 1, 3 - i, 3 - i, hexA(B[1], 0.6 - i * 0.2));
      else blob(c, bx, by, big ? 4 : 3, B);
    }
  }
  // Nước bắn toé tại (x, y): v là tiến độ 0..1.
  function splash(c, x, y, v, r, n) {
    if (v <= 0 || v >= 1) return;
    x = Math.round(x); y = Math.round(y);
    ring(c, x, y, r * (0.4 + 0.6 * easeOut(v)), r * 0.35 * (0.4 + 0.6 * easeOut(v)), 'rgba(225,245,255,' + (0.9 * (1 - v)).toFixed(2) + ')', 2);
    c.save(); c.translate(x, y - 4); bits(c, n || 12, v, r * 0.9, '#bfeaff', '#ffffff', r * 0.13, 30); c.restore();
    const h = Math.round(r * 0.5 * Math.sin(Math.min(1, v * 1.6) * Math.PI));
    if (h > 1) { px(c, x - 8, y - h, 5, h, '#eafcff'); px(c, x + 3, y - Math.round(h * 0.7), 5, Math.round(h * 0.7), '#bfeaff'); px(c, x - 2, y - Math.round(h * 1.2), 4, Math.round(h * 1.2), '#ffffff'); px(c, x - 9, y - h - 1, 7, 1, INK); px(c, x - 3, y - Math.round(h * 1.2) - 1, 6, 1, INK); }
  }
  // Gai nhọn có viền (dùng cho rễ, gai đất, tinh thể): gốc (x, y), cao h, rộng w, nghiêng ln; B là bộ ba màu.
  function spikeUp(c, x, y, h, w, ln, B) {
    if (h < 2) return;
    for (let j = 0; j <= h; j++) {
      const k = j / h, ww = Math.max(1, Math.round(w * (1 - k))), cx = Math.round(x + ln * k);
      px(c, cx - ww - 1, y - j, ww * 2 + 2, 1, INK);
    }
    px(c, Math.round(x + ln) - 1, y - h - 1, 2, 1, INK);
    for (let j = 0; j <= h; j++) {
      const k = j / h, ww = Math.max(1, Math.round(w * (1 - k))), cx = Math.round(x + ln * k);
      px(c, cx - ww, y - j, ww * 2, 1, B[1]); px(c, cx - ww, y - j, Math.max(1, ww >> 1), 1, B[0]); if (ww > 1) px(c, cx + ww - 1, y - j, 1, 1, B[2]);
    }
  }
  // Hiệu ứng ngắn do trùm tạo ra (b.fx), toạ độ thế giới: gai rễ, vòng gai, cột nước, vũng toé, đất nứt.
  function drawFx(c, b) {
    if (!b.fx) return;
    for (const f of b.fx) {
      const v = clamp01(f.t / f.d), x = Math.round(f.x), y = Math.round(f.y);
      if (f.k === 'spike') {
        const H = v < 0.15 ? easeOut(v / 0.15) : v < 0.6 ? 1 : 1 - (v - 0.6) / 0.4;
        ring(c, x, y, 6 + 12 * easeOut(v), 3 + 6 * easeOut(v), 'rgba(60,36,20,' + (0.7 * (1 - v)).toFixed(2) + ')');
        spikeUp(c, x - 7, y + 1, Math.round(19 * H), 3, -4, BARK); spikeUp(c, x + 7, y + 2, Math.round(15 * H), 3, 5, BARK);
        spikeUp(c, x, y + 2, Math.round(30 * H), 4, 1, WD);
        if (H > 0.5) { px(c, x + 1, y - Math.round(30 * H), 1, 3, CREAM[2]); px(c, x + 3, y - 12, 3, 1, TOX[1]); px(c, x - 5, y - 18, 3, 1, TOX[2]); }
        c.save(); c.translate(x, y - 2); bits(c, 8, clamp01(v * 1.6), 18, '#5a3a22', '#8a6040', 0.9, 14); c.restore();
      } else if (f.k === 'thorns') {
        const H = v < 0.18 ? easeOut(v / 0.18) : v < 0.55 ? 1 : 1 - (v - 0.55) / 0.45, r = f.r || 60;
        for (let i = 0; i < 16; i++) {
          const an = i * 0.393 + 0.2, rr = r * (0.45 + 0.5 * hsh(i + 2));
          spikeUp(c, Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr * 0.6), Math.round((10 + hsh(i) * 10) * H), 2, Math.round(Math.cos(an) * 4 * H), BONE);
        }
      } else if (f.k === 'column') {
        const up = v < 0.3 ? easeOut(v / 0.3) : 1, fall = v < 0.3 ? 0 : (v - 0.3) / 0.7;
        const h = Math.round(36 * up * (1 - fall * fall)), w = Math.round(10 - 4 * fall);
        ring(c, x, y, 8 + 14 * v, 4 + 7 * v, 'rgba(225,245,255,' + (0.9 * (1 - v)).toFixed(2) + ')', 2);
        if (h > 1) {
          px(c, x - (w >> 1) - 2, y - h - 1, w + 4, h + 1, INK);
          px(c, x - (w >> 1) - 1, y - h, w + 2, h, ICE[0]); px(c, x - (w >> 1), y - h, w, h, ICE[1]); px(c, x - (w >> 1) + 1, y - h, 2, h, ICE[2]);
          px(c, x - (w >> 1) - 3, y - h - 3, w + 6, 4, INK); px(c, x - (w >> 1) - 2, y - h - 2, w + 4, 3, '#ffffff');
        }
        c.save(); c.translate(x, y - 6); bits(c, 9, v, 22, '#bfeaff', '#ffffff', 1.7, 26); c.restore();
      } else if (f.k === 'splat') {
        ring(c, x, y, 6 + 14 * easeOut(v), 3 + 8 * easeOut(v), hexA(f.col || '#8fe04a', 0.9 * (1 - v)), 2);
        c.save(); c.translate(x, y - 3); bits(c, 9, v, 20, f.col || '#8fe04a', '#ffffff', 2.9, 16); c.restore();
      } else if (f.k === 'quake') {
        const r = f.r || 30, e = easeOut(v);
        ring(c, x, y, r * (0.4 + 0.6 * e), r * 0.6 * (0.4 + 0.6 * e), 'rgba(255,240,200,' + (0.8 * (1 - v)).toFixed(2) + ')', 2);
        for (let i = 0; i < 6; i++) {
          const an = i * 1.047 + 0.3, len = r * (0.4 + 0.5 * hsh(i)) * Math.min(1, v * 4);
          line(c, x, y, Math.round(x + Math.cos(an) * len), Math.round(y + Math.sin(an) * len * 0.6), 'rgba(30,18,14,' + (0.8 * (1 - v)).toFixed(2) + ')', 1);
        }
        c.save(); c.translate(x, y - 3); bits(c, 10, v, r, '#8a7a6a', '#d8cfa8', 1.1, 20); c.restore();
      }
    }
  }
  // Dấu chấm than báo sắp ra đòn.
  function bang(c, x, ty, now) {
    const cc = Math.floor(now * 10) & 1 ? '#fff3b0' : '#ff4030';
    px(c, x - 2, ty - 15, 4, 7, INK); px(c, x - 2, ty - 7, 4, 4, INK);
    px(c, x - 1, ty - 14, 2, 5, cc); px(c, x - 1, ty - 6, 2, 2, cc);
  }
  const statusOf = (c, e, x, top) => { if (G.art && G.art.status) G.art.status(c, e, x, top); };
  const regionNow = () => { const w = G.getWorld && G.getWorld(); return w && w.region != null ? Math.max(0, Math.min(2, w.region)) : 0; };

  // ---------- kho hình ----------
  const MCACHE = new Map(), BCACHE = new Map();
  function monSpr(reg, role, P, el) {
    const key = reg + role + (el || '-') + P.w + P.br + P.bl + P.tl + P.an + P.sk + P.lg + (P.dead ? 'd' : '');
    let s = MCACHE.get(key);
    if (s) return s;
    if (MCACHE.size > 1500) MCACHE.clear();
    s = build(MON[reg][role], Object.assign({}, P0, P), { el: el || null, E: el ? ELP[el] : null });
    MCACHE.set(key, s);
    return s;
  }
  function miniSpr(reg, P, el) {
    const key = 'm' + reg + (el || '-') + P.w + P.br + P.bl + P.tl + P.an + P.sk + P.kd + P.roar + P.f3 + P.tired + (P.dead ? 'd' : '');
    let s = MCACHE.get(key);
    if (s) return s;
    if (MCACHE.size > 1500) MCACHE.clear();
    s = build(MINI[reg], P, { el: el || null, E: el ? ELP[el] : null });
    MCACHE.set(key, s);
    return s;
  }
  // Hình trùm theo tư thế Q và dạng thích nghi X. Số trong Q được làm tròn để các khung giống nhau dùng lại được.
  function bossSpr(kind, Q, X) {
    let key = kind;
    for (const k in Q) { const v = Q[k]; key += '|' + (typeof v === 'number' ? Math.round(v * 50) / 50 : Array.isArray(v) ? v.join(',') : v); }
    key += '#' + (X.el || '') + (X.weak || '') + (X.aR ? 'R' : '') + (X.aM ? 'M' : '') + (X.aD ? 'D' : '') + (X.phase | 0);
    let s = BCACHE.get(key);
    if (s) return s;
    if (BCACHE.size > 90) { let n = 30; for (const k of BCACHE.keys()) { BCACHE.delete(k); if (--n <= 0) break; } } // bỏ bớt hình cũ nhất
    s = build(BOSS[kind], Q, X);
    BCACHE.set(key, s);
    return s;
  }
  // Dạng thích nghi của trùm đọc từ b.layers: { el, E, weak, W, aR, aM, aD, phase }.
  function layersX(b) {
    const L = b.layers || [], res = L.find((l) => l.type === 'resist'), el = res ? res.el : null;
    const weak = el ? (b.weak && b.weak.length ? b.weak[0] : (L.some((l) => l.type === 'resist' && l.el === WEAK[el]) ? null : WEAK[el])) : null;
    return {
      el, E: el ? ELP[el] : null, weak, W: weak ? ELP[weak] : null,
      aR: L.some((l) => l.type === 'antiRanged') ? 1 : 0, aM: L.some((l) => l.type === 'antiMelee') ? 1 : 0, aD: L.some((l) => l.type === 'antiDodge') ? 1 : 0,
      phase: b.phase | 0,
    };
  }
  // Dán một hình s = { cv, ox, oy } tại (x, y). o: flip (lật ngang), rot (radian, quanh điểm px, py tính từ gốc), sx, sy (co giãn quanh gốc),
  // alpha, tint [màu, độ pha], sil (màu bóng đặc thay cho hình).
  function blit(c, s, x, y, o) {
    o = o || {};
    c.save();
    c.translate(Math.round(x), Math.round(y));
    if (o.flip) c.scale(-1, 1);
    if (o.rot) { c.translate(o.px || 0, o.py || 0); c.rotate(o.rot); c.translate(-(o.px || 0), -(o.py || 0)); }
    if (o.sx || o.sy) c.scale(o.sx || 1, o.sy || 1);
    if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.sil) blitT(c, 'sil', s.cv, -s.ox, -s.oy, o.sil, 1, 'source-in');
    else if (o.tint) blitT(c, 'tint', s.cv, -s.ox, -s.oy, o.tint[0], o.tint[1]);
    else c.drawImage(s.cv, -s.ox, -s.oy);
    c.restore();
  }
  // Viền một màu quanh hình (báo đòn, đóng băng): dán bóng đặc lệch bốn phía.
  function halo(c, s, col, alpha) {
    const t = tinted('sil', s.cv, col, 1, 'source-in'), w = s.cv.width, h = s.cv.height;
    if (alpha != null) c.globalAlpha = alpha;
    for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.drawImage(t, 0, 0, w, h, -s.ox + d[0], -s.oy + d[1], w, h);
    c.globalAlpha = 1;
  }

  // ---------- quái thường và tinh anh ----------
  const RATE = { rusher: 8, swarm: 11, shield: 6, archer: 8, nimble: 12, elite: 7, mini: 6 };
  const SKD = 0.27; // thời gian giữ dáng ra đòn sau khi hết lấy đà
  // Trí nhớ nhỏ gắn vào từng con để biết lúc nó vừa tung đòn (chỉ dùng cho hình vẽ).
  function mem(e) { return e._ma || (e._ma = { pw: 0, w0: 0.4, skT: -9 }); }
  function monPose(e, a, flying) {
    const st = e.st || ST0, now = G.time || 0, t = e.t || 0;
    const stopped = st.frozen > 0 || st.stun > 0;
    const wind = e.wind > 0 ? e.wind : 0;
    if (wind > 0 && (a.pw <= 0 || wind > a.w0)) a.w0 = wind;
    if (a.pw > 0 && wind <= 0 && !stopped && !e.dead && e.dying == null) a.skT = now; // đòn vừa tung
    a.pw = wind;
    const P = { w: -1, br: 0, bl: 0, tl: 0, an: 0, sk: 0, lg: 0 };
    if (st.frozen > 0) return P;
    const sd = now - a.skT;
    if (e.lunge > 0) P.lg = 1;
    else if (wind > 0) { const u = 1 - wind / a.w0; P.an = u < 0.3 ? 1 : u < 0.65 ? 2 : 3; }
    else if (sd >= 0 && sd < SKD && e.role !== 'nimble') P.sk = sd < 0.1 ? 1 : sd < 0.19 ? 2 : 3;
    else if (st.stun > 0) P.bl = 1;
    else if (e.moving) { P.w = Math.floor(t * (RATE[e.role] || 8)) & 3; P.tl = P.w; }
    else { P.br = Math.floor(t * 2.4) & 1; P.bl = t % 3.3 < 0.13 ? 1 : 0; P.tl = Math.floor(t * 5) & 3; }
    if (flying) P.tl = Math.floor(t * 12) & 3; // loài bay lúc nào cũng đập cánh
    return P;
  }
  // Kiểu gục của từng loài.
  const DIE = [
    { swarm: 'pop', shield: 'flip', archer: 'melt', nimble: 'flip' },
    { rusher: 'pop', swarm: 'pop', shield: 'flip', archer: 'melt', nimble: 'melt', elite: 'melt' },
    { rusher: 'melt', swarm: 'fall', shield: 'shatter', archer: 'fall', nimble: 'flip', elite: 'shatter' },
  ];
  const DUST = [['#8fe04a', '#a56fd0'], ['#bfeaff', '#ffffff'], ['#ffb347', '#e8492a']];
  function dieMon(c, e, reg) {
    const k = clamp01(e.dying), x = Math.round(e.x), y = Math.round(e.y), f = e.face < 0 ? -1 : 1;
    const role = MON[reg][e.role] ? e.role : 'rusher', D = MON[reg][role], style = DIE[reg][role] || 'topple';
    const s = monSpr(reg, role, { w: -1, br: 0, bl: 0, tl: 0, an: 0, sk: 0, lg: 0, dead: 1 }, e.el || null);
    const col = e.el ? ELP[e.el].B[1] : DUST[reg][0], col2 = e.el ? ELP[e.el].B[2] : DUST[reg][1];
    if (k < 0.9) ell(c, x, y, D.sh * (1 - k * 0.5), 2, 'rgba(0,0,0,' + (0.3 * (1 - k)).toFixed(2) + ')');
    const A0 = 0.28, u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0));
    const hot = k < A0 ? 1 - u : 0, mid = Math.round(D.top / 2);
    const o = { flip: f < 0, tint: hot > 0 ? ['#ffffff', hot * 0.9] : null };
    let dx = -f * 6 * easeOut(u), dy = 0;
    c.save();
    if (style === 'pop') {
      const g = 1 + 0.5 * easeOut(v);
      if (v < 0.35) blit(c, s, x + dx, y, Object.assign(o, { sx: g, sy: g, tint: ['#ffffff', Math.max(hot, v * 2.4)] }));
      c.translate(x + dx, y - mid); bits(c, 10, clamp01((v - 0.15) / 0.85), 22, col, col2, 1.3, 10);
    } else if (style === 'shatter') {
      // vỡ thành từng mảng văng ra
      const cols = 3, rows = 3, w = s.cv.width, h = s.cv.height, tw = Math.ceil(w / cols), th = Math.ceil(h / rows);
      const src = hot > 0 ? tinted('tint', s.cv, '#ffffff', hot * 0.9) : s.cv;
      c.translate(x + dx, y); c.scale(f, 1);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const n = i * rows + j, vv = clamp01((v - hsh(n + 3) * 0.1) / 0.9);
        if (vv >= 0.97 || (vv > 0.8 && n % 2)) continue;
        const ddx = (i - 1) * 9 * easeOut(vv) + (hsh(n) - 0.5) * 6 * vv, up = (rows - j) * 5 + 4, floor = (rows - j - 1) * th;
        const ddy = Math.min(floor, -up * vv * 1.6 + (up * 1.6 + floor + 2) * vv * vv);
        c.drawImage(src, i * tw, j * th, tw, th, Math.round(-s.ox + i * tw + ddx), Math.round(-s.oy + j * th + ddy), tw, th);
      }
      c.translate(0, -8); bits(c, 8, v, 18, col, col2, 2.1, 10);
    } else {
      let rot = 0, sx = 1, sy = 1, alpha = 1, py = 0;
      if (style === 'topple') {
        // ngã ngửa ra sau, nảy nhẹ
        const fall = clamp01(v / 0.5);
        rot = -(0.2 * u + (Math.PI / 2 - 0.2) * easeIn(fall));
        if (v > 0.5 && v < 0.68) dy = -3 * Math.sin(((v - 0.5) / 0.18) * Math.PI);
      } else if (style === 'flip') {
        // bật ngửa, chổng chân lên trời
        const fl = clamp01(v / 0.45);
        dy = -10 * Math.sin(fl * Math.PI); rot = -Math.PI * easeOut(fl); py = -mid;
      } else if (style === 'melt') {
        // xẹp xuống thành một vũng
        const m = smooth(clamp01(v / 0.7));
        sy = 1 - 0.8 * m; sx = 1 + 0.5 * m;
      } else if (style === 'fall') {
        // loài bay: xoáy rơi xuống đất
        const fl = clamp01(v / 0.5);
        dy = 4 * easeIn(fl); rot = -fl * 4; py = -mid;
        if (v > 0.5) { rot = Math.PI; sy = 0.7; }
      }
      alpha = v > 0.9 ? 0.4 : v > 0.75 ? 0.7 : 1;
      blit(c, s, x + dx, y + dy, Object.assign(o, { rot: f < 0 ? rot : rot, py, sx, sy, alpha }));
      c.translate(x - f * 6, y - 4);
      bits(c, 6, clamp01((v - 0.3) / 0.6), 14, col2, col, 0.4, 8);
    }
    c.restore();
  }
  function drawMon(c, e, reg) {
    const role = MON[reg][e.role] ? e.role : 'rusher', D = MON[reg][role];
    const x = Math.round(e.x), y = Math.round(e.y), f = e.face < 0 ? -1 : 1;
    const st = e.st || ST0, a = mem(e), now = G.time || 0;
    const P = monPose(e, a, !!D.fly);
    ell(c, x, y, D.sh, 2, 'rgba(0,0,0,0.3)');
    if (e.resist && ELP[e.resist]) {
      // vòng hào quang kháng hệ dưới chân
      const rc = ELP[e.resist].B[1], rr = D.sh + 4, k = Math.floor(now * 6) % 3;
      ring(c, x, y, rr, 3, rc);
      px(c, x - rr, y - 6 - k, 1, 3, rc); px(c, x + rr - 1, y - 9 + k, 1, 3, rc);
    }
    const s = monSpr(reg, role, P, e.el || null);
    const frozen = st.frozen > 0;
    const u = P.an ? clamp01(1 - e.wind / a.w0) : 0;
    let ox = 0, rot = 0, sx = 1, sy = 1;
    if (P.an && u > 0.6 && (Math.floor(now * 30) & 1)) ox = 1; // dồn lực, rung nhẹ
    if (P.lg) { sx = 1.12; sy = 0.92; }
    if (!frozen) {
      if (st.stun > 0) rot = Math.sin(now * 9 + x) * 0.14;
      if (st.root > 0) ox += [1, 0, -1, 0][Math.floor(now * 14) & 3]; // giãy giụa
      if (e.flash > 0) { ox -= 2; rot -= 0.1; } // giật lùi
    }
    c.save();
    c.translate(x, y);
    c.scale(f, 1);
    c.translate(ox, 0);
    if (rot) c.rotate(rot);
    if (sx !== 1 || sy !== 1) c.scale(sx, sy);
    if (frozen) {
      // bọc trong lớp băng
      halo(c, s, '#e9f9ff');
      blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#a8dcf5', 0.7);
    } else if (e.flash > 0) blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#ffffff', 0.6);
    else if (P.an) {
      // viền đỏ báo đòn, càng gần lúc ra đòn càng chớp gấp
      const hot = u > 0.55 && (Math.floor(now * 20) & 1);
      halo(c, s, hot ? '#ffd27a' : '#d02818');
      if (hot && u > 0.8) blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#fff0c8', 0.35); else c.drawImage(s.cv, -s.ox, -s.oy);
    } else c.drawImage(s.cv, -s.ox, -s.oy);
    c.restore();
    const top = y - D.top - 2;
    if (P.lg) for (let i = 0; i < 3; i++) px(c, x - f * (13 + i * 6) - (f > 0 ? 7 : 0), y - 5 - i * 3, 8 - i * 2, 1, 'rgba(255,255,255,' + (0.6 - i * 0.15) + ')');
    if (frozen) {
      px(c, x - 7, y - 3, 4, 3, '#bfeaff'); px(c, x + 3, y - 2, 4, 2, '#e9f9ff'); px(c, x - 2, y - 1, 5, 1, '#bfeaff');
    } else {
      if (st.stun > 0) for (let i = 0; i < 3; i++) { const an = now * 6 + i * 2.09; px(c, x + Math.cos(an) * 7 - 1, top - 3 + Math.sin(an) * 2 - 1, 2, 2, Math.sin(an) > 0 ? '#ffd23f' : '#b8922a'); } // sao xoay trên đầu
      if (st.root > 0) { px(c, x - 6, y - 4, 2, 4, '#4d6b28'); px(c, x + 4, y - 5, 2, 5, '#4d6b28'); px(c, x - 5, y - 2, 10, 1, '#8fae4a'); px(c, x - 3, y - 5, 1, 2, '#8fae4a'); } // dây leo quấn chân
    }
    if (e.wind > 0) bang(c, x, top - (role === 'elite' ? 4 : 0), now);
    statusOf(c, e, x, top);
  }

  // ---------- trùm nhỏ ----------
  function miniState(b, reg) {
    const an = b.dying != null ? null : b.anim, st = b.st || ST0, t = b.t || 0, now = G.time || 0;
    const P = { w: -1, br: 0, bl: 0, tl: Math.floor(now * 8) & 3, an: 0, sk: 0, kd: '', roar: b.roarT > 0 && b.dying == null ? 1 : 0, f3: Math.floor(now * 10) % 3, tired: 0, dead: 0 };
    const O = { vx: 0, vy: 0, oy: 0, trail: 0, U: 0 };
    if (an) {
      P.kd = an.name;
      if (an.name === 'charge') {
        if (an.t < an.fire) { O.U = an.t / an.fire; P.an = O.U < 0.3 ? 1 : O.U < 0.65 ? 2 : 3; }
        else {
          const dd = (an.t - an.fire) / an.dash;
          if (dd < 1) { const k = 1 - easeOut(clamp01(dd)); O.vx = (an.fx - b.x) * k; O.vy = (an.fy - b.y) * k; P.sk = 1; O.trail = 1; }
          else if (dd < 2.2) P.sk = 2;
          else P.kd = '';
        }
      } else if (an.fire != null) {
        if (an.t < an.fire) { O.U = an.t / an.fire; P.an = O.U < 0.3 ? 1 : O.U < 0.65 ? 2 : 3; }
        else { const sd = an.t - an.fire; P.sk = sd < 0.12 ? 1 : sd < 0.26 ? 2 : sd < 0.42 ? 3 : 0; if (!P.sk) P.kd = ''; }
      } else if (an.name === 'burst' && an.shots && an.shots.length) {
        const t0 = an.shots[0].land - 0.55;
        if (an.t < t0) { O.U = an.t / t0; P.an = O.U < 0.4 ? 1 : O.U < 0.75 ? 2 : 3; }
        else {
          P.an = 3;
          for (const s of an.shots) { const d0 = an.t - (s.land - 0.55); if (d0 >= 0 && d0 < 0.09) { P.an = 0; P.sk = 1; } }
          if (an.t > an.shots[an.shots.length - 1].land - 0.4) { P.an = 0; if (!P.sk) P.sk = 2; }
        }
      } else if (an.name === 'summon') { P.an = 3; P.roar = 1; O.vx = Math.floor(now * 30) & 1; }
      // Nấm Chúa nhảy lên rồi nện xuống
      if (an.name === 'slam' && reg === 0 && P.an && O.U > 0.5) O.oy = -26 * Math.sin(((O.U - 0.5) / 0.5) * Math.PI * 0.85);
    } else if (b.wind > 0 && b.dying == null) { P.an = 2; P.kd = 'swipe'; }
    if (P.roar) O.vx += Math.floor(now * 30) & 1;
    if (!P.an && !P.sk && !P.roar) {
      if (b.moving) P.w = Math.floor(t * RATE.mini) & 3;
      else { P.br = Math.floor(t * 2) & 1; P.bl = t % 3.7 < 0.14 ? 1 : 0; }
      if (b.exposed > 0 && b.dying == null) { P.tired = 1; P.br = Math.floor(t * 7) & 1; P.w = -1; } // thở dốc sau cú lao
    }
    if (st.stun > 0) P.bl = 1;
    return { P, O };
  }
  // Hệ để tô tinh thể, lửa, bào tử của trùm nhỏ: đang kháng hệ nào thì hiện màu hệ đó, không thì màu hệ của vùng.
  const miniEl = (b, reg) => { const r = b.layers && b.layers.find((l) => l.type === 'resist'); return (r && r.el) || b.el || ['poison', 'ice', 'fire'][reg]; };
  function drawMini(c, b, reg) {
    const D = MINI[reg], x = Math.round(b.x), y = Math.round(b.y), f = b.face < 0 ? -1 : 1, now = G.time || 0, st = b.st || ST0;
    const S2 = miniState(b, reg), P = S2.P, O = S2.O, an = b.anim, el = miniEl(b, reg), E = ELP[el];
    const s = miniSpr(reg, P, el);
    const bx = x + Math.round(O.vx), by = y + Math.round(O.vy);
    ell(c, bx, by, D.sh * (O.oy < 0 ? 0.75 : 1), 4, 'rgba(0,0,0,0.3)');
    const res = b.layers && b.layers.find((l) => l.type === 'resist');
    if (res && ELP[res.el]) { const k = Math.floor(now * 6) % 3; ring(c, bx, by, D.sh + 5, 5, ELP[res.el].B[1], 2); px(c, bx - D.sh - 5, by - 8 - k, 2, 4, ELP[res.el].B[2]); px(c, bx + D.sh + 3, by - 11 + k, 2, 4, ELP[res.el].B[2]); }
    let rot = 0, ox = 0;
    if (st.stun > 0) rot = Math.sin(now * 9) * 0.08;
    if (b.flash > 0) ox = -1;
    if (P.an === 3 && (Math.floor(now * 30) & 1)) ox += 1;
    c.save();
    c.translate(bx, by + Math.round(O.oy));
    c.scale(f, 1);
    c.translate(ox, 0);
    if (rot) c.rotate(rot);
    if (O.trail) {
      // bóng mờ kéo theo sau cú lao
      const dir = (an.dir || 1) * f, t2 = tinted('sil', s.cv, E.B[1], 1, 'source-in');
      for (let i = 3; i >= 1; i--) { c.globalAlpha = 0.5 - i * 0.12; c.drawImage(t2, 0, 0, s.cv.width, s.cv.height, -s.ox - dir * i * 10, -s.oy, s.cv.width, s.cv.height); }
      c.globalAlpha = 1;
    }
    if (st.frozen > 0) { halo(c, s, '#e9f9ff'); blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#a8dcf5', 0.6); }
    else if (b.flash > 0) blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#ffffff', 0.5);
    else {
      if (P.an) { const hot = O.U > 0.55 && (Math.floor(now * 20) & 1); halo(c, s, hot ? '#ffd27a' : '#d02818', 0.5 + 0.5 * O.U); }
      c.drawImage(s.cv, -s.ox, -s.oy);
    }
    c.restore();
    // đạn hệ bắn vòng cầu của đòn rải
    if (an && an.name === 'burst' && an.shots) {
      const EB = (ELP[an.el] || E).B;
      for (const sh of an.shots) lob(c, x, y, D.top - 4, sh.x, sh.y, (an.t - (sh.land - 0.55)) / 0.55, 26, EB);
    }
    if (an && an.name === 'summon') { const v = clamp01(an.t / 0.6); ring(c, x, y - D.top * 0.5, 12 + 40 * v, 8 + 22 * v, 'rgba(255,255,255,' + (0.6 * (1 - v)).toFixed(2) + ')', 2); } // vòng sóng gầm
    drawFx(c, b);
    const top = y - D.top - 2;
    if (b.wind > 0) bang(c, x, top + 4, now);
    statusOf(c, b, x, top);
  }
  function dieMini(c, b, reg) {
    const D = MINI[reg], k = clamp01(b.dying), x = Math.round(b.x), y = Math.round(b.y), f = b.face < 0 ? -1 : 1;
    const el = miniEl(b, reg), E = ELP[el], col = E.B[1], col2 = E.B[2];
    const A0 = 0.42, u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0));
    const P = { w: -1, br: 0, bl: 0, tl: 0, an: 0, sk: 0, kd: '', roar: k < A0 ? 1 : 0, f3: Math.floor(k * 40) % 3, tired: 0, dead: k < A0 ? 0 : 1 };
    const s = miniSpr(reg, P, el), mid = Math.round(D.top / 2);
    if (k < 0.92) ell(c, x, y, D.sh * (1 - v * 0.5), 4, 'rgba(0,0,0,' + (0.3 * (1 - v)).toFixed(2) + ')');
    if (k < A0) {
      // co giật, loé sáng
      const fl = Math.abs(Math.sin(u * 14));
      blit(c, s, x + (Math.floor(k * 70) & 1) * 2 - 1, y, { flip: f < 0, tint: ['#ffffff', 0.75 * fl] });
      c.save(); c.translate(x, y - mid); for (let i = 0; i < 3; i++) bits(c, 7, (u - i * 0.3) / 0.4, 34, col, col2, i * 1.9 + 0.5, 18); c.restore();
      return;
    }
    c.save();
    if (reg === 1) {
      // Cua Đá: vỡ vụn thành đá và băng
      const cols = 5, rows = 4, w = s.cv.width, h = s.cv.height, tw = Math.ceil(w / cols), th = Math.ceil(h / rows);
      const src = v > 0.4 ? tinted('tint', s.cv, '#0c1420', Math.min(0.6, v - 0.4)) : s.cv;
      c.translate(x, y); c.scale(f, 1);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const n = i * rows + j, late = hsh(n + 5) * 0.3, vv = clamp01((v - late) / (1 - late));
        if (vv >= 0.96 || (vv > 0.8 && n % 2)) continue;
        const dx = (i - 2) * 8 * easeOut(vv) + (hsh(n) - 0.5) * 6 * vv, up = (rows - j) * 4 + 5 + hsh(n + 9) * 6, floor = (rows - j - 1) * th;
        const dy = Math.min(floor, -up * vv * 1.8 + (up * 1.8 + floor) * vv * vv);
        c.drawImage(src, i * tw, j * th, tw, th, Math.round(-s.ox + i * tw + dx), Math.round(-s.oy + j * th + dy), tw, th);
      }
      c.translate(0, -mid); bits(c, 16, v, 50, '#7fd4ff', '#e9f9ff', 1.4, 26);
    } else if (reg === 0) {
      // Nấm Chúa: xẹp xuống, bào tử bay mù
      const m = smooth(clamp01(v / 0.7));
      blit(c, s, x, y, { flip: f < 0, sx: 1 + 0.35 * m, sy: 1 - 0.7 * m, alpha: v > 0.85 ? 0.5 : 1, tint: ['#3d1d55', 0.4 * v] });
      c.translate(x, y - mid * (1 - m));
      bits(c, 14, v, 44, '#8fe04a', '#a56fd0', 0.3, 30); bits(c, 10, clamp01(v * 1.3 - 0.2), 30, '#f6e8c8', '#8fe04a', 2.2, 40);
    } else {
      // Hổ Lửa: lửa tắt, hoá tro rồi tan
      blit(c, s, x, y, { flip: f < 0, alpha: v > 0.8 ? 0.4 : v > 0.6 ? 0.7 : 1, tint: ['#4a4040', Math.min(0.85, 0.2 + v)] });
      c.translate(x, y - 8);
      for (let i = 0; i < 9; i++) { const bu = clamp01(v * 1.5 - i * 0.09); if (bu > 0 && bu < 1) px(c, -30 + i * 8 + Math.sin(bu * 7 + i) * 4, 4 - bu * 46, bu < 0.5 ? 2 : 1, bu < 0.5 ? 2 : 1, i % 2 ? '#ff7a2a' : '#ffd23f'); } // tàn lửa bay lên
    }
    c.restore();
  }

  // ---------- đạn của xạ thủ: mỗi vùng một kiểu ----------
  const SHOT = [[PURP, TOX], [ICE, FOAM], [FIRE, FLAME]];
  function monShot(c, o, reg) {
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10)), f = Math.floor((G.time || 0) * 12) % 2, k = o.vx < 0 ? 1 : -1;
    const B = o.el && ELP[o.el] ? ELP[o.el].B : SHOT[reg][0], B2 = SHOT[reg][1];
    px(c, x - 3, Math.round(o.y), 6, 1, 'rgba(0,0,0,0.3)');
    px(c, x + k * 5, y - 1 + f, 2, 2, hexA(B[1], 0.7)); px(c, x + k * 8, y + 1 - f, 1, 1, hexA(B[2], 0.6));
    blob(c, x, y, 3, B);
    if (reg === 0) { px(c, x - 1, y - 5, 2, 2, B2[1]); px(c, x + 1, y - 6, 1, 1, B2[2]); }
    else if (reg === 1) { px(c, x - 1, y - 1, 2, 2, '#ffffff'); if (f) { px(c, x - 5, y, 1, 1, '#ffffff'); px(c, x + 4, y - 3, 1, 1, '#ffffff'); } }
    else { px(c, x - 1, y - 1, 3, 2, B2[1]); px(c, x, y - 1, 1, 1, B2[2]); px(c, x + k * 3, y - 4 - f, 2, 2, B[2]); }
  }

  // ---------- trùm vùng: mỗi trùm một hàm vẽ riêng, khai ở các phần dưới ----------
  // BDRAW[kind](c, b, t): c đã dời theo camera, b.x và b.y là toạ độ thế giới.
  const BDRAW = {};

  // ====================================================================
  // 8A. MỘC TINH TRONG GAME
  // Đòn: sweep (giơ tay lấy đà rồi quất roi dây leo ngang nửa sân, sau đó mệt lộ lõi nhựa), roots (cắm tay bơm rễ, ụ đất chạy ngầm tới chỗ rễ trồi),
  // fruit (rung tán cho quả độc rụng), summon (gầm gọi bầy), thorn (gai quanh gốc bung ra). Thêm: gầm đổi giai đoạn, lết đi ở giai đoạn 2, choáng, đóng băng, gục.
  // Thân trùm là hình dựng sẵn (BOSS.moc); roi dài, ụ đất, quả bay, lá rơi thì vẽ thẳng lên màn theo toạ độ thế giới.
  // ====================================================================
  const mcQz = (v, n) => Math.round(v * n) / n;
  const MCV_L = 480; // chiều dài dải hình roi
  let mcVineS = null, mcStumpS = null;
  // Dải hình roi dây leo nằm ngang: ngọn ở x = 0 (bên trái), gốc dày dần về bên phải.
  function mcVine() {
    if (mcVineS) return mcVineS;
    const S = new Spr(MCV_L + 20, 30, 10, 15), wy = (x) => Math.sin(x * 0.045) * 1.6;
    S.part((s) => {
      for (let x = 14, i = 0; x < MCV_L - 6; x += 15, i++) rgLeaf(s, x, wy(x) + (i & 1 ? -1 : 1), i & 1 ? -40 : 40, 6, 3.4, i % 3 ? GRN : TOX);
      const pts = []; for (let x = 0; x <= MCV_L; x += 30) pts.push([x, wy(x)]);
      s.cv(pts, 2, 6, GRN);
      s.e(1, 0, 2.6, 2.6, PURP);
      s.in(() => { for (let x = 8, i = 0; x < MCV_L; x += 7, i++) s.p(x, wy(x) - (x > 240 ? 1 : 0), i & 1 ? Lt(GRN) : Dk(GRN)); s.p(0, -1, Lt(PURP)); });
    });
    S.finish();
    return (mcVineS = S.toCanvas());
  }
  // Gốc cây cụt còn lại sau khi thân tách đôi đổ xuống.
  function mcStump() {
    if (mcStumpS) return mcStumpS;
    const S = new Spr(96, 34, 48, 28);
    S.part((s) => { s.l(-28, -4, -38, -2, 4, BARK); s.l(28, -4, 38, -2, 4, BARK); });
    S.part((s) => {
      s.g([[-27, -1], [-26, -9], [-19, -13], [-13, -8], [-6, -14], [1, -9], [8, -15], [14, -9], [21, -12], [26, -8], [27, -1]], BARK);
      s.in(() => { s.e(0, -5, 10, 2.6, Dk(BARK)); s.e(1, -5, 6, 1.4, '#160e0c'); s.l(-18, -9, -17, -3, 1, Dk(BARK)); s.l(17, -8, 18, -3, 1, Dk(BARK)); s.e(-20, -3, 4, 1.4, Md(MOSS)); });
    });
    S.finish();
    return (mcStumpS = S.toCanvas());
  }
  // Roi nằm vắt ngang: dán dải hình theo từng cột, mỗi cột lệch dọc theo đường cong. H là bàn tay, T là ngọn (T ở bên trái H), ya và yb là độ cao hai mốc giữa.
  function mcWhipStrip(c, H, T, ya, yb) {
    const s = mcVine(), L = Math.min(MCV_L, Math.round(H[0] - T[0]));
    if (L < 8) return;
    const P = [[0, T[1]], [1, yb], [2, ya], [3, H[1]]], h = s.cv.height, tx = Math.round(T[0]);
    for (let j = -4; j < L; j += 2) {
      const yy = Math.round(rgCR(P, Math.max(0, j) / L)[1]);
      c.drawImage(s.cv, s.ox + j, 0, 2, h, tx + j, yy - s.oy, 2, h);
    }
  }
  // Roi đang vung nhanh: vẽ bằng nét thẳng nối nhau (đi được mọi hướng), có viền tối và vài chiếc lá.
  function mcWhipLine(c, pts) {
    const N = 14, q = [];
    for (let i = 0; i <= N; i++) { const p = rgCR(pts, i / N); q.push([Math.round(p[0]), Math.round(p[1])]); }
    const th = (i) => (i < 5 ? 4 : i < 10 ? 3 : 2);
    for (let i = 0; i < N; i++) line(c, q[i][0] - 1, q[i][1] - 1, q[i + 1][0] - 1, q[i + 1][1] - 1, INK, th(i) + 2);
    for (let i = 0; i < N; i++) line(c, q[i][0], q[i][1], q[i + 1][0], q[i + 1][1], GRN[1], th(i));
    for (let i = 0; i < N; i++) line(c, q[i][0], q[i][1], q[i + 1][0], q[i + 1][1], GRN[2], 1);
    for (let i = 2; i < N; i += 2) { px(c, q[i][0] - 1, q[i][1] - 3, 4, 3, INK); px(c, q[i][0], q[i][1] - 2, 2, 2, i & 2 ? TOX[2] : TOX[1]); }
    const e = q[N]; px(c, e[0] - 2, e[1] - 2, 5, 5, INK); px(c, e[0] - 1, e[1] - 1, 3, 3, PURP[2]);
  }
  // Lá rơi quanh gốc (x, y): n lá, v là tiến độ 0..1, spread là độ toả ngang, fall là quãng rơi.
  function mcLeaves(c, x, y, n, v, spread, seed, fall, dry) {
    if (v <= 0 || v >= 1) return;
    for (let i = 0; i < n; i++) {
      const h1 = hsh(i + seed), h2 = hsh(i * 3 + seed + 5), vv = clamp01(v * 1.3 - h2 * 0.3);
      if (vv <= 0 || vv >= 1) continue;
      const lx = (h1 - 0.5) * 100 + (h1 - 0.5) * spread * vv + Math.sin(vv * 9 + i) * 5, ly = -120 + h2 * 34 + (fall || 110) * vv * vv - 10 * vv;
      px(c, x + lx, y + ly, 2 + (i & 1), 1 + ((i >> 1) & 1), dry ? (i % 3 ? WD[1] : WD[2]) : i % 3 ? GRN[1] : TOX[2]);
    }
  }
  // Làm tròn tư thế để các khung giống nhau dùng lại hình trong kho.
  function mcQuant(Q) {
    Q.lean = mcQz(Q.lean, 20); Q.slump = mcQz(clamp01(Q.slump), 6); Q.breath = mcQz(Q.breath, 2); Q.sway = mcQz(Q.sway, 2); Q.blink = Q.blink > 0.5 ? 1 : 0;
    Q.mouth = mcQz(clamp01(Q.mouth), 10); Q.core = mcQz(clamp01(Q.core), 5); Q.eyeGlow = Q.eyeGlow > 0.5 ? 1 : 0;
    for (const k of ['la1', 'la2', 'ra1', 'ra2']) Q[k] = Math.round(Q[k] / 2) * 2;
    Q.gripL = mcQz(Q.gripL, 2); Q.gripR = mcQz(Q.gripR, 2); Q.dig = mcQz(Q.dig, 3); Q.pump = mcQz(Q.pump, 3); Q.shake = Math.round(Q.shake);
    Q.thorn = mcQz(Q.thorn, 5); Q.burst = mcQz(Q.burst, 3); Q.footL = Q.footL > 0.5 ? 1 : 0; Q.footR = Q.footR > 0.5 ? 1 : 0; Q.crack = mcQz(Q.crack, 2); Q.pulse = mcQz(Q.pulse, 2);
    Q.whip = 0; Q.fruit = 0; // roi và quả do phần này tự vẽ
    return Q;
  }
  const mcKey = (Q, X) => { let k = (X.el || '') + (X.weak || '') + X.aR + X.aM + X.aD + X.phase; for (const f in Q) k += '|' + Q[f]; return k; };
  // Chỗ quả mọc trên tán (tính từ gốc), theo thứ tự rụng.
  const MC_FRUIT = [[-19, -96], [25, -95], [5, -99], [-39, -84], [41, -85]];

  BDRAW.moc = function (c, b, t) {
    const x = Math.round(b.x), y = Math.round(b.y), X = layersX(b), st = b.st || ST0, D = BOSS.moc;
    if (b.dying != null) return mcDie(c, b, t, x, y, X, clamp01(b.dying));
    const an = b.anim, a = an ? an.t : 0, j2 = Math.floor(t * 30) & 1, frozen = st.frozen > 0, leafy = X.phase < 1;
    const Q = D.pose();
    let jx = 0, dy = 0, urgent = false, whip = null;
    const pre = [], post = []; // phần vẽ trước và sau thân
    // ---- đứng yên: vòng lặp 16 khung (6 khung mỗi giây), mọi thứ suy ra từ i16 ----
    // Chỉ lúc thật sự rảnh mới chạy vòng lặp này; đang ra đòn, gầm, mệt, đi, choáng thì các số nền đứng yên để số tư thế không nhân lên.
    const calm = !an && !(b.roarT > 0) && !(b.exposed > 0) && !b.walking && !(st.stun > 0);
    if (calm) {
      const i16 = frozen ? 0 : Math.floor(t * 6) % 16, ph = (i16 / 16) * Math.PI * 2;
      Q.lean = 0.1 * Math.sin(ph); Q.breath = 0.5 - 0.5 * Math.cos(ph * 2); Q.sway = Math.sin(ph);
      Q.blink = i16 === 5 ? 1 : 0; Q.mouth = i16 === 11 || i16 === 12 ? 0.2 : 0; Q.core = i16 & 4 ? 0.4 : 0.2;
      Q.la2 = 100 + 4 * Math.sin(ph); Q.ra2 = 100 + 4 * Math.sin(ph + 2);
      Q.pulse = (i16 >> 1) & 1 ? 1 : 0; Q.crack = (i16 >> 2) & 1 ? 1 : 0.5;
    } else { Q.core = 0.4; Q.pulse = 0.5; Q.crack = 1; }
    if (b.exposed > 0) {
      // mệt, thở dốc, lõi nhựa lòi ra: lúc để người chơi đánh
      const k = Math.floor(t * 6) & 3;
      Q.eye = 'tired'; Q.slump = k === 1 ? 0.83 : 1; Q.mouth = k & 1 ? 1 : 0.8; Q.core = 1; Q.lean = -0.25;
      Q.la1 = 55; Q.la2 = 108; Q.ra1 = 55; Q.ra2 = 108; Q.pulse = k >> 1;
    }
    if (b.walking && !an) {
      // lết từng bước: nghiêng qua lại, hai chân rễ thay nhau nhấc lên (vòng 12 khung)
      const i12 = Math.floor(t * 10) % 12, s = Math.sin((i12 / 12) * Math.PI * 2);
      Q.lean = 0.28 * s; Q.footL = s > 0.3 ? 1 : 0; Q.footR = s < -0.3 ? 1 : 0; dy = Math.abs(s) > 0.75 ? -1 : 0;
      Q.la1 = 42 - 8 * s; Q.la2 = 100 + 10 * s; Q.ra1 = 42 + 8 * s; Q.ra2 = 100 - 10 * s; Q.sway = s; Q.crack = i12 % 6 < 3 ? 1 : 0.5;
      if (!(b.exposed > 0)) { Q.eye = 'angry'; Q.mouth = 0.3; }
      const ss = Math.sin(t * 5.236), v = Math.abs(ss) < 0.3 ? 1 - Math.abs(ss) / 0.3 : 0;
      if (v > 0) post.push(() => { const fx = x + (ss > 0 ? 34 : -42); px(c, fx - 4, y - 2 - Math.round(v * 3), 2, 2, 'rgba(230,214,170,0.7)'); px(c, fx + 8, y - 1 - Math.round(v * 4), 2, 1, 'rgba(230,214,170,0.6)'); px(c, fx + 2, y - 3 - Math.round(v * 5), 1, 1, 'rgba(230,214,170,0.5)'); });
    }
    if (an) {
      if (an.name === 'sweep') {
        const F = an.fire, zc = (an.y0 + an.y1) / 2 - b.y, far = Math.min(-120, an.x0 - b.x + 30);
        const aim = Math.atan2(zc + 62, 70) / D2R, L0 = F - 0.09, L1 = L0 + 0.14; // roi quất trong khoảng L0..L1, vắt qua đúng lúc F
        Q.ra1 = 60; Q.ra2 = 110;
        if (a < L0) {
          // giơ tay ra sau lấy đà, dây leo mọc dài ra từ bàn tay
          const k0 = smooth(clamp01(a / (F * 0.7))), k = mcQz(k0, 6);
          Q.lean = 0.45 * k; Q.eye = 'angry'; Q.eyeGlow = k > 0.5 ? 1 : 0; Q.mouth = k > 0.5 ? 0.2 : 0; Q.core = 0.3 + 0.5 * k; Q.slump = 0;
          Q.la1 = lerp(42, -55, k); Q.la2 = lerp(100, -105, Math.min(1, k * 1.8)); Q.stub = k > 0.3 ? 1 : 0;
          if (a > F * 0.7) jx = j2;
          if (k > 0.3) whip = { m: 'up', k: smooth(clamp01((k0 - 0.3) / 0.7)), q: a > F * 0.7 ? j2 * 2 - 1 : 0 };
        } else {
          Q.stub = 1; Q.slump = 0;
          if (a < L1) {
            // quất xuống
            const v = (a - L0) / 0.14, h = v < 0.3 ? 0.4 : 1;
            Q.lean = lerp(0.45, -0.6, h); Q.eye = 'angry'; Q.eyeGlow = 1; Q.mouth = 0.7; Q.core = 0.8;
            Q.la1 = lerp(-55, aim + 6, h); Q.la2 = lerp(-105, aim - 6, h); urgent = true;
            whip = { m: 'lash', v, zc, far };
          } else if (a < F + 0.5) {
            // roi nằm vắt ngang sân, bụi tung dọc đường quất
            const v = (a - L1) / (F + 0.5 - L1);
            Q.lean = v < 0.5 ? -0.6 : -0.45; Q.eye = 'angry'; Q.mouth = 0.7; Q.core = Math.max(Q.core, 0.8);
            Q.la1 = aim + 6; Q.la2 = aim - 6; urgent = v < 0.2;
            whip = { m: 'hold', v, zc, far, sh: v < 0.3 ? j2 : 0 };
          } else {
            // thu roi về, người sụp xuống
            const v = smooth(clamp01((a - F - 0.5) / 0.45)), vq = mcQz(v, 4);
            Q.lean = lerp(-0.45, -0.25, vq); Q.eye = vq > 0.4 ? 'tired' : 'angry'; Q.mouth = 0.8; Q.core = 1; Q.slump = vq;
            Q.la1 = lerp(aim + 6, 55, vq); Q.la2 = lerp(aim - 6, 108, vq); Q.ra1 = lerp(60, 55, vq); Q.ra2 = lerp(110, 108, vq); Q.stub = vq < 1 ? 1 : 0;
            if (v < 0.97) whip = { m: 'back', v, zc, far };
          }
        }
      } else if (an.name === 'roots') {
        // cắm hai tay xuống đất, bơm rễ; ụ đất chạy ngầm tới từng chỗ rễ sắp trồi
        const m = Math.min(smooth(clamp01(a / 0.2)), smooth(clamp01((an.dur - a) / 0.3))), mq = mcQz(m, 3), beat = Math.floor(a * 10) % 4;
        Q.eye = 'angry'; Q.mouth = 0.3 * mq; Q.slump = 0.8 * mq; Q.dig = mq; Q.lean = -0.15 * mq;
        Q.la1 = lerp(42, 32, mq); Q.la2 = lerp(100, 86, mq); Q.ra1 = Q.la1; Q.ra2 = Q.la2; Q.gripL = Q.gripR = mq;
        Q.pump = mq >= 1 ? beat / 3 : 0;
        if (m > 0.5) { jx = j2 * 2 - 1; dy = beat === 3 ? 1 : 0; }
        post.push(() => {
          const sx = x - 58, sy = y - 1;
          for (const h of an.hits) {
            const u = (a - h.t) / h.fire;
            if (u < 0 || u >= 1) continue;
            const e = easeIn(u), mx = Math.round(lerp(sx, h.x, e)), my = Math.round(lerp(sy, h.y, e)), hx = Math.round(h.x), hy = Math.round(h.y);
            for (let i = 0; i < 10; i++) { const k = (i / 10) * e; if ((i + Math.floor(a * 20)) % 3) px(c, lerp(sx, h.x, k), lerp(sy, h.y, k) + (i % 2), 3, 1, 'rgba(30,18,12,0.7)'); }
            ell(c, mx, my - 2, 6, 3, INK); ell(c, mx, my - 2, 5, 2, rgSOIL[1]); px(c, mx - 4, my - 1, 9, 2, rgSOIL[0]); px(c, mx - 2, my - 4, 4, 1, rgSOIL[2]);
            px(c, mx + 6 + (j2 ? 1 : 0), my - 4 - j2, 2, 2, rgSOIL[2]); px(c, mx - 8 - j2, my - 3, 1, 1, rgSOIL[1]);
            if (u > 0.75) { px(c, hx - 6 + j2 * 2, hy - 3 - j2, 2, 2, rgSOIL[1]); px(c, hx + 4 - j2 * 2, hy - 2 - j2, 2, 2, rgSOIL[2]); px(c, hx - 1, hy - 4 - j2 * 2, 2, 2, rgSOIL[0]); }
          }
        });
      } else if (an.name === 'fruit') {
        // giơ hai tay rung tán: quả chín dần rồi rụng, bay tới chỗ đã báo
        const k = clamp01(1 - a / 0.75), up = smooth(clamp01(a / 0.15)) * smooth(clamp01((an.dur - a) / 0.3)), uq = mcQz(up, 3);
        const shake = k > 0 ? (Math.floor(a * 12) & 1 ? 1 : -1) * Math.round(3 * k) : 0;
        Q.shake = shake; Q.eye = 'angry'; Q.mouth = 0.5 * uq;
        Q.la1 = lerp(42, -58, uq); Q.la2 = lerp(100, -82, Math.min(1, uq * 1.8)); Q.ra1 = Q.la1; Q.ra2 = Q.la2; Q.gripL = Q.gripR = uq > 0.5 ? 0.5 : 0;
        if (k > 0.4) jx = j2;
        post.push(() => {
          an.shots.forEach((s, i) => {
            const f = MC_FRUIT[i % 5], t0 = 0.22 + i * 0.06, sx = x + f[0], z0 = -f[1];
            if (a < t0) {
              const kk = clamp01(a / t0), r = kk > 0.6 ? 3 : 2;
              px(c, sx + shake, y - z0 - r - 3, 1, 3, INK); blob(c, sx + shake, y - z0, r, kk > 0.6 ? PURP : TOX);
            } else lob(c, sx, y, z0, s.x, s.y, (a - t0) / (s.land - t0), 34, PURP, true);
          });
          mcLeaves(c, x, y, leafy ? 8 : 3, clamp01(a / 0.9), 30, 11, 110, !leafy);
        });
      } else if (an.name === 'thorn') {
        // gồng người, gai quanh gốc dựng dần rồi bung ra
        const u = clamp01(a / an.fire), aft = a - an.fire, uq = mcQz(smooth(u), 5);
        Q.eye = 'angry'; Q.lean = -0.15 * uq;
        Q.la1 = lerp(42, 70, uq); Q.la2 = lerp(100, 40, uq); Q.ra1 = Q.la1; Q.ra2 = Q.la2; Q.gripL = Q.gripR = uq;
        if (aft < 0) { Q.thorn = uq; Q.slump = 0.5 * uq; if (u > 0.6) jx = j2; dy = u > 0.5 ? 1 : 0; }
        else if (aft < 0.15) { Q.thorn = 1; Q.burst = 1; Q.slump = 0.67; Q.mouth = 0.7; dy = 2; urgent = true; }
        else { const d = mcQz(Math.max(0, 1 - (aft - 0.15) / 0.33), 3); Q.thorn = d; Q.burst = 0; Q.slump = 0.5 * d; Q.mouth = aft < 0.3 ? 0.7 : 0; }
      }
    }
    // ---- gầm: gọi bầy, hoặc lúc đổi giai đoạn (to hơn, lá rụng đầy sân) ----
    let roar = an && an.name === 'summon' ? clamp01(a / 0.75) : 0, big = false;
    if (b.roarT > 0) { roar = Math.max(roar, clamp01(1 - b.roarT / 1.2)); big = true; }
    if (roar > 0 && roar < 1) {
      const n = big ? 12 : 8, r = Math.floor(roar * n) / n; // nấc của tư thế
      const tail = r > 0.8 ? (1 - r) / 0.2 : 1;
      Q.lean = (r < 0.2 ? 0.4 * (r / 0.2) : lerp(0.4, -0.4, smooth(clamp01((r - 0.2) / 0.25)))) * tail;
      Q.mouth = r < 0.15 ? 0.5 : 1; Q.core = 0.6; Q.eye = 'angry'; Q.eyeGlow = 1; Q.slump = 0;
      if (roar > 0.2 && roar < 0.85) jx = j2 * 2 - 1;
      if (!an || an.name === 'summon') {
        const k = smooth(clamp01(r / 0.25)) * tail;
        Q.la1 = lerp(42, -30, k); Q.la2 = lerp(100, -70, Math.min(1, k * 1.8)); Q.ra1 = Q.la1; Q.ra2 = Q.la2;
      }
      post.push(() => {
        const mx = x + Math.round(Q.lean * 5);
        for (let i = 0; i < 3; i++) { const v = clamp01((roar - 0.22 - i * 0.14) / 0.45); if (v > 0 && v < 1) ring(c, mx - 16 - 64 * v, y - 36, 5 + 12 * v, 10 + 22 * v, 'rgba(236,255,200,' + (0.75 * (1 - v)).toFixed(2) + ')', 2); }
        mcLeaves(c, x, y, big ? 30 : 12, roar, big ? 190 : 60, 3, big ? 150 : 110, !leafy && !(big && b.roarPh === 1));
      });
    }
    if (st.stun > 0) { Q.eye = 'dazed'; Q.sway = Math.floor(t * 6) & 1 ? 1 : -1; Q.lean += 0.14 * Math.round(Math.sin(t * 9)); Q.eyeGlow = 0; }
    if (b.flash > 0) jx += 1;
    // ---- lấy hình: tư thế đổi không quá khoảng 13 lần mỗi giây, trừ lúc cần khớp đúng khoảnh khắc ra đòn ----
    mcQuant(Q);
    const mm = b._mm || (b._mm = { key: '', s: null, Q: null, tc: -9, loop: new Map() }), key = mcKey(Q, X);
    if (!mm.s || (key !== mm.key && (urgent || t - mm.tc >= 0.075 || t < mm.tc))) {
      // hình của vòng lặp đứng yên và bước đi giữ riêng theo từng con trùm, để kho chung có đẩy ra thì cũng không phải dựng lại
      const keep = calm || (b.walking && !an && !(b.roarT > 0) && !(b.exposed > 0) && !(st.stun > 0));
      let s = keep ? mm.loop.get(key) : null;
      if (!s) { s = bossSpr('moc', Q, X); if (keep) { if (mm.loop.size > 40) mm.loop.clear(); mm.loop.set(key, s); } }
      mm.s = s; mm.Q = Q; mm.key = key; mm.tc = t;
    }
    const s = mm.s, bx = x + jx, by = y + dy;
    ell(c, x, y, 48, 5, 'rgba(0,0,0,0.35)');
    for (const fn of pre) fn();
    if (frozen) { c.save(); c.translate(bx, by); halo(c, s, '#e9f9ff'); blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#a8dcf5', 0.6); c.restore(); }
    else blit(c, s, bx, by, { tint: b.flash > 0 ? ['#fff6dc', 0.35] : null });
    // ---- roi dây leo nối từ bàn tay trái ----
    if (whip) {
      const A = D.anchor(mm.Q), H = [bx + A.handL[0], by + A.handL[1]];
      if (whip.m === 'up') {
        // dây vắt ngược ra sau, phía trên tán
        const k = whip.k, T = [H[0] + 62 * k, H[1] - 24 * k + whip.q];
        mcWhipLine(c, [H, [lerp(H[0], T[0], 0.3), H[1] - 16 * k - whip.q], [lerp(H[0], T[0], 0.7), T[1] - 10 * k + whip.q], T]);
      } else if (whip.m === 'lash') {
        // ngọn roi vòng qua đầu rồi quất xuống sân; ba vệt mờ bám theo
        const tx = x + whip.far, ty = y + whip.zc, R1 = Math.hypot(tx - H[0], ty - H[1]), a1 = Math.atan2(ty - H[1], tx - H[0]) - (ty > H[1] ? Math.PI * 2 : 0);
        // góc quay xong đúng lúc đòn nổ (v = 0.42), sau đó roi mới duỗi hết chiều dài
        const pa = (v) => smooth(clamp01(v / 0.42)), pr = (v) => easeIn(clamp01(v / 0.75));
        const at = (v, f, lag) => { const ang = lerp(-0.4, a1, pa(v)) + lag * (1 - pa(v)), R = lerp(66, R1, pr(v)) * f; return [H[0] + Math.cos(ang) * R, H[1] + Math.sin(ang) * R]; };
        for (let i = 3; i >= 1; i--) { const v2 = whip.v - i * 0.07; if (v2 > 0) { const p = at(v2, 1, 0), q = at(v2, 0.45, 0.4); line(c, Math.round(q[0]), Math.round(q[1]), Math.round(p[0]), Math.round(p[1]), 'rgba(236,255,200,' + (0.45 - i * 0.1).toFixed(2) + ')', 2); } }
        mcWhipLine(c, [H, at(whip.v, 0.4, 0.5), at(whip.v, 0.75, 0.22), at(whip.v, 1, 0)]);
      } else {
        const tx = x + whip.far, ty = y + whip.zc;
        if (whip.m === 'hold') {
          const sh = whip.sh;
          mcWhipStrip(c, H, [tx, ty], lerp(H[1], ty, 0.7) - 5 + sh, ty - 3 - sh);
          const v = whip.v;
          if (v < 0.25) { const al = (1 - v / 0.25).toFixed(2); px(c, tx, ty - 1, Math.round(H[0] - tx) - 20, 2, 'rgba(255,255,255,' + al + ')'); px(c, tx + 10, ty - 6, Math.round(H[0] - tx) - 60, 1, 'rgba(236,255,200,' + al + ')'); px(c, tx + 10, ty + 5, Math.round(H[0] - tx) - 60, 1, 'rgba(236,255,200,' + al + ')'); }
          const nD = Math.max(6, Math.round((H[0] - tx) / 34));
          for (let i = 0; i < nD; i++) { // bụi đất dọc đường roi quất
            const dx = lerp(H[0] - 30, tx, i / (nD - 1)), h = hsh(i + 1), vv = clamp01(v * 1.6 - h * 0.3);
            if (vv > 0 && vv < 1) { px(c, dx + (h - 0.5) * 10, ty - 4 - 18 * vv + 12 * vv * vv, 2, 2, 'rgba(230,214,170,' + (0.9 * (1 - vv)).toFixed(2) + ')'); px(c, dx + 5, ty - 2 - 10 * vv, 1, 1, '#8a6a44'); px(c, dx - 7 + h * 6, ty + 2 - 7 * vv, 2, 1, 'rgba(230,214,170,' + (0.6 * (1 - vv)).toFixed(2) + ')'); }
          }
        } else {
          // rút roi về: ngọn chạy ngược về bàn tay
          const v = whip.v, T = [lerp(tx, H[0] - 6, v), lerp(ty, H[1] + 8, v)];
          mcWhipStrip(c, H, T, lerp(H[1], T[1], 0.7) - 5 * (1 - v), T[1] - 3 * (1 - v));
        }
      }
    }
    // ---- hiệu ứng nhẹ quanh thân ----
    if (b.exposed > 0 && mm.Q.core >= 0.8) {
      // lõi nhựa đập: vòng sáng nhấp nháy và nhựa nhỏ giọt, cho thấy đây là lúc đánh
      const A = D.anchor(mm.Q), mx = bx + Math.round(A.mouth[0]), my = by + Math.round(A.mouth[1]) + 6, k = (t * 2.2) % 1;
      ring(c, mx, my, 9 + 9 * k, 9 + 9 * k, hexA(ELP.poison.glow, 0.8 * (1 - k)), 1);
      for (let i = 0; i < 3; i++) { const v = (t * 1.3 + i * 0.37) % 1; px(c, mx - 5 + i * 5, my + 9 + v * v * 26, 2, v < 0.5 ? 3 : 2, hexA(ELP.poison.B[1], 1 - v)); }
    }
    if (!frozen) {
      if (leafy) mcLeaves(c, x, y, 2, (t * 0.35) % 1, 20, Math.floor(t * 0.35), 110, false);
      else for (let i = 0; i < 3; i++) { const ly = (t * 16 + i * 37) % 110; px(c, x - 34 + i * 30 + Math.sin(t * 2 + i) * 5, y - 118 + ly, 2, 1, i & 1 ? WD[2] : MOSS[1]); }
    }
    for (const fn of post) fn();
    drawFx(c, b);
  };

  // Mộc Tinh gục: nứt toác từ lõi, lõi tắt, thân tách đôi đổ sang hai bên, còn lại gốc cụt bốc khói.
  const MC_CRACK = [[0, -34], [-3, -46], [2, -58], [-2, -70], [3, -82], [-1, -96], [2, -110], [0, -122], [0, -34], [3, -26], [-2, -18], [2, -9], [0, 0]];
  function mcDie(c, b, t, x, y, X, k) {
    const D = BOSS.moc, SAP = ELP.poison, leafy = X.phase < 1;
    const A0 = 0.42, u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0)), uq = mcQz(u, 3);
    const Q = D.pose();
    Q.eye = k > 0.3 ? 'dead' : 'angry'; Q.mouth = 1; Q.core = k > 0.3 ? 0 : (Math.floor(t * 10) & 1 ? 1 : 0.6); Q.eyeGlow = k > 0.3 ? 0 : 1; Q.lookX = 0;
    Q.slump = 0.5 * uq; Q.la1 = lerp(42, 78, uq); Q.la2 = lerp(100, 102, uq); Q.ra1 = Q.la1; Q.ra2 = Q.la2; Q.crack = 1; Q.pulse = 0;
    mcQuant(Q);
    const s = bossSpr('moc', Q, X), w = s.cv.width, h = s.cv.height;
    ell(c, x, y, 48 + 20 * v, 5, 'rgba(0,0,0,' + (0.35 * (1 - v * 0.6)).toFixed(2) + ')');
    // ghép thân và vết nứt vào một khung nháp để tách đôi
    const g = scr('mocAll', w, h);
    g.drawImage(s.cv, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    const hot = k < 0.33, n = Math.round((MC_CRACK.length - 1) * clamp01(u * 1.3));
    for (let i = 0; i < n; i++) {
      if (i === 7) continue;
      const a0 = MC_CRACK[i], a1 = MC_CRACK[i + 1], x0 = s.ox + a0[0], y0 = s.oy + a0[1], x1 = s.ox + a1[0], y1 = s.oy + a1[1];
      line(g, x0 - 1, y0, x1 - 1, y1, hot ? SAP.B[1] : '#160e0c', 3);
      if (hot) line(g, x0, y0, x1, y1, SAP.hot, 1);
      if (i % 2) line(g, x1, y1, x1 + (i % 4 === 1 ? 8 : -8), y1 - 5, hot ? SAP.glow : '#160e0c', 1);
    }
    g.globalCompositeOperation = 'source-over';
    let img = g.canvas;
    if (k > 0.3 && k < 0.36) img = tinted('mt', img, '#ffffff', 0.7); // loé sáng lúc lõi tắt
    else if (k >= 0.36) img = tinted('mt', img, '#120c0c', Math.min(0.55, 0.25 + v * 0.4));
    if (k < A0) {
      // rung bần bật, tia nhựa sáng bắn ra từ các vết nứt
      const j = (Math.floor(t * 30) & 1) * 2 - 1;
      c.drawImage(img, 0, 0, w, h, x - s.ox + j * (u > 0.5 ? 2 : 1), y - s.oy, w, h);
    } else {
      // hai nửa đổ sang hai bên, nảy nhẹ khi chạm đất
      const fall = easeIn(clamp01(v / 0.62)), bounce = v > 0.62 && v < 0.8 ? Math.sin(((v - 0.62) / 0.18) * Math.PI) * 0.06 : 0;
      const ang = (Math.PI / 2 - 0.12) * fall - bounce, al = v > 0.94 ? 0.35 : v > 0.88 ? 0.6 : v > 0.82 ? 0.85 : 1;
      c.save(); c.globalAlpha *= al;
      c.save(); c.translate(x - 27, y); c.rotate(-ang); c.drawImage(img, 0, 0, s.ox, h, -s.ox + 27, -s.oy, s.ox, h); c.restore();
      c.save(); c.translate(x + 27, y); c.rotate(ang * 0.92); c.drawImage(img, s.ox, 0, w - s.ox, h, -27, -s.oy, w - s.ox, h); c.restore();
      c.restore();
      const sp = mcStump(); c.drawImage(tinted('mt', sp.cv, '#120c0c', 0.3), 0, 0, sp.cv.width, sp.cv.height, x - sp.ox, y - sp.oy, sp.cv.width, sp.cv.height);
      for (let i = 0; i < 8; i++) { // khói và tàn nhựa bốc lên từ lõi
        const bu = clamp01(v * 1.6 - i * 0.1);
        if (bu > 0 && bu < 1) px(c, x - 12 + i * 4 + Math.sin(bu * 6 + i) * 5, y - 10 - bu * 70, bu < 0.4 ? 3 : 2, bu < 0.4 ? 3 : 2, bu < 0.25 ? SAP.glow : i % 2 ? '#5a4a44' : '#3a302c');
      }
      if (v > 0.6) { c.save(); c.translate(x - 84, y - 6); bits(c, 12, (v - 0.6) / 0.4, 36, '#8a6a44', GRN[1], 0.6, 16); c.translate(168, 0); bits(c, 12, (v - 0.6) / 0.4, 36, '#8a6a44', GRN[1], 2.6, 16); c.restore(); }
    }
    mcLeaves(c, x, y, leafy ? 34 : 10, clamp01(k * 1.15), 150, 7, 150, !leafy);
    c.save(); c.translate(x, y - 42); for (let i = 0; i < 3; i++) bits(c, 9, (u - i * 0.3) / 0.45, 48, SAP.glow, BARK[2], i * 2.2 + 0.4, 20); c.restore();
  }

  // ====================================================================
  // 8B. NGƯ TINH TRONG GAME
  // Đòn: charge (lặn rồi lao ngang từng hàng), spout (phun bọc nước), wave (đập đuôi tạo sóng), dive (lặn rồi trồi lên dưới chân),
  // spikes (dựng gai bung ra). Thêm: gầm lúc nước dâng, mệt lộ mang, choáng, gục.
  // ====================================================================
  const NGF = {};
  // Vây lưng rẽ nước lúc cá đang lặn.
  function nguFinSpr(small) {
    const k = small ? 's' : 'b';
    if (NGF[k]) return NGF[k];
    const S = new Spr(48, 40, 24, 34);
    S.part((s) => {
      if (small) s.g([[-6, 0], [-3, -8], [1, -13], [3, -7], [7, 0]], ICE);
      else s.g([[-10, 0], [-7, -9], [-2, -17], [2, -24], [5, -14], [8, -8], [12, 0]], ICE);
      s.in(() => { if (small) { s.l(0, -11, -2, -1, 1, Dk(ICE)); s.l(2, -7, 3, -1, 1, Dk(ICE)); } else { s.l(1, -21, -3, -1, 1, Dk(ICE)); s.l(4, -13, 4, -1, 1, Dk(ICE)); s.l(-5, -9, -6, -1, 1, Dk(ICE)); s.l(2, -23, 2, -18, 1, Lt(FOAM)); } });
    });
    S.finish();
    return (NGF[k] = S.toCanvas());
  }
  function nguFin(c, x, y, t, small, shake) {
    const fx = Math.round(Math.sin(t * 3) * 3) + (shake ? (Math.floor(t * 30) & 1) : 0), f = Math.floor(t * 6) % 2;
    x = Math.round(x); y = Math.round(y);
    ell(c, x, y + (small ? 2 : 3), small ? 16 : 46, small ? 3 : 6, 'rgba(8,18,34,0.4)');
    const s = nguFinSpr(small);
    c.drawImage(s.cv, x + fx - s.ox, y - s.oy);
    const w = small ? 14 : 34;
    px(c, x - (w >> 1), y - 1, w, 2, 'rgba(225,245,255,0.9)');
    px(c, x - (w >> 1) - 8 - f * 2, y + 1, 10, 1, 'rgba(210,240,252,0.6)');
    px(c, x + (w >> 1) - 2 + f * 2, y + 1, 10, 1, 'rgba(210,240,252,0.6)');
    if (!small) px(c, x - 12 + f * 3, y + 3, 8, 1, 'rgba(210,240,252,0.4)');
  }
  // Bọt và sóng quanh thân. back = true là lớp bóng nước phía sau; false là bọt phía trước.
  function nguFoam(c, x, y, t, f, back, wild) {
    if (back) { ell(c, x, y + 1, 80, 7, 'rgba(8,18,34,0.38)'); ell(c, x, y + 1, 74, 5, 'rgba(120,190,225,0.42)'); return; }
    const k = Math.floor(t * 5) % 2;
    for (const q of [[-72, 2, 16], [-46, 4, 22], [-14, 3, 18], [18, 5, 24], [48, 3, 16], [70, 1, 10]]) px(c, x + f * q[0] - q[2] / 2 + (k ? 3 : 0), y + q[1], q[2], 2, 'rgba(234,248,255,0.92)');
    for (const q of [[-58, 7, 20], [-20, 8, 26], [30, 9, 22], [64, 6, 12], [-90, 4, 10], [88, 4, 10]]) px(c, x + f * q[0] - q[2] / 2 - (k ? 3 : 0), y + q[1], q[2], 1, 'rgba(159,212,240,0.8)');
    const n = wild ? 10 : 6;
    for (let i = 0; i < n; i++) { const v = (t * (0.7 + (i % 3) * 0.2) + i * 0.37) % 1; px(c, x - 84 + ((i * 53) % 168), y + 1 - Math.round(v * (wild ? 12 : 7)), 2, 2, 'rgba(255,255,255,' + (0.9 * (1 - v)).toFixed(2) + ')'); }
  }
  // Dán con cá: (x, y) là mặt nước dưới bụng. o.f hướng mặt (1 phải, -1 trái), o.pitch ngóc đầu (radian, dương là đầu lên),
  // o.px, o.py tâm xoay (hệ quay mặt sang phải), o.sx, o.sy co giãn quanh giữa thân, o.clipY cắt phần chìm.
  function nguBlit(c, s, x, y, o) {
    c.save();
    if (o.clipY != null) { c.beginPath(); c.rect(x - 320, o.clipY - 420, 640, 420); c.clip(); }
    c.translate(Math.round(x + (o.dx || 0)), Math.round(y + (o.dy || 0)));
    c.scale(o.f < 0 ? -1 : 1, 1);
    if (o.pitch) { const ax = o.px || 0, ay = o.py == null ? -24 : o.py; c.translate(ax, ay); c.rotate(-o.pitch); c.translate(-ax, -ay); }
    if ((o.sx && o.sx !== 1) || (o.sy && o.sy !== 1)) { c.translate(0, -24); c.scale(o.sx || 1, o.sy || 1); c.translate(0, 24); }
    if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.sil) blitT(c, 'sil', s.cv, -s.ox, -s.oy, o.sil, 1, 'source-in');
    else if (o.tint) blitT(c, 'tint', s.cv, -s.ox, -s.oy, o.tint[0], o.tint[1]);
    else c.drawImage(s.cv, -s.ox, -s.oy);
    c.restore();
  }
  const qz = (v, n) => Math.round(v * n) / n;
  // Làm tròn tư thế để các khung giống nhau dùng lại hình trong kho.
  function nguQ(Q) {
    Q.jaw = qz(clamp01(Q.jaw), 6); Q.tail = qz(Math.max(-1, Math.min(1, Q.tail)), 6); Q.up = qz(Math.max(0, Q.up), 5); Q.red = Q.red > 0.5 ? 1 : 0;
    Q.wh = qz(Q.wh, 3); Q.puff = qz(Q.puff, 2); Q.glow = Q.glow > 0.5 ? 1 : 0; Q.pf = qz(Q.pf, 2); Q.pulse = Q.pulse > 0.5 ? 1 : 0; Q.orb = qz(Q.orb, 8); Q.blink = Q.blink > 0.5 ? 1 : 0;
    return Q;
  }
  BDRAW.ngu = function (c, b, t) {
    const x = Math.round(b.x), y = Math.round(b.y), W = (G.getWorld && G.getWorld()) || {}, cam = W.cam || 0;
    const dying = b.dying != null ? clamp01(b.dying) : null;
    const an = dying != null ? null : b.anim, a = an ? an.t : 0;
    const f = b.face > 0 ? 1 : -1, X = layersX(b), j2 = Math.floor(t * 30) & 1;
    // tư thế mặc định: bơi tại chỗ, nhấp nhô, há ngậm miệng, mang phập phồng, râu phất (vòng lặp 2 giây, 16 khung)
    const i16 = Math.floor(t * 8) % 16, ph = (i16 / 16) * Math.PI * 2;
    const Q = { jaw: 0.17 + 0.12 * Math.sin(ph), tail: 0.16 * Math.sin(ph * 2), up: 0, red: 0, eye: 'normal', blink: t % 3.9 < 0.12 ? 1 : 0, look: 1, gill: Math.sin(ph) > 0.3 ? 1 : 0, pf: (i16 >> 2) & 1 ? 0.5 : 0, wh: Math.sin(ph + 1) * 0.67, puff: 0, glow: 0, pulse: (i16 >> 2) & 1, orb: i16 / 16 };
    const O = { f, dy: Math.round(Math.sin(t * 1.7) * 2), dx: 0, pitch: 0, px: 0, py: -24, sx: 1, sy: 1, clipY: y + 4 };
    let body = true, fin = null, foam = true;
    const post = []; // phần vẽ sau thân (nước bắn, đạn nước...)
    if (b.spikes) { Q.up = 0.6; Q.red = 1; }
    if (b.exposed > 0 && dying == null) {
      // nổi lên thở dốc, lộ mang
      Q.jaw = 0.55 + 0.3 * (Math.floor(t * 8) & 1); Q.eye = 'dazed'; Q.gill = 2; O.dy += 2; Q.tail = 0.2 * Math.sin(t * 8);
      const v = (t * 1.6) % 1;
      post.push(() => { px(c, x + f * (78 + v * 12), y - 26 - v * 10, 2, 2, 'rgba(225,245,255,' + (0.8 * (1 - v)).toFixed(2) + ')'); px(c, x + f * (72 + v * 8), y - 16 - v * 16, 2, 2, 'rgba(225,245,255,0.7)'); });
    }
    if (b.st && b.st.stun > 0 && dying == null) { Q.eye = 'dazed'; O.pitch = Math.sin(t * 9) * 0.04; }
    const surface = (v) => {
      // trồi lên khỏi mặt nước
      v = clamp01(v);
      O.dy = Math.round(50 * (1 - easeOut(v)) - 6 * Math.sin(v * Math.PI)); O.pitch = 0.18 * (1 - v); Q.jaw = 0.8;
      post.push(() => splash(c, x + f * 10, y, v, 66, 18));
    };
    const dive = (v) => {
      // chúi đầu lặn xuống
      O.pitch = -0.55 * easeOut(v); O.dy = Math.round(56 * easeIn(v)); O.dx = f * Math.round(10 * v); Q.jaw = 0; Q.tail = 0.7 * v;
      post.push(() => splash(c, x + f * 30, y, v, 52, 12));
    };
    if (an) {
      if (an.name === 'spout') {
        // ngửa đầu, phồng má rồi phun từng bọc nước
        const first = an.shots.length ? an.shots[0].land - 0.5 : 0.35, last = an.shots.length ? an.shots[an.shots.length - 1].land - 0.5 : 0.5;
        const up = smooth(clamp01(a / first)) * smooth(clamp01((an.dur - a) / 0.4));
        O.pitch = 0.3 * up; O.px = -30; O.py = -8; Q.eye = 'angry';
        Q.jaw = 0; Q.puff = a < first ? clamp01(a / first * 1.5) : 0;
        if (a >= first && a < last + 0.12) { Q.jaw = 0.66; Q.glow = 1; }
        for (const s of an.shots) { const d0 = a - (s.land - 0.5); if (d0 >= 0 && d0 < 0.07) { O.dx = -f * 3; Q.jaw = 1; } }
        const mx = x + f * 60, mz = 30 + 30 * up;
        post.push(() => { for (const s of an.shots) lob(c, mx, y, mz, s.x, s.y, (a - (s.land - 0.5)) / 0.5, 30, ICE, true); });
      } else if (an.name === 'wave') {
        // vểnh đuôi lên rồi đập xuống tạo sóng
        for (const s of an.slaps) {
          const pre = a - (s - 0.55), aft = a - s;
          if (pre >= 0 && aft < 0) { const r = smooth(clamp01(pre / 0.45)); Q.tail = r; O.pitch = -0.1 * r; O.px = 20; Q.eye = 'angry'; if (pre > 0.45) O.dx = j2; }
          else if (aft >= 0 && aft < 0.45) {
            const r = clamp01(aft / 0.12);
            Q.tail = aft < 0.25 ? lerp(1, -0.6, easeOut(r)) : 0; O.pitch = 0.06 * (1 - clamp01(aft / 0.3)); O.dy += aft < 0.15 ? 2 : 0; Q.jaw = 0.66; Q.eye = 'angry';
            const tx = x - f * 74, v = aft / 0.45;
            post.push(() => { splash(c, tx, y, v, 48, 16); const fx2 = lerp(tx, x + f * 50, easeOut(v)); px(c, fx2 - 6, y + 2, 12, 1, 'rgba(225,245,255,' + (0.8 * (1 - v)).toFixed(2) + ')'); px(c, fx2 - 3, y + 5, 8, 1, 'rgba(225,245,255,0.5)'); });
          }
        }
      } else if (an.name === 'spikes') {
        // gai dựng dần rồi bung ra
        const u = clamp01(a / an.fire), aft = a - an.fire;
        Q.red = 1; Q.eye = 'angry';
        if (aft < 0) { Q.up = 0.8 * smooth(u); O.dx = u > 0.5 ? j2 : 0; O.dy += Math.round(2 * u); Q.jaw = 0.3 * u; }
        else if (aft < 0.14) { Q.up = 1.6; O.dy -= 2; Q.jaw = 0.9; }
        else { Q.up = Math.max(0, 1.6 * (1 - (aft - 0.14) / 0.25)); Q.red = aft < 0.3 ? 1 : 0; }
        if (aft >= 0 && aft < 0.22) {
          const v = aft / 0.22, zx = an.zx, zy = an.zy, r = an.r;
          post.push(() => {
            for (let i = 0; i < 16; i++) {
              const ang = i * 0.3927 + 0.2, r0 = r * (0.25 + 0.7 * v), r1 = r * (0.4 + 0.7 * v);
              line(c, Math.round(zx + Math.cos(ang) * r0), Math.round(zy - 14 * (1 - v) + Math.sin(ang) * r0 * 0.6), Math.round(zx + Math.cos(ang) * r1), Math.round(zy - 14 * (1 - v) + Math.sin(ang) * r1 * 0.6), i % 2 ? '#fff0c0' : '#e8492a', 2);
            }
          });
        }
      } else if (an.name === 'charge' || an.name === 'dive') {
        body = false; foam = false;
        if (a < an.dive) { body = true; dive(a / an.dive); }
        else if (a >= an.up) {
          body = true; foam = true;
          const v = (a - an.up) / 0.4;
          if (v < 1) surface(v);
        } else if (a > an.up - 0.35) fin = [x, y, false, a > an.up - 0.12];
        if (an.name === 'charge') {
          for (const r of an.rows) {
            const tt = a - r.t;
            if (tt < 0) continue;
            const uu = tt / r.fire, D = 0.36;
            const xs = r.dir < 0 ? cam + 500 : cam - 20, xe = r.dir < 0 ? cam - 110 : cam + 590;
            if (uu < 1) {
              // vây lượn vào đầu hàng, rung lên trước khi lao
              const fx2 = xs + r.dir * (26 + 44 * smooth(uu));
              fin = [fx2, r.y, false, uu > 0.7];
              post.push(() => { for (let i = 0; i < 4; i++) { const k = (uu * 3 + i * 0.25) % 1; px(c, fx2 - r.dir * (14 + k * 30), r.y - 3 + (i % 2) * 5, 6, 1, 'rgba(225,245,255,' + (0.7 * (1 - k)).toFixed(2) + ')'); } });
            } else if (tt < r.fire + D + 0.25) {
              // cả thân vọt qua hàng, nước rẽ thành vệt
              const vv = (tt - r.fire) / D, bx = lerp(xs + r.dir * 40, xe, vv);
              post.push(() => {
                for (let i = 0; i < 14; i++) {
                  const sx = lerp(xs, xe, i / 13);
                  if (r.dir < 0 ? sx < bx : sx > bx) continue;
                  const age = clamp01((tt - r.fire) / (D + 0.25) - (i / 13) * 0.5), h = hsh(i + 3);
                  px(c, sx, r.y - 2 + h * 6, 16, 1, 'rgba(225,245,255,' + (0.85 * (1 - age)).toFixed(2) + ')');
                  px(c, sx + h * 10, r.y - 6 - 22 * age + 30 * age * age - h * 6, 2, 2, 'rgba(191,234,255,' + (0.9 * (1 - age)).toFixed(2) + ')');
                  px(c, sx + 8 - h * 6, r.y - 3 - 14 * age + 20 * age * age, 1, 1, '#ffffff');
                }
                if (vv < 1) {
                  const s2 = bossSpr('ngu', nguQ(Object.assign({}, Q, { jaw: 1, eye: 'angry', tail: 0.3 * Math.sin(t * 40), up: 0.3, gill: 1, blink: 0 })), X);
                  const o2 = { f: r.dir, dy: -Math.round(12 * Math.sin(vv * Math.PI)) + 6, pitch: 0.14 * Math.cos(vv * Math.PI), clipY: r.y + 5, sx: 1.06, sy: 0.95 };
                  ell(c, bx, r.y, 64, 5, 'rgba(8,18,34,0.3)');
                  nguBlit(c, s2, bx - r.dir * 26, r.y, Object.assign({}, o2, { alpha: 0.3, sil: '#e9f9ff' }));
                  nguBlit(c, s2, bx, r.y, o2);
                  px(c, bx + r.dir * 72 - 8, r.y - 1, 16, 2, '#ffffff');
                  px(c, bx + r.dir * 60 - 6, r.y + 3, 12, 1, '#e9f9ff');
                }
              });
            }
          }
        } else if (an.tx != null) {
          const tx = Math.round(an.tx), ty = Math.round(an.ty), tt = a - an.dive;
          if (a < an.fire) {
            // bóng đen lớn dần dưới chân, vây lượn vòng
            const u = clamp01(tt / (an.fire - an.dive));
            post.push(() => {
              ell(c, tx, ty, 8 + 22 * u, 4 + 12 * u, 'rgba(8,18,34,' + (0.4 + 0.35 * u).toFixed(2) + ')');
              ring(c, tx, ty, 8 + 22 * u, 4 + 12 * u, 'rgba(160,220,250,0.7)');
              for (let i = 0; i < 3; i++) { const k = (a * 1.8 + i * 0.33) % 1; px(c, tx - 12 + i * 11 + Math.sin(a * 5 + i) * 3, ty - k * 12, 2, 2, 'rgba(225,245,255,' + (0.8 * (1 - k)).toFixed(2) + ')'); }
            });
            const ang = a * 7;
            fin = [tx + Math.cos(ang) * 20 * (1 - u * 0.5), ty + Math.sin(ang) * 9 * (1 - u * 0.5), true, u > 0.75];
          } else if (a < an.fire + 0.45) {
            // vọt thẳng lên từ dưới chân người chơi, miệng há hết cỡ
            const vv = (a - an.fire) / 0.45;
            const rise = vv < 0.4 ? lerp(80, -6, easeOut(vv / 0.4)) : lerp(-6, 100, easeIn((vv - 0.4) / 0.6));
            post.push(() => {
              const s2 = bossSpr('ngu', nguQ(Object.assign({}, Q, { jaw: vv < 0.5 ? 1 : 0.34, eye: 'angry', up: 0.4, tail: 0.3 * Math.sin(t * 30), blink: 0 })), X);
              c.save();
              c.beginPath(); c.rect(tx - 90, ty - 280, 180, 284); c.clip();
              c.translate(tx + (vv > 0.4 ? Math.round((vv - 0.4) * 10) : 0), ty + Math.round(rise));
              c.rotate(-Math.PI / 2 - 0.2 * (vv - 0.4));
              c.drawImage(s2.cv, -s2.ox, -s2.oy + 26);
              c.restore();
              splash(c, tx, ty, vv, 46, 20);
              if (vv > 0.55) splash(c, tx + 6, ty, (vv - 0.55) / 0.45, 38, 10);
            });
          }
        }
      }
    } else if (b.hidden && dying == null) { body = false; foam = false; fin = [x, y, false, false]; }
    if (b.roarT > 0 && dying == null && body) {
      // gầm lúc nước dâng
      const r = 1 - b.roarT / 1.2, k = smooth(clamp01(r / 0.2)) * smooth(clamp01((1 - r) / 0.25));
      O.pitch += 0.22 * k; O.px = -30; O.py = -8; Q.jaw = Math.max(Q.jaw, k); Q.eye = 'angry'; O.dx += k > 0.6 ? j2 : 0; Q.up = Math.max(Q.up, 0.6 * k); Q.wh = -0.67 * k;
      post.push(() => { for (let i = 0; i < 3; i++) { const v = clamp01((r - 0.15 - i * 0.15) / 0.45); if (v > 0 && v < 1) ring(c, x + f * (78 + 50 * v), y - 40, 5 + 12 * v, 10 + 22 * v, 'rgba(225,245,255,' + (0.7 * (1 - v)).toFixed(2) + ')', 2); } });
    }
    let tint = null;
    if (dying != null) {
      // quẫy đạp, lật ngửa bụng rồi chìm dần
      const k = dying;
      Q.jaw = 0.83; Q.eye = 'dead'; Q.gill = 0; Q.up = 0; Q.red = 0; Q.blink = 0; Q.wh = 0; Q.pf = 0;
      if (k < 0.45) { const u = k / 0.45; O.pitch = Math.sin(u * 22) * 0.3 * (1 - u * 0.6); O.dy = Math.round(-6 * Math.abs(Math.sin(u * 22))); Q.tail = Math.sin(u * 40) * 0.6; Q.eye = 'angry'; post.push(() => { for (let i = 0; i < 3; i++) splash(c, x - 40 + i * 44, y, (u * 3 - i * 0.8) % 1, 40, 10); }); }
      else if (k < 0.68) { const u = (k - 0.45) / 0.23; O.sy = Math.cos(u * Math.PI); if (Math.abs(O.sy) < 0.12) O.sy = O.sy < 0 ? -0.12 : 0.12; O.dy = Math.round(u * 6); }
      else { const u = (k - 0.68) / 0.32; O.sy = -1; O.dy = 6 + Math.round(64 * easeIn(u)); O.pitch = 0.12 * u; post.push(() => { for (let i = 0; i < 7; i++) { const bu = clamp01(u * 1.7 - i * 0.1); if (bu > 0 && bu < 1) px(c, x - 50 + i * 16 + Math.sin(bu * 8 + i) * 4, y - 2 - bu * 34, bu < 0.6 ? 3 : 2, bu < 0.6 ? 3 : 2, 'rgba(225,245,255,' + (0.9 * (1 - bu)).toFixed(2) + ')'); } }); }
      if (k > 0.45) tint = ['#c8d8e0', Math.min(0.45, k - 0.45)];
    } else if (b.flash > 0) tint = ['#fff6dc', 0.35];
    if (foam) nguFoam(c, x, y, t, f, true, X.phase >= 2);
    if (body) {
      const s = bossSpr('ngu', nguQ(Q), X);
      O.tint = tint;
      nguBlit(c, s, x, y, O);
    }
    if (foam) nguFoam(c, x, y, t, f, false, X.phase >= 2);
    if (fin) nguFin(c, fin[0], fin[1], t, fin[2], fin[3]);
    for (const fn of post) fn();
    drawFx(c, b);
  };

  // ====================================================================
  // 8C. HỒ TINH TRONG GAME
  // Đòn: pounce (thu mình rồi vồ theo cung), fox (xoè đuôi hú, thả cầu lửa), nova (đuôi xoay vòng rồi nổ theo hệ đã học),
  // illusion (tách ảo ảnh), hop (nhảy lùi khi bị áp sát), bite (vụt biến ra sau lưng rồi ngoạm).
  // Thêm: chạy, mệt lộ sơ hở, choáng, đóng băng, tru đổi giai đoạn và lớn lên 1.5 lần, mất đuôi theo máu, gục. Hàm này cũng vẽ ảo ảnh (b.illusion).
  // Hình cáo quay mặt sang PHẢI; b.face = 1 là nhìn sang phải.
  // ====================================================================
  // Làm tròn tư thế để các khung giống nhau dùng lại hình trong kho.
  function hoQ(Q) {
    Q.crouch = qz(Math.max(0, Q.crouch), 4); Q.stretch = qz(clamp01(Q.stretch), 2); Q.pitch = qz(Q.pitch, 4);
    Q.headX = Math.round(Q.headX); Q.headY = Math.round(Q.headY); Q.headTilt = qz(Q.headTilt, 4); Q.ears = qz(clamp01(Q.ears), 2);
    Q.mouth = Q.mouth < 0.2 ? 0 : Q.mouth < 0.55 ? 0.35 : Q.mouth < 0.9 ? 0.75 : 1;
    Q.fan = qz(Q.fan, 5); Q.tlen = qz(Q.tlen, 5); Q.flare = qz(clamp01(Q.flare), 3); Q.ring = qz(clamp01(Q.ring), 4);
    Q.spin = (Math.round(Q.spin / 8) * 8) % 40; // chín đuôi cách nhau 40 độ nên vòng quay lặp lại sau 40 độ
    Q.lagX = qz(Math.max(-1, Math.min(1, Q.lagX)), 3); Q.lagY = qz(Math.max(-1, Math.min(1, Q.lagY)), 3);
    Q.sway = qz(Q.sway, 3); Q.breath = Q.breath > 0.5 ? 1 : 0; Q.blink = Q.blink > 0.5 ? 1 : 0; Q.tired = Q.tired > 0.5 ? 1 : 0;
    Q.burst = Q.burst > 0.5 ? 1 : 0; Q.pulse = Q.pulse > 0.5 ? 1 : 0; Q.orb = qz(Q.orb, 16) % 1; Q.n = Math.max(0, Math.round(Q.n));
    return Q;
  }
  // Dán cáo: (x, y) là điểm chân trên mặt đất. o: z độ cao, rot ngẩng đầu (radian, dương là đầu lên), sx sy co giãn, alpha, tint, sil, ice.
  function hoBlit(c, s, x, y, face, scale, o) {
    c.save();
    c.translate(Math.round(x), Math.round(y - (o.z || 0)));
    c.scale((face < 0 ? -1 : 1) * scale, scale);
    if (o.rot) { c.translate(0, -18); c.rotate(-o.rot); c.translate(0, 18); }
    if (o.sx || o.sy) c.scale(o.sx || 1, o.sy || 1);
    if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.ice) { halo(c, s, '#e9f9ff'); blitT(c, 'tint', s.cv, -s.ox, -s.oy, '#a8dcf5', 0.6); }
    else if (o.sil) blitT(c, 'sil', s.cv, -s.ox, -s.oy, o.sil, 1, 'source-in');
    else if (o.tint) blitT(c, 'tint', s.cv, -s.ox, -s.oy, o.tint[0], o.tint[1]);
    else c.drawImage(s.cv, -s.ox, -s.oy);
    c.restore();
  }
  // Đốm lửa hồn bay lên: v là tiến độ 0..1.
  function hoWisp(c, x, y, v, col, col2, seed) {
    if (v <= 0 || v >= 1) return;
    const wx = Math.round(x + Math.sin(v * 7 + seed) * 5), wy = Math.round(y - 30 * v);
    const s = v < 0.5 ? 3 : v < 0.8 ? 2 : 1;
    px(c, wx - 1, wy - 1, s + 2, s + 2, hexA(col, 0.5 * (1 - v)));
    px(c, wx, wy, s, s, col2);
    px(c, wx, wy + s + 1, 1, 2, hexA(col, 0.6 * (1 - v)));
  }
  BDRAW.ho = function (c, b, t) {
    const ill = !!b.illusion, D = BOSS.ho;
    const dying = b.dying != null ? clamp01(b.dying) : null;
    const an = dying != null || ill ? null : b.anim, a = an ? an.t : 0;
    const aS = Math.floor(a * 12) / 12; // đồng hồ của đòn làm tròn 12 nhịp mỗi giây: tư thế chỉ đổi theo nhịp này
    const st = b.st || ST0, frozen = st.frozen > 0 && dying == null;
    // trí nhớ riêng của hình vẽ: đuôi trễ, số đuôi lần trước, đuôi vừa mất
    const m = b._hm || (b._hm = { lx: 0, ly: 0, px: b.x, py: b.y, pz: 0, pt: t, tails: b.tails, lost: [], orb: 0 });
    const n0 = b.tails != null ? b.tails : 9;
    const X0 = layersX(b);
    // ảo ảnh: đơn giản hơn, không có ngọc điểm yếu, bùa hay lửa chân
    const X = ill ? { el: X0.el, E: X0.E, weak: null, W: null, aR: 0, aM: 0, aD: X0.aD, phase: 0 } : X0;
    const TB = X.E ? X.E.B : FIRE, big = b.big && !ill ? 1 : 0;
    const tired = b.exposed > 0 && !ill && dying == null;
    let x = b.x, y = b.y, z = 0, face = b.face < 0 ? -1 : 1;
    const O = { rot: 0, sx: 0, sy: 0 };
    let alpha = b.alpha != null ? b.alpha : null, scale = big ? 1.5 : 1;
    let tint = null, ghosts = null, show = true;
    const pre = [], post = [];
    // ---- tư thế mặc định: vòng lặp 2 giây, 16 khung (ảo ảnh chỉ 4 khung) ----
    const tI = frozen ? 0 : t, i16 = Math.floor(tI * 8) % 16, ph = (i16 / 16) * Math.PI * 2;
    const Q = {
      feet: 0, crouch: 0, stretch: 0, pitch: 0, breath: i16 < 8 ? 0 : 1, headX: 0, headY: 0, headTilt: 0, ears: 0, mouth: 0,
      blink: i16 === 0 && !ill && !frozen ? 1 : 0, eye: 'normal', tired: 0, n: n0, fan: 1, tlen: 1, lagX: 0, lagY: 0,
      sway: ill ? ((i16 >> 2) & 1 ? 0.34 : -0.34) : Math.sin(ph), flare: 0, ring: 0, spin: 0, burst: 0, big,
      orb: X.aR ? i16 / 16 : 0, pulse: (i16 >> 2) & 1,
    };
    if (an) { Q.sway = 0; Q.breath = 0; Q.blink = 0; Q.pulse = 1; Q.orb = m.orb; } else m.orb = Q.orb; // trong đòn thì đứng nhịp thở lại, khỏi dựng thừa hình
    if (tired) {
      // lộ sơ hở: thở dốc, thè lưỡi, sao xoay trên đầu
      Q.tired = 1; Q.crouch = 0.34; Q.breath = Math.floor(t * 4) & 1; Q.sway = 0; Q.blink = 0; Q.orb = m.orb;
      post.push(() => { const f = Math.floor(t * 6) % 4, hx = x + face * 18 * scale, hy = y - 50 * scale; px(c, hx - 8 + f * 4, hy + (f % 2) * 2, 2, 2, '#ffd23f'); px(c, hx + 6 - f * 4, hy - 1 + ((f + 1) % 2) * 2, 2, 2, '#ffd23f'); });
    }
    // ---- dáng chạy khi đổi chỗ ----
    const moving = (ill ? b.moving : b.moving && !an) && !frozen && !(st.stun > 0);
    if (moving && !tired) {
      const f = Math.floor((b.t || t) * 11) & 3;
      Q.feet = 1 + f; Q.stretch = 0.5; Q.ears = 1; Q.crouch = f === 0 ? 0.25 : 0; Q.headY = f === 1 ? 1 : 0; Q.sway = 0; Q.breath = 0; Q.blink = 0; Q.pulse = 1; Q.orb = m.orb;
    }
    if (ill && b.wind > 0) { Q.mouth = 0.75; Q.headX = 2; Q.crouch = 0.34; Q.ears = 1; Q.eye = 'angry'; } // ảo ảnh sắp cắn
    if (ill && b.fromX != null && (b.t || 0) < 0.6 && dying == null) {
      // ảo ảnh tách ra từ chỗ cáo thật
      const v = clamp01(((b.t || 0) - 0.12) / 0.45), e = easeOut(v);
      x = lerp(b.fromX, b.x, e); y = lerp(b.fromY, b.y, e);
      alpha = 0.35 + 0.35 * v; Q.feet = 5; Q.stretch = 1; Q.ears = 1; Q.sway = 0; Q.breath = 0;
      if ((b.t || 0) < 0.12) tint = ['#ffffff', 0.8];
    }
    if (an) {
      Q.eye = 'angry';
      if (an.name === 'pounce') {
        const F = an.fire, c0 = F * 0.45;
        if (a < c0) {
          // thu mình lấy đà: chúi đầu, chổng mông, đuôi chụm lại
          const k = smooth(a / c0), kS = smooth(clamp01(aS / c0));
          x = an.fx; y = an.fy;
          Q.crouch = 0.9 * kS; Q.pitch = -0.3 * kS; Q.fan = 1 - 0.55 * kS; Q.tlen = 1 + 0.15 * kS; Q.headY = 2 * kS; Q.headX = 2 * kS; Q.ears = 1; Q.mouth = kS > 0.6 ? 0.35 : 0;
          O.sx = 1 + 0.08 * k; O.sy = 1 - 0.1 * k;
          if (k > 0.7) x += Math.floor(t * 30) & 1;
        } else if (a < F) {
          // bay theo cung tới chỗ vồ
          const v = (a - c0) / (F - c0), v2 = Math.max(0, v - 0.12);
          x = lerp(an.fx, an.tx, v); y = lerp(an.fy, an.ty, v); z = 34 * Math.sin(v * Math.PI);
          face = an.tx >= an.fx ? 1 : -1;
          Q.feet = v < 0.55 ? 5 : 6; Q.stretch = v < 0.55 ? 1 : 0.5; Q.ears = 1; Q.mouth = v > 0.5 ? 0.75 : 0.35; Q.fan = 0.6;
          O.rot = 0.5 * Math.cos(v * Math.PI); O.sx = 1.12; O.sy = 0.92;
          ghosts = [[lerp(an.fx, an.tx, v2), lerp(an.fy, an.ty, v2), 34 * Math.sin(v2 * Math.PI), 0.3]];
        } else {
          // đáp xuống, khựng lại
          const w = (a - F) / 0.2, dv = (a - F) / 0.4;
          if (w < 1) { O.sx = 1 + 0.22 * (1 - w); O.sy = 1 - 0.26 * (1 - w); Q.crouch = 1; Q.pitch = -0.25; Q.mouth = 0.75; Q.tired = 0; Q.fan = 1.2; Q.ears = 1; }
          post.push(() => {
            const e = easeOut(clamp01(dv));
            ring(c, b.x, b.y, 10 + 26 * e, 4 + 12 * e, 'rgba(240,230,200,' + (0.8 * (1 - clamp01(dv))).toFixed(2) + ')', 2);
            c.save(); c.translate(Math.round(b.x), Math.round(b.y - 3)); bits(c, 10, dv, 30, '#d8cfa8', '#ffffff', 1.9, 12); c.restore();
          });
        }
      } else if (an.name === 'fox') {
        // đuôi xoè rộng, chóp đuôi bùng lửa, ngửa đầu hú lúc cầu lửa bay ra
        const k = 1 - smooth(clamp01(aS / 0.75)), v = a / 0.3;
        Q.flare = k; Q.fan = 1 + 0.4 * k; Q.tlen = 1 + 0.2 * k; Q.crouch = 0.5 * k; Q.ears = 1;
        if (k > 0.3) Q.tipB = FIRE;
        if (a < 0.45) { Q.headTilt = 0.75; Q.mouth = 1; Q.pitch = 0.25; }
        post.push(() => {
          if (v >= 1) return;
          const cx = x - face * 12 * scale, cy = y - 34 * scale, e = easeOut(v);
          ring(c, cx, cy, 10 + 30 * e, 8 + 22 * e, 'rgba(255,200,90,' + (0.9 * (1 - v)).toFixed(2) + ')', 2);
          ring(c, cx, cy, 6 + 20 * e, 5 + 14 * e, 'rgba(255,255,255,' + (0.8 * (1 - v)).toFixed(2) + ')');
        });
      } else if (an.name === 'nova') {
        // đuôi xoay thành bánh xe, thân nhấc lên, rồi nổ theo màu hệ đã học
        const F = an.fire, E = ELP[an.el] || ELP.fire;
        Q.tipB = E.B; Q.ears = 1;
        if (a < F) {
          const u = a / F, uS = clamp01(aS / F);
          Q.ring = smooth(clamp01(uS / 0.35)); Q.spin = uS * uS * 900; Q.flare = uS; Q.tlen = 1 + 0.15 * uS; Q.feet = 6; Q.headY = -1; Q.mouth = uS > 0.6 ? 0.35 : 0;
          z = 12 * smooth(u);
          if (u > 0.75) x += Math.floor(t * 30) & 1;
          pre.push(() => {
            ell(c, x, y, 20 + 42 * u, (20 + 42 * u) * 0.6, hexA(E.B[1], 0.12 + 0.15 * u));
            for (let i = 0; i < 8; i++) { const ang = i * 0.785 - a * 6, r = 62 * (1 - ((u * 2 + i * 0.13) % 1)); px(c, x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.6, 2, 2, E.glow); }
          });
        } else {
          const w = clamp01((a - F) / 0.35), wS = clamp01((aS - F) / 0.35);
          Q.ring = 1 - smooth(wS); Q.spin = 900 + wS * 120; Q.tlen = 1.4 - 0.4 * wS; Q.flare = 1 - wS; Q.mouth = 1; Q.headTilt = 0.5; Q.burst = wS < 0.4 ? 1 : 0; Q.feet = w < 0.45 ? 6 : 0;
          z = 12 * (1 - easeIn(clamp01(w * 2.2)));
          if (w > 0.45 && w < 0.8) { O.sx = 1.12; O.sy = 0.88; }
          post.push(() => {
            if (w >= 1) return;
            const r = an.r * (0.3 + 0.7 * easeOut(w));
            ring(c, x, y, r, r * 0.6, hexA(E.hot, 1 - w), 2); ring(c, x, y, r - 3, r * 0.6 - 2, hexA(E.B[1], 0.9 * (1 - w)), 2); ring(c, x, y, r * 0.6, r * 0.36, hexA(E.B[1], 0.6 * (1 - w)));
            for (let i = 0; i < 14; i++) {
              const ang = i * 0.449 + 0.1, r0 = r * 0.75, r1 = r * 1.02;
              line(c, Math.round(x + Math.cos(ang) * r0), Math.round(y - 10 * (1 - w) + Math.sin(ang) * r0 * 0.6), Math.round(x + Math.cos(ang) * r1), Math.round(y - 10 * (1 - w) + Math.sin(ang) * r1 * 0.6), i % 2 ? E.B[1] : E.glow, 2);
            }
          });
        }
      } else if (an.name === 'illusion') {
        // loé sáng tại chỗ cũ rồi các bóng tách ra
        const v = clamp01((a - 0.12) / 0.45), e = easeOut(v);
        Q.eye = 'normal';
        if (a < 0.6) {
          x = lerp(an.fx, b.x, e); y = lerp(an.fy, b.y, e);
          alpha = 0.35 + 0.35 * v; Q.feet = 5; Q.stretch = 1; Q.ears = 1;
          if (a < 0.12) { tint = ['#ffffff', 0.8]; O.sx = 1 + 0.3 * Math.sin((a / 0.12) * Math.PI); }
          pre.push(() => { const r = clamp01(a / 0.4); ring(c, an.fx, an.fy - 16, 8 + 36 * r, 6 + 22 * r, 'rgba(255,255,255,' + (0.9 * (1 - r)).toFixed(2) + ')', 2); });
        }
      } else if (an.name === 'hop') {
        // nhảy lùi theo cung
        const v = clamp01(a / an.air);
        if (v < 1) {
          const v2 = Math.max(0, v - 0.2);
          x = lerp(an.fx, b.x, smooth(v)); y = lerp(an.fy, b.y, v); z = 16 * Math.sin(v * Math.PI);
          Q.feet = 6; Q.ears = 1; Q.fan = 0.8;
          O.rot = -0.3 * Math.cos(v * Math.PI) - 0.1;
          ghosts = [[lerp(an.fx, b.x, smooth(v2)), y, z * 0.7, 0.25]];
        } else { const w = (a - an.air) / (an.dur - an.air); O.sx = 1 + 0.12 * (1 - w); O.sy = 1 - 0.14 * (1 - w); Q.crouch = 0.5; Q.mouth = 0.35; }
      } else if (an.name === 'bite') {
        // vụt biến tới sau lưng, vệt nhoè nối hai chỗ, rồi ngoạm
        const F = an.fire, Wd = G.getWorld && G.getWorld(), P = Wd && Wd.P;
        if (P && Math.abs(P.x - b.x) > 2) face = P.x >= b.x ? 1 : -1; // luôn quay mặt về phía người chơi lúc cắn
        if (a < 0.1) {
          show = false;
          const v = a / 0.1;
          post.push(() => {
            const s2 = bossSpr('ho', hoQ(Object.assign({}, Q, { feet: 5, stretch: 1, ears: 1, mouth: 0 })), X);
            for (let i = 0; i < 5; i++) { const k = i / 4; if (k > v + 0.3) continue; hoBlit(c, s2, lerp(an.fx, b.x, k), lerp(an.fy, b.y, k), face, scale, { sx: 1.5, sy: 0.6, alpha: 0.18 + 0.4 * k * v, sil: '#ffffff' }); }
          });
        } else if (a < 0.24) {
          const w = (a - 0.1) / 0.14;
          O.sx = lerp(0.3, 1, easeOut(w)); O.sy = lerp(1.35, 1, easeOut(w)); tint = ['#ffffff', 0.9 * (1 - w)];
          pre.push(() => line(c, Math.round(an.fx), Math.round(an.fy - 16), Math.round(b.x), Math.round(b.y - 16), 'rgba(255,255,255,' + (0.5 * (1 - w)).toFixed(2) + ')', 2));
        } else if (a < F) {
          // rụt đầu lấy đà, hàm há dần
          const u = (a - 0.24) / (F - 0.24), uS = clamp01((aS - 0.24) / (F - 0.24));
          Q.crouch = 0.5 * uS; Q.headX = -4 * uS; Q.headY = -3 * uS; Q.mouth = uS < 0.5 ? 0.35 : 0.75; Q.ears = 1; Q.fan = 1 + 0.2 * uS; Q.pitch = 0.25 * uS;
          if (u > 0.7) x += Math.floor(t * 30) & 1;
        } else if (a < F + 0.16) {
          const w = (a - F) / 0.16;
          Q.headX = 7; Q.headY = 2; Q.mouth = w < 0.4 ? 0.75 : 0.35; Q.ears = 1; Q.stretch = 0.5; Q.pitch = -0.25; O.sx = 1.14; x += face * 5;
          post.push(() => { const jx = Math.round(x + face * 36 * scale), jy = Math.round(y - 27 * scale); if (w > 0.35) { px(c, jx - 4, jy, 9, 1, '#ffffff'); px(c, jx, jy - 4, 1, 9, '#ffffff'); px(c, jx - 2, jy - 2, 5, 5, 'rgba(255,255,255,0.6)'); } });
        } else { const w = clamp01((a - F - 0.16) / 0.2); Q.headX = 7 * (1 - w); Q.mouth = 0.35; x += face * 5 * (1 - w); }
      }
    }
    if (b.roarT > 0 && dying == null && !ill) {
      // tru lên khi đổi giai đoạn; lớn dần lúc hoá cuồng
      const r = 1 - b.roarT / 1.2, k = smooth(clamp01(r / 0.2)) * smooth(clamp01((1 - r) / 0.25)), kS = qz(k, 3);
      if (!an) { Q.headTilt = kS; Q.mouth = kS > 0.8 ? 1 : kS > 0.3 ? 0.75 : 0; Q.pitch = 0.25 * kS; Q.fan = 1 + 0.4 * kS; Q.flare = Math.max(Q.flare, 0.67 * kS); Q.tired = 0; Q.blink = 0; Q.eye = 'angry'; Q.ears = kS; Q.sway = 0; Q.breath = 0; if (k > 0.6) x += Math.floor(t * 30) & 1; }
      if (b.big && b.roarPh === 2) { const g = clamp01(r / 0.35); scale = lerp(1, 1.5, easeOut(g)); if (g < 1) tint = ['#ff6a3a', 0.6 * (1 - g)]; }
      post.push(() => { for (let i = 0; i < 3; i++) { const v = clamp01((r - 0.12 - i * 0.15) / 0.45); if (v > 0 && v < 1) ring(c, x, y - 30 * scale, 12 + 50 * v, 8 + 30 * v, hexA(TB[1], 0.7 * (1 - v)), 2); } });
    }
    if (st.stun > 0 && dying == null && !frozen) {
      Q.eye = 'dazed'; Q.blink = 0; O.rot += Math.sin(t * 9) * 0.06;
      post.push(() => { for (let i = 0; i < 3; i++) { const ang = t * 6 + i * 2.09; px(c, x + face * 16 * scale + Math.cos(ang) * 9 - 1, y - 54 * scale + Math.sin(ang) * 3, 2, 2, Math.sin(ang) > 0 ? '#ffd23f' : '#b8922a'); } });
    }
    // ---- đuôi trễ theo vận tốc của hình vẽ (tính trong hệ quay mặt sang phải) ----
    const dt = Math.max(1 / 120, Math.min(0.1, t - m.pt));
    if (t !== m.pt) {
      let vx = (x - m.px) / dt, vy = (y - z - (m.py - m.pz)) / dt;
      if (Math.abs(x - m.px) > 40) { vx = 0; vy = 0; }
      const k = Math.min(1, dt * 9);
      m.lx += (clamp01(Math.abs(vx) / 110) * -Math.sign(vx) * face - m.lx) * k;
      m.ly += (Math.max(-1, Math.min(1, -vy / 220)) - m.ly) * k;
      m.px = x; m.py = y; m.pz = z; m.pt = t;
    }
    if (!frozen && Q.ring < 0.5) { Q.lagX = m.lx * 1.1; Q.lagY = m.ly * 0.9; if (ill) { Q.lagX = qz(Q.lagX, 1); Q.lagY = 0; } }
    // ---- mất đuôi khi máu tụt: đuôi vừa mất hoá thành đốm lửa hồn ----
    if (!ill && dying == null) {
      if (m.tails != null && n0 < m.tails) for (let i = n0; i < m.tails; i++) m.lost.push({ i, n: m.tails, t });
      m.tails = n0;
      m.lost = m.lost.filter((o) => t - o.t < 0.7);
    }
    // chóp đuôi thứ i (khi còn n đuôi) trong toạ độ thế giới
    const tipAt = (i, n) => { const tp = D.anchor({ n, fan: 1 }).tips, q = tp[Math.min(i, tp.length - 1)] || [-30, -40]; return [x + face * q[0] * scale, y - z + q[1] * scale]; };
    for (const o of m.lost) post.push(() => { const q2 = tipAt(o.i, o.n); hoWisp(c, q2[0], q2[1], (t - o.t) / 0.7, TB[1], '#ffffff', o.i); });
    if (dying != null) {
      // đuôi tắt dần từng chiếc, thân khuỵu xuống rồi tan thành đốm lửa hồn
      const k = dying;
      if (ill) { alpha = 0.7 * (1 - k); tint = ['#ffffff', 0.5]; O.sx = 1 + 0.25 * k; O.sy = 1 + 0.25 * k; Q.sway = 0; Q.breath = 0; Q.lagX = 0; Q.lagY = 0; Q.feet = 0; }
      else {
        const left = k < 0.6 ? Math.ceil(n0 * (1 - k / 0.6)) : 0;
        Object.assign(Q, { n: left, feet: 0, stretch: 0, blink: 0, tired: 0, sway: 0, breath: 0, lagX: 0, lagY: 0, flare: 0, ring: 0, burst: 0, orb: m.orb, pulse: 0, headTilt: 0, pitch: 0, headX: 0 });
        Q.eye = k < 0.3 ? 'dazed' : 'dead'; Q.mouth = k < 0.3 ? 0.75 : 0; Q.ears = 1;
        Q.crouch = qz(1.5 * smooth(clamp01(k / 0.6)), 3); Q.headY = Math.round(6 * smooth(clamp01((k - 0.2) / 0.4))); Q.fan = 1 - 0.3 * qz(k, 3);
        if (k < 0.25) x += (Math.floor(k * 60) & 1) * 2 - 1;
        for (let i = left; i < n0; i++) { const k0 = 0.6 * (1 - (i + 1) / n0); post.push(() => { const q2 = tipAt(i, n0); hoWisp(c, q2[0], q2[1] - 4, (k - k0) / 0.3, TB[1], '#ffffff', i); }); }
        if (k > 0.55) {
          const v = (k - 0.55) / 0.45;
          tint = ['#ffffff', Math.min(0.85, v * 1.2)]; alpha = v < 0.3 ? 1 : Math.max(0, 1 - (v - 0.3) / 0.6);
          O.sx = 1 + 0.1 * v; O.sy = 1 - 0.25 * v;
          post.push(() => {
            for (let i = 0; i < 16; i++) { const h = hsh(i + 2), vv = clamp01(v * 1.5 - h * 0.5); hoWisp(c, x - 30 * scale + h * 60 * scale + Math.sin(i) * 6, y - 6 - hsh(i * 3) * 26 * scale - 26 * vv, vv, TB[1], i % 3 ? '#ffffff' : '#bfeaff', i * 1.7); }
            if (v > 0.5) { const w = (v - 0.5) / 0.5, wy = Math.round(y - 20 * scale - 50 * w); px(c, x - 3, wy - 3, 7, 7, hexA(TB[1], 0.5 * (1 - w))); px(c, x - 2, wy - 2, 5, 5, 'rgba(255,255,255,' + (1 - w).toFixed(2) + ')'); px(c, x, wy + 4, 1, 4, 'rgba(255,255,255,' + (0.6 * (1 - w)).toFixed(2) + ')'); }
          });
        }
      }
    }
    // ---- bóng đổ ----
    if (!ill && (dying == null || dying < 0.8)) ell(c, x, y, 24 * scale * (z > 0 ? Math.max(0.5, 1 - z / 60) : 1), big ? 5 : 4, 'rgba(0,0,0,' + (0.35 * (z > 0 ? 0.7 : 1)).toFixed(2) + ')');
    for (const fn of pre) fn();
    if (big && dying == null && show && !frozen) {
      // lửa giận bốc quanh chân
      for (let i = 0; i < 6; i++) { const k = (t * 1.4 + i * 0.17) % 1; px(c, x - 36 + i * 14 + Math.sin(t * 5 + i) * 3, y + 2 - z - k * 26, k < 0.5 ? 2 : 1, k < 0.5 ? 3 : 2, k < 0.3 ? '#ffd23f' : hexA(TB[1], 0.9 * (1 - k))); }
    }
    if (show) {
      // giữ tư thế tối thiểu 1/12 giây: mỗi con cáo không dựng quá 12 hình mỗi giây, còn vị trí và co giãn vẫn mượt từng khung
      let Qn = hoQ(Q);
      const key = Object.values(Qn).join('|') + (X.el || '') + X.phase;
      if (key !== m.qk) { if (m.q && t - m.qt < 1 / 12 && t >= m.qt && m.qx === (X.el || '') + X.phase) Qn = m.q; else { m.q = Qn; m.qk = key; m.qt = t; m.qx = (X.el || '') + X.phase; } }
      const s = bossSpr('ho', Qn, X);
      if (ghosts) for (const gq of ghosts) hoBlit(c, s, gq[0], gq[1], face, scale, { z: gq[2], rot: O.rot, sx: O.sx, sy: O.sy, alpha: gq[3], sil: '#ffffff' });
      if (b.flash > 0 && dying == null && !frozen) tint = ['#ffffff', 0.4];
      hoBlit(c, s, x, y, face, scale, { z, rot: O.rot, sx: O.sx, sy: O.sy, alpha, tint, ice: frozen });
      if (frozen) { px(c, x - 14, y - 3, 6, 3, '#bfeaff'); px(c, x + 6, y - 2, 7, 2, '#e9f9ff'); px(c, x - 5, y - 1, 9, 1, '#bfeaff'); }
    }
    for (const fn of post) fn();
    if (!ill) drawFx(c, b);
  };

  // ====================================================================
  // 9. XUẤT RA VÀ NỐI VÀO GAME
  // ====================================================================
  const P0 = { w: -1, br: 0, bl: 0, an: 0, sk: 0, lg: 0, tl: 0, dead: 0 };
  // Dựng một hình bất kỳ từ khai báo D (quái, trùm nhỏ, trùm): trả về { cv, ox, oy, bb }.
  function build(D, a, b) {
    const S = new Spr(D.size[0], D.size[1], D.org[0], D.org[1]);
    D.draw(S, a, b);
    S.finish();
    return S.toCanvas();
  }
  function buildMon(reg, role, P, el) { return build(MON[reg][role], Object.assign({}, P0, P), { el: el || null, E: el ? ELP[el] : null }); }
  if (MON[2].swarm) MON[2].swarm.fly = true; // Dơi Lửa lúc nào cũng đập cánh

  let warned = 0;
  let fallbacks = 0; // số lần phải gọi lại hình cũ (bài thử đọc số này)
  const warn = (what, e) => { fallbacks++; if (warned < 3 && window.console) { warned++; console.warn('monster_art: ' + what + ' lỗi, dùng lại hình cũ', e); } };
  // Chữ ký giống hệt G.art.enemy cũ: (c, e). Quái vẽ theo vùng hiện tại của ải.
  function enemy(c, e) {
    const A = G.art;
    if (e.illusion) return boss(c, e); // ảo ảnh của Hồ Tinh dùng chung hình cáo
    const reg = regionNow();
    c.save();
    try {
      if (e.role === 'mini' || e.kind === 'mini') { if (!MINI[reg]) throw new Error('thiếu trùm nhỏ'); if (e.dying != null) dieMini(c, e, reg); else drawMini(c, e, reg); }
      else if (e.dying != null) dieMon(c, e, reg);
      else drawMon(c, e, reg);
      c.restore();
    } catch (err) {
      c.restore();
      warn('quái', err);
      if (A && A.enemyOld) return A.enemyOld.call(A, c, e);
    }
  }
  // Chữ ký giống hệt G.art.boss cũ: (c, b). Cũng vẽ ảo ảnh của Hồ Tinh (b.illusion).
  function boss(c, b) {
    const A = G.art, fn = BDRAW[b.kind];
    if (!fn) { if (A && A.bossOld) return A.bossOld.call(A, c, b); return; }
    c.save();
    try { fn(c, b, G.time || 0); c.restore(); }
    catch (err) {
      c.restore();
      warn('trùm ' + b.kind, err);
      if (A && A.bossOld) return A.bossOld.call(A, c, b);
    }
  }
  // Đạn của xạ thủ (kind 'fruit' của phe quái) đổi theo vùng; đạn khác để nguyên hàm cũ.
  function proj(c, o) {
    const A = G.art;
    if (o && o.kind === 'fruit' && o.team === 'enemy') { try { return monShot(c, o, regionNow()); } catch (err) { warn('đạn', err); } }
    if (A && A.projOld) return A.projOld.call(A, c, o);
  }
  G.monsterArt = {
    Spr, MON, MINI, BOSS, ELP, buildMon, build, pal: { INK },
    enemy, boss, proj, bossSpr, layersX, BDRAW,
    cacheSize: () => MCACHE.size + BCACHE.size,
    fallbacks: () => fallbacks,
    // Tháo ra, trả lại hàm vẽ cũ (dùng khi thử).
    unhook() { const A = G.art; if (!A) return; if (A.enemyOld) A.enemy = A.enemyOld; if (A.bossOld) A.boss = A.bossOld; if (A.projOld) A.proj = A.projOld; },
    hook() {
      const A = G.art; if (!A || !A.enemy) return false;
      if (!A.enemyOld) A.enemyOld = A.enemy;
      if (!A.bossOld) A.bossOld = A.boss;
      if (!A.projOld) A.projOld = A.proj;
      A.enemy = enemy; A.boss = boss; A.proj = proj;
      return true;
    },
  };
  G.monsterArt.hook();
})();
