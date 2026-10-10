# Báo cáo phiên "anh-hung"

## Đã làm gì

1. **Trang công cụ mới: Tách Sprite Anh Hùng · Người Làng**
   https://spiritblade.web.app/tach-anh-hung.html (tệp `tools/tach-anh-hung/index.html`)
   - 4 anh hùng: Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật → tệp `em-be-<tên>.sprite.json`.
     Lưới 8 cột × 7 hàng: đứng (6), chạy (6), lấy đà (4), đánh (6), trúng đòn (4), chết (8), né lăn (6).
   - 7 người làng: Chú Lái Đò, Ông Thợ Rèn, Bà Hàng Xén, Cô Thợ May, Cụ Đồ, Ông Từ, Anh Mõ → tệp `nl-<tên>.sprite.json`.
     Lưới 8 cột × 2 hàng: đứng thở (6), nói chuyện vẫy tay (6).
   - Mỗi nhân vật có nút **Sao chép prompt vẽ** (tiếng Việt, dán thẳng vào ChatGPT).
     Prompt anh hùng xin **thân trơn**: không mũ, không áo choàng, không đồ sau lưng, không đồ cầm tay, không mặt nạ, không cánh, không vũ khí.
     Người làng thì vẽ đủ quần áo. Nền hồng tím, riêng Cô Thợ May (áo dài hồng) nền xanh lá.
   - Xử lý ảnh chép từ trang Quái: tách nền, xoá lưới, tự tìm hình, bỏ hình nhỏ lạc, lặp khung nếu thiếu ít, thu nhỏ "Mịn", 32 màu, viền ngoài, chạm để bỏ khung, tự kiểm.
   - Mọi khung dùng **chung một tỉ lệ** (lấy theo hàng đứng thở) để thân AI cao đúng như em bé trong game (29 điểm ảnh); chân đặt giữa ô, đúng chỗ.
   - **Thử khoác đồ**: trang nạp ngầm game thật, cho xem thân AI mặc thử các bộ đồ (nón lá, mũ sừng, cánh lửa…), cầm thử vũ khí, đứng cạnh em bé gốc để so. Có mũi tên dời **đầu** và **thân** từng điểm ảnh, nút **Tự khớp**, và chỉnh riêng từng động tác nếu cần.
   - Dùng tốt trên iPhone: nút to, không cuộn ngang, ảnh vừa màn hình.

2. **Sửa game: đồ khoác lên thân AI** (`game/js/hero_tinhlinh.js`, `game/js/sprite_custom.js`, `game/build.py`)
   - Trước đây có thân AI thì mũ, áo, đồ lưng, bùa, dấu mặt nạ, cánh biến mất. Nay game vẽ: đồ sau lưng (đồ lưng, cánh) → thân AI → đồ phía trước (áo, mũ, dấu mặt, bùa, đồ cầm, dây đeo). Đồ đổi theo đồ đang mặc, kể cả đồ ảnh AI (tp-…) của phiên khác.
   - Tệp em bé có thể ghi `"neo"` (dời chỗ đặt đồ cho khớp) và `"khoac_do": false` (không khoác đồ).
   - Vẫn giữ: nhuộm khi trúng đòn/băng/độc, bóng, ánh viền bậc (đồ cũng có ánh viền).
   - **Không có tệp em bé AI thì game y hệt cũ.** Đã thử bằng trình duyệt.

## Cách dùng (từng bước)

1. Mở https://spiritblade.web.app/tach-anh-hung.html, chọn nhân vật.
2. Bấm **Sao chép prompt vẽ**, dán vào ChatGPT, chờ ảnh, lưu ảnh về máy (iPhone: giữ ngón tay lên ảnh → Lưu vào Ảnh).
3. Quay lại trang, bấm **Bấm để chọn ảnh**, chọn ảnh vừa lưu.
4. Xem khung vàng trên ảnh: khung nào sai (chỉ có bụi, vệt chém) thì chạm để bỏ.
5. Ở bước 3: bấm các nút động tác để xem cử động. Với anh hùng, xem phần **Thử khoác đồ**: mũ phải nằm trên đầu, áo trên thân; lệch thì bấm mũi tên.
6. Thấy chữ **ĐẠT** thì bấm **Tải …sprite.json** và gửi file cho Claude để đưa vào `game/art/custom/`.

## Hạn chế, việc còn lại

- Vũ khí và bàn tay nắm vũ khí vẫn đặt theo khung xương của em bé gốc, nên khi đánh, tay AI có thể không trùng chỗ cầm vũ khí. Đồ cũng xoay theo khung xương gốc (lúc lộn, lúc ngã) nên có lúc lệch với hình AI; chỉnh riêng từng động tác bằng ô "Chỉ chỉnh cho động tác đang xem".
- Bộ khởi đầu (mũ trùm + áo trùm) che gần hết thân, nên mặc bộ này thì thân AI gần như không lộ ra. Đây là đúng theo lựa chọn "Thân AI + đồ AI riêng".
- Tay áo và găng tay vẽ bằng code bị tắt khi có thân AI (vì tay là của hình AI).
- Phần thử khoác đồ chỉ chạy trên trang đã đăng (hoặc mở qua máy chủ web), mở tệp trực tiếp trên máy thì chỉ xem cử động thường.
- Da em bé trong prompt là tím nhạt tinh linh như em bé hiện tại; nếu muốn màu khác thì sửa prompt.
- Chưa có tệp ảnh AI thật nào cho anh hùng và người làng: chờ người dùng vẽ rồi gửi.
