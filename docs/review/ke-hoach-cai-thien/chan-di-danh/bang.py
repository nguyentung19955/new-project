"""Bảng số đo TRƯỚC → SAU (markdown) từ do-truoc.json, do-sau.json (do.py). Gộp hai hướng trái / phải (cộng số nhịp lỗi, lấy max).
  python3 docs/review/ke-hoach-cai-thien/chan-di-danh/bang.py"""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
T, S = (json.load(open(os.path.join(H, f))) for f in ('do-truoc.json', 'do-sau.json'))
TEN = {'thuong_1': 'thương 1', 'thuong_2': 'thương 2', 'thuong_3': 'thương 3', 'thuong_quet': 'thương quét', 'thuong_giu': 'thương giữ',
       'thuong_xoc': 'thương xốc', 'db_thuong': 'thương đặc biệt', 'kiem_1': 'kiếm 1', 'kiem_2': 'kiếm 2', 'kiem_3': 'kiếm 3',
       'db_kiem': 'kiếm đặc biệt', 'bua_nen': 'búa nện', 'bua_giu': 'búa giữ', 'bua_nen_dat': 'búa nện đất', 'db_bua': 'búa đặc biệt',
       'phitieu': 'phi tiêu ném', 'phitieu_ngam': 'phi tiêu ngắm', 'phitieu_chum': 'phi tiêu chùm', 'db_phitieu': 'phi tiêu đặc biệt'}


def gop(D, che, vk):
    out = {}
    for h in ('phai', 'trai'):
        for ten, v in D.get('%s-%s-%s' % (che, vk, h), {}).items():
            o = out.setdefault(ten, {'nhip': 0, 'chan_max_pt': 0, 'chan_loi': 0, 'eo_max': 0, 'eo_loi': 0, 'ho_loi': 0, 'hai_bo_chan': 0, 'dau_loi': 0, 'truot': [], 'nhay_cho': 0})
            for k in ('nhip', 'chan_loi', 'eo_loi', 'ho_loi', 'hai_bo_chan', 'dau_loi', 'nhay_cho'):
                o[k] += v[k]
            o['chan_max_pt'] = max(o['chan_max_pt'], v['chan_max_pt']); o['eo_max'] = max(o['eo_max'], v['eo_max'])
            if v['truot_pt'] is not None: o['truot'].append(v['truot_pt'])
    return out


def s(a, b, f='%g'):
    a, b = (f % a if a is not None else '–'), (f % b if b is not None else '–')
    return a if a == b else '%s → **%s**' % (a, b)


print('| Đi / chạy | Đòn | Nhịp | Chân lệch lớn nhất % | Nhịp chân > 8 % | Eo lệch lớn nhất (điểm game) | Nhịp eo > 1 | Nhịp eo hở | Nhịp hai bộ chân | Nhịp đầu nhảy | Trượt chân % | Nhảy chỗ |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|')
for che in ('di', 'chay'):
    for vk in ('thuong', 'kiem', 'bua', 'phitieu'):
        a, b = gop(T, che, vk), gop(S, che, vk)
        for ten in b:
            x, y = a.get(ten), b[ten]
            if not x:
                continue
            ta = round(sum(x['truot']) / len(x['truot'])) if x['truot'] else None
            tb = round(sum(y['truot']) / len(y['truot'])) if y['truot'] else None
            print('| %s | %s | %d | %s | %s | %s | %s | %s | %s | %s | %s | %s |' % (
                'đi' if che == 'di' else 'chạy', TEN.get(ten, ten), y['nhip'], s(x['chan_max_pt'], y['chan_max_pt']), s(x['chan_loi'], y['chan_loi']),
                s(x['eo_max'], y['eo_max']), s(x['eo_loi'], y['eo_loi']), s(x['ho_loi'], y['ho_loi']), s(x['hai_bo_chan'], y['hai_bo_chan']),
                s(x['dau_loi'], y['dau_loi']), s(ta, tb), s(x['nhay_cho'], y['nhay_cho'])))
