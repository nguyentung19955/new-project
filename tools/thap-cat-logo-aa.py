#!/usr/bin/env python3
"""Logo ASTRAL ARSENAL: tách nền magenta #FF00FF của ảnh ChatGPT → thap/assets/logo_aa.png (RGBA, cắt sát + lề nhỏ).

  python3 tools/thap-cat-logo-aa.py [ảnh thô]   (mặc định docs/demo-hop-tuong/thap-art/raw_logo_aa_1.png)

 · Độ "magenta" s = min(R,B) − G: nền ≈ 255, vàng/chàm/lam của logo ≤ ~40 → alpha mượt giữa 2 ngưỡng.
 · Chỉ coi là nền những điểm nối liền mép ảnh (loang từ mép) → tím trong logo không bị đục lỗ.
 · Khử viền hồng: tách màu nền khỏi điểm bán trong suốt (C = (C − (1−a)·M) / a).
 · Hiển thị ~290 css px (màn tải) / 280 (HOME) → lưu rộng 960 px (≈ @3x).
"""
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_logo_aa_1.png')
OUT = os.path.join(GOC, 'thap/assets/logo_aa.png')

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
s = np.minimum(R, B) - G
LO, HI = 60.0, 200.0
alpha = 1 - np.clip((s - LO) / (HI - LO), 0, 1)
# nền = vùng s cao nối với mép ảnh
nen = s > LO
lab, _ = ndimage.label(nen)
mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
noi = np.isin(lab, list(mep))
noi = ndimage.binary_dilation(noi, iterations=2) & nen
alpha = np.where(noi, alpha, 1.0)
# khử viền magenta
M = np.array([255, 0, 255], np.float32)
am = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip((a - (1 - alpha[..., None]) * M) / am, 0, 255)
rgb = np.where(alpha[..., None] > 0.02, rgb, 0)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, 'RGBA')
x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
p = 8
im = im.crop((max(0, x0 - p), max(0, y0 - p), min(im.width, x1 + p), min(im.height, y1 + p)))
W = 960
im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
im.save(OUT, optimize=True)
print('logo_aa.png', im.size, 'tỉ lệ %.4f' % (im.width / im.height))
