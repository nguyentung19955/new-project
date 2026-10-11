# Làn C4 — Thân nút, ô vũ khí, cần điều khiển bằng ảnh AI

Đọc `CHUNG.md`; `docs/review/kiem-ke-hinh-code.md` mục 6.2 (bắt buộc), 6.4 dòng C4; `docs/review/giao-dien-c1/bao-cao.md` (C1 móc biểu tượng nút trong `btn_art.js` — nối tiếp), `giao-dien-c2/bao-cao.md`, `giao-dien-c3/bao-cao.md` (trang `tach-giao-dien` các lô hiện có, kiểu `gd-*`, nét gấp đôi, "Tải tất cả"); `docs/review/ke-hoach-cai-thien/dot-8/bao-cao.md` (Đợt 8: nút Đánh nay màu đồng vàng `#c98c34`, bảng thứ bậc hình ảnh — ảnh thân nút phải giữ màu này cho nút Đánh và đỏ KHÔNG dùng cho nút); `docs/review/ke-hoach-cai-thien/dot-2/bao-cao.md` mục 2 (cỡ/vị trí nút đã chốt — không đổi); `docs/vfx/BANG-MAU-LOI.md`. Dự kiến 2 giờ. Tệp được sửa: `tools/tach-giao-dien/index.html` (thêm 2 lô ở CUỐI), `game/js/btn_art.js` (`buildBase` ~480, `buildSlot` ~735, `buildStickBase` ~800, `buildKnob` ~820), `docs/review/giao-dien-c4/`. Phiên song song: D3 (`village_scene.js`, `tach-lang`) và B4 (`fx*.js`, `tach-hieu-ung`) — không đụng.

## Làm
1. **Lô "Thân nút" lưới 4×3** (theo lane plan): `gd-vong-thuong/fire/poison/ice` 76×76 (vòng nút to theo hệ; bản thường màu đồng vàng cho nút Đánh), `gd-vong-ngoc`, `gd-vong-sat` 56×56, `gd-nut-vuong` 42×42, `gd-can-de` 66×66, `gd-can-num` 30×30 (2 ô trống cuối). **Lô "Ô vũ khí" 2×2:** `gd-o-vk-0..3` 54×35 theo bậc. Đọc `btn_art.js` để tả đúng hình dạng hiện có (vành, hoa văn trống đồng, bóng) — "tất cả hình vẽ code phải có trong prompt".
2. **Móc game:** có ảnh thì `blit` ảnh đúng lưới nguyên (không lệch nửa điểm), trạng thái bấm/khoá/đang cầm game tự làm tối/sáng từ một ảnh như code hiện làm; biểu tượng (C1) vẫn vẽ đè lên thân như cũ; không có ảnh → code y cũ. Xoá bộ nhớ đệm nút khi ảnh nạp xong (nút vẽ sẵn vào canvas đệm).
3. Prompt một đoạn tiếng Việt theo kiểu lô C1–C3, bảng màu nhóm kim loại/đồng/hệ, nền hồng tím (vòng hệ lửa nền xanh dương nếu cần — ghi rõ), không chữ. Chép vào `docs/review/giao-dien-c4/PROMPT.md`.
4. Ghi dung lượng ước thêm.

## Kiểm nhanh (không chạy bộ test dài)
`node --check`, `python3 game/build.py`, một lượt Playwright: ảnh lưới mẫu máy dựng → trang tách ĐẠT → nạp tạm vào game → chụp 844×390 trận có đủ nút, ô vũ khí 4 bậc, cần điều khiển đang kéo; kiểm vị trí/cỡ nút trùng bản trước (toạ độ `blit`); không có tệp → so ảnh = 0 khác. Ảnh kiểm `docs/review/giao-dien-c4/anh-kiem.png`. KHÔNG thêm ảnh vào `game/art/custom`.

## Kết thúc
`docs/review/giao-dien-c4/bao-cao.md` theo mục IV + PROMPT.md; cập nhật dòng C4 trong `TRANG-THAI.md`; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
