#!/usr/bin/env python3
"""Ghép ảnh chụp của tools/thap-kt-huong-quai.js thành dải khung: mỗi chế độ 1 tấm,
mỗi hàng = 1 loại quái × 1 đoạn đường (hướng đi), 4 cột = 4 thời điểm cách 140 ms; + tấm qua góc rẽ (8 × 50 ms).
  python3 tools/thap-huong-ghep.py docs/demo-hop-tuong/tuvan/huongquai/
"""
import os, sys, json
from PIL import Image, ImageDraw

D = sys.argv[1]
cap = json.load(open(os.path.join(D, 'raw/cap.json')))
DPR, O = 2, 96  # ô 96 px
TEN = {'xuong': 'DOWN', 'len': 'UP', 'trai': 'LEFT', 'phai': 'RIGHT'}
anh = {}
def shot(f):
    if f not in anh: anh[f] = Image.open(os.path.join(D, 'raw', f)).convert('RGB')
    return anh[f]
def o(f, q):
    r = q['co'] * 0.85 * DPR; x, y = q['x'] * DPR, q['y'] * DPR
    return shot(f).crop((int(x - r), int(y - r * 1.1), int(x + r), int(y + r * 0.9))).resize((O, O), Image.LANCZOS)

for mode in ['solo', 'coop', 'pvp']:
    for re_ in (0, 1):
        cs = [c for c in cap if c['mode'] == mode and bool(c.get('re')) == bool(re_)]
        if not cs: continue
        hang = {}
        for c in cs:
            for q in c['ds']:
                if 'x' not in q: continue
                key = (c['id'], q.get('pi', 0), q.get('si', 0))
                hang.setdefault(key, []).append((c['k'], c['f'], q))
        keys = list(hang)
        ncot = max(len(v) for v in hang.values())
        L = 150
        img = Image.new('RGB', (L + ncot * O, len(keys) * O), (24, 24, 30))
        dr = ImageDraw.Draw(img)
        for i, k in enumerate(keys):
            ds = sorted(hang[k], key=lambda a: a[0])
            nhan = ds[0][2]['huong']
            nhan = TEN.get(nhan, nhan)
            dr.text((6, i * O + O // 2 - 12), '%s\n%s' % (k[0], nhan), fill=(230, 230, 230))
            for j, (_, f, q) in enumerate(ds): img.paste(o(f, q), (L + j * O, i * O))
        ten = '%s%s.jpg' % (mode, '_re' if re_ else '')
        img.save(os.path.join(D, ten), optimize=True)
        print(ten, img.size)
