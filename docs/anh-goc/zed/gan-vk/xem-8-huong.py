#!/usr/bin/env python3
# Ảnh soát TĨNH (không chạy game) cho zed-8-huong 13/10/2026: dựng lại bằng Python đúng phép vẽ của game/js/zed_moi.js
# (vũ khí xoay quanh nắm tay theo góc lệch kẹp ±75°, quá thì nghiêng thân trên quanh eo tối đa 12°; ném tay không: cánh tay duỗi (TAY)
# xoay quanh gốc tay) cho THƯƠNG ĐÂM (thuong_2, khung ★) và PHI TIÊU NÉM (phitieu, khung ★) ở 8 hướng, bộ ninja (zed-moi).
# Hàng trên mỗi nhóm: ?huongvk=0 (như trước); hàng dưới: bản mới. Chấm đỏ: hướng nhắm thật.
# Dùng: python3 docs/anh-goc/zed/gan-vk/xem-8-huong.py <ảnh ra .png>
import base64, io, json, math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
S = 4  # điểm ảnh ảnh soát / điểm ảnh game


def nap(ma):
    d = json.load(open(f'{ROOT}/game/art/custom/{ma}.sprite.json'))
    return d, Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')


D, TH = nap('zed-moi')
VD, VK = nap('zed-vk')
for a in D['dong_tac'].values():
    for k in ('hang', 'so', 'hang_tay'):
        if k in a and a[k] is not None: a[k] = int(a[k])
    for k in ('neo', 'vk_cam'):
        if k in a and isinstance(a[k], str): a[k] = json.loads(a[k])
    if 'vk_tl' in a: a['vk_tl'] = float(a['vk_tl'])
VKR = VD['vk'] if isinstance(VD['vk'], dict) else json.loads(VD['vk'].replace("'", '"'))
s = open(f'{ROOT}/game/js/zed_eo_data.js').read()
EO = json.loads(s[s.index('ZED_EO = ') + 9:].rstrip().rstrip(';'))['bo']['moi']
js = open(f'{ROOT}/game/js/zed_moi.js').read()
TAY = json.loads(re.search(r'const TAY = (\{.*?\});\n', js).group(1))['moi']

KEP_DAM, NGHIENG = 75, 12


def lech(rel, co_eo):
    g = max(-KEP_DAM, min(KEP_DAM, rel)); du = abs(rel) - KEP_DAM
    return g, (math.copysign(min(NGHIENG, du * 0.8), rel) if co_eo and du > 0 else 0)


# ma trận affine 2×3 (a, b, c, d, e, f): x' = a x + b y + c ; y' = d x + e y + f
def nhan(A, B):
    a, b, c, d, e, f = A; g, h, i, j, k, l = B
    return (a * g + b * j, a * h + b * k, a * i + b * l + c, d * g + e * j, d * h + e * k, d * i + e * l + f)


def tt(x, y): return (1, 0, x, 0, 1, y)
def xoay(deg): r = math.radians(deg); return (math.cos(r), -math.sin(r), 0, math.sin(r), math.cos(r), 0)
def co(k): return (k, 0, 0, 0, k, 0)
def quanh(px, py, deg): return nhan(tt(px, py), nhan(xoay(deg), tt(-px, -py)))


W, H = 140, 110  # ô vẽ (điểm ảnh game), chân ở (70, 80)


def ve_anh(nen, img, src, M, cat=None):
    """Vẽ vùng src (x, y, w, h) của img qua ma trận M (toạ độ vùng → toạ độ game, gốc chân); cat: hàm mặt nạ (toạ độ game) → bool."""
    x, y, w, h = src
    part = img.crop((int(x), int(y), int(x + w), int(y + h)))
    G = nhan(nhan(tt(W / 2 * S, 80 * S), co(S)), M)  # → điểm ảnh ảnh soát
    a, b, c, d, e, f = G; det = a * e - b * d
    inv = (e / det, -b / det, (b * f - c * e) / det, -d / det, a / det, (c * d - a * f) / det)
    lop = part.transform((W * S, H * S), Image.AFFINE, inv, resample=Image.NEAREST)
    if cat is not None:
        yy, xx = np.mgrid[0:H * S, 0:W * S]
        m = cat((xx + 0.5) / S - W / 2, (yy + 0.5) / S - 80)
        arr = np.array(lop); arr[..., 3] = arr[..., 3] * m; lop = Image.fromarray(arr)
    nen.alpha_composite(lop)


def ve_vk(nen, da, n, i_cap, ang, M0):
    r = VKR[da['vk']][i_cap]; g = da['vk_cam'][i_cap]; F = da['vk_tl']
    M = nhan(M0, nhan(tt(n[0] / 2 - 24, n[1] / 2 - 45), nhan(xoay(ang), nhan(co(F), tt(-g[0], -g[1])))))
    ve_anh(nen, VK, (r[0], r[1], r[2], r[3]), M)


