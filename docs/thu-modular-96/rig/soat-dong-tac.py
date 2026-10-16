#!/usr/bin/env python3
"""Soát phần "sửa lệch vai + hở khớp về 0 + nhiều động tác" bằng Chromium headless (sau tao-rig.py).

Ra rig/soat/:
  dien-thoai-390-dt-<động tác>.png   chụp trang điện thoại 390×844 DPR 3 từng động tác (bộ Máy vẽ, giáp vai trộn)
  dien-thoai-390-dt-chay-gen-debug.png, dien-thoai-390-dt-ca-trang.png (cả trang)
  bao-loi-ho.png                    thử tắt luật chụp khớp → trang phải hiện khung đỏ ghi khung/khớp hở
  vai-truoc-sau.png                 hàng chạy, 12 khung, phóng ×6 quanh vai: TRƯỚC (khớp cũ + theo bắp tay) / SAU (khớp chỉnh + trộn),
                                    bộ Máy vẽ và Gen; chấm đỏ = khớp vai đúng (đo trên ảnh nguồn cao)
  vai-truoc-sau.gif                 chạy: trước | sau (Máy vẽ), phóng ×4
  luoi-dong-tac.png                 mỗi động tác 4 hàng (Máy vẽ/Gen × liên tục/8 hướng), phóng ×3
Thoát mã 1 nếu trang báo lỗi với dữ liệu thật, tràn ngang, hoặc thử lỗi hở mà trang không báo.
Chạy:  python3 docs/thu-modular-96/rig/soat-dong-tac.py
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else None
RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat')
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
du = lambda s: Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')
loi = []


def mo(b, q='', w=390, h=844, dpr=3):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    msgs = []
    pg.on('pageerror', lambda e: msgs.append(str(e)))
    pg.goto(URL + q)
    pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=120000)
    if msgs:
        print('LỖI JS:', msgs); sys.exit(1)
    return pg


def khung(pg, n, act, sk, mode=0):
    return [du(pg.evaluate('RIG_TEST.frame(%d,%d,false,"%s",false,"%s")' % (f, mode, sk, act))) for f in range(n)]


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
    pg = mo(b)
    acts = pg.evaluate('RIG_TEST.acts()')
    errs = pg.evaluate('RIG_TEST.errors')
    if errs:
        loi.append('trang báo lỗi với dữ liệu thật: %s' % errs)
    for a in acts:
        pg.evaluate('RIG_TEST.setAct("%s"); RIG_TEST.stop(%d)' % (a['key'], 2 if a['N'] > 2 else 0))
        pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-dt-%s.png' % a['key']))
        if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
            loi.append('tràn ngang ở động tác %s' % a['key'])
    pg.evaluate('RIG_TEST.setAct("chay"); RIG_TEST.setSet("gen"); RIG_TEST.stop(6); RIG_TEST.debug(true)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-dt-chay-gen-debug.png'))
    pg.evaluate('RIG_TEST.debug(false); RIG_TEST.setSet("may"); RIG_TEST.stop(2)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-dt-ca-trang.png'), full_page=True)
    vai = pg.evaluate('RIG_TEST.vai()')
    crop = {a['key']: None for a in acts}
    # khung "sau" (khớp chỉnh + trộn) và lưới động tác
    sau = {sk: khung(pg, 12, 'chay', sk) for sk in ('may', 'gen')}
    luoi = {}
    for a in acts:
        pg.evaluate('RIG_TEST.setAct("%s")' % a['key'])
        crop[a['key']] = pg.evaluate('RIG_TEST.crop()')
        luoi[a['key']] = {(sk, m): khung(pg, a['N'], a['key'], sk, m) for sk in ('may', 'gen') for m in (0, 1)}
    J = pg.evaluate('RIG_TEST.vai()')
    pg.close()
    # khung "trước": khớp cũ data.json + giáp vai theo bắp tay
    pg = mo(b, '?khop=goc&vai=xuong')
    truoc = {sk: khung(pg, 12, 'chay', sk) for sk in ('may', 'gen')}
    pg.close()
    # thử lỗi hở
    pg = mo(b, '?loi=ho')
    ge = pg.evaluate('RIG_TEST.gapErrors()')
    if not ge:
        loi.append('tắt luật chụp khớp mà trang không báo hở')
    print('thử lỗi hở: %d dòng báo, ví dụ: %s' % (len(ge), ge[:1]))
    pg.evaluate('RIG_TEST.stop(0); window.scrollTo(0,0)')
    pg.screenshot(path=os.path.join(OUT, 'bao-loi-ho.png'))
    pg.close()
    b.close()

# ---------- vai-truoc-sau.png ----------
data = json.load(open(os.path.join(RIG, 'khop-chinh', 'chay.json')))
Z, CW, CH = 6, 30, 26
LB = 26
rows = [('Máy vẽ · TRƯỚC: khớp cũ + theo bắp tay', truoc['may']), ('Máy vẽ · SAU: khớp chỉnh + trộn thân+tay', sau['may']),
        ('Gen · TRƯỚC', truoc['gen']), ('Gen · SAU', sau['gen'])]
img = Image.new('RGBA', (12 * CW * Z + 11 * 4, len(rows) * (CH * Z + LB)), (40, 40, 40, 255))
d = ImageDraw.Draw(img)
for r, (ten, fr) in enumerate(rows):
    top = r * (CH * Z + LB)
    d.text((6, top + 4), ten + '   (khung 1..12, ×6; chấm đỏ = khớp vai trước đúng, chấm vàng = khớp khuỷu trước)', fill=(255, 255, 255), font=FONT)
    for f in range(12):
        Jf = data['frames'][f]['joints']
        sx, sy = int(Jf['shoulderFront'][0]) - 13, int(Jf['shoulderFront'][1]) - 8
        bg = Image.new('RGBA', (96, 96), (201, 209, 216, 255)); bg.alpha_composite(fr[f])
        c = bg.crop((sx, sy, sx + CW, sy + CH)).resize((CW * Z, CH * Z), Image.NEAREST)
        dc = ImageDraw.Draw(c)
        for n, col in (('shoulderFront', (230, 0, 0)), ('elbowFront', (255, 210, 0))):
            q = ((Jf[n][0] - sx) * Z, (Jf[n][1] - sy) * Z)
            dc.ellipse([q[0] - 4, q[1] - 4, q[0] + 4, q[1] + 4], fill=col, outline=(0, 0, 0))
        img.alpha_composite(c, (f * (CW * Z + 4), top + LB))
        d.text((f * (CW * Z + 4) + 4, top + LB + 2), str(f + 1), fill=(0, 0, 0), font=FONT)
img.convert('RGB').save(os.path.join(OUT, 'vai-truoc-sau.png'), optimize=True)

# ---------- vai-truoc-sau.gif ----------
c = crop['chay']
x0, y0, cw, ch = c['x'], c['y'], c['w'], c['h']
gif = []
for f in range(12):
    g = Image.new('RGB', (2 * cw * 4 + 8, ch * 4 + 24), (201, 209, 216))
    for i, fr in enumerate((truoc['may'], sau['may'])):
        im = fr[f].crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * 4, ch * 4), Image.NEAREST)
        g.paste(im, (i * (cw * 4 + 8), 24), im)
    dg = ImageDraw.Draw(g)
    dg.rectangle([cw * 4, 0, cw * 4 + 7, g.height], fill=(60, 60, 60))
    dg.text((4, 3), 'TRƯỚC', fill=(0, 0, 0), font=FONT); dg.text((cw * 4 + 12, 3), 'SAU', fill=(0, 0, 0), font=FONT)
    gif.append(g)
gif[0].save(os.path.join(OUT, 'vai-truoc-sau.gif'), save_all=True, append_images=gif[1:], duration=100, loop=0, disposal=2)

# ---------- luoi-dong-tac.png ----------
S = 3
blocks = []
for a in acts:
    c = crop[a['key']]
    x0, y0, cw, ch = c['x'], c['y'], c['w'], c['h']
    hang = [(('may', 0), 'Máy vẽ · liên tục'), (('gen', 0), 'Gen · liên tục'), (('may', 1), 'Máy vẽ · 8 hướng'), (('gen', 1), 'Gen · 8 hướng')]
    blk = Image.new('RGBA', (max(12, a['N']) * (cw * S + 3), LB + len(hang) * (ch * S + LB)), (40, 40, 40, 255))
    db = ImageDraw.Draw(blk)
    db.text((6, 4), '%s (%d khung, %s)' % (a['name'], a['N'], 'lớp tách' if a['layered'] else 'sheet cả người — cách tạm'), fill=(255, 220, 120), font=FONT)
    for r, (k, ten) in enumerate(hang):
        top = LB + r * (ch * S + LB)
        db.text((6, top + 4), ten, fill=(255, 255, 255), font=FONT)
        for f, im in enumerate(luoi[a['key']][k]):
            bg = Image.new('RGBA', (96, 96), (201, 209, 216, 255)); bg.alpha_composite(im)
            blk.alpha_composite(bg.crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * S, ch * S), Image.NEAREST), (f * (cw * S + 3), top + LB))
    blocks.append(blk)
Wd = max(bk.width for bk in blocks)
L = Image.new('RGB', (Wd, sum(bk.height for bk in blocks)), (40, 40, 40))
y = 0
for bk in blocks:
    L.paste(bk, (0, y)); y += bk.height
L.save(os.path.join(OUT, 'luoi-dong-tac.png'), optimize=True)

T = J['pieces']['vaiTruoc']
print('vai trước: lệch neo TB %.2f / max %.2f → TB %.2f / max %.2f; rung %s → %s' % (T['tbTruoc'], T['maxTruoc'], T['tbSau'], T['maxSau'], T['before'], T['after']))
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong soát động tác: %s' % ', '.join(a['key'] for a in acts))
