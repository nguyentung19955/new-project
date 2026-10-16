#!/usr/bin/env python3
"""ĐO CẦM VŨ KHÍ (cam-vk-chuan, 16/10/2026) — đo lỗi cầm nắm từng khung theo LUAT.md, dùng chung cho soat.py (đo + ảnh) và
sua.py (tính bảng sửa game/js/cam_chuan_data.js).

Đơn vị: điểm ảnh ô 96 (= ½ điểm ảnh game). "1 điểm game" = 2 đơn vị ô 96.
Dựng khung y như game (js/zed_moi.js: thứ tự lớp, nắm tay từ ảnh, hàng nắm tay thân) bằng ve_zed.py của vk-khop-tay; mỗi lớp ghi
"chủ" từng điểm ảnh để biết cán có bị ngón che hay vẽ đè lên ngón.

Các phép đo (mỗi khung × cấp vũ khí):
  P   tâm nắm tay phải ĐO trên ảnh thân (khối da nhỏ quanh điểm cầm, dời dần như tam_nam) — lệch với điểm cầm > 2 → lỗi "lệch tâm nắm".
  T   tâm nắm tay thứ hai (thương / búa) — khoảng cách tới trục cán > 2 → lỗi "tay trái lệch cán / cán gãy khúc".
  G   kiếm: khoảng từ điểm cầm tới đốc chắn (cột ảnh vũ khí rộng vọt lên) so với nửa nắm tay phía lưỡi:
      đốc / lưỡi bắt đầu trong nắm tay (thiếu > 0,5) → lỗi "lưỡi trong nắm tay"; hở chuôi > 3 → lỗi "chuôi hở dài".
  L   lớp ngón: điểm ảnh cán trong vòng tròn bán kính 2,5 quanh điểm cầm (và tay thứ hai trên cán) có bị lớp tay che không;
      < 40 % bị che → lỗi "vũ khí đè lên ngón".
  F   phi tiêu: hướng thân phi tiêu so với hướng cẳng tay (khối da cẳng tay → nắm tay) lệch > 45° → lỗi "lệch hướng cổ tay";
      > 100° → "ngược hướng cổ tay".
"""
import math, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '../../../..'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/vk-khop-tay'))
import ve_zed as VZ  # noqa: E402

NGUONG_TAM = 2.0      # 1 điểm game
NGUONG_TRUC = 2.0
NGUONG_DOC_THIEU = 0.5
NGUONG_DOC_HO = 3.0
NGUONG_PHU = 0.4
NGUONG_PHI = 45.0


def da_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    # ngưỡng da nới cho ô 96 (điểm ảnh đã co tối hơn ảnh nguồn): cam da / nâu da, loại đỏ thắt lưng (g thấp) và đen
    return (r > 140) & (g > 80) & (b > 40) & (r - b > 45) & (r > g) & (a[..., 3] > 0)


def than96(T, hang, i):
    return np.array(T['_img'].crop((i * 96, hang * 96, i * 96 + 96, hang * 96 + 96)))


def tam_da(a, x, y, bk=(3.5, 3, 2.5, 2.5)):
    """Tâm nắm tay (khối da nhỏ) quanh (x, y) trên khung ô 96: cụm da (liền 8 hướng) gần (x, y) nhất trong bán kính bk[0], lấy
    phần trong bán kính bk[0] + 0,5 quanh chính cụm đó (không bị cẳng tay / tay kia bên cạnh kéo lệch). None: không có da (khuất / găng)."""
    from scipy import ndimage
    m = da_mask(a); yy, xx = np.mgrid[:96, :96] + 0.5
    d2 = (xx - x) ** 2 + (yy - y) ** 2
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    gan = lab[(d2 < bk[0] ** 2) & m]
    if len(gan) < 2:
        return None
    k = np.bincount(gan).argmax()
    v = (lab == k)
    cx, cy = xx[v & (d2 < bk[0] ** 2)].mean(), yy[v & (d2 < bk[0] ** 2)].mean()
    for _ in range(2):  # dời về giữa cụm (chỉ điểm của cụm đó)
        w = v & ((xx - cx) ** 2 + (yy - cy) ** 2 < (bk[0] + 0.5) ** 2)
        cx, cy = xx[w].mean(), yy[w].mean()
    return float(cx), float(cy), int(w.sum())


