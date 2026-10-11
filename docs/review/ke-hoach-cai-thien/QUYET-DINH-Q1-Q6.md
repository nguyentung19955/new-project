LINH KHÍ — QUYẾT ĐỊNH CHÍNH THỨC Q1–Q6

Ngày: 11/10/2026
Căn cứ: Báo cáo rà soát thiết kế LINH KHÍ ngày 11/10/2026
Trạng thái: Chủ dự án đã chốt phương án; cho phép triển khai trong phạm vi được nêu dưới đây.

I. Sáu quyết định đã được phê duyệt

Q1. Ngoại hình nhân vật theo trang bị — PHÊ DUYỆT

Quyết định: Khi người chơi trang bị áo của một bộ, nhân vật lập tức hiển thị thân sprite mặc sẵn của bộ đó, không cần đủ 3 món cùng bộ.

Giữ phương án kết hợp hiện tại:

* Áo: chọn thân sprite mặc sẵn theo bộ.
* Mũ, lưng, cánh, bùa và vũ khí: tiếp tục dùng các lớp sprite rời theo hệ thống điểm neo hiện có, trừ những lớp đã được vẽ sẵn trong thân bộ.
* Không chuyển sang phương án vẽ áo rời theo từng frame.
* Không tạo sprite riêng cho mọi tổ hợp trang bị.

Phạm vi được phép triển khai:

1. Điều chỉnh điều kiện chọn thân theo bộ để áo là điều kiện kích hoạt.
2. Điều chỉnh quy tắc ẩn/hiện các lớp trang bị đã có trong thân sprite.
3. Tích hợp các ảnh thân theo bộ khi asset tương ứng sẵn sàng.
4. Giữ cơ chế dự phòng về thân gốc khi thiếu asset.

Tiêu chí nghiệm thu:

* Mặc áo của bộ: thân đổi ngay, không cần mặc thêm mũ hoặc đồ lưng.
* Tháo áo: thân trở về đúng trạng thái theo trang bị còn lại.
* Mũ, lưng, cánh và bùa không bị mất, vẽ trùng hoặc hiển thị sai.
* Ngoại hình cập nhật tức thời; chỉ số, hitbox, sát thương và logic chiến đấu không đổi.
* Kiểm thử các trạng thái animation và hướng quay mà game hiện hỗ trợ.

Bảo vệ asset: Không tự tạo lại, ghi đè hoặc thay đổi các ảnh nhân vật đã được duyệt. Chỉ nhập asset mới vào quy trình hiện có.

Q2. Sàn và tường — PHÊ DUYỆT THỬ NGHIỆM CÓ THỂ QUAY LUI

Quyết định: Thử tile 16×16 pixel game tại vùng Rừng trước khi cân nhắc áp dụng cho các vùng khác.

Phạm vi được phép triển khai:

* Tạo tile sàn, tường và các biến thể cần thiết cho một vùng thử nghiệm.
* Bắt đầu với 3 biến thể sàn và tile điểm nhấn, dùng hạt giống để rải có kiểm soát.
* Giữ cửa và vật thể tương tác thành asset độc lập theo quy chuẩn hiện có.
* Có cờ cấu hình để tắt hệ thống tile và trở về nền vẽ bằng code.
* Chỉ điều chỉnh kích thước phòng ở mức cần thiết cho tile; phải kiểm tra toàn bộ tọa độ liên quan.

Tiêu chí nghiệm thu:

* Không có khe hở, đường nối lỗi hoặc tile sai vị trí.
* Năm phòng liên tiếp không tạo cảm giác lặp lại quá rõ.
* Cửa, tường, lối đi, vật thể tương tác và vùng sinh quái vẫn đúng.
* Không phát sinh suy giảm hiệu năng đáng kể; mục tiêu là giữ tối thiểu 50 FPS trên thiết bị tầm trung được dùng để kiểm thử.
* Có thể quay lại nền code bằng một thay đổi cấu hình, không cần khôi phục thủ công nhiều tệp.

Điều kiện: Chỉ triển khai thử tại Rừng. Chưa được tự động chuyển tất cả vùng sang tile.

Q3. Mở rộng sân đấu — PHÊ DUYỆT

Quyết định: Mở rộng chiều rộng sàn phòng thường từ khoảng 208 lên khoảng 300 pixel game.

Phạm vi được phép triển khai:

* Điều chỉnh hình học sàn và tường của phòng thường.
* Điều chỉnh vị trí cửa, vị trí sinh quái và các vùng liên quan.
* Điều chỉnh bố cục giao diện hoặc chữ chỉ dẫn nếu chúng xung đột với diện tích chơi mới.
* Giữ canvas 480×270, kích thước sprite nhân vật và cơ chế điều khiển hiện tại.
* Chưa triển khai camera mới hoặc phóng to sprite nhân vật.

Tiêu chí nghiệm thu:

* Trên màn hình thử 844×390, sàn chiếm ít nhất 60% bề ngang hiển thị theo cách đo của báo cáo.
* Không có nút điều khiển hoặc chữ quan trọng che khu vực chiến đấu.
* Quái không quá thưa; nhịp độ chiến đấu và độ khó ải đầu vẫn hợp lý.
* Cửa, lối đi, va chạm và vùng báo đòn vẫn chính xác.
* Không làm hỏng phòng trùm hoặc các bố cục phòng không thuộc phạm vi thay đổi.

Nếu kích thước 300 pixel gây vấn đề về bố cục hoặc nhịp độ chiến đấu, hãy báo cáo số đo và đề xuất điều chỉnh nhỏ hơn; không tự ý mở rộng phạm vi sang camera hoặc kiến trúc render.

Q4. Đăng nhập — PHÊ DUYỆT

Quyết định: Cho người chơi vào game bằng tài khoản ẩn danh ngay từ đầu; mời liên kết Google sau khi hoàn thành ải 1. Người đã có tài khoản vẫn cần một lựa chọn đăng nhập rõ ràng.

Phạm vi được phép triển khai:

* Bổ sung luồng “Chơi ngay”.
* Giữ lựa chọn “Đăng nhập Google” cho người có tài khoản.
* Thêm lời mời liên kết Google sau ải 1.
* Tận dụng Firebase Anonymous Auth và cơ chế liên kết tài khoản hiện có nếu phù hợp.
* Thêm thông báo và xử lý lỗi nếu liên kết tài khoản thất bại.

Tiêu chí nghiệm thu:

1. Người mới có thể chơi mà không cần đăng nhập Google.
2. Tiến trình của tài khoản ẩn danh được giữ khi liên kết Google thành công.
3. Người đã có tiến trình Google không bị chuyển nhầm sang tiến trình mới hoặc mất dữ liệu cũ.
4. Trường hợp liên kết thất bại không xóa hoặc ghi đè tiến trình.
5. Chế độ ?cloud=0 vẫn hoạt động đúng.
6. Bộ kiểm thử tests/cloud_save_regression vượt qua.
7. Dữ liệu lưu cục bộ cũ vẫn đọc được.

Điều kiện bảo vệ dữ liệu: Không tự viết lại cơ chế hợp nhất tiến trình nếu chưa cần thiết. Không ghi đè dữ liệu trên cloud hoặc local chỉ để làm luồng đăng nhập đơn giản hơn. Nếu gặp xung đột tài khoản hoặc hai bản tiến trình khác nhau, phải giữ nguyên dữ liệu và yêu cầu quyết định trước khi chọn bản thắng.

Q5. Dung lượng — PHÊ DUYỆT MỤC TIÊU CÓ ĐIỀU KIỆN

Quyết định: Mục tiêu dung lượng tối đa khoảng 20 MB cho gói game và tài nguyên theo cách đo đã thống nhất. Ưu tiên tải ban đầu nhẹ; tách ảnh tải sau nếu số đo cho thấy cần thiết.

Phạm vi được phép triển khai:

* Đo dung lượng bản build hiện tại, phần ảnh nhúng, dung lượng truyền sau gzip và thời gian tải.
* Thử phương án tách tài nguyên ảnh thành tệp riêng nếu cần.
* Thêm trạng thái tải và xử lý lỗi tải tài nguyên nếu việc tách ảnh được thực hiện.
* Không giảm chất lượng pixel art chỉ để đạt con số dung lượng.

Tiêu chí nghiệm thu:

* Báo cáo riêng dung lượng tệp build, dung lượng truyền sau gzip và thời gian tải thực tế.
* Kiểm thử trên mạng mô phỏng 4G ở 1,5 Mbps.
* Có phản hồi tải trong vòng 1 giây sau khi trang bắt đầu thực thi được.
* Không có màn hình đen hoặc trắng kéo dài mà không có thông báo.
* Khi tài nguyên ảnh thiếu hoặc lỗi tải, game xử lý dự phòng an toàn theo cơ chế hiện có.

Nguyên tắc lựa chọn:

* Nếu tiếp tục đóng gói thành một tệp duy nhất, dùng trần mục tiêu 15 MB.
* Nếu cần tiến tới 20 MB, phải tách ảnh tải sau một cách có kiểm soát và chứng minh hiệu quả bằng số đo.
* Không tách JavaScript thành nhiều phần chỉ vì mục tiêu dung lượng nếu lợi ích không rõ.

Trước khi thay đổi quy trình build hoặc cách phân phối tài nguyên, hãy lưu số đo bản hiện tại và báo cáo kế hoạch chuyển đổi.

Q6. Bảng màu — PHÊ DUYỆT

Quyết định: Xây dựng bảng màu gồm 32 màu lõi và 12 màu mở rộng cho ba hệ Lửa, Độc, Băng. Chỉ áp dụng cho các lô asset mới; không sửa hàng loạt asset cũ đã được duyệt.

Phạm vi được phép triển khai:

* Định nghĩa bảng màu và vai trò từng nhóm màu.
* Bổ sung bảng màu vào prompt và hướng dẫn sản xuất asset mới.
* Cho phép công cụ giảm màu theo bảng mới dưới dạng tùy chọn.
* Giữ nguyên cách xử lý mặc định đối với các lô asset cũ.
* Tạo một lô thử nhỏ gồm 2 vật thể môi trường để so sánh với quái và nhân vật hiện có.

Tiêu chí nghiệm thu:

* Bảng màu phân biệt được các cấp sáng tối, chất liệu và màu nhấn.
* Ba hệ Lửa, Độc, Băng có đặc trưng riêng nhưng vẫn cùng phong cách LINH KHÍ.
* Lô thử không bị bệt màu, mất đường viền hoặc mất chi tiết pixel art.
* Bảng màu và ảnh thử được chủ dự án duyệt trước khi áp dụng rộng rãi.
* Công cụ giảm màu không tự động thay đổi asset cũ hoặc làm biến đổi dữ liệu đã duyệt.

II. Quy định bảo vệ dữ liệu, code và asset

Các điều kiện sau áp dụng cho cả sáu hạng mục:

1. Giữ nguyên bản gốc: Không xóa hoặc ghi đè asset, file lưu, dữ liệu tài khoản, cấu hình build hay sprite đã duyệt mà không có phê duyệt riêng.
2. Thay đổi có thể hoàn tác: Mỗi đợt triển khai phải có bản diff rõ ràng và cách quay lui. Với tile, bắt buộc có cờ tắt.
3. Không sửa ngoài phạm vi: Không tái cấu trúc kiến trúc lớn, đổi schema dữ liệu, đổi định dạng .sprite.json, đổi quy chuẩn điểm neo hoặc thay đổi gameplay không liên quan.
4. Không sửa asset cũ hàng loạt: Bảng màu mới chỉ áp dụng cho lô mới. Các ảnh đã duyệt tiếp tục giữ nguyên.
5. Bảo vệ tiến trình: Không xóa, reset, thay thế hoặc ghi đè tiến trình local/cloud trong quá trình kiểm thử. Dùng tài khoản thử nghiệm và bản sao dữ liệu khi cần.
6. Giữ cơ chế dự phòng: Khi thiếu sprite hoặc tài nguyên tải thất bại, game phải dùng cơ chế dự phòng đã có thay vì bị crash.
7. Kiểm thử hồi quy: Sau mỗi đợt, kiểm tra gameplay, animation, điều khiển, lưu tiến trình, build và các tính năng không thuộc phạm vi sửa.
8. Không tự xuất bản: Không tự triển khai lên môi trường production hoặc thay đổi bản phát hành công khai nếu chưa được chủ dự án đồng ý.

III. Thứ tự triển khai

Đề nghị triển khai theo các đợt độc lập:

1. Q4 — Chơi ngay và đăng nhập sau; đồng thời bổ sung màn hình tải cơ bản.
2. Q3 — Mở rộng sân đấu và kiểm thử nhịp độ chiến đấu.
3. Q1 — Hoàn thiện quy tắc hiển thị ngoại hình theo áo và tích hợp asset khi sẵn sàng.
4. Q6 — Xây dựng bảng màu và duyệt lô thử.
5. Q2 — Làm tile thử vùng Rừng sau khi kích thước phòng và bảng màu đã ổn định.
6. Q5 — Đo dung lượng và quyết định tách ảnh tải sau dựa trên kết quả thực tế.

Các công việc độc lập có thể chuẩn bị song song, nhưng không được bỏ qua phụ thuộc hoặc tiêu chí nghiệm thu.

IV. Báo cáo bắt buộc sau mỗi đợt

Claude cần cung cấp:

* Danh sách file đã thay đổi.
* Tóm tắt thay đổi và lý do.
* Kết quả kiểm thử đạt/chưa đạt.
* Ảnh chụp trước và sau khi thay đổi nếu liên quan đến giao diện hoặc asset.
* Kết quả đo hiệu năng, dung lượng hoặc tiến trình khi liên quan.
* Rủi ro còn tồn tại.
* Cách quay lui.
* Những quyết định mới cần chủ dự án phê duyệt.

Không được tuyên bố hoàn thành nếu chưa thực hiện các kiểm tra tương ứng.

V. Chỉ thị thực hiện

Các quyết định Q1–Q6 ở trên đã được chủ dự án phê duyệt. Hãy cập nhật tài liệu kế hoạch thành trạng thái chính thức và triển khai từng đợt theo phạm vi cho phép.

Không tự mở rộng phạm vi, không thay đổi các quyết định đã chốt và không tự sửa asset cũ. Nếu phát hiện mâu thuẫn với kiến trúc hiện có, rủi ro mất dữ liệu hoặc cần thay đổi ngoài phạm vi, hãy dừng tại điểm đó, báo cáo bằng chứng và đề xuất lựa chọn để chủ dự án quyết định.

Mục tiêu là cải thiện LINH KHÍ từng bước, đo được kết quả, bảo vệ tiến trình người chơi và tránh phát sinh công việc làm lại không cần thiết.