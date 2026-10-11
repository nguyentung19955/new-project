# Làn D2b — Gộp khung cửi + lửa lò vào một tấm (Đợt 11 mục 9.2, phương án b — mặc định đã áp)

Đọc `CHUNG.md`; `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md` mục 3.3 và 9.2 (vì sao chưa gộp: hai nền khác màu, lệch dáng 37 %, trang Tách Làng mỗi lô dải ra đúng một tệp); `docs/review/lang-d2/bao-cao.md` (lô khung cửi 28×22 × 3 khung nền hồng tím, lửa lò 12×15 × 3 khung nền xanh dương, cách ghép dải, xem thử trong làng); `docs/review/lang-d3/bao-cao.md` (D3 vừa thêm 2 lô tấm kín ở cuối `tach-lang` — nối tiếp, không phá); `tools/tach-hieu-ung/index.html` phần `LO_GOP` (cách cắt tấm nhiều hàng → mỗi hàng một hiệu ứng, Đợt 11) để dùng lại ý tưởng. Dự kiến 1–1,5 giờ. Tệp được sửa: `tools/tach-lang/index.html` (phần dải khung: cho phép một lô "dải gộp" N hàng → N tệp; thêm lô mới ở CUỐI; hai lô lẻ giữ nguyên), `docs/review/lang-d2/PROMPT.md` (mục "Cách nhanh"), `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md` (ghi bổ sung mục 9.2 đã làm), `docs/review/lang-d2b/`. KHÔNG đụng `game/js`. Phiên song song: C5 (`tach-giao-dien`, `ui_theme.js`) và E1 (`tach-do`, `sprite_custom.js`) — không đụng.

## Làm
1. Lô mới "Làng · Khung cửi + Lửa lò (1 tấm, 2 hàng × 3 khung)": **đổi nền khung cửi sang xanh dương** cho cùng nền với lửa lò (kiểm màu khung cửi trong code: gỗ nâu/vàng — không lẫn xanh dương; ghi rõ). Ô dùng tỉ lệ của khung cửi (28×22), lửa lò căn giữa đáy ô; mỗi hàng cắt sát mép hình rồi xử lý **đúng đường cũ** của từng lô lẻ (co về cỡ, giảm màu chung, đặt sát đáy) → ra đúng 2 tệp với mã cũ. Nút "Tải tất cả (.zip)".
2. Xem thử trong làng: hiện được cả hai (khung cửi ở chỗ khung cửi, lửa ở lò rèn) từ một tấm.
3. Prompt gộp ghép từ hai prompt lẻ hiện có (không viết lại nội dung), chép vào `lang-d2/PROMPT.md` mục "Cách nhanh: 2 tấm thay 3" (12 đạo cụ + tấm gộp); prompt lẻ dời xuống "Dự phòng".

## Kiểm nhanh
Playwright: ảnh mẫu máy dựng 2 hàng × 3 cột nền xanh dương → 2 tệp ra đúng mã, đúng cỡ (168×44 và 72×30 nét gấp đôi), **giống từng byte** tệp từ hai lô lẻ với cùng hình; hai lô lẻ ở trang mới giống trang cũ từng byte; không lỗi JavaScript. `python3 game/build.py` không đổi. Ảnh kiểm `docs/review/lang-d2b/anh-kiem.png`.

## Kết thúc
`docs/review/lang-d2b/bao-cao.md` theo mục IV; cập nhật dòng D2 trong `TRANG-THAI.md` (số tấm 3 → 2) và dòng Đợt 11; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
