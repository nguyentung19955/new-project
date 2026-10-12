#!/usr/bin/env python3
"""Vẽ khung xương tư thế cho TỪNG động tác của Zed (ảnh mẫu gửi kèm prompt 01–27).

Màu: ĐỎ = tay/chân GẦN người xem, XANH = XA, ĐEN = thân, vòng tròn = đầu (chấm = mắt, hướng nhìn).
Nét đứt XÁM = hướng vũ khí (chỉ để chỉ đường vung — AI KHÔNG vẽ vũ khí).
Góc (độ): 0 = thẳng xuống, + = ra trước (phải), 90 = ngang ra trước, 180 = thẳng lên, -90 = ngang ra sau.
Chân (đùi, gối) và tay (vai, khuỷu): góc đoạn trên tuyệt đối, đoạn dưới cộng thêm.
Tự đặt điểm thấp nhất (chân/đầu/tay) chạm vạch đất, trừ khi 'bay' > 0.
Chạy: python3 ve-tu-the.py  → tu-the/NN-ten.png
"""
import math, os
from PIL import Image, ImageDraw

DO, XANH, DEN, XAM = (220, 70, 50), (60, 110, 220), (40, 40, 40), (140, 140, 140)
W, H, DAT = 200, 240, 215
DUI, CANG, TAY_TREN, TAY_DUOI, THAN, R_DAU = 34, 34, 24, 22, 46, 17


def diem(g, d, x, y):
    a = math.radians(g)
    return x + d * math.sin(a), y + d * math.cos(a)


def P(nghieng=5, cg=(22, -8), cx=(-20, 6), tg=(20, 95), tx=(-5, 105), bay=0, vk=None):
    return dict(n=nghieng, cg=cg, cx=cx, tg=tg, tx=tx, bay=bay, vk=vk)


TT = P()


def hinh(p, hx, hy):
    vai = diem(180 - p['n'], THAN, hx, hy)
    dau = diem(180 - p['n'], THAN + R_DAU + 5, hx, hy)
    def chi(goc, d1, d2, x, y):
        a = diem(goc[0], d1, x, y)
        b = diem(goc[0] + goc[1], d2, *a)
        return [(x, y), a, b]
    return dict(vai=vai, dau=dau,
                cg=chi(p['cg'], DUI, CANG, hx, hy), cx=chi(p['cx'], DUI, CANG, hx, hy),
                tg=chi(p['tg'], TAY_TREN, TAY_DUOI, *vai), tx=chi(p['tx'], TAY_TREN, TAY_DUOI, *vai))


def net_dut(d, a, b, mau, w=4, dai=7, ho=5):
    L = math.dist(a, b)
    if L < 1:
        return
    ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    t = 0
    while t < L:
        e = min(L, t + dai)
        d.line([(a[0] + ux * t, a[1] + uy * t), (a[0] + ux * e, a[1] + uy * e)], fill=mau, width=w)
        t += dai + ho


def ve_vk(d, tay, vk):
    if not vk:
        return
    loai, goc = vk
    if loai == 'kiem':
        net_dut(d, tay, diem(goc, 62, *tay), XAM)
    elif loai == 'thuong':
        net_dut(d, diem(goc + 180, 42, *tay), diem(goc, 72, *tay), XAM)
        x, y = diem(goc, 72, *tay)
        d.polygon([diem(goc, 10, x, y), diem(goc + 90, 5, x, y), diem(goc - 90, 5, x, y)], outline=XAM, width=2)
    elif loai == 'bua':
        x, y = diem(goc, 52, *tay)
        net_dut(d, tay, (x, y), XAM)
        g = [diem(goc + 90, 12, x, y), diem(goc - 90, 12, x, y)]
        g = g + [diem(goc, 12, *g[1]), diem(goc, 12, *g[0])]
        d.polygon(g, outline=XAM, width=2)


