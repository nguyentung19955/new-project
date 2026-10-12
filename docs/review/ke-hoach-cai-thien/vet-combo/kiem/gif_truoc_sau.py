"""Ghép GIF trước (?vettron=0) | sau cạnh nhau. Chạy: python3 gif_truoc_sau.py <thư mục gif trước> <thư mục gif sau> <thư mục ra>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
A, B, OUT = sys.argv[1:4]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 10)
def doc(p):
    im = Image.open(p); fr = []
    try:
        while True: fr.append(im.convert('RGB').copy()); im.seek(im.tell() + 1)
    except EOFError: pass
    return fr
for ten in sorted(os.listdir(B)):
    if not ten.endswith('.gif') or not os.path.exists(os.path.join(A, ten)): continue
    if '-bow-chay' in ten or '-spear-chay' in ten or '-hammer-chay' in ten: continue
    a, b = doc(os.path.join(A, ten)), doc(os.path.join(B, ten)); n = min(len(a), len(b), 46)
    a = [x.resize((x.width * 2 // 3, x.height * 2 // 3), Image.NEAREST) for x in a[:n]]; b = [x.resize((x.width * 2 // 3, x.height * 2 // 3), Image.NEAREST) for x in b[:n]]
    w, h = a[0].size; ra = []
    for i in range(n):
        S = Image.new('RGB', (w * 2 + 2, h + 13), (20, 24, 30)); S.paste(a[i], (0, 13)); S.paste(b[i], (w + 2, 13))
        d = ImageDraw.Draw(S); d.text((3, 1), 'TRƯỚC', fill=(255, 150, 150), font=F); d.text((w + 5, 1), 'SAU', fill=(150, 255, 160), font=F)
        ra.append(S)
    # một bảng màu chung cho mọi khung (nền cỏ đứng yên giống hệt nhau giữa các khung -> GIF chỉ lưu phần đổi)
    ch = ra[::2]; gop = Image.new('RGB', (ra[0].width, ra[0].height * len(ch))); [gop.paste(x, (0, ra[0].height * i)) for i, x in enumerate(ch)]
    pal = gop.quantize(colors=72, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    ra = [x.quantize(palette=pal, dither=Image.Dither.NONE) for x in ra]
    ra[0].save(os.path.join(OUT, ten.replace('.gif', '-truoc-sau.gif')), save_all=True, append_images=ra[1:], duration=66, loop=0, optimize=True)
    print(ten, n, os.path.getsize(os.path.join(OUT, ten.replace('.gif', '-truoc-sau.gif'))) // 1024, 'KB')
