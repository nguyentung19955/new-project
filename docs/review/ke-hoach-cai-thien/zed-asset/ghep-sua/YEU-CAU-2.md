# PROMPT CHO CLAUDE — SỬA TẬN GỐC THUẬT TOÁN GHÉP LỚP SPRITE ZED

Bạn là Senior Python Engineer kiêm Technical Artist chuyên về pipeline xử lý sprite sheet pixel art cho game 2D. Hãy trực tiếp kiểm tra, sửa code, chạy thử và bàn giao kết quả hoàn chỉnh cho game **LINH KHÍ**.

Tôi cung cấp các file:

- `cat-diem-anh(1).py`: script tách sprite theo vùng pixel, khử nền và xuất GIF.
- `ghep-thu(1).py`: script ghép các lớp trang bị lên thân Zed.
- Sprite thân Zed 8 cột × 3 hàng: đứng, đi, chạy.
- Sprite giáp đỏ viền vàng 8 × 3.
- Sprite nón lá 8 × 3.
- Sprite áo choàng đỏ 8 × 3.
- Ảnh thử nghiệm ghép lớp đang bị lỗi.

Nếu tên file trong môi trường thực tế khác tên trên, hãy tự tìm file tương ứng và xác nhận chính xác trước khi sửa.

## 1. Lỗi nghiêm trọng cần xử lý

Ảnh ghép thử nghiệm cho thấy nón lá che gần hết mặt Zed. Đây là lỗi ghép lớp và căn chỉnh, không phải phong cách thiết kế được chấp nhận.

Zed là nhân vật đã có thiết kế gốc. **Không được thiết kế lại nhân vật, thay đổi khuôn mặt hoặc sửa sprite nguồn để che giấu lỗi ghép.**

Nhận diện phải được giữ nguyên:

- Tóc trắng bù xù.
- Hai sừng cong đỏ sẫm.
- Mắt đỏ, khuôn mặt và biểu cảm nguyên bản.
- Khăn quàng đỏ, quần đen rộng, đai đỏ, quấn tay và giày đen.
- Phong cách pixel art chibi, viền tối rõ ràng.

Nón lá phải được đội đúng vị trí trên đầu, có lỗ hoặc khoảng trống hợp lý cho cả hai sừng nhô lên. Dây nón phải nằm tự nhiên quanh đầu, không biến thành những mảng đỏ che mắt hoặc mặt.

Không chấp nhận kết quả chỉ vì nón nằm đúng gần tọa độ đầu. Phải kiểm tra trực quan rằng khuôn mặt vẫn đọc được rõ ràng trong cả ba trạng thái đứng, đi và chạy.

## 2. Kiểm tra code hiện có trước khi sửa

Đọc toàn bộ hai script và các ảnh nguồn. Truy vết từng bước:

1. Tạo mask tách nền.
2. Tìm vùng sprite và chia thành hàng.
3. Tách từng frame.
4. Resize và giữ alpha.
5. Tính điểm neo đầu, thân, chân và vai.
6. Ghép áo choàng, thân Zed, giáp và nón.
7. Xuất ảnh thử nghiệm và GIF.

Đặc biệt kiểm tra các đoạn trong `ghep-thu.py` đang dùng tỷ lệ chiều cao sprite để ước lượng vị trí đầu, thân và điểm ghép. Không mặc định những công thức này đúng cho mọi frame.

Kiểm tra cả cơ chế trong `cat-diem-anh.py` tự gộp hoặc cắt vùng hình khi số lượng sprite không đúng yêu cầu. Không để thuật toán tự tạo ra đủ tám frame bằng cách cắt/gộp tùy tiện rồi coi đó là dữ liệu hợp lệ.

Trước khi sửa, hãy ghi rõ:

- Nguyên nhân gốc.
- Dòng code hoặc hàm liên quan.
- Ảnh hưởng đến kết quả.
- Cách sửa được lựa chọn.

Không dừng ở việc chỉ viết báo cáo hoặc đưa ra gợi ý. Hãy sửa code thực tế.

## 3. Thiết kế lại pipeline ghép lớp

### 3.1. Điểm neo theo từng frame

Không dùng một tọa độ cố định hoặc tỷ lệ bounding box chung để ghép tất cả frame.

Xây dựng cấu hình điểm neo có thể chỉnh sửa, ưu tiên dữ liệu riêng cho từng frame, gồm tối thiểu:

