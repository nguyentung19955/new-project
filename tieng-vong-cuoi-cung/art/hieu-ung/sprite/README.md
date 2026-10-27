# Hiệu ứng – sheet 2x tách từ ảnh gen (../nguon/)

Tạo bằng `../code/tach-hieu-ung.py`: xoá nền trắng (flood-fill từ mép ảnh + khử viền trắng; ảnh có alpha sẵn thì giữ),
chia khung theo khe trống rộng nhất mỗi hàng, thu LANCZOS một lần về cỡ 2x, cắt sát + điểm neo mỗi khung.
Code game chỉ đặt vị trí / hướng / thời điểm / mờ dần – không vẽ hình hiệu ứng. `kiem-*.png` = ảnh kiểm (nền tối + sáng, chấm neo).
Thông số đặt trong game: `art/modular/lam-moi/hanh-dong/code/anim_hd.py` (VET, HIEU_UNG) → lam-hanh-dong-2x.json.
