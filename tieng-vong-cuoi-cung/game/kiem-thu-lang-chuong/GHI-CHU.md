# Ghi chú – ghép Làng Chuông + clip chết của Lam (27/10/2026)

> **Cập nhật v2 (27/10, tối)**: thân gỗ từ ảnh gen mới, mảng rễ trang trí, tiền cảnh rễ treo mới – xem **mục 0** và ảnh
> `anh-960-*-v2.png`. Các mục 1–7 bên dưới là lần ghép đầu (vẫn đúng, trừ chỗ mục 0 nói đã đổi).

## 0. Bản v2 – đã đổi gì trong game

| Phần | Trước | Bây giờ |
|---|---|---|
| Thân gỗ (`#`, `W`) | 4 ô thân dựng bằng code, lặp nhịp 32 px thành "sóng" | **8 ô thân từ ảnh gen** (`go-than`, `go-than-2…8`), mọi ô chung mép nên ghép liền; mỗi ô chọn theo vị trí (băm cố định, chia đều 8 ô) |
| Tường / trần gỗ | 1 ô lặp | 4 biến thể (`canh-trai`, `canh-phai`, `day-giua` + `-2/-3/-4`), 60 % là biến thể |
| Mặt rêu, góc, cột, gờ, khối gỗ | trên thân code | dựng lại trên thân mới (viền đen chỉ ở cạnh lộ, như cũ) |
| Mảng rễ 4×4 ô | chưa có | `rong-re.png` (128×128 logic) vẽ ngay sau gạch, **12 chỗ cố định** (2 chỗ/phòng, xen lật ngang), bắt đầu từ hàng 15 = ngay dưới hàng mặt rêu → **không che mặt trên**; chỗ nào không còn là khối gỗ đặc (hàng 14–16, rộng thêm 1 ô mỗi bên) thì tự bỏ → không đè cạnh lộ / hố. Chỉ là hình, không va chạm |
| Tiền cảnh | vệt tối mờ dựng từ lớp gần | 3 cụm **rễ treo thật** (ảnh gen), cùng file + cùng cỡ cũ, cuộn 1,05, vẽ SAU Lam/quái; rễ chỉ xuống tới 36 % màn (≈195 logic) – đầu Lam đứng sàn ở ≈336 logic nên không bị che |

**Không đổi**: bản đồ, va chạm, gameplay, Lam, hiệu ứng, quái/boss, đá xây (`S`), `demo-doi-chieu-v3.html`.
Bộ nhớ ảnh Làng Chuông: 28,4 MB (thêm ≈0,5 MB: atlas cao hơn 396 → 460, mảng rễ 256×256). Bản build: 12,84 MB.
Kiểm nhanh (`python3 -B game/tools/chup-lang-chuong-v2.py`, số đo `so-do-v2.json`): demo.html và bản build `file://`
**không lỗi console / lỗi trang / tải hỏng**; 91 ô atlas, 12/12 chỗ mảng rễ hợp lệ. Video `lang-chuong-60fps.mp4` là bản cũ
(chưa quay lại).

**Còn chưa đẹp (v2)**: thân gỗ co về 32 logic nên rễ thành lưới nhỏ dày, hơi rối; xen 8 ô vẫn hơi thấy lưới ô; mảng rễ trên sàn
chỉ lộ nửa trên (sàn dày 3 hàng) và hay nằm dưới dòng chữ hướng dẫn phím; tiền cảnh tối gần giống rễ của nền nên đôi chỗ khó nhận
ra. Gợi ý gen lại (prompt): xem `art/the-gioi-moi/lang-chuong/GHI-CHU.md` mục 5 (a2, b2, c2).

Viết cho người không rành kỹ thuật. Xem trước: **`lang-chuong-60fps.mp4`** (≈ 25 giây, 60 khung/giây, mỗi khung = đúng 1 bước
của game) và các ảnh **`anh-960-*.png`** (đúng cỡ màn 960×540).

## 1. Đã ghép gì vào `game/demo.html`

