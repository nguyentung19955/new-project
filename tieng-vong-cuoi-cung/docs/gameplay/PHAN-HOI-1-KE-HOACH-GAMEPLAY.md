Kế hoạch có phần phân tích tốt, nhưng tôi chưa duyệt triển khai nguyên bản. Nên sửa vài quyết định trước; đặc biệt là thao tác Vọng, sát thương bóng và phạm vi phòng thử.

Tôi đã đọc file và sơ đồ. Các kết luận về code dưới đây do Claude báo cáo; tôi chưa có mã nguồn để xác minh độc lập.

1. Duyệt sửa độ nhạy đòn trước, không cần chờ kế hoạch bốn vũ khí

Buffer combo, ngưỡng cần gạt và nhịp chuẩn bị là nền chung cho Âm Đao sau này. Có thể thử ngay trên trang riêng.

Nhưng tiêu chí “0 lần bấm bị mất” cần đổi thành: mọi lần bấm đều được nhận và được xử lý theo luật rõ ràng. Không phải mỗi lần chạm đều phải tạo thêm một nhát.

Hàng chờ chỉ chứa một nhát tiếp theo, phải xóa khi bị đánh, chết, đổi phòng hoặc hủy đòn. Đừng để người chơi bấm vài lần rồi Lam tiếp tục đánh ngoài ý muốn.

2. Không duyệt chạm đúp Vọng làm thao tác chính

Hai lần chạm trong 10 tick chỉ khoảng 167 ms. Đây là thao tác khó giữa trận, đồng thời trùng với “bắt đầu ghi → kết thúc ghi”.

Lý do “bản ghi ngắn không hữu ích” chưa đủ: kế hoạch cũng xác nhận bản ghi cực ngắn đang dùng được để giữ nút boss.

Cách thử tốt hơn: phòng thử có hai cấu hình chọn trước khi vào:
- Ghi chủ động: thao tác hiện tại.
- Vọng quá khứ: bấm một lần phát lại 1,5 giây vừa qua.
Chưa cần giải quyết hai kiểu dùng trên cùng một nút. Trước hết phải biết Vọng quá khứ có vui không.

Ngoài ra, đặt tên prototype là “Vọng Chiến”, giữ “Dư Âm” cho kỹ năng của Âm Đao để khỏi lẫn.

3. Chưa nên cho bóng gây 0 sát thương

Đây là thay đổi lớn so với hướng anh muốn: chiến đấu, mạnh lên và phối hợp bóng.

Theo kế hoạch:
- Quái nhỏ không có Thế.
- Bóng chỉ gây sát thương Thế.
- Vì vậy bóng đánh một mình vào quái nhỏ không có tác dụng.
Điều này dễ khiến người chơi thấy bóng yếu hoặc tưởng đòn lỗi. Nên thử bóng có sát thương phụ thấp nhưng nhìn thấy được, Cộng hưởng mới là phần thưởng lớn. Chưa chốt tỷ lệ trước khi thử.

Tách ba lựa chọn để so sánh, không thay đồng thời: sát thương bóng, khả năng phá Thế, sát thương Cộng hưởng.

4. “Cộng hưởng luôn phá Thế ngay” sẽ làm mất giá trị nâng vũ khí

Nếu tinh anh và boss đều vỡ Thế ngay khi Cộng hưởng:
- Chỉ số phá Thế của vũ khí ít còn ý nghĩa.
- Người chơi có thể chờ hết khóa 45 tick rồi phá tiếp.
- Kết hợp choáng 90–150 tick có nguy cơ khiến địch liên tục không được đánh.
Đề xuất:
- Quái có vỏ: Cộng hưởng phá vỏ nhanh, có thể ngay lập tức.
- Tinh anh/boss: gây lượng sát thương Thế lớn, chưa mặc định về 0.
- Trong lúc choáng không tích Thế cho lần phá tiếp.
- Sau hồi phục có thời gian ổn định ngắn trước khi có thể bị phá tiếp.
Đồng thời cần ghi rõ: ×2 là tổng sát thương hay sát thương cộng thêm? Không để mỗi nhát dùng lại dấu thời gian của nhát cũ để kích hoạt nhiều lần.

5. Phòng thử đang lớn hơn mục tiêu P0

Mẹ Nấm cao 330 px, ba loại đòn, Dơi mới, tài nguyên mới, hồi sinh quái, Âm Phù và lối tắt — thực tế là một bản demo nhỏ.

Nên chia:
Đợt	Nội dung
P0-A	Đòn nhạy, Chuông Gỗ, một quái gác có Thế
P0-B	Thêm Vọng Chiến, so sánh với ghi chủ động
P0-C	Thêm một tinh anh và một nâng cấp để thử tiến triển


Tinh anh đầu tiên có thể là Chuông Gỗ biến thể với hai đòn, chưa cần Mẹ Nấm đủ bộ kỹ năng.

