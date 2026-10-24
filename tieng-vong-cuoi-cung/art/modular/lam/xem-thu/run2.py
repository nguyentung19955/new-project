"""Lam modular – chạy tại chỗ (cutout, IK 2 đoạn). Giữ nguyên cỡ mọi bộ phận."""
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

L = lambda k: Image.open(f'p{k:02d}.png').convert('RGBA')
OUTLINE = (12, 10, 14, 255)

# ---------- chuẩn bị bộ phận ----------
def head_img():
    a = np.array(L(0)); yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    a[((xx-160)**2 + (yy-322)**2 < 36**2) & (yy >= 304), 3] = 0   # bỏ nút cổ lòi ra
    im = Image.fromarray(a); d = ImageDraw.Draw(im)
    for ex, ey, w, h in [(334, 238, 20, 38), (380, 234, 22, 42)]:
        d.ellipse([ex-w/2-5, ey-h/2-5, ex+w/2+5, ey+h/2+5], fill=(255, 210, 60, 90))
        d.ellipse([ex-w/2, ey-h/2, ex+w/2, ey+h/2], fill=(255, 226, 80, 255))
    return im

def split_leg(k, T, B, r=48):
    """Tách chân liền thành đùi + cẳng tại giữa, bo tròn đầu cắt (không kéo giãn)."""
    src = np.array(L(k)); T = np.array(T, float); B = np.array(B, float)
    M = (T+B)/2; u = (B-T)/np.linalg.norm(B-T)
    yy, xx = np.mgrid[:src.shape[0], :src.shape[1]]
    side = (xx-M[0])*u[0] + (yy-M[1])*u[1]
    col = tuple(int(c) for c in src[int(M[1]), int(M[0]), :3]) + (255,)
    out = []
    for keep in (side < 0, side >= 0):
        a = src.copy(); a[~keep, 3] = 0
        im = Image.fromarray(a); d = ImageDraw.Draw(im)
        d.ellipse([M[0]-r, M[1]-r, M[0]+r, M[1]+r], fill=OUTLINE)
        d.ellipse([M[0]-r+7, M[1]-r+7, M[0]+r-7, M[1]+r-7], fill=col)
        out.append(im)
    return out[0], out[1], tuple(M)

def capelet_overlay(torso):
    a = np.array(torso).astype(int)
    teal = (a[..., 1] > 140) & (a[..., 2] > 110) & (a[..., 0] < 130) & (a[..., 3] > 0)
    yy = np.mgrid[:a.shape[0], :a.shape[1]][0]
    m = ndimage.binary_dilation(teal, iterations=8) & (a[..., 3] > 0) & (yy < 175) & (yy > 40)
    o = a.copy().astype(np.uint8); o[~m, 3] = 0
    return Image.fromarray(o)

HEAD = head_img()
TORSO = L(1); CAPE = capelet_overlay(TORSO)
# chân gần (A) = p07, chân xa (B) = p08
THA, SHA, KA = split_leg(7, (85, 25), (47, 167))
THB, SHB, KB = split_leg(8, (41, 27), (66, 172))
LEGA = dict(th=THA, sh=SHA, T=(85, 25), K=KA, B=(47, 167), boot=L(9))
LEGB = dict(th=THB, sh=SHB, T=(41, 27), K=KB, B=(66, 172), boot=L(10))
BOOT_PEG = (86, 25)
ARM_A = dict(img=L(3), S=(101, 35), H=(34, 165), glove=L(5))
ARM_B = dict(img=L(4), S=(39, 35), H=(105, 165), glove=L(6))   # p04 là ảnh gương của p03
GLOVE_PEG = (58, 20); FIST = (63, 97)
DAGGER = L(11); DAG_GRIP = (110, 60)
BELL = L(12); BELL_TOP = (52, 14)

# đáy đế ủng (điểm mẫu để không xuyên đất)
def sole_pts(img):
    a = np.array(img)[..., 3] > 0
    ys, xs = np.nonzero(a); sel = ys > ys.max() - 25
    return np.stack([xs[sel], ys[sel]], 1).astype(float)
