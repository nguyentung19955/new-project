# Rà soát hình vẽ bằng code — 02/11/2026

*Theo mục 1.2 và 7.3 của [sổ tay Last Echo](so-tay/so-tay-last-echo.md). Phiên này chỉ đo và ghi lại, **không sửa mã, không sửa ảnh**.*

## Đo thế nào

Mở **bản game thật một tệp** (dựng từ nhánh `khoi-tao-du-an`, commit `c708bf9`, giữ nguyên mã, chỉ không nén chữ để biết đúng dòng mã) trong trình duyệt không giao diện, cỡ iPhone ngang 844×390 ×3. Bọc các lệnh vẽ hình của canvas (`fillRect`, `strokeRect`, `arc`, `ellipse`, `lineTo`, `fill`, `stroke`, thêm `rect`, `roundRect`, đường cong, `clearRect`) và ghi lại **dòng mã nào gọi**, bao nhiêu lần, vẽ thẳng lên màn hay vẽ vào tấm ẩn (dựng sẵn rồi dán), đang ở cảnh nào.

Cảnh đã đi qua (~110 giây, máy tự chơi, nhân vật bất tử): màn chào → làng (đi 4 hướng) → bản đồ vùng → 12 bảng của người làng (lò rèn, trang bị, thợ may, nhân vật, kỹ năng, cây chưởng, hướng dẫn, cài đặt, sổ yêu quái, thành tựu, việc hôm nay) → 5 thẻ lò rèn (**Luyện**, Mài, Linh khí, Ép đồ, Nâng lò) → **Hành trang** 4 thẻ → **ải Rừng già 1**: phòng đánh 25 giây, tinh anh, rương, suối, thương nhân, bàn thờ, **trùm** (máy hạ được trùm) → tạm dừng → **bản đồ ải** → hành trang trong ải → bảng kết quả. Không có lỗi trang nào.

Công cụ và số liệu gốc: `docs/review/ke-hoach-cai-thien/so-tay-last-echo/cong-cu/` (`hook.js` bọc lệnh vẽ, `run.py` đi cảnh, `map.py` đổi dòng bản gói → dòng mã nguồn, `phanloai.py` phân loại, `ket-qua-ban-that.json`).

> Lưu ý: nếu mở `game/index.html` (bản chưa gói, **không có ảnh AI**) thì quái, phòng, bản đồ đều hiện bằng code (82 chỗ, hơn 600 nghìn lệnh) — đó là đường dự phòng, **không phải** game người chơi thấy. Số dưới đây là của bản thật.

## Kết quả tóm tắt

So với ảnh: trong cùng chuyến đi, game dán **~649 nghìn lần ảnh**; lệnh vẽ hình còn lại **~120 nghìn**, phần lớn là thứ được phép.

| Nhóm | Số dòng mã | Số lệnh vẽ | Nghĩa là |
|---|---|---|---|
| **A — Hình đang hiện bằng code (cần thay ảnh)** | **17** | ~25 nghìn | Đều là **giao diện nhỏ**: lòng/viền ô con, ô nền số bậc, ruột thanh có màu riêng, phần "máu vừa mất" của thanh trùm, ô dấu hệ, vòng chấm trên sàn, dải nền mép trên làng, viền tranh bản đồ vùng, vài nút/biểu tượng bitmap còn thiếu ảnh. **Không còn nhân vật, quái, trùm, phòng, ô phòng bản đồ ải, nút cảm ứng nào vẽ bằng code (bản đồ ải chỉ còn một khung chữ nhật code quanh vùng bản đồ, mục A7).** |
| **C — Dự phòng lúc ảnh chưa giải mã xong** | 3 | ~8,6 nghìn | Cu Tí bằng xương code trong ~1 giây đầu ở màn chào/làng (có thể loé), đom đóm, gạch đồng màn chào. Sổ tay chỉ cho dự phòng khi ảnh **tải lỗi**. |
| **D — Dựng ngầm, không bao giờ hiện** | 6 | ~26 nghìn | Nền làng code (bị ảnh nền che, dựng 2 lần mỗi lần vào làng), hình vũng hệ code dựng trước khi biết có ảnh, vũ khí code chỉ để tính mũi kiếm. Không trái luật hình nhưng **tốn công máy**; nên bỏ. |
| **B — Được phép** | 40 | ~61 nghìn | Ánh sáng, độ tối, bóng, chớp màn, mờ chuyển cảnh, ánh nước, nhuộm màu ảnh, mặt nạ cắt, xoá canvas. |

