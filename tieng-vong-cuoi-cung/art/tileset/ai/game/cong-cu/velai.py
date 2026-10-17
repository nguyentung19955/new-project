"""Vẽ lại đất / đá / tường leo / ván theo góp ý (bản 2):
- Đất trơn: mảng màu lớn 2–3 sắc nâu gần nhau, lác đác 1–2 viên sỏi; dưới mặt cỏ chi tiết hơn rồi nhạt dần,
  đất sâu tối hơn mặt.
- Rêu xanh ô-liu tối (#2F3F2A / #46552F / #5E6B3A), bỏ vàng chanh.
- Đá liền khối: hoa văn đá cuội vẽ trên khối 32×32 lặp liền (tiles-ai.js chọn biến thể theo vị trí ô:
  v = (cột & 1) | ((hàng & 1) << 1)) → đá chạy xuyên mép ô; viền đen chỉ ở mép lộ.
- Tường leo: ván dọc 16×64 lặp liền (v = hàng & 3), sáng hơn 1 bậc, highlight mép trên/trái, vân thưa, đinh vàng nhỏ.
- Ván một chiều: giữ hình dáng AI, tô lại bằng bảng màu gỗ mới.
Dùng: export.py import file này sau build.py để thay các hàm dat_tile / da_tile / tuong_tile / van_tile."""
import colorsys
import numpy as np
from PIL import Image
import build as _b

T = 16
VIEN = np.array([12, 15, 20, 255])
B_, D_, N_, TY_ = 1, 2, 4, 8

def hx(s):
    s = s.lstrip('#')
    return np.array([int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255])

# ---------- bảng màu ----------
# đất: sâu (tối) → mặt (sáng hơn), tương phản trong thấp
E_NUT = hx('#281A13')   # vết nứt / bóng sỏi
E_TOI = hx('#33221A')   # mảng tối trong lòng đất
E_GOC = hx('#3B271B')   # nền đất sâu
E_SANG = hx('#432D1F')  # mảng sáng trong lòng đất
E_MAT1 = hx('#4D3323')  # đất sát mặt
E_MAT2 = hx('#583B27')  # đất sát mặt, sáng
E_SOI = hx('#6A4A33')   # mặt sỏi
# rêu ô-liu tối
M0, M1, M2, M3 = hx('#2F3F2A'), hx('#46552F'), hx('#5E6B3A'), hx('#69723F')
M_BONG = hx('#251912')
# đá
S_VUA = hx('#222127')
S0, S1, S1b, S2, S3 = hx('#36363C'), hx('#46464B'), hx('#4C4A46'), hx('#5B5A55'), hx('#6C6A63')
# gỗ (tường + ván): sáng hơn bản cũ 1 bậc
G_KHE = hx('#2B1D15')
G_BONG = hx('#4F3624')
G_VAN = hx('#6C4C32')
G_VAN2 = hx('#64462F')
G_SANG = hx('#7D5B3B')
G_HL = hx('#94704B')
G_VAN_VAN = hx('#553A27')  # vân gỗ
DINH, DINH_TOI = hx('#E1B85A'), hx('#9C6B30')

def blank():
    return np.zeros((T, T, 4), int)

def muot(rng, h, w, n=5):
    """nhiễu mượt (mảng lớn) trong [0,1]"""
    a = (rng.random((n, n)) * 255).astype(np.uint8)
    im = Image.fromarray(a).resize((w, h), Image.BICUBIC)
    z = np.array(im).astype(float)
    return (z - z.min()) / max(1, z.max() - z.min())

def soi(t, y, x, to=False):
    """viên sỏi nhỏ 2×1 hoặc 2×2: mặt sáng, bóng phía dưới"""
    t[y, x] = E_SOI
    t[y, x + 1] = E_MAT2
    if to:
        t[y + 1, x] = E_MAT2; t[y + 1, x + 1] = E_MAT1
        t[y + 2, x] = E_NUT; t[y + 2, x + 1] = E_NUT
    else:
        t[y + 1, x] = E_NUT; t[y + 1, x + 1] = E_NUT

def nut(t, pts):
    for y, x in pts: t[y, x] = E_NUT