def cum_da(a):
    """Các cụm da (liền 8 hướng) của khung ô 96: [(nhãn, cỡ, cx, cy)], cùng mảng nhãn."""
    from scipy import ndimage
    m = da_mask(a)
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    yy, xx = np.mgrid[:96, :96] + 0.5
    ra = []
    for k in range(1, n + 1):
        v = lab == k
        ra.append((k, int(v.sum()), float(xx[v].mean()), float(yy[v].mean())))
    return ra, lab


def huong_cang_tay(a, p):
    """Hướng cẳng tay (độ, quy ước game: 0 = phải, dương = chúc xuống) = từ khuỷu / cẳng tay tới nắm tay. Ảnh ninja quấn băng đen cả
    cẳng tay nên lấy cụm da gần nhất PHÍA TRÊN nắm tay (bắp tay / khuỷu lộ dưới tay áo ngắn), không lấy mặt (cụm lớn) hay bàn chân."""
    C, lab = cum_da(a)
    yy, xx = np.mgrid[:96, :96] + 0.5
    k0 = lab[int(p[1]), int(p[0])] if 0 <= int(p[1]) < 96 and 0 <= int(p[0]) < 96 else 0
    tot = None
    for k, sz, cx, cy in C:
        if k == k0 or sz < 2 or sz > 40:
            continue
        d = math.hypot(cx - p[0], cy - p[1])
        if 3.5 < d < 15 and cy <= p[1] + 1 and (tot is None or d < tot[0]):
            tot = (d, cx, cy)
    if not tot:
        return None
    return math.degrees(math.atan2(p[1] - tot[2], p[0] - tot[1]))


def mat_na_mat(a):
    """Mặt (cụm da lớn nhất ở nửa trên khung ô 96), nới 1 điểm ảnh. None nếu không thấy."""
    from scipy import ndimage
    C, lab = cum_da(a)
    C = [x for x in C if x[1] >= 40 and x[3] < 50]
    if not C:
        return None
    k = max(C, key=lambda x: x[1])[0]
    return ndimage.binary_dilation(lab == k, iterations=1)


def cat_mat(a, p, goc, dai):
    """Cán từ p theo góc goc dài dai (ô 96) có đi qua mặt không (luật cũ: vũ khí không che mặt)."""
    mm = mat_na_mat(a)
    if mm is None:
        return False
    c, s = math.cos(math.radians(goc)), math.sin(math.radians(goc))
    for t in np.arange(0, dai, 0.5):
        x, y = int(p[0] + c * t), int(p[1] + s * t)
        if 0 <= x < 96 and 0 <= y < 96 and mm[y, x]:
            return True
    return False


# ---------- vũ khí: đốc chắn ----------
_DOC = {}


def doc_chan(V, loai, cap, cam):
    """Kiếm: cột ảnh (toạ độ ảnh vũ khí) nơi đốc chắn bắt đầu ở phía lưỡi tính từ điểm cầm cam; cùng cột đuôi chuôi."""
    k = (loai, cap, round(cam[0], 2), round(cam[1], 2))
    if k in _DOC:
        return _DOC[k]
    x, y, w, h = V['vk'][loai][cap]
    A = np.array(V['_img'].crop((x, y, x + w, y + h)))[..., 3] > 0
    cy = int(cam[1])
    ext = []
    for X in range(w):
        col = A[:, X]
        if not col[cy]:
            ext.append(0); continue
        a0 = cy
        while a0 > 0 and col[a0 - 1]:
            a0 -= 1
        b0 = cy
        while b0 < h - 1 and col[b0 + 1]:
            b0 += 1
        ext.append(b0 - a0 + 1)
    cx = int(cam[0])
    # bề dày chuôi = trung vị quanh điểm cầm; đốc = cột đầu tiên phía lưỡi rộng ≥ 1,5 × chuôi + 1
    vung = [e for e in ext[max(0, cx - 4): cx + 5] if e > 0]
    t = float(np.median(vung)) if vung else 8
    xg = next((X for X in range(cx, w) if ext[X] >= 1.5 * t + 1), w)
    # chuôi bắt đầu (phía đuôi): cột đầu tiên có bề dày ≈ chuôi (bỏ núm đốc / tua)
    xs = cx
    while xs > 0 and 0 < ext[xs - 1] <= 1.3 * t + 1:
        xs -= 1
    _DOC[k] = (xg, xs, t)
    return _DOC[k]


