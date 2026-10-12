"""Nhập hàng chém kiếm 6 khung (1 hàng × 8 ô, nền xanh lá) vào hàng atk_sword của em-be-<key>-don.sprite.json.
Chạy: python3 cat_chem.py <key> <ảnh gốc> <tệp -don vào> <tệp -don ra> [tím=1 đổi da hồng→tím như các hàng khác của Cu Lì]"""
import sys, json, base64, io, colorsys
import numpy as np
from PIL import Image
from scipy import ndimage
key, src, fin, fout = sys.argv[1:5]
TIM = len(sys.argv) > 5 and sys.argv[5] == '1'
GOC = '/home/claude/new-project/game/art/custom/'
V = np.array([20, 24, 46], np.uint8)  # màu viền chuẩn
A = np.array(Image.open(src).convert('RGB')).astype(int)
r, g, b = A[..., 0], A[..., 1], A[..., 2]
dark = (r < 80) & (g < 80) & (b < 80)
def groups(v, gap=3):
    out = []
    for x in v:
        if out and x - out[-1][1] <= gap: out[-1][1] = x
        else: out.append([x, x])
    return out
# vạch ngang: hàng có nhiều điểm tối
hr = groups(np.where(dark.mean(1) > 0.4)[0]); y0, y1 = hr[0][1], hr[-1][0]
band = dark[y0 + 6:y1 - 6]
vc = groups(np.where(band.mean(0) > 0.6)[0])
print('ngang', hr, 'doc', vc)
assert len(vc) == 9, vc
cells = []
for i in range(6):
    xa, xb = vc[i][1] + 1, vc[i + 1][0]
    # vạch ngang riêng từng ô (lưới vẽ tay có thể lệch)
    col = dark[:, xa + 5:xb - 5].mean(1)
    rr = groups(np.where(col > 0.5)[0]); ya, yb = rr[0][1] + 1, rr[-1][0]
    c = A[ya:yb, xa:xb]
    cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
    bg = (cg > 140) & (cg - np.maximum(cr, cb) > 60)
    # viền lem xanh sát nền -> nền (chỉ điểm ngả xanh lá rõ; tóc trắng/tím, da không bị ăn)
    for _ in range(2):
        nb = ndimage.binary_dilation(bg)
        fr = nb & ~bg & (cg > 2 * np.maximum(cr, cb) + 15) & (cg > 90)
        bg |= fr
    al = ~bg
    al[:3] = al[-3:] = False; al[:, :3] = al[:, -3:] = False  # bỏ sót vạch kẻ
    lab, n = ndimage.label(al)
    sz = ndimage.sum(al, lab, range(1, n + 1))
    keep = np.isin(lab, [j + 1 for j, s in enumerate(sz) if s >= 0.02 * sz.max()])
    keep = ndimage.binary_fill_holes(keep) & (keep | ~bg)  # lỗ kín không phải nền thì giữ
    # điểm còn ngả xanh lá trong hình (nửa trong suốt) -> viền tối
    c = c.copy()
    gx = keep & (cg > 2 * np.maximum(cr, cb) + 15) & (cg > 40)  # lem xanh nền (quần lá, quần xanh rêu không bị tính)
    c[gx] = V
    ys, xs = np.where(keep)
    cells.append(dict(xa=int(xa), yc=int(ya), rgb=c, a=keep, bb=(xs.min(), ys.min(), xs.max() + 1, ys.max() + 1), w=xb - xa, h=yb - ya, gx=int(gx.sum())))
def load(f):
    d = json.load(open(f))
    return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
