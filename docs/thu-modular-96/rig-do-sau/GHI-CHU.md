# rig-do-sau — ghi chú

Thư mục này KHỞI ĐẦU từ bản copy rig-chatgpt/ (commit d7ea810c), sau đó viết lại để có nhãn back/front theo vùng,
quy tắc đổi lớp theo khung và phép đo khe đúng vùng khớp. Xem BAO-CAO.md. Ghi chú gốc của bản ChatGPT giữ bên dưới để đối chiếu.

---

# Bản rig do ChatGPT sửa (chủ game gửi 16/10 11:10)

Lưu nguyên bản ChatGPT trả về (dựa trên rig bản 7191fd99, TRƯỚC phiên R1/R3) để so. Không trộn vào rig/.

Đã kiểm lại bằng Chromium headless (RIG_TEST.reports()):
- Máy vẽ: bám 12/12, hở liền 28→0, hở 8 hướng 30→0, rung 8, méo 2.
- Gen: bám 12/12, hở liền 21→0, hở 8 hướng 26→0, rung 11 (nhảy 8 hướng 9/12), méo 0.
- Không lỗi JS, không lỗi tải ảnh.

Đã làm: tách mỗi ảnh giáp thành *-back / *-front (tach-pass-giap.py), vẽ 2 lượt (backAfter/frontAfter); kẹp giãn 0,85–1,15 + nối dài mép 2 px; chụp khớp to (lõi 5×5 đặc); giữ chế độ 8 hướng.
Lưu ý: tiêu chí "bám" bị nới (đầu mảnh không có chụp khớp thì không kiểm); chụp khớp to nên lộ nhiều chấm đồng; chưa có nhiều động tác (bản này chỉ hàng chạy).
