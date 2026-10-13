# Báo cáo đợt 5: bot chơi thật đo cân bằng hệ thống mới

**Mã commit:** `3f537020` (nhánh `khoi-tao-du-an`)

Đợt này làm theo `YEU-CAU-5-BOT-CAN-BANG.md`, sau khi đọc `bao-cao-4.md`. **Có chạy game** (chủ dự án cho phép), bằng Playwright với Chromium có sẵn ở `/opt/pw-browsers`. Không chạy `playwright install`. Game mở với `?cloud=0`.

Những thứ không đụng tới:
- `master`. Không force push, không mở PR.
- Đăng nhập Google, lưu mây, `cloud.js`, `firebase-config.js` (không chép apiKey).
- Hình, hiệu ứng, `zed_moi.js`.

`game/dist` đã dựng lại bằng `build.py` (sau khi pull --rebase nhánh đợt hiệu năng).

## 1. Bot đã sửa cho hệ thống mới

| Tệp | Làm gì |
|---|---|
| `tests/bot_nang.js` (mới) | Bot nâng cấp ở làng như người chơi. **Vũ khí:** 4 món cố định, bot dùng Kiếm (chính) và Phi tiêu (phụ). **Nâng bằng linh khí:** lúc lên Mầm, món chính lấy hệ khắc vùng đang đánh (Rừng già → Lửa, Hang biển → Độc, Lâu đài → Băng). Món phụ lấy hệ khắc hệ của món chính, nên khi trùm học kháng thì đổi sang món phụ đánh đúng chỗ yếu. **Bộ trang phục:** bot nâng bộ mới mở sau cùng (linh khí + vàng + mảnh trùm), mặc bộ có cấp cao nhất. Bot mua món rẻ trước: chỉ nâng bộ khi giá linh khí của bộ không cao hơn lần nâng vũ khí kế tiếp. Thiếu mảnh trùm cho bộ cấp 2–3 thì lúc cày bot đánh lại trùm vùng đó. **Phần còn lại:** dùng `G.upg.auto` (kỹ năng, chưởng, mài, lò). |
| `tests/cd_lib.py` (mới) | Phần chung: mở game `?cloud=0`, chạy chiến dịch 15 ải. **Kiểu `khuyen`:** cày tới khi đủ khuyên dùng, tối đa 8 lượt liền. **Kiểu `lieu`:** cứ vào ải mới. Mỗi ải ghi: số lượt cày, thắng / thua, cấp, Sức mạnh, máu còn, thời gian, linh khí / vàng mỗi lượt, đòn trùm mạnh nhất. Ghi thêm mốc Mầm / Thành hình / Thức tỉnh và mốc nâng bộ. |
| `tests/cay.py` | Kiểm 17 luật (4 vũ khí, Sức mạnh, nâng Mầm bằng linh khí, nâng bộ cần mảnh, gợi ý bảng thua, cây chưởng đầy…). Chạy nhiều lượt chiến dịch, in bảng từng ải và bảng mốc. Thêm `--kd=R`: chơi lại mỗi ải R lần từ bản lưu thật lúc vừa tới ải đó, rồi tìm Sức mạnh mà bot thắng 75%. Thoát mã 1 nếu có luật hỏng, có lượt bị kẹt, có ải trung bình phải chơi quá 9 lần, hoặc có lỗi trang. |
| `tests/campaign.py` | Chạy một lượt chiến dịch, in từng lượt chơi và bảng từng ải. |
| `tests/dps.py` | Đo theo luật mới: bậc 0, cấp vũ khí đặt bằng `G.vkMoi.datCap` (Trắng / Thức tỉnh). In thêm bảng Trắng → Thức tỉnh. |
| `tests/bot.js` | Đổi vũ khí trong vòng 4 món: bấm đổi tới đúng món muốn cầm (trước đây code giả định chỉ có 2 món). Mở rương thì chọn linh khí, trừ khi quặng dưới 8 (trước đây không bao giờ chọn linh khí). |
| `tests/setup.js` | Ghi đòn trùm mạnh nhất (phần máu tối đa mất trong một đòn). |
| `js/upgrade.js` | Thêm móc `G.upg.heMam`: bot chọn hệ khi lên Mầm, người chơi không bị ảnh hưởng. **Sửa lỗi game:** cây chưởng đã học hết nút (cấp > tổng bậc của cây, từ khoảng cấp 29) mà gợi ý vẫn ghi "Còn N điểm chưởng chưa học". `G.upg.auto` thì "học" mãi mà không làm việc khác (bot kẹt mài, kẹt nâng). Nay mục đó chỉ hiện khi còn nút học được. |

