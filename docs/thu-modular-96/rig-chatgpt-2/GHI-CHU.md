# Bản ChatGPT sửa lần 3 — giáp ngực lồi ra trước

Nguồn: rig-code-2-fixed.zip (chủ dự án gửi). Chỉ lưu các file đổi so với rig/; trang kiem-tra-rig.html tự chứa ảnh, mở trực tiếp được.

Đã kiểm lại (Chromium headless, 9 động tác): không lỗi JS, hở khớp = 0.

- Sửa khớp cổ trong khop-chinh/chay.json: khung 2 x 53,4 → 49,2; khung 7 x 52,4 → 49,2.
- Góc thân cổ→hông làm mượt 50/25/25 (torsoAngles).
- Giáp ngực Gen được cắt theo bóng thân (drawChestClipped) và có cột đo "Giáp ngực ngoài thân" (ngưỡng đỏ 25%).
- Giáp thô ngoài thân: khung 2 30% → 14%, khung 7 31% → 15,5%. Chế độ 8 hướng khung 3, 6, 8, 12 vẫn > 25% trước khi cắt (lúc vẽ đã cắt nên không lộ).
- Còn lại: viền chụp khớp vẫn lấm tấm cam.

Cần đưa phần sửa cổ + làm mượt thân vào rig/ chính (đang có phiên R3/R4 sửa song song nên chưa gộp thẳng).