# ---------- ĐẤT ----------
def dat_long(v):
    """ô đất sâu: nền + 2–3 mảng lớn sắc gần nhau, rất ít chi tiết"""
    rng = np.random.default_rng(100 + v)
    t = np.zeros((T, T, 4), int); t[:] = E_GOC
    z = muot(rng, T, T, 4)
    z2 = muot(rng, T, T, 4)
    # giữ mép ô về màu nền để ghép biến thể ngẫu nhiên không lộ mép
    yy, xx = np.mgrid[0:T, 0:T]
    bien = np.minimum(np.minimum(yy, T - 1 - yy), np.minimum(xx, T - 1 - xx))
    w = np.clip((bien - 0.5) / 3.0, 0, 1)
    if v != 3:
        t[(z * w) > 0.55] = E_SANG
        t[(z2 * w) > 0.62] = E_TOI
    else:
        t[(z * w) > 0.72] = E_SANG   # gần như trơn
    if v == 0:
        soi(t, 9, 5)
        nut(t, [(4, 11), (5, 12)])
    elif v == 1:
        soi(t, 4, 3); soi(t, 11, 10)
    elif v == 2:
        nut(t, [(7, 8), (8, 9), (8, 10)])
    return t

TUA = [[2, 5, 9, 12], [3, 7, 10, 13], [2, 6, 8, 11, 13], [4, 9, 12]]
GIOT = [[(6, 2), (11, 1)], [(4, 1), (9, 3), (12, 1)], [(7, 2)], [(3, 1), (10, 2)]]

def dat_mat(v):
    """ô mặt đất: dải rêu trên, đất sát mặt chi tiết hơn rồi nhạt dần về nền đất sâu"""
    rng = np.random.default_rng(200 + v)
    t = dat_long(v).copy()
    z = muot(rng, T, T, 5)
    z2 = muot(rng, T, T, 4)
    for y in range(5, T):
        p = np.clip((13.5 - y) / 8.0, 0, 1)   # tỉ lệ đất mặt theo độ sâu
        for x in range(T):
            if z[y, x] < p * 1.05:
                t[y, x] = E_MAT2 if (z2[y, x] > 0.6 and y < 10) else E_MAT1
    # chi tiết vừa phải ngay dưới cỏ
    pebbles = [[(7, 9), (9, 3)], [(8, 12)], [(7, 4), (10, 11)], [(8, 7)]][v]
    for y, x in pebbles: soi(t, y, x)
    # dải rêu
    for x in range(T):
        tua = x in TUA[v]
        t[0, x] = VIEN if tua else 0
        t[1, x] = (M3 if (tua and x % 3 == 0) else M2) if tua else VIEN
        t[2, x] = M2 if rng.random() < 0.7 else M1
        t[3, x] = M1
        t[4, x] = M1 if rng.random() < 0.45 else M0
        t[5, x] = M0
        t[6, x] = M_BONG
    for x, L in GIOT[v]:
        for k in range(L):
            t[6 + k, x] = M0 if k < L - 1 else M1
        t[6 + L, x] = M_BONG
    return t

RU_MEP = ['', '', '.21', '.21', '.110', '.10', '.10', '.0b', '.b']

def bo_goc(t, moB, moD, moN, moT):
    if moB and moT: t[0, 0] = t[0, 1] = t[1, 0] = 0; t[1, 1] = VIEN
    if moB and moD: t[0, 15] = t[0, 14] = t[1, 15] = 0; t[1, 14] = VIEN
    if moN and moT: t[15, 0] = t[15, 1] = t[14, 0] = 0; t[14, 1] = VIEN
    if moN and moD: t[15, 15] = t[15, 14] = t[14, 15] = 0; t[14, 14] = VIEN

SANG_HON = {tuple(E_TOI): E_GOC, tuple(E_GOC): E_SANG, tuple(E_SANG): E_MAT1, tuple(E_MAT1): E_MAT2}
TOI_HON = {tuple(E_SANG): E_GOC, tuple(E_GOC): E_TOI, tuple(E_TOI): E_NUT, tuple(E_MAT1): E_SANG, tuple(E_MAT2): E_MAT1}

def dat_tile(m, v):
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    t = dat_mat(v) if moB else dat_long(v).copy()
    y0 = 7 if moB else 0
    # mép lộ: trái sáng (đón sáng), phải / đáy tối
    if moT:
        for y in range(y0, T):
            t[y, 1] = SANG_HON.get(tuple(t[y, 1]), t[y, 1])
        t[:, 0] = VIEN
    if moD:
        for y in range(y0, T):
            t[y, 14] = TOI_HON.get(tuple(t[y, 14]), t[y, 14])
        t[:, 15] = VIEN
    if moN:
        for x in range(T):
            t[14, x] = TOI_HON.get(tuple(t[14, x]), t[14, x])
        t[15, :] = VIEN
    if moB and (moT or moD):
        cm = {'2': M2, '1': M1, '0': M0, 'b': M_BONG}
        for side in ([0] if moT else []) + ([1] if moD else []):
            for y, row in enumerate(RU_MEP):
                for k, ch in enumerate(row):
                    if ch == '.': continue
                    x = k if side == 0 else T - 1 - k
                    t[y, x] = cm[ch]
    bo_goc(t, moB, moD, moN, moT)
    return t

