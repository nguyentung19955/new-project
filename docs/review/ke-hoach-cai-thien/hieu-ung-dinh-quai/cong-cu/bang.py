"""Viết bảng đo (markdown) từ so-lieu/<nhãn>-ca.json: bảng tổng theo hiệu ứng + bảng hiệu ứng × quái.
  python3 bang.py truoc  → ../bang-<nhãn>.md"""
import json, os, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__))
SL = os.path.join(os.path.dirname(HERE), 'so-lieu')
sys.path.insert(0, HERE)
from phan_tich import phan_loai, TEN_LOAI, VUNG

COT = [  # (tên cột ngắn, hàm chọn nhóm)
    ('Kiếm', lambda n: n == 'Hình trúng — Kiếm (3 nhát)'), ('Thương', lambda n: n == 'Hình trúng — Thương (đâm/quét)'),
    ('Búa', lambda n: n == 'Hình trúng — Búa nện'), ('Phi tiêu', lambda n: n == 'Hình trúng — Phi tiêu bay'),
    ('Trảm Nguyệt', lambda n: n == 'Hình trúng — Trảm Nguyệt'), ('Phi Thương', lambda n: n == 'Hình trúng — Phi Thương'),
    ('Địa Chấn', lambda n: n == 'Hình trúng — Địa Chấn'), ('Mưa PT', lambda n: n == 'Hình trúng — Mưa phi tiêu'),
    ('Hỏa ch.', lambda n: n == 'Hình trúng — Hỏa chưởng'), ('Độc ch.', lambda n: n == 'Hình trúng — Độc chưởng'), ('Băng ch.', lambda n: n == 'Hình trúng — Băng chưởng'),
    ('Phúc lành/hệ', lambda n: n.startswith('Phúc lành')), ('Số', lambda n: n == 'Số sát thương'),
    ('Cháy', lambda n: n == 'Trạng thái: Cháy'), ('Độc', lambda n: n == 'Trạng thái: Độc'), ('Băng', lambda n: n == 'Trạng thái: Băng (chậm)'),
    ('Đóng băng', lambda n: n == 'Trạng thái: Đóng băng'), ('Choáng', lambda n: n == 'Trạng thái: Choáng'), ('Trói', lambda n: n.startswith('Trạng thái: Trói')),
    ('Chậm', lambda n: n.startswith('Trạng thái: Chậm')), ('Biểu tượng', lambda n: n.startswith('Biểu tượng')),
    ('Vừa dính', lambda n: n.startswith('Vừa')), ('Chết→tắt', lambda n: n.startswith('Tắt khi')),
    ('Mép phòng', lambda n: n.startswith('Mép')), ('Đòn quái', lambda n: n.startswith('Đòn quái')),
]
NGAN = {'không theo khi bị hất': 'hất', 'không theo khi di chuyển': 'đi', 'sai cỡ': 'cỡ', 'sai lớp': 'lớp', 'không tắt': 'tắt'}


def o(cs):
    co = [c for c in cs if c['kq'] != 'không có hình']
    if not cs: return ''
    if not co: return '–'
    bad = [c for c in co if c['kq'] != 'dính']
    if not bad: return '✓'
    loai = collections.Counter(NGAN.get(c['kq'], 'lệch') for c in bad)
    s = []
    for k, n in loai.most_common():
        if k == 'lệch': s.append('lệch %d' % round(max(c['x'] for c in bad if c['kq'] == 'lệch')))
        else: s.append(k)
    return ' · '.join(s) + (' (%d/%d)' % (len(bad), len(co)) if len(bad) < len(co) else '')


def viet(nhan, them=None):
    k = json.load(open(os.path.join(SL, nhan + '.json')))
    cs = phan_loai(k)
    co = [c for c in cs if c['kq'] != 'không có hình']
    dung = sum(1 for c in co if c['kq'] == 'dính')
    L = ['# Bảng đo hiệu ứng dính quái — `%s` (NET %s%s)' % (nhan, k.get('net'), (', url ' + k['url']) if k.get('url') else ''), '',
         'Tổng: **%d ca**, đúng (dính) **%d**, lệch **%d**. Ca "không có hình" (trạng thái không có hình riêng) không tính: %d.' % (len(co), dung, len(co) - dung, len(cs) - len(co)), '',
         '## Theo hiệu ứng', '', '| Hiệu ứng | Ca | Dính | Lệch | Kiểu lệch hay gặp |', '|---|---:|---:|---:|---|']
    g = collections.defaultdict(list)
    for c in co: g[c['nhom']].append(c)
    for n in sorted(g):
        v = g[n]; d = sum(1 for c in v if c['kq'] == 'dính')
        lo = collections.Counter((c['kq'] if c['kq'] != 'lệch' else 'lệch: ' + (c['ghi'].split(' ')[0] + ' ' + c['ghi'].split(' ')[1] if c['ghi'].startswith(('lơ', 'đè', 'ở', 'ngoài', 'trên', 'sao', 'chỉ')) else c['ghi'])) for c in v if c['kq'] != 'dính')
        L.append('| %s | %d | %d | %d | %s |' % (n, len(v), d, len(v) - d, ', '.join('%s (%d)' % (a, b) for a, b in lo.most_common(3))))
    L += ['', '## Hiệu ứng × quái', '', '✓ = mọi ca dính · "lệch N" = lệch tối đa N điểm game · hất = không theo khi bị hất tung · cỡ = sai cỡ · tắt = không tắt · – = không có hình riêng · ô trống = không đo (đòn không trúng / không có đòn đó). Số trong ngoặc: ca lệch / ca đo.', '']
    L.append('| Quái | ' + ' | '.join(c[0] for c in COT) + ' |')
    L.append('|---|' + '---|' * len(COT))
    by = collections.defaultdict(list)
    for c in cs: by[c['id']].append(c)
    for q in k['roster']:
        v = by[q['id']]
        L.append('| %s (%s, %s) | ' % (q['id'], TEN_LOAI[q['loai']], VUNG[q['r']]) + ' | '.join(o([c for c in v if f(c['nhom'])]) for _, f in COT) + ' |')
    L += ['', '## Các ca lệch (đầy đủ ở so-lieu/%s-ca.json)' % nhan, '']
    bad = collections.defaultdict(list)
    for c in co:
        if c['kq'] != 'dính': bad[(c['nhom'], c['id'])].append(c)
    for (n, i), v in sorted(bad.items()):
        w = max(v, key=lambda c: c['x'])
        L.append('- %s · **%s**: %d ca — %s %s (%s)' % (n, i, len(v), w['kq'], ('%g điểm' % w['x']) if w['x'] else '', w['ghi'] or w['bien']))
    open(os.path.join(os.path.dirname(HERE), 'bang-' + nhan + '.md'), 'w').write('\n'.join(L) + '\n')
    return len(co), dung


if __name__ == '__main__':
    for n in sys.argv[1:] or ['truoc']:
        print(n, viet(n))
