# Tư vấn 17/10 — dễ đọc trong trận (hộp mẹo, thông báo trùm, nút Bình máu, HUD gọn, màn rộng)

Làm theo `TU-VAN-CHATGPT-17-10.md` mục 1, 2.4, 2.5, 4. **Chờ trước:** phiên "Nét cao: hiệu ứng + giao diện" có báo cáo lúc 09:16 (giờ máy chủ, chờ ~90 phút, chưa quá 180 phút) → làm trên nền đó.

Không chơi thử bằng tay: mọi cảnh dựng bằng mã, chụp headless. **Không đổi luật chơi, số liệu** (máu, sát thương, thời gian…). Không đụng đăng nhập Google / lưu mây / `?cloud=0`. Không có hình mới vẽ bằng code: biểu tượng dùng ảnh có sẵn (`gd-sao`, `gd-he-*`, `gd-cham-than`, ảnh nền `gd-nen-*-ngoai`).

## Tóm tắt cho chủ game

| # | Việc | Mặc định | Cờ tắt (gõ cuối địa chỉ) |
|---|---|---|---|
| 1 | Dải chữ hướng dẫn / mẹo ở đáy → **hộp nhỏ ở cạnh trái**, tối đa 2 dòng, câu ngắn lại, **tự ẩn sau 5 giây hoặc lần chạm kế tiếp** | BẬT | `?meogon=0` |
| 2 | Phòng trùm: "LỘ ĐIỂM YẾU!", "Hệ Độc: đánh bằng Lửa!", "… nổi giận!"… hiện **ngay dưới thanh máu trùm 1 giây** rồi **thu thành biểu tượng nhỏ cạnh thanh máu** | BẬT | `?baotrum=0` |
| 3 | Nút **Bình máu 39 → 47 px**; Đặc biệt / Chưởng 50 → 54 px; Đánh 84, Né 65 giữ nguyên; **vùng chạm các nút không còn chồng nhau** | BẬT | `?binhto=0` |
| 4 | Góc trên phải chỉ còn **2 biểu tượng: vũ khí đang cầm + "Bản đồ"**; chạm "Bản đồ" → bản đồ nhỏ mở 4 giây (chạm lần nữa → bản đồ to như cũ). Thanh máu trùm vẫn ở giữa | BẬT | `?hudgon=0` |
| 5 | Bỏ dòng **"Sức mạnh … / khuyên …"** khỏi HUD trong trận (màn chọn ải, bảng thua vẫn có) | BẬT | `?ansucmanh=0` |
| 6 | Màn rộng (844×390): **tô hai dải đen bằng ảnh nền ngoài phòng của vùng**, tối bớt | **TẮT** | bật bằng `?manrong=1` |

Tắt cả 5 cờ (`?meogon=0&baotrum=0&binhto=0&hudgon=0&ansucmanh=0`) thì lớp giao diện **giống bản trước tới từng điểm ảnh** (đã so, 0 điểm khác — xem "Kiểm").

## Ảnh TRƯỚC / SAU (thư mục `anh/`)

| Ảnh | Nội dung |
|---|---|
| `844x390-1-phong-quai-meo.jpg`, `1280x720-1-…` | Phòng quái có mẹo vũ khí: dải chữ đáy (che chân Cu Tí / quái) → hộp 2 dòng cạnh trái |
| `…-2-ai-huong-dan.jpg` | Ải hướng dẫn: lời chỉ dẫn phòng đầu |
| `…-3-trum-rung.jpg` | Mộc Tinh: TRƯỚC / SAU lúc vừa báo (0,15 giây) / SAU 1,5 giây (đã thu thành ⭐ và dấu "!" cạnh thanh máu) |
| `…-4-trum-song.jpg` | Thuồng Luồng: "LỘ ĐIỂM YẾU!" + "Hệ Độc: đánh bằng Lửa!" → sau 1 giây còn ⭐ và biểu tượng Lửa |
| `…-5-hud.jpg` | HUD phòng quái: TRƯỚC / SAU (2 biểu tượng, không còn Sức mạnh, Bình máu to) / SAU khi chạm "Bản đồ" |
| `844x390-6-man-rong.jpg` | Mặc định (dải đen) và `?manrong=1` |

