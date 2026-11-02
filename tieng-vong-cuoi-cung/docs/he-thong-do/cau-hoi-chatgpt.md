# Câu hỏi gửi ChatGPT – Hệ thống đồ / animation mở khoá / vòng lặp cày (phiên "do")

> **ĐÃ GỬI 02/11 (phiên chính, có Chrome) – trả lời ở tu-van-chatgpt.txt cùng thư mục.**

> Lần chạy 02/11 KHÔNG có Chrome (phiên chạy trên mây theo lịch, không nối máy người dùng) nên CHƯA hỏi được ChatGPT.
> Phiên sau có Chrome (hoặc phiên gen ảnh cặp "do" – xem docs/yeu-cau-anh/do/000-tu-van-thiet-ke.md): dán nguyên văn khung dưới vào ChatGPT,
> lưu câu trả lời nguyên văn vào docs/he-thong-do/tu-van-chatgpt.txt, rồi sửa game/he-thong/du-lieu.json + thiet-ke.md theo đúng tư vấn.

```
Bạn là nhà thiết kế game kỳ cựu (metroidvania + ARPG loot). Hãy tư vấn TOÀN BỘ, viết hết câu trả lời vào 1 file .txt để tải về VÀ in luôn nội dung trong khung chat.

GAME: "Tiếng Vọng Cuối Cùng" – metroidvania pixel 2D u tối (hang rễ, chuông đồng, mặt nạ), chơi iPhone xoay ngang. Nhân vật Kiếm Khách (sprite 256px, combo đất 3 nhát don1→don2→don4, chém trên không, đập đất, lướt, nhảy đôi, bám dây). Cơ chế riêng: "Tiếng Vọng" ghi 3 giây chuyển động thành bóng lặp lại. 9 vùng, Vùng 1 (~30–45 phút, 12 phòng, 1 trùm, 2 tinh anh) đã chơi được.
Tiền tệ theo GDD: Mảnh Âm (rơi từ quái, mất 30% khi chết – nhặt lại túi), Đồng Cổ (trùm/bí mật, rèn chuông), Mảnh Ký Ức (48 mảnh, +1 ô Dây Ngân mỗi 6). Âm Phù = bị động cắm vào Dây Ngân (3→10 ô, mỗi Âm Phù 1–4 ô). Endgame: Âm Phù có độ hiếm Thường/Hiếm/Huyền Thoại/Vọng Cổ, 1–3 dòng phụ ngẫu nhiên, "tôi luyện" lại 1 dòng ở Thợ Rèn Hòn.
Kiếm có sẵn 3 cấp dữ liệu: Sơ Âm (sát thương 10) / Vang Âm (13) / Cộng Hưởng (16), cùng hình.

BẢN NHÁP CỦA TÔI (hãy sửa thẳng tay):
- Âm Điểm: quái thường 4, tinh anh 40, trùm 150, bí mật 25. Mốc cấp: 0,40,100,180,280,400,540,700,880,1080,1300,1550. Mỗi cấp +1 "Nốt Ngân".
- Cây "Dây Ngân" 3 nhánh: Lưỡi (Rèn Vang Âm 1 Nốt, Rèn Cộng Hưởng 2, Nhát Thứ Năm 2 – thêm đòn kết thứ 5 có hoạt cảnh riêng, Vệt Ngân Sáng 1 – đổi vệt kiếm); Vọng (+15% Mảnh Âm, +20% Âm Điểm); Thân (+8 khung bất tử sau trúng đòn, Dáng đứng "Thức Tỉnh" mới – chỉ đổi hình).
- Âm Phù: chỉ tinh anh/trùm/rương rơi (quái thường không rơi để khỏi rác). Tỉ lệ hiếm 70/24/5/1 (Vọng Cổ chỉ sau khi hạ trùm). Dòng phụ: +3–8% sát thương, +5–15% Mảnh Âm, +5–12% Âm Điểm, hồi máu nhanh 5–12%, +4–10 khung bất tử.
- Mở khoá hình ảnh nhìn thấy được ở pixel art: nhát combo 5, vệt kiếm đẹp hơn, đòn kết hoạt cảnh riêng, dáng đứng/chạy mới.

HỎI:
1. Vòng lặp cày 3 tầng (ngắn 30s–2ph / trung 30–90ph / dài nhiều tuần) cho game này: mỗi tầng người chơi làm gì, nhận gì, cảm giác gì. Làm sao để cày KHÔNG phá nhịp metroidvania (khám phá, kỹ năng di chuyển mở đường)?
2. Cân bằng: sửa các con số Âm Điểm/mốc cấp/giá Nốt/tỉ lệ rơi của tôi cho Vùng 1 và cả 9 vùng (bảng). Có nên giới hạn cấp theo vùng không?
3. Cái gì mở ở mốc nào (bảng mốc: cấp/trùm/vùng → mở gì). Animation/chiêu mới nào nên mở trước, nên là thưởng cây kỹ năng hay thưởng trùm/nhiệm vụ?
4. Những thay đổi hình ảnh NHỎ nhưng thấy rõ ở pixel art (sprite 256px hiển thị ~85%): liệt kê 8–12 ý, mỗi ý ghi số khung cần vẽ, nên vẽ bằng ChatGPT hay PixelLab, cách giữ đúng 100% thiết kế Kiếm Khách.
5. Đồ có độ hiếm + dòng phụ: số dòng, khoảng giá trị, có nên có Âm Phù "định hình build" (đổi cách chơi) ngay từ Vùng 1 không? "Tôi luyện" giá bao nhiêu? Làm sao "không có đồ rác"?
6. Giao diện túi đồ / cây kỹ năng trên iPhone ngang (844×390): bố cục, cỡ nút, cần ChatGPT vẽ những mảnh giao diện nào (khung, ô, biểu tượng độ hiếm, nút) – liệt kê kích thước từng mảnh.
7. Game tham khảo cụ thể (Hollow Knight charm, Dead Cells, Blasphemous, Ender Lilies, Diablo, Path of Exile…): học gì, tránh gì.
8. Ưu tiên làm: 5 việc đầu tiên nên làm để người chơi Vùng 1 thấy muốn cày.
```
