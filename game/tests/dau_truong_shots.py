"""Chụp ảnh đấu trường (Giai đoạn 2, phiên dt-dau-truong): mỗi vùng một phòng đánh nhau, vài biến thể sàn, phòng trùm.
Chạy từ thư mục game:  python3 tests/dau_truong_shots.py [thư mục ra] [thư mục game]
Mặc định ra docs/vfx/anh-dau-truong/moi; thư mục game khác (bản cũ) để chụp so sánh.
Mỗi cảnh lưu hai ảnh: cả màn (có giao diện) và lớp điểm ảnh 480x270 phóng 2 lần. Bài báo lỗi JS nếu có."""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.dirname(HERE)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(HERE)), 'docs', 'vfx', 'anh-dau-truong', 'moi')
URL = 'file://' + ROOT + '/index.html'
os.makedirs(OUT, exist_ok=True)

HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.StageScene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, kind, seed, save) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave(Object.assign({ lvl: 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2 + r * 2, branch: 'fire', marks: 140, armor: ['a_r1', 'a_r2', 'a_r3'][r], helm: ['h_r1', 'h_r2', 'h_r3'][r] }, save || {}));
    G.startStage(r, i, 0, { kind, seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  fightUntil(n, maxTicks) {
    const S = G.getRun();
    for (let k = 0; k < (maxTicks || 900); k++) {
      G.sim(1);
      const W = S.W, P = S.P;
      if (S.mode !== 'play') break;
      if (W.ents.length >= n && k > 90 && W.ents.some((e) => Math.abs(e.x - P.x) < 60 && Math.abs(e.y - P.y) < 30)) break;
    }
    S.P.hp = Math.max(S.P.hp, Math.round(S.P.maxhp * 0.8));
    T.freeze();
  },
};
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 992, 'height': 540}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('warning', 'error') and ('art' in m.text or 'Error' in m.text) else None)
        pg.goto(URL)
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(500)
        pg.add_script_tag(path=os.path.join(HERE, 'bot.js'))
        pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
        pg.evaluate(HELP)

        def grab(name, wait=200):
            pg.wait_for_timeout(wait)
            box = pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
            png = pg.screenshot(clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
            Image.open(io.BytesIO(png)).convert('RGB').save(os.path.join(OUT, name + '.png'))
            url = pg.evaluate("G.wx.canvas.toDataURL('image/png')")
            import base64
            im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGB')
            im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(os.path.join(OUT, name + '-diem.png'))

        for r, name in ((0, 'rung'), (1, 'hang'), (2, 'laudai')):
            pg.evaluate("([r]) => { T.start(r, 1, 'A', 3); T.fightUntil(2, 400); }", [r])
            grab(name + '-danh')
            # các biến thể sàn: đi tới phòng khác loại
            for t in ('start', 'chest', 'elite'):
                ok = pg.evaluate("""([r, t]) => { T.start(r, 2, 'B', 5); try { G.testGoto(t); } catch (e) { return false; }
                    const S = G.getRun(); S.fade = 0; for (let k = 0; k < 20; k++) G.sim(1); T.freeze(); return true; }""", [r, t])
                if ok:
                    grab(name + '-' + t)
            pg.evaluate("""([r]) => {
              const S = T.start(r, 4, 'C', 3, { lvl: 10 + r * 8 });
              for (const o of S.map.rooms) if (o.type !== 'boss') { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
              G.gotoRoom(7); G.getRun().fade = 0;
              for (let k = 0; k < 260; k++) { G.sim(1); const P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.7); }
              T.freeze();
            }""", [r])
            grab(name + '-trum')
        b.close()
    print('lỗi JS:', errs or 'không có')
    return 1 if any('Error' in e for e in errs) else 0


if __name__ == '__main__':
    sys.exit(main())
