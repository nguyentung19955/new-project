"""Ảnh thử kiểu "ảnh AI vẽ" cho Xưởng Sprite (phần sửa vỡ hình và Tự đoán).

Khác ảnh vẽ tay giả lập (xuong_sprite_ve.py): nhân vật chibi nét viền đậm có khử răng cưa, nền gần trắng hơi xám
(loang nhẹ, không vết bẩn), TAY ÁP SÁT THÂN, CHÂN SÁT NHAU, có chi tiết nhỏ. Em bé nhìn chính diện hơi nghiêng.
Dùng: from xuong_sprite_ai import ANH_AI; ANH_AI['em-be-ao-do'](đường_dẫn) -> đường dẫn PNG.
"""
import random

from PIL import Image, ImageDraw, ImageFilter

INK = (38, 28, 34)
SS = 2  # vẽ to gấp đôi rồi thu nhỏ (khử răng cưa như ảnh AI)


def _nen(w, h, seed, mau=(242, 241, 239)):
    """Nền trắng xám nhạt, loang rất nhẹ từ giữa ra (như nền studio của ảnh AI)."""
    rnd = random.Random(seed)
    im = Image.new('RGB', (w, h), mau)
    px = im.load()
    cx, cy = w / 2, h * 0.45
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / max(w, h)
            k = 1.01 - 0.05 * r + rnd.uniform(-0.004, 0.004)
            c = tuple(max(0, min(255, int(v * k))) for v in mau)
            px[x, y] = c
            if x + 1 < w:
                px[x + 1, y] = c
            if y + 1 < h:
                px[x, y + 1] = c
                if x + 1 < w:
                    px[x + 1, y + 1] = c
    return im


class _But:
    """Vẽ hình có viền đậm: mọi toạ độ theo ảnh cuối, tự nhân SS."""

    def __init__(self, w, h, seed, nen=(242, 241, 239), vien=11):
        self.W, self.H = w, h
        self.im = _nen(w * SS, h * SS, seed, nen)
        self.d = ImageDraw.Draw(self.im)
        self.v = vien

    def _p(self, pts):
        return [(x * SS, y * SS) for x, y in pts]

    def _b(self, box):
        return [v * SS for v in box]

    def elip(self, box, mau, v=None):
        v = self.v if v is None else v
        self.d.ellipse(self._b(box), fill=INK)
        self.d.ellipse(self._b([box[0] + v, box[1] + v, box[2] - v, box[3] - v]), fill=mau)

    def tron(self, box, mau):
        self.d.ellipse(self._b(box), fill=mau)

    def da_giac(self, pts, mau, v=None):
        v = self.v if v is None else v
        self.d.polygon(self._p(pts), fill=INK)
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        trong = []
        for x, y in pts:
            dx, dy = x - cx, y - cy
            L = (dx * dx + dy * dy) ** 0.5 or 1
            trong.append((x - dx / L * v * 1.1, y - dy / L * v * 1.1))
        self.d.polygon(self._p(trong), fill=mau)

    def to(self, pts, mau):
        self.d.polygon(self._p(pts), fill=mau)

    def ong(self, a, b, rong, mau, v=None):
        """Một đoạn tròn đầu (tay, chân) có viền."""
        v = self.v if v is None else v
        for w, c in ((rong + 2 * v, INK), (rong, mau)):
            self.d.line(self._p([a, b]), fill=c, width=int(w * SS))
            for p in (a, b):
                self.d.ellipse(self._b([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2]), fill=c)

    def net(self, pts, w=5, mau=INK):
        self.d.line(self._p(pts), fill=mau, width=int(w * SS), joint='curve')

    def cung(self, box, a0, a1, w=5, mau=INK):
        self.d.arc(self._b(box), a0, a1, fill=mau, width=int(w * SS))

    def luu(self, path):
        im = self.im.resize((self.W, self.H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.4))
        im.save(path)
        return path


