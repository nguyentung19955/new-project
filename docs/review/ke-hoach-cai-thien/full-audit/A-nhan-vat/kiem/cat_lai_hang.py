"""Cắt lại hàng của tấm sprite quái bị lệch lưới dọc (nội dung một hàng tràn sang ô hàng dưới, chân bị cắt).
Tìm các dải có hình theo chiều dọc (mỗi dải = một hàng hoạt ảnh), đặt lại từng dải vào đúng ô của hàng,
dời cả dải sao cho đáy hàng (chân) ở đúng y = goc + DAY (mặc định 1, như mọi quái khác). Không vẽ lại, không co giãn.
Chạy: python3 cat_lai_hang.py <tệp .sprite.json> [DAY]  (ghi đè tệp; in số dời từng hàng)"""
import json, base64, io, sys
import numpy as np
from PIL import Image
f = sys.argv[1]; DAY = int(sys.argv[2]) if len(sys.argv) > 2 else 1
raw = open(f).read(); d = json.loads(raw)
im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
a = np.array(im); al = a[:, :, 3] > 24
n = d.get('net') or 1; fh = d['khung_cao'] * n; gy = d['goc'][1] * n
nh = max(t['hang'] for t in d['dong_tac'].values()) + 1
prof = al.sum(1) > 0
runs = []; y = 0
while y < len(prof):
    if prof[y]:
        y0 = y
        while y < len(prof) and prof[y]: y += 1
        runs.append([y0, y])
    else: y += 1
# gộp dải mảnh (< 4 hàng) vào dải gần nhất phía trên (mảnh chân tràn)
gop = []
for r in runs:
    if gop and (r[1] - r[0] < 4 or r[0] - gop[-1][1] <= 1) and len(runs) > nh: gop[-1][1] = r[1]
    else: gop.append(r)
assert len(gop) == nh, ('số dải', gop, nh)
out = np.zeros_like(a)
for h, (y0, y1) in enumerate(gop):
    cao = y1 - y0; dich = h * fh + gy + DAY * n - y1
    ny0 = y0 + dich
    assert ny0 >= h * fh, ('dải cao quá ô', h, cao)
    out[ny0:ny0 + cao] = a[y0:y1]
    print('hàng', h, 'dải', y0, y1, 'dời', dich - 0, '(điểm ảnh ảnh)')
buf = io.BytesIO(); Image.fromarray(out).save(buf, 'PNG', optimize=True)
d['tam'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
json.dump(d, open(f, 'w'), ensure_ascii=False, **({'separators': (',', ':')} if '"loai":"' in raw else {}))
