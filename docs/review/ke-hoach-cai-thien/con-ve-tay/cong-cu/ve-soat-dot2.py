"""Ảnh soát tĩnh đợt 2 (không chạy game): ../xem-dot2.png.
Phần 1: 4 ảnh mới đọc đúng từ game/art/custom/hu-*.sprite.json, mọi khung ở cỡ game ×4 (net 2 → chia 2), dấu + đỏ = điểm neo (goc).
Phần 2: TRƯỚC / SAU ở cỡ game ×4 trên nền sàn tối: "trước" vẽ lại đúng hình code cũ theo js/fx.js (vệt giọt 3×1, ô vụn có bóng,
elip scorch + đốm, mảnh băng xoay, bọt 2×2); "sau" là khung ảnh mới đặt ở cùng điểm (hoặc trống: đã tắt).
    python3 ve-soat-dot2.py"""
import os, json, io, base64
from PIL import Image, ImageDraw, ImageFont

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'xem-dot2.png'))
K = 4
NEN = (58, 54, 66, 255)
SAN = (44, 40, 48, 255)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    FONT = ImageFont.load_default()


def doc(ma):
    t = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    n, fw, fh = t.get('net', 1), t['khung_rong'], t['khung_cao']
    return t, [im.crop((i * fw * n, 0, (i + 1) * fw * n, fh * n)) for i in range(t['so'])]


MA = ['hu-giot-doc-san', 'hu-manh-da', 'hu-vet-chay', 'hu-ray-bang']
DS = {m: doc(m) for m in MA}


# ---- hình code cũ (điểm game) ----
def p(d, x, y, w, h, col):
    d.rectangle([x * K, y * K, (x + w) * K - 1, (y + h) * K - 1], fill=col)


def truoc(ma, W, H):
    o = Image.new('RGBA', (W * K, H * K), SAN); d = ImageDraw.Draw(o); cx, cy = W // 2, H - 6
    if ma == 'hu-giot-doc-san':  # loại 5 độc: giọt 2×2 bay rồi vệt 3×1 trên sàn
        for (x, y) in [(-5, 0), (-1, 1), (3, -1), (6, 1)]: p(d, cx + x - 1, cy + y, 3, 1, '#8fe04a')
        for (x, y) in [(-3, -8), (2, -12)]: p(d, cx + x, cy + y - 1, 2, 2, '#c2f58a')
    elif ma == 'hu-manh-da':  # loại 8: ô s×s + bóng 1 hàng
        for (x, y, s) in [(-7, 0, 3), (-2, 2, 2), (4, 1, 3), (8, -1, 2), (0, -14, 2), (-5, -9, 3)]:
            p(d, cx + x - 1, cy + y - 1, s, s, '#8a7a66'); p(d, cx + x - 1, cy + y - 2 + s, s, 1, (0, 0, 0, 90))
    elif ma == 'hu-vet-chay':  # scorch: 2 elip tối + 4 đốm 1×1
        dd = ImageDraw.Draw(o, 'RGBA'); r = 16
        dd.ellipse([(cx - r) * K, (cy - r * .6) * K, (cx + r) * K, (cy + r * .6) * K], fill=(26, 16, 12, 107))
        dd.ellipse([(cx - r * .55) * K, (cy - r * .33) * K, (cx + r * .55) * K, (cy + r * .33) * K], fill=(16, 10, 8, 90))
        for (x, y, c) in [(-6, -2, '#ff7a2a'), (4, 1, '#ffd23f'), (9, -3, '#ff7a2a'), (-2, 3, '#ffd23f')]: p(d, cx + x, cy + y, 1, 1, c)
    elif ma == 'hu-ray-bang':  # loại 4 mảnh xoay + loại 0 hạt rơi, màu băng
        for (x, y) in [(-6, -6), (3, -10), (6, -2)]: p(d, cx + x - 2, cy + y, 5, 1, '#bfeaff')
        for (x, y) in [(-2, -3), (1, 0), (-8, 1)]: p(d, cx + x, cy + y - 2, 1, 5, '#7fd4ff')
        for (x, y) in [(-4, 2), (5, 2)]: p(d, cx + x, cy + y, 1, 1, '#e9f9ff')
    return o, (cx, cy)


def sau(ma, W, H, i):
    t, ks = DS[ma]
    o = Image.new('RGBA', (W * K, H * K), SAN); cx, cy = W // 2, H - 6
    k = ks[i].resize((t['khung_rong'] * K, t['khung_cao'] * K), Image.NEAREST)
    o.alpha_composite(k, (int((cx - t['goc'][0]) * K), int((cy - t['goc'][1]) * K)))
    return o


