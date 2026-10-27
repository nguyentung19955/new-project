#!/usr/bin/env python3
"""Phu Đèn Lạc – tách nền, cắt 7 mảnh theo hình nguyên con, rig, 2 clip (đứng thở / đi kéo đèn), xuất gói + ảnh kiểm + GIF.

Nguồn: art/huong-moi/nguon/quai/phu-den-lac.png (nền trắng: nguyên con trái + bảng mảnh mũ trùm, áo, tay, cán, đèn, 2 giày).
Chạy: python3 dung.py  (pillow, numpy, scipy). Ra: ../manh/, ../phu-den-lac-rig.json, ../kiem/, ../xem-thu/."""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, os.path.normpath(os.path.join(ROOT, '..', 'code-chung')))
import numpy as np
import cutout as cc
import xuat_chung as xc

SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'nguon', 'quai', 'phu-den-lac.png'))
KHOA = 'phuden'; TEN = 'Phu Đèn Lạc'

rgb, alpha = cc.tach_nen(SRC)
alpha_bang = alpha.copy()                   # bảng mảnh (giày) dùng alpha đầy đủ
HOP = (40, 120, 815, 840)                    # khung hình nguyên con (toạ độ ảnh nguồn)
# chỉ giữ hình nguyên con trong khung (mũ trùm của bảng mảnh lấn vào góc phải-trên)
tp, lab = cc.thanh_phan(alpha)
nguyen = max(tp, key=lambda r: r[0] if r[1][0] < 300 else 0)
alpha = np.where(lab == nguyen[2], alpha, 0).astype(np.float32)

DAT_Y = 822.0          # đáy giày trước = mặt đất
CAO_LOGIC = 112.0      # ≈ Lam (đỉnh mũ trùm → đất)
DINH_Y = 131.0
TY = CAO_LOGIC / (DAT_Y - DINH_Y)
GOC = (300.0, DAT_Y)   # điểm neo: giữa hai giày trên mặt đất

# ---------------- mảnh bảng: 2 giày, đặt khớp vào hình nguyên con ----------------
def manh_bang(hop):
    x0, y0, x1, y1 = hop
    a = np.zeros((y1 - y0, x1 - x0, 4), np.float32)
    a[..., :3] = rgb[y0:y1, x0:x1] / 255; a[..., 3] = alpha_bang[y0:y1, x0:x1]
    a[..., :3] *= 255
    return a
GIAY_A = manh_bang((950, 768, 1068, 840)); GIAY_B = manh_bang((1175, 770, 1295, 842))
H_, W_ = alpha.shape
def dat(img, s, g, tx, ty, lat):
    o = cc.bien_doi(img, s, g, tx, ty, lat, (H_, W_)); return o
vung_giay = cc.mat_na((H_, W_), [[(162, 790), (200, 775), (262, 782), (262, 824), (165, 824)]]) & (alpha > 0.5)
kh = cc.do_khop(GIAY_A, rgb, alpha, vung_giay, (1.0, 0.0, 158.0, 774.0, False), 'giày trước')
B_GIAY_T = dat(GIAY_A, *kh)
# giày sau: cùng tỉ lệ, đặt dưới vạt áo phía sau (chỉ mũi giày lộ ra ở x≈420–480)
B_GIAY_S = dat(GIAY_B, kh[0], 0.0, 398.0, 822.0 - kh[0] * (GIAY_B.shape[0] - 5), False)

