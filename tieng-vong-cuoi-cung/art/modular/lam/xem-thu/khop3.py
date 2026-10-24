"""Khớp chồng lớp v3: dùng bảng chi mới (ống thẳng, đầu tròn ẩn, găng/ủng miệng mở).
Con đè cha ở mỗi khớp: cẳng tay đè cánh tay, găng đè cẳng tay, cẳng chân đè đùi, ủng đè cẳng chân.
Vai dưới capelet, hông dưới vạt áo."""
import math, os, sys, numpy as np
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); OLD = os.path.join(HERE, '..', 'mod')

def defringe(img, grow=1):
    a = np.array(img.convert('RGBA'))
    al = a[..., 3] > 0
    inner = ndimage.binary_erosion(al, iterations=grow)
    edge = al & ~ndimage.binary_erosion(al, iterations=4)
    whiteish = a[..., :3].min(2) > 170
    keep = inner & ~(edge & whiteish)
    a[~keep, 3] = 0
    return Image.fromarray(a)

# lòng miệng ống (toạ độ ảnh gốc): khoét trong suốt để đoạn cha lộ ra như đang chui vào
HOLE = {'cang-tay': (29, 80, 19, 60), 'cang-chan': (29, 76, 19, 57), 'gang': (38, 98, 18, 66), 'ung': (92, 32, 56, 12)}
def LN(n):
    im = defringe(Image.open(os.path.join(HERE, n + '.png')))
    h = HOLE.get(n.rsplit('-', 1)[0])
    if h:
        a = np.array(im); yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
        cx, cy, ax, ay = h
        a[((xx-cx)/ax)**2 + ((yy-cy)/ay)**2 <= 1, 3] = 0
        im = Image.fromarray(a)
    return im
def LO(k): return defringe(Image.open(os.path.join(OLD, f'p{k:02d}.png')))

def T_(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.]])
def R_(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a)); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])
def S_(k): return np.array([[k, 0, 0], [0, k, 0], [0, 0, 1.]])
def ang(v): return math.degrees(math.atan2(v[1], v[0]))
def place(pos, a, piv, k=1.0): return T_(*pos) @ R_(a) @ S_(k) @ T_(-piv[0], -piv[1])
def app(M, p): return (M @ np.array([p[0], p[1], 1.]))[:2]
def put(cv, img, M):
    Mi = np.linalg.inv(M)
    cv.alpha_composite(img.transform(cv.size, Image.AFFINE, tuple(Mi[:2].flatten()), Image.BICUBIC))

K_ARM, K_GLOVE, K_LEG, K_BOOT = 0.38, 0.55, 0.57, 0.72
def seg(img, P, D, k):     # P: khớp gần, D: khớp xa (toạ độ ảnh gốc)
    return dict(img=img, P=P, D=D, k=k, rest=ang(np.subtract(D, P)))
def arm_set(s):
    return dict(up=seg(LN('canh-tay-'+s), (31, 99), (257, 105), K_ARM),
                lo=seg(LN('cang-tay-'+s), (60, 82), (200, 87), K_ARM),
                end=seg(LN('gang-'+s), (55, 100), (150, 98), K_GLOVE))
def leg_set(s):
    return dict(up=seg(LN('dui-'+s), (46, 93), (178, 100), K_LEG),
                lo=seg(LN('cang-chan-'+s), (42, 76), (161, 84), K_LEG),
                end=seg(LN('ung-'+s), (91, 50), (91, 150), K_BOOT))
ARM_A, ARM_B, LEG_A, LEG_B = arm_set('A'), arm_set('B'), leg_set('A'), leg_set('B')

def limb(L, root, a_up, a_lo, a_end):
    """Trả về [(img, M)] theo thứ tự cha → con (con đè cha)."""
    out = []; pos = root
    for part, a in ((L['up'], a_up), (L['lo'], a_lo), (L['end'], a_end)):
        M = place(pos, a - part['rest'], part['P'], part['k'])
        out.append((part['img'], M)); pos = app(M, part['D'])
    return out, pos
def seg_len(part): return np.linalg.norm(np.subtract(part['D'], part['P'])) * part['k']
