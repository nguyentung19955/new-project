import json, sys, collections
K = json.load(open(sys.argv[1])); T = collections.defaultdict(lambda: [0, 0])
ds = collections.defaultdict(list)
for combo, L in K.items():
    key, bo, wt, face, gi = combo.split('|')
    if face != '1' or gi != '0': continue
    for r in L:
        m = r.get('mat')
        if not m or m['tong'] < 6: continue
        st = r['tt'].split()[0]
        k = (wt, st); T[k][1] += 1
        if m['vk'] / m['tong'] > 0.25: T[k][0] += 1; ds[k].append(f"{key}/{bo}/{r['tt']}")
for k in sorted(T): print(k, '%d/%d' % tuple(T[k]), ' '.join(ds[k][:6]))
