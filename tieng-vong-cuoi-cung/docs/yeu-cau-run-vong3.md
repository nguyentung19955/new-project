## CHUÔNG HUNTER – YÊU CẦU SỬA RUN 8 FRAME (VÒNG 3)

Tôi đã xem ảnh so sánh, GIF, ảnh trong game và báo cáo bản RUN mới.

**Quyết định: GIỮ bản Lam cao 64 px, ô 80×80, pivot [40,79], 8 frame, 12 FPS. Nhưng CHƯA DUYỆT RUN cuối cùng.**

Bản này đã cải thiện rõ về độ nét, ngoại hình và khả năng giữ chi tiết so với bản cao 46 px. Không quay lại bản 46 và không quay lại pipeline 3D.

### 1. Nhiệm vụ chính

Chỉnh trực tiếp 8 PNG hiện có trong `art/nhan-vat/lam-chatgpt/run64/`. Không sinh lại toàn bộ sprite sheet bằng AI, không dựng lại mô hình 3D, không chạy lại quá trình thu nhỏ từ ảnh nguồn nếu không cần thiết.

Tập trung sửa 3 lỗi:

**A. Tay cầm kiếm quá cứng – ưu tiên cao nhất**

- Tay cầm kiếm phải chuyển động theo nhịp chạy, không giữ nguyên một góc ở cả 8 frame.
- Chuyển động vai, khuỷu tay và bàn tay phải có sự liên kết.
- Kiếm luôn nằm trong tay xa camera, đúng thiết kế Lam đã chốt.
- Không để kiếm xuyên thân, đứt chuôi hoặc biến dạng lưỡi.
- Có thể thay đổi góc kiếm theo bước chạy, nhưng không biến RUN thành động tác chém.
- Không được chỉ dịch chuyển toàn bộ kiếm vài pixel rồi gọi đó là chuyển động tay.

**B. Hai chân chưa đọc rõ**

- Phân biệt rõ chân gần và chân xa bằng silhouette, độ chồng lớp và các màu đã có.
- Ở F1 và F7, tránh hai chân dính thành một khối tối.
- Giữ được các tư thế tiếp đất, chống đỡ, đạp sau và đưa chân về trước.
- Bàn chân tiếp đất phải ổn định với pivot [40,79].
- Không tự động căn giữa nhân vật theo bounding box từng frame.

**C. Thân trên còn cứng**

- Bổ sung chuyển động nhỏ của vai và thân theo nhịp chân.
- Đầu giữ ổn định tương đối, không lắc quá mức.
- Áo choàng có độ trễ theo chuyển động thân.
- Chuông đung đưa nhẹ, không nhảy vị trí bất thường.
- Giữ nguyên silhouette nhận diện Lam, không làm mũ hoặc áo choàng biến dạng.

### 2. Những gì phải bảo toàn

- Mũ nhọn, viền xanh, hai mắt sáng.
- Chuông vàng phía sau mũ/vai, áo choàng xanh rách nhiều lớp.
- Khóa ngực, găng tay, ủng và kiếm xanh bạc có chắn kiếm vàng.
- Bảng màu hiện tại, pixel cứng, alpha chỉ 0 hoặc 255.
- Không làm mất chi tiết để đổi lấy sự mượt giả tạo.
- Không thêm blur, anti-aliasing hoặc nội suy ảnh.

Khoen treo chuông chưa giống mẫu gốc: nếu có thể sửa bằng vài pixel mà không ảnh hưởng chuyển động, hãy sửa; không được ưu tiên nó hơn ba lỗi chính.

### 3. Kiểm định chuyển động

Giữ nguyên 8 frame, 12 FPS, loop.

Yêu cầu xuất ảnh chứng minh:

1. **RUN trước/sau:** 2 hàng × 8 frame, cùng kích thước, cùng pivot.
2. **GIF trước/sau:** chạy 12 FPS, mỗi bản ít nhất 3 vòng liên tiếp.
3. **Ảnh silhouette:** kiểm tra khả năng phân biệt chân và tay.
4. **Ảnh đánh dấu vị trí vai, khuỷu tay, bàn tay, đầu kiếm và hai bàn chân** qua 8 frame.
5. **Ảnh trong game:** ở ×1, ×2 và ×4 để đánh giá khả năng đọc chuyển động trong bối cảnh Làng Chuông.
6. **Kiểm tra nối vòng F7→F0:** không có cú giật bất thường ở kiếm, tay, chân, áo hoặc chuông.

Không chỉ dùng số pixel thay đổi để chứng minh animation tốt. Phải đánh giá bằng mắt ở tốc độ thật.

### 4. Tiêu chí duyệt

RUN chỉ được đề xuất duyệt khi:

- Nhìn ở ×1 và ×2 vẫn phân biệt được nhịp chạy.
- Tay kiếm chuyển động có chủ đích, không bị khóa vào thân.
- Hai chân thể hiện rõ sự luân phiên.
- Vai, thân, áo choàng và chuông phối hợp tự nhiên.
- Không có flicker, đốm màu lạ hoặc biến dạng chi tiết quan trọng.
- Vòng lặp 8 frame liên tục, không giật.
- Ngoại hình vẫn nhận diện đúng Lam trong ảnh mẫu đã chốt.

### 5. Phạm vi công việc

Chỉ sửa RUN hiện tại. Không sửa `demo.html`, `anim2d.js`, các animation khác hoặc tài nguyên gốc đã chốt.

Giữ bản RUN cũ để so sánh và có thể hoàn nguyên. Xuất bản sửa vào thư mục riêng, kèm báo cáo số pixel sửa từng frame và giải thích các thay đổi chính.

**Quan trọng:** Trước khi sửa, hãy kiểm tra xem chuyển động tay kiếm có thực sự khả thi trong sprite hiện có hay không. Nếu cần vẽ lại một phần cánh tay, hãy thực hiện ở mức pixel art, không chỉ xoay hoặc kéo giãn một mảng ảnh.

Nếu sau khi chỉnh mà tay/chân vẫn không đọc rõ hoặc ngoại hình Lam bị biến dạng, báo thẳng là chưa đạt, không tự tuyên bố hoàn thành.

**Hãy thực hiện RUN vòng 3 và gửi đầy đủ ảnh/GIF kiểm định để tôi duyệt trước khi chuyển sang Jump, Fall và Attack.**