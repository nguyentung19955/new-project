#!/usr/bin/env python3
"""Ảnh chân dung NHỎ cho lưới/ô (màn bộ bài, bộ sưu tập, 5 ô bộ bài, khay trận, dải đối thủ/đồng đội):
assets/pilot_<id>.png (427 px) → assets/pn/pilot_<id>.png 256 px (Lanczos nhân-trước-alpha).
Cỡ hiện lớn nhất: ô lưới 4 cột màn 360 (82 px logic, DPR 3) — chân dung còn phóng thêm theo khung mặt (khung.js MAT) → 200 px còn thiếu
(hồi quy: 1,03 px nguồn/px máy) → 256 px dư ~20 % (QUY-TAC-HINH 5).
Tên vẫn chứa 'pilot_<id>' → khung.js MAT (mốc mặt %) nhận như ảnh gốc. Chạy lại khi thêm/đổi pilot_*.png:
  python3 tools/thap-pilot-nho.py [cỡ=256]"""
import glob, os, sys
from PIL import Image
N = int(sys.argv[1]) if len(sys.argv) > 1 else 256
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'thap', 'assets')
os.makedirs(os.path.join(A, 'pn'), exist_ok=True)
for p in sorted(glob.glob(os.path.join(A, 'pilot_*.png'))):
    im = Image.open(p).convert('RGBA')
    if im.size[0] <= N: out = im
    else:
        w, h = N, round(im.size[1] * N / im.size[0])
        pm = im.convert('RGBa').resize((w, h), Image.LANCZOS)  # nhân-trước-alpha → không viền tối/sáng ở mép trong suốt
        out = pm.convert('RGBA')
    q = os.path.join(A, 'pn', os.path.basename(p))
    if out.getchannel('A').getextrema() == (255, 255): out = out.convert('RGB')
    out.save(q, optimize=True)
print('xong', len(glob.glob(os.path.join(A, 'pn', 'pilot_*.png'))), 'ảnh', N, 'px')
