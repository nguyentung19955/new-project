"""Ảnh xem nhanh các tư thế (dùng khi đặt mốc): python3 -B xem.py ten1 ten2 ... → /tmp xem"""
import sys
from PIL import Image, ImageDraw
from chung_hd import *
import tu_the_hd as T

def ve(ten, pose, box=None, sc=0.25):
    W0 = (GX - 1400, GY - 1500, GX + 1700, GY + 700)
    im = render(RIG, pose, W0, sc)
    bg = Image.new('RGBA', im.size, (236, 238, 242, 255)); bg.alpha_composite(im)
    d = ImageDraw.Draw(bg)
    def w2i(lx, ly): return ((GX + lx / LOGIC - W0[0]) * sc, (GY + ly / LOGIC - W0[1]) * sc)
    gy = (GY - W0[1]) * sc; d.line([0, gy, bg.width, gy], fill=(200, 60, 60))
    gx = (GX - W0[0]) * sc; d.line([gx, gy - 10, gx, gy + 10], fill=(60, 60, 220), width=2)
    if box:
        x0, y0 = w2i(box[0], box[1]); x1, y1 = w2i(box[0] + box[2], box[1] + box[3]); d.rectangle([x0, y0, x1, y1], outline=(230, 30, 30), width=2)
    if ten.startswith(('bam', 'truot')):
        wx = w2i(T.TUONG_X, 0)[0]; d.rectangle([wx, 0, wx + 40, gy], fill=(120, 90, 60))
    (mx, my), (cx, cy) = dao(pose)
    a = w2i(mx, my); d.ellipse([a[0]-5, a[1]-5, a[0]+5, a[1]+5], outline=(255, 0, 200), width=2)
    d.text((6, 6), '%s  mui dao (%.0f,%.0f)' % (ten, mx, my), fill=(0, 0, 0), font=font(16, True))
    return bg.convert('RGB')

if __name__ == '__main__':
    names = sys.argv[2:]; out = sys.argv[1]
    ims = [ve(n, T.POSE[n], T.HOP.get(n)) for n in names]
    cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
    w, h = ims[0].size
    c = Image.new('RGB', (w * cols, h * rows), 'white')
    for i, im in enumerate(ims): c.paste(im, ((i % cols) * w, (i // cols) * h))
    c.save(out)
