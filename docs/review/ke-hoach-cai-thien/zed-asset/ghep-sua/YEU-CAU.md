# YÊU CẦU CLAUDE: REVIEW VÀ SỬA TRIỆT ĐỂ HỆ THỐNG GHÉP SPRITE ZED – LINH KHÍ

Bạn là Senior Game Engine Engineer kiêm Technical Artist chuyên về 2D pixel art, sprite animation, alpha compositing và hệ thống trang bị modular cho game.

Tôi cung cấp các tài liệu:

- `ghep-thu.py`: script ghép thân Zed với giáp, nón lá và áo choàng.
- `cat-diem-anh.py`: script tách sprite từ ảnh AI bằng phân tích vùng pixel.
- Ảnh GIF/PNG kết quả ghép hiện tại.
- Các ảnh sprite nguồn của Zed và từng món trang bị.

## 1. Vấn đề thực tế

Ảnh ghép hiện tại bị lỗi nghiêm trọng:

- Nón lá che gần hết mặt Zed.
- Dây nón chồng lên mặt và tóc.
- Hai sừng không được xử lý đúng khi ghép nón.
- Giáp có nguy cơ lệch khỏi ngực và vai khi thay đổi tư thế.
- Áo choàng có nguy cơ xuyên qua thân, tay và quần khi chạy.
- Các lớp trang bị được đặt bằng tọa độ và tỷ lệ ước lượng, chưa có điểm neo đáng tin cậy cho từng frame.
- Script tách sprite có thể ghép nhầm, tách sai hoặc bỏ sót chi tiết rời.

Không chấp nhận việc chỉ sửa vài hệ số tọa độ để làm đẹp một frame. Phải kiểm tra nguyên nhân và thiết kế lại quy trình ghép lớp phù hợp.

## 2. Nhiệm vụ thứ nhất: Review code và truy nguyên lỗi

Đọc toàn bộ hai script cùng các ảnh nguồn trước khi sửa.

Kiểm tra cụ thể:

1. Thuật toán nhận diện màu nền, tạo alpha mask và khử viền.
2. Thuật toán tìm thành phần liên thông và ghép các chi tiết rời.
3. Cách chia sprite thành 3 hàng, 8 frame mỗi hàng.
4. Cách xác định thứ tự frame và ghép frame giữa thân với từng món trang bị.
5. Công thức tính tỷ lệ, điểm neo và vị trí đặt từng lớp.
6. Thứ tự alpha compositing.
7. Cách xử lý tóc, mặt, hai sừng, dây nón, giáp ngực, giáp vai và áo choàng.
8. Việc resize bằng `Image.LANCZOS` có làm nhòe hoặc phá phong cách pixel art hay không.
9. Khả năng frame thiếu, sai thứ tự, sai kích thước hoặc bị mất chi tiết nhưng script vẫn xuất GIF thành công.

Đối với mỗi lỗi, hãy nêu:
- File và vị trí code.
- Nguyên nhân kỹ thuật.
- Hậu quả nhìn thấy trong ảnh.
- Phương án sửa.
- Cách kiểm chứng sau khi sửa.

Phân biệt rõ lỗi đã xác nhận từ code/ảnh với giả thuyết cần chạy thử. Không khẳng định đã kiểm tra các file nguồn mà bạn chưa thực sự truy cập được.

## 3. Nhiệm vụ thứ hai: Thiết kế lại điểm neo

Không dùng một công thức chung dựa trên chiều rộng vùng tóc hoặc chiều cao sprite để định vị tất cả trang bị.

Thiết kế hệ thống điểm neo có thể cấu hình, tối thiểu gồm:

- `head_top`: đỉnh đầu.
- `face_center`: tâm vùng mặt.
- `horn_left`, `horn_right`: vị trí hai sừng.
- `shoulder_left`, `shoulder_right`: hai vai.
- `chest_center`: tâm ngực.
- `back_anchor`: điểm gắn áo choàng.
- `weapon_hand`: điểm cầm vũ khí.
- `foot_anchor`: điểm chuẩn bàn chân.

