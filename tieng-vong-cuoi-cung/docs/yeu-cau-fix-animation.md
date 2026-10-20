# PROMPT — FIX SPRITE ANIMATION HTML5 GAME

Bạn là chuyên gia lập trình game 2D HTML5 Canvas, JavaScript và hệ thống sprite animation.

Hãy kiểm tra toàn bộ source code game **Chuông Hunter** và sửa triệt để hiện tượng nhân vật, quái vật bị nhấp nhô, rung giật, thay đổi kích thước hoặc lệch vị trí khi phát animation.

## 1. Phân tích nguyên nhân trước khi sửa

Kiểm tra:

- Cách cắt từng frame từ sprite sheet.
- Kích thước thực tế của mỗi frame.
- Vị trí nhân vật bên trong từng frame.
- Điểm neo (anchor/pivot) khi render.
- Tọa độ X, Y và kích thước vẽ bằng `drawImage()`.
- Cách chuyển đổi giữa idle, run, jump, attack, hurt và death.
- Cách tính FPS và deltaTime.
- Camera, canvas scaling và devicePixelRatio.
- Logic cập nhật vị trí nhân vật và hệ thống va chạm.

Phải phân biệt rõ lỗi do hình ảnh gốc và lỗi do code. Không được kết luận khi chưa kiểm tra.

## 2. Sửa hệ thống sprite rendering

Yêu cầu:

1. Mỗi animation phải sử dụng kích thước frame chính xác theo sprite sheet tương ứng.
2. Không được giả định mọi sprite sheet đều có cùng kích thước.
3. Thiết lập điểm neo nhất quán cho từng animation.
4. Tách biệt tọa độ vật lý của nhân vật với tọa độ hiển thị sprite.
5. Không được để thay đổi frame làm thay đổi hitbox hoặc vị trí vật lý.
6. Không được tự động co giãn từng frame để vừa khung.
7. Chỉ làm tròn tọa độ ở bước render nếu cần pixel snapping.
8. Nếu sprite có khoảng trắng không đều, sử dụng metadata offset riêng cho từng frame để căn chỉnh.
9. Giữ nguyên tỷ lệ nhân vật và độ phân giải hiển thị nhất quán.
10. Không được tạo thêm chuyển động lên xuống giả nếu sprite đã chứa chuyển động đó.

## 3. Chuẩn hóa animation

Với mỗi animation:

- Idle: nhân vật đứng ổn định, chỉ có chuyển động thở và phụ kiện.
- Run: chuyển động chân tay liên tục, thân có dao động tự nhiên nhưng không nhảy giật.
- Jump: chuyển động theo tọa độ vật lý và trọng lực, không cộng thêm độ cao không cần thiết từ sprite.
- Attack: tay cầm vũ khí và thân chuyển động liên tục, không bị dịch chuyển toàn bộ nhân vật ngoài ý muốn.
- Hurt: phản ứng trúng đòn nhưng không làm thay đổi vị trí vật lý trừ khi có knockback.
- Death: nhân vật ngã hoặc tan biến đúng theo animation, không bị kéo về vị trí đứng.

Đặc biệt kiểm tra sự thay đổi anchor giữa các animation.

## 4. Sửa vòng lặp game

Sử dụng `requestAnimationFrame` và deltaTime đúng cách.

Animation phải chạy ổn định trên màn hình 60Hz, 120Hz và các thiết bị có tốc độ làm mới khác nhau.

Không tăng frame dựa trực tiếp vào số lần gọi hàm render.

Khi chuyển animation, phải có quy tắc reset hoặc giữ thời gian frame phù hợp. Không reset liên tục cùng một animation ở mỗi vòng lặp.

Không được để animation ảnh hưởng tới tốc độ di chuyển thực tế của nhân vật.

## 5. Tạo chế độ Debug Animation

Thêm chế độ debug có thể bật/tắt để hiển thị:

- Khung sprite gốc.
- Điểm neo (pivot).
- Hitbox.
- Đường mặt đất.
- Tọa độ nhân vật.
- Tên animation hiện tại.
- Chỉ số frame hiện tại.
- FPS thực tế.

Cho phép phát từng frame, tạm dừng và phát chậm để kiểm tra sự lệch vị trí.

## 6. Kiểm tra sprite sheet

Nếu phát hiện sprite gốc có các frame lệch nhau:

- Phân tích độ lệch của nhân vật giữa các frame.
- Ưu tiên sửa bằng offset metadata khi có thể.
- Không tự động kéo giãn, bóp méo hoặc cắt mất bộ phận nhân vật.
- Không ép mọi frame chạy phải có cùng vị trí đầu hoặc hông, vì chu kỳ chạy có dao động tự nhiên.
- Phân biệt chuyển động có chủ đích với lỗi lệch frame.
- Nếu tỷ lệ tay, chân hoặc thân thực sự thay đổi, báo rõ những frame không thể sửa chỉ bằng code.

## 7. Giữ nguyên game hiện tại

Không được tự ý thay đổi:

- Thiết kế nhân vật.
- Gameplay.
- Điều khiển.
- Tốc độ di chuyển.
- Trọng lực và cơ chế nhảy.
- Hệ thống chiến đấu.
- Bản đồ và va chạm.
- Các tính năng hiện có không liên quan đến lỗi.

Chỉ refactor phần cần thiết để sửa animation và rendering.

## 8. Kết quả bắt buộc

Sau khi kiểm tra, hãy:

1. Liệt kê nguyên nhân cụ thể gây nhấp nhô hoặc rung giật.
2. Chỉ rõ file, hàm và đoạn code gây lỗi.
3. Sửa trực tiếp code liên quan.
4. Cung cấp mã nguồn hoàn chỉnh của các file đã sửa.
5. Kiểm tra lại từng animation trong game.
6. Xác nhận những lỗi đã sửa bằng kết quả chạy thử, không chỉ dựa vào suy đoán.
7. Liệt kê các sprite cần chỉnh lại nếu code không thể khắc phục.

**MỤC TIÊU CUỐI CÙNG:**

Nhân vật và quái vật chuyển động mượt, đúng vị trí, không rung giật, không nhấp nhô bất thường, không thay đổi kích thước giữa các frame. Giữ nguyên các chuyển động lên xuống tự nhiên vốn có trong animation.

Ưu tiên sửa lỗi tận gốc, không dùng các phép dịch chuyển ngẫu nhiên hoặc hiệu ứng làm mờ để che giấu lỗi.