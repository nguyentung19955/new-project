# Ảnh soát: xem-trum-chet.png (mỗi trùm-pha một hàng: khung idle 1 + 8 khung die, cùng tỉ lệ, đã áp can_tam, vạch đất đỏ, vạch neo xanh)
# và xem-trum-chet.gif (6 ô: idle → die 10 khung/giây như game, mờ dần ở 60%).
from chung import *
from PIL import ImageDraw, ImageFont
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
NEN = (58, 62, 70, 255)
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: FONT = ImageFont.load_default()

def o(d, im, ten, i):
    """Ô cỡ game (net = 1 → nhân 1), khung đã dời theo can_tam, gốc ô = (ax, ay)."""
    k = khung(d, im, ten, i); ct = (d.get('can_tam') or {}).get(ten); dx = ct[i] if ct else 0
    c = Image.new('RGBA', k.size, (0, 0, 0, 0)); c.alpha_composite(k, (dx, 0)) if dx >= 0 else c.alpha_composite(k.crop((-dx, 0, k.size[0], k.size[1])), (0, 0))
    return c

CW, CH, AX, AY = 200, 250, 92, 236  # ô chung để mọi trùm cùng tỉ lệ (điểm ảnh game, phóng 1x)
def dat(c, d):
    ax, ay = d['goc']; t = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); t.alpha_composite(c, (AX - ax, AY - ay)); return t

rows = []
for ma, _ in VIEC:
    d, im = doc(ma)
    cells = [dat(o(d, im, 'idle', 0), d)] + [dat(o(d, im, 'die', i), d) for i in range(8)]
    rows.append((ma, cells, d))
W = 9 * CW + 10; H = len(rows) * (CH + 22) + 24
sheet = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(sheet)
dr.text((6, 4), 'idle khung 1 | die 1..8 (đã áp can_tam). Vạch đỏ: đường đất goc[1]; vạch xanh: neo goc[0]. Cùng tỉ lệ (1 điểm ảnh game = 1 điểm).', fill=(230, 230, 230), font=FONT)
for r, (ma, cells, d) in enumerate(rows):
    y = 24 + r * (CH + 22)
    dr.text((6, y), '%s   khung %dx%d   die: %s' % (ma, d['khung_rong'], d['khung_cao'], d['dong_tac']['die']), fill=(255, 220, 120), font=FONT)
    for j, c in enumerate(cells):
        x = 5 + j * CW
        if j == 0: dr.rectangle((x, y + 20, x + CW - 2, y + 20 + CH), fill=(72, 78, 88))
        sheet.alpha_composite(c, (x, y + 20))
        dr.line((x, y + 20 + AY, x + CW - 4, y + 20 + AY), fill=(255, 70, 70))
        dr.line((x + AX, y + 20 + AY - 6, x + AX, y + 20 + AY + 6), fill=(80, 200, 255))
sheet.convert('RGB').save(os.path.join(OUT, 'xem-trum-chet.png'), optimize=True)

DOC = {ma: doc(ma) for ma, _ in VIEC}
# GIF: 3 cột x 2 hàng, 12 khung/giây xấp xỉ: 6 khung idle, rồi die 8 khung (0,1 s), mờ ở khung cuối
frames = []
seq = [('idle', i % 6, 1.0) for i in range(6)] + [('die', i, 1.0) for i in range(8)] + [('die', 7, a) for a in (0.66, 0.33, 0.0)] + [(None, 0, 0)] * 3
for ten, i, a in seq:
    f = Image.new('RGBA', (3 * CW, 2 * (CH + 20)), NEN); dd = ImageDraw.Draw(f)
    for k, (ma, cells, d) in enumerate(rows):
        x, y = (k % 3) * CW, (k // 3) * (CH + 20)
        dd.text((x + 4, y + 2), ma, fill=(255, 220, 120), font=FONT)
        dd.line((x + 8, y + 20 + AY, x + CW - 8, y + 20 + AY), fill=(255, 70, 70))
        if ten:
            c = cells[0] if ten == 'idle' and i == 0 else None
            if c is None:
                d2, im2 = DOC[ma]; c = dat(o(d2, im2, ten, i), d2)
            if a < 1: c = c.copy(); c.putalpha(c.getchannel('A').point(lambda v: int(v * a)))
            f.alpha_composite(c, (x, y + 20))
    frames.append(f.convert('RGB'))
frames[0].save(os.path.join(OUT, 'xem-trum-chet.gif'), save_all=True, append_images=frames[1:], duration=[100 if t[0]=='die' else 120 for t in seq], loop=0, optimize=True)
