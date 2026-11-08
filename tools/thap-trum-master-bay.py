#!/usr/bin/env python3
# TURRET MERGE — ẢNH GỐC + PHẦN RỜI cho 4 trùm LƠ LỬNG vẽ bằng code (quaianim.js TRUM_ANIM_CODE, nền 'bay' của prism).
# Cắt từ 1 khung dải đi trum_<id>_8.png (không gen ảnh mới, không thêm tay/mắt):
#   nightmare : trum_nightmare_m.png (thân) + _m_sang (lõi mắt đỏ)
#   twin_core : _m = khối nối phía sau (cột giữa, mép mờ) · _m_p0 / _m_p1 = vòng lõi trái / phải đủ tròn (nửa ngoài lật gương)
#               _m_p2 = tia sét nối 2 lõi (code kéo giãn theo khoảng cách 2 lõi) → tách ra – khép vào, quỹ đạo ngược pha
#   janus     : _m = khối lập phương (lục giác) ; _m_p0 = 8 mảnh bay quanh (4 kim cương vàng + 4 mảnh đá) — hộp từng mảnh in ra để chép vào cấu hình
#   octopus   : _m = chậu đá (dưới đường cắt) ; _m_p0 = hoa lửa (trên đường cắt) → code uốn lắc (neo ở mép chậu)
# Chạy (gốc repo): python3 tools/thap-trum-master-bay.py [id ...]
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

