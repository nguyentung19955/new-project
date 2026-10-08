// Vũ khí sống: 4 loại (kiếm, cung, giáo, búa), mỗi loại 10 dòng, mỗi dòng 10 hình
// (1 hình gốc và 3 nhánh Lửa, Độc, Băng nhân 3 giai đoạn), phủ thêm 4 bậc Thường, Lam, Tím, Vàng.
// Vũ khí là sinh vật: to quá khổ, có mắt, có tính nết. Thân vẽ sẵn vào canvas đệm, mặt vẽ đè mỗi khung hình.
// Hệ trục của vũ khí: t chạy từ tay cầm ra mũi, q vuông góc với t. Điểm cầm là (0, 0).
// Dùng: G.weaponArt.draw(c, opts, x0, y0, ang, pull); opts = { type, family, branch, stage, rarity, mood, t }.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const INK = '#1b1118', SH = '#ffffff';

  // ---------- bảng màu: mỗi chất liệu là bộ ba [tối, vừa, sáng] ----------
  const STEEL = ['#5f6b84', '#b4c0d4', '#f4f8ff'];
  const IRON = ['#3d4354', '#7a8496', '#c2cad8'];
  const GOLD = ['#9c7426', '#e2b64e', '#ffe9a0'];
  const BRZ = ['#754418', '#c4853a', '#f6d07c'];
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const WD2 = ['#6e4a26', '#a8783e', '#d6a868'];
  const BAM = ['#6f7a2a', '#b3b84a', '#e6e28a'];
  const BAMG = ['#2f6a2c', '#5aa544', '#a6dc74'];
  const STONE = ['#55565f', '#8e9099', '#c9cbd2'];
  const BONE = ['#a89c84', '#e6dcc4', '#ffffff'];
  const HORN = ['#2c2530', '#5a4c58', '#9a8a92'];
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const GRN = ['#255a2c', '#479544', '#8fd070'];
  const BLU = ['#27407f', '#4468c0', '#86a8f0'];
  const ORG = ['#9a4a16', '#dd7c2a', '#f8b25c'];
  const GOURD = ['#a8642a', '#e09c4a', '#f9d08c'];
  const STRAW = ['#a8842e', '#e0c060', '#fff0a8'];
  const WHT = ['#b9b4c4', '#eeeaf2', '#ffffff'];
  const PINK = '#ef7f78';
  const STRING = '#e8e2d0';

  const ELP = {
    fire: {
      B: ['#8a1c12', '#e8492a', '#ffb347'], B2: ['#a32418', '#f2622a', '#ffc64c'], ol: '#4a1010', ol2: '#7a1810',
      eye: '#ffe36a', eye3: '#ffffff', ring3: '#ffe36a', pup: INK, glow: '#ffc64c', hot: '#fff0b0', gd: GOLD, fx: ['#ffb347', '#ffd27a', '#ff8a3a'],
    },
    poison: {
      B: ['#1d5a2a', '#49a83c', '#b5ea6a'], B2: ['#3d1d55', '#6b3a8f', '#a56fd0'], ol: '#12331a', ol2: '#12331a',
      eye: '#e6f58a', eye3: '#ffffff', ring3: '#e6f58a', pup: '#2a1240', glow: '#b5ea6a', hot: '#e6f58a', gd: ['#3d1d55', '#6b3a8f', '#a56fd0'], fx: ['#b5ea6a', '#a56fd0', '#8fd070'],
    },
    ice: {
      B: ['#2f62ad', '#7fc4f2', '#eafcff'], B2: ['#3b5fa8', '#9fd0f5', '#ffffff'], ol: '#1c3a70', ol2: '#1c3a70',
      eye: '#ffffff', eye3: '#d6f3ff', ring3: '#ffffff', pup: '#1c3a70', glow: '#bfe9ff', hot: '#ffffff', gd: ['#3b5fa8', '#9fd0f5', '#ffffff'], fx: ['#ffffff', '#bfe9ff', '#9fd0f5'],
    },
  };
  // Bậc: màu khung ô đồ (frame), màu chữ (col), bộ ba màu trang trí (P), đá nạm (gem).
  const RARITY = [
    { key: 'thuong', name: 'Thường', col: '#d6d2c8', frame: '#8f8c86', bg: '#34323a', P: ['#77747a', '#c9c5bd', '#f4f1ea'], gem: null },
    { key: 'lam', name: 'Lam', col: '#6fb2ff', frame: '#3f86e8', bg: '#1c2f52', P: ['#1f4fa8', '#4a94f2', '#b4dcff'], gem: ['#1f4fa8', '#4a94f2', '#d6ecff'] },
    { key: 'tim', name: 'Tím', col: '#c88cff', frame: '#9a4fe0', bg: '#33204f', P: ['#5a2499', '#a35cf0', '#e2c2ff'], gem: ['#5a2499', '#b068ff', '#f0dcff'] },
    { key: 'vang', name: 'Vàng', col: '#ffd24a', frame: '#f0b020', bg: '#4a3812', P: ['#a86a08', '#ffc428', '#fff4b0'], gem: ['#b02818', '#ff5a3a', '#ffd6c0'] },
  ];
  const STAGES = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'];
  const BRANCHES = ['fire', 'poison', 'ice'];
  const TYPES = ['sword', 'bow', 'spear', 'hammer'];
  const TYPE_NAMES = { sword: 'Kiếm', bow: 'Cung', spear: 'Giáo', hammer: 'Búa' };
  // Chữ nối vào tên dòng theo nhánh và giai đoạn.
  const WORDS = {
    fire: ['Than Hồng', 'Xích Diệm', 'Hỏa Thần'],
    poison: ['Rêu Xanh', 'Nọc Rừng', 'Độc Vương'],
    ice: ['Sương Giá', 'Hàn Ngọc', 'Băng Đế'],
  };

  const Dk = (r) => ({ c: r, t: 0, f: true });
  const Md = (r) => ({ c: r, t: 1, f: true });
  const Lt = (r) => ({ c: r, t: 2, f: true });
  function norm(c) {
    if (typeof c === 'string') return { c: [c, c, c], t: 1, f: true };
    if (Array.isArray(c)) return { c: c, t: 1, f: false };
    return { c: c.c, t: c.t, f: c.f };
  }
  // số giả ngẫu nhiên cố định theo hạt
  function rnd(seed, k) { const v = Math.sin((seed + 1) * 12.9898 + (k + 1) * 78.233) * 43758.5453; return v - Math.floor(v); }

  // ---------- phép đổi trục: (t, q) của vũ khí sang điểm ảnh quanh điểm cầm ----------
  function Frame(ang, P) {
    const r = (ang * Math.PI) / 180;
    this.ux = Math.cos(r); this.uy = Math.sin(r);
    this.vx = -this.uy; this.vy = this.ux;
    // ks: hệ số cỡ riêng của loại, chỉ co chiều dài (cung thì co chiều cao) để giữ bề rộng cho khuôn mặt
    const ks = P.ks || 1, bow = P.type === 'bow';
    this.k = P.k; this.kt = bow ? 1 + (P.k - 1) * 0.75 : P.k * ks; this.kq = bow ? P.k * ks : 1 + (P.k - 1) * 0.75;
    this.warp = P.warp || null;
    this.arc = P.arc || null; // uốn thân theo cung tròn (lưỡi liềm, mác...)
    this.wave = P.wave || null; // thân lượn sóng sẵn có của dòng
  }
  Frame.prototype.T = function (t, q) {
    const w = this.warp, wv = this.wave;
    if (wv && t > wv.t0) q += wv.amp * Math.sin(((t - wv.t0) / wv.per) * Math.PI * 2) * Math.min(1, (t - wv.t0) / 4);
    if (w) {
      if (w.bow) t += w.amp * Math.sin(q * w.f + w.ph) * (w.fade ? Math.min(1, Math.abs(q) / 6) : 1);
      else if (t > w.t0) { const s = (t - w.t0) / w.L; q += w.amp * Math.sin(s * Math.PI * w.f) * Math.min(1, s * 4) + w.hook * s * s; }
    }
    const c = this.arc;
    if (c && t > c.t0) {
      const th = (t - c.t0) / c.R, r = c.R + q * (c.dir > 0 ? -1 : 1), sn = Math.sin(th), cs = Math.cos(th);
      t = c.t0 + r * sn; q = c.dir > 0 ? c.R - r * cs : -c.R + r * cs;
    }
    t *= this.kt; q *= this.kq;
    return [this.ux * t + this.vx * q, this.uy * t + this.vy * q];
  };

  // ---------- tấm vẽ điểm ảnh nhiều lớp, tự viền tối và tự đánh sáng tối ----------
  function Spr(R, fr) {
    this.w = this.h = 2 * R + 1; this.ox = this.oy = R; this.fr = fr;
    const n = this.w * this.h;
    this.main = new Array(n).fill(null);
    this.olf = new Uint8Array(n); // điểm này là viền
    this.nol = new Uint8Array(n); // điểm hiệu ứng, không cần viền
    this.rim = new Uint8Array(n); // điểm thuộc phần được mạ viền theo bậc
    this.lay = null; this.clip = false;
    this.t0 = 1e9; this.t1 = -1e9; this.q0 = 1e9; this.q1 = -1e9; // tầm vươn của thân theo trục vũ khí (không tính tua)
  }
  Spr.prototype._i = function (x, y) {
    x = Math.round(x) + this.ox; y = Math.round(y) + this.oy;
    if (x < 1 || y < 1 || x >= this.w - 1 || y >= this.h - 1) return -1;
    return y * this.w + x;
  };
  // --- vẽ theo điểm ảnh thô (x, y tính từ điểm cầm) ---
  Spr.prototype.px = function (x, y, c) {
    const i = this._i(x, y); if (i < 0) return;
    if (this.clip && !this.lay[i]) return;
    this.lay[i] = c === 0 ? null : norm(c);
    if (!this.nomeasure && c !== 0) {
      const f = this.fr, t = x * f.ux + y * f.uy, q = x * f.vx + y * f.vy;
      if (t < this.t0) this.t0 = t; if (t > this.t1) this.t1 = t; if (q < this.q0) this.q0 = q; if (q > this.q1) this.q1 = q;
    }
  };
  Spr.prototype.rr = function (x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); };
  Spr.prototype.re = function (cx, cy, rx, ry, c) {
    const a = rx + 0.35, b = ry + 0.35;
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x - cx) / a, dy = (y - cy) / b;
        if (dx * dx + dy * dy <= 1) this.px(x, y, c);
      }
  };
  Spr.prototype.rg = function (pts, c) {
    let y0 = 1e9, y1 = -1e9; const n = pts.length;
    for (const q of pts) { if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    for (let y = Math.ceil(y0 - 0.5); y <= Math.floor(y1 + 0.5); y++) {
      const yy = Math.min(y1 - 0.01, Math.max(y0 + 0.01, y + 0.003)); const xs = [];
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        if ((a[1] <= yy) !== (b[1] <= yy)) xs.push(a[0] + ((yy - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) this.px(x, y, c);
    }
  };
  Spr.prototype.rl = function (x0, y0, x1, y1, w, c) {
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))), o = w >> 1;
    for (let i = 0; i <= n; i++) this.rr(Math.round(x0 + (dx * i) / n) - o, Math.round(y0 + (dy * i) / n) - o, w, w, c);
  };
  // --- vẽ theo trục vũ khí (t, q) ---
  Spr.prototype.T = function (t, q) { return this.fr.T(t, q); };
  Spr.prototype.M = function (t, q) {
    return this.fr.T(t, q);
  };
  Spr.prototype.p = function (t, q, c) { const a = this.M(t, q); this.px(a[0], a[1], c); };
  // khối vuông nhỏ w x h đặt tâm tại (t, q), không xoay theo vũ khí
  Spr.prototype.box = function (t, q, w, h, c) { const a = this.fr.T(t, q); this.rr(Math.round(a[0]) - (w >> 1), Math.round(a[1]) - (h >> 1), w, h, c); };
  // chia nhỏ cạnh để hình uốn theo phép bẻ cong
  Spr.prototype._sub = function (pts, closed) {
    const out = [], n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const d = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])), s = this.fr.warp || this.fr.arc || this.fr.wave ? Math.max(1, Math.ceil(d / 2.5)) : 1;
      for (let j = 0; j < s; j++) out.push(this.M(a[0] + ((b[0] - a[0]) * j) / s, a[1] + ((b[1] - a[1]) * j) / s));
    }
    if (!closed) out.push(this.M(pts[n - 1][0], pts[n - 1][1]));
    return out;
  };
  Spr.prototype.g = function (pts, c) { this.rg(this._sub(pts, true), c); };
  Spr.prototype.pl = function (pts, w, c) { const a = this._sub(pts, false); for (let i = 0; i + 1 < a.length; i++) this.rl(a[i][0], a[i][1], a[i + 1][0], a[i + 1][1], w, c); };
  Spr.prototype.l = function (t0, q0, t1, q1, w, c) { this.pl([[t0, q0], [t1, q1]], w, c); };
  // hình bầu dục: bán kính rt dọc trục t, rq dọc trục q
  Spr.prototype.e = function (t, q, rt, rq, c) {
    if (Math.abs(rt - rq) < 0.01) { this.M(t - rt, q); this.M(t + rt, q); const a = this.fr.T(t, q); this.re(a[0], a[1], rt * this.fr.k, rt * this.fr.k, c); return; }
    const pts = [];
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; pts.push([t + Math.cos(a) * (rt + 0.3), q + Math.sin(a) * (rq + 0.3)]); }
    this.g(pts, c);
  };
  Spr.prototype.in = function (fn) { const o = this.clip; this.clip = true; fn(this); this.clip = o; };
  // Một lớp. opt.ol: màu viền (mặc định mực tối, false là không viền); opt.bevel: false thì không tự đánh sáng tối;
  // opt.fx: lớp hiệu ứng không viền; opt.under: chỉ vẽ vào chỗ còn trống; opt.rim: phần này được mạ viền theo bậc.
  Spr.prototype.part = function (opt, fn) {
    if (typeof opt === 'function') { fn = opt; opt = {}; }
    const W = this.w, n = W * this.h;
    this.lay = new Array(n).fill(null); this.clip = false;
    fn(this);
    const L = this.lay, ol = opt.fx ? false : (opt.ol === undefined ? INK : opt.ol);
    if (opt.bevel !== false && !opt.fx) {
      for (let i = W; i < n - W; i++) {
        const q = L[i]; if (!q || q.f) continue;
        q.t = !L[i - W] ? 2 : (!L[i + W] || !L[i - 1]) ? 0 : 1;
      }
    }
    if (ol) {
      for (let i = W; i < n - W; i++) {
        if (!L[i]) continue;
        for (let d = 0; d < 4; d++) {
          const k = i + (d === 0 ? -1 : d === 1 ? 1 : d === 2 ? -W : W);
          if (!L[k] && !(opt.under && this.main[k])) { this.main[k] = ol; this.olf[k] = 1; this.nol[k] = 0; this.rim[k] = 0; }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const q = L[i]; if (!q) continue;
      if (opt.under && this.main[i]) continue;
      this.main[i] = q.c[q.t]; this.olf[i] = 0; this.nol[i] = opt.fx ? 1 : 0; this.rim[i] = opt.rim ? 1 : 0;
    }
    this.lay = null;
  };
  // Mạ viền theo bậc: các điểm sát mép của phần "rim" đổi sang màu bậc.
  Spr.prototype.gild = function (rar) {
    if (rar < 2) return;
    const W = this.w, n = W * this.h, M = this.main, R = RARITY[rar].P, set = [];
    for (let i = W; i < n - W; i++) {
      if (!this.rim[i] || this.olf[i]) continue;
      const below = !M[i + W] || this.olf[i + W], left = !M[i - 1] || this.olf[i - 1];
      const above = !M[i - W] || this.olf[i - W], right = !M[i + 1] || this.olf[i + 1];
      if (below || left) set.push([i, R[1]]);
      else if (rar >= 3 && (above || right)) set.push([i, R[2]]);
    }
    for (const s of set) M[s[0]] = s[1];
  };
  Spr.prototype.finish = function () {
    const W = this.w, n = W * this.h, M = this.main, add = [];
    for (let i = W; i < n - W; i++) {
      if (!M[i] || this.nol[i]) continue;
      let edge = false;
      for (let d = 0; d < 4; d++) {
        const k = i + (d === 0 ? -1 : d === 1 ? 1 : d === 2 ? -W : W);
        if (!M[k] || this.nol[k]) { edge = true; if (!this.olf[i]) add.push(k); }
      }
      if (edge && this.olf[i]) M[i] = INK;
    }
    for (const k of add) { M[k] = INK; this.olf[k] = 1; this.nol[k] = 0; }
    return this;
  };
  Spr.prototype.bounds = function () {
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.main[y * this.w + x]) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return { x0: 0, x1: 0, y0: 0, y1: 0 };
    return { x0: x0 - this.ox, x1: x1 - this.ox, y0: y0 - this.oy, y1: y1 - this.oy };
  };
  // Xuất ra canvas đã cắt sát hình. (dx, dy) là vị trí góc trên trái so với điểm cầm.
  Spr.prototype.toCanvas = function () {
    const b = this.bounds(), w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    let last = null;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const q = this.main[(y + b.y0 + this.oy) * this.w + x + b.x0 + this.ox]; if (!q) continue;
      if (q !== last) { c.fillStyle = q; last = q; }
      c.fillRect(x, y, 1, 1);
    }
    return { cv: cv, dx: b.x0, dy: b.y0, w: w, h: h };
  };

  // ---------- các mảnh ghép dùng chung ----------
  const U = (dt, dq) => { const n = Math.hypot(dt, dq) || 1; return [dt / n, dq / n]; };
  // Ngọn lửa: gốc tại (t, q), vươn theo hướng (dt, dq), dài len, rộng wid; lean làm ngọn ngả sang bên.
  function flame(S, t, q, dt, dq, len, wid, lean) {
    const d = U(dt, dq), n = [-d[1], d[0]], E = ELP.fire, le = lean == null ? 0.35 : lean;
    const at = (a, b) => [t + d[0] * a + n[0] * b, q + d[1] * a + n[1] * b];
    S.part({ ol: E.ol2 }, (s) => {
      s.g([at(0, -wid / 2), at(len * 0.45, -wid * 0.6), at(len, wid * le), at(len * 0.5, wid * 0.2), at(0, wid / 2)], Md(E.B2));
      s.in(() => { const a = at(len * 0.15, 0), b = at(len * 0.6, 0); s.l(a[0], a[1], b[0], b[1], 1, Lt(E.B2)); if (len >= 7) { const m = at(len * 0.25, 0); s.p(m[0], m[1], E.hot); } });
    });
  }
  // Tinh thể băng: mảnh sáu cạnh nhọn.
  function crystal(S, t, q, dt, dq, len, wid, light) {
    const d = U(dt, dq), n = [-d[1], d[0]], E = ELP.ice;
    const at = (a, b) => [t + d[0] * a + n[0] * b, q + d[1] * a + n[1] * b];
    S.part({ ol: E.ol }, (s) => {
      s.g([at(0, -wid * 0.4), at(len * 0.5, -wid * 0.55), at(len, 0), at(len * 0.6, wid * 0.55), at(0, wid * 0.4)], light ? E.B2 : E.B);
      s.in(() => { const a = at(len * 0.15, 0), b = at(len * 0.75, 0); s.l(a[0], a[1], b[0], b[1], 1, SH); });
    });
  }
  // Gai độc: tam giác cong móc.
  function thorn(S, t, q, dt, dq, len, wid, col) {
    const d = U(dt, dq), n = [-d[1], d[0]], E = ELP.poison;
    const at = (a, b) => [t + d[0] * a + n[0] * b, q + d[1] * a + n[1] * b];
    S.part({ ol: E.ol }, (s) => { s.g([at(0, -wid / 2), at(len, wid * 0.5), at(0, wid / 2)], col || Lt(E.B)); });
  }
  // Nấm độc: cuống kem, mũ tím chấm sáng.
  function shroom(S, t, q, dt, dq, h, r) {
    const d = U(dt, dq), E = ELP.poison;
    S.part({ ol: E.ol }, (s) => { s.l(t, q, t + d[0] * h, q + d[1] * h, 1, Md(BONE)); });
    S.part({ ol: '#2a1240' }, (s) => {
      const ct = t + d[0] * (h + r * 0.4), cq = q + d[1] * (h + r * 0.4), n = [-d[1], d[0]];
      const at = (a, b) => [ct + d[0] * a + n[0] * b, cq + d[1] * a + n[1] * b];
      s.g([at(-0.2, -r * 1.35), at(r * 0.55, -r * 1.05), at(r * 0.95, 0), at(r * 0.55, r * 1.05), at(-0.2, r * 1.35)], E.B2);
      s.in(() => { const a = at(r * 0.4, -r * 0.5); s.p(a[0], a[1], SH); const b = at(r * 0.25, r * 0.6); s.p(b[0], b[1], SH); });
    });
  }
  // Dây leo: đường mảnh xanh có lá.
  function vine(S, pts, leaves) {
    const E = ELP.poison;
    S.part({ ol: E.ol }, (s) => {
      s.pl(pts, 1, Md(E.B));
      if (leaves) for (const f of leaves) { s.box(f[0], f[1], 2, 2, Lt(E.B)); }
    });
  }
  // Tua: dây mềm có hạt, buông từ (t, q). Luôn rủ xuống màn hình bất kể vũ khí xoay góc nào.
  function tassel(S, t, q, col, len, bead) {
    const a = S.T(t, q), x = Math.round(a[0]), y = Math.round(a[1]);
    S.nomeasure = true;
    S.part({ ol: col[0] }, (s) => {
      s.rr(x, y, 1, 2, Md(col)); s.px(x + 1, y + 2, Md(col)); s.px(x + 2, y + 1, Md(col));
      for (let i = 0; i < len; i++) s.px(x + 2 + (i % 4 === 1 ? 1 : 0), y + 2 + i, Md(col));
      s.px(x + 3, y + len + 1, Md(col)); s.px(x + 1, y + len + 2, Md(col)); s.px(x + 3, y + len + 2, Lt(col));
    });
    if (bead) S.part((s) => { s.rr(x + 1, y + 2, 2, 2, Md(bead)); s.px(x + 2, y + 2, Lt(bead)); });
    S.nomeasure = false;
  }
  // Đá nạm theo bậc: chỉ hiện từ bậc min trở lên.
  function gem(S, P, t, q, min) {
    if (P.rar < (min || 1)) return;
    const R = RARITY[P.rar];
    S.part((s) => {
      if (P.rar >= 2) { s.box(t, q, 3, 3, Md(R.gem)); s.in(() => { const a = s.T(t, q); s.px(Math.round(a[0]), Math.round(a[1]) - 1, SH); s.px(Math.round(a[0]) + 1, Math.round(a[1]) - 1, Lt(R.gem)); s.px(Math.round(a[0]) - 1, Math.round(a[1]) + 1, Dk(R.gem)); }); }
      else { s.box(t, q, 2, 2, Md(R.gem)); s.in(() => { const a = s.T(t, q); s.px(Math.round(a[0]), Math.round(a[1]) - 1, Lt(R.gem)); }); }
    });
  }
  // Họa tiết khắc theo bậc (gọi bên trong S.in của phần thân): bậc Tím là chấm, bậc Vàng là vạch liền có chấm sáng.
  function engrave(S, P, pts) {
    if (P.rar < 2) return;
    const R = RARITY[P.rar].P;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let j = 0; j <= n; j++) {
        const t = a[0] + ((b[0] - a[0]) * j) / n, q = a[1] + ((b[1] - a[1]) * j) / n;
        if (P.rar >= 3) S.p(t, q, j % 4 === 2 ? R[2] : R[1]); else if (j % 2 === 0) S.p(t, q, R[1]);
      }
    }
  }
  // Tua theo bậc (từ bậc Tím).
  function rtassel(S, P, t, q) {
    if (P.rar < 2) return;
    tassel(S, t, q, RARITY[P.rar].P, P.rar >= 3 ? 7 : 4, P.rar >= 3 ? GOLD : null);
  }
  // Cán cầm: thanh dày w từ t0 đến t1, có vạch quấn; bậc Lam trở lên quấn thêm đai màu bậc.
  function grip(S, P, t0, t1, mat, w, o) {
    o = o || {};
    S.part((s) => {
      s.l(t0, 0, t1, 0, w || 2, mat);
      if (!o.plain) s.in(() => { for (let t = t0 + 1.5; t < t1; t += 3) s.p(t, 0, Dk(mat)); });
      if (P.rar >= 1) s.in(() => {
        const R = RARITY[P.rar].P, m = o.band == null ? (t0 + t1) / 2 : o.band;
        s.l(m - 0.5, -2, m - 0.5, 2, 2, Md(R)); if (P.rar >= 3) { s.l(m - 3.5, -2, m - 3.5, 2, 1, Md(R)); s.l(m + 2.5, -2, m + 2.5, 2, 1, Md(R)); }
      });
    });
  }
  // Biến mép lưỡi theo hệ. prof = [[t, a, b], ...]: tại t, mép sống ở q = -a, mép lưỡi ở q = +b.
  // Lửa: sống thành răng lửa, mũi vươn thành ngọn. Độc: mép mọc gai. Băng: mép gãy khúc thành mặt tinh thể, mũi nhọn dài.
  function edges(prof, P, o) {
    o = o || {};
    const n = prof.length, t0 = prof[0][0], t1 = prof[n - 1][0], L = t1 - t0, el = o.plain ? null : P.el, st = P.st;
    const at = (t) => {
      if (t <= t0) return [prof[0][1], prof[0][2]];
      for (let i = 0; i + 1 < n; i++) if (t <= prof[i + 1][0]) { const a = prof[i], b = prof[i + 1], f = (t - a[0]) / (b[0] - a[0] || 1); return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
      return [prof[n - 1][1], prof[n - 1][2]];
    };
    let top = [], bot = [];
    const amp = (o.amp || 1), flip = o.flip ? 1 : 0;
    if (el === 'fire') {
      const A = [0, 1.7, 3, 4.2][st] * amp, per = o.per || 6.5, from = t0 + 1.5, to = st === 1 ? t0 + L * 0.5 : t1 - 2;
      for (let t = t0; t <= t1 + 0.01; t += 0.5) {
        const e = at(t); let s = 0;
        if (t >= from && t <= to) { let ph = ((t - from) % per) / per; if (o.rev) ph = 1 - ph; s = A * Math.pow(ph, 1.3) * Math.min(1, (t1 - t) / 6 + 0.35); }
        const wv = st >= 2 ? 0.8 * Math.sin((t - t0) * 0.95) * Math.min(1, (t1 - t) / 5) : 0;
        const a = e[0] + (flip ? wv : s), b = e[1] + (flip ? s : wv);
        top.push([t, -a]); bot.push([t, b]);
      }
      if (st >= 2 && !o.notip) {
        const ex = [0, 0, 3, 5.5][st] * (o.tip == null ? 1 : o.tip), sg = flip ? 1 : -1;
        top.pop(); bot.pop();
        top.push([t1 + ex * 0.4, sg * ex * 0.15 - 0.6]); top.push([t1 + ex, sg * ex * 0.5]); bot.push([t1 + ex * 0.3, sg * ex * 0.1 + 0.8]);
      }
    } else if (el === 'poison') {
      const A = [0, 1.6, 2.6, 3.6][st] * amp, per = o.per || 6, from = t0 + 2, to = st === 1 ? t0 + L * 0.55 : t1 - 3;
      for (let t = t0; t <= t1 + 0.01; t += 0.5) {
        const e = at(t); let s = 0;
        if (t >= from && t <= to) { const ph = ((t - from) % per) / per; s = ph < 0.4 ? A * (1 - Math.abs(ph - 0.2) / 0.2) : 0; }
        const wart = st >= 2 ? 0.5 * Math.sin((t - t0) * 1.7) : 0;
        const a = e[0] + (flip ? s : wart), b = e[1] + (flip ? wart : s);
        top.push([t, -a]); bot.push([t, b]);
      }
    } else if (el === 'ice') {
      const A = [0, 0.9, 1.7, 2.5][st] * amp, kn = Math.max(3, Math.round(L / (o.per || 8))), ex = o.notip ? 0 : [0, 1, 3, 5][st] * (o.tip == null ? 1 : o.tip);
      const lim = st === 1 ? 0.55 : 1;
      for (let i = 0; i <= kn; i++) {
        const t = t0 + (L * i) / kn, e = at(t), f = i / kn <= lim && i > 0 && i < kn ? 1 : 0;
        const a = e[0] + f * (i % 2 ? A : -A * 0.25), b = e[1] + f * (i % 2 ? -A * 0.25 : A);
        top.push([t, -a]); bot.push([t, b]);
      }
      if (ex) { const lt = top[top.length - 1], lb = bot[bot.length - 1]; if (lt[1] > -1.2 && lb[1] < 1.2) { lt[0] += ex; lb[0] += ex; } }
    } else {
      top = prof.map((p) => [p[0], -p[1]]); bot = prof.map((p) => [p[0], p[2]]);
    }
    return { top: top, bot: bot, poly: top.concat(bot.slice().reverse()), at: at, t0: t0, t1: t1 };
  }
  // Dấu hệ ở giai đoạn Mầm, vẽ bên trong thân còn chất liệu gốc: than hồng, rêu xanh, sương giá.
  // Vùng phủ: t từ t0 đến t1, q trong khoảng [-hw, hw].
  function seed(S, P, t0, t1, hw, sd) {
    if (P.st !== 1) return;
    const E = P.E, L = t1 - t0;
    if (P.el === 'fire') {
      // vết nứt than hồng chạy từ gốc lên
      let q = 0; const pts = [[t0, 0]];
      for (let i = 1; i <= 4; i++) { q = (i % 2 ? 1 : -1) * hw * (0.25 + 0.3 * rnd(sd, i)); pts.push([t0 + (L * 0.85 * i) / 4, q]); }
      S.pl(pts, 1, E.B[1]);
      for (let i = 1; i < pts.length; i += 1) S.p(pts[i][0], pts[i][1], E.B[2]);
      S.l(pts[2][0], pts[2][1], pts[2][0] + 2.5, pts[2][1] + (pts[2][1] > 0 ? -1 : 1) * hw * 0.6, 1, E.B[1]);
      S.box(t0 + 1, 0, 3, 2, E.B[1]); S.p(t0 + 1, 0, E.hot);
    } else {
      // rêu xanh hoặc sương giá bám thành cụm ở hai mép
      const ice = P.el === 'ice', c1 = ice ? '#dff4ff' : E.B[1], c2 = ice ? '#ffffff' : E.B[2], c0 = ice ? E.B[1] : E.B[0];
      for (let i = 0; i < 4; i++) {
        const t = t0 + L * (0.04 + 0.26 * i + 0.1 * rnd(sd, i)), sgn = i % 2 ? 1 : -1, w = 2.5 + 2 * rnd(sd, i + 9);
        for (let a = 0; a <= w; a++) { const d = 1.6 - Math.abs(a - w / 2) * 0.7; for (let b = 0; b < d + 0.5; b++) S.p(t + a, sgn * (hw - b), b >= d - 0.6 ? c0 : c1); }
        S.p(t + w / 2, sgn * hw, c2);
      }
      S.l(t0, -hw, t0, hw, 1, c1); S.p(t0, 0, c2);
    }
  }
  // Nét bên trong thân theo hệ (giai đoạn 2, 3): lõi lửa sáng, đốm nọc, vết xước băng. Chạy dọc trục từ t0 đến t1 ở q.
  function core(S, P, t0, t1, q) {
    if (P.st < 2) return;
    const E = P.E;
    if (P.el === 'fire') { S.l(t0 + (t1 - t0) * 0.3, q, t1, q, 1, E.hot); S.l(t0, q, t0 + (t1 - t0) * 0.3, q, 1, Md(E.B2)); }
    else if (P.el === 'poison') { for (let t = t0 + 2; t < t1; t += 5) { S.p(t, q - 1.5, Dk(E.B)); S.p(t + 2.5, q + 1.5, Lt(E.B)); } }
    else { for (let t = t0 + 2; t < t1 - 3; t += 9) S.l(t, q - 2, t + 4, q + 2, 1, SH); }
  }
  // Hạt hiệu ứng quanh thân ở giai đoạn 2, 3: tàn lửa, bào tử, lấp lánh băng.
  function motes(S, P, list) {
    if (P.st < 2) return;
    const E = P.E, n = P.st === 2 ? Math.ceil(list.length / 2) : list.length;
    S.nomeasure = true;
    S.part({ fx: true }, (s) => {
      for (let i = 0; i < n; i++) {
        const m = list[i];
        if (P.el === 'ice' && i % 2 === 0) { const a = s.T(m[0], m[1]), x = Math.round(a[0]), y = Math.round(a[1]); s.px(x, y, SH); s.px(x - 1, y, E.glow); s.px(x + 1, y, E.glow); s.px(x, y - 1, E.glow); s.px(x, y + 1, E.glow); }
        else s.p(m[0], m[1], E.fx[i % 3]);
      }
    });
    S.nomeasure = false;
  }

  // Mọc phụ kiện theo hệ tại các điểm cho sẵn. sp = [[t, q, dt, dq], ...] xếp theo thứ tự ưu tiên; o.z: hệ số cỡ.
  // Lửa: ngọn lửa. Băng: tinh thể. Độc: mầm dây leo, rồi nấm và gai.
  function grow(S, P, sp, o) {
    if (!P.el) return;
    o = o || {};
    const st = P.st, z = o.z || 1, g = (i) => sp[i % sp.length], bow = P.type === 'bow';
    const ln = (a) => (a[4] != null ? a[4] : bow ? (a[2] > 0 ? -0.35 : 0.35) : (a[3] < 0 ? 0.35 : -0.35));
    const fl = (i, len, wid) => { const a = g(i); flame(S, a[0], a[1], a[2], a[3], len * z, wid * z, ln(a)); };
    const cr = (i, len, wid, light) => { const a = g(i); crystal(S, a[0], a[1], a[2], a[3], len * z, wid * z, light); };
    const sh = (i, h, r) => { const a = g(i); shroom(S, a[0], a[1], a[2], a[3], h, r * z); };
    const th = (i, len) => { const a = g(i); thorn(S, a[0], a[1], a[2], a[3], len * z, 2.4); };
    if (P.fire) {
      if (st === 1) fl(0, 4.2, 3);
      if (st === 2 && o.fire2) fl(0, 5.5, 3.5);
      if (st === 3) { fl(0, 7.5, 4.5); fl(1, 6, 4); if (sp.length > 2 && !o.few) fl(2, 5, 3.5); }
    } else if (P.ice) {
      if (st === 1) cr(0, 5, 3);
      if (st === 2) { cr(0, 6.5, 3.5); cr(1, 6, 3.2, true); }
      if (st === 3) { cr(0, 8, 3.8); cr(1, 7, 3.5, true); cr(2, 6.5, 3.2); if (sp.length > 3) cr(3, 6, 3, true); }
    } else {
      if (st === 1) { const a = g(0); vine(S, [[a[0] - 2, a[1]], [a[0] + a[2] * 1.5, a[1] + a[3] * 1.5], [a[0] + 2.5 + a[2], a[1] + a[3] * 0.5]], [[a[0] + a[2] * 2.5, a[1] + a[3] * 2.5]]); }
      if (st === 2) { sh(0, 2, 2); th(1, 3.2); }
      if (st === 3) { sh(0, 2.5, 2.7); th(1, 3.8); sh(2, 2, 2); if (sp.length > 3) th(3, 3.4); }
    }
  }
  // màu phụ (vây, lá, tua) đổi theo hệ khi đã Thành hình
  const sec = (P, base) => (P.st >= 2 ? P.E.B2 : base);

  // ---------- khuôn mặt (vẽ đè mỗi khung hình) ----------
  // Mặt luôn bám theo trục vũ khí nhưng xoay theo nấc 90 độ để nét không vỡ.
  const MOUTHS = {
    smirk: ['....K', 'KKKK.', '..W..'],
    fang: ['KKKKKK', '.W..W.'],
    smile: ['K...K', '.KKK.'],
    grin: ['KKKKK', 'KWWWK', '.KKK.'],
    o: ['KK', 'KK'],
    flat: ['KKK'],
    frown: ['.KKK.', 'K...K'],
    cat: ['K.K.K', '.K.K.'],
    wavy: ['.K.K.', 'K.K.K'],
    tiny: ['KK'],
    drool: ['KKK', '..B', '..B'],
    open: ['KKKK', 'KDDK', 'KRRK', '.KK.'],
    openfang: ['KKKKKK', 'KWDDWK', 'KDRRDK', '.KKKK.'],
    openbig: ['KKKKK', 'KWWWK', 'KDDDK', 'KRRDK', '.KKK.'],
    tongue: ['KKKK', '.RR.', '.R..'],
    fork: ['KKK.', '..RR', '.R..'],
    pout: ['.K.', 'KRK', '.K.'],
  };
  const MMAP = { K: INK, W: '#ffffff', R: '#e0483e', D: '#5a1014', B: '#9fdcff' };
  function Face(c, X, Y, fr, ang, P, mood, t, bow) {
    this.c = c; this.X = X; this.Y = Y; this.fr = fr; this.P = P; this.mood = mood; this.t = t;
    this.n = ((Math.round((bow ? ang : ang + 90) / 90) % 4) + 4) % 4;
    this.ax = 0; this.ay = 0;
    // mood 'calm' giống 'idle' nhưng không chớp mắt (dùng cho ảnh tĩnh)
    this.blink = mood === 'idle' && ((t + P.seed * 0.61) % 3.3) < 0.14;
    this.shut = mood === 'hurt' || mood === 'sleep' || this.blink;
    this.lid = P.M[0]; this.skin = P.M[1];
  }
  Face.prototype.at = function (t, q) { const a = this.fr.T(t, q); this.ax = this.X + Math.round(a[0]); this.ay = this.Y + Math.round(a[1]); return this; };
  Face.prototype.r = function (x, y, w, h, col) {
    const n = this.n, c = this.c; c.fillStyle = col;
    if (n === 0) c.fillRect(this.ax + x, this.ay + y, w, h);
    else if (n === 1) c.fillRect(this.ax - (y + h - 1), this.ay + x, h, w);
    else if (n === 2) c.fillRect(this.ax - (x + w - 1), this.ay - (y + h - 1), w, h);
    else c.fillRect(this.ax + y, this.ay - (x + w - 1), h, w);
  };
  // miếng chuỗi ký tự, đặt giữa theo chiều ngang tại (cx, y)
  Face.prototype.b = function (rows, cx, y, map) {
    map = map || MMAP;
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j], x0 = cx - (r.length >> 1);
      for (let i = 0; i < r.length; i++) { const col = map[r[i]]; if (col) this.r(x0 + i, y + j, 1, 1, col); }
    }
  };
  // hình chữ nhật bo góc
  Face.prototype.rd = function (x, y, w, h, col) {
    if (w < 4 || h < 3) { this.r(x, y, w, h, col); return; }
    if (w >= 7 && h >= 7) { this.r(x + 2, y, w - 4, 1, col); this.r(x + 1, y + 1, w - 2, 1, col); this.r(x, y + 2, w, h - 4, col); this.r(x + 1, y + h - 2, w - 2, 1, col); this.r(x + 2, y + h - 1, w - 4, 1, col); return; }
    this.r(x + 1, y, w - 2, 1, col); this.r(x, y + 1, w, h - 2, col); this.r(x + 1, y + h - 1, w - 2, 1, col);
  };
  // Con mắt. o: w, h (số lẻ), lid (số hàng mí trên), low (mí dưới), pup ('sq', 'tall', 'slit', 'dot', 'big'),
  // look [x, y], brow ('angry', 'sad', 'flat', 'bushy'), side (1 hoặc -1: phía lông mày chúc xuống), bead (mắt hạt đen).
  Face.prototype.eye = function (t, q, o) {
    o = o || {};
    const P = this.P, E = P.E, mood = this.mood;
    this.at(t, q);
    const w = o.w || 5, h = o.h || 5, hw = (w - 1) / 2, hh = (h - 1) / 2, side = o.side || 1;
    let lid = o.lid || 0, low = o.low || 0, pup = o.pup || 'sq', brow = o.brow || null;
    const look = o.look || [1, 0];
    if (P.st === 1) lid = Math.min(h - 2, lid + 1); else if (P.st >= 2) lid = Math.max(0, lid - 1);
    if (mood === 'attack') { lid = 0; low = 0; pup = pup === 'slit' ? 'slit' : 'dot'; if (!brow || brow === 'flat' || brow === 'sad') brow = 'angry'; }
    const lit = P.st >= 3 && !!E;
    const scl = lit ? E.eye3 : E && P.st >= 1 ? E.eye : '#ffffff', pc = E ? E.pup : INK;
    if (o.bead) {
      // mắt hạt: khối mực có đốm sáng
      if (this.shut) { this.r(-1, 0, 3, 1, INK); if (mood === 'sleep') { this.r(-1, -1, 1, 1, INK); this.r(1, -1, 1, 1, INK); } return; }
      const bh = mood === 'attack' ? 3 : 2;
      if (E && P.st >= 1) this.rd(-2, -2, 4, bh + 2, P.st >= 3 ? E.glow : scl);
      this.r(-1, -1, 2, bh, pc); this.r(0, -1, 1, 1, SH);
      if (brow) this.brow(brow, 1, 1, side);
      return;
    }
    // vành mắt: màu tối của thân, lên Thức tỉnh thì rực màu hệ
    this.rd(-hw - 1, -hh - 1, w + 2, h + 2, lit ? E.ring3 : this.lid);
    if (lit && !this.shut && w >= 5) { this.r(0, -hh - 2, 1, 1, E.ring3); this.r(0, hh + 2, 1, 1, E.ring3); this.r(-hw - 2, 0, 1, 1, E.ring3); this.r(hw + 2, 0, 1, 1, E.ring3); }
    if (this.shut) {
      this.rd(-hw, -hh, w, h, this.skin);
      if (mood === 'hurt') { this.r(-1, -1, 1, 1, INK); this.r(0, 0, 2, 1, INK); this.r(-1, 1, 1, 1, INK); }
      else if (mood === 'sleep') { this.r(-hw, 0, 1, 1, INK); this.r(-hw + 1, 1, w - 2, 1, INK); this.r(hw, 0, 1, 1, INK); }
      else this.r(-hw, 0, w, 1, INK);
      if (brow && mood !== 'sleep') this.brow(brow, hw, hh, side);
      return;
    }
    this.rd(-hw, -hh, w, h, scl);
    // con ngươi
    const top = -hh + lid, botm = hh - low;
    let px = look[0] > 0 ? 1 : look[0] < 0 ? -2 : 0, py = look[1] > 0 ? 0 : look[1] < 0 ? -2 : -1;
    if (w <= 3) px = look[0] > 0 ? 0 : -1;
    if (pup === 'big') { this.r(-1, Math.max(top, -1), 3, Math.min(3, botm - Math.max(top, -1) + 1), pc); this.r(look[0] > 0 ? 1 : -1, Math.max(top, -1), 1, 1, SH); }
    else if (pup === 'tall') { const x = look[0] > 0 ? 1 : look[0] < 0 ? -1 : 0; this.r(x, Math.max(top, -1), 1, Math.min(3, botm - Math.max(top, -1) + 1), pc); }
    else if (pup === 'slit') { const x = look[0] > 0 ? 1 : look[0] < 0 ? -1 : 0; this.r(x, top, 1, botm - top + 1, pc); }
    else if (pup === 'dot') { this.r(look[0] > 0 ? 1 : look[0] < 0 ? -1 : 0, 0, 1, 1, pc); }
    else {
      py = Math.max(py, top); if (py + 1 > botm) py = botm - 1;
      this.r(px, py, w <= 3 ? 1 : 2, 2, pc);
      if (P.st >= 2 || o.hl) this.r(px + (w <= 3 ? 0 : 1), py, 1, 1, P.el === 'ice' ? '#bfe9ff' : SH);
    }
    // mí
    for (let j = 0; j < lid; j++) { const ins = j === 0 && w >= 4 ? 1 : 0; this.r(-hw + ins, -hh + j, w - ins * 2, 1, this.lid); }
    for (let j = 0; j < low; j++) { const ins = j === 0 && w >= 4 ? 1 : 0; this.r(-hw + ins, hh - j, w - ins * 2, 1, this.lid); }
    if (brow === 'angry' && h >= 5) this.r(side > 0 ? 0 : -hw, -hh + lid, hw + 1, 1, this.lid);
    if (brow) this.brow(brow, hw, hh, side);
  };
  Face.prototype.brow = function (kind, hw, hh, side) {
    const y = -hh - 2, w = hw * 2 + 1;
    if (kind === 'flat') this.r(-hw - 1, y + 1, w + 2, 1, INK);
    else if (kind === 'bushy') { this.r(-hw - 1, y, w + 2, 2, '#ffffff'); this.r(side > 0 ? -hw - 2 : hw + 2, y + 1, 1, 2, '#ffffff'); }
    else {
      const s = kind === 'angry' ? side : -side;
      for (let i = 0; i < w + 1; i++) { const f = i / w; const x = s > 0 ? -hw - 1 + i : hw + 1 - i; this.r(x, y + Math.round(f * 2), 1, 1, INK); }
    }
  };
  // Miệng: kind lúc thường; lúc đánh thì há (kiểu open), lúc đau thì méo.
  Face.prototype.mouth = function (t, q, kind, open) {
    this.at(t, q);
    const m = this.mood;
    let k = kind;
    if (m === 'attack') k = open || 'open'; else if (m === 'hurt') k = 'wavy'; else if (m === 'sleep') k = kind === 'drool' ? 'drool' : 'tiny';
    this.b(MOUTHS[k], 0, 0);
  };
  Face.prototype.blush = function (t, q) { this.at(t, q); this.r(-1, 0, 2, 1, PINK); };
  // chữ z bay lên khi ngủ (theo màn hình, không xoay)
  Face.prototype.zzz = function (t, q) {
    if (this.mood !== 'sleep') return;
    const a = this.fr.T(t, q), c = this.c, ph = (this.t * 0.8) % 1, x = this.X + Math.round(a[0]) + 4 + Math.round(ph * 3), y = this.Y + Math.round(a[1]) - 4 - Math.round(ph * 5);
    c.fillStyle = '#eafcff';
    c.fillRect(x, y, 3, 1); c.fillRect(x + 1, y + 1, 1, 1); c.fillRect(x, y + 2, 3, 1);
    c.fillRect(x + 4, y - 4, 2, 1); c.fillRect(x + 4, y - 3, 1, 1); c.fillRect(x + 4, y - 2, 2, 1);
  };

  // ---------- các dòng vũ khí ----------
  const FAM = { sword: [], bow: [], spear: [], hammer: [] };
  // def: name (tên dòng), short (gốc tên cho hình tiến hóa), nature (tính nết), mat (chất liệu đầu vũ khí),
  // build(S, P): vẽ thân; face(F, P): vẽ mặt; warp: thông số bẻ cong khi nhiễm Độc; str(P): dây cung.
  function fam(type, def) { def.type = type; def.idx = FAM[type].length; FAM[type].push(def); }

  // ======================= KIẾM =======================
  // Chuôi kiếm dùng chung: chắn tay, cán, đốc. o.guard: 'horn' (sừng), 'bar' (thanh ngang), 'disc' (đĩa), 'none'.
  function hilt(S, P, o) {
    o = o || {};
    const A = o.A || P.A, gt = o.gt == null ? 3 : o.gt, gw = o.gw || 6, gm = o.grip || RED;
    S.part((s) => {
      if (o.guard === 'bar') s.g([[gt, -gw], [gt, gw], [gt + 2.5, gw], [gt + 2.5, -gw]], A);
      else if (o.guard === 'disc') s.e(gt + 1, 0, 1.6, gw, A);
      else if (o.guard !== 'none') s.g([[gt, -gw], [gt, gw], [gt + 5, gw + 1.5], [gt + 2.5, gw - 2], [gt + 2.5, -gw + 2], [gt + 5, -gw - 1.5]], A);
      if (P.rar === 0 && o.guard !== 'none' && !o.nodot) s.in(() => { s.box(gt + 1, 0, 2, 2, Md(o.dot || (P.ice ? BLU : RED))); });
    });
    gem(S, P, gt + 1, 0);
    grip(S, P, o.g0 == null ? -3 : o.g0, gt - 1, gm, 2);
    S.part((s) => {
      const pt = (o.g0 == null ? -3 : o.g0) - 2;
      if (o.pommel === 'ring') { s.e(pt - 1, 0, 2.5, 2.5, A); s.in(() => { s.box(pt - 1, 0, 2, 2, 0); }); }
      else s.e(pt, 0, 1.5, 1.5, A);
    });
  }

  // 0. Kiếm Rèn: lưỡi thẳng bản to, một mắt, tua đỏ. Tính kiêu.
  fam('sword', {
    name: 'Kiếm Rèn', short: 'Kiếm Rèn', nature: 'kiêu ngạo', mat: STEEL, warp: { t0: 6, L: 36, hook: 0.5 },
    spark: [[30, 0], [16, -3], [38, 1], [6, 6]],
    build: function (S, P) {
      const st = P.st, M = P.M;
      tassel(S, -5, 1, RED, 4, P.rar >= 3 ? GOLD : null);
      rtassel(S, P, 5, -6);
      const E = edges([[6, 4, 4], [25, 5, 5], [33, 3.5, 3.5], [40, 0, 0]], P);
      if (P.fire) {
        if (st === 1) flame(S, 8, -4, 0.5, -1, 4, 3);
        if (st === 3) { flame(S, 8, -4, 0.2, -1, 8, 5); flame(S, 8, 4, 0.2, 1, 6, 4, -0.35); }
      }
      if (P.ice) {
        crystal(S, 9, -4, 0.7, -1, 3.5 + st * 1.5, 3);
        if (st >= 2) crystal(S, 20, 4.5, 0.7, 1, 6, 3.5);
        if (st >= 3) { crystal(S, 26, -5, 0.8, -1, 7, 3.5, true); crystal(S, 7, 4, -0.2, 1, 6, 3, true); }
      }
      if (P.poison) {
        if (st === 1) vine(S, [[7, -4.5], [10, -5.5], [13, -4.5]], [[10, -6.5]]);
        if (st >= 2) shroom(S, 11, -4.5, 0.2, -1, 2, 2.2);
        if (st >= 3) { shroom(S, 23, -5, 0.3, -1, 2.5, 3); vine(S, [[6, 4], [9, -5], [14, 5.5], [19, -5.5]], [[9, -6], [14, 6.5]]); }
      }
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.g(E.poly, M);
        s.in(() => {
          s.l(19, 0, 34, 0, 1, Dk(M)); s.l(22, 2, 29, 2, 1, SH);
          seed(s, P, 6, 22, 4, P.seed); core(s, P, 9, 37, 0);
          engrave(s, P, [[24, -2.5], [34, -1.5]]);
        });
      });
      hilt(S, P, { guard: 'horn' });
      motes(S, P, [[14, -11], [42, 3], [26, -10], [30, 9], [36, -6], [18, 9]]);
    },
    face: function (F, P) {
      F.eye(14, 0, { lid: 1 });
      if (P.st >= 3) F.eye(22, 0, { w: 3, h: 3, lid: 0 });
      F.mouth(9.5, 0, 'smirk', 'openfang');
      F.zzz(16, 4);
    },
  });

  // 1. Đao Lưỡi Liềm: cán gỗ dài, lưỡi cong móc như trăng non. Tính láu cá.
  fam('sword', {
    name: 'Đao Lưỡi Liềm', short: 'Lưỡi Liềm', nature: 'láu cá', mat: STEEL, ks: 1.08, warp: { t0: 16, L: 30, amp: 0.7 },
    arc: { t0: 21, R: 11.5, dir: -1 },
    spark: [[28, 0], [38, 0], [18, 0], [46, 0]],
    build: function (S, P) {
      const st = P.st, M = P.M;
      rtassel(S, P, 1, -2);
      const E = edges([[13, 1.5, 1.5], [18, 3.5, 3.5], [30, 4.5, 4.5], [41, 3, 3.5], [50, 0, 0]], P, { flip: true, per: 7, tip: 0.7 });
      if (P.fire) {
        if (st === 1) flame(S, 20, 4, 0.5, 1, 4, 3, -0.35);
        if (st === 3) { flame(S, 16, 3.5, 0.2, 1, 7, 4.5, -0.35); flame(S, 16, -3, 0.3, -1, 5, 3.5); }
      }
      if (P.ice) {
        crystal(S, 24, 4, 0.5, 1, 3.5 + st * 1.5, 3);
        if (st >= 2) crystal(S, 35, 4, 0.5, 1, 6, 3.5, true);
        if (st >= 3) { crystal(S, 17, 3, -0.2, 1, 6, 3); crystal(S, 30, -4, 0.6, -1, 5, 3, true); }
      }
      if (P.poison) {
        if (st === 1) vine(S, [[8, 1.5], [11, -2], [14, 2]], [[11, -3]]);
        if (st >= 2) shroom(S, 26, 4.5, 0.2, 1, 2, 2.2);
        if (st >= 3) { shroom(S, 37, 4, 0.2, 1, 2.5, 2.8); vine(S, [[2, 1.5], [5, -2], [8, 2], [11, -2], [14, 2]], [[5, -3], [11, -3]]); }
      }
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.g(E.poly, M);
        s.in(() => {
          s.l(20, -2.5, 46, -1, 1, Lt(M)); s.l(24, 2, 40, 2, 1, Dk(M));
          seed(s, P, 14, 30, 3.5, P.seed); core(s, P, 16, 46, 0.5);
          engrave(s, P, [[32, 1], [42, 1]]);
        });
      });
      // khâu sắt và cán gỗ
      S.part((s) => { s.l(-5, 0, 13, 0, 2, WD); s.in(() => { for (let t = -3; t < 12; t += 4) s.p(t, 0, Dk(WD)); }); });
      S.part((s) => { s.l(12, -1.5, 12, 1.5, 3, P.A); s.l(-6, -1, -6, 1, 2, P.A); });
      if (P.rar >= 1) S.part((s) => { s.l(4, -1.5, 4, 1.5, 2, Md(P.R.P)); if (P.rar >= 3) { s.l(0, -1.5, 0, 1.5, 1, Md(P.R.P)); s.l(8, -1.5, 8, 1.5, 1, Md(P.R.P)); } });
      gem(S, P, 15.5, 0, 2);
      motes(S, P, [[30, 10], [44, -7], [22, -9], [50, 6], [38, 9], [14, 7]]);
    },
    face: function (F, P) {
      F.eye(24.5, 0, { lid: 1, low: 1, look: [-1, 0], pup: 'tall' });
      if (P.st >= 3) F.eye(34, 0, { w: 3, h: 3, look: [-1, 0] });
      F.mouth(19, 0, 'grin', 'openbig');
      F.zzz(26, 4);
    },
  });

  // ======================= CUNG =======================
  // Cung vẽ theo trục: t là hướng bắn (ra trước), q là dọc cánh cung (âm là lên trên). Điểm cầm ở (0, 0), bụng cung ở t dương.
  const bowStr = (a, b, mid, o) => Object.assign({ a: a, b: b, mid: mid }, o || {});

  // 0. Cung Rồng Rắn: thân rồng rắn uốn thành cánh cung, đầu rồng ngậm dây. Tính kiêu.
  fam('bow', {
    name: 'Cung Rồng Rắn', short: 'Rồng Rắn', nature: 'kiêu kỳ', mat: GRN, warp: { bow: true, f: 0.42, ph: 0.8, fade: true, amp: 0.55 },
    spark: [[4, 0], [0, -11], [0, 11], [-4, -17]],
    str: function (P) { return bowStr([-6, -12], [-6, 14], [-6, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M, el = P.el, E = P.E;
      const belly = st >= 2 ? (P.fire ? GOLD : P.poison ? E.B2 : WHT) : GOLD, fin = st >= 2 ? (P.fire ? E.B2 : P.poison ? E.B2 : E.B2) : RED;
      const spine = [[-4, -14], [-1, -11], [2, -6], [3, 0], [2, 6], [-1, 11], [-4, 14]];
      rtassel(S, P, 4, 2);
      // vây lưng theo hệ
      if (P.fire) {
        if (st === 1) flame(S, 3, -4, 1, -0.4, 4, 3);
        if (st >= 2) for (const q of st === 3 ? [-10, -5, 4, 9] : [-8, 5]) flame(S, 3 - Math.abs(q) * 0.22, q, 1, -0.5, st === 3 ? 6.5 : 5, 3.5);
        if (st === 3) { flame(S, -6, -20, -0.6, -1, 7, 4, -0.35); flame(S, -9, -17, -1, -0.3, 5, 3, -0.35); }
      }
      if (P.ice) {
        crystal(S, 3, -5, 1, -0.4, 3 + st, 2.6);
        if (st >= 2) { crystal(S, 3, 5, 1, 0.4, 5, 3, true); crystal(S, 0, 11, 1, 0.6, 4, 2.6); }
        if (st >= 3) { crystal(S, 0, -11, 1, -0.6, 6, 3, true); crystal(S, -6, -20, -0.5, -1, 7, 3); crystal(S, -3, -20, 0.3, -1, 6, 3, true); }
      }
      if (P.poison) {
        if (st === 1) vine(S, [[1, 4], [4, 6], [2, 9]], [[5, 6]]);
        if (st >= 2) { thorn(S, 3.5, -5, 1, -0.3, 3, 2.4); thorn(S, 3.5, 5, 1, 0.3, 3, 2.4); shroom(S, 1, 10, 1, 0.3, 2, 2); }
        if (st >= 3) {
          thorn(S, 1, -10, 1, -0.5, 3.5, 2.4); shroom(S, 3.5, 0.5, 1, 0, 2.5, 2.6);
          // mang rắn hổ bành ra sau đầu
          S.part({ ol: P.ol }, (s) => { s.g([[-11, -13], [-13, -18], [-10, -22], [-5, -22], [-2, -13]], E.B2); s.in(() => { s.l(-10, -19, -10, -15, 1, Lt(E.B2)); s.l(-5, -19, -5, -15, 1, Lt(E.B2)); }); });
        }
      }
      // đuôi cuộn
      S.part({ ol: P.ol }, (s) => { s.pl([[-4, 14], [-8, 15], [-9, 13]], 2, M); s.box(-9.5, 11.5, 2, 2, Md(fin)); });
      // thân
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.pl(spine, 4, M);
        s.in(() => {
          s.pl(spine.map((p) => [p[0] - 2, p[1]]), 1, Md(belly));
          for (let i = 0; i < spine.length - 1; i++) { const a = spine[i], b = spine[i + 1]; s.p((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Dk(M)); s.p(a[0] + 1, a[1], Lt(M)); }
          seed(s, P, -3, 4, 1, P.seed);
          if (st === 1) for (let q = 2; q <= 12; q += 3) s.p(2 - Math.abs(q) * 0.3, q, P.el === 'ice' ? SH : E.B[1]);
          engrave(s, P, [[2, -5], [0, -10]]);
        });
      });
      // vây lưng gốc
      if (st < 2) S.part({ ol: GRN[0] }, (s) => { for (const p of [[2.5, -9], [4.5, -5], [4.5, 5], [2.5, 9]]) s.p(p[0], p[1], Md(RED)); });
      // chỗ nắm
      S.part((s) => { s.g([[1, -2.5], [5, -2.5], [5, 2.5], [1, 2.5]], st >= 2 ? P.A : RED); s.in(() => { s.l(1, -2.5, 5, -2.5, 1, Md(GOLD)); s.l(1, 2.5, 5, 2.5, 1, Md(GOLD)); }); });
      gem(S, P, 3, 0);
      // sừng
      S.part({ ol: P.ol }, (s) => {
        const hl = st >= 3 ? 4 : st >= 2 ? 3 : 2, hc = P.ice && st >= 2 ? E.B2 : P.poison && st >= 2 ? E.B2 : GOLD;
        s.l(-7, -21, -8, -21 - hl, 1, Md(hc)); s.l(-4, -21, -4, -21 - hl, 1, Lt(hc));
        if (st >= 3) { s.p(-9, -23, Md(hc)); s.p(-3, -23, Md(hc)); }
      });
      // đầu rồng
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.g([[-9, -20], [-2, -21], [2, -18], [2, -14.5], [-4, -12], [-9, -14]], M);
        s.g([[2, -18], [5, -17], [5, -15], [2, -14.5]], M);
        s.in(() => { s.l(0, -18, 4, -17, 1, Lt(M)); s.l(-8, -13.5, -1, -13.5, 1, Md(belly)); s.p(4.5, -16.5, INK); });
      });
      // râu rồng
      S.part({ ol: false }, (s) => { const rc = st >= 2 ? Md(fin) : Md(RED); s.l(5, -15, 8, -13, 1, rc); s.p(9, -14, rc); });
      motes(S, P, [[9, -8], [-12, -24], [8, 8], [5, -19], [-10, 6], [7, 0]]);
    },
    face: function (F, P) {
      F.eye(-3, -17, { w: 3, h: 3, lid: 1, brow: P.st >= 3 || F.mood === 'attack' ? 'angry' : null });
      if (F.mood === 'attack') { F.at(4, -13.5); F.r(0, 0, 2, 1, '#e0483e'); F.r(2, 1, 1, 1, '#e0483e'); }
      F.zzz(-2, -20);
    },
  });

  // thân lưỡi kiếm theo biên dạng, có biến hình theo hệ; inner(s, E) vẽ nét bên trong
  function bladePart(S, P, prof, o, inner) {
    const E = edges(prof, P, o);
    S.part({ ol: P.ol, rim: true }, (s) => { s.g(E.poly, (o && o.mat) || P.M); if (inner) s.in(() => inner(s, E)); });
    return E;
  }
  const LEAF = ['#5f8a5a', '#b9d8a6', '#f2fbe2'];
  const WATER = ['#4f6f94', '#a9c6e0', '#f0f8ff'];

  // 2. Kiếm Lá Lúa: lưỡi mảnh cong như lá lúa, chắn tay là hai bông lúa trĩu hạt. Tính hiền.
  fam('sword', {
    name: 'Kiếm Lá Lúa', short: 'Lá Lúa', nature: 'hiền lành', mat: LEAF, warp: { t0: 8, L: 34, hook: 0.6 },
    arc: { t0: 9, R: 62, dir: -1 },
    spark: [[26, 0], [14, -2], [36, 0], [4, 5]],
    build: function (S, P) {
      const M = P.M, st = P.st, G2 = st >= 2 ? P.A : STRAW;
      rtassel(S, P, -4, 1);
      grow(S, P, [[20, -3.5, 0.5, -1], [27, 3, 0.5, 1], [32, -2.5, 0.6, -1], [9, 3.5, -0.2, 1]]);
      bladePart(S, P, [[5, 2, 2], [11, 4, 4], [21, 4, 4], [32, 2.5, 2.5], [42, 0, 0]], { per: 7 }, (s) => {
        s.l(8, 0, 39, 0, 1, Dk(M)); s.l(20, 2, 30, 1.5, 1, SH);
        seed(s, P, 6, 22, 3.5, P.seed); core(s, P, 10, 38, -1);
        engrave(s, P, [[22, -2], [32, -1.5]]);
      });
      // hai bông lúa trĩu xuống làm chắn tay
      S.part((s) => {
        for (const sg of [-1, 1]) { s.pl([[5, sg * 2], [5, sg * 5], [3, sg * 7.5], [0, sg * 8]], 1, Md(G2)); s.box(4.5, sg * 5.5, 2, 2, Md(G2)); s.box(2, sg * 7.5, 2, 2, Lt(G2)); s.box(0, sg * 8, 2, 2, Md(G2)); }
        s.l(4.5, -2.5, 4.5, 2.5, 2, G2);
      });
      gem(S, P, 4.5, 0);
      grip(S, P, -3, 3, STRAW, 2);
      S.part((s) => { s.e(-5, 0, 1.5, 1.5, G2); });
      motes(S, P, [[16, -9], [40, 5], [28, -8], [30, 8], [38, -7], [12, 8]]);
    },
    face: function (F, P) {
      F.eye(16, 0, { pup: 'big' });
      if (P.st >= 3) F.eye(24, 0, { w: 3, h: 3 });
      F.mouth(10.5, 0, 'smile', 'open');
      F.blush(12, -3); F.blush(12, 3);
      F.zzz(18, 4);
    },
  });

  // 3. Gươm Rồng: đầu rồng vàng có sừng ngậm lưỡi gươm, mũi gươm chẻ đôi như lưỡi rồng. Tính dữ.
  fam('sword', {
    name: 'Gươm Rồng', short: 'Gươm Rồng', nature: 'dữ dằn', mat: STEEL, ks: 0.94, warp: { t0: 14, L: 30, hook: 0.4 },
    spark: [[30, 0], [6, -6], [38, 0], [6, 6]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = P.A;
      rtassel(S, P, -6, 1);
      grow(S, P, [[18, -4, 0.4, -1], [26, 4.2, 0.5, 1], [33, -4, 0.6, -1], [15, 4, 0.2, 1]]);
      // vây lưng rồng (hệ Lửa thì răng lửa mọc thay)
      if (!(P.fire && st >= 2)) S.part({ ol: P.ol }, (s) => { for (const t of [17, 24, 31]) s.g([[t, -3.8], [t + 3.5, -7.5 - (st >= 3 ? 1 : 0)], [t + 5.5, -4]], P.ice && st >= 2 ? P.E.B2 : M); });
      bladePart(S, P, [[10, 3.5, 3.5], [30, 4.5, 4.5], [38, 4, 4], [42.5, 2.5, 2.5]], { notip: true }, (s) => {
        s.g([[43.5, -1.6], [37, 0], [43.5, 1.6]], 0); // chẻ đôi mũi gươm
        s.l(16, 0, 35, 0, 1, Dk(M)); s.l(22, 2.5, 31, 2.5, 1, SH);
        seed(s, P, 13, 26, 3.5, P.seed); core(s, P, 15, 34, -1.5);
        engrave(s, P, [[22, -2.5], [34, -2.5]]);
      });
      // sừng rồng vểnh ra sau
      S.part((s) => { for (const sg of [-1, 1]) { s.pl([[3, sg * 5.5], [1, sg * 8.5], [-2, sg * 10]], 2, st >= 2 ? P.M : BONE); } });
      // đầu rồng ngậm lưỡi gươm
      S.part((s) => {
        s.g([[0, -3.5], [2, -6.5], [8, -8], [13, -7], [14.5, -5.5], [11, -4], [11, 4], [14.5, 5.5], [13, 7], [8, 8], [2, 6.5], [0, 3.5]], A);
        s.in(() => {
          s.l(2, -5, 2, 5, 1, Dk(A)); s.l(9.5, -7, 13, -6.5, 1, Lt(A));
          s.p(13, -6, INK); s.p(13, 6, INK); // lỗ mũi
          s.box(11.5, -3.6, 1, 2, SH); s.box(11.5, 3.6, 1, 2, SH); // nanh
          if (P.rar === 0) s.box(2.5, 0, 2, 2, Md(RED));
        });
      });
      gem(S, P, 2.5, 0);
      // râu rồng
      S.part({ ol: false }, (s) => { const rc = Md(sec(P, RED)); for (const sg of [-1, 1]) { s.l(14, sg * 7, 16, sg * 9.5, 1, rc); s.p(17.5, sg * 9.5, rc); } });
      grip(S, P, -4, -1, RED, 2);
      S.part((s) => { s.e(-7, 0, 2.5, 2.5, A); s.in(() => { s.box(-7, 0, 2, 2, 0); }); });
      motes(S, P, [[20, -11], [44, 4], [28, -10], [31, 9], [38, -7], [19, 10]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; F.lid = P.A[0]; F.skin = P.A[1];
      F.eye(6.5, -4, { w: 3, h: 3, brow: 'angry', side: 1, look: [1, 0] }); F.eye(6.5, 4, { w: 3, h: 3, brow: 'angry', side: -1, look: [-1, 0] });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) F.eye(21, 0, { pup: 'slit', look: [0, 0] });
      if (F.mood === 'attack') { F.at(12, 0); F.r(-3, -1, 7, 2, '#5a1014'); F.r(-3, -1, 1, 1, SH); F.r(3, -1, 1, 1, SH); }
      F.zzz(8, 6);
    },
  });

  // 4. Mã Tấu: bản to, càng ra mũi càng rộng, sống đeo ba khoen vàng. Tính bặm trợn.
  fam('sword', {
    name: 'Mã Tấu', short: 'Mã Tấu', nature: 'bặm trợn', mat: IRON, ks: 0.93, warp: { t0: 8, L: 34, hook: 0.4 },
    spark: [[30, 2], [18, -2], [38, 0], [22, 5]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = P.A;
      tassel(S, -8, 1, RED, 5, null);
      rtassel(S, P, 5, -5);
      grow(S, P, [[10, -3, 0.4, -1], [24, 6.5, 0.4, 1], [36, -3.5, 0.6, -1], [14, 4.5, 0.2, 1]]);
      // ba khoen trên sống
      if (!(P.fire && st >= 2)) S.part((s) => { for (const t of [17, 24, 31]) { s.box(t, -5.2, 3, 3, A); } s.in(() => { for (const t of [17, 24, 31]) s.box(t, -5.2, 1, 1, 0); }); });
      bladePart(S, P, [[6, 2.5, 2.5], [18, 3, 4.5], [30, 3.5, 7], [36, 3.5, 7.5], [41, 3, 3.5], [43, 2, -0.5]], { per: 7.5, notip: true }, (s) => {
        s.l(8, -1, 40, -1.5, 1, Dk(M)); s.l(24, 4.5, 35, 5, 1, SH); s.l(12, 2, 20, 3, 1, Lt(M));
        seed(s, P, 7, 24, 3, P.seed); core(s, P, 12, 38, 2);
        engrave(s, P, [[22, 1.5], [36, 2]]);
      });
      hilt(S, P, { guard: 'disc', gw: 4.5, grip: HORN, g0: -4, pommel: 'ring' });
      motes(S, P, [[16, -10], [44, 4], [28, -9], [32, 11], [38, -7], [18, 9]]);
    },
    face: function (F, P) {
      F.eye(16, 0.5, { brow: 'flat', lid: 1 });
      // vết sẹo vắt qua mắt
      F.at(16, 0.5); F.r(-4, -4, 1, 1, '#8c1c1f'); F.r(-3, -3, 1, 1, '#8c1c1f'); F.r(3, 3, 1, 1, '#8c1c1f'); F.r(4, 4, 1, 1, '#8c1c1f');
      if (P.st >= 3) F.eye(26, 2, { w: 3, h: 3, brow: 'flat' });
      F.mouth(10.5, 0.5, 'grin', 'openbig');
      F.zzz(18, 5);
    },
  });

  // 5. Dao Rựa: cán gỗ dài, lưỡi chữ nhật, mũi quặp xuống như mỏ chim. Tính ngơ ngác.
  fam('sword', {
    name: 'Dao Rựa', short: 'Dao Rựa', nature: 'ngơ ngác', mat: IRON, warp: { t0: 12, L: 30, amp: 0.8 },
    spark: [[28, 1], [18, 1], [38, 6], [34, 0]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, -3, 1);
      grow(S, P, [[16, -2.5, 0.4, -1], [28, -2.5, 0.5, -1], [22, 5, 0.3, 1], [35, -2, 0.7, -1]]);
      bladePart(S, P, [[10, 2.5, 2.5], [13, 2.5, 5], [30, 2.5, 5], [34, 2.5, 6], [37, 2, 10], [40, -1, 11.5], [42, -6, 11.5], [42.5, -9, 11]], { notip: true, per: 7 }, (s) => {
        s.l(13, -1, 36, -1, 1, Dk(M)); s.l(15, 4, 34, 4, 1, Lt(M)); s.l(37, 7, 40, 10, 1, SH);
        seed(s, P, 11, 26, 3.5, P.seed); core(s, P, 14, 34, 1.5);
        engrave(s, P, [[24, 1.5], [34, 1.5]]);
      });
      S.part((s) => { s.l(-7, 0, 9, 0, 2, WD); s.in(() => { for (let t = -5; t < 9; t += 4) s.p(t, 0, Dk(WD)); }); });
      S.part((s) => { s.l(9.5, -2, 9.5, 2, 3, P.st >= 2 ? P.A : STEEL); s.l(-8, -1, -8, 1, 2, P.st >= 2 ? P.A : STEEL); });
      if (P.rar >= 1) S.part((s) => { s.l(3, -1.5, 3, 1.5, 2, Md(P.R.P)); if (P.rar >= 3) { s.l(-1, -1.5, -1, 1.5, 1, Md(P.R.P)); s.l(6.5, -1.5, 6.5, 1.5, 1, Md(P.R.P)); } });
      gem(S, P, 9.5, 0, 2);
      motes(S, P, [[18, -8], [43, 3], [28, -8], [30, 11], [38, -6], [20, 10]]);
    },
    face: function (F, P) {
      F.eye(21, -0.5, { bead: true }); F.eye(21, 3.5, { bead: true });
      if (P.st >= 3) F.eye(28, 1.5, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(16.5, 1.5, 'o', 'open');
      F.zzz(23, 5);
    },
  });

  // 6. Kiếm Tre: khúc tre ngà có đốt, mũi vót xéo, nhánh lá non bên hông. Tính ngái ngủ.
  fam('sword', {
    name: 'Kiếm Tre', short: 'Kiếm Tre', nature: 'ngái ngủ', mat: BAM, warp: { t0: 6, L: 36, hook: 0.3 },
    spark: [[28, 0], [10, 0], [37, -1], [19, 2]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 3, -5);
      grow(S, P, [[23.5, -3.6, 0.5, -1], [14.5, 3.6, 0.4, 1], [32.5, -3.4, 0.6, -1], [5.5, -4, -0.1, -1]]);
      // nhánh lá non
      if (st < 2) S.part({ ol: BAMG[0] }, (s) => { s.l(23, 4, 26, 6.5, 1, Md(BAMG)); s.g([[26, 6], [30, 6.5], [31.5, 8.5], [27.5, 8]], BAMG); s.g([[25, 7], [25.5, 10], [23.5, 11.5], [23.5, 8]], BAMG); });
      bladePart(S, P, [[5, 4, 4], [33, 3.6, 3.6], [41, 3.6, -1.5]], { notip: true, per: 9, amp: 0.8 }, (s) => {
        for (const t of [5, 14, 23, 32]) { s.l(t, -6, t, 6, 1, Dk(M)); s.l(t + 1, -6, t + 1, 6, 1, Lt(M)); }
        s.l(7, -2, 12, -2, 1, Lt(M)); s.l(16, -2, 21, -2, 1, Lt(M)); s.l(25, -2, 30, -2, 1, Lt(M)); s.l(34, -2, 38, -2, 1, SH);
        seed(s, P, 6, 22, 3.5, P.seed); core(s, P, 7, 38, 1.5);
        engrave(s, P, [[25, 1.5], [31, 1.5]]);
      });
      // chắn tay là khúc tre ngang buộc dây đỏ
      S.part((s) => { s.l(3, -6, 3, 6, 2, st >= 2 ? P.A : BAM); s.in(() => { s.p(3, -6, Dk(BAM)); s.p(3, 6, Dk(BAM)); }); });
      S.part({ ol: RED[0] }, (s) => { s.l(2.5, -1.5, 2.5, 1.5, 2, Md(sec(P, RED))); });
      gem(S, P, 3, 4.5);
      grip(S, P, -4, 1, BAM, 3, { plain: true });
      S.part((s) => { s.l(-5.5, -2, -5.5, 2, 2, st >= 2 ? P.A : BAM); });
      motes(S, P, [[16, -9], [43, 2], [27, -9], [31, 9], [38, -7], [12, 8]]);
    },
    face: function (F, P) {
      F.eye(18.5, 0, { lid: 3, look: [0, 1] });
      if (P.st >= 3) F.eye(27.5, 0, { w: 3, h: 3, lid: 1, look: [0, 1] });
      F.mouth(10, 0, 'drool', 'open');
      F.zzz(20, 4);
    },
  });

  // 7. Đoản Kiếm Đông Sơn: dao găm đồng bản rộng hình lá, sống nổi, đốc là tượng người. Tính nghiêm, như cụ già.
  fam('sword', {
    name: 'Đoản Kiếm Đông Sơn', short: 'Đông Sơn', nature: 'nghiêm nghị', mat: BRZ, warp: { t0: 6, L: 34, hook: 0.4 },
    spark: [[26, 0], [12, -4], [36, 0], [12, 4]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = st >= 2 ? P.A : BRZ;
      rtassel(S, P, 1, -8);
      grow(S, P, [[18, -5.5, 0.5, -1], [24, 4.5, 0.5, 1], [30, -3.5, 0.6, -1], [8, 7, -0.1, 1]]);
      bladePart(S, P, [[5, 6, 6], [9, 7, 7], [20, 5.5, 5.5], [32, 3, 3], [41, 0, 0]], { per: 7 }, (s) => {
        s.l(7, 0, 38, 0, 2, Dk(M)); s.l(7, 1, 37, 1, 1, Lt(M)); s.l(24, 3, 30, 2.5, 1, SH);
        if (st < 2) { for (const p of [[22, -3.5], [28, 2.5], [12, 5.5], [33, -1.5]]) s.box(p[0], p[1], 2, 1, '#5fa58a'); }
        seed(s, P, 6, 22, 5.5, P.seed); core(s, P, 9, 37, -2.5);
        engrave(s, P, [[21, -3], [26, -2], [31, -1.5]]);
      });
      // chắn tay hai đầu cuộn
      S.part((s) => { s.l(3, -8, 3, 8, 2, A); s.box(1, -8.5, 2, 3, A); s.box(1, 8.5, 2, 3, A); });
      gem(S, P, 3, 0);
      // cán đồng có đai, đốc tròn có búi tóc
      S.part((s) => { s.l(-3, 0, 1, 0, 3, A); s.in(() => { s.l(-2, -2, -2, 2, 1, Dk(A)); s.l(0, -2, 0, 2, 1, Dk(A)); if (P.rar >= 1) s.l(-1, -2, -1, 2, 1, Md(P.R.P)); }); });
      S.part((s) => { s.e(-6, 0, 2.5, 2.5, A); s.box(-9, 0, 2, 2, A); s.in(() => { s.p(-6.5, -1, INK); s.p(-6.5, 1, INK); }); });
      motes(S, P, [[16, -11], [43, 3], [27, -10], [31, 9], [37, -7], [19, 10]]);
    },
    face: function (F, P) {
      F.eye(15, -3.5, { w: 3, h: 3, brow: 'bushy', side: 1, look: [1, 0] }); F.eye(15, 3.5, { w: 3, h: 3, brow: 'bushy', side: -1, look: [-1, 0] });
      if (P.st >= 3) F.eye(23, 0, { w: 3, h: 3, look: [0, 0], pup: 'dot' });
      // ria và râu bạc
      F.at(10.5, 0);
      if (F.mood === 'attack') F.b(MOUTHS.open, 0, 0);
      else F.r(-1, 0, 2, 1, INK);
      F.b(['WWW...WWW', 'WW.....WW', 'W.......W'], 0, -1, { W: '#ffffff' });
      F.b(['.W.', 'WWW', 'WWW', '.W.'], 0, F.mood === 'attack' ? 4 : 2, { W: '#eeeaf2' });
      F.zzz(17, 6);
    },
  });

  // 8. Đao Cá Chép: cả lưỡi là con cá chép vượt vũ môn, đuôi xòe làm chắn tay. Tính hớn hở.
  fam('sword', {
    name: 'Đao Cá Chép', short: 'Cá Chép', nature: 'hớn hở', mat: STEEL, warp: { t0: 8, L: 34, amp: 1.2 },
    spark: [[26, 0], [14, 0], [38, 0], [5, 5]],
    build: function (S, P) {
      const M = P.M, st = P.st, FN = sec(P, ORG);
      rtassel(S, P, -4, 1);
      grow(S, P, [[14, -3.5, 0.3, -1], [30, 5, 0.5, 1], [34, -4.5, 0.6, -1], [16, 4, 0.2, 1]]);
      // vây lưng, vây bụng, đuôi
      if (!(P.fire && st >= 2)) S.part({ ol: P.ol }, (s) => { s.g([[18, -4], [22, -8.5 - st * 0.5], [29, -8 - st * 0.5], [32, -4.5]], FN); s.in(() => { s.l(22, -7, 23, -5, 1, Dk(FN)); s.l(26, -7, 27, -5, 1, Dk(FN)); }); });
      S.part({ ol: P.ol }, (s) => { s.g([[25, 5], [22, 9], [28, 7.5]], FN); });
      S.part({ ol: P.ol }, (s) => { s.g([[9, 0], [3, -7], [5.5, 0], [3, 7]], FN); s.in(() => { s.l(4.5, -4, 7, -1, 1, Lt(FN)); s.l(4.5, 4, 7, 1, 1, Dk(FN)); }); });
      bladePart(S, P, [[8, 1.5, 1.5], [14, 3.5, 4], [26, 5, 5.5], [35, 4.5, 4.5], [40, 2.5, 2.5], [42, 1, 1]], { notip: true, per: 7 }, (s) => {
        for (let t = 13; t < 31; t += 4) for (let q = -2; q <= 3; q += 2.5) s.p(t + (q > 0 ? 2 : 0), q, Dk(M));
        s.l(32.5, -3.5, 31.5, 0, 1, Dk(M)); s.l(31.5, 0, 32.5, 3.5, 1, Dk(M));
        s.l(14, 3, 28, 4.5, 1, Lt(M)); s.l(20, -3, 26, -3.5, 1, SH);
        seed(s, P, 9, 24, 3.5, P.seed); core(s, P, 12, 30, 1);
        engrave(s, P, [[14, 0.5], [28, 0.5]]);
      });
      gem(S, P, 9, 0);
      grip(S, P, -4, 2.5, RED, 2);
      S.part((s) => { s.e(-6, 0, 1.6, 1.6, P.A); });
      motes(S, P, [[16, -11], [44, 3], [27, -11], [31, 10], [38, -7], [19, 9]]);
    },
    face: function (F, P) {
      F.eye(36.5, -0.5, { pup: 'big', hl: true });
      if (P.st >= 3) F.eye(29, 2, { w: 3, h: 3 });
      F.at(42, 0);
      if (F.mood === 'attack') F.b(MOUTHS.open, 0, -3);
      else if (F.mood === 'hurt') F.b(MOUTHS.wavy, 0, -1);
      else { F.r(-1, -1, 3, 1, '#ef7f78'); F.r(-1, 0, 1, 1, '#ef7f78'); F.r(1, 0, 1, 1, '#ef7f78'); F.r(0, 0, 1, 1, INK); }
      F.blush(33.5, 3);
      F.zzz(38, 5);
    },
  });

  // 9. Kiếm Sóng Nước: lưỡi lượn sóng như dòng nước chảy. Tính mít ướt.
  fam('sword', {
    name: 'Kiếm Sóng Nước', short: 'Sóng Nước', nature: 'mít ướt', mat: WATER, warp: { t0: 8, L: 34, hook: 0.5, amp: 0.6 },
    wave: { t0: 9, amp: 2.3, per: 11.5 },
    spark: [[28, 0], [16, 0], [38, 0], [4, -6]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = P.A;
      rtassel(S, P, 5, 6);
      grow(S, P, [[12, -3.5, 0.4, -1], [24, 3.2, 0.5, 1], [30, -3.2, 0.6, -1], [18, 3.4, 0.3, 1]]);
      bladePart(S, P, [[6, 3.5, 3.5], [30, 3.2, 3.2], [36, 2.2, 2.2], [42, 0, 0]], { per: 5.8, amp: 0.85 }, (s) => {
        s.l(20, 0, 38, 0, 1, Dk(M)); s.l(22, 1.5, 32, 1.5, 1, SH); s.l(8, -2, 18, -2, 1, Lt(M));
        seed(s, P, 7, 22, 3, P.seed); core(s, P, 10, 38, -0.5);
        engrave(s, P, [[24, -1.5], [34, -1]]);
      });
      // chắn tay cuộn sóng: một đầu vểnh lên, một đầu cụp xuống
      S.part((s) => { s.g([[3, -6], [3, 6], [5.5, 6], [5.5, -6]], A); s.box(6.5, -6.5, 2, 3, A); s.box(2, 6.5, 2, 3, A); if (P.rar === 0) s.in(() => { s.box(4, 0, 2, 2, Md(BLU)); }); });
      gem(S, P, 4, 0);
      grip(S, P, -3, 2, BLU, 2);
      S.part((s) => { s.e(-5, 0, 1.6, 1.6, A); s.p(-7, 0, Md(A)); });
      motes(S, P, [[16, -9], [43, 3], [27, -9], [31, 9], [37, -6], [19, 9]]);
    },
    face: function (F, P) {
      F.eye(15, 0, { brow: 'sad', low: 1, look: [0, 1] });
      if (P.st >= 3) F.eye(23.5, 0, { w: 3, h: 3, look: [0, 1] });
      F.mouth(9.5, 0, 'frown', 'open');
      // giọt nước mắt
      if (F.mood !== 'attack' && !F.blink) { F.at(15, 0); const d = Math.floor((F.t * 2 + P.seed) % 3); F.r(3, 3 + d, 1, 2, '#9fdcff'); }
      F.zzz(17, 4);
    },
  });

  // Cánh cung: pts = [[t, q, w], ...] xếp từ trên xuống, w là nửa bề dày. Mép ngoài (phía t dương) biến hình theo hệ.
  function limb(P, pts, o) {
    // biên dạng tính theo chiều dài dọc cánh cung, rồi đắp ra hai bên theo pháp tuyến để cánh dày đều
    const n = pts.length, L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const prof = pts.map((p, i) => [L[i], p[2], p[2]]);
    const E = edges(prof, P, Object.assign({ flip: true, notip: true, rev: true, per: 6, amp: 0.75 }, o || {}));
    const dir = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
    const map = (sv, d) => {
      let i = 0; while (i < n - 2 && sv > L[i + 1]) i++;
      const f = Math.max(0, Math.min(1, (sv - L[i]) / (L[i + 1] - L[i] || 1))), a = pts[i], b = pts[i + 1], d0 = dir(i), d1 = dir(i + 1);
      const dt = d0[0] + (d1[0] - d0[0]) * f, dq = d0[1] + (d1[1] - d0[1]) * f;
      return [a[0] + (b[0] - a[0]) * f + dq * d, a[1] + (b[1] - a[1]) * f - dt * d];
    };
    return E.top.map((p) => map(p[0], p[1])).concat(E.bot.slice().reverse().map((p) => map(p[0], p[1])));
  }
  // Đường cong chữ D của cánh cung: cao 2H, đầu cung ở t0, bụng cung ở t1, nửa bề dày w0 ở đầu và w1 ở giữa.
  function dcurve(H, t0, t1, w0, w1, e, n) {
    const out = []; n = n || 14;
    for (let i = 0; i <= n; i++) { const q = -H + (2 * H * i) / n, u = Math.sqrt(Math.max(0, 1 - (q / H) * (q / H))); out.push([t0 + (t1 - t0) * Math.pow(u, e || 0.8), q, w0 + (w1 - w0) * u]); }
    return out;
  }
  function limbAt(pts, q) {
    if (q <= pts[0][1]) return [pts[0][0], pts[0][2]];
    for (let i = 0; i + 1 < pts.length; i++) if (q <= pts[i + 1][1]) { const a = pts[i], b = pts[i + 1], f = (q - a[1]) / (b[1] - a[1] || 1); return [a[0] + (b[0] - a[0]) * f, a[2] + (b[2] - a[2]) * f]; }
    const l = pts[pts.length - 1]; return [l[0], l[2]];
  }
  // Dấu hệ trên cánh cung (gọi trong S.in): Mầm thì vết than, rêu, sương; từ Thành hình thì lõi lửa, đốm nọc, vết băng.
  function limbMarks(S, P, pts, q0, q1) {
    if (!P.el) return;
    const E = P.E, st = P.st;
    if (st === 1) {
      if (P.fire) { for (let q = q0; q <= q1; q += 1) { const c = limbAt(pts, q); S.p(c[0] + (Math.round(q / 3) % 2 ? 0.7 : -0.7), q, Math.round(q) % 4 === 0 ? E.B[2] : E.B[1]); } }
      else for (let i = 0; i < 4; i++) {
        const q = q0 + ((q1 - q0) * (i + 0.3)) / 4, ice = P.ice;
        for (let d = 0; d < 3; d++) { const c = limbAt(pts, q + d); S.p(c[0] + c[1], q + d, ice ? '#ffffff' : E.B[1]); S.p(c[0] + c[1] - 1, q + d, d === 1 ? (ice ? '#dff4ff' : E.B[2]) : (ice ? E.B[1] : E.B[0])); }
      }
    } else {
      for (let q = q0; q <= q1; q += 1) {
        const c = limbAt(pts, q), k = Math.round(q - q0);
        if (P.fire) { if (k % 7 < 5) S.p(c[0], q, k % 7 === 2 ? E.hot : E.B[2]); }
        else if (P.poison) { if (k % 5 === 0) S.p(c[0] - 0.5, q, E.B[0]); if (k % 5 === 2) S.p(c[0] + 0.6, q, E.B[2]); }
        else if (k % 6 < 2) S.p(c[0] + (k % 6 ? 0.6 : -0.4), q, SH);
      }
    }
  }
  // thân cánh cung thành một lớp; inner(s) vẽ thêm nét bên trong
  function limbPart(S, P, pts, o, inner) {
    o = o || {};
    S.part({ ol: P.ol, rim: true }, (s) => {
      s.g(limb(P, pts, o), o.mat || P.M);
      s.in(() => { limbMarks(s, P, pts, o.q0 == null ? pts[0][1] + 2 : o.q0, o.q1 == null ? pts[pts.length - 1][1] - 2 : o.q1); if (inner) inner(s); });
    });
  }
  const MOON = ['#b89a3e', '#f2df8a', '#fffbe0'];
  const HIDE = ['#4a3a34', '#7a6458', '#b09a88'];

  // 1. Nỏ Thần: nỏ có báng gỗ, cánh nỏ bắt ngang, lẫy là móng rùa thần, đầu nỏ bọc đồng hình đầu rùa. Tính dữ.
  fam('bow', {
    name: 'Nỏ Thần', short: 'Nỏ Thần', nature: 'dữ dằn', mat: WD2, warp: { bow: true, f: 0.3, ph: 0.4, amp: 0.45 },
    spark: [[11, -2], [8, -12], [8, 12], [-8, 1]],
    str: function (P) { return bowStr([3.5, -17.5], [3.5, 17.5], [3.5, 0], { draw: 8, tip: 18 }); },
    build: function (S, P) {
      const st = P.st, M = P.M, A = st >= 2 ? P.A : BRZ;
      const pts = dcurve(18, 3.5, 10, 0.9, 2.1, 0.7);
      rtassel(S, P, -9, 3);
      grow(S, P, [[10.5, -9, 1, -0.5], [10.5, 9, 1, 0.5], [8, -15, 1, -0.7], [8, 15, 1, 0.7]]);
      limbPart(S, P, pts, {}, (s) => { engrave(s, P, [[8, -12], [9.5, -6]]); });
      // báng nỏ
      S.part({ ol: st >= 2 ? P.ol : INK }, (s) => {
        const W = st >= 2 ? M : WD;
        s.g([[-12, -1], [-12, 4.5], [-7, 3], [8, 2.5], [8, -2.5], [-7, -2.5]], W);
        s.in(() => { s.l(-6, -2, 7, -2, 1, Lt(W)); s.l(-11, 2, -8, 1.5, 1, Dk(W)); if (P.rar >= 1) { s.l(-3, -3, -3, 3, 2, Md(P.R.P)); } });
      });
      // lẫy móng rùa
      S.part((s) => { s.g([[-6, 2.5], [-2.5, 2.5], [-5.5, 7.5]], BONE); });
      // đầu rùa thần bọc đồng
      S.part({ rim: true }, (s) => {
        s.g([[6.5, -4.5], [12, -5], [15.5, -2.5], [15.5, 1.5], [13, 4], [6.5, 4]], A);
        s.in(() => { s.l(8, -4, 12, -4.5, 1, Lt(A)); s.l(11, 1.5, 15, 1.5, 1, INK); s.p(14.5, -1.5, INK); s.box(12.5, 2.8, 1, 2, SH); });
      });
      gem(S, P, 8, 2);
      motes(S, P, [[14, -10], [-10, -6], [14, 10], [1, -8], [12, -16], [0, 9]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = BRZ[0]; F.skin = BRZ[1]; }
      F.eye(10.5, -1.5, { w: 3, h: 3, brow: 'angry', look: [1, 0] });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) { F.eye(9, -9.5, { w: 3, h: 3, pup: 'dot' }); F.eye(9, 9.5, { w: 3, h: 3, pup: 'dot' }); }
      if (F.mood === 'attack') { F.at(13, 1.5); F.r(-2, 0, 5, 2, '#5a1014'); F.r(1, 0, 1, 1, SH); }
      F.zzz(10, -5);
    },
  });

  // 2. Cung Sừng Trâu: hai chiếc sừng trâu chắp lại, giữa là mặt trâu đeo khoen mũi. Tính lì.
  fam('bow', {
    name: 'Cung Sừng Trâu', short: 'Sừng Trâu', nature: 'lì lợm', mat: HORN, warp: { bow: true, f: 0.3, ph: 0.3, amp: 0.5, fade: true },
    spark: [[4, 0], [0, -11], [0, 11], [-6, -17]],
    str: function (P) { return bowStr([-7.5, -18], [-7.5, 18], [-7.5, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M, HD = st >= 2 ? P.E.B2 : HIDE;
      const pts = dcurve(18.5, -7.5, 3, 0.7, 3.2, 0.75);
      rtassel(S, P, 0, 7);
      grow(S, P, [[2, -9, 1, -0.5], [2, 9, 1, 0.5], [-3, -14, 1, -0.7], [-3, 14, 1, 0.7]]);
      limbPart(S, P, pts, { q0: -16, q1: 16 }, (s) => {
        for (const q of [-14, -11, 11, 14]) { const c = limbAt(pts, q); s.l(c[0] - c[1] - 1, q, c[0] + c[1] + 1, q + (q < 0 ? 1.5 : -1.5), 1, Dk(M)); }
        if (st < 2) { s.l(-7, -18, -4, -17, 2, Md(BONE)); s.l(-7, 18, -4, 17, 2, Md(BONE)); }
        engrave(s, P, [[-1.5, -9], [-4.5, -13]]);
      });
      // tai trâu
      S.part({ ol: P.ol }, (s) => { s.g([[1, -5], [-3, -7], [-1, -3.5]], HD); s.g([[7, -5], [10.5, -7], [9, -3.5]], HD); });
      // mặt trâu
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.e(4, 0, 4.6, 5.6, HD);
        s.in(() => { s.g([[1.5, 2], [6.5, 2], [7.5, 5.5], [0.5, 5.5]], st >= 2 ? Lt(HD) : '#c9a59a'); s.p(2.5, 3.5, INK); s.p(5.5, 3.5, INK); s.l(1, -5, 7, -5, 1, Lt(HD)); });
      });
      // khoen mũi
      S.part((s) => { const R = P.rar >= 1 ? P.R.P : GOLD; s.box(4, 6.8, 3, 3, R); s.in(() => { s.box(4, 6.5, 1, 1, 0); }); });
      gem(S, P, 4, -4, 2);
      motes(S, P, [[9, -11], [-10, -6], [9, 11], [10, 0], [2, -18], [1, 18]]);
    },
    face: function (F, P) {
      F.eye(2, -1, { bead: true, brow: 'flat' }); F.eye(6.5, -1, { bead: true, brow: 'flat' });
      if (P.st >= 3) F.eye(4, -4.5, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      if (F.mood === 'attack') { F.at(4, 4); F.r(-3, -3, 1, 2, SH); F.r(3, -3, 1, 2, SH); } // phì hơi mũi
      F.zzz(6, -5);
    },
  });

  // 3. Cung Tre: cành tre ngà uốn cong, có đốt, đầu cung còn lá, tay nắm quấn rơm. Tính hiền.
  fam('bow', {
    name: 'Cung Tre', short: 'Cung Tre', nature: 'hiền lành', mat: BAM, warp: { bow: true, f: 0.35, ph: 0.9, amp: 0.6, fade: true },
    spark: [[4, 0], [0, -11], [0, 11], [-6, -17]],
    str: function (P) { return bowStr([-7, -17], [-7, 17], [-7, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M, LF = sec(P, BAMG);
      const pts = dcurve(17.5, -7, 3.5, 1.1, 2.1, 0.8);
      rtassel(S, P, 3, 5);
      grow(S, P, [[3, -8, 1, -0.5], [3, 8, 1, 0.5], [-1, -14, 1, -0.7], [-1, 14, 1, 0.7]]);
      // lá tre ở hai đầu cung
      if (P.ice && st >= 2) { crystal(S, -6, -16.5, 0.4, -1, 5.5, 3, true); crystal(S, -6.5, -16.5, -0.7, -1, 4.5, 2.6); crystal(S, -6, 16.5, 0.4, 1, 5, 3, true); }
      if (!(P.ice && st >= 2)) S.part({ ol: st >= 2 ? P.ol : BAMG[0] }, (s) => { s.g([[-6, -17], [-2, -20.5], [1.5, -20], [-2.5, -17.5]], LF); s.g([[-6.5, -17], [-9, -21.5], [-10.5, -18.5]], LF); s.g([[-6, 17], [-2.5, 19.5], [0.5, 18.5], [-3, 16.5]], LF); });
      limbPart(S, P, pts, {}, (s) => {
        for (const q of [-14.5, -9.5, 9.5, 14.5]) { const c = limbAt(pts, q); s.l(c[0] - c[1] - 1, q, c[0] + c[1] + 1, q, 1, Dk(M)); s.l(c[0] - c[1] - 1, q + 1, c[0] + c[1] + 1, q + 1, 1, Lt(M)); }
        engrave(s, P, [[1, -9], [-1.5, -12]]);
      });
      // tay nắm quấn rơm
      S.part({ rim: true }, (s) => {
        const W = st >= 2 ? P.A : STRAW;
        s.g([[0, -5], [7, -5], [8.5, -3], [8.5, 4], [7, 6], [0, 6], [-1, 4], [-1, -3]], W);
        s.in(() => { s.l(-1, -5, 8, -5, 1, Dk(W)); s.l(-1, 6, 8, 6, 1, Dk(W)); if (P.rar >= 1) { s.l(-1, -4, 8.5, -4, 1, Md(P.R.P)); s.l(-1, 5, 8.5, 5, 1, Md(P.R.P)); } });
      });
      gem(S, P, 3.5, -8, 2);
      motes(S, P, [[9, -10], [-10, -6], [9, 10], [11, 0], [2, -19], [1, 19]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = STRAW[0]; F.skin = STRAW[1]; } else { F.lid = P.A[0]; F.skin = P.A[1]; }
      F.eye(3.5, -1.5, { w: 5, h: 3, pup: 'sq', hl: true });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) { F.eye(2, -9.5, { w: 3, h: 3 }); }
      F.mouth(3.5, 3, 'smile', 'open');
      F.blush(0.5, 1.5); F.blush(7, 1.5);
      F.zzz(6, -5);
    },
  });

  // 4. Ná Thun: chạc cây chữ Y buộc dây thun, bắn sỏi. Tính láu cá.
  fam('bow', {
    name: 'Ná Thun', short: 'Ná Thun', nature: 'láu cá', mat: WD2, warp: { bow: true, f: 0.3, ph: 1.2, amp: 0.5, fade: true },
    spark: [[0, -3], [-4.5, -15], [5.5, -15], [0, 12]],
    str: function (P) { return bowStr([-5, -17], [5.5, -17], [0.5, -17], { draw: 11, arrow: false, stone: true, col: '#d2362e', sq: 0 }); },
    build: function (S, P) {
      const st = P.st, M = P.M;
      rtassel(S, P, 0, 14);
      grow(S, P, [[6.5, -11, 1, -0.4], [-6, -11, -1, -0.4], [2, 8, 1, 0.3], [-2, 6, -1, 0.3]]);
      // cán
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.g([[-2, -2], [2, -2], [1.7, 16], [-1.7, 16]], M);
        s.in(() => { s.l(-1, 2, -1, 14, 1, Lt(M)); for (const q of [8, 10.5, 13]) s.l(-2, q, 2, q, 1, Dk(M)); if (P.rar >= 1) s.l(-2, 9.2, 2, 9.2, 2, Md(P.R.P)); });
      });
      // hai nhánh chạc
      S.part({ ol: P.ol, rim: true }, (s) => {
        const pa = [[-6.5, -17, 1.5], [-6.5, -11, 1.7], [-5, -7, 2], [-2.5, -4, 2.2]], pb = [[5.5, -17, 1.5], [5.5, -11, 1.7], [4.5, -7, 2], [2.5, -4, 2.2]];
        s.g(limb(P, pa, { flip: false, amp: 0.6 }), M); s.g(limb(P, pb, { amp: 0.6 }), M);
        s.e(0, -3, 5, 5, M);
        s.in(() => { s.l(-5.5, -16, -5.5, -9, 1, Lt(M)); s.l(4.5, -16, 4.5, -9, 1, Lt(M)); limbMarks(s, P, pb, -15, -6); limbMarks(s, P, pa, -15, -6); engrave(s, P, [[-3.5, -6], [-0.5, -8], [3, -6]]); });
      });
      // dây thun buộc đầu chạc
      S.part({ ol: RED[0] }, (s) => { s.l(-7.5, -15.5, -4, -15.5, 2, Md(sec(P, RED))); s.l(4, -15.5, 7.5, -15.5, 2, Md(sec(P, RED))); });
      gem(S, P, 0, 3, 1);
      motes(S, P, [[10, -12], [-10, -10], [5, 8], [0, -20], [-5, 5], [9, -2]]);
    },
    face: function (F, P) {
      // một mắt mở, một mắt nháy
      F.eye(-2, -4, { w: 3, h: 3, look: [1, 0], lid: 0 });
      F.at(2.5, -4);
      if (F.mood === 'attack') F.eye(2.5, -4, { w: 3, h: 3 });
      else { F.r(-1, -1, 1, 1, INK); F.r(0, 0, 2, 1, INK); F.r(-1, 1, 1, 1, INK); }
      if (P.st >= 3) F.eye(0, -8, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(0.5, -0.5, 'tongue', 'open');
      F.zzz(3, -8);
    },
  });

  // 5. Cung Cánh Cò: hai cánh cung là đôi cánh trắng đầu lông đen, giữa là đầu cò mỏ dài. Tính điệu.
  fam('bow', {
    name: 'Cung Cánh Cò', short: 'Cánh Cò', nature: 'điệu đà', mat: WHT, warp: { bow: true, f: 0.3, ph: 0.2, amp: 0.5, fade: true },
    spark: [[4, 0], [1, -11], [1, 11], [-5, -17]],
    str: function (P) { return bowStr([-7.5, -17.5], [-7.5, 17.5], [-7.5, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M, TIP = st >= 2 ? P.E.B2 : ['#17131c', '#3a3442', '#6a6474'], BK = st >= 2 ? P.E.B2 : ORG;
      const pts = dcurve(18, -7.5, 2, 1, 2.6, 0.8);
      rtassel(S, P, 2, 6);
      grow(S, P, [[4, -7, 1, -0.5], [4, 7, 1, 0.5], [0, -13, 1, -0.7], [0, 13, 1, 0.7]]);
      // lông cánh xòe ra ngoài
      if (!(P.fire && st >= 2)) for (const sg of [-1, 1]) {
        S.part({ ol: P.ol }, (s) => { for (const q of [6, 9.5]) { const c = limbAt(pts, sg * q); s.g([[c[0], sg * (q - 2.5)], [c[0] + 7.5, sg * (q + 1.5)], [c[0] + 1, sg * (q + 2)]], M); } });
        S.part({ ol: st >= 2 ? P.ol : INK }, (s) => { for (const q of [12.5, 15.5]) { const c = limbAt(pts, sg * q); s.g([[c[0], sg * (q - 2.5)], [c[0] + 7, sg * (q + 1.5)], [c[0] + 0.5, sg * (q + 2)]], TIP); } });
      }
      limbPart(S, P, pts, {}, (s) => { engrave(s, P, [[-0.5, -9], [-3.5, -13]]); });
      // mỏ cò
      S.part({ ol: P.ol }, (s) => { s.g([[7, -2], [16, 0.5], [7, 2.5]], BK); s.in(() => { s.l(8, 0.5, 14, 0.5, 1, Dk(BK)); }); });
      // đầu cò có chỏm đỏ
      S.part({ ol: P.ol, rim: true }, (s) => { s.e(4, 0, 4.4, 4.4, M); s.in(() => { s.g([[1, -4.5], [6, -4.5], [5, -2.5], [2, -3]], st >= 2 ? Lt(P.E.B2) : Md(RED)); }); });
      S.part({ ol: st >= 2 ? P.ol : RED[0] }, (s) => { s.l(1, -5, -1.5, -7.5, 1, Md(sec(P, RED))); s.l(3, -5, 2.5, -8, 1, Md(sec(P, RED))); });
      gem(S, P, 2.5, 6.5, 1);
      motes(S, P, [[10, -12], [-10, -6], [10, 12], [13, -4], [2, -20], [2, 20]]);
    },
    face: function (F, P) {
      F.eye(4.5, -0.5, { w: 3, h: 3, look: [1, 0], hl: true });
      // lông mi cong
      if (!F.shut) { F.at(4.5, -0.5); F.r(-3, -2, 1, 1, INK); F.r(-4, -3, 1, 1, INK); }
      if (P.st >= 3) F.eye(0, -9.5, { w: 3, h: 3, pup: 'dot' });
      F.blush(4.5, 3);
      if (F.mood === 'attack') { F.at(11, 1.5); F.r(-3, 0, 6, 1, '#5a1014'); }
      F.zzz(6, -5);
    },
  });

  // 6. Cung Trăng Khuyết: vầng trăng lưỡi liềm béo, treo một ngôi sao. Tính ngái ngủ.
  fam('bow', {
    name: 'Cung Trăng Khuyết', short: 'Trăng Khuyết', nature: 'ngái ngủ', mat: MOON, warp: { bow: true, f: 0.25, ph: 0.2, amp: 0.45, fade: true },
    spark: [[4, 0], [1, -11], [1, 11], [-5, -17]],
    str: function (P) { return bowStr([-6.5, -17.5], [-6.5, 17.5], [-6.5, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M;
      const pts = dcurve(18, -6.5, 3.3, 0.5, 4.8, 1);
      grow(S, P, [[6, -8, 1, -0.5], [6, 8, 1, 0.5], [1, -14, 1, -0.7], [1, 14, 1, 0.7]]);
      limbPart(S, P, pts, { amp: 0.9 }, (s) => {
        // lỗ trũng trên mặt trăng
        s.e(1, -9.5, 1.2, 1.2, Dk(M)); s.e(2.5, 9, 1.5, 1.5, Dk(M)); s.p(-2, 13.5, Dk(M)); s.p(5.5, 5.5, Dk(M));
        engrave(s, P, [[5.5, -6], [3, -11], [0, -14]]);
      });
      // ngôi sao treo ở đầu cung dưới
      S.nomeasure = true;
      S.part({ ol: false }, (s) => { s.l(-7, 18, -7, 22, 1, STRING); });
      S.part((s) => { const SC = P.rar >= 1 ? P.R.P : st >= 2 ? P.E.B2 : GOLD; s.box(-7, 24, 5, 1, SC); s.box(-7, 24, 1, 5, SC); s.box(-7, 24, 3, 3, SC); s.in(() => { s.box(-7, 24, 1, 1, Lt(SC)); }); });
      S.nomeasure = false;
      gem(S, P, 6, -4.5, 2);
      motes(S, P, [[11, -11], [-10, -6], [11, 11], [12, 0], [3, -20], [3, 20]]);
    },
    face: function (F, P) {
      F.eye(4, -1.5, { lid: 3, look: [0, 1] });
      if (P.st >= 3) F.eye(1, -9.5, { w: 3, h: 3, lid: 1, look: [0, 1] });
      F.mouth(4, 4, 'tiny', 'open');
      F.blush(7, 2.5);
      F.zzz(7, -6);
    },
  });

  // 7. Cung Đàn Bầu: thân là hộp đàn dài, cần đàn cong vút phía trên, quả bầu biết hát. Tính mơ màng.
  fam('bow', {
    name: 'Cung Đàn Bầu', short: 'Đàn Bầu', nature: 'mơ màng', mat: WD2, warp: { bow: true, f: 0.3, ph: 0.8, amp: 0.45, fade: true },
    spark: [[3.5, 6], [3.5, -8], [-4, -19], [3.5, 15]],
    str: function (P) { return bowStr([-6.5, -17.5], [-1, 17.5], [-4, 0], { tip: 15 }); },
    build: function (S, P) {
      const st = P.st, M = P.M, RD = st >= 2 ? P.E.B2 : HORN, GD = st >= 2 ? P.E.B2 : GOURD;
      const pts = [[2, -5, 2.4], [3.2, 0, 2.7], [3.2, 12, 2.7], [2.5, 18.5, 2.2]];
      rtassel(S, P, 7, 15);
      grow(S, P, [[6.5, 6, 1, -0.3], [6.5, 12, 1, 0.3], [5, -14, 1, -0.6], [-1, -19.5, -0.3, -1]]);
      // cần đàn cong
      S.part({ ol: P.ol }, (s) => { s.pl([[3.5, -9], [4.5, -14], [2.5, -18], [-2, -20], [-6, -19], [-6.5, -16.5]], 2, RD); });
      // hộp đàn
      limbPart(S, P, pts, { q0: 1, q1: 16 }, (s) => {
        if (P.rar >= 1) { s.l(0, 1, 6.5, 1, 1, Md(P.R.P)); s.l(0, 13, 6.5, 13, 1, Md(P.R.P)); }
        s.l(1.5, 0, 1.5, 17, 1, Lt(M)); for (const q of [3, 7, 11, 15]) s.box(4, q, 1, 1, st >= 2 ? SH : '#eafcff');
        engrave(s, P, [[4.8, 2], [4.8, 16]]);
      });
      // trục lên dây
      S.part((s) => { s.l(5.5, 16, 8, 16, 2, st >= 2 ? P.A : GOLD); s.l(-1.5, 17.5, 0.5, 17.5, 1, st >= 2 ? P.A : GOLD); });
      // quả bầu
      S.part({ ol: P.ol, rim: true }, (s) => { s.e(3.5, -6.5, 4.6, 4.8, GD); s.in(() => { s.l(6, -9, 7, -6, 1, Lt(GD)); s.e(1, -3.5, 2, 1.5, Dk(GD)); }); });
      S.part((s) => { s.l(0, -11, 7, -11, 1, Md(sec(P, RED))); });
      gem(S, P, 3.2, 9, 2);
      motes(S, P, [[11, -12], [-10, -6], [10, 10], [10, -2], [1, -23], [-3, 12]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = GOURD[0]; F.skin = GOURD[1]; } else { F.lid = P.E.B2[0]; F.skin = P.E.B2[1]; }
      F.eye(1.5, -7.5, { w: 3, h: 3, look: [1, -1], pup: 'sq' }); F.eye(6, -7.5, { w: 3, h: 3, look: [1, -1], pup: 'sq' });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) F.eye(3.2, 4, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(4, -4, 'o', 'open');
      // nốt nhạc bay ra khi hát
      if (F.mood === 'attack' || F.mood === 'idle' || F.mood === 'calm') { F.at(10, -10); const c = P.E ? P.E.glow : '#ffe9a0'; F.r(0, -3, 1, 4, c); F.r(-1, 0, 2, 2, c); F.r(1, -3, 2, 1, c); }
      F.zzz(7, -11);
    },
  });

  // 8. Cung Xương Cá: bộ xương cá uốn cong, đầu lâu cá ở trên, xương sườn chĩa ra. Tính ngơ ngác.
  fam('bow', {
    name: 'Cung Xương Cá', short: 'Xương Cá', nature: 'ngơ ngác', mat: BONE, warp: { bow: true, f: 0.4, ph: 0.6, amp: 0.5, fade: true },
    spark: [[4, 0], [1, -8], [1, 9], [-5, -16]],
    str: function (P) { return bowStr([-7, -12.5], [-6, 17], [-6.5, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M;
      const pts = [[-5, -13, 1.2], [-0.5, -10.5, 1.3], [2.5, -6, 1.5], [3.8, 0, 1.6], [3, 6, 1.5], [0.5, 11.5, 1.3], [-4, 15.5, 1.1]];
      rtassel(S, P, 3.5, 2);
      // xương sườn: theo hệ thì thành lưỡi lửa, gai độc, băng nhọn
      const ribs = [-9, -5.5, -2, 2, 5.5, 9, 12.5];
      for (let i = 0; i < ribs.length; i++) {
        const q = ribs[i], c = limbAt(pts, q), len = 4.5 - Math.abs(q - 1) * 0.16 + (st >= 3 ? 1 : 0), big = st >= 2 && (st >= 3 || i % 2 === 0);
        if (P.fire && big) flame(S, c[0] + 1, q, 1, 0.25, len + 2, 3, -0.4);
        else if (P.ice && big) crystal(S, c[0] + 1, q, 1, 0.3, len + 1.5, 2.8, i % 2 === 1);
        else if (P.poison && big) thorn(S, c[0] + 1, q, 1, 0.5, len + 1, 2.4);
        else S.part({ ol: P.ol }, (s) => { s.l(c[0] + 1, q, c[0] + len, q + 1.5, 1, M); });
        S.part({ ol: P.ol }, (s) => { s.l(c[0] - 1, q, c[0] - 3.2, q + 1.2, 1, M); });
      }
      if (st === 1) grow(S, P, [[4.5, -6, 1, -0.5]]);
      if (P.poison && st >= 2) { shroom(S, 4.5, 0.5, 1, -0.2, 2, 2.2); if (st >= 3) shroom(S, 1.5, 12, 1, 0.3, 2, 2); }
      limbPart(S, P, pts, { plain: true }, (s) => { for (const q of ribs) { const c = limbAt(pts, q + 1.7); s.p(c[0], q + 1.7, Dk(M)); } });
      // đuôi cá
      S.part({ ol: P.ol }, (s) => { s.l(-4, 15, -8, 18.5, 1, M); s.l(-4, 15, -3, 20, 1, M); s.l(-4, 15, -6, 20, 1, M); });
      // đầu lâu cá
      S.part({ ol: P.ol, rim: true }, (s) => {
        s.g([[-9.5, -13], [-9, -18], [-5.5, -21], [-1.5, -19], [0, -14.5], [-3.5, -11.5], [-7, -11.5]], M);
        s.in(() => { s.l(-9, -14, -5, -12, 1, Dk(M)); s.p(-8, -12.5, INK); s.p(-6, -12, INK); s.l(-2.5, -18, -1, -15, 1, Dk(M)); engrave(s, P, [[-7.5, -18], [-5, -19.5], [-2.5, -18.5]]); });
      });
      gem(S, P, 3.5, 0, 1);
      motes(S, P, [[10, -8], [-11, -4], [10, 8], [11, 0], [0, -23], [2, 18]]);
    },
    face: function (F, P) {
      // hốc mắt đen, con ngươi là đốm sáng
      F.at(-4.5, -16);
      const E = P.E, g = E && P.st >= 1 ? E.glow : SH;
      F.rd(-2, -2, 5, 5, P.st >= 3 && E ? E.ring3 : INK);
      if (P.st >= 3 && E) F.rd(-1, -1, 3, 3, INK);
      if (F.shut) { F.r(-1, 0, 3, 1, P.M[1]); }
      else if (F.mood === 'attack') { F.r(-1, -1, 3, 3, g); F.r(0, 0, 1, 1, INK); }
      else { const d = Math.floor((F.t * 0.7 + P.seed) % 3); F.r(d === 1 ? 0 : d === 2 ? 1 : -1, d === 2 ? 0 : -1, P.st >= 2 ? 2 : 1, P.st >= 2 ? 2 : 1, g); }
      if (F.mood === 'attack') { F.at(-7, -11); F.r(-1, 0, 4, 2, '#5a1014'); }
      F.zzz(-2, -20);
    },
  });

  // 9. Cung Đèn Ông Sao: cung tre mảnh, giữa là chiếc đèn ông sao Trung thu năm cánh. Tính hớn hở.
  fam('bow', {
    name: 'Cung Đèn Ông Sao', short: 'Đèn Ông Sao', nature: 'hớn hở', mat: BAM, warp: { bow: true, f: 0.3, ph: 0.5, amp: 0.45, fade: true },
    spark: [[4, 0], [4, -8], [10, 3], [-2, 3]],
    str: function (P) { return bowStr([-7, -17.5], [-7, 17.5], [-7, 0]); },
    build: function (S, P) {
      const st = P.st, M = P.M, RDc = st >= 2 ? P.E.B2 : RED, YL = st >= 2 ? P.A : GOLD;
      const pts = dcurve(18, -7, 1.5, 0.9, 1.6, 0.8);
      const cx = 4, R1 = 8.2 + (st >= 3 ? 0.8 : 0), R0 = 3.7;
      rtassel(S, P, 4, 6);
      // tua giấy ở hai đầu cung
      S.nomeasure = true;
      S.part({ ol: RDc[0] }, (s) => { s.l(-7, 18, -8.5, 21.5, 1, Md(RDc)); s.l(-7, 18, -5.5, 21.5, 1, Md(RDc)); s.l(-7, -18, -9, -20, 1, Md(RDc)); });
      S.nomeasure = false;
      limbPart(S, P, pts, { amp: 0.6 }, (s) => { engrave(s, P, [[-1, -10], [-3.5, -14]]); });
      // tia theo hệ tỏa ra từ khe giữa các cánh sao
      if (st >= 2) for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + ((i + 0.5) * Math.PI * 2) / 5, dt = Math.cos(a), dq = Math.sin(a), len = st >= 3 ? 6.5 : 4.5;
        if (dt < -0.3) continue;
        if (P.fire) flame(S, cx + dt * 3, dq * 3, dt, dq, len + 1, 3.2, dq < 0 ? -0.35 : 0.35);
        else if (P.ice) crystal(S, cx + dt * 3, dq * 3, dt, dq, len + 1.5, 3, i % 2 === 0);
        else thorn(S, cx + dt * 3, dq * 3, dt, dq, len, 2.6);
      } else if (st === 1) grow(S, P, [[cx + 3, -3.5, 0.8, -0.6]]);
      if (P.poison && st >= 3) { shroom(S, 0, -9, 1, -0.3, 2, 2.2); shroom(S, 0, 10, 1, 0.3, 2, 2); }
      // vòng tre quanh sao
      S.part({ ol: P.ol }, (s) => { const n = 22; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2; s.l(cx + Math.cos(a) * (R1 + 0.6), Math.sin(a) * (R1 + 0.6), cx + Math.cos(b) * (R1 + 0.6), Math.sin(b) * (R1 + 0.6), 1, YL); } });
      // ngôi sao năm cánh
      S.part({ ol: P.ol, rim: true }, (s) => {
        const star = [];
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R0 : R1; star.push([cx + Math.cos(a) * r, Math.sin(a) * r]); }
        s.g(star, st >= 2 ? M : RED);
        s.in(() => {
          const C = st >= 2 ? P.E.B : RED;
          for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * Math.PI * 2) / 5; s.l(cx + Math.cos(a) * 4.5, Math.sin(a) * 4.5, cx + Math.cos(a) * (R1 - 1), Math.sin(a) * (R1 - 1), 1, Lt(C)); }
          s.e(cx, 0, 4, 4, st >= 2 ? Lt(P.E.B) : Md(GOLD));
          if (P.st === 1) { s.p(cx - 2, -6, P.E.B[1]); s.p(cx + 5, 2.5, P.E.B[1]); s.p(cx - 5, 2, P.E.B[2]); s.p(cx + 1, 6.5, P.E.B[1]); s.p(cx + 2, -6.5, P.E.B[2]); }
        });
      });
      gem(S, P, cx, 6, 1);
      motes(S, P, [[14, -8], [-10, -8], [14, 8], [4, -12], [4, 12], [-9, 6]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = GOLD[0]; F.skin = GOLD[1]; } else { F.lid = P.E.B[1]; F.skin = P.E.B[2]; }
      F.eye(2, -1, { bead: true }); F.eye(6, -1, { bead: true });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) F.eye(4, -5.5, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(4, 1.5, 'smile', 'open');
      F.zzz(8, -8);
    },
  });

  // ======================= GIÁO =======================
  // Cán giáo: thanh gỗ dài từ t0 đến t1, có đai quấn chỗ tay cầm, bịt đầu cán; nhiễm Độc thì dây leo quấn quanh.
  function shaft(S, P, t0, t1, o) {
    o = o || {};
    const W = o.mat || WD, st = P.st, cap = st >= 2 ? P.A : (o.cap || GOLD), band = P.rar >= 1 ? P.R.P : (o.band || RED);
    S.part((s) => {
      s.l(t0, 0, t1, 0, o.w || 2, W);
      s.in(() => { for (let t = t0 + 2.5; t < t1; t += o.step || 5) { s.p(t, 0, Dk(W)); if (o.node) s.p(t, -1, Dk(W)); } });
    });
    S.part((s) => { s.l(t0 - 1, -1.5, t0 - 1, 1.5, 2, cap); });
    if (!o.noband) S.part({ ol: band[0] }, (s) => { s.l(-2.5, -1, -2.5, 1, 2, Md(band)); s.l(2.5, -1, 2.5, 1, 2, Md(band)); if (P.rar >= 3) s.l(0, -1, 0, 1, 2, Lt(band)); });
    if (P.poison && st >= 2) vine(S, [[5, 1.5], [8, -2], [11, 2], [14, -2], [17, 1.5]].slice(0, st >= 3 ? 5 : 3), [[8, -3], [14, -3]].slice(0, st >= 3 ? 2 : 1));
    if (P.ice && st >= 3) crystal(S, 9, 1, 0.3, 1, 4, 2.6);
    if (P.fire && st >= 3) flame(S, 9, -1, 0.4, -1, 4.5, 3);
  }
  // chùm ngù (tua ngắn xòe ra) dưới đầu giáo
  function tuft(S, P, t, w, col) {
    const C = sec(P, col || RED);
    S.part({ ol: C[0] }, (s) => { s.g([[t + 2.5, -1.5], [t + 2.5, 1.5], [t, w], [t - 1.5, w - 1], [t, 0], [t - 1.5, -w + 1], [t, -w]], C); });
  }
  const LAU = ['#b8a890', '#efe6d2', '#ffffff'];
  const SPW = { t0: 10, L: 30, hook: 0.3, amp: 0.7 };

  // 0. Giáo Tre Vót: cây tầm vông, khúc đầu to vót xéo nhọn hoắt. Tính lì.
  fam('spear', {
    name: 'Giáo Tre Vót', short: 'Tre Vót', nature: 'lì lợm', mat: BAM, warp: SPW,
    spark: [[30, 0], [20, 0], [38, -2], [8, 0]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 14, 2);
      grow(S, P, [[29.5, -3.6, 0.5, -1], [22, 3.6, 0.4, 1], [35, -3.4, 0.6, -1], [17.5, -3.5, 0.2, -1]]);
      if (st < 2) S.part({ ol: BAMG[0] }, (s) => { s.l(17, 3, 19, 6, 1, Md(BAMG)); s.g([[19, 5.5], [23, 6.5], [24.5, 8.5], [20.5, 8]], BAMG); s.g([[18, 6.5], [18, 10], [16, 11], [16.5, 8]], BAMG); });
      shaft(S, P, -19, 16, { mat: BAM, step: 7, node: true, cap: BAM, w: 3 });
      bladePart(S, P, [[15, 2, 2], [17, 3.8, 3.8], [32, 3.6, 3.6], [41, 3.6, -2.2]], { notip: true, per: 9, amp: 0.8 }, (s) => {
        for (const t of [17, 29.5]) { s.l(t, -6, t, 6, 1, Dk(M)); s.l(t + 1, -6, t + 1, 6, 1, Lt(M)); }
        s.l(19, -2.5, 27, -2.5, 1, Lt(M)); s.l(32, -2.5, 38, -2.5, 1, SH); s.l(33, 3, 40, -2, 1, Lt(M));
        seed(s, P, 18, 30, 3.2, P.seed); core(s, P, 19, 38, 2);
        engrave(s, P, [[31.5, 1], [36, 0]]);
      });
      gem(S, P, 15.5, 0);
      motes(S, P, [[24, -9], [43, 2], [32, -9], [30, 9], [38, -7], [14, 8]]);
    },
    face: function (F, P) {
      F.eye(24.5, 0, { brow: 'flat', lid: 1, look: [0, 0] });
      if (P.st >= 3) F.eye(33.5, 0, { w: 3, h: 3, brow: 'flat' });
      F.mouth(19.5, 0, 'flat', 'open');
      F.zzz(26, 4);
    },
  });

  // 1. Đinh Ba: ba ngạnh nhọn, bầu giữa là khuôn mặt, dưới có ngù đỏ. Tính dữ.
  fam('spear', {
    name: 'Đinh Ba', short: 'Đinh Ba', nature: 'dữ dằn', mat: STEEL, warp: SPW,
    spark: [[34, 0], [30, -8], [30, 8], [22, 0]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = st >= 2 ? P.A : BRZ;
      rtassel(S, P, 13, 2);
      tuft(S, P, 14, 4.5);
      shaft(S, P, -19, 17);
      // hai ngạnh bên
      for (const sg of [-1, 1]) {
        if (P.fire && st >= 2) flame(S, 31, sg * 8, 1, sg * 0.15, st >= 3 ? 9 : 6.5, 3.6, sg < 0 ? 0.3 : -0.3);
        else if (P.ice && st >= 2) crystal(S, 31, sg * 8, 1, sg * 0.1, st >= 3 ? 9 : 6.5, 3.6, sg > 0);
        S.part({ ol: P.ol, rim: true }, (s) => {
          s.pl([[20, sg * 3], [21.5, sg * 7.5], [25, sg * 8.5], [31, sg * 8]], 2, M);
          if (!((P.fire || P.ice) && st >= 2)) s.g([[30, sg * 6.5], [36.5 + (st >= 3 ? 1.5 : 0), sg * 8], [30, sg * 9.5]], M);
          if (P.poison && st >= 2) { s.g([[25, sg * 9], [27, sg * 12], [28.5, sg * 9]], M); if (st >= 3) s.g([[31, sg * 9], [33, sg * 11.5], [34, sg * 8.5]], M); }
        });
      }
      grow(S, P, [[30, -2.6, 0.4, -1], [30, 2.6, 0.4, 1], [24, -9.5, 0, -1], [24, 9.5, 0, 1]], { few: true });
      bladePart(S, P, [[24, 2.2, 2.2], [29, 3, 3], [35, 2, 2], [41, 0, 0]], { per: 5.5, amp: 0.7 }, (s) => {
        s.l(27, 0, 38, 0, 1, Dk(M)); s.l(29, 1.5, 34, 1, 1, SH);
        seed(s, P, 25, 34, 2.2, P.seed); core(s, P, 27, 38, -1);
      });
      // bầu giữa
      S.part({ rim: true }, (s) => { s.e(21, 0, 4.7, 4.9, A); s.in(() => { s.l(17.5, -3, 17.5, 3, 1, Dk(A)); engrave(s, P, [[16.8, -2.5], [16.8, 2.5]]); }); });
      gem(S, P, 17, 0, 1);
      motes(S, P, [[28, -13], [44, 2], [34, -12], [34, 12], [40, -6], [22, 12]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = BRZ[0]; F.skin = BRZ[1]; } else { F.lid = P.A[0]; F.skin = P.A[1]; }
      F.eye(22.5, 0, { w: 5, h: 3, brow: 'angry', pup: 'tall', look: [0, 0] });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) F.eye(30, 0, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(19.5, 0, 'fang', 'openfang');
      F.zzz(24, 5);
    },
  });

  // 2. Câu Liêm: mũi giáo kèm lưỡi móc cong quặp ra sau. Tính láu cá.
  fam('spear', {
    name: 'Câu Liêm', short: 'Câu Liêm', nature: 'láu cá', mat: STEEL, warp: SPW,
    spark: [[30, 0], [24, 10], [38, 0], [18, 12]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 14, -2);
      tuft(S, P, 15, 4);
      shaft(S, P, -19, 18);
      grow(S, P, [[27, -3.8, 0.4, -1], [26, 11, 0.6, 1], [32, -3, 0.6, -1], [19, 13.5, -0.6, 1]]);
      // lưỡi móc
      S.part({ ol: P.ol, rim: true }, (s) => {
        const k = st >= 3 ? 1.5 : 0;
        s.g([[23, 3], [27.5, 7], [27, 11.5 + k], [22, 14.5 + k], [15.5 - k, 13.5 + k], [19, 12], [22, 10], [22.5, 7], [20.5, 4]], M);
        s.in(() => { s.l(24, 6, 25.5, 11, 1, Lt(M)); s.l(21, 12.5, 17, 13, 1, Dk(M)); if (P.el && st >= 2) s.l(23.5, 8, 22, 12, 1, P.E.hot); if (st === 1) { s.p(23, 9, P.E.B[1]); s.p(20.5, 12.5, P.E.B[1]); s.p(25, 8, P.E.B[2]); } });
      });
      bladePart(S, P, [[20, 2, 2], [24.5, 4, 4], [31, 3.2, 3.2], [40, 0, 0]], { per: 6 }, (s) => {
        s.l(29, 0, 37, 0, 1, Dk(M)); s.l(30, 1.5, 35, 1, 1, SH);
        seed(s, P, 21, 32, 3, P.seed); core(s, P, 28, 37, -1.2);
        engrave(s, P, [[31, -1.5], [36, -0.8]]);
      });
      S.part((s) => { s.l(19, -2.5, 19, 2.5, 2, P.A); });
      gem(S, P, 19, 0);
      motes(S, P, [[28, -9], [43, 2], [34, -8], [30, 16], [38, -6], [16, 17]]);
    },
    face: function (F, P) {
      F.eye(26.5, 0, { lid: 1, low: 1, pup: 'tall', look: [1, 0] });
      if (P.st >= 3) F.eye(33, 0, { w: 3, h: 3, look: [1, 0] });
      F.mouth(22, 0, 'grin', 'openbig');
      F.zzz(28, 4);
    },
  });

  // 3. Mác: lưỡi dài bản to, một lưỡi, cong ngả ra sau, sống có mấu. Tính kiêu.
  fam('spear', {
    name: 'Mác', short: 'Mác', nature: 'kiêu ngạo', mat: STEEL, warp: SPW,
    arc: { t0: 23, R: 38, dir: -1 },
    spark: [[30, 2], [24, 2], [38, 1], [26, -5]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 14, 2);
      tuft(S, P, 14.5, 4.5);
      shaft(S, P, -19, 18);
      grow(S, P, [[30, -3, 0.5, -1], [28, 5.6, 0.4, 1], [35, -2.6, 0.6, -1], [23, 5, 0, 1]]);
      // mấu trên sống
      if (!(P.fire && st >= 2)) S.part({ ol: P.ol }, (s) => { s.g([[23, -2.5], [25.5, -7 - st * 0.5], [27, -2.8]], P.ice && st >= 2 ? P.E.B2 : M); });
      bladePart(S, P, [[20, 1.8, 2], [23, 2.5, 5], [30, 3, 5.8], [37, 2.5, 4], [42.5, 0.6, 0.4]], { per: 6.5, tip: 0.8 }, (s) => {
        s.l(22, -0.5, 40, -1, 1, Dk(M)); s.l(25, 3.5, 36, 3, 1, SH); s.l(23, 4, 30, 4.8, 1, Lt(M));
        seed(s, P, 21, 32, 3, P.seed); core(s, P, 30, 40, 1);
        engrave(s, P, [[31, 1.5], [38, 1]]);
      });
      S.part((s) => { s.e(19, 0, 1.4, 3.6, P.A); });
      gem(S, P, 19, 0);
      motes(S, P, [[28, -10], [45, -4], [34, -10], [30, 9], [40, -9], [20, 9]]);
    },
    face: function (F, P) {
      F.eye(27.5, 1.2, { lid: 1 });
      if (P.st >= 3) F.eye(35, 1, { w: 3, h: 3 });
      F.mouth(22.8, 1.5, 'smirk', 'openfang');
      F.zzz(29, 5);
    },
  });

  // 4. Lao: cây lao phóng mảnh, mũi kim dài, đuôi gắn lông chim, hạt bầu ở cổ là khuôn mặt. Tính hớn hở.
  fam('spear', {
    name: 'Lao Phóng', short: 'Lao Phóng', nature: 'hớn hở', mat: STEEL, warp: SPW,
    spark: [[32, 0], [21, 0], [39, 0], [-15, 2]],
    build: function (S, P) {
      const M = P.M, st = P.st, FE = sec(P, RED), BD = st >= 2 ? P.E.B2 : GOURD;
      rtassel(S, P, 15, 2);
      // lông đuôi
      S.part({ ol: st >= 2 ? P.ol : RED[0] }, (s) => {
        for (const sg of [-1, 1]) { s.g([[-12, sg], [-14, sg * 4.5], [-20, sg * 5], [-18, sg]], FE); }
        s.in(() => { for (const sg of [-1, 1]) { s.l(-15, sg * 2, -18, sg * 4, 1, Lt(FE)); s.l(-13, sg * 3.5, -14, sg * 2, 1, SH); } });
      });
      shaft(S, P, -19, 18, { cap: STEEL });
      grow(S, P, [[26, -2, 0.4, -1], [30, 2, 0.5, 1], [17.5, -3.5, 0, -1], [17.5, 3.5, 0, 1]]);
      // dải lụa bay ở cổ lao
      S.nomeasure = true;
      S.part({ ol: FE[0] }, (s) => { s.pl([[16, 2], [14, 6], [15, 9], [12, 12]], 2, FE); });
      S.nomeasure = false;
      bladePart(S, P, [[23, 1.5, 1.5], [27, 2.6, 2.6], [41, 0, 0]], { per: 5, amp: 0.7 }, (s) => {
        s.l(26, 0, 38, 0, 1, Dk(M)); s.l(28, 1, 33, 0.8, 1, SH);
        seed(s, P, 24, 34, 1.8, P.seed); core(s, P, 27, 38, -0.8);
      });
      // hạt bầu ở cổ lao
      S.part({ ol: P.ol, rim: true }, (s) => { s.e(20.5, 0, 4, 4.6, BD); s.in(() => { s.l(22.5, 2.5, 20, 3.5, 1, Lt(BD)); engrave(s, P, [[17.3, -2], [17.3, 2]]); }); });
      gem(S, P, 24.5, 0);
      motes(S, P, [[26, -8], [44, 2], [34, -7], [32, 7], [39, -5], [16, -8]]);
    },
    face: function (F, P) {
      const lid = F.lid, skin = F.skin; if (P.st < 2) { F.lid = GOURD[0]; F.skin = GOURD[1]; } else { F.lid = P.E.B2[0]; F.skin = P.E.B2[1]; }
      F.eye(21.5, -2, { bead: true }); F.eye(21.5, 2.5, { bead: true });
      F.lid = lid; F.skin = skin;
      if (P.st >= 3) F.eye(29, 0, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(19, 0.5, 'smile', 'open');
      F.zzz(23, 5);
    },
  });

  // 5. Giáo Đồng: mũi giáo đồng hình lá bản rộng, có hai lỗ và hoa văn, như cụ già râu bạc. Tính nghiêm.
  fam('spear', {
    name: 'Giáo Đồng Đông Sơn', short: 'Giáo Đồng', nature: 'nghiêm nghị', mat: BRZ, warp: SPW,
    spark: [[32, 0], [26, -4], [38, 0], [26, 4]],
    build: function (S, P) {
      const M = P.M, st = P.st, A = st >= 2 ? P.A : BRZ;
      rtassel(S, P, 13, 2);
      shaft(S, P, -19, 16, { cap: BRZ });
      grow(S, P, [[30, -5.2, 0.5, -1], [31, 5, 0.5, 1], [35, -3, 0.6, -1], [24, 6, 0, 1]]);
      bladePart(S, P, [[20, 2, 2], [23, 5.8, 5.8], [28, 6.3, 6.3], [34, 3.6, 3.6], [41, 0, 0]], { per: 6 }, (s) => {
        s.l(21, 0, 39, 0, 2, Dk(M)); s.l(21, 1, 38, 1, 1, Lt(M)); s.l(31, 3.5, 34, 2.5, 1, SH);
        if (st < 2) { for (const p of [[32, -3], [35, 1.5], [24, 4.5]]) s.box(p[0], p[1], 2, 1, '#5fa58a'); }
        seed(s, P, 21, 32, 5, P.seed); core(s, P, 31, 38, -1.5);
        engrave(s, P, [[32, -3.5], [36, -1.5]]);
      });
      // ống tra cán có đai
      S.part((s) => { s.g([[15, -2], [21, -2.6], [21, 2.6], [15, 2]], A); s.in(() => { s.l(16.5, -3, 16.5, 3, 1, Dk(A)); s.l(19, -3, 19, 3, 1, Lt(A)); }); });
      gem(S, P, 18, 0);
      motes(S, P, [[28, -11], [44, 2], [34, -10], [32, 10], [39, -6], [22, 10]]);
    },
    face: function (F, P) {
      F.eye(28.5, -3.2, { w: 3, h: 3, brow: 'bushy', side: 1, look: [1, 0] }); F.eye(28.5, 3.2, { w: 3, h: 3, brow: 'bushy', side: -1, look: [-1, 0] });
      if (P.st >= 3) F.eye(35, 0, { w: 3, h: 3, look: [0, 0], pup: 'dot' });
      F.at(24.5, 0);
      if (F.mood === 'attack') F.b(MOUTHS.open, 0, 0); else F.r(-1, 0, 2, 1, INK);
      F.b(['WWW...WWW', 'WW.....WW'], 0, -1, { W: '#ffffff' });
      F.b(['.W.', 'WWW', '.W.'], 0, F.mood === 'attack' ? 4 : 2, { W: '#eeeaf2' });
      F.zzz(30, 6);
    },
  });

  // 6. Xà Mâu: lưỡi giáo uốn lượn như rắn bò, mũi chẻ đôi như lưỡi rắn. Tính nham hiểm.
  fam('spear', {
    name: 'Xà Mâu', short: 'Xà Mâu', nature: 'nham hiểm', mat: IRON, warp: SPW,
    wave: { t0: 18, amp: 2.1, per: 9 },
    spark: [[30, 0], [22, 0], [38, 0], [15, 5]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 10, 2);
      shaft(S, P, -19, 14);
      grow(S, P, [[25, -4, 0.4, -1], [30.5, 3.6, 0.5, 1], [36, -3, 0.6, -1], [20, 4, 0.2, 1]]);
      bladePart(S, P, [[16, 2, 2], [19.5, 4.3, 4.3], [30, 3, 3], [40, 2.3, 2.3], [45.5, 2.3, 2.3]], { notip: true, per: 5.2, amp: 0.7 }, (s) => {
        s.g([[46.5, -1.1], [40.5, 0], [46.5, 1.1]], 0); // mũi chẻ đôi
        s.l(27, 0, 36, 0, 1, Dk(M)); s.l(19, 2.5, 34, 2, 1, Lt(M));
        for (let t = 27; t < 40; t += 3) s.p(t, -1.8, Dk(M));
        seed(s, P, 17, 30, 3.4, P.seed); core(s, P, 28, 37, 1);
        engrave(s, P, [[29, -1.8], [35, -1.6]]);
      });
      // chắn hình hai đầu rắn ngóc
      S.part((s) => { s.l(15, -5, 15, 5, 2, P.A); s.box(17, -5.5, 2, 3, P.A); s.box(17, 5.5, 2, 3, P.A); s.in(() => { s.p(17.5, -5.5, INK); s.p(17.5, 5.5, INK); }); });
      gem(S, P, 15, 0);
      motes(S, P, [[25, -10], [46, 2], [34, -9], [31, 9], [40, -6], [20, 9]]);
    },
    face: function (F, P) {
      F.eye(23.5, 0, { pup: 'slit', lid: 1, low: 1, look: [0, 0], brow: 'angry' });
      if (P.st >= 3) F.eye(31.5, 0, { w: 3, h: 3, pup: 'slit', look: [0, 0] });
      F.mouth(18.5, 0.5, 'fork', 'openfang');
      F.zzz(25, 4);
    },
  });

  // 7. Mái Chèo: cây chèo gỗ bản dẹt của người chèo đò, đuôi cán có tay ngang. Tính ngơ ngác.
  fam('spear', {
    name: 'Mái Chèo', short: 'Mái Chèo', nature: 'ngơ ngác', mat: WD2, warp: SPW,
    spark: [[32, 0], [26, 0], [38, 0], [22, 0]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 11, 2);
      shaft(S, P, -18, 15, { cap: WD });
      S.part((s) => { s.l(-19.5, -4, -19.5, 4, 2, st >= 2 ? P.A : WD); });
      grow(S, P, [[30, -5, 0.5, -1], [32, 5, 0.5, 1], [24, -4.5, 0.2, -1], [36, 4.2, 0.6, 1]]);
      bladePart(S, P, [[13, 1.2, 1.2], [18, 2.6, 2.6], [22, 4.6, 4.6], [34, 5.2, 5.2], [38.5, 3.8, 3.8], [40.5, 1.6, 1.6]], { notip: true, per: 6.5 }, (s) => {
        s.l(15, 0, 38, 0, 1, Dk(M)); s.l(22, -3, 36, -3.5, 1, Lt(M)); s.l(24, 3, 30, 3.5, 1, Dk(M)); s.l(33, 3, 37, 2.5, 1, Dk(M));
        seed(s, P, 16, 30, 3.5, P.seed); core(s, P, 20, 26, 2);
        engrave(s, P, [[35, -2.5], [37.5, 0], [35, 2.5]]);
      });
      // dây buộc cọc chèo
      S.part({ ol: STRAW[0] }, (s) => { s.l(12, -1.5, 12, 1.5, 2, Md(st >= 2 ? P.A : STRAW)); });
      gem(S, P, 20, 0);
      motes(S, P, [[26, -10], [44, 2], [34, -9], [31, 10], [39, -7], [18, 8]]);
    },
    face: function (F, P) {
      F.eye(31, -2.5, { bead: true }); F.eye(31, 3, { bead: true });
      if (P.st >= 3) F.eye(36, 0, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(26.5, 0.5, 'o', 'open');
      F.zzz(33, 6);
    },
  });

  // 8. Cờ Lau: cây lau có bông trắng mềm rủ sang một bên, cờ tập trận thuở bé. Tính ngái ngủ.
  fam('spear', {
    name: 'Cờ Lau', short: 'Cờ Lau', nature: 'ngái ngủ', mat: LAU, warp: SPW,
    spark: [[30, 1], [24, 0], [37, 3], [12, -3]],
    build: function (S, P) {
      const M = P.M, st = P.st, LF = sec(P, BAMG);
      rtassel(S, P, 17, -2);
      // lá lau dài
      S.part({ ol: st >= 2 ? P.ol : BAMG[0] }, (s) => { s.g([[6, -1], [14, -5.5], [20, -9], [15, -4], [9, -1]], LF); s.g([[11, 1], [17, 4.5], [20, 8.5], [18, 4], [14, 1]], LF); });
      shaft(S, P, -19, 21, { mat: BAM, step: 8, node: true, cap: BAM });
      grow(S, P, [[30, -3.6, 0.5, -1], [32, 6, 0.4, 1], [36, -1.5, 0.6, -1], [24, 5, 0, 1]]);
      // các túm bông
      S.part({ ol: P.ol }, (s) => { s.e(27, 6, 2.6, 2.2, M); s.e(33, 6.5, 2.6, 2, M); s.e(38.5, 5.5, 2.2, 2, M); s.e(23, -3.6, 2, 1.6, M); });
      bladePart(S, P, [[19, 1, 1], [23, 3.6, 4.5], [30, 3.8, 5.8], [36, 2, 5.5], [41, -0.8, 4.6], [43, -2.5, 3.8]], { notip: true, per: 5.5, amp: 0.7 }, (s) => {
        for (let t = 22; t < 41; t += 3) { s.l(t, 4.5, t + 2, 2, 1, Dk(M)); }
        s.l(22, -2.5, 34, -2, 1, Lt(M));
        seed(s, P, 21, 32, 3, P.seed); core(s, P, 33, 40, 3);
        engrave(s, P, [[33, 0], [38, 2.5]]);
      });
      gem(S, P, 20, 0);
      motes(S, P, [[27, -9], [46, 3], [34, -8], [31, 11], [40, -4], [22, 9]]);
    },
    face: function (F, P) {
      F.eye(28, 0.5, { lid: 3, look: [0, 1] });
      if (P.st >= 3) F.eye(35.5, 2, { w: 3, h: 3, lid: 1, look: [0, 1] });
      F.mouth(23.2, 0.5, 'tiny', 'open');
      F.blush(25, 3.5);
      F.zzz(30, 5);
    },
  });

  // 9. Bút Lông: cây bút lông khổng lồ của thầy đồ, ngòi trắng chấm mực. Tính mơ màng.
  fam('spear', {
    name: 'Bút Lông', short: 'Bút Lông', nature: 'mơ màng', mat: WHT, warp: SPW,
    spark: [[30, 0], [20, 0], [38, 0], [-14, 2]],
    build: function (S, P) {
      const M = P.M, st = P.st, INKC = st >= 2 ? [P.E.ol, P.E.B[0], P.E.B[1]] : ['#17131c', '#2a2230', '#4a4458'];
      rtassel(S, P, -15, 2);
      // dây treo bút ở đuôi cán
      S.part({ ol: RED[0] }, (s) => { const C = Md(sec(P, RED)); s.pl([[-20, 0], [-23, -2], [-25, 0], [-23, 2], [-20, 0]], 1, C); });
      shaft(S, P, -19, 19, { mat: BAM, w: 3, step: 9, node: true, cap: BAM });
      grow(S, P, [[30, -3.6, 0.5, -1], [28, 4, 0.4, 1], [35, -2, 0.6, -1], [24, 4.2, 0, 1]]);
      bladePart(S, P, [[21.5, 2.8, 2.8], [26, 4.4, 4.4], [31, 3.8, 3.8], [36, 1.9, 1.9], [41, 0, 0]], { per: 6 }, (s) => {
        s.g([[34, -6], [48, -6], [48, 6], [34, 6], [35.5, 2], [34.5, 0], [35.5, -2]], INKC); // đầu ngòi chấm mực
        s.l(23, -2.5, 32, -2.5, 1, Lt(M)); s.l(23, 2.5, 31, 2.5, 1, Dk(M)); s.l(24, 0.5, 26, 0.5, 1, Dk(M));
        seed(s, P, 22, 32, 3, P.seed);
        engrave(s, P, [[30.5, -2], [32.5, 0], [30.5, 2]]);
      });
      // khâu bút
      S.part((s) => { const A = st >= 2 ? P.A : HORN; s.g([[18.5, -2.6], [22, -3.2], [22, 3.2], [18.5, 2.6]], A); s.in(() => { s.l(20, -3, 20, 3, 1, Lt(A)); }); });
      gem(S, P, 20.2, 0);
      // giọt mực rơi
      if (st < 2) { S.nomeasure = true; S.part({ fx: true }, (s) => { s.p(43, 1, '#2a2230'); }); S.nomeasure = false; }
      motes(S, P, [[27, -9], [44, 2], [34, -8], [31, 9], [39, -6], [22, 9]]);
    },
    face: function (F, P) {
      F.eye(28, 0, { look: [1, -1], hl: true });
      if (P.st >= 3) F.eye(34.5, 0, { w: 3, h: 3, look: [1, -1] });
      F.mouth(23.5, 0, 'o', 'open');
      F.zzz(30, 4);
    },
  });

  // @@CAC-DONG@@

  // ---------- dựng hình và bộ đệm ----------
  const clampI = (v, a, b) => Math.max(a, Math.min(b, v | 0));
  function params(o) {
    const type = FAM[o.type] ? o.type : 'sword';
    const list = FAM[type], fi = clampI(o.family || 0, 0, list.length - 1), F = list[fi];
    let st = clampI(o.stage || 0, 0, 3), el = ELP[o.branch] ? o.branch : null;
    if (!el) st = 0; if (st === 0) el = null;
    const rar = clampI(o.rarity || 0, 0, 3), E = el ? ELP[el] : null;
    const P = {
      type: type, fam: fi, F: F, el: el, st: st, rar: rar, E: E, R: RARITY[rar],
      base: F.mat, M: st >= 2 ? E.B : F.mat, ol: st >= 2 ? E.ol : INK,
      A: st >= 2 ? E.gd : GOLD, // màu chắn tay, đai
      k: [1, 1.04, 1.09, 1.16][st], ks: KS[type] * (F.ks || 1), seed: fi * 7 + TYPES.indexOf(type) * 31 + 3,
      fire: el === 'fire', poison: el === 'poison', ice: el === 'ice',
      warp: null, arc: F.arc || null, wave: F.wave || null,
    };
    if (el === 'poison' && F.warp) {
      const w = F.warp, a = [0, 0.7, 1.5, 2.3][st] * (w.amp == null ? 1 : w.amp);
      P.warp = w.bow ? { bow: true, amp: a, f: w.f || 0.3, ph: w.ph || 0.6, fade: w.fade } : { t0: w.t0, L: w.L, amp: a, f: w.f || 1.5, hook: (w.hook || 0) * st };
    }
    return P;
  }
  const KS = { sword: 0.88, bow: 0.9, spear: 0.88, hammer: 1 };
  const keyOf = (P) => P.type[1] + P.fam + (P.el ? P.el[0] : 'n') + P.st + P.rar;
  const cache = new Map();
  const CACHE_MAX = 600, RAD = 72, ASTEP = 5;
  function body(P, angQ) {
    const key = keyOf(P) + '|' + angQ;
    let b = cache.get(key);
    if (b) return b;
    const fr = new Frame(angQ, P), S = new Spr(RAD, fr);
    P.F.build(S, P);
    S.gild(P.rar);
    S.finish();
    b = S.toCanvas(); b.fr = fr;
    // chiều dài thân: dọc trục t (cung thì dọc cánh cung), cộng 2 điểm viền
    b.len = Math.round((P.type === 'bow' ? S.q1 - S.q0 : S.t1 - S.t0) + 3);
    if (cache.size >= CACHE_MAX) { let n = 0; for (const k of cache.keys()) { cache.delete(k); if (++n > CACHE_MAX / 4) break; } }
    cache.set(key, b);
    return b;
  }
  const qAng = (a) => { a = Math.round((a || 0) / ASTEP) * ASTEP; a = ((a % 360) + 360) % 360; return a; };

  // Vẽ vũ khí. (x0, y0): điểm cầm; ang: góc theo độ (0 là chĩa ra trước, âm là chĩa lên); pull: độ giương cung 0..1.
  function draw(c, opts, x0, y0, ang, pull) {
    const P = params(opts || {}), a = qAng(ang), b = body(P, a);
    const X = Math.round(x0), Y = Math.round(y0), isBow = P.type === 'bow';
    const mood = (opts && opts.mood) || 'idle', t = (opts && opts.t) || 0;
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(b.cv, X + b.dx, Y + b.dy);
    c.imageSmoothingEnabled = sm;
    const F = new Face(c, X, Y, b.fr, a, P, mood, t, isBow);
    if (isBow) bowString(c, P, b.fr, X, Y, Math.max(0, Math.min(1, pull || 0)));
    if (P.F.face) P.F.face(F, P);
    if (P.rar >= 3 && P.F.spark) twinkle(c, P, b.fr, X, Y, t);
  }
  // Ánh lấp lánh của bậc Vàng.
  function twinkle(c, P, fr, X, Y, t) {
    const sp = P.F.spark, i = Math.floor(t * 2.2 + P.seed) % (sp.length + 1);
    if (i >= sp.length) return;
    const a = fr.T(sp[i][0], sp[i][1]), x = X + Math.round(a[0]), y = Y + Math.round(a[1]);
    c.fillStyle = '#ffffff'; c.fillRect(x, y - 1, 1, 3); c.fillRect(x - 1, y, 3, 1);
    c.fillStyle = '#fff4b0'; c.fillRect(x - 2, y, 1, 1); c.fillRect(x + 2, y, 1, 1); c.fillRect(x, y - 2, 1, 1); c.fillRect(x, y + 2, 1, 1);
  }
  function pline(c, x0, y0, x1, y1, col) {
    c.fillStyle = col;
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
    for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (dx * i) / n), Math.round(y0 + (dy * i) / n), 1, 1);
  }
  // Dây cung và mũi tên (vẽ động theo độ giương).
  function bowString(c, P, fr, X, Y, pull) {
    const s = P.F.str ? P.F.str(P) : null; if (!s) return;
    const A = fr.T(s.a[0], s.a[1]), B = fr.T(s.b[0], s.b[1]);
    const mt = s.mid[0] - pull * (s.draw || 7), M = fr.T(mt, s.mid[1]);
    const col = s.col || STRING;
    if (pull <= 0.02) pline(c, X + A[0], Y + A[1], X + B[0], Y + B[1], col);
    else { pline(c, X + A[0], Y + A[1], X + M[0], Y + M[1], col); pline(c, X + M[0], Y + M[1], X + B[0], Y + B[1], col); }
    if (pull > 0.02 && s.arrow !== false) {
      const tipT = (s.tip || 13) - pull * 3, T1 = fr.T(tipT, s.mid[1]), E = P.E;
      pline(c, X + M[0], Y + M[1], X + T1[0], Y + T1[1], '#b78350');
      const hc = E ? E.B[1] : '#b4c0d4', hl = E ? E.B[2] : '#f4f8ff';
      const h0 = fr.T(tipT + 1, s.mid[1]), h1 = fr.T(tipT + 3, s.mid[1]), w0 = fr.T(tipT, s.mid[1] - 1.4), w1 = fr.T(tipT, s.mid[1] + 1.4);
      pline(c, X + w0[0], Y + w0[1], X + h1[0], Y + h1[1], hc); pline(c, X + w1[0], Y + w1[1], X + h1[0], Y + h1[1], hc);
      pline(c, X + h0[0], Y + h0[1], X + h1[0], Y + h1[1], hl);
      const f0 = fr.T(mt + 1, s.mid[1] - 1.2), f1 = fr.T(mt + 1, s.mid[1] + 1.2);
      c.fillStyle = '#d2362e'; c.fillRect(X + Math.round(f0[0]), Y + Math.round(f0[1]), 1, 1); c.fillRect(X + Math.round(f1[0]), Y + Math.round(f1[1]), 1, 1);
    }
  }

  // Góc đứng nghỉ của từng loại (để đo cỡ và vẽ ô đồ).
  const REST = { sword: -90, spear: -90, hammer: -90, bow: 0 };
  // Trả về len (chiều dài thân, không tính tua và hạt hiệu ứng), w, h và hộp bao tính từ điểm cầm khi đứng nghỉ.
  function size(opts) {
    const P = params(opts || {}), b = body(P, qAng(REST[P.type]));
    return { len: b.len, w: b.w, h: b.h, box: { x0: b.dx, y0: b.dy, x1: b.dx + b.w - 1, y1: b.dy + b.h - 1 } };
  }
  // Vẽ vũ khí vào ô đồ vuông cạnh size, tâm ô tại (x, y). Kiếm, giáo, búa nằm chéo; cung đứng thẳng.
  function icon(c, opts, x, y, sz) {
    const P = params(opts || {}), ang = P.type === 'bow' ? 0 : -45, b = body(P, qAng(ang));
    sz = sz || 24;
    const m = Math.max(b.w, b.h);
    let sc = sz / m; if (sc >= 1) sc = Math.max(1, Math.floor(sc));
    const o = Object.assign({}, opts, { mood: (opts && opts.mood) || 'idle' });
    c.save();
    c.translate(Math.round(x), Math.round(y)); c.scale(sc, sc);
    c.imageSmoothingEnabled = false;
    draw(c, o, -(b.dx + b.w / 2), -(b.dy + b.h / 2), ang, 0);
    c.restore();
  }
  function familyName(type, family) { const F = FAM[type] && FAM[type][clampI(family || 0, 0, 9)]; return F ? F.name : ''; }
  function name(opts) {
    const P = params(opts || {});
    if (!P.el) return P.F.name;
    return P.F.short + ' ' + WORDS[P.el][P.st - 1];
  }
  // Tên đầy đủ kèm bậc, ví dụ "Lá Lúa Xích Diệm (Tím)".
  function fullName(opts) { const P = params(opts || {}); return name(opts) + (P.rar ? ' (' + RARITY[P.rar].name + ')' : ''); }
  // Đổi vũ khí trong game (đối tượng w của G) sang opts để vẽ. family lấy từ w.family, không có thì suy ra từ w.id.
  function fromWeapon(w, extra) {
    if (!w) return Object.assign({ type: 'sword', family: 0, branch: null, stage: 0, rarity: 0 }, extra || {});
    const stage = G.wStage ? G.wStage(w) : (w.stage || 0);
    let f = w.family;
    if (f == null) { const s = String(w.id == null ? w.name || '' : w.id); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; f = h % 10; }
    return Object.assign({ type: w.type, family: f, branch: stage > 0 ? w.branch : null, stage: stage, rarity: w.rarity == null ? Math.min(3, w.tier || 0) : w.rarity }, extra || {});
  }

  G.weaponArt = {
    draw: draw, icon: icon, name: name, fullName: fullName, familyName: familyName, size: size, fromWeapon: fromWeapon,
    FAMILIES: FAM, RARITY: RARITY, STAGES: STAGES, BRANCHES: BRANCHES, TYPES: TYPES, TYPE_NAMES: TYPE_NAMES, WORDS: WORDS, REST: REST,
    clearCache: function () { cache.clear(); },
    _Spr: Spr, _Frame: Frame, _pal: { INK: INK, RED: RED, GRN: GRN, BLU: BLU, ORG: ORG, GOLD: GOLD, WD: WD, STEEL: STEEL, WHT: WHT }, _tone: { Dk: Dk, Md: Md, Lt: Lt },
  };
})();
