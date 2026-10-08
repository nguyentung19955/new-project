#!/usr/bin/env python3
"""Vẽ 2 ảnh tạo hình THỬ (không phải tạo hình thật của game) để kiểm tra công cụ.

    python tools/sprite/make_test_art.py

Xuất: art/raw/thu/nguoi.png (người) và art/raw/thu/ho-con.png (hổ con đứng thẳng, đầu to, có đuôi).
Ảnh vẽ phẳng, viền đậm, nền hồng cánh sen trơn, đúng kiểu ảnh mà prompt Pippit yêu cầu.
"""
from pathlib import Path

from PIL import Image, ImageDraw

S = 2  # vẽ to gấp đôi rồi thu lại cho mịn nét
BG = (255, 0, 200)
INK = (27, 17, 24)
OL = 7  # bề dày viền


class Pen:
    def __init__(self, size=800):
        self.im = Image.new("RGB", (size * S, size * S), BG)
        self.d = ImageDraw.Draw(self.im)

    def _p(self, pts):
        return [(x * S, y * S) for x, y in pts]

    def poly(self, pts, fill, ol=OL):
        if ol:
            self.d.polygon(self._p(pts), fill=INK)
            self.d.line(self._p(pts + [pts[0]]), fill=INK, width=ol * 2 * S, joint="curve")
        self.d.polygon(self._p(pts), fill=fill)

    def ell(self, box, fill, ol=OL):
        x0, y0, x1, y1 = box
        if ol:
            self.d.ellipse([(x0 - ol) * S, (y0 - ol) * S, (x1 + ol) * S, (y1 + ol) * S], fill=INK)
        self.d.ellipse([x0 * S, y0 * S, x1 * S, y1 * S], fill=fill)

    def _cap(self, pts, w, fill):
        self.d.line(self._p(pts), fill=fill, width=int(w * S), joint="curve")
        for x, y in pts:
            r = w / 2
            self.d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=fill)

    def cap(self, pts, w, fill, ol=OL):
        """Đường dày đầu tròn (tay, chân, đuôi)."""
        if ol:
            self._cap(pts, w + ol * 2, INK)
        self._cap(pts, w, fill)

    def line(self, pts, w, fill):
        self.d.line(self._p(pts), fill=fill, width=int(w * S))

    def save(self, path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.im.resize((self.im.width // S, self.im.height // S), Image.Resampling.LANCZOS).save(path)
        print("Đã vẽ", path)


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def nguoi(path):
    """Chàng thợ rèn trẻ: khăn đỏ, áo nâu, tạp dề da, quần chàm. Quay phải, tay chân tách khỏi thân."""
    p = Pen()
    skin, skin_d = (222, 164, 110), (188, 124, 76)
    hair = (46, 30, 28)
    red, red_d = (204, 58, 46), (150, 36, 34)
    vest, vest_d = (132, 84, 50), (98, 60, 38)
    apron, apron_d = (176, 124, 72), (140, 94, 54)
    pants, pants_d = (62, 64, 96), (44, 46, 72)
    boot, gold = (74, 48, 34), (226, 182, 78)

    # tay xa
    a, b = (506, 345), (562, 505)
    p.cap([a, b], 50, skin_d)
    p.cap([a, lerp(a, b, 0.36)], 58, vest_d)
    p.ell((536, 480, 596, 540), skin_d)
    # chân xa
    p.cap([(447, 505), (480, 690)], 76, pants_d)
    p.poly([(440, 690), (530, 690), (552, 722), (548, 745), (440, 745)], boot)
    # chân gần
    p.cap([(358, 505), (325, 690)], 82, pants)
    p.poly([(282, 690), (372, 690), (398, 722), (394, 745), (282, 745)], boot)
    p.line([(286, 700), (368, 700)], 10, gold)
    # thân
    torso = [(300, 322), (506, 322), (500, 400), (492, 470), (504, 535), (298, 535), (312, 470), (304, 400)]
    p.poly(torso, vest)
    p.poly([(300, 330), (336, 330), (346, 470), (332, 530), (302, 530), (314, 470), (306, 400)], vest_d, ol=0)
    p.poly([(388, 322), (452, 322), (422, 398)], skin, ol=0)
    p.poly([(372, 470), (494, 470), (506, 535), (380, 535)], apron, ol=0)
    p.poly([(372, 470), (400, 470), (406, 535), (380, 535)], apron_d, ol=0)
    p.poly([(310, 448), (494, 448), (494, 476), (312, 476)], gold, ol=0)
    p.poly([(418, 444), (450, 444), (450, 480), (418, 480)], red, ol=0)
    # cổ
    p.poly([(390, 286), (444, 286), (446, 330), (388, 330)], skin_d, ol=0)
    # đầu
    p.ell((296, 66, 528, 300), hair)
    p.ell((318, 24, 392, 98), hair)  # búi tóc
    p.ell((340, 116, 528, 302), skin, ol=0)
    p.ell((322, 176, 362, 240), skin_d, ol=0)  # tai
    # khăn đỏ và đuôi khăn
    p.poly([(250, 150), (300, 142), (304, 176), (262, 208), (236, 196)], red_d)
    p.poly([(296, 128), (522, 138), (528, 172), (298, 166)], red, ol=0)
    p.line([(298, 166), (528, 172)], 5, red_d)
    # mắt, mày, miệng
    p.ell((446, 186, 470, 230), INK, ol=0)
    p.ell((498, 188, 514, 230), INK, ol=0)
    p.ell((451, 192, 461, 204), (255, 255, 255), ol=0)
    p.line([(436, 178), (476, 172)], 9, hair)
    p.line([(492, 174), (520, 180)], 9, hair)
    p.line([(468, 262), (500, 260)], 7, (120, 52, 44))
    p.ell((410, 238, 446, 262), (232, 138, 104), ol=0)  # má hồng
    # tay gần
    a, b = (300, 348), (226, 508)
    p.cap([a, b], 56, skin)
    p.cap([a, lerp(a, b, 0.36)], 64, vest)
    p.line([lerp(a, b, 0.42), lerp(a, b, 0.42)], 1, vest)
    p.ell((190, 482, 256, 548), skin)
    p.line([lerp(a, b, 0.78), lerp(a, b, 0.86)], 58, red)  # băng cổ tay
    p.save(path)


def ho_con(path):
    """Hổ con đứng thẳng: đầu to, tai nhọn, khăn đỏ, tay chân ngắn, đuôi dài cong phía sau."""
    p = Pen()
    fur, fur_d = (240, 140, 40), (198, 104, 30)
    stripe = (58, 36, 24)
    cream = (252, 234, 200)
    red, red_d = (204, 58, 46), (150, 36, 34)
    pink = (240, 150, 150)

    # đuôi
    tail = [(330, 612), (262, 652), (188, 622), (150, 530), (176, 440)]
    p.cap(tail, 44, fur)
    for t in (0.25, 0.75):
        a = lerp(tail[1], tail[2], t)
        p.line([(a[0] - 8, a[1] - 24), (a[0] + 8, a[1] + 24)], 14, stripe)
    for t in (0.3, 0.75):
        a = lerp(tail[2], tail[3], t)
        p.line([(a[0] - 24, a[1] + 6), (a[0] + 24, a[1] - 8)], 14, stripe)
    p.cap([lerp(tail[3], tail[4], 0.6), tail[4]], 44, stripe, ol=0)
    # tay xa
    p.cap([(492, 448), (560, 522)], 50, fur_d)
    p.ell((534, 498, 592, 556), fur_d)
    # chân xa
    p.cap([(447, 600), (462, 700)], 74, fur_d)
    p.ell((424, 688, 528, 746), fur_d)
    # chân gần
    p.cap([(358, 600), (340, 700)], 80, fur)
    p.ell((290, 688, 400, 746), fur)
    p.line([(346, 640), (384, 646)], 12, stripe)
    # thân
    p.ell((296, 388, 506, 628), fur)
    p.ell((372, 432, 500, 612), cream, ol=0)
    p.line([(304, 500), (344, 506)], 14, stripe)
    p.line([(308, 548), (350, 550)], 14, stripe)
    # khăn
    p.poly([(250, 420), (316, 400), (322, 432), (282, 474), (252, 458)], red_d)
    p.poly([(306, 384), (512, 384), (506, 428), (312, 428)], red)
    # tai
    p.poly([(272, 170), (292, 44), (384, 112)], fur)
    p.poly([(296, 138), (306, 78), (350, 112)], pink, ol=0)
    p.poly([(452, 108), (544, 48), (556, 168)], fur_d)
    # đầu
    p.ell((240, 100, 580, 400), fur)
    p.ell((420, 268, 574, 388), cream, ol=0)
    p.poly([(370, 104), (392, 104), (384, 160)], stripe, ol=0)
    p.poly([(414, 102), (438, 104), (428, 166)], stripe, ol=0)
    p.poly([(460, 106), (482, 110), (470, 160)], stripe, ol=0)
    p.poly([(244, 232), (300, 238), (246, 258)], stripe, ol=0)
    p.poly([(250, 286), (304, 284), (258, 312)], stripe, ol=0)
    # mắt, mũi, miệng
    p.ell((398, 198, 440, 266), INK, ol=0)
    p.ell((406, 206, 422, 226), (255, 255, 255), ol=0)
    p.ell((516, 200, 546, 264), INK, ol=0)
    p.ell((521, 208, 533, 224), (255, 255, 255), ol=0)
    p.poly([(506, 290), (544, 290), (525, 312)], stripe, ol=0)
    p.line([(525, 312), (525, 334)], 6, stripe)
    p.line([(498, 344), (525, 334), (550, 346)], 6, stripe)
    p.ell((372, 286, 414, 314), pink, ol=0)
    # tay gần
    p.cap([(322, 448), (250, 532)], 56, fur)
    p.line([(292, 470), (310, 496)], 13, stripe)
    p.ell((214, 506, 280, 572), fur)
    p.save(path)


if __name__ == "__main__":
    out = Path(__file__).resolve().parents[2] / "art" / "raw" / "thu"
    nguoi(out / "nguoi.png")
    ho_con(out / "ho-con.png")