Các tên trên là đề xuất cấu trúc, cần điều chỉnh nếu hình học sprite thực tế khác.

Yêu cầu:

- Mỗi frame có thể có điểm neo riêng khi tư thế thay đổi.
- Phân biệt điểm neo của thân với điểm neo của trang bị.
- Cho phép dịch chuyển, thay đổi tỷ lệ và xoay theo cấu hình.
- Không tự động coi tâm bounding box là điểm neo giải phẫu.
- Không lấy tọa độ ước lượng của một frame áp dụng mù quáng cho toàn bộ animation.
- Không làm thay đổi sprite gốc đã được duyệt.
- Nếu không thể xác định một điểm neo tự động đáng tin cậy, phải cho phép hiệu chỉnh thủ công và lưu cấu hình.

Có thể sử dụng JSON để lưu điểm neo. Hãy đề xuất schema đơn giản, có phiên bản, dễ đọc và dễ sửa.

## 4. Nhiệm vụ thứ ba: Sửa riêng từng lớp trang bị

### A. Nón lá

Đây là lỗi ưu tiên cao nhất.

Yêu cầu:

- Nón nằm trên đỉnh đầu, không che mắt và vùng mặt cần nhìn thấy.
- Hai sừng đỏ sẫm phải được hiển thị đúng theo thiết kế Zed.
- Không tự ý xóa, vẽ lại hoặc làm biến dạng tóc, mặt và sừng.
- Nếu nón cần có lỗ cho sừng, xác định cách xử lý bằng alpha mask hoặc tách các phần của nón.
- Tách dây nón khỏi thân nón nếu cần kiểm soát thứ tự lớp.
- Dây nón không được cắt ngang mắt hoặc che khuất biểu cảm.
- Không giả định chỉ cần crop phần dưới của ảnh nón là giải quyết được vấn đề.
- Không làm mất viền pixel hoặc chi tiết do khử nền.

Nếu ảnh nón nguồn không phù hợp để đạt các điều kiện trên, báo rõ cần vẽ lại hoặc chỉnh sửa asset nào. Không cố ép ảnh không phù hợp bằng tọa độ.

### B. Giáp ngực và giáp vai

- Giáp bám đúng vùng ngực và vai theo từng frame.
- Không che mặt, không lệch khỏi thân khi chạy.
- Không làm giáp nhấp nháy hoặc thay đổi kích thước bất thường giữa các frame.
- Giữ nguyên thiết kế, màu sắc và viền của giáp nguồn.

### C. Áo choàng

- Gắn tại vùng sau vai/lưng.
- Nằm phía sau thân khi phù hợp.
- Chuyển động và hình dạng từng frame phải khớp animation nguồn.
- Không xuyên qua tay, thân hoặc quần một cách vô lý.
- Không dùng một vị trí cố định cho toàn bộ animation nếu tư thế thực tế đòi hỏi điểm neo khác nhau.

## 5. Nhiệm vụ thứ tư: Kiểm tra script tách sprite

Review `cat-diem-anh.py` và sửa nếu cần.

Bắt buộc:

- Kiểm tra số frame của từng hàng.
- Không tự động chia một hình làm hai chỉ để đủ số lượng mà không cảnh báo.
- Không gộp các mảnh của hai frame khác nhau.
- Phát hiện trường hợp một sprite bị tách thành nhiều thành phần hoặc hai sprite bị dính nhau.
- Cảnh báo khi frame thiếu, sai thứ tự hoặc kích thước bất thường.
- Xuất báo cáo kiểm tra để người dùng có thể biết chính xác hàng/frame nào cần xem lại.
- Giữ alpha trong suốt cho asset đầu ra.
- Không coi mọi pixel khác nền là chi tiết nhân vật hợp lệ.
- Có thể sử dụng cấu hình crop thủ công khi thuật toán tự động không đáng tin cậy.

