# -*- coding: utf-8 -*-
"""Bộ xương chuẩn Cu Tí (chibi, đầu to) + động học thuận (FK) + chiếu nhìn từ trên xuống ~30°.

Hệ trục thân: x = phía trước mặt, y = bên TRÁI của Cu Tí, z = lên trên.
Hệ trục thế giới: X = sang phải màn hình, Y = vào trong màn hình (phía Bắc / xa camera), Z = lên.
Chiếu xiên: màn hình sx = 48 + X ; sy = 90 - Z - 0.5*Y (sin 30° = 0.5) ; độ gần camera = -Y.
Điểm chạm đất cố định của MỌI khung, MỌI hướng: (48, 90) = điểm trên đất ngay dưới hông giữa.
"""
import math
import numpy as np

O = 96            # ô 96x96
GOC = (48.0, 90.0)  # điểm chạm đất cố định
NGHIENG = 0.5     # sin(30°): độ dẹt chiều sâu khi nhìn từ trên xuống

# ---- số đo bộ xương (điểm ảnh trong ô 96), tỉ lệ chibi theo ảnh Cu Tí: đầu ~42% chiều cao ----
DO = dict(
    dui=10.0, cang=10.0, co_chan=2.0, ban_chan=5.0,   # đùi, cẳng chân, cổ chân cao hơn đất, bàn chân
    hong_rong=4.5,                                    # nửa khoảng cách 2 hông
    eo=3.0, nguc=10.0, co=2.5,                        # hông giữa -> eo -> vai -> cổ
    vai_rong=7.0,
    canh_tay=9.0, cang_tay=8.0,
    dau_cao=14.0, dau_r=14.5,                         # tâm đầu cách gốc cổ 14, bán kính đầu 14.5
)
# vũ khí: (dài phía mũi tính từ nắm tay, dài phía chuôi/cán sau nắm tay)
VK = {
    'kiem': (24.0, 4.0),
    'thuong': (30.0, 12.0),
    'bua': (20.0, 5.0),      # mũi = đầu búa
    'phitieu': (3.5, 0.0),   # phi tiêu nhỏ kẹp giữa ngón
}

HUONG = {  # góc mặt (độ, ngược chiều kim đồng hồ từ +X)
    's': -90.0, 'se': -45.0, 'e': 0.0, 'ne': 45.0, 'n': 90.0,
}
TEN_HUONG = {'s': 'Xuống (S)', 'se': 'Chéo xuống phải (SE)', 'e': 'Phải (E)', 'ne': 'Chéo lên phải (NE)', 'n': 'Lên (N)',
             'sw': 'Chéo xuống trái (SW) = gương SE', 'w': 'Trái (W) = gương E', 'nw': 'Chéo lên trái (NW) = gương NE'}
GUONG = {'sw': 'se', 'w': 'e', 'nw': 'ne'}


def Rx(d):
    a = math.radians(d); c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def Ry(d):
    a = math.radians(d); c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def Rz(d):
    a = math.radians(d); c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


XUONG_DUOI = np.array([0, 0, -1.0])
TRUOC = np.array([1.0, 0, 0])

# Tư thế gốc: mọi tham số (độ). Ý nghĩa:
#  fx, fy, lz : dời hông giữa (trước / trái / nhấc khỏi đất thêm)
#  rp, ry, rr : xoay CẢ NGƯỜI (cúi tới trước / quay / nghiêng ngang) — dùng cho lộn, ngã
#  lean, tw, sd : thân trên so với hông (cúi tới, vặn vai, nghiêng ngang)
#  hp, hy : đầu (cúi / quay)
#  <T|P>a, b, c, e : tay trái/phải: vung tới (0 = buông xuống, 90 = ngang trước, 180 = thẳng lên),
#                    dang ra ngoài, xoay ngang vào trong, gập khuỷu
#  wp, wy : vũ khí so với cẳng tay phải (0 = vuông góc phía mu tay; -90 = nối dài cẳng tay; +90 = ngược về khuỷu)
#  <T|P>h, hb, hy2, k, t : chân: đá tới, dang ra, xoay, gập gối, gập cổ chân
GOC_TU_THE = dict(fx=0, fy=0, lz=0, rp=0, ry=0, rr=0, lean=0, tw=0, sd=0, hp=0, hy=0,
                  Pa=0, Pb=0, Pc=0, Pe=0, Ta=0, Tb=0, Tc=0, Te=0, wp=0, wy=0,
                  Ph=0, Phb=0, Phy=0, Pk=0, Pt=0, Th=0, Thb=0, Thy=0, Tk=0, Tt=0)

