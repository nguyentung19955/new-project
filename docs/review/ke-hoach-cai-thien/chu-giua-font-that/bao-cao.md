# Báo cáo: chữ nằm giữa nút theo phông thật (chu-giua-font-that, 17/10)

Chủ game báo (ảnh iPhone thật `anh-chu-game-iphone.png`, Hành trang → Kỹ năng → Cây kỹ năng): thẻ **Nhân vật / Vũ khí / Kỹ năng /
Tài nguyên**, **Cây kỹ năng / Cây chưởng**, **✕ Xong**, các nút **Học**, tiêu đề ô **Công 2/5 · Thủ 0/5 · Hệ 0/5** bị lệch.

## Tóm tắt (đọc phần này là đủ)

- **Đã sửa tận gốc cách đặt chữ.** Mọi nút / thẻ / tiêu đề ô / nhãn đi qua hàm đặt chữ chung của game nay được căn theo **hộp mực thật**
  của đúng chuỗi chữ, đúng phông đang dùng: **dọc** theo *thân chữ* (đỉnh chữ đã bỏ dấu → chân dòng), **ngang** theo mực thật (không theo bề
  rộng bước chữ). Dấu tiếng Việt (ơ ư ặ ỹ…) và chân chữ (y, g) được phép đi vào phần đệm, nên **chữ không còn bị thu nhỏ rồi đẩy lên** như
  trong ảnh iPhone.
- **Số đo chắc ở mọi trình duyệt**: chữ được đo **một lần ở cỡ lớn (64 px)** rồi chia tỉ lệ (Safari làm tròn số đo lên số nguyên → trước đây sai tới
  1 điểm ở cỡ chữ 6,5–10). Mỗi lần phông đổi, game **tự kiểm** số đo của trình duyệt bằng cách quét điểm ảnh chữ mẫu; lệch quá 3 % thì chuyển
  hẳn sang đo bằng quét điểm ảnh.
- **Phông về muộn**: game theo dõi trạng thái phông (không chỉ chờ sự kiện — Safari có khi không báo). Phông vừa nạp xong là **xoá mọi số đo / chỗ đặt
  chữ đã nhớ** và đặt lại ở khung hình sau. Đã thử: phông về muộn mà trình duyệt không báo → bản cũ giữ chỗ đặt sai (lệch 0,5 điểm, sai cỡ), bản mới
  ra đúng y như mở từ đầu.
- **Kết quả soát toàn bộ** (39 màn × VI/EN × 3 cỡ màn, ngưỡng **0,5 điểm**): với phông thay gần nhất (Inter) và phông dự phòng kiểu iPhone
  (Liberation Sans = cùng số đo Helvetica): **0 chữ lệch quá 0,5** (trước: 112–171 chữ, lệch tới 3,8 điểm dọc / 3,3 điểm ngang). Lệch lớn nhất còn
  0,44 dọc, 0,37 ngang. Giả lập hai kiểu số đo sai của Safari: **0**. Bảng đầy đủ ở dưới.
- **Chưa làm được phần "phông thật"**: máy thử **không tải được Be Vietnam Pro** — mạng của phiên này chặn npm, Google Fonts, jsDelivr, unpkg,
  GitHub raw, PyPI (đã thử từng nơi, đều bị từ chối). Vì vậy **không thể chụp bằng đúng phông thật, và chưa nhúng phông vào game**. Thay vào đó
  soát bằng 4 phông khác nhau (có Poppins — dấu và chân chữ rất cao, lặp lại được một phần lỗi trong ảnh iPhone) + 2 giả lập Safari + không phông.
  Cách sửa không dựa vào số đo của một phông cụ thể nào, nên phông thật cũng được đo và căn y như vậy trên máy chủ game.
- **Cờ quay lui `?chufont=0`**: về đúng cách trước phiên (đã so 1 023 chữ VI + 1 042 chữ EN: vị trí và cỡ trùng khít bản trước phiên; chỉ khác vài chữ
  có nội dung đổi theo ngày như việc hôm nay, số phiên bản).
