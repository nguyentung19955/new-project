"""Thư viện nhỏ vẽ pixel art theo bảng màu cố định (palette.json).

Ảnh = mảng chỉ số màu (int8), -1 = trong suốt. Mọi hàm đều làm việc theo LƯỚI điểm ảnh
(1 phần tử = 1 điểm ảnh sprite = 3 px logic trong game).
"""
import json, os
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # art/huong-moi/lam-pixel
PAL = json.load(open(os.path.join(GOC, 'palette.json'), encoding='utf-8'))['mau']
KY = {m['ky']: i for i, m in enumerate(PAL)}          # ký tự ASCII → chỉ số
TEN = {m['ten']: i for i, m in enumerate(PAL)}        # tên → chỉ số
RGB = np.array([[int(m['hex'][i:i + 2], 16) for i in (1, 3, 5)] for m in PAL], dtype=np.int32)


def k(c):
    """chỉ số màu từ ký tự hoặc tên"""
    return KY[c] if c in KY else TEN[c]


class Anh:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.a = np.full((h, w), -1, dtype=np.int16)

    def copy(self):
        n = Anh(self.w, self.h); n.a = self.a.copy(); return n

    def dat(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.a[y, x] = c if isinstance(c, (int, np.integer)) else k(c)

    def lay(self, x, y):
        return self.a[y, x] if 0 <= x < self.w and 0 <= y < self.h else -1

    def ascii(self, rows, x0, y0, chi_de_len=None):
        """dán bản vẽ ASCII ('.' hoặc ' ' = bỏ qua)"""
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch in '. ':
                    continue
                if chi_de_len is not None and self.lay(x0 + i, y0 + j) not in chi_de_len:
                    continue
                self.dat(x0 + i, y0 + j, ch)

    def dan(self, b, x0, y0):
        """dán ảnh b (bỏ ô trong suốt)"""
        for j in range(b.h):
            for i in range(b.w):
                c = b.a[j, i]
                if c >= 0:
                    self.dat(x0 + i, y0 + j, int(c))

    def hcn(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.dat(x, y, c)

    def duong(self, x0, y0, x1, y1, c):
        """đoạn thẳng Bresenham (đúng lưới, không khử răng cưa)"""
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        e = dx + dy
        pts = []
        while True:
            self.dat(x0, y0, c); pts.append((x0, y0))
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * e
            if e2 >= dy:
                e += dy; x0 += sx
            if e2 <= dx:
                e += dx; y0 += sy
        return pts

    def vien_ngoai(self, c='k', cheo=False):
        """viền 1 điểm ảnh BÊN NGOÀI hình (4 hướng, hoặc 8 hướng nếu cheo)"""
        m = self.a >= 0
        n = np.zeros_like(m)
        n[1:, :] |= m[:-1, :]; n[:-1, :] |= m[1:, :]; n[:, 1:] |= m[:, :-1]; n[:, :-1] |= m[:, 1:]
        if cheo:
            n[1:, 1:] |= m[:-1, :-1]; n[1:, :-1] |= m[:-1, 1:]; n[:-1, 1:] |= m[1:, :-1]; n[:-1, :-1] |= m[1:, 1:]
        self.a[n & ~m] = k(c)

    def lat(self):
        n = self.copy(); n.a = self.a[:, ::-1].copy(); return n

    def rgba(self):
        out = np.zeros((self.h, self.w, 4), dtype=np.uint8)
        m = self.a >= 0
        out[m, :3] = RGB[self.a[m]]
        out[m, 3] = 255
        return Image.fromarray(out, 'RGBA')

    def luu(self, p, phong=1):
        im = self.rgba()
        if phong != 1:
            im = im.resize((self.w * phong, self.h * phong), Image.NEAREST)
        im.save(p)


def tu_rgba(im):
    """ảnh RGBA đã đúng bảng màu → Anh (màu lạ → gần nhất)"""
    a = np.asarray(im.convert('RGBA')).astype(np.int32)
    out = Anh(a.shape[1], a.shape[0])
    m = a[..., 3] >= 128
    if m.any():
        px = a[m][:, :3]
        d = ((px[:, None, :] - RGB[None, :, :]) ** 2 * np.array([3, 4, 2])).sum(-1)
        out.a[m] = d.argmin(1)
    return out


def gan_nhat(rgb_arr):
    """mảng N×3 RGB → chỉ số màu bảng gần nhất (trọng số mắt người)"""
    px = np.asarray(rgb_arr, dtype=np.int32).reshape(-1, 3)
    d = ((px[:, None, :] - RGB[None, :, :]) ** 2 * np.array([3, 4, 2])).sum(-1)
    return d.argmin(1)
