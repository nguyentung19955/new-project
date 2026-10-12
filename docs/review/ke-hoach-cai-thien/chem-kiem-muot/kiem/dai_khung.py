"""Dải từng khung 60 fps (không bỏ khung) quanh cú vung của nhát 1 và nhát 3 (chuỗi đứng chém của gif_truoc_sau.py), 4 em bé,
mỗi em bé hai hàng: trước / sau. Chạy: python3 dai_khung.py <url trước> <url sau> <ảnh ra>"""
import base64, io, sys
from PIL import Image, ImageDraw, ImageFont
from gif_truoc_sau import chup
A, B = chup(sys.argv[1]), chup(sys.argv[2])
# chuỗi 'dung': 8 khung đứng, nhát 1 (18 khung, từ 8), 2 đứng, nhát 2 (18, từ 28), 2 đứng, nhát 3 (28, từ 48)
DOAN = [('nhát 1', list(range(8, 26)) + [26, 27]), ('nhát 3', list(range(50, 78)))]
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except Exception: font = ImageFont.load_default()
TEN = ['Cu Tí', 'Cu Tèo', 'Cu Lì', 'Cái Bống']
anh = lambda u: Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')
out = []
for ten, ks in DOAN:
    a0 = anh(A['dung'][0][0]); W, H = a0.size; cw = W // 4; s = 0.5
    tw, th = int(cw * s), int(H * s)
    im = Image.new('RGB', (70 + tw * len(ks), 18 + th * 8), '#1d2620'); d = ImageDraw.Draw(im)
    d.text((4, 2), f'{ten}: từng khung 60 fps (trái → phải), mỗi em bé: hàng trên TRƯỚC, hàng dưới SAU', fill='#fff', font=font)
    for c, k in enumerate(ks):
        fa, fb = anh(A['dung'][k][0]), anh(B['dung'][k][0])
        for j in range(4):
            for r, f in enumerate((fa, fb)):
                t = f.crop((j * cw, 0, (j + 1) * cw, H)).resize((tw, th), Image.NEAREST)
                im.paste(t, (70 + c * tw, 18 + (j * 2 + r) * th))
        if A['dung'][k][1]: d.text((70 + c * tw + 2, 18), 'CHẠM', fill='#ffe060', font=font)
    for j in range(4):
        d.text((4, 18 + j * 2 * th + 8), TEN[j], fill='#fff', font=font); d.text((4, 18 + j * 2 * th + 24), 'trước', fill='#ffb0b0', font=font)
        d.text((4, 18 + (j * 2 + 1) * th + 8), 'sau', fill='#b0ffb0', font=font)
    out.append(im)
W = max(i.width for i in out); im = Image.new('RGB', (W, sum(i.height for i in out)), '#1d2620'); y = 0
for i in out: im.paste(i, (0, y)); y += i.height
im.quantize(colors=128).save(sys.argv[3], optimize=True); print(im.size)
