"""Ảnh soát xem-bao-truoc.png: 4 kiểu × 8 khung vẽ như game (nét ×2, không làm mịn) trên sàn thật (gd-nen-rung-san0 lát).
Tròn r 44 ép dẹt 0,6; vành r0 26 r1 48 (dẹt 0,6, đổi tỉ lệ trong/ngoài theo bán kính như js/bao_truoc.js); quạt r 70 mở 90° quay phải;
đường thẳng dài 92 rộng 22. Khung 8 = lúc nổ."""
import os, json, io, base64, sys
import numpy as np
from PIL import Image, ImageDraw
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
CU = os.path.join(DAY, 'game/art/custom')
def gd(ma):
    d = json.load(open(os.path.join(CU, ma + '.sprite.json'), encoding='utf-8'))
    return Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',')[1]))).convert('RGBA')
HINH = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra/hinh-bao-truoc.json')))
N = 2; CW, CH = 110 * N, 100 * N
san = gd('gd-nen-rung-san0')
o = Image.new('RGBA', (CW * 8 + 20, CH * 4 + 40), (0, 0, 0, 255))
for y in range(0, o.height, san.height):
    for x in range(0, o.width, san.width): o.paste(san, (x, y))
dr = ImageDraw.Draw(o)
def khung(im, i):
    w = im.width // 8; return im.crop((i * w, 0, (i + 1) * w, im.height))
def vanh_doi(k, rin_moi, R, r0):
    """đổi bán kính trong: điểm ở bán kính ρ (≥ rin_moi) lấy từ ρ' = r0 + (ρ − rin_moi)(R − r0)/(R − rin_moi) (ngoài R giữ nguyên)"""
    a = np.array(k); S = a.shape[0]; c = S / 2
    yy, xx = np.mgrid[0:S, 0:S] + 0.5; dx, dy = xx - c, yy - c; rho = np.hypot(dx, dy)
    src = np.where(rho >= R, rho, r0 + (rho - rin_moi) * (R - r0) / (R - rin_moi))
    ok = rho >= rin_moi
    sc = np.where(rho > 0, src / np.maximum(rho, 1e-6), 0)
    sx = np.clip((c + dx * sc).astype(int), 0, S - 1); sy = np.clip((c + dy * sc).astype(int), 0, S - 1)
    b = a[sy, sx]; b[~ok] = 0
    return Image.fromarray(b)
for i in range(8):
    x0 = 10 + i * CW
    # tròn
    h = HINH['gd-bt-tron']; k = khung(gd('gd-bt-tron'), i); r = 44; s = r / h['R']
    w, hh = round(h['o'] * s * N), round(h['o'] * s * 0.6 * N); kk = k.resize((w, hh), Image.NEAREST)
    o.alpha_composite(kk, (x0 + CW // 2 - w // 2, 30 + CH // 2 - hh // 2))
    # vành
    h = HINH['gd-bt-vanh']; k = khung(gd('gd-bt-vanh'), i); r0, r1 = 26, 48; s = r1 / h['R']
    k = vanh_doi(k, r0 / r1 * h['R'], h['R'], h['r0'])
    w, hh = round(h['o'] * s * N), round(h['o'] * s * 0.6 * N); kk = k.resize((w, hh), Image.NEAREST)
    o.alpha_composite(kk, (x0 + CW // 2 - w // 2, 30 + CH + CH // 2 - hh // 2))
    # quạt (mở 90°: ảnh 88°, giãn dọc theo tan)
    h = HINH['gd-bt-quat']; k = khung(gd('gd-bt-quat'), i); r = 70; s = r / h['R']; ky = np.tan(np.radians(45)) / np.tan(np.radians(h['nua']))
    w, hh = round(k.width * s * N), round(k.height * s * ky * N); kk = k.resize((w, hh), Image.NEAREST)
    ax, ay = x0 + 20, 30 + 2 * CH + CH // 2
    o.alpha_composite(kk, (int(ax - h['dinh'][0] * s * N), int(ay - hh / 2)))
    # đường thẳng
    h = HINH['gd-bt-dai']; k = khung(gd('gd-bt-dai'), i); L, Wd = 92, 22
    sx = L / (h['x1'] - h['x0']); sy = (Wd / 2) / h['nua']
    w, hh = round(k.width * sx * N), round(k.height * sy * N); kk = k.resize((w, hh), Image.NEAREST)
    lx, ly = x0 + 8, 30 + 3 * CH + CH // 2
    o.alpha_composite(kk, (int(lx - h['x0'] * sx * N), int(ly - hh / 2)))
    dr.text((x0 + 4, 4), 'khung %d%s' % (i + 1, ' (no)' if i == 7 else ''), fill=(255, 255, 255, 255))
o.convert('RGB').save(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../xem-bao-truoc.png'))
