# Nét cao: hiệu ứng + giao diện (17/10)

Tiếp phần máy của phiên **Nét cao** ([../net-cao/bao-cao.md](../net-cao/bao-cao.md)): khi bật `?netcao=3` / `?netcao=4` (hoặc cài đặt Độ nét **"Rất cao"** của Anh Mõ, bản web), ngoài Cu Tí thì nay **hiệu ứng** (chém, nổ, phép, chưởng, đạn, vũng, hạt…) và **giao diện** (thẻ ải, khung bảng, biểu tượng việc / huy hiệu / phúc lành, đai thông báo…) cũng có ảnh dựng lại từ ảnh gốc AI ở 3 và 4 điểm ảnh mỗi điểm game.

**Mặc định (không bật cờ) game y hệt trước**: đã so 24 ảnh chụp (bản một tệp + bản web, 2 cỡ màn, đứng + chém) → **0 điểm ảnh khác**. Không chơi thử bằng tay; mọi ảnh dựng bằng lệnh, chụp headless. Không đổi luật chơi, số liệu, vùng trúng, khung, neo. Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## Tóm tắt

| | |
|---|---|
| Thuộc phiên này | 436 ảnh: 207 hiệu ứng `hu-*` (trừ vệt kiếm nặng của phiên máy), 215 giao diện `gd-*` (trừ nền / sàn / cửa / làng / trang trí phòng của phiên nền), 14 vật phẩm rơi `vp-*` |
| **Đã có bản nét 3 + nét 4** | **209 ảnh** (107 hiệu ứng, 102 giao diện) — xem `danh-sach.json` mục `co` |
| Dung lượng ảnh nét cao (bản web, tệp riêng, tải lười) | phần của phiên này **nét 3: 5,14 MB · nét 4: 8,36 MB**; cả game (Cu Tí + nền + phiên này) nét 3 6,93 MB · nét 4 11,34 MB. Mỗi người chỉ tải một bậc, và chỉ ảnh nào thật sự hiện ra |
| Bản một tệp | **29,88 MB** (≤ 30) — không chứa ảnh nét cao, chỉ thêm ~3 KB mã |
| Bản web tải đầu | **17,69 MB** (≤ 20, như trước) |
| Lỗi JS (headless) | **0** ở mặc định / nét 3 / nét 4, bản một tệp và bản web, 844×390 và 1280×720 (chỉ còn dòng mạng của môi trường thử: font Google bị chặn, `sw.js` 404 — có cả ở bản trước) |
| Chưa làm được | 227 ảnh: 184 **thiếu ảnh gốc**, 24 ảnh giao diện **đã sửa tay sau khi dựng** (không còn khớp ảnh gốc), 6 nút vũ khí **ghép từ ảnh vũ khí trong game**, 4 hình báo trước (đã to sẵn), 9 có quá ít khung khớp |

## 1. Làm thế nào (không vẽ lại, không phóng to)

Mỗi ảnh hiệu ứng / giao diện trong game được một công cụ cũ dựng từ ảnh gốc AI to (cắt nền, đặt vào khung, **thu nhỏ** về cỡ game). Phiên này:

