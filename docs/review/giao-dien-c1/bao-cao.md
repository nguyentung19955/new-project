# Báo cáo phiên C1: nút điều khiển dùng được ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn C (Giao diện)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **hình ở giữa các nút** (Đánh, Đặc biệt, Chưởng, Né, Bình máu, Tạm dừng). Hiện chưa có tệp ảnh nào nên game **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Đã làm

**1. Game (`game/js/btn_art.js`)**

- Có tệp `gd-nut-...` thì game lấy ảnh đó làm hình ở giữa nút. Mọi thứ còn lại vẫn do game vẽ như cũ: vòng nút, màu theo hệ Lửa/Độc/Băng, lửa và gai băng quanh nút, thẻ giá mana, màn hồi chiêu, số giây, nút lún khi bấm, nút xám khi không dùng được.
- **Nút Né:** bạn chỉ vẽ MỘT mũi tên chỉ sang phải. Game tự xoay ảnh theo 16 hướng.
- Ảnh nạp xong lúc nào thì nút đổi sang ảnh lúc đó, không cần tải lại trang. Gỡ tệp ra thì nút về hình cũ.
- Nếu hình vẽ vươn ra tận góc ô (ví dụ thanh kiếm chéo), game tự thu nhỏ một chút để hình nằm gọn trong mặt nút tròn, không thò ra ngoài vòng nút.
- Thiếu tệp nào thì riêng nút đó dùng hình cũ. Không cần vẽ đủ cả 18 hình mới dùng được.

Bảng mã tệp:

| Nút | Mã tệp |
|---|---|
| Đánh (4 vũ khí) | `gd-nut-danh-sword`, `-bow`, `-spear`, `-hammer` |
| Đặc biệt (4 vũ khí) | `gd-nut-dac-biet-sword`, `-bow`, `-spear`, `-hammer` |
| Chưởng (3 hệ) | `gd-nut-chuong-fire`, `-poison`, `-ice` |
| Né | `gd-nut-ne` |
| Bình máu | `gd-nut-binh-mau` |
| Tạm dừng | `gd-nut-tam-dung` |
| Kỹ năng (4 em bé) | `gd-nut-ky-nang-smith`, `-hunter`, `-healer`, `-wrestler` (game hiện không hiện nút này, xem mục "Nên biết") |

**2. Trang công cụ** https://spiritblade.web.app/tach-giao-dien.html

- Lô "Nút điều khiển · 18 biểu tượng" nay có **bước 4 xem thử**: các nút do chính code nút của game vẽ, ảnh bạn vừa tách nằm ở giữa. Có cụm nút như trong trận, mọi biểu tượng trên đúng nút của nó, nút đang bấm, đang hồi, thiếu mana, và nút Né ở đủ 16 hướng.
- Nút "Đổi vũ khí và hệ" để xem nút Đánh với từng vũ khí và từng hệ. Nút "Xem bản vẽ code (cũ)" để so.
- Prompt của lô có thêm **bảng màu** (kim loại, gỗ cán, vải, da tay, ba hệ) lấy từ `docs/review/ra-soat-my-thuat/bang-mau.json`, và vài lời dặn mới. Bản đầy đủ: `PROMPT.md` cùng thư mục này.

## Bạn cần làm gì tiếp

1. Mở trang công cụ, chọn lô **Nút điều khiển · 18 biểu tượng**, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Đưa ảnh ChatGPT vẽ vào bước 2. Xem thử ở bước 4.
3. Ưng thì bấm **Tải tất cả (.zip)** và gửi cho Claude để đưa vào game.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

| Việc kiểm | Kết quả |
|---|---|
| Ảnh lưới mẫu 5×4 đưa vào trang công cụ | **ĐẠT**, tìm được 18/18 hình, tệp ghi `"net": 2`, ảnh 48×48 |
| Game không có tệp, so bản cũ với bản mới, 844×390 và 1280×720, phòng thường và phòng trùm | **khác 0 điểm ảnh** ở cả 4 cảnh |
| Vẽ riêng bộ nút (mọi vũ khí, hệ, trạng thái, 16 hướng Né, ô vũ khí, cần điều khiển) ở 4 cỡ, bản cũ so bản mới | **khác 0 điểm ảnh** |
| Nạp tạm 18 tệp mẫu vào game | hình hiện đúng trong nút, đúng cỡ, ở cả hai cỡ màn và cả hai loại phòng; phần khác chỉ nằm ở các nút |
| Gỡ tệp mẫu ra | game về đúng như lúc đầu, khác 0 điểm ảnh |
| Lỗi JavaScript | không có (game, bản gói, trang công cụ) |
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |

Ảnh kiểm: `anh-kiem.png`. Mỗi hàng: **bên trái là hình vẽ code cũ, bên phải là có tệp mẫu**. Thứ tự từ trên xuống: điện thoại 844×390 (phòng thường, phòng trùm, phóng to cụm nút), máy tính 1280×720 (cũng ba hàng như vậy), cuối cùng là bước 4 của trang công cụ.

Lưu ý: hình trong ảnh kiểm là **hình mẫu máy tự vẽ để thử** (thanh chéo, mũi tên vàng, ô vuông màu), không phải tranh thật. Không có ảnh nào được thêm vào `game/art/custom`.

Chạy lại: `python3 docs/review/giao-dien-c1/kiem.py <thư mục bản code cũ>`.

## Nên biết

- **Màu hệ trên hình vũ khí:** hình vẽ code cũ nhuộm lưỡi kiếm theo hệ. Ảnh AI thì giữ nguyên màu bạn vẽ; hệ vẫn thấy rõ nhờ vòng nút, mặt nút và lửa/gai băng quanh nút. Vì vậy prompt dặn vẽ 8 hình vũ khí bằng màu trung tính.
- **Bốn nút "Kỹ năng":** game hiện đã thay nút này bằng nút Chưởng nên bốn hình đó không hiện ra trong trận. Vẫn để trong lô cho đủ; vẽ hay bỏ đều được.
- **Ô vũ khí góc trên phải** không dùng các ảnh này (ở đó game vẽ hình vũ khí thật đang cầm).
- **Nút Tạm dừng rất nhỏ** (khoảng 8×8 điểm), nên hình chỉ nên là hai thanh dọc đơn giản.
- **Viền:** prompt đổi màu viền từ `#140e0c` sang `#14182e` theo luật bảng màu chung. Hai màu gần như giống nhau khi nhìn.
- **Bố cục nút mới (Đợt 2):** phòng thường và phòng trùm dùng chung một bộ nút gọn, nên ảnh hiện giống nhau ở cả hai. Đã chụp cả hai.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Sửa một dòng trong `game/build.py`** (thêm `btn_art.js` vào bản game gói cho trang công cụ). Luật chung nói làn C không sửa tệp này, nhưng không có cách khác để trang công cụ vẽ thử "đúng vòng nút của game". Không đổi định dạng tệp ảnh, không đổi bản game chính.
2. **Tự thu hình cho gọn trong nút tròn** khi hình vươn ra góc. Nếu sau này bạn thấy hình bị nhỏ, ở bước 3 của trang công cụ có nút "Nhỏ hơn / To hơn" để chỉnh từng hình.
3. Sửa hai chỗ prompt cũ tự mâu thuẫn: câu cấm "tay người" (trong khi ô Gồng là nắm đấm) đổi thành cấm "bàn tay ở ba ô Chưởng"; "bảng màu" trong câu cấm đổi thành "ô mẫu màu" để không lẫn với đoạn BẢNG MÀU.

## Chưa làm, chưa thử

- Chưa thử trên iPhone thật và chưa thử với ảnh ChatGPT thật. Lần đầu dùng có thể cần chỉnh nhẹ ở bước 3.
- Không chạy bộ test dài (theo lời dặn).
- Lượt kiểm ảnh chạy trước khi gộp với phần cửa phòng của phiên A2 vừa đẩy lên. Sau khi gộp đã gói lại game và chạy lại ba bước kiểm nhanh, đều qua. Hai phần sửa tệp khác nhau.
- Thân nút, ô vũ khí, cần điều khiển bằng ảnh: thuộc phiên C4.

## Dung lượng

Không thêm ảnh nào. Mã game thêm khoảng 4 KB. Khi bạn gửi đủ 18 hình, ước chừng thêm dưới 40 KB.

## Cho người làm kỹ thuật

- `btn_art.js`: `iconBuf(name, S, arg)` hỏi `SC.gdSan(gdMa(name))` trước. Có ảnh thì `gdBuf` lấy mẫu ảnh về bảng pixel S×S (lấy trung bình nhiều điểm rồi chốt đặc/trong ở 40% để mép sắc), xoay theo `deg` cho nút Né; kết quả đi tiếp qua `buildBase` như hình code nên `dim()`, thẻ giá, lún khi bấm đều áp dụng.
- Khoá bộ nhớ đệm của nút và của biểu tượng mang thêm dấu riêng của từng ảnh (`gdTag`, dùng `WeakMap`), nên không cần gọi `B.clear()` khi ảnh nạp xong. Không có ảnh thì khoá y như cũ.
- `G.btnArt.maAnh(tên biểu tượng)` trả về mã tệp, cho công cụ và bài kiểm tra.
- Xung đột khi `git pull --rebase` chỉ ở `game/dist/*`: đã chạy lại `python3 game/build.py` và lấy kết quả mới.