Những thứ **không đo được bằng cách bọc canvas** (ghi riêng):

- **Ký hiệu chữ làm biểu tượng**: còn ~45 chỗ trong mã dùng ★ ☆ ✓ ✕ ✉ ⚔ 📥 🏆 ✎ 🗑 trong chữ (sổ yêu quái, thành tựu, bảng vàng, kết quả ải, nút "🏆 Bảng vàng", trang góp ý). Sổ tay cấm emoji làm biểu tượng.
- **HTML/CSS**: màn hình tải trước khi game chạy có thanh tiến độ bằng viền CSS (`#lk-tai i`) và khung game có viền 1 điểm (`#stage outline`); trang góp ý của quản trị (`cloud_ui.js`) là HTML có viền màu. Ngoài ra không có nút HTML nào trong game.

## Bảng chi tiết theo dòng mã

Cột "thẳng lên màn / dựng ngầm": số lệnh vẽ trực tiếp lên màn hình / số lệnh vẽ vào tấm ẩn (thường dựng một lần rồi dán lại).

### A — Hình đang hiện bằng code (cần thay ảnh)

| # | Dòng mã | Số lệnh vẽ | Thẳng lên màn / dựng ngầm | Gặp ở | Là gì |
|---|---|---|---|---|---|
| A1 | `ep_do.js:305` | 4409 | 4409 / 0 | lò rèn, Luyện, Mài, Linh khí, Ép đồ, Nâng lò … | Ô nền tối sau số bậc vũ khí (ô vũ khí HUD trong trận, bảng Luyện) |
| A2 | `ui_theme.js:1185` | 4225 | 4225 / 0 | lò rèn, Luyện, Mài, Linh khí, Ép đồ, Nâng lò … | Ruột thanh có màu riêng (thanh tiến độ ô vũ khí trong trận, thanh Luyện) — không dùng ảnh gd-ruot-thanh |
| A3 | `engine.js:677` | 3725 | 3725 / 0 | ải: phòng đánh, ải: rương, ải: trùm, ải: tạm dừng, ải: bản đồ, ải: hành trang … | Hộp chữ nhật tô màu (ui.rect): vạch khắc thanh máu trùm, ô dấu hệ, dải kết quả Luyện, ô gợi ý, khung bản đồ ải; một phần là nền tối bảng (được phép) |
| A4 | `ui_theme.js:80` | 3116 | 0 / 3116 | màn chào, làng, lò rèn, trang bị, thợ may, nhân vật … | Bộ vẽ điểm/khối của giao diện: nút code khi không có ảnh nút đúng tông (vàng/tím/màu riêng), biểu tượng bitmap nhỏ (tài nguyên, trống đồng), vạch khắc thanh; một phần là bóng đổ (được phép) |
| A5 | `ui_theme.js:980` | 2602 | 2602 / 0 | lò rèn, trang bị, thợ may, nhân vật, kỹ năng, cây chưởng … | Lòng ô con (ô kỹ năng, cây chưởng, nhân vật, đồ…) tô màu gỗ bằng code bên trong khung ảnh gd-o-con |
| A6 | `ui_theme.js:989` | 1840 | 1840 / 0 | kỹ năng, cây chưởng | Viền màu hệ / màu chọn quanh ô con (4 vạch) — Cây chưởng, Kỹ năng |
| A7 | `engine.js:678` | 1044 | 1044 / 0 | ải: trùm, ải: bản đồ, ải: kết quả | Viền chữ nhật (ui.rect): ô dấu hệ trên đầu quái/thanh, dải kết quả Luyện, dòng gợi ý, khung vùng bản đồ ải |
| A8 | `village_scene.js:1061` | 1028 | 1028 / 0 | màn chào, làng, lò rèn, trang bị, thợ may, nhân vật … | Dải nền đặc mép trên cảnh làng (sau dải chân dung) |
| A9 | `ui_theme.js:981` | 648 | 648 / 0 | thợ may, nhân vật, kỹ năng, cây chưởng, cài đặt, sổ yêu quái … | Lòng ô con tô màu riêng (o.fill) bằng code |
| A10 | `room_art.js:56` | 623 | 0 / 623 | làng, ải: phòng đánh, ải: tinh anh, ải: rương, ải: suối, ải: thương nhân … | Dấu vòng chấm trên sàn theo loại phòng (ringMark, 64 chấm) + dải sáng ở cửa (phần này là ánh sáng) |
| A11 | `ui_theme.js:1236` | 583 | 583 / 0 | ải: trùm | Thanh máu trùm: phần "máu vừa mất" tô vàng bằng code |
| A12 | `ui_theme.js:1237` | 583 | 583 / 0 | ải: trùm | Thanh máu trùm: vạch trắng trên phần máu vừa mất |
| A13 | `ui_theme.js:985` | 472 | 472 / 0 | lò rèn, Luyện, Mài, Linh khí, Ép đồ, Nâng lò | Nét vàng sáng bên trong ô đang chọn (4 vạch) |
| A14 | `ui_theme.js:1248` | 276 | 276 / 0 | ải: trùm | Thanh máu trùm: chớp trắng khi trúng (khi không dán được ảnh) |
| A15 | `stage.js:1217` | 42 | 42 / 0 | ải: phòng đánh | Thanh máu quái nhỏ: tô đỏ bằng code khi ảnh gd-mau-quai-nho không dán được (chỗ hở dự phòng) |
| A16 | `stage.js:1218` | 42 | 42 / 0 | ải: phòng đánh | Thanh máu quái nhỏ: vạch sáng (như trên) |
| A17 | `village_scene.js:1295` | 3 | 0 / 3 | làng | Viền 3 nét quanh tranh bản đồ vùng (bảng Chú Lái Đò) — khung bằng code |

