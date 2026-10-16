#!/usr/bin/env python3
"""Đóng gói rig-do-sau.zip để chạy thử ở máy khác.

Trong ZIP (giữ cấu trúc thư mục thu-modular-96/):
  thu-modular-96/rig-do-sau/   mã nguồn, ảnh giáp gốc, ảnh nhãn (mask), lượt back/front/trong, rig.json,
                               kiem-tra-rig.html (tự chứa — mở thẳng bằng trình duyệt), ảnh soát, báo cáo
  thu-modular-96/data.json, sheets/ (các lớp thân dùng tới), anh-gen/giap-roi-4-manh.png
                               -> đủ để chạy lại: python3 thu-modular-96/rig-do-sau/tao-rig.py --gen
Chạy:  python3 docs/thu-modular-96/rig-do-sau/dong-goi.py
"""
import json, os, zipfile

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)
OUT = os.path.join(RIG, 'rig-do-sau.zip')
D = json.load(open(os.path.join(BO, 'data.json')))
R = json.load(open(os.path.join(RIG, 'rig.json')))

files = []
for root, _, fs in os.walk(RIG):
    for f in fs:
        p = os.path.join(root, f)
        if p == OUT or '__pycache__' in p:
            continue
        files.append(p)
outfit = D['outfits'][R['outfit']]['sheets']
for L in D['layerOrder']:
    s = D['sheets'].get(L) or outfit.get(L)
    if s and D['layerKinds'].get(L) not in R['skipLayerKinds']:
        files.append(os.path.join(BO, s))
files += [os.path.join(BO, 'data.json'), os.path.join(BO, 'anh-gen', 'giap-roi-4-manh.png')]
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(set(files)):
        z.write(p, os.path.join('thu-modular-96', os.path.relpath(p, BO)))
print('rig-do-sau.zip: %d tệp, %d KB' % (len(set(files)), os.path.getsize(OUT) // 1024))
