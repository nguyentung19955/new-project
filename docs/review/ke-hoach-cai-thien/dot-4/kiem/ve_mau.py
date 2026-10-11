# Vẽ 2 vật thể mẫu (rương, bàn thờ) CHỈ bằng màu trong bảng màu lõi, rồi dựng "tấm ảnh kiểu ChatGPT" (lưới 6×3 nền hồng tím,
# phóng to, làm mờ nhẹ, lệch màu nhẹ, thêm nhiễu) để chạy qua trang Tách Phòng. Đây là ảnh THỬ, không đưa vào game.
import sys, random
from PIL import Image, ImageFilter
OUT = sys.argv[1]
V = (0x14, 0x18, 0x2e)
def h(x): x = x.lstrip('#'); return tuple(int(x[i:i+2], 16) for i in (0, 2, 4))
GO_T, GO_V, GO_S, GO_N = h('#32180d'), h('#58371e'), h('#79451d'), h('#c98c34')
DA_T, DA_V, DA_S = h('#29313b'), h('#333c47'), h('#4a5560')
TH_T, TH_S, VANG = h('#5c5b73'), h('#cecdda'), h('#f4bf4d')
NGA, TOC_T, TOC_V, TIM, ANH_NUOC, LUA, THAN = h('#efe2d1'), h('#220f18'), h('#3b3234'), h('#7763ac'), h('#cedaea'), h('#eb7e14'), h('#a03409')

class Tam:
    def __init__(s, w, hh): s.w, s.h, s.im = w, hh, Image.new('RGBA', (w, hh), (0, 0, 0, 0)); s.p = s.im.load()
    def o(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if 0 <= x < s.w and 0 <= y < s.h: s.p[x, y] = c + (255,)
    def xoa(s, x0, y0, x1, y1):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.p[x, y] = (0, 0, 0, 0)
    def vien(s, day=2):  # viền ngoài một nét (2 điểm ảnh của ảnh = 1 điểm ảnh game ở độ nét gấp đôi)
        for _ in range(day):
            them = []
            for y in range(s.h):
                for x in range(s.w):
                    if s.p[x, y][3]: continue
                    if any(0 <= x+dx < s.w and 0 <= y+dy < s.h and s.p[x+dx, y+dy][3] for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))): them.append((x, y))
            for x, y in them: s.p[x, y] = V + (255,)
        return s.im

def ruong():  # 56×42 = rương 28×21 ở độ nét gấp đôi
    t = Tam(56, 42)
    t.o(10, 4, 45, 5, GO_S); t.o(8, 6, 47, 7, GO_S); t.o(6, 8, 49, 17, GO_V)          # nắp vòm
    t.o(12, 6, 30, 7, GO_N); t.o(8, 8, 26, 9, GO_S)                                     # ánh sáng trên nắp
    t.o(6, 16, 49, 17, GO_T)                                                             # bóng mép nắp
    t.o(6, 18, 49, 19, GO_T); t.o(16, 18, 39, 19, VANG)                                  # khe hé ánh vàng
    t.o(6, 20, 49, 39, GO_V); t.o(6, 20, 9, 35, GO_S); t.o(6, 36, 49, 39, GO_T)         # thân
    t.o(22, 20, 23, 35, GO_T); t.o(32, 20, 33, 35, GO_T)                                 # khe ván
    for x in (12, 40):                                                                    # hai đai sắt
        t.o(x, 4 if x == 12 else 4, x + 3, 39, TH_T); t.o(x, 6, x + 1, 13, TH_S); t.o(x, 22, x + 1, 27, TH_S)
    for x, y in ((6, 20), (46, 20), (6, 36), (46, 36)): t.o(x, y, x + 3, y + 3, VANG)   # bốn góc bịt đồng
    t.o(46, 22, 49, 23, GO_N); t.o(6, 38, 9, 39, GO_N); t.o(46, 38, 49, 39, GO_N)
    t.o(25, 16, 30, 27, VANG); t.o(25, 26, 30, 27, GO_N); t.o(27, 20, 28, 23, GO_T)     # ổ khoá
    return t.vien()

