# Ảnh thử cho lô gộp cửa 3 vùng (tach-phong): tấm 6×3 (1536×1024) và 3 tấm 3×2 có CÙNG hình từng cửa.
import sys
from PIL import Image, ImageDraw
D = sys.argv[1]; HONG = (255, 0, 255)
MAU = [(88, 55, 30), (51, 60, 71), (92, 91, 115)]            # rừng (gỗ), biển (đá), lâu đài (thép)
CHAN = [(149, 165, 58), (50, 176, 233), (201, 39, 12)]       # vật chắn khi khoá
def cua(dang, vung, khoa):  # hình cửa mẫu trên nền trong suốt; dáng theo loại cửa: trên (vuông), dưới (dẹt), bên (cao hẹp)
    w, h = {'tren': (150, 150), 'duoi': (170, 104), 'ben': (56, 168)}[dang]
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); g = ImageDraw.Draw(im)
    g.rectangle([0, 0, w - 1, h - 1], fill=MAU[vung] + (255,), outline=(20, 24, 46, 255), width=4)
    g.rectangle([w * .25, h * .3, w * .75, h - 5], fill=(18, 13, 17, 255) if khoa else (228, 240, 160, 255))
    if khoa:
        for k in range(3): g.rectangle([w * (.3 + .15 * k), h * .35, w * (.36 + .15 * k), h - 6], fill=CHAN[vung] + (255,))
    return im
def tam(W, H, C, R, o, ra):  # o: danh sách (dáng, vùng, khoá) theo thứ tự đọc
    im = Image.new('RGB', (W, H), HONG); g = ImageDraw.Draw(im); cw, ch = W / C, H / R
    for i, (d, v, k) in enumerate(o):
        c, r = i % C, i // C; s = cua(d, v, k); im.paste(s, (round(c * cw + (cw - s.width) / 2), round((r + 1) * ch - 40 - s.height)), s)
    for c in range(1, C): x = round(c * cw); g.rectangle([x - 3, 0, x + 2, H], fill=(20, 16, 24))
    for r in range(1, R): y = round(r * ch); g.rectangle([0, y - 3, W, y + 2], fill=(20, 16, 24))
    im.save(ra)
DANG = ['tren', 'duoi', 'ben']
tam(1536, 1024, 6, 3, [(d, v, k) for v in range(3) for k in (0, 1) for d in DANG], D + '/cua-gop.png')
for v, ten in enumerate(['rung', 'bien', 'lau']): tam(1536, 1024, 3, 2, [(d, v, k) for k in (0, 1) for d in DANG], D + f'/cua-{ten}.png')
