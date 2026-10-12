import json, sys, collections
K = json.load(open(sys.argv[1]))
loi = collections.defaultdict(list)
for combo, L in K.items():
    key, bo, wt, face, gi = combo.split('|')
    prev = None
    for r in L:
        tag = combo + ' ' + r['tt'] + ' [' + str(r.get('hang')) + ']'
        if 'loi' in r: loi['LỖI VẼ'].append(tag + ' ' + r['loi']); continue
        m = r.get('mat')
        if m and m['tong'] >= 6:
            if m['vk'] / m['tong'] > 0.25: loi['vũ khí che mặt'].append(f"{tag} {m['vk']}/{m['tong']}")
            if m['do'] / m['tong'] > 0.25: loi['đồ che mặt'].append(f"{tag} {m['do']}/{m['tong']}")
        if r.get('vk_kc') is not None and r['vk_kc'] > 2 and not r['tt'].startswith('chết'): loi['vũ khí lơ lửng'].append(f"{tag} cách {r['vk_kc']}")
        if r.get('vk_n') == 0 and wt and not r['tt'].startswith(('chết',)): loi['mất vũ khí'].append(tag)
        if r.get('do_kc') is not None and r['do_kc'] > 2: loi['đồ lơ lửng'].append(f"{tag} cách {r['do_kc']}")
        t = r.get('than')
        if prev and t and prev.get('than'):
            a, b = prev['than'], t
            same = prev['tt'].split()[0] == r['tt'].split()[0]
            if abs(a['tx'] - b['tx']) > 4 or abs(a['day'] - b['day']) > 3:
                loi['nhảy vị trí ' + ('trong hàng' if same else 'đổi trạng thái')].append(f"{combo} {prev['tt']}→{r['tt']} dx {b['tx']-a['tx']:+.1f} dđáy {b['day']-a['day']:+d}")
        prev = r
for k, v in loi.items():
    print('##', k, len(v))
    for x in v[:int(sys.argv[2]) if len(sys.argv) > 2 else 25]: print('  ', x)
