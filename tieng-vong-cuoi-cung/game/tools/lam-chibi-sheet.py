#!/usr/bin/env python3
"""Ghép sheet Lam chibi cho demo 960×540 từ art/chibi/lam/khung/ (CHỈ ĐỌC art/chibi).
Mỗi khung 512×512 (pivot giữa đế ủng ở (256, 500), người đứng ≈345 px) → ô 240×240 bằng Lanczos
(người đứng ≈160 px), pivot [120, 234]. Mỗi animation một hàng.
Ra: game/anim/lam-chibi.png + game/anim/lam-chibi.json
Chạy: python3 game/tools/lam-chibi-sheet.py"""
import json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
KHUNG = os.path.normpath(os.path.join(GAME, '..', 'art', 'chibi', 'lam', 'khung'))
O = 240
PIVOT = [120, round(500 * O / 512)]   # 234

# tên trong game: (thư mục nguồn, [số khung], fps, loop, ghi chú)
ANIMS = [
    ('idle',   'goc-nhin', [7],             4,  True,  'TẠM: 1 khung góc nhìn ngang phải (goc-nhin 7). idle.gif gốc là rút dao nên không dùng.'),
    ('run',    'run',      [1, 2, 3, 4, 5, 6], 12, True, 'run-6 thật (khung 2, 5 là pha bay).'),
    ('jump',   'run',      [5],             8,  False, 'TẠM: khung bay run 5.'),
    ('fall',   'run',      [2],             8,  True,  'TẠM: khung bay run 2.'),
    ('combo1', 'combo-1',  [1, 2, 3, 4],    14, False, 'Đòn 1 của combo (chém/lao). Lỗi gốc: khung 1 dao ở tay sau.'),
    ('attack', 'combo-3',  [1, 2, 3, 4],    14, False, 'Đâm (combo-3) — đòn chính, đòn 2 của combo, chém hất, chém trên không.'),
    ('combo4', 'combo-4',  [1, 2, 3, 4],    14, False, 'Đòn 3 của combo (nhảy bổ). Khung 3–4 (đâm xuống) dùng cho chém nảy.'),
]

cols = max(len(a[2]) for a in ANIMS)
sheet = Image.new('RGBA', (cols * O, len(ANIMS) * O), (0, 0, 0, 0))
meta = {'version': 1, 'image': 'lam-chibi.png', 'frameWidth': O, 'frameHeight': O, 'pivot': PIVOT,
        'nguon': 'art/chibi/lam/khung/*/khung-N.png (512×512, pivot y=500) → Lanczos ' + str(O), 'animations': {}}
for row, (ten, thu_muc, so, fps, loop, ghi) in enumerate(ANIMS):
    for c, n in enumerate(so):
        im = Image.open(os.path.join(KHUNG, thu_muc, 'khung-%d.png' % n)).convert('RGBA')
        assert im.size == (512, 512), im.size
        # Lanczos trên ảnh premultiplied để mép trong suốt không ám màu tối
        im = im.convert('RGBa').resize((O, O), Image.LANCZOS).convert('RGBA')
        sheet.alpha_composite(im, (c * O, row * O))
    meta['animations'][ten] = {'row': row, 'frames': len(so), 'fps': fps, 'loop': loop,
                               'nguon': '%s %s' % (thu_muc, so), 'ghiChu': ghi}
out = os.path.join(GAME, 'anim')
os.makedirs(out, exist_ok=True)
sheet.save(os.path.join(out, 'lam-chibi.png'), optimize=True)
json.dump(meta, open(os.path.join(out, 'lam-chibi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('lam-chibi.png', sheet.size, os.path.getsize(os.path.join(out, 'lam-chibi.png')) // 1024, 'KB')
