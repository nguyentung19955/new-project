# Báo cáo: lỗi "nền đen" (bom tinh anh, gai nhím) — 14/10

Commit sửa: `dde3fe88` (nhánh `khoi-tao-du-an`). Chỉ chạy script giải mã ảnh, `node --check`, `build.py` và `build.py --hai-tep`. Không chạy game hay Playwright.

## 1. Nguyên nhân

**Lỗi nằm ở code vẽ, không phải ở đợt nén ảnh `a0da2ca`.**

- Quả bom trên đầu quái tinh anh "Nổ khi chết" là `gd-quai-no`. Mũi gai hiện trên nhím khi nhím dựng gai (`spikeUp`, quái vai `spiky`: `nhim`, `nhimDoc`, `nhimThan`) là `gd-quai-gai`. Cả hai đều do hàm `icon()` trong `game/js/mobs.js` vẽ.
- `icon()` luôn **lót một ô 13×13 màu `rgba(20,24,46,0.85)`** (xanh đen, gần như đục) rồi mới vẽ biểu tượng lên trên. Ô này có từ khi biểu tượng còn vẽ bằng code: hình code không có viền nên cần nền để nổi lên. Ngày 11/10 (`a1d84bfc`, `7d610b72`) game chuyển sang ảnh AI 12×12 có nền trong suốt và viền tối riêng, nhưng ô nền vẫn được vẽ. Kết quả là trên sàn rừng mỗi biểu tượng nằm trong một ô đen, đúng như ảnh chụp `anh-loi-nen-den.png`.
- Hai tấm `gd-quai-no` và `gd-quai-gai` **không hề bị đợt nén đụng tới**: chúng vẫn là RGBA 24×24, giống từng byte với bản trước `a0da2ca` (sửa lần cuối ngày 11/10). Nền của chúng trong suốt.
- Đã loại trừ các khả năng khác:
  - **PNG bảng màu (P + tRNS):** giải mã bằng một bộ giải mã PNG viết tay, đọc PLTE/tRNS đúng chuẩn như trình duyệt. Kết quả khớp Pillow ở mọi điểm, mọi khối đúng cấu trúc (CRC đúng, tRNS không dài hơn PLTE, không có chỉ số nào vượt bảng màu).
  - **WebP lossless (`build.py`, `ma_webp`):** `ma_webp` so cả kênh alpha (so `tobytes()` của ảnh RGBA). Đã kiểm lại cả 470 tệp `.webp`: alpha giống PNG ở mọi điểm, và cờ alpha trong đầu tệp (VP8L `alpha_is_used`) đều bật ở những tấm có điểm không đục.
  - **Code canvas** (nhuộm, `getImageData`, cắt 9 mảnh, `veGd`): không có đoạn nào ghi đè alpha. Điểm có α = 0 bị nén đưa về (0,0,0,0) cũng không gây viền đen, vì canvas 2D nội suy trên màu đã nhân alpha. Game không dùng WebGL.

## 2. Cách sửa (`game/js/mobs.js`, hàm `icon`)

- Ô nền tối giờ chỉ vẽ cho **hình vẽ bằng code** (dự phòng khi không có ảnh AI). Ảnh AI (`gd-quai-no|gai|nhanh|giap|hut`, và biểu tượng vỡ giáp `hu-pha-giap`) được vẽ thẳng lên sàn.
- Thêm cờ `?icnen=1` để bật lại ô nền dưới ảnh AI khi cần so trước/sau. Không đổi vị trí, cỡ, nhấp nháy của gai, hay dấu "!" sắp ra đòn.
- Không đụng tới đăng nhập Google, lưu mây (`cloud.js`, `cloud_ui.js`), `?cloud=0` hay `firebase-config.js`.

## 3. Rà toàn bộ ảnh

Lệnh: `python3 tools/kiem-alpha.py --goc a0da2ca~1 --lech-ban-trong 64 --dist game/dist/anh`

- Đã kiểm 470 tấm trong `game/art/custom/*.sprite.json` (317 PNG bảng màu, 153 RGBA) và 470 PNG + 470 WebP trong `game/dist/anh` (tạo bằng `build.py --hai-tep`).
- Có 259 tấm khác với bản trước `a0da2ca`. Trong đó 16 tấm đổi cỡ vì đã được vẽ lại sau này, nên không so được. Số còn lại được so alpha từng điểm.
- **Tấm có nền hoặc viền đáng lẽ trong suốt mà thành đen hay đục: 0 tấm.** Không có điểm nào đổi từ trong suốt hoặc bán trong sang đục, cũng không có chiều ngược lại. Không có tấm nào cần sửa ảnh.
- Đã xem tay 59 tấm có viền đục (nền phòng, bản đồ, khung, ô đồ, thảm, thùng gỗ, dấu "!" người làng…). Chúng vốn đục từ trước đợt nén, đúng thiết kế.
- **16 tấm bị nén có mất** (bảng 256 màu k-means của `nen-anh.py`): alpha chỉ lệch ở điểm bán trong (viền mờ, quầng sáng). α = 0 và α = 255 vẫn giữ nguyên. Độ sáng sau khi nhân alpha không tối đi (trung bình lệch khoảng 0, không có điểm nào tối hơn quá 80). Những tấm này không gây nền đen nên tôi giữ nguyên. Nếu khôi phục bản gốc, ảnh máy chủ sẽ tăng khoảng 3,9 MB PNG (cộng thêm WebP) và vượt trần 26 MB.