Dựng lại: `python3 game/build.py` rồi `python3 docs/review/ke-hoach-cai-thien/tu-van-17-10-de-doc/chup.py game/dist/linh-khi.html <thư mục ra> sau` (TRƯỚC: cùng lệnh với `dist/linh-khi.html` build ở commit trước phiên, `6b66101d`).

## Chi tiết từng mục

### 1. Hộp mẹo cạnh trái (`G.MEO_GON`, js/stage.js `meoGon`)

- Vị trí: cột trái + phần lề đen bên trái, ngay dưới tên vùng, trên cần điều khiển. **Không phủ sàn giữa Cu Tí và quái, không gần cụm nút bên phải.** Cao 2 dòng = 25 đơn vị game ≈ **36 px ở 844×390** (≤ 42). Mỗi lúc một hộp: mẹo (vũ khí, quái lần đầu gặp, Chưởng, Bình máu) trước, lời chỉ dẫn ải hướng dẫn sau.
- Tự ẩn: sau **5 giây đang hiện** (tạm dừng không tính) hoặc **lần chạm màn kế tiếp** (sau 0,3 giây kể từ lúc hộp hiện; cú chạm vẫn làm việc của nó). Lời chỉ dẫn đã ẩn không hiện lại trong phòng đó; phòng mới / câu mới thì hiện. Bàn phím: chỉ ẩn theo 5 giây.
- **Câu ngắn** (bảng trong js/stage.js, có tiếng Anh): 11 lời chỉ dẫn + 3 câu "mở dần", 4 mẹo vũ khí, mẹo Bình máu, mẹo Chưởng, 34 mẹo quái. Câu dài cũ **giữ nguyên** ở chỗ khác (bảng thua "Mẹo:", Cụ Đồ…). Ví dụ: "Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh ngay để lướt chém. Đặc biệt: Trảm Nguyệt phóng vệt chém xuyên quái." → "Kiếm: bấm Đánh chém 3 nhát, Né rồi đánh để lướt chém."
- Sửa luôn câu sai chỗ: mẹo Bình máu cũ nói "góc trên bên trái", nay nút ở cụm phải → "Máu thấp! Chạm Bình máu để hồi 30% máu."
- Màn 16:9 (không có lề đen, vd 1280×720): cột trái hẹp nên hộp lấn mép sàn ~20 điểm; có người / quái / vùng đòn dưới hộp thì hộp mờ còn 35% (như ô chữ cũ). Câu quá dài (câu chưa có bản ngắn) thì thu chữ 6,5, nới hộp, quá 2 dòng thì cắt "…".

### 2. Thông báo phòng trùm (`G.BAO_TRUM_GON`)

- Chỉ khi trong phòng có trùm còn sống. "LỘ ĐIỂM YẾU!" và mỗi dòng báo (cả dòng phụ "Ra chiêu nhanh hơn…") hiện **ngay dưới thanh máu trùm 1,0 giây**, rồi thu thành biểu tượng 12×12 cạnh khung thanh máu (bên phải, hết chỗ thì bên trái), còn tới khi hết lý do (hết lộ điểm yếu / dòng báo hết giờ).
- Biểu tượng (ảnh có sẵn): **⭐ `gd-sao` nhấp nháy** = đang lộ điểm yếu; **`gd-he-<hệ>`** = "Hệ X: đánh bằng Y" của Thuồng Luồng (hệ Y nên dùng; thuong_luong.js thêm trường `icon` vào dòng báo, không đổi luật); **`gd-cham-than`** = mọi dòng báo khác (nổi giận, xuất hiện…). Hai dòng cùng loại chỉ một biểu tượng.
- Thẻ "Kháng Độc / Yếu Lửa" dưới thanh máu giữ như cũ (là thông tin thường trực, không phải thông báo).

