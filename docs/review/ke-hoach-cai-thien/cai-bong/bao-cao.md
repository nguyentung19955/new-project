# Cái Bống (Thầy Lang, `healer`): thân mới thay bộ xương lửa xanh — 12/10/2026

Nguồn: `docs/anh-goc/2026-10-12/em-be-healer-than.png` (thân gốc 8 cột × 7 hàng, nền hồng tím) và `chay-healer.png` (hàng chạy 8 khung, nền xanh lá). Đã đưa thẳng vào game theo lời dặn (không chờ duyệt).

## Đã làm
1. **Thân gốc mới** → `game/art/custom/em-be-healer.sprite.json` (nét gấp đôi, 48 màu, ô 48×48, chân (24, 45), cao đứng 29 điểm ảnh game). Cắt bằng chính trang `tools/tach-anh-hung` chạy headless (mục "Cái Bống (Thầy Lang) (em-be-healer)", hàm `taoTep()` của trang), tự kiểm của trang: **ĐẠT** (đủ khung, cao 29, nằm trọn trong ô, ô thừa trống, 48 màu).
   - Số khung theo vạch kẻ thật: đứng 6 · chạy 6 (thay bằng 8, xem mục 2) · lấy đà 4 · đánh 6 · trúng đòn 4 · chết 8 · né lộn 6 — đúng như ChatGPT vẽ.
   - **Trúng đòn dùng 3 khung** (`hit.so = 3`): khung 4 ChatGPT vẽ em bé nằm ngửa, trong 0,2 giây trúng đòn sẽ thành chớp "ngã lăn ra" mỗi lần bị đánh. Khung 4 vẫn nằm trong tấm ảnh, đổi `so` về 4 là dùng lại.
   - Điểm neo (`neo`) công cụ tự tính lại: đầu (-1, -4), thân (0, -2), tay (0, 0) (cũ: (-2, -3), (0, -2), (0, 0)).
2. **Hàng chạy 8 khung** từ `chay-healer.png`, làm **đúng cách phiên "Nhập ảnh 12/10"** cho Cu Tí/Cu Tèo/Cu Lì: chạy thẳng script của phiên đó `docs/review/ke-hoach-cai-thien/nhap-anh-12-10/kiem/chay.py healer ...` trên thân mới — cắt 8 ô theo vạch, xoá nền xanh và viền lem xanh, co cùng tỉ lệ cho cao bằng khung đứng, canh ngang theo tâm đầu + thân, chân cùng đường đáy nhưng **giữ độ nhấc ở 2 khung bật nhảy** (4 và 8), đổi màu về bảng 48 màu của tấm thân; `move` 8 khung, **0,65 s/vòng**, tệp ghi `"nhun_buoc": false` (game không nhún thêm, như 3 bé kia). Cả 8 khung đều là dáng chạy (không có khung đứng nhìn thẳng như Cu Tèo, Cu Lì) nên giữ đủ 8; GIF `chay-healer.gif` không giật. (Lần đầu phiên này tự cắt qua trang công cụ — `ghep-hang-chay.py`, `cat-bang-cong-cu.py`, giữ lại để tham khảo — rồi đổi sang cách chung khi phiên 12/10 đẩy lên.) Ghi chú: đầu ở ảnh chạy ChatGPT vẽ to hơn ảnh thân gốc chút (~8%), cùng tình trạng các bé kia.
3. **Tệp ghép `ghep-healer.sprite.json` đo lại cho thân mới** (`taoghep.py`, cùng cách Đợt 5 `dot-5/kiem/taoghep5.py`): các điểm `dinh_dau`, `eo`, `lung`, `goc_canh`, `tay_truoc` cũ đo trên bộ xương, nay đo trên thân mới cho từng khung (chạy 8, lấy đà 4, đánh 6, trúng 3). Eo đo theo mép trên quần xanh lam; bàn tay lấy đà lấy nắm tay kéo ra sau. Phần `cap` (vũ khí bám `tay_truoc`, cung lấy đà bám dây) giữ nguyên, bỏ `hit:3`.
4. **Ảnh tham chiếu cho tấm "Đòn theo vũ khí"**: `tham-chieu-healer-moi.png` (hàng 1 đứng, hàng 2 đánh của thân MỚI, nền xanh lá, ô 192, kẻ lưới — đúng hàm `dungThamChieu` của trang công cụ). Lưu ý: ảnh `docs/anh-goc/2026-10-12/em-be-healer-don.png` vừa có trên nhánh (chờ nhập) nếu được gen kèm tham chiếu thân CŨ (bộ xương) thì nên gen lại kèm ảnh này.

## Kiểm (ảnh `bang-kiem.png`, script `kiem.py`)
- Bảng tư thế: tay không, kiếm, cung, giáo, búa × (đứng, chạy, đánh, giữ, trúng, lộn), có và không mặc đồ (nón lá, áo vải/áo lá, hồ lô, bùa): không còn bộ xương; vũ khí nằm trong nắm tay; áo khoác lên thân AI, mũ trên đầu, hồ lô sau lưng. Cu Tí vẽ cùng bảng để so: vũ khí lúc trúng đòn cũng giơ lên như vậy (cách game sẵn có).
- Làng: Cái Bống đứng ở bến, cạnh giá vũ khí như các bé khác. Ông Từ: thẻ "Cái Bống · Cấp 12 · đang chọn" hiện thân mới.
- Trong trận (Rừng già 3) với kiếm, giáo, búa, cung: vũ khí trong tay.
- **0 pageerror**. `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được: hai tệp 25,06 MB / trần 26 MB (sau khi gộp phiên 12/10). Tệp đầu 5,05 MB (cảnh báo "nên dưới 5 MB" có từ trước phiên này) — việc của phiên Tải nhanh.

## Còn để ý
- Phiên "Nhập ảnh 12/10 (b)" vừa nhập `em-be-healer-don` (đòn theo vũ khí Cái Bống) song song. Đã gộp và kiểm lại: game ghép đủ 5 hàng đòn (hàng 7–11) vào thân mới, cột "đánh", "giữ" của bảng kiểm dùng các hàng này — cùng bé gái tóc đuôi ngựa, vũ khí trong tay. Nếu muốn khớp hẳn mặt/dáng, lần gen sau gửi kèm `tham-chieu-healer-moi.png`.
- Thân theo bộ (`em-be-healer-rung/-bien/-lau`) giữ nguyên (không thuộc phiên này).

## Tệp
`game/art/custom/em-be-healer.sprite.json`, `game/art/custom/ghep-healer.sprite.json`, `game/dist/*` (build lại), thư mục này: `bao-cao.md`, `bang-kiem.png`, `chay-healer.gif`, `tham-chieu-healer-moi.png`, `kiem.py`, `taoghep.py`, `ghep-hang-chay.py`, `cat-bang-cong-cu.py`.
