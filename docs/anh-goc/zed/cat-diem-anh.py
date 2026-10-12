#!/usr/bin/env python3
"""Cắt tấm sprite AI theo ĐIỂM ẢNH (không theo ô vuông) rồi làm GIF.

- Tách nền xanh/hồng trơn, khử viền xanh.
- Tìm từng hình bằng vùng điểm ảnh liền nhau (nới vài điểm ảnh để tóc/khăn rời vẫn dính vào người).
- Chia hàng theo khoảng trống ngang, trong hàng xếp hình từ trái sang phải.
- Căn mọi khung theo CHÂN: đáy hình trùng vạch đất, giữa hai bàn chân trùng giữa khung GIF
  (không bị cắt mất tóc, khăn, vũ khí như cắt ô vuông).

Dùng: python3 cat-diem-anh.py <anh.png> [--hang 3] [--ten a,b,c] [--ms 90,90,80] [--co 320] [--ra thu-muc]
In ra: số hình mỗi hàng, cảnh báo nếu hàng không đủ 8 hình, cỡ người lệch.
Xuất thêm khung-NN.png (nền trong suốt, đã căn chân) cho từng hàng để dùng tiếp.
"""
import argparse, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd


def mat_na(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    xanh = (g > 120) & (g - np.maximum(r, b) > 60)
    hong = (r > 120) & (b > 120) & (np.minimum(r, b) - g > 60)
    nen_xanh = xanh.mean() > hong.mean()
    nen = xanh if nen_xanh else hong
    m = ~nen
    m = nd.binary_opening(m, iterations=1)
    # khử viền: điểm ảnh sát nền và còn ngả màu nền thì bỏ
    vien = m & nd.binary_dilation(~m, iterations=1)
    if nen_xanh:
        ngả = (g - np.maximum(r, b) > 25)
    else:
        ngả = (np.minimum(r, b) - g > 25)
    m = m & ~(vien & ngả)
    return m


def tim_hinh(m, gian=6, nho=0.002):
    H, W = m.shape
    lab, n = nd.label(nd.binary_dilation(m, iterations=gian))
    hinh = []
    for i, sl in enumerate(nd.find_objects(lab), 1):
        if sl is None:
            continue
        vung = (lab[sl] == i) & m[sl]
        if vung.sum() < nho * H * W / 24:
            continue
        hinh.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop, vung))
    return hinh


def chia_hang(hinh, so_hang):
    if not hinh:
        return []
    cy = np.array([(h[0] + h[1]) / 2 for h in hinh])
    if so_hang <= 1:
        nhom = [list(range(len(hinh)))]
    else:
        # gom theo tâm dọc: k-means 1 chiều đơn giản
        tam = np.quantile(cy, np.linspace(0.1, 0.9, so_hang))
        for _ in range(20):
            gan = np.argmin(np.abs(cy[:, None] - tam[None, :]), 1)
            tam = np.array([cy[gan == k].mean() if (gan == k).any() else tam[k] for k in range(so_hang)])
        thu_tu = np.argsort(tam)
        nhom = [[i for i in range(len(hinh)) if gan[i] == k] for k in thu_tu]
    return [sorted(g, key=lambda i: hinh[i][2]) for g in nhom]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh')
    ap.add_argument('--hang', type=int, default=1)
    ap.add_argument('--ten', default='')
    ap.add_argument('--ms', default='90')
    ap.add_argument('--co', type=int, default=320)
    ap.add_argument('--ra', default=None)
    a = ap.parse_args()

    im = Image.open(a.anh).convert('RGB')
    arr = np.array(im)
    m = mat_na(arr)
    rgba = np.dstack([arr, (m * 255).astype(np.uint8)])
    hinh = tim_hinh(m)
    hangs = chia_hang(hinh, a.hang)
    ten = [t for t in a.ten.split(',') if t] if a.ten else []
    ms = [int(x) for x in a.ms.split(',')]
    ra = a.ra or os.path.splitext(a.anh)[0] + '-gif'
    os.makedirs(ra, exist_ok=True)

    # chung một tỉ lệ cho mọi hàng (để so cỡ người giữa các hàng)
    cao_max = max(h[1] - h[0] for h in hinh)
    rong_max = max(h[3] - h[2] for h in hinh)
    S = a.co
    sc = min(S * 0.8 / cao_max, S * 0.9 / rong_max)
    bao_cao = []
    for r, g in enumerate(hangs):
        t = ten[r] if r < len(ten) else 'hang-%d' % (r + 1)
        anh = []
        caos = []
        for i in g:
            y0, y1, x0, x1, vung = hinh[i]
            cat = rgba[y0:y1, x0:x1].copy()
            cat[..., 3] = np.where(vung, 255, 0)
            o = Image.fromarray(cat, 'RGBA')
            # giữa chân: tâm các điểm ảnh ở 12% dưới cùng của hình
            day = vung[int(vung.shape[0] * 0.88):]
            xs = np.where(day.any(0))[0]
            chan_x = (xs.min() + xs.max()) / 2 if len(xs) else vung.shape[1] / 2
            caos.append(y1 - y0)
            nho = o.resize((max(1, round(o.width * sc)), max(1, round(o.height * sc))), Image.LANCZOS)
            khung = Image.new('RGBA', (S, S), (40, 44, 52, 255))
            dat = round(S * 0.92)
            for x in range(S):
                khung.putpixel((x, dat), (90, 96, 110, 255))
            px = round(S / 2 - chan_x * sc)
            khung.alpha_composite(nho, (max(0, min(S - nho.width, px)), max(0, dat - nho.height)))
            anh.append(khung.convert('RGB'))
        d = ms[r] if r < len(ms) else ms[-1]
        p = os.path.join(ra, '%d-%s.gif' % (r + 1, t))
        anh[0].save(p, save_all=True, append_images=anh[1:], duration=d, loop=0)
        lech = (max(caos) - min(caos)) / max(caos) if caos else 0
        bao_cao.append({'hang': t, 'so_hinh': len(g), 'cao_min': min(caos), 'cao_max': max(caos), 'lech_cao': round(lech, 2)})
        canh = []
        if len(g) != 8:
            canh.append('có %d hình (không phải 8)' % len(g))
        print(p, len(g), 'hình', '; '.join(canh))
    json.dump(bao_cao, open(os.path.join(ra, 'do.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
