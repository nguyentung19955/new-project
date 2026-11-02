import json, re, sys
# Dùng: python3 map.py <ket-qua.json> <ra.json> <bản một tệp KHÔNG gọn: LK_GON=0 python3 game/build.py>
lines = open(sys.argv[3], encoding='utf-8').read().split('\n')
starts = []
for i, l in enumerate(lines):
    m = re.match(r'// ===== (js/[\w.-]+\.js) =====$', l)
    if m: starts.append((i + 1, m.group(1)))  # 1-based line of marker
def mp(k):
    f, n = k.rsplit(':', 1); n = int(n)
    if not f.endswith('.html'): return k
    best = None
    for st, src in starts:
        if st < n: best = (st, src)
        else: break
    if not best: return k
    return best[1][3:] + ':' + str(n - best[0])
r = json.load(open(sys.argv[1]))
out = {}
for k, s in r['sites'].items():
    k2 = mp(k); s['k'] = k2; s['callers'] = {' < '.join(mp(x) for x in c.split(' < ')): v for c, v in s['callers'].items()}
    out[k2] = s
r['sites'] = out
json.dump(r, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
