"""Tóm tắt tình huống riêng (phản ứng hệ, đóng băng, nổ lan, lây độc, trùm) từ do-a.json → JSON gọn + bảng Markdown."""
import sys, json, collections
d = json.load(open(sys.argv[1])); RA_MD, RA_JS = sys.argv[2], sys.argv[3]
TEN = {'phan-ung-khoi': 'Nổ khói (Lửa + Độc)', 'phan-ung-soc-nhiet': 'Sốc nhiệt (Lửa + Băng)', 'dong-bang-vo': 'Đóng băng (5 tầng Băng) rồi vỡ', 'no-lan-khi-chet': 'Nổ lan khi quái cháy chết', 'lay-doc-khi-chet': 'Lây độc khi quái trúng độc chết', 'trum': 'Đánh trùm Mộc Tinh (kiếm 3 nhát)'}
HE = {'fire': 'Lửa', 'poison': 'Độc', 'ice': 'Băng'}; BAC = {1: 'Mầm', 3: 'Thức tỉnh'}
gon = {}; L = ['| Tình huống | Hệ đòn | Bậc | Hình hiệu ứng (tên ảnh ×lần, ms) | Lớp cùng lúc tối đa | Phản ứng ghi được | Số hiện trên quái |', '|---|---|---|---|---|---|---|']
for k, v in d.items():
    if not k.startswith('dac:'): continue
    ma, el, st = k[4:].split('|'); st = int(st)
    m = v['mot']
    c = collections.OrderedDict()
    for h in m['hinh']:
        if h.get('an'): continue
        q = c.setdefault(h['ten'], [0, set()]); q[0] += 1; q[1].add(h['ms'])
    hinh = '; '.join('%s%s %s' % (t.replace('hu-', ''), '×%d' % q[0] if q[0] > 1 else '', '/'.join(str(x) for x in sorted(q[1])[:2])) for t, q in c.items())
    so = ', '.join('%s%s' % (q['s'], '·nhịp' if q['dot'] else '') for q in m['so'][:8])
    pu = ', '.join(q['kind'] for q in m['phanUng'])
    gon[k] = {'hinh': {t: {'n': q[0], 'ms': sorted(q[1])} for t, q in c.items()}, 'lop_max': max(m['song'] or [0]), 'phan_ung': [q['kind'] for q in m['phanUng']], 'so': m['so'], 'lop_thay_duoc': m.get('lopPx')}
    L.append('| %s | %s | %s | %s | %d | %s | %s |' % (TEN.get(ma, ma), HE[el], BAC.get(st, st), hinh, max(m['song'] or [0]), pu or '—', so or '—'))
json.dump(gon, open(RA_JS, 'w'), ensure_ascii=False, indent=1)
open(RA_MD, 'w').write('\n'.join(L) + '\n')
print('ok', len(gon))
