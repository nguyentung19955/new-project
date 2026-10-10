# AUDIT VÒNG LẶP, PHÒNG, TIẾN TRIỂN, CÂN BẰNG, KINH TẾ — Linh Khí

Phiên `au-vong-lap`, ngày 10/10/2026, trên nhánh `khoi-tao-du-an` (bản `lk-2026.10.09`, commit `7d4774d`).
Làm theo **BƯỚC A (audit)** và **BƯỚC B (xếp hạng)** ở mục 11 của `docs/review/GOP-Y-CHATGPT.md`, phạm vi: mục 4, mục 5 và mục 8.
**Phiên này chỉ kiểm tra, không sửa một dòng nào trong `game/js`, `index.html`, `build.py` hay luật Firestore.**

## Đọc nhanh (cho chủ dự án)

- **Bản đồ sinh ngẫu nhiên chắc chắn, không kẹt.** Thử 9.000 bản đồ (3.000 mỗi kiểu A, B, C) và cho bot chơi 30 ải: không có bản đồ hỏng, không cửa kẹt, không lượt nào bị treo. Chìa ở Kiểu C không bị "lưu dở": gục, bỏ ải hay tải lại trang đều quay về làng, lần sau bắt đầu lại từ 0 chìa.
- **Điều đáng lo nhất là sự lặp lại.** Mỗi ải luôn đúng 8 phòng với cùng một bộ loại phòng; 5 trong 8 phòng là "đánh tới hết quái"; mọi phòng cùng một khung chữ nhật, không có vật cản. Trong khi đó bot cần trung bình **52 lượt chơi (khoảng 3,2 giờ)** để qua 15 ải, tức **khoảng 70% số lượt là chơi lại ải cũ để cày**.
- **Thua thì bảng chỉ khuyên "nâng cấp gì"**, không nói em bé mất máu vì cái gì, dù game đã đếm được (bài kiểm tra cho thấy Gai phản đòn và đòn trùm là hai thứ làm mất máu nhiều nhất).
- **Linh khí đi theo từng vũ khí.** Mốc 300 đạt sau khoảng 40–85 phút chơi, nhưng khi đổi sang vũ khí mới (ví dụ món Vàng của trùm) thì về 0. Bot đổi vũ khí chính 3–4 lần mỗi chiến dịch, cuối cùng vũ khí đang cầm thường còn 0 dấu ấn, còn vũ khí cũ thì có 900–1.500 dấu ấn mà không dùng tới.
- **Công thức cấp là cộng đều theo cấp, không nhân dồn**: cấp 40 đánh mạnh gấp 1,585 lần và máu gấp 2,365 lần cấp 1 (chứ không phải 1,79 và 3,86 như bản góp ý lo).
- **Cây kỹ năng không bị học hết sớm**: 1 điểm mỗi 3 cấp, tới cấp 40 có 13 điểm cho 15 nút, nên luôn phải chọn. Cây chưởng thì đầy ở cấp 28, từ đó điểm thừa.
- **Bốn em bé chưa đều**: cùng một bản lưu, Thợ Rèn thắng 19/20 lượt, Đô Vật 18/20, Thầy Lang 14/20, Thợ Săn 13/20.
- **Bảng vàng có thể bị sửa số từ máy người chơi**: luật Firestore chỉ kiểm khoảng số (Sức mạnh tới 1.000.000, thời gian hạ trùm từ 5 giây) và "chỉ được tăng". Ai đăng nhập, kể cả khách, cũng tự ghi được số tuỳ ý trong khoảng đó.

Ba việc nên sửa trước nằm ở cuối tài liệu (phần 4).

## 1. Cách đã đo

Mọi số dưới đây có được nhờ chạy game thật trong trình duyệt Chromium không màn hình (Playwright), bot tự chơi. **Thời gian là thời gian trong game** (bot chạy nhanh hơn người thật nhiều lần). Bot không phải người: nó phản xạ đều, không tận dụng hết nét riêng của từng em bé, nên số liệu là để **so sánh**, không phải để khẳng định cảm giác người chơi.

| Bài | Làm gì | Lệnh |
|---|---|---|
| `tests/au_mapgen.py` (mới) | 3.000 bản đồ mỗi kiểu; bot chơi 30 ải; ghi mọi lần quái mọc; thử chìa khi gục/tải lại | `python3 tests/au_mapgen.py 3000 30` |
| `tests/au_tien_trien.py` (mới) | cấp 1→40, số đòn hạ/chịu, cây kỹ năng, mỗi lớp góp bao nhiêu % Sức mạnh, linh khí theo thời gian (6 chiến dịch), 4 em bé cùng bản lưu | `python3 tests/au_tien_trien.py cap kynang lop linhkhi embe --n=4` (linhkhi dùng `--n=6`) |
| `tests/cay.py` (có sẵn) | bot chơi từ bản lưu mới qua 15 ải, 12 chiến dịch | `python3 tests/cay.py 12 khuyen` |
| `tests/campaign.py` (có sẵn) | bot chơi 15 ải, thua thì chỉ cày 1 lượt, mỗi em bé một lần | `python3 tests/campaign.py '{"hero":"hunter"}'` |
| `tests/mapgen.py`, `tests/doors.py` (có sẵn) | kiểm tra bản đồ và luật cửa | đều **đạt** |

Hai bài mới chỉ đọc số, không đổi luật chơi. Bài `au_tien_trien.py linhkhi` chơi gần giống `cay.py`.

## 2. Bảng audit (BƯỚC A + B)

Trạng thái: **(A)** đã xác nhận bằng code hoặc số đo · **(B)** có nguy cơ, cần người thật thử · **(C)** không áp dụng / không xảy ra.
Ưu tiên: **P0** chơi không được hoặc mất dữ liệu · **P1** ảnh hưởng lớn đến vòng lặp, cân bằng, độ rõ · **P2** đánh bóng.
Độ khó: **S** nhỏ (vài giờ) · **M** vừa (1–2 ngày) · **L** lớn.

### 2.1. Mục 4 — Lối chơi và thiết kế phòng

