"""Ảnh soát TĨNH (không chạy game) cho đợt trùm nhỏ 14/10: python3 xem-hieu-ung-giao-dien.py
- ../xem-hieu-ung-them.png: 7 hiệu ứng thêm, mọi khung ở cỡ dùng trong game (2 điểm ảnh = 1 điểm game), kèm vùng sát thương thật (vòng / quạt đỏ).
- ../xem-giao-dien.png: dựng thử bảng + nút (4 tông, cỡ to / nhỏ / đang bấm / mờ) + hộp thoại + thanh trên bằng cách cắt 9 mảnh giống
  js/sprite_custom.js gdGhep9 (cạnh lặp nếu "lap_canh"), chữ vẽ bằng phông DejaVu (game dùng phông khác) để xem độ tương phản."""
import os, json, io, base64, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
CUS = os.path.join(ROOT, 'game/art/custom')
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
def tep(ma): return json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
def anh(s): return Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA')
Z = 2  # 2 điểm ảnh = 1 điểm game

# ---------------- hiệu ứng ----------------
def khung(t, f):
    im = anh(t['tam']); n = t.get('net', 1); fw, fh = t['khung_rong'] * n, t['khung_cao'] * n; cot = max(1, im.width // fw)
    return im.crop(((f % cot) * fw, (f // cot) * fh, (f % cot + 1) * fw, (f // cot + 1) * fh)), n
def dat(o, t, f, cx, cy, co=1, goc=0, lat=False, mau=None, mo=1):
    k, n = khung(t, f); s = co * Z / n
    k = k.resize((max(1, round(k.width * s)), max(1, round(k.height * s))), Image.NEAREST)
    ax, ay = t['goc'][0] * co * Z, t['goc'][1] * co * Z
    if lat: k = k.transpose(Image.FLIP_LEFT_RIGHT); ax = k.width - ax
    if mau:
        a = np.array(k).astype(float); M = [int(mau[i:i + 2], 16) for i in (1, 3, 5)]
        for i in range(3): a[..., i] = np.minimum(255, a[..., i] * M[i] / 255 + a[..., i] * .25)
        k = Image.fromarray(a.astype(np.uint8))
    if mo < 1: a = np.array(k); a[..., 3] = (a[..., 3] * mo).astype(np.uint8); k = Image.fromarray(a)
    if goc:
        big = Image.new('RGBA', (k.width * 3, k.height * 3)); big.alpha_composite(k, (k.width + 0, k.height + 0))
        px, py = k.width + ax, k.height + ay
        k = big.rotate(-math.degrees(goc), center=(px, py), resample=Image.NEAREST); ax, ay = px, py
    o.alpha_composite(k, (int(round(cx - ax)), int(round(cy - ay))))
DONG = [  # mã, co, vùng (kiểu, cỡ game), ghi chú, tham số thêm
    ('hu-dap-san', 1, ('vong', 80), 'Cua Đá chiêu 1: vòng đỏ r 80 (js/boss.js), co = 80/80. Khung 3 = lúc vùng nổ (u 0,5)', {}),
    ('hu-nam-moc', 1, ('vong', 14), 'Nấm Chúa chiêu 1: mỗi vùng r 14, ảnh đặt đúng 7 vùng; khung 3 lúc nổ', {}),
    ('hu-phun-lua-quat', 112 / 94, ('quat', 112), 'Hổ Lửa chiêu 2: quạt r 112, mở 1,5 rad; ảnh xoay theo hướng (ở đây: phải, và trái lật ngang)', {}),
    ('hu-hat-linh-khi', 1, None, 'Hạt linh khí: ảnh trắng, game nhuộm màu hệ (lửa / độc / băng), co 1,5 với trùm', {}),
    ('hu-nut-san', 1, ('vong', 30), 'Vết nứt sàn: chỉ khung 1, cỡ theo bán kính (r 30 ở đây), mờ dần 25% cuối', {}),
    ('hu-quai-hien', 1, None, 'Quái xuất hiện: cỡ theo bề ngang thân (thân rộng 34 ở đây)', {}),
    ('hu-quai-dap', 1, ('vong', 28), 'Quái thường đập đất (Tượng Đá tam 28): co = tam / 28', {}),
]
NHAN = 330; hang = []
for ma, co, vung, ghi, _ in DONG:
    t = tep(ma); fw, fh = t['khung_rong'] * co * Z, t['khung_cao'] * co * Z
    hang.append((ma, t, co, vung, ghi, int(fw) + 16, int(fh) + 20))
W = NHAN + max(max(len(range(tt['so'])), 3) * fw for ma, tt, co, v, g, fw, fh in hang) + 300
H = sum(fh for *_, fh in hang) + 70
o = Image.new('RGBA', (int(W), int(H)), (46, 58, 72, 255)); d = ImageDraw.Draw(o)
d.text((10, 12), '7 hiệu ứng thêm (14/10) ở cỡ dùng trong game: 2 điểm ảnh = 1 điểm game. Đỏ: vùng sát thương thật. Chấm vàng: điểm neo.', font=F, fill=(240, 240, 240))
y = 44
for ma, t, co, vung, ghi, fw, fh in hang:
    d.rectangle([0, y, W, y + fh - 4], fill=(56, 70, 88, 255))
    d.text((8, y + 6), ma, font=FB, fill=(255, 255, 255))
    for j, w in enumerate([ghi[i:i + 40] for i in range(0, len(ghi), 40)]): d.text((8, y + 28 + j * 17), w, font=F, fill=(220, 220, 200))
    for f in range(max(t['so'], 3 if ma == 'hu-nut-san' else 0)):
        cx = NHAN + f * fw + (8 if ma == 'hu-phun-lua-quat' else fw / 2); cy = y + t['goc'][1] * co * Z + 10
        if vung:
            k, r = vung; R = r * Z
            if k == 'vong': d.ellipse([cx - R, cy - R * .6, cx + R, cy + R * .6], outline=(255, 60, 60), width=2)
            else: d.pieslice([cx - R, cy - R * .6, cx + R, cy + R * .6], -43, 43, outline=(255, 60, 60), width=2)
        if ma == 'hu-hat-linh-khi':
            for i, m in enumerate(['#ff7a2a', '#6fcf3a', '#7fd4ff']): dat(o, t, f, cx, cy + i * 30 - 10, 1.5 if i == 0 else 1, mau=m)
        elif ma == 'hu-nut-san': dat(o, t, 0, cx, cy, 1, mo=[1, .66, .33][f])
        else: dat(o, t, f, cx, cy, co)
        d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 220, 0))
    if ma == 'hu-phun-lua-quat':  # thêm: quay trái (lật) và chéo xuống
        cx = NHAN + t['so'] * fw + 240; cy = y + t['goc'][1] * co * Z + 10
        dat(o, t, 3, cx, cy, co, lat=True); d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 220, 0)); d.text((cx - 230, y + 4), 'quay trái (lật)', font=F, fill=(255, 255, 255))
    y += fh
