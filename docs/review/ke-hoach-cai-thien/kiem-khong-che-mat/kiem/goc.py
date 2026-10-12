"""Bước nhảy góc vũ khí giữa hai khung liền (60 khung/giây): lớn nhất và số lần ≥ 50° theo trạng thái. Chạy: python3 goc.py <json>..."""
import gzip, json, sys
mo = lambda f: json.load(gzip.open(f, 'rt') if f.endswith('.gz') else open(f))  # nhận cả .json.gz
from collections import defaultdict
for f in sys.argv[1:]:
    d = mo(f); M = defaultdict(lambda: [0, 0])
    for rows in d.values():
        for a, b in zip(rows, rows[1:]):
            if a['ang'] is None or b['ang'] is None or b['tt'] == 'giữ lấy đà': continue
            x = abs((b['ang'] - a['ang'] + 540) % 360 - 180); k = b['tt'] if a['tt'] == b['tt'] else a['tt'] + '→' + b['tt']
            M[k][0] = max(M[k][0], x); M[k][1] += x >= 50
    print('==', f); [print('  %-26s lớn nhất %3d°  lần ≥50°: %d' % (k, v[0], v[1])) for k, v in M.items()]
