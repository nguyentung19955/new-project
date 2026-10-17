"""ĐO TẦM: vùng hình vệt (mặt nạ điểm ảnh hiệu ứng, chạy không quái) so với vùng trúng thật (lưới quái). Chạy: python3 tam.py <do-x.json> <ra.md> <ra.json>
Tầm trúng (mép gần thân quái) = tâm quái xa nhất còn trúng trên hàng ngang của Cu Tí − bán kính thân. Tầm hình = điểm ảnh hiệu ứng xa nhất
(trong dải cao của thân quái, hiện ≥ 2 khung) theo hướng đánh. Lệch = tầm hình − tầm trúng: > 0 là hình kéo xa hơn chỗ trúng (quái đứng ở
khoảng lệch này trông như bị chém mà không mất máu); < 0 là đòn trúng xa hơn hình."""
import sys, json
d = json.load(open(sys.argv[1])); RA_MD, RA_JS = sys.argv[2], sys.argv[3]
CUA = {'kiem-3nhat': [[0, 20], [20, 40], [40, 90]], 'thuong-dam-quet': [[0, 22], [22, 44], [44, 66], [66, 115]], 'phitieu-3': [[0, 20], [20, 40], [40, 80]]}
TEN_NHAT = {'kiem-3nhat': ['nhát 1 (lê → hất lên)', 'nhát 2 (bổ xuống)', 'nhát 3 (chém ngang)'], 'thuong-dam-quet': ['đâm 1', 'đâm 2', 'đâm 3', 'quét vòng']}
TEN_DON = {'kiem-3nhat': 'Kiếm nặng', 'kiem-luot': 'Kiếm lướt chém', 'thuong-dam-quet': 'Thương', 'thuong-xoc-toi': 'Thương xốc tới', 'bua-nen': 'Búa nện', 'bua-nen-dat-1': 'Búa nện đất nấc 1', 'bua-nen-dat-2': 'Búa nện đất nấc 2'}
HE = {'fire': 'Lửa', 'poison': 'Độc', 'ice': 'Băng', '-': 'Trắng'}
out = {}; L = ['| Đòn | Nhát | Hệ · bậc | Tầm trúng thật (mép thân quái) | Tầm hình vệt | Lệch (hình − trúng) | Phía sau lưng: hình / trúng | Cao hình vệt (trên chân) |', '|---|---|---|---|---|---|---|---|']
for k, v in d.items():
    if k.startswith('dac:'): continue
    ma, el, st = k.split('|'); st = int(st)
    if ma not in TEN_DON: continue
    kh = v.get('khong') or v['truot']; vt = v['vung']; r = vt['r']; h = vt['h']
    cua = CUA.get(ma) or [[0, 10 ** 6]]
    for ci, c in enumerate(cua):
        m = (kh.get('mat') or [None] * len(cua))[ci]
        xs = []; ys = []; sau = []
        if m and m.get('ds'):
            ds = m['ds']
            for i in range(0, len(ds), 3):
                x, y, n = ds[i], ds[i + 1], ds[i + 2]
                if n < 2: continue
                if -h - 6 <= y <= 4: (xs if x >= 0 else sau).append(x)
                ys.append(y)
        hang = [(pt, rs) for pt, rs in zip(vt['pts'], vt['res']) if pt[1] == 0]
        trung = [pt[0] for pt, rs in hang if any(c[0] <= q < c[1] for q in rs['ks'])]
        tt = (max(trung) - r) if trung else None; tsau = (min(trung) + r) if trung else None
        th = max(xs) if xs else None
        lech = (th - tt) if (th is not None and tt is not None) else None
        q = {'tam_trung': tt, 'tam_hinh': th, 'lech': lech, 'sau_hinh': min(sau) if sau else None, 'sau_trung': tsau if (tsau is not None and tsau < 0) else None, 'cao_hinh': -min(ys) if ys else None}
        out['%s|%s|%d|%d' % (ma, el, st, ci + 1)] = q
        if st in (0, 1, 3):
            L.append('| %s | %s | %s · %s | %s | %s | %s | %s / %s | %s |' % (TEN_DON[ma], (TEN_NHAT.get(ma) or ['—'] * 9)[ci], HE[el], {0: 'Trắng', 1: 'Mầm', 3: 'Thức tỉnh'}[st],
                     tt, th, ('**%+d**' % lech if lech is not None and lech > 6 else ('%+d' % lech if lech is not None else '—')), q['sau_hinh'], q['sau_trung'] if q['sau_trung'] is not None else 'không', q['cao_hinh']))
json.dump(out, open(RA_JS, 'w'), ensure_ascii=False, indent=1)
open(RA_MD, 'w').write('\n'.join(L) + '\n')
print('ok', len(out))
