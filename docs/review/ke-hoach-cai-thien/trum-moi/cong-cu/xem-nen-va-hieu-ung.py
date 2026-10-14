"""Ảnh soát tĩnh (không chạy game):
- xem-nen.png: lát thử 1 phòng trùm (sàn 300x198, tường sau 42+7, tường bên 14, tường trước 12) cho Hang biển và Lâu đài cổ bằng đúng các tệp
  gd-nen-<bien|lau>-* trong game/art/custom, theo cách js/room_art.js lát (khối 4x4 ô chọn 1 trong 3 mảng, ~6% điểm nhấn, lật ngang chỉ ở Lâu đài).
  Nét x2 (1 điểm game = 2 điểm ảnh). Không có lớp ánh sáng / đồ trang trí / cửa của game.
- xem-hieu-ung-trum.png: 9 hiệu ứng chiêu trùm, mọi khung theo cỡ dùng trong game (đã nhân hệ số co ở chỗ móc), kèm vòng đỏ = vùng sát thương thật."""
import os, json, io, base64, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
CU = os.path.join(ROOT, 'game/art/custom')
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
def anh(ma, k='anh'):
    t = json.load(open(os.path.join(CU, ma + '.sprite.json'), encoding='utf-8'))
    return Image.open(io.BytesIO(base64.b64decode(t[k].split(',')[1]))).convert('RGBA'), t
