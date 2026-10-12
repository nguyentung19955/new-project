#!/usr/bin/env python3
"""Tìm mảnh rời CHẠM MÉP Ô (lem từ ô bên cạnh khi cắt lưới) trong mọi tấm nhân vật/quái/người làng. In: mã, hàng, khung, mép, cỡ."""
import glob, os, sys
import numpy as np
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from do_tinh import nap, BO_QUA
C = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/new-project/game/art/custom'
for f in sorted(glob.glob(C + '/*.sprite.json')):
    ma = os.path.basename(f)[:-12]
    if ma.startswith(BO_QUA): continue
    d, img = nap(f); n = d.get('net') or 1; kw, kh = d['khung_rong'] * n, d['khung_cao'] * n
    for t, v in d['dong_tac'].items():
        for i in range(v['so']):
            al = img[v['hang']*kh:(v['hang']+1)*kh, i*kw:(i+1)*kw, 3] > 40
            if not al.any(): continue
            lab, k = ndimage.label(al, np.ones((3, 3)))
            if k < 2: continue
            sz = ndimage.sum(al, lab, range(1, k+1)); big = int(np.argmax(sz)) + 1
            for j in range(1, k+1):
                if j == big: continue
                m = lab == j; ys, xs = np.nonzero(m)
                mep = [e for e, ok in (('tren', ys.min() == 0), ('duoi', ys.max() == kh-1), ('trai', xs.min() == 0), ('phai', xs.max() == kw-1)) if ok]
                if mep and sz[j-1] < 0.05 * sz[big-1]:
                    print(ma, t, i+1, ','.join(mep), int(sz[j-1]), 'x=%d..%d y=%d..%d' % (xs.min()//n, xs.max()//n, ys.min()//n, ys.max()//n))
