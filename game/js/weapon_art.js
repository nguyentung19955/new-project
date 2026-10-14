// Vũ khí sống: 4 loại (kiếm, cung/phi tiêu, giáo, búa). Đợt 2 (YEU-CAU-2-DON-CU.md): mỗi loại chỉ còn MỘT dòng — đúng dòng của 4 vũ khí
// cố định (Kiếm Rèn, Cung Tre/Phi Tiêu Tre, Giáo Tre Vót, Búa Lò Rèn); 36 dòng vẽ code khác đã xoá. Mỗi dòng 10 hình
// (1 hình gốc và 3 nhánh Lửa, Độc, Băng nhân 3 giai đoạn). Hình chính của vũ khí là bộ ảnh zed-vk (js/zed_moi.js, js/vk_moi.js);
// tệp này chỉ còn vẽ dự phòng (ảnh chưa tải), vũ khí bay theo ở làng, giáo Phi Thương bay, và vũ khí trên tay các bạn trong truyện.
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
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const BAM = ['#6f7a2a', '#b3b84a', '#e6e28a'];
  const BAMG = ['#2f6a2c', '#5aa544', '#a6dc74'];
  const BONE = ['#a89c84', '#e6dcc4', '#ffffff'];
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const GRN = ['#255a2c', '#479544', '#8fd070'];
  const BLU = ['#27407f', '#4468c0', '#86a8f0'];
  const ORG = ['#9a4a16', '#dd7c2a', '#f8b25c'];
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
  const TYPE_NAMES = { sword: 'Kiếm', bow: 'Phi tiêu', spear: 'Thương', hammer: 'Búa' }; // bộ Zed mới: cung thành phi tiêu
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
    this.buf = new Array(n).fill(null); // lớp nháp dùng lại cho mọi phần
    this.bx0 = 1e9; this.bx1 = -1; this.by0 = 1e9; this.by1 = -1; // vùng lớp nháp đã chạm tới
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
    const bx = Math.round(x) + this.ox, by = Math.round(y) + this.oy;
    if (bx < this.bx0) this.bx0 = bx; if (bx > this.bx1) this.bx1 = bx; if (by < this.by0) this.by0 = by; if (by > this.by1) this.by1 = by;
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
    const W = this.w, L = this.buf;
    this.lay = L; this.clip = false;
    this.bx0 = 1e9; this.bx1 = -1; this.by0 = 1e9; this.by1 = -1;
    fn(this);
    this.lay = null;
    if (this.bx1 < 0) return;
    // chỉ quét trong vùng lớp này đã vẽ
    const x0 = this.bx0, x1 = this.bx1, y0 = this.by0, y1 = this.by1;
    const ol = opt.fx ? false : (opt.ol === undefined ? INK : opt.ol);
    if (opt.bevel !== false && !opt.fx) {
      for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
        const q = L[i]; if (!q || q.f) continue;
        q.t = !L[i - W] ? 2 : (!L[i + W] || !L[i - 1]) ? 0 : 1;
      }
    }
    if (ol) {
      for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
        if (!L[i]) continue;
        for (let d = 0; d < 4; d++) {
          const k = i + (d === 0 ? -1 : d === 1 ? 1 : d === 2 ? -W : W);
          if (!L[k] && !(opt.under && this.main[k])) { this.main[k] = ol; this.olf[k] = 1; this.nol[k] = 0; this.rim[k] = 0; }
        }
      }
    }
    for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
      const q = L[i]; if (!q) continue;
      L[i] = null;
      if (opt.under && this.main[i]) continue;
      this.main[i] = q.c[q.t]; this.olf[i] = 0; this.nol[i] = opt.fx ? 1 : 0; this.rim[i] = opt.rim ? 1 : 0;
    }
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
  // Họa tiết khắc theo bậc (gọi bên trong S.in của phần thân): bậc Lam chấm thưa, bậc Tím chấm dày, bậc Vàng vạch liền có chấm sáng.
  function engrave(S, P, pts) {
    if (P.rar < 1) return;
    const R = RARITY[P.rar].P;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let j = 0; j <= n; j++) {
        const t = a[0] + ((b[0] - a[0]) * j) / n, q = a[1] + ((b[1] - a[1]) * j) / n;
        if (P.rar >= 3) S.p(t, q, j % 4 === 2 ? R[2] : R[1]); else if (j % (P.rar === 1 ? 3 : 2) === 0) S.p(t, q, P.rar === 1 ? R[2] : R[1]);
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
      const ps = w >= 7 ? 3 : 2;
      if (w >= 7) { px = look[0] > 0 ? 1 : look[0] < 0 ? -3 : -1; py = look[1] > 0 ? 0 : look[1] < 0 ? -3 : -1; }
      py = Math.max(py, top); if (py + ps - 1 > botm) py = botm - ps + 1;
      this.r(px, py, w <= 3 ? 1 : ps, ps, pc);
      if (P.st >= 2 || o.hl || w >= 7) this.r(px + (w <= 3 ? 0 : ps - 1), py, 1, 1, P.el === 'ice' ? '#bfe9ff' : SH);
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

  // ---------- các dòng vũ khí (mỗi loại một dòng; w.family nào cũng vẽ dòng đó) ----------
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

  // ======================= CUNG =======================
  // Cung vẽ theo trục: t là hướng bắn (ra trước), q là dọc cánh cung (âm là lên trên). Điểm cầm ở (0, 0), bụng cung ở t dương.
  const bowStr = (a, b, mid, o) => Object.assign({ a: a, b: b, mid: mid }, o || {});

  // thân lưỡi kiếm theo biên dạng, có biến hình theo hệ; inner(s, E) vẽ nét bên trong
  function bladePart(S, P, prof, o, inner) {
    const E = edges(prof, P, o);
    S.part({ ol: P.ol, rim: true }, (s) => { s.g(E.poly, (o && o.mat) || P.M); if (inner) s.in(() => inner(s, E)); });
    return E;
  }

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

  // ======================= BÚA =======================
  // Biến hình viền của một khối đầu búa theo hệ: Lửa thành răng lửa ở các mặt hướng lên, Độc mọc gai, Băng gãy thành mặt tinh thể.
  function blob(pts, P, o) {
    o = o || {};
    const el = o.plain ? null : P.el, st = P.st, n = pts.length;
    if (!el) return pts;
    let ct = 0, cq = 0; for (const p of pts) { ct += p[0]; cq += p[1]; } ct /= n; cq /= n;
    const res = []; let sacc = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001, steps = Math.max(1, Math.ceil(len / 0.7));
      let nt = (b[1] - a[1]) / len, nq = -(b[0] - a[0]) / len;
      if (nt * ((a[0] + b[0]) / 2 - ct) + nq * ((a[1] + b[1]) / 2 - cq) < 0) { nt = -nt; nq = -nq; }
      for (let j = 0; j < steps; j++) { const f = j / steps; res.push({ t: a[0] + (b[0] - a[0]) * f, q: a[1] + (b[1] - a[1]) * f, nt: nt, nq: nq, s: sacc + len * f }); }
      sacc += len;
    }
    const A = [0, 1.3, 2.4, 3.4][st] * (o.amp || 1), per = sacc / Math.max(3, Math.round(sacc / (o.per || (el === 'ice' ? 8 : 6))));
    return res.map((r) => {
      const ph = (r.s % per) / per; let d = 0;
      if (el === 'fire') { const w = Math.max(0, Math.min(1, st === 1 ? (r.nt - 0.5) * 2 : r.nt * 0.9 + 0.5)); d = A * 1.25 * Math.pow(ph, 1.3) * w; }
      else if (el === 'poison') d = ph < 0.3 && (st > 1 || r.s < sacc * 0.5) ? A * (1 - Math.abs(ph - 0.15) / 0.15) : 0;
      else d = (st > 1 || r.nt > -0.2 ? 1 : 0) * (A * 1.2 * (ph < 0.5 ? ph * 2 : (1 - ph) * 2) - A * 0.25);
      return [r.t + r.nt * d, r.q + r.nq * d];
    });
  }
  // chữ nhật vát góc: t từ t0 đến t1, q từ q0 đến q1, vát c
  function rrect(t0, t1, q0, q1, c) { return [[t0 + c, q0], [t1 - c, q0], [t1, q0 + c], [t1, q1 - c], [t1 - c, q1], [t0 + c, q1], [t0, q1 - c], [t0, q0 + c]]; }
  function headPart(S, P, pts, o, inner) {
    o = o || {};
    S.part({ ol: P.ol, rim: true }, (s) => { s.g(blob(pts, P, o), o.mat || P.M); if (inner) s.in(() => inner(s)); });
  }
  // Cán búa: gỗ, có đai quấn tay cầm và bịt đuôi.
  function haft(S, P, t0, t1, o) {
    o = o || {};
    const W = o.mat || WD, st = P.st, cap = st >= 2 ? P.A : (o.cap || IRON), band = P.rar >= 1 ? P.R.P : (o.band || RED);
    S.part((s) => { s.l(t0, 0, t1, 0, o.w || 3, W); s.in(() => { for (let t = t0 + 2; t < t1; t += 4) s.p(t, 0.5, Dk(W)); s.l(t0, -1, t1, -1, 1, Lt(W)); }); });
    S.part((s) => { s.l(t0 - 1, -2, t0 - 1, 2, 2, cap); });
    S.part({ ol: band[0] }, (s) => { s.l(-2.5, -1.5, -2.5, 1.5, 2, Md(band)); s.l(2.5, -1.5, 2.5, 1.5, 2, Md(band)); if (P.rar >= 3) s.l(0, -1.5, 0, 1.5, 2, Lt(band)); });
    if (P.poison && st >= 2) vine(S, [[5, 2], [8, -2.5], [11, 2.5], [14, -2.5]], [[8, -3.5]]);
  }
  const HMW = { t0: 6, L: 30, hook: 0.25, amp: 0.6 };

  // 0. Búa Lò Rèn: đầu búa sắt khối vuông to nặng, hai mặt đập sáng bóng. Tính cau có.
  fam('hammer', {
    name: 'Búa Lò Rèn', short: 'Búa Rèn', nature: 'cau có', mat: IRON, warp: HMW,
    spark: [[27, -9], [27, 9], [33, 0], [21, 0]],
    build: function (S, P) {
      const M = P.M, st = P.st;
      rtassel(S, P, 16, 2);
      haft(S, P, -7, 20);
      grow(S, P, [[33, -5, 1, -0.3], [33, 5, 1, 0.3], [27, -11, 0.2, -1], [27, 11, 0.2, 1]]);
      headPart(S, P, rrect(20, 34, -11, 11, 2), {}, (s) => {
        s.g([[20, -12], [36, -12], [36, -8.5], [20, -8.5]], Lt(st >= 2 ? M : STEEL)); s.g([[20, 12], [36, 12], [36, 8.5], [20, 8.5]], Md(st >= 2 ? M : STEEL));
        s.l(21, -8, 33, -8, 1, Dk(M)); s.l(21, 8, 33, 8, 1, Dk(M)); s.l(32.5, -7, 32.5, 7, 1, Lt(M));
        seed(s, P, 21, 32, 7, P.seed); core(s, P, 30.5, 31, 0);
        engrave(s, P, [[31, -6], [31, 6]]);
      });
      // nêm sắt chốt đầu cán
      S.part((s) => { s.l(35, -1.5, 35, 1.5, 2, st >= 2 ? P.A : WD); });
      gem(S, P, 21.5, 0);
      motes(S, P, [[38, -8], [38, 8], [30, -15], [30, 15], [40, 0], [18, 13]]);
    },
    face: function (F, P) {
      F.eye(27.5, -4, { brow: 'angry', side: 1, look: [1, 0], lid: 1 }); F.eye(27.5, 4, { brow: 'angry', side: -1, look: [-1, 0], lid: 1 });
      if (P.st >= 3) F.eye(32, 0, { w: 3, h: 3, pup: 'dot', look: [0, 0] });
      F.mouth(22.5, 0, 'frown', 'openfang');
      F.zzz(30, 8);
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
      k: [1, 1.03, 1.08, 1.14][st], ks: KS[type] * (F.ks || 1), seed: fi * 7 + TYPES.indexOf(type) * 31 + 3,
      fire: el === 'fire', poison: el === 'poison', ice: el === 'ice',
      warp: null, arc: F.arc || null, wave: F.wave || null,
    };
    if (el === 'poison' && F.warp) {
      const w = F.warp, a = [0, 0.7, 1.5, 2.3][st] * (w.amp == null ? 1 : w.amp);
      P.warp = w.bow ? { bow: true, amp: a, f: w.f || 0.3, ph: w.ph || 0.6, fade: w.fade } : { t0: w.t0, L: w.L, amp: a, f: w.f || 1.5, hook: (w.hook || 0) * st };
    }
    return P;
  }
  const KS = { sword: 0.88, bow: 0.9, spear: 0.88, hammer: 0.86 };
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
    b.tip = S.t1; // VFX chiến đấu: từ điểm cầm tới mũi (điểm ảnh), để vẽ vệt bám mũi vũ khí
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
  // VFX chiến đấu: khoảng cách từ điểm cầm tới mũi vũ khí (điểm ảnh, đã tính cỡ theo mốc), để js/fx.js vẽ vệt chém bám mũi.
  function tipLen(opts) { const P = params(opts || {}), b = body(P, qAng(REST[P.type])); return b.tip; }
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
  function familyName(type, family) { const F = FAM[type] && FAM[type][clampI(family || 0, 0, FAM[type].length - 1)]; return F ? F.name : ''; }
  function name(opts) {
    const P = params(opts || {});
    if (!P.el) return P.F.name;
    // Bản tiếng Anh đảo trật tự (chữ hệ đứng trước tên dòng) qua mẫu có ngữ cảnh 'tên vũ khí'; tiếng Việt y như cũ.
    return G.tc ? G.tc('tên vũ khí', '{0} {1}', P.F.short, WORDS[P.el][P.st - 1]) : P.F.short + ' ' + WORDS[P.el][P.st - 1];
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

  // Bộ Zed mới: dòng cung đổi tên thành phi tiêu (hình phi tiêu do js/zed_moi.js vẽ).
  for (const F of FAM.bow) { if (F.short === 'Cung Tre') F.short = 'Phi Tiêu Tre'; if (F.name === 'Cung Tre') F.name = 'Phi Tiêu Tre'; }
  G.weaponArt = {
    draw: draw, tipLen: tipLen, icon: icon, name: name, fullName: fullName, familyName: familyName, size: size, fromWeapon: fromWeapon,
    FAMILIES: FAM, RARITY: RARITY, ELP: ELP, STAGES: STAGES, BRANCHES: BRANCHES, TYPES: TYPES, TYPE_NAMES: TYPE_NAMES, WORDS: WORDS, REST: REST,
    clearCache: function () { cache.clear(); },
    _Spr: Spr, _Frame: Frame, _pal: { INK: INK, RED: RED, GRN: GRN, BLU: BLU, ORG: ORG, GOLD: GOLD, WD: WD, STEEL: STEEL, WHT: WHT }, _tone: { Dk: Dk, Md: Md, Lt: Lt },
  };
})();
