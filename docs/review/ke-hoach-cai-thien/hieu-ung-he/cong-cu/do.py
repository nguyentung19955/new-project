"""Phần A — đo hiệu ứng hệ: 3 hệ x 4 hình thái (Trắng, Mầm, Thành hình, Thức tỉnh) x mọi đòn, trúng 1 / trúng 3 / trượt (+ mặt nạ hình),
và vùng trúng thật (lưới quái). Ghi JSON vào thư mục so/. Chạy:  python3 do.py [chỉ:mã-đòn] [them=?cờ]"""
import sys, json, os, time
from lib import *
CHI = os.environ.get('CHI')
THEM = os.environ.get('THEM', '')
RA = os.environ.get('RA', '/tmp/claude-0/-home-claude-new-project/464d86e3-09ad-5a07-a066-aef38e798032/scratchpad/w/do-a.json')
MOVES = [
 ('kiem-3nhat', 'sword', 'cham3', 90, [[0, 20], [20, 40], [40, 90]]),
 ('kiem-luot', 'sword', 'nelot', 60, None),
 ('kiem-tram-nguyet', 'sword', 'dacbiet', 80, None),
 ('thuong-dam-quet', 'spear', 'cham4', 115, [[0, 22], [22, 44], [44, 66], [66, 115]]),
 ('thuong-xoc-toi', 'spear', 'giu40', 80, None),
 ('thuong-phi-thuong', 'spear', 'dacbiet', 130, None),
 ('bua-nen', 'hammer', 'cham1', 60, None),
 ('bua-nen-dat-1', 'hammer', 'giu40', 100, None),
 ('bua-nen-dat-2', 'hammer', 'giu72', 130, None),
 ('bua-dia-chan', 'hammer', 'dacbiet', 80, None),
 ('phitieu-3', 'bow', 'cham3', 80, [[0, 20], [20, 40], [40, 80]]),
 ('phitieu-chum', 'bow', 'giu50', 90, None),
 ('phitieu-mua', 'bow', 'dacbiet', 90, None),
 ('chuong', 'sword', 'chuong', 90, None),
]
ELS = ['fire', 'poison', 'ice']
# Tình huống riêng: phản ứng giữa các hệ, đóng băng / vỡ băng, nổ lan / lây độc khi quái chết, đánh trùm (kiếm 3 nhát)
DAC = [
 ('phan-ung-khoi', 'sword', 'fire', 3, {'truocSt': {'poisonN': 3, 'poisonT': 5, 'poisonDmg': 1}}),   # Lửa đánh quái đang Độc → Nổ khói
 ('phan-ung-khoi', 'sword', 'poison', 3, {'truocSt': {'fire': 3, 'fireDmg': 1}}),                       # Độc đánh quái đang cháy → Nổ khói
 ('phan-ung-soc-nhiet', 'sword', 'fire', 3, {'truocSt': {'iceN': 2, 'iceT': 4}}),                        # Lửa đánh quái đang Băng → Sốc nhiệt
 ('phan-ung-soc-nhiet', 'sword', 'ice', 3, {'truocSt': {'fire': 3, 'fireDmg': 1}}),                      # Băng đánh quái đang cháy → Sốc nhiệt
 ('dong-bang-vo', 'sword', 'ice', 3, {'truocSt': {'iceN': 4, 'iceT': 4}}),                               # Băng tầng 5 → đóng băng, đánh tiếp → vỡ (Thức tỉnh)
 ('dong-bang-vo', 'sword', 'ice', 1, {'truocSt': {'iceN': 4, 'iceT': 4}}),
 ('no-lan-khi-chet', 'sword', 'fire', 3, {'giuMau': False, 'mau': 30, 'truocSt': {'fire': 3, 'fireDmg': 1}}),
 ('lay-doc-khi-chet', 'sword', 'poison', 3, {'giuMau': False, 'mau': 30, 'truocSt': {'poisonN': 3, 'poisonT': 5, 'poisonDmg': 1}}),
 ('trum', 'sword', 'fire', 1, {'trum': True}), ('trum', 'sword', 'fire', 3, {'trum': True}),
 ('trum', 'sword', 'poison', 1, {'trum': True}), ('trum', 'sword', 'poison', 3, {'trum': True}),
 ('trum', 'sword', 'ice', 1, {'trum': True}), ('trum', 'sword', 'ice', 3, {'trum': True}),
]
CHI_VUNG = os.environ.get('CHI_VUNG')
kq = json.load(open(RA)) if os.path.exists(RA) and (os.environ.get('NOI') or CHI_VUNG) else {}
t0 = time.time()
with sync_playwright() as p:
    b, g, loi = mo(p, THEM)
    for (ma, wt, don, n, cua) in MOVES:
        if CHI and not ma.startswith(CHI): continue
        for el in ELS:
            for st in (0, 1, 2, 3):
                if st == 0 and el != 'fire': continue  # Trắng: không hệ, đo một lần
                k = '%s|%s|%d' % (ma, el if st else '-', st)
                o = {'wt': wt, 'el': el if st else None, 'st': st, 'don': don, 'n': n, 'cua': cua}
                if ma == 'chuong':
                    if st == 0: continue
                    o['chuong'] = el; o['el'] = None; o['st'] = 0
                kq_k = kq.get(k, {}) if CHI_VUNG else {}
                for bia in (() if CHI_VUNG else ('khong', 'truot', 'mot', 'ba')):
                    o2 = dict(o, bia=bia, mat=(bia == 'khong'), tachLop=(bia == 'ba'))
                    r = g.evaluate("""(o) => { if (o.chuong) { const c = HE.cay(o.chuong); o.chuong = c; o.chuongN = o.chuongDay ? HE.dayCay(c) : {}; }
                       const r = HE.chay(o); delete r.anh; return r; }""", dict(o2, chuongDay=(st == 3)))
                    if r.get('mat'):
                        for m in r['mat']: m.pop('ds', None) if os.environ.get('NHE') else None
                    kq_k[bia] = r
                vt = g.evaluate("(o) => { if (o.chuong) { const c = HE.cay(o.chuong); o.chuong = c; o.chuongN = o.chuongDay ? HE.dayCay(c) : {}; } return HE.vungTrung(o); }", dict(o, chuongDay=(st == 3)))
                kq_k['vung'] = vt
                kq[k] = kq_k
                h = kq_k.get('ba')
                print('%-34s hinh=%2d songMax=%2d hatMax=%3d trung=%d so=%d  (%.0fs)' % (k, len(h['hinh']), max(h['song'] or [0]), max(h['hat'] or [0]), len(h['trung']), len(h['so']), time.time() - t0), flush=True) if h else None
        os.makedirs(os.path.dirname(RA), exist_ok=True)
        json.dump(kq, open(RA, 'w'), ensure_ascii=False)
    for (ma, wt, el, st, them) in ([] if CHI_VUNG else DAC):
        if CHI and not ('dac:' + ma).startswith(CHI) and CHI != 'dac': continue
        k = 'dac:%s|%s|%d' % (ma, el, st)
        kq_k = {}
        for bia in (('mot',) if them.get('trum') else ('mot', 'ba')):
            o = dict({'wt': wt, 'el': el, 'st': st, 'don': 'cham3', 'n': 120, 'bia': [] if them.get('trum') else bia, 'tachLop': True}, **them)
            if them.get('trum'): o['kc'] = 40
            r = g.evaluate("(o) => { const r = HE.chay(o); delete r.anh; return r; }", o)
            kq_k[bia] = r
        kq[k] = kq_k
        h = kq_k['mot']
        print('%-34s hinh=%2d songMax=%2d phanUng=%s so=%d' % (k, len(h['hinh']), max(h['song'] or [0]), [q['kind'] for q in h['phanUng']][:6], len(h['so'])), flush=True)
    json.dump(kq, open(RA, 'w'), ensure_ascii=False)
    print('pageerror:', loi or 'không có')
    b.close()
json.dump(kq, open(RA, 'w'), ensure_ascii=False)
