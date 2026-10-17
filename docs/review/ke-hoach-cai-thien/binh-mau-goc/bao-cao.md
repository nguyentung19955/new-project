# Nút Bình máu lên góc (17/10 tối)

Chủ game báo (ảnh iPhone `anh-chu-game.png`, Hang biển 1): nút Bình máu (số ×2) nằm phía trên nút Đặc biệt / Chưởng, chồng vào khung phòng. Ý chủ game: "nút này nên ở trên cùng bên phải hoặc bên trái".

Không chơi thử bằng tay: mọi cảnh dựng bằng mã, chụp và chạm bằng máy (headless). **Không đổi luật / số liệu** (bình vẫn hồi 30%, vẫn 2 bình…). **Cỡ nút giữ nguyên** (~47 px ở 844×390 như phiên trước, cài đặt Cỡ nút Nhỏ / Vừa / To vẫn theo). Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không đụng phần căn chữ.

## Tóm tắt cho chủ game

| | Trước | Bây giờ |
|---|---|---|
| Chỗ nút Bình máu (mặc định) | trong cụm nút phải, trên Đặc biệt / Chưởng, lấn vào khung phòng | **góc trên bên trái, ngay dưới thanh máu–mana**, bên trái nút Tạm dừng — nằm ở lề nước ngoài phòng, không chồng khung phòng |
| Lựa chọn | — | Anh Mõ → "Âm thanh, điều khiển" → hàng dưới cùng có nút **"Bình máu"**: bấm đổi vòng **Trên trái** (mặc định) → **Trên phải** → **Như cũ**. Lưu **theo máy** (không lên mây, đổi máy thì về mặc định) |
| Câu mẹo "Máu thấp!" | "Chạm Bình máu để hồi 30% máu." | nói đúng chỗ: "(góc trên trái)" / "(góc trên phải)"; có tiếng Anh |
| Cờ quay lui | | gõ `?binhgoc=0` cuối địa chỉ → **y hệt bản trước** (kể cả khi máy đã chọn Trên phải) |

- **Trên phải**: nút nằm ngay dưới ô vũ khí + "Bản đồ". Tấm "Linh khí N" (hiện vài giây sau khi nhặt / khi mở bản đồ) hẹp lại, nằm bên trái nút; bản đồ nhỏ khi mở thì bắt đầu dưới nút (thấp hơn một chút, các ô phòng tự thu nhỏ). **Cụm nút Đánh / Né / Đặc biệt / Chưởng không xê dịch một điểm nào** ở cả 3 chế độ.
- Vòng chọn 4 vũ khí (giữ ô vũ khí) khi Bình máu ở trên phải: lúc vòng đang mở thì nút Bình máu tạm ẩn cho khỏi đè (nhả tay là hiện lại).
- Hàng dấu trạng thái (cháy, độc…) dưới thanh máu: khi Bình máu ở trên trái thì dời sang phải nút (xem ảnh "máu thấp").
- Hàng "Cỡ nút" trong cài đặt: ba nút Nhỏ / Vừa / To hẹp lại (vẫn cao 32 như mọi nút) để có chỗ cho nút "Bình máu".

## Ảnh TRƯỚC / SAU (thư mục `anh/`)

Mỗi tệp `*-truoc-sau.jpg` xếp 4 ảnh: TRƯỚC · SAU Trên trái (máu thấp, có mẹo) · SAU Trên phải (đang mở bản đồ) · Như cũ. Tệp `*-trum.jpg`: phòng trùm Ngư Tinh (TRƯỚC · Trên trái · Trên phải).

| Màn | Tệp |
|---|---|
| iPhone ngang 844×390 (dpr 3) | `844x390-truoc-sau.jpg`, `844x390-trum.jpg` |
| iPhone SE 667×375 (16:9) | `667x375-…` |
| Máy tính 1280×720 | `1280x720-…` |
| Cầm dọc 390×844 (game tự xoay) | `doc-390x844-…` |
| Có tai thỏ, ngang (lề an toàn 47 hai bên + 21 đáy) | `taitho-844x390-…` |
| Có tai thỏ, ngang chiều kia (tai thỏ một bên) | `taitho-phai-844x390-…` |
| Có tai thỏ, cầm dọc (47 trên + 34 dưới) | `taitho-doc-390x844-…` |
| Cài đặt Anh Mõ (tiếng Việt / Anh) | `cai-dat.jpg`, `cai-dat-en.jpg` |

## Số đo (máy đo, đơn vị khung game 480×270; px = điểm ảnh CSS)

| Màn | Cỡ nút Bình máu | Trên trái: khung nút | Khe tới vùng chạm Tạm dừng | Trên phải: khung nút |
|---|---|---|---|---|
| 844×390 | 47 px | x 4–37, y 26–59 | 26 đơn vị (~37 px) | x 445–478, y 43–76 |
| 667×375 | 46,3 px | x 4–39, y 26–61 | 23 | x 443–478, y 43–78 |
| 1280×720 | 83 px | x 4–36, y 26–58 | 27 | x 446–478, y 43–75 |
| dọc / tai thỏ | 47 px | như 844×390 | 24–26 | như 844×390 |

