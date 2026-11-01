# Phòng demo kiểu TỔ KIẾN: nhiều hang nối bằng đường hầm và giếng đứng, khám phá theo vòng.
import json, random, numpy as np
from PIL import Image
random.seed(7)
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../art/phong-demo/')
os.chdir(os.path.dirname(os.path.abspath(__file__)))
T, C, R = 16, 80, 42
g = [['#'] * C for _ in range(R)]
def dao(c0, c1, r0, r1):
    for r in range(max(0, r0), min(R, r1 + 1)):
        for c in range(max(0, c0), min(C, c1 + 1)): g[r][c] = '.'
def dac(c0, c1, r0, r1):
    for r in range(r0, r1 + 1):
        for c in range(c0, c1 + 1): g[r][c] = '#'
def hang(c0, c1, r0, r1, vom=2):
    dao(c0, c1, r0, r1)
    for k in range(vom):
        w = vom - k
        dac(c0, c0 + w - 1, r0 + k, r0 + k); dac(c1 - w + 1, c1, r0 + k, r0 + k)
hang(2, 20, 3, 15, 4)                      # A lối vào
dao(20, 31, 10, 15); dao(30, 34, 12, 17)   # hầm A→B
hang(32, 58, 3, 17, 5)                     # B đại sảnh chuông
dao(52, 58, 18, 31)                        # giếng B→C
hang(24, 64, 30, 38, 3); dao(6, 24, 31, 38)   # C hang dưới
dao(8, 13, 16, 31)                         # giếng leo C→A
dao(64, 70, 33, 38); hang(68, 78, 23, 38, 3)  # hầm C→D + D phòng cổng
dao(58, 68, 9, 14); hang(66, 78, 3, 14, 3)    # nhánh E
dac(0, 79, 39, 41)
PL = [(14, 37, 40), (11, 49, 52), (8, 40, 42), (16, 55, 56), (22, 53, 54), (26, 57, 58), (28, 11, 12), (24, 8, 9), (20, 11, 12), (32, 70, 72), (34, 44, 46),
      (36, 40, 41), (36, 74, 76)]   # bậc phụ: lên bệ giữa hang C, lên bệ cao phòng cổng D
DAY_COT = {26, 47, 64, 61, 16}
PL = [(r, c0, c1) for r, c0, c1 in PL]
for r, c0, c1 in PL: dac(c0, c1, r, r)
PLAT = {(r, c) for r, c0, c1 in PL for c in range(c0, c1 + 1)}
DAY_LEO = [(26, 4, 15), (47, 4, 17), (64, 24, 38), (61, 9, 13), (16, 30, 38),   # (cột, hàng đầu, hàng cuối)
           (13, 16, 38),    # rễ rủ từ miệng giếng A (sát mép phải giếng) xuống tận sàn C: leo về lối vào
           (52, 18, 38)]    # rễ rủ từ miệng giếng B (sát mép trái giếng) xuống tận sàn C: leo về đại sảnh chuông
for c, r0, r1 in DAY_LEO:
    o = [r for r in range(r0, r1 + 1) if g[r][c] != '#']
    for r in o:
        if g[r][c] == '.': g[r][c] = 'H'
    # dây chỉ được là một đoạn liền (không xuyên qua bệ/đá)
    assert all(b - a == 1 for a, b in zip(o, o[1:])), f'dây cột {c} xuyên qua đá/bệ'
S = lambda c, r: c < 0 or c >= C or r >= R or (r >= 0 and g[r][c] == '#')
ld = lambda f: Image.open(f).convert('RGBA')
def dim(im, k):
    a = np.array(im).astype(float); a[..., :3] *= k; return Image.fromarray(a.clip(0, 255).astype(np.uint8))
