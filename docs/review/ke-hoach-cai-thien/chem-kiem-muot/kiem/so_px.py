"""So từng điểm ảnh: bản mới mở với ?kiemmuot=0 phải vẽ y hệt bản cũ (mọi khung của 4 cảnh trong gif_truoc_sau.py, 4 em bé).
Chạy: python3 so_px.py <url bản cũ> <url bản mới?...&kiemmuot=0>"""
import sys
from gif_truoc_sau import chup, CANH
A, B = chup(sys.argv[1]), chup(sys.argv[2])
khac = 0; tong = 0
for ten in CANH:
    for i, (a, b) in enumerate(zip(A[ten], B[ten])):
        tong += 1
        if a[0] != b[0]: khac += 1; print('khác:', ten, 'khung', i)
print(f'{tong} khung, khác {khac}')