TAT = [  # (tên, hình code cũ đã tắt) — vẽ lại tối giản để thấy loại hình
    ('#4 bọt độc 2×2 (loại 11)', lambda d, cx, cy: [p(d, cx + x, cy + y, 2, 2, '#c2f58a') for (x, y) in [(-4, -6), (2, -10), (5, -3)]]),
    ('#6 vệt chém lưỡi liềm (DON chem)', lambda d, cx, cy: [p(d, cx - 6 + j, cy - 14 + abs(j - 6) // 2, 2, 2, '#dff4ff') for j in range(13)]),
    ('#7 vệt lao + bụi (DON lao)', lambda d, cx, cy: [p(d, cx - 12 + j, cy - 6 + (j % 3) * 3, 6, 1, '#cbc3c0') for j in range(0, 10, 3)]),
    ('#8 vòng gai toả (DON gai)', lambda d, cx, cy: [p(d, cx + int(9 * __import__('math').cos(a / 8 * 6.283)), cy - 8 + int(5 * __import__('math').sin(a / 8 * 6.283)), 1, 1, '#ffffff') for a in range(8)]),
    ('#9 tia ở miệng lúc lấy đà', lambda d, cx, cy: [p(d, cx + x, cy - 12 + y, 1, 1, '#dff4ff') for (x, y) in [(-2, 0), (2, 0), (0, -2), (0, 2), (0, 0)]]),
    ('#12 khói độc quanh thân', lambda d, cx, cy: [p(d, cx + x, cy + y, 3, 3, '#9a48d4') for (x, y) in [(-7, -5), (-1, -9), (5, -4)]]),
    ('#13 ô đỏ quầng + đốm lửa giận', lambda d, cx, cy: [p(d, cx + x, cy + y, 2, 2, '#ff4a20') for (x, y) in [(-8, 1), (-3, 2), (3, 2), (8, 1), (0, -10), (5, -15)]]),
    ('Chớp "sq" / hạt vuông khi ảnh chưa tải', lambda d, cx, cy: [p(d, cx - 2, cy - 8, 5, 5, '#8fe04a')] + [p(d, cx + x, cy - 6 + y, 2, 2, '#8fe04a') for (x, y) in [(-5, -5), (4, -5), (-5, 4), (4, 4)]]),
]

W0, H0 = 40, 34
cao = 40 + sum(DS[m][1][0].height // 2 * K + 34 for m in MA) + 30 + len(MA) * (H0 * K + 34) + 30 + (H0 * K + 40) * ((len(TAT) + 3) // 4) + 20
rong = max(1300, max(len(DS[m][1]) * (DS[m][0]['khung_rong'] * K + 12) for m in MA) + 40)
o = Image.new('RGBA', (rong, cao), NEN); d = ImageDraw.Draw(o)
y = 10
d.text((10, y), 'Con vẽ tay đợt 2 — 4 ảnh mới (cỡ game ×4, + đỏ = điểm neo, khung xám = ô khung)', fill=(255, 240, 200), font=FONT); y += 26
for m in MA:
    t, ks = DS[m]
    d.text((10, y), '%s · %d khung · ô %d×%d điểm game · %.2f s · %s' % (m, t['so'], t['khung_rong'], t['khung_cao'], t['giay'], t['ten']), fill=(240, 230, 200), font=FONT); y += 20
    x = 10
    for k in ks:
        kk = k.resize((t['khung_rong'] * K, t['khung_cao'] * K), Image.NEAREST)
        d.rectangle([x - 1, y - 1, x + kk.width, y + kk.height], outline=(90, 86, 100)); o.alpha_composite(kk, (x, y))
        gx, gy = x + t['goc'][0] * K, y + t['goc'][1] * K
        d.line([gx - 5, gy, gx + 5, gy], fill=(255, 60, 60)); d.line([gx, gy - 5, gx, gy + 5], fill=(255, 60, 60))
        x += kk.width + 12
    y += ks[0].height // 2 * K + 14
y += 10
d.text((10, y), 'TRƯỚC (vẽ code, js/fx.js) → SAU (ảnh, khung 1 / giữa / cuối, cùng điểm chạm sàn)', fill=(255, 240, 200), font=FONT); y += 24
for m in MA:
    a, _ = truoc(m, W0, H0); x = 10
    d.text((x, y), m, fill=(220, 220, 220), font=FONT)
    o.alpha_composite(a, (x, y + 18)); x += a.width + 30
    d.text((x - 24, y + 18 + a.height // 2), '→', fill=(255, 255, 255), font=FONT)
    n = DS[m][0]['so']
    for i in sorted({0, n // 2, n - 1}):
        b = sau(m, W0, H0, i); o.alpha_composite(b, (x, y + 18)); x += b.width + 10
    y += H0 * K + 34
y += 10
d.text((10, y), 'ĐÃ TẮT trong trận (chưa có ảnh, không phải tín hiệu né đòn) — hình code cũ minh hoạ → sau: trống', fill=(255, 240, 200), font=FONT); y += 24
for i, (ten, f) in enumerate(TAT):
    x = 10 + (i % 4) * 320
    if i and i % 4 == 0: y += H0 * K + 40
    a = Image.new('RGBA', (W0 * K, H0 * K), SAN); f(ImageDraw.Draw(a), W0 // 2, H0 - 6)
    o.alpha_composite(a, (x, y)); d.text((x, y + H0 * K + 2), ten, fill=(220, 220, 220), font=FONT)
o = o.crop((0, 0, rong, y + H0 * K + 30))
o.convert('RGB').save(RA, optimize=True)
print(RA, o.size)
