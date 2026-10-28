#!/usr/bin/env python3
"""Tạo ảnh Ấn Rèn I cho trang P0-C từ art/huong-moi/nguon/vu-khi/an-ren.png (CHỈ ĐỌC, nền trắng).
Lấy 2 hình đầu: [0] rơi trên đất (khắc tối) · [1] đã nhặt (khắc sáng). Hình thứ 3 (Ấn III, 3 khắc) KHÔNG dùng trong P0-C.
Tách nền trắng: điểm gần trắng NỐI với mép ảnh (loang từ mép) → trong suốt; viền khử răng cưa theo độ sáng. Không đụng phần trắng
bị bao kín bên trong (dải vải ngà vẫn giữ). Ra: game/thu-p0c/p0c/an-ren-2x.png (2 khung cạnh nhau, cùng cỡ, neo giữa đáy)
+ an-ren-2x.json. Cỡ vẽ trong game: cao 24 px logic (trong 20–28 theo yêu cầu) → ảnh 2x cao 48.
Chạy: python3 game/thu-p0c/cong-cu/tao-asset-p0c.py"""
import os, json
from PIL import Image
import numpy as np
from collections import deque

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
SRC = os.path.join(ROOT, 'art', 'huong-moi', 'nguon', 'vu-khi', 'an-ren.png')
OUT = os.path.normpath(os.path.join(HERE, '..', 'p0c'))
CAO_LOGIC = 24
im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
H, W, _ = im.shape
trang = (im.min(axis=2) >= 228)
# loang nền trắng từ mép
nen = np.zeros((H, W), bool); q = deque()
for x in range(W):
    for y in (0, H - 1):
        if trang[y, x] and not nen[y, x]: nen[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if trang[y, x] and not nen[y, x]: nen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        yy, xx = y + dy, x + dx
        if 0 <= yy < H and 0 <= xx < W and trang[yy, xx] and not nen[yy, xx]: nen[yy, xx] = True; q.append((yy, xx))
alpha = np.where(nen, 0, 255).astype(np.float32)
# viền: điểm không nền kề nền → alpha theo độ tối (khử răng cưa trên nền trắng)
ke = np.zeros_like(nen)
ke[1:] |= nen[:-1]; ke[:-1] |= nen[1:]; ke[:, 1:] |= nen[:, :-1]; ke[:, :-1] |= nen[:, 1:]
vien = ke & ~nen
sang = im.min(axis=2).astype(np.float32)
alpha[vien] = np.clip((255 - sang[vien]) / (255 - 150) * 255, 0, 255)
rgba = np.dstack([im.astype(np.uint8), alpha.astype(np.uint8)])
# tách 3 hình theo cột trống
cot = (alpha > 0).any(axis=0); khoang = []; x = 0
while x < W:
    if cot[x]:
        x0 = x
        while x < W and cot[x]: x += 1
        if x - x0 > 50: khoang.append((x0, x))
    else: x += 1
assert len(khoang) == 3, khoang
hinh = []
for x0, x1 in khoang[:2]:
    a = alpha[:, x0:x1] > 0; ys = np.where(a.any(axis=1))[0]
    hinh.append(rgba[ys[0]:ys[-1] + 1, x0:x1])
ch = CAO_LOGIC * 2
ds = []
for h in hinh:
    k = ch / h.shape[0]
    ds.append(Image.fromarray(h, 'RGBA').resize((max(1, round(h.shape[1] * k)), ch), Image.LANCZOS))
cw = max(d.width for d in ds)
tam = Image.new('RGBA', (cw * 2, ch), (0, 0, 0, 0))
for i, d in enumerate(ds): tam.paste(d, (i * cw + (cw - d.width) // 2, 0), d)
os.makedirs(OUT, exist_ok=True)
tam.save(os.path.join(OUT, 'an-ren-2x.png'))
meta = {'anh': 'an-ren-2x.png', 'nguon': 'art/huong-moi/nguon/vu-khi/an-ren.png', 'khung': ['roi-tren-dat', 'da-nhat'], 'w2x': cw, 'h2x': ch,
        'w': cw / 2, 'h': ch / 2, 'neo': 'giữa đáy'}
json.dump(meta, open(os.path.join(OUT, 'an-ren-2x.json'), 'w'), ensure_ascii=False, indent=1)
print('ghi', os.path.join(OUT, 'an-ren-2x.png'), tam.size, meta)
