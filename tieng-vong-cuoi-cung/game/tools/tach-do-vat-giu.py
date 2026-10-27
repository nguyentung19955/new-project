#!/usr/bin/env python3
"""Tách 3 khung đồ vật CÒN GIỮ (điểm lưu tắt / sáng, đèn lồng) từ sheet cũ anim/the-gioi.png → anim/lang-chuong-giu.png + .json
(27/10/2026, ghép Làng Chuông). demo.html không còn nạp the-gioi.* (gạch, cổng, công tắc đã thay bằng asset Làng Chuông);
the-gioi.* vẫn giữ vì demo-doi-chieu-v3.html và thu-quai-boss còn dùng. Định dạng khung giữ nguyên: [x, y, w, h, ox, oy]
(px game, pivot đáy giữa). Chạy: python3 tools/tach-do-vat-giu.py"""
import json, os
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(HERE, 'anim')
src = json.load(open(os.path.join(A, 'the-gioi.json'), encoding='utf-8'))
im = Image.open(os.path.join(A, src['image'])).convert('RGBA')
keys = ['diem-luu-tat', 'diem-luu-sang', 'den-long']
fr = [src['frames'][k] for k in keys]
W = sum(f[2] for f in fr) + 2 * (len(fr) + 1); H = max(f[3] for f in fr) + 4
out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); x = 2; frames = {}
for k, f in zip(keys, fr):
    out.paste(im.crop((f[0], f[1], f[0] + f[2], f[1] + f[3])), (x, 2))
    frames[k] = [x, 2, f[2], f[3], f[4], f[5]]; x += f[2] + 2
out.save(os.path.join(A, 'lang-chuong-giu.png'), optimize=True)
json.dump({'version': 1, 'image': 'lang-chuong-giu.png', 'donVi': 'px game',
           'ghiChu': 'tách từ the-gioi.png (tools/tach-do-vat-giu.py): điểm lưu + đèn lồng giữ lại khi ghép Làng Chuông; pivot đáy giữa',
           'frames': frames}, open(os.path.join(A, 'lang-chuong-giu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('lang-chuong-giu.png', out.size)
