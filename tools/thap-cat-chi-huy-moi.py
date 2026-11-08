#!/usr/bin/env python3
"""TURRET MERGE — cắt ảnh CHỈ HUY MỚI (08/11) từ tấm ChatGPT (docs/demo-hop-tuong/tuvan/chi-huy-moi/raw/):
  · chân dung cd_af_<id>.png (vuông, nền XANH LÁ #00FF00 đặc) → khoá màu (alpha mềm + khử ám xanh ở viền) →
      thap/assets/af_<id>.png               725×725   (ô chỉ huy / cut-in / bảng thông tin — như af_hero)
      thap/assets/hero/hero_af_<id>.webp    1170×1020 (trang chỉ huy 390×340 css ×3, phần trên của tấm)
      thap/assets/hero/home_af_<id>.webp    1260×1260 (màn chính 420 css ×3)
  · tấm icon raw_cmd_icons.png (3 cột × 2 hàng, nền MAGENTA #FF00FF) → khoá magenta, cắt sát + lề, vuông →
      thap/assets/cmd_ic_<id>.png 192×192 (tech, tide, twin, hawk, weaver) · thap/assets/cmd_fx_luoi.png 256×256 (lưới DRAG NET)
Chạy: python3 tools/thap-cat-chi-huy-moi.py [id ...]
"""
import os, sys
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RAW = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'tuvan', 'chi-huy-moi', 'raw')
AS = os.path.join(GOC, 'thap', 'assets')
IDS = ['tech', 'tide', 'twin', 'hawk', 'weaver']

def khoa(im, nen, lo=70, rong=120):
    """khoá nền màu `nen` → alpha mềm; khử ám màu nền ở viền (QUY-TAC-HINH §5)."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    n = np.array(nen, np.float32)
    d = np.sqrt(((a - n) ** 2).sum(2))
    al = np.clip((d - lo) / rong, 0, 1)
    k = (1 - al)[..., None]
    c = np.clip((a - k * n) / np.maximum(al[..., None], 1e-3), 0, 255)
    if nen[1] == 255 and nen[0] == 0:  # xanh lá: G không vượt max(R, B) ở vùng bán trong suốt + toàn ảnh hơi
        m = np.maximum(c[..., 0], c[..., 2]); sp = c[..., 1] > m + 30
        c[..., 1] = np.where(sp & (al < 1), np.minimum(c[..., 1], m + 30), c[..., 1])
    else:  # magenta: R, B không vượt G nhiều ở viền
        g = c[..., 1]
        for j in (0, 2): c[..., j] = np.minimum(c[..., j], np.maximum(g, c[..., j] - 40 * (1 - al)))
    out = np.dstack([c, al * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

def thu(im, kich):  # Lanczos nhân-trước-alpha
    a = np.asarray(im).astype(np.float32) / 255.
    p = a.copy(); p[..., :3] *= p[..., 3:4]
    r = Image.fromarray((p * 255 + .5).astype(np.uint8), 'RGBA').resize(kich, Image.LANCZOS)
    b = np.asarray(r).astype(np.float32) / 255.
    al = b[..., 3:4]; b[..., :3] = np.where(al > 1e-4, b[..., :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.clip(b, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA')

def chan_dung(id):
    p = os.path.join(RAW, 'cd_af_' + id + '.png')
    if not os.path.exists(p): print('thiếu', p); return
    im = khoa(Image.open(p), (0, 255, 0))
    W, H = im.size
    thu(im, (725, 725)).save(os.path.join(AS, 'af_' + id + '.png'), optimize=True)
    h = round(W * 1020 / 1170)
    thu(im.crop((0, 0, W, min(H, h))), (1170, 1020)).save(os.path.join(AS, 'hero', 'hero_af_' + id + '.webp'), quality=90, method=6)
    thu(im, (1260, 1260)).save(os.path.join(AS, 'hero', 'home_af_' + id + '.webp'), quality=90, method=6)
    print('chân dung', id, im.size)

def icons():
    p = os.path.join(RAW, 'raw_cmd_icons.png')
    if not os.path.exists(p): print('thiếu', p); return
    im = khoa(Image.open(p), (255, 0, 255), 60, 110)
    W, H = im.size; al = np.asarray(im)[..., 3]
    ten = ['cmd_ic_tech', 'cmd_ic_tide', 'cmd_ic_twin', 'cmd_ic_hawk', 'cmd_ic_weaver', 'cmd_fx_luoi']
    for i, t in enumerate(ten):
        cx, cy = i % 3, i // 3
        x0, x1, y0, y1 = cx * W // 3, (cx + 1) * W // 3, cy * H // 2, (cy + 1) * H // 2
        o = al[y0:y1, x0:x1] > 24
        ys, xs = np.nonzero(o)
        if not len(xs): print('trống', t); continue
        bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0 + 1, ys.min() + y0, ys.max() + y0 + 1
        s = max(bx1 - bx0, by1 - by0); m = round(s * 0.06); s += 2 * m
        mx, my = (bx0 + bx1) // 2, (by0 + by1) // 2
        o2 = Image.new('RGBA', (s, s), (0, 0, 0, 0))
        o2.paste(im.crop((mx - s // 2, my - s // 2, mx - s // 2 + s, my - s // 2 + s)), (0, 0))
        k = 256 if t == 'cmd_fx_luoi' else 192
        thu(o2, (k, k)).save(os.path.join(AS, t + '.png'), optimize=True)
        print('icon', t, (bx1 - bx0, by1 - by0))

if __name__ == '__main__':
    ds = sys.argv[1:] or IDS + ['icons']
    for id in ds:
        if id == 'icons': icons()
        else: chan_dung(id)