def khung(d, ox, p):
    hx = ox + W / 2
    h0 = hinh(p, hx, 0)
    thap = max([pt[1] for k in ('cg', 'cx', 'tg', 'tx') for pt in h0[k]] + [h0['dau'][1] + R_DAU])
    hy = DAT - thap - p['bay']
    h = hinh(p, hx, hy)
    d.line(h['tx'], fill=XANH, width=6, joint='curve'); d.ellipse([h['tx'][2][0] - 4, h['tx'][2][1] - 4, h['tx'][2][0] + 4, h['tx'][2][1] + 4], fill=XANH)
    d.line(h['cx'], fill=XANH, width=7, joint='curve')
    d.line([(hx, hy), h['vai']], fill=DEN, width=10)
    x, y = h['dau']
    d.ellipse([x - R_DAU, y - R_DAU, x + R_DAU, y + R_DAU], fill=(235, 235, 235), outline=DEN, width=3)
    mx, my = diem(180 - p['n'] - 70, 9, x, y)  # mắt nhìn ra trước theo thân
    d.ellipse([mx - 2.5, my - 2.5, mx + 2.5, my + 2.5], fill=DEN)
    d.line(h['cg'], fill=DO, width=7, joint='curve')
    d.line(h['tg'], fill=DO, width=6, joint='curve'); d.ellipse([h['tg'][2][0] - 4, h['tg'][2][1] - 4, h['tg'][2][0] + 4, h['tg'][2][1] + 4], fill=DO)
    ve_vk(d, h['tg'][2], p['vk'])


