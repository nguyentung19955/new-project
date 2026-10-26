"""Chạy hết các bước theo thứ tự (~7–8 phút). --nhanh: bỏ vẽ sheet/GIF (chỉ tách, rig, JSON clip, kiểm số;
phần kiểm sheet sẽ dùng sheet cũ)."""
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
    print('1. tách mảnh'); tach_manh.tach_quai(); tach_manh.tach_boss()
    print('2. dựng rig'); dung_rig.main()
    print('3–4. clip + sprite sheet'); xuat.main(nhanh=nhanh)
    if not nhanh:
        print('5. xem thử'); xem_thu.main()
    print('6. kiểm tra')
    ok = kiem_tra.main()
    print(f'xong sau {time.time() - t0:.0f} s')
    sys.exit(0 if ok else 1)
