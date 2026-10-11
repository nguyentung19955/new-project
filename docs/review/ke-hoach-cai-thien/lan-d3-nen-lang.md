# Làn D3 — Nền làng và tranh bản đồ vùng bằng ảnh AI

Đọc `CHUNG.md`; `docs/review/kiem-ke-hinh-code.md` mục 6.2 (bắt buộc), 6.4 dòng D3; `docs/review/lang-d1/bao-cao.md` (trang Tách Làng, kiểu lô `vat/icon/gian`, mục "Hướng dẫn cho phiên D2 và D3", lớp phủ chỗ không đi được), `docs/review/lang-d2/bao-cao.md`; `docs/review/giao-dien-c3/bao-cao.md` (C3 vừa móc `village.js titleLogo` và thẻ ải trong `ui_theme.js` — không phá); `docs/review/ke-hoach-cai-thien/dot-10/bao-cao.md` mục 5 và 11.4 (dung lượng: hình lớn hiện rơi vào trang chính; `build.py` in cảnh báo khi trang chính > 5 MB — ghi số đo vào báo cáo, KHÔNG tự đổi luật `bat_buoc`); `docs/vfx/BANG-MAU-LOI.md`. Dự kiến 2 giờ. Tệp được sửa: `tools/tach-lang/index.html` (thêm 2 lô ở CUỐI), `game/js/village_scene.js` (`Bt.ground` trong `build()` ~365–378; `VS.mapArt` ~944), `docs/review/lang-d3/`. Phiên song song: B4 (`fx_he.js`, `fx.js pool`, `fx_chuong.js`, `tach-hieu-ung` phần thêm mục) và C4 (`btn_art.js`, `tach-giao-dien`) — không đụng.

## Làm
1. **Lô "Làng · Nền làng (1 tấm kín)"** → `gd-lang-nen` 720×270: kiểu lô MỚI "cả ảnh là một hình, không tách nền" (tham khảo `tachKhung` ở Tách Giao Diện), kéo giãn/cắt về đúng 720×270 giữ tỉ lệ. Prompt tiếng Việt một đoạn: dặn **GỬI KÈM ảnh chụp nền code** (trang có nút "Tải ảnh tham chiếu" dựng từ chính `village_scene.js` vẽ nền không có nhà/người/đạo cụ, kèm lớp phủ mờ vùng đi được) và phải giữ đúng vị trí đường đất, sông, ao, sân đình, bờ cỏ; tả chất liệu (cỏ, đất, nước, đá), ánh sáng chiều, bảng màu nhóm cỏ cây/đất/nước; không chữ, không nhân vật, không nhà.
2. **Lô "Làng · Tranh bản đồ vùng (1 tấm kín)"** → `gd-ban-do-vung` 480×270: tương tự, ảnh tham chiếu là tranh code hiện tại có 15 chấm ải; prompt dặn giữ đúng vị trí 15 ải (vẽ địa hình, không vẽ chấm/thẻ — game vẽ thẻ ải đè lên). Nếu `VS.mapArt` vẽ theo vùng (3 tranh) thì làm 3 mã `gd-ban-do-vung-<rung|bien|lau>` và ghi rõ.
3. **Móc game:** có tệp thì vẽ ảnh, không thì code y cũ; soát mỗi khung hình như `anhNha` để ảnh nạp chậm vẫn lên; xoá bộ nhớ đệm nền khi ảnh nạp xong. Vùng đi được, va chạm, vị trí nhà/người KHÔNG đổi (ảnh chỉ là lớp nền).
4. **Lớp phủ soi lệch** ở bước xem thử: bật/tắt lớp phủ vùng đi được và vị trí 15 ải lên ảnh người dùng đưa vào, để thấy đường/sông vẽ lệch bao nhiêu.
5. Prompt chép vào `docs/review/lang-d3/PROMPT.md`; báo cáo ghi dung lượng ước (2 ảnh lớn, nét gấp đôi hay nét thường — đề xuất nét thường cho nền để nhẹ, ghi lý do) và tác động lên trang chính 5 MB.

## Kiểm nhanh (không chạy bộ test dài)
`node --check`, `python3 game/build.py`, một lượt Playwright: dựng ảnh mẫu 720×270 và 480×270 bằng máy → đưa vào trang → nạp tạm vào game qua xuong-sprite.html → chụp làng và bản đồ có nền ảnh; không có tệp → so ảnh = 0 khác. Ảnh kiểm `docs/review/lang-d3/anh-kiem.png`. KHÔNG thêm ảnh vào `game/art/custom`.

## Kết thúc
`docs/review/lang-d3/bao-cao.md` theo mục IV + PROMPT.md; cập nhật dòng D3 trong `TRANG-THAI.md`; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