def ve(ten, ds):
    im = Image.new('RGB', (W * len(ds), H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.line([(0, DAT + 4), (im.width, DAT + 4)], fill=(170, 170, 170), width=2)
    for i, p in enumerate(ds):
        khung(d, i * W, p)
    im.save(ten)
    print(ten, len(ds), 'khung')


CHAN_RONG = dict(cg=(35, -5), cx=(-32, 5))
def K(g): return ('kiem', g)
def T(g): return ('thuong', g)
def B(g): return ('bua', g)

# thế thủ cầm thương / búa (hai tay)
TT_T = P(tg=(30, 60), tx=(-10, 95), vk=T(85))
TT_B = P(tg=(20, 70), tx=(10, 80), vk=B(140))
TT_K = P(tg=(10, 80), vk=K(120))

DONG_TAC = {
    '01-dung': [P(bay=0), P(bay=1), P(bay=2), P(bay=2), P(bay=1), P(bay=0), P(bay=-1), P(bay=-1)],
    '04-lon': [P(40, (35, -60), (-30, -20), (70, 20), (60, 20)),
               P(100, (10, -80), (-20, -60), (20, 10), (10, 10)),
               P(160, (140, -130), (150, -130), (150, -90), (140, -90)),
               P(230, (60, -120), (70, -110), (-60, 30), (-50, 30)),
               P(30, (70, -120), (-10, -100), (60, 30), (50, 30)),
               TT],
    '05-trung-don': [P(-15, (15, -5), (-25, 5), (-30, 20), (-40, 20)),
                     P(-25, (20, -5), (-30, 5), (-45, 20), (-55, 20)),
                     P(-5, (20, -10), (-22, 5), (0, 60), (-15, 60)),
                     TT],
    '06-chet': [P(-20, (15, -5), (-25, 5), (-60, -20), (-70, -20)),
                P(-10, (25, -10), (-10, 0), (-20, 10), (-30, 10)),
                P(10, (-5, -10), (15, -5), (10, 0), (0, 0)),
                P(20, (20, -100), (70, -70), (5, 0), (-5, 0)),
                P(60, (10, -90), (-10, -60), (90, 10), (80, 10)),
                P(90, (-80, 0), (-85, 0), (100, 0), (60, 0)),
                P(90, (-85, 0), (-88, 0), (95, 0), (60, 0)),
                P(90, (-85, 0), (-88, 0), (95, 0), (60, 0))],
    '07-chuong': [P(tg=(-25, 85), tx=(-30, 85)),
                  P(15, tg=(85, 0), tx=(80, 0), **CHAN_RONG),
                  P(15, tg=(85, 0), tx=(80, 0), **CHAN_RONG),
                  P(15, tg=(85, 0), tx=(80, 0), **CHAN_RONG),
                  P(8, tg=(40, 60), tx=(30, 60)),
                  TT],
    '08-kiem-1': [TT_K,
                  P(-5, tg=(-110, 40), vk=K(-150)),
                  P(15, tg=(90, 0), vk=K(90), **CHAN_RONG),
                  P(20, tg=(70, 30), vk=K(60), **CHAN_RONG),
                  TT_K],
    '09-kiem-2': [P(5, tg=(40, -10), vk=K(30)),
                  P(20, (40, -50), (-25, -30), tg=(10, -10), vk=K(-20)),
                  P(5, tg=(120, 0), vk=K(135), **CHAN_RONG),
                  P(-5, tg=(165, 0), vk=K(180)),
                  TT_K],
    '10-kiem-3': [P(0, (10, 0), (-35, 5), (170, 10), (165, 10), vk=K(-160)),
                  P(-10, (10, 0), (-35, 5), (175, 10), (170, 10), bay=4, vk=K(-150)),
                  P(35, (50, -70), (-30, -40), (60, 0), (55, 0), vk=K(40)),
                  P(35, (50, -70), (-30, -40), (60, 0), (55, 0), vk=K(40)),
                  P(15, (30, -30), (-25, -10), (40, 20), (30, 20), vk=K(80)),
                  TT_K],
    '11-thuong-1': [TT_T,
                    P(-5, tg=(-20, 80), tx=(-40, 90), vk=T(88)),
                    P(20, tg=(85, 0), tx=(70, 15), vk=T(90), **CHAN_RONG),
                    P(20, tg=(85, 0), tx=(70, 15), vk=T(90), **CHAN_RONG),
                    P(10, tg=(50, 40), tx=(20, 70), vk=T(88)),
                    TT_T],
    '12-thuong-2': [P(15, (35, -40), (-25, -20), (20, 40), (0, 50), vk=T(70)),
                    P(10, (35, -40), (-25, -20), (-20, 60), (-30, 70), vk=T(70)),
                    P(5, tg=(120, 0), tx=(110, 10), vk=T(125), **CHAN_RONG),
                    P(5, tg=(120, 0), tx=(110, 10), vk=T(125), **CHAN_RONG),
                    P(5, tg=(60, 30), tx=(30, 60), vk=T(100)),
                    TT_T],
    '13-thuong-3': [TT_T,
                    P(0, tg=(-30, 90), tx=(-45, 95), vk=T(90)),
                    P(35, (60, -20), (-50, 0), (90, 0), (80, 10), vk=T(90)),
                    P(35, (60, -20), (-50, 0), (90, 0), (80, 10), vk=T(90)),
                    P(15, (35, -10), (-35, 5), (40, 50), (20, 70), vk=T(88)),
                    TT_T],
    '14-thuong-quet': [P(-10, tg=(-80, 20), tx=(-70, 20), vk=T(-100)),
                       P(0, tg=(-20, 0), tx=(-10, 0), vk=T(-45)),
                       P(15, (40, -5), (-40, 5), (90, 0), (80, 10), vk=T(95)),
                       P(20, (40, -5), (-40, 5), (40, 30), (30, 30), vk=T(50)),
                       P(10, tg=(30, 50), tx=(10, 70), vk=T(75)),
                       TT_T],
    '15-thuong-giu': [P(20, (45, -60), (-40, -20), (-10, 95), (-30, 100), vk=T(92)),
                      P(20, (47, -64), (-42, -22), (-10, 95), (-30, 100), bay=-2, vk=T(92)),
                      P(20, (45, -60), (-40, -20), (-10, 95), (-30, 100), bay=-1, vk=T(92))],
    '16-thuong-xoc': [P(70, (30, -20), (-60, 0), (90, 0), (85, 5), bay=12, vk=T(90)),
                      P(75, (-20, -10), (-70, 0), (90, 0), (85, 5), bay=8, vk=T(90)),
                      P(35, (45, -50), (-30, -30), (80, 10), (70, 20), vk=T(90)),
                      P(15, tg=(60, 30), tx=(40, 50), vk=T(88))],
    '17-bua-nen': [TT_B,
                   P(-15, tg=(175, 0), tx=(170, 0), vk=B(-150)),
                   P(45, (50, -70), (-35, -40), (55, 0), (50, 0), vk=B(45)),
                   P(45, (50, -70), (-35, -40), (55, 0), (50, 0), vk=B(45)),
                   P(45, (50, -70), (-35, -40), (55, 0), (50, 0), bay=-1, vk=B(45)),
                   P(25, (35, -40), (-30, -20), (40, 30), (35, 30), vk=B(80)),
                   P(10, tg=(25, 60), tx=(15, 70), vk=B(120)),
                   TT_B],
    '18-bua-giu': [P(15, (40, -40), (-35, -15), (-60, 40), (-70, 40), vk=B(-100)),
                   P(15, (42, -44), (-36, -17), (-60, 40), (-70, 40), bay=-1, vk=B(-100)),
                   P(20, (55, -80), (-45, -40), (-80, 30), (-90, 30), vk=B(-110)),
                   P(20, (57, -84), (-46, -42), (-80, 30), (-90, 30), bay=-2, vk=B(-110))],
    '19-bua-nen-dat': [P(-10, (20, -60), (-20, -50), (175, 0), (170, 0), bay=14, vk=B(-150)),
                       P(20, (25, -40), (-15, -30), (120, 0), (115, 0), bay=8, vk=B(160)),
                       P(50, (60, -110), (-40, -80), (40, 0), (35, 0), vk=B(45)),
                       P(50, (60, -110), (-40, -80), (40, 0), (35, 0), vk=B(45)),
                       P(25, (35, -50), (-30, -25), (30, 40), (25, 40), vk=B(60)),
                       TT_B],
    '20-phi-tieu': [P(tg=(-10, 40), tx=(30, 80)),
                    P(-10, tg=(-120, 60), tx=(60, 30)),
                    P(20, tg=(95, 0), tx=(-40, 20), **CHAN_RONG),
                    P(25, tg=(60, 10), tx=(-40, 10), **CHAN_RONG),
                    P(10, tg=(30, 60), tx=(-15, 80)),
                    TT],
    '21-phi-tieu-ngam': [P(-3, tg=(-60, 80), tx=(90, 0)),
                         P(-8, tg=(-90, 70), tx=(90, 0)),
                         P(-15, tg=(-120, 60), tx=(90, 0))],
    '22-phi-tieu-chum': [P(20, tg=(95, 0), tx=(-50, 20), **CHAN_RONG),
                         P(30, (45, -20), (-35, 0), (70, 0), (-40, 10)),
                         P(-5, (20, -10), (-30, 0), (30, 40), (-20, 40)),
                         P(0, tg=(20, 70), tx=(-10, 90)),
                         P(3, tg=(20, 85), tx=(-5, 100)),
                         TT],
    '23-tram-nguyet': [P(-10, tg=(-130, 30), vk=K(-170)),
                       P(20, tg=(90, 0), vk=K(80), **CHAN_RONG),
                       P(5, (10, 0), (-35, 0), (60, 30), vk=K(60)),
                       P(5, tg=(30, 60), vk=K(90)),
                       P(5, tg=(15, 75), vk=K(110)),
                       TT_K],
    '24-phi-thuong': [P(-15, tg=(-110, 40), tx=(70, 20), vk=T(95)),
                      P(25, tg=(110, 0), tx=(-30, 20), vk=T(100), **CHAN_RONG),
                      P(30, tg=(70, 0), tx=(-30, 20), **CHAN_RONG),
                      P(15, tg=(40, 50), tx=(-15, 80)),
                      P(8, tg=(25, 80), tx=(-8, 100)),
                      TT],
    '25-dia-chan': [P(-10, tg=(175, 0), tx=(170, 0), vk=B(-150)),
                    P(50, (60, -110), (-40, -80), (40, 0), (35, 0), vk=B(45)),
                    P(50, (60, -110), (-40, -80), (40, 0), (35, 0), vk=B(45)),
                    P(30, (40, -60), (-30, -35), (30, 40), (25, 40), vk=B(60)),
                    P(15, (30, -25), (-25, -10), (25, 60), (15, 70), vk=B(110)),
                    TT_B],
    '26-mua-phi-tieu': [P(25, (40, -50), (-30, -30), (-10, 10), (-15, 10)),
                        P(-15, (15, 0), (-15, 0), (170, 0), (160, 0)),
                        P(-15, (15, 0), (-15, 0), (170, 0), (160, 0)),
                        P(-5, tg=(120, 20), tx=(110, 20)),
                        P(0, tg=(60, 40), tx=(40, 50)),
                        TT],
    '27-dam': [TT,
               P(-5, tg=(-30, 100)),
               P(15, tg=(90, 0), **CHAN_RONG),
               P(15, tg=(90, 0), **CHAN_RONG),
               TT],
}

if __name__ == '__main__':
    os.makedirs('tu-the', exist_ok=True)
    for ten, ds in DONG_TAC.items():
        ve(os.path.join('tu-the', ten + '.png'), ds)
