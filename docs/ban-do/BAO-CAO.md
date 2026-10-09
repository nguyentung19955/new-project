# Báo cáo: bán đồ lấy vàng (vàng trong game)

Nhánh: `claude/ban-do`. Trước đây chỉ bán được vũ khí ở Bà Hàng Xén, từng món một; trang phục không bán được, kho đầy 40 món là kẹt.

## Làm được gì

- **Bà Hàng Xén có ba thẻ** trên đầu bảng: *Vũ khí*, *Mua trang phục*, *Bán trang phục*.
- **Bán trang phục**: chạm một ô để xem giá bà trả, bấm *Bán*. Món **đang mặc** (chấm xanh) không bán được.
- **Khoá đồ**: ổ khoá ở mép phải mỗi dòng vũ khí (chạm để khoá/mở), nút *Khoá* / *Mở khoá* cho trang phục. Món khoá có hình ổ khoá vàng, không bán được, không bị "Bán hết" quét, không chọn được khi chọn nhiều. Khoá được lưu trong bản lưu; bản lưu cũ vẫn đọc được, mặc định không khoá.
- **Bán nhiều món một lúc** (vũ khí và trang phục): nút *Chọn nhiều* → chạm các món để đánh dấu (dấu tích xanh) → nút *Bán N món · X vàng*. Nút nhanh *Bán hết Thường* và *Bán hết Lam* (bỏ qua món đang mang, đang mặc, đã khoá).
  - Game chỉ có bốn bậc màu: Thường (trắng), Lam, Tím, Vàng — không có bậc Lục. Vì vậy "Bán hết đồ Trắng" là *Bán hết Thường*, còn "Bán hết đồ Lục" được làm thành *Bán hết Lam* (bậc thấp thứ hai).
- **Hỏi lại** trước khi bán món Tím trở lên hoặc từ 5 món trở lên: bảng "Bán thật không?" ngay trong game (ghi số món, số vàng, có bao nhiêu món quý), nút *Thôi, giữ lại* và *Bán*. Lúc bảng đang mở, chạm chỗ khác không có tác dụng; phím Esc cũng huỷ.
- **Bán từ Hành trang** khi đang ở làng: thẻ Vũ khí có nút *Xem*, *Khoá*, *Bán* cho từng món và hàng nút *Bán hết Thường / Bán hết Lam / Chọn nhiều*; thẻ Trang phục có *Khoá* và *Bán* cho món đang xem, phần "Bán đồ" có ba nút trên. **Trong ải** (mở từ Tạm dừng) các nút này ẩn hết, chỉ xem.
- Bán xong: báo "Đã bán 6 món, +420 vàng", số vàng ở góc trên đổi ngay, lưu máy và đẩy lên mây ngay (như chỗ bán vũ khí cũ).

## Bảng giá bán

| Bậc | Trang phục | Vũ khí (giữ nguyên giá cũ) |
| --- | --- | --- |
| Thường | 10 vàng | 20 vàng |
| Lam | 30 vàng | 60 vàng |
| Tím | 80 vàng | 150 vàng |
| Vàng | 200 vàng | 400 vàng |
| Thêm | Cánh cấp 2: +40, cấp 3: +140 | Mỗi cấp mài: +15 |

So với công sức bỏ ra: đồ thường bà bán giá 60–140 vàng, bà mua lại 10 (khoảng 7–17%); lên Lam tốn ít nhất 120 vàng và 6 nguyên liệu, bán 30; lên Tím tốn thêm 350 vàng, 10 nguyên liệu, 1 đá tôi, bán 80; lên Vàng tốn thêm 900 vàng, 18 nguyên liệu, 2 đá tôi, bán 200. Tức khoảng 10–20% công sức, thấp hơn gợi ý 20–30% vì lần đặt giá đầu bị cày nhanh quá (xem dưới).

## Kiểm tra cân bằng (`tests/cay.py`, 12 lượt chiến dịch, bot kiểu "khuyen")

Thêm cờ `--ban`: sau mỗi lần nâng cấp ở làng, bot bán đồ thừa như người chơi dọn kho (trang phục không mặc và không cao bậc hơn món đang mặc cùng ô; vũ khí trong rương không cao bậc hơn vũ khí đang mang).

