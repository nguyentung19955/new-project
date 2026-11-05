# Báo cáo phiên PixelLab HUD — 05/11/2026

Chủ game nhắn lúc 14:49 ngày 05/11: "Nhớ hud theo pixel lab nhé". Phiên này vẽ lại HUD trong trận bằng PixelLab cho hợp với vũ khí và quái nấm PixelLab.

## Tóm tắt cho chủ game

- **40 mảnh HUD** trong trận đã có bản PixelLab và đã **bật mặc định**. Các mảnh gồm thanh máu, thanh linh lực, thanh kinh nghiệm, khung trùm và tinh anh, máu quái, nút Đánh / Đặc biệt / Chưởng / Né / Bình máu / Tạm dừng, cần điều khiển, ô vũ khí, nút đổi vũ khí, khung Bản đồ, dấu cháy / độc / băng và ngôi sao điểm yếu.
- Cả bộ theo một kiểu: gỗ sồi, đồng thau, viền mực tối, không chữ, cổ tích châu Âu.
- **Nút nổ nguyên tố không còn hình chuông.** Nút Lửa là ngọn lửa, nút Độc là giọt độc, nút Băng là tinh thể băng. Hình cũ là quả cầu lửa, vũng độc và mũi tên băng.
- **Nút Đánh / Đặc biệt của kiếm** đổi từ đao cong sang kiếm hiệp sĩ lưỡi thẳng, cho hợp với kiếm PixelLab.
- **Muốn dùng lại HUD cũ:** mở game với `?hudcu=1`, ví dụ `https://spiritblade.web.app/?hudcu=1`.
- **Không đổi:** bố cục, vùng chạm, cỡ nút, chữ (EN mặc định / VI), luật chơi, cân bằng, bản lưu, đăng nhập Google, lưu mây, `?cloud=0`.

## 1. Kiểm kê HUD trong trận

Kích thước tính theo điểm game (ảnh thật gấp 2). Ký hiệu: ✅ có bản PixelLab · — giữ nguyên.

| Mảnh | Mã ảnh | Cỡ | Bản PixelLab |
|---|---|---|---|
| Thân nút Đánh (thường / Lửa / Độc / Băng) | `gd-vong-thuong/fire/poison/ice` | 76×76 | ✅ |
| Thân nút Đặc biệt / Né | `gd-vong-ngoc`, `gd-vong-sat` | 56×56 | ✅ |
| Nền nút vuông (bình máu, tạm dừng) | `gd-nut-vuong` | 42×42 | ✅ |
| Cần điều khiển (đế + núm) | `gd-can-de`, `gd-can-num` | 66×66, 30×30 | ✅ |
| Ô vũ khí | `gd-o-vk-0` | 54×35 | ✅ |
| Nút đổi vũ khí | `gd-nut-doi` | 40×40 | ✅ |
| Hình nút Đánh theo vũ khí (kiếm, thương, búa, phi tiêu) | `gd-nut-danh-*` | 24×24 | ✅ |
| Hình nút Đặc biệt theo vũ khí | `gd-nut-dac-biet-*` | 24×24 | ✅ |
| Hình nút nổ Lửa / Độc / Băng | `gd-nut-chuong-*` | 24×24 | ✅ (lửa / giọt / tinh thể) |
| Hình nút Né / Bình máu / Tạm dừng | `gd-nut-ne`, `gd-nut-binh-mau`, `gd-nut-tam-dung` | 24×24 | ✅ |
| Khung thanh máu / linh lực / kinh nghiệm | `gd-khung-mau`, `gd-khung-mana`, `gd-khung-xp` | 33×11, 32×8, 28×7 | ✅ (9 mảnh, lề y cũ) |
| Ruột thanh (5 màu) / ruột thanh trùm | `gd-ruot-thanh`, `gd-ruot-thanh-trum` | 32×20, 32×5 | ✅ |
| Khung trùm lớn / trùm nhỏ / tinh anh | `gd-khung-trum`, `gd-khung-trum-nho`, `gd-khung-tinh-anh` | 60×30, 52×26, 44×22 | ✅ |
| Máu quái thường | `gd-khung-mau-quai` | 82×4 | ✅ |
| Khung nhỏ (ô "Bản đồ") | `gd-khung-nho` | 64×19 | ✅ |
| Rãnh linh khí cạnh ô vũ khí | `gd-khung-vach-lk` | 32×7 | ✅ |
| Dấu cháy / độc / băng; sao điểm yếu trùm | `gd-tt-chay/doc/bang`, `gd-sao` | 9×9, 12×12 | ✅ |
| Thẻ kháng / yếu dưới thanh trùm | `gd-the-nho` | 39×10 | — (thẻ trắng, game nhuộm màu theo hệ; bản PixelLab ra màu giấy da, nhuộm sẽ sai) |
| Viền bậc ép đồ quanh ô vũ khí | `ep_do.js` | — | — (không thuộc HUD gốc; viền xanh băng vẫn là ảnh cũ) |
| Bảng tên trùm dài (tấm có tên "Grimbark") | ảnh khác của `ui_theme.js` | — | — (để phiên sau) |
| Bản đồ nhỏ khi mở to | `gd-khung-ban-do` | 380×242 | — (khung to, tải sau, không hiện lúc đánh) |

