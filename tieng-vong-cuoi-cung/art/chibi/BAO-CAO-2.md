# Báo cáo chibi đợt 2 (2026-10-20)

Chỉ xử lý ảnh trong `art/chibi/` và script trong `tools/`; **không đụng `game/*`** và các thư mục art cũ.
Chạy lại tất cả: `sh tools/chibi-chay-het-2.sh` (từ `tieng-vong-cuoi-cung/`; cần numpy, scipy, pillow, opencv).

Quy ước cỡ chung: ô 512, pivot (256, 500) → trong game ô 240, pivot (120, 234), hệ số 240/512 = 0,469. Lam đứng cao 344 trong ô 512 = **161 px trên màn 960×540**.

## 1. Lam – idle và jump

Ra: `lam/khung/idle/` (6 khung, xem-thu.gif 8 FPS), `lam/khung/jump/` (4 khung, 10 FPS); mỗi thư mục có bản 512, `256/`, `128/` và `idle.json`/`jump.json`.
`idle.gif` cũ (thực ra là rút dao) được **đổi tên** thành `lam/khung/rut-dao/` (không xoá); `chibi-lam-chay-het.sh` đã sửa theo.

**Không dùng được chuẩn "mắt 15 px" cho 2 tấm này (thật thà):** idle-6 và jump-4 vẽ mắt to hơn hẳn các tấm cũ (mắt chiếm 6,1% chiều cao so với 4,3% ở mau-goc). Theo chuẩn mắt thì Lam idle chỉ cao 239/512 → 112 px trên màn, trái với mục tiêu 160 px. Nên:
- idle: ép tỉ lệ **0,585** để đứng thẳng cao 344 px trong ô 512 (= 160 px trên màn, đúng ô 240×240).
- jump: ép **0,522** để **mũ trùm rộng bằng mũ idle** (167 px trong ô 512) – tấm jump vẽ người to hơn tấm idle ~11%.
- Script thêm 2 tuỳ chọn: `--pivot de` (pivot = tâm dải đế ủng 6% dưới cùng) và `--mat-bay N` (khung bay đặt mắt cao hơn chân N px).

**Idle – kiểm nhấp:** với pivot cũ (dò ủng nâu) khung 3–4 lệch ngang 50 px (ô 512) vì dò nhầm bao dao. Sau khi đổi sang `--pivot de`: mắt lệch ngang ≤ 5 px (≈ 2 px trên màn), đế đứng yên. Lỗi còn lại của **ảnh gốc**: khung 1≈2≈5≈6 gần trùng, chỉ khung 3–4 nhô lên (đầu cao hơn 10 px ô 512 ≈ 5 px màn). Ở 8 FPS: đứng yên 0,5 s rồi "giật" lên 0,25 s → hơi nhấp dọc. Tạm khắc phục trong code: phát thứ tự 1-2-3-4-3-2 hoặc giảm 6 FPS.

**Jump – khung bay:** khung 2, 3, 4 giữ **mắt ngang mắt dáng đứng idle** (y 264 trong ô 512), chân nhấc 44 / 85 / 47 px (ô 512) ≈ 21 / 40 / 22 px màn. Không giữ theo khung 1 (khuỵu) vì đầu khuỵu thấp → chân bị kéo xuống đất. Độ cao nhảy thật do code cộng. Đã xem: mắt ba khung bay lệch mắt idle 3–11 px ô 512 (≤ 5 px màn), không cắt khung.
Lỗi ảnh gốc: khung 2 và 4 dáng gần giống (bay vươn tay); áo choàng đổi phía; chuông lúc ở gáy lúc ở lưng. Dùng được.

**Cảnh báo cỡ giữa các tấm cũ:** run/attack/rut-dao tách đợt trước (chuẩn mắt) đứng cao chỉ ~286–296 px ô 512 (mũ rộng ~149 so với 167 của idle). Khi game đổi idle → run, Lam sẽ **co lại ~10–15%**. Đề xuất chạy lại run/attack/combo với hệ số × 1,12 (khớp theo mũ) – chưa làm ở đợt này vì phiên khác đang dùng các khung đó.

