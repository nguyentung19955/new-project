# Ảnh người dùng gửi (Pippit, nền magenta) — đợt 07/10

Tên file: <số>-<loại>-<mã>.jpg (đã được session điều phối nhận diện bằng mắt; kiểm tra lại khi cắt).
- bo-*, do-*, phu-kien-*, do-ghep-4, sinh-le, ui-*: tấm icon 4–5 ô → `python3 tools/cat-items.py <ảnh> <mã tấm>` (mã trong tools/item-sheets.json).
- quai-*: dải 3 ô cũ (đi A, đi B, đánh) → `python3 tools/cat-sheet.py <ảnh> <mã> enemy`. Một số tấm có chữ nhãn dưới ô ("Wallep A"…): `-co-chu` → xoá chữ (cat-sheet có wipe_labels). quai-rua có 2 bản (04 có chữ, 44 không chữ) → dùng 44.
- boss-*: lưới 2×2 (đi A, đi B, đánh, nổi giận) → kind boss4.
- nen-song: nền bản đồ chủ đề Sông → assets/maps/nen-song.jpg (bỏ MAP_BG_FILE song→dam trong js/render.js).
- thanh-tien-do, nut-vang-bac, khung-thanh-dai-trong-riu, khung-nguoi-choi-co-chu, nen-menu-cu-khong-chu: khung giao diện — chỉ thay nếu tốt hơn bản đang dùng; khung-nguoi-choi-co-chu có chữ "#2A168" vẽ sẵn → KHÔNG dùng.
- khung-the-vang-KHONG-DUNG: người dùng đã nói không muốn dùng khung vàng → bỏ.
- Mọi ảnh có dấu "AI" nhỏ góc dưới phải → xoá (clean_mark).
Nhánh này chỉ chứa ảnh gốc, KHÔNG gộp vào nhánh chính.
