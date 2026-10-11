# Đợt 6 — Tile sàn và tường vùng Rừng già (Q2, thử nghiệm có cờ tắt)

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q2 (+ II, IV), `KE-HOACH.md` Phần 1-B và Phần 2 dòng B, `docs/review/kiem-ke-hinh-code.md` mục 3.5 (sàn/tường/nền ngoài/lớp phủ mép) và mục 6.4 phiên A4 (lô "Nền phòng", mã `gd-nen-<vùng>-*`), `docs/review/phong-a1/bao-cao.md` và `docs/review/phong-a2/bao-cao.md` (trang Tách Phòng, cách móc `room_art.js`, cách xem thử), `docs/review/ke-hoach-cai-thien/dot-2/bao-cao.md` (sàn phòng thường nay x 80–380, y 56–252 = 300×196; phòng trùm 300×198), `docs/vfx/BANG-MAU-LOI.md` (bảng màu, dùng nhóm cỏ cây, gỗ, đá, bóng). Dự kiến 2,5–3 giờ. Tệp được sửa: `game/js/room_art.js` (chỉ phần Rừng: `floor` ~599, `back` ~639, `sides` ~685, `front` ~698, `paintVoid` ~595, `fore` ~707; số dòng có thể lệch sau A2), `tools/tach-phong/index.html` (thêm lô "Nền phòng · Rừng già" + xem thử lát lặp), `game/js/data.js` hoặc nơi đặt cờ cấu hình (một cờ `G.TILE_RUNG = true/false`, mặc định `true` CHỈ KHI có đủ tệp; thiếu tệp → sàn code). KHÔNG đụng Hang biển, Lâu đài; KHÔNG đổi hình học phòng; KHÔNG thêm ảnh vào `game/art/custom`.

## Quy chuẩn tile (chốt cho vùng Rừng, các vùng sau theo cùng chuẩn)
- **Ô 16×16 điểm ảnh game** (ảnh nét gấp đôi 32×32). Sàn 300×196: 300 = 18,75 ô → lát từ mép trái, ô cuối cắt; 196 = 12,25 ô → lát từ mép trên, hàng cuối cắt (chiều cao giữ nguyên, không đổi hình học — quyết định Q2 "chỉ chỉnh kích thước ở mức cần thiết": ở đây **không cần** vì cắt mép bị tường trước che).
- Lô "Nền phòng · Rừng già" (lưới 3×3, mỗi ô vẽ ở 64×64 game px = 4×4 tile để ChatGPT vẽ được hoa văn liền mạch, công cụ cắt thành 16 tile 16×16):
  - `gd-nen-rung-san0`, `-san1`, `-san2`: 3 mảng sàn 64×64 **lặp được cả 4 mép** (prompt phải dặn "mép trái khớp mép phải, mép trên khớp mép dưới").
  - `gd-nen-rung-san-nhan`: 1 mảng 64×64 điểm nhấn (rễ nổi, vũng rêu, đá lộ) — rải thưa.
  - `gd-nen-rung-tuong-sau` 64×49 (lặp ngang), `-tuong-ben` 14×64 (lặp dọc, vẽ bên trái, game lật), `-tuong-truoc` 64×12 (lặp ngang), `-ngoai` 64×64 (nền tối ngoài phòng, lặp).
  - `gd-nen-rung-mep` 64×12: lớp phủ mép dưới (cỏ cao) thay `fore`.
- **Rải theo hạt giống phòng** (dùng đúng `seed` mà `buildShell` đang dùng): mỗi ô sàn chọn 1 trong 3 mảng × 4 phép xoay/lật (chỉ xoay/lật nếu mảng lặp được; mặc định chỉ lật ngang) → 12 biến thể/ô; điểm nhấn ≤ 6% ô, không hai ô kề nhau. Mục tiêu: 5 phòng liên tiếp không nhìn thấy hai phòng giống nhau.
- Giữ nguyên `lightPass`, `backPass`, bóng tường, cột nắng, đường mòn (`path field`) đè **lên trên** tile như một lớp mờ (đường mòn: giữ bằng code, vẽ bằng lớp mờ nâu nhạt lên tile, để không mất "đường đi" của phòng).
- Công cụ: xem thử "lát lặp" 3×3 của từng mảng để lộ đường nối; xem thử cả phòng bằng đúng `room_art` qua `xuong-sprite.html` như A1/A2.

## Cờ tắt (bắt buộc)
- Một chỗ duy nhất: `G.TILE_RUNG` (mặc định `true`). `false` → `room_art.js` chạy nhánh code cũ y hệt. Thiếu bất kỳ tệp `gd-nen-rung-*` bắt buộc nào → cũng chạy code cũ (và ghi `console.info` một dòng).
- Kiểm: cờ `false` hoặc không có tệp → so ảnh với bản trước đợt = 0 điểm ảnh khác (cùng hạt giống).

## Nghiệm thu (Q2)
- Với bộ tile mẫu tự dựng (tự vẽ pixel đơn giản theo bảng màu, không commit): không khe hở, không đường nối lộ ở 960×540 và ở tỉ lệ lẻ (thử cỡ cửa sổ 844×390, 1280×720, 1024×768) — chụp ảnh phóng mép nối.
- 5 phòng liên tiếp (hạt giống 1–5) chụp cạnh nhau: không hai phòng giống nhau.
- Cửa (A2), vật thể (A1), vùng sinh quái, va chạm tường: đúng chỗ (chụp 1 phòng đủ cửa + quái).
- FPS: đo bằng `requestAnimationFrame` trong 10 giây ở phòng Rừng có 6 quái, so trước/sau; phải không giảm (tile là cache một lần như vỏ phòng cũ, nên phải bằng).
- Dung lượng ước tính cho bộ tile thật của 1 vùng (9 ảnh 64×64 nét gấp đôi): ghi vào báo cáo.
- Quay lui: `G.TILE_RUNG = false` hoặc `git revert`.
- Báo cáo `docs/review/ke-hoach-cai-thien/dot-6/bao-cao.md` theo mục IV + `PROMPT.md` (prompt lô Nền phòng · Rừng già, có đoạn bảng màu) + ảnh. Câu hỏi cho chủ dự án: "có mở rộng sang Hang biển và Lâu đài không?" — chỉ hỏi, không làm.
