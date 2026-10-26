"""Đo NẢY ĐẦU (mũ) theo bảng nhún – dùng chung cho phan_tich.py. Đơn vị px logic (Lam cao 112).
Điểm đo: đỉnh mũ (điểm cao nhất của mảnh mũ ở dáng nghỉ, gắn theo mũ) và mắt; so với thân (pivot thân)."""
import os
import numpy as np
from PIL import Image
from chung import RIG
from rig import world_mats, piece_matrix
import chu_ky

N = 640


def diem_dinh_mu(rig):
    nd_ = rig['nut']['mu']
    a = np.array(Image.open(os.path.join(RIG, nd_['anh'])))[..., 3] > 128
    ys, xs = np.nonzero(a)
    i = np.argmin(ys)
    return float(xs[ys == ys[i]].mean()), float(ys[i])


def do(rig, k, bang):
    cu = chu_ky.BANG_CHON
    chu_ky.dat_bang(bang)
    p_dinh = diem_dinh_mu(rig)
    T = chu_ky.CHU_KY_S
    phis = np.arange(N) / N
    dinh, mat, than, chop = [], [], [], []
    for phi in phis:
        pose, _ = chu_ky.make_pose(rig, phi)
        m = world_mats(rig, pose)
        W = piece_matrix(rig['nut']['mu'], m['mu'])
        dinh.append((W @ np.array([p_dinh[0], p_dinh[1], 1.0]))[1])
        mat.append(m['mat-gan'][1, 2])
        than.append(m['than'][1, 2])
        chop.append(pose['chop-mu']['goc'])
    chu_ky.dat_bang(cu)
    dinh, mat, than = (np.array(v) * k for v in (dinh, mat, than))
    dt = T / N

    def vt(y):
        v = (np.roll(y, -1) - np.roll(y, 1)) / (2 * dt)
        a = (np.roll(y, -1) - 2 * y + np.roll(y, 1)) / dt ** 2
        return float(np.abs(v).max()), float(np.abs(a).max())
    tuong_doi = dinh - than
    vd, ad = vt(dinh)
    vth, ath = vt(than)
    return {
        'than_cao_thap_px_logic': round(float(than.max() - than.min()), 2),
        'dinh_mu_cao_thap_px_logic': round(float(dinh.max() - dinh.min()), 2),
        'mat_cao_thap_px_logic': round(float(mat.max() - mat.min()), 2),
        'dau_so_voi_than_cao_thap_px_logic': round(float(tuong_doi.max() - tuong_doi.min()), 2),
        'ty_le_dau_lac_so_voi_nhun_than': round(float((tuong_doi.max() - tuong_doi.min()) / max(than.max() - than.min(), 1e-6)), 2),
        'ty_le_dinh_mu_so_voi_than': round(float((dinh.max() - dinh.min()) / max(than.max() - than.min(), 1e-6)), 2),
        'van_toc_doc_dinh_mu_lon_nhat_px_logic_s': round(vd, 1),
        'gia_toc_doc_dinh_mu_lon_nhat_px_logic_s2': round(ad, 0),
        'van_toc_doc_than_lon_nhat_px_logic_s': round(vth, 1),
        'chop_do': [round(min(chop), 2), round(max(chop), 2)],
        '_chuoi': {'dinh': dinh, 'than': than, 'mat': mat},
    }