| # | Vấn đề | TT | Bằng chứng | Ảnh hưởng người chơi | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro hồi quy | Cách kiểm thử |
|---|---|---|---|---|---|---|---|---|---|
| 4.1a | Bộ phòng mỗi ải luôn giống nhau; mục tiêu gần như chỉ có "đánh hết quái" | A | `mapgen.js`: mọi bản đồ = Bắt đầu (có quái) + 2 Đánh quái + 1 Tinh anh + 1 Rương + 1 Suối hồi + 1 Trùm + **1 phòng phụ** bốc ngẫu nhiên trong Thương nhân / Thử thách / Lời nguyền. 9.000 bản đồ chỉ ra đúng **3 bộ loại phòng**. Mục tiêu khác "hạ hết quái" chỉ có phòng Thử thách ("hạ hết trong 30 giây", `stage.js` `clearRoom`), xuất hiện ở 1/3 số ải. Kiểu C gọi là "mảnh chìa" nhưng thực chất vẫn là dọn 3 phòng quái. | Với khoảng 52 lượt để qua 15 ải (70% là chơi lại), người chơi gặp cùng một chuỗi "vào phòng → cửa đóng → đánh hết → cửa mở" rất nhiều lần | P1 | M | Dùng lại phòng Thử thách sẵn có: thêm 1–2 biến thể mục tiêu bằng chính đợt quái hiện có (ví dụ "Trụ được 30 giây" = hết giờ thì dọn phòng; "Hạ tinh anh trước khi nó chạy" = 1 tinh anh có đồng hồ). Cho mỗi ải **luôn có 1 phòng mục tiêu** thay vì 1/3 cơ hội. Không thêm loại phòng mới. | Phòng Thử thách hiện được `M.check` coi là "phòng phụ"; đổi tỉ lệ phải giữ đúng luật cửa và `fountainLocked` | `tests/mapgen.py`, `tests/doors.py`, `tests/au_mapgen.py` (đếm bộ loại phòng), chơi tay 5 ải |
| 4.1b | Không có địa hình: mọi phòng cùng một khung, không vật cản | A | `room_art.js` `RA.geo`: phòng thường luôn sàn 208×196, phòng trùm 300×198. Không có vật cản (không tìm thấy va chạm vật cản trong `combat.js`/`stage.js`). Khác nhau giữa các phòng chỉ là 3 kiểu nền vẽ (`variant`) và 1–2 vật mang hệ (chậu than, nấm, tinh thể — `addEnv`). | Trận nào cũng là "đứng giữa sàn trống né vòng đỏ"; vị trí không tạo ra quyết định | P1 | M | Trước khi làm vật cản thật: xếp vật mang hệ theo vài **mẫu có chủ đích** (hàng chậu than chắn giữa, bốn góc tinh thể…) để vị trí có ý nghĩa. Vật cản thật (cột) để sau. | Vật mang hệ đặt sai có thể chắn lối cửa (`propSpot` hiện đã tránh lối cửa) | `au_mapgen.py` (đè vật), ảnh chụp phòng, `tests/env_rooms.py` |
| 4.1c | Phòng có quyết định: đã có, nhưng ít | A (tốt) | Rương: chọn 1 trong 3 (vũ khí / quặng / bùa hệ 60 giây). Suối hồi: chọn **một** trong hai (hồi 50% máu hoặc đầy mana) + chỗ đổi vũ khí. Lời nguyền: chịu bất lợi (máu −20%, không dùng bình, quái nhanh 15%) để **dấu ấn ×2** cả ải — đây là quyết định rủi ro/phần thưởng thật. Thương nhân: bình máu 60, bùa 80, 3 quặng 100 vàng. | Tốt, đúng tinh thần góp ý. Thương nhân ít khi đáng ghé (bot gần như không mua) | P2 | S | Giữ nguyên. Nếu muốn, cho Thương nhân bán món chỉ có trong ải (ví dụ đổi máu lấy dấu ấn) thay cho quặng. | Thấp | Chơi tay |
| 4.2a | Bản đồ liên thông, không cửa kẹt, không lối tắt | C (không lỗi) | `au_mapgen.py`: 3.000 hạt/kiểu, **0 lỗi** `M.check`; A: 2.616 bản đồ khác nhau, B: 2.997, C: 543. Bot chơi 30 ải ngẫu nhiên: **0 lượt kẹt**. `tests/mapgen.py` 1.000 hạt/kiểu: đạt; `tests/doors.py`: đạt. Kiểu C ít biến thể nhất (mọi bản C có sảnh giữa, Suối và Trùm thẳng phía trên). | Không có | — | — | Không cần sửa | — | Giữ `tests/mapgen.py`, `tests/doors.py` trong bộ chạy |
| 4.2b | Quái mọc sát em bé / sát cửa | B (nhẹ) | 929 lần quái mọc trong 30 ải: **6 lần (0,6%) cách em bé dưới 30 điểm ảnh** (gần nhất 9), 30 lần (3%) cách lối cửa dưới 22, 0 lần ngoài sàn, 2 lần đè vật mang hệ. Có giảm nhẹ sẵn: vòng đỏ báo trước 0,8–1 giây (`spawnWave`), quái mới mọc chưa đánh ngay (`e.cd ≥ 0,3–0,9`), em bé đứng trong vòng bị đẩy ra (`tickSpawns`). | Hiếm khi bị đánh ngay lúc quái vừa mọc | P2 | S | `freeSpot` đang thử 14 điểm rồi lấy điểm xa nhất nếu không đạt; tăng lên 30 lần thử là đủ | Rất thấp | `au_mapgen.py` (đếm "gần em bé") |
| 4.2c | Giới hạn số quái/đạn/hiệu ứng | A (đã có) | `G.ROOM_WAVES.maxAlive = 4` quái cùng lúc (tinh anh tính 2), tối đa 7 quái/đợt; hạt hiệu ứng có trần (`fx.js` `MAXE`, `MAXN`); vệt/mây chưởng tối đa 5. Đạn quái không có trần riêng nhưng bị chặn gián tiếp bởi 4 quái. | Ổn | — | — | Hiệu năng máy yếu do phiên khác đo (mục 7.3) | — | `tests/perf.py` |
| 4.2d | Chìa và cửa khi gục, bỏ ải, tải lại | A (an toàn) | Lượt chơi chỉ nằm trong bộ nhớ (`S` trong `stage.js`); bản lưu không có trường nào của lượt dở (kiểm bằng `au_mapgen.py`). Dọn 1 phòng chìa → 1/3; gục → bảng thua; vào lại → 0/3. Tải lại trang giữa ải → về làng. Rời ứng dụng → tự tạm dừng (`hide()`). | Không kẹt. Đổi lại: tải lại trang là mất cả lượt đang chơi (kể cả vũ khí vừa nhặt trong ải vì chỉ lưu lúc kết thúc ải) | P2 | M | Chấp nhận được với ải 3–6 phút. Nếu người chơi phàn nàn: lưu đồ nhặt được ngay khi nhặt. | Lưu giữa ải dễ sinh lỗi nhân đôi đồ | Thử: nhặt vũ khí tinh anh rồi tải lại trang |
| 4.3a | Ít lựa chọn build trong một lượt | A | Thứ thay đổi giữa các lượt: kiểu bản đồ, phòng phụ, rương chọn 1/3, bùa hệ 60 giây, lời nguyền, trùm học hệ bạn dùng nhiều (`bossSetup`/`computeLayers`). Không có lựa chọn kéo dài cả lượt kiểu "chọn 1 trong 3 phúc lợi". Phần thưởng chính (kinh nghiệm, vàng, nguyên liệu) là số cố định theo ải (`settle`). | Lượt cày thứ 5 ở cùng ải giống lượt thứ 1 | P1 | S–M | Không thêm hệ thống: cho ô "Bùa hệ" ở Rương kéo dài **hết ải** (thay 60 giây) — thành lựa chọn build cả lượt; Lời nguyền đã là mẫu tốt để nhân rộng. | Bùa hết ải có thể làm trùm học hệ đó nhanh hơn (đúng ý đồ "trùm học theo bạn") | `tests/cay.py --nhanh`, chơi tay |
| 4.3b | Phản ứng hệ có dễ hiểu không | A (khá tốt) | Chỉ có 2 phản ứng: Lửa+Độc = **Nổ khói** (nổ lan 42), Lửa+Băng = **Sốc nhiệt** (×2,5 một mục tiêu) — `combat.js` `applyStatus`. Mỗi lần xảy ra đều hiện tên chữ trên đầu quái (`fx.comboName`) và hình vòng phù. Có trang "Ba hệ" ở Cụ Đồ. **Độc + Băng không có phản ứng** và không đâu nói điều đó. Chưởng không gây phản ứng (có chủ ý, có ghi chú trong code). | Người chơi thử Độc+Băng sẽ không thấy gì và không hiểu vì sao | P2 | S | Thêm một câu vào trang "Ba hệ": "Độc gặp Băng: không phản ứng". | Không | Đọc trang hướng dẫn |
| 4.3c | Hướng dẫn linh khí có câu sai/khó hiểu | A | `village.js` dòng ~629: "quái thường **0%** rơi viên linh khí của vùng (3), đi lại gần để nhặt" — luật đã bỏ (`G.LINHKHI.drop = 0`) nhưng câu vẫn in ra | Người mới đọc thấy mâu thuẫn | P2 | S | Bỏ vế đó khi `drop = 0` | Không | Đọc trang hướng dẫn |
| 4.4a | Quái có vai trò khác nhau thật không | A (tốt) | `mobs.js`: Lính xông (lao), Bầy nhỏ (≤1 mỗi đợt), **Khiên** (giáp 45% phía trước, hồi 14% máu cho quái gần → phải vòng ra sau / đánh trước), **Xạ thủ** (bắn mỗi 3 giây, gọi thêm bầy), **Nhanh nhẹn** (lặn rồi trồi sau lưng, có vòng đỏ), **Cảm tử** (lao tới, vòng nổ 0,85 giây), **Đặt bom** (bom có vòng), **Gai** (dựng gai 2,2 giây: chém cận chiến bị phản 70%, rồi bắn 8 gai). Mỗi con có một câu hỏi chiến thuật riêng. | Tốt | — | — | Giữ | — | — |
| 4.4b | Tinh anh có dấu hiệu nhìn thấy không | A (có) / B (một chỗ thiếu) | Có biểu tượng trên đầu cho cả 4 dấu hiệu (tia chớp = Nhanh, khiên = Bọc giáp, quả bom = Nổ khi chết, giọt máu = Hút máu — `mobs.js` `icon`), tên dấu hiệu trên thanh máu tinh anh (`stage.js` ~842), vòng đỏ 44 khi nổ. **Nhưng** dấu "!" chớp báo sắp ra đòn chỉ vẽ khi quái **không có** dấu hiệu (`mobs.js` ~705 `!e.trait`) mà tinh anh **luôn** có dấu hiệu → tinh anh không bao giờ có dấu "!" này | Đòn thường của tinh anh khó đọc hơn đòn của quái thường | P2 | S | Vẽ "!" lệch sang bên cạnh biểu tượng dấu hiệu thay vì bỏ hẳn | Rất thấp (chỉ hình vẽ) | Ảnh chụp phòng tinh anh |
| 4.4c | Nguồn mất máu: Gai và Xạ thủ nổi bật | B | `cay.py` 12 chiến dịch: mất máu do **Gai 22%**, đòn trùm 28%, vùng đỏ của trùm 16%, **Xạ thủ 14%**, tinh anh 9%; các quái khác 1–2% mỗi loại. Đường ngắm của xạ thủ đã bị tắt theo ý chủ dự án (`mobs.js`: "bắn thường không cần đường ngắm báo trước"). Bot đã biết tránh chém Gai đang dựng gai (`bot.js` dòng 159) mà vẫn mất nhiều máu vì 8 gai toả tròn. | Có thể người chơi thật thấy Gai "khó chịu" hơn là "thú vị" | P2 | S | Chưa sửa; cho 3–5 người chơi thử rồi hỏi. Nếu đúng: giảm 8 gai xuống 6 hoặc gai bay chậm hơn. | Đổi số Gai làm lệch cân bằng `cay.py` | `tests/cay.py`, `tests/quai.py` |
| 4.4d | Đội hình chưa có chủ đích | B | `buildWaves`: chọn vai ngẫu nhiên; chỉ chặn trùng Bầy/Cảm tử/Đặt bom trong một đợt. **Không chặn số Xạ thủ** → có thể ra đợt 3 xạ thủ + 1 đặt bom. Trần 4 quái cùng lúc giảm nhẹ rủi ro. | Thỉnh thoảng có đợt "toàn bắn xa" không còn chỗ né | P2 | S | Thêm luật "tối đa 2 xạ thủ mỗi đợt" | Thấp | `tests/cay.py --nhanh` |
| 4.5a | Nhịp độ: thời gian phòng/ải | A (số đo) | Bot 30 ải: phòng Bắt đầu ~10 giây, phòng quái 20–23 giây (lâu nhất 71), Thử thách ~19, Rương/Suối/Lời nguyền 1–4, phòng trùm ~66 (lâu nhất 110; thời gian riêng trùm vùng 50–115 trong `campaign.py`). Một ải 2,5–6,5 phút. Đi lại qua phòng đã dọn **~7%** thời gian. Giữa hai đợt chờ 0,6–0,7 giây + vòng đỏ 0,8–1 giây. | Nhịp mỗi ải ổn. Vấn đề không nằm ở độ dài một ải mà ở **số lần phải chơi lại** (xem 5.x) | P2 | — | Không cần sửa độ dài phòng | — | `au_mapgen.py` |
| 4.5b | Gợi ý khi thua không dựa nguyên nhân thật | A | `stage.js` `panelLose` + `upgrade.js` `G.upgradeTips`: bảng thua chỉ so Sức mạnh với khuyên dùng và liệt kê 2–3 **nâng cấp** (học điểm, mài, may…). Không có gì về việc em bé bị trúng đòn gì. Khi đủ Sức mạnh thì chỉ ghi "đủ sức, thử lại né kỹ hơn nhé". Game **đã có** chỗ để đếm: mọi sát thương đi qua `G.hurtPlayer(amt, el, src)` (bài test `probeRun` đếm theo nguồn được ngay). | Người thua ở trùm (cần 10–12 lượt cho mỗi trùm vùng) chỉ được bảo "cày thêm", không học được gì | **P1** | **S** | Trong lượt chơi cộng máu mất theo nguồn (vai quái / đòn trùm / vùng đỏ trùm). Bảng thua thêm **một dòng**: "Mất máu nhiều nhất: Gai phản đòn (35%) — Gai đang dựng gai thì đừng chém, đứng xa chờ 8 gai bay qua". Mỗi nguồn một câu mẹo sẵn. | Bảng thua đã chật (3 gợi ý + khối linh khí); cần bớt 1 gợi ý nâng cấp | `ui_robust.py`/`ui_shots.py` (bảng thua), `cay.py` LUAT (bảng thua vẫn 2–3 gợi ý) |
| 4.5c | Phần thưởng sau trận chỉ là danh sách | A | `panelResult`: liệt kê vàng, quặng, nguyên liệu, vũ khí; không chọn gì. Lựa chọn đã nằm trong ải (Rương). | Ít cảm giác quyết định ở cuối ải | P2 | M | Không cần thêm hệ thống; ưu tiên 4.3a trước | — | — |
| 4.5d | Trùm có nhịp học → phản công | A (có) | `boss.js`: ba pha (đổi ở 66% và 33% máu), "mệt sau chiêu lớn" = choáng và nhận thêm sát thương, chiêu có vùng đỏ báo trước. Chi tiết cảm giác đánh trùm thuộc phiên combat (mục 3.6–3.7). | — | — | — | — | — |