A = 'thap/assets/'
# id: (khung, ngưỡng sáng lớp glow, hue glow (độ), lấy cả điểm gần trắng)
CF = {
    'nightmare': (4, 0.62, (330, 25), 0),
    'twin_core': (4, 0.70, (320, 30), 1),
    'janus': (0, 0.78, (35, 62), 0),
    'octopus': (0, 0.72, (35, 64), 1),
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


def nhoe(p, r):
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    o = np.stack([nd.gaussian_filter(pm[..., c], r) for c in range(4)], -1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    return o


def lop_sang(p, nguong, hue, trang):
    h, s, v = hsv(p)
    lum = p[..., 0] * 0.3 + p[..., 1] * 0.59 + p[..., 2] * 0.11
    w = np.clip((np.maximum(lum, v * 0.92) - nguong) / (1 - nguong), 0, 1) * p[..., 3]
    a, b = hue
    trong = (h >= a) & (h <= b) if a < b else (h >= a) | (h <= b)
    w *= (trong & (s > 0.3)) | ((s < 0.25) & bool(trang))  # tia/lõi gần trắng cũng sáng
    w = nd.grey_opening(w, size=3)
    g = p.copy(); g[..., 3] = w
    return nhoe(g, max(2, p.shape[0] / 110))


def cat(p, m):
    q = p.copy(); q[..., 3] *= m
    return q


def twin(p):
    # 2 vòng lõi ĐỦ TRÒN: nửa ngoài của mỗi vòng (không dính khối nối) lật gương sang nửa trong → tách/khép không lộ mép cắt
    S = p.shape[0]
    h, s_, v = hsv(p)
    a = p[..., 3] > 0.5
    do = a & (p[..., 0] > 0.7) & (p[..., 1] < 0.45) & (p[..., 2] < 0.55)
    lb, n = nd.label(do)
    hai = np.argsort(nd.sum(do, lb, range(1, n + 1)))[::-1][:2] + 1
    cs = sorted(nd.center_of_mass(do, lb, i) for i in hai)
    cs = sorted(cs, key=lambda c: c[1])
    cL, cR = int(round(cs[0][1])), int(round(cs[1][1]))
    cy = (cs[0][0] + cs[1][0]) / 2
    xs = np.nonzero(a.any(0))[0]
    Rr = max(cL - xs.min(), xs.max() - cR) + 2
    def vong(c, ben):
        q = np.zeros_like(p)
        for x in range(max(0, c - Rr), min(S, c + Rr + 1)):
            src = x if (x - c) * ben >= 0 else 2 * c - x
            if 0 <= src < S: q[:, x] = p[:, src]
        return q
    L, R = vong(cL, -1), vong(cR, 1)
    # khối nối phía sau (tam giác, đai giữa, khối dưới): cột giữa, mép mờ
    xx = np.arange(S)[None, :] * np.ones((S, 1))
    mid = (cL + cR) / 2
    w0, f = S * 0.09, S * 0.045
    cot = np.clip((w0 + f - np.abs(xx - mid)) / f, 0, 1); cot = cot * cot * (3 - 2 * cot)
    # tia sét nối 2 lõi (sắc nét): điểm rất sáng trong dải ngang qua 2 tâm
    yy = np.arange(S)[:, None] * np.ones((1, S))
    lum = p[..., 0] * 0.3 + p[..., 1] * 0.59 + p[..., 2] * 0.11
    dai = (np.abs(yy - cy) < S * 0.07) & (xx > cL - S * 0.03) & (xx < cR + S * 0.03)
    tw = np.clip((lum - 0.62) / 0.2, 0, 1) * dai * p[..., 3]
    tia = p.copy(); tia[..., 3] = nd.gaussian_filter(tw, 0.6)
    print('  tâm lõi x=%d,%d y=%.0f (%.3f, %.3f, %.3f) bán kính vòng %d' % (cL, cR, cy, cL / S, cR / S, cy / S, Rr))
    return cat(p, cot), L, R, tia


def janus(p):
    S = p.shape[0]
    a = p[..., 3] > 0.5
    r = int(S * 0.075)
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    loi = nd.binary_opening(a, structure=(yy ** 2 + xx ** 2) <= r * r)
    lb, n = nd.label(loi)
    loi = lb == (np.argmax(nd.sum(loi, lb, range(1, n + 1))) + 1)
    ys, xs = np.nonzero(loi)
    P = np.stack([xs, ys], 1).astype(np.float64)
    # lục giác: 6 nửa mặt phẳng; mỗi pháp tuyến dò ±14° để ôm sát nhất (mở hình giữ nguyên cạnh thẳng)
    nm = []
    for g0 in (0, 60, 120, 180, 240, 300):
        best = None
        for dg in np.arange(-14, 14.5, 0.5):
            th = np.radians(g0 + dg); n_ = np.array([np.cos(th), np.sin(th)])
            hh = (P @ n_).max()
            # độ hở: số điểm sát cạnh (càng nhiều càng đúng hướng cạnh)
            sat = ((P @ n_) > hh - 1.5).sum()
            if best is None or sat > best[0]: best = (sat, n_, hh)
        nm.append(best[1:])
    Y, X = np.mgrid[0:S, 0:S]
    hx = np.ones((S, S), bool)
    for n_, hh in nm: hx &= (X * n_[0] + Y * n_[1]) <= hh + 2.5
    khoi = a & hx
    manh = a & ~khoi
    manh = nd.binary_opening(manh, iterations=1)
    lb, n = nd.label(manh)
    sz = nd.sum(manh, lb, range(1, n + 1))
    giu = [i + 1 for i in range(n) if sz[i] > S * S * 0.004]
    mm = np.isin(lb, giu)
    mm = mm | (nd.binary_dilation(mm, iterations=1) & (p[..., 3] > 0.02) & ~khoi)
    hop = []
    for i in giu:
        ys, xs = np.nonzero(nd.binary_dilation(lb == i, iterations=2))
        hop.append([round(float(v), 3) for v in (xs.min() / S, ys.min() / S, (xs.max() + 1) / S, (ys.max() + 1) / S)])
    cx, cy = (np.nonzero(khoi)[1].mean() / S, np.nonzero(khoi)[0].mean() / S)
    am = (p[..., 3] > 0) & ~khoi & ~mm
    print('  khối tâm (%.3f, %.3f), %d mảnh; điểm ảnh bỏ ngoài: %d' % (cx, cy, len(giu), int(am.sum())))
    print('  hop:', hop)
    th = cat(p, (p[..., 3] > 0) & ~mm)
    return th, cat(p, mm), (round(cx, 3), round(cy, 3)), hop


def octopus(p):
    S = p.shape[0]
    h, s, v = hsv(p)
    a = p[..., 3] > 0.5
    # mép chậu: hàng đầu tiên (nửa dưới) mà bề ngang thân thu về ≈ bề ngang chậu (cánh hoa xoè rộng hơn chậu)
    wc = a[int(S * 0.8)].sum()
    cut = min(y for y in range(S // 2, S) if a[y].sum() <= wc * 1.1)
    cy = cut / S
    Y = np.arange(S)[:, None] * np.ones((1, S))
    tren = (Y < cut).astype(np.float32)
    print('  đường cắt chậu y=%d (%.3f)' % (cut, cy))
    return cat(p, 1 - tren), cat(p, tren), round(cy, 3)


for id_ in (sys.argv[1:] or CF):
    k, ng, hue, tr = CF[id_]
    print(id_)
    p = khung(id_, k)
    if id_ != 'janus': luu(lop_sang(p, ng, hue, tr), 'trum_%s_m_sang.png' % id_)
    if id_ == 'twin_core':
        cot, l, r, tia = twin(p)
        luu(cot, 'trum_%s_m.png' % id_); luu(l, 'trum_%s_m_p0.png' % id_); luu(r, 'trum_%s_m_p1.png' % id_); luu(tia, 'trum_%s_m_p2.png' % id_)
    elif id_ == 'janus':
        th, mm, c, hop = janus(p)
        luu(th, 'trum_%s_m.png' % id_); luu(mm, 'trum_%s_m_p0.png' % id_)
        luu(lop_sang(th, ng, hue, tr), 'trum_%s_m_sang.png' % id_)  # chỉ sao trên khối (mảnh bay rời → không để quầng đứng yên)
    elif id_ == 'octopus':
        chau, hoa, cy = octopus(p)
        luu(chau, 'trum_%s_m.png' % id_); luu(hoa, 'trum_%s_m_p0.png' % id_)
    else:
        luu(p, 'trum_%s_m.png' % id_)
