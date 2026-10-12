"""Tổng hợp số đo do_mat.py: theo trạng thái — số khung, số khung có vũ khí đè mặt (≥1 điểm ảnh), tổng / lớn nhất % mặt bị đè,
khung đè đầu. Chạy: python3 tong.py <json> [--chi-tiet]"""
import gzip, json, sys
mo = lambda f: json.load(gzip.open(f, 'rt') if f.endswith('.gz') else open(f))  # nhận cả .json.gz
from collections import defaultdict
d = mo(sys.argv[1])
CT = '--chi-tiet' in sys.argv
DANH = {'chém 3 nhát', 'chạy mà chém', 'lướt chém', 'chiêu', 'giữ lấy đà'}
T = defaultdict(lambda: [0, 0, 0.0, 0, 0])  # khung, khung đè mặt, % lớn nhất, khung đè đầu, khung không đo được mặt
theo_be = defaultdict(lambda: [0, 0])
vd = defaultdict(list)
for kk, rows in d.items():
    key, bo, f = kk.split('|')
    for r in rows:
        t = T[r['tt']]; t[0] += 1
        if r['mat'] is None: t[4] += 1; continue
        if r['mat'] > 0:
            t[1] += 1; pc = 100 * r['mat'] / max(1, r['matT']); t[2] = max(t[2], pc)
            theo_be['%s %s %s' % (key, bo, 'phải' if f == '1' else 'trái')][0 if r['tt'] not in DANH else 1] += 1
            if len(vd[r['tt']]) < 400: vd[r['tt']].append((kk, r['k'], r['ang'], r['truoc'], r['mat'], r['matT']))
        if r['dau'] > 0: t[3] += 1
tong_ko, tong_danh = [0, 0], [0, 0]
print('%-14s %7s %9s %8s %9s %6s' % ('trạng thái', 'khung', 'đè mặt', '%max', 'đè đầu', 'k.đo'))
for k, t in sorted(T.items(), key=lambda e: e[0] in DANH):
    print('%-14s %7d %9d %7.0f%% %9d %6d' % (k, t[0], t[1], t[2], t[3], t[4]))
    (tong_danh if k in DANH else tong_ko)[0] += t[0]; (tong_danh if k in DANH else tong_ko)[1] += t[1]
print('KHÔNG ĐÁNH: %d/%d khung đè mặt;  ĐÁNH: %d/%d' % (tong_ko[1], tong_ko[0], tong_danh[1], tong_danh[0]))
print('theo em bé (không đánh, đánh):', {k: v for k, v in sorted(theo_be.items()) if v[0] or v[1]})
if CT:
    for k, L in vd.items():
        print('\n==', k)
        for x in L[:60]: print('  ', x)
