#!/usr/bin/env python3
"""TURRET MERGE: do kich thuoc dau sung (<id>_nong.png) -> thap/js/artscale.js (K = duong kinh ve dau / canh o),
va dung lai icon the thap/assets/nho/<id>.png = be chung de_chung.png + dau sung (giu nguyen anh dau).
Muc tieu (tu van muc B.3): be 70% canh ngan o (~60% canh dai), than dau ~61%, mui nong toi da ~92%, khoi luong nhin dong deu khi xoay."""
import glob, json, math, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'thap')
A = os.path.join(ROOT, 'assets')
BE = 0.70
out = {}
de = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA')
for f in sorted(glob.glob(os.path.join(A, '*_nong.png'))):
    id = os.path.basename(f)[:-9]
    if '_' in id: continue
    im = Image.open(f).convert('RGBA'); a = np.array(im)[:, :, 3] > 110
    h, w = a.shape; ys, xs = np.nonzero(a)
    if not len(xs): continue
    wb = (ys.max() - ys.min() + 1) / h                      # than (vuong goc voi nong)
    eq = 2 * math.sqrt(a.sum() / math.pi) / w                # duong kinh dien tich tuong duong
    r = np.sqrt((xs + .5 - w / 2) ** 2 + (ys + .5 - h / 2) ** 2).max() / (w / 2)
    K = min(0.61 / wb, 0.68 / eq, 0.92 / r)
    out[id] = round(float(K), 3)
    # icon the 192px (du net cho the 60px tren man 3x): be chung + dau sung huong len tren-phai
    N = 192; ic = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    sc = 0.84 / max(BE, K * r)                               # phong to cho vua icon
    b = int(round(N * BE * sc)); ic.alpha_composite(de.resize((b, b), Image.LANCZOS), ((N - b) // 2, (N - b) // 2))
    d = int(round(N * K * sc)); hd = im.resize((d, d), Image.LANCZOS).rotate(45 if id != 'mana' else 0, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2))
    os.makedirs(os.path.join(A, 'nho'), exist_ok=True); ic.save(os.path.join(A, 'nho', id + '.png'), optimize=True)
with open(os.path.join(ROOT, 'js', 'artscale.js'), 'w') as fo:
    fo.write('// Tu sinh boi tools/thap-co-dau.py - K: duong kinh ve dau sung / canh o (be chung = ' + str(BE) + ' o)\n')
    fo.write('window.HEAD_K = ' + json.dumps(out) + ';\n')
print(len(out), 'heads')
