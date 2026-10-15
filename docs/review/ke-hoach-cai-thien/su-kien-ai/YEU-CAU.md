# Rà phần thưởng rương, lời nguyền, thương nhân + đề xuất sự kiện ngẫu nhiên trong ải

Chủ game: "Check lại phần thưởng của rương, lời nguyền, thương nhân trong game xem đã đa dạng chưa, có thể có các event nào để random từng ải không".
Phiên này CHỈ đọc code, đo bằng bot Node nếu cần, và ĐỀ XUẤT — không sửa game/.

1. Rà hiện trạng (đọc code: stage.js, mapgen.js, portal.js, do_roi.js, data.js, combat.js, upgrade.js, các tệp phòng rương / thương nhân / lời nguyền):
   - Rương: có những loại nào, rơi gì, tỉ lệ, theo vùng/độ khó; người chơi có thấy khác nhau giữa các lần không.
   - Lời nguyền: danh sách, tác dụng, đổi lại được gì, có lời nguyền nào gần như luôn chọn / không bao giờ chọn.
   - Thương nhân: bán gì, giá, có ngẫu nhiên không, có món nào vô dụng / quá lời.
   - Các phòng / sự kiện khác đang có (phòng hồi máu, bàn thờ, bẫy...). Đếm: một lượt ải người chơi gặp bao nhiêu thứ "bất ngờ".
   - Đo bằng bot (nếu cần): 50–100 lượt mỗi vùng, thống kê người chơi thật sự nhận được gì; chỗ nào lặp lại nhàm.
2. Đánh giá độ đa dạng (thang 1–10 từng mục) theo góc nhìn thiết kế roguelite cho trẻ con: đủ bất ngờ, lựa chọn có ý nghĩa, không phạt quá nặng.
3. Đề xuất:
   - Thêm phần thưởng rương / lời nguyền / món thương nhân mới (danh sách cụ thể, có số), bỏ / sửa món thừa.
   - **15–25 sự kiện ngẫu nhiên trong ải**, mang màu dân gian Việt (vd: ông Bụt hiện ra cho chọn, bà cụ bán nước, đám ma trơi dẫn đường đến kho báu,
     thằng Cuội đánh đố, giếng ước, cây khế ăn quả trả vàng, phiên chợ quỷ, nhà hoang có hũ vàng có bẫy...). Mỗi sự kiện: xảy ra thế nào, lựa chọn,
     thưởng/phạt có số, vùng nào, tần suất, có cần ảnh mới không.
   - Luật chọn sự kiện mỗi ải (bao nhiêu sự kiện / lượt, không lặp liền, theo vùng, theo độ khó 2).
   - Ảnh cần gen: danh sách + prompt ngắn tiếng Anh từng cái (nền #00FF00 cho vật/NPC; phong cách như NPC và đồ trang trí hiện có), ghi ảnh mẫu kèm (đường dẫn trong repo).
   - Chia việc code thành các phiên (2–3 phiên song song), ảnh hưởng kinh tế/cân bằng và cách bot đo lại.
   - Câu hỏi cần chủ game quyết (ngắn, có đề xuất).
Viết docs/review/ke-hoach-cai-thien/su-kien-ai/bao-cao.md, tiếng Việt dễ hiểu (chủ game không rành kỹ thuật), phần kỹ thuật để cuối.
KHÔNG sửa game/, KHÔNG chơi thử bằng trình duyệt. Không đụng master, không force push, không PR, không chép apiKey.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại). Xong push, tự dừng.
