#!/usr/bin/env python3
"""Cắt hàng CHẠY MỚI 16/10 (docs/anh-goc/cu-ti-hang-moi-16-10/03-chay-12k-v2.png, 12 khung SÁT NHAU) bằng ../cat-diem-anh.py.
Công cụ gốc nới 6 điểm ảnh khi gom hình → khung 8 và 9 dính thành một (11 hình). Ảnh này mỗi khung đã là MỘT khối liền, các khối
cách nhau ≥ 1 cột nền #00FF00 → gọi cat-diem-anh.py y nguyên, chỉ nới 1 điểm ảnh. Kết quả ĐẠT, 12 khung, không suy đoán.
Rồi sửa khung 2 (mảng trắng trên bắp tay) bằng sua-chay-k2.py.
Chạy (từ thư mục này):  python3 cat-chay-12k.py && python3 sua-chay-k2.py"""
import importlib.util, os, sys
DAY = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(DAY, '..', 'cat-diem-anh.py')
spec = importlib.util.spec_from_file_location('cda', p); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
goc = M.tim_hinh_day_du
M.tim_hinh_day_du = lambda m, gian=6, nho=0.002: goc(m, 1, nho)
sys.argv = [p, os.path.join(DAY, '..', '..', 'cu-ti-hang-moi-16-10', '03-chay-12k-v2.png'), '--hang', '1', '--so', '12', '--ten', 'chay',
            '--ms', '50', '--ra', os.path.join(DAY, '03-chay-12k-v2-gif')]
M.main()
