"""Khuôn cutout Lam v3 – dựng mảnh bằng code từ manh-goc/.

Đơn vị: px "thế giới" = tỉ lệ ảnh mẫu nhìn ngang đã thu (master-s.png, Lam cao ~470 px).
Game: 112 px logic / 470 ≈ 0,238 px logic cho 1 px thế giới.

Khác v2 (xem CHANGELOG.md):
- Mỗi mảnh tách 3 lớp dữ liệu: mask hình (mask), vật liệu (mat, KHÔNG chứa viền),
  và mask viền (tính khi xuất từ ring_base + nét trong). v2 nung viền vào cls.
- from_src(): bỏ dải viền gốc của ảnh nguồn (ink nguồn ~7–8 px, mũ ~11 px), thay bằng
  vật liệu lân cận; nét trong nguồn lấy xương (Zhang–Suen) rồi kẻ lại với độ dày T_IN.
- Viền ngoài kẻ trên ring_base: với đầu nối bị che, ring_base kéo dài tiết diện ra sau
  điểm xoay → không kẻ vành ống/khớp cầu, nhưng hai cạnh bên vẫn có viền.
- Khớp lồng (khop_long): cha có nắp tròn bán kính R tại D (có viền, là silhouette khi gập),
  con có nắp ẩn bán kính R − T_LINE tại P (không viền). Con đè cha.
- Mũ/chóp: cắt theo gấp khúc góc lồi–pivot–hốc (giữ pivot v2), chóp có phần nối ẩn
  dạng quạt nằm DƯỚI mũ chính → vùng bù thật khi chóp lắc.
"""
import os, math
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- palette chung (giữ nguyên v2, lấy từ ảnh mẫu) ----------
PAL = {
    'ink': (12, 10, 14), 'den': (8, 6, 10),
    'xanh': (25, 67, 157), 'xanh_bong': (16, 41, 100),
    'ngoc': (51, 210, 194), 'ngoc_bong': (30, 166, 154),
    'nau': (131, 84, 50), 'nau_bong': (104, 65, 38), 'nau_toi': (58, 39, 16),
    'vang_dong': (240, 174, 24), 'mat': (253, 237, 78),
    'thep': (227, 227, 227), 'thep_bong': (156, 155, 155),
}
GREY = {'ink': 25, 'den': 45, 'xanh': 190, 'xanh_bong': 160, 'ngoc': 215, 'ngoc_bong': 185, 'nau': 175,
        'nau_bong': 150, 'nau_toi': 110, 'vang_dong': 225, 'mat': 245, 'thep': 240, 'thep_bong': 200}
FAR = 0.82          # phía xa: cùng palette, tối đi 18 % (giữ v2)
T_LINE = 8          # viền ngoài (px thế giới) – giữ làm đối chứng
SRC_SCALE = 0.65    # tỉ lệ thân (BODY v2)
DARK = 60           # ngưỡng điểm tối (max RGB) để nhận ink/den trong ảnh nguồn


def src(n):
    return Image.open(os.path.join(HERE, 'manh-goc', n + '.png')).convert('RGBA')


def edt_in(mask):
    """Khoảng cách từ điểm trong mask tới nền (0 ngoài mask)."""
    return ndimage.distance_transform_edt(np.pad(mask, 2))[2:-2, 2:-2]


def disc(shape, c, r):
    yy, xx = np.mgrid[:shape[0], :shape[1]]
    return (xx - c[0]) ** 2 + (yy - c[1]) ** 2 <= r * r


def half_plane(shape, c, u, sign=1, off=0.0):
    """sign=+1: điểm có (x-c)·u >= off ; sign=-1: (x-c)·u < off."""
    yy, xx = np.mgrid[:shape[0], :shape[1]].astype(float)
    t = (xx - c[0]) * u[0] + (yy - c[1]) * u[1]
    return t >= off if sign > 0 else t < off


