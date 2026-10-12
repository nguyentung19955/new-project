# Cái Bống (Thầy Lang, `healer`): thân mới thay bộ xương lửa xanh — 12/10/2026

Nguồn: `docs/anh-goc/2026-10-12/em-be-healer-than.png` (thân gốc 8 cột × 7 hàng, nền hồng tím) và `chay-healer.png` (hàng chạy 8 khung, nền xanh lá). Đã đưa thẳng vào game theo lời dặn (không chờ duyệt).

## Đã làm
1. **Thân gốc mới** → `game/art/custom/em-be-healer.sprite.json` (nét gấp đôi, 48 màu, ô 48×48, chân (24, 45), cao đứng 29 điểm ảnh game). Cắt bằng chính trang `tools/tach-anh-hung` chạy headless (mục "Cái Bống (Thầy Lang) (em-be-healer)", hàm `taoTep()` của trang), tự kiểm của trang: **ĐẠT** (đủ khung, cao 29, nằm trọn trong ô, ô thừa trống, 48 màu).
   - Số khung theo vạch kẻ thật: đứng 6 · chạy 6 (thay bằng 8, xem mục 2) · lấy đà 4 · đánh 6 · trúng đòn 4 · chết 8 · né lộn 6 — đúng như ChatGPT vẽ.
   - **Trúng đòn dùng 3 khung** (`hit.so = 3`): khung 4 ChatGPT vẽ em bé nằm ngửa, trong 0,2 giây trúng đòn sẽ thành chớp "ngã lăn ra" mỗi lần bị đánh. Khung 4 vẫn nằm trong tấm ảnh, đổi `so` về 4 là dùng lại.
   - Điểm neo (`neo`) công cụ tự tính lại: đầu (-1, -4), thân (0, -2), tay (0, 0) (cũ: (-2, -3), (0, -2), (0, 0)).
2. **Hàng chạy 8 khung** từ `chay-healer.png`. Phiên "Nhập ảnh 12/10" chưa đẩy cách làm của nó cho Cu Tí/Cu Tèo/Cu Lì lúc phiên này chạy, nên tự làm (`ghep-hang-chay.py`): cắt 8 ô theo vạch, xoá nền xanh (kể cả viền ám xanh), co cho chiều cao khớp khung đứng (hệ số 0,622 — thấp hơn tỉ lệ khớp-chiều-cao thuần 0,655 khoảng 5% vì đầu ở ảnh chạy to hơn đầu ở ảnh thân gốc; đo bề ngang tóc: chạy 42–44 / đứng 38–40 điểm ảnh), đặt vào hàng 2 của tấm thân gốc rồi cho **cùng một lượt** cắt của công cụ (`SO[1] = 8`) để chung tỉ lệ, chung bảng màu, chân cùng đường đáy (`cat-bang-cong-cu.py`). `move`: 8 khung, **0,65 s/vòng**. Xem GIF `chay-healer.gif`: không có khung giật, giữ cả 8 khung. (Khung 3 có một đốm xanh nhỏ ở đầu gối do ChatGPT vẽ, nhìn ở cỡ game không thấy.)
3. **Tệp ghép `ghep-healer.sprite.json` đo lại cho thân mới** (`taoghep.py`, cùng cách Đợt 5 `dot-5/kiem/taoghep5.py`): các điểm `dinh_dau`, `eo`, `lung`, `goc_canh`, `tay_truoc` cũ đo trên bộ xương, nay đo trên thân mới cho từng khung (chạy 8, lấy đà 4, đánh 6, trúng 3). Eo đo theo mép trên quần xanh lam; bàn tay lấy đà lấy nắm tay kéo ra sau. Phần `cap` (vũ khí bám `tay_truoc`, cung lấy đà bám dây) giữ nguyên, bỏ `hit:3`.
4. **Ảnh tham chiếu cho tấm "Đòn theo vũ khí"**: `tham-chieu-healer-moi.png` (hàng 1 đứng, hàng 2 đánh của thân MỚI, nền xanh lá, ô 192, kẻ lưới — đúng hàm `dungThamChieu` của trang công cụ). Lưu ý: ảnh `docs/anh-goc/2026-10-12/em-be-healer-don.png` vừa có trên nhánh (chờ nhập) nếu được gen kèm tham chiếu thân CŨ (bộ xương) thì nên gen lại kèm ảnh này.

## Kiểm (ảnh `bang-kiem.png`, script `kiem.py`)
- Bảng tư thế: tay không, kiếm, cung, giáo, búa × (đứng, chạy, đánh, giữ, trúng, lộn), có và không mặc đồ (nón lá, áo vải/áo lá, hồ lô, bùa): không còn bộ xương; vũ khí nằm trong nắm tay; áo khoác lên thân AI, mũ trên đầu, hồ lô sau lưng. Cu Tí vẽ cùng bảng để so: vũ khí lúc trúng đòn cũng giơ lên như vậy (cách game sẵn có).
- Làng: Cái Bống đứng ở bến, cạnh giá vũ khí như các bé khác. Ông Từ: thẻ "Cái Bống · Cấp 12 · đang chọn" hiện thân mới.
- Trong trận (Rừng già 3) với kiếm, giáo, búa, cung: vũ khí trong tay.
- **0 pageerror**. `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được: hai tệp 25,28 MB / trần 26 MB. Tệp đầu 5,08 MB (cảnh báo "nên dưới 5 MB" đã có từ trước: 5,07 MB trước phiên này; thân mới nặng hơn ~10 KB) — việc của phiên Tải nhanh.

## Còn để ý
- `G.NHUN_BUOC` (js/sprite_custom.js `nhunBuoc`) nhún ở khung `i % 3 === 1`, viết cho vòng chạy 6 khung; với 8 khung nhịp nhún lệch nhẹ (khung 1, 4, 7). Chỉ 1 điểm ảnh, không sửa vì ngoài phạm vi tệp của phiên này; phiên "Nhập ảnh 12/10" (cũng đổi sang 8 khung) nên sửa chung, ví dụ nhún theo `Math.round(i * 6 / so) % 3 === 1`.
- Thân theo bộ (`em-be-healer-rung/-bien/-lau`) giữ nguyên (không thuộc phiên này).

## Tệp
`game/art/custom/em-be-healer.sprite.json`, `game/art/custom/ghep-healer.sprite.json`, `game/dist/*` (build lại), thư mục này: `bao-cao.md`, `bang-kiem.png`, `chay-healer.gif`, `tham-chieu-healer-moi.png`, `kiem.py`, `taoghep.py`, `ghep-hang-chay.py`, `cat-bang-cong-cu.py`.
