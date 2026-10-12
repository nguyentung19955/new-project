#!/usr/bin/env python3
"""Ghép thử vũ khí vào tay Zed theo điểm nắm + góc từng khung (cách 1: game tự gắn vũ khí).
neo: {dong_tac: {"vk": "vk-kiem-moi", "khung": [[x, y, goc], ...]}}  toạ độ theo ảnh khung đã cắt (nguồn),
goc độ: 0 = mũi chỉ sang phải, âm = chếch lên, dương = chếch xuống; số thứ 4 = 1 nếu vũ khí nằm SAU người.
"""
import json, sys, glob, math
import numpy as np
from PIL import Image, ImageDraw

MOI = '../moi'
DAI_CAP1 = 0.8   # chiều dài kiếm cấp 1 so với chiều cao Zed


def da(a):  # điểm màu da
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50) & (a[..., 3] > 0)


def chinh_nam(im, x, y, r=28):
    a = np.array(im); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    vung = m & ((xx - x) ** 2 + (yy - y) ** 2 < r * r)
    if vung.sum() < 20:
        return x, y
    return float(xx[vung].mean()), float(yy[vung].mean())


def chuoi(vk, cam=None):  # tâm phần quấn đỏ của chuôi (hoặc điểm cầm theo tỉ lệ chiều dài)
    a = np.array(vk)
    if cam is not None:
        x = int(a.shape[1] * cam); ys = np.nonzero(a[:, x, 3] > 0)[0]
        return float(x), float(ys.mean() if len(ys) else a.shape[0] / 2)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = (r > 110) & (g < 70) & (b < 70) & (a[..., 3] > 0)
    m[:, int(a.shape[1] * 0.35):] = False
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return a.shape[1] * 0.1, a.shape[0] / 2
    return float(np.median(xs)), float(np.median(ys))


def ghep(nguoi, vk, sc, x, y, goc, sau=0, cam=None, tay2=None):
    gx, gy = chuoi(vk, cam)
    v = vk.resize((max(1, round(vk.width * sc)), max(1, round(vk.height * sc))), Image.NEAREST)
    gx, gy = gx * sc, gy * sc
    # đặt chuôi vào giữa ảnh vuông rồi xoay quanh chuôi
    R = int(math.hypot(v.width, v.height)) + 4
    t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0))
    t.alpha_composite(v, (int(R - gx), int(R - gy)))
    t = t.rotate(-goc, resample=Image.NEAREST)
    pad = R
    out = Image.new('RGBA', (nguoi.width + 2 * pad, nguoi.height + 2 * pad), (0, 0, 0, 0))
    if sau:  # vũ khí nằm SAU người
        out.alpha_composite(t, (int(pad + x - R), int(pad + y - R)))
        out.alpha_composite(nguoi, (pad, pad))
    else:
        out.alpha_composite(nguoi, (pad, pad))
        out.alpha_composite(t, (int(pad + x - R), int(pad + y - R)))
    # vẽ lại nắm tay lên trên chuôi
    a = np.array(nguoi); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    tay = m & ((xx - x) ** 2 + (yy - y) ** 2 < 26 ** 2)
    if tay2:
        tay |= m & ((xx - tay2[0]) ** 2 + (yy - tay2[1]) ** 2 < 26 ** 2)
    lop = a.copy(); lop[..., 3] = np.where(tay, a[..., 3], 0)
    out.alpha_composite(Image.fromarray(lop), (pad, pad))
    return out.crop(out.getbbox()), (pad - out.getbbox()[0], pad - out.getbbox()[1])


def main(ten, neo, cap_list=(1, 4)):
    fs = sorted(glob.glob(f'{MOI}/{ten}-gif/{ten}/khung-*.png'))
    ng = [Image.open(f).convert('RGBA') for f in fs]
    vks = [Image.open(f).convert('RGBA') for f in sorted(glob.glob(f'{MOI}/{neo["vk"]}-gif/{neo["vk"]}/khung-*.png'))]
    cao = max(i.height for i in ng)
    sc = neo.get('dai', DAI_CAP1) * cao / vks[0].width
    hang = []
    for cap in cap_list:
        o = []
        for im, k in zip(ng, neo['khung']):
            x, y = chinh_nam(im, k[0], k[1])
            t2 = chinh_nam(im, *k[4]) if len(k) > 4 else None
            o.append(ghep(im, vks[cap - 1], sc, x, y, k[2], k[3] if len(k) > 3 else 0, neo.get('cam'), t2)[0])
        hang.append(o)
    H = max(i.height for r in hang for i in r) + 20
    W = max(sum(i.width + 30 for i in r) for r in hang)
    P = Image.new('RGBA', (W, H * len(hang)), (40, 44, 52, 255))
    for ri, r in enumerate(hang):
        x = 10
        for i in r:
            P.alpha_composite(i, (x, ri * H + H - 10 - i.height)); x += i.width + 30
    P.thumbnail((1800, 1800))
    return P.convert('RGB')


if __name__ == '__main__':
    neo = json.load(open('neo.json'))
    for ten in sys.argv[1:]:
        main(ten, neo[ten]).save(f'thu-{ten}.png'); print('thu-' + ten + '.png')
