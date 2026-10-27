"""Bước 2 – gạch RỄ MỤC (tiền tố rm-): ô 32 px logic, xuất 64 px (2x), ghép liền, viền đen chỉ ở cạnh lộ.
Cách làm Y NHƯ Làng Chuông v2 (lang-chuong/code/gach.py + than_go.py – đã duyệt), dùng lại các hàm đó:
  1. THÂN: 8 ô thân rễ mục từ ảnh gen nguon/re-muc-gach.png (ô 1 làm lặp liền 2 chiều; 7 ô kia giữ phần giữa, dải mép y hệt
     ô 1 → ghép bất kỳ ô nào cũng liền); bảng 5 tông phẳng + 1 tông MỐC XANH NGỌC (đốm mốc của ảnh gen rất nhạt → nhấn lên
     một chút cho đúng "mốc"); tối 0,8 như Làng Chuông.
  2. MẶT TRÊN: KHÔNG rêu xanh. Dựng bằng code: dải "mép mục" (gỗ mục xám sẫm, mép dưới lởm chởm, chu kỳ = ô → lặp liền)
     + đốm / vệt mốc xanh ngọc + viền đen ở cạnh lộ. 4 biến thể chỉ đổi phần GIỮA (mép trái/phải chung).
  3. TƯỜNG, ĐÁY, GÓC, CỘT, GỜ, KHỐI, GÓC TRONG: thân + viền code (ve_vien của Làng Chuông).
  4. VÁN một chiều: ván gỗ mục (code): dày ~11 logic, 2 khe ván, mép răng cưa, viền đen; giữa lặp ngang không viền dọc.
  5. DỐC: dung_doc (trượt cột ô mặt trên theo mặt dốc).
  6. TƯỜNG MỤC leo được (TẠM – chưa có ảnh gen re-muc-mep.png): 3 trạng thái dựng từ ô thân: 'muc-lanh' (gỗ mục khô, sáng + xơ
     dọc, mốc ở mép), 'muc-nut' (thêm vết nứt), 'muc-nut-2' (nứt rộng, mẻ) + 4 mảnh 'muc-manh-1..4' (rơi khi gãy). Viền đen ở
     cạnh PHẢI (mặt lộ); tường lộ bên trái thì game lật ngang.
Chạy: python3 -B gach_rm.py (trong art/re-muc/code; tên _rm để không trùng gach.py của Làng Chuông)."""
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung_rm import GACH, NGUON, XEM, T2, T_LOGIC, lap_ngang, luu_json, luu_png, thay_le, xep_atlas, LC_CODE, LUM, font
sys.path.insert(0, LC_CODE)
import gach as LC                                    # noqa: E402  hàm đã duyệt: ve_vien, thu_nho, dung_doc, lam_toi, doc_sau, mat_doc
import than_go as TG                                 # noqa: E402  ve_tong, lam_lien, mat_na_giua, kiem_noi

R = LC.R                 # 192 px / ô khi làm việc
B_LAP = LC.B_LAP
B_KHOP = LC.B_KHOP
T_VIEN = LC.T_VIEN
TOI_THAN = 0.80
HOP = [(53, 48), (482, 48), (914, 48), (1346, 48), (53, 468), (482, 468), (914, 468), (1346, 468)]   # góc trên-trái 8 ô gen
CO = 366
VAO = 4
MAU_MOC = np.array([74, 128, 108.0])        # mốc xanh ngọc (đã dịu)
MAU_MEP = np.array([58, 50, 44.0])          # gỗ mục xám sẫm ở mép trên
MAU_MEP_S = np.array([96, 86, 74.0])        # mặt cắt sáng ngay dưới viền
THU_TU = [0, 4, 2, 6, 1, 5, 3, 7]


# ------------------------------------------------------------------ thân từ ảnh gen
def cat_o():
    a = np.array(Image.open(os.path.join(NGUON, 're-muc-gach.png')).convert('RGB')).astype(np.float64)
    out = []
    for x, y in HOP:
        c = a[y + VAO:y + CO - VAO, x + VAO:x + CO - VAO]
        im = Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)).resize((R, R), Image.LANCZOS)
        out.append(np.asarray(im).astype(np.float64))
    return [out[i] for i in THU_TU]


