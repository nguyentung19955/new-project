#!/usr/bin/env python3
"""Tờ kiểm (contact sheet) mọi dải hướng nhìn tinh anh/trùm: trước · ngang · sau (+ đánh/fx) trên nền tối và nền sáng
→ soi viền hồng, cỡ thân, đường chân giữa các hướng.  python3 tools/thap-huong4-tobang.py [ra.png]"""
import os, sys
from PIL import Image, ImageDraw
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = os.path.join(GOC, 'thap/assets')
DS = [('quai', i) for i in ('bo', 'bay', 'bay_bang', 'tach', 'que_tach', 'khong_lo')] + \
     [('trum', i) for i in ('freezer', 'nightmare', 'mad_crown', 'janus', 'joker_king', 'octopus', 'prism', 'twin_core', 'patcher', 'leech', 'hive', 'jammer')]
C = 96; NEN = [(28, 30, 40), (205, 210, 200)]
def o(p, k):
    im = Image.open(p).convert('RGBA'); H = im.height; n = round(im.width / H)
    return [im.crop((i * H, 0, (i + 1) * H, H)).resize((C, C), Image.LANCZOS) for i in range(0, n, max(1, n // k))][:k]
hang = []
for loai, id in DS:
    r = []
    for v in ('', '_side', '_back'):
        p = os.path.join(A, '%s_%s%s_8.png' % (loai, id, v)); r.append(o(p, 4) if os.path.exists(p) else None)
    for p in (os.path.join(A, 'trum_%s_atk_16.png' % id), os.path.join(A, 'fx_trum_%s.png' % id)):
        if os.path.exists(p): r.append(o(p, 4))
    hang.append((id, r))
W = 110 + 5 * (4 * C + 16); H = len(hang) * (C * 2 + 10) + 30
out = Image.new('RGB', (W, H), (60, 60, 60)); d = ImageDraw.Draw(out)
for j, t in enumerate(['front (down)', 'side (right)', 'back (up)', 'skill: body / fx']): d.text((110 + j * (4 * C + 16), 8), t, fill=(255, 255, 255))
for i, (id, r) in enumerate(hang):
    y = 30 + i * (C * 2 + 10); d.text((6, y + C - 6), id, fill=(255, 255, 255))
    for j, fs in enumerate(r):
        for b, nen in enumerate(NEN):
            x0 = 110 + j * (4 * C + 16); out.paste(nen, (x0, y + b * C, x0 + 4 * C, y + (b + 1) * C))
            if fs is None: d.text((x0 + 8, y + b * C + 40), 'MISSING', fill=(255, 60, 60)); continue
            for k, f in enumerate(fs): out.paste(f, (x0 + k * C, y + b * C), f)
ra = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/huong4/to_dai_cat.png')
out.save(ra); print(ra, out.size)