CAN = [(172, 473), (694, 646)]
SPECS = [
    {'ten': 'giay-sau', 'da': [[(415, 796), (500, 796), (500, 828), (415, 828)]], 'bang': B_GIAY_S, 'vien': 0, 'ngoai': True},
    {'ten': 'giay-truoc', 'da': [[(160, 788), (205, 772), (262, 780), (262, 826), (160, 826)]], 'bang': B_GIAY_T, 'vien': 0, 'ngoai': True},
    {'ten': 'ao', 'da': [], 'lap': [[(150, 230), (340, 220), (380, 330), (380, 560), (160, 560), (140, 400)],
                                     cc.dai_bang(CAN[0], CAN[1], 40)]},
    {'ten': 'den', 'da': [[(668, 700), (700, 612), (748, 612), (806, 690), (806, 828), (668, 828)]], 'vien': 0},
    {'ten': 'can', 'da': [cc.dai_bang(CAN[0], CAN[1], 24)], 'vien': 3},
    {'ten': 'tay', 'da': [[(235, 292), (270, 278), (330, 280), (345, 300), (352, 360), (355, 420), (360, 470), (352, 500),
                           (330, 512), (300, 506), (292, 536), (250, 542), (204, 532), (196, 482), (230, 466), (240, 420), (238, 340)]],
     'lap': [[(240, 270), (330, 262), (340, 300), (250, 310)]]},
    {'ten': 'mu', 'da': [[(30, 240), (100, 165), (150, 125), (205, 138), (270, 178), (338, 212), (334, 232), (296, 238), (258, 256),
                          (236, 280), (218, 318), (203, 360), (198, 402), (170, 412), (120, 394), (66, 378), (26, 300)]]},
]
THU_TU = [s['ten'] for s in SPECS]
manh, chu = cc.dung_manh(rgb, alpha, HOP, SPECS, 'ao')

# điểm giữ màu gốc: lõi đèn (vàng sáng)
def giu_den(m):
    h, s, v = cc.rgb_hsv(m[..., :3] / 255)
    return (h > 25) & (h < 60) & (s > 0.45) & (v > 0.55)

RIG_NUT = [  # tên, cha, vị trí neo (toạ độ ảnh nguồn), mảnh, hiện
    ('goc', None, GOC, None, True),
    ('giay_sau', 'goc', (452.0, DAT_Y), 'giay-sau', True),
    ('giay_truoc', 'goc', (212.0, DAT_Y), 'giay-truoc', True),
    ('than', 'goc', (300.0, 800.0), 'ao', True),
    ('tay', 'than', (262.0, 300.0), 'tay', True),
    ('can', 'tay', (228.0, 500.0), 'can', True),
    ('den', 'can', (712.0, 638.0), 'den', True),
    ('mu', 'than', (236.0, 292.0), 'mu', True),
]
VE = ['giay_sau', 'giay_truoc', 'than', 'den', 'can', 'tay', 'mu']
rig = cc.Rig(RIG_NUT, VE, TY, GOC)

# ---------------- CLIP ----------------
# Đứng: lưng còng thở chậm (3,2 s), mũ trùm gật trễ, tay hơi trĩu, đèn lắc rất nhẹ theo thân.
T_DUNG = 3.2
def f_dung(P, t):
    w = 2 * math.pi * t / T_DUNG
    tho = math.sin(w)
    cc.cong(P, 'than', dy=-3.0 * tho, sy=1 + 0.004 * tho, goc=0.35 * math.sin(w - 0.4))
    cc.cong(P, 'mu', goc=1.2 * math.sin(w - 1.1), dy=-1.0 * math.sin(w - 0.8))
    cc.cong(P, 'tay', goc=-0.8 * math.sin(w - 0.6))
    cc.cong(P, 'can', goc=0.5 * math.sin(w - 0.9))
    # đèn: con lắc, đi theo góc cán trễ nhịp
    lac = cc.lo_xo_theo(lambda u: -(0.5 * math.sin(2 * math.pi * u / T_DUNG - 0.9) - 0.8 * math.sin(2 * math.pi * u / T_DUNG - 0.6)) * 1.2,
                        t, f=0.9, tat=1.4, chu_ky=T_DUNG)
    cc.cong(P, 'den', goc=lac + 1.2 * math.sin(w - 2.2))