def bo_than_rm():
    """8 ô thân: bảng 5 tông (k-means của than_go) + nhấn mốc xanh ngọc: điểm hơi xanh của gen → kéo về MAU_MOC (mềm)."""
    o = cat_o()
    C = TG.bang_mau(o)
    f0 = TG.lam_lien(o[0], C)
    q = TG.mat_na_giua(10, 34)[..., None]
    out = [f0]
    for t in o[1:]:
        v = TG.ve_tong(f0 * (1 - q) + TG.ve_tong(t, C, 1.2) * q, C)
        v[q[..., 0] == 0] = f0[q[..., 0] == 0]
        out.append(v)
    # mốc: điểm gen hơi xanh (G > R + 6) → tông mốc, chỉ ở phần giữa ô (không đụng dải mép → vẫn liền)
    res = []
    for t, src in zip(out, [TG.lam_lien(o[0], C)] + o[1:]):
        g = (src[..., 1] > src[..., 0] + 6) & (src[..., 1] > src[..., 2])
        g = nd.binary_opening(g, iterations=1)
        g = nd.gaussian_filter(g.astype(float), 1.0)
        g = np.clip(g * 1.6, 0, 1) * (q[..., 0] if t is not out[0] else 1.0)
        res.append(t * (1 - g[..., None]) + MAU_MOC * g[..., None])
    tb = float(np.mean(C, 0) @ LUM)
    res = [tb + (f - tb) * 0.8 for f in res]        # nén tương phản 0,8 như Làng Chuông v2
    return [LC._rgba(f) for f in res], C


# ------------------------------------------------------------------ mép mục (mặt trên) dựng bằng code
def _chu_ky(seed, n_h=3, bien=(6, 14)):
    """Đường lởm chởm chu kỳ R (tổng sin + răng) theo x: trả mảng R giá trị (px)."""
    rng = np.random.default_rng(seed)
    x = np.arange(R) / R * 2 * np.pi
    y = np.zeros(R)
    for k in range(1, n_h + 1):
        y += rng.uniform(*bien) / k * np.sin(k * x + rng.uniform(0, 6.3))
    # răng cưa nhỏ (mục vụn)
    y += rng.uniform(1.5, 3.5) * np.sign(np.sin(7 * x + rng.uniform(0, 6.3)))
    return y


def _tron_mep(base, var, le=22, doc=30):
    a = np.minimum(np.arange(R), R - 1 - np.arange(R)).astype(float)
    w = np.clip((a - le) / doc, 0, 1)
    w = w * w * (3 - 2 * w)
    return base * (1 - w) + var * w