1. **Chạy lại đúng công cụ cũ** (20 công cụ: `cat_dot_3.py`, `dung-gop.py`, `cat-gd.py`, `cat_buoc_2.py`, `dung-hieu-ung-trum.py`…) nhưng **chặn mọi lệnh ghi tệp** (chuyển vào thư mục nháp) và **bắt mọi lệnh thu nhỏ** (ảnh to trước khi thu + cỡ ra) — `cong-cu/chay_lai.py`. Công cụ thu bằng PIL, thu từng kênh, hay thu "điểm giữa ô" bằng numpy đều bắt được.
2. Với **từng khung** của ảnh đang dùng: tìm lệnh thu nào cho ra **đúng mặt nạ khung đó** (so điểm đục, cho phép dán lệch) — khớp ≥ 0,97 thì biết chính xác vùng ảnh to ứng với khung. Đa số khớp **1,000** (trùng từng điểm).
3. **Dựng lại khung đó ở nét 3 và nét 4** từ đúng vùng ảnh to bằng cách thu nét của do-net (`do-net/cong-cu/thu_net.py`: mỗi điểm một màu có thật, không pha), đúng ngưỡng đục công cụ cũ đã dùng; ảnh nhiều nấc trong suốt (quầng sáng, bóng) giữ đúng các nấc cũ — `cong-cu/dung_net_cao.py`. Khung, điểm neo, số khung, thời gian: **không đổi** (chỉ thêm mục ảnh).
4. Công cụ cũ đã **đổi màu sau khi thu** (đổi trắng → xám để game tự nhuộm theo hệ, khử viền xanh lục, giảm màu): mỗi điểm mới lấy **màu gần nhất trong các màu của ô cũ tương ứng** → màu y như ảnh đang dùng, chi tiết lấy từ ảnh gốc. Điểm ám nền xanh lục ở mép bị thay / bỏ.
5. Ảnh **không còn công cụ** chạy được: dò ngược trong kho ảnh gốc (`cong-cu/tim_goc.py`, 445 ảnh, 14 084 vật thể), chỉ nhận ảnh gốc thật (không nhận ảnh chụp / ảnh xuất mẫu) khớp mặt nạ ≥ 0,97 **và** màu lệch ≤ 25 → thêm 10 ảnh giao diện (thẻ ải, thẻ trùm, đai thông báo, khung cảnh báo, thanh cuộn, thẻ nhỏ) — `cong-cu/tu_tim.py`.
6. **Soát bằng mắt** (ảnh trong `anh/`): bắt được 24 ảnh giao diện mà công cụ cũ dựng ra hình **khác** ảnh đang dùng (cùng dáng khung tròn / vuông nhưng ruột khác: đồng xu ↔ vàng thỏi, có ↔ không có ổ khoá, màu bậc khác…). Máy đo: tương quan độ sáng giữa ảnh công cụ thu ra và ảnh đang dùng < 0,85 hoặc lệch màu > 20 → **không ghi**, giữ ảnh cũ. Ví dụ đã loại: [anh/nghi-gd.png](anh/nghi-gd.png), [anh/nghi-gd2.png](anh/nghi-gd2.png).
7. Ghi vào `game/art/custom/<mã>.sprite.json` (PNG bảng màu ≤ 256 màu như phiên dung lượng), **nối thêm cuối tệp, mọi ký tự cũ giữ nguyên** (`cong-cu/ghi_tep.py`): hiệu ứng thêm `tam_n3`, `tam_n4` (như vệt kiếm nặng của phiên máy); giao diện thêm `anh_n3`, `anh_n4` + `net_cao_cua` (đúng cách phiên **nền** làm song song: build tự bỏ bản nét cao nếu ảnh thường bị thay sau này mà chưa dựng lại). Ảnh phúc lành vốn đã nét 3 nên chỉ có bản nét 4.

## 2. Game dùng thế nào (chỉ khi bật nét cao)

Theo đúng cách của phiên máy (mục `tam_n*`, tệp riêng, tải lười):

- `game/build.py`: thêm `tam_n3` vào danh sách mục của hiệu ứng (1 chỗ); giao diện dùng mục `anh_n3` / `anh_n4` phiên nền đã thêm. Phần còn lại phiên máy đã làm sẵn: bản một tệp và bản JSON bỏ hẳn hai mục này; bản web tách thành `anh/<mã>-n3.<mã băm>.png`, `-n4…` không tính vào tải đầu.
- `game/js/fx_anh.js` (hiệu ứng): khi canvas nét ≥ 3, lần đầu một hiệu ứng được hỏi tới thì tải ảnh nét cao (nét 3 → `tam_n3`, nét 4 → `tam_n4`, thiếu bậc nào lấy bậc kia); tải xong thì **đổi ảnh, số nét và số cột của hiệu ứng cùng lúc**, nên mọi chỗ vẽ (kể cả `fx.js`, `fx_he.js`, `mobs.js`, `room_art.js` đọc thẳng ảnh) tự theo; nhuộm theo hệ chạy trên ảnh mới. Chưa tải xong / tải hỏng → ảnh thường. Nét về 2 → trả ảnh thường. Vệt kiếm nặng của phiên máy vẫn chạy y như trước (giờ đi chung đường này).
- `game/js/sprite_custom.js` (giao diện): dùng chung đường `SC.gdSan` → bản nét cao mà phiên nền làm song song (trả một bản sao có ảnh / số nét / cỡ ảnh của bậc nét đang bật; **cỡ theo điểm game `rong`, `cao` không đổi → chỗ vẽ và vùng bấm y nguyên**). Phiên này chỉ thêm: thiếu bậc đang bật thì lấy bậc kia (ảnh phúc lành chỉ có nét 4).
- **Chữ vẽ bằng font và nút bấm**: nằm ở lớp `#ui` không phụ thuộc nét. So ảnh chụp nét 2 với nét 4 từng điểm ([anh/khac-diem-hud-n2-n4.png](anh/khac-diem-hud-n2-n4.png), tô hồng = điểm khác): mọi điểm khác nằm ở **nền trận phía sau** (phiên nền đã có nền nét cao); thanh máu, chữ số máu, nút tạm dừng, nút Đánh / Né **không khác điểm nào, không xê dịch** → chữ sắc như cũ, toạ độ chạm không lệch.

