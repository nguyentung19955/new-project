#!/usr/bin/env python3
"""Dơi Rễ – tách nền, cắt mảnh theo ảnh: dáng BAY (thân + cánh xa + cánh gần) và dáng TREO TRẦN nguyên khối; rig; 2 clip
(treo: đung đưa, thở · bay: vỗ cánh) → gói + ảnh kiểm + GIF.

Nguồn: art/huong-moi/nguon/quai/doi-re.png (nền trắng: dáng treo (trái-trên) + dáng bay (phải-trên) + thân, 2 cánh rời (dưới)).
Mảnh rời dưới cùng KHÔNG dùng trực tiếp: dáng bay đã có đủ thân + 2 cánh đúng tư thế; phần cánh khuất sau thân được lấp.
Điểm neo (goc): BAY = giữa thân; TREO = chỗ chân bám trần (mảnh treo đã dời sẵn để chân trùng điểm neo).
Chạy: python3 dung.py"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, os.path.normpath(os.path.join(ROOT, '..', 'code-chung')))
import numpy as np
import cutout as cc
import xuat_chung as xc

SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'nguon', 'quai', 'doi-re.png'))
KHOA = 'doire'; TEN = 'Dơi Rễ'

rgb, alpha0 = cc.tach_nen(SRC)
tp, lab = cc.thanh_phan(alpha0)
def chi_cum(x, y):
    return np.where(lab == lab[y, x], alpha0, 0).astype(np.float32)

# ---------------- dáng bay ----------------
HOP_BAY = (500, 140, 1225, 705)
a_bay = chi_cum(560, 540)          # cụm dáng bay (thân ở (560,540))
GOC = (650.0, 540.0)               # điểm neo khi bay = giữa thân
# ---------------- dáng treo (bỏ phiến trần đá: chỉ giữ phần dưới mép phiến, chân bám) ----------------
HOP_TREO = (90, 118, 480, 690)
a_treo = chi_cum(250, 400) * cc.mat_na(alpha0.shape, [[(212, 131), (330, 131), (480, 220), (480, 690), (90, 690), (90, 220)]])
# điểm trắng kẹt giữa móng chân và phiến trần (lúc còn phiến thì là lỗ kín nhỏ) → trong suốt
_yy = np.arange(alpha0.shape[0])[:, None]
a_treo = np.where((_yy < 160) & (rgb.min(2) > 175), 0, a_treo).astype(np.float32)
CHAN_TREO = (268.0, 131.0)         # chỗ chân bám trần
CAO_TREO = 686 - 131               # px nguồn
CAO_LOGIC = 56.0                   # ≈ ½ Lam (dáng treo, chân → chóp)
TY = CAO_LOGIC / CAO_TREO

SPECS_BAY = [
    {'ten': 'canh-xa', 'da': [[(500, 140), (805, 140), (805, 330), (725, 420), (705, 500), (660, 505), (640, 470), (600, 425), (560, 385), (500, 330)]],
     'lap': [[(625, 430), (705, 430), (712, 505), (650, 508)]]},
    {'ten': 'than', 'da': [[(500, 440), (560, 420), (576, 412), (602, 468), (618, 392), (676, 378), (672, 470), (700, 505), (760, 500),
                            (792, 520), (802, 560), (786, 600), (812, 640), (812, 705), (680, 705), (640, 650), (560, 625), (500, 600)]],
     'lap': [[(690, 495), (770, 490), (795, 520), (790, 565), (760, 580), (690, 565)]]},
    {'ten': 'canh-gan', 'da': [[(700, 516), (760, 496), (828, 440), (858, 300), (900, 140), (1225, 140), (1225, 640), (940, 640),
                                (800, 584), (760, 562), (720, 546)]]},
]
manh_bay, _ = cc.dung_manh(rgb, a_bay, HOP_BAY, SPECS_BAY, 'than')
SPECS_TREO = [{'ten': 'treo', 'da': []}]
manh_treo, _ = cc.dung_manh(rgb, a_treo, HOP_TREO, SPECS_TREO, 'treo')
DICH_TREO = (GOC[0] - CHAN_TREO[0], GOC[1] - CHAN_TREO[1])   # dời mảnh treo: chân bám trùng điểm neo

def giu_mat(m):     # mắt hổ phách giữ màu gốc
    h, s, v = cc.rgb_hsv(m[..., :3] / 255)
    return (h > 20) & (h < 50) & (s > 0.4) & (v > 0.7)

RIG_NUT = [
    ('goc', None, GOC, None, True),
    ('treo', 'goc', GOC, 'treo', False),
    ('than', 'goc', GOC, 'than', True),
    ('canh_xa', 'than', (655.0, 480.0), 'canh-xa', True),
    ('canh_gan', 'than', (722.0, 526.0), 'canh-gan', True),
]
VE = ['canh_xa', 'than', 'canh_gan', 'treo']
rig = cc.Rig(RIG_NUT, VE, TY, GOC)

def che_do(P, treo):
    for n in ('than', 'canh_xa', 'canh_gan'): cc.cong(P, n, hien=not treo)
    cc.cong(P, 'treo', hien=treo)

# ---------------- CLIP ----------------
# TREO: đung đưa nhẹ quanh chân bám (con lắc chậm 2,4 s), thở (phình ngang 1,5 %), thỉnh thoảng rùng mình nhẹ.
T_TREO = 4.8
def f_treo(P, t):
    che_do(P, True)
    w = 2 * math.pi * t / 2.4
    rung = math.exp(-((t - 3.3) / 0.12) ** 2)           # rùng mình 1 lần mỗi vòng
    cc.cong(P, 'treo', goc=1.6 * math.sin(w) + 1.2 * rung * math.sin(2 * math.pi * 9 * t),
            sx=1 + 0.015 * math.sin(2 * w + 0.5) + 0.02 * rung, sy=1 - 0.006 * math.sin(2 * w + 0.5))

# BAY: vỗ cánh 0,48 s / nhịp – đập xuống nhanh (40 % chu kỳ), nâng lên chậm; cánh xoay quanh vai + thu ngắn theo phối cảnh
# lúc ở đỉnh/đáy; thân nảy lên khi đập xuống (trễ một chút), đầu–tai nghiêng theo.
T_BAY = 0.48
K_CANH = cc.Kenh([(0.0, -34.0), (0.40, 30.0), (0.55, 24.0), (0.85, -22.0)], 1.0)      # góc cánh gần (độ, + = đập xuống)
K_THU = cc.Kenh([(0.0, 0.70), (0.20, 1.0), (0.40, 0.78), (0.70, 0.95)], 1.0)          # sy cánh (phối cảnh)
K_THAN = cc.Kenh([(0.05, 8.0), (0.45, -12.0), (0.75, 0.0)], 1.0)                      # thân (px nguồn, − = lên)
def f_bay(P, t):
    che_do(P, False)
    u = (t / T_BAY) % 1
    g = K_CANH(u); s = K_THU(u)
    cc.cong(P, 'canh_gan', goc=g, sy=s, sx=1 - 0.06 * (1 - s))
    cc.cong(P, 'canh_xa', goc=-0.6 * K_CANH((u - 0.03) % 1), sx=K_THU((u - 0.03) % 1), sy=1 - 0.05 * (1 - s))
    cc.cong(P, 'than', dy=K_THAN(u), goc=-3.0 * math.sin(2 * math.pi * (u - 0.15)))

CLIPS = {
    'treo': cc.nuong_clip(rig, 'treo trần: đung đưa, thở, rùng mình (điểm neo = chân bám trần)', T_TREO * 1000, True, f_treo),
    'bay': cc.nuong_clip(rig, 'bay vỗ cánh tại chỗ 0,48 s/nhịp (điểm neo = giữa thân; game tự dời vị trí)', T_BAY * 1000, True, f_bay),
}
P_bay = rig.tu_the()

xc.chay(dict(ROOT=ROOT, KHOA=KHOA, TEN=TEN, rgb=rgb, rig=rig, CLIPS=CLIPS, TY=TY, GOC=GOC, giu=giu_mat, ten_tep='doi-re',
             nhom=[dict(ten='dáng bay', HOP=HOP_BAY, manh=manh_bay, THU_TU=['canh-xa', 'than', 'canh-gan'], alpha=a_bay),
                   dict(ten='dáng treo', HOP=HOP_TREO, manh=manh_treo, THU_TU=['treo'], alpha=a_treo, dich=DICH_TREO, duoi='-treo')],
             cao_ghi=CAO_LOGIC, so_co_neo_cao=70,
             them={'cao_treo_px_logic': CAO_LOGIC, 'neo': 'treo: điểm neo = chân bám trần (vẽ tại (x, y trần)); bay: điểm neo = giữa thân',
                   'hitbox_than_de_xuat': {'w': 30, 'h': 26, 'ghi_chu': 'hộp thân khi bay quanh điểm neo (chưa phải số gameplay); cánh không tính'}},
             hop_gif={'treo': [-24, -4, 24, CAO_LOGIC], 'bay': [-20, -50, 64, 22]}, dat_gif={'treo': False, 'bay': False},
             clip_gif=[('treo', 'treo', T_TREO), ('bay', 'bay', T_BAY * 4)]))
