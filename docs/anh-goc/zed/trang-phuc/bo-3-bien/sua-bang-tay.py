#!/usr/bin/env python3
"""SỬA SÓT MÀU BĂNG TAY — bộ Biển (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien/YEU-CAU.md mục 2).

Băng cổ tay / nắm tay của bộ Biển phải XANH LAM. Ảnh gen lại còn sót mảng TRẮNG (trắng lạnh / xám) ở cổ tay:
  - 10-kiem-3 khung 6: băng tay sau trắng hẳn (theo yêu cầu)
  - 12-thuong-2 khung 3, 4: băng tay giơ cao có vệt trắng giữa băng
  (13-thuong-3 khung 5: nắm tay sau màu xám ngà, không phải băng trắng → để nguyên, ghi trong bao-cao.md)
  - 20-phi-tieu khung 3: băng tay sau (chống hông) trắng xám nhạt
  (soát hết 27 tấm × mọi khung bằng mắt trên tấm ghép; các khung khác băng tay đã xanh)
Chỉ sửa trong khung chữ nhật quanh cổ tay/nắm tay ghi dưới đây (toạ độ ảnh khung đã cắt) → không đụng áo trắng ngà, răng, mắt, vỏ ốc.
Trong vùng đó, điểm được tô lại = điểm có hình, KHÔNG phải da, và là trắng / xám (min(r,g,b) > 90, max − min < 70) hoặc
trắng ngả xanh nhạt (min > 100, b ≥ r, max − min < 90). Áo ngà cũng ít màu nhưng nằm ngoài vùng.
Màu mới = xanh lam của chính băng tay trong khung đó (điểm b > r+35, b > g+25, g < 0,75·b — loại xanh ngọc của đai — trong vùng
nới rộng 30 điểm hoặc vùng mẫu ghi riêng, trừ chính các điểm trắng), theo thứ hạng sáng:
điểm trắng sáng thứ p% lấy màu xanh sáng thứ p% → giữ nếp băng. Ghi đè PNG tại chỗ; chạy lại vô hại (hết trắng thì không tô gì).
"""
import os
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
# (tấm, khung, (x0, y0, x1, y1) vùng cổ tay / nắm tay[, vùng lấy mẫu xanh lam nếu quanh đó không có băng xanh])
SUA = [
    ('10-kiem-3', 6, (58, 238, 104, 272), (205, 245, 245, 275)),  # mẫu: băng xanh tay trước
    ('12-thuong-2', 3, (195, 130, 255, 172)),
    ('12-thuong-2', 4, (195, 130, 255, 172)),
    ('20-phi-tieu', 3, (205, 238, 234, 264)),
]
SANG = np.array([0.299, 0.587, 0.114])


def da(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50)


def sua(p, hop, mau_hop=None):
    a = np.array(Image.open(p).convert('RGBA')).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx, mn = a[..., :3].max(-1), a[..., :3].min(-1)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    x0, y0, x1, y1 = hop
    trong = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
    trang = trong & (al > 0) & ~da(a) & (((mn > 90) & (mx - mn < 70)) | ((mn > 100) & (b >= r) & (mx - mn < 90)))
    if not trang.any():
        return 0
    if mau_hop:
        u0, v0, u1, v1 = mau_hop
        rong = (xx >= u0) & (xx < u1) & (yy >= v0) & (yy < v1)
    else:
        rong = (xx >= x0 - 30) & (xx < x1 + 30) & (yy >= y0 - 30) & (yy < y1 + 30)
    lam = rong & ~trang & (al > 0) & (b > r + 35) & (b > g + 25) & (g < 0.75 * b)
    mau = a[lam][:, :3]
    if len(mau) < 20:
        print('  ! %s: không đủ mẫu xanh lam (%d)' % (p, len(mau)))
        return 0
    mau = mau[np.argsort(mau @ SANG)]
    sang = a[trang][:, :3] @ SANG
    hang = np.argsort(np.argsort(sang)) / max(1, len(sang) - 1)
    a[..., :3][trang] = mau[np.clip((hang * (len(mau) - 1)).round().astype(int), 0, len(mau) - 1)]
    Image.fromarray(a.astype(np.uint8)).save(p)
    return int(trang.sum())


if __name__ == '__main__':
    for ten, k, hop, *mau_hop in SUA:
        p = os.path.join(DAY, ten + '-cat', ten, 'khung-%02d.png' % k)
        print('%s khung %d: tô %d điểm' % (ten, k, sua(p, hop, *mau_hop)))
