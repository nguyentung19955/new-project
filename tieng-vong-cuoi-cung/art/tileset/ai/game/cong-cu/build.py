import sys, json, colorsys, pickle
sys.path.insert(0, '.')
import numpy as np
from PIL import Image
from core import Nguon, W
from cls import lop

T = 16
VIEN = np.array([12, 15, 20, 255])
B_, D_, N_, TY_ = 1, 2, 4, 8

def lopa(px):
    return '.' if px[3] == 0 else lop(tuple(px))

def samp(N, x0, y0, x1, y1, w, h, loi=0.2):
    return N.rgba(N.thu(x0, y0, x1, y1, w, h, loi)).astype(int)

def blank():
    return np.zeros((T, T, 4), int)

def clsmap(a):
    return np.array([[lopa(p) for p in row] for row in a])

# =====================================================================
# ĐẤT
# =====================================================================
ND = Nguon('dat-reu', 64)
DBOX = [(127,74,362,283),(407,76,632,281),(680,76,905,281),(951,73,1174,282),
(127,321,361,551),(407,318,632,550),(680,319,905,550),(951,321,1176,550),
(134,592,361,807),(407,592,632,807),(680,592,905,807),(951,592,1177,807),
(126,862,360,1099),(407,860,632,1093),(680,862,905,1093),(951,860,1186,1093)]

def content_top(N, box):
    x0, y0, x1, y1 = box
    xm0, xm1 = x0 + 40, x1 - 40
    for y in range(y0, y1):
        row = [lop(tuple(N.a[y, x]) + (255,)) for x in range(xm0, xm1, 3)]
        if row.count('y') / len(row) > 0.2:
            return y + 3
    raise Exception('no grass')

def dat_content(i):
    x0, y0, x1, y1 = DBOX[i]
    # middle tiles are 225 wide; snap wide tiles to the 225 grid on the left column
    if x1 - x0 > 228:
        x0 = x1 - 225 if i in (0, 4, 8, 12) else x0
        x1 = x0 + 225
    ct = content_top(ND, DBOX[i])
    yb = y1 - 10
    return samp(ND, x0 + 9, ct, x1 - 9, yb, 16, 15)

MID = [1, 2, 5, 6, 9, 10, 13, 14]
C = {i: dat_content(i) for i in MID}

def strip_depth(c):
    cm = clsmap(c)
    dep = []
    for x in range(T):
        d = 0
        for y in range(10):
            if cm[y, x] in 'gy': d = y + 1
        dep.append(min(d + 1, 10))
    return dep

def dat_noi(v):
    pairs = [(13, 14), (5, 10), (14, 6), (6, 9)]
    a, b = pairs[v]
    I = np.concatenate([C[a][7:15], C[b][7:15]], 0)
    return I

pickle.dump({'C': C}, open(W + 'datC.pkl', 'wb'))

STRIP_SRC = [13, 5, 14, 6]
DAT_TOI = None
# rêu rủ ở mép trái góc ngoài (cột 0 là viền); lật ngang cho mép phải
RU_MEP = ['',
 '',
 '.YY',
 '.YG',
 '.GGg',
 '.GggG',
 '.GgkGo',
 '.Ggk.',
 '.ggGo',
 '.gGk',
 '.Gko',
 '.gk',
 '.go',
 '.o',
]

def la_xanh(px):
    r, g, b = [int(v) for v in px]
    h, l, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return 50 < h * 360 < 130 and sat > 0.25 and l > 0.15

def phan_tich_rang(i):
    """từ ảnh gốc: cột nào có cục cỏ nhô lên, cột nào có giọt rêu dài tới đâu"""
    x0, y0, x1, y1 = DBOX[i]
    ct = content_top(ND, DBOX[i])
    sx = (x1 - 9 - (x0 + 9)) / 16
    bump, drip = [], []
    for x in range(T):
        xa, xb = int(x0 + 9 + (x + 0.2) * sx), int(x0 + 9 + (x + 0.8) * sx)
        reg = ~ND.hong[ct - 13:ct - 5, xa:xb]
        bump.append(reg.mean() > 0.55)
        last = 0
        for y in range(ct + 28, ct + 14 * 9):
            row = ND.a[y, xa:xb]
            f = np.mean([la_xanh(p) for p in row])
            if f > 0.4: last = y
        drip.append(int((last - ct) / 14) if last else 0)
    return bump, drip

