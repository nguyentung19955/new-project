#!/usr/bin/env python3
"""Khung xương CHẠY v3: khung nào cũng có 1 chân CHẠM ĐẤT (không có khung bay). → mau-chay-v3.png"""
import importlib.util, sys
sp = importlib.util.spec_from_file_location('kx', 've-khung-xuong.py'); kx = importlib.util.module_from_spec(sp); sp.loader.exec_module(kx)
# (đùi, gối) chân gần, chân xa, tay gần (vai, khuỷu), tay xa, bay=0
nua = [
    ((28, -12), (-32, -80), (-40, 85), (40, 80), 0),   # 1 chân trước chạm đất, chân sau nhấc
    ((6, -32), (-8, -105), (-25, 90), (25, 85), 0),    # 2 dồn lực: chân trụ khuỵu dưới hông (thấp nhất)
    ((-32, -10), (80, -120), (30, 80), (-35, 90), 0),   # 3 đạp: chân sau duỗi, mũi chân còn chạm đất; gối trước nâng cao
    ((-6, -4), (45, -95), (15, 80), (-20, 85), 0),     # 4 chân trụ gần thẳng dưới người, chân kia vung tới
]
chay = nua + [(cx, cg, tx, tg, b) for (cg, cx, tg, tx, b) in nua]
kx.ve('mau-chay-v3.png', chay, 20)
