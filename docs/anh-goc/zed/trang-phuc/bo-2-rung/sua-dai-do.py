#!/usr/bin/env python3
"""SỬA SÓT MÀU ĐAI — bộ Rừng, tấm 03-chay-v4 (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung/YEU-CAU.md mục 2).

Ảnh gen lại từ bộ ninja còn sót vệt ĐỎ của đai ninja cũ trong đai vàng (khung 3, 9, 11; khung 2, 8 cũng còn đuôi đai đỏ).
Cách sửa (ghi đè PNG tại chỗ, chạy lại vô hại vì sau khi sửa không còn đỏ để tìm):
  1. Hạt giống = mảng điểm ĐỎ THUẦN (r>140, g<70, b<70) ≥ 30 điểm, nằm dưới vùng mặt (y > 120) → không đụng mắt đỏ / dấu đỏ trên mặt.
  2. Vùng đai = hạt giống nở thêm 6 điểm; trong vùng, điểm "đỏ" (r − g > 50, r > 2,2·g, r > 2,2·b, không phải da) được tô lại.
  3. Màu mới = vàng đất của chính đai trong khung đó, theo thứ hạng sáng: điểm đỏ sáng thứ p% lấy màu vàng sáng thứ p%
     (giữ được bóng đổ / viền tối của nếp đai).
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '03-chay-v4-cat', '03-chay-v4')
KHUNG = [2, 3, 8, 9, 11]


def da(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50)


def sua(p):
    im = Image.open(p).convert('RGBA'); a = np.array(im).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    yy = np.mgrid[:a.shape[0], :a.shape[1]][0]
    thuan = (r > 140) & (g < 70) & (b < 70) & (al > 0) & (yy > 120)
    lab, n = ndimage.label(thuan, structure=np.ones((3, 3)))
    hat = np.zeros_like(thuan)
    for i in range(1, n + 1):
        if (lab == i).sum() >= 30:
            hat |= lab == i
    if not hat.any():
        return 0
    vung = ndimage.binary_dilation(hat, iterations=6)
    do = vung & (al > 0) & (r - g > 50) & (r > 2.2 * g) & (r > 2.2 * b) & ~da(a)
    # mẫu vàng đất của đai (cùng khung, dưới mặt)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(int)
    vang = (al > 0) & (yy > 120) & (hsv[..., 0] >= 22) & (hsv[..., 0] <= 40) & (hsv[..., 1] > 140) & (hsv[..., 2] > 90)
    mau = a[vang][:, :3]
    if len(mau) < 20:
        return 0
    sang_mau = mau @ np.array([0.299, 0.587, 0.114])
    mau = mau[np.argsort(sang_mau)]
    sang_do = a[do][:, :3] @ np.array([0.299, 0.587, 0.114])
    hang = np.argsort(np.argsort(sang_do)) / max(1, len(sang_do) - 1)
    moi = mau[np.clip((hang * (len(mau) - 1)).round().astype(int), 0, len(mau) - 1)]
    a[..., :3][do] = moi
    Image.fromarray(a.astype(np.uint8)).save(p)
    return int(do.sum())


if __name__ == '__main__':
    for k in KHUNG:
        p = os.path.join(DAY, 'khung-%02d.png' % k)
        print('khung %d: tô %d điểm' % (k, sua(p)))