def zs_thin(m):
    """Xương hoá Zhang–Suen (numpy)."""
    im = np.pad(m.astype(np.uint8), 1)
    while True:
        changed = False
        for step in (0, 1):
            P2 = im[:-2, 1:-1]; P3 = im[:-2, 2:]; P4 = im[1:-1, 2:]; P5 = im[2:, 2:]
            P6 = im[2:, 1:-1]; P7 = im[2:, :-2]; P8 = im[1:-1, :-2]; P9 = im[:-2, :-2]
            nb = [P2, P3, P4, P5, P6, P7, P8, P9]
            B = sum(n.astype(int) for n in nb)
            seq = nb + [P2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(int) for i in range(8))
            c = im[1:-1, 1:-1] == 1
            if step == 0:
                cond = c & (B >= 2) & (B <= 6) & (A == 1) & ((P2 * P4 * P6) == 0) & ((P4 * P6 * P8) == 0)
            else:
                cond = c & (B >= 2) & (B <= 6) & (A == 1) & ((P2 * P4 * P8) == 0) & ((P2 * P6 * P8) == 0)
            if cond.any():
                im[1:-1, 1:-1][cond] = 0; changed = True
        if not changed:
            return im[1:-1, 1:-1].astype(bool)


def nearest_fill(mat, valid):
    """Thay vật liệu ở điểm không hợp lệ bằng vật liệu của điểm hợp lệ gần nhất."""
    if valid.all():
        return mat
    _, (iy, ix) = ndimage.distance_transform_edt(~valid, return_indices=True)
    return mat[iy, ix]


class Piece:
    """mask: hình; mat: chỉ số vật liệu theo allow (không có viền);
    ring_base: hình dùng để tính viền ngoài (⊇ mask; kéo dài ở đầu nối ẩn);
    inner: xương nét trong (kẻ lại với T_IN); P/D: điểm xoay gần/xa (px trong ảnh)."""

    def __init__(s, name, mask, mat, allow, P=None, D=None, inner=None, ring_base=None,
                 noline=None, eye=False):
        s.name, s.mask, s.mat, s.allow = name, mask, mat, list(allow)
        s.P = None if P is None else (float(P[0]), float(P[1]))
        s.D = None if D is None else (float(D[0]), float(D[1]))
        s.inner = np.zeros_like(mask) if inner is None else inner
        s.ring_base = mask.copy() if ring_base is None else ring_base
        s.noline = np.zeros_like(mask) if noline is None else noline
        s.eye = eye
        s.inner_px = np.zeros_like(mask)   # nét trong nguồn giữ nguyên hình (mặc định)
        s.extra = {}

    # ----- viền -----
    def line(s, t_out=None, t_in=None):
        t_out = T_LINE if t_out is None else t_out
        if s.eye:
            return np.zeros_like(s.mask)
        rb = s.ring_base | s.mask
        r = s.mask & (edt_in(rb) <= t_out) & ~s.noline
        if t_in is None:
            r |= s.inner_px & s.mask
        elif s.inner.any():
            k = max(1, int(round(t_in / 2.0)))
            yy, xx = np.mgrid[-k:k + 1, -k:k + 1]
            st = (xx * xx + yy * yy) <= (t_in / 2.0) ** 2 + 0.25
            r |= ndimage.binary_dilation(s.inner, structure=st) & s.mask
        return r

    def rgba(s, mode='mau', far=False, t_out=None, t_in=None):
        H, W = s.mask.shape
        o = np.zeros((H, W, 4), np.uint8)
        ln = s.line(t_out, t_in)
        for i, c in enumerate(s.allow):
            m = s.mask & (s.mat == i) & ~ln
            if mode == 'xam':
                o[m, :3] = GREY[c]
            else:
                col = np.array(PAL[c], float)
                if far and c not in ('ink', 'den'):
                    col = col * FAR
                o[m, :3] = np.round(col).astype(np.uint8)
        o[ln, :3] = GREY['ink'] if mode == 'xam' else PAL['ink']
        o[s.mask, 3] = 255
        return Image.fromarray(o)

    def bone(s):
        return None if s.D is None else float(np.hypot(*np.subtract(s.D, s.P)))

    def huong(s):
        """Hướng xương trong ảnh (độ, y xuống, 0 = +x, dương = theo chiều kim đồng hồ)."""
        if s.D is None:
            return 0.0
        return math.degrees(math.atan2(s.D[1] - s.P[1], s.D[0] - s.P[0]))

    def half_width(s, pt, u):
        """Nửa bề rộng mask đo vuông góc với u tại pt: (bên trái, bên phải)."""
        n = np.array([-u[1], u[0]]); out = []
        for sg in (1, -1):
            for r in np.arange(0, 120, 0.5):
                q = np.array(pt) + sg * r * n
                x, y = int(round(q[0])), int(round(q[1]))
                if not (0 <= y < s.mask.shape[0] and 0 <= x < s.mask.shape[1]) or not s.mask[y, x]:
                    out.append(float(r)); break
        return tuple(out)


