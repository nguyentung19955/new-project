# Bản 2 của bộ phác thảo kiểu phòng

Việc phác thảo này bị giao cho hai phiên chạy cùng lúc. Bộ ảnh chính thức và `BAO-CAO.md` nằm ở thư mục cha (`docs/phac-thao/phong/`), do phiên kia làm xong trước. Thư mục này là bộ ảnh của phiên thứ hai, giữ lại làm phương án tham khảo, không thay thế bộ chính.

Ảnh trong thư mục này (cùng tên, cùng nội dung yêu cầu như bộ chính):

- `kieu-A.png`, `kieu-B.png`, `kieu-C.png`: ba ảnh giả lập màn hình, 1440x810.
- `so-sanh-kieu-phong.png`: ba kiểu xếp dọc, có nhãn và gạch đầu dòng được gì, mất gì.
- `kieu-A-ba-chu-de.png`: Kiểu A ở lâu đài, hang động, rừng.
- `trang-thai-cua.png`: cửa khóa, cửa mở, bước qua cửa.

Điểm khác với bộ chính:

- Kiểu C dựng ở 320x180 điểm ảnh gốc rồi phóng 4,5 lần (không phải 480x270 phóng 3 lần), để nhân vật to gấp rưỡi mà điểm ảnh vẫn đều.
- Trong ảnh hero không mất máu (tắt tạm lúc dựng) để màn hình không bị viền đỏ che.
- Thư mục này không có báo cáo riêng. Nhận xét từng kiểu xem `../BAO-CAO.md`.

Dựng lại: `python3 docs/phac-thao/phong/ban-2/nguon/dung.py` từ thư mục gốc của kho. Không sửa gì trong `game/`.
