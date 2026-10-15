# Bìa game mới (màn hình chính) — bỏ Cu Tí đứng góc

Chủ game: "làm bìa game khác đi, gen hình ảnh khác không cho cu tý đứng đó nữa". Ảnh gốc 1672×941 (16:9) ở docs/anh-goc/bia/:
- bia-1-cay-da.png — cây đa + trống đồng sáng bên trái, sông, ba vùng phía xa (ẤM, chính).
- bia-2-dong-song.png — ba vùng + dòng sông, mảnh trống và bóng dưới nước (KỊCH TÍNH).
Hiện tại: game/js/village.js G.Title.draw() vẽ cảnh làng sống làm tối (VS.drawWorld dim 0.42) + Cu Tí phóng ×2 ở góc trái + titleVeil + titleLogo (gd-logo) + nút.

Làm:
1. Thay nền màn hình chính bằng ảnh bìa (mặc định mỗi lần mở chọn ngẫu nhiên 1 trong 2; cờ `?bia=1` / `?bia=2` để ép; `?biacu=1` = màn cũ).
   BỎ hình Cu Tí ở màn hình chính. Hiệu ứng nhẹ: Ken Burns rất chậm (như truyện), đom đóm / lá rơi / ánh nước lấp lánh vẽ nhẹ (tuỳ, không rối).
2. Logo + chữ phụ + nút: đặt lại cho dễ đọc trên ảnh (vùng trời tối phía trên giữa cho logo; dải tối mờ dưới cho nút), không che trống đồng
   ở bìa 1. Chữ trong khung dùng hàm chung T.chuTrongKhung (phiên chu-lech-khung). Kiểm VI + EN, màn ngang / 4:3 / dọc (game xoay).
3. Tải: ảnh bìa cần ngay lúc mở game → thu cỡ hợp lý (960×540 WebP chất lượng ~80, JPEG dự phòng), tải SỚM nhưng không chặn màn tải
   (khi chưa có ảnh thì vẽ cảnh làng như cũ rồi hiện dần ảnh). Ghi dung lượng tải đầu trước/sau (trần người chơi tải 20 MB; tải đầu càng nhẹ càng tốt).
   Có thể dùng chung công cụ tools/anh-truyen/dung.py (thêm danh sách bìa) và cách đóng gói ảnh truyện của build.py.
4. Màn tải HTML (#lk-tai trong game/index.html) có thể dùng bản ảnh bìa rất nhỏ mờ làm nền nếu không làm nặng (tuỳ, ghi rõ).
KHÔNG chơi thử game — chỉ node --check, build.py, ảnh soát tĩnh xem-bia.png (2 bìa × VI/EN × 3 cỡ màn, cả lúc mở Bảng vàng trên màn chính).
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0 (nút đăng nhập vẫn đúng chỗ, bấm được).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác — phiên pwa-bo-thanh-url có thể đang sửa cloud.js / index.html). Xong viết bao-cao.md, push, tự dừng.