- Không đổi luật, số liệu, hình khung. Không đụng đăng nhập Google / lưu mây / `?cloud=0`. Bản một tệp **29,89 MB** sau khi gộp với các phiên khác đẩy lên cùng lúc (trần 30; phần mã của phiên này ~15 KB), web người chơi tải đầu **19,51 MB** (trần 20, không đổi; đo trước khi gộp).

## Đúng những chỗ chủ game chỉ ra (Hành trang → Kỹ năng, 844×390, phông Inter)

Lệch tâm tính bằng điểm game; dọc âm = chữ **cao hơn** tâm, ngang âm = lệch trái. Cỡ = cỡ chữ thật đã vẽ.

| Chữ | Trước: dọc / ngang (cỡ) | Sau: dọc / ngang (cỡ) |
|---|---|---|
| ✕ Xong | −0,57 / −0,45 (7) | −0,29 / −0,02 (7,5) |
| Nhân vật | −0,75 / −0,85 (7,5) | −0,18 / −0,05 (8) |
| Vũ khí | −0,06 / −0,71 (8) | 0,06 / −0,05 (8) |
| Kỹ năng | −0,76 / 0 (7,5) | −0,05 / 0,02 (8) |
| Tài nguyên | −0,87 / −1,15 (7,5) | −0,17 / −0,08 (8) |
| Cây kỹ năng | −0,94 / −0,16 (6,5) | −0,31 / 0,04 (7) |
| Cây chưởng (8) | −0,69 / −0,91 (6,5) | −0,26 / 0,21 (6,5) |
| Học (3 nút) | −0,88 / −0,33 (6,5) | −0,23 / −0,06 (6,5) |
| Công 2/5 · Thủ 0/5 · Hệ 0/5 (căn trái) | 0,25 dọc (8,5) | 0 dọc (8,5) |

Bốn thẻ trên giờ cùng một cỡ 8 (trước 7,5 / 8 lẫn lộn — đúng điều thấy trong ảnh iPhone, nơi "Kỹ năng" to hơn ba thẻ kia).
Trên phông thật độ lệch trước phiên lớn hơn số ở bảng (dấu, chân chữ cao hơn Inter) — xem ảnh so sánh.

## Vì sao ảnh iPhone lệch (nguyên nhân tìm được)

1. **Cách đặt cũ ép cả dấu và chân chữ cách viền 2 điểm.** Nút thấp (Học cao 14, thẻ cao 16–19) không đủ chỗ cho chữ có dấu ở trên (â, ỹ) *và*
   ở dưới (ậ, ọ, chân y g) → game thu chữ nhỏ 1 cỡ rồi **đẩy cả chữ lên** cho chân chữ khỏi chạm đáy. Phông thật (Be Vietnam Pro) có dấu và chân chữ
   cao hơn phông thử của phiên trước (Inter) nên trên iPhone chữ nhỏ đi và lệch lên — đúng như ảnh: "Nhân vật", "Vũ khí", "Tài nguyên" nhỏ hơn
   "Kỹ năng", "Học" và "Cây chưởng" sát mép trên. Phiên trước đo bằng Inter nên không thấy.
2. **Số đo hộp chữ ở cỡ nhỏ không đáng tin giữa trình duyệt**: Safari làm tròn lên số nguyên (ở cỡ 7 px, 1 px = 1 điểm game).
3. **Phông về muộn**: game nhớ chỗ đặt chữ tính bằng phông dự phòng; chỉ xoá khi trình duyệt báo "nạp xong" — không báo thì giữ sai cả phiên.

`anh/so-sanh-anh-iphone.jpg`: hàng trên ảnh chủ game, giữa là máy thử TRƯỚC với phông Poppins (lặp lại một phần: "Học", "Cây chưởng" lệch lên,
"Cây kỹ năng" nhỏ đi), dưới là SAU.

## Đã sửa

