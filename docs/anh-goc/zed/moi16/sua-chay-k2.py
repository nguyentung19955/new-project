#!/usr/bin/env python3
"""Khung 2 hàng chạy mới (03-chay-12k-v2-gif/chay/khung-02.png): mảng TRẮNG trên bắp tay sau vai → nhuộm về màu da, giữ sáng tối
tương đối. Vùng: hộp x 15–70, y 120–185 của khung đã cắt; điểm sáng ít ngả đỏ (trắng / hồng nhạt) → màu da lấy từ khung 1 và 3
(phân vị độ sáng 30–100 của các điểm da). Ghi đè khung-02.png (bản gốc trước khi sửa: goc-khung-02.png). Chạy lại được."""
import os
import numpy as np
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '03-chay-12k-v2-gif', 'chay')
goc = os.path.join(D, 'goc-khung-02.png')
if not os.path.exists(goc):
    os.rename(os.path.join(D, 'khung-02.png'), goc)
a = np.array(Image.open(goc).convert('RGBA')).astype(int)
r, g, b, al = [a[..., i] for i in range(4)]
reg = np.zeros(r.shape, bool); reg[120:185, 15:70] = True
m = reg & (al > 0) & (r > 200) & (g > 150) & (b > 120) & ~((r - b > 110) & (g < 190))
skin = []
for k in ('khung-01.png', 'khung-03.png'):
    s = np.array(Image.open(os.path.join(D, k)).convert('RGBA')).astype(int)
    R, G, B, A = [s[..., i] for i in range(4)]
    skin.append(s[(R > 170) & (G > 110) & (B > 70) & (R - B > 50) & (A > 0)][:, :3])
skin = np.concatenate(skin); skin = skin[np.argsort(skin.sum(1))]
L = a[m][:, :3].sum(1); rk = np.argsort(np.argsort(L)) / max(1, len(L) - 1)
a[m, :3] = skin[((0.30 + 0.70 * rk) * (len(skin) - 1)).astype(int)]
Image.fromarray(a.astype(np.uint8)).save(os.path.join(D, 'khung-02.png'))
print('khung 2: sửa', int(m.sum()), 'điểm ảnh trắng trên bắp tay')