## 3. Ảnh so sánh nét 2 | 3 | 4

Vẽ bằng **chính hàm vẽ của game** (bản web, ảnh nét cao tải lười như thật), cùng cỡ hiện:
- Hiệu ứng (canvas thế giới, phóng ×6 / ×4): [anh/so-hieu-ung-1.png](anh/so-hieu-ung-1.png), [anh/so-hieu-ung-2.png](anh/so-hieu-ung-2.png), [anh/so-hieu-ung-3.png](anh/so-hieu-ung-3.png)
- Giao diện (lớp `#ui` cỡ thật 844×390 dpr 3, phóng ×4 / ×2): [anh/so-giao-dien-1.png](anh/so-giao-dien-1.png), [anh/so-giao-dien-2.png](anh/so-giao-dien-2.png), [anh/so-giao-dien-3.png](anh/so-giao-dien-3.png) — ở nét 4 giao diện dùng ảnh nét 4 rồi trình duyệt thu về 2,89 điểm / điểm game (lớp chữ đang trần dpr 2, mục 5.1) nên gần như nét 3.
- Từng tấm (nét 2 | 3 | 4, 8 điểm màn / điểm game): [anh/tung-hinh-hieu-ung.png](anh/tung-hinh-hieu-ung.png), [anh/tung-hinh-giao-dien.png](anh/tung-hinh-giao-dien.png)
- Cả màn trận 844×390 dpr 3 (cắt vùng): [anh/man-m844-giua.png](anh/man-m844-giua.png), [anh/man-m844-hud-trai.png](anh/man-m844-hud-trai.png), [anh/man-m844-nut-phai.png](anh/man-m844-nut-phai.png) — thanh máu và nút Đánh / Né **chưa** có bản nét cao (thiếu ảnh gốc, mục 4).

Nhận xét: ở nét 4, viền lửa / băng / nước, hạt bắn, chữ hoa văn trên khung hiện rõ từng nét thay vì ô vuông to; ảnh giao diện trên điện thoại hết bị phóng ×1,44 không đều (trước đây ảnh nét 2 phải phóng lên 2,89).

## 4. Còn thiếu và vì sao (`danh-sach.json`)

| Nhóm | Số | Vì sao | Muốn có thì |
|---|---|---|---|
| **Thiếu ảnh gốc** | 184 | Nhập qua công cụ trình duyệt 10–11/10 (ảnh chủ game tải lên, không lưu repo) hoặc ảnh gốc đã xoá 16/10 (`don-tep`): nút trận (Đánh / Đặc biệt / Né / Chưởng / Bình máu / Tạm dừng), vỏ thanh máu / mana / kinh nghiệm, khung trùm / tinh anh, 12 biểu tượng phòng trên bản đồ, logo; hiệu ứng trúng đòn / chí mạng / nổ / chưởng / đạn / vũng / tiến hoá / Trảm Nguyệt / lên cấp; 14 vật phẩm rơi | gen lại (prompt dưới) rồi cắt bằng công cụ có lưu ảnh gốc |
| Giao diện đã sửa tay sau khi dựng | 24 | ảnh đang dùng khác hình công cụ cũ dựng ra (xem mục 1.6) | gen lại hoặc sửa tay bản nét cao |
| Nút vũ khí Kiếm / Thương / Búa (6) | 6 | ghép từ ảnh vũ khí `zed-vk` trong game, không có ảnh gốc riêng | chờ tấm vũ khí to (đề xuất của phiên máy), rồi chạy lại `vu-khi-cu-con-sot/dung-nut-vk.py` ở cỡ lớn |
| Hình báo trước `gd-bt-*` | 4 | ảnh đã rất to (1 360–1 472 điểm), game co lại khi vẽ → không cần | — |
| Quá ít khung khớp | 9 | công cụ cũ đã bỏ / thay vài khung sau khi dựng (vd. `hu-doc-toe`, `hu-bam-doc`, `hu-xoay-nuoc`, `hu-doi-pha`) | dựng lại hàng đó |
| Hình vẽ bằng code | — | trong trận đã bỏ hình code (con-ve-tay-5); hình code còn lại ở lớp `#ui` (chữ, thanh, khung vẽ tay) vẽ theo điểm thật của màn nên vốn đã sắc; hình code trên canvas thế giới tự mịn hơn ở nét 3/4 | — |

