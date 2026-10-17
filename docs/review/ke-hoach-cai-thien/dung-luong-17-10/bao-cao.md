# Dung lượng 17/10: lấy lại chỗ cho ảnh mới

Làm sau khi cả 4 phiên chu-giua-font-that, binh-mau-goc, mau-bac, bao-truoc-tat đã đẩy báo cáo (chờ ~50 phút, không quá hạn). Số "trước" đo trên bản mới nhất của nhánh lúc đó (a4af7702), số "sau" trên bản này.

## Tóm tắt

| Số đo | Trước | Sau | Lấy lại | Mục tiêu |
|---|---:|---:|---:|---|
| Bản một tệp (`dist/linh-khi.html`, trần 30 MB) | 29,89 MB | **26,07 MB** | **3,82 MB** | ≥ 3 MB ✔ |
| Bản web — người chơi tải nếu đi hết 4 vùng (dòng "NGƯỜI CHƠI TẢI", trần 20 MB) | 19,54 MB | **19,02 MB** | **0,52 MB** | ≥ 2 MB ✘ (xem mục 4) |
| Bản web — tải đầu thật (trang + bìa + ảnh lõi, trước khi chọn vùng) | 5,54 MB | **5,08 MB** | 0,46 MB | |
| Trang web chính (nén) | 1,36 MB | 0,90 MB | 0,46 MB | ≤ 1,5 MB ✔ |

Còn chỗ: **bản một tệp 3,93 MB**, **bản web 0,98 MB** tới trần.

Hình trong game KHÔNG đổi: 30 cảnh chụp trước / sau giống nhau **từng điểm ảnh** ở cả bản một tệp và bản web (mục 5). Không đổi luật, số liệu, không bỏ cờ quay lui nào, không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## 1. Đã làm gì (nói gọn)

1. **Mã gọn** (−1,62 MB bản một tệp, −0,46 MB trang web nén). Mã game có rất nhiều dòng ghi chú tiếng Việt (~1 MB) và thụt lề. Khi đóng gói, `build.py` bỏ phần ghi chú và khoảng trắng thừa (hàm `gon_js`). Mã chạy **y hệt**: đã so bằng bộ đọc JS chuẩn (acorn) — từng từ, dấu, chuỗi, chỗ xuống dòng của cả 77 tệp trùng khớp bản gốc (`cong-cu/kiem_gon.py`). Tệp nguồn trong `game/js/` giữ nguyên ghi chú. Tắt: `LK_GON=0`.
2. **Bản một tệp nhúng WebP không mất** (−2,20 MB). Trước đây bản một tệp nhúng PNG; bản web đã dùng WebP từ 12/10. Nay bản một tệp cũng nhúng WebP cho ảnh nào nhỏ hơn PNG, **chỉ với ảnh không có điểm mờ** (mọi điểm hoặc trong hẳn hoặc đục hẳn: 624/683 ảnh). Lý do: thử thật trên Chromium, ảnh có điểm mờ vẽ từ WebP lệch 1–3/255 so với vẽ từ PNG (hai bộ giải mã làm tròn khác nhau) dù tệp y hệt từng điểm → 59 ảnh đó giữ PNG. Tắt: `LK_WEBP_MOT=0`.
3. **Bản to ×1,2 của Cu Tí trên web có thêm WebP** (−0,07 MB): `zed_moi.js` tải bản WebP khi trình duyệt đọc được, lỗi thì tải lại PNG như cũ.

Số đo chi tiết: `so-do-truoc.json`, `so-do-sau.json` (dựng lại: `python3 cong-cu/kiem_ke.py game/dist <tệp.json>`).

## 2. Kiểm kê theo nhóm (trước / sau)

Âm thanh: 0 (tiếng game tạo bằng mã, không có tệp âm thanh). Phông chữ: 0 (Google Fonts tải ngoài).

### Bản một tệp (linh-khi.html): 29.89 → 26.07 MB

