# Báo cáo: vẽ bản đồ và biểu tượng bản đồ bằng ảnh AI

Ngày 10/10/2026 · nhánh `khoi-tao-du-an`

## Đã làm xong

**1. Game đã sẵn sàng nhận ảnh AI cho bản đồ.**
Khi có tệp ảnh, game tự dùng ảnh thay cho hình vẽ bằng code ở cả bản đồ nhỏ (góc trên bên phải) và bản đồ to:

- 12 biểu tượng phòng: bắt đầu, đánh quái, tinh anh, rương, suối hồi, thương nhân, thử thách, lời nguyền, trùm, ổ khoá, chìa khoá, cổng dịch chuyển.
- Ô phòng thường, ô đang đứng, đoạn lối nối giữa hai ô.
- Khung của bản đồ to.

Hiện **chưa có tệp ảnh nào** trong game, nên bản đồ vẫn **y như cũ**. Lối chơi, bản lưu, đăng nhập Google, lưu mây đều không bị đụng tới.

**2. Trang công cụ mới: Tách Giao Diện · Bản đồ**
Địa chỉ: https://spiritblade.web.app/tach-giao-dien.html (các trang tách khác đã có thêm mục "Giao diện" trên thanh menu).

Trang có 4 lô:

1. Bản đồ · 12 biểu tượng phòng (lưới 4×3)
2. Bản đồ · ô phòng và lối nối (3 hình)
3. Bản đồ · khung bản đồ to (1 ảnh, có chỗ chạm để đặt 4 vạch viền)
4. Nút điều khiển · 18 biểu tượng (chỉ xuất tệp sẵn, xem mục "Chưa làm")

Ở bước 4 của trang có phần **xem thử**: bản đồ nhỏ và bản đồ to được vẽ bằng chính code của game với ảnh vừa tách, nên thấy sao thì vào game y vậy. Có nút đổi bản đồ mẫu và nút so với bản vẽ cũ.

**3. Các prompt vẽ** nằm ở `docs/review/giao-dien/PROMPT.md` (chép nguyên từ trang công cụ).

## Bạn cần làm gì tiếp

1. Mở trang công cụ trên iPhone, chọn lô, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang.
3. Xem thử ở bước 4. Ưng thì bấm **Tải tất cả (.zip)**.
4. Gửi tệp .zip cho Claude để đưa vào game.

Nên làm lô 1 (biểu tượng) trước vì dễ thấy khác biệt nhất.

## Đã kiểm

- Kiểm lỗi gõ mọi tệp code game, bài kiểm tra lưu mây, gói game: đều qua.
- Một lượt thử tự động với ảnh mẫu tự dựng: cả 3 lô bản đồ tách ra đều **ĐẠT**, tệp ghi độ nét gấp đôi (`"net": 2`, biểu tượng 7×7 thành ảnh 14×14), tải ra đủ 2 bản (nét cao + thường).
- Nạp tạm 16 tệp đó vào game (không lưu vào repo): bản đồ nhỏ và bản đồ to hiện ảnh, không có lỗi. Gỡ ra thì bản đồ về như cũ.
- Ảnh chụp: `docs/review/giao-dien/anh-kiem.png`.

Lưu ý: ảnh trong ảnh chụp là **hình mẫu máy tự vẽ để thử** (hình tròn, tam giác…), không phải tranh thật. Chưa thử với ảnh ChatGPT thật, nên lần đầu bạn dùng có thể cần chỉnh nhẹ (cắt mép, chạm bỏ khung thừa).

## Vài điều nên biết

- **Màu:** bản đồ vẽ code vẫn giữ luật "một màu cho mọi ô". Ảnh bạn vẽ thì muốn màu gì cũng được.
- **Ô mới biết (chưa vào)** vẫn hiện mờ như trước.
- **Khung bản đồ to** được vẽ ôm phía ngoài bảng, để viền không đè lên chữ. Viền nên mảnh (prompt đã dặn). Phần giữa khung để trống, game tự lót nền tối.
- **Biểu tượng rất nhỏ** (7×7 điểm ảnh trong game), nên hình phải thật đơn giản. Nếu thấy bản đồ to chưa đủ nét, ở bước 2 chọn Độ nét "Gấp bốn".
- Trang xem thử cần mạng (chạy trên spiritblade.web.app). Mất mạng vẫn tách và tải tệp được.

## Chưa làm

- **Nút điều khiển (Đánh, Đặc biệt, Kỹ năng, Chưởng, Né…):** trang công cụ đã xuất được tệp (mã `gd-nut-...`), nhưng **game chưa dùng** các ảnh này. Lý do: code vẽ nút hiện ghép biểu tượng với vòng nút, màu theo hệ Lửa/Độc/Băng, số mana, hiệu ứng bấm, và nút Né xoay theo 16 hướng, nên không thay ảnh vào một cách đơn giản được.
  Đề xuất cho lần sau: chỉ thay phần **biểu tượng ở giữa nút** bằng ảnh, giữ nguyên vòng nút và hiệu ứng của game; nút Né thì game tự xoay ảnh mũi tên. Việc này nên làm riêng một đợt và thử kỹ trên điện thoại.
- Chưa có ảnh thật nào được đưa vào game. Việc đó chờ bạn vẽ và gửi tệp.

## Cho người làm kỹ thuật

- Định dạng tệp: `doi_tuong: "giao-dien"`, mã `gd-<tên>`, `anh` (một ảnh PNG), `net`, và `vien: [trên, phải, dưới, trái]` (tuỳ chọn, cắt 9 mảnh).
- `game/build.py` nhúng và kiểm mã; `game/js/sprite_custom.js` đọc vào `SC.gd`, có `SC.gdSan(mã)` và `SC.veGd(...)`; `game/js/minimap.js` dùng các mã `gd-phong-<loại>`, `gd-o-phong`, `gd-o-phong-cur`, `gd-loi-noi`, `gd-khung-ban-do`.
- Bản game gói cho công cụ (`xuong-sprite.html`) có thêm `mapgen.js`, `minimap.js` để trang công cụ vẽ thử.
- Bài kiểm tra soi màu bản đồ (`game/tests/ghep2_d.js`) không bị đổi và không chạy lại trong đợt này (theo yêu cầu không chạy bộ test dài); đường vẽ khi không có tệp `gd-*` giữ nguyên các lệnh cũ.
