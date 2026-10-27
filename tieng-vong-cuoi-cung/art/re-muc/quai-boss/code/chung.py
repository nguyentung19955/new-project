"""Tiện ích dùng chung cho 3 nhân vật mới: quái Nấm Mốc ('nam'), Dơi Chuông ('doi'), boss Mẹ Nấm Mốc ('menam').
Pipeline giống hệt quái chuông gỗ + boss Chuông Gác Làng (art/the-gioi-moi/quai-boss/code/): tách mảnh bằng code từ
ảnh nguồn (không gen ảnh) → rig cha–con → mốc đặt tay → nội suy Hermite không vượt biên → JSON tư thế từng khung.
Hàm font / tách nền trắng / khử viền trắng chép nguyên từ đó (gốc: rig-v2 của Lam).

Đầu ra: Nấm Mốc + Mẹ Nấm Mốc → art/re-muc/quai-boss/ ; Dơi Chuông → art/nhan-vat/doi-chuong/ (cùng một bộ code này).
Ảnh nguồn chép kèm trong code/nguon/ để chạy độc lập."""
import os
import json
import numpy as np
from PIL import Image, ImageFont
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..'))                                  # art/re-muc/quai-boss/
GOC_DOI = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'nhan-vat', 'doi-chuong'))
NGUON = os.path.join(HERE, 'nguon')
NV_DS = ('nam', 'doi', 'menam')
TEN_NV = {'nam': 'Quái Nấm Mốc', 'doi': 'Dơi Chuông', 'menam': 'Boss Mẹ Nấm Mốc'}
GOC_NV = {'nam': GOC, 'menam': GOC, 'doi': GOC_DOI}
SRC = {'nam': os.path.join(NGUON, 'quai-nam-moc.png'), 'doi': os.path.join(NGUON, 'quai-doi-chuong.png'),
       'menam': os.path.join(NGUON, 'boss-me-nam-moc.png')}
SRC_BAO_TU = os.path.join(NGUON, 'bao-tu-cat-tu-re-muc-do-vat.png')
LAM_PNG = os.path.join(NGUON, 'lam-rig-v2-nghi-4x.png')
LAM_JSON = os.path.join(NGUON, 'lam-rig-v2-nghi-4x.json')


def rig_json(nv):
    return os.path.join(GOC_NV[nv], nv + '.json')


def manh_dir(nv):
    return os.path.join(GOC_NV[nv], 'manh', nv)


def xem_dir(nv):
    return os.path.join(GOC_NV[nv], 'xem-thu')


def duong_manh(rel):
    """'manh/<nv>/x.png' (đường dẫn trong JSON, tương đối theo thư mục của nhân vật) → đường dẫn thật."""
    nv = rel.split('/')[1]
    return os.path.join(GOC_NV[nv], rel)


LAM_CAO_LOGIC = 112

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


def load_rgb(path, lat=False):
    a = np.array(Image.open(path).convert('RGB')).astype(np.float64)
    return a[:, ::-1].copy() if lat else a


def white_mask(a, thr=225, sat=22):
    return (a.min(-1) > thr) & ((a.max(-1) - a.min(-1)) < sat)


def background(a):
    """Nền = vùng trắng nối với mép ảnh + lỗ trắng kín bên trong được bao bởi nét đen (vd. lỗ quai chuông)."""
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
        if L[ring].mean() < 90:
            bg |= c
            holes.append(int(c.sum()))
    return bg, holes


def unmix_white(a, fg, band=3.0):
    """Khử viền trắng: alpha = <W−c, W−F> / |W−F|², màu = F (điểm đặc gần nhất). Trả RGBA uint8."""
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


def components(fg, min_px=500, close=0):
    m = nd.binary_closing(fg, iterations=close) if close else fg
    lab, n = nd.label(m)
    res = []
    for i, s in enumerate(nd.find_objects(lab)):
        c = (lab == i + 1) & fg
        if c.sum() >= min_px:
            res.append((s, c))
    return res


def save_json(obj, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)
