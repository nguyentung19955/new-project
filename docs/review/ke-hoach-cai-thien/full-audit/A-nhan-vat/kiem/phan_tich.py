import json, collections, sys
R = json.load(open('do_khung.json'))
by = collections.defaultdict(list)
for r in R: by[(r['tep'], r['hang'])].append(r)
tep = collections.defaultdict(dict)
for (t, h), v in by.items(): tep[t][h] = v
for t in sorted(tep):
    msgs = []
    for h, v in tep[t].items():
        for r in v:
            if 'loi' in r: msgs.append(f"{h}#{r['k']} {r['loi']}"); continue
            if r['cham'] and r['cham'] != 'D': msgs.append(f"{h}#{r['k']} chạm mép {r['cham']}")
            if r['cham'] == 'D' or 'D' in r['cham']: msgs.append(f"{h}#{r['k']} chạm đáy ô")
            if r['trung_truoc']: msgs.append(f"{h}#{r['k']} trùng khung trước")
        ok = [r for r in v if 'loi' not in r]
        if not ok: continue
        days = [round(r['day'], 1) for r in ok]
        txs = [round(r['tx'], 1) for r in ok]
        if h in ('idle', 'move', 'atk', 'tele', 'hit', 'noi') and (max(days) - min(days) > 1.5 or abs(min(days)) > 1.5 and abs(max(days))>1.5):
            msgs.append(f"{h} đáy chân {days}")
        jump = [abs(txs[i] - txs[i-1]) for i in range(1, len(txs))]
        if jump and max(jump) > 4: msgs.append(f"{h} tâm x nhảy {txs}")
    # chuyển trạng thái: so idle#0 với khung đầu các hàng khác
    if 'idle' in tep[t] and 'loi' not in tep[t]['idle'][0]:
        i0 = tep[t]['idle'][0]
        for h, v in tep[t].items():
            if h == 'idle' or 'loi' in v[0]: continue
            dx = v[0]['tx'] - i0['tx']; dy = v[0]['day'] - i0['day']
            if abs(dx) > 4 or abs(dy) > 2: msgs.append(f"chuyển idle→{h}: dx {dx:+.1f} dy {dy:+.1f}")
    if msgs: print('##', t); [print('  ', m) for m in msgs]