KHOP = ['dau', 'co', 'nguc', 'eo', 'vai_t', 'vai_p', 'khuyu_t', 'khuyu_p', 'co_tay_t', 'co_tay_p',
        'hong_t', 'hong_p', 'goi_t', 'goi_p', 'co_chan_t', 'co_chan_p', 'mui_chan_t', 'mui_chan_p', 'vk_goc', 'vk_mui']

# các khớp quay được (để kiểm "nhảy góc"): tên -> ma trận quay cục bộ
TEN_KHOP_QUAY = {'than': 'cả người', 'eo': 'eo (thân trên)', 'co': 'cổ (đầu)', 'vai_p': 'vai phải', 'vai_t': 'vai trái',
                 'khuyu_p': 'khuỷu phải', 'khuyu_t': 'khuỷu trái', 'co_tay_p': 'cổ tay phải (vũ khí)',
                 'hong_p': 'hông phải', 'hong_t': 'hông trái', 'goi_p': 'gối phải', 'goi_t': 'gối trái',
                 'co_chan_p': 'cổ chân phải', 'co_chan_t': 'cổ chân trái'}


def quay_cuc_bo(p):
    """Ma trận quay cục bộ từng khớp (so với khớp cha). Dùng cả cho FK lẫn kiểm góc."""
    R = {}
    R['than'] = Rz(p['ry']) @ Ry(p['rp']) @ Rx(p['rr'])
    R['eo'] = Rz(p['tw']) @ Ry(p['lean']) @ Rx(p['sd'])
    R['co'] = Rz(p['hy']) @ Ry(p['hp'])
    for s, sg in (('P', -1), ('T', 1)):  # bên phải nằm phía -y
        k = 'p' if s == 'P' else 't'
        R['vai_' + k] = Rz(-sg * p[s + 'c']) @ Rx(sg * p[s + 'b']) @ Ry(-p[s + 'a'])
        R['khuyu_' + k] = Ry(-p[s + 'e'])
        R['hong_' + k] = Rz(-sg * p[s + 'hy']) @ Rx(sg * p[s + 'hb']) @ Ry(-p[s + 'h'])
        R['goi_' + k] = Ry(p[s + 'k'])
        R['co_chan_' + k] = Ry(-p[s + 't'])
    R['co_tay_p'] = Rz(p['wy']) @ Ry(-p['wp'])
    return R


