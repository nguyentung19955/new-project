# Báo cáo: 7 trang tách ảnh tự nhận ô có nền khác màu

Ngày 11/10/2026. Chỉ sửa 7 trang công cụ `tools/tach-*/index.html`, không đụng mã game.

## Lỗi gặp phải

ChatGPT vẽ lô 13 mũ (lưới 5 × 3, nền hồng tím) nhưng có 2 ô nền khác màu: ô 5 nền hồng nhạt, ô 13 nền trắng ngà.
Các trang cũ coi cả tấm ảnh chỉ có một màu nền, nên hai ô đó tách sai (mũ dính cả mảng nền của ô), và việc dò lưới, đếm món có thể lệch.

## Đã sửa gì

Ở cả 7 trang (Quái, Anh hùng, Đồ, Giao diện, Làng, Phòng, Hiệu ứng):

1. Trang xem màu ở 4 góc bên trong của từng ô (lùi vào hơn độ dày nét kẻ + 8 điểm, giống bản sửa nét kẻ dày sáng 11/10).
   Ô nào có màu góc khác màu nền chung quá 60 thì trang coi ô đó có **nền riêng** và tách hình trong ô bằng màu nền của chính ô đó.
2. Nét kẻ quanh ô nền lạ vẫn được dò ra như mọi ô khác, nên số ô và thứ tự hình không bị lệch.
3. Khi gặp, phần kết quả kiểm có thêm một dòng, ví dụ: **"Ô 5, 13 có nền khác màu, đã tự nhận"**.
   Trang Quái và Anh hùng ghi theo hàng.cột, ví dụ "Ô 1.5, 6.8 (hàng.cột)".
4. Ảnh nền một màu như bình thường: trang chạy y hệt trước. Đã so tệp xuất của bản cũ và bản mới, giống nhau từng byte.

Trang không thêm thư viện nào. Mỗi trang một commit.

## Kết quả kiểm

