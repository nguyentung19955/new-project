"""NÉT CAO — NỀN (17/10): thảm dẫn cửa Lâu đài gd-tham-lau ở net N, đúng cách cắt của ve-tay-8-gop-giao-dien/cong-cu/cat-gd.py
(cắt hàng 2 của g6-o-lap, xoay 90°, NEAREST giữa ô; rộng 22 điểm game). python3 dung_tham_lau.py --net 2|3|4 → ra/net<N>-net/gd-tham-lau.png"""
import importlib.util, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
sp = importlib.util.spec_from_file_location('catgd', os.path.join(REPO, 'docs/review/ke-hoach-cai-thien/ve-tay-8-gop-giao-dien/cong-cu/cat-gd.py'))
CG = importlib.util.module_from_spec(sp); sp.loader.exec_module(CG)
from PIL import Image
N = int(sys.argv[sys.argv.index('--net') + 1]) if '--net' in sys.argv else 2
RA = os.path.join(HERE, 'ra', 'net%d-net' % N); os.makedirs(RA, exist_ok=True)
h, img = CG.manh('g6-o-lap')
tl = CG.cat(img, h[1][0], chat=2).transpose(Image.ROTATE_90)
cao = round(tl.height * 44 / tl.width) / 2  # điểm game (như net 2)
im = CG.nn(tl, 22 * N, int(round(cao * N)))
im.save(os.path.join(RA, 'gd-tham-lau.png')); print('gd-tham-lau', im.size)
