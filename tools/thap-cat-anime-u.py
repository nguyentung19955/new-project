#!/usr/bin/env python3
"""TURRET MERGE — cắt tấm ụ ANIME (Royal Twilight) — 3 hàng × 4 cột, mỗi HÀNG = 1 ụ (ChatGPT, nền magenta).

Nguồn: docs/demo-hop-tuong/thap-art/raw_anime_u_<nhóm>.png (1536×1024; prompt: docs/demo-hop-tuong/tuvan/ra-soat-anime-u/PROMPT.md)
  cột 1 ụ lắp sẵn (đầu chĩa LÊN) · cột 2 BỆ (ổ trống) · cột 3 ĐẦU (chĩa LÊN) · cột 4 huy hiệu tròn
Cách làm: mỗi hàng dựng lại thành tấm 2×2 y như raw_mod_<id>.png (ô vuông, đệm magenta) trong thư mục tạm
  rồi gọi đúng tools/thap-cat-umod.py (mot + ghi artscale.js) → <id>_de / _vien / _nong / _phu + nho/<id>.png.
Chạy: python3 tools/thap-cat-anime-u.py <nhóm> id1 id2 id3      (id '-' = bỏ hàng đó)
"""
import os, sys, tempfile, importlib.util
import numpy as np
from PIL import Image

CAT_TREN = {'bomhen': 0.2}  # id: phần (theo chiều cao hình) cắt bỏ ở đỉnh ô ĐẦU
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)


def tach_hang(nhom, ids):
    a = Image.open(os.path.join(os.environ.get('RAW_ANIME', os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')), 'raw_anime_u_%s.png' % nhom)).convert('RGB')
    W, H = a.size; NR = len(ids); cw, ch = W // 4, H // NR; n = max(cw, ch)
    tmp = tempfile.mkdtemp(prefix='anime-u-')
    for r, i in enumerate(ids):
        if i == '-': continue
        t = Image.new('RGB', (2 * n, 2 * n), (255, 0, 255))
        for c, (ox, oy) in enumerate(((0, 0), (n, 0), (0, n), (n, n))):
            o = a.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            if c == 2 and i in CAT_TREN:  # cắt phần chìa lên của ĐẦU (vd tia lửa ngòi nổ) để ụ không bị thu nhỏ khi xoay
                q = np.asarray(o).copy(); m = ~((q[..., 0] > 200) & (q[..., 1] < 80) & (q[..., 2] > 200))
                ys = np.nonzero(m.any(1))[0]; y0 = ys[0] + int((ys[-1] - ys[0]) * CAT_TREN[i]); q[:y0] = (255, 0, 255); o = Image.fromarray(q)
            t.paste(o, (ox + (n - cw) // 2, oy + (n - ch) // 2))
        t.save(os.path.join(tmp, 'raw_mod_%s.png' % i))
    return tmp


if __name__ == '__main__':
    nhom, ids = sys.argv[1], sys.argv[2:]
    U.RAW = tach_hang(nhom, ids)
    sys.argv = [sys.argv[0]] + [i for i in ids if i != '-']
    U.main()
