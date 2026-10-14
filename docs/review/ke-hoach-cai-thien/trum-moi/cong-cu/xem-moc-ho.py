"""Ảnh soát tĩnh xem-moc-ho.png: mọi hàng x 3 pha của Mộc Tinh và Hồ Tinh mới, cùng tỉ lệ (2 điểm ảnh = 1 điểm game).
Đường đỏ: đất / gốc. Vàng: đỉnh đầu khung đứng pha 1. Trên mỗi trùm là hàng đứng của con cũ (git 056fa697) để so cỡ.
python3 xem-moc-ho.py"""
import os, json, io, base64, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
TEN = {'idle': 'đứng', 'move': 'đi', 'tele': 'báo đòn (+khung trước chạm)', 'atk': 'đánh (từ khung chạm)', 'hit': 'trúng đòn', 'die': 'chết'}
CU = '056fa697'
def doc(t):
    a = np.array(Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA'))
    if t.get('net', 1) == 1: a = np.repeat(np.repeat(a, 2, 0), 2, 1)
    return a
def khung(t, a, dt, i):
    fw, fh = t['khung_rong'] * 2, t['khung_cao'] * 2; h = t['dong_tac'][dt]['hang']
    return Image.fromarray(a[h * fh:(h + 1) * fh, i * fw:(i + 1) * fw])
def cu(ma): return json.loads(subprocess.run(['git', 'show', '%s:game/art/custom/%s.sprite.json' % (CU, ma)], cwd=ROOT, capture_output=True, check=True).stdout)
def moi(ma): return json.load(open(os.path.join(ROOT, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
NHAN = 330; COT = 9
hang = []   # (nhãn, ảnh, gốc x, gốc y, rộng ô, cao ô, đỉnh)
for MA, TT in (('mocTinh', 'MỘC TINH'), ('hoTinh', 'HỒ TINH')):
    t1 = moi(MA); a1 = np.array(khung(t1, doc(t1), 'idle', 0)); DINH = int(np.nonzero((a1[..., 3] > 0).any(1))[0][0]) - t1['goc'][1] * 2
    for ma, ten in ((MA, 'pha 1'), (MA + '-p2', 'pha 2'), (MA + '-p3', 'pha 3')):
        t = cu(ma); a = doc(t)
        hang.append(('CŨ · %s %s · đứng' % (TT, ten), [khung(t, a, 'idle', i) for i in range(t['dong_tac']['idle']['so'])], t['goc'][0] * 2, t['goc'][1] * 2, t['khung_rong'] * 2, t['khung_cao'] * 2, None))
    for ma, ten in ((MA, 'pha 1'), (MA + '-p2', 'pha 2'), (MA + '-p3', 'pha 3')):
        t = moi(ma); a = doc(t)
        for dt, v in sorted(t['dong_tac'].items(), key=lambda kv: kv[1]['hang']):
            hang.append(('MỚI · %s %s · %s' % (TT, ten, TEN[dt]), [khung(t, a, dt, i) for i in range(v['so'])], t['goc'][0] * 2, t['goc'][1] * 2, t['khung_rong'] * 2, t['khung_cao'] * 2, DINH))
W = NHAN + max(len(ds) * fw for _, ds, gx, gy, fw, fh, d in hang) + 20
H = sum(fh for *_, fh, d in hang) + 10 * len(hang) + 60
o = Image.new('RGBA', (W, H), (52, 66, 84, 255)); d = ImageDraw.Draw(o)
d.text((10, 14), 'Mộc Tinh + Hồ Tinh mới — mọi hàng × 3 pha, cùng tỉ lệ (2 điểm ảnh = 1 điểm game). Đỏ: đất/gốc. Vàng: đỉnh đầu khung đứng pha 1. Hàng "CŨ": con cũ để so cỡ.', font=F, fill=(240, 240, 240))
y = 50
for nhan, ds, gx, gy, fw, fh, dinh in hang:
    d.rectangle([0, y, W, y + fh], fill=(60, 76, 96, 255) if 'MỚI' in nhan else (80, 70, 70, 255))
    for j, w in enumerate(nhan.split(' · ')): d.text((10, y + 10 + j * 26), w, font=FB if j == 0 else F, fill=(255, 255, 255))
    for i, im in enumerate(ds): o.alpha_composite(im, (NHAN + i * fw, y))
    d.line([(NHAN, y + gy), (W, y + gy)], fill=(255, 40, 40), width=3)
    if dinh is not None: d.line([(NHAN, y + gy + dinh), (W, y + gy + dinh)], fill=(255, 220, 0), width=3)
    for i in range(len(ds)): d.line([(NHAN + i * fw + gx, y + gy - 6), (NHAN + i * fw + gx, y + gy + 6)], fill=(255, 60, 60), width=2)
    y += fh + 10
o.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(HERE, '..', 'xem-moc-ho.png'), optimize=True)
print('xem-moc-ho.png', o.size)
