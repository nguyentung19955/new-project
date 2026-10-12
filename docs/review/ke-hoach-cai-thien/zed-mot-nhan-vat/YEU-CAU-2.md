# CLAUDE CODE — CHỈNH SỬA SOURCE GAME LINH KHÍ THÀNH BẢN ZED

Bạn đang làm việc trên source code thật của dự án Linh Khí trong thư mục hiện tại. Hãy trực tiếp sửa dự án này, không tạo một game mới thay thế.

## A. Mục tiêu

Chuyển game từ hệ thống nhiều nhân vật chơi được sang một nhân vật chơi được duy nhất tên **Zed**, sử dụng hình ảnh và dữ liệu của Cu Tí (`smith`) làm nền tảng ban đầu.

Zed có thể sử dụng bốn loại vũ khí:
- Kiếm (sword).
- Giáo (spear).
- Cung (bow).
- Búa (hammer).

Boss sẽ mở khóa kỹ năng, nội tại hoặc nâng cấp thay vì mở khóa nhân vật chơi được.

Những nhân vật còn lại vẫn được giữ làm NPC, nhân vật cốt truyện hoặc đối tượng giải cứu khi nội dung game cần đến.

## B. Bắt buộc khảo sát source trước khi sửa

1. Đọc `game/README.md`, sau đó kiểm tra `game/index.html`, mã nguồn thực tế, các module, tài nguyên trong `art/`, hệ thống lưu dữ liệu và thư mục `tests/`.
2. Xác định chính xác cách game chạy, cấu trúc nhân vật, cách chọn hero, cách xử lý chiến đấu và cách lưu tiến trình.
3. Tìm toàn bộ tham chiếu đến `smith`, `hunter`, `healer`, `wrestler`, `HEROES`, `HKEYS`, `save.hero`, `save.heroes` và các cơ chế mở khóa nhân vật.
4. Tìm tất cả nơi dùng nhân vật cũ trong NPC, hội thoại, cốt truyện, giải cứu, hình ảnh, giao diện và kiểm thử.
5. Kiểm tra các bộ sprite và animation thực sự tồn tại. Không đoán đường dẫn hoặc tên tài nguyên.

Trước tiên, hãy đưa ra kế hoạch sửa ngắn gọn dựa trên source thật, rồi tiếp tục triển khai trong cùng phiên làm việc. Không dừng lại ở việc chỉ trả về kế hoạch.

## C. Những hệ thống cần giữ nguyên

Đây là game đã có gameplay tương đối hoàn chỉnh. Không được vô tình xóa hoặc làm hỏng các hệ thống sau:

- Làng và các NPC tương tác.
- Chọn ải, bản đồ, phòng, quái và boss.
- Hệ thống chiến đấu tám hướng.
- Né/lăn, đòn đánh thường, đòn đặc biệt và chưởng.
- Bốn bộ vũ khí với cách đánh riêng.
- Hệ thống Lửa, Độc, Băng và tiến hóa vũ khí.
- Trang bị, trang phục, túi đồ, rèn, nâng cấp và tài nguyên.
- Cây kỹ năng, nội tại, phần thưởng và tiến trình chương.
- Bảng vàng, lực chiến, giao diện cảm ứng và các cơ chế khác đang hoạt động.
- Lưu game trên trình duyệt và lưu mây/Firebase nếu dự án đang sử dụng.

Không viết lại các cơ chế này chỉ để thuận tiện cho việc bỏ nhân vật. Tái sử dụng code hiện có và thay đổi tại đúng điểm phụ thuộc.

## D. Chuyển sang một nhân vật Zed

1. Dùng dữ liệu của `smith` làm dữ liệu nền cho Zed khi phù hợp.
2. Chỉ để Zed xuất hiện trong danh sách nhân vật người chơi có thể lựa chọn.
3. Ẩn hoặc loại bỏ chức năng đổi sang hero khác ở giao diện làng và các màn hình liên quan.
4. Không xóa các hero cũ khỏi hệ thống NPC nếu chúng vẫn được cốt truyện hoặc gameplay sử dụng.
5. Kiểm tra các chỉ số, nội tại, cây kỹ năng, trang bị và chiến đấu trước đây phụ thuộc vào từng hero. Chuyển chúng sang cấu trúc của Zed hoặc loại bỏ nhánh thực sự không còn cần thiết.
6. Không giữ các tham chiếu chết gây lỗi runtime, nhưng cũng không thay hàng loạt tên biến một cách máy móc.
7. Nếu `smith` là khóa dữ liệu được dùng rộng rãi, hãy cân nhắc giữ khóa nội bộ đó và chỉ đổi tên hiển thị thành Zed để giảm rủi ro refactor. Chỉ tạo khóa `zed` mới nếu việc đó thực sự cần thiết và đã xử lý đầy đủ mọi phụ thuộc.

## E. Giữ nguyên cơ chế của bốn vũ khí

Không xây dựng lại hệ thống vũ khí từ đầu. Hãy kiểm tra và bảo toàn cơ chế hiện có:

- **Kiếm:** combo ba nhát, nhát cuối mạnh hơn, cùng các đòn đặc biệt hiện có.
- **Giáo:** chuỗi đâm, quét vòng, lao tới và cơ chế phi giáo nếu đang được triển khai.
- **Cung:** bắn nhanh, tự ngắm, giữ để lấy đà, bắn mạnh và projectile tên.
- **Búa:** nện gây khựng, tích lực và sóng chấn động.

Các chi tiết trên là định hướng kiểm tra từ tài liệu dự án; hãy xác minh bằng code thực tế. Không tự ý xóa hoặc đơn giản hóa một chiêu chỉ vì nó phức tạp.

