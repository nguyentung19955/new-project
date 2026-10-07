#!/usr/bin/env python3
"""Tách nền HỒNG / MAGENTA CHUYỂN SẮC cho ảnh dựng xương (1 ảnh tĩnh / nhân vật) → assets/<mã>.png.

  python3 tools/tach-nen-hong.py incoming/dung-xuong-2 incoming/dung-xuong-3 [--out assets] [--h 400] [--only ma1,ma2]

Cách làm (mỗi ảnh):
  1. Mô hình nền = mặt bậc 2 theo (x, y) cho từng kênh màu, fit trên dải mép ảnh rồi fit lại trên vùng nền vừa tìm.
  2. Điểm "giống nền": gần màu nền mô hình, HOẶC cùng sắc nhưng tối hơn (bóng đổ hồng đậm dưới chân).
  3. Nền = các mảng "giống nền" chạm mép ảnh (loang từ mép; nét viền đen chặn lại) + lỗ kín màu nền thuần (khe tay/chân).
  4. Viền: điểm sát nền là pha trộn nét đen + hồng → tách lại (alpha = phần không phải hồng, màu = phần còn lại).
  5. Bỏ hạt rời nhỏ (dấu ✦, tia lửa bay) tách khỏi thân; cắt sát; chân ở đáy; co về cao H (mặc định 400 px).
"""
import argparse, os, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def design(xs, ys, W, H):
    u = xs / W - 0.5
    v = ys / H - 0.5
    return np.stack([np.ones_like(u), u, v, u * u, u * v, v * v], 1)


def fit_bg(im, sel, W, H, n=20000):
    ys, xs = np.nonzero(sel)
    if len(xs) > n:
        k = np.random.default_rng(0).choice(len(xs), n, replace=False)
        xs, ys = xs[k], ys[k]
    X = design(xs.astype(float), ys.astype(float), W, H)
    coef, *_ = np.linalg.lstsq(X, im[ys, xs], rcond=None)
    yy, xx = np.mgrid[0:H, 0:W]
    return (design(xx.ravel().astype(float), yy.ravel().astype(float), W, H) @ coef).reshape(H, W, 3)