| Nhóm | Số mục | Trước (MB) | Sau (MB) | Bớt (MB) |
|---|---:|---:|---:|---:|
| Trùm: Lâu đài cổ | 3 | 3.94 | 3.52 | 0.41 |
| Mã JS + HTML + CSS (không tính ảnh) | — | 3.92 | 2.30 | 1.62 |
| Hiệu ứng (hu-*) | 216 | 3.65 | 3.37 | 0.28 |
| Trùm: Rừng già | 3 | 3.25 | 2.98 | 0.27 |
| Ảnh nhân vật: Cu Tí (thân, vũ khí) | 7 | 2.99 | 2.79 | 0.20 |
| Quái thường / tinh anh: Hang biển | 12 | 2.37 | 2.18 | 0.19 |
| Trùm: Hang biển | 3 | 2.37 | 2.16 | 0.20 |
| Quái thường / tinh anh: Rừng già | 12 | 1.76 | 1.60 | 0.16 |
| Quái thường / tinh anh: Lâu đài cổ | 12 | 1.57 | 1.45 | 0.12 |
| Ảnh truyện (WebP, giải mã khi mở truyện) | — | 1.19 | 1.19 | — |
| Giao diện (gd-* khác: bảng, nút, bản đồ, icon) | 247 | 1.11 | 0.98 | 0.13 |
| Quái thường / tinh anh: Sông sâu | 4 | 0.42 | 0.36 | 0.06 |
| Bìa màn hình chính (2 bìa) + nền mờ màn tải | — | 0.39 | 0.39 | — |
| Ảnh nhân vật: em bé, người làng | 11 | 0.27 | 0.26 | 0.02 |
| Nền: làng | 22 | 0.20 | 0.18 | 0.02 |
| Nền / sàn / cửa / trang trí: Sông sâu | 20 | 0.15 | 0.11 | 0.04 |
| Nền / sàn / cửa / trang trí: Lâu đài cổ | 31 | 0.13 | 0.09 | 0.04 |
| Nền / sàn / cửa / trang trí: Hang biển | 31 | 0.13 | 0.08 | 0.05 |
| Nền / sàn / cửa / trang trí: Rừng già | 31 | 0.07 | 0.05 | 0.02 |
| Ảnh trong mã (thuong_cao_data…) | — | 0.01 | 0.01 | — |
| Giao diện: vật phẩm (vp-*) | 14 | 0.01 | 0.01 | — |
| Âm thanh | — | 0.00 | 0.00 | — |
| Phông chữ | — | 0.00 | 0.00 | — |
| **Tổng** | | **29.89** | **26.07** | **3.82** |

### Bản web — người chơi tải nếu đi hết 4 vùng: 19.54 → 19.02 MB

| Nhóm | Số mục | Trước (MB) | Sau (MB) | Bớt (MB) |
|---|---:|---:|---:|---:|
| Trùm: Lâu đài cổ | 3 | 2.64 | 2.64 | — |
| Hiệu ứng (hu-*) | 216 | 2.27 | 2.27 | — |
| Trùm: Rừng già | 3 | 2.23 | 2.23 | — |
| Ảnh nhân vật: Cu Tí (thân, vũ khí) | 11 | 2.07 | 2.00 | 0.07 |
| Trùm: Sông sâu | 3 | 1.76 | 1.76 | — |
| Quái thường / tinh anh: Hang biển | 12 | 1.63 | 1.63 | — |
| Trùm: Hang biển | 3 | 1.62 | 1.62 | — |
| Trang chính (mã + thông số hình), nén gzip | — | 1.36 | 0.90 | 0.46 |
| Quái thường / tinh anh: Rừng già | 12 | 1.19 | 1.19 | — |
| Quái thường / tinh anh: Lâu đài cổ | 12 | 1.08 | 1.08 | — |
| Giao diện (gd-* khác: bảng, nút, bản đồ, icon) | 247 | 0.69 | 0.69 | — |
| Quái thường / tinh anh: Sông sâu | 4 | 0.27 | 0.27 | — |
| Ảnh nhân vật: em bé, người làng | 11 | 0.19 | 0.19 | — |
| Bìa (1 bìa WebP, tải sớm) | — | 0.15 | 0.15 | — |
| Nền: làng | 22 | 0.13 | 0.13 | — |
| Nền / sàn / cửa / trang trí: Sông sâu | 20 | 0.08 | 0.08 | — |
| Nền / sàn / cửa / trang trí: Lâu đài cổ | 31 | 0.07 | 0.07 | — |
| Nền / sàn / cửa / trang trí: Hang biển | 31 | 0.06 | 0.06 | — |
| Nền / sàn / cửa / trang trí: Rừng già | 31 | 0.03 | 0.03 | — |
| Ảnh trong mã (ma-rieng) | — | 0.02 | 0.02 | — |
| Giao diện: vật phẩm (vp-*) | 14 | 0.00 | 0.00 | — |
| **Tổng** | | **19.54** | **19.02** | **0.52** |

