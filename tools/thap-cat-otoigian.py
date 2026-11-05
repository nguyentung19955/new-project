# -*- coding: utf-8 -*-
"""TURRET MERGE — Ô TƯỚNG TỐI GIẢN (kiểu DCDW): cắt 5 viền mảnh bo góc từ raw_p10_khung_toigian.png (5×1, nền magenta).
Ra thap/assets/o_vien_<bậc>.png (trang/xanh/tim/vang/do), VUÔNG, cỡ = 3× ô lớn nhất (84 CSS px → 252 px), ruột trong suốt.
Khoá magenta (tach_nen của thap-cat-hinh.py: cả túi magenta kín bên trong khung), thu Lanczos nhân-trước-alpha, viền alpha mềm 1 px.
In ra độ dày viền (% cạnh) để CSS đặt cửa sổ chân dung (css/otoigian.css: --ov-in).
Chạy: python3 tools/thap-cat-otoigian.py
"""
import os, importlib.util
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('ch', os.path.join(GOC, 'tools/thap-cat-hinh.py'))
src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read()
g = {'__name__': 'ch', '__file__': os.path.join(GOC, 'tools/thap-cat-hinh.py')}
exec(src[:src.index('def vuong')], g)
CO = 252
TEN = ['trang', 'xanh', 'tim', 'vang', 'do']
raw = Image.open(os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_p10_khung_toigian.png')).convert('RGB')
W, H = raw.size
for i, ten in enumerate(TEN):
    o = raw.crop((round(i * W / 5), 0, round((i + 1) * W / 5), H))
    rgba = g['tach_nen'](o, 'tim')
    a = np.asarray(rgba)
    al = a[..., 3]
    # khối lớn nhất (bỏ hạt nhiễu)
    lab, n = nd.label(al > 128)
    sz = nd.sum(al > 128, lab, range(1, n + 1)); k = int(np.argmax(sz)) + 1
    ys, xs = np.where(lab == k)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    s = max(x1 - x0, y1 - y0) + 4
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    c = rgba.crop((round(cx - s / 2), round(cy - s / 2), round(cx - s / 2) + s, round(cy - s / 2) + s))
    c = c.convert('RGBa').resize((CO, CO), Image.LANCZOS).convert('RGBA')
    b = np.asarray(c).astype(np.float32); al = b[..., 3]
    vien = ~nd.binary_erosion(al >= 250, iterations=1) & nd.binary_dilation(al > 0, iterations=1)
    al = np.where(vien, nd.gaussian_filter(al, 0.5), al); al[al < 3] = 0; b[..., 3] = al
    res = Image.fromarray(np.clip(b, 0, 255).round().astype(np.uint8), 'RGBA')
    res.save(os.path.join(GOC, 'thap/assets/o_vien_' + ten + '.png'), optimize=True)
    # độ dày viền: hàng giữa, từ mép trái tới chỗ alpha hết
    row = np.asarray(res)[CO // 2, :, 3]; col = np.asarray(res)[:, CO // 2, 3]
    tl = next(j for j in range(CO) if row[j] > 128); tr = next(j for j in range(CO // 2, 0, -1) if row[j] > 128)
    tt = next(j for j in range(CO) if col[j] > 128); td = next(j for j in range(CO // 2, 0, -1) if col[j] > 128)
    print('o_vien_%-6s %dx%d  mép %d  trong trái %.1f%% trên %.1f%%' % (ten, CO, CO, tl, tr / CO * 100, td / CO * 100))
