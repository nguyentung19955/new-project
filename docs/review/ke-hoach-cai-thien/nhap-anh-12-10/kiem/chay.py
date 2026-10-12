import sys, json, base64, io
import numpy as np
from PIL import Image
# chay.py key src.png out.sprite.json [skip_idx,...]
key, src, out = sys.argv[1:4]
skip = [int(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 and sys.argv[4] else []
V = np.array([20, 24, 46, 255], np.uint8)
A = np.array(Image.open(src).convert('RGB')).astype(int)
H, W, _ = A.shape
r, g, b = A[..., 0], A[..., 1], A[..., 2]
dark = (r < 70) & (g < 70) & (b < 70)
bg = (g > 150) & (g - np.maximum(r, b) > 70)
# grid lines: columns/rows mostly dark inside the band
rows = np.where(dark.mean(1) > 0.45)[0]
def groups(v):
    out = []
    for x in v:
        if out and x - out[-1][1] <= 3: out[-1][1] = x
        else: out.append([x, x])
    return [(a + b2) // 2 for a, b2 in out]
hr = groups(rows); y0, y1 = hr[0], hr[-1]
band = dark[y0 + 5:y1 - 5]
cols = groups(np.where(band.mean(0) > 0.6)[0])
print('rows', hr, 'cols', cols)
assert len(cols) == 9, cols
cells = []
for i in range(8):
    x0, x1 = cols[i] + 4, cols[i + 1] - 4
    c = A[y0 + 4:y1 - 3, x0:x1]
    cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
    cbg = (cg > 140) & (cg - np.maximum(cr, cb) > 60)
    # halo: greenish fringe adjacent to bg -> bg as well
    for _ in range(2):
        nb = np.zeros_like(cbg)
        nb[1:] |= cbg[:-1]; nb[:-1] |= cbg[1:]; nb[:, 1:] |= cbg[:, :-1]; nb[:, :-1] |= cbg[:, 1:]
        fr = nb & ~cbg & (cg > cr + 25) & (cg > cb + 25) & (cg > 90)
        cbg |= fr
    alpha = ~cbg
    # keep largest connected component (+ blobs > 30px)
    from scipy import ndimage
    lab, n = ndimage.label(alpha)
    sizes = ndimage.sum(alpha, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 0.02 * sizes.max()])
    ys, xs = np.where(keep)
    cells.append(dict(rgb=c, a=keep, bb=(xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
# reference: base idle frame 0
import subprocess
d = json.loads(subprocess.check_output(['git','-C','/home/claude/new-project','show',f'HEAD:game/art/custom/em-be-{key}.sprite.json']))
base = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
B = np.array(base)
ia = B[0:96, 0:96, 3] > 127
iy = np.where(ia.any(1))[0]; idle_h = iy[-1] - iy[0] + 1
top = iy[0]; hh = idle_h
tx = np.where(ia[top:top + int(hh * 0.5)])[1].mean()   # head/torso center x
heights = [c['bb'][3] - c['bb'][1] for c in cells]
gnd = max(c['bb'][3] for c in cells)
s = (idle_h - 2) / float(np.median(heights))
print('idle_h', idle_h, 'heights', heights, 'scale', round(s, 4), 'tx', round(tx, 1))
row = np.zeros((96, 768, 4), np.uint8)
use = [i for i in range(8) if i not in skip]
for j, i in enumerate(use):
    c = cells[i]; x0, ya, x1, yb = c['bb']
    rgba = np.dstack([c['rgb'][ya:yb, x0:x1].astype(np.uint8), (c['a'][ya:yb, x0:x1] * 255).astype(np.uint8)])
    im = Image.fromarray(rgba, 'RGBA')
    nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
    # premultiplied area resample
    pm = np.array(im).astype(float); pm[..., :3] *= pm[..., 3:4] / 255
    sm = np.array(Image.fromarray(pm.astype(np.uint8), 'RGBA').resize((nw, nh), Image.BOX)).astype(float)
    a = sm[..., 3]
    o = np.zeros((nh, nw, 4), np.uint8)
    m = a >= 128
    o[m, :3] = np.clip(sm[m, :3] * 255 / np.maximum(a[m, None], 1), 0, 255)
    o[m, 3] = 255
    lift = round((gnd - yb) * s)
    oy = 89 - nh + 1 - lift
    mm = o[..., 3] > 0
    cx = np.where(mm[:int(nh * 0.5)])[1].mean()
    ox = j * 96 + int(round(tx - cx))
    ox = max(j * 96 + 3, min(j * 96 + 93 - nw, ox))
    sub = row[oy:oy + nh, ox:ox + nw]
    sub[mm] = o[mm]
# outline 1px VIEN per cell
a = row[..., 3] > 0
nb = np.zeros_like(a)
nb[1:] |= a[:-1]; nb[:-1] |= a[1:]; nb[:, 1:] |= a[:, :-1]; nb[:, :-1] |= a[:, 1:]
edge = nb & ~a
for k in range(1, 8): edge[:, k * 96] &= False  # avoid crossing into neighbour (approx)
row[edge] = V
# đổi màu hàng mới về bảng màu sẵn có của tấm thân (giữ tệp nhẹ, cùng tông)
pal = np.unique(np.concatenate([B[:96], B[192:]]).reshape(-1, 4), axis=0)
pal = pal[pal[:, 3] > 0][:, :3].astype(int)
m = row[..., 3] > 0
cols_ = row[m][:, :3].astype(int)
dd = ((cols_[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
row[m, :3] = pal[dd.argmin(1)].astype(np.uint8)
print('palette', len(pal))
B[96:192] = row
img = Image.fromarray(B, 'RGBA')
# quantize only row 1 colors lightly? keep as is
bio = io.BytesIO(); img.save(bio, 'PNG', optimize=True)
d['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()
d['dong_tac']['move'] = {'hang': 1, 'so': len(use), 'giay': round(0.65 if len(use) == 8 else 0.6, 2), 'lap': True}
d['nhun_buoc'] = False
json.dump(d, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
print('frames', len(use), 'bytes', len(bio.getvalue()))