### 40 mục lớn nhất — bản một tệp, SAU

| # | Hình | Nhóm | KB | (trước, KB) |
|---:|---|---|---:|---:|
| 1 | hoTinh-p3 | Trùm: Lâu đài cổ | 1276 | 1412 |
| 2 | hoTinh | Trùm: Lâu đài cổ | 1189 | 1355 |
| 3 | hoTinh-p2 | Trùm: Lâu đài cổ | 1141 | 1262 |
| 4 | mocTinh | Trùm: Rừng già | 1112 | 1206 |
| 5 | mocTinh-p3 | Trùm: Rừng già | 985 | 1068 |
| 6 | mocTinh-p2 | Trùm: Rừng già | 950 | 1051 |
| 7 | zed-moi | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 896 | 964 |
| 8 | nguTinh-p3 | Trùm: Hang biển | 769 | 831 |
| 9 | nguTinh-p2 | Trùm: Hang biển | 747 | 824 |
| 10 | nguTinh | Trùm: Hang biển | 697 | 765 |
| 11 | zed-lau | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 632 | 674 |
| 12 | zed-rung | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 602 | 646 |
| 13 | zed-bien | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 575 | 622 |
| 14 | cuaDa | Quái thường / tinh anh: Hang biển | 552 | 603 |
| 15 | hoLua | Quái thường / tinh anh: Lâu đài cổ | 382 | 405 |
| 16 | namChua | Quái thường / tinh anh: Rừng già | 377 | 404 |
| 17 | cuaDa-p2 | Quái thường / tinh anh: Hang biển | 355 | 375 |
| 18 | hoLua-p2 | Quái thường / tinh anh: Lâu đài cổ | 333 | 354 |
| 19 | cuaTuong | Quái thường / tinh anh: Hang biển | 305 | 334 |
| 20 | caNocChua | Quái thường / tinh anh: Hang biển | 276 | 304 |
| 21 | namChua-p2 | Quái thường / tinh anh: Rừng già | 276 | 291 |
| 22 | namPhongChua | Quái thường / tinh anh: Rừng già | 216 | 247 |
| 23 | hu-xoay-nuoc | Hiệu ứng (hu-*) | 186 | 205 |
| 24 | heoNanh | Quái thường / tinh anh: Rừng già | 183 | 206 |
| 25 | oc | Quái thường / tinh anh: Hang biển | 147 | 159 |
| 26 | hu-doi-pha | Hiệu ứng (hu-*) | 134 | 154 |
| 27 | haiQuy | Quái thường / tinh anh: Hang biển | 126 | 136 |
| 28 | huChua | Quái thường / tinh anh: Lâu đài cổ | 123 | 133 |
| 29 | gd-lang-nen | Nền: làng | 122 | 132 |
| 30 | cocTia | Quái thường / tinh anh: Sông sâu | 118 | 140 |
| 31 | gd-ban-do-vung | Giao diện (gd-* khác: bảng, nút, bản đồ, icon) | 118 | 132 |
| 32 | tuongMa | Quái thường / tinh anh: Lâu đài cổ | 117 | 136 |
| 33 | hu-dap-san | Hiệu ứng (hu-*) | 112 | 127 |
| 34 | hu-tien-hoa-ice | Hiệu ứng (hu-*) | 112 | 112 |
| 35 | hu-tien-hoa-poison | Hiệu ứng (hu-*) | 110 | 110 |
| 36 | baBa | Quái thường / tinh anh: Sông sâu | 102 | 113 |
| 37 | cua | Quái thường / tinh anh: Hang biển | 102 | 114 |
| 38 | nhimDoc | Quái thường / tinh anh: Rừng già | 92 | 98 |
| 39 | sua | Quái thường / tinh anh: Hang biển | 91 | 100 |
| 40 | socNo | Quái thường / tinh anh: Rừng già | 88 | 101 |