`js/ui_theme.js` (hàm đặt chữ chung `T.datChu` / `T.chuTrongKhung`, dùng cho mọi nút, thẻ, ô, tấm, hộp thoại):
- `T.hopMuc(chuỗi, đậm)`: hộp mực thật theo em (trái / phải / trên / dưới + **đỉnh thân chữ** của chuỗi đã bỏ dấu), đo ở 64 px; tự kiểm bằng quét
  điểm ảnh mỗi đời phông; nhớ đệm, xoá khi phông đổi.
- Căn dọc: thân chữ đúng tâm lòng khung; mực (kể cả dấu) chỉ cần nằm trong lòng. Không vừa → nhỏ 1 cỡ → (vẫn lệch quá 0,4) nhỏ tới cỡ tối thiểu →
  cuối cùng mới dịch ít nhất có thể.
- Căn ngang: tâm mực = tâm lòng (lấy trung bình các hàng thân chữ, không nhảy cóc khi chạm núm / hoa văn góc). Chữ dài chạm hoa văn hai đầu → nhỏ
  dần / đệm hẹp dần trước khi lệch tâm.
- Theo dõi phông: `loadingdone` + `document.fonts.ready` + dò trạng thái phông mỗi 0,4 giây (20 giây đầu) rồi mỗi 3 giây; đổi → xoá số đo, chỗ đặt
  chữ, cao chữ hoa đã nhớ.
- Số trên thanh máu / mana: đường chân dòng theo thân chữ thật (trước: cố định +2,6 — lệch ~1 điểm với phông chữ số cao).

Nơi gọi tự đặt chữ (theo cờ):
| Chỗ | Trước (Inter) | Sau |
|---|---|---|
| Tạm dừng: nút "Hành trang (xem)" | chữ giữa, túi lệch trái → cả cụm lệch | tâm chữ = tâm nút + 8,5 → cụm túi + chữ đúng giữa |
| Làng: tấm "Hành trang" (túi trên, chữ dưới) | cụm cao hơn tâm 0,8–1,25 | cụm đúng tâm 2 chiều, tránh đinh góc dưới |
| Trong ải: tấm "Bản đồ" (khi chưa có ảnh biểu tượng) | chữ cao hơn tâm 3,75 | chữ + dòng số cổng là một khối giữa tấm |
| `engine.js` | — | công khai họ phông `ui.FONT` cho phần đo |

## Số đo trước → sau

"Chữ soát tâm" = chữ trong khung nhãn (cao ≤ 40) có kiểm tâm dọc và / hoặc ngang. Trước = `?chufont=0`. Ngưỡng 0,5 điểm game.
"Cố ý" = 90 chữ có bố cục riêng, không nằm giữa *cả* khung (xem mục dưới) — không tính.

| Phông thay | Cỡ màn | Ngôn ngữ | Chữ soát | Lệch > 0,5: trước → **sau** | Lệch dọc lớn nhất | Lệch ngang lớn nhất |
|---|---|---|---|---|---|---|
| Inter (gần Be Vietnam Pro) | 844×390, 667×375, 1280×720 | VI | 381 | 152 → **0** | 3,75 → **0,44** | 1,89 → **0,37** |
| Inter | 844×390, 667×375, 1280×720 | EN | 393 | 133 → **0** | 3,75 → **0,38** | 1,83 → **0,32** |
| Liberation Sans (số đo Helvetica, dự phòng iPhone) | 3 cỡ | VI | 381 | 171 → **0** | 3,75 → **0,38** | 3,30 → **0,37** |
| Liberation Sans | 3 cỡ | EN | 389 | 112 → **2** | 3,58 → 0,54 | 3,31 → **0,33** |
| Không có phông (trình duyệt tự chọn) | 844×390 | VI / EN | 381 / 393 | 152 / 133 → **0 / 0** | 3,75 → 0,44 | 1,89 → 0,37 |
| Inter + giả lập Safari (làm tròn số đo) | 844×390 | VI / EN | 381 / 393 | 154 / 134 → **0 / 0** | 3,75 → 0,44 | 1,89 → 0,39 |
| Inter + giả lập Safari (số đo = hộp phông) | 844×390 | VI / EN | 381 / 393 | 143 / 150 → **0 / 0** | 3,75 → 0,44 | 1,94 → 0,37 |
| Poppins (dấu, chân chữ rất cao) | 844×390 | VI / EN | 382 / 397 | 157 / 176 → **3 / 0** | 3,81 → 0,63 | 1,94 → 0,34 |
| DejaVu Sans (rất rộng) | 844×390 | VI / EN | 382 / 399 | 130 / 132 → **0 / 2** | 3,87 → 0,50 | 2,10 → 1,37 |

