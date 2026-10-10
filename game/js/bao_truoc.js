// Vùng báo trước đòn của quái, tinh anh, trùm nhỏ, trùm vùng: vẽ MỊN ở lớp nét cao (#ui) thay cho từng điểm ảnh ở lớp #world.
// Chỉ đổi cách vẽ: thời gian báo trước, vùng va chạm, sát thương giữ nguyên (đọc thẳng từ vùng của luật chơi).
// Trong khung hình: art.js/mobs.js/room_art.js gọi G.baoTruoc.add(...) thay vì tự vẽ lên #world; cuối G.drawWorld
// (combat.js) gọi G.baoTruoc.draw(cam, sx, sy) để vẽ hết một lượt lên một tấm vẽ phụ rồi dán lên #ui.
// Kiểu vẽ: lòng đỏ trong suốt, viền sáng mảnh, mép mềm, góc bo nhẹ; hiện ra mượt (~0,15 giây); phần đỏ đậm lấp dần từ
// gốc ra (quạt theo bán kính, đường thẳng theo chiều đòn, tròn từ tâm, vành từ trong ra), đầy đúng lúc đòn ra;
// đòn ra thì chớp sáng một nhịp rồi tan (~0,2 giây). Màu pha nhẹ theo hệ (băng xanh, độc lục, lửa cam) nhưng vẫn là đỏ.
// Vì #ui nằm trên #world, chỗ thân em bé và quái đứng được xoá bớt (mềm) để vùng trông như nằm dưới chân.
(function () {
  const G = window.G;
  const A = G.art;
  if (!A) return;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const APPEAR = 0.15, FLASH = 0.22;

  const BT = (G.baoTruoc = { q: [], ghosts: [], on: true, mask: true, errs: 0 });
  const seen = new WeakMap(); // vật -> lúc thấy lần đầu (G.time), để làm hiện ra mượt cho vùng không có t0
  const fired = new WeakSet(); // vùng đã chớp nổ (khỏi chớp hai lần)
  let curW = null;

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
  BT.add = function (it) { if (BT.q.length < 400) BT.q.push(it); };
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
      BT.add({ k: 'wall', x: z.x, y: z.y, ang: z.ang, s: z.s, half: z.half, g: z.g, gw: z.gw, el: 'ice', u: clamp(age / Math.max(0.05, tot), 0, 1), age });
      return true;
    }
    const sh = z.shape;
    if (sh !== 'circle' && sh !== 'rect' && sh !== 'line' && sh !== 'cone' && sh !== 'donut') return false;
    if (z.t > 0) {
      const it = geo(z), t0 = z.t0 || 0;
      it.age = t0 ? t0 - z.t : since(z);
      it.u = t0 ? clamp(1 - z.t / t0, 0, 1) : 0;
      if (z.bomb && z.bomb.fl > 0) { const gone = t0 - z.t, fl = z.bomb.fl; it.age = gone; it.u = gone < fl ? 0 : clamp((gone - fl) / Math.max(0.01, t0 - fl), 0, 1); }
      BT.add(it);
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
    c.restore();
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
      // từ toạ độ thế giới sang điểm ảnh #world (đang có phép dời của khung)
      const m = c.getTransform(), w = c.canvas;
      const x = clamp(Math.floor(B[0] + m.e) - 2, 0, w.width), y = clamp(Math.floor(B[1] + m.f) - 2, 0, w.height);
      const x1 = clamp(Math.ceil(B[2] + m.e) + 2, 0, w.width), y1 = clamp(Math.ceil(B[3] + m.f) + 2, 0, w.height);
      if (x1 <= x || y1 <= y) { need = false; return; }
      SB[0] = x; SB[1] = y; SB[2] = x1 - x; SB[3] = y1 - y;
      if (filt == null) filt = makeFilter();
      if (!filt || !BT.mask) return; // không có bộ lọc: xoá gần đúng quanh thân (bodies)
      if (!snapCv) snapCv = document.createElement('canvas');
      if (snapCv.width !== w.width || snapCv.height !== w.height) { snapCv.width = w.width; snapCv.height = w.height; }
      const s = snapCv.getContext('2d');
      s.clearRect(x, y, SB[2], SB[3]);
      s.drawImage(w, x, y, SB[2], SB[3], x, y, SB[2], SB[3]);
      snapOk = true;
    } catch (e) { snapOk = false; need = false; }
  };
  // chỉ làm trong khung bao (x, y, w, h: điểm ảnh của #world) để nhẹ máy
  function maskOut(c, sc, x, y, w, h) {
    if (!filt || !snapOk) return false;
    const wv = G.wx.canvas, kx = c.canvas.width / wv.width, ky = c.canvas.height / wv.height;
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
      const a0 = it.k === 'wall' ? it.s : 0, a1 = it.k === 'wall' ? it.s + 40 : it.len, b = it.k === 'wall' ? it.half : it.w / 2;
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

  // ---------- vẽ một lượt lên tấm phụ rồi dán lên #ui ----------
  let cv = null, cx = null;
  BT.draw = function (cam, sx, sy) {
    const q = BT.q;
    const W = G.getWorld ? G.getWorld() : null;
    if (W !== curW) { curW = W; BT.ghosts.length = 0; }
    BT.ghosts = BT.ghosts.filter((g) => G.time - g.at >= 0 && G.time - g.at < FLASH);
    if ((!q.length && !BT.ghosts.length) || G.noRender || !W) { q.length = 0; return; }
    try {
      const sc = G.uiScale || 1, cw = Math.max(1, Math.round(G.W * sc)), ch = Math.max(1, Math.round(G.H * sc));
      if (!cv) { cv = document.createElement('canvas'); cx = cv.getContext('2d'); }
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; GR = null; }
      const c = cx;
      // khung bao (điểm ảnh màn hình game) của mọi hình trong khung này
      const B = [1e9, 1e9, -1e9, -1e9];
      for (const it of q) box(it, B);
      for (const g of BT.ghosts) box(g, B);
      const ox = -cam + (sx || 0), oy = sy || 0;
      const bx = clamp(Math.floor(B[0] + ox), 0, G.W), by = clamp(Math.floor(B[1] + oy), 0, G.H);
      const bw = clamp(Math.ceil(B[2] + ox), 0, G.W) - bx, bh = clamp(Math.ceil(B[3] + oy), 0, G.H) - by;
      if (bw <= 0 || bh <= 0) { q.length = 0; return; }
      const dx = Math.floor(bx * sc), dy = Math.floor(by * sc), dw = Math.min(cw, Math.ceil((bx + bw) * sc)) - dx, dh = Math.min(ch, Math.ceil((by + bh) * sc)) - dy;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(dx, dy, dw, dh);
      c.setTransform(sc, 0, 0, sc, (-cam + (sx || 0)) * sc, (sy || 0) * sc);
      for (const it of q) {
        if (it.k === 'wall') drawWallGap(c, it, sc);
        drawTele(c, it, sc);
      }
      for (const g of BT.ghosts) drawFlash(c, g, (G.time - g.at) / FLASH, sc);
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