o.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(HERE, '..', 'xem-hieu-ung-them.png'), optimize=True)
print('xem-hieu-ung-them.png', o.size)

# ---------------- giao diện: cắt 9 mảnh như js/sprite_custom.js gdGhep9 ----------------
def gd(ma):
    t = tep(ma); return t, anh(t['anh'])
def ghep9(t, im, w, h):
    N = t.get('net', 1); Wd, Hd = round(w * N), round(h * N); out = Image.new('RGBA', (Wd, Hd))
    v = t.get('vien')
    if not v: return im.resize((Wd, Hd), Image.NEAREST)
    T, R_, B, L = [x * N for x in v]; pw, ph = im.size
    def giu(a, b, mx, src):
        m = min(mx, src - 1)
        if a + b > m: k = m / (a + b); return int(a * k), int(b * k)
        return a, b
    L, R_ = giu(L, R_, Wd, pw); T, B = giu(T, B, Hd, ph)
    sx = [0, L, pw - R_]; sw = [L, pw - L - R_, R_]; dx = [0, L, Wd - R_]; dw = [L, Wd - L - R_, R_]
    sy = [0, T, ph - B]; sh = [T, ph - T - B, B]; dy = [0, T, Hd - B]; dh = [T, Hd - T - B, B]
    lap = t.get('lap_canh')
    for j in range(3):
        for i in range(3):
            if min(sw[i], sh[j], dw[i], dh[j]) <= 0: continue
            src = im.crop((sx[i], sy[j], sx[i] + sw[i], sy[j] + sh[j]))
            if not lap or (i != 1 and j != 1): out.alpha_composite(src.resize((dw[i], dh[j]), Image.NEAREST), (dx[i], dy[j])); continue
            tw = sw[1] if i == 1 else dw[i]; th = sh[1] if j == 1 else dh[j]
            src2 = src if (i == 1 or tw == sw[i]) and (j == 1 or th == sh[j]) else src.resize((tw if i != 1 else sw[i], th if j != 1 else sh[j]), Image.NEAREST)
            for yy in range(0, dh[j], th):
                for xx in range(0, dw[i], tw):
                    ww, hh = min(tw, dw[i] - xx), min(th, dh[j] - yy)
                    out.alpha_composite(src2.crop((0, 0, ww, hh)), (dx[i] + xx, dy[j] + yy))
    return out
