import json, io, base64, colorsys
from PIL import Image
FX, FY = 26, 46
d = json.load(open('ra1/o.json')); kq = {}; ref = None
for c in d:
    im = Image.open(io.BytesIO(base64.b64decode(c['sach'].split(',', 1)[1]))).convert('RGBA'); px = im.load(); pts = []
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 200: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if 0.18 < h < 0.42 and s > 0.25 and 0.2 < v < 0.75: pts.append((x, y))
    if len(pts) < 8: kq['%s:%d' % (c['hang'], c['khung'])] = None; continue
    ys = sorted(p[1] for p in pts); y0 = ys[len(ys) // 20]  # mép trên quần (bỏ 5% nhiễu)
    xs = [p[0] for p in pts if p[1] <= y0 + 3]
    cx = sum(xs) / len(xs)
    kq['%s:%d' % (c['hang'], c['khung'])] = (round(cx / 2 - FX, 1), round(y0 / 2 - FY, 1), len(pts))
ref = kq['idle:0']
for k, v in kq.items():
    print(k, v, v and (round(v[0] - ref[0], 1), round(v[1] - ref[1], 1)))
json.dump({k: (v and [v[0] - ref[0], v[1] - ref[1]]) for k, v in kq.items()}, open('quan.json', 'w'))