| Tấm | Lệch α tối đa ở điểm bán trong | Lệch trung bình | Dung lượng (KB) |
|---|---|---|---|
| hu-chi-mang | 15 | 1,2 | 57 → 16 |
| hu-len-cap | 17 | 1,7 | 88 → 25 |
| hu-no-bang | 23 | 1,3 | 133 → 38 |
| hu-no-doc | 25 | 2,0 | 137 → 39 |
| hu-no-lua | 32 | 3,6 | 151 → 43 |
| hu-soc-nhiet | 41 | 2,8 | 159 → 42 |
| hu-tien-hoa | 23 | 0,0 | 192 → 58 |
| hu-tien-hoa-fire | 27 | 1,7 | 245 → 64 |
| hu-tien-hoa-ice | 27 | 2,0 | 287 → 84 |
| hu-tien-hoa-poison | 24 | 3,3 | 285 → 82 |
| hu-vong-phep | 41 | 1,1 | 169 → 46 |
| zed-bien | 61 | 4,2 | 906 → 253 |
| zed-lau | 37 | 4,0 | 911 → 263 |
| zed-moi | 38 | 3,3 | 849 → 245 |
| zed-rung | 37 | 3,5 | 870 → 254 |
| zed-vk | 39 | 4,4 | 169 → 51 |

## 4. Bài kiểm tĩnh mới: `tools/kiem-alpha.py`

Cách dùng có ghi trong `tools/README.md`. Script không chạy game, chỉ cần Pillow và numpy. Thoát mã 1 khi có lỗi.

- **Giải mã hai cách độc lập:** Pillow và bộ giải mã PNG viết tay (zlib, bỏ lọc, Adam7, độ sâu 1/2/4/8/16 bit, PLTE/tRNS theo chuẩn: mục ngoài độ dài tRNS là đục). Hai cách lệch nhau ở bất kỳ điểm nào thì báo lỗi. Đã tự kiểm với RGBA, P (2 và 4 bit), LA, có và không có xen kẽ dòng.
- **Cấu trúc PNG:** CRC, thiếu PLTE, tRNS dài hơn PLTE, chỉ số vượt bảng màu.
- **So với mốc git** (`--goc`, mặc định HEAD, nghĩa là chạy trước khi commit một đợt nén):
  - Luôn báo lỗi khi điểm đổi loại giữa trong suốt, bán trong và đục.
  - Điểm bán trong lệch quá `--lech-ban-trong` (mặc định 0) cũng báo lỗi.
- **`--dist game/dist/anh`:** PNG rời phải giống từng byte với ảnh trong sprite.json. WebP phải giữ nguyên RGBA và phải bật cờ alpha (VP8X/VP8L) khi ảnh có điểm không đục.
- **Cảnh báo:** tấm đục hoàn toàn mà viền gần đen (có thể dính nền đen), trừ nhóm vốn đục.

Kết quả hiện tại:

- `kiem-alpha.py --dist game/dist/anh` (so với HEAD): ĐẠT, 0 lỗi.
- So với `a0da2ca~1` ở ngưỡng mặc định 0: HỎNG, đúng 16 lỗi của 16 tấm nén có mất ở bảng trên.
- So với `a0da2ca~1` ở `--lech-ban-trong 64`: ĐẠT, 16 cảnh báo.

## 5. Dung lượng (sau khi build lại)

- Bản một tệp `dist/linh-khi.html`: **21,23 MB / trần 30 MB**.
- Ảnh trên máy chủ (`--hai-tep`): **25,68 / 26 MB** (PNG 13,83 MB + 470 WebP 11,85 MB). Trang chính nén 0,87 / 1,50 MB.
- Không đổi ảnh nào nên dung lượng không đổi. Riêng mã thêm khoảng 0,5 KB.

## 6. Kiểm đã chạy

- `node --check` toàn bộ `game/js/*.js`: đạt.
- `python3 game/build.py` và `python3 game/build.py --hai-tep`: đạt, không vượt trần.
- `tools/kiem-alpha.py` như trên.
- Khi push, hai lần `pull --rebase` chỉ kéo về ảnh trong `docs/anh-goc`, không đụng game hay dist, nên không cần build lại.
