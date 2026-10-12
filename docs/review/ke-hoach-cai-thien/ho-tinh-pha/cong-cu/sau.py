"""Hậu kỳ tấm do trang tách: (1) xếp lại khung hàng tấn công (tuỳ chọn), (2) điểm còn ngả xanh lá -> màu lân cận, (3) lấp lỗ kín nhỏ bằng màu lân cận.
python3 sau.py vao.sprite.json ra.sprite.json [hang:i,i,i,...]"""
import sys, json, base64, io, numpy as np
from PIL import Image
from scipy import ndimage
from collections import Counter
vao, ra = sys.argv[1], sys.argv[2]
t = json.load(open(vao, encoding='utf-8'))
N = t.get('net', 1); FW, FH = t['khung_rong'] * N, t['khung_cao'] * N
a = np.array(Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA'))
bc = {}
for xep in sys.argv[3:]:
    ten, ds = xep.split(':'); h = t['dong_tac'][ten]['hang']; ds = [int(x) for x in ds.split(',')]
    cu = [a[h*FH:(h+1)*FH, c*FW:(c+1)*FW].copy() for c in range(8)]
    for c in range(8): a[h*FH:(h+1)*FH, c*FW:(c+1)*FW] = cu[ds[c]] if c < len(ds) else 0
    bc['xep_' + ten] = ds
def lap(a, mask):
    """tô các điểm mask bằng màu xuất hiện nhiều nhất ở 8 điểm quanh (đã đặc, không thuộc mask), lặp tới hết"""
    mask = mask.copy(); H, W = mask.shape; n0 = int(mask.sum())
    for _ in range(200):
        ys, xs = np.nonzero(mask)
        if not len(ys): break
        moi = []
        for y, x in zip(ys, xs):
            c = Counter()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if (dy or dx) and 0 <= yy < H and 0 <= xx < W and not mask[yy, xx] and a[yy, xx, 3]: c[tuple(a[yy, xx])] += 1
            if c: moi.append((y, x, c.most_common(1)[0][0]))
        if not moi: break
        for y, x, m in moi: a[y, x] = m; mask[y, x] = False
    return n0
r, g, b, al = [a[..., i].astype(int) for i in range(4)]
xanh = (al > 0) & (g > np.maximum(r, b) + 25)
bc['diem_xanh_da_sua'] = lap(a, xanh)
lo = np.zeros(a.shape[:2], bool); dem = 0; TRAN = 60 * N * N // 4
for R in range(a.shape[0] // FH):
    for C in range(8):
        o = a[R*FH:(R+1)*FH, C*FW:(C+1)*FW, 3] == 0
        if o.all(): continue
        lab, n = ndimage.label(o)
        bien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        for i, s in enumerate(sz, 1):
            if i not in bien and s <= TRAN: lo[R*FH:(R+1)*FH, C*FW:(C+1)*FW] |= lab == i; dem += 1
bc['lo_kin_da_lap'] = dem; bc['diem_lo_da_lap'] = lap(a, lo)
# lưu PNG BẢNG MÀU (≤ 256 màu, không mất điểm nào): nhẹ ~3 lần so với PNG RGBA của canvas
a[a[..., 3] == 0] = 0
mau = sorted(set(map(tuple, a.reshape(-1, 4).tolist()))); assert len(mau) <= 256
chi = {c: i for i, c in enumerate(mau)}
idx = np.array([chi[tuple(p)] for p in a.reshape(-1, 4).tolist()], np.uint8).reshape(a.shape[:2])
pim = Image.fromarray(idx, 'P'); pim.putpalette([v for c in mau for v in c[:3]])
buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == a).all()
t['tam'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
Image.fromarray(a).save(ra.replace('.sprite.json', '.png'))
bc['mau'] = len(set(map(tuple, a[a[..., 3] > 0][:, :3].tolist()))); bc['byte'] = len(open(ra, 'rb').read())
print(json.dumps(bc, ensure_ascii=False))
