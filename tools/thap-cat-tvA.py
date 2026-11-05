# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh tư vấn toàn bộ §E (raw_tv_Exx.png, nền magenta) cho phần tvA (bộ bài / kho / chân dung) → thap/assets/tv_*.png.
Khoá magenta cả trong lòng khung (khoa_kin: viền alpha mềm, khử trộn hồng) → xén → thu Lanczos về 3× cỡ CSS lớn nhất (không vượt raw).
In ra CỬA SỔ trong suốt (% khung) để css/tvA.css đặt ảnh chân dung đúng dưới cửa sổ. Chạy: python3 tools/thap-cat-tvA.py
Tấm nào chưa có thì bỏ qua."""
import os, json
import numpy as np
from PIL import Image
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(GOC, 'tools/thap-cat-hud2.py'), encoding='utf-8').read()
exec(src[:src.index('# ---------- 01 nút SUMMON')])  # tach_nen, cat, co, luu, cung_khung …
from scipy import ndimage as nd


def khoa_kin(im):
    """RGBA đã khoá viền ngoài → khoá thêm magenta còn trong lòng khung + khử trộn hồng (premultiplied Lanczos sau đó)."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    k = np.clip(1 - (m - 50) / 70, 0, 1)
    a[..., 3] *= k
    du = np.clip(m, 0, None) * (k < 1) * 0.9
    a[..., 0] -= du * 0.5; a[..., 2] -= du * 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def thu(im, w=None, h=None):
    """Lanczos trên ảnh nhân-trước-alpha (không viền tối), không phóng quá raw."""
    iw, ih = im.size
    if w and w >= iw: return im
    if h and h >= ih: return im
    W = w or max(1, round(iw * h / ih)); H = h or max(1, round(ih * w / iw))
    a = np.asarray(im).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]
    ch = [Image.fromarray((a[..., i] * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS) for i in range(4)]
    b = np.stack([np.asarray(c).astype(np.float32) / 255 for c in ch], -1)
    al = np.clip(b[..., 3:4], 1e-4, 1)
    b[..., :3] = np.clip(b[..., :3] / al, 0, 1)
    return Image.fromarray((b * 255).astype(np.uint8), 'RGBA')


def cua_so(im):
    """Cửa sổ trong suốt chứa tâm ảnh → (x0, y0, x1, y1) theo % khung."""
    al = np.asarray(im)[..., 3] < 24
    lab, n = nd.label(al)
    h, w = al.shape
    k = lab[h // 2, w // 2]
    if not k: return None
    ys, xs = np.nonzero(lab == k)
    return [round(xs.min() / w * 100, 1), round(ys.min() / h * 100, 1), round((xs.max() + 1) / w * 100, 1), round((ys.max() + 1) / h * 100, 1)]


def mot(ten):
    """1 hình duy nhất trên nền magenta → RGBA xén sát."""
    im = Image.open(os.path.join(NGUON, ten)).convert('RGB')
    rg = khoa_kin(tach_nen(im, 'tim'))
    return rg.crop(rg.getbbox())


CS = {}
# E07 ô bộ bài TRỐNG · E08 ô bộ bài CÓ ỤI (cùng hình học) — hiển thị 72 css → 216 px
for e, n, g in [('E07', 'tv_o_trong', 'ô bộ bài trống E07'), ('E08', 'tv_o_co', 'ô bộ bài có ụ E08 (cửa sổ trong suốt)')]:
    f = 'raw_tv_%s.png' % e
    if co_tam(f) if 'co_tam' in dir() else os.path.exists(os.path.join(NGUON, f)):
        im = thu(mot(f), w=216); luu(im, n + '.png', g); CS[n] = [im.size, cua_so(im)]
# E12 khung thẻ kho — hiển thị 125 css → 375 px
if os.path.exists(os.path.join(NGUON, 'raw_tv_E12.png')):
    im = thu(mot('raw_tv_E12.png'), w=375); luu(im, 'tv_the.png', 'khung thẻ kho E12'); CS['tv_the'] = [im.size, cua_so(im)]
for x in BAO: print(*x)
print(json.dumps(CS))
