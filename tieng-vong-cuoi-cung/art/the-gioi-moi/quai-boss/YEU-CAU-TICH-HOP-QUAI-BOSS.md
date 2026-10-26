# Yêu cầu của chủ dự án (26/10/2026, 23:58) – nguyên văn

Tôi duyệt quái116px, boss330px và boss lơ lửng.
Giữ thiết kế, nhịp chuẩn bị đòn và cách chết hiện tại.

Chốt boss render trực tiếp từ mảnh + JSON.
Xuất gói runtime gồm đủ PNG mảnh, JSON và đường dẫn đúng.
Không tải toàn bộ sheet boss2x và không đợi đến lúc đánh
mới tải/decode asset.

Ghép quái và boss trước trên một bản game thử nền tạm,
không cần chờ Làng Chuông hoàn thiện.

Ưu tiên:
1. Boss đập theo trạng thái gameplay:
chuẩn bị → trên không → sự kiện tiếp đất → hồi.
Không dùng950ms cố định để quyết định lúc chạm.
Không cộng hai lần độ cao nhảy của game và animation.

2. Quét/đấm phải khớp cửa sổ sát thương hiện có.
Gameplay quyết định hitbox; animation thể hiện đúng thời điểm.
Kiểm đòn ở cả hai hướng, lúc Lam đứng sát và ở rìa tầm đánh.

3. Chuyển clip từ tư thế đang có, không giật về dáng nghỉ.
Boss trúng đòn không tự ngắt attack nếu game không có choáng.
Game quản lý nháy trắng; tắt nháy trùng trong clip.

4. Nếu pha2 có treo trần/kéo xuống, bổ sung trạng thái hình
tương ứng trước khi gọi trận boss là hoàn chỉnh.

5. Có thể nội suy các tư thế rig khi render.
Không nội suy tuyến tính cờ bật/tắt mảnh lúc chết.
Cache ảnh hiệu ứng, tránh xử lý pixel để nháy trắng mỗi frame.

Gửi video trận thử: Lam với3quái và một trận boss có đủ
hai pha, kèm overlay hitbox có thể bật/tắt.
Báo thời gian tải, số ảnh/kích thước giải mã và kết quả
iPhone thật nếu đã thử; chưa thử thì ghi rõ.
