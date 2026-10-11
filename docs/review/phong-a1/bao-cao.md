# Báo cáo phiên Phòng A1: đồ vật trong phòng vẽ bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an`

## Đã làm xong

**1. Game đã sẵn sàng nhận ảnh AI cho 18 hình đồ vật trong phòng.**
Khi có tệp ảnh, game tự dùng ảnh thay cho hình vẽ bằng code:

- Rương báu (đóng, đã mở)
- Suối máu và suối mana (còn nước, đã cạn)
- Rương đồ
- Bàn thờ lời nguyền (đang cháy, đã tắt)
- Sạp thương nhân
- Chậu than (đang cháy, đã tắt)
- Nấm độc (lành, đã vỡ)
- Tinh thể băng (lành, đã vỡ)
- Bệ thử thách (còn, đã dùng)

Hiện **chưa có tệp ảnh nào** trong game nên phòng chơi vẫn **y như cũ**. Lối chơi, bản lưu, đăng nhập Google, lưu mây đều không bị đụng tới.

Những thứ game vẫn tự vẽ đè lên ảnh (để vật vẫn "sống"): bóng dưới chân, quầng sáng mời gọi quanh vật đánh vỡ được, tia lấp lánh, ánh lửa chập chờn và tàn lửa, bào tử bay trên nấm, dấu chữ thập / giọt nước nhấp nhô trên suối, quầng sáng của đồng hồ cát.

**2. Trang công cụ mới: Tách Phòng · Phòng chơi**
Địa chỉ: https://spiritblade.web.app/tach-phong.html (6 trang tách ảnh khác đã có thêm mục **Phòng** ở cuối thanh menu).

Trang có 1 lô: **Đồ vật trong phòng · 18 hình** (một tấm ảnh, lưới 6 cột × 3 hàng).

Ở bước 4 có phần **xem thử**: một phòng mẫu do chính code của game vẽ, bày đủ 18 đồ vật bạn vừa tách. Thấy sao thì vào game y vậy. Có nút đổi phòng mẫu (Rừng già, Hang biển, Lâu đài cổ) và nút so với bản vẽ code cũ.

**3. Prompt vẽ** nằm ở `docs/review/phong-a1/PROMPT.md` (chép nguyên từ trang công cụ).

## Bạn cần làm gì tiếp

1. Mở trang công cụ trên iPhone, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang.
3. Nhìn bước 3 có chữ **ĐẠT**, rồi xem thử ở bước 4.
   - Vật nào to hoặc nhỏ quá: chạm vào hình đó ở bước 3, bấm **To hơn** / **Nhỏ hơn**.
   - Vật nào đứng lệch: bấm **Sang trái** / **Sang phải**.
4. Ưng thì bấm **Tải tất cả (.zip)** và gửi tệp .zip cho Claude để đưa vào game.

## Đã kiểm

- Kiểm lỗi gõ mọi tệp code game, bài kiểm tra lưu mây, gói game: đều qua. Các lần đẩy lên đều xanh.
- **Không có tệp thì game không đổi:** vẽ 18 đồ vật ở cả 3 vùng, 9 thời điểm khác nhau (27 khung hình) bằng bản trước và bản sau khi sửa: **khác 0 điểm ảnh**.
- Một lượt thử tự động với ảnh lưới mẫu máy tự dựng: trang tách ra **ĐẠT**, đủ 18/18 hình, tệp nào cũng ghi độ nét gấp đôi (`"net": 2`), tải ra đủ 2 bản (nét cao + thường). Thử cả ảnh có kẻ lưới và ảnh không kẻ lưới.
- Nạp tạm 18 tệp đó vào game (không lưu vào repo): đồ vật hiện đúng chỗ, đúng cỡ, không có lỗi. Gỡ ra thì game về y như cũ.
- Trang vừa màn hình điện thoại (rộng 390), không phải cuộn ngang.
- Ảnh chụp: `docs/review/phong-a1/anh-kiem.png`.