### 2.2. Mục 5 — Tiến triển, cân bằng, kinh tế

| # | Vấn đề | TT | Bằng chứng | Ảnh hưởng người chơi | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro hồi quy | Cách kiểm thử |
|---|---|---|---|---|---|---|---|---|---|
| 5.1a | Nhiều lớp tăng sức mạnh chồng nhau, phần lớn chỉ cộng chỉ số | A | Các lớp đang có: cấp em bé, cây kỹ năng (3 nhánh), **cây chưởng** (3 cây, 6 nút nhiều bậc), mài (+15), bậc màu (Thường/Lam/Tím/Vàng + dòng phụ + dòng mạnh), Vàng theo vùng, lò rèn (trần mài), tiến hóa linh khí, trang phục 5 ô (may, nâng bậc, mở cấp cánh, đủ bộ). Bỏ từng lớp khỏi bản lưu thật của bot lúc vừa đủ đánh Hồ Tinh (`au_tien_trien.py lop`): **trang phục −44%**, **cấp −34%**, **mài −26%**, **bậc màu −20%**, cây kỹ năng −10%, tiến hóa linh khí −5%, cây chưởng ~0,4% mỗi điểm. Bốn lớp lớn nhất đều chỉ là "thêm máu/thêm sát thương". | Người chơi khó biết nên nâng gì; Sức mạnh chủ yếu đến từ cày, ít từ lựa chọn cách chơi | P1 | M (thiết kế) | Chưa gộp hệ thống. Việc rẻ trước: cho mỗi nút nâng cấp hiện **"+X Sức mạnh"** trước khi bấm (`G.upg.rate` đã tính sẵn `gain`, bảng thua đang dùng). Về lâu dài: cho linh khí và trang phục tạo **khác biệt cách chơi** nhiều hơn chỉ số. | Thấp nếu chỉ hiện số | Ảnh chụp lò rèn/thợ may |
| 5.1b | Mọi người làng mở ngay từ đầu | A | `village.js`/`village_scene.js`: không thấy điều kiện mở người làng theo tiến trình; chỉ có dấu "!" báo việc mới. | 5 phút đầu thấy cả 7 bảng | P2 | S | Ẩn Cô Thợ May và thẻ Cây chưởng tới khi qua ải 1-2 | Bài giao diện làng có thể giả định đủ 7 người | `ui_input.py`, `lang_shots.py` |
| 5.1c | Lò rèn không hiện chỉ số sau khi mài | A | `village.js` ~288: hiện "Sát thương mỗi đòn" hiện tại và giá, không hiện số sau khi mài | Khó cảm nhận +8% | P2 | S | Thêm "→ sau khi mài: Y" | Không | Ảnh chụp lò rèn |
| 5.2 | Công thức cấp: cộng đều hay nhân dồn | A | `combat.js` dòng 32 và 72: sát thương × (1 + 0,015 × (cấp − 1)), máu × (1 + 0,035 × (cấp − 1)) — **cộng đều**. Cấp 40: ×1,585 sát thương, ×2,365 máu. Lên cấp tốn 50 + 50 × cấp kinh nghiệm, tổng 40.950 tới cấp 40; một ải cho 100–940. Bot qua 15 ải ở cấp **~30** (`cay.py` 12 chiến dịch). Số đòn hạ một Lính xông với đồ thật của bot: **~7 ở vùng 1, 7–8 ở vùng 2, 10–12 ở vùng 3**; số đòn Lính xông cần để hạ em bé: **~9–10 → 6–8 → 4–5**. Bảng ở phần 3. | Vùng 3 quái trâu hơn mà em bé mỏng hơn tương đối: trận dài hơn và rủi ro hơn, né càng quan trọng (tốt), nhưng có thể thấy "đánh mãi không chết" | P2 (B) | S | Không đổi công thức. Theo dõi số đòn hạ quái thường vùng 3 khi người thật chơi; nếu thấy lê thê thì hạ máu quái thường vùng 3 khoảng 10% (`G.STAGE_K`). | Đổi `STAGE_K` làm lệch `cay.py` | `tests/cay.py 12`, `tests/balance.py` |
| 5.3a | Cây kỹ năng bị học hết sớm? | C | `upgrade.js` `pts`: **1 điểm mỗi 3 cấp** (`floor(cấp/3)`), 15 nút mỗi nút **1 bậc**, mở theo thứ tự trong nhánh. Cấp 15: 5 điểm, cấp 30: 10, **cấp 40: 13 điểm < 15 nút** → không bao giờ học hết, luôn phải chọn. Đặt lại điểm: 100 vàng ở Cụ Đồ. | Nỗi lo "mở hết ở cấp 15–16" không xảy ra | — | — | — | — | `au_tien_trien.py kynang` |
| 5.3b | Cây chưởng thừa điểm cuối game; hai cây điểm song song | A / B | `chuong.js` `CH.pts`: **1 điểm chưởng mỗi cấp**, một cây đầy ở **28 điểm** (nút 5+5+5+5+5+3) → từ cấp 28 tới 40 thừa tới 12 điểm. Đổi cây miễn phí ở làng. Bot xong 15 ải ở cấp ~30 nên chỉ thừa vài điểm trong lúc chơi chính. Có **hai** cây điểm (kỹ năng và chưởng) với hai nhịp điểm khác nhau. | Sau trùm cuối, điểm chưởng thừa không còn ý nghĩa; hai cây dễ làm người mới rối | P2 | S | Cho điểm thừa sau khi đầy cây được dùng ở cây thứ hai (giữ cả hai cây), hoặc chấp nhận vì là cuối game | Thấp | `tests/chuong.py` |
| 5.4a | Linh khí tính theo gì, bao lâu tới mốc | A | Tính **theo từng vũ khí** (`w.marks`, `combat.js` `G.addMarks`); vũ khí khóa nhánh hệ khi đủ 30. Nguồn: tinh anh 5, trùm nhỏ 10, trùm vùng 20 (mọi lúc), +1 khi kết liễu quái thường **đang dính hệ**; Thợ Rèn +20%; Lời nguyền ×2; ải dạy chơi ×2. 6 chiến dịch bot: mỗi lượt **43–57 dấu ấn**; **30: 2–3 phút** (ngay lượt đầu); **120: 18–41 phút**; **300: 42–85 phút** (thường ~80 phút, lượt thứ 18–26). | Mốc đầu đến nhanh, tốt. Mốc 300 khoảng 1–1,5 giờ chơi một vũ khí | P2 | — | Ổn | — | `au_tien_trien.py linhkhi` |
| 5.4b | Đổi vũ khí là mất hết linh khí | A | Vũ khí mới luôn 0 dấu ấn. Bot đổi vũ khí chính **3–4 lần mỗi chiến dịch** (lên Vàng từ trùm). Cuối 6 chiến dịch: 3 lần vũ khí chính đang cầm là món Vàng **0 dấu ấn, mốc Trắng**, trong khi món cũ trong rương có **900–1.485 dấu ấn** (từ 300 trở đi dấu ấn không còn tác dụng). Nâng bậc ở lò rèn thì giữ dấu ấn, nhưng món Vàng rơi từ trùm thì không. | Đi ngược khẩu hiệu "Vũ khí lớn lên theo bạn": người chơi bị phạt khi nhận đồ tốt, hoặc phải giữ đồ cũ | **P1** | S–M | Ít tốn nhất: khi luyện/nâng một vũ khí lên Vàng bằng mảnh trùm (đã có ở lò rèn) đã giữ dấu ấn — **nói rõ điều đó** khi trùm rơi món Vàng ("Món cũ có 312 linh khí: luyện nó lên Vàng ở Thợ Rèn để giữ"). Bước 2: cho Thợ Rèn "truyền" phần dấu ấn quá 300 sang vũ khí khác cùng loại. | Truyền dấu ấn làm tiến hóa nhanh hơn → ảnh hưởng Sức mạnh (chỉ 5%) | `au_tien_trien.py linhkhi` (đếm vũ khí chính có 0 dấu ấn ở cuối), `tests/linhkhi.py` |
| 5.4c | Có bị khuyến khích kéo dài trận để cày dấu ấn? | C | Quái thường chỉ +1 nếu dính hệ lúc chết; tinh anh/trùm cho số cố định; không có thưởng theo thời gian. Viên linh khí rơi từ quái thường đã bỏ (`drop: 0`). | Không | — | — | — | — | — |
| 5.4d | Phản hồi tiến trình linh khí | A (có) | `linhkhi.js`: ba vạch hệ cạnh ô vũ khí, chữ "+1 Lửa", vạch nhấp nháy khi sắp tới mốc, khối từng vũ khí ở màn kết quả, biểu tượng hệ trên đầu quái đang dính hệ, bảng mốc 30/120/300 trong "Xem vũ khí". | Tốt | — | — | — | — | — |
| 5.5 | Bốn em bé chưa đều | A (số đo) / B (cảm giác) | Cùng bản lưu thật của bot ở 5 ải (1-3, 2-2, 2-5, 3-3, 3-5), mỗi ải 4 lượt: **Thợ Rèn 19/20, Đô Vật 18/20, Thầy Lang 14/20, Thợ Săn 13/20** lượt thắng. Thợ Săn mất máu chủ yếu vì đòn trùm (ải 2-5: 939 máu/4 lượt, chỉ thắng 1/4). Với cùng đồ, con số **Sức mạnh** hiện ra lệch nhau: Đô Vật cao hơn Thợ Rèn 25–40% (giảm 25% sát thương tính vào máu hữu hiệu), Thợ Săn thấp hơn 10–15% (`G.powerParts` không tính tốc độ và nội tại). Bot cũ `campaign.py` (thua chỉ cày 1 lượt): **Đô Vật qua cả 15 ải** (162 phút, 7 lần thua); Thợ Rèn, Thợ Săn, Thầy Lang **kẹt ở Hồ Tinh** sau 12 lần thua liền. Lưu ý: bot dùng kiếm cho cả bốn em (không dùng vũ khí sở trường), không tận dụng tốc độ +15% và nội tại khống chế của Thợ Săn. | Thợ Săn (mở đầu tiên, sau Mộc Tinh) có thể làm người chơi thấy "em này yếu". Đô Vật mở cuối nên mạnh nhất cũng không sao | P1 | S | Trước hết **cho người thật thử** Thợ Săn với cung/giáo. Nếu vẫn yếu: máu Thợ Săn 75 → 85 (`G.HEROES.hunter.hp`). Riêng con số Sức mạnh thì nên tính thêm tốc độ để "khuyên dùng" công bằng giữa các em. | Đổi máu làm lệch `cay.py` cho Thợ Săn | `au_tien_trien.py embe --n=8` (mỗi em ≥ 16/20), chơi tay |
| 5.6a | Độ hiếm và vũ khí Vàng | A | `G.DROP`: trùm vùng lần đầu **chắc chắn** rơi Vàng, đánh lại 12%; rương và tinh anh không bao giờ ra Vàng; vùng sau tỉ lệ Tím cao hơn; chơi lại ải Lâu đài cổ nâng bảng rơi một hàng. Trang phục: trùm vùng 25% ra Vàng. | Vàng vẫn hiếm, khoảnh khắc trùm vùng đầu tiên đặc biệt. Đạt | — | — | — | — | — |
| 5.6b | Tràn túi | A | Rương vũ khí **12 món**; đầy thì vũ khí rơi (trừ Vàng) đổi thành 30–90 vàng, có dòng báo (`G.giveWeapon`). Mỗi lượt rơi khoảng 1 vũ khí (50% qua ải, 35% mỗi tinh anh, rương), nên **rương đầy sau khoảng 10–12 lượt (~40 phút)**. Vũ khí Vàng luôn được giữ nên có thể quá 12 (bot cuối game 14–15 món). Kho trang phục 40 món. Có bán đồ (`ban_do.js`). | Từ giữa vùng 2, phần lớn vũ khí rơi tự thành vàng — ít phải dọn túi, nhưng cũng ít hồi hộp khi rơi đồ | P2 | S | Giữ cơ chế đổi vàng. Thêm vào dòng báo bậc của món bị đổi ("Kiếm Tím bị đổi thành 90 vàng vì rương đầy") để người chơi biết có nên dọn | Thấp | Chơi tay với rương đầy |
| 5.6c | Đồ rơi không cho biết tốt hơn hay kém hơn món đang dùng | A | Không tìm thấy so sánh trong `do_roi.js`, `stage.js` (màn kết quả), `hanh_trang.js` | Phải về làng mở từng món để so | P2 | S–M | Ở thẻ vũ khí màn kết quả: mũi tên ▲/▼ theo `G.upg` (đổi món này vào thì Sức mạnh +/−) — chỉ là gợi ý, kèm tên dòng mạnh | Thấp | Ảnh chụp màn kết quả |
| 5.7a | Bảng vàng có thể bị chỉnh số từ máy người chơi | **A** | `game/firebase/linhkhi.rules` khối `linhkhi_scores`: chỉ kiểm tên 2–16 ký tự, `power` 0–**1.000.000**, `stars` 0–90, `far` 0–15, `b_moc/b_ngu/b_ho` **5–3.600 giây**, và "chỉ được tốt lên". Số do máy người chơi tự tính rồi gửi (`bang_vang.js` `entry()` → `cloud.js` `submitScore` → `set()`). Ai đã đăng nhập (kể cả **khách ẩn danh**) có thể từ bảng điều khiển trình duyệt ghi Sức mạnh 1.000.000 và hạ trùm 5 giây; xoá dòng rồi tạo lại cũng được. Bản lưu trên mây chỉ kiểm cỡ chuỗi (< 400.000 ký tự) nên vàng, cấp trong bản lưu cũng sửa được. | Một người gian lận là cả bảng mất ý nghĩa. Không làm hỏng game của người khác | P1 | S (siết luật) / L (xác thực trên máy chủ) | Không có máy chủ riêng nên không chặn được hẳn. Siết nhanh trong luật: `power ≤ 1.500` (trần thật trước Hồ Tinh đo được ~882, cấp 40 đủ đồ), `stars ≤ 45` (15 ải × 3), thời gian hạ trùm vùng ≥ 20 giây, `far` phải ≥ 5 mới có `b_moc`… Và: **không cho khách ẩn danh lên bảng**. Làm thật chặt thì cần Cloud Functions tính lại từ bản lưu. | Luật chặt quá thì người chơi giỏi thật bị từ chối ghi | Viết thêm ca vào `tests/may_luat.test.js` (ghi power 2.000 phải bị từ chối) |
| 5.7b | Bảng vàng đo cày hay đo kỹ năng | A | Ba thẻ: Sức mạnh (thuần cày), Tổng sao (sao 2 = không dùng bình máu, sao 3 = kết liễu bằng hệ khắc chế → có phần kỹ năng), thời gian hạ từng trùm vùng (kỹ năng + đồ) | Đã có thước đo kỹ năng; Sức mạnh để đầu tiên | P2 | S | Đưa thẻ "thời gian hạ trùm" lên trước thẻ Sức mạnh | Không | Ảnh chụp bảng vàng |

