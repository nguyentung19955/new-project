"""Tiện ích dùng chung cho rig Lam "Cổ tích chuông tàn": đường dẫn, font, tách nền trắng, khử viền trắng,
biến đổi affine + vẽ mảnh (PIL, lọc song tuyến), trộn alpha.
Tách nền / khử viền chép từ art/modular/lam-moi/rig-v4/code/chung.py (đã dùng ổn)."""
import os
import json
import math
import numpy as np
from PIL import Image, ImageFont
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
RIG = os.path.normpath(os.path.join(HERE, '..'))              # art/huong-moi/lam-rig
HM = os.path.normpath(os.path.join(RIG, '..'))                # art/huong-moi
NGUON = os.path.join(HM, 'nguon')
SRC_CHOT = os.path.join(NGUON, 'lam-moi-chuong-tan.png')      # ảnh đã chốt (dáng ráp hoàn chỉnh)
SRC_BANG = os.path.join(NGUON, 'lam-moi-manh.png')            # bảng 13 mảnh rời
MANH = os.path.join(RIG, 'manh')
KIEM = os.path.join(RIG, 'kiem')
CLIP = os.path.join(RIG, 'clip')
SPRITE = os.path.join(RIG, 'sprite')
GIF = os.path.join(RIG, 'gif')
RIG_JSON = os.path.join(RIG, 'lam-chuong-tan.json')
REPO = os.path.normpath(os.path.join(HM, '..', '..'))         # thư mục tieng-vong-cuoi-cung
GAME = os.path.join(REPO, 'game')

CAO_LOGIC = 112          # Lam cao 112 px logic (dáng nghỉ)
PX_NGUON_MOI_LOGIC = 2   # sheet 2x: 224 px nguồn = 112 px logic
FPS = 60

_FONT_DIRS = ['/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/dejavu', '/usr/share/fonts/TTF', HERE]


def font(size, bold=False):
    names = ['DejaVuSans-Bold.ttf'] if bold else ['DejaVuSans.ttf']
    for d in _FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.isfile(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def load_rgb(path):
    return np.array(Image.open(path).convert('RGB')).astype(np.float64)


def white_mask(a, thr=225, sat=22):
    return (a.min(-1) > thr) & ((a.max(-1) - a.min(-1)) < sat)


def background(a, hole_min=6):
    """Nền = vùng trắng nối mép ảnh (flood-fill) + lỗ trắng kín được bao bởi nét mực."""
    w = white_mask(a)
    lab, n = nd.label(w)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    edge = edge[edge > 0]
    bg = np.isin(lab, edge)
    L = a.mean(-1)
    for i, s in enumerate(nd.find_objects(lab)):
        if (i + 1) in edge or s is None:
            continue
        c = lab[s] == i + 1
        if c.sum() < hole_min:
            continue
        ring = nd.binary_dilation(np.pad(c, 4), iterations=3)[4:-4, 4:-4] & ~c
        if L[s][ring].mean() < 110:
            bg[s] |= c
    return bg


def unmix_white(a, fg, band=3.0):
    """Khử viền trắng: điểm sát nền (≤ band px) = trộn màu F (điểm đặc gần nhất) với trắng.
    alpha = <W−c, W−F>/|W−F|², màu = F → không còn quầng trắng."""
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


def components(fg, min_px=200, close=2):
    m = nd.binary_closing(fg, iterations=close) if close else fg
    lab, n = nd.label(m)
    res = []
    for i, s in enumerate(nd.find_objects(lab)):
        c = (lab == i + 1) & fg
        if c.sum() >= min_px:
            res.append((s, c))
    return res


# ---------- biến đổi 2D ----------
def mat(tx=0.0, ty=0.0, rot=0.0, sx=1.0, sy=None):
    """Ma trận 3×3: dịch(tx,ty) · xoay(rot độ) · co(sx,sy)."""
    if sy is None:
        sy = sx
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    return np.array([[c * sx, -s * sy, tx], [s * sx, c * sy, ty], [0, 0, 1.0]])


def T(tx, ty):
    return np.array([[1, 0, tx], [0, 1, ty], [0, 0, 1.0]])


def R(deg):
    return mat(rot=deg)


def S(sx, sy=None):
    return mat(sx=sx, sy=sy)


def ap(M, x, y):
    v = M @ np.array([x, y, 1.0])
    return float(v[0]), float(v[1])


def ve_manh(canvas_size, img, M):
    """Vẽ ảnh RGBA (PIL) với ma trận M (toạ độ mảnh → toạ độ canvas) lên canvas rỗng; trả mảng float premultiplied."""
    Minv = np.linalg.inv(M)
    coeffs = (Minv[0, 0], Minv[0, 1], Minv[0, 2], Minv[1, 0], Minv[1, 1], Minv[1, 2])
    pm = premul(img)
    out = pm.transform(canvas_size, Image.AFFINE, coeffs, resample=Image.BICUBIC)
    return np.asarray(out).astype(np.float32) / 255.0


def premul(img):
    a = np.asarray(img).astype(np.float32)
    a[..., :3] *= a[..., 3:4] / 255.0
    return Image.fromarray(a.round().clip(0, 255).astype(np.uint8), 'RGBA')


def over(dst, src):
    """dst, src: float premultiplied RGBA. src đè lên dst."""
    return src + dst * (1.0 - src[..., 3:4])


def unpremul(arr):
    a = arr[..., 3:4]
    rgb = np.where(a > 1e-6, arr[..., :3] / np.maximum(a, 1e-6), 0)
    out = np.concatenate([rgb, a], -1)
    return Image.fromarray((out * 255).round().clip(0, 255).astype(np.uint8), 'RGBA')


def luu_json(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def doc_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)
