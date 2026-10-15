#!/usr/bin/env python3
"""A — gộp số đo của do_trum_a.py thành bảng markdown (in ra).
  python3 .../bang_trum.py <thư mục chứa trum-*.json>
Đọc: trum-thuong.json (đủ máu, không lớp), trum-that-nho.json + trum-that-vung.json (LK_MAU=0.9 + LK_LOP như lượt thật), trum-mep-ne.json, trum-mep.json, trum-dung.json, trum-dung-p2.json, trum-dung-p3.json."""
import json, os, sys

CHO = ['giua', 'tren', 'duoi', 'trai', 'phai', 'goc-tt', 'goc-tp', 'goc-dt', 'goc-dp']
TEN_CHO = {'giua': 'giữa', 'tren': 'mép trên', 'duoi': 'mép dưới', 'trai': 'mép trái', 'phai': 'mép phải',
           'goc-tt': 'góc trên-trái', 'goc-tp': 'góc trên-phải', 'goc-dt': 'góc dưới-trái', 'goc-dp': 'góc dưới-phải'}
DON_TA = {'sk': 'chiêu riêng', 'đi': 'đòn thường', 'gai': 'xả gai', 'no': 'nổ quanh mình', 'melee': 'đòn thường', 'tinh anh: vùng/đạn': 'vùng/đạn còn lại'}


def doc(d, f):
    p = os.path.join(d, f)
    return json.load(open(p)) if os.path.exists(p) else []


def ten_muc(r):
    m = r['muc']
    if 'tinh anh' in m:
        return 'Tinh anh ' + r['ten'] + ' (' + m.split()[0] + ')'
    return m + ' ' + r['ten']


def nhan(k):
    for a, b in DON_TA.items():
        if k.startswith(a):
            return b + k[len(a):]
    return k


