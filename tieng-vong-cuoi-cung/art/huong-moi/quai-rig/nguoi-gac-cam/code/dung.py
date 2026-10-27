#!/usr/bin/env python3
"""Người Gác Câm (tinh anh) – tách nền, cắt 7 mảnh theo hình nguyên con: mũ, thân (chuông bịt + áo choàng + váy), tay trái
(cầm trượng), tay phải, chân trái, chân phải, trượng chuông; rig; 2 clip (đứng thở nặng · đi nặng nề) → gói + ảnh kiểm + GIF.

Nguồn: art/huong-moi/nguon/quai/nguoi-gac-cam.png (nền trắng: nguyên con trái + bảng mảnh mũ, thân, 2 tay, 2 chân, trượng).
Trượng: lấy TRƯỢNG RỜI trong bảng, dò tỉ lệ/góc/vị trí cho khớp trượng trong hình nguyên con (phần khuất sau bàn tay đủ nét).
Các mảnh khác: phần thấy = điểm ảnh hình nguyên con, phần khuất (vai, đùi dưới váy, cổ dưới mũ) được lấp.
Chạy: python3 dung.py"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, os.path.normpath(os.path.join(ROOT, '..', 'code-chung')))
import numpy as np
import cutout as cc
import xuat_chung as xc

SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'nguon', 'quai', 'nguoi-gac-cam.png'))
KHOA = 'gaccam'; TEN = 'Người Gác Câm'

rgb, alpha0 = cc.tach_nen(SRC)
tp, lab = cc.thanh_phan(alpha0)
alpha = np.where(lab == lab[500, 300], alpha0, 0).astype(np.float32)
HOP = (12, 10, 672, 992)
H_, W_ = alpha.shape

# ---------------- trượng rời (bảng) đặt khớp vào hình nguyên con ----------------
def bang(b, lx, ly):
    x0, y0, x1, y1 = b; L = lab[ly, lx]
    o = np.zeros((y1 - y0, x1 - x0, 4), np.float32)
    o[..., :3] = rgb[y0:y1, x0:x1]; o[..., 3] = np.where(lab[y0:y1, x0:x1] == L, alpha0[y0:y1, x0:x1], 0)
    return o
TRUONG_BANG = bang((1366, 18, 1523, 980), 1440, 500)
V = cc.mat_na(alpha.shape, [[(20, 15), (150, 15), (150, 395), (60, 395)], [(70, 510), (140, 510), (150, 870), (80, 870)]]) & (alpha > 0.5)
kh = cc.do_khop(TRUONG_BANG, rgb, alpha, V, (0.981, -4.7, 4.4, 25.0, False), 'trượng')
B_TRUONG = cc.bien_doi(TRUONG_BANG, *kh, (H_, W_))
M_TRUONG = nd_m = (B_TRUONG[..., 3] > 0.5)

DAT_Y = 980.0; DINH_Y = 40.0          # đế ủng phải → đỉnh mũ
CAO_LOGIC = 168.0                     # 1,5 × Lam (không tính trượng)
TY = CAO_LOGIC / (DAT_Y - DINH_Y)
GOC = (370.0, DAT_Y)

SPECS = [
    {'ten': 'truong', 'mat': M_TRUONG, 'bang': B_TRUONG, 'vien': 3},
    {'ten': 'tay-trai', 'da': [[(56, 430), (80, 410), (118, 402), (150, 397), (196, 400), (206, 420), (202, 470), (192, 572), (160, 572),
                                (140, 506), (110, 506), (70, 502), (54, 470)]],
     'lap': [[(180, 380), (250, 380), (250, 480), (190, 480)]]},
    {'ten': 'chan-trai', 'da': [[(212, 700), (305, 700), (330, 760), (370, 800), (382, 880), (388, 966), (172, 966), (178, 935), (225, 885),
                                 (232, 820), (210, 780)]],
     'lap': [[(205, 630), (325, 630), (335, 720), (208, 720)]]},
    {'ten': 'chan-phai', 'da': [[(365, 700), (452, 700), (470, 790), (505, 822), (520, 860), (592, 925), (592, 988), (408, 988), (406, 930),
                                 (395, 880), (385, 800), (365, 760)]],
     'lap': [[(360, 630), (470, 630), (472, 720), (366, 720)]]},
    {'ten': 'than', 'da': [], 'lap': [[(212, 168), (332, 158), (372, 202), (232, 242)], [(335, 228), (420, 212), (442, 640), (400, 640), (380, 340)]]},
    {'ten': 'mu', 'da': [[(218, 48), (238, 38), (258, 58), (272, 80), (290, 55), (318, 50), (326, 105), (346, 128), (374, 160), (370, 180),
                          (332, 192), (292, 200), (264, 202), (252, 216), (228, 224), (210, 206), (214, 150), (220, 100)]]},
    {'ten': 'tay-phai', 'da': [[(338, 232), (380, 205), (450, 205), (500, 225), (520, 260), (525, 330), (535, 400), (540, 470), (530, 520),
                                (535, 580), (520, 630), (470, 642), (420, 635), (405, 600), (400, 540), (415, 500), (415, 440), (420, 380),
                                (400, 340), (360, 330), (340, 290)]]},
]
THU_TU = [s['ten'] for s in SPECS]
manh, chu = cc.dung_manh(rgb, alpha, HOP, SPECS, 'than')

def giu_mat(m):   # khe mắt cam giữ màu gốc
    h, s, v = cc.rgb_hsv(m[..., :3] / 255)
    return (h > 15) & (h < 45) & (s > 0.5) & (v > 0.6)

RIG_NUT = [
    ('goc', None, GOC, None, True),
    ('chan_trai', 'goc', (268.0, 720.0), 'chan-trai', True),
    ('chan_phai', 'goc', (412.0, 720.0), 'chan-phai', True),
    ('than', 'goc', (340.0, 680.0), 'than', True),
    ('tay_trai', 'than', (215.0, 405.0), 'tay-trai', True),
    ('truong', 'tay_trai', (104.0, 462.0), 'truong', True),
    ('mu', 'than', (272.0, 205.0), 'mu', True),
    ('tay_phai', 'than', (425.0, 250.0), 'tay-phai', True),
]
VE = ['truong', 'tay_trai', 'chan_trai', 'chan_phai', 'than', 'mu', 'tay_phai']
rig = cc.Rig(RIG_NUT, VE, TY, GOC)

# ---------------- CLIP ----------------
T_DUNG = 3.6
def f_dung(P, t):    # đứng canh: thở sâu chậm, vai nâng–hạ, mũ gật trễ, trượng gần như yên (tay trái giữ)
    w = 2 * math.pi * t / T_DUNG
    s = math.sin(w)
    cc.cong(P, 'than', dy=-4.0 * s, sy=1 + 0.004 * s, sx=1 + 0.003 * s)
    for n in ('chan_trai', 'chan_phai'): cc.cong(P, n, sy=1 + 0.003 * s)
    cc.cong(P, 'mu', goc=1.0 * math.sin(w - 1.0), dy=-1.2 * math.sin(w - 0.7))
    cc.cong(P, 'tay_phai', goc=-1.2 * math.sin(w - 0.6), dy=-1.0 * math.sin(w - 0.4))
    cc.cong(P, 'tay_trai', goc=0.5 * math.sin(w - 0.5), dy=4.0 * s)     # bàn tay bám trượng: bù lại nhịp thở của thân
    cc.cong(P, 'truong', goc=-0.4 * math.sin(w - 0.8), dy=-4.0 * s * 0)

# ĐI nặng nề: 2 bước / 1,8 s, 30 px logic/s (54 px/chu kỳ). Mỗi lần đặt chân: thân sụp + nén, mũ và tay trễ nhịp, trượng chống.
TOC_DI = 30.0; T_DI = 1.8
A_DI = TOC_DI / TY * T_DI / 4
K_THAN_Y = cc.Kenh([(0.0, 6.0), (0.08, 14.0), (0.25, -6.0), (0.5, 6.0), (0.58, 14.0), (0.75, -6.0)], 1.0)   # sụp khi đặt chân
K_NEN = cc.Kenh([(0.0, 0.0), (0.08, 1.0), (0.22, 0.0), (0.5, 0.0), (0.58, 1.0), (0.72, 0.0)], 1.0)
K_NGHIENG = cc.Kenh([(0.0, -1.5), (0.25, 0.8), (0.5, -1.5), (0.75, 0.8)], 1.0)
def chan(P, n, u):
    if u < 0.6:
        x = A_DI - 2 * A_DI * (u / 0.6); nhac = 0.0; goc = 0.0
    else:
        v = (u - 0.6) / 0.4; e = v * v * (3 - 2 * v)
        x = -A_DI + 2 * A_DI * e; nhac = 34 * math.sin(math.pi * v) ** 1.5; goc = -6 * math.sin(math.pi * v)
    cc.cong(P, n, dx=-x, dy=-nhac, goc=goc)
def f_di(P, t):
    u = (t / T_DI) % 1
    nen_ = K_NEN(u)
    cc.cong(P, 'than', dy=K_THAN_Y(u), goc=K_NGHIENG(u) - 1.2, dx=4 * math.sin(2 * math.pi * u), sy=1 - 0.012 * nen_, sx=1 + 0.008 * nen_)
    chan(P, 'chan_phai', u); chan(P, 'chan_trai', (u + 0.5) % 1)
    cc.cong(P, 'mu', goc=-1.5 * math.cos(2 * math.pi * (2 * u) - 1.2) - 0.6, dy=2.5 * nen_)
    cc.cong(P, 'tay_phai', goc=4.0 * math.sin(2 * math.pi * u - 0.9) + 1.5 * nen_)
    # tay trái bám trượng: bù phần lớn nhịp sụp của thân → trượng gần như chạm đất suốt bước (như chống gậy)
    cc.cong(P, 'tay_trai', goc=-2.5 * math.sin(2 * math.pi * u - 0.6), dx=3 * math.sin(2 * math.pi * u), dy=-0.85 * K_THAN_Y(u))
    cc.cong(P, 'truong', goc=3.0 * math.sin(2 * math.pi * u - 0.3))

CLIPS = {
    'dung': cc.nuong_clip(rig, 'đứng canh: thở sâu chậm 3,6 s, mũ gật trễ', T_DUNG * 1000, True, f_dung),
    'di': cc.nuong_clip(rig, 'đi nặng nề – phát theo QUÃNG ĐƯỜNG: %.0f px logic/chu kỳ (%.0f px/s); thân sụp mỗi lần đặt chân (pha 0,08 và 0,58)'
                        % (TOC_DI * T_DI, TOC_DI), T_DI * 1000, True, f_di,
                        them={'px_logic_moi_chu_ky': round(TOC_DI * T_DI, 2), 'toc_do_px_s': TOC_DI, 'pha_dat_chan': [0.08, 0.58]}),
}

xc.chay(dict(ROOT=ROOT, KHOA=KHOA, TEN=TEN, rgb=rgb, rig=rig, CLIPS=CLIPS, TY=TY, GOC=GOC, giu=giu_mat, ten_tep='nguoi-gac-cam',
             nhom=[dict(ten='nguyên con', HOP=HOP, manh=manh, THU_TU=THU_TU, alpha=alpha)], cao_ghi=CAO_LOGIC,
             them={'cao_px_logic': CAO_LOGIC, 'cao_ca_truong_px_logic': round((DAT_Y - 15) * TY, 1), 'toc_di_px_s': TOC_DI,
                   'hitbox_than_de_xuat': {'w': 70, 'h': 160, 'ghi_chu': 'hộp thân gợi ý (không tính trượng), chưa phải số gameplay'}},
             bien_gif={'di': (6, 0, 6, 0)},
             clip_gif=[('dung', 'dung', T_DUNG), ('di', 'di', T_DI)], toc={'di': TOC_DI}))
