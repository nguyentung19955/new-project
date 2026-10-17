"""Ảnh so sánh NÉT 2 | NÉT 3 | NÉT 4 cho một nhóm mã (cùng cỡ hiện: 12 điểm màn / 1 điểm game, phóng điểm gần nhất).
  python3 xem.py <tên ra> mã,mã,…  [--nen 28,30,44]   → ../anh/<tên ra>.png"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chung import doc_tam, net_cua, RA

ANH = os.path.join(HERE, '..', 'anh'); os.makedirs(ANH, exist_ok=True)
DS = int(os.environ.get("DS", 12))  # điểm màn / điểm game


def tren_nen(a, nen):
    out = np.zeros(a.shape[:2] + (3,), np.float32) + nen
    al = a[..., 3:4] / 255.0
    return (a[..., :3] * al + out * (1 - al)).astype(np.uint8)


def hang(ma, nen, toi_da=1500):
    d, a = doc_tam(ma)
    n0 = net_cua(d)
    anh = [(n0, a)]
    for n in (3, 4):
        p = os.path.join(RA, 'net-cao', '%s.n%d.png' % (ma, n))
        if os.path.exists(p):
            anh.append((n, np.array(Image.open(p).convert('RGBA'))))
    gw = a.shape[1] / n0
    k = DS
    if gw * k > toi_da:
        k = max(2, int(toi_da / gw))
    out = []
    for n, b in anh:
        W = int(round(b.shape[1] / n * k)); H = int(round(b.shape[0] / n * k))
        out.append((n, Image.fromarray(tren_nen(b, nen)).resize((W, H), Image.NEAREST)))
    return out


if __name__ == '__main__':
    ten, mas = sys.argv[1], sys.argv[2].split(',')
    nen = (28, 30, 44)
    if '--nen' in sys.argv:
        nen = tuple(int(x) for x in sys.argv[sys.argv.index('--nen') + 1].split(','))
    rows = []
    for ma in mas:
        rows.append((ma, hang(ma, nen)))
    W = max(sum(im.width for n, im in r) + 12 * len(r) for ma, r in rows) + 10
    H = sum(max(im.height for n, im in r) + 22 for ma, r in rows) + 10
    can = Image.new('RGB', (W, H), (12, 12, 16)); dr = ImageDraw.Draw(can)
    y = 6
    for ma, r in rows:
        x = 6
        dr.text((x, y), ma, fill=(230, 230, 230))
        for n, im in r:
            dr.text((x + 2, y + 10), 'net %d' % n, fill=(255, 210, 120))
            can.paste(im, (x, y + 20)); x += im.width + 12
        y += max(im.height for n, im in r) + 22
    can.save(os.path.join(ANH, ten + '.png'))
    print(os.path.join(ANH, ten + '.png'), can.size)