Nếu thay đổi thuật toán, cần giải thích vì sao cách mới an toàn hơn và không âm thầm làm mất chi tiết.

## 6. Nhiệm vụ thứ năm: Bảo toàn chất lượng pixel art

- Không làm thay đổi thiết kế Zed đã duyệt.
- Không vẽ lại nhân vật gốc bằng các hình học đơn giản.
- Tránh resize liên tục qua nhiều bước.
- Ưu tiên giữ nguyên độ phân giải pixel nguồn.
- Nếu phải resize, dùng phương pháp phù hợp với pixel art và kiểm tra viền.
- Không thêm bóng, quầng sáng hoặc hiệu ứng không có trong asset nguồn.
- Giữ nguyên nền trong suốt ở asset dùng trong game; chỉ dùng nền màu khi xuất ảnh kiểm thử.
- Không tự ý thay đổi hướng mặt hoặc hướng di chuyển.

## 7. Nhiệm vụ thứ sáu: Xây dựng bộ kiểm thử trực quan

Tạo công cụ xuất ảnh so sánh cho 8 frame của từng animation.

Tối thiểu phải có:

1. Thân Zed nguyên bản.
2. Thân + giáp.
3. Thân + nón.
4. Thân + áo choàng.
5. Thân + tất cả trang bị.
6. Ảnh so sánh trước/sau khi sửa.
7. GIF preview cho animation đứng, đi và chạy.
8. Báo cáo JSON về số frame, kích thước, điểm neo và cảnh báo.

Bắt buộc kiểm tra:

- Mặt và mắt không bị nón hoặc dây nón che.
- Hai sừng không biến mất bất thường.
- Giáp không trôi khỏi ngực/vai.
- Áo choàng không xuyên qua cơ thể bất hợp lý.
- Không cắt mất tóc, khăn, tay hoặc chân.
- Không có frame sai thứ tự.
- Trang bị không rung hoặc nhảy vị trí bất thường khi GIF lặp.

Không chỉ kiểm tra frame đầu tiên. Phải xem đủ 8 frame của từng hàng.

## 8. Tiêu chí nghiệm thu

Chỉ coi là hoàn thành khi:

- Script chạy được trên bộ ảnh nguồn thực tế.
- Có đủ frame đúng thứ tự cho từng animation.
- Nón không che mắt và mặt.
- Hai sừng vẫn hiển thị đúng.
- Giáp và áo choàng bám đúng vị trí trên cả 8 frame.
- Không có lỗi cắt mất chi tiết quan trọng.
- Có báo cáo kiểm thử và ảnh/GIF đầu ra để kiểm tra bằng mắt.
- Không có lỗi nghiêm trọng bị bỏ qua chỉ vì script chạy thành công.

Nếu một tiêu chí chưa đạt, hãy ghi rõ lý do và không đánh dấu hoàn thành.

## 9. Cách thực hiện

Thực hiện theo thứ tự:

1. Đọc và review code.
2. Kiểm tra ảnh nguồn, xác nhận đường dẫn và số frame.
3. Lập danh sách lỗi có mức độ ưu tiên.
4. Đề xuất kiến trúc sửa ngắn gọn.
5. Sửa code trực tiếp, không chỉ trả lời bằng lý thuyết.
6. Chạy script với ảnh nguồn thực tế.
7. Mở và kiểm tra ảnh/GIF đầu ra.
8. Chạy lại các kiểm thử.
9. Báo cáo file đã thay đổi, lỗi đã sửa, kết quả đạt/chưa đạt và các việc còn tồn đọng.

Không được tuyên bố đã chạy, đã mở ảnh hoặc đã nghiệm thu nếu thực tế chưa thực hiện.

**Ưu tiên số một: sửa đúng điểm neo và cấu trúc lớp nón lá để khuôn mặt Zed được nhìn thấy rõ. Sau đó mới hiệu chỉnh giáp và áo choàng. Không thay đổi thiết kế gốc của Zed để che giấu lỗi ghép lớp.**