def fk(p, huong, vk=None):
    """Trả về dict khớp -> điểm 3D thế giới (chưa chỉnh chạm đất), và ma trận quay khớp."""
    q = dict(GOC_TU_THE); q.update(p)
    p = q
    R = quay_cuc_bo(p)
    Rf = Rz(HUONG[huong])
    Rt = Rf @ R['than']
    hg = Rf @ np.array([p['fx'], p['fy'], 0.0])  # hông giữa (z sẽ chỉnh sau)
    P = {}
    P['eo'] = hg.copy()  # "eo/hông giữa"
    # hông 2 bên
    hongp = hg + Rt @ np.array([0, -DO['hong_rong'], 0]); hongt = hg + Rt @ np.array([0, DO['hong_rong'], 0])
    # thân trên
    Rc = Rt @ R['eo']
    eo_khop = hg + Rt @ np.array([0, 0, DO['eo']])
    nguc_tam = eo_khop + Rc @ np.array([0, 0, DO['nguc'] * 0.55])
    vai_cao = eo_khop + Rc @ np.array([0, 0, DO['nguc']])
    P['nguc'] = nguc_tam
    vaip = vai_cao + Rc @ np.array([0, -DO['vai_rong'], 0]); vait = vai_cao + Rc @ np.array([0, DO['vai_rong'], 0])
    co = vai_cao + Rc @ np.array([0, 0, DO['co']])
    P['co'] = co
    Rh = Rc @ R['co']
    P['dau'] = co + Rh @ np.array([0, 0, DO['dau_cao']])
    mat = {}
    for k, base in (('p', vaip), ('t', vait)):
        Ru = Rc @ R['vai_' + k]
        kh = base + Ru @ (XUONG_DUOI * DO['canh_tay'])
        Rl = Ru @ R['khuyu_' + k]
        ct = kh + Rl @ (XUONG_DUOI * DO['cang_tay'])
        P['vai_' + k], P['khuyu_' + k], P['co_tay_' + k] = base, kh, ct
        mat['cang_tay_' + k] = Rl
    for k, base in (('p', hongp), ('t', hongt)):
        Ru = Rt @ R['hong_' + k]
        g = base + Ru @ (XUONG_DUOI * DO['dui'])
        Rl = Ru @ R['goi_' + k]
        cc = g + Rl @ (XUONG_DUOI * DO['cang'])
        Ra = Rl @ R['co_chan_' + k]
        # gót ở dưới cổ chân, mũi chân phía trước
        mui = cc + Ra @ (np.array([DO['ban_chan'], 0, -DO['co_chan']]))
        P['hong_' + k], P['goi_' + k], P['co_chan_' + k], P['mui_chan_' + k] = base, g, cc, mui
        P['got_' + k] = cc + Ra @ np.array([-1.0, 0, -DO['co_chan']])
    if vk:
        Rw = mat['cang_tay_p'] @ R['co_tay_p']
        d = Rw @ TRUOC
        dai, sau = VK[vk]
        P['vk_goc'] = P['co_tay_p'] - d * sau
        P['vk_mui'] = P['co_tay_p'] + d * dai
    P['_huong_mat'] = Rh @ TRUOC
    P['_Rh'] = Rh
    P['_Rc'] = Rc
    return P, R, p


def cham_dat(P, lz):
    """Dời cả người theo Z để điểm thấp nhất (gót, mũi chân, đáy đầu, tay, gối) chạm đất, rồi nhấc thêm lz."""
    pts = [P[k] for k in ('mui_chan_p', 'mui_chan_t', 'got_p', 'got_t', 'goi_p', 'goi_t', 'co_tay_p', 'co_tay_t',
                          'khuyu_p', 'khuyu_t', 'vai_p', 'vai_t', 'co', 'eo')]
    zmin = min(v[2] for v in pts)
    zmin = min(zmin, P['dau'][2] - DO['dau_r'] * 0.9)
    dz = -zmin + lz
    for k, v in P.items():
        if not k.startswith('_'):
            P[k] = v + np.array([0, 0, dz])
    return P


def chieu(v):
    """3D thế giới -> (sx, sy, độ gần camera)."""
    return (GOC[0] + v[0], GOC[1] - v[2] - NGHIENG * v[1], -v[1])


def dung_khung(p, huong, vk=None, can_giua=False):
    P, R, q = fk(p, huong, vk)
    if can_giua:  # dời ngang cho trọng tâm các khớp nằm trên điểm gốc
        ks = [k for k in P if not k.startswith('_')]
        cx = sum(P[k][0] for k in ks) / len(ks); cy = sum(P[k][1] for k in ks) / len(ks)
        for k in ks:
            P[k] = P[k] - np.array([cx, cy, 0])
    P = cham_dat(P, q['lz'])
    if can_giua:  # lộn về phía camera: đẩy lùi vào trong cho đầu không lọt khỏi đáy ô
        day = GOC[1] - (P['dau'][2] - DO['dau_r']) - NGHIENG * P['dau'][1]
        if day > 94.5:
            for k in P:
                if not k.startswith('_'):
                    P[k] = P[k] + np.array([0, (day - 94.5) / NGHIENG, 0])
    return P, R


def goc_quay(Ra, Rb):
    """Góc (độ) của phép quay giữa 2 ma trận quay."""
    M = Ra.T @ Rb
    c = (np.trace(M) - 1) / 2
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))
