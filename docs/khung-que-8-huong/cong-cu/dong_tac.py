# -*- coding: utf-8 -*-
"""27 động tác của Cu Tí: số khung, thời lượng, khung chạm (★) GIỮ ĐÚNG như game hiện tại
(mục `dong_tac` trong tệp sprite.json bộ ninja của Cu Tí mới ở game/art/custom + bảng MOC trong tệp vẽ Cu Tí mới ở game/js), và tư thế từng khung.

Mỗi khung là 1 dict tham số góc (xem xuong.GOC_TU_THE). Tư thế viết theo "nhìn ngang" (thân x = trước mặt);
xuong.fk() tự xoay cho 5 hướng. Nguyên tắc mượt: khớp nào cũng đổi <= 45° giữa 2 khung liền nhau,
lấy đà bằng thân + chân (vặn eo, dồn trọng tâm) để tay không phải giật xa, khung dư (follow-through) đi tiếp theo cung.
"""
import math

# ---------- tư thế thủ (ready) theo ảnh 01-dung: chân trước phải, hai nắm tay trước bụng ----------
THU = dict(lean=4, Ph=12, Phb=6, Pk=14, Th=-10, Thb=6, Tk=10,
           Pa=25, Pb=18, Pe=75, Ta=20, Tb=18, Te=80, wp=-40)


def T(base=None, **kw):
    d = dict(THU if base is None else base)
    d.update(kw)
    return d


def tron(a, b, t):
    """Nội suy 2 tư thế (theo góc -> điểm đi theo cung)."""
    ks = set(a) | set(b)
    return {k: a.get(k, 0) * (1 - t) + b.get(k, 0) * t for k in ks}


def deu(n, giay):
    return [round(i / n, 4) for i in range(n)]


# ---------------- vòng lặp ----------------
def dung():
    out = []
    for i in range(8):
        b = (1 - math.cos(2 * math.pi * i / 8)) / 2  # thở: 0 -> 1 (khung 5) -> 0
        out.append(T(Pk=14 + 5 * b, Tk=10 + 5 * b, Ph=12 + 2 * b, Th=-10 + 2 * b, lean=4 + 2 * b, hp=2 * b,
                     Pa=25 + 4 * b, Pe=75 + 6 * b, Ta=20 + 4 * b, Te=80 + 6 * b))
    return out


def di():
    out = []
    for i in range(8):
        f = 2 * math.pi * i / 8
        c, s = math.cos(f), math.sin(f)
        out.append(dict(lean=6, ry=4 * c, tw=-8 * c, hp=0,
                        Ph=22 * c, Phb=4, Pk=8 + 32 * max(0, -s), Pt=10 * max(0, -c),
                        Th=-22 * c, Thb=4, Tk=8 + 32 * max(0, s), Tt=10 * max(0, c),
                        Pa=12 - 30 * c, Pb=10, Pe=35 + 8 * max(0, -c), Ta=12 + 30 * c, Tb=10, Te=35 + 8 * max(0, c),
                        wp=-40))
    return out


def chay():
    out = []
    for i in range(12):
        f = 2 * math.pi * i / 12
        c, s = math.cos(f), math.sin(f)
        out.append(dict(lean=15, ry=6 * c, tw=-12 * c, hp=-6, lz=2.0 * c * c,
                        Ph=38 * c - 5, Phb=4, Pk=max(12, 30 - 50 * s), Pt=18 * max(0, -c),
                        Th=-38 * c - 5, Thb=4, Tk=max(12, 30 + 50 * s), Tt=18 * max(0, c),
                        Pa=20 - 45 * c, Pb=12, Pe=85, Ta=20 + 45 * c, Tb=12, Te=85, wp=-40))
    return out


# ---------------- di chuyển / bị đánh ----------------
def lon():
    co = dict(Pb=10, Tb=10)
    return [
        dict(co, rp=20, lean=25, hp=-5, Ph=50, Pk=70, Th=0, Tk=40, Pa=70, Pe=20, Ta=65, Te=25),     # 1 cúi lấy đà, hai tay với tới
        dict(co, rp=65, lean=35, hp=25, Ph=85, Pk=105, Th=40, Tk=85, Pa=100, Pe=10, Ta=95, Te=15),  # 2 chúi xuống, tay chống đất
        dict(co, rp=150, lean=40, hp=45, Ph=110, Pk=130, Th=80, Tk=125, Pa=60, Pe=50, Ta=55, Te=55),  # 3 cuộn tròn (lộn ngược)
        dict(co, rp=245, lean=40, hp=40, Ph=100, Pk=115, Th=80, Tk=110, Pa=55, Pe=55, Ta=50, Te=60),  # 4 cuộn tròn (qua lưng)
        dict(co, rp=330, lean=25, hp=10, Ph=65, Pk=80, Th=40, Tk=75, Pa=40, Pe=50, Ta=35, Te=55),    # 5 quỳ gối bật dậy
        dict(co, rp=360, lean=8, hp=0, Ph=25, Pk=40, Th=0, Tk=38, Pa=25, Pe=70, Ta=20, Te=75),       # 6 về thế thủ (hơi thấp)
    ]


