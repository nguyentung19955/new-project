#!/usr/bin/env python3
"""So hai lần đo của do_cong_bang.py (trước = cờ ?trumcongbang=0, sau = luật công bằng) → bảng Markdown từng chiêu.
  python3 docs/review/ke-hoach-cai-thien/tu-van-2/so_sanh.py truoc.json sau.json [--md=tệp]
Đánh dấu ✗ ở cột "sau" khi chưa đạt: báo trước đòn nặng < 0,7 s · nghỉ sau đòn nặng hụt < 0,6 s · hai đòn nhắm thẳng cách < 0,3 s
(âm: đòn sau báo trước cả khi đòn trước chưa nổ) · phủ sàn > 60% · nhịp nổi giận > pha 1 × 1,15."""
import json, sys

a = json.load(open(sys.argv[1]))
b = json.load(open(sys.argv[2]))
md = next((x.split('=', 1)[1] for x in sys.argv if x.startswith('--md=')), None)
f = lambda v: '—' if v is None or v >= 9 else f'{v:.2f}'.replace('.', ',')


def danh(v, nguong):
    return f(v) + (' ✗' if v is not None and v < 9 and v < nguong - 1e-6 else '')


key = lambda r: (r['con'], r['pha'])
A = {key(r): r for r in a}
p1 = {}
L = []
L.append('| Con | Pha | Chiêu | Đòn (nặng / nhắm) | Báo trước đòn nặng (s) | Báo trước ngắn nhất (s) | Nghỉ sau đòn nặng hụt (s) | Hai đòn nhắm thẳng cách (s) |')
L.append('|---|---|---|---|---|---|---|---|')
H = ['| Con | Pha | Chiêu / phút: trước → sau | So pha 1 (sau) | Phủ sàn tối đa: trước → sau |', '|---|---|---|---|---|']
vi = 0
for r in b:
    k = key(r)
    o = A.get(k)
    if r['pha'] == 1: p1[r['con']] = r['chieuPhut']
    tl = r['chieuPhut'] / p1[r['con']] if p1.get(r['con']) else 1
    xt = ' ✗' if r['pha'] > 1 and tl > 1.15 + 1e-6 else ''
    xp = ' ✗' if r['phu'] > 0.6 else ''
    vi += bool(xt) + bool(xp)
    H.append(f"| {r['con']} | {r['pha']} | {o['chieuPhut'] if o else '?'} → {r['chieuPhut']} | ×{tl:.2f}{xt} | {round((o['phu'] if o else 0) * 100)}% → {round(r['phu'] * 100)}%{xp} |".replace('.', ','))
    ten = list(dict.fromkeys(list((o or {}).get('chieu', {}).keys()) + list(r['chieu'].keys())))
    for t in ten:
        q1 = (o or {}).get('chieu', {}).get(t, {}); q2 = r['chieu'].get(t, {})
        if not q1.get('so') and not q2.get('so'):
            continue
        cot = []
        for kk, ng in (('bao_nang', 0.7), ('bao', 0), ('nghi_hut', 0.6), ('lien', 0.3)):
            v1, v2 = q1.get(kk), q2.get(kk)
            s2 = danh(v2, ng) if v2 is not None else '—'
            if '✗' in s2: vi += 1
            cot.append(f'{f(v1) if v1 is not None else "—"} → {s2}')
        L.append(f"| {r['con']} | {r['pha']} | {t} | {q1.get('so', 0)} ({q1.get('nang', 0)}/{q1.get('nham', 0)}) → {q2.get('so', 0)} ({q2.get('nang', 0)}/{q2.get('nham', 0)}) | " + ' | '.join(cot) + ' |')
out = '\n'.join(H) + '\n\n' + '\n'.join(L) + f'\n\nSố ô chưa đạt (✗) ở bản sau: {vi}\n'
print(out)
if md:
    open(md, 'w').write(out)
