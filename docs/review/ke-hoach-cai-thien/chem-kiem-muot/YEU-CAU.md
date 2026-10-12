# Yêu cầu của chủ dự án (12/10 14:18) — nguyên văn

SỬA TRIỆT ĐỂ ANIMATION CHÉM KIẾM — GAME LINH KHÍ

Bạn là Senior Game Developer chuyên về 2D Action RPG, pixel art animation và JavaScript/TypeScript game development.

Hãy trực tiếp kiểm tra và sửa code của game Linh Khí tại:
https://spiritblade.web.app/

1. Vấn đề hiện tại

Animation nhân vật cầm kiếm chém đang có dấu hiệu thiếu tự nhiên. Qua các ảnh chụp quá trình animation, mình nhận thấy:

* Thanh kiếm thay đổi góc giữa các frame khá đột ngột: chúc xuống, nằm ngang rồi lại chúc xuống.
* Chuyển động tạo cảm giác kiếm đang xoay quanh một điểm thay vì được cánh tay cầm và vung một cách tự nhiên.
* Điểm nối giữa bàn tay và chuôi kiếm có thể không ổn định khi kiếm thay đổi góc.
* Tư thế lấy đà, vung kiếm, kết thúc đòn và trở về trạng thái idle chưa tạo thành một chuỗi chuyển động liền mạch.
* Có khả năng xảy ra lỗi ở sprite sheet, thứ tự frame, pivot, anchor, offset, thời lượng frame, hướng nhân vật hoặc thứ tự render.

Đây là các dấu hiệu cần kiểm tra, không phải kết luận chắc chắn về nguyên nhân. Hãy xác minh bằng code thực tế trước khi sửa.

2. Kiểm tra code trước khi chỉnh sửa

Hãy tìm và xác định chính xác:

1. File hoặc module quản lý nhân vật người chơi.
2. Hệ thống animation và state machine.
3. Sprite sheet, danh sách frame và cách cắt frame.
4. Code xử lý hướng nhìn và hướng tấn công.
5. Cách vẽ nhân vật, tay, vũ khí và hiệu ứng chém.
6. Logic xử lý input, thời lượng đòn đánh và chuyển trạng thái.
7. Logic va chạm, hitbox và thời điểm gây sát thương.
8. Các thông số scale, offset, pivot, anchor và thứ tự layer.

Nếu có quyền truy cập repository hoặc môi trường code, hãy kiểm tra trực tiếp các file liên quan. Không được giả vờ đã đọc mã nguồn chỉ vì có thể mở website đang chạy.

3. Sửa animation chém kiếm

Hãy thiết kế lại hoặc hiệu chỉnh animation dựa trên hệ thống hiện có, với các giai đoạn rõ ràng:

* Anticipation: Nhân vật lấy đà, tay cầm kiếm chuẩn bị ra đòn.
* Wind-up: Đưa kiếm về vị trí thích hợp trước khi vung.
* Attack: Vung kiếm nhanh, tạo đường chém rõ ràng và có trọng lượng.
* Follow-through: Kiếm tiếp tục chuyển động theo quán tính hợp lý.
* Recovery: Nhân vật thu kiếm về tư thế sẵn sàng.
* Idle transition: Trở lại animation bình thường mà không giật hoặc nhảy frame.

Yêu cầu:

* Chuyển động phải liền mạch, có gia tốc và giảm tốc phù hợp.
* Đòn đánh có cảm giác nhanh, dứt khoát, không giống một thanh kiếm đang quay độc lập.
* Tay, cánh tay, thân người và kiếm phải phối hợp với nhau.
* Giữ nguyên phong cách pixel art, silhouette, màu sắc và tỷ lệ nhân vật hiện có.
* Không tự ý thay thế nhân vật bằng sprite khác hoặc chuyển sang phong cách đồ họa khác.
* Không làm animation bị nhòe do nội suy hoặc xoay hình gây mất nét pixel.
* Ưu tiên các frame pixel art có sẵn nếu chúng đủ tốt; chỉ tạo hoặc bổ sung frame mới khi thật sự cần thiết.

4. Pivot và cách render vũ khí

Hãy xác minh phương pháp hiện tại trước khi chọn cách sửa.

Nếu kiếm được ghép từ sprite riêng:

