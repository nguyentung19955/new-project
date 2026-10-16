#!/usr/bin/env python3
"""Ảnh soát tĩnh hình tạm phiên 3A (2 tinh anh + Cá Trê pha 1, pha 2): mỗi hàng — ảnh con mượn (gốc) | cùng ảnh qua phép nhuộm (như ctx.filter
trong game) ở 4 khung: đứng, báo đòn, đánh, chiêu. Đọc bảng MOI (khối song3a) thẳng từ game/js/monster_art.js. Dùng lại hàm nhuộm của
../vung-4-2a/ve_soat.py (cùng công thức Filter Effects W3C).
  python3 ve_soat.py  → xem-hinh-tam.png
"""
import os, re, json, io, base64, math, importlib.util
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
JS = open(os.path.join(ROOT, 'game/js/monster_art.js'), encoding='utf-8').read()
EN = json.load(open(os.path.join(ROOT, 'tools/ngon-ngu/tu-dien/quai.json'), encoding='utf-8'))
k0 = JS.index('// ----- song3a'); khoi = JS[k0:JS.index('// ----- hết song3a', k0)]
khoi = khoi[khoi.index('const MOI = {'):]
BANG = []
for m in re.finditer(r"(\w+): \{ muon: '(\w+)', loai: '(\w+)', ten: '([^']+)', loc: (\[.*?\]\])(?:,\s*//[^\n]*\n\s*locP2: (\[.*?\]\]))?", khoi):
    j = lambda s: json.loads(s.replace("'", '"'))
    BANG.append((m.group(1), m.group(2), m.group(4), j(m.group(5)), 1, ''))
    if m.group(6): BANG.append((m.group(1), m.group(2) + '-p2', m.group(4), j(m.group(6)), 2, ' — pha 2'))


def ma_tran(loc):
    M = np.eye(3); B = np.zeros(3)
    for k, v in loc:
        if k == 'hue':
            a = math.radians(v); c, s = math.cos(a), math.sin(a)
            N = np.array([[.213 + c * .787 - s * .213, .715 - c * .715 - s * .715, .072 - c * .072 + s * .928],
                          [.213 - c * .213 + s * .143, .715 + c * .285 + s * .140, .072 - c * .072 - s * .283],
                          [.213 - c * .213 - s * .787, .715 - c * .715 + s * .715, .072 + c * .928 + s * .072]]); b = 0
        elif k == 'sat':
            N = np.array([[.213 + .787 * v, .715 - .715 * v, .072 - .072 * v], [.213 - .213 * v, .715 + .285 * v, .072 - .072 * v], [.213 - .213 * v, .715 - .715 * v, .072 + .928 * v]]); b = 0
        elif k == 'bri': N = np.eye(3) * v; b = 0
        elif k == 'sep':
            u = 1 - v
            N = np.array([[.393 + .607 * u, .769 - .769 * u, .189 - .189 * u], [.349 - .349 * u, .686 + .314 * u, .168 - .168 * u], [.272 - .272 * u, .534 - .534 * u, .131 + .869 * u]]); b = 0
        else: N = np.eye(3) * v; b = (1 - v) / 2
        M = N @ M; B = N @ B + b
    return M, B


def nhuom(a, loc):
    M, B = ma_tran(loc); rgb = a[..., :3].astype(np.float32) / 255
    o = np.clip(rgb @ M.T + B, 0, 1); r = a.copy(); r[..., :3] = (o * 255 + .5).astype(np.uint8); return r


def khung(ma, ten, i):
    d = json.load(open(os.path.join(ROOT, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
    im = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))
    n = d.get('net', 1); fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    dt = d['dong_tac'].get(ten) or d['dong_tac'].get('atk') or d['dong_tac']['idle']
    i = min(i, dt['so'] - 1); h = dt['hang']
    return im[h * fh:(h + 1) * fh, i * fw:(i + 1) * fw]


F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
F2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
S = 2; O = 150; NC = 3
W = 250 + 2 * NC * O + 10; H = 40 + len(BANG) * O
can = Image.new('RGBA', (W, H), (27, 54, 52, 255)); dr = ImageDraw.Draw(can)
for x in range(0, W, 24):
    for y in range(40, H, 24): dr.rectangle([x, y, x + 11, y + 11], fill=(31, 60, 57, 255))
dr.text((10, 10), 'Hình tạm phiên 3A: ảnh con mượn (gốc, 3 cột trái) → nhuộm màu như trong game (3 cột phải) · đứng / báo đòn / đánh', font=F, fill=(240, 230, 200, 255))
for r, (ma, muon, ten, loc, ph, nh) in enumerate(BANG):
    y0 = 40 + r * O
    dr.text((10, y0 + 20), ten + nh, font=F, fill=(255, 235, 170, 255))
    dr.text((10, y0 + 40), EN.get(ten, ''), font=F2, fill=(200, 220, 210, 255))
    dr.text((10, y0 + 62), ma + ' ← ' + muon, font=F2, fill=(200, 220, 210, 255))
    dr.text((10, y0 + 80), ' '.join(f'{k}({v})' for k, v in loc), font=F2, fill=(170, 200, 190, 255))
    for c, (tn, i) in enumerate([('idle', 0), ('tele', 3), ('atk', 3)] * 2):
        a = khung(muon, tn, i)
        if c >= NC: a = nhuom(a, loc)
        im = Image.fromarray(a).resize((a.shape[1] * S, a.shape[0] * S), Image.NEAREST)
        if im.width > O - 6 or im.height > O - 6: im.thumbnail((O - 6, O - 6), Image.NEAREST)
        can.alpha_composite(im, (250 + c * O + (O - im.width) // 2, y0 + (O - im.height) // 2))
    dr.line([250 + NC * O - 2, y0 + 8, 250 + NC * O - 2, y0 + O - 8], fill=(255, 210, 120, 255), width=2)
can.convert('RGB').save(os.path.join(HERE, 'xem-hinh-tam.png'))
print('đã ghi xem-hinh-tam.png', can.size, [b[0] + nh for b in BANG for nh in [b[5]]])
