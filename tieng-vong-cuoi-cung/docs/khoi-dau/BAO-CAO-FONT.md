# Báo cáo – Font chữ + sửa lỗi (02/11/2026)

## 1. Đổi font toàn game (100%) – Phương án A của ChatGPT
- **Một chỗ duy nhất:** `game/giao-dien/chu.css` (nạp Handjet + Spectral + IBM Plex Sans, biến `:root` màu/bóng S1–S4, lớp A1–A9) và `game/giao-dien/chu.js` (cùng tên font cho chữ vẽ trên canvas, chờ font tải xong tối đa 2,5 s, bóng S1).
- Đã bỏ hẳn Alegreya Sans / Cormorant Garamond ở: màn tiêu đề, Options, Account, hộp xung đột lưu, màn tải, thẻ tên vùng, tạm dừng, màn xoay máy, Làng (nút, gợi ý, bảng teleport), hộp thoại cốt truyện + phim mở đầu, Vùng 1, Vùng 2, phòng demo, bảng hệ thống (Lattice), Nhật ký bí mật, ô đăng nhập.
- Chữ canvas: HUD số, bia chỉ đường, thông báo, bản đồ → Handjet; tên phòng / tên trùm / băng rôn → Spectral.
- Nút tiêu đề: Continue 23px, nút phụ 21px, chữ căn giữa tấm phẳng trong khung ảnh (viền ảnh chừa góc chuông/rễ, nhích lên 1px theo tấm). "Early build" + dòng nơi lưu: IBM Plex Sans 14px #C5A477.
- Huy hiệu xung đột: giờ là **cảnh báo riêng** bằng chữ ("Two saves found" + **REVIEW SAVES** màu cam cảnh báo), không khung nút, nằm trên cột, không lấn Continue.
- `firebase.json`: file .css không bị trình duyệt giữ bản cũ nữa (trước có thể là lý do "chưa thấy font đổi").
- Lưu ý: máy kiểm thử của phiên này **không tải được Google Fonts** (mạng chặn), nên ảnh chụp kiểm dùng font dự phòng (rộng hơn Handjet). Chữ đã vừa khung ngay cả với font rộng hơn → với Handjet thật sẽ còn dư chỗ.

## 2. Lỗi nền màn tiêu đề (100%)
- Nền đổi từ ảnh nền CSS sang ảnh thật `object-fit: cover`, kích thước tường minh (100vw × 100vh/100dvh), tâm ngang 60% để quả chuông luôn trong khung và cột nút rơi vào phần sương bên phải.
- Kiểm 844×390, 667×375, 1920×953, 1024×768: nền phủ kín cả 4 (đo khung nền = đúng cỡ màn).

## 3. Lỗi "Kiếm Khách quay lưng, xám, lơ lửng" (100%)
- **Đã tái hiện đúng ảnh người dùng** ở phòng Termite Fork (P02 – hang tối có cờ treo): nhân vật ở tư thế **treo dây** (nhìn từ sau lưng, màu tóc/áo xám nhạt trong bóng tối) giữa khoảng không.
- **Nguyên nhân gốc (b):** engine tự kéo cột dây leo lên tới trần ở mọi cột có dây, nhưng ảnh phòng vẽ sẵn chỉ có dây một đoạn. P02 có **14 ô "dây tàng hình"**: nhảy lên giữa không trung + bấm/đẩy cần lên là bám vào khoảng không.
- **Cách sửa:** chỉ kéo dây lên những ô mà **ảnh phòng thật sự có vẽ dây** (đọc điểm ảnh của ảnh phòng). Dây có hình vẫn leo bình thường (P05, P09… giữ nguyên).
- Các khả năng khác đã kiểm:
  (a) lớp sức mạnh `mat-na-nut-1` thiếu `bamtuong/`, `dapdat/`: code đã bỏ qua lớp (không vẽ thay) – nay chỉ dò khung đầu nên hết loạt lỗi 404 f00–f14;
  (c) loé trắng khi trúng đòn chỉ 7 bước (~0,12 s) rồi hết, không để lại màu;
  (d) Màn Tang không giữ/đổi trạng thái nhân vật (chỉ gây trúng đòn thường).
- **Phép thử chống tái phát:** `tools/vung-1/kiem-thu-nv-treo.js` – 12/12 (mọi ô dây ở 9 phòng Vùng 1 + 16 phòng Vùng 2 đều có hình; bấm ↑ giữa không trung ở P02 không bám; đánh nhau với Màn Tang ở P04/P09 không có khung treo dây sai chỗ; loé trắng ≤ 8 bước; lớp thiếu ảnh không vẽ gì).

## 4. Tên mã nội bộ (100%)
- Bản đồ Vùng 1/2: nhãn ô phòng đổi từ "P01/R201" sang tên tiếng Anh (Root Gate, Termite Fork…), tự thu nhỏ cho vừa ô. Không còn chỗ nào khác người chơi thấy mã.

## Kết quả kiểm
| Phép thử | Kết quả |
|---|---|
| khoi-dau/kiem-thu-luong.js (cập nhật cỡ chữ 19–23) | 38/38 |
| vung-1/kiem-thu-nv-treo.js (mới) | 12/12 |
| vung-1/kiem-thu-f.js | 66/66 |
| vung-1/kiem-thu-g.js, kiem-thu-h.js | 0 hỏng |
| vung-2/kiem-thu-dat-muc.js | 33/33 |
| firebase/kiem-tra-dang-nhap.js | 28/28 |
| cot-truyen/kiem-tra-lang.js | đạt hết |

Ảnh đã tự xem (ngoài repo): tiêu đề (4 cỡ màn, có huy hiệu), Options, Account, tạm dừng, làng + hộp thoại Vesper + bảng teleport, Vùng 1 HUD + thẻ tên vùng, Vùng 2, bản đồ.
