"""Dựng CẢNH PIXEL nhìn ngang (~2 màn = 640×180 điểm ảnh) hoàn toàn bằng code theo lưới + palette.json.

Không dùng asset ngoài. Phong cách lấy từ bảng asset tham khảo (màu phẳng, viền tối, bóng 1–2 mức) nhưng NHÌN NGANG.
Ra (art/huong-moi/lam-pixel/canh/):
  nen-xa-1.png  trời + núi xa (cuộn 0,15)       nen-xa-2.png  rừng xanh trầm (cuộn 0,45)
  canh.png      đất, bậc, đá, rễ, cây, cột đèn lồng, miếu chuông (cuộn 1)
  den-sang.png  quầng đèn 2 hình (chập chờn)    nom.png  hình nộm 3 hình (đứng / trúng trái / trúng phải)
  man.json      lưới va chạm (ô 16 điểm = 48 px logic), chỗ xuất phát, hình nộm, đèn.
Chạy:  python3 art/huong-moi/lam-pixel/code/dung_canh.py
"""
import json, math, os, random, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixel import Anh, k, GOC, RGB

O = 16                  # ô (điểm ảnh)
COT, HANG = 40, 12      # 640 × 192 (màn nhìn 180)
VW, VH = 320, 180
# đỉnh đất (hàng ô) theo cột
DINH = []
for c in range(COT):
    h = 9
    if 13 <= c <= 15: h = 8
    if 16 <= c <= 18: h = 7
    if 19 <= c <= 20: h = 8
    if 29 <= c <= 32: h = 8
    DINH.append(h)
R = random.Random(7)


def dat_o(a, c, r, loai):
    """vẽ một ô 16×16 tại cột c hàng r. loai: 'mat' (có cỏ trên), 'ruot' (đất trong), 'da' (khối đá bậc)"""
    x0, y0 = c * O, r * O
    for y in range(O):
        for x in range(O):
            X, Y = x0 + x, y0 + y
            if loai == 'da':
                # đá xếp: viên 8×6 lệch hàng
                hy = y // 6; ox = 4 if hy % 2 else 0
                mx = (x + ox) % 8 == 0; my = y % 6 == 0
                col = 'd'
                if my or mx: col = 'D'
                elif (y % 6) == 1: col = 'A'
                elif (x + ox) % 8 == 7 or (y % 6) == 5: col = 'D' if R.random() < 0.4 else 'd'
                a.dat(X, Y, col)
            else:
                sau = Y - 9 * O                         # càng sâu càng tối (tính từ mặt đất chung)
                n = (math.sin(X * 0.37 + Y * 0.11) + math.sin(X * 0.13 - Y * 0.41) + math.sin((X + Y) * 0.07))
                col = 'W' if n > 1.2 else 'V'
                if sau > 22 and n < -0.6: col = 'D'
                if sau > 34: col = 'V' if n > 0.4 else 'D'
                a.dat(X, Y, col)
    if loai == 'ruot' and R.random() < 0.35:   # đá nhỏ trong đất
        sx, sy = x0 + R.randint(2, 10), y0 + R.randint(3, 10)
        a.ascii([".DD.", "DdAD", "DddD", ".DD."], sx, sy)


def ve_mat_co(a, x0, x1, y):
    """mép cỏ / rêu trên mặt đất từ x0 tới x1 (điểm ảnh), y = hàng đỉnh đất"""
    for x in range(x0, x1):
        a.dat(x, y, 'g' if (x * 7) % 5 else 'G')
        a.dat(x, y + 1, 'G')
        a.dat(x, y + 2, 'G' if (x * 3) % 4 else 'r')
        n = 3 + ((x * 13 + 5) % 7 > 4) + ((x * 5) % 9 > 6)      # tua cỏ rủ xuống mép đất
        for d in range(3, n + 1):
            a.dat(x, y + d, 'r' if d < n else 'R')
        if (x * 11) % 9 == 0:                     # ngọn cỏ nhô lên
            a.dat(x, y - 1, 'G'); a.dat(x, y - 2, 'g')
        elif (x * 17) % 13 == 0:
            a.dat(x, y - 1, 'g')
    for x in range(x0, x1):                       # viền tối trên ngọn cỏ
        if a.lay(x, y - 1) < 0 and a.lay(x, y - 2) < 0:
            pass


