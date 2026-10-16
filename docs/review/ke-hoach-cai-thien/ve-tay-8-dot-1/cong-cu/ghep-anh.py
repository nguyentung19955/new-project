"""Ghép ảnh soát TRƯỚC / SAU từ các thư mục ra của soat.py.
    python3 ghep-anh.py <trước> <sau> <trước ?baoanh=0> <sau ?baoanh=0> <thư mục ra>"""
import os, sys
from PIL import Image, ImageDraw
A, B, AP, BP, OUT = sys.argv[1:6]


def nhan(im, s):
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 8 + 7 * len(s), 14), fill=(0, 0, 0)); d.text((4, 2), s, fill=(255, 235, 150)); return im


def doc(d, t): return Image.open(os.path.join(d, t + '.png')).convert('RGB')


def luoi(o, ims, cot):
    w = max(i.width for i, _ in ims); h = max(i.height for i, _ in ims); hang = (len(ims) + cot - 1) // cot
    c = Image.new('RGB', (cot * w + (cot - 1) * 6, hang * h + (hang - 1) * 6), (255, 255, 255))
    for k, (i, s) in enumerate(ims): c.paste(nhan(i.copy(), s), ((k % cot) * (w + 6), (k // cot) * (h + 6)))
    c = c.quantize(255, dither=Image.Dither.NONE); c.save(os.path.join(OUT, o), optimize=True); print(o, c.size)


# HUD: cả dải trên + phóng ×3 thanh máu và tấm Linh khí
a, b = doc(A, 'hud'), doc(B, 'hud'); k = a.width / 480
z = lambda im, box: im.crop(tuple(int(v * k) for v in box)).resize((int((box[2] - box[0]) * k * 1.5), int((box[3] - box[1]) * k * 1.5)), Image.NEAREST)
luoi('truoc-sau-hud.png', [(a, 'TRUOC'), (b, 'SAU')], 1)
luoi('truoc-sau-hud-phong.png', [(z(a, (2, 2, 126, 14)), 'TRUOC thanh mau'), (z(b, (2, 2, 126, 14)), 'SAU thanh mau'),
                                 (z(a, (368, 40, 430, 56)), 'TRUOC Linh khi'), (z(b, (368, 40, 430, 56)), 'SAU Linh khi')], 2)
luoi('truoc-sau-quai-nho.png', [(doc(A, 'quai-nho'), 'TRUOC'), (doc(B, 'quai-nho'), 'SAU')], 2)
for t in ('bt-tron', 'bt-trum', 'bt-trum-lau'):
    luoi('truoc-sau-%s.png' % t, [(doc(A, t), 'TRUOC (mac dinh)'), (doc(B, t), 'SAU (mac dinh)'), (doc(AP, t), 'TRUOC ?baoanh=0'), (doc(BP, t), 'SAU ?baoanh=0')], 2)