# ---------- dựng khung có "chủ" từng điểm ảnh ----------
LOP = {'trong': 0, 'than': 1, 'vk': 2, 'nam_sau': 3, 'tay_than': 4, 'nam_truoc': 5, 'ngon': 6}


def dung(T, V, key, i, cap, neo=None, cam=None, Z=2, anh=True):
    """Trả (ảnh RGBA, mảng chủ điểm ảnh, thông tin). neo / cam: ghi đè neo khung i / điểm cầm cấp cap (như bảng cam_chuan)."""
    da = T['dong_tac'][key]
    W = (96 + 2 * VZ.PAD) * Z
    nen = Image.new('RGBA', (W, W), (0, 0, 0, 0)); chu = np.zeros((W, W), np.uint8)

    def dat(im, ten, off=(0, 0)):
        nonlocal nen
        a = np.array(im)
        if off != (0, 0):
            b = np.zeros((W, W, 4), np.uint8); b[off[1]:off[1] + a.shape[0], off[0]:off[0] + a.shape[1]] = a; a = b
            im = Image.fromarray(a)
        chu[a[..., 3] > 0] = LOP[ten]
        nen.alpha_composite(im)

    than = T['_img'].crop((i * 96, da['hang'] * 96, i * 96 + 96, da['hang'] * 96 + 96)).resize((96 * Z, 96 * Z), Image.NEAREST)
    P0 = (VZ.PAD * Z, VZ.PAD * Z)
    if 'vk' not in da:
        dat(than, 'than', P0); return nen, chu, None
    neo_, ht, tl, cam_, la_nam = VZ.bien_the(da, True)
    n = list(neo if neo is not None else neo_[i]) if (neo is not None or neo_[i]) else None
    if not n:
        dat(than, 'than', P0); return nen, chu, None
    while len(n) < 4:
        n.append(0)
    cm = list(cam if cam is not None else cam_[cap])
    g = n[2]
    vk = VZ.ve_vk(Z, V, da['vk'], cap, n, g, tl, cm)
    nt = VZ.nam_tay_cua(V, da, n, g, la_nam) if anh else None
    if n[3]:
        dat(vk, 'vk')
    dat(than, 'than', P0)
    if nt:
        dat(VZ.ve_nam_tay(Z, V, da, cap, n, g, nt, 'sau'), 'nam_sau')
    if not n[3]:
        dat(vk, 'vk')
    if not nt or nt[2]:
        tay = T['_img'].crop((i * 96, ht * 96, i * 96 + 96, ht * 96 + 96)).resize((96 * Z, 96 * Z), Image.NEAREST)
        dat(tay, 'tay_than', P0)
    if nt:
        dat(VZ.ve_nam_tay(Z, V, da, cap, n, g, nt, 'truoc'), 'nam_truoc')
    vka = np.array(vk)[..., 3] > 0
    return nen, chu, {'n': n, 'nt': nt, 'tl': tl, 'cam': cm, 'vk': da['vk'], 'vka': vka, 'Z': Z, 'la_nam': la_nam}


def phu_tai(chu, info, x, y, r=2.5):
    """Tỉ lệ điểm ảnh cán (trong vòng tròn r quanh (x, y) ô 96) bị lớp tay / thân che."""
    Z = info['Z']; W = chu.shape[0]
    yy, xx = np.mgrid[:W, :W]
    X = (xx + 0.5) / Z - VZ.PAD; Y = (yy + 0.5) / Z - VZ.PAD
    vung = info['vka'] & ((X - x) ** 2 + (Y - y) ** 2 < r * r)
    if vung.sum() == 0:
        return None
    return float((chu[vung] != LOP['vk']).mean())


def nua_nam(chu, info):
    """Nửa chiều dài nắm tay (lớp nắm tay từ ảnh, cả sau lẫn trước) theo trục cán, phía lưỡi (+) và phía đuôi (−)."""
    Z = info['Z']; n = info['n']; W = chu.shape[0]
    m = (chu == LOP['nam_sau']) | (chu == LOP['nam_truoc']) | (chu == LOP['tay_than'])
    yy, xx = np.mgrid[:W, :W]
    X = (xx + 0.5) / Z - VZ.PAD - n[0]; Y = (yy + 0.5) / Z - VZ.PAD - n[1]
    c, s = math.cos(math.radians(n[2])), math.sin(math.radians(n[2]))
    doc, ngang = c * X + s * Y, -s * X + c * Y
    k = m & (np.abs(ngang) < 2.5) & (np.abs(doc) < 7)
    if k.sum() == 0:
        return None
    return float(doc[k].max()), float(-doc[k].min())