**Prompt gen lại ngắn (những ảnh hay thấy nhất)** — nền #00FF00, pixel art, cùng phong cách Việt cổ của game:
- Nút trận: `round bronze game button, 1:1, engraved Vietnamese bronze-drum rim, centered icon of a curved sword / spear / war hammer / dash arrow / red potion, pixel art, flat green background`
- Vỏ thanh máu / mana / kinh nghiệm: `horizontal ornate bronze bar frame, empty dark inner slot, small dragon-scale end caps, 5:1, pixel art, green background`
- Biểu tượng phòng bản đồ (12): `tiny map room icons sheet: crossed swords, skull, chest, key, padlock, fountain, merchant bag, portal swirl, curse eye, elite star, boss horns, start flag, bronze pixel art, 4x3 grid, green background`
- Trúng đòn / chí mạng: `hit spark sprite sheet, 4 frames in a row, white-gold star burst growing then breaking into shards, pixel art, green background`
- Nổ lửa / độc / băng: `explosion sprite sheet, 6 frames in a row, fire (or poison green / ice blue) burst with smoke ring, pixel art, green background`
- Chưởng / ra chiêu: `energy palm blast sprite sheet, 5 frames in a row, glowing qi orb launching forward with swirl trail, white so it can be tinted, pixel art, green background`
- Vật phẩm rơi: `pickup icons sheet: gold coin pile, red potion, ore chunk, grey stone, three crystal shards, three material bundles, glowing xp orb, three element spirit gems, pixel art, green background`

## 5. Đề xuất cho phần máy dùng chung (không tự sửa)

1. **Lớp chữ `#ui` đang trần dpr 2** (engine.js, V27). Trên điện thoại dpr 3, lớp này vẽ ở 2× rồi trình duyệt phóng 1,5 → giao diện tối đa 2,89 điểm thật / điểm game. Khi bật nét cao có thể cho trần 3 (khi đó ảnh giao diện nét 4 hiện đủ ~4,3 điểm thật / điểm game, chữ cũng nét hơn). Giá: tô thêm ~2,25 lần điểm cho lớp chữ.
2. **Tấm vũ khí to** (`zed-vk`): ngoài thương của Cu Tí, 6 nút Đánh / Đặc biệt cũng ghép từ tấm này.
3. `build.py`: phiên này chỉ thêm tên mục vào `HU_KEYS` / `GD_KEYS`. Phiên quái / nền cần làm tương tự cho loại ảnh của mình (mục `tam_n3`, `tam_n4`).

## 6. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,88 MB; người chơi tải 17,69 MB / 20; nét cao (cả game) 6,93 / 11,34 MB in riêng (sau khi gộp phiên nền + tư vấn phần B) |
| Mặc định giống hệt trước (chụp `net-cao/cong-cu/chup_tran.py`, so với bản dựng từ commit ngay trước — đã gộp phiên nền) | **0 điểm khác / 24 ảnh** (một tệp 12 + web 12) |
| Nạp `dist/linh-khi.html?cloud=0` và `linh-khi-nhe.html` headless: mặc định, `&netcao=3`, `&netcao=4`, 844×390 dpr 3 + 1280×720 | 0 lỗi JS; ở bản web hiệu ứng và giao diện đổi đúng sang bậc nét đang bật (lưới mẫu 24 + 24 ảnh) |
| `tests/smoke.py`, `tests/*.test.js` | 0 lỗi; đều đạt (`may_luat` bỏ qua như trước: thiếu thư viện) |
| Soát mắt + máy đo hở mặt nạ (ảnh mới thiếu mảng so với ảnh cũ) | loại thêm `gd-vien-man-do`, `gd-icon-linh-khi` |

**Dựng lại** (khi sửa ảnh hiệu ứng / giao diện bằng công cụ cũ thì phải chạy lại, kẻo bản nét cao lệch bản thường): `cong-cu/chay_het.sh` (bắt ảnh to từ 20 công cụ) → `cong-cu/dung_het.sh` → `python3 cong-cu/tu_tim.py` → `python3 cong-cu/ghi_tep.py` → build. Soát: `cong-cu/xem.py`, `cong-cu/chup.py <dist> linh-khi-nhe.html <ra> 2,3,4 --luoi`, `cong-cu/ghep_so.py`.
