"""Hàm dùng chung cho Làng Chuông (lấy từ the-gioi/code/chung.py, đổi đường dẫn):
tách nền trắng, khử viền trắng, đổi cỡ có alpha, đường cắt nhỏ nhất (ghép liền), xếp atlas.
Ảnh nguồn đọc từ ../../nguon-v2/ (ảnh gen), Lam/quái đọc từ sprite sheet có sẵn trong repo."""
import json
import os

import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw, ImageFont

CODE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(CODE)                      # lang-chuong/
NGUON = os.path.normpath(os.path.join(GOC, '..', 'nguon-v2'))
REPO_ART = os.path.normpath(os.path.join(GOC, '..', '..'))   # tieng-vong-cuoi-cung/art
GACH = os.path.join(GOC, 'gach')
DOVAT = os.path.join(GOC, 'do-vat')
NEN = os.path.join(GOC, 'nen')
XEM = os.path.join(GOC, 'xem-thu')

T_LOGIC = 32          # ô gạch logic
BOI = 2               # xuất 2x
T2 = T_LOGIC * BOI    # 64 px ở ảnh xuất
LAM_CAO = 112         # Lam cao 112 px logic
W_LOGIC, H_LOGIC = 960, 540


def font(size, bold=False):
    for p in (['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else []) + [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf',
            'C:/Windows/Fonts/arial.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def doc_rgb(ten):
    return np.array(Image.open(os.path.join(NGUON, ten)).convert('RGB')).astype(np.float64)


# ---------------------------------------------------------------- tách nền trắng
def mat_trang(a, thr=226, sat=24):
    return (a.min(-1) > thr) & ((a.max(-1) - a.min(-1)) < sat)


def nen_trang(a):
    """Nền = vùng trắng nối mép ảnh + lỗ trắng kín được bao bởi nét mực (vd. lỗ quai chuông)."""
    w = mat_trang(a)
    lab, n = nd.label(w)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    edge = edge[edge > 0]
    bg = np.isin(lab, edge)
    L = a.mean(-1)
    for i in range(1, n + 1):
        if i in edge:
            continue
        c = lab == i
        if c.sum() < 6:
            continue
        ring = nd.binary_dilation(c, iterations=3) & ~c
        if L[ring].mean() < 90:
            bg |= c
    return bg


def khu_vien_trang(a, fg, band=3.0):
    """Điểm ảnh sát nền (≤ band px) coi là trộn màu F (điểm 'đặc' gần nhất) với trắng → alpha, màu = F."""
    d_bg = nd.distance_transform_edt(fg)
    solid = fg & (d_bg > band)
    if not solid.any():
        solid = fg & (d_bg > 1)
    _, (iy, ix) = nd.distance_transform_edt(~solid, return_indices=True)
    F = a[iy, ix]
    num = ((255.0 - a) * (255.0 - F)).sum(-1)
    den = ((255.0 - F) ** 2).sum(-1) + 1e-6
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


def tach_vung(a, box, pad=6):
    """Cắt vùng box (x0,y0,x1,y1) của ảnh nguồn, tách nền trắng (flood từ mép vùng), khử viền → RGBA uint8."""
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(a.shape[1], x1 + pad), min(a.shape[0], y1 + pad)
    sub = a[y0:y1, x0:x1]
    bg = nen_trang(sub)
    fg = ~bg
    # bỏ hạt bụi nhỏ lẻ
    lab, n = nd.label(fg)
    if n > 1:
        sz = nd.sum(fg, lab, range(1, n + 1))
        for i, s in enumerate(sz):
            if s < 40:
                fg[lab == i + 1] = False
    return khu_vien_trang(sub, fg), (x0, y0)


# ---------------------------------------------------------------- đổi cỡ có alpha (premultiplied)
def doi_co(rgba, w, h, loc=Image.LANCZOS):
    a = np.asarray(rgba).astype(np.float64)
    al = a[..., 3:4] / 255.0
    pm = np.dstack([a[..., :3] * al, al * 255])
    ch = [np.asarray(Image.fromarray(pm[..., i].astype(np.float32), 'F').resize((w, h), loc)) for i in range(4)]
    o = np.dstack(ch)
    al2 = np.clip(o[..., 3], 0, 255) / 255.0
    rgb = np.where(al2[..., None] > 1e-4, o[..., :3] / np.maximum(al2[..., None], 1e-4), 0)
    out = np.dstack([np.clip(rgb, 0, 255), al2 * 255]).round().astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return out


def premul(a):
    a = a.astype(np.float64)
    return np.dstack([a[..., :3] * a[..., 3:4] / 255.0, a[..., 3]])


# ---------------------------------------------------------------- đường cắt nhỏ nhất (image quilting)
def duong_cat_doc(cost, dau=None, hang=()):
    """cost (h, b): tìm đường đi từ trên xuống, mỗi hàng 1 cột, lệch ≤1 cột/hàng, tổng nhỏ nhất.
    dau: cột cố định ở hàng đầu và hàng cuối (để các ô xếp chồng có cùng điểm nối)."""
    h, b = cost.shape
    c = cost.copy()
    BIG = 1e12
    if dau is not None:
        c[0, :] = BIG
        c[0, dau] = 0
        c[-1, :] = BIG
        c[-1, dau] = 0
        for y in hang:                      # hàng phải đi qua đúng cột dau (mép ô thật, khi ảnh có phần đệm)
            c[y, :] = BIG
            c[y, dau] = 0
    E = c.copy()
    back = np.zeros((h, b), int)
    for y in range(1, h):
        prev = E[y - 1]
        cand = np.stack([np.r_[BIG, prev[:-1]], prev, np.r_[prev[1:], BIG]])
        k = cand.argmin(0)
        E[y] = c[y] + cand[k, np.arange(b)]
        back[y] = np.arange(b) + k - 1
    p = np.zeros(h, int)
    p[-1] = int(E[-1].argmin())
    for y in range(h - 1, 0, -1):
        p[y - 1] = back[y, p[y]]
    return p


def _khac(A, B):
    pa, pb = premul(A), premul(B)
    return np.sqrt(((pa - pb) ** 2).sum(-1))


def thay_le(tile, ref, canh, b, hang=()):
    """Thay dải b px sát cạnh `canh` ('trai','phai','tren','duoi') của tile bằng dải tương ứng của ref,
    nối qua đường cắt nhỏ nhất (đầu/cuối cố định ở giữa dải). Mép ngoài cùng = đúng ref → ghép liền với ô kề."""
    t = tile.copy()
    if canh in ('tren', 'duoi'):
        return thay_le(t.transpose(1, 0, 2), ref.transpose(1, 0, 2), 'trai' if canh == 'tren' else 'phai', b, hang).transpose(1, 0, 2)
    h, w = t.shape[:2]
    if canh == 'phai':
        A, B = t[:, w - b:], ref[:, w - b:]
        p = duong_cat_doc(_khac(A, B), dau=b // 2, hang=hang)
        for y in range(h):
            t[y, w - b + p[y]:] = ref[y, w - b + p[y]:]
    else:
        A, B = t[:, :b], ref[:, :b]
        p = duong_cat_doc(_khac(A, B), dau=b // 2, hang=hang)
        for y in range(h):
            t[y, :p[y] + 1] = ref[y, :p[y] + 1]
    return t


def lap_ngang(img, b, hang=()):
    """Làm ảnh lặp ngang liền (rộng giảm b): dải trái thay bằng dải phải qua đường cắt nhỏ nhất."""
    h, w = img.shape[:2]
    L, R = img[:, :b], img[:, w - b:]
    p = duong_cat_doc(_khac(L, R), dau=b // 2, hang=hang)
    out = img[:, :w - b].copy()
    for y in range(h):
        out[y, :p[y] + 1] = R[y, :p[y] + 1]     # trái đường cắt: lấy phần cuối ảnh (nối tiếp mép phải)
    return out


def lap_doc(img, b, hang=()):
    return lap_ngang(img.transpose(1, 0, 2), b, hang).transpose(1, 0, 2)


# ---------------------------------------------------------------- atlas
def xep_atlas(items, rong=1024, khe=2):
    """items: list (ten, rgba uint8). Xếp theo hàng (shelf), trả (atlas RGBA, {ten: [x,y,w,h]})."""
    items = sorted(items, key=lambda t: -t[1].shape[0])
    x = y = hmax = 0
    pos = {}
    for ten, im in items:
        h, w = im.shape[:2]
        if x + w > rong:
            x, y, hmax = 0, y + hmax + khe, 0
        pos[ten] = [x, y, w, h]
        x += w + khe
        hmax = max(hmax, h)
    H = y + hmax
    H = int(np.ceil(H / 4) * 4)
    at = np.zeros((H, rong, 4), np.uint8)
    for ten, im in items:
        x, y, w, h = pos[ten]
        at[y:y + h, x:x + w] = im
    return at, pos


def luu_png(arr, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr).save(path, optimize=True)


def luu_json(obj, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def dan(dst, src, x, y):
    """Dán RGBA src lên RGBA dst (float hoặc uint8 numpy) tại (x,y) góc trái-trên, alpha 'over'. Trả dst float."""
    d = dst.astype(np.float64) if dst.dtype != np.float64 else dst
    s = src.astype(np.float64)
    h, w = s.shape[:2]
    H, W = d.shape[:2]
    x, y = int(round(x)), int(round(y))
    sx0, sy0 = max(0, -x), max(0, -y)
    dx0, dy0 = max(0, x), max(0, y)
    dx1, dy1 = min(W, x + w), min(H, y + h)
    if dx1 <= dx0 or dy1 <= dy0:
        return d
    ss = s[sy0:sy0 + dy1 - dy0, sx0:sx0 + dx1 - dx0]
    dd = d[dy0:dy1, dx0:dx1]
    sa = ss[..., 3:4] / 255.0
    da = dd[..., 3:4] / 255.0
    oa = sa + da * (1 - sa)
    rgb = (ss[..., :3] * sa + dd[..., :3] * da * (1 - sa)) / np.maximum(oa, 1e-6)
    d[dy0:dy1, dx0:dx1] = np.dstack([rgb, oa * 255])
    return d


def u8(a):
    return np.clip(np.round(a), 0, 255).astype(np.uint8)
