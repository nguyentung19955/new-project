"""Kiểm tra vùng báo trước vẽ mịn (js/bao_truoc.js): đủ mọi hình, vẽ ở lớp giao diện chứ không ở lớp điểm ảnh,
nằm dưới em bé (thân em bé không bị nhuộm đỏ), hiện ra mượt, thanh đếm ngược lấp dần, chớp lúc nổ rồi tan,
và không đổi thời gian báo trước. Chạy: python3 tests/bao_truoc.py"""
import os, sys
from quai_lib import sync_playwright, open_page

JS = r"""
() => {
  const out = [], ok = (n, c, d) => out.push([n, !!c, d || '']);
  const BT = G.baoTruoc;
  ok('có G.baoTruoc', !!BT && typeof BT.draw === 'function');
  const { W, P } = T.room(0, 2, { seed: 5 });
  P.x = 200; P.y = 170;
  for (let i = 0; i < 30; i++) { T.frame(1); P.hp = P.maxhp; P.x = 200; P.y = 170; }
  const cw = G.wx.canvas.width, ch = G.wx.canvas.height;
  const mix = document.createElement('canvas'); mix.width = cw; mix.height = ch; const mc = mix.getContext('2d', { willReadFrequently: true });
  const world = () => G.wx.getImageData(0, 0, cw, ch).data;
  const ui = () => { mc.clearRect(0, 0, cw, ch); mc.drawImage(G.ux.canvas, G.ox * G.dpr, G.oy * G.dpr, G.W * G.uiScale, G.H * G.uiScale, 0, 0, cw, ch); return mc.getImageData(0, 0, cw, ch).data; };
  const draw = () => { G.ui.begin(); G.scene.draw(); };
  const cnt = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++; return n; };
  const redAt = (d, x, y) => { const i = (Math.round(y) * cw + Math.round(x)) * 4; return d[i + 3] > 0 && d[i] > 120 && d[i] > d[i + 1] * 1.4; };
  const freeze = G.time, cam = Math.round(W.cam);
  // đủ mọi hình: tròn, chữ nhật, đường thẳng, quạt, vành có khe, tường nước (lúc chờ)
  const shapes = {
    'tròn': { shape: 'circle', x: 300, y: 150, r: 30 },
    'chữ nhật': { shape: 'rect', x: 270, y: 130, w: 60, h: 30 },
    'đường thẳng': { shape: 'line', x: 260, y: 150, ang: 0.3, len: 80, w: 18 },
    'quạt': { shape: 'cone', x: 300, y: 150, ang: Math.PI, r: 60, span: 1.2 },
    'vành có khe': { shape: 'donut', x: 300, y: 150, r0: 20, r1: 45, gaps: [0, Math.PI], gw: 0.3 },
  };
  for (const k in shapes) {
    W.zones = []; G.time = freeze; draw(); const w0 = world(), u0 = ui();
    W.zones = [Object.assign({ t: 0.5, t0: 1, dmg: 1, life: 0.12 }, shapes[k])];
    G.time = freeze; draw(); const w1 = world(), u1 = ui();
    ok('vùng ' + k + ': không vẽ lên lớp điểm ảnh', cnt(w0, w1) === 0, cnt(w0, w1) + ' điểm khác');
    ok('vùng ' + k + ': vẽ ở lớp giao diện', cnt(u0, u1) > 200, cnt(u0, u1) + ' điểm khác');
  }
  W.zones = [{ wall: true, x: 380, y: 150, ang: Math.PI, s: 10, v: 155, th: 14, half: 120, g: 0, gw: 26, wait: 0.6, maxS: 340, dmg: 1, el: 'ice' }];
  G.time = freeze; draw(); G.time = freeze + 0.2; draw(); const wl = ui(); W.zones = []; G.time = freeze + 0.2; draw(); // tường hiện ra mượt: xem sau 0,2 giây
  ok('tường nước lúc chờ: vẽ ở lớp giao diện', cnt(ui(), wl) > 200);
  // nằm dưới em bé: vùng tròn phủ em bé, điểm giữa thân bé không bị nhuộm đỏ ở lớp giao diện
  const Z = { shape: 'circle', x: P.x, y: P.y - 4, r: 34, t: 0.5, t0: 1, dmg: 1, life: 0.12 };
  W.zones = [Z]; G.time = freeze; draw(); const u2 = ui();
  const bodyRed = [[0, -10], [0, -14], [-2, -12], [2, -18]].filter((q) => redAt(u2, P.x - cam + q[0], P.y + q[1])).length;
  const floorRed = [[-24, 0], [24, 2], [0, 14]].filter((q) => redAt(u2, P.x - cam + q[0], P.y + q[1])).length;
  ok('vùng nằm dưới em bé (thân bé không bị phủ đỏ)' + (BT.hasMask() ? '' : ' [máy không có bộ lọc: xoá gần đúng]'), bodyRed === 0, 'điểm thân bị đỏ ' + bodyRed);
  ok('sàn quanh em bé vẫn đỏ', floorRed >= 2, 'điểm sàn đỏ ' + floorRed);
  // hiện ra mượt: vừa xuất hiện thì mờ hơn lúc đã hiện hẳn
  const sum = (d) => { let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; return s; };
  W.zones = []; G.time = freeze; draw(); const e0 = sum(ui());
  W.zones = [{ shape: 'circle', x: 330, y: 120, r: 30, t: 0.99, t0: 1, dmg: 1 }]; G.time = freeze; draw(); const e1 = sum(ui()) - e0;
  W.zones = [{ shape: 'circle', x: 330, y: 120, r: 30, t: 0.8, t0: 1, dmg: 1 }]; G.time = freeze; draw(); const e2 = sum(ui()) - e0;
  ok('hiện ra mượt (0,01 giây đầu mờ hơn lúc 0,2 giây)', e1 < e2 * 0.5, Math.round(e1) + ' < ' + Math.round(e2));
  // thanh đếm ngược: lấp càng nhiều thì càng đậm
  W.zones = [{ shape: 'circle', x: 330, y: 120, r: 30, t: 0.2, t0: 1, dmg: 1 }]; G.time = freeze; draw(); const e3 = sum(ui()) - e0;
  ok('thanh đếm ngược lấp dần (gần nổ đậm hơn)', e3 > e2 * 1.15, Math.round(e3) + ' > ' + Math.round(e2));
  // nổ: chớp sáng rồi tan trong khoảng 0,2 giây; thời gian báo trước không đổi
  G.time = freeze;
  const z = G.mobZone('circle', { x: 330, y: 120 }, 0.5, 1, null, { r: 26 });
  ok('thời gian báo trước giữ nguyên', z.t === 0.5 && z.t0 === 0.5);
  W.P.x = 120; W.P.y = 200;
  let steps = 0; while (z.t > 0 && steps < 200) { T.frame(1); steps++; W.P.x = 120; W.P.y = 200; }
  ok('vùng nổ đúng sau 0,5 giây', Math.abs(steps / 60 - 0.5) < 0.04, steps + ' khung');
  T.frame(1); W.P.x = 120; W.P.y = 200;
  ok('lúc nổ có chớp sáng', BT.ghosts.length > 0);
  T.frame(16);
  ok('chớp tan sau khoảng 0,2 giây', BT.ghosts.length === 0);
  ok('không lỗi vẽ', BT.errs === 0 && G.fx.errs === 0, BT.errs + ' / ' + G.fx.errs);
  G.time = freeze + 1;
  return out;
}
"""

with sync_playwright() as pw:
    b, pg, errs = open_page(pw, 844, 390)
    res = pg.evaluate(JS)
    b.close()
bad = 0
for n, good, d in res:
    if not good or '-v' in sys.argv:
        print(('ĐẠT ' if good else 'HỎNG ') + n, d)
    bad += 0 if good else 1
errs = [e for e in errs if 'willReadFrequently' not in e]
if errs:
    print('LỖI TRANG', errs[:5]); bad += 1
print('%d/%d mục đạt' % (len(res) - (bad if not errs else bad - 1), len(res)))
sys.exit(1 if bad else 0)
