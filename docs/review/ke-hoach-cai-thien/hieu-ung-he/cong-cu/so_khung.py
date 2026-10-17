"""So từng khung hình giữa hai bản (vd bản gốc và bản mới ?hemoi=0): chụp cả ô quanh Cu Tí mỗi 2 nhịp, ghi mã băm.
Chạy: python3 so_khung.py <ra.json> [them]"""
import sys, json, hashlib, base64
from lib import *
RA = sys.argv[1]; THEM = sys.argv[2] if len(sys.argv) > 2 else ''
CA = [(wt, el, st, don, n, bia) for el in ('fire', 'poison', 'ice') for st in (1, 3) for (wt, don, n) in (('sword', 'cham3', 90), ('spear', 'cham4', 115), ('hammer', 'giu72', 130), ('bow', 'cham3', 80), ('sword', 'dacbiet', 80)) for bia in ('ba', 'truot')]
import os
CHI = os.environ.get('CHI')
if CHI: CA = [c for c in CA if ('%s|%s|%d|%s|%s' % c[:3] + c[3:4] + c[5:6]).startswith(CHI)] if False else [c for c in CA if '%s|%s|%d|%s|%s' % (c[0], c[1], c[2], c[3], c[5]) in CHI.split(',')]
kq = {}
with sync_playwright() as p:
    b, g, loi = mo(p, THEM)
    for (wt, el, st, don, n, bia) in CA:
        r = g.evaluate("(o) => HE.chay(o)", {'wt': wt, 'el': el, 'st': st, 'don': don, 'n': n, 'bia': bia, 'chup': True, 'chupMoi': 2, 'chupW': 200, 'chupH': 120, 'chupK': 1})
        kq['%s|%s|%d|%s|%s' % (wt, el, st, don, bia)] = [hashlib.md5(base64.b64decode(u.split(',')[1])).hexdigest()[:12] for u in r['anh']]
    kq['_loi'] = loi
    b.close()
json.dump(kq, open(RA, 'w'))
print('xong', len(kq) - 1, 'ca; lỗi trang:', loi or 'không')
