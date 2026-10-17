"""Ghi ../bang-kiem-ke.md từ ra/khop.json + ra/dung-3.json + ra/dung-4.json."""
import json, os
import kiem_ke as K
k = json.load(open(os.path.join(K.RA, 'khop.json')))
d3 = json.load(open(os.path.join(K.RA, 'dung-3.json'))); d4 = json.load(open(os.path.join(K.RA, 'dung-4.json')))
import base64, io
from PIL import Image


def co_that(ma, N):
    """(KB, triệu điểm) của bản nét N đã ghi trong tệp (trang ảnh cắt sát xếp kín)"""
    v = json.load(open(os.path.join(K.CUS, ma + '.sprite.json'), encoding='utf-8')).get('tam_n%d' % N)
    v = [v] if isinstance(v, str) else v or []
    kb = mp = 0
    for x in v:
        b = base64.b64decode(x.split(',', 1)[1]); kb += len(b) / 1024; w, h = Image.open(io.BytesIO(b)).size; mp += w * h / 1e6
    return kb, mp


CO = {m: (co_that(m, 3), co_that(m, 4)) for m in k}
NHOM = [('Trùm vùng (3 pha)', lambda m, t: m.split('-p')[0] in ('mocTinh', 'nguTinh', 'hoTinh')),
        ('Trùm nhỏ (2 pha)', lambda m, t: m.split('-p')[0] in ('namChua', 'cuaDa', 'hoLua')),
        ('Tinh anh', lambda m, t: m in ('heoNanh', 'namPhongChua', 'cuaTuong', 'caNocChua', 'tuongMa', 'huChua')),
        ('Quái thường', lambda m, t: t['doi'] == 'quai'),
        ('Người làng', lambda m, t: t['doi'] == 'nguoi-lang'),
        ('Em bé (bạn đồng hành ở làng)', lambda m, t: t['doi'] == 'em-be')]
VUNG = {'rung': 'Rừng', 'bien': 'Biển', 'laudai': 'Lâu đài', 'song': 'Sông'}
L = ['# Bảng kiểm kê nét cao — quái, tinh anh, trùm, người làng (17/10)', '',
     '"Gốc/điểm game" = số điểm ảnh của ẢNH GỐC trên 1 điểm game (trung vị các khung khớp). ≥ 4: bản nét 4 toàn chi tiết thật; 3–4: nét 3 thật, nét 4 '
     'có chút phóng từ gốc; < 3: cả nét 3 cũng phóng một phần. "Khớp" = khung tìm được ảnh gốc + tỉ lệ + chỗ dán cho ra đúng khung đang dùng; '
     'khung không khớp thì bản nét cao lấy khung cũ phóng lên (y như hiện nay).', '']
da = set()
for ten, f in NHOM:
    L += ['## ' + ten, '', '| Mã | Tên | Vùng | Khung (điểm game) | Khớp gốc | Gốc/điểm game | KB nét 2 | KB nét 3 | KB nét 4 | Triệu điểm nét 4 (RAM ≈ ×4 MB) | Khung không khớp (giữ khung cũ phóng lên) |',
          '|---|---|---|---|---|---|---|---|---|---|---|']
    for m in sorted(k):
        t = k[m]
        if m in da or not f(m, t):
            continue
        da.add(m)
        d = K.doc(m)[0]
        bad = d3[m]['3']['phong_ds']
        L.append('| %s | %s | %s | %d×%d | %d/%d | %s | %d | %d | %d | %s | %s |' % (m, (t['ten'] or '').replace('|', '/'), VUNG.get(d.get('vung'), '—'), t['khung'][0], t['khung'][1],
                 t['so_khop'], t['so_khung'], ('%.1f' % t['goc_moi_diem']).replace('.', ','), t['kb'], CO[m][0][0], CO[m][1][0], ('%.1f' % CO[m][1][1]).replace('.', ','), ', '.join(bad) or '—'))
    L.append('')
s2 = sum(k[m]['kb'] for m in k); s3 = sum(CO[m][0][0] for m in k); s4 = sum(CO[m][1][0] for m in k)
kh = sum(k[m]['so_khop'] for m in k); tg = sum(k[m]['so_khung'] for m in k)
L += ['**Tổng %d tấm: khớp %d/%d khung (%.1f %%). Ảnh: nét 2 %.1f MB (đang có) · nét 3 %.1f MB · nét 4 %.1f MB (PNG).**' % (len(k), kh, tg, 100 * kh / tg, s2 / 1024, s3 / 1024, s4 / 1024), '']
open(os.path.join(HERE := os.path.dirname(os.path.abspath(__file__)), '..', 'bang-kiem-ke.md'), 'w').write('\n'.join(L))
print('\n'.join(L[-2:]))
