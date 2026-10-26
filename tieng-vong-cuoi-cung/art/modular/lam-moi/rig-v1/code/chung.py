"""Tiện ích dùng chung rig-v1: đường dẫn (tương đối theo vị trí file → chạy độc lập), font, tách nền trắng."""
import os
import json
import numpy as np
from PIL import Image, ImageFont
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
RIG = os.path.normpath(os.path.join(HERE, '..'))            # lam-moi/rig-v1
LAM_MOI = os.path.normpath(os.path.join(RIG, '..'))         # lam-moi
MANH = os.path.join(RIG, 'manh')
TU_THE = os.path.join(RIG, 'tu-the')
JSON_PATH = os.path.join(RIG, 'lam-moi.json')
SRC_NGANG = os.path.join(LAM_MOI, '2-nhin-ngang.png')
SRC_BANG = os.path.join(LAM_MOI, '3-bang-manh.png')
SRC_CHEO = os.path.join(LAM_MOI, '1-mau-chuan-nhin-cheo.png')
V5_BANG = os.path.normpath(os.path.join(LAM_MOI, '..', 'lam', 'cutout-v5', 'tu-the', '01-bang-duyet.png'))

# Kích thước game: Lam cao 112 px logic; iPhone ~2,17 px thiết bị / px logic.
CAO_LOGIC = 112
HE_SO_THIET_BI = 2.17

_FONT_DIRS = ['/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/dejavu', '/usr/share/fonts/TTF',
              '/Library/Fonts', '/System/Library/Fonts/Supplemental', 'C:/Windows/Fonts', HERE]


def font(size, bold=False):
    names = (['DejaVuSans-Bold.ttf', 'Arial Bold.ttf', 'arialbd.ttf'] if bold
             else ['DejaVuSans.ttf', 'Arial.ttf', 'arial.ttf'])
    for d in _FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.isfile(p):
                try:
                    return ImageFont.truetype(p, size)
                except OSError:
                    pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def load_rgb(path):
    return np.array(Image.open(path).convert('RGB')).astype(np.float64)


def white_mask(a, thr=225, sat=22):
    return (a.min(-1) > thr) & ((a.max(-1) - a.min(-1)) < sat)


def background(a):
    """Nền = vùng trắng nối với mép ảnh (flood-fill qua connected components)
    + lỗ trắng kín bên trong được bao bởi nét đen (vd. lỗ quai chuông)."""
    w = white_mask(a)
    lab, n = nd.label(w)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    edge = edge[edge > 0]
    bg = np.isin(lab, edge)
    holes = []
    L = a.mean(-1)
    for i in range(1, n + 1):
        if i in edge:
            continue
        c = lab == i
        if c.sum() < 6:
            continue
        ring = nd.binary_dilation(c, iterations=3) & ~c
        if L[ring].mean() < 90:           # lỗ bao quanh bởi nét mực → trong suốt
            bg |= c
            holes.append(int(c.sum()))
    return bg, holes


def unmix_white(a, fg, band=3.0):
    """Khử viền trắng: điểm ảnh sát nền (≤ band px) coi là trộn màu F (điểm 'đặc' gần nhất) với trắng.
    alpha = <W−c, W−F> / |W−F|², màu = F. Trả RGBA uint8."""
    d_bg = nd.distance_transform_edt(fg)
    solid = fg & (d_bg > band)
    if not solid.any():
        solid = fg & (d_bg > 1)
    _, (iy, ix) = nd.distance_transform_edt(~solid, return_indices=True)
    F = a[iy, ix]
    W = 255.0
    num = ((W - a) * (W - F)).sum(-1)
    den = ((W - F) ** 2).sum(-1) + 1e-6
    al = np.clip(num / den, 0, 1)
    edge = fg & ~solid
    rgb = a.copy()
    rgb[edge] = F[edge]
    alpha = np.where(solid, 1.0, np.where(edge, al, 0.0))
    alpha[alpha > 0.97] = 1.0
    alpha[alpha < 0.03] = 0.0
    out = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    out[alpha == 0] = 0
    return out


def components(fg, min_px=500, close=2):
    """Các mảnh rời (mỗi connected component) → list (bbox, mask_full)."""
    m = nd.binary_closing(fg, iterations=close) if close else fg
    lab, n = nd.label(m)
    res = []
    for i, s in enumerate(nd.find_objects(lab)):
        c = (lab == i + 1) & fg
        if c.sum() >= min_px:
            res.append((s, c))
    return res


def bbox_alpha(img, thr=8):
    a = np.array(img)[..., 3]
    ys, xs = np.nonzero(a > thr)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def save_json(obj, path=JSON_PATH):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def load_json(path=JSON_PATH):
    with open(path, encoding='utf-8') as f:
        return json.load(f)
