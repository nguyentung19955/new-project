# Câu hỏi soạn sẵn cho ChatGPT – "Sức mạnh hiện lên người Kiếm Khách"

> **ĐÃ GỬI 02/11 (phiên chính, có Chrome) – trả lời ở tu-van-chatgpt.txt cùng thư mục.**

Lần chạy 02/11 của phiên LÀM **không có Chrome** (chạy trên mây theo lịch) nên chưa hỏi được ChatGPT. Phiên gen ảnh cặp (sucmanh, có Chrome) làm giúp theo yêu cầu `docs/yeu-cau-anh/sucmanh/001-tu-van-thiet-ke.md`:
mở 1 chat ChatGPT mới, gửi kèm ảnh tham chiếu (chụp scale 1): `art/kiem-khach/dung/f00.png`, `art/kiem-khach/chay/f03.png`, `art/kiem-khach/don1/f04.png`, `art/kiem-khach/don4/f05.png`, rồi dán NGUYÊN VĂN khung dưới.
Lưu câu trả lời nguyên văn vào **docs/suc-manh/tu-van-chatgpt.txt**.

```
Bạn là cố vấn art direction + game design cho game metroidvania pixel 2D u tối "Tiếng Vọng Cuối Cùng" (hang rễ, chuông đồng, mặt nạ; chơi trên iPhone xoay ngang). Nhân vật chính "Kiếm Khách" (ảnh đính kèm): tóc bạc, mặt nạ trắng, áo tối, song kiếm ánh xanh băng. Sprite 256×256/khung (thân thật ~40×75 điểm ảnh), chân ở điểm (128,172), vẽ quay PHẢI, game tự lật khi quay trái. Clip ưu tiên: đứng 4 khung, chạy 8, nhảy 4, combo đòn don1 8 / don2 8 / don4 9 (+ rơi 1, tiếp đất 3, lướt 6, trúng đòn 6). Mọi hình trong game phải do AI vẽ (bạn hoặc PixelLab), KHÔNG được vẽ bằng code; ánh sáng/bóng tối/bụi hạt nhỏ thì được. Thiết kế gốc Kiếm Khách phải giữ nguyên 100% (không đổi màu, cỡ, chi tiết gốc) – chỉ được THÊM lớp.

Hệ thống đồ đã có (phiên khác): Âm Điểm → cấp → mở nút cây Dây Ngân; Âm Phù (bị động, 4 độ hiếm); 3 cấp kiếm Sơ Âm / Vang Âm / Cộng Hưởng (đã có vệt kiếm khác nhau theo cấp). Việc của tôi: làm người chơi NHÌN THẤY nhân vật mạnh lên.

Tôi đã làm sẵn khung kỹ thuật: lớp phủ PNG cùng cỡ 256×256 cho từng khung animation (vẽ trước hoặc sau thân), hoặc 1 ảnh nhỏ gắn vào điểm neo đo cho từng khung; lớp tự ẩn ở clip chưa có ảnh. Bản nháp của tôi:
- Cấp 0 "Tro Lặng" = gốc. Cấp 1 "Tiếng Nứt" (sau trùm Vùng 1): 1 vết nứt sáng nhẹ trên mặt nạ. Cấp 2 "Vang Âm": nứt rõ hơn + ấn chuông nhỏ khắc trên giáp ngực. Cấp 3 "Cộng Hưởng": nứt nửa mặt nạ + dải vải ngân bay sau lưng.
- Trang bị gắn được: chuông nhỏ đeo hông (theo Âm Phù), có thể mảnh giáp vai.

Hãy trả lời CHI TIẾT, đánh số:
1. Các tầng tiến hoá hình ảnh nên có (bao nhiêu tầng, mỗi tầng thay đổi gì, gắn với mốc nào trong game 9 vùng). Sửa bản nháp của tôi nếu chưa hay.
2. Ở cỡ thân ~40×75 điểm ảnh, thay đổi nào ĐỌC ĐƯỢC trên màn iPhone, thay đổi nào quá nhỏ nên bỏ? Bao nhiêu điểm ảnh tối thiểu cho mỗi chi tiết.
3. Mỗi lớp nên làm bằng: (a) lớp phủ từng khung, (b) 1 hình gắn theo điểm neo, hay (c) vẽ lại biến thể toàn thân? Vì sao. Lớp nào cần chuyển động riêng (vải bay, chuông lắc)?
4. Cách giữ nhận diện Kiếm Khách gốc khi thêm lớp (bảng màu, silhouette, chỗ không được che: mắt mặt nạ, tóc, kiếm…).
5. Chi phí vẽ: số khung TỐI THIỂU cho mỗi lớp ở mỗi clip; clip nào có thể dùng chung khung/ẩn lớp mà người chơi không nhận ra.
6. Cách vẽ nhất quán giữa các khung: bạn vẽ cả sheet? vẽ 1 lần rồi tôi dùng công cụ dời theo vị trí mặt nạ/ngực từng khung? hay dùng PixelLab? Viết sẵn prompt vẽ ngắn cho lớp ưu tiên nhất.
7. Hào quang / vệt kiếm đổi màu theo cấp: nên làm không, làm bằng ánh sáng (được phép) hay ảnh vẽ.
8. Chỉ số sức mạnh đi kèm mỗi tầng (máu, sát thương…) có nên gắn với hình ảnh không, hay tách hẳn cho hệ thống đồ lo.
9. Tham khảo game pixel nổi tiếng làm tốt việc "nhìn thấy nhân vật mạnh lên" (Blasphemous, Dead Cells, Hollow Knight, Terraria, Katana ZERO, Owlboy, Celeste, Prince of Persia: The Lost Crown…) – họ làm cụ thể thế nào, nên học gì.
10. Thứ tự ưu tiên vẽ (lớp nào làm trước để người chơi thấy rõ nhất với ít khung nhất).

Viết toàn bộ câu trả lời vào 1 file .txt để tôi tải VÀ in luôn nội dung trong khung chat.
```
