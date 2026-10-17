"""Luyện 1–15: hình hiệu ứng của mỗi cấp (kiếm 3 nhát, trúng 3 quái) — cấp nào đổi hình. Chạy: python3 luyen.py <ra.json> [them]"""
import sys, json
from lib import *
RA = sys.argv[1]; THEM = sys.argv[2] if len(sys.argv) > 2 else ''
kq = {}
with sync_playwright() as p:
    b, g, loi = mo(p, THEM)
    for el in ('fire', 'poison', 'ice'):
        for wt, don, n in (('sword', 'cham3', 90), ('hammer', 'cham1', 60)):
            for lv in range(1, 16):
                r = g.evaluate("(o) => { const r = HE.chay(o); delete r.anh; return { st: r.st, el: r.el, luyen: r.luyen, hinh: r.hinh.filter(h => !h.an).map(h => h.ten + ':' + h.ms + ':' + (h.vien || 0)), song: Math.max(0, ...r.song), hat: Math.max(0, ...r.hat), so: r.so.length }; }",
                               {'wt': wt, 'el': el, 'st': 0, 'luyen': lv, 'don': don, 'n': n, 'bia': 'ba'})
                kq['%s|%s|%d' % (wt, el, lv)] = r
                print(wt, el, lv, r['st'], len(r['hinh']), r['song'], r['hat'], flush=True)
    print('pageerror:', loi or 'không có')
    b.close()
json.dump(kq, open(RA, 'w'), ensure_ascii=False, indent=0)
