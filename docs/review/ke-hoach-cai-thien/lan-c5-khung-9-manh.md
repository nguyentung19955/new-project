# Làn C5 — Khung co giãn 9 mảnh bằng ảnh AI

Đọc `CHUNG.md`; `docs/review/kiem-ke-hinh-code.md` mục 6.2 (bắt buộc), 6.4 dòng C5; `docs/review/giao-dien/bao-cao.md` (cách cắt 9 mảnh `vien`, `SC.veGd`), `giao-dien-c1..c4/bao-cao.md` (các lô hiện có của trang `tach-giao-dien`, C4 vừa sửa `btn_art.js` — không đụng), `docs/review/ke-hoach-cai-thien/dot-8/bao-cao.md` (bảng thứ bậc hình ảnh, thanh máu trùm/tinh anh và ô vũ khí Đợt 8 vừa chỉnh — nối tiếp), `dot-8/bao-cao.md` §8b (viền hệ quanh thanh máu nhỏ của quái — không đụng `mobBars`); `docs/vfx/BANG-MAU-LOI.md`. Dự kiến 2 giờ. Tệp được sửa: `tools/tach-giao-dien/index.html` (thêm lô "Khung" ở CUỐI), `game/js/ui_theme.js` CHỈ các hàm `T.slot` (~355), `T.bar` phần viền (~311), `T.bossBar` (~268), `T.card` (~481) (C3 đã sửa `T.round/T.stageCard/T.drum` — không đụng), `docs/review/giao-dien-c5/`. KHÔNG làm `T.panel`, `T.btn`, `T.dialog` (đợt sau). Phiên song song: E1 (`sprite_custom.js` phần cánh, `tach-do`) và D2-gộp (`tach-lang`) — không đụng.

## Làm
1. **Lô "Khung 9 mảnh"** lưới 4×4 (16 ô, ô 32×32, hình là khung RỖNG ở giữa, 4 góc + 4 cạnh để co giãn): `gd-o-do-0..3` và `gd-o-do-0..3-chon` (8 ô đồ theo bậc, bản chọn sáng hơn), `gd-khung-mau`, `gd-khung-mana`, `gd-khung-xp`, `gd-khung-trum`, `gd-khung-trum-nho`, `gd-khung-tinh-anh`, `gd-the-thuong` (15 hình, 1 ô trống). Mỗi mã ghi `vien` (độ dày 4 cạnh để cắt 9 mảnh) — dùng cơ chế `vien` đang có; mảnh giữa trong suốt hoặc tô nền mờ theo code hiện tại (đọc code để quyết, ghi rõ).
2. **Móc game:** có ảnh → `SC.veGd` 9 mảnh co đúng cỡ đích (ô đồ 32×32 không co; thanh máu/mana/xp co ngang; khung trùm co ngang; thẻ co cả hai); lòng thanh máu (phần đổ màu) vẫn code; không có ảnh → code y cũ; xoá bộ nhớ đệm khi ảnh nạp xong. Màu thanh máu trùm/tinh anh và viền hệ của 8b không đổi.
3. Prompt một đoạn tiếng Việt kiểu lô C1–C4: tả từng khung theo code hiện có (màu viền `#14182e`, tông gỗ/đồng/ngọc theo bậc 0..3, hoa văn trống đồng ở góc khung trùm), dặn **phần giữa để trống (nền) vì game kéo giãn**, góc không hoa văn chạm cạnh. Nền hồng tím. Chép vào `docs/review/giao-dien-c5/PROMPT.md`.
4. Ghi dung lượng ước thêm.

## Kiểm nhanh (không chạy bộ test dài)
`node --check`, `python3 game/build.py`, một lượt Playwright: lưới mẫu máy dựng (khung có góc đánh dấu màu khác để kiểm 9 mảnh không bị kéo méo) → trang tách ĐẠT → nạp tạm → chụp 844×390 trận (thanh máu trùm, tinh anh, ô vũ khí 4 bậc + ô chọn) và hành trang (ô đồ 4 bậc, thẻ): góc khung phải nguyên dạng ở mọi cỡ; không có tệp → so ảnh = 0 khác. Ảnh kiểm `docs/review/giao-dien-c5/anh-kiem.png`. KHÔNG thêm ảnh vào `game/art/custom`.

## Kết thúc
`docs/review/giao-dien-c5/bao-cao.md` theo mục IV + PROMPT.md; cập nhật dòng C5 trong `TRANG-THAI.md`; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
