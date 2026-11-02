# Yêu cầu ảnh – MƯỢT MỨC 2 (thêm khung chuyển tiếp)
Nguồn: `docs/duyet-anim-02-11/tu-van-chatgpt.md` (ChatGPT duyệt 17 nhóm). Người dùng đã đồng ý làm mức 2 (02/11).

**Phân công:** phiên MƯỢT-2 (không có Chrome) ghi yêu cầu + ảnh tham chiếu → **phiên chính** (có ChatGPT) vẽ → lưu `art/muot-2/<tên>/moi-NN.png` (hoặc `thay-NN.png`) → đổi Trạng thái thành `XONG` + push → phiên MƯỢT-2 lắp vào game, kiểm, push.

**Cách vẽ (phiên chính):** mỗi yêu cầu 1 cuộc trò chuyện ChatGPT MỚI; gửi ảnh `NNN-<tên>-thamchieu.png` + prompt trong file. Ảnh tham chiếu = các khung có sẵn và ô viền đứt (khung cần vẽ), phóng ×3 nearest, nền #FF00FF; dấu "+" trong ô trống = neo chân. Tách nền magenta, thu ÷3 nearest về cỡ cửa sổ ghi trong file, dán vào ô gốc trong suốt đúng toạ độ.

**Luật cứng:** giữ nguyên 100% thiết kế Kiếm Khách và quái (màu, cỡ, chi tiết, khung gốc). Chỉ CHÈN khung mới hoặc THAY khung lỗi. Không vẽ bằng code, không nội suy pixel.

**Trạng thái:** CHỜ → ĐANG LÀM (phiên chính) → XONG (phiên chính) → ĐÃ LẮP (phiên MƯỢT-2). Ảnh không khớp → VẼ LẠI (kèm lý do).

| Số | Tên | Ưu tiên |
|---|---|---|
| 001 | kk-don4 – đòn 4, 2 khung giữa F4–F6 | P0 |
| 002 | kk-dapdat – đập đất, 1 khung F3–F4 | P0 |
| 003 | kk-chemkhong – chém xoay, 1 khung F2–F3 | P0 |
| 004 | kk-chet – chết, sửa F3 + 1 khung F3–F4 | P0 |
| 005 | kk-luot – lướt, 2 khung đứng dậy | P0 |
| 006 | kk-tiepdat – tiếp đất, 1 khung đứng dậy | P0 |
