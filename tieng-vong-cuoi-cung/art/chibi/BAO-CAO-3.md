# Báo cáo lô chibi 3 (2026-10-20)

Chỉ xử lý ảnh, **không đụng game/**. Chạy lại tất cả: `python3 tools/chibi-batch-3.py` (từ thư mục `tieng-vong-cuoi-cung/`, ~25 giây).
Script dùng lại `tools/chibi-tach-khung.py` (bỏ nền flood fill, đo mắt, đổi cỡ premultiplied, đặt ô theo pivot).
Mọi số đo: `art/chibi/bao-cao-3-so-do.json`. Ảnh xem nhanh: các `xem-thu.gif` (nền xám tối).

## 1. Lam chạy 8 khung — `lam/khung/run8/`

- Ra: `khung-1..8.png` (ô 512), `256/`, `128/`, `xem-thu.gif` (12 FPS), số đo `lam/khung/run8.json`; so sánh `lam/khung/so-sanh-run6-run8.gif` (trái run-6 cũ, phải run-8, cùng 12 FPS).
- Tỉ lệ chuẩn Lam: mắt 15 px trong ô 512 → hệ số **0,714** (mắt nguồn 21 px). Pivot giữa hai đế ủng, đáy y = 500. Không khung nào bị cắt, không khung nào cần nâng "bay".
- **Đầu cùng độ cao:** mắt cách đất 164–171 px (TB 168), lệch tối đa **±2,4 %** (khung 4 thấp nhất, 4 px ở ô 512 ≈ 1,3 px ở cỡ game). Run-6 cũ lệch ±4,8 %. Đỉnh mũ lệch 4,2 % (mũ đổi dáng khi chạy, mắt mới là số đáng tin).
- **Luân phiên chân:** chân chạm đất trượt đều về sau: khung 1→4 = +62 → +32 → −21 → −39 px, khung 5→8 = +63 → +37 → −22 → −31 px; khung cách 4 giống nhau (khác 15 %) đúng kiểu chu kỳ hai bước. Nhìn nghiêng không phân biệt được chân trái/phải, nhưng nhịp đối xứng 4 + 4.
- **Nối 8 → 1:** chân sau (−31) nhấc, chân trước đặt (+62) — liền mạch, cùng kiểu với bước 4 → 5. Hai chỗ này là bước nhảy lớn nhất trong vòng (khác ~41 % hình), không giật hơn chỗ khác.
- **Lỗi thật thà:** ở mắt 15 px, Lam run-8 **thấp hơn run-6 ≈ 10 %** (đỉnh mũ 262 so với 290 px) — tấm run-8 vẽ mắt/đầu to hơn so với thân. Trong game, chuyển idle → chạy sẽ thấy Lam "co" lại một chút. Muốn cùng chiều cao với run-6: chạy tay `python3 tools/chibi-tach-khung.py art/chibi/lam/run-8.png --hang 1 --cot 8 --ra art/chibi/lam/khung/run8 --fps 12 --ti-le 0.79`.
- **Đề xuất: dùng run-8 thay run-6.** Mượt hơn rõ (đầu ổn định gấp đôi, không cần nâng khung bay, đủ 8 khung đối xứng). Cân nhắc dùng hệ số 0,79 nếu thấy co người khi chuyển động.

## 2. Quái Chuông Gỗ — `quai/khung/{di,tan-cong,trung,chet}/`

- **Một tỉ lệ chung cho 3 tấm** (đi, tấn công, trúng-chết): **0,6151** (ảnh tấm → ô 512). Kiểm tra cùng cỡ: tấn công khung 4 (đứng thẳng) so với đi: cao 1,003 ×, vòng treo 1,005 ×; trúng khung 1: vòng 0,97 × → ba tấm vẽ cùng cỡ.
- **Khớp quai-chuong-go.png gốc:** gốc lớn hơn tấm 1,93 × (đo mắt cao 2,00 ×, diện tích mắt 1,88 ×, bề rộng vòng treo 1,90 ×) → hệ số tương đương cho ảnh gốc là **0,3192** (người gốc cao 383 px trong ô 512). Xem `quai/khung/so-sanh-goc.png`. Phiên làm tư thế đứng (`dung*`) nên dùng 0,3192 để khớp.
- Ô 512, pivot giữa hai bàn chân, đáy y = 500. Khung đi cao 358–361 px.
- **Cỡ game (quái cao 120 px):** thu nhỏ ô 512 → **ô 171** (hệ số 0,334). Thư mục `game/` trong từng anim. Pivot trong ô 171: **[85,5 ; 167]**. Khung đi cao 119,6–120,6 px.
- Ban đầu thử khung đi cao 384 (ô game 160) thì nắm đấm tấn công 3 bị cắt mép → hạ xuống 360.
- **Quái nhìn sang TRÁI** (Lam nhìn phải): khi quái quay phải thì lật ngang quanh pivot.
- xem-thu.gif: đi 8 FPS, tấn công 10 FPS, trúng 10 FPS, chết 10 FPS; thêm `chet/xem-thu-trung-chet.gif` (trúng → vỡ → dừng ở đống vụn).
- **Tấn công:** 1 thủ thế, 2 đấm, 3 duỗi, 4 thu. **Khung đấm chạm (hit frame) = khung 3**, tầm với ≈ **82 px game** về phía trước tính từ pivot (khung 2 ≈ 62 px). Gợi ý hitbox bật ở khung 3 (có thể bật sớm từ cuối khung 2).
- **Trúng/chết:** khung 1 → `trung/khung-1`; khung 2–5 → `chet/khung-1..4`. Tách theo **vùng cột**: ranh giới là cột thưa nhất giữa hai thân chính, mỗi mảnh vụn thuộc khung có cột chứa tâm mảnh → không mảnh nào nhảy sang khung bên (số mảnh/khung: 5, 9, 21, 24, 17). Chết 1–2 pivot theo bàn chân; chết 3–4 (đống vụn, không còn chân) pivot = tâm khối dải dưới cùng.
- **Lỗi:** đi khung 1 và 3 gần trùng hình (khác 8 %) → nhịp đi thực chất là 1-2-1-4, chân trước luôn là cùng một chân. Đọc vẫn được ở 8 FPS nhưng hơi lạch bạch. Bụi xám mờ dưới đất (khung vỡ) đã xoá. Viền sáng mảnh còn nhẹ quanh hình (giống bộ Lam).

## 3. Boss Chuông Gác Làng — `boss/khung/`

- `dung.png`: ô **1024**, cao 820 px, pivot giữa hai bàn chân, đáy y = 1000 (hệ số 0,711 từ ảnh gốc). Đã xoá lỗ trắng trong vòng treo.
- **Cỡ game đề xuất:** boss cao **330 px** (trên màn 540) → `game/dung.png`, ô **412** (hệ số 0,402), pivot [206 ; 402]. Bề ngang hình ≈ 370 px (gấp ~2,3 lần Lam).
- **Animation TẠM** `tam-tho/`: 6 khung thở/nhún bằng co giãn quanh pivot (cao ±2,5 %, ngang ∓1,2 %), chỉ lưu cỡ game + `xem-thu.gif` 6 FPS. **Đây là tạm** — chỉ để boss không đứng im; thay khi có ảnh gen.
- Prompt gen (dán kèm chuong-gac-lang.png):
  - đi: `Same mossy bronze bell golem boss, walk cycle 4 frames in a row, heavy stomping steps, side view facing left, plain white background.`
  - đập đất: `Same bell golem boss, ground slam 4 frames: raise both fists, slam down, shockwave, recover, facing left, white background.`
  - hét chuông: `Same bell golem boss, bell roar 4 frames: lean back, body rings with glowing cracks and sound rings, facing left, white background.`
  - trúng đòn: `Same bell golem boss, hit reaction 2 frames, recoil backward with flash on cracks, facing left, white background.`
  - chết: `Same bell golem boss, death 5 frames: cracks glow, bell splits, collapses into a pile of bronze and wood, facing left, white background.`

## 4. Đồ vật — `do-vat/khung/` + `do-vat.json`

| Món | File | Cỡ game (rộng × cao ô) | Ghi chú |
|---|---|---|---|
| công tắc nhô / lún | cong-tac-nho, cong-tac-lun | 65 × 26 (rộng hình 64) | cùng tỉ lệ, cùng ô, đáy thẳng hàng |
| điểm lưu tắt / sáng | diem-luu-tat, diem-luu-sang | 148 × 161 (cao hình 159) | ô giữa khung chuông của bản tắt đã làm trong suốt |
| cổng đóng / mở | cong-dong, cong-mo | 231 × 194 (cao hình 193) | 2 cột trùng vị trí giữa 2 trạng thái |
| đèn lồng | den-long | 25 × 49 | lấy **cao** 48 (cả khoen treo) |

- `khung/<món>.png`: cỡ gốc (cắt sát, các trạng thái cùng ô); `khung/game/<món>.png`: đã thu nhỏ sẵn. `khung/xem-co-game.png`: tất cả ở cỡ game trên một đường đất.
- `do-vat.json`: pivot **đáy giữa** (gốc + game), kích thước, tỉ lệ; **cổng đóng** có `va_cham` = hộp x −89, y −159, rộng 183, cao 159 (px game so với pivot, y âm là lên) — phủ từ cột trái tới cột phải, từ xà ngang trên xuống đất (chóp cột không tính). Cổng mở có hộp 2 cột (tuỳ chọn).
- **Lỗi:** quầng sáng của điểm lưu **sáng** là điểm ảnh trắng đục (không trong suốt) — trên nền tối trông như tấm sáng, ổn; muốn đẹp hơn thì vẽ quầng bằng code (cộng sáng). Đèn lồng 48 px chi tiết nhoè; nếu cần rõ hơn dùng cao 64. Công tắc lún chỉ thấp hơn nhô 3 px ở cỡ game — có thể thêm lún 2 px bằng code.
- Prompt gen lại (nếu cần):
  - công tắc: `Bronze pressure plate on wooden base, 2 states: raised and pressed, side-top view, game prop, white background.`
  - điểm lưu: `Wooden shrine arch with hanging bronze bell, 2 states: dim and glowing, transparent inner opening, white background.`
  - cổng: `Wooden gate between two bronze-capped posts, 2 states: closed and open (door raised), same post positions, white background.`
  - đèn: `Small hanging bronze lantern with warm glow, simple shape readable at 48 px, white background.`

## Prompt gen lại ngắn (khác)

- Lam run (nếu muốn cùng cỡ đầu với bộ cũ): `Same chibi hooded rogue, run cycle 8 frames in a row, same head size as reference sheet, side view facing right, white background.`
- Quái đi (để hai chân luân phiên): `Same wooden bell monster, walk cycle 4 frames: left foot forward, passing, right foot forward, passing; facing left, white background.`
- Quái tấn công: dùng được, không cần gen lại.
- Quái trúng/chết: dùng được, không cần gen lại.