def trung():
    return [
        T(rp=-10, lean=-10, hp=-25, Pa=40, Pb=35, Pe=35, Ta=35, Tb=35, Te=35, Pk=20, Tk=18),   # 1 trúng: đầu bật ngửa
        T(rp=-15, lean=-16, hp=-30, Pa=55, Pb=45, Pe=25, Ta=50, Tb=45, Te=25, Pk=24, Tk=22, Ph=18),  # 2 bật lùi xa nhất
        T(rp=-7, lean=-5, hp=-12, Pa=38, Pb=28, Pe=50, Ta=32, Tb=28, Te=55, Pk=18, Tk=14),     # 3 hồi lại
        T(rp=-2, lean=2, hp=-3, Pa=28, Pb=20, Pe=68, Ta=23, Tb=20, Te=73),                     # 4 gần về thế thủ
    ]


def chet():
    return [
        T(rp=-12, lean=-12, hp=-28, Pa=45, Pb=40, Pe=30, Ta=40, Tb=40, Te=30, Pk=22, Tk=20),          # 1 trúng đòn cuối
        T(rp=-25, lean=-15, hp=-30, Pa=60, Pb=50, Pe=25, Ta=55, Tb=50, Te=25, Ph=30, Pk=50, Th=10, Tk=45),  # 2 khuỵu gối, ngửa ra
        T(rp=-48, lean=-12, hp=-25, Pa=80, Pb=55, Pe=20, Ta=75, Tb=55, Te=20, Ph=45, Pk=60, Th=30, Tk=55),  # 3 ngã ngửa
        T(rp=-72, lean=-6, hp=-15, Pa=100, Pb=60, Pe=15, Ta=95, Tb=60, Te=15, Ph=40, Pk=45, Th=30, Tk=40),  # 4 sắp chạm đất
        T(rp=-90, lean=0, hp=-5, Pa=120, Pb=60, Pe=10, Ta=115, Tb=60, Te=10, Ph=20, Pk=25, Th=15, Tk=20),   # 5 chạm đất
        T(rp=-86, lean=0, hp=-12, lz=2, Pa=110, Pb=62, Pe=15, Ta=105, Tb=62, Te=15, Ph=28, Pk=32, Th=22, Tk=28),  # 6 nảy nhẹ
        T(rp=-90, lean=0, hp=-4, Pa=118, Pb=65, Pe=8, Ta=113, Tb=65, Te=8, Ph=12, Pk=14, Th=8, Tk=12),   # 7 nằm xuống
        T(rp=-90, lean=0, hp=0, Pa=120, Pb=66, Pe=5, Ta=115, Tb=66, Te=5, Ph=8, Pk=8, Th=5, Tk=8),       # 8 nằm yên
    ]


def chuong():
    return [
        T(),                                                                                      # 1 thế thủ
        T(tw=-30, lean=-4, Pa=-10, Pe=100, Pb=12, Ta=10, Tc=35, Te=100, Ph=6, Pk=20, Th=-14, Tk=22),  # 2 thu hai tay về hông phải (lấy đà)
        T(tw=-8, lean=4, Pa=33, Pe=72, Pb=10, Ta=40, Tc=25, Te=70, Ph=20, Pk=22, Th=-16, Tk=10),     # 3 bắt đầu đẩy
        T(tw=15, lean=12, Pa=75, Pe=28, Pb=8, Ta=78, Tc=18, Te=30, Ph=30, Pk=28, Th=-22, Tk=6),      # 4 ★ đẩy chưởng ra hết
        T(tw=12, lean=10, Pa=72, Pe=32, Pb=8, Ta=74, Tc=18, Te=34, Ph=28, Pk=26, Th=-20, Tk=6),      # 5 giữ (dư)
        T(tw=4, lean=6, Pa=42, Pe=62, Pb=14, Ta=36, Tc=8, Te=68, Ph=18, Pk=18, Th=-13, Tk=8),       # 6 thu về
    ]


# ---------------- KIẾM (S = góc kiếm so với chiều xuống, tính tới: a + e + 90 + wp - lean) ----------------
KTHU = T(Pa=50, Pb=15, Pe=55, wp=-40, Ta=30, Te=75)  # thủ kiếm: kiếm chếch lên trước