def main():
    d = sys.argv[1]
    T = doc(d, 'trum-thuong.json')
    T65 = {r['muc']: r for r in doc(d, 'trum-that-nho.json') + doc(d, 'trum-that-vung.json')}
    print('### Từng trùm ở Sức mạnh = khuyên dùng (bot thường né như người chơi; vào thẳng phòng trùm, 60 lượt mỗi dòng)\n')
    print('| Trùm (ải) | SM / khuyên dùng | Thắng: vào thẳng, đủ máu, trùm không lớp thích nghi | Thắng như lượt thật: 90% máu + lớp thích nghi (Kháng Lửa; trùm vùng thêm Chống áp sát) | Thời gian đánh | Máu còn khi thắng | Máu mất / phút | Đòn to nhất (% máu) | Chiêu gây mất máu nhiều nhất (phần trong tổng · to nhất 1 lần) | Chiêu ra nhiều mà gần như không trúng |')
    print('|---|---|---|---|---|---|---|---|---|---|')
    for r in T:
        hb = r['hb']
        top = sorted(hb.items(), key=lambda q: -q[1][0])[:3]
        mx = max([v[2] for v in hb.values()] or [0])
        # chiêu "vô hại": ra >= 0,8 lần/phút mà trúng < 0,05 lần mỗi lần ra
        vh = []
        for k, c in sorted((r.get('cast') or {}).items(), key=lambda q: -q[1]):
            hits = sum(v[1] for kk, v in hb.items() if kk.startswith(k))
            if c >= 0.8 and hits / c < 0.05:
                vh.append(f"{k} ({c:.1f}/ph, trúng {hits/c*100:.0f}%)")
        t65 = T65.get(r['muc'])
        print(f"| {ten_muc(r)} | {r['sm']}/{r['rec']} | {r['thang']}/{r['n']} ({r['thang']*100/r['n']:.0f}%) | "
              f"{('%d/%d (%.0f%%)' % (t65['thang'], t65['n'], t65['thang']*100/t65['n'])) if t65 else '—'} | {r['tThang'] or 0:.0f} s | {r['hpThang'] or 0:.0f}% | {r['mauPhut']:.0f}% | {mx:.0f}% | "
              + '; '.join(f"{nhan(k)} {v[3]:.0f}% · {v[2]:.0f}%" for k, v in top) + ' | ' + ('; '.join(vh[:4]) or '—') + ' |')

    M = doc(d, 'trum-mep-ne.json')
    M0 = {(r['muc'], r['cho']): r for r in doc(d, 'trum-mep.json')}
    D0 = {(r['muc'], r['cho']): r for r in doc(d, 'trum-dung.json')}
    D2 = {(r['muc'], r['cho']): r for r in doc(d, 'trum-dung-p2.json')}
    Tm = {r['muc']: r for r in T}
    print('\n### Đứng sát mép / góc (bot "mep né": đứng lì một chỗ, trùm tới tầm thì chém, chỉ né khi đứng trong vùng đỏ / đạn sắp trúng rồi quay về chỗ; 20 lượt mỗi ô)\n')
    print('Mỗi ô: **máu mất / phút** · thắng / 20 · giây đánh. Đậm + ✓ = chỗ đứng an toàn: máu mất / phút ≤ ½ của đứng giữa VÀ ≤ ½ của bot thường, thắng không kém đứng giữa.\n')
    print('| Trùm (ải) | Bot thường | ' + ' | '.join(TEN_CHO[c] for c in CHO) + ' | Chỗ an toàn |')
    print('|---|---|' + '---|' * len(CHO) + '---|')
    muc = []
    for r in M:
        if r['muc'] not in muc:
            muc.append(r['muc'])
    an_toan = {}
    for m in muc:
        rs = {r['cho']: r for r in M if r['muc'] == m}
        g = rs['giua']
        bt = Tm.get(m)
        cells = []
        safe = []
        for c in CHO:
            x = rs.get(c)
            if not x:
                cells.append('—'); continue
            ok = c != 'giua' and x['mauPhut'] <= 0.5 * g['mauPhut'] and (bt is None or x['mauPhut'] <= 0.5 * bt['mauPhut']) and x['thang'] >= g['thang']
            s = f"{x['mauPhut']:.0f}% · {x['thang']}/{x['n']} · {x['tThang'] or 0:.0f}s"
            if ok:
                s = '**' + s + ' ✓**'; safe.append(TEN_CHO[c])
            cells.append(s)
        an_toan[m] = safe
        r0 = rs['giua']
        print(f"| {ten_muc(r0)} | {bt['mauPhut']:.0f}% · {bt['thang']*20/bt['n']:.0f}/20 · {bt['tThang'] or 0:.0f}s | " + ' | '.join(cells) + ' | ' + (', '.join(safe) or 'không') + ' |'
              if bt else f"| {ten_muc(r0)} | — | " + ' | '.join(cells) + ' | ' + (', '.join(safe) or 'không') + ' |')
    print('\n### Đứng im không né, không đánh (máu không hết, đo máu mất / phút theo chỗ đứng; 2 × 60 giây mỗi ô) — pha 1 / pha sau (máu trùm ép 45%)\n')
    print('| Trùm (ải) | ' + ' | '.join(TEN_CHO[c] for c in CHO) + ' | Thấp nhất / cao nhất |')
    print('|---|' + '---|' * len(CHO) + '---|')
    for m in muc:
        v1 = [D0.get((m, c)) for c in CHO]
        v2 = [D2.get((m, c)) for c in CHO]
        if not v1[0]:
            continue
        cells = [f"{a['mauPhut']:.0f} / {b['mauPhut']:.0f}" if a and b else '—' for a, b in zip(v1, v2)]
        lo = min(a['mauPhut'] for a in v1 if a); hi = max(a['mauPhut'] for a in v1 if a)
        print(f"| {ten_muc(v1[0])} | " + ' | '.join(cells) + f" | {lo/hi*100:.0f}% |")
    print('\n### Đứng sát mép KHÔNG né (đứng lì + chém, máu thật, có bình; 10 lượt mỗi ô): số lượt thắng\n')
    print('| Trùm (ải) | ' + ' | '.join(TEN_CHO[c] for c in CHO) + ' |')
    print('|---|' + '---|' * len(CHO))
    for m in muc:
        v = [M0.get((m, c)) for c in CHO]
        if not v[0]:
            continue
        print(f"| {ten_muc(v[0])} | " + ' | '.join(f"{x['thang']}/{x['n']}" if x else '—' for x in v) + ' |')
    json.dump(an_toan, open(os.path.join(d, 'an-toan.json'), 'w'), ensure_ascii=False)


main()
