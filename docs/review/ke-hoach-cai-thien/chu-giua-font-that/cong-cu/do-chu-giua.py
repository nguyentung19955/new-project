#!/usr/bin/env python3
"""Soát CHỮ NẰM GIỮA KHUNG bằng ảnh chụp tự động (can-chu-khung, 16/10). KHÔNG chơi thử game.

Mở bản một tệp game/dist/linh-khi.html (?cloud=0) trong Chromium không màn hình (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers),
DỪNG vòng lặp khung hình, dựng trạng thái từng màn (bản lưu thử, mở bảng...), vẽ ĐÚNG MỘT khung hình rồi đo:
  - KHUNG: (a) hàm khung của giao diện (T.btn, T.sbtn, T.card, T.panel, T.dialog + thẻ tên, T.toast, T.plate, T.inset, T.theNho,
    T.theSapCo, T.khungCanhBao, T.bossBar) và (b) MỌI ảnh khung gd-* dán lên lớp giao diện (lần theo drawImage qua các lớp nhớ đệm:
    ảnh 9 mảnh ghép sẵn, lớp bóng + lót), kể cả khung nơi gọi tự dán (sổ yêu quái, phúc lành, ô vũ khí...).
  - LÒNG khung (khung xanh trong ảnh soát): T.longKhung (lòng thật đo từ ảnh, cùng bảng game dùng), khung code: trong viền code.
  - CHỮ (khung đỏ): mỗi lần gọi ui.text = một cụm (gồm cả biểu tượng tài nguyên vẽ trong dòng), hộp chữ thật (actualBoundingBox),
    đường cơ sở, cao chữ hoa "H", căn (trái / giữa / phải), phần bị vùng cắt (clip) che.
  - BIỂU TƯỢNG: ảnh không phải khung dán lên lớp giao diện (để soát chữ đè biểu tượng, cụm biểu tượng + chữ trên nút).
Lỗi (tô đỏ):
  lech-ngang  chữ căn giữa (hoặc cụm biểu tượng + chữ) lệch tâm ngang của lòng > ngưỡng (2 điểm game; khung hẹp: 6% bề rộng lòng, tối thiểu 1)
  lech-doc    khung nhãn (cao ≤ 40): khối chữ hoa (đỉnh "H" dòng đầu → đường cơ sở dòng cuối, kèm biểu tượng xếp trên / dưới) lệch tâm dọc
              của lòng > ngưỡng (cùng ngưỡng: 2 điểm, khung hẹp 6% bề rộng lòng, tối thiểu 1)
  tran        chữ ra ngoài lòng khung > 0,25 điểm
  cham        chữ trong lòng nhưng cách mép lòng < 0,5 điểm
  cat         chữ cắt "…" hoặc bị vùng cắt che một phần
  de-chu      hai cụm chữ trong cùng khung chồng nhau
  de-icon     chữ đè lên biểu tượng trong cùng khung
Chế độ: cu (?canchucu=1, cách đặt chữ trước phiên này) và moi; ngôn ngữ vi, en; cỡ màn 844×390, 667×375, 1280×720.
Phông: máy thử không tải được Google Fonts nên "Be Vietnam Pro" thay bằng Inter (gần cỡ).

  python3 do-can-chu.py <thư mục ra>                 -> <ra>/ket-qua.json + ảnh chụp từng màn
  python3 do-can-chu.py <thư mục ra> --anh <đích>    -> ảnh lưới trước/sau mỗi màn (VI, EN) vào thư mục đích
  biến: CANH=a,b (chỉ vài màn) · CO=844,667,1280 · MODE=cu,moi · LANG=vi,en · TEP=<html khác> (đo bản dựng khác, vd bản trước phiên)
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/do-can-chu'
os.makedirs(OUT, exist_ok=True)

# Phông đứng thay "Be Vietnam Pro" (máy thử không tải được phông thật: mạng chặn Google Fonts, npm, jsDelivr, GitHub):
PHONG_THAY = {
    'inter': ("local('Inter Medium')", "local('Inter Bold')"),                      # phiên trước dùng; dáng gần Be Vietnam Pro
    'poppins': ("local('Poppins Medium')", "local('Poppins Bold')"),                # dấu tiếng Việt + chân chữ rất cao (thử khắc nghiệt)
    'liberation': ("local('Liberation Sans')", "local('Liberation Sans Bold')"),    # cùng số đo Helvetica / Arial (phông dự phòng iOS gần nhất)
    'dejavu': ("local('DejaVu Sans')", "local('DejaVu Sans Bold')"),                # rộng, cao
}
PHONG = os.environ.get('PHONG', 'inter')
CSS_PHONG = ("@font-face{font-family:'Be Vietnam Pro';font-weight:500;src:%s}@font-face{font-family:'Be Vietnam Pro';font-weight:700;src:%s}" % PHONG_THAY[PHONG]) if PHONG in PHONG_THAY else ''
NGUONG = float(os.environ.get('NGUONG', '0.5'))  # ngưỡng lệch tâm (điểm game)
SAFARI = os.environ.get('SAFARI', '')  # đường dẫn tệp giả lập số đo Safari (gia-lap-safari-*.js), nạp trước game

INIT = r"""
(() => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__tinh = false;
  window.requestAnimationFrame = (cb) => (window.__tinh ? 0 : raf(cb));
  const P = CanvasRenderingContext2D.prototype, f0 = P.fillText, m0 = P.measureText, d0 = P.drawImage, cr0 = P.clearRect;
  window.__chu = []; window.__anh = []; window.__do = false; window.__khung = []; window.__ngan = []; window.__seq = 0; window.__run = null;
  const r0 = P.rect, c0 = P.clip, s0 = P.save, re0 = P.restore, bp0 = P.beginPath;
  const dev = (ctx, x, y) => { const M = ctx.getTransform(); return [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]; };
  P.beginPath = function () { this.__r = null; return bp0.apply(this, arguments); };
  P.rect = function (x, y, w, h) { const a = dev(this, x, y), b = dev(this, x + w, y + h); this.__r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; return r0.apply(this, arguments); };
  P.clip = function () { if (this.__r) { const c = this.__c, r = this.__r; this.__c = c ? [Math.max(c[0], r[0]), Math.max(c[1], r[1]), Math.min(c[2], r[2]), Math.min(c[3], r[3])] : r.slice(); } else this.__c = this.__c || [-1e9, -1e9, 1e9, 1e9]; return c0.apply(this, arguments); };
  P.save = function () { (this.__cs = this.__cs || []).push(this.__c || null); return s0.apply(this, arguments); };
  P.restore = function () { if (this.__cs && this.__cs.length) this.__c = this.__cs.pop(); return re0.apply(this, arguments); };
  P.clearRect = function (x, y, w, h) { try { const cv = this.canvas; if (cv && cv.__src && !cv.isConnected) { const a = dev(this, x, y), b = dev(this, x + w, y + h); if (a[0] <= 0 && a[1] <= 0 && b[0] >= cv.width && b[1] >= cv.height) cv.__src = []; } } catch (e) {} return cr0.apply(this, arguments); };
  const G2 = (v, o) => v; // chỗ giữ
  // HỘP MỰC THẬT bằng quét điểm ảnh ở cỡ 64 px (không dùng số đo của trình duyệt, không dùng mã game): { l, r, a, d, ab } theo em
  const MUC = new Map(); let mc = null, mg = null;
  window.__muc = (font, t) => {
    const k = font + '|' + t; let q = MUC.get(k); if (q) return q;
    if (!mc) { mc = document.createElement('canvas'); mg = mc.getContext('2d', { willReadFrequently: true }); }
    const one = (s) => {
      const f = font.replace(/\d+(\.\d+)?px/, '64px'); mg.font = f; const W = m0.call(mg, s).width;
      const cw = Math.ceil(W + 128), ch = 180, base = 110; mc.width = cw; mc.height = ch;
      mg.font = f; mg.textAlign = 'left'; mg.textBaseline = 'alphabetic'; mg.fillStyle = '#000'; f0.call(mg, s, 64, base);
      const d = mg.getImageData(0, 0, cw, ch).data; let x0 = cw, x1 = -1, y0 = ch, y1 = -1;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (d[(y * cw + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
      return x1 < 0 ? null : { l: (64 - x0) / 64, r: (x1 + 1 - 64) / 64, a: (base - y0) / 64, d: (y1 + 1 - base) / 64, w: W / 64 };
    };
    q = one(t) || { l: 0, r: 0, a: 0, d: 0, w: 0 };
    const bd = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const qb = bd === t ? q : one(bd);
    q.ab = qb ? qb.a : q.a;
    if (MUC.size > 4000) MUC.clear(); MUC.set(k, q); return q;
  };
  window.__g = (ctx) => { const s = G.uiScale, ox = G.ox * G.dpr, oy = G.oy * G.dpr; return { s, ox, oy }; };
  P.drawImage = function (src) {
    try {
      const cv = this.canvas, a = arguments;
      const SW = src.width || src.naturalWidth || 0, SH = src.height || src.naturalHeight || 0;
      let sx = 0, sy = 0, sw = SW, sh = SH, dx, dy, dw = SW, dh = SH;
      if (a.length === 3) { dx = a[1]; dy = a[2]; } else if (a.length === 5) { dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4]; } else { sx = a[1]; sy = a[2]; sw = a[3]; sh = a[4]; dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8]; }
      const M = this.getTransform();
      if (Math.abs(M.b) < 1e-9 && Math.abs(M.c) < 1e-9 && SW > 0) {
        const x0 = M.a * dx + M.e, y0 = M.d * dy + M.f, x1 = M.a * (dx + dw) + M.e, y1 = M.d * (dy + dh) + M.f;
        const rec = { src, sr: [sx, sy, sw, sh], d: [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)], al: this.globalAlpha };
        if (cv && cv.id === 'ui') {
          if (window.__do && rec.al > 0.05) {
            const g = window.__g(), c = this.__c;
            rec.g = [(rec.d[0] - g.ox) / g.s, (rec.d[1] - g.oy) / g.s, rec.d[2] / g.s, rec.d[3] / g.s];
            if (c) { const q = [(c[0] - g.ox) / g.s, (c[1] - g.oy) / g.s, (c[2] - g.ox) / g.s, (c[3] - g.oy) / g.s]; rec.clip = q; }
            rec.seq = window.__seq++; rec.k = window.__ngan.length ? window.__ngan[window.__ngan.length - 1] : -1;
            rec.trongChu = !!window.__run;
            window.__anh.push(rec);
          }
        } else if (cv && !cv.isConnected) { const L = cv.__src || (cv.__src = []); if (L.length < 80) L.push(rec); }
      }
    } catch (e) { /* bỏ qua */ }
    return d0.apply(this, arguments);
  };
  P.fillText = function (t, x, y, mw) {
    try {
      if (window.__do && this.canvas && this.canvas.id === 'ui' && String(t).trim() && window.G && G.uiScale) {
        const fs = String(this.fillStyle);
        if (!(fs.indexOf('rgba(0, 0, 0, 0.75)') === 0 || fs === 'rgba(0,0,0,0.75)') && this.globalAlpha > 0.05) {
          const fpx = parseFloat(/(\d+(\.\d+)?)px/.exec(this.font)[1]), q0 = window.__muc(this.font, String(t)), W0 = m0.call(this, t).width;
          const al = this.textAlign, ax = al === 'center' ? -W0 / 2 : al === 'right' ? -W0 : 0; // neo theo textAlign → neo trái
          const m = { actualBoundingBoxLeft: q0.l * fpx - ax, actualBoundingBoxRight: q0.r * fpx + ax, actualBoundingBoxAscent: q0.a * fpx, actualBoundingBoxDescent: q0.d * fpx };
          const M = this.getTransform(), g = window.__g();
          const gx = (lx) => (M.a * lx + M.e - g.ox) / g.s, gy = (ly) => (M.d * ly + M.f - g.oy) / g.s;
          // vị trí neo theo textAlign
          const l = x - m.actualBoundingBoxLeft, r = x + m.actualBoundingBoxRight;
          const hop = [gx(l), gy(y - m.actualBoundingBoxAscent), gx(r), gy(y + m.actualBoundingBoxDescent)];
          let thay = hop.slice(), cat = 0;
          const cl = this.__c;
          if (cl) { const c = [(cl[0] - g.ox) / g.s, (cl[1] - g.oy) / g.s, (cl[2] - g.ox) / g.s, (cl[3] - g.oy) / g.s];
            thay = [Math.max(hop[0], c[0]), Math.max(hop[1], c[1]), Math.min(hop[2], c[2]), Math.min(hop[3], c[3])];
            if (thay[2] <= thay[0] + 0.3 || thay[3] <= thay[1] + 0.3) return f0.call(this, t, x, y, mw); // khuất hẳn
            cat = Math.max(thay[0] - hop[0], hop[2] - thay[2], thay[1] - hop[1], hop[3] - thay[3]); }
          const part = { s: String(t), hop: thay, cat, base: gy(y), capH: q0.ab * fpx * M.d / g.s, align: this.textAlign,
            px: parseFloat(/(\d+(\.\d+)?)px/.exec(this.font)[1]) * M.a / g.s, seq: window.__seq++ };
          if (window.__run) window.__run.parts.push(part);
          else window.__ketRun({ s: String(t), o: { align: this.textAlign }, parts: [part], anh: [], k: window.__ngan.length ? window.__ngan[window.__ngan.length - 1] : -1, n: window.__khung.length });
        }
      }
    } catch (e) { /* bỏ qua */ }
    return f0.call(this, t, x, y, mw);
  };
  window.__ketRun = (run) => {
    if (!run.parts.length) return;
    const p0 = run.parts[0];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of run.parts) { x0 = Math.min(x0, p.hop[0]); y0 = Math.min(y0, p.hop[1]); x1 = Math.max(x1, p.hop[2]); y1 = Math.max(y1, p.hop[3]); }
    for (const a of run.anh) { if (!a.g) continue; x0 = Math.min(x0, a.g[0]); y0 = Math.min(y0, a.g[1]); x1 = Math.max(x1, a.g[0] + a.g[2]); y1 = Math.max(y1, a.g[1] + a.g[3]); }
    window.__chu.push({ s: run.parts.map((p) => p.s).join('').slice(0, 80), hop: [x0, y0, x1, y1], base: p0.base, capH: p0.capH, px: p0.px,
      align: (run.o && run.o.align) || p0.align || 'left', cat: Math.max(...run.parts.map((p) => p.cat)), seq: p0.seq, k: run.k, n: run.n, nIcon: run.anh.length });
  };
})();
"""

BOC = r"""
(() => {
  const NGUONG_JS = window.__nguong;
  const T = G.theme, K = window.__khung, N = window.__ngan;
  const kc = (ma) => (G.KHUNG_ANH === false || !G.spriteCustom || !G.spriteCustom.gdSan ? null : G.spriteCustom.gdSan(ma));
  const MA_NUT = { n: 'gd-nut-thuong', p: 'gd-nut-chinh', d: 'gd-nut-nguy', s: 'gd-nut-chon' };
  // một lần gọi ui.text = một cụm chữ (gồm biểu tượng tài nguyên vẽ trong dòng)
  const ut = G.ui.text;
  G.ui.text = function (s, x, y, o) {
    if (!window.__do || window.__run) return ut.apply(this, arguments);
    const run = (window.__run = { s: String(s), o: o || {}, parts: [], anh: [], k: N.length ? N[N.length - 1] : -1, n: K.length });
    const a0 = window.__anh.length;
    try { return ut.apply(this, arguments); } finally { window.__run = null; run.anh = window.__anh.slice(a0).filter((q) => q.trongChu); window.__ketRun(run); }
  };
  function boc(ten, ghi) {
    const f = T[ten];
    T[ten] = function () {
      const a = Array.prototype.slice.call(arguments);
      const q = window.__do ? ghi.apply(null, a) : null;
      if (q) { q.ten = ten; q.seq = window.__seq++; K.push(q); N.push(K.length - 1); }
      try { const r = f.apply(this, arguments); if (q && q.sau) q.sau(r, q); return r; } finally { if (q) N.pop(); }
    };
  }
  const R = Math.round;
  boc('btn', (x, y, w, h, l, o) => { o = o || {}; const t = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : o.gold ? 'g' : o.purple ? 'v' : o.fill ? 'c' : 'n'; const v = w >= 70 && h >= 16 ? 10 : 2; return { x: R(x), y: R(y), w: R(w), h: R(h), ma: MA_NUT[t] && kc(MA_NUT[t]) ? MA_NUT[t] : null, vc: h >= 22 ? [5, v, 5, v] : [3, v, 3, v] }; });
  boc('sbtn', (x, y, w, h, l, o) => { o = o || {}; const t = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : 'n'; return { x: R(x), y: R(y), w: R(w), h: R(h), ma: kc(MA_NUT[t]) ? MA_NUT[t] : null, vc: [3, 3, 3, 3] }; });
  boc('card', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-the-thuong') ? 'gd-the-thuong' : null, vc: h >= 30 ? [6, 4, 6, 4] : [3, 4, 3, 4] }));
  boc('panel', (x, y, w, h) => (kc('gd-khung-bang') ? { x: R(x) - 3, y: R(y) - 3, w: R(w) + 6, h: R(h) + 6, ma: 'gd-khung-bang', kk: T.kBang ? T.kBang(R(w), R(h)) : 1 } : { x: R(x), y: R(y), w: R(w), h: R(h), ma: null, vc: [4, 4, 4, 4] }));
  boc('dialog', (x, y, w, name, text, o) => ({ tag: name ? (G.ui.font(7.5, true), [R(x) + 6, R(y) - 7, Math.ceil(G.ux.measureText(G.tv ? G.tv(name) : name).width) + 12, 14]) : null, x: R(x), y: R(y), w: R(w), h: 0, ma: kc('gd-khung-thoai') ? 'gd-khung-thoai' : null, vc: [3, 5, 3, 5], sau: (h, q) => { if (q.ma) { q.x -= 6; q.y -= 2; q.w += 12; q.h = h + 4; } else q.h = h; } }));
  boc('toast', (x, y, w, t, o) => ({ x: R(x), y: R(y) + (o && o.age != null && (G.VFX ? +G.VFX.giaoDien : 1) > 0 ? (o.age < 0.14 ? -Math.round(5 * (1 - o.age / 0.14)) : o.age < 0.26 ? 1 : 0) : 0), w: R(w), h: 18, ma: kc('gd-dai-thong-bao') ? 'gd-dai-thong-bao' : null, vc: [3, 12, 3, 12] }));
  boc('plate', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-khung-nho') && w >= 4 && h >= 4 ? 'gd-khung-nho' : null, vc: [2, 2, 2, 2] }));
  boc('inset', (x, y, w, h, sel) => ({ x, y, w, h, kk: T.kOCon ? T.kOCon(w, h) : 1, ma: kc(sel ? 'gd-o-con-chon' : 'gd-o-con') && w >= 6 && h >= 6 ? (sel ? 'gd-o-con-chon' : 'gd-o-con') : null, vc: [1, 1, 1, 1] }));
  boc('theNho', (x, y, w, h) => ({ x, y, w, h, v: h > 10 ? T.VIEN_THE_NHO : null, ma: kc('gd-the-nho') ? 'gd-the-nho' : null, vc: [1, 1, 1, 1] }));
  boc('theSapCo', (x, y, w, h) => ({ x, y, w, h, ma: kc('gd-the-sap-co') ? 'gd-the-sap-co' : null, vc: [1, 1, 1, 1] }));
  boc('khungCanhBao', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-khung-canh-bao') ? 'gd-khung-canh-bao' : null, vc: [2, 2, 2, 2] }));
  boc('bossBar', (cx, y, o) => {
    const tier = o.tier || 'big', big = tier === 'big', elite = tier === 'elite', ns = big ? 9 : elite ? 7.5 : 8;
    G.ui.font(6.5, true); const sw = o.sub ? G.ux.measureText(o.sub).width + 12 : 0; G.ui.font(ns, true); const tw = G.ux.measureText(o.name || '').width;
    const w = big ? 226 : elite ? Math.round(G.clamp(tw + sw + 18, 150, 224)) : 196, ph = big ? 30 : elite ? 22 : 26;
    const ma = big ? 'gd-khung-trum' : elite ? 'gd-khung-tinh-anh' : 'gd-khung-trum-nho', bh = big ? 11 : elite ? 7 : 9;
    return { x: Math.round(cx - w / 2), y, w, h: ph, ma: kc(ma) ? ma : 'gd-khung-nho', vc: [2, 2, 2, 2], tren: ph - bh - (big ? 5 : 4) - 0.5 }; // = vùng tên game dùng (by - y - 0,5)
  });

  // ---- ảnh khung gd-* dán lên lớp giao diện: lần theo các lớp nhớ đệm ----
  const SC = G.spriteCustom || {};
  const goc = new Map(); // ảnh gốc -> { ma, ga }
  const lapBang = () => { goc.clear(); for (const ma in SC.gd || {}) { const ga = SC.gd[ma]; if (ga && ga.img) goc.set(ga.img, { ma, ga }); } };
  const LA_KHUNG = /^gd-(khung|nut-(thuong|chinh|nguy|chon|vuong)|the-(thuong|nho|sap-co)|o-con|o-do|o-ep|dai-thong-bao|thanh-tren$|so-trang|so-o-|tt-bang)/;
  // trải một lần dán (nguồn src, phần nguồn sr, đích d theo điểm game) ra các ảnh gốc
  function trai(src, sr, d, sau, out) {
    if (sau > 6) return;
    const g0 = goc.get(src);
    if (g0) { out.push({ ma: g0.ma, ga: g0.ga, d, net: g0.ga.net || 1, srcW: src.width, sr }); return; }
    const L = src.__src;
    if (!L || !L.length) { out.push({ ma: null, d }); return; }
    // ảnh 9 mảnh ghép sẵn: mọi mảnh từ cùng một ảnh gốc -> một khung, k theo cỡ lớp ghép
    const g1 = goc.get(L[0].src);
    if (g1 && L.every((c) => c.src === L[0].src)) { out.push({ ma: g1.ma, ga: g1.ga, d, net: g1.ga.net || 1, srcW: sr[2], ghep: true }); return; }
    const kx = d[2] / sr[2], ky = d[3] / sr[3];
    for (const c of L) {
      const ix0 = Math.max(c.d[0], sr[0]), iy0 = Math.max(c.d[1], sr[1]), ix1 = Math.min(c.d[0] + c.d[2], sr[0] + sr[2]), iy1 = Math.min(c.d[1] + c.d[3], sr[1] + sr[3]);
      if (ix1 <= ix0 || iy1 <= iy0) continue;
      // chỉ lấy phần con ứng với toàn bộ con (không cắt) — đủ cho các lớp ghép của game
      const dd = [d[0] + (c.d[0] - sr[0]) * kx, d[1] + (c.d[1] - sr[1]) * ky, c.d[2] * kx, c.d[3] * ky];
      trai(c.src, c.sr, dd, sau + 1, out);
    }
  }
  window.__giaiAnh = () => {
    lapBang();
    const khung = [], icon = [];
    for (const r of window.__anh) {
      if (!r.g) continue;
      const out = []; trai(r.src, r.sr, r.g, 0, out);
      const gom = new Map();
      for (const q of out) {
        if (q.ma && (LA_KHUNG.test(q.ma) || (q.ga.vien && !/^gd-(he-|ngoc|sao|bua|da-|huy|vong|nut-(danh|chuong|dac|ne|binh|tam))/.test(q.ma)))) {
          const k = q.ma, o = gom.get(k);
          if (!o) gom.set(k, { ma: k, ga: q.ga, x0: q.d[0], y0: q.d[1], x1: q.d[0] + q.d[2], y1: q.d[1] + q.d[3], net: q.net, srcW: q.srcW, w1: q.d[2] });
          else { o.x0 = Math.min(o.x0, q.d[0]); o.y0 = Math.min(o.y0, q.d[1]); o.x1 = Math.max(o.x1, q.d[0] + q.d[2]); o.y1 = Math.max(o.y1, q.d[1] + q.d[3]); }
        } else if (!r.trongChu && !(r.clip && (q.d[0] + q.d[2] <= r.clip[0] || q.d[0] >= r.clip[2] || q.d[1] + q.d[3] <= r.clip[1] || q.d[1] >= r.clip[3]))) icon.push({ ma: q.ma, x: q.d[0], y: q.d[1], w: q.d[2], h: q.d[3], seq: r.seq, k: r.k });
      }
      for (const o of gom.values()) {
        const w = o.x1 - o.x0, h = o.y1 - o.y0;
        if (w < 6 || h < 6) continue;
        const kk = o.srcW ? Math.min(1, (o.w1 * o.net) / o.srcW) : 1;
        khung.push({ ten: 'anh', ma: o.ma, x: o.x0, y: o.y0, w, h, kk: kk < 0.98 ? kk : null, seq: r.seq, k: r.k });
      }
    }
    return { khung, icon };
  };

  // ---- đo ----
  window.__soat = () => {
    const A = window.__giaiAnh();
    // lòng: khung có bảng lòng đo sẵn (T.longKhung) — ảnh khung khác (sổ, thẻ việc...): trong viền ảnh, hai bên đối xứng (tâm = tâm ảnh)
    const LK = (q) => {
      if (!q.ma) return null;
      if (q.ten === 'anh' && !(T.coLong && T.coLong(q.ma))) {
        const ga = kc(q.ma), v = (ga && ga.vien) || [0, 0, 0, 0], k = Math.min(1, q.kk || 1, q.h / (v[0] + v[2] + 2), q.w / (v[1] + v[3] + 2));
        const d = ((v[0] + v[2]) / 2) * k, n = ((v[1] + v[3]) / 2) * k;
        return T.longCode(q.w, q.h, [d, n, d, n].map((x) => Math.min(x, Math.max(0, Math.min(q.w, q.h) / 2 - 3))));
      }
      try { return T.longKhung(q.ma, q.w, q.h, q.kk, q.v); } catch (e) { return null; }
    };
    const THANH = /^gd-khung-(mau|mana|xp|mau-quai|vach)/;
    const tatCa = K.map((q, i) => Object.assign({ id: 'k' + i }, q)).concat(A.khung.map((q, i) => Object.assign({ id: 'a' + i }, q)));
    const hop = (f) => f.h > 0 && f.w > 0;
    const out = [], khungDung = new Map();
    for (const c of window.__chu) {
      const cx = (c.hop[0] + c.hop[2]) / 2, cy = (c.hop[1] + c.hop[3]) / 2;
      let q = c.k >= 0 ? Object.assign({ id: 'k' + c.k }, K[c.k]) : null;
      if (q && q.tag && cx >= q.tag[0] && cx <= q.tag[0] + q.tag[2] && cy >= q.tag[1] && cy <= q.tag[1] + q.tag[3]) q = { id: q.id + 't', ten: 'dialog-ten', x: q.tag[0], y: q.tag[1], w: q.tag[2], h: q.tag[3], vc: [2, 2, 2, 2] };
      if (!q) { // khung nhỏ nhất vẽ trước chữ, chứa tâm chữ
        let best = null;
        for (const f of tatCa) if (hop(f) && f.seq < c.seq && cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h && (!best || f.w * f.h < best.w * best.h - 0.5)) best = f;
        q = best;
      }
      if (!q) continue;
      if (q.tren != null && cy > q.y + q.tren) continue; // chữ trong thanh máu trùm
      let L = LK(q);
      if (!L) L = T.longCode(q.w, q.h, q.vc || (q.ten === 'anh' ? [0, 0, 0, 0] : [2, 2, 2, 2]));
      let bot = L.bot; if (q.tren != null) bot = Math.min(bot, q.tren);
      const a = c.hop[1] - q.y, b = c.hop[3] - q.y, l = c.hop[0] - q.x, r = c.hop[2] - q.x;
      const sp = L.span(Math.max(a, L.top), Math.min(b, bot)) || L.span((L.top + bot) / 2 - 0.5, (L.top + bot) / 2 + 0.5) || [0, q.w];
      const tran = Math.max(L.top - a, b - bot, sp[0] - l, r - sp[1], 0);
      const dem = Math.min(a - L.top, bot - b, l - sp[0], sp[1] - r);
      const rec = { s: c.s, px: +c.px.toFixed(2), align: c.align, khung: q.ten, id: q.id, ma: q.ma || 'code', f: [q.x, q.y, q.w, q.h].map((v) => +(+v).toFixed(1)),
        hop: [c.hop[0], c.hop[1], c.hop[2] - c.hop[0], c.hop[3] - c.hop[1]].map((v) => +v.toFixed(2)), base: +(c.base - q.y).toFixed(2), capH: +c.capH.toFixed(2),
        long: [sp[0], L.top, sp[1], bot].map((v) => +v.toFixed(2)), tran: +tran.toFixed(2), dem: +dem.toFixed(2), cat: c.cat > 0.5 || /…$/.test(c.s) ? 1 : 0, seq: c.seq };
      out.push(rec);
      if (!khungDung.has(q.id)) khungDung.set(q.id, { q, L, bot, chu: [] });
      khungDung.get(q.id).chu.push(rec);
    }
    // biểu tượng trong khung
    const icons = A.icon.filter((i) => i.w >= 3 && i.h >= 3 && i.w <= 60 && i.h <= 60 && !/^gd-trum-vach/.test(i.ma || '')); // vạch hoa văn hai bên tên trùm: không phải biểu tượng
    const loi = [];
    for (const [id, K2] of khungDung) {
      const q = K2.q, L = K2.L, bot = K2.bot, ds = K2.chu;
      const nhan = q.w <= 260 && q.h <= 64; // khung nhãn: chữ phải nằm giữa
      const ic = icons.filter((i) => i.seq > (q.seq || 0) && i.x >= q.x - 1 && i.y >= q.y - 1 && i.x + i.w <= q.x + q.w + 1 && i.y + i.h <= q.y + q.h + 1 && i.w * i.h < q.w * q.h * 0.6);
      const thr = (W) => NGUONG_JS;
      for (const c of ds) {
        c.loi = [];
        // huy hiệu số (bậc, số lượng) cố ý đặt ở góc ô vũ khí / ô đồ: không soát
        if (/^gd-o-(ep|vk|do)/.test(q.ma || '') && c.s.trim().length <= 2) { c.huyHieu = 1; continue; }
        const thanh = THANH.test(q.ma || '') || (q.ten === 'anh' && q.h < 12); // chữ đè lên thanh (máu, linh khí...): chỉ soát nằm giữa
        if (!thanh) { if (c.tran > 0.25) c.loi.push('tran'); else if (c.dem < 0.25) c.loi.push('cham'); else if (c.dem < 0.5) c.sat = 1; }
        c.thanh = thanh ? 1 : 0;
        if (c.cat) c.loi.push('cat');
        // lệch ngang (chữ căn giữa)
        if (nhan && c.align === 'center') {
          let sn = 0, ss = 0; for (let t = Math.max(c.base - c.capH, L.top); t <= Math.min(c.base, bot) + 1e-6; t += 0.5) { const qq = L.span(t - 0.25, t + 0.25); if (qq) { ss += (qq[0] + qq[1]) / 2; sn++; } }
          const sb = sn ? [ss / sn - (c.long[2] - c.long[0]) / 2, ss / sn + (c.long[2] - c.long[0]) / 2] : [c.long[0], c.long[2]]; // tâm lòng = trung bình các hàng THÂN chữ
          const W = sb[1] - sb[0], tamL = (sb[0] + sb[1]) / 2, l = c.hop[0] - q.x, r = l + c.hop[2];
          let lech = (l + r) / 2 - tamL;
          // biểu tượng cùng hàng: cả cụm biểu tượng + chữ phải nằm giữa
          const cung = ic.filter((i) => i.y < c.hop[1] + c.hop[3] && i.y + i.h > c.hop[1] && !(i.x < c.hop[0] + c.hop[2] && i.x + i.w > c.hop[0]));
          if (cung.length) {
            let x0 = l, x1 = r; for (const i of cung) { x0 = Math.min(x0, i.x - q.x); x1 = Math.max(x1, i.x + i.w - q.x); }
            const lc = (x0 + x1) / 2 - tamL;
            c.cum = +lc.toFixed(2);
            lech = Math.abs(lc) < Math.abs(lech) ? lc : lech;
          }
          c.lechN = +lech.toFixed(2); c.nguongN = +thr(W).toFixed(2);
          if (Math.abs(lech) > thr(W) + 1e-6) c.loi.push('lech-ngang');
        }
        // đè biểu tượng
        for (const i of ic) {
          const ox = Math.min(c.hop[0] + c.hop[2], i.x + i.w) - Math.max(c.hop[0], i.x), oy = Math.min(c.hop[1] + c.hop[3], i.y + i.h) - Math.max(c.hop[1], i.y);
          if (ox > 1 && oy > 1) { c.loi.push('de-icon'); c.icon = [i.x, i.y, i.w, i.h].map((v) => +v.toFixed(1)); break; }
        }
      }
      // lệch dọc: khung nhãn thấp (≤ 40) — khối chữ hoa của mọi dòng trong khung
      const ds2 = ds.filter((c) => !c.huyHieu);
      if (q.h <= 40 && nhan && ds2.length) {
        let top = Math.min(...ds2.map((c) => c.base - c.capH)), dd = Math.max(...ds2.map((c) => c.base));
        // biểu tượng xếp trên / dưới chữ (nút túi...): tính vào khối
        const x0 = Math.min(...ds2.map((c) => c.hop[0])), x1 = Math.max(...ds2.map((c) => c.hop[0] + c.hop[2]));
        if (q.ten !== 'bossBar') for (const i of ic) if (i.x < x1 && i.x + i.w > x0 && (i.y + i.h <= q.y + top + 0.5 || i.y >= q.y + dd - 0.5)) { top = Math.min(top, i.y - q.y); dd = Math.max(dd, i.y + i.h - q.y); }
        const lech = (top + dd) / 2 - (L.top + bot) / 2, mid = L.span((L.top + bot) / 2 - 0.5, (L.top + bot) / 2 + 0.5) || [0, q.w];
        for (const c of ds2) { c.lechD = +lech.toFixed(2); c.nguongD = +thr(mid[1] - mid[0]).toFixed(2); if (Math.abs(lech) > c.nguongD + 1e-6) c.loi.push('lech-doc'); }
      }
      // chữ đè chữ
      for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) {
        const A1 = ds[i].hop, B1 = ds[j].hop;
        const ox = Math.min(A1[0] + A1[2], B1[0] + B1[2]) - Math.max(A1[0], B1[0]), oy = Math.min(A1[1] + A1[3], B1[1] + B1[3]) - Math.max(A1[1], B1[1]);
        if (ox > 1 && oy > 1) { ds[i].loi.push('de-chu'); ds[j].loi.push('de-chu'); }
      }
    }
    for (const c of out) c.loi = Array.from(new Set(c.loi || []));
    return { chu: out, icon: icons.map((i) => [i.x, i.y, i.w, i.h].map((v) => +v.toFixed(1))) };
  };
})();
"""

CANH_JS = r"""
(() => {
  const C = (window.__canh = {});
  const sao = () => { for (let i = 0; i < 5; i++) G.save.stars['0-' + i] = 2; G.save.stars['1-0'] = 2; G.save.stars['1-1'] = 1; };
  const save = (o) => { G.testSave(Object.assign({ hero: 'smith', melee: 'sword', lvl: 14, tier: 1, gold: 4321, sharpen: 3 }, o || {})); sao(); const s = G.save; s.ore = 57; s.stones = 9; s.mats = [12, 7, 3]; s.shards = [2, 1, 0]; s.wins = 3; G.newWeapon(s, 'spear', 2); G.newWeapon(s, 'hammer', 3); };
  const run = (r, i) => { G.startStage(r, i, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; return S; };
  C.chao = () => { G.resetSave(); G.save.sound = false; G.setScene(G.Title); };
  C.chao2 = () => { save(); G.setScene(G.Title); };
  C.truyen = () => { G.resetSave(); G.save.sound = false; G.setScene(G.Village); if (G.truyen && G.truyen.xemLai) G.truyen.xemLai(); };
  C.lang = () => { save(); G.setScene(G.Village); };
  C.bang = (k, set) => { C.lang(); const V = G.villageApi; V.open(k); if (set) set(V.V); };
  C.xemVk = () => { C.lang(); const V = G.villageApi; V.V.wid = G.save.carry[0]; V.V.back = 'hub'; V.V.tab = 'weapon'; };
  C.tran = (r) => { save({ lvl: 30, tier: 2, sharpen: 6, branch: ['poison', 'ice', 'fire'][r], marks: 300 }); run(r, 2); G.testGoto('fight'); const W = G.getWorld(); W.waves = []; W.spawns = []; for (let i = 0; i < 4; i++) { const e = G.spawnEnemy(['rusher', 'shield', 'archer', 'elite'][i], W.x0 + 40 + i * 50, W.y0 + 40 + (i % 2) * 30, { hpMult: 1e5 }); e.inside = true; } };
  C.trum = (r) => { save({ lvl: 30, tier: 2, sharpen: 6 }); const S = run(r, 4); G.gotoRoom(S.map.boss); };
  C.mode = (m) => { const S = G.getRun(); if (S) { S.mode = m; S.sel = null; if (m === 'bag' && G.hanhTrang) G.hanhTrang.reset(); } };
  C.thang = () => { save(); const S = run(0, 1); G.gotoRoom(S.map.boss); S.got.push('3 quặng'); G.finishStage(true); S.modeT = -9; };
  C.thua = () => { save(); const S = run(0, 1); G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []; G.finishStage(false); S.modeT = -9; };
  C.phucLanh = () => { save(); const S = run(0, 2); G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []; if (G.phucLanh && S.pl) { S.pl.opts = G.phucLanh.moi(S); S.pl.xong = true; S.mode = 'phuclanh'; } };
  C.phong = (t) => { save(); run(1, 2); G.testGoto(t); };
  C.thongBao = () => { C.tran(0); const W = G.getWorld(); W.banner = { s: G.t('Phúc lành: {0}', G.tv('Than hồng')), col: '#ffd23f', t: 2 }; };
  C.ve = () => { G.click = null; G.ui.begin(); G.scene.draw(); if (G.theme.endFrame) G.theme.endFrame(); };
  return Object.keys(C);
})()
"""

# (tên màn, mã JS dựng màn, số bước chạy trước khi chụp)
CANH = [
    ('chao', "__canh.chao()"),
    ('chao-co-luu', "__canh.chao2()"),
    ('truyen', "__canh.truyen()"),
    ('lang', "__canh.lang()"),
    ('lai-do', "__canh.bang('lai')"),
    ('lo-ren-mai', "__canh.bang('ren', (V) => { V.ftab = 'sharpen'; })"),
    ('lo-ren-linh-khi', "__canh.bang('ren', (V) => { V.ftab = 'vk'; })"),
    ('lo-ren-ep', "__canh.bang('ren', (V) => { V.ftab = 'ep'; })"),
    ('lo-ren-nang-lo', "__canh.bang('ren', (V) => { V.ftab = 'up'; })"),
    ('hang-xen', "__canh.bang('xen')"),
    ('hang-xen-quang', "__canh.bang('xen', (V) => { V.gtab = 'quang'; })"),
    ('tho-may', "__canh.bang('may')"),
    ('cu-do', "__canh.bang('do')"),
    ('cu-do-chuong', "__canh.bang('do', (V) => { V.tab = 'chuong'; V.dtab = 'chuong'; })"),
    ('cu-do-huong-dan', "__canh.bang('do', (V) => { V.tab = 'help'; V.dtab = 'help'; })"),
    ('bang-vang', "__canh.bang('do', (V) => { V.tab = 'rank'; V.dtab = 'rank'; })"),
    ('ong-tu', "__canh.bang('tu', (V) => { V.tab = 'hero'; V.ttab = 'hero'; })"),
    ('so-yeu-quai', "__canh.bang('tu', (V) => { V.tab = 'so'; V.ttab = 'so'; })"),
    ('thanh-tuu', "__canh.bang('tu', (V) => { V.tab = 'thanhTuu'; V.ttab = 'thanhTuu'; })"),
    ('viec-hom-nay', "__canh.bang('mo', (V) => { V.tab = 'viecNgay'; })"),
    ('cai-dat', "__canh.bang('mo', (V) => { V.tab = 'settings'; })"),
    ('ban-do-vung', "__canh.lang(); G.villageApi.V.tab = 'map'"),
    ('ai-ngay', "__canh.lang(); G.villageApi.V.tab = 'aingay'"),
    ('hanh-trang', "__canh.lang(); G.villageApi.V.tab = 'bag'"),
    ('hanh-trang-ky-nang', "__canh.lang(); G.save.moDan = { cu: 1 }; G.save.heroes[G.save.hero].sk = { atk: 2, def: 0, elem: 0 }; G.save.heroes[G.save.hero].lvl = 8; G.villageApi.V.tab = 'bag'; G.hanhTrang.tab = 'skill'; G.hanhTrang.ktab = 'skill'"),
    ('hanh-trang-cay-chuong', "__canh.lang(); G.save.moDan = { cu: 1 }; G.villageApi.V.tab = 'bag'; G.hanhTrang.tab = 'skill'; G.hanhTrang.ktab = 'chuong'"),
    ('xem-vk', "__canh.xemVk()"),
    ('tran-hud', "__canh.tran(0)"),
    ('tran-lau-dai', "__canh.tran(2)"),
    ('thong-bao', "__canh.thongBao()"),
    ('phuc-lanh', "__canh.phucLanh()"),
    ('trum', "__canh.trum(0)"),
    ('trum-the-khang', "__canh.trum(0); const B = G.getWorld().boss; if (B) { B.layers = [{ type: 'resist', el: 'fire' }, { type: 'resist', el: 'poison' }]; B.weak = ['ice']; }"),
    ('cua-hang-ai', "__canh.phong('merchant')"),
    ('ban-do', "__canh.tran(0); __canh.mode('map')"),
    ('tam-dung', "__canh.tran(0); __canh.mode('paused')"),
    ('tran-hanh-trang', "__canh.tran(0); __canh.mode('bag')"),
    ('thang', "__canh.thang()"),
    ('thua', "__canh.thua()"),
]

CO = [('844', 844, 390), ('667', 667, 375), ('1280', 1280, 720)]
DPR = float(os.environ.get('DPR', '1'))


def chay(b, mode, lang, co, canh_chon, tep):
    ten, w, h = co
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=DPR)
    if SAFARI: ctx.add_init_script(path=SAFARI)
    ctx.add_init_script(INIT)
    ctx.add_init_script('window.__nguong = %s;' % NGUONG)
    ctx.add_init_script("try{localStorage.clear();localStorage.setItem('linhkhi_lang','%s')}catch(e){}" % lang)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS_PHONG))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg = ctx.new_page()
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)[:300]))
    url = 'file://' + tep + '?cloud=0' + ('&chufont=0' if mode == 'cu' else '') + os.environ.get('THEM', '')
    pg.goto(url)
    pg.wait_for_function('window.G && G.scene && G.theme && G.ui', timeout=90000)
    pg.evaluate("document.fonts.ready")
    time.sleep(0.8)
    pg.evaluate("() => { window.__tinh = true; }")
    time.sleep(0.2)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(BOC)
    pg.evaluate(CANH_JS)
    kq = {}
    d = os.path.join(OUT, '%s-%s-%s' % (mode, lang, ten)); os.makedirs(d, exist_ok=True)
    for canh, js in CANH:
        if canh_chon and canh not in canh_chon: continue
        try:
            pg.evaluate('() => { if (G.truyen) G.truyen.dang = null; G.click = null; ' + js + '; if (G.ngonNgu && G.LANG !== "%s") G.ngonNgu.dat("%s", false); G.sim(2); }' % (lang, lang))
            pg.evaluate('() => { __canh.ve(); }')  # một khung để lớp nhớ đệm dựng xong
            pg.evaluate('() => { window.__chu.length = 0; window.__anh.length = 0; window.__khung.length = 0; window.__do = true; try { __canh.ve(); } finally { window.__do = false; } }')
            r = pg.evaluate('() => __soat()')
        except Exception as e:
            loi.append('%s: %s' % (canh, str(e)[:300])); continue
        pg.screenshot(path=os.path.join(d, canh + '.png'))
        geo = pg.evaluate("() => { const f = document.getElementById('fit').getBoundingClientRect(); return { fx: f.left, fy: f.top, ox: G.ox, oy: G.oy, sc: G.scale }; }")
        kq[canh] = {'chu': r['chu'], 'icon': r['icon'], 'geo': geo}
    ctx.close()
    return kq, loi


def main():
    chon = set(os.environ['CANH'].split(',')) if os.environ.get('CANH') else None
    cos = [c for c in CO if not os.environ.get('CO') or c[0] in os.environ['CO'].split(',')]
    modes = os.environ.get('MODE', 'cu,moi').split(',')
    langs = os.environ.get('LANG_DO', 'vi,en').split(',')
    tep = os.environ.get('TEP') or os.path.join(GAME, 'dist', 'linh-khi.html')
    tat, loi_all = {}, []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for co in cos:
            for mode in modes:
                for lang in langs:
                    kq, loi = chay(b, mode, lang, co, chon, tep)
                    tat['%s-%s-%s' % (mode, lang, co[0])] = kq
                    loi_all += ['%s-%s-%s %s' % (mode, lang, co[0], e) for e in loi]
                    print('xong', mode, lang, co[0], len(kq), 'màn', flush=True)
        b.close()
    tenj = os.path.join(OUT, 'ket-qua.json')
    cu = json.load(open(tenj)) if os.path.exists(tenj) and os.environ.get('GOP') else {}
    cu.update(tat)
    json.dump(cu, open(tenj, 'w'), ensure_ascii=False)
    for k, kq in tat.items():
        dem = {}
        n = 0
        for v in kq.values():
            for c in v['chu']:
                n += 1
                for l in c.get('loi', []): dem[l] = dem.get(l, 0) + 1
        print('%-14s chữ trong khung: %4d | %s' % (k, n, ' '.join('%s %d' % kv for kv in sorted(dem.items()))))
    print('lỗi trang:', len(loi_all))
    for e in loi_all[:30]: print('  ', e)


# ---------- ảnh lưới ----------
def ve_luoi(png, geo, canh_kq, nhan):
    from PIL import Image, ImageDraw, ImageFont
    im = Image.open(png).convert('RGB')
    lop = Image.new('RGBA', im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(lop)
    sc = geo['sc']; ox = geo['fx'] + geo['ox']; oy = geo['fy'] + geo['oy']
    P = lambda x, y: (ox + x * sc, oy + y * sc)
    da = set()
    for c in canh_kq['chu']:
        f = c['f']; L = c['long']
        key = (c['id'], tuple(L))
        if key not in da:
            da.add(key)
            dr.rectangle([P(f[0] + L[0], f[1] + L[1]), P(f[0] + L[2], f[1] + L[3])], outline=(40, 230, 90, 255), width=1)
        hp = c['hop']
        if c.get('loi'):
            dr.rectangle([P(hp[0], hp[1]), P(hp[0] + hp[2], hp[1] + hp[3])], fill=(255, 0, 0, 90), outline=(255, 40, 40, 255), width=2)
        else:
            dr.rectangle([P(hp[0], hp[1]), P(hp[0] + hp[2], hp[1] + hp[3])], outline=(255, 60, 60, 220), width=1)
    im = Image.alpha_composite(im.convert('RGBA'), lop).convert('RGB')
    try:
        fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
    except Exception:
        fnt = ImageFont.load_default()
    d2 = ImageDraw.Draw(im)
    d2.rectangle([0, 0, im.width, 20], fill=(0, 0, 0))
    d2.text((6, 2), nhan, fill=(255, 230, 150), font=fnt)
    return im


def dung_anh(tat, dich, co='844'):
    from PIL import Image
    os.makedirs(dich, exist_ok=True)
    tenman = [c[0] for c in CANH]
    for canh in tenman:
        o = []
        for lang in ('vi', 'en'):
            hang = []
            for mode, ten in (('cu', 'TRƯỚC'), ('moi', 'SAU')):
                k = '%s-%s-%s' % (mode, lang, co)
                v = tat.get(k, {}).get(canh)
                png = os.path.join(OUT, k, canh + '.png')
                if not v or not os.path.exists(png): hang.append(None); continue
                n = sum(1 for c in v['chu'] if c.get('loi'))
                hang.append(ve_luoi(png, v['geo'], v, '%s · %s · %s · %d chữ lỗi' % (canh, lang.upper(), ten, n)))
            o.append(hang)
        anh = [a for h in o for a in h if a]
        if not anh: continue
        W, H = anh[0].size
        sh = Image.new('RGB', (W * 2 + 6, H * 2 + 6), (30, 30, 30))
        for j, h in enumerate(o):
            for i, a in enumerate(h):
                if a: sh.paste(a, (i * (W + 6), j * (H + 6)))
        sh.save(os.path.join(dich, canh + '.jpg'), quality=78, optimize=True)
    print('đã ghi ảnh lưới vào', dich)


if __name__ == '__main__':
    if len(sys.argv) > 3 and sys.argv[2] == '--anh':
        dung_anh(json.load(open(os.path.join(OUT, 'ket-qua.json'))), sys.argv[3])
    else:
        main()
