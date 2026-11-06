#!/usr/bin/env python3
"""TURRET MERGE — chân dung ụ MỚI từ tấm ChatGPT đơn (docs/demo-hop-tuong/thap-art/raw_pt_<id>.png, 1 chân dung, nền magenta #FF00FF)
→ thap/assets/pilot_<id>.png (427, RGB đặc) + pn/pilot_<id>.png (256) + hero/hero_<id>.jpg (1170×1020, mép trên = mép trên tấm).
Khoá magenta tách trộn (không viền hồng), đặt lên nền tối đặc của thẻ (#12151b). Thu Lanczos, không phóng quá tấm gốc.
Chạy: python3 tools/thap-pt-moi.py mauhut [nguyenrua ...]"""
import os, sys
import numpy as np
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(R, 'docs', 'demo-hop-tuong', 'thap-art'); A = os.path.join(R, 'thap', 'assets')
NEN = np.array([18, 21, 27], np.float32)

def khoa(im):
    c = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    # độ "magenta": r,b cao, g thấp → a = 1 − (min(r,b) − g)/255 (tách trộn: màu thật F = (C − (1−a)·M)/a)
    m = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    a = np.clip(1 - (m - 0.25) / 0.6, 0, 1)
    a[m < 0.25] = 1
    M = np.array([255, 0, 255], np.float32)
    F = (c - (1 - a[..., None]) * M) / np.maximum(a[..., None], 1e-3)
    F = np.clip(F, 0, 255)
    # chống ám hồng ở viền: g không thấp hơn trung bình r,b quá nhiều ở vùng bán trong
    ban = (a < 0.98)[..., None]
    F = np.where(ban, np.minimum(F, np.stack([F[..., 0], np.maximum(F[..., 1], np.minimum(F[..., 0], F[..., 2]) * 0.85), F[..., 2]], -1) * 0 + F), F)
    out = F * a[..., None] + NEN * (1 - a[..., None])
    return Image.fromarray(out.astype(np.uint8), 'RGB')

for id in sys.argv[1:]:
    src = os.path.join(ART, 'raw_pt_' + id + '.png')
    if not os.path.exists(src): print('THIẾU', src); continue
    im = khoa(Image.open(src))
    w, h = im.size; s = min(w, h); im = im.crop(((w - s) // 2, 0, (w - s) // 2 + s, s))
    im.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_' + id + '.png'), optimize=True)
    im.resize((256, 256), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_' + id + '.png'), optimize=True)
    hw = min(1170, s); hh = round(hw * 1020 / 1170)
    hero = im.resize((hw, hw), Image.LANCZOS).crop((0, 0, hw, hh))
    hero.save(os.path.join(A, 'hero', 'hero_' + id + '.jpg'), quality=88)
    print(id, 'ok', s)
