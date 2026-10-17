#!/usr/bin/env python3
"""Kiếm bớt cứng (17/10): ĐIỂM EO cho hàng kiem_3~16 (bộ ninja) — chỉ để thân trên NGHIÊNG quanh eo khi chém (js/zed_moi.js THAN_KIEM).
Kiếm 3 KHÔNG ghép chạy + chém (không có trong G.ZED_EO.hang) nên số này không đổi cách ghép nào.
Đo bằng do_eo / do_cat của docs/anh-goc/zed/cat-than.py như eo-kiem-16-10.py; chỉ CHÈN khoá bo.moi["kiem_3~16"], số cũ giữ nguyên.
Chạy:  python3 docs/review/ke-hoach-cai-thien/kiem-bot-cung/do-eo-kiem-3.py
"""
import importlib.util, json, os
GOC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
src = open(CT.RA_JS, encoding='utf-8').read()
dau, sau = src.index('ZED_EO = ') + 9, src.rstrip().rindex(';')
Z = json.loads(src[dau:sau])
d, a = CT.doc_tam('zed-moi')
dt = d['dong_tac']['kiem_3~16']
ds = []
for i in range(dt['so']):
    f = CT.khung(a, dt['hang'], i)
    e = CT.do_eo(f, 'moi')
    if e is None:
        raise SystemExit('Không dò được đai: kiem_3~16 khung %d' % (i + 1))
    ds.append(list(e[:2]) + CT.do_cat(f, e, 'moi'))
Z['bo']['moi']['kiem_3~16'] = ds
print('kiem_3~16', ds)
open(CT.RA_JS, 'w', encoding='utf-8', newline='\n').write(src[:dau] + json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + src[sau:])
print('Đã chèn vào', os.path.relpath(CT.RA_JS, GOC))