Ba cỡ màn ra cùng số (game vẽ theo điểm game, cỡ màn chỉ phóng to). Còn lại quá 0,5 (đều ở phông cực đoan, không phải phông game):
- Poppins: "Cây chưởng (8)" lệch dọc 0,63 — ở cỡ nhỏ nhất (6,5) mà chữ Poppins vẫn cao hơn lòng thẻ 16 điểm.
- Liberation EN: "✓ In use" 0,54 (dấu ✓ lấy từ phông khác).
- DejaVu EN: "Normal · Hang biển" lệch ngang 1,37 — chữ quá rộng cho nút ở cỡ nhỏ nhất.

**Chạm viền** (mực cách mép lòng < 0,25, vẫn ở trong lòng): Inter VI 7 → 23, EN 0 → 18. Đây là đánh đổi có chủ ý: để thân chữ đúng giữa, dấu
trên (Ả, ằ) / dấu dưới (ọ) của chữ trong nút rất thấp (Học 14, Ải ngày 18, Sổ 17, thẻ Yếu Băng 13) được đi sát mép lòng thay vì đẩy cả chữ lệch tâm.
**Tràn** không đổi (chỉ còn các chỗ cố ý của phiên trước: tiêu đề bản đồ ải, nhãn dải nút làng).

## Chỗ cố ý / chưa sửa

| Chỗ | Vì sao |
|---|---|
| Ô cây chưởng (Cụ Đồ, Hành trang): tên ở trên, chấm bậc / "cần N" / "+" ở dưới hoặc bên phải | bố cục hai tầng có chủ ý trong ô 14–18 điểm; khối chữ + chấm lệch 0,5–0,7 so với tâm cả ô (không đủ chỗ cho khối giữa) |
| Dải nút làng (Vào ải, Lò rèn…) | mỗi nhãn nằm giữa biểu tượng của nó, không giữa cả dải |
| Sổ yêu quái: dấu "?" | nằm giữa phần hình quái (trên hàng sao), không giữa cả ô |
| "Chạm để bắt đầu" | dải phóng to / thu nhỏ khi chụp |
| Hộp thoại đăng nhập / lưu mây / góp ý | là khung HTML (CSS), không vẽ trên canvas; không đụng theo quy tắc |

**Phát hiện thêm (chưa sửa, ngoài phạm vi):** bản tiếng Anh dịch "Cây chưởng" thành **"Palm tree"** (cây cọ) và "Ba cây chưởng" thành "Three Palm
trees" (`js/ngon_ngu_en.js` dòng 352, 68). Nên đổi thành ví dụ "Palm skills" — báo để chủ game quyết.

## Nhúng phông vào game (cân nhắc — chưa làm)

- Nên làm: máy nào cũng cùng một phông ngay từ khung hình đầu, không phụ thuộc Google, không có lúc vẽ bằng phông dự phòng.
- Không làm được ở phiên này vì **không lấy được tệp phông** (mạng chặn). Cách sửa ở trên đã đủ để chữ đúng giữa cả khi phông về muộn.
- Ước tính: 4 tệp woff2 (Việt + Latin, nét 500 và 700) ≈ 60 KB, nhúng dạng base64 ≈ 80 KB. **Bản một tệp đang 29,89 / 30 MB** — còn ~110 KB, đủ nhưng sát; nên bớt
  ≈ 80 KB chỗ khác (ví dụ nén lại một ảnh truyện) trước khi nhúng. Web tải đầu thêm ≈ 60 KB (19,5 → ~19,6 MB, dưới trần 20).
