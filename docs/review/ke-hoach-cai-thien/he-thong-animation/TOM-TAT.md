# Tóm tắt 1 trang: hệ thống animation nhân vật hiện nay (12/10/2026)

*Dành cho chủ dự án, không cần biết code. Bản đầy đủ cho lập trình viên: [BAO-CAO.md](BAO-CAO.md) và 7 phụ lục. Đọc trên mã commit `229e263`. Phiên này không sửa dòng code game nào.*

## Hệ thống đang chạy thế nào
- **Game chạy 60 nhịp mỗi giây.** Mỗi nhịp, game tính luật chơi trước (di chuyển, ra đòn, trúng đòn), rồi mới vẽ hình.
- **Hình không quyết định sát thương.** Khi bé vung kiếm, game chỉ đếm thời gian. Ví dụ kiếm: đòn dài 0,3 giây, tới khoảng giữa đòn thì trừ máu quái. Hình ảnh chỉ "nhìn đồng hồ" để chọn khung nào hiện. Đây là tin tốt: **có thể vẽ lại toàn bộ hình mà không làm đổi cách chơi**, miễn giữ nguyên các đồng hồ này.
- **Thân em bé là ảnh AI. Vũ khí thì không phải.** Ảnh 4 bé (Cu Tí, Cu Tèo, Cái Bống, Cu Lì), mỗi khung 48×48 điểm ảnh, không có vũ khí bên trong. Code tự gắn kiếm, giáo, búa, cung vào tay và xoay theo từng khung. Phần "gắn tay" này có nhiều bảng số riêng cho từng bé, khá mong manh.
- **Không có nhảy, rơi, tiếp đất, đi bộ, đỡ đòn.** Game nhìn từ trên xuống, nên những động tác này không tồn tại. Hiện có: đứng, chạy, lộn né, 4 kiểu đánh theo vũ khí, chưởng, trúng đòn, chết.
- **Quái và trùm** cũng là ảnh AI 6 hàng: đứng, đi, báo trước, đánh, trúng đòn, chết. Trùm có ảnh riêng cho pha 2 và pha 3. **Người làng** đang đứng yên một khung, theo quyết định của anh ngày 12/10.

## Những chỗ hình và đòn đang lệch nhau (đã đo)
1. **Búa:** quái mất máu khi búa còn giơ trên đầu, trước lúc hình nện xuống khoảng 0,08 giây.
2. **Chưởng:** hoạt ảnh bị cắt mất 2 khung đầu.
3. **Trùm vùng:** gần một nửa số chiêu gây trúng khi hình còn đang "báo trước" (Hồ Tinh vồ mồi trễ ~0,45 giây).
4. **Quái thường:** gây trúng ngay khung đánh đầu tiên, động tác đánh chưa xong đã chuyển hình. Một số quái tinh anh lặp động tác báo trước 2 lần; quái tự nổ biến mất không có cảnh chết.
5. **Kiếm:** mỗi nhát chỉ có 2 khung hình, nên trông giật. Khi vừa chạy vừa chém, thân vẫn chạy, chỉ thanh kiếm vung.
6. **Vũ khí:** có lúc rời khỏi tay (khi lộn, khi giáo quét vòng); búa và giáo có lúc giật góc đột ngột.
7. **Bấm nút:** cung, giáo, búa ra đòn khi **nhả** nút, không phải khi nhấn. Lúc chuyển phòng (1/3 giây), nút bấm bị nuốt mất.

## Khi làm lại animation, phải giữ nguyên
Nhịp 60 lần/giây; thời lượng đòn và lúc gây sát thương của từng vũ khí; tầm đánh; thời gian né và bất tử; hiệu ứng khựng hình khi chém trúng (nó làm chậm nhịp đánh thật khoảng 15%); vùng báo trước của quái và trùm; cách game vẽ thay bằng code khi ảnh chưa tải xong; trang bị, áo và vũ khí gắn theo nhân vật.

## Đề xuất hướng làm lại
- **Gom dữ liệu về một chỗ.** Mỗi động tác là một mục trong tệp ảnh, ghi rõ khung nào lúc nào, khung nào là lúc chạm, tay ở đâu và vũ khí nghiêng bao nhiêu ở từng khung. Hiện các thông tin này rải ở 6–7 chỗ trong code.
- **Đặt tên động tác thống nhất**, ví dụ `atk_sword_1`, `atk_sword_2`, `atk_hammer`, `run_atk_sword`.
- **Làm theo thứ tự:** viết bài đo tự động trước, sửa các chỗ lệch ở trên, rồi mới vẽ ảnh mới (nhiều khung hơn cho mỗi nhát chém, thêm hàng chạy-chém).

## Anh có thể gửi thêm (không bắt buộc)
- Ảnh gốc độ phân giải cao hoặc tệp vẽ của các bé.
- Câu lệnh tạo ảnh AI đang dùng.
- Thứ tự ưu tiên muốn làm lại: bé nào, vũ khí nào trước.
- Quyết định cho 4 bộ ảnh đòn còn thiếu (Cu Tèo bộ Rừng Già, Cái Bống 3 bộ) và 3 thân bộ cũ của Cái Bống.
- Video quay trên điện thoại ở những chỗ anh thấy giật.
