// Vùng báo trước đòn của quái, tinh anh, trùm nhỏ, trùm vùng: vẽ MỊN ở lớp nét cao (#ui) thay cho từng điểm ảnh ở lớp #world.
// Chỉ đổi cách vẽ: thời gian báo trước, vùng va chạm, sát thương giữ nguyên (đọc thẳng từ vùng của luật chơi).
// Trong khung hình: art.js/mobs.js/room_art.js gọi G.baoTruoc.add(...) thay vì tự vẽ lên #world; cuối G.drawWorld
// (combat.js) gọi G.baoTruoc.draw(cam, sx, sy) để vẽ hết một lượt lên một tấm vẽ phụ rồi dán lên #ui.
// Kiểu vẽ: lòng đỏ trong suốt, viền sáng mảnh, mép mềm, góc bo nhẹ; hiện ra mượt (~0,15 giây); phần đỏ đậm lấp dần từ
// gốc ra (quạt theo bán kính, đường thẳng theo chiều đòn, tròn từ tâm, vành từ trong ra), đầy đúng lúc đòn ra;
// đòn ra thì chớp sáng một nhịp rồi tan (~0,2 giây). Màu pha nhẹ theo hệ (băng xanh, độc lục, lửa cam) nhưng vẫn là đỏ.
// Vì #ui nằm trên #world, chỗ thân em bé và quái đứng được xoá bớt (mềm) để vùng trông như nằm dưới chân.
// 14/10: mặc định vẽ bằng ẢNH HOẠT ẢNH 8 khung ở LỚP ĐẤT (BT.dat, mục "KIỂU ẢNH" bên dưới); đường #ui ở trên chỉ còn làm dự phòng (?baoanh=0).
(function () {
  const G = window.G;
  const A = G.art;
  if (!A) return;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const APPEAR = 0.15, FLASH = 0.22, CANCEL = 0.16;

  const BT = (G.baoTruoc = { q: [], ghosts: [], gone: [], on: true, mask: true, errs: 0 });
  // Vùng báo đang hiện ở khung trước / khung này (vật vùng -> hình đã vẽ). Vùng biến mất mà chưa nổ (quái chết, bị choáng
  // nên đòn bị huỷ) thì mờ dần trong CANCEL giây thay vì tắt phụt.
  let lastSeen = new Map(), nowSeen = new Map();
  const seen = new WeakMap(); // vật -> lúc thấy lần đầu (G.time), để làm hiện ra mượt cho vùng không có t0
  const fired = new WeakSet(); // vùng đã chớp nổ (khỏi chớp hai lần)
  let curW = null;
  let datXong = false; // kiểu ảnh: lớp đất của khung này đã vẽ (BT.dat) — vùng thêm sau đó vẽ ngay lên #world

  // màu: đỏ nguy hiểm pha nhẹ theo hệ
  const TINT = { ice: [70, 160, 255, 0.24], poison: [120, 220, 40, 0.15], fire: [255, 150, 20, 0.3] };
  function cols(el) {
    let r = 255, g = 40, b = 28, rr = 255, rg = 150, rb = 128;
    const t = TINT[el];
    if (t) { r += (t[0] - r) * t[3]; g += (t[1] - g) * t[3]; b += (t[2] - b) * t[3]; rr += (t[0] - rr) * t[3] * 0.6; rg += (t[1] - rg) * t[3] * 0.6; rb += (t[2] - rb) * t[3] * 0.6; }
    const f = (x) => Math.round(x);
    return { base: f(r) + ',' + f(g) + ',' + f(b), rim: f(rr) + ',' + f(rg) + ',' + f(rb), deep: f(r * 0.86) + ',' + f(g * 0.6) + ',' + f(b * 0.6) };
  }
  const COLS = { none: cols(null), ice: cols('ice'), poison: cols('poison'), fire: cols('fire') };
  const colOf = (el) => COLS[el] || COLS.none;

  function since(o) {
    let t = seen.get(o);
    if (t == null || t > G.time) { t = G.time; seen.set(o, t); }
    return G.time - t;
  }

  // ---------- thu thập trong khung hình ----------
  BT.add = function (it) {
    if (datXong && G.wx && veAnh(G.wx, it, 0, 0)) return; // kiểu ảnh (14/10): lớp đất đã vẽ xong trong khung này → vẽ ngay lên #world, trước thân quái
    if (BT.q.length < 400) BT.q.push(it);
  };
  function geo(z) {
    const it = { k: z.shape, x: z.x, y: z.y, el: z.el || null };
    if (z.shape === 'circle') { it.r = z.r; it.ky = G.ZK || 0.6; }
    else if (z.shape === 'rect') { it.w = z.w; it.h = z.h; }
    else if (z.shape === 'line') { it.ang = z.ang; it.len = z.len; it.w = z.w; }
    else if (z.shape === 'cone') { it.ang = z.ang; it.r = z.r; it.span = z.span; }
    else if (z.shape === 'donut') { it.r0 = z.r0; it.r1 = z.r1; it.gaps = z.gaps; it.gw = z.gw; it.ky = G.ZK || 1; }
    return it;
  }
  // Nhận một vùng của luật chơi. Trả về true nếu đã nhận (không vẽ gì lên #world nữa).
  BT.zone = function (z) {
    if (!BT.on || G.noRender) return false;
    if (z.team === 'player' || z.team === 'fx' || z.wave) return false;
    if (z.quiet) return true; // đòn thường của quái (bắn, húc, chém): không vẽ vùng báo trước; chỉ chiêu lớn của tinh anh và trùm mới có
    if (z.pool) {
      // vùng nổ xong để lại vũng (z.then): vẫn chớp một nhịp lúc nổ, vũng vẽ như cũ
      if (z.then && !(z.t > 0) && !fired.has(z) && z.shape === 'circle') { fired.add(z); const it = geo(z); it.at = G.time; if (BT.ghosts.length < 80) BT.ghosts.push(it); }
      return false;
    }
    if (z.wall) {
      if (!(z.wait > 0)) return false; // tường nước đang chạy là đòn thật: vẽ như cũ
      const age = since(z), tot = age + z.wait;
      BT.add({ k: 'wall', x: z.x, y: z.y, ang: z.ang, s: z.s, half: z.half, g: z.g, gw: z.gw, maxS: z.maxS, th: z.th, el: 'ice', u: clamp(age / Math.max(0.05, tot), 0, 1), age, con: z.wait });
      return true;
    }
    const sh = z.shape;
    if (sh !== 'circle' && sh !== 'rect' && sh !== 'line' && sh !== 'cone' && sh !== 'donut') return false;
    if (z.t > 0) {
      const it = geo(z), t0 = z.t0 || 0;
      it.age = t0 ? t0 - z.t : since(z);
      it.u = t0 ? clamp(1 - z.t / t0, 0, 1) : clamp(it.age / Math.max(0.05, it.age + z.t), 0, 1); // 14/10: vùng không có t0 vẫn kéo giãn theo thời gian còn lại
      if (z.bomb && z.bomb.fl > 0) { const gone = t0 - z.t, fl = z.bomb.fl; it.age = gone; it.u = gone < fl ? 0 : clamp((gone - fl) / Math.max(0.01, t0 - fl), 0, 1); }
      it.con = z.t; // soát mượt phiên 3 mục 9A: giây còn lại tới lúc nổ (nhịp sáng cuối)
      BT.add(it);
      nowSeen.set(z, it);
    } else if (!fired.has(z)) {
      fired.add(z);
      const it = geo(z); it.at = G.time;
      if (BT.ghosts.length < 80) BT.ghosts.push(it);
    }
    return true;
  };

  // ---------- hình ----------
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // vẽ hình (path) của vùng; f = 0..1 là phần lấp (1 = cả vùng)
  function path(c, it, f) {
    c.beginPath();
    if (it.k === 'circle') {
      const r = Math.max(0.01, it.r * f);
      c.ellipse(it.x, it.y, r, r * it.ky, 0, 0, TAU);
    } else if (it.k === 'rect') {
      const w = Math.max(0.01, it.w * f);
      rr(c, it.x + (it.w - w) / 2, it.y, w, it.h, 2.5);
    } else if (it.k === 'line' || it.k === 'aim') {
      c.save(); c.translate(it.x, it.y); c.rotate(it.ang);
      rr(c, 0, -it.w / 2, Math.max(0.01, it.len * f), it.w, Math.min(3, it.w / 3));
      c.restore();
    } else if (it.k === 'cone') {
      const r = Math.max(0.01, it.r * f), a0 = it.ang - it.span / 2, a1 = it.ang + it.span / 2;
      if (it.span >= TAU - 0.01) c.arc(it.x, it.y, r, 0, TAU);
      else {
        // góc bo nhẹ ở đỉnh và hai mép cung
        const k = Math.min(2.5, r * 0.2), ca0 = Math.cos(a0), sa0 = Math.sin(a0), ca1 = Math.cos(a1), sa1 = Math.sin(a1);
        c.moveTo(it.x + ca0 * k, it.y + sa0 * k);
        c.lineTo(it.x + ca0 * (r - k), it.y + sa0 * (r - k));
        c.arcTo(it.x + ca0 * r, it.y + sa0 * r, it.x + Math.cos(a0 + k / r) * r, it.y + Math.sin(a0 + k / r) * r, k);
        c.arc(it.x, it.y, r, a0 + k / r, a1 - k / r);
        c.arcTo(it.x + ca1 * r, it.y + sa1 * r, it.x + ca1 * (r - k), it.y + sa1 * (r - k), k);
        c.lineTo(it.x + ca1 * k, it.y + sa1 * k);
        c.quadraticCurveTo(it.x, it.y, it.x + ca0 * k, it.y + sa0 * k);
        c.closePath();
      }
    } else if (it.k === 'donut') {
      const ky = it.ky, ra = it.r0, rb = it.r0 + (it.r1 - it.r0) * f;
      for (const [s0, s1] of segs(it)) {
        c.moveTo(it.x + Math.cos(s0) * rb, it.y + Math.sin(s0) * rb * ky);
        c.ellipse(it.x, it.y, rb, rb * ky, 0, s0, s1);
        if (ra > 0.5) c.ellipse(it.x, it.y, ra, ra * ky, 0, s1, s0, true); else c.lineTo(it.x, it.y);
        c.closePath();
      }
    } else if (it.k === 'wall') {
      // hai dải hai bên khe, dài 40 theo hướng tường chạy, lấp theo chiều chạy
      c.save(); c.translate(it.x, it.y); c.rotate(it.ang);
      const L = Math.max(0.01, 40 * f), lo = it.g - it.gw, hi = it.g + it.gw;
      if (lo > -it.half) rr(c, it.s, -it.half, L, lo - -it.half, 3);
      if (hi < it.half) rr(c, it.s, hi, L, it.half - hi, 3);
      c.restore();
    }
  }
  function segs(it) {
    if (!it.gaps || !it.gw) return [[0, TAU]];
    if (it._segs) return it._segs;
    const g = it.gaps.map((x) => ((x % TAU) + TAU) % TAU).sort((p, q) => p - q);
    return (it._segs = g.map((x, i) => [x + it.gw, (i + 1 < g.length ? g[i + 1] : g[0] + TAU) - it.gw]).filter((q) => q[1] > q[0]));
  }
  // hình quạt/đường thẳng/vành có "gốc" ở tâm; vòng tròn và chữ nhật thì nở từ giữa
  function drawTele(c, it, sc) {
    const C = colOf(it.el), u = it.u || 0;
    const ap = clamp(it.age / APPEAR, 0, 1), e = 1 - (1 - ap) * (1 - ap) * (1 - ap); // hiện ra: mờ dần vào và nở từ 85% lên 100%
    const late = u > 0.75 ? (u - 0.75) / 0.25 : 0, beat = 0.5 + 0.5 * Math.sin(G.time * (10 + 14 * late));
    const s = 0.85 + 0.15 * e;
    c.save();
    if (s !== 1) { c.translate(it.x, it.y); c.scale(s, s); c.translate(-it.x, -it.y); }
    c.globalAlpha = e * (it.dim || 1);
    // lòng đỏ trong suốt
    c.fillStyle = 'rgba(' + C.base + ',' + (0.28 + 0.06 * beat + 0.06 * late).toFixed(3) + ')';
    path(c, it, 1); c.fill();
    // thanh đếm ngược: phần đỏ đậm lấp từ gốc ra, đầy đúng lúc đòn ra
    if (u > 0) {
      c.fillStyle = 'rgba(' + C.deep + ',' + (0.46 + 0.12 * late).toFixed(3) + ')';
      path(c, it, u); c.fill();
      // mép trước của phần đang lấp sáng lên một chút
      c.strokeStyle = 'rgba(' + C.rim + ',' + (0.35 * (1 - late * 0.5)).toFixed(3) + ')';
      c.lineWidth = 1.2 / sc; c.stroke();
    }
    // mép mềm: một vệt rộng mờ, rồi viền sáng mảnh
    path(c, it, 1);
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(' + C.base + ',' + (0.38 + 0.12 * late).toFixed(3) + ')';
    c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(' + C.rim + ',' + (0.7 + 0.3 * beat * (0.4 + 0.6 * late)).toFixed(3) + ')';
    c.lineWidth = Math.max(1.4 / sc, 0.6); c.stroke();
    // Cho người mù màu đỏ–lục: vùng của quái khác vòng dưới chân em bé cả về HÌNH (vòng em bé nét liền, không sọc):
    // sọc chéo tối trong lòng vùng + viền nét đứt tối chạy vòng quanh. Không đổi màu.
    hatch(c, it, sc, late);
    // sắp ra đòn (15% cuối): lòng vùng sáng dần lên và viền trắng dày dần (lấy đà), để biết lúc nào phải né
    const pre = u > 0.85 ? (u - 0.85) / 0.15 : 0;
    if (pre > 0) {
      path(c, it, 1);
      c.fillStyle = 'rgba(255,236,214,' + (0.16 * pre).toFixed(3) + ')'; c.fill();
      c.strokeStyle = 'rgba(255,248,236,' + (0.45 + 0.45 * pre).toFixed(3) + ')';
      c.lineWidth = Math.max(1.4 / sc, 0.6) + 1.2 * pre; c.stroke();
    }
    // hướng đòn: các mũi chữ V chạy từ gốc ra ngoài (đường thẳng, hình quạt)
    if ((it.k === 'line' || (it.k === 'cone' && it.span < TAU - 0.01)) && e > 0.5) chevrons(c, it, C, sc, late);
    c.restore();
  }
  // sọc chéo + viền nét đứt chạy (V31): tín hiệu bằng hình, không chỉ bằng màu
  function hatch(c, it, sc, late) {
    const E = Math.max(it.r || 0, it.r1 || 0, it.len || 0, it.w || 0, it.h || 0, it.k === 'wall' ? Math.abs(it.s || 0) + 44 + (it.half || 0) : 0) + 6;
    c.save();
    path(c, it, 1); c.clip();
    c.beginPath();
    const gap = 6, x0 = it.x - 3 * E, x1 = it.x + E;
    for (let x = x0; x <= x1; x += gap) { c.moveTo(x, it.y - E); c.lineTo(x + 2 * E, it.y + E); }
    c.strokeStyle = 'rgba(40,6,4,' + (0.26 + 0.08 * late).toFixed(3) + ')';
    c.lineWidth = 1.5; c.lineCap = 'butt'; c.stroke();
    c.restore();
    path(c, it, 1);
    c.save();
    c.setLineDash([3, 3]); c.lineDashOffset = -(G.time * (8 + 10 * late)) % 6;
    c.strokeStyle = 'rgba(30,4,2,0.6)'; c.lineWidth = Math.max(1.1 / sc, 0.6); c.stroke();
    c.restore();
  }
  function chevrons(c, it, C, sc, late) {
    const L = it.k === 'line' ? it.len : it.r, sz = it.k === 'line' ? Math.min(7, it.w * 0.32) : Math.min(8, it.r * 0.12);
    if (L < 24 || sz < 2.5) return;
    const ph = (G.time * (1.2 + 1.6 * late)) % 1, ca = Math.cos(it.ang), sa = Math.sin(it.ang);
    c.lineWidth = Math.max(1.2 / sc, 0.6); c.lineJoin = 'round'; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const f = (i + ph) / 3, d = 6 + (L - 14) * f, a = Math.sin(f * Math.PI); // hiện ra ở gốc, tan ở mép
      const x = it.x + ca * d, y = it.y + sa * d;
      c.strokeStyle = 'rgba(' + C.rim + ',' + (0.7 * a).toFixed(3) + ')';
      c.beginPath();
      c.moveTo(x - ca * sz - sa * sz, y - sa * sz + ca * sz);
      c.lineTo(x, y);
      c.lineTo(x - ca * sz + sa * sz, y - sa * sz - ca * sz);
      c.stroke();
    }
  }
  // đòn ra: chớp sáng một nhịp rồi tan
  function drawFlash(c, it, f, sc) {
    const C = colOf(it.el), a = f < 0.18 ? f / 0.18 : 1 - (f - 0.18) / 0.82, k = a * a * (3 - 2 * a);
    const s = 1 + 0.06 * f;
    c.save();
    c.translate(it.x, it.y); c.scale(s, s); c.translate(-it.x, -it.y);
    path(c, it, 1);
    c.fillStyle = 'rgba(255,246,226,' + (0.5 * k).toFixed(3) + ')'; c.fill();
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(' + C.rim + ',' + (0.9 * k).toFixed(3) + ')'; c.lineWidth = Math.max(1.4 / sc, 0.7) + 1.6 * f; c.stroke();
    c.restore();
  }
  // vòng mọc quái và vòng gai: tròn dẹt, không có gốc
  function drawWallGap(c, it, sc) {
    // khe an toàn của tường nước: lối xanh nhạt, hai mép trắng
    const ap = clamp(it.age / APPEAR, 0, 1);
    c.save(); c.globalAlpha = ap;
    c.translate(it.x, it.y); c.rotate(it.ang);
    c.fillStyle = 'rgba(150,255,170,0.16)';
    c.beginPath(); rr(c, it.s, it.g - it.gw, 40, it.gw * 2, 4); c.fill();
    c.strokeStyle = 'rgba(255,255,255,' + (0.75 + 0.25 * Math.sin(G.time * 12)).toFixed(3) + ')'; c.lineWidth = Math.max(1.2 / sc, 0.6);
    c.beginPath(); c.moveTo(it.s, it.g - it.gw); c.lineTo(it.s + 40, it.g - it.gw); c.moveTo(it.s, it.g + it.gw); c.lineTo(it.s + 40, it.g + it.gw); c.stroke();
    c.restore();
  }

  // ---------- chỗ thân em bé, quái, đạn, hạt... : xoá vùng ở đó cho trông như nằm dưới chân ----------
  // Cách chính: chụp #world ngay trước khi vẽ nhân vật (snap), cuối khung so với #world đã vẽ xong; chỗ nào khác đi là có thứ
  // đứng trên sàn, xoá vùng báo ở đúng chỗ đó (từng điểm ảnh, chạy trên card đồ hoạ: phép "difference" rồi bộ lọc đổi màu
  // thành độ trong). Máy nào không có bộ lọc thì xoá mềm một hình bầu dục quanh thân (gần đúng).
  let snapCv = null, snapOk = false, mCv = null, mCx = null, aCv = null, aCx = null, filt = null;
  function makeFilter() {
    try {
      // bộ lọc SVG: độ trong = tổng độ khác nhau của ba màu (chỗ giống hệt nền thì trong suốt)
      const box0 = document.createElement('div');
      box0.setAttribute('aria-hidden', 'true');
      box0.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      box0.innerHTML = '<svg width="0" height="0"><filter id="btMask" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  8 8 8 0 0"/></filter></svg>';
      document.body.appendChild(box0);
      // thử một lần: điểm đen phải trong suốt, điểm trắng phải đục
      const a = document.createElement('canvas'), b = document.createElement('canvas');
      a.width = b.width = 2; a.height = b.height = 1;
      const ca = a.getContext('2d'), cb = b.getContext('2d', { willReadFrequently: true });
      ca.fillStyle = '#000'; ca.fillRect(0, 0, 1, 1); ca.fillStyle = '#fff'; ca.fillRect(1, 0, 1, 1);
      if (!('filter' in cb)) return 0;
      cb.filter = 'url(#btMask)'; cb.drawImage(a, 0, 0); cb.filter = 'none';
      const d = cb.getImageData(0, 0, 2, 1).data;
      return d[3] < 40 && d[7] > 215 ? 1 : 0;
    } catch (e) { return 0; }
  }
  // Gọi ngay trước khi vẽ nhân vật. Chỉ chụp phần nền quanh các vùng báo, và chỉ khi có nhân vật đứng chồng lên vùng.
  const SB = [0, 0, 0, 0];
  let need = false;
  BT.hasMask = () => !!filt; // để bài kiểm tra biết máy có dùng được cách xoá đúng từng điểm ảnh không
  BT.snap = function (c) {
    snapOk = false; need = false;
    if (!BT.on || G.noRender) return;
    try {
      const W = G.getWorld ? G.getWorld() : null;
      if (!W) return;
      // khung bao từng vùng báo
      const Z = [], add = (x0, y0, x1, y1) => Z.push([x0, y0, x1, y1]), one = (it) => { const b = [1e9, 1e9, -1e9, -1e9]; box(it, b); Z.push(b); };
      for (const z of W.zones) {
        if (z.team === 'player' || z.team === 'fx' || z.pool || z.wave) continue;
        if (z.wall) { if (z.wait > 0) one({ k: 'wall', x: z.x, y: z.y, ang: z.ang, s: z.s, half: z.half }); continue; }
        if (z.shape === 'circle' || z.shape === 'rect' || z.shape === 'line' || z.shape === 'cone' || z.shape === 'donut') one(geo(z));
      }
      for (const g of BT.ghosts) one(g);
      for (const g of BT.gone) one(g);
      for (const it of BT.q) one(it); // vòng mọc quái (đã thêm lúc vẽ nền)
      for (const e of W.ents) {
        if (e.dead) continue;
        if (e.spikeUp > 0) add(e.x - e.r - 12, e.y - e.r, e.x + e.r + 12, e.y + e.r);
        if (e.act && e.act.aim && e.wind > 0 && W.P) add(Math.min(e.x, W.P.x) - 4, Math.min(e.y, W.P.y) - 14, Math.max(e.x, W.P.x) + 4, Math.max(e.y, W.P.y) + 4);
      }
      if (!Z.length) return;
      // chỉ cần xoá ở phần giao giữa vùng báo và thân em bé, quái, trùm
      const B = [1e9, 1e9, -1e9, -1e9];
      const hit = (e, hw, hh) => {
        if (!e || e.dead || e.hidden) return;
        const ex0 = e.x - hw, ex1 = e.x + hw, ey0 = e.y - hh, ey1 = e.y + 4;
        for (const b of Z) {
          if (ex1 <= b[0] || ex0 >= b[2] || ey1 <= b[1] || ey0 >= b[3]) continue;
          B[0] = Math.min(B[0], Math.max(ex0, b[0])); B[1] = Math.min(B[1], Math.max(ey0, b[1])); B[2] = Math.max(B[2], Math.min(ex1, b[2])); B[3] = Math.max(B[3], Math.min(ey1, b[3]));
        }
      };
      hit(W.P, 14, 44);
      for (const e of W.ents) hit(e, (e.drawW || e.w || 30) * 0.6, (e.drawH || e.h || 30) * 1.3 + 10);
      if (W.boss) hit(W.boss, (W.boss.drawW || 120) * 0.6, (W.boss.drawH || 120) * 1.2 + 10);
      if (B[2] <= B[0]) return;
      need = true;
      // từ toạ độ thế giới sang điểm ảnh màn hình game 480x270 (đang có phép dời của khung; canvas thật gấp G.NET lần)
      const m = c.getTransform(), w = c.canvas, N = G.NET || 1, me = m.e / N, mf = m.f / N;
      const x = clamp(Math.floor(B[0] + me) - 2, 0, G.W), y = clamp(Math.floor(B[1] + mf) - 2, 0, G.H);
      const x1 = clamp(Math.ceil(B[2] + me) + 2, 0, G.W), y1 = clamp(Math.ceil(B[3] + mf) + 2, 0, G.H);
      if (x1 <= x || y1 <= y) { need = false; return; }
      SB[0] = x; SB[1] = y; SB[2] = x1 - x; SB[3] = y1 - y;
      if (filt == null) filt = makeFilter();
      if (!filt || !BT.mask) return; // không có bộ lọc: xoá gần đúng quanh thân (bodies)
      if (!snapCv) snapCv = document.createElement('canvas');
      if (snapCv.width !== w.width || snapCv.height !== w.height) { snapCv.width = w.width; snapCv.height = w.height; }
      const s = snapCv.getContext('2d');
      s.clearRect(x * N, y * N, SB[2] * N, SB[3] * N);
      s.drawImage(w, x * N, y * N, SB[2] * N, SB[3] * N, x * N, y * N, SB[2] * N, SB[3] * N);
      snapOk = true;
    } catch (e) { snapOk = false; need = false; }
  };
  // chỉ làm trong khung bao (x, y, w, h: điểm ảnh màn hình game 480x270) để nhẹ máy. Canvas #world thật gấp G.NET lần.
  function maskOut(c, sc, x0, y0, w0, h0) {
    if (!filt || !snapOk) return false;
    const wv = G.wx.canvas, N = wv.width / G.W, x = x0 * N, y = y0 * N, w = w0 * N, h = h0 * N, kx = c.canvas.width / wv.width, ky = c.canvas.height / wv.height;
    if (!mCv) { mCv = document.createElement('canvas'); mCx = mCv.getContext('2d'); aCv = document.createElement('canvas'); aCx = aCv.getContext('2d'); }
    if (mCv.width < w || mCv.height < h) { mCv.width = aCv.width = Math.max(w, mCv.width); mCv.height = aCv.height = Math.max(h, mCv.height); }
    mCx.globalCompositeOperation = 'copy'; mCx.drawImage(wv, x, y, w, h, 0, 0, w, h);
    mCx.globalCompositeOperation = 'difference'; mCx.drawImage(snapCv, x, y, w, h, 0, 0, w, h);
    mCx.globalCompositeOperation = 'source-over';
    aCx.clearRect(0, 0, w, h);
    aCx.filter = 'url(#btMask)'; aCx.drawImage(mCv, 0, 0, w, h, 0, 0, w, h); aCx.filter = 'none';
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.globalCompositeOperation = 'destination-out';
    c.drawImage(aCv, 0, 0, w, h, x * kx, y * ky, w * kx, h * ky);
    c.restore();
    return true;
  }
  // khung bao của một hình (toạ độ thế giới), nới thêm cho mép mềm và lúc chớp nở ra
  function box(it, B) {
    let x0, y0, x1, y1;
    if (it.k === 'circle') { x0 = it.x - it.r; x1 = it.x + it.r; y0 = it.y - it.r * it.ky; y1 = it.y + it.r * it.ky; }
    else if (it.k === 'rect') { x0 = it.x; x1 = it.x + it.w; y0 = it.y; y1 = it.y + it.h; }
    else if (it.k === 'cone') { x0 = it.x - it.r; x1 = it.x + it.r; y0 = it.y - it.r; y1 = it.y + it.r; }
    else if (it.k === 'donut') { x0 = it.x - it.r1; x1 = it.x + it.r1; y0 = it.y - it.r1 * it.ky; y1 = it.y + it.r1 * it.ky; }
    else {
      // đường thẳng, đường ngắm, tường nước: bốn góc của hình chữ nhật xoay
      const cs = Math.cos(it.ang), sn = Math.sin(it.ang);
      const wp = it.k === 'wall' && G.BT_PIXEL ? (it.th || 14) / 2 + 3 : 0; // kiểu điểm ảnh: cả dải mép tường dày th quét qua (G.mobWall)
      const a0 = it.k === 'wall' ? it.s - wp : 0, a1 = it.k === 'wall' ? it.s + (G.BT_PIXEL && it.maxS > it.s + 40 ? it.maxS - it.s : 40) + wp : it.len, b = it.k === 'wall' ? it.half : it.w / 2;
      x0 = y0 = 1e9; x1 = y1 = -1e9;
      for (const a of [a0, a1]) for (const bb of [-b, b]) { const px = it.x + a * cs - bb * sn, py = it.y + a * sn + bb * cs; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
    }
    const p = 3 + Math.max(x1 - x0, y1 - y0) * 0.04;
    if (x0 - p < B[0]) B[0] = x0 - p; if (y0 - p < B[1]) B[1] = y0 - p; if (x1 + p > B[2]) B[2] = x1 + p; if (y1 + p > B[3]) B[3] = y1 + p;
  }
  let GR = null;
  function soft(c, x, y, rx, ry, a) {
    if (!GR) { GR = c.createRadialGradient(0, 0, 0, 0, 0, 1); GR.addColorStop(0, 'rgba(0,0,0,1)'); GR.addColorStop(0.55, 'rgba(0,0,0,0.85)'); GR.addColorStop(1, 'rgba(0,0,0,0)'); }
    c.save(); c.translate(x, y); c.scale(rx, ry); c.globalAlpha = a; c.fillStyle = GR;
    c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
  }
  function bodies(c, W) {
    const P = W.P;
    c.globalCompositeOperation = 'destination-out';
    if (P && !P.dead) soft(c, P.x, P.y - 15, 10, 17, 0.72);
    const one = (e, a) => {
      if (!e || e.dead || e.hidden) return;
      const w = (e.drawW || e.w || 22) * 0.36, h = (e.drawH || e.h || 22) * 0.5;
      soft(c, e.x, e.y - h - 1, Math.max(6, w), Math.max(7, h), a);
    };
    for (const e of W.ents) one(e, 0.5);
    if (W.boss && !W.boss.dead) one(W.boss, 0.45);
    c.globalCompositeOperation = 'source-over';
  }

  // ---------- KIỂU ĐIỂM ẢNH (Rà soát toàn bộ, phần B — hiệu ứng chiến đấu, 12/10) ----------
  // Chủ dự án: vùng báo vẽ mịn (vòng tròn vẽ tay, sọc chéo thô, nét đứt) lệch phong cách pixel art. Kiểu mới tô TỪNG ĐIỂM ẢNH GAME
  // (480×270) rồi phóng to không làm mịn, như mọi hình khác trong game: lòng đỏ trong, mép sáng 1 điểm ảnh, viền tối 1 điểm ảnh bên ngoài,
  // chấm lưới thưa thay cho sọc chéo (vẫn khác vòng dưới chân em bé — vòng em bé không có chấm), phần đỏ đậm lấp dần, chớp lúc nổ.
  // HÌNH LẤY THẲNG TỪ HÀM GÂY SÁT THƯƠNG: mỗi điểm ảnh được tô khi và chỉ khi G.inZone (combat.js) / G.inShape (mobs.js) — đúng hàm
  // quyết định em bé có bị đánh trúng — nói điểm đó nằm trong vùng (gồm cả 3 điểm ảnh dung sai ở mép đường thẳng, quạt, vành và
  // vòng tròn nhỏ 8 điểm ảnh quanh gốc hình quạt mà kiểu cũ không vẽ). Vì vậy vùng báo khớp vùng sát thương thật tới từng điểm ảnh.
  // Chỉ đổi cách vẽ; thời gian, vùng, sát thương không đổi. CỜ TẮT: G.BT_PIXEL = false hoặc ?btpx=0 → kiểu vẽ mịn cũ.
  let tatPx = false;
  try { tatPx = /[?&]btpx=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tatPx = false; }
  if (G.BT_PIXEL == null) G.BT_PIXEL = !tatPx;
  const rgb = (s) => s.split(',').map(Number);
  const CPX = {};
  for (const k in COLS) CPX[k] = { base: rgb(COLS[k].base), rim: rgb(COLS[k].rim), deep: rgb(COLS[k].deep) };
  const cpx = (el) => CPX[el] || CPX.none;
  const PZ = { shape: '', x: 0, y: 0 }, PT = { x: 0, y: 0 };
  // Điểm (x, y) (toạ độ thế giới) có trong hình không: trả về -1 nếu ngoài, không thì "độ xa" 0..1 tính từ gốc (để lấp đếm ngược).
  function memb(it, x, y) {
    const dx = x - it.x, dy = y - it.y;
    if (it.k === 'circle') {
      const qx = dx / it.r, qy = dy / (it.r * it.ky), n = qx * qx + qy * qy; // = G.inZone hình tròn (it.ky = G.ZK với vùng của luật chơi)
      return n <= 1 ? Math.sqrt(n) : -1;
    }
    if (it.k === 'rect') return x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h ? Math.abs(x - it.x - it.w / 2) / Math.max(0.5, it.w / 2) : -1;
    if (it.k === 'wall') {
      // Rà soát B (bổ sung): tường trúng em bé khi MÉP tường dày th quét qua (|al − s| < th/2 + 3, G.mobWall) trên CẢ đường từ s tới maxS,
      // trừ khe |ac − g| ≤ gw. Trước chỉ dải 40 điểm ảnh đầu được tô đỏ (báo được ~16% chỗ sẽ bị trúng); nay phần đường còn lại tô đỏ nhạt (-4).
      const c = Math.cos(it.ang), s = Math.sin(it.ang), al = dx * c + dy * s - it.s, ac = -dx * s + dy * c;
      const L = it.maxS > it.s + 40 ? it.maxS - it.s : 40, pad = (it.th || 14) / 2 + 3;
      if (al < -pad || al > L + pad || Math.abs(ac) >= it.half) return -1;
      const khe = Math.abs(ac - it.g) <= it.gw;
      if (al < 0 || al > 40) return khe ? (al > 40 ? -3 : -2) : -4; // -3: khe an toàn kéo dài suốt đường tường sẽ chạy (tới z.maxS)
      return !khe ? al / 40 : -2; // -2: khe an toàn (đứng đây tường không đánh trúng: |ac − g| ≤ gw như G.mobWall)
    }
    if (it.k === 'aim') {
      const c = Math.cos(it.ang), s = Math.sin(it.ang), al = dx * c + dy * s, ac = -dx * s + dy * c;
      return al >= 0 && al <= it.len && Math.abs(ac) <= it.w / 2 ? al / Math.max(1, it.len) : -1;
    }
    // đường thẳng, quạt, vành khăn: hỏi thẳng hàm gây sát thương của game
    PZ.shape = it.k; PZ.x = it.x; PZ.y = it.y; PZ.r = it.r; PZ.ang = it.ang; PZ.len = it.len; PZ.w = it.w; PZ.span = it.span; PZ.r0 = it.r0; PZ.r1 = it.r1; PZ.gaps = it.gaps; PZ.gw = it.gw;
    PT.x = x; PT.y = y;
    if (!(G.inShape ? G.inShape(PZ, PT, 0) : false)) return -1;
    if (it.k === 'line') return clamp((dx * Math.cos(it.ang) + dy * Math.sin(it.ang)) / Math.max(1, it.len), 0, 1);
    if (it.k === 'cone') return clamp(Math.hypot(dx, dy) / Math.max(1, it.r), 0, 1);
    const d = Math.hypot(dx, dy / (G.ZK || 1));
    return clamp((d - it.r0) / Math.max(1, it.r1 - it.r0), 0, 1);
  }
  const MK = new Map();
  const sigOf = (it) => it.k + '|' + [it.x, it.y, it.r, it.ky, it.w, it.h, it.ang, it.len, it.span, it.r0, it.r1, it.gw, it.gaps ? it.gaps.join('/') : '', it.s, it.half, it.g].join(',');
  // Mặt nạ của một hình (lưu lại theo hình, vùng không đổi chỗ nên chỉ tính một lần):
  // m: 0 ngoài, 1 viền tối (ngoài, sát hình), 2 trong, 3 mép (trong, sát ngoài), 4 khe an toàn, 5 mép khe; p: độ xa từ gốc 0..255.
  function maskOf(it) {
    const key = sigOf(it);
    let M = MK.get(key);
    if (M) { M.used = G.time; return M; }
    const B = [1e9, 1e9, -1e9, -1e9];
    box(it, B);
    // chỉ trong sàn phòng (nới 30 điểm ảnh): phần vùng ngoài tường phòng không ai đứng tới được
    const Wd = G.getWorld ? G.getWorld() : null, fx0 = Wd && Wd.x0 != null ? Wd.x0 - 30 : -1e9, fx1 = Wd && Wd.x1 != null ? Wd.x1 + 30 : 1e9, fy0 = Wd && Wd.y0 != null ? Wd.y0 - 30 : -1e9, fy1 = Wd && Wd.y1 != null ? Wd.y1 + 30 : 1e9;
    const x0 = Math.floor(Math.max(B[0], fx0)) - 2, y0 = Math.floor(Math.max(B[1], fy0)) - 2, w = Math.min(900, Math.ceil(Math.min(B[2], fx1)) + 3 - x0), h = Math.min(600, Math.ceil(Math.min(B[3], fy1)) + 3 - y0);
    if (w <= 0 || h <= 0) return null;
    const m = new Uint8Array(w * h), p = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = memb(it, x0 + i + 0.5, y0 + j + 0.5), o = j * w + i;
      if (v >= 0) { m[o] = 2; p[o] = Math.round(v * 255); } else if (v === -2) m[o] = 4; else if (v === -3) m[o] = 6; else if (v === -4) m[o] = 8;
    }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const o = j * w + i, v = m[o];
      const nb = (q) => (i > 0 && m[o - 1] === q) || (i < w - 1 && m[o + 1] === q) || (j > 0 && m[o - w] === q) || (j < h - 1 && m[o + w] === q);
      if (v === 0) { if (nb(2) || nb(3)) m[o] = 1; }
      else if (v === 2) { if ((i > 0 && m[o - 1] < 2) || (i < w - 1 && m[o + 1] < 2) || (j > 0 && m[o - w] < 2) || (j < h - 1 && m[o + w] < 2) || i === 0 || j === 0 || i === w - 1 || j === h - 1 || nb(4) || nb(5)) m[o] = 3; }
      else if (v === 4) { if (nb(2) || nb(3)) m[o] = 5; }
      else if (v === 6) { if (nb(0) || nb(1) || nb(8)) m[o] = 7; }
    }
    // cỡ tính bằng điểm ảnh của "độ xa" (để mép trước của phần đang lấp dày đúng 1 điểm ảnh)
    const R = it.k === 'circle' ? it.r : it.k === 'rect' ? it.w / 2 : it.k === 'line' || it.k === 'aim' ? it.len : it.k === 'cone' ? it.r : it.k === 'donut' ? it.r1 - it.r0 : 40;
    M = { x0, y0, w, h, m, p, R: Math.max(1, R), used: G.time };
    if (MK.size > 160) { for (const [k2, v2] of MK) if (G.time - v2.used > 1 || v2.used > G.time) MK.delete(k2); if (MK.size > 160) MK.clear(); }
    MK.set(key, M);
    return M;
  }
  BT.maskOf = maskOf; // để bài kiểm tra so mặt nạ với G.inZone
  BT.memb = memb;
  // trộn một màu (r, g, b, độ đậm a 0..1) lên điểm ảnh i của dữ liệu ảnh (kiểu "đè lên")
  function put(d, i, r, g, b, a) {
    if (a <= 0.004) return;
    if (a > 1) a = 1;
    const da = d[i + 3] / 255, oa = a + da * (1 - a), k = a / oa;
    d[i] += (r - d[i]) * k; d[i + 1] += (g - d[i + 1]) * k; d[i + 2] += (b - d[i + 2]) * k; d[i + 3] = oa * 255;
  }
  // mode: 0 báo trước, 1 chớp lúc nổ, 2 đòn bị huỷ (mờ dần)
  function pxItem(d, DW, X0, Y0, it, mode, f) {
    const M = maskOf(it);
    if (!M) return;
    const C = cpx(it.el), u = mode === 1 ? 0 : it.u || 0;
    const ap = mode === 2 ? 1 : clamp(it.age / APPEAR, 0, 1), e = ap < 0.34 ? 0.35 : ap < 0.67 ? 0.7 : 1; // hiện ra theo 3 nấc, không co giãn mịn
    const late = mode === 0 && u > 0.75 ? (u - 0.75) / 0.25 : 0, blink = Math.floor(G.time * (late > 0 ? 12 + 10 * late : 7)) % 2;
    const pre = mode === 0 && u > 0.85 ? (u - 0.85) / 0.15 : 0;
    const dim = e * (it.dim || 1), fk = mode === 1 ? (f < 0.18 ? f / 0.18 : 1 - (f - 0.18) / 0.82) : 0;
    const aIn = 0.3 + 0.06 * blink + 0.06 * late, aDeep = 0.48 + 0.12 * late, band = 1.2 / M.R;
    const chev = mode !== 1 && e > 0.5 && (it.k === 'line' || (it.k === 'cone' && it.span < TAU - 0.01));
    let cL = 0, cS = 0, ca = 0, sa = 0, cph = 0;
    if (chev) { cL = it.k === 'line' ? it.len : it.r; cS = Math.round(it.k === 'line' ? Math.min(6, it.w * 0.3) : Math.min(7, it.r * 0.11)); ca = Math.cos(it.ang); sa = Math.sin(it.ang); cph = (Math.floor(G.time * (8 + 10 * late)) / 8) % 1; if (cL < 24 || cS < 2) cS = 0; }
    const m = M.m, p = M.p, w = M.w;
    for (let j = 0; j < M.h; j++) {
      const wy = M.y0 + j, ry = wy - Y0;
      if (ry < 0 || ry >= DW[1]) continue;
      for (let i = 0; i < w; i++) {
        const o = j * w + i, v = m[o];
        if (!v) continue;
        const wx = M.x0 + i, rx = wx - X0;
        if (rx < 0 || rx >= DW[0]) continue;
        const di = (ry * DW[0] + rx) * 4;
        if (mode === 1) { // chớp lúc nổ
          if (v === 2) put(d, di, 255, 246, 226, 0.5 * fk);
          else if (v === 3) put(d, di, C.rim[0], C.rim[1], C.rim[2], 0.9 * fk);
          continue;
        }
        if (v === 1) { put(d, di, 30, 4, 2, 0.55 * dim); continue; } // viền tối 1 điểm ảnh bên ngoài
        if (v === 8) { // đường tường nước sẽ quét qua (ngoài dải xuất phát): đỏ rất nhạt + chấm thưa
          put(d, di, C.base[0], C.base[1], C.base[2], 0.13 * dim);
          if ((wy & 1) === 0 && ((wx + ((wy >> 1) & 1) * 2) & 3) === 0) put(d, di, C.base[0], C.base[1], C.base[2], 0.4 * dim);
          continue;
        }
        if (v >= 4) { // khe an toàn của tường nước: lối xanh nhạt, mép trắng; đoạn kéo dài suốt đường tường chạy thì nhạt hơn, mép chấm
          if (v === 4) put(d, di, 150, 255, 170, 0.16 * dim);
          else if (v === 5) put(d, di, 255, 255, 255, (0.75 + 0.25 * blink) * dim);
          else if (v === 6) put(d, di, 150, 255, 170, 0.09 * dim);
          else if (((wx + wy) & 1) === 0) put(d, di, 255, 255, 255, 0.5 * dim);
          continue;
        }
        const pn = p[o] / 255;
        put(d, di, C.base[0], C.base[1], C.base[2], aIn * dim);
        if (u > 0 && pn <= u) {
          put(d, di, C.deep[0], C.deep[1], C.deep[2], aDeep * dim);
          if (u < 1 && pn > u - band) put(d, di, C.rim[0], C.rim[1], C.rim[2], 0.45 * (1 - late * 0.5) * dim); // mép trước phần đang lấp
        }
        // chấm lưới thưa (1/8 điểm ảnh, so le) thay cho sọc chéo: dấu hiệu bằng hình cho người khó phân biệt đỏ–lục
        if (v === 2 && (wy & 1) === 0 && ((wx + ((wy >> 1) & 1) * 2) & 3) === 0) put(d, di, 40, 6, 4, (0.32 + 0.1 * late) * dim);
        if (pre > 0) put(d, di, 255, 236, 214, 0.16 * pre * dim);
        if (v === 3) {
          put(d, di, C.rim[0], C.rim[1], C.rim[2], (0.8 + 0.2 * blink * late) * dim);
          if (pre > 0) put(d, di, 255, 248, 236, (0.45 + 0.45 * pre) * dim);
        }
        if (cS) { // mũi chữ V chạy từ gốc ra ngoài: hướng đòn
          const qx = wx + 0.5 - it.x, qy = wy + 0.5 - it.y, al = qx * ca + qy * sa, ac = Math.abs(-qx * sa + qy * ca);
          if (ac <= cS) for (let k = 0; k < 3; k++) {
            const ff = (k + cph) / 3, dd = 6 + (cL - 14) * ff;
            if (Math.abs(al + ac - dd) < 0.71) { put(d, di, C.rim[0], C.rim[1], C.rim[2], 0.75 * Math.sin(ff * Math.PI) * dim); break; }
          }
        }
      }
    }
  }
  let pcv = null, pcx = null, pid = null, pbuf = null;
  const DWH = [0, 0];
  // Vẽ mọi vùng báo của khung này kiểu điểm ảnh lên tấm phụ c (đang ở phép biến đổi thế giới × sc). Trả về false nếu lỗi.
  function pxDraw(c, q, cam, sx, sy, bx, by, bw, bh, gone, ghosts) {
    gone = gone || BT.gone; ghosts = ghosts || BT.ghosts;
    // vùng điểm ảnh thế giới cần tô: khung bao màn hình (bx, by, bw, bh) đổi về toạ độ thế giới
    const ox = -cam + (sx || 0), oy = sy || 0;
    const X0 = Math.floor(bx - ox), Y0 = Math.floor(by - oy), W0 = bw + 2, H0 = bh + 2;
    if (!pcv) { pcv = document.createElement('canvas'); pcx = pcv.getContext('2d'); }
    if (pcv.width < W0 || pcv.height < H0) { pcv.width = Math.max(W0, pcv.width); pcv.height = Math.max(H0, pcv.height); pid = null; }
    // Phiên hiệu năng 13/10: khung bao đổi cỡ gần như mỗi khung → trước đây cấp một ImageData mới (W0×H0×4 byte rác) mỗi khung.
    // Nay dùng lại một vùng nhớ lớn dần (ImageData chỉ là khung nhìn W0×H0 lên vùng đó, xoá về 0 như tấm mới): cùng điểm ảnh.
    if (!pid || pid.width !== W0 || pid.height !== H0) {
      const n = W0 * H0 * 4;
      try {
        if (!pbuf || pbuf.byteLength < n) pbuf = new ArrayBuffer(Math.max(n, pbuf ? Math.ceil(pbuf.byteLength * 1.5 / 4) * 4 : 0));
        const v = new Uint8ClampedArray(pbuf, 0, n); v.fill(0);
        pid = new ImageData(v, W0, H0);
      } catch (e) { pbuf = null; pid = pcx.createImageData(W0, H0); }
    } else pid.data.fill(0);
    const d = pid.data;
    DWH[0] = W0; DWH[1] = H0;
    for (const it of q) pxItem(d, DWH, X0, Y0, it, 0, 0);
    for (const g of gone) { const f = (G.time - g.at) / CANCEL; g.dim = (1 - f) * (1 - f); g.age = 1; pxItem(d, DWH, X0, Y0, g, 2, 0); }
    for (const g of ghosts) pxItem(d, DWH, X0, Y0, g, 1, (G.time - g.at) / FLASH);
    pcx.putImageData(pid, 0, 0);
    BT._px = { X0, Y0, W0, H0, data: d }; // bài kiểm tra đọc lại (game/tests/bt_khop.py)
    c.imageSmoothingEnabled = false;
    c.drawImage(pcv, 0, 0, W0, H0, X0, Y0, W0, H0);
    return true;
  }

  // ---------- KIỂU ẢNH HOẠT ẢNH 8 KHUNG (14/10, chủ dự án 08:44–08:59) ----------
  // Ảnh docs/anh-goc/bao-truoc → gd-bt-tron / gd-bt-vanh / gd-bt-quat / gd-bt-dai (một hàng 8 khung; dựng bằng
  // docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/dung-bao-truoc.py). Khung 1 viền mờ → 2–6 lấp dần → 7 đầy → 8 chớp nổ.
  // Khung = floor(tiến độ × 7) (tiến độ u: cùng t0 / thời điểm nổ mà kiểu cũ dùng cho phần "lấp dần"), khung 8 lúc nổ (thay chớp cũ).
  // Vẽ ở LỚP ĐẤT (#world, ngay trước khi vẽ nhân vật / quái, BT.dat gọi từ G.drawWorld) nên tự nằm dưới chân mọi thứ:
  // không còn chụp nền (BT.snap), so điểm ảnh, xoá chỗ thân (maskOut) — phần tốn máy nhất của kiểu cũ.
  // Chỉ đổi cách vẽ: thời gian báo trước, vùng va chạm, sát thương giữ nguyên. Thiếu ảnh (hoặc hình không có ảnh: tường nước, đường ngắm)
  // thì hình đó vẽ kiểu điểm ảnh cũ ngay trên lớp đất. CỜ TẮT: ?baoanh=0 hoặc G.BT_ANH = false → đường cũ y nguyên (#ui + snap + maskOut).
  let tatAnh = false;
  // 15/10 don-tep B: bỏ cờ trùng ?btcu=1. Giữ ?baoanh=0 vì tests/bt_khop.py, bao_truoc.py, bt_tuong.py kiểm đường #ui cũ.
  try { tatAnh = /[?&]baoanh=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tatAnh = false; }
  if (G.BT_ANH == null) G.BT_ANH = !tatAnh;
  // hình học trên ảnh (điểm ảnh của tấm, in ra bởi dung-bao-truoc.py): o cỡ ô khung; R bán kính vòng; r0 bán kính trong của vành;
  // quạt: dinh = đỉnh (gốc) trên ô, nua = nửa góc mở (độ); dải: x0..x1 thân dải theo chiều dài, nua = nửa bề dày thân dải.
  // 14/10 (bước 1, mục 7): ảnh dựng lại bằng docs/review/ke-hoach-cai-thien/buoc-1-lam-chac/cong-cu/dung-bt-dong.py — cắt theo hình,
  // CĂN TÂM TỪNG KHUNG (tâm vòng / đỉnh quạt / tâm dải đo trên ảnh gốc), viền ngoài từng khung đúng R. Số dưới đây do công cụ in ra.
  const HA = {
    tron: { ma: 'gd-bt-tron', o: [184, 184], R: 64 },
    vanh: { ma: 'gd-bt-vanh', o: [184, 184], R: 64, r0: 38.73 },
    quat: { ma: 'gd-bt-quat', o: [81, 138], dinh: [4.84, 69], R: 64, nua: 44 },
    dai: { ma: 'gd-bt-dai', o: [170, 28], x0: 4.8, x1: 164.8, nua: 7.29 },
  };
  BT.HA = HA;
  const gdAnh = (ma) => { const SC = G.spriteCustom; return SC && SC.gdSan ? SC.gdSan(ma) : null; };
  const anhBat = () => G.BT_ANH !== false && !G.noRender;
  BT.anhBat = anhBat;
  // tấm đã nhuộm nhẹ theo hệ (băng / độc / lửa: cùng bảng TINT với kiểu cũ, đỏ vẫn là chủ đạo); nhớ theo ảnh gốc
  const NH = new Map();
  function tam(kieu, el) {
    const h = HA[kieu], g = gdAnh(h.ma);
    if (!g || !g.img) return null;
    if (g.img.width < h.o[0] * 8) return null; // ảnh lạ (sai cỡ): không dùng
    const t = TINT[el];
    if (!t) return g.img;
    const key = kieu + '|' + el;
    let e = NH.get(key);
    if (e && e.src === g.img) return e.cv;
    const cv = document.createElement('canvas'); cv.width = g.img.width; cv.height = g.img.height;
    const x = cv.getContext('2d'); x.drawImage(g.img, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(' + t[0] + ',' + t[1] + ',' + t[2] + ',' + (t[3] * 0.85).toFixed(3) + ')'; x.fillRect(0, 0, cv.width, cv.height);
    NH.set(key, (e = { src: g.img, cv }));
    return cv;
  }
  // vành có bán kính trong / ngoài khác ảnh gốc: dời bán kính từng điểm ảnh (giữ góc) để dải vành ảnh nằm đúng r0..r1; nhớ theo tỉ lệ (bước 0,05)
  const VR = new Map();
  function tamVanh(el, ti) {
    const src = tam('vanh', el);
    if (!src) return null;
    const h = HA.vanh, q = clamp(Math.round(ti * 20) / 20, 0, 0.95), key = el + '|' + q;
    let e = VR.get(key);
    if (e && e.src === src) return e.cv;
    let cv = src;
    try {
      const W = src.width, H = src.height, o = h.o[0], c = o / 2, R = h.R, r0 = h.r0, rin = q * R;
      const t = document.createElement('canvas'); t.width = W; t.height = H;
      const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
      const a = x.getImageData(0, 0, W, H), b = x.createImageData(W, H), A = a.data, B = b.data;
      for (let f = 0; f < 8; f++) for (let j = 0; j < o; j++) for (let i = 0; i < o; i++) {
        const dx = i + 0.5 - c, dy = j + 0.5 - c, rho = Math.hypot(dx, dy);
        if (rho < rin) continue;
        const sr = rho >= R ? rho : r0 + ((rho - rin) * (R - r0)) / Math.max(0.5, R - rin), k = rho > 0 ? sr / rho : 0;
        const sx = Math.floor(c + dx * k), sy = Math.floor(c + dy * k);
        if (sx < 0 || sy < 0 || sx >= o || sy >= o) continue;
        const si = (sy * W + f * o + sx) * 4, di = (j * W + f * o + i) * 4;
        B[di] = A[si]; B[di + 1] = A[si + 1]; B[di + 2] = A[si + 2]; B[di + 3] = A[si + 3];
      }
      x.putImageData(b, 0, 0); cv = t;
    } catch (err) { cv = src; } // không đọc được điểm ảnh: dùng ảnh gốc co theo r1
    if (VR.size > 24) VR.clear();
    VR.set(key, (e = { src, cv }));
    return cv;
  }
  let oCv = null, oCx = null; // tấm phụ để xoá khe vành / quạt (destination-out) mà không xoá nền
  function tamPhu(w, h) {
    if (!oCv) { oCv = document.createElement('canvas'); oCx = oCv.getContext('2d'); }
    if (oCv.width < w || oCv.height < h) { oCv.width = Math.max(w, oCv.width); oCv.height = Math.max(h, oCv.height); }
    oCx.setTransform(1, 0, 0, 1, 0, 0); oCx.globalCompositeOperation = 'source-over'; oCx.globalAlpha = 1; oCx.clearRect(0, 0, w, h); oCx.imageSmoothingEnabled = false;
    return oCx;
  }
  // khung (0..7) và độ đậm theo kiểu vẽ: mode 0 báo trước (u), 1 nổ (f 0..1 của FLASH), 2 bị huỷ (mờ dần)
  function khungVa(it, mode, f) {
    if (mode === 1) return [7, f < 0.35 ? 1 : clamp(1 - (f - 0.35) / 0.65, 0, 1)];
    // 14/10 (bước 1, mục 7): 8 khung kéo giãn đúng bằng thời gian báo trước — khung 1..7 chia đều từ lúc vùng hiện tới lúc nổ,
    // khung 8 (chớp nổ) bắt đầu ĐÚNG lúc đòn nổ (mode 1) rồi mờ dần.
    const fi = Math.min(6, Math.max(0, Math.floor((it.u || 0) * 7)));
    const ap = mode === 2 ? 1 : clamp((it.age || 0) / APPEAR, 0, 1), e = 1 - (1 - ap) * (1 - ap) * (1 - ap);
    // soát mượt phiên 3 mục 9A (?bthoa=0: nhảy 7 bậc như cũ): phần lẻ của u×7 → khung kế hoà lên trên (lan đều thay vì nhảy bậc);
    // 0,15 giây cuối trước khi nổ: nhịp sáng (lớp cộng sáng mạnh dần). Thời điểm, vùng, khung nổ không đổi.
    let hoa = 0, sang = 0;
    if (mode === 0 && G.BT_HOA !== false) {
      const v = clamp(it.u || 0, 0, 1) * 7;
      if (fi < 6) hoa = clamp(v - fi, 0, 1); // khung 7 giữ nguyên tới lúc nổ: không hoà sang khung 8 (chớp nổ) để không báo nổ sớm
      if (it.con != null && it.con < 0.15) sang = clamp(1 - it.con / 0.15, 0, 1);
    }
    return [fi, e * (it.dim == null ? 1 : it.dim), hoa, sang];
  }
  // Vẽ một vùng bằng ảnh lên c (toạ độ thế giới). Trả về false nếu hình này không có ảnh (để vẽ kiểu cũ).
  function veAnh(c, it, mode, f) {
    if (!anhBat()) return false;
    const k = it.k;
    // 14/10 (bước 1, mục 7): tường nước (Sóng thần) và đường ngắm cũng vẽ bằng ảnh dải (trước vẽ code) → có ảnh thì không còn hình code nào
    if (k === 'wall') return veTuong(c, it, mode, f);
    let kieu = k === 'circle' ? 'tron' : k === 'donut' ? (it.r0 < it.r1 * 0.15 ? 'tron' : 'vanh') : k === 'cone' ? (it.span >= TAU - 0.01 ? 'tron' : 'quat') : k === 'line' || k === 'rect' || k === 'aim' ? 'dai' : null;
    if (!kieu) return false;
    const src = kieu === 'vanh' ? tamVanh(it.el, it.r0 / Math.max(1, it.r1)) : tam(kieu, it.el);
    if (!src) return false;
    const [fi, al, hoa, sang] = khungVa(it, mode, f);
    if (al <= 0.003) return true;
    const h = HA[kieu], ow = h.o[0], oh = h.o[1];
    // mục 9A: vẽ khung fi, rồi khung fi+1 đè lên theo phần lẻ, rồi nhịp sáng cuối (cộng sáng) — cùng một hàm vẽ hình
    veHinh(c, it, k, kieu, src, h, ow, oh, fi * ow, al);
    if (hoa > 0.02) veHinh(c, it, k, kieu, src, h, ow, oh, (fi + 1) * ow, al * hoa);
    if (sang > 0.02) {
      const go = c.globalCompositeOperation;
      c.globalCompositeOperation = 'lighter';
      try { veHinh(c, it, k, kieu, src, h, ow, oh, Math.min(7, fi + (hoa > 0.5 ? 1 : 0)) * ow, al * 0.45 * sang * (0.6 + 0.4 * Math.sin(sang * Math.PI * 3))); } finally { c.globalCompositeOperation = go; }
    }
    return true;
  }
  // Soát mượt phiên 3 mục 22 (?venhe=0: cắt lát mỗi khung như cũ): quạt có góc mở khác ảnh phải cắt ~18 lát xoay mỗi khung. Dựng SẴN một
  // tấm theo (ảnh, khung, góc mở, bán kính) ở hệ toạ độ chưa xoay, rồi mỗi khung chỉ xoay dán 1 lần. Nhớ tối đa 24 tấm (dùng gần nhất giữ lại).
  const QS = new Map();
  function quatSan(c, src, h, ow, oh, sxo, it, s, half, ni, dx0, dy0) {
    try {
      const RR = it.r * 1.35, N = G.NET || 1, key = sxo + '|' + Math.round(it.span * 100) + '|' + Math.round(it.r) + '|' + N + '|' + it.el + '|' + h.R;
      let e = QS.get(key);
      if (e && e.src !== src) e = null;
      if (e) { QS.delete(key); QS.set(key, e); }
      else {
        const W = Math.ceil(RR * 2 * N) + 2, cv = document.createElement('canvas'); cv.width = cv.height = W;
        const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(N, 0, 0, N, W / 2, W / 2);
        const n = Math.max(3, Math.ceil(it.span / 0.12)), st = it.span / n, kk = ni / half, R2 = it.r * 1.35;
        for (let j = 0; j < n; j++) {
          const a0 = -half + j * st, a1 = a0 + st;
          const rot = j === 0 ? -half + ni : j === n - 1 ? half - ni : ((a0 + a1) / 2) * (1 - kk);
          g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R2, a0 - (j === 0 ? 0.35 : 0.004), a1 + (j === n - 1 ? 0.35 : 0.004)); g.closePath(); g.clip();
          g.rotate(rot); g.drawImage(src, sxo, 0, ow, oh, dx0, dy0, ow * s, oh * s); g.restore();
        }
        e = { src, cv, W };
        if (QS.size >= 24) QS.delete(QS.keys().next().value);
        QS.set(key, e);
      }
      const half2 = e.W / 2 / N;
      c.drawImage(e.cv, -half2, -half2, e.W / N, e.W / N);
      return true;
    } catch (err) { return false; }
  }
  function veHinh(c, it, k, kieu, src, h, ow, oh, sxo, al) {
    c.save();
    c.globalAlpha *= al; c.imageSmoothingEnabled = false;
    try {
      if (kieu === 'tron' || kieu === 'vanh') {
        const r = k === 'donut' ? it.r1 : it.r, ky = k === 'cone' ? 1 : it.ky || G.ZK || 0.6, s = r / h.R, w = ow * s, hh = oh * s * ky;
        const gaps = k === 'donut' && it.gaps && it.gw ? it.gaps : null;
        if (!gaps) c.drawImage(src, sxo, 0, ow, oh, it.x - w / 2, it.y - hh / 2, w, hh);
        else {
          // vành có khe: vẽ khung lên tấm phụ, xoá các cung khe bằng destination-out, rồi dán lên lớp đất
          const N = G.NET || 1, pw = Math.ceil(w * N), ph = Math.ceil(hh * N), o = tamPhu(pw, ph);
          o.drawImage(src, sxo, 0, ow, oh, 0, 0, pw, ph);
          o.globalCompositeOperation = 'destination-out'; o.fillStyle = '#000';
          o.translate(pw / 2, ph / 2); o.scale(1, ky);
          const RR = Math.max(pw, ph);
          for (const g of gaps) { o.beginPath(); o.moveTo(0, 0); o.arc(0, 0, RR, g - it.gw, g + it.gw); o.closePath(); o.fill(); }
          c.drawImage(oCv, 0, 0, pw, ph, it.x - w / 2, it.y - hh / 2, w, hh);
        }
      } else if (kieu === 'quat') {
        // đỉnh ảnh ở gốc vùng, xoay theo ang, giãn theo r; góc mở khác ảnh thì chia lát: mỗi lát xoay phần ảnh tương ứng vào đúng góc
        const s = it.r / h.R, half = it.span / 2, ni = (h.nua * Math.PI) / 180, dx0 = -h.dinh[0] * s, dy0 = -h.dinh[1] * s;
        c.translate(it.x, it.y); c.rotate(it.ang);
        if (Math.abs(half - ni) < 0.03) c.drawImage(src, sxo, 0, ow, oh, dx0, dy0, ow * s, oh * s);
        else if (G.VE_NHE !== false && quatSan(c, src, h, ow, oh, sxo, it, s, half, ni, dx0, dy0)) { /* mục 22: tấm quạt dựng sẵn */ }
        else {
          const n = Math.max(3, Math.ceil(it.span / 0.12)), st = it.span / n, kk = ni / half, RR = it.r * 1.35;
          for (let j = 0; j < n; j++) {
            const a0 = -half + j * st, a1 = a0 + st;
            const rot = j === 0 ? -half + ni : j === n - 1 ? half - ni : ((a0 + a1) / 2) * (1 - kk); // lát mép: khớp đúng viền mép ảnh
            c.save(); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, RR, a0 - (j === 0 ? 0.35 : 0.004), a1 + (j === n - 1 ? 0.35 : 0.004)); c.closePath(); c.clip();
            c.rotate(rot); c.drawImage(src, sxo, 0, ow, oh, dx0, dy0, ow * s, oh * s); c.restore();
          }
        }
      } else {
        // dải thẳng: thân dải (x0..x1, ±nua) kéo theo chiều dài và bề rộng vùng; chữ nhật đứng thì xoay dọc
        let x = it.x, y = it.y, ang = it.ang || 0, len = it.len, wd = it.w;
        if (k === 'rect') { if (it.w >= it.h) { y = it.y + it.h / 2; len = it.w; wd = it.h; ang = 0; } else { x = it.x + it.w / 2; ang = Math.PI / 2; len = it.h; wd = it.w; } }
        const sx = Math.max(0.01, len) / (h.x1 - h.x0), sy = Math.max(2, wd) / 2 / h.nua;
        c.translate(x, y); c.rotate(ang);
        c.drawImage(src, sxo, 0, ow, oh, -h.x0 * sx, (-oh / 2) * sy, ow * sx, oh * sy);
      }
    } finally { c.restore(); }
    return true;
  }
  // Tường nước: hai dải hai bên khe, sâu 40 theo hướng tường chạy (như path 'wall' kiểu cũ), mỗi dải là một ảnh dải xoay ngang hướng chạy.
  function veTuong(c, it, mode, f) {
    if (!tam('dai', 'ice')) return false;
    const lo = it.g - it.gw, hi = it.g + it.gw, ca = Math.cos(it.ang), sa = Math.sin(it.ang), d = it.s + 20; // giữa bề sâu 40
    const doan = [];
    if (lo > -it.half) doan.push([-it.half, lo]);
    if (hi < it.half) doan.push([hi, it.half]);
    for (const [a0, a1] of doan) {
      const m = (a0 + a1) / 2, L = a1 - a0;
      // dải dọc theo hướng vuông góc (ang + 90°), tâm ở (d, m) trong hệ toạ độ của tường
      const x = it.x + ca * d - sa * m, y = it.y + sa * d + ca * m, ang = it.ang + Math.PI / 2;
      veAnh(c, { k: 'line', x: x - Math.cos(ang) * L / 2, y: y - Math.sin(ang) * L / 2, ang, len: L, w: 40, el: 'ice', u: it.u, age: it.age, dim: it.dim, con: it.con }, mode, f);
    }
    return true;
  }
  BT.veAnh = veAnh;
  // Gọi từ G.drawWorld ngay trước khi vẽ nhân vật (chỗ BT.snap cũ). Kiểu ảnh: vẽ mọi vùng của khung này lên lớp đất.
  BT.dat = function (c, cam, sx, sy) {
    datXong = false;
    if (!BT.on || G.noRender) return;
    if (!anhBat()) { BT.snap(c); return; }
    need = false; snapOk = false;
    try {
      const W = G.getWorld ? G.getWorld() : null;
      if (W !== curW) return; // phòng mới: để BT.draw cuối khung dọn danh sách như cũ
      const con = [], conGone = [], conGhost = [];
      for (const it of BT.q) if (!veAnh(c, it, 0, 0)) con.push(it);
      for (const g of BT.gone) { const f = (G.time - g.at) / CANCEL; g.dim = (1 - f) * (1 - f); g.age = 1; if (!veAnh(c, g, 2, 0)) conGone.push(g); }
      for (const g of BT.ghosts) if (!veAnh(c, g, 1, (G.time - g.at) / FLASH)) conGhost.push(g);
      BT.q.length = 0;
      if (con.length || conGone.length || conGhost.length) {
        // hình không có ảnh (tường nước...): kiểu điểm ảnh cũ, vẽ thẳng lên lớp đất (không cần xoá chỗ thân)
        const B = [1e9, 1e9, -1e9, -1e9];
        for (const it of con) box(it, B); for (const g of conGone) box(g, B); for (const g of conGhost) box(g, B);
        const ox = -cam + (sx || 0), oy = sy || 0;
        const bx = clamp(Math.floor(B[0] + ox), 0, G.W), by = clamp(Math.floor(B[1] + oy), 0, G.H);
        const bw = clamp(Math.ceil(B[2] + ox), 0, G.W) - bx, bh = clamp(Math.ceil(B[3] + oy), 0, G.H) - by;
        if (bw > 0 && bh > 0) { c.save(); pxDraw(c, con, cam, sx, sy, bx, by, bw, bh, conGone, conGhost); c.restore(); }
      }
      datXong = true;
    } catch (e) {
      BT.errs++;
      if (BT.errs <= 2 && window.console) console.warn('bao_truoc anh', e);
    }
  };

  // ---------- vẽ một lượt lên tấm phụ rồi dán lên #ui ----------
  let cv = null, cx = null;
  BT.draw = function (cam, sx, sy) {
    const q = BT.q;
    const W = G.getWorld ? G.getWorld() : null;
    if (W !== curW) { curW = W; BT.ghosts.length = 0; BT.gone.length = 0; lastSeen.clear(); nowSeen.clear(); }
    // vùng khung trước còn, khung này mất mà chưa nổ: đòn bị huỷ -> mờ dần
    if (!G.noRender) for (const [z, it] of lastSeen) if (!nowSeen.has(z) && !fired.has(z) && z.dead && BT.gone.length < 40) { it.at = G.time; BT.gone.push(it); }
    const tmp = lastSeen; lastSeen = nowSeen; nowSeen = tmp; nowSeen.clear();
    BT.ghosts = BT.ghosts.filter((g) => G.time - g.at >= 0 && G.time - g.at < FLASH);
    BT.gone = BT.gone.filter((g) => G.time - g.at >= 0 && G.time - g.at < CANCEL);
    const daDat = datXong; datXong = false; // kiểu ảnh: ghosts / gone đã vẽ ở lớp đất; còn lại (nếu có) là vùng thêm muộn không có ảnh
    const GH = daDat ? [] : BT.ghosts, GO = daDat ? [] : BT.gone;
    if (daDat) need = false;
    if ((!q.length && !GH.length && !GO.length) || G.noRender || !W) { q.length = 0; return; }
    try {
      const sc = G.uiScale || 1, cw = Math.max(1, Math.round(G.W * sc)), ch = Math.max(1, Math.round(G.H * sc));
      if (!cv) { cv = document.createElement('canvas'); cx = cv.getContext('2d'); }
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; GR = null; }
      const c = cx;
      // khung bao (điểm ảnh màn hình game) của mọi hình trong khung này
      const B = [1e9, 1e9, -1e9, -1e9];
      for (const it of q) box(it, B);
      for (const g of GH) box(g, B);
      for (const g of GO) box(g, B);
      const ox = -cam + (sx || 0), oy = sy || 0;
      const bx = clamp(Math.floor(B[0] + ox), 0, G.W), by = clamp(Math.floor(B[1] + oy), 0, G.H);
      const bw = clamp(Math.ceil(B[2] + ox), 0, G.W) - bx, bh = clamp(Math.ceil(B[3] + oy), 0, G.H) - by;
      if (bw <= 0 || bh <= 0) { q.length = 0; return; }
      const dx = Math.floor(bx * sc), dy = Math.floor(by * sc), dw = Math.min(cw, Math.ceil((bx + bw) * sc)) - dx, dh = Math.min(ch, Math.ceil((by + bh) * sc)) - dy;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(dx, dy, dw, dh);
      c.setTransform(sc, 0, 0, sc, (-cam + (sx || 0)) * sc, (sy || 0) * sc);
      if (G.BT_PIXEL) pxDraw(c, q, cam, sx, sy, bx, by, bw, bh, GO, GH); // kiểu điểm ảnh (mặc định từ 12/10)
      else {
        for (const it of q) {
          if (it.k === 'wall') drawWallGap(c, it, sc);
          drawTele(c, it, sc);
        }
        for (const g of GH) drawFlash(c, g, (G.time - g.at) / FLASH, sc);
        for (const g of GO) { const f = (G.time - g.at) / CANCEL; g.dim = (1 - f) * (1 - f); g.age = 1; drawTele(c, g, sc); }
      }
      if (need && BT.mask !== 0) {
        // xoá chỗ nhân vật: trong phần chung của khung bao lúc vẽ và phần nền đã chụp
        const mx = Math.max(bx, SB[0]), my = Math.max(by, SB[1]), mw = Math.min(bx + bw, SB[0] + SB[2]) - mx, mh = Math.min(by + bh, SB[1] + SB[3]) - my;
        if (!(snapOk && mw > 0 && mh > 0 && maskOut(c, sc, mx, my, mw, mh))) bodies(c, W);
      }
      c.globalAlpha = 1;
      const u = G.ux;
      u.save();
      u.setTransform(sc, 0, 0, sc, G.ox * G.dpr, G.oy * G.dpr);
      u.globalAlpha = 1; u.globalCompositeOperation = 'source-over';
      u.drawImage(cv, dx, dy, dw, dh, dx / sc, dy / sc, dw / sc, dh / sc);
      u.restore();
    } catch (e) {
      BT.errs++;
      if (BT.errs <= 2 && window.console) console.warn('bao_truoc', e);
    }
    q.length = 0;
  };

  // ---------- nối vào: thay chỗ vẽ vùng ở lớp #world ----------
  const zone0 = A.zone;
  A.zone = function (c, z) {
    if (z.quiet && z.team !== 'player') return; // đòn thường của quái: không vẽ vùng báo trước ở bất kỳ lớp nào
    if (BT.zone(z)) {
      if (z.bomb && G.mobDrawBomb) G.mobDrawBomb(c, z); // quả bom vẫn vẽ điểm ảnh trên #world
      return;
    }
    return zone0(c, z);
  };
})();
