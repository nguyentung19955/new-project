# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt tấm S8 (5 khung thẻ độ hiếm + khung chỉ huy) và S9 (icon Summon, khay đồng đội 6 ô,
tấm LV, tấm giá, đèn xanh, ruy-băng GROW-UP) → thap/assets/*.png (2× DPR).
Khoá magenta (tach_nen, giữ trong suốt ô cửa sổ), khối liền gán ô lưới 3×2 theo trọng tâm.
Khung thẻ: chuẩn hoá theo Ô CỬA SỔ — cửa sổ của mọi khung nằm đúng cùng 1 hình chữ nhật trong ảnh ra,
nên CSS chỉ cần 1 bộ toạ độ (in ra --kx/--ky/--kw/--kh). Hoạ tiết nhô ra (cánh, vương miện) giữ trong lề trên.
Chạy: python3 tools/thap-cat-s89.py
"""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)


def cat(ten, cols, rows):
    im = tach_nen(Image.open(os.path.join(NGUON, ten)).convert('RGB'), 'tim')
    a = np.asarray(im)[..., 3] > 90
    lab, n = nd.label(nd.binary_dilation(a, iterations=4))
    H, W = a.shape
    o = {}
    for i, sl in enumerate(nd.find_objects(lab)):
        m = a[sl] & (lab[sl] == i + 1)
        if m.sum() < 400: continue
        ys, xs = np.nonzero(m)
        cy, cx = ys.mean() + sl[0].start, xs.mean() + sl[1].start
        k = (min(rows - 1, int(cy / (H / rows))), min(cols - 1, int(cx / (W / cols))))
        bb = [xs.min() + sl[1].start, ys.min() + sl[0].start, xs.max() + sl[1].start + 1, ys.max() + sl[0].start + 1]
        if k in o: b = o[k]; bb = [min(b[0], bb[0]), min(b[1], bb[1]), max(b[2], bb[2]), max(b[3], bb[3])]
        o[k] = bb
    return im, o


def cuaSo(img):
    """Ô cửa sổ = khối trong suốt lớn nhất không chạm mép ảnh."""
    a = np.asarray(img)[..., 3] < 40
    lab, n = nd.label(a)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    best, bs = None, 0
    for i, sl in enumerate(nd.find_objects(lab)):
        if i + 1 in mep or sl is None: continue
        s = int((lab[sl] == i + 1).sum())
        if s > bs: bs, best = s, sl
    return best[1].start, best[0].start, best[1].stop, best[0].stop


# ---------- S8: khung thẻ ----------
# ảnh ra KW×KH (2×): cửa sổ đặt tại WIN; khung được co giãn (sx theo bề ngang cửa sổ, sy theo bề cao cửa sổ)
KW, KH = 132, 160
WIN = (17, 30, 115, 140)  # x0,y0,x1,y1 trong ảnh ra (lề trên rộng hơn: chừa hoạ tiết nhô lên)
TEN8 = {(0, 0): 'trang', (0, 1): 'xanh', (0, 2): 'tim', (1, 0): 'vang', (1, 1): 'do', (1, 2): 'mv'}
im, o = cat('raw_s8.png', 3, 2)
bao = {}
for k, ten in TEN8.items():
    x0, y0, x1, y1 = o[k]
    c = im.crop((x0, y0, x1, y1))
    wx0, wy0, wx1, wy1 = cuaSo(c)
    sx = (WIN[2] - WIN[0]) / (wx1 - wx0); sy = (WIN[3] - WIN[1]) / (wy1 - wy0)
    c2 = c.resize((max(1, round(c.width * sx)), max(1, round(c.height * sy))), Image.LANCZOS)
    out = Image.new('RGBA', (KW, KH))
    out.alpha_composite(c2, (round(WIN[0] - wx0 * sx), round(WIN[1] - wy0 * sy))) if WIN[0] - wx0 * sx >= 0 and WIN[1] - wy0 * sy >= 0 else None
    if WIN[0] - wx0 * sx < 0 or WIN[1] - wy0 * sy < 0:  # phần nhô ra ngoài khung ảnh: cắt bỏ
        dx, dy = round(WIN[0] - wx0 * sx), round(WIN[1] - wy0 * sy)
        tmp = Image.new('RGBA', (KW + 400, KH + 400)); tmp.alpha_composite(c2, (dx + 200, dy + 200)); out = tmp.crop((200, 200, 200 + KW, 200 + KH))
    f = 'the_khung_' + ten + '.png'
    out.save(os.path.join(DICH, f), optimize=True)
    bao[f] = dict(goc=(x1 - x0, y1 - y0), cuaso=(wx1 - wx0, wy1 - wy0), le=(wx0, wy0, (x1 - x0) - wx1, (y1 - y0) - wy1), sx=round(sx, 3), sy=round(sy, 3))

# ---------- S9 ----------
TEN9 = {(0, 0): ('ui_trieu_ic', 96, 96), (0, 1): ('ui_khay_doi', 460, 0), (0, 2): ('ui_lv', 0, 32),
        (1, 0): ('ui_gia', 0, 40), (1, 1): ('ui_den_xanh', 24, 24), (1, 2): ('ui_grow', 0, 28)}
im, o = cat('raw_s9.png', 3, 2)
for k, (ten, w, h) in TEN9.items():
    x0, y0, x1, y1 = o[k]
    c = im.crop((x0, y0, x1, y1))
    if w and h: c2 = c.resize((w, h), Image.LANCZOS)
    elif w: c2 = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
    else: c2 = c.resize((round(c.width * h / c.height), h), Image.LANCZOS)
    c2.save(os.path.join(DICH, ten + '.png'), optimize=True)
    bao[ten] = dict(goc=(x1 - x0, y1 - y0), ra=c2.size)
print(json.dumps(bao, indent=1, default=int))