### 2.3. Mục 8 — Bản sắc dân gian: đi vào cách chơi hay chỉ là tên gọi

| Đi vào cách chơi (tốt) | Chỉ ở tên/hình (rủi ro góp ý nêu là đúng) |
|---|---|
| Ba trùm vùng **Mộc Tinh, Ngư Tinh, Hồ Tinh** (ba yêu tinh trong truyền thuyết Lạc Long Quân) có chiêu theo bản chất: Mộc Tinh mọc **hàng nấm độc** đuổi theo, bão bào tử; Ngư Tinh sóng nước, đập càng rung sàn; **Hồ Tinh bị bắn từ xa thì biến mất rồi hiện sau lưng** (cáo tinh ranh), "Hồ hỏa" bay vòng cung, "Quạt đuôi" (`boss.js`). | **Mười dòng vũ khí mỗi loại** (Nỏ Thần, Cung Đàn Bầu, Bút Lông, Chày Giã Gạo, Trống Đồng…) chỉ đổi **hình, tên và "tính nết"**. Code chiến đấu không đọc `family` lần nào (`combat.js`, `moves.js`). **Chày Giã Gạo và Trống Đồng đánh y hệt nhau** (cùng là búa). |
| Người làng **là chức năng**: Chú Lái Đò = chọn ải và "lên đò" vào ải; Ông Thợ Rèn = mài, nâng bậc; Cụ Đồ ở gốc đa = dạy kỹ năng, hướng dẫn, **Bảng vàng** (như bảng vàng khoa cử); Ông Từ ở sân đình = chọn em bé; Anh Mõ = cài đặt, góp ý (mõ làng = loa thông báo). | "Tính nết" của vũ khí (dữ dằn, mơ màng, hiền lành, nghiêm nghị) chỉ là một dòng chữ trong "Xem vũ khí" (`village.js` dòng 191). |
| Nguyên liệu vùng (gỗ linh, vảy cá, đá lửa) và vật mang hệ trong phòng (chậu than, nấm độc, tinh thể băng) có tác dụng thật khi đánh vỡ. | Quái thường theo vùng (heo con, ong vò vẽ, bọ hung, đèn lồng, hũ lửa, mèo đen…) dùng chung 8 vai cho cả ba vùng; tên và hình đổi, cách đánh giữ nguyên theo vai. Điều này **chấp nhận được** (giống mọi game cùng thể loại). |
| Ba hệ Lửa/Độc/Băng gắn với ba vùng; cây chưởng theo hệ. | Ba sao, bùa, lời nguyền chưa mang màu dân gian riêng. |

