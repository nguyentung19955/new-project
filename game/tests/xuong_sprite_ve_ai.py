"""Ảnh giả lập kiểu "ảnh AI vẽ" để thử Xưởng Sprite (sửa vỡ hình, Tự đoán).

Khác ảnh vẽ tay (xuong_sprite_ve.py): nhân vật chibi nét viền đậm, tô màu có đổ bóng mềm, nền gần trắng xám nhạt
(không loang giấy), tay áp sát thân, chân sát nhau, nhiều chi tiết nhỏ. Có cả dáng nhìn chính diện hơi nghiêng.
Dùng: from xuong_sprite_ve_ai import ve_ai_em_be, ve_ai_bon_chan, ve_ai_ca_bay, ve_ai_khoi_mem -> trả về đường dẫn PNG.
"""
from PIL import Image, ImageDraw, ImageFilter

INK = (38, 28, 34)
K = 2  # vẽ to gấp đôi rồi thu nhỏ để có mép mịn như ảnh AI


def _nen(w, h):
    """Nền trắng xám nhạt, sáng dần lên giữa (như ảnh AI xuất ra)."""
    im = Image.new('RGB', (w * K, h * K), (236, 236, 238))
    d = ImageDraw.Draw(im)
    for r in range(12, 0, -1):
        c = 236 + (12 - r)
        d.ellipse([w * K / 2 - r * w * K / 18, h * K / 2 - r * h * K / 18, w * K / 2 + r * w * K / 18, h * K / 2 + r * h * K / 18], fill=(c, c, c + 1))
    return im, d


def _s(box):
    return [v * K for v in box]


def elip(d, box, mau, net=7, bong=None):
    """Hình bầu dục viền đậm, tô màu, có mảng tối phía dưới phải (bóng) nếu cho màu bóng."""
    d.ellipse(_s(box), fill=INK)
    x0, y0, x1, y1 = box
    d.ellipse(_s([x0 + net, y0 + net, x1 - net, y1 - net]), fill=mau)
    if bong:
        w, h = x1 - x0, y1 - y0
        d.chord(_s([x0 + net, y0 + net, x1 - net, y1 - net]), 20, 160, fill=bong)
        d.ellipse(_s([x0 + net + w * 0.12, y0 + net + h * 0.05, x1 - net - w * 0.1, y1 - net - h * 0.22]), fill=mau)


def da_giac(d, pts, mau, net=7):
    d.polygon([(x * K, y * K) for x, y in pts], fill=INK)
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    trong = []
    for x, y in pts:
        dx, dy = cx - x, cy - y
        L = (dx * dx + dy * dy) ** 0.5 or 1
        trong.append(((x + dx / L * net) * K, (y + dy / L * net) * K))
    d.polygon(trong, fill=mau)


def duong(d, pts, mau, w):
    d.line([(x * K, y * K) for x, y in pts], fill=mau, width=int(w * K), joint='curve')


