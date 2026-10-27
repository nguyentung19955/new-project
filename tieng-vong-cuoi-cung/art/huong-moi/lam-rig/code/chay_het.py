"""Chạy lại toàn bộ rig Lam "Cổ tích chuông tàn" (từ 2 ảnh nguồn trong art/huong-moi/nguon/):
  tach_manh → khop_manh → dung_manh → kiem_rap → do_co → xem_khop → sprite   (~6 phút; --nhanh: bỏ GIF)
Cần: pillow, numpy, scipy, opencv-python."""
import sys
import tach_manh, khop_manh, dung_manh, kiem_rap, do_co, xem_khop, sprite

if __name__ == '__main__':
    tach_manh.main()
    khop_manh.main()
    dung_manh.main()
    kiem_rap.main()
    do_co.main()
    xem_khop.main()
    sprite.main(nhanh='--nhanh' in sys.argv)
