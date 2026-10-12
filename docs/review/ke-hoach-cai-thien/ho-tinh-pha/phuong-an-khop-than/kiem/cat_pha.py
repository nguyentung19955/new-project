# Cắt Hồ Tinh pha 2, pha 3 (dáng pha: 4 hàng idle, tele, atk, hit) theo vạch kẻ thật, CÙNG phép biến đổi với pha 1
# (docs/review/ke-hoach-cai-thien/nhap-anh-12-10/kiem/hotinh.py): khung 208×128, nét ×2, chân [104, 124].
# Tỉ lệ = tỉ lệ pha 1 × K (K đo bằng cách chồng hình bóng lên pha 1 cho chân, thân khớp nhau).
# Cách dùng: python3 cat_pha.py <pha: 2|3> <tệp ra .sprite.json>
import sys, json, base64, io
import numpy as np
from PIL import Image
from scipy import ndimage
GOC = 'docs/anh-goc/2026-10-12/'
pha, out = int(sys.argv[1]), sys.argv[2]
FW, FH, GX, GY, N = 208, 128, 104, 124, 2
V = np.array([20, 24, 46, 255], np.uint8)  # màu viền như pha 1
# hàng -> các cột giữ lại (đếm từ 0) và tỉ lệ so với pha 1
CAU_HINH = {
    2: dict(chon={0: [0, 1, 2, 3, 4, 5], 1: [0, 1, 2, 3], 2: [0, 1, 2, 3, 4], 3: [0, 1, 2, 3]}, K=0.84, ten='Hồ Tinh · pha 2 (mắt tím, phân thân)'),
    3: dict(chon={0: [0, 1, 2, 3, 4, 5], 1: [0, 1, 3, 4], 2: [0, 1, 2, 3, 4, 5], 3: [0, 1, 3, 4]}, K=0.86, ten='Hồ Tinh · pha 3 (hoá cuồng)'),
}[pha]
TEN = ['idle', 'tele', 'atk', 'hit']
GIAY = {'idle': 1.4, 'tele': 0.7, 'atk': 0.6, 'hit': 0.3}

def doc(ten):
    A = np.array(Image.open(GOC + ten).convert('RGB')).astype(int)
    H, W, _ = A.shape
    dark = (A[..., 0] < 60) & (A[..., 1] < 60) & (A[..., 2] < 60)
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
    return A, cols, rows

def cell(A, cols, rows, rr, cc):
    # y hệt cách cắt pha 1 (hotinh.py): nền xanh lá xoá, viền ám xanh -> màu viền, lấp lỗ nhỏ kín bằng màu lân cận
    x0, x1, y0, y1 = cols[cc] + 3, cols[cc + 1] - 2, rows[rr] + 3, rows[rr + 1] - 2
    c = A[y0:y1, x0:x1]; cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
    bg = (cg > 140) & (cg - np.maximum(cr, cb) > 60)
    for _ in range(2):
        nb = np.zeros_like(bg); nb[1:] |= bg[:-1]; nb[:-1] |= bg[1:]; nb[:, 1:] |= bg[:, :-1]; nb[:, :-1] |= bg[:, 1:]
        bg |= nb & (cg > cr + 25) & (cg > cb + 25) & (cg > 80)
    al = ~bg
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
    gr = keep & (rgb[..., 1] > rgb[..., 0] + 12) & (rgb[..., 1] > rgb[..., 2] + 8)
    rgb[gr] = V[:3]
    return rgb, keep, int(small.sum()), int(gr.sum())

