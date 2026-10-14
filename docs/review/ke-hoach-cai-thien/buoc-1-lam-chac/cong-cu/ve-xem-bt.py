"""Ảnh soát tĩnh xem-bao-truoc.png: 4 hình × 8 khung (ảnh mới, căn tâm từng khung) + ví dụ chồng lên vùng thật (đường xanh = mép
vùng sát thương thật, tính như js/bao_truoc.js veAnh: tròn r, dẹt G.ZK 0,6; vành r0..r1; quạt r, góc mở 88°; dải dài × rộng)."""
import os, math
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
RA = os.path.join(H, 'ra'); OUT = os.path.join(H, '..', 'xem-bao-truoc.png')
HA = {'gd-bt-tron': ([184, 184], 64), 'gd-bt-vanh': ([184, 184], 64), 'gd-bt-quat': ([81, 138], 64), 'gd-bt-dai': ([170, 28], None)}
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15); FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
except Exception: F = FS = ImageFont.load_default()
K = 1.0
W, Hh = 8 * 200 + 160, 4 * 210 + 420
img = Image.new('RGBA', (W, Hh), (24, 28, 26, 255)); d = ImageDraw.Draw(img)
d.text((10, 8), 'Báo trước 8 khung (bước 1, mục 7): khung 1–7 chia đều thời gian báo trước, khung 8 = đúng lúc đòn nổ. Chữ thập xanh = tâm / đỉnh neo.', fill=(240, 230, 200), font=F)
for r, (ma, (o, R)) in enumerate(HA.items()):
    sh = Image.open(os.path.join(RA, ma + '.png')).convert('RGBA')
    ow, oh = o; y0 = 40 + r * 210
    d.text((10, y0 + 80), ma.replace('gd-bt-', ''), fill=(255, 210, 120), font=F)
    for i in range(8):
        fr = sh.crop((i * ow, 0, (i + 1) * ow, oh))
        k = 1.0 if ma != 'gd-bt-dai' else 1.0
        x0 = 150 + i * 200 + (200 - ow) // 2; yy = y0 + (180 - oh) // 2
        img.alpha_composite(fr, (x0, yy))
        if ma == 'gd-bt-quat': ax, ay = x0 + 4.84, yy + 69
        elif ma == 'gd-bt-dai': ax, ay = x0 + ow / 2, yy + oh / 2
        else: ax, ay = x0 + ow / 2, yy + oh / 2
        d.line((ax - 6, ay, ax + 6, ay), fill=(80, 255, 255)); d.line((ax, ay - 6, ax, ay + 6), fill=(80, 255, 255))
        if R and ma != 'gd-bt-quat': d.ellipse((ax - R, ay - R, ax + R, ay + R), outline=(80, 255, 255))
        if ma == 'gd-bt-quat': d.arc((ax - R, ay - R, ax + R, ay + R), -44, 44, fill=(80, 255, 255))
        d.text((150 + i * 200 + 70, y0 + 182), ('khung %d' % (i + 1)) + (' · nổ' if i == 7 else ' · %d/7' % i), fill=(200, 200, 190), font=FS)
# ví dụ chồng lên vùng thật (cỡ thật ×3, như trên sân: tròn dẹt 0,6)
y0 = 40 + 4 * 210 + 10
d.text((10, y0), 'Ví dụ chồng lên vùng thật (×3): tròn r 40 dẹt 0,6 (khung 5) · vành r0 24, r1 40 (khung 4) · quạt r 60 mở 88° hướng 30° (khung 6) · dải dài 120 rộng 24 xoay −20° (khung 3)', fill=(240, 230, 200), font=FS)
S = 3
def tam_khung(ma, i): o = HA[ma][0]; return Image.open(os.path.join(RA, ma + '.png')).convert('RGBA').crop((i * o[0], 0, (i + 1) * o[0], o[1]))
cx, cy = 260, y0 + 200
fr = tam_khung('gd-bt-tron', 4); r = 40 * S; s = r / 64; w, hh = int(184 * s), int(184 * s * 0.6)
img.alpha_composite(fr.resize((w, hh), Image.BILINEAR), (int(cx - w / 2), int(cy - hh / 2)))
d.ellipse((cx - r, cy - r * 0.6, cx + r, cy + r * 0.6), outline=(80, 255, 255), width=2)
cx = 640
fr = tam_khung('gd-bt-vanh', 3); r1, r0 = 40 * S, 24 * S; s = r1 / 64; w, hh = int(184 * s), int(184 * s * 0.6)
img.alpha_composite(fr.resize((w, hh), Image.BILINEAR), (int(cx - w / 2), int(cy - hh / 2)))
for rr in (r0, r1): d.ellipse((cx - rr, cy - rr * 0.6, cx + rr, cy + rr * 0.6), outline=(80, 255, 255), width=2)
d.text((cx - 150, cy + 80), '(game dời bán kính ảnh cho vừa r0..r1: tamVanh)', fill=(170, 170, 160), font=FS)
cx, cyq = 960, cy
fr = tam_khung('gd-bt-quat', 5); r = 60 * S; s = r / 64
big = fr.resize((int(81 * s), int(138 * s)), Image.BILINEAR)
can = Image.new('RGBA', (700, 700), (0, 0, 0, 0)); can.alpha_composite(big, (int(350 - 4.84 * s), int(350 - 69 * s)))
can = can.rotate(-30, center=(350, 350), resample=Image.BILINEAR)
img.alpha_composite(can, (cx - 350, cyq - 350))
a0, a1 = math.radians(30 - 44), math.radians(30 + 44)
d.line((cx, cyq, cx + r * math.cos(a0), cyq + r * math.sin(a0)), fill=(80, 255, 255), width=2)
d.line((cx, cyq, cx + r * math.cos(a1), cyq + r * math.sin(a1)), fill=(80, 255, 255), width=2)
d.arc((cx - r, cyq - r, cx + r, cyq + r), 30 - 44, 30 + 44, fill=(80, 255, 255), width=2)
cx = 1450
fr = tam_khung('gd-bt-dai', 2); L, wd = 120 * S, 24 * S; sx, sy = L / 160, wd / 2 / 7.29
big = fr.resize((int(170 * sx), int(28 * sy)), Image.BILINEAR)
can = Image.new('RGBA', (900, 900), (0, 0, 0, 0)); can.alpha_composite(big, (int(450 - 4.8 * sx), int(450 - 14 * sy)))
can = can.rotate(20, center=(450, 450), resample=Image.BILINEAR)
x0, yb = cx - 180, cy + 60
img.alpha_composite(can, (x0 - 450, yb - 450))
a = math.radians(-20); ux, uy = math.cos(a), math.sin(a); nx, ny = -uy, ux
pts = [(x0 + nx * wd / 2, yb + ny * wd / 2), (x0 + ux * L + nx * wd / 2, yb + uy * L + ny * wd / 2), (x0 + ux * L - nx * wd / 2, yb + uy * L - ny * wd / 2), (x0 - nx * wd / 2, yb - ny * wd / 2)]
d.polygon(pts, outline=(80, 255, 255))
img = img.crop((0, 0, W, y0 + 400)).convert('RGB'); img.save(OUT, optimize=True); print(OUT, img.size)
