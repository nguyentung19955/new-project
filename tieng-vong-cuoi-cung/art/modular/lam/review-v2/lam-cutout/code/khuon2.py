"""Khuôn cutout Lam v2 – dựng bằng code, có số liệu khớp rõ ràng.

Đơn vị: px "thế giới" = tỉ lệ ảnh mẫu nhìn ngang đã thu (Lam cao ~470 px).
Mỗi mảnh: mask + bản đồ vật liệu (lớp màu) + điểm xoay P (gần) / D (xa).
Chiều dài xương = |D-P|. Kích thước ảnh gồm cả phần bị che.
"""
import math, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

# ---------- palette chung (lấy từ ảnh mẫu) ----------
PAL = {
    'ink': (12, 10, 14), 'den': (8, 6, 10),
    'xanh': (25, 67, 157), 'xanh_bong': (16, 41, 100),
    'ngoc': (51, 210, 194), 'ngoc_bong': (30, 166, 154),
    'nau': (131, 84, 50), 'nau_bong': (104, 65, 38), 'nau_toi': (58, 39, 16),
    'vang_dong': (240, 174, 24), 'mat': (253, 237, 78),
    'thep': (227, 227, 227), 'thep_bong': (156, 155, 155),
}
CLS = list(PAL)
GREY = {'ink': 25, 'den': 45, 'xanh': 190, 'xanh_bong': 160, 'ngoc': 215, 'ngoc_bong': 185, 'nau': 175,
        'nau_bong': 150, 'nau_toi': 110, 'vang_dong': 225, 'mat': 245, 'thep': 240, 'thep_bong': 200}
FAR = 0.82          # phía xa: cùng palette, tối đi 18 %
T_LINE = 8          # độ dày viền (px thế giới) – duyệt lại ở cỡ 112 px

SRC = {}            # ảnh gốc từ bảng 24 mảnh (bảng ChatGPT thứ 3)
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def src(n): return Image.open(os.path.join(HERE, 'manh-goc', n + '.png')).convert('RGBA')

def classify(img, allow):
    a = np.array(img).astype(float); al = a[..., 3] > 127
    cols = np.array([PAL[c] for c in allow], float)
    d = ((a[..., None, :3] - cols[None, None]) ** 2).sum(-1)
    idx = np.argmin(d, -1)
    return al, idx, allow

def ring(mask, t, exposed=None):
    d = ndimage.distance_transform_edt(np.pad(mask, 2))[2:-2, 2:-2]
    r = mask & (d <= t)
    if exposed is not None: r &= exposed
    return r

class Piece:
    def __init__(s, name, mask, cls, allow, P, D=None, extra=None, no_line=None, eye=False):
        s.name, s.mask, s.cls, s.allow, s.P, s.D = name, mask, cls, allow, P, D
        s.extra = extra or {}
        if not eye:
            exposed = None
            if no_line is not None: exposed = ~no_line
            r = ring(mask, T_LINE, exposed)
            s.cls = s.cls.copy(); s.cls[r] = allow.index('ink')
    def rgba(s, mode='mau', far=False):
        H, W = s.mask.shape; o = np.zeros((H, W, 4), np.uint8)
        for i, c in enumerate(s.allow):
            m = s.mask & (s.cls == i)
            if mode == 'xam': o[m, :3] = GREY[c]
            else:
                col = np.array(PAL[c], float)
                if far and c not in ('ink', 'den'): col = col * FAR
                o[m, :3] = col.astype(np.uint8)
        o[s.mask, 3] = 255
        return Image.fromarray(o)
    def bone(s): return None if s.D is None else float(np.hypot(*np.subtract(s.D, s.P)))

def from_src(name, k, allow, P, D=None, eye=False, smooth=True):
    im = src(name); im = im.resize((round(im.width*k), round(im.height*k)), Image.LANCZOS)
    al, idx, allow = classify(im, allow)
    if smooth: al = ndimage.binary_opening(ndimage.binary_closing(al, iterations=1), iterations=1)
    return Piece(name, al, idx, allow, P, D, eye=eye)