- `head_anchor`: vị trí đầu.
- `helmet_anchor`: vị trí đặt nón.
- `horn_left_anchor`, `horn_right_anchor`: vị trí hai sừng so với nón.
- `face_protected_region`: vùng khuôn mặt cần giữ rõ.
- `shoulder_anchor`: vị trí vai.
- `armor_anchor`: vị trí giáp ngực và giáp vai.
- `cape_anchor`: vị trí gắn áo choàng sau lưng.
- `feet_anchor`: điểm neo chân để kiểm tra độ ổn định của nhân vật.

Có thể bổ sung góc xoay, tỷ lệ và độ lệch X/Y khi cần. Tất cả tọa độ phải có quy ước rõ ràng: tọa độ tương đối với frame nguồn hay tọa độ trên canvas đích.

Không bắt buộc dùng đúng tên trường trên nếu cấu trúc tốt hơn, nhưng phải có cùng khả năng kiểm soát.

### 3.2. Thứ tự ghép lớp

Xác định thứ tự ghép theo chiều sâu thực tế, không đơn thuần ghép lần lượt theo danh sách file.

Đối với lớp trang bị, xem xét tách thành các bộ phận độc lập khi cần:

- Phần dây nón nằm sau đầu.
- Phần nón chính.
- Các vùng nón hoặc dây có thể nằm trước/sau đầu.
- Áo choàng phía sau.
- Thân Zed.
- Giáp ngực và giáp vai.

Không được vẽ lại hoặc xóa khuôn mặt để tạo cảm giác nón nằm đúng vị trí.

Nếu nón nguồn không có đủ thông tin để xử lý lỗ sừng hoặc phần dây nằm trước/sau đầu, hãy nêu rõ giới hạn và tạo phương án chỉnh sửa mask có thể kiểm soát. Không tự suy đoán những vùng bị che khuất rồi tuyên bố đó là dữ liệu gốc.

### 3.3. Bảo vệ khuôn mặt và sừng

Tạo bước kiểm tra sau ghép:

- Hai mắt vẫn nhìn thấy rõ.
- Khuôn mặt không bị nón hoặc dây nón che bất hợp lý.
- Cả hai sừng vẫn có hình dạng nhận diện được và nhô lên qua đúng khoảng trống.
- Không xuất hiện các mảng xanh, lỗ alpha sai hoặc viền bị mất.
- Không có dây nón xuyên qua mắt, miệng hoặc các vùng không hợp lý.

Vùng mặt được bảo vệ không có nghĩa là phải làm nón xuyên qua mặt. Phải sửa vị trí, mask hoặc thứ tự lớp để giải quyết xung đột đúng về mặt hình ảnh.

Nếu kiểm tra tự động không đủ tin cậy để xác nhận mặt còn rõ, hãy tạo ảnh preview để kiểm tra bằng mắt. Không báo PASS chỉ dựa trên việc chương trình chạy thành công.

## 4. Giữ đúng chất lượng pixel art

- Không làm nhòe viền hoặc sinh các dải pixel trung gian ngoài ý muốn.
- Kiểm tra việc sử dụng `Image.LANCZOS` trong quá trình resize sprite. Với pixel art, ưu tiên `Image.Resampling.NEAREST` khi phóng/thu hình theo tỷ lệ nguyên hoặc khi yêu cầu giữ pixel sắc nét.
- Nếu cần thay đổi kích thước theo tỷ lệ không nguyên, phải đánh giá trực quan và giải thích lựa chọn; không thay đổi phương pháp một cách máy móc.
- Giữ alpha đúng, không tạo nền đục ngoài ý muốn.
- Không làm mất các chi tiết nhỏ của tóc, sừng, dây nón, viền trang bị.
- Không tự thay đổi bảng màu hoặc thiết kế gốc.

## 5. Kiểm tra tính toàn vẹn của sprite sheet

Mỗi sheet đứng/đi/chạy có đúng tám frame theo thứ tự trái sang phải.

Với mỗi hàng:

1. Xác nhận số lượng frame thực tế.
2. Xác nhận thứ tự frame.
3. Kiểm tra bounding box và điểm neo.
4. Kiểm tra frame có bị cắt tóc, sừng, khăn hoặc trang bị không.
5. Kiểm tra chân có ổn định khi chuyển frame không.
6. Đối chiếu kết quả với ảnh nguồn.

Nếu không tìm thấy đủ tám frame hoặc thuật toán không xác định được ranh giới đáng tin cậy, phải báo lỗi và dừng xuất bản chính thức. Không tự cắt hoặc gộp hình chỉ để đạt đủ tám frame.

