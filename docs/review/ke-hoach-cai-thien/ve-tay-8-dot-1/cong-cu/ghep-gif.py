"""Ghép GIF TRƯỚC | SAU từ hai lần chạy quay.py (cùng kịch bản): <ra>/<tên>-truoc-sau-x1.gif (cỡ thật) và -x3.gif (×3).
    python3 ghep-gif.py <thư mục trước> <thư mục sau> <thư mục ra> tên,tên,..."""
import os, sys
from PIL import Image, ImageDraw, ImageSequence
A, B, OUT, DS = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
os.makedirs(OUT, exist_ok=True)
for ten in DS:
    for duoi, k in (('', 'x1'), ('-x3', 'x3')):
        fa = [f.convert('RGB') for f in ImageSequence.Iterator(Image.open(os.path.join(A, ten + duoi + '.gif')))]
        fb = [f.convert('RGB') for f in ImageSequence.Iterator(Image.open(os.path.join(B, ten + duoi + '.gif')))]
        n = min(len(fa), len(fb)); w, h = fa[0].size; ra = []
        for i in range(n):
            o = Image.new('RGB', (w * 2 + 4, h), (20, 20, 24)); o.paste(fa[i], (0, 0)); o.paste(fb[i], (w + 4, 0))
            d = ImageDraw.Draw(o); d.text((4, 2), 'TRUOC (?chaymoi=0)', fill=(255, 235, 150)); d.text((w + 8, 2), 'SAU', fill=(255, 235, 150))
            ra.append(o.quantize(160, dither=Image.Dither.NONE))
        p = os.path.join(OUT, '%s-truoc-sau-%s.gif' % (ten, k))
        ra[0].save(p, save_all=True, append_images=ra[1:], duration=33, loop=0)
        print(p, n, os.path.getsize(p) // 1024, 'KB')