BODY = 0.65
BLUE = ['ink', 'den', 'xanh', 'xanh_bong']
TEAL = ['ink', 'ngoc', 'ngoc_bong', 'xanh', 'xanh_bong']
BROWN = ['ink', 'nau', 'nau_bong', 'nau_toi']

# ---------- A. mũ chính + chóp riêng ----------
def hood_pieces():
    im = src('mu')   # tỉ lệ 1.0
    allow = ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong']
    al, idx, allow = classify(im, allow)
    H, W = al.shape; yy, xx = np.mgrid[:H, :W]
    # đường cắt: gần thẳng đứng qua chân chóp (x≈92 ở y=0 → x≈88 ở y=140)
    cutx = 92 - 0.03 * yy
    zone = yy < 150
    side = xx - cutx                 # <0: phía chóp
    tip = al & zone & (side < 30)    # chóp + 30 px phần dư phủ lên mũ
    main = al & ~(zone & (side < -16))
    # vùng nối kín: bo tròn mép cắt của mũ chính (nằm dưới chóp)
    seam_main = main & zone & (side < 0)
    main = ndimage.binary_closing(main, iterations=3) & (al | seam_main)
    # mép cắt không kẻ viền (luôn bị chóp phủ / trùng mũ)
    orig_edge = ring(al, T_LINE + 2)          # chỉ kẻ viền ở mép thật của mũ gốc
    cut_main = ~orig_edge
    cut_tip = ~orig_edge
    pm = Piece('mu', main, idx, allow, P=(205, 250), no_line=cut_main)
    pt = Piece('chop-mu', tip, idx, allow, P=(80, 95), no_line=cut_tip)
    # giữ nét trong gốc của mũ (mép mặt, nếp) thay vì chỉ viền ngoài
    for p in (pm, pt):
        orig_ink = p.mask & (idx == allow.index('ink'))
        p.cls[orig_ink] = allow.index('ink')
    # dưới vùng chóp phủ: mũ chính không giữ nét cũ (tránh vạch đen thò ra khi chóp lắc)
    under = pm.mask & zone & (side < 30)
    inner = under & (ndimage.distance_transform_edt(np.pad(pm.mask, 2))[2:-2, 2:-2] > T_LINE)
    pm.cls[inner & (pm.cls == allow.index('ink'))] = allow.index('xanh_bong')
    pm.cls[under & ~inner & (side < -6)] = allow.index('xanh_bong')
    ys, xs = np.nonzero(pt.mask); y0, x0 = ys.min(), xs.min()
    pt.mask = pt.mask[y0:ys.max()+1, x0:xs.max()+1]; pt.cls = pt.cls[y0:ys.max()+1, x0:xs.max()+1]
    pt.P = (80 - x0, 95 - y0); pt.extra['goc_trong_mu'] = [int(x0), int(y0)]
    return pm, pt

# ---------- B. đùi / cẳng chân: đoạn vải đơn giản, nắp tròn đồng tâm ----------
def segment(name, L, w0, w1, ext0, r1, cap1_visible, shade_side=1):
    """Đoạn chi dọc (trục y), khớp gần P ở (cx, ext0), khớp xa D ở (cx, ext0+L).
    w0: bề rộng ở khớp gần, w1: ở khớp xa. ext0: phần dư phía trên P (bị che).
    r1: bán kính nắp tròn tại D (đồng tâm khớp)."""
    pad = 4; Wd = int(max(w0, w1, 2*r1) + 2*pad); cx = Wd/2
    Hh = int(ext0 + L + r1 + 2*pad)
    P = (cx, pad + ext0); D = (cx, pad + ext0 + L)
    yy, xx = np.mgrid[:Hh, :Wd].astype(float)
    t = np.clip((yy - P[1]) / L, 0, 1); half = (w0 + (w1 - w0)*t)/2
    body = (np.abs(xx - cx) <= half) & (yy >= pad) & (yy <= D[1])
    top_r = w0/2; tc = P[1] if ext0 >= top_r else pad + top_r
    top_cap = np.hypot(xx-cx, yy-tc) <= top_r
    body &= (yy >= tc) | top_cap
    cap = np.hypot(xx-cx, yy-D[1]) <= r1
    mask = body | cap
    allow = ['ink', 'xanh', 'xanh_bong']
    cls = np.full(mask.shape, 1)
    shade = (xx - cx) * shade_side > half*0.25      # dải bóng một bên, như cel shading của mẫu
    cls[shade] = 2
    return Piece(name, mask, cls, allow, P=P, D=D)