Lưu ý: hình trong ảnh chụp là **hình mẫu máy tự dựng để thử** (lấy từ chính hình vẽ code phóng to), không phải tranh thật. Chưa thử với ảnh ChatGPT thật, nên lần đầu bạn dùng có thể cần chỉnh nhẹ (cắt mép, chạm bỏ khung thừa, đổi cỡ).

## Vài điều nên biết

- **Cỡ:** mỗi hình được thu vừa "cỡ lớn nhất trong game" ghi cạnh tên (ví dụ rương 28×21), giữ đúng tỉ lệ ChatGPT vẽ, rồi cắt sát. Chân vật là giữa đáy ảnh.
- **Hai trạng thái của cùng một vật** (còn / đã dùng) là hai tệp riêng. Thiếu tệp nào thì trạng thái đó vẫn vẽ bằng code, nên nên đưa đủ cả cặp để khỏi lệch kiểu.
- **Màu tím của bàn thờ:** nền ảnh là hồng tím, nên prompt dặn ngọn lửa ma màu tím ngả xanh. Nếu lửa bị mất khi tách, bỏ dấu tích **Lọc đốm màu nền** ở bước 2 rồi bấm **Tách lại**.
- **Hình rất nhỏ** (nấm vỡ 13×5, tinh thể vỡ 14×4): ChatGPT vẽ gì cũng bị thu rất nhỏ, chỉ cần vài mảnh vụn đơn giản.
- Trang xem thử cần mạng (chạy trên spiritblade.web.app). Mất mạng vẫn tách và tải tệp được.
- **Dung lượng:** phiên này không thêm ảnh nào (0 MB). Khi có ảnh thật, 18 tệp ước dưới 0,1 MB.

## Chỗ tự quyết (chưa rõ nên chọn cách hợp lý)

- **Sửa 1 dòng trong `game/build.py`** (thêm `js/env_art.js` vào danh sách tệp của bản game gói cho công cụ). Luật chung dặn không sửa `build.py`, nhưng không có dòng này thì trang công cụ không vẽ thử được đồ vật bằng code thật của game. Không đụng phần nhúng ảnh hay kiểm mã.
- **Suối:** dấu chữ thập / giọt nước nổi phía trên vẫn do game vẽ (để người chơi phân biệt suối máu và suối mana), nên prompt dặn ChatGPT không vẽ biểu tượng lơ lửng.
- **Bỏ bớt 3 chuyển động nhỏ khi dùng ảnh**, vì chúng phải nằm đúng từng điểm của hình code, đặt lên ảnh AI dễ lệch: nước suối gợn 2 khung, vệt vàng nháy ở khe nắp rương, hạt cát rơi trong đồng hồ cát. Lửa, lấp lánh, quầng sáng thì vẫn giữ.
- **Cỡ đích** lấy theo cỡ hình code (cộng cả ngọn lửa với vật đang cháy). Nút To hơn cho phép vượt tới 48×48.
- **Cổng dịch chuyển** không thuộc lô này (làn B, phiên B3).

## Cho phiên A2, A3 (và A4) dùng tiếp trang này

Trang: `tools/tach-phong/index.html` (một tệp, không cần gói). Mọi thứ ở trong thẻ `<script>` cuối trang.

1. **Thêm lô:** thêm một mục vào CUỐI mảng `LO`. Các trường:
   - `id` (tên tệp zip là `gd-<id>_2-ban.zip`), `ten`, `cot`, `hang`, `mau` (số màu), `net` (`'min'` hoặc `'net'`).
   - `kieu`: `'vat'` = vật đứng trên sàn, thu vừa khung `w×h`, cắt sát, giữa đáy là chân (dùng cho cửa, đồ trang trí, cụm tiền cảnh); `'icon'` = ảnh ra đúng `w×h`, hình nằm giữa; `'gian'` = kéo giãn kín `w×h` (mảng sàn, dải tường lặp của A4).
   - `nen`: `'hong'`, `'xanh-la'` (lô Lâu đài có cờ đỏ tím nên cân nhắc) hoặc `'xanh-duong'`; prompt tự ghi màu nền theo đó.
   - `locHue`: lô có hình màu gần màu nền thì đặt 12. `hinhNho: true`: lô có hình rất nhỏ hoặc nhiều mảnh rời.
   - `ds`: mỗi hình `{ ma, ten, mo, w, h }`. `mo` là "nét lạ" của hình, đi thẳng vào prompt.
