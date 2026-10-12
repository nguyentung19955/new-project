# Đo từng khung mọi sprite có hoạt ảnh (em bé, quái, trùm, người làng): đáy chân, tâm, đỉnh, chạm mép ô (cắt cụt), khung rỗng, khung trùng.
import json, glob, base64, io, sys, os
import numpy as np
from PIL import Image
D = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/new-project/game/art/custom'
out = []
def tai(d):
    b = base64.b64decode(d['tam'].split(',', 1)[1])
    return np.array(Image.open(io.BytesIO(b)).convert('RGBA'))
for f in sorted(glob.glob(D + '/*.sprite.json')):
    d = json.load(open(f))
    if not d.get('dong_tac') or not d.get('tam'): continue
    a = tai(d)[:, :, 3]
    n = d.get('net') or 1; fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    gx, gy = d['goc']; gx *= n; gy *= n
    H, W = a.shape
    for ten, t in d['dong_tac'].items():
        h = t['hang']; so = t['so']
        if (h + 1) * fh > H or so * fw > W:
            out.append(dict(tep=os.path.basename(f), hang=ten, loi='VUOT_ANH', H=H, W=W)); continue
        prev = None
        for i in range(so):
            c = a[h*fh:(h+1)*fh, i*fw:(i+1)*fw] > 24
            r = dict(tep=os.path.basename(f)[:-12], hang=ten, k=i, n=n)
            if not c.any():
                r['loi'] = 'RONG'; out.append(r); continue
            ys, xs = np.nonzero(c)
            r.update(day=(ys.max()+1 - gy)/n, dinh=(ys.min()-gy)/n, tx=(xs.mean()-gx)/n, trai=(xs.min()-gx)/n, phai=(xs.max()+1-gx)/n, so_px=int(c.sum()))
            # tâm cột ở 6 hàng đáy (chân)
            yb = ys.max(); m = ys >= yb - 3*n
            r['chan_x'] = (xs[m].mean()-gx)/n
            r['cham'] = ''.join(k for k, v in (('T', c[0].any()), ('D', c[-1].any()), ('L', c[:, 0].any()), ('R', c[:, -1].any())) if v)
            raw = a[h*fh:(h+1)*fh, i*fw:(i+1)*fw]
            r['trung_truoc'] = bool(prev is not None and np.array_equal(prev, raw))
            prev = raw
            out.append(r)
json.dump(out, open(sys.argv[2] if len(sys.argv) > 2 else 'do_khung.json', 'w'), ensure_ascii=False)
print(len(out))