def ve_mat_ben(a, x, y0, y1, ben):
    """mặt bên bậc: viền mực + bóng"""
    for y in range(y0, y1):
        a.dat(x, y, 'k')
        a.dat(x + (1 if ben < 0 else -1), y, 'D')


def ve_den_long(a, x, y):
    """cột gỗ + tay treo + đèn lồng (nhìn ngang). (x,y) = chân cột trên mặt đất."""
    cao = 46
    for yy in range(y - cao, y):
        a.dat(x, yy, 'k'); a.dat(x + 1, yy, 'w'); a.dat(x + 2, yy, 'W'); a.dat(x + 3, yy, 'V'); a.dat(x + 4, yy, 'k')
    a.hcn(x - 1, y - cao - 1, x + 13, y - cao - 1, 'k')
    a.hcn(x, y - cao, x + 12, y - cao + 1, 'W'); a.hcn(x, y - cao, x + 12, y - cao, 'w')
    a.hcn(x - 1, y - cao + 2, x + 13, y - cao + 2, 'k')
    a.dat(x + 13, y - cao, 'k'); a.dat(x + 13, y - cao + 1, 'k')
    a.ascii(["k.", "kk", ".k"], x + 4, y - cao + 3)                   # giằng chéo
    a.dat(x + 11, y - cao + 3, 'D'); a.dat(x + 11, y - cao + 4, 'D')   # móc
    a.ascii(["..kkk..",
             ".kDDDk.",
             "kDdddDk",
             "kdEEEdk",
             "kdEsEdk",
             "kdeEedk",
             "kdeeedk",
             "kDdddDk",
             ".kDDDk.",
             "..kkk.."], x + 8, y - cao + 5)
    # đá chân cột + cỏ
    a.ascii(["...kkkk...", "..kaaAAk..", ".kaAAAAdk.", "kAAAAdddDk"], x - 3, y - 4)
    for i in range(-5, 10):
        if i % 3 == 0: a.dat(x + i, y - 1, 'G'); a.dat(x + i, y - 2, 'g')
    return (x + 11, y - cao + 9)          # tâm đèn


