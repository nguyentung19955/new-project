#!/usr/bin/env python3
# TURRET MERGE — ảnh gốc hoạt ảnh bằng code cho 2 trùm NHẢY: freezer + joker_king (quaianim.js TRUM_ANIM_CODE, cùng kiểu mad_crown).
# Không gen ảnh mới: chỉ cắt từ dải đi trum_<id>_8.png.
#   freezer:    trum_freezer_m.png (khung 0)  · _m_sang (bông tuyết lõi, nhoè mềm)  · _m_khoi (2 cụm khói sương 2 bên đáy, cắt từ khung 6)
#   joker_king: trum_joker_king_m.png = HỘP (+ lò xo trong hộp) · _m_nap = NẮP (vòm kim cương đỏ + vương miện + lông) đặt sẵn ở thế ĐÓNG
#               — cắt từ khung 3 (nắp bật trên lò xo), nắp hạ xuống DOWN px để đóng; code nhấc nắp lên → lộ lò xo có sẵn trong hộp.
# Chạy (gốc repo): python3 tools/thap-trum-master-nhay2.py [freezer] [joker_king]
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

A = 'thap/assets/'


def khung(id_, k):
    im = Image.open(A + 'trum_%s_8.png' % id_).convert('RGBA')
    s = im.size[1]
    return np.asarray(im.crop((k * s, 0, k * s + s, s))).astype(np.float32) / 255.0


def luu(p, ten):
    Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(A + ten, optimize=True)
    print('  ->', A + ten)


def nhoe(p, r):  # nhoè nhân-trước-alpha (không viền đen)
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    o = np.stack([nd.gaussian_filter(pm[..., c], r) for c in range(4)], -1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    return o


def lon_nhat(a):  # mảng liền lớn nhất
    lb, n = nd.label(a)
    return lb == (np.argmax(nd.sum(a, lb, range(1, n + 1))) + 1)


def doi(p, dy):  # dời dọc (pixel), phần lòi ra bỏ
    q = np.zeros_like(p)
    if dy >= 0: q[dy:] = p[:p.shape[0] - dy]
    else: q[:dy] = p[-dy:]
    return q


def freezer():
    p = khung('freezer', 0)
    S = p.shape[0]
    luu(p, 'trum_freezer_m.png')
    # lõi bông tuyết: xanh lơ rất sáng, chỉ trong vùng lõi (mặt trước, dưới mái tuyết)
    r, g, b, a = p[..., 0], p[..., 1], p[..., 2], p[..., 3]
    yy, xx = np.mgrid[0:S, 0:S] / S
    w = np.clip((np.minimum(g, b) - 0.78) / 0.2, 0, 1) * (b > r + 0.05) * a
    w *= ((xx - 0.5) ** 2 / 0.2 ** 2 + (yy - 0.73) ** 2 / 0.17 ** 2) < 1
    w = nd.grey_opening(w, size=3)
    gl = p.copy(); gl[..., :3] = np.clip(p[..., :3] * 0.6 + np.array([0.55, 0.95, 1.0]) * 0.5, 0, 1); gl[..., 3] = w
    luu(nhoe(gl, max(2, S / 110)), 'trum_freezer_m_sang.png')
    # khói sương lúc chạm đất: 2 cụm trắng-xanh 2 bên đáy ở khung 6 (ngoài thân)
    q = khung('freezer', 6)
    a6 = q[..., 3] > 0.3
    than = nd.binary_dilation(lon_nhat(a6 & (yy < 0.78)), iterations=3)
    k = a6 & ~than & (yy > 0.72) & ((xx < 0.24) | (xx > 0.76))
    k = nd.binary_dilation(k, iterations=2) & (q[..., 3] > 0.02)
    kh = q.copy(); kh[..., 3] *= k
    luu(kh, 'trum_freezer_m_khoi.png')


DOWN = 66  # khung 3: đáy nắp ~y196 → hạ 66 px phủ kín miệng hộp (ảnh 394 px)


def joker_king():
    p = khung('joker_king', 3)
    S = p.shape[0]
    a = p[..., 3] > 0.5
    chinh = nd.binary_dilation(lon_nhat(a), iterations=2)  # bỏ các vạch "rung" vàng 2 bên
    yy = np.arange(S)[:, None] * np.ones((1, S))
    cat = int(S * 197 / 394)
    # viền tối đáy nắp (cat..cat+10, ngoài khe lò xo giữa) thuộc NẮP, không để lại vạch đen trên miệng hộp
    xx = np.arange(S)[None, :] * np.ones((S, 1))
    toi = p[..., :3].max(-1) < 0.3
    vien = (yy >= cat) & (yy < cat + int(S * 0.026)) & toi & ((xx < S * 0.34) | (xx > S * 0.67))
    nap = p.copy(); nap[..., 3] *= chinh & ((yy < cat) | vien)
    hop = p.copy(); hop[..., 3] *= chinh & (yy >= cat) & ~vien
    d = int(round(DOWN * S / 394))
    nap = doi(nap, d)
    # căn cả cụm (hộp + nắp đóng) về đúng khung dải đi khung 0: đáy trùng nhau
    a0 = khung('joker_king', 0)[..., 3] > 0.5
    day0 = np.nonzero(a0.any(1))[0].max()
    day = np.nonzero((hop[..., 3] > 0.5).any(1))[0].max()
    nap, hop = doi(nap, day0 - day), doi(hop, day0 - day)
    ys = np.nonzero((nap[..., 3] > 0.5).any(1))[0]
    print('  nắp y %d..%d, hộp đáy %d (S=%d) → neo nắp (đáy giữa) = %.3f' % (ys.min(), ys.max(), day0, S, ys.max() / S))
    luu(hop, 'trum_joker_king_m.png')
    luu(nap, 'trum_joker_king_m_nap.png')


for id_ in (sys.argv[1:] or ['freezer', 'joker_king']):
    print(id_)
    {'freezer': freezer, 'joker_king': joker_king}[id_]()