fill, top, ceil = ld('t_fill.png'), ld('t_top.png'), ld('t_ceil.png')
W, H = C * T, R * T
canh = Image.new('RGBA', (W, H)); truoc = Image.new('RGBA', (W, H))
emp = np.array([[not S(c, r) for c in range(C)] for r in range(R)])
from scipy import ndimage
dist = ndimage.distance_transform_cdt(~emp, metric='taxicab')
fa = np.array(fill).astype(float)
isP = lambda c, r: (r, c) in PLAT
# ĐÁ: tô liền theo từng điểm ảnh (không theo ô) để vách hoà vào bóng tối, không lộ khối vuông
solid0 = np.kron((~emp) & ~np.array([[isP(c, r) for c in range(C)] for r in range(R)]), np.ones((T, T), bool))
rng = np.random.default_rng(3)
def nhieu(sig):
    z = ndimage.gaussian_filter(rng.random((H, W)), sig); return (z - z.mean()) / (z.std() + 1e-6)
field = ndimage.gaussian_filter(solid0.astype(float), 6) + nhieu(5) * 0.16 + nhieu(16) * 0.3
mask = field > 0.5
# giữ mặt sàn phẳng (chân đứng đúng), trừ gần góc
sanTren = solid0 & ~np.roll(solid0, 1, 0)                      # điểm đầu tiên của mặt sàn
dai = np.zeros_like(solid0)
for k in range(-5, 7): dai |= np.roll(sanTren, k, 0)
ganGoc = ndimage.binary_dilation(solid0 & ~(np.roll(solid0, 1, 1) & np.roll(solid0, -1, 1)), iterations=14)
giu = dai & ~ganGoc
mask = np.where(giu, solid0, mask)
mask = np.where(solid0 & (ndimage.distance_transform_edt(solid0) > 12), True, mask)
mask = np.where(~solid0 & (ndimage.distance_transform_edt(~solid0) > 5), False, mask)
mask |= solid0   # KHÔNG BAO GIỜ khoét vào ô va chạm: mép đá nhìn thấy luôn trùm ra ngoài hộp va chạm (bám tường không bị 'bám vào không khí')
_l, _n = ndimage.label(mask); _s = ndimage.sum(np.ones_like(_l), _l, range(1, _n + 1)); mask &= ~np.isin(_l, np.nonzero(_s < 600)[0] + 1)   # bỏ đảo đá vụn
_l, _n = ndimage.label(~mask); _s = ndimage.sum(np.ones_like(_l), _l, range(1, _n + 1)); mask |= np.isin(_l, np.nonzero(_s < 600)[0] + 1)    # lấp lỗ nhỏ
d = ndimage.distance_transform_edt(mask)                       # khoảng cách tới khoảng trống (px)
toi = np.clip(1 - d / 120.0, 0.0, 1.0) ** 1.2                    # sáng ở mép, chìm dần vào đen
toi = toi * (0.85 + 0.15 * nhieu(14)) 
k = (0.10 + 0.70 * toi) * 0.95
YY, XX = np.mgrid[0:H, 0:W]
a = np.zeros((H, W, 4), np.uint8)
tex = fa[YY % 64, XX % 64, :3]
a[..., :3] = np.clip(tex * k[..., None], 0, 255).astype(np.uint8)
a[..., 3] = np.where(mask, 255, 0)
# mép: dải tối 2px + viền trên/dưới (cỏ rễ, rủ trần) đặt theo mép THẬT
sang = mask & ~ndimage.binary_erosion(mask, iterations=7)          # dải mép sáng rõ để thấy chỗ bám
a[sang, :3] = np.clip(a[sang, :3].astype(float) * 1.35 + 6, 0, 255).astype(np.uint8)
vien = mask & ~ndimage.binary_erosion(mask, iterations=2)
a[vien, :3] = (a[vien, :3] * .55).astype(np.uint8)
e2 = ndimage.binary_erosion(mask, iterations=2); ria = e2 & ~ndimage.binary_erosion(mask, iterations=4)   # đường viền sáng ấm (mép đá bắt ánh đèn)
a[ria, :3] = np.clip(a[ria, :3].astype(float) * 0.5 + np.array([92, 58, 50]) * 0.9, 0, 255).astype(np.uint8)
canh = Image.fromarray(a)
topA, ceilA = np.array(top), np.array(ceil)
for x in range(0, W, 1):
    col = mask[:, x]
    for y in range(1, H):
        if col[y] and not col[y - 1]:   # mặt sàn
            seg = topA[30:64, x % 64]; h = seg.shape[0]
            y0 = y - 2; 
            for j in range(h):
                yy = y0 + j
                if 0 <= yy < H and seg[j, 3] > 0 and (mask[yy, x] or j < 6): a[yy, x] = seg[j]
        if not col[y] and col[y - 1]:   # đáy trần
            seg = ceilA[0:36, x % 64]
            for j in range(36):
                yy = y - 18 + j
                if 0 <= yy < H and seg[j, 3] > 0: 
                    c = seg[j].astype(float); c[:3] *= .8; a[yy, x] = c.astype(np.uint8)
