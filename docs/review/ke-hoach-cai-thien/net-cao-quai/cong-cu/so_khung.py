"""Ảnh so: một khung NET 2 | NET 3 | NET 4, cùng cỡ hiện (phóng điểm gần nhất lên 12 điểm/điểm game), nền xám.
  python3 so_khung.py <mã> <động tác> <cột> [ra.png] [--phong 12]"""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import kiem_ke as K


def khung(ma, dt, cot, P=12):
    d, sh = K.doc(ma); a = d['dong_tac'][dt]; R = a['hang']
    out = []
    for N in (2, 3, 4):
        im = sh if N == 2 else np.array(Image.open(os.path.join(K.RA, '%s-net%d.png' % (ma, N))).convert('RGBA'))
        FW, FH = d['khung_rong'] * N, d['khung_cao'] * N
        c = Image.fromarray(im[R * FH:(R + 1) * FH, cot * FW:(cot + 1) * FW])
        c = c.resize((d['khung_rong'] * P, d['khung_cao'] * P), Image.NEAREST)
        bg = Image.new('RGBA', c.size, (58, 62, 74, 255)); bg.alpha_composite(c); out.append(bg)
    W = sum(o.width for o in out) + 8 * 2
    can = Image.new('RGBA', (W, out[0].height), (20, 20, 24, 255)); x = 0
    for o in out:
        can.paste(o, (x, 0)); x += o.width + 8
    return can


if __name__ == '__main__':
    ma, dt, cot = sys.argv[1], sys.argv[2], int(sys.argv[3])
    P = int(sys.argv[sys.argv.index('--phong') + 1]) if '--phong' in sys.argv else 12
    o = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else os.path.join(K.RA, 'so-%s-%s-%d.png' % (ma, dt, cot))
    khung(ma, dt, cot, P).convert('RGB').save(o); print(o)