**Đánh giá**: (A) đã xác nhận — dân gian đi vào cách chơi ở **trùm** và **làng**, nhưng ở **vũ khí** thì chỉ là tên/hình. Ưu tiên **P2**, độ khó **M**. Cách sửa tối thiểu: chọn **2–3 dòng vũ khí biểu tượng** và cho mỗi dòng một nét riêng nhỏ dùng lại cơ chế sẵn có (ví dụ Trống Đồng: nhát thứ ba tạo vòng sóng lan như tiếng trống; Chày Giã Gạo: nhát giữ rồi thả tạo sóng trên đất) thay vì làm cho cả 40 dòng. Rủi ro: lệch cân bằng vũ khí → chạy `tests/dps.py`.

## 3. Bảng số liệu tiến triển

### 3.1. Cấp em bé (Thợ Rèn, kiếm Thường +0, không điểm kỹ năng)

| Cấp | Sát thương ×  | Máu × | Sát thương 1 đòn | Máu tối đa | Sức mạnh |
|---|---|---|---|---|---|
| 1 | 1,000 | 1,000 | 9,9 | 100 | 98 |
| 10 | 1,135 | 1,315 | 11,2 | 132 | 120 |
| 20 | 1,285 | 1,665 | 12,7 | 167 | 144 |
| 30 | 1,435 | 2,015 | 14,2 | 202 | 167 |
| 40 | 1,585 | 2,365 | 15,7 | 237 | 191 |