# tỉ lệ pha 1 (đúng như hotinh.py: khung đứng đầu tiên vừa 177×119)
A1, c1, r1 = doc('hoTinh-pha1.png')
_, k0, _, _ = cell(A1, c1, r1, 0, 0); ys, xs = np.where(k0)
s1 = min((177 * N - 2) / (xs.max() - xs.min() + 1), (119 * N - 2) / (ys.max() - ys.min() + 1))
A, cols, rows = doc('hoTinh-pha%d.png' % pha)
print('cột', [int(x) for x in cols], 'hàng', [int(x) for x in rows])
assert len(rows) - 1 >= 4
s = s1 * CAU_HINH['K']
cells = {(rr, cc): cell(A, cols, rows, rr, cc) for rr, ds in CAU_HINH['chon'].items() for cc in ds}
_, kk, _, _ = cells[(0, 0)]; ys, xs = np.where(kk); cx0 = (xs.min() + xs.max() + 1) / 2
print('tỉ lệ pha 1', round(s1, 4), '→ pha %d' % pha, round(s, 4))
sheet = np.zeros((FH * N * 4, FW * N * 8, 4), np.uint8)
camTren = np.zeros_like(sheet[..., 0], bool)  # điểm bị mép trên ô cắt (không kẻ viền dọc mép cắt)
dt = {}; tong_lap = tong_xanh = 0; cat_tren = {}
for rr, ds in CAU_HINH['chon'].items():
    gnd = max(np.where(cells[(rr, cc)][1])[0].max() for cc in ds) + 1
    for j, cc in enumerate(ds):
        rgb, k, nl, nx = cells[(rr, cc)]; tong_lap += nl; tong_xanh += nx
        im = Image.fromarray(np.dstack([rgb.astype(np.uint8), (k * 255).astype(np.uint8)]), 'RGBA')
        nw, nh = round(im.width * s), round(im.height * s)
        sm = np.array(im.resize((nw, nh), Image.NEAREST))
        oy = rr * FH * N + (GY * N - 1) - round(gnd * s)
        ox = j * FW * N + GX * N - round(cx0 * s)
        fx0, fx1 = j * FW * N + 1, (j + 1) * FW * N - 1; fy0, fy1 = rr * FH * N + 1, (rr + 1) * FH * N - 1
        ys2, xs2 = np.where(sm[..., 3] > 0)
        Y, X = ys2 + oy, xs2 + ox
        ok = (X >= fx0) & (X < fx1) & (Y >= fy0) & (Y < fy1)
        sheet[Y[ok], X[ok]] = sm[ys2[ok], xs2[ok]]
        tren = int((Y < fy0).sum()); cat_tren['%d.%d' % (rr + 1, j + 1)] = tren
        camTren[fy0:fy0 + 2, fx0:fx1] = True
    a = {'hang': rr, 'so': len(ds), 'giay': GIAY[TEN[rr]]}
    if TEN[rr] == 'idle': a['lap'] = True
    dt[TEN[rr]] = a
# Hình pha 2, 3 cao hơn pha 1 (khí, lửa, lông dựng) mà ô phải giữ 208×128 như pha 1: phần nhô quá mép trên ô bị cắt.
# Để không thành vệt cắt phẳng: dải MO điểm sát mép trên mờ dần theo ô Bayer 4×4 (như lửa, khí tan), không kẻ viền dọc mép cắt.
MO = 12
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16
for rr in range(4):
    fy0 = rr * FH * N + 1
    for t in range(MO):
        y = fy0 + t; nguong = (t + 0.5) / MO
        xs_ = np.arange(sheet.shape[1]); bo = BAYER[y % 4, xs_ % 4] >= nguong
        sheet[y, bo] = 0
    camTren[fy0:fy0 + MO, :] = True
al = sheet[..., 3] > 0
nb = np.zeros_like(al); nb[1:] |= al[:-1]; nb[:-1] |= al[1:]; nb[:, 1:] |= al[:, :-1]; nb[:, :-1] |= al[:, 1:]
sheet[nb & ~al & ~camTren] = V
im = Image.fromarray(sheet, 'RGBA')
q = im.convert('RGB').quantize(64, method=Image.Quantize.MAXCOVERAGE, dither=Image.Dither.NONE).convert('RGBA')
qa = np.array(q); qa[..., 3] = sheet[..., 3]; qa[(sheet == V).all(-1)] = V; qa[sheet[..., 3] == 0] = 0; im = Image.fromarray(qa, 'RGBA')
# Lưu PNG BẢNG MÀU (1 byte mỗi điểm, màu 0 trong suốt) thay vì RGBA: cùng hình, tệp nhẹ hơn nhiều (gói hai tệp còn rất ít chỗ dưới trần 26 MB).
qa = np.array(im); op = qa[..., 3] > 0
mau = sorted(set(map(tuple, qa[op][:, :3].tolist())))
assert len(mau) <= 255, len(mau)
chi = {c: i + 1 for i, c in enumerate(mau)}
idx = np.zeros(op.shape, np.uint8)
ys, xs = np.where(op); idx[ys, xs] = [chi[tuple(c)] for c in qa[ys, xs, :3].tolist()]
pim = Image.fromarray(idx, 'P'); pal = [0, 0, 0] + [v for c in mau for v in c]; pim.putpalette(pal + [0] * (768 - len(pal)))
bio = io.BytesIO(); pim.save(bio, 'PNG', optimize=True, transparency=0)
print('số màu', len(mau))
ma = 'hoTinh-p%d' % pha
d = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': ma, 'ten': CAU_HINH['ten'], 'vung': 'laudai',
     'tam': 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(), 'net': N,
     'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY], 'rong': 177, 'cao': 119, 'dong_tac': dt}
json.dump(d, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
im.save(out.replace('.sprite.json', '.png'))
print('lấp', tong_lap, 'điểm; viền xanh->tối', tong_xanh, '; bytes', len(bio.getvalue()))
print('điểm bị mép trên ô cắt mỗi khung:', cat_tren)
