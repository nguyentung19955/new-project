#!/usr/bin/env python3
"""Đọc em-be-so.json (em_be.py) -> in các điểm bất thường theo nhóm. Chạy: python3 phan_tich.py <em-be-so.json> [ngưỡng]"""
import json, sys
from collections import defaultdict
D = json.load(open(sys.argv[1])); K = D['ket']
out = defaultdict(list)
for ten, rec in K.items():
    rows = rec['rows']
    idle = rows[0]['than']
    for i, r in enumerate(rows):
        t = r['than']
        if not t: out['RỖNG'].append((ten, r['nhan'])); continue
        if r['lr_than'] > 6: out['trái/phải thân lệch'].append((ten, r['nhan'], r['lr_than']))
        if r['lr_vk'] - r['lr_than'] > 8: out['trái/phải vũ khí lệch'].append((ten, r['nhan'], r['lr_vk'] - r['lr_than']))
        if r.get('vk') and r.get('vk_cach', 0) > 2.5: out['vũ khí rời thân'].append((ten, r['nhan'], r['vk_cach']))
        if r.get('vk_de_dau', 0) > 12: out['vũ khí đè vùng đầu'].append((ten, r['nhan'], r['vk_de_dau']))
        if r['nhom'] not in ('die', 'dodge') and abs(t['y1'] - idle['y1']) > 1 and r['nhom'] != 'move':
            out['đáy chân khác đứng'].append((ten, r['nhan'], t['y1'] - idle['y1']))
        if i and rows[i-1]['nhom'] == r['nhom'] and rows[i-1]['than'] and r['nhom'] not in ('dodge', 'die'):
            p = rows[i-1]['than']
            if abs(t['cx'] - p['cx']) > 3: out['thân nhảy ngang giữa 2 khung'].append((ten, rows[i-1]['nhan'] + '->' + r['nhan'], round(t['cx'] - p['cx'], 1)))
        for m, q in r['do'].items():
            if not q: continue
            sl = m.split(':')[1]
            if q['lr'] - r['lr_than'] > 8: out['trái/phải đồ lệch'].append((ten, m, r['nhan'], q['lr'] - r['lr_than']))
            if sl == 'hat' and q.get('de_dau', 0) > 40: pass
            if r['nhom'] not in ('dodge', 'die'):
                # mũ lơ lửng: đáy mũ cao hơn đỉnh thân
                if sl == 'hat' and q['y1'] < t['y0']: out['mũ lơ lửng trên đầu'].append((ten, m, r['nhan'], q['y1'] - t['y0']))
                if sl == 'hat' and q['y1'] > t['y0'] + 12: out['mũ tụt quá thấp'].append((ten, m, r['nhan'], q['y1'] - t['y0']))
                if q['y1'] > t['y1'] + 1: out['đồ xuống dưới chân'].append((ten, m, r['nhan'], q['y1'] - t['y1']))
    # đồ trôi: vị trí món so với điểm bám (mũ, mặt nạ: đầu; còn lại: mình), đo bằng dò khớp đầu / mình với khung đứng 0
    if 'dau' not in rows[1]: continue
    modes = rows[0]['do'].keys()
    for m in modes:
        sl = m.split(':')[1]; ref = 'dau' if sl in ('hat', 'mask') else 'minh'
        q0 = rows[0]['do'].get(m)
        if not q0: continue
        prev = None
        for r in rows:
            q = r['do'].get(m)
            if r['nhom'] in ('dodge', 'die') or ref not in r: prev = None; continue
            if r[ref][2] < 0.55: prev = None; continue  # dò khớp kém (thân đổi dáng nhiều): bỏ qua
            if not q:
                out['đồ biến mất'].append((ten, m, r['nhan'])); prev = None; continue
            ex, ey = q['cx'] - r[ref][0], q['cy'] - r[ref][1]   # tâm món đưa về khung đứng
            dx, dy = round(ex - q0['cx'], 1), round(ey - q0['cy'], 1)
            if abs(dx) > 3 or abs(dy) > 3: out['đồ lệch khỏi chỗ bám (so với đứng 0)'].append((ten, m, r['nhan'], dx, dy))
            if prev and prev[0] == r['nhom'] and (abs(dx - prev[1]) > 2.5 or abs(dy - prev[2]) > 2.5):
                out['đồ giật giữa 2 khung liền'].append((ten, m, prev[3] + '->' + r['nhan'], round(dx - prev[1], 1), round(dy - prev[2], 1)))
            prev = (r['nhom'], dx, dy, r['nhan'])
for k, v in out.items():
    print('==', k, len(v))
    for x in v[:400]: print('  ', x)
