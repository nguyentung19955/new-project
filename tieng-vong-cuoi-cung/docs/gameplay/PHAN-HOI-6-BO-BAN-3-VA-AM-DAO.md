# Phản hồi 6 (28/10/2026, 0:50) – tạm duyệt hình Bọ bản 3, tiếp P0-A sửa → Âm Đao 1–4

Duyệt tạm phản hồi hình ảnh Bọ bản 3. Giữ asset hiện tại, chưa cần gen hoặc chỉnh VFX thêm.
- Đánh mai: tia nhỏ, sắc, không che con quái.
- Đánh bụng: hiệu ứng ấm tập trung vào điểm trúng, vẫn thấy thân và đường bao.
- Hai phản hồi đã khác nhau đủ để đưa vào thử người chơi.
(Chưa xác minh thời lượng chớp 3 khung, luật mai vỡ vĩnh viễn, trải nghiệm cảm ứng.)

Tiếp tục sửa P0-A rồi làm prototype Âm Đao cấp 1–4 theo thứ tự đã nêu. Không cần chờ duyệt lại giữa hai bước nếu phạm vi không đổi.

Trước khi chuyển bước, kiểm tra:
- Quái thường và Bọ không tự hồi vỏ sau khi vỡ.
- Bọ đứng dậy tiếp tục đánh được dù mai đã vỡ.
- Startup 7 tick vẫn có tư thế lấy đà rõ; hình/VFX khớp hộp đòn.
- Không phá buffer, mã đòn replay và công thức Cộng hưởng đã kiểm.

Bản Âm Đao cần có:
1. Cấp 1: đánh thường và âm nhận nối dài nhìn rõ.
2. Cấp 3: mở Dư Âm, đặt vết kể cả chém hụt.
3. Cấp 4: tăng sức mạnh vết.
4. Cùng phòng, cùng đối thủ để so sánh.
5. Video sạch không log để xem cảm giác, kèm video debug riêng để kiểm luật.

Chưa thêm quái, cấp 5–8, menu nâng cấp hoặc hệ thống mới.
Phần chưa thử trên iPhone phải ghi rõ, không đánh dấu đạt thay người chơi.

Ghi chú điều phối: chủ dự án (0:49) chê động tác Bọ quay đầu kiểu "lật trang sách" và chết lật ngửa trông buồn cười → đã chuẩn bị phiên sửa động tác (trig_014vUwyWeLqpyjxo7syebMBT), xếp SAU Âm Đao vì phản hồi 6 nói chưa sửa mỹ thuật Bọ lúc này.
