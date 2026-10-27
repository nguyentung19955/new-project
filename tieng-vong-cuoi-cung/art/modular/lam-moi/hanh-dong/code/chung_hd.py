"""Dùng chung cho hoạt ảnh HÀNH ĐỘNG của Lam (chém, bị đánh, nhảy/rơi/tiếp đất, lướt, bám/trượt tường).
Dùng NGUYÊN rig + mảnh + tỉ lệ của rig-v4 (../../rig-v4/: lam-moi-v4.json, manh/, code/rig.py) – không sửa gì trong rig-v4.
Thiết kế nhân vật, cỡ 112 px, biên độ lắc đầu/chóp/chuông giữ như clip chạy (mũ ±1,25°, chóp ±3,5°, chuông ±3°).

Toạ độ: 'thế giới' = px ảnh nhìn ngang 1254×1254 của rig (y xuống, góc + = thuận chiều kim đồng hồ, Lam nhìn PHẢI).
Gốc rig (root) = giữa hai chân trên mặt đất = điểm CHÂN của collider trong game (pl.x+10, pl.y+30).
1 px logic game = 1071/112 = 9,5625 px thế giới; sheet 2x: 1 px sheet = 4,78 px thế giới (S = 0,20915 px sheet / px thế giới)."""
import os, sys, json
sys.dont_write_bytecode = True
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
HD = os.path.dirname(HERE)                                   # lam-moi/hanh-dong
RIG4 = os.path.normpath(os.path.join(HD, '..', 'rig-v4'))
sys.path.insert(0, os.path.join(RIG4, 'code'))
from chung import load_json, LAM_TOI, font                  # noqa: E402,F401
from rig import render, dat_ung, diem_the_gioi, world_mats  # noqa: E402,F401
from khung import thu_nho                                   # noqa: E402,F401

DOC = load_json(os.path.join(RIG4, 'lam-moi-v4.json'))
RIG = DOC['rig']
META_CHAY = json.load(open(os.path.join(RIG4, 'sprite', 'lam-chay-2x.json'), encoding='utf-8'))
GX, GY = RIG['goc_the_gioi']                                 # gốc thế giới (623,55, 1157)
S = META_CHAY['ty_le']['he_so_px_anh_ngang_sang_px_nguon']   # 0,20915 px sheet / px thế giới
LOGIC = S / 2                                                # px logic / px thế giới
SPRITE = os.path.join(HD, 'sprite')
GIF = os.path.join(HD, 'gif')
UNG0 = {'ung-gan': RIG['nut']['ung-gan']['diem_gan'][0], 'ung-xa': RIG['nut']['ung-xa']['diem_gan'][0]}   # x nghỉ ±122
DAO_MUI = (410.0, 79.0)       # mũi dao trong ảnh mảnh tay-truoc-dao
DAO_CHUOI = (190.0, 80.0)     # chắn tay (gốc lưỡi)

# ----------------------------------------------------------------- (27/10) clip CHẾT: tay KHÔNG dao + dao rời
# Không sửa rig-v4: cắt từ manh/tay-truoc-dao.png ra 2 ảnh trong ../manh-them/ (tạo lại mỗi lần chạy):
#   tay-truoc-khong-dao.png – nắm tay (cùng khung + pivot với tay-truoc-dao), cắt ở x = 146 và kẻ viền đen 6 px chỗ cắt
#   dao.png                 – chắn tay + lưỡi (x ≥ 144), dùng làm khung 'dao-roi' (dao văng khỏi tay khi chết)
# Thêm vào RIG (trong bộ nhớ) nút 'tay-truoc-tay' = bản sao nút tay-truoc-dao dùng ảnh nắm tay, mặc định ẨN.
MANH_THEM = os.path.join(HD, 'manh-them')
DAO_CAT = 146
DAO_TAM = (290.0, 80.0)       # tâm dao rời (giữa lưỡi + chắn) trong ảnh tay-truoc-dao


