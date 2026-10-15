# A — Độ khó & đường cong theo ải / cấp độ (đọc CHUNG.md trước)

1. Chiến dịch 15 ải × độ khó 1, 2 (và 3 nếu có): bot đi từ đầu như người chơi thật (`cay.py --node`), ghi: số lần chơi mỗi ải, Sức mạnh lúc qua ải, cấp nhân vật, thời gian chơi ước tính. So với `G.STAGE_REC` (Sức mạnh khuyên dùng) — ải nào kẹt (≥ 6 lần chơi) / quá dễ (thắng ngay khi Sức mạnh < khuyên dùng 10%).
2. Đường cong cấp độ: kinh nghiệm cần / nhận mỗi ải, cấp lúc vào mỗi vùng; có chỗ phải cày lặp không; chỉ số tăng theo cấp có đều không.
3. Riêng từng trùm vùng / trùm nhỏ / tinh anh: tỉ lệ thắng ở Sức mạnh khuyên dùng, máu mất theo chiêu (chiêu nào "chết người", chiêu nào vô hại), thời gian đánh. Thêm bot "đứng sát mép / góc" cho mỗi trùm (chủ dự án thấy Cua Đá đứng sát mép là thắng) — liệt kê trùm nào có chỗ đứng an toàn.
4. Đề xuất chỉnh `G.STAGE_REC`, máu/sát thương quái, kinh nghiệm, độ khó 2 ("làm khó hơn" đang chờ quyết trên trang việc) — số cụ thể.
