"""Ảnh phóng to hàng atk_sword (điểm ảnh game) kèm lưới toạ độ tính từ chân, để đo nắm tay. python3 luoi.py <tệp -don> <ra.png> [bảng tay json]"""
import sys, json, base64, io, numpy as np
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1])); S = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
tay = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
Z = 12; X0, X1, Y0, Y1 = 8, 44, 6, 48  # vùng khung (điểm ảnh game)
W = (X1 - X0) * Z; out = Image.new('RGB', (W * 6, (Y1 - Y0) * Z + 20), (90, 120, 95)); dr = ImageDraw.Draw(out)
for i in range(6):
    g = S[1:96:2, i * 96 + 1:(i + 1) * 96:2]
    for y in range(Y0, Y1):
        for x in range(X0, X1):
            c = tuple(int(v) for v in g[y, x, :3]) if g[y, x, 3] > 127 else ((100, 130, 105) if (x + y) % 2 else (92, 122, 97))
            dr.rectangle([i * W + (x - X0) * Z, (y - Y0) * Z, i * W + (x - X0 + 1) * Z - 1, (y - Y0 + 1) * Z - 1], fill=c)
    for x in range(X0, X1 + 1):
        if (x - 24) % 4 == 0: dr.line([i * W + (x - X0) * Z, 0, i * W + (x - X0) * Z, (Y1 - Y0) * Z], fill=(255, 255, 0) if x == 24 else (40, 40, 40))
    for y in range(Y0, Y1 + 1):
        if (y - 45) % 4 == 0: dr.line([i * W, (y - Y0) * Z, i * W + W, (y - Y0) * Z], fill=(255, 255, 0) if y == 45 else (40, 40, 40))
    for x in range(X0, X1):
        if (x - 24) % 4 == 0: dr.text((i * W + (x - X0) * Z + 1, (Y1 - Y0) * Z + 4), str(x - 24), fill=(255, 255, 255))
    for y in range(Y0, Y1):
        if (y - 45) % 4 == 0: dr.text((i * W + 2, (y - Y0) * Z + 1), str(y - 45), fill=(255, 255, 255))
    dr.line([i * W, 0, i * W, out.height], fill=(0, 0, 0), width=3)
    dr.text((i * W + W - 20, 4), str(i + 1), fill=(255, 255, 255))
    if tay:
        tx, ty = tay[i]; cx, cy = i * W + (24 + tx - X0) * Z, (45 + ty - Y0) * Z
        dr.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], outline=(255, 0, 80), width=3)
out.save(sys.argv[2])
