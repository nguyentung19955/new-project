#!/usr/bin/env python3
# TURRET MERGE — ẢNH GỐC 1 KHUNG cho QUÁI TINH ANH / quái to hoạt ảnh bằng code (quaianim.js QUAI_ANIM_CODE, 09/11).
# Như tools/thap-trum-master.py: KHÔNG gen ảnh mới — cắt 1 khung sạch trong dải đi quai_<id>_8.png → quai_<id>_m.png (cùng cỡ ô → K8 giữ nguyên).
#   khong_lo (quả cầu đá LĂN): chỉ giữ mảng liền lớn nhất (bỏ sỏi văng — sỏi sẽ lăn theo thân), dời tâm cầu về giữa ô, in bán kính.
#   que_tach / tach (thạch NHẢY): giữ nguyên khung nghỉ, in đáy thân / cạnh ô (cf.day).
# Chạy (gốc repo): python3 tools/thap-quai-master.py [ASSETS_IN] [ASSETS_OUT]
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

AI = sys.argv[1] if len(sys.argv) > 1 else 'thap/assets/'
AO = sys.argv[2] if len(sys.argv) > 2 else AI
CF = {'khong_lo': (0, 'lan'), 'que_tach': (0, 'nhay'), 'tach': (0, 'nhay')}

for id_, (k, kieu) in CF.items():
    im = Image.open(AI + 'quai_%s_8.png' % id_).convert('RGBA')
    s = im.size[1]
    p = np.asarray(im.crop((k * s, 0, k * s + s, s))).copy()
    a = p[..., 3]
    if kieu == 'lan':
        lab, n = nd.label(a > 24)
        if n > 1:
            sz = nd.sum(np.ones_like(a), lab, range(1, n + 1)); big = 1 + int(np.argmax(sz))
            keep = nd.binary_dilation(lab == big, iterations=2)
            p[..., 3] = np.where(keep, a, 0)
        ys, xs = np.nonzero(p[..., 3] > 24)
        cx, cy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
        r = max(xs.max() + 1 - xs.min(), ys.max() + 1 - ys.min()) / 2
        q = Image.new('RGBA', (s, s), (0, 0, 0, 0))
        q.paste(Image.fromarray(p, 'RGBA'), (int(round(s / 2 - cx)), int(round(s / 2 - cy))))
        q.save(AO + 'quai_%s_m.png' % id_, optimize=True)
        print(id_, 'r = %.3f' % (r / s), 'mảng bỏ', n - 1)
    else:
        ys, xs = np.nonzero(a > 24)
        Image.fromarray(p, 'RGBA').save(AO + 'quai_%s_m.png' % id_, optimize=True)
        print(id_, 'day = %.3f' % ((ys.max() + 1) / s - 0.5), 'x [%.3f, %.3f]' % (xs.min() / s - 0.5, (xs.max() + 1) / s - 0.5))
