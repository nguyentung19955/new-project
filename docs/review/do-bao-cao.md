# Báo cáo phiên "do": trang Tách Đồ

## Đã làm gì

- Trang mới **Tách Đồ**: https://spiritblade.web.app/tach-do.html (tệp `tools/tach-do/index.html`, một tệp tự chứa, cùng màu và cùng thanh menu với trang Quái).
- Dùng cho đồ đứng yên, làm theo **lô**: ChatGPT vẽ một tấm lưới nhiều món, trang tách ra từng món, mỗi món một tệp `<mã>.sprite.json` đúng định dạng game đang đọc (`game/js/sprite_custom.js`, ảnh nằm ở trường `anh`).
- 11 lô có sẵn:
  - Vũ khí: Kiếm, Cung, Giáo, Búa (mỗi lô 10 dòng, lưới 5 × 2). Mã `vk-<loại>-<dòng>`.
  - Trang phục: Mũ 13 (5 × 3), Áo 13 (5 × 3), Đồ đeo lưng 6 (3 × 2), Bùa và vật cầm tay 10 (5 × 2), Dấu mặt nạ 5 (5 × 1), Cánh 4 (2 × 2). Mã `tp-<ô>-<hình>`.
  - Vật phẩm: 14 món (7 × 2). Mã `vp-<loại>`.
- Tên, cỡ thật và màu từng món lấy từ `DAC-DIEM-HINH-GAME.md`; mô tả lấy từ `PROMPT-VE.md`.
- `game/build.py` **đã có sẵn** phần nhúng tệp vk-/tp-/vp-, không cần sửa. Đã thử: tạo 3 tệp mẫu (một kiếm, một mũ, một đồng vàng) bằng chính trang này, gói game, mở game: nạp đủ cả 3, không lỗi. Sau đó đã **xoá tệp mẫu**, game y hệt như trước.

## Cách dùng (trên điện thoại cũng được)

1. Mở https://spiritblade.web.app/tach-do.html, chọn lô (ví dụ "Vũ khí · Kiếm"), bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Lưu ảnh ChatGPT vẽ, bấm ô **Bấm để chọn ảnh** và chọn ảnh đó.
3. Nhìn ảnh có khung vàng đánh số: số khớp thứ tự trong danh sách ở bước 1. Có hình thừa (cột vẽ thêm, bảng phụ) thì **chạm vào khung đó để bỏ** (khung đỏ gạch chéo); chạm lại để lấy lại. Phần thừa lớn thì dùng ô "Cắt trên/dưới/trái/phải".
4. Ở bước 3, mỗi món là một ô nhỏ. Món nào ghi **THIẾU** là ảnh không có món đó (danh sách thiếu ghi rõ tên). Chạm một món để xem kỹ:
   - Vũ khí: hình thoi đỏ là chỗ tay cầm, chấm vàng là mũi; cung có thêm hai chấm xanh là hai đầu dây. Sai thì chọn điểm rồi chạm lên hình để đặt lại.
   - Trang phục: dùng các nút mũi tên để dời chỗ đặt trên em bé.
   - Nút **Lật ngang**, **Xoay 90°**, **Nhỏ hơn / To hơn**, **Đặt lại**, **Bỏ món này**.
   - Khung xem thử: em bé trong game vung vũ khí (hoặc mặc món đồ: đứng, đi, đánh), cạnh đó là vũ khí xoay tám hướng; vật phẩm hiện ở cỡ 7, 10, 18 và rơi trên sàn.
5. Bấm **Tải tất cả (.zip)** (hoặc "Tải file này" cho từng món), gửi tệp cho Claude để đưa vào `game/art/custom/`.

## Công cụ tự làm gì

- Tách nền màu trơn, xoá đường kẻ lưới, gọt viền lem, bỏ vụn nhỏ (chép cách làm của trang Quái).
- Có kẻ lưới thì tách theo ô; không có thì tự gộp từng món. Thừa hình thì lấy đủ số đầu và báo để bạn chạm bỏ hình thừa; thiếu thì xếp theo vị trí cột và báo tên món thiếu.
- Thu nhỏ đúng cỡ thật từng món (kiểu "Mịn" mặc định), giảm màu, thêm viền 1 điểm ảnh màu `#1b1118` (game đổi màu viền này theo bậc Lam/Tím/Vàng). Vật phẩm dùng viền tối cùng tông màu món; dấu mặt nạ không có viền. Vật phẩm xuất cỡ khoảng 18 điểm ảnh.
- Vũ khí cận chiến vẽ dựng đứng thì tự xoay nằm ngang. Tự đặt điểm cầm (14% từ trái, giữa cán), mũi (mép phải); cung: cầm ở 45% bề rộng, mũi bên phải, hai đầu dây là đỉnh và đáy cánh cung. Prompt cung dặn không vẽ dây, không vẽ tên.
- Trang phục: tự đặt `lech` như Xưởng Sprite (cánh gốc ở dưới bên phải), `kieu` = `cam` cho Búa rèn tí hon, còn lại `bua`; mũ có ô "Vẽ đè trước mặt", áo có ô "Tay áo cùng màu áo".
- Nền prompt: hồng tím, trừ lô có nhiều màu hồng/tím hơn màu xanh lá thì dùng xanh lá. Lô có màu trùng nền thì tắt sẵn "Lọc đốm màu nền".

## Hạn chế, việc còn lại

- Xem thử như thật cần mã game: trang tự nạp từ `xuong-sprite.html` cùng trang web. Nếu không nạp được (mạng yếu, mở tệp trên máy) thì xem bằng em bé vẽ đơn giản, chỗ đặt trang phục chỉ gần đúng.
- Dấu mặt nạ chỉ 4–11 điểm ảnh: ảnh AI thu nhỏ đến cỡ đó thường nhoè, nên xem kỹ, có khi phải vẽ tay.
- Chưa làm biến thể hệ (Lửa/Độc/Băng) và giai đoạn của vũ khí. Cách mở rộng: thêm lô mới cho từng hệ (prompt thêm "bản phát sáng lửa/độc/băng"), khi xuất thì mã thành `vk-<loại>-<dòng>-<hệ>-<giai đoạn>` và ghi `vu_khi.he`, `vu_khi.gd` (game đã tìm sẵn mã này trong `SC.timVuKhi`).
- Tải .zip cần mạng để lấy thư viện JSZip từ cdnjs; không có mạng thì tải từng món.
- Hướng cán/mũi của vũ khí nằm ngang không tự đoán được: nếu ChatGPT vẽ ngược thì bấm "Lật ngang" (cho một món) hoặc tích "Lật ngang cả lô".
- Đã thử bằng ảnh tự dựng (có và không có lưới kẻ), chưa thử với ảnh ChatGPT thật.
