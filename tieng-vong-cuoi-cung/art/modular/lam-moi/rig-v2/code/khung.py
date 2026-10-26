"""Khung hình CỐ ĐỊNH dùng chung cho mọi ảnh duyệt / GIF / contact sheet: cùng gốc (root), cùng canvas, cùng đường
đất. Hệ số 112 px = 112 / (cao dáng nghỉ: đỉnh mũ → đất). Đường đất rơi đúng ranh giới hàng điểm ảnh ở 112 px.
Vạch đất trôi sang trái đúng tốc độ đất (cùng tốc độ ủng chịu lực lùi) → nhìn chân có bám đất không."""
import numpy as np
from PIL import Image, ImageDraw
from chung import CAO_LOGIC
from rig import render

NEN = (238, 240, 244)
DAT = (196, 60, 60)
VACH = (90, 96, 110)
GOC_MAU = (60, 130, 220)
KHUNG_VIEN = (150, 155, 165)
BUOC_VACH = 200.0          # px thế giới giữa hai vạch đất (= 1/4 quãng đất trôi mỗi chu kỳ → vòng lặp liền)


def alpha_box(im, thr=8):
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def khung_co_dinh(doc):
    rig = doc['rig']
    ground = rig['mat_dat_y']
    big = (-300.0, -200.0, 1600.0, 1400.0)
    s = 0.25
    poses = [doc['tu_the_nghi']] + [doc['tu_the'][n] for n in doc['tu_the']] + doc['chu_ky']['khung']
    boxes = []
    for p in poses:
        im = render(rig, p, big, s)
        x0, y0, x1, y1 = alpha_box(im)
        boxes.append((x0 / s + big[0], y0 / s + big[1], x1 / s + big[0], y1 / s + big[1]))
    im = render(rig, doc['tu_the_nghi'], big, 1.0)
    rx0, ry0, rx1, ry1 = alpha_box(im, 128)
    top = ry0 + big[1]
    H_char = ground - top
    k = CAO_LOGIC / H_char
    m = 50
    fx0 = min(b[0] for b in boxes) - m
    fx1 = max(b[2] for b in boxes) + m
    fy0 = min(b[1] for b in boxes) - m
    fy1 = ground + 90
    fy0 = ground - np.ceil((ground - fy0) * k) / k
    fy1 = ground + np.ceil((fy1 - ground) * k) / k
    fx1 = fx0 + np.ceil((fx1 - fx0) * k) / k
    size112 = (int(round((fx1 - fx0) * k)), int(round((fy1 - fy0) * k)))
    return {'khung': (float(fx0), float(fy0), float(fx1), float(fy1)), 'k112': float(k), 'cao_nghi': float(H_char),
            'co_112': size112, 'dat_112': int(round((ground - fy0) * k)), 'dat': ground,
            'goc_x': rig['goc_the_gioi'][0]}


def nen(K, scale, pha=None, v_dat=0.0, vach=True):
    """Nền + đường đất (+ vạch đất trôi theo pha) ở tỉ lệ 'scale' so với thế giới."""
    x0, y0, x1, y1 = K['khung']
    W, H = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    c = Image.new('RGB', (W, H), NEN)
    d = ImageDraw.Draw(c)
    gy = (K['dat'] - y0) * scale
    day = max(1.0, scale / K['k112'])                       # 1 px logic
    d.rectangle([0, gy, W, gy + day - 0.01], fill=DAT)
    if vach:
        off = -(v_dat * (pha or 0.0)) % BUOC_VACH
        xw = x0 - (x0 % BUOC_VACH) + off - BUOC_VACH
        while xw < x1 + BUOC_VACH:
            X = (xw - x0) * scale
            d.rectangle([X, gy + day, X + 2 * day - 0.01, gy + 4 * day - 0.01], fill=VACH)
            xw += BUOC_VACH
    # dấu gốc (root) cố định: tam giác nhỏ dưới đất
    X = (K['goc_x'] - x0) * scale
    d.polygon([(X, gy + 5 * day), (X - 2 * day, gy + 8 * day), (X + 2 * day, gy + 8 * day)], fill=GOC_MAU)
    return c


def ghep(nen_img, nv):
    c = nen_img.convert('RGBA')
    c.alpha_composite(nv)
    return c.convert('RGB')


def bong(im):
    a = np.array(im)
    out = np.zeros_like(a)
    out[..., 3] = a[..., 3]
    return Image.fromarray(out, 'RGBA')


def thu_nho(im, size):
    """thu nhỏ RGBA có nhân alpha trước (premultiplied) – LANCZOS."""
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def ve_khung(doc, K, pose, scale=1.0, toi=None, an=()):
    return render(doc['rig'], pose, K['khung'], scale, toi=toi, an=an)


def anh_112(doc, K, pose, pha=None, toi=None, silhouette=False, vach=True):
    """Ảnh 112 px logic 1:1: vẽ ở 1:1 thế giới (nền + vạch đất cùng tỉ lệ) rồi thu nhỏ một lần."""
    nv = ve_khung(doc, K, pose, 1.0, toi=toi)
    if silhouette:
        nv = bong(nv)
    v = doc['chu_ky']['van_toc_dat_px_moi_chu_ky']
    full = ghep(nen(K, 1.0, pha, v, vach=vach and pha is not None), nv)
    return full.resize(K['co_112'], Image.LANCZOS), nv