### 3. Nút Bình máu và vùng chạm (`G.BINH_TO`)

Đo ở 844×390 (px CSS), cỡ nút Vừa / Nhỏ (×0,85) / To (×1,15) ở Anh Mõ — **cài đặt Cỡ nút được tôn trọng**:

| Nút | TRƯỚC (Vừa) | SAU Nhỏ / **Vừa** / To |
|---|---|---|
| Đánh | 83,7 | 71,2 / **83,7** / 96,3 |
| Né | 65 | 55,2 / **65** / 74,7 |
| Đặc biệt, Chưởng | 50,5 | 45,9 / **54** / 62,1 |
| Bình máu | 39 | 39,9 / **47** / 54 |
| Khe hẹp nhất giữa hai **vùng chạm** | −1,1 (chồng nhau: Đánh–Né) | +1,5 / **+1,4** / +1,5 (không chồng) |

- Cách làm: khe giữa hai nút ≥ tổng phần nới vùng chạm của hai nút + 1 → vùng chạm không bao giờ chồng. Máy thử **mọi điểm trong hình mỗi nút** (5 nút, 3 cỡ, 2 cỡ màn, ~7 000 điểm/lần): **0 điểm** bị nút khác "ăn" (Đánh không lấy chạm của Né / Bình máu…). 1280×720: khe +2,7 px (trước −7,9).

### 4. HUD góc trên phải gọn (`G.HUD_GON`)

