#!/usr/bin/env python3
"""Ghép dải khung từ tools/thap-kt-sig.js: <ra>/raw/{tran,test}_<id>.json → <ra>/{tran,test}_<id>.jpg
(16 khung cách 80 ms, 2 hàng × 8, cắt quanh vùng có thay đổi giữa các khung, ghi mốc thời gian)."""
import base64, io, json, os, sys, glob
import numpy as np
from PIL import Image, ImageDraw

D = sys.argv[1] if len(sys.argv) > 1 else 'docs/demo-hop-tuong/tuvan/sig'
for f in sorted(glob.glob(os.path.join(D, 'raw', '*_*.json'))):
    if f.endswith('ket-qua.json'):
        continue
    j = json.load(open(f)); fr, bb = j['fr'], j.get('bb')
    if not fr:
        continue
    ims = [Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB') for u, _ in fr]
    a = np.stack([np.asarray(i.resize((i.width // 4, i.height // 4))).astype(np.int16) for i in ims])
    d = (np.abs(a - a[0]).sum(3) > 60).any(0)
    ys, xs = np.nonzero(d)
    W, H = ims[0].size
    if bb and bb[2] > bb[0]:
        x0, y0, x1, y1 = int(bb[0]), int(bb[1]), int(bb[2]), int(bb[3])
    elif len(xs):
        x0, x1, y0, y1 = xs.min() * 4, xs.max() * 4 + 4, ys.min() * 4, ys.max() * 4 + 4
    else:
        x0, x1, y0, y1 = 0, W, 0, H
    pad = 30
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    # khung vuông-ish, tối thiểu 520 px thiết bị
    cw, ch = max(520, x1 - x0), max(520, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    x0, x1 = max(0, min(W - cw, cx - cw // 2)), 0
    y0 = max(0, min(H - ch, cy - ch // 2))
    box = (x0, y0, x0 + min(cw, W), y0 + min(ch, H))
    tw = 300; th = round(tw * (box[3] - box[1]) / (box[2] - box[0]))
    n = len(ims); cols = 8; rows = (n + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 4), rows * (th + 20)), (20, 22, 26))
    dr = ImageDraw.Draw(sheet)
    for i, im in enumerate(ims):
        t = im.crop(box).resize((tw, th), Image.LANCZOS)
        x, y = (i % cols) * (tw + 4), (i // cols) * (th + 20)
        sheet.paste(t, (x, y + 18))
        dr.text((x + 3, y + 3), '%d ms  %s' % ((i + 1) * 80, fr[i][1] or '-'), fill=(230, 230, 230))
    out = f.replace(os.sep + 'raw' + os.sep, os.sep).replace('.json', '.jpg')
    sheet.save(out, quality=82)
    print(out, sheet.size)