def goc_lech(a, b):
    return abs(((a - b + 540) % 360) - 180)


def do_khung(T, V, key, i, cap, neo=None, cam=None):
    """Đo một khung. Trả dict: loi = [mã lỗi], cùng số đo."""
    da = T['dong_tac'][key]
    nen, chu, info = dung(T, V, key, i, cap, neo, cam)
    if info is None:
        return None
    n, loai = info['n'], info['vk']
    a = than96(T, da['hang'], i)
    r = {'n': n, 'loi': [], 'vk': loai}
    c, s = math.cos(math.radians(n[2])), math.sin(math.radians(n[2]))
    t2 = n[4] if len(n) > 4 and n[4] else None
    cum = False
    if t2 is not None and math.hypot(t2[0] - n[0], t2[1] - n[1]) < 8:
        P0, T0 = tam_da(a, n[0], n[1]), tam_da(a, t2[0], t2[1])
        cum = not P0 or not T0 or math.hypot(P0[0] - T0[0], P0[1] - T0[1]) < 3   # hai nắm cùng một cụm da
    if cum:
        # hai nắm tay dính thành một cụm (búa mới 16/10): so tâm cụm đo được với điểm giữa hai tay
        mx, my = (n[0] + t2[0]) / 2, (n[1] + t2[1]) / 2
        C = tam_da(a, mx, my, (5, 4.5, 4, 4))
        r['P'] = C; r['cum'] = 1
        r['lech_tam'] = math.hypot(C[0] - mx, C[1] - my) if C else None
    else:
        P = tam_da(a, n[0], n[1])
        r['P'] = P
        r['lech_tam'] = math.hypot(P[0] - n[0], P[1] - n[1]) if P else None
    if not n[3] and (r['lech_tam'] is None or r['lech_tam'] > NGUONG_TAM):
        r['loi'].append('tam')   # lệch tâm, hoặc không có nắm tay (da) dưới điểm cầm → vũ khí lơ lửng
    if t2 and loai in ('thuong', 'bua'):   # kiếm: tay thứ hai (nếu có) không bắt cán đi qua
        Tm = None if cum else tam_da(a, t2[0], t2[1])
        r['T'] = Tm
        q = Tm or t2
        if not Tm and not cum and not n[3]:
            r['loi'].append('tam2')  # không có nắm tay dưới tay thứ hai
        dx, dy = q[0] - n[0], q[1] - n[1]
        r['truc'] = abs(-dx * s + dy * c); r['doc2'] = dx * c + dy * s
        if r['truc'] > NGUONG_TRUC:
            r['loi'].append('truc')
        if not n[3]:
            ph2 = phu_tai(chu, info, n[0] + c * r['doc2'], n[1] + s * r['doc2'])
            r['phu2'] = ph2
            if ph2 is not None and ph2 < NGUONG_PHU and r['truc'] <= 3:
                r['loi'].append('phu2')
    if loai in ('thuong', 'bua') and not t2 and not n[3] and r.get('P'):
        # hai tay: không có neo tay thứ hai mà ảnh thân có nắm tay khác nằm trên cán → cán vẽ đè lên ngón tay đó
        C, lab = cum_da(a)
        k0 = lab[int(r['P'][1]), int(r['P'][0])]
        L = (V['vk'][loai][cap][2] - info['cam'][0]) * 2 * info['tl']
        for k, sz, cx, cy in C:
            if k == k0 or sz < 4 or sz > 40:
                continue
            dx, dy = cx - n[0], cy - n[1]
            doc, ngang = dx * c + dy * s, abs(-dx * s + dy * c)
            if 3 < doc < 0.8 * L and ngang < 2.5:
                ph3 = phu_tai(chu, info, cx, cy)
                if ph3 is not None and ph3 < NGUONG_PHU:
                    r['loi'].append('thieu2'); r['tay2_anh'] = (cx, cy, doc, ngang)
                    break
    ph = phu_tai(chu, info, n[0], n[1])
    r['phu'] = ph
    if ph is not None and ph < NGUONG_PHU:
        r['loi'].append('phu')
    if loai == 'kiem':
        xg, xs, t = doc_chan(V, 'kiem', cap, info['cam'])
        k = 2 * info['tl']
        dg = (xg - info['cam'][0]) * k
        nn = nua_nam(chu, info)
        r['doc'] = dg; r['nua'] = nn
        if nn:
            r['ho'] = dg - nn[0]
            if r['ho'] < -NGUONG_DOC_THIEU:
                r['loi'].append('luoi')
            elif r['ho'] > NGUONG_DOC_HO:
                r['loi'].append('ho')
    P = r['P']
    if loai == 'phitieu' and P:
        h = huong_cang_tay(a, P)
        r['cang'] = h
        if h is not None:
            d = goc_lech(n[2], h); r['lech_phi'] = d
            if d > 100:
                r['loi'].append('phi_nguoc')
            elif d > NGUONG_PHI:
                r['loi'].append('phi')
    return r


