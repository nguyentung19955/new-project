# Đọc tấm sprite trùm vùng (game/art/custom/<mã>.sprite.json) và đo tâm thân trên sàn từng khung.
import json, base64, io, os
from PIL import Image
import numpy as np

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
TRUM = ['mocTinh', 'mocTinh-p2', 'mocTinh-p3', 'nguTinh', 'nguTinh-p2', 'nguTinh-p3', 'hoTinh', 'hoTinh-p2', 'hoTinh-p3']


def doc(ma):
    p = os.path.join(CUSTOM, ma + '.sprite.json')
    d = json.load(open(p, encoding='utf-8'))
    s = d.get('tam') or d.get('anh')
    im = Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')
    return d, im


def khung(d, im, ten, i):
    """Khung i của động tác ten, thu về cỡ điểm ảnh game (net = 1)."""
    n = d.get('net', 1); fw, fh = d['khung_rong'], d['khung_cao']; a = d['dong_tac'][ten]
    k = im.crop((i * fw * n, a['hang'] * fh * n, (i + 1) * fw * n, (a['hang'] + 1) * fh * n))
    return k.resize((fw, fh), Image.NEAREST) if n != 1 else k


def tam_than(d, im):
    """Tâm thân trên sàn từng khung: trung bình x của điểm ảnh đặc (alpha > 100) ở 35% dưới của thân (điểm ảnh game)."""
    n = d.get('net', 1); fw, fh = d['khung_rong'], d['khung_cao']; a = np.array(im)[:, :, 3]
    R = {}
    for k, v in d['dong_tac'].items():
        L = []
        for i in range(v['so']):
            s = a[v['hang'] * fh * n:(v['hang'] + 1) * fh * n, i * fw * n:(i + 1) * fw * n] > 100
            ys, xs = np.nonzero(s)
            if len(xs) == 0:
                L.append(None); continue
            yb = ys.max(); h = yb - ys.min(); sel = ys >= yb - 0.35 * h
            L.append(xs[sel].mean() / n)
        R[k] = L
    return R
