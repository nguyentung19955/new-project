# Làn E1 — Cánh theo cấp bằng ảnh AI (phần còn lại của E1)

Đọc `CHUNG.md`; `docs/review/kiem-ke-hinh-code.md` mục 6.2 (bắt buộc), 6.4 dòng E1; `docs/review/ke-hoach-cai-thien/dot-3/bao-cao.md` (thân theo áo, tệp `ghep-smith`, cánh luôn khoác rời), `dot-5/bao-cao.md` (neo, `bam/bam_vk`, trang Tách Đồ), `docs/review/bo-trang-phuc/bao-cao.md`, `docs/review/ke-hoach-cai-thien/RA-SOAT-SPRITE-VA-TRANG-BI.md` (phần cánh nếu có). 6 đồ lưng đã nhập 11:25 (`game/art/custom/tp-backs-*.sprite.json`) — phần "3 đồ lưng vẽ lại" của E1 coi là XONG, không làm lại. Dự kiến 1,5 giờ. Tệp được sửa: `tools/tach-do/index.html` (thêm lô "Cánh theo cấp" ở CUỐI), `game/js/sprite_custom.js` CHỈ `dinhNghia` phần cánh (~892) và `noiTrangPhuc` (~1181) tìm mã theo cấp (Đợt 10 vừa thêm khối "ẢNH TẢI SAU" ở cuối tệp — không đụng), `game/build.py` chỉ nếu cần thêm mã vào allowlist, `docs/review/trang-bi-e1/`. Phiên song song: C5 (`ui_theme.js`, `tach-giao-dien`) và D2-gộp (`tach-lang`) — không đụng.

## Làm
1. Đọc code để lấy đúng 4 loại cánh (chuồn/lá/lửa/băng), 3 cấp, cách code vẽ cánh cấp 1 và cấp 3 khác cấp 2 (to hơn, thêm chi tiết, phát sáng?), cỡ và neo `diem.lung`/`cap` hiện dùng cho ảnh cánh cấp 2 đang có.
2. **Lô "Cánh theo cấp" 4×2**: hàng 1 cấp 1 (`tp-wings-<chuon|la|lua|bang>-1`), hàng 2 cấp 3 (`tp-wings-<…>-3`); cỡ ô theo cánh to nhất, hình giữ cùng điểm neo lưng với ảnh cấp 2. Prompt dặn **GỬI KÈM ảnh 4 cánh cấp 2 đang có** (trang có nút tải ảnh tham chiếu dựng từ tệp `.sprite.json` hiện có, nền hồng tím, có lưới) và tả rõ cấp 1 nhỏ/mộc hơn, cấp 3 to/rực hơn nhưng cùng dáng.
3. **Game:** `noiTrangPhuc` tìm `tp-wings-<loại>-<cấp>`; không có thì rơi về ảnh cấp 2 đang có (hành vi hiện tại), không có nữa thì code. Neo như cấp 2 (dùng `ghep-*` nếu có). Cánh vẫn khoác rời khi dùng thân bộ.
4. Prompt chép vào `docs/review/trang-bi-e1/PROMPT.md`; ghi dung lượng ước thêm (8 ảnh × cỡ cánh hiện có).

## Kiểm nhanh (không chạy bộ test dài)
`node --check`, `python3 game/build.py`, `node game/tests/cloud_save_regression.test.js` (đụng `sprite_custom.js`), một lượt Playwright: ảnh mẫu máy dựng (chép cánh cấp 2 đổi màu/cỡ) → trang tách ĐẠT → nạp tạm → chụp Cu Tí mang cánh cấp 1/2/3 cùng loại cạnh nhau, 3 hàng idle/run/atk — neo lưng lệch ≤1 px so cấp 2; không có tệp → so ảnh = 0 khác. Ảnh kiểm `docs/review/trang-bi-e1/anh-kiem.png`. KHÔNG thêm ảnh vào `game/art/custom`.

## Kết thúc
`docs/review/trang-bi-e1/bao-cao.md` theo mục IV + PROMPT.md; cập nhật dòng E1 trong `TRANG-THAI.md`; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