def mep_muc(than, seed, moc=0.7, ss=2):
    """Phủ dải mép mục lên ô thân: dải xám sẫm dày ~34–52 px (6–9 logic), mép dưới lởm chởm chu kỳ R; ngay dưới viền là
    vệt mặt cắt sáng mỏng; đốm mốc xanh ngọc (bầu dục ~1 logic) rải dọc mép + 0–1 vệt mốc chảy ngắn. Biến thể chỉ khác ở
    giữa ô (mép trái / phải chung đường gốc seed 0) → lặp liền và ghép liền với nhau."""
    rng = np.random.default_rng(seed + 100)
    goc = _chu_ky(0)
    day = 40 + (goc if seed == 0 else _tron_mep(goc, _chu_ky(seed)))
    n = R * ss
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / ss
    dayf = np.interp(xx[0], np.arange(R), day)
    c = than.astype(np.float64)[..., :3].copy()
    m = (yy < dayf[None, :]).astype(float)
    # lớp mép có 2 tông: tông sẫm + mảng "vỏ mục" hơi sáng hơn (ô van theo x, chu kỳ R) cho có khối
    van = (0.5 + 0.5 * np.sin(xx / R * 2 * np.pi * 3 + seed) * np.sin(yy * 0.21 + 0.7)) > 0.62
    sang = ((yy >= T_VIEN - 1) & (yy < T_VIEN + 5)).astype(float)
    moc_m = np.zeros((n, n))
    k = int(moc * 8)
    for i in range(k):
        cx = rng.uniform(14, R - 14) if seed else rng.uniform(0, R)
        cy = rng.uniform(10, 34)
        rx, ry = rng.uniform(4, 7), rng.uniform(2.6, 4.2)
        for dx in (0, -R, R):
            d = ((xx - cx - dx) / rx) ** 2 + ((yy - cy) / ry) ** 2
            moc_m = np.maximum(moc_m, (d <= 1).astype(float))
    if rng.uniform() < 0.6:                   # vệt mốc chảy ngắn, đầu tròn
        cx = rng.uniform(20, R - 20)
        L = rng.uniform(12, 26)
        w = rng.uniform(3.2, 4.5)
        d = (np.abs(xx - cx) <= w) & (yy >= 26) & (yy < 26 + L)
        d |= ((xx - cx) ** 2 + (yy - 26 - L) ** 2 <= w * w)
        moc_m = np.maximum(moc_m, d.astype(float))
    def thu(a):
        return a.reshape(R, ss, R, ss).mean((1, 3))
    m, sang, moc_m, van = thu(m), thu(sang), thu(moc_m), thu(van.astype(float))
    Lt = (c @ LUM)[..., None] / 255.0
    mep = MAU_MEP * (0.7 + 0.45 * Lt)
    mep = mep * (1 - van[..., None]) + (MAU_MEP * 1.28) * van[..., None]
    out = c * (1 - m[..., None]) + mep * m[..., None]
    out = out * (1 - sang[..., None]) + MAU_MEP_S * sang[..., None]
    out = out * (1 - moc_m[..., None]) + MAU_MOC * moc_m[..., None]
    bong = thu(((yy >= dayf[None, :]) & (yy < dayf[None, :] + 9)).astype(float))
    out = out * (1 - 0.25 * bong[..., None])
    o = than.copy().astype(np.float64)
    o[..., :3] = np.clip(out, 0, 255)
    return np.round(o).astype(np.uint8)


# ------------------------------------------------------------------ ván mục một chiều (code)
def van_muc(seed, dau=''):
    """Ván gỗ mục: dày 66 px ở R (11 logic), mặt ván xám nâu, 2 khe ván sẫm, vài vết nứt; đầu 'L'/'R' răng cưa + viền;
    giữa không có viền dọc (lặp ngang). Viền đen trên + dưới."""
    rng = np.random.default_rng(seed)
    ss = 2
    n = R * ss
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / ss
    H = 66
    img = np.zeros((n, n, 4))
    mau = np.array([92, 78, 62.0])
    khe = np.array([52, 44, 38.0])
    sang = np.array([118, 102, 82.0])
    body = (yy >= 0) & (yy < H)
    if dau == 'L':
        rang = 10 + 6 * np.sin(yy * 0.3 + 1) + 3 * np.sign(np.sin(yy * 0.6))
        body &= xx >= rang
    if dau == 'R':
        rang = R - 10 - 6 * np.sin(yy * 0.28) - 3 * np.sign(np.sin(yy * 0.55 + 2))
        body &= xx <= rang
    c = np.empty((n, n, 3))
    c[:] = mau
    c[yy < 14] = sang
    for y0 in (24, 46):
        c[(yy >= y0) & (yy < y0 + 4)] = khe
    # vết nứt dọc ngắn
    for i in range(3):
        cx = rng.uniform(20, R - 20)
        y0 = rng.uniform(8, 40)
        L = rng.uniform(10, 24)
        c[(np.abs(xx - cx - (yy - y0) * 0.3) < 1.6) & (yy >= y0) & (yy < y0 + L)] = khe * 0.85
    img[body, :3] = c[body]
    img[body, 3] = 255
    out = img.reshape(R, ss, R, ss, 4).mean((1, 3))
    o = np.round(out).astype(np.uint8)
    o[o[..., 3] == 0] = 0
    lo = 'TB' + ('L' if dau == 'L' else '') + ('R' if dau == 'R' else '')
    return LC.ve_vien(o, lo, bo_tron=6, bong=6)