### C — Dự phòng lúc ảnh chưa giải mã xong

| # | Dòng mã | Số lệnh vẽ | Thẳng lên màn / dựng ngầm | Gặp ở | Là gì |
|---|---|---|---|---|---|
| C1 | `hero_tinhlinh.js:158` | 8604 | 0 / 8604 | màn chào, làng, kỹ năng | Dựng Cu Tí bằng code (xương em bé) khi ảnh Cu Tí chưa giải mã xong — 1 giây đầu ở màn chào / làng; có thể loé hình code |
| C2 | `village_scene.js:1127` | 22 | 22 / 0 | lúc mở game | Đom đóm làng bằng code — chỉ lúc ảnh hu-moi-truong-rung-domdom chưa có (lúc mở game) |
| C3 | `village.js:1005` | 2 | 2 / 0 | lúc mở game | Gạch đồng hai bên chữ SPIRITBLADE ở màn chào — chỉ khi thiếu ảnh gd-bia-gach (chạy 2 lần lúc ảnh chưa giải mã) |

### D — Dựng ngầm, không hiện (nên bỏ cho nhẹ máy)

| # | Dòng mã | Số lệnh vẽ | Thẳng lên màn / dựng ngầm | Gặp ở | Là gì |
|---|---|---|---|---|---|
| D1 | `village_scene.js:19` | 25144 | 124 / 25020 | lúc mở game | Dựng nền làng bằng code (cỏ, đường, hàng rào) lúc vào làng — bị ảnh gd-lang-nen che, không hiện; dựng 2 lần |
| D2 | `weapon_art.js:266` | 567 | 0 / 567 | ải: phòng đánh | Dựng vũ khí bằng code chỉ để tính mũi kiếm cho vệt chém — không hiện ra |
| D3 | `fx_he.js:478` | 104 | 0 / 104 | ải: phòng đánh | Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện |
| D4 | `fx_he.js:474` | 60 | 0 / 60 | ải: phòng đánh | Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện |
| D5 | `fx_he.js:475` | 48 | 0 / 48 | ải: phòng đánh | Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện |
| D6 | `fx_he.js:477` | 8 | 0 / 8 | ải: phòng đánh | Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện |

### B — Được phép giữ (ánh sáng, độ tối, hạt, mờ, nhuộm, mặt nạ, xoá)

