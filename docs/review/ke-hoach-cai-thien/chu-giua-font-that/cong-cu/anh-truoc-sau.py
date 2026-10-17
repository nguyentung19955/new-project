#!/usr/bin/env python3
"""Ghép ảnh TRƯỚC (?chufont=0) / SAU từ ảnh chụp của do-chu-giua.py (chạy với DPR=2, MODE=cu,moi).
  python3 anh-truoc-sau.py <thư mục kết quả> <đích> <phông> canh1,canh2,...  [vùng cắt x0,y0,x1,y1 theo điểm CSS, tuỳ chọn]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
src, dich, phong, canhs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
os.makedirs(dich, exist_ok=True)
fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
for canh in canhs:
    anh = []
    for mode, nhan in (('cu', 'TRƯỚC (?chufont=0)'), ('moi', 'SAU')):
        p = os.path.join(src, '%s-vi-844' % mode, canh + '.png')
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB')
        if len(sys.argv) > 5:
            k = im.width / 844; b = [int(float(v) * k) for v in sys.argv[5].split(',')]; im = im.crop(b)
        top = Image.new('RGB', (im.width, im.height + 34), (20, 16, 14)); top.paste(im, (0, 34))
        ImageDraw.Draw(top).text((10, 5), '%s · %s · phông thay: %s' % (canh, nhan, phong), fill=(255, 225, 140), font=fnt)
        anh.append(top)
    if len(anh) < 2: continue
    out = Image.new('RGB', (anh[0].width, anh[0].height * 2 + 8), (60, 60, 60))
    out.paste(anh[0], (0, 0)); out.paste(anh[1], (0, anh[0].height + 8))
    out.save(os.path.join(dich, '%s-%s.jpg' % (canh, phong)), quality=82, optimize=True)
print('xong', dich)
