"""Ảnh soát xem-npc.png: 7 NPC (hàng đứng / hàng nói, khung 1 và 4) cạnh Zed, cùng tỉ lệ game (phóng 4 lần điểm game). Đỏ = đất, xanh = neo ngang."""
import os, json, io, base64, sys
import numpy as np
from PIL import Image, ImageDraw
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
CU = os.path.join(DAY, 'game/art/custom')
def tai(ma):
    d = json.load(open(os.path.join(CU, ma + '.sprite.json'), encoding='utf-8'))
    return d, Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
S = 4; DAT = 70
zd, zi = tai('zed-moi'); N = zd['net']
def khung(d, im, hang, i):
    n = d['net']; fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    return im.crop((i * fw, hang * fh, (i + 1) * fw, (hang + 1) * fh)), d['goc']
o = Image.new('RGB', (S * 60 * 8 + 20, S * DAT * 2 + 20), (120, 104, 80)); dr = ImageDraw.Draw(o)
for R in range(2):
    x0 = 10
    cols = [('zed-moi', 0, 0)] + [('nl-' + m, R, 0) for m in ['lai', 'ren', 'xen', 'may', 'do', 'tu', 'mo']]
    for ma, hang, i in cols:
        d, im = (zd, zi) if ma == 'zed-moi' else tai(ma)
        k, g = khung(d, im, hang if ma != 'zed-moi' else 0, i)
        n = d['net']; k = k.resize((k.width * S // n, k.height * S // n), Image.NEAREST)
        cx = x0 + 30 * S; gy = 10 + R * DAT * S + (DAT - 6) * S
        o.paste(k, (int(cx - g[0] * S), int(gy - g[1] * S)), k)
        dr.line([(x0, gy), (x0 + 58 * S, gy)], fill=(220, 40, 40)); dr.line([(cx, gy - 10), (cx, gy + 10)], fill=(40, 200, 255))
        dr.text((x0 + 2, 12 + R * DAT * S), ma + (' noi' if R and ma != 'zed-moi' else ''), fill=(255, 255, 255))
        x0 += 60 * S
o.save(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../xem-npc.png'))
