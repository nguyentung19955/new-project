#!/usr/bin/env python3
"""NẠP ẢNH GEN thành một bộ trang phục thay được (áo hoặc quần) cho bản thử modular 96.

Ảnh gen: 1 hàng 12 ô bằng nhau (ô vuông, cỡ nào cũng được, ví dụ 12×384 = 4608×384), nền xanh #00FF00,
ô thứ k = khung k của hàng chạy (giống mau-gen/vung-phu-ao.png / vung-phu-quan.png).

Cách dùng (chạy ở thư mục gốc repo):
    python3 docs/thu-modular-96/nap-anh-gen.py ANH.png --o ao   --ten ao-giap-da  [--nhan "Áo giáp da (gen)"]
    python3 docs/thu-modular-96/nap-anh-gen.py ANH.png --o quan --ten quan-luoi   [--khong-lap]
    python3 docs/thu-modular-96/tao-bo.py          # dựng lại: bộ mới hiện thành nút trong kiem-tra.html

Mỗi ô:  tách nền xanh (kèm khử viền xanh) → cắt phần có hình → thu về đúng khung bao của vùng đồ gốc
        cùng khung (data.json + sheets/do-goc) → đặt vào ô 96×96 theo pivot (48,90) → bỏ điểm ảnh lạc xa thân
        → lấp chỗ hở trên vùng đồ gốc bằng màu điểm ảnh gen gần nhất (tắt bằng --khong-lap)
        → chia về các lớp của ô đồ (áo: torsoOutfit/belt; quần: rearPants/pants/frontPants) theo lớp gốc gần nhất.
Ghi: docs/thu-modular-96/do-gen/<ten>/<lớp>.png (1152×96) + ten.txt. Không đụng gì khác.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import trang_phuc as TP

O = 96


def tach_nen_xanh(a):
    rgb = a[:, :, :3].astype(int); r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    nen = (a[:, :, 3] < 128) | ((g > 140) & (g > r * 1.35 + 20) & (g > b * 1.35 + 20))
    out = a.copy()
    out[:, :, 3] = np.where(nen, 0, 255)
    # khử ám xanh ở viền: kênh G không vượt quá max(R, B) + 10
    gmax = np.maximum(r, b) + 10
    out[:, :, 1] = np.where(~nen & (g > gmax), gmax, g).clip(0, 255)
    return out


def thu_nho(a, w, h):
    """Thu ảnh RGBA về w×h: trung bình (BOX) có trọng alpha, rồi alpha ≥ 50% → đặc, còn lại trong suốt."""
    pre = a.astype(float); pre[:, :, :3] *= pre[:, :, 3:4] / 255
    im = np.array(Image.fromarray(pre.clip(0, 255).astype(np.uint8)).resize((w, h), Image.BOX)).astype(float)
    al = np.array(Image.fromarray(a[:, :, 3]).resize((w, h), Image.BOX)).astype(float)
    out = np.zeros((h, w, 4), np.uint8)
    m = al >= 128
    out[m, :3] = (im[m, :3] * 255 / np.maximum(al[m, None], 1)).clip(0, 255)
    out[m, 3] = 255
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh'); ap.add_argument('--o', choices=list(TP.SLOT), required=True)
    ap.add_argument('--ten', required=True); ap.add_argument('--nhan', default=None)
    ap.add_argument('--khong-lap', action='store_true', help='không lấp chỗ hở (để thấy ảnh gen thiếu chỗ nào)')
    ns = ap.parse_args()
    data = json.load(open(os.path.join(DAY, 'data.json'), encoding='utf-8'))
    N = data['frameCount']
    lop = TP.SLOT[ns.o]
    goc = {l: np.array(Image.open(os.path.join(DAY, data['outfits']['goc']['sheets'][l])))[:, :, 3] > 0 for l in lop}
    src = tach_nen_xanh(np.array(Image.open(ns.anh).convert('RGBA')))
    H, W = src.shape[:2]
    cw = W / N
    if abs(cw - H) > H * 0.2: print('CẢNH BÁO: ô %.0f×%d không vuông — ảnh có đúng 1 hàng 12 ô không?' % (cw, H))
    ra = {l: np.zeros((O, O * N, 4), np.uint8) for l in lop}
    tong_ho = 0
    for i in range(N):
        cell = src[:, int(round(i * cw)):int(round((i + 1) * cw))]
        ys, xs = np.nonzero(cell[:, :, 3])
        if ys.size == 0: raise SystemExit('LỖI: ô %d không có hình (toàn nền xanh?)' % i)
        cell = cell[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        M = np.zeros((O, O), bool)
        for l in lop: M |= goc[l][:, i * O:(i + 1) * O]
        my, mx = np.nonzero(M)
        y0, y1, x0, x1 = my.min(), my.max() + 1, mx.min(), mx.max() + 1
        nho = thu_nho(cell, x1 - x0, y1 - y0)
        k = np.zeros((O, O, 4), np.uint8); k[y0:y1, x0:x1] = nho
        k[~ndimage.binary_dilation(M, iterations=3)] = 0              # điểm lạc xa thân
        ho = M & (k[:, :, 3] == 0)
        tong_ho += int(ho.sum())
        if ho.any() and not ns.khong_lap and (k[:, :, 3] > 0).any():
            _, (iy, ix) = ndimage.distance_transform_edt(k[:, :, 3] == 0, return_indices=True)
            k[ho] = k[iy[ho], ix[ho]]
        # chia về lớp gốc gần nhất
        d = np.stack([ndimage.distance_transform_edt(~goc[l][:, i * O:(i + 1) * O]) for l in lop])
        gan = np.argmin(d, 0)
        for j, l in enumerate(lop):
            m = (k[:, :, 3] > 0) & (gan == j)
            ra[l][:, i * O:(i + 1) * O][m] = k[m]
    out = os.path.join(DAY, 'do-gen', ns.ten); os.makedirs(out, exist_ok=True)
    for l in lop: Image.fromarray(ra[l]).save(os.path.join(out, l + '.png'), optimize=True)
    open(os.path.join(out, 'ten.txt'), 'w', encoding='utf-8').write(ns.nhan or ('Đồ gen: ' + ns.ten))
    print('đã nạp %s → do-gen/%s/ (%s). Chỗ ảnh gen chưa phủ vùng đồ gốc: %d điểm ảnh%s.' % (
        ns.anh, ns.ten, ', '.join(lop), tong_ho, '' if ns.khong_lap or not tong_ho else ' (đã lấp bằng màu gần nhất)'))
    print('Chạy tiếp: python3 docs/thu-modular-96/tao-bo.py')


if __name__ == '__main__':
    main()
