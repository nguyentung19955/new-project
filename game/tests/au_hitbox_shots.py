"""AUDIT chiến đấu — ảnh khớp hình vũ khí với vùng trúng (góp ý ChatGPT mục 3.1 ý 2).
  cd game && python3 tests/au_hitbox_shots.py
Dừng thế giới đúng khung gây sát thương của từng đòn (và một khung trước/sau), vẽ thêm khung tím = vùng trúng thật
(hình chữ nhật xoay theo hướng nhắm, tính bằng đúng công thức inBox của js/moves.js cho quái cỡ 8x6), chụp ảnh phóng to.
Ảnh lưu ở docs/review/anh-chien-dau/hitbox-*.png. Không sửa game."""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh-chien-dau')

JS = r"""
([mode, offset, ay]) => {
  const melee = { sword1: 'sword', sword3: 'sword', spear: 'spear', sweep: 'spear', hammer: 'hammer' }[mode];
  const { W, P } = AU.room({ melee, lvl: 10 });
  AU.want(P, melee);
  P.x = W.geo.cx - 20; P.y = W.geo.cy; P.face = 1;
  const e = AU.dummy(P.x + 26, P.y + ay, { hp: 1e7 });
  const I = AU.inp;
  if (mode === 'sword3') { for (let k = 0; k < 200 && !(P.mv && P.mv.step === 2 && P.atkT > 0); k++) { I.atk = true; AU.run(1, true); } I.atk = false; }
  else if (mode === 'sweep') { for (let k = 0; k < 300 && !(P.mv && P.mv.kind === 'quet' && P.atkT > 0); k++) { I.atk = k % 4 === 0; I.atkP = I.atk; AU.run(1, true); } I.atk = false; }
  else if (mode === 'sword1') { I.atk = true; I.atkP = true; AU.run(1, true); I.atk = false; }
  else { I.atk = true; I.atkP = true; AU.run(1, true); I.atk = false; AU.run(1, true); }
  // chạy tới khung gây sát thương (+offset khung)
  let k = 0;
  while (!P.hitDone && k++ < 120) AU.run(1, true);
  for (let i = 0; i < offset; i++) AU.run(1, true);
  const o = P.mv.cur || {}, m = o.m || {};
  const prog = P.atkT > 0 ? 1 - P.atkT / P.atkDur : 1;
  // vùng trúng (trên sàn) -> đổi ra màn hình (chiều dọc x ZK)
  const ZK = G.ZK, ux = P.aimX, uy = P.aimY, r = 8, hr = 6;
  let pts = [];
  if (o.kind === 'quet') {
    for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2; pts.push([P.x + Math.cos(t) * (o.reach + r), P.y + Math.sin(t) * (o.reach + r) * ZK]); }
  } else {
    const back = 8 + r * 0.5, reach = o.reach + r, half = Math.abs(ux) * (o.depth / 2 + hr) / ZK + Math.abs(uy) * (o.depth / 2 + r);
    const nx = -uy, ny = ux;
    for (const [a, b] of [[-back, -half], [reach, -half], [reach, half], [-back, half]]) pts.push([P.x + ux * a + nx * b, P.y + (uy * a + ny * b) * ZK]);
  }
  window.__box = { pts };
  if (!window.__wrapped) {
    window.__wrapped = true;
    const dw0 = G.drawWorld;
    G.drawWorld = function (reg) {
      dw0(reg);
      const B = window.__box, c = G.wx, W2 = G.getWorld();
      if (!B) return;
      c.setTransform(1, 0, 0, 1, -Math.round(W2.cam), 0);
      c.strokeStyle = 'rgba(255,0,255,0.9)'; c.lineWidth = 1; c.beginPath();
      B.pts.forEach((q, i) => (i ? c.lineTo(q[0] + 0.5, q[1] + 0.5) : c.moveTo(q[0] + 0.5, q[1] + 0.5)));
      c.closePath(); c.stroke();
      c.setTransform(1, 0, 0, 1, 0, 0);
    };
  }
  G.fx.state().stop = 0;
  return { mode, prog: +prog.toFixed(2), hitDone: P.hitDone, px: P.x, py: P.y, name: o.name, reach: o.reach, depth: o.depth };
}
"""


def main():
    os.makedirs(SHOTS, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        for mode, ay in [('sword1', 0), ('sword3', 0), ('spear', 0), ('sweep', 0), ('hammer', 0), ('sword1', 18)]:
            for off in [0, 4]:
                r = pg.evaluate(JS, [mode, off, ay])
                pg.wait_for_timeout(120)
                st = pg.evaluate("(() => { const s = document.getElementById('stage').getBoundingClientRect(); return [s.left, s.top, G.scale]; })()")
                x, y, sc = st
                cx, cy = x + r['px'] * sc, y + r['py'] * sc
                name = 'hitbox-%s%s-%s.png' % (mode, '-cheo' if ay else '', 'cham' if off == 0 else 'sau%d' % off)
                pg.screenshot(path=os.path.join(SHOTS, name), clip={'x': cx - 55 * sc, 'y': cy - 50 * sc, 'width': 135 * sc, 'height': 80 * sc})
                print(name, r)
        b.close()
    if errs:
        print('LỖI JS:', errs[:5])


if __name__ == '__main__':
    main()
