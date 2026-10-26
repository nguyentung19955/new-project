#!/usr/bin/env python3
"""Công cụ đo (dùng bởi kiem-thu-chay-nhanh.py): với MỘT clip chạy (rig-v3 hoặc rig-v4), tính cho từng khung sheet 0–31
độ dịch ngang của ĐIỂM VẬT CHẤT đang chạm đất (ủng chịu lực) khi sang khung k+d, đơn vị px logic, Lam quay phải.
Dùng đúng rig nguồn (lam-moi-v?.json + code/ của rig đó). Trượt chân trong game mỗi bước = |dx_thực| + dịch(k→k').
Chạy: python3 -B game/tools/diem-cham-clip.py art/modular/lam-moi/rig-v4   → in JSON ra stdout"""
import os
import sys
import json

sys.dont_write_bytecode = True
RIG = os.path.abspath(sys.argv[1])
sys.path.insert(0, os.path.join(RIG, 'code'))
from chung import load_json            # noqa: E402
from rig import tiep_dat, piece_matrix, world_mats   # noqa: E402
from khung import khung_co_dinh        # noqa: E402
import numpy as np                     # noqa: E402

doc = load_json()
rig = doc['rig']
K = khung_co_dinh(doc)
k = K['k112']
gx = rig['goc_the_gioi'][0]
N = len(doc['chu_ky']['khung'])


def diem(p, ten, c):
    nd_ = rig['nut'][ten]
    W = piece_matrix(nd_, world_mats(rig, p)[ten])
    return W @ np.array([nd_['pivot'][0] + c[0], nd_['pivot'][1] + c[1], 1.0])


# dich[k][d][ten] = dịch ngang (px logic, Lam quay phải) của ĐIỂM VẬT CHẤT đang chạm đất ở khung k khi chuyển sang khung
# k+d (d = 0…4, vòng 32), chỉ khi ủng đó chịu lực ở CẢ hai khung. Không trượt ⇔ dịch = −(quãng nhân vật đi được).
KH = doc['chu_ky']['khung']
dich = []
for kk, p in enumerate(KH):
    hang = []
    for d in range(5):
        q = KH[(kk + d) % N]
        r = {}
        for ten in ('ung-gan', 'ung-xa'):
            if p['_ung'][ten]['chiu_luc'] and q['_ung'][ten]['chiu_luc']:
                _, c = tiep_dat(rig, ten, p['_ung'][ten]['goc'])
                r[ten] = round(float((diem(q, ten, c)[0] - diem(p, ten, c)[0]) * k), 4)
        hang.append(r)
    dich.append(hang)
print(json.dumps({'rig': os.path.basename(RIG), 'k112': k, 'dich': dich}))