def classify(img, allow):
    a = np.array(img).astype(float); al = a[..., 3] > 127
    cols = np.array([PAL[c] for c in allow], float)
    d = ((a[..., None, :3] - cols[None, None]) ** 2).sum(-1)
    return a, al, np.argmin(d, -1)


def from_src(name, k, allow, P=None, D=None, eye=False, smooth=True):
    """Mảnh từ ảnh nguồn.
    - Bỏ dải viền ngoài của ảnh nguồn (độ dày đo được t_src) và cả dải chuyển màu
      khử răng cưa sát nó (tới t_src + 1,5 px): thay bằng vật liệu sâu bên trong gần nhất.
      → viền ngoài chỉ còn viền kẻ lại bằng code (T_LINE), không còn ink nguồn ở đầu nối ẩn.
    - Nét trong nguồn (điểm tối cách mép > t_src + 1) giữ nguyên hình, nối dài về phía mép
      tới T_LINE − 1 để chạm viền mới (không hở). Đồng thời lưu xương của nó để thử kẻ lại T_IN.
    - Blob tối lớn (lòng mũ) → vật liệu 'den'."""
    im = src(name); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    allow = list(allow)
    a, al, idx = classify(im, allow)
    if smooth:
        al = ndimage.binary_opening(ndimage.binary_closing(al, iterations=1), iterations=1)
    if eye:
        return Piece(name, al, idx, allow, P, D, eye=True)
    dark = al & (a[..., :3].max(-1) < DARK)
    dto = edt_in(al)
    fill = al & ~dark
    dtf = ndimage.distance_transform_edt(~fill) if fill.any() else np.zeros_like(dto)
    band_px = dark & (dto <= 14)
    t_src = float(np.median((dto + dtf)[band_px])) if band_px.any() else 7.0
    # nét trong: lõi sâu rồi nối dài dọc điểm tối về phía mép (không vượt vào dải viền mới)
    core = dark & (dto > t_src + 1.0)
    # nối dài dạng nón: điểm tối ở dải T_LINE−1..t_src+1 giữ nếu cách lõi ≤ (t_src+1 − dto) + 1
    # → nét kéo thẳng về phía mép, không bò dọc viền thành râu.
    if core.any():
        dcore = ndimage.distance_transform_edt(~core)
        gap = dark & (dto > T_LINE - 1) & (dto <= t_src + 1.0)
        inner_px = core | (gap & (dcore <= (t_src + 1.0 - dto) + 1.0))
    else:
        inner_px = core.copy()
    # blob tối lớn → vật liệu den/ink (giữ hình)
    blob = np.zeros_like(al)
    if core.any():
        lab, n = ndimage.label(core)
        edk = edt_in(dark)
        for i in range(1, n + 1):
            c = lab == i
            if edk[c].max() > 5.5:
                blob |= c
    blob = ndimage.binary_dilation(blob, iterations=3) & inner_px
    line_px = inner_px & ~blob
    # xương nét trong (chỉ dùng khi thử T_IN)
    sk = zs_thin(line_px) if line_px.any() else line_px
    mat = idx.copy()
    tone = 'den' if 'den' in allow else 'ink'
    mat[blob] = allow.index(tone)
    invalid = al & ((dto <= t_src + 1.5) | (dark & ~blob))
    valid = al & ~invalid
    if not valid.any():
        valid = al & ~dark
    mat = nearest_fill(mat, valid | ~al)
    p = Piece(name, al, mat, allow, P, D, inner=sk)
    p.inner_px = line_px
    p.extra['vien_nguon_px'] = round(t_src, 1)
    p.extra['net_trong_px'] = int(line_px.sum())
    return p


