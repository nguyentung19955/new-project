#!/usr/bin/env python3
"""Bọ Vỏ Mộc – bước 1: tách nền trắng + cắt 5 mảnh từ art/huong-moi/nguon/quai/bo-vo-moc.png.

Nền: tô loang các điểm "gần trắng" nối với mép khung của từng mảnh (+ lỗ trắng kín lớn); mép mềm theo độ đậm,
khử ám trắng ở mép (tách màu khỏi nền trắng: c = (p − (1−α)·255)/α) → giữ đường viền tối, không quầng trắng.
Ra: ../tam/goc/<ten>.png (độ phân giải gốc, RGBA, cắt sát) + ../tam/goc/hop.json (hộp trong ảnh nguồn).
Chạy: python3 tach.py"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'nguon', 'quai', 'bo-vo-moc.png'))
OUT = os.path.join(ROOT, 'tam', 'goc'); os.makedirs(OUT, exist_ok=True)

a = np.array(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
d = 255 - a.min(2)                   # độ "không trắng"
obj = d > 18
lab, n = nd.label(obj)
sz = nd.sum(obj, lab, range(1, n + 1)); obs = nd.find_objects(lab)
lon = [i for i in np.argsort(-sz) if sz[i] > 5000]
assert len(lon) == 6, len(lon)
# đặt tên theo vị trí (xem ảnh nguồn): nguyên con trái, mai giữa-trên, bụng phải-trên, đầu / chân trước / chân sau hàng dưới
def tam(i): s = obs[i]; return ((s[1].start + s[1].stop) / 2, (s[0].start + s[0].stop) / 2)
ten = {}
for i in lon:
    cx, cy = tam(i)
    if cx < 790: ten[i] = 'nguyen-con'
    elif cy < 450: ten[i] = 'mai' if cx < 1360 else 'bung'
    else: ten[i] = 'dau' if cx < 1100 else ('chan-truoc' if cx < 1400 else 'chan-sau')
hop = {}
for i, t in ten.items():
    s = obs[i]; PAD = 6
    y0, y1, x0, x1 = max(0, s[0].start - PAD), min(H, s[0].stop + PAD), max(0, s[1].start - PAD), min(W, s[1].stop + PAD)
    c = a[y0:y1, x0:x1]; dd = d[y0:y1, x0:x1]
    mine = (lab[y0:y1, x0:x1] == i + 1)
    # nền = điểm gần trắng nối mép khung con (tô loang), cộng lỗ trắng kín > 60 px
    gan_trang = dd <= 40
    L2, _ = nd.label(gan_trang)
    bien = set(np.unique(np.concatenate([L2[0], L2[-1], L2[:, 0], L2[:, -1]]))) - {0}
    nen = np.isin(L2, list(bien))
    L3, n3 = nd.label(gan_trang & ~nen)
    if n3:
        s3 = nd.sum(np.ones_like(dd), L3, range(1, n3 + 1))
        for j, v in enumerate(s3):
            if v > 60 and dd[L3 == j + 1].mean() < 14: nen |= (L3 == j + 1)
    vat = ~nen
    # giữ đúng 1 mảnh (bỏ chấm lẻ, mảnh khác lọt vào khung)
    Lv, nv = nd.label(vat); 
    if nv > 1:
        k = np.argmax(nd.sum(vat, Lv, range(1, nv + 1))) + 1; vat = Lv == k
    # alpha: trong = 1; dải mép (điểm vật kề nền, 2 px) = theo độ đậm
    trong = nd.binary_erosion(vat, iterations=2)
    al = np.where(trong, 1.0, np.where(vat, np.clip((dd - 6) / 70.0, 0, 1), 0.0))
    al = np.maximum(al, np.where(vat & (dd > 60), 1.0, 0))
    al3 = al[..., None]
    col = np.where(al3 > 0.02, (c - (1 - al3) * 255) / np.maximum(al3, 0.02), 0)
    col = np.clip(col, 0, 255)
    rgba = np.dstack([col, al * 255]).round().astype(np.uint8)
    rgba[al <= 0.004] = 0
    # cắt sát
    ys, xs = np.nonzero(al > 0.004)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, t + '.png'))
    hop[t] = [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max() + 1), int(y0 + ys.max() + 1)]
    print(t, hop[t], rgba.shape[1], 'x', rgba.shape[0])
json.dump(hop, open(os.path.join(OUT, 'hop.json'), 'w'), indent=1)