def ve_mieu(a, x, y):
    """miếu chuông nhỏ: nền đá 2 bậc, 2 cột đá, mái gỗ, chuông đồng. (x,y) = góc trái dưới trên mặt đất."""
    W = 40
    a.hcn(x - 2, y - 3, x + W + 1, y - 1, 'd'); a.hcn(x - 2, y - 3, x + W + 1, y - 3, 'a')
    a.hcn(x - 3, y - 4, x + W + 2, y - 4, 'k'); a.hcn(x - 3, y - 3, x - 3, y - 1, 'k'); a.hcn(x + W + 2, y - 3, x + W + 2, y - 1, 'k')
    a.hcn(x + 1, y - 6, x + W - 2, y - 5, 'A'); a.hcn(x + 1, y - 6, x + W - 2, y - 6, 'a')
    a.hcn(x, y - 7, x + W - 1, y - 7, 'k'); a.dat(x, y - 6, 'k'); a.dat(x + W - 1, y - 6, 'k')
    top = y - 40
    for cx in (x + 3, x + W - 9):        # cột đá
        for yy in range(top, y - 7):
            for i in range(6):
                c = 'k' if i in (0, 5) else ('a' if i == 1 else ('d' if i == 4 else 'A'))
                if (yy - top) % 7 == 0 and 0 < i < 5: c = 'd'
                a.dat(cx + i, yy, c)
        # rêu bám
        for yy in range(y - 18, y - 7):
            if (yy * 3 + cx) % 4 == 0: a.dat(cx + 1, yy, 'r'); a.dat(cx + 2, yy, 'G')
    # mái gỗ (nhìn ngang: hình thang dốc)
    for j in range(10):
        l, r = x - 5 + j, x + W + 4 - j
        yy = top - 1 - j
        for xx in range(l, r + 1):
            c = 'W'
            if j == 0: c = 'V'
            elif j < 3: c = '3' if (xx // 3) % 2 else '4'     # ngói xanh như bảng asset
            elif j < 8: c = '2' if (xx // 3 + j) % 2 else '3'
            else: c = 'W'
            a.dat(xx, yy, c)
        a.dat(l - 1, yy, 'k'); a.dat(r + 1, yy, 'k')
    a.hcn(x - 5, top - 11, x + W + 4 - 9 + 0, top - 11, 'k')
    a.hcn(x + 4, top - 12, x + W - 5, top - 12, 'k')
    a.hcn(x - 6, top, x + W + 5, top, 'k')
    a.hcn(x - 5, top - 1, x + W + 4, top - 1, 'w')
    # chuông đồng treo giữa
    bx = x + W // 2 - 5
    a.hcn(bx + 4, top + 1, bx + 5, top + 3, 'V')
    a.ascii(["...kkkk...",
             "..kbbBnk..",
             ".kbbBBBnk.",
             ".kbBBBBnk.",
             ".kbBBBBnk.",
             "kbbBBBBBnk",
             "knnnnnnnnk",
             ".kkk.kkkk.",
             "....ke...."], bx, top + 4)


def ve_cay(a, x, y):
    """cây lớn nhìn ngang: thân gỗ, rễ toả, tán xanh rêu từng cụm. (x,y) = gốc giữa trên mặt đất"""
    # thân
    for yy in range(y - 44, y):
        w = 4 + (1 if yy > y - 8 else 0) + (2 if yy > y - 4 else 0)
        for xx in range(x - w, x + w + 1):
            d = xx - (x - w)
            c = 'V' if d < 2 else ('w' if d == w * 2 - 2 else 'W')
            if (yy * 5 + xx) % 11 == 0: c = 'V'
            a.dat(xx, yy, c)
        a.dat(x - w - 1, yy, 'k'); a.dat(x + w + 1, yy, 'k')
    # rễ toả trên mặt đất
    for (dx, dl) in ((-1, 12), (1, 14)):
        for i in range(dl):
            xx = x + dx * (6 + i); yy = y - 2 + i // 5
            a.dat(xx, yy - 1, 'k'); a.dat(xx, yy, 'W'); a.dat(xx, yy + 1, 'V')
    # tán: cụm tròn
    cum = [(-14, -54, 12), (0, -62, 15), (14, -54, 12), (-8, -44, 10), (10, -44, 10), (-20, -44, 8), (22, -46, 8)]
    can = Anh(a.w, a.h)
    for (dx, dy, r) in cum:
        cx, cy = x + dx, y + dy
        for yy in range(cy - r, cy + r + 1):
            for xx in range(cx - r, cx + r + 1):
                d = math.hypot(xx - cx, (yy - cy) * 1.1)
                if d <= r:
                    c = 'r'
                    if (yy - cy) > r * 0.35 or (xx - cx) < -r * 0.5: c = 'R'
                    if (yy - cy) < -r * 0.45 and (xx - cx) > -r * 0.2: c = 'G'
                    if (xx * 3 + yy * 5) % 17 == 0: c = 'R' if c == 'r' else 'r'
                    can.dat(xx, yy, c)
    can.vien_ngoai('k')
    a.dan(can, 0, 0)


def ve_re_treo(a, x, y, dai):
    """rễ rủ xuống dưới mép đất"""
    xx = x
    for i in range(dai):
        a.dat(xx - 1, y + i, 'k'); a.dat(xx, y + i, 'V'); a.dat(xx + 1, y + i, 'k')
        if i % 4 == 3: xx += 1 if (x + i) % 2 else -1


def ve_da(a, x, y, to=True):
    if to:
        a.ascii(["....kkkkk.....",
                 "..kkaaaAAk....",
                 ".kaaAAAAAdkkk.",
                 ".kaAAAAAddaaAk",
                 "kaAAAAAdddAAdk",
                 "kAAAAAddDdAddk",
                 "kAAdddDDDddddk",
                 "kkkkkkkkkkkkkk"], x, y - 8)
        for i in (2, 3, 4, 9, 10):
            a.dat(x + i, y - 8 + 1, 'G')
    else:
        a.ascii(["..kkk..", ".kaAAk.", "kaAAddk", "kkkkkkk"], x, y - 4)


def nen_xa_1():
    w = 420
    a = Anh(w, VH)
    for y in range(VH):          # trời: dải phẳng (không gradient mịn)
        c = 'Z' if y < 60 else ('z' if y < 110 else 'y')
        for x in range(w):
            if y in (59, 60, 109, 110) and (x + y) % 2:   # dither 1 hàng nối dải
                c2 = 'z' if y < 100 else 'y'
                a.dat(x, y, c2)
            else:
                a.dat(x, y, c)
    # trăng mờ
    for yy in range(18, 40):
        for xx in range(250, 272):
            d = math.hypot(xx - 261, yy - 29)
            if d < 10.5: a.dat(xx, yy, 'x' if d > 8 else 'y')
    # núi xa
    for x in range(w):
        h = 70 + 18 * math.sin(x / 37) + 10 * math.sin(x / 13 + 1) + 6 * math.sin(x / 7)
        for y in range(int(VH - h), VH):
            a.dat(x, y, 'y' if y > VH - h + 2 else 'x')
    return a


def nen_xa_2():
    """rừng xa: tán tròn xanh trầm + thân tối, sương dither"""
    w = 520
    a = Anh(w, VH)
    r = random.Random(3)
    x = -10
    while x < w + 10:
        h = r.randint(55, 95); rr = r.randint(11, 18); cx = x
        for y in range(VH - h, VH):                       # thân
            for xx in range(cx - 2, cx + 2):
                if 0 <= xx < w: a.dat(xx, y, 'Z')
        for (dx, dy, q) in ((0, 0, rr), (-rr // 2, rr // 2, rr * 0.75), (rr // 2, rr // 2 + 2, rr * 0.7)):
            ccx, ccy = cx + dx, VH - h + dy
            for y in range(int(ccy - q), int(ccy + q) + 1):
                for xx in range(int(ccx - q), int(ccx + q) + 1):
                    if 0 <= xx < w and 0 <= y < VH and math.hypot(xx - ccx, y - ccy) <= q:
                        c = 'z'
                        if y - ccy < -q * 0.4 and xx - ccx > -q * 0.3: c = 'y'
                        a.dat(xx, y, c)
        x += r.randint(16, 28)
    for y in range(150, VH):
        for xx in range(w):
            a.dat(xx, y, 'z' if y < 158 else 'Z')
    for y in range(138, 152):                              # sương mù dither
        for xx in range(w):
            if (xx + y) % (2 if 143 <= y <= 146 else 4) == 0 and a.lay(xx, y) >= 0: a.dat(xx, y, 'x')
    return a


def main():
    out = os.path.join(GOC, 'canh'); os.makedirs(out, exist_ok=True)
    W, H = COT * O, HANG * O
    a = Anh(W, H)
    # đất + bậc
    for c in range(COT):
        top = DINH[c]
        for r in range(top, HANG):
            dat_o(a, c, r, 'da' if (r < 9) else 'ruot')
    # mặt cỏ trên mỗi đoạn cùng độ cao, mặt bên bậc
    c = 0
    while c < COT:
        d = c
        while d + 1 < COT and DINH[d + 1] == DINH[c]: d += 1
        ve_mat_co(a, c * O, (d + 1) * O, DINH[c] * O)
        c = d + 1
    for c in range(1, COT):
        if DINH[c] != DINH[c - 1]:
            hi, lo = min(DINH[c], DINH[c - 1]), max(DINH[c], DINH[c - 1])
            if DINH[c] < DINH[c - 1]:
                ve_mat_ben(a, c * O, hi * O + 3, lo * O + 2, -1)
            else:
                ve_mat_ben(a, c * O - 1, hi * O + 3, lo * O + 2, 1)
    # trang trí
    G = lambda col: DINH[col] * O
    den = []
    den.append(ve_den_long(a, 3 * O + 2, G(3)))
    ve_da(a, 6 * O + 2, G(6), False)
    ve_re_treo(a, 13 * O + 4, G(13) + 4, 7)
    ve_re_treo(a, 16 * O + 6, G(16) + 4, 9)
    ve_re_treo(a, 19 * O + 9, G(19) + 4, 6)
    ve_da(a, 21 * O + 4, G(21), True)
    ve_mieu(a, 23 * O + 4, G(24))
    ve_cay(a, 31 * O, G(31))
    ve_re_treo(a, 29 * O + 3, G(29) + 4, 8)
    ve_re_treo(a, 32 * O + 10, G(32) + 4, 10)
    den.append(ve_den_long(a, 35 * O + 6, G(35)))
    ve_da(a, 38 * O, G(38), False)
    a.luu(os.path.join(out, 'canh.png'))
    nen_xa_1().luu(os.path.join(out, 'nen-xa-1.png'))
    nen_xa_2().luu(os.path.join(out, 'nen-xa-2.png'))
    # quầng đèn: vòng tròn pixel 2 mức, 2 hình (chập chờn 1 điểm)
    gl = Image.new('RGBA', (2 * 48, 48), (0, 0, 0, 0)); px = gl.load()
    for f, rr in enumerate((21, 20)):
        for y in range(48):
            for x in range(48):
                d = math.hypot(x - 23.5, y - 23.5)
                if d <= rr * 0.55: px[f * 48 + x, y] = (255, 214, 120, 44) if (x + y) % 2 or d <= rr * 0.35 else (255, 214, 120, 30)
                elif d <= rr: px[f * 48 + x, y] = (242, 163, 58, 22)
    gl.save(os.path.join(out, 'den-sang.png'))
    # hình nộm: cọc gỗ + bao rơm + đầu vải
    nom = Anh(3 * 24, 36)
    def ve_nom(ox, nghieng):
        b = Anh(24, 36)
        for y in range(18, 35):
            b.dat(11, y, 'W'); b.dat(12, y, 'V')
        b.hcn(5, 33, 18, 34, 'V'); b.hcn(6, 33, 17, 33, 'W')
        for y in range(10, 27):
            for x in range(6, 18):
                if (x - 11.5) ** 2 / 36 + (y - 18.5) ** 2 / 80 <= 1:
                    c = 'w' if x > 12 else 'W'
                    if y % 5 == 0: c = 'C'
                    b.dat(x, y, c)
        b.hcn(4, 15, 19, 16, 'W'); b.hcn(4, 15, 19, 15, 'w')
        for y in range(2, 11):
            for x in range(8, 16):
                if (x - 11.5) ** 2 + (y - 6) ** 2 <= 16: b.dat(x, y, 'c' if x > 11 else 'C')
        b.dat(13, 6, 'k'); b.dat(10, 6, 'k')
        b.vien_ngoai('k')
        if nghieng:
            c = b.copy(); c.a[:] = -1
            for y in range(36):
                s = round(nghieng * (30 - y) / 10) if y < 30 else 0
                for x in range(24):
                    if b.a[y, x] >= 0 and 0 <= x + s < 24: c.a[y, x + s] = b.a[y, x]
            b = c
        nom.dan(b, ox, 0)
    ve_nom(0, 0); ve_nom(24, 2); ve_nom(48, -2)
    nom.luu(os.path.join(out, 'nom.png'))
    # va chạm theo ô
    luoi = [''.join('#' if r >= DINH[c] else '.' for c in range(COT)) for r in range(HANG)]
    man = {'o_diem': O, 'o_logic': O * 3, 'cot': COT, 'hang': HANG, 'luoi': luoi,
           'xuat_phat_cot': 2, 'nom_cot': 9, 'den': [[int(x), int(y)] for (x, y) in den],
           'ghi_chu': "'#' = đặc. Mọi toạ độ khác theo điểm ảnh; game nhân 3 ra px logic."}
    json.dump(man, open(os.path.join(out, 'man.json'), 'w'), ensure_ascii=False, indent=1)
    # ảnh xem
    full = Image.new('RGBA', (W, VH))
    full.alpha_composite(Image.open(os.path.join(out, 'nen-xa-1.png')).crop((0, 0, W, VH)) if False else Image.open(os.path.join(out, 'nen-xa-1.png')).crop((0, 0, min(W, 420), VH)))
    print('ok', W, 'x', H)


if __name__ == '__main__':
    main()
