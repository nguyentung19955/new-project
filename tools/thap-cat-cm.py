# CƠ CHẾ MỚI đợt 1 — cắt tờ ChatGPT (docs/demo-hop-tuong/tuvan/co-che-moi/CAN-VE.json) → thap/assets/cm_*.png + thap/js/cm-meta.js
#   raw_cm_muiten.png (2×2: ↑ → ↓ ←)  → cm_mui_0..3.png (huy hiệu mũi tên Pháo La Bàn, vuông 96 px = 3× cỡ tấm đếm lớn nhất)
#   raw_cm_songno.png / raw_cm_vetlua.png / raw_cm_daykeo.png (4×4, 16 khung) → cm_songno/cm_vetlua/cm_daykeo.png (1 hàng 16 khung, giữ tỉ lệ ô)
#   raw_cm_canon_dau.png (tuỳ chọn) → chưa lắp (đầu Cannon cũ vẫn dùng).
# Khoá magenta (tách trộn màu nền, viền alpha mềm) + Lanczos nhân-trước-alpha — dùng lại hàm của tools/thap-cat-p2.py.
# Chạy: python3 tools/thap-cat-cm.py   (tờ nào chưa có raw thì bỏ qua)
import os, json, importlib.util, sys
import numpy as np
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/'); OUT = os.path.join(ROOT, 'thap/assets/')
# dùng khoa() + thu() của thap-cat-p2.py (không chạy phần cắt của nó)
_src = open(os.path.join(ROOT, 'tools/thap-cat-p2.py'), encoding='utf-8').read().split('meta = {}')[0]
_ns = {'__file__': os.path.join(ROOT, 'tools/thap-cat-p2.py')}; exec(_src, _ns); khoa, thu = _ns['khoa'], _ns['thu']
def bbox(f, nguong=30):
    a = np.asarray(f)[..., 3]; ys, xs = np.where(a > nguong)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None
meta = {}
# 1) huy hiệu mũi tên
p = SRC + 'raw_cm_muiten.png'
if os.path.exists(p):
    s = khoa(Image.open(p)); W, H = s.size; cw, ch = W // 2, H // 2
    for i in range(4):
        x, y = i % 2, i // 2
        f = s.crop((x * cw + 3, y * ch + 3, (x + 1) * cw - 3, (y + 1) * ch - 3)); b = bbox(f)
        if b: f = f.crop(b)
        R = max(f.size); q = Image.new('RGBA', (R, R), (0, 0, 0, 0)); q.paste(f, ((R - f.size[0]) // 2, (R - f.size[1]) // 2))
        thu(q, 96, 96).save(OUT + 'cm_mui_%d.png' % i, optimize=True)
    meta['cm_mui'] = [4, 96, 96]; print('cm_mui ×4')
# 2) dải 16 khung (kéo giãn giữa 2 điểm khi vẽ): giữ cả ô, cắt bỏ phần trống trên/dưới chung của mọi khung
for ten, fw in (('songno', 256), ('vetlua', 256), ('daykeo', 256)):
    p = SRC + 'raw_cm_' + ten + '.png'
    if not os.path.exists(p): continue
    s = khoa(Image.open(p)); W, H = s.size; cw, ch = W // 4, H // 4
    fr = [s.crop((x * cw + 4, y * ch + 4, (x + 1) * cw - 4, (y + 1) * ch - 4)) for y in range(4) for x in range(4)]
    y0, y1 = ch, 0
    for f in fr:
        b = bbox(f)
        if b: y0, y1 = min(y0, b[1]), max(y1, b[3])
    if y1 <= y0: y0, y1 = 0, fr[0].size[1]
    fr = [f.crop((0, y0, f.size[0], y1)) for f in fr]
    fh = max(8, round(fw * (y1 - y0) / fr[0].size[0]))
    st = Image.new('RGBA', (fw * 16, fh), (0, 0, 0, 0))
    for i, f in enumerate(fr): st.paste(thu(f, fw, fh), (i * fw, 0))
    st.save(OUT + 'cm_' + ten + '.png', optimize=True)
    meta['cm_' + ten] = [16, fw, fh]; print('cm_' + ten, fw, fh)
with open(os.path.join(ROOT, 'thap/js/cm-meta.js'), 'w', encoding='utf-8') as f:
    f.write("// sinh bởi tools/thap-cat-cm.py — [số khung, rộng khung, cao khung] của tờ cơ chế mới cm_* (đừng sửa tay)\n'use strict';\nconst CM_META = " + json.dumps(meta, sort_keys=True) + ";\n")
print('cm-meta', len(meta))
