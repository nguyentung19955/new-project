"""Đo bàn tay phía trước mặt (tay_truoc) trên từng khung thân AI: điểm xa nhất về phía trước trong dải hàng của cánh tay (dưới đầu,
trên chân), lùi vào 1,5 điểm ảnh (viền + nửa nắm tay). Có bảng sửa tay sau khi soi mắt. Dùng chung cho taoghep5.py."""
from ascii import tam, khung
import numpy as np
HANG = [('idle', 6), ('move', 6), ('tele', 4), ('atk', 6), ('hit', 4)]
DAI = {'idle': (-13, -6), 'move': (-14, -8), 'tele': (-13, -9), 'atk': (-16, -9), 'hit': (-17, -11)}
# Sửa tay sau khi soi (ghi trong báo cáo). Hàng lấy đà (tele): em bé chúi người, tay phía trước mặt bị đầu che; bàn tay còn thấy là
# tay gần người xem đang kéo ra SAU (tư thế lấy đà) → lấy bàn tay đó (soi trên ảnh phóng to và bảng điểm ảnh).
TELE = {'smith': [-5, -11.5], 'hunter': [-5, -10], 'healer': [-5, -10.5], 'wrestler': [-3.5, -10]}
SUA = {(k, 'tele:%d' % i): v for k, v in TELE.items() for i in range(4)}


def tay(key):
    t, im = tam(key); kq = {}
    for ten, n in HANG:
        y0, y1 = DAI[ten]
        for i in range(n):
            k = '%s:%d' % (ten, i)
            if (key, k) in SUA: kq[k] = list(SUA[(key, k)]); continue
            M = khung(t, im, ten, i)[..., 3] > 127
            B = M[45 + y0:45 + y1 + 1]; ys, xs = np.nonzero(B); xm = xs.max()
            col = ys[xs >= xm - 1]  # hai cột ngoài cùng của nắm tay
            kq[k] = [float(xm - 1.5 - 24), float(round((col.min() + col.max()) / 2 * 2) / 2 + y0)]
    return kq


if __name__ == '__main__':
    for k in ['smith', 'hunter', 'healer', 'wrestler']:
        print(k, tay(k))