def ban_tho():  # 52×66 = bàn thờ 26×33 ở độ nét gấp đôi
    t = Tam(52, 66)
    t.o(4, 50, 47, 53, DA_S); t.o(4, 54, 47, 63, DA_V); t.o(4, 60, 47, 63, DA_T); t.o(40, 54, 47, 59, DA_T)   # bậc dưới
    t.o(10, 30, 41, 33, DA_S); t.o(10, 34, 41, 49, DA_V); t.o(36, 34, 41, 49, DA_T); t.o(10, 48, 35, 49, DA_T) # bậc trên
    t.o(10, 34, 11, 45, DA_S)
    t.o(24, 37, 27, 46, TIM); t.o(20, 39, 31, 40, TIM); t.o(22, 43, 29, 44, TIM); t.o(25, 39, 26, 40, ANH_NUOC) # ký hiệu bùa
    t.o(19, 16, 32, 27, NGA); t.o(21, 14, 30, 15, NGA); t.o(21, 28, 30, 31, NGA)        # đầu lâu
    t.o(31, 18, 32, 27, TH_S); t.o(29, 28, 30, 31, TH_S)
    t.o(21, 20, 24, 23, TOC_T); t.o(27, 20, 30, 23, TOC_T); t.o(22, 21, 23, 22, TIM); t.o(28, 21, 29, 22, TIM) # hốc mắt sáng
    t.o(25, 25, 26, 26, TOC_V); t.o(23, 29, 23, 31, TOC_V); t.o(26, 29, 26, 31, TOC_V); t.o(28, 29, 28, 31, TOC_V)
    for x in (12, 36):                                                                    # hai cây nến
        t.o(x, 22, x + 3, 29, NGA); t.o(x + 3, 22, x + 3, 29, TH_S)
        t.o(x, 16, x + 3, 21, LUA); t.o(x + 1, 14, x + 2, 15, LUA); t.o(x + 1, 18, x + 2, 21, VANG); t.o(x, 20, x, 21, THAN)
    t.o(22, 6, 29, 13, TIM); t.o(24, 4, 27, 5, TIM); t.o(25, 2, 26, 3, TIM); t.o(24, 8, 27, 13, ANH_NUOC); t.o(25, 6, 26, 7, ANH_NUOC) # lửa ma
    t.xoa(22, 6, 22, 7); t.xoa(29, 6, 29, 7)
    return t.vien()

R, B = ruong(), ban_tho()
R.save(OUT + '/mau-ruong-goc.png'); B.save(OUT + '/mau-ban-tho-goc.png')
# ---- tấm ảnh kiểu ChatGPT: 1536×1024, lưới 6×3, đủ 18 ô; dùng ô 1 (rương) và ô 8 (bàn thờ) đúng thứ tự lô "Đồ vật trong phòng" ----
W, H, C, HG = 1536, 1024, 6, 3; cw, ch = W // C, H // HG
tam = Image.new('RGBA', (W, H), (255, 0, 255, 255))
for o, im in [(i, B if i % 2 else R) for i in range(18)]:  # ô lẻ là rương, ô chẵn là bàn thờ: đủ 18 ô để công cụ nhận đúng lưới; chỉ lấy ô 1 (rương) và ô 8 (bàn thờ)
    k = 3; to = im.resize((im.width * k, im.height * k), Image.NEAREST)
    cx, cy = (o % C) * cw + cw // 2, (o // C) * ch + ch - 50
    tam.alpha_composite(to, (cx - to.width // 2, cy - to.height))
tam = tam.convert('RGB').filter(ImageFilter.GaussianBlur(0.5))       # mép mềm khoảng 1 điểm ảnh như ảnh AI
random.seed(4); p = tam.load()
for y in range(H):
    for x in range(W):
        r, g, b = p[x, y]
        if r > 200 and b > 200 and g < 80: continue                    # nền giữ trơn
        n = random.randint(-4, 4)                                      # lệch màu ấm nhẹ + nhiễu: AI không bao giờ ra đúng từng mã
        p[x, y] = (max(0, min(255, int(r * 1.05 + 5) + n)), max(0, min(255, int(g * 1.01 + 2) + n)), max(0, min(255, int(b * 0.93) + n)))
tam.save(OUT + '/tam-thu-kieu-chatgpt.png')
print('xong', R.size, B.size)