lab, nlab = ndimage.label(a[..., 3] > 0)
sz = ndimage.sum(np.ones_like(lab), lab, range(1, nlab + 1))
nho = np.isin(lab, np.nonzero(sz < 60)[0] + 1); a[nho, 3] = 0
canh = Image.fromarray(a)
# bệ rễ nổi (theo từng đoạn ngang)
plats = ['plat_1', 'plat_3', 'plat_2', 'plat_5']
segs = {}
for (r, c) in sorted(PLAT): segs.setdefault(r, []).append(c)
i = 0
for r, cs in segs.items():
    run = [cs[0]]
    for c in cs[1:] + [None]:
        if c is not None and c == run[-1] + 1: run.append(c); continue
        p = ld(plats[i % 4] + '.png'); w = len(run) * T; i += 1
        p = p.resize((w, max(8, round(p.height * w / p.width))), Image.NEAREST)
        canh.alpha_composite(p, (run[0] * T, r * T - 3))
        if c is not None: run = [c]
def matSan(x, y):   # dò mép đá thật (sau khi bo mép) quanh y: trả y mặt sàn
    x = max(0, min(W - 1, x)); y = max(0, min(H - 1, y))
    while y < H - 1 and not mask[y, x]: y += 1
    while y > 0 and mask[y - 1, x]: y -= 1
    return y
def matTran(x, y):  # y đáy trần thật
    x = max(0, min(W - 1, x)); y = max(1, min(H - 1, y))
    while y > 1 and not mask[y - 1, x]: y -= 1
    while y < H - 1 and mask[y, x]: y += 1
    return y
