# Yêu cầu chủ dự án: tích hợp clip chạy rig-v3 vào game (26/10/2026, 23:10) – nguyên văn

Tôi chọn (a): giữ tốc độ gameplay 264px logic/giây, ghép thử clip rig-v3 hiện tại bằng cách phát theo quãng đường.

Giữ nguyên nhún, độ lắc đầu và chóp mũ rig-v3. Chưa làm clip sải dài, chưa giảm tốc game.

Yêu cầu tích hợp:
1. Lấy PNG và JSON cùng từ sprite/ trong ZIP. Kiểm kích thước ảnh thực đúng 2142×970 trước khi dùng. PNG gửi rời đã thành 2048×927 nên không dùng với JSON này.
2. Giữ một biến pha liên tục: pha += abs(dx_thuc_te) / 83.66; pha %= 1; frame = floor(pha*32). dx_thuc_te là dịch chuyển ngang sau xử lý va chạm. Không tính chuyển động camera; không để va tường vẫn đạp chân. Nếu dùng vận tốc px/giây thì phải nhân dt. Chỉ áp cho chạy trên đất; dash, nhảy và bị đẩy có trạng thái riêng.
3. Giữ điểm neo chân cố định, hiển thị 112px. Không thay collider, tốc độ, lực nhảy hoặc khoảng cách màn để phù hợp hình mới.
4. Ở 264px/s, chu kỳ khoảng 0,317s. Cho xem ngay trong màn chơi thật: chạy hai hướng, tăng/giảm tốc, dừng, va tường, nhảy và tiếp đất. Kiểm trên iPhone nếu có. Không reset pha mỗi khi vận tốc đổi.
5. Với Tiếng Vọng, bảo đảm bóng tái hiện đúng pha hoạt ảnh của Lam đã ghi; đừng tự tính lại pha theo va chạm khác.

Gửi bản game đã ghép để duyệt cảm giác chuyển động. Nếu nhịp 6,3 bước/giây quá líu chân, báo kèm video rồi mới làm clip chạy nhanh riêng theo phương án (c).