def _tao_manh_them():
    from PIL import Image
    os.makedirs(MANH_THEM, exist_ok=True)
    a = np.array(Image.open(os.path.join(RIG4, 'manh', 'tay-truoc-dao.png')).convert('RGBA'))
    tay = a.copy()
    tay[:, DAO_CAT:] = 0
    vien = tay[:, DAO_CAT - 6:DAO_CAT]
    m = vien[..., 3] > 0
    vien[m, 0:3] = (6, 4, 3)
    Image.fromarray(tay, 'RGBA').save(os.path.join(MANH_THEM, 'tay-truoc-khong-dao.png'), optimize=True)
    dao_ = a.copy()
    dao_[:, :DAO_CAT - 2] = 0
    Image.fromarray(dao_, 'RGBA').save(os.path.join(MANH_THEM, 'dao.png'), optimize=True)


_tao_manh_them()
_n = dict(RIG['nut']['tay-truoc-dao'])
_n['anh'] = os.path.join(MANH_THEM, 'tay-truoc-khong-dao.png')
_n['hien'] = False
RIG['nut']['tay-truoc-tay'] = _n
RIG['thu_tu_ve'] = list(RIG['thu_tu_ve']) + ['tay-truoc-tay']


def tu_the(than=(0, 0, 0), mu=(0, 0), chop=0, chuong=0, vt=0, td=0, vs=(0, 0), vsg=0, ts=0,
           ug=None, ux=None, X=0.0, co_dao=True):
    """Dựng một tư thế. than=(dx,dy,góc) (+dy = xuống, +góc = chúi trước); mu=(dy,góc) so với thân; vt = góc vai trước
    (− = vung tay ra TRƯỚC/lên, + = ra SAU); td = góc tay cầm dao quanh nắm tay (hướng lưỡi = vt+td+góc thân, 0 = chĩa
    trước, −90 = chĩa lên, +90 = chĩa xuống); vs/vsg/ts = vai sau (dịch, góc) + tay sau; ug/ux = ủng gần/xa
    (x so với gốc, khe hở với đất (+ lên), góc: − mũi hếch, + gót nhấc) – None = đứng nghỉ; X = dời CẢ người ngang.
    co_dao=False: tay trước KHÔNG còn dao (dao đã văng – clip chết)."""
    p = {'than': {'dich': [than[0] + X, than[1]], 'goc': than[2]}, 'mu': {'dich': [0.0, mu[0]], 'goc': mu[1]},
         'chop-mu': {'goc': chop}, 'chuong': {'goc': chuong}, 'vai-truoc': {'goc': vt}, 'tay-truoc-dao': {'goc': td},
         'vai-sau': {'dich': [vs[0], vs[1]], 'goc': vsg}, 'tay-sau': {'goc': ts}}
    for ten, u, g0 in (('ung-gan', ug, -5.19), ('ung-xa', ux, 7.93)):
        if u is None:                       # đứng nghỉ: đúng chỗ ủng của dáng nghỉ (ủng xa cao hơn 15 px – chiều sâu)
            p[ten] = {'dich': [X, 0.0], 'goc': g0}
        else:
            p[ten] = dat_ung(RIG, ten, u[0] + X, u[1], u[2])
    if not co_dao:
        p['tay-truoc-dao']['hien'] = False
        p['tay-truoc-tay'] = {'goc': td, 'hien': True}
    return p


def logic(P):
    """điểm thế giới → px logic so với chân (x phải, y xuống)"""
    return ((P[0] - GX) * LOGIC, (P[1] - GY) * LOGIC)


def dao(pose):
    """(mũi dao, chuôi dao) theo px logic so với chân, Lam nhìn phải"""
    return (logic(diem_the_gioi(RIG, pose, 'tay-truoc-dao', DAO_MUI)),
            logic(diem_the_gioi(RIG, pose, 'tay-truoc-dao', DAO_CHUOI)))