2. **Prompt:** hàm `taoPrompt(L)` đang viết cho lô đồ vật. Lô mới thì rẽ nhánh theo `L.id` ở đầu hàm; dùng lại `luoi(L, true)` (bố cục + danh sách ô có ghi cỡ) và `cuoi(L)` (câu nền).
3. **Xem thử:** `phongMau(r)` dựng phòng mẫu, `veXem()` gọi `GAME.art.bg` rồi `GAME.art.prop`. Cửa và đồ trang trí nằm sẵn trong nền phòng nên chỉ cần có ảnh là hiện; A2 nên thêm vài kiểu cửa (mở, khoá, cửa Trùm) vào `doors` của phòng mẫu và cho đổi theo lô. Phòng trùm: `GAME.roomArt.geo(true)`.
4. **Trong game:**
   - Hỏi ảnh: `G.spriteCustom.gdSan('gd-...')`, vẽ: `G.spriteCustom.veGd(bút, g, x, y, g.pw / g.net, g.ph / g.net)`. Xem mẫu ở `vat()` / `veVat()` trong `env_art.js` (dòng ngay trên `const PROPS`).
   - **Bộ nhớ đệm phòng đã lo sẵn:** `room_art.js` đếm số ảnh sẵn sàng có mã bắt đầu bằng `gd-vat-`, `gd-cua-`, `gd-tt-`, `gd-nen-`; số này đổi là tự xoá bộ nhớ đệm và dựng lại phòng (hàm `demAnh`, `RA.xoaDem`). A2 đến A4 cứ dùng đúng các đầu mã đó là được, không phải viết thêm.
   - Khi vẽ ảnh vào bộ nhớ đệm phòng (canvas ẩn) thì bút không phải `G.wx`: nhớ kiểm cỡ canvas ẩn (phòng dựng ở cỡ game hay cỡ nét gấp đôi) để ảnh không bị nhoè.
5. **Dải có cử động** (lửa đuốc `hu-lua-duoc` của A3) là kiểu `hieu-ung`: làm lô ở trang Tách Hiệu Ứng thì gọn hơn, trang này chỉ xuất ảnh tĩnh.
6. **Kiểm:** cách dựng ảnh lưới mẫu nhanh nhất là vẽ chính hình code phóng 6 lần lên nền hồng tím (tắt `A.ellipse` để bỏ bóng), đưa qua trang, rồi so với bản vẽ code ở bước 4: hai bên phải gần như trùng nhau.

## Tệp đã thêm / sửa

- `game/js/env_art.js`: đầu 8 hàm `PROPS.*` (rương, suối, rương đồ, bàn thờ, thương nhân, chậu than, nấm, tinh thể) hỏi ảnh trước; thêm `vat`, `veVat`, `dauSuoi`.
- `game/js/room_art.js`: `PROPS.pedestal` hỏi ảnh trước; thêm đếm ảnh để xoá bộ nhớ đệm phòng.
- `game/build.py`: 1 dòng (xem mục "Chỗ tự quyết").
- `tools/tach-phong/index.html`: trang mới. 6 trang `tools/tach-*/index.html` khác: thêm 1 dòng menu.
- `game/dist/*`, `tools/xuong-sprite/index.html`: do `build.py` tạo lại.
- `docs/review/phong-a1/`: báo cáo này, `PROMPT.md`, `anh-kiem.png`.
