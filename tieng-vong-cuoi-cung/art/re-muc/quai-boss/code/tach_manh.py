"""Bước 1 – tách mảnh bằng code từ ảnh nguồn (KHÔNG gen ảnh) cho Nấm Mốc, Dơi Chuông, Mẹ Nấm Mốc.

Mỗi ảnh nguồn có BẢN NGUYÊN (bên trái / trên) và MẢNH RỜI vẽ lại (bên phải / dưới). Mảnh rời vẽ lại hơi khác dáng và
khác cỡ so với bản nguyên, nên KHÔNG dùng thẳng: mọi mảnh được CẮT TỪ BẢN NGUYÊN (để dáng nghỉ ráp lại trùng ảnh
nguồn), mảnh rời chỉ dùng để BÙ PHẦN KHUẤT (chỗ bị mảnh khác che, chỉ lộ ra khi mảnh cử động):
  1. Nền trắng nối mép = trong suốt; khử viền trắng (như rig-v2).
  2. Chia bản nguyên thành mảnh: vùng liền (nắm tay, chân, cánh, vuốt rời sẵn) + đường cắt / đa giác đặt tay (toạ độ ảnh
     nguồn, đo trên ảnh có lưới) ở chỗ các mảnh dính nhau (mũ–thân, chuông–mũ, quả lắc–chuông, thân–gò rễ, túi–thân).
  3. Bù phần khuất:
     - "dang_ky": căn mảnh rời lên bản nguyên (tìm tỉ lệ + góc + dịch sao cho bóng mảnh rời phủ đúng phần mảnh đang thấy
       mà không lấn ra nền – tương quan FFT, thô rồi tinh), rồi lấy điểm ảnh của mảnh rời CHỈ ở chỗ bị mảnh vẽ đè lên che
       (ví dụ đỉnh thân dưới mũ nấm, phần túi bào tử sau thân). Ở dáng nghỉ phần bù luôn bị che → ráp lại vẫn trùng nguồn.
     - "va": chỗ khuất nhỏ (mũ dưới chuông, lòng chuông sau cuống quả lắc) → vá bằng inpaint (Telea, OpenCV).
  4. LẬT NGANG mọi mảnh: ảnh nguồn nhìn PHẢI, quy ước game (giống quái chuông gỗ / boss cũ) là nhân vật quay TRÁI,
     quay phải = lật quanh điểm neo. Toạ độ sau lật: x' = W − x.
Kết quả: manh/<nv>/*.png (RGBA cỡ gốc, cắt sát) + manh/<nv>/tach.json (vị trí trên ảnh nguồn ĐÃ LẬT, cách bù)."""
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.signal import fftconvolve
import cv2
from chung import (SRC, SRC_BAO_TU, manh_dir, load_rgb, background, unmix_white, components, save_json)


# ---------------------------------------------------------------------------------------------- công cụ
def da_giac(shape, pts):
    im = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([tuple(p) for p in pts], fill=1)
    return np.array(im).astype(bool)


def tren_duong(shape, pts):
    """mặt nạ các điểm NẰM TRÊN đường gấp khúc pts (x tăng dần): y < f(x); ngoài khoảng x của pts giữ y đầu/cuối."""
    xs = np.array([p[0] for p in pts], float)
    ys = np.array([p[1] for p in pts], float)
    f = np.interp(np.arange(shape[1]), xs, ys)
    return np.arange(shape[0])[:, None] < f[None, :]


