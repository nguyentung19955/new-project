"""Dựng nền gạch từ lưới ký tự (giống G[][] trong game/demo.html) bằng atlas gạch → ảnh RGBA 2x.
Ký tự: '#' đất rễ, 'S' / 'W' đá, '=' ván một chiều, '/' dốc lên sang phải, '\\' dốc xuống, '.' trống.
Tự chọn ô theo 4 ô kề (autotile) – đúng cách game sẽ cần làm."""
import json
import os

import numpy as np
from PIL import Image

from chung import GACH, T2, dan

DAC = set('#SW/\\')


class Gach:
    def __init__(self):
        self.meta = json.load(open(os.path.join(GACH, 'gach-atlas.json'), encoding='utf-8'))
        self.at = np.array(Image.open(os.path.join(GACH, self.meta['anh'])).convert('RGBA'))

    def anh(self, ten):
        x, y, w, h = self.meta['o'][ten]['khung']
        return self.at[y:y + h, x:x + w], self.meta['o'][ten]['ve_lech']


BIEN_THE = {'dat': ['dat-than', 'dat-than-2', 'dat-than-3', 'dat-than-4', 'dat-than-5'],
            'da': ['da-than', 'da-than-2', 'da-than-3']}


def bien_the(pre, x, y):
    """Chọn biến thể thân theo băm toạ độ (cố định, không ngẫu nhiên mỗi lần vẽ)."""
    h = (x * 73856093) ^ (y * 19349663)
    ds = BIEN_THE[pre]
    return ds[(h >> 3) % len(ds)]


def chon_o(G, x, y, ngoai_dac=True):
    """Tên ô cho lưới G (list chuỗi) tại (x,y). Ngoài mép trái/phải/dưới coi là đặc (nền kéo dài ra ngoài)."""
    h, w = len(G), len(G[0])

    def c(xx, yy):
        if yy >= h:
            return G[h - 1][min(max(xx, 0), w - 1)] if ngoai_dac else '.'
        if yy < 0:
            return '.'
        if xx < 0 or xx >= w:
            return G[yy][min(max(xx, 0), w - 1)] if ngoai_dac else '.'
        return G[yy][xx]

    k = c(x, y)
    if k == '.':
        return None
    if k == '=':
        L, R = c(x - 1, y) == '=', c(x + 1, y) == '='
        return 'van-giua' if (L and R) or (not L and not R) else ('van-trai' if not L else 'van-phai')
    if k == '/':
        return 'doc-len'
    if k == '\\':
        return 'doc-xuong'
    pre = 'dat' if k == '#' else 'da'

    def d(xx, yy):
        return c(xx, yy) in DAC and (c(xx, yy) in '/\\' or (c(xx, yy) == '#') == (k == '#'))

    U, D, L, R = d(x, y - 1), d(x, y + 1), d(x - 1, y), d(x + 1, y)
    if c(x, y - 1) in '/\\':
        U = True
    if not U:
        if not D:
            return f'{pre}-noi-giua' if L and R else (f'{pre}-noi-trai' if R else (f'{pre}-noi-phai' if L else f'{pre}-cot-tren'))
        return f'{pre}-tren-giua' if L and R else (f'{pre}-tren-trai' if R else (f'{pre}-tren-phai' if L else f'{pre}-cot-tren'))
    if not D:
        return f'{pre}-day-giua' if L and R else (f'{pre}-day-trai' if R else (f'{pre}-day-phai' if L else f'{pre}-cot-day'))
    if L and R:
        return bien_the(pre, x, y)
    return f'{pre}-canh-trai' if R else (f'{pre}-canh-phai' if L else f'{pre}-cot-than')


def ve_luoi(G, gach=None, ox=0, oy=0, rong=None, cao=None, nen=None):
    """Vẽ lưới → mảng float RGBA (2x). ox, oy: dịch (px 2x) của ô (0,0)."""
    g = gach or Gach()
    h, w = len(G), len(G[0])
    rong = rong or w * T2
    cao = cao or h * T2
    out = nen.astype(np.float64) if nen is not None else np.zeros((cao, rong, 4))
    dsach = []
    for y in range(h):
        for x in range(w):
            t = chon_o(G, x, y)
            if t:
                dsach.append((y, x, t))
    # dưới trước, trên sau: rêu/viền thò lên của mặt trên đè lên đúng chỗ
    for y, x, t in sorted(dsach, key=lambda q: (-q[0] if False else q[0])):
        im, (dx, dy) = g.anh(t)
        out = dan(out, im, ox + x * T2 + dx, oy + y * T2 + dy)
    return out, dsach
