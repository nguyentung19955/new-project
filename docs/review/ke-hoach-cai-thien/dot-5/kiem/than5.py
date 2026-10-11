"""Đo thân không cần màu: đầu = vòng tròn nội tiếp lớn nhất ở nửa trên; tâm thân = trọng tâm phần còn lại, nặng theo bề dày bình phương
(tay chân mảnh nhẹ, thân dày nặng), như cách game đo điểm ngực (sprite_custom.js doNguc). In độ dời so với idle:0, cạnh số đo theo quần của Cu Tí."""
from ascii import tam, khung
import numpy as np, json, sys
from scipy import ndimage
HANG = [('idle', 6), ('move', 6), ('tele', 4), ('atk', 6), ('hit', 4)]
def do(key):
    t, im = tam(key); kq = {}
    for ten, n in HANG:
        for i in range(n):
            M = khung(t, im, ten, i)[..., 3] > 127
            D = ndimage.distance_transform_edt(np.pad(M, 1))[1:-1, 1:-1]
            ys, xs = np.nonzero(M); y0, y1 = ys.min(), ys.max(); yc = int(y0 + 0.6 * (y1 - y0 + 1))
            top = D[:yc]; R = top.max(); hy, hx = [v.mean() for v in np.nonzero(top >= R - 0.5)]
            Y, X = np.mgrid[0:48, 0:48]; w = np.where(np.hypot(X - hx, Y - hy) > R + 1.5, D ** 2, 0)
            kq['%s:%d' % (ten, i)] = (float((w * X).sum() / w.sum() - 24), float((w * Y).sum() / w.sum() - 45), float(hx - 24), float(hy - 45), float(R))
    r = kq['idle:0']
    return {k: [round(v[0] - r[0], 1), round(v[1] - r[1], 1), round(v[2] - r[2], 1), round(v[3] - r[3], 1)] for k, v in kq.items()}, r
if __name__ == '__main__':
    q = json.load(open('quan5.json'))['smith']; g = json.load(open('so-game.json'))
    R = {k: do(k) for k in ['smith', 'hunter', 'healer', 'wrestler']}
    for k in R: print(k, 'idle:0 thân, đầu, R =', [round(v, 1) for v in R[k][1]])
    print('khung | Cu Tí quần | thân (tâm) + đầu (vòng tròn) / đầu game đo: smith, hunter, healer, wrestler')
    for f in R['smith'][0]: print(f, q[f], '|', *[str(R[k][0][f]) + '/' + str(g[k]['khop'][f] and g[k]['khop'][f]['dau']) for k in R])
    json.dump({k: R[k][0] for k in R}, open(sys.argv[1], 'w'))
