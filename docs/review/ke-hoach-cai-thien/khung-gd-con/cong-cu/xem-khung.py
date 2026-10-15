"""Ảnh soát TĨNH (không chạy game): python3 xem-khung.py -> ../xem-khung.png
Mỗi hàng một khung: bên trái bản CODE CŨ (vẽ lại gần đúng như js/ui_theme.js, stage.js, linhkhi.js... vẽ), bên phải bản ẢNH ở đúng cỡ game
rồi vài cỡ kéo giãn. Cắt 9 mảnh / 3 mảnh giống js/sprite_custom.js gdGhep9 (cạnh lặp nếu "lap_canh"); lòng đục rỗng thì đổ màu lòng như
js/ui_theme.js (khung nhỏ: bán trong suốt 0,84; ô con: #241611 + o.fill). Phóng 4 lần (1 điểm game = 4 điểm ảnh). Chữ: phông DejaVu."""
import os, io, json, base64
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
CUS = os.path.join(ROOT, 'game/art/custom')
Z = 4
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
NEN = (58, 84, 74, 255)


def tep(ma):
    t = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    t['im'] = Image.open(io.BytesIO(base64.b64decode(t['anh'].split(',')[1]))).convert('RGBA')
    return t


def ghep9(t, w, h):
    """như SC.veGd + gdGhep9: trả ảnh ở độ nét net (w*net x h*net)"""
    im, n = t['im'], t['net']; W, H = round(w * n), round(h * n)
    if 'vien' not in t: return im.resize((W, H), Image.NEAREST)
    v = [x * n for x in t['vien']]; tp, r, b, l = v
    def giu(a, c, mx, src):
        m = min(mx, src - 1)
        if a + c > m: k = m / (a + c); return int(a * k), int(c * k)
        return a, c
    l, r = giu(l, r, W, im.width); tp, b = giu(tp, b, H, im.height)
    sx = [0, l, im.width - r]; sw = [l, im.width - l - r, r]; dx = [0, l, W - r]; dw = [l, W - l - r, r]
    sy = [0, tp, im.height - b]; sh = [tp, im.height - tp - b, b]; dy = [0, tp, H - b]; dh = [tp, H - tp - b, b]
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lap = t.get('lap_canh')
    for j in range(3):
        for i in range(3):
            if not (sw[i] > 0 and sh[j] > 0 and dw[i] > 0 and dh[j] > 0): continue
            m = im.crop((sx[i], sy[j], sx[i] + sw[i], sy[j] + sh[j]))
            if not lap or (i != 1 and j != 1): o.alpha_composite(m.resize((dw[i], dh[j]), Image.NEAREST), (dx[i], dy[j])); continue
            tw = sw[1] if i == 1 else dw[i]; th = sh[1] if j == 1 else dh[j]
            m2 = m.resize((tw, th), Image.NEAREST)
            for yy in range(0, dh[j], th):
                for xx in range(0, dw[i], tw):
                    o.alpha_composite(m2.crop((0, 0, min(tw, dw[i] - xx), min(th, dh[j] - yy))), (dx[i] + xx, dy[j] + yy))
    return o


def deu(t, w, h):
    """khungVeDeu: ô nhỏ hơn tổng hai góc thì thu đều cả hình"""
    v = t.get('vien') or [0, 0, 0, 0]; k = min(1, h / (v[0] + v[2] + 2), w / (v[1] + v[3] + 2))
    if k >= 1: return ghep9(t, w, h)
    return ghep9(t, w / k, h / k).resize((round(w * t['net']), round(h * t['net'])), Image.LANCZOS)


class Ve:
    def __init__(s, W, H): s.im = Image.new('RGBA', (W, H), NEN); s.d = ImageDraw.Draw(s.im)
    def rect(s, x, y, w, h, fill=None, line=None):
        x0, y0 = round(x * Z), round(y * Z); x1, y1 = round((x + w) * Z) - 1, round((y + h) * Z) - 1
        if fill:
            o = Image.new('RGBA', s.im.size, (0, 0, 0, 0)); ImageDraw.Draw(o).rectangle([x0, y0, x1, y1], fill=fill); s.im.alpha_composite(o)
        if line: s.d.rectangle([x0, y0, x1, y1], outline=line, width=Z)
    def anh(s, a, x, y, w, h):
        s.im.alpha_composite(a.resize((round(w * Z), round(h * Z)), Image.NEAREST), (round(x * Z), round(y * Z)))
    def chu(s, t, x, y, col=(241, 230, 198), f=None):
        f = f or FS; bb = s.d.textbbox((0, 0), t, font=f)
        s.d.text((round(x * Z - (bb[2] - bb[0]) / 2), round(y * Z - (bb[3] - bb[1]) / 2 - bb[1])), t, font=f, fill=col)


def nhuom(a, col, kieu, k=0.7):
    x = np.array(a).astype(float); c = np.array(col[:3], float)
    if kieu == 'nhan': x[..., :3] = x[..., :3] * c / 255
    else: x[..., :3] = x[..., :3] * (1 - k) + c * k
    return Image.fromarray(x.astype(np.uint8))