## 2. Đo lần đầu (số đợt 4, chưa chỉnh): chỗ lệch

Bot kiểu `khuyen`, 12 lượt chiến dịch:
- **75 lần chơi, 4,2 giờ.** Gần như ải nào cũng phải cày 6–8 lượt.
- Bot vẫn thắng dư, máu còn 76–99%.
- Lúc qua 3-5 còn dư khoảng 12.000 vàng.

Đo khuyên dùng bằng `--kd` (24 bản lưu thật mỗi ải, mỗi bản chơi 4 lần):

| Ải | 1-5 | 2-1 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|---|---|
| Sức mạnh bot thắng 75% | 165 | 158 | 248 | **337** | 267 | 286 | 319 | 386 | 449 |
| Khuyên dùng cũ | 215 | 255 | 360 | 405 | 440 | 480 | 520 | 540 | 560 |

Chỗ lệch rõ:
1. **Khuyên dùng quá cao từ 1-5 trở đi.** Vùng ba cao gấp khoảng 1,3–1,7 lần mức bot cần. Số cũ đo theo luật cũ, lúc còn bậc màu và quần áo cộng máu.
2. **Ngư Tinh (2-5) là một bậc khó vọt.** Bot cần Sức mạnh ~337, trong khi 2-4 chỉ cần ~248 và 3-1 cần ~267. Ải thường vùng ba vì thế **dễ hơn trùm vùng hai**.
3. **Khiên nước gánh cả vùng ba.** Bot né tốt nên chỉ trúng khoảng 1 đòn mỗi 20–40 giây. Khiên hồi lại kịp và chặn gần mọi đòn: **57–63% tổng sát thương** ở 3-3, 3-5. Thử trên cùng bản lưu:
   - có khiên: thắng Hồ Tinh 21/40;
   - không có khiên: 2/24;
   - tắt Sóng dội hay Thuỷ triều: gần như không đổi.

   Phân thân hồi 4 giây và các skill khác không làm lệch rõ.
4. **Trùm nhỏ vùng ba đánh một đòn 80–110% máu Zed** ở cấp người chơi thật sự tới vùng ba. Bot không nghe lời khuyên tới vùng ba ở cấp ~17–21.
5. **Lỗi cây chưởng đầy** làm bot kẹt nâng cấp từ cấp ~29 (đã sửa, mục 1).

## 3. Số đã chỉnh (cũ → mới, lý do)

