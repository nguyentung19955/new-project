# Còn chỗ "vẽ tay" (vẽ bằng code) trong trận — rà và thay

Chủ game chơi trận trùm nhỏ Cua Đá (Hang biển) và thấy: "Vẫn thấy các hình vẽ tay nhỉ, do chưa gen ảnh".
Trong ảnh chụp có: thân Cua Đá nhạt trắng như bóng ma, các ô vuông xanh lục trên sàn, vết độc / vết băng xanh.

Đã biết:
- cuaDa.sprite.json và cuaDa-p2.sprite.json là ảnh AI thật. Hàng `hit` khung 3 (cả 2 pha) bị tô trắng gần hết thân
  → lúc trúng đòn trông như bóng ma. Kiểm thêm: code có chồng thêm lớp chớp trắng (flash) lên khung này không → nếu có thì trắng gấp đôi.
- Các ảnh hu-* trong chieu_trum.js / ky_nang_quai.js / boss.js đã đủ (không thiếu tệp).
- Vùng báo trước (bao_truoc.js) mặc định đã dùng ảnh 8 khung.

Việc cần làm:
1. Sửa khung trắng: thay khung 3 hàng hit (cuaDa, cuaDa-p2) bằng bản khung 2 pha trắng nhẹ (≈25%), không trắng toàn thân.
   Rà luôn mọi *.sprite.json của trùm / trùm nhỏ / tinh anh: khung nào trắng > 60% điểm ảnh thân thì xử lý như vậy.
   Nếu code đang chồng flash trắng lên quái có sprite AI thì giảm còn viền sáng nhẹ / đỏ nhẹ.
2. Rà TOÀN BỘ đường vẽ dự phòng bằng code (fillRect, arc, FX('burst'…), vẽ tạm "chỗ thiếu ảnh") đang THỰC SỰ hiện trong trận
   ở cả 3 vùng (Rừng già, Hang biển, Lâu đài): quái thường, tinh anh, trùm nhỏ, trùm vùng, vùng độc/băng/lửa trên sàn,
   đạn, mảnh văng, ô vuông xanh lục. Đọc code là chính: một nhánh chỉ "hiện thật" khi ảnh tương ứng không có / không được nạp.
   Lưu ý tìm nguồn của "ô vuông xanh lục" (có thể là hạt FX vuông, vùng độc, mảnh tinh thể…).
3. Chỗ nào đã có ảnh trong game/art/custom mà code không dùng → nối vào ảnh. Chỗ nào thật sự chưa có ảnh → KHÔNG tự vẽ;
   ghi vào bao-cao.md danh sách ảnh cần gen: tên tệp hu-*, kích thước, số khung, mô tả, và 1 prompt tiếng Anh ngắn cho mỗi ảnh
   (phong cách giống ảnh hiệu ứng hu-* sẵn có: pixel art, nền xanh lục #00FF00, 1 hàng N khung).
4. Ảnh soát tĩnh: xem-truoc-sau.png (khung hit cũ/mới của Cua Đá + vài chỗ đã nối ảnh).

Ràng buộc: KHÔNG TEST game (không chơi thử / không bot) — chỉ đọc code, node --check, build.py, ảnh soát tĩnh.
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md cùng thư mục, push, tự dừng.