- Muốn làm ở phiên sau: chủ game (hoặc phiên có mạng tới npm / Google Fonts) lấy 4 tệp `be-vietnam-pro-{vietnamese,latin}-{500,700}-normal.woff2`
  (gói npm `@fontsource/be-vietnam-pro`), đặt vào `game/art/font/`; phiên sau thêm `@font-face` nhúng trong `build.py` và chạy lại công cụ soát này.

## Cách soát

Công cụ `cong-cu/do-chu-giua.py` (Chromium không màn hình, **không chơi thử**; dựa trên công cụ phiên can-chu-khung): dựng từng màn bằng bản lưu
thử, vẽ một khung hình, đo mọi chữ trong khung. Khác phiên trước:
- **Hộp mực đo bằng quét điểm ảnh** ở 64 px (không dùng số đo của trình duyệt, không dùng mã game).
- **Tâm dọc** = tâm thân chữ (đỉnh chữ đã bỏ dấu → chân dòng, cả khối nhiều dòng / biểu tượng xếp trên dưới); **tâm ngang** = tâm mực (cả cụm
  biểu tượng + chữ nếu có). Tâm lòng khung = trung bình các hàng ở vùng thân chữ. **Ngưỡng 0,5 điểm** (phiên trước 2).
- Biến: `PHONG=inter|poppins|liberation|dejavu|none`, `SAFARI=<tệp giả lập>` (`gia-lap-safari-tron.js`: làm tròn lên số nguyên;
  `gia-lap-safari-hop-phong.js`: trả hộp phông thay hộp mực), `NGUONG=0.5`, `DPR=2`, `MODE=cu,moi` (cu = `?chufont=0`), `CO`, `LANG_DO`, `CANH`.
- `cong-cu/tong-hop.py <thư mục>`: bảng số ở trên (`--chi-tiet`: từng chữ lệch). `cong-cu/anh-truoc-sau.py`: ghép ảnh.
- 39 màn = 37 màn của phiên trước + **Hành trang → Kỹ năng (Cây kỹ năng)** và **Hành trang → Cây chưởng**.

## Ảnh

`anh/` — mỗi ảnh hai tầng **TRƯỚC (?chufont=0)** trên / **SAU** dưới, 844×390 phóng ×2, tiếng Việt:
- `so-sanh-anh-iphone.jpg` — ảnh chủ game đặt cạnh máy thử.
- `hanh-trang-ky-nang-poppins.jpg`, `hanh-trang-ky-nang-inter.jpg` — đúng màn trong ảnh iPhone.
- `cai-dat-poppins.jpg`, `tam-dung-poppins.jpg`, `lo-ren-mai-poppins.jpg`, `cu-do-chuong-poppins.jpg`, `lai-do-poppins.jpg`,
  `viec-hom-nay-poppins.jpg`, `tran-hud-poppins.jpg` — các màn nhiều nút.

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt. `python3 game/build.py`: đạt (một tệp 29,89 / 30 MB sau khi gộp). `--hai-tep`: đạt (người chơi tải 19,51 / 20 MB, trang chính nén 1,35 / 1,50 MB).
- `tests/cloud_save_regression.test.js`: đạt. `tests/chuong.py` phần giao diện (phone 22/22, port 22/22): đạt; phần luật 47/50 — 3 mục hỏng
  y như bản trước phiên (đã chạy lại trên bản trước phiên để so; không liên quan đặt chữ).
- Phông về muộn + trình duyệt không báo `loadingdone`: bản mới tự đặt lại (giống hệt mở từ đầu); `?chufont=0` giữ chỗ đặt cũ như trước phiên.
- `?chufont=0`: 1 023 / 1 042 chữ trùng vị trí và cỡ với bản trước phiên.
- Sau khi gộp với 2 phiên khác (Bình máu, màu bậc) và dựng lại: soát lại 39 màn VI/EN 844×390 bằng Inter — vẫn 0 chữ lệch > 0,5, 0 lỗi trang.
- Không chơi thử game.