# Đi: lê bước nặng, 2 bước / 1,4 s, 40 px logic/s (56 px/chu kỳ). Giày: chống (trượt lùi đúng tốc độ đất) / nhấc lên vung tới.
TOC_DI = 40.0; T_DI = 1.4
A_DI = TOC_DI / TY * T_DI / 4          # nửa biên độ giày (px nguồn) – chân chống không trượt
K_NHUN = cc.Kenh([(0.0, 0.0), (0.12, 5.0), (0.30, -7.0), (0.5, 0.0), (0.62, 5.0), (0.80, -7.0)], 1.0)   # nhún (px nguồn), 2 nhịp
K_NGHIENG = cc.Kenh([(0.0, -1.2), (0.25, 0.4), (0.5, -1.2), (0.75, 0.4)], 1.0)                           # thân chúi tới mỗi bước
K_LAC = cc.Kenh([(0.0, 1.6), (0.5, -1.6)], 1.0)                                                              # lắc ngang trái–phải
def giay(P, n, u):
    if u < 0.55:   # chống: lùi đều
        x = A_DI - 2 * A_DI * (u / 0.55); nhac = 0.0; goc = 0.0
    else:
        v = (u - 0.55) / 0.45; e = v * v * (3 - 2 * v)
        x = -A_DI + 2 * A_DI * e; nhac = 16 * math.sin(math.pi * v); goc = -10 * math.sin(math.pi * v)
    cc.cong(P, n, dx=-x, dy=-nhac, goc=goc)   # quay trái: tiến = x âm
def f_di(P, t):
    u = (t / T_DI) % 1
    nh = K_NHUN(u)
    cc.cong(P, 'than', dy=nh, goc=K_NGHIENG(u) - 1.5, dx=K_LAC(u))
    giay(P, 'giay_truoc', u); giay(P, 'giay_sau', (u + 0.5) % 1)
    cc.cong(P, 'mu', goc=1.8 * math.sin(2 * math.pi * (2 * u) - 2.0) - 1.0, dy=1.5 * math.sin(2 * math.pi * 2 * u - 1.6))
    cc.cong(P, 'tay', goc=2.2 * math.sin(2 * math.pi * u - 0.8), dx=2 * math.sin(2 * math.pi * u))
    cc.cong(P, 'can', goc=-1.6 * math.sin(2 * math.pi * u - 0.8))
    # đèn ĐUNG ĐƯA TRỄ NHỊP: con lắc bị kéo bởi gia tốc đầu cán (nhún + lắc) → lò xo tắt dần, trễ ~¼ chu kỳ
    def kich(s):
        uu = (s / T_DI) % 1
        return 7.0 * math.sin(2 * math.pi * uu + 0.3) + 2.5 * math.sin(2 * math.pi * 2 * uu - 1.0)
    cc.cong(P, 'den', goc=cc.lo_xo_theo(kich, t, f=1.1, tat=1.6, chu_ky=T_DI) + 2.0)

CLIPS = {
    'dung': cc.nuong_clip(rig, 'đứng thở (lưng còng, mũ gật trễ, đèn lắc nhẹ)', T_DUNG * 1000, True, f_dung),
    'di': cc.nuong_clip(rig, 'đi lê bước, kéo đèn – phát theo QUÃNG ĐƯỜNG: %.0f px logic/chu kỳ (%.0f px/s)' % (TOC_DI * T_DI, TOC_DI),
                        T_DI * 1000, True, f_di, them={'px_logic_moi_chu_ky': round(TOC_DI * T_DI, 2), 'toc_do_px_s': TOC_DI}),
}

xc.chay(dict(ROOT=ROOT, KHOA=KHOA, TEN=TEN, rgb=rgb, rig=rig, CLIPS=CLIPS, TY=TY, GOC=GOC, giu=giu_den, ten_tep='phu-den-lac',
             nhom=[dict(ten='nguyên con', HOP=HOP, manh=manh, THU_TU=THU_TU, alpha=alpha)], cao_ghi=CAO_LOGIC,
             them={'cao_px_logic': CAO_LOGIC, 'toc_di_px_s': TOC_DI,
                   'hitbox_than_de_xuat': {'w': 46, 'h': 104, 'ghi_chu': 'hộp thân gợi ý (chưa phải số gameplay), đáy = đất, giữa = điểm neo'}},
             clip_gif=[('dung', 'dung', T_DUNG), ('di', 'di', T_DI)], toc={'di': TOC_DI}))
