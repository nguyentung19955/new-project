"""Ảnh mẫu giống thư mục thật của người dùng (07/10): python3 tao-anh-mau-2.py <thư mục>
dáng boss tách ảnh nền hồng sen Pippit (daibang_pose01..04), tấm icon tên mã băm (lưới 2×2, một hàng nền tím,
có chữ chú thích dưới icon), kết cấu đường, nút một vật, tháp nhiều vật _v2/_v3, ảnh đen bỏ qua."""
import os, sys, random
from PIL import Image, ImageDraw

d = sys.argv[1]; os.makedirs(d, exist_ok=True)
PINK, VIOLET, OUT = (214, 52, 120), (160, 40, 200), (42, 22, 8)
H = '~tplv-tnf8g33v4j-ai-watermark'


def pippit(g, W):
    g.text((14, 10), 'Pippit', fill=(240, 170, 200))
    g.rounded_rectangle((W - 50, W - 34, W - 12, W - 14), 6, outline=(240, 170, 205), width=2)


# boss: mỗi ảnh một dáng, 1024×1024, chân cùng đường đáy; dáng 4 có quầng lửa
for i in range(4):
    im = Image.new('RGB', (1024, 1024), PINK); g = ImageDraw.Draw(im)
    lift = i * 18
    g.ellipse((330, 420 - lift, 700, 820), fill=(170, 110, 40), outline=OUT, width=10)
    g.ellipse((560, 300 - lift, 760, 500 - lift), fill=(200, 150, 60), outline=OUT, width=10)
    g.polygon([(330, 500 - lift), (90 + i * 30, 300 + i * 40), (360, 640)], fill=(150, 90, 30), outline=OUT)
    g.rectangle((440, 820, 480, 900), fill=(240, 180, 60), outline=OUT, width=6); g.rectangle((560, 820, 600, 900), fill=(240, 180, 60), outline=OUT, width=6)
    if i == 3: g.ellipse((280, 860, 760, 930), fill=(250, 120, 30))
    pippit(g, 1024); im.save(f'{d}/daibang_pose0{i + 1}.png')

# đồ ghép 3: lưới 2×2 trên nền hồng sen, tên mã băm (2 bản: -watermark và -watermark-v2)
im = Image.new('RGB', (1024, 768), PINK); g = ImageDraw.Draw(im)
for k, (x, y) in enumerate([(150, 120), (600, 120), (150, 450), (600, 450)]):
    g.rounded_rectangle((x, y, x + 240 + k * 10, y + 220), 30, fill=(60 + k * 40, 160, 210 - k * 40), outline=OUT, width=8)
pippit(g, 1024); im.save(f'{d}/0cebb789971d456cab0c108cdf999c75{H}.png'); im.save(f'{d}/0cebb789971d456cab0c108cdf999c75{H}-v2.png')
# ngũ hành: 1 hàng 5 icon nền tím, thứ tự Mộc Hỏa Thổ Kim Thủy
im = Image.new('RGB', (1280, 360), VIOLET); g = ImageDraw.Draw(im)
COL = [(80, 180, 60), (250, 120, 30), (190, 130, 70), (210, 210, 220), (40, 120, 230)]
for k in range(5): g.ellipse((60 + k * 240, 90, 220 + k * 240, 250), fill=COL[k], outline=OUT, width=8)
im.save(f'{d}/b21143d0d9f14a9da2360d09dec15f7e{H}.png')
# đồ ghép 1: 4 icon một hàng, có chữ nhỏ dưới mỗi icon
im = Image.new('RGB', (1280, 420), PINK); g = ImageDraw.Draw(im)
for k in range(4):
    g.rectangle((90 + k * 300, 70, 290 + k * 300, 290), fill=(200, 140 - k * 20, 60 + k * 30), outline=OUT, width=8)
    g.text((150 + k * 300, 330), 'Drum Axe', fill=(250, 220, 120))
im.save(f'{d}/dd6a584e29d0473393d3706f3470ab18{H}.png')
# kết cấu đường đất (ảnh 1200×900, không xoá nền)
random.seed(1); im = Image.new('RGB', (1200, 900), (140, 100, 60)); g = ImageDraw.Draw(im)
for _ in range(400): x, y = random.randrange(1200), random.randrange(900); g.ellipse((x, y, x + 9, y + 7), fill=(110, 80, 50))
im.save(f'{d}/827e7b7475bf463d8f11cdb20c1ac5f0{H}.png')
# nút một vật (không cần cắt lưới) và tháp nhiều vật hai phiên bản
im = Image.new('RGB', (1024, 1024), PINK); g = ImageDraw.Draw(im)
g.rounded_rectangle((260, 400, 760, 600), 40, fill=(240, 180, 70), outline=OUT, width=10); pippit(g, 1024)
im.save(f'{d}/clean_button_hover.png')
for v, n in (('v2', 6), ('v3', 5)):
    im = Image.new('RGB', (1536, 512), PINK); g = ImageDraw.Draw(im)
    for k in range(n): g.rectangle((60 + k * 250, 150, 200 + k * 250, 420), fill=(150, 120, 80 + k * 20), outline=OUT, width=6)
    im.save(f'{d}/thap-phong-thu_{v}.png')
# ảnh đen (ghi tay: bỏ qua)
Image.new('RGB', (1280, 720), (5, 5, 8)).save(f'{d}/127e45df08f8416382f893e1eda54e93{H}.png')