Đảm bảo Zed sử dụng được cả bốn loại vũ khí, đổi vũ khí không làm sai trạng thái chiến đấu và animation phù hợp với vũ khí đang cầm.

## F. Animation và tài nguyên hình ảnh

- Kiểm kê sprite sheet, sprite JSON, hình nhân vật, hình vũ khí và animation có sẵn.
- Giữ cách render, kích thước frame, pivot, hướng tám chiều và tốc độ animation hiện tại nếu chúng đang hoạt động đúng.
- Tái sử dụng animation nền của nhân vật khi phù hợp.
- Dùng animation hoặc layer vũ khí riêng nếu kiến trúc hiện tại hỗ trợ tốt.
- Không giả định rằng có sẵn mọi animation tấn công chỉ vì đã có hình ảnh vũ khí.
- Không tự động thay toàn bộ hình ảnh bằng hình AI mới.
- Nếu thiếu animation của Zed hoặc một vũ khí, ghi rõ tài nguyên nào thiếu và tạo fallback an toàn nếu cần.
- Không làm hỏng các hiệu ứng chém, projectile, vùng gây sát thương hoặc hướng tấn công tám chiều.

## G. Chuyển phần thưởng boss

Tìm chính xác nơi boss mở khóa hero mới và thay cơ chế đó bằng phần thưởng cho Zed.

Có thể mở khóa:
- Kỹ năng chủ động.
- Nội tại.
- Nâng cấp vũ khí.
- Phần thưởng theo tiến trình hoặc vật phẩm hiện có.

Ưu tiên tái sử dụng hệ thống phần thưởng, cây kỹ năng và dữ liệu boss. Không làm mất boss, chương hoặc điều kiện mở khóa đang hoạt động.

Phần thưởng phải được cấp đúng một lần theo quy tắc hiện có và phải được lưu đúng. Không để giao diện còn thông báo mở khóa nhân vật khi hạ boss.

## H. Save và Firebase

Tôi chấp nhận xóa save cũ và bắt đầu tiến trình mới. Không bắt buộc tương thích ngược với save của nhiều hero.

Tuy nhiên, không được xóa dữ liệu của người dùng hoặc reset Firebase một cách âm thầm.

- Kiểm tra cả save cục bộ và save mây.
- Xác định schema mới cho Zed, bốn vũ khí và phần thưởng.
- Khởi tạo dữ liệu mặc định khi không có save hoặc save không hợp lệ.
- Nếu schema cũ xung đột, tạo cơ chế reset cục bộ có kiểm soát và thông báo rõ.
- Không tự ý thay đổi quyền truy cập, cấu hình hoặc dữ liệu Firebase ngoài phạm vi cần thiết.
- Không để save cũ làm game crash hoặc gây lỗi khi tải nhân vật.

## I. Kiểm thử bắt buộc

Sử dụng các test có sẵn trong `game/tests/`. Đọc `game/build.py` và README để xác định cách build hoặc chạy test chính xác.

Sau khi sửa:

1. Chạy các test liên quan và kiểm tra cú pháp.
2. Kiểm tra khởi động game và tải tài nguyên.
3. Kiểm tra màn hình làng không còn cho chọn các hero cũ.
4. Kiểm tra NPC và cốt truyện vẫn hoạt động.
5. Kiểm tra cả bốn vũ khí và các cơ chế chiến đấu riêng.
6. Kiểm tra projectile, sát thương, né, chưởng và đòn đặc biệt.
7. Kiểm tra boss và phần thưởng kỹ năng/nội tại.
8. Kiểm tra save mới, tải lại game và đồng bộ save mây nếu môi trường cho phép.
9. Tìm các tham chiếu nhân vật cũ còn sót và xác định cái nào là hợp lệ cho NPC, cái nào là lỗi.
10. Kiểm tra không có lỗi JavaScript hoặc đường dẫn tài nguyên bị hỏng.

Không được tuyên bố một test đã thành công nếu chưa thực sự chạy nó. Nếu môi trường không hỗ trợ một bước, hãy nêu rõ giới hạn.

## J. An toàn khi sửa

- Giữ nguyên source gốc có thể khôi phục.
- Kiểm tra trạng thái Git trước khi sửa nếu có Git.
- Không xóa file tài nguyên, thư mục test hoặc dữ liệu Firebase chỉ vì chúng không còn được tham chiếu trực tiếp.
- Không ghi đè bản build hoặc file cấu hình quan trọng nếu chưa hiểu tác động.
- Thực hiện thay đổi nhỏ, có thể kiểm tra và sửa lỗi theo từng nhóm.
- Không chỉ tạo bản demo riêng: phải cập nhật game thực tế.
- Nếu có nhiều phương án, ưu tiên phương án ít rủi ro và giữ được nhiều gameplay hiện có nhất.

## K. Báo cáo kết quả

Sau khi hoàn thành, cung cấp:
1. Tóm tắt cấu trúc code đã khảo sát.
2. Danh sách file đã sửa và lý do.
3. Các thay đổi về nhân vật, vũ khí và phần thưởng boss.
4. Những test đã chạy, kết quả thực tế và test chưa chạy.
5. Những lỗi hoặc rủi ro còn lại.
6. Các tài nguyên animation còn thiếu.
7. Cách chạy game đã chỉnh sửa.

**Mục tiêu cuối cùng:** Một bản Linh Khí chạy trên source hiện có, chỉ có Zed là nhân vật chơi được, vẫn giữ được bốn hệ vũ khí và gameplay hiện hữu, boss thưởng kỹ năng/nội tại, NPC và cốt truyện không bị phá hỏng.

---
**Ghi chú của chủ dự án (12/10 18:43): làm theo file này, KHÔNG test (không chạy Playwright, không chạy bộ test) vì test rất mất thời gian. Chỉ build và kiểm cú pháp.**