### 40 mục lớn nhất — bản web, SAU

| # | Hình | Nhóm | KB | (trước, KB) |
|---:|---|---|---:|---:|
| 1 | hoTinh-p3 | Trùm: Lâu đài cổ | 957 | 957 |
| 2 | hoTinh | Trùm: Lâu đài cổ | 891 | 891 |
| 3 | hoTinh-p2 | Trùm: Lâu đài cổ | 855 | 855 |
| 4 | mocTinh | Trùm: Rừng già | 834 | 834 |
| 5 | mocTinh-p3 | Trùm: Rừng già | 738 | 738 |
| 6 | thuongLuong | Trùm: Sông sâu | 730 | 730 |
| 7 | mocTinh-p2 | Trùm: Rừng già | 712 | 712 |
| 8 | nguTinh-p3 | Trùm: Hang biển | 576 | 576 |
| 9 | nguTinh-p2 | Trùm: Hang biển | 559 | 559 |
| 10 | thuongLuong-p2 | Trùm: Sông sâu | 543 | 543 |
| 11 | thuongLuong-p3 | Trùm: Sông sâu | 524 | 524 |
| 12 | nguTinh | Trùm: Hang biển | 522 | 522 |
| 13 | cuaDa | Quái thường / tinh anh: Hang biển | 413 | 413 |
| 14 | zed-moi (bản to ×1,2) | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 371 | 392 |
| 15 | hoLua | Quái thường / tinh anh: Lâu đài cổ | 286 | 286 |
| 16 | namChua | Quái thường / tinh anh: Rừng già | 283 | 283 |
| 17 | zed-moi | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 276 | 276 |
| 18 | cuaDa-p2 | Quái thường / tinh anh: Hang biển | 266 | 266 |
| 19 | zed-lau (bản to ×1,2) | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 263 | 276 |
| 20 | zed-rung (bản to ×1,2) | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 249 | 264 |
| 21 | hoLua-p2 | Quái thường / tinh anh: Lâu đài cổ | 249 | 249 |
| 22 | zed-bien (bản to ×1,2) | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 233 | 252 |
| 23 | cuaTuong | Quái thường / tinh anh: Hang biển | 228 | 228 |
| 24 | caNocChua | Quái thường / tinh anh: Hang biển | 206 | 206 |
| 25 | namChua-p2 | Quái thường / tinh anh: Rừng già | 206 | 206 |
| 26 | zed-lau | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 195 | 195 |
| 27 | zed-rung | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 186 | 186 |
| 28 | zed-bien | Ảnh nhân vật: Cu Tí (thân, vũ khí) | 183 | 183 |
| 29 | namPhongChua | Quái thường / tinh anh: Rừng già | 161 | 161 |
| 30 | hu-xoay-nuoc | Hiệu ứng (hu-*) | 139 | 139 |
| 31 | heoNanh | Quái thường / tinh anh: Rừng già | 137 | 137 |
| 32 | oc | Quái thường / tinh anh: Hang biển | 110 | 110 |
| 33 | hu-doi-pha | Hiệu ứng (hu-*) | 100 | 100 |
| 34 | haiQuy | Quái thường / tinh anh: Hang biển | 94 | 94 |
| 35 | huChua | Quái thường / tinh anh: Lâu đài cổ | 92 | 92 |
| 36 | gd-lang-nen | Nền: làng | 91 | 91 |
| 37 | gd-ban-do-vung | Giao diện (gd-* khác: bảng, nút, bản đồ, icon) | 88 | 88 |
| 38 | cocTia | Quái thường / tinh anh: Sông sâu | 88 | 88 |
| 39 | tuongMa | Quái thường / tinh anh: Lâu đài cổ | 87 | 87 |
| 40 | hu-dap-san | Hiệu ứng (hu-*) | 84 | 84 |


## 3. Tìm ảnh thừa — kết quả

