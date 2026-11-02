# Câu hỏi lên kế hoạch gửi ChatGPT (phiên cottruyen)

> **Trạng thái: ĐÃ GỬI 02/11 (phiên chính) – trả lời ở ke-hoach-chatgpt.txt.** Lần chạy 02/11 chạy trên máy chủ đám mây, không có Claude in Chrome nên không mở được ChatGPT.
> Lần chạy sau (có Chrome) dán nguyên khối dưới vào ChatGPT, lưu NGUYÊN VĂN trả lời vào `docs/cot-truyen/ke-hoach-chatgpt.txt`,
> rồi làm theo: viết hội thoại vào `game/cot-truyen/hoi-thoai/*.json`, điều kiện mở vùng vào `game/cot-truyen/tram-dich-chuyen.json`,
> thêm yêu cầu ảnh (cảnh làng, nhân vật phụ, cổng teleport, ảnh cutscene) vào `docs/yeu-cau-anh/cottruyen/`.
> Gửi kèm ảnh tham chiếu: art/kiem-khach-thiet-ke/master-v1-xem-x6.png và 1 ảnh phòng Vùng 1 (tools/vung-1/xem/choi-P01.png).

---

Bạn là nhà thiết kế cốt truyện + level cho game "Tiếng Vọng Cuối Cùng": metroidvania 2D pixel u tối (hang rễ, chuông đồng, mặt nạ), chơi trên iPhone xoay ngang, màn 960×540, nhân vật chính là Kiếm Khách (ảnh đính kèm, câm, không thoại). Thế giới là Cây Chuông Vĩnh Hằng; "Sự Lặng" từ đáy vực làm âm thanh tắt và ký ức tan. Làng Chuông là làng trung tâm giữa thân cây (an toàn, cửa hàng, thợ rèn). 8 vùng: Đỉnh Sấm, Tán Gió, Tổ Sắt, Thư Viện Vang (trên làng); Xưởng Đồng Bỏ Hoang, Rễ Mục (= Vùng 1 đã chơi được, trùm Mẹ Nấm/Màn Tang), Hồ Ngầm Phản Chiếu, Vực Lặng (dưới làng). Nhân vật phụ: Bà Ngân (người giữ chuông già, hát dở bài ru), Tích Tắc (cú máy bán bản đồ, phản bội hồi 2 rồi chuộc lỗi), Thợ Rèn Hòn (người đá câm, nói bằng nhịp búa), Kha (đối thủ có năng lực vọng, đua 4 lần), Người Gác Lặng (phản diện, vệt xám trong nền). 3 hồi: (1) chuông làng nứt, đi thu 3 Âm Gốc; (2) những bản sao, Tích Tắc phản bội, vùng cũ đổi trạng thái; (3) Vực Lặng, twist: nhân vật chính là một tiếng vọng của người giữ chuông thật. 3 kết thúc; kết thật cần 48 Mảnh Ký Ức + lời ru của Bà Ngân.
Luật hình: mọi hình/hiệu ứng/giao diện phải là ảnh bạn (ChatGPT) vẽ, không vẽ bằng code; chưa có ảnh thì tính năng tắt.

Hãy lên KẾ HOẠCH CHI TIẾT, có thể làm ngay:
1. Cấu trúc truyện theo hồi, gắn với thứ tự mở vùng: vùng nào mở sau khi đạt điều kiện gì (dùng dạng: hạ trùm vùng X / có cờ truyện Y / hồi ≥ N). Thứ tự gợi ý cho bản hiện tại chỉ có Vùng 1.
2. Đoạn MỞ ĐẦU (cutscene): bao nhiêu tấm ảnh tĩnh/hoạt cảnh pixel, nội dung từng tấm, chữ chạy kèm (tiếng Việt, ngắn), thời lượng; nhân vật chính câm nên kể bằng hình + lời Bà Ngân.
3. Hội thoại nhân vật phụ ở làng cho lần đầu và sau khi hạ trùm Vùng 1 (viết sẵn câu thoại tiếng Việt, mỗi câu ≤ 90 ký tự), có lựa chọn nếu cần. Hộp thoại có chân dung: chân dung nào, mấy biểu cảm, có khung "nói" không.
4. Nhịp kể chuyện trong mỗi vùng: bia đá, ký ức, Mảnh Ký Ức (bao nhiêu mỗi vùng, nội dung ngắn cho Vùng 1).
5. Bố cục Làng Chuông (màn ngang mấy màn hình, cao mấy tầng; vị trí Bà Ngân, Thợ Rèn, Tích Tắc, Chuông Lưu, cổng teleport) và CỔNG TELEPORT: là vật thể tự nhiên/chuông (không phải cửa phẳng) – hình dạng, cách chọn vùng, hoạt cảnh kích hoạt + hiệu ứng dịch chuyển (số khung, ms). Cách quay về làng từ vùng (qua Chuông Lưu hay vật phẩm?).
6. Danh sách ẢNH cần vẽ, theo thứ tự ưu tiên: tên, mô tả, số khung + ms, cỡ ô, hướng gốc, điểm neo.
Viết toàn bộ câu trả lời vào 1 file .txt để tải về VÀ in luôn nội dung trong khung chat.
