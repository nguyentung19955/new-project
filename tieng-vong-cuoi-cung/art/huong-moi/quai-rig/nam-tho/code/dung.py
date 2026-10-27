#!/usr/bin/env python3
"""Nấm Thở – tách nền, cắt mảnh theo ảnh: gốc (thân + rễ), mũ nấm, túi bào tử XẸP (từ hình trái) + túi PHỒNG (từ hình phải);
rig; 2 clip (đứng thở nhẹ · thở xẹp↔phồng – Nấm không di chuyển) → gói + ảnh kiểm + GIF.

Nguồn: art/huong-moi/nguon/quai/nam-tho.png (nền trắng: hình túi xẹp (trái) + túi phồng (phải) + gốc, mũ, túi rời (dưới)).
Hai hình trên trùng nhau ở gốc/mũ (dời đúng 630 px ngang, đo bằng IoU phần rễ) → túi phồng cắt từ hình phải, dời về hệ toạ độ
hình trái. Mảnh rời dưới cùng không cần dùng (gốc/mũ lấy thẳng từ hình nguyên con, phần khuất được lấp).
Chạy: python3 dung.py"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, os.path.normpath(os.path.join(ROOT, '..', 'code-chung')))
import numpy as np
import cutout as cc
import xuat_chung as xc

SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'nguon', 'quai', 'nam-tho.png'))
KHOA = 'namtho'; TEN = 'Nấm Thở'

rgb, alpha0 = cc.tach_nen(SRC)
tp, lab = cc.thanh_phan(alpha0)
def chi_cum(x, y): return np.where(lab == lab[y, x], alpha0, 0).astype(np.float32)
a_xep = chi_cum(400, 400); a_phong = chi_cum(1030, 400)
DX_PHONG = 630                                       # hình phồng = hình xẹp dời 630 px ngang
HOP_X = (100, 40, 742, 585); HOP_P = (HOP_X[0] + DX_PHONG, HOP_X[1], HOP_X[2] + DX_PHONG, HOP_X[3])
DAT_Y = 574.0; DINH_Y = 52.0
CAO_LOGIC = 84.0                                     # ≈ ¾ Lam
TY = CAO_LOGIC / (DAT_Y - DINH_Y)
GOC = (380.0, DAT_Y)

MU = [(105, 275), (105, 190), (250, 105), (360, 45), (430, 50), (530, 150), (610, 250), (668, 318), (656, 338), (600, 332), (540, 320),
      (490, 306), (468, 290), (430, 268), (380, 262), (335, 262), (310, 280), (260, 292), (205, 282), (160, 272)]
SPECS_X = [
    {'ten': 'goc', 'da': [], 'lap': [[(318, 232), (482, 232), (520, 300), (545, 480), (470, 505), (440, 330), (330, 300)]]},
    {'ten': 'tui-xep', 'da': [[(462, 330), (488, 316), (520, 322), (560, 356), (620, 366), (668, 398), (684, 450), (664, 498), (612, 510),
                               (568, 494), (528, 458), (503, 420), (486, 382)]],
     'lap': [[(455, 290), (520, 290), (525, 330), (462, 332)]]},
    {'ten': 'mu', 'da': [MU]},
]
manh_x, _ = cc.dung_manh(rgb, a_xep, HOP_X, SPECS_X, 'goc')
# túi phồng: cắt ở hình phải (gốc/mũ của hình phải chỉ dùng để chia chủ, không xuất)
def dp(poly): return [(x + DX_PHONG, y) for x, y in poly]
SPECS_P = [   # túi phồng ĐÈ lên vành mũ bên phải (trong ảnh phồng, túi đẩy vành mũ ra sau) → túi đứng sau mũ trong danh sách = được ưu tiên
    {'ten': 'goc-p', 'da': []},
    {'ten': 'mu-p', 'da': [dp(MU)]},
    {'ten': 'tui-phong', 'da': [dp([(452, 330), (456, 300), (470, 266), (510, 258), (570, 255), (612, 252), (652, 246), (692, 266), (730, 318),
                                   (742, 390), (725, 450), (685, 492), (620, 512), (560, 508), (505, 485), (470, 445), (452, 385)])]},
]
manh_p_all, _ = cc.dung_manh(rgb, a_phong, HOP_P, SPECS_P, 'goc-p')
manh_p = {'tui-phong': manh_p_all['tui-phong']}

def giu_teal(m):   # khe sáng teal yếu (dấu hiệu) giữ màu gốc
    h, s, v = cc.rgb_hsv(m[..., :3] / 255)
    return (h > 150) & (h < 200) & (s > 0.25) & (v > 0.45)

CO_TUI = (492.0, 336.0)          # cổ túi (chỗ túi bám vào thân) – túi phồng/xẹp quanh điểm này
RIG_NUT = [
    ('goc', None, GOC, None, True),
    ('than', 'goc', (380.0, DAT_Y), 'goc', True),
    ('tui_xep', 'than', CO_TUI, 'tui-xep', True),
    ('tui_phong', 'than', CO_TUI, 'tui-phong', False),
    ('mu', 'than', (400.0, 262.0), 'mu', True),
]
VE = ['than', 'tui_xep', 'mu', 'tui_phong']
rig = cc.Rig(RIG_NUT, VE, TY, GOC)

# ---------------- CLIP ----------------
def ease(x): x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)
# ĐỨNG: túi xẹp phập phồng nhẹ (3 s), mũ nâng–hạ trễ nhịp, thân nhún rất nhỏ.
T_DUNG = 3.0
def f_dung(P, t):
    w = 2 * math.pi * t / T_DUNG
    s = math.sin(w)
    cc.cong(P, 'tui_xep', sx=1 + 0.05 * s, sy=1 + 0.035 * s, goc=-1.2 * s)
    cc.cong(P, 'than', sy=1 + 0.006 * math.sin(w - 0.4), sx=1 - 0.004 * math.sin(w - 0.4))
    cc.cong(P, 'mu', dy=-2.5 * math.sin(w - 0.7), goc=0.6 * math.sin(w - 1.0))

# THỞ (phồng ↔ xẹp), 2,6 s: hít chậm 0–0,9 s (túi xẹp căng dần rồi chuyển sang túi phồng – túi phồng hiện dần ĐÈ lên), giữ căng
# 0,9–1,5 s (rung nhẹ), thở ra nhanh 1,5–1,85 s (túi phồng co + mờ đi để lộ túi xẹp, mũ nhún xuống, thân giật) rồi nghỉ.
T_THO = 2.6
def f_tho(P, t):
    t = t % T_THO
    hit = ease(t / 0.9) if t < 1.5 else 1 - ease((t - 1.5) / 0.35)
    # túi xẹp: căng từ 1 → 1,22 (dưới túi phồng); túi phồng: 0,84 → 1, hiện 0,45–0,8 s, mờ 1,55–1,8 s
    sx_x = 1 + 0.22 * hit; sy_x = 1 + 0.20 * hit
    cc.cong(P, 'tui_xep', sx=sx_x, sy=sy_x, goc=-3 * hit)
    hien_p = (0.45 <= t < 1.82)
    if hien_p:
        mo = ease((t - 0.45) / 0.35) if t < 1.5 else 1 - ease((t - 1.55) / 0.25)
        k = 0.84 + 0.16 * hit
        rung = 0.012 * math.sin(2 * math.pi * 7 * t) * (0.9 <= t < 1.5)
        cc.cong(P, 'tui_phong', hien=True, mo=max(0.0, min(1.0, mo)), sx=k + rung, sy=k - rung)
        if mo >= 0.999: cc.cong(P, 'tui_xep', hien=False)
    # thân / mũ: hít → mũ nâng + ngửa nhẹ; thở ra → mũ nhún xuống, thân giật ngắn
    ra = math.exp(-((t - 1.62) / 0.09) ** 2) if t > 1.4 else 0.0
    cc.cong(P, 'mu', dy=-6 * hit + 7 * ra, goc=1.8 * hit - 1.2 * ra)
    cc.cong(P, 'than', sy=1 + 0.012 * hit - 0.02 * ra, sx=1 - 0.006 * hit + 0.015 * ra, goc=-0.6 * hit)

CLIPS = {
    'dung': cc.nuong_clip(rig, 'đứng thở nhẹ (túi xẹp phập phồng, mũ nâng–hạ trễ)', T_DUNG * 1000, True, f_dung),
    'tho': cc.nuong_clip(rig, 'thở xẹp ↔ phồng (hít 0,9 s – giữ – thở ra nhanh ở 1,5–1,85 s); Nấm không di chuyển', T_THO * 1000, True, f_tho,
                         them={'su_kien_tho_ra_ms': 1500}),
}
P_phong = rig.tu_the(); P_phong['tui_xep'][7] = 0; P_phong['tui_phong'][7] = 1

xc.chay(dict(ROOT=ROOT, KHOA=KHOA, TEN=TEN, rgb=rgb, rig=rig, CLIPS=CLIPS, TY=TY, GOC=GOC, giu=giu_teal, ten_tep='nam-tho',
             nhom=[dict(ten='túi xẹp', HOP=HOP_X, manh=manh_x, THU_TU=['goc', 'tui-xep', 'mu'], alpha=a_xep),
                   dict(ten='túi phồng', HOP=HOP_P, manh=manh_p, THU_TU=['goc', 'mu', 'tui-phong'], alpha=a_phong, dich=(-DX_PHONG, 0), duoi='-phong')],
             cao_ghi=CAO_LOGIC,
             them={'cao_px_logic': CAO_LOGIC,
                   'hitbox_than_de_xuat': {'w': 40, 'h': 80, 'ghi_chu': 'hộp thân gợi ý (thân + mũ), chưa phải số gameplay'}},
             bien_gif={'tho': (0, 4, 14, 0)},
             clip_gif=[('dung', 'dung', T_DUNG), ('tho', 'tho', T_THO * 2)]))
