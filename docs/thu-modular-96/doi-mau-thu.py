#!/usr/bin/env python3
"""THỬ NHANH "đổi màu bộ đồ gốc bằng bảng màu" trên hàng chạy (0 ảnh gen) — minh hoạ cho mục Hướng tiết kiệm ảnh.

Chạy: python3 docs/thu-modular-96/doi-mau-thu.py   → ghi docs/thu-modular-96/doi-mau-chay.png
Hàng 1: ảnh game gốc. Hàng 2: đổi màu CHỈ điểm ảnh thuộc lớp đồ gốc (sheets/do-goc) — cách đúng.
Hàng 3: đổi màu theo màu thuần tuý (mọi điểm đen/đỏ) — để thấy vì sao cần mặt nạ/bảng màu riêng: tóc, mắt, viền cũng bị đổi.
Đổi màu = giữ độ sáng từng điểm ảnh, thay sắc theo dải màu mới (áo/quần đen → chàm, đai đỏ → vàng đồng).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
DAY = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, DAY)
import tach_lop as T, trang_phuc as TP
O, N = 96, 12
data = json.load(open(os.path.join(DAY, 'data.json'), encoding='utf-8'))
game = T.hang_game()
own = {l: np.array(Image.open(os.path.join(DAY, data['outfits']['goc']['sheets'][l])))[:, :, 3] > 0 for l in TP.DO}
VAI = np.array([(14, 22, 48), (34, 58, 112), (70, 110, 176), (132, 172, 226)], float)     # chàm: tối → sáng
DAI = np.array([(70, 40, 10), (150, 98, 26), (214, 162, 54), (250, 222, 122)], float)     # vàng đồng


def doi(px, bang, lo, hi):
    """px: Nx3. Độ sáng (0..1 trong khoảng lo..hi của đồ gốc) → nội suy theo dải màu mới."""
    v = px.max(1) / 255.0
    t = np.clip((v - lo) / max(hi - lo, 1e-6), 0, 1) * (len(bang) - 1)
    i = np.minimum(t.astype(int), len(bang) - 2); f = (t - i)[:, None]
    return (bang[i] * (1 - f) + bang[i + 1] * f).round().clip(0, 255).astype(np.uint8)


def to(img, m, bang):
    v = img[m][:, :3].max(1) / 255.0
    lo, hi = np.percentile(v, 2), np.percentile(v, 98)
    img[m, :3] = doi(img[m][:, :3], bang, lo, hi)


a = game.copy()
vai = own['torsoOutfit'] | own['rearPants'] | own['pants'] | own['frontPants']
to(a, vai & (a[:, :, 3] > 0), VAI); to(a, own['belt'] & (a[:, :, 3] > 0), DAI)
b = game.copy()
h, s, v = T._hsv(b); op = b[:, :, 3] > 0
den = op & (v < 0.32) & (s < 0.6); do = op & ((h < 15) | (h > 335)) & (s > 0.5) & (v >= 0.2)
to(b, den, VAI); to(b, do, DAI)
Z = 3; X0, X1, Y0, Y1 = 8, 88, 20, 94
W, H = (X1 - X0) * Z, (Y1 - Y0) * Z; LW = 250
out = Image.new('RGB', (LW + N * W, 3 * H + 24), (246, 244, 238)); d = ImageDraw.Draw(out)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception: F = None
for r, (ten, im) in enumerate((('Ảnh game gốc', game), ('Đổi màu theo lớp đồ gốc\n(mặt nạ) — đúng', a), ('Đổi màu theo màu thuần\n(không mặt nạ) — tóc, mắt,\nviền cũng đổi', b))):
    d.multiline_text((8, 24 + r * H + 8), ten, fill=(0, 0, 0), font=F)
    for c in range(N):
        ch = Image.new('RGBA', (O, O), (246, 244, 238, 255)); ch.alpha_composite(Image.fromarray(np.ascontiguousarray(im[:, c * O:(c + 1) * O])))
        out.paste(ch.crop((X0, Y0, X1, Y1)).convert('RGB').resize((W, H), Image.NEAREST), (LW + c * W, 24 + r * H))
for c in range(N): d.text((LW + c * W + 4, 4), 'khung %d' % c, fill=(0, 0, 0), font=F)
out.save(os.path.join(DAY, 'doi-mau-chay.png'), optimize=True)
print('xong: doi-mau-chay.png (đổi màu: %d điểm ảnh/12 khung theo mặt nạ; %d theo màu thuần)' % (int((vai | own['belt']).sum()), int((den | do).sum())))
