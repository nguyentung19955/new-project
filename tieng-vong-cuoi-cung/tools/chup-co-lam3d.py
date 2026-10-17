#!/usr/bin/env python3
"""Chụp 2 màn hình 480×270 của game/demo.html (bản build một file) trong phòng thật "Sân chuông" — cảnh TĨNH dựng bằng code
(nền + tile + Quái Chuông Gỗ + Lam đứng / Lam chém (HIT) trên bệ đá / Lam chạy), một lần với ?cao=36, một lần với ?cao=46,
rồi ghép ×2 thành art/nhan-vat/lam-3d/co-36-vs-46.png để chọn cỡ nhân vật.
Chạy: python3 game/build-demo.py && python3 tools/chup-co-lam3d.py   (Chromium có sẵn ở /opt/pw-browsers/chromium)
"""
import base64, io, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
HTML = os.path.join(ROOT, 'game', 'demo.build.html')
from PIL import ImageDraw, ImageFont
JS = r"""() => {
  S.paused = true;
  const r = RB, X = r.x0 * T;
  placePlayer(X + 5 * T, FLOOR - pl.h); pl.face = 1;
  Q.forEach(resetQuai);
  const q = Q[0]; q.x = X + 9 * T; q.px = q.x; q.face = -1; q.ak = QS.anims.walk; q.af = 1;
  Q[1].ak = QS.anims.walk; Q[1].af = 0; Q[1].face = -1;
  Q[2].gone = true;
  pl.ak = AN.idle; pl.af = 0; pl.flip = false; pl.sdx = 0;
  S.camx = X + 1 * T; S.pcx = S.camx; S.camy = 0; S.rc = S.camx; S.prc = S.rc; S.sht = 0;
  render(1);
  // Lam thứ 2: đang chém (khung HIT) trên bệ đá
  const a = AN.attack, h = a.frames.findIndex(f => f.hit);
  const s2 = { ak: a, af: h, flip: false, sdx: 0 };
  drawLam(LS, s2, X + 16 * T, 11 * T - pl.h);
  const s3 = { ak: AN.run, af: 3, flip: false, sdx: 0 };
  drawLam(LS, s3, X + 20.5 * T, 11 * T - pl.h);
  return cv.toDataURL('image/png');
}"""
def chup(cao):
    with sync_playwright() as pw:
        kw = {'executable_path': '/opt/pw-browsers/chromium'} if os.path.isfile('/opt/pw-browsers/chromium') else {}
        br = pw.chromium.launch(**kw)
        pg = br.new_page(viewport={'width': 960, 'height': 540})
        loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto('file://' + HTML + '?cao=%d' % cao)
        pg.wait_for_function('window.TVDEMO && window.TVDEMO.ready', timeout=30000)
        d = pg.evaluate(JS); br.close()
    if loi: print('LỖI', loi)
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')
def main():
    ims = {c: chup(c) for c in (36, 46)}
    K, BAR = 2, 34
    g = Image.new('RGBA', (480 * K, 2 * (270 * K + BAR)), (12, 15, 20, 255))
    d = ImageDraw.Draw(g)
    f = None
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.isfile(p): f = ImageFont.truetype(p, 18); break
    nhan = {36: 'Cỡ 36 px (ô 48×48) — ?cao=36 — mặc định', 46: 'Cỡ 46 px (ô 64×64) — ?cao=46'}
    for i, c in enumerate((36, 46)):
        y = i * (270 * K + BAR)
        d.text((12, y + 7), nhan[c], fill=(230, 226, 240), font=f)
        g.paste(ims[c].resize((480 * K, 270 * K), Image.NEAREST), (0, y + BAR))
    dst = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-3d', 'co-36-vs-46.png')
    g.save(dst, optimize=True)
    print('Đã ghi', dst, g.size)


if __name__ == '__main__':
    main()