Cách kiểm: tự dựng ảnh lưới mẫu đúng lưới của một lô ở từng trang, vạch đen dày 12 điểm, nền hồng tím, trong đó 2 ô nền hồng nhạt (#FA8FAD) và trắng ngà (#F2E9E2).
Chạy cùng ảnh đó trên bản cũ và bản mới bằng trình duyệt tự động. Hình tách ra được so với hình thật đã vẽ (khung bao lệch không quá 4 điểm, số điểm ảnh sai không quá 5%).

| Trang (lô thử) | Trước khi sửa | Sau khi sửa | Ảnh nền một màu: tệp xuất cũ và mới |
|---|---|---|---|
| Tách Quái (lưới 8 × 6, 34 hình) | 34/34 hình, 2 hình ở ô nền lạ dính cả mảng nền | 34/34 hình, tất cả đúng, nằm trong ô, không dính nền. Trang ghi "Ô 1.5, 6.8 (hàng.cột) có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Anh Hùng (lưới 8 × 7, 40 hình) | 40/40 hình, 2 hình dính nền | 40/40 hình, tất cả đúng. Trang ghi "Ô 1.5, 6.8 (hàng.cột) có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Đồ (lô Mũ, lưới 5 × 3, 13 món) | 13/13 món, 2 món dính nền | 13/13 món, tất cả đúng. Trang ghi "Ô 5, 13 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Giao Diện (lô Nút điều khiển, lưới 5 × 4, 18 hình) | 18/18 hình, 2 hình dính nền | 18/18 hình, tất cả đúng. Trang ghi "Ô 5, 13 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Giao Diện (lô Biểu tượng nhỏ mới của phiên C2, lưới 6 × 5, 30 hình) | 30/30 hình, 2 hình dính nền | 30/30 hình, tất cả đúng. Trang ghi "Ô 5, 13 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Làng (lô Đạo cụ và con vật, lưới 5 × 3, 12 hình) | 12/12 hình, 2 hình dính nền | 12/12 hình, tất cả đúng. Trang ghi "Ô 5, 11 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Phòng (lô Đồ vật, lưới 6 × 3, 18 hình) | 18/18 hình, 2 hình dính nền | 18/18 hình, tất cả đúng. Trang ghi "Ô 5, 13 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Hiệu Ứng, mép Mềm (1 hàng 6 khung) | chỉ tìm được 1/6 khung (dò lưới hỏng), trang báo CÓ LỖI | 6/6 khung, tất cả đúng, trang báo ĐẠT. Trang ghi "Ô 2, 4 có nền khác màu, đã tự nhận" | giống nhau từng byte |
| Tách Hiệu Ứng, mép Sắc (1 hàng 6 khung) | chỉ tìm được 1/6 khung, trang báo CÓ LỖI | 6/6 khung, tất cả đúng, trang báo ĐẠT. Trang ghi "Ô 2, 4 có nền khác màu, đã tự nhận" | giống nhau từng byte |

"Giống nhau từng byte": mỗi trang thử 2 ảnh nền một màu (một ảnh màu phẳng tuyệt đối, một ảnh có nhiễu nhẹ như ảnh ChatGPT), lấy tệp tải về của bản cũ và bản mới (cả bản nét gấp đôi lẫn bản thường) rồi so cả chuỗi.
Không trang nào báo lỗi khi chạy.

Lưu ý: với ảnh mẫu tự dựng, bản cũ ở 6 trang đầu vẫn đếm đủ số hình, chỉ tách sai 2 ô nền lạ. Lỗi "đếm thiếu, ô 4 không được đánh số" của ảnh thật thì tôi chỉ dựng lại được ở trang Hiệu ứng (bản cũ tìm 1/6 khung). Ảnh gốc bị lỗi không có trong repo nên chưa thử được trên chính ảnh đó.

Ảnh kiểm (bên trái là bản cũ, bên phải là bản mới, cùng một ảnh):

- [Tách Quái](anh-kiem-tach-quai.png)
- [Tách Anh Hùng](anh-kiem-tach-anh-hung.png)
- [Tách Đồ](anh-kiem-tach-do.png)
- [Tách Giao Diện](anh-kiem-tach-giao-dien.png), [lô Biểu tượng nhỏ](anh-kiem-tach-giao-dien-nho.png)
- [Tách Làng](anh-kiem-tach-lang.png)
- [Tách Phòng](anh-kiem-tach-phong.png)
- [Tách Hiệu Ứng mép Mềm](anh-kiem-tach-hieu-ung.png), [mép Sắc](anh-kiem-tach-hieu-ung-sac.png)

## Kiểm thêm các tình huống khó (trang Tách Đồ, lô Mũ)

| Tình huống | Bản cũ, ảnh có ô nền lạ | Bản mới, ảnh có ô nền lạ | Ảnh nền một màu: cũ và mới |
|---|---|---|---|
| Lưới kẻ lệch 14 điểm so với lưới đều | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Hình cùng màu với nền ô (mũ hồng trên ô hồng, mũ trắng trên ô trắng ngà) | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Nền chung xanh lá #00FF00 | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Nền chung xanh dương #0000FF | 13/13, tách sai 4 | 13/13, 2 ô nền lạ đã đúng; còn 2 hình sai (xem ghi chú) | giống từng byte |
| Nét kẻ mảnh 4 điểm | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Không có khung viền ngoài | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Ô nền lạ là ô trống và ô góc | 13/13, tách sai 1 | 13/13, đúng cả | giống từng byte |
| Bốn ô nền lạ, hai ô cùng màu | 13/13, tách sai 3 | 13/13, đúng cả | giống từng byte |
| Ảnh màu phẳng tuyệt đối (không nhiễu) | 13/13, tách sai 3 | 13/13, đúng cả | giống từng byte |
| Ảnh nhiễu mạnh | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Hình to gần kín ô | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |
| Ảnh nhỏ 1024 × 683 | 13/13, tách sai 2 | 13/13, đúng cả | giống từng byte |

Ghi chú nền xanh dương: 2 hình còn sai là hình màu tím ở ô nền thường (ô 6, 7). Đây là việc có từ trước, không phải do lần sửa này: ô "Lọc đốm màu nền" xoá màu gần tông nền, mà tím gần tông xanh dương. Bản cũ với ảnh nền một màu cũng ra y như vậy. Prompt vốn đã dặn không dùng màu gần màu nền.

## Điều cần biết

- Trang chỉ nhận ô nền lạ khi phần lớn các ô (từ một nửa trở lên) cùng một nền, và ô lạ có ít nhất 3 trong 4 góc trống cùng một màu. Hình vẽ che kín các góc ô thì trang không nhận được, lúc đó nên nhờ ChatGPT vẽ lại ô đó.
- Lưới phải có từ 3 ô trở lên. Lô chỉ 1 hoặc 2 ô thì chạy như cũ.
- Trang Hiệu ứng, mép Mềm: phần hiệu ứng nào trùng màu với nền của ô thì thành trong suốt. Với nền chung cũng vậy từ trước.
- Trang Quái và Anh hùng: cách "Chia theo lưới" vốn đã lấy màu nền riêng từng ô nên không sửa; phần sửa nằm ở cách "Tự tìm" (cách khuyên dùng).
- Trong lúc làm, phiên C2 thêm lô "Biểu tượng nhỏ" vào trang Tách Giao Diện. Hai phần gộp với nhau không xung đột, đã kiểm lại trang này sau khi gộp (cả lô mới).

## Kiểm tra tự động trên GitHub

Sau khi đẩy 7 commit lên nhánh `khoi-tao-du-an`, lượt kiểm tra tự động số 182 (commit `6d6cf32`) chạy xong: **xanh** (thành công).

## Tệp kèm

- `kiem/`: script kiểm (dựng ảnh mẫu, chạy bản cũ ở cổng 8766 và bản mới ở cổng 8765, so kết quả) và `ket-qua.json` (số liệu đầy đủ).

## Bạn cần làm gì

Không cần làm gì thêm. Lần sau gặp ảnh có vài ô nền khác màu, cứ đưa vào trang như thường; thấy dòng "Ô … có nền khác màu, đã tự nhận" là trang đã xử lý.
Nếu còn ảnh lô 13 mũ bị lỗi hôm nay, bạn thử đưa lại vào trang Tách Đồ; nếu vẫn sai thì gửi ảnh đó cho Claude.
