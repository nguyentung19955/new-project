#!/usr/bin/env python3
# TURRET MERGE — ẢNH GỐC 1 KHUNG cho trùm hoạt ảnh bằng code (thử 08/11, quaianim.js TRUM_ANIM_CODE).
# Lấy 1 khung sạch nhất trong dải đi trum_<id>_8.png (không gen ảnh mới) →
#   trum_<id>_m.png       thân (cùng cỡ ô dải đi → K8 giữ nguyên; trùm LĂN: dời tâm quả cầu về giữa ô)
#   trum_<id>_m_sang.png  lớp sáng (lõi/ngọc/mật sáng, đã nhoè mềm) — code nhấp nháy bằng 'lighter'
#   trum_mad_crown_m_vm.png  vương miện tách rời (thân đã vá chỗ trống) — code cho trễ nhịp so với thân
# Chạy (gốc repo): python3 tools/thap-trum-master.py [id ...]
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

A = 'thap/assets/'
# id: (khung, kiểu, ngưỡng sáng lớp glow, màu glow lọc theo hue (độ) hoặc None)
CF = {
    'hive': (0, 'lan', 0.80, (20, 55)),
    'prism': (0, 'bay', 0.72, (185, 260)),
    'mad_crown': (0, 'nhay', 0.80, (30, 60)),
}


def khung(id_, k):
    im = Image.open(A + 'trum_%s_8.png' % id_).convert('RGBA')
    s = im.size[1]
    return np.asarray(im.crop((k * s, 0, k * s + s, s))).astype(np.float32) / 255.0


def hsv(p):
    r, g, b = p[..., 0], p[..., 1], p[..., 2]
    mx, mn = p[..., :3].max(-1), p[..., :3].min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def luu(p, ten):
    Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(A + ten, optimize=True)
    print('  ->', A + ten)


def nhoe(p, r):  # nhoè nhân-trước-alpha (không viền đen)
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    o = np.stack([nd.gaussian_filter(pm[..., c], r) for c in range(4)], -1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    return o


def lop_sang(p, nguong, hue):
    h, s, v = hsv(p)
    lum = p[..., 0] * 0.3 + p[..., 1] * 0.59 + p[..., 2] * 0.11
    w = np.clip((np.maximum(lum, v * 0.92) - nguong) / (1 - nguong), 0, 1) * p[..., 3]
    if hue:
        a, b = hue
        w *= ((h >= a) & (h <= b) & (s > 0.35)) | ((s < 0.35) if a > 150 else False)  # lăng kính: lõi gần trắng cũng sáng
    w = nd.grey_opening(w, size=3)  # bỏ đốm lẻ 1-2 px (viền phản quang)
    g = p.copy(); g[..., 3] = w
    return nhoe(g, max(2, p.shape[0] / 110))


def tach_vuong_mien(p):
    S = p.shape[0]
    h, s, v = hsv(p)
    a = p[..., 3] > 0.5
    yy = np.arange(S)[:, None] * np.ones((1, S))
    # thân = mảng thạch hồng lớn nhất (lấp lỗ → gồm cả ngọc vàng giữa thân), lấp khuyết chỗ vương miện đè bằng đóng lớn
    hong = a & (((h >= 285) | (h <= 10)) & (s > 0.3) & (v > 0.25))
    lb, n = nd.label(nd.binary_closing(hong, iterations=2))
    to = np.argmax(nd.sum(hong, lb, range(1, n + 1))) + 1
    than_m = nd.binary_fill_holes(lb == to)
    yy_, xx_ = np.mgrid[-S // 12:S // 12 + 1, -S // 12:S // 12 + 1]
    dia = (yy_ ** 2 + xx_ ** 2) <= (S // 12) ** 2
    dong = nd.binary_fill_holes(nd.binary_closing(np.pad(than_m, S // 10), structure=dia))[S // 10:-(S // 10), S // 10:-(S // 10)]
    vien = nd.binary_dilation(than_m, iterations=6) & a & (v < 0.4) & ~(yy < 0)  # viền đen của thân
    than_m = than_m | vien
    vm = nd.binary_opening(a & ~than_m & (yy < S * 0.55), iterations=3)  # bỏ đuôi viền mảnh
    lb, n = nd.label(vm)
    to = np.argmax(nd.sum(vm, lb, range(1, n + 1))) + 1
    vm = nd.binary_fill_holes(lb == to)
    vm = vm | (nd.binary_dilation(vm, iterations=2) & a & ~than_m)
    ys, xs = np.nonzero(vm)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    crown = p.copy(); crown[..., 3] *= vm
    lo = dong & ~than_m  # khuyết dưới vương miện: tô màu thân
    q = p.copy(); q[..., 3] *= than_m
    m = than_m & (h > 280) | (than_m & (h <= 10))
    m &= ~nd.binary_dilation(lo, iterations=1) | m
    for _ in range(200):
        if not (lo & ~m).any(): break
        pm = q[..., :3] * m[..., None]
        sm = sum(np.roll(np.roll(pm, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1))
        cn = sum(np.roll(np.roll(m, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1)).astype(np.float32)
        moi = lo & ~m & (cn > 0)
        q[moi, :3] = sm[moi] / cn[moi][:, None]
        q[moi, 3] = 1
        m |= moi
    neo = ((x0 + x1) / 2 / S, (y1 - (y1 - y0) * 0.22) / S)  # chân vương miện (tỉ lệ ô)
    return q, crown, neo


def doi_tam(p):  # quả cầu lăn: tâm hình tròn (bỏ phần nhô trên đỉnh) về giữa ô
    S = p.shape[0]; a = p[..., 3] > 0.5
    rows = np.nonzero(a.any(1))[0]; cols = np.nonzero(a[int(S * 0.3):].any(0))[0]
    cx = (cols.min() + cols.max()) / 2; r = (cols.max() - cols.min()) / 2
    cy = rows.max() - r
    dx, dy = int(round(S / 2 - cx)), int(round(S / 2 - cy))
    q = np.zeros_like(p)
    q = np.roll(np.roll(p, dy, 0), dx, 1)
    print('  tâm cầu (%.0f,%.0f) r=%.0f/%d (%.3f) dời %d,%d' % (cx, cy, r, S, r / S, dx, dy))
    return q


for id_ in (sys.argv[1:] or CF):
    k, kieu, ng, hue = CF[id_]
    print(id_, kieu)
    p = khung(id_, k)
    if kieu == 'lan': p = doi_tam(p)
    if id_ == 'mad_crown':
        p, vm, neo = tach_vuong_mien(p)
        luu(vm, 'trum_%s_m_vm.png' % id_)
        print('  neo vương miện', neo)
    luu(p, 'trum_%s_m.png' % id_)
    luu(lop_sang(p if id_ != 'mad_crown' else p, ng, hue), 'trum_%s_m_sang.png' % id_)
