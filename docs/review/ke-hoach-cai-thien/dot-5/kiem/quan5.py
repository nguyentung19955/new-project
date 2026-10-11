"""Đo eo theo mép trên quần / khố (như dot-3/kiem/quan.py nhưng đọc thẳng tấm ảnh nét 2). In độ dời so với idle:0."""
from ascii import tam
import numpy as np, colorsys, json, sys
HANG = [('idle', 6), ('move', 6), ('tele', 4), ('atk', 6), ('hit', 4)]
LOC = {
    'smith': lambda h, s, v: 0.18 < h < 0.42 and s > 0.25 and 0.2 < v < 0.75,
    'hunter': lambda h, s, v: 0.17 < h < 0.42 and s > 0.3 and 0.2 < v < 0.75,
    'wrestler': lambda h, s, v: (h > 0.9 or h < 0.1) and s > 0.38 and 0.25 < v < 0.75,
}
def do(key):
    t, im = tam(key); a = np.asarray(im); kq = {}
    for ten, n in HANG:
        hg = t['dong_tac'][ten]['hang']
        for i in range(n):
            F = a[hg * 96:(hg + 1) * 96, i * 96:(i + 1) * 96]; pts = []
            for Y in range(96):
                for X in range(96):
                    r, g, b, al = [int(q) for q in F[Y, X]]
                    if al < 200 or Y / 2 - 45 < -12.5: continue   # bỏ vùng đầu, tóc
                    if LOC[key](*colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)): pts.append((X, Y))
            ys = sorted(p[1] for p in pts); y0 = ys[len(ys) // 20]
            xs = [p[0] for p in pts if p[1] <= y0 + 3]
            kq['%s:%d' % (ten, i)] = (sum(xs) / len(xs) / 2 - 24, y0 / 2 - 45, len(pts))
    r = kq['idle:0']
    return {k: [round(v[0] - r[0], 1), round(v[1] - r[1], 1)] for k, v in kq.items()}, r
if __name__ == '__main__':
    R = {k: do(k) for k in LOC}
    for k in R: print(k, 'idle:0 =', R[k][1])
    for f in R['smith'][0]: print(f, *[R[k][0][f] for k in LOC])
    json.dump({k: R[k][0] for k in R}, open(sys.argv[1], 'w'))
