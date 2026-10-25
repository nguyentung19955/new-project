"""Đo ảnh mẫu 02 (master-s.png) để đặt dáng nghỉ – bằng chứng cho PROMPT mục 2.

Mỗi mảnh cứng được dò vị trí/góc tốt nhất trên ảnh mẫu bằng tương quan theo HỌ MÀU
(viền, xanh, ngọc, nâu, vàng, mắt, thép; nền trắng bị phạt ×1,5). Điểm số = tỉ lệ điểm ảnh
của mảnh rơi đúng họ màu trên ảnh mẫu (trừ phạt). Không có tối ưu toàn thân: từng mảnh dò riêng,
cửa sổ tìm quanh vị trí v2, nên kết quả có thể kiểm lại bằng mắt ở kiem-thu/01-do-mau-*.png.
"""
import os, json, math
import numpy as np
from PIL import Image, ImageDraw
from scipy.signal import fftconvolve
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
import khuon3 as K

FAM_OF = {'ink': 0, 'den': 0, 'xanh': 1, 'xanh_bong': 1, 'ngoc': 2, 'ngoc_bong': 2, 'nau': 3, 'nau_bong': 3,
          'nau_toi': 3, 'vang_dong': 4, 'mat': 5, 'thep': 6, 'thep_bong': 6}
WHITE = 7
NAMES = list(K.PAL)
COLS = np.array([K.PAL[c] for c in NAMES] + [(255, 255, 255)], float)
FAM = np.array([FAM_OF[c] for c in NAMES] + [WHITE])


def fam_map(rgb):
    d = ((rgb[..., None, :].astype(float) - COLS[None, None]) ** 2).sum(-1)
    return FAM[np.argmin(d, -1)]


def master():
    m = np.array(Image.open(os.path.join(HERE, 'master-s.png')).convert('RGB'))
    return m, fam_map(m)


def score_map(img, mf):
    A = np.array(img); al = A[..., 3] > 127
    c = fam_map(A[..., :3])
    h, w = al.shape
    S = np.zeros((mf.shape[0] + h - 1, mf.shape[1] + w - 1))
    for k in set(c[al].tolist()):
        S += fftconvolve((mf == k).astype(float), (al & (c == k))[::-1, ::-1].astype(float), mode='full')
    S -= 1.5 * fftconvolve((mf == WHITE).astype(float), al[::-1, ::-1].astype(float), mode='full')
    return S / al.sum(), h, w


def fit(img, mf, guess, angles, win=30):
    """img: RGBA mảnh; guess: tâm ảnh dự kiến (thế giới). Trả (điểm, góc_kim_đồng_hồ, cx, cy)."""
    best = None
    for a in angles:
        im = img.rotate(-a, expand=True, resample=Image.NEAREST)   # PIL: dương = ngược chiều kim
        S, h, w = score_map(im, mf)
        ys, xs = np.mgrid[:S.shape[0], :S.shape[1]]
        cx = xs - (w - 1) + w / 2.0; cy = ys - (h - 1) + h / 2.0
        S[(abs(cx - guess[0]) > win) | (abs(cy - guess[1]) > win)] = -9
        i = np.unravel_index(np.argmax(S), S.shape)
        v = (float(S[i]), float(a), float(cx[i]), float(cy[i]))
        if best is None or v[0] > best[0]:
            best = v
    return best


def score_at(img, mf, a, cx, cy):
    im = img.rotate(-a, expand=True, resample=Image.NEAREST)
    S, h, w = score_map(im, mf)
    ix = int(round(cx - w / 2.0 + (w - 1))); iy = int(round(cy - h / 2.0 + (h - 1)))
    return float(S[iy, ix])