BLUE = ['ink', 'xanh', 'xanh_bong']
TEAL = ['ink', 'ngoc', 'ngoc_bong', 'xanh', 'xanh_bong']
BROWN = ['ink', 'nau', 'nau_bong', 'nau_toi']


# ---------- khớp lồng: cha có nắp R ở D, con có nắp ẩn ở P ----------
def sweep_back(mask, P, u, length, band=3.0):
    """Kéo tiết diện của mask tại P lùi về phía -u một đoạn length (dùng cho ring_base)."""
    sl = mask & half_plane(mask.shape, P, u, +1, 0.0) & half_plane(mask.shape, P, u, -1, band)
    out = mask.copy()
    if not sl.any():
        return out
    for k in np.arange(0.5, length + 0.5, 0.5):
        sh = ndimage.shift(sl.astype(float), (-u[1] * k, -u[0] * k), order=0) > 0.5
        out |= sh
    return out


def child_cap(p, R, t=T_LINE, c=6.0):
    """Đầu gần của mảnh con (khớp lồng):
    - đệm khung ảnh đủ rộng để hình kéo dài (ring_base) không chạm mép ảnh;
    - lấy tiết diện tại P + c·u (c = 6 px, tránh mép đầu xiên của ảnh nguồn), kéo lùi về sau P
      một đoạn R + t + c → hai cạnh bên liền mạch, mép cắt không có viền;
    - phần giữa P và P + c lấp bằng tiết diện kéo lùi (vá góc xiên); sau P chỉ còn nắp ẩn R − t."""
    pad_piece(p, int(math.ceil(R + t + c + 4)))
    u = np.subtract(p.D, p.P); u = u / np.linalg.norm(u)
    sh = p.mask.shape
    keep = p.mask & half_plane(sh, p.P, u, +1, c)
    slab_origin = (p.P[0] + c * u[0], p.P[1] + c * u[1])
    sw = sweep_back(keep, slab_origin, u, R + t + c + 2)
    body = keep | (sw & half_plane(sh, p.P, u, +1, 0.0))
    cap = disc(sh, p.P, max(R - t, 2))
    new = body | cap
    rb = ndimage.binary_fill_holes(ndimage.binary_closing(sw | new, iterations=2) | sw | new)
    # vật liệu phần vá/nắp: lấy từ điểm thật sâu hơn tiết diện lấy mẫu (tránh mảnh vụn khử răng cưa ở đầu nguồn)
    p.mat = nearest_fill(p.mat, keep & half_plane(sh, p.P, u, +1, c + 2))
    # không kẻ viền phía sau P: nắp ẩn nằm trọn trong nắp cha (R − t < R) → không vạch đen trong khuỷu/gối
    p.noline = half_plane(sh, p.P, u, -1, 0.0)
    p.inner = p.inner & keep
    p.inner_px = p.inner_px & keep
    p.mask, p.ring_base = new, rb
    p.extra['nap_an_P'] = round(float(max(R - t, 2)), 1)


def parent_cap(p, R):
    """Đầu xa của mảnh cha: thêm nắp tròn bán kính R tâm D (có viền) – silhouette khi gập."""
    cap = disc(p.mask.shape, p.D, R)
    new = p.mask | cap
    if (new & ~p.mask).any():
        p.mat = nearest_fill(p.mat, p.mask | ~new)
    p.mask = new; p.ring_base = p.ring_base | new
    p.extra['nap_D'] = round(float(R), 1)


def pad_piece(p, pad):
    """Mở rộng khung ảnh (để nắp tròn không bị cắt mép); dời P/D."""
    def pd(a, v=0):
        return np.pad(a, pad, constant_values=v)
    p.mask, p.mat, p.inner, p.inner_px = pd(p.mask), pd(p.mat), pd(p.inner), pd(p.inner_px)
    p.ring_base, p.noline = pd(p.ring_base), pd(p.noline)
    p.P = None if p.P is None else (p.P[0] + pad, p.P[1] + pad)
    p.D = None if p.D is None else (p.D[0] + pad, p.D[1] + pad)


