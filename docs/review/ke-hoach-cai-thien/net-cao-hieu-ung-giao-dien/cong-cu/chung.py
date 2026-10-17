"""Dùng chung cho phiên NÉT CAO — HIỆU ỨNG + GIAO DIỆN (17/10).
- PHAM_VI: danh sách mã thuộc phiên này (hu-*, gd-* giao diện, vp-*), trừ vệt kiếm nặng (phiên máy) và gd-* nền/sàn/làng/cửa (phiên nền).
- doc_tam(ma): (tệp json, ảnh RGBA numpy) của ảnh đang dùng.
- khung(d, a): danh sách (tên, ô ảnh, (x, y) chỗ trong tấm) theo khung_rong/khung_cao/net; ảnh tĩnh = 1 khung.
- tach_nen(a): ảnh gốc AI → RGBA float (nền xanh #00FF00 / nền một màu → alpha), ảnh đã có alpha giữ nguyên.
"""
import base64, glob, io, json, os, re
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
CUS = os.path.join(REPO, 'game', 'art', 'custom')
RA = os.path.join(HERE, 'ra')
os.makedirs(RA, exist_ok=True)

# gd-* KHÔNG thuộc phiên này (nền / sàn / đấu trường / làng / cửa / trang trí phòng / vật trong phòng)
NGOAI = re.compile(r'^gd-(nen|lang|cua|cot-nang|tt|vat|tham-lau|bia-gach|loi-mon|song-cau|trong-dong)(-|$)')


def pham_vi():
    ds = []
    for f in sorted(glob.glob(os.path.join(CUS, '*.sprite.json'))):
        m = os.path.basename(f)[:-12]
        if not re.match(r'(hu|gd|vp)-', m):
            continue
        if m.startswith('hu-chem-kiem-nang') or NGOAI.match(m) or m.endswith('-netcu') or m.endswith('-muotcu'):
            continue
        ds.append(m)
    return ds


def doc_tam(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    s = d.get('tam') or d.get('anh')
    a = np.array(Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA'))
    return d, a


def net_cua(d):
    n = d.get('net')
    return 1 if n is None else max(1, min(4, int(round(float(n)))))


def khung(d, a):
    n = net_cua(d)
    if d.get('khung_rong') and d.get('khung_cao'):
        fw, fh = int(round(d['khung_rong'] * n)), int(round(d['khung_cao'] * n))
        cot = max(1, a.shape[1] // fw); hang = max(1, a.shape[0] // fh)
        so = d.get('so') or cot * hang
        out = []
        for i in range(int(so)):
            c, r = i % cot, i // cot
            if r >= hang:
                break
            out.append(('k%d' % i, a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw], (c * fw, r * fh)))
        return out
    return [('k0', a, (0, 0))]


def tach_nen(a):
    """→ float32 RGBA 0..1 (màu KHÔNG nhân alpha)."""
    a = np.asarray(a)
    if a.ndim == 2:
        a = np.stack([a] * 3, -1)
    if a.shape[2] == 4 and (a[..., 3] < 250).mean() > 0.03:
        return a.astype(np.float32) / 255.0
    rgb = a[..., :3].astype(np.float32)
    H, W = rgb.shape[:2]
    bien = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    nen = np.median(bien, 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if nen[1] > 180 and nen[0] < 90 and nen[2] < 90:  # nền xanh lục
        al = 1 - np.clip((g - np.maximum(r, b)) / 245.0, 0, 1)
        al = np.clip((al - 0.04) / 0.96, 0, 1)
        c = (rgb - (1 - al[..., None]) * nen) / np.maximum(al[..., None], 1e-3)
        c = np.clip(c, 0, 255)
        # điểm còn ám xanh sát nền: khử ám (lục không vượt max(đỏ, lam) nhiều)
        gm = np.maximum(c[..., 0], c[..., 2]) + 40
        c[..., 1] = np.where((al < 0.95) & (c[..., 1] > gm), gm, c[..., 1])
    else:
        dist = np.sqrt(((rgb - nen) ** 2).sum(-1))
        al = np.clip((dist - 18) / 50.0, 0, 1)
        c = rgb
    out = np.concatenate([c / 255.0, al[..., None]], -1).astype(np.float32)
    return out


def png(a):
    b = io.BytesIO(); Image.fromarray(a).save(b, 'PNG', optimize=True); return b.getvalue()
