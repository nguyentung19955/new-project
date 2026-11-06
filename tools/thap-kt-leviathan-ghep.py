#!/usr/bin/env python3
# ghép ảnh kiểm Leviathan (tools/thap-kt-leviathan.js): dải TIDAL BREATH (rơi → phun → bay lên) + cận cảnh tấm ABYSS 8/56/100
import json, sys, os
from PIL import Image, ImageDraw
D = sys.argv[1] if len(sys.argv) > 1 else 'docs/demo-hop-tuong/tuvan/leviathan'
R = os.path.join(D, 'raw'); OUT = sys.argv[2] if len(sys.argv) > 2 else D
k = json.load(open(os.path.join(R, 'ket-qua.json')))
nen = Image.open(os.path.join(R, 'nen.png')).convert('RGB'); s = nen.size[0] / 390
x0, y0, w, h = [round(v * s) for v in k['cv']]
chon = [0, 2, 4, 6, 9, 13, 18, 24, 30, 35, 40, 46, 52, 58]  # ×40 ms
o = []
for i in chon:
    f = Image.open(os.path.join(R, 'tho_%02d.png' % i)).convert('RGBA').resize((w, h))
    b = nen.copy(); b.paste(f, (x0, y0), f)
    cy0, cy1 = int(b.size[1] * 0.30), int(b.size[1] * 0.70)
    c = b.crop((0, cy0, b.size[0], cy1)).resize((b.size[0] // 3, (cy1 - cy0) // 3), Image.LANCZOS)
    d = ImageDraw.Draw(c); d.rectangle((0, 0, 70, 16), fill=(0, 0, 0)); d.text((4, 2), '%.2fs' % (i * 0.04 + 0.04), fill=(255, 255, 255))
    o.append(c)
cw, ch = o[0].size; n = 7
st = Image.new('RGB', (cw * n, ch * ((len(o) + n - 1) // n)), (0, 0, 0))
for j, c in enumerate(o): st.paste(c, ((j % n) * cw, (j // n) * ch))
st.save(os.path.join(OUT, 'tidal_breath_strip.jpg'), quality=88)
t = [Image.open(os.path.join(R, 'abyss_%d.png' % v)).convert('RGB') for v in (8, 56, 100)]
tt = Image.new('RGB', (sum(i.size[0] for i in t), t[0].size[1]))
x = 0
for i in t: tt.paste(i, (x, 0)); x += i.size[0]
tt = tt.resize((tt.size[0] * 2, tt.size[1] * 2), Image.LANCZOS); tt.save(os.path.join(OUT, 'abyss_tag_8_56_100.png'))
Image.open(os.path.join(R, 'chon_vong.png')).convert('RGB').save(os.path.join(OUT, 'chon_vong_nuot.jpg'), quality=85)
print('ok', st.size, tt.size)