def crop_piece(p, margin=1):
    ys, xs = np.nonzero(p.mask)
    y0, x0 = max(ys.min() - margin, 0), max(xs.min() - margin, 0)
    y1, x1 = ys.max() + margin + 1, xs.max() + margin + 1
    for k in ('mask', 'mat', 'inner', 'inner_px', 'ring_base', 'noline'):
        setattr(p, k, getattr(p, k)[y0:y1, x0:x1])
    p.P = None if p.P is None else (p.P[0] - x0, p.P[1] - y0)
    p.D = None if p.D is None else (p.D[0] - x0, p.D[1] - y0)
    return x0, y0


# ---------- A. mũ chính + chóp ----------
HOOD_PIVOT = (80, 95)      # giữ pivot chóp v2 (toạ độ trong mũ gốc)


def hood_pieces(t_ext_deg=16.0):
    """Cắt chóp theo gấp khúc: góc lồi đỉnh – pivot – hốc dưới (cả hai điểm nối nằm gần
    vuông góc với bán kính từ pivot → khi xoay, điểm nối trượt dọc mép).
    Chóp gồm phần thấy + quạt nối ẩn ±t_ext_deg quanh pivot, vẽ DƯỚI mũ chính."""
    im = src('mu')
    allow = ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong']
    full = from_src('mu', 1.0, allow)
    al = full.mask
    H, W = al.shape
    c = np.array(HOOD_PIVOT, float)
    # mép trên / dưới của chóp theo cột
    top = np.array([np.nonzero(al[:, x])[0].min() if al[:, x].any() else H for x in range(W)])
    # góc lồi đỉnh: điểm đổi dốc mạnh nhất (độ cong lồi lớn nhất) ở x 30..70
    xs = np.arange(30, 71)
    curv = top[xs - 4] + top[xs + 4] - 2 * top[xs]
    xc = int(xs[np.argmax(curv)])          # đỉnh lồi: top[x] nhỏ hơn trung bình hai bên → curv dương lớn nhất
    corner = np.array([xc, top[xc]], float)
    # hốc dưới: mép dưới của dải chóp (run đầu tiên) – điểm cao nhất ở x 50..80
    bot = []
    for x in range(50, 81):
        col = al[:, x]; ys = np.nonzero(col)[0]
        y = ys[0]
        while y + 1 < H and col[y + 1]:
            y += 1
        bot.append((y, x))
    yb, xb = min(bot)
    notch = np.array([xb, yb], float)
    yy, xx = np.mgrid[:H, :W].astype(float)
    ang = np.degrees(np.arctan2(yy - c[1], xx - c[0]))
    a_top = math.degrees(math.atan2(corner[1] - c[1], corner[0] - c[0]))
    a_bot = math.degrees(math.atan2(notch[1] - c[1], notch[0] - c[0]))
    # phía chóp: góc từ a_bot (dưới) quay qua trái (180°) tới a_top (trên)
    def in_arc(a, lo, hi):          # cung từ lo tăng tới hi (mod 360)
        return ((a - lo) % 360) <= ((hi - lo) % 360)
    # giới hạn y: tránh quét nhầm phần phình sau-dưới của mũ (y > 170)
    tip_side = in_arc(ang, a_bot, a_top) & (yy < notch[1] + 40)
    tip_vis = al & tip_side
    # quạt nối ẩn: thêm ±t_ext_deg vào phía mũ chính, trong bán kính tới điểm nối xa nhất
    rmax = max(np.hypot(*(corner - c)), np.hypot(*(notch - c))) + T_LINE
    ext = al & ~tip_side & (in_arc(ang, a_top, a_top + t_ext_deg) | in_arc(ang, a_bot - t_ext_deg, a_bot)) \
        & (np.hypot(xx - c[0], yy - c[1]) <= rmax)
    tipm = tip_vis | ext | (al & disc(al.shape, c, 20))
    mainm = al & ~tip_side
    pm = Piece('mu', mainm, full.mat.copy(), allow, P=(205, 250), inner=full.inner & mainm,
               ring_base=al.copy())
    pt = Piece('chop-mu', tipm, full.mat.copy(), allow, P=tuple(c), inner=full.inner & tipm,
               ring_base=al.copy())
    pm.inner_px = full.inner_px & mainm
    pt.inner_px = full.inner_px & tipm
    pm.extra.update(goc_loi=corner.tolist(), hoc=notch.tolist(), quat_noi_do=t_ext_deg,
                    vien_nguon_px=full.extra['vien_nguon_px'])
    x0, y0 = crop_piece(pt)
    pt.extra['goc_trong_mu'] = [int(x0), int(y0)]
    pt.extra.update(goc_loi=corner.tolist(), hoc=notch.tolist())
    return pm, pt