## 2. Cách làm

- Công cụ PixelLab: **`edit-image-pixen`**, lấy chính ảnh cũ làm khung. Cách này giữ đúng hình, cỡ và lề 9 mảnh.
  - Ảnh được đệm trong suốt lên bội số 4 vì PixelLab đòi vậy, rồi cắt lại.
  - Mỗi mô tả dùng một câu phong cách chung: *European fairy-tale storybook game UI, warm oak wood, polished brass, parchment, dark ink outline #18202A, crisp clean pixel art, no text, transparent background*.
  - Biểu tượng nhỏ dùng câu riêng: *pixel art game icon … no frame, no background plate*. Lý do: với câu chung, PixelLab hay tự thêm tấm giấy da phía sau biểu tượng.
- Mỗi mảnh chạy 2 seed (11, 23); mảnh nào chưa đạt thì chạy thêm seed 37 / 51 / 64 / 71 / 83.
  - Mảnh phải chạy lại: kiếm (còn cong), giọt độc và tinh thể băng (dính khung giấy), dấu trạng thái (dính khung).
  - Cũng chạy lại: phi tiêu đặc biệt (dính nền), ruột thanh (dải trắng thành giấy da), ruột thanh trùm, nút đổi (lòng bị thủng), máu quái (PixelLab từ chối khung 164×8, đệm lên 164×32 thì chạy được).
- Mã chỉ **cắt**, không vẽ hay vá điểm ảnh. Công cụ: `docs/review/ke-hoach-cai-thien/pixellab-hud/dung_hud_pl.py`.
  - Cắt bỏ phần đệm.
  - Đưa điểm nửa trong về 0 / 255 (thực tế PixelLab không trả điểm nửa trong nào).
  - Với khung thanh, khung 9 mảnh, ô vũ khí, nút vuông, nút đổi và ruột thanh trùm: giữ đúng **hình bóng ảnh cũ**. Điểm nào ở ảnh cũ trong suốt thì ở ảnh mới cũng trong suốt, nên lòng khung để game tự tô và lề 9 mảnh y như cũ.
- **Ảnh gốc PixelLab** đã chọn (40 ảnh, kèm `chon.json` ghi seed và chỗ cắt): `docs/anh-goc/pixellab-hud/`.
- **Tệp game mới:** 40 tệp `game/art/custom/gd-pl-<tên>.sprite.json`, tổng 181 KB.
  - Mỗi tệp cùng `rong` / `cao` / `net` / `vien` với ảnh cũ. Ruột thanh giữ `so` / `khung_cao` / `dai`.
- **Gắn vào game:** tệp mới `game/js/hud_pl.js` (nạp ngay sau `sprite_custom.js`, thêm 1 dòng trong `game/index.html`).
  - Khi game hỏi ảnh `gd-<tên>`, nó trả `gd-pl-<tên>` nếu ảnh PixelLab đã nạp. Chưa nạp thì vẫn dùng ảnh cũ, nên không có lúc trống nút.
  - Không đụng `sprite_custom.js` (bộ nạp), `vien_vk.js`, `cong_kiem.sh`, tách tấm ảnh của F4, cũng không đụng `ten_moi.js`, `ky_nang_quai.js`, `quai_pl.js`.
  - Vì đổi theo mã ảnh nên các màn khác dùng chung mảnh (ví dụ khung nhỏ, nút vuông ở hành trang / luyện) cũng đổi theo cho đồng bộ. Bố cục các màn đó không đổi.

## 3. Tự soát

- **Soát bằng mắt, phóng ×2–×5 trên nền rừng**:
  - Cả bộ cùng một nét. Viền tối, không chữ, không nhoè.
  - Nút to rõ là nút bấm được.
  - Thanh 9 mảnh kéo dài không vỡ góc: thanh máu lúc 12% máu vẫn gọn.
  - Ảnh so cũ / mới từng mảnh: [anh/bo-hud-cu-moi.png](anh/bo-hud-cu-moi.png).
- **Ảnh chụp headless** (trái: `?hudcu=1`, phải: mặc định PixelLab):

