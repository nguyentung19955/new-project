"""Ghép ảnh trước/sau (×4) từ kiem.py thành một tấm nhỏ: 4 vũ khí × (trước, sau) × (đánh 1..6, chạy+đánh, giữ 0.1, giữ 1, chưởng).
Chạy trong thư mục ảnh: python3 ghep_anh.py <key> <bộ>"""
import sys
from PIL import Image, ImageDraw
k, b = sys.argv[1], sys.argv[2]
S = Image.open('sau-%s-%s.png' % (k, b)); T = Image.open('truoc-%s-%s.png' % (k, b))
cols = [3, 4, 5, 6, 7, 8, 9, 10, 12, 13]; W = 200
out = Image.new('RGB', (len(cols) * W + 70, 8 * W), (30, 36, 44)); dr = ImageDraw.Draw(out)
nh = ['kiem', 'cung', 'giao', 'bua']
for r in range(4):
    for q, (im, t) in enumerate([(T, 'truoc'), (S, 'sau')]):
        yy = (r * 2 + q) * W; dr.text((4, yy + 80), nh[r] + '\n' + t, fill=(255, 255, 0) if q else (255, 150, 150))
        for j, i in enumerate(cols):
            y = r * 274 + 18; out.paste(im.crop((i * 256 + 28, y + 28, i * 256 + 28 + W, y + 28 + W)), (70 + j * W, yy))
dr.text((72, 2), 'danh 1..6 | chay+danh | giu 0.1 | giu 1 | chuong', fill=(255, 255, 255))
out.quantize(96).save('truoc-sau-%s-%s.png' % (k, b), optimize=True)