## 2. Quái Chuông Gỗ

Ra `quai/khung/`: `dung.png` (ô 512), `game/dung.png` (ô 240), `quai-chuong-go.json`. Bỏ nền sạch, kể cả lòng quai treo (script vá thêm lỗ trắng kín). Pivot giữa hai bàn chân (tâm 2 đốm chân ở dải đáy).
**Đề xuất cỡ: quái cao 120 px khi Lam 161** (256 px trong ô 512, tỉ lệ gốc→ô512 = 0,2135). Thấp hơn Lam 1/4, chuông + mắt vẫn đọc rõ (xem ảnh ghép).

**Animation TẠM** (biến dạng 1 tư thế, **phải thay khi có ảnh gen**):
- `nhun/` 4 khung, 6 FPS: co giãn dọc ±2,5% quanh pivot, giữ thể tích → thay idle.
- `lac/` 6 khung, 8 FPS: nghiêng ±3° quanh pivot + nhún 1,5% → thay đi bộ tạm (chân không bước).
Mỗi thư mục có bản `game/` (ô 240) và `xem-thu.gif`.

## 3. Tileset rễ cây rêu

Ra `tileset/`: `manh/manh-01…30.png` (độ phân giải gốc), `manh/32/` (cỡ game), `danh-muc.png` (lưới đánh số + đường mặt đứng vàng), `manh.json`.
- Tìm được **30 mảnh** (không phải 33): không có mảnh vụn rời nào phải gộp (rêu/lá đều dính liền thân).
- **Tỉ lệ game = 0,567** (gốc → màn 960): thân thanh ngang dày trung vị 70 px gốc → **40 px màn** (≈ 1,25 gạch 32). Thanh dài 01 = 271×99 px màn, khối 11 = 123×94.
- `manh.json` mỗi mảnh: `bbox_goc`, `loai`, `day_manh` (`noi` = rễ rủ lơ lửng / `mot-chan` / `cham-dat`), `ghi_chu`, `co_game`, `day_than_*`, **`mat_dung_game`** = danh sách [x, y] mỗi 4 px (toạ độ trong ảnh `manh/32/`), `mat_dung_goc` mỗi 16 px. Đường mặt đứng = mép trên rêu sau khi bỏ lá nhô (mở hình 9 px + trung vị trượt 31 px). Với dốc/chữ L thì y đổi theo x.
- Loại: ngang dài 01–03; ngang ngắn 06–09; góc 04, 05, 10, 15, 16, 23–25, 27; khối 11–14; dốc lên 17, 20; dốc xuống 18, 19, 21, 28; cột 22, 26, 29, 30. **Không có mảnh "treo" thật** (treo từ trần); bục lơ lửng có rễ rủ là 02, 03, 05–09 (`day_manh: noi`).
- **Chân lún:** mép rêu lởm chởm, nhân vật nên lún ~4 px màn vào đường mặt đứng (ảnh ghép đã dùng 4).

**Ghép thành màn:**
- Sàn liền: khối **11 + 13** (đáy phẳng, chạm đất), chồng mép ~14 px. Bục: 06–09 (ngắn), 02–03 (dài). Lên/xuống: 17/20 (lên), 19/21 (xuống); bậc 12, 14, 15, 16, 23–25 làm tường/bậc.
- **Có lộ đường nối:** mảnh nào cũng có đầu tròn viền đen khép kín, đặt sát nhau thấy rõ khe + viền (xem `ghep-thu-960.png` dưới đáy). Chồng mép 12–16 px che được phần nào nhưng vẫn thấy nhịp lặp. Muốn sàn dài liền mạch cần gen bản tileable (prompt dưới).

## 4. Nền hốc cây

