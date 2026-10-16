#!/usr/bin/env python3
"""Mở rig/kiem-tra-rig.html bằng Chromium headless, chụp màn hình, xuất khung, dựng ảnh soát.

Ra rig/soat/:
  dien-thoai-390.png, dien-thoai-390-debug.png, may-tinh-1280.png, bao-loi-*.png
  luoi-12-khung.png  (hàng: liên tục 96, 8 hướng 96, liên tục cỡ game, 8 hướng cỡ game; phóng ×4)
  chay-rig.gif       (liên tục | 8 hướng, phóng ×4)
  tu-kiem.json       (kết quả tự kiểm của trang)
Chạy:  python3 docs/thu-modular-96/rig/soat-rig.py   (sau tao-rig.py)
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else None
from playwright.sync_api import sync_playwright

RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat')
os.makedirs(OUT, exist_ok=True)
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')


def du(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def mo(b, w, h, dpr, q=''):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    msgs = []
    pg.on('pageerror', lambda e: msgs.append(str(e)))
    pg.goto(URL + q)
    pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=20000)
    if msgs:
        print('LỖI JS:', msgs)
        sys.exit(1)
    return pg


loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
    # --- điện thoại ---
    pg = mo(b, 390, 844, 3)
    pg.evaluate('RIG_TEST.stop(3)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390.png'))
    pg.evaluate('RIG_TEST.debug(true)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-debug.png'))
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-ca-trang.png'), full_page=True)
    tran = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth')
    if tran:
        loi.append('trang điện thoại bị tràn ngang')
    K = pg.evaluate('RIG_TEST.K()')
    css = pg.evaluate("[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height,c.getBoundingClientRect().width])")
    rep = pg.evaluate('RIG_TEST.report()')
    summ = pg.evaluate('RIG_TEST.report().summary')
    errs = pg.evaluate('RIG_TEST.errors')
    crop = pg.evaluate('RIG_TEST.crop()')
    N = 12
    fr = {(m, g): [du(pg.evaluate('RIG_TEST.frame(%d,%d,%s)' % (f, m, 'true' if g else 'false'))) for f in range(N)]
          for m in (0, 1) for g in (0, 1)}
    pg.close()
    # --- máy tính ---
    pg = mo(b, 1280, 800, 1)
    pg.evaluate('RIG_TEST.stop(3); RIG_TEST.debug(true)')
    pg.screenshot(path=os.path.join(OUT, 'may-tinh-1280.png'))
    pg.close()
    # --- thử báo lỗi ---
    for q in ('khop', 'anh', 'neo'):
        pg = mo(b, 390, 844, 3, '?loi=' + q)
        e = pg.evaluate('RIG_TEST.errors')
        if not e:
            loi.append('giả lập lỗi "%s" nhưng trang không báo' % q)
        print('thử lỗi %s: %d dòng báo' % (q, len(e)))
        pg.evaluate('RIG_TEST.stop(4)')
        pg.screenshot(path=os.path.join(OUT, 'bao-loi-%s.png' % q))
        pg.close()
    b.close()

if errs:
    loi.append('trang báo lỗi với dữ liệu thật: %s' % errs)

# --- lưới 12 khung × (2 chế độ × 2 cỡ), phóng ×4 ---
S = 4
x0, y0, cw, ch = crop['x'], crop['y'], crop['w'], crop['h']
hang = [((0, 0), 'liên tục 96'), ((1, 0), '8 hướng 96'), ((0, 1), 'liên tục cỡ game'), ((1, 1), '8 hướng cỡ game')]
LB = 34
luoi = Image.new('RGBA', (N * cw * S, len(hang) * (ch * S + LB)), (201, 209, 216, 255))
d = ImageDraw.Draw(luoi)
for r, (k, ten) in enumerate(hang):
    top = r * (ch * S + LB)
    d.rectangle([0, top, luoi.width, top + LB - 1], fill=(40, 40, 40, 255))
    d.text((6, top + 7), ten + '  (khung 1..12, ×4)', fill=(255, 255, 255, 255), font=FONT)
    for f in range(N):
        im = fr[k][f]
        if k[1]:
            im = im.crop((x0 // 2, y0 // 2, (x0 + cw) // 2, (y0 + ch) // 2)).resize((cw * S, ch * S), Image.NEAREST)
        else:
            im = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * S, ch * S), Image.NEAREST)
        luoi.alpha_composite(im, (f * cw * S, top + LB))
        d.text((f * cw * S + 4, top + LB + 2), str(f + 1), fill=(0, 0, 0, 255), font=FONT)
    for f in range(1, N):
        d.line([f * cw * S, top + LB, f * cw * S, top + LB + ch * S], fill=(150, 150, 150, 255))
luoi.convert('RGB').save(os.path.join(OUT, 'luoi-12-khung.png'))

# --- GIF: liên tục | 8 hướng ---
khung = []
for f in range(N):
    g = Image.new('RGB', (2 * cw * S + 8, ch * S), (201, 209, 216))
    for m in (0, 1):
        im = fr[(m, 0)][f].crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * S, ch * S), Image.NEAREST)
        g.paste(im, (m * (cw * S + 8), 0), im)
    ImageDraw.Draw(g).rectangle([cw * S, 0, cw * S + 7, ch * S], fill=(60, 60, 60))
    khung.append(g)
khung[0].save(os.path.join(OUT, 'chay-rig.gif'), save_all=True, append_images=khung[1:], duration=100, loop=0, disposal=2)

json.dump({'summary': summ, 'crop': crop, 'K': K, 'canvas': css, 'frames': rep}, open(os.path.join(OUT, 'tu-kiem.json'), 'w'),
          ensure_ascii=False, indent=1)
print('tóm tắt:', summ, '| K =', K, '| canvas:', css[:2])
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong soát')
