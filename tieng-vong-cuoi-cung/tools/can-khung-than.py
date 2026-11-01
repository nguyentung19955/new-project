"""Căn khung theo THÂN: dời ngang (nguyên điểm ảnh, không vẽ lại) từng khung của các clip để tâm thân
(phần giáp tối, bỏ tóc/mặt nạ kem và kiếm cyan) trùng tâm thân của tư thế đứng (dung) → hết giật tới-lui
khi chạy và khi chuyển đứng↔chạy↔lướt↔tiếp đất. Chỉ dời ngang, không đổi chân (y).
Chạy: python3 tools/can-khung-than.py [clip ...]   (mặc định: chay luot tiepdat)"""
import sys, glob, os
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'kiem-khach')
def tam_than(a):
    a = a.astype(int); op = a[..., 3] > 0; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    cyan = (b > r + 40) & (g > r + 20); kem = op & (r > 170) & (g > 150) & (b > 120) & (r - b < 70)
    ys, xs = np.nonzero(op & ~cyan & ~kem); return xs.mean()
dung = np.mean([tam_than(np.array(Image.open(f))) for f in sorted(glob.glob(GOC + '/dung/f*.png'))])
DICH = {'chay': -1.5}   # chạy hơi đổ người về trước: thân lùi 1,5 điểm so với đứng là tự nhiên, không còn giật
for clip in (sys.argv[1:] or ['chay', 'luot', 'tiepdat']):
    for f in sorted(glob.glob(f'{GOC}/{clip}/f*.png')):
        a = np.array(Image.open(f)); dx = int(round(dung + DICH.get(clip, 0) - tam_than(a)))
        if dx == 0: continue
        b = np.zeros_like(a)
        if dx > 0: b[:, dx:] = a[:, :-dx]
        else: b[:, :dx] = a[:, -dx:]
        Image.fromarray(b).save(f); print(clip, os.path.basename(f), 'dời', dx)
