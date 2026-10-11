import json
d = json.load(open('ra1/so-do.json')); q = json.load(open('quan.json'))
D0 = {'lung': (-5, -12), 'goc_canh': (-4, -12), 'eo': (0, -9)}
r5 = lambda v: round(v * 2) / 2
num = lambda v: int(v) if v == int(v) else v
theo = {}; bang = []
for r in d['bang']:
    if r['hang'] not in ('move', 'tele', 'atk', 'hit'): continue
    k = '%s:%d' % (r['hang'], r['khung']); kf = k.replace('move', 'run'); dau = r['khop']['dau']; than = r['khop']['than']; w = q[k]
    tr = (0.6 * dau[0] + 0.4 * w[0], 0.6 * dau[1] + 0.4 * w[1])   # lưng trên: giữa cổ (theo đầu) và eo
    s = {'lung': tr, 'goc_canh': tr, 'eo': w}
    theo[kf] = {n: [num(r5(D0[n][0] + s[n][0])), num(r5(D0[n][1] + s[n][1]))] for n in D0}
    bang.append((k, than, [r5(tr[0]), r5(tr[1])], [r5(w[0]), r5(w[1])]))
g = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'ghep', 'ma': 'ghep-smith', 'nhan_vat': 'smith', 'ten': 'Ghép trang bị · Cu Tí',
     'diem': {n: list(D0[n]) for n in D0}, 'diem_theo': theo, 'cap': {}}
s = json.dumps(g, ensure_ascii=False, indent=1)
import re
s = re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', s)
open('ghep-smith.sprite.json', 'w', encoding='utf-8').write(s + '\n')
json.dump(bang, open('bang-sua.json', 'w'))
for b in bang: print(b)