def kiem_1():  # chém chéo từ trên sau xuống trước
    return [
        T(KTHU),
        T(KTHU, Pa=92, Pb=24, Pe=80, wp=0, tw=-24, lean=-2, hp=-4, Ta=45, Te=60, Ph=8, Pk=22, Th=-16, Tk=30),   # 2 lấy đà: kiếm ra sau đầu
        T(KTHU, Pa=55, Pb=12, Pe=35, wp=-45, tw=6, lean=24, hp=6, Ta=20, Te=80, Ph=35, Pk=32, Th=-26, Tk=12),  # 3 ★ chém qua trước mặt
        T(KTHU, Pa=30, Pb=10, Pe=20, wp=-60, tw=22, lean=30, hp=8, Ta=15, Te=80, Ph=36, Pk=34, Th=-26, Tk=12),  # 4 dư: kiếm xuống thấp
        T(KTHU, Pa=45, Pb=14, Pe=50, wp=-45, tw=6, lean=10, hp=2, Ta=26, Te=76, Ph=18, Pk=20, Th=-14, Tk=10),   # 5 hồi thế
    ]


def kiem_2():  # hất ngược từ dưới trước lên cao
    return [
        T(KTHU),
        T(KTHU, Pa=12, Pb=12, Pe=25, wp=-85, tw=22, lean=15, hp=4, Ta=38, Te=70, Ph=24, Pk=36, Th=-18, Tk=20),  # 2 lấy đà: hạ kiếm thấp, cúi
        T(KTHU, Pa=55, Pb=14, Pe=20, wp=-45, tw=-15, lean=2, hp=-2, Ta=20, Te=80, Ph=28, Pk=22, Th=-22, Tk=10), # 3 ★ hất lên qua trước mặt
        T(KTHU, Pa=98, Pb=16, Pe=14, wp=-25, tw=-25, lean=-8, hp=-8, Ta=12, Te=82, Ph=22, Pk=16, Th=-20, Tk=8), # 4 dư: kiếm lên trời
        T(KTHU, Pa=62, Pb=15, Pe=48, wp=-40, tw=-6, lean=2, Ta=26, Te=78),                                      # 5 hồi thế
    ]


def kiem_3():  # nhảy bổ chém mạnh
    return [
        T(KTHU, Pa=92, Pb=14, Pe=50, wp=-15, Ta=88, Tb=10, Tc=30, Te=48, tw=-8, lean=-4, Ph=20, Pk=40, Th=-14, Tk=40),  # 1 giơ kiếm 2 tay, ngồi thấp
        T(KTHU, Pa=135, Pb=14, Pe=45, wp=10, Ta=128, Tb=10, Tc=30, Te=45, tw=-12, lean=-12, lz=6, hp=-8,
          Ph=40, Pk=70, Th=10, Tk=70),                                                                                  # 2 bật lên, kiếm ra sau đầu
        T(KTHU, Pa=92, Pb=12, Pe=8, wp=-35, Ta=86, Tb=8, Tc=30, Te=10, tw=4, lean=28, rp=12, lz=2, hp=8,
          Ph=50, Pk=50, Th=-5, Tk=45),                                                                                  # 3 ★ bổ xuống (kiếm ngang trước)
        T(KTHU, Pa=58, Pb=12, Pe=5, wp=-55, Ta=55, Tb=8, Tc=28, Te=8, tw=10, lean=38, rp=14, hp=10,
          Ph=55, Pk=75, Th=-25, Tk=40),                                                                                 # 4 tiếp đất: kiếm chạm đất
        T(KTHU, Pa=50, Pb=14, Pe=30, wp=-50, Ta=40, Tb=12, Tc=15, Te=45, tw=6, lean=22, rp=6, hp=5,
          Ph=40, Pk=50, Th=-18, Tk=26),                                                                                 # 5 đứng dậy
        T(KTHU, Pa=50, Pb=15, Pe=52, wp=-42, lean=8, Ph=20, Pk=22),                                                     # 6 về thủ
    ]


# ---------------- THƯƠNG (giáo nối dài cẳng tay: wp ~ -90) ----------------
TTHU = T(Pa=28, Pb=12, Pe=62, wp=-90, Ta=40, Tc=35, Te=55, Tb=8)


def _dam_thuong(goc_tay=90, sau=1.0):
    g = goc_tay - 90  # nâng/hạ hướng đâm
    return [
        T(TTHU, Pe=62 + g),
        T(TTHU, Pa=10, Pe=80 + g, tw=-24, lean=-4, Ta=25, Te=70, Ph=6, Pk=24, Th=-18, Tk=30),                           # 2 rút giáo về sau
        T(TTHU, Pa=55, Pe=35 + g, tw=12, lean=14 * sau, Ta=62, Tc=30, Te=30, Ph=34, Pk=34 * sau, Th=-28, Tk=10),       # 3 ★ đâm thẳng
        T(TTHU, Pa=70, Pe=20 + g, tw=22, lean=18 * sau, Ta=70, Tc=28, Te=22, Ph=36, Pk=36 * sau, Th=-30, Tk=8),        # 4 dư: duỗi hết
        T(TTHU, Pa=42, Pe=48 + g, tw=8, lean=8, Ta=50, Tc=32, Te=45, Ph=22, Pk=24, Th=-18, Tk=10),                      # 5 rút về
        T(TTHU, Pa=30, Pe=60 + g, tw=2, lean=5, Ph=14, Pk=16),                                                          # 6 thủ
    ]