| Chỗ | Cũ → mới | Lý do (bot đo) |
|---|---|---|
| Khiên nước `G.SKILL_BO.bien[0]` | hồi 10 giây, đỡ tối đa 25% máu → **hồi 15 giây, tối đa 10% máu** | Mục 2.3. Số mới: khiên ăn ~25–31% sát thương. Thắng Hồ Tinh 9/40 (không khiên 2/24, khiên cũ 21/40). Vẫn là skill thủ mạnh nhất nhưng không gánh cả vùng. |
| Ngư Tinh, cột trùm `G.STAGE_K.boss[9]` | máu 1,155 → **0,96**; sát thương 2,53 → **1,98** (đòn gốc ~112 → ~88) | Mục 2.2. Lần chỉnh đầu (1,04 / 2,15) vẫn cần ~291, bot cày 7+ lượt, nên hạ thêm. |
| Quái 3-1 / 3-2 / 3-3, cột `G.STAGE_K.mob` | [1,46; 2,78] → **[1,64; 3,11]**; [1,55; 2,9] → **[1,74; 3,25]**; [1,67; 3,04] → **[1,80; 3,28]** (×1,12 / ×1,12 / ×1,08 cả máu lẫn sát thương) | Ải thường vùng ba dễ hơn 2-5. Nay bot cần ~273 / 309 / 346, tăng dần sau 2-5. |
| Trùm nhỏ vùng ba, sát thương cột `G.STAGE_K.boss` 3-1..3-4 | 3,0 / 2,87 / 2,74 / 2,81 → **2,22 / 2,13 / 2,11 / 2,33** | Đòn gốc ~150 · 162 · 175 · 188 → ~125 · 135 · 145 · 155 (×0,83, đã trừ phần ×1,12 của cột quái). Mục 2.4. |
| Giá nâng vũ khí `G.VK_MOI.gia` | 100 / 400 / 800 → **100 / 300 / 800** (cộng dồn 100 / 400 / 1.200) | Bot thật chỉ thu ~45–65 linh khí mỗi lượt và chỉ chơi ~10 lượt hết vùng một (mô hình đợt 4 tính cày nhiều hơn). Với giá cũ, Thành hình rơi vào 2-3 (mục tiêu: quanh trùm vùng 1). Nay Thành hình ở 2-2, sớm nhất 1-5. |
| Khuyên dùng `G.STAGE_REC` | 95 · 110 · 135 · 160 · 215 · 255 · 280 · 330 · 360 · 405 · 440 · 480 · 520 · 540 · 560 → **95 · 105 · 125 · 140 · 175 · 180 · 185 · 220 · 240 · 275 · 285 · 315 · 355 · 400 · 435** | Đo lại sau các thay đổi trên, qua 3 vòng đo (mỗi vòng 12 lượt `khuyen` + 12 lượt `lieu`, `--kd=4`). Lấy Sức mạnh bot thắng ~75%, rồi soát bằng tỉ lệ thắng lần thử đầu ở chính số đó (67–100%, trung bình ~85%). Số vẫn tăng dần qua 15 ải. Độ khó 2 tự theo số này (`G.DIFF2`); **độ khó 2 chưa đo bằng bot**. |

Mô tả skill trong bảng nâng bộ tự đổi theo số mới. Mỗi chỗ đổi đều có ghi chú "Đợt 5" trong `js/data.js`.

## 4. Kết quả sau khi chỉnh

Lệnh: `python3 tests/cay.py 12 khuyen`. Bot nghe lời khuyên, 12 lượt chiến dịch, thoát mã 0, 17/17 luật đạt.
- **Lần chơi** là mọi lượt dùng để qua ải đó, kể cả cày lại ải cũ và lượt thua.
- **Đòn trùm** là đòn mạnh nhất của trùm: lấy số lớn nhất qua 12 lượt, kèm trung bình mỗi lượt. Số này tính cả vùng đỏ, đạn lúc trùm còn đứng.

| Ải | Lần chơi TB (trung vị) | Lượt cày | Thua | Phút cả ải | Giây lượt thắng | Cấp | Sức mạnh khi qua / khuyên dùng | Máu còn | Đòn trùm (lớn nhất / TB) | Linh khí / lượt | Vàng / lượt |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1,0 (1) | 0,0 | 0,0 | 3 | 153 | 1 | 100 / 95 | 63% | 13% / 11% | 85 | 151 |
| 1-2 | 1,0 (1) | 0,0 | 0,0 | 3 | 188 | 2 | 108 / 105 | 56% | 19% / 16% | 28 | 206 |
| 1-3 | 1,4 (1) | 0,2 | 0,2 | 5 | 234 | 3 | 130 / 125 | 50% | 25% / 18% | 39 | 226 |
| 1-4 | 2,1 (2) | 1,1 | 0,0 | 8 | 260 | 5 | 143 / 140 | 59% | 22% / 17% | 50 | 262 |
| 1-5 | 4,6 (4) | 3,3 | 0,2 | 19 | 282 | 8 | 179 / 175 | 61% | 30% / 24% | 62 | 413 |
| 2-1 | 1,2 (1) | 0,2 | 0,1 | 4 | 195 | 9 | 186 / 180 | 78% | 40% / 39% | 45 | 340 |
| 2-2 | 1,7 (1) | 0,3 | 0,3 | 6 | 238 | 10 | 199 / 185 | 63% | 57% / 46% | 53 | 319 |
| 2-3 | 3,2 (3) | 1,9 | 0,2 | 12 | 256 | 12 | 227 / 220 | 66% | 61% / 48% | 64 | 379 |
| 2-4 | 3,2 (3) | 1,8 | 0,5 | 13 | 267 | 14 | 247 / 240 | 79% | 67% / 54% | 67 | 361 |
| 2-5 | **8,7 (8)** | 7,1 | 0,6 | 35 | 289 | 18 | 276 / 275 | 56% | 50% / 43% | 84 | 471 |
| 3-1 | 2,3 (2) | 1,2 | 0,1 | 10 | 275 | 20 | 286 / 285 | 73% | 69% / 14% | 75 | 471 |
| 3-2 | 5,4 (4) | 3,8 | 0,6 | 23 | 261 | 23 | 335 / 315 | 72% | 74% / 19% | 68 | 437 |
| 3-3 | 3,4 (4) | 2,1 | 0,3 | 15 | 300 | 25 | 366 / 355 | 82% | 67% / 21% | 85 | 580 |
| 3-4 | 4,2 (5) | 3,0 | 0,2 | 20 | 332 | 27 | 421 / 400 | 86% | 7% / 7% | 81 | 554 |
| 3-5 | 2,6 (2) | 1,4 | 0,2 | 13 | 294 | 28 | 444 / 435 | 62% | 74% / 27% | 110 | 760 |