| Cảnh | 844×390 | 667×375 |
|---|---|---|
| Ải 1-1 đang đánh | [EN](anh/so-sanh-844x390-en-tran.png) · [VI](anh/so-sanh-844x390-vi-tran.png) | [EN](anh/so-sanh-667x375-en-tran.png) |
| Đánh trùm | [EN](anh/so-sanh-844x390-en-trum.png) · [VI](anh/so-sanh-844x390-vi-trum.png) | [EN](anh/so-sanh-667x375-en-trum.png) |
| Máu thấp (12%) | [EN](anh/so-sanh-844x390-en-mau.png) | (đã chụp, đạt) |
| Chiêu đang hồi, hết linh lực | [EN](anh/so-sanh-844x390-en-hoi.png) | [VI](anh/so-sanh-667x375-vi-hoi.png) |

  - Đủ 2 cỡ × 2 thứ tiếng × 4 cảnh × cũ/mới (64 ảnh): **0 lỗi trang**.
  - Bản mới nạp đủ 40/40 ảnh `gd-pl-*`. Với `?hudcu=1` thì game dùng lại HUD cũ.
- **Cổng kiểm `bash tools/phat-hanh/cong_kiem.sh`: ĐẠT** (802 giây)
  - 120 tệp JS: đạt.
  - Lưu mây: đạt. Bản lưu mẫu: đạt 47 + 26 mục.
  - Kiểm ảnh: 779 tệp, đạt.
  - Smoke test 14/14 bước đạt: vào 1-1, đi / đánh / né / đổi vũ khí, lưu → tải lại, `?cloud=0`, EN / VI.
  - Dung lượng:
    - Bản một tệp **27,46 MB / 30 MB**.
    - **Người chơi tải 19,70 MB / 20 MB** (40 ảnh mới chỉ thêm khoảng 0,1 MB WebP).
    - ⚠ Đã rất sát trần. Phiên sau thêm ảnh phải bớt ảnh cũ.

## 4. Chi phí PixelLab (số thật)

- Số dư `GET /balance` đầu phiên: **6.295,55**. Cuối phiên: **6.165,55 / 10.000 lượt** (gói Tier 3). Số dư giảm **130 lượt**.
- Nhật ký phiên ghi **116 lần vẽ thành công**, mỗi lần 1 lượt (`billing_usage.generations = 1`). Gồm:
  - 82 lần vòng 1 (41 mảnh × 2 seed)
  - 32 lần vòng 2 (chạy lại)
  - 4 lần vòng 3
- Ngoài ra có 1 lần thử ban đầu và 2 lần bị lỗi khung 164×8.
- Phần chênh còn lại có thể do phiên khác dùng chung tài khoản trong cùng lúc.
- Khoá PixelLab chỉ nằm trên máy chạy phiên (`/root/.plk`). Không có trong repo, báo cáo hay commit.

## 5. Quay lui

- **Nhanh, không cần sửa mã:** `?hudcu=1` cho ra HUD cũ y như trước. Cờ thêm ngày 05/11/2026; xoá khi chủ game chốt HUD PixelLab.
- **Gỡ hẳn:** revert commit của phiên này, hoặc xoá `game/js/hud_pl.js` cùng dòng `<script src="js/hud_pl.js">` trong `game/index.html`.
- **`?hudmoi=1`** (khung ChatGPT bản 2 của phiên D, mặc định tắt) **vẫn chạy như cũ**. Nó chỉ phủ khung ChatGPT lên trên HUD đang dùng.
  - **Đề xuất bỏ hẳn** vì hướng mỹ thuật nay là PixelLab. Phiên dọn dẹp xoá cờ đó trong `stage.js` và 7 tệp `gd-hud2-*`, sẽ bớt được khoảng 33 KB.

## 6. Việc còn lại / đề xuất

- Thẻ kháng / yếu (`gd-the-nho`) cần một bản PixelLab **màu trắng** để game nhuộm. Lần này giữ ảnh cũ.
- Bảng tên trùm dài, viền bậc ép đồ của ô vũ khí (`ep_do.js`) và khung bản đồ to vẫn là ảnh cũ. Có thể làm ở phiên sau.
- Dung lượng tải đầu đã sát 20 MB. Nên xoá bộ ảnh HUD cũ khi bỏ cờ `?hudcu`.
- Chưa thử trên iPhone thật, chỉ chụp headless ở cỡ màn iPhone ngang.

Commit: xem dòng commit "PixelLab HUD: bộ HUD trong trận vẽ bằng PixelLab (mặc định, ?hudcu=1 quay lui)" trên nhánh `khoi-tao-du-an`.
