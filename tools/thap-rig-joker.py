# TURRET MERGE — tách lớp rig trùm JOKER KING từ ảnh gốc (09/11, tuvan/anim-rig).
# Chạy: python3 tools/thap-rig-joker.py thap/assets thap/assets  → trum_joker_king_r_{shadow,inside,spring,body,lid,glow_body,glow_lid}.png
# In ra sourceRectUV (theo khung gốc 394×394) để chép vào thap/assets/rig/joker_king.rig.json.
import sys, json, numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
B = np.array(Image.open(src + '/trum_joker_king_m.png').convert('RGBA')).astype(np.int32)
N = np.array(Image.open(src + '/trum_joker_king_m_nap.png').convert('RGBA')).astype(np.int32)
H, W = B.shape[:2]
r, g, b, a = B[..., 0], B[..., 1], B[..., 2], B[..., 3]
op = a > 8
pur = op & (b > g + 15) & (r > g)
brn = op & (r > 35) & (r > 2.2 * g) & (b <= g + 2) & (r < 140)
dark = op & (np.maximum(np.maximum(r, g), b) < 45)
# 1) mép trên thành trước theo cột: điểm tím/nâu thấp nhất + 1
ft = np.full(W, H, int); top = np.full(W, H, int)
for x in range(W):
    col = op[:, x]
    if not col.any(): continue
    top[x] = np.argmax(col)
    ys = np.where((pur | brn)[:int(H * 0.74), x])[0]
    ft[x] = ys.max() + 1 if len(ys) else top[x]
front = op.copy()
for x in range(W): front[:ft[x], x] = False
above = op & ~front
# 2) lò xo: tím + viền tối sát tím (giãn 3 px), chỉ ở phía trên thành trước
from scipy.ndimage import binary_dilation, label
pd = binary_dilation(pur, iterations=3)
spring = above & (pur | (dark & pd))
lb, n = label(spring); 
if n > 1:  # giữ khối lớn nhất (lò xo), bỏ đốm lẻ
    sz = np.bincount(lb.ravel()); sz[0] = 0; spring = lb == sz.argmax()
spring = binary_dilation(spring, iterations=1) & above
pc = np.where((pur & above).sum(0) > 6)[0]
xm = np.zeros(W, bool); xm[pc.min():pc.max() + 1] = True
spring &= xm[None, :]
spring &= ~((r > 120) & (g > 60) & (b < 100))  # bỏ mẩu vành vàng dính lò xo
inside = above & ~spring
# 3) overdraw lòng hộp: nội suy theo hàng giữa 2 mép ngoài vùng lò xo
I = B.copy(); I[~inside] = 0
ys, xs = np.where(spring)
for y in range(ys.min(), ys.max() + 1):
    row = np.where(spring[y])[0]
    if not len(row): continue
    x0, x1 = row.min() - 1, row.max() + 1
    L = [x for x in range(x0, max(0, x0 - 6), -1) if inside[y, x]]
    R = [x for x in range(x1, min(W, x1 + 6)) if inside[y, x]]
    if not L or not R: continue
    cl, cr = B[y, L[0]], B[y, R[0]]
    for x in range(L[0] + 1, R[0]):
        if inside[y, x]: continue
        u = (x - L[0]) / (R[0] - L[0]); I[y, x] = (cl * (1 - u) + cr * u).astype(np.int32); I[y, x, 3] = 255
Fr = B.copy(); Fr[~front] = 0
Sp = B.copy(); Sp[~spring] = 0
# lò xo: kéo dài chân xuống 10 px (giấu sau thành trước) → giãn/nén không hở khe
for x in range(W):
    c = np.where(spring[:, x])[0]
    if len(c):
        y1 = c.max()
        for k in range(1, 11):
            if y1 + k < H: Sp[y1 + k, x] = Sp[y1, x]
def gem(A, m):
    G = np.zeros_like(A); G[m] = A[m]; G[..., 3] = np.where(m, 255, 0)
    im = Image.fromarray(G.astype(np.uint8), 'RGBA')
    halo = im.filter(ImageFilter.GaussianBlur(4)); hp = np.array(halo).astype(np.float32)
    hp[..., 3] *= 0.85; core = np.array(im).astype(np.float32)
    o = hp.copy(); al = core[..., 3:4] / 255
    o[..., :3] = core[..., :3] * al + hp[..., :3] * (1 - al); o[..., 3] = np.maximum(hp[..., 3], core[..., 3] * 0.9)
    return o.clip(0, 255).astype(np.uint8)
def gm(A):
    rr, gg, bb, aa = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
    red = (aa > 8) & (rr > 200) & (gg < 90) & (bb < 90)
    return red
zb = np.zeros_like(op); zb[int(H*0.74):, int(W*0.27):int(W*0.73)] = True
yz = np.zeros_like(op); yz[int(H*0.76):int(H*0.92), int(W*0.43):int(W*0.57)] = True  # ngọc vàng giữa
gb = ((gm(B) & zb) | (yz & (r > 240) & (g > 200) & (b < 170))) & front
zl = np.zeros_like(op); zl[:, int(W*0.3):int(W*0.7)] = True
gl = gm(N) & zl
layers = {'inside': I, 'spring': Sp, 'body': Fr, 'lid': N, 'glow_body': gem(B, gb), 'glow_lid': gem(N, gl)}
# bóng: bóng mặt đất từ dáng đáy hộp (dẹt 0.32), mờ — dựng từ alpha ảnh gốc
sil = (op | (N[..., 3] > 8)).astype(np.uint8) * 255
bx = np.where(op.any(0))[0]; wsh = bx.max() - bx.min()
sh = Image.new('L', (W, H), 0)
ell = Image.fromarray((op[int(H*0.62):, :]).astype(np.uint8) * 255).resize((W, int(wsh * 0.3)))
sh.paste(ell, (0, int(H * 0.975 - wsh * 0.15)))
sh = sh.filter(ImageFilter.GaussianBlur(6))
S = np.zeros((H, W, 4), np.uint8); S[..., 3] = (np.array(sh) * 0.6).astype(np.uint8)
layers['shadow'] = S
meta = {}
for k, A in layers.items():
    im = Image.fromarray(np.asarray(A).astype(np.uint8), "RGBA"); bb = im.getbbox()
    if bb is None: print("EMPTY", k); continue
    pad = 2; bb = (max(0, bb[0]-pad), max(0, bb[1]-pad), min(W, bb[2]+pad), min(H, bb[3]+pad))
    im.crop(bb).save(f'{out}/trum_joker_king_r_{k}.png', optimize=True)
    meta[k] = [round(bb[0]/W, 4), round(bb[1]/H, 4), round((bb[2]-bb[0])/W, 4), round((bb[3]-bb[1])/H, 4)]
sy = np.where(spring.any(1))[0]
meta['_spring_y'] = [round(sy.min()/H, 4), round(sy.max()/H, 4)]
meta['_front_mid'] = round(ft[W//2]/H, 4)
nb = np.where((N[..., 3] > 8).any(1))[0]; meta['_lid_y'] = [round(nb.min()/H, 4), round(nb.max()/H, 4)]
meta['_box_bottom'] = round(np.where(op.any(1))[0].max()/H, 4)
print(json.dumps(meta))
