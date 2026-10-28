REVIEW TƯ VẤN 4 — ÂM ĐAO, PHÒNG A–C VÀ BỌ VỎ MỘC BẢN 5
Ngày 28/10/2026

Chốt: giữ bộ đất mới và Bọ bản 5 để tiếp tục thử. Âm Đao cần sửa vùng đánh lệch hình trước khi dùng để kết luận cân bằng; chưa nên tăng sức mạnh Dư Âm chỉ vì bot đánh chậm hơn.

Tôi đã đọc ghi chú ba phần, xem ảnh kiểm mép và lấy mẫu khung hình từ video. ZIP không có mã nguồn và log gốc đầy đủ, nên các số đo vẫn là kết quả Claude báo cáo, chưa được tôi chạy lại. Chưa kiểm trên iPhone.

1. ÂM ĐAO: TRẢ LỜI BA CÂU

Câu hỏi | Chốt đề xuất

Hộp gây sát thương ở nơi không có nét chém? | Sửa trước buổi thử chính. Thu phần hộp thừa rõ rệt; chỉ bổ sung VFX ở vùng thực sự thuộc đường quét.
Vệt chém lố ngoài hộp? | Chỉnh kích thước, vị trí và đường quét trước. Không giữ nguyên, cũng không mặc định cắt phẳng thành hình chữ nhật.
Dư Âm làm trận chậm hơn? | Giữ bản hiện tại làm mốc so, chưa buff hoặc cho miễn ngắt. Kiểm tra chi phí thao tác và tình huống dùng trước.

Không cần phủ sáng 100% diện tích hộp. Một cung chém có vùng bên trong tối vẫn hợp lý. Quan trọng là địch ở nơi nào bị trúng thì người chơi hiểu vì sao, không phải mỗi pixel hitbox đều sáng.

Ảnh kiểm cho thấy hai lỗi đáng sửa ngay:
- Nhát 2 đánh được sau lưng 36 px nhưng không có đường quét ở đó: thu phần sau lưng về sát thân theo tư thế thực tế.
- Chém hất có mép trước gây sát thương ngoài nét quét: thu mép thừa hoặc chỉnh cung hất, không kéo thêm một tia chỉ để chạm biên.

Pogo cần thận trọng hơn: thu rộng 64 xuống 30 có thể làm nảy khó đi rõ rệt. Giữ bản cũ để so, thử một hộp theo đường bổ xuống có dung sai nhỏ; chưa chốt bề rộng mới chỉ từ bản đồ VFX.

Với vệt chém lố, cho phép hạt hoặc ánh mờ trang trí vượt nhẹ, nhưng lõi sáng trông như lưỡi đánh phải nằm trong tầm thực. Cắt cứng toàn VFX theo hộp dễ tạo các mép vuông — ảnh vết Dư Âm phủ kín hình chữ nhật cũng cần kiểm tra bản sạch để tránh cảm giác “ô sát thương”.

2. DƯ ÂM: KẾT QUẢ BOT CHỈ RA VẤN ĐỀ THẬT, NHƯNG CHƯA CHỨNG MINH SKILL YẾU

Theo bảng, cấp 3 chậm hơn 59 tick ≈ 0,98 giây, cấp 4 chậm hơn 43 tick ≈ 0,72 giây trong cả lượt. Đây là tín hiệu về chi phí giữ nút và chọn thời điểm, không phải lý do tăng sát thương ngay.

Bot tự chọn dùng skill khi hết hồi, không né. Như vậy cùng một bot nhưng cấp cao đang thực hiện hành vi khác cấp thấp.

Cần ba lượt so:
1. Cấp 1 và cấp 3 đều chỉ đánh thường: xác nhận mở skill không làm yếu bộ đánh nền.
2. Cấp 3 dùng Dư Âm sau khi quái đánh hụt: kiểm tra phần thưởng của chọn thời cơ.
3. Cấp 3 đặt vết rồi lùi, quái bước vào: kiểm tra lợi ích an toàn, không chỉ tốc độ giết.

Đo thêm số lần trúng đòn và thời gian đứng nguy hiểm. Một skill cho phép gây sát thương khi Lam đã rút ra có thể đáng dùng dù không thắng về thời gian.

Chưa cho “không bị ngắt khi giữ”. Điều đó có thể biến chiến thuật tốt nhất thành đứng chịu đòn để tung skill. Nếu người chơi thật thấy giữ khó chịu, thử riêng 20 → 15–16 tick, giữ nguyên hồi và sát thương; không đổi ba biến cùng lúc.

3. PHÒNG A–C: ĐÚNG CHẤT HƠN RÕ RỆT, ĐỦ ÁP DỤNG KỸ THUẬT SANG D–F

Hạng mục | Nhận xét qua ảnh | Việc tiếp