HANG = []


def hang(ten, cao, fn): HANG.append((ten, cao, fn))


# 1) T.plate
def h1(v, y):
    v.rect(4, y, 60, 14, (26, 18, 10), None); v.rect(5, y + 1, 58, 12, None, (168, 117, 47)); v.rect(6, y + 2, 56, 10, (22, 15, 10, 214)); v.chu('Ải 1-2', 34, y + 7)
    t = tep('gd-khung-nho')
    for x, w, h in [(76, 60, 14), (144, 110, 12), (262, 64, 19), (334, 90, 30), (432, 46, 46)]:
        v.rect(x + 1, y + 1, w - 2, h - 2, (24, 49, 23, 214)); v.anh(deu(t, w, h), x, y, w, h)
    v.chu('Ải 1-2', 106, y + 7)


hang('T.plate -> gd-khung-nho (60×14 | ảnh 60×14, 110×12, 64×19 gốc, 90×30, 46×46)', 48, h1)


# 2) T.toast
def h2(v, y):
    w = 110
    for j in range(18):
        d = abs(j - 8.5); ins = max(0, int(d) - 2); v.rect(4 + ins, y + j, w - ins * 2, 1, (26, 18, 10)); v.rect(5 + ins, y + j, w - ins * 2 - 2, 1, (168, 117, 47))
    v.rect(16, y + 3, w - 24, 12, (31, 79, 74)); v.chu('+3 linh khí', 4 + w / 2, y + 9)
    t = tep('gd-dai-thong-bao')
    for x, ww in [(124, 110), (244, 60), (314, 164)]:
        v.anh(deu(t, ww, 18), x, y, ww, 18)
    v.chu('+3 linh khí', 179, y + 9)


hang('T.toast -> gd-dai-thong-bao (cao 18; rộng 110 | 110, 60, 164)', 22, h2)


# 3) T.inset
def h3(v, y):
    v.rect(4, y, 50, 24, (27, 58, 59), None); v.rect(4, y, 50, 24, None, (90, 61, 26))
    v.rect(60, y, 50, 24, (47, 106, 96)); v.rect(60, y, 50, 24, None, (246, 220, 146)); v.rect(61, y + 1, 48, 22, None, (217, 164, 65))
    t0, t1 = tep('gd-o-con'), tep('gd-o-con-chon')
    for x, w, h, sel in [(122, 50, 24, 0), (178, 50, 24, 1), (236, 100, 12, 0), (342, 60, 40, 1), (408, 70, 40, 0)]:
        v.rect(x + 1, y + 1, w - 2, h - 2, (36, 22, 17))
        m = 0.5 if sel else 0; v.anh(deu(t1 if sel else t0, w + 2 * m, h + 2 * m), x - m, y - m, w + 2 * m, h + 2 * m)
    v.rect(410, y + 2, 66, 1, (255, 210, 63)); v.rect(410, y + 37, 66, 1, (255, 210, 63)); v.rect(410, y + 3, 1, 34, (255, 210, 63)); v.rect(475, y + 3, 1, 34, (255, 210, 63))
    v.chu('Rìu', 147, y + 12); v.chu('Rìu', 29, y + 12)


hang('T.inset -> gd-o-con / -chon (code thường, chọn | ảnh 50×24 thường, chọn, 100×12, 60×40 chọn, 70×40 + o.col vàng)', 44, h3)


# 4) chip kháng / yếu
def h4(v, y):
    chips = [('Kháng Lửa', (122, 40, 26)), ('Yếu Băng', (20, 14, 8))]
    x = 4
    for s, c in chips: v.rect(x, y, 46, 10, c, (26, 18, 10)); v.rect(x + 1, y, 44, 1, (255, 240, 196, 64)); v.chu(s, x + 23, y + 5); x += 49
    t = tep('gd-the-nho'); x = 110
    for s, c in chips + [('Né đòn', (31, 79, 74))]:
        v.anh(nhuom(deu(t, 46, 10), c, 'nhan'), x, y, 46, 10); v.chu(s, x + 23, y + 5); x += 49
    v.anh(nhuom(deu(t, 90, 10), (122, 40, 26), 'nhan'), 270, y, 90, 10)


hang('chip trùm -> gd-the-nho nhuộm màu (code | ảnh 46×10 ×3, 90×10)', 14, h4)


