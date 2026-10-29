#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rig tham chiếu CHẠY 12 hình cho Lam (dựng bằng code) – dùng làm ảnh tư thế đưa ChatGPT vẽ nhân vật.

Chạy (từ thư mục tieng-vong-cuoi-cung/):
    python3 art/huong-moi/rig-tham-chieu/code/rig_chay.py

Ra (trong art/huong-moi/rig-tham-chieu/):
    rig-chay-12.png            12 ô, 2 hàng × 6, nền trắng, số nhỏ ở mép ô  ← đính kèm ChatGPT
    rig-chay-12-1hang.png      12 ô một hàng
    rig-chay-12.json           toạ độ từng khớp từng hình (đơn vị logic, đất y = 0, chậu x = 0, y hướng LÊN)
    xem/rig-chay-toc-do.gif    chạy tại chỗ đúng tốc độ (12 hình / 0,5 s = 264 px/s, 132 px/vòng)
    xem/rig-chay-cham4.gif     như trên, chậm 4 lần
    xem/rig-chong-lam-chot.png rig chồng lên Lam chốt cùng tỉ lệ (kiểm đầu/thân)
    xem/so-nhip-sheet8-rig12.gif (+ -cham4)  so nhịp với sheet chạy 8 hình đang dùng

Quy ước (đúng docs/KINH-NGHIEM-GEN-CHUYEN-DONG-BANG-RIG.md):
    nhìn ngang, mặt hướng PHẢI; phía trước = bên phải ảnh.
    tay/chân GẦN máy quay = bên TRÁI cơ thể = CAM, vẽ TRƯỚC thân.
    tay/chân XA = bên PHẢI cơ thể = XANH DƯƠNG, vẽ SAU thân.
    đầu + thân = XANH NGỌC. Khối mũ + áo choàng = viền xám nhạt (hình bao). Mặt đất = một đường.
Đơn vị: 1 đơn vị = 1 px logic của game (Lam cao 112).
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.interpolate import CubicSpline

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))   # tieng-vong-cuoi-cung/
RA = os.path.join(GOC, 'art', 'huong-moi', 'rig-tham-chieu')
XEM = os.path.join(RA, 'xem')
LAM_CHOT = os.path.join(GOC, 'art', 'huong-moi', 'nguon', 'lam-moi-chuong-tan.png')
SHEET_CHAY = os.path.join(GOC, 'art', 'huong-moi', 'lam-tu-the-2', 'sprite', 'lam-moi3-chay-2x')

# ---------------------------------------------------------------- số liệu chung
N = 12                       # số hình / vòng
VONG = 132.0                 # px logic / vòng (game)
BUOC = VONG / N              # 11 px mỗi hình: đất lùi 11 đơn vị mỗi hình
TOC_DO = 264.0               # px/s → 1 vòng = 0,5 s, 1 hình = 41,67 ms
MS_HINH = 1000.0 * VONG / TOC_DO / N

# độ dài xương (không đổi qua mọi hình)
DUI, CANG = 16.5, 15.5       # đùi, cẳng chân
CANH_TAY, CANG_TAY = 12.0, 11.0
THAN = 21.0                  # chậu → ngực (gốc vai)
CO = 4.5                     # ngực → cổ
CHAU_Y = 31.0                # chiều cao chậu trung bình
NHUN = 2.0                   # ± (lấy mẫu 12 hình → tổng nhún ~3,5 đơn vị; (mục tiêu 3–4)
NGHIENG = 10.0               # thân nghiêng trước (độ)
# bàn chân (hệ toạ độ bàn chân, gốc = cổ chân): gót, mũi
GOT = np.array([-2.5, -3.0])
MUI = np.array([6.0, -3.0])
DAO_DAI = 30.0               # Âm Đao từ nắm tay tới mũi (cùng cỡ ảnh Lam chốt)

TEN_HINH = ['tiếp đất GẦN', 'hạ', 'giữa', 'đẩy', 'bay', 'chuyển',
            'tiếp đất XA', 'hạ', 'giữa', 'đẩy', 'bay', 'chuyển']

# màu
CAM = (240, 128, 24)
XANH_DUONG = (40, 96, 220)
XANH_NGOC = (0, 160, 150)
VIEN = (190, 190, 190)
NEN_KHOI = (243, 243, 243)
DAT = (90, 90, 90)
DAO = (110, 110, 118)


