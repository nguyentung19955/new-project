#!/usr/bin/env python3
"""Đánh dấu các mảng da nhỏ (nắm tay) trên từng khung để chọn điểm cầm. Ra: tay-<ten>.png"""
import sys, glob
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, '.')
from importlib import import_module
da = import_module('ghep-thu-vk').da
for ten in sys.argv[1:]:
    fs = sorted(glob.glob(f'../moi/{ten}-gif/{ten}/khung-*.png'))
    ims = [Image.open(f).convert('RGBA') for f in fs]
    H = max(i.height for i in ims)
    out = Image.new('RGB', (sum(i.width + 10 for i in ims), H + 10), 'white'); d = ImageDraw.Draw(out); x0 = 0
    print(ten)
    for k, im in enumerate(ims):
        a = np.array(im); m = da(a)
        lab, n = ndimage.label(ndimage.binary_closing(m, iterations=2))
        c = Image.new('RGBA', im.size, (225, 225, 225, 255)); c.alpha_composite(im); out.paste(c.convert('RGB'), (x0, 0))
        ds = []
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            s = (lab[sl] == i).sum()
            if s < 150: continue
            cy, cx = ndimage.center_of_mass(lab == i)
            ds.append((int(cx), int(cy), int(s)))
        for j, (cx, cy, s) in enumerate(ds):
            d.ellipse([x0 + cx - 6, cy - 6, x0 + cx + 6, cy + 6], outline=(0, 0, 255), width=3)
            d.text((x0 + cx + 8, cy - 8), str(j), fill=(0, 0, 255))
        print(' khung', k + 1, ds)
        x0 += im.width + 10
    out.thumbnail((2000, 2000)); out.save(f'tay-{ten}.png')
