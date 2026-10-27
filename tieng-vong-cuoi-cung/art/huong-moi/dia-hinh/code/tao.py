#!/usr/bin/env python3
"""Bộ địa hình + nền HƯỚNG MỚI cho phòng B (tư vấn 3) – tạo từ ảnh gen trong art/huong-moi/nguon/.

Ra (art/huong-moi/dia-hinh/, ảnh 2x: px ảnh = logic × 2):
  nen-xa.jpg            nền xa = lang-xa-tan.png (giữ gần nguyên, chỉ thu nhỏ)
  nen-giua.png          atlas 3 mảnh tách từ lang-giua-tan.png (cây trái, tháp giữa, cây phải) – giảm tương phản, giảm ánh vàng phụ
  than-dat.png          thân đất: 4 mảnh thân của gach-re-tan.png ghép 2×2 thành KHỐI LẶP LIỀN 320×320 logic (mỗi mảnh 160 logic),
                        đường nối sửa bằng mask nhiễu; kéo mép 2 px bằng chính phần lặp (vẽ co giãn không hở khe)
  mat-tren.png          atlas mặt trên: giữa A, giữa B (mỗi đoạn 128 logic, hai đầu chung "khớp" J → ghép thứ tự bất kỳ đều liền),
                        đầu trái, đầu phải (96 logic, phía trong mờ dần theo mask nhiễu để phủ lên đoạn giữa)
  trang-tri-dh.png      cây / nấm tách khỏi 2 đầu + 2 nấm nhỏ của đoạn giữa (trang trí riêng, KHÔNG làm mép collider)
  dia-hinh.json         toạ độ mọi mảnh, neo, cỡ logic, mức nhô, khe khuôn chờ ảnh gen
  khuon/                khuôn (template) PNG nền trắng cho cạnh đứng, mép đáy, góc lồi / lõm, ván – xem khuon/KHUON.md
  xem-thu/nguon-*.png   ảnh kiểm bước xử lý (mép trên đã san, mép đứng đã nắn, mask nối thân)

Chạy: python3 -B art/huong-moi/dia-hinh/code/tao.py   (cần Pillow, numpy, scipy; vài giây)"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DH = os.path.normpath(os.path.join(HERE, '..'))
NGUON = os.path.normpath(os.path.join(DH, '..', 'nguon'))
XT = os.path.join(DH, 'xem-thu'); os.makedirs(XT, exist_ok=True)
KH = os.path.join(DH, 'khuon'); os.makedirs(KH, exist_ok=True)

# ------------------------------------------------------------ số chính (logic px; ảnh lưu 2x)
S = 0.4716            # logic / px ảnh gen gach-re-tan (đoạn giữa 475 px gen ≈ 224 logic; thân 342 px gen ≈ 161 logic)
B2 = 2 * S            # px ảnh 2x / px ảnh gen
MAT_NHO = 3           # mặt trên: rêu nhô tối đa 3 logic trên mặt collider (luật ≤ 2–4)
MEP_NHO = 3           # đầu trái / phải: mép đứng nhô tối đa 3 logic ra ngoài collider
DOAN = 128            # đoạn giữa: 128 logic (4 ô)
J = 12                # nửa khớp nối (logic): hai đầu mọi đoạn = cùng một dải 24 logic
DAU = 96              # đầu trái / phải: 96 logic (gồm 28 logic mờ dần phía trong)
DAU_MO = 28
THAN = 160            # một mảnh thân = 160 logic → khối lặp 2×2 = 320 logic = 10×10 ô
DAY_MO = 22           # đáy dải mặt trên mờ dần 22 logic vào thân
rng = np.random.default_rng(20261028)


def nhieu(h, w, sigma, seed):
    r = np.random.default_rng(seed).standard_normal((h, w))
    r = ndimage.gaussian_filter(r, sigma, mode='wrap')
    return r / (r.std() + 1e-9)


def tach_nen_trang(rgb):
    """ảnh gen nền trắng → RGBA: alpha theo khoảng cách tới trắng, khử viền trắng (un-premultiply)"""
    a = rgb.astype(np.float32)
    mn = a.min(axis=2)
    al = np.clip((250 - mn) / 70.0, 0, 1)
    al = ndimage.grey_erosion(al, size=(2, 2)) * 0.35 + al * 0.65   # bớt quầng sáng 1 px
    c = np.where(al[..., None] > 0.02, (a - (1 - al[..., None]) * 255) / np.maximum(al[..., None], 0.02), 0)
    return np.dstack([np.clip(c, 0, 255), al * 255]).astype(np.float32)


def doi_co(arr, w, h):
    """RGBA float → đổi cỡ theo alpha tiền nhân (không viền đen / trắng)"""
    a = arr.copy(); al = a[..., 3:4] / 255
    pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    out = []
    for c in range(4):
        out.append(np.asarray(Image.fromarray(pm[..., c].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)))
    o = np.dstack(out); al2 = np.clip(o[..., 3:4], 0, 255) / 255
    rgb = np.where(al2 > 0.003, o[..., :3] / np.maximum(al2, 0.003), 0)
    return np.dstack([np.clip(rgb, 0, 255), np.clip(o[..., 3:4], 0, 255)]).astype(np.float32)


def luu(arr, path, mode='RGBA'):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode).save(path, optimize=True)


def dich_cot(arr, d):
    """dịch từng cột theo d[x] px (dương = xuống), nội suy tuyến tính"""
    h, w = arr.shape[:2]; out = np.zeros_like(arr); ys = np.arange(h, dtype=np.float32)
    for x in range(w):
        src = ys - d[x]
        for c in range(arr.shape[2]):
            out[:, x, c] = np.interp(src, ys, arr[:, x, c], left=0 if c == 3 else arr[0, x, c], right=arr[-1, x, c])
    return out


def dich_hang(arr, d, tu_trai=True):
    h, w = arr.shape[:2]; out = np.zeros_like(arr); xs = np.arange(w, dtype=np.float32)
    for y in range(h):
        src = xs - d[y]
        for c in range(arr.shape[2]):
            out[y, :, c] = np.interp(src, xs, arr[y, :, c], left=0 if c == 3 else arr[y, 0, c], right=0 if c == 3 else arr[y, -1, c])
    return out


# ============================================================ 1. GẠCH RỄ: mặt trên + đầu + thân
G = np.asarray(Image.open(os.path.join(NGUON, 'gach-re-tan.png')).convert('RGB'))
GA = tach_nen_trang(G)
Y0, Y1 = 120, 405                     # dải mặt trên (ảnh gen)
NEN_MAT = 196.0                        # mặt rêu (đo: đỉnh cột ở phần không có cây ≈ 192–198)
COL = NEN_MAT + 2                      # mặt collider trong ảnh gen (rêu dày hơn 2 px nằm trên)
CAT = COL - MAT_NHO / S                # trên dòng này = cây / nấm → tách thành trang trí


def lam_dai(x0, x1, ten, cat_cay=None):
    """cắt 1 dải mặt trên, san mép rêu (giữ 30 % gồ ghề), tách cây/nấm trên dòng CAT
    (cat_cay: dòng cắt riêng cho cột có cây – nấm nhỏ cắt sát mặt rêu để không còn gốc nấm)"""
    a = GA[Y0:Y1, x0:x1].copy(); h, w = a.shape[:2]
    top = np.full(w, NEN_MAT - Y0)
    for x in range(w):
        col = np.where(a[:, x, 3] > 140)[0]
        if len(col): top[x] = col[0]
    cay = top < (NEN_MAT - Y0) - 7                       # cột có cây / nấm mọc cao
    be = np.where(cay, NEN_MAT - Y0, top)
    be = ndimage.median_filter(be, 9)
    d = np.clip(((NEN_MAT - Y0) - ndimage.gaussian_filter1d(be, 3)) * 0.7, -5, 5)   # san 70 %
    a = dich_cot(a, d)
    # tách phần trên dòng CAT (có mờ 3 px) → trang trí; dải giữ phần dưới
    ys = np.arange(h)[:, None] + Y0
    cc = np.where(ndimage.binary_dilation(cay, iterations=4), cat_cay if cat_cay else CAT, CAT)[None, :]
    k = np.clip((ys - (cc - 3)) / 3.0, 0, 1)
    tt = a.copy(); tt[..., 3] *= (1 - k) * cay[None, :] + 0 * (1 - cay[None, :])
    tt[..., 3] *= np.clip(((cc + 3) - ys) / 3.0, 0, 1)   # trang trí phủ xuống thêm 3 px để che vết cắt
    a[..., 3] *= k
    luu(np.clip(a, 0, 255), os.path.join(XT, 'nguon-%s-da-san.png' % ten))
    return a, tt


MID, TT_MID = lam_dai(599, 1074, 'giua', COL + 1.5)
LEFT, TT_LEFT = lam_dai(30, 566, 'dau-trai')
RIGHT, TT_RIGHT = lam_dai(1105, 1640, 'dau-phai')


def nan_mep(a, trai):
    """nắn mép đứng của đầu (trái hoặc phải): hàng dưới mặt collider dịch ngang cho mép thẳng hơn (giữ 30 %), chỉ ở 70 px ngoài cùng"""
    h, w = a.shape[:2]; ed = np.zeros(h)
    for y in range(h):
        xs = np.where(a[y, :, 3] > 140)[0]
        ed[y] = (xs[0] if trai else xs[-1]) if len(xs) else np.nan
    yc = int(COL - Y0)
    ref = np.nanpercentile(ed[yc:], 10 if trai else 90)
    d = np.zeros(h)
    ok = ~np.isnan(ed); d[ok] = (ref - ed[ok]) * 0.7
    d[:yc] = d[yc]
    d = ndimage.gaussian_filter1d(d, 3)
    # dịch giảm dần vào trong (70 px ảnh gen)
    out = a.copy(); xs = np.arange(w, dtype=np.float32)
    for y in range(h):
        dd = d[y]
        dist = (xs - ref) if trai else (ref - xs)
        f = np.clip(1 - dist / 70.0, 0, 1)
        src = xs - dd * f
        for c in range(4):
            out[y, :, c] = np.interp(src, xs, a[y, :, c], left=0 if c == 3 else a[y, 0, c], right=0 if c == 3 else a[y, -1, c])
    return out, ref


LEFT, EDGE_L = nan_mep(LEFT, True)
RIGHT, EDGE_R = nan_mep(RIGHT, False)
luu(LEFT, os.path.join(XT, 'nguon-dau-trai-da-nan.png')); luu(RIGHT, os.path.join(XT, 'nguon-dau-phai-da-nan.png'))

# --- sang 2x
TOP2 = (COL - Y0) - MAT_NHO / S                 # dòng ảnh gen = đỉnh vùng vẽ (mặt collider − 3 logic)
H_DAI = int(round((Y1 - Y0 - TOP2) * B2))       # cao dải 2x


def sang_2x(a, x_from, x_to, w2):
    """cắt cột [x_from, x_to) (px gen, toạ độ trong mảnh), từ dòng TOP2, đổi sang w2 × H_DAI"""
    t = int(round(TOP2))
    return doi_co(a[t:, int(x_from):int(x_to)], w2, H_DAI)


W_DOAN = DOAN * 2
M2 = sang_2x(MID, 0, MID.shape[1], int(round(MID.shape[1] * B2)))     # ≈ 448 px
wm = M2.shape[1]
J2 = J * 2
jc = wm // 2
JOINT = M2[:, jc - J2:jc + J2].copy()            # khớp chung 48 px (24 logic)


def mask_noi(h, w, ramp, seed, trai):
    """mask 1 ở mép nối → 0 vào trong; ranh giới gồ ghề theo nhiễu (không thẳng đứng)"""
    n = nhieu(h, w, 9, seed) * ramp * 0.35
    xs = np.arange(w)[None, :].astype(np.float32)
    d0 = xs if trai else (w - 1 - xs)
    dist = d0 + n * np.clip(d0 / 24.0, 0, 1)        # sát mép nối: không nhiễu → đúng nội dung khớp
    return np.clip(1 - (dist - J2 * 0.5) / ramp, 0, 1) ** 1.5


def doan(src, seed):
    """đoạn giữa: 2 đầu thay bằng nội dung quanh tâm khớp (M2 cột jc): đầu trái = M2[jc:…], đầu phải = M2[…:jc]
    → đoạn bất kỳ | đoạn bất kỳ: chỗ nối là M2[jc−1] | M2[jc] = liền như ảnh gốc. Trộn vào nội dung đoạn bằng mask nhiễu."""
    s = src.copy(); h, w = s.shape[:2]; R = J2 + 34
    mt = mask_noi(h, w, 30, seed, True)[..., None]
    mp = mask_noi(h, w, 30, seed + 1, False)[..., None]
    L = s.copy(); L[:, :R] = M2[:, jc:jc + R]
    Rr = s.copy(); Rr[:, w - R:] = M2[:, jc - R:jc]
    o = s * (1 - mt) + L * mt
    o = o * (1 - mp) + Rr * mp
    return o


DOAN_A = doan(M2[:, 0:W_DOAN], 11)
LX = 262                                         # đoạn B: phần trong của mảnh đầu trái (chỗ không còn cây) – khác hẳn đoạn A
DOAN_B = doan(sang_2x(LEFT, LX, LX + W_DOAN / B2, W_DOAN), 21)

# đầu trái: từ mép (nắn) − nhô 3 logic → DAU logic vào trong; phía trong mờ dần (mask nhiễu)
def dau(a, edge, trai, seed):
    nho_gen = MEP_NHO / S
    if trai:
        x0 = edge - nho_gen; x1 = x0 + (DAU + MEP_NHO) / S
    else:
        x1 = edge + nho_gen; x0 = x1 - (DAU + MEP_NHO) / S
    w2 = (DAU + MEP_NHO) * 2
    o = sang_2x(a, x0, x1, w2)
    h = o.shape[0]
    n = nhieu(h, w2, 8, seed) * 9
    xs = np.arange(w2)[None, :].astype(np.float32)
    dist_trong = ((w2 - 1 - xs) if trai else xs) + n      # khoảng cách tới đầu phía trong
    m = np.clip(dist_trong / (DAU_MO * 2), 0, 1) ** 1.3
    o[..., 3] *= m
    return o


DAU_T = dau(LEFT, EDGE_L, True, 31)
DAU_P = dau(RIGHT, EDGE_R, False, 41)


def mo_day(a, seed):
    h, w = a.shape[:2]
    n = nhieu(h, w, 10, seed) * 10
    ys = np.arange(h)[:, None].astype(np.float32)
    m = np.clip((h - 1 - ys + n) / (DAY_MO * 2), 0, 1)
    a = a.copy(); a[..., 3] *= m; return a


DOAN_A, DOAN_B = mo_day(DOAN_A, 51), mo_day(DOAN_B, 51)   # cùng nhiễu, nhiễu lặp theo chiều ngang → mép đáy khớp ở chỗ nối
DAU_T, DAU_P = mo_day(DAU_T, 53), mo_day(DAU_P, 54)

# atlas mặt trên: hàng 0 = giữa A | giữa B, hàng 1 = đầu trái | đầu phải; mỗi ô kéo mép 2 px
PAD = 2
def keo(a):
    return np.pad(a, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='edge')


ds = [('giua-a', DOAN_A), ('giua-b', DOAN_B), ('dau-trai', DAU_T), ('dau-phai', DAU_P)]
wmax = max(W_DOAN * 2, DAU_T.shape[1] + DAU_P.shape[1]) + 8 * PAD
AT = np.zeros((2 * (H_DAI + 2 * PAD), wmax, 4), np.float32); khung = {}
x = 0
for ten, a in ds[:2]:
    AT[0:H_DAI + 2 * PAD, x:x + a.shape[1] + 2 * PAD] = keo(a); khung[ten] = [x + PAD, PAD, a.shape[1], H_DAI]; x += a.shape[1] + 2 * PAD
# giữa A | giữa B nối nhau: kéo mép = nội dung khớp (không phải lặp cột) – chép J của đoạn kia
x = 0
for ten, a in ds[2:]:
    y = H_DAI + 2 * PAD
    AT[y:y + H_DAI + 2 * PAD, x:x + a.shape[1] + 2 * PAD] = keo(a); khung[ten] = [x + PAD, y + PAD, a.shape[1], H_DAI]; x += a.shape[1] + 2 * PAD
luu(AT, os.path.join(DH, 'mat-tren.png'))

# ------------------------------------------------------------ trang trí cây / nấm (tách khỏi dải)
def cat_tt(tt, edge_off, ten_goc):
    """tách cụm theo alpha → list (ảnh 2x, x_neo_logic so với mép/đầu, rộng, cao)"""
    al = tt[..., 3] > 30
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=6))
    out = []
    for i, s in enumerate(ndimage.find_objects(lab)):
        if s is None: continue
        m = (lab[s] == i + 1)
        if al[s][m].sum() < 120: continue
        a = tt[s].copy(); a[..., 3] *= m
        h, w = a.shape[:2]
        w2, h2 = max(2, int(round(w * B2))), max(2, int(round(h * B2)))
        out.append((ten_goc + '-%d' % len(out), doi_co(a, w2, h2), (s[1].start - edge_off) * S, (s[0].stop + Y0 - COL) * S))
    return out


CAY = cat_tt(TT_LEFT, EDGE_L, 'cay-trai') + cat_tt(TT_RIGHT, EDGE_R, 'cay-phai') + cat_tt(TT_MID, 0, 'nam')
wt = sum(c[1].shape[1] + 4 for c in CAY); ht = max(c[1].shape[0] for c in CAY) + 4
TTA = np.zeros((ht, wt, 4), np.float32); x = 0; tt_khung = {}
for ten, a, xl, yl in CAY:
    h, w = a.shape[:2]; TTA[2:2 + h, x + 2:x + 2 + w] = a
    tt_khung[ten] = {'khung': [x + 2, 2, w, h], 'x_logic': round(xl, 1), 'day_logic': round(yl, 1)}; x += w + 4
luu(TTA, os.path.join(DH, 'trang-tri-dh.png'))

# ------------------------------------------------------------ thân đất: 4 mảnh → khối lặp liền 2×2
SQ = [(52, 404), (456, 808), (863, 1216), (1269, 1622)]
T2 = THAN * 2                                    # 320 px / mảnh
OV = 40                                          # chồng lấn 40 px (20 logic) để trộn
manh = []
for i, (x0, x1) in enumerate(SQ):
    a = GA[487:817, x0 + 7:x1 - 7].astype(np.float32)
    a = doi_co(a, T2 + 2 * OV, T2 + 2 * OV)
    a[..., 3] = 255
    manh.append(a[..., :3])
# màu trung bình từng mảnh về chung (tránh ô sáng / tối lệch)
tb = np.mean([m.reshape(-1, 3).mean(0) for m in manh], axis=0)
manh = [m * (tb / m.reshape(-1, 3).mean(0)) for m in manh]
N = 2 * T2
acc = np.zeros((N, N, 3), np.float32); wsum = np.zeros((N, N), np.float32)
thu_tu = [[0, 1], [3, 2]]                        # mảnh lớn chéo nhau khác hướng rễ
for gy in range(2):
    for gx in range(2):
        m = manh[thu_tu[gy][gx]]; sz = m.shape[0]
        n = nhieu(sz, sz, 14, 70 + gy * 2 + gx) * 16
        yy, xx = np.mgrid[0:sz, 0:sz].astype(np.float32)
        de = np.minimum.reduce([xx, yy, sz - 1 - xx, sz - 1 - yy]) + n   # khoảng cách tới mép + nhiễu
        w = np.clip(de / (2 * OV), 0.001, 1) ** 4                        # gần như cắt, chỉ trộn hẹp
        ox, oy = gx * T2 - OV, gy * T2 - OV
        for dy in (-N, 0, N):
            for dx in (-N, 0, N):
                ys0, xs0 = oy + dy, ox + dx
                ya, yb = max(0, ys0), min(N, ys0 + sz); xa, xb = max(0, xs0), min(N, xs0 + sz)
                if ya >= yb or xa >= xb: continue
                acc[ya:yb, xa:xb] += m[ya - ys0:yb - ys0, xa - xs0:xb - xs0] * w[ya - ys0:yb - ys0, xa - xs0:xb - xs0, None]
                wsum[ya:yb, xa:xb] += w[ya - ys0:yb - ys0, xa - xs0:xb - xs0]
THAN_IMG = acc / wsum[..., None]
# kéo mép 2 px bằng phần lặp (vẽ co giãn không hở khe)
TH = np.pad(THAN_IMG, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='wrap')
luu(TH, os.path.join(DH, 'than-dat.png'), 'RGB')
# ảnh kiểm mask: trọng số ranh giới
luu(np.dstack([np.clip(wsum / wsum.max() * 255, 0, 255)] * 3), os.path.join(XT, 'nguon-than-trong-so-noi.png'), 'RGB')
big = np.tile(THAN_IMG, (2, 2, 1)); luu(big, os.path.join(XT, 'nguon-than-lap-2x2.png'), 'RGB')

# ============================================================ 2. NỀN
X = Image.open(os.path.join(NGUON, 'lang-xa-tan.png')).convert('RGB')      # 1672×941
XA_TP, XA_SANG, XA_TOI_GIUA = 0.72, 0.80, 0.14   # tương phản giữ lại, độ sáng chung, tối thêm ở tầm chiến đấu
XA_H = 1140                                                                   # 570 logic (dư 30 cho camera dọc)
xa = X.resize((int(round(X.width * XA_H / X.height)), XA_H), Image.LANCZOS)
# nền xa phải LÙI sau sàn + nhân vật (tư vấn 2: "nền xa ít tương phản; sàn chơi rõ; Lam và tín hiệu nguy hiểm nổi nhất"):
# giữ 72 % tương phản, tối đi; dải ngang tầm chiến đấu (đầu quái / Lam, y 300–448 logic) tối thêm
xv = np.asarray(xa).astype(np.float32)
Lx = xv @ np.array([0.2126, 0.7152, 0.0722], np.float32); Lm = Lx.mean()
xv = xv * ((Lm + (Lx - Lm) * XA_TP) / np.maximum(Lx, 1))[..., None]
yy = np.arange(XA_H, dtype=np.float32)[:, None, None] / 2 + 12          # y logic trên màn (ảnh vẽ từ y −12)
toi = XA_SANG - XA_TOI_GIUA * np.exp(-((yy - 380) / 110) ** 2)
xv = np.clip(xv * toi, 0, 255)
xa = Image.fromarray(xv.astype(np.uint8))
xa.save(os.path.join(DH, 'nen-xa.jpg'), quality=90, optimize=True)

M = np.asarray(Image.open(os.path.join(NGUON, 'lang-giua-tan.png')).convert('RGBA')).astype(np.float32)
CUT = 698                                                                     # đáy thân cây bị cắt ngang (ảnh gen)


def giam(a, tp, vang):
    """giảm tương phản (tp: phần giữ lại) quanh độ sáng trung bình + giảm ánh vàng / cam bão hoà (vang: phần giữ lại)"""
    a = a.copy(); rgb = a[..., :3]; al = a[..., 3] / 255
    L = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    Lm = (L * al).sum() / max(al.sum(), 1)
    k = (Lm + (L - Lm) * tp) / np.maximum(L, 1)
    rgb2 = rgb * k[..., None]
    # vàng / cam: r > g > b rõ và sáng → kéo về xám cùng độ sáng, tối đi
    mx = rgb2.max(axis=2); mn = rgb2.min(axis=2); sat = (mx - mn) / np.maximum(mx, 1)
    w = np.clip((sat - 0.30) / 0.3, 0, 1) * np.clip((rgb2[..., 0] - rgb2[..., 2]) / 60, 0, 1) * np.clip((mx - 90) / 80, 0, 1)
    g = (rgb2 @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    rgb2 = rgb2 * (1 - w[..., None] * (1 - vang)) + g * 0.85 * w[..., None] * (1 - vang)
    a[..., :3] = np.clip(rgb2, 0, 255); return a


# 3 mảnh: (tên, x0, x1 ảnh gen, mép mờ trái, phải, tp, vàng)
GIUA = [('cay-trai', 0, 300, 0, 60, 0.72, 0.35), ('thap', 545, 835, 46, 46, 0.75, 0.55), ('cay-phai', 1320, 1672, 60, 0, 0.72, 0.35)]
GIUA_SANG = 0.84                                  # nền giữa tối đi 16 % (lùi sau sàn, nhân vật)
K_GIUA = 0.69                                     # logic / px ảnh gen nền giữa (2x: 1,24)
gi = []
for ten, x0, x1, ml, mr, tp, vg in GIUA:
    a = giam(M[:CUT + 4, x0:x1], tp, vg); a[..., :3] *= GIUA_SANG
    h, w = a.shape[:2]
    n = nhieu(h, w, 12, sum(map(ord, ten))) * 14
    xs = np.arange(w)[None, :].astype(np.float32)
    m = np.ones((h, w), np.float32)
    if ml: m *= np.clip((xs - n) / ml, 0, 1)
    if mr: m *= np.clip(((w - 1 - xs) - n) / mr, 0, 1)
    m *= np.clip(np.arange(h, dtype=np.float32)[:, None] / 40.0, 0, 1)   # mép trên ảnh gen bị cắt: mờ 40 px (thường nằm trên mép màn)
    a[..., 3] *= m
    gi.append((ten, doi_co(a, int(round(w * K_GIUA * 2)), int(round(h * K_GIUA * 2)))))
wg = sum(a.shape[1] + 4 for _, a in gi); hg = max(a.shape[0] for _, a in gi)
GA2 = np.zeros((hg, wg, 4), np.float32); x = 0; giua_khung = {}
for ten, a in gi:
    h, w = a.shape[:2]; GA2[:h, x:x + w] = a; giua_khung[ten] = [x, 0, w, h]; x += w + 4
luu(GA2, os.path.join(DH, 'nen-giua.png'))

# ============================================================ 3. JSON
J_OUT = {
    'ghi_chu': 'Bộ địa hình + nền hướng mới (tư vấn 3) – sinh bởi code/tao.py. Ảnh 2x: px = logic × 2. Toạ độ "khung" = [x, y, rộng, cao] px ảnh.',
    'boi': 2,
    'nen': {
        'xa': {'tep': 'nen-xa.jpg', 'co_anh': list(xa.size), 'co_logic': [xa.width / 2, xa.height / 2], 'he_so': 0.08, 'he_so_doc': 0.15, 'y_logic': -12,
               'lap': 'soi-guong'},
        'giua': {'tep': 'nen-giua.png', 'co_anh': [GA2.shape[1], GA2.shape[0]], 'he_so': 0.40, 'he_so_doc': 0.40, 'khung': giua_khung,
                 'cat_day_logic': round(CUT * K_GIUA, 1), 'k_logic': K_GIUA,
                 'ghi_chu': 'mỗi mảnh cao tới đường cắt thân cây; game đặt đường cắt nằm dưới mặt sàn (sau địa hình)'},
    },
    'mat_tren': {'tep': 'mat-tren.png', 'co_anh': [AT.shape[1], AT.shape[0]], 'khung': khung, 'cao_logic': H_DAI / 2, 'nho_logic': MAT_NHO,
                 'doan_logic': DOAN, 'khop_logic': 2 * J, 'dau_logic': DAU, 'dau_mo_logic': DAU_MO, 'dau_nho_logic': MEP_NHO, 'day_mo_logic': DAY_MO},
    'than': {'tep': 'than-dat.png', 'co_anh': [TH.shape[1], TH.shape[0]], 'pad': PAD, 'khoi_logic': 2 * THAN, 'manh_logic': THAN},
    'trang_tri': {'tep': 'trang-tri-dh.png', 'co_anh': [TTA.shape[1], TTA.shape[0]], 'o': tt_khung,
                  'ghi_chu': 'x_logic: mép trái mảnh so với mép collider (cây-trái / cây-phải) hoặc so với đầu đoạn giữa (nấm); day_logic: đáy mảnh so với mặt collider'},
}
_cu = os.path.join(DH, 'dia-hinh.json')
if os.path.exists(_cu):   # giữ phần "khuon" do code/khuon.py ghi
    _k = json.load(open(_cu, encoding='utf-8')).get('khuon')
    if _k: J_OUT['khuon'] = _k
json.dump(J_OUT, open(os.path.join(DH, 'dia-hinh.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('mặt trên cao %d px (%.1f logic); đoạn %d; đầu %d; thân %s; trang trí %d mảnh; nền xa %s; nền giữa %s' %
      (H_DAI, H_DAI / 2, W_DOAN, DAU_T.shape[1], TH.shape[:2], len(CAY), xa.size, GA2.shape[:2]))
