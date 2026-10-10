// Bộ giao diện chủ đề TRỐNG ĐỒNG ĐÔNG SƠN: đồng vàng, xanh ngọc đậm, đinh tán tròn, băng răng cưa, chim Lạc, vòng tròn đồng tâm.
// Tệp này chỉ thêm G.theme. Mọi hàm nhận toạ độ giao diện của game (480x270) và vẽ lên canvas giao diện (G.ux).
// Phần hình là pixel vẽ sẵn vào canvas đệm (vẽ một lần, dùng lại), phần chữ vẽ nét bằng G.ui.text nên dễ đọc trên điện thoại.
//   btn, sbtn, tab, round            nút to (thường / đang bấm / mờ), nút nhỏ, thẻ chuyển mục, nút tròn mặt trống
//   panel, inset, dim                khung bảng có tiêu đề, ô con trong bảng, màn tối phía sau bảng
//   bar                              thanh máu, mana, kinh nghiệm, máu trùm (có vạch khắc)
//   slot                             ô đồ viền theo bốn bậc Thường / Lam / Tím / Vàng
//   stageCard                        thẻ ải mặt trống: đã qua kèm sao / đang chọn / chưa mở
//   toast, topBar, dialog, card      dải thông báo, dải tài nguyên trên cùng, khung thoại người làng, khung thẻ màn kết quả
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const ui = G.ui;
  const T = (G.theme = {});
  const C = (T.C = {
    dk: '#1a120a', brD: '#5a3d1a', br: '#a8752f', gold: '#d9a441', hi: '#f6dc92', pat: '#3f8f7f', patL: '#6fc1a8', patD: '#1f4f4a',
    bg: '#12292a', bg2: '#17363a', cop: '#8a2f22', copL: '#b8452f', ink: '#fff0c4', sub: '#a9c2b4', text: '#f1e6c6',
  });
  const RAR = (T.RAR = ['#b9b1a2', '#4aa3ff', '#b36bff', '#ffc83d']); // viền sáng bốn bậc
  const RARD = (T.RARD = ['#6b655c', '#1f5fae', '#6a2fb0', '#a8741a']); // nền tối bốn bậc
  T.RAR_TEXT = ['#d6d2c8', '#6fb2ff', '#c88cff', '#ffd24a']; // màu chữ tên theo bậc

  // ---------- đồ vẽ pixel vào canvas đệm ----------
  let g = null;
  const cache = new Map();
  function layer(key, w, h, fn) {
    let cv = cache.get(key);
    if (!cv) {
      if (cache.size > 700) cache.clear();
      cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
      g = cv.getContext('2d'); fn(); cache.set(key, cv);
    }
    return cv;
  }
  function put(cv, x, y, alpha) {
    const c = G.ux, sm = c.imageSmoothingEnabled, ga = c.globalAlpha;
    c.imageSmoothingEnabled = false; if (alpha != null) c.globalAlpha = ga * alpha;
    c.drawImage(cv, Math.round(x), Math.round(y), cv.width, cv.height);
    c.imageSmoothingEnabled = sm; c.globalAlpha = ga;
  }
  T.clearCache = () => cache.clear();
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (x, y, c) => R(x, y, 1, 1, c);
  function hash(x, y) { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  function frame(x, y, w, h, c, t) { t = t || 1; R(x, y, w, t, c); R(x, y + h - t, w, t, c); R(x, y, t, h, c); R(x + w - t, y, t, h, c); }
  function rr(x, y, w, h, c, cut) { cut = cut == null ? 1 : cut; for (let i = 0; i < h; i++) { const d = Math.max(0, cut - i, cut - (h - 1 - i)); R(x + d, y + i, w - 2 * d, 1, c); } }
  function ell(cx, cy, rx, ry, c) { for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) { const k = 1 - (dy * dy) / (ry * ry + ry * 0.6); if (k < 0) continue; const hw = Math.round(rx * Math.sqrt(k)); R(cx - hw, cy + dy, hw * 2 + 1, 1, c); } }
  const disc = (cx, cy, r, c) => ell(cx, cy, r, r, c);
  function ring(cx, cy, r, th, c) { for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) { const d = Math.sqrt(dx * dx + dy * dy); if (d <= r + 0.4 && d > r - th + 0.4) P(cx + dx, cy + dy, c); } }
  function bmp(x, y, rows, pal, flip, s) { s = s || 1; for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const ch = rows[j][i]; if (ch === '.' || !pal[ch]) continue; R(x + (flip ? rows[j].length - 1 - i : i) * s, y + j * s, s, s, pal[ch]); } }
  function star(cx, cy, r, n, c, inner) { // ngôi sao nhiều cánh giữa mặt trống
    inner = inner || 0.45;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy); if (d > r) continue;
      let a = (Math.atan2(dy, dx) + Math.PI / 2) / (2 * Math.PI) * n; a = Math.abs((a % 1 + 1) % 1 - 0.5) * 2;
      if (d <= r * (inner + (1 - inner) * (1 - a))) P(cx + dx, cy + dy, c);
    }
  }
  const BM = {
    sword: ['.........ss.', '........sds.', '.......sds..', '......sds...', '.....swks...', '....sds.....', '.h.sds......', '.hhds.......', '..hhh.......', '.hh.hh......', 'hh..........'],
    lock: ['.aaa.', 'a...a', 'a...a', 'aaaaa', 'aa.aa', 'aa.aa', 'aaaaa'],
    lac: ['.....aa........', '....aaa....a...', 'a..aaaa...aaa..', 'aaaaaaaaaaaaaaa', '.aaaaaaaa......', '...aa.aa.......', '...a...a.......'], // chim Lạc
    coc: ['..aa.aa..', '.ahaaaha.', 'aaaaaaaaa', 'aadaaadaa', '.aa...aa.', 'aa.....aa'], // cóc ngồi góc bảng
    thuyen: ['....a...a...a...a.....', '...aaa.aaa.aaa.aaa..aa', 'a...a...a...a...a..aa.', 'aa.aaa.aaa.aaa.aaa.aa.', '.aaaaaaaaaaaaaaaaaaa..', '..aaaaaaaaaaaaaaaaa...'],
    slash: ['......aaa.', '....aaaaaa', '..aaa...aa', '.aa......a', 'aa........', 'a.........', 'aa........', '.aaa......'],
    flame: ['....a....', '...aa....', '...aaa.a.', '.a.aaaaa.', '.aaabaaa.', 'aaabbbaaa', 'aabbbbbaa', 'aabbcbbaa', '.aabbbaa.', '..aaaaa..'],
    dash: ['...a.....', '....aa...', 'aaaaaaa..', 'aaaaaaaa.', 'aaaaaaa..', '....aa...', '...a.....'],
    talk: ['.aaaaaaaaaa.', 'aaaaaaaaaaaa', 'aakkaakkaaka', 'aaaaaaaaaaaa', 'aakkkkkkaaaa', 'aaaaaaaaaaaa', '.aaaaaaaaaa.', '...aaa......', '..aa........', '.a..........'],
    star: ['...a...', '...a...', 'aaaaaaa', '.aaaaa.', '.aaaaa.', '.aa.aa.', 'a.....a'],
    boat: ['......a.....', '.....aa.....', '....aaa.....', '...aaaa.....', '..aaaaa.....', '......a.....', 'bbbbbbbbbbbb', '.bbbbbbbbbb.', '..bbbbbbbb..'],
  };
  function icon(name, cx, cy, pal, s) { const b = BM[name]; s = s || 1; bmp(Math.round(cx - (b[0].length * s) / 2), Math.round(cy - (b.length * s) / 2), b, pal, false, s); }
  function saw(x, y, w, col, up) { // băng răng cưa
    for (let i = 0; i + 4 <= w; i += 4) { if (up) { R(x + i, y + 2, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 1, y, col); } else { R(x + i, y, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 2, y + 2, col); } }
  }
  function circles(x, y, w, col, dot) { // vòng tròn có chấm giữa nối tiếp nhau
    for (let i = 0; i + 6 <= w; i += 6) { R(x + i + 1, y, 3, 1, col); R(x + i + 1, y + 4, 3, 1, col); R(x + i, y + 1, 1, 3, col); R(x + i + 4, y + 1, 1, 3, col); P(x + i + 2, y + 2, dot || col); P(x + i + 5, y + 4, col); P(x + i + 5, y, col); }
  }
  function drum(cx, cy, r, o) { // mặt trống: sao nhiều cánh và các vành đồng tâm
    o = o || {};
    const a = o.dull ? '#35524c' : C.br, b = o.dull ? '#4c6e66' : C.gold, d = o.dull ? '#1c2c2a' : C.dk, m = o.dull ? '#26403c' : (o.mid || C.patD);
    disc(cx, cy, r, d); disc(cx, cy, r - 1, a); ring(cx, cy, r - 1, 1, o.lit ? C.hi : b);
    disc(cx, cy, r - 3, d); disc(cx, cy, r - 4, m);
    if (r >= 14) { for (let k = 0; k < 16; k++) { const an = (k * Math.PI) / 8; P(cx + Math.round(Math.cos(an) * (r - 5)), cy + Math.round(Math.sin(an) * (r - 5)), b); } ring(cx, cy, r - 7, 1, a); }
    star(cx, cy, Math.round(r * 0.62), o.n || 12, o.lit ? C.hi : b, 0.5);
    disc(cx, cy, Math.round(r * 0.3), o.core || d);
  }

  // Mặt trống lớn làm hình trang trí (màn tiêu đề). alpha: độ đậm.
  T.drum = function (cx, cy, r, alpha) { put(layer('drum|' + r, r * 2 + 2, r * 2 + 2, () => { drum(r + 1, r + 1, r, { n: 14 }); ring(r + 1, r + 1, Math.round(r * 0.8), 1, C.br); for (let k = 0; k < 24; k++) { const an = (k * Math.PI) / 12; disc(r + 1 + Math.round(Math.cos(an) * r * 0.72), r + 1 + Math.round(Math.sin(an) * r * 0.72), 1, C.gold); } }), cx - r - 1, cy - r - 1, alpha); };

  // ---------- chạm ----------
  function lighten(col, k) { const n = parseInt(String(col).slice(1), 16); if (isNaN(n)) return col; const f = (v) => ('0' + Math.round(v + (255 - v) * k).toString(16)).slice(-2); return '#' + f((n >> 16) & 255) + f((n >> 8) & 255) + f(n & 255); }
  const heldIn = (x, y, w, h) => [...G.pointers.values()].some((q) => !q.role && !q.stale && G.inRect(q, x, y, w, h));
  function clicked(x, y, w, h) {
    if (G.click && G.inRect(G.click, x, y, w, h)) { G.click = null; if (G.sfx) G.sfx('ui'); return true; }
    return false;
  }
  T.hit = clicked;
  // Phản hồi chạm chung cho mọi nút (VFX Phase 5): đang giữ thì nút lún xuống (như cũ), thả tay thì nút nảy lên 1 điểm
  // trong chốc lát rồi về chỗ. key: vị trí và cỡ nút. Theo G.VFX.giaoDien (0 = không nảy).
  const PF = new Map();
  function pressFx(key, held) {
    const gd = G.VFX ? +G.VFX.giaoDien : 1;
    if (!(gd > 0)) return 0;
    const now = (window.performance && performance.now ? performance.now() : Date.now()) / 1000;
    let s = PF.get(key);
    if (!s) { if (PF.size > 300) PF.clear(); s = { h: held, up: -9 }; PF.set(key, s); }
    if (s.h && !held) s.up = now;
    s.h = held;
    const q = (now - s.up) / 0.16;
    return q >= 0 && q < 1 ? -1 : 0;
  }
  T.pressFx = pressFx;
  const txt = (s, x, y, o) => ui.text(s, x, y, o);

  // ---------- nút to ----------
  // o: { primary: nút chính (đỏ đồng), sel: đang được chọn, danger: việc nguy hiểm, disabled, size, sub, subSize, pad: nới vùng chạm, color }
  // Cao từ 22 trở lên thì có hai băng răng cưa; thấp hơn thì là nút nhỏ viền chấm. Trả về true khi vừa được bấm.
  T.btn = function (x, y, w, h, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const pad = o.pad || 0, dis = !!o.disabled, st = dis ? 2 : heldIn(x - pad, y - pad, w + pad * 2, h + pad * 2) ? 1 : 0;
    const tone = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : o.gold ? 'g' : o.purple ? 'v' : o.fill ? 'c' : 'n';
    const cv = layer('b|' + w + '|' + h + '|' + st + '|' + tone + (o.fill || ''), w, h + 3, () => {
      const yo = st === 1 ? 1 : 0, y0 = yo;
      if (st !== 1) rr(0, 2, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(0, y0, w, h, dis ? '#232c2a' : C.dk, 2);
      rr(1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : tone === 's' ? C.gold : C.br, 2);
      if (!dis && st !== 1) R(3, y0 + 1, w - 6, 1, C.hi);
      R(2, y0 + 2, w - 4, h - 4, dis ? '#2b3634' : C.dk);
      const base = { p: [C.cop, C.copL], d: ['#5a1f1a', '#7a2a22'], s: ['#2f6a60', C.pat], g: ['#6a4a12', '#8a6420'], v: ['#4a2a6a', '#6a3a9a'], c: [o.fill, lighten(o.fill || '#000000', 0.25)], n: [C.patD, C.pat] }[tone];
      const cc = dis ? '#333f3c' : base[st === 1 ? 1 : 0], tooth = dis ? '#56706a' : C.gold;
      if (h >= 22) { saw(3, y0 + 2, w - 6, tooth, false); saw(3, y0 + h - 5, w - 6, tooth, true); R(2, y0 + 5, w - 4, h - 10, cc); }
      else { R(2, y0 + 3, w - 4, h - 6, cc); for (let i = 3; i < w - 3; i += 2) { P(i, y0 + 2, tooth); P(i, y0 + h - 3, tooth); } }
      if (st === 1) R(2, y0 + (h >= 22 ? 5 : 3), w - 4, 1, 'rgba(0,0,0,0.45)');
      if (w >= 70 && h >= 16) for (const ex of [4, w - 9]) ring(ex + 2, y0 + (h >> 1), 2, 1, tooth); // đinh tán tròn hai đầu
    });
    const dy = pressFx('b' + x + '|' + y + '|' + w + '|' + h, st === 1);
    put(cv, x, y + dy);
    const y0 = y + dy + (st === 1 ? 1 : 0), size = o.size || (h >= 26 ? 10 : 9), col = dis ? '#8fa49e' : C.ink;
    if (label) txt(label, x + w / 2, y0 + h / 2 + size * 0.36 - (o.sub ? 3.5 : 0) - 0.3, { size, bold: true, align: 'center', color: col });
    if (o.sub) txt(o.sub, x + w / 2, y0 + h / 2 + 7.5, { size: o.subSize || 7, align: 'center', color: dis ? '#8fa49e' : '#e8d9a8' });
    if (o.dot) { const c = G.ux; c.beginPath(); c.arc(x + w - 3, y + 3, 3, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = C.dk; c.stroke(); }
    return !dis && clicked(x - pad, y - pad, w + pad * 2, h + pad * 2);
  };
  // ---------- nút nhỏ (Xem, Đổi, Học...) ----------
  T.sbtn = function (x, y, w, h, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const pad = o.pad == null ? 3 : o.pad, dis = !!o.disabled, st = dis ? 2 : heldIn(x - pad, y - pad, w + pad * 2, h + pad * 2) ? 1 : 0;
    const tone = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : 'n';
    const cv = layer('s|' + w + '|' + h + '|' + st + '|' + tone, w, h + 2, () => {
      const y0 = st === 1 ? 1 : 0;
      if (st !== 1) rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(0, y0, w, h, C.dk, 2); rr(1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : st === 1 || tone === 's' ? C.gold : C.br, 2);
      if (!dis) R(3, y0 + 1, w - 6, 1, C.hi);
      const base = { p: [C.cop, C.copL], d: ['#5a1f1a', '#7a2a22'], s: ['#2f6a60', C.pat], n: [C.patD, C.pat] }[tone];
      R(2, y0 + 3, w - 4, h - 6, dis ? '#333f3c' : base[st === 1 ? 1 : 0]);
      R(2, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold); R(w - 3, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold);
    });
    const dy = pressFx('s' + x + '|' + y + '|' + w + '|' + h, st === 1);
    put(cv, x, y + dy);
    const size = o.size || 8;
    if (label) txt(label, x + w / 2, y + dy + (st === 1 ? 1 : 0) + h / 2 + size * 0.36 - 0.3, { size, bold: true, align: 'center', color: dis ? '#8fa49e' : C.ink });
    if (o.dot) { const c = G.ux; c.beginPath(); c.arc(x + w - 2, y + 2, 2.6, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = C.dk; c.stroke(); }
    return !dis && clicked(x - pad, y - pad, w + pad * 2, h + pad * 2);
  };
  // Thẻ chuyển mục trong bảng (Mài / Nâng bậc / ...): thẻ đang mở màu đỏ đồng
  T.tab = function (x, y, w, h, label, active, o) { return T.btn(x, y, w, h, label, Object.assign({ primary: !!active, size: 8 }, o || {})); };

  // ---------- nút tròn mặt trống ----------
  // kind: 'talk' | 'atk' | 'skill' | 'sp' | 'dodge' | 'boat'. o: { lit, pressed, dim, label }
  T.round = function (cx, cy, r, kind, o) {
    o = o || {}; r = Math.round(r);
    const st = o.pressed ? 1 : 0, lit = !!o.lit, dull = !!o.dim && !lit;
    const sz = r * 2 + 8;
    const cv = layer('r|' + r + '|' + kind + '|' + st + '|' + (lit ? 1 : 0) + (dull ? 1 : 0), sz, sz, () => {
      const c0 = r + 3, cyy = r + 3 + st;
      if (!st) disc(c0 + 1, cyy + 2, r, 'rgba(0,0,0,0.5)');
      const mid = kind === 'atk' || kind === 'talk' || kind === 'boat' ? C.cop : kind === 'skill' ? '#7a5a14' : kind === 'sp' ? '#1f4f7a' : C.patD;
      if (lit) for (let k = 0; k < 32; k++) { const an = (k * Math.PI) / 16; P(c0 + Math.round(Math.cos(an) * (r + 2)), cyy + Math.round(Math.sin(an) * (r + 2)), C.hi); }
      drum(c0, cyy, r, { mid, lit: lit || st === 1, n: kind === 'atk' || kind === 'talk' ? 14 : 10, core: mid, dull });
      const ir = Math.round(r * 0.52);
      disc(c0, cyy, ir, dull ? '#1c2c2a' : C.dk); disc(c0, cyy, ir - 1, dull ? '#26403c' : lit ? C.copL : mid);
      const s = r >= 22 ? 2 : 1, hasLab = !!o.label;
      icon(kind === 'atk' ? 'sword' : kind === 'skill' ? 'flame' : kind === 'sp' ? 'slash' : kind === 'talk' ? 'talk' : kind === 'boat' ? 'boat' : 'dash', c0, cyy - (hasLab ? 3 : 0), { a: dull ? '#7f948e' : '#fff0c4', b: dull ? '#7f948e' : '#ffb347', c: '#fff', s: '#fff6dc', d: '#c9b383', h: C.gold, w: '#fff', k: dull ? '#26403c' : '#3a1a12' }, hasLab ? 1 : s);
    });
    const dy = pressFx('r' + Math.round(cx) + '|' + Math.round(cy) + '|' + r, st === 1);
    put(cv, cx - r - 3, cy - r - 3 + dy, dull ? 0.5 : 1);
    if (o.label) {
      const c = G.ux; ui.font(8, true); c.textAlign = 'center'; c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = 'rgba(20,10,6,0.9)'; c.strokeText(o.label, cx, cy + dy + st + 10.5);
      txt(o.label, cx, cy + dy + st + 10.5, { size: 8, bold: true, align: 'center', color: '#fff6dc', shadow: false });
    }
  };

  // ---------- khung bảng ----------
  // o: { rightPad: chừa chỗ cho nút đóng ở góc phải, plain: bảng nhỏ không có cóc và chim Lạc, noBand: không có băng vòng tròn phía dưới }
  T.panel = function (x, y, w, h, title, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    let twd = 0;
    if (title) { ui.font(11, true); twd = Math.ceil(G.ux.measureText(title).width); }
    const cv = layer('p|' + w + '|' + h + '|' + twd + '|' + (o.rightPad || 0) + (o.plain ? 'p' : '') + (o.noBand ? 'n' : ''), w + 6, h + 7, () => {
      const X = 3, Y = 3;
      R(X + 2, Y + 3, w, h, 'rgba(0,0,0,0.45)');
      R(X, Y, w, h, C.dk); R(X + 1, Y + 1, w - 2, h - 2, C.br); R(X + 1, Y + 1, w - 2, 1, C.hi); R(X + 1, Y + 1, 1, h - 2, C.gold);
      R(X + 3, Y + 3, w - 6, h - 6, C.dk); R(X + 4, Y + 4, w - 8, h - 8, C.bg);
      for (let j = 4; j < h - 4; j += 2) for (let i = 4 + (j % 4); i < w - 4; i += 4) if (hash(i, j) < 0.18) P(X + i, Y + j, C.bg2);
      const th = title ? 19 : 9;
      if (title || !o.plain) { R(X + 4, Y + th, w - 8, 1, C.br); saw(X + 6, Y + th + 1, w - 12, C.brD, false); }
      if (!o.noBand && h > 60) { circles(X + 7, Y + h - 10, w - 14, C.br, C.gold); R(X + 4, Y + h - 12, w - 8, 1, C.brD); }
      if (title && !o.plain) { // chim Lạc bay và thuyền người chèo trên băng tiêu đề
        let bx = X + 16 + twd; const end = X + w - (o.rightPad || 10);
        for (let n = 0; bx + 24 < end; n++) { if (n % 3 === 2) { bmp(bx, Y + 9, BM.thuyen, { a: C.brD }); bx += 28; } else { bmp(bx, Y + 8, BM.lac, { a: C.brD }); bx += 21; } }
      }
      // đinh tán tròn bốn góc; bảng lớn có thêm cóc ngồi
      const cp = { a: C.gold, h: C.hi, d: C.brD };
      if (!o.plain && w > 150) { bmp(X - 2, Y - 3, BM.coc, cp); bmp(X + w - 7, Y - 3, BM.coc, cp, true); bmp(X - 2, Y + h - 4, BM.coc, cp); bmp(X + w - 7, Y + h - 4, BM.coc, cp, true); }
      else for (const q of [[X + 1, Y + 1], [X + w - 4, Y + 1], [X + 1, Y + h - 4], [X + w - 4, Y + h - 4]]) { R(q[0], q[1], 3, 3, C.dk); P(q[0] + 1, q[1] + 1, C.hi); }
    });
    put(cv, x - 3, y - 3);
    if (title) txt(title, x + 9, y + 15.5, { size: 11, bold: true, color: C.hi });
  };
  // Ô con trong bảng. sel: đang chọn (viền vàng sáng). o: { col: màu viền riêng, fill }
  T.inset = function (x, y, w, h, sel, o) {
    o = o || {};
    const c = G.ux;
    c.fillStyle = o.fill || (sel ? '#2f6a60' : '#1b3a3b'); c.fillRect(x, y, w, h);
    c.fillStyle = o.col || (sel ? C.hi : C.brD);
    c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    if (sel) { c.fillStyle = C.gold; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2); c.fillRect(x + w - 2, y + 1, 1, h - 2); }
  };
  T.dim = function (a) { ui.rect(-(G.mx || 0) - 2, -(G.my || 0) - 2, 484 + (G.mx || 0) * 2, 274 + (G.my || 0) * 2, 'rgba(6,14,14,' + (a == null ? 0.6 : a) + ')'); };
  // Tấm nền nhỏ cho chữ nổi trên cảnh (tên phòng, thử thách...)
  T.plate = function (x, y, w, h) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    put(layer('pl|' + w + '|' + h, w, h, () => { rr(0, 0, w, h, C.dk, 2); rr(1, 1, w - 2, h - 2, C.br, 2); R(3, 1, w - 6, 1, C.hi); R(3, 3, w - 6, h - 6, C.bg); }), x, y);
  };

  // ---------- thanh máu, mana, kinh nghiệm, máu trùm ----------
  // kind: 'hp' | 'mana' | 'xp' | 'boss' (hoặc o.col, o.hi để tự chọn màu). label: chữ giữa thanh. o: { h, col, hi, marks: số vạch khắc }
  const BARC = { hp: ['#d0482f', '#f08a5a'], mana: ['#3f8fe0', '#8fc6ff'], xp: ['#d9a441', '#f6dc92'], boss: ['#b8452f', '#ff9a6a'] };
  // Thanh máu tụt dần (VFX Phase 5): mất máu thì phần vừa mất còn hiện màu sáng một chút rồi rút theo sau;
  // hồi máu thì phần được thêm hiện màu xanh lá rồi phần đỏ lấp dần vào, cả thanh sáng nhẹ lên.
  // o.lag: khoá riêng của thanh (tên, hoặc chính đối tượng em bé / trùm / quái) để nhớ trạng thái giữa các khung hình. Cường độ theo G.VFX.giaoDien.
  const LAG = new Map();
  const nowS = () => (window.performance && performance.now ? performance.now() : Date.now()) / 1000;
  function lagOf(id, frac) {
    const now = nowS();
    let st = LAG.get(id);
    if (!st && LAG.size > 160) for (const [k, v] of LAG) if (now - v.last > 5) LAG.delete(k); // dọn thanh của quái đã chết
    if (!st || now - st.last > 0.6) { st = { shown: frac, lag: frac, hold: 0, hit: 0, heal: 0, last: now }; LAG.set(id, st); return st; } // lâu không vẽ (thanh mới): không diễn
    const dt = Math.min(0.1, Math.max(0, now - st.last)); st.last = now;
    if (frac < st.shown - 1e-4) { st.lag = Math.max(st.lag, st.shown); st.shown = frac; st.hold = 0.42; st.hit = 0.14; }
    else if (frac > st.shown + 1e-4) { st.heal = 0.7; st.shown = Math.min(frac, st.shown + Math.max(0.12 * dt, (frac - st.shown) * Math.min(1, dt * 4))); }
    if (st.hold > 0) st.hold -= dt;
    else if (st.lag > st.shown) st.lag = Math.max(st.shown, st.lag - Math.max(0.3 * dt, (st.lag - st.shown) * 2.6 * dt));
    if (st.lag < st.shown) st.lag = st.shown;
    if (st.hit > 0) st.hit -= dt;
    if (st.heal > 0) st.heal -= dt;
    return st;
  }
  T.bar = function (x, y, w, kind, frac, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    const h = o.h || 9, cap = h >= 7 ? 7 : 2, inner = w - cap * 2;
    const gd = G.VFX ? +G.VFX.giaoDien : 1, ls = o.lag && gd > 0 && h >= 6 ? lagOf(o.lag, G.clamp(frac || 0, 0, 1)) : null;
    const trueFrac = frac;
    if (ls) frac = ls.shown;
    const fw = Math.round(inner * G.clamp(frac || 0, 0, 1)), cols = o.col ? [o.col, o.hi || lighten(o.col, 0.35)] : BARC[kind] || BARC.hp;
    if (h < 6) { // thanh mỏng (dấu ấn, kinh nghiệm nhỏ): viền tối, hai đầu đồng
      const iw = Math.round((w - 2) * G.clamp(frac || 0, 0, 1));
      put(layer('barS|' + w + '|' + h + '|' + cols[0] + '|' + iw, w, h, () => { R(0, 0, w, h, C.dk); R(1, 1, w - 2, h - 2, '#0d1716'); R(1, 1, iw, h - 2, cols[0]); if (h >= 4) R(1, 1, iw, 1, cols[1]); R(0, 0, 1, h, C.br); R(w - 1, 0, 1, h, C.br); }), x, y);
      return;
    }
    const cv = layer('bar|' + w + '|' + h + '|' + cols[0] + '|' + fw + '|' + (o.marks || 10), w, h + 1, () => {
      rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 1);
      rr(0, 0, w, h, C.dk, 1); rr(1, 1, w - 2, h - 2, C.br, 1); R(2, 1, w - 4, 1, C.hi);
      R(cap, 2, inner, h - 4, '#0d1716');
      R(cap, 2, fw, h - 4, cols[0]); R(cap, 2, fw, 1, cols[1]);
      const n = o.marks || 10; // vạch khắc từng phần mười
      if (h >= 6) for (let k = 1; k < n; k++) { const px = cap + Math.round((inner * k) / n); P(px, 2, C.dk); P(px, h - 3, C.dk); if (k * 2 === n) R(px, 2, 1, h - 4, 'rgba(0,0,0,0.5)'); }
      if (cap >= 7) for (const ex of [2, w - 6]) { R(ex, (h >> 1) - 1, 4, 3, C.dk); P(ex + 1, h >> 1, C.gold); P(ex + 2, h >> 1, C.gold); } // đinh tán hai đầu
    });
    put(cv, x, y);
    if (ls) {
      const c = G.ux, ga = c.globalAlpha, lw = Math.round(inner * G.clamp(ls.lag, 0, 1)), tw = Math.round(inner * G.clamp(trueFrac || 0, 0, 1));
      if (lw > fw) { // phần vừa mất: chớp trắng rồi vàng nhạt, rút dần về
        c.fillStyle = ls.hit > 0 ? '#fff6e0' : '#ffd98a'; c.globalAlpha = ga * Math.min(1, 0.9 * gd);
        c.fillRect(x + cap + fw, y + 2, lw - fw, h - 4);
        c.fillStyle = '#ffffff'; c.globalAlpha = ga * 0.5 * Math.min(1, gd); c.fillRect(x + cap + fw, y + 2, lw - fw, 1);
      }
      if (tw > fw) { // phần đang hồi: xanh lá, lấp dần
        c.fillStyle = '#7fe060'; c.globalAlpha = ga * Math.min(1, 0.85 * gd); c.fillRect(x + cap + fw, y + 2, tw - fw, h - 4);
        c.fillStyle = '#d8ffc0'; c.globalAlpha = ga * Math.min(1, gd); c.fillRect(x + cap + fw, y + 2, tw - fw, 1);
      }
      if (ls.heal > 0 && fw > 0) { c.fillStyle = '#c8ffb0'; c.globalAlpha = ga * 0.3 * Math.min(1, gd) * Math.sin((ls.heal / 0.7) * Math.PI); c.fillRect(x + cap, y + 2, fw, h - 4); }
      if (ls.hit > 0 && fw > 0) { c.fillStyle = '#ffffff'; c.globalAlpha = ga * 0.35 * Math.min(1, gd) * (ls.hit / 0.14); c.fillRect(x + cap, y + 2, fw, h - 4); }
      c.globalAlpha = ga;
    }
    if (label) txt(label, x + w / 2, y + h / 2 + 2.6, { size: o.size || 6.5, bold: true, align: 'center', color: '#fff' });
  };
  T.lagOf = lagOf; // thanh máu nhỏ trên đầu quái (js/stage.js) dùng chung cách tụt dần

  // ---------- ô đồ bốn bậc ----------
  // rar: 0 Thường, 1 Lam, 2 Tím, 3 Vàng. o: { sel, dim }. Hình món đồ do nơi gọi vẽ lên sau, tâm tại (x + s/2, y + s/2).
  T.slot = function (x, y, s, rar, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); s = Math.round(s); rar = G.clamp(rar | 0, 0, 3);
    const cv = layer('sl|' + s + '|' + rar + '|' + (o.sel ? 1 : 0), s + 2, s + 3, () => {
      const X = 1, Y = 1;
      rr(X, Y + 1, s, s, 'rgba(0,0,0,0.5)', 2);
      rr(X, Y, s, s, C.dk, 2); rr(X + 1, Y + 1, s - 2, s - 2, C.br, 2); R(X + 3, Y + 1, s - 6, 1, C.hi);
      R(X + 3, Y + 3, s - 6, s - 6, RARD[rar]); frame(X + 3, Y + 3, s - 6, s - 6, RAR[rar]); R(X + 5, Y + 5, s - 10, s - 10, C.bg);
      for (const q of [[X + 2, Y + 2], [X + s - 4, Y + 2], [X + 2, Y + s - 4], [X + s - 4, Y + s - 4]]) R(q[0], q[1], 2, 2, RAR[rar]); // bốn đinh tán màu bậc
      if (rar === 3 && s >= 20) saw(X + 5, Y + 5, s - 10, C.gold, false);
      if (o.sel) frame(X - 1, Y - 1, s + 2, s + 2, C.hi);
    });
    put(cv, x - 1, y - 1, o.dim ? 0.5 : 1);
  };
  T.swordIcon = function (cx, cy) { put(layer('ic|sword', 12, 11, () => bmp(0, 0, BM.sword, { s: '#f4f0e6', d: '#9fb0bd', h: '#e0a63a', w: '#ffffff', k: '#16131a' })), cx - 6, cy - 5); };

  // ---------- sao ----------
  T.stars = function (cx, y, n, of, o) {
    o = o || {}; of = of || 3;
    const size = o.size || 8;
    txt('★'.repeat(n) + '☆'.repeat(Math.max(0, of - n)), cx, y, { size, align: 'center', color: o.color || '#ffd23f' });
  };

  // ---------- thẻ ải mặt trống ----------
  // st: 'done' đã qua (kèm sao) | 'open' đã mở, chưa qua | 'sel' đang chọn | 'lock' chưa mở. o: { boss: ải trùm (trống to hơn), r, noClick }
  // (x, y, w, h) là vùng chạm; mặt trống nằm giữa phía trên, sao nằm dưới. Trả về true khi được bấm (kể cả ải chưa mở thì không).
  T.stageCard = function (x, y, w, h, label, st, stars, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y);
    const r = o.r || (o.boss ? 17 : 15), sel = st === 'sel', lock = st === 'lock';
    const cw = r * 2 + 18, chh = r * 2 + 10;
    const cv = layer('sc|' + r + '|' + st + '|' + (o.boss ? 1 : 0), cw, chh, () => {
      const cx = cw >> 1, cy = r + 4;
      disc(cx + 1, cy + 2, r, 'rgba(0,0,0,0.5)');
      if (sel) { for (let k = 0; k < 24; k++) { const an = (k * Math.PI) / 12; P(cx + Math.round(Math.cos(an) * (r + 3)), cy + Math.round(Math.sin(an) * (r + 3)), C.hi); } ring(cx, cy, r + 1, 1, C.hi); }
      for (const sx of [cx - r - 5, cx + r]) { R(sx, cy - 4, 6, 9, lock ? '#1c2c2a' : C.dk); R(sx + 1, cy - 3, 4, 7, lock ? '#35524c' : C.br); R(sx + 2, cy - 2, 2, 5, lock ? '#26403c' : C.patD); } // quai trống
      drum(cx, cy, r, { dull: lock, lit: sel, mid: sel || o.boss ? C.cop : C.patD, n: o.boss ? 14 : 12 });
      disc(cx, cy, Math.min(7, Math.round(r * 0.5)), lock ? '#1c2c2a' : C.dk);
      if (lock) bmp(cx - 2, cy - 3, BM.lock, { a: '#7f948e' });
    });
    const cx = x + w / 2, top = y + (o.top || 0);
    put(cv, Math.round(cx - cw / 2), top);
    const cy = top + r + 4;
    if (!lock) {
      const big = r >= 14, ls = big ? (String(label).length > 1 ? 9 : 11) : 8;
      txt(String(label), cx, cy + ls * 0.35, { size: ls, bold: true, align: 'center', color: C.ink });
      if (o.noStars) { /* nơi gọi tự vẽ sao */ }
      else if (st !== 'open' || stars > 0) T.stars(cx, top + r * 2 + (big ? 14 : 12), stars || 0, 3, { size: big ? 8 : 6.5 });
      else if (st === 'open') txt('mới', cx, top + r * 2 + (big ? 14 : 12), { size: big ? 7 : 6.5, bold: true, align: 'center', color: '#9be07a' });
    } else if (r >= 14) txt('chưa mở', cx, top + r * 2 + 14, { size: 6.5, align: 'center', color: '#8fa49e' });
    return !o.noClick && !lock && clicked(x, y, w, h);
  };

  // ---------- dải thông báo ----------
  // o: { size, center: chữ ở giữa, col: màu chữ }
  // o.age, o.left (giây đã hiện, giây còn lại): dải nảy xuống một nhịp khi hiện, mờ dần khi sắp tắt (theo G.VFX.giaoDien).
  T.toast = function (x, y, w, text, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    const gd = G.VFX ? +G.VFX.giaoDien : 1, c0 = G.ux, ga0 = c0.globalAlpha;
    if (o.age != null && gd > 0) {
      const a = o.age;
      y += a < 0.14 ? -Math.round(5 * (1 - a / 0.14)) : a < 0.26 ? 1 : 0;
      c0.globalAlpha = ga0 * Math.min(a < 0.12 ? 0.3 + (a / 0.12) * 0.7 : 1, o.left != null && o.left < 0.3 ? Math.max(0, o.left / 0.3) : 1);
    }
    try { toastBody(x, y, w, text, o); } finally { c0.globalAlpha = ga0; }
  };
  function toastBody(x, y, w, text, o) {
    const h = 18;
    const cv = layer('t|' + w, w, h + 2, () => {
      for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0, ins = Math.max(0, d - 2); R(ins, j + 2, w - ins * 2, 1, 'rgba(0,0,0,0.4)'); }
      for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0, ins = Math.max(0, d - 2); R(ins, j, w - ins * 2, 1, C.dk); R(ins + 1, j, w - ins * 2 - 2, 1, j === 0 || j === h - 1 ? C.dk : C.br); }
      R(8, 1, w - 16, 1, C.hi);
      R(12, 3, w - 24, h - 6, C.patD); frame(12, 3, w - 24, h - 6, C.dk);
      ring(6, 9, 2, 1, C.hi); ring(w - 7, 9, 2, 1, C.hi);
    });
    put(cv, x, y);
    const size = o.size || 8.5;
    txt(text, x + w / 2, y + 9 + size * 0.36, { size, bold: true, align: 'center', color: o.col || C.ink });
  }
  // Rộng vừa đủ chữ, đặt giữa quanh cx
  T.toastFit = function (cx, y, text, o) {
    o = o || {};
    ui.font(o.size || 8.5, true);
    const w = Math.min(470, Math.ceil(G.ux.measureText(text).width) + 40);
    T.toast(G.clamp(cx - w / 2, 2, 478 - w), y, w, text, o);
  };

  // ---------- dải tài nguyên trên cùng ----------
  // parts: [[chữ, màu], ...] xếp từ trái; right: chữ bên phải (tên hero, cấp)
  T.TOP_H = 15;
  T.topBar = function (items, right) {
    const mx = Math.ceil(G.mx || 0), w = 480 + mx * 2;
    put(layer('top|' + w, w, 17, () => {
      R(0, 0, w, 14, 'rgba(13,26,26,0.93)'); R(0, 14, w, 1, C.br); R(0, 15, w, 1, C.dk);
      for (let i = 2; i < w - 4; i += 8) { P(i, 13, C.brD); P(i + 1, 12, C.brD); P(i + 2, 13, C.brD); } // răng cưa nhỏ sát mép
    }), -mx, 0);
    T.resRow(items, 6, 10.5, { size: 7.5, gap: 8 });
    if (right) oldText(right, 474, 10.5, { size: 7.5, bold: true, align: 'right', color: C.hi });
  };

  // ---------- khung thoại của người làng ----------
  // Khung chữ có thẻ tên bằng đồng ở góc trên trái. Trả về chiều cao khung. o: { size, face(ctx, cx, cy): hàm vẽ khuôn mặt }
  T.dialog = function (x, y, w, name, text, o) {
    o = o || {};
    const size = o.size || 8, lines = ui.wrap(text, w - 14, size, true), h = Math.max(24, lines.length * (size + 3) + 15);
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    ui.font(7.5, true);
    const nw = name ? Math.ceil(G.ux.measureText(name).width) + 12 : 0;
    put(layer('dlg|' + w + '|' + h + '|' + nw, w + 2, h + 10, () => {
      const Y = 7;
      rr(1, Y + 2, w, h, 'rgba(0,0,0,0.45)', 2);
      rr(0, Y, w, h, C.dk, 2); rr(1, Y + 1, w - 2, h - 2, C.br, 2); R(3, Y + 1, w - 6, 1, C.hi);
      R(2, Y + 2, w - 4, h - 4, '#f3e8c8'); frame(3, Y + 3, w - 6, h - 6, '#d9c89a');
      for (const q of [[3, Y + 3], [w - 5, Y + 3], [3, Y + h - 5], [w - 5, Y + h - 5]]) R(q[0], q[1], 2, 2, C.br);
      if (nw) { rr(6, 0, nw, 12, C.dk, 2); rr(7, 1, nw - 2, 10, C.br, 1); R(8, 2, nw - 4, 8, C.patD); R(9, 1, nw - 6, 1, C.hi); }
      // đuôi chỉ xuống người đang nói
      const tx = o.tail == null ? 18 : o.tail; if (tx >= 0) for (let i = 0; i < 5; i++) { R(tx + i, Y + h - 1 + i, 9 - i * 2 > 0 ? 9 - i * 2 : 1, 1, i === 0 ? '#f3e8c8' : C.dk); if (9 - i * 2 > 2) R(tx + i + 1, Y + h - 1 + i, 7 - i * 2, 1, '#f3e8c8'); }
    }), x, y - 7);
    if (name) txt(name, x + 6 + nw / 2, y + 1.6, { size: 7.5, bold: true, align: 'center', color: C.hi });
    lines.forEach((l, i) => txt(l, x + 7, y + 8 + size + i * (size + 3), { size, bold: true, color: '#2a1a14', shadow: false }));
    return h;
  };

  // ---------- khung thẻ ở màn kết quả, thẻ phần thưởng ----------
  // o: { rar: viền theo bậc 0..3, sel, title: chữ nhỏ trên đầu thẻ }
  T.card = function (x, y, w, h, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const rar = o.rar == null ? -1 : G.clamp(o.rar | 0, 0, 3), st = o.sel ? 1 : 0;
    put(layer('cd|' + w + '|' + h + '|' + rar + '|' + st, w + 2, h + 3, () => {
      const X = 1, Y = 1, edge = rar >= 0 ? RAR[rar] : st ? C.hi : C.br;
      rr(X, Y + 2, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(X, Y, w, h, C.dk, 2); rr(X + 1, Y + 1, w - 2, h - 2, edge, 2); if (rar < 0) R(X + 3, Y + 1, w - 6, 1, C.hi);
      R(X + 2, Y + 2, w - 4, h - 4, C.dk); R(X + 3, Y + 3, w - 6, h - 6, st ? '#2f6a60' : rar >= 0 ? C.bg2 : '#1b3a3b');
      if (h >= 30) { saw(X + 4, Y + 3, w - 8, rar >= 0 ? RARD[rar] : C.brD, false); saw(X + 4, Y + h - 6, w - 8, rar >= 0 ? RARD[rar] : C.brD, true); }
      for (const q of [[X + 3, Y + 3], [X + w - 5, Y + 3], [X + 3, Y + h - 5], [X + w - 5, Y + h - 5]]) R(q[0], q[1], 2, 2, edge);
    }), x - 1, y - 1);
    if (o.title) txt(o.title, x + 7, y + 12, { size: 6.5, color: C.sub });
  };

  // ---------- tài nguyên hiện bằng biểu tượng, không dùng chữ ----------
  // Mỗi tài nguyên một hình pixel 7x7. Chạm vào biểu tượng thì hiện tên trong chốc lát.
  const RES = {
    gold: { rows: ['..ooo..', '.oyyyo.', 'oywyyyo', 'oyyyyyo', 'oyyyydo', '.oyddo.', '..ooo..'], pal: { o: '#7a4a10', y: '#ffd23f', w: '#fff6c0', d: '#e0a020' } },
    ore: { rows: ['...kk..', '..kggk.', '.kgwggk', 'kggggdk', 'kgggddk', '.kdddk.', '..kkk..'], pal: { g: '#c9ccd2', w: '#ffffff', d: '#8a8f98', k: '#2a2e36' } },
    stone: { rows: ['...k...', '..kpk..', '.kpwpk.', 'kpppppk', '.kpdpk.', '..kdk..', '...k...'], pal: { p: '#d48af5', w: '#ffffff', d: '#8a4ab0', k: '#34143f' } },
    mat0: { rows: ['.....gg', '...kgg.', 'kkkkkk.', 'kbbbbok', 'kbdbbok', 'kkkkkk.', '.......'], pal: { b: '#a06a3a', d: '#6a4424', o: '#f0d090', g: '#9bd14a', k: '#2e1c10' } },
    mat1: { rows: ['...k...', '..kbk..', '.kbwbk.', 'kbbbbbk', 'kbdbdbk', 'kbbbbbk', '.kkkkk.'], pal: { b: '#7fd4ff', w: '#ffffff', d: '#3f8be0', k: '#143a6a' } },
    mat2: { rows: ['...r...', '..ry...', '.kryrk.', 'krryork', 'kroyork', '.krrrk.', '..kkk..'], pal: { r: '#ff7a2a', y: '#ffe07a', o: '#ffb040', k: '#4a1408' } },
    shard0: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#8ac84a', w: '#eaffc0', d: '#4a8a2a', k: '#1e3a12' } },
    shard1: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#5ab0f0', w: '#e0f4ff', d: '#2a6ab0', k: '#12284a' } },
    shard2: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#ff8a4a', w: '#fff0d0', d: '#c04a1a', k: '#4a1a08' } },
    xp: { rows: ['...c...', '...c...', '..cwc..', 'ccwwwcc', '..cwc..', '...c...', '...c...'], pal: { c: '#8fd0ff', w: '#ffffff' } },
  };
  T.RES = RES;
  T.resName = function (kind) {
    const R = G.REGIONS || [];
    if (kind === 'gold') return 'Vàng'; if (kind === 'ore') return 'Quặng'; if (kind === 'stone') return 'Đá tôi'; if (kind === 'xp') return 'Kinh nghiệm';
    const i = +kind.slice(-1);
    if (kind.indexOf('mat') === 0) return R[i] ? R[i].mat : 'Nguyên liệu';
    return R[i] ? 'Mảnh trùm ' + R[i].bossName : 'Mảnh trùm';
  };
  // Vẽ biểu tượng tài nguyên, cao h (đơn vị giao diện), góc trên trái tại (x, y).
  T.resIcon = function (kind, x, y, h) {
    const d = RES[kind]; if (!d) return;
    const cv = layer('res|' + kind, 7, 7, () => bmp(0, 0, d.rows, d.pal));
    const c = G.ux, sm = c.imageSmoothingEnabled; h = h || 7;
    c.imageSmoothingEnabled = false; c.drawImage(cv, x, y, h, h); c.imageSmoothingEnabled = sm;
  };
  // Vùng chạm của các biểu tượng đã vẽ trong khung hình này, và tên đang hiện
  let zones = [], tip = null;
  function zone(kind, x, y, w, h) { if (zones.length < 200) zones.push([kind, x, y, w, h]); }
  // Gọi sau khi một cảnh vẽ xong: lần chạm nào chưa bị nút nào nhận mà trúng một biểu tượng thì hiện tên của nó.
  T.endFrame = function () {
    if (G.click) for (const z of zones) if (G.inRect(G.click, z[1] - 3, z[2] - 6, z[3] + 6, z[4] + 12)) { tip = { s: T.resName(z[0]), x: z[1] + z[3] / 2, y: z[2], t: G.time + 1.8 }; G.click = null; break; }
    zones = [];
    if (tip && G.time < tip.t) {
      ui.font(7.5, true);
      const w = Math.ceil(G.ux.measureText(tip.s).width) + 12, x = G.clamp(tip.x - w / 2, 2, 478 - w), y = tip.y < 20 ? tip.y + 11 : tip.y - 16;
      T.plate(x, y, w, 14); oldText(tip.s, x + w / 2, y + 10, { size: 7.5, bold: true, align: 'center', color: C.hi });
    } else tip = null;
  };
  T.tipNow = () => (tip && G.time < tip.t ? tip.s : null);
  // Chữ có số lượng tài nguyên ("400 vàng", "+5 quặng", "2 mảnh Mộc Tinh"): thay tên tài nguyên bằng biểu tượng đứng sau con số.
  let RES_RE = null, RES_MAP = null;
  function resRe() {
    if (RES_RE) return RES_RE;
    RES_MAP = { 'vàng': 'gold', 'quặng': 'ore', 'đá tôi': 'stone', 'kinh nghiệm': 'xp' };
    (G.REGIONS || []).forEach((r, i) => { RES_MAP[r.mat.toLowerCase()] = 'mat' + i; RES_MAP['mảnh ' + r.bossName.toLowerCase()] = 'shard' + i; });
    const words = Object.keys(RES_MAP).sort((a, b) => b.length - a.length).map((w) => w.replace(/ /g, '[ \\u00a0]'));
    RES_RE = new RegExp('([+~]?\\d[\\d.,]*)[ \\u00a0](' + words.join('|') + ')(?![\\wÀ-ỹ])', 'gi');
    return RES_RE;
  }
  const oldText = ui.text, oldWrap = ui.wrap;
  // Đổi "số + tên tài nguyên" thành "số + một ký tự riêng" (mỗi loại tài nguyên một ký tự); lúc vẽ ký tự đó hiện thành biểu tượng.
  const KINDS = Object.keys(RES), PUA = 0xe000;
  const DIGIT = /\d/, marked = new Map();
  function mark(str) {
    if (!DIGIT.test(str)) return str; // không có số thì chắc chắn không có "số + tên tài nguyên"
    let out = marked.get(str);
    if (out === undefined) {
      const re = resRe(); re.lastIndex = 0;
      out = str.replace(re, (m, num, word) => num + String.fromCharCode(PUA + KINDS.indexOf(RES_MAP[word.toLowerCase().replace(/\u00a0/g, ' ')])));
      if (marked.size > 400) marked.clear();
      marked.set(str, out);
    }
    return out;
  }
  const HAS = /[\ue000-\ue00f]/;
  function richText(str, x, y, o) {
    if (typeof str !== 'string' || str.length < 3) return oldText(str, x, y, o);
    const t = mark(str);
    if (!HAS.test(t)) return oldText(str, x, y, o);
    o = o || {};
    const size = Math.max(6.5, o.size || 9), ih = Math.round(size * 1.05 * 2) / 2, c = G.ux;
    const parts = []; let cur = '';
    for (const ch of t) { const k = ch.charCodeAt(0) - PUA; if (k >= 0 && k < KINDS.length) { if (cur) parts.push([cur, null]); cur = ''; parts.push([null, KINDS[k]]); } else cur += ch; }
    if (cur) parts.push([cur, null]);
    ui.font(size, o.bold);
    let total = 0;
    for (const q of parts) { q[2] = q[0] != null ? c.measureText(q[0]).width : ih + 1; total += q[2]; }
    let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
    const oo = Object.assign({}, o, { align: 'left' });
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      if (q[0] != null) oldText(q[0], cx, y, oo);
      else { T.resIcon(q[1], cx + 1, y - ih + 1, ih); const pw = i ? Math.min(parts[i - 1][2], 26) : 0; zone(q[1], cx - pw, y - ih + 1, pw + ih + 1, ih); }
      cx += q[2];
    }
  }
  // Một dãy tài nguyên: items = [[loại, số, màu chữ], ...]. Trả về toạ độ x sau món cuối. o: { size, gap, lack: [loại đang thiếu] }
  T.resRow = function (items, x, y, o) {
    o = o || {};
    const size = o.size || 7.5, ih = Math.round(size * 1.05 * 2) / 2;
    for (const q of items) {
      T.resIcon(q[0], x, y - ih + 1, ih);
      const s = String(q[1]); ui.font(size, true);
      const w = G.ux.measureText(s).width;
      oldText(s, x + ih + 1.5, y, { size, bold: true, color: q[2] || C.text });
      zone(q[0], x, y - ih + 1, ih + 1.5 + w, ih);
      x += ih + 1.5 + w + (o.gap == null ? 7 : o.gap);
    }
    return x;
  };
  // Đổi một bảng giá { gold, ore, stones, mat: [..], shard: [..] } thành dãy cho T.resRow; món nào chưa đủ thì chữ màu cam.
  T.costItems = function (c) {
    const sv = G.save, a = [], col = (ok) => (ok ? C.text : '#ff9a5a');
    if (!c) return a;
    if (c.gold) a.push(['gold', c.gold, col(sv.gold >= c.gold)]);
    if (c.ore) a.push(['ore', c.ore, col(sv.ore >= c.ore)]);
    if (c.stones) a.push(['stone', c.stones, col(sv.stones >= c.stones)]);
    if (c.mat) c.mat.forEach((n, i) => { if (n) a.push(['mat' + i, n, col(sv.mats[i] >= n)]); });
    if (c.shard) c.shard.forEach((n, i) => { if (n) a.push(['shard' + i, n, col(sv.shards[i] >= n)]); });
    return a;
  };

  // ---------- đổi cách vẽ chung của game sang chủ đề này ----------
  // Mọi chỗ trong game đang gọi G.ui.btn, G.ui.panel, G.ui.bar sẽ ra hình trống đồng mà không phải sửa từng chỗ.
  // Màu nút cũ (o.color) được đổi sang tông tương ứng: đỏ là nút chính, nâu sáng là đang chọn, đỏ sẫm là việc nguy hiểm...
  const TONES = { '#a8452a': 'primary', '#b5672f': 'sel', '#7a5a2a': 'sel', '#6a2a22': 'danger', '#8a1f1a': 'danger', '#7a2a22': 'danger', '#6a2a8a': 'purple', '#7a5a12': 'gold', '#5a4030': null, '#3a322c': null, '#8a4b25': null };
  T.install = function () {
    if (!ui || T.installed) return;
    T.installed = true;
    T.old = { btn: ui.btn, panel: ui.panel, bar: ui.bar, text: oldText, wrap: oldWrap };
    ui.text = richText;
    // giữ "số + tên tài nguyên" trên cùng một dòng để lúc vẽ đổi được thành biểu tượng
    ui.wrap = function (str, maxW, size, bold) { return oldWrap(mark(String(str)), maxW, size, bold); };
    ui.btn = function (x, y, w, h, label, o) {
      o = o || {};
      const q = { disabled: o.disabled, size: o.size, sub: o.sub, subSize: o.subSize };
      if (o.color) { const t = TONES[o.color]; if (t) q[t] = true; else if (t === undefined) q.fill = o.color; }
      for (const k of ['primary', 'sel', 'danger', 'gold', 'purple', 'dot', 'pad']) if (o[k]) q[k] = o[k];
      if (h >= 40) { // nút to dạng thẻ (ô phần thưởng, món hàng)
        const held = !o.disabled && heldIn(x, y, w, h);
        const dy = pressFx('c' + Math.round(x) + '|' + Math.round(y) + '|' + w + '|' + h, held);
        const c = G.ux, ga = c.globalAlpha; if (o.disabled) c.globalAlpha = ga * 0.55;
        T.card(x, y + dy + (held ? 1 : 0), w, h, { sel: held || q.sel });
        c.globalAlpha = ga;
        const size = o.size || 9, col = o.disabled ? '#8fa49e' : C.ink;
        if (label) txt(label, x + w / 2, y + h / 2 + size * 0.36 - (o.sub ? 4 : 0), { size, bold: true, align: 'center', color: col });
        if (o.sub) txt(o.sub, x + w / 2, y + h / 2 + 8, { size: o.subSize || 7, align: 'center', color: o.disabled ? '#8fa49e' : '#e8d9a8' });
        return !o.disabled && clicked(x, y, w, h);
      }
      return T.btn(x, y, w, h, label, q);
    };
    ui.panel = function (x, y, w, h, title) { T.panel(x, y, w, h, title, { plain: w < 200 || h < 110, noBand: true }); };
    ui.bar = function (x, y, w, h, frac, col) { T.bar(x, y, w, null, frac, null, { h: Math.round(h), col: col || '#d0482f' }); };
  };
  T.install();
  // Dòng tiêu đề nhỏ trong bảng
  T.head = function (s, x, y, o) { txt(s, x, y, Object.assign({ size: 8.5, bold: true, color: C.hi }, o || {})); };
})();
