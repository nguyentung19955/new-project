// Em bé tinh linh: bốn hero dựng theo lớp (lưng, thân trần, áo, mũ, mặt nạ, vũ khí sống).
// Nạp sau hero_art.js thì thay G.art.hero, hàm cũ giữ ở G.art.heroOld.
// File tự đứng một mình: trang phác thảo cũng nạp chính file này để hình trong tờ duyệt và trong game là một.
// Gốc (0,0) là điểm giữa hai bàn chân, x sang phải, y âm là lên trên. Bé quay mặt sang phải, sáng từ trên bên phải.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const INK = '#1b1118';

  // ====================================================================
  // 1. BỘ VẼ ĐIỂM ẢNH (lấy từ lib.js của tờ phác thảo đã duyệt)
  // Chất liệu là bộ ba sắc độ [tối, vừa, sáng]: mép trên tự sáng, mép dưới và mép trái tự tối.
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
  function rotv(x, y, deg) { const r = deg * D2R, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; }

  class Spr {
    constructor(w, h, ox, oy) {
      this.w = w; this.h = h; this.ox = ox; this.oy = oy;
      const n = w * h;
      this.main = new Array(n).fill(null);
      this.olf = new Uint8Array(n); // điểm này là viền
      this.nol = new Uint8Array(n); // điểm này không cần viền ngoài (hiệu ứng)
      this.lay = null; this.clip = false;
      this.buf = new Array(n).fill(null); // lớp nháp dùng lại cho mọi miếng, chỉ quét trong khung bao của miếng cho nhanh
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
    l(x0, y0, x1, y1, w, c) {
      const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))), o = w >> 1;
      for (let i = 0; i <= n; i++) this.r(Math.round(x0 + (dx * i) / n) - o, Math.round(y0 + (dy * i) / n) - o, w, w, c);
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
    // tint: [màu, độ pha] để nhuộm khi trúng đòn, dính băng, dính độc
    toCanvas(tint) {
      let x0 = this.w, x1 = -1, y0 = this.h, y1 = -1;
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.main[y * this.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) { x0 = y0 = 0; x1 = y1 = 0; }
      const cv = document.createElement('canvas'); cv.width = x1 - x0 + 1; cv.height = y1 - y0 + 1;
      const c = cv.getContext('2d');
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let q = this.main[y * this.w + x]; if (!q) continue;
        if (tint && q[0] === '#') q = mixHex(q, tint[0], q === INK ? tint[1] * 0.5 : tint[1]);
        c.fillStyle = q; c.fillRect(x - x0, y - y0, 1, 1);
      }
      return { cv, ox: this.ox - x0, oy: this.oy - y0, bb: { x0: x0 - this.ox, x1: x1 - this.ox, y0: y0 - this.oy, y1: y1 - this.oy } };
    }
    // Hệ toạ độ con: gốc (ox,oy), xoay deg độ. Đồ vẽ qua hệ này sẽ bám theo thân khi thân nghiêng, lộn.
    fr(ox, oy, deg) { return new Fr(this, ox, oy, deg || 0); }
  }
  function mixHex(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const m = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
    return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
  }
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
    pl(pts, w, c) { for (let i = 0; i + 1 < pts.length; i++) this.l(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, c); }
  }

  // ====================================================================
  // 2. BẢNG MÀU (giữ bảng màu của tờ đã duyệt)
  // ====================================================================
  const MASK = ['#c9c0ae', '#f6f0e2', '#ffffff'];
  const SKIN = ['#7f79a6', '#b7b1d8', '#e2def4'];   // da tinh linh: tím nhạt
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const GRN = ['#255a2c', '#479544', '#8fd070'];
  const BLU = ['#27407f', '#4468c0', '#86a8f0'];
  const ORG = ['#9a4a16', '#dd7c2a', '#f8b25c'];
  const GOLD = ['#9c7426', '#e2b64e', '#ffe9a0'];
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const STEEL = ['#5f6b84', '#b4c0d4', '#f4f8ff'];
  const GOURD = ['#a8642a', '#e09c4a', '#f9d08c'];
  const BRZ = ['#754418', '#c4853a', '#f6d07c'];
  const STRAW = ['#8f6c2a', '#d8b45c', '#f8e6a4'];
  const INDIGO = ['#17162e', '#2e2d55', '#5c5a92'];
  const BAMBOO = ['#6c6a2c', '#b4ae58', '#e6e298'];
  const BONE = ['#a89c84', '#e8dec6', '#fffaf0'];
  const CLOTH = ['#7a6a4a', '#a89872', '#d8ccaa'];
  const TEAL = ['#2a5a70', '#4a7f9a', '#8fc0d4'];
  const STONE = ['#5a4e4a', '#8a7a74', '#bdb0a8'];
  const BARK = ['#4a3018', '#7a5632', '#a8804e'];
  const SCALE = ['#1f5f85', '#3f8fb5', '#8fd0ea'];
  const FUR = ['#b8b0a8', '#f0ece2', '#ffffff'];
  const EMBER = ['#7a2a12', '#b0502a', '#f08a4a'];
  const FIRE = ['#a32418', '#f2622a', '#ffc64c'];
  const ICE = ['#2f62ad', '#7fc4f2', '#eafcff'];
  const TOX = ['#1d5a2a', '#49a83c', '#b5ea6a'];
  const PURP = ['#3d1d55', '#6b3a8f', '#a56fd0'];
  const DARK = '#2a2230';
  const SH = '#ffffff';

  // ====================================================================
  // 3. DANH MỤC ĐỒ MẶC (G.heroLooks)
  // Mỗi món: { id, name, draw(cx, P) }. cx: { B: hệ thân, H: hệ đầu, C: màu của bé, f: số khung, lv: cấp cánh }.
  // P(opt, fn) mở một miếng vẽ thuộc đúng lớp của món đó. Vẽ qua cx.B hoặc cx.H thì món đồ tự bám theo người.
  // Thân: chân ở y=0, hông y=-4, vai y=-11, rộng từ x=-4 đến 4. Đầu: tâm (0,0), rộng từ -6 đến 7, cao từ -6 đến 6; mặt nạ lệch phải.
  // ====================================================================
  const L = (G.heroLooks = { hats: {}, robes: {}, backs: {}, wings: {}, hands: {}, masks: {} });
  const def = (kind, id, name, o) => { L[kind][id] = Object.assign({ id, name }, o); };

  // ---------- MŨ ----------
  function hood(cx, P, C, kieu) {
    const H = cx.H;
    if (kieu === 'sung') P((s) => { H.r(-4, -10, 2, 4, MASK); H.r(4, -10, 2, 4, MASK); H.p(-4, -11, Md(MASK)); H.p(5, -11, Md(MASK)); });
    if (kieu === 'la') P({ ol: GRN[0] }, (s) => { H.l(0, -7, 1, -10, 1, Md(GRN)); H.r(1, -11, 3, 2, Md(GRN)); H.p(3, -12, Lt(GRN)); });
    if (kieu === 'khan') P((s) => { H.e(0.5, -8, 1.6, 1.6, DARK); });
    if (kieu === 'tai') P((s) => { H.g([[-6, -3], [-5, -12], [-1, -6]], C); H.g([[2, -6], [6, -12], [7, -3]], C); s.in(() => { H.p(-4, -8, '#f0a0a0'); H.p(-4, -7, '#f0a0a0'); H.p(5, -8, '#f0a0a0'); H.p(5, -7, '#f0a0a0'); }); });
    P((s) => {
      if (kieu === 'nhon') H.g([[-7, 2], [-3, -13], [7, -2], [5, 3], [-5, 3]], C);
      H.e(0, -0.5, 7.2, 6.7, C);
      s.in(() => { H.e(-4, 3, 3.5, 2.5, Dk(C)); if (kieu === 'nhon') H.l(-2, -12, 3, -6, 1, Lt(C)); });
    });
  }
  def('hats', 'trum_sung', 'Mũ trùm sừng nhỏ', { tint: true, draw: (cx, P) => hood(cx, P, cx.C, 'sung') });
  def('hats', 'trum_nhon', 'Mũ trùm chóp nhọn', { tint: true, draw: (cx, P) => hood(cx, P, cx.C, 'nhon') });
  def('hats', 'trum_la', 'Mũ trùm mầm lá', { tint: true, draw: (cx, P) => hood(cx, P, cx.C, 'la') });
  def('hats', 'trum_khan', 'Mũ trùm quấn khăn đỏ', {
    tint: true,
    draw: (cx, P) => hood(cx, P, cx.C, 'khan'),
    front: (cx, P) => { const H = cx.H, k = cx.f % 4 < 2 ? 0 : 1; P((s) => { H.g([[-5, -5], [-10, -8 + k], [-10, -5 + k]], RED); H.g([[-5, -4], [-9, -2 - k], [-7, -5]], RED); }); P((s) => { H.r(-6, -6, 13, 2, RED); s.in(() => { H.r(-5, -6, 11, 1, Lt(RED)); }); }); },
  });
  def('hats', 'non_la', 'Nón lá', {
    draw: (cx, P) => { const H = cx.H; P({ ol: RED[0] }, (s) => { H.l(-5, -3, -4, 5, 1, Md(RED)); }); },
    front: (cx, P) => {
      const H = cx.H;
      P((s) => {
        H.g([[0, -14], [11, -3], [-11, -3]], STRAW);
        s.in(() => { H.l(0, -13, 7, -5, 1, Lt(STRAW)); H.l(-1, -10, -7, -5, 1, Dk(STRAW)); H.l(-4, -8, 4, -8, 1, Dk(STRAW)); H.r(-10, -3, 21, 1, Dk(STRAW)); H.r(-6, -5, 13, 1, Md(STRAW)); });
      });
    },
  });
  def('hats', 'khan_xep', 'Khăn xếp', {
    draw: (cx, P) => {
      const H = cx.H;
      P((s) => {
        H.g([[-7, -3], [-7, -7], [-5, -9], [6, -9], [8, -7], [8, -3]], INDIGO);
        s.in(() => { H.l(-6, -6, 7, -6, 1, Dk(INDIGO)); H.l(-4, -8, 5, -8, 1, Lt(INDIGO)); H.p(3, -5, Lt(INDIGO)); H.p(4, -6, Lt(INDIGO)); H.p(5, -5, Lt(INDIGO)); H.p(4, -4, Md(GOLD)); });
      });
    },
  });
  def('hats', 'mu_rom', 'Mũ rơm', {
    draw: (cx, P) => {
      const H = cx.H;
      P((s) => { H.e(0.5, -7, 5, 3.6, STRAW); s.in(() => { H.r(-5, -6, 12, 1, Md(RED)); H.p(-2, -9, Dk(STRAW)); H.p(2, -8, Dk(STRAW)); }); });
    },
    front: (cx, P) => {
      const H = cx.H;
      P((s) => { H.r(-10, -5, 22, 2, STRAW); H.p(-11, -4, Md(STRAW)); H.p(12, -4, Md(STRAW)); s.in(() => { for (let u = -9; u <= 11; u += 3) H.p(u, -4, Dk(STRAW)); }); });
    },
  });
  function cap(cx, P, C, rim) {
    const H = cx.H;
    P((s) => { H.g([[-7, -3], [-6, -6], [-3, -8], [4, -8], [7, -6], [8, -3]], C); s.in(() => { H.r(-7, -4, 16, 2, rim); H.l(-2, -7, 3, -7, 1, Lt(C)); }); });
  }
  def('hats', 'mu_sung', 'Mũ sừng', {
    draw: (cx, P) => {
      const H = cx.H;
      P((s) => { H.pl([[-5, -5], [-9, -8], [-10, -13]], 2, BONE); H.pl([[6, -5], [10, -8], [11, -13]], 2, BONE); s.in(() => { H.p(-10, -13, Lt(BONE)); H.p(11, -13, Lt(BONE)); H.p(-8, -7, Dk(BONE)); H.p(9, -7, Dk(BONE)); }); });
      cap(cx, P, WD, Md(GOLD));
    },
  });
  def('hats', 'vong_la', 'Vòng lá', {
    draw: (cx, P) => { const H = cx.H; P({ ol: SKIN[0] }, (s) => { H.l(0, -6, 0, -8, 1, Md(SKIN)); H.p(1, -9, Lt(SKIN)); }); },
    front: (cx, P) => {
      const H = cx.H;
      P({ ol: GRN[0] }, (s) => {
        H.r(-6, -6, 14, 2, Md(GRN));
        for (const u of [-6, -3, 0, 3, 6]) { H.g([[u - 1, -6], [u, -9], [u + 1, -6]], u % 2 ? Lt(GRN) : Md(GRN)); }
        s.in(() => { H.p(-4, -5, Dk(GRN)); H.p(2, -5, Dk(GRN)); H.r(-2, -6, 2, 2, Md(RED)); H.p(5, -6, Lt(GOLD)); H.p(-6, -5, Lt(GOLD)); });
      });
    },
  });
  def('hats', 'mu_da_ca', 'Mũ da cá', {
    draw: (cx, P) => {
      const H = cx.H;
      P((s) => { H.r(-8, -3, 3, 6, TEAL); s.in(() => { H.p(-7, 1, Lt(TEAL)); }); });
      P((s) => { H.g([[-2, -8], [1, -11], [3, -8]], Lt(TEAL)); });
      cap(cx, P, TEAL, Dk(TEAL));
      P({ ol: false, bevel: false }, (s) => { H.p(-4, -6, Lt(TEAL)); H.p(-1, -5, Lt(TEAL)); H.p(5, -6, Lt(TEAL)); });
    },
  });
  def('hats', 'khan_lua', 'Khăn đá lửa', {
    draw: (cx, P) => {
      const H = cx.H, k = cx.f % 4 < 2 ? 0 : 1;
      P((s) => { H.g([[-6, -6], [-11, -8 + k], [-10, -5 + k]], EMBER); H.g([[-6, -5], [-10, -2 - k], [-8, -5]], EMBER); });
      P((s) => { H.g([[-7, -3], [-6, -7], [-3, -8], [4, -8], [7, -7], [8, -3]], EMBER); s.in(() => { H.r(-7, -4, 16, 1, Dk(EMBER)); H.r(3, -6, 2, 2, Lt(GOLD)); H.p(-2, -7, Lt(EMBER)); H.p(0, -6, Lt(EMBER)); }); });
    },
  });
  def('hats', 'mu_vay_ca', 'Mũ vây cá', {
    draw: (cx, P) => {
      const H = cx.H;
      P((s) => { H.g([[-5, -7], [-3, -13], [-1, -9], [1, -14], [3, -9], [5, -12], [6, -7]], ICE); s.in(() => { H.l(-3, -12, -2, -8, 1, Dk(ICE)); H.l(1, -13, 1, -8, 1, Dk(ICE)); H.l(5, -11, 4, -8, 1, Dk(ICE)); }); });
      P((s) => { H.g([[-7, -4], [-11, -6], [-10, -1], [-7, 0]], Md(ICE)); });
      cap(cx, P, SCALE, Lt(SCALE));
    },
  });
  def('hats', 'mu_tai_cao', 'Mũ tai cáo', {
    draw: (cx, P) => hood(cx, P, FUR, 'tai'),
    front: (cx, P) => { const H = cx.H; P({ ol: false, bevel: false }, (s) => { H.r(1, -6, 2, 1, RED[1]); H.p(2, -5, RED[1]); }); },
  });

  // ---------- ÁO ----------
  // Áo trùm (bộ khởi đầu): phủ từ vai xuống gần chân.
  function cloak(cx, P, C, o) {
    const B = cx.B; o = o || {};
    P((s) => {
      B.g([[-3, -13], [3, -13], [5, -3], [-5, -3]], C);
      s.in(() => { B.r(-5, -4, 11, 1, Lt(C)); B.r(-5, -9, 2, 6, Dk(C)); B.p(1, -11, o.clasp || Md(GOLD)); if (o.sash) B.r(-4, -8, 9, 1, o.sash); });
    });
  }
  // Áo nhiều tầng xù: áo tơi, áo lông.
  function tiers(cx, P, C, o) {
    const B = cx.B; o = o || {};
    const T = [[-6, 6, -7, -3], [-5, 5, -10, -7], [-4, 4, -13, -10]];
    for (const t of T) P((s) => {
      B.g([[t[0] + 1, t[2]], [t[1] - 1, t[2]], [t[1], t[3]], [t[0], t[3]]], C);
      s.in(() => { for (let u = t[0]; u <= t[1]; u += 2) { B.p(u, t[3], Dk(C)); B.p(u + 1, t[3] - 1, o.fleck || Md(C)); } });
      for (let u = t[0] + 1; u <= t[1]; u += 3) B.p(u, t[3] + 1, Md(C));
    });
    if (o.sash) P({ ol: false, bevel: false }, (s) => { B.r(-4, -10, 9, 1, o.sash); });
  }
  // Áo ngắn vừa người: áo vải, áo the, áo vảy.
  function tunic(cx, P, C, o) {
    const B = cx.B; o = o || {}; const hem = o.hem == null ? -4 : o.hem;
    P((s) => {
      B.g([[-3, -13], [3, -13], [4, hem], [-4, hem]], C);
      s.in(() => {
        B.r(-4, -9, 2, 9, Dk(C));
        if (o.collar) { B.p(0, -13, o.collar); B.p(1, -12, o.collar); B.p(2, -13, o.collar); }
        if (o.seam) B.l(1, -11, 1, hem, 1, Dk(C));
        if (o.belt) { B.r(-4, -7, 9, 1, o.belt); B.p(1, -7, Lt(GOLD)); }
        if (o.scales) for (let v = -12; v <= hem; v += 2) for (let u = -3 + ((v / 2) & 1); u <= 4; u += 2) B.p(u, v, Lt(C));
        if (o.under) B.r(-4, hem, 9, 1, o.under);
        if (o.patch) B.r(1, -6, 2, 2, o.patch);
      });
    });
  }
  // Giáp nẹp: giáp tre, giáp đá, áo vỏ cây.
  function plates(cx, P, C, o) {
    const B = cx.B; o = o || {};
    P((s) => { B.r(-5, -6, 11, 3, C); s.in(() => { for (const u of [-3, 0, 3]) B.r(u, -6, 1, 3, Dk(C)); B.r(-5, -6, 11, 1, o.cord || Md(RED)); }); });
    P((s) => {
      B.g([[-4, -13], [4, -13], [4, -6], [-4, -6]], C);
      s.in(() => { for (const u of [-2, 1]) B.r(u, -13, 1, 8, Dk(C)); B.r(-4, -10, 9, 1, o.cord || Md(RED)); if (o.glow) { B.p(2, -12, o.glow); B.p(3, -8, o.glow); B.p(-1, -8, o.glow); } });
    });
    P((s) => { B.r(-6, -14, 4, 3, C); B.r(3, -14, 4, 3, C); s.in(() => { B.r(-6, -12, 4, 1, Dk(C)); B.r(3, -12, 4, 1, Dk(C)); if (o.moss) { B.r(-6, -14, 2, 1, o.moss); B.p(5, -14, o.moss); } }); });
    if (o.sprout) P({ ol: GRN[0] }, (s) => { B.r(4, -17, 2, 2, Md(GRN)); B.p(4, -15, Md(GRN)); });
  }
  // Áo cộc không tay: áo da.
  function vest(cx, P, C, o) {
    const B = cx.B; o = o || {};
    P((s) => {
      B.g([[-4, -12], [4, -12], [4, -4], [-4, -4]], C);
      s.in(() => { B.r(-4, -9, 2, 6, Dk(C)); B.r(-4, -7, 9, 1, DARK); B.p(1, -7, Lt(GOLD)); for (let u = -4; u <= 4; u += 2) B.p(u, -4, o.trim ? Md(o.trim) : Lt(C)); });
    });
    P((s) => { B.e(0, -12.5, 4.6, 1.4, o.trim || FUR); });
  }
  def('robes', 'ao_trum', 'Áo trùm', { tint: true, sleeve: (cx) => cx.C, draw: (cx, P) => cloak(cx, P, cx.C) });
  def('robes', 'ao_toi', 'Áo tơi lá', { draw: (cx, P) => tiers(cx, P, STRAW, { fleck: Lt(STRAW) }) });
  def('robes', 'ao_the', 'Áo the', { sleeve: () => INDIGO, draw: (cx, P) => tunic(cx, P, INDIGO, { hem: -3, collar: Lt(MASK), seam: true, under: Md(MASK) }) });
  def('robes', 'giap_tre', 'Giáp tre', { draw: (cx, P) => plates(cx, P, BAMBOO) });
  def('robes', 'ao_da', 'Áo da', { draw: (cx, P) => vest(cx, P, WD) });
  def('robes', 'ao_la', 'Áo lá', {
    draw: (cx, P) => {
      const B = cx.B;
      P({ ol: GRN[0] }, (s) => { for (const u of [-5, -2, 1, 4]) B.g([[u - 1, -8], [u + 2, -8], [u + 0.5, -2]], u === -2 || u === 4 ? Lt(GRN) : Md(GRN)); s.in(() => { B.r(-5, -8, 11, 1, Dk(GRN)); }); });
      P({ ol: GRN[0] }, (s) => { for (const u of [-4, -1, 2]) B.g([[u, -13], [u + 3, -13], [u + 1.5, -10]], u === -1 ? Lt(GRN) : Md(GRN)); s.in(() => { B.p(1, -12, Md(RED)); }); });
    },
  });
  def('robes', 'kho_vat', 'Khố đô vật', {
    draw: (cx, P) => { const B = cx.B; P((s) => { B.r(-4, -7, 9, 2, RED); B.g([[0, -6], [4, -6], [3, -2], [1, -2]], RED); s.in(() => { B.r(-4, -7, 9, 1, Lt(RED)); B.p(2, -3, Md(GOLD)); }); }); },
  });
  def('robes', 'ao_vai', 'Áo vải thô', { sleeve: () => CLOTH, sleeveLen: 0.5, draw: (cx, P) => tunic(cx, P, CLOTH, { belt: Md(WD), patch: Dk(CLOTH) }) });
  def('robes', 'ao_da_bien', 'Áo da biển', { draw: (cx, P) => vest(cx, P, TEAL, { trim: ICE }) });
  def('robes', 'giap_da', 'Áo giáp đá', { draw: (cx, P) => plates(cx, P, STONE, { cord: Md(EMBER), glow: Lt(FIRE) }) });
  def('robes', 'ao_vo_cay', 'Áo vỏ cây', { draw: (cx, P) => plates(cx, P, BARK, { cord: Dk(BARK), moss: Md(GRN), sprout: true }) });
  def('robes', 'ao_vay', 'Áo vảy', { sleeve: () => SCALE, sleeveLen: 0.5, draw: (cx, P) => tunic(cx, P, SCALE, { scales: true, belt: Md(GOLD) }) });
  def('robes', 'ao_long', 'Áo lông trắng', { draw: (cx, P) => tiers(cx, P, FUR, { sash: RED[1] }) });

  // ---------- ĐỒ ĐEO LƯNG ----------
  def('backs', 'ho_lo', 'Bầu hồ lô', {
    draw: (cx, P) => {
      const K = cx.B.sub(-8, -8, -30), f = cx.f;
      P((s) => { K.r(-1, -11, 3, 2, WD); });
      P({ ol: GRN[0] }, (s) => { K.r(2, -12, 3, 2, Md(GRN)); K.p(4, -13, Lt(GRN)); });
      P((s) => {
        K.e(0, 2, 4.7, 4.5, GOURD); K.e(0, -5, 3.1, 3, GOURD); K.r(-1, -9, 2, 2, GOURD);
        s.in(() => { K.e(-2.5, 4, 2.5, 2.5, Dk(GOURD)); K.r(2, 0, 1, 3, Lt(GOURD)); K.p(2, 0, SH); K.p(1, -6, Lt(GOURD)); });
      });
      P((s) => { K.r(-3, -2, 7, 1, RED); K.r(-4, -2, 1, 4, RED); K.p(-4, 2, Md(GOLD)); });
      P({ fx: true }, (s) => {
        const q = K.pt(1, -13), x = Math.round(q[0]), y = Math.round(q[1]), k = f % 4;
        s.p(x + (k & 1), y - 2 - k, '#b9f0d2'); s.p(x - 1 + (k >> 1), y - 5 - k, '#8fe0b8'); if (k < 2) s.r(x + 1, y - 8 - k, 2, 2, 'rgba(185,240,210,0.75)');
      });
    },
    front: (cx, P) => { const B = cx.B; P({ ol: false, bevel: false }, (s) => { B.l(-3, -12, 3, -7, 1, RED[1]); }); },
  });
  def('backs', 'ong_ten', 'Ống tên', {
    draw: (cx, P) => {
      const K = cx.B.sub(-6, -10, -24);
      P((s) => { for (const u of [-2, 0, 2]) K.r(u, -10, 1, 5, WD); });
      P({ ol: false, bevel: false }, (s) => { K.r(-2, -11, 1, 2, RED[1]); K.r(0, -12, 1, 2, MASK[2]); K.r(2, -11, 1, 2, GRN[2]); });
      P((s) => { K.r(-2, -6, 5, 11, WD); s.in(() => { K.r(-2, -6, 5, 1, Md(GOLD)); K.r(-2, 1, 5, 1, Md(GOLD)); K.r(-2, -5, 1, 9, Dk(WD)); }); });
    },
    front: (cx, P) => { const B = cx.B; P({ ol: false, bevel: false }, (s) => { B.l(-3, -12, 3, -7, 1, WD[0]); }); },
  });
  def('backs', 'ao_choang', 'Áo choàng', {
    draw: (cx, P) => {
      const B = cx.B, k = [0, 1, 2, 1][cx.f % 4];
      P((s) => { B.g([[-1, -13], [-4, -13], [-9 - k, -3 + (k >> 1)], [-7 - k, -1], [-3, -3]], RED); s.in(() => { B.l(-8 - k, -2, -4, -2, 1, Md(GOLD)); B.l(-5, -11, -8 - k, -4, 1, Dk(RED)); }); });
    },
    front: (cx, P) => { const B = cx.B; P((s) => { B.r(0, -13, 2, 2, GOLD); }); },
  });
  def('backs', 'gui_tre', 'Gùi tre', {
    draw: (cx, P) => {
      const K = cx.B.sub(-7, -8, -8);
      P({ ol: GRN[0] }, (s) => { K.r(-2, -8, 2, 3, Md(GRN)); K.r(1, -9, 2, 4, Lt(GRN)); K.p(0, -7, Md(RED)); });
      P((s) => { K.g([[-3, -5], [3, -5], [2, 4], [-2, 4]], BAMBOO); s.in(() => { K.r(-3, -5, 7, 1, Lt(BAMBOO)); for (let v = -3; v <= 3; v += 2) K.r(-3, v, 7, 1, Dk(BAMBOO)); K.r(0, -4, 1, 8, Dk(BAMBOO)); }); });
    },
    front: (cx, P) => { const B = cx.B; P({ ol: false, bevel: false }, (s) => { B.l(-3, -12, -2, -6, 1, WD[0]); }); },
  });

  // ---------- CÁNH ----------
  // Mỗi lá cánh: [góc (0 là chĩa ra sau, 90 là chĩa lên), dài, rộng]. Cấp càng cao càng nhiều lá, càng dài.
  const WINGS = {
    chuon: { name: 'Cánh chuồn chuồn', ramp: ['#5a8fb8', '#a8dcf0', '#f0fcff'], ol: '#2c4a6a', shape: 'lobe', lv: [[[22, 8, 4]], [[42, 15, 5], [6, 12, 5]], [[52, 24, 7], [22, 22, 7], [-10, 14, 5]]] },
    la: { name: 'Cánh lá', ramp: GRN, ol: '#12331a', shape: 'leaf', lv: [[[25, 8, 4]], [[40, 15, 7], [4, 12, 6]], [[56, 22, 9], [26, 24, 10], [-6, 17, 8]]] },
    lua: { name: 'Cánh lửa', ramp: FIRE, ol: '#7a1810', shape: 'flame', lv: [[[25, 9, 4]], [[42, 16, 7], [8, 12, 6]], [[60, 22, 8], [34, 26, 10], [8, 20, 8], [-16, 12, 5]]] },
    bang: { name: 'Cánh băng', ramp: ICE, ol: '#1c3a70', shape: 'shard', lv: [[[25, 9, 4]], [[50, 15, 5], [24, 15, 5], [-2, 11, 4]], [[66, 20, 5], [46, 25, 6], [26, 24, 6], [6, 19, 5], [-14, 12, 4]]] },
  };
  function blade(W, a, len, wid, shape, C, hi) {
    const r = a * D2R, dx = -Math.cos(r), dy = -Math.sin(r), nx = -dy, ny = dx, h = wid / 2;
    const q = (t, k) => [dx * len * t + nx * h * k, dy * len * t + ny * h * k];
    let pts;
    if (shape === 'lobe') pts = [q(0, 0), q(0.25, 0.8), q(0.6, 1), q(0.9, 0.7), q(1, 0), q(0.9, -0.7), q(0.6, -1), q(0.25, -0.8)];
    else if (shape === 'leaf') pts = [q(0, 0), q(0.4, 1), q(1, 0.1), q(0.45, -1)];
    else if (shape === 'flame') pts = [q(0, 0.3), q(0.4, 1.1), q(0.7, 0.5), q(1, 0.9), q(0.75, -0.2), q(0.4, -1), q(0, -0.4)];
    else pts = [q(0, 0.4), q(0.35, 1), q(1, 0), q(0.3, -1), q(0, -0.4)];
    W.g(pts, C);
    W.S.in(() => {
      const a0 = q(0.12, 0), a1 = q(0.85, shape === 'flame' ? 0.4 : 0);
      if (shape === 'leaf') W.l(a0[0], a0[1], a1[0], a1[1], 1, Dk(C));
      else if (shape === 'flame') { const b = q(0.2, 0.1), d = q(0.6, 0.3); W.l(b[0], b[1], d[0], d[1], 1, hi ? '#fff0b0' : Lt(C)); }
      else { const b = q(0.2, 0.2), d = q(0.75, 0.1); W.l(b[0], b[1], d[0], d[1], 1, shape === 'shard' ? SH : Lt(C)); }
    });
  }
  for (const id in WINGS) {
    const w = WINGS[id];
    def('wings', id, w.name, {
      levels: 3,
      draw: (cx, P) => {
        const lv = Math.max(1, Math.min(3, cx.lv | 0)), bl = w.lv[lv - 1], flap = [-14, 0, 18, 0][cx.f % 4] * (lv === 1 ? 0.6 : 1);
        const far = cx.B.sub(-3, -11, flap * 0.7 + 16), near = cx.B.sub(-4, -10, flap);
        const dim = [w.ramp[0], w.ramp[0], w.ramp[1]];
        P({ ol: w.ol }, (s) => { for (const b of bl) blade(far, b[0], b[1] * 0.85, b[2], w.shape, dim, false); });
        P({ ol: w.ol }, (s) => { for (const b of bl) blade(near, b[0], b[1], b[2], w.shape, w.ramp, lv === 3); });
        if (lv === 3) P({ fx: true }, (s) => {
          const k = cx.f % 4, c1 = id === 'lua' ? '#ffd27a' : id === 'la' ? '#c8a0ea' : '#ffffff', c2 = id === 'lua' ? '#ff8a3a' : id === 'la' ? '#b5ea6a' : '#bfe9ff';
          for (const q of [[-14, -18, c1], [-23, -8, c2], [-18, 4, c1], [-8, -24, c2], [-25, -16, c1]]) { const a = near.pt(q[0] - (k & 1), q[1] - k); s.p(a[0], a[1], q[2]); }
          if (id === 'chuon' || id === 'bang') { const a = near.pt(-20, -13), x = Math.round(a[0]), y = Math.round(a[1]); s.p(x, y, SH); if (k < 2) { s.p(x - 1, y, '#bfe9ff'); s.p(x + 1, y, '#bfe9ff'); s.p(x, y - 1, '#bfe9ff'); s.p(x, y + 1, '#bfe9ff'); } }
        });
      },
    });
  }

  // ---------- ĐỒ CẦM TAY, GĂNG ----------
  def('hands', 'bua_con', 'Búa rèn tí hon', {
    // chỉ hiện khi tay xa đang rảnh; hx,hy là bàn tay xa
    prop: (cx, P, hx, hy) => {
      const B = cx.B;
      P((s) => { B.r(hx, hy - 6, 1, 6, WD); });
      P((s) => { B.r(hx - 2, hy - 9, 5, 3, STEEL); s.in(() => { B.r(hx - 2, hy - 9, 1, 3, Dk(STEEL)); B.r(hx + 2, hy - 9, 1, 3, Dk(STEEL)); }); });
    },
  });
  def('hands', 'gang_dong', 'Găng đồng', { glove: BRZ });

  // ---------- DẤU TRÊN MẶT NẠ ----------
  def('masks', 'lua', 'Dấu lửa', { draw: (H) => { H.r(2, -3, 2, 1, Md(RED)); H.p(3, -2, Lt(GOLD)); } });
  def('masks', 'la', 'Dấu lá', { draw: (H) => { H.r(-2, 2, 2, 1, Md(GRN)); H.p(6, 2, Md(GRN)); H.p(2, -3, Md(GRN)); } });
  def('masks', 'xoay', 'Dấu nước', { draw: (H) => { H.p(2, -3, Md(BLU)); H.p(3, -2, Md(BLU)); H.p(2, -2, Lt(BLU)); } });
  def('masks', 'du', 'Dấu đô vật', { draw: (H) => { H.r(-1, -2, 1, 2, Md(RED)); H.r(6, -2, 1, 2, Md(RED)); H.r(2, -3, 2, 1, Md(RED)); } });
  def('masks', 'ho', 'Mặt nạ hổ', { draw: (H) => { H.r(1, -3, 1, 2, Md(ORG)); H.r(3, -3, 1, 2, Md(ORG)); H.r(-2, 1, 2, 1, Md(ORG)); H.r(5, 1, 2, 1, Md(ORG)); H.r(-2, 3, 2, 1, Md(ORG)); } });

  // Bộ khởi đầu của từng hero và màu áo.
  const HERO = {
    smith: { name: 'Thợ Rèn', col: RED, outfit: { hat: 'trum_sung', robe: 'ao_trum', back: null, hand: 'bua_con', mask: 'lua' }, shadow: 7 },
    hunter: { name: 'Thợ Săn', col: GRN, outfit: { hat: 'trum_nhon', robe: 'ao_trum', back: 'ong_ten', hand: null, mask: 'la' }, shadow: 7 },
    healer: { name: 'Thầy Lang', col: BLU, outfit: { hat: 'trum_la', robe: 'ao_trum', back: 'ho_lo', hand: null, mask: 'xoay' }, shadow: 7 },
    wrestler: { name: 'Đô Vật', col: ORG, outfit: { hat: 'trum_khan', robe: 'ao_trum', back: null, hand: 'gang_dong', mask: 'du' }, shadow: 7 },
  };
  L.starter = {}; for (const k in HERO) L.starter[k] = HERO[k].outfit;
  // Nối món đồ đang có trong data.js (G.GEAR) sang các lớp mới.
  L.fromGear = {
    helm: { h_r1: 'non_la', h_r2: 'mu_da_ca', h_r3: 'khan_lua', h_moc: 'mu_sung', h_ngu: 'mu_vay_ca', h_ho: 'mu_tai_cao' },
    armor: { a_r1: 'ao_vai', a_r2: 'ao_da_bien', a_r3: 'giap_da', a_moc: 'ao_vo_cay', a_ngu: 'ao_vay', a_ho: 'ao_long' },
  };
  // Gộp: bộ khởi đầu, rồi mũ áo đang mặc trong game (o.helm, o.armor), rồi o.outfit nếu có (hoặc o.p.outfit: đồ gắn sẵn trên người chơi).
  function outfitOf(key, o) {
    const st = HERO[key].outfit, x = (o && o.outfit) || (o && o.p && o.p.outfit) || {};
    const pick = (k, gear) => (x[k] !== undefined ? x[k] : gear || st[k]);
    return {
      hat: pick('hat', o && o.helm && L.fromGear.helm[o.helm]), robe: pick('robe', o && o.armor && L.fromGear.armor[o.armor]),
      back: pick('back'), hand: pick('hand'), mask: pick('mask'), wing: x.wing && x.wing.level > 0 && L.wings[x.wing.kind] ? { kind: x.wing.kind, level: Math.min(3, x.wing.level | 0) } : null,
    };
  }

  // ====================================================================
  // 4. VẼ MỘT EM BÉ THEO LỚP
  // Thứ tự: lưng (cánh, đồ đeo) -> thân trần -> áo -> mũ -> mặt nạ -> tay gần. only: chỉ vẽ một lớp (để tách lớp cho dễ nhìn).
  // ====================================================================
  const SHN = [2, -10], SHF = [-2, -10]; // vai gần, vai xa
  function reach(sh, h, max) { const dx = h[0] - sh[0], dy = h[1] - sh[1], d = Math.hypot(dx, dy); return d <= max ? h : [sh[0] + (dx / d) * max, sh[1] + (dy / d) * max]; }
  function eyes(H, kind) {
    if (kind === 'blink') { H.r(0, 1, 2, 1, INK); H.r(4, 1, 2, 1, INK); }
    else if (kind === 'shut') { H.p(0, 0, INK); H.p(1, -1, INK); H.p(2, 0, INK); H.p(4, 0, INK); H.p(5, -1, INK); H.p(6, 0, INK); }
    else if (kind === 'hurt') { H.p(0, -1, INK); H.p(1, 0, INK); H.p(0, 1, INK); H.p(5, -1, INK); H.p(4, 0, INK); H.p(5, 1, INK); }
    else if (kind === 'x') { for (const u of [0, 4]) { H.p(u, -1, INK); H.p(u + 2, -1, INK); H.p(u + 1, 0, INK); H.p(u, 1, INK); H.p(u + 2, 1, INK); } }
    else { H.r(0, -1, 2, 3, INK); H.r(4, -1, 2, 3, INK); H.p(0, -1, SH); H.p(4, -1, SH); if (kind === 'wide') { H.r(0, -2, 2, 1, INK); H.r(4, -2, 2, 1, INK); } }
    if (kind === 'wide' || kind === 'hurt') H.r(2, 3, 2, 2, INK); else if (kind === 'x') H.r(2, 3, 2, 1, INK); else if (kind === 'shut') { H.p(2, 3, INK); H.p(3, 3, INK); H.p(2, 4, '#e86a6a'); H.p(3, 4, '#e86a6a'); } else { H.p(2, 3, INK); H.p(3, 3, INK); }
  }
  function drawKid(S, key, of, ps, only) {
    const hero = HERO[key], C = hero.col;
    const B = S.fr(0, 0, ps.rot || 0), H = B.sub(ps.hdx || 0, -18 + (ps.hdy || 0), ps.ha || 0);
    const cx = { S, B, H, C, f: ps.f | 0, ps, key, lv: of.wing ? of.wing.level : 0 };
    const lay = (name) => (opt, fn) => { if (only && only !== name) return; S.part(opt, fn); };
    const Pb = lay('lung'), Pt = lay('than'), Pa = lay('ao'), Pm = lay('mu'), Pk = lay('mat'), Ph = lay('tay');
    const hat = L.hats[of.hat], robe = L.robes[of.robe], back = L.backs[of.back], hand = L.hands[of.hand], wing = of.wing && L.wings[of.wing.kind];
    let hn = ps.hn || [5, -7], hf = ps.hf || [-4, -7];
    if (hand && hand.prop && ps.free) hf = [-7, -9 + (ps.hdy || 0)];
    hn = reach(SHN, hn, ps.grip ? 10 : 7); hf = reach(SHF, hf, ps.grip ? 11 : 7);
    const glove = hand && hand.glove;
    const arm = (sh, h, near) => {
      Pt((s) => { B.l(sh[0], sh[1], h[0], h[1], 2, near ? SKIN : Dk(SKIN)); });
      if (robe && robe.sleeve) { const k = robe.sleeveLen || 0.72, R = robe.sleeve(cx); Pa((s) => { B.l(sh[0], sh[1], sh[0] + (h[0] - sh[0]) * k, sh[1] + (h[1] - sh[1]) * k, 3, near ? R : [R[0], R[0], R[1]]); }); }
      if (glove) Ph((s) => { B.r(h[0] - 1, h[1] - 1, 3, 3, glove); s.in(() => { B.p(h[0] + 1, h[1] - 1, SH); }); });
      else Pt((s) => { B.r(h[0] - 1, h[1] - 1, 2, 2, Md(MASK)); });
    };
    // 1. lớp lưng
    if (back) back.draw(cx, Pb);
    if (wing) wing.draw(cx, Pb); // cánh mọc từ vai nên nằm trước đồ đeo lưng
    // 2. thân trần
    arm(SHF, hf, false);
    const ff = ps.ff || [2, 0], fb = ps.fb || [-2, 0];
    Pt((s) => { B.l(-2, -4, fb[0], fb[1] - 2, 2, Dk(SKIN)); B.l(1, -4, ff[0], ff[1] - 2, 2, Dk(SKIN)); });
    Pt((s) => { B.r(fb[0] - 1, fb[1] - 2, 3, 2, DARK); B.r(ff[0] - 1, ff[1] - 2, 3, 2, DARK); });
    Pt((s) => { B.e(0, -8, 3.6, 4.4, SKIN); s.in(() => { B.e(-2, -6, 2, 2.5, Dk(SKIN)); }); });
    // 3. áo
    if (robe) robe.draw(cx, Pa);
    if (back && back.front) back.front(cx, Pb);
    // đầu trần: tròn, có chỏm tóc tinh linh
    Pt({ ol: SKIN[0] }, (s) => { H.l(0, -6, -1, -8, 1, Md(SKIN)); H.p(0, -9, Lt(SKIN)); });
    Pt((s) => { H.e(0.5, 0, 6.3, 5.8, SKIN); s.in(() => { H.e(-3.5, 2.5, 3, 2.5, Dk(SKIN)); }); });
    // 4. mũ
    if (hat) hat.draw(cx, Pm);
    // mặt nạ trắng (thuộc thân trần) và dấu trên mặt nạ (lớp mặt)
    Pt({ ol: only === 'than' || !hat || !hat.tint ? SKIN[0] : C[0] }, (s) => {
      H.e(2.5, 0.5, 4.3, 4.3, Md(MASK));
      s.in(() => { H.r(0, 4, 5, 1, Dk(MASK)); H.p(-1, 3, '#f2b0a8'); H.p(6, 3, '#f2b0a8'); eyes(H, ps.eyes || 'open'); });
    });
    const mk = L.masks[of.mask];
    if (mk) Pk({ ol: false, bevel: false }, (s) => { const o = s.clip; s.clip = false; mk.draw(H); s.clip = o; });
    if (hat && hat.front) hat.front(cx, Pm);
    if (hand && hand.prop && ps.free) hand.prop(cx, Ph, Math.round(hf[0]), Math.round(hf[1]));
    // tay gần vẽ sau cùng
    arm(SHN, hn, true);
  }

  // ====================================================================
  // 5. VŨ KHÍ SỐNG (hình tạm, dùng khi chưa có G.weaponArt)
  // Vẽ trong hệ F: gốc là điểm cầm, trục x chĩa về mũi vũ khí. kind: thuong | lua | doc | bang. mood: idle | attack | hurt.
  // ====================================================================
  const KIND = { fire: 'lua', poison: 'doc', ice: 'bang' };
  const kramp = (kind, base) => (kind === 'lua' ? ['#8a1c12', '#e8492a', '#ffb347'] : kind === 'doc' ? TOX : kind === 'bang' ? ICE : base);
  const kol = (kind) => (kind === 'lua' ? '#4a1010' : kind === 'doc' ? '#12331a' : kind === 'bang' ? '#1c3a70' : INK);
  // con mắt của vũ khí: (cx,cy) là tâm, m là hướng nhìn
  function wEye(S, F, t, q, kind, mood, lid) {
    S.part({ ol: false, bevel: false }, (s) => {
      const c = F.pt(t, q), cx = Math.round(c[0]), cy = Math.round(c[1]);
      const W = kind === 'lua' ? '#ffe36a' : kind === 'doc' ? '#e6f58a' : '#ffffff', pc = kind === 'bang' ? '#1c3a70' : INK;
      s.r(cx - 2, cy - 1, 5, 3, W); s.r(cx - 1, cy - 2, 3, 1, W); s.r(cx - 1, cy + 2, 3, 1, W);
      if (mood === 'hurt') { s.p(cx - 1, cy - 1, pc); s.p(cx, cy, pc); s.p(cx + 1, cy - 1, pc); s.p(cx - 1, cy + 1, pc); s.p(cx + 1, cy + 1, pc); return; }
      if (kind === 'doc' || kind === 'lua') s.r(cx + 1, cy - 1, 1, 3, pc); else s.r(cx, cy - 1, 2, 2, pc);
      if (mood === 'attack') s.p(cx + 1, cy - 1, kind === 'doc' || kind === 'lua' ? pc : SH);
      else { s.r(cx - 2, cy - 2, 5, 1, lid); s.p(cx - 2, cy - 1, lid); } // mí sụp cho vẻ ngạo
    });
  }
  function wSword(S, F, kind, mood) {
    const T = (t, q) => [t - 4, q], Lq = (a, b, w, c) => F.l(a[0], a[1], b[0], b[1], w, c);
    const B = kramp(kind, STEEL), olc = kol(kind);
    const Gd = kind === 'doc' ? PURP : kind === 'bang' ? ['#3b5fa8', '#9fd0f5', '#ffffff'] : GOLD;
    if (kind === 'lua') S.part({ ol: '#7a1810' }, (s) => { for (const t of [13, 19, 25, 31]) F.g([T(t, -4), T(t + 5, -9), T(t + 6, -4)], Md(FIRE)); });
    if (kind === 'doc') S.part({ ol: olc }, (s) => { for (const t of [14, 20, 26, 32]) F.g([T(t, 4), T(t + 2, 7), T(t + 4, 4)], Lt(B)); });
    if (kind === 'bang') S.part({ ol: olc }, (s) => { F.g([T(14, -4), T(20, -9), T(19, -4)], B); F.g([T(24, 4), T(30, 9), T(29, 4)], B); F.g([T(28, -4), T(33, -8), T(32, -4)], Lt(B)); });
    S.part({ ol: olc }, (s) => {
      F.g([T(11, -4), T(30, -5), T(38, -3.5), T(45, 0), T(38, 3.5), T(30, 5), T(11, 4)], B);
      s.in(() => {
        Lq(T(12, -4), T(31, -5), 1, Dk(B)); Lq(T(31, -5), T(44, 0), 1, Dk(B)); Lq(T(12, 3), T(31, 4), 1, Lt(B)); Lq(T(31, 4), T(42, 0), 1, Lt(B));
        Lq(T(23, 0), T(39, 0), 1, Dk(B)); Lq(T(26, 2), T(33, 2), 1, SH);
        if (kind === 'lua') { Lq(T(22, 1), T(40, 0), 1, '#fff0b0'); Lq(T(12, 0), T(22, 0), 1, Md(FIRE)); }
        if (kind === 'bang') { Lq(T(22, -2), T(27, 2), 1, SH); Lq(T(32, -2), T(36, 1), 1, SH); }
      });
    });
    wEye(S, F, 13, 0, kind, mood, B[0]);
    S.part({ ol: false, bevel: false }, (s) => { const a = T(13.5, -1), b = T(13.5, 2), c = T(14.5, 3); if (mood === 'attack') { F.r(9, -1, 2, 3, INK); } else { F.l(a[0], a[1], b[0], b[1], 1, INK); F.p(c[0], c[1], INK); } });
    S.part((s) => { F.g([T(8, -6), T(8, 6), T(13, 7.5), T(10.5, 4), T(10.5, -4), T(13, -7.5)], Gd); s.in(() => { const p = F.pt(5, 0); s.r(Math.round(p[0]) - 1, Math.round(p[1]) - 1, 2, 2, kind === 'bang' ? Md(BLU) : Md(RED)); }); });
    S.part((s) => { F.l(-2, 0, 3, 0, 2, kind === 'doc' ? WD : RED); F.p(0, 0, Md(GOLD)); });
    S.part((s) => { F.e(-4, 0, 1.5, 1.5, Gd); });
    tassel(S, F, -5, 0, 5);
    kindFx(S, F, kind, [[20, -12], [30, -11], [40, -6], [43, 4], [30, 8]]);
  }
  // tua đỏ: rủ xuống theo chiều đất chứ không theo vũ khí
  function tassel(S, F, t, q, len) {
    S.part({ ol: RED[0] }, (s) => { const a = F.pt(t, q), x = Math.round(a[0]), y = Math.round(a[1]); s.r(x, y + 1, 1, len - 1, Md(RED)); s.p(x - 1, y + len, Md(RED)); s.p(x + 1, y + len - 1, Lt(RED)); });
  }
  function kindFx(S, F, kind, pts) {
    if (kind === 'thuong') return;
    S.part({ fx: true }, (s) => {
      pts.forEach((q, i) => {
        const a = F.pt(q[0], q[1]), x = Math.round(a[0]), y = Math.round(a[1]);
        if (kind === 'lua') s.p(x, y, i % 2 ? '#ffd27a' : '#ff8a3a');
        else if (kind === 'doc') { if (i % 2) s.r(x, y, 2, 2, 'rgba(181,234,106,0.7)'); else s.p(x, y, i % 4 ? '#b5ea6a' : '#a56fd0'); }
        else if (i % 2 === 0) { s.p(x, y, SH); s.p(x - 1, y, '#bfe9ff'); s.p(x + 1, y, '#bfe9ff'); s.p(x, y - 1, '#bfe9ff'); s.p(x, y + 1, '#bfe9ff'); }
      });
    });
  }
  // Cung rồng: thân rồng uốn thành cánh cung, đầu rồng ngậm dây. pull 0..1 là độ kéo dây.
  function wBow(S, F, kind, mood, pull) {
    const C = kramp(kind, GRN), olc = kol(kind), nx = -9 - 8 * pull;
    S.part({ ol: false, bevel: false }, (s) => { F.l(-9, -16, nx, 0, 1, '#e8e2d0'); F.l(nx, 0, -9, 16, 1, '#e8e2d0'); });
    if (pull > 0.15) {
      S.part((s) => { F.l(nx, 0, nx + 21, 0, 1, WD); });
      S.part((s) => { F.g([[nx + 21, -2], [nx + 26, 0], [nx + 21, 2]], kramp(kind, STEEL)); });
      S.part({ ol: RED[0] }, (s) => { F.r(nx + 1, -1, 2, 1, Md(RED)); F.r(nx + 1, 1, 2, 1, Md(RED)); });
    }
    S.part({ ol: olc }, (s) => {
      F.pl([[-8, -17], [-4, -13], [-1, -7], [0, 0], [-1, 7], [-4, 13], [-8, 17]], 3, C);
      s.in(() => {
        F.pl([[-7, -16], [-3, -12], [0, -6], [1, 0], [0, 6], [-3, 12], [-7, 16]], 1, Md(GOLD));
        for (const q of [[-5, -14], [-2, -8], [-1, -3], [-1, 3], [-3, 9], [-6, 14]]) F.p(q[0], q[1], Dk(C));
      });
      F.r(-2, -2, 4, 5, RED); s.in(() => { F.r(-2, -2, 4, 1, Md(GOLD)); F.r(-2, 2, 4, 1, Md(GOLD)); });
    });
    S.part({ ol: olc }, (s) => { for (const q of [[-2, -12], [-1, -11], [1, -7], [2, -6], [1, 9], [2, 8], [-2, 15]]) F.p(q[0], q[1], Md(kind === 'bang' ? ['#fff', '#ffffff', '#fff'] : RED)); });
    S.part({ ol: olc }, (s) => { F.pl([[-8, 17], [-11, 18], [-12, 16]], 2, C); F.r(-13, 14, 2, 2, Md(RED)); });
    S.part({ ol: olc }, (s) => {
      F.g([[-12, -22], [-6, -23], [-3, -20], [-3, -17], [-8, -15], [-12, -17]], C);
      s.in(() => { F.r(-6, -19, 4, 1, Lt(C)); F.r(-11, -17, 6, 1, Md(GOLD)); });
      F.r(-3, -19, 2, 2, C); F.p(-2, -19, INK);
      F.p(-11, -24, Md(GOLD)); F.p(-12, -25, Md(GOLD)); F.p(-8, -24, Md(GOLD)); F.p(-8, -25, Lt(GOLD));
    });
    S.part({ ol: false, bevel: false }, (s) => {
      if (mood === 'hurt') { F.p(-8, -21, INK); F.p(-7, -20, INK); F.p(-6, -21, INK); }
      else { F.r(-8, -21, 3, 2, kind === 'lua' ? '#ffe36a' : SH); F.r(-6, -21, 1, 2, INK); if (mood !== 'attack') F.r(-9, -22, 3, 1, INK); F.p(-6, -21, INK); }
    });
    S.part({ ol: false, bevel: false }, (s) => { F.l(-1, -18, 2, -16, 1, RED[1]); F.p(3, -17, RED[1]); });
    kindFx(S, F, kind, [[4, -20], [5, -6], [4, 10], [-14, 12], [-14, -12]]);
  }
  // Giáo sống: cán tre, lưỡi lá có một mắt, tua đỏ.
  function wSpear(S, F, kind, mood) {
    const B = kramp(kind, STEEL), olc = kol(kind);
    S.part((s) => { F.l(-14, 0, 24, 0, 2, WD); s.in(() => { for (const t of [-9, 3, 15]) F.r(t, -1, 1, 2, Dk(WD)); }); });
    S.part((s) => { F.r(-16, -1, 3, 2, GOLD); });
    S.part({ ol: olc }, (s) => {
      F.g([[24, -1], [29, -5], [35, -3.5], [42, 0], [35, 3.5], [29, 5], [24, 1]], B);
      s.in(() => { F.l(26, -3, 40, 0, 1, Dk(B)); F.l(27, 3, 39, 0, 1, Lt(B)); F.l(34, 1, 38, 1, 1, SH); if (kind === 'lua') F.l(34, 0, 40, 0, 1, '#fff0b0'); });
    });
    wEye(S, F, 30, 0, kind, mood, B[0]);
    S.part({ ol: false, bevel: false }, (s) => { if (mood === 'attack') F.r(26, 0, 2, 2, INK); else { F.p(26, 0, INK); F.p(26, 1, INK); F.p(27, 2, INK); } });
    S.part((s) => { F.g([[21, -5], [24, -2], [24, 2], [21, 5], [22, 2], [22, -2]], kind === 'doc' ? PURP : GOLD); });
    S.part((s) => { F.r(19, -1, 2, 3, RED); });
    tassel(S, F, 19, 1, 6);
    kindFx(S, F, kind, [[30, -9], [38, -6], [44, 3], [33, 8], [22, -8]]);
  }
  // Búa sống: đầu to như chiêng đồng, núm chiêng là con mắt.
  function wHammer(S, F, kind, mood) {
    const B = kind === 'thuong' ? BRZ : kramp(kind, BRZ), olc = kol(kind);
    S.part((s) => { F.l(-5, 0, 14, 0, 2, WD); s.in(() => { F.r(-2, -1, 5, 2, Md(RED)); F.p(0, 0, Md(GOLD)); }); });
    S.part((s) => { F.e(-6, 0, 1.5, 1.5, GOLD); });
    S.part((s) => { F.r(11, -2, 3, 5, STEEL); });
    S.part({ ol: olc }, (s) => {
      F.e(22, 0, 9, 9, B);
      s.in(() => {
        F.e(22, 0, 7, 7, Dk(B)); F.e(22, 0, 6.2, 6.2, Md(B)); F.e(23, -1, 3.4, 3.4, Lt(B));
        for (const a of [20, 110, 200, 290]) { const q = rotv(7.8, 0, a); F.p(22 + q[0], q[1], Lt(B)); }
        const q = F.pt(26, -6); s.p(q[0], q[1], SH); s.p(q[0] + 1, q[1] + 1, SH);
      });
    });
    S.part({ ol: false, bevel: false }, (s) => {
      const c = F.pt(23, -1), x = Math.round(c[0]), y = Math.round(c[1]);
      if (mood === 'hurt') { s.p(x - 1, y - 1, INK); s.p(x, y, INK); s.p(x + 1, y - 1, INK); s.p(x - 1, y + 1, INK); s.p(x + 1, y + 1, INK); }
      else { s.r(x - 1, y - 1, 3, 3, kind === 'lua' ? '#ffe36a' : SH); s.r(x, y - 1, 2, 2, INK); if (mood !== 'attack') s.r(x - 2, y - 2, 4, 1, INK); else { s.l(x - 3, y - 4, x + 2, y - 2, 1, INK); } }
      s.r(x - 1, y + 4, 3, 1, INK); if (mood === 'attack') s.r(x - 1, y + 5, 3, 1, INK);
    });
    tassel(S, F, 12, 2, 6);
    kindFx(S, F, kind, [[30, -11], [33, 2], [26, 11], [14, -9], [12, 9]]);
  }
  const WDRAW = { sword: wSword, bow: wBow, spear: wSpear, hammer: wHammer };
  const WCACHE = new Map();
  function weaponSprite(type, kind, mood, ang, pull) {
    ang = Math.round(ang); pull = Math.round((pull || 0) * 4) / 4;
    const id = type + '|' + kind + '|' + mood + '|' + ang + '|' + pull;
    let sp = WCACHE.get(id);
    if (sp) return sp;
    if (WCACHE.size > 900) WCACHE.clear();
    const S = new Spr(128, 128, 64, 64);
    WDRAW[type](S, S.fr(0, 0, ang), kind || 'thuong', mood || 'idle', pull);
    S.finish();
    sp = S.toCanvas();
    WCACHE.set(id, sp);
    return sp;
  }

  // ====================================================================
  // 6. TƯ THẾ
  // Tư thế tự do: cho sẵn vị trí thân (x,y), góc nghiêng rot, bàn tay, bàn chân.
  // Tư thế bám vũ khí: cho vị trí và góc vũ khí, bé treo theo điểm cầm. hang: hướng treo (0 là thõng xuống, 90 là bay ngang phía sau,
  // 180 là bị hất lên trên), dist: khoảng cách vai tới điểm cầm (quá 9 là tuột tay), rot: góc thân (mặc định bằng hang).
  // ====================================================================
  const TAU = Math.PI * 2;
  const REST = { sword: { x: 12, y: -9, ang: -90 }, bow: { x: 16, y: -18, ang: 0 }, spear: { x: 11, y: -15, ang: -90 }, hammer: { x: 12, y: -10, ang: -90 } };
  const HOLD = { sword: -5, spear: -10, hammer: -5 }; // bé nắm ở đuôi chuôi, cách điểm cầm chừng này dọc theo vũ khí
  const KDEF = { pull: 0, hang: 0, stand: 0, lean: 0 };
  function kfill(k, wt) { const o = Object.assign({}, KDEF, k); if (o.dist == null) o.dist = wt === 'bow' ? 7 : 5; if (o.rot == null) o.rot = o.hang; return o; }
  function kf(keys, u, wt) {
    if (u <= keys[0][0]) return kfill(keys[0][1], wt);
    for (let i = 1; i < keys.length; i++) {
      if (u <= keys[i][0]) {
        const a = kfill(keys[i - 1][1], wt), b = kfill(keys[i][1], wt), k = (u - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]), o = {};
        for (const n in b) o[n] = typeof b[n] === 'number' ? a[n] + (b[n] - a[n]) * k : b[n];
        return o;
      }
    }
    return kfill(keys[keys.length - 1][1], wt);
  }
  // Đặt bé bám vào vũ khí. Với kiếm, giáo, búa: (k.x,k.y) là chỗ hai bàn tay bé. Với cung: là điểm cầm của cung, bé nắm chỗ lắp tên trên dây.
  // stand 0..1: 1 là bé đứng dưới đất (nghiêng lean độ), 0 là treo theo vũ khí.
  function attach(wt, k0, ps) {
    const k = k0.dist == null || k0.rot == null ? kfill(k0, wt) : k0;
    let hold, grip;
    if (wt === 'bow') { grip = [k.x, k.y]; const q = rotv(-9 - 8 * k.pull, 0, k.ang); hold = [grip[0] + q[0], grip[1] + q[1]]; }
    else { hold = [k.x, k.y]; const q = rotv(HOLD[wt], 0, k.ang); grip = [hold[0] - q[0], hold[1] - q[1]]; }
    const d = rotv(0, 1, k.hang), sh = [hold[0] + d[0] * k.dist, hold[1] + d[1] * k.dist];
    const so = rotv(0.5, -10, k.rot);
    let rx = sh[0] - so[0], ry = sh[1] - so[1], rot = k.rot;
    if (k.stand > 0) { const s = Math.min(1, k.stand); rx += ((wt === 'bow' ? Math.min(hold[0] - 4, 2) : hold[0] - 4) - rx) * s; ry += (0 - ry) * s; rot += (k.lean - rot) * s; }
    const hd = rotv(0, -18, rot);
    const low = Math.max(ry + 4 * Math.min(1, Math.abs(Math.sin(rot * D2R))), ry + hd[1] + 6);
    if (low > 0) ry -= low;
    ps.x = rx; ps.y = ry; ps.rot = rot;
    const h = rotv(hold[0] - rx, hold[1] - ry, -rot);
    if (Math.hypot(h[0] - 0.5, h[1] + 10) <= 10.5) {
      ps.hn = [h[0], h[1]]; ps.hf = wt === 'bow' ? [h[0], h[1] + 1] : [h[0] - 1, h[1] + 1]; ps.grip = true;
      ps.hands = [hold];
    } else { ps.hn = [8, -12]; ps.hf = [-6, -13]; }
    ps.w = { x: grip[0], y: grip[1], ang: k.ang, pull: k.pull, front: wt !== 'bow', mood: k.mood || 'attack' };
    ps.air = Math.min(1, Math.max(0, -ry / 14));
    return ps;
  }
  const S0 = { x: 3, y: -14, ang: -95, stand: 1 }, S1 = { x: 3, y: -14, ang: -75, stand: 1 };
  const P0 = { x: 2, y: -11, ang: -8, stand: 1 };
  const H0 = { x: 3, y: -14, ang: -85, stand: 1 };
  const B0 = { x: 15, y: -17, ang: 0, pull: 0, stand: 1 };
  const ATK = {
    sword: [
      [[0, S0], [0.22, { x: -2, y: -25, ang: -150, hang: -12 }], [0.45, { x: 9, y: -17, ang: 15, hang: 55 }], [0.6, { x: 12, y: -19, ang: 38, hang: 75 }], [0.82, { x: 8, y: -14, ang: 10, hang: 25, stand: 0.4 }], [1, S1]],
      [[0, S0], [0.22, { x: 5, y: -10, ang: 60, hang: -20, stand: 0.6 }], [0.45, { x: 8, y: -25, ang: -55, hang: 25 }], [0.6, { x: 3, y: -31, ang: -120, hang: -10 }], [0.82, { x: 3, y: -21, ang: -100, hang: 0 }], [1, S1]],
      [[0, S0], [0.2, { x: -5, y: -29, ang: -170, hang: -25 }], [0.45, { x: 10, y: -17, ang: 35, hang: 80 }], [0.6, { x: 12, y: -19, ang: 52, hang: 110 }], [0.82, { x: 8, y: -13, ang: 20, hang: 40, stand: 0.3 }], [1, S1]],
    ],
    spear: [
      [[0, P0], [0.25, { x: -5, y: -12, ang: -3, stand: 1, lean: -12 }], [0.45, { x: 9, y: -14, ang: 0, hang: 78 }], [0.62, { x: 13, y: -13, ang: 2, hang: 88 }], [0.85, { x: 5, y: -13, ang: -4, hang: 30, stand: 0.5 }], [1, P0]],
      [[0, P0], [0.25, { x: -5, y: -10, ang: -14, stand: 1, lean: -12 }], [0.45, { x: 8, y: -17, ang: -14, hang: 70 }], [0.62, { x: 12, y: -18, ang: -12, hang: 82 }], [0.85, { x: 5, y: -14, ang: -6, hang: 30, stand: 0.5 }], [1, P0]],
      [[0, P0], [0.25, { x: -7, y: -12, ang: 4, stand: 1, lean: -16 }], [0.45, { x: 12, y: -14, ang: 0, hang: 88 }], [0.62, { x: 17, y: -13, ang: 3, hang: 98 }], [0.85, { x: 6, y: -13, ang: -4, hang: 35, stand: 0.5 }], [1, P0]],
    ],
    bow: [
      [[0, B0], [0.3, { x: 20, y: -17, ang: -3, pull: 1, stand: 1, lean: -14 }], [0.42, { x: 21, y: -17, ang: 0, pull: 1, stand: 1, lean: -16 }], [0.5, { x: 23, y: -17, ang: 4, pull: 0, stand: 1, lean: 14 }], [0.75, { x: 18, y: -17, ang: -4, pull: 0, stand: 1, lean: 4 }], [1, B0]],
    ],
    hammer: [
      [[0, H0], [0.28, { x: -1, y: -27, ang: -135, hang: -18 }], [0.45, { x: 5, y: -27, ang: 42, hang: 25 }], [0.6, { x: 5, y: -27, ang: 44, hang: 180, dist: 13, rot: -20 }], [0.8, { x: 6, y: -21, ang: 10, hang: 150, dist: 8, rot: 5 }], [1, H0]],
    ],
  };
  ATK.bow[1] = ATK.bow[0]; ATK.bow[2] = ATK.bow[0].map((q) => [q[0], Object.assign({}, q[1], { ang: q[1].ang - 6 })]);
  ATK.hammer[1] = ATK.hammer[0];
  ATK.hammer[2] = [[0, H0], [0.28, { x: -3, y: -32, ang: -155, hang: -22 }], [0.45, { x: 5, y: -27, ang: 44, hang: 30 }], [0.6, { x: 5, y: -27, ang: 44, hang: 180, dist: 18, rot: -30 }], [0.8, { x: 6, y: -21, ang: 10, hang: 155, dist: 9, rot: 8 }], [1, H0]];
  const SPEC = {
    sword: [[0, { x: 3, y: -16, ang: -90, hang: 0 }], [0.15, { x: 4, y: -25, ang: -130, hang: -40 }], [0.85, { x: 4, y: -25, ang: 230, hang: 320 }], [1, { x: 3, y: -16, ang: 270, hang: 360 }]],
    spear: [[0, { x: 13, y: -13, ang: 0, hang: 88 }], [0.5, { x: 15, y: -13, ang: 2, hang: 92 }], [1, { x: 6, y: -13, ang: -4, hang: 40, stand: 0.4 }]],
    bow: [[0, { x: 13, y: -20, ang: -55, pull: 0, stand: 1 }], [0.4, { x: 14, y: -21, ang: -68, pull: 1, stand: 1, lean: -10 }], [0.55, { x: 15, y: -22, ang: -62, pull: 0, stand: 1, lean: 8 }], [1, { x: 15, y: -19, ang: -25, pull: 0, stand: 1 }]],
    // Nện đất: game nổ vòng chấn động ngay lúc bấm nên búa nện xuống từ khung đầu
    hammer: [[0, { x: 5, y: -27, ang: 44, hang: 30 }], [0.25, { x: 5, y: -27, ang: 44, hang: 180, dist: 18, rot: -30 }], [0.7, { x: 6, y: -21, ang: 10, hang: 155, dist: 9, rot: 8 }], [1, H0]],
  };
  const ATKN = { sword: 10, hammer: 14, spear: 10, bow: 12 };
  const EYE_ATK = (u) => (u > 0.3 && u < 0.85 ? 'wide' : 'open');

  function pose(key, wt, anim, f, v) {
    const ps = { x: 0, y: 0, rot: 0, f, free: true, eyes: 'open', anim };
    const R = REST[wt] || null;
    const wbob = [0, -1, -1, -2, -2, -1, -1, 0][f & 7];
    const toW = (w, dy) => (w ? [wt === 'bow' ? w.x - 9 : w.x, w.y + (dy || 0) + (wt === 'bow' ? 8 : 2)] : [5, -7]);
    switch (anim) {
      case 'idle': {
        ps.hdy = [0, 0, 1, 1, 1, 1, 0, 0][f]; if (v) ps.eyes = 'blink';
        if (R) { ps.w = { x: R.x, y: R.y + wbob, ang: R.ang + (wt === 'bow' ? 0 : [0, 1, 2, 1, 0, -1, -2, -1][f]), pull: 0, front: false, mood: 'idle' }; ps.hn = toW(ps.w); }
        return ps;
      }
      case 'gong': {
        const k = f & 1; ps.hdy = k; ps.hn = [7, -14 + k]; ps.hf = [-6, -14 + k]; ps.free = false; ps.eyes = 'hurt'; ps.ff = [3, 0]; ps.fb = [-3, 0];
        if (R) ps.w = { x: R.x + 3, y: R.y - 2 + k, ang: R.ang, pull: 0, front: false, mood: 'attack' };
        return ps;
      }
      case 'run': {
        const ph = (f / 8) * TAU, c = Math.cos(ph), s = Math.sin(ph);
        ps.rot = 12; ps.y = -[0, 1, 2, 1, 0, 1, 2, 1][f]; ps.hdy = [0, 0, -1, 0, 0, 0, -1, 0][f];
        ps.ff = [2 + 4 * c, -Math.max(0, s) * 3]; ps.fb = [-2 - 4 * c, -Math.max(0, -s) * 3]; ps.hf = [-4 + 3 * c, -7 - Math.abs(c)];
        if (R) {
          const b = [0, -1, -1, 0, 0, -1, -1, 0][f];
          ps.w = wt === 'bow' ? { x: 17, y: -18 + b, ang: -6, pull: 0, front: false, mood: 'idle' } : { x: 11, y: -14 + b * 2, ang: wt === 'hammer' ? -50 : -28, pull: 0, front: false, mood: 'idle' };
          ps.hn = toW(ps.w, -2); ps.grip = true; ps.free = true;
        } else ps.hn = [4 - 2 * c, -7];
        return ps;
      }
      case 'hurt': {
        ps.rot = -14; ps.x = -1; ps.eyes = 'hurt'; ps.hn = [6, -14]; ps.hf = [-6, -13]; ps.free = false; ps.fb = [-3, 0];
        if (R) ps.w = { x: R.x + 2, y: R.y - 3, ang: R.ang + 12, pull: 0, front: false, mood: 'hurt' };
        return ps;
      }
      case 'dodge': {
        ps.rot = f * 45; ps.pivot = true; ps.y = -[2, 5, 7, 8, 7, 5, 3, 1][f]; ps.hdy = 1; ps.eyes = 'shut';
        ps.hn = [3, -7]; ps.hf = [-3, -7]; ps.ff = [2, -2]; ps.fb = [-2, -2]; ps.free = false;
        if (R) ps.w = { x: 4, y: -11, ang: wt === 'bow' ? -90 : 0, pull: 0, front: false, mood: 'attack' };
        return ps;
      }
      case 'die': {
        const k = Math.min(1, f / 4), e = k * k;
        ps.rot = -90 * e - (f === 3 ? 8 : 0); ps.x = -2 * k; ps.y = f < 4 ? -[0, 3, 4, 2][f] : -3; ps.eyes = f < 2 ? 'hurt' : 'x';
        ps.hn = f < 4 ? [6, -14] : [4, -12]; ps.hf = f < 4 ? [-6, -13] : [-3, -13]; ps.free = false; ps.dead = f >= 4;
        if (R) { const q = Math.min(1, f / 5); ps.w = { x: R.x + 2 * q, y: R.y + ((wt === 'bow' ? -3 : wt === 'hammer' ? -10 : -7) - R.y) * q * q, ang: R.ang + (wt === 'bow' ? 90 : 92) * q * q, pull: 0, front: false, mood: 'hurt' }; }
        return ps;
      }
      case 'cast': {
        const u = (f + 0.5) / 8, up = Math.sin(Math.min(1, u * 1.4) * Math.PI);
        ps.free = false; ps.eyes = u > 0.25 && u < 0.8 ? 'shut' : 'open';
        if (key === 'healer') { ps.rot = 26 * up; ps.hn = [7, -9 - 3 * up]; ps.hf = [-2, -6]; ps.y = -Math.round(up); }
        else if (key === 'hunter') { ps.rot = 16 * up; ps.hdy = Math.round(2 * up); ps.hn = [7, -5 + up]; ps.hf = [3, -4]; }
        else if (key === 'wrestler') { ps.hn = [7, -9 - 6 * up]; ps.hf = [-6, -9 - 6 * up]; ps.y = -Math.round(3 * up); ps.ff = [3, 0]; ps.fb = [-3, 0]; ps.eyes = u > 0.25 ? 'hurt' : 'open'; }
        else { ps.free = true; ps.swing = u < 0.5 ? -4 * up : 3; ps.hn = [6, -9 - 4 * up]; ps.y = -Math.round(2 * up); }
        if (R) ps.w = { x: R.x + 1, y: R.y - 3 * up, ang: R.ang + (wt === 'bow' ? 0 : 10 * up), pull: 0, front: false, mood: u > 0.3 ? 'attack' : 'idle' };
        return ps;
      }
      case 'dash': {
        if (!R) { ps.rot = 40; ps.y = -2; return ps; }
        ps.free = false; ps.eyes = 'wide';
        return attach(wt, wt === 'bow' ? { x: 16, y: -17, ang: 0, stand: 1, lean: 20 } : { x: 10 + (f & 1), y: -12, ang: 0, hang: 86 }, ps);
      }
      case 'spec':
      case 'atk': {
        if (!R) { ps.hn = [7, -11]; ps.rot = 8; return ps; }
        const n = anim === 'spec' ? 7 : ATKN[wt], u = (f + 0.5) / n;
        const k = kf(anim === 'spec' ? SPEC[wt] : ATK[wt][v % 3], u, wt);
        ps.free = false; ps.eyes = EYE_ATK(u);
        return attach(wt, k, ps);
      }
    }
    return ps;
  }
  function finishPose(ps) {
    if (ps.pivot) { const q = rotv(0, -10, ps.rot); ps.x += -q[0]; ps.y += -10 - q[1]; }
    if (ps.dead) { ps.y = -8; }
    ps.x = Math.round(ps.x); ps.y = Math.round(ps.y);
    return ps;
  }

  // Chọn hoạt ảnh và khung hình theo trạng thái (giống cách hero_art.js chọn, để khớp nhịp đánh của game).
  function pick(o, wt) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0;
    if (o.anim) return [o.anim, o.f | 0, o.v | 0];
    if (p && p.dead) return ['die', Math.min(7, Math.floor((p.deadT || 0) / 0.075)), 0];
    if (o.dodge >= 0) return ['dodge', Math.min(7, Math.floor(o.dodge * 8)), 0];
    if (p && p.dashT > 0) return ['dash', Math.floor(t * 30) % 2, 0];
    if (p && p.specT > 0) return ['spec', Math.min(6, Math.max(0, Math.floor((1 - p.specT / 0.35) * 7))), 0];
    if (p && p.castT > 0) return ['cast', Math.min(7, Math.max(0, Math.floor((1 - p.castT / 0.4) * 8))), 0];
    if (o.atk >= 0) {
      const n = ATKN[wt] || 8, combo = p ? Math.max(0, p.comboI | 0) % 3 : Math.floor(t / 1.6) % 3;
      return ['atk', Math.min(n - 1, Math.floor(o.atk * n)), combo];
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return ['hurt', 0, 0];
    if (o.move) return ['run', Math.floor(t * 13) % 8, 0];
    if (o.gong) return ['gong', Math.floor(t * 7) % 4, 0];
    return ['idle', Math.floor(t * 6.5) % 8, t % 3.7 < 0.14 ? 1 : 0];
  }

  // ====================================================================
  // 7. DỰNG KHUNG HÌNH VÀ VẼ
  // ====================================================================
  const KCACHE = new Map();
  const TINT = { F: ['#ffffff', 0.6], I: ['#9fdcff', 0.45], P: ['#8fe04a', 0.35] };
  function kidSprite(key, of, ps, tintK, only) {
    const S = new Spr(120, 112, 60, 74);
    drawKid(S, key, of, ps, only);
    S.finish();
    return S.toCanvas(TINT[tintK] || null);
  }
  const ofKey = (of) => [of.hat, of.robe, of.back, of.hand, of.mask, of.wing ? of.wing.kind + of.wing.level : ''].join(',');
  // Trả về mọi thứ cần để vẽ một khung: hình bé, chỗ đặt, và thông tin vũ khí.
  function frame(o) {
    const key = HERO[o.key] ? o.key : 'smith';
    const wt = o.weapon && REST[o.weapon.type] ? o.weapon.type : 'none';
    const sel = pick(o, wt), of = outfitOf(key, o);
    const p = o.p, st = p && p.st, flash = !!(o.flash || (p && p.hurtT > 0));
    const tintK = flash ? 'F' : st && st.ice > 0 ? 'I' : st && st.poison > 0 ? 'P' : '';
    const id = key + '|' + ofKey(of) + '|' + wt + '|' + sel.join('|') + '|' + tintK;
    let fr = KCACHE.get(id);
    if (fr) return fr;
    if (KCACHE.size >= 1400) KCACHE.clear();
    const ps = finishPose(pose(key, wt, sel[0], sel[1], sel[2]));
    const sp = kidSprite(key, of, ps, tintK);
    fr = {
      cv: sp.cv, ox: ps.x - sp.ox, oy: ps.y - sp.oy, sh: HERO[key].shadow, dead: !!ps.dead, air: ps.air || 0,
      anim: sel[0], f: sel[1], v: sel[2], hands: ps.hands || null, tint: tintK,
      // Thông tin cho vũ khí: điểm cầm (x,y) tính từ chân bé lúc quay phải, góc (độ, 0 là chĩa về trước, âm là chĩa lên),
      // độ kéo dây, trước hay sau bé, tâm trạng.
      weapon: ps.w ? { type: wt, x: Math.round(ps.w.x), y: Math.round(ps.w.y), ang: Math.round(ps.w.ang), pull: ps.w.pull || 0, front: !!ps.w.front, mood: ps.w.mood || 'idle' } : null,
    };
    KCACHE.set(id, fr);
    return fr;
  }
  function wLook(w) {
    let el = null, stage = 0;
    if (w) {
      try { stage = G.wStage ? G.wStage(w) : (w.stage | 0); } catch (e) { stage = w.stage | 0; }
      el = w.coat || (stage > 0 ? w.branch : null) || w.el || null;
    }
    return { el, stage, kind: KIND[el] || 'thuong' };
  }
  let warnedW = false;
  // Hàm trung gian vẽ vũ khí: có G.weaponArt thì gọi nó, chưa có thì vẽ hình tạm.
  function drawWeapon(c, o, wp, t) {
    const w = o.weapon || {}, lk = wLook(w);
    if (G.weaponArt && typeof G.weaponArt.draw === 'function' && !o.plainWeapon) {
      try {
        G.weaponArt.draw(c, { type: wp.type, family: lk.el, branch: w.branch || null, stage: lk.stage, rarity: w.tier | 0, mood: wp.mood, t, weapon: w }, wp.x, wp.y, wp.ang, wp.pull);
        return;
      } catch (e) { if (!warnedW) { warnedW = true; if (window.console) console.warn('hero_tinhlinh: G.weaponArt lỗi, dùng hình tạm', e); } }
    }
    const sp = weaponSprite(wp.type, lk.kind, wp.mood, wp.ang, wp.pull);
    c.drawImage(sp.cv, wp.x - sp.ox, wp.y - sp.oy);
  }
  // Vẽ một bé (kèm vũ khí) tại chỗ c đang đứng: gốc là chân bé, đã lật theo hướng mặt.
  function drawFrame(c, o, fr, t) {
    const wp = fr.weapon;
    if (wp && !wp.front) drawWeapon(c, o, wp, t);
    c.drawImage(fr.cv, fr.ox, fr.oy);
    if (wp && wp.front) {
      drawWeapon(c, o, wp, t);
      if (fr.hands) for (const h of fr.hands) { // bàn tay bé nắm đè lên chuôi
        const x = Math.round(h[0]), y = Math.round(h[1]), g = L.hands[outfitOf(HERO[o.key] ? o.key : 'smith', o).hand], gl = g && g.glove;
        c.fillStyle = INK; c.fillRect(x - 2, y - 1, 4, 2); c.fillRect(x - 1, y - 2, 2, 4);
        c.fillStyle = gl ? gl[1] : MASK[1]; c.fillRect(x - 1, y - 1, 2, 2);
        if (gl) { c.fillStyle = gl[2]; c.fillRect(x, y - 1, 1, 1); }
      }
    }
  }

  // Chữ ký giống hệt G.art.hero cũ: (c, o) với o gồm x, y, face, key, move, t, atk, dodge, flash, alpha, weapon, helm, armor, gong, p.
  // Thêm: o.outfit = { hat, robe, back, hand, mask, wing: { kind, level } }.
  let warned = false;
  function hero(c, o) {
    let fr = null;
    try { fr = frame(o); } catch (e) {
      if (!warned) { warned = true; if (window.console) console.warn('hero_tinhlinh: dùng lại hình cũ', e); }
    }
    const A = G.art;
    if (!fr) { if (A && A.heroOld) return A.heroOld.call(A, c, o); return; }
    const x = Math.round(o.x), y = Math.round(o.y), f = o.face < 0 ? -1 : 1, t = (o.t != null ? o.t : G.time) || 0;
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (!o.noShadow) {
      const sw = fr.dead ? 12 : Math.round(fr.sh * (1 - 0.4 * fr.air)), sx = fr.dead ? x - f * 12 : x;
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(sx - sw + 2, y - 1, sw * 2 - 4, 1); c.fillRect(sx - sw, y, sw * 2, 1); c.fillRect(sx - sw + 2, y + 1, sw * 2 - 4, 1);
    }
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    try { drawFrame(c, o, fr, t); } catch (e) { if (!warned) { warned = true; if (window.console) console.warn('hero_tinhlinh: lỗi vẽ', e); } }
    if (o.gong) {
      for (let i = 0; i < 6; i++) { // hào quang lúc Gồng
        const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-10 + i * 4) + (i % 2), sy = Math.round(-4 - ph * 30);
        c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
        c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
        c.fillRect(sx, sy, 1, 4 + (i % 3));
      }
    }
    c.restore();
  }

  // ====================================================================
  // 8. XUẤT RA
  // ====================================================================
  G.tinhLinh = {
    hero, frame, pose: (key, wt, anim, f, v) => finishPose(pose(key, wt, anim, f, v)), outfitOf, HERO, ATKN,
    // info(o): thông tin vũ khí của khung hiện tại { type, x, y, ang, pull, front, mood } hoặc null
    info: (o) => { const fr = frame(o); return fr.weapon ? Object.assign({ anim: fr.anim, f: fr.f }, fr.weapon) : null; },
    // Dành cho tờ phác thảo và trang thử:
    kidSprite, weaponSprite, drawKid, Spr, layers: ['lung', 'than', 'ao', 'mu', 'mat', 'tay'],
    cacheSize: () => KCACHE.size + WCACHE.size,
    palette: { MASK, SKIN, RED, GRN, BLU, ORG, GOLD, WD, STEEL, GOURD, BRZ },
  };
  if (G.art && G.art.hero) {
    if (!G.art.heroOld) G.art.heroOld = G.art.hero;
    G.art.hero = hero;
    G.art.heroCacheSize = G.tinhLinh.cacheSize;
  }
})();
