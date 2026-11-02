# Câu hỏi gửi ChatGPT – Vật phẩm ẩn + Nhiệm vụ ẩn (phiên "an")

> **ĐÃ GỬI 02/11 (phiên chính, có Chrome) – trả lời ở tu-van-chatgpt.txt cùng thư mục.**

> Lần chạy 02/11 KHÔNG có Chrome (phiên chạy trên mây theo lịch, không nối máy người dùng) nên CHƯA hỏi được ChatGPT.
> Phiên sau có Chrome (hoặc phiên gen ảnh cặp "an" – xem docs/yeu-cau-anh/an/001-tu-van-thiet-ke.md): dán NGUYÊN VĂN khung dưới vào 1 cuộc trò chuyện ChatGPT mới,
> lưu câu trả lời nguyên văn vào **docs/an/tu-van-chatgpt.txt**, rồi sửa game/an/du-lieu.json + docs/an/thiet-ke.md theo đúng tư vấn.

```
Bạn là nhà thiết kế level/bí mật kỳ cựu cho metroidvania. Hãy tư vấn TOÀN BỘ, viết hết câu trả lời vào 1 file .txt để tải về VÀ in luôn nội dung trong khung chat (để tôi đọc được).

GAME: "Tiếng Vọng Cuối Cùng" – metroidvania pixel 2D u tối (Cây Chuông Vĩnh Hằng: hang rễ, chuông đồng, mặt nạ; kẻ thù "Sự Lặng" xoá âm thanh và ký ức), chơi iPhone xoay ngang. Nhân vật Kiếm Khách: combo 3 nhát, chém trên không, đập đất, lướt, nhảy đôi, bật tường, bám dây. Cơ chế riêng "Tiếng Vọng" (ghi 3 giây chuyển động thành bóng lặp lại). 9 vùng; mỗi vùng theo GDD có ≥6 lối tắt, 3 phòng bí mật (tường giả), 1 thử thách platforming lấy Mảnh Ký Ức, 1 nhân vật phụ có nhiệm vụ riêng. 48 Mảnh Ký Ức → kết thật. Tiền: Mảnh Âm, Đồng Cổ (trùm/bí mật), Âm Phù (bị động, có độ hiếm).
VÙNG 1 "Ruột Cây Than Khóc" (đã chơi được, 9 phòng, ~30–45 phút): P01 Cửa Rễ (hướng dẫn) → P02 Ngã Ba Mối (tường nứt cột 13 → lối tắt xuống P06; hốc treo có Thẻ Tên) → P03 Xưởng Chuông (tường nứt → hốc H1: Thẻ Tên + Mảnh Âm; Chuông Vỡ 1 trên giàn treo) → P04 Hành Lang Tro (giếng hẹp phía đông cần bật tường/nhảy đôi → +1 máu tối đa; Thẻ Tên) → P05 Chuông Lưu → P06 Hố Vỏ (tường giả góc tây-dưới → Mảnh Âm; Chuông Vỡ 2) → P09 Miệng Kèn (đáy giếng Chuông Vỡ 3; Thẻ Tên) → P11 Sảnh Chuông Vỡ (tinh anh Vọng Tàn, Chuông Lưu 2) → P12 Đàn Chuông Câm (trùm). Hiện có 4 "Thẻ Tên" nhặt được nhưng CHƯA có ý nghĩa gì. Đã có tường nứt (chém 3 lần vỡ), tường giả (đi xuyên).
LUẬT HÌNH: mọi hình/hiệu ứng/giao diện do ChatGPT vẽ (PixelLab cho animation), không vẽ bằng code. Chữ thông báo HTML đơn giản thì đang dùng.

BẢN NHÁP CỦA TÔI (sửa thẳng tay):
- Vùng 1 có 6 bí mật: (1) tường nứt P02 → lối tắt; (2) hốc H1 sau tường nứt P03; (3) tường giả P06; (4) giếng bật tường P04 → +1 máu; (5) hốc treo P02 nhìn thấy từ dưới; (6) [MỚI] "Chuông Câm dưới tro" – đứng im 3 giây cạnh quả chuông vùi tro ở P04 thì nghe tiếng ngân → lộ Mảnh Ký Ức.
- 4 nhiệm vụ ẩn Vùng 1: (a) "Những Cái Tên Bị Quên" – nhặt đủ 4 Thẻ Tên → đoạn truyện bí mật + Mảnh Ký Ức; (b) "Lặng Như Tro" – hạ trùm không trúng đòn → thành tựu + Âm Phù hiếm; (c) "Về Cửa Rễ" – sau khi hạ trùm quay lại P01 → gặp bóng tiếng vọng của trùm, 1 câu thoại; (d) "Ba Tiếng Ngân" – đánh 3 quả chuông trang trí theo thứ tự thấp–trung–cao ở P03 → mở ngách có Đồng Cổ.
- Dấu hiệu: vệt sáng xanh tiếng vọng (#CEF0D6) lấp ló, vết nứt hình xoắn, rễ đổi màu, tiếng chuông nhỏ khi đứng gần (rung tay cầm/ rung màn nhẹ).
- Thưởng: Mảnh Ký Ức, Đồng Cổ, Âm Phù, thành tựu, đoạn truyện; nhật ký nhiệm vụ ẩn chỉ hiện dòng khi đã phát hiện ("???" cho phần chưa biết).
- Thông báo "Đã tìm thấy bí mật (x/6)" + đếm bí mật mỗi vùng trên bản đồ sau khi hạ trùm vùng đó.

HỎI:
1. Triết lý đặt bí mật (học Hollow Knight, Blasphemous, Ori, Ender Lilies, Celeste): nhịp đặt (bao nhiêu phút/1 bí mật), tỉ lệ dễ/vừa/khó, số bí mật + nhiệm vụ ẩn MỖI VÙNG cho 9 vùng (bảng). Khi nào thưởng "thật" (sức mạnh) và khi nào chỉ thưởng truyện/thành tựu?
2. Sửa danh sách 6 bí mật + 4 nhiệm vụ ẩn Vùng 1 của tôi: giữ/bỏ/đổi, thêm ý hay hơn. Với mỗi cái: vị trí, điều kiện kích hoạt, dấu hiệu tinh tế (người chơi để ý được nhưng không chỉ thẳng), phần thưởng, độ khó (1–5).
3. Câu đố âm thanh/chuông trên iPhone (người chơi có thể tắt tiếng): làm sao vẫn chơi được không cần âm thanh (dấu hiệu hình ảnh kèm theo)?
4. Nhiệm vụ ẩn kích hoạt bằng hành động lạ: liệt kê 12 ý cho cả game (đánh chuông theo thứ tự, quay lại phòng cũ khi có kỹ năng mới, nói chuyện nhiều lần với nhân vật phụ, mang vật A tới B, thắng trùm không trúng đòn, đứng im, dùng Tiếng Vọng ở chỗ đặc biệt…) – mỗi ý ghi vùng nên đặt + thưởng.
5. Phần thưởng hấp dẫn: những chiêu/animation mới, trang phục/lớp trang bị nào nên là thưởng bí mật (giữ nguyên 100% thiết kế Kiếm Khách, chỉ thêm biến thể được duyệt)? Đồ hiếm nào? Bao nhiêu Đồng Cổ/Mảnh Âm cho đáng?
6. Nhật ký nhiệm vụ ẩn + thông báo "Đã tìm thấy bí mật" + thành tựu trên iPhone ngang (844×390): bố cục, cỡ chữ/nút; cần ChatGPT vẽ những mảnh hình nào (khung nhật ký, biểu tượng thành tựu, hiệu ứng phát hiện, dấu hiệu bí mật trong phòng, vật phẩm ẩn) – liệt kê từng mảnh + kích thước px + số khung animation.
7. Đoạn truyện bí mật cho "Những Cái Tên Bị Quên" (4 Thẻ Tên ở Vùng 1): viết 4 dòng khắc trên thẻ + 1 đoạn truyện khi đủ 4 (ngắn, u buồn, hợp thế giới chuông–ký ức). Liên hệ cốt truyện chính thế nào?
8. Chống kẹt: những lỗi thiết kế bí mật hay gặp (kẹt sau tường giả, mất vật phẩm vĩnh viễn, nhiệm vụ lỡ không làm lại được) và cách tránh.
9. Ưu tiên: 5 việc đầu tiên nên làm cho Vùng 1 để người chơi thấy "muốn đi tìm".
```
