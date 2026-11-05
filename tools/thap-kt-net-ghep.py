#!/usr/bin/env python3
"""ghép ảnh cắt TRƯỚC | SAU (tools/thap-kt-net-chup.js) thành <tên>.png (phóng điểm-ảnh-gần khi nhỏ để nhìn rõ độ nét) + tong-hop.jpg"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; O = sys.argv[2] if len(sys.argv) > 2 else D
os.makedirs(O, exist_ok=True)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception: F = ImageFont.load_default()
tiles = []
for t in sorted(glob.glob(os.path.join(D, '_*-truoc.png'))):
    ten = os.path.basename(t)[1:-10]; s = t.replace('-truoc.png', '-sau.png')
    if not os.path.exists(s): continue
    a, b = Image.open(t).convert('RGB'), Image.open(s).convert('RGB')
    h = max(a.height, b.height); z = 2 if max(a.width, a.height) < 420 else 1
    if max(a.width, a.height) > 900: k = 900 / max(a.width, a.height); a = a.crop((0, 0, min(a.width, 900), min(a.height, 900))); b = b.crop((0, 0, min(b.width, 900), min(b.height, 900))); h = max(a.height, b.height)
    W = (a.width + b.width) * z + 30; im = Image.new('RGB', (W, h * z + 40), (20, 20, 24))
    im.paste(a.resize((a.width * z, a.height * z), Image.NEAREST), (0, 40)); im.paste(b.resize((b.width * z, b.height * z), Image.NEAREST), (a.width * z + 30, 40))
    d = ImageDraw.Draw(im); d.text((6, 6), 'TRUOC ' + ten, fill=(255, 140, 120), font=F); d.text((a.width * z + 36, 6), 'SAU', fill=(140, 255, 160), font=F)
    im.save(os.path.join(O, ten + '.png'), optimize=True); tiles.append(im)
# tổng hợp
cw = 1400; y = 0; rows = []
for im in tiles:
    k = min(1, cw / im.width); rows.append(im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS))
T = Image.new('RGB', (cw, sum(r.height + 10 for r in rows)), (10, 10, 12))
for r in rows: T.paste(r, (0, y)); y += r.height + 10
T.save(os.path.join(O, 'tong-hop.jpg'), quality=86)
print(len(tiles), 'cặp')
