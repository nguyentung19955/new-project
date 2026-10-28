#!/usr/bin/env python3
"""BỘ ĐỊA HÌNH MỚI (ảnh gen của chủ dự án, 28/10/2026) → atlas 2x cho game – thay mép cũ chỉnh màu.

Nguồn (art/huong-moi/nguon/dia-hinh/, nền trắng):
  bo-dat-3x3.png    mặt trên trái / giữa / phải · cạnh trái / thân / cạnh phải · đáy trái / giữa / phải
  canh-day-re.png   cạnh đứng trái (đầu / giữa / cuối), cạnh đứng phải (đầu / giữa / cuối), đáy trái / giữa / phải
  van-mot-chieu.png 2 bộ ván một chiều (đầu trái / giữa / đầu phải)
  diem-luu-moi.png  điểm lưu 2 trạng thái          hinh-nom.png  hình nộm

Ra (art/huong-moi/dia-hinh/, ảnh 2x: px ảnh = logic × 2):
  dat-moi.png       atlas: thân lặp liền 320×320 logic · mặt trên (3 đoạn giữa + 2 đầu) · đáy (3 đoạn + 2 đầu) · cạnh đứng trái / phải
                    (mỗi bên 3 đoạn lặp dọc) · ván một chiều (2 bộ × trái / giữa / phải)
  do-vat-a.png      điểm lưu (vòm chung + chuông tắt + chuông đã lưu, chuông RỜI để lắc) + hình nộm (+ bản sáng khi trúng đòn)
  dia-hinh.json     khoá "bo_moi" (khung, neo, cỡ logic, mức nhô) và "do_vat_a" – giữ nguyên các khoá khác
  xem-thu/bo-moi-*.png  ảnh kiểm từng bước: tách nền (trên ô bàn cờ), mép đã ép, đoạn lặp, thân lặp 2×2

QUY MÔ: mọi mảnh đất dùng CÙNG tỉ lệ S = 0,48 logic / px ảnh gen (mảnh thân 330 px gen ≈ 160 logic, mảnh mặt trên 419 px ≈ 200 logic) –
không nén cả mảnh vào ô 32; game cắt theo ô ở toạ độ thế giới. Khuôn (khuon/*.png) là HÌNH HỌC của lát cắt (36×64: 32 trong + 4 nhô),
vật liệu lấy từ dải đủ cỡ.

LUẬT: nhô ra ngoài collider ≤ 3 logic (mặt trên, cạnh đứng), ≤ 4 logic (đáy); không mặt đứng giả; seed cố định (rng 20261028).
"Ép mép" = nắn bóng mép: cục rêu / rễ lồi ra bị NÉN (giữ nét viền) về đường collider + nhô tối đa; chỗ lõm vào được kéo ra lấp kín.

Chạy: python3 -B art/huong-moi/dia-hinh/code/tao-bo-moi.py   (Pillow, numpy, scipy; ~20 s)"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DH = os.path.normpath(os.path.join(HERE, '..'))
NG = os.path.normpath(os.path.join(DH, '..', 'nguon', 'dia-hinh'))
XT = os.path.join(DH, 'xem-thu'); os.makedirs(XT, exist_ok=True)

S = 0.48               # logic / px gen (đất)
NHO = 3                # mặt trên + cạnh đứng: nhô tối đa (logic)
NHO_D = 4              # đáy: nhô xuống tối đa (logic)
DOAN = 128             # đoạn lặp (logic) – mặt trên, đáy, cạnh đứng
J = 12                 # nửa khớp (logic)
DAU = 96               # đầu trái / phải (logic, không kể nhô)
DAU_MO = 30            # phía trong đầu mờ dần (logic)
TUONG = 44             # cạnh đứng: rộng vào trong (logic), 18 logic cuối mờ vào thân
THAN = 160             # mảnh thân (logic) → khối 2×2 = 320
MO_DAY = 24            # đáy dải mặt trên mờ vào thân (logic)
MO_TREN_D = 26         # đỉnh dải đáy mờ vào thân (logic)
PAD = 2


# ------------------------------------------------------------ tiện ích
def nhieu(h, w, sigma, seed):
    r = np.random.default_rng(seed).standard_normal((h, w))
    r = ndimage.gaussian_filter(r, sigma, mode='wrap')
    return r / (r.std() + 1e-9)


def tach_nen(path):
    """nền trắng → RGBA float: flood-fill từ mép ảnh qua điểm gần trắng (nền), alpha mép theo độ trắng, khử viền trắng (un-premultiply)
    + bỏ quầng 1 px sáng. Điểm sáng KHÔNG nối với nền (vải hình nộm, dấu ngà trên chuông) giữ nguyên."""
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    mn = rgb.min(2); mx = rgb.max(2)
    gan_trang = (mn > 228) & (mx - mn < 22)
    lab, _ = ndimage.label(gan_trang)
    vien = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); vien = vien[vien > 0]
    nen = np.isin(lab, vien)
    nen = ndimage.binary_opening(nen, iterations=1) | (nen & (mn > 246))
    # dải mép (≤ 3 px quanh nền): alpha theo khoảng cách tới trắng; trong vật: 1; nền: 0
    dai = ndimage.binary_dilation(nen, iterations=3) & ~nen
    al = np.ones_like(mn); al[nen] = 0
    al[dai] = np.clip((252 - mn[dai]) / 85.0, 0, 1)
    c = np.where(al[..., None] > 0.02, (rgb - (1 - al[..., None]) * 255) / np.maximum(al[..., None], 0.02), 0)
    c = np.clip(c, 0, 255)
    # quầng sáng sót (điểm mép sáng hơn hẳn điểm trong kề bên) → hạ alpha
    L = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    Ltrong = ndimage.grey_erosion(np.where(al > 0.9, L, 255), size=(5, 5))
    sang = dai & (L > Ltrong + 60) & (L > 150)
    al[sang] *= 0.25
    return np.dstack([c, al * 255]).astype(np.float32)


def ban_co(a, o=12):
    """xem trước RGBA trên nền bàn cờ (kiểm viền trắng / đen)"""
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    bc = np.where(((yy // o) + (xx // o)) % 2, 200, 120).astype(np.float32)[..., None] * np.array([0.8, 1.0, 0.9])
    al = a[..., 3:4] / 255
    return np.clip(a[..., :3] * al + bc * (1 - al), 0, 255)


def doi_co(a, w, h):
    """RGBA float → cỡ mới, nội suy tiền nhân alpha (không viền)"""
    al = a[..., 3:4] / 255; pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    o = np.dstack([np.asarray(Image.fromarray(pm[..., c].astype(np.float32), 'F').resize((int(w), int(h)), Image.LANCZOS)) for c in range(4)])
    al2 = np.clip(o[..., 3:4], 0, 255) / 255
    rgb = np.where(al2 > 0.003, o[..., :3] / np.maximum(al2, 0.003), 0)
    return np.dstack([np.clip(rgb, 0, 255), np.clip(o[..., 3:4], 0, 255)]).astype(np.float32)


def luu(a, path, mode='RGBA'):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), mode).save(path, optimize=True)


def bien_tren(a, nguong=128):
    al = a[..., 3]; h = al.shape[0]; m = al > nguong
    return np.where(m.any(0), m.argmax(0), h).astype(np.float32)


def ep_tren(a, L, nho, D=70, k=0.3, lam_min=True):
    """ÉP MÉP TRÊN về đường L (px của a): đỉnh từng cột e → t = L − min(nho, (L − e)·k) (lồi lên: chỉ giữ 30 %, tối đa nho;
    lõm xuống: kéo lên tới L). Cột được ánh xạ lại tuyến tính trong dải [t, t + D] → giữ nét viền, không cắt phẳng."""
    h, w = a.shape[:2]
    e = bien_tren(a)
    e = ndimage.median_filter(e, 7, mode='nearest'); e = ndimage.gaussian_filter1d(e, 2, mode='nearest')
    e = np.minimum(e, L + D * 0.6)
    t = L - np.clip((L - e) * k, 0, nho)
    if not lam_min: t = np.where(e > L, e, t)
    al = a[..., 3:4] / 255; pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    out = np.zeros_like(pm); ys = np.arange(h, dtype=np.float32)
    for x in range(w):
        src = ys.copy(); tt, ee = t[x], e[x]
        tren = ys < tt; giua = (ys >= tt) & (ys <= tt + D)
        src[tren] = ys[tren] - tt + ee
        src[giua] = ee + (ys[giua] - tt) * (tt + D - ee) / D
        for c in range(4):
            out[:, x, c] = np.interp(src, ys, pm[:, x, c], left=0, right=pm[-1, x, c])
    al2 = np.clip(out[..., 3:4], 0, 255) / 255
    rgb = np.where(al2 > 0.003, out[..., :3] / np.maximum(al2, 0.003), 0)
    return np.dstack([np.clip(rgb, 0, 255), out[..., 3:4]]).astype(np.float32)


def ep(a, canh, L, nho, **kw):
    """ép mép theo cạnh: 'tren' | 'duoi' | 'trai' | 'phai' (L = toạ độ đường collider theo trục tương ứng, px của a)"""
    if canh == 'tren': return ep_tren(a, L, nho, **kw)
    if canh == 'duoi': return ep_tren(a[::-1], a.shape[0] - 1 - L, nho, **kw)[::-1]
    if canh == 'trai': return ep_tren(a.transpose(1, 0, 2), L, nho, **kw).transpose(1, 0, 2)
    if canh == 'phai': return ep_tren(a[:, ::-1].transpose(1, 0, 2), a.shape[1] - 1 - L, nho, **kw).transpose(1, 0, 2)[:, ::-1]


def duong(a, canh, pct=50, tu=None, den=None):
    """đường mép trung vị (px của a) – dùng để đặt collider"""
    if canh in ('trai', 'phai'):
        b = a.transpose(1, 0, 2) if canh == 'trai' else a[:, ::-1].transpose(1, 0, 2)
    elif canh == 'duoi': b = a[::-1]
    else: b = a
    e = bien_tren(b)[tu:den]; e = e[e < b.shape[0]]
    v = float(np.percentile(e, pct))
    return v if canh in ('tren', 'trai') else (a.shape[0 if canh == 'duoi' else 1] - 1 - v)


def mask_noi(h, w, ramp, seed, trai, J2):
    n = nhieu(h, w, 9, seed) * ramp * 0.35
    xs = np.arange(w)[None, :].astype(np.float32)
    d0 = xs if trai else (w - 1 - xs)
    dist = d0 + n * np.clip(d0 / 24.0, 0, 1)
    return np.clip(1 - (dist - J2 * 0.5) / ramp, 0, 1) ** 1.5


def doan_khop(src, khop_src, jc, seed, J2, R_them=34, ramp=30):
    """đoạn lặp ngang: 2 đầu thay bằng nội dung quanh tâm khớp (khop_src cột jc) → đoạn bất kỳ ghép đoạn bất kỳ đều liền;
    trộn vào nội dung đoạn bằng mask nhiễu (ranh giới gồ ghề)"""
    s = src.copy(); h, w = s.shape[:2]; R = J2 + R_them
    mt = mask_noi(h, w, ramp, seed, True, J2)[..., None]; mp = mask_noi(h, w, ramp, seed + 1, False, J2)[..., None]
    Lp = s.copy(); Lp[:, :R] = khop_src[:, jc:jc + R]
    Rp = s.copy(); Rp[:, w - R:] = khop_src[:, jc - R:jc]
    o = s * (1 - mt) + Lp * mt
    return o * (1 - mp) + Rp * mp


def mo_canh(a, canh, rong, seed, bien=8):
    """mờ dần một cạnh (vào thân) theo mask nhiễu: canh = 'duoi' | 'tren' | 'trong-trai' (mờ về phía phải) | 'trong-phai'"""
    h, w = a.shape[:2]; n = nhieu(h, w, 9, seed) * bien
    if canh == 'duoi': d = (h - 1 - np.arange(h, dtype=np.float32))[:, None] + n
    elif canh == 'tren': d = np.arange(h, dtype=np.float32)[:, None] + n
    elif canh == 'trong-trai': d = (w - 1 - np.arange(w, dtype=np.float32))[None, :] + n
    else: d = np.arange(w, dtype=np.float32)[None, :] + n
    a = a.copy(); a[..., 3] *= np.clip(d / rong, 0, 1) ** 1.2; return a


# ------------------------------------------------------------ 1. tách nền
print('tách nền…')
BD = tach_nen(os.path.join(NG, 'bo-dat-3x3.png'))
CD = tach_nen(os.path.join(NG, 'canh-day-re.png'))
VM = tach_nen(os.path.join(NG, 'van-mot-chieu.png'))
DL = tach_nen(os.path.join(NG, 'diem-luu-moi.png'))
HN = tach_nen(os.path.join(NG, 'hinh-nom.png'))
for ten, a in (('bo-dat-3x3', BD), ('canh-day-re', CD), ('van-mot-chieu', VM), ('diem-luu', DL), ('hinh-nom', HN)):
    im = Image.fromarray(ban_co(a).astype(np.uint8)); im.thumbnail((1200, 1200)); im.save(os.path.join(XT, 'bo-moi-tach-nen-%s.png' % ten), optimize=True)

B2 = 2 * S                         # px 2x / px gen
def x2(a): return doi_co(a, max(2, round(a.shape[1] * B2)), max(2, round(a.shape[0] * B2)))


# ------------------------------------------------------------ 2. THÂN: 4 mảnh 330 px gen (≈ 160 logic) → khối lặp liền 2×2 (320 logic)
print('thân…')
SQ = [BD[384:714, 562:892], BD[384:714, 645:975][:, ::-1], BD[384:714, 167:497], BD[384:714, 1042:1372]]   # thân giữa (2 phần, 1 lật), trong cạnh trái, trong cạnh phải
T2 = THAN * 2; OV = 40
manh = []
for a in SQ:
    b = doi_co(a, T2 + 2 * OV, T2 + 2 * OV); manh.append(b[..., :3])
tb = np.mean([m.reshape(-1, 3).mean(0) for m in manh], axis=0)
manh = [m * (tb / m.reshape(-1, 3).mean(0)) for m in manh]
N = 2 * T2; acc = np.zeros((N, N, 3), np.float32); ws = np.zeros((N, N), np.float32)
for gy, hang in enumerate([[0, 2], [3, 1]]):
    for gx, i in enumerate(hang):
        m = manh[i]; sz = m.shape[0]
        n = nhieu(sz, sz, 14, 170 + gy * 2 + gx) * 16
        yy, xx = np.mgrid[0:sz, 0:sz].astype(np.float32)
        de = np.minimum.reduce([xx, yy, sz - 1 - xx, sz - 1 - yy]) + n
        w = np.clip(de / (2 * OV), 0.001, 1) ** 4
        ox, oy = gx * T2 - OV, gy * T2 - OV
        for dy in (-N, 0, N):
            for dx in (-N, 0, N):
                y0, x0 = oy + dy, ox + dx
                ya, yb, xa, xb = max(0, y0), min(N, y0 + sz), max(0, x0), min(N, x0 + sz)
                if ya >= yb or xa >= xb: continue
                acc[ya:yb, xa:xb] += m[ya - y0:yb - y0, xa - x0:xb - x0] * w[ya - y0:yb - y0, xa - x0:xb - x0, None]
                ws[ya:yb, xa:xb] += w[ya - y0:yb - y0, xa - x0:xb - x0]
THAN_IMG = np.dstack([acc / ws[..., None], np.full((N, N), 255, np.float32)])
luu(np.tile(THAN_IMG[..., :3], (2, 2, 1)), os.path.join(XT, 'bo-moi-than-lap-2x2.png'), 'RGB')
TB_MAU = tb                          # màu trung bình thân (để kéo các dải mép về cùng tông)


def keo_mau(a, k=0.6, seed=0):
    """kéo màu trung bình phần đặc của mảnh về thân (k = mức kéo)"""
    al = a[..., 3] > 200
    if al.sum() < 50: return a
    m = a[..., :3][al].mean(0); f = 1 + (TB_MAU / np.maximum(m, 1) - 1) * k
    a = a.copy(); a[..., :3] = np.clip(a[..., :3] * f, 0, 255); return a


# ------------------------------------------------------------ 3. MẶT TRÊN (bo-dat hàng 1): đoạn A (giữa), B (trong đầu trái), C (trong đầu phải) + 2 đầu
print('mặt trên…')
COL_T = 92.0                                           # mặt collider trong ảnh gen (mép trên thẳng ở y ≈ 90, viền 2 px)
Y0T = int(COL_T - NHO / S) - 1                         # đỉnh vùng cắt (gen)
Y1T = 326
TL = ep(BD[Y0T - 60:Y1T, 30:505].copy(), 'tren', COL_T - (Y0T - 60), NHO / S)[60:]
TM = ep(BD[Y0T - 10:Y1T, 556:981].copy(), 'tren', COL_T - (Y0T - 10), NHO / S)[10:]
TR = ep(BD[Y0T - 60:Y1T, 1033:1506].copy(), 'tren', COL_T - (Y0T - 60), NHO / S)[60:]
# mép đứng của 2 đầu (trái: x ≈ 51 gen; phải: x ≈ 1484)
EL = duong(TL, 'trai', 30, tu=int(NHO / S) + 20); ER = duong(TR, 'phai', 30, tu=int(NHO / S) + 20)
TL = ep(TL, 'trai', EL, NHO / S); TR = ep(TR, 'phai', ER, NHO / S)
HS2 = round((Y1T - Y0T) * B2)                          # cao dải (px 2x)
def dai2(a, x0, x1): return doi_co(a[:, int(x0):int(x1)], round((x1 - x0) * B2), HS2)
TM2 = dai2(TM, 0, TM.shape[1]); jc = TM2.shape[1] // 2; J2 = J * 2; W2 = DOAN * 2
seg_w = W2 / B2                                        # px gen của 1 đoạn
MAT = {
    'giua-a': doan_khop(dai2(TM, 12, 12 + seg_w), TM2, jc, 11, J2),
    'giua-b': doan_khop(dai2(TL, 470 - seg_w, 470), TM2, jc, 21, J2),
    'giua-c': doan_khop(dai2(TR, 8, 8 + seg_w), TM2, jc, 31, J2),
}
for k in MAT: MAT[k][:, :, :3] = keo_mau(MAT[k], 0.35)[..., :3]
def dau_tren(a, edge, trai, seed):
    nho = NHO / S
    x0 = edge - nho if trai else edge + nho - (DAU + NHO) / S
    o = dai2(a, x0, x0 + (DAU + NHO) / S)
    # khớp phía trong = nội dung khớp chung (để nối với đoạn bất kỳ)
    return mo_canh(o, 'trong-trai' if trai else 'trong-phai', DAU_MO * 2, seed)
MAT['dau-trai'] = dau_tren(TL, EL, True, 41); MAT['dau-phai'] = dau_tren(TR, ER, False, 42)
for k in list(MAT): MAT[k] = mo_canh(MAT[k], 'duoi', MO_DAY * 2, 51)
luu(np.hstack([ban_co(MAT[k]) for k in ('dau-trai', 'giua-a', 'giua-b', 'giua-c', 'giua-a', 'dau-phai')]), os.path.join(XT, 'bo-moi-mat-tren-noi.png'), 'RGB')


# ------------------------------------------------------------ 4. ĐÁY (bo-dat hàng 3 + canh-day-re hàng 3): đoạn A, B, C + 2 đầu
print('đáy…')
def lay_day(a, x0, x1, y0, y1):
    p = a[y0:y1 + 40, x0:x1].copy()
    Lb = duong(p, 'duoi', 50, tu=int(0.2 * p.shape[1]), den=int(0.8 * p.shape[1]))
    p = ep(p, 'duoi', Lb, NHO_D / S, k=0.35)
    return p, Lb
BM, LbM = lay_day(BD, 548, 989, 799, 950)
BM2_, LbM2 = lay_day(CD, 540, 977, 842, 980)
BLx, LbL = lay_day(BD, 30, 505, 799, 952)
BRx, LbR = lay_day(BD, 1030, 1506, 799, 952)
HD_GEN = 128                                           # cao dải đáy (gen) ≈ 61 logic: từ đường collider lên 61 − 4 logic
def cat_day(p, Lb):
    y1 = int(round(Lb + NHO_D / S)); y0 = y1 - HD_GEN
    if y0 < 0: p = np.pad(p, ((-y0, 0), (0, 0), (0, 0)), mode='edge'); y1 -= y0; y0 = 0
    return p[y0:y1]
BM, BM2_, BLx, BRx = cat_day(BM, LbM), cat_day(BM2_, LbM2), cat_day(BLx, LbL), cat_day(BRx, LbR)
HD2 = round(HD_GEN * B2)
def day2(a, x0, x1): return doi_co(a[:, int(x0):int(x1)], round((x1 - x0) * B2), HD2)
BMF = day2(BM, 0, BM.shape[1]); jd = BMF.shape[1] // 2
EBL = duong(BLx, 'trai', 30, den=HD_GEN - 30); EBR = duong(BRx, 'phai', 30, den=HD_GEN - 30)
BLx = ep(BLx, 'trai', EBL, NHO / S); BRx = ep(BRx, 'phai', EBR, NHO / S)
DAY = {
    'giua-a': doan_khop(day2(BM, 20, 20 + seg_w), BMF, jd, 61, J2),
    'giua-b': doan_khop(day2(BM2_, 60, 60 + seg_w), BMF, jd, 71, J2),
    'giua-c': doan_khop(day2(BLx, 470 - seg_w, 470), BMF, jd, 81, J2),
}
for k in DAY: DAY[k][:, :, :3] = keo_mau(DAY[k], 0.35)[..., :3]
def dau_day(a, edge, trai, seed):
    nho = NHO / S
    x0 = edge - nho if trai else edge + nho - (DAU + NHO) / S
    return mo_canh(day2(a, x0, x0 + (DAU + NHO) / S), 'trong-trai' if trai else 'trong-phai', DAU_MO * 2, seed)
DAY['dau-trai'] = dau_day(BLx, EBL, True, 91); DAY['dau-phai'] = dau_day(BRx, EBR, False, 92)
for k in list(DAY): DAY[k] = mo_canh(DAY[k], 'tren', MO_TREN_D * 2, 95)
luu(np.hstack([ban_co(DAY[k]) for k in ('dau-trai', 'giua-a', 'giua-b', 'giua-c', 'giua-a', 'dau-phai')]), os.path.join(XT, 'bo-moi-day-noi.png'), 'RGB')


# ------------------------------------------------------------ 5. CẠNH ĐỨNG (canh-day-re hàng 1 = trái, hàng 2 = phải): mỗi bên 3 đoạn lặp dọc 128 logic
print('cạnh đứng…')
TW_GEN = (TUONG + NHO) / S
def lay_tuong(a, x0, x1, y0, y1, trai):
    p = a[y0:y1, x0:x1].copy()
    e = duong(p, 'trai' if trai else 'phai', 30)
    p = ep(p, 'trai' if trai else 'phai', e, NHO / S)
    xa = e - NHO / S if trai else e + NHO / S - TW_GEN
    q = p[:, int(round(xa)):int(round(xa + TW_GEN))]
    # quay ngang (dọc → ngang) để dùng chung doan_khop
    return q.transpose(1, 0, 2)
TT_ = {'trai': [lay_tuong(CD, 640, 862, 64, 392, True), lay_tuong(CD, 266, 492, 120, 396, True), lay_tuong(CD, 1004, 1232, 44, 300, True)],
       'phai': [lay_tuong(CD, 650, 866, 470, 795, False), lay_tuong(CD, 288, 498, 520, 797, False), lay_tuong(CD, 1014, 1236, 446, 700, False)]}
TW2 = round(TW_GEN * B2)
TUONG_OUT = {}
for ben, ds in TT_.items():
    g = ds[0]; G2 = doi_co(g, round(g.shape[1] * B2), TW2); jg = G2.shape[1] // 2
    for i, (ten, p) in enumerate(zip(('a', 'b', 'c'), ds)):
        L = min(seg_w, p.shape[1] - 4); x0 = (p.shape[1] - L) / 2
        s = doi_co(p[:, int(x0):int(x0 + L)], W2, TW2)
        s = doan_khop(s, G2, jg, 101 + i + (10 if ben == 'phai' else 0), J2)
        s = s.transpose(1, 0, 2)                       # về dọc: cao W2, rộng TW2
        s[..., :3] = keo_mau(s, 0.45)[..., :3]
        s = mo_canh(s, 'trong-trai' if ben == 'trai' else 'trong-phai', 18 * 2, 111 + i)
        TUONG_OUT['%s-%s' % (ben, ten)] = s
luu(np.hstack([np.vstack([ban_co(TUONG_OUT['%s-%s' % (b, t)]) for t in 'abca']) for b in ('trai', 'phai')]), os.path.join(XT, 'bo-moi-canh-dung-noi.png'), 'RGB')


# ------------------------------------------------------------ 6. VÁN MỘT CHIỀU: 2 bộ; ván dày ≈ 15 logic, giá đỡ chĩa xuống (nén dọc 0,6)
print('ván…')
SVX, SVY, NEN_GIA = 0.25, 0.34, 0.6                    # logic / px gen (ngang hơi nén để giá đỡ nằm gọn trong đầu 64 logic)
VAN_DAU = 64; VAN_GIUA = 64; JV = 8
def lay_van(a, x0, x1, y0, y1):
    p = np.pad(a[y0 - 20:y1, x0:x1], ((0, 0), (40, 40), (0, 0)))
    cx = p.shape[1] // 2
    top = duong(p[:, cx - 60:cx + 60], 'tren', 50)
    p = ep(p, 'tren', top, NHO / SVY, D=30)
    return p, top
def van_2x(p, top):
    """→ 2x: mặt ván tại hàng NHO*2; ván 46 px gen (≈ 15,6 logic) giữ tỉ lệ; phần dưới ván (giá đỡ) nén dọc"""
    y_tren = top - NHO / SVY; y_van = top + 46
    a1 = p[int(round(y_tren)):int(round(y_van))]; a2 = p[int(round(y_van)):]
    w2 = round(p.shape[1] * SVX * 2)
    h1 = round(a1.shape[0] * SVY * 2); h2 = max(2, round(a2.shape[0] * SVY * 2 * NEN_GIA))
    return np.vstack([doi_co(a1, w2, h1), doi_co(a2, w2, h2)]), h1
VAN = {}; VAN_H = None; VAN_MAT = NHO * 2
for bo, yy in ((1, (267, 448)), (2, (617, 788))):
    L_, tL = lay_van(VM, 20, 508, *yy); M_, tM = lay_van(VM, 530, 1008, *yy); R_, tR = lay_van(VM, 1032, 1518, *yy)
    L2, _ = van_2x(L_, tL); M2v, _ = van_2x(M_, tM); R2, _ = van_2x(R_, tR)
    H = max(L2.shape[0], M2v.shape[0], R2.shape[0]); VAN_H = max(VAN_H or 0, H)
    pad = lambda a: np.pad(a, ((0, H - a.shape[0]), (0, 0), (0, 0)))
    L2, M2v, R2 = pad(L2), pad(M2v), pad(R2)
    jm = M2v.shape[1] // 2
    # đầu trái: mép ván (sau ép) − nhô 3 → 64 logic; đầu phải tương tự
    eL = duong(L2[VAN_MAT:VAN_MAT + 28], 'trai', 20); eR = duong(R2[VAN_MAT:VAN_MAT + 28], 'phai', 80)
    xl = int(round(eL - NHO * 2)); xr = int(round(eR + NHO * 2))
    dl = L2[:, xl:xl + (VAN_DAU + NHO) * 2]; dr = R2[:, xr - (VAN_DAU + NHO) * 2:xr]
    gm = M2v[:, jm - VAN_GIUA:jm + VAN_GIUA]
    # khớp: đầu trong của 2 đầu + 2 đầu đoạn giữa = nội dung quanh tâm đoạn giữa (chỉ phần ván; dưới ván trong suốt)
    dl = doan_khop(np.pad(dl, ((0, 0), (0, 40), (0, 0))), M2v, jm, 201 + bo, JV * 2, R_them=10, ramp=14)[:, :dl.shape[1]]
    dr = doan_khop(np.pad(dr, ((0, 0), (40, 0), (0, 0))), M2v, jm, 211 + bo, JV * 2, R_them=10, ramp=14)[:, 40:]
    gm = doan_khop(gm, M2v, jm, 221 + bo, JV * 2, R_them=10, ramp=14)
    VAN['%d-trai' % bo], VAN['%d-giua' % bo], VAN['%d-phai' % bo] = dl, gm, dr
for k in VAN:
    if VAN[k].shape[0] < VAN_H: VAN[k] = np.pad(VAN[k], ((0, VAN_H - VAN[k].shape[0]), (0, 0), (0, 0)))
luu(np.vstack([np.hstack([ban_co(VAN['%d-trai' % b]), ban_co(VAN['%d-phai' % b])]) for b in (1, 2)] +
              [np.hstack([ban_co(VAN['1-trai']), ban_co(VAN['1-giua']), ban_co(VAN['2-giua']), ban_co(VAN['1-phai'])])[:, :(VAN_DAU + NHO) * 4]]),
    os.path.join(XT, 'bo-moi-van-noi.png'), 'RGB')


# ------------------------------------------------------------ 7. ĐIỂM LƯU + HÌNH NỘM
print('điểm lưu, hình nộm…')
def giam_reu(a, bh=0.5, toi=0.9, ve_vo=0.28):
    """rêu (vàng-xanh) giảm bão hoà + tối nhẹ + kéo một phần về màu vỏ gỗ ở chỗ không sát bóng (rêu trông mỏng hơn)"""
    a = a.copy(); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a[..., :3].max(2); mn = a[..., :3].min(2); sat = (mx - mn) / np.maximum(mx, 1)
    reu = np.clip((g - r * 0.82) / 25, 0, 1) * np.clip((g - b * 1.15) / 25, 0, 1) * np.clip((sat - 0.18) / 0.15, 0, 1)
    L = (a[..., :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    xam = L + (a[..., :3] - L) * bh
    vo = np.array([98, 72, 52], np.float32) * (L / 80.0)
    trong = ndimage.binary_erosion(a[..., 3] > 200, iterations=6)[..., None]
    moi = xam * toi * (1 - ve_vo * trong) + vo * ve_vo * trong
    a[..., :3] = a[..., :3] * (1 - reu[..., None]) + moi * reu[..., None]
    return a
# 2 trạng thái: trái (tắt) x 29..890, phải (đã lưu) x 892..1757; tìm độ lệch của bản phải bằng khớp mask vòm
s0 = DL[80:780, 20:892]; al0 = s0[..., 3] > 128
best = None
for dx in range(830, 900):
    s1 = DL[80:780, 20 + dx:892 + dx] if 892 + dx <= DL.shape[1] else None
    if s1 is None or s1.shape != s0.shape: continue
    sc = (al0 & (s1[..., 3] > 128)).sum()
    if best is None or sc > best[0]: best = (sc, dx)
DX1 = best[1]
def tach_chuong(s):
    """chuông + nửa dưới xích (rời) – vùng: (y ≥ 216 & 435 ≤ x ≤ 525) ∪ (y ≥ 300 & 390 ≤ x ≤ 566) toạ độ trong s (gen − (20, 80))"""
    h, w = s.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    m = ((yy >= 216) & (xx >= 435) & (xx <= 525)) | ((yy >= 300) & (xx >= 390) & (xx <= 566))
    m &= yy <= 490
    ch = s.copy(); ch[..., 3] *= m; vom = s.copy(); vom[..., 3] *= ~m
    return vom, ch
VOM, CH_TAT = tach_chuong(s0)
_, CH_SANG = tach_chuong(DL[80:780, 20 + DX1:892 + DX1])
VOM = giam_reu(VOM)
# cỡ: cao 110 logic (vòm), rộng ≈ 112 (ngang nén 0,8 – rễ chân choãi rộng; tư vấn: cao 96–128, rộng 80–112)
bb = np.argwhere(VOM[..., 3] > 30); (y0, x0), (y1, x1) = bb.min(0), bb.max(0) + 1
KY = 110 / (y1 - y0); KX = KY * 0.8
def dl2(a): return doi_co(a[y0:y1 + 0, x0:x1], round((x1 - x0) * KX * 2), round((y1 - y0) * KY * 2))
VOM2 = dl2(VOM); CHT2 = dl2(CH_TAT); CHS2 = dl2(CH_SANG)
def cat_bb(a):
    b = np.argwhere(a[..., 3] > 8); (ya, xa), (yb, xb) = b.min(0), b.max(0) + 1
    return a[ya:yb, xa:xb], (int(xa), int(ya))
CHT2c, ot = cat_bb(CHT2); CHS2c, os_ = cat_bb(CHS2)
treo = ((480 - x0) * KX * 2, (216 - y0) * KY * 2)       # điểm treo (2x, trong khung vòm)
# hình nộm: cao 108 logic
bb = np.argwhere(HN[..., 3] > 30); (hy0, hx0), (hy1, hx1) = bb.min(0), bb.max(0) + 1
KN = 108 / (hy1 - hy0)
NOM = doi_co(HN[hy0:hy1, hx0:hx1], round((hx1 - hx0) * KN * 2), round((hy1 - hy0) * KN * 2))
NOM = giam_reu(NOM, 0.6, 0.95, 0.15)
NOM_S = NOM.copy(); NOM_S[..., :3] = np.clip(NOM_S[..., :3] * 1.25 + 38, 0, 255)   # bản sáng khi trúng đòn
DOV = [('vom', VOM2), ('chuong-tat', CHT2c), ('chuong-sang', CHS2c), ('nom', NOM), ('nom-sang', NOM_S)]
wv = sum(a.shape[1] + 4 for _, a in DOV); hv = max(a.shape[0] for _, a in DOV) + 4
ATV = np.zeros((hv, wv, 4), np.float32); x = 0; KV = {}
for ten, a in DOV:
    h, w = a.shape[:2]; ATV[2:2 + h, x + 2:x + 2 + w] = a; KV[ten] = [x + 2, 2, w, h]; x += w + 4
luu(ATV, os.path.join(DH, 'do-vat-a.png'))
luu(ban_co(ATV, 8), os.path.join(XT, 'bo-moi-do-vat-a.png'), 'RGB')


# ------------------------------------------------------------ 8. ATLAS dat-moi.png (xếp kệ; mỗi ô kéo mép 2 px)
print('atlas…')
def keo(a, wrap=False): return np.pad(a, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='wrap' if wrap else 'edge')
ds = [('than', keo(THAN_IMG, True))]
ds += [('mat-' + k, keo(v)) for k, v in MAT.items()] + [('day-' + k, keo(v)) for k, v in DAY.items()]
ds += [('tuong-' + k, keo(v)) for k, v in TUONG_OUT.items()] + [('van-' + k, keo(v)) for k, v in VAN.items()]
WA = 1600; x = y = hh = 0; pos = {}
for ten, a in ds:
    h, w = a.shape[:2]
    if x + w > WA: x = 0; y += hh + 2; hh = 0
    pos[ten] = (x, y); x += w + 2; hh = max(hh, h)
HA = y + hh
AT = np.zeros((HA, WA, 4), np.float32); KH = {}
for ten, a in ds:
    px, py = pos[ten]; h, w = a.shape[:2]; AT[py:py + h, px:px + w] = a; KH[ten] = [px + PAD, py + PAD, w - 2 * PAD, h - 2 * PAD]
luu(AT, os.path.join(DH, 'dat-moi.png'))

J_PATH = os.path.join(DH, 'dia-hinh.json')
JD = json.load(open(J_PATH, encoding='utf-8'))
JD['bo_moi'] = {
    'ghi_chu': 'Bộ đất mới từ ảnh gen của chủ dự án (bo-dat-3x3, canh-day-re, van-mot-chieu) – sinh bởi code/tao-bo-moi.py. Ảnh 2x. '
               'Mọi dải: px 2x; "khung" = [x, y, rộng, cao] trong dat-moi.png. Mặt trên: hàng 0 của dải = collider − nho_logic. '
               'Đáy: hàng cuối = collider đáy + nho_day_logic. Cạnh đứng trái: cột 0 = collider − nho_logic (phải: cột cuối = collider + nho). '
               'Ván: hàng nho_logic*2 = mặt ván (collider ô "="); đầu trái: cột 0 = mép ô − nho.',
    'tep': 'dat-moi.png', 'co_anh': [WA, HA], 'khung': KH, 'ti_le_gen': S,
    'than_logic': 2 * THAN, 'doan_logic': DOAN, 'nho_logic': NHO, 'nho_day_logic': NHO_D,
    'mat_cao_logic': HS2 / 2, 'day_cao_logic': HD2 / 2, 'dau_logic': DAU, 'tuong_rong_logic': TW2 / 2,
    'van_cao_logic': VAN_H / 2, 'van_dau_logic': VAN_DAU, 'van_giua_logic': VAN_GIUA,
    'mat_doan': ['giua-a', 'giua-b', 'giua-c'], 'day_doan': ['giua-a', 'giua-b', 'giua-c'], 'tuong_doan': ['a', 'b', 'c'], 'van_bo': [1, 2],
}
JD['do_vat_a'] = {
    'ghi_chu': 'Điểm lưu mới (vòm rễ, chuông RỜI 2 trạng thái) + hình nộm mới – sinh bởi code/tao-bo-moi.py. Ảnh 2x. '
               'vòm: cao 110 logic, neo giữa đáy; treo = điểm treo chuông trong khung vòm (px 2x); chuông: neo_treo = điểm treo trong khung chuông. '
               'Rêu giảm bão hoà + mỏng hơn bằng code.',
    'tep': 'do-vat-a.png', 'co_anh': [ATV.shape[1], ATV.shape[0]], 'khung': KV,
    'treo': [round(treo[0], 1), round(treo[1], 1)],
    'chuong_neo': {'chuong-tat': [round(treo[0] - ot[0], 1), round(treo[1] - ot[1], 1)], 'chuong-sang': [round(treo[0] - os_[0], 1), round(treo[1] - os_[1], 1)]},
    'vom_logic': [VOM2.shape[1] / 2, VOM2.shape[0] / 2], 'nom_logic': [NOM.shape[1] / 2, NOM.shape[0] / 2],
}
json.dump(JD, open(J_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('dat-moi.png %d×%d; mặt trên cao %.1f logic; đáy %.1f; tường rộng %.1f; ván cao %.1f; vòm %s; nộm %s; lệch trạng thái điểm lưu %d' %
      (WA, HA, HS2 / 2, HD2 / 2, TW2 / 2, VAN_H / 2, JD['do_vat_a']['vom_logic'], JD['do_vat_a']['nom_logic'], DX1))