Ra `nen/`: `hoc-cay-1920.png`, `hoc-cay-960.png` (1672×941 phóng/thu, méo < 0,1%).
Parallax TẠM trong `nen/parallax/`:
- `xa-960/1920.png`: toàn ảnh, chỗ rễ tiền cảnh được vá (inpaint), mờ nhẹ + tối 20%.
- `gan-960/1920.png`: rễ tiền cảnh mép **trái-dưới, dưới, phải-dưới** (12% ảnh), tách bằng GrabCut với vùng gợi ý vẽ tay → **tách khá sạch**, mép theo viền đen của rễ; lá dương xỉ ở mép trái-dưới hơi hụt vài px. Không tách thân cây mép trái-trên và vòm trần vì chúng là cảnh giữa (cửa hàng khoét vào), tách ra sẽ sai chiều sâu.
- `xem-thu.gif`: lắc thử (xa ±4 px, gần ±16 px).
- Hạn chế: chỗ vá trên lớp xa bị nhoè vệt ngang – chỉ lộ khi lớp gần lệch nhiều (> 20 px). Ảnh chỉ vừa khít màn, muốn cuộn ngang phải phóng to hoặc gen ảnh rộng hơn.

**Sàn đất phẳng trong ảnh nền:** y **396–459** (màn 960×540) = 792–918 (1920) = 690–800 (gốc). Sàn tileset nên đặt **thấp hơn, y ≈ 470–480** (ảnh ghép dùng 478) để không trùng; hoặc cao hẳn lên làm bục. Rễ tiền cảnh chiếm phần dưới y ≈ 440–540 hai bên góc, nếu vẽ lớp gần đè lên nhân vật thì nên làm mờ/trong 50% hoặc chỉ dùng ở màn không có sàn sát đáy.

## 5. Ảnh ghép thử

`ghep-thu-960.png` và `ghep-thu-1920.png` (vẽ lại từ bản gốc ở ×2, không phóng ảnh 960). Có: nền, sàn khối 11/13, bục 06 và 02, Lam idle khung 1 (cao 160) trên sàn và trên bục, quái cao 120 quay mặt về Lam, vạch chấm = sàn đất của ảnh nền.
Nhận xét: tỉ lệ Lam–quái–cầu thang/ghế trong nền hợp lý; tileset hơi "đậm" hơn nền (viền đen dày) – có thể giảm tương phản tileset 10% trong game.

## Prompt gen lại / gen thêm (dán kèm ảnh mẫu)

- Lam idle (nhịp đều): `Same chibi hooded rogue, idle breathing loop, 6 evenly spaced frames: inhale rising gradually then exhale, feet fixed, side view facing right, plain white background.`
- Lam jump (khung bay khác nhau rõ): `Same chibi rogue jump, 4 frames: crouch, take-off with legs extended, apex knees tucked, falling with legs reaching down, same head size as idle sheet, white background.`
- Quái đi bộ: `Same wooden bell monster, walk cycle 4 frames, short stubby legs alternating, body bobbing, side view facing left, plain white background.`
- Quái tấn công: `Same wooden bell monster attack 4 frames: lean back, swing body forward ringing clapper, impact, recover, side view facing left, white background.`
- Quái trúng đòn/chết: `Same wooden bell monster, 2 hurt frames (recoil, flash) then 4 death frames cracking and splitting into wooden planks, white background.`
- Tileset tileable: `Seamless horizontally tileable mossy tree-root ground strip, flat top surface, both left and right edges cut straight and matching, no outline at the sides, 2D game tileset, white background.`
- Đầu/cuối sàn: `Matching left end cap and right end cap for the mossy root ground strip, same thickness, white background.`
- Nền lớp xa: `Distant interior of a giant hollow tree village, lanterns and rope bridges, soft hazy blue-brown, no foreground, wide 3:1 panorama, 2D game background.`
- Nền lớp giữa: `Mid-ground tree-hollow shop fronts, stairs and wooden railings along a flat dirt floor, transparent sky area, wide 3:1, 2D game background layer.`
- Nền lớp gần: `Foreground dark tree roots and ferns framing the bottom left and right corners only, rest empty white, 2D game foreground layer, wide 3:1.`
