# Đợt 1 — Báo cáo: Chơi ngay không bắt đăng nhập, màn hình tải, sửa co Hồ Tinh

Ngày làm: 11/10/2026. Nhánh `khoi-tao-du-an`. Ba mục đã đẩy lên theo đúng thứ tự trong brief (mục 3 → mục 2 → mục 1), mỗi mục một commit.

**Tóm tắt một dòng:** cả ba mục đã làm xong và đã chạy đủ các kiểm ghi trong brief, tất cả đạt. Có **một việc cần bạn quyết định** (mục 8) về trường hợp người chơi khách liên kết vào một tài khoản Google đã có tiến trình khác.

---

## 1. Danh sách tệp đã đổi

| Tệp | Đổi gì | Thuộc mục |
|---|---|---|
| `game/js/boss.js` | 1 dòng điều kiện (thêm 2 dòng chú thích + biến) | 3 |
| `game/index.html` | khối màn hình tải + CSS của nó | 2 |
| `game/js/engine.js` | 1 dòng: vẽ xong khung hình đầu thì gỡ màn hình tải | 2 |
| `game/js/village.js` | màn chào hai nút, hộp mời liên kết, cất bản lưu khách | 1 |
| `game/js/cloud.js` | chỉ thêm 6 câu báo lỗi tiếng Việt vào bảng lỗi đăng nhập | 1 |
| `game/js/ngon_ngu.js` | chữ tiếng Anh cho các chuỗi mới | 1 |
| `game/tests/cloud_save_regression.test.js` | chỉ thêm 3 ca kiểm Q4 (và cho hàm dựng trả thêm `ctx`) | 1 |
| `game/dist/*`, `tools/xuong-sprite/index.html`, `tools/xuong-sprite/thu.html` | tệp do `python3 game/build.py` tự tạo lại | cả ba |
| `docs/review/ke-hoach-cai-thien/dot-1/` | báo cáo này, ảnh `anh/`, số đo `so-do-tai.json` | — |

`game/build.py` **không phải sửa**: nó tự lấy phần thân của `index.html` nên khối màn hình tải tự có mặt trong bản đóng gói, nằm trước thẻ script. Không tệp nào ngoài danh sách cho phép bị sửa tay.

Không đổi: schema bản lưu cũ, định dạng `.sprite.json`, điểm neo, ảnh trong `game/art/custom`, cách đồng bộ mây, luật chọn bản lưu trong `cloud.js`.

---

## 2. Tóm tắt thay đổi và lý do

### Mục 1 — Chơi ngay (quyết định Q4)

**Màn chào.** Trước: có mây thì phải bấm "Đăng nhập Google để vào" mới chơi được. Nay có hai nút rõ:

- **Chơi ngay ▶** — vào luôn bằng tài khoản khách (ẩn danh Firebase, cơ chế có sẵn). Mây chưa kịp nối vẫn vào được, chơi lưu trên máy; nối được thì tự đồng bộ như cũ.
- **Đăng nhập Google** — cho người đã có tài khoản, kèm dòng nhắc "Đã có tài khoản? Bấm Đăng nhập Google để chơi tiếp tiến trình cũ."

Ảnh trước: `anh/1-0-truoc-man-chao-bat-dang-nhap.png`; ảnh sau: `anh/1-1a-man-chao-hai-nut.png`. Người đã đăng nhập Google từ trước vẫn thấy "Vào game ▶" như cũ. Nút "Chơi tạm" cũ không còn cần nữa nên không vẽ.

**Lời mời sau ải 1.** Người chơi khách đã qua ải 1, khi về làng sẽ thấy hộp "Liên kết Google để giữ tiến trình trên mọi máy" với hai nút **Liên kết Google** / **Để sau**.

- Bấm "Để sau": không hỏi lại trong lần chơi đó. Lần mở game sau, Anh Mõ nhắc lại **đúng một lần** khi mở bảng cài đặt. Từ chối lần hai thì không tự nhắc nữa.
- Nút Đăng nhập Google ở Anh Mõ vẫn luôn còn.
- Cờ "đã từ chối" là **một trường mới, tuỳ chọn** trong bản lưu tên `moiGoogle` (1 hoặc 2). Bản lưu cũ không có trường này vẫn đọc bình thường; không trường cũ nào bị đổi.

**Liên kết thất bại.** Lỗi hiện ngay trong hộp bằng tiếng Việt (đóng cửa sổ, trình duyệt chặn, mất mạng, tài khoản đã dùng…), kèm dòng "Tiến trình của bạn vẫn còn nguyên", có nút Thử lại / Để sau. Không xoá, không ghi đè gì.

