#!/usr/bin/env python3
"""Thư viện chung cho 4 quái hướng mới "Cổ tích chuông tàn" (Phu Đèn Lạc, Dơi Rễ, Nấm Thở, Người Gác Câm).

Cùng cách làm đã duyệt ở art/the-gioi-moi/quai-boss/ và art/huong-moi/lam-rig/:
  tách nền trắng → cắt mảnh THEO HÌNH NGUYÊN CON (phần thấy = điểm ảnh nguyên con, phần khuất = lấp) → rig (cây nút,
  điểm neo) → clip (mốc khoá + nội suy Hermite tuần hoàn, lò xo tắt dần cho mảnh phụ) → xuất mảnh 2x + JSON cùng định dạng
  game/runtime/quai-boss/quai-moi-rig.json (QBR.napThem) → ảnh kiểm, GIF.

Quy ước toạ độ: "toạ độ hình" = px của ảnh nguồn (nền trắng) – rig dùng luôn đơn vị này; ty_le = px logic / px nguồn.
Mảnh 2x = 2 px ảnh / 1 px logic. Tư thế khung: [dx, dy, goc, sx, sy, toi, mo, hien] (như QBR).

Cách cắt một mảnh (ham dung_manh):
  * mỗi điểm của hình nguyên con có ĐÚNG MỘT chủ (mảnh trước nhất có đa giác chứa nó; còn lại → mảnh mặc định);
  * mảnh giữ nguyên điểm ảnh của phần nó làm chủ; mép cắt bên trong (không phải mép bóng) có "váy" mờ dần VIỀN px
    lấn sang mảnh phía sau → dáng nghỉ ráp lại TRÙNG ảnh gốc (váy = điểm gốc chồng lên điểm gốc);
  * phần bị mảnh phía trước che (vùng LẤP do đa giác 'lap' khai báo) được lấp bằng màu gần nhất của chính mảnh đó, làm mờ
    và tối đi một chút (chỗ khuất) → khi mảnh trước xoay/dời, không lộ lỗ;
  * mảnh có thể lấy thêm từ BẢNG MẢNH (ảnh rời trong cùng file nguồn) đặt khớp vào hình nguyên con (dò tỉ lệ/góc/dời)
    cho phần khuất lớn (giày dưới vạt áo, ủng dưới váy…).
"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd
from scipy.optimize import minimize
from scipy.spatial import ConvexHull

# ------------------------------------------------------------------ màu hướng mới
def hex3(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255

DAI_AM = [(0, '#0b1416'), (0.2, '#17272C'), (0.42, '#39312E'), (0.62, '#65503C'), (0.82, '#A78046'), (1, '#F2D69A')]
_DX = np.array([p for p, _ in DAI_AM]); _DC = np.stack([hex3(c) for _, c in DAI_AM])
NEN_TOI = (23, 39, 44)          # #17272C – nền sâu (ảnh kiểm / GIF)
RIM = '#F2D69A'


def dai(L):
    return np.stack([np.interp(L, _DX, _DC[:, c]) for c in range(3)], -1)


def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# ------------------------------------------------------------------ 1. tách nền trắng
def tach_nen(path, nguong=18, lo_min=20):
    """Ảnh nguồn nền trắng → (rgb float 0..255 đã khử ám trắng ở mép, alpha 0..1).
    Nền = điểm 'gần trắng' nối với mép ảnh (tô loang) + lỗ trắng kín (≥ lo_min px, rất trắng: lỗ cánh lá, khe giữa tay–thân).
    Mép mềm: alpha = phần trộn với trắng tính theo màu điểm đặc gần nhất (c = α·F + (1−α)·255) → không quầng trắng."""
    a = np.array(Image.open(path).convert('RGB')).astype(np.float32)
    d = 255 - a.min(2)                             # độ 'không trắng'
    sat = a.max(2) - a.min(2)
    gan_trang = (d <= nguong) & (sat < 26)
    lab, n = nd.label(gan_trang)
    vien = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]); vien = vien[vien > 0]
    nen = np.isin(lab, vien)
    sz = nd.sum(gan_trang, lab, range(1, n + 1))
    mn = nd.mean(a.min(2), lab, range(1, n + 1))
    lo = [i + 1 for i in range(n) if (i + 1) not in vien and sz[i] >= lo_min and mn[i] > 236]
    nen |= np.isin(lab, lo)
    fg = ~nen
    # khử ám trắng ở dải mép 3 px
    d_bg = nd.distance_transform_edt(fg)
    dac = fg & (d_bg > 3)
    _, (iy, ix) = nd.distance_transform_edt(~dac, return_indices=True)
    F = a[iy, ix]
    num = ((255 - a) * (255 - F)).sum(-1); den = ((255 - F) ** 2).sum(-1) + 1e-6
    al = np.clip(num / den, 0, 1)
    mep = fg & ~dac
    rgb = a.copy(); rgb[mep] = F[mep]
    alpha = np.where(dac, 1.0, np.where(mep, al, 0.0)).astype(np.float32)
    alpha[alpha > 0.97] = 1; alpha[alpha < 0.04] = 0
    return rgb, alpha


def thanh_phan(alpha, min_px=800):
    """các cụm rời (hình nguyên con, mảnh trong bảng) → list (sz, (x0,y0,x1,y1)) theo cỡ giảm dần"""
    m = nd.binary_closing(alpha > 0.1, iterations=3)
    lab, n = nd.label(m)
    out = []
    for i, s in enumerate(nd.find_objects(lab)):
        z = int((lab[s] == i + 1).sum())
        if z >= min_px:
            out.append((z, (s[1].start, s[0].start, s[1].stop, s[0].stop), i + 1))
    out.sort(key=lambda r: -r[0])
    return out, lab


# ------------------------------------------------------------------ 2. đa giác / mặt nạ
def mat_na(shape, polys):
    """polys: list đa giác [(x,y),...] (toạ độ ảnh nguồn) → mặt nạ bool"""
    im = Image.new('L', (shape[1], shape[0]), 0); g = ImageDraw.Draw(im)
    for p in polys:
        g.polygon([tuple(map(float, q)) for q in p], fill=255)
    return np.array(im) > 127


def dai_bang(p0, p1, rong):
    """đa giác dải thẳng quanh đoạn p0→p1, rộng 'rong' px (cán, trượng)"""
    x0, y0 = p0; x1, y1 = p1; L = math.hypot(x1 - x0, y1 - y0)
    nx, ny = -(y1 - y0) / L * rong / 2, (x1 - x0) / L * rong / 2
    return [(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)]


# ------------------------------------------------------------------ 3. đặt mảnh bảng vào hình nguyên con
def bien_doi(img_rgba, s, goc, tx, ty, lat, out_shape):
    """đặt ảnh RGBA (float) vào khung out_shape: x_out = R(goc)·S(s)·(lat? −x : x) + (tx,ty); trả RGBA float (alpha 0..1)"""
    h, w = img_rgba.shape[:2]
    g = math.radians(goc); c, sn = math.cos(g), math.sin(g)
    A = np.array([[c * s * (-1 if lat else 1), -sn * s, tx], [sn * s * (-1 if lat else 1), c * s, ty], [0, 0, 1]])
    inv = np.linalg.inv(A)
    pre = img_rgba.copy(); pre[..., :3] *= pre[..., 3:4]
    ch = []
    for k in range(4):
        ch.append(nd.affine_transform(pre[..., k], np.array([[inv[1, 1], inv[1, 0]], [inv[0, 1], inv[0, 0]]]),
                                      offset=(inv[1, 2], inv[0, 2]), output_shape=out_shape, order=1, mode='constant', cval=0))
    o = np.stack(ch, -1)
    al = np.clip(o[..., 3], 0, 1)
    o[..., :3] = np.where(al[..., None] > 1e-4, o[..., :3] / np.maximum(al, 1e-4)[..., None], 0)
    o[..., 3] = al
    return o


def do_khop(manh_rgba, rgb, alpha, vung, x0, ten=''):
    """dò (tỉ lệ, góc, tx, ty) để mảnh bảng khớp vùng 'vung' (bool, toạ độ ảnh nguồn) của hình nguyên con.
    Sai số = lệch màu trung bình trên phần trùng + phạt phần vung không được phủ + phạt mảnh lòi ra ngoài bóng hình.
    x0 = (s, goc, tx, ty, lat) đoán ban đầu (đặt tay theo mắt)."""
    lat = x0[4]
    ys, xs = np.nonzero(vung)
    pad = 160
    by0, by1, bx0, bx1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + pad)
    V = vung[by0:by1, bx0:bx1]; A = alpha[by0:by1, bx0:bx1]; C = rgb[by0:by1, bx0:bx1]
    def loi(p):
        s, g, tx, ty = p
        o = bien_doi(manh_rgba, s, g, tx - bx0, ty - by0, lat, V.shape)
        m = o[..., 3]
        tr = V & (m > 0.5)
        if tr.sum() < 50: return 1e3
        mau = np.abs(o[..., :3][tr] - C[tr]).mean() / 255
        thieu = (V & (m < 0.5)).sum() / V.sum()
        loi_ra = ((m > 0.5) & (A < 0.3)).sum() / max(1, (m > 0.5).sum())
        return mau + 0.8 * thieu + 0.6 * loi_ra
    r = minimize(loi, x0[:4], method='Nelder-Mead', options={'xatol': 0.05, 'fatol': 1e-4, 'maxiter': 400,
                                                              'initial_simplex': np.array(x0[:4]) + np.array([[0, 0, 0, 0], [0.04, 0, 0, 0], [0, 3, 0, 0], [0, 0, 6, 0], [0, 0, 0, 6]])})
    print('  khớp mảnh bảng %-10s s=%.3f góc=%.1f t=(%.0f,%.0f) lỗi %.3f → %.3f' % (ten, r.x[0], r.x[1], r.x[2], r.x[3], loi(x0[:4]), r.fun))
    return tuple(r.x) + (lat,)


# ------------------------------------------------------------------ 4. dựng mảnh từ hình nguyên con
def dung_manh(rgb, alpha, hop, specs, mac_dinh, VIEN=5, toi_lap=0.18):
    """hop = (x0,y0,x1,y1) hình nguyên con trong ảnh nguồn.
    specs: list (thứ tự VẼ, sau → trước) dict: ten, da (list đa giác vùng làm chủ), lap (list đa giác vùng khuất cần lấp,
           mặc định không), bang (RGBA float đã đặt khớp vào toạ độ ảnh nguồn – lấp phần khuất bằng mảnh bảng), vien (px váy),
           ngoai (True: cho phép phần lấp/bảng lòi ra ngoài bóng hình).
    Trả dict ten → (rgba float H×W×4 toạ độ hop, mặt nạ chủ) + mảng chủ."""
    x0, y0, x1, y1 = hop
    C = rgb[y0:y1, x0:x1]; A = alpha[y0:y1, x0:x1]
    H, W = A.shape
    fig = A > 0
    chu = np.full((H, W), -1, int)
    ten_ds = [s['ten'] for s in specs]
    idx_md = ten_ds.index(mac_dinh)
    def dich(polys): return [[(px - x0, py - y0) for px, py in p] for p in polys]
    for i, s in enumerate(specs):                       # trước đè sau
        m = mat_na((H, W), dich(s.get('da', []))) & fig
        if s.get('mat') is not None:                    # vùng làm chủ cho bằng mặt nạ (toạ độ ảnh nguồn), vd. mảnh bảng đã đặt khớp
            m |= s['mat'][y0:y1, x0:x1] & fig
        if s.get('tru') is not None:
            m &= ~mat_na((H, W), dich(s['tru']))
        chu[m] = i
    chu[(chu < 0) & fig] = idx_md
    out = {}
    for i, s in enumerate(specs):
        rieng = chu == i
        rg = np.zeros((H, W, 4), np.float32)
        if not rieng.any() and s.get('bang') is None:
            raise ValueError('mảnh %s rỗng' % s['ten'])
        # màu: điểm gốc ở phần làm chủ; ngoài ra lấy màu gần nhất của chính mảnh (để lấp)
        if rieng.any():
            _, (iy, ix) = nd.distance_transform_edt(~rieng, return_indices=True)
            gan = C[iy, ix]
            mo = np.stack([nd.gaussian_filter(gan[..., k], 6.0) for k in range(3)], -1)
        else:
            gan = mo = np.zeros_like(C)
        al = np.where(rieng, A, 0).astype(np.float32)
        col = np.where(rieng[..., None], C, mo * (1 - toi_lap))
        # váy: mờ dần VIEN px sang các mảnh vẽ PHÍA SAU (dáng nghỉ vẫn trùng gốc)
        vien = s.get('vien', VIEN)
        vay = np.zeros((H, W), bool)
        if vien > 0 and rieng.any():
            d = nd.distance_transform_edt(~rieng)
            sau = (chu >= 0) & (chu < i)
            vay = sau & (d <= vien)
            k = np.clip(1 - (d - 0.5) / vien, 0, 1) * A
            al = np.where(vay, np.maximum(al, k), al)
            col = np.where(vay[..., None], C, col)
        # vùng lấp (khuất dưới mảnh trước): màu gần nhất của chính mảnh, mờ, tối hơn một chút
        if s.get('lap'):
            L = mat_na((H, W), dich(s['lap']))
            if not s.get('ngoai'): L &= fig
            moi = L & ~rieng & ~vay & ((chu > i) | ~fig)      # chỉ phần bị mảnh PHÍA TRƯỚC che (hoặc ngoài bóng nếu 'ngoai')
            al = np.where(moi, np.where(fig, A, 1.0), al)
            col = np.where(moi[..., None], mo * (1 - toi_lap), col)
        # mảnh bảng (đã đặt khớp) lấp phần khuất
        b = s.get('bang')
        if b is not None:
            bb = b[y0:y1, x0:x1]
            ba = bb[..., 3]
            if not s.get('ngoai'): ba = np.where(fig, ba, 0)
            moi = (ba > al)
            col = np.where(moi[..., None] & ~rieng[..., None], bb[..., :3], col)
            al = np.maximum(al, np.where(rieng, al, ba))
        rg[..., :3] = col; rg[..., 3] = al
        rg[al <= 0] = 0
        out[s['ten']] = rg
    return out, chu


def ghep(manh_ds, thu_tu, nen=None):
    """chồng các mảnh RGBA float (cùng khung) theo thứ tự vẽ → RGBA float"""
    H, W = manh_ds[thu_tu[0]].shape[:2]
    o = np.zeros((H, W, 4), np.float32)
    if nen is not None: o[..., :3] = nen; o[..., 3] = 1
    for t in thu_tu:
        m = manh_ds[t]; a = m[..., 3:4]
        o[..., :3] = m[..., :3] * a + o[..., :3] * (1 - a)
        o[..., 3:4] = a + o[..., 3:4] * (1 - a)
    return o


def iou(a, b, nguong=0.5):
    A = a > nguong; B = b > nguong
    return float((A & B).sum() / max(1, (A | B).sum()))


# ------------------------------------------------------------------ 5. tô màu + vệt sáng mép
def rgb_hsv(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]; mx = c.max(-1); mn = c.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0); return h, s, mx


def to_mau(rgb01, tron=0.22, tp=1.06, sang=0.92, bao_hoa=0.9, giu=None):
    """tô màu hướng mới NHẸ (ảnh gốc đã trầm): trộn 'tron' với dải màu ấm theo độ sáng, giữ tương phản tp, nhân sáng.
    giu: mặt nạ điểm giữ nguyên màu gốc (lõi đèn, mắt, khe teal) – điểm nhấn có ý nghĩa."""
    h, s, v = rgb_hsv(rgb01)
    L = rgb01 @ np.array([0.299, 0.587, 0.114], np.float32)
    Lm = 0.42 + (L - 0.42) * tp
    xam = L[..., None]
    c = xam + (rgb01 - xam) * bao_hoa
    o = c * (1 - tron) + dai(np.clip(Lm * 1.02, 0, 1)) * tron
    o = np.clip(o * sang, 0, 1)
    if giu is not None:
        o = np.where(giu[..., None], rgb01, o)
    return o


def vet_sang(rgba, bong, huong=(-0.45, -1.0), day=4.0, manh=0.6, deu=0.22, day_deu=2.0):
    """vệt sáng mép vẽ sẵn (#F2D69A): phía 'huong' (trên, chếch trước – quái quay trái) mạnh 'manh', dày 'day' px;
    toàn mép bóng một đường rất mảnh 'deu' (để không chìm nền tối). CHỈ ở mép BÓNG cả con lúc nghỉ ('bong' bool,
    cùng khung) – không viền đường ráp bên trong. rgba float (alpha 0..1), cùng khung với bong."""
    al = rgba[..., 3]
    ngoai = ~bong
    hx, hy = huong; n = math.hypot(hx, hy); hx /= n; hy /= n
    acc = np.zeros(al.shape, np.float32)
    kmax = int(math.ceil(day))
    for k in range(1, kmax + 1):
        dx, dy = int(round(hx * k)), int(round(hy * k))
        if dx == 0 and dy == 0: continue
        sh = np.zeros_like(ngoai)
        ys0, ys1 = max(0, -dy), min(al.shape[0], al.shape[0] - dy)
        xs0, xs1 = max(0, -dx), min(al.shape[1], al.shape[1] - dx)
        sh[ys0:ys1, xs0:xs1] = ngoai[ys0 + dy:ys1 + dy, xs0 + dx:xs1 + dx]
        acc = np.maximum(acc, (bong & sh) * (1 - (k - 1) / day))
    d = nd.distance_transform_edt(bong)
    deu_m = np.clip(1 - (d - 0.5) / day_deu, 0, 1) * bong
    k = np.clip(nd.gaussian_filter(acc, max(0.6, day / 6)) * manh + deu_m * deu, 0, 0.85) * (al > 0)
    o = rgba.copy()
    o[..., :3] = o[..., :3] * (1 - k[..., None]) + hex3(RIM) * k[..., None]
    return o


# ------------------------------------------------------------------ 6. RIG (cùng ma trận với QBR.ve)
NC = 8
def ma_tran(goc, sx, sy, tx, ty):
    g = math.radians(goc); c, s = math.cos(g), math.sin(g)
    return np.array([[c * sx, -s * sy, tx], [s * sx, c * sy, ty], [0, 0, 1]])


class Rig:
    """nut: list (ten, cha, vi_tri_neo (toạ độ ảnh nguồn), manh|None, hien). Mảnh đặt theo toạ độ ảnh nguồn lúc nghỉ."""
    def __init__(self, nut, thu_tu_ve, ty, goc_xy):
        self.nut = nut; self.ds = [n[0] for n in nut]; self.idx = {n: i for i, n in enumerate(self.ds)}
        self.cha = {n[0]: n[1] for n in nut}; self.vt = {n[0]: n[2] for n in nut}; self.manh = {n[0]: n[3] for n in nut}
        self.hien = {n[0]: n[4] for n in nut}
        self.thu_tu = thu_tu_ve; self.ty = ty; self.goc_xy = goc_xy
        for n in self.ds:
            c = self.cha[n]
            assert c is None or self.idx[c] < self.idx[n], 'nút cha phải đứng trước ' + n

    def tu_the(self):
        return {n: [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1 if self.hien[n] else 0] for n in self.ds}

    def gan(self, n):
        c = self.cha[n]
        if c is None: return (0.0, 0.0)
        return (self.vt[n][0] - self.vt[c][0], self.vt[n][1] - self.vt[c][1])

    def the_gioi(self, P):
        """ma trận nút → toạ độ rig (gốc = điểm neo trên mặt đất)"""
        M = {}
        for n in self.ds:
            p = P[n]; gx, gy = self.gan(n)
            L = ma_tran(p[2], p[3], p[4], gx + p[0], gy + p[1])
            M[n] = L if self.cha[n] is None else M[self.cha[n]] @ L
        return M


def cong(P, n, dx=0, dy=0, goc=0, sx=1, sy=1, toi=None, mo=None, hien=None):
    p = P[n]; p[0] += dx; p[1] += dy; p[2] += goc; p[3] *= sx; p[4] *= sy
    if toi is not None: p[5] = max(p[5], toi)
    if mo is not None: p[6] = mo
    if hien is not None: p[7] = 1 if hien else 0


# ------------------------------------------------------------------ 7. nội suy
class Kenh:
    """Hermite bậc 3 TUẦN HOÀN qua các mốc (t, giá trị[, tiếp tuyến]) – tiếp tuyến tự động kiểu Fritsch–Butland
    (mốc cực trị → 0, không vượt biên). Chép từ art/the-gioi-moi/quai-boss/code/noi_suy.py (pipeline đã duyệt)."""
    def __init__(self, moc, chu_ky=1.0):
        self.T = float(chu_ky)
        moc = sorted([(float(m[0]) % self.T, float(m[1]), (m[2] if len(m) > 2 else None)) for m in moc])
        self.t = np.array([m[0] for m in moc]); self.v = np.array([m[1] for m in moc])
        n = len(moc); m = np.zeros(n)
        for i in range(n):
            if moc[i][2] is not None: m[i] = moc[i][2]; continue
            ip, inx = (i - 1) % n, (i + 1) % n
            h0 = (self.t[i] - self.t[ip]) % self.T or self.T; h1 = (self.t[inx] - self.t[i]) % self.T or self.T
            d0 = (self.v[i] - self.v[ip]) / h0; d1 = (self.v[inx] - self.v[i]) / h1
            m[i] = 0.0 if d0 * d1 <= 0 else 3 * (h0 + h1) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1)
        self.m = m

    def __call__(self, t):
        t = float(t) % self.T
        i = int(np.searchsorted(self.t, t, side='right') - 1)
        if i < 0: i = len(self.t) - 1
        j = (i + 1) % len(self.t)
        h = (self.t[j] - self.t[i]) % self.T or self.T
        s = ((t - self.t[i]) % self.T) / h
        return ((2 * s ** 3 - 3 * s ** 2 + 1) * self.v[i] + (s ** 3 - 2 * s ** 2 + s) * h * self.m[i]
                + (-2 * s ** 3 + 3 * s ** 2) * self.v[j] + (s ** 3 - s ** 2) * h * self.m[j])


def lo_xo_theo(tin_hieu, t, f=2.0, tat=4.0, chu_ky=None, buoc=1 / 240):
    """phản hồi lò xo tắt dần (mảnh phụ đi theo trễ nhịp): x'' = −ω²(x − u) − 2ζω x'. Với clip lặp chạy 3 vòng cho ổn
    định rồi lấy vòng cuối → nối vòng liền."""
    w = 2 * math.pi * f; z = tat / w
    T = chu_ky or t
    n0 = int(round((3 * T if chu_ky else 0) / buoc))
    n1 = int(round(((3 * T if chu_ky else 0) + (t % T if chu_ky else t)) / buoc))
    x = tin_hieu(0.0); v = 0.0
    for k in range(n1):
        u = tin_hieu(k * buoc)
        a = -w * w * (x - u) - 2 * z * w * v
        v += a * buoc; x += v * buoc
    return x


# ------------------------------------------------------------------ 8. xuất mảnh 2x + JSON (định dạng QBR)
PAD = 2
def xuat_manh(rgba_hinh, hop_hinh, ty, duong_dan, tomau=None):
    """rgba float (khung hình nguyên con) → cắt sát, thu về 2 px/px logic (LANCZOS trên màu nhân alpha), lưu PNG.
    Trả (tl_nguon (x,y góc trái-trên trong ảnh nguồn), co_nguon (w,h), co_anh (w,h), hull (toạ độ nguồn, so với tl))."""
    al = rgba_hinh[..., 3]
    ys, xs = np.nonzero(al > 0.004)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    c = rgba_hinh[y0:y1, x0:x1].copy()
    F = 2 * ty
    w, h = max(1, round((x1 - x0) * F)), max(1, round((y1 - y0) * F))
    pre = np.dstack([c[..., :3] * c[..., 3:4], c[..., 3:4]]) * 255
    chs = [np.array(Image.fromarray(pre[..., k].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)) for k in range(4)]
    o = np.stack(chs, -1); a = np.clip(o[..., 3], 0, 255)
    rgb = np.where(a[..., None] > 0.5, o[..., :3] / np.maximum(a, 1e-3)[..., None] * 255, 0)
    out = np.zeros((h + 2 * PAD, w + 2 * PAD, 4), np.uint8)
    out[PAD:PAD + h, PAD:PAD + w, :3] = np.clip(rgb, 0, 255).round()
    out[PAD:PAD + h, PAD:PAD + w, 3] = a.round()
    out[out[..., 3] == 0] = 0
    os.makedirs(os.path.dirname(duong_dan), exist_ok=True)
    Image.fromarray(out, 'RGBA').save(duong_dan, optimize=True)
    m = c[..., 3] > 0.13
    yy, xx = np.nonzero(m)
    pts = np.concatenate([np.stack([xx, yy], 1), np.stack([xx + 1, yy + 1], 1)]).astype(float)
    hull = pts[ConvexHull(pts).vertices]
    if len(hull) > 40: hull = hull[np.linspace(0, len(hull) - 1, 40).astype(int)]
    kx, ky = (x1 - x0) / w, (y1 - y0) / h
    tl = (hop_hinh[0] + x0 - PAD * kx, hop_hinh[1] + y0 - PAD * ky)
    return {'tl': tl, 'co': ((w + 2 * PAD) * kx, (h + 2 * PAD) * ky), 'co_anh': (w + 2 * PAD, h + 2 * PAD),
            'hull': [(x + PAD * kx, y + PAD * ky) for x, y in hull],
            'hop_dac': (PAD * kx, PAD * ky, PAD * kx + (x1 - x0), PAD * ky + (y1 - y0))}


def rig_json(rig, thong_tin_manh, clips, ten_vn, khoa, them=None):
    R = {}
    for n in rig.ds:
        gx, gy = rig.gan(n)
        r = {'cha': rig.cha[n], 'gan': [round(gx, 2), round(gy, 2)], 'goc_nghi': 0.0}
        m = rig.manh[n]
        if m:
            t = thong_tin_manh[m]
            px, py = rig.vt[n][0] - t['tl'][0], rig.vt[n][1] - t['tl'][1]
            r.update({'anh': 'manh/' + m + '.png', 'co_anh': list(t['co_anh']), 'pivot': [round(px, 2), round(py, 2)],
                      'co': [round(t['co'][0], 3), round(t['co'][1], 3)], 'hop_dac': [round(v, 2) for v in t['hop_dac']],
                      'vien': [[round(x, 1), round(y, 1)] for x, y in t['hull']], 'hien': bool(rig.hien[n])})
        R[n] = r
    nv = {'ten': ten_vn, 'ty_le': rig.ty, 'nut_ds': rig.ds, 'nut': R, 'thu_tu_ve': rig.thu_tu, 'clip': clips,
          'huong': 'quay trái; quay phải = lật ngang quanh điểm neo'}
    if them: nv.update(them)
    return {'phien_ban': 1, 'px_anh_moi_px_logic': 2.0, 'nv': {khoa: nv}}


BUOC_MS = 1000 / 30
def nuong_clip(rig, ten_vn, ms, lap, fn, buoc=BUOC_MS, them=None):
    """tính sẵn khung khoá mỗi 33,3 ms (runtime nội suy tuyến tính giữa hai khung)"""
    n = int(round(ms / buoc)) if lap else int(round(ms / buoc)) + 1
    kh = []
    for i in range(n):
        t = i * buoc / 1000.0; P = rig.tu_the(); fn(P, t)
        kh.append([[round(v, 3) if j < 7 else int(v) for j, v in enumerate(P[nn])] for nn in rig.ds])
    c = {'ten': ten_vn, 'ms': round(n * buoc if lap else (n - 1) * buoc, 3), 'buoc_ms': round(buoc, 4), 'lap': lap,
         'giu_khung_cuoi': not lap, 'pha': None, 'khung_cham': [], 'cua_so_cham_ms': None, 'hop_don': None, 'su_kien': None, 'khung': kh}
    if them: c.update(them)
    return c


# ------------------------------------------------------------------ 9. VẼ (Python, cùng ma trận với QBR.ve) – ảnh kiểm, GIF
class Ve:
    """vẽ tư thế từ ảnh mảnh. k = px màn / px logic. Ảnh mảnh được thu trước về đúng cỡ màn (LANCZOS, có cache) rồi
    mới xoay → không răng cưa, không phóng nearest."""
    def __init__(self, rig, anh_manh, thong_tin):
        self.rig = rig; self.anh = anh_manh; self.tt = thong_tin; self.cache = {}

    def _anh(self, m, k):
        key = (m, round(k, 5))
        if key not in self.cache:
            im = self.anh[m]; t = self.tt[m]
            f = k * self.rig.ty * t['co'][0] / im.width          # px màn / px ảnh
            w, h = max(1, round(im.width * f)), max(1, round(im.height * f))
            a = np.array(im).astype(np.float32) / 255
            pre = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3:4]])
            chs = [np.array(Image.fromarray(pre[..., c], 'F').resize((w, h), Image.LANCZOS)) for c in range(4)]
            self.cache[key] = (np.clip(np.stack(chs, -1), 0, 1), im.width / w * t['co'][0] / im.width, im.height / h * t['co'][1] / im.height)
        return self.cache[key]

    def ve(self, P, k, co, neo, nen=NEN_TOI, lat=False, anh_nen=None):
        Wc, Hc = co
        o = np.zeros((Hc, Wc, 4), np.float32)
        if anh_nen is not None:
            o[..., :3] = anh_nen[..., :3]; o[..., 3] = 1
        elif nen is not None:
            o[..., :3] = np.array(nen, np.float32) / 255; o[..., 3] = 1
        M = self.rig.the_gioi(P)
        S = np.array([[(-1 if lat else 1) * self.rig.ty * k, 0, neo[0]], [0, self.rig.ty * k, neo[1]], [0, 0, 1]])
        for n in self.rig.thu_tu:
            m = self.rig.manh[n]; p = P[n]
            if not m or not p[7] or p[6] <= 0: continue
            img, ux, uy = self._anh(m, k)
            px, py = self.rig.vt[n][0] - self.tt[m]['tl'][0], self.rig.vt[n][1] - self.tt[m]['tl'][1]
            T = S @ M[n] @ np.array([[ux, 0, -px], [0, uy, -py], [0, 0, 1]])
            inv = np.linalg.inv(T)
            # bao của mảnh trên màn
            hh, ww = img.shape[:2]
            gocs = T @ np.array([[0, ww, 0, ww], [0, 0, hh, hh], [1, 1, 1, 1]])
            bx0, bx1 = int(max(0, math.floor(gocs[0].min()) - 1)), int(min(Wc, math.ceil(gocs[0].max()) + 1))
            by0, by1 = int(max(0, math.floor(gocs[1].min()) - 1)), int(min(Hc, math.ceil(gocs[1].max()) + 1))
            if bx1 <= bx0 or by1 <= by0: continue
            yy, xx = np.mgrid[by0:by1, bx0:bx1].astype(np.float32)
            xx += 0.5; yy += 0.5
            u = inv[0, 0] * xx + inv[0, 1] * yy + inv[0, 2] - 0.5
            v = inv[1, 0] * xx + inv[1, 1] * yy + inv[1, 2] - 0.5
            lop = np.stack([nd.map_coordinates(img[..., c], [v, u], order=1, mode='constant', cval=0) for c in range(4)], -1)
            if p[5] > 0:
                lop[..., :3] = lop[..., :3] * (1 - p[5]) + np.array([12, 15, 20], np.float32) / 255 * p[5] * lop[..., 3:4]
            a = lop[..., 3:4] * p[6]
            lop = lop * p[6]
            vung = o[by0:by1, bx0:bx1]
            vung[..., :3] = lop[..., :3] + vung[..., :3] * (1 - a)
            vung[..., 3:4] = a + vung[..., 3:4] * (1 - a)
        return o


def sang_anh(o):
    """RGBA float (màu đã nhân alpha khi có nền) → PIL RGB"""
    return Image.fromarray((np.clip(o[..., :3], 0, 1) * 255).round().astype(np.uint8), 'RGB')


def luu_gif(khung, ms, duong_dan):
    """khung: list PIL RGB; ms mỗi khung (GIF làm tròn 10 ms → dồn sai số để tổng thời gian đúng).
    MỘT bảng màu chung (lấy từ ghép nhiều khung) → GIF nén được phần không đổi giữa các khung."""
    mau = [khung[i] for i in np.linspace(0, len(khung) - 1, min(8, len(khung))).astype(int)]
    w, h = mau[0].size
    ghep_ = Image.new('RGB', (w, h * len(mau)))
    for i, k in enumerate(mau): ghep_.paste(k, (0, h * i))
    bang = ghep_.quantize(colors=255, method=Image.MEDIANCUT, dither=Image.NONE)
    pal = [k.quantize(palette=bang, dither=Image.NONE) for k in khung]
    ds = []; du = 0.0
    for _ in khung:
        x = ms + du; r = max(20, int(round(x / 10)) * 10); du = x - r; ds.append(r)
    pal[0].save(duong_dan, save_all=True, append_images=pal[1:], duration=ds, loop=0, optimize=True)
