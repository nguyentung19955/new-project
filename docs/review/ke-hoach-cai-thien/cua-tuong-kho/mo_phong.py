#!/usr/bin/env python3
"""MÔ PHỎNG CHỖ ĐỨNG trước trùm (Node, không trình duyệt): máu mất mỗi phút theo chỗ em bé đứng.
  python3 mo_phong.py <ải 0..14> <kiểu dung|ne> <pha 0|1> [giây] [js trước khi chạy] [lưới: luoi|mep]
In bảng (% máu tối đa mất mỗi phút) và tổng hợp chiêu trúng / số lần ra. Kết quả JSON: biến môi trường LK_RA=tệp.json.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME') or os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

LUOI = [(x / 7, y / 5) for y in range(6) for x in range(8)]
MEP = {'giữa': (0.5, 0.5), 'trên': (0.5, 0.0), 'dưới': (0.5, 1.0), 'trái': (0.0, 0.5), 'phải': (1.0, 0.5),
       'góc trên-trái': (0.0, 0.0), 'góc trên-phải': (1.0, 0.0), 'góc dưới-trái': (0.0, 1.0), 'góc dưới-phải': (1.0, 1.0)}


def chay(k, kieu, pha, giay=60, pre='', luoi='luoi', lap=1):
    errs = []
    pg = cd_lib.NodePage(errs)
    pg.evaluate('() => { const fs = 0; return 1; }')
    src = open(os.path.join(HERE, 'mo_phong.js'), encoding='utf-8').read()
    pg.evaluate('() => { (0, eval)(' + json.dumps(src) + '); return 1; }')
    REAL = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))
    pts = LUOI if luoi == 'luoi' else list(MEP.values())
    tong = None
    for _ in range(lap):
        r = pg.evaluate('(o) => G.__moPhong(o)', {'k': k, 'sv': REAL[k], 'pts': pts, 'giay': giay, 'pha': pha, 'kieu': kieu, 'pre': pre})
        if tong is None:
            tong = r
        else:
            for a, b in zip(tong, r):
                a['phut'] += b['phut']
                for n, q in b['trung'].items():
                    a['trung'].setdefault(n, [0, 0]); a['trung'][n][0] += q[0]; a['trung'][n][1] += q[1]
                for n, q in b['ra'].items():
                    a['ra'][n] = a['ra'].get(n, 0) + q
    for a in tong:
        a['phut'] = round(a['phut'] / lap, 1)
    pg.close()
    return tong


def tom(res):
    """Lưới 8×6: TB máu mất / phút ở từng mép và ở giữa (4×2 ô giữa)."""
    g = lambda x, y: res[y * 8 + x]['phut']
    tb = lambda a: round(sum(a) / len(a), 1)
    return {'trên': tb([g(x, 0) for x in range(8)]), 'dưới': tb([g(x, 5) for x in range(8)]), 'trái': tb([g(0, y) for y in range(6)]),
            'phải': tb([g(7, y) for y in range(6)]), 'giữa': tb([g(x, y) for x in range(2, 6) for y in range(2, 4)])}


def in_bang(res, luoi):
    if luoi == 'luoi':
        for y in range(6):
            print('  ' + ' '.join(f"{res[y*8+x]['phut']:6.1f}" for x in range(8)))
        print('  TB:', ' · '.join(f"{k} {v}" for k, v in tom(res).items()))
    else:
        for (ten, _), a in zip(MEP.items(), res):
            tr = ', '.join(f"{n} {round(q[1])}" for n, q in sorted(a['trung'].items(), key=lambda z: -z[1][0]))
            ra = ', '.join(f"{n} {q}" for n, q in a['ra'].items())
            print(f"  {ten:14s} {a['phut']:6.1f}%/phút · trúng: {tr or '-'} · ra: {ra} · trùm cuối ở ({a['bx']},{a['by']}) bé ({a['px']},{a['py']})")


if __name__ == '__main__':
    k = int(sys.argv[1]); kieu = sys.argv[2]; pha = int(sys.argv[3])
    giay = int(sys.argv[4]) if len(sys.argv) > 4 else 60
    pre = sys.argv[5] if len(sys.argv) > 5 else ''
    luoi = sys.argv[6] if len(sys.argv) > 6 else 'luoi'
    lap = int(os.environ.get('LK_LAP') or 1)
    res = chay(k, kieu, pha, giay, pre, luoi, lap)
    in_bang(res, luoi)
    if os.environ.get('LK_RA'):
        json.dump(res, open(os.environ['LK_RA'], 'w'), ensure_ascii=False)