def R(goc_do, v):
    a = math.radians(goc_do)
    c, s = math.cos(a), math.sin(a)
    return np.array([c * v[0] - s * v[1], s * v[0] + c * v[1]])


# ---------------------------------------------------------------- quỹ đạo chân GẦN (x so với chậu, y trên đất)
def chau_y(f):
    """thấp nhất ở f = 1,5 / 7,5 (sau tiếp đất), cao nhất ở f = 4,5 / 10,5 (bay)."""
    return CHAU_Y - NHUN * math.cos(2 * math.pi * 2 * (f - 1.5) / N)


def chan_tru(f):
    """Chân gần chạm đất ở hình 0–3. Đất cố định trong thế giới; chậu đi tới 11/hình
    → toạ độ so với chậu = thế giới − 11·f. Gót / bàn / mũi khoá đúng điểm đất."""
    got_tg = 14.5                     # gót (thế giới) khi bàn chân phẳng
    mui_tg = got_tg + (MUI[0] - GOT[0])
    lui = BUOC * f
    if f == 0:                        # gót chạm, mũi hơi nâng 12°, xoay quanh gót
        th = 12.0
        A = np.array([got_tg - lui, 0.0]) - R(th, GOT)
    elif f in (1, 2):                 # bàn phẳng
        th = 0.0
        A = np.array([got_tg - lui, 0.0]) - GOT
    elif f == 3:                      # nhón mũi đẩy, xoay quanh mũi
        th = -35.0
        A = np.array([mui_tg - lui, 0.0]) - R(th, MUI)
    return A, th


def quy_dao_chan():
    """Spline tuần hoàn (x, y, góc bàn chân) qua 4 điểm trụ chính xác + điểm neo pha vung."""
    t, P = [], []
    for f in range(4):
        A, th = chan_tru(f)
        t.append(f); P.append([A[0], A[1], th])
    neo = [(5.0, -13.0, 12.0, -62.0),     # gót đá lên sau (vừa phải: chibi bước ngắn, áo che)
           (7.0, 2.0, 13.0, -35.0),       # gối đưa qua dưới chậu
           (9.0, 14.0, 9.5, -2.0),        # đùi trước, cẳng bắt đầu duỗi
           (10.5, 17.0, 6.5, 8.0)]        # với tới, hạ dần
    for f, x, y, th in neo:
        t.append(f); P.append([x, y, th])
    A0, th0 = chan_tru(0)
    t.append(N); P.append([A0[0], A0[1], th0])
    return CubicSpline(np.array(t), np.array(P), bc_type='periodic')


SP_CHAN = quy_dao_chan()


def chan(f):
    f = f % N
    if f in (0, 1, 2, 3):
        return chan_tru(int(f))
    x, y, th = SP_CHAN(f)
    y = max(y, 3.3)                    # lúc vung không chạm đất
    return np.array([x, y]), float(th)


def ik(goc, dich, L1, L2, khop_truoc=True):
    """2 xương; khop_truoc: gối hướng tới trước (+x). Trả khớp giữa."""
    d = dich - goc
    dd = float(np.hypot(*d))
    dd = min(dd, L1 + L2 - 1e-3)
    a = math.acos(max(-1, min(1, (L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd))))
    huong = math.atan2(d[1], d[0])
    # gối trước: chọn bên làm khớp có x lớn hơn
    c1 = goc + L1 * np.array([math.cos(huong + a), math.sin(huong + a)])
    c2 = goc + L1 * np.array([math.cos(huong - a), math.sin(huong - a)])
    return (c1 if c1[0] > c2[0] else c2) if khop_truoc else (c1 if c1[0] < c2[0] else c2)


