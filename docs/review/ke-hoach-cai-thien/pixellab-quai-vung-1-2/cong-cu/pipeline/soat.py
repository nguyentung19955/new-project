# Tấm soát một con: mọi hàng (bản mới nhất mỗi hàng hoặc chỉ định), phóng z, nền caro; in kiểm tự động.
import sys, os, glob, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
def kiem(im):
    a = np.array(im); al = a[..., 3]
    ban = int(((al > 0) & (al < 255)).sum())
    lab, n = ndimage.label(al > 0, structure=np.ones((3, 3)))
    sz = sorted(ndimage.sum(np.ones_like(al), lab, range(1, n + 1)), reverse=True) if n else []
    roi = [int(s) for s in sz[1:] if s > 6]
    lua = int(((a[..., 0] > 200) & (a[..., 1] > 120) & (a[..., 2] < 100) & (al > 0)).sum())
    return ban, roi, lua
def bang(mid, rows, z=2, out=None):
    ims = []
    for r, d in rows:
        fs = sorted(glob.glob(d + '/[0-9][0-9].png'))
        ims.append((r, d, [Image.open(f).convert('RGBA') for f in fs]))
    W = max(f.width for _, _, fs in ims for f in fs); Hh = max(f.height for _, _, fs in ims for f in fs)
    nc = max(len(fs) for _, _, fs in ims)
    s = Image.new('RGBA', (nc * (W + 2) + 2, len(ims) * (Hh + 12)), (0, 0, 0, 255)); dr = ImageDraw.Draw(s)
    rep = []
    for k, (r, d, fs) in enumerate(ims):
        y = k * (Hh + 12)
        dr.text((2, y), '%s %s' % (r, os.path.basename(d)), fill=(255, 255, 0, 255))
        for i, f in enumerate(fs):
            x = i * (W + 2) + 2
            bg = Image.new('RGBA', f.size, (88, 110, 96, 255))
            for yy in range(0, f.height, 8):
                for xx in range(0, f.width, 8):
                    if (xx // 8 + yy // 8) % 2: ImageDraw.Draw(bg).rectangle([xx, yy, xx + 7, yy + 7], fill=(100, 124, 108, 255))
            bg.alpha_composite(f); s.paste(bg, (x, y + 11))
            b, roi, lua = kiem(f)
            if b or roi: rep.append('%s f%d ban=%d roi=%s lua=%d' % (r, i, b, roi[:4], lua))
    s = s.resize((s.width * z, s.height * z), Image.NEAREST)
    s.save(out or 'soat/%s.png' % mid)
    return rep
if __name__ == '__main__':
    os.makedirs('soat', exist_ok=True)
    mid = sys.argv[1]; z = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    ds = sorted(glob.glob('anim/%s/*-s*' % mid))
    rows = [(os.path.basename(d).rsplit('-s', 1)[0], d) for d in ds if os.path.exists(d + '/ok')]
    if len(sys.argv) > 3: rows = [r for r in rows if r[0] in sys.argv[3].split(',')]
    rep = bang(mid, rows, z)
    print('\n'.join(rep) or 'sach')
