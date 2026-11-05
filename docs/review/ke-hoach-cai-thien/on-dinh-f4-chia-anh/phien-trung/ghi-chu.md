# Phiên F4 chạy TRÙNG (05/11) — ghi chú, không đổi gì trong game

Lịch hẹn F4 chạy hai phiên cùng lúc. Phiên này làm xong bước A (vũ khí PixelLab mặc định) thì thấy phiên kia **đã đẩy bước A trước**
(commit `231a5689`). Hai bản làm giống nhau (ghép sẵn ô PixelLab, tấm ChatGPT cũ chỉ tải khi `?vkpl=0`), nên phiên này **bỏ bản của mình**,
không đẩy gì vào `game/**`, để không đè / xung đột với phiên kia đang làm bước chia trang.

Phiên này để lại (chỉ để tham khảo, **chưa chạy cổng kiểm, chưa đo**, không áp vào game):
- `chia-trang-dang-do.patch` — bản nháp chia trang ≤ 2048 (game/build.py `chia_trang`, js/sprite_custom.js "ảnh ảo" + bọc drawImage, js/zed_moi.js
  nhóm trang theo vũ khí, js/vien_vk.js thôi đòi zed-moi). Viết trên commit `81aa960d` (trước bước A); phần `?vkpl=0` trong patch trùng với `231a5689`.
- Kiểm chéo bước A của phiên này (trên bản của nó, cùng cách làm): so ảnh chụp 128 ô (4 vũ khí × 16 tổ hợp hình thái / hệ / gân × đứng, đánh) giữa
  bản ghép sẵn và bản cũ `?vkpl=1`: hình vũ khí và tay cầm trùng nhau; chỗ khác duy nhất là hạt hiệu ứng hệ (giọt độc, tia lửa) rơi ngẫu nhiên —
  mức khác này bằng đúng mức khác khi so hai lần chụp cùng một bản (đối chứng). Cổng kiểm ĐẠT trên bản đó (19,74 MB tải đầu).
