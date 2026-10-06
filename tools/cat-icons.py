#!/usr/bin/env python3
"""Cắt dải 4 icon kỹ năng (1 hàng × 4 ô, nền hồng tím) thành assets/packs/<mã>/sk-q.png … sk-r.png (128 px).

  python3 tools/cat-icons.py <ảnh.png> <mã tướng>
Rồi thêm mã vào SKILL_PACK trong js/render.js.
"""
import os, sys, importlib.util
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('cs', os.path.join(here, 'cat-sheet.py'))
cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)

def clean_mark(im):
    """Xoá mảnh nhỏ góc dưới phải (dấu ✦ của Gemini)."""
    from scipy import ndimage
    a = np.asarray(im).copy(); al = a[..., 3] > 20
    lab, n = ndimage.label(al)
    if n < 2: return im
    sizes = ndimage.sum(al, lab, range(1, n + 1)); h, w = al.shape
    for i, s in enumerate(sizes, 1):
        if s >= sizes.max() * 0.03: continue
        ys, xs = np.where(lab == i)
        if ys.min() > h * 0.7 and xs.min() > w * 0.7: a[lab == i, 3] = 0
    return Image.fromarray(a, 'RGBA')

def main():
    src, code = sys.argv[1], sys.argv[2]
    raw = Image.open(src).convert('RGB')
    sheet = cs.key_magenta(raw)
    W, H = sheet.size
    xs = cs.cut_lines(sheet, 4, W, axis=0)
    out = os.path.join(here, '..', 'assets', 'packs', code); os.makedirs(out, exist_ok=True)
    for i, k in enumerate('qwer'):
        ins = 8
        c = cs.drop_specks(cs.drop_lines(sheet.crop((xs[i] + ins, ins, xs[i + 1] - ins, H - ins))))
        c = clean_mark(c)
        bb = c.getbbox()
        if not bb: sys.exit(f'Ô {k} trống')
        c = c.crop(bb); side = int(max(c.size) * 1.08)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(c, ((side - c.width) // 2, (side - c.height) // 2))
        cs.save_light(sq.resize((128, 128), Image.LANCZOS), os.path.join(out, f'sk-{k}.png'))
    print(f"Thêm '{code}' vào SKILL_PACK trong js/render.js.")

if __name__ == '__main__':
    main()