| # | Dòng mã | Số lệnh vẽ | Thẳng lên màn / dựng ngầm | Gặp ở | Là gì |
|---|---|---|---|---|---|
| B1 | `village_scene.js:16` | 30201 | 20532 / 9669 | màn chào, làng, lò rèn, trang bị, thợ may, nhân vật … | Vệt nước trôi trên sông, ánh đèn đò in xuống nước, nước lấp lánh (mỗi khung) + một phần dựng nền làng ngầm (không hiện) |
| B2 | `village_scene.js:1188` | 7182 | 7182 / 0 | màn chào, làng, lò rèn, trang bị, thợ may, nhân vật … | Hình tròn làm mặt nạ cắt chân dung NPC (clip), không tô |
| B3 | `engine.js:629` | 5122 | 5122 / 0 | màn chào, làng, bản đồ vùng, lò rèn, trang bị, thợ may … | Xoá lớp giao diện mỗi khung |
| B4 | `zed_moi.js:1402` | 4199 | 0 / 4199 | làng, ải: phòng đánh, ải: tinh anh, ải: rương, ải: suối, ải: thương nhân … | Xoá canvas phụ dựng Cu Tí |
| B5 | `zed_moi.js:1410` | 3753 | 0 / 3753 | làng, ải: phòng đánh, ải: tinh anh, ải: rương, ải: suối, ải: thương nhân … | Xoá canvas phụ |
| B6 | `do_roi.js:122` | 2910 | 2910 / 0 | ải: trùm, ải: tạm dừng, ải: bản đồ, ải: hành trang, ải: kết quả | Bóng elip dưới đồ rơi (độ tối) |
| B7 | `do_roi.js:126` | 2910 | 2910 / 0 | ải: trùm, ải: tạm dừng, ải: bản đồ, ải: hành trang, ải: kết quả | Ánh elip dưới đồ rơi theo màu bậc (ánh sáng) |
| B8 | `bia.js:119` | 1275 | 1275 / 0 | màn chào | Ánh nước lấp lánh trên ảnh bìa |
| B9 | `village_scene.js:1130` | 627 | 627 / 0 | lò rèn, trang bị, thợ may, nhân vật, kỹ năng, cây chưởng … | Phủ tối cảnh làng khi mở bảng |
| B10 | `fx.js:2955` | 474 | 474 / 0 | ải: trùm, ải: tạm dừng, ải: bản đồ, ải: hành trang, ải: kết quả | Chớp sáng cả màn khi trúng đòn mạnh |
| B11 | `fx_anh.js:98` | 357 | 357 / 0 | ải: phòng đánh, ải: suối, ải: thương nhân | Bóng dưới bom/đá bay (mobs.js:602) + mờ đen chuyển phòng (stage.js:1168) |
| B12 | `village.js:556` | 342 | 342 / 0 | thợ may, nhân vật, cài đặt, sổ yêu quái, thành tựu | Mặt nạ cắt (clip) ô chân dung ba bạn |
| B13 | `bia.js:144` | 154 | 154 / 0 | màn chào | Quầng tối dịu sau chữ LINH KHÍ (dải màu) |
| B14 | `bia.js:150` | 154 | 154 / 0 | màn chào | Quầng tối (dải màu) |
| B15 | `bia.js:154` | 154 | 154 / 0 | màn chào | Quầng (dải màu) |
| B16 | `bia.js:157` | 154 | 154 / 0 | màn chào | Quầng (dải màu) |
| B17 | `hanh_trang.js:57` | 119 | 119 / 0 | Nâng lò, hành trang, ải: bản đồ, ải: hành trang | Mặt nạ cắt vùng chữ cuộn |
| B18 | `village.js:533` | 114 | 114 / 0 | thợ may, nhân vật, cài đặt, sổ yêu quái, thành tựu | Mặt nạ cắt chân dung Cu Tí |
| B19 | `sprite_custom.js:359` | 89 | 0 / 89 | ải: phòng đánh, ải: tinh anh, ải: trùm | Nhuộm ảnh quái (chớp trắng / đỏ) bằng source-in |
| B20 | `village_scene.js:354` | 83 | 0 / 83 | làng | Tô viền tối quanh hình (source-in) lúc dựng |
| B21 | `bao_truoc.js:767` | 80 | 0 / 80 | ải: trùm | Cắt lát ảnh quạt báo trước (clip) |
| B22 | `art.js:23` | 77 | 0 / 77 | làng, ải: phòng đánh, ải: tinh anh, ải: suối, ải: thương nhân, ải: trùm | Quầng sáng/tối elip trong phòng (glow) |
| B23 | `room_art.js:70` | 77 | 0 / 77 | làng, ải: phòng đánh, ải: tinh anh, ải: rương, ải: suối, ải: thương nhân … | Mặt nạ cắt khi lát ảnh tường/sàn |
| B24 | `village_scene.js:364` | 57 | 0 / 57 | lúc mở game | Xoá canvas |
| B25 | `hanh_trang.js:74` | 28 | 28 / 0 | Nâng lò, hành trang | Dải tối dưới chân dung (độ tối) |
| B26 | `hanh_trang.js:75` | 28 | 28 / 0 | Nâng lò, hành trang | Mặt nạ cắt |
| B27 | `fx_he_moi.js:110` | 24 | 0 / 24 | ải: phòng đánh | Xoá canvas |
| B28 | `chuong_ui.js:82` | 23 | 23 / 0 | kỹ năng, cây chưởng | Phủ màu hệ 12% lên cột cây chưởng đang chọn |
| B29 | `fx.js:1972` | 6 | 0 / 6 | ải: phòng đánh | Xoá canvas |
| B30 | `ui_theme.js:641` | 4 | 0 / 4 | lúc mở game | Xoá canvas |
| B31 | `do_roi.js:22` | 3 | 0 / 3 | ải: trùm | Tô màu ảnh (source-in) |
| B32 | `bao_truoc.js:671` | 2 | 0 / 2 | ải: tinh anh, ải: trùm | Phủ màu lên ảnh báo trước |
| B33 | `engine.js:766` | 2 | 0 / 2 | hành trang, ải: rương | Xoá canvas chuyển màn |
| B34 | `engine.js:820` | 2 | 0 / 2 | màn chào, làng | Nền đen chuyển màn |
| B35 | `engine.js:838` | 2 | 2 / 0 | màn chào, làng | Mờ màn chuyển cảnh |
| B36 | `engine.js:839` | 1 | 1 / 0 | làng | Mờ đen khi chuyển màn |
| B37 | `hinh_thai.js:87` | 1 | 0 / 1 | lò rèn | Tô màu ảnh (source-in) |
| B38 | `ui_theme.js:1002` | 1 | 0 / 1 | ải: phòng đánh | Tô màu ảnh (source-in) |
| B39 | `village.js:994` | 1 | 1 / 0 | lúc mở game | Mặt nạ cắt vệt sáng chữ logo |
| B40 | `village_scene.js:440` | 1 | 0 / 1 | lúc mở game | Nền trơn một màu chờ ảnh nền làng (dựng 1 lần, bị ảnh che) |