def tron(shape, cx, cy, r):
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    return (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r


def bao_loi(m):
    ys, xs = np.nonzero(m)
    pts = np.stack([xs, ys], 1).astype(np.int32)
    hull = cv2.convexHull(pts)
    out = np.zeros(m.shape, np.uint8)
    cv2.fillConvexPoly(out, hull, 1)
    return out.astype(bool)


def warp_affine(img, A, shape, nearest=False):
    """A: 2×3 (toạ độ mảnh rời → toạ độ bản nguyên)."""
    return cv2.warpAffine(img, A, (shape[1], shape[0]), flags=cv2.INTER_NEAREST if nearest else cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def ma_tran(s, deg, cx, cy, tx, ty):
    """co s, xoay deg quanh (cx, cy) của mảnh rời, rồi dịch để (cx, cy) tới (tx, ty)."""
    t = np.deg2rad(deg)
    c, si = np.cos(t) * s, np.sin(t) * s
    return np.array([[c, -si, tx - (c * cx - si * cy)], [si, c, ty - (si * cx + c * cy)]], np.float64)


def dang_ky(rgba_sep, thay, nen, s_ds=np.linspace(0.7, 1.45, 31), g_ds=np.arange(-12, 12.1, 2.0), ds=4):
    """Căn mảnh rời (rgba_sep, toạ độ riêng) lên bản nguyên: điểm = 2·|phủ phần đang thấy| − |lấn ra nền|.
    thay = mặt nạ phần mảnh đang thấy trên bản nguyên; nen = mặt nạ nền. Trả (A 2×3, điểm, s, góc)."""
    T = (rgba_sep[..., 3] > 128).astype(np.float32)
    H, W = thay.shape
    Wt = 2.0 * thay.astype(np.float32) - 1.0 * nen.astype(np.float32)
    cy, cx = [float(v) for v in nd.center_of_mass(T)]

    def thu(s, g, d, cua=None):
        """cua = (x0, y0, x1, y1): chỉ tìm trong cửa sổ này (bước tinh)"""
        x0, y0, x1, y1 = cua or (0, 0, W, H)
        Wc = Wt[y0:y1, x0:x1]
        Wd = cv2.resize(Wc, (Wc.shape[1] // d, Wc.shape[0] // d), interpolation=cv2.INTER_AREA) if d > 1 else Wc
        R = int(np.ceil(np.hypot(*T.shape) * s / 2 / d)) + 2
        A = ma_tran(s / d, g, cx, cy, R, R)
        Tk = cv2.warpAffine(T, A, (2 * R + 1, 2 * R + 1), flags=cv2.INTER_LINEAR)
        cor = fftconvolve(Wd, Tk[::-1, ::-1], mode='same')
        iy, ix = np.unravel_index(int(np.argmax(cor)), cor.shape)
        return float(cor[iy, ix]) * d * d, (x0 + ix * d + (d - 1) / 2.0, y0 + iy * d + (d - 1) / 2.0)
    best = None
    for s in s_ds:
        for g in g_ds:
            sc, (tx, ty) = thu(s, g, ds)
            if best is None or sc > best[0]:
                best = (sc, s, g, tx, ty)
    _, s0, g0, tx0, ty0 = best
    R0 = int(np.hypot(*T.shape) * (s0 + 0.05) / 2) + 40
    cua = (max(0, int(tx0) - R0), max(0, int(ty0) - R0), min(W, int(tx0) + R0), min(H, int(ty0) + R0))
    best = None
    for s in np.arange(s0 - 0.03, s0 + 0.031, 0.006):
        for g in np.arange(g0 - 2, g0 + 2.01, 0.5):
            sc, (tx, ty) = thu(s, g, 1, cua)
            if best is None or sc > best[0]:
                best = (sc, s, g, tx, ty)
    sc, s, g, tx, ty = best
    return ma_tran(s, g, cx, cy, tx, ty), sc, float(s), float(g)


def bu_dang_ky(rgba, so_huu, che, rgba_sep, nen, ten, ghi, **kw):
    """mảnh = điểm ảnh bản nguyên thuộc so_huu; chỗ bị 'che' (mảnh vẽ đè) mà mảnh rời căn khớp phủ tới → lấy từ mảnh rời."""
    A, sc, s, g = dang_ky(rgba_sep, so_huu, nen, **kw)
    pm = rgba_sep.astype(np.float32)
    pm[..., :3] *= pm[..., 3:4] / 255.0
    w = warp_affine(pm, A, so_huu.shape)
    al = w[..., 3]
    bu = che & ~so_huu & (al > 8)
    bu &= nd.binary_dilation(nd.binary_opening(bu, iterations=5), iterations=1)   # bỏ gai mảnh ở mép phần bù
    out = rgba.copy()
    out[~so_huu] = 0
    rgb = np.where(al[..., None] > 0, w[..., :3] / np.maximum(al[..., None], 1e-3) * 255.0, 0)
    out[bu, :3] = rgb[bu].round().clip(0, 255).astype(np.uint8)
    out[bu, 3] = al[bu].round().clip(0, 255).astype(np.uint8)
    phu = (al > 128) & so_huu
    ghi[ten] = {'cach': 'mảnh rời căn khớp (dang_ky)', 'ty_le': round(s, 4), 'goc': round(g, 2),
                'phu_phan_dang_thay': round(float(phu.sum() / max(so_huu.sum(), 1)), 4),
                'lan_ra_nen_px': int(((al > 128) & nen).sum()), 'so_px_bu': int(bu.sum())}
    return out, bu


def va(rgba, so_huu, vung, ten, ghi, r=6, vien=13, doi=()):
    """vá vùng 'vung' (khuất) bằng inpaint Telea CHỈ từ điểm ảnh đặc của chính mảnh; alpha = 255 trong vùng vá.
    Dải sát mép ngoài vùng vá (≤ vien px tới chỗ trống) tô màu nét viền tối → mép vá có nét đen như phần còn lại."""
    out = rgba.copy()
    out[~so_huu] = 0
    vung = vung & ~so_huu
    if not vung.any():
        return out, vung
    dac = so_huu & (out[..., 3] >= 250)
    gan = nd.binary_dilation(vung, iterations=r + 4)
    m = (gan & ~dac).astype(np.uint8) * 255                     # chưa biết = mọi điểm quanh vùng vá không thuộc phần đặc
    bgr = np.ascontiguousarray(out[..., :3][..., ::-1])
    fix = cv2.inpaint(bgr, m, r, cv2.INPAINT_TELEA)[..., ::-1]
    out[vung, :3] = fix[vung]
    out[vung, 3] = 255
    # chép vân từ chỗ khác của chính mảnh (dịch (dx, dy)) cho vùng vá lớn – đỡ vệt kéo dài của inpaint
    con = vung.copy()
    H, W = vung.shape
    for dx, dy in doi:
        ys, xs = np.nonzero(con)
        sy, sx = ys + dy, xs + dx
        ok = (sy >= 0) & (sy < H) & (sx >= 0) & (sx < W)
        ok[ok] &= dac[sy[ok], sx[ok]]
        out[ys[ok], xs[ok], :3] = rgba[sy[ok], sx[ok], :3]
        con[ys[ok], xs[ok]] = False
    if doi:
        # làm mềm ranh giữa các mảng chép (trung bình 5×5 chỉ trong vùng vá)
        bl = cv2.blur(out[..., :3].astype(np.float32), (5, 5))
        rim = vung & nd.binary_dilation(vung ^ nd.binary_erosion(vung, iterations=3), iterations=2)
        out[rim, :3] = bl[rim].round().astype(np.uint8)
    ngoai = ~(so_huu | vung)
    d = nd.distance_transform_edt(~ngoai)
    vien_m = vung & (d <= vien)
    mau_vien = np.median(rgba[so_huu & (rgba[..., :3].max(-1) < 40)][:, :3], axis=0) if (so_huu & (rgba[..., :3].max(-1) < 40)).any() else np.array([14, 14, 16])
    out[vien_m, :3] = mau_vien.astype(np.uint8)
    ghi[ten] = {'cach': ('chép vân dịch ' + str(list(doi)) + ' + ' if doi else '') + 'inpaint Telea + nét viền tối ở mép vá',
                'so_px_bu': int(vung.sum())}
    return out, vung


def cat_luu(rgba, path, lat_w, pad=4):
    """cắt sát + LẬT NGANG, lưu. Trả hộp [x0, y0, w, h] trên ảnh nguồn đã lật (x' = W − x)."""
    a = rgba.copy()
    m = a[..., 3] > 0
    giu = m & nd.binary_dilation(nd.binary_opening(m, iterations=3), iterations=4)   # bỏ gai/vụn mảnh < 6 px ở mép cắt
    a[~giu] = 0
    ys, xs = np.nonzero(a[..., 3] > 0)
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + 1 + pad, a.shape[1]), min(ys.max() + 1 + pad, a.shape[0])
    c = a[y0:y1, x0:x1][:, ::-1]
    Image.fromarray(np.ascontiguousarray(c), 'RGBA').save(path)
    return [int(lat_w - x1), int(y0), int(x1 - x0), int(y1 - y0)]


def nap(nv):
    a = load_rgb(SRC[nv])
    bg, _ = background(a)
    fg = ~bg
    return a, fg, unmix_white(a, fg)


def comp_tai(fg, x, y):
    lab, _ = nd.label(fg)
    return lab == lab[y, x]


def luu_tat_ca(nv, pieces, ghi_bu, them=None):
    """pieces: {tên: rgba cỡ ảnh nguồn}. Lưu + tach.json."""
    out = manh_dir(nv)
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.png'):
            os.remove(os.path.join(out, f))
    W = next(iter(pieces.values())).shape[1]
    info = {k: cat_luu(v, os.path.join(out, k + '.png'), W) for k, v in pieces.items()}
    meta = {'nguon': os.path.basename(SRC[nv]), 'lat_ngang': True, 'rong_nguon': W,
            'ghi_chu': 'toạ độ trên ảnh nguồn ĐÃ LẬT NGANG (x\' = W − x); mảnh cắt từ bản nguyên, phần khuất bù theo "bu"',
            'manh': {k: {'anh': f'manh/{nv}/{k}.png', 'hop_tren_nguon': v} for k, v in info.items()}, 'bu': ghi_bu}
    if them:
        meta.update(them)
    save_json(meta, os.path.join(out, 'tach.json'))
    print(nv, {k: v for k, v in info.items()})
    return meta


# ---------------------------------------------------------------------------------------------- đặt tay (toạ độ ảnh
# nguồn CHƯA lật, đo trên ảnh có lưới)
# Nấm Mốc (1536×1024): bản nguyên x < 740
N_MU_DUOI = [(0, 600), (235, 600), (248, 540), (300, 522), (330, 505), (355, 492), (400, 488), (440, 478), (475, 470),
             (493, 470), (498, 512), (535, 514), (545, 505), (560, 526), (575, 545), (590, 548), (598, 600), (760, 600)]
# ↑ mép dưới mũ nấm (trên đường = mũ; dưới = thân). Giọt nhớt chảy dưới đường này ở lại trên thân (nhớt dính thân).
N_CHUONG = [(408, 168), (412, 148), (440, 126), (470, 108), (500, 90), (522, 72), (540, 46), (600, 45), (658, 92),
            (642, 190), (628, 236), (606, 254), (585, 250), (560, 238), (520, 218), (480, 198), (440, 181)]
# ↑ chuông nứt trên đỉnh mũ (kể cả quai treo); nhớt chảy từ vành chuông xuống mũ thuộc MŨ.
N_TACH_RIENG = {'than': (950, 640)}
N_MU_DINH = [(380, 100), (450, 104), (500, 114), (550, 134), (600, 168), (630, 205), (652, 248)]
# ↑ đỉnh vòm mũ ước lượng phía dưới chuông (phần mũ bị chuông che chỉ vá dưới đường này)    # điểm trong mảnh rời (bên phải) dùng để căn bù

# Dơi Chuông (1254×1254): bản nguyên y < 760
D_QUA_LAC = [(600, 558), (654, 558), (636, 632), (690, 640), (700, 760), (500, 760), (510, 640), (582, 632)]
D_NUT = [(560, 120), (555, 250), (530, 330), (560, 400), (545, 470), (570, 560), (600, 680)]
# ↑ đường chẻ đôi chuông theo vết nứt có sẵn (clip chết)
D_VANH = [(0, 628), (560, 628), (670, 648), (1254, 648)]   # mép ngoài vành miệng chuông sau cuống (vá phía trên đường)
# ↑ cuống + quả lắc (cuống nằm TRƯỚC vành chuông trong hình) – đa giác giao với vùng liền chuông

# Mẹ Nấm Mốc (1536×1024): bản nguyên x < 820
M_MU_DUOI = [(0, 640), (175, 640), (190, 560), (262, 520), (300, 500), (340, 488), (380, 470), (420, 455),
             (470, 455), (520, 470), (560, 485), (600, 500), (640, 520), (660, 560), (672, 640), (900, 640)]
M_CHUONG = [(355, 140), (360, 100), (400, 86), (450, 98), (458, 138), (500, 162), (560, 198), (600, 238), (650, 266),
            (672, 298), (670, 346), (642, 378), (590, 388), (528, 378), (494, 346), (470, 312), (430, 280), (400, 250),
            (385, 200)]
M_VUOT_SAU = [(15, 540), (176, 540), (205, 578), (214, 700), (192, 800), (176, 828), (15, 828)]
M_MU_DINH = [(250, 230), (300, 185), (360, 150), (420, 135), (470, 140), (520, 165), (580, 205), (640, 250),
             (690, 300), (730, 345), (800, 380)]   # đỉnh nón mũ ước lượng dưới chuông
M_GO_TREN = [(0, 820), (150, 820), (200, 800), (250, 790), (300, 800), (360, 790), (420, 770), (470, 760),
             (520, 770), (560, 785), (600, 790), (650, 800), (700, 815), (760, 820), (900, 820)]
# ↑ mép trên gò rễ (dưới đường = gò)
M_TUI_GAN = (328, 702, 100)        # (cx, cy, r) túi bào tử gần (trước thân)
M_TUI_XA = (683, 702, 72)          # túi bào tử xa (sau thân)
M_TUI_XA_THAN = [(615, 600), (622, 640), (628, 700), (622, 760), (615, 800)]   # mép phải thân che túi xa
M_TACH_RIENG = {'than': (1010, 470), 'tui-xa': (1285, 720), 'go-re': (1180, 900)}


def tach_nam():
    a, fg, rgba = nap('nam')
    ban = fg.copy()
    ban[:, 740:] = False
    lon = comp_tai(ban, 400, 400)                          # mũ + chuông + thân dính nhau
    tay = sorted([c for s, c in components(ban & ~lon, 5000) if s[0].start < 800], key=lambda c: np.nonzero(c)[1].min())
    chan = sorted([c for s, c in components(ban & ~lon, 5000) if s[0].start >= 800], key=lambda c: np.nonzero(c)[1].min())
    assert len(tay) == 2 and len(chan) == 2
    chuong = lon & da_giac(fg.shape, N_CHUONG)
    mu = lon & tren_duong(fg.shape, N_MU_DUOI) & ~chuong
    gai = mu & ~nd.binary_dilation(nd.binary_opening(mu, iterations=4), iterations=4)   # gai nét viền mảnh sát chuông
    chuong |= gai & nd.binary_dilation(chuong, iterations=12)
    mu &= ~chuong
    than = lon & ~mu & ~chuong
    ghi = {}
    sep = fg & ~ban
    sep_than = comp_tai(sep, *N_TACH_RIENG['than'])
    rs = rgba.copy(); rs[~sep_than] = 0
    than_r, _ = bu_dang_ky(rgba, than, mu | chuong, rs, ~fg, 'than', ghi)
    mu_r, _ = va(rgba, mu, bao_loi(mu) & chuong & ~tren_duong(fg.shape, N_MU_DINH), 'mu', ghi,
                 doi=[(0, 110), (-60, 120), (60, 120), (0, 190)])
    p = {}
    def grow(m):
        return nd.binary_dilation(m, iterations=2) & (rgba[..., 3] > 0)
    for k, m in (('tay-sau', tay[0]), ('tay-truoc', tay[1]), ('chan-gan', chan[0]), ('chan-xa', chan[1])):
        r = rgba.copy(); r[~grow(m)] = 0; p[k] = r
    # ↑ sau khi lật: nắm tay bên phải ảnh nguồn thành bên trái = phía trước (quay trái) → tay-truoc; chân trái ảnh
    #   nguồn (to hơn, thấp hơn) → sau lật nằm bên phải = chân gần người xem (vẽ trước).
    p['than'] = than_r
    p['mu'] = mu_r
    c = rgba.copy(); c[~chuong] = 0; p['chuong'] = c
    # bào tử (hiệu ứng chết): bong bóng cắt từ re-muc-do-vat.png
    p_bt = bao_tu()
    meta = luu_tat_ca('nam', p, ghi, {'duong_cat': {'mu_duoi': N_MU_DUOI, 'chuong': N_CHUONG}})
    luu_bao_tu('nam', p_bt, meta, co=80)


def bao_tu():
    a = load_rgb(SRC_BAO_TU)
    bg, _ = background(a)
    fg = ~bg
    lab, n = nd.label(fg)
    sz = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
    m = lab == int(np.argmax(sz)) + 1
    r = unmix_white(a, fg)
    r[~m] = 0
    return r


def luu_bao_tu(nv, r, meta, co):
    """bào tử thu về đường kính 'co' px (đơn vị px ảnh nguồn của nhân vật) để rig không cần co giãn lúc nghỉ"""
    out = manh_dir(nv)
    ys, xs = np.nonzero(r[..., 3] > 0)
    c = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32)
    c[..., :3] *= c[..., 3:4] / 255.0
    k = co / max(c.shape[:2])
    c = cv2.resize(c, (max(1, round(c.shape[1] * k)), max(1, round(c.shape[0] * k))), interpolation=cv2.INTER_AREA)
    c[..., :3] = np.where(c[..., 3:4] > 0, c[..., :3] / np.maximum(c[..., 3:4], 1e-3) * 255.0, 0)
    r = np.zeros((c.shape[0] + 8, c.shape[1] + 8, 4), np.uint8)
    r[4:-4, 4:-4] = c.round().clip(0, 255).astype(np.uint8)
    hop = cat_luu(r, os.path.join(out, 'bao-tu.png'), r.shape[1])
    meta['manh']['bao-tu'] = {'anh': f'manh/{nv}/bao-tu.png', 'hop_tren_nguon': hop,
                              'nguon': 'bong bóng bào tử cắt từ art/re-muc/nguon/re-muc-do-vat.png (hiệu ứng, không '
                                       'thuộc ảnh nhân vật)'}
    save_json(meta, os.path.join(out, 'tach.json'))


def tach_doi():
    a, fg, rgba = nap('doi')
    ban = fg.copy()
    ban[760:] = False
    than_all = comp_tai(ban, 640, 400)
    canh = sorted([c for s, c in components(ban & ~than_all, 5000)], key=lambda c: np.nonzero(c)[1].min())
    assert len(canh) == 2
    ql = than_all & da_giac(fg.shape, D_QUA_LAC)
    # chỉ giữ khối liền chứa quả lắc
    ql = comp_tai(ql, 600, 700)
    than = than_all & ~ql
    ghi = {}
    than_r, _ = va(rgba, than, bao_loi(than) & ql & tren_duong(fg.shape, D_VANH), 'than', ghi)
    ql_r = rgba.copy(); ql_r[~ql] = 0          # quả lắc vẽ TRƯỚC chuông → không có phần khuất cần bù
    p = {'than': than_r, 'qua-lac': ql_r}
    for k, m in (('canh-sau', canh[0]), ('canh-truoc', canh[1])):
        r = rgba.copy(); r[~(nd.binary_dilation(m, iterations=2) & (rgba[..., 3] > 0))] = 0; p[k] = r
    # ↑ sau lật: cánh phải ảnh nguồn (ngắn, nằm phía trước mặt) → bên trái = cánh trước
    # chẻ đôi thân chuông theo vết nứt (chỉ dùng clip chết – chuông vỡ). Nửa TRÁI ảnh nguồn → sau lật nằm bên PHẢI.
    H, W = fg.shape
    xc = np.interp(np.arange(H), [q[1] for q in D_NUT], [q[0] for q in D_NUT])[:, None]
    trai = np.arange(W)[None, :] < xc
    d = np.abs(np.arange(W)[None, :] - xc)
    for ten, m in (('than-phai', trai), ('than-trai', ~trai)):
        a2 = than_r.astype(np.float64).copy()
        a2[~m] = 0
        k = np.clip((7 - d) / 3.0, 0, 1)[..., None] * (a2[..., 3:4] > 0)
        a2[..., :3] = a2[..., :3] * (1 - k) + np.array([28, 16, 8.0]) * k
        p[ten] = a2.round().astype(np.uint8)
    luu_tat_ca('doi', p, ghi, {'duong_cat': {'qua_lac': D_QUA_LAC, 'che_doi_than': D_NUT}})


def tach_menam():
    a, fg, rgba = nap('menam')
    H, W = fg.shape
    ban = comp_tai(fg, 400, 500) | comp_tai(fg, 800, 700)      # bản nguyên = khối lớn + vuốt phải (rời sẵn)
    vuot_truoc = comp_tai(ban, 800, 700)                    # vuốt phải ảnh nguồn (rời sẵn) → sau lật: trước
    lon = ban & ~vuot_truoc
    vuot_sau = lon & da_giac(fg.shape, M_VUOT_SAU)
    vuot_sau = comp_tai(vuot_sau, 100, 700)
    con = lon & ~vuot_sau
    chuong = con & da_giac(fg.shape, M_CHUONG)
    mu = con & tren_duong(fg.shape, M_MU_DUOI) & ~chuong
    duoi = con & ~mu & ~chuong
    go = duoi & ~tren_duong(fg.shape, M_GO_TREN)
    tg = duoi & tron(fg.shape, *M_TUI_GAN) & ~go
    xs_mep = np.interp(np.arange(H), [p[1] for p in M_TUI_XA_THAN], [p[0] for p in M_TUI_XA_THAN],
                       left=10 ** 6, right=10 ** 6)
    tx = duoi & tron(fg.shape, *M_TUI_XA) & (np.arange(W)[None, :] > xs_mep[:, None]) & ~go & ~tg
    than = duoi & ~go & ~tg & ~tx
    ghi = {}
    sep = fg & ~ban
    def rieng(k):
        m = comp_tai(sep, *M_TACH_RIENG[k])
        r = rgba.copy(); r[~m] = 0
        return r
    than_r, _ = bu_dang_ky(rgba, than, mu | chuong | go | tg, rieng('than'), ~fg, 'than', ghi,
                           s_ds=np.linspace(1.0, 1.6, 25), g_ds=np.arange(-4, 4.1, 2.0))
    mu_r, _ = va(rgba, mu, bao_loi(mu) & chuong & ~tren_duong(fg.shape, M_MU_DINH), 'mu', ghi,
                 doi=[(0, 150), (-80, 160), (80, 160), (0, 230), (-150, 200)])
    tx_r, _ = bu_dang_ky(rgba, tx, than | tg, rieng('tui-xa'), ~fg, 'tui-xa', ghi)
    go_r, _ = bu_dang_ky(rgba, go, tg, rieng('go-re'), ~fg, 'go-re', ghi)
    p = {'than': than_r, 'mu': mu_r, 'tui-xa': tx_r, 'go-re': go_r}
    for k, m in (('chuong', chuong), ('tui-gan', tg), ('vuot-sau', vuot_sau), ('vuot-truoc', vuot_truoc)):
        r = rgba.copy(); r[~m] = 0; p[k] = r
    meta = luu_tat_ca('menam', p, ghi, {'duong_cat': {'mu_duoi': M_MU_DUOI, 'chuong': M_CHUONG, 'vuot_sau': M_VUOT_SAU,
                                                      'go_tren': M_GO_TREN, 'tui_gan': M_TUI_GAN, 'tui_xa': M_TUI_XA}})
    luu_bao_tu('menam', bao_tu(), meta, co=46)


if __name__ == '__main__':
    import sys
    for nv in (sys.argv[1:] or ['nam', 'doi', 'menam']):
        {'nam': tach_nam, 'doi': tach_doi, 'menam': tach_menam}[nv]()