| Phần | Trước | Bây giờ |
|---|---|---|
| Nền | gradient TẠM + vài dải mờ | 3 lớp Làng Chuông cuộn chậm khác nhau: xa (×0,08, `lang-xa.png`), giữa (×0,40), gần (×0,65), lặp ngang liền |
| Tiền cảnh | không có | rễ treo tối (×1,05) vẽ ĐÈ lên Lam/quái, chỉ ở mép trên |
| Gạch | mảnh rễ cũ co giãn | ô 32 lát tự động từ atlas: mặt rêu, tường trái/phải, đáy, góc, cột 1 ô, gờ, góc lõm, biến thể thân/mặt; đá xây cho ô `S`, gỗ-rễ cho ô `#`/`W`; ván một chiều cho bệ `=` |
| Cổng | ảnh cổng cũ (2 trạng thái mờ chồng) | cổng mới: 2 cột luôn rõ (`chỉ trụ`) + cánh đóng mờ dần ↔ cánh mở hiện dần; cao đúng 160 = khoảng sàn → đáy tường |
| Công tắc | ảnh cũ + lún 2 px bằng code | ảnh công tắc lên / ấn mới (nắp chuông thụt xuống) |
| Mảnh hồi máu (quái rơi) | ô vuông vàng | **bình máu** |
| Mảnh rơi từ trần (boss pha 2) | hình chuông pixel | **mảnh chuông** |
| Điểm lưu, đèn lồng | sheet `the-gioi.png` | GIỮ hình cũ, tách riêng ra `game/anim/lang-chuong-giu.png` (nhỏ) |
| Lam chết | khung bị đánh TẠM, mờ ngay từ đầu | clip chết mới (mục 2) |

**Không đổi**: bản đồ, va chạm, hộp đòn, máu, quái/boss, hiệu ứng, phần Lam khác. Cổng và công tắc vẽ theo đúng hộp chặn / vùng
ấn cũ (cổng ×1,25, công tắc ×1,4 so với cỡ gốc của ảnh). Mọi ảnh mới được **giải mã sẵn ở màn nạp** (không giật lần đầu).
Màn chưa có dốc nên ô dốc chưa dùng.

`game/anim/the-gioi.*` **chưa xoá**: `demo-doi-chieu-v3.html` (không sửa) và `thu-quai-boss/` vẫn dùng. `demo.html` và bản build
không còn nạp nó nữa.

## 2. Clip CHẾT của Lam

- Ngã **theo hướng đòn**: bị đánh từ trước mặt → ngã ngửa ra sau; bị đánh từ sau lưng → ngã chúi tới (`chet-*` / `chett-*`).
- Thứ tự (khớp đúng số bước của game, chọn theo `deadT` và lúc chạm đất): trúng đòn (6 bước đứng hình) → bay lên → rơi xuống →
  chạm đất (3 bước) → nảy nhẹ (4) → lắng (3) → nằm yên tới khi hồi sinh (bước 104).
- **Dao văng** khỏi tay ở bước 1, xoay, rơi, nảy nhẹ rồi nằm ngang trên sàn (chỉ để vẽ – không ảnh hưởng gameplay).
- Lam + dao giữ rõ tới bước 56 rồi mờ dần tới 80 (trước đây mờ ngay từ bước 0 nên không thấy gì). Màn tối + hồi sinh giữ nguyên.
- Sheet: `art/modular/lam-moi/hanh-dong/sprite/lam-hanh-dong-2x.png` (+14 khung chết + 1 khung dao), GIF:
  `art/modular/lam-moi/hanh-dong/gif/chet-nga-ngua-{lon,112px}.gif`, `chet-nga-chui-{lon,112px}.gif`.
- Rig-v4 không chóp mũ, không sửa gì trong `rig-v4/`; tay không dao + dao rời được cắt ra `hanh-dong/manh-them/`.

## 3. Bộ nhớ ảnh (ảnh đã giải mã, ước tính)

| | MB |
|---|---|
| Làng Chuông thêm: 3 lớp nền 2x (≈ 20,7) + tiền cảnh thu ½ (4,0) + atlas gạch (1,5) + atlas kéo mép (1,1) + 7 đồ vật (0,3) | **+27,6** |
| Sheet hành động Lam lớn hơn (2037×2048 → 2037×2396) | +2,7 |
| Bỏ `the-gioi.png` (2048×444), thêm `lang-chuong-giu.png` | −3,3 |
| **Tổng tăng** | **≈ +27 MB** |