def thuong_1():
    return _dam_thuong(90)


def thuong_2():
    return _dam_thuong(120)      # đâm chếch lên


def thuong_3():
    return _dam_thuong(78, 1.4)  # đâm thấp, lao người sâu


def thuong_quet():  # quét ngang vòng từ bên phải-sau ra trước rồi qua trái (giáo luôn nằm ngang, xoay quanh trục đứng)
    q = dict(Pa=60, Pb=6, Pe=30, wp=-90)
    return [
        T(TTHU, **q, Pc=-60, tw=-35, lean=0, Ta=45, Tc=10, Te=45, Ph=10, Pk=22, Th=-14, Tk=26),    # 1 kéo giáo ra sau bên phải
        T(TTHU, **q, Pc=-75, tw=-42, lean=-3, Ta=42, Tc=5, Te=48, Ph=8, Pk=28, Th=-16, Tk=32),     # 2 lấy đà xa nhất
        T(TTHU, **q, Pc=-35, tw=-5, lean=8, Ta=55, Tc=30, Te=30, Ph=24, Pk=30, Th=-22, Tk=14),     # 3 ★ quét ngang trước mặt
        T(TTHU, **q, Pc=5, tw=25, lean=12, Ta=50, Tc=40, Te=30, Ph=30, Pk=32, Th=-24, Tk=10),      # 4 dư: quét qua bên trái
        T(TTHU, **dict(q, Pa=50, Pe=40), Pc=15, tw=20, lean=8, Ta=45, Tc=35, Te=45, Ph=24, Pk=24, Th=-18, Tk=10),  # 5 hãm lại
        T(TTHU, Pa=32, Pb=12, Pc=5, Pe=58, tw=5, lean=5, Ph=14, Pk=16),                           # 6 thủ
    ]


def thuong_giu():  # giữ nút: rút giáo tụ lực (run nhẹ)
    o = []
    for i in range(3):
        r = [0, 1, -1][i]
        o.append(T(TTHU, Pa=8 + r, Pe=82 - r, tw=-26 + r, lean=-4, Ta=28, Te=68, Ph=8, Pk=28 + r, Th=-18, Tk=32 + r, hp=r))
    return o


def thuong_xoc():  # lướt đâm
    return [
        T(TTHU, Pa=65, Pe=25, tw=15, lean=24, Ta=62, Tc=28, Te=28, Ph=40, Pk=40, Th=-30, Tk=30, lz=1),
        T(TTHU, Pa=72, Pe=18, tw=20, lean=28, Ta=66, Tc=28, Te=24, Ph=30, Pk=55, Th=-35, Tk=18, lz=2),   # 2 ★ đâm trúng giữa lúc lướt
        T(TTHU, Pa=70, Pe=20, tw=18, lean=26, Ta=64, Tc=28, Te=26, Ph=10, Pk=60, Th=-20, Tk=40, lz=1.5),
        T(TTHU, Pa=50, Pe=40, tw=10, lean=15, Ta=50, Tc=30, Te=40, Ph=28, Pk=30, Th=-20, Tk=18),
    ]


# ---------------- BÚA (hai tay; S như kiếm) ----------------
BTHU = T(Pa=35, Pb=14, Pe=70, wp=-35, Ta=45, Tc=35, Te=60)


def bua_nen():
    return [
        T(BTHU, Pa=80, Pe=60, wp=-20, Ta=80, Tc=30, Te=55, tw=-4, lean=-3),                                              # 1 bắt đầu nhấc búa lên vai
        T(BTHU, Pa=125, Pe=35, wp=0, Ta=122, Tc=25, Te=35, tw=-10, lean=-10, hp=-6, Ph=14, Pk=26, Th=-16, Tk=26),      # 2 giơ búa qua đầu
        T(BTHU, Pa=85, Pe=0, wp=-35, Ta=85, Tc=25, Te=5, tw=5, lean=28, hp=8, Ph=40, Pk=45, Th=-24, Tk=24),             # 3 ★ nện xuống
        T(BTHU, Pa=62, Pe=2, wp=-55, Ta=60, Tc=25, Te=5, tw=8, lean=38, hp=10, Ph=46, Pk=60, Th=-26, Tk=30),            # 4 búa chạm đất
        T(BTHU, Pa=60, Pe=4, wp=-55, Ta=58, Tc=25, Te=6, tw=8, lean=37, hp=8, Ph=46, Pk=58, Th=-26, Tk=30),             # 5 giữ (rung)
        T(BTHU, Pa=55, Pe=25, wp=-48, Ta=52, Tc=28, Te=28, tw=6, lean=26, hp=4, Ph=36, Pk=44, Th=-22, Tk=22),           # 6 nhấc búa
        T(BTHU, Pa=42, Pe=55, wp=-40, Ta=46, Tc=32, Te=50, tw=2, lean=12, Ph=22, Pk=26, Th=-14, Tk=14),                 # 7 hồi
        T(BTHU, Pa=36, Pe=68, wp=-36, lean=6),                                                                         # 8 thủ
    ]


