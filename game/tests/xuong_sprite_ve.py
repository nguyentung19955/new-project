"""Tạo ảnh "vẽ tay" giả lập để thử Xưởng Sprite: con vật nét đậm, tô màu, trên giấy trắng hơi loang và có vết bẩn.
Dùng: from xuong_sprite_ve import ve_bon_chan, ve_nguoi  -> trả về đường dẫn PNG.
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

INK = (34, 26, 30)


def giay(w, h, seed):
    """Nền giấy trắng ngả vàng, sáng tối loang nhẹ, vài vết bẩn nhỏ."""
    rnd = random.Random(seed)
    im = Image.new('RGB', (w, h), (250, 248, 240))
    px = im.load()
    for y in range(h):
        for x in range(w):
            k = 1 - 0.05 * (x / w) - 0.04 * (y / h) + rnd.uniform(-0.012, 0.012)
            px[x, y] = tuple(max(0, min(255, int(c * k))) for c in (252, 249, 241))
    d = ImageDraw.Draw(im)
    for _ in range(6):
        x, y = rnd.randrange(w), rnd.randrange(h)
        d.ellipse([x, y, x + rnd.randint(2, 4), y + rnd.randint(2, 4)], fill=(150, 145, 140))
    return im


def net(d, pts, w=9):
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=INK, width=w)
    for p in pts:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=INK)


def elip(d, box, mau, w=8):
    d.ellipse(box, fill=INK)
    d.ellipse([box[0] + w, box[1] + w, box[2] - w, box[3] - w], fill=mau)


def chan(d, x0, y0, x1, y1, mau, w=26):
    """Chân: nét đậm bao quanh một dải màu."""
    d.line([(x0, y0), (x1, y1)], fill=INK, width=w + 16)
    d.ellipse([x1 - (w + 16) / 2, y1 - 10, x1 + (w + 16) / 2, y1 + 14], fill=INK)
    d.line([(x0, y0), (x1, y1)], fill=mau, width=w)


def ve_bon_chan(path, seed=3):
    """Con thú bốn chân màu cam quay sang phải: thân, đầu có mắt và tai, bốn chân, đuôi cong."""
    W, H = 640, 460
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    CAM, CAM_T, KEM = (232, 120, 48), (176, 78, 30), (250, 214, 160)
    # đuôi
    pts = [(150 + 40 * math.cos(a) - 60, 190 - 90 * math.sin(a)) for a in [i / 10 * 1.6 for i in range(11)]]
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=INK, width=34)
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=CAM_T, width=18)
    # chân xa (tối hơn)
    chan(d, 230, 270, 215, 395, CAM_T)
    chan(d, 420, 270, 435, 395, CAM_T)
    # thân
    elip(d, [140, 150, 500, 320], CAM)
    d.ellipse([200, 250, 440, 305], fill=KEM)
    for x in (230, 290, 350, 410):
        d.line([(x, 165), (x - 12, 205)], fill=CAM_T, width=10)
    # chân gần
    chan(d, 270, 280, 262, 408, CAM)
    chan(d, 455, 280, 470, 408, CAM)
    # đầu
    elip(d, [430, 90, 600, 250], CAM)
    d.polygon([(450, 115), (470, 40), (505, 100)], fill=INK)
    d.polygon([(462, 108), (472, 62), (494, 102)], fill=CAM_T)
    d.ellipse([520, 150, 575, 205], fill=INK)
    d.ellipse([528, 158, 567, 197], fill=(255, 255, 255))
    d.ellipse([545, 168, 563, 190], fill=INK)
    d.ellipse([560, 205, 600, 235], fill=KEM)
    d.ellipse([588, 205, 600, 217], fill=INK)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(path)
    return path


def ve_nguoi(path, seed=5):
    """Một em bé hai chân quay sang phải: đầu to, áo xanh, tay chân tách rời."""
    W, H = 420, 560
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    XANH, DA, NAU = (60, 140, 210), (250, 205, 170), (120, 70, 40)
    chan(d, 185, 360, 170, 500, NAU, 30)
    net(d, [(160, 230), (110, 320)], 40)
    d.line([(160, 230), (110, 320)], fill=DA, width=22)
    elip(d, [130, 200, 290, 390], XANH)
    chan(d, 240, 360, 255, 505, NAU, 30)
    net(d, [(260, 230), (320, 310)], 40)
    d.line([(260, 230), (320, 310)], fill=DA, width=22)
    elip(d, [110, 40, 330, 230], DA)
    d.chord([110, 30, 330, 180], 180, 360, fill=(200, 40, 40))
    d.ellipse([255, 120, 290, 160], fill=INK)
    d.ellipse([262, 126, 282, 148], fill=(255, 255, 255))
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(path)
    return path


if __name__ == '__main__':
    out = os.path.dirname(os.path.abspath(__file__))
    print(ve_bon_chan(os.path.join(out, '_thu_bon_chan.png')), ve_nguoi(os.path.join(out, '_thu_nguoi.png')))


def ve_kiem(path, seed=7):
    """Thanh kiếm dựng đứng, mũi lên trên, chuôi ở dưới, có một con mắt (vũ khí sống)."""
    W, H = 300, 620
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    d.polygon([(150, 30), (196, 110), (196, 420), (104, 420), (104, 110)], fill=INK)
    d.polygon([(150, 52), (182, 114), (182, 408), (118, 408), (118, 114)], fill=(110, 200, 240))
    d.polygon([(150, 52), (150, 408), (118, 408), (118, 114)], fill=(190, 235, 255))
    d.ellipse([122, 200, 178, 256], fill=INK); d.ellipse([130, 208, 170, 248], fill=(255, 255, 255)); d.ellipse([146, 218, 166, 242], fill=INK)
    d.rectangle([60, 410, 240, 452], fill=INK); d.rectangle([70, 418, 230, 444], fill=(230, 180, 60))
    d.rectangle([126, 448, 174, 570], fill=INK); d.rectangle([136, 452, 164, 562], fill=(120, 70, 40))
    d.ellipse([118, 556, 182, 604], fill=INK); d.ellipse([128, 564, 172, 596], fill=(230, 180, 60))
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path)
    return path


def ve_mu(path, seed=9):
    """Cái mũ rộng vành màu tím có lông chim, nhìn ngang."""
    W, H = 520, 360
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    elip(d, [40, 210, 480, 300], (120, 60, 170), 10)
    d.rectangle([150, 90, 370, 250], fill=INK); d.rectangle([162, 100, 358, 250], fill=(150, 80, 200))
    d.rectangle([162, 200, 358, 228], fill=(250, 200, 60))
    net(d, [(330, 110), (380, 40), (420, 20)], 14)
    d.line([(330, 110), (380, 40), (420, 20)], fill=(240, 90, 80), width=6)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path)
    return path


def ve_xu(path, seed=11):
    """Đồng xu xanh lục có lỗ vuông."""
    W, H = 360, 360
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    elip(d, [60, 60, 300, 300], (60, 200, 120), 16)
    d.rectangle([150, 150, 210, 210], fill=INK); d.rectangle([162, 162, 198, 198], fill=(250, 248, 240))
    d.ellipse([100, 100, 140, 130], fill=(200, 255, 220))
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path)
    return path


def ve_em_be_ao_do(path, seed=13):
    """Em bé áo trùm đỏ, mặt nạ giấy vẽ hoa văn, chuông nhỏ ở cổ, găng tay to, quay sang phải.
    Vẽ to (600x820) với nét viền mảnh như tranh thật để thử kiểu thu nhỏ "Giữ nét"."""
    W, H = 600, 820
    im = giay(W, H, seed)
    d = ImageDraw.Draw(im)
    DO, DO_T, GIAY, NAU, VANG, XAM = (206, 38, 44), (140, 22, 34), (246, 236, 214), (112, 66, 38), (246, 196, 40), (70, 60, 72)
    w = 8
    # chân (quần xám, giày nâu)
    for x0, x1 in ((250, 235), (340, 360)):
        d.line([(x0, 600), (x1, 740)], fill=INK, width=58)
        d.line([(x0, 600), (x1, 735)], fill=XAM, width=42)
        d.ellipse([x1 - 40, 712, x1 + 46, 770], fill=INK)
        d.ellipse([x1 - 32, 720, x1 + 38, 762], fill=NAU)
    # tay sau + găng to
    d.line([(230, 400), (170, 520)], fill=INK, width=50); d.line([(230, 400), (170, 520)], fill=DO_T, width=34)
    d.ellipse([118, 488, 222, 588], fill=INK); d.ellipse([126, 496, 214, 580], fill=NAU)
    # áo trùm đỏ (thân hình chuông)
    d.polygon([(300, 250), (420, 360), (450, 620), (150, 620), (180, 360)], fill=INK)
    d.polygon([(300, 262), (410, 368), (440, 612), (160, 612), (190, 368)], fill=DO)
    for x in (220, 300, 380):  # nếp áo
        d.line([(x, 420), (x + 6, 600)], fill=DO_T, width=w)
    # mũ trùm
    d.ellipse([140, 40, 470, 380], fill=INK)
    d.ellipse([140 + w, 40 + w, 470 - w, 380 - w], fill=DO)
    # mặt nạ giấy (ló ra trước mũ trùm)
    d.ellipse([250, 110, 450, 330], fill=INK)
    d.ellipse([250 + w, 110 + w, 450 - w, 330 - w], fill=GIAY)
    d.ellipse([355, 170, 395, 215], fill=INK)                     # mắt
    d.ellipse([368, 180, 384, 198], fill=(255, 255, 255))
    d.arc([330, 230, 420, 290], 20, 160, fill=DO_T, width=10)      # miệng vẽ đỏ
    d.ellipse([405, 220, 435, 250], fill=(236, 120, 130))         # má hồng
    d.line([(300, 140), (330, 160)], fill=INK, width=6)             # chân mày vẽ
    # chuông nhỏ ở cổ
    d.ellipse([285, 340, 335, 392], fill=INK); d.ellipse([292, 347, 328, 385], fill=VANG); d.ellipse([306, 372, 314, 380], fill=INK)
    # tay trước + găng to
    d.line([(370, 400), (450, 500)], fill=INK, width=50); d.line([(370, 400), (450, 500)], fill=DO, width=34)
    d.ellipse([410, 460, 530, 575], fill=INK); d.ellipse([419, 469, 521, 566], fill=NAU)
    d.line([(440, 500), (500, 495)], fill=INK, width=6)
    im = im.filter(ImageFilter.GaussianBlur(0.8))
    im.save(path)
    return path