Có thể tạo chế độ phục hồi hoặc chế độ thử nghiệm riêng, nhưng phải ghi rõ frame nào được suy đoán, tách thủ công hoặc chưa được xác nhận.

## 6. Tạo bộ kiểm thử trực quan

Hãy tạo một bộ preview dễ kiểm tra, gồm:

- Sprite thân Zed nguyên bản.
- Từng lớp riêng với nền trong suốt.
- Kết quả ghép áo choàng.
- Kết quả ghép giáp.
- Kết quả ghép nón.
- Kết quả ghép hoàn chỉnh.
- GIF đứng, đi và chạy sau khi ghép.
- Ảnh so sánh trước và sau khi sửa.

Preview phải cho phép nhìn rõ từng frame. Không dùng ảnh ghép phóng quá nhỏ đến mức không thể đánh giá mặt và sừng.

Nếu thuận tiện, tạo thêm ảnh overlay các điểm neo để dễ phát hiện lệch tọa độ. Các điểm neo chỉ hiển thị trong ảnh debug, không xuất hiện trong asset cuối.

## 7. Kiểm tra tự động trước khi xuất

Xây dựng validation phù hợp với pipeline, tối thiểu kiểm tra:

- Đúng số frame.
- Không có frame rỗng hoặc bounding box bất thường.
- Không có sprite bị cắt ngoài canvas.
- Alpha hợp lệ.
- Điểm neo nằm trong giới hạn hợp lý.
- Vùng mặt và sừng không bị lớp nón che bất hợp lý.
- Không có lỗi kích thước hoặc thứ tự frame.

Các kiểm tra liên quan đến khuôn mặt phải được phân biệt rõ giữa kiểm tra tự động và kiểm tra trực quan. Không tuyên bố máy có thể xác nhận mọi tiêu chí thẩm mỹ nếu chưa triển khai được phép kiểm tra đáng tin cậy.

Chỉ xuất asset chính thức khi các kiểm tra bắt buộc đều đạt. Nếu không đạt, xuất báo cáo và preview debug để sửa tiếp.

## 8. Tiêu chí nghiệm thu

Chỉ coi công việc hoàn thành khi:

- [ ] Hai script đã được sửa trực tiếp.
- [ ] Có thể chạy lại pipeline bằng lệnh rõ ràng.
- [ ] Không còn cơ chế âm thầm cắt/gộp frame để che lỗi đầu vào.
- [ ] Tất cả frame hợp lệ đều giữ đúng thứ tự.
- [ ] Mặt Zed không bị nón che bất hợp lý.
- [ ] Hai sừng vẫn rõ ràng ở cả ba trạng thái.
- [ ] Áo choàng và giáp được ghép đúng vùng, không trôi bất thường giữa các frame.
- [ ] Pixel art giữ cạnh sắc nét và alpha đúng.
- [ ] Đã chạy kiểm thử thực tế, không chỉ kiểm tra cú pháp.
- [ ] Có ảnh preview để người dùng xác nhận bằng mắt.
- [ ] Có hướng dẫn chạy lại và chỉnh điểm neo.

## 9. Quy tắc thực hiện và bàn giao

Hãy làm theo thứ tự:

1. Kiểm tra file và ảnh nguồn.
2. Nêu nguyên nhân gốc ngắn gọn.
3. Sửa trực tiếp code.
4. Chạy thử bằng chính ảnh nguồn được cung cấp.
5. Mở/kiểm tra kết quả trực quan và sửa các lỗi còn lại.
6. Chạy lại kiểm thử sau khi sửa.
7. Bàn giao các file đã sửa, ảnh preview, GIF kiểm thử, báo cáo validation và hướng dẫn chạy.

Không được:

- Chỉ trả lời bằng lý thuyết.
- Viết lại toàn bộ hệ thống không cần thiết.
- Thay đổi thiết kế Zed để hợp thức hóa lỗi.
- Tự tuyên bố đã chạy thử nếu môi trường không cho phép.
- Đánh dấu PASS cho tiêu chí chưa được xác minh.

Nếu thiếu dependency hoặc môi trường không thể chạy, hãy nêu chính xác lệnh đã thử, lỗi nhận được và phần nào chưa xác minh.

**Mục tiêu cuối cùng:** pipeline ghép sprite có thể lặp lại, dễ chỉnh sửa và kiểm tra được; trang bị khớp từng frame, khuôn mặt Zed luôn được giữ nguyên nhận diện, và asset đầu ra đủ tin cậy để tích hợp vào game LINH KHÍ.
