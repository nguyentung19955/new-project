"""hu-ngu-tinh-mo-man: 8 khung Ngư Tinh xuất hiện (vòng nước, bọt, 5 cột nước, sóng lớn) từ docs/anh-goc/ve-tay-8-gop/n3-ngu-tinh-mo-man.png
(nền #00FF00, 1 hàng 8 khung) → game/art/custom/hu-ngu-tinh-mo-man.sprite.json (kiểu hieu-ung, js/fx_anh.js).
Mỗi khung căn theo TÂM VÒNG NƯỚC (giữa bề ngang hình, đáy dải vòng) để vòng không nhảy giữa các khung; neo goc = tâm vòng.
Tách nền: mat_na_bao_cao của docs/anh-goc/zed/cat-diem-anh.py. Dùng: python3 dung-ngu-tinh.py [--ghi]
"""
import os, sys, json, io, base64, importlib.util
import numpy as np
from PIL import Image

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
sp = importlib.util.spec_from_file_location('cda', os.path.join(DAY, 'docs/anh-goc/zed/cat-diem-anh.py'))
CDA = importlib.util.module_from_spec(sp); sp.loader.exec_module(CDA)
SOAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../anh-soat'); os.makedirs(SOAT, exist_ok=True)
N = 2

a = np.array(Image.open(os.path.join(DAY, 'docs/anh-goc/ve-tay-8-gop/n3-ngu-tinh-mo-man.png')).convert('RGB'))
m, _ = CDA.mat_na_bao_cao(a)
H, W = m.shape
col = m.sum(0)
# 8 khung: cắt ở cột trống gần mốc W*i/8 nhất
cat = [0]
for i in range(1, 8):
    c0 = int(W * i / 8); w = int(W / 32)
    seg = col[c0 - w:c0 + w]; z = np.nonzero(seg == seg.min())[0]
    cat.append(c0 - w + int(z[len(z) // 2]))
cat.append(W)
ks = []
for x0, x1 in zip(cat[:-1], cat[1:]):
    mm = m[:, x0:x1]; ys, xs = np.nonzero(mm)
    # tâm vòng: cột giữa của dải dưới cùng (30% dưới của hình) ; đáy vòng = hàng thấp nhất có nhiều điểm ảnh
    y1 = ys.max(); band = ys > y1 - 0.3 * (y1 - ys.min() + 1)
    cx = (xs[band].min() + xs[band].max()) / 2
    hang = np.nonzero(mm.sum(1) > 6)[0]
    ks.append(dict(x0=x0, x1=x1, cx=x0 + cx, ylo=int(hang.max())))
# dải vòng: tâm vòng ≈ giữa dải dưới. Lấy y tâm chung = trung vị (đáy - nửa bề cao vòng khung 1)
Y_TAM = int(np.median([k['ylo'] for k in ks])) - 30
TREN = max(Y_TAM - int(np.nonzero(m.sum(1) > 0)[0].min()), 10) + 4
DUOI = max(int(np.nonzero(m.sum(1) > 0)[0].max()) - Y_TAM, 10) + 4
NUA = int(max(max(k['cx'] - k['x0'], k['x1'] - k['cx']) for k in ks)) + 2
NUA += (-NUA) % N; TREN += (-TREN) % N; DUOI += (-DUOI) % N
FW, FH = 2 * NUA, TREN + DUOI
tam = np.zeros((FH, FW * 8, 4), np.uint8)
for i, k in enumerate(ks):
    X = int(round(k['cx'])) - NUA
    for xx in range(max(k['x0'], X), min(k['x1'], X + FW)):
        dx = i * FW + xx - X
        sl = m[Y_TAM - TREN:Y_TAM + DUOI, xx]
        tam[:, dx, :3] = a[Y_TAM - TREN:Y_TAM + DUOI, xx]; tam[:, dx, 3] = sl * 255
im = Image.fromarray(tam)
# thu về net 2 so với cỡ game: vòng khung 8 rộng ~ 240 điểm ảnh ảnh ↔ sóng lớn cũ r 110 (rộng 220 điểm game) — game phóng bằng `co` lúc vẽ
# giảm màu: alpha 0/255, ảnh chỉ có vài sắc lam / trắng → 24 màu (PNG bảng màu nhỏ hơn ~8 lần)
q = im.convert('RGB').quantize(24, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
im = Image.fromarray(np.dstack([np.array(q), tam[..., 3]]))
im = im.quantize(25, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
b = io.BytesIO(); im.save(b, 'PNG', optimize=True); im = im.convert('RGBA')
t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': 'hu-ngu-tinh-mo-man', 'ten': 'Ngư Tinh xuất hiện (vòng nước, bọt, cột nước, sóng lớn)',
     'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode(), 'net': N, 'khung_rong': FW // N, 'khung_cao': FH // N,
     'goc': [NUA // N, TREN // N], 'so': 8, 'giay': 2.8, 'lap': False, 'xoay': False, 'co': 1, 'tron': 'thuong'}
bg = Image.new('RGBA', im.size, (20, 40, 46, 255)); bg.alpha_composite(im); bg.save(os.path.join(SOAT, 'ngu-tinh-mo-man-tam.png'))
print(dict(o=[FW // N, FH // N], goc=t['goc'], tam=im.size, cat=cat))
if '--ghi' in sys.argv:
    p = os.path.join(DAY, 'game/art/custom/hu-ngu-tinh-mo-man.sprite.json')
    json.dump(t, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':')); print('ghi', p, os.path.getsize(p))