def dat_goc_trong(g):
    t = blank()
    fx = (lambda x: T - 1 - x) if g[1] == 'D' else (lambda x: x)
    fy = (lambda y: T - 1 - y) if g[0] == 'N' else (lambda y: y)
    t[fy(0), fx(0)] = VIEN
    if g[0] == 'B':
        # rêu của ô mặt đất bên cạnh bọc qua góc
        t[1, fx(0)] = VIEN
        for y, c in zip(range(2, 7), (M2, M1, M0, M0, M_BONG)): t[y, fx(0)] = c
        for y, c in zip(range(2, 5), (M1, M0, M_BONG)): t[y, fx(1)] = c
    return t

# ---------- ĐÁ: hoa văn 32×32 lặp liền ----------
def mau_da():
    rng = np.random.default_rng(7)
    P = 32
    seeds = []
    for gy in range(4):
        for gx in range(4):
            seeds.append((gy * 8 + 4 + rng.uniform(-2.2, 2.2), gx * 8 + 4 + rng.uniform(-2.2, 2.2), rng.uniform(-1.5, 1.5)))
    seeds = np.array(seeds)
    yy, xx = np.mgrid[0:P, 0:P]
    ds = []
    for sy, sx, wgt in seeds:
        dy = np.abs(yy - sy); dy = np.minimum(dy, P - dy)
        dx = np.abs(xx - sx); dx = np.minimum(dx, P - dx)
        ds.append(np.sqrt(dy * dy * 1.15 + dx * dx) - wgt)
    ds = np.array(ds)
    o = np.argsort(ds, 0)
    id1 = o[0]
    d1 = np.take_along_axis(ds, o[:1], 0)[0]; d2 = np.take_along_axis(ds, o[1:2], 0)[0]
    vua = (d2 - d1) < 1.0
    goc = [S1 if rng.random() < 0.6 else S1b for _ in seeds]
    dom = [rng.random() < 0.35 for _ in seeds]
    t = np.zeros((P, P, 4), int)
    q = lambda y, x: (vua[y % P, x % P], id1[y % P, x % P])
    for y in range(P):
        for x in range(P):
            if vua[y, x]:
                t[y, x] = S_VUA; continue
            i = id1[y, x]
            ve, vi = q(y - 1, x); le, li = q(y, x - 1)
            de, di = q(y + 1, x); re_, ri = q(y, x + 1)
            tren = ve or vi != i; trai = le or li != i
            duoi = de or di != i; phai = re_ or ri != i
            if tren and not duoi: c = S3 if (dom[i] and not trai) else S2
            elif trai and not phai: c = S2
            elif duoi: c = S0
            elif phai: c = S0 if rng.random() < 0.6 else goc[i]
            else: c = goc[i]
            t[y, x] = c
    # vài đốm rêu trong khe
    for y, x in ((13, 5), (13, 6), (29, 21), (28, 21), (6, 26)):
        if vua[y, x]: t[y, x] = M0
    for y, x in ((14, 6), (29, 22)):
        if vua[y, x]: t[y, x] = M1
    return t

DA_P = mau_da()

def sang(c):
    for a, b in ((S_VUA, S0), (S0, S1), (S1, S2), (S1b, S2), (S2, S3)):
        if (c[:3] == a[:3]).all(): return b
    return c

def toi(c):
    for a, b in ((S3, S2), (S2, S1), (S1, S0), (S1b, S0), (S0, S_VUA)):
        if (c[:3] == a[:3]).all(): return b
    return c

def da_tile(m, v):
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    oy, ox = (v >> 1) * T, (v & 1) * T
    t = DA_P[oy:oy + T, ox:ox + T].copy()
    if moB:
        for x in range(T): t[1, x] = sang(t[1, x])
        t[0, :] = VIEN
    if moT:
        for y in range(T): t[y, 1] = sang(t[y, 1])
        t[:, 0] = VIEN
    if moD:
        for y in range(T): t[y, 14] = toi(t[y, 14])
        t[:, 15] = VIEN
    if moN:
        for x in range(T): t[14, x] = toi(t[14, x])
        t[15, :] = VIEN
    bo_goc(t, moB, moD, moN, moT)
    return t

def da_goc_trong(g):
    t = blank()
    fx = (lambda x: T - 1 - x) if g[1] == 'D' else (lambda x: x)
    fy = (lambda y: T - 1 - y) if g[0] == 'N' else (lambda y: y)
    t[fy(0), fx(0)] = VIEN
    return t

