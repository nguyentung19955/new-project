"""Cắt ảnh gốc Mộc Tinh pha 2 / pha 3 (lưới 8x4) thành tệp sprite game.
Dùng: python3 moctinh_pha.py <anh-goc.png> <hong|xanh> <tep-ra.sprite.json> <ma> <ten>
Khung 168x140, net 2 (tấm 2688x1120), điểm chân [84,136], cỡ thân khớp pha 1 (mocTinh.sprite.json).
"""
import sys, os, json, base64, io
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = '/home/claude/new-project'
src, nen, out, ma, ten = sys.argv[1:6]
SO = [6, 4, 6, 4]
TEN = ['idle', 'tele', 'atk', 'hit']
GIAY = {'idle': 1.4, 'tele': 0.7, 'atk': 0.6, 'hit': 0.3}
FW, FH, GX, GY, N = 168, 140, 84, 136, 2
MAU = 24
A = np.array(Image.open(src).convert('RGB')).astype(int)
H, W, _ = A.shape
r, g, b = A[..., 0], A[..., 1], A[..., 2]
if nen == 'hong':
    isbg = (r > 150) & (b > 150) & (g < 110)
    def tint(c):  # điểm ám hồng tím ở mép
        R, G, B = c[..., 0], c[..., 1], c[..., 2]
        return (B > G + 50) & (R > G + 50)
else:
    isbg = (b > 150) & (r < 100) & (g < 100)
    def tint(c):  # điểm ám xanh dương ở mép (không đụng tím: tím có đỏ cao)
        R, G, B = c[..., 0], c[..., 1], c[..., 2]
        return (B > R + 60) & (B > G + 60)
# vạch lưới = cột/hàng gần như không có nền
def lines(nonbg, n, L):
    idx = np.where(nonbg > 0.9)[0]
    gs = []
    for x in idx:
        if gs and x - gs[-1][1] <= 3: gs[-1][1] = x
        else: gs.append([x, x])
    c = [(a + e) // 2 for a, e in gs]
    # chỉ giữ vạch gần vị trí đều nhau
    want = [round(i * (L - 1) / n) for i in range(n + 1)]
    res = []
    for w in want:
        near = [x for x in c if abs(x - w) < L / n / 6]
        res.append(min(near, key=lambda x: abs(x - w)) if near else w)
    return res
cols = lines((~isbg).mean(0), 8, W); rows = lines((~isbg).mean(1), 4, H)
print('cols', cols, 'rows', rows)
def cell(rr, cc):
    x0, x1, y0, y1 = cols[cc] + 4, cols[cc + 1] - 3, rows[rr] + 4, rows[rr + 1] - 3
    c = A[y0:y1, x0:x1].copy()
    bg = isbg[y0:y1, x0:x1].copy()
    # nền nối với mép ô + loang qua điểm ám màu nền
    t = tint(c)
    for _ in range(3):
        nb = ndimage.binary_dilation(bg) & t
        bg |= nb
    al = ~bg
    # lấp lỗ nhỏ kín bằng màu lân cận
    holes = ndimage.binary_fill_holes(al) & ~al
    lab, n = ndimage.label(holes)
    sz = ndimage.sum(holes, lab, range(1, n + 1)) if n else []
    small = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < 30])
    if small.any():
        idx = ndimage.distance_transform_edt(~al, return_distances=False, return_indices=True)
        c[small] = c[idx[0][small], idx[1][small]]
        al = al | small
    lab, n = ndimage.label(al); sz = ndimage.sum(al, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= 20])
    # mép còn ám màu nền -> màu tối của viền
    edge = keep & ~ndimage.binary_erosion(keep, iterations=2)
    fr = edge & t
    c[fr] = V
    return c, keep, int(small.sum()), int(fr.sum())