# ---------- B. đùi / cẳng chân: đoạn vải dựng theo hồ sơ bề rộng ----------
def segment(name, L, prof, r_top, r_bot, ext_top=0, shade_side=1, top_line=True):
    """Đoạn chi dọc trục y. P ở (cx, pad+ext_top), D ở P + (0, L).
    prof: [(t, w)] bề rộng toàn phần theo tỉ lệ t∈[0,1] dọc xương (nội suy tuyến tính).
    r_top: nắp tròn tại P (0 = không); r_bot: nắp tròn tại D."""
    wmax = max(max(w for _, w in prof), 2 * r_top, 2 * r_bot)
    pad = 6
    Wd = int(math.ceil(wmax + 2 * pad)); cx = Wd / 2.0
    top = pad + max(ext_top, r_top)
    Hh = int(math.ceil(top + L + r_bot + pad))
    P = (cx, top); D = (cx, top + L)
    yy, xx = np.mgrid[:Hh, :Wd].astype(float)
    t = np.clip((yy - P[1]) / L, 0, 1)
    ts = np.array([a for a, _ in prof]); ws = np.array([b for _, b in prof])
    half = np.interp(t, ts, ws) / 2.0
    body = (np.abs(xx - cx) <= half) & (yy >= P[1]) & (yy <= D[1])
    mask = body.copy()
    if r_top > 0:
        mask |= disc(mask.shape, P, r_top)
    if r_bot > 0:
        mask |= disc(mask.shape, D, r_bot)
    allow = ['ink', 'xanh', 'xanh_bong']
    mat = np.full(mask.shape, 1)
    # bóng: đa giác xiên ít chi tiết (thay dải dọc đều của v2) – phía shade_side
    # đường ranh đi từ 30 % nửa rộng ở đầu gần tới 5 % ở đầu xa
    frac = 0.30 + (0.05 - 0.30) * t
    shade = (xx - cx) * shade_side > half * frac
    mat[shade] = 2
    p = Piece(name, mask, mat, allow, P=P, D=D)
    p.extra['ho_so_rong'] = [[float(a), float(b)] for a, b in prof]
    return p