def bua_giu():  # giữ nút: búa giơ sau đầu tụ lực
    o = []
    for i in range(4):
        r = [0, 1, 2, 1][i]
        o.append(T(BTHU, Pa=140 + r, Pe=40 + r, wp=15, Ta=135 + r, Tc=25, Te=40 + r, tw=-12, lean=-12 - r, hp=-6,
                   Ph=14, Pk=30 + 2 * r, Th=-16, Tk=30 + 2 * r))
    return o


def bua_nen_dat():
    return [
        T(BTHU, Pa=140, Pe=40, wp=15, Ta=135, Tc=25, Te=40, tw=-12, lean=-12, hp=-6, Ph=14, Pk=30, Th=-16, Tk=30, lz=3),  # 1 búa sau đầu, nhón lên
        T(BTHU, Pa=100, Pe=10, wp=-25, Ta=96, Tc=25, Te=12, tw=2, lean=20, hp=6, Ph=38, Pk=42, Th=-22, Tk=26, lz=1),     # 2 giáng xuống
        T(BTHU, Pa=62, Pe=0, wp=-60, Ta=60, Tc=25, Te=4, tw=6, lean=42, hp=10, Ph=52, Pk=72, Th=-28, Tk=40),             # 3 ★ nện đất
        T(BTHU, Pa=60, Pe=2, wp=-60, Ta=58, Tc=25, Te=5, tw=6, lean=42, hp=8, Ph=52, Pk=70, Th=-28, Tk=40),              # 4 giữ (đất rung)
        T(BTHU, Pa=55, Pe=30, wp=-48, Ta=52, Tc=28, Te=30, tw=4, lean=24, hp=4, Ph=36, Pk=44, Th=-22, Tk=22),            # 5 nhấc búa
        T(BTHU, Pa=38, Pe=62, wp=-38, lean=8, Ph=18, Pk=20),                                                            # 6 thủ
    ]


# ---------------- PHI TIÊU (ném tay không; phi tiêu nhỏ trong nắm tay phải) ----------------
def phitieu():
    return [
        T(Pa=30, Pe=80, wp=-60),                                                                                        # 1 thủ, phi tiêu trong tay
        T(Pa=70, Pb=32, Pe=110, wp=-30, tw=-30, lean=-6, hp=-3, Ta=60, Te=40, Ph=8, Pk=22, Th=-16, Tk=28),               # 2 vung tay ra sau tai
        T(Pa=95, Pb=18, Pe=65, wp=-60, tw=10, lean=10, Ta=40, Te=55, Ph=28, Pk=26, Th=-22, Tk=10),                       # 3 ★ phóng: tay vút qua trước
        T(Pa=85, Pb=12, Pe=25, wp=-80, tw=22, lean=16, Ta=25, Te=70, Ph=32, Pk=30, Th=-24, Tk=8),                        # 4 dư: tay duỗi chỉ về trước
        T(Pa=55, Pb=14, Pe=45, wp=-70, tw=12, lean=10, Ta=22, Te=76, Ph=22, Pk=22, Th=-16, Tk=10),                       # 5 hạ tay
        T(Pa=30, Pb=17, Pe=74, wp=-60, tw=3, lean=5, Ph=14, Pk=16),                                                     # 6 thủ
    ]


def phitieu_ngam():  # giữ nút: tay trái chỉ đích, tay phải kẹp phi tiêu sau tai
    o = []
    for i in range(3):
        r = [0, 1, -1][i]
        o.append(T(Pa=78 + r, Pb=35, Pe=112 - r, wp=-30, tw=-28 + r, lean=-4, Ta=85 + r, Tb=8, Tc=10, Te=8,
                   Ph=10, Pk=22 + r, Th=-16, Tk=26 + r, hp=r))
    return o


def phitieu_chum():  # thả: ném xoè quạt nhiều phi tiêu (tay quét ngang)
    return [
        T(Pa=55, Pb=10, Pc=60, Pe=90, wp=-40, tw=30, lean=0, Ta=30, Te=70, Ph=10, Pk=22, Th=-16, Tk=26),             # 1 tay phải vắt sang vai trái
        T(Pa=85, Pb=25, Pc=20, Pe=45, wp=-60, tw=-5, lean=10, Ta=25, Te=75, Ph=26, Pk=26, Th=-22, Tk=12),            # 2 ★ quét ra: phi tiêu bay
        T(Pa=88, Pb=55, Pc=-15, Pe=15, wp=-75, tw=-25, lean=12, Ta=20, Te=78, Ph=28, Pk=28, Th=-22, Tk=10),          # 3 dư: tay duỗi ra ngoài
        T(Pa=70, Pb=45, Pc=-10, Pe=30, wp=-70, tw=-18, lean=9, Ta=20, Te=78, Ph=24, Pk=24, Th=-18, Tk=10),           # 4 hãm
        T(Pa=48, Pb=28, Pc=0, Pe=55, wp=-65, tw=-8, lean=6, Ph=18, Pk=18),                                          # 5 hạ tay
        T(Pa=28, Pb=18, Pc=0, Pe=74, wp=-60, tw=-2, lean=4),                                                        # 6 thủ
    ]


