# Yêu cầu bổ sung của chủ game (16/10 05:02) — bộ thử mặc đồ modular

- Một nhân vật CHẠY sang phải, 8–12 khung, cùng kích thước và cùng đường chân.
- Khung xương que: vai, khuỷu, cổ tay, hông, gối, cổ chân (và cổ, đầu, eo…) — toạ độ RIÊNG ở MỖI khung.
- Các phần cơ thể tách lớp: đầu, thân, cánh tay trên/dưới, bàn tay, đùi, cẳng chân, bàn chân.
- Toạ độ NEO cho áo, quần, tóc và phụ kiện (mỗi khung).
- Bộ dữ liệu máy đọc được (JSON) + hình kiểm tra có LƯỚI toạ độ.
- Quy ước: gốc toạ độ ở GÓC TRÊN TRÁI của khung, mỗi khớp là (x, y) theo pixel.
- Kiểm tra bằng một trang HTML/SVG (đọc JSON, vẽ khung xương + lớp đồ chồng lên ảnh, bật/tắt lớp, chạy từng khung) — không tin hình sinh ra đơn thuần.
- Giới hạn đã biết: xoay mảnh áo/tay pixel nhiều sẽ méo; thử nghiệm đầu làm trang phục THEO TỪNG PHẦN VÀ TỪNG KHUNG, căn theo cùng khung xương. Thay đồ khi chạy mà đẹp thì cần vẽ lớp trang phục cho toàn bộ chu kỳ chạy.
