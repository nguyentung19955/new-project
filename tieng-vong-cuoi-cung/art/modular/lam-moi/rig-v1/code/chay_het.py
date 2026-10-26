"""Chạy toàn bộ theo thứ tự (~2 phút). Cần: pip install pillow numpy scipy"""
import tach_manh
import khop_co
import chuan_hoa
import tu_the
import duyet
import kiem_tra

if __name__ == '__main__':
    for m in (tach_manh, khop_co, chuan_hoa, tu_the, duyet):
        print(f'\n===== {m.__name__} =====')
        m.main()
    print('\n===== kiem_tra =====')
    raise SystemExit(kiem_tra.main())
