// Bộ nút bấm trong trận: nút Đánh, Đặc biệt, kỹ năng hero, Né, bình máu, tạm dừng, ô vũ khí, cần điều khiển.
// Mọi hình được vẽ thành pixel vào canvas đệm rồi phóng to theo số nguyên, nên nét luôn sắc ở mọi cỡ màn hình.
// File này không sửa gì của game. Chỉ thêm G.btnArt:
//   G.btnArt.draw(ctx, kind, x, y, r, st)      kind: 'atk' | 'special' | 'skill' | 'dodge' | 'potion' | 'pause'
//   G.btnArt.slot(ctx, x, y, w, h, st)         ô vũ khí
//   G.btnArt.stick(ctx, cx, cy, r, dx, dy, active)   cần điều khiển
// Toạ độ là toạ độ giao diện của game (480x270), ctx là canvas giao diện đang có sẵn phép co giãn.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const B = (G.btnArt = {});
  const TAU = Math.PI * 2;
  const OUT = '#140e0c'; // màu viền đen của nét pixel
  const FONT = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ---------- màu ----------
  const rgbMemo = {};
  function rgb(c) {
    let v = rgbMemo[c];
    if (!v) { const n = parseInt(c.slice(1), 16); v = rgbMemo[c] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    return v;
  }
  function mix(a, b, t) {
    const x = rgb(a), y = rgb(b);
    const h = (i) => ('0' + Math.round(x[i] + (y[i] - x[i]) * t).toString(16)).slice(-2);
    return '#' + h(0) + h(1) + h(2);
  }
  const pal3 = (l, m, d) => ({ l, m, d });
  const BRONZE = pal3('#f6d48a', '#c88a3a', '#7a4a1e');
  const GOLD = pal3('#fff0a8', '#f0b840', '#8a5a14');
  const JADE = pal3('#bfe3ff', '#3f8be0', '#1d4a8a'); // ngọc lam: màu của mana
  const IRON = pal3('#dcd6c8', '#928c82', '#4a4640');
  const WOOD = pal3('#c89a5a', '#8a5a2e', '#4e3018');
  const STEEL = pal3('#f4f7fb', '#b8c4d2', '#6c7a8c');
  const HANDLE = pal3('#c08a4c', '#9a6a36', '#6e4524');
  // Vòng và mặt nút theo hệ. Chưa hệ thì là đồng và gỗ.
  const EL_RING = {
    none: BRONZE,
    fire: pal3('#ffd23f', '#ff7a2a', '#a8320a'),
    poison: pal3('#c2f58a', '#6fcf3a', '#2f6b1a'),
    ice: pal3('#e9f9ff', '#7fd4ff', '#2b6ea3'),
  };
  const EL_FACE = {
    none: pal3('#553c2c', '#402c20', '#2a1c14'),
    fire: pal3('#8a2a16', '#64190e', '#3e0e08'),
    poison: pal3('#2c5c20', '#1c4016', '#10280e'),
    ice: pal3('#235a8a', '#153c62', '#0c2540'),
  };
  // Màu mặt nút kỹ năng theo từng hero (cùng màu áo của hero).
  const HERO_FACE = {
    smith: pal3('#8a2a20', '#641a14', '#3e0e0c'),
    hunter: pal3('#2e6a2a', '#1e4a1c', '#102c10'),
    healer: pal3('#2a4a8a', '#1a3264', '#0e1e40'),
    wrestler: pal3('#9a4c1a', '#6e3410', '#421e08'),
  };
  // Bốn bậc: Thường, Lam, Tím, Vàng.
  const RARITY = [
    pal3('#c8ccd4', '#8a8f98', '#555a64'),
    pal3('#8ec8ff', '#3f8be0', '#1d4a8a'),
    pal3('#d0a8ff', '#9a5ae0', '#5a2a9a'),
    pal3('#fff0a8', '#f0b840', '#8a5a14'),
  ];
  B.RARITY = RARITY;
  B.RARITY_NAMES = ['Thường', 'Lam', 'Tím', 'Vàng'];

  // ---------- bảng pixel ----------
  function Buf(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  Buf.prototype.set = function (x, y, col, a) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = rgb(col), d = this.d, i = (y * this.w + x) * 4;
    if (a == null || a >= 1) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; return; }
    const da = d[i + 3] / 255, oa = a + da * (1 - a);
    if (oa <= 0) return;
    for (let k = 0; k < 3; k++) d[i + k] = (c[k] * a + d[i + k] * da * (1 - a)) / oa;
    d[i + 3] = oa * 255;
  };
  Buf.prototype.alpha = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  };
  Buf.prototype.rect = function (x, y, w, h, col, a) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col, a);
  };
  // Dán một bảng khác lên bảng này.
  Buf.prototype.put = function (o, ox, oy) {
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const i = (y * o.w + x) * 4, a = o.d[i + 3];
      if (!a) continue;
      const X = x + ox, Y = y + oy;
      if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue;
      const j = (Y * this.w + X) * 4, d = this.d;
      if (a === 255) { d[j] = o.d[i]; d[j + 1] = o.d[i + 1]; d[j + 2] = o.d[i + 2]; d[j + 3] = 255; continue; }
      const sa = a / 255, da = d[j + 3] / 255, oa = sa + da * (1 - sa);
      for (let k = 0; k < 3; k++) d[j + k] = (o.d[i + k] * sa + d[j + k] * da * (1 - sa)) / oa;
      d[j + 3] = oa * 255;
    }
  };
  // Viền đen quanh mọi điểm đã tô. diag: tính cả ô chéo (viền dày hơn ở góc).
  Buf.prototype.outline = function (col, diag) {
    const src = new Uint8ClampedArray(this.d), w = this.w, h = this.h;
    const has = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (has(x, y)) continue;
      if (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1) ||
        (diag && (has(x - 1, y - 1) || has(x + 1, y - 1) || has(x - 1, y + 1) || has(x + 1, y + 1)))) this.set(x, y, col);
    }
    return this;
  };
  // Đổi sang xám và tối đi: trạng thái không dùng được.
  Buf.prototype.dim = function () {
    const d = this.d;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const g = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      d[i] = g * 0.58 + 24; d[i + 1] = g * 0.56 + 21; d[i + 2] = g * 0.56 + 22;
      d[i + 3] = d[i + 3] * 0.88;
    }
    return this;
  };
  Buf.prototype.canvas = function () {
    const c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    const x = c.getContext('2d'), im = x.createImageData(this.w, this.h);
    im.data.set(this.d);
    x.putImageData(im, 0, 0);
    return c;
  };

  // ---------- hình vẽ bằng khối (rồi lấy mẫu thành pixel, không làm mịn) ----------
  // Toạ độ từ -1 đến 1, trục y hướng xuống. Hình đứng sau trong danh sách nằm trên.
  function inPoly(p, u, v) {
    let inside = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[i], b = p[j];
      if ((a[1] > v) !== (b[1] > v) && u < ((b[0] - a[0]) * (v - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  const poly = (pts, col) => ({ col, hit: (u, v) => inPoly(pts, u, v) });
  const rect = (x0, y0, x1, y1, col) => ({ col, hit: (u, v) => u >= x0 && u < x1 && v >= y0 && v < y1 });
  const circ = (x, y, r, col) => ({ col, hit: (u, v) => (u - x) * (u - x) + (v - y) * (v - y) <= r * r });
  const seg = (x1, y1, x2, y2, w, col) => ({
    col,
    hit: (u, v) => {
      const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy || 1;
      const t = clamp(((u - x1) * dx + (v - y1) * dy) / l, 0, 1);
      return Math.hypot(u - x1 - dx * t, v - y1 - dy * t) <= w / 2;
    },
  });
  // Cung tròn dày w, từ góc a0 đến a1 (độ, 0 là bên phải, tăng theo chiều kim đồng hồ).
  const arc = (x, y, r, w, a0, a1, col) => ({
    col,
    hit: (u, v) => {
      if (Math.abs(Math.hypot(u - x, v - y) - r) > w / 2) return false;
      let a = (Math.atan2(v - y, u - x) * 180) / Math.PI;
      a = (((a - a0) % 360) + 360) % 360;
      return a <= a1 - a0;
    },
  });
  // Trăng khuyết: trong vòng tròn 1 mà ngoài vòng tròn 2.
  const cres = (x1, y1, r1, x2, y2, r2, col) => ({
    col,
    hit: (u, v) => (u - x1) * (u - x1) + (v - y1) * (v - y1) <= r1 * r1 && (u - x2) * (u - x2) + (v - y2) * (v - y2) > r2 * r2,
  });
  // Xoay (độ), co giãn rồi dời cả nhóm hình.
  function xf(deg, s, tx, ty, list) {
    const a = (-deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
    return list.map((p) => ({
      col: p.col,
      hit: (u, v) => { const du = u - tx, dv = v - ty; return p.hit((du * c - dv * sn) / s, (du * sn + dv * c) / s); },
    }));
  }
  function raster(S, prims, pad) {
    pad = pad == null ? 1 : pad;
    const b = new Buf(S + pad * 2, S + pad * 2);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = ((x + 0.5) / S) * 2 - 1, v = ((y + 0.5) / S) * 2 - 1;
      for (let i = prims.length - 1; i >= 0; i--) if (prims[i].hit(u, v)) { b.set(x + pad, y + pad, prims[i].col); break; }
    }
    return b;
  }

  // ---------- biểu tượng ----------
  // a: bộ ba màu nhấn (màu hệ của vũ khí, hoặc vàng nhạt khi chưa hệ)
  const PLAIN = pal3('#fff6d8', '#ffd27a', '#c88a3a');
  const accent = (el) => (el && EL_RING[el] && el !== 'none' ? EL_RING[el] : PLAIN);
  function blade(el) {
    if (!el || el === 'none') return STEEL;
    const e = EL_RING[el];
    return pal3(mix(STEEL.l, e.l, 0.45), mix(STEEL.m, e.m, 0.5), mix(STEEL.d, e.d, 0.5));
  }
  const ICON = {};
  // Bốn loại vũ khí (nút Đánh và ô vũ khí)
  ICON.w_sword = function (el) {
    const s = blade(el);
    return xf(45, 1, 0, 0, [
      rect(-0.18, -0.62, 0, 0.3, s.l), rect(0, -0.62, 0.18, 0.3, s.m),
      poly([[-0.18, -0.62], [0, -1], [0, -0.62]], s.l), poly([[0, -0.62], [0, -1], [0.18, -0.62]], s.m),
      rect(-0.46, 0.28, 0.46, 0.38, GOLD.l), rect(-0.46, 0.38, 0.46, 0.46, GOLD.m),
      rect(-0.1, 0.46, 0, 0.8, HANDLE.l), rect(0, 0.46, 0.1, 0.8, HANDLE.d),
      circ(0, 0.87, 0.13, GOLD.m),
    ]);
  };
  ICON.w_bow = function (el) {
    const s = blade(el), a = accent(el);
    return xf(-45, 1, -0.08, 0.08, [
      seg(0.0, -0.84, -0.52, 0, 0.09, '#e8e0c8'), seg(0.0, 0.84, -0.52, 0, 0.09, '#e8e0c8'),
      arc(-0.55, 0, 1.0, 0.2, -57, 57, HANDLE.m), arc(-0.55, 0, 1.06, 0.08, -57, 57, HANDLE.l),
      arc(-0.55, 0, 1.0, 0.24, -12, 12, el && el !== 'none' ? a.m : '#c0392e'),
      circ(0.0, -0.84, 0.11, GOLD.m), circ(0.0, 0.84, 0.11, GOLD.m),
      rect(-0.52, -0.06, 0.66, 0.06, '#f0e0b8'),
      poly([[0.6, -0.24], [1.04, 0], [0.6, 0], ], s.l), poly([[0.6, 0], [1.04, 0], [0.6, 0.24]], s.m),
    ]);
  };
  ICON.w_spear = function (el) {
    const s = blade(el);
    return xf(45, 1, 0, 0, [
      rect(-0.075, -0.4, 0, 0.9, HANDLE.l), rect(0, -0.4, 0.075, 0.9, HANDLE.d),
      poly([[-0.075, -0.36], [-0.34, -0.08], [-0.075, -0.12]], '#e0483a'), poly([[0.075, -0.36], [0.34, -0.08], [0.075, -0.12]], '#b0322a'),
      poly([[0, -1.04], [-0.27, -0.64], [0, -0.32]], s.l), poly([[0, -1.04], [0.27, -0.64], [0, -0.32]], s.m),
      rect(-0.12, -0.42, 0.12, -0.32, GOLD.m),
      rect(-0.11, 0.84, 0.11, 0.98, GOLD.m),
    ]);
  };
  ICON.w_hammer = function (el) {
    const s = blade(el);
    return xf(40, 0.88, 0.04, 0.02, [
      rect(-0.1, -0.24, 0, 1.02, HANDLE.l), rect(0, -0.24, 0.1, 1.02, HANDLE.d),
      rect(-0.13, 0.9, 0.13, 1.04, GOLD.m),
      rect(-0.6, -0.9, 0.6, -0.24, s.m), rect(-0.6, -0.9, 0.6, -0.72, s.l), rect(-0.6, -0.4, 0.6, -0.24, s.d),
      rect(-0.74, -0.96, -0.54, -0.18, GOLD.m), rect(0.54, -0.96, 0.74, -0.18, GOLD.m),
      rect(-0.74, -0.96, -0.54, -0.8, GOLD.l), rect(0.54, -0.96, 0.74, -0.8, GOLD.l),
    ]);
  };
  // Đòn đặc biệt của từng vũ khí
  ICON.s_sword = function (el) { // Trảm Nguyệt: vệt trăng lưỡi liềm bay đi, hai bóng mờ phía sau
    const a = accent(el);
    return [
      cres(-0.62, 0, 0.62, -0.28, 0, 0.6, a.d || a.m), cres(-0.3, 0, 0.78, -0.3, 0, 0.75, a.m),
      cres(0.14, 0, 0.96, -0.4, 0, 0.92, a.m), cres(0.14, 0, 0.96, -0.24, 0, 0.94, '#ffffff'),
      rect(-1, -0.08, -0.7, 0.06, a.l),
    ];
  };
  ICON.s_bow = function (el) { // Mưa tên: ba mũi tên cắm xuống
    const a = accent(el), s = blade(el);
    const arrow = (x, y0, y1) => [
      rect(x - 0.07, y0, x + 0.07, y1 - 0.2, '#f0e0b8'),
      poly([[x - 0.07, y0], [x - 0.24, y0 - 0.16], [x - 0.24, y0 + 0.1], [x - 0.07, y0 + 0.24]], a.m),
      poly([[x + 0.07, y0], [x + 0.24, y0 - 0.16], [x + 0.24, y0 + 0.1], [x + 0.07, y0 + 0.24]], a.m),
      poly([[x - 0.24, y1 - 0.3], [x, y1], [x, y1 - 0.3]], s.l), poly([[x, y1 - 0.3], [x, y1], [x + 0.24, y1 - 0.3]], s.m),
    ];
    return xf(18, 0.96, 0, 0, [].concat(arrow(-0.58, -0.62, 0.42), arrow(0.58, -0.4, 0.62), arrow(0, -0.9, 0.98)));
  };
  ICON.s_spear = function (el) { // Phi Thương: cây giáo bay chéo lên, mũi tên cong quay về tay
    const a = accent(el), s = blade(el);
    return [
      arc(0.05, 0.25, 0.86, 0.12, 100, 250, a.m), poly([[-0.98, 0.18], [-0.66, 0.12], [-0.86, 0.46]], a.m),
    ].concat(xf(-35, 1, 0.08, -0.06, [
      rect(-0.9, -0.07, 0.36, 0, HANDLE.l), rect(-0.9, 0, 0.36, 0.07, HANDLE.d),
      poly([[1.0, 0], [0.36, -0.3], [0.2, 0]], s.l), poly([[1.0, 0], [0.36, 0.3], [0.2, 0]], s.m),
      rect(0.2, -0.11, 0.3, 0.11, GOLD.m),
    ]));
  };
  ICON.s_hammer = function (el) { // Địa Chấn: búa nện xuống bên trái, vệt nứt đất chạy sang phải, đá trồi
    const a = accent(el), s = blade(el);
    return [
      rect(-0.62, -1, -0.54, -0.42, HANDLE.l), rect(-0.54, -1, -0.46, -0.42, HANDLE.d),
      rect(-0.98, -0.5, -0.1, 0.06, s.m), rect(-0.98, -0.5, -0.1, -0.36, s.l), rect(-0.98, -0.06, -0.1, 0.06, s.d),
      rect(-1, 0.14, 1, 0.26, '#e8dcc0'),
      poly([[-0.2, 0.26], [0.1, 0.44], [0.36, 0.3], [0.62, 0.5], [1, 0.36], [1, 0.46], [0.62, 0.62], [0.36, 0.42], [0.1, 0.56], [-0.2, 0.38]], '#3a2e26'),
      poly([[0.02, 0.14], [0.14, -0.3], [0.28, 0.14]], a.m), poly([[0.4, 0.14], [0.56, -0.5], [0.72, 0.14]], a.l), poly([[0.78, 0.14], [0.9, -0.2], [1, 0.14]], a.m),
    ];
  };
  // Kỹ năng của bốn hero
  ICON.h_smith = function () { // Nung: lưỡi kiếm nung trong lửa
    const flame = [[0, -1], [0.26, -0.52], [0.52, -0.74], [0.74, -0.1], [0.66, 0.5], [0.34, 0.9], [-0.34, 0.9], [-0.66, 0.5], [-0.74, -0.1], [-0.5, -0.62], [-0.26, -0.36]];
    return [poly(flame, '#ff7a2a')].concat(xf(0, 0.68, 0, 0.26, [poly(flame, '#ffd23f')]), [
      poly([[-0.2, 0.5], [-0.2, -0.3], [0, -0.66], [0.2, -0.3], [0.2, 0.5], [0.4, 0.5], [0.4, 0.7], [0.14, 0.7], [0.14, 0.94], [-0.14, 0.94], [-0.14, 0.7], [-0.4, 0.7], [-0.4, 0.5]], '#5a1a0e'),
      rect(-0.1, -0.28, 0, 0.5, '#ffffff'), rect(0, -0.28, 0.1, 0.5, '#ffe9a3'),
      poly([[-0.1, -0.28], [0, -0.5], [0, -0.28]], '#ffffff'), poly([[0, -0.28], [0, -0.5], [0.1, -0.28]], '#ffe9a3'),
      rect(-0.32, 0.5, 0.32, 0.62, GOLD.m), rect(-0.07, 0.62, 0.07, 0.86, HANDLE.l),
    ]);
  };
  ICON.h_hunter = function () { // Đặt bẫy: bẫy kẹp há miệng, hai hàm răng cưa, đĩa đạp đỏ ở giữa
    const out = [], rad = Math.PI / 180;
    // răng của hàm dưới chĩa lên, răng của hàm trên chĩa xuống
    for (const d of [52, 76, 104, 128]) {
      const at = (deg, r, cy) => [Math.cos(deg * rad) * r, cy + Math.sin(deg * rad) * r];
      out.push(poly([at(d - 10, 0.98, -0.42), at(d + 10, 0.98, -0.42), at(d, 0.56, -0.42)], '#ffffff'));
      out.push(poly([at(-d - 10, 0.98, 0.42), at(-d + 10, 0.98, 0.42), at(-d, 0.56, 0.42)], '#e4e9f0'));
    }
    out.push(arc(0, -0.42, 1.04, 0.2, 33, 147, IRON.m), arc(0, -0.42, 1.1, 0.08, 33, 147, IRON.d));
    out.push(arc(0, 0.42, 1.04, 0.2, 213, 327, IRON.m), arc(0, 0.42, 1.1, 0.08, 213, 327, IRON.l));
    out.push(circ(0, 0, 0.2, '#e0483a'), circ(-0.05, -0.05, 0.08, '#ffb0a0'));
    out.push(circ(-0.88, 0, 0.15, GOLD.m), circ(0.88, 0, 0.15, GOLD.m), circ(-0.9, -0.03, 0.06, GOLD.l), circ(0.86, -0.03, 0.06, GOLD.l));
    return out;
  };
  ICON.h_healer = function () { // Bình thuốc: bầu hồ lô thuốc xanh, sủi bọt
    return xf(0, 1, -0.08, 0.04, [
      circ(0, 0.4, 0.54, '#b87a2c'), circ(-0.05, 0.36, 0.48, '#e8b050'),
      circ(0, -0.22, 0.32, '#b87a2c'), circ(-0.04, -0.25, 0.27, '#e8b050'),
      rect(-0.1, -0.72, 0.1, -0.46, '#e8b050'), rect(-0.15, -0.9, 0.15, -0.7, HANDLE.d),
      rect(-0.3, -0.02, 0.3, 0.1, '#d0382c'),
      circ(0, 0.44, 0.34, '#2f8a2a'), circ(0, 0.44, 0.28, '#6fcf3a'),
      rect(-0.07, 0.24, 0.07, 0.64, '#ffffff'), rect(-0.2, 0.37, 0.2, 0.51, '#ffffff'),
      circ(0.62, -0.42, 0.14, '#c2f58a'), circ(0.84, -0.78, 0.1, '#6fcf3a'), circ(0.72, 0.02, 0.08, '#6fcf3a'),
    ]);
  };
  ICON.h_wrestler = function () { // Gồng: nắm đấm siết chặt, lực toả ra xung quanh
    const out = [];
    for (const d of [-150, -120, -90, -60, -30]) {
      const c = Math.cos((d * Math.PI) / 180), s = Math.sin((d * Math.PI) / 180);
      out.push(seg(c * 0.78, 0.1 + s * 0.78, c * 1.04, 0.1 + s * 1.04, d === -90 ? 0.16 : 0.13, d % 60 ? '#ffd23f' : '#fff6d8'));
    }
    out.push(
      rect(-0.34, 0.6, 0.34, 0.98, '#c0392e'), rect(-0.34, 0.6, 0.34, 0.7, '#e0584a'),
      poly([[-0.46, -0.34], [0.46, -0.34], [0.56, -0.24], [0.56, 0.5], [0.44, 0.62], [-0.44, 0.62], [-0.56, 0.5], [-0.56, -0.24]], '#f2b888'),
      rect(-0.46, -0.34, 0.46, -0.2, '#ffe0c0'),
      rect(-0.3, -0.34, -0.22, 0.1, '#a8683c'), rect(-0.04, -0.34, 0.04, 0.1, '#a8683c'), rect(0.22, -0.34, 0.3, 0.1, '#a8683c'),
      rect(-0.56, 0.1, 0.34, 0.18, '#a8683c'), rect(-0.56, 0.18, 0.34, 0.42, '#ffd0a8'), rect(0.26, 0.18, 0.34, 0.42, '#a8683c'),
    );
    return out;
  };
  ICON.potion = function () {
    return [
      rect(-0.16, -0.94, 0.16, -0.66, HANDLE.m),
      rect(-0.28, -0.7, 0.28, -0.56, '#e6f2f6'), rect(-0.18, -0.56, 0.18, -0.2, '#b8d4de'),
      circ(0, 0.3, 0.66, '#b8d4de'), circ(0, 0.3, 0.56, '#a82a20'), circ(-0.04, 0.3, 0.5, '#e0483a'),
      rect(-0.5, 0.0, 0.5, 0.1, '#ff8a70'),
      circ(-0.26, 0.16, 0.13, '#ffd0c0'),
    ];
  };
  ICON.pause = function () {
    return [rect(-0.56, -0.62, -0.14, 0.62, '#f1ead9'), rect(0.14, -0.62, 0.56, 0.62, '#f1ead9'), rect(-0.56, 0.4, -0.14, 0.62, '#b8a888'), rect(0.14, 0.4, 0.56, 0.62, '#b8a888')];
  };
  // Né: người cuộn tròn lộn nhào và mũi tên chỉ hướng lộn. Thiết kế hướng sang phải rồi xoay theo góc.
  ICON.dodge = function (deg) {
    return xf(deg, 1, 0, 0, [
      arc(0, 0, 0.94, 0.13, 142, 218, '#b8c4d2'), arc(0, 0, 0.68, 0.12, 150, 210, '#8a96a6'),
      arc(-0.16, 0, 0.3, 0.24, 35, 300, '#f2e6c8'), arc(-0.16, 0, 0.36, 0.1, 35, 300, '#ffffff'),
      circ(-0.02, -0.34, 0.1, '#8a5a2e'), circ(0.1, 0.2, 0.19, '#f2b888'), rect(0.0, 0.1, 0.3, 0.17, '#e0483a'),
      poly([[1.02, 0], [0.42, -0.56], [0.42, 0]], '#fff0b0'), poly([[1.02, 0], [0.42, 0.56], [0.42, 0]], '#f0b840'),
    ]);
  };

  const cache = new Map();
  function memo(key, make) {
    let v = cache.get(key);
    if (!v) {
      if (cache.size > 900) cache.clear();
      v = make();
      cache.set(key, v);
    }
    return v;
  }
  B.clear = () => cache.clear();
  function iconBuf(name, S, arg) {
    return memo('i|' + name + '|' + S + '|' + arg, () => raster(S, ICON[name](arg)).outline(OUT, true));
  }

  // ---------- chữ số pixel 3x5 ----------
  const DIG = {
    0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001',
    5: '111100111001111', 6: '111100111101111', 7: '111001001010010', 8: '111101111101111', 9: '111101111001111',
    x: '000101010101000',
  };
  // Trả về bảng pixel của một dãy số, mỗi điểm phóng to s lần, có viền đen.
  function numBuf(str, s, col) {
    str = String(str);
    const w = (str.length * 4 - 1) * s, b = new Buf(w + 2, 5 * s + 2);
    for (let n = 0; n < str.length; n++) {
      const g = DIG[str[n]];
      if (!g) continue;
      for (let i = 0; i < 15; i++) if (g[i] === '1') b.rect(1 + (n * 4 + (i % 3)) * s, 1 + Math.floor(i / 3) * s, s, s, col);
    }
    return b.outline(OUT, true);
  }
  // Thẻ giá mana: giọt nước xanh và con số. lack: đang thiếu mana thì số màu đỏ.
  function costBadge(cost, lack) {
    const str = String(cost), w = 5 + str.length * 4 + 4, b = new Buf(w, 9);
    b.rect(1, 0, w - 2, 9, OUT); b.rect(0, 1, w, 7, OUT);
    b.rect(1, 1, w - 2, 7, lack ? '#3a1414' : '#10203a');
    b.rect(1, 1, w - 2, 1, lack ? '#6a2420' : '#2a5a9a');
    // giọt mana
    const dc = lack ? '#8a8f98' : '#7fd4ff';
    b.set(3, 2, dc); b.rect(2, 3, 3, 3, dc); b.set(3, 6, dc); b.set(2, 3, lack ? '#c8ccd4' : '#e9f9ff');
    const col = lack ? '#ff6a5a' : '#e9f9ff';
    for (let n = 0; n < str.length; n++) {
      const g = DIG[str[n]];
      if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') b.set(6 + n * 4 + (i % 3), 2 + Math.floor(i / 3), col);
    }
    return b;
  }

  // ---------- thân nút ----------
  // Khoảng cách tới tâm theo hình dáng nút: tròn, hoặc vuông vát góc.
  function metric(shape, R) {
    if (shape === 'sq') {
      const cut = Math.max(2, Math.round(R * 0.34));
      return (dx, dy) => { const ax = Math.abs(dx), ay = Math.abs(dy); return Math.max(ax, ay, ax + ay - (R - cut)); };
    }
    return (dx, dy) => Math.hypot(dx, dy);
  }
  const PAD = 9;
  const lipOf = (R) => (R >= 24 ? 3 : 2);
  const ringOf = (R) => (R >= 24 ? 4 : R >= 13 ? 3 : 2);
  const faceR = (R) => R - 1 - ringOf(R) - 1;
  function bright(p, t) { return pal3(mix(p.l, '#ffffff', t), mix(p.m, p.l, t * 1.6), mix(p.d, p.m, t * 1.6)); }

  // Trang trí theo hệ quanh vòng nút Đánh: lửa bốc phía trên, độc nhỏ giọt phía dưới, băng mọc gai bốn góc.
  function decor(b, el, c, cy, R, lv, fr, pal, lip) {
    const tri = (pts, col) => {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) if (inPoly(pts, x + 0.5, y + 0.5)) b.set(x, y, col);
    };
    if (el === 'fire') {
      const list = [[-34, 6, -1], [-10, 7, 1], [14, 7, -1], [36, 5, 1], [-54, 4, 1], [54, 3, -1]].slice(0, 2 + lv * 1.4);
      list.forEach((f, i) => {
        const a = (f[0] * Math.PI) / 180, bx = Math.round(c + Math.sin(a) * (R - 2)), by = Math.round(cy - Math.cos(a) * (R - 2));
        const h = f[1] + ((fr + i) % 2 ? 1 : -1) + (R >= 24 ? 1 : -2), lean = f[2] * ((fr + i) % 2 ? 1.5 : 0.5);
        tri([[bx - 3, by + 2], [bx + 3, by + 2], [bx + lean, by - h]], pal.m);
        tri([[bx - 1.5, by + 2], [bx + 1.5, by + 2], [bx + lean * 0.5, by - h * 0.5]], pal.l);
      });
    } else if (el === 'poison') {
      const list = [[-8, 7], [26, 4], [-36, 4], [48, 2], [-56, 2]].slice(0, 2 + lv);
      list.forEach((f, i) => {
        const a = (f[0] * Math.PI) / 180, bx = Math.round(c + Math.sin(a) * (R - 3)), by = Math.round(cy + Math.cos(a) * (R - 3));
        const len = f[1] + lip + (R >= 24 ? 1 : -1) + ((fr + i) % 2);
        b.rect(bx - 1, by, 3, len, pal.m);
        b.rect(bx - 2, by + len - 3, 5, 3, pal.m); b.rect(bx - 1, by + len, 3, 1, pal.m);
        b.rect(bx - 1, by, 1, len - 2, pal.l); b.set(bx - 1, by + len - 2, '#ffffff');
        b.rect(bx + 1, by + len - 2, 2, 2, pal.d);
      });
    } else if (el === 'ice') {
      const list = [[45, 1], [135, 1], [225, 1], [315, 1], [0, 0.6], [180, 0.6]].slice(0, lv >= 3 ? 6 : 4);
      list.forEach((f) => {
        const a = (f[0] * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
        const r0 = R - 3, r1 = R + (R >= 24 ? 6 : 4) * f[1], hw = (R >= 24 ? 3.2 : 2.6) * f[1];
        const base = [c + ux * r0, cy + uy * r0 + (uy > 0 ? lip : 0)], tip = [c + ux * r1, cy + uy * r1 + (uy > 0 ? lip : 0)];
        tri([[base[0] - px * hw, base[1] - py * hw], tip, base], pal.l);
        tri([[base[0] + px * hw, base[1] + py * hw], tip, base], pal.m);
      });
    }
  }

  // Dựng thân nút: bóng đổ, bề dày, vòng kim loại, mặt nút lõm, biểu tượng, thẻ giá.
  // o: { shape, R, ring, face, pressed, disabled, el, lv, fr, studs, icon, iconDy, badge, badgeAt }
  function buildBase(o) {
    const R = o.R, lip = lipOf(R), rw = ringOf(R), size = 2 * R + 2 * PAD;
    const c = PAD + R, oy = o.pressed ? lip : 0;
    const b = new Buf(size, size + lip + 2), m = metric(o.shape, R);
    const Rb = R - 1, Rf = Rb - rw - 1;
    const ring = o.pressed ? bright(o.ring, 0.3) : o.ring, face = o.pressed ? bright(o.face, 0.16) : o.face;
    const lipCol = mix(o.ring.d, '#000000', 0.5);
    if (!o.pressed) for (let y = 0; y < b.h; y++) for (let x = 0; x < size; x++) {
      for (let k = 1; k <= lip; k++) if (m(x + 0.5 - c, y + 0.5 - c - k) <= Rb) { b.set(x, y, k === lip && m(x + 0.5 - c, y + 0.5 - c - k + 1) > Rb ? mix(lipCol, '#000000', 0.35) : lipCol); break; }
    }
    if (o.el && o.el !== 'none') decor(b, o.el, c, c + oy, R, o.lv || 1, o.fr || 0, ring, o.pressed ? 0 : lip);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c, dy = y + 0.5 - c, d = m(dx, dy);
      if (d > Rb) continue;
      const h = Math.hypot(dx, dy) || 1, light = (-dx - dy) / (h * 1.4142);
      let col;
      if (d > Rb - rw) {
        const outer = Rb - d < rw / 2;
        if (outer) col = light > 0.93 ? mix(ring.l, '#ffffff', 0.6) : light > 0.2 ? ring.l : light < -0.2 ? ring.d : ring.m;
        else col = light > 0.2 ? ring.d : light < -0.2 ? mix(ring.m, ring.l, 0.6) : ring.m;
      } else if (d > Rf) col = OUT;
      else {
        const band = -Rf * 0.12;
        col = dy < band || (dy < band + 2 && ((x + y) & 1)) ? face.l : face.m;
        if (d > Rf - 2 && light > 0.1) col = face.d;
        else if (d > Rf - 1 && light < -0.4) col = mix(face.l, '#ffffff', 0.12);
      }
      b.set(x, y + oy, col);
    }
    // đinh tán bốn góc chéo trên vòng
    if (o.studs) for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const q = o.shape === 'sq' ? R - 1 - rw / 2 - Math.max(2, Math.round(R * 0.34)) / 2 : (Rb - rw / 2) * 0.7071;
      const px = Math.round(c + sx * q - 1), py = Math.round(c + sy * q - 1) + oy;
      b.rect(px, py, 2, 2, ring.d); b.set(px, py, mix(ring.l, '#ffffff', 0.5));
    }
    b.outline(OUT, false);
    if (o.icon) b.put(o.icon, c - (o.icon.w >> 1), c + oy - (o.icon.h >> 1) + (o.iconDy || 0));
    if (o.badge) {
      if (o.badgeAt === 'corner') b.put(o.badge, c + Rb - o.badge.w + 3, c + oy + Rb - o.badge.h + 3);
      else b.put(o.badge, c - (o.badge.w >> 1), c + oy + Rb - 5);
    }
    if (o.disabled) b.dim();
    // bóng đổ mờ phía dưới để nút tách khỏi nền
    for (let y = 0; y < b.h; y++) for (let x = 0; x < size; x++) {
      if (!b.alpha(x, y) && m(x + 0.5 - c, y + 0.5 - c - lip - 1) <= Rb + 1.5) b.set(x, y, '#000000', 0.32);
    }
    return { c: b.canvas(), ax: c, ay: c, lip };
  }

  // Lớp phủ đang hồi: phần còn phải chờ bị che tối, quét theo chiều kim đồng hồ từ đỉnh, có vạch sáng ở mép.
  function cdSprite(shape, R, q, N) {
    return memo('cd|' + shape + '|' + R + '|' + q, () => {
      const size = 2 * R + 2 * PAD, c = PAD + R, b = new Buf(size, size), m = metric(shape, R);
      const edge = (1 - q / N) * TAU;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c;
        if (m(dx, dy) > R - 1) continue;
        let a = Math.atan2(dx, -dy);
        if (a < 0) a += TAU;
        if (a >= edge) b.set(x, y, '#08060c', 0.6);
        // vạch sáng ở mép quét và ở đỉnh
        const h = Math.hypot(dx, dy);
        const near = (ang) => Math.abs(dx * Math.cos(ang) + dy * Math.sin(ang)) < 0.75 && dx * Math.sin(ang) - dy * Math.cos(ang) > 0;
        if (h > 1 && near(edge)) b.set(x, y, '#fff3b0', 0.95);
      }
      return { c: b.canvas(), ax: c, ay: c };
    });
  }
  // Vòng nạp quanh nút Đánh, có vạch nấc. q/N là phần đã nạp.
  function chargeSprite(R, q, N, steps, el, blink) {
    return memo('ch|' + R + '|' + q + '|' + steps + '|' + el + '|' + blink, () => {
      const size = 2 * R + 2 * PAD, c = PAD + R, b = new Buf(size, size), pal = accent(el);
      const f = q / N, full = q >= N;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy);
        if (d <= R + 1 || d > R + 5) continue;
        let a = Math.atan2(dx, -dy);
        if (a < 0) a += TAU;
        const on = a <= f * TAU;
        if (on) b.set(x, y, full ? (blink ? '#ffffff' : pal.l) : d > R + 3.2 ? pal.l : pal.m);
        else b.set(x, y, '#1c1612', 0.86);
      }
      // vạch nấc: nấc đã qua thì sáng trắng
      for (let i = 1; i <= steps; i++) {
        const a = (i / steps) * TAU, on = f >= i / steps - 1e-6;
        for (let r = R + 1; r <= R + 7; r += 0.5) for (let w = -1; w <= 1; w += 0.5) {
          const px = Math.floor(c + Math.sin(a) * r + Math.cos(a) * w), py = Math.floor(c - Math.cos(a) * r + Math.sin(a) * w);
          b.set(px, py, on ? '#ffffff' : '#8a7a66');
        }
      }
      b.outline(OUT, false);
      return { c: b.canvas(), ax: c, ay: c };
    });
  }
  // Hình trắng của nút để nháy sáng khi vừa sẵn sàng, và vòng sáng lan ra.
  function flashSprite(shape, R) {
    return memo('fl|' + shape + '|' + R, () => {
      const size = 2 * R + 2 * PAD, c = PAD + R, b = new Buf(size, size), m = metric(shape, R);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (m(x + 0.5 - c, y + 0.5 - c) <= R) b.set(x, y, '#fff8d8');
      return { c: b.canvas(), ax: c, ay: c };
    });
  }
  function ringSprite(shape, R, grow) {
    return memo('rg|' + shape + '|' + R + '|' + grow, () => {
      const size = 2 * R + 2 * PAD, c = PAD + R, b = new Buf(size, size), m = metric(shape, R);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const d = m(x + 0.5 - c, y + 0.5 - c);
        if (d > R + grow && d <= R + grow + 2) b.set(x, y, '#fff3b0');
      }
      return { c: b.canvas(), ax: c, ay: c };
    });
  }

  // ---------- đưa lên màn hình ----------
  // Tính lưới pixel: mỗi điểm vẽ ứng với k điểm thật của màn hình (k nguyên), nên hình không bị nhoè.
  function grid(ctx) {
    let a = 1, e = 0, f = 0;
    if (ctx.getTransform) { const t = ctx.getTransform(); a = Math.hypot(t.a, t.b) || 1; e = t.e; f = t.f; }
    return { a, e, f, k: Math.max(1, Math.round(a)) };
  }
  // Vẽ hình đệm sao cho điểm neo của nó nằm tại (x, y) của giao diện; ox, oy là độ lệch tính theo pixel vẽ.
  function blit(ctx, g, spr, x, y, ox, oy, alpha) {
    const k = g.k;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (alpha != null && alpha < 1) ctx.globalAlpha *= alpha;
    ctx.drawImage(spr.c, Math.round(g.a * x + g.e) + ((ox || 0) - spr.ax) * k, Math.round(g.a * y + g.f) + ((oy || 0) - spr.ay) * k, spr.c.width * k, spr.c.height * k);
    ctx.restore();
  }
  function label(ctx, s, x, y, col) {
    ctx.save();
    ctx.font = '700 6.5px ' + FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(12,8,6,0.85)';
    ctx.strokeText(s, x, y);
    ctx.fillStyle = col;
    ctx.fillText(s, x, y);
    ctx.restore();
  }

  // Nhớ trạng thái lần vẽ trước của từng nút để tự biết lúc nào nút vừa dùng lại được.
  const seen = {};
  function readyAge(id, usable, t, given) {
    let s = seen[id];
    if (!s) s = seen[id] = { usable, at: -9 };
    if (usable && !s.usable) s.at = t;
    if (t < s.at) s.at = -9; // đồng hồ bị đặt lại
    s.usable = usable;
    return t - (given != null ? given : s.at);
  }
  const elOf = (w) => (w && w.branch && G.EL && G.EL[w.branch] ? w.branch : w && EL_RING[w.branch] ? w.branch : 'none');
  const wType = (w) => (w && ICON['w_' + w.type] ? w.type : 'sword');

  // Vẽ một nút tròn (hoặc vuông vát góc với bình máu, tạm dừng).
  // st: { weapon:{type,branch,stage,rarity}, hero, pressed, disabled, cd, cdSec, cost, lack, charge, chargeSteps,
  //       dir, ready, glow, label, labelAt, count, t, alpha, id }
  B.draw = function (ctx, kind, x, y, r, st) {
    st = st || {};
    const g = grid(ctx), R = Math.max(7, Math.round((r * g.a) / g.k));
    const t = st.t != null ? st.t : G.time || 0;
    const w = st.weapon || null, el = elOf(w), lv = clamp((w && w.stage) || 1, 1, 3);
    const cd = clamp(st.cd || 0, 0, 1), pressed = !!st.pressed, disabled = !!st.disabled;
    const dimmed = disabled && cd <= 0; // đang hồi thì đã có màn tối quét, không làm xám thêm kẻo mất hình
    const shape = kind === 'potion' || kind === 'pause' ? 'sq' : 'round';
    const lack = st.lack != null ? !!st.lack : disabled && st.cost != null;
    const S = Math.max(8, 2 * faceR(R) - (kind === 'atk' ? 2 : 0));
    let key, make;
    const common = (o) => Object.assign({ shape, R, pressed, disabled: dimmed }, o);
    if (kind === 'atk') {
      const fr = el === 'none' ? 0 : Math.floor(t * 5) % 2;
      key = [kind, R, wType(w), el, lv, fr];
      make = () => common({ ring: EL_RING[el], face: EL_FACE[el], el, lv, fr, studs: el !== 'ice', icon: iconBuf('w_' + wType(w), S, el) });
    } else if (kind === 'special') {
      key = [kind, R, wType(w), el, st.cost, lack];
      make = () => common({ ring: JADE, face: EL_FACE[el], icon: iconBuf('s_' + wType(w), S, el), iconDy: st.cost != null ? -1 : 0, badge: st.cost != null ? costBadge(st.cost, lack) : null });
    } else if (kind === 'skill') {
      const hero = HERO_FACE[st.hero] ? st.hero : 'smith';
      key = [kind, R, hero, st.cost, lack];
      make = () => common({ ring: GOLD, face: HERO_FACE[hero], icon: iconBuf('h_' + hero, S, ''), iconDy: st.cost != null ? -1 : 0, badge: st.cost != null ? costBadge(st.cost, lack) : null });
    } else if (kind === 'dodge') {
      // 16 hướng. Không đẩy cần thì mũi tên chỉ sang phải.
      const di = st.dir == null || isNaN(st.dir) ? 0 : ((Math.round((st.dir / TAU) * 16) % 16) + 16) % 16;
      key = [kind, R, di];
      make = () => common({ ring: IRON, face: pal3('#4a5266', '#343a4a', '#20242e'), icon: iconBuf('dodge', S, di * 22.5) });
    } else if (kind === 'potion') {
      key = [kind, R, st.count];
      make = () => common({ ring: WOOD, face: pal3('#6a2420', '#4a1614', '#2c0c0c'), studs: true, icon: iconBuf('potion', S, ''), badge: st.count != null ? numBuf('x' + st.count, 1, '#fff3da') : null, badgeAt: 'corner' });
    } else {
      key = ['pause', R];
      make = () => common({ ring: WOOD, face: pal3('#4a4038', '#342c26', '#201a16'), studs: true, icon: iconBuf('pause', Math.max(6, S - 4), '') });
    }
    const base = memo('b|' + key.join('|') + '|' + (pressed ? 1 : 0) + (dimmed ? 1 : 0), () => buildBase(make()));
    const oy = pressed ? base.lip : 0;
    const alpha = st.alpha != null ? st.alpha : 1;
    blit(ctx, g, base, x, y, 0, 0, alpha);
    // vòng nạp (chỉ có nghĩa với nút Đánh, nhưng nút nào truyền charge cũng vẽ)
    if (st.charge > 0) {
      const N = 48, q = clamp(Math.round(st.charge * N), 1, N);
      blit(ctx, g, chargeSprite(R, q, N, Math.max(1, st.chargeSteps || 1), el, q >= N && Math.floor(t * 8) % 2 ? 1 : 0), x, y, 0, oy, alpha);
    }
    // đang hồi
    if (cd > 0) {
      const N = 60, q = clamp(Math.ceil(cd * N), 1, N);
      blit(ctx, g, cdSprite(shape, R, q, N), x, y, 0, oy, alpha);
      if (st.cdSec > 1) {
        const nb = memo('n|' + Math.ceil(st.cdSec) + '|' + (R >= 24 ? 3 : 2), () => { const b = numBuf(Math.ceil(st.cdSec), R >= 24 ? 3 : 2, '#fff3da'); return { c: b.canvas(), ax: b.w >> 1, ay: b.h >> 1 }; });
        blit(ctx, g, nb, x, y, 0, oy, alpha);
      }
    }
    // glow: nhấp nháy vòng sáng để gọi người chơi bấm (ví dụ đang đứng cạnh rương)
    if (st.glow && !disabled) blit(ctx, g, ringSprite(shape, R, 1 + (Math.floor(t * 4) % 2) * 2), x, y, 0, oy, alpha * (Math.floor(t * 4) % 2 ? 1 : 0.6));
    // vừa sẵn sàng trở lại: nháy sáng một nhịp và một vòng sáng lan ra
    const age = readyAge(st.id || kind, cd <= 0 && !disabled, t, st.ready);
    if (age >= 0 && age < 0.4 && cd <= 0 && !disabled) {
      const p = age / 0.4;
      blit(ctx, g, flashSprite(shape, R), x, y, 0, oy, alpha * 0.75 * (1 - p));
      blit(ctx, g, ringSprite(shape, R, 1 + Math.floor(p * 5)), x, y, 0, oy, alpha * (1 - p * p));
    }
    if (st.label) {
      const top = st.labelAt === 'top';
      const ly = top ? y - (R * g.k) / g.a - (kind === 'atk' && el === 'fire' ? 6.5 : 4) : y + ((R + base.lip + (st.cost != null ? 5 : 1)) * g.k) / g.a + 7;
      label(ctx, st.label, x, ly, disabled ? '#a89c8c' : '#fff3da');
    }
  };

  // ---------- ô vũ khí ----------
  // st: { weapon:{type,branch,stage,rarity}, active, pressed, disabled, cd, swap, t,
  //       icon: false (không vẽ hình vũ khí, để game tự vẽ), gem: false (không vẽ ngọc hệ) }
  function buildSlot(W, H, st, el, rar, lv) {
    const P = 4, lip = 2, b = new Buf(W + P * 2, H + P * 2 + lip), on = !!st.active, oy = st.pressed ? lip : 0;
    let ring = RARITY[rar];
    if (!on) ring = pal3(mix(ring.l, '#201a18', 0.35), mix(ring.m, '#201a18', 0.4), mix(ring.d, '#201a18', 0.4));
    if (st.pressed) ring = bright(ring, 0.3);
    const fm = mix(RARITY[rar].m, '#17131a', on ? 0.72 : 0.86), fl = mix(RARITY[rar].m, '#17131a', on ? 0.6 : 0.8);
    const inside = (x, y, n) => x >= n && y >= n && x < W - n && y < H - n && !((x === n || x === W - n - 1) && (y === n || y === H - n - 1) && n < 2);
    if (!st.pressed) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inside(x, y, 0)) b.set(P + x, P + y + lip, mix(RARITY[rar].d, '#000000', 0.55));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inside(x, y, 0)) continue;
      let col;
      if (!inside(x, y, 2)) col = y < 2 || x < 2 ? (y < 1 || x < 1 ? ring.l : ring.m) : y >= H - 1 || x >= W - 1 ? ring.d : ring.m;
      else if (!inside(x, y, 3)) col = OUT;
      else col = y < H * 0.42 || (y < H * 0.42 + 2 && ((x + y) & 1)) ? fl : fm;
      b.set(P + x, P + y + oy, col);
    }
    // đinh đồng ở bốn góc
    for (const [cx, cy] of [[1, 1], [W - 3, 1], [1, H - 3], [W - 3, H - 3]]) { b.rect(P + cx, P + cy + oy, 2, 2, BRONZE.m); b.set(P + cx, P + cy + oy, BRONZE.l); }
    b.outline(OUT, false);
    // ô đang cầm: thêm một viền sáng bên ngoài
    if (on) b.outline(mix(RARITY[rar].l, '#ffffff', 0.4), false);
    const wide = W > H * 1.35, S = Math.max(8, Math.min(H, W) - 9);
    if (st.icon !== false) {
      const ic = iconBuf('w_' + wType(st.weapon), S, el);
      b.put(ic, P + (wide ? (H >> 1) : (W >> 1)) - (ic.w >> 1), P + oy + (H >> 1) - (ic.h >> 1));
    }
    // ngọc màu hệ ở góc trên phải: số viên là mốc tiến hoá
    if (el !== 'none' && st.gem !== false) for (let i = 0; i < lv; i++) {
      const gx = P + W - 7 - i * 5, gy = P + 4 + oy;
      b.rect(gx - 1, gy, 5, 3, OUT); b.rect(gx, gy - 1, 3, 5, OUT);
      b.rect(gx, gy, 3, 3, EL_RING[el].m); b.set(gx, gy, EL_RING[el].l); b.set(gx + 1, gy - 0, EL_RING[el].l);
    }
    // dấu đổi vũ khí (hai mũi tên) ở góc dưới phải của ô chưa cầm
    if (st.swap) {
      const sx = P + W - 11, sy = P + H - 10 + oy, c1 = '#fff3da';
      b.rect(sx - 1, sy - 1, 10, 9, OUT);
      b.rect(sx, sy + 1, 6, 1, c1); b.set(sx + 5, sy, c1); b.set(sx + 5, sy + 2, c1); b.set(sx + 6, sy + 1, c1);
      b.rect(sx + 2, sy + 5, 6, 1, c1); b.set(sx + 2, sy + 4, c1); b.set(sx + 2, sy + 6, c1); b.set(sx + 1, sy + 5, c1);
    }
    if (st.disabled) b.dim();
    return { c: b.canvas(), ax: P, ay: P, lip };
  }
  B.slot = function (ctx, x, y, w, h, st) {
    st = st || {};
    const g = grid(ctx), W = Math.max(10, Math.round((w * g.a) / g.k)), H = Math.max(10, Math.round((h * g.a) / g.k));
    const wp = st.weapon || {}, el = elOf(wp), rar = clamp(Math.floor(wp.rarity || 0), 0, 3), lv = clamp(wp.stage || 1, 1, 3);
    const t = st.t != null ? st.t : G.time || 0;
    const key = ['sl', W, H, wType(wp), el, rar, lv, st.active ? 1 : 0, st.pressed ? 1 : 0, st.disabled ? 1 : 0, st.swap ? 1 : 0, st.icon === false ? 0 : 1, st.gem === false ? 0 : 1].join('|');
    const spr = memo(key, () => buildSlot(W, H, st, el, rar, lv));
    blit(ctx, g, spr, x, y, 0, 0, st.alpha);
    const oy = st.pressed ? spr.lip : 0, cd = clamp(st.cd || 0, 0, 1);
    if (cd > 0) {
      // đang hồi đổi vũ khí: màn tối rút dần từ trên xuống
      const rows = Math.max(1, Math.round(H * cd));
      const m = memo('slcd|' + W + '|' + H + '|' + rows, () => { const b = new Buf(W, H); b.rect(1, H - rows, W - 2, rows, '#08060c', 0.66); b.rect(1, H - rows, W - 2, 1, '#fff3b0', 0.9); return { c: b.canvas(), ax: 0, ay: 0 }; });
      blit(ctx, g, m, x, y, 0, oy, st.alpha);
    }
    const age = readyAge(st.id || 'slot' + Math.round(x), cd <= 0 && !st.disabled, t, st.ready);
    if (age >= 0 && age < 0.35 && cd <= 0 && !st.disabled && st.flash !== false) {
      const m = memo('slfl|' + W + '|' + H, () => { const b = new Buf(W, H); b.rect(0, 0, W, H, '#fff8d8'); return { c: b.canvas(), ax: 0, ay: 0 }; });
      blit(ctx, g, m, x, y, 0, oy, 0.6 * (1 - age / 0.35) * (st.alpha != null ? st.alpha : 1));
    }
  };

  // ---------- cần điều khiển ----------
  function buildStickBase(R) {
    const size = 2 * R + 2 * PAD, c = PAD + R, b = new Buf(size, size), Rb = R - 1, rw = 3, Rf = Rb - rw - 1;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy);
      if (d > Rb) continue;
      const light = (-dx - dy) / ((d || 1) * 1.4142);
      if (d > Rb - rw) b.set(x, y, Rb - d < rw / 2 ? (light > 0.2 ? WOOD.l : light < -0.2 ? WOOD.d : WOOD.m) : light > 0.2 ? WOOD.d : WOOD.m);
      else if (d > Rf) b.set(x, y, OUT);
      else b.set(x, y, d > Rf - 2 && light > 0.1 ? '#0c0a0a' : '#1c1614', d > Rf - 2 && light > 0.1 ? 0.7 : 0.55);
    }
    // bốn mũi tên chỉ hướng và bốn đinh đồng
    for (const [ux, uy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const tx = c + ux * (Rf - 3), ty = c + uy * (Rf - 3);
      for (let i = 0; i < 4; i++) for (let j = -i; j <= i; j++) b.set(Math.floor(tx - ux * i + uy * j - (ux > 0 ? 1 : 0)), Math.floor(ty - uy * i + ux * j - (uy > 0 ? 1 : 0)), '#e8d8b0', 0.8);
      const px = Math.round(c + ux * 0.7071 * (Rb - 1.5) - uy * 0.7071 * (Rb - 1.5) - 1), py = Math.round(c + uy * 0.7071 * (Rb - 1.5) + ux * 0.7071 * (Rb - 1.5) - 1);
      b.rect(px, py, 2, 2, BRONZE.m); b.set(px, py, BRONZE.l);
    }
    b.outline(OUT, false);
    return { c: b.canvas(), ax: c, ay: c };
  }
  function buildKnob(R, active) {
    const size = 2 * R + 8, c = R + 4, b = new Buf(size, size + 3), ring = active ? bright(BRONZE, 0.25) : BRONZE;
    const gem = active ? pal3('#d8fff0', '#5ad8b8', '#1e8a78') : pal3('#b8f0e0', '#3fb0a0', '#1a6a60');
    for (let y = 0; y < size + 3; y++) for (let x = 0; x < size; x++) if (Math.hypot(x + 0.5 - c, y + 0.5 - c - 2) <= R - 1) b.set(x, y, mix(BRONZE.d, '#000000', 0.5));
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy);
      if (d > R - 1) continue;
      const light = (-dx - dy) / ((d || 1) * 1.4142);
      if (d > R - 4) b.set(x, y, light > 0.9 ? '#ffffff' : light > 0.2 ? ring.l : light < -0.2 ? ring.d : ring.m);
      else if (d > R - 5) b.set(x, y, OUT);
      else b.set(x, y, Math.hypot(dx + R * 0.22, dy + R * 0.22) < R * 0.2 ? gem.l : light < -0.35 && d > R - 7.5 ? gem.d : gem.m);
    }
    b.outline(OUT, false);
    for (let y = 0; y < b.h; y++) for (let x = 0; x < size; x++) if (!b.alpha(x, y) && Math.hypot(x + 0.5 - c, y + 0.5 - c - 3) <= R + 1) b.set(x, y, '#000000', 0.35);
    return { c: b.canvas(), ax: c, ay: c };
  }
  // cx, cy: tâm đế. r: bán kính đế. dx, dy: độ lệch của núm (đơn vị giao diện). active: đang giữ ngón.
  B.stick = function (ctx, cx, cy, r, dx, dy, active) {
    const g = grid(ctx), R = Math.max(10, Math.round((r * g.a) / g.k)), Rk = Math.max(6, Math.round(R * 0.46));
    blit(ctx, g, memo('st|' + R, () => buildStickBase(R)), cx, cy, 0, 0, active ? 0.95 : 0.6);
    const ox = Math.round(((dx || 0) * g.a) / g.k), oy = Math.round(((dy || 0) * g.a) / g.k);
    blit(ctx, g, memo('kn|' + Rk + '|' + (active ? 1 : 0), () => buildKnob(Rk, !!active)), cx, cy, ox, oy, active ? 1 : 0.75);
  };
})();