| Điều tra | Kết quả |
|---|---|
| Ngư Tinh nhuộm cho Thuồng Luồng | **Không có ảnh riêng.** `?tlmoi=0` nhuộm màu ngay trên ảnh Ngư Tinh (ảnh này vẫn cần cho Hang biển). Thuồng Luồng thật 3 pha (~1,8 MB) đã chỉ có ở bản web từ 17/10; bản một tệp vốn vẽ hình tạm. Không có gì để bỏ. |
| Ảnh cờ quay lui đang bị nhúng | Tấm cũ `-muotcu`, `-netcu`, `-sancu`, ảnh nét cao `?netcao`: **đã không có** trong bản một tệp và **không tính** vào người chơi tải (web chỉ tải khi bật cờ). Còn lại: các hàng Cu Tí cũ nằm CHUNG trong tấm `zed-moi` (xem mục 6) — cờ còn mới, giữ. |
| Ảnh trùng nhau | Không có hai tấm trùng. Có 487 khung trùng nhau trong cùng tấm (chủ yếu khung chết lặp lại) nhưng PNG/WebP đã nén gần như hết phần lặp → không đáng làm. |
| Khung trống / viền trong suốt thừa | Quái, trùm: không thừa hàng / cột (như đo 16/10). Tấm Cu Tí có ~36 % ô "không có tên động tác" nhưng đó là lớp tay thứ hai mà mã dùng → không phải ô thừa. |
| Dời ảnh vùng sau sang tải lười (web) | **Đã có từ 14/10**: quái, trùm, nền của từng vùng chỉ tải khi chọn vùng đó. Con số 19,5 MB là **tổng nếu đi hết 4 vùng**, không phải tải đầu (tải đầu thật: 5,08 MB). |
| Nén lại PNG (oxipng / zopfli) | Không cài được (máy dựng không vào được kho pip/npm). Bản web vốn đã phát WebP cho 100 % ảnh nên PNG tốt hơn cũng không đổi số người chơi tải. |

## 4. Vì sao bản web chỉ bớt 0,52 MB (cần chủ game quyết)

Bản web đã phát WebP không mất cho mọi ảnh; không còn cách nén không mất nào nhỏ hơn mà vẫn giữ y hệt điểm ảnh. 19,02 MB gồm: trùm 4 vùng 8,2 MB, hiệu ứng 2,3 MB, Cu Tí 2,0 MB, quái thường / tinh anh 4,2 MB, còn lại (trang, giao diện, nền, người làng, bìa) ~2,3 MB. Muốn thêm ~26 tấm mới (Cá Trê 3 pha ~1,8 MB như Thuồng Luồng, 2 tinh anh, 4 quái thường ~0,4 MB, kiếm hệ, nền Rừng già…) cần thêm ~3 MB, còn 0,98 MB. Đề xuất (chọn một):

- **A (khuyên dùng)**: đổi thước đo trần 20 MB (Q5) thành **"tải đầu ≤ 8 MB + mỗi vùng ≤ 6 MB khi chọn vùng"** — đúng cách game tải từ 14/10. Hiện: tải đầu 5,08; Rừng 3,48; Biển 3,38; Lâu đài 3,82; Sông sâu 2,15 MB → mỗi vùng còn ≥ 2 MB.
- **B**: giữ cách đo tổng, nâng trần lên 24 MB.
- **C**: sau 19/10 bỏ các hàng Cu Tí cũ (mục 6) — chỉ được ~0,19 MB, không đủ.

Không đề xuất nén có mất ảnh trùm (Q5: không giảm chất lượng ảnh).