| Lần đo | Giá trang phục | Tổng thời gian đi hết 15 ải (trung bình / trung vị) | So với trước |
| --- | --- | --- | --- |
| Trước (bản cũ, không bán) | — | 178 phút / 178 phút | — |
| Sau, lần 1 | 20 / 60 / 150 / 400 (bằng vũ khí) | 158 phút / 156 phút | nhanh hơn 11% / 12% → **quá 10%, hạ giá** |
| Sau, lần 2 (giá hiện tại) | 10 / 30 / 80 / 200 | 170 phút / 165 phút | nhanh hơn 4,5% / 7% → **đạt** |

Ở lần 2, mỗi chiến dịch bot bán được khoảng 2 900–5 100 vàng, trong đó trang phục khoảng 660–1 750 vàng (phần còn lại là vũ khí, giá cũ). Ải 3-3 có dấu ✗ (1,8–1,9 lần chơi, dưới mục tiêu) ở cả lần đo trước lẫn sau, không do việc bán đồ. Không đổi số cân bằng nào khác.

## Ảnh

| Ảnh | Nội dung |
| --- | --- |
| `1-ban-trang-phuc.png` | Bà Hàng Xén, thẻ Bán trang phục: lưới kho, chấm xanh món đang mặc, ổ khoá món đã khoá |
| `2-chon-mot-mon.png` | Chọn một món: tên, bậc, chỉ số, giá bà trả, nút Khoá và Bán |
| `3-bang-xac-nhan.png` | Bảng hỏi lại khi bán món Tím |
| `4-chon-nhieu.png` | Chọn nhiều: dấu tích xanh, tổng vàng, nút "Bán 3 món · 30 vàng" |
| `5-ban-vu-khi.png` | Thẻ Vũ khí: giá từng món, ổ khoá, Bán hết Thường / Lam, Chọn nhiều |
| `6-hanh-trang-trang-phuc.png` | Hành trang ở làng, thẻ Trang phục có nút Khoá, Bán |
| `7-hanh-trang-vu-khi.png` | Hành trang ở làng, thẻ Vũ khí có nút Xem, Khoá, Bán |

## Bài kiểm tra

- `python3 tests/ban_do.py` (khung ngang và cầm dọc bị xoay): 48/48 mục mỗi khung — bán 1 trang phục, món đang mặc không bán được, khoá/mở khoá và được lưu, Bán hết Thường (giữ món đang mặc và món khoá), Bán hết Lam bỏ qua món khoá, hỏi lại khi bán đồ Tím và khi bán từ 5 món, chọn nhiều, bán vũ khí, Hành trang ở làng bán và khoá được, trong ải không có nút bán, vàng cộng đúng và lưu ngay, bản lưu cũ đọc được, không chữ tràn khung.
- Chạy lại các bài cũ: rules, bao_truoc, tam_huong, trang_phuc, hanh_trang, ui_build, ui_input (4 cỡ), ui_robust, smoke, mapgen, doors, env_rooms, fuzz, moves, cung, cong, perf, ghep, ghep2, quai, linhkhi, do_roi, anim_smoke, fx_check, probe: đạt.
- `tests/may.py` có 2 mục hỏng do trang không tải được một tệp (lỗi 404), hỏng y hệt trên bản cũ trước khi sửa, không liên quan việc bán đồ.

## Tệp đã đổi

- `game/js/ban_do.js` (mới): giá, khoá, bán, chọn nhiều, bán hết theo bậc, bảng hỏi lại.
- `game/js/village.js`: ba thẻ của Bà Hàng Xén, thẻ Bán trang phục, ổ khoá và chọn nhiều ở thẻ Vũ khí.
- `game/js/hanh_trang.js`: nút Khoá, Bán, Chọn nhiều ở thẻ Vũ khí và Trang phục (chỉ ở làng).
- `game/js/engine.js`, `game/js/outfit.js`: đọc trường khoá trong bản lưu.
- `game/tests/ban_do.py` (mới), `game/tests/cay.py` (cờ `--ban`).