- **Tổng:** 46 lần chơi, **3,2 giờ** (nhanh nhất 2,9, lâu nhất 3,4). Trước khi chỉnh là 75 lần chơi, 4,2 giờ.
- **Lúc qua 3-5:** cấp 29, Sức mạnh 463. Còn dư 1.500 vàng (trước ~12.000), 616 linh khí, 139 quặng.
- **Bot không nghe lời khuyên** (`python3 tests/cay.py 8 lieu`): 42 lần chơi, 2,8 giờ. Ải vùng ba nay khó dần lên: 3-3 cần 6,0 lần chơi, 3-4 cần 5,5. Trước khi chỉnh là 1,0–1,8.
- Một lượt chi tiết: `python3 tests/campaign.py doc` cho 46 lần chơi, 3,1 giờ.

### Mốc nâng cấp (ải đang tới lúc nâng; trung vị qua 12 lượt)

| Mốc | Mục tiêu (đợt 4) | Mô hình đợt 4 | Bot trước khi chỉnh | **Bot sau khi chỉnh** |
|---|---|---|---|---|
| Kiếm lên Mầm | sau ~2–3 ải đầu | sau 1-2 | 1-2/1-3 | **1-3** (phi tiêu 1-4) |
| Kiếm Thành hình | quanh trùm vùng 1 | 1-5 | 2-1 (do cày thừa) | **2-2** (sớm nhất 1-5; phi tiêu 2-4) |
| Kiếm Thức tỉnh | vùng 2–3 | 2-1 / 2-4 | 2-4 | **3-2** (phi tiêu 3-5) |
| Bộ cấp 1 | ngay khi mở bộ | ngay sau 1-5 | Rừng 2-1 | **Rừng 2-1, Biển 3-1** (ngay khi mở) |
| Bộ cấp 2 | – | – | Rừng 2-1 | **Rừng 2-5, Biển 3-1** |
| Bộ cấp 3 | phải cày lại vùng | hạ trùm thêm 2 lần | không lượt nào | **Biển 3-4 ở 6/12 lượt**, nhờ đánh lại Ngư Tinh lấy mảnh. Rừng cấp 3 chỉ 1/12, vì bot chuyển sang bộ Biển mới mở. |

### So với mục tiêu
- **Không ải nào phải cày quá ~8 lượt:** đạt. Ải nặng nhất là 2-5 (Ngư Tinh): trung bình 7,1 lượt cày, 8,7 lần chơi; vài lượt chiến dịch lên 10–11 lần chơi. Các ải khác ≤ 5,4 lần chơi.
- **Mầm sau 2–3 ải:** đạt (1-3).
- **Thành hình quanh trùm vùng 1:** gần đạt. Trung vị 2-2, sớm nhất 1-5. Nếu muốn đúng 1-5, có thể hạ 300 → 250.
- **Thức tỉnh vùng 2–3:** đạt (kiếm 3-2).
- **Bộ cấp 3 phải cày lại vùng:** đạt.
- **Trùm đánh ~50% máu một đòn:**
  - Trùm nhỏ vùng hai và Ngư Tinh: 40–67% (trung bình 39–54%).
  - Hồ Tinh: trung bình 27%, lớn nhất 74%.
  - Trùm nhỏ vùng ba: trung bình 14–21%, nhưng đòn lớn nhất vẫn 67–74%. Bot ít khi bị trúng; số lớn nhất có cả vùng đỏ / đạn lúc trùm còn đứng.