def em_be_ao_do(path, seed=21):
    """Giống ảnh thật của chủ dự án: em bé áo trùm đỏ, mặt nạ giấy, găng to, nhìn chính diện hơi nghiêng sang phải.
    Tay áp sát hai bên thân (găng chồng lên mép áo), hai chân ngắn sát nhau. 760x900."""
    b = _But(760, 900, seed)
    DO, DO_T, DO_S, GIAY, NAU, NAU_S, VANG, XAM = (204, 40, 48), (150, 24, 38), (232, 92, 88), (247, 238, 220), (120, 72, 42), (160, 104, 62), (244, 198, 52), (78, 70, 82)
    # chân ngắn sát nhau + giày
    b.ong((330, 700), (330, 770), 70, XAM)
    b.ong((420, 700), (424, 770), 70, XAM)
    b.elip((262, 742, 382, 818), NAU)
    b.elip((376, 742, 500, 818), NAU)
    # áo trùm hình chuông
    b.da_giac([(380, 330), (520, 420), (560, 720), (200, 720), (240, 420)], DO)
    b.net([(300, 470), (290, 700)], 6, DO_T)
    b.net([(380, 480), (384, 705)], 6, DO_T)
    b.net([(460, 470), (472, 700)], 6, DO_T)
    b.to([(250, 700), (550, 700), (548, 712), (252, 712)], DO_T)
    # tay áp sát thân: tay áo đỏ chạy dọc mép áo, găng to ở dưới
    b.ong((236, 440), (214, 600), 62, DO)
    b.net([(222, 470), (210, 590)], 5, DO_S)
    b.ong((526, 440), (548, 600), 62, DO)
    b.net([(540, 470), (552, 590)], 5, DO_S)
    b.elip((150, 560, 270, 676), NAU)
    b.tron((176, 580, 214, 612), NAU_S)
    b.elip((494, 560, 616, 676), NAU)
    b.tron((524, 580, 562, 612), NAU_S)
    # mũ trùm to
    b.elip((170, 40, 610, 470), DO)
    b.cung((210, 70, 560, 430), 200, 250, 7, DO_S)
    # mặt nạ giấy, hơi lệch phải (nhìn hơi nghiêng)
    b.elip((262, 140, 538, 420), GIAY)
    b.elip((322, 232, 368, 290), INK, 0)
    b.tron((334, 242, 350, 260), (255, 255, 255))
    b.elip((440, 232, 486, 290), INK, 0)
    b.tron((452, 242, 468, 260), (255, 255, 255))
    b.net([(312, 214), (360, 204)], 6)
    b.net([(436, 204), (488, 214)], 6)
    b.cung((360, 300, 460, 370), 20, 160, 9, DO_T)
    b.tron((300, 300, 334, 330), (238, 130, 140))
    b.tron((470, 300, 504, 330), (238, 130, 140))
    b.net([(400, 160), (392, 190), (408, 200)], 5, DO_T)
    # chuông nhỏ ở cổ
    b.elip((360, 418, 420, 478), VANG, 7)
    b.tron((384, 452, 396, 464), INK)
    return b.luu(path)


def em_be_ao_xanh(path, seed=23):
    """Em bé áo dài xanh, đầu tròn tóc đen, tay hơi tách khỏi thân, chân tách nhẹ, nhìn chính diện. 700x860."""
    b = _But(700, 860, seed)
    XANH, XANH_T, DA, TOC, TRANG, NAU = (60, 120, 210), (36, 78, 150), (250, 214, 180), (40, 34, 40), (250, 250, 250), (110, 70, 44)
    b.ong((300, 640), (290, 760), 64, XANH_T)
    b.ong((400, 640), (410, 760), 64, XANH_T)
    b.elip((230, 730, 340, 800), NAU)
    b.elip((360, 730, 470, 800), NAU)
    b.da_giac([(350, 380), (470, 440), (490, 680), (210, 680), (230, 440)], XANH)
    b.net([(350, 400), (350, 670)], 6, XANH_T)
    b.ong((222, 450), (170, 610), 56, XANH)
    b.ong((478, 450), (530, 610), 56, XANH)
    b.elip((130, 580, 210, 660), DA)
    b.elip((490, 580, 570, 660), DA)
    b.elip((160, 40, 540, 420), DA)
    b.to([(170, 200), (200, 90), (350, 40), (500, 90), (530, 200), (470, 140), (350, 120), (230, 140)], TOC)
    b.elip((250, 220, 300, 290), TOC, 0)
    b.tron((262, 232, 280, 254), TRANG)
    b.elip((400, 220, 450, 290), TOC, 0)
    b.tron((412, 232, 430, 254), TRANG)
    b.cung((310, 300, 390, 350), 20, 160, 7)
    return b.luu(path)


