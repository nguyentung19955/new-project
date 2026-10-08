"""Chụp ảnh cung ở tám hướng, quái ở gần và ở xa: lúc giương cung, lúc vừa buông và lúc tên đang bay. Lưu vào docs/sua-gop-y-1/.
Chạy từ thư mục game:  python3 tests/cung_shots.py [tiền tố, mặc định "sau"] [thư mục game khác, để chụp bản cũ]. Cần Pillow."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRE = sys.argv[1] if len(sys.argv) > 1 else 'sau'
ROOT = sys.argv[2] if len(sys.argv) > 2 else HERE
OUT = os.path.join(os.path.dirname(HERE), 'docs', 'sua-gop-y-1')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
DIRS = ['phải', 'chéo phải xuống', 'xuống', 'chéo trái xuống', 'trái', 'chéo trái lên', 'lên', 'chéo phải lên']

JS = r"""
(o) => {
  if (!window.TT) {
    const sc = G.scene; window.TT = { sc };
  }
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  G.MOVE_TIPS = {};
  G.testSave({ hero: 'hunter', melee: 'sword', tier: 2, branch: o.el || null, marks: 130 });
  G.HEROES.hunter.fav = [];
  G.startStage(0, 2, 0);
  const S = G.getRun(), W = G.getWorld(), P = S.P, sc = G.scene;
  G.scene = { update() {}, draw() { sc.draw(); }, hide() {} };
  const step = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.time += 1 / 60; sc.update(1 / 60); for (const q of ['atkP', 'specialP', 'skillP']) delete inp[q]; } };
  W.waves = []; W.banner = null; S.fade = 0; P.cur = 1;
  step(8, {});
  W.ents.length = 0; W.projs.length = 0; W.zones.length = 0;
  const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2, a = o.d * Math.PI / 4;
  P.x = cx; P.y = cy; P.face = 1; P.inv = 0; P.hurtT = 0; P.hp = P.maxhp; P.mana = P.maxmana;
  const e = G.spawnEnemy('rusher', G.clamp(cx + Math.cos(a) * o.dist, W.x0 + 6, W.x1 - 6), G.clamp(cy + Math.sin(a) * o.dist * 0.75, W.y0 + 4, W.y1 - 4), { hpMult: 1e6 });
  e.st.stun = 1e9; e.inside = true;
  step(4, {});
  if (o.phase === 'hold') step(40, { atk: true });
  else if (o.phase === 'rel') { step(60, { atk: true }); step(o.k || 3, {}); }
  else if (o.phase === 'tap') { step(2, { atk: true }); step(o.k || 10, {}); }
  G.texts = []; W.texts = [];
  G.render ? G.render() : sc.draw();
  sc.draw();
  return [P.x, P.y, (e.x + P.x) / 2, (e.y + P.y) / 2];
}
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(500)
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
        f = ImageFont.truetype(FONT, 20)

        def shot(o, half):
            px, py, mx, my = pg.evaluate(JS, o)
            pg.wait_for_timeout(60)
            box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480]; })()")
            ox, oy = (mx, my - 12) if half > 60 else (px, py - 12)
            clip = {'x': box[0] + (ox - half) * box[2], 'y': box[1] + (oy - half * 0.6) * box[2], 'width': 2 * half * box[2], 'height': 1.2 * half * box[2]}
            im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
            return im.resize((360, round(360 * im.size[1] / im.size[0])), Image.NEAREST)

        def sheet(name, title, items, half):
            ims = [(shot(o, half), cap) for o, cap in items]
            w, h = ims[0][0].size
            cols = 4
            rows = (len(ims) + cols - 1) // cols
            out = Image.new('RGB', (cols * (w + 12) + 12, 60 + rows * (h + 40)), '#140f10')
            d = ImageDraw.Draw(out)
            d.text((out.size[0] / 2, 28), title, font=f, fill='#ffd27a', anchor='mm')
            for i, (im, cap) in enumerate(ims):
                x, y = 12 + (i % cols) * (w + 12), 56 + (i // cols) * (h + 40)
                out.paste(im, (x, y))
                d.text((x + w / 2, y + h + 16), cap, font=f, fill='#f1ead9', anchor='mm')
            out.save(os.path.join(OUT, f'{PRE}-{name}.png'))
            print('đã ghi', f'{PRE}-{name}.png')

        sheet('giuong-cung-gan', f'{PRE.upper()}: giương cung, quái sát người, tám hướng', [({'d': d, 'dist': 22, 'phase': 'hold'}, DIRS[d]) for d in range(8)], 38)
        sheet('vua-buong-gan', f'{PRE.upper()}: vừa buông dây, quái sát người', [({'d': d, 'dist': 26, 'phase': 'rel', 'k': 2}, DIRS[d]) for d in range(8)], 46)
        sheet('ten-bay-xa', f'{PRE.upper()}: bắn thường, quái ở xa, tên đang bay', [({'d': d, 'dist': 110, 'phase': 'tap', 'k': 22}, DIRS[d]) for d in range(8)], 80)
        sheet('ten-manh-xa', f'{PRE.upper()}: tên mạnh, quái ở xa', [({'d': d, 'dist': 110, 'phase': 'rel', 'k': 8, 'el': 'fire'}, DIRS[d]) for d in range(8)], 80)
        b.close()
        if errs:
            print('lỗi trang:', errs[:3])


main()