SOLE = {id(LEGA['boot']): sole_pts(LEGA['boot']), id(LEGB['boot']): sole_pts(LEGB['boot'])}

# ---------- toán ----------
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

GROUND = 900
ROOT_X = 470
HIP_Y0 = 680          # vị trí gốc thân (điểm (160,250) của mảnh thân)

# ---------- 8 tư thế mốc cho chân A (chân B lệch 4 mốc) ----------
# x: vị trí cổ chân so với thân (px), lift: nhấc khỏi đất (px), a: góc ủng (+ = mũi chúi xuống)
KEY = [  # 1 tiếp đất · 2 chịu lực · 3 đạp · 4 bay · 5 đá sau · 6 thu gối · 7 đưa gối · 8 vươn
    dict(x=88,  lift=0,  a=-12),
    dict(x=30,  lift=0,  a=0),
    dict(x=-45, lift=4,  a=24),
    dict(x=-85, lift=40, a=40),
    dict(x=-70, lift=96, a=52),
    dict(x=-8,  lift=112, a=24),
    dict(x=62,  lift=70, a=-2),
    dict(x=96,  lift=24, a=-16),
]
BOB = [2, 14, 4, -12, 2, 14, 4, -12]       # thân hạ khi chịu lực, cao nhất lúc bay
STANCE = [True, True, True, False, False, False, False, False]