# ---------- TƯỜNG LEO: ván dọc 16×64 lặp liền ----------
def mau_tuong():
    rng = np.random.default_rng(11)
    H = 64
    t = np.zeros((H, T, 4), int)
    noi = {0: [10, 42], 1: [26, 58]}    # hàng mối nối của từng tấm ván
    for p in (0, 1):
        x0 = p * 8
        cuts = noi[p]
        for y in range(H):
            # đoạn ván hiện tại → màu nền riêng
            seg = sum(1 for c in cuts if y >= c)
            base = G_VAN if (seg + p) % 2 == 0 else G_VAN2
            t[y, x0] = G_KHE
            t[y, x0 + 1] = G_HL
            for x in range(x0 + 2, x0 + 7): t[y, x] = base
            t[y, x0 + 7] = G_BONG
        # vân gỗ thưa: vệt dọc 3–6 px
        for _ in range(4):
            x = x0 + int(rng.integers(3, 7)); y = int(rng.integers(0, H)); L = int(rng.integers(3, 7))
            for k in range(L): t[(y + k) % H, x] = G_VAN_VAN
        # mắt gỗ
        y = int(rng.integers(0, H)); x = x0 + 4
        t[y % H, x] = G_VAN_VAN; t[(y + 1) % H, x] = G_KHE; t[(y + 1) % H, x + 1] = G_SANG; t[(y + 2) % H, x] = G_VAN_VAN
        for c in cuts:
            for x in range(x0 + 1, x0 + 7):
                t[(c - 1) % H, x] = G_BONG
                t[c % H, x] = G_KHE
                t[(c + 1) % H, x] = G_HL
            t[(c + 1) % H, x0 + 7] = G_BONG
            # đinh vàng nhỏ dưới mối nối
            for dx in (2, 5):
                t[(c + 2) % H, x0 + dx] = DINH
                t[(c + 3) % H, x0 + dx] = DINH_TOI
    return t

TUONG_P = mau_tuong()

def tuong_tile(m, v):
    moB, moD, moN, moT = not (m & B_), not (m & D_), not (m & N_), not (m & TY_)
    t = TUONG_P[v * T:(v + 1) * T].copy()
    if moB:
        for x in range(1, T - 1):
            if not (t[1, x, :3] == DINH[:3]).all(): t[1, x] = G_HL
        t[2, 1:T - 1] = np.where((t[2, 1:T - 1, :3] == G_KHE[:3]).all(-1)[:, None], G_SANG, t[2, 1:T - 1])
        t[0, :] = VIEN
    if moT: t[:, 0] = VIEN
    if moD: t[:, 15] = VIEN; t[:, 14] = np.where((t[:, 14, :3] == G_HL[:3]).all(-1)[:, None], G_VAN, t[:, 14])
    if moN:
        t[14, :] = G_BONG; t[15, :] = VIEN
    bo_goc(t, moB, moD, moN, moT)
    return t

def tuong_goc_trong(g):
    return da_goc_trong(g)

# ---------- VÁN một chiều: giữ hình AI, tô lại ----------
_van_goc = _b.van_tile

def la_vang(c):
    r, g, b = c[:3] / 255.0
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return 30 <= h * 360 <= 55 and l > 0.42 and s > 0.45

def van_tile(lr, v):
    a = _van_goc(lr, v).astype(int)
    op = a[..., 3] > 0
    lum = a[..., :3].sum(-1)
    vien = op & (lum < 70)
    go = op & ~vien
    vang = np.zeros((T, T), bool)
    for y in range(T):
        for x in range(T):
            if go[y, x] and la_vang(a[y, x]): vang[y, x] = True
    trung = np.median(lum[go]) if go.any() else 0
    isgo = lambda y, x: 0 <= y < T and 0 <= x < T and go[y, x]
    t = a.copy()
    for y in range(T):
        for x in range(T):
            if vien[y, x]: t[y, x] = VIEN; continue
            if not go[y, x]: continue
            if vang[y, x]:
                # chỉ giữ đinh lẻ (không có vàng kề ngang); dải đồng liền trên mặt ván → tô gỗ
                le = not ((x > 0 and vang[y, x - 1]) or (x < T - 1 and vang[y, x + 1]))
                if le:
                    t[y, x] = DINH if not (y > 0 and vang[y - 1, x]) else DINH_TOI; continue
            if not isgo(y - 1, x): c = G_HL
            elif not isgo(y, x - 1): c = G_SANG
            elif not isgo(y + 1, x): c = G_BONG
            elif not isgo(y, x + 1): c = G_VAN2
            elif lum[y, x] < trung * 0.72 and (x + y) % 3 == 0: c = G_VAN_VAN
            else: c = G_VAN
            t[y, x] = c
    return t
