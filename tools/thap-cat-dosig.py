#!/usr/bin/env python3
"""Cắt 4 tờ ảnh chữ ký ĐỎ (ChatGPT, lưới 4×1, nền magenta #FF00FF) → thap/assets/dosig_<ten>.png
(dải ngang 4 khung VUÔNG bằng nhau → REN.khung / khungMuot vẽ được). Mỗi tờ: chia 4 cột đều, hộp bao chung (cỡ lớn nhất của 4 khung,
đặt giữa theo tâm từng khung → khung nhỏ → lớn giữ đúng tỉ lệ), khoá magenta alpha mềm + gỡ trộn màu nền (ảnh vẽ 'lighter').
+ ảnh kiểm docs/demo-hop-tuong/tuvan/anim-bac/dosig-cat.png (nền tối).
Dùng: python3 tools/thap-cat-dosig.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
OUT = os.path.join(ROOT, 'thap/assets')
# tờ → (tên asset, cạnh khung px — ~3× cỡ hiển thị lớn nhất)
TO = {'raw_dosig_hex': ('dosig_hex', 160), 'raw_dosig_lotus_petal': ('dosig_sen', 96),
      'raw_dosig_crack': ('dosig_nut', 200), 'raw_dosig_rune': ('dosig_tran', 224)}
K = 1.5  # độ gắt khoá nền


def khoa(a):
    """RGB float 0..255 → RGBA: alpha theo độ lệch khỏi magenta (G>0, R<255, B<255), gỡ trộn nền."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip(np.maximum(g, np.maximum(255 - r, 255 - b)) / 255 * K, 0, 1)
    al[al < 0.04] = 0
    m = np.array([255, 0, 255], dtype=np.float32)
    with np.errstate(divide='ignore', invalid='ignore'):
        c = (a - (1 - al[..., None]) * m) / np.maximum(al[..., None], 1e-3)
    c = np.clip(np.nan_to_num(c), 0, 255)
    return np.dstack([c, al * 255]).astype(np.uint8)


def cat(ten, ra, S):
    im = np.asarray(Image.open(os.path.join(ART, ten + '.png')).convert('RGB')).astype(np.float32)
    H, W = im.shape[:2]; cw = W // 4
    rgba = khoa(im)
    rgba[:6, :, 3] = 0; rgba[-6:, :, 3] = 0; rgba[:, :6, 3] = 0; rgba[:, -6:, 3] = 0  # bỏ viền mép tờ
    hop = []
    for i in range(4):
        al = rgba[:, i * cw:(i + 1) * cw, 3]
        ys, xs = np.nonzero(al > 20)
        hop.append((xs.min() + i * cw, ys.min(), xs.max() + i * cw, ys.max()) if len(xs) else (i * cw, 0, (i + 1) * cw - 1, H - 1))
    c = int(max(max(x1 - x0, y1 - y0) for x0, y0, x1, y1 in hop) * 1.06) + 2
    dai = Image.new('RGBA', (S * 4, S), (0, 0, 0, 0))
    for i, (x0, y0, x1, y1) in enumerate(hop):
        cot = rgba.copy(); cot[:, :i * cw, 3] = 0; cot[:, (i + 1) * cw:, 3] = 0  # chỉ lấy cột của khung này (không lẹm khung bên)
        src = Image.fromarray(cot, 'RGBA')
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        o = Image.new('RGBA', (c, c), (0, 0, 0, 0))
        o.paste(src.crop((cx - c // 2, cy - c // 2, cx - c // 2 + c, cy - c // 2 + c)), (0, 0))
        # thu nhỏ nhân-trước-alpha (không viền tối)
        a = np.asarray(o).astype(np.float32); a[..., :3] *= a[..., 3:] / 255
        p = Image.fromarray(a.astype(np.uint8), 'RGBA').resize((S, S), Image.LANCZOS)
        a = np.asarray(p).astype(np.float32); al = a[..., 3:] / 255
        a[..., :3] = np.clip(a[..., :3] / np.maximum(al, 1e-3), 0, 255)
        dai.paste(Image.fromarray(a.astype(np.uint8), 'RGBA'), (i * S, 0))
    dai.save(os.path.join(OUT, ra + '.png'), optimize=True)
    return dai


ds = [cat(t, *v) for t, v in TO.items()]
W = max(d.width for d in ds); kt = Image.new('RGBA', (W, sum(d.height + 6 for d in ds)), (20, 22, 40, 255)); y = 0
for d in ds: kt.alpha_composite(d, (0, y)); y += d.height + 6
kt.convert('RGB').save(os.path.join(ROOT, 'docs/demo-hop-tuong/tuvan/anim-bac/dosig-cat.png'))
print('xong:', ', '.join(v[0] for v in TO.values()))
