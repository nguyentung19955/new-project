"""So dấu vân điểm ảnh từng khung giữa hai lần đo (vd bản gốc với ?kiemsau=0). Chạy: python3 so_van.py <a.json> <b.json>"""
import gzip, json, sys
mo = lambda f: json.load(gzip.open(f, 'rt') if f.endswith('.gz') else open(f))  # nhận cả .json.gz
a, b = mo(sys.argv[1]), mo(sys.argv[2])
n = d = 0
for k in a:
    for x, y in zip(a[k], b.get(k, [])): n += 1; d += x['h'] != y['h']
print('%s ↔ %s: %d khung, khác %d' % (sys.argv[1].split('/')[-1], sys.argv[2].split('/')[-1], n, d))
