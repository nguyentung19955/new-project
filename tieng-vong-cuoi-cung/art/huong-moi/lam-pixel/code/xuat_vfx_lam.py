#!/usr/bin/env python3
"""XUẤT ĐIỂM VFX CHÉM 1-2-3 của Lam chibi → game/thu-pixellab/vfx-lam.js

Tính lại ĐÚNG các cung âm thanh đã duyệt trong bản xem thử (chibi/v3/chem1-se/hybrid/lam-chem1.py, chibi/v3/lam-chem23.py,
các file *-xem-vfx.png) – cùng toạ độ, cùng màu – nhưng KHÔNG vẽ vào sprite: chỉ ghi danh sách điểm [x, y, màu] theo từng hình
(toạ độ điểm trong khung 64×64 gốc, mặt phải). vfx.js vẽ các điểm này lên trên Lam, lật gương khi quay trái.
Chạy từ thư mục tieng-vong-cuoi-cung/:  python3 art/huong-moi/lam-pixel/code/xuat_vfx_lam.py
"""
import json, math, os
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
V3 = os.path.join(GOC, 'art/huong-moi/lam-pixel/chibi/v3')
RA = os.path.join(GOC, 'game/thu-pixellab/vfx-lam.js')

AM = (255, 190, 80, 255); CY = (120, 230, 230, 255); CY2 = (70, 150, 160, 255); WH = (255, 244, 200, 255)
MAU = [AM, CY, CY2, WH]
S = (214, 220, 228); H = (240, 244, 250)   # bạc nĩa (vòng sáng không đè lên nĩa)


class Ve:
    def __init__(self, f):
        self.c = Image.new('RGBA', (96, 64)); self.c.alpha_composite(f, (0, 0)); self.d = {}

    def put(self, x, y, col):
        if 0 <= x < 96 and 0 <= y < 64:
            self.c.putpixel((x, y), col); self.d.pop((x, y), None); self.d[(x, y)] = MAU.index(col)

    def ds(self):
        return [[x, y, k] for (x, y), k in self.d.items()]


def arc_pts(cx, cy, h, w):
    pts = set()
    for t in range(-40, 41):
        u = t / 40; pts.add((cx + round(w * (1 - u * u)), cy + round(u * h / 2)))
    return pts


def diag_arc(v, x0, y0, x1, y1, bow, col, col2=None):
    n = 40
    for i in range(n + 1):
        u = i / n; x = x0 + (x1 - x0) * u; y = y0 + (y1 - y0) * u
        dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = dy / L, -dx / L
        b = bow * 4 * u * (1 - u); px, py = round(x + nx * b), round(y + ny * b)
        v.put(px, py, col)
        if col2: v.put(px - 1, py + 1, col2)


def ring(v, cx, cy, r, col):
    c = v.c
    for t in range(0, 360, 6):
        a = math.radians(t); x, y = round(cx + r * math.cos(a)), round(cy + r * math.sin(a) * 0.8)
        if 0 <= x < c.width and 0 <= y < c.height and c.getpixel((x, y))[:3] in [S, H]: continue
        if x >= 37 and any(0 <= x + dx < c.width and 0 <= y + dy < c.height and c.getpixel((x + dx, y + dy))[:3] in [S, H]
                           for dx in (-1, 0, 1) for dy in (-1, 0, 1)): continue
        v.put(x, y, col)


def broken_arc(v, cx, cy, r, col, a0=-60, a1=61, step=3, gap=4):
    for k, t in enumerate(range(a0, a1, step)):
        if (k // gap) % 2: continue
        a = math.radians(t); v.put(round(cx + r * math.cos(a)), round(cy + r * math.sin(a) * 1.1), col)


def hinh(thu, ten, i):
    return Image.open(os.path.join(V3, thu, '%s-%d.png' % (ten, i))).convert('RGBA')


OUT = {}
# Chém 1: F3 (hình 2) lõi amber + viền cyan · F4 (hình 3) cyan mờ · rồi tắt
v = Ve(hinh('chem1-se/hybrid', 'chem1', 2))
for x, y in arc_pts(55, 44, 20, 6): v.put(x, y, CY); v.put(x - 1, y, AM)
a = v.ds()
v = Ve(hinh('chem1-se/hybrid', 'chem1', 3))
for x, y in arc_pts(58, 46, 18, 6): v.put(x, y, CY2)
OUT['chem1'] = {2: a, 3: v.ds()}
# Chém 2: cung chéo thấp → cao phía trước
v = Ve(hinh('chem2-se', 'chem2', 2)); diag_arc(v, 49, 50, 58, 30, 4, CY, AM); a = v.ds()
v = Ve(hinh('chem2-se', 'chem2', 3)); diag_arc(v, 51, 46, 60, 26, 4, CY2)
OUT['chem2'] = {2: a, 3: v.ds()}
# Chém 3: F3–F4 chuông tích sáng · F5 sóng âm kép + vòng đứt quanh chuông · F6 dư âm, vòng ngoài dịch ra 4 điểm
v = Ve(hinh('chem3-se', 'chem3', 2)); ring(v, 35, 44, 5, AM); c2 = v.ds()
v = Ve(hinh('chem3-se', 'chem3', 3)); ring(v, 35, 44, 5, WH); ring(v, 35, 44, 8, AM); c3 = v.ds()
v = Ve(hinh('chem3-se', 'chem3', 4))
for r, col in [(8, CY), (7, AM)]: broken_arc(v, 52, 45, r, col, step=4, gap=99)
broken_arc(v, 52, 45, 13, CY, gap=3); broken_arc(v, 35, 44, 11, CY2, a0=-50, a1=51, gap=3); c4 = v.ds()
v = Ve(hinh('chem3-se', 'chem3', 5)); broken_arc(v, 54, 46, 10, CY2, step=4, gap=99); broken_arc(v, 56, 46, 17, CY2, gap=3)
OUT['chem3'] = {2: c2, 3: c3, 4: c4, 5: v.ds()}

js = ("'use strict';\n/* vfx-lam.js – DO art/huong-moi/lam-pixel/code/xuat_vfx_lam.py GHI, đừng sửa tay.\n"
      "   Điểm VFX chém 1-2-3 Lam chibi: VFX_LAM.<clip>[hình] = [[x, y, màu], …] (điểm trong khung 64×64 gốc, mặt phải, neo chân (32, 61)).\n"
      "   màu: 0 amber · 1 cyan · 2 cyan mờ · 3 trắng ấm. */\n"
      "const VFX_LAM = {\n neo: [32, 61],\n mau: ['#ffbe50', '#78e6e6', '#4696a0', '#fff4c8'],\n")
for ten, d in OUT.items():
    js += ' %s: {\n' % ten + ',\n'.join('  %d: %s' % (k, json.dumps(p, separators=(',', ':'))) for k, p in d.items()) + '\n },\n'
js = js.rstrip(',\n') + '\n};\n'
open(RA, 'w', encoding='utf-8').write(js)
print('Đã ghi', os.path.relpath(RA, GOC), {t: {k: len(p) for k, p in d.items()} for t, d in OUT.items()})