Chỉ riêng cấp thì Sức mạnh tăng gấp đôi từ cấp 1 đến cấp 40. Bot lúc vừa đủ Hồ Tinh có Sức mạnh ~544–650: phần còn lại đến từ đồ.

### 3.2. Đồ thật của bot lúc vừa đủ "khuyên dùng" từng ải (`tests/cay_luu.json`)

| Ải | Cấp | Sức mạnh / khuyên dùng | Vũ khí chính | Sát thương 1 đòn | Máu | Giảm sát thương | Máu Lính xông | Đòn để hạ Lính xông | Đòn Lính xông để hạ bé | Đòn để hạ trùm |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1 | 98 / 100 | Kiếm Thường +0 | 9,9 | 100 | 0% | 67 | 6,8 | 9,7 | 91 |
| 1-3 | 3 | 147 / 135 | Kiếm Lam +2 | 14,1 | 149 | 0% | 109 | 7,7 | 9,0 | 114 |
| 1-5 | 9 | 226 / 225 | Kiếm Lam +5 | 23,3 | 208 | 5% | 146 | 6,3 | 10,0 | 159 |
| 2-1 | 10 | 253 / 245 | Kiếm Vàng +4 | 27,0 | 212 | 7% | 172 | 6,4 | 6,5 | 101 |
| 2-3 | 13 | 327 / 315 | Kiếm Vàng +6 | 32,7 | 234 | 13% | 266 | 8,2 | 7,5 | 145 |
| 2-5 | 18 | 402 / 420 | Kiếm Vàng +10 | 43,8 | 255 | 13% | 292 | 6,7 | 5,7 | 169 |
| 3-1 | 19 | 449 / 425 | Kiếm Vàng +10 | 44,3 | 311 | 16% | 425 | 9,6 | 4,5 | 196 |
| 3-3 | 21 | 492 / 475 | Kiếm Vàng +10 | 45,4 | 341 | 18% | 518 | 11,4 | 4,5 | 229 |
| 3-4 | 24 | 537 / 525 | Kiếm Vàng +10 | 47,0 | 355 | 18% | 578 | 12,3 | 4,1 | 251 |
| 3-5 | 25 | 544 / 620 | Kiếm Vàng +10 | 47,5 | 361 | 18% | 477 | 10,1 | 5,9 | 182 |

