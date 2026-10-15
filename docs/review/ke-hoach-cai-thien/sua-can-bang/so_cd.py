# so_cd.py truoc.json sau.json — bảng chiến dịch trước/sau theo ải
import json, sys
def tom(f):
    d = json.load(open(f)); R = d['runs']; n = len(R); o = []
    for k in range(15):
        st = [r['st'][k] for r in R if len(r['st']) > k]
        pl = sum(s['plays'] for s in st) / len(st)
        ke = sum(1 for s in st if s['plays'] >= 6)
        dau = sum(1 for s in st if s['att'] and s['att'][0][1]) / len(st)
        thua = sum(s['fails'] for s in st) / len(st)
        o.append((pl, ke, dau, thua))
    tong = sum(sum(s['plays'] for s in r['st']) for r in R) / n
    t = sum(r['t'] for r in R) / n / 3600
    return o, tong, t, n
a, ta, ha, na = tom(sys.argv[1]); b, tb, hb, nb = tom(sys.argv[2])
print(f'| Ải | Lần chơi TB trước → sau | Kẹt ≥ 6 lần | Thắng lần thử đầu | Thua TB |')
print('|---|---|---|---|---|')
for k in range(15):
    x, y = a[k], b[k]
    print(f'| {k//5+1}-{k%5+1} | {x[0]:.1f} → {y[0]:.1f} | {x[1]}/{na} → {y[1]}/{nb} | {x[2]*100:.0f}% → {y[2]*100:.0f}% | {x[3]:.1f} → {y[3]:.1f} |')
print(f'| **Cả 15 ải** | **{ta:.1f} → {tb:.1f}** | | | |')
print(f'\nThời gian trong trận (cả cày, cả ải ngày): {ha:.1f} → {hb:.1f} giờ ({na} / {nb} lượt chiến dịch).')
