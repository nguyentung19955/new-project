#!/usr/bin/env python3
"""Khung xương CHẠY v4: 12 khung (6 mỗi nửa nhịp), khung nào cũng có 1 chân CHẠM ĐẤT. → mau-chay-v4.png"""
import importlib.util
sp = importlib.util.spec_from_file_location('kx', 've-khung-xuong.py'); kx = importlib.util.module_from_spec(sp); sp.loader.exec_module(kx)
# (đùi, gối) chân gần (ĐỎ, chân trụ ở nửa đầu), chân xa; tay gần (vai, khuỷu), tay xa
nua = [
    ((30, -10), (-35, -70), (-45, 85), (45, 80), 0),   # 1 chạm đất: chân trước duỗi đặt gót
    ((15, -25), (-20, -95), (-35, 88), (35, 84), 0),   # 2 nhận lực: gối trụ hơi khuỵu
    ((3, -35), (5, -115), (-15, 90), (15, 88), 0),     # 3 thấp nhất: chân trụ dưới hông, chân kia co gập qua
    ((-12, -20), (35, -110), (10, 88), (-12, 88), 0),  # 4 đẩy: người lên, gối kia đưa tới
    ((-25, -12), (60, -110), (28, 82), (-30, 88), 0),  # 5 đạp: chân trụ ra sau, gối trước cao
    ((-35, -8), (55, -60), (40, 80), (-42, 86), 0),    # 6 rời: mũi chân sau còn chạm, chân trước duỗi ra chuẩn bị đặt
]
chay = nua + [(cx, cg, tx, tg, b) for (cg, cx, tg, tx, b) in nua]
kx.W = 150
kx.ve('mau-chay-v4.png', chay, 18)