# ---------------------------------------------------------------- dựng một hình
def tu_the(f):
    p = 2 * math.pi * f / N
    chau = np.array([0.0, chau_y(f)])
    ng = NGHIENG + 0.8 * math.cos(2 * p * 1 + 0.5)          # thân nghiêng ~10° ± 0,8
    truc = R(-ng, np.array([0.0, 1.0]))                     # quay theo chiều kim đồng hồ = ngả trước
    nguc = chau + THAN * truc
    co = nguc + CO * truc
    J = {'chau': chau, 'nguc': nguc, 'co': co}
    # hông (hai khớp hông lệch nhẹ để thấy được)
    J['hong_gan'] = chau + np.array([0.8, -1.5])
    J['hong_xa'] = chau + np.array([-0.8, -1.5])
    for ben, lech in (('gan', 0), ('xa', N // 2)):
        A, th = chan(f + lech)
        J['co_chan_' + ben] = A
        J['goi_' + ben] = ik(J['hong_' + ben], A, DUI, CANG, True)
        J['got_' + ben] = A + R(th, GOT)
        J['ban_chan_' + ben] = A + R(th, MUI)
        J['goc_ban_' + ben] = th
    # vai
    J['vai_gan'] = nguc + np.array([1.5, -0.8])
    J['vai_xa'] = nguc + np.array([-1.5, -0.8])
    # tay GẦN cầm Âm Đao: nắm tay thấp trước hông, dao động nhỏ ngược pha chân gần
    co_tay = np.array([12.5 - 1.3 * math.cos(p), 31.0 + 0.7 * math.sin(p)]) + np.array([0, chau[1] - CHAU_Y]) * 0.6
    J['co_tay_gan'] = co_tay
    J['khuyu_gan'] = ik(J['vai_gan'], co_tay, CANH_TAY, CANG_TAY, khop_truoc=False)
    goc_dao = -7.0 + 1.5 * math.sin(p + 0.6)
    J['goc_dao'] = goc_dao
    J['mui_dao'] = co_tay + R(goc_dao, np.array([DAO_DAI, 0.0]))
    # tay XA: vung ngược pha chân xa (chân gần trước ⇒ chân xa sau ⇒ tay xa trước)
    a = 38.0 * math.cos(p)                                 # + = vung tới trước
    b = 78.0 + 14.0 * math.cos(p)                          # gập khuỷu
    J['khuyu_xa'] = J['vai_xa'] + CANH_TAY * np.array([math.sin(math.radians(a)), -math.cos(math.radians(a))])
    J['co_tay_xa'] = J['khuyu_xa'] + CANG_TAY * np.array([math.sin(math.radians(a + b)), -math.cos(math.radians(a + b))])
    # đầu: tâm khối đầu + mắt, gắn cứng với cổ, nghiêng nửa thân
    ngd = ng * 0.4
    J['dau'] = co + R(-ngd, np.array([8.0, 14.5]))
    J['mat'] = co + R(-ngd, np.array([15.0, 16.0]))
    J['goc_dau'] = -ngd
    J['goc_than'] = -ng
    J['f'] = f
    return J


# ---------------------------------------------------------------- hình bao mũ (lấy từ Lam chốt) + áo choàng
def khoi_mu():
    """Đường bao mũ từ ảnh Lam chốt, quy về đơn vị logic, gốc = cổ (dây chuông)."""
    a = np.asarray(Image.open(LAM_CHOT).convert('RGB')).astype(int)
    m = a.min(2) < 200
    ys, xs = np.where(m)
    y0, y1 = ys.min(), ys.max()
    k = (y1 - y0) / 112.0                  # px ảnh / đơn vị
    goc_x, co_y = 640.0, 625.0             # cổ (dây chuông) trong ảnh chốt
    trai, phai = [], []
    for y in range(int(y0) + 2, 606, 12):
        r = np.where(m[y])[0]
        if len(r) == 0:
            continue
        # bỏ chóp/vạt mũ tách rời? giữ cả: đó là hình bao
        trai.append(((r.min() - goc_x) / k, (co_y - y) / k))
        phai.append(((r.max() - goc_x) / k, (co_y - y) / k))
    pts = phai + trai[::-1]
    return [np.array(p) for p in pts], k


MU, K_CHOT = khoi_mu()


def khoi_ao_goc():
    """Đường bao áo choàng từ Lam chốt (đứng): mỗi hàng lấy mép trái/phải; bỏ phần tay + Âm Đao chìa ra trước."""
    a = np.asarray(Image.open(LAM_CHOT).convert('RGB')).astype(int)
    m = a.min(2) < 200
    ys, _ = np.where(m)
    y0, y1 = ys.min(), ys.max()
    k = (y1 - y0) / 112.0
    phai, trai = [], []
    for y in range(610, int(y1) - 20, 12):
        r = np.where(m[y])[0]
        if len(r) == 0:
            continue
        xp = r.max()
        if 840 <= y <= 1000:
            xp = min(xp, 640 + 19 * k)
        phai.append(((xp - 640) / k, (y1 - y) / k))
        trai.append(((r.min() - 640) / k, (y1 - y) / k))
    return phai, trai


AO_PHAI, AO_TRAI = khoi_ao_goc()


def khoi_ao(J):
    """Áo choàng dài che gần hết chân (gấu ~4,5 trên đất, chỉ lộ mũi ủng). Lấy hình Lam chốt, ngả theo thân,
    tà sau kéo về sau theo tốc độ + lắc nhẹ 2 lần / vòng, gấu trước bị chân đẩy nhẹ."""
    f = J['f']
    p = 2 * math.pi * f / N
    lac = 1.5 * math.sin(2 * p)
    dy = J['chau'][1] - CHAU_Y
    goc = J['goc_than'] * 0.5
    tam = np.array([0.0, CHAU_Y])

    def bien(pt, sau):
        x, y = pt
        q = tam + R(goc, np.array([x, y]) - tam)
        q[1] += dy * max(0.0, min(1.0, (y - 5) / 40))
        h = max(0.0, (42 - y) / 42)
        q[0] -= h * ((5.0 + lac) if sau else 2.0)
        q[1] = max(q[1], 4.5 + (1.5 * h if sau else 0))
        return q
    return [bien(pt, False) for pt in AO_PHAI] + [bien(pt, True) for pt in AO_TRAI[::-1]]


# ---------------------------------------------------------------- vẽ
class Ve:
    def __init__(self, w, h, ty_le, goc_x, dat_y, ss=4):
        self.ss = ss
        self.k = ty_le * ss
        self.ox, self.oy = goc_x * ss, dat_y * ss
        self.im = Image.new('RGB', (w * ss, h * ss), (255, 255, 255))
        self.d = ImageDraw.Draw(self.im)

    def P(self, v):
        return (self.ox + v[0] * self.k, self.oy - v[1] * self.k)

    def duong(self, a, b, mau, day):
        self.d.line([self.P(a), self.P(b)], fill=mau, width=max(1, int(day * self.k)))
        r = day * self.k / 2
        for v in (a, b):
            x, y = self.P(v)
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=mau)

    def cham(self, v, r, mau, vien=None):
        x, y = self.P(v)
        rr = r * self.k
        self.d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=mau, outline=vien,
                       width=max(1, int(0.45 * self.k)) if vien else 0)

    def da_giac(self, pts, fill=None, outline=None, day=0.6):
        self.d.polygon([self.P(p) for p in pts], fill=fill)
        if outline:
            q = [self.P(p) for p in pts]
            self.d.line(q + [q[0]], fill=outline, width=max(1, int(day * self.k)), joint='curve')

    def xong(self):
        w, h = self.im.size
        return self.im.resize((w // self.ss, h // self.ss), Image.LANCZOS)


def toi(c, k=0.6):
    return tuple(int(x * k) for x in c)


def ve_rig(v, J, khoi=True, dat=True, moc_dat=None, chi_khoi=False):
    """Thứ tự lớp: khối áo/mũ xám nhạt → tay/chân XA (xanh dương) → thân/đầu (ngọc) → dao → tay/chân GẦN (cam)."""
    if dat:
        v.d.line([v.P((-60, 0)), v.P((80, 0))], fill=DAT, width=max(1, int(0.6 * v.k)))
        if moc_dat is not None:               # vạch đất trôi lùi 11/hình (chỉ dùng trong GIF để thấy chân trụ không trượt)
            for x in np.arange(-66 - moc_dat % 33, 90, 33):
                v.d.line([v.P((x, 0)), v.P((x - 3, -3))], fill=(150, 150, 150), width=max(1, int(0.5 * v.k)))
    if khoi:
        mu = [J['co'] + R(J['goc_dau'], p) for p in MU]
        v.da_giac(khoi_ao(J), fill=NEN_KHOI, outline=VIEN)
        v.da_giac(mu, fill=NEN_KHOI, outline=VIEN)
    if chi_khoi:
        return
    D = 2.4      # độ dày xương chi
    # ---- XA (sau thân)
    for a, b in (('hong_xa', 'goi_xa'), ('goi_xa', 'co_chan_xa')):
        v.duong(J[a], J[b], XANH_DUONG, D)
    v.d.polygon([v.P(J['co_chan_xa']), v.P(J['got_xa']), v.P(J['ban_chan_xa'])], fill=XANH_DUONG)
    v.duong(J['vai_xa'], J['khuyu_xa'], XANH_DUONG, D)
    v.duong(J['khuyu_xa'], J['co_tay_xa'], XANH_DUONG, D)
    v.cham(J['co_tay_xa'], 1.9, XANH_DUONG)
    for k in ('hong_xa', 'goi_xa', 'co_chan_xa', 'ban_chan_xa', 'vai_xa', 'khuyu_xa', 'co_tay_xa'):
        v.cham(J[k], 0.9, toi(XANH_DUONG))
    # ---- THÂN + ĐẦU
    v.duong(J['chau'], J['nguc'], XANH_NGOC, 4.0)
    v.duong(J['nguc'], J['co'], XANH_NGOC, 2.4)
    v.duong(J['hong_xa'], J['hong_gan'], XANH_NGOC, 2.6)
    v.duong(J['vai_xa'], J['vai_gan'], XANH_NGOC, 2.6)
    v.cham(J['dau'], 12.5, XANH_NGOC)
    v.cham(J['mat'], 1.6, (20, 60, 60))
    # mũi nhỏ chỉ hướng mặt (phải)
    mui = J['dau'] + R(J['goc_dau'], np.array([12.5, 0.5]))
    v.d.polygon([v.P(mui + R(J['goc_dau'], np.array([0, 2.2]))), v.P(mui + R(J['goc_dau'], np.array([2.6, 0]))),
                 v.P(mui + R(J['goc_dau'], np.array([0, -2.2])))], fill=XANH_NGOC)
    for k in ('chau', 'nguc', 'co'):
        v.cham(J[k], 1.0, toi(XANH_NGOC))
    # ---- ÂM ĐAO (tay gần cầm) – vẽ trước tay gần để nắm tay đè lên chuôi
    cd = J['co_tay_gan']
    g = J['goc_dao']
    v.duong(cd + R(g, np.array([-3.0, 0])), cd + R(g, np.array([2.5, 0])), DAO, 1.6)
    v.duong(cd + R(g, np.array([2.5, -2.6])), cd + R(g, np.array([2.5, 2.6])), DAO, 1.2)
    v.duong(cd + R(g, np.array([2.5, 0])), J['mui_dao'], DAO, 1.3)
    # ---- GẦN (trước thân)
    for a, b in (('hong_gan', 'goi_gan'), ('goi_gan', 'co_chan_gan')):
        v.duong(J[a], J[b], CAM, D)
    v.d.polygon([v.P(J['co_chan_gan']), v.P(J['got_gan']), v.P(J['ban_chan_gan'])], fill=CAM)
    v.duong(J['vai_gan'], J['khuyu_gan'], CAM, D)
    v.duong(J['khuyu_gan'], J['co_tay_gan'], CAM, D)
    v.cham(J['co_tay_gan'], 2.1, CAM)
    for k in ('hong_gan', 'goi_gan', 'co_chan_gan', 'ban_chan_gan', 'vai_gan', 'khuyu_gan', 'co_tay_gan'):
        v.cham(J[k], 0.9, toi(CAM))


def font(c):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, c)
    return ImageFont.load_default()


# ô: đơn vị logic x −45 … 65, y −8 … 122 ; 3 px / đơn vị
TL = 3
O_X0, O_X1, O_Y0, O_Y1 = -45, 65, -8, 122
OW, OH = (O_X1 - O_X0) * TL, (O_Y1 - O_Y0) * TL


def anh_o(J, so=None, moc_dat=None, nhan=None):
    v = Ve(OW, OH, TL, -O_X0 * TL, O_Y1 * TL)
    ve_rig(v, J, moc_dat=moc_dat)
    im = v.xong()
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, OW - 1, OH - 1], outline=(215, 215, 215))
    if so is not None:
        d.text((6, 4), str(so), fill=(120, 120, 120), font=font(16))
    if nhan:
        d.text((6, OH - 22), nhan, fill=(120, 120, 120), font=font(14))
    return im


