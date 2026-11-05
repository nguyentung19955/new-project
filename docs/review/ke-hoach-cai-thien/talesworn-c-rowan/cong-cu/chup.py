"""CHỤP SOÁT HÌNH ROWAN + MÀN ĐẦU (headless, KHÔNG chơi thử bằng tay: dựng cảnh bằng lệnh, bấm phím giả theo kịch bản cố định).

  python3 chup.py <tệp html> <thư mục ra>

Ra (844×390, như iPhone ngang, dpr 2):
  man-dau.png (mặc định), man-dau-cu.png (?mandau=cu)
  rung-<cảnh>.png / lang-<cảnh>.png  (mặc định = Rowan) và *-ninja.png (?zedbo=ninja)
  so-sanh-x3.png: cắt quanh nhân vật, ninja | Rowan, phóng ×3
  chay-chem.gif: Rowan chạy rồi chém 3 nhát (ở rừng)
"""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HTML = os.path.abspath(sys.argv[1])
OUT = os.path.abspath(sys.argv[2])
os.makedirs(OUT, exist_ok=True)
W, H, DPR = 844, 390, 2
SETUP = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game', 'tests', 'setup.js'))

KHOA = r'''() => true'''  # game chạy nhịp thật (khung vẽ của game), kịch bản chỉ giữ / bấm phím giả
VAO_RUNG = r'''
() => {
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), Wd = S.W, P = Wd.P;
  S.fade = 0; S.mode = 'play';
  if (Wd.ents) Wd.ents.length = 0; if (Wd.mobs) Wd.mobs.length = 0; if (Wd.projs) Wd.projs.length = 0; Wd.boss = null;
  P.inv = 0; P.face = 1;
  P.x = (Wd.x0 + Wd.x1) / 2 - 60; P.y = (Wd.y0 + Wd.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; if (G.pointers) G.pointers.clear();
  return true;
}
'''
VAO_LANG = r'''
() => {
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.setScene(G.Village);
  G.keys = {}; G.keyP = {}; if (G.pointers) G.pointers.clear();
  return true;
}
'''
NHIP_JS = r'''
([giu, bam]) => {
  const K = { R: 'ArrowRight', L: 'ArrowLeft', J: 'KeyJ', K: 'KeyK' };
  G.keys = {}; for (const k of giu.split(',')) if (K[k]) G.keys[K[k]] = true;
  for (const k of bam.split(',')) if (K[k]) G.keyP[K[k]] = true;
  try { const R = G.scene !== G.Village && G.getRun && G.getRun(); if (R && R.W) { if (R.W.ents) R.W.ents.length = 0; R.W.P.inv = 0; } } catch (e) { /* làng */ }
  return true;
}
'''


class _Nhip:
    def __call__(self, pg, a):
        giu, bam, n = a
        pg.evaluate(NHIP_JS, [giu, bam])
        pg.wait_for_timeout(int(n * 1000 / 60))
        return True


NHIP = 'NHIP'
_nhip = _Nhip()
VI_TRI = r'''
() => {
  const R = G.scene === G.Village ? null : G.getRun();
  let x, y;
  if (R) { const P = R.W.P; x = P.x - (R.W.cam || 0); y = P.y; }
  else { const s = G.villageScene && G.villageScene.state; if (!s) return null; x = s.x - (s.cam || 0); y = s.y; }
  const cv = document.getElementById('world').getBoundingClientRect();
  return [cv.left + x * cv.width / 480, cv.top + y * cv.height / 270, cv.width / 480];
}
'''


def chup(pg, ten):
    b = pg.screenshot()
    im = Image.open(io.BytesIO(b)).convert('RGB')
    im.save(os.path.join(OUT, ten + '.png'))
    return im


def cat(im, vt, r=34):
    if not vt:
        return None
    x, y, k = vt
    x, y = x * DPR, y * DPR
    rr = r * k * DPR
    return im.crop((int(x - rr), int(y - rr * 1.55), int(x + rr), int(y + rr * 0.45)))


def main():
    cap = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nhan, co in (('', ''), ('-ninja', '&zedbo=ninja')):
            ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: print('LỖI TRANG:', e))
            pg.goto('file://' + HTML + '?cloud=0' + co)
            pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=120000)
            pg.wait_for_timeout(4000)
            pg.add_script_tag(path=SETUP)
            if not nhan:
                chup(pg, 'man-dau')
            pg.evaluate(KHOA)
            pg.evaluate(VAO_RUNG)
            pg.wait_for_timeout(1500)  # ảnh tải sau (tấm to) về
            for _ in range(2):
                _nhip(pg, ['', '', 5])
            ds = [('dung', '', '', 30), ('chay', 'R', '', 14), ('chem1', '', 'J', 5), ('chem2', '', 'J', 9), ('chem3', '', 'J', 9),
                  ('ne', 'R', 'K', 5)]
            _nhip(pg, ['', '', 40])
            for ten, giu, bam, n in ds:
                _nhip(pg, [giu, bam, n])
                im = chup(pg, 'rung-' + ten + nhan)
                cap[('rung-' + ten, nhan)] = cat(im, pg.evaluate(VI_TRI))
            # GIF chạy + chém (chỉ Rowan)
            if not nhan:
                _nhip(pg, ['', '', 40])
                kh = []
                for giu, bam, n in [('R', '', 24), ('', 'J', 10), ('', 'J', 10), ('', 'J', 18)]:
                    for i in range(n // 2):
                        _nhip(pg, [giu, bam if i == 0 else '', 2])
                        im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
                        c = cat(im, pg.evaluate(VI_TRI), 60)
                        if c:
                            kh.append(c.resize((c.width // 2, c.height // 2), Image.NEAREST))
                if kh:
                    kh[0].save(os.path.join(OUT, 'chay-chem.gif'), save_all=True, append_images=kh[1:], duration=67, loop=0)
            pg.evaluate(VAO_LANG)
            pg.wait_for_timeout(800)
            _nhip(pg, ['', '', 20])
            im = chup(pg, 'lang-dung' + nhan)
            cap[('lang-dung', nhan)] = cat(im, pg.evaluate(VI_TRI))
            _nhip(pg, ['L', '', 14])
            im = chup(pg, 'lang-chay' + nhan)
            cap[('lang-chay', nhan)] = cat(im, pg.evaluate(VI_TRI))
            ctx.close()
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.goto('file://' + HTML + '?cloud=0&mandau=cu')
        pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=120000)
        pg.wait_for_timeout(4000)
        chup(pg, 'man-dau-cu')
        b.close()
    # so sánh ×3
    ten = sorted(set(k for k, _ in cap))
    o = [(cap.get((t, '-ninja')), cap.get((t, ''))) for t in ten]
    o = [x for x in o if x[0] and x[1]]
    if o:
        w0, h0 = o[0][0].size
        S = Image.new('RGB', (w0 * 2 + 8, (h0 + 8) * len(o)), (20, 20, 20))
        for i, (a, c) in enumerate(o):
            S.paste(a.resize((w0, h0)), (0, i * (h0 + 8)))
            S.paste(c.resize((w0, h0)), (w0 + 8, i * (h0 + 8)))
        k = 3 / DPR
        S.resize((int(S.width * k), int(S.height * k)), Image.NEAREST).save(os.path.join(OUT, 'so-sanh-x3.png'))
    print('xong', ten)


if __name__ == '__main__':
    main()