- Thanh máu + mana cao tới y = 23 → nút bắt đầu y = 26: **không đè thanh máu**, không đè nút Tạm dừng, không đè chữ tên ải (y ≈ 70+).
- Mọi điểm trong hình nút đều là "Bình máu" khi chạm (thử ~830 điểm mỗi màn × 7 màn × 2 chỗ): **0 điểm** bị nút / ô khác ăn; vùng chạm không chồng ô vũ khí, "Bản đồ", bản đồ nhỏ, nút Tạm dừng.
- Nút luôn nằm trong khung vẽ của game — mà khung vẽ đã nằm trong vùng an toàn (trang chừa lề tai thỏ / bo góc / thanh Home, cả khi xoay dọc) → **không bị tai thỏ / bo góc che** ở cả 7 màn.

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` các tệp js đã sửa | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,87 MB** / 30; người chơi tải **19,54 MB** / 20 (thêm ~vài KB) |
| `soat.py` — chạm thật bằng ngón giả vào nút Bình máu: 4 màn × {Trên trái, Trên phải, Như cũ, `?binhgoc=0`} → bình 2→1, máu tăng; chạm Tạm dừng → tạm dừng, không uống bình | **64/64 đạt**, 0 lỗi JS |
| `soat.py` — cài đặt: bấm "Bình máu" đổi vòng đúng, tải lại trang vẫn nhớ, không ghi vào bản lưu mây; có tiếng Anh | Đạt |
| `soat.py` — `?binhgoc=0` (máy đã lưu "Trên phải") và "Như cũ" so bản TRƯỚC: lớp giao diện, đồng hồ cố định, 3 cảnh × 3 màn | **0 điểm ảnh khác** |
| `chup.py` (7 màn × 4 cảnh × 5 chế độ) | 0 lỗi JS |
| Bản web hai tệp (`linh-khi-nhe.html` qua http) × 3 chỗ × có/không `?binhgoc=0` | 0 lỗi JS (chỉ dòng `sw.js` 404 của môi trường thử, có từ trước) |
| `tests/nut_danh_shots.py` | 66 đạt, 1 sai — **sai y hệt bản trước phiên** (Đặc biệt 54 px vượt mốc cũ của bài, có từ phiên `binhto`). Đã sửa bài: chỗ bấm nút cỡ đọc theo bố cục mới; vùng "thanh máu" đo đúng cao 24 (trước 30) |
| `tests/ui_input.py` | Bài "chạm ô Bình máu" **nay đạt** (bản trước hỏng); các bài hỏng còn lại ở làng **giống hệt bản trước phiên** |
| `tests/smoke.py`, `au_ui.py`, `au_input.py`, `au_onboarding.py` | 0 lỗi trang |

Công cụ: `chup.py` (ảnh), `soat.py` (chạm thật + cài đặt + so bản trước); cách chạy ghi đầu tệp. TRƯỚC = `game/dist/linh-khi.html` ở commit `605fdc5d`.

## Chỗ trong mã (cho phiên sau)

- `game/js/stage.js`: cờ `G.BINH_GOC` (`?binhgoc=0`), `G.binhGoc` (`vt()` chỗ đang dùng, `dat('trai'|'phai'|'cu')`, `mmRect`, `lkW`, `cau()`), lưu ở `localStorage['linhkhi.binhViTri']`; `boCucTo` đặt nút ở góc sau khi xếp xong cụm nút (nên cụm không đổi); câu mẹo `BINH_CAU`.
- `game/js/minimap.js` `MM.rect`: bản đồ nhỏ nhường chỗ khi Bình máu ở trên phải (mép dưới giữ nguyên).
- `game/js/linhkhi.js` `LK.hud`: bề ngang tấm "Linh khí N".
- `game/js/village.js` trang 2 cài đặt: nút "Bình máu"; `game/js/ngon_ngu_en.js`: chữ tiếng Anh.

## Chỗ còn yếu / cần chủ game xem

1. **Trên phải** + đang mở bản đồ nhỏ: bản đồ thấp hơn trước (~43 thay vì 68 đơn vị) → ô phòng nhỏ hơn; chạm lần nữa vẫn mở bản đồ to như cũ.
2. **Trên phải** khi tắt HUD gọn (`?hudgon=0`): tấm Linh khí luôn hiện nên bản đồ nhỏ càng thấp (vẫn bấm được). Tổ hợp cờ hiếm.
3. Ở màn 16:9 không có lề (iPhone SE 667×375, 1280×720) nút trên trái nằm sát mép trái khung, cạnh nút Tạm dừng — vẫn ngoài sàn phòng, nhưng chủ game nên xem trên máy thật xem ngón cái trái có dễ với tới không (trước đây bình nằm bên phải, gần ngón cái phải).
4. Lựa chọn lưu theo máy: đổi máy / xoá dữ liệu trình duyệt thì về "Trên trái".
