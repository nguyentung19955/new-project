# Yêu cầu của chủ dự án sau khi xem v4 (26/10/2026)

Bản v4 còn co cứng và tay chân đọc thành các mảnh ghép.
Tạm dừng tối ưu chỉ số khớp kín/IoU và chưa tăng số khung.

Ưu tiên mới: dáng nguyên người và đường bao liên tục.

1. Giữ nguyên thiết kế, tỷ lệ và kích thước Lam.
Tạo bốn tư thế nguyên người để duyệt:
chạm đất, chịu lực, đạp, bay.
Xem cả bản màu và silhouette đen ở 112 px.

2. Kiểm lại chay_nhap.py:
DX_SHIFT chân xa=-32 và LIFT_SCALE chân xa=0.7 đang tạo
chênh lệch lớn giữa hai chân. Không mặc nhiên giữ các số này.
Dựng hai chân từ cùng logic bước chạy, lệch nửa chu kỳ;
chỉ giữ khác biệt phối cảnh khi chứng minh được bằng hình.

3. Tay cầm dao không được giữ một góc khuỷu gần như cố định
suốt chu kỳ. Thiết kế nhịp tay trước/sau rõ nhưng vừa phải.
Dao không che mất vùng hông và hướng chân.

4. Sửa hình khớp khuỷu và gối theo các tư thế đã duyệt:
- Đường bao ngoài liên tục.
- Không nắp tròn nhô, không đường đen chia ngang tay áo.
- Nếp gấp phía trong ngắn, có chủ đích.
- Màu và bóng ăn nhau như cùng một bộ quần áo.
- Giữ ranh giới vật liệu tại găng và boot.

5. Được phép dùng attachment duỗi/gập riêng.
Không ép một bộ mảnh cứng giải quyết mọi góc bằng cách
tăng nắp tròn hoặc chồng mảnh sâu hơn.

Gửi bốn tư thế để duyệt trước khi làm lại GIF.
Chỉ sau khi dáng đẹp mới ráp chu kỳ và dùng IK để giữ
chân chịu lực. Không dùng IK để quyết định toàn bộ dáng chạy.