def quai_bon_chan(path, seed=25):
    """Quái heo rừng chibi bốn chân nhìn ngang quay phải, chân ngắn sát nhau, đuôi nhỏ, nanh trắng. 900x620."""
    b = _But(900, 620, seed)
    NAU, NAU_T, NAU_S, HONG, TRANG = (150, 96, 60), (104, 62, 40), (196, 140, 92), (232, 150, 150), (250, 248, 240)
    for x in (250, 330):  # chân xa
        b.ong((x, 420), (x + 4, 540), 60, NAU_T)
    for x in (560, 640):
        b.ong((x, 420), (x + 4, 540), 60, NAU_T)
    b.ong((150, 300), (90, 240), 26, NAU)  # đuôi
    b.elip((140, 180, 720, 500), NAU)
    b.cung((200, 220, 660, 470), 200, 300, 8, NAU_S)
    for x in (290, 600):  # chân gần
        b.ong((x, 430), (x - 4, 560), 66, NAU)
    b.elip((560, 110, 860, 420), NAU)
    b.elip((770, 260, 880, 360), HONG)
    b.tron((800, 290, 818, 314), INK)
    b.tron((834, 290, 852, 314), INK)
    b.elip((680, 190, 730, 250), INK, 0)
    b.tron((694, 200, 710, 218), TRANG)
    b.da_giac([(600, 140), (640, 60), (680, 150)], NAU_T)
    b.da_giac([(760, 350), (800, 330), (790, 300)], TRANG, 5)
    return b.luu(path)


def ca_bay(path, seed=27):
    """Cá bay chibi quay phải, vây lưng to như cánh, vây bụng nhỏ, đuôi chẻ. 880x560."""
    b = _But(880, 560, seed)
    XANH, XANH_T, BUNG, VAY = (70, 150, 200), (40, 96, 150), (230, 240, 236), (120, 200, 230)
    b.da_giac([(170, 280), (40, 150), (90, 280), (40, 420)], XANH_T)  # đuôi
    b.da_giac([(420, 220), (300, 40), (560, 200)], VAY)  # vây lưng (cánh)
    b.elip((140, 160, 780, 420), XANH)
    b.to([(260, 340), (700, 340), (640, 390), (300, 390)], BUNG)
    b.da_giac([(440, 370), (400, 500), (530, 390)], VAY)  # vây bụng
    b.elip((600, 210, 680, 290), (255, 255, 255))
    b.tron((632, 230, 664, 266), INK)
    b.cung((690, 280, 770, 340), 30, 150, 7)
    return b.luu(path)


def khoi_mem(path, seed=29):
    """Khối mềm (slime) màu xanh lá, hai sừng nhỏ, mắt to, có giọt nhỏ. 700x620."""
    b = _But(700, 620, seed)
    LA, LA_T, LA_S = (110, 200, 90), (70, 140, 60), (180, 240, 150)
    b.da_giac([(250, 160), (230, 60), (300, 140)], LA_T)
    b.da_giac([(440, 140), (480, 50), (500, 170)], LA_T)
    b.da_giac([(350, 100), (560, 200), (640, 520), (60, 520), (140, 200)], LA)
    b.tron((200, 200, 280, 270), LA_S)
    b.elip((250, 280, 320, 360), INK, 0)
    b.tron((268, 294, 290, 318), (255, 255, 255))
    b.elip((400, 280, 470, 360), INK, 0)
    b.tron((418, 294, 440, 318), (255, 255, 255))
    b.cung((300, 380, 420, 440), 20, 160, 8)
    return b.luu(path)


# mã ảnh -> (hàm vẽ, mẫu khung nên chọn, mã trong công cụ)
ANH_AI = {
    'em-be-ao-do': em_be_ao_do,
    'em-be-ao-xanh': em_be_ao_xanh,
    'quai-bon-chan': quai_bon_chan,
    'ca-bay': ca_bay,
    'khoi-mem': khoi_mem,
}
MAU_AI = {'em-be-ao-do': ('nguoi', 'em-be'), 'em-be-ao-xanh': ('nguoi', 'em-be'), 'quai-bon-chan': ('bonChan', 'heoCon'),
          'ca-bay': ('bay', 'caChuon'), 'khoi-mem': ('mem', 'sua')}

if __name__ == '__main__':
    import os
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    for k, f in ANH_AI.items():
        print(f(os.path.join(out, k + '.png')))