# ---------- hàng Cu Tí đang dùng trong game (mặc định, bộ ninja) ----------
VK_TEN = {'kiem': 'kiếm', 'thuong': 'thương', 'bua': 'búa', 'phitieu': 'phi tiêu'}
HANG_GAME = [  # (tên hàng game, nhãn)
    ('dung', 'đứng'), ('di', 'đi'), ('chay', 'chạy'), ('chay2tay', 'chạy hai tay'), ('lon', 'lộn'), ('trung', 'trúng đòn'),
    ('kiem_1', 'kiếm 1'), ('kiem_2', 'kiếm 2'), ('kiem_3', 'kiếm 3'), ('db_kiem', 'kiếm đặc biệt'),
    ('thuong_1', 'thương 1'), ('thuong_2', 'thương 2'), ('thuong_3', 'thương 3'), ('thuong_quet', 'thương quét'),
    ('thuong_giu', 'thương giữ'), ('thuong_xoc', 'thương xốc'), ('db_thuong', 'thương đặc biệt'),
    ('bua_nen', 'búa nện'), ('bua_giu', 'búa tụ lực'), ('bua_nen_dat', 'búa nện đất'), ('db_bua', 'búa đặc biệt'),
    ('phitieu', 'phi tiêu ném'), ('phitieu_ngam', 'phi tiêu ngắm'), ('phitieu_chum', 'phi tiêu chùm'), ('db_phitieu', 'phi tiêu đặc biệt'),
]
CAM_HANG = {'dung', 'di', 'chay', 'chay2tay'}


def khoa_game(T):
    """Tên hàng game → khoá trong tấm (hàng mới "~16" thay hàng cũ như hang16 của js/zed_moi.js, mặc định mọi cờ)."""
    dt = T['dong_tac']; m = {k: k for k in dt}
    for k in dt:
        if '~16' in k:
            m[k.replace('~16', '')] = k
    return m


def hang_dung(T):
    """[(nhãn, tên game, vũ khí, khoá tấm | None)] cho mọi hàng × vũ khí Cu Tí dùng (mặc định)."""
    m = khoa_game(T); dt = T['dong_tac']; ra = []
    for ten, nhan in HANG_GAME:
        for vk in VK_TEN:
            if ten in CAM_HANG:
                if ten == 'chay' and vk in ('thuong', 'bua') and 'chay2tay_' + vk in dt:
                    continue  # chạy cầm thương / búa: game dùng hàng chạy hai tay
                if ten == 'chay2tay' and vk not in ('thuong', 'bua'):
                    continue
                k = m.get(ten + '_' + vk)
                ra.append((nhan, ten, vk, k))
            else:
                k = m.get(ten)
                if k is None:
                    continue
                d = dt[k]
                if 'vk' in d and d['vk'] != vk:
                    continue
                if 'vk' not in d:
                    vk_hang = {'kiem': 'kiem', 'thuong': 'thuong', 'bua': 'bua', 'phitieu': 'phitieu'}
                    pre = ten.split('_')[0] if not ten.startswith('db_') else ten[3:]
                    if ten in ('lon', 'trung'):
                        ra.append((nhan, ten, vk, k)); continue
                    if vk_hang.get(pre) != vk:
                        continue
                ra.append((nhan, ten, vk, k))
    return ra
