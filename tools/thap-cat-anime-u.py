#!/usr/bin/env python3
"""TURRET MERGE — cắt tấm ụ ANIME (Royal Twilight) — 3 hàng × 4 cột, mỗi HÀNG = 1 ụ (ChatGPT, nền magenta).

Nguồn: docs/demo-hop-tuong/thap-art/raw_anime_u_<nhóm>.png (1536×1024; prompt: docs/demo-hop-tuong/tuvan/ra-soat-anime-u/PROMPT.md)
  cột 1 ụ lắp sẵn (đầu chĩa LÊN) · cột 2 BỆ (ổ trống) · cột 3 ĐẦU (chĩa LÊN) · cột 4 huy hiệu tròn
Cách làm: mỗi hàng dựng lại thành tấm 2×2 y như raw_mod_<id>.png (ô vuông, đệm magenta) trong thư mục tạm
  rồi gọi đúng tools/thap-cat-umod.py (mot + ghi artscale.js) → <id>_de / _vien / _nong / _phu + nho/<id>.png.
Chạy: python3 tools/thap-cat-anime-u.py <nhóm> id1 id2 id3      (id '-' = bỏ hàng đó)
      python3 tools/thap-cat-anime-u.py --dang <nhóm> <id>       tấm BIẾN HÌNH: hàng 1/2/3 = dạng 1/2/3 của 1 ụ grow-up (cùng bệ)
        → hàng 1 làm hình chính (như trên) + đầu <id>_nong_s1..s3.png; K/tip từng dạng ghi artscale.js window.STAGE_ANIME
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


def dang(nhom, i):
    import shutil, json
    U.RAW = tach_hang(nhom, [i, i + '_g2', i + '_g3'])
    giu = os.environ.get('GIU_CHINH')  # 1 = giữ hình chính hiện có (ụ đã đạt): dạng 1 = đầu hiện tại, chỉ lấy đầu dạng 2/3
    if not giu: sys.argv = [sys.argv[0], i]; U.main()          # hàng 1 = hình chính (bệ, đầu, phụ, icon thẻ)
    goc_out = U.OUT; tmp = tempfile.mkdtemp(prefix='anime-dang-'); U.OUT = tmp
    K, tip = [], []
    t0 = open(os.path.join(U.JS, 'artscale.js'), encoding='utf-8').read()
    for n, ten in enumerate((i, i + '_g2', i + '_g3'), 1):
        if giu and n == 1:
            shutil.copyfile(os.path.join(goc_out, i + '_nong.png'), os.path.join(goc_out, '%s_nong_s1.png' % i))
            K.append(U.js_obj(t0, 'HEAD_K')[i]); tip.append(round(float(U.js_obj(t0, 'UMOD_TIP')[i]), 3)); continue
        r = U.mot(ten)
        shutil.copyfile(os.path.join(tmp, ten + '_nong.png'), os.path.join(goc_out, '%s_nong_s%d.png' % (i, n)))
        K.append(r['HEAD_K']); tip.append(round(float(r['tip']), 3))
        print(i, 'dạng', n, 'K', r['HEAD_K'], 'khớp bệ', r['khop_be'])
    U.OUT = goc_out; shutil.rmtree(tmp, ignore_errors=True)
    p = os.path.join(U.JS, 'artscale.js'); t = open(p, encoding='utf-8').read()
    sa = U.js_obj(t, 'STAGE_ANIME') or {}; sa[i] = {'K': K, 'tip': tip}
    t = U.js_set(t, 'STAGE_ANIME', sa, '// claude/demo-hop-tuong (tools/thap-cat-anime-u.py --dang): đầu dạng 1/2/3 MỚI theo bệ anime → <id>_nong_s1..s3 (K = cỡ ô × K, tip mũi nòng); id ở đây dùng lại STAGE_K (growfx) thay vì 1 đầu + quầng')
    open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    if sys.argv[1] == '--dang':
        dang(sys.argv[2], sys.argv[3]); sys.exit(0)
    nhom, ids = sys.argv[1], sys.argv[2:]
    U.RAW = tach_hang(nhom, ids)
    sys.argv = [sys.argv[0]] + [i for i in ids if i != '-']
    U.main()