- **So với mô hình đợt 4:**
  - Mô hình tính 58 lượt; bot thật cần 46.
  - Mô hình cho bot tới vùng ba ở cấp ~27; bot thật tới ở cấp ~20.
  - Linh khí mỗi lượt bot thu ~28–88 ở ải thường, 62–110 ở ải trùm (mô hình: 33–60 và 82–95), gần như khớp.
  - Vàng mỗi lượt: bot 150–760, mô hình 180–1.075.

## 5. Sát thương 4 vũ khí trên quái thật

Lệnh: `python3 tests/dps.py 60 8 quaimoi`. Zed cấp 10, mài +3, cụm 5 quái mới (máu ×2,5), 8 hạt giống, 60 giây mỗi lượt. Bài đo đạt.

| Vũ khí | Trắng (sát thương / giây) | Thức tỉnh, TB 3 hệ | Lửa / Độc / Băng | Thức tỉnh ÷ Trắng |
|---|---|---|---|---|
| Kiếm | 66,4 | 118,6 | 115,3 / 123,7 / 116,8 | ×1,79 |
| Giáo | 66,6 | 115,8 | 116,9 / 126,5 / 104,1 | ×1,74 |
| Búa | 64,4 | 113,9 | 117,5 / 127,7 / 96,4 | ×1,77 |
| Phi tiêu | 49,5 | 105,3 | 95,5 / 117,6 / 102,9 | ×2,13 |

- **Ba món cận chiến** lệch nhau tối đa 2%. **Phi tiêu** thấp hơn kiếm 26% ở Trắng (mức cho phép 13–27%); món đánh xa, an toàn nên yếu hơn là có chủ đích. Món thấp nhất bằng 74% món cao nhất.
- **Ba hệ ở Thức tỉnh** lệch nhau tối đa 9%: Độc 123,9, Lửa 111,3, Băng 105,0.
- **Không đổi số vũ khí.** Thức tỉnh mạnh gấp ~1,75–2,1 lần Trắng, hơn hệ số cấp ×1,6 vì có thêm đặc trưng hệ. Sức mạnh chỉ tính ×1,6, nên Sức mạnh hơi đánh giá thấp vũ khí đã Thức tỉnh.

## 6. Còn lại / nên xem
- **Sức mạnh không tính skill bộ.** Khiên nước (dù đã hạ) vẫn đáng giá cỡ một bậc nâng vũ khí. Bộ Rừng gần như không giúp gì cho bot: Nhựa rừng cần đứng yên, mà bot hiếm khi đứng yên (thử ở 2-5: có hay không cũng thắng 2/24). Người chơi thật có thể dùng Nhựa rừng tốt hơn. Nếu muốn bộ Rừng có giá như bộ Biển, nên xem lại số của nó.
- **Độ khó 2** chưa đo bằng bot. Khuyên dùng độ khó 2 tự hạ theo số mới.
- **Số đo dao động.** Bot vụng có chủ ý, mỗi ải chỉ 12 lượt chiến dịch. Ải 2-5 dao động 7–9 lần chơi giữa các lần chạy. Muốn chắc hơn thì chạy `cay.py 24` hoặc `--kd=8`.
- Bot chỉ dùng Kiếm + Phi tiêu. Giáo, Búa mới đo DPS (mục 5), chưa chạy chiến dịch.
- Chưa sửa cho hệ thống mới: `tests/balance.py` và bản lưu mẫu `tests/cay_luu.json` (vẫn theo luật cũ), mô hình `tools/can-bang/tinh.js` (vẫn giá 100/400/800 trong ghi chú; số tự đọc từ `data.js`).
- README đã sửa dòng lệnh bot và dòng "đi hết 15 ải mất khoảng 3 giờ, ~46 lượt". Các dòng khác của README vẫn tả luật cũ (bậc màu, trang phục…), chưa sửa.