Liền mép | Không thấy khe nền rõ trong các mẫu đã xem | Kiểm thêm lúc camera cuộn và ranh mảng nướng; ảnh tĩnh chưa xác nhận hết.
Sàn dài | Vân lớn tốt hơn bộ cũ; vẫn thấy nhịp vòm rễ | Sửa sau bằng biến thể mảng lớn, không phủ thêm nhiều chi tiết.
Bệ mỏng | Rêu bao quanh hơi giống một khối bụi cây | Bổ sung dải bệ mỏng ít rêu nếu dùng nhiều.
Trần C | Khối gỗ phía trên nặng và còn đường bao vuông | Giữ để thử gameplay; chưa cần trang trí kín.
Ván một chiều | Mặt đứng rõ, màu khác đất vừa đủ | Dùng được; giá đỡ hơi bẹt nhưng chưa đáng chặn.
Điểm lưu/hình nộm | Hợp môi trường mới hơn đồ cũ | Giữ.
Độ đọc trận | Lam, quái và dấu “!” nổi rõ | Chưa chứng minh quái màu trầm mới cũng nổi: cần đặt Bọ vào cùng cảnh.

Chưa cần gen thêm trước khi dựng D–F. Tận dụng bộ hiện có cho bản thử. Nếu gen tiếp, chỉ ưu tiên:
1. Bệ rễ mỏng, bụng ít rêu.
2. Góc lõm tô theo khuôn chính xác.
3. Một hoặc hai biến thể mặt sàn/vân lớn để phá lặp.

Lưu ý phòng B: cửa sổ sáng và ban công ngay sau vùng giữa sân vẫn hút mắt. Khi quái màu trầm được đưa vào, thử giảm sáng cửa sổ hoặc dời cụm nền một chút trước khi tăng viền quái.

HUD/nút mới nhẹ hơn, đúng hướng. Dòng hướng dẫn đầu màn còn dài; nên rút thành thông báo ngắn theo tình huống. Số vẽ nhanh hơn 2–3 lần trên Chromium là tín hiệu tốt, không phải kết luận hiệu năng Safari.

4. BỌ BẢN 5: DUYỆT ĐỂ ĐƯA VÀO P0-B

Các thay đổi hợp lý: bỏ chấm quay, mai giữ vỡ, xác nằm sau quái sống, đồ nhặt và dấu báo không bị che. Ảnh xác chồng với con sống vẫn đọc được dấu “!”.

Hai lưu ý cần ghi lại:
- Đây không hoàn toàn là đổi thang số: nhát 3 vào mai tăng từ 2/4 lên 30/40. Combo đầy đủ vẫn phá mai, nhưng chuỗi đòn khác sẽ mạnh hơn trước. Chấp nhận dùng số chung để thử, sửa câu “nhịp không đổi” cho chính xác.
- Bóng [10 × 0,25] làm tròn xuống thành 2, tức 20% ở nhát này, không phải mọi đòn đều đúng 25%. Giữ được, nhưng đừng cân bằng chỉ theo hệ số danh nghĩa.

Chưa cần sửa tiếp hoạt ảnh hoặc chống ngắt Bọ trước kết quả P0-B.

GỬI CLAUDE

Duyệt bộ đất A–C để dựng tiếp D–F bằng asset hiện có; duyệt Bọ bản 5 vào P0-B. Chưa cần gen thêm hoặc sửa lớn hoạt ảnh.

Âm Đao:
- Sửa vùng đánh lệch hình trước buổi thử chính.
- Thu phần hộp sau lưng nhát 2 và phần thừa chém hất theo đường quét thực.
- Pogo thử riêng, không giảm rộng 64→30 ngay.
- Không yêu cầu VFX phủ kín 100% hộp.
- Chỉnh lõi vệt chém khớp tầm; tránh cắt cứng thành mép chữ nhật.
- Kiểm vết Dư Âm bản sạch không trông như ô sáng vuông.

Dư Âm:
- Giữ cấu hình hiện tại làm mốc, chưa tăng sát thương/hồi chiêu hoặc thêm chống ngắt.
- So ba tình huống: chỉ đánh thường ở cấp 1/3; dùng sau đòn hụt; đặt bẫy rồi lùi.
- Đo cả thời gian giết, số lần bị đánh, lần giữ bị hủy và vết hụt.
- Nếu người thật thấy giữ ì, thử riêng ngưỡng 15–16 thay 20, các số khác giữ nguyên.

Môi trường:
- Chưa cần gen trước D–F.
- Kiểm ranh mảng đất khi camera cuộn.
- Thử Bọ màu trầm trong nền mới; nếu chìm, giảm tương phản nền trước khi tăng rim quái.
- Phá nhịp lặp sau; không phủ thêm chi tiết dày.

Bọ:
- Giữ bản 5.
- Ghi rõ nhát 3 phá mai đã đổi tỷ lệ 2/4→30/40, không chỉ nhân thang.
- Hệ số bóng 0,25 nhưng nhát 10 làm tròn còn 2; báo cả số thực.

P0-B tiếp tục theo phạm vi đã duyệt. Chưa ghép game chính; kết quả Chromium và thử iPhone báo riêng.
