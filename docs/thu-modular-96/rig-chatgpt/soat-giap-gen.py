#!/usr/bin/env python3
"""Soát bộ giáp "Gen" (ảnh gen thật) so với bộ "Máy vẽ" bằng Chromium headless.

Ra rig/soat/:
  luoi-may-vs-gen.png      lưới 12 khung, phóng ×4. Hàng: máy vẽ liên tục, gen liên tục, máy vẽ 8 hướng,
                           gen 8 hướng, gen cỡ game 48, gen ô 192 (×2, chỉ để so sánh)
  chay-may-vs-gen.gif      chạy cạnh nhau: máy vẽ | gen (liên tục) | gen (8 hướng) | gen ô 192
  giap-gen-truoc-sau.png   4 mảnh gen: gốc cắt | thu nhỏ ô 96 | ô 192 | còn lại ở cỡ game 48
  dien-thoai-390-gen*.png  ảnh chụp trang 390×844 DPR 3 (bộ Gen, bộ Gen + ×2, debug)
  tu-kiem-gen.json         tự kiểm 12 khung của cả 2 bộ
Chạy:  python3 docs/thu-modular-96/rig/soat-giap-gen.py   (sau tao-giap-gen.py và tao-rig.py)
"""
import base64, glob, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat')
GG = os.path.join(RIG, 'giap-gen')
os.makedirs(OUT, exist_ok=True)
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME') or next(iter(sorted(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome'))), None)
FP = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT = ImageFont.truetype(FP, 18) if os.path.exists(FP) else None
FONT_S = ImageFont.truetype(FP, 14) if os.path.exists(FP) else None
BG = (201, 209, 216)


def du(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=3)
    msgs = []
    pg.on('pageerror', lambda e: msgs.append(str(e)))
    pg.goto(URL + '?bo=gen')
    pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=30000)
    if msgs:
        print('LỖI JS:', msgs); sys.exit(1)
    errs, warns = pg.evaluate('RIG_TEST.errors'), pg.evaluate('RIG_TEST.warns')
    pg.evaluate('RIG_TEST.stop(3)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-gen.png'))
    pg.evaluate('RIG_TEST.setX2(true)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-gen-x2.png'))
    if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
        loi.append('trang điện thoại bị tràn ngang')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-gen-x2-ca-trang.png'), full_page=True)
    pg.evaluate('RIG_TEST.setX2(false); RIG_TEST.debug(true)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-gen-debug.png'))
    # chữ có tràn khung không (nút, ô chọn, tiêu đề)
    tran = pg.evaluate("""[...document.querySelectorAll('button,.chip,h1,h2,.cap,#boNote,td')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().slice(0, 30))""")
    if tran:
        loi.append('chữ tràn khung: %s' % tran)
    crop = pg.evaluate('RIG_TEST.crop()')
    reps = pg.evaluate('Object.fromEntries(Object.entries(RIG_TEST.reports()).map(([k, v]) => [k, {summary: v.summary, frames: v}]))')
    pieces = pg.evaluate('RIG_TEST.pieces()')
    N = 12
    F = {}
    for sk in ('may', 'gen'):
        for m in (0, 1):
            F[(sk, m, '96')] = [du(pg.evaluate('RIG_TEST.frame(%d,%d,false,"%s",false)' % (f, m, sk))) for f in range(N)]
    F[('gen', 0, '48')] = [du(pg.evaluate('RIG_TEST.frame(%d,0,true,"gen",false)' % f)) for f in range(N)]
    F[('gen', 0, '192')] = [du(pg.evaluate('RIG_TEST.frame(%d,0,false,"gen",true)' % f)) for f in range(N)]
    F[('gen', 1, '192')] = [du(pg.evaluate('RIG_TEST.frame(%d,1,false,"gen",true)' % f)) for f in range(N)]
    b.close()

if errs:
    loi.append('trang báo lỗi: %s' % errs)
x0, y0, cw, ch = crop['x'], crop['y'], crop['w'], crop['h']
S = 4


def cut(im, size):
    """Cắt vùng nhân vật rồi phóng cho bằng cỡ hiển thị của ô 96 ×4 (nearest)."""
    k = {'96': 1, '48': 0.5, '192': 2}[size]
    c = im.crop((int(x0 * k), int(y0 * k), int((x0 + cw) * k), int((y0 + ch) * k)))
    return c.resize((cw * S, ch * S), Image.NEAREST)


# ---------- lưới ----------
hang = [(('may', 0, '96'), 'Máy vẽ · xoay liên tục · ô 96'), (('gen', 0, '96'), 'Gen · xoay liên tục · ô 96'),
        (('may', 1, '96'), 'Máy vẽ · 8 hướng · ô 96'), (('gen', 1, '96'), 'Gen · 8 hướng · ô 96'),
        (('gen', 0, '48'), 'Gen · liên tục · cỡ game 48 (phóng ×8)'), (('gen', 0, '192'), 'Gen · liên tục · ô 192 ×2 — CHỈ để so sánh (phóng ×2)')]