**Cất bản lưu của khách (thêm để bảo vệ dữ liệu).** Trước khi đăng nhập hoặc liên kết, game chụp lại bản lưu của khách. Nếu Google chuyển sang một tài khoản đã có tiến trình, bản của khách được chép nguyên văn sang một khoá riêng trên máy (`linhkhi_save_v1_khach`). Việc này **không đổi** bản nào được dùng, chỉ để còn cứu lại được. Lý do ở mục 8.

**Tiếng Anh.** Mọi chuỗi mới có bản tiếng Anh. Tệp `ngon_ngu_en.js` là tệp do công cụ tạo ra và không nằm trong danh sách được sửa, nên phần chữ mới đặt trong `ngon_ngu.js` đúng như brief.

### Mục 2 — Màn hình tải

Thêm khối chữ tĩnh "LINH KHÍ · Đang tải…" và một vạch chạy qua lại, chỉ dùng CSS, không ảnh, nằm trước mã game nên hiện ngay khi trang vừa về. Game vẽ xong khung hình đầu thì tự gỡ khối này.

- Vạch **không đo tiến độ thật** (bản một tệp không đo được), chỉ cho biết game đang tải.
- Chữ theo ngôn ngữ đã chọn trong game, chưa chọn thì theo ngôn ngữ máy; mặc định tiếng Việt.
- Bản đóng gói chỉ được có đúng một thẻ script (quy tắc sẵn có của `build.py`), nên việc chọn ngôn ngữ dùng một thuộc tính sự kiện nhỏ trên chính khối đó thay vì thêm thẻ script. Nếu sự kiện đó không chạy, chữ vẫn là tiếng Việt.

### Mục 3 — Hồ Tinh pha 3

Trước: pha 3 luôn bị co còn 72%. Mức co này dành cho hình vẽ bằng code (to gấp rưỡi ở pha 3). Ảnh AI dùng một ảnh cho mọi pha nên bị nhỏ đi sai. Nay chỉ co khi **không** có ảnh AI. Hình vẽ bằng code giữ y như cũ.

---

## 3. Kết quả kiểm thử

### Kiểm chạy trong workflow (cũng đã chạy trên máy trước khi đẩy)

| Kiểm | Kết quả |
|---|---|
| `node --check` mọi tệp `game/js/*.js` | Đạt |
| `node game/tests/cloud_save_regression.test.js` (3 ca cũ + 3 ca Q4 mới) | Đạt 6/6 |
| `python3 game/build.py` | Đạt |

Workflow đăng bản sau cả ba lần đẩy đều xanh: lần chạy số 153 (mục 3), 154 (mục 2), 155 (mục 1).

### Nghiệm thu mục 1 (một lượt Playwright trên bản đóng gói, dùng Firebase giả của dự án, bản lưu thử tự tạo): 52/52 điểm kiểm đạt

| # | Tiêu chí trong brief | Kết quả | Ảnh |
|---|---|---|---|
| 1 | Người mới chơi ẩn danh, xong ải 1 → được mời; liên kết → tiến trình giữ nguyên | **Đạt.** Sau liên kết vẫn cùng tài khoản, sao và vàng trên máy và trên mây khớp nhau; mở lại game vào thẳng bằng Google | `1-1a`, `1-1b`, `1-1c`, `1-1d` |
| 1b | "Để sau" không hỏi lại trong phiên; phiên sau hỏi lại 1 lần ở Anh Mõ | **Đạt.** Phiên sau nữa không nhắc; nút Google ở Anh Mõ vẫn còn | `1-1e`, `1-1f` |
| 2 | Google đã có tiến trình, mở máy mới → đi đúng tiến trình mây, không tạo bản mới | **Đạt.** Sang đúng tài khoản cũ, dùng tiến trình mây; bản trên mây không bị bản trắng ghi đè | `1-2a`, `1-2b` |
| 3 | Liên kết thất bại → tiến trình không đổi | **Đạt.** Bản lưu trên máy, dữ liệu trên mây và nhật ký ghi giống hệt trước và sau; vẫn là tài khoản khách cũ | `1-3a`, `1-3b`, `1-3c` |
| 4 | `?cloud=0` chơi được | **Đạt.** Vào làng, thắng ải 1, lưu trên máy; không có lời mời, không thêm trường mới | `1-4a`, `1-4b` |
| 5 | `cloud_save_regression` qua, thêm ca cho (1)(3) | **Đạt.** Đã thêm ca cho (1), (3) và cả (2) | — |
| 6 | Bản lưu cũ `linhkhi_save_v1` đọc được | **Đạt.** Bản tạo tay kiểu cũ (vũ khí còn trường `tier`, `affix`, có `grit`) đọc đúng vàng, sao, cấp, vũ khí; không bị coi là bản hỏng | `1-6` |
| thêm | Mây chưa nối được vẫn "Chơi ngay"; nối lại thì tự đẩy tiến trình lên | **Đạt** | `1-5a` |
| thêm | Chuỗi mới có đủ tiếng Anh | **Đạt** (không chuỗi nào bị ghi "thiếu") | `1-7a`, `1-7b` |

