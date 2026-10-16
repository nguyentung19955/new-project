"""Gom kết quả kiemke8.py: đổi dòng của bản một tệp về tệp nguồn game/js/<tệp>:<dòng>, gộp theo (lớp, hàm chủ, nguồn canvas phụ).
    python3 gom8.py <thư mục ra>      → <ra>/gom.json + in bảng"""
import json, re, sys, glob, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '../../../../../game'))
od = sys.argv[1]
dist = open(GAME + '/dist/linh-khi.html', encoding='utf-8').read().split('\n')
src = {}
for f in glob.glob(GAME + '/js/*.js'):
    for i, l in enumerate(open(f, encoding='utf-8').read().split('\n')):
        src.setdefault(l.strip(), []).append(os.path.basename(f) + ':' + str(i + 1))
def ung(n):
    l = dist[n - 1].strip() if 0 < n <= len(dist) else ''
    return src.get(l) if l else None
def doi(n):
    n = int(n); c = ung(n)
    if not c: return 'dist:' + str(n)
    if len(c) == 1: return c[0]
    for d in range(1, 60):  # dòng trùng nhiều tệp: dò dòng lân cận chỉ khớp một chỗ
        for s in (-1, 1):
            c2 = ung(n + s * d)
            if c2 and len(c2) == 1:
                f, L = c2[0].rsplit(':', 1); want = f + ':' + str(int(L) - s * d)
                if want in c: return want
    return c[0]
def doiChuoi(s):
    return re.sub(r'@(\d+)', lambda m: '@' + doi(m.group(1)), s)
G = {}
for f in sorted(glob.glob(od + '/kk-*.json')):
    d = json.load(open(f))
    for k, o in d['dem'].items():
        lop, rest = k.split(' ', 1)
        meth, own = rest.split(' | ', 1)
        if ' ⇐ ' in own and all('[sửa điểm ảnh]' in p for p in own.split(' ⇐ ', 1)[1].rsplit(' [canvas', 1)[0].split(' + ')): continue
        own2 = doiChuoi(own)
        kk = lop + ' | ' + own2
        g = G.setdefault(kk, {'lop': lop, 'chu': own2, 'lenh': collections.Counter(), 'n': 0, 'f': 0, 'nhan': collections.Counter(), 'ex': doiChuoi(o['ex']), 'snap': None, 'khoa': []})
        g['lenh'][meth] += o['n']; g['n'] += o['n']; g['f'] += o['f']
        for a, b in o['nhan'].items(): g['nhan'][a] += b
        g['khoa'].append(os.path.basename(f) + '::' + k)
        s = d['snaps'].get(k)
        if s and (g['snap'] is None or (g['snap'].get('sang', 99) < 40 and s.get('sang', 0) > g['snap'].get('sang', 99) * 1.5) or (g['snap']['ar'] < 400 and s['ar'] > g['snap']['ar']) or (g['snap']['tot'] > 0.6 and s['tot'] < 0.5)):
            g['snap'] = dict(s, tep=os.path.basename(f), khoa=k)
out = []
for kk, g in sorted(G.items(), key=lambda x: -x[1]['f']):
    out.append({'id': len(out), 'lop': g['lop'], 'chu': g['chu'], 'lenh': dict(g['lenh']), 'n': g['n'], 'f': g['f'], 'nhan': dict(g['nhan'].most_common()), 'ex': g['ex'],
                'snap': {k: v for k, v in g['snap'].items() if k != 'png'} if g['snap'] else None, 'png': g['snap']['png'] if g['snap'] else None})
json.dump(out, open(od + '/gom.json', 'w'), ensure_ascii=False)
for o in out:
    nh = list(o['nhan'])
    print('%3d %s f=%-5d n=%-7d %-70s | %s%s' % (o['id'], o['lop'], o['f'], o['n'], o['chu'][:150], ', '.join(nh[:3])[:90], ' (+%d cảnh)' % (len(nh) - 3) if len(nh) > 3 else ''))