LB = 30
luoi = Image.new('RGBA', (N * cw * S, len(hang) * (ch * S + LB)), BG + (255,))
d = ImageDraw.Draw(luoi)
for r, (k, ten) in enumerate(hang):
    top = r * (ch * S + LB)
    d.rectangle([0, top, luoi.width, top + LB - 1], fill=(40, 40, 40, 255))
    d.text((6, top + 5), ten + '  (khung 1..12)', fill=(255, 255, 255, 255), font=FONT)
    for f in range(N):
        luoi.alpha_composite(cut(F[k][f], k[2]), (f * cw * S, top + LB))
        d.text((f * cw * S + 4, top + LB + 2), str(f + 1), fill=(0, 0, 0, 255), font=FONT)
    for f in range(1, N):
        d.line([f * cw * S, top + LB, f * cw * S, top + LB + ch * S], fill=(150, 150, 150, 255))
luoi.convert('RGB').save(os.path.join(OUT, 'luoi-may-vs-gen.png'))

# ---------- GIF ----------
cot = [(('may', 0, '96'), 'Máy vẽ'), (('gen', 0, '96'), 'Gen'), (('gen', 1, '96'), 'Gen 8 hướng'), (('gen', 0, '192'), 'Gen ô 192')]
GW, GAP, TOP = cw * S, 6, 24
khung = []
for f in range(N):
    g = Image.new('RGB', (len(cot) * (GW + GAP) - GAP, ch * S + TOP), (60, 60, 60))
    dd = ImageDraw.Draw(g)
    for i, (k, ten) in enumerate(cot):
        g.paste(BG, (i * (GW + GAP), TOP, i * (GW + GAP) + GW, TOP + ch * S))
        im = cut(F[k][f], k[2])
        g.paste(im, (i * (GW + GAP), TOP), im)
        dd.text((i * (GW + GAP) + 4, 3), ten, fill=(255, 255, 255), font=FONT_S)
    khung.append(g)
khung[0].save(os.path.join(OUT, 'chay-may-vs-gen.gif'), save_all=True, append_images=khung[1:], duration=100, loop=0, disposal=2)

# ---------- 4 mảnh trước / sau ----------
GEN = json.load(open(os.path.join(GG, 'gen.json')))
TEN = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc']
cols = []
for t in TEN:
    m = GEN['pieces'][t]
    g = Image.open(os.path.join(GG, 'goc-%s.png' % t))
    a = Image.open(os.path.join(GG, t + '.png'))
    a2 = Image.open(os.path.join(GG, t + '-x2.png'))
    a48 = a.resize((max(1, a.width // 2), max(1, a.height // 2)), Image.NEAREST)   # như trang: ô 96 thu ×0,5 nearest
    Z = 192
    cols.append([
        ('gốc cắt %d×%d' % g.size, g.resize((g.width * Z // max(g.size), g.height * Z // max(g.size)), Image.LANCZOS)),
        ('ô 96: %d×%d' % a.size, a.resize((a.width * 16, a.height * 16), Image.NEAREST)),
        ('ô 192: %d×%d' % a2.size, a2.resize((a2.width * 8, a2.height * 8), Image.NEAREST)),
        ('cỡ game 48: %d×%d' % a48.size, a48.resize((a48.width * 32, a48.height * 32), Image.NEAREST)),
    ])
CW = max(max(im.width for _, im in c) for c in cols) + 24
RH = [max(c[r][1].height for c in cols) + 30 for r in range(4)]
tt = Image.new('RGBA', (CW * len(cols), sum(RH) + 34), (232, 236, 240, 255))
d = ImageDraw.Draw(tt)
d.text((8, 6), 'Giáp gen: gốc cắt → thu nhỏ (giữ viền đen + đai đồng, bảng %d màu) → cỡ game. Ô 96 phóng ×16, ô 192 ×8, cỡ 48 ×32.' % len(GEN['palette']),
       fill=(0, 0, 0, 255), font=FONT_S)
for i, c in enumerate(cols):
    y = 34
    for r, (lab, im) in enumerate(c):
        d.text((i * CW + 8, y), lab, fill=(0, 0, 0, 255), font=FONT_S)
        tt.paste((0, 255, 0, 255) if r == 0 else (201, 209, 216, 255), (i * CW + 8, y + 20, i * CW + 8 + im.width, y + 20 + im.height))
        tt.alpha_composite(im, (i * CW + 8, y + 20))
        y += RH[r]
tt.convert('RGB').save(os.path.join(OUT, 'giap-gen-truoc-sau.png'))

json.dump({'crop': crop, 'pieces': pieces, 'warns': warns,
           'summary': {k: v['summary'] for k, v in reps.items()},
           'frames': {k: v['frames'] for k, v in reps.items()}},
          open(os.path.join(OUT, 'tu-kiem-gen.json'), 'w'), ensure_ascii=False, indent=1)
print('tóm tắt:', {k: v['summary'] for k, v in reps.items()})
if loi:
    print('LỖI:', *loi, sep='\n  '); sys.exit(1)
print('xong soát gen')
