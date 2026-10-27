#!/usr/bin/env python3
"""Bọ Vỏ Mộc – bước 2: đo cỡ + vị trí từng mảnh so với hình NGUYÊN CON (cùng ảnh nguồn).

Mảnh rời trong ảnh nguồn vẽ to hơn nguyên con ~10–15 %. Dò lưới tỉ lệ k (mảnh → nguyên con) và vị trí bằng sai số màu
có trọng số alpha (FFT), ở cỡ 1/3. Phần bị che trong nguyên con làm sai số tăng, nên chặn sai số mỗi điểm (|Δ| ≤ 60).
Ra: ../tam/khop.json {mảnh: {k, x, y}} – (x,y) = góc trên-trái mảnh đã thu k, trong toạ độ ảnh nguyên con.
Chạy: python3 khop.py"""
import json, os
import numpy as np
from PIL import Image
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
G = os.path.join(ROOT, 'tam', 'goc')
DS = 3
def nap(t, k=1.0):
    im = Image.open(os.path.join(G, t + '.png')).convert('RGBA')
    w, h = max(1, round(im.width * k / DS)), max(1, round(im.height * k / DS))
    a = np.array(im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')).astype(np.float32) / 255
    return a
Wc = nap('nguyen-con')
Wrgb = Wc[..., :3] * Wc[..., 3:]        # nền đen ngoài vật
# Dò tỉ lệ trên MAI (mảnh lớn, ít bị che) rồi dùng CHUNG tỉ lệ đó cho 4 mảnh còn lại (cùng một nét vẽ), chỉ dò vị trí
# trong vùng hợp lý (đầu bên trái, bụng bên phải, chân dưới thấp) – mảnh tối nhiều vân dễ khớp nhầm nếu dò tự do.
VUNG = {'mai': None, 'dau': (0, 330, 100, 300), 'bung': (380, 740, 0, 300), 'chan-truoc': (60, 470, 250, 432), 'chan-sau': (330, 740, 250, 432)}
kq = {}
for t in ('mai', 'bung', 'dau', 'chan-truoc', 'chan-sau'):
    best = None
    dsk = np.arange(0.78, 1.02, 0.01) if t == 'mai' else [kq['mai']['k']]
    for k in dsk:
        P = nap(t, k); al = P[..., 3]; rgb = P[..., :3]
        if P.shape[0] > Wc.shape[0] or P.shape[1] > Wc.shape[1]: continue
        # SSD(x,y) = Σ α (W − P)² = Σα W² − 2 Σ α P W + Σ α P²   (tương quan = chập với mẫu lật)
        A = al[::-1, ::-1]
        s1 = sum(fftconvolve(Wrgb[..., c] ** 2, A, mode='valid') for c in range(3))
        s2 = sum(fftconvolve(Wrgb[..., c], (al * rgb[..., c])[::-1, ::-1], mode='valid') for c in range(3))
        s3 = (al[..., None] * rgb ** 2).sum()
        ssd = (s1 - 2 * s2 + s3) / al.sum()
        # phạt vị trí mà mẫu đè ra ngoài vật (alpha nguyên con thấp)
        ngoai = fftconvolve(1 - Wc[..., 3], A, mode='valid') / al.sum()
        cost = ssd + 0.25 * ngoai
        if VUNG[t]:   # chỉ nhận vị trí mà TÂM mảnh nằm trong vùng (x0,x1,y0,y1) của nguyên con
            x0, x1, y0, y1 = VUNG[t]; hh, ww = al.shape
            yy, xx = np.mgrid[0:cost.shape[0], 0:cost.shape[1]]
            cx, cy = (xx + ww / 2) * DS, (yy + hh / 2) * DS
            cost = np.where((cx >= x0) & (cx <= x1) & (cy >= y0) & (cy <= y1), cost, 1e9)
        iy, ix = np.unravel_index(np.argmin(cost), cost.shape)
        v = cost[iy, ix]
        if best is None or v < best[0]: best = (float(v), float(k), int(ix) * DS, int(iy) * DS)
    kq[t] = {'k': round(best[1], 3), 'x': best[2], 'y': best[3], 'sai_so': round(best[0], 4)}
    print(t, kq[t])
json.dump(kq, open(os.path.join(ROOT, 'tam', 'khop.json'), 'w'), indent=1)