def luoi(ims, cot):
    hang = (len(ims) + cot - 1) // cot
    S = Image.new('RGB', (OW * cot, OH * hang), (255, 255, 255))
    for i, im in enumerate(ims):
        S.paste(im, ((i % cot) * OW, (i // cot) * OH))
    return S


def luu_gif(path, frames, ms):
    if not isinstance(ms, list):
        ms = [ms] * len(frames)
    pal = [f.convert('P', palette=Image.ADAPTIVE, colors=128) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=ms, loop=0, disposal=1, optimize=False)


def ms_gif(n_hinh, ms_moi):
    """GIF chỉ nhận bội 10 ms: rải số dư để tổng 1 vòng đúng (12 × 41,67 = 500 ms)."""
    tong, out, da = 0.0, [], 0
    for i in range(n_hinh):
        tong += ms_moi
        m = int(round(tong / 10.0)) * 10 - da
        out.append(m); da += m
    return out


# ---------------------------------------------------------------- kiểm số
def kiem(JS):
    loi = []
    for J in JS:
        for ben in ('gan', 'xa'):
            d1 = np.hypot(*(J['goi_' + ben] - J['hong_' + ben]))
            d2 = np.hypot(*(J['co_chan_' + ben] - J['goi_' + ben]))
            if abs(d1 - DUI) > 0.01 or abs(d2 - CANG) > 0.05:
                loi.append(f"hình {J['f']+1} chân {ben}: đùi {d1:.2f} cẳng {d2:.2f} (duỗi quá tầm)")
            d3 = np.hypot(*(J['khuyu_' + ben] - J['vai_' + ben]))
            d4 = np.hypot(*(J['co_tay_' + ben] - J['khuyu_' + ben]))
            if abs(d3 - CANH_TAY) > 0.01 or abs(d4 - CANG_TAY) > 0.05:
                loi.append(f"hình {J['f']+1} tay {ben}: {d3:.2f}/{d4:.2f}")
    # chân trụ không trượt: điểm chạm (thế giới) cố định
    tg = []
    for f in range(4):
        J = JS[f]
        lui = BUOC * f
        tg.append((J['got_gan'][0] + lui, J['ban_chan_gan'][0] + lui, J['got_gan'][1], J['ban_chan_gan'][1]))
    return loi, tg


def main():
    os.makedirs(XEM, exist_ok=True)
    JS = [tu_the(f) for f in range(N)]
    loi, tg = kiem(JS)
    for l in loi:
        print('⚠', l)
    # (a) 2 × 6 ; (b) 1 hàng
    o = [anh_o(J, so=i + 1) for i, J in enumerate(JS)]
    luoi(o, 6).save(os.path.join(RA, 'rig-chay-12.png'))
    luoi(o, 12).save(os.path.join(RA, 'rig-chay-12-1hang.png'))
    # (c) GIF tại chỗ, vạch đất trôi lùi 11/hình
    g = [anh_o(J, so=i + 1, moc_dat=BUOC * i, nhan=TEN_HINH[i]) for i, J in enumerate(JS)]
    luu_gif(os.path.join(XEM, 'rig-chay-toc-do.gif'), g, ms_gif(N, MS_HINH))
    luu_gif(os.path.join(XEM, 'rig-chay-cham4.gif'), g, ms_gif(N, MS_HINH * 4))
    # (d) chồng Lam chốt
    chong_lam_chot(JS)
    # (e) so nhịp sheet 8
    so_nhip(JS)
    # JSON
    def r2(v):
        return [round(float(v[0]), 2), round(float(v[1]), 2)] if isinstance(v, np.ndarray) else round(float(v), 2)
    out = {
        'mo_ta': 'Rig CHẠY 12 hình của Lam, dựng bằng code (rig_chay.py). Đơn vị = px logic game; đất y = 0, y hướng LÊN; chậu x = 0; mặt hướng PHẢI.',
        'quy_uoc': 'GẦN = bên trái cơ thể = cam, vẽ trước thân; XA = bên phải cơ thể = xanh dương, vẽ sau thân; đầu/thân xanh ngọc.',
        'vong_px': VONG, 'buoc_moi_hinh_px': BUOC, 'toc_do_px_s': TOC_DO, 'ms_moi_hinh': round(MS_HINH, 3),
        'xuong': {'dui': DUI, 'cang_chan': CANG, 'canh_tay': CANH_TAY, 'cang_tay': CANG_TAY, 'than': THAN, 'co': CO},
        'o_anh': {'px_moi_don_vi': TL, 'co_o_px': [OW, OH], 'diem_dat_chau_trong_o_px': [-O_X0 * TL, O_Y1 * TL]},
        'hinh': [{'so': i + 1, 'ten': TEN_HINH[i],
                  **{k: r2(v) for k, v in J.items() if k != 'f'}} for i, J in enumerate(JS)],
        'kiem': {
            'nhun_chau': round(max(J['chau'][1] for J in JS) - min(J['chau'][1] for J in JS), 2),
            'nhun_mat': round(max(J['mat'][1] for J in JS) - min(J['mat'][1] for J in JS), 2),
            'chan_tru_gan_the_gioi_hinh1_4 [got_x, mui_x, got_y, mui_y]': [[round(x, 2) for x in t] for t in tg],
            'loi_do_dai_xuong': loi,
        }}
    with open(os.path.join(RA, 'rig-chay-12.json'), 'w', encoding='utf-8') as fp:
        json.dump(out, fp, ensure_ascii=False, indent=1)
    print('nhún chậu', out['kiem']['nhun_chau'], '| nhún mắt', out['kiem']['nhun_mat'])
    print('chân trụ (thế giới) hình 1–4:', out['kiem']['chan_tru_gan_the_gioi_hinh1_4 [got_x, mui_x, got_y, mui_y]'])


# ---------------------------------------------------------------- (d) chồng Lam chốt
def lam_chot_theo_thang(tl):
    """Lam chốt thu về tl px / đơn vị; trả ảnh RGBA + toạ độ điểm (chậu x = 0, đất) trong ảnh."""
    im = Image.open(LAM_CHOT).convert('RGB')
    a = np.asarray(im).astype(int)
    m = a.min(2) < 235
    ys, xs = np.where(m)
    y0, y1 = ys.min(), ys.max()
    k = (y1 - y0) / 112.0
    alpha = Image.fromarray((m * 255).astype(np.uint8))
    rgba = im.copy(); rgba.putalpha(alpha)
    s = tl / k
    rgba = rgba.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    return rgba, (640.0 * s, y1 * s)


def chong_lam_chot(JS):
    tl = 4
    W, H = 110 * tl, 130 * tl
    gx, gy = 45 * tl, 122 * tl
    lam, (lx, ly) = lam_chot_theo_thang(tl)
    panel = []
    J_dung = tu_the(2)            # hình "giữa" gần dáng đứng nhất
    for ten, J, co_lam, mo in (('Lam chốt', None, True, 1.0),
                               ('rig hình 3 (giữa) chồng Lam chốt', JS[2], True, 0.45),
                               ('rig hình 1 (tiếp đất gần) chồng Lam chốt', JS[0], True, 0.45),
                               ('rig hình 3 riêng', JS[2], False, 1.0)):
        nen = Image.new('RGB', (W, H), (255, 255, 255))
        if co_lam:
            l2 = lam.copy()
            if mo < 1:
                al = l2.getchannel('A').point(lambda x: int(x * mo))
                l2.putalpha(al)
            nen.paste(l2, (int(gx - lx), int(gy - ly)), l2)
        if J is not None:
            v = Ve(W, H, tl, gx, gy)
            ve_rig(v, J, khoi=False, dat=True)
            rig = v.xong()
            # rig nền trắng → làm trong suốt để chồng
            ra = np.asarray(rig).astype(int)
            mm = (ra.min(2) < 245)
            rr = rig.copy(); rr.putalpha(Image.fromarray((mm * 235).astype(np.uint8)))
            nen.paste(rr, (0, 0), rr)
            if not co_lam:
                v2 = Ve(W, H, tl, gx, gy); ve_rig(v2, J); nen = v2.xong()
        d = ImageDraw.Draw(nen)
        for yy, mau, nh in ((72.6, (220, 160, 0), 'mắt chốt 72,6'), (56.6, (160, 160, 160), 'cổ/dây chuông'),
                            (112, (160, 160, 160), 'đỉnh 112')):
            y = gy - yy * tl
            d.line([(0, y), (W, y)], fill=mau, width=1)
            d.text((W - 110, y - 14), nh, fill=mau, font=font(12))
        d.line([(gx, 0), (gx, H)], fill=(230, 210, 210), width=1)
        d.text((6, 6), ten, fill=(60, 60, 60), font=font(13))
        panel.append(nen)
    S = Image.new('RGB', (W * len(panel), H), (255, 255, 255))
    for i, p in enumerate(panel):
        S.paste(p, (i * W, 0))
    S.save(os.path.join(XEM, 'rig-chong-lam-chot.png'))


# ---------------------------------------------------------------- (e) so nhịp với sheet 8 hình đang dùng
def so_nhip(JS):
    meta = json.load(open(SHEET_CHAY + '.json', encoding='utf-8'))
    sh = Image.open(SHEET_CHAY + '.png').convert('RGBA')
    nx, ny = meta['diem_neo']['x'], meta['diem_neo']['y']
    pxl = meta['ty_le']['px_nguon_moi_px_logic'] if isinstance(meta['ty_le'], dict) else 2
    tl = 3
    s = tl / pxl
    o8 = []
    for fr in meta['frames']:
        c = sh.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h']))
        o8.append(c.resize((int(c.width * s), int(c.height * s)), Image.LANCZOS))
    mat8 = [-sd['mat_logic'][1] for sd in meta['so_do']]
    mat12 = [float(J['mat'][1]) for J in JS]
    W, H = 125 * tl, 130 * tl
    gx, gy = 60 * tl, 122 * tl
    DOH = 130                                    # cao biểu đồ
    # mốc thời gian chung: sheet đổi mỗi 62,5 ms, rig mỗi 41,67 ms → hợp 4 khoảng / 125 ms
    t_moc = sorted(set([round(i * 62.5, 3) for i in range(8)] + [round(i * MS_HINH, 3) for i in range(12)]))
    t_moc.append(500.0)
    hinh = []
    for j in range(len(t_moc) - 1):
        t = t_moc[j]
        i8 = int(t // 62.5 + 1e-6) % 8
        i12 = int(t // MS_HINH + 1e-6) % 12
        S = Image.new('RGB', (W * 2, H + DOH + 10), (255, 255, 255))
        # trái: sheet 8
        p = Image.new('RGB', (W, H), (255, 255, 255))
        d = ImageDraw.Draw(p)
        d.line([(0, gy), (W, gy)], fill=DAT, width=2)
        p.paste(o8[i8], (int(gx - nx * s), int(gy - ny * s)), o8[i8])
        d.text((6, 6), f'sheet 8 đang dùng – R{i8+1}', fill=(60, 60, 60), font=font(14))
        S.paste(p, (0, 0))
        # phải: rig 12
        v = Ve(W, H, tl, gx, gy); ve_rig(v, JS[i12]); p2 = v.xong()
        d2 = ImageDraw.Draw(p2)
        d2.text((6, 6), f'rig 12 – hình {i12+1} ({TEN_HINH[i12]})', fill=(60, 60, 60), font=font(14))
        S.paste(p2, (W, 0))
        d = ImageDraw.Draw(S)
        for y in (gy - 72.6 * tl,):
            d.line([(0, y), (2 * W, y)], fill=(230, 190, 80), width=1)
        # biểu đồ độ cao mắt theo thời gian (0–500 ms), cùng thang dọc ×6
        y_bd = H + 5
        d.rectangle([0, y_bd, 2 * W - 1, y_bd + DOH], outline=(220, 220, 220))
        lo, hi = 58.0, 78.0
        def Y(v):
            return y_bd + DOH - 8 - (v - lo) / (hi - lo) * (DOH - 30)
        def X(tt):
            return 10 + tt / 500.0 * (2 * W - 20)
        for i in range(8):                      # bậc thang sheet 8 (đỏ)
            d.line([(X(i * 62.5), Y(mat8[i])), (X((i + 1) * 62.5), Y(mat8[i]))], fill=(200, 60, 60), width=3)
        for i in range(12):                     # bậc thang rig 12 (ngọc)
            d.line([(X(i * MS_HINH), Y(mat12[i])), (X((i + 1) * MS_HINH), Y(mat12[i]))], fill=XANH_NGOC, width=3)
        for tt, ten in ((0, 'R1'), (250, 'R5')):
            d.text((X(tt) + 2, y_bd + 18), ten + ' chạm', fill=(200, 60, 60), font=font(11))
        for tt, ten in ((0, 'gần chạm'), (250, 'xa chạm')):
            d.text((X(tt) + 2, y_bd + 4), ten, fill=XANH_NGOC, font=font(11))
        d.line([(X(t), y_bd), (X(t), y_bd + DOH)], fill=(40, 40, 40), width=1)
        d.text((2 * W - 340, y_bd + DOH - 16),
               f'độ cao mắt: đỏ sheet 8 = {max(mat8)-min(mat8):.1f} px · ngọc rig 12 = {max(mat12)-min(mat12):.1f} px',
               fill=(60, 60, 60), font=font(11))
        hinh.append((S, t_moc[j + 1] - t))
    for ten, he in (('so-nhip-sheet8-rig12.gif', 1), ('so-nhip-sheet8-rig12-cham4.gif', 4)):
        tong, ms, da = 0.0, [], 0
        for _, dt in hinh:
            tong += dt * he
            m = int(round(tong / 10.0)) * 10 - da
            ms.append(max(m, 20)); da += m
        luu_gif(os.path.join(XEM, ten), [h for h, _ in hinh], ms)


if __name__ == '__main__':
    main()
