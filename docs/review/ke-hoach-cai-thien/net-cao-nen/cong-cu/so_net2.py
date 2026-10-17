"""So ảnh dựng lại ở net 2 (ra/<thư mục>/<mã>.png) với ảnh game đang dùng: chứng minh cùng chỗ cắt / cùng cỡ.
  python3 so_net2.py <thư mục trong ra/> [tiền tố mã]"""
import sys, glob, os, json
import numpy as np
from PIL import Image
from chung import doc, RA
d0 = os.path.join(RA, sys.argv[1]); tien = sys.argv[2] if len(sys.argv) > 2 else ''
kq = {}
for f in sorted(glob.glob(os.path.join(d0, tien + '*.png'))):
    ma = os.path.basename(f)[:-4]
    if ma.startswith('lat-'):
        continue
    try:
        _, g = doc(ma)
    except FileNotFoundError:
        continue
    r = np.array(Image.open(f).convert('RGBA')); r[r[..., 3] < 128] = 0; r[r[..., 3] >= 128, 3] = 255
    if r.shape != g.shape:
        print('%-28s KHÁC CỠ %s / game %s' % (ma, r.shape[:2], g.shape[:2])); kq[ma] = {'co': False}; continue
    a, b = r[..., 3] > 0, g[..., 3] > 0
    iou = (a & b).sum() / max(1, (a | b).sum())
    m = a & b
    d = np.abs(r[m][:, :3].astype(int) - g[m][:, :3].astype(int)).max(-1)
    kq[ma] = {'iou': round(float(iou), 4), 'giong': round(float((d == 0).mean()), 4), 'lech_tb': round(float(d.mean()), 2)}
    print('%-28s mặt nạ trùng %.1f%%  điểm giống hệt %.1f%%  lệch màu TB %.2f' % (ma, iou * 100, (d == 0).mean() * 100, d.mean()))
json.dump(kq, open(os.path.join(d0, 'so-net2.json'), 'w'), indent=1)
