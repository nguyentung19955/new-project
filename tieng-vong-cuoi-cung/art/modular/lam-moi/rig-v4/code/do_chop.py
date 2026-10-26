"""Đo BẬC Ở CHÂN CHÓP khi chóp lắc (v3). Vẽ riêng mũ + gáy mũ + chóp ở dáng nghỉ, chóp xoay góc g, lấy viền trên.
  buou = lớp gáy ló lên trên viền chóp (px ảnh ngang) – vùng đỉnh x 500…600
  bac  = chóp nhô lên trên viền mũ ở chỗ giáp đỉnh (px ảnh ngang, trừ giá trị ở 0°) – vùng x 590…650
'v2' = pivot chóp cũ + mảnh chóp/gáy trước sửa (manh/goc/*-truoc-sua-chan.png); 'v3' = bản hiện tại."""
import os
import json
import copy
import numpy as np
import rig as R
from chung import MANH

BOX = (450, 20, 700, 300)


def rig_cho(phien_ban):
    ch = json.load(open(os.path.join(MANH, 'goc', 'chuan-hoa.json'), encoding='utf-8'))
    if phien_ban == 'v3':
        rig, _ = R.build_rig(ch)
        return rig
    cu = R.CHOP_PIVOT
    R.CHOP_PIVOT = R.CHOP_PIVOT_V2
    try:
        rig, _ = R.build_rig(ch)
    finally:
        R.CHOP_PIVOT = cu
    rig = copy.deepcopy(rig)
    rig['nut']['mu-gay']['anh'] = 'manh/goc/mu-gay-truoc-sua-chan.png'
    rig['nut']['chop-mu']['anh'] = 'manh/goc/chop-mu-truoc-sua-chan.png'
    return rig


def _tren(rig, g, only):
    a = np.array(R.render(rig, {'chop-mu': {'goc': g}}, BOX, 1.0, only=only, toi={}))[..., 3] / 255.0
    c = np.cumsum(a, 0)
    t = np.array([np.searchsorted(c[:, x], 0.5) for x in range(a.shape[1])], float)
    t[t >= a.shape[0] - 1] = np.nan
    return t


def do(rig, g):
    xs = np.arange(BOX[2] - BOX[0]) + BOX[0]
    tc = _tren(rig, g, ['mu', 'mu-gay', 'chop-mu'])
    tch = _tren(rig, g, ['chop-mu'])
    tm = _tren(rig, g, ['mu'])
    L = (xs >= 500) & (xs <= 600)
    Rr = (xs >= 590) & (xs <= 650)
    return float(np.nanmax((tch - tc)[L])), float(np.nanmax((tm - tc)[Rr]))


def bang(phien_ban, goc_list, k):
    rig = rig_cho(phien_ban)
    b0 = do(rig, 0.0)[1]
    out = {}
    for g in goc_list:
        h, b = do(rig, g)
        h, b = max(h - 1.0, 0.0), max(b - b0, 0.0)          # 1 px ở 0° là khử răng cưa
        out[f'{g:+g}'] = {'buou_px_anh_ngang': round(h, 1), 'bac_px_anh_ngang': round(b, 1),
                          'lon_nhat_px_sheet_2x': round(max(h, b) * 2 * k, 2)}
    return out