def _xong(im, path):
    im = im.resize((im.width // K, im.height // K), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.4))
    im.save(path)
    return path


def ve_ai_em_be(path):
    """Em bé áo trùm đỏ, mặt nạ giấy, găng to, nhìn chính diện hơi nghiêng sang phải. Tay áp sát thân, chân sát nhau.
    Giống ảnh AI chủ dự án đã thử: đầu to (mũ trùm), thân hình chuông, hai găng nâu to ở hai bên hông, hai chân ngắn sát nhau."""
    W, H = 560, 760
    im, d = _nen(W, H)
    DO, DO_T, DO_S = (204, 40, 46), (150, 26, 36), (232, 88, 82)
    GIAY, GIAY_T = (246, 238, 218), (222, 208, 182)
    NAU, NAU_T = (128, 78, 44), (92, 54, 30)
    XAM, VANG = (78, 70, 84), (246, 198, 48)
    # chân sát nhau (quần xám, giày nâu)
    for x in (226, 300):
        da_giac(d, [(x, 560), (x + 52, 560), (x + 50, 680), (x + 2, 680)], XAM)
        elip(d, [x - 12, 650, x + 66, 712], NAU, bong=NAU_T)
    # thân hình chuông (áo trùm)
    da_giac(d, [(280, 300), (390, 360), (420, 600), (140, 600), (170, 360)], DO)
    d.polygon([(205 * K, 420 * K), (230 * K, 590 * K), (190 * K, 590 * K)], fill=DO_T)  # nếp áo tối
    duong(d, [(280, 380), (284, 590)], DO_T, 7)
    # hai tay áp sát thân, găng to ở hông
    for x0, x1, xg in ((175, 150, 92), (385, 410, 362)):
        duong(d, [(x0, 360), (x1, 470)], INK, 54)
        duong(d, [(x0, 360), (x1, 470)], DO_S if x0 > 200 else DO_T, 38)
        elip(d, [xg, 440, xg + 104, 548], NAU, bong=NAU_T)
        duong(d, [(xg + 30, 470), (xg + 40, 500)], INK, 5)
    # mũ trùm to (đầu)
    elip(d, [110, 30, 450, 360], DO, net=8, bong=DO_T)
    # tai mũ nhọn
    da_giac(d, [(150, 80), (130, 10), (205, 50)], DO)
    da_giac(d, [(400, 70), (430, 0), (360, 45)], DO)
    # mặt nạ giấy hơi lệch sang phải (nhìn hơi nghiêng)
    elip(d, [190, 110, 410, 330], GIAY, net=7, bong=GIAY_T)
    elip(d, [240, 180, 278, 224], (255, 255, 255), net=9)
    elip(d, [326, 180, 364, 224], (255, 255, 255), net=9)
    d.arc(_s([262, 238, 344, 292]), 20, 160, fill=DO_T, width=10 * K)
    elip(d, [210, 236, 240, 262], (238, 130, 140), net=1)
    elip(d, [360, 236, 390, 262], (238, 130, 140), net=1)
    duong(d, [(232, 160), (268, 150)], INK, 6)
    duong(d, [(334, 150), (370, 160)], INK, 6)
    # chuông nhỏ ở cổ
    elip(d, [262, 330, 304, 372], VANG, net=6)
    elip(d, [279, 354, 287, 362], INK, net=1)
    return _xong(im, path)


def ve_ai_bon_chan(path):
    """Quái bốn chân chibi (heo rừng xanh) nhìn ngang quay phải, chân ngắn sát nhau, đuôi xoắn nhỏ, có ngà."""
    W, H = 720, 520
    im, d = _nen(W, H)
    XANH, XANH_T, KEM, NAU = (92, 150, 98), (60, 104, 70), (238, 222, 186), (110, 72, 44)
    # chân (xa tối hơn) sát nhau dưới bụng
    for x, m in ((236, XANH_T), (282, XANH), (444, XANH_T), (490, XANH)):
        da_giac(d, [(x, 330), (x + 48, 330), (x + 46, 448), (x + 2, 448)], m)
        elip(d, [x - 6, 424, x + 54, 462], NAU)
    # đuôi xoắn nhỏ phía sau
    duong(d, [(156, 250), (110, 222), (96, 180), (124, 160)], INK, 22)
    duong(d, [(156, 250), (110, 222), (96, 180), (124, 160)], XANH, 10)
    # thân to
    elip(d, [140, 150, 560, 390], XANH, net=8, bong=XANH_T)
    # sọc lưng
    for x in (230, 300, 370):
        duong(d, [(x, 170), (x + 14, 220)], XANH_T, 9)
    # đầu to phía trước
    elip(d, [440, 90, 680, 330], XANH, net=8, bong=XANH_T)
    da_giac(d, [(480, 110), (470, 40), (530, 96)], XANH)  # tai
    elip(d, [600, 220, 700, 300], KEM, net=7)  # mõm
    elip(d, [630, 240, 646, 258], INK, net=1)
    elip(d, [660, 240, 676, 258], INK, net=1)
    elip(d, [560, 150, 604, 200], (255, 255, 255), net=9)  # mắt
    da_giac(d, [(612, 290), (640, 350), (650, 292)], (250, 248, 236), net=5)  # ngà
    return _xong(im, path)


def ve_ai_ca_bay(path):
    """Cá bay chibi quay phải: thân tròn, vây cánh lớn phía trên, đuôi chẻ phía sau, mắt to, vảy nhỏ."""
    W, H = 720, 480
    im, d = _nen(W, H)
    LAM, LAM_T, TRANG, CAM = (70, 140, 214), (44, 96, 168), (226, 240, 250), (240, 150, 60)
    # vây cánh xa (sau thân)
    da_giac(d, [(380, 200), (450, 40), (500, 70), (440, 210)], LAM_T)
    # đuôi chẻ
    da_giac(d, [(190, 240), (60, 150), (90, 250), (60, 350)], CAM)
    # thân
    elip(d, [160, 150, 560, 370], LAM, net=8, bong=LAM_T)
    elip(d, [250, 270, 530, 368], TRANG, net=6)
    for x in (260, 310, 360):
        d.arc(_s([x, 200, x + 40, 250]), 200, 340, fill=LAM_T, width=5 * K)
    # vây cánh gần (trên thân)
    da_giac(d, [(300, 210), (330, 20), (410, 40), (390, 220)], (120, 186, 236))
    duong(d, [(330, 60), (350, 200)], LAM_T, 5)
    # mắt to và miệng
    elip(d, [450, 190, 520, 260], (255, 255, 255), net=10)
    elip(d, [482, 212, 500, 232], INK, net=1)
    duong(d, [(540, 290), (556, 296)], INK, 6)
    # vây bụng nhỏ
    da_giac(d, [(330, 350), (300, 420), (380, 360)], CAM)
    return _xong(im, path)


def ve_ai_khoi_mem(path):
    """Khối mềm (slime) chibi: giọt tròn có hai sừng nhỏ, hai tua hai bên, mắt to, bóng sáng."""
    W, H = 620, 560
    im, d = _nen(W, H)
    TIM, TIM_T, SANG = (160, 96, 210), (110, 60, 160), (214, 176, 240)
    # tua hai bên sát thân
    da_giac(d, [(150, 360), (70, 430), (90, 470), (180, 420)], TIM_T)
    da_giac(d, [(470, 360), (550, 430), (530, 470), (440, 420)], TIM_T)
    # thân giọt
    da_giac(d, [(310, 60), (400, 160), (500, 330), (500, 470), (120, 470), (120, 330), (220, 160)], TIM, net=12)
    elip(d, [110, 260, 510, 500], TIM, net=8, bong=TIM_T)
    # sừng nhỏ
    da_giac(d, [(250, 150), (230, 80), (280, 130)], (250, 220, 120))
    da_giac(d, [(360, 140), (390, 70), (400, 150)], (250, 220, 120))
    # mắt, miệng, bóng sáng
    elip(d, [220, 300, 280, 370], (255, 255, 255), net=9)
    elip(d, [340, 300, 400, 370], (255, 255, 255), net=9)
    d.arc(_s([270, 380, 350, 430]), 20, 160, fill=INK, width=7 * K)
    elip(d, [170, 250, 210, 290], SANG, net=0)
    return _xong(im, path)


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    for f, n in ((ve_ai_em_be, 'ai-em-be.png'), (ve_ai_bon_chan, 'ai-bon-chan.png'), (ve_ai_ca_bay, 'ai-ca-bay.png'), (ve_ai_khoi_mem, 'ai-khoi-mem.png')):
        print(f(out + '/' + n))
