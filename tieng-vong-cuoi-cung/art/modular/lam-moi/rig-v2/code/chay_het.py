"""Chạy toàn bộ rig-v2 theo thứ tự (~3–4 phút). Cần: pip install pillow numpy scipy matplotlib
Mọi ảnh nguồn nằm trong ../nguon/ → chạy được khi chỉ có thư mục rig-v2.
  python3 chay_het.py            chạy hết (kể cả dò cỡ mảnh khop_co ~1 phút)
  python3 chay_het.py --nhanh    bỏ qua tách/dò cỡ (dùng lại ../manh/goc/ đã có)"""
import sys
import tach_manh
import khop_co
import chuan_hoa
import sua_mu
import chu_ky
import kiem_tra

if __name__ == '__main__':
    buoc = [chuan_hoa, sua_mu, chu_ky] if '--nhanh' in sys.argv else [tach_manh, khop_co, chuan_hoa, sua_mu, chu_ky]
    for m in buoc:
        print(f'\n===== {m.__name__} =====')
        m.main()
    # các bước xuất dùng chung khung cố định (tính một lần)
    from chung import load_json
    from khung import khung_co_dinh
    import phan_tich
    import duyet
    import chay
    doc = load_json()
    K = khung_co_dinh(doc)
    for m in (phan_tich, duyet, chay):
        print(f'\n===== {m.__name__} =====')
        m.main(doc, K)
    print('\n===== kiem_tra =====')
    raise SystemExit(kiem_tra.main())
