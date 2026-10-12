# Tải nhanh (12/10): ảnh rời, WebP, tải theo nhu cầu

Phiên "tải nhanh". Xử lý V4 trong `docs/review/kiem-thu-12-10/tester-3-hieu-nang.md`.

## Tóm tắt

- Trang chính không còn chứa ảnh. Kích thước sau nén giảm từ **2,70 MB xuống 0,81 MB**. Mỗi ảnh nay là một tệp riêng `anh/<mã>.<mã nội dung>.webp`, nén **WebP lossless**, nên giữ đúng từng điểm ảnh. Ngoài ra vẫn có thêm một bản `.png` để dự phòng.
- Lượng người chơi phải tải giảm từ **18,6 MB xuống 5,8 MB**. Riêng máy không đọc được WebP thì vẫn phải tải 17,5 MB.
- Ở mạng 4G, CPU chậm ×4: màn chào hiện sau **3,6 giây** (trước đây 5,9 giây), đạt mục tiêu ≤ 4 giây. Ở mạng 3G: màn chào **7,8 giây** (trước 18 giây), tải đủ mọi ảnh sau **44 giây** (trước 101 giây).
- Ảnh được tải theo thứ tự ưu tiên:
  1. hình game đang cần vẽ;
  2. hình của màn chào và làng;
  3. quái của vùng đang chơi;
  4. hiệu ứng và vũ khí;
  5. quái của vùng khác;
  6. trùm và dáng pha, tải sau cùng, hoặc ưu tiên lên khi vào ải 4–5.

  Ảnh nào chưa về thì game vẽ bằng code.
- So điểm ảnh 10 cảnh mẫu: kết quả **giống hệt** bản một tệp, với cả WebP lẫn PNG dự phòng. Khi chặn hết ảnh, game vẫn chơi được và không có lỗi trang nào.

## Dung lượng

Số đo dưới đây lấy trên 611 hình (commit `02108cb`). Sau khi gộp với ảnh mới của phiên khác (614 hình), build cho ra: trang chính nén 0,84 MB, WebP 5,43 MB, PNG 16,2 MB. So điểm ảnh chạy lại sau khi gộp vẫn ra 0 điểm khác.

| | Trước (Đợt 10, 2 tệp) | Sau (ảnh rời) |
|---|---|---|
| Trang chính (gốc / nén gzip) | 5,12 MB / **2,70 MB** | 2,77 MB / **0,81 MB** (mã game + thông số 611 hình) |
| Ảnh | 1 tệp JSON base64 20,4 MB (15,9 MB nén) | 607 tệp WebP, tổng **5,02 MB** (bằng 30 % PNG gốc) |
| Tổng người chơi tải | **18,6 MB** | **5,8 MB** |
| Gói PNG dự phòng (máy không đọc WebP) | – | 0,81 + 16,7 = 17,5 MB |
| Trên máy chủ | 26 MB | 0,8 + 21,7 MB (WebP + PNG) + bản một tệp 25 MB cho công cụ |

Tất cả 607 ảnh đều cho bản WebP nhỏ hơn PNG. Lúc đóng gói, mỗi ảnh WebP được giải mã ngược lại và so với PNG: điểm ảnh RGBA trùng khớp hoàn toàn. Ảnh nào không khớp thì sẽ không dùng bản WebP.

## Thời gian tải (giây, tính từ lúc mở trang)

Cách đo: dùng `tai2.py` trên Chromium, giả lập iPhone ngang. Máy chủ `srv_h2.js` chạy HTTPS + HTTP/2 giống Firebase (có gzip, ETag, immutable).

Băng thông được bóp **ở phía máy chủ**, với hai mức: 4G = 9 Mbps, trễ 170 ms; 3G chậm = 1,5 Mbps, trễ 300 ms. Phải làm vậy vì giả lập mạng của DevTools không bóp các yêu cầu đi qua service worker, khiến số đo lần 1 của bản cũ đẹp giả tạo.

"Trước" là bản build từ commit `02108cb`. Số liệu chi tiết ở `tai-truoc.json` và `tai-sau.json`.

