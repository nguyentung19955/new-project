# -*- coding: utf-8 -*-
"""Chip VƯƠNG MIỆN nhỏ cho ô chỉ huy tối giản: tách vương miện vàng từ the_khung_mv.png (ảnh ChatGPT có sẵn, Pass 9).
Giữ điểm ảnh vàng + viền tối 2 px quanh nó, cắt sát, ra thap/assets/o_mien.png (cao 48 px = 3× chip 16 px)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(GOC, 'thap/assets/the_khung_mv.png')).convert('RGBA')
c = np.asarray(im.crop((140, 0, 300, 95))).astype(np.float32)
r, g, b, a = c[..., 0], c[..., 1], c[..., 2], c[..., 3]
vang = (a > 100) & (r > 110) & (r - b > 60) & (g > 70)
lab, n = nd.label(vang); sz = nd.sum(vang, lab, range(1, n + 1))
vang = np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 400])
giu = nd.binary_dilation(vang, iterations=3) & nd.binary_fill_holes(nd.binary_dilation(vang, iterations=3))
al = np.where(giu, a, 0); al = nd.gaussian_filter(al, 0.6) * (nd.binary_dilation(giu, iterations=1))
out = Image.fromarray(np.dstack([c[..., :3], np.clip(al, 0, 255)]).astype(np.uint8), 'RGBA')
out = out.crop(out.getbbox())
h = 48; out = out.convert('RGBa').resize((round(out.width * h / out.height), h), Image.LANCZOS).convert('RGBA')
out.save(os.path.join(GOC, 'thap/assets/o_mien.png'), optimize=True); print(out.size)
