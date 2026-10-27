"""Chạy hết các bước theo thứ tự (~6 phút; tách mảnh Mẹ Nấm Mốc lâu nhất vì căn khớp mảnh rời).
--nhanh: bỏ tách mảnh + bỏ GIF (chỉ rig, JSON clip, kiểm số) – dùng khi chỉnh mốc trong clip_*.py."""
import sys
import time
import tach_manh
import dung_rig
import xuat
import xem_thu
import kiem_tra

if __name__ == '__main__':
    nhanh = '--nhanh' in sys.argv
    t0 = time.time()
    if not nhanh:
        print('1. tách mảnh'); tach_manh.tach_nam(); tach_manh.tach_doi(); tach_manh.tach_menam()
    print('2. dựng rig'); dung_rig.main()
    print('3. clip'); xuat.main()
    if not nhanh:
        print('4. xem thử'); xem_thu.main()
    print('5. kiểm tra')
    ok = kiem_tra.main()
    print(f'xong sau {time.time() - t0:.0f} s')
    sys.exit(0 if ok else 1)
