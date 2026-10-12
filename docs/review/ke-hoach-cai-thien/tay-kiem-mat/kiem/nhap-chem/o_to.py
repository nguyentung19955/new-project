"""Một ô sprite game (điểm ảnh game, phóng 16) có số toạ độ mỗi 2 điểm ảnh. python3 o_to.py <tệp -don> <khung 1..6> <ra.png>"""
import sys, json, base64, io, numpy as np
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1])); S = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
i = int(sys.argv[2]) - 1; Z = 16; X0, X1, Y0, Y1 = 10, 42, 8, 47
g = S[0:96, i * 96:(i + 1) * 96]
im = Image.new('RGB', ((X1 - X0) * Z + 30, (Y1 - Y0) * Z + 20), (255, 255, 255)); dr = ImageDraw.Draw(im)
for y in range(Y0 * 2, Y1 * 2):
    for x in range(X0 * 2, X1 * 2):
        c = tuple(int(v) for v in g[y, x, :3]) if g[y, x, 3] > 127 else (110, 140, 115)
        dr.rectangle([30 + (x / 2 - X0) * Z, (y / 2 - Y0) * Z, 30 + (x / 2 - X0) * Z + Z / 2 - 1, (y / 2 - Y0) * Z + Z / 2 - 1], fill=c)
for x in range(X0, X1 + 1, 2):
    X = 30 + (x - X0) * Z; dr.line([X, 0, X, (Y1 - Y0) * Z], fill=(255, 230, 0) if x == 24 else (0, 0, 0)); dr.text((X + 2, (Y1 - Y0) * Z + 4), str(x - 24), fill=(0, 0, 0))
for y in range(Y0, Y1 + 1, 2):
    Y = (y - Y0) * Z; dr.line([30, Y, im.width, Y], fill=(255, 230, 0) if y == 45 else (0, 0, 0)); dr.text((2, Y + 2), str(y - 45), fill=(0, 0, 0))
im.save(sys.argv[3])
