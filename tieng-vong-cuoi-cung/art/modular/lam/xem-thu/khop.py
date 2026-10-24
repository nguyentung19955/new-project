"""Cấu trúc khớp chồng lớp cho Lam modular.
- Đoạn chi tách tại khuỷu/gối, mỗi đoạn có nắp tròn ẩn (phần kéo dài) ở đầu nối.
- Vẽ chi 2 lượt: lượt 1 cả viền + màu, lượt 2 chỉ phần màu bên trong → hai đoạn liền một bóng, không viền kép ở khuỷu/gối.
- Găng/ủng: bỏ chốt tròn, đè lên cổ tay/cổ chân. Vạt áo che hông, capelet che vai.
"""
import math, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

L = lambda k: Image.open(f'p{k:02d}.png').convert('RGBA')
INK = (12, 10, 14, 255)
RING = 10   # độ dày viền ngoài (px ảnh gốc)

def T_(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.]])
def R_(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])
def ang(v): return math.degrees(math.atan2(v[1], v[0]))
def place(pos, a, piv): return T_(*pos) @ R_(a) @ T_(-piv[0], -piv[1])
def app(M, p): return (M @ np.array([p[0], p[1], 1.]))[:2]
def put(cv, img, M):
    Mi = np.linalg.inv(M)
    cv.alpha_composite(img.transform(cv.size, Image.AFFINE, tuple(Mi[:2].flatten()), Image.BICUBIC))

def fill_only(img):
    """Bỏ vòng viền ngoài (giữ nét bên trong)."""
    a = np.array(img); al = a[..., 3] > 0
    d = ndimage.distance_transform_edt(np.pad(al, 2))[2:-2, 2:-2]
    o = a.copy(); o[d <= RING, 3] = 0
    return Image.fromarray(o)

def split(k, A, J, B, r):
    """Tách mảnh chi liền tại J; thêm nắp tròn (phần kéo dài ẩn) cho cả hai đoạn."""
    src = np.array(L(k)); A, J, B = (np.array(p, float) for p in (A, J, B))
    u1 = (J-A)/np.linalg.norm(J-A); u2 = (B-J)/np.linalg.norm(B-J)
    n = u1 + u2; n /= np.linalg.norm(n)
    yy, xx = np.mgrid[:src.shape[0], :src.shape[1]]
    side = (xx-J[0])*n[0] + (yy-J[1])*n[1]
    # màu nắp: trung bình phần màu quanh J (không lấy viền)
    near = ((xx-J[0])**2 + (yy-J[1])**2 < (r*0.6)**2) & (src[..., 3] > 0) & (src[..., :3].max(2) > 50)
    col = tuple(int(c) for c in np.median(src[near][:, :3], 0)) + (255,)
    segs = []
    for keep in (side < 0, side >= 0):
        a = src.copy(); a[~keep, 3] = 0
        pad = r + 4   # nới khung để nắp không bị cắt
        big = Image.new('RGBA', (a.shape[1]+2*pad, a.shape[0]+2*pad)); big.paste(Image.fromarray(a), (pad, pad))
        c = J + pad
        b = np.array(big); H, W = b.shape[:2]
        yy2, xx2 = np.mgrid[:H, :W]; dist = np.hypot(xx2-c[0], yy2-c[1])
        disc = dist <= r
        dark = b[..., :3].max(2) < 60
        fillm = disc & ((b[..., 3] == 0) | dark)     # trong nắp: bỏ viền cũ, tô màu nắp
        b[fillm] = col
        union = b[..., 3] > 0
        de = ndimage.distance_transform_edt(np.pad(union, 2))[2:-2, 2:-2]
        ring = union & (de <= RING) & (dist <= r + RING + 3)   # viền mới chỉ quanh nắp
        b[ring] = INK
        big = Image.fromarray(b)
        segs.append((big, pad))
    (up, p), (lo, _) = segs
    off = lambda q: (q[0]+p, q[1]+p)
    return dict(up=up, lo=lo, A=off(A), J=off(J), B=off(B),
                up_f=fill_only(up), lo_f=fill_only(lo),
                r_up=ang(J-A), r_lo=ang(B-J), l1=np.linalg.norm(J-A), l2=np.linalg.norm(B-J))

def cut_peg(k, x0, x1, ycut):
    """Bỏ chốt tròn phía trên găng/ủng, giữ nguyên viền miệng cổ."""
    a = np.array(L(k)); a[:ycut, x0:x1, 3] = 0
    # dọn mẩu sót không nối với thân chính
    lab, n = ndimage.label(a[..., 3] > 0)
    if n > 1:
        big = np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n+1))) + 1
        a[lab != big, 3] = 0
    return Image.fromarray(a)

# ---- bộ phận ----
ARM = split(3, A=(107, 32), J=(38, 98), B=(45, 160), r=33)
LEG = split(7, A=(85, 25), J=(66, 96), B=(47, 167), r=50)
GLOVE = cut_peg(5, 15, 100, 47)
BOOT = cut_peg(9, 38, 122, 33)
GLOVE_WRIST = (60, 82)    # tâm cổ tay nằm sâu trong găng
BOOT_ANKLE = (82, 84)     # tâm cổ chân nằm sâu trong ủng

def chain(cv, parts):
    """parts: [(seg_full, seg_fill, M)] – lượt viền rồi lượt màu."""
    for full, _, M in parts: put(cv, full, M)
    for _, fill, M in parts: put(cv, fill, M)

def limb(limbd, root, a_up, a_lo):
    Mu = place(root, a_up - limbd['r_up'], limbd['A'])
    J = app(Mu, limbd['J'])
    Ml = place(J, a_lo - limbd['r_lo'], limbd['J'])
    end = app(Ml, limbd['B'])
    return Mu, Ml, end