V = np.array([30, 20, 16])
cells = {(rr, cc): cell(rr, cc) for rr in range(4) for cc in range(SO[rr])}
# cỡ thân: khớp chiều cao khung đứng đầu của pha 1 (131 điểm ở net 1)
_, k0, _, _ = cells[(0, 0)]; ys, xs = np.where(k0)
h0 = ys.max() - ys.min() + 1
s = (131 * N) / h0
cx0 = (xs.min() + xs.max() + 1) / 2
print('idle h0', h0, 'w0', xs.max() - xs.min() + 1, 'scale', round(s, 3), '-> rong', round((xs.max() - xs.min() + 1) * s / N))
sheet = np.zeros((FH * N * 4, FW * N * 8, 4), np.uint8)
dt = {}; lap = vien = cut = 0
for rr in range(4):
    gnd = max(np.where(cells[(rr, cc)][1])[0].max() for cc in range(SO[rr])) + 1
    for j in range(SO[rr]):
        rgb, k, nl, nv = cells[(rr, j)]; lap += nl; vien += nv
        im = Image.fromarray(np.dstack([rgb.astype(np.uint8), (k * 255).astype(np.uint8)]), 'RGBA')
        nw, nh = round(im.width * s), round(im.height * s)
        sm = np.array(im.resize((nw, nh), Image.NEAREST))
        oy = rr * FH * N + (GY * N + 1) - round(gnd * s)
        ox = j * FW * N + GX * N - round(cx0 * s)
        fx0, fx1 = j * FW * N + 1, (j + 1) * FW * N - 1; fy0, fy1 = rr * FH * N + 1, (rr + 1) * FH * N - 1
        ys2, xs2 = np.where(sm[..., 3] > 0)
        X, Y = ox + xs2, oy + ys2
        ok = (X >= fx0) & (X < fx1) & (Y >= fy0) & (Y < fy1); cut += int((~ok).sum())
        sheet[Y[ok], X[ok]] = sm[ys2[ok], xs2[ok]]
    a = {'hang': rr, 'so': SO[rr], 'giay': GIAY[TEN[rr]]}
    if TEN[rr] == 'idle': a['lap'] = True
    dt[TEN[rr]] = a
al = sheet[..., 3] > 0
nb = ndimage.binary_dilation(al) & ~al
sheet[nb] = np.r_[V, 255]
# giảm màu: bảng 24 màu lấy từ điểm thân, không hoà trộn (dither)
body = sheet[sheet[..., 3] > 0][:, :3]
# giữ riêng vài màu điểm nhấn hiếm (giọt độc xanh lá ở pha 3) để không bị nuốt
bi = body.astype(int)
xanh_la = (bi[:, 1] > bi[:, 0] + 40) & (bi[:, 1] > bi[:, 2] + 30)
NA = 3 if (nen == 'xanh' and xanh_la.sum() > 200) else 0
def mc(px, k):
    im = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), 'RGB').quantize(k, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    c = np.array(im.getpalette()[:k * 3]).reshape(-1, 3).astype(float)
    # tinh chỉnh vài vòng k-means để màu bảng sát màu thật (gỗ nâu không ngả xám)
    rng = np.random.default_rng(1); sm = px[rng.choice(len(px), min(len(px), 120000), replace=False)].astype(float)
    for _ in range(8):
        lab = ((sm[:, None] - c[None]) ** 2).sum(-1).argmin(1)
        for i in range(k):
            if (lab == i).any(): c[i] = sm[lab == i].mean(0)
    return np.round(c).astype(int)
pal = mc(body[~xanh_la] if NA else body, MAU - NA)
if NA: pal = np.vstack([pal, mc(body[xanh_la], NA)])
pal_im = Image.new('P', (1, 1)); pal_im.putpalette(list(pal.flatten()) + [0, 0, 0] * (256 - MAU))
# gán màu gần nhất (không dither)
px = sheet[..., :3].reshape(-1, 3).astype(int)
qi = np.zeros(len(px), np.int64)
for i0 in range(0, len(px), 400000):
    dd = ((px[i0:i0 + 400000, None, :] - pal[None, :, :]) ** 2).sum(-1); qi[i0:i0 + 400000] = dd.argmin(1)
qi = qi.reshape(sheet.shape[:2])
m = sheet[..., 3] > 0
print('sai màu TB', round(float(np.sqrt(((pal[qi[m]] - sheet[..., :3][m].astype(int)) ** 2).sum(-1)).mean()), 1))
# bảng có ô trong suốt: chỉ số MAU
qi[sheet[..., 3] == 0] = MAU
P = Image.fromarray(qi.astype(np.uint8), 'P')
P.putpalette(list(pal.flatten()) + [0, 0, 0] * (256 - MAU))
bio = io.BytesIO(); P.save(bio, 'PNG', optimize=True, transparency=MAU)
d = json.load(open(f'{ROOT}/game/art/custom/{ma}.sprite.json'))
d['ma'] = ma; d['ten'] = ten
d['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(); d['dong_tac'] = dt
d['net'] = N; d['khung_rong'] = FW; d['khung_cao'] = FH; d['goc'] = [GX, GY]
json.dump(d, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
if len(sys.argv) > 6:  # thư mục lưu ảnh xem trước
    Image.open(io.BytesIO(bio.getvalue())).convert('RGBA').save(os.path.join(sys.argv[6], ma + '.png'))
print('lấp', lap, 'viền ám nền->tối', vien, 'điểm ngoài khung', cut, 'png bytes', len(bio.getvalue()))
