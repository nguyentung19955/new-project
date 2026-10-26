"""Chạy lại toàn bộ Làng Chuông từ ảnh gen: nền → gạch → đồ vật → cảnh ghép thử.
Cần Python 3 + Pillow + numpy + scipy. Chạy:  python3 chay_het.py   (từ thư mục code/ hoặc bất kỳ đâu)."""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import do_vat  # noqa: E402
import gach  # noqa: E402
import nen  # noqa: E402
import xem_thu  # noqa: E402

if __name__ == '__main__':
    t = time.time()
    nen.chay()
    gach.chay()
    do_vat.chay()
    xem_thu.chay()
    print(f'xong trong {time.time() - t:.0f} s')
