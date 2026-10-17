"""Ảnh cho báo cáo từ kết quả chup_quai.py: mỗi hình một tấm — hàng trên: ảnh chụp màn 844×390 dpr 3 ở nét 2 | 3 | 4 (cắt quanh hình, cùng
vùng); hàng dưới: phóng ×4 (lấy điểm gần nhất) một vùng tiêu biểu (phần trên thân: đầu / mặt) của chính ảnh chụp màn đó.
  python3 lam_anh.py <thư mục chup_quai> <thư mục ra> tên,tên,…"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
NEN = np.array([0x3a, 0x3e, 0x4a])


def bbox(im):
    a = np.asarray(im.convert('RGB')).astype(int)
    m = np.abs(a - NEN).sum(-1) > 12
    ys, xs = np.nonzero(m)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else (0, 0, im.width, im.height)


for ten in sys.argv[3].split(','):
    ims = [Image.open(os.path.join(SRC, 'm844-n%d' % N, ten + '.png')).convert('RGB') for N in (2, 3, 4)]
    b = [bbox(i) for i in ims]
    x0, y0 = min(v[0] for v in b) - 6, min(v[1] for v in b) - 6
    x1, y1 = max(v[2] for v in b) + 6, max(v[3] for v in b) + 6
    top = [i.crop((x0, y0, x1, y1)) for i in ims]
    w, h = x1 - x0, y1 - y0
    # vùng phóng: rộng ~ 1/3 hình (tối đa 110 điểm màn), ở phần trên, giữa theo chiều ngang
    zw = min(110, max(40, w // 3)); zh = int(zw * 0.75)
    zx = x0 + (w - zw) // 2; zy = y0 + max(0, int(h * 0.12))
    zoom = [i.crop((zx, zy, zx + zw, zy + zh)).resize((zw * 4, zh * 4), Image.NEAREST) for i in ims]
    W = max(3 * w + 20, 3 * zw * 4 + 20)
    can = Image.new('RGB', (W, 26 + h + 26 + zh * 4), (24, 24, 28))
    d = ImageDraw.Draw(can)
    for k, (t, z) in enumerate(zip(top, zoom)):
        can.paste(t, (k * (w + 10), 26))
        can.paste(z, (k * (zw * 4 + 10), 26 + h + 26))
        d.text((k * (w + 10) + 4, 6), 'NET %d' % (k + 2), fill=(255, 255, 255))
        d.text((k * (zw * 4 + 10) + 4, 26 + h + 6), 'NET %d  x4' % (k + 2), fill=(255, 255, 255))
        d.rectangle((k * (w + 10) + zx - x0, 26 + zy - y0, k * (w + 10) + zx - x0 + zw, 26 + zy - y0 + zh), outline=(255, 220, 0))
    can.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(OUT, ten + '.png'), optimize=True)  # 256 màu cho nhẹ repo
    print(ten, can.size)
