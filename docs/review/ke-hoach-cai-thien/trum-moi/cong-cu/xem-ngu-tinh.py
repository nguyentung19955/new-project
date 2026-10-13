"""Ảnh soát tĩnh xem-ngu-tinh.png: mọi hàng x 3 pha của Ngư Tinh mới, cùng tỉ lệ (2 điểm ảnh = 1 điểm game),
đường đất đỏ, đường kẻ vàng = đỉnh mũ vây và mắt ở khung đứng pha 1 (để so cỡ đầu); trên cùng là Ngư Tinh cũ (cá, lấy từ git e408c9da).
python3 xem-ngu-tinh.py"""
import os, json, io, base64, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
TEN = {'idle': 'đứng', 'move': 'trườn', 'tele': 'báo đòn (+vung rìu)', 'atk': 'đánh (từ khung rìu chạm đất)', 'hit': 'trúng đòn', 'die': 'chết'}


def doc(t):
    a = np.array(Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA'))
    n = t.get('net', 1)
    if n == 1: a = np.repeat(np.repeat(a, 2, 0), 2, 1)        # về cùng tỉ lệ 2 điểm ảnh / điểm game
    return a


def khung(t, a, dt, i):
    fw, fh = t['khung_rong'] * 2, t['khung_cao'] * 2; h = t['dong_tac'][dt]['hang']
    return Image.fromarray(a[h * fh:(h + 1) * fh, i * fw:(i + 1) * fw])


def cu(ma):
    s = subprocess.run(['git', 'show', 'e408c9da:game/art/custom/%s.sprite.json' % ma], cwd=ROOT, capture_output=True, check=True).stdout
    return json.loads(s)


moi = {ma: json.load(open(os.path.join(ROOT, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8')) for ma in ('nguTinh', 'nguTinh-p2', 'nguTinh-p3')}
t1 = moi['nguTinh']; FW, FH = t1['khung_rong'] * 2, t1['khung_cao'] * 2; GX, GY = t1['goc'][0] * 2, t1['goc'][1] * 2
NHAN = 300; COT = 8
# tham chiếu đầu: đỉnh mũ vây (điểm đặc cao nhất nửa trái) và mắt ở khung đứng 1 pha 1
a1 = np.array(khung(t1, doc(t1), 'idle', 0))
m = a1[..., 3] > 0; xs = np.nonzero(m.any(0))[0]; trai = a1[:, : (xs[0] + xs[-1]) // 2]
DINH = int(np.nonzero((trai[..., 3] > 0).any(1))[0][0])

hang = []   # (nhãn, [ảnh], chiều cao ô, gốc y)
for ma, cuoi in (('nguTinh', 'pha 1 (cá cũ)'), ('nguTinh-p2', 'pha 2 (cá cũ)'), ('nguTinh-p3', 'pha 3 (cá cũ)')):
    t = cu(ma); a = doc(t)
    hang.append(('CŨ · ' + cuoi + ' · đứng', [khung(t, a, 'idle', i) for i in range(t['dong_tac']['idle']['so'])], t['khung_cao'] * 2, t['goc'][1] * 2, t['goc'][0] * 2, t['khung_rong'] * 2))
for ma, ten in (('nguTinh', 'MỚI · pha 1'), ('nguTinh-p2', 'MỚI · pha 2 nổi giận'), ('nguTinh-p3', 'MỚI · pha 3 cuồng nộ')):
    t = moi[ma]; a = doc(t)
    for dt, v in sorted(t['dong_tac'].items(), key=lambda kv: kv[1]['hang']):
        hang.append((ten + ' · ' + TEN[dt], [khung(t, a, dt, i) for i in range(v['so'])], FH, GY, GX, FW))

W = NHAN + COT * FW; H = sum(h for _, _, h, *_ in hang) + 10 * len(hang) + 60
o = Image.new('RGBA', (W, H), (52, 66, 84, 255)); d = ImageDraw.Draw(o)
d.text((10, 14), 'Ngư Tinh mới (mực khổng lồ) — mọi hàng × 3 pha, cùng tỉ lệ (2 điểm ảnh = 1 điểm game). Đỏ: đường đất / gốc. Vàng: đỉnh mũ vây khung đứng pha 1. Trên cùng: cá cũ để so cỡ.', font=F, fill=(240, 240, 240))
y = 50
for nhan, ds, fh, gy, gx, fw in hang:
    d.rectangle([0, y, W, y + fh], fill=(60, 76, 96, 255) if 'MỚI' in nhan else (80, 70, 70, 255))
    for j, w in enumerate(nhan.split(' · ')):
        d.text((10, y + 10 + j * 26), w, font=FB if j == 0 else F, fill=(255, 255, 255))
    for i, im in enumerate(ds):
        x = NHAN + i * fw + GX - gx
        if x + im.width <= W: o.alpha_composite(im, (x, y))
    d.line([(NHAN, y + gy), (W, y + gy)], fill=(255, 60, 60), width=1)
    if fh == FH: d.line([(NHAN, y + DINH), (W, y + DINH)], fill=(255, 220, 60), width=1)
    for i in range(COT): d.line([(NHAN + i * FW + GX, y + gy - 6), (NHAN + i * FW + GX, y + gy + 6)], fill=(255, 60, 60), width=2)
    y += fh + 10
o.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(HERE, '..', 'xem-ngu-tinh.png'), optimize=True)
print('xem-ngu-tinh.png', o.size)
