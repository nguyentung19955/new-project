#!/usr/bin/env python3
"""Sinh bộ ICON APP (ảnh đại diện) từ ảnh ChatGPT docs/demo-hop-tuong/thap-art/raw_app_icon.png → thap/assets/icon/.

  python3 tools/thap-icon.py

 · ≥ 120 px: trọn ảnh (khung bát giác + ụ súng), Lanczos + làm nét nhẹ, RGB (không trong suốt — iOS tô đen nền trong suốt).
 · favicon 48/32/16 + favicon.ico: cắt sát hơn (82 % giữa) → ụ súng còn đọc được ở 16–32 px.
 · maskable 512: cả ảnh thu về 80 % (vùng an toàn) giữa, phần ngoài = mép ảnh phản chiếu + nhoè (nền thép tối liền mạch).
"""
import os
import numpy as np
from PIL import Image, ImageFilter

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_app_icon.png')
OUT = os.path.join(GOC, 'thap/assets/icon')
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
W = im.size[0]


def thu(src, n):
    r = src.resize((n, n), Image.LANCZOS)
    k = 0.6 if n >= 256 else 0.8
    return r.filter(ImageFilter.UnsharpMask(radius=k, percent=45 if n >= 120 else 60, threshold=2))


def sat(f):
    m = int(round(W * (1 - f) / 2))
    return im.crop((m, m, W - m, W - m))


for n in (1024, 512, 192, 180, 167, 152, 120):
    thu(im, n).save(os.path.join(OUT, 'icon-%d.png' % n), optimize=True)
nho = sat(0.82)
for n in (48, 32, 16):
    thu(nho, n).save(os.path.join(OUT, 'favicon-%d.png' % n), optimize=True)
nho.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# maskable 512: ảnh 410 px (80 %) giữa, nền = phản chiếu mép + nhoè
N, T = 512, 410
pad = (N - T) // 2
a = np.asarray(im.resize((T, T), Image.LANCZOS))
p = np.pad(a, ((pad, N - T - pad), (pad, N - T - pad), (0, 0)), mode='reflect')
nen = Image.fromarray(p).filter(ImageFilter.GaussianBlur(28))
nen = Image.fromarray((np.asarray(nen).astype(np.float32) * 0.5).astype(np.uint8))
m = Image.new('L', (N, N), 0)
m.paste(255, (pad, pad, pad + T, pad + T))
m = m.filter(ImageFilter.GaussianBlur(3))
nen.paste(Image.fromarray(p), (0, 0), m)
thu(nen, N).save(os.path.join(OUT, 'icon-maskable-512.png'), optimize=True)
print('icon:', sorted(os.listdir(OUT)))
