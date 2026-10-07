#!/usr/bin/env python3
"""Sinh quái / tướng địch mới từ ảnh vẽ tay sẵn có: đổi màu (xoay sắc độ, nhuộm, tối / sáng).
Hiệu ứng động (lửa, băng, khói ma…) do game vẽ thêm lúc chơi (ENEMIES[x].fx).
  python3 tools/make-variants.py
"""
import os, sys, numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'packs')
# mã mới: (ảnh gốc, cách đổi màu)
VARIANTS = {
    'tomlua':     ('tom',        {'hue': -25, 'sat': 1.5, 'val': 1.05}),
    'ranbang':    ('ran',        {'tint': (150, 215, 255), 'k': 0.6, 'val': 1.15}),
    'doima':      ('doi',        {'tint': (215, 200, 255), 'k': 0.65, 'val': 1.25}),
    'thachvang':  ('thachtinh',  {'tint': (255, 205, 80), 'k': 0.55, 'val': 1.1}),
    'thietky':    ('kybinh',     {'tint': (150, 165, 185), 'k': 0.5, 'val': 0.85}),
    'camapden':   ('camap',      {'tint': (110, 70, 160), 'k': 0.55, 'val': 0.75}),
    'mucdoc':     ('muc',        {'hue': 150, 'sat': 1.2}),
    'cungtlua':   ('cungan',     {'tint': (235, 80, 40), 'k': 0.6}),
    'tuongthuy':  ('haba',       {'hue': -60, 'sat': 1.2, 'val': 0.95, 'rage': {'hue': -60, 'sat': 1.2, 'val': 0.95, 'keep_warm': True}}),
    'chanlua':    ('chantinh',   {'hue': -95, 'sat': 1.3}),
    'hoden':      ('hotinh',     {'tint': (110, 70, 150), 'k': 0.6, 'val': 1.0, 'rage': {'hue': -95, 'sat': 0.95, 'val': 1.0}}),
}
# 'rage': cách đổi màu riêng cho rage.png (dáng nổi giận toàn lửa đỏ cam): nhuộm như dáng thường làm lửa
# đục / sai màu. 'keep_warm': giữ nguyên điểm đỏ-cam-vàng rực (lửa), chỉ đổi phần còn lại.

def rgb2hsv(c):
    c = c / 255.0; r, g, b = c[..., 0], c[..., 1], c[..., 2]
    mx, mn = c.max(-1), c.min(-1); d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = m & (mx == r); gg = m & (mx == g) & ~rr; bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6; h[gg] = (b - r)[gg] / d[gg] + 2; h[bb] = (r - g)[bb] / d[bb] + 4
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    return h * 60, s, mx

def hsv2rgb(h, s, v):
    h = (h % 360) / 60; i = np.floor(h).astype(int); f = h - i
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.zeros(h.shape + (3,))
    for k, (a, b, c) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i % 6 == k; out[m] = np.stack([a[m], b[m], c[m]], -1)
    return np.clip(out * 255, 0, 255)

def apply(im, o):
    a = np.asarray(im.convert('RGBA')).astype(float)
    rgb, al = a[..., :3], a[..., 3:]
    h0, s0, v0 = rgb2hsv(rgb)
    warm = ((h0 < 55) | (h0 > 345)) & (s0 > 0.45) & (v0 > 0.45)
    if 'hue' in o or 'sat' in o:
        h, s, v = rgb2hsv(rgb)
        rgb = hsv2rgb(h + o.get('hue', 0), np.clip(s * o.get('sat', 1), 0, 1), v)
    if 'tint' in o:
        lum = rgb.mean(-1, keepdims=True) / 255.0
        tint = np.array(o['tint'], float) * (0.35 + 0.9 * lum)
        rgb = rgb * (1 - o['k']) + tint * o['k']
    rgb = np.clip(rgb * o.get('val', 1), 0, 255)
    # giữ viền tối của nét vẽ
    dark = a[..., :3].max(-1, keepdims=True) < 60
    rgb = np.where(dark, a[..., :3], rgb)
    if o.get('keep_warm'): rgb = np.where(warm[..., None], a[..., :3], rgb)
    return Image.fromarray(np.concatenate([rgb, al], -1).astype(np.uint8), 'RGBA')

ONLY = set(sys.argv[1:])   # tùy chọn: chỉ sinh lại các mã này, vd. python3 tools/make-variants.py camapden thietky
for code, (src, o) in VARIANTS.items():
    if ONLY and code not in ONLY: continue
    os.makedirs(os.path.join(ROOT, code), exist_ok=True)
    for n in ['walk1', 'walk2', 'attack', 'rage']:
        f = os.path.join(ROOT, src, n + '.png')
        if not os.path.exists(f): continue
        out = apply(Image.open(f), o.get(n, o) if n == 'rage' else o)
        out.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(ROOT, code, n + '.png'), optimize=True)
    print(code, '←', src)
