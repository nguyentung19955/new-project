#!/usr/bin/env python3
"""Cắt dải luồng lửa Wyrm Engine mới (07/11, user 19:05 "xấu quá") → thap/assets/fx_wyrm_lua2.png (1 hàng 8 khung).
Nguồn: docs/demo-hop-tuong/thap-art/raw_fx_wyrm_lua2.png (ChatGPT, 8 ô đều, nền magenta; lửa bắt đầu ở MÉP TRÁI ô = nòng, toả sang phải).
Khác thap-cat-vfx5.py: KHÔNG căn tâm — giữ nguyên ô (mép trái = nòng), chỉ cắt chung theo chiều dọc. In cỡ khung + mũi lửa / bề cao phần
có lửa ở 70% chiều dài (VUNG_ANH.wyrm2X / wyrm2Y, khung đầy 3–5) để dán vào js/sigfx.js.
Dùng: python3 tools/thap-cat-wyrm2.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/thap-cat-vfx5.py'), encoding='utf-8').read().split('\ndef chay(ten):')[0]
G = {'__file__': os.path.join(ROOT, 'tools/thap-cat-vfx5.py')}; exec(compile(src, 'thap-cat-vfx5.py', 'exec'), G)
cat_o, nen, thu = G['cat_o'], G['nen'], G['thu']

N, DAI = 8, 170  # 8 khung; chiều dài hiển thị lớn nhất ≈ tầm 165 px → khung rộng ≈ 2× (đủ nét trên màn dpr 2)
a = np.asarray(Image.open(os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/raw_fx_wyrm_lua2.png')).convert('RGB')).astype(np.float32)
bg = nen(a); H, W = a.shape[:2]; cw = W / N
os_ = [cat_o(a[:, int(round(i * cw)):int(round(i * cw)) + int(cw)], bg, False, 40) for i in range(N)]
ys = [np.where(o[..., 3] > 10)[0] for o in os_]
y0 = max(0, min(y.min() for y in ys if len(y)) - 3); y1 = min(H, max(y.max() for y in ys if len(y)) + 4)
# đối xứng quanh trục giữa của luồng (hàng sáng nhất ở mép trái khung đầy) để nòng nằm đúng giữa chiều cao khung
o4 = os_[4]; col = o4[:, 2:12, 3].sum(1); yc = int(np.argmax(col))
h2 = max(yc - y0, y1 - yc); y0, y1 = max(0, yc - h2), min(H, yc + h2)
fw, fh = int(cw), y1 - y0
k = min(1.0, 2 * DAI / fw); nw, nh = round(fw * k), round(fh * k)
strip = np.zeros((nh, nw * N, 4), np.uint8)
for i, o in enumerate(os_): strip[:, i * nw:(i + 1) * nw] = thu(o[y0:y1, :fw], nw, nh)
Image.fromarray(strip, 'RGBA').save(os.path.join(ROOT, 'thap/assets/fx_wyrm_lua2.png'), optimize=True)
# mũi lửa (cột xa nhất có lửa, khung đầy 3–5) = wyrm2X · bề cao phần có lửa ở 70% chiều dài lửa = wyrm2Y
xs, hs = [], []
for i in (3, 4, 5):
    f = strip[:, i * nw:(i + 1) * nw, 3]; cc = np.where((f > 40).sum(0) > 2)[0]; xs.append((cc.max() + 1) / nw)
X2 = float(np.mean(xs))
for i in (3, 4, 5):
    c = strip[:, i * nw + int(nw * 0.7 * X2), 3]; yy = np.where(c > 40)[0]; hs.append((yy.max() - yy.min() + 1) / nh if len(yy) else 0)
print('fx_wyrm_lua2', [N, nw, nh], 'trục y', yc - y0, '/', fh, 'wyrm2X', round(X2, 3), 'wyrm2Y', round(float(np.mean(hs)), 3))

# dạng 2 (lửa XANH) / dạng 3 (lửa TRẮNG viền xanh) theo luật: đổi kênh đỏ ↔ lam của chính ảnh ChatGPT (cam → lam, vàng → lam-trắng,
# đỏ → lam đậm; giữ nguyên nét + alpha) — thay PX.mau tô phẳng 1 màu (ra mảng xanh dẹt). Dạng 3: pha trắng theo độ sáng.
s = strip.astype(np.float32); b2 = s.copy(); b2[..., 0], b2[..., 2] = s[..., 2], s[..., 0]
Image.fromarray(np.clip(b2, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(ROOT, 'thap/assets/fx_wyrm_lua2_2.png'), optimize=True)
lum = (s[..., 0] * 0.3 + s[..., 1] * 0.59 + s[..., 2] * 0.11)[..., None] / 255
b3 = b2.copy(); k3 = np.clip(lum * 1.3, 0, 1) * 0.8
b3[..., :3] = b2[..., :3] * (1 - k3) + 255 * k3
Image.fromarray(np.clip(b3, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(ROOT, 'thap/assets/fx_wyrm_lua2_3.png'), optimize=True)
print('fx_wyrm_lua2_2 / fx_wyrm_lua2_3 (dạng 2 / 3)')