* Xác định điểm cầm kiếm chính xác tại bàn tay.
* Giữ chuôi kiếm gắn với tay trong suốt chuyển động.
* Nếu dùng phép xoay, phải xoay quanh pivot phù hợp, không xoay quanh tâm ảnh một cách máy móc.
* Tính toán vị trí và góc kiếm nhất quán trong hệ tọa độ của nhân vật.
* Kiểm tra thứ tự render để kiếm có thể nằm trước hoặc sau cơ thể đúng theo tư thế.
* Đảm bảo đổi hướng nhân vật không làm kiếm bị lệch hoặc lật sai.

Nếu kiếm nằm trong sprite sheet chung với nhân vật:

* Kiểm tra frame index, kích thước frame, padding, clipping và offset.
* Không tách kiếm thành sprite riêng nếu điều đó không cần thiết.
* Đảm bảo từng frame không làm tay, kiếm hoặc cơ thể nhảy vị trí bất thường.

5. Đồng bộ gameplay

Animation phải đồng bộ với cơ chế chiến đấu hiện tại:

* Hitbox phải phù hợp với đường kiếm và thời điểm đòn chém thực sự trúng mục tiêu.
* Không gây sát thương nhiều lần ngoài ý muốn chỉ vì animation có nhiều frame.
* Không để nhân vật bị khóa input vô thời hạn.
* Không để trạng thái attack mắc kẹt khi nhả nút, đổi hướng hoặc chuyển scene.
* Nếu có combo, giữ khả năng nối đòn theo kiến trúc gameplay hiện có.
* Không thay đổi sát thương, tốc độ đánh, phạm vi tấn công hoặc cân bằng gameplay nếu không cần thiết.

6. Ràng buộc quan trọng

* Giữ nguyên giao diện, bản đồ, tài nguyên, âm thanh, tiến trình người chơi và các tính năng khác.
* Không viết lại toàn bộ game khi chỉ cần sửa một module.
* Không thay đổi API hoặc cấu trúc dữ liệu đang được các hệ thống khác sử dụng nếu không cần thiết.
* Không xóa code cũ chỉ để làm cho bản sửa ngắn hơn.
* Không thêm thư viện mới nếu có thể giải quyết bằng hệ thống hiện có.
* Không chỉnh sửa sprite hoặc animation không liên quan.
* Bảo toàn khả năng tương thích trên trình duyệt máy tính và điện thoại.
* Giữ nguyên cấu hình triển khai và hệ thống lưu dữ liệu.

7. Kiểm thử bắt buộc

Sau khi sửa, hãy kiểm tra:

1. Animation chạy đúng khi tấn công liên tục.
2. Không giật hình, nhảy vị trí, xuyên tay hoặc tuột chuôi kiếm.
3. Không phát sinh lỗi khi nhân vật quay trái/phải.
4. Không có frame bị cắt hoặc vũ khí biến mất bất thường.
5. Animation trở về idle đúng cách.
6. Hitbox hoạt động đúng thời điểm.
7. Không gây lỗi các trạng thái chạy, nhảy, đứng yên hoặc nhận sát thương.
8. Không phát sinh lỗi JavaScript trong console.
9. Hoạt động tốt trên màn hình điện thoại và máy tính.

Nếu có thể chạy game, hãy trực tiếp chơi thử và quan sát animation trước và sau khi sửa. Nếu không thể chạy game, hãy nêu rõ giới hạn kiểm thử, không tuyên bố đã xác nhận kết quả bằng mắt.

8. Cách thực hiện và báo cáo

Hãy làm việc trực tiếp trên repository hoặc workspace hiện có nếu được cấp quyền.

Quy trình:

1. Kiểm tra code và xác định nguyên nhân gốc.
2. Nêu ngắn gọn các file cần sửa và lý do.
3. Thực hiện thay đổi thực tế, không chỉ đưa ra hướng dẫn.
4. Chạy các kiểm tra phù hợp.
5. Tổng kết file đã sửa, nguyên nhân được xác minh, giải pháp, kết quả kiểm thử và những phần chưa thể xác minh.

Nếu không có quyền truy cập repository, hãy yêu cầu mình cung cấp source code hoặc kết nối môi trường phát triển phù hợp. Không được tuyên bố đã sửa website production nếu chưa thực sự chỉnh sửa và triển khai thành công.

Ưu tiên cao nhất: Làm cho animation chém kiếm mượt, tự nhiên, có lực và nhất quán với phong cách pixel art của Linh Khí, đồng thời không làm hỏng những phần khác của game.