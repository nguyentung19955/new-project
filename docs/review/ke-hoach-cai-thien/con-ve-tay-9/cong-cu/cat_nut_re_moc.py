#!/usr/bin/env python3
"""Cắt docs/anh-goc/ve-tay-8-gop/hu-nut-re-moc.png (4 khung nứt đất hình sao, nền #00FF00) thành
game/art/custom/hu-nut-re-moc.sprite.json: mỗi khung ép dẹt theo chiều dọc thành elip 160 x 60 (nhìn từ trên).

- Tách khung theo cột nền xanh. Mọi khung dùng chung một ô (tâm sao ở giữa, cỡ theo khung lớn nhất) để khung sau to dần.
- Ngang: lấy điểm gần nhất (nearest neighbor). Dọc: ép ~9,5 lần, mỗi điểm ra lấy màu nứt nhiều nhất trong dải dọc nguồn
  (vẫn là màu có sẵn, không pha) để nét nứt ngang không bị mất khi ép.
- Bỏ nền xanh, màu gom về 4 màu nâu của ảnh (k-means).
Chạy: python3 docs/review/ke-hoach-cai-thien/con-ve-tay-9/cong-cu/cat_nut_re_moc.py [ảnh xem thử.png]
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
SRC = os.path.join(GOC, 'docs/anh-goc/ve-tay-8-gop/hu-nut-re-moc.png')
OUT = os.path.join(GOC, 'game/art/custom/hu-nut-re-moc.sprite.json')
FW, FH = 160, 60

a = np.array(Image.open(SRC).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
nen = (g >= r)                              # nền xanh (cả viền pha xanh; nứt nâu luôn đỏ > lục)
nut = ~nen

# khung = đoạn cột có điểm nứt
col = nut.sum(0)
khung, s = [], None
for x, v in enumerate(col > 0):
    if v and s is None: s = x
    if not v and s is not None: khung.append((s, x)); s = None
if s is not None: khung.append((s, len(col)))
gop = []
for k in khung:                              # nối đoạn cách nhau < 40 cột (nhánh nứt đứt quãng)
    if gop and k[0] - gop[-1][1] < 40: gop[-1] = (gop[-1][0], k[1])
    else: gop.append(k)
khung = [k for k in gop if k[1] - k[0] > 40]
assert len(khung) == 4, khung

ys_all = np.nonzero(nut.any(1))[0]
tam, nuaW, nuaH = [], 0, 0
for x0, x1 in khung:
    yy, xx = np.nonzero(nut[:, x0:x1])
    cx, cy = x0 + int(np.median(xx)), int(np.median(yy))
    tam.append((cx, cy))
    nuaW = max(nuaW, cx - x0, x1 - cx)
    nuaH = max(nuaH, cy - yy.min(), yy.max() + 1 - cy)
nuaW += 4; nuaH += 4

# 4 màu nâu (k-means đơn giản trên điểm nứt)
px = a[nut].astype(float)
rng = np.random.default_rng(1)
cen = px[rng.choice(len(px), 4, replace=False)]
for _ in range(30):
    d = ((px[:, None, :] - cen[None]) ** 2).sum(2); lab = d.argmin(1)
    cen = np.array([px[lab == k].mean(0) if (lab == k).any() else cen[k] for k in range(4)])
cen = np.clip(cen.round(), 0, 255).astype(int)
nhan = np.full(nut.shape, -1)
d = ((a[nut][:, None, :] - cen[None]) ** 2).sum(2); nhan[nut] = d.argmin(1)

tam_anh = Image.new('RGBA', (FW * 4, FH), (0, 0, 0, 0))
P = tam_anh.load()
for f, (cx, cy) in enumerate(tam):
    for j in range(FH):
        ya = int(round(cy - nuaH + j * 2 * nuaH / FH)); yb = int(round(cy - nuaH + (j + 1) * 2 * nuaH / FH))
        for i in range(FW):
            xs = int(cx - nuaW + (i + .5) * 2 * nuaW / FW)
            if xs < 0 or xs >= a.shape[1]: continue
            dai = nhan[max(0, ya):max(0, yb), xs]
            dai = dai[dai >= 0]
            if len(dai) < 3: continue          # bỏ lốm đốm viền
            k = np.bincount(dai).argmax()
            P[f * FW + i, j] = tuple(int(v) for v in cen[k]) + (255,)

buf = io.BytesIO(); tam_anh.save(buf, 'PNG', optimize=True)
sp = {"loai": "linh-khi-sprite", "phien_ban": 1, "doi_tuong": "hieu-ung", "ma": "hu-nut-re-moc",
      "ten": "Nứt đất Mộc Tinh trồi lên (4 khung to dần, elip dẹt nhìn từ trên)", "net": 1,
      "khung_rong": FW, "khung_cao": FH, "goc": [FW / 2, FH / 2], "so": 4, "giay": 0.6, "lap": False, "xoay": False,
      "co": 1, "tron": "thuong",
      "tam": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()}
with open(OUT, 'w', encoding='utf-8') as fo:
    json.dump(sp, fo, ensure_ascii=False, separators=(',', ':'))
print('khung', khung, 'tâm', tam, 'ô nguồn', 2 * nuaW, 'x', 2 * nuaH, 'màu', ['#%02x%02x%02x' % tuple(c) for c in cen], os.path.getsize(OUT), 'byte')
if len(sys.argv) > 1:
    xem = Image.new('RGBA', tam_anh.size, (40, 46, 30, 255)); xem.alpha_composite(tam_anh)
    xem.resize((tam_anh.width * 2, tam_anh.height * 2), Image.NEAREST).save(sys.argv[1])