def overlay(mrgb, img, a, cx, cy, color=(255, 0, 255)):
    im = img.rotate(-a, expand=True, resample=Image.BICUBIC)
    al = np.array(im)[..., 3] > 127
    edge = al & ~ndimage.binary_erosion(al, iterations=2)
    o = Image.fromarray(mrgb).convert('RGBA')
    ov = np.zeros(al.shape + (4,), np.uint8); ov[edge] = color + (255,)
    o.alpha_composite(Image.fromarray(ov), (int(round(cx - im.width / 2)), int(round(cy - im.height / 2))))
    return o


def mask_iou(rgba_render, mrgb):
    """IoU silhouette (alpha>127 vs điểm không trắng của ảnh mẫu) và tỉ lệ khớp họ màu."""
    a = np.array(rgba_render)
    ra = a[..., 3] > 127
    H, W = mrgb.shape[:2]
    ra = ra[:H, :W]
    ma = mrgb.min(-1) < 235
    inter = (ra & ma).sum(); uni = (ra | ma).sum()
    rf = fam_map(a[:H, :W, :3]); mf = fam_map(mrgb)
    both = ra & ma
    return dict(iou=round(float(inter / uni), 4), khop_ho_mau=round(float((rf[both] == mf[both]).mean()), 4),
                thua=int((ra & ~ma).sum()), thieu=int((ma & ~ra).sum()))


# ======================================================================
#  Suy dáng nghỉ v3 từ ảnh mẫu (chạy: python3 do_mau.py) – ghi kiem-thu/01-*
# ======================================================================
FIT_SPEC = {   # mảnh: (tâm dò ban đầu, dải góc, cửa sổ ±px) – cửa sổ quanh vị trí v2 / vị trí nhìn thấy trên ảnh 02
    'than': ((220, 352), [0], 30),            # góc: thử −8..8 cho điểm 0,444..0,454 (chênh <1 %) → giữ 0 như v2
    'mu': ((181, 152), range(-4, 5), 25),
    'capelet-sau': ((165, 285), range(-6, 7), 25),
    'vat-sau': ((170, 370), range(-12, 13), 25),
    'dai': ((236, 338), range(-10, 11), 25),
    'bao-dao': ((160, 352), range(-8, 9), 25),
    'chuong': ((245, 290), range(-30, 31, 2), 20),
    'gang-xa': ((101, 349), range(-180, 181, 4), 45),
    'gang-gan': ((312, 338), range(-60, 1), 30),
    'dao': ((366, 326), range(-40, 1), 30),
    'ung-xa': ((150, 437), [0], 35),          # đế phẳng chạm đất: góc 0 (0,561 so với 0,562 ở +2°)
    'ung-gan': ((269, 437), range(-10, 11), 30),
}


def _rot(M): return math.degrees(math.atan2(M[1, 0], M[0, 0]))


def _ik(a, b, l1, l2, sign):
    v = b - a; dd = float(np.hypot(*v)); reach = min(dd, l1 + l2 - 1e-6)
    base = math.atan2(v[1], v[0]); c = (l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach)
    t = base + sign * math.acos(max(-1, min(1, c))); e = a + l1 * np.array([math.cos(t), math.sin(t)])
    t2 = math.atan2(b[1] - e[1], b[0] - e[0]) if dd <= l1 + l2 else t
    return math.degrees(t), math.degrees(t2), e, dd


