# Hướng dẫn cắt ảnh AI vừa gen (Windows)

Ảnh gen theo `docs/PROMPT-CAN-GEN.txt` (tướng 4×3, boss 3×3, hiệu ứng…) cần cắt thành từng khung trước khi đưa vào game. Có hai cách, kết quả như nhau — chọn **một**.

## Cách 1 — không cần cài gì (khuyên dùng)

1. Tải 1 file `tools/cat-anh.html` về máy (bấm vào file trên GitHub → nút **Download raw file**).
2. Bấm đúp file đó: nó mở trong **Chrome** hoặc **Edge**.
3. Mở thư mục `D:\ảnh game`, chọn hết ảnh (Ctrl+A) rồi **kéo thả** vào ô giữa trang (hoặc bấm **Chọn thư mục…**).
4. Xem từng ảnh: viền **xanh** = tốt · **vàng** = xem lại (tên đoán, lưới lệch đã tự dò) · **đỏ** = lỗi (thiếu khung, 2 khung giống hệt, tên không nhận ra). Ảnh tên lạ: gõ mã vào ô bên cạnh tên (ví dụ `thaymo`, `trieuda`, `trung-kim`). Mỗi ảnh có khung chạy thử animation.
5. Bấm **Tải da-cat.zip**.

## Cách 2 — chạy bằng Python (cắt cả thư mục một lần)

1. Cài Python từ <https://www.python.org/downloads/> (nhớ tick **Add python.exe to PATH**).
2. Tải 2 file `tools/cat-anh.bat` và `tools/cat_anh.py` để **cùng một thư mục**.
3. Bấm đúp `cat-anh.bat`. Lần đầu nó tự cài thư viện (Pillow, numpy, scipy), rồi đọc `D:\ảnh game` và ghi ra:
   - `D:\ảnh game\da-cat\assets\…` — đúng cấu trúc thư mục `assets/` của game
   - `D:\ảnh game\da-cat\bao-cao.html` — mở để xem từng khung và ảnh lỗi
   - `D:\ảnh game\da-cat.zip` — file để gửi đi
   Ảnh ở thư mục khác: kéo thư mục đó thả lên file `cat-anh.bat`.

## Gửi kết quả để ghép vào game

- **Dễ nhất:** gửi file `da-cat.zip` cho Claude và nói "ghép ảnh này vào game". Claude chạy `python3 tools/cat_anh.py --ghep da-cat.zip`, tăng phiên bản, test và đẩy lên.
- **Tự làm (có repo trên máy):** chạy `python tools/cat_anh.py --ghep D:\ảnh game\da-cat.zip` trong thư mục repo — lệnh chép ảnh vào `assets/` và ghi số khung vào `PACK_FRAMES` (`js/render.js`). Chỉ chép tay thư mục `assets/` thì tướng mới vẫn hiện nhưng chưa chạy đủ khung animation.

## Tool nhận ảnh thế nào

- Theo **tên file** ghi sau "lưu tên:" trong `PROMPT-CAN-GEN.txt`. Tên lệch vẫn đoán được: `Thaymo (1).PNG`, `thaymo.png.png`, `thaymo_v2.png`, `Thầy Mo Lửa.png`, `dan_he.png`. Ảnh quái `enemy6`, icon kỹ năng `icon-<mã>.png`, Thần Khí `than-khi-<mã>.png` cũ cũng nhận.
- Ảnh AI trả về sai cỡ / lệch lề: tool dò lưới theo vùng có hình (bỏ nền hồng tím) rồi mới cắt, và báo "sai lưới → đã dò lưới".
- Cách cắt giống hệt `tools/cat-sheet.py` · `cat-fx.py` · `cat-icons.py` (xoá nền #FF00FF và viền hồng, mọi dáng chung đường chân, thu về cao 480 px / chân dung 240 px, PNG 256 màu). Kiểm chứng: `node tests/cat-anh/cat-anh.test.js`.
- Thêm tướng / quái / hiệu ứng mới vào game → chạy `node tools/build-cat-anh.js` để cập nhật danh sách tên trong hai file tool.