def khung(ten, i, rel, moi, cap=1):
    nen = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    a = D['dong_tac'][ten]; sx, sy = i * 96, a['hang'] * 96
    da = a if a.get('vk') else None
    n = da['neo'][i] if da else None
    e = EO.get(ten, [None] * 9)[i]
    g, lean = lech(rel, e is not None) if moi else (0, 0)
    tay = TAY.get(ten, [None] * 9)[i] if (moi and not da and abs(g) > 0.05) else None
    N = (e[1] / 2 - 24, e[0] / 2 - 45) if (moi and lean and e) else None
    THAN = (0.5, 0, -24, 0, 0.5, -45)  # ô 96 nguồn → điểm ảnh game

    def tren(M, h):
        if not tay:
            ve_anh(nen, TH, (sx, sy, 96, h), nhan(M, THAN)); return
        x0, y0, x1, y1 = tay[2] / 2 - 24, tay[3] / 2 - 45, tay[4] / 2 - 24, tay[5] / 2 - 45
        trong = lambda X, Y: (X >= x0) & (X < x1) & (Y >= y0) & (Y < y1)
        # mặt nạ tính trên toạ độ đã qua M: đổi ngược bằng cách vẽ qua M rồi xét toạ độ trước M (M chỉ là xoay quanh eo → dùng nghịch đảo)
        a_, b_, c_, d_, e_, f_ = M; det = a_ * e_ - b_ * d_
        ngh = lambda X, Y: ((e_ * (X - c_) - b_ * (Y - f_)) / det, (-d_ * (X - c_) + a_ * (Y - f_)) / det)
        ve_anh(nen, TH, (sx, sy, 96, h), nhan(M, THAN), cat=lambda X, Y: ~trong(*ngh(X, Y)))
        Mt = nhan(M, quanh(tay[0] / 2 - 24, tay[1] / 2 - 45, g))
        a2, b2, c2, d2, e2, f2 = Mt; det2 = a2 * e2 - b2 * d2
        ngh2 = lambda X, Y: ((e2 * (X - c2) - b2 * (Y - f2)) / det2, (-d2 * (X - c2) + a2 * (Y - f2)) / det2)
        ve_anh(nen, TH, (sx, sy, 96, h), nhan(Mt, THAN), cat=lambda X, Y: trong(*ngh2(X, Y)))

    I = (1, 0, 0, 0, 1, 0)
    ang = max(-90, min(90, n[2] + g)) if n else 0  # như gocMuot: đâm/ném không quá ±90° so với mặt
    if N:
        yC = e[0] + 1; yL = max(0, yC - 6); ML = quanh(N[0], N[1], lean)
        if da and n[3]: ve_vk(nen, da, n, cap, ang, ML)
        ve_anh(nen, TH, (sx, sy + yL, 96, 96 - yL), nhan(tt(0, yL / 2), THAN))
        tren(ML, yC)
        if da and not n[3]: ve_vk(nen, da, n, cap, ang, ML)
        if da and da.get('hang_tay') is not None: ve_anh(nen, TH, (i * 96, da['hang_tay'] * 96, 96, 96), nhan(ML, THAN))
    else:
        if da and n[3]: ve_vk(nen, da, n, cap, ang, I)
        tren(I, 96)
        if da and not n[3]: ve_vk(nen, da, n, cap, ang, I)
        if da and da.get('hang_tay') is not None: ve_anh(nen, TH, (i * 96, da['hang_tay'] * 96, 96, 96), THAN)
    return nen


def o_huong(ten, i, ux, uy, moi):
    face = 1 if ux > 0.12 else -1 if ux < -0.12 else 1
    rel = max(-90, min(90, math.degrees(math.atan2(uy, ux * face))))
    im = khung(ten, i, rel, moi)
    if face < 0: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    dr = ImageDraw.Draw(im)
    cx, cy = W / 2 * S, (80 - 22) * S  # chấm hướng nhắm thật từ ngực
    for k in range(14, 30, 3):
        dr.ellipse([cx + ux * k * S - 3, cy + uy * k * S - 3, cx + ux * k * S + 3, cy + uy * k * S + 3], fill=(230, 40, 40, 200))
    dr.text((6, 6), f'{ten} k{i}  rel {rel:+.0f}°', fill=(30, 30, 30, 255))
    return im


HUONG = [(1, 0), (1, -1), (0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1)]
TEN = ['phải', 'chéo phải trên', 'lên', 'chéo trái trên', 'trái', 'chéo trái dưới', 'xuống', 'chéo phải dưới']
CAC = [('thuong_2', 2), ('phitieu', 2)]
cw, ch = int(W * S * 0.85), int(H * S * 0.85)
out = Image.new('RGBA', (cw * 8, 40 + len(CAC) * 2 * (ch + 4) + len(CAC) * 24), (236, 236, 228, 255))
dr = ImageDraw.Draw(out)
dr.text((8, 8), 'zed-8-huong: hàng trên = ?huongvk=0 (cũ), hàng dưới = mới. Chấm đỏ = hướng nhắm thật. Bộ ninja, cấp Mầm.', fill=(0, 0, 0, 255))
for j, t in enumerate(TEN): dr.text((j * cw + 8, 24), t, fill=(0, 0, 0, 255))
y = 40
for ten, i in CAC:
    dr.text((8, y + 4), ten + ' (khung ★)', fill=(0, 0, 160, 255)); y += 24
    for moi in (False, True):
        for j, (ux, uy) in enumerate(HUONG):
            l = math.hypot(ux, uy)
            o = o_huong(ten, i, ux / l, uy / l, moi).resize((cw, ch), Image.NEAREST)
            bg = Image.new('RGBA', (cw, ch), (255, 255, 255, 255) if moi else (225, 225, 225, 255)); bg.alpha_composite(o)
            out.alpha_composite(bg, (j * cw, y))
        y += ch + 4
print(out.size)
out.convert('RGB').save(sys.argv[1] if len(sys.argv) > 1 else 'xem-8-huong.png', optimize=True)