def cut(path, out_h=400, verbose=False, strict=False, shadow=False):
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    H, W, _ = im.shape
    band = np.zeros((H, W), bool)
    b = max(8, W // 40)
    band[:b] = band[-b:] = True
    band[:, :b] = band[:, -b:] = True
    M = fit_bg(im, band, W, H)
    bg = None
    for it in range(3):
        d = np.linalg.norm(im - M, axis=2)
        mm = (M * M).sum(2) + 1e-6
        s = (im * M).sum(2) / mm                     # pix ≈ s · nền (cùng sắc, đậm nhạt khác)
        res = np.linalg.norm(im - s[..., None] * M, axis=2)
        like = (d < 52) | ((s > 0.4) & (s < 1.08) & (res < 26 + 10 * s))
        lab, n = ndi.label(like)
        edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        edge = edge[edge > 0]
        bg = np.isin(lab, edge)
        if it < 2:
            M = fit_bg(im, bg, W, H)
    # lỗ kín màu nền thuần (khe giữa tay / chân / cán vũ khí)
    # strict (nhân vật cùng màu nền: rồng hồng…): không khoét lỗ kín (vảy hồng giống nền), chỉ bỏ nền chạm mép
    pure = (d < 34) & ~bg & (not strict)
    lab2, n2 = ndi.label(pure)
    if n2:
        sz = ndi.sum(np.ones_like(d), lab2, range(1, n2 + 1))
        # lỗ to quá (≥ 1.2% ảnh) là thân cùng màu nền (bạch tuộc hồng…), không phải khe hở
        big = np.nonzero((sz > 60) & (sz < 0.012 * H * W))[0] + 1
        bg |= np.isin(lab2, big)
    # bỏ lỗ 1-2 điểm lẻ trong nền (nhiễu) và lấp lỗ li ti trong thân
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    lab3, n3 = ndi.label(fg)
    if n3 == 0:
        raise RuntimeError('không thấy nhân vật')
    sz = ndi.sum(np.ones_like(d), lab3, range(1, n3 + 1))
    main = int(np.argmax(sz)) + 1
    keep = [main]
    ys, xs = np.nonzero(lab3 == main)
    mb = (xs.min(), ys.min(), xs.max(), ys.max())
    dropped = []
    for i, z in enumerate(sz, 1):
        if i == main:
            continue
        # giữ mảng lớn (≥ 3% thân, vd. lư đồng đặt cạnh, ngọn lửa to); bỏ hạt / dấu ✦ / tia rời
        if z >= 0.03 * sz[main - 1]:
            keep.append(i)
        elif z > 30:
            dropped.append(int(z))
    fg = np.isin(lab3, keep)
    if shadow:
        # bóng đổ hồng còn dính chân: ở dải 7% đáy hình, bỏ điểm cùng sắc nền (magenta, b > g)
        ys2 = np.nonzero(fg.any(1))[0]
        y0b = int(ys2.max() - 0.07 * (ys2.max() - ys2.min()))
        mm2 = (M * M).sum(2) + 1e-6
        s2 = (im * M).sum(2) / mm2
        res2 = np.linalg.norm(im - s2[..., None] * M, axis=2)
        mag = (res2 < 45) & (s2 > 0.3) & (s2 < 1.1)          # cùng sắc nền (chỉ đậm nhạt khác)
        # bóng nằm NGOÀI nét viền đen: mỗi hàng ở dải đáy, bỏ điểm cùng sắc nền nằm ngoài khoảng [viền đen trái, viền đen phải]
        dark = fg & (im.sum(2) < 260)
        for y in range(y0b, H):
            xs = np.nonzero(dark[y])[0]
            row = fg[y] & mag[y]
            if len(xs) == 0:
                fg[y] &= ~row
                continue
            out = np.ones(W, bool); out[xs.min():xs.max() + 1] = False
            fg[y] &= ~(row & out)
        lab4, n4 = ndi.label(fg)
        if n4 > 1:
            sz4 = ndi.sum(np.ones_like(d), lab4, range(1, n4 + 1))
            fg = np.isin(lab4, np.nonzero(sz4 >= 0.01 * sz4.max())[0] + 1)
    fg = ndi.binary_fill_holes(fg) & (fg | ~(d < 34))   # lấp lỗ li ti không phải màu nền
    # alpha + khử lem hồng ở viền (2 điểm sát nền)
    alpha = fg.astype(float)
    dist_in = ndi.distance_transform_edt(fg)
    ring = fg & (dist_in <= 2.5)
    mm = (M * M).sum(2) + 1e-6
    s = np.clip((im * M).sum(2) / mm, 0, 1)
    res = np.linalg.norm(im - s[..., None] * M, axis=2)
    a_ring = 1 - s                                    # pix = a·đen + (1-a)·nền
    blend = ring & (res < 40)
    alpha[blend] = np.clip(a_ring[blend] * 1.15, 0, 1)
    rgb = im.copy()
    a3 = np.maximum(alpha, 1e-3)[..., None]
    un = (im - (1 - alpha)[..., None] * M) / a3
    rgb[blend] = np.clip(un[blend], 0, 255)
    # điểm viền còn ánh hồng (pha với màu thân chứ không phải nét đen): kéo bớt sắc hồng
    pinky = ring & ~blend & (d < 90)
    alpha[pinky] = np.minimum(alpha[pinky], np.clip(d[pinky] / 90, 0.25, 1))
    alpha[alpha < 0.06] = 0
    out = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')
    bb = img.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    img = img.crop(bb)
    k = out_h / img.height
    img = img.convert('RGBa').resize((max(1, round(img.width * k)), out_h), Image.LANCZOS).convert('RGBA')
    info = {'bbox': bb, 'size': img.size, 'dropped': dropped, 'parts': len(keep), 'fg_frac': float(fg.mean())}
    return img, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dirs', nargs='+')
    ap.add_argument('--out', default='assets')
    ap.add_argument('--h', type=int, default=400)
    ap.add_argument('--only', default='')
    ap.add_argument('--shadow', default='', help='mã còn bóng đổ hồng dính chân (cách nhau dấu phẩy)')
    ap.add_argument('--strict', default='', help='mã nhân vật cùng màu nền (cách nhau dấu phẩy): tách chặt, không đục lỗ trong thân')
    a = ap.parse_args()
    only = set(filter(None, a.only.split(',')))
    os.makedirs(a.out, exist_ok=True)
    for d in a.dirs:
        for p in sorted(glob.glob(os.path.join(d, '*.png'))):
            ma = os.path.splitext(os.path.basename(p))[0]
            if only and ma not in only:
                continue
            img, info = cut(p, a.h, strict=ma in set(a.strict.split(',')), shadow=ma in set(a.shadow.split(',')))
            img.save(os.path.join(a.out, ma + '.png'), optimize=True)
            print(ma, info['size'], 'mảng giữ', info['parts'], 'bỏ hạt', info['dropped'])


if __name__ == '__main__':
    main()