def ve9(o, ma, x, y, w, h, bien=None):
    t, im = gd(ma); v = t.get('vien') or [0, 0, 0, 0]
    k = min(1, h / (v[0] + v[2] + 2), w / (v[1] + v[3] + 2))
    a = ghep9(t, im, w / k, h / k)
    if bien == 'toi':
        q = np.array(a).astype(float); l = (q[..., 0] * .299 + q[..., 1] * .587 + q[..., 2] * .114) / 255
        q[..., 0] = 28 + 48 * l; q[..., 1] = 44 + 66 * l; q[..., 2] = 42 + 60 * l; a = Image.fromarray(q.astype(np.uint8))
    if bien == 'sang':
        q = np.array(a).astype(float); q[..., 0] += (255 - q[..., 0]) * .28; q[..., 1] += (240 - q[..., 1]) * .28; q[..., 2] += (196 - q[..., 2]) * .28; a = Image.fromarray(q.astype(np.uint8))
    S = 3  # 3 điểm ảnh = 1 điểm game (ảnh net 2 phóng 1,5)
    a = a.resize((round(w * S), round(h * S)), Image.NEAREST if k >= 1 else Image.LANCZOS)
    o.alpha_composite(a, (round(x * S), round(y * S)))
S = 3
o = Image.new('RGBA', (480 * S, 300 * S), (34, 70, 60, 255)); d = ImageDraw.Draw(o)
def chu(s, x, y, size, mau, dam=True, giua=False, bong=True):
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if dam else ''), int(size * S))
    X, Y = x * S, y * S - size * S * .8
    if giua: X -= d.textlength(s, font=f) / 2
    if bong: d.text((X + S * .6, Y + S * .6), s, font=f, fill=(20, 10, 6))
    d.text((X, Y), s, font=f, fill=mau)
# thanh trên (480 + 20, cao 16)
ve9(o, 'gd-thanh-tren', -10, 0, 500, 16)
items = [('Vàng', '1.250', '#ffd23f'), ('Quặng', '36', '#c9ccd2'), ('', '12', '#9bd14a'), ('', '7', '#7fd4ff'), ('', '9', '#ff9a5a'), ('', '3', '#c8e8a0'), ('', '5', '#a8d8ff'), ('', '2', '#ffc0a0')]
x = 6; f75 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(7.5 * S)); vach = []
for i, (_, s, m) in enumerate(items):
    d.rectangle([x * S, 3 * S, (x + 7) * S, 10 * S], fill=m); chu(s, x + 9.5, 10.5, 7.5, m)
    e = x + 9.5 + d.textlength(s, font=f75) / S
    if i in (1, 4): vach.append(e + 4)
    x = e + 8