| Mạng · CPU · lượt | Màn chào trước → sau | Đủ ảnh làng (sau) | Đủ mọi ảnh trước → sau | Chạm → vào làng trước → sau | Long task sau khi vào làng (ms) |
|---|---|---|---|---|---|
| 4G · ×1 · lần 1 | 4,4 → **2,7** | 5,1 | 19,1 → **12,8** | 0,16 → 0,18 | 59 → 0 |
| 4G · ×1 · lần 2 | 1,3 → **0,8** | 2,0 | 3,9 → 3,2 | 0,13 → 0,17 | 113 → 0 |
| 4G · ×4 · lần 1 | 5,9 → **3,6** | 7,8 | 20,0 → **17,2** | 0,38 → 0,35 | 4 778 → 3 887 |
| 4G · ×4 · lần 2 | 5,3 → **3,5** | 4,5 | 13,1 → **8,8** | 0,39 → 0,23 | 3 792 → 2 452 |
| 3G · ×1 · lần 1 | 16,6 → **6,5** | 11,4 | 99,8 → **39,5** | 0,16 → 0,35 | 72 → 0 |
| 3G · ×1 · lần 2 | 1,2 → **0,9** | 2,4 | 4,0 → 4,1 | 0,16 → 0,13 | 225 → 0 |
| 3G · ×4 · lần 1 | 18,0 → **7,8** | 14,8 | 100,7 → **43,8** | 0,43 → 0,26 | 5 300 → 7 909* |
| 3G · ×4 · lần 2 | 4,8 → **3,3** | 4,4 | 12,8 → **8,8** | 0,42 → 0,31 | 3 911 → 1 955 |

\* Ở bản cũ, khi mạng 3G, ảnh về chậm nên tới 100 giây mới xong. Cột long task chỉ đếm trong khoảng thời gian đã đo. Ở bản mới, cùng lượng việc đó dồn vào 44 giây.

Khung hình tệ nhất (CPU ×4) giảm từ 1,4–1,6 giây xuống 0,6–1,0 giây. Chạm ở màn chào không bị trễ: mọi lượt đều dưới 0,7 giây.

## So điểm ảnh (`so_diem_anh.py`, kết quả ở `so-diem-anh.json`)

Gốc so sánh là bản một tệp, với ảnh PNG nhúng sẵn và cùng mã game. Có 10 cảnh: màn chào, làng, em bé mặc đồ (đủ 5 ô), phòng quái ở 3 vùng, 3 trùm, và hiệu ứng (chém, kỹ năng, chưởng).

| Bản | Số điểm ảnh khác |
|---|---|
| Ảnh rời WebP | **0** ở cả 10 cảnh |
| Ảnh rời, giả lập trình duyệt không đọc WebP (tự chuyển sang PNG) | **0** |
| Ảnh rời `?webp=0` | **0** |
| Cờ tắt `LK_ANH_ROI=0` (về cách Đợt 10) | 0. Riêng màn chào lệch ở dòng "Phiên bản lk-…", vì giờ đóng gói khác |
| Bản một tệp của commit trước (`02108cb`) | như dòng trên: chỉ lệch dòng phiên bản |

Có một lỗi ẩn được tìm ra và sửa trong `engine.js` `ui.begin`. Khi chữ LINH KHÍ vẽ bằng code (lúc ảnh logo chưa về), nó đặt `lineJoin = 'round'` mà không trả lại. Hậu quả: góc khung HUD linh khí trong ải bị tròn đi suốt phiên chơi. Nay mỗi khung hình đặt lại `lineJoin` / `lineCap` về mặc định.

## Dự phòng và chặn ảnh (`chan_anh.py`, kết quả ở `chan-anh.json`)