# ---------------- CHIÊU ĐẶC BIỆT ----------------
def tram_nguyet():  # kiếm: chém trăng lưỡi liềm (quét ngang rộng)
    return [
        T(KTHU, Pa=50, Pb=46, Pc=-38, Pe=30, wp=-25, tw=-40, lean=8, hp=-4, Ta=50, Te=40, Ph=24, Pk=44, Th=-18, Tk=40),  # 1 thu kiếm ra sau, ngồi thấp
        T(KTHU, Pa=72, Pb=35, Pc=-18, Pe=10, wp=-60, tw=0, lean=18, hp=4, Ta=35, Te=60, Ph=38, Pk=40, Th=-26, Tk=14),     # 2 ★ chém vòng ra trước
        T(KTHU, Pa=70, Pb=18, Pc=20, Pe=10, wp=-70, tw=30, lean=24, hp=6, Ta=25, Te=70, Ph=40, Pk=42, Th=-28, Tk=12),    # 3 dư: kiếm vắt sang trái, thấp
        T(KTHU, Pa=50, Pb=10, Pc=30, Pe=35, wp=-60, tw=25, lean=18, Ta=25, Te=72, Ph=32, Pk=34, Th=-22, Tk=12),          # 4 hãm
        T(KTHU, Pa=46, Pb=12, Pc=12, Pe=52, wp=-48, tw=10, lean=10, Ph=22, Pk=22, Th=-14, Tk=10),                        # 5 hồi
        T(KTHU),                                                                                                         # 6 thủ
    ]


def phi_thuong():  # thương: phóng lao (khung 3–6 giáo đã bay đi)
    return [
        T(TTHU, Pa=70, Pb=40, Pe=100, wp=-20, tw=-28, lean=-5, hp=-3, Ta=70, Tc=10, Te=15, Ph=8, Pk=24, Th=-18, Tk=30),  # 1 giáo trên vai, tay trái chỉ đích
        T(TTHU, Pa=100, Pb=20, Pe=55, wp=-60, tw=6, lean=12, Ta=40, Tc=10, Te=45, Ph=30, Pk=28, Th=-24, Tk=10),          # 2 ★ phóng
        T(TTHU, Pa=88, Pb=12, Pe=20, wp=-80, tw=22, lean=20, Ta=20, Tc=5, Te=70, Ph=34, Pk=32, Th=-26, Tk=8),            # 3 dư: tay vút theo, giáo đã bay
        T(TTHU, Pa=62, Pb=12, Pe=35, wp=-80, tw=15, lean=14, Ta=20, Tc=5, Te=75, Ph=28, Pk=26, Th=-20, Tk=8),            # 4 hạ tay
        T(TTHU, Pa=40, Pb=14, Pe=58, wp=-80, tw=6, lean=8, Ta=20, Tc=0, Te=78, Ph=18, Pk=18, Th=-14, Tk=10),             # 5 hồi
        T(Pa=26, Pb=17, Pe=74, Ta=20, Te=80, lean=5),                                                                   # 6 thủ tay không
    ]


def dia_chan():  # búa: địa chấn (bật lên nện mạnh)
    return [
        T(BTHU, Pa=140, Pe=40, wp=15, Ta=135, Tc=25, Te=40, tw=-10, lean=-12, hp=-6, Ph=30, Pk=55, Th=0, Tk=55, lz=5),   # 1 bật lên, búa sau đầu
        T(BTHU, Pa=95, Pe=5, wp=-28, Ta=92, Tc=25, Te=8, tw=4, lean=26, hp=8, Ph=50, Pk=62, Th=-24, Tk=36, lz=0),       # 2 ★ nện đất
        T(BTHU, Pa=62, Pe=0, wp=-58, Ta=60, Tc=25, Te=4, tw=6, lean=42, hp=10, Ph=55, Pk=80, Th=-30, Tk=44),            # 3 búa ép xuống, ngồi sâu
        T(BTHU, Pa=58, Pe=22, wp=-52, Ta=56, Tc=26, Te=24, tw=6, lean=32, hp=6, Ph=44, Pk=60, Th=-26, Tk=30),           # 4 nhấc búa
        T(BTHU, Pa=44, Pe=50, wp=-42, Ta=48, Tc=30, Te=48, tw=3, lean=16, Ph=28, Pk=34, Th=-18, Tk=16),                 # 5 hồi
        T(BTHU, Pa=36, Pe=68, wp=-36, lean=6),                                                                         # 6 thủ
    ]


