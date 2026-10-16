// Còn vẽ tay 8: móc vào bút canvas để ghi MỌI lệnh tô hình bằng code THỰC SỰ hiện ra trên 2 canvas người chơi thấy
// (#world = trận, #ui = giao diện). Chữ (fillText / strokeText) không tính.
// - Lệnh trên #world / #ui: fillRect, strokeRect, fill, stroke, putImageData. Lệnh bị G.ganChan chặn không tới đây (bọc ở bút, gọi
//   xuống prototype chỉ khi được vẽ) nên chỉ đếm cái thật sự hiện.
// - Canvas phụ (bộ đệm, khung quái dựng sẵn, nền phòng...): đánh dấu "nhiễm code" theo hàm đã tô lên nó; khi canvas đó được dán
//   (drawImage) lên #world / #ui thì ghi là "dán từ canvas code" kèm hàm gốc. Lệnh tô có globalCompositeOperation source-in /
//   source-atop / destination-* (nhuộm bóng / cắt) không tính là vẽ hình.
// - Mỗi khung có ghi (window.__bat): lưu bbox theo hàm, và window.__snap(nhãn) chụp ô quanh hình (ảnh ghép #world + #ui).
(() => {
  const P = CanvasRenderingContext2D.prototype;
  Error.stackTraceLimit = 18;
  const HELP = /^(p|r|ell|px|A\.p|A\.ellipse|F\.px|F\.elip|F\.dia|F\.vong|F\.cung|F\.duong|F\.cau|F\.sao|ring|line|star|vong|seg|pr|dot|rect|fillPx|K\.p|pp|q|pt|box|bar|dash|arc|hline|vline|plot|blk|rr|fr|c|o|veVien|glow|elip|duong|tron|sq|dia|tia|cham|nut|Array\.\w+|Function\.\w+|Reflect\.\w+|g0|chan|\w+\.<computed>|CanvasRenderingContext2D\.\w+|fillRoundRect|R|ELL|muiTen|quang|roundRect|rrect|pxRect|fillR|strokeR|pill|tri|poly)$/;
  window.__bat = false; window.__nhan = '';
  const R = (window.__kk = { o: {}, snaps: {}, frames: 0 });
  const lop = (c) => { const cv = c.canvas; if (!cv) return 'x'; if (cv.id === 'world') return 'W'; if (cv.id === 'ui') return 'U'; return 'o'; };
  function chu(stk) { // hàm chủ: khung đầu tiên không phải hàm trợ giúp tô điểm
    const L = stk.split('\n').slice(1, 16);
    let ex = [], own = null;
    for (const s of L) {
      const m = /at (?:new )?(.*?) ?\(?\S*?linh-khi\.html[^:]*:(\d+):\d+\)?$/.exec(s.trim());
      if (!m) continue;
      let fn = (m[1] || '').replace(/^async /, '').replace(/ \[as \w+\]/, '').trim() || '(ẩn danh)';
      ex.push(fn + '@' + m[2]);
      if (!own && !HELP.test(fn)) own = fn + '@' + m[2];
      if (own && ex.length >= 5) break;
    }
    return { own: own || ex[0] || '?', ex: ex.join(' < ') };
  }
  const MASK = { 'source-in': 1, 'source-atop': 1, 'destination-in': 1, 'destination-out': 1, 'destination-atop': 1, 'destination-over': 0, copy: 0, multiply: 1, screen: 1, overlay: 1, color: 1, hue: 1, saturation: 1, luminosity: 1, 'soft-light': 1, 'hard-light': 1 };
  // bbox đường vẽ theo toạ độ thiết bị
  function tf(c, x, y) { const m = c.__m; return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
  function addPt(c, x, y, r) {
    if (!c.__pb) c.__pb = [1e9, 1e9, -1e9, -1e9];
    if (!c.__m) c.__m = c.getTransform();
    const pts = r ? [[x - r, y - r], [x + r, y - r], [x - r, y + r], [x + r, y + r]] : [[x, y]];
    for (const [a, b] of pts) { const [u, v] = tf(c, a, b); const B = c.__pb; if (u < B[0]) B[0] = u; if (v < B[1]) B[1] = v; if (u > B[2]) B[2] = u; if (v > B[3]) B[3] = v; }
  }
  const SETT = ['setTransform', 'resetTransform', 'translate', 'scale', 'rotate', 'transform', 'restore'];
  for (const m of SETT) { const g = P[m]; P[m] = function () { this.__m = null; return g.apply(this, arguments); }; }
  const bp = P.beginPath; P.beginPath = function () { this.__pb = null; return bp.apply(this, arguments); };
  const PATH = { moveTo: (c, a) => addPt(c, a[0], a[1]), lineTo: (c, a) => addPt(c, a[0], a[1]), rect: (c, a) => { addPt(c, a[0], a[1]); addPt(c, a[0] + a[2], a[1] + a[3]); },
    roundRect: (c, a) => { addPt(c, a[0], a[1]); addPt(c, a[0] + a[2], a[1] + a[3]); }, arc: (c, a) => addPt(c, a[0], a[1], a[2]), ellipse: (c, a) => addPt(c, a[0], a[1], Math.max(a[2], a[3])),
    arcTo: (c, a) => { addPt(c, a[0], a[1]); addPt(c, a[2], a[3]); }, quadraticCurveTo: (c, a) => { addPt(c, a[0], a[1]); addPt(c, a[2], a[3]); },
    bezierCurveTo: (c, a) => { addPt(c, a[0], a[1]); addPt(c, a[2], a[3]); addPt(c, a[4], a[5]); } };
  for (const m in PATH) { const g = P[m]; if (!g) continue; P[m] = function () { if (window.__bat && lop(this) !== 'o') PATH[m](this, arguments); return g.apply(this, arguments); }; }
  function ghi(c, l, meth, bb, via) {
    const st = chu(String(new Error().stack));
    const k = l + ' ' + meth + ' | ' + st.own + (via ? ' ⇐ ' + via : '');
    let o = R.o[k];
    if (!o) o = R.o[k] = { n: 0, f: 0, lastF: -1, nhan: {}, ex: st.ex, bb: null };
    o.n++; if (o.lastF !== R.frames) { o.f++; o.lastF = R.frames; o.bb = null; }
    o.nhan[window.__nhan] = (o.nhan[window.__nhan] || 0) + 1;
    if (bb) { const B = o.bb || (o.bb = [1e9, 1e9, -1e9, -1e9]); B[0] = Math.min(B[0], bb[0]); B[1] = Math.min(B[1], bb[1]); B[2] = Math.max(B[2], bb[2]); B[3] = Math.max(B[3], bb[3]); o.bbL = l; }
  }
  function rectBB(c, x, y, w, h) { c.__m = c.__m || c.getTransform(); const p = [tf(c, x, y), tf(c, x + w, y), tf(c, x, y + h), tf(c, x + w, y + h)]; return [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))]; }
  // nhiễm code canvas phụ
  function nhiem(c, meth) {
    const cv = c.canvas; if (!cv) return;
    const ko = cv.__ko || (cv.__ko = {});
    const n = cv.__kn = (cv.__kn || 0) + 1;
    if (n <= 4 || n % 200 === 0 || Object.keys(ko).length === 0) { const st = chu(String(new Error().stack)); ko[st.own] = (ko[st.own] || 0) + 1; cv.__kex = cv.__kex || st.ex; }
  }
  for (const m of ['fillRect', 'strokeRect', 'fill', 'stroke']) {
    const g = P[m];
    P[m] = function (a0, a1, a2, a3) {
      const l = lop(this);
      if (l === 'o') { if (!MASK[this.globalCompositeOperation]) nhiem(this, m); }
      else if (window.__bat && !MASK[this.globalCompositeOperation] && this.globalAlpha > 0.003) {
        let bb = null;
        if (m === 'fillRect' || m === 'strokeRect') bb = rectBB(this, a0, a1, a2, a3);
        else if (this.__pb && !(a0 instanceof Path2D)) bb = this.__pb.slice();
        ghi(this, l, m, bb);
      }
      return g.apply(this, arguments);
    };
  }
  const cr = P.clearRect; P.clearRect = function (x, y, w, h) { const cv = this.canvas; if (cv && cv.__ko && lop(this) === 'o') { const bb = rectBB(this, x, y, w, h); if (bb[0] <= 0 && bb[1] <= 0 && bb[2] >= cv.width && bb[3] >= cv.height) { cv.__ko = null; cv.__kn = 0; } } return cr.apply(this, arguments); };
  // ImageData: tạo mới (createImageData / new ImageData) = điểm ảnh code; lấy từ getImageData = xử lý ảnh có sẵn
  const gid = P.getImageData; P.getImageData = function () { const d = gid.apply(this, arguments); try { d.__tu = this.canvas && this.canvas.__ko ? Object.keys(this.canvas.__ko).join(',') : 'anh'; } catch (e) {} return d; };
  const pid = P.putImageData;
  P.putImageData = function (d) {
    const l = lop(this);
    if (l === 'o') { const cv = this.canvas; if (cv) { const st = chu(String(new Error().stack)); const ko = cv.__ko || (cv.__ko = {}); const k = st.own + (d.__tu === 'anh' ? ' [sửa điểm ảnh]' : ' [điểm ảnh code]'); ko[k] = (ko[k] || 0) + 1; cv.__kex = cv.__kex || st.ex; } }
    else if (window.__bat) ghi(this, l, 'putImageData', null);
    return pid.apply(this, arguments);
  };
  const di = P.drawImage;
  P.drawImage = function (src) {
    const l = lop(this);
    const isCv = typeof HTMLCanvasElement !== 'undefined' && src instanceof HTMLCanvasElement || typeof OffscreenCanvas !== 'undefined' && src instanceof OffscreenCanvas;
    if (isCv && (src.id === 'world' || src.id === 'ui')) return di.apply(this, arguments);
    if (l === 'o') {
      const cv = this.canvas;
      if (cv && isCv && src.__ko) { const ko = cv.__ko || (cv.__ko = {}); for (const k in src.__ko) ko[k] = (ko[k] || 0) + src.__ko[k]; cv.__kex = cv.__kex || src.__kex; }
    } else if (window.__bat && isCv && src.__ko && this.globalAlpha > 0.003) {
      const a = arguments; let bb = null;
      if (a.length === 3) bb = rectBB(this, a[1], a[2], src.width, src.height);
      else if (a.length === 5) bb = rectBB(this, a[1], a[2], a[3], a[4]);
      else if (a.length === 9) bb = rectBB(this, a[5], a[6], a[7], a[8]);
      const via = Object.entries(src.__ko).sort((x, y) => y[1] - x[1]).slice(0, 3).map((x) => x[0]).join(' + ');
      ghi(this, l, 'drawImage', bb, via + ' [canvas ' + src.width + 'x' + src.height + ']');
    }
    return di.apply(this, arguments);
  };
  // Chụp ô quanh hình. Ảnh ghép trong hệ toạ độ #ui (điểm ảnh thiết bị).
  let comp = null, compF = -1;
  function ghep() {
    if (compF === R.frames && comp) return comp;
    const ui = document.getElementById('ui'), w = document.getElementById('world');
    if (!comp) comp = document.createElement('canvas');
    comp.width = ui.width; comp.height = ui.height;
    const g = comp.getContext('2d'), d = G.dpr || 1;
    g.imageSmoothingEnabled = false; cr.call(g, 0, 0, comp.width, comp.height);
    di.call(g, w, G.ox * d, G.oy * d, G.W * G.scale * d, G.H * G.scale * d); di.call(g, ui, 0, 0);
    compF = R.frames; return comp;
  }
  // bbox về hệ #ui
  function veUi(o) {
    const B = o.bb; if (!B) return null;
    if (o.bbL === 'U') return B.slice();
    const d = G.dpr || 1, k = (G.scale * d) / (G.NET || 1);
    return [G.ox * d + B[0] * k, G.oy * d + B[1] * k, G.ox * d + B[2] * k, G.oy * d + B[3] * k];
  }
  window.__snap = function () {
    const ui = document.getElementById('ui'), SW = ui.width, SH = ui.height;
    for (const k in R.o) {
      const o = R.o[k]; if (o.lastF !== R.frames) continue;
      const b = veUi(o); if (!b) continue;
      const x0 = Math.max(0, b[0]), y0 = Math.max(0, b[1]), x1 = Math.min(SW, b[2]), y1 = Math.min(SH, b[3]);
      if (x1 - x0 < 2 || y1 - y0 < 2) continue;
      const ar = (x1 - x0) * (y1 - y0), s0 = R.snaps[k];
      const tot = ar / (SW * SH);
      if (s0 && s0.n0 > 6) continue;
      if (s0) s0.n0 = (s0.n0 || 0) + 1;
      const P0 = 30, cx0 = Math.max(0, Math.floor(x0 - P0)), cy0 = Math.max(0, Math.floor(y0 - P0)), cx1 = Math.min(SW, Math.ceil(x1 + P0)), cy1 = Math.min(SH, Math.ceil(y1 + P0));
      const g0 = ghep(), t = document.createElement('canvas'); t.width = cx1 - cx0; t.height = cy1 - cy0;
      const tg = t.getContext('2d'); tg.imageSmoothingEnabled = false; di.call(tg, g0, cx0, cy0, t.width, t.height, 0, 0, t.width, t.height);
      let sang = 0; try { const q = tg.getImageData(0, 0, t.width, t.height).data; let s2 = 0, m = 0; for (let i = 0; i < q.length; i += 4 * 7) { s2 += q[i] * 0.3 + q[i + 1] * 0.59 + q[i + 2] * 0.11; m++; } sang = m ? s2 / m : 0; } catch (e) { sang = 99; }
      if (s0 && !(s0.sang < 40 && sang > s0.sang * 1.5) && !(s0.ar < 400 && ar > s0.ar * 2 && tot < 0.5) && !(s0.tot > 0.6 && tot < 0.5 && ar > 600)) continue;
      R.snaps[k] = { ar, tot, sang, nhan: window.__nhan, crop: [cx0, cy0, cx1, cy1], bb: [x0 - cx0, y0 - cy0, x1 - cx0, y1 - cy0], png: t.toDataURL('image/png') };
    }
  };
  // chụp cả màn hình (ảnh ghép) — cho ảnh toàn cảnh
  window.__full = () => ghep().toDataURL('image/png');
  window.__khung = () => { R.frames++; };
})();