## 5. Kiểm tra

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py`, `--mot-tep`, `--hai-tep` | Đạt (số đo ở bảng đầu) |
| Tắt hết (`LK_GON=0 LK_WEBP_MOT=0`) | Bản một tệp ra đúng 29,89 MB, khác bản trước chỉ 3 chỗ sửa mã (đã so) |
| Mã gọn: so dãy mảnh 77 tệp bằng acorn (`cong-cu/kiem_gon.py`) | Đạt 77/77 |
| `node game/tests/*.test.js` (18 bài, có `cloud_save_regression`) | 18/18 đạt |
| Headless, mặc định, bản một tệp + bản web | 0 lỗi JS (chỉ có lỗi mạng sẵn có: phông Google, `sw.js` khi chạy máy) |
| **So điểm ảnh 30 cảnh** trước / sau (`cong-cu/so_canh.py`): làng + 8 bảng giao diện, 4 vùng × (phòng quái, tinh anh, trùm nhỏ, trùm vùng), bản đồ ải, tạm dừng, túi đồ, đánh bằng thương | **Bản một tệp 30/30 y hệt. Bản web 30/30 y hệt.** |
| Cờ quay lui (6 cảnh mỗi cờ, trước / sau) | Một tệp `?hangcu=1`, `?kiemnang=0`, `?kiemvuong=0`, `?kiemmoi=0`, `?buamoi=0`, `?tlmoi=0`: y hệt, 0 lỗi. Web `?tlmoi=0`, `?netcu=1`, `?sanmoi=0`, `?anhmuotcu=1`, `?webp=0`, `?hangcu=1`, `?kiemnang=0`: y hệt, 0 lỗi. Các cờ vẫn có tác dụng (hình khác bản mặc định đúng chỗ). |

Cách chụp: đồng hồ giả + số ngẫu nhiên có hạt giống, chờ mọi ảnh tải xong rồi mới chụp; chụp hai lần cùng một bản ra y hệt (đã thử). Không chơi tay. Ảnh 30 cảnh (bản sau): [anh/30-canh-sau.jpg](anh/30-canh-sau.jpg).

Ghi chú phụ (có từ trước, không do phiên này): trên web, ảnh có điểm mờ vẽ từ WebP lệch 1–3/255 so với PNG (`?webp=0`), mắt không thấy.

## 6. Cờ quay lui và dung lượng

Không bỏ cờ nào: không có cờ nào vừa "cũ hơn 2 ngày" vừa còn tốn chỗ ở bản một tệp hay trong số người chơi tải.

| Cờ | Ngày | Ảnh riêng | Bản một tệp | Web (người chơi tải) | Đề xuất |
|---|---|---|---|---|---|
| `?anhmuotcu=1` | 15/10 | 8 tấm cũ, trên máy chủ 3,5 MB (PNG + WebP) | không có | không tính | bỏ khỏi máy chủ sau 18/10 |
| `?netcu=1` | 17/10 | 12 tấm Cu Tí / quái cũ, máy chủ 3,1 MB | không có | không tính | giữ |
| `?sanmoi=0` | 17/10 | 16 sàn cũ, máy chủ 0,3 MB | không có | không tính | giữ |
| `?netcao=3` / `4` | 17/10 | máy chủ 33,7 / 53,9 MB | không có | không tính | giữ (thử nghiệm) |
| `?tlmoi=0` | 17/10 | không có (nhuộm Ngư Tinh) | — | 0 | giữ |
| `?hangcu=1`, `?kiemmoi=0`, `?buamoi=0` | 16/10 | hàng cũ trong tấm `zed-moi` + bản to | ~0,25 MB | ~0,19 MB | sau 19/10 có thể tách hàng cũ ra tấm chỉ tải khi bật cờ |
| `?kiemnang=0` | 17/10 | (cùng các hàng kiếm cũ ở trên) | trong số trên | trong số trên | như trên |
| `?kiemvuong=0`, `?taivung=0`, `?webp=0` | 12–17/10 | không có ảnh riêng | 0 | 0 | giữ |

## 7. Tệp đã đổi

- `game/build.py`: `gon_js` (mã gọn), `webp_mot` + `alpha_gon` (bản một tệp nhúng WebP), WebP cho bản to Cu Tí ở bản web. Cờ tắt `LK_GON=0`, `LK_WEBP_MOT=0`.
- `game/js/sprite_custom.js`, `game/js/fx_anh.js`: nhận ảnh `data:image/webp` (bản một tệp).
- `game/js/zed_moi.js`: tải `tam_to_webp` khi có, lỗi thì PNG.
- `game/dist/*`, `tools/xuong-sprite/index.html`: dựng lại.
- `docs/review/ke-hoach-cai-thien/dung-luong-17-10/`: báo cáo, số đo, công cụ (`kiem_ke.py`, `so_canh.py`, `kiem_gon.py`, `kiem_gon.js`), ảnh.

Ảnh mới sau này: cứ thêm như cũ; bản một tệp tự nhúng WebP. Ảnh to chỉ cho web (như Thuồng Luồng) đánh dấu `chi_hai_tep` để không tốn chỗ bản một tệp.