("Đòn" là đòn thường một nhát, chưa tính chí mạng, hệ, chưởng; để so sánh xu hướng.)

### 3.3. Bot chơi 15 ải từ bản lưu mới (`tests/cay.py 12 khuyen`, 12 chiến dịch, Thợ Rèn)

| Ải | Số lần chơi TB | Thua TB | Thời gian (phút) | Cấp khi qua | Sức mạnh khi qua / khuyên dùng |
|---|---|---|---|---|---|
| 1-1 | 1,0 | 0 | 3 | 1 | 99 / 100 |
| 1-2 | 1,0 | 0 | 3 | 2 | 118 / 110 |
| 1-3 | 1,3 | 0 | 5 | 3 | 143 / 135 |
| 1-4 | 1,8 | 0,3 | 8 | 4 | 165 / 150 |
| **1-5 Mộc Tinh** | **6,1** | 0 | **24** | 8 | 226 / 225 |
| 2-1 | 1,8 | 0,1 | 5 | 9 | 258 / 245 |
| 2-2 | 1,4 | 0 | 4 | 11 | 282 / 270 |
| 2-3 | 3,2 | 0 | 10 | 13 | 322 / 315 |
| 2-4 | 2,9 | 0 | 10 | 15 | 350 / 345 |
| **2-5 Ngư Tinh** | **10,3** | 1,8 | **35** | 20 | 440 / 420 |
| 3-1 | 1,4 | 0 | 5 | 21 | 464 / 425 |
| 3-2 | 1,6 | 0,2 | 6 | 22 | 480 / 445 |
| 3-3 | 1,5 | 0,1 | 6 | 23 | 493 / 475 |
| 3-4 | 4,3 | 0,8 | 17 | 25 | 549 / 525 |
| **3-5 Hồ Tinh** | **11,9** | 3,2 | **50** | 30 | 651 / 620 |
| **Tổng** | **52 lượt** | | **190 phút (3,2 giờ)**, nhanh nhất 125, lâu nhất 294 | | |

Nguồn mất máu (cả 12 chiến dịch): đòn trùm 28%, Gai 22%, vùng đỏ của trùm 16%, Xạ thủ 14%, tinh anh 9%, vùng/đạn khác 4%, các quái khác 1–2% mỗi loại.
Ba trùm vùng chiếm **28/52 lượt (54%)** và **109/190 phút (57%)**: phần "cày" dồn vào trước mỗi trùm.

### 3.4. Thời gian từng loại phòng (bot, 30 ải ngẫu nhiên, giây trong game)

| Bắt đầu | Đánh quái | Tinh anh | Thử thách | Rương | Suối hồi | Lời nguyền | Thương nhân | Trùm |
|---|---|---|---|---|---|---|---|---|
| 9,7 | 20,4 (lâu nhất 68) | 23,3 | 18,9 | 2,4 | 3,7 | 1,6 | 1 | 66 (lâu nhất 110) |

Đi lại qua phòng đã dọn: ~7% thời gian. Một ải: 2,5–6,5 phút.

### 3.5. Linh khí (6 chiến dịch, `au_tien_trien.py linhkhi`)

| Em bé / cây chưởng | Tới 30 | Tới 120 | Tới 300 | Dấu ấn mỗi lượt | Đổi vũ khí chính | Vũ khí đang cầm lúc xong 15 ải |
|---|---|---|---|---|---|---|
| Thợ Rèn / Hỏa | 2 phút (lượt 1) | 30 phút (lượt 8) | 42 phút (lượt 11) | 56,7 | 3 lần | Kiếm Vàng **0** dấu ấn; cung 312 |
| Thợ Rèn / Độc | 3 phút | 41 phút | 73 phút (lượt 22) | 45,6 | 4 | Búa Vàng 981 |
| Thợ Rèn / Băng | 11 phút | 29 phút | 81 phút (lượt 24) | 49,1 | 4 | Búa Vàng **0**; món cũ trong rương 1.485 |
| Thợ Săn / Hỏa | 3 phút | 18 phút | 85 phút (lượt 26) | 45,7 | 3 | Giáo Vàng 1.058 |
| Thầy Lang / Độc | 3 phút | 39 phút | 82 phút (lượt 24) | 42,7 | 3 | Giáo Vàng 926 |
| Đô Vật / Băng | 3 phút | 21 phút | 81 phút (lượt 18) | 48,1 | 3 | Giáo Vàng **0**; món cũ 1.257 |