- Ô vũ khí: chỉ món đang cầm (34×32, hình vũ khí + vạch tiến độ, viền bậc). **Chạm = đổi món kế, giữ = vòng chọn 4 món — như cũ.** Vùng chạm 39×39 đơn vị (≈ 56 px).
- "Bản đồ": tấm + chữ, số phòng / mảnh chìa (vd 2/3) bên dưới. Chạm → bản đồ nhỏ mở **4 giây** ở chỗ cũ; đang mở mà chạm nữa (hoặc ở phòng trùm) → bản đồ to (tạm dừng) như cũ. Phím M như cũ.
- Tấm "Linh khí N" chỉ hiện **2,5 giây sau khi nhặt linh khí** (và khi bản đồ đang mở). Bố cục cụm nút vẫn chừa chỗ bản đồ nhỏ → bản đồ mở ra không đè nút.
- Nhãn hướng dẫn "Chạm để đổi vũ khí →" dời theo, vẫn chỉ đúng ô vũ khí.
- **Thiếu ảnh** biểu tượng bản đồ riêng: code đã sẵn chỗ (`gd-icon-ban-do`, có tệp thì vẽ ảnh thay chữ). Prompt:
  > Pixel art game UI icon, 20×18 px look, a small rolled-open parchment map with a red dotted path and a tiny X mark, warm brown wooden edge, 1-px dark outline, max 12 colors, no text, flat magenta (#FF00FF) background, crisp pixels, matches a Vietnamese folk-tale RPG HUD.

### 5. Bỏ "Sức mạnh … / khuyên …" trong trận (`G.AN_SUC_MANH`)

Chỉ bỏ ở HUD trong ải. Màn chọn ải (Chú Lái Đò), bảng thua ("Sức mạnh … / khuyên dùng …"), thưởng khi cày: không đổi.

### 6. Màn rộng (`G.MAN_RONG`, `?manrong=1`, mặc định TẮT)

**Đánh giá phương án "thấy thêm cảnh":** khung thế giới cố định 480×270 được dùng ở khắp nơi (`G.W`: camera phòng, va chạm, chuyển phòng, vị trí HUD, bảng, bài kiểm tra; canvas thế giới và các bản dựng sẵn của phòng đều 480 rộng). Phòng là ô kín có tường — ngoài tường chỉ là nền ngoài, không có lối chơi. Mở rộng thật phải đổi kích thước canvas + mọi chỗ tính theo 480 → đụng quá nhiều, rủi ro cao cho lợi ích chỉ là thêm nền. **Nên làm phương án nhẹ:**

- Hai dải lề (và trên/dưới khi máy cao như iPad) tô bằng **ảnh nền ngoài phòng của vùng** (`gd-nen-rung/bien/lau/song-ngoai`), **lặp tiếp đúng lưới điểm ảnh của phòng** (không kéo giãn), phủ tối 45% để không tranh với trận. Vẽ trên lớp giao diện, trước mọi chữ / nút. HUD và nút vẫn trong vùng an toàn (lề đệm 16 px / tai thỏ của trang giữ nguyên, phần đó vẫn đen).
- Nhận xét từ ảnh: nhìn liền mạch hơn dải đen, Cu Tí / quái vẫn nổi vì lề tối hơn sàn. Cần chủ game xem trên máy thật rồi quyết định có bật mặc định không.

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,91 MB** / 30; người chơi tải **17,70 MB** / 20 |
| `soat.py` lỗi JS: 5 cảnh (phòng quái có mẹo, ải hướng dẫn, trùm Rừng già, trùm Sông sâu, HUD + chạm bản đồ) × 844×390, 1280×720 × {mặc định, tắt **từng** cờ, tắt hết, `?manrong=1`} — bản một tệp | **0 lỗi JS** (16/16) |
| Như trên, bản web hai tệp (`linh-khi-nhe.html` qua http) | 0 lỗi JS (chỉ dòng `sw.js` 404 của môi trường thử, có từ trước) |
| Tắt hết 5 cờ so bản trước phiên: lớp giao diện, đồng hồ cố định, 5 cảnh × 2 cỡ màn × 2 thời điểm | **0 điểm ảnh khác** |
| Vùng chạm nút (bảng mục 3) | không chồng, 0 điểm sai |
| Tiếng Anh: hộp mẹo hiện câu ngắn tiếng Anh; chạm → hộp ẩn, mẹo kế tiếp hiện | Đạt |
| `tests/smoke.py`, `au_ui.py`, `au_input.py`, `au_onboarding.py`, `au_ne.py`, `au_tu_ngam.py` | 0 lỗi trang / chạy hết. (`doors.py` lỗi `armor` có sẵn từ trước — bản trước phiên lỗi y hệt) |

Công cụ: `chup.py` (ảnh TRƯỚC/SAU), `soat.py` (lỗi JS + so tắt-hết + vùng chạm; cách chạy ghi đầu tệp).

## Chỗ còn yếu / cần chủ game xem

1. Hộp mẹo tự ẩn sau 5 giây — người mới đọc chậm có thể chưa đọc xong lời chỉ dẫn ải đầu. Nếu thấy vội: tăng `MEO_G.giay` trong js/stage.js (chỉ là giờ hiện chữ).
2. Thông báo trùm chỉ hiện chữ 1 giây (đúng tư vấn); câu dài như "Thuồng Luồng ngoạm mảnh trống lớn nhất rồi lặn mất!" khó đọc kịp — sau đó chỉ còn dấu "!".
3. Màn 16:9 không có lề: hộp mẹo lấn mép trái sàn ~20 điểm (mờ khi có ai bên dưới).
4. Ở ải hướng dẫn **khi nút Đặc biệt đã mở** (chỉ xảy ra với `?modan=0` / bản lưu cũ), nhãn "Trảm Nguyệt" trên nút Đặc biệt bị số "×2" của Bình máu (to hơn) đè một phần.
5. Biểu tượng bản đồ hiện là tấm + chữ "Bản đồ" — gen ảnh theo prompt mục 4 cho đẹp hơn.
6. Màn rộng: mới là phương án nhẹ, mặc định tắt; cần xem trên iPhone thật.
