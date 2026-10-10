# Báo cáo: áo trên thân AI và "Bộ trang phục" vẽ liền

Làm theo hướng **"Kết hợp"** anh đã chọn. Game đã lên https://spiritblade.web.app . Ảnh kiểm: [anh-kiem.png](anh-kiem.png).

## 1. Đã làm gì

### Áo không khoác rời lên thân AI nữa
- Em bé có thân ảnh AI **giữ áo riêng** của nhân vật. Áo/giáp trong kho không còn dán đè lên thân (trước đây dán lên bị lệch, không ôm).
- Muốn biết đang mặc áo bậc gì thì nhìn 2 chỗ:
  - **Viền màu quanh người**: Lam = xanh, Tím = tím, Vàng = vàng. (Trước chỉ có Tím và Vàng, nay thêm Lam.) Áo bậc Thường thì không có viền. Viền nằm sau lưng hình nên không che mặt.
  - **Một dấu nhỏ trên ngực** (3 × 3 chấm): bốn cánh là màu bậc áo, chấm giữa là màu hệ của áo (Lửa cam, Độc xanh lá, Băng xanh nhạt; áo không hệ thì trắng). Dấu tự đi theo ngực khi đứng, chạy, đánh; lúc lăn tròn hoặc nằm ngã thì tạm ẩn.
- **Mũ, đồ lưng, bùa, cánh, vũ khí** vẫn khoác như cũ.
- Em bé vẽ bằng code (chưa có thân AI) **không đổi gì**, vẫn mặc áo như trước.

### "Bộ trang phục" vẽ liền cả cử động
- Game có 3 bộ: **Bộ Rừng Già** (Độc), **Bộ Hang Biển** (Băng), **Bộ Lâu Đài** (Lửa).
- Giờ game nhận thêm loại tệp mới: hình em bé **đã mặc sẵn cả bộ**, vẽ đủ 7 cử động. Tên tệp: `em-be-<nhân vật>-<bộ>`, ví dụ `em-be-smith-rung` (Thợ Rèn mặc Bộ Rừng Già).
- Khi người chơi **mặc đủ bộ** (từ 3 món của cùng một bộ, đúng lúc game bật vầng sáng bộ) **và** đã có tệp của bộ đó cho em bé đang chơi → em bé đổi sang hình mới. Lúc đó game không dán rời mũ, áo, đồ lưng, bùa nữa (đã có trong hình), chỉ thêm **cánh và vũ khí**.
- **Chưa có tệp thì game y như cũ.** Hiện chưa có tệp nào, cần anh vẽ (xem mục 2).

### Công cụ
- Trang **Tách Anh Hùng** (https://spiritblade.web.app/tach-anh-hung.html): thêm nhóm **"Bộ trang phục"** gồm 12 mục (4 em bé × 3 bộ). Mỗi mục có nút "Sao chép prompt vẽ", phần xem thử như trong game, và tải tệp 2 bản như cũ.
- Trang **Ghép đồ**: thêm một dòng nhắc "áo không khoác lên thân AI, hiện bằng viền + dấu ngực".

## 2. Cách vẽ một bộ (anh làm trên iPhone)

1. Mở ChatGPT. **Gửi kèm ảnh tấm thân thường** của em bé (tấm lưới đã vẽ trước đây). Bước này bắt buộc, không thì ChatGPT vẽ ra em bé khác.
2. Dán prompt của đúng em bé + đúng bộ (lấy ở mục 3), gửi.
3. Lưu ảnh. Mở trang Tách Anh Hùng, chọn mục trong nhóm "Bộ trang phục", đưa ảnh vào, xem thử.
4. Bấm "Tải file .sprite.json", gửi tệp `.zip` cho Claude để đưa vào game.

Nên thử **1 bộ trước** (ví dụ Thợ Rèn · Bộ Rừng Già) xem có ưng không rồi mới vẽ 11 bộ còn lại.

## 3. 12 prompt ở đâu

- Tệp [PROMPT.md](PROMPT.md) ngay trong thư mục này (`docs/review/bo-trang-phuc/PROMPT.md`): đủ 12 prompt, mỗi prompt ghi rõ phải gửi kèm ảnh nào.
- Hoặc bấm nút "Sao chép prompt vẽ" trên trang Tách Anh Hùng (nội dung giống nhau).

## 4. Đã kiểm

- Kiểm lỗi gõ mọi tệp game, gói game, bài kiểm lưu mây: đều qua. Bản đăng tự động báo xanh.
- Mở game thật một lượt: 4 em bé thân AI mặc mũ + áo + đồ lưng + bùa + cánh ở đứng / chạy / đánh / lăn → áo không khoác, có viền + dấu ngực; lăn tròn thì dấu ẩn. Thử một thân bộ tạm (tô màu thân thường, không lưu vào game) với đủ bộ → em bé đổi thân, còn cánh và kiếm. Không có lỗi của game.
- **Chưa kiểm**: chưa chạy bộ kiểm dài; chưa có ảnh bộ thật do ChatGPT vẽ nên chưa biết ảnh thật khớp tới đâu.

## 5. Điều anh nên biết

- **Viền giờ theo bậc ÁO.** Đang mặc áo thì viền là màu bậc của áo (trước là bậc cao nhất trong các món đang mặc). Không mặc áo thì như cũ.
- **Mặc 3 món của bộ là đã đổi sang hình "đủ bộ"**, dù ô còn lại đang mặc món khác. Khi đó hình vẫn hiện trọn bộ, món lẻ kia không hiện (chỉ số vẫn tính đủ, không đổi). Nếu anh muốn phải đủ cả 4 món (mũ, áo, đồ lưng, bùa) mới đổi hình thì báo, sửa nhanh.
- Dấu ngực do game tự đo trên hình nên có khung hơi thấp xuống bụng 1–2 chấm (nhất là lúc chạy). Không bao giờ nằm trên mặt.
- Không đổi lối chơi, chỉ số, bản lưu. Không đụng đăng nhập Google và lưu mây.
