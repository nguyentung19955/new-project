#!/usr/bin/env python3
"""So thân em bé: tâm đầu (45% trên), tâm chân (15% dưới), đáy, đỉnh của từng khung từng hàng; so thân gốc với thân theo bộ."""
import sys, os, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from do_tinh import nap
C = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../game/art/custom')
def so(ma):
    d, img = nap(os.path.join(C, ma + '.sprite.json'))
    n = d['net']; kw, kh = d['khung_rong'] * n, d['khung_cao'] * n; gx, gy = d['goc']
    out = {}
    for t, v in d['dong_tac'].items():
        r = []
        for i in range(v['so']):
            al = img[v['hang']*kh:(v['hang']+1)*kh, i*kw:(i+1)*kw, 3] > 40
            ys, xs = np.nonzero(al)
            if not len(ys): r.append(None); continue
            y0, y1 = ys.min(), ys.max(); H = y1 - y0 + 1
            hd = ys < y0 + 0.45 * H; ft = ys > y1 - 0.15 * H
            r.append(dict(dau=round(xs[hd].mean()/n-gx,1), chan=round(xs[ft].mean()/n-gx,1), dinh=round(y0/n-gy,1), day=round((y1+1)/n-gy,1)))
        out[t] = r
    return out
if __name__ == '__main__':
    for k in ['smith','hunter','healer','wrestler']:
        for b in ['', '-rung', '-bien', '-lau']:
            o = so('em-be-'+k+b)
            print(('em-be-'+k+b).ljust(22), ' '.join('%s:dau%+.1f/chan%+.1f/dinh%.0f' % (t, o[t][0]['dau'], o[t][0]['chan'], o[t][0]['dinh']) for t in ['idle','move','hit','ne']))