# 5) vạch linh khí
def h5(v, y):
    bx, bw = 40, 120
    v.rect(bx - 0.5, y + 3.5, bw + 1, 5, (11, 10, 10)); v.rect(bx, y + 4, bw, 4, (19, 32, 30)); v.rect(bx, y + 4, 70, 4, (255, 122, 42))
    for k in (1, 2, 3): v.rect(bx + bw / 3 * k - 0.5, y + 2.5, 1, 7, (255, 210, 63) if k < 2 else (90, 106, 102))
    t, m = tep('gd-khung-vach-lk'), tep('gd-khung-vach-lk-moc'); bx = 200
    d = 3; v.anh(deu(t, bw + 2 * d, 7), bx - d, y + 2.5, bw + 2 * d, 7); v.rect(bx, y + 4, 70, 4, (255, 122, 42))
    for k in (1, 2, 3):
        a = ghep9(m, 2, 7)
        if k >= 2: a = nhuom(a, (60, 90, 84), 'phu', 0.6)
        v.anh(a, (bx + bw / 3 * k if k < 3 else bx + bw - 1) - 1, y + 2.5, 2, 7)
    v.anh(deu(t, 28, 7), 360, y + 2.5, 28, 7); v.rect(363, y + 4, 12, 4, (90, 202, 2))


hang('vạch linh khí -> gd-khung-vach-lk + -moc (code | ảnh lòng 120 có 3 vạch mốc, ảnh lòng 22 như ô HUD)', 14, h5)


# 6) thanh cuộn
def h6(v, y):
    v.rect(10, y, 3, 60, (0, 0, 0, 115)); v.rect(10, y + 14, 3, 18, (217, 164, 65))
    r, n = tep('gd-thanh-cuon'), tep('gd-thanh-cuon-num')
    for x, h, ty, th in [(30, 60, 14, 18), (50, 30, 8, 16), (70, 100, 50, 40)]:
        v.anh(ghep9(r, 4, h), x, y, 4, h); v.anh(ghep9(n, 3, th), x + 0.5, y + ty, 3, th)


hang('thanh cuộn -> gd-thanh-cuon + -num (code | ảnh cao 60, 30, 100)', 104, h6)


# 7) hộp cảnh báo
def h7(v, y):
    v.rect(4, y, 200, 36, (20, 10, 10, 240), (255, 154, 90)); v.chu('Thất bại sẽ tụt về Bậc Lam — dùng Bùa giữ bậc?', 104, y + 7)
    t = tep('gd-khung-canh-bao')
    v.anh(deu(t, 200, 36), 216, y, 200, 36); v.chu('Thất bại sẽ tụt về Bậc Lam — dùng Bùa giữ bậc?', 316, y + 7)
    for x in (220, 284): v.rect(x, y + 20, 60, 14, (138, 47, 34), (217, 164, 65))
    v.anh(deu(t, 50, 20), 424, y, 50, 20)


hang('ép đồ: hộp cảnh báo -> gd-khung-canh-bao (code 200×36 | ảnh 200×36 có nút, 50×20)', 40, h7)


# 8) thẻ Sắp có
def h8(v, y):
    v.rect(0, y - 2, 480, 16, (196, 170, 120)); v.rect(10, y, 32, 10, (74, 54, 38, 216)); v.chu('sắp có', 26, y + 5)
    t = tep('gd-the-sap-co'); v.anh(ghep9(t, 32, 10), 60, y, 32, 10); v.chu('sắp có', 76, y + 5)
    v.anh(ghep9(t, 48, 10), 110, y, 48, 10); v.chu('coming soon', 134, y + 5)


hang('bản đồ: thẻ "Sắp có" -> gd-the-sap-co (code | ảnh 32×10, 48×10)', 14, h8)


# 9) máu quái
def h9(v, y):
    for x, bw, el in [(10, 16, None), (40, 26, None)]:
        v.rect(x - 1, y + 1, bw + 2, 4, (14, 8, 8, 216)); v.rect(x, y + 2, bw * .6, 2, (232, 72, 58))
    v.rect(76, y + 1, 18, 4, (90, 202, 2)); v.rect(77, y + 2, 16, 2, (14, 8, 8)); v.rect(77, y + 2, 9, 2, (232, 72, 58))
    t = tep('gd-khung-mau-quai')
    for x, bw, el in [(130, 16, None), (160, 26, (255, 138, 58)), (200, 16, (90, 202, 2)), (230, 16, (50, 176, 233)), (260, 60, None)]:
        a = deu(t, bw + 4, 4)
        if el and el != (255, 138, 58): a = nhuom(a, el, 'phu', 0.7)
        v.anh(a, x - 2, y + 1, bw + 4, 4); v.rect(x, y + 2, bw * .6, 2, (255, 138, 58) if el == (255, 138, 58) else (232, 72, 58))


hang('máu quái -> gd-khung-mau-quai (code thường, tinh anh, dấu độc | ảnh thường, tinh anh, dấu độc, dấu băng, 60)', 8, h9)

TOP = 30
H = sum(TOP + c + 10 for _, c, _ in HANG) + 10
v = Ve(484 * Z, H * Z)
y = 4
for ten, cao, fn in HANG:
    v.d.text((8, y * Z), ten, font=F, fill=(255, 240, 196)); y += 10
    fn(v, y); y += cao + 14
out = os.path.join(HERE, '..', 'xem-khung.png')
v.im.convert('RGB').save(out, optimize=True); print(out, v.im.size)