def build(cfg=None):
    """Dựng toàn bộ mảnh. cfg: {'chan_w1': 28, 'chan_r1': 14, 'ho_so_cang': 'v3'|'v2'|'tuyen'}."""
    cfg = dict(cfg or {})
    pc = {}
    pc['mu'], pc['chop-mu'] = hood_pieces(cfg.get('quat_noi_do', 16.0))
    pc['mat'] = from_src('mat', 0.5, ['mat'], P=(12, 23), eye=True)
    pc['than'] = from_src('than', SRC_SCALE, BLUE, P=(57, 56))
    for n in ('capelet-sau', 'capelet-truoc', 'vat-sau', 'vat-truoc'):
        pc[n] = from_src(n, SRC_SCALE, TEAL)
    pc['dai'] = from_src('dai', SRC_SCALE, BROWN)
    pc['bao-dao'] = from_src('bao-dao', SRC_SCALE, BROWN)
    pc['chuong'] = from_src('chuong', SRC_SCALE, ['ink', 'vang_dong', 'nau_bong', 'nau_toi'], P=(22, 4))
    pc['dao'] = from_src('dao', SRC_SCALE, ['ink', 'nau', 'nau_bong', 'vang_dong', 'thep', 'thep_bong'], P=(21, 38))
    for s in ('gan', 'xa'):
        pc['tay-tren-' + s] = from_src('tay-tren-' + s, SRC_SCALE, BLUE, P=(53, 18), D=(29, 57))
        pc['cang-tay-' + s] = from_src('cang-tay-' + s, SRC_SCALE, BLUE, P=(14, 27), D=(56, 43))
        pc['gang-' + s] = from_src('gang-' + s, SRC_SCALE, BROWN, P=(19, 36), D=(58, 36))
        pc['ung-' + s] = from_src('ung-' + s, SRC_SCALE, BROWN, P=(34, 16), D=(34, 58))
    # ---- chân: xương đùi 47, cẳng 38 (giữ v2) ----
    w_knee = cfg.get('w_goi', 50)
    kieu = cfg.get('ho_so_cang', 'v3')
    for s in ('gan', 'xa'):
        if kieu == 'v2':        # đối chứng v2: w0=46 → w1=36, r1=18; đùi 50→38, r1=18
            dui = segment('dui-' + s, 47, [(0, 50), (1, 38)], r_top=25, r_bot=18)
            cang = segment('cang-chan-' + s, 38, [(0, 46), (1, 36)], r_top=23, r_bot=18)
        elif kieu == 'tuyen':   # phương án thử của REVIEW: w1 36→28, r1 18→14 nội suy thẳng
            dui = segment('dui-' + s, 47, [(0, 50), (1, 38)], r_top=25, r_bot=18)
            cang = segment('cang-chan-' + s, 38, [(0, 46), (1, cfg.get('chan_w1', 28))], r_top=23,
                           r_bot=cfg.get('chan_r1', 14))
        else:                   # v3: bề rộng thấy giữ nguyên tới mép cổ ủng, thu lại trong ủng
            w_vis = cfg.get('w_cang_thay', 50)
            t_boot = (38 - 16) / 38.0       # mép trên ủng cách khớp cổ chân 16 px (đo trên mask ủng)
            dui = segment('dui-' + s, 47, [(0, 54), (1, w_knee)], r_top=27, r_bot=w_knee / 2.0)
            cang = segment('cang-chan-' + s, 38,
                           [(0, w_knee), (t_boot, w_vis), (t_boot + 0.08, w_vis - 6), (1, cfg.get('chan_w1', 28))],
                           r_top=0, r_bot=cfg.get('chan_r1', 14))
        pc['dui-' + s], pc['cang-chan-' + s] = dui, cang
    # ---- khớp lồng (gối, khuỷu) ----
    nap = {}
    if kieu == 'v3':
        for s in ('gan', 'xa'):
            child_cap(pc['cang-chan-' + s], w_knee / 2.0)
            nap['goi-' + s] = w_knee / 2.0
    for s in ('gan', 'xa'):
        A, B = pc['tay-tren-' + s], pc['cang-tay-' + s]
        u = np.subtract(B.D, B.P); u = u / np.linalg.norm(u)
        hw = B.half_width(B.P, u)
        R = max(hw)
        pad_piece(A, 12)
        parent_cap(A, R)
        child_cap(B, R)
        nap['khuyu-' + s] = R
        # đầu xa cẳng tay ẩn trong găng: nắp ≤ khoảng hở quanh P của găng − 2
        g = pc['gang-' + s]
        clr = float(edt_in(g.mask)[int(round(g.P[1])), int(round(g.P[0]))])
        B.extra['ho_gang_P'] = round(clr, 1)
    for p in pc.values():
        p.extra.setdefault('khop', {})
    pc['_nap'] = nap
    return pc


PIECES = ['mu', 'chop-mu', 'mat', 'than', 'capelet-sau', 'capelet-truoc', 'vat-sau', 'vat-truoc', 'dai',
          'bao-dao', 'chuong', 'dao', 'tay-tren-gan', 'cang-tay-gan', 'gang-gan', 'tay-tren-xa', 'cang-tay-xa',
          'gang-xa', 'dui-gan', 'cang-chan-gan', 'ung-gan', 'dui-xa', 'cang-chan-xa', 'ung-xa']
