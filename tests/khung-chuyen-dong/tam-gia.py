#!/usr/bin/env python3
"""Tạo tấm ảnh giả cho test bộ nhiều khung: nền #FF00FF, mỗi ô một hình người que màu riêng (đầu + thân + chân),
chân đặt trên cùng một đường đáy; ô thứ i dịch nhẹ theo i để các khung khác nhau.
  python3 tam-gia.py <ra.png> <cột> <hàng> <cỡ ô>"""
import sys
from PIL import Image, ImageDraw
out, cols, rows, cell = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
im = Image.new('RGB', (cols * cell, rows * cell), (255, 0, 255))
d = ImageDraw.Draw(im)
for i in range(cols * rows):
    x0, y0 = (i % cols) * cell, (i // cols) * cell
    col = ((37 * i + 40) % 200 + 20, (91 * i + 60) % 200 + 20, (53 * i + 90) % 140)   # không gần hồng tím
    cx, base = x0 + cell // 2 + (i % 4) * 3, y0 + int(cell * 0.9)
    lift = (i % 3) * 4
    d.ellipse((cx - cell * 0.12, y0 + cell * 0.12 - lift, cx + cell * 0.12, y0 + cell * 0.36 - lift), fill=col, outline=(42, 22, 8), width=3)
    d.rectangle((cx - cell * 0.1, y0 + cell * 0.36 - lift, cx + cell * 0.1, y0 + cell * 0.68), fill=col, outline=(42, 22, 8), width=3)
    d.rectangle((cx - cell * 0.09, y0 + cell * 0.68, cx - cell * 0.02, base), fill=(42, 22, 8))
    d.rectangle((cx + cell * 0.02, y0 + cell * 0.68, cx + cell * 0.09, base), fill=(42, 22, 8))
    d.rectangle((cx + cell * 0.1, y0 + cell * 0.3 + i, cx + cell * 0.3, y0 + cell * 0.36 + i), fill=(200, 160, 40), outline=(42, 22, 8))   # "vũ khí"
im.save(out)