# ------------------------------------------------------------------ tường mục leo được (TẠM)
def tuong_muc(than, trang_thai, seed=5):
    """TẠM – gỗ mục khô đóng thành 3 tấm ván dọc trên thân (như ván chống hầm cũ): sáng hơn thân 1,35, bớt màu 0,45, mỗi tấm 1
    dải sáng + khe sẫm giữa các tấm, xơ dọc lượn, mốc xanh ngọc loang ở hai mép. Ván chạy suốt ô (lặp dọc liền với chính nó).
    trang_thai: 0 lành, 1 nứt (vết nứt chéo qua tấm giữa), 2 nứt rộng + mẻ. Viền đen ở cạnh PHẢI (cạnh lộ)."""
    rng = np.random.default_rng(seed)
    ss = 2
    n = R * ss
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / ss
    c = than.astype(np.float64)[..., :3].copy()
    L = (c @ LUM)[..., None]
    c = (L + (c - L) * 0.45) * 1.35 + np.array([10, 6, -4.0])
    # 3 tấm ván dọc: khe sẫm 7 px giữa tấm, dải sáng 6 px ở mép trái mỗi tấm, bóng 5 px ở mép phải
    bien = [0, 60, 124, R]
    khe = np.zeros((n, n)); sang = np.zeros((n, n)); bong = np.zeros((n, n))
    for a, b in zip(bien[:-1], bien[1:]):
        lech = 2.5 * np.sin(yy / R * 2 * np.pi + a)        # mép ván hơi lượn (chu kỳ R → lặp dọc liền)
        if a > 0:
            khe = np.maximum(khe, ((xx >= a - 3.5 + lech) & (xx < a + 3.5 + lech)).astype(float))
        sang = np.maximum(sang, ((xx >= a + 3.5 + lech) & (xx < a + 9.5 + lech)).astype(float))
        bong = np.maximum(bong, ((xx >= b - 8.5 + lech) & (xx < b - 3.5 + lech)).astype(float))
    xo = np.zeros((n, n))
    for i in range(7):
        cx = rng.uniform(12, R - 12)
        w = rng.uniform(1.2, 2.4)
        ph = rng.uniform(0, 6.3)
        ln = np.abs(xx - cx - rng.uniform(3, 6) * np.sin(yy / R * 2 * np.pi + ph)) < w
        ln &= (0.5 + 0.5 * np.sin(yy / R * 2 * np.pi * 2 + ph * 3)) > rng.uniform(0.2, 0.45)
        xo = np.maximum(xo, ln.astype(float) * rng.uniform(0.3, 0.5))
    bien_m = np.clip(1 - np.minimum(xx, R - xx) / 16, 0, 1)
    mang = (0.5 + 0.5 * np.sin(yy * 0.11 + 1.3) * np.sin(yy * 0.045 + xx * 0.03)) > 0.55
    moc = bien_m * mang * 0.8
    def thu(a):
        return a.reshape(R, ss, R, ss).mean((1, 3))
    khe, sang, bong, xo, moc = thu(khe), thu(sang), thu(bong), thu(xo), thu(moc)
    c = c * (1 + 0.16 * sang[..., None]) * (1 - 0.18 * bong[..., None]) * (1 - 0.45 * xo[..., None])
    c = c * (1 - khe[..., None]) + np.array([34, 28, 24.0]) * khe[..., None]
    c = c * (1 - moc[..., None] * 0.75) + MAU_MOC * 0.95 * moc[..., None] * 0.75
    if trang_thai >= 1:
        nut = np.zeros((n, n))
        pts = [(R * 0.55, 0), (R * 0.45, R * 0.3), (R * 0.6, R * 0.55), (R * 0.42, R * 0.8), (R * 0.5, R)]
        nh = [((R * 0.45, R * 0.3), (R * 0.2, R * 0.42)), ((R * 0.6, R * 0.55), (R * 0.82, R * 0.68))]
        w = 2.4 if trang_thai == 1 else 4.2
        def ve(p, q, w):
            (x1, y1), (x2, y2) = p, q
            vx, vy = x2 - x1, y2 - y1
            t = np.clip(((xx - x1) * vx + (yy - y1) * vy) / (vx * vx + vy * vy + 1e-6), 0, 1)
            d = np.hypot(xx - x1 - t * vx, yy - y1 - t * vy)
            return (d < w).astype(float)
        for p, q in zip(pts[:-1], pts[1:]):
            nut = np.maximum(nut, ve(p, q, w))
        if trang_thai >= 2:
            for p, q in nh:
                nut = np.maximum(nut, ve(p, q, w * 0.7))
        nut = thu(nut)
        c = c * (1 - nut[..., None]) + np.array([22, 18, 16.0]) * nut[..., None]
        if trang_thai >= 2:
            me = np.zeros((n, n))
            for (cx, cy) in [(R * 0.5, R * 0.3), (R * 0.56, R * 0.58), (R * 0.46, R * 0.82)]:
                me = np.maximum(me, (((xx - cx) / 9) ** 2 + ((yy - cy) / 5) ** 2 <= 1).astype(float))
            me = thu(me)
            c = c * (1 - me[..., None]) + np.array([150, 132, 104.0]) * me[..., None]
    o = than.copy().astype(np.float64)
    o[..., :3] = np.clip(c, 0, 255)
    return LC.ve_vien(np.round(o).astype(np.uint8), 'R', bo_tron=0, bong=10)