def dat(n, c, r_san, k=.85):
    p = dim(ld(n + '.png'), k); x = c * T + 8; ys = matSan(x, r_san * T)
    canh.alpha_composite(p, (x - p.width // 2, ys - p.height + 2))
def treo(n, c, r_tran, k=.8, lop=None, s=1.0):
    p = dim(ld(n + '.png'), k)
    if s != 1: p = p.resize((round(p.width * s), round(p.height * s)), Image.NEAREST)
    x = c * T + 8; yt = matTran(x, (r_tran + 1) * T)
    (lop or canh).alpha_composite(p, (x - p.width // 2, yt - 4))
# đạo cụ sàn
dat('p_den_tho', 4, 16, 1.0); dat('p_bia', 17, 16, .7); dat('p_chuong_nho', 25, 16, .7)
dat('p_chuong_nghieng', 50, 18, .72); dat('p_manh_chuong', 36, 18, .7)
dat('p_mat_na', 28, 39, .75); dat('p_gia_gay', 40, 39, .62); dat('p_den_tho', 60, 39, .95); dat('p_chuong_up', 18, 39, .6)
dat('p_bia', 72, 39, .65); dat('p_den_tho', 74, 15, .95); dat('p_chuong_nho', 77, 15, .75)
# treo từ trần: tự tìm ô trần (đặc, ô dưới trống) cách nhau
HANGS = ['h_vai_dai', 'h_re_bo', 'h_xich', 'h_day_leo', 'h_vai_chuong', 'h_re_mat_na', 'h_re_bo', 'h_day_leo']
last = -9; j = 0
cands = [(c, r) for c in range(C) for r in range(R - 1) if S(c, r) and not S(c, r + 1) and not S(c, r + 2) and not S(c, r + 3) and not isP(c, r)]
used = []
for c, r in cands:
    if any(abs(c - uc) < 4 and abs(r - ur) < 4 for uc, ur in used) or random.random() < .45: continue
    used.append((c, r)); treo(HANGS[j % len(HANGS)], c, r, .55 + random.random() * .2); j += 1
treo('h_long_den', 62, 8, .95)
# lớp trước: vài bóng rễ gần như đen
for c, r in random.sample(used, min(6, len(used))): treo('h_day_leo', c + 1, r, .18, truoc, 1.4)
# dây leo (vẽ theo cột 'H')
vt, vm1, vm2, vb = [ld(n + '.png') for n in ('v_top', 'v_mid1', 'v_mid2', 'v_bot')]
for c, r0, r1 in DAY_LEO:
    cs = [r for r in range(r0, r1 + 1) if g[r][c] == 'H']
    if not cs: continue
    y0, y1 = cs[0] * T - 6, (cs[-1] + 1) * T; x = c * T + 8 - vm1.width // 2
    canh.alpha_composite(dim(vt, .85), (c * T + 8 - vt.width // 2, y0 - 20))
    y = y0 + vt.height - 22; k = 0
    while y < y1 - vb.height + 6:
        canh.alpha_composite(dim(vm1 if k % 2 == 0 else vm2, .85), (x, y)); y += vm1.height - 1; k += 1
    canh.alpha_composite(dim(vb, .85), (c * T + 8 - vb.width // 2, y))
# hài cốt rải rác (sk_0 lồng treo; còn lại đặt trên sàn)
for n, c, r, k in [(4, 9, 16, .8), (3, 21, 16, .75), (6, 33, 18, .75), (1, 42, 18, .7), (7, 19, 39, .7), (5, 31, 39, .75), (2, 48, 39, .7), (4, 57, 39, .8), (3, 70, 39, .7), (6, 76, 15, .7), (1, 12, 39, .65), (7, 63, 15, .65)]:
    dat(f'sk_{n}', c, r, k)
treo('sk_0', 38, 2, .8); treo('sk_0', 22, 29, .7)
canh.save(OUT + 'canh.png'); truoc.save(OUT + 'truoc.png')
den = [[4 * T + 8, 16 * T - 40, 1.0], [45 * T, 9 * T, .8], [60 * T + 8, 39 * T - 40, .9], [74 * T + 8, 15 * T - 40, .9], [62 * T + 8, 9 * T + 40, .8], [16 * T, 36 * T, .55], [76 * T, 34 * T, .6], [10 * T, 22 * T, .45]]
quai = [{'loai':'cau','cot':22,'tu':15,'den':28,'hang':16},{'loai':'ken','cot':40,'tu':34,'den':47,'hang':18},
 {'loai':'vai','cot':50,'tu':44,'den':56,'cao':110,'hang':18},{'loai':'cau','cot':68,'tu':62,'den':77,'hang':15},
 {'loai':'vai','cot':22,'tu':17,'den':28,'cao':90,'hang':39},{'loai':'cau','cot':34,'tu':30,'den':40,'hang':39},
 {'loai':'tang','cot':45,'tu':45,'den':45,'cao':50,'hang':39},{'loai':'ken','cot':58,'tu':52,'den':63,'hang':39},
 {'loai':'tan','cot':72,'tu':68,'den':77,'hang':39}]
man = {'o_diem': 16, 'o_logic': 48, 'cot': C, 'hang': R, 'xuat_phat_cot': 5, 'xuat_phat_hang': 16,
       'luoi': [''.join(row) for row in g], 'den': den, 'chuong': [45 * T, 5 * T], 'cong': [77 * T + 8, 39 * T], 'quai': quai,
       'ghi_chu': "Tổ kiến: A lối vào → hầm → B đại sảnh chuông → giếng xuống C hang dưới → D phòng cổng; giếng leo C→A; nhánh E phía trên. '#' = đặc."}
json.dump(man, open(OUT + 'man.json', 'w'), ensure_ascii=False, indent=1)
print('\n'.join(man['luoi']))
