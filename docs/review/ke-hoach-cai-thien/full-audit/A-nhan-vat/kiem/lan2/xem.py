#!/usr/bin/env python3
"""Cắt phóng to vài ô từ ảnh tiếp xúc em_be.py. python3 xem.py <ảnh> <ra> <nhãn states json> nhãn1 nhãn2 ... (hàng: 0 thân,1 vk,2 vk trái,3 đủ đồ)"""
import sys, json
from PIL import Image
im = Image.open(sys.argv[1]); st = [s[1] for s in json.load(open(sys.argv[3]))['states']]
CW, CH = 224, 168; Z = 3
cols = sys.argv[4:]
out = Image.new('RGB', (len(cols) * 120 * Z // 2 * 2 // 2, 4 * 110 * Z // 2))
w, h = 120, 110
out = Image.new('RGB', (len(cols) * w // 2 * Z, 4 * h // 2 * Z))
for i, c in enumerate(cols):
    j = st.index(c)
    for q in range(4):
        t = im.crop((j * CW + 52, q * CH + 30, j * CW + 52 + w, q * CH + 30 + h)).resize((w // 2 * Z, h // 2 * Z), Image.NEAREST)
        out.paste(t, (i * w // 2 * Z, q * h // 2 * Z))
out.save(sys.argv[2])