def manh_muc(t, seed=9):
    """4 mảnh của ô tường mục nứt (cắt theo 2 đường lởm chởm dọc + ngang), mỗi mảnh có viền đen quanh → 'muc-manh-1..4'."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:R, 0:R] + 0.5
    cut_x = R * 0.5 + 10 * np.sin(yy[:, 0] * 0.08) + 4 * np.sign(np.sin(yy[:, 0] * 0.31))
    cut_y = R * 0.5 + 9 * np.sin(xx[0] * 0.07 + 1) + 4 * np.sign(np.sin(xx[0] * 0.29))
    left = xx < cut_x[:, None]
    top = yy < cut_y[None, :]
    out = []
    for m in (left & top, ~left & top, left & ~top, ~left & ~top):
        m = nd.binary_erosion(m, iterations=3)
        p = t.copy()
        p[~m] = 0
        p = LC.ve_vien(p, 'LRTB', bo_tron=0, bong=4)
        ys, xs = np.nonzero(p[..., 3] > 0)
        out.append(p[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return out


# ------------------------------------------------------------------ bộ ô
def bo_o(pre='rm'):
    O = {}
    Fr, C = bo_than_rm()
    F = [LC.lam_toi(f, TOI_THAN) for f in Fr]
    F0 = F[0]
    TH = LC.lam_toi(Fr[0], LC.doc_sau())

    def khop(t, ref, canh, b=B_KHOP):
        return thay_le(t, ref, canh, b)

    def tu_than(lo, gt='', nen=F0, **kw):
        return LC.ve_vien(nen, lo, gt, **kw)

    O[f'{pre}-than'] = (F0, {'L': F0, 'R': F0, 'T': F0, 'B': F0}, 'thân rễ mục – lặp liền 2 chiều', 'gen re-muc-gach.png ô 1, làm lặp liền bằng code')
    for i in range(2, 9):
        O[f'{pre}-than-{i}'] = (F[i - 1], {'L': F0, 'R': F0, 'T': F0, 'B': F0}, f'thân – biến thể {i} (ô gen {i}); 4 mép y hệt thân', 'gen (phần giữa ô), mép = ô gốc')

    # mặt trên: mép mục + viền trên (code) – 4 biến thể
    T0 = LC.ve_vien(mep_muc(TH, 0), 'T', bo_tron=0, bong=0)
    O[f'{pre}-tren-giua'] = (T0, {'L': T0, 'R': T0, 'B': F0}, 'mặt trên giữa – mép mục + mốc xanh ngọc (KHÔNG rêu), lặp ngang', 'code trên thân gen')
    for i in (2, 3, 4):
        t = LC.ve_vien(mep_muc(TH, i), 'T', bo_tron=0, bong=0)
        O[f'{pre}-tren-giua-{i}'] = (t, {'L': T0, 'R': T0, 'B': F0}, f'mặt trên giữa – biến thể {i}', 'code')
    WL, WR = tu_than('L'), tu_than('R')
    O[f'{pre}-canh-trai'] = (WL, {'R': F0, 'T': WL, 'B': WL}, 'cạnh trái (tường) – lặp dọc', 'code: thân + viền trái')
    O[f'{pre}-canh-phai'] = (WR, {'L': F0, 'T': WR, 'B': WR}, 'cạnh phải (tường) – lặp dọc', 'code: thân + viền phải')
    DB = tu_than('B')
    O[f'{pre}-day-giua'] = (DB, {'L': DB, 'R': DB, 'T': F0}, 'mặt dưới (trần) – lặp ngang', 'code')
    O[f'{pre}-day-trai'] = (tu_than('LB'), {'R': DB, 'T': WL}, 'góc ngoài dưới trái', 'code')
    O[f'{pre}-day-phai'] = (tu_than('RB'), {'L': DB, 'T': WR}, 'góc ngoài dưới phải', 'code')
    for i in (2, 3, 4):
        Fi = F[i - 1]
        O[f'{pre}-canh-trai-{i}'] = (tu_than('L', nen=Fi), {'R': F0, 'T': WL, 'B': WL}, f'cạnh trái – biến thể {i}', 'thân biến thể + viền')
        O[f'{pre}-canh-phai-{i}'] = (tu_than('R', nen=Fi), {'L': F0, 'T': WR, 'B': WR}, f'cạnh phải – biến thể {i}', 'thân biến thể + viền')
        O[f'{pre}-day-giua-{i}'] = (tu_than('B', nen=Fi), {'L': DB, 'R': DB, 'T': F0}, f'mặt dưới – biến thể {i}', 'thân biến thể + viền')
    CT = tu_than('LR')
    O[f'{pre}-cot-than'] = (CT, {'T': CT, 'B': CT}, 'cột rộng 1 ô – thân, lặp dọc', 'code')
    O[f'{pre}-cot-day'] = (tu_than('LRB'), {'T': CT}, 'cột rộng 1 ô – đáy (cột treo)', 'code')
    for g, mt in (('TL', 'trên-trái'), ('TR', 'trên-phải'), ('BL', 'dưới-trái'), ('BR', 'dưới-phải')):
        O[f'{pre}-goc-trong-{g.lower()}'] = (tu_than('', g), {'L': F0, 'R': F0, 'T': F0, 'B': F0}, f'góc trong (lõm) {mt}', 'code')
    MT = mep_muc(TH, 5)
    TL = LC.ve_vien(MT, 'TL', bo_tron=10, bong=0)
    TR = LC.ve_vien(mep_muc(TH, 6), 'TR', bo_tron=10, bong=0)
    O[f'{pre}-tren-trai'] = (khop(TL, T0, 'phai'), {'R': T0, 'B': WL}, 'góc trên trái (mép trái + mặt mục)', 'code')
    O[f'{pre}-tren-phai'] = (khop(TR, T0, 'trai'), {'L': T0, 'B': WR}, 'góc trên phải', 'code')
    O[f'{pre}-tren-trai-2'] = (khop(LC.ve_vien(mep_muc(TH, 7), 'TL', bo_tron=10, bong=0), T0, 'phai'), {'R': T0, 'B': WL}, 'góc trên trái – biến thể', 'code')
    O[f'{pre}-tren-phai-2'] = (khop(LC.ve_vien(mep_muc(TH, 8), 'TR', bo_tron=10, bong=0), T0, 'trai'), {'L': T0, 'B': WR}, 'góc trên phải – biến thể', 'code')
    O[f'{pre}-cot-tren'] = (LC.ve_vien(mep_muc(TH, 9), 'TLR', bo_tron=10, bong=0), {'B': CT}, 'cột rộng 1 ô – đỉnh', 'code')
    O[f'{pre}-khoi'] = (LC.ve_vien(mep_muc(TH, 10), 'TLRB', bo_tron=10, bong=0), {}, 'khối rời 1 ô (đủ 4 viền)', 'code')
    NG = LC.ve_vien(T0, 'B', bo_tron=0)
    O[f'{pre}-noi-giua'] = (NG, {'L': NG, 'R': NG}, 'gờ nổi cao 1 ô – giữa, lặp ngang', 'code')
    O[f'{pre}-noi-trai'] = (khop(LC.ve_vien(MT, 'TLB', bo_tron=10, bong=0), NG, 'phai'), {'R': NG}, 'gờ nổi – đầu trái', 'code')
    O[f'{pre}-noi-phai'] = (khop(LC.ve_vien(mep_muc(TH, 6), 'TRB', bo_tron=10, bong=0), NG, 'trai'), {'L': NG}, 'gờ nổi – đầu phải', 'code')

    # ván mục một chiều
    VG = van_muc(1)
    O[f'{pre}-van-giua'] = (VG, {'L': VG, 'R': VG}, 'ván mục một chiều – giữa, lặp ngang (KHÔNG viền dọc)', 'code')
    O[f'{pre}-van-trai'] = (khop(van_muc(2, 'L'), VG, 'phai', 30), {'R': VG}, 'ván mục – đầu trái', 'code')
    O[f'{pre}-van-phai'] = (khop(van_muc(3, 'R'), VG, 'trai', 30), {'L': VG}, 'ván mục – đầu phải', 'code')
    O[f'{pre}-van-trai-2'] = (khop(van_muc(4, 'L'), VG, 'phai', 30), {'R': VG}, 'ván mục – đầu trái, biến thể', 'code')
    O[f'{pre}-van-phai-2'] = (khop(van_muc(5, 'R'), VG, 'trai', 30), {'L': VG}, 'ván mục – đầu phải, biến thể', 'code')

    # dốc
    doc = {}
    for k, mt in (('thoai-len-1', 'dốc thoải đi lên – nửa thấp'), ('thoai-len-2', 'dốc thoải đi lên – nửa cao'),
                  ('thoai-xuong-1', 'dốc thoải đi xuống – nửa cao'), ('thoai-xuong-2', 'dốc thoải đi xuống – nửa thấp'),
                  ('len', 'dốc 45° đi lên'), ('xuong', 'dốc 45° đi xuống')):
        t = LC.dung_doc(T0, F0, k)
        s_b = LC.mat_doc(k)
        if s_b[-1] == 0:
            t = khop(t, T0, 'phai')
        if s_b[0] == 0:
            t = khop(t, T0, 'trai')
        doc[k] = (t, mt)
    cap = {'thoai-len-1': ('R', 'thoai-len-2'), 'thoai-len-2': ('L', 'thoai-len-1'),
           'thoai-xuong-1': ('R', 'thoai-xuong-2'), 'thoai-xuong-2': ('L', 'thoai-xuong-1')}
    for k, (t, mt) in doc.items():
        ke = {'B': F0}
        s_b = LC.mat_doc(k)
        if s_b[-1] == 0:
            ke['R'] = T0
        if s_b[0] == 0:
            ke['L'] = T0
        if k in cap:
            ke[cap[k][0]] = doc[cap[k][1]][0]
        O[f'{pre}-doc-{k}'] = (t, ke, mt, 'code: trượt cột ô mặt trên theo mặt dốc')

    # tường mục leo được (TẠM) – 3 trạng thái + mảnh
    M0, M1, M2 = tuong_muc(F[3], 0), tuong_muc(F[3], 1), tuong_muc(F[3], 2)
    O[f'{pre}-muc-lanh'] = (M0, {'L': F0, 'T': M0, 'B': M0}, 'TƯỜNG MỤC leo được – lành (TẠM, dựng từ thân; viền phải; lộ trái thì lật)', 'code TẠM')
    O[f'{pre}-muc-nut'] = (M1, {'L': F0, 'T': M1, 'B': M1}, 'tường mục – nứt (TẠM)', 'code TẠM')
    O[f'{pre}-muc-nut-2'] = (M2, {'L': F0, 'T': M2, 'B': M2}, 'tường mục – nứt rộng, mẻ (TẠM)', 'code TẠM')
    return O, manh_muc(M2), C


def bang_o(tat_ca, ten_tep):
    """Bảng mọi ô có tên (xem-thu) – như bang-o-gach của Làng Chuông."""
    from PIL import ImageDraw
    ten = sorted(tat_ca)
    C, cw, ch = 8, 150, 120
    H = int(np.ceil(len(ten) / C)) * ch
    im = Image.new('RGBA', (C * cw, H), (40, 38, 36, 255))
    d = ImageDraw.Draw(im)
    f = font(11)
    for i, t in enumerate(ten):
        x, y = (i % C) * cw, (i // C) * ch
        o = tat_ca[t]
        oi = Image.fromarray(o)
        im.alpha_composite(oi, (x + (cw - oi.width) // 2, y + 8))
        d.text((x + 4, y + ch - 30), t, fill=(230, 230, 230, 255), font=f)
    luu_png(np.asarray(im), ten_tep)


def chay():
    O, manh, C = bo_o()
    meta, items, tat_ca = {}, [], {}
    for ten, (t, ke, mt, ng) in O.items():
        o = LC.thu_nho(t, ke)
        tat_ca[ten] = o
        luu_png(o, f'{GACH}/o/{ten}.png')
        items.append((ten, o))
        meta[ten] = {'mo_ta': mt, 'nguon': ng, 'canh_ghep': ''.join(sorted(ke.keys()))}
    for i, p in enumerate(manh, 1):
        ten = f'rm-muc-manh-{i}'
        h, w = p.shape[:2]
        o = LC.doi_co(p, max(1, round(w / 3)), max(1, round(h / 3)))
        tat_ca[ten] = o
        luu_png(o, f'{GACH}/o/{ten}.png')
        items.append((ten, o))
        meta[ten] = {'mo_ta': f'mảnh tường mục {i} (rơi khi gãy, TẠM)', 'nguon': 'code TẠM', 'canh_ghep': '', 'co_khac': True}
    at, pos = xep_atlas(items, rong=1024)
    luu_png(at, f'{GACH}/rm-atlas.png')
    for k, v in pos.items():
        meta[k]['khung'] = v
    luu_json({
        'ten': 'Gạch Rễ Mục (rm-*): thân rễ mục, mặt trên mép mục + mốc xanh ngọc (không rêu), ván mục, dốc, tường mục leo được (TẠM)',
        'anh': 'rm-atlas.png',
        'quy_uoc': {
            'o_logic': T_LOGIC, 'boi_so': 2, 'o_anh': T2,
            'khung': '[x, y, rộng, cao] trong atlas (px 2x). Ô gạch đúng 64×64; rm-muc-manh-* là mảnh rời (cỡ khác).',
            'canh_ghep': 'cạnh đã khớp liền với ô kề (L trái, R phải, T trên, B dưới). Cạnh không ghi = cạnh lộ (viền đen) hoặc mép tự do.',
            'mat_tren': 'mép trên ô = mặt đứng (va chạm), viền đen nằm trong ô; mép mục dày 4–7 logic, KHÔNG rêu xanh.',
            'van': 'ván mục một chiều: mặt ván = mép trên ô, dày ~11 logic.',
            'doc': 'dốc thoải 2 ô (nửa thấp + nửa cao), dốc 45° 1 ô.',
            'tuong_muc': 'rm-muc-lanh / rm-muc-nut / rm-muc-nut-2: 3 trạng thái tường mục leo được (TẠM – chờ ảnh gen re-muc-mep.png); '
                         'viền đen ở cạnh PHẢI; tường lộ bên trái → lật ngang khi vẽ. Gãy: vẽ 4 mảnh rm-muc-manh-1..4 rơi, ô trống.',
            'bang_mau_than': [[int(v) for v in c] for c in C],
        },
        'o': meta,
    }, f'{GACH}/rm-atlas.json')
    os.makedirs(XEM, exist_ok=True)
    bang_o(tat_ca, f'{XEM}/bang-o-gach.png')
    print('gạch Rễ Mục:', len(meta), 'ô · atlas', at.shape[1], '×', at.shape[0], '· bảng màu', [list(map(int, c)) for c in C])
    # kiểm nối thân
    for i in range(8):
        f = tat_ca['rm-than' if i == 0 else f'rm-than-{i + 1}'][..., :3].astype(float)
        print(' nối thân', i + 1, TG.kiem_noi(f))
    return tat_ca


if __name__ == '__main__':
    chay()