Vũ khí thứ hai (cung) gần như đứng yên ở 30–40 dấu ấn vì ít khi kết liễu bằng nó.

### 3.6. Bốn em bé cùng một bản lưu (`au_tien_trien.py embe --n=4`)

Cùng cấp, cùng điểm kỹ năng, cùng vũ khí và trang phục (bản lưu thật của bot), mỗi ải 4 lượt.

| Ải | Thợ Rèn | Thợ Săn | Thầy Lang | Đô Vật |
|---|---|---|---|---|
| 1-3 | 4/4 · mất 172 máu · SM 150 | 3/4 · 166 · SM 127 | 3/4 · 164 · SM 136 | 4/4 · 160 · SM 188 |
| 2-2 | 4/4 · 111 · SM 306 | 4/4 · 110 · SM 267 | 3/4 · 198 · SM 278 | 4/4 · 62 · SM 386 |
| 2-5 Ngư Tinh | 4/4 · 90 · SM 408 | **1/4** · 246 · SM 355 | 2/4 · 319 · SM 369 | 4/4 · 240 · SM 518 |
| 3-3 | 4/4 · 72 · SM 497 | 2/4 · 501 · SM 445 | 4/4 · 180 · SM 459 | 4/4 · 118 · SM 628 |
| 3-5 Hồ Tinh | 3/4 · 475 · SM 552 | 3/4 · 333 · SM 503 | 2/4 · 378 · SM 519 | 2/4 · 589 · SM 697 |
| **Tổng thắng** | **19/20** | **13/20** | **14/20** | **18/20** |

("mất … máu" là máu mất trung bình mỗi lượt; "SM" là con số Sức mạnh game hiển thị với cùng bộ đồ.)
Bot `campaign.py` (thua chỉ cày 1 lượt): Đô Vật qua 15/15 ải (162 phút, 7 lần thua); Thợ Rèn (245 phút, 25 lần thua), Thợ Săn (236 phút, 17), Thầy Lang (277 phút, 29) đều dừng ở Hồ Tinh sau 12 lần thua liền. Mẫu nhỏ, bot không dùng vũ khí sở trường → coi là **tín hiệu cần thử**, chưa phải kết luận.

## 4. Ba việc nên sửa trước (trong phạm vi vòng lặp – tiến triển)

**1. Bảng thua nói rõ "vì sao thua" (mục 4.5b) — P1, độ khó S.**
Vì sao trước: mỗi trùm vùng cần 6–12 lượt chơi, tức người chơi sẽ nhìn bảng thua rất nhiều lần, đúng lúc dễ bỏ game nhất. Game đã có sẵn dữ liệu (mọi sát thương đi qua `G.hurtPlayer` với nguồn), chỉ cần cộng lại trong lượt và thêm một dòng mẹo cố định cho mỗi nguồn (Gai, Xạ thủ, Cảm tử, vùng đỏ trùm, đòn trùm…). Không đổi số cân bằng, không đụng bản lưu.
Cách thử: chụp bảng thua ở 3 cỡ màn hình; `tests/cay.py` phần LUAT (bảng thua vẫn 2–3 gợi ý và có chỗ để bấm); chơi tay thua 3 kiểu khác nhau xem câu có đúng không.

**2. Mỗi ải luôn có một phòng có mục tiêu khác "hạ hết quái" (mục 4.1a, 4.3a) — P1, độ khó M.**
Vì sao: 70% số lượt chơi là chơi lại ải cũ; hiện chỉ 1/3 số ải có phòng Thử thách. Dùng lại đúng những gì có sẵn: phòng Thử thách + đợt quái + đồng hồ 30 giây, thêm biến thể "Trụ được 30 giây" (hết giờ là dọn phòng, thưởng như cũ) và cho phòng phụ ưu tiên loại có mục tiêu. Song song có thể cho Bùa hệ ở Rương kéo dài hết ải để thành một lựa chọn build cả lượt (độ khó S).
Cách thử: `tests/mapgen.py`, `tests/doors.py`, `tests/au_mapgen.py` (đếm bộ loại phòng), `tests/cay.py 12` (tổng thời gian vẫn trong 2,5–4 giờ).

**3. Linh khí không "mất trắng" khi đổi sang vũ khí mới (mục 5.4b) — P1, độ khó S rồi M.**
Vì sao: "Vũ khí lớn lên theo bạn" là bản sắc của game, nhưng đo được rằng cuối chiến dịch, vũ khí đang cầm thường có 0 dấu ấn còn món cũ có hơn 1.000 dấu ấn bỏ phí. Bước nhỏ (S): khi trùm rơi món Vàng, nhắc rằng luyện món cũ lên Vàng ở Thợ Rèn thì giữ được linh khí (cơ chế này đã có). Bước sau (M): cho Thợ Rèn truyền phần dấu ấn vượt 300 sang một vũ khí khác.
Cách thử: `tests/au_tien_trien.py linhkhi --n=6` (đếm số chiến dịch kết thúc với vũ khí chính 0 dấu ấn), `tests/linhkhi.py`.

**Việc thứ tư nên làm nếu Bảng vàng đã mở cho mọi người (mục 5.7a):** siết luật Firestore (trần Sức mạnh ~1.500, sao ≤ 45, hạ trùm ≥ 20 giây, không cho khách ẩn danh ghi). Rất ít công, nhưng đây là luật Firestore nên cần chủ dự án quyết và tự đưa lên Firebase.

## 5. Những gì chưa xác minh được

- Cảm giác của người thật (Gai có khó chịu không, Thợ Săn có thật yếu không, phòng có nhàm không): bot chỉ cho số để so sánh.
- Không chạy được Firebase thật hay trình giả lập luật Firestore trong phiên này: kết luận về Bảng vàng dựa trên đọc luật (`linhkhi.rules`) và code gửi điểm (`bang_vang.js`, `cloud.js`).
- Bot dùng kiếm cho mọi em bé; chưa đo từng em bé với vũ khí sở trường.
- Hiệu năng trên điện thoại, HUD, hình ảnh: thuộc các phiên khác, không đánh giá ở đây.

## 6. Bài kiểm tra đã chạy (sau khi gộp `origin/khoi-tao-du-an` mới nhất)

Bản gộp mới chỉ đổi hình vẽ (`room_art.js`, `fx.js`, `mobs.js` phần vẽ…), không đổi số cân bằng, nên số liệu ở trên vẫn đúng.
`tests/rules.py` 82/82 đạt · `tests/ui_build.py` đạt · `tests/mapgen.py` đạt · `tests/doors.py` đạt · `tests/au_mapgen.py` chạy lại không lỗi trang.
Phiên này không sửa code game nên không chạy lại `tests/cay.py` sau khi gộp.
