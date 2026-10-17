"""Ghép ảnh so sánh NÉT 2 | 3 | 4 từ ảnh chụp chup.py: cùng vùng (toạ độ điểm game), phóng điểm gần nhất về cùng cỡ, xếp cạnh nhau.
  python3 ghep_so.py <mẫu tên có {n}> <x0,y0,x1,y1 điểm game> <phóng (điểm màn/điểm game)> <ra.png> [--man W]  (--man: ảnh chụp màn rộng W điểm CSS·dpr)"""
import sys
from PIL import Image, ImageDraw
mau, vung, k, ra = sys.argv[1], [float(v) for v in sys.argv[2].split(',')], float(sys.argv[3]), sys.argv[4]
x0, y0, x1, y1 = vung
o = []
for n in (2, 3, 4):
    im = Image.open(mau.format(n=n)).convert('RGB')
    s = im.width / 480.0  # điểm ảnh mỗi điểm game của ảnh này
    if '--man' in sys.argv:
        s = 1.0; x0_, y0_, x1_, y1_ = vung
        c = im.crop((int(x0_), int(y0_), int(x1_), int(y1_)))
    else:
        c = im.crop((int(round(x0 * s)), int(round(y0 * s)), int(round(x1 * s)), int(round(y1 * s))))
    W, H = int((x1 - x0) * k), int((y1 - y0) * k)
    o.append((n, c.resize((W, H), Image.NEAREST)))
W = sum(c.width for n, c in o) + 8 * 4; H = o[0][1].height + 22
can = Image.new('RGB', (W, H), (10, 10, 14)); dr = ImageDraw.Draw(can); x = 8
for n, c in o:
    dr.text((x, 4), 'net %d' % n, fill=(255, 210, 120)); can.paste(c, (x, 20)); x += c.width + 8
can.save(ra); print(ra, can.size)
