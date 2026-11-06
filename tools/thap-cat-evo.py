# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh ChatGPT của EVOLVER bom hẹn giờ (docs/demo-hop-tuong/tuvan/evolver/CAN-VE.json)
raw_evo_bom.png → thap/assets/evo_bom.png · raw_evo_xacbom.png → evo_xacbom.png · raw_fx_evo_xit.png (4×4) → fx_evo_xit.png (dải ngang 16 khung)
Tách nền magenta bằng GỠ TRỘN (khói mờ trên nền hồng → alpha + màu thật, không viền hồng), thu Lanczos nhân-trước-alpha.
Chạy: python3 tools/thap-cat-evo.py
"""
import os
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')


def go_tron(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    k = np.minimum(r - g, b - g) / 255.0          # phần nền magenta (G=0, R=B=255)
    al = np.clip(1.0 - k, 0, 1)
    al = np.clip((al - 0.04) / 0.96, 0, 1)        # nền gần thuần → trong suốt hẳn
    M = np.array([255, 0, 255], np.float32)
    c = (a - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3)
    c = np.clip(c, 0, 255)
    out = np.dstack([c, al * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def thu(im, w, h):  # Lanczos nhân-trước-alpha
    a = np.asarray(im).astype(np.float32) / 255
    p = np.dstack([a[..., :3] * a[..., 3:], a[..., 3:]])
    ch = [Image.fromarray((p[..., i] * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(x).astype(np.float32) / 255 for x in ch])
    al = q[..., 3:]
    rgb = np.where(al > 1e-3, q[..., :3] / np.maximum(al, 1e-3), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255).astype(np.uint8), 'RGBA')


def vuong(im, le=0.04):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb); n = int(max(im.size) * (1 + le * 2))
    c = Image.new('RGBA', (n, n), (0, 0, 0, 0)); c.paste(im, ((n - im.width) // 2, (n - im.height) // 2)); return c


def badge(ten, ra, px):
    p = os.path.join(NGUON, ten)
    if not os.path.exists(p): print('  (chưa có)', ten); return
    im = vuong(go_tron(Image.open(p)))
    thu(im, px, px).save(os.path.join(DICH, ra), optimize=True); print('  ', ra, px)


def dai(ten, ra, px, n=4):
    p = os.path.join(NGUON, ten)
    if not os.path.exists(p): print('  (chưa có)', ten); return
    im = go_tron(Image.open(p)); W, H = im.size; cw, ch = W / n, H / n
    out = Image.new('RGBA', (px * n * n, px), (0, 0, 0, 0))
    for i in range(n * n):
        x, y = i % n, i // n
        o = im.crop((round(x * cw), round(y * ch), round((x + 1) * cw), round((y + 1) * ch)))
        out.paste(thu(o, px, px), (i * px, 0))
    out.save(os.path.join(DICH, ra), optimize=True); print('  ', ra, px, '×', n * n)


badge('raw_evo_bom.png', 'evo_bom.png', 192)
badge('raw_evo_xacbom.png', 'evo_xacbom.png', 216)
dai('raw_fx_evo_xit.png', 'fx_evo_xit.png', 256)