## Gợi ý xử lý (chi tiết trong kế hoạch)

- **A1, A2, A5, A6, A9, A13** (ô con, ô số bậc, ruột thanh màu riêng): xin ChatGPT một tấm "lòng ô" (gỗ tối, trơn, co giãn 9 mảnh), một tấm "viền chọn" theo 5 màu hệ, một "nhãn số bậc" nhỏ, và "ruột thanh" theo màu (vàng tiến độ, xanh hệ…). Toàn bộ là việc **giao diện, không đổi cảm giác chơi**.
- **A3, A7** (`ui.rect` dùng chung): soát từng chỗ gọi — nền tối bảng (được phép) giữ; ô dấu hệ, dải kết quả Luyện, dòng gợi ý, khung vùng bản đồ ải đổi sang khung ảnh 9 mảnh có sẵn (`gd-o-con`, `gd-khung-ban-do`).
- **A11, A12, A14, A18, A19** (thanh máu trùm / quái): có sẵn ảnh `gd-ruot-thanh`, `gd-mau-quai-nho`; cần ảnh "máu vừa mất" cho thanh trùm và sửa chỗ hở dự phòng của thanh quái nhỏ.
- **A4**: thêm ảnh nút tông vàng / tím / màu riêng và vài biểu tượng bitmap còn sót (tài nguyên, mặt trống).
- **A8, A10, A21**: dải nền mép trên làng, vòng chấm trên sàn theo loại phòng, viền tranh bản đồ vùng → ảnh.
- **C**: đổi đường dự phòng thành "chưa có ảnh thì chưa vẽ / hiện bóng mờ", chỉ vẽ code khi ảnh **tải lỗi** (đúng luật sổ tay).
- **D**: bỏ dựng ngầm (nền làng code, vũng code, vũ khí code chỉ để tính mũi kiếm) — vừa đúng luật vừa nhẹ máy.
- Ký hiệu ★ ✓ ✕ ✉ ⚔ 🏆…: xin một tấm biểu tượng nhỏ.