RANG = {i: phan_tich_rang(i) for i in MID}

def strip_of(v):
    i = STRIP_SRC[v]
    c = C[i]
    bump, drip = RANG[i]
    S = np.zeros((13, T, 4), int)
    global DAT_TOI
    if DAT_TOI is None:
        ds = sorted(mau_lop(c[6:], 'd')[:6], key=rgb_l)
        DAT_TOI = ds[0]
    greens = sorted(mau_lop(c[:6], 'g')[:5], key=rgb_l)
    gToi, gVua, gSang = greens[0], greens[len(greens) // 2], greens[-1]
    drip_len = []
    for x in range(T):
        bx = bump[x] and x not in (0, 15)
        if bx: S[0, x] = VIEN
        S[1, x] = c[0, x] if bx else VIEN
        for y in range(0, 4):
            S[y + 2, x] = c[y, x]
        S[4, x] = gSang if lopa(c[2, x]) != 'y' else c[2, x]
        S[5, x] = gVua if lopa(c[3, x]) != 'g' else c[3, x]
        d = drip[x] if 2 <= x <= 13 else 0
        L = max(0, min(d - 2, 5))
        if x > 0 and L and drip_len[-1] >= L: L = max(0, L - 2)
        drip_len.append(L)
        for k in range(L):
            S[6 + k, x] = gVua if k < L - 1 else gSang
        S[6 + L, x] = DAT_TOI
    return S, None

def mau_lop(arr, k):
    """lấy các màu lớp k xuất hiện trong mảng (theo tần suất)"""
    from collections import Counter
    cnt = Counter()
    for row in arr:
        for p in row:
            if p[3] and lopa(p) == k: cnt[tuple(p)] += 1
    return [np.array(c) for c, _ in cnt.most_common()]

def rgb_l(p):
    return colorsys.rgb_to_hls(*(np.array(p[:3]) / 255))[1]

def dat_tile(m, v):
    I = dat_noi(v).copy()
    t = I.copy()
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    if moB:
        S, _ = strip_of(v)
        for y in range(S.shape[0]):
            for x in range(T):
                if S[y, x, 3]: t[y, x] = S[y, x]
                elif y == 0: t[y, x] = 0
        greens = sorted(mau_lop(S, 'g')[:5], key=rgb_l)
        yel = mau_lop(S, 'y')
        if moT or moD:
            g3 = {'Y': yel[0] if yel else greens[-1], 'G': greens[-1], 'g': greens[len(greens) // 2], 'k': greens[0], 'o': VIEN}
            for side in ([0] if moT else []) + ([1] if moD else []):
                for y, row in enumerate(RU_MEP):
                    for k, ch in enumerate(row):
                        if ch == '.': continue
                        x = k if side == 0 else T - 1 - k
                        t[y, x] = g3[ch] if ch in g3 else t[y, x]
    if moT: t[:, 0] = VIEN
    if moD: t[:, T - 1] = VIEN
    if moN:
        t[T - 1, :] = VIEN
        # bóng tối nhẹ ở hàng sát đáy
        for x in range(T):
            if lopa(t[T - 2, x]) in 'bl': t[T - 2, x] = (t[T - 2, x] * np.array([.7, .7, .7, 1])).astype(int)
    # góc bo tròn
    if moB and moT: t[0, 0] = t[0, 1] = t[1, 0] = 0; t[1, 1] = VIEN
    if moB and moD: t[0, 15] = t[0, 14] = t[1, 15] = 0; t[1, 14] = VIEN
    if moN and moT: t[15, 0] = t[15, 1] = t[14, 0] = 0; t[14, 1] = VIEN; t[13, 0] = VIEN; t[15, 2] = VIEN
    if moN and moD: t[15, 15] = t[15, 14] = t[14, 15] = 0; t[14, 14] = VIEN; t[13, 15] = VIEN; t[15, 13] = VIEN
    return t

def dat_goc_trong(g):
    t = blank()
    S, dep = strip_of(0)
    fx = (lambda x: T - 1 - x) if g[1] == 'D' else (lambda x: x)
    fy = (lambda y: T - 1 - y) if g[0] == 'N' else (lambda y: y)
    t[fy(0), fx(0)] = VIEN
    if g[0] == 'B':
        sx = 15 if g[1] == 'T' else 0  # cột dải rêu của ô bên cạnh
        for y in range(0, 5):
            t[y + 1, fx(0)] = S[y, sx]
        for y in range(0, 3):
            t[y + 1, fx(1)] = S[y, 1 if g[1] == 'D' else 14]
    return t

def ve_tam(arrs, k=6, cols=8, pad=2, nen=(48, 36, 28)):
    n = len(arrs); rows = (n + cols - 1) // cols
    h = max(a.shape[0] for a in arrs); w = max(a.shape[1] for a in arrs)
    im = Image.new('RGBA', (cols * (w + pad) * k, rows * (h + pad) * k), nen + (255,))
    for i, a in enumerate(arrs):
        t = Image.fromarray(a.astype(np.uint8), 'RGBA').resize((a.shape[1] * k, a.shape[0] * k), Image.NEAREST)
        im.alpha_composite(t, ((i % cols) * (w + pad) * k, (i // cols) * (h + pad) * k))
    return im

# =====================================================================
# ĐÁ + TƯỜNG LEO
# =====================================================================
NS = Nguon('da-tuong-leo', 64)
SXS = [(331, 532), (547, 748), (763, 965), (1101, 1303)]
SYS = [(144, 344), (360, 560), (577, 777)]
DA_C = {}
for r in range(3):
    for c in range(3):
        x0, x1 = SXS[c]; y0, y1 = SYS[r]
        DA_C[(r, c)] = samp(NS, x0 + 7, y0 + 7, x1 - 7, y1 - 7, 16, 16)
TUONG_C = []
for r in range(3):
    x0, x1 = SXS[3]; y0, y1 = SYS[r]
    TUONG_C.append(NS.rgba(NS.thu_tb(x0 + 8, y0 + 8, x1 - 8, y1 - 8, 16, 16)).astype(int))

def mau_toi_nhat(arrs, khong=VIEN):
    best = None
    for a in arrs:
        for row in a:
            for p in row:
                if p[3] and not (p[:3] == khong[:3]).all():
                    l = rgb_l(p)
                    if best is None or l < best[0]: best = (l, p.copy())
    return best[1]

VUA = None

def bo_goc(t, moB, moD, moN, moT):
    if moB and moT: t[0, 0] = t[0, 1] = t[1, 0] = 0; t[1, 1] = VIEN
    if moB and moD: t[0, 15] = t[0, 14] = t[1, 15] = 0; t[1, 14] = VIEN
    if moN and moT: t[15, 0] = t[15, 1] = t[14, 0] = 0; t[14, 1] = VIEN
    if moN and moD: t[15, 15] = t[15, 14] = t[14, 15] = 0; t[14, 14] = VIEN

def da_tile(m, v):
    global VUA
    if VUA is None:
        # màu vữa: màu tối phổ biến trong ô giữa
        from collections import Counter
        cnt = Counter(tuple(p) for row in DA_C[(1, 1)] for p in row if p[3] and rgb_l(p) < 0.12)
        VUA = np.array(cnt.most_common(1)[0][0])
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    def cfg(a, b):
        if a and not b: return [0] * 15
        if b and not a: return [2] * 15
        if not a and not b: return [1] * 15
        return [0] * 8 + [2] * 8
    rs, cs = cfg(moB, moN), cfg(moT, moD)
    rs = (rs + [rs[-1]])[:16]; cs = (cs + [cs[-1]])[:16]
    nd = np.zeros((16, 16, 4), int)
    for y in range(16):
        for x in range(16):
            nd[y, x] = DA_C[(rs[y], cs[x])][y, x]
    flip = v in (1, 3) and not moT and not moD
    if flip: nd = nd[:, ::-1]
    t = nd.copy()
    if moB: t[0, :] = VIEN
    if moT: t[:, 0] = VIEN
    if moD: t[:, 15] = VIEN
    if moN: t[15, :] = VIEN
    if v >= 2 and m == 15:
        # rêu trong khe vữa
        S, _ = strip_of(0)
        gs = sorted(mau_lop(S, 'g')[:4], key=rgb_l)
        pts = [(15, 4), (15, 5), (14, 5), (9, 11)] if v == 2 else [(6, 3), (7, 3), (12, 12), (12, 13)]
        for k, (y, x) in enumerate(pts):
            if rgb_l(t[y, x]) < 0.14: t[y, x] = gs[k % 2]
    bo_goc(t, moB, moD, moN, moT)
    return t

def da_goc_trong(g):
    t = blank()
    fx = (lambda x: T - 1 - x) if g[1] == 'D' else (lambda x: x)
    fy = (lambda y: T - 1 - y) if g[0] == 'N' else (lambda y: y)
    t[fy(0), fx(0)] = VIEN
    return t

DINH = [[(2, 3), (12, 10)], [(2, 10), (12, 4)], [(2, 4), (12, 12)], [(12, 3), (2, 11)]]

def tuong_tile(m, v):
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    src = [1, 0, 2, 1][v]
    t = TUONG_C[src].copy()
    if v == 3: t = t[:, ::-1].copy()
    # đinh đồng (ảnh gốc: đinh vàng dọc hai mép cột gỗ)
    vang = sorted(mau_lop(NV.rgba(NV.thu_tb(1259, 380, 1500, 560, 16, 12)).astype(int), 'y')[:5], key=rgb_l)
    for (x, y) in DINH[v]:
        if (x < 8 and not moT) or (x >= 8 and not moD): continue
        t[y, x] = vang[-1]; t[y, x + 1] = vang[len(vang) // 2]
        t[y + 1, x] = vang[len(vang) // 2]; t[y + 1, x + 1] = vang[0]
        t[y + 2, x + 1] = VIEN
    if moB: t[0, :] = VIEN
    if moT: t[:, 0] = VIEN
    if moD: t[:, 15] = VIEN
    if moN: t[15, :] = VIEN
    bo_goc(t, moB, moD, moN, moT)
    return t

def tuong_goc_trong(g):
    return da_goc_trong(g)

# =====================================================================
# VẬT THỂ
# =====================================================================
NV = Nguon('vat-the', 64)

def dat_vao(t, a, ox, oy):
    h, w = a.shape[:2]
    for y in range(h):
        for x in range(w):
            if a[y, x, 3] and 0 <= y + oy < T and 0 <= x + ox < T: t[y + oy, x + ox] = a[y, x]
    return t

def vien_ngoai(a, bo=()):
    """ô trong suốt kề ô có màu (4 hướng) → viền đen. bo: các mép mảng không vẽ viền ra ngoài (mảng lặp)"""
    a = a.copy()
    h, w = a.shape[:2]
    op = a[..., 3] > 0
    for y in range(h):
        for x in range(w):
            if op[y, x]: continue
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and op[yy, xx]:
                    a[y, x] = VIEN; break
    return a

def toi_thanh_vien(a, l=0.085):
    a = a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] and rgb_l(a[y, x]) < l: a[y, x] = VIEN
    return a

def pad(a, t=0, b=0, l=0, r=0):
    h, w = a.shape[:2]
    o = np.zeros((h + t + b, w + l + r, 4), int)
    o[t:t + h, l:l + w] = a
    return o

def sp(x0, y0, x1, y1, w, h, t=1, b=1, l=1, r=1, loi=0.2, tb=False):
    a = NV.rgba(NV.thu_tb(x0, y0, x1, y1, w, h)).astype(int) if tb else samp(NV, x0, y0, x1, y1, w, h, loi)
    return vien_ngoai(toi_thanh_vien(pad(a, t, b, l, r)))

SX = 218 / 16  # 3 khúc ván = 1 ô
VAN_GIUA = sp(357, 200, 357 + 218, 200 + 15 * SX, 16, 15, 1, 0, 0, 0)
VAN_TRAI = sp(51, 200, 51 + 15 * SX, 200 + 15 * SX, 15, 15, 1, 0, 1, 0)
VAN_PHAI = sp(877 - 15 * SX, 200, 877, 200 + 15 * SX, 15, 15, 1, 0, 0, 1)
CHAN = sp(556, 256, 556 + 3 * SX, 286, 3, 2, 0, 1, 1, 1)

def van_tile(lr, v):
    coTrai, coPhai = lr & 1, lr & 2
    t = VAN_GIUA.copy()
    if v == 1: dat_vao(t, CHAN, 6, 5)
    if not coTrai:
        t[:, :8] = VAN_TRAI[:, :8]
    if not coPhai:
        t[:, 8:] = VAN_PHAI[:, 8:]
    return t

THANG_THAN = sp(306, 470, 421, 670, 10, 16, 0, 0, 1, 1)
THANG_DAU = sp(52, 428, 230, 428 + 15 * 12.5, 14, 15, 1, 0, 1, 1)
THANG_DUOI = sp(306, 698 - 200, 421, 698, 10, 15, 0, 1, 1, 1)

def thang_tile(ud):
    tren, duoi = ud & 1, ud & 2
    t = blank()
    if not tren: return dat_vao(t, THANG_DAU, 0, 0)
    if not duoi: return dat_vao(t, THANG_DUOI, 2, 0)
    return dat_vao(t, THANG_THAN, 2, 0)

DAY_THAN = sp(506, 500, 548, 500 + 200, 3, 16, 0, 0, 1, 1)
DAY_DAU = sp(506, 430, 548, 430 + 15 * 12.5, 3, 15, 1, 0, 1, 1)
DAY_DUOI = sp(506, 731 - 15 * 12.5, 548, 731, 3, 15, 0, 1, 1, 1)

def day_tile(ud):
    tren, duoi = ud & 1, ud & 2
    t = blank()
    if not tren and not duoi:
        a = np.concatenate([DAY_DAU[:8], DAY_DUOI[8:]], 0)
    elif not tren: a = DAY_DAU
    elif not duoi: a = DAY_DUOI
    else: a = DAY_THAN
    return dat_vao(t, a, 6, 0)

GAI = sp(670, 597, 868, 731, 16, 10, 1, 1, 0, 0, tb=True)
GAI_MAJ = sp(670, 597, 868, 731, 16, 10, 1, 1, 0, 0)

XAM = [np.array([0x35, 0x32, 0x32, 255]), np.array([0x5e, 0x5d, 0x59, 255]), np.array([0x8c, 0x8d, 0x86, 255]), np.array([0xae, 0xae, 0xa7, 255])]
MUI_GAI = ['..o..', '.o3o.', '.o3o.', 'o231o', 'o231o', 'o210o', 'oYyDo', 'oyDDo']

def gai_tile():
    t = dat_vao(blank(), GAI[7:], 0, 11)
    vang = sorted([c for c in mau_lop(GAI, 'y')[:6]], key=rgb_l)
    cm = {'o': VIEN, '0': XAM[0], '1': XAM[1], '2': XAM[2], '3': XAM[3], 'Y': vang[-1], 'y': vang[len(vang) // 2], 'D': vang[0]}
    for cx in (2, 7, 12):
        for r, row in enumerate(MUI_GAI):
            for k, ch in enumerate(row):
                if ch != '.': t[3 + r, cx - 2 + k] = cm[ch]
    return t

CT0 = sp(73, 801, 249, 900, 14, 8, tb=True)
CT1 = sp(322, 827, 500, 900, 14, 6, tb=True)

def congtac_tile(bat):
    return dat_vao(blank(), CT1 if bat else CT0, 0, 16 - (8 if bat else 10))

CUA = {0: sp(985, 208, 1194, 771, 14, 46, tb=True), 1: sp(1275, 208, 1484, 771, 14, 46, tb=True)}

def cua_tile(mo, k):
    a = CUA[1 if mo else 0]
    part = [0, 16, 32, 16][k]
    return a[part:part + 16].copy()

HAM = {}
def lat_ban_do(luoi, ham=None, hamgt=None):
    H = len(luoi); Wd = len(luoi[0])
    im = np.zeros((H * T, Wd * T, 4), int); im[..., :3] = (60, 44, 34); im[..., 3] = 255
    at = lambda c, r: luoi[r][c] if 0 <= r < H and 0 <= c < Wd else '.'
    for r in range(H):
        for c in range(Wd):
            ch = at(c, r)
            if ch not in 'S#W' or ch == '.': continue
            ham, hamgt = HAM[ch]
            kk = lambda q: q in 'S#W' and q != '.'
            kb, kd, kn, kt = kk(at(c, r-1)), kk(at(c+1, r)), kk(at(c, r+1)), kk(at(c-1, r))
            m = (B_ if kb else 0) | (D_ if kd else 0) | (N_ if kn else 0) | (TY_ if kt else 0)
            lay = [ham(m, (c * 7 + r * 13) % 4)]
            if kb and kt and not kk(at(c-1, r-1)): lay.append(hamgt('BT'))
            if kb and kd and not kk(at(c+1, r-1)): lay.append(hamgt('BD'))
            if kn and kt and not kk(at(c-1, r+1)): lay.append(hamgt('NT'))
            if kn and kd and not kk(at(c+1, r+1)): lay.append(hamgt('ND'))
            for L in lay:
                sub = im[r*T:(r+1)*T, c*T:(c+1)*T]
                msk = L[..., 3] > 0
                sub[msk] = L[msk]
    return im

HAM.update({'#': (dat_tile, dat_goc_trong), 'S': (da_tile, da_goc_trong), 'W': (tuong_tile, tuong_goc_trong)})
MAU2 = ['..........', '.SSS...WW.', '.SSS..SSS.', '.SSS..S.S.', '......SSS.', '.S...WW...', '.S..SSSS..', '.S..SSSS..', '.SSSSS....', '..........']
MAU = ['..........', '.###......', '.###..###.', '.###..#.#.', '......###.', '.#........', '.#..####..', '.#..####..', '.#####....', '..........']

def vat_the_all():
    L = []
    for lr in range(4):
        for v in range(3): L.append(van_tile(lr, v))
    for ud in range(4): L.append(thang_tile(ud)); L.append(day_tile(ud))
    L.append(gai_tile()); L.append(congtac_tile(0)); L.append(congtac_tile(1))
    for mo in (0, 1):
        for k in range(3): L.append(cua_tile(mo, k))
    return L

if __name__ == '__main__':
    ve_tam(vat_the_all(), k=6, cols=8).save(W + 'p_vat.png')
    ve_tam([dat_tile(m, 0) for m in range(16)], k=6, cols=8).save(W + 'p_dat16.png')
    ve_tam([lat_ban_do(MAU), lat_ban_do(MAU2)], k=4, cols=2).save(W + 'p_datmap.png')
    ve_tam([C[i] for i in MID] + [dat_noi(v) for v in range(4)]).save(W + 'p_datC.png')
    lat = [np.tile(dat_noi(v), (3, 3, 1)) for v in range(4)]
    ve_tam(lat, k=4, cols=4).save(W + 'p_datI.png')
