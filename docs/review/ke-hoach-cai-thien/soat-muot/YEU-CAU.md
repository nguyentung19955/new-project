# Soát độ mượt hiệu ứng & animation — góc nhìn chuyên gia

Vai trò: bạn là người có 10 năm thiết kế game và 10 năm phát triển game (2D pixel action / roguelite). Chủ game muốn biết:
hiệu ứng và animation đã MƯỢT chưa, trông có mượt mà chưa; chỗ nào cải thiện được — đặc biệt chỗ nào cải thiện bằng cách GEN ẢNH (prompt).

Phạm vi rà (đọc code + xem chính ảnh sprite, KHÔNG sửa game/):
- Nhân vật Cu Tí (zed_moi.js, zed-*.sprite.json): đứng/đi/chạy/lộn/đánh từng vũ khí/trúng đòn/chết; nhịp khung, số khung, nối động tác, cầm vũ khí, hướng quay.
- 30 quái thường + tinh anh + trùm nhỏ + trùm vùng (game/art/custom/*.sprite.json, sprite_custom.js, mobs.js, boss.js): 6 động tác mỗi con,
  số khung, `giay`, khung nhảy cỡ / lệch neo / giật khi lặp, chuyển động tác (đứng→báo đòn→đánh), khung trắng, mờ dần khi chết.
- Hiệu ứng (fx*.js, hu-*.sprite.json, bao_truoc.js, chieu_trum.js, ky_nang_quai.js): số khung, thời lượng, easing, rung màn hình, hit-stop,
  chớp trúng đòn, hạt, vùng báo trước, đạn, nổ, chưởng, vệt chém.
- Cảm giác đánh (game feel): hit-stop, knockback, screen shake, âm thanh–hình khớp nhau, phản hồi khi trúng/bị trúng, độ trễ nút.
- Giao diện: chuyển màn, hiện bảng, nút bấm, thanh máu tụt (máu trễ), số sát thương, màn tải, truyện (Ken Burns).
- Hiệu năng ảnh hưởng độ mượt: số hình vẽ mỗi khung, đối tượng rác, khung hình rơi trên điện thoại yếu (đọc code, ước lượng).

Cách xem: dựng ảnh / GIF TĨNH từ sprite sheet (render offline bằng Python/Node, không mở game, không chơi thử) để nhìn nhịp từng động tác;
có thể dựng "băng hình mô phỏng" một chuỗi động tác bằng chính dữ liệu `dong_tac` + `giay`. Được chạy node để đo số liệu thuần (không chơi).

Viết docs/review/ke-hoach-cai-thien/soat-muot/bao-cao.md (tiếng Việt dễ hiểu, chủ game không rành kỹ thuật):
1. Đánh giá chung (thang điểm 1–10 từng mảng) + 5 điểm mạnh.
2. Danh sách vấn đề, xếp từ nặng nhất, mỗi mục: thấy ở đâu (ảnh/GIF minh hoạ trong thư mục này), vì sao trông không mượt, cách sửa,
   và PHÂN LOẠI: (A) sửa bằng code (nhịp, easing, nội suy, hit-stop...) · (B) cần GEN ẢNH mới/thêm khung · (C) cả hai.
3. Với mọi mục (B)/(C): prompt ngắn tiếng Anh (mỗi cái riêng), ảnh mẫu kèm (đường dẫn tệp trong repo), số khung, cỡ, gen cái nào trước.
   Theo quy cách đã dùng: nền #00FF00, 1 hàng N khung cách xa; quái theo 6 động tác (1-dung, 2-di, 3-bao-don, 4-danh, 5-trung-don 4 khung, 6-chet),
   có khung que ở docs/anh-goc/quai-moi/que/; ảnh mẫu phong cách quái heoCon-mau-moi.png.
4. Đề xuất việc code (A) gom thành 2–3 phiên, ước lượng công, cờ quay lui đề xuất.
5. Ảnh minh hoạ: xem-muot.png (tổng hợp) + vài GIF chỗ lỗi rõ nhất.
KHÔNG sửa game/, KHÔNG chơi thử game. Không đụng master, không force push, không PR, không chép apiKey.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại). Xong push, tự dừng.
