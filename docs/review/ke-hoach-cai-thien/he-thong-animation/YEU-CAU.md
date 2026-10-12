# Yêu cầu của chủ dự án (12/10 18:09) — nguyên văn

Tôi muốn bạn thực hiện một cuộc kiểm tra mã nguồn để trích xuất TOÀN BỘ hệ thống animation của nhân vật hiện tại, chuẩn bị cho việc thiết kế lại animation chuyên nghiệp hơn.
Giai đoạn này chỉ phân tích và trích xuất, chưa sửa code, chưa xóa code và chưa tự ý viết lại hệ thống.
Hãy tìm kiếm trong toàn bộ mã nguồn những thành phần sau:

1. Định nghĩa nhân vật, cấu trúc player, enemy, NPC và các lớp nhân vật liên quan.
2. Hàm cập nhật trạng thái nhân vật, update, tick, physics và movement.
3. Hàm render, draw, renderPlayer, drawSprite, drawImage hoặc các hàm vẽ nhân vật.
4. Toàn bộ animation đứng yên (idle), chạy (run), đi bộ (walk), nhảy (jump), rơi (fall), tiếp đất (land).
5. Toàn bộ animation tấn công: chém kiếm, đâm thương, bắn cung, đập búa.
6. Animation lộn người, né tránh, lướt nhanh, phòng thủ, nhận sát thương, choáng và chết nếu có.
7. Hệ thống sprite sheet, spritesheet slicing, frame index, frame duration, FPS, animation timer và animation state.
8. Cách chọn frame, thứ tự frame, chuyển frame, lặp animation, kết thúc animation và trở về trạng thái idle.
9. Cách nhân vật cầm vũ khí, vị trí tay, vị trí vũ khí, góc xoay, điểm neo, hướng quay và hiệu ứng vũ khí.
10. Hệ thống hitbox, hurtbox, vùng gây sát thương, thời điểm gây sát thương và liên hệ giữa animation với combat.
11. Hiệu ứng vệt chém, cung tên, đạn bay, va chạm, bụi đất, rung màn hình và hiệu ứng khi đánh trúng.
12. Input bàn phím, chuột, điều khiển mobile và cách chúng kích hoạt animation.
13. Những đoạn code bị trùng lặp, animation bị giật, sai frame, xuyên vũ khí, lệch tay, animation bị ngắt hoặc không trở về idle.
14. Các file hình ảnh, sprite sheet, JSON atlas và cấu hình liên quan đến animation.

Yêu cầu đầu ra:
A. Lập sơ đồ các file và hàm đang điều khiển animation.
B. Liệt kê tên file, tên hàm, vị trí dòng code nếu xác định được, cùng đoạn code thực tế liên quan. Không tự bịa tên hàm hoặc code chưa tồn tại.
C. Giải thích luồng hoạt động từ lúc người chơi nhấn phím đến lúc animation được cập nhật, render và gây sát thương.
D. Lập bảng cho từng animation với các cột: tên animation, nguồn dữ liệu, số frame, kích thước frame, tốc độ phát, điều kiện kích hoạt, điều kiện kết thúc, trạng thái hiện tại và các lỗi tiềm ẩn.
E. Chỉ ra phần nào đang dùng hình vẽ bằng canvas, phần nào dùng sprite sheet, phần nào dùng hình ảnh ghép hoặc xoay vũ khí bằng code.
F. Xác định những thành phần cần giữ lại để không làm hỏng gameplay, physics, collision, camera, inventory, trang bị và hệ thống chiến đấu.
G. Xác định cấu trúc dữ liệu và quy tắc đặt tên phù hợp để thay thế hoặc nâng cấp animation trong tương lai.
H. Đưa ra danh sách file cần tôi gửi thêm nếu chưa đủ thông tin.
Nếu dự án có nhiều file, hãy phân tích tất cả các file liên quan và theo dấu những hàm được gọi qua nhiều file. Không chỉ tìm kiếm từ khóa animation.
Không được tự ý thay đổi gameplay hoặc thay thế các đoạn code chưa hiểu rõ. Không được bỏ qua những đoạn code liên quan đến vũ khí, trạng thái nhân vật và thời điểm gây sát thương.
Kết thúc bằng một bản báo cáo có cấu trúc, đủ thông tin để một lập trình viên khác có thể thiết kế lại toàn bộ animation mà vẫn giữ nguyên gameplay hiện có.
