import sys, json, base64, io
import numpy as np
from PIL import Image
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]
# chọn khung theo vạch kẻ thật: hàng -> danh sách cột giữ lại
CHON = {0: [0,1,2,3,4,5], 1: [0,1,2,3,4,5], 2: [0,1,2,3], 3: [0,1,3,4,5,7], 4: [0,1,2,3], 5: [0,1,2,3,4,5,6,7]}
TEN = ['idle', 'move', 'tele', 'atk', 'hit', 'die']
FW, FH, GX, GY, N = 208, 128, 104, 124, 2
V = np.array([20, 24, 46, 255], np.uint8)
A = np.array(Image.open(src).convert('RGB')).astype(int)
H, W, _ = A.shape
r, g, b = A[..., 0], A[..., 1], A[..., 2]
dark = (r < 60) & (g < 60) & (b < 60)
def groups(v):
    o = []
    for x in v:
        if o and x - o[-1][1] <= 3: o[-1][1] = x
        else: o.append([x, x])
    return [(a + c) // 2 for a, c in o]
cols = groups(np.where(dark.mean(0) > 0.3)[0]); rows = groups(np.where(dark.mean(1) > 0.5)[0])
if cols[0] > 5: cols = [0] + cols
if cols[-1] < W - 5: cols = cols + [W - 1]
if rows[0] > 5: rows = [0] + rows
if rows[-1] < H - 5: rows = rows + [H - 1]
print('cols', cols, 'rows', rows); assert len(cols) == 9 and len(rows) == 7
def cell(rr, cc):
    x0, x1, y0, y1 = cols[cc] + 3, cols[cc + 1] - 2, rows[rr] + 3, rows[rr + 1] - 2
    c = A[y0:y1, x0:x1]; cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
    bg = (cg > 140) & (cg - np.maximum(cr, cb) > 60)
    for _ in range(2):
        nb = np.zeros_like(bg); nb[1:] |= bg[:-1]; nb[:-1] |= bg[1:]; nb[:, 1:] |= bg[:, :-1]; nb[:, :-1] |= bg[:, 1:]
        bg |= nb & (cg > cr + 25) & (cg > cb + 25) & (cg > 80)
    al = ~bg
    # lấp lỗ nhỏ kín (đốm nền lọt vào trong thân, nhỏ hơn 40 điểm) bằng màu lân cận
    holes = ndimage.binary_fill_holes(al) & ~al
    lab, n = ndimage.label(holes)
    sz = ndimage.sum(holes, lab, range(1, n + 1)) if n else []
    small = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < 40])
    rgb = c.copy()
    if small.any():
        idx = ndimage.distance_transform_edt(~al, return_distances=False, return_indices=True)
        rgb[small] = c[idx[0][small], idx[1][small]]
        al = al | small
    lab, n = ndimage.label(al); sz = ndimage.sum(al, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= 25])
    # điểm còn ám xanh tối ở mép -> màu viền
    gr = keep & (rgb[..., 1] > rgb[..., 0] + 12) & (rgb[..., 1] > rgb[..., 2] + 8)
    rgb[gr] = V[:3]
    return rgb, keep, int(small.sum()), int(gr.sum())
cells = {}
for rr in range(6):
    for cc in CHON[rr]: cells[(rr, cc)] = cell(rr, cc)
# tỉ lệ theo khung đứng đầu tiên
_, k0, _, _ = cells[(0, 0)]; ys, xs = np.where(k0)
w0, h0 = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
s = min((177 * N - 2) / w0, (119 * N - 2) / h0)
cx0 = (xs.min() + xs.max() + 1) / 2
print('idle', w0, h0, 'scale', round(s, 3))
sheet = np.zeros((FH * N * 6, FW * N * 8, 4), np.uint8)
dt = {}
giay = {'idle': 1.4, 'move': 0.8, 'tele': 0.7, 'atk': 0.6, 'hit': 0.3, 'die': 1.2}
tong_lap = tong_xanh = 0
for rr in range(6):
    gnd = max(np.where(cells[(rr, cc)][1])[0].max() for cc in CHON[rr]) + 1
    for j, cc in enumerate(CHON[rr]):
        rgb, k, nl, nx = cells[(rr, cc)]; tong_lap += nl; tong_xanh += nx
        im = Image.fromarray(np.dstack([rgb.astype(np.uint8), (k * 255).astype(np.uint8)]), 'RGBA')
        nw, nh = round(im.width * s), round(im.height * s)
        sm = np.array(im.resize((nw, nh), Image.NEAREST))
        oy = rr * FH * N + (GY * N - 1) - round(gnd * s)
        ox = j * FW * N + GX * N - round(cx0 * s)
        # cắt vào ô
        fx0, fx1 = j * FW * N + 1, (j + 1) * FW * N - 1; fy0, fy1 = rr * FH * N + 1, (rr + 1) * FH * N - 1
        ys2, xs2 = np.where(sm[..., 3] > 0)
        for y, x in zip(ys2, xs2):
            X, Y = ox + x, oy + y
            if fx0 <= X < fx1 and fy0 <= Y < fy1: sheet[Y, X] = sm[y, x]
    a = {'hang': rr, 'so': len(CHON[rr]), 'giay': giay[TEN[rr]]}
    if TEN[rr] in ('idle', 'move'): a['lap'] = True
    if TEN[rr] == 'die': a['mo'] = 0.6
    dt[TEN[rr]] = a
al = sheet[..., 3] > 0
nb = np.zeros_like(al); nb[1:] |= al[:-1]; nb[:-1] |= al[1:]; nb[:, 1:] |= al[:, :-1]; nb[:, :-1] |= al[:, 1:]
sheet[nb & ~al] = V
im = Image.fromarray(sheet, 'RGBA')
# giảm màu như công cụ (48 màu) cho tệp nhẹ
q = im.convert('RGB').quantize(64, method=Image.Quantize.MAXCOVERAGE, dither=Image.Dither.NONE).convert('RGBA')
qa = np.array(q); qa[..., 3] = sheet[..., 3]; qa[(sheet == V).all(-1)] = V; qa[sheet[..., 3] == 0] = 0; im = Image.fromarray(qa, 'RGBA')
bio = io.BytesIO(); im.save(bio, 'PNG', optimize=True)
d = json.load(open('/home/claude/new-project/game/art/custom/hoTinh.sprite.json'))
d['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(); d['dong_tac'] = dt
json.dump(d, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
print('lấp', tong_lap, 'điểm; viền xanh->tối', tong_xanh, '; bytes', len(bio.getvalue()))
