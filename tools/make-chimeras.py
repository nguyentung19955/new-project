#!/usr/bin/env python3
"""Ghép bộ phận của các quái vẽ tay thành quái mới (cánh dơi, càng cua, mai rùa…).
Mỗi bộ phận: cắt theo tỉ lệ khung ảnh gốc, co theo chiều cao quái nền, đặt tại điểm neo (tỉ lệ khung quái nền),
vẽ sau lưng (back) hoặc trước (front). Dáng bước 2 cánh vỗ (xoay nhẹ).
  python3 tools/make-chimeras.py
"""
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'packs')
L_WING = ('doi', (0.0, 0.08, 0.40, 0.78))
R_WING = ('doi', (0.60, 0.08, 1.0, 0.78))
CHIMERAS = {
    # mã: (quái nền, [(bộ phận, khung cắt, cao theo nền, neo x, neo y, sau lưng?, xoay khi vỗ)])
    'ranbay':    ('ran',   [(*L_WING, 0.9, 0.48, 0.26, True, 16), (*R_WING, 0.9, 0.90, 0.26, True, -16)]),
    'camapcanh': ('camap', [(*L_WING, 0.85, 0.36, 0.18, True, 16), (*R_WING, 0.85, 0.66, 0.16, True, -16)]),
    'tomcang':   ('tom',   [('cua', (0.70, 0.22, 1.0, 0.78), 0.42, 0.86, 0.50, False, 0)]),
    'echmai':    ('echme', [('rua', (0.0, 0.0, 0.70, 0.60), 0.5, 0.30, 0.38, False, 0)]),
}

def part(src, box, frame='walk1'):
    im = Image.open(os.path.join(ROOT, src, frame + '.png')).convert('RGBA')
    W, H = im.size
    p = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    return p.crop(p.getbbox())

def compose(base, parts, flap):
    W, H = base.size
    pad = int(H * 0.45)
    c = Image.new('RGBA', (W + pad * 2, H + pad * 2), (0, 0, 0, 0))
    layers = []
    for (src, box, hk, ax, ay, back, rot) in parts:
        p = part(src, box)
        k = hk * H / p.height
        p = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k))), Image.LANCZOS)
        if flap and rot: p = p.rotate(rot, resample=Image.BICUBIC, expand=True)
        pos = (int(pad + ax * W - p.width / 2), int(pad + ay * H - p.height / 2))
        layers.append((back, p, pos))
    for back, p, pos in layers:
        if back: c.alpha_composite(p, pos)
    c.alpha_composite(base, (pad, pad))
    for back, p, pos in layers:
        if not back: c.alpha_composite(p, pos)
    return c.crop(c.getbbox())

for code, (src, parts) in CHIMERAS.items():
    os.makedirs(os.path.join(ROOT, code), exist_ok=True)
    for n in ['walk1', 'walk2', 'attack']:
        f = os.path.join(ROOT, src, n + '.png')
        if not os.path.exists(f): f = os.path.join(ROOT, src, 'walk1.png')
        out = compose(Image.open(f).convert('RGBA'), parts, n == 'walk2')
        out.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(ROOT, code, n + '.png'), optimize=True)
    print(code)
