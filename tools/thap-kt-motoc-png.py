#!/usr/bin/env python3
# Soát PNG chân dung: pilot_*.png phải ĐẶC (không alpha mờ ở 8 % hàng trên cùng), cỡ ≥ 256 và không phóng từ ảnh nhỏ;
# af_*.png (chỉ huy, ảnh cắt nền) chỉ được có viền alpha mềm mảnh ở mép tóc (trung vị ≤ 3 px), không dải mờ dần.
import glob, os, sys, numpy as np
from PIL import Image
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'thap', 'assets')
loi = 0
for f in sorted(glob.glob(A + '/pilot_*.png')):
    im = Image.open(f); a = np.array(im.convert('RGBA'))[..., 3]; t = a[:max(1, int(a.shape[0] * 0.08))]
    p = int(((t > 0) & (t < 255)).sum()); z = int((t == 0).sum())
    if p or z or im.size[0] < 256: loi += 1; print('LỖI', os.path.basename(f), im.size, 'alpha mờ', p, 'trong suốt', z)
n = len(glob.glob(A + '/pilot_*.png'))
for f in sorted(glob.glob(A + '/af_*.png')):
    a = np.array(Image.open(f))[..., 3].astype(int); H, W = a.shape; ws = []
    for x in range(W):
        col = a[:int(H * .3), x]; nz = np.nonzero(col > 8)[0]
        if len(nz):
            fu = np.nonzero(col[nz[0]:] >= 247)[0]
            if len(fu): ws.append(fu[0])
    med = float(np.median(ws)); ok = med <= 3
    loi += not ok; print(('OK ' if ok else 'LỖI'), os.path.basename(f), Image.open(f).size, 'viền mềm trung vị %.0f px' % med)
print('pilot: %d ảnh, lỗi tổng %d' % (n, loi)); sys.exit(1 if loi else 0)
