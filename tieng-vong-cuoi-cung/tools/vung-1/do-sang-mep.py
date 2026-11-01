# -*- coding: utf-8 -*-
"""Đo độ sáng mép mặt sàn đi được so với mặt đứng (luồng F). Chạy: python3 tools/vung-1/do-sang-mep.py [thư mục ảnh cũ để so]
   dải mặt sàn = 4 điểm trên .. 3 điểm dưới dòng va chạm; mặt đứng = vách ô đặc cạnh ô trống theo phương ngang (cách mặt sàn > 10 điểm).
   'mép vực' = 12 điểm cuối mỗi đoạn sàn (chỗ hụt chân)."""
import json, sys, glob, os, numpy as np
from PIL import Image
from scipy import ndimage
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..'))
def L(a): return 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
def do(pid, thu):
    p = json.load(open(f'{GOC}/game/vung-1/phong/{pid}.json')); g = p['luoi']; W = max(map(len, g)); g = [r.ljust(W, '.') for r in g]
    im = np.array(Image.open(f'{thu}/{pid}-canh.png').convert('RGBA')).astype(float); Lm = L(im); ok = im[..., 3] > 0
    s = np.zeros((len(g) * 16, W * 16), bool)
    for r, row in enumerate(g):
        for c, ch in enumerate(row):
            if ch in '#N': s[r*16:(r+1)*16, c*16:(c+1)*16] = True
    tren = s & ~np.roll(s, 1, 0); tren[0] = False
    band = np.zeros_like(s)
    for k in range(-4, 4): band |= np.roll(tren, k, 0)
    canh = s & (~np.roll(s, 1, 1) | ~np.roll(s, -1, 1))
    dung = ndimage.binary_dilation(canh, structure=np.ones((1, 21))) & s & ~ndimage.binary_dilation(tren, iterations=10)
    # mép vực: cột sàn trong 12 điểm cuối đoạn
    vuc = np.zeros_like(s); ys, xs = np.nonzero(tren)
    for y, x in zip(ys, xs):
        if not tren[y, max(0, x - 12):x + 13].all(): vuc[y, x] = True
    bvuc = np.zeros_like(s)
    for k in range(-4, 4): bvuc |= np.roll(vuc, k, 0)
    return Lm[band & ok].mean(), Lm[bvuc & ok].mean(), Lm[dung & ok].mean(), Lm[ok & ~band & ~bvuc].mean()
cu = sys.argv[1] if len(sys.argv) > 1 else None
print('phòng | mặt sàn | mép vực | mặt đứng | sàn/đứng | phần còn lại (đá+nền)' + (' | so ảnh cũ: sàn, mép vực, phần còn lại' if cu else ''))
for f in sorted(glob.glob(f'{GOC}/game/vung-1/phong/P*.json')):
    pid = os.path.basename(f)[:-5]; b, v, d, con = do(pid, f'{GOC}/art/vung-1')
    t = f'{pid} | {b:.1f} | {v:.1f} | {d:.1f} | {(b/d-1)*100:+.0f}% | {con:.1f}'
    if cu: b0, v0, d0, c0 = do(pid, cu); t += f' | {(b/b0-1)*100:+.0f}%, {(v/v0-1)*100:+.0f}%, {(con/c0-1)*100:+.1f}%'
    print(t)
