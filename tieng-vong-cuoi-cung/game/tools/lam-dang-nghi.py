#!/usr/bin/env python3
"""TẠM: render DÁNG NGHỈ của Lam mới từ rig-v3 (lam-moi-v3.json → tu_the_nghi) thành 1 ô ảnh CÙNG cỡ ô (266×241),
CÙNG điểm neo (123,234), CÙNG tỉ lệ 2x với sprite sheet chạy rig-v3/sprite/lam-chay-2x.png
(dùng đúng hộp thế giới 'hop_the_gioi_px_anh_ngang' trong JSON và cùng hàm vẽ + thu nhỏ của rig-v3/code/sprite.py).
Game dùng ảnh này cho trạng thái ĐỨNG (và mọi trạng thái chưa có clip riêng mà hợp dáng đứng) cho tới khi có clip mới.
Kiểm: vẽ lại khung chạy 0 bằng cùng cách rồi so với ô 0 trong sheet (lệch alpha phải ≤ 2/255).
Chạy: python3 game/tools/lam-dang-nghi.py  →  game/anim/lam-nghi-2x.png (rig-v3, có chóp – dùng cho ?clip=v3 + bản đối chiếu)
      python3 game/tools/lam-dang-nghi.py v4  →  game/anim/lam-nghi-v4-2x.png (rig-v4 KHÔNG chóp, 27/10/2026 – mặc định)"""
import os, sys, json
sys.dont_write_bytecode = True          # không sinh __pycache__ trong rig-v3/code
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
BAN = 'v4' if 'v4' in sys.argv[1:] else 'v3'
RIG = os.path.normpath(os.path.join(GAME, '..', 'art', 'modular', 'lam-moi', 'rig-' + BAN))
sys.path.insert(0, os.path.join(RIG, 'code'))
from chung import load_json            # noqa: E402
from rig import render                 # noqa: E402
from khung import thu_nho              # noqa: E402

meta = json.load(open(os.path.join(RIG, 'sprite', 'lam-chay-2x.json'), encoding='utf-8'))
fw, fh = meta['co_khung']
hop = tuple(meta['hop_the_gioi_px_anh_ngang'])
doc = load_json()


def o(p):
    a = np.array(thu_nho(render(doc['rig'], p, hop, 1.0), (fw, fh)))
    a[a[..., 3] == 0] = 0
    return a


# kiểm cùng cách vẽ: khung chạy 0 vẽ lại phải trùng ô 0 của sheet
sh = np.array(Image.open(os.path.join(RIG, 'sprite', meta['anh'])).convert('RGBA'))
f0 = meta['frames'][0]
o0 = sh[f0['y']:f0['y'] + fh, f0['x']:f0['x'] + fw]
lech = int(np.abs(o(doc['chu_ky']['khung'][0])[..., 3].astype(int) - o0[..., 3].astype(int)).max())
print('lệch alpha khung 0 (vẽ lại ↔ sheet):', lech)
assert lech <= 2, 'cách vẽ không khớp sheet – không xuất'

nghi = o(doc['tu_the_nghi'])
ys = np.nonzero((nghi[..., 3] > 128).any(1))[0]
day = np.nonzero((nghi[..., 3] > 128).any(1))[0].max()
print('dáng nghỉ: cao', meta['diem_neo']['y'] - ys.min(), 'px nguồn; hàng đáy đế', day, '(neo y =', meta['diem_neo']['y'], ')')
dst = os.path.join(GAME, 'anim', 'lam-nghi-2x.png' if BAN == 'v3' else 'lam-nghi-v4-2x.png')
Image.fromarray(nghi, 'RGBA').save(dst, optimize=True)
print('đã ghi', dst, nghi.shape[1], 'x', nghi.shape[0])
