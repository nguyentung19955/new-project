"""Chạy toàn bộ: gạch → đồ vật → nền → ảnh xem thử → kiểm tra. Chỉ cần thư mục the-gioi/ (ảnh nguồn đã chép trong code/nguon/).
    pip install pillow numpy scipy opencv-python-headless
    python3 chay_het.py            (~2 phút; nền mất nhiều nhất vì GrabCut)"""
import subprocess
import sys
import time

import do_vat
import gach
import nen
import xem_thu

import os

from chung import DOVAT, GACH, NEN, XEM

for d in (GACH, DOVAT, NEN, XEM):
    os.makedirs(d, exist_ok=True)
t = time.time()
gach.chay()
do_vat.chay()
nen.chay()
xem_thu.chay()
print('tổng %.0f s' % (time.time() - t))
sys.exit(subprocess.call([sys.executable, 'kiem_tra.py']))