N = 2
def phong(v, seed):
    T = {k: anh('gd-nen-%s-%s' % (v, k))[0] for k in ['san0', 'san1', 'san2', 'san-nhan', 'ngoai', 'tuong-sau', 'tuong-truoc', 'mep', 'tuong-ben']}
    W, H = 480, 270; fx0, fy0, fx1, fy1, wh, cap, sw, fw = 80, 56, 380, 254, 42, 7, 14, 12
    o = Image.new('RGBA', (W * N, H * N), (0, 0, 0, 255))
    for y in range(0, H * N, T['ngoai'].height):
        for x in range(0, W * N, T['ngoai'].width): o.alpha_composite(T['ngoai'], (x, y))
    rn = random.Random(seed); lat = v == 'lau'
    san = Image.new('RGBA', ((fx1 - fx0) * N, (fy1 - fy0) * N))
    bc, br = -(-(fx1 - fx0) // 64), -(-(fy1 - fy0) // 64); nhan = 0
    for j in range(br):
        for i in range(bc):
            q = rn.random(); k = 'san%d' % (0 if q < .5 else 1 if q < .75 else 2)
            if nhan < max(1, int(.06 * bc * br)) and 0 < i < bc - 1 and 0 < j < br - 1 and rn.random() < .25: k = 'san-nhan'; nhan += 1
            im = T[k]
            if lat and rn.random() < .5: im = im.transpose(Image.FLIP_LEFT_RIGHT)
            san.alpha_composite(im, (i * 128, j * 128)) if i * 128 + 128 <= san.width and j * 128 + 128 <= san.height else san.paste(im, (i * 128, j * 128))
    o.paste(san, (fx0 * N, fy0 * N))
    x0, w, wy = fx0 - sw, fx1 - fx0 + sw * 2, fy0 - wh
    dai = Image.new('RGBA', (w * N, (wh + cap) * N))
    for x in range(0, w * N, T['tuong-sau'].width): dai.paste(T['tuong-sau'], (x, 0))
    o.alpha_composite(dai, (x0 * N, (wy - cap) * N))
    y0, h = fy0 - wh - cap, fy1 + fw - (fy0 - wh - cap)
    for x, flip in ((fx0 - sw, False), (fx1, True)):
        im = T['tuong-ben'].transpose(Image.FLIP_LEFT_RIGHT) if flip else T['tuong-ben']
        col = Image.new('RGBA', (sw * N, h * N))
        for y in range(0, h * N, im.height): col.alpha_composite(im, (0, y)) if y + im.height <= h * N else col.paste(im, (0, y))
        o.alpha_composite(col, (x * N, y0 * N))
    tr = Image.new('RGBA', (w * N, fw * N))
    for x in range(0, w * N, T['tuong-truoc'].width): tr.paste(T['tuong-truoc'], (x, 0))
    o.alpha_composite(tr, (x0 * N, fy1 * N))
    mep = Image.new('RGBA', ((fx1 - fx0) * N, T['mep'].height))
    for x in range(0, mep.width, T['mep'].width): mep.alpha_composite(T['mep'], (x, 0)) if x + T['mep'].width <= mep.width else mep.paste(T['mep'], (x, 0), T['mep'])
    o.alpha_composite(mep, (fx0 * N, (fy1 + 2) * N - T['mep'].height))
    return o
A = phong('bien', 3); B = phong('lau', 5)
o = Image.new('RGB', (A.width, A.height * 2 + 80), (30, 30, 40)); d = ImageDraw.Draw(o)
d.text((10, 8), 'Hang biển (gd-nen-bien-*) — lát thử 1 phòng trùm bằng script, nét x2, chưa có ánh sáng / cửa / đồ trang trí của game', font=F, fill=(255, 255, 255))
o.paste(A.convert('RGB'), (0, 34))
d.text((10, A.height + 44), 'Lâu đài cổ (gd-nen-lau-*) — cùng cách (game trải thêm thảm gd-tt-lau-tham-* lên sàn)', font=F, fill=(255, 255, 255))
o.paste(B.convert('RGB'), (0, A.height + 70))
o.save(os.path.join(HERE, '..', 'xem-nen.png'), optimize=True); print('xem-nen.png', o.size)
# ---- hiệu ứng ----
DUNG = [('hu-song-than', .75, 'tường sóng (mobs.js drawWall): bản ảnh xếp nối mỗi 14 điểm dọc tường, dày vùng 14', None),
        ('hu-bang-nhon-roi', .9, 'băng nhọn rơi (boss.js Ngư c4): khung 3 trùng lúc vùng tròn r16 nổ', 16),
        ('hu-xoay-nuoc', 2 * 112 / 138, 'xoáy nước (Ngư c5): phủ vòng xoáy r60 + vòng sóng tới r112', 112),
        ('hu-phun-bang', 125 / 124, 'phun băng (Ngư c3): dài 125 = tầm vùng nón, xoay theo hướng phun', None),
        ('hu-gai-re', .8, 'gai rễ (Mộc c2, vòng c5): khung 3 trùng lúc vùng tròn r14 nổ', 14),
        ('hu-qua-doc-roi', 1, 'quả độc rơi (Mộc c3): khung 2 trùng lúc vùng tròn r18 nổ', 18),
        ('hu-la-chem', 118 * .95 / 106, 'lá chém (Mộc c1): vùng nón r118, xoay theo hướng chém', None),
        ('hu-cau-lua-ma', .8, 'cầu lửa ma (đạn Hồ Tinh c1, c5)', None),
        ('hu-doi-pha', 1.0, 'đổi pha (cả 3 trùm): ảnh trắng vàng, game nhuộm theo màu pha (ở đây chưa nhuộm), cỡ ~ 2,6 x bán kính thân', None)]
hang = []
for ma, co, ghi_chu, r in DUNG:
    im, t = anh(ma, 'tam'); fw, fh, n = t['khung_rong'], t['khung_cao'], t['net']
    s = co * N / n
    ks = [im.crop((i * fw * n, 0, (i + 1) * fw * n, fh * n)).resize((max(1, round(fw * n * s)), max(1, round(fh * n * s))), Image.NEAREST) for i in range(t['so'])]
    hang.append((ma, ghi_chu, ks, t['goc'][0] * N * co, t['goc'][1] * N * co, r))
W = 330 + max(sum(k.width + 12 for k in ks) for _, _, ks, *_ in hang); H = sum(max(k.height for k in ks) + 50 for _, _, ks, *_ in hang) + 40
o = Image.new('RGBA', (W, H), (44, 52, 70, 255)); d = ImageDraw.Draw(o)
d.text((10, 8), '9 hiệu ứng chiêu trùm — cỡ dùng trong game (2 điểm ảnh = 1 điểm game). Vòng đỏ: vùng sát thương thật (nhìn chếch). Chấm vàng: điểm neo.', font=F, fill=(255, 255, 255))
y = 40
for ma, gc, ks, ax, ay, r in hang:
    h = max(k.height for k in ks) + 30
    d.text((10, y + 4), ma, font=FB, fill=(255, 255, 255))
    for j in range(0, len(gc), 34): d.text((10, y + 30 + j // 34 * 18), gc[j:j + 34], font=F, fill=(220, 220, 220))
    x = 330
    for k in ks:
        Y = y + 20 + (h - 30 - k.height)
        if r: d.ellipse([x + ax - r * N, Y + ay - r * N * .6, x + ax + r * N, Y + ay + r * N * .6], outline=(255, 70, 60), width=2)
        o.alpha_composite(k, (int(x), int(Y)))
        d.ellipse([x + ax - 3, Y + ay - 3, x + ax + 3, Y + ay + 3], fill=(255, 220, 0))
        x += k.width + 12
    y += h + 20
o.convert('RGB').save(os.path.join(HERE, '..', 'xem-hieu-ung-trum.png'), optimize=True); print('xem-hieu-ung-trum.png', o.size)
