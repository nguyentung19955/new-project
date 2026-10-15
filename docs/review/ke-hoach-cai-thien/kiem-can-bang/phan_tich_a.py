#!/usr/bin/env python3
"""A — gộp số đo của do_chien_dich.py thành bảng markdown (in ra) + số liệu cho ve_xem_a.py.
  python3 .../phan_tich_a.py <thư mục chứa cd-*.json> [--json=tom-tat.json]
Đọc: cd-khuyen-kiem.json (khuyên dùng + độ khó 2 + đo SM 75%), cd-lieu-kiem.json (không nghe lời khuyên + đo SM 75%),
     cd-khuyen-thuong.json, cd-khuyen-bua.json (nếu có)."""
import json, math, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

LOG = re.compile(r'^(cày|thử) (K2 )?(\d)-(\d) (thắng|THUA) +(\d+)s cấp +(\d+) SM +(\d+)/(\d+)')
TEN = lambda k: ('K2 ' if k >= 15 else '') + '%d-%d' % ((k % 15) // 5 + 1, k % 5 + 1)
REC = [95, 105, 125, 140, 175, 180, 215, 260, 275, 305, 310, 330, 410, 420, 520]


def fit75(pts):
    xs = [math.log(p) for p, _, _ in pts]
    mx = sum(xs) / len(xs)
    best = None
    for a10 in range(-60, 61):
        a = a10 / 10.0
        for b in [x * 0.5 for x in range(1, 121)]:
            ll = 0
            for (p, wn, n), x in zip(pts, xs):
                q = 1 / (1 + math.exp(-max(-30, min(30, a + b * (x - mx)))))
                q = min(1 - 1e-6, max(1e-6, q))
                ll += wn * math.log(q) + (n - wn) * math.log(1 - q)
            if best is None or ll > best[0]:
                best = (ll, a, b)
    _, a, b = best
    return math.exp(mx + (math.log(3) - a) / b)


def doc(d, f):
    p = os.path.join(d, f)
    return json.load(open(p)) if os.path.exists(p) else None


def med(xs):
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def thu_dau(run, k):
    """(Sức mạnh, cấp, thắng) ở lần THỬ đầu của ải k (k >= 15: độ khó 2) — từ log."""
    want = TEN(k)
    for ln in run['log']:
        m = LOG.match(ln)
        if m and m.group(1) == 'thử' and ((m.group(2) or '') + m.group(3) + '-' + m.group(4)) == want:
            return int(m.group(8)), int(m.group(7)), m.group(5) == 'thắng', int(m.group(9))
    return None


def bang_cd(D, nst, tieu):
    runs = [r for r in D['runs'] if r.get('st') and not r.get('ket')]
    m = len(runs)
    print(f"\n#### {tieu} — {m} lượt chiến dịch (Kiếm + Phi tiêu trừ khi ghi khác)\n")
    print('| Ải | Lần chơi TB (trung vị, lớn nhất) | Lượt kẹt ≥ 6 lần | Thua TB | Phút (cả cày) | SM lần thử đầu / khuyên dùng | Thắng lần thử đầu | Quá dễ* | SM khi qua | Cấp khi qua | Máu còn khi thắng |')
    print('|---|---|---|---|---|---|---|---|---|---|---|')
    rows = []
    for k in range(nst):
        pl = [r['st'][k]['plays'] for r in runs]
        td = [thu_dau(r, k) for r in runs]
        td = [x for x in td if x]
        rec = td[0][3] if td else 0
        de = sum(1 for x in td if x[2] and x[0] < 0.9 * x[3])
        hp = [r['st'][k]['hp'] for r in runs if r['st'][k]['hp'] is not None]
        row = {'k': k, 'plays': sum(pl) / m, 'med': med(pl), 'max': max(pl), 'ket': sum(1 for p in pl if p >= 6), 'fails': sum(r['st'][k]['fails'] for r in runs) / m,
               'phut': sum(r['st'][k]['t'] for r in runs) / m / 60, 'pw1': sum(x[0] for x in td) / max(1, len(td)), 'rec': rec,
               'win1': sum(1 for x in td if x[2]) / max(1, len(td)), 'de': de, 'pw': sum(r['st'][k]['pw'] for r in runs) / m,
               'lvl': sum(r['st'][k]['lvl'] for r in runs) / m, 'lvl1': sum(x[1] for x in td) / max(1, len(td)), 'hp': sum(hp) / max(1, len(hp))}
        rows.append(row)
        flag = ' ⚠' if row['plays'] >= 6 or row['ket'] >= m / 3 else ''
        print(f"| {TEN(k)} | {row['plays']:.1f}{flag} ({row['med']:g}, {row['max']}) | {row['ket']}/{m} | {row['fails']:.1f} | {row['phut']:.0f} | {row['pw1']:.0f} / {rec} ({row['pw1']/max(1,rec)*100-100:+.0f}%) | "
              f"{row['win1']*100:.0f}% | {de}/{len(td)} | {row['pw']:.0f} | {row['lvl']:.0f} | {row['hp']*100:.0f}% |")
    tt = [r['t'] / 60 for r in runs]
    tp = [sum(s['plays'] for s in r['st'][:nst]) for r in runs]
    t15 = [sum(s['t'] for s in r['st'][:15]) / 60 for r in runs]
    print(f"\nTổng: {sum(tp)/m:.0f} lần chơi (trung vị {med(tp):g}, {min(tp)}–{max(tp)}), {sum(tt)/m:.0f} phút = {sum(tt)/m/60:.1f} giờ cả ải ngày "
          f"({sum(t15)/m:.0f} phút cho 15 ải thường{', phần còn lại là độ khó 2 + ải ngày' if nst > 15 else ' + ải ngày'}). "
          "*Quá dễ = thắng ngay lần thử đầu khi Sức mạnh < 90% khuyên dùng.")
    return rows, runs


def kd_gop(ds):
    out = {}
    for D in ds:
        if not D:
            continue
        for k, v in D['kd'].items():
            o = out.setdefault(k, {'pts': [], 'rec': v['rec']})
            o['pts'] += [tuple(p) for p in v['pts']]
    for k, o in out.items():
        pts = sorted(o['pts'])
        tw = sum(w for _, w, _ in pts); tn = sum(n for _, _, n in pts)
        p = fit75(pts)
        tag = 'fit'
        if tw >= 0.95 * tn:
            p, tag = pts[0][0], 'le'
        elif p > pts[-1][0] * 1.25 or p < pts[0][0] * 0.75:
            p, tag = pts[-1][0], 'gt'
        o.update(p75=p, tag=tag, n=tn, w=tw, lo=pts[0][0], hi=pts[-1][0])
        # tỉ lệ thắng của bản lưu có SM trong ±5% khuyên dùng
        gan = [(w, n) for pw, w, n in pts if abs(pw / o['rec'] - 1) <= 0.05]
        o['gan'] = (sum(w for w, _ in gan), sum(n for _, n in gan))
    return out


def main():
    d = sys.argv[1]
    K = doc(d, 'cd-khuyen-kiem.json')
    L = doc(d, 'cd-lieu-kiem.json')
    tom = {}
    print('### 1. Chiến dịch')
    rk, runs_k = bang_cd(K, 30 if K.get('kho2') else 15, 'Kiểu "khuyen" (cày tới khuyên dùng rồi mới vào ải mới) — độ khó 1 rồi độ khó 2')
    rl, runs_l = bang_cd(L, 15, 'Kiểu "lieu" (không nhìn khuyên dùng, cứ vào ải mới)')
    tom['khuyen'] = rk; tom['lieu'] = rl
    for f, ten in (('cd-khuyen-thuong.json', 'Thương'), ('cd-khuyen-bua.json', 'Búa')):
        X = doc(d, f)
        if X:
            r, _ = bang_cd(X, 15, f'Kiểu "khuyen", món chính {ten}')
            tom['khuyen-' + f.split('-')[2].split('.')[0]] = r
    kd = kd_gop([K, L])
    tom['kd'] = kd
    print('\n### 2. Sức mạnh để bot thắng 75% mỗi ải (gộp bản lưu "khuyen" + "lieu", mỗi bản chơi lại 4 lần)\n')
    print('| Ải | Khuyên dùng | SM thắng 75% | Lệch | Thắng ở SM ±5% khuyên dùng | Khoảng SM đo | Số lượt |')
    print('|---|---|---|---|---|---|---|')
    for k in [TEN(i) for i in range(30)]:
        if k not in kd:
            continue
        o = kd[k]
        s = ('≤ %d' if o['tag'] == 'le' else '> %d' if o['tag'] == 'gt' else '%d') % o['p75']
        lech = (o['p75'] / o['rec'] - 1) * 100
        g = o['gan']
        print(f"| {k} | {o['rec']} | {s} | {'≤ ' if o['tag']=='le' else '> ' if o['tag']=='gt' else ''}{lech:+.0f}% | {('%d/%d (%.0f%%)' % (g[0], g[1], g[0]*100/g[1])) if g[1] else '—'} | {o['lo']}–{o['hi']} | {o['n']} |")
    # ĐƯỜNG CONG CẤP
    print('\n### 3. Đường cong cấp (kiểu "khuyen", độ khó 1)\n')
    print('| Ải | KN thắng 1 lượt (G.stageStats) | KN nhận TB khi đang ở ải này (mọi lượt + ải ngày) | trong đó ải ngày | Lượt cày TB | Cấp lúc thử đầu | Cấp khi qua | Lên mấy cấp từ lúc tới ải này tới lúc tới ải kế | KN cần cho cấp kế (lúc vào) | Số lượt thắng ải này để lên 1 cấp |')
    print('|---|---|---|---|---|---|---|---|---|---|')
    m = len(runs_k)
    cap_rows = []
    cap_rows = [{'k': k, 'base': 100 + 60 * k} for k in range(15)]
    # đi lại log + KN song song (mỗi lượt chơi ải thường đúng 1 bản ghi KN, ải ngày thêm bản ghi 'ngay')
    for r in runs_k:
        cur = 0; acc = [0] * 30; accn = [0] * 30
        plays_log = [LOG.match(x) for x in r['log']]
        plays_log = [x for x in plays_log if x]
        pi = 0
        for (nhan, win, xp, l0, l1, pw) in r['xp']:
            if nhan == 'ngay':
                accn[min(cur, 29)] += xp; acc[min(cur, 29)] += xp; continue
            if pi < len(plays_log):
                mm = plays_log[pi]; pi += 1
                acc[min(cur, 29)] += xp
                if mm.group(1) == 'thử' and mm.group(5) == 'thắng':
                    cur += 1
        r['_acc'] = acc; r['_accn'] = accn
    for k in range(15):
        row = cap_rows[k]
        row['xp'] = sum(r['_acc'][k] for r in runs_k) / m
        row['xpn'] = sum(r['_accn'][k] for r in runs_k) / m
        row['grind'] = sum(r['st'][k]['grind'] for r in runs_k) / m
        td = [thu_dau(r, k) for r in runs_k]
        td = [x for x in td if x]
        row['lvl1'] = sum(x[1] for x in td) / len(td)
        row['lvl'] = sum(r['st'][k]['lvl'] for r in runs_k) / m
        need = 50 + 50 * row['lvl1']
        row['need'] = need

    for k in range(15):
        row = cap_rows[k]
        nxt = cap_rows[k + 1]['lvl1'] if k < 14 else row['lvl']
        row['len'] = nxt - row['lvl1']
        print(f"| {TEN(k)} | {row['base']} | {row['xp']:.0f} | {row['xpn']:.0f} | {row['grind']:.1f} | {row['lvl1']:.1f} | {row['lvl']:.1f} | {row['len']:+.1f} | {row['need']:.0f} | {row['need']/row['base']:.1f} |")
    tom['cap'] = cap_rows
    reg = [cap_rows[0]['lvl1'], cap_rows[5]['lvl1'], cap_rows[10]['lvl1']]
    print(f"\nCấp lúc vào vùng (thử đầu ải 1 của vùng): Rừng già {reg[0]:.1f} · Hang biển {reg[1]:.1f} · Lâu đài cổ {reg[2]:.1f}; "
          f"cấp lúc qua 3-5: {cap_rows[14]['lvl']:.1f}; qua K2 3-5: {rk[29]['lvl']:.1f}" if len(rk) > 29 else '')
    tot_xp = sum(r['xp'] for r in cap_rows); tot_n = sum(r['xpn'] for r in cap_rows)
    print(f"KN cả 15 ải: {tot_xp:.0f} (ải ngày {tot_n:.0f} = {tot_n*100/max(1,tot_xp):.0f}%).")
    # nguồn mất máu
    hurt = {}
    for r in runs_k:
        for kk, x in r['hurt'].items(): hurt[kk] = hurt.get(kk, 0) + x
    tt = sum(hurt.values()) or 1
    print('Nguồn mất máu (cả chiến dịch, kiểu khuyen): ' + ', '.join(f"{kk} {x*100/tt:.0f}%" for kk, x in sorted(hurt.items(), key=lambda q: -q[1])))
    an = [r['aiNgay'] for r in runs_k if r.get('aiNgay')]
    if an:
        nn = sum(a['n'] for a in an)
        print(f"Ải ngày mỗi lượt chiến dịch: {nn/len(an):.0f} lượt, thắng {sum(a['win'] for a in an)*100/max(1,nn):.0f}%, {sum(a['t'] for a in an)/len(an)/60:.0f} phút.")
    cu = [r['cuoi'] for r in runs_k]
    print(f"Lúc kết thúc (sau K2 3-5 nếu có): cấp {sum(c['cap'] for c in cu)/len(cu):.1f}, Sức mạnh {sum(c['sm'] for c in cu)/len(cu):.0f}.")
    jf = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')]
    if jf:
        json.dump(tom, open(jf[0], 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
