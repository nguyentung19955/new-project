#!/usr/bin/env python3
"""Đóng gói trang Ghép Lớp Zed: nguon.html + thân canonical nhúng sẵn → index.html (workflow đăng thành spiritblade.web.app/tach-ghep-lop.html).

Thân nhúng = docs/anh-goc/zed/kiem/zed-canonical/sheet-game.png + do-dac.json (kiem-sheet.py tạo).
Trạng thái GENERATED: chỉ để xem thử / làm nền đo, KHÔNG phải thân production (SPEC mục 1).
Chạy lại khi sửa nguon.html hoặc khi đổi thân nhúng:  python3 tools/tach-ghep-lop/dong-goi.py
"""
import base64, json, os
DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(DAY, '..', '..'))
KQ = os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'kiem', 'zed-canonical')
d = json.load(open(os.path.join(KQ, 'do-dac.json'), encoding='utf-8'))
tam = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(KQ, 'sheet-game.png'), 'rb').read()).decode()
dt = {t: {'hang': r, 'so': d['so_khung_hang'][r], 'giay': d['giay'][r], 'lap': True} for r, t in enumerate(d['ten'])}
med = lambda a: sorted(a)[len(a) // 2]
than = {
    'id': 'zed-canonical', 'ten': 'Zed canonical (gộp đồ mặc định) — thân xem thử', 'slot': 'than', 'chiem': ['than'], 'kieu': 'khung', 'lop': 40,
    'nhan_vat': 'zed', 'mon': [], 'trang_thai': 'GENERATED',
    'nguon': {'anh': 'docs/anh-goc/zed/zed-canonical.png', 'kiem': d['ket_luan'] + ' — docs/anh-goc/zed/kiem/zed-canonical/ket-qua.txt'},
    'ti_le': d['ti_le_game'], 'dong_tac': dt, 'neo': {t: [None] * dt[t]['so'] for t in dt},
    'chuan_hoa': {'ti_le': d['ti_le_game'], 'o_cao': med([b - a for a, b in d['chia_hang']]), 'o_rong': med([b - a for a, b in d['chia_cot']]),
                  'dat_tren_o': d['dat_tren_o'], 'neo_x_tren_o': d['neo_x_tren_o']},
    'tuong_thich': {'dong_tac': list(dt)}, 'tam': tam,
}
src = open(os.path.join(DAY, 'nguon.html'), encoding='utf-8').read()
assert '/*THAN_NHUNG*/null' in src
out = src.replace('/*THAN_NHUNG*/null', json.dumps(than, ensure_ascii=False, separators=(',', ':')))
out = out.replace('Tệp này là NGUỒN; index.html = nguồn + ảnh canonical nhúng', 'TỆP SINH RA từ nguon.html (sửa nguon.html rồi chạy dong-goi.py); đã nhúng ảnh canonical')
open(os.path.join(DAY, 'index.html'), 'w', encoding='utf-8', newline='\n').write(out)
print('Đã ghi tools/tach-ghep-lop/index.html (%d KB)' % (len(out.encode()) // 1024))
