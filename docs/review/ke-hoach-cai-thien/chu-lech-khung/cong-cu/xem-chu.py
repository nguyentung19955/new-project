#!/usr/bin/env python3
"""Soát chữ lệch / tràn khung bằng ẢNH TĨNH (chu-lech-khung, 15/10). KHÔNG chơi thử game.

Mở bản một tệp game/dist/linh-khi.html (?cloud=0) trong Chromium không màn hình, DỪNG vòng lặp khung hình ngay khi game sẵn sàng,
rồi với từng màn: dựng trạng thái (bản lưu thử, mở bảng...), vẽ ĐÚNG MỘT khung hình (ui.begin + scene.draw) và đo:
  - mọi khung đã vẽ (bọc các hàm T.btn, T.sbtn, T.card, T.panel, T.dialog, T.toast, T.plate, T.inset, T.theNho, T.theSapCo, T.khungCanhBao, T.bossBar)
  - mọi chữ vẽ lên lớp giao diện (bọc fillText: hộp chữ THẬT actualBoundingBox, đổi về toạ độ game 480x270)
  - chữ nào thuộc khung nào (vẽ trong hàm khung, hoặc tâm chữ nằm trong khung nhỏ nhất đã vẽ trước nó), so với LÒNG khung
    (T.longKhung: lòng thật đo từ ảnh; khung code: viền như hình code) trừ 2 điểm đệm.
Chạy hai chế độ: cũ (?chucu=1) và mới, hai ngôn ngữ (vi, en), ba cỡ màn (16:9, 4:3, dọc).
Phông: máy thử không tải được Google Fonts nên "Be Vietnam Pro" được thay bằng Inter (gần cỡ), chạy thêm lượt phông rộng DejaVu Sans để thử chữ dài.

  python3 xem-chu.py [thư mục ra]       -> <ra>/ket-qua.json, ảnh từng màn, rồi dựng xem-chu.png cạnh tệp này
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/xem-chu'
os.makedirs(OUT, exist_ok=True)
PHONG = os.environ.get('PHONG', 'Inter')

CSS_PHONG = {
    'Inter': "@font-face{font-family:'Be Vietnam Pro';font-weight:500;src:local('Inter Medium'),local('Inter-Medium')}@font-face{font-family:'Be Vietnam Pro';font-weight:700;src:local('Inter Bold'),local('Inter-Bold')}",
    'DejaVu': "@font-face{font-family:'Be Vietnam Pro';font-weight:500;src:local('DejaVu Sans')}@font-face{font-family:'Be Vietnam Pro';font-weight:700;src:local('DejaVu Sans Bold'),local('DejaVuSans-Bold')}",
}

INIT = r"""
(() => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__tinh = false;
  window.requestAnimationFrame = (cb) => (window.__tinh ? 0 : raf(cb));
  const P = CanvasRenderingContext2D.prototype, f0 = P.fillText, m0 = P.measureText;
  window.__chu = []; window.__do = false; window.__khung = []; window.__ngan = [];
  // theo dõi vùng cắt (clip) hình chữ nhật của lớp giao diện: chữ cuộn bị cắt chỉ tính phần còn thấy
  const r0 = P.rect, c0 = P.clip, s0 = P.save, re0 = P.restore, bp0 = P.beginPath;
  const dev = (ctx, x, y) => { const M = ctx.getTransform(); return [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]; };
  P.beginPath = function () { this.__r = null; return bp0.apply(this, arguments); };
  P.rect = function (x, y, w, h) { const a = dev(this, x, y), b = dev(this, x + w, y + h); this.__r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; return r0.apply(this, arguments); };
  P.clip = function () { if (this.__r) { const c = this.__c, r = this.__r; this.__c = c ? [Math.max(c[0], r[0]), Math.max(c[1], r[1]), Math.min(c[2], r[2]), Math.min(c[3], r[3])] : r.slice(); } else this.__c = this.__c || [-1e9, -1e9, 1e9, 1e9]; return c0.apply(this, arguments); };
  P.save = function () { (this.__cs = this.__cs || []).push(this.__c || null); return s0.apply(this, arguments); };
  P.restore = function () { if (this.__cs && this.__cs.length) this.__c = this.__cs.pop(); return re0.apply(this, arguments); };
  P.fillText = function (t, x, y, mw) {
    try {
      if (window.__do && this.canvas && this.canvas.id === 'ui' && String(t).trim() && window.G && G.uiScale) {
        const fs = String(this.fillStyle);
        if (!(fs.indexOf('rgba(0, 0, 0, 0.75)') === 0 || fs === 'rgba(0,0,0,0.75)') && this.globalAlpha > 0.05) {
          const m = m0.call(this, t), M = this.getTransform(), s = G.uiScale, ox = G.ox * G.dpr, oy = G.oy * G.dpr;
          const gx = (lx) => (M.a * lx + M.e - ox) / s, gy = (ly) => (M.d * ly + M.f - oy) / s;
          const l = x - m.actualBoundingBoxLeft, r = x + m.actualBoundingBoxRight;
          let x0 = gx(l), x1 = gx(r), y0 = gy(y - m.actualBoundingBoxAscent), y1 = gy(y + m.actualBoundingBoxDescent);
          const cl = this.__c;
          if (cl) { const cx0 = (cl[0] - ox) / s, cy0 = (cl[1] - oy) / s, cx1 = (cl[2] - ox) / s, cy1 = (cl[3] - oy) / s; x0 = Math.max(x0, cx0); x1 = Math.min(x1, cx1); y0 = Math.max(y0, cy0); y1 = Math.min(y1, cy1); if (x1 <= x0 + 0.3 || y1 <= y0 + 0.3) return f0.call(this, t, x, y, mw); }
          window.__chu.push({ s: String(t).slice(0, 60), x0, x1, y0, y1,
            px: parseFloat(/(\d+(\.\d+)?)px/.exec(this.font)[1]) * M.a / s, k: window.__ngan.length ? window.__ngan[window.__ngan.length - 1] : -1, n: window.__khung.length });
        }
      }
    } catch (e) { /* bỏ qua */ }
    return f0.call(this, t, x, y, mw);
  };
})();
"""

BOC = r"""
(() => {
  const T = G.theme, K = window.__khung, N = window.__ngan;
  const kc = (ma) => (G.KHUNG_ANH === false || !G.spriteCustom || !G.spriteCustom.gdSan ? null : G.spriteCustom.gdSan(ma));
  const MA_NUT = { n: 'gd-nut-thuong', p: 'gd-nut-chinh', d: 'gd-nut-nguy', s: 'gd-nut-chon' };
  function boc(ten, ghi) {
    const f = T[ten];
    T[ten] = function () {
      const a = Array.prototype.slice.call(arguments);
      const q = window.__do ? ghi.apply(null, a) : null;
      let i = -1;
      if (q) { i = K.length; q.ten = ten; K.push(q); N.push(i); }
      try { const r = f.apply(this, arguments); if (q && q.sau) q.sau(r, q); return r; } finally { if (q) N.pop(); }
    };
  }
  const R = Math.round;
  boc('btn', (x, y, w, h, l, o) => { o = o || {}; const t = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : o.gold ? 'g' : o.purple ? 'v' : o.fill ? 'c' : 'n'; const v = w >= 70 && h >= 16 ? 10 : 2; return { x: R(x), y: R(y), w: R(w), h: R(h), ma: MA_NUT[t] && kc(MA_NUT[t]) ? MA_NUT[t] : null, vc: h >= 22 ? [5, v, 5, v] : [3, v, 3, v] }; });
  boc('sbtn', (x, y, w, h, l, o) => { o = o || {}; const t = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : 'n'; return { x: R(x), y: R(y), w: R(w), h: R(h), ma: kc(MA_NUT[t]) ? MA_NUT[t] : null, vc: [3, 3, 3, 3] }; });
  boc('card', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-the-thuong') ? 'gd-the-thuong' : null, vc: h >= 30 ? [6, 4, 6, 4] : [3, 4, 3, 4] }));
  boc('panel', (x, y, w, h) => (kc('gd-khung-bang') ? { x: R(x) - 3, y: R(y) - 3, w: R(w) + 6, h: R(h) + 6, ma: 'gd-khung-bang', k: T.kBang ? T.kBang(R(w), R(h)) : 1 } : { x: R(x), y: R(y), w: R(w), h: R(h), ma: null, vc: [4, 4, 4, 4] }));
  boc('dialog', (x, y, w, name, text, o) => ({ tag: name ? (G.ui.font(7.5, true), [R(x) + 6, R(y) - 7, Math.ceil(G.ux.measureText(name).width) + 12, T.chuMoi && T.chuMoi() ? 14 : 12]) : null, x: R(x), y: R(y), w: R(w), h: 0, ma: kc('gd-khung-thoai') ? 'gd-khung-thoai' : null, vc: [3, 5, 3, 5], sau: (h, q) => { if (q.ma) { q.x -= 6; q.y -= 2; q.w += 12; q.h = h + 4; } else q.h = h; } }));
  boc('toast', (x, y, w, t, o) => ({ x: R(x), y: R(y) + (o && o.age != null && (G.VFX ? +G.VFX.giaoDien : 1) > 0 ? (o.age < 0.14 ? -Math.round(5 * (1 - o.age / 0.14)) : o.age < 0.26 ? 1 : 0) : 0), w: R(w), h: 18, ma: kc('gd-dai-thong-bao') ? 'gd-dai-thong-bao' : null, vc: [3, 12, 3, 12] }));
  boc('plate', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-khung-nho') && w >= 4 && h >= 4 ? 'gd-khung-nho' : null, vc: [2, 2, 2, 2] }));
  boc('inset', (x, y, w, h, sel) => ({ x, y, w, h, k: T.kOCon ? T.kOCon(w, h) : 1, ma: kc(sel ? 'gd-o-con-chon' : 'gd-o-con') && w >= 6 && h >= 6 ? (sel ? 'gd-o-con-chon' : 'gd-o-con') : null, vc: [1, 1, 1, 1] }));
  boc('theNho', (x, y, w, h) => ({ x, y, w, h, v: T.chuMoi && T.chuMoi() && h > 10 ? T.VIEN_THE_NHO : null, ma: kc('gd-the-nho') ? 'gd-the-nho' : null, vc: [1, 1, 1, 1] }));
  boc('theSapCo', (x, y, w, h) => ({ x, y, w, h, ma: kc('gd-the-sap-co') ? 'gd-the-sap-co' : null, vc: [1, 1, 1, 1] }));
  boc('khungCanhBao', (x, y, w, h) => ({ x: R(x), y: R(y), w: R(w), h: R(h), ma: kc('gd-khung-canh-bao') ? 'gd-khung-canh-bao' : null, vc: [2, 2, 2, 2] }));
  // khung tên trùm: tính lại như T.bossBar
  boc('bossBar', (cx, y, o) => {
    const tier = o.tier || 'big', big = tier === 'big', elite = tier === 'elite', ns = big ? 9 : elite ? 7.5 : 8;
    G.ui.font(6.5, true); const sw = o.sub ? G.ux.measureText(o.sub).width + 12 : 0; G.ui.font(ns, true); const tw = G.ux.measureText(o.name || '').width;
    const w = big ? 226 : elite ? Math.round(G.clamp(tw + sw + 18, 150, 224)) : 196, ph = big ? 30 : elite ? 22 : 26;
    const ma = big ? 'gd-khung-trum' : elite ? 'gd-khung-tinh-anh' : 'gd-khung-trum-nho', bh = big ? 11 : elite ? 7 : 9;
    return { x: Math.round(cx - w / 2), y, w, h: ph, ma: kc(ma) ? ma : 'gd-khung-nho', vc: [2, 2, 2, 2], tren: ph - bh - (big ? 5 : 4) };
  });
  // Đo: chữ so với lòng khung
  window.__soat = () => {
    const out = [], LK = (q) => q.ma ? T.longKhung(q.ma, q.w, q.h, q.k, q.v) : null;
    for (const c of window.__chu) {
      let q = c.k >= 0 ? K[c.k] : null;
      if (!q) { // khung nhỏ nhất vẽ trước chữ, chứa tâm chữ
        const cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2; let best = null;
        for (let i = 0; i < c.n; i++) { const f = K[i]; if (f.h > 0 && cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h && (!best || f.w * f.h < best.w * best.h)) best = f; }
        q = best;
        if (q && (q.ten === 'btn' || q.ten === 'sbtn' || q.ten === 'card')) { /* chữ ngoài hàm nút nằm trên nút: vẫn tính */ }
      }
      if (!q) continue;
      { const cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2; // thẻ tên hộp thoại là khung riêng
        if (q.tag && cx >= q.tag[0] && cx <= q.tag[0] + q.tag[2] && cy >= q.tag[1] && cy <= q.tag[1] + q.tag[3]) q = { ten: 'dialog-ten', x: q.tag[0], y: q.tag[1], w: q.tag[2], h: q.tag[3], vc: [2, 2, 2, 2] };
        if (q.tren != null && cy > q.y + q.tren) continue; } // chữ trong thanh máu trùm (thanh có khung riêng)
      const L = LK(q) || T.longCode(q.w, q.h, q.vc || [2, 2, 2, 2]);
      const a = c.y0 - q.y, b = c.y1 - q.y, l = c.x0 - q.x, r = c.x1 - q.x;
      let bot = L.bot; if (q.tren != null && c.k >= 0) bot = Math.min(bot, q.tren); // chữ tên trùm: phía trên thanh máu
      const sp = L.span(Math.max(a, L.top), Math.min(b, bot)) || [0, 0];
      const tran = Math.max(L.top - a, b - bot, sp[0] - l, r - sp[1], 0); // ra ngoài lòng
      const tranNgang = Math.max(sp[0] - l, r - sp[1], 0), tranDoc = Math.max(L.top - a, b - bot, 0);
      const dem = Math.min(a - L.top, bot - b, l - sp[0], sp[1] - r);
      const demN = Math.min(l - sp[0], sp[1] - r), demD = Math.min(a - L.top, bot - b);
      const lechN = Math.abs((l - sp[0]) - (sp[1] - r)); // lệch tâm ngang (chỉ có nghĩa với chữ căn giữa)
      const sg = L.spanGiua ? L.spanGiua(Math.max(a, L.top), Math.min(b, bot)) : null; // lòng giữa (bỏ qua đinh góc trong lòng)
      const tranG = sg ? +Math.max(L.top - a, b - bot, sg[0] - l, r - sg[1], 0).toFixed(2) : +tran.toFixed(2);
      out.push({ s: c.s, px: +c.px.toFixed(2), khung: q.ten, ma: q.ma || 'code', f: [q.x, q.y, q.w, q.h].map((v) => +(+v).toFixed(1)), hop: [c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0].map((v) => +v.toFixed(2)),
        tran: +tran.toFixed(2), tranN: +tranNgang.toFixed(2), tranD: +tranDoc.toFixed(2), dem: +dem.toFixed(2), demN: +demN.toFixed(2), demD: +demD.toFixed(2), lechN: +lechN.toFixed(2), tranG, trong: c.k >= 0 });
    }
    return out;
  };
})();
"""

CANH_JS = r"""
(() => {
  const C = (window.__canh = {});
  const save = (o) => { G.testSave(Object.assign({ hero: 'smith', melee: 'sword', lvl: 14, tier: 1, gold: 400, sharpen: 3 }, o || {})); for (let i = 0; i < 5; i++) G.save.stars['0-' + i] = 2; G.save.ore = 30; };
  const run = (r, i) => { G.startStage(r, i, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; return S; };
  C.chao = () => { G.resetSave(); G.save.sound = false; G.setScene(G.Title); };
  C.chao2 = () => { save(); G.setScene(G.Title); };
  C.truyen = () => { G.resetSave(); G.save.sound = false; G.setScene(G.Village); if (G.truyen && G.truyen.xemLai) G.truyen.xemLai(); };
  C.lang = () => { save(); G.setScene(G.Village); };
  C.langMoi = () => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; G.setScene(G.Village); };
  C.bang = (k, set) => { C.lang(); const V = G.villageApi; V.open(k); if (set) set(V.V); };
  C.xemVk = () => { C.lang(); const V = G.villageApi; V.V.wid = G.save.carry[0]; V.V.back = 'hub'; V.V.tab = 'weapon'; };
  C.tran = (r) => { save({ lvl: 30, tier: 2, sharpen: 6, branch: ['poison', 'ice', 'fire'][r], marks: 300 }); run(r, 2); G.testGoto('fight'); const W = G.getWorld(); W.waves = []; W.spawns = []; for (let i = 0; i < 4; i++) { const e = G.spawnEnemy(['rusher', 'shield', 'archer', 'elite'][i], W.x0 + 40 + i * 50, W.y0 + 40 + (i % 2) * 30, { hpMult: 1e5 }); e.inside = true; } };
  C.trum = (r) => { save({ lvl: 30, tier: 2, sharpen: 6 }); const S = run(r, 4); G.gotoRoom(S.map.boss); };
  C.mode = (m) => { const S = G.getRun(); if (S) { S.mode = m; S.sel = null; if (m === 'bag' && G.hanhTrang) G.hanhTrang.reset(); } };
  C.thang = () => { save(); const S = run(0, 1); G.gotoRoom(S.map.boss); S.got.push('3 quặng'); G.finishStage(true); S.modeT = -9; };
  C.thua = () => { save(); const S = run(0, 1); G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []; G.finishStage(false); S.modeT = -9; };
  C.ve = () => { G.click = null; G.ui.begin(); G.scene.draw(); if (G.theme.endFrame) G.theme.endFrame(); };
  // tấm mẫu: mọi kiểu khung với chữ thật dài nhất của game (để soát tách bạch từng hàm)
  C.mau = () => {
    const T = G.theme, ui = G.ui;
    G.setScene({ update() {}, draw() {
      ui.rect(-60, -60, 600, 400, '#1b2420');
      T.btn(8, 6, 70, 24, 'Bắt đầu chơi'); T.btn(84, 6, 60, 24, 'Tiếp tục', { primary: true }); T.btn(150, 6, 90, 28, 'Mài vũ khí', { sub: 'Tốn 400 vàng' });
      T.btn(246, 6, 56, 20, 'Quay lại', { danger: true }); T.btn(308, 6, 80, 22, 'Đăng nhập Google', { sel: true }); T.btn(394, 6, 80, 24, 'Lưu lên mây', { gold: true });
      T.sbtn(8, 38, 40, 16, 'Xem'); T.sbtn(52, 38, 44, 16, 'Trang bị', { primary: true }); T.sbtn(100, 38, 70, 17, '← Quay lại'); T.sbtn(174, 38, 50, 16, 'Học chiêu', { sel: true }); T.sbtn(228, 38, 36, 14, 'Đổi');
      T.tab(270, 36, 66, 22, 'Nâng bậc', true); T.tab(340, 36, 66, 22, 'Luyện lại'); T.tab(410, 36, 64, 22, 'Ép đồ');
      ui.btn(8, 64, 70, 46, 'Bùa Lửa', { sub: '+12% sát thương' }); ui.btn(84, 64, 70, 46, 'Hồi đầy máu và mana'); T.card(160, 64, 70, 46, { title: 'Phần thưởng' });
      T.panel(236, 64, 236, 70, 'Lò rèn của bác Thợ Rèn');
      T.dialog(12, 128, 210, 'Bà Hàng Xén', 'Cháu ơi, ghé xem hàng mới về đi. Có đá tôi, quặng và cả bùa hộ mệnh nữa!', {});
      T.toast(240, 140, 230, 'Đã lưu bản chơi lên mây', {}); T.toastFit(355, 162, 'Không đủ vàng để mài tiếp', {});
      T.plate(240, 184, 110, 14); ui.text('Phòng 3/7 · Rừng Già', 295, 194, { size: 7.5, bold: true, align: 'center' });
      T.plate(356, 184, 116, 14); ui.text('Linh khí 120/400', 414, 194, { size: 7.5, bold: true, align: 'center' });
      T.bossBar(120, 222, { tier: 'big', name: 'Mộc Tinh Cổ Thụ', frac: 0.7, marks: [0.3, 0.6] });
      T.bossBar(360, 222, { tier: 'elite', name: 'Sói Đầu Đàn', sub: 'Tinh anh · Khiên', frac: 0.5 });
    } });
  };
  return Object.keys(C);
})()
"""

CANH = [
    ('mau', "__canh.mau()"),
    ('chao', "__canh.chao()"),
    ('chao-cu', "__canh.chao2()"),
    ('truyen', "__canh.truyen()"),
    ('lang', "__canh.lang()"),
    ('lai-do', "__canh.bang('lai')"),
    ('lo-ren-vk', "__canh.bang('ren', (V) => { V.ftab = 'vk'; })"),
    ('lo-ren-mai', "__canh.bang('ren', (V) => { V.ftab = 'sharpen'; })"),
    ('lo-ren-up', "__canh.bang('ren', (V) => { V.ftab = 'up'; })"),
    ('lo-ren-ep', "__canh.bang('ren', (V) => { V.ftab = 'ep'; })"),
    ('hang-xen', "__canh.bang('xen')"),
    ('hang-xen-ban', "__canh.bang('xen', (V) => { V.gtab = 'sell'; })"),
    ('tho-may', "__canh.bang('may')"),
    ('cu-do', "__canh.bang('do')"),
    ('cu-do-chuong', "__canh.bang('do', (V) => { V.tab = 'chuong'; V.dtab = 'chuong'; })"),
    ('cu-do-huongdan', "__canh.bang('do', (V) => { V.tab = 'help'; V.dtab = 'help'; })"),
    ('cu-do-bxh', "__canh.bang('do', (V) => { V.tab = 'rank'; V.dtab = 'rank'; })"),
    ('ong-tu', "__canh.bang('tu')"),
    ('anh-mo', "__canh.bang('mo')"),
    ('ban-do-vung', "__canh.lang(); G.villageApi.V.tab = 'map'"),
    ('ai-ngay', "__canh.lang(); G.villageApi.V.tab = 'aingay'"),
    ('hanh-trang', "__canh.lang(); G.villageApi.V.tab = 'bag'"),
    ('xem-vk', "__canh.xemVk()"),
    ('tran-rung', "__canh.tran(0)"),
    ('tran-lau-dai', "__canh.tran(2)"),
    ('trum-rung', "__canh.trum(0)"),
    ('trum-the-khang', "__canh.trum(0); const B = G.getWorld().boss; if (B) { B.layers = [{ type: 'resist', el: 'fire' }, { type: 'resist', el: 'poison' }]; B.weak = ['ice']; }"),
    ('ban-do', "__canh.mode('map')"),
    ('dung', "__canh.mode('paused')"),
    ('tran-hanh-trang', "__canh.mode('bag')"),
    ('thang', "__canh.thang()"),
    ('thua', "__canh.thua()"),
]

CO = [('169', 1472, 810), ('43', 1024, 768), ('doc', 390, 844)]


def chay(b, mode, lang, co, canh_chon):
    ten, w, h = co
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
    ctx.add_init_script(INIT)
    ctx.add_init_script("try{localStorage.setItem('linhkhi_lang','%s')}catch(e){}" % lang)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS_PHONG[PHONG]))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg = ctx.new_page()
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)[:300]))
    url = 'file://' + os.path.join(GAME, 'dist', 'linh-khi.html') + '?cloud=0' + ('&chucu=1' if mode == 'cu' else '') + os.environ.get('THEM', '')
    pg.goto(url)
    pg.wait_for_function('window.G && G.scene && G.theme && G.ui', timeout=90000)
    pg.evaluate("document.fonts.ready")
    time.sleep(0.6)
    pg.evaluate("() => { window.__tinh = true; }")  # dừng vòng lặp khung hình: từ đây chỉ vẽ tay từng khung
    time.sleep(0.2)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(BOC)
    pg.evaluate(CANH_JS)
    pg.evaluate("l => { if (G.ngonNgu && G.LANG !== l) G.ngonNgu.dat(l, false); }", lang)
    kq = {}
    d = os.path.join(OUT, '%s-%s-%s' % (mode, lang, ten)); os.makedirs(d, exist_ok=True)
    for canh, js in CANH:
        if canh_chon and canh not in canh_chon: continue
        try:
            pg.evaluate('() => { if (G.truyen) G.truyen.dang = null; G.click = null; ' + js + '; G.sim(2); }')
            pg.evaluate('() => { window.__chu.length = 0; window.__khung.length = 0; window.__do = true; try { __canh.ve(); } finally { window.__do = false; } }')
            r = pg.evaluate('() => __soat()')
        except Exception as e:
            loi.append('%s: %s' % (canh, str(e)[:200])); continue
        pg.screenshot(path=os.path.join(d, canh + '.png'))
        geo = pg.evaluate("() => { const f = document.getElementById('fit').getBoundingClientRect(); return { fx: f.left, fy: f.top, ox: G.ox, oy: G.oy, sc: G.scale, rot: !!G.rot }; }")
        kq[canh] = {'chu': r, 'geo': geo}
    ctx.close()
    return kq, loi


def main():
    chon = set(os.environ['CANH'].split(',')) if os.environ.get('CANH') else None
    cos = [c for c in CO if not os.environ.get('CO') or c[0] in os.environ['CO'].split(',')]
    tat = {}
    loi_all = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for co in cos:
            for mode in ('cu', 'moi'):
                for lang in ('vi', 'en'):
                    kq, loi = chay(b, mode, lang, co, chon)
                    tat['%s-%s-%s' % (mode, lang, co[0])] = kq
                    loi_all += ['%s-%s-%s %s' % (mode, lang, co[0], e) for e in loi]
        b.close()
    json.dump(tat, open(os.path.join(OUT, 'ket-qua-%s%s.json' % (PHONG, os.environ.get('THEM', '').replace('&', '-').replace('=', ''))), 'w'), ensure_ascii=False)
    for k, kq in tat.items():
        n = sum(len(v['chu']) for v in kq.values())
        tr = [c for v in kq.values() for c in v['chu'] if c['tran'] > 0.25 and c['tranG'] > 0.25]
        qd = [c for v in kq.values() for c in v['chu'] if c['tran'] > 0.25 and c['tranG'] <= 0.25]
        cat = [c for v in kq.values() for c in v['chu'] if c['s'].endswith('…') and c['trong']]
        sat = [c for v in kq.values() for c in v['chu'] if c['tran'] <= 0.25 and c['demN'] < 1.75]
        print('%-14s chữ trong khung: %4d | tràn lòng > 0,25: %3d | chỉ qua đinh góc trong lòng: %3d | sát viền ngang (< 2 đệm): %3d | cắt "…": %d' % (k, n, len(tr), len(qd), len(sat), len(cat)))
    print('lỗi trang:', len(loi_all))
    for e in loi_all[:20]: print('  ', e)


def cat_khung(png, geo, f, hop=None, pad=6):
    from PIL import Image
    im = Image.open(png)
    if hop:  # khung to: chỉ cắt quanh chữ (± 40 ngang, ± 14 dọc), trong khung
        x0 = max(f[0] - pad, hop[0] - 40); y0 = max(f[1] - pad, hop[1] - 14); x1 = min(f[0] + f[2] + pad, hop[0] + hop[2] + 40); y1 = min(f[1] + f[3] + pad, hop[1] + hop[3] + 14)
        f = [x0 + pad, y0 + pad, x1 - x0 - 2 * pad, y1 - y0 - 2 * pad]
    sc = geo['sc']; ox = geo['fx'] + geo['ox']; oy = geo['fy'] + geo['oy']
    x0 = int(ox + (f[0] - pad) * sc); y0 = int(oy + (f[1] - pad) * sc); x1 = int(ox + (f[0] + f[2] + pad) * sc); y1 = int(oy + (f[1] + f[3] + pad) * sc)
    return im.crop((max(0, x0), max(0, y0), min(im.width, x1), min(im.height, y1)))


def dung_anh(tat, out_png, co='169', toi_da=60):
    """xem-chu.png: mỗi hàng một chỗ lệch (chế độ cũ), cột trái = trước (?chucu=1), cột phải = sau; VI rồi EN."""
    from PIL import Image, ImageDraw, ImageFont
    try:
        fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    except Exception:
        fnt = ImageFont.load_default()
    rows = []
    for lang in ('vi', 'en'):
        cu, moi = tat.get('cu-%s-%s' % (lang, co), {}), tat.get('moi-%s-%s' % (lang, co), {})
        gom = {}
        for canh, v in cu.items():
            for c in v['chu']:
                if c['tran'] <= 0.25: continue
                key = (canh, c['khung'], tuple(round(q) for q in c['f']))
                if key not in gom or c['tran'] > gom[key]['tran']: gom[key] = c
        # đủ các LOẠI khung: mỗi loại (khung + chữ do hàm khung / nơi gọi vẽ) lấy vài chỗ nặng nhất ở các màn khác nhau
        theo = {}
        for (canh, kh, f), c in sorted(gom.items(), key=lambda kv: -kv[1]['tran']):
            loai = kh + ('' if c['trong'] else '*')
            ds = theo.setdefault(loai, [])
            if len(ds) < 3 and not any(q[0] == canh or q[3]['s'] == c['s'] for q in ds): ds.append((canh, kh, f, c))
        chon = [q for ds in theo.values() for q in ds]
        chon.sort(key=lambda q: -q[3]['tran'])
        for canh, kh, f, c in chon[: toi_da // 2]:
            sau = [q for q in moi.get(canh, {}).get('chu', []) if q['khung'] == kh and all(abs(a - b) < 6 for a, b in zip(q['f'], f))]
            tr = max([q['tran'] for q in sau], default=0)
            rows.append((lang, canh, kh, f, c, tr))
    tiles = []
    for lang, canh, kh, f, c, tr in rows:
        a = cat_khung(os.path.join(OUT, 'cu-%s-%s' % (lang, co), canh + '.png'), tat['cu-%s-%s' % (lang, co)][canh]['geo'], f, c['hop'])
        b = cat_khung(os.path.join(OUT, 'moi-%s-%s' % (lang, co), canh + '.png'), tat['moi-%s-%s' % (lang, co)][canh]['geo'], f, c['hop'])
        k = min(1.0, 560 / max(a.width, 1))
        a = a.resize((int(a.width * k), int(a.height * k))); b = b.resize((int(b.width * k), int(b.height * k)))
        nhan = '%s · %s · %s %s · "%s" tràn %.1f → %.1f điểm' % (lang.upper(), canh, kh, c['ma'], c['s'][:34], c['tran'], tr)
        tiles.append((nhan, a, b))
    W = 20 + 2 * 580
    H = 70 + sum(max(a.height, b.height) + 34 for _, a, b in tiles)
    sh = Image.new('RGB', (W, H), (28, 24, 30)); dr = ImageDraw.Draw(sh)
    dr.text((10, 10), 'Chữ lệch / tràn khung — TRƯỚC (?chucu=1, trái) | SAU (phải). Ảnh tĩnh 480×270 ×3, phông thay Inter. Số: phần chữ ra ngoài lòng khung (điểm game).', fill=(255, 225, 150), font=fnt)
    dr.text((10, 34), 'Mỗi loại khung tối đa 3 chỗ nặng nhất (màn khác nhau); khung* = chữ do nơi gọi tự vẽ trong khung. Số đếm đủ: bao-cao.md.', fill=(200, 200, 200), font=fnt)
    y = 64
    for nhan, a, b in tiles:
        dr.text((10, y), nhan, fill=(240, 230, 200), font=fnt); y += 22
        sh.paste(a, (10, y)); sh.paste(b, (20 + 580, y))
        y += max(a.height, b.height) + 12
    sh.save(out_png, optimize=True)
    print('đã ghi', out_png, sh.size)


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[2] == '--anh':
        dung_anh(json.load(open(os.path.join(OUT, 'ket-qua-%s.json' % PHONG))), os.path.join(HERE, '..', 'xem-chu.png'))
    else:
        main()
