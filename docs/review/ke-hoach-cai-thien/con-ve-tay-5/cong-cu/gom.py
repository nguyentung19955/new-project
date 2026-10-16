"""Gom kết quả kiểm kê theo hàm vẽ (bỏ qua hàm trợ giúp tô điểm ảnh). python3 gom.py kk.json"""
import json, re, sys, glob, os, collections
J = '/home/claude/new-project/game/js/'
dist = open('/tmp/claude-0/-home-claude-new-project/70cf0cef-ec57-5749-9638-345aa5d4fcd6/scratchpad/dist-kk.html', encoding='utf-8').read().split('\n')
src = {}
for f in glob.glob(J + '*.js'):
    for i, l in enumerate(open(f, encoding='utf-8').read().split('\n')):
        src.setdefault(l.strip(), []).append(os.path.basename(f) + ':' + str(i + 1))
def m(n):
    l = dist[n - 1].strip(); c = src.get(l)
    return c[0] if c else 'L' + str(n)
HELP = re.compile(r'^(p|r|ell|px|A\.p|A\.ellipse|F\.px|F\.elip|F\.dia|F\.vong|F\.cung|F\.duong|F\.cau|F\.sao|ring|line|star|vong|seg|pr|dot|rect|fillPx|K\.p|pp|Object\.p|q|pt|box|bar|dash|arc|hline|vline|plot|blk|rr|fr|c|o|veVien|glow|elip|duong|tron|sq|dia|tia|cham|nut|Array\.\w+|Object\.\w+)$')
d = json.load(open(sys.argv[1]))['dem']
agg = collections.Counter(); ex = {}
for k, v in d.items():
    lop, rest = k.split(' ', 1)
    meth, stack = rest.split(' | ', 1)
    if 'drawImage' in meth: continue
    fr = [s for s in stack.split(' < ')]
    owner = None
    for s in fr:
        mm = re.match(r'(.*?)\s*dist-kk\.html(?:\?vecode=1)?:(\d+):\d+', s)
        if not mm: continue
        fn = mm.group(1).strip() or '(ẩn danh)'
        fn = re.sub(r' \[as \w+\]', '', fn)
        loc = m(int(mm.group(2)))
        if HELP.match(fn) and owner is None:
            continue
        owner = fn + ' @ ' + loc.split(':')[0] + ':' + loc.split(':')[1] if ':' in loc else fn + ' @ ' + loc
        break
    if owner is None: owner = '? ' + stack[:80]
    agg[owner] += v
    ex.setdefault(owner, stack)
for o, v in agg.most_common():
    print(v, o)