def suy_dang_nghi(pc, dims, R_v2, attach, sides):
    """Từ kết quả dò mảnh cứng + IK (xương giữ nguyên) → giá trị cục bộ. Trả (R, bao_cao)."""
    import copy, rap3, khung
    mrgb, mf = master()
    full = K.from_src('mu', 1.0, ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong'])
    fimg = {n: pc[n].rgba('mau') for n in FIT_SPEC}; fimg['mu'] = full.rgba('mau')
    rep = {'manh': {}, 'chi': {}}
    Fw = {}
    for n, (g, ar, win) in FIT_SPEC.items():
        s, a, cx, cy = fit(fimg[n], mf, g, ar, win)
        w, h = dims[n]['w'], dims[n]['h']
        Fw[n] = rap3.T_(cx, cy) @ rap3.R_(a) @ rap3.T_(-w / 2, -h / 2)
        rep['manh'][n] = dict(diem=round(s, 3), goc=a, tam=[cx, cy])
    R = copy.deepcopy(R_v2)
    Mt = Fw['than']; root = rap3.app(Mt, R['than']['P'])

    def set_world(n, Mw):
        P = R[n]['P']; gan = rap3.app(np.linalg.inv(Mt), rap3.app(Mw, P))
        R[n]['gan'] = [round(float(gan[0]), 2), round(float(gan[1]), 2)]
        R[n]['goc_nghi'] = round(_rot(Mw) - _rot(Mt), 3)
    for n in ('mu', 'capelet-sau', 'vat-sau', 'dai', 'bao-dao', 'chuong'):
        set_world(n, Fw[n])
    # dao gắn trong găng gần: điểm gắn + góc tương đối lấy từ hai kết quả dò
    Mg, Md = Fw['gang-gan'], Fw['dao']
    gd = rap3.app(np.linalg.inv(Mg), rap3.app(Md, dims['dao']['P']))
    R['dao']['gan'] = [round(float(gd[0]), 2), round(float(gd[1]), 2)]
    R['dao']['goc_nghi'] = round(_rot(Md) - _rot(Mg) - dims['gang-gan']['huong'], 3)
    # chi: IK với xương v2 cố định, điểm gắn trên thân = attach[...]
    for ch, (end, sign) in sides.items():
        names = khung.CHAIN[ch]
        loc = attach[names[0]]
        sh = rap3.app(Mt, loc); tgt = rap3.app(Fw[end], dims[end]['P'])
        l1, l2 = dims[names[0]]['xuong'], dims[names[1]]['xuong']
        a1, a2, e, dd = _ik(sh, tgt, l1, l2, sign)
        gb = _rot(Fw[end]) + dims[end]['huong']
        R[names[0]]['gan'] = list(loc); R[names[0]]['goc_nghi'] = round(a1, 3)
        R[names[1]]['goc_nghi'] = round(a2 - a1, 3); R[names[2]]['goc_nghi'] = round(gb - a2, 3)
        rep['chi'][ch] = dict(diem_gan_than=list(loc), goc_the_gioi=[round(float(x), 1) for x in sh],
                              dich=[round(float(x), 1) for x in tgt], khoang_cach=round(dd, 1),
                              tam_voi=round(l1 + l2, 1), thieu=round(max(0.0, dd - l1 - l2), 1),
                              khop_giua=[round(float(x), 1) for x in e])
    rep['goc_toa_do'] = [round(float(root[0]), 2), round(float(root[1]), 2)]
    return R, rep, root


def an_khi_nghi(R, mkrig, names, root):
    """Đặt mảnh ảnh 02 không thấy (vạt trước, capelet trước) sao cho bị che hoàn toàn ở dáng nghỉ,
    dịch ít nhất có thể so với vị trí cục bộ v2."""
    import copy, rap3
    rep = {}
    for n in names:
        g0 = list(R[n]['gan']); best = None
        for dx in range(-40, 41, 5):
            for dy in range(-40, 41, 5):
                for a in (-20, -10, 0, 10, 20):
                    R2 = copy.deepcopy(R); R2[n]['gan'] = [g0[0] + dx, g0[1] + dy]; R2[n]['goc_nghi'] = a
                    rig = mkrig(R2, root); L = rig.layers(); ids = rap3.render_ids(L)
                    k = [x[0] for x in L].index(n); v = int((ids == k).sum())
                    key = (v, abs(dx) + abs(dy) + abs(a) / 2)
                    if best is None or key < best[0]:
                        best = (key, dx, dy, a)
        R[n]['gan'] = [g0[0] + best[1], g0[1] + best[2]]; R[n]['goc_nghi'] = float(best[3])
        rep[n] = dict(gan_v2_cuc_bo=g0, gan_v3=R[n]['gan'], goc=best[3], diem_con_thay=best[0][0])
    return R, rep