d, S = load(fin); _, B = load(GOC + f'em-be-{key}.sprite.json')
ia = B[0:96, 0:96, 3] > 127; iy = np.where(ia.any(1))[0]
idle_h = iy[-1] - iy[0] + 1; tx = np.where(ia[iy[0]:iy[0] + 25])[1].mean()
hs = [c['bb'][3] - c['bb'][1] for c in cells]
s = (idle_h - 2) / hs[0]
gnd = [c['bb'][3] for c in cells]
G = int(np.median(gnd))
print('idle_h', idle_h, 'tx', round(tx, 1), 'cao goc', hs, 'ti le', round(s, 4), 'day', gnd, 'diem xanh->vien', [c['gx'] for c in cells])
row = np.zeros((96, 768, 4), np.uint8)
d0 = None
MAP = []
for j, c in enumerate(cells):
    x0, ya, x1, yb = c['bb']
    rgba = np.dstack([c['rgb'][ya:yb, x0:x1].astype(np.uint8), (c['a'][ya:yb, x0:x1] * 255).astype(np.uint8)])
    im = Image.fromarray(rgba, 'RGBA')
    nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
    pm = np.array(im).astype(float); pm[..., :3] *= pm[..., 3:4] / 255
    sm = np.array(Image.fromarray(pm.round().astype(np.uint8), 'RGBA').resize((nw, nh), Image.BOX)).astype(float)
    a = sm[..., 3]; o = np.zeros((nh, nw, 4), np.uint8); m = a >= 128
    o[m, :3] = np.clip(sm[m, :3] * 255 / np.maximum(a[m, None], 1), 0, 255); o[m, 3] = 255
    oy = 90 + round((ya - G) * s)  # bàn chân (đáy chung G của ô) trên đường đáy 89, viền 90; nắm tay thấp hơn chân thì được thò xuống
    oy = min(oy, 94 - nh)
    mm = o[..., 3] > 0
    if d0 is None:  # một phép dời cho cả hàng: tâm đầu khung 1 trùng tâm đầu khung đứng của thân gốc
        d0 = tx - (x0 * s + np.where(mm[:25])[1].mean())
    ox = j * 96 + int(round(d0 + x0 * s))
    ox = max(j * 96 + 2, min(j * 96 + 94 - nw, ox))
    row[oy:oy + nh, ox:ox + nw][mm] = o[mm]
    MAP.append(dict(xa=c['xa'] + int(x0), ya=c['yc'] + int(ya), ox=ox - j * 96, oy=oy, s=s))  # ảnh gốc -> toạ độ trong ô
a = row[..., 3] > 0
edge = np.zeros_like(a)
for j in range(6):
    sub = a[:, j * 96:(j + 1) * 96]; edge[:, j * 96:(j + 1) * 96] = ndimage.binary_dilation(sub) & ~sub
row[edge, :3] = V; row[edge, 3] = 255
m = row[..., 3] > 0
if TIM:  # da hồng/đào -> tím hoa cà như các hàng khác của tệp (cùng phép đổi của phiên nhập ảnh 12/10)
    px = row[m][:, :3].astype(float) / 255; n = 0
    for t, (R, G, Bc) in enumerate(px):
        h, sa, v = colorsys.rgb_to_hsv(R, G, Bc); hd = h * 360
        if (hd >= 340 or hd <= 40) and sa > 0.12 and v > 0.45:
            px[t] = colorsys.hsv_to_rgb(258 / 360, min(1, sa * 0.95), v * 0.93); n += 1
    row[m, :3] = (px * 255).round().astype(np.uint8); print('doi da', n)
# về bảng màu sẵn có của tệp -don (cùng tông các hàng khác, tệp không nặng thêm)
pal = np.unique(S[96:].reshape(-1, 4), axis=0); pal = pal[pal[:, 3] > 0][:, :3].astype(int)
cs = row[m][:, :3].astype(int)
row[m, :3] = pal[((cs[:, None, :] - pal[None]) ** 2).sum(-1).argmin(1)].astype(np.uint8)
S[0:96] = row
bio = io.BytesIO(); Image.fromarray(S, 'RGBA').save(bio, 'PNG', optimize=True)
d['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()
json.dump(d, open(fout, 'w'), separators=(',', ':'), ensure_ascii=False)
so = [int((S[1:96:2, j * 96 + 1:(j + 1) * 96:2, 3] > 127).sum()) for j in range(6)]
hh = [int(np.ptp(np.where(S[0:96, j * 96:(j + 1) * 96, 3].any(1))[0]) + 1) for j in range(6)]
print('bang mau', len(pal), 'byte', len(bio.getvalue()), 'so diem anh (game)', so, 'cao', hh)
json.dump(MAP, open(fout + '.map', 'w'))