Sơ đồ cũng cần kiểm tra lại hành lang C: cao 128 px nhưng báo cáo vùng ăn đòn Lam cao 120 px, chỉ dư 8 px. Chưa đủ thông tin về collider để kết luận mắc kẹt, nhưng không nên dùng trần thấp như cách chính buộc đánh quái. Cho khoảng trống đọc đòn và né; cổng sau quái đã đủ chặn đường.

6. Kế hoạch phải cập nhật theo bốn vũ khí đã chốt

File vẫn có Dao + Búa, đòn nặng đi cùng Búa, phần thưởng Búa và nâng cấp trùng vai trò Búa. Những phần này đã lỗi thời.

Không cần chờ làm xong mọi thiết kế vũ khí mới sửa buffer, nhưng phải chốt giao diện dữ liệu chung trước khi làm hệ thống Thế và sát thương.

Gửi Claude đoạn này:
Tôi đã đọc kế hoạch gameplay. Duyệt hướng phân tích, chưa duyệt triển khai toàn bộ.

Hãy cập nhật kế hoạch theo các chốt sau:

1. Bộ vũ khí chính là Âm Đao, Xích Chuông, Liềm Chuông, Trượng Vọng. Bỏ Búa/Chùy khỏi kế hoạch triển khai. Dao cũ chỉ là placeholder khi thử độ nhạy.

2. Có thể làm P0-A riêng ngay sau khi cập nhật kế hoạch:
- Buffer một nhát combo.
- Thử startup 7/7/9.
- Chỉnh ngưỡng cần hướng.
- Chuông Gỗ và một quái gác có Thế.
Chưa đổi game chính, chưa publish.
Đồng bộ animation/VFX với thời điểm hộp đòn.

3. Không dùng chạm đúp Vọng làm thao tác chính.
Prototype có hai cấu hình chọn trước khi vào phòng:
A: ghi chủ động như hiện tại.
B: bấm một lần phát lại 1,5 giây quá khứ.
Chưa ghép hai cách lên cùng một nút.
Gọi prototype B là Vọng Chiến; “Dư Âm” dành cho skill Âm Đao.

4. Chưa duyệt bóng gây 0 sát thương.
Quái nhỏ không có Thế sẽ không nhận tác dụng từ bóng, trái mục tiêu chiến đấu.
Đề xuất thử sát thương phụ thấp, có phản hồi rõ.
Đừng đồng thời đổi sát thương bóng, Cộng hưởng và tài nguyên rồi kết luận tính năng nào tốt.

5. Chưa duyệt Cộng hưởng tự động phá Thế mọi tinh anh/boss.
Tách luật vỏ cứng với Thế boss.
Boss/tinh anh nhận lượng phá Thế lớn, có bảo vệ khỏi chuỗi choáng.
Định nghĩa trạng thái choáng, hồi phục, hồi Thế và thời gian có thể phá tiếp.

6. Viết rõ công thức sát thương:
- Cộng hưởng ×2 là tổng hay cộng thêm?
- Mỗi cặp nhát nào được ghép?
- Một nhát có được dùng lại để ghép lần khác không?
- Xử lý trường hợp bóng trúng trước/Lam trúng trước.
- Hitstop, chí mạng và hiệu ứng vũ khí tương tác thế nào?

7. Chia phạm vi:
P0-A: độ nhạy + Chuông Gỗ + quái gác có Thế.
P0-B: Vọng Chiến và so sánh với ghi chủ động.
P0-C: tinh anh đơn giản + một nâng cấp.
Hoãn Dơi và Mẹ Nấm đủ ba đòn nếu không phục vụ câu hỏi đang kiểm chứng.

8. Kiểm tra hành lang 128 px với hurtbox/collider hiện tại.
Không ép chiến đấu bằng trần quá thấp.
Đánh giá vùng camera, khoảng né và khả năng thấy đầy đủ dấu báo.

9. Buffer không có nghĩa mỗi chạm đều sinh đòn.
Chỉ giữ một nhát chờ, định nghĩa thời hạn và xóa khi hủy đòn/bị đánh/chết/đổi phòng.
Log phân biệt: nhận input, xếp hàng, thay thế hoặc loại theo luật.

10. Chưa mặc định lưu checkpoint giữa hai pha boss.
Đó là lựa chọn độ khó cần thử riêng, không phải sửa lỗi bắt buộc.
Chưa sửa boss trong P0.

Gửi lại bản kế hoạch rút gọn và đối chiếu với kế hoạch bốn vũ khí, nêu rõ xung đột đã giải quyết. Không triển khai toàn bộ phòng thử trước khi chốt.

Ưu tiên lúc này: làm đánh thường ngon trước, rồi chứng minh bóng khiến chiến đấu hay hơn. Chưa cần một phòng lớn để kiểm tra hai điều đó.