phai = 'Zed · cấp 12 · sức mạnh 340'; vach.append(474 - d.textlength(phai, font=f75) / S - 6)
for px in vach: ve9(o, 'gd-thanh-tren-vach', px - 3.5, 0, 7, 16)
chu(phai, 474 - d.textlength(phai, font=f75) / S, 10.5, 7.5, '#f6dc92')
# bảng
ve9(o, 'gd-khung-bang', 20 - 3, 30 - 3, 260 + 6, 170 + 6)
d.rectangle([(20 + 12) * S, (30 + 19) * S, (20 + 260 - 12) * S, (30 + 19) * S + 2], fill='#a8752f')
chu('Lò rèn', 29, 45.5, 11, '#f6dc92')
chu('Kiếm Đồng · bậc 3', 30, 66, 8.5, '#f6dc92'); chu('Sát thương 42 → 48', 30, 78, 8, '#fff0c4', False); chu('Cần: 120 vàng, 3 quặng', 30, 90, 8, '#a9c2b4', False)
d.rectangle([30 * S, 98 * S, 120 * S, 140 * S], fill='#1b3a3b', outline='#5a3d1a', width=S)
# nút trong bảng: 4 tông, cao 24 / 18 / 14
ton = [('gd-nut-thuong', 'Xem', None), ('gd-nut-chinh', 'Mài', None), ('gd-nut-nguy', 'Bán', None), ('gd-nut-chon', 'Đang chọn', '#3a1a08')]
for i, (ma, nh, mau) in enumerate(ton):
    ve9(o, ma, 130 + (i % 2) * 72, 100 + (i // 2) * 30, 66, 24)
    chu(nh, 130 + (i % 2) * 72 + 33, 100 + (i // 2) * 30 + 12 + 3.6, 10, mau or '#fff0c4', giua=True, bong=not mau)
for i, (ma, nh, mau) in enumerate(ton):
    ve9(o, ma, 30 + i * 46, 150, 42, 18); chu(nh[:4], 30 + i * 46 + 21, 150 + 9 + 3, 8, mau or '#fff0c4', giua=True, bong=not mau)
    ve9(o, ma, 30 + i * 46, 172, 30, 14); chu('›', 30 + i * 46 + 15, 172 + 7 + 3, 8, mau or '#fff0c4', giua=True, bong=not mau)
ve9(o, 'gd-nut-thuong', 222, 150, 50, 18, 'sang'); chu('Bấm', 247, 162, 8, '#fff0c4', giua=True)
ve9(o, 'gd-nut-thuong', 222, 172, 50, 18, 'toi'); chu('Mờ', 247, 184, 8, '#8fa49e', giua=True)
# bảng nhỏ
ve9(o, 'gd-khung-bang', 300 - 3, 30 - 3, 160 + 6, 90 + 6); chu('Bảng nhỏ', 309, 45.5, 11, '#f6dc92')
chu('Chữ sáng trên lòng nâu', 310, 70, 8, '#fff0c4', False); chu('Chữ phụ màu xám xanh', 310, 82, 8, '#a9c2b4', False)
# hộp thoại (1 dòng và 3 dòng)
def thoai(x, y, w, ten, dong):
    h = max(24, len(dong) * 11 + 15)
    ve9(o, 'gd-khung-thoai', x - 6, y - 2, w + 12, h + 4)  # trục cuộn thò ra 6 điểm mỗi bên (js/ui_theme.js)
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(7.5 * S)); nw = d.textlength(ten, font=f) / S + 12
    d.rectangle([(x + 6) * S, (y - 7) * S, (x + 6 + nw) * S, (y + 5) * S], fill='#a8752f', outline='#1a120a', width=S)
    d.rectangle([(x + 8) * S, (y - 5) * S, (x + 4 + nw) * S, (y + 3) * S], fill='#1f4f4a')
    chu(ten, x + 6 + nw / 2, y + 1.6, 7.5, '#f6dc92', giua=True)
    for i, l in enumerate(dong): chu(l, x + 7, y + 8 + 8 + i * 11, 8, '#2a1a14', bong=False)
    return h
thoai(306, 140, 160, 'Ông Từ', ['Chào cháu! Hôm nay rèn gì nào?'])
thoai(16, 220, 448, 'Chú Lái Đò', ['Sông hôm nay động lắm, Hổ Lửa đang canh lâu đài cổ.', 'Cháu nhớ mang theo bùa băng nhé — nó sợ nước lạnh.', 'Đi cẩn thận!'])
d.text((6, 286 * S), 'Dựng thử bằng script (không chạy game): cắt 9 mảnh như js/sprite_custom.js, 3 điểm ảnh = 1 điểm game. Phông chữ thật của game khác.', font=F, fill=(240, 240, 240))
o.convert('RGB').save(os.path.join(HERE, '..', 'xem-giao-dien.png'), optimize=True)
print('xem-giao-dien.png', o.size)
