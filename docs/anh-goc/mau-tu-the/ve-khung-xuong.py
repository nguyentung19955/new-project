#!/usr/bin/env python3
"""Vẽ khung xương tư thế (8 khung) cho chu kỳ đi bộ và chạy — dùng làm ảnh mẫu gửi kèm prompt.

Màu: ĐỎ = tay/chân GẦN người xem, XANH = tay/chân XA người xem, ĐEN = thân, vòng tròn = đầu.
Nhân vật quay mặt sang phải. Vạch ngang = mặt đất (chân chạm đất nằm đúng vạch).
Chạy: python3 ve-khung-xuong.py  → mau-di-bo-v2.png, mau-chay-v2.png
"""
import math
from PIL import Image, ImageDraw

DO, XANH, DEN = (220, 70, 50), (60, 110, 220), (40, 40, 40)
W, H = 170, 230
DUI, CANG = 34, 34          # đùi, cẳng chân
TAY_TREN, TAY_DUOI = 24, 22
THAN = 46
DAT = 205


def diem(goc_do, dai, x, y):
    a = math.radians(goc_do)          # 0 = thẳng xuống, + = ra trước (sang phải)
    return x + dai * math.sin(a), y + dai * math.cos(a)


def ve_chi(d, hong, dui, cang, mau, w=7):
    x1, y1 = diem(dui, DUI, *hong)
    x2, y2 = diem(dui + cang, CANG, x1, y1)
    d.line([hong, (x1, y1), (x2, y2)], fill=mau, width=w, joint='curve')
    d.line([(x2, y2), (x2 + 9, y2)], fill=mau, width=w)  # bàn chân hướng phải
    return y2


def ve_tay(d, vai, tren, duoi, mau, w=6):
    x1, y1 = diem(tren, TAY_TREN, *vai)
    x2, y2 = diem(tren + duoi, TAY_DUOI, x1, y1)
    d.line([vai, (x1, y1), (x2, y2)], fill=mau, width=w, joint='curve')
    d.ellipse([x2 - 4, y2 - 4, x2 + 4, y2 + 4], fill=mau)


def khung(d, ox, nghieng, nhap, chan_gan, chan_xa, tay_gan, tay_xa, bay=0):
    # đặt hông sao cho chân thấp nhất chạm đất (trừ khi đang bay)
    hx = ox + W / 2
    tam = Image.new('RGB', (1, 1))
    def day(hong_y):
        thap = 0
        for dui, cang in (chan_gan, chan_xa):
            x1, y1 = diem(dui, DUI, hx, hong_y)
            x2, y2 = diem(dui + cang, CANG, x1, y1)
            thap = max(thap, y2)
        return thap
    hy = DAT - (day(0)) - bay
    vai = diem(180 - nghieng, THAN, hx, hy)
    dau = diem(180 - nghieng, THAN + 22, hx, hy)
    # chi xa vẽ trước (nằm sau), chi gần vẽ sau
    ve_tay(d, vai, *tay_xa, XANH)
    ve_chi(d, (hx, hy), *chan_xa, XANH)
    d.line([(hx, hy), vai], fill=DEN, width=10)
    d.ellipse([dau[0] - 17, dau[1] - 17, dau[0] + 17, dau[1] + 17], fill=(235, 235, 235), outline=DEN, width=3)
    d.ellipse([dau[0] + 7, dau[1] - 4, dau[0] + 11, dau[1]], fill=DEN)  # mắt: hướng nhìn
    ve_chi(d, (hx, hy), *chan_gan, DO)
    ve_tay(d, vai, *tay_gan, DO)


def ve(ten, ds, nghieng):
    im = Image.new('RGB', (W * len(ds), H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.line([(0, DAT + 4), (im.width, DAT + 4)], fill=(170, 170, 170), width=2)
    for i, (cg, cx, tg, tx, bay) in enumerate(ds):
        khung(d, i * W, nghieng, 0, cg, cx, tg, tx, bay)
    im.save(ten)
    print(ten, im.size)


# (đùi, gối) góc độ; tay (vai, khuỷu)
# ĐI BỘ: 1 chạm gót – 2 dồn người (thấp) – 3 bước qua (cao) – 4 nhón (cao nhất); 5–8 đổi chân
di_nua = [
    ((28, -4), (-22, -28), (-24, 20), (22, 30), 0),     # 1 chạm gót: chân gần trước, tay gần sau
    ((14, -14), (-12, -55), (-14, 22), (14, 32), 0),   # 2 dồn người, người hạ thấp
    ((0, 0), (12, -62), (0, 22), (0, 28), 0),           # 3 bước qua: chân xa co qua, người cao
    ((-16, -8), (26, -18), (16, 26), (-16, 22), 0),     # 4 nhón gót, chân xa vươn tới
]
di = di_nua + [(cx, cg, tx, tg, b) for (cg, cx, tg, tx, b) in di_nua]

# CHẠY: 1 chạm đất – 2 dồn lực (thấp nhất) – 3 đạp – 4 BAY (hai chân rời đất); 5–8 đổi chân
chay_nua = [
    ((22, -12), (-30, -75), (-40, 85), (40, 80), 0),
    ((8, -38), (-5, -95), (-25, 90), (25, 85), -6),
    ((-32, -20), (50, -85), (30, 80), (-35, 90), 2),
    ((-38, -70), (45, -25), (40, 75), (-40, 85), 14),
]
chay = chay_nua + [(cx, cg, tx, tg, b) for (cg, cx, tg, tx, b) in chay_nua]

if __name__ == '__main__':
    ve("mau-di-bo-v2.png", di, 3)
    ve("mau-chay-v2.png", chay, 20)