Cách thắng ải 1 trong bài kiểm: gọi đúng hàm tính thưởng của game ở phòng trùm rồi bấm "Về làng" trên bảng kết quả, không đánh tay từng phòng.

### Nghiệm thu mục 2: đạt

| Tiêu chí | Kết quả | Ảnh |
|---|---|---|
| Mạng 1,5 Mbps: giây thứ 1 thấy chữ tải | **Đạt.** Chữ hiện sau khoảng 0,2 giây | `2-tai-sau-giay-1` (trước đó: `2-tai-truoc-giay-1`, đen) |
| Không khung đen/trắng sau khi HTML về | **Đạt** | `2-tai-sau-giay-1`, `2-tai-sau-man-chao` |
| Chữ tiếng Anh khi máy dùng tiếng Anh | **Đạt** | `2-tai-sau-giay-1-tieng-anh` |
| Mở tệp `index.html` thường, cầm dọc: khối tải vẫn được gỡ | **Đạt** | — |

### Nghiệm thu mục 3: đạt

| Tiêu chí | Kết quả | Ảnh |
|---|---|---|
| Ảnh AI: pha 3 không còn bị co | **Đạt.** Cỡ vẽ pha 3 bằng pha 1 (174×110), trước là 202×125 trên ảnh đã co 72% | `3-ho-tinh-pha3-truoc`, `3-ho-tinh-pha3-sau` |
| Hình vẽ bằng code: vẫn co như cũ | **Đạt** | `3-ho-tinh-pha3-hinh-code-van-co` |

### Chưa kiểm

- **Chưa thử trên iPhone thật và chưa thử với Google thật.** Mọi kiểm đăng nhập dùng Firebase giả của dự án. Cửa sổ đăng nhập Google thật trên Safari chỉ thử được trên máy thật.
- Không chạy các bộ test dài (`tests/may.py`, các bài `au_*`…) theo đúng lời dặn. Xem rủi ro số 4.

---

## 4. Số đo

Đo bằng Playwright, giả lập mạng 1,5 Mbps tải xuống, trễ 150 ms, tệp nén gzip giống Firebase Hosting. Phông chữ Google bị chặn trong lúc đo. Số chi tiết: `so-do-tai.json`.

| | Trước | Sau |
|---|---|---|
| Thấy thứ gì đó trên màn hình | 37,0 giây (đen suốt lúc tải) | **0,2 giây** (chữ tải) |
| Tới màn chào | 37,1 giây | 37,4 giây |
| Tới màn chào nếu không nén | — | 56,8 giây |

| Dung lượng `dist/linh-khi.html` | Trước đợt 1 | Sau đợt 1 |
|---|---|---|
| Tệp | 10 423 213 byte | 10 435 012 byte (+12 KB) |
| Sau gzip | 6 719 954 byte | 6 724 123 byte |

Thời gian tới màn chào **không đổi** (khác nhau 0,3 giây là sai số đo): đợt này chỉ thêm phản hồi tải, chưa làm nhẹ gói. Việc làm nhẹ thuộc Q5.

---

## 5. Rủi ro còn lại

1. **Khách liên kết vào Google đã có tiến trình khác: game tự dùng bản trên mây mà không hỏi** khi bản của khách không hơn rõ rệt. Đây là luồng có sẵn, không sửa theo brief. Vì nay ai cũng chơi khách trước nên ca này sẽ gặp nhiều hơn. Chi tiết và lựa chọn ở mục 8.
2. **Tiến trình của khách chỉ gắn với một trình duyệt.** Xoá dữ liệu trình duyệt, đổi máy, hoặc Safari trên iPhone tự dọn dữ liệu của trang lâu không mở thì tài khoản khách và bản lưu trên máy cùng mất, không lấy lại được nếu chưa liên kết. Lời mời sau ải 1 là để giảm rủi ro này, nhưng người bấm "Để sau" hai lần sẽ không được nhắc nữa. Tôi chưa kiểm được trong Firebase của dự án có bật tự xoá tài khoản ẩn danh sau 30 ngày hay không.
3. **Lời mời chỉ hiện khi về làng.** Bảng kết quả ải 1 có nút "Ải tiếp theo"; ai bấm đi tiếp thì tới lần về làng sau mới thấy lời mời. Muốn hiện ngay trên bảng kết quả phải sửa `stage.js`, tệp này không nằm trong phạm vi.
4. **Các bài kiểm cũ về màn chào có thể báo hỏng.** `tests/may.py` và vài bài chụp màn chào viết cho luồng "phải đăng nhập Google mới vào". Chúng không chạy trong workflow và không thuộc danh sách tệp được sửa, nên tôi không chạy và không sửa. Cần một phiên khác cập nhật.
5. **Người chơi khách cũ** (đã qua ải 1 từ trước bằng "Chơi tạm") cũng sẽ thấy lời mời một lần khi vào làng.
6. **Màn hình tải vẫn chờ phông chữ Google.** Thẻ phông chữ trong `<head>` chặn việc vẽ cho tới khi tải xong hoặc lỗi. Trong lúc đo tôi chặn nó nên con số 0,2 giây chưa tính phần này; trên mạng thật chậm có thể lâu hơn. Không sửa vì ngoài phạm vi.
7. **Nếu mã game lỗi ngay lúc khởi động**, chữ "Đang tải…" sẽ đứng mãi. Trước đây ca này là màn đen mãi.