def cr(p0, p1, p2, p3, t):
    return 0.5*((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t*t + (-p0+3*p1-3*p2+p3)*t**3)
def sample(arr, ph):          # ph trong [0,8)
    i = int(math.floor(ph)) % 8; t = ph - math.floor(ph)
    return cr(arr[(i-1) % 8], arr[i], arr[(i+1) % 8], arr[(i+2) % 8], t)
def key(ph, f): return sample([k[f] for k in KEY], ph)

def boot_low(boot, a, ankle):
    M = place(ankle, a, BOOT_PEG)
    P = SOLE[id(boot)]
    return max(app(M, p)[1] for p in P[::7])

def ik(hip, ank, l1, l2):
    d = np.array(ank) - np.array(hip); D = min(np.linalg.norm(d), l1+l2-0.5)
    base = math.atan2(d[1], d[0])
    c = (l1*l1 + D*D - l2*l2) / (2*l1*D); c = max(-1, min(1, c))
    a1 = base - math.acos(c)          # gối hướng về trước (phải)
    knee = np.array(hip) + l1*np.array([math.cos(a1), math.sin(a1)])
    return knee

def leg_pose(leg, hip, ph, dx):
    x, lift, a = key(ph, 'x'), max(0, key(ph, 'lift')), key(ph, 'a')
    # đặt cổ chân sao cho điểm thấp nhất đế ủng = mặt đất - lift
    ank = np.array([ROOT_X + x + dx, 0.])
    low = boot_low(leg['boot'], a, ank)
    ank[1] = GROUND - lift - low
    T, K, B = map(np.array, (leg['T'], leg['K'], leg['B']))
    l1, l2 = np.linalg.norm(K-T), np.linalg.norm(B-K)
    if np.linalg.norm(ank-np.array(hip)) > l1+l2: print('kéo căng', round(ph,2), round(np.linalg.norm(ank-np.array(hip))-l1-l2,1))
    knee = ik(hip, ank, l1, l2)
    rth = ang(K-T); rsh = ang(B-K)
    Mth = place(hip, ang(knee-hip) - rth, leg['T'])
    Msh = place(knee, ang(ank-knee) - rsh, leg['K'])
    Mb = place(ank, a, BOOT_PEG)
    return Mth, Msh, Mb

def frame(ph, guide=False):
    bob = sample(BOB, ph)
    lean = 9 + 1.5*math.sin(ph/8*4*math.pi)
    root = (ROOT_X, HIP_Y0 + bob)
    Mt = place(root, lean, (160, 250))
    hipA = app(Mt, (190, 232)); hipB = app(Mt, (135, 232))
    thA, shA, bA = leg_pose(LEGA, hipA, ph, 8)
    thB, shB, bB = leg_pose(LEGB, hipB, (ph+4) % 8, -18)
    # tay: vung ngược chân cùng bên (A gần ↔ tay gần)
    w = ph/8*2*math.pi
    armA = 98 + 32*math.cos(w)            # chân A trước (mốc 1) → tay A ra sau
    armB = 100 - 58*math.cos(w)
    def arm(A, sh_pt, a_world):
        r = ang(np.array(A['H'])-np.array(A['S']))
        Ma = place(app(Mt, sh_pt), a_world - r, A['S'])
        hand = app(Ma, A['H'])
        Mg = place(hand, (a_world-90)*0.35, GLOVE_PEG)
        return Ma, Mg
    MaA, MgA = arm(ARM_A, (175, 108), armA)
    MaB, MgB = arm(ARM_B, (130, 104), armB)
    Md = MgA @ T_(*FIST) @ R_(-25) @ T_(-DAG_GRIP[0], -DAG_GRIP[1])   # dao gắn cứng vào nắm tay
    # đầu: nhún ít hơn thân, trễ nhẹ
    hb = sample(BOB, (ph-0.6) % 8)*0.5 - bob
    Mh = Mt @ T_(165, 45+hb) @ R_(-lean*0.55 + 1.5*math.sin(w*2-0.8)) @ T_(-245, -300)
    Mbell = Mt @ T_(226, 42) @ R_(-lean + 14*math.sin(w*2-1.4)) @ T_(-BELL_TOP[0], -BELL_TOP[1])

    cv = Image.new('RGBA', (1000, 1000), (0, 0, 0, 0))
    layers = [  # xa → gần, cố định suốt chu kỳ
        (MaB, ARM_B['img']), (MgB, ARM_B['glove']),
        (shB, LEGB['sh']), (thB, LEGB['th']), (bB, LEGB['boot']),
        (shA, LEGA['sh']), (thA, LEGA['th']), (bA, LEGA['boot']),
        (Mt, TORSO), (Mh, HEAD), (Mbell, BELL),
        (MaA, ARM_A['img']), (Md, DAGGER), (MgA, ARM_A['glove']), (Mt, CAPE),
    ]
    for M, img in layers: put(cv, img, M)
    return cv

if __name__ == '__main__':
    BG = (233, 238, 244, 255)
    N = 24
    fr = [frame(i*8/N) for i in range(N)]
    bb = [f.getbbox() for f in fr]
    box = (min(b[0] for b in bb)-30, min(b[1] for b in bb)-20, max(b[2] for b in bb)+30, GROUND+30)
    print('box', box, [max(b[3] for b in bb)])
    k = 440/(box[3]-box[1])
    def fin(f, label=None):
        c = Image.new('RGBA', f.size, BG); d = ImageDraw.Draw(c)
        d.line([0, GROUND, f.width, GROUND], fill=(150, 140, 130, 255), width=4)
        c.alpha_composite(f); c = c.crop(box)
        c = c.resize((round(c.width*k), round(c.height*k)), Image.LANCZOS)
        if label:
            ImageDraw.Draw(c).text((8, 6), label, fill=(60, 60, 60),
                                   font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18))
        return c
    out = [fin(f) for f in fr]
    pal = [o.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255) for o in out]
    dur = [30, 20, 30]*8
    pal[0].save('lam-chay-v2.gif', save_all=True, append_images=pal[1:], duration=dur, loop=0)
    # chậm ×4 để soi
    pal[0].save('lam-chay-v2-cham.gif', save_all=True, append_images=pal[1:], duration=[100]*N, loop=0)
    names = ['1 tiếp đất', '2 chịu lực', '3 đạp đất', '4 bay', '5 đá sau', '6 thu gối', '7 đưa gối', '8 vươn tới']
    ks = [fin(frame(i), f'{names[i]}') for i in range(8)]
    W, H = ks[0].size
    sh = Image.new('RGB', (W*4+50, H*2+30), (255, 255, 255))
    for i, c in enumerate(ks): sh.paste(c.convert('RGB'), (10+(i % 4)*(W+10), 10+(i//4)*(H+10)))
    sh.save('lam-chay-v2-8-tu-the.png')