def mua_phi_tieu():  # phi tiêu: tung lên trời
    return [
        T(Pa=0, Pb=20, Pe=80, wp=-60, Ta=0, Tb=20, Te=80, lean=10, hp=4, Ph=20, Pk=45, Th=-14, Tk=45),                 # 1 ngồi thấp, hai tay ở hông
        T(Pa=40, Pb=25, Pe=60, wp=-60, Ta=40, Tb=25, Te=60, lean=-4, hp=-15, Ph=14, Pk=20, Th=-12, Tk=20, lz=1),        # 2 ★ bật dậy tung lên
        T(Pa=82, Pb=28, Pe=45, wp=-70, Ta=82, Tb=28, Te=45, lean=-10, hp=-30, Ph=10, Pk=8, Th=-8, Tk=8, lz=3),          # 3 hai tay vút lên trời
        T(Pa=115, Pb=30, Pe=25, wp=-80, Ta=115, Tb=30, Te=25, lean=-12, hp=-35, Ph=10, Pk=6, Th=-8, Tk=6, lz=3),        # 4 dư: duỗi thẳng lên
        T(Pa=72, Pb=28, Pe=45, wp=-70, Ta=72, Tb=28, Te=45, lean=-4, hp=-15, Ph=12, Pk=14, Th=-10, Tk=12),              # 5 hạ tay
        T(Pa=32, Pb=24, Pe=70, wp=-60, Ta=30, Tb=24, Te=75, lean=3, hp=-2),                                             # 6 thủ
    ]


def dam():  # đấm tay phải
    return [
        T(),
        T(Pa=18, Pe=88, tw=-25, lean=-3, Ta=35, Te=70, Ph=8, Pk=22, Th=-16, Tk=28),                     # 2 lấy đà: vặn vai phải ra sau
        T(Pa=62, Pb=12, Pe=43, tw=10, lean=10, Ta=15, Te=85, Ph=30, Pk=28, Th=-24, Tk=10),              # 3 ★ đấm ra (gần duỗi)
        T(Pa=80, Pb=10, Pe=12, tw=22, lean=16, Ta=10, Te=88, Ph=33, Pk=30, Th=-26, Tk=8),               # 4 dư: duỗi thẳng hết
        T(Pa=40, Pb=16, Pe=55, tw=6, lean=8, Ta=18, Te=82, Ph=20, Pk=20, Th=-14, Tk=10),                # 5 thu tay
    ]