def build():
    pc = {}
    pc['mu'], pc['chop-mu'] = hood_pieces()
    pc['mat'] = from_src('mat', 0.5, ['mat'], P=(12, 23), eye=True)
    pc['than'] = from_src('than', BODY, BLUE, P=(57, 56))
    for n in ('capelet-sau', 'capelet-truoc', 'vat-sau', 'vat-truoc'):
        pc[n] = from_src(n, BODY, TEAL, P=None)
    pc['dai'] = from_src('dai', BODY, BROWN, P=None)
    pc['bao-dao'] = from_src('bao-dao', BODY, BROWN, P=None)
    pc['chuong'] = from_src('chuong', BODY, ['ink', 'vang_dong', 'nau_bong', 'nau_toi'], P=(22, 4))
    pc['dao'] = from_src('dao', BODY, ['ink', 'nau', 'nau_bong', 'vang_dong', 'thep', 'thep_bong'], P=(21, 38))
    # tay: giữ dáng bảng 3, khớp đặt tường minh (không lấy mép ảnh)
    for s in ('gan', 'xa'):
        pc['tay-tren-'+s] = from_src('tay-tren-'+s, BODY, BLUE[1:] and ['ink', 'xanh', 'xanh_bong'], P=(53, 18), D=(29, 57))
        pc['cang-tay-'+s] = from_src('cang-tay-'+s, BODY, ['ink', 'xanh', 'xanh_bong'], P=(14, 27), D=(56, 43))
        pc['gang-'+s] = from_src('gang-'+s, BODY, BROWN, P=(19, 36), D=(58, 36))
        pc['ung-'+s] = from_src('ung-'+s, BODY, BROWN, P=(34, 16), D=(34, 58))
    # chân mới: xương đùi 47, cẳng 38 (như bản ráp đã khớp ảnh mẫu); phần dư không cộng vào xương
    for s in ('gan', 'xa'):
        pc['dui-'+s] = segment('dui-'+s, L=47, w0=50, w1=38, ext0=18, r1=18, cap1_visible=False)
        pc['cang-chan-'+s] = segment('cang-chan-'+s, L=38, w0=46, w1=36, ext0=23, r1=18, cap1_visible=True)
    return pc

ORDER = [['mu', 'mat', 'chop-mu', 'than', 'capelet-sau', 'capelet-truoc'],
         ['vat-sau', 'vat-truoc', 'dai', 'bao-dao', 'chuong', 'dao'],
         ['tay-tren-gan', 'cang-tay-gan', 'gang-gan', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa'],
         ['dui-gan', 'cang-chan-gan', 'ung-gan', 'dui-xa', 'cang-chan-xa', 'ung-xa']]

def sheet(pc, mode='xam', W=1536, H=1024):
    t = Image.new('RGB', (W, H), 'white'); meta = {}
    RH = [330, 230, 230, 234]; y = 0
    for row, rh in zip(ORDER, RH):
        widths = [380, 110, 230, 260, 280, 276] if row[0] == 'mu' else [256]*6
        x = 0
        for n, cw in zip(row, widths):
            p = pc[n]; im = p.rgba(mode, far=n.endswith('-xa') and mode == 'mau')
            ox, oy = x + (cw - im.width)//2, y + (rh - im.height)//2
            t.paste(im, (ox, oy), im)
            meta[n] = dict(x=ox, y=oy, w=im.width, h=im.height,
                           P=None if p.P is None else [round(p.P[0], 1), round(p.P[1], 1)],
                           D=None if p.D is None else [round(p.D[0], 1), round(p.D[1], 1)],
                           xuong=None if p.bone() is None else round(p.bone(), 1))
            x += cw
        y += rh
    return t, meta