| Kiểm | Kết quả |
|---|---|
| Chặn mọi tệp `anh/` | Mỗi ảnh được thử 3 lần (lần đầu, sau 3 giây, sau 10 giây) rồi thôi. Màn chào hiện "Mạng yếu: thiếu vài ảnh…". Trùm Mộc Tinh vẽ bằng code, đánh được. **0 lỗi trang** |
| Chặn riêng `.webp` | Từng ảnh tự tải bản PNG. Sau 3 ảnh WebP hỏng thì cả game chuyển hẳn sang PNG. Đủ 607/607 ảnh |
| Trình duyệt không đọc WebP | Lúc khởi động có kiểm một lần bằng ảnh WebP 1×1, sau đó chỉ tải PNG (có so điểm ảnh ở bảng trên) |
| Bản nguồn `game/index.html`, bản một tệp `dist/linh-khi.html` | Chạy như cũ, 0 lỗi trang |
| `node --check` mọi tệp JS, bài kiểm tra lưu mây | Đạt |

## Đã đổi

- `game/build.py`: thêm hàm `anh_roi`, ghi `dist/anh/*.webp|png` và trang chính chỉ chứa thông số hình. Kết quả mã hoá WebP được lưu đệm ở `game/.dem-webp/` (đã gitignore). Mã hoá với method=6 mất khoảng 2,5 phút cho 600 ảnh trên 2 lõi; các lần build sau gần như tức thì. Trần cập nhật:
  - trang chính nén ≤ 1,5 MB;
  - ảnh trên máy chủ ≤ 26 MB;
  - bản một tệp ≤ 30 MB.

  Các trần này chỉ cảnh báo, không chặn build.
- `game/js/sprite_custom.js`: thêm khối "ẢNH RỜI", gồm hàng chờ ưu tiên, kiểm WebP, tải lại khi lỗi, và báo dần cho game theo từng đợt ngắn. `SC.get`, `MA.draw`, đồ, giao diện, `fx_anh.js` báo "đang cần" để hình đó được tải ngay. Khi vào ải 4–5 thì ưu tiên trùm của vùng. Tải xong thì xoá ảnh bản cũ khỏi bộ nhớ máy.
- `game/web/sw.js`: các tệp `anh/<mã>.<hash>.*` dùng cách lấy từ bộ nhớ trước (cache-first).
- Workflow: cài Pillow, lưu đệm `game/.dem-webp`, chép thư mục `anh/` lên site, thêm header `/anh/**` immutable. Biến `ANH_ROI: '1'`.
- Bản một tệp (dùng cho công cụ tach-*, GitHub Pages, Xưởng Sprite) **không đổi**.

## Cờ tắt (quay về cách cũ, không cần sửa code game)

| Cờ | Tác dụng |
|---|---|
| Workflow `ANH_ROI: '0'` (hoặc build `LK_ANH_ROI=0` / `--anh-json`) | Quay về cặp tệp của Đợt 10 (`linh-khi-anh.<mã>.json`) |
| Workflow `HAI_TEP: '0'` | Dùng bản một tệp như trước nữa |
| Build `LK_WEBP=0` | Ảnh rời chỉ có PNG |
| Trong game `?webp=0` hoặc `G.ANH_WEBP = false` | Buộc tải PNG |

## Còn lại / ghi chú

- Ở CPU ×4, việc giải mã cùng lúc 600 ảnh vẫn tốn khoảng 8 giây máy, kể cả khi ảnh đã nằm sẵn trong bộ nhớ đệm. Đây là phần việc của V3/V2 (bộ nhớ, giải mã), không thuộc phạm vi phiên này.
- Đường dẫn ảnh tương đối `anh/…`, nên trang phải đặt ở gốc site, như hiện nay.
- Cách đo lại: chạy `srv_h2.js` (đặt `LK_TLS_DIR`, `LK_MBPS`, `LK_RTT`) rồi chạy `tai2.py … may-chu`. Xem hướng dẫn ở đầu mỗi tệp. Chứng chỉ tự ký phải được tin cậy, nếu không Chrome sẽ không lưu đệm. Ngoài ra không được dùng `pg.route`, vì nó tắt bộ nhớ đệm HTTP; script cũ `kiem-thu-12-10/tai.py` mắc lỗi này.
