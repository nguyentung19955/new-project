# Yêu cầu của chủ dự án (26/10/2026, 23:53) – nguyên văn

Chốt phương án(c): làm clip chạy nhanh riêng cho264px logic/s.
Không giảm tốc gameplay và không thay collider/lực nhảy.

1. Giữ rig-v3 và clip cũ làm đối chứng.
Làm clip mới với chu kỳ khởi đầu0,50s, hai bước/chu kỳ,
tương ứng quãng đường132px logic ở tốc độ264.
Điều chỉnh tư thế đạp/thu/bay cho sải dài hơn; không chỉ
nhân tọa độ ngang của boot. Giữ tỷ lệ Lam112px và boot.

2. Phát theo quãng đường thực sau va chạm.
Đứng sát tường không đạp chân. Không reset pha khi đổi tốc.
Tiếng Vọng ghi/phát lại cả clip và pha tương ứng.

3. Gửi so sánh trong cùng màn game, cùng tốc độ264:
clip cũ phát nhanh và clip mới. Có bản112px và video60fps.
Kiểm cả chạy trái/phải, dừng, tăng tốc, nhảy và tiếp đất.
Chưa gọi clip mới là hoàn thiện trước khi xem chuyển động.

4. Boss: không nạp động tác lần đầu ngay khi cần đánh.
Ưu tiên thử render từ mảnh; hoặc preload + decode bộ động
tác trước khi vào đấu trường. Báo kích thước ảnh giải mã,
số ảnh giữ đồng thời và kết quả đo trên thiết bị thật nếu có.
Không chọn phương án chỉ dựa vào dung lượng ZIP/PNG.

5. Sau bản chạy nhanh, ưu tiên hoạt ảnh chém Lam.
Đòn đánh phải có chuẩn bị, vung, trúng và thu tay;
thời điểm hitbox khớp hình. Sau đó làm trúng đòn, nhảy/rơi.
Nền Làng Chuông tiếp tục làm song song.

Giữ bản demo hiện tại để đối chiếu. Chưa đổi thêm độ lắc
đầu/chóp hoặc thiết kế nhân vật trong lượt này.

## Bổ sung (26/10/2026, 23:57) – nguyên văn
Nhớ các động tác nên cod thêm hieự ứng nhé, dash cũng cần hiệu ứng, đứng trượt trên tường cũng cần, và quan trọng là hình ảnh nên bám vào game play nữa
