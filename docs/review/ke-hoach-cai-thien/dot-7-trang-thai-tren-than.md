# Đợt 7 — Trạng thái dính độc / cháy / đóng băng hiện TRÊN THÂN quái, bỏ biểu tượng trạng thái trên đầu

Yêu cầu của chủ dự án (10:37, 11/10): *"hiệu ứng dính độc, băng và lửa thì hiện trên người quái, không hiện trên đầu quái nữa"*. Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục II, IV, `docs/review/kiem-ke-hinh-code.md` mục 3.1 (ghi chú "mất nhuộm màu khi dính độc/cháy vì `SC.veQuai` không truyền `tint`"), `docs/review/ra-soat-my-thuat/bao-cao.md` mục 1 và 6 (màu hệ: Độc đậm `#277600`, chính `#5aca02`; Lửa `#fe7d04`, `#c9270c`; Băng `#32b0e9`, `#9cfefa`), `docs/vfx/BANG-MAU-LOI.md`. Dự kiến 1,5 giờ. Tệp được sửa: `game/js/sprite_custom.js` (`SC.veQuai`: nhận và áp `tint`), `game/js/mobs.js` (chỗ vẽ trạng thái trên thân và chỗ gọi `A.status` trên đầu, ~722), `game/js/art.js` (`A.status` ~1655, chỉ nếu cần), `game/js/fx.js` chỉ nếu dùng lại hạt có sẵn. KHÔNG đổi luật chơi (sát thương theo thời gian, thời lượng trạng thái), KHÔNG đổi biểu tượng đặc tính tinh anh (bom, khiên, sét, giọt, gai) và thanh máu trên đầu — những thứ đó giữ nguyên.

## Làm
1. **Nhuộm thân** cho quái ảnh AI như quái code từng có: `SC.veQuai` nhận `tint` (màu + độ đậm) và áp lên ảnh (cache theo mã + khung + màu để không tốn máy; ưu tiên cách `globalCompositeOperation` trên canvas tạm rồi dán, giữ viền `#14182e` không bị nhuộm nếu làm được). Độc: lục `#5aca02` ~35%; cháy: cam `#fe7d04` ~35% nhấp nháy nhẹ; băng: `#9cfefa` ~45% không nhấp nháy. Quái code: giữ y cũ.
2. **Hiệu ứng bám thân** (nhỏ, không che thân): độc — 2–3 bong bóng lục 2×2 nổi từ thân lên rồi tan; cháy — 2 lưỡi lửa nhỏ ở vai/lưng (dùng dải `hu-lua-*` nếu có, không thì vẽ code 3 khung 4×6); băng — 3–4 mảnh băng góc cạnh `#9cfefa`/`#32b0e9` ở chân và một mảnh ở vai, đứng yên. Cỡ theo cỡ quái (tỉ lệ với `e.r`), trùm to thì nhiều hạt hơn nhưng không quá 6.
3. **Bỏ biểu tượng trạng thái trên đầu quái** (cháy/độc/băng/trói…). Giữ: biểu tượng đặc tính tinh anh, biểu tượng "vỡ giáp" (`vo`) vì nó không có thể hiện nào khác trên thân — hoặc chuyển "vỡ giáp" thành vết nứt trên thân nếu làm gọn được (ghi vào báo cáo), thanh máu.
4. **Cờ tắt** một chỗ: `G.TRANG_THAI_TREN_THAN = true`; `false` → vẽ y cũ (có biểu tượng trên đầu, không nhuộm).
5. Em bé khi dính trạng thái: KHÔNG đụng trong đợt này (ghi vào báo cáo nếu thấy nên làm tương tự).

## Nghiệm thu
- Ảnh `anh/ba-trang-thai.png`: cùng một con quái (ví dụ Heo Rừng) ở 4 cột: thường / dính độc / cháy / đóng băng, phóng 3×, nhìn phân biệt được ngay; trên đầu không còn biểu tượng trạng thái, vẫn còn biểu tượng tinh anh nếu là tinh anh.
- Ảnh phòng thật có ≥ 4 quái dính trạng thái khác nhau ở 844×390.
- FPS không giảm (đo 10 s phòng 6 quái cùng dính độc, so trước/sau).
- Cờ `false` → so ảnh với bản trước = 0 điểm ảnh khác.
- `node --check`, `python3 game/build.py`, workflow xanh. Báo cáo `docs/review/ke-hoach-cai-thien/dot-7/bao-cao.md` theo mục IV.
