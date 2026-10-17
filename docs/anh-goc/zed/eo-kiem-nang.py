#!/usr/bin/env python3
"""ĐIỂM EO + ĐAI cho 3 hàng kiếm nặng (17/10, docs/review/ke-hoach-cai-thien/kiem-nang/bao-cao.md), bộ ninja.
  - kiem_1~kn, kiem_2~kn: vừa đi / chạy vừa chém → ghép ở ĐAI (js/zed_moi.js G.CHAN_DON: thân trên khung đòn tới đáy đai + chân đi / chạy,
    khớp tâm đai, không kéo giãn) + thân trên nghiêng quanh eo (kiếm bớt cứng).
  - kiem_3~kn: chỉ để nghiêng thân (nhát 3 không ghép chạy + chém — moves.js coi nhát kết kiếm là hàng đứng tấn, như kiếm 3 cũ).
Đo y hệt eo-kiem-16-10.py (do_eo / do_cat của cat-than.py) + eo-dai-17-10.py (đáy đai đo lại, tâm đai, bề rộng đai).
Chỉ CHÈN / THAY khoá bo.moi["kiem_N~kn"], số cũ giữ nguyên. Chạy (sau dung-kiem-nang.py):  python3 docs/anh-goc/zed/eo-kiem-nang.py
"""
import importlib.util, json, os
import numpy as np
DAY = os.path.dirname(os.path.abspath(__file__))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(DAY, 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
sp = importlib.util.spec_from_file_location('eo_dai', os.path.join(DAY, 'eo-dai-17-10.py'))
ED = importlib.util.module_from_spec(sp); sp.loader.exec_module(ED)

src = open(CT.RA_JS, encoding='utf-8').read()
dau, sau = src.index('ZED_EO = ') + 9, src.rstrip().rindex(';')
Z = json.loads(src[dau:sau])
d, a = CT.doc_tam('zed-moi')
for ten in ('kiem_1~kn', 'kiem_2~kn', 'kiem_3~kn'):
    dt = d['dong_tac'][ten]
    ds = []
    for i in range(dt['so']):
        f = CT.khung(a, dt['hang'], i)
        e = CT.do_eo(f, 'moi')
        if e is None:
            raise SystemExit('Không dò được đai: %s khung %d' % (ten, i + 1))
        ds.append(list(e[:2]) + CT.do_cat(f, e, 'moi'))
    yy = []
    for i in range(len(ds)):
        f = CT.khung(a, dt['hang'], i)
        y = ED.day_dai(f, 'moi', ds[i][0])
        dinh = int(np.nonzero((f[..., 3] > 100).any(1))[0].min())
        yy.append(y if (y - ds[i][0] >= 10 and ds[i][0] - dinh < 26) else ds[i][0])
    do = [ED.tam_dai(CT.khung(a, dt['hang'], i), yy[i], 'moi') for i in range(len(ds))]
    tot = [c for c, w in do if ED.RONG_MIN <= w <= ED.RONG_MAX]
    med = float(np.median(tot)) if tot else float(np.median([c for c, w in do]))
    for i, (c, w) in enumerate(do):
        if not (ED.RONG_MIN <= w <= ED.RONG_MAX):
            c = med
        ds[i] = ds[i][:5] + [round(c * 2) / 2, int(w), int(yy[i])]
    Z['bo']['moi'][ten] = ds
    print(ten, ds)
open(CT.RA_JS, 'w', encoding='utf-8', newline='\n').write(src[:dau] + json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + src[sau:])
print('Đã chèn vào', os.path.relpath(CT.RA_JS, CT.GOC))