# ---------------- BẢNG ĐỘNG TÁC (số khung / giây / mốc / ★ theo game) ----------------
# moc: mốc bắt đầu từng khung (tỉ lệ 0..1 của thời lượng), lấy từ bảng MOC của game; None = chia đều.
# cham: chỉ số khung chạm (0-based); None = không có.
DS = [
    # ma,            ten-game,     ten tiếng Việt,      so, giay, lap,  moc, cham, vk, ham, ghi chú ★
    ('01-dung', 'dung', 'Đứng thở', 8, 1.0, True, None, None, None, dung,
     'Game phát qua lại 1-2-3-4-5-4-3-2 (bảng QUA_LAI) và chậm ×1,25; khung 1→8→1 cũng nối vòng mượt.'),
    ('02-di', 'di', 'Đi bộ', 8, 0.8, True, None, None, None, di, 'Lặp; game chậm ×1,25.'),
    ('03-chay', 'chay', 'Chạy', 12, 0.6, True, None, None, None, chay, 'Lặp; game chậm ×1,25. Chạy lùi = phát ngược.'),
    ('04-lon', 'lon', 'Lộn né', 6, 0.27, False, None, None, None, lon, 'Không vũ khí.'),
    ('05-trung-don', 'trung', 'Trúng đòn', 4, 0.2, False, None, None, None, trung, ''),
    ('06-chet', 'chet', 'Chết', 8, 0.6, False, None, None, None, chet, ''),
    ('07-chuong', 'chuong', 'Chưởng', 6, 0.3, False, [0, 0.12, 0.25, 0.4, 0.6, 0.8], 3, None, chuong,
     'Viên chưởng sinh ngay lúc bấm; ★ = khung đẩy chưởng mạnh nhất (khung 4).'),
    ('08-kiem-1', 'kiem_1', 'Kiếm nhát 1', 5, 0.3, False, [0, 0.22, 0.45, 0.65, 0.82], 2, 'kiem', kiem_1, '★ ở 0,45.'),
    ('09-kiem-2', 'kiem_2', 'Kiếm nhát 2', 5, 0.3, False, [0, 0.22, 0.45, 0.65, 0.82], 2, 'kiem', kiem_2, '★ ở 0,45.'),
    ('10-kiem-3', 'kiem_3', 'Kiếm nhát 3', 6, 0.46, False, [0, 0.2, 0.45, 0.6, 0.75, 0.88], 2, 'kiem', kiem_3, '★ ở 0,45.'),
    ('11-thuong-1', 'thuong_1', 'Thương nhát 1', 6, 0.38, False, [0, 0.22, 0.45, 0.55, 0.7, 0.85], 2, 'thuong', thuong_1, '★ ở 0,45.'),
    ('12-thuong-2', 'thuong_2', 'Thương nhát 2', 6, 0.34, False, [0, 0.22, 0.45, 0.55, 0.7, 0.85], 2, 'thuong', thuong_2, '★ ở 0,45.'),
    ('13-thuong-3', 'thuong_3', 'Thương nhát 3', 6, 0.34, False, [0, 0.22, 0.45, 0.55, 0.7, 0.85], 2, 'thuong', thuong_3, '★ ở 0,45.'),
    ('14-thuong-quet', 'thuong_quet', 'Thương quét', 6, 0.52, False, [0, 0.22, 0.45, 0.55, 0.7, 0.85], 2, 'thuong', thuong_quet, '★ ở 0,45.'),
    ('15-thuong-giu', 'thuong_giu', 'Thương giữ (tụ lực)', 3, 0.45, True, None, None, 'thuong', thuong_giu, 'Lặp khi giữ nút.'),
    ('16-thuong-xoc', 'thuong_xoc', 'Thương xốc (lướt đâm)', 4, 0.16, False, None, 1, 'thuong', thuong_xoc,
     'Khung chọn theo tiến độ lướt; trúng trong lúc lướt, ★ đánh dấu khung 2.'),
    ('17-bua-nen', 'bua_nen', 'Búa nện', 8, 0.8, False, [0, 0.15, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93], 2, 'bua', bua_nen, '★ ở 0,35.'),
    ('18-bua-giu', 'bua_giu', 'Búa giữ (tụ lực)', 4, 0.5, True, None, None, 'bua', bua_giu, 'Game phát qua lại 1-2-3-4-3-2.'),
    ('19-bua-nen-dat', 'bua_nen_dat', 'Búa nện đất', 6, 0.7, False, [0, 0.2, 0.45, 0.6, 0.75, 0.88], 2, 'bua', bua_nen_dat,
     'Thả nút vào từ u 0,36 (khung 2); ★ ở 0,45.'),
    ('20-phi-tieu', 'phitieu', 'Phi tiêu', 6, 0.38, False, [0, 0.22, 0.45, 0.6, 0.75, 0.88], 2, 'phitieu', phitieu,
     '★ ở 0,45: phi tiêu rời tay (đạn sinh lúc chạm).'),
    ('21-phi-tieu-ngam', 'phitieu_ngam', 'Phi tiêu ngắm', 3, 0.45, True, None, None, 'phitieu', phitieu_ngam, 'Lặp khi giữ nút.'),
    ('22-phi-tieu-chum', 'phitieu_chum', 'Phi tiêu chùm', 6, 0.5, False, [0, 0.45, 0.6, 0.72, 0.84, 0.94], 1, 'phitieu', phitieu_chum,
     'Thả nút vào từ u 0,45 → khung 2 (ném) hiện ngay.'),
    ('23-tram-nguyet', 'db_kiem', 'Trảm nguyệt (chiêu kiếm)', 6, 0.35, False, [0, 0.12, 0.25, 0.4, 0.6, 0.8], 1, 'kiem', tram_nguyet,
     'Hiệu ứng sinh ngay lúc bấm; ★ = khung chém ra (khung 2).'),
    ('24-phi-thuong', 'db_thuong', 'Phi thương (chiêu thương)', 6, 0.35, False, [0, 0.12, 0.25, 0.4, 0.6, 0.8], 1, 'thuong', phi_thuong,
     'Khung 3–6 giáo đã bay đi (game: neo null). ★ = khung phóng.'),
    ('25-dia-chan', 'db_bua', 'Địa chấn (chiêu búa)', 6, 0.35, False, [0, 0.12, 0.25, 0.4, 0.6, 0.8], 1, 'bua', dia_chan,
     'Hiệu ứng sinh ngay lúc bấm; ★ = khung nện đất.'),
    ('26-mua-phi-tieu', 'db_phitieu', 'Mưa phi tiêu (chiêu phi tiêu)', 6, 0.35, False, [0, 0.12, 0.25, 0.4, 0.6, 0.8], 1, 'phitieu', mua_phi_tieu,
     'Hiệu ứng sinh ngay lúc bấm; ★ = khung tung lên.'),
    ('27-dam', 'dam', 'Đấm (tay không)', 5, 0.3, False, [0, 0.22, 0.45, 0.65, 0.82], 2, None, dam, '★ ở 0,45.'),
]

# khung nào CÓ vũ khí trong tay (None = mọi khung). Phi tiêu: rời tay từ sau khung chạm; phi thương: giáo bay đi từ khung 3.
VK_KHUNG = {
    '20-phi-tieu': [0, 1, 2],
    '21-phi-tieu-ngam': [0, 1, 2],
    '22-phi-tieu-chum': [0, 1],
    '24-phi-thuong': [0, 1],
    '26-mua-phi-tieu': [0, 1],
}

# động tác cần dời cả người cho trọng tâm nằm trên điểm (48,90) (lộn: thân cuộn lăn qua điểm gốc)
CAN_GIUA = {'04-lon'}