Tiền cảnh gốc 3840×1080 (16,6 MB) được thu còn 1920×540 lúc nạp. Bản build tự chứa: **12,7 MB** (nền nhúng WebP q92,
gạch/đồ vật PNG gốc). Nạp Làng Chuông ≈ 0,2 giây trên máy kiểm.

## 4. Kiểm nhanh (Chromium headless, `game/tools/quay-lang-chuong.py`, số đo trong `so-do.json`)

- demo.html, bản build (`file://`), và màn iPhone ngang 844×390: **không lỗi console / lỗi trang / tải hỏng**.
- iPhone ngang 844×390 (cảm ứng, DPR 3): nút **Bắt đầu** nằm trọn trong màn, không bị gì che, chạm vào là vào game
  (`anh-iphone-844x390.png`).
- Video: chạy qua Cổng làng → đứng công tắc mở cổng → Sân chuông đánh 3 quái (bot) → Lam chết 2 lần (ngã ngửa, ngã chúi).
  Có "cắt cảnh" giữa các đoạn (đặt Lam sang chỗ khác) vì Cổng làng cần nhảy tường + Tiếng Vọng mà bot chưa làm. Để chết,
  máu đặt = 1 rồi đứng yên cho quái đánh thật.

## 5. Còn chưa đẹp

1. **Tiền cảnh** đọc như vệt bóng đen mờ ở mép trên hơn là rễ (đã ghi ở GHI-CHU Làng Chuông – nên gen riêng).
2. **Thân gỗ** lặp nhịp 32 px thành "sóng" trên mảng sàn rộng (dày 3 hàng); chưa có mảng rễ lớn 4×4 ô phủ lên.
3. Chỗ **đá gặp gỗ** (cột đá đầu Cổng làng, tường phòng boss đứng trên sàn gỗ) nối thẳng, không có chuyển tiếp.
4. Ván một chiều mỏng, mặt ván là rêu; bệ 2–3 ô trông như thanh mỏng.
5. Cổng: cánh mở bóp ngang, chưa có độ dày; đèn báo trên cổng vẫn là chấm tròn vẽ bằng code, nằm trên cột đá.
6. Công tắc phóng ×1,4 cho khớp vùng ấn cũ → hơi mềm nét trên màn nét cao. Bình máu / mảnh chuông nhỏ (19×24 / 19×28).
7. Clip chết: thân xoay cứng (rig không uốn được), khung chạm đất → nằm chỉ đổi nhẹ; nếu chạm đất rồi mới trượt xuống hố thì vẫn
   giữ khung nằm. Dao có thể văng vào hố/tường (nảy lại) – chấp nhận.
8. Điểm lưu và đèn lồng vẫn hình chibi cũ.
9. Nền giữa lặp mỗi ~780 px – cuộn lâu sẽ thấy tháp chuông lặp lại.

## 6. Chưa thử

- **Chưa chạy trên iPhone thật** (Safari): chưa đo khung hình/giây, bộ nhớ thật (+27 MB ảnh), nhiệt.
- Chưa thử camera cảm ứng lệch 28 px trên máy thật (đã vẽ thêm hàng gạch dưới đáy để không hở).
- Chưa chơi tay trọn demo sau khi ghép (video có cắt cảnh).

## 7. File

```
game/demo.html                       ghép nền + gạch + đồ vật Làng Chuông, clip chết, dao văng
game/build-demo.py                   nhúng Làng Chuông (TV.NHUNG.lc) + lang-chuong-giu; bỏ the-gioi
game/anim/lang-chuong-giu.png/.json  điểm lưu + đèn lồng (tools/tach-do-vat-giu.py)
game/tools/quay-lang-chuong.py       kiểm nhanh + quay video + ảnh
game/tools/chup-lang-chuong-v2.py    v2: kiểm nạp + 6 ảnh anh-960-*-v2.png + so-do-v2.json
game/kiem-thu-lang-chuong/           video, ảnh, so-do.json, file này
art/modular/lam-moi/hanh-dong/       code/ (tư thế chết, dao), sprite/ (sheet mới), gif/chet-*, manh-them/
```
Chạy lại: `python3 game/build-demo.py` (bản build, không commit) · `python3 -B game/tools/quay-lang-chuong.py` (≈ 5 phút) ·
`cd art/modular/lam-moi/hanh-dong/code && python3 -B dung_hd.py && python3 -B gif_hd.py chet`.