---

## 6. Cách quay lui

Mỗi mục một commit, quay lui riêng được. Sau khi revert chạy `python3 game/build.py` rồi commit lại `game/dist`.

| Mục | Lệnh |
|---|---|
| 1 — Chơi ngay | `git revert 705feace` |
| 2 — Màn hình tải | `git revert 517c3edb` |
| 3 — Hồ Tinh | `git revert c99b4dba` |

Quay lui mục 1 không làm hỏng bản lưu: trường `moiGoogle` và khoá dự phòng `linhkhi_save_v1_khach` nếu đã có sẽ nằm yên, game cũ không đọc tới.

---

## 7. Hai chỗ tôi tự chọn khác chữ trong tài liệu

1. **Dòng `Claude-Session` trong commit.** `CHUNG.md` ghi sẵn đường dẫn của phiên lập kế hoạch. Tôi dùng đường dẫn của chính phiên này để commit dẫn đúng về nơi đã làm ra nó.
2. **Quy định II.8 "không tự xuất bản".** Đẩy lên nhánh này là workflow tự đăng lên spiritblade.web.app. Tôi vẫn đẩy vì lời giao việc và `CHUNG.md` yêu cầu đẩy và chờ workflow xanh. Cả ba thay đổi hiện đã lên bản chơi công khai.

---

## 8. Quyết định mới cần bạn duyệt

### Khách đã có tiến trình, liên kết vào một tài khoản Google cũng đã có tiến trình

**Chuyện gì xảy ra hiện nay** (đã thử, ảnh `1-2c`): một người bấm "Chơi ngay" trên máy mới, chơi xong ải 1 (2 sao, 80 vàng), rồi bấm Liên kết bằng tài khoản Google vốn đã có 6 ải. Game chuyển sang tài khoản Google và **dùng luôn bản trên mây, không hỏi**. Bản của khách bị thay trên máy.

Luật có sẵn trong `cloud.js`: chỉ hỏi người chơi khi bản trên máy hơn bản mây **từ 8 điểm tiến độ trở lên**; còn lại bản mây thắng. Ở ca trên kết quả là đúng ý người chơi. Nhưng nếu hai bản xấp xỉ nhau, hoặc bản khách nhỉnh hơn một chút, bản khách vẫn bị thay mà không hỏi.

Quyết định Q4 ghi: gặp hai bản tiến trình khác nhau thì phải giữ nguyên dữ liệu và xin quyết định trước khi chọn bản thắng. Brief dặn không sửa luồng này mà báo lại. Tôi đã làm đúng vậy, và chỉ thêm một lớp an toàn: **bản của khách được cất nguyên văn trên máy** trước khi bị thay (đã kiểm: có). Bản của khách trên mây cũng còn nằm dưới tài khoản khách cũ. Chưa có nút nào để người chơi tự lấy lại bản đã cất.

**Các lựa chọn:**

| | Làm gì | Được | Mất |
|---|---|---|---|
| A | Giữ như hiện nay | Không sửa gì thêm | Bản khách xấp xỉ hoặc nhỉnh hơn bị thay mà không hỏi; muốn cứu phải nhờ người rành kỹ thuật |
| B (tôi nghiêng về) | Khi khách **đã có ít nhất 1 ải** mà chuyển sang tài khoản Google đã có tiến trình: luôn hiện hộp hỏi có sẵn (so hai bản, chọn một) | Đúng tinh thần Q4; dùng lại hộp hỏi sẵn có | Sửa điều kiện hỏi trong `cloud.js`, cần thêm ca kiểm; người chơi thêm một lần bấm |
| C | Như B, thêm nút "Lấy lại bản khách đã cất" ở Anh Mõ | An toàn nhất | Thêm giao diện và kiểm thử |

Trong lúc chờ, bản đang chạy là lựa chọn A cộng với việc cất bản khách